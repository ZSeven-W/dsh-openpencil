/** Browser-side protocol helpers for the managed OpenPencil editor iframe. */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function safeInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function string(value) {
    return typeof value === 'string';
}
/** Parse only the editor/host messages DSH implements. Unknown traffic is ignored. */
export function parseEditorInbound(raw) {
    if (typeof raw !== 'string')
        return undefined;
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        return undefined;
    }
    if (!isRecord(value) || typeof value.type !== 'string')
        return undefined;
    switch (value.type) {
        case 'op-bridge/ready':
            return safeInteger(value.generation) && safeInteger(value.revision)
                ? { type: value.type, generation: value.generation, revision: value.revision }
                : undefined;
        case 'op-bridge/opened':
            return safeInteger(value.generation) ? { type: value.type, generation: value.generation } : undefined;
        case 'op-bridge/dirty-changed':
            return safeInteger(value.generation) && safeInteger(value.revision) && typeof value.dirty === 'boolean'
                ? { type: value.type, generation: value.generation, revision: value.revision, dirty: value.dirty }
                : undefined;
        case 'op-bridge/snapshot-result':
            return string(value.requestId) && string(value.docJson)
                && safeInteger(value.generation) && safeInteger(value.revision)
                ? {
                    type: value.type,
                    requestId: value.requestId,
                    docJson: value.docJson,
                    generation: value.generation,
                    revision: value.revision,
                }
                : undefined;
        case 'op-bridge/snapshot-conflict':
            return string(value.requestId) && safeInteger(value.serverVersion)
                ? { type: value.type, requestId: value.requestId, serverVersion: value.serverVersion }
                : undefined;
        case 'op-bridge/sync-conflict':
            return safeInteger(value.generation) && safeInteger(value.revision) && safeInteger(value.serverVersion)
                ? { type: value.type, generation: value.generation, revision: value.revision, serverVersion: value.serverVersion }
                : undefined;
        case 'op-bridge/conflict-resolved':
            return string(value.requestId) ? { type: value.type, requestId: value.requestId } : undefined;
        case 'op-shell/save':
            return { type: value.type };
        case 'op-shell/copy':
            return string(value.text) ? { type: value.type, text: value.text } : undefined;
        default:
            return undefined;
    }
}
export function encodeEditorOutbound(message) {
    return JSON.stringify(message);
}
/** Require an absolute loopback editor URL and derive its exact target origin. */
export function editorOrigin(iframeUrl) {
    const url = new URL(iframeUrl);
    const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1';
    if (!loopback || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
        throw new Error('OpenPencil editor URL must use an HTTP loopback origin');
    }
    return url.origin;
}
/** Pin the host's resolved theme into the editor's first navigation. */
export function editorIframeUrlWithTheme(iframeUrl, colorScheme) {
    const url = new URL(iframeUrl);
    url.searchParams.set('theme', colorScheme);
    return url.href;
}
/** Pin the host's resolved locale into the editor's first navigation. */
export function editorIframeUrlWithLocale(iframeUrl, locale) {
    const url = new URL(iframeUrl);
    url.searchParams.set('locale', locale);
    return url.href;
}
/** Translate DSH's compact locale id to the editor's BCP 47 contract. */
export function editorLocaleFromDsh(locale) {
    return locale === 'zh' ? 'zh-CN' : 'en-US';
}
/** Resolve a launch/save/close capability and reject cross-origin control routes. */
export function editorControlUrl(raw, base = window.location.href) {
    const page = new URL(base);
    const url = new URL(raw, page);
    if (url.origin !== page.origin)
        throw new Error('OpenPencil editor control URL must be same-origin');
    return url.href;
}
/** Validate source and exact origin before parsing any iframe message. */
export function editorMessageFrom(event, frameWindow, origin) {
    if (frameWindow === null || event.source !== frameWindow || event.origin !== origin)
        return undefined;
    return parseEditorInbound(event.data);
}
let activeEditor;
/** Page-wide single-editor coordinator. Opening a new document closes the old daemon. */
export function claimEditor(token, close) {
    const previous = activeEditor;
    activeEditor = { token, close };
    if (previous !== undefined && previous.token !== token)
        previous.close();
    return () => {
        if (activeEditor?.token === token)
            activeEditor = undefined;
    };
}
/** Confirm before a user-driven panel close would discard unsaved canvas edits. */
export function confirmEditorClose(dirty, confirm = window.confirm) {
    return !dirty || confirm('OpenPencil has unsaved changes. Close the editor and discard them?');
}
