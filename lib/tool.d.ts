/**
 * `openpencil_render` — render a `.op` design document to PNG without a
 * window. OpenPencil's own exporter is the exact primary path; Jian is an
 * explicitly-labelled runtime-preview fallback when that binary is absent.
 *
 * The tool returns plain JSON (never an `ImageBlock` — the DeepSeek
 * adapter rejects image blocks anywhere in a request). A browser-only
 * envelope with a signed preview URL rides `output.presentationMeta`
 * into `ToolCallBlock.meta`, where the keyed `tool.call.toolview`
 * component recognizes it and renders `<img>`.
 * @module dsh-openpencil/tool
 */
import { RenderAccessController } from './renderer.js';
import type { ViewerAssetController } from './viewer-assets.js';
import type { EditorHostController } from './editor-host.js';
export interface DesignRenderArgs {
    path: string;
    width?: number;
    height?: number;
    scale?: number;
    /** Explicitly expose the original source to the managed sidebar editor. */
    editable?: boolean;
}
/** Create the `openpencil_render` tool definition bound to one controller. */
export declare function createDesignRenderTool(controller: RenderAccessController, viewerAssets?: ViewerAssetController, editorHost?: EditorHostController): import("@deepseek-ai/dsh-tools").ToolDefinition;
