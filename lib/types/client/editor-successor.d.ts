/** Session-scoped successor capabilities for reopening a saved editor card. */
export interface EditorSuccessorGrant {
    enabled: true;
    launchUrl: string;
    refreshUrl?: string;
}
export interface EditorSessionStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
interface SuccessorOptions {
    storage?: EditorSessionStorage | null;
    baseUrl?: string;
}
/** The original Tool grant scopes one successor chain for the life of this tab. */
export declare function editorSuccessorStorageKey(originalLaunchUrl: string, baseUrl?: string): string;
/** Parse only the successor grant from a successful save response. */
export declare function editorSuccessorFromSave(value: unknown, baseUrl?: string): EditorSuccessorGrant | undefined;
/**
 * Persist the newest save successor under the immutable Tool grant. Invalid or
 * absent successors clear an older value so a later reopen cannot use a stale
 * source capability. Storage denial is intentionally non-fatal to saving.
 */
export declare function rememberEditorSuccessor(originalLaunchUrl: string, saveResponse: unknown, options?: SuccessorOptions): EditorSuccessorGrant | undefined;
/** Resolve a saved successor, falling back to the original Tool grant safely. */
export declare function editorGrantForBoot(original: EditorSuccessorGrant, options?: SuccessorOptions): EditorSuccessorGrant;
export {};
