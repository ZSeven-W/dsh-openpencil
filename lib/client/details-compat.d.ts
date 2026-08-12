/** Compatibility boundary for DSH builds before the keyed Tool details seam. */
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { DetailsToolOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * rc.2 does not declare this slot. Declaring the same contract locally keeps
 * the plugin type-safe on rc.2 and is identical to the declaration shipped by
 * newer DSH builds. At runtime `slots.inject()` waits while a slot is absent,
 * so no registration is attempted until a supporting DSH host declares it.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'tool.details.toolview': {
            kind: 'keyed';
            scope: 'session';
            owner: DetailsToolOwnerProps;
        };
    }
}
/** Details props without importing a symbol absent from stock rc.2. */
export type CompatibleToolDetailsViewProps = PropsRuntime<'tool.details.toolview'>;
/** Call props with the additive newer-DSH sidebar capability. */
export type CompatibleToolCallViewProps = ToolCallViewProps & {
    openDetails?: (() => void) | undefined;
};
export type OpenPencilEditorSurface = 'details' | 'modal';
/** Prefer the native resident details panel and otherwise open our own modal. */
export declare function requestOpenPencilEditor(openDetails: (() => void) | undefined, openModal: () => void): OpenPencilEditorSurface;
