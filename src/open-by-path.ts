/**
 * Open-by-path: mint the full presentation grant for a session-workspace `.op`
 * file, so the right-sidebar file tree can launch the editor workbench without
 * a render tool call (plan/9 E1 Step 1).
 *
 * Security posture mirrors the editor routes: a loopback transport fence, the
 * DSH request-authentication service, a live session id whose cwd scopes every
 * requested path, realpath containment inside that cwd, and the same immutable
 * sha256 snapshot plus signed document URL the render tool mints. The caller's
 * path is never trusted beyond the session's workspace; the sealed capability
 * in the editor URLs keeps later edits consistent with the minted snapshot.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { isAbsolute, resolve, sep } from 'node:path'
import { SessionId, type SessionStore } from '@deepseek-ai/dsh-session'
import {
  HttpError,
  requestOrigin,
  requireLoopbackPeer,
  type EditorGrant,
  type EditorHostController,
  type EditorRequestAuthentication,
} from './editor-host.js'
import {
  createDocumentSnapshot,
  projectDocumentCapability,
  type DocumentSnapshot,
  type RenderAccessController,
} from './renderer.js'
import type { JsonValue } from './json-value.js'

/** Exact route path; registered as an exact row so the editor prefix cannot shadow it. */
export const OPEN_BY_PATH_ROUTE = '/_dsh/dsh-openpencil/editor/open-by-path'

const MAX_REQUEST_BODY_BYTES = 16 * 1024
const MAX_RESPONSE_BYTES = 64 * 1024
const MAX_SESSION_ID_LENGTH = 256
const MAX_PATH_LENGTH = 1024

/** The editor half of the client's EditorWorkbenchRequest grant. */
export interface OpenByPathGrant {
  readonly schemaVersion: 2
  readonly document: ReturnType<typeof projectDocumentCapability>
  readonly editor?: EditorGrant
}

export interface OpenByPathDependencies {
  /** Session store: resolve the caller's session to its workspace cwd. */
  readonly sessions: SessionStore
  /** Render access controller minting the signed immutable document URL. */
  readonly render: RenderAccessController
  /** Editor host minting launch/refresh URLs; undefined on headless profiles. */
  readonly editor: Pick<EditorHostController, 'grantFor'> | undefined
}

interface OpenByPathRequest {
  readonly sessionId: string
  readonly path: string
}

function parseOpenByPathRequest(value: unknown): OpenByPathRequest | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  const sessionId = record.sessionId
  const path = record.path
  if (typeof sessionId !== 'string' || sessionId.length === 0 || sessionId.length > MAX_SESSION_ID_LENGTH) return undefined
  if (sessionId.includes('\0')) return undefined
  if (typeof path !== 'string' || path.trim().length === 0 || path.length > MAX_PATH_LENGTH) return undefined
  if (path.includes('\0')) return undefined
  return { sessionId, path }
}

/**
 * Resolve the request path against the session workspace: expand `~`, accept
 * absolute paths only when they land inside the workspace after realpath,
 * and require a regular `.op` file.
 */
async function resolveWorkspaceTarget(raw: string, cwd: string): Promise<string> {
  const expanded = raw.trim().startsWith('~/') || raw.trim().startsWith(`~${sep}`)
    ? resolve(homedir(), raw.trim().slice(2))
    : raw.trim()
  const target = isAbsolute(expanded) ? expanded : resolve(cwd, expanded)
  let realWorkspace: string
  try {
    realWorkspace = await realpath(cwd)
  } catch {
    throw new HttpError(404, 'session workspace is unavailable')
  }
  let real: string
  try {
    real = await realpath(target)
  } catch {
    throw new HttpError(404, '.op file not found in this session workspace')
  }
  const contained = real === realWorkspace || real.startsWith(`${realWorkspace}${sep}`)
  if (!contained) throw new HttpError(403, '.op file is outside this session workspace')
  const extension = real.slice(real.lastIndexOf('.')).toLowerCase()
  if (extension !== '.op') {
    throw new HttpError(400, `expected a .op file (got "${extension || '(none)'}")`)
  }
  const info = await stat(real).catch(() => undefined)
  if (info === undefined || !info.isFile()) throw new HttpError(400, 'not a regular file')
  return real
}

async function snapshotDocument(target: string): Promise<DocumentSnapshot> {
  try {
    return await createDocumentSnapshot(target)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('empty') || message.includes('exceeds')) throw new HttpError(422, message)
    throw new HttpError(404, '.op file not found in this session workspace')
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
  if (Buffer.byteLength(body) > MAX_RESPONSE_BYTES) {
    finishEmpty(res, 413)
    return
  }
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', String(Buffer.byteLength(body)))
  res.writeHead(200)
  res.end(body)
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string' || !/^application\/json(?:\s*;|$)/i.test(contentType)) throw new HttpError(415, 'open-by-path requires an application/json body')
  const contentLength = req.headers['content-length']
  if (typeof contentLength === 'string') {
    const declared = Number(contentLength)
    if (!Number.isSafeInteger(declared) || declared < 0) throw new HttpError(400, 'open-by-path Content-Length is invalid')
    if (declared > MAX_REQUEST_BODY_BYTES) throw new HttpError(413, 'open-by-path request body is too large')
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > MAX_REQUEST_BODY_BYTES) throw new HttpError(413, 'open-by-path request body is too large')
    chunks.push(bytes)
  }
  if (size === 0) throw new HttpError(400, 'open-by-path request body is empty')
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new HttpError(400, 'open-by-path request body is not valid JSON')
  }
}

/**
 * The open-by-path controller: same lifecycle shape as the presentation
 * hydration route — constructed with the plugin's services, authenticated
 * through the optional Desktop connection service, mounted as one exact web
 * route.
 */
export class OpenByPathController {
  readonly #dependencies: OpenByPathDependencies
  #requestAuthentication: EditorRequestAuthentication | undefined

  constructor(dependencies: OpenByPathDependencies) {
    this.#dependencies = dependencies
  }

  /** Bind optional Host authentication until its providing service is disposed. */
  attachRequestAuthentication(authenticate: EditorRequestAuthentication): () => void {
    const attached: EditorRequestAuthentication = req => authenticate(req)
    this.#requestAuthentication = attached
    return () => {
      if (this.#requestAuthentication === attached) this.#requestAuthentication = undefined
    }
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      requireLoopbackPeer(req)
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        throw new HttpError(405, 'open-by-path requires POST')
      }
      requestOrigin(req, this.#requestAuthentication)
      const request = parseOpenByPathRequest(await readJsonBody(req))
      if (request === undefined) throw new HttpError(400, 'open-by-path request must be a {sessionId, path} object')
      const grant = await this.#resolve(request)
      if (grant === undefined) throw new HttpError(404, 'session or .op file not found')
      finishJson(res, { ok: true, grant } as unknown as JsonValue)
    } catch (error) {
      const incomplete = !req.complete
      if (incomplete) res.setHeader('Connection', 'close')
      finishEmpty(res, error instanceof HttpError ? error.status : 500)
      // Rejected requests may still carry an unread body. Do not let an
      // oversized/cross-site uploader pin this route until keep-alive timeout;
      // mirror DSH's bounded HTTP bridge teardown.
      if (incomplete) req.destroy()
    }
  }

  async #resolve(request: OpenByPathRequest): Promise<OpenByPathGrant | undefined> {
    const session = this.#dependencies.sessions.get(SessionId(request.sessionId))
    const cwd = session?.header.cwd
    if (session === undefined || cwd === undefined || !isAbsolute(cwd)) return undefined
    const target = await resolveWorkspaceTarget(request.path, cwd)
    const snapshot = await snapshotDocument(target)
    const editor = this.#dependencies.editor?.grantFor(target, snapshot.sha256)
    return {
      schemaVersion: 2,
      document: projectDocumentCapability(snapshot, target, this.#dependencies.render),
      ...(editor === undefined ? {} : { editor }),
    }
  }
}
