/** Browser-side protocol helpers for the managed OpenPencil editor iframe. */
export type EditorInboundMessage = {
    type: 'op-bridge/ready';
    generation: number;
    revision: number;
} | {
    type: 'op-bridge/opened';
    generation: number;
} | {
    type: 'op-bridge/dirty-changed';
    generation: number;
    revision: number;
    dirty: boolean;
} | {
    type: 'op-bridge/snapshot-result';
    requestId: string;
    docJson: string;
    generation: number;
    revision: number;
} | {
    type: 'op-bridge/snapshot-conflict';
    requestId: string;
    serverVersion: number;
} | {
    type: 'op-bridge/sync-conflict';
    generation: number;
    revision: number;
    serverVersion: number;
} | {
    type: 'op-bridge/conflict-resolved';
    requestId: string;
} | {
    type: 'op-shell/save';
} | {
    type: 'op-shell/copy';
    text: string;
};
export type EditorOutboundMessage = {
    type: 'op-bridge/init';
    token: string;
    mcpUrl?: string;
} | {
    type: 'op-bridge/theme';
    colorScheme: EditorColorScheme;
} | {
    type: 'op-bridge/locale';
    locale: EditorLocale;
} | {
    type: 'op-bridge/open-document';
    json: string;
} | {
    type: 'op-bridge/snapshot';
    purpose: 'save';
    requestId: string;
} | {
    type: 'op-bridge/save-committed';
    generation: number;
    revision: number;
};
export type EditorColorScheme = 'light' | 'dark';
export type EditorLocale = 'zh-CN' | 'en-US';
/** Parse only the editor/host messages DSH implements. Unknown traffic is ignored. */
export declare function parseEditorInbound(raw: unknown): EditorInboundMessage | undefined;
export declare function encodeEditorOutbound(message: EditorOutboundMessage): string;
/** Require an absolute loopback editor URL and derive its exact target origin. */
export declare function editorOrigin(iframeUrl: string): string;
/** Pin the host's resolved theme into the editor's first navigation. */
export declare function editorIframeUrlWithTheme(iframeUrl: string, colorScheme: EditorColorScheme): string;
/** Pin the host's resolved locale into the editor's first navigation. */
export declare function editorIframeUrlWithLocale(iframeUrl: string, locale: EditorLocale): string;
/** Translate DSH's compact locale id to the editor's BCP 47 contract. */
export declare function editorLocaleFromDsh(locale: 'zh' | 'en'): EditorLocale;
/** Resolve a launch/save/close capability and reject cross-origin control routes. */
export declare function editorControlUrl(raw: string, base?: string): string;
/** Validate source and exact origin before parsing any iframe message. */
export declare function editorMessageFrom(event: Pick<MessageEvent, 'source' | 'origin' | 'data'>, frameWindow: Window | null, origin: string): EditorInboundMessage | undefined;
/** Page-wide single-editor coordinator. Opening a new document closes the old daemon. */
export declare function claimEditor(token: symbol, close: () => void): () => void;
/** Confirm before a user-driven panel close would discard unsaved canvas edits. */
export declare function confirmEditorClose(dirty: boolean, confirm?: ((message?: string) => boolean) & typeof globalThis.confirm): boolean;
