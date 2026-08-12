/** Lazy managed OpenPencil editor sessions for the DSH details panel. */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
  randomUUID,
} from 'node:crypto'
import { constants as fsConstants, statSync } from 'node:fs'
import { lstat, open, rename, rm } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { homedir } from 'node:os'
import { basename, delimiter, dirname, isAbsolute, join, resolve } from 'node:path'
import {
  callOpenPencilMcp,
  getOpenPencilMcpVersion,
  selectionSnapshotFromMcp,
  type OpenPencilMcpResult,
  type OpenPencilSelectionSnapshot,
} from './mcp-client.js'
import { OPENPENCIL_RENDER_TOOL_NAME } from './tool-names.js'

export const EDITOR_ROUTE_PREFIX = '/_dsh/dsh-openpencil/editor'

const CAPABILITY_TTL_MS = 2 * 60 * 60 * 1000
const CAPABILITY_REFRESH_TTL_MS = 24 * 60 * 60 * 1000
const SESSION_IDLE_MS = 4 * 60 * 60 * 1000
const START_TIMEOUT_MS = 20_000
const READY_TIMEOUT_MS = 15_000
const STOP_TIMEOUT_MS = 3_000
const MAX_DOCUMENT_BYTES = 64 * 1024 * 1024
const MAX_HANDSHAKE_BYTES = 16 * 1024
const MAX_DIAGNOSTIC_BYTES = 64 * 1024
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{24,128}$/
const EDITOR_CAPABILITY_AAD = Buffer.from('dsh-openpencil/editor-capability/v1')
const EDITOR_CAPABILITY_PREFIX = 'v1.'
const EDITOR_CAPABILITY_MAX_LENGTH = 16 * 1024

export interface EditorGrant {
  enabled: true
  launchUrl: string
  refreshUrl: string
}

interface EditCapability {
  v: 1
  scope: 'edit-source'
  sourcePath: string
  sourceSha256: string
  issuedAt: number
  launchExpiresAt: number
  refreshExpiresAt: number
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
}

function deriveEditorKey(masterKey: Buffer): Buffer {
  if (masterKey.length !== 32) throw new TypeError('editor master key must be 32 bytes')
  return Buffer.from(hkdfSync(
    'sha256',
    masterKey,
    Buffer.from('dsh-openpencil/editor-key/v1'),
    Buffer.from('aes-256-gcm'),
    32,
  ))
}

function capabilityFrom(value: unknown): EditCapability | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const payload = value as Record<string, unknown>
  if (
    payload.v !== 1
    || payload.scope !== 'edit-source'
    || typeof payload.sourcePath !== 'string'
    || !isAbsolute(payload.sourcePath)
    || !payload.sourcePath.toLowerCase().endsWith('.op')
    || !isSha256(payload.sourceSha256)
    || typeof payload.issuedAt !== 'number'
    || !Number.isSafeInteger(payload.issuedAt)
    || typeof payload.launchExpiresAt !== 'number'
    || !Number.isSafeInteger(payload.launchExpiresAt)
    || typeof payload.refreshExpiresAt !== 'number'
    || !Number.isSafeInteger(payload.refreshExpiresAt)
    || payload.launchExpiresAt <= payload.issuedAt
    || payload.launchExpiresAt - payload.issuedAt > CAPABILITY_TTL_MS
    || payload.refreshExpiresAt < payload.launchExpiresAt
    || payload.refreshExpiresAt - payload.issuedAt > CAPABILITY_REFRESH_TTL_MS
  ) return undefined
  return payload as unknown as EditCapability
}

interface ManagedHandshake {
  port: number
  token: string
  version: string | number
}

interface EditorSession {
  id: string
  sourcePath: string
  ownerSessionId?: string
  baselineSha256: string
  child: ChildProcessWithoutNullStreams
  iframeUrl: string
  daemonToken: string
  refreshExpiresAt: number
  createdAt: number
  closed: boolean
  saving: boolean
  mutating: boolean
}

export type OpenPencilLiveTool = 'get_selection' | 'update_node' | 'batch_design'

export interface ActiveMcpCallOptions {
  /** Refuse to drive a different transcript card's live editor. */
  sourcePath?: string
  ownerSessionId?: string
  signal?: AbortSignal
}

function json(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(body)
}

async function waitForResponseFinish(res: ServerResponse): Promise<boolean> {
  if (res.writableFinished) return true
  await new Promise<void>(resolveFinished => {
    const finish = (): void => {
      res.off('finish', finish)
      res.off('close', finish)
      resolveFinished()
    }
    res.once('finish', finish)
    res.once('close', finish)
  })
  return res.writableFinished
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function sha256(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

async function readSourceDocument(path: string): Promise<Buffer> {
  const before = await lstat(path)
  if (before.isSymbolicLink() || !before.isFile()) throw new HttpError(409, 'OpenPencil source is no longer a regular file')
  if (before.size <= 0 || before.size > MAX_DOCUMENT_BYTES) throw new HttpError(413, 'OpenPencil source size is invalid')
  const noFollow = typeof fsConstants.O_NOFOLLOW === 'number' ? fsConstants.O_NOFOLLOW : 0
  const handle = await open(path, fsConstants.O_RDONLY | noFollow)
  try {
    const opened = await handle.stat()
    if (!opened.isFile() || opened.size <= 0 || opened.size > MAX_DOCUMENT_BYTES) {
      throw new HttpError(413, 'OpenPencil source size is invalid')
    }
    const bytes = await handle.readFile()
    const after = await lstat(path)
    if (
      after.isSymbolicLink()
      || !after.isFile()
      || (opened.dev !== 0 && opened.ino !== 0 && (opened.dev !== after.dev || opened.ino !== after.ino))
    ) throw new HttpError(409, 'OpenPencil source changed while it was opened')
    return bytes
  } finally {
    await handle.close().catch(() => {})
  }
}

function isRegularFile(path: string): boolean {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

function expandUserHome(path: string): string {
  if (path === '~') return homedir()
  if (path.startsWith('~/')) return join(homedir(), path.slice(2))
  return path
}

/** Locate the GUI-free managed host used by op-vscode. */
export function findEditorHostBinary(): string | undefined {
  const override = process.env.DSH_OPENPENCIL_EDITOR_BINARY?.trim()
  const sourceOverride = process.env.DSH_OPENPENCIL_SOURCE_ROOT?.trim()
    || process.env.OPENPENCIL_SOURCE_ROOT?.trim()
  const roots = [
    ...(sourceOverride === undefined || sourceOverride.length === 0 ? [] : [expandUserHome(sourceOverride)]),
    join(homedir(), 'workspace', 'openpencil'),
  ]
  const candidates = [
    ...(override === undefined || override.length === 0 ? [] : [expandUserHome(override)]),
    ...roots.flatMap(root => [
      join(root, 'target', 'release', 'op-host-web-server'),
      join(root, 'target', 'debug', 'op-host-web-server'),
    ]),
  ]
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (dir.length > 0) candidates.push(join(dir, 'op-host-web-server'))
  }
  // The desktop binary shares the serve-web CLI. It is useful only when the
  // web bundle paths below can be resolved from an OpenPencil source root.
  candidates.push('/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop')
  return candidates.find(isRegularFile)
}

function sourceRootForBinary(binary: string): string | undefined {
  const configured = process.env.DSH_OPENPENCIL_SOURCE_ROOT?.trim()
    || process.env.OPENPENCIL_SOURCE_ROOT?.trim()
  const candidates = [
    ...(configured === undefined || configured.length === 0 ? [] : [expandUserHome(configured)]),
    resolve(dirname(binary), '..', '..'),
    join(homedir(), 'workspace', 'openpencil'),
  ]
  return candidates.find(root => (
    isRegularFile(join(root, 'crates', 'op-host-web', 'pkg', 'op_host_web.js'))
    && isRegularFile(join(root, 'crates', 'op-host-web', 'assets', 'canvaskit', 'canvaskit.wasm'))
  ))
}

function requestOrigin(req: IncomingMessage): string {
  const raw = req.headers.origin
  if (typeof raw !== 'string') throw new HttpError(403, 'editor launch requires a browser Origin header')
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new HttpError(403, 'editor launch origin is invalid')
  }
  const host = req.headers.host
  if (host === undefined || url.host !== host || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    throw new HttpError(403, 'editor launch must be same-origin with DSH')
  }
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1'
  if (!loopback) throw new HttpError(403, 'editable OpenPencil sessions are restricted to loopback DSH')
  return url.origin
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

async function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > MAX_DOCUMENT_BYTES + 1024 * 1024) throw new HttpError(413, 'editor request is too large')
    chunks.push(bytes)
  }
  return Buffer.concat(chunks)
}

function parseHandshake(line: string): ManagedHandshake {
  let value: unknown
  try {
    value = JSON.parse(line)
  } catch {
    throw new Error('OpenPencil editor host returned an invalid handshake')
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('OpenPencil editor host returned an invalid handshake')
  }
  const record = value as Record<string, unknown>
  if (
    record.ok !== true
    || typeof record.port !== 'number' || !Number.isSafeInteger(record.port) || record.port < 1 || record.port > 65535
    || typeof record.token !== 'string' || record.token.length < 16
    || !(
      (typeof record.version === 'number' && Number.isSafeInteger(record.version) && record.version >= 0)
      || (typeof record.version === 'string' && record.version.length > 0 && record.version.length <= 64)
    )
  ) {
    throw new Error('OpenPencil editor host returned an incomplete handshake')
  }
  return { port: record.port, token: record.token, version: record.version }
}

async function waitForHandshake(
  child: ChildProcessWithoutNullStreams,
  diagnostics: () => string,
): Promise<ManagedHandshake> {
  return new Promise((resolveHandshake, rejectHandshake) => {
    let settled = false
    let stdout = ''
    const finish = (error?: Error, handshake?: ManagedHandshake): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.stdout.off('data', onData)
      child.off('error', onError)
      child.off('close', onClose)
      if (error !== undefined) rejectHandshake(error)
      else resolveHandshake(handshake!)
    }
    const onData = (chunk: Buffer): void => {
      stdout += chunk.toString('utf8')
      if (stdout.length > MAX_HANDSHAKE_BYTES) {
        finish(new Error('OpenPencil editor host handshake exceeded its size limit'))
        return
      }
      const newline = stdout.indexOf('\n')
      if (newline < 0) return
      try {
        finish(undefined, parseHandshake(stdout.slice(0, newline).trim()))
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)))
      }
    }
    const onError = (error: Error): void => { finish(error) }
    const onClose = (code: number | null): void => {
      finish(new Error(`OpenPencil editor host exited before startup (${String(code)})${diagnostics() === '' ? '' : `: ${diagnostics()}`}`))
    }
    const timer = setTimeout(() => {
      finish(new Error(`OpenPencil editor host did not start within ${START_TIMEOUT_MS} ms${diagnostics() === '' ? '' : `: ${diagnostics()}`}`))
    }, START_TIMEOUT_MS)
    child.stdout.on('data', onData)
    child.once('error', onError)
    child.once('close', onClose)
  })
}

async function waitForEditorReady(baseUrl: string): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  let last = ''
  while (Date.now() < deadline) {
    try {
      const [root, glue] = await Promise.all([
        fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(2_000) }),
        fetch(`${baseUrl}/pkg/op_host_web.js`, { signal: AbortSignal.timeout(2_000) }),
      ])
      await Promise.all([root.arrayBuffer().catch(() => undefined), glue.arrayBuffer().catch(() => undefined)])
      if (root.status === 200 && glue.status === 200) return
      last = `root=${root.status}, bundle=${glue.status}`
    } catch (error) {
      last = errorMessage(error)
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 150))
  }
  throw new Error(`OpenPencil editor web bundle was not ready${last === '' ? '' : `: ${last}`}`)
}

const stoppingChildren = new WeakMap<ChildProcessWithoutNullStreams, Promise<void>>()

function stopChild(child: ChildProcessWithoutNullStreams): Promise<void> {
  const current = stoppingChildren.get(child)
  if (current !== undefined) return current
  if (child.exitCode !== null || child.killed) return Promise.resolve()
  const stopping = (async (): Promise<void> => {
    if (!child.stdin.writableEnded) child.stdin.end()
    const closed = await new Promise<boolean>(resolveClosed => {
      let settled = false
      const finish = (value: boolean): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        child.off('close', onClose)
        resolveClosed(value)
      }
      const onClose = (): void => { finish(true) }
      const timer = setTimeout(() => { finish(false) }, STOP_TIMEOUT_MS)
      child.once('close', onClose)
    })
    if (!closed && child.exitCode === null) child.kill('SIGKILL')
  })()
  stoppingChildren.set(child, stopping)
  void stopping.finally(() => {
    if (stoppingChildren.get(child) === stopping) stoppingChildren.delete(child)
  })
  return stopping
}

async function atomicWriteDocument(path: string, text: string): Promise<string> {
  const bytes = Buffer.from(text)
  if (bytes.length === 0 || bytes.length > MAX_DOCUMENT_BYTES) throw new HttpError(413, 'OpenPencil document size is invalid')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'OpenPencil save payload is not valid JSON')
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new HttpError(400, 'OpenPencil save payload must be a document object')
  }
  const info = await lstat(path)
  if (info.isSymbolicLink() || !info.isFile()) throw new HttpError(409, 'OpenPencil source is no longer a regular file')
  const temp = join(dirname(path), `.${basename(path)}.dsh-save-${randomUUID()}.tmp`)
  let handle
  try {
    handle = await open(temp, 'wx', info.mode & 0o777)
    await handle.writeFile(bytes)
    await handle.sync()
    await handle.close()
    handle = undefined
    await rename(temp, path)
  } finally {
    await handle?.close().catch(() => {})
    await rm(temp, { force: true }).catch(() => {})
  }
  return sha256(bytes)
}

/** Owns opaque launch capabilities and all live managed editor children. */
export class EditorHostController {
  readonly binary = findEditorHostBinary()
  #routeRefs = 0
  #routeGeneration = 0
  readonly #editorKey: Buffer
  #sessions = new Map<string, EditorSession>()
  #pendingChildren = new Set<ChildProcessWithoutNullStreams>()
  #launchQueue: Promise<void> = Promise.resolve()

  constructor(masterKey: Buffer) {
    this.#editorKey = deriveEditorKey(masterKey)
  }

  get available(): boolean { return this.binary !== undefined }
  get routeAvailable(): boolean { return this.#routeRefs > 0 }

  attachRoute(): () => void {
    this.#routeRefs += 1
    let attached = true
    return () => {
      if (!attached) return
      attached = false
      this.#routeRefs = Math.max(0, this.#routeRefs - 1)
    }
  }

  /** Mint an opaque, runtime-only launch URL; no source path enters metadata. */
  grantFor(sourcePath: string | undefined, sourceSha256: string | undefined): EditorGrant | undefined {
    if (!this.available || !this.routeAvailable || sourcePath === undefined || sourceSha256 === undefined) return undefined
    if (!isAbsolute(sourcePath) || !sourcePath.toLowerCase().endsWith('.op') || !isSha256(sourceSha256)) return undefined
    const now = Date.now()
    const token = this.#sealCapability({
      v: 1,
      scope: 'edit-source',
      sourcePath: resolve(sourcePath),
      sourceSha256,
      issuedAt: now,
      launchExpiresAt: now + CAPABILITY_TTL_MS,
      refreshExpiresAt: now + CAPABILITY_REFRESH_TTL_MS,
    })
    return {
      enabled: true,
      launchUrl: `${EDITOR_ROUTE_PREFIX}/${token}/launch`,
      refreshUrl: `${EDITOR_ROUTE_PREFIX}/${token}/refresh`,
    }
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      this.#prune()
      const url = new URL(req.url ?? '/', 'http://dsh.invalid')
      const launch = new RegExp(`^${EDITOR_ROUTE_PREFIX}/([A-Za-z0-9_.-]+)/launch$`).exec(url.pathname)
      const refresh = new RegExp(`^${EDITOR_ROUTE_PREFIX}/([A-Za-z0-9_.-]+)/refresh$`).exec(url.pathname)
      const legacyRefresh = url.pathname === `${EDITOR_ROUTE_PREFIX}/refresh`
      const save = new RegExp(`^${EDITOR_ROUTE_PREFIX}/session/([A-Za-z0-9_-]+)/save$`).exec(url.pathname)
      const selection = new RegExp(`^${EDITOR_ROUTE_PREFIX}/session/([A-Za-z0-9_-]+)/selection$`).exec(url.pathname)
      const close = new RegExp(`^${EDITOR_ROUTE_PREFIX}/session/([A-Za-z0-9_-]+)$`).exec(url.pathname)
      if (launch !== null && req.method === 'POST') {
        const body = await readRequestBody(req)
        let ownerSessionId: string | undefined
        if (body.length > 0) {
          try {
            const value: unknown = JSON.parse(body.toString('utf8'))
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              const candidate = (value as Record<string, unknown>).sessionId
              if (typeof candidate === 'string' && candidate.length > 0 && candidate.length <= 256) ownerSessionId = candidate
            }
          } catch {
            throw new HttpError(400, 'editor launch request is not valid JSON')
          }
        }
        const routeGeneration = this.#routeGeneration
        await this.#serializeLaunch(() => this.#launch(
          launch[1]!, requestOrigin(req), res, routeGeneration, ownerSessionId,
        ))
        return
      }
      if (refresh !== null && req.method === 'POST') {
        requestOrigin(req)
        await readRequestBody(req).catch(() => Buffer.alloc(0))
        await this.#refresh(refresh[1]!, res)
        return
      }
      if (legacyRefresh && req.method === 'POST') {
        requestOrigin(req)
        await readRequestBody(req).catch(() => Buffer.alloc(0))
        throw new HttpError(410, `This editor card predates restart-safe editing; rerun ${OPENPENCIL_RENDER_TOOL_NAME} once`)
      }
      if (save !== null && req.method === 'POST') {
        requestOrigin(req)
        await this.#save(save[1]!, req, res)
        return
      }
      if (selection !== null && req.method === 'GET') {
        const snapshot = await this.#selectionForSession(selection[1]!)
        json(res, 200, { ok: true, selection: snapshot })
        return
      }
      if (close !== null && req.method === 'DELETE') {
        requestOrigin(req)
        await readRequestBody(req).catch(() => Buffer.alloc(0))
        await this.#close(close[1]!)
        json(res, 200, { ok: true })
        return
      }
      json(res, 404, { ok: false, error: 'editor capability not found' })
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      json(res, status, { ok: false, error: errorMessage(error) })
    }
  }

  async dispose(): Promise<void> {
    // Invalidate work accepted by the route before it was detached. Pending
    // launches check this generation around every asynchronous startup phase,
    // and their child is stopped here so a handshake wait cannot leak.
    this.#routeGeneration += 1
    const sessions = [...this.#sessions.values()]
    this.#sessions.clear()
    const pending = [...this.#pendingChildren]
    await Promise.all([
      ...sessions.map(session => this.#disposeSession(session)),
      ...pending.map(child => stopChild(child)),
    ])
  }

  /** Current live editor selection, suitable for Agent context and UI chips. */
  async getActiveSelection(options: ActiveMcpCallOptions = {}): Promise<OpenPencilSelectionSnapshot> {
    const session = this.#activeSession(options.sourcePath, options.ownerSessionId)
    return this.#selectionFor(session, options.signal)
  }

  /**
   * Drive one allowlisted first-party MCP tool on the currently visible
   * editor. The managed daemon token never crosses this controller boundary.
   */
  async callActiveMcp(
    tool: OpenPencilLiveTool,
    args: Record<string, unknown>,
    options: ActiveMcpCallOptions = {},
  ): Promise<OpenPencilMcpResult> {
    const session = this.#activeSession(options.sourcePath, options.ownerSessionId)
    const mutating = tool === 'update_node' || tool === 'batch_design'
    if ('filePath' in args || 'sourceFilePath' in args || 'source_file_path' in args) {
      throw new Error('OpenPencil live tools cannot target a filesystem path through MCP arguments')
    }
    if (mutating && (session.saving || session.mutating)) {
      throw new Error('OpenPencil editor is already applying or saving another change')
    }
    if (mutating) session.mutating = true
    try {
      let beforeVersion: number | undefined
      if (mutating) {
        const current = await readSourceDocument(session.sourcePath)
        if (sha256(current) !== session.baselineSha256) {
          throw new Error('OpenPencil source changed outside the active editor; rerender before applying Agent changes')
        }
        beforeVersion = await getOpenPencilMcpVersion({
          baseUrl: new URL(session.iframeUrl).origin,
          token: session.daemonToken,
          signal: options.signal,
        })
      }
      const result = await callOpenPencilMcp({
        baseUrl: new URL(session.iframeUrl).origin,
        token: session.daemonToken,
        tool,
        arguments: args,
        signal: options.signal,
      })
      if (beforeVersion !== undefined) {
        const afterVersion = await getOpenPencilMcpVersion({
          baseUrl: new URL(session.iframeUrl).origin,
          token: session.daemonToken,
          signal: options.signal,
        })
        if (afterVersion <= beforeVersion) {
          throw new Error(`OpenPencil MCP ${tool} reported success but did not apply a document change`)
        }
      }
      session.createdAt = Date.now()
      return result
    } finally {
      if (mutating) session.mutating = false
    }
  }

  async #serializeLaunch(task: () => Promise<void>): Promise<void> {
    const run = this.#launchQueue.then(task, task)
    // A failed launch must not poison the lifecycle queue for later requests.
    this.#launchQueue = run.catch(() => {})
    await run
  }

  #assertLaunchLifecycle(routeGeneration: number): void {
    if (routeGeneration !== this.#routeGeneration || !this.routeAvailable) {
      throw new HttpError(410, 'editor route was unloaded during launch')
    }
  }

  async #launch(
    token: string,
    origin: string,
    res: ServerResponse,
    routeGeneration: number,
    ownerSessionId?: string,
  ): Promise<void> {
    let disconnected = res.destroyed
    let launchChild: ChildProcessWithoutNullStreams | undefined
    const onResponseClose = (): void => {
      if (res.writableFinished) return
      disconnected = true
      if (launchChild !== undefined) void stopChild(launchChild)
    }
    res.once('close', onResponseClose)
    const assertConnected = (): void => {
      this.#assertLaunchLifecycle(routeGeneration)
      if (disconnected || res.destroyed) throw new HttpError(499, 'editor launch client disconnected')
    }
    try {
      assertConnected()
      const capability = this.#openCapability(token)
      if (Date.now() > capability.launchExpiresAt) throw new HttpError(410, `editor capability expired; rerun ${OPENPENCIL_RENDER_TOOL_NAME}`)
      const current = await readSourceDocument(capability.sourcePath)
      assertConnected()
      if (sha256(current) !== capability.sourceSha256) {
        throw new HttpError(409, `source changed since this preview; rerun ${OPENPENCIL_RENDER_TOOL_NAME} before editing`)
      }
      const binary = this.binary
      if (binary === undefined) throw new HttpError(503, 'OpenPencil editor host binary is unavailable')

      // The details panel hosts one editor. Retire an earlier daemon before a
      // successor starts so stale transcript cards cannot retain authority.
      const old = [...this.#sessions.values()]
      this.#sessions.clear()
      await Promise.all(old.map(session => this.#disposeSession(session)))
      assertConnected()

      const env: NodeJS.ProcessEnv = { ...process.env }
      const sourceRoot = sourceRootForBinary(binary)
      if (sourceRoot !== undefined) {
        env.OPENPENCIL_WEB_BUNDLE_DIR ??= join(sourceRoot, 'crates', 'op-host-web', 'pkg')
        env.OPENPENCIL_CANVASKIT_DIR ??= join(sourceRoot, 'crates', 'op-host-web', 'assets', 'canvaskit')
      }
      const child = spawn(binary, [
        '--serve-web', '--managed', '--port', '0', '--file', capability.sourcePath,
        '--allow-origin', origin,
      ], { stdio: ['pipe', 'pipe', 'pipe'], env })
      launchChild = child
      this.#pendingChildren.add(child)
      let diagnostics = ''
      child.stderr.on('data', (chunk: Buffer) => {
        if (diagnostics.length < MAX_DIAGNOSTIC_BYTES) {
          diagnostics += chunk.toString('utf8').slice(0, MAX_DIAGNOSTIC_BYTES - diagnostics.length)
        }
      })
      try {
        const handshake = await waitForHandshake(child, () => diagnostics.trim())
        assertConnected()
        const baseUrl = `http://127.0.0.1:${handshake.port}`
        await waitForEditorReady(baseUrl)
        assertConnected()
        const id = randomBytes(24).toString('base64url')
        const session: EditorSession = {
          id,
          sourcePath: capability.sourcePath,
          ...(ownerSessionId === undefined ? {} : { ownerSessionId }),
          baselineSha256: capability.sourceSha256,
          child,
          iframeUrl: `${baseUrl}/?embed=vscode`,
          daemonToken: handshake.token,
          refreshExpiresAt: capability.refreshExpiresAt,
          createdAt: Date.now(),
          closed: false,
          saving: false,
          mutating: false,
        }
        this.#sessions.set(id, session)
        this.#pendingChildren.delete(child)
        child.once('close', () => {
          if (this.#sessions.get(id) === session) this.#sessions.delete(id)
          session.closed = true
        })
        json(res, 200, {
          sessionId: id,
          iframeUrl: session.iframeUrl,
          token: session.daemonToken,
          saveUrl: `${EDITOR_ROUTE_PREFIX}/session/${id}/save`,
          selectionUrl: `${EDITOR_ROUTE_PREFIX}/session/${id}/selection`,
          closeUrl: `${EDITOR_ROUTE_PREFIX}/session/${id}`,
          docJson: current.toString('utf8'),
        })
        if (!await waitForResponseFinish(res)) {
          throw new HttpError(499, 'editor launch client disconnected')
        }
        launchChild = undefined
      } catch (error) {
        this.#pendingChildren.delete(child)
        await stopChild(child)
        throw error
      }
    } finally {
      res.off('close', onResponseClose)
    }
  }

  async #refresh(token: string, res: ServerResponse): Promise<void> {
    const capability = this.#openCapability(token)
    const now = Date.now()
    if (now > capability.refreshExpiresAt) throw new HttpError(410, `editor capability expired; rerun ${OPENPENCIL_RENDER_TOOL_NAME}`)
    const current = await readSourceDocument(capability.sourcePath)
    if (sha256(current) !== capability.sourceSha256) {
      throw new HttpError(409, `source changed since this preview; rerun ${OPENPENCIL_RENDER_TOOL_NAME} before editing`)
    }
    const next = this.#sealCapability({
      ...capability,
      issuedAt: now,
      launchExpiresAt: Math.min(now + CAPABILITY_TTL_MS, capability.refreshExpiresAt),
    })
    json(res, 200, { launchUrl: `${EDITOR_ROUTE_PREFIX}/${next}/launch` })
  }

  async #save(id: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!TOKEN_PATTERN.test(id)) throw new HttpError(404, 'editor session not found')
    const session = this.#sessions.get(id)
    if (session === undefined || session.closed) throw new HttpError(410, 'editor session has ended')
    if (session.saving || session.mutating) throw new HttpError(409, 'another editor change or save is already in progress')
    session.saving = true
    try {
      const bytes = await readRequestBody(req)
      let value: unknown
      try {
        value = JSON.parse(bytes.toString('utf8'))
      } catch {
        throw new HttpError(400, 'editor save request is not valid JSON')
      }
      if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new HttpError(400, 'editor save request is invalid')
      const record = value as Record<string, unknown>
      if (record.sessionId !== id || typeof record.docJson !== 'string') throw new HttpError(400, 'editor save request is incomplete')
      if (
        typeof record.generation !== 'number' || !Number.isSafeInteger(record.generation) || record.generation < 0
        || typeof record.revision !== 'number' || !Number.isSafeInteger(record.revision) || record.revision < 0
      ) throw new HttpError(400, 'editor save revision is invalid')
      const current = await readSourceDocument(session.sourcePath)
      if (sha256(current) !== session.baselineSha256) {
        throw new HttpError(409, 'source changed outside this editor; save was stopped')
      }
      const nextHash = await atomicWriteDocument(session.sourcePath, record.docJson)
      session.baselineSha256 = nextHash
      const now = Date.now()
      session.createdAt = now
      const successor = session.refreshExpiresAt > now
        ? this.#sealCapability({
            v: 1,
            scope: 'edit-source',
            sourcePath: session.sourcePath,
            sourceSha256: nextHash,
            issuedAt: now,
            launchExpiresAt: Math.min(now + CAPABILITY_TTL_MS, session.refreshExpiresAt),
            refreshExpiresAt: session.refreshExpiresAt,
          })
        : undefined
      json(res, 200, {
        ok: true,
        sha256: nextHash,
        ...(successor === undefined ? {} : {
          editor: {
            enabled: true,
            launchUrl: `${EDITOR_ROUTE_PREFIX}/${successor}/launch`,
            refreshUrl: `${EDITOR_ROUTE_PREFIX}/${successor}/refresh`,
          },
        }),
      })
    } finally {
      session.saving = false
    }
  }

  async #close(id: string): Promise<void> {
    const session = this.#sessions.get(id)
    if (session === undefined) return
    this.#sessions.delete(id)
    await this.#disposeSession(session)
  }

  #activeSession(expectedSourcePath?: string, ownerSessionId?: string): EditorSession {
    this.#prune()
    const sessions = [...this.#sessions.values()].filter(session => !session.closed)
    if (sessions.length !== 1) {
      throw new Error('No active OpenPencil editor. Render with editable=true and open “Edit in sidebar” first.')
    }
    const session = sessions[0]!
    if (ownerSessionId !== undefined && session.ownerSessionId !== ownerSessionId) {
      throw new Error('The active OpenPencil editor belongs to a different DSH session')
    }
    if (expectedSourcePath !== undefined && resolve(expectedSourcePath) !== session.sourcePath) {
      throw new Error(`The active OpenPencil editor is ${session.sourcePath}, not ${resolve(expectedSourcePath)}`)
    }
    return session
  }

  async #selectionForSession(id: string): Promise<OpenPencilSelectionSnapshot> {
    if (!TOKEN_PATTERN.test(id)) throw new HttpError(404, 'editor session not found')
    const session = this.#sessions.get(id)
    if (session === undefined || session.closed) throw new HttpError(410, 'editor session has ended')
    return this.#selectionFor(session)
  }

  async #selectionFor(session: EditorSession, signal?: AbortSignal): Promise<OpenPencilSelectionSnapshot> {
    const result = await callOpenPencilMcp({
      baseUrl: new URL(session.iframeUrl).origin,
      token: session.daemonToken,
      tool: 'get_selection',
      arguments: { readDepth: 0 },
      signal,
    })
    session.createdAt = Date.now()
    return selectionSnapshotFromMcp(session.sourcePath, result.value)
  }

  async #disposeSession(session: EditorSession): Promise<void> {
    if (session.closed) return
    session.closed = true
    await stopChild(session.child)
  }

  #prune(): void {
    const now = Date.now()
    for (const [id, session] of this.#sessions) {
      if (now - session.createdAt > SESSION_IDLE_MS) {
        this.#sessions.delete(id)
        void this.#disposeSession(session)
      }
    }
  }

  #sealCapability(capability: EditCapability): string {
    const nonce = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.#editorKey, nonce)
    cipher.setAAD(EDITOR_CAPABILITY_AAD)
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(capability), 'utf8'), cipher.final()])
    return `${EDITOR_CAPABILITY_PREFIX}${Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]).toString('base64url')}`
  }

  #openCapability(token: string): EditCapability {
    if (!token.startsWith(EDITOR_CAPABILITY_PREFIX)) {
      // Compatibility boundary for pre-fix transcript cards: their random
      // in-memory token cannot safely be recreated after a plugin reload.
      throw new HttpError(410, `editor capability expired; rerun ${OPENPENCIL_RENDER_TOOL_NAME}`)
    }
    if (token.length > EDITOR_CAPABILITY_MAX_LENGTH) throw new HttpError(404, 'editor capability not found')
    try {
      const packed = Buffer.from(token.slice(EDITOR_CAPABILITY_PREFIX.length), 'base64url')
      if (packed.length < 29) throw new Error('short token')
      const decipher = createDecipheriv('aes-256-gcm', this.#editorKey, packed.subarray(0, 12))
      decipher.setAAD(EDITOR_CAPABILITY_AAD)
      decipher.setAuthTag(packed.subarray(12, 28))
      const plain = Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()])
      const capability = capabilityFrom(JSON.parse(plain.toString('utf8')))
      if (capability === undefined) throw new Error('invalid payload')
      return capability
    } catch {
      throw new HttpError(404, 'editor capability not found')
    }
  }
}
