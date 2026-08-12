/** Page-local live selection store shared by the sidebar and conversation. */
const stores = new Map();
const listeners = new Map();
const EMPTY_SELECTION_STORE_SNAPSHOT = Object.freeze({ revision: 0 });
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function nodeOf(value) {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0)
        return undefined;
    return {
        id: value.id,
        ...(typeof value.type === 'string' && value.type.length > 0 ? { type: value.type } : {}),
        ...(typeof value.name === 'string' && value.name.length > 0 ? { name: value.name } : {}),
        ...(finite(value.x) === undefined ? {} : { x: finite(value.x) }),
        ...(finite(value.y) === undefined ? {} : { y: finite(value.y) }),
        ...(finite(value.width) === undefined ? {} : { width: finite(value.width) }),
        ...(finite(value.height) === undefined ? {} : { height: finite(value.height) }),
    };
}
export function liveSelectionOf(value) {
    if (!isRecord(value) || typeof value.sourcePath !== 'string' || value.sourcePath.length === 0)
        return undefined;
    return {
        sourcePath: value.sourcePath,
        activePageId: typeof value.activePageId === 'string' ? value.activePageId : '',
        selectedIds: Array.isArray(value.selectedIds)
            ? value.selectedIds.filter((id) => typeof id === 'string' && id.length > 0)
            : [],
        nodes: Array.isArray(value.nodes)
            ? value.nodes.map(nodeOf).filter((node) => node !== undefined)
            : [],
        updatedAt: finite(value.updatedAt) ?? Date.now(),
    };
}
function sameSelection(a, b) {
    if (a === undefined || b === undefined)
        return a === b;
    return a.sourcePath === b.sourcePath
        && a.activePageId === b.activePageId
        && JSON.stringify(a.selectedIds) === JSON.stringify(b.selectedIds)
        && JSON.stringify(a.nodes) === JSON.stringify(b.nodes);
}
export function publishOpenPencilSelection(sessionId, selection) {
    const current = stores.get(sessionId) ?? { revision: 0 };
    if (sameSelection(current.selection, selection))
        return;
    stores.set(sessionId, { revision: current.revision + 1, selection });
    for (const listener of listeners.get(sessionId) ?? [])
        listener();
}
export function clearOpenPencilSelection(sessionId, sourcePath) {
    const current = stores.get(sessionId);
    if (current === undefined)
        return;
    if (current.selection === undefined)
        return;
    if (sourcePath !== undefined && current.selection.sourcePath !== sourcePath)
        return;
    stores.set(sessionId, { revision: current.revision + 1 });
    for (const listener of listeners.get(sessionId) ?? [])
        listener();
}
export function subscribeOpenPencilSelection(sessionId, listener) {
    let scoped = listeners.get(sessionId);
    if (scoped === undefined) {
        scoped = new Set();
        listeners.set(sessionId, scoped);
    }
    scoped.add(listener);
    return () => {
        scoped?.delete(listener);
        if (scoped?.size === 0)
            listeners.delete(sessionId);
    };
}
export function getOpenPencilSelectionSnapshot(sessionId) {
    // useSyncExternalStore requires referentially stable snapshots while the
    // underlying state is unchanged. Returning a new empty object here causes
    // React to enter an update loop before the first selection poll completes.
    return stores.get(sessionId) ?? EMPTY_SELECTION_STORE_SNAPSHOT;
}
