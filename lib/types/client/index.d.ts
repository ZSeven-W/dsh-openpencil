/**
 * Browser presentation for `openpencil_render` and historical
 * `design_render` conversation cards.
 *
 * PNG remains the replay-safe default. When the host also grants access to
 * the source `.op`, the user can opt into one shared, read-only Web SDK
 * canvas. The SDK and document are fetched only after that explicit action.
 */
import type { ToolCallViewProps, ToolDetailsViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type EditorColorScheme, type EditorLocale } from './editor-bridge.js';
import type { GalleryFrame, GalleryLocale } from './frame-gallery.js';
export { LEGACY_DESIGN_RENDER_TOOL_NAME, OPENPENCIL_RENDER_TOOL_NAME, } from '../tool-names.js';
export { calculateGalleryFitViewZoom, clampGalleryZoom, frameLabel, frameGalleryCopy, galleryZoomCommandTarget, galleryViewportMaxHeight, galleryZoomPercent, galleryZoomShortcut, GALLERY_COMPACT_MAX_HEIGHT, GALLERY_TOOLBAR_CONTROL_CONTENT_LAYOUT, GALLERY_TOOLBAR_CONTROL_HEIGHT, GALLERY_TOOLBAR_CONTROL_LAYOUT, GALLERY_ZOOM_MAX, GALLERY_ZOOM_MIN, GALLERY_ZOOM_STEP, nextGalleryZoom, normalizeFrameIndex, } from './frame-gallery.js';
export { closeManagedEditorLaunch, editorPanelCopy, launchManagedEditor, prepareManagedEditor, prepareManagedEditorForMount, } from './editor-panel.js';
export { editorGrantForBoot, editorSuccessorFromSave, editorSuccessorStorageKey, rememberEditorSuccessor, } from './editor-successor.js';
export { claimEditor, confirmEditorClose, editorControlUrl, editorIframeUrlWithLocale, editorIframeUrlWithTheme, editorLocaleFromDsh, editorMessageFrom, editorOrigin, encodeEditorOutbound, parseEditorInbound, } from './editor-bridge.js';
export { clearOpenPencilSelection, getOpenPencilSelectionSnapshot, liveSelectionOf, publishOpenPencilSelection, subscribeOpenPencilSelection, } from './selection-store.js';
export { isTerminalEditorSelectionStatus, startEditorSelectionPolling, } from './selection-polling.js';
export { hasOpenPencilSelection, OPENPENCIL_SELECTION_DOCK_LAYOUT, selectionNodeDetail, selectionNodeLabel, } from './selection-dock.js';
/** Presentation metadata key the host half projects into `block.meta`. */
export declare const PRESENTATION_META_KEY = "$dshOpenPencil";
export type PresentationLocale = GalleryLocale;
export declare function designRenderCopy(locale: PresentationLocale): {
    readonly designRender: "OpenPencil render";
    readonly error: "error";
    readonly rendering: "rendering…";
    readonly done: "done";
    readonly renderingDocument: "Rendering the design document…";
    readonly renderFailed: "The render failed.";
    readonly frames: "frames";
    readonly openInteractiveCanvas: "Open interactive canvas";
    readonly editInSidebar: "Edit in sidebar";
    readonly openRenderedPng: "Open rendered PNG";
    readonly downloadPng: "Download PNG";
    readonly editSource: "Edit source .op";
    readonly downloadSource: "Download source .op";
    readonly inspectToolCall: "Inspect tool call";
    readonly noPreview: "No preview channel available in this host.";
    readonly canvas: "OpenPencil canvas";
    readonly zoomOut: "Zoom out";
    readonly zoomIn: "Zoom in";
    readonly fit: "Fit";
    readonly close: "Close";
    readonly readonlyCanvas: "Read-only OpenPencil design canvas";
    readonly loadingCanvas: "Loading interactive canvas…";
    readonly pngRemains: "PNG preview remains available underneath the dialog.";
    readonly canvasUnavailable: "Interactive canvas unavailable";
    readonly openPngFallback: "Open PNG fallback";
    readonly panHint: "Drag to pan · scroll to pan · Ctrl/⌘ + scroll to zoom";
    readonly snapshot: "snapshot";
    readonly editorUnavailable: "Editable OpenPencil canvas is not available for this result.";
} | {
    readonly designRender: "OpenPencil 渲染";
    readonly error: "错误";
    readonly rendering: "渲染中…";
    readonly done: "完成";
    readonly renderingDocument: "正在渲染设计文档…";
    readonly renderFailed: "渲染失败。";
    readonly frames: "页";
    readonly openInteractiveCanvas: "打开交互画布";
    readonly editInSidebar: "在侧边栏编辑";
    readonly openRenderedPng: "打开渲染 PNG";
    readonly downloadPng: "下载 PNG";
    readonly editSource: "编辑源文件 .op";
    readonly downloadSource: "下载源文件 .op";
    readonly inspectToolCall: "检查工具调用";
    readonly noPreview: "当前宿主没有可用的预览通道。";
    readonly canvas: "OpenPencil 画布";
    readonly zoomOut: "缩小";
    readonly zoomIn: "放大";
    readonly fit: "适应窗口";
    readonly close: "关闭";
    readonly readonlyCanvas: "只读 OpenPencil 设计画布";
    readonly loadingCanvas: "正在加载交互画布…";
    readonly pngRemains: "对话框下方仍保留 PNG 预览。";
    readonly canvasUnavailable: "交互画布不可用";
    readonly openPngFallback: "打开 PNG 预览";
    readonly panHint: "拖动平移 · 滚动平移 · Ctrl/⌘ + 滚动缩放";
    readonly snapshot: "快照";
    readonly editorUnavailable: "此渲染结果没有可用的 OpenPencil 编辑画布。";
};
export interface ImageGrant extends GalleryFrame {
}
export interface DocumentGrant {
    path?: string;
    url: string;
    downloadUrl?: string;
    bytes?: number;
    sha256?: string;
    mimeType?: string;
}
export interface ViewerGrant {
    sdkUrl: string;
    wasmUrl: string;
    canvasKitBaseUrl: string;
}
export interface EditorGrant {
    enabled: true;
    launchUrl: string;
    refreshUrl?: string;
}
export interface PresentationGrant {
    schemaVersion: 1 | 2;
    image?: ImageGrant;
    frames?: ImageGrant[];
    document?: DocumentGrant;
    viewer?: ViewerGrant;
    editor?: EditorGrant;
    renderer?: string;
    rendererBinary?: string;
    fidelity?: string;
    warnings?: string[];
}
/** Parse both the established v1 envelope and the additive v2 shape. */
export declare function grantOf(block: ToolCallViewProps['block']): PresentationGrant | undefined;
interface Viewport {
    panX: number;
    panY: number;
    zoom: number;
}
interface OpViewer {
    readonly viewport: Viewport;
    setZoom(zoom: number): void;
    panTo(panX: number, panY: number): void;
    zoomToFit(width: number, height: number): void;
    on(event: 'viewportchange', callback: () => void): () => void;
    destroy(): void;
}
interface OpenPencilSdk {
    createViewer(options: {
        canvas: HTMLCanvasElement;
        doc: string | Uint8Array;
        wasmUrl?: string;
        canvasKitBaseUrl?: string;
    }): Promise<OpViewer>;
}
/** Load the host-served ESM core SDK without coupling the client bundle to React 19. */
export declare function loadOpenPencilSdk(url: string): Promise<OpenPencilSdk>;
/** @internal Claim the page-wide SDK singleton; opening another canvas closes this one. */
export declare function claimCanvas(token: symbol, close: () => void): () => void;
/** Size the canvas backing store to its CSS box before CanvasKit attaches. */
export declare function sizeCanvasForDisplay(canvas: Pick<HTMLCanvasElement, 'clientWidth' | 'clientHeight' | 'width' | 'height'>, devicePixelRatio?: number): {
    cssWidth: number;
    cssHeight: number;
    dpr: number;
};
/** Render one OpenPencil render tool call as a PNG-first card. */
export declare function DesignRenderView({ block, openDetails, openFile, inspect, locale }: ToolCallViewProps & {
    locale?: PresentationLocale;
}): import("react").JSX.Element;
/** Render the selected editable design inside DSH's resident details column. */
export declare function OpenPencilEditorPanel({ block, colorScheme, locale, sessionId }: ToolDetailsViewProps & {
    colorScheme: EditorColorScheme;
    locale: EditorLocale;
}): import("react").JSX.Element;
/** Required client services. */
export declare const inject: string[];
/** Register canonical views plus a presentation-only alias for replaying historical cards. */
export declare function apply(ctx: ClientContext): void;
