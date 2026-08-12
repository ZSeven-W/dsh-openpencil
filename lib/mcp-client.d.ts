/** Strict loopback JSON-RPC client for one managed OpenPencil editor. */
export interface OpenPencilNodeSummary {
    id: string;
    type?: string;
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export interface OpenPencilSelectionSnapshot {
    sourcePath: string;
    activePageId: string;
    selectedIds: string[];
    nodes: OpenPencilNodeSummary[];
    updatedAt: number;
}
export interface OpenPencilMcpResult {
    tool: string;
    value: unknown;
    text: string;
}
interface McpCallOptions {
    baseUrl: string;
    token: string;
    tool: string;
    arguments?: Record<string, unknown>;
    signal?: AbortSignal;
    fetcher?: typeof fetch;
}
interface McpVersionOptions {
    baseUrl: string;
    token: string;
    signal?: AbortSignal;
    fetcher?: typeof fetch;
}
/** Decode a JSON-RPC tools/call envelope, including MCP's HTTP-200 errors. */
export declare function parseOpenPencilMcpResponse(tool: string, value: unknown): OpenPencilMcpResult;
/** Call a first-party tool on a managed editor without exposing its daemon token. */
export declare function callOpenPencilMcp(options: McpCallOptions): Promise<OpenPencilMcpResult>;
/** Probe the daemon document version before and after a write. */
export declare function getOpenPencilMcpVersion(options: McpVersionOptions): Promise<number>;
/** Project get_selection into the bounded shape shared with the DSH client. */
export declare function selectionSnapshotFromMcp(sourcePath: string, value: unknown, updatedAt?: number): OpenPencilSelectionSnapshot;
export {};
