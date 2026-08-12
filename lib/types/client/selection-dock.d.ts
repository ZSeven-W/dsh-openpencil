/** Live OpenPencil selection chip rendered above the DSH composer. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type OpenPencilLiveSelection } from './selection-store.js';
import type { PresentationLocale } from './index.js';
export declare const OPENPENCIL_SELECTION_DOCK_LAYOUT: {
    readonly boxSizing: "border-box";
    readonly flex: "none";
    readonly width: "calc(100% - var(--dsh-composer-side-clearance, 16px) - var(--dsh-composer-side-clearance, 16px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px))";
    readonly maxWidth: "calc(var(--dsh-composer-card-max-width, 780px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px))";
    readonly margin: "0 auto";
};
export declare function hasOpenPencilSelection(selection: OpenPencilLiveSelection | undefined): selection is OpenPencilLiveSelection;
export declare function selectionNodeLabel(selection: OpenPencilLiveSelection, locale: PresentationLocale): string;
export declare function selectionNodeDetail(selection: OpenPencilLiveSelection, locale: PresentationLocale): string;
export type OpenPencilSelectionDockProps = PropsRuntime<'conversation.input.dock'> & {
    locale: PresentationLocale;
};
export declare function OpenPencilSelectionDock({ sessionId, locale }: OpenPencilSelectionDockProps): import("react").JSX.Element | null;
