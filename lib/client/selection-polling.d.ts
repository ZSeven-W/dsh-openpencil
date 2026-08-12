/** Lifecycle-safe polling for the optional OpenPencil live-selection endpoint. */
export interface SelectionPollTimer {
    schedule(callback: () => void, delayMs: number): unknown;
    cancel(handle: unknown): void;
}
export interface EditorSelectionPollingOptions {
    url: string;
    onValue(value: unknown): void;
    onStop(): void;
    fetcher?: typeof fetch;
    intervalMs?: number;
    timer?: SelectionPollTimer;
}
/** Client failures other than retry-oriented HTTP statuses cannot recover by polling. */
export declare function isTerminalEditorSelectionStatus(status: number): boolean;
/**
 * Start one immediate poll followed by non-overlapping delayed polls.
 *
 * The returned cleanup is idempotent, aborts an in-flight request, cancels the
 * pending timer, and invokes `onStop` exactly once. Terminal HTTP responses
 * use the same cleanup path; network errors and retryable statuses schedule a
 * later attempt without disrupting the editor itself.
 */
export declare function startEditorSelectionPolling(options: EditorSelectionPollingOptions): () => void;
