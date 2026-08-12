/** Lifecycle-safe polling for the optional OpenPencil live-selection endpoint. */
const DEFAULT_INTERVAL_MS = 400;
const DEFAULT_TIMER = {
    schedule: (callback, delayMs) => setTimeout(callback, delayMs),
    cancel: handle => { clearTimeout(handle); },
};
/** Client failures other than retry-oriented HTTP statuses cannot recover by polling. */
export function isTerminalEditorSelectionStatus(status) {
    return status >= 400 && status < 500 && status !== 408 && status !== 425 && status !== 429;
}
/**
 * Start one immediate poll followed by non-overlapping delayed polls.
 *
 * The returned cleanup is idempotent, aborts an in-flight request, cancels the
 * pending timer, and invokes `onStop` exactly once. Terminal HTTP responses
 * use the same cleanup path; network errors and retryable statuses schedule a
 * later attempt without disrupting the editor itself.
 */
export function startEditorSelectionPolling(options) {
    const fetcher = options.fetcher ?? fetch;
    const timer = options.timer ?? DEFAULT_TIMER;
    const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
    let stopped = false;
    let timerHandle;
    let requestAbort;
    const stop = () => {
        if (stopped)
            return;
        stopped = true;
        if (timerHandle !== undefined) {
            timer.cancel(timerHandle);
            timerHandle = undefined;
        }
        requestAbort?.abort();
        requestAbort = undefined;
        options.onStop();
    };
    const schedule = () => {
        if (stopped)
            return;
        timerHandle = timer.schedule(() => {
            timerHandle = undefined;
            void poll();
        }, intervalMs);
    };
    const poll = async () => {
        if (stopped)
            return;
        const abort = new AbortController();
        requestAbort = abort;
        try {
            const response = await fetcher(options.url, {
                credentials: 'same-origin',
                signal: abort.signal,
            });
            if (stopped)
                return;
            if (isTerminalEditorSelectionStatus(response.status)) {
                stop();
                return;
            }
            if (response.ok) {
                const value = await response.json();
                if (!stopped)
                    options.onValue(value);
            }
        }
        catch {
            // Selection is an enhancement. Transient transport failures retry later.
        }
        finally {
            if (requestAbort === abort)
                requestAbort = undefined;
            schedule();
        }
    };
    void poll();
    return stop;
}
