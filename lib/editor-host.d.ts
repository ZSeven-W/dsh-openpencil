/** Lazy managed OpenPencil editor sessions for the DSH details panel. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { type OpenPencilMcpResult, type OpenPencilSelectionSnapshot } from './mcp-client.js';
export declare const EDITOR_ROUTE_PREFIX = "/_dsh/dsh-openpencil/editor";
export interface EditorGrant {
    enabled: true;
    launchUrl: string;
    refreshUrl: string;
}
export type OpenPencilLiveTool = 'get_selection' | 'update_node' | 'batch_design';
export interface ActiveMcpCallOptions {
    /** Refuse to drive a different transcript card's live editor. */
    sourcePath?: string;
    ownerSessionId?: string;
    signal?: AbortSignal;
}
/** Locate the GUI-free managed host used by op-vscode. */
export declare function findEditorHostBinary(): string | undefined;
/** Owns opaque launch capabilities and all live managed editor children. */
export declare class EditorHostController {
    #private;
    readonly binary: string | undefined;
    constructor(masterKey: Buffer);
    get available(): boolean;
    get routeAvailable(): boolean;
    attachRoute(): () => void;
    /** Mint an opaque, runtime-only launch URL; no source path enters metadata. */
    grantFor(sourcePath: string | undefined, sourceSha256: string | undefined): EditorGrant | undefined;
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
    dispose(): Promise<void>;
    /** Current live editor selection, suitable for Agent context and UI chips. */
    getActiveSelection(options?: ActiveMcpCallOptions): Promise<OpenPencilSelectionSnapshot>;
    /**
     * Drive one allowlisted first-party MCP tool on the currently visible
     * editor. The managed daemon token never crosses this controller boundary.
     */
    callActiveMcp(tool: OpenPencilLiveTool, args: Record<string, unknown>, options?: ActiveMcpCallOptions): Promise<OpenPencilMcpResult>;
}
