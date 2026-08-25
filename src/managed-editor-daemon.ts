/** Shared lifecycle primitives for plugin-owned OpenPencil managed daemons. */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { isAbsolute } from 'node:path'
import { readManagedDaemonDocument, type ManagedDaemonDocument } from './editor-recovery.js'
import type { EditorRuntime } from './editor-runtime.js'

const START_TIMEOUT_MS = 20_000
const READY_TIMEOUT_MS = 15_000
const STOP_TIMEOUT_MS = 3_000
const MAX_HANDSHAKE_BYTES = 16 * 1024
const MAX_DIAGNOSTIC_BYTES = 64 * 1024

interface ManagedHandshake {
  port: number
  token: string
  version: string | number
}

export interface ManagedEditorDaemon {
  /** Internal child handle. Never include this object in a model-facing result. */
  readonly child: ChildProcessWithoutNullStreams
  readonly baseUrl: string
  /** Internal bearer credential. Never include this object in a model-facing result. */
  readonly token: string
  readonly sourcePath: string
  readonly runtimeVersion: string
}

export interface StartManagedEditorDaemonOptions {
  sourcePath: string
  allowOrigin: string
  signal?: AbortSignal
  /** Lifecycle seam used by the controller to join children during disposal. */
  onSpawn?: (child: ChildProcessWithoutNullStreams) => void
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function sanitizedDiagnostics(value: string, sourcePath?: string): string {
  const redacted = value
    .replace(/((?:authorization|bearer|token)[\s"'=:]+)[A-Za-z0-9._~-]{8,}/gi, '$1[redacted]')
  return (sourcePath === undefined ? redacted : redacted.split(sourcePath).join('[managed-document]')).trim()
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
  signal?: AbortSignal,
): Promise<ManagedHandshake> {
  signal?.throwIfAborted()
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
      signal?.removeEventListener('abort', onAbort)
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
    const onAbort = (): void => {
      const reason = signal?.reason
      finish(reason instanceof Error ? reason : new Error('OpenPencil editor startup was cancelled'))
    }
    const onClose = (code: number | null): void => {
      const detail = diagnostics()
      finish(new Error(`OpenPencil editor host exited before startup (${String(code)})${detail === '' ? '' : `: ${detail}`}`))
    }
    const timer = setTimeout(() => {
      const detail = diagnostics()
      finish(new Error(`OpenPencil editor host did not start within ${START_TIMEOUT_MS} ms${detail === '' ? '' : `: ${detail}`}`))
    }, START_TIMEOUT_MS)
    child.stdout.on('data', onData)
    child.once('error', onError)
    child.once('close', onClose)
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) onAbort()
  })
}

async function waitForEditorReady(baseUrl: string, signal?: AbortSignal): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  let last = ''
  while (Date.now() < deadline) {
    signal?.throwIfAborted()
    try {
      const requestSignal = signal === undefined
        ? AbortSignal.timeout(2_000)
        : AbortSignal.any([signal, AbortSignal.timeout(2_000)])
      const [root, glue] = await Promise.all([
        fetch(`${baseUrl}/`, { signal: requestSignal }),
        fetch(`${baseUrl}/pkg/op_host_web.js`, { signal: requestSignal }),
      ])
      await Promise.all([root.arrayBuffer().catch(() => undefined), glue.arrayBuffer().catch(() => undefined)])
      if (root.status === 200 && glue.status === 200) return
      last = `root=${root.status}, bundle=${glue.status}`
    } catch (error) {
      signal?.throwIfAborted()
      last = errorMessage(error)
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 150))
  }
  throw new Error(`OpenPencil editor web bundle was not ready${last === '' ? '' : `: ${last}`}`)
}

const stoppingChildren = new WeakMap<ChildProcessWithoutNullStreams, Promise<void>>()

function waitForChildClose(child: ChildProcessWithoutNullStreams, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true)
  return new Promise<boolean>(resolveClosed => {
    let settled = false
    const finish = (value: boolean): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.off('close', onClose)
      resolveClosed(value)
    }
    const onClose = (): void => { finish(true) }
    const timer = setTimeout(() => { finish(false) }, timeoutMs)
    child.once('close', onClose)
  })
}

/** Stop a child even if startup has not produced a daemon handshake yet. */
export function stopManagedEditorChild(child: ChildProcessWithoutNullStreams): Promise<void> {
  const current = stoppingChildren.get(child)
  if (current !== undefined) return current
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  const stopping = (async (): Promise<void> => {
    if (!child.stdin.writableEnded) child.stdin.end()
    const closed = await waitForChildClose(child, STOP_TIMEOUT_MS)
    if (!closed && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL')
      await waitForChildClose(child, STOP_TIMEOUT_MS)
    }
  })()
  stoppingChildren.set(child, stopping)
  void stopping.finally(() => {
    if (stoppingChildren.get(child) === stopping) stoppingChildren.delete(child)
  })
  return stopping
}

/** Start a managed host bound to one already-created `.op` document. */
export async function startManagedEditorDaemon(
  runtime: EditorRuntime,
  options: StartManagedEditorDaemonOptions,
): Promise<ManagedEditorDaemon> {
  options.signal?.throwIfAborted()
  if (!isAbsolute(options.sourcePath) || !options.sourcePath.toLowerCase().endsWith('.op')) {
    throw new Error('OpenPencil managed daemon source must be an absolute .op path')
  }
  const origin = new URL(options.allowOrigin)
  if (origin.origin !== options.allowOrigin || (origin.protocol !== 'http:' && origin.protocol !== 'https:')) {
    throw new Error('OpenPencil managed daemon allow-origin must be an HTTP origin')
  }
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    OPENPENCIL_WEB_BUNDLE_DIR: runtime.webBundleDir,
    OPENPENCIL_CANVASKIT_DIR: runtime.canvasKitDir,
  }
  const child = spawn(runtime.binary, [
    '--serve-web', '--managed', '--port', '0', '--file', options.sourcePath,
    '--allow-origin', options.allowOrigin,
  ], { stdio: ['pipe', 'pipe', 'pipe'], env })
  options.onSpawn?.(child)
  let diagnostics = ''
  child.stderr.on('data', (chunk: Buffer) => {
    if (diagnostics.length < MAX_DIAGNOSTIC_BYTES) {
      diagnostics += chunk.toString('utf8').slice(0, MAX_DIAGNOSTIC_BYTES - diagnostics.length)
    }
  })
  const onAbort = (): void => { void stopManagedEditorChild(child) }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const handshake = await waitForHandshake(
      child,
      () => sanitizedDiagnostics(diagnostics, options.sourcePath),
      options.signal,
    )
    const actualVersion = String(handshake.version)
    if (actualVersion !== runtime.openPencilVersion) {
      throw new Error(
        `OpenPencil editor runtime version mismatch: expected ${runtime.openPencilVersion}, received ${actualVersion}`,
      )
    }
    options.signal?.throwIfAborted()
    const baseUrl = `http://127.0.0.1:${handshake.port}`
    await waitForEditorReady(baseUrl, options.signal)
    options.signal?.throwIfAborted()
    return {
      child,
      baseUrl,
      token: handshake.token,
      sourcePath: options.sourcePath,
      runtimeVersion: actualVersion,
    }
  } catch (error) {
    await stopManagedEditorChild(child)
    throw error
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
  }
}

export function stopManagedEditorDaemon(daemon: ManagedEditorDaemon): Promise<void> {
  return stopManagedEditorChild(daemon.child)
}

/** Read an authoritative bounded snapshot without exposing daemon credentials. */
export function readManagedEditorDaemon(
  daemon: ManagedEditorDaemon,
  signal?: AbortSignal,
): Promise<ManagedDaemonDocument> {
  return readManagedDaemonDocument(daemon.baseUrl, daemon.token, fetch, signal)
}
