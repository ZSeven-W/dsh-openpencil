/**
 * @dsh-external/dsh-openpencil — preview `.op` design documents in DSH.
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
 * @module @dsh-external/dsh-openpencil
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-host-webserver'
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
  OPENPENCIL_RENDER_TOOL_NAME,
  OPENPENCIL_SELECTION_TOOL_NAME,
  OPENPENCIL_TOOL_NAMES,
} from './tool-names.js'

export {
  LEGACY_DESIGN_RENDER_TOOL_NAME,
  OPENPENCIL_CREATE_TOOL_NAME,
  OPENPENCIL_EDIT_TOOL_NAME,
  OPENPENCIL_RENDER_TOOL_NAME,
  OPENPENCIL_SELECTION_TOOL_NAME,
  OPENPENCIL_TOOL_NAMES,
} from './tool-names.js'

/** Stable plugin name (the loader entry id in cordis.patch.yml). */
export const name = '@dsh-external/dsh-openpencil'

/** Services this plugin's root fiber requires. */
export const inject = ['tools']

/** Plugin entry: mount every model-facing contribution. */
export async function apply(ctx: Context): Promise<() => void> {
  const disposers: Array<() => void> = []
  const accessKey = await prepareRenderAccessKey()
  const controller = new RenderAccessController(accessKey)
  const viewerAssets = await prepareViewerAssets()
  const editorHost = new EditorHostController(accessKey)

  // Tool registration: global (every agent sees it). The tool's
  // presentationMeta consults `controller.routeAvailable`, so a profile
  // without the webserver still gets a plain-JSON result — no dangling URL.
  disposers.push(ctx.effect(
    () => ctx.tools.register(createDesignRenderTool(controller, viewerAssets, editorHost)),
    `dsh-openpencil: ${OPENPENCIL_RENDER_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => ctx.tools.register(createDesignSelectionTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_SELECTION_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => ctx.tools.register(createDesignCreateTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_CREATE_TOOL_NAME} tool`,
  ))
  disposers.push(ctx.effect(
    () => ctx.tools.register(createDesignEditTool(editorHost)),
    `dsh-openpencil: ${OPENPENCIL_EDIT_TOOL_NAME} tool`,
  ))

  // Optional Web routes: only mounted when a webServer service exists
  // (headless profiles never attach, and `routeAvailable` stays false).
  // The inject fiber is parent-scoped and tears itself down with this ctx;
  // the inner effect's disposer is the route removal.
  ctx.inject(['webServer'], (webCtx) => webCtx.effect(() => {
    const detach = controller.attachRoute()
    const disposeRoute = webCtx.webServer.register({
      kind: 'prefix',
      path: RENDER_ROUTE_PREFIX,
      handler: (req, res) => controller.handle(req, res),
    })
    const disposeViewerRoute = viewerAssets.available
      ? (() => {
          const detachViewer = viewerAssets.attachRoute()
          const disposeViewer = webCtx.webServer.register({
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
    const disposeEditorRoute = webCtx.webServer.register({
      kind: 'prefix',
      path: EDITOR_ROUTE_PREFIX,
      handler: (req, res) => editorHost.handle(req, res),
    })
    return () => {
      disposeEditorRoute()
      detachEditor()
      void editorHost.dispose()
      disposeViewerRoute?.()
      disposeRoute()
      detach()
    }
  }, 'dsh-openpencil: render route'))

  ctx.logger.info(`dsh-openpencil mounted (${OPENPENCIL_TOOL_NAMES.join(' + ')}; viewer assets: ${viewerAssets.available ? 'ready' : 'unavailable'}; editor: ${editorHost.available ? 'ready' : 'unavailable'})`)
  return () => {
    for (const dispose of disposers.reverse()) dispose()
    void editorHost.dispose()
  }
}
