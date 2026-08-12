/** Managed OpenPencil editor fallback for DSH builds without Tool details. */
import type { PresentationGrant } from './index.js';
import { type EditorColorScheme, type EditorLocale } from './editor-bridge.js';
interface EditorModalCopy {
    title: string;
    close: string;
    discard: string;
}
export declare function editorModalCopy(locale: EditorLocale): EditorModalCopy;
/** Read the editor's durable dirty marker before allowing the modal to close. */
export declare function confirmEditorModalClose(root: Pick<ParentNode, 'querySelector'> | null, message: string, confirm?: ((message?: string) => boolean) & typeof globalThis.confirm): boolean;
export declare function ManagedOpenPencilEditorModal({ grant, colorScheme, locale, sessionId, onClose, }: {
    grant: PresentationGrant;
    colorScheme: EditorColorScheme;
    locale: EditorLocale;
    sessionId: string;
    onClose: () => void;
}): import("react").JSX.Element;
export {};
