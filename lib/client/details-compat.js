/** Compatibility boundary for DSH builds before the keyed Tool details seam. */
/** Prefer the native resident details panel and otherwise open our own modal. */
export function requestOpenPencilEditor(openDetails, openModal) {
    if (openDetails !== undefined) {
        openDetails();
        return 'details';
    }
    openModal();
    return 'modal';
}
