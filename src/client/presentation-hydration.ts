/** Recover browser-only presentation metadata omitted from nested Tool results. */

import { OPENPENCIL_NEW_TOOL_NAME, OPENPENCIL_RENDER_TOOL_NAME } from '../tool-names.js'

export const PRESENTATION_HYDRATION_ENDPOINT = '/_dsh/dsh-openpencil/presentation'
export const PRESENTATION_HYDRATION_META_KEY = '$dshOpenPencil'
const MAX_CANONICAL_RESULT_CHARS = 1024 * 1024
const MAX_SESSION_ID_CHARS = 256
const MAX_CALL_ID_CHARS = 512

export interface PresentationHydrationRequest {
  sessionId: string
  callId: string
  documentSha256: string
}

export interface PresentationHydrationCandidate {
  block: unknown
  toolName: string
  sessionId: string
  callId: string
  embeddedGrant: unknown
}

export type PresentationHydrationFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>

export interface PresentationHydrationOptions {
  fetcher?: PresentationHydrationFetcher
  signal?: AbortSignal
}

type PresentationMetaParser<Grant> = (meta: unknown) => Grant | undefined

interface PendingEnvelope {
  promise: Promise<unknown>
  subscribers: number
  settled: boolean
  cancelIfUnused: () => void
}

const pendingByFetcher = new WeakMap<PresentationHydrationFetcher, Map<string, PendingEnvelope>>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRequest(value: PresentationHydrationRequest): boolean {
  return value.sessionId.length > 0
    && value.sessionId.length <= MAX_SESSION_ID_CHARS
    && value.callId.length > 0
    && value.callId.length <= MAX_CALL_ID_CHARS
    && /^[a-f0-9]{64}$/iu.test(value.documentSha256)
}

function requestKey(value: PresentationHydrationRequest): string {
  return `${value.sessionId}\n${value.callId}\n${value.documentSha256.toLowerCase()}`
}

function pendingEnvelope(
  request: PresentationHydrationRequest,
  fetcher: PresentationHydrationFetcher,
): PendingEnvelope {
  let pending = pendingByFetcher.get(fetcher)
  if (pending === undefined) {
    pending = new Map()
    pendingByFetcher.set(fetcher, pending)
  }
  const key = requestKey(request)
  const existing = pending.get(key)
  if (existing !== undefined) return existing

  const controller = new AbortController()
  const entry: PendingEnvelope = {
    subscribers: 0,
    settled: false,
    cancelIfUnused: () => {},
    promise: Promise.resolve(undefined),
  }
  entry.cancelIfUnused = () => {
    if (entry.subscribers !== 0 || entry.settled) return
    if (pending?.get(key) === entry) pending.delete(key)
    controller.abort()
  }
  entry.promise = (async () => {
    const response = await fetcher(PRESENTATION_HYDRATION_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
    if (!response.ok) return undefined
    try {
      return await response.json()
    } catch {
      return undefined
    }
  })().catch(() => undefined).finally(() => {
    entry.settled = true
    if (pending?.get(key) === entry) pending.delete(key)
  })
  pending.set(key, entry)
  return entry
}

/**
 * Read only the immutable document fingerprint from one canonical text result.
 * Paths, image data, and every other model-visible result field are ignored.
 */
export function documentSha256FromCanonicalResult(block: unknown): string | undefined {
  if (!isRecord(block) || block.isError !== false || !Array.isArray(block.content) || block.content.length !== 1) {
    return undefined
  }
  const content = block.content[0]
  if (!isRecord(content) || content.type !== 'text' || typeof content.text !== 'string') return undefined
  if (content.text.length > MAX_CANONICAL_RESULT_CHARS) return undefined
  let result: unknown
  try {
    result = JSON.parse(content.text)
  } catch {
    return undefined
  }
  if (!isRecord(result) || !isRecord(result.document)) return undefined
  const fingerprint = result.document.sha256
  return typeof fingerprint === 'string' && /^[a-f0-9]{64}$/iu.test(fingerprint)
    ? fingerprint.toLowerCase()
    : undefined
}

/** Select only canonical nested OpenPencil presentation results that need hydration. */
export function presentationHydrationRequestOf(
  candidate: PresentationHydrationCandidate,
): PresentationHydrationRequest | undefined {
  if (
    candidate.embeddedGrant !== undefined
    || (candidate.toolName !== OPENPENCIL_RENDER_TOOL_NAME && candidate.toolName !== OPENPENCIL_NEW_TOOL_NAME)
  ) {
    return undefined
  }
  const documentSha256 = documentSha256FromCanonicalResult(candidate.block)
  if (
    documentSha256 === undefined
    || candidate.sessionId.length === 0
    || candidate.sessionId.length > MAX_SESSION_ID_CHARS
    || candidate.callId.length === 0
    || candidate.callId.length > MAX_CALL_ID_CHARS
  ) {
    return undefined
  }
  return {
    sessionId: candidate.sessionId,
    callId: candidate.callId,
    documentSha256,
  }
}

/**
 * Exchange a non-secret result fingerprint for a same-origin presentation
 * grant. Concurrent subscribers share one request; an unmounted subscriber
 * can abort independently, and the network request is cancelled once nobody
 * is waiting for it.
 */
export function requestPresentationGrant<Grant>(
  request: PresentationHydrationRequest,
  parseMeta: PresentationMetaParser<Grant>,
  options: PresentationHydrationOptions = {},
): Promise<Grant | undefined> {
  if (!isRequest(request) || options.signal?.aborted === true) return Promise.resolve(undefined)
  const fetcher = options.fetcher ?? globalThis.fetch
  if (typeof fetcher !== 'function') return Promise.resolve(undefined)
  const entry = pendingEnvelope(request, fetcher)
  entry.subscribers += 1

  return new Promise(resolve => {
    let finished = false
    const release = () => {
      entry.subscribers = Math.max(0, entry.subscribers - 1)
      entry.cancelIfUnused()
    }
    const finish = (value: Grant | undefined) => {
      if (finished) return
      finished = true
      options.signal?.removeEventListener('abort', abort)
      release()
      resolve(value)
    }
    const abort = () => { finish(undefined) }
    options.signal?.addEventListener('abort', abort, { once: true })
    entry.promise.then(value => {
      if (finished || options.signal?.aborted === true) {
        finish(undefined)
        return
      }
      if (!isRecord(value) || !Object.hasOwn(value, PRESENTATION_HYDRATION_META_KEY)) {
        finish(undefined)
        return
      }
      try {
        finish(parseMeta({
          [PRESENTATION_HYDRATION_META_KEY]: value[PRESENTATION_HYDRATION_META_KEY],
        }))
      } catch {
        finish(undefined)
      }
    }, () => { finish(undefined) })
  })
}
