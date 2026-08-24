/**
 * @zseven-w/dsh-openpencil — preview `.op` design documents in DSH.
 *
 * Plugin lifecycle: register the model-facing tool plus signed routes for
 * exact PNGs, immutable document snapshots, and the optional read-only Web
 * SDK canvas. Everything is
 * registered through `ctx.effect` (or a returned disposer) so unloading the
 * plugin removes every contribution.
 *
 * The `openpencil_render` tool never returns an ImageBlock — the DeepSeek
 * adapter rejects image blocks anywhere in a request. The browser-only
 * envelope rides `output.presentationMeta` into `ToolCallBlock.meta`, and
 * the keyed `tool.call.toolview` client component renders a PNG-first card
 * and lazily mounts the OpenPencil canvas on demand.
 * @module @zseven-w/dsh-openpencil
 */

import type { Context } from '@deepseek-ai/cordis'
import type FileSystem from '@deepseek-ai/dsh-fs'
import type { FsObservation, FsTarget } from '@deepseek-ai/dsh-fs'
import type SandboxPolicyService from '@deepseek-ai/dsh-sandbox-policy'
import type ToolRegistry from '@deepseek-ai/dsh-tools'
import type { ToolExecution, ToolExecutionResult, ToolRunContext } from '@deepseek-ai/dsh-tools'
import type { Session, SessionStore } from '@deepseek-ai/dsh-session'
import type WebServer from '@deepseek-ai/dsh-host-webserver'
import {
  RENDER_ROUTE_PREFIX,
  RenderAccessController,
  prepareRenderAccessKey,
} from './renderer.js'
import { createDesignRenderTool } from './tool.js'
import {
  createDesignCreateTool,
  createDesignEditTool,
  createDesignSelectionTool,
} from './design-tools.js'
import { createDesignNewTool } from './new-tool.js'
import {
  VIEWER_ASSET_ROUTE_PREFIX,
  prepareViewerAssets,
} from './viewer-assets.js'
import {
  EDITOR_ROUTE_PREFIX,
  EditorHostController,
} from './editor-host.js'
import {
  OPENPENCIL_CREATE_TOOL_NAME,
  OPENPENCIL_EDIT_TOOL_NAME,
  OPENPENCIL_NEW_TOOL_NAME,
  OPENPENCIL_RENDER_TOOL_NAME,
  OPENPENCIL_SELECTION_TOOL_NAME,
  OPENPENCIL_TOOL_NAMES,
} from './tool-names.js'
import {
  PRESENTATION_HYDRATION_ROUTE,
  PresentationHydrationController,
} from './presentation-hydration.js'

export {
  LEGACY_DESIGN_RENDER_TOOL_NAME,
  OPENPENCIL_CREATE_TOOL_NAME,
  OPENPENCIL_EDIT_TOOL_NAME,
  OPENPENCIL_NEW_TOOL_NAME,
  OPENPENCIL_RENDER_TOOL_NAME,
  OPENPENCIL_SELECTION_TOOL_NAME,
  OPENPENCIL_TOOL_NAMES,
} from './tool-names.js'

/** Stable plugin name (the loader entry id in cordis.patch.yml). */
export const name = '@zseven-w/dsh-openpencil'

/** Services this plugin's root fiber requires. */
export const inject = ['tools', 'sessions', 'fs', 'sandboxPolicy']

/**
 * rc.2 source worktrees augmented the legacy `cordis` package name while the
 * published rc line augments `@deepseek-ai/cordis`. Keep this plugin's build
 * structural so the same source type-checks against both without changing its
 * runtime service contract.
 */
type HostContext = Context & {
  tools: ToolRegistry
  sessions: SessionStore
  fs: FileSystem
  sandboxPolicy: SandboxPolicyService
}

type HostEventContext = Context & {
  on(name: 'tools/result', listener: (exec: Readonly<ToolExecution>, result: Readonly<ToolExecutionResult>) => void): () => void
  on(name: 'session/disposed', listener: (session: Session) => void): () => void
  emit(name: 'fs/observed', target: FsTarget, observation: FsObservation, actor: ToolRunContext): void
}

/** Read the optional bind-time trust snapshot without making Web-only runtime glue a hard peer. */
function webRuntimeTrustedHosts(ctx: Context): readonly string[] {
  const get = (ctx as unknown as { get?: (name: string) => unknown }).get
  const runtime = typeof get === 'function' ? get.call(ctx, 'webRuntime') : undefined
  if (typeof runtime !== 'object' || runtime === null || !('trustedHosts' in runtime)) return []
  const trustedHosts = (runtime as { trustedHosts?: unknown }).trustedHosts
  return Array.isArray(trustedHosts) && trustedHosts.every(value => typeof value === 'string')
    ? trustedHosts
    : []
}

/** Plugin entry: mount every model-facing contribution. */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const hostCtx = ctx as HostContext
  const eventCtx = ctx as HostEventContext
  const disposers: Array<() => void | Promise<void>> = []
  const accessKey = await prepareRenderAccessKey()
  const controller = new RenderAccessController(accessKey)
  const viewerAssets = await prepareViewerAssets()
  const editorHost = new EditorHostController(accessKey)
  const presentationHydration = new PresentationHydrationController({
    sessions: hostCtx.sessions,
    render: controller,
    viewer: viewerAssets,
    editor: editorHost,
    // webRuntime is provided after bind by the official Web bundle. Resolve
    // it at request time so loopback still works on older/headless hosts while
    // configured LAN authorities receive the same Host fence as DSH /api.
    trustedHosts: () => webRuntimeTrustedHosts(ctx),
  })
  let editorHostDisposePromise: Promise<void> | undefined
  const disposeEditorHost = (): Promise<void> => {
    editorHostDisposePromise ??= editorHost.dispose()
    return editorHostDisposePromise
  }

  // Tool registration: global (every agent sees it). The tool's
  // presentationMeta consults `controller.routeAvailable`, so a profile
  // without the webserver still gets a plain-JSON result — no dangling URL.
  disposers.push(ctx.effect(
    () => hostCtx.tools.register(createDesignRenderTool(controller, viewerAssets, editorHost)),
    `dsh-openpencil: ${OPENPENCIL_RENDER_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => hostCtx.tools.register(createDesignSelectionTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_SELECTION_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => hostCtx.tools.register(createDesignNewTool(editorHost, {
      fs: hostCtx.fs,
      sandboxPolicy: hostCtx.sandboxPolicy,
      render: controller,
      observe: (target, observation, exec) => eventCtx.emit('fs/observed', target, observation, exec),
    })),
    `dsh-openpencil: ${OPENPENCIL_NEW_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => hostCtx.tools.register(createDesignCreateTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_CREATE_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => hostCtx.tools.register(createDesignEditTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_EDIT_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => eventCtx.on('tools/result', (exec, result) => presentationHydration.observeToolResult(exec, result)),
    'dsh-openpencil: nested presentation result observer',
  ))
  disposers.push(ctx.effect(
    () => eventCtx.on('session/disposed', session => presentationHydration.forgetSession(String(session.id))),
    'dsh-openpencil: nested presentation session cleanup',
  ))

  // Optional Web routes: only mounted when a webServer service exists
  // (headless profiles never attach, and `routeAvailable` stays false).
  // The inject fiber is parent-scoped and tears itself down with this ctx;
  // the inner effect's disposer is the route removal.
  ctx.inject(['webServer'], (webCtx) => webCtx.effect(() => {
    const webServer = (webCtx as Context & { webServer: WebServer }).webServer
    const detach = controller.attachRoute()
    const disposeRoute = webServer.register({
      kind: 'prefix',
      path: RENDER_ROUTE_PREFIX,
      handler: (req, res) => controller.handle(req, res),
    })
    const disposePresentationRoute = webServer.register({
      kind: 'exact',
      path: PRESENTATION_HYDRATION_ROUTE,
      handler: (req, res) => presentationHydration.handle(req, res),
    })
    const disposeViewerRoute = viewerAssets.available
      ? (() => {
          const detachViewer = viewerAssets.attachRoute()
          const disposeViewer = webServer.register({
            kind: 'prefix',
            path: VIEWER_ASSET_ROUTE_PREFIX,
            handler: (req, res) => viewerAssets.handle(req, res),
          })
          return () => {
            disposeViewer()
            detachViewer()
          }
        })()
      : undefined
    const detachEditor = editorHost.attachRoute()
    const disposeEditorRoute = webServer.register({
      kind: 'prefix',
      path: EDITOR_ROUTE_PREFIX,
      handler: (req, res) => editorHost.handle(req, res),
    })
    return async () => {
      disposeEditorRoute()
      detachEditor()
      disposeViewerRoute?.()
      disposePresentationRoute()
      disposeRoute()
      detach()
      await disposeEditorHost()
    }
  }, 'dsh-openpencil: render route'))

  ctx.logger.info(`dsh-openpencil mounted (${OPENPENCIL_TOOL_NAMES.join(' + ')}; viewer assets: ${viewerAssets.available ? 'ready' : 'unavailable'}; editor: ${editorHost.available ? 'ready' : 'unavailable'})`)
  return async () => {
    for (const dispose of disposers.reverse()) await dispose()
    await disposeEditorHost()
  }
}
