/** Full OpenPencil editor hosted in DSH's Tool details side panel. */
import type { PresentationGrant } from './index.js';
import { type EditorColorScheme, type EditorLocale } from './editor-bridge.js';
export interface LaunchResponse {
    sessionId: string;
    iframeUrl: string;
    token: string;
    saveUrl: string;
    selectionUrl?: string;
    closeUrl: string;
    docJson?: string;
    /** Client-only marker: the persisted launch capability was renewed. */
    renewed?: true;
}
export interface EditorBootResult {
    launch: LaunchResponse;
    documentJson: string;
}
export interface EditorPanelCopy {
    save: string;
    saving: string;
    unsaved: string;
    saved: string;
    unavailable: string;
    loading: string;
    errorTitle: string;
    pngFallback: string;
    editorTitle: (title: string) => string;
    editorTimeout: string;
    saveConflict: (serverVersion: number) => string;
    syncConflict: (serverVersion: number) => string;
}
/** Chrome copy for the locale already resolved by the DSH host. */
export declare function editorPanelCopy(locale: EditorLocale): EditorPanelCopy;
interface EditorBootOptions {
    signal?: AbortSignal;
    fetcher?: typeof fetch;
    sessionId?: string;
}
interface EditorCloseOptions {
    fetcher?: typeof fetch;
    dirty?: boolean;
    keepalive?: boolean;
}
/**
 * Launch one editor, renewing exactly once when a replayed launch capability
 * has expired. A refreshed capability is never persisted back into the Tool
 * block, and only same-origin control routes can receive document metadata.
 */
export declare function launchManagedEditor(editor: NonNullable<PresentationGrant['editor']>, document: NonNullable<PresentationGrant['document']>, options?: EditorBootOptions): Promise<LaunchResponse>;
/** Prefer the daemon's current source; fetch the immutable snapshot only for old hosts. */
export declare function prepareManagedEditor(editor: NonNullable<PresentationGrant['editor']>, document: NonNullable<PresentationGrant['document']>, options?: EditorBootOptions): Promise<EditorBootResult>;
/** Close exactly the managed session returned by one launch response. */
export declare function closeManagedEditorLaunch(launch: LaunchResponse, options?: EditorCloseOptions): Promise<void>;
/**
 * Mount-aware boot boundary. React may cancel an effect after its launch POST
 * has committed; release that precise returned session before ignoring it.
 */
export declare function prepareManagedEditorForMount(editor: NonNullable<PresentationGrant['editor']>, document: NonNullable<PresentationGrant['document']>, accept: () => boolean, options?: EditorBootOptions): Promise<EditorBootResult | undefined>;
/** Editable panel. The daemon is created lazily only while this component is mounted. */
export declare function ManagedOpenPencilEditor({ grant, colorScheme, locale, sessionId }: {
    grant: PresentationGrant;
    colorScheme: EditorColorScheme;
    locale: EditorLocale;
    sessionId: string;
}): import("react").JSX.Element;
export {};
