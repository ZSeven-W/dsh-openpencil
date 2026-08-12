/**
 * Staged OpenPencil Web SDK assets + same-origin HTTP delivery.
 *
 * DSH only publishes the plugin's `client.js` automatically. The OpenPencil
 * viewer additionally needs its browser ESM bundle, the renderer WASM, and
 * CanvasKit's JS/WASM pair. `scripts/sync-viewer-assets.mjs` copies/builds
 * those files into `lib/viewer-assets`; this module validates that immutable
 * staging manifest and exposes a fixed, traversal-proof route.
 *
 * The controller deliberately degrades to `available === false` when the
 * default staging directory is absent. A headless or source-only install can
 * therefore keep using the PNG presentation path. An explicitly configured
 * invalid directory is treated as a configuration error and throws.
 * @module dsh-openpencil/viewer-assets
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** HTTP namespace owned by the read-only OpenPencil viewer assets. */
export declare const VIEWER_ASSET_ROUTE_PREFIX = "/_dsh/dsh-openpencil/viewer-assets";
/** Environment override for an externally staged viewer-asset directory. */
export declare const VIEWER_ASSET_DIR_ENV = "DSH_OPENPENCIL_VIEWER_ASSET_DIR";
/** The browser assets expected by the DSH read-only viewer. */
export declare const VIEWER_ASSET_FILES: readonly ["sdk.js", "op_web_sdk_bg.wasm", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm"];
export type ViewerAssetName = typeof VIEWER_ASSET_FILES[number];
/** URLs handed to the browser half of the plugin. */
export interface ViewerGrant {
    sdkUrl: string;
    wasmUrl: string;
    canvasKitBaseUrl: string;
}
interface ManifestFile {
    bytes: number;
    sha256: string;
}
interface VerifiedAsset extends ManifestFile {
    name: ViewerAssetName;
    path: string;
    mimeType: string;
    dev: number;
    ino: number;
}
/** Optional discovery controls, mainly useful to hosts and tests. */
export interface ViewerAssetOptions {
    assetDir?: string;
}
/**
 * Fixed-file controller for the staged SDK bundle.
 *
 * Use `prepareViewerAssets()` instead of constructing this directly. The
 * route attachment count mirrors `RenderAccessController`: browser grants
 * only appear while an HTTP route is actually mounted.
 */
export declare class ViewerAssetController {
    readonly assetDirectory: string | undefined;
    readonly unavailableReason: string | undefined;
    private readonly revision;
    private readonly assets;
    private routeCount;
    private constructor();
    static unavailable(reason: string): ViewerAssetController;
    static ready(directory: string, revision: string, assets: ReadonlyMap<ViewerAssetName, VerifiedAsset>): ViewerAssetController;
    /** Whether a complete, hash-verified SDK asset set was discovered. */
    get available(): boolean;
    /** Whether at least one HTTP carrier currently owns the asset route. */
    get routeAvailable(): boolean;
    /** Browser URLs, omitted unless both staging and the DSH route are ready. */
    get viewerGrant(): ViewerGrant | undefined;
    /** Mark one registered prefix route; dispose it when the host route unloads. */
    attachRoute(): () => void;
    /** Serve one allow-listed immutable asset over GET or HEAD. */
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
}
/** Discover and hash-verify the staged Web SDK assets. */
export declare function prepareViewerAssets(options?: ViewerAssetOptions): Promise<ViewerAssetController>;
export {};
