/**
 * The `.op` sidebar-right tab type (plan/9 E1): a file-tree click on a
 * session-workspace `.op` opens this tab as a launcher. The body resolves the
 * resource address to its session and path, asks the Host to mint a full
 * presentation grant for the file (`POST /_dsh/dsh-openpencil/editor/
 * open-by-path`, server: `src/open-by-path.ts`), and hands the grant to the
 * editor workbench. Success closes this tab — the editor opens as itself —
 * while failure keeps the tab with a readable reason and Retry/Close.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {
  SidebarRightTabDefinition,
  UseSidebarRightTabInfo,
} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { parseFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import type { EditorWorkbenchRequest } from './editor-workbench-host.js'
import { en, zh, type OpenpencilOpTabKey } from './op-tab-locales.js'

/** The tab kind this package owns for `.op` files. */
export const OP_TAB_KIND = 'openpencil'

/** This implementation's identity in the tab system: the key its body registers under. */
export const OP_TAB_ID = '@zseven-w/dsh-openpencil/op-tab'

/** The Host route minting a full grant for one session-workspace `.op`. */
const OPEN_BY_PATH_ENDPOINT = '/_dsh/dsh-openpencil/editor/open-by-path'

/** The dictionary namespace this body registers and renders with. */
const OP_TAB_LOCALE_NAMESPACE = 'openpencilOpTab'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    openpencilOpTab: OpenpencilOpTabKey
  }
}

/**
 * The tab title for one `file:` address: its decoded basename.
 * @param address - a `file:`-shaped address.
 * @returns the decoded last path segment, or the address itself when it has none.
 */
function basenameOf(address: string): string {
  const name = address.slice(address.lastIndexOf('/') + 1)
  if (name === '') return address
  try {
    return decodeURIComponent(name)
  } catch {
    // A malformed percent sequence is still a name; showing it raw beats refusing the address.
    return name
  }
}

/**
 * The `.op` type's registry definition.
 * @returns the definition to register.
 */
export function opTabDefinition(): SidebarRightTabDefinition {
  return {
    id: OP_TAB_ID,
    kind: OP_TAB_KIND,
    patterns: ['dsh-resource://file/[\\s\\S]+\\.op'],
    priority: 'extension',
    canOpen: address => parseFileAddress(address)?.scope === 'session',
    title: basenameOf,
  }
}

/** The workbench opener the client entry binds; the host mounts in a parallel effect. */
type OpTabOpener = (request: EditorWorkbenchRequest) => boolean | Promise<boolean>

let activeOpener: OpTabOpener | undefined

type OpTabPhase = 'resolving' | 'opening' | 'failed'

/** The grant the open-by-path route mints for one file. */
interface OpTabGrant {
  readonly document?: unknown
  readonly editor?: { readonly enabled?: unknown }
}

function isOpTabGrant(value: unknown): value is OpTabGrant {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class HostRejection extends Error {
  constructor(readonly status: number | string) {
    super(`open-by-path rejected (${String(status)})`)
  }
}

/** Composed body props: slot runtime seats plus this entry's `t` seat. */
type OpTabBodyProps = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'openpencilOpTab'>

function OpTabBody(props: OpTabBodyProps): ReactNode {
  const { useTabInfo, t } = props
  const info: ReturnType<UseSidebarRightTabInfo> = useTabInfo()
  const address = info.tab.navigation.address
  const closeTab = info.tab.actions.close
  const parsed = parseFileAddress(address)
  const sessionId = parsed?.scope === 'session' ? String(parsed.sessionId) : undefined
  const path = parsed?.path
  const [phase, setPhase] = useState<OpTabPhase>('resolving')
  const [failure, setFailure] = useState<string | undefined>(undefined)
  const runRef = useRef(0)
  const run = useCallback(async (): Promise<void> => {
    const attempt = ++runRef.current
    if (sessionId === undefined || path === undefined) {
      setPhase('failed')
      setFailure(t('notSessionFile'))
      return
    }
    setPhase('resolving')
    setFailure(undefined)
    let grant: OpTabGrant | undefined
    try {
      const response = await fetch(OPEN_BY_PATH_ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, path }),
      })
      if (!response.ok) throw new HostRejection(response.status)
      const value: unknown = await response.json()
      if (
        typeof value !== 'object' || value === null || Array.isArray(value)
        || (value as Record<string, unknown>).ok !== true
        || !isOpTabGrant((value as Record<string, unknown>).grant)
      ) throw new HostRejection(200)
      grant = (value as Record<string, unknown>).grant as OpTabGrant
    } catch (error) {
      if (runRef.current !== attempt) return
      setPhase('failed')
      setFailure(t('hostRejected', { status: error instanceof HostRejection ? String(error.status) : 'network' }))
      return
    }
    if (runRef.current !== attempt) return
    if (grant.editor?.enabled !== true) {
      setPhase('failed')
      setFailure(t('editorUnavailable'))
      return
    }
    setPhase('opening')
    const opener = activeOpener
    let accepted = false
    try {
      if (opener !== undefined) {
        accepted = await opener({ grant: grant as EditorWorkbenchRequest['grant'], sessionId })
      }
    } catch {
      accepted = false
    }
    if (runRef.current !== attempt) return
    if (accepted) {
      // The workbench owns the document now; this launcher tab steps aside.
      closeTab()
      return
    }
    setPhase('failed')
    setFailure(t('workbenchRejected'))
  }, [sessionId, path, closeTab, t])
  useEffect(() => { void run() }, [run])
  return (
    <div data-op-tab style={{ padding: 16, display: 'grid', gap: 8, alignContent: 'start' }}>
      {phase === 'failed' ? (
        <>
          <p data-op-tab-failure style={{ margin: 0, fontSize: 13 }}>{failure}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" data-op-tab-retry onClick={() => { void run() }}>{t('retry')}</button>
            <button type="button" data-op-tab-close onClick={() => { closeTab() }}>{t('close')}</button>
          </div>
        </>
      ) : (
        <p data-op-tab-status style={{ margin: 0, fontSize: 13 }}>
          {phase === 'opening' ? t('opening') : t('resolving')}
        </p>
      )}
    </div>
  )
}

/** Structural faces this registration needs from the client context. */
interface OpTabServices {
  slots?: {
    inject: (name: string, register: () => unknown) => () => void
    register: (options: Record<string, unknown>, component: unknown) => unknown
  }
  sidebarRightTabs?: { register: (definition: SidebarRightTabDefinition) => () => void }
  locale?: { register: (namespace: string, dictionaries: Record<string, Record<string, string>>) => () => void }
}

/**
 * Register the `.op` tab type, its dictionaries, and its launcher body. The
 * workbench opener is bound from the client entry, which owns the
 * `mountEditorWorkbenchHost` handle.
 * @param ctx - client root context.
 * @param getOpener - opener accessor evaluated when the binding effect runs.
 */
export function registerOpTab(ctx: ClientContext, getOpener: () => OpTabOpener | undefined): void {
  const services = ctx as ClientContext & OpTabServices
  if (services.slots === undefined || services.sidebarRightTabs === undefined || services.locale === undefined) {
    console.error('[dsh-openpencil] op-tab required services missing', {
      hasSlots: services.slots !== undefined,
      hasTabs: services.sidebarRightTabs !== undefined,
      hasLocale: services.locale !== undefined,
    })
    return
  }
  ctx.effect(() => {
    activeOpener = getOpener() ?? undefined
    return () => { activeOpener = undefined }
  }, 'dsh-openpencil: op-tab opener binding')
  ctx.effect(() => services.sidebarRightTabs!.register(opTabDefinition()), 'dsh-openpencil: op-tab type')
  ctx.effect(() => services.locale!.register(OP_TAB_LOCALE_NAMESPACE, { zh, en }), 'dsh-openpencil: op-tab dictionaries')
  ctx.effect(() => services.slots!.inject('sidebar.right.pane.tab', () => services.slots!.register(
    { name: 'sidebar.right.pane.tab', key: OP_TAB_ID, locale: OP_TAB_LOCALE_NAMESPACE, registrant: 'dsh-openpencil: op-tab body' },
    OpTabBody,
  )), 'dsh-openpencil: op-tab body')
}
