/** Full OpenPencil editor hosted in DSH's Tool details side panel. */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PresentationGrant } from './index.js'
import {
  claimEditor,
  editorControlUrl,
  editorIframeUrlWithTheme,
  editorIframeUrlWithLocale,
  editorMessageFrom,
  editorOrigin,
  encodeEditorOutbound,
  type EditorColorScheme,
  type EditorInboundMessage,
  type EditorLocale,
} from './editor-bridge.js'
import { editorGrantForBoot, rememberEditorSuccessor } from './editor-successor.js'

export interface LaunchResponse {
  sessionId: string
  iframeUrl: string
  token: string
  saveUrl: string
  closeUrl: string
  docJson?: string
  /** Client-only marker: the persisted launch capability was renewed. */
  renewed?: true
}

const DEFAULT_REFRESH_URL = '/_dsh/dsh-openpencil/editor/refresh'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function launchResponseOf(value: unknown): LaunchResponse {
  if (!isRecord(value)) throw new Error('OpenPencil editor launch returned an invalid response')
  const fields = ['sessionId', 'iframeUrl', 'token', 'saveUrl', 'closeUrl'] as const
  for (const field of fields) {
    if (typeof value[field] !== 'string' || value[field].length === 0) {
      throw new Error(`OpenPencil editor launch omitted ${field}`)
    }
  }
  return {
    sessionId: value.sessionId as string,
    iframeUrl: value.iframeUrl as string,
    token: value.token as string,
    saveUrl: editorControlUrl(value.saveUrl as string),
    closeUrl: editorControlUrl(value.closeUrl as string),
    ...(typeof value.docJson === 'string' ? { docJson: value.docJson } : {}),
  }
}

async function responseJson(response: Response, action: string): Promise<unknown> {
  if (!response.ok) throw new Error(`${action} failed (${response.status})`)
  return response.json()
}

function refreshedLaunchUrlOf(value: unknown): string {
  if (!isRecord(value) || typeof value.launchUrl !== 'string' || value.launchUrl.length === 0) {
    throw new Error('OpenPencil editor refresh omitted launchUrl')
  }
  return editorControlUrl(value.launchUrl)
}

export interface EditorBootResult {
  launch: LaunchResponse
  documentJson: string
}

export interface EditorPanelCopy {
  save: string
  saving: string
  unsaved: string
  saved: string
  unavailable: string
  loading: string
  errorTitle: string
  pngFallback: string
  editorTitle: (title: string) => string
  editorTimeout: string
  saveConflict: (serverVersion: number) => string
  syncConflict: (serverVersion: number) => string
}

const EDITOR_PANEL_COPY: Record<EditorLocale, EditorPanelCopy> = {
  'zh-CN': {
    save: '保存',
    saving: '保存中…',
    unsaved: '未保存',
    saved: '已保存',
    unavailable: '当前结果无法使用可编辑的 OpenPencil 画布。',
    loading: '正在加载可编辑的 OpenPencil 画布…',
    errorTitle: 'OpenPencil 编辑器不可用',
    pngFallback: '打开 PNG 预览',
    editorTitle: title => `OpenPencil 编辑器：${title}`,
    editorTimeout: 'OpenPencil 编辑器未能及时就绪',
    saveConflict: serverVersion => `OpenPencil 保存冲突（服务器版本 ${serverVersion}）`,
    syncConflict: serverVersion => `源文件已在编辑器外部更改（服务器版本 ${serverVersion}），已停止保存。`,
  },
  'en-US': {
    save: 'Save',
    saving: 'Saving…',
    unsaved: 'Unsaved',
    saved: 'Saved',
    unavailable: 'Editable OpenPencil canvas is not available for this result.',
    loading: 'Loading editable OpenPencil canvas…',
    errorTitle: 'OpenPencil editor unavailable',
    pngFallback: 'Open PNG fallback',
    editorTitle: title => `OpenPencil editor: ${title}`,
    editorTimeout: 'OpenPencil editor did not become ready',
    saveConflict: serverVersion => `OpenPencil save conflict (server v${serverVersion})`,
    syncConflict: serverVersion => `The source changed outside this editor (server v${serverVersion}). Save was stopped.`,
  },
}

/** Chrome copy for the locale already resolved by the DSH host. */
export function editorPanelCopy(locale: EditorLocale): EditorPanelCopy {
  return EDITOR_PANEL_COPY[locale]
}

interface EditorBootOptions {
  signal?: AbortSignal
  fetcher?: typeof fetch
}

function launchRequest(fetcher: typeof fetch, url: string, signal?: AbortSignal): Promise<Response> {
  return fetcher(editorControlUrl(url), {
    method: 'POST',
    credentials: 'same-origin',
    ...(signal === undefined ? {} : { signal }),
  })
}

/**
 * Launch one editor, renewing exactly once when a replayed launch capability
 * has expired. A refreshed capability is never persisted back into the Tool
 * block, and only same-origin control routes can receive document metadata.
 */
export async function launchManagedEditor(
  editor: NonNullable<PresentationGrant['editor']>,
  document: NonNullable<PresentationGrant['document']>,
  options: EditorBootOptions = {},
): Promise<LaunchResponse> {
  const fetcher = options.fetcher ?? fetch
  let launchUrl = editor.launchUrl
  let renewed = false
  let response = await launchRequest(fetcher, launchUrl, options.signal)
  if (response.status === 410) {
    if (document.path === undefined) {
      throw new Error('OpenPencil editor launch expired and cannot be refreshed without a source path')
    }
    const refreshUrl = editorControlUrl(editor.refreshUrl ?? DEFAULT_REFRESH_URL)
    const refreshResponse = await fetcher(refreshUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        launchUrl: editor.launchUrl,
        sourcePath: document.path,
        documentUrl: document.url,
      }),
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    launchUrl = refreshedLaunchUrlOf(await responseJson(refreshResponse, 'OpenPencil editor refresh'))
    renewed = true
    // One bounded retry only. A second 410 is surfaced by responseJson and
    // never loops back through refresh.
    response = await launchRequest(fetcher, launchUrl, options.signal)
  }
  const launch = launchResponseOf(await responseJson(response, 'OpenPencil editor launch'))
  return renewed ? { ...launch, renewed: true } : launch
}

/** Prefer the daemon's current source; fetch the immutable snapshot only for old hosts. */
export async function prepareManagedEditor(
  editor: NonNullable<PresentationGrant['editor']>,
  document: NonNullable<PresentationGrant['document']>,
  options: EditorBootOptions = {},
): Promise<EditorBootResult> {
  const fetcher = options.fetcher ?? fetch
  const launch = await launchManagedEditor(editor, document, { ...options, fetcher })
  if (launch.docJson !== undefined) return { launch, documentJson: launch.docJson }
  if (editor.refreshUrl !== undefined || launch.renewed === true) {
    throw new Error('OpenPencil editor launch omitted current docJson')
  }
  const documentResponse = await fetcher(editorControlUrl(document.url), {
    credentials: 'same-origin',
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  })
  if (!documentResponse.ok) throw new Error(`OpenPencil document request failed (${documentResponse.status})`)
  return { launch, documentJson: await documentResponse.text() }
}

const panelStyles: Record<string, React.CSSProperties> = {
  root: {
    height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column',
    color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-base)',
  },
  toolbar: {
    minHeight: 42, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
    borderBottom: '1px solid var(--dsw-alias-border-l2)',
  },
  title: { minWidth: 0, marginRight: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 },
  status: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'nowrap' },
  button: {
    border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6,
    color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-1)',
    padding: '4px 8px', cursor: 'pointer', font: 'inherit', fontSize: 12,
  },
  stage: { position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', background: 'var(--dsw-alias-bg-base)' },
  iframe: { display: 'block', width: '100%', height: '100%', border: 0, background: 'var(--dsw-alias-bg-base)' },
  overlay: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 10, padding: 24, textAlign: 'center',
    color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-base)', fontSize: 12,
  },
  error: { color: 'var(--dsw-alias-state-error-primary)', maxWidth: 420, overflowWrap: 'anywhere' },
}

type Phase = 'launching' | 'loading' | 'ready' | 'saving' | 'error'

/** Editable panel. The daemon is created lazily only while this component is mounted. */
export function ManagedOpenPencilEditor({ grant, colorScheme, locale }: {
  grant: PresentationGrant
  colorScheme: EditorColorScheme
  locale: EditorLocale
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const launchRef = useRef<LaunchResponse>()
  const iframeSrcRef = useRef('')
  const originRef = useRef('')
  const docJsonRef = useRef('')
  const colorSchemeRef = useRef(colorScheme)
  colorSchemeRef.current = colorScheme
  const localeRef = useRef(locale)
  localeRef.current = locale
  const initTimerRef = useRef<ReturnType<typeof setInterval>>()
  const requestCounterRef = useRef(0)
  const saveWaitersRef = useRef(new Map<string, { resolve: (message: Extract<EditorInboundMessage, { type: 'op-bridge/snapshot-result' }>) => void; reject: (error: Error) => void }>())
  const [phase, setPhase] = useState<Phase>('launching')
  const [failure, setFailure] = useState('')
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(false)
  const documentGrant = grant.document!
  const editorGrant = grant.editor!

  const post = useCallback((message: Parameters<typeof encodeEditorOutbound>[0]) => {
    const frame = iframeRef.current?.contentWindow
    if (frame === null || frame === undefined || originRef.current === '') return
    frame.postMessage(encodeEditorOutbound(message), originRef.current)
  }, [])

  const save = useCallback(async () => {
    const launch = launchRef.current
    if (launch === undefined || phase === 'launching' || phase === 'loading' || phase === 'saving') return
    setPhase('saving')
    setFailure('')
    const requestId = `dsh-save-${++requestCounterRef.current}`
    try {
      const snapshot = await new Promise<Extract<EditorInboundMessage, { type: 'op-bridge/snapshot-result' }>>((resolve, reject) => {
        saveWaitersRef.current.set(requestId, { resolve, reject })
        post({ type: 'op-bridge/snapshot', purpose: 'save', requestId })
      })
      const response = await fetch(launch.saveUrl, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: launch.sessionId,
          docJson: snapshot.docJson,
          generation: snapshot.generation,
          revision: snapshot.revision,
        }),
      })
      const saveResponse = await responseJson(response, 'OpenPencil save')
      rememberEditorSuccessor(editorGrant.launchUrl, saveResponse)
      post({ type: 'op-bridge/save-committed', generation: snapshot.generation, revision: snapshot.revision })
      setDirty(false)
      dirtyRef.current = false
      setPhase('ready')
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error))
      setPhase('error')
    } finally {
      saveWaitersRef.current.delete(requestId)
    }
  }, [editorGrant.launchUrl, phase, post])

  useEffect(() => {
    let cancelled = false
    const abort = new AbortController()
    const coordinatorToken = Symbol('openpencil-editor')
    const closeDaemon = async (dirtyAtClose = dirtyRef.current): Promise<void> => {
      const launch = launchRef.current
      if (launch === undefined) return
      launchRef.current = undefined
      await fetch(launch.closeUrl, {
        method: 'DELETE', credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: launch.sessionId, dirty: dirtyAtClose }),
        keepalive: true,
      }).catch(() => {})
    }
    const releaseEditor = claimEditor(coordinatorToken, () => {
      abort.abort()
      void closeDaemon(false)
    })
    const boot = async (): Promise<void> => {
      try {
        const bootGrant = editorGrantForBoot(editorGrant)
        const { launch, documentJson } = await prepareManagedEditor(bootGrant, documentGrant, {
          signal: abort.signal,
        })
        const origin = editorOrigin(launch.iframeUrl)
        if (cancelled) return
        launchRef.current = launch
        // Capture first-navigation host presentation exactly once. Later host
        // theme/locale changes travel over the bridge and never reload the iframe.
        iframeSrcRef.current = editorIframeUrlWithLocale(
          editorIframeUrlWithTheme(launch.iframeUrl, colorSchemeRef.current),
          localeRef.current,
        )
        docJsonRef.current = documentJson
        originRef.current = origin
        setPhase('loading')
      } catch (error) {
        if (cancelled || abort.signal.aborted) return
        setFailure(error instanceof Error ? error.message : String(error))
        setPhase('error')
      }
    }
    void boot()
    return () => {
      cancelled = true
      abort.abort()
      releaseEditor()
      if (initTimerRef.current !== undefined) clearInterval(initTimerRef.current)
      const disposed = new Error('OpenPencil editor closed')
      for (const waiter of saveWaitersRef.current.values()) waiter.reject(disposed)
      saveWaitersRef.current.clear()
      void closeDaemon()
    }
  }, [documentGrant.path, documentGrant.url, editorGrant.launchUrl, editorGrant.refreshUrl])

  useEffect(() => {
    const listener = (event: MessageEvent): void => {
      const message = editorMessageFrom(event, iframeRef.current?.contentWindow ?? null, originRef.current)
      if (message === undefined) return
      switch (message.type) {
        case 'op-bridge/ready':
          if (initTimerRef.current !== undefined) clearInterval(initTimerRef.current)
          initTimerRef.current = undefined
          post({ type: 'op-bridge/theme', colorScheme: colorSchemeRef.current })
          post({ type: 'op-bridge/locale', locale: localeRef.current })
          post({ type: 'op-bridge/open-document', json: docJsonRef.current })
          break
        case 'op-bridge/opened':
          setPhase('ready')
          break
        case 'op-bridge/dirty-changed':
          setDirty(message.dirty)
          dirtyRef.current = message.dirty
          break
        case 'op-bridge/snapshot-result':
          saveWaitersRef.current.get(message.requestId)?.resolve(message)
          break
        case 'op-bridge/snapshot-conflict':
          saveWaitersRef.current.get(message.requestId)?.reject(
            new Error(editorPanelCopy(localeRef.current).saveConflict(message.serverVersion)),
          )
          break
        case 'op-bridge/sync-conflict':
          setFailure(editorPanelCopy(localeRef.current).syncConflict(message.serverVersion))
          setPhase('error')
          break
        case 'op-shell/save':
          void save()
          break
        case 'op-shell/copy':
          void navigator.clipboard?.writeText(message.text).catch(() => {})
          break
        case 'op-bridge/conflict-resolved':
          break
      }
    }
    window.addEventListener('message', listener)
    return () => { window.removeEventListener('message', listener) }
  }, [post, save])

  useEffect(() => {
    post({ type: 'op-bridge/theme', colorScheme })
  }, [colorScheme, post])

  useEffect(() => {
    post({ type: 'op-bridge/locale', locale })
  }, [locale, post])

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent): void => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => { window.removeEventListener('beforeunload', beforeUnload) }
  }, [])

  const startInitLoop = (): void => {
    const launch = launchRef.current
    if (launch === undefined) return
    if (initTimerRef.current !== undefined) clearInterval(initTimerRef.current)
    let attempts = 0
    const sendInit = (): void => {
      attempts += 1
      post({ type: 'op-bridge/init', token: launch.token })
      post({ type: 'op-bridge/theme', colorScheme: colorSchemeRef.current })
      post({ type: 'op-bridge/locale', locale: localeRef.current })
      if (attempts >= 20 && initTimerRef.current !== undefined) {
        clearInterval(initTimerRef.current)
        initTimerRef.current = undefined
        setFailure(editorPanelCopy(localeRef.current).editorTimeout)
        setPhase('error')
      }
    }
    sendInit()
    initTimerRef.current = setInterval(sendInit, 500)
  }

  const title = documentGrant.path?.replaceAll('\\', '/').split('/').at(-1) ?? 'OpenPencil'
  const copy = editorPanelCopy(locale)
  return (
    <section
      style={panelStyles.root}
      data-tool-details-fill="true"
      data-tool-details-dirty={dirty || undefined}
      data-openpencil-editor-panel="true"
    >
      <div style={panelStyles.toolbar}>
        <strong style={panelStyles.title} title={documentGrant.path}>{title}</strong>
        <span style={panelStyles.status}>{phase === 'saving' ? copy.saving : dirty ? copy.unsaved : phase === 'ready' ? copy.saved : ''}</span>
        <button type="button" style={panelStyles.button} disabled={!dirty || phase === 'saving'} onClick={() => { void save() }}>{copy.save}</button>
      </div>
      <div style={panelStyles.stage}>
        {launchRef.current !== undefined ? (
          <iframe
            ref={iframeRef}
            style={panelStyles.iframe}
            src={iframeSrcRef.current}
            title={copy.editorTitle(title)}
            allow="clipboard-read; clipboard-write"
            onLoad={startInitLoop}
          />
        ) : null}
        {phase === 'launching' || phase === 'loading' ? <div style={panelStyles.overlay} role="status">{copy.loading}</div> : null}
        {phase === 'error' ? (
          <div style={panelStyles.overlay} role="alert">
            <strong>{copy.errorTitle}</strong>
            <span style={panelStyles.error}>{failure}</span>
            {grant.image !== undefined ? <a href={grant.image.previewUrl} target="_blank" rel="noreferrer">{copy.pngFallback}</a> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
