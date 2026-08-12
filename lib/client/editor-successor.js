/** Session-scoped successor capabilities for reopening a saved editor card. */
import { editorControlUrl } from './editor-bridge.js';
const STORAGE_PREFIX = 'dsh-openpencil:editor-successor:v1:';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function browserStorage() {
    try {
        return window.sessionStorage;
    }
    catch {
        return undefined;
    }
}
function storageOf(options) {
    return options.storage === undefined ? browserStorage() : options.storage ?? undefined;
}
function baseUrlOf(options) {
    return options.baseUrl ?? window.location.href;
}
/** The original Tool grant scopes one successor chain for the life of this tab. */
export function editorSuccessorStorageKey(originalLaunchUrl, baseUrl = window.location.href) {
    return `${STORAGE_PREFIX}${editorControlUrl(originalLaunchUrl, baseUrl)}`;
}
function persistedSuccessorOf(value, baseUrl) {
    if (!isRecord(value))
        return undefined;
    const launchUrl = value.launchUrl;
    const refreshUrl = value.refreshUrl;
    if (typeof launchUrl !== 'string' || launchUrl.length === 0
        || typeof refreshUrl !== 'string' || refreshUrl.length === 0)
        return undefined;
    try {
        return {
            launchUrl: editorControlUrl(launchUrl, baseUrl),
            refreshUrl: editorControlUrl(refreshUrl, baseUrl),
        };
    }
    catch {
        return undefined;
    }
}
/** Parse only the successor grant from a successful save response. */
export function editorSuccessorFromSave(value, baseUrl = window.location.href) {
    if (!isRecord(value) || !isRecord(value.editor) || value.editor.enabled !== true)
        return undefined;
    const persisted = persistedSuccessorOf(value.editor, baseUrl);
    return persisted === undefined ? undefined : { enabled: true, ...persisted };
}
/**
 * Persist the newest save successor under the immutable Tool grant. Invalid or
 * absent successors clear an older value so a later reopen cannot use a stale
 * source capability. Storage denial is intentionally non-fatal to saving.
 */
export function rememberEditorSuccessor(originalLaunchUrl, saveResponse, options = {}) {
    const baseUrl = baseUrlOf(options);
    const successor = editorSuccessorFromSave(saveResponse, baseUrl);
    const storage = storageOf(options);
    if (storage === undefined)
        return successor;
    try {
        const key = editorSuccessorStorageKey(originalLaunchUrl, baseUrl);
        if (successor === undefined || successor.refreshUrl === undefined) {
            storage.removeItem(key);
            return undefined;
        }
        // Deliberately persist no document path/JSON, daemon token, or response fields.
        storage.setItem(key, JSON.stringify({
            launchUrl: successor.launchUrl,
            refreshUrl: successor.refreshUrl,
        }));
    }
    catch {
        // sessionStorage can be denied or full; the original Tool grant remains usable.
    }
    return successor;
}
/** Resolve a saved successor, falling back to the original Tool grant safely. */
export function editorGrantForBoot(original, options = {}) {
    const storage = storageOf(options);
    if (storage === undefined)
        return original;
    const baseUrl = baseUrlOf(options);
    let key;
    try {
        key = editorSuccessorStorageKey(original.launchUrl, baseUrl);
    }
    catch {
        return original;
    }
    try {
        const raw = storage.getItem(key);
        if (raw === null)
            return original;
        const successor = persistedSuccessorOf(JSON.parse(raw), baseUrl);
        if (successor !== undefined)
            return { enabled: true, ...successor };
    }
    catch {
        // Corrupt JSON and denied reads both fall through to best-effort cleanup.
    }
    try {
        storage.removeItem(key);
    }
    catch {
        // Ignore cleanup failures and keep using the original grant.
    }
    return original;
}
