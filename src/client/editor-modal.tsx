/** Managed OpenPencil editor fallback for DSH builds without Tool details. */

import { useCallback, useEffect, useId, useRef } from 'react'
import type { PresentationGrant } from './index.js'
import { confirmEditorClose, type EditorColorScheme, type EditorLocale } from './editor-bridge.js'
import { ManagedOpenPencilEditor } from './editor-panel.js'

interface EditorModalCopy {
  title: string
  close: string
  discard: string
}

const EDITOR_MODAL_COPY: Record<EditorLocale, EditorModalCopy> = {
  'zh-CN': {
    title: 'OpenPencil 编辑器',
    close: '关闭',
    discard: 'OpenPencil 中有未保存的更改，确定关闭并放弃吗？',
  },
  'en-US': {
    title: 'OpenPencil editor',
    close: 'Close',
    discard: 'OpenPencil has unsaved changes. Close and discard them?',
  },
}

export function editorModalCopy(locale: EditorLocale): EditorModalCopy {
  return EDITOR_MODAL_COPY[locale]
}

/** Read the editor's durable dirty marker before allowing the modal to close. */
export function confirmEditorModalClose(
  root: Pick<ParentNode, 'querySelector'> | null,
  message: string,
  confirm = window.confirm,
): boolean {
  const dirty = (root?.querySelector('[data-tool-details-dirty="true"]') ?? null) !== null
  return confirmEditorClose(dirty, () => confirm(message))
}

const modalStyles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 2147483000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, background: 'rgba(0,0,0,0.72)',
  },
  dialog: {
    width: 'min(1440px, 96vw)', height: 'min(960px, 94vh)', minWidth: 0, minHeight: 0,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.5))', borderRadius: 10,
    color: 'var(--dsw-alias-label-primary, #eee)', background: 'var(--dsw-alias-bg-base, #17171a)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
  },
  header: {
    minHeight: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
    borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3))',
  },
  title: {
    minWidth: 0, marginRight: 'auto', overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', fontSize: 13,
  },
  close: {
    minHeight: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.45))', borderRadius: 6,
    color: 'var(--dsw-alias-label-primary, inherit)', background: 'var(--dsw-alias-bg-layer-1, transparent)',
    padding: '4px 9px', cursor: 'pointer', font: 'inherit', fontSize: 12, lineHeight: 1,
  },
  body: { flex: 1, minHeight: 0, overflow: 'hidden' },
}

export function ManagedOpenPencilEditorModal({
  grant,
  colorScheme,
  locale,
  sessionId,
  onClose,
}: {
  grant: PresentationGrant
  colorScheme: EditorColorScheme
  locale: EditorLocale
  sessionId: string
  onClose: () => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const copy = editorModalCopy(locale)

  const requestClose = useCallback(() => {
    if (!confirmEditorModalClose(bodyRef.current, copy.discard)) return
    onClose()
  }, [copy.discard, onClose])

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [requestClose])

  return (
    <div
      style={modalStyles.backdrop}
      role="presentation"
      data-openpencil-editor-modal="true"
      onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}
    >
      <section style={modalStyles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div style={modalStyles.header}>
          <strong id={titleId} style={modalStyles.title}>{copy.title}</strong>
          <button ref={closeRef} type="button" style={modalStyles.close} onClick={requestClose}>{copy.close}</button>
        </div>
        <div ref={bodyRef} style={modalStyles.body}>
          <ManagedOpenPencilEditor
            grant={grant}
            colorScheme={colorScheme}
            locale={locale}
            sessionId={sessionId}
          />
        </div>
      </section>
    </div>
  )
}
