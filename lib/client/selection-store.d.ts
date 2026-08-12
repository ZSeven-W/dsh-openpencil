/** Page-local live selection store shared by the sidebar and conversation. */
export interface OpenPencilNodeSelection {
    id: string;
    type?: string;
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export interface OpenPencilLiveSelection {
    sourcePath: string;
    activePageId: string;
    selectedIds: string[];
    nodes: OpenPencilNodeSelection[];
    updatedAt: number;
}
export interface OpenPencilSelectionStoreSnapshot {
    revision: number;
    selection?: OpenPencilLiveSelection;
}
export declare function liveSelectionOf(value: unknown): OpenPencilLiveSelection | undefined;
export declare function publishOpenPencilSelection(sessionId: string, selection: OpenPencilLiveSelection): void;
export declare function clearOpenPencilSelection(sessionId: string, sourcePath?: string): void;
export declare function subscribeOpenPencilSelection(sessionId: string, listener: () => void): () => void;
export declare function getOpenPencilSelectionSnapshot(sessionId: string): OpenPencilSelectionStoreSnapshot;
