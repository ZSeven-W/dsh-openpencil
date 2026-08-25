/**
 * Safe recovery of browser-only presentation metadata for nested Code Mode
 * tool calls.
 *
 * DSH persists nested `openpencil_render` / document-publication outcomes as a
 * `tool/code-dispatch` event, but published DSH through 0.1.0-rc.6 omits the native
 * `tool/result` presentation metadata from that event. The browser can ask
 * this same-origin endpoint to re-project that metadata without submitting
 * any path or tool result of its own. Live results are remembered briefly so
 * an explicitly requested editor grant can be restored. Durable ordinary
 * renders remain preview-only; strictly parsed new/pipeline publications may
 * recover a loopback-only explicit Edit action, but never historical auto-open.
 *
 * @module dsh-openpencil/presentation-hydration
 */

import { createHash } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { basename, isAbsolute, join } from 'node:path'
import { SessionId, type SessionStore } from '@deepseek-ai/dsh-session'
import type { JsonValue, ToolExecution, ToolExecutionResult } from '@deepseek-ai/dsh-tools'
import { isLoopbackRemoteAddress, type EditorHostController } from './editor-host.js'
import type { DesignNewResult } from './new-tool.js'
import type { PublishedDraft } from './design-draft-tools.js'
import {
  MAX_DOCUMENT_BYTES,
  MAX_RENDER_BYTES,
  PRESENTATION_META_KEY,
  RenderAccessController,
  projectDocumentGrant,
  projectRenderGrant,
  renderDir,
  snapshotDir,
  type RenderFrame,
  type RenderResult,
} from './renderer.js'
import {
  OPENPENCIL_NEW_TOOL_NAME,
  OPENPENCIL_PIPELINE_FINISH_TOOL_NAME,
  OPENPENCIL_RENDER_TOOL_NAME,
} from './tool-names.js'
import type { ViewerAssetController } from './viewer-assets.js'

/** Exact same-origin endpoint used by the client to recover nested metadata. */
export const PRESENTATION_HYDRATION_ROUTE = '/_dsh/dsh-openpencil/presentation'

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const RENDER_FILENAME_PATTERN = /^render-[A-Za-z0-9-]+\.png$/
const MAX_BODY_BYTES = 4 * 1024
const MAX_HISTORY_TEXT_BYTES = 1024 * 1024
const MAX_HYDRATION_RESPONSE_BYTES = 4 * 1024 * 1024
const DEFAULT_TTL_MS = 15 * 60 * 1000
const DEFAULT_MAX_ENTRIES = 256
const DEFAULT_MAX_RECORD_BYTES = 32 * 1024
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024
const MAX_HYDRATION_FRAMES = 128

type HydratableResult = RenderResult | DesignNewResult | PublishedDraft

interface HydrationRequest {
  sessionId: string
  callId: string
  documentSha256: string
}

interface LiveAuthorizationRecord {
  kind: 'authorization'
  expiresAt: number
  bytes: number
  documentSha256: string
  sourcePath?: string
  editable: boolean
  resultDigest: string
}

interface LiveTombstoneRecord {
  kind: 'tombstone'
  expiresAt: number
  bytes: 1
}

type LiveRecord = LiveAuthorizationRecord | LiveTombstoneRecord

type StoredSession = NonNullable<ReturnType<SessionStore['get']>>
type StoredEvent = StoredSession['events'][number]

interface HistoricalSettlement {
  duplicate: boolean
  event?: StoredEvent
}

interface SessionHistoryIndex {
  indexedLength: number
  indexedTail?: StoredEvent
  settlements: Map<string, HistoricalSettlement>
}

interface PresentationHydrationOptions {
  ttlMs?: number
  maxEntries?: number
  maxRecordBytes?: number
  maxBytes?: number
  now?: () => number
}

interface PresentationHydrationDependencies {
  sessions: Pick<SessionStore, 'get'>
  render: RenderAccessController
  viewer?: Pick<ViewerAssetController, 'viewerGrant'>
  editor?: Pick<EditorHostController, 'grantFor'>
  /** DSH Web authorities derived from `webRuntime.trustedHosts`. */
  trustedHosts?: readonly string[] | (() => readonly string[])
}

class HttpError extends Error {
  constructor(readonly status: number) {
    super(`presentation hydration failed (${status})`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every(key => allowed.has(key))
}

function isSafeString(value: unknown, maxLength = 16 * 1024): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(value)
}

function isSafeInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value)
}

function isManagedArtifactPath(path: unknown, root: string, filename: string): path is string {
  return typeof path === 'string'
    && isAbsolute(path)
    && basename(path) === filename
    && path === join(root, filename)
}

const FRAME_KEYS = new Set([
  'path', 'filename', 'mimeType', 'bytes', 'width', 'height', 'sha256',
  'id', 'name', 'index',
])

function parseFrame(value: unknown, expectedIndex: number): RenderFrame | undefined {
  if (!isRecord(value) || !hasExactKeys(value, FRAME_KEYS)) return undefined
  if (
    typeof value.filename !== 'string'
    || !RENDER_FILENAME_PATTERN.test(value.filename)
    || !isManagedArtifactPath(value.path, renderDir(), value.filename)
    || value.mimeType !== 'image/png'
    || !isSafeInteger(value.bytes, 1, MAX_RENDER_BYTES)
    || !isSafeInteger(value.width, 1, 32_768)
    || !isSafeInteger(value.height, 1, 32_768)
    || value.width * value.height > 128 * 1024 * 1024
    || !isSha256(value.sha256)
    || (value.id !== undefined && !isSafeString(value.id, 512))
    || (value.name !== undefined && !isSafeString(value.name, 512))
    || (value.index !== undefined && value.index !== expectedIndex)
  ) return undefined
  return value as unknown as RenderFrame
}

const DOCUMENT_KEYS = new Set(['path', 'filename', 'mimeType', 'bytes', 'sha256'])

function isDocumentSnapshot(value: unknown): value is NonNullable<RenderResult['document']> {
  if (!isRecord(value) || !hasExactKeys(value, DOCUMENT_KEYS)) return false
  return isSha256(value.sha256)
    && value.filename === `${value.sha256}.op`
    && isManagedArtifactPath(value.path, snapshotDir(), value.filename)
    && value.mimeType === 'application/json'
    && isSafeInteger(value.bytes, 1, MAX_DOCUMENT_BYTES)
}

const RENDER_RESULT_KEYS = new Set([
  'path', 'filename', 'mimeType', 'kind', 'description', 'sourceTool',
  'previewIntent', 'bytes', 'width', 'height', 'sha256', 'sourcePath',
  'renderer', 'rendererBinary', 'fidelity', 'warnings', 'frames',
  'frameCount', 'editable', 'document', 'note',
  'autoOpenEditor',
])

/**
 * Accept only the canonical, content-addressed result shape emitted by this
 * plugin. Hydration never signs a legacy absolute-path-only render.
 */
export function parseHydratableRenderResult(value: unknown): RenderResult | undefined {
  if (!isRecord(value) || !hasExactKeys(value, RENDER_RESULT_KEYS)) return undefined
  if (
    typeof value.filename !== 'string'
    || !RENDER_FILENAME_PATTERN.test(value.filename)
    || !isManagedArtifactPath(value.path, renderDir(), value.filename)
    || value.mimeType !== 'image/png'
    || value.kind !== 'image'
    || !isSafeString(value.description)
    || value.sourceTool !== OPENPENCIL_RENDER_TOOL_NAME
    || value.previewIntent !== 'image'
    || !isSafeInteger(value.bytes, 1, MAX_RENDER_BYTES)
    || !isSha256(value.sha256)
    || !isDocumentSnapshot(value.document)
    || (value.width !== undefined && !isSafeInteger(value.width, 1, 32_768))
    || (value.height !== undefined && !isSafeInteger(value.height, 1, 32_768))
    || (value.width !== undefined && value.height !== undefined && value.width * value.height > 128 * 1024 * 1024)
    || (value.sourcePath !== undefined && (!isSafeString(value.sourcePath) || !isAbsolute(value.sourcePath) || !value.sourcePath.toLowerCase().endsWith('.op')))
    || (value.renderer !== undefined && value.renderer !== 'openpencil' && value.renderer !== 'jian')
    || (value.rendererBinary !== undefined && !isSafeString(value.rendererBinary))
    || (value.fidelity !== undefined && value.fidelity !== 'exact' && value.fidelity !== 'runtime-preview')
    || (value.editable !== undefined && typeof value.editable !== 'boolean')
    || (value.autoOpenEditor !== undefined && typeof value.autoOpenEditor !== 'boolean')
    || (value.note !== undefined && !isSafeString(value.note))
  ) return undefined

  if (value.warnings !== undefined) {
    if (!Array.isArray(value.warnings) || value.warnings.length > 32 || !value.warnings.every(item => typeof item === 'string' && item.length <= 1_024)) {
      return undefined
    }
  }

  let frames: RenderFrame[] | undefined
  if (value.frames !== undefined) {
    if (!Array.isArray(value.frames) || value.frames.length === 0 || value.frames.length > MAX_HYDRATION_FRAMES) return undefined
    frames = []
    for (const [index, candidate] of value.frames.entries()) {
      const frame = parseFrame(candidate, index)
      if (frame === undefined) return undefined
      frames.push(frame)
    }
    if (
      frames[0]?.path !== value.path
      || frames[0]?.filename !== value.filename
      || frames[0]?.bytes !== value.bytes
      || frames[0]?.sha256 !== value.sha256
    ) return undefined
  }
  if (value.frameCount !== undefined && (!isSafeInteger(value.frameCount, 1, MAX_HYDRATION_FRAMES) || value.frameCount !== frames?.length)) return undefined
  if (frames === undefined && value.frameCount !== undefined) return undefined

  return value as unknown as RenderResult
}

const NEW_RESULT_KEYS = new Set([
  'path', 'filename', 'bytes', 'sha256', 'created', 'applied', 'saved',
  'sourceTool', 'previewIntent', 'editable', 'autoOpenEditor', 'document',
  'result', 'note',
])

/** Accept only the canonical document-only result emitted by openpencil_new. */
export function parseHydratableNewResult(value: unknown): DesignNewResult | undefined {
  if (!isRecord(value) || !hasExactKeys(value, NEW_RESULT_KEYS)) return undefined
  if (
    !isSafeString(value.path)
    || !isAbsolute(value.path)
    || !value.path.toLowerCase().endsWith('.op')
    || typeof value.filename !== 'string'
    || basename(value.path) !== value.filename
    || !isSafeInteger(value.bytes, 1, MAX_DOCUMENT_BYTES)
    || !isSha256(value.sha256)
    || value.created !== true
    || value.applied !== true
    || value.saved !== true
    || value.sourceTool !== OPENPENCIL_NEW_TOOL_NAME
    || value.previewIntent !== 'document'
    || value.editable !== true
    || value.autoOpenEditor !== true
    || !isDocumentSnapshot(value.document)
    || value.document.bytes !== value.bytes
    || value.document.sha256 !== value.sha256
    || (value.result !== undefined && !isRecord(value.result))
    || !isSafeString(value.note)
  ) return undefined
  return value as unknown as DesignNewResult
}

const PIPELINE_RESULT_KEYS = new Set([...NEW_RESULT_KEYS, 'published', 'preview'])

/** Accept only the canonical document-only result emitted by pipeline_finish. */
export function parseHydratablePipelineResult(value: unknown): PublishedDraft | undefined {
  if (!isRecord(value) || !hasExactKeys(value, PIPELINE_RESULT_KEYS)) return undefined
  if (
    !isSafeString(value.path)
    || !isAbsolute(value.path)
    || !value.path.toLowerCase().endsWith('.op')
    || typeof value.filename !== 'string'
    || basename(value.path) !== value.filename
    || !isSafeInteger(value.bytes, 1, MAX_DOCUMENT_BYTES)
    || !isSha256(value.sha256)
    || value.created !== true
    || value.applied !== true
    || value.saved !== true
    || value.published !== true
    || value.sourceTool !== OPENPENCIL_PIPELINE_FINISH_TOOL_NAME
    || value.previewIntent !== 'document'
    || value.editable !== true
    || value.autoOpenEditor !== true
    || parseFrame(value.preview, 0) === undefined
    || !isDocumentSnapshot(value.document)
    || value.document.bytes !== value.bytes
    || value.document.sha256 !== value.sha256
    || value.result !== undefined
    || !isSafeString(value.note)
  ) return undefined
  return value as unknown as PublishedDraft
}

function parseHydratableResult(toolName: unknown, value: unknown): HydratableResult | undefined {
  if (toolName === OPENPENCIL_RENDER_TOOL_NAME) return parseHydratableRenderResult(value)
  if (toolName === OPENPENCIL_NEW_TOOL_NAME) return parseHydratableNewResult(value)
  if (toolName === OPENPENCIL_PIPELINE_FINISH_TOOL_NAME) return parseHydratablePipelineResult(value)
  return undefined
}

function resultDocument(result: HydratableResult): NonNullable<RenderResult['document']> {
  return result.document!
}

function resultSourcePath(result: HydratableResult): string | undefined {
  return result.sourceTool === OPENPENCIL_RENDER_TOOL_NAME ? result.sourcePath : result.path
}

function resultEditable(result: HydratableResult): boolean {
  return result.editable === true
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(item => canonicalJson(item)).join(',')}]`
  const record = value as Record<string, unknown>
  const members = Object.keys(record)
    .filter(key => record[key] !== undefined)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
  return `{${members.join(',')}}`
}

function resultDigest(result: HydratableResult): string {
  return createHash('sha256').update(canonicalJson(result)).digest('hex')
}

function parseHydrationRequest(value: unknown): HydrationRequest | undefined {
  if (!isRecord(value)) return undefined
  const expected = new Set(['sessionId', 'callId', 'documentSha256'])
  if (Object.keys(value).length !== expected.size || !hasExactKeys(value, expected)) return undefined
  if (
    !isSafeString(value.sessionId, 256)
    || !isSafeString(value.callId, 512)
    || !isSha256(value.documentSha256)
  ) return undefined
  return value as unknown as HydrationRequest
}

function parseAuthority(authority: string): URL | undefined {
  try {
    return new URL(`http://${authority}`)
  } catch {
    return undefined
  }
}

function canonicalAuthority(entry: string, entryUrl: URL): string {
  const port = entryUrl.port !== '' ? entryUrl.port : new URL(`https://${entry}`).port
  return port === '' ? entryUrl.hostname : `${entryUrl.hostname}:${port}`
}

function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4
    && parts[0] === '127'
    && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

function isTrustedAuthority(hostUrl: URL, trustedHosts: readonly string[]): boolean {
  return trustedHosts.some(entry => {
    const entryUrl = parseAuthority(entry)
    if (entryUrl === undefined) return false
    return canonicalAuthority(entry, entryUrl) === entryUrl.hostname
      ? entryUrl.hostname === hostUrl.hostname
      : entryUrl.host === hostUrl.host
  })
}

/** Mirror DSH's Host / Fetch-Metadata / Origin browser-trust fence. */
function requestAuthority(req: IncomingMessage, trustedHosts: readonly string[]): { editorAllowed: boolean } | undefined {
  const host = req.headers.host
  if (typeof host !== 'string') return undefined
  const hostUrl = parseAuthority(host)
  if (hostUrl === undefined) return undefined
  const loopback = isLoopbackHostname(hostUrl.hostname)
  if (!loopback && !isTrustedAuthority(hostUrl, trustedHosts)) return undefined
  if (req.headers['sec-fetch-site'] === 'cross-site') return undefined

  const rawOrigin = req.headers.origin
  if (rawOrigin !== undefined) {
    if (typeof rawOrigin !== 'string') return undefined
    try {
      if (new URL(rawOrigin).host !== hostUrl.host) return undefined
    } catch {
      return undefined
    }
  }
  return { editorAllowed: loopback && isLoopbackRemoteAddress(req.socket.remoteAddress) }
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string' || !/^application\/json(?:\s*;|$)/i.test(contentType)) throw new HttpError(415)
  const contentLength = req.headers['content-length']
  if (typeof contentLength === 'string') {
    const declared = Number(contentLength)
    if (!Number.isSafeInteger(declared) || declared < 0) throw new HttpError(400)
    if (declared > MAX_BODY_BYTES) throw new HttpError(413)
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413)
    chunks.push(bytes)
  }
  if (size === 0) throw new HttpError(400)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new HttpError(400)
  }
}

function setSecurityHeaders(res: ServerResponse): void {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
}

function finishEmpty(res: ServerResponse, status: number): void {
  setSecurityHeaders(res)
  res.writeHead(status)
  res.end()
}

function finishJson(res: ServerResponse, value: JsonValue): void {
  const body = JSON.stringify(value)
  if (Buffer.byteLength(body) > MAX_HYDRATION_RESPONSE_BYTES) {
    finishEmpty(res, 413)
    return
  }
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', String(Buffer.byteLength(body)))
  res.writeHead(200)
  res.end(body)
}

function recordKey(sessionId: string, callId: string): string {
  return `${sessionId.length}:${sessionId}${callId}`
}

/** TTL/LRU cache plus fail-closed hydration endpoint. */
export class PresentationHydrationController {
  readonly #ttlMs: number
  readonly #maxEntries: number
  readonly #maxRecordBytes: number
  readonly #maxBytes: number
  readonly #now: () => number
  readonly #trustedHosts: () => readonly string[]
  readonly #live = new Map<string, LiveRecord>()
  readonly #history = new WeakMap<object, SessionHistoryIndex>()
  #liveBytes = 0

  constructor(
    private readonly dependencies: PresentationHydrationDependencies,
    options: PresentationHydrationOptions = {},
  ) {
    this.#ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
    this.#maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES
    this.#maxRecordBytes = options.maxRecordBytes ?? DEFAULT_MAX_RECORD_BYTES
    this.#maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
    this.#now = options.now ?? Date.now
    const trustedHosts = dependencies.trustedHosts
    this.#trustedHosts = typeof trustedHosts === 'function'
      ? trustedHosts
      : () => trustedHosts ?? []
    if (!Number.isSafeInteger(this.#ttlMs) || this.#ttlMs <= 0) throw new TypeError('presentation hydration ttlMs must be positive')
    if (!Number.isSafeInteger(this.#maxEntries) || this.#maxEntries <= 0) throw new TypeError('presentation hydration maxEntries must be positive')
    if (!Number.isSafeInteger(this.#maxRecordBytes) || this.#maxRecordBytes <= 0) throw new TypeError('presentation hydration maxRecordBytes must be positive')
    if (!Number.isSafeInteger(this.#maxBytes) || this.#maxBytes <= 0) throw new TypeError('presentation hydration maxBytes must be positive')
  }

  /** Observe one trusted in-process result before Code Mode drops its meta. */
  observeToolResult(exec: Readonly<ToolExecution>, result: Readonly<ToolExecutionResult>): void {
    if (
      exec.parent === undefined
      || result.isError
      || exec.agent === undefined
    ) return
    const parsed = parseHydratableResult(exec.name, result.value)
    if (parsed === undefined) return
    const sessionId = String(exec.agent.session.id)
    const callId = String(exec.callId)
    if (!isSafeString(sessionId, 256) || !isSafeString(callId, 512)) return
    const now = this.#now()
    this.#prune(now)
    const key = recordKey(sessionId, callId)
    const existing = this.#live.get(key)
    if (existing !== undefined) {
      // A tool settlement identity is single-use. Any second observation is
      // ambiguous even when its content hash matches: discard the retained
      // result and remember a fail-closed tombstone instead of overwriting it.
      if (existing.kind === 'authorization') {
        this.#deleteLive(key)
        this.#live.set(key, { kind: 'tombstone', expiresAt: now + this.#ttlMs, bytes: 1 })
        this.#liveBytes += 1
      } else {
        existing.expiresAt = now + this.#ttlMs
        this.#touchLive(key, existing)
      }
      this.#enforceBounds()
      return
    }

    const authorization: LiveAuthorizationRecord = {
      kind: 'authorization',
      expiresAt: now + this.#ttlMs,
      bytes: 0,
      documentSha256: resultDocument(parsed).sha256,
      sourcePath: resultSourcePath(parsed),
      editable: resultEditable(parsed),
      resultDigest: resultDigest(parsed),
    }
    const bytes = Buffer.byteLength(JSON.stringify(authorization), 'utf8')
    if (bytes > this.#maxRecordBytes || bytes > this.#maxBytes) {
      this.#live.set(key, { kind: 'tombstone', expiresAt: now + this.#ttlMs, bytes: 1 })
      this.#liveBytes += 1
      this.#enforceBounds()
      return
    }
    authorization.bytes = bytes
    this.#live.set(key, authorization)
    this.#liveBytes += bytes
    this.#enforceBounds()
  }

  /** Drop all live editor-capable records owned by a disposed session. */
  forgetSession(sessionId: string): void {
    if (!isSafeString(sessionId, 256)) return
    const prefix = `${sessionId.length}:${sessionId}`
    for (const key of this.#live.keys()) {
      if (key.startsWith(prefix)) this.#deleteLive(key)
    }
  }

  /** Handle the exact same-origin POST hydration route. */
  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const url = new URL(req.url ?? '/', 'http://dsh.invalid')
      if (url.pathname !== PRESENTATION_HYDRATION_ROUTE || url.search !== '') throw new HttpError(404)
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        throw new HttpError(405)
      }
      const authority = requestAuthority(req, this.#trustedHosts())
      if (authority === undefined) throw new HttpError(403)
      const request = parseHydrationRequest(await readJsonBody(req))
      if (request === undefined) throw new HttpError(400)
      const resolved = this.#resolve(request, authority.editorAllowed)
      if (resolved === undefined) throw new HttpError(404)
      finishJson(res, resolved)
    } catch (error) {
      const incomplete = !req.complete
      if (incomplete) res.setHeader('Connection', 'close')
      finishEmpty(res, error instanceof HttpError ? error.status : 500)
      // Rejected requests may still carry an unread body. Do not let an
      // oversized/cross-site uploader pin this exact route until keep-alive
      // timeout; mirror DSH's bounded HTTP bridge teardown.
      if (incomplete) req.destroy()
    }
  }

  #resolve(request: HydrationRequest, editorAllowed: boolean): JsonValue | undefined {
    // The durable settlement is the sole preview authority. The live cache
    // can only restore editing after it matches that event exactly.
    const result = this.#historicalResult(request)
    if (result === undefined) return undefined
    const authorization = this.#liveAuthorization(request, result)
    if (authorization === null) return undefined
    const sourcePath = resultSourcePath(result)
    const durablePublication = result.sourceTool === OPENPENCIL_NEW_TOOL_NAME
      || result.sourceTool === OPENPENCIL_PIPELINE_FINISH_TOOL_NAME
    const editor = editorAllowed
      && sourcePath !== undefined
      && (
        (authorization !== undefined && authorization.editable)
        || (authorization === undefined && durablePublication && resultEditable(result))
      )
      ? this.dependencies.editor?.grantFor(sourcePath, resultDocument(result).sha256)
      : undefined
    // A different browser may explicitly reopen a strictly parsed durable
    // publication, but only the original live settlement may request
    // automatic UI mutation. Historical cards always require an Edit click.
    const projectionResult = authorization === undefined && durablePublication
      ? { ...result, autoOpenEditor: undefined }
      : result
    const projected = result.sourceTool !== OPENPENCIL_RENDER_TOOL_NAME
      ? projectDocumentGrant(projectionResult as unknown as JsonValue, this.dependencies.render, editor)
      : projectRenderGrant(
          projectionResult as unknown as JsonValue,
          this.dependencies.render,
          this.dependencies.viewer?.viewerGrant,
          editor,
        )
    if (!isRecord(projected) || !(PRESENTATION_META_KEY in projected)) return undefined
    const envelope = projected[PRESENTATION_META_KEY]
    if (!isRecord(envelope)) return undefined
    return { [PRESENTATION_META_KEY]: envelope } as unknown as JsonValue
  }

  #liveAuthorization(
    request: HydrationRequest,
    result: HydratableResult,
  ): LiveAuthorizationRecord | null | undefined {
    const now = this.#now()
    this.#prune(now)
    const key = recordKey(request.sessionId, request.callId)
    const record = this.#live.get(key)
    if (record === undefined || record.expiresAt <= now) {
      this.#deleteLive(key)
      return undefined
    }
    if (record.kind === 'tombstone') {
      this.#touchLive(key, record)
      return null
    }
    if (
      record.documentSha256 !== request.documentSha256
      || record.sourcePath !== resultSourcePath(result)
      || record.editable !== resultEditable(result)
      || record.resultDigest !== resultDigest(result)
    ) return undefined
    this.#touchLive(key, record)
    return record
  }

  #historicalResult(request: HydrationRequest): HydratableResult | undefined {
    const session = this.dependencies.sessions.get(SessionId(request.sessionId))
    if (session === undefined) return undefined
    const index = this.#historyIndex(session)
    const settlement = index.settlements.get(request.callId)
    if (settlement === undefined || settlement.duplicate || settlement.event === undefined) return undefined

    const result = this.#parseHistoricalEvent(settlement.event)
    return result !== undefined && resultDocument(result).sha256 === request.documentSha256 ? result : undefined
  }

  #historyIndex(session: StoredSession): SessionHistoryIndex {
    const events = session.events
    let index = this.#history.get(session as object)
    if (
      index === undefined
      || events.length < index.indexedLength
      || (index.indexedLength > 0 && events[index.indexedLength - 1] !== index.indexedTail)
    ) {
      index = {
        indexedLength: 0,
        settlements: new Map(),
      }
      this.#history.set(session as object, index)
    }

    // Session events are append-only. Scan only the suffix added since the
    // last hydration; replacement, truncation, or tail mutation resets safely.
    for (let eventIndex = index.indexedLength; eventIndex < events.length; eventIndex += 1) {
      const event = events[eventIndex]
      if (
        event?.type !== 'tool/code-dispatch'
        || (
          event.data.name !== OPENPENCIL_RENDER_TOOL_NAME
          && event.data.name !== OPENPENCIL_NEW_TOOL_NAME
          && event.data.name !== OPENPENCIL_PIPELINE_FINISH_TOOL_NAME
        )
      ) continue
      const callId = String(event.data.subCallId)
      if (!isSafeString(callId, 512)) continue
      const existing = index.settlements.get(callId)
      if (existing === undefined) {
        index.settlements.set(callId, { duplicate: false, event })
      } else if (!existing.duplicate) {
        index.settlements.set(callId, { duplicate: true })
      }
    }
    index.indexedLength = events.length
    index.indexedTail = events[events.length - 1]
    return index
  }

  #parseHistoricalEvent(event: StoredEvent): HydratableResult | undefined {
    if (event.type !== 'tool/code-dispatch') return undefined
    const data = event.data
    if (data.isError !== false || !Array.isArray(data.content) || data.content.length !== 1) return undefined
    const block = data.content[0]
    if (!isRecord(block) || Object.keys(block).length !== 2 || block.type !== 'text' || typeof block.text !== 'string') return undefined
    if (block.text.length > MAX_HISTORY_TEXT_BYTES || Buffer.byteLength(block.text, 'utf8') > MAX_HISTORY_TEXT_BYTES) return undefined
    let parsedValue: unknown
    try {
      parsedValue = JSON.parse(block.text) as unknown
    } catch {
      return undefined
    }
    return parseHydratableResult(data.name, parsedValue)
  }

  #prune(now: number): void {
    for (const [key, record] of this.#live) {
      if (record.expiresAt <= now) this.#deleteLive(key)
    }
  }

  #touchLive(key: string, record: LiveRecord): void {
    this.#live.delete(key)
    this.#live.set(key, record)
  }

  #deleteLive(key: string): void {
    const record = this.#live.get(key)
    if (record === undefined) return
    this.#live.delete(key)
    this.#liveBytes -= record.bytes
  }

  #enforceBounds(): void {
    while (this.#live.size > this.#maxEntries || this.#liveBytes > this.#maxBytes) {
      const oldest = this.#live.keys().next().value as string | undefined
      if (oldest === undefined) break
      this.#deleteLive(oldest)
    }
  }
}
