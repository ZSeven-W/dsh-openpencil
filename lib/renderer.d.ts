/**
 * Offscreen rendering + signed HTTP delivery for `.op` documents.
 *
 * `openpencil_render` snapshots the source document, uses OpenPencil's own
 * headless exporter for design-fidelity PNG output, retaining every
 * top-level frame for the conversation gallery, and only invokes Jian
 * as an explicitly disclosed runtime-preview fallback when the exact binary
 * is unavailable. Content-addressed image/document capabilities bind name,
 * byte length, and SHA-256 without exposing arbitrary host paths. Serving
 * refuses symbolic links so a delivered artifact cannot be redirected.
 *
 * Model-visible result values stay plain JSON; the browser-only envelope
 * rides `presentationMeta` (see `tool.ts`). Never return an ImageBlock.
 * @module dsh-openpencil/renderer
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { JsonValue } from '@deepseek-ai/dsh-tools';
import type { ViewerGrant } from './viewer-assets.js';
import type { EditorGrant } from './editor-host.js';
import { OPENPENCIL_RENDER_TOOL_NAME } from './tool-names.js';
/** HTTP prefix owned by the render capability route. */
export declare const RENDER_ROUTE_PREFIX = "/_dsh/dsh-openpencil/render";
/** Presentation metadata key reserved by the browser half of this package. */
export declare const PRESENTATION_META_KEY = "$dshOpenPencil";
/** Refuse to deliver anything above this size (also enforced at render time). */
export declare const MAX_RENDER_BYTES: number;
/** Refuse unusually large source documents before copying them into managed state. */
export declare const MAX_DOCUMENT_BYTES: number;
/** One render delivery capability. */
interface LegacyRenderTokenPayload {
    v: 1;
    path: string;
    filename: string;
    bytes: number;
}
interface ArtifactTokenPayload {
    v: 2;
    kind: 'image' | 'document';
    filename: string;
    bytes: number;
    sha256: string;
}
type RenderTokenPayload = LegacyRenderTokenPayload | ArtifactTokenPayload;
/** Browser grant paired to one rendered PNG. */
export interface RenderGrant {
    path: string;
    previewUrl: string;
    downloadUrl: string;
    width?: number;
    height?: number;
    id?: string;
    name?: string;
    index?: number;
}
/** One immutable top-level frame retained from an exact render. */
export interface RenderFrame {
    path: string;
    filename: string;
    mimeType: 'image/png';
    bytes: number;
    width: number;
    height: number;
    sha256: string;
    /** Canonical top-level node identity and user-facing name. */
    id?: string;
    name?: string;
    index?: number;
}
export interface DocumentSnapshot {
    path: string;
    filename: string;
    mimeType: 'application/json';
    bytes: number;
    sha256: string;
}
export interface DocumentGrant extends DocumentSnapshot {
    url: string;
    previewUrl: string;
    downloadUrl: string;
}
/** Canonical result shape the tool returns and the envelope enriches. */
export interface RenderResult {
    path: string;
    filename: string;
    mimeType: 'image/png';
    kind: 'image';
    description: string;
    sourceTool: typeof OPENPENCIL_RENDER_TOOL_NAME;
    previewIntent: 'image';
    bytes: number;
    width?: number;
    height?: number;
    sha256?: string;
    sourcePath?: string;
    renderer?: 'openpencil' | 'jian';
    rendererBinary?: string;
    fidelity?: 'exact' | 'runtime-preview';
    warnings?: string[];
    /** Ordered top-level frames. The first entry is also exposed by legacy image fields. */
    frames?: RenderFrame[];
    frameCount?: number;
    editable?: boolean;
    document?: DocumentSnapshot;
    note?: string;
}
/** Plugin-managed state root (mirrors the dsh-vision-toolkit convention). */
export declare function stateRoot(): string;
/** Plugin-managed render output directory. */
export declare function renderDir(): string;
/** Content-addressed immutable `.op` snapshots served to the web viewer. */
export declare function snapshotDir(): string;
/** Load or atomically create the per-DSH-home signing key. */
export declare function prepareRenderAccessKey(): Promise<Buffer>;
/** Signed render-capability encoder and safe route handler. */
export declare class RenderAccessController {
    private readonly key;
    private routeCount;
    constructor(key: Buffer);
    /** Whether at least one HTTP carrier currently owns the route. */
    get routeAvailable(): boolean;
    /** Mark one route attachment; the returned disposer removes that attachment. */
    attachRoute(): () => void;
    /** Mint a deterministic, tamper-evident capability for one render result. */
    sign(result: RenderResult): string;
    /** Mint an immutable capability without embedding an absolute local path. */
    signArtifact(artifact: Omit<ArtifactTokenPayload, 'v'>): string;
    /** Verify and decode one capability without touching the filesystem. */
    verify(token: string): RenderTokenPayload | undefined;
    /** Serve one GET/HEAD capability request. */
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
}
/** Expand `~` / `~/` prefixes (the model frequently writes home-relative paths). */
export declare function expandUserHome(raw: string): string;
/**
 * Validate the `.op` input path: expand `~`, resolve against the session
 * workspace, realpath, and require a regular `.op` file.
 */
export declare function resolveInputFile(raw: string, cwd: string): Promise<string>;
/** Freeze source bytes before rendering so preview and web viewer cannot diverge. */
export declare function createDocumentSnapshot(input: string): Promise<DocumentSnapshot>;
/** Locate the exact OpenPencil renderer, preferring an explicit override. */
export declare function findOpenPencilBinary(): string | undefined;
/** Locate the `jian` binary: env override, known build location, then PATH. */
export declare function findJianBinary(): string;
/** Parse the physical size from `jian render`'s success line. */
export declare function parseRenderSize(stdout: string): {
    width?: number;
    height?: number;
};
/**
 * Run `jian render` for one input and wait for the PNG on disk.
 * Observes `signal` so caller cancellation stops the child promptly.
 */
export declare function runJianRender(options: {
    binary: string;
    input: string;
    out: string;
    width?: number;
    height?: number;
    scale?: number;
    signal: AbortSignal;
}): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare class RendererBinaryMissingError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/** Render all top-level active-page nodes through OpenPencil's exact scene exporter. */
export declare function runOpenPencilRender(options: {
    binary: string;
    input: string;
    scale?: number;
    signal: AbortSignal;
}): Promise<{
    png: string;
    frames: Array<{
        png: string;
        id?: string;
        name?: string;
        index: number;
    }>;
    warnings: string[];
    stdout: string;
    stderr: string;
}>;
/**
 * Purely enrich a canonical tool-result value with a browser render grant.
 * Returns the value unchanged when no route/artifact exists.
 */
export declare function projectRenderGrant(value: JsonValue, controller: RenderAccessController, viewer?: ViewerGrant, editor?: EditorGrant): JsonValue;
/** Reserve a fresh output path inside the managed render directory. */
export declare function createRenderOutput(): Promise<string>;
/** Stat + cap-check a freshly rendered PNG. */
export declare function verifyRenderOutput(out: string): Promise<{
    bytes: number;
    width: number;
    height: number;
    sha256: string;
}>;
export {};
