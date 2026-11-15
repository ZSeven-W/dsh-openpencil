/**
 * `openpencilOpTab` namespace dictionaries.
 *
 * The tab body is a launcher: it either disappears (the workbench opened and
 * the tab closed itself) or it explains which step failed — the address, the
 * Host grant, or the workbench itself — each suggesting a different next step.
 */

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  resolving: '正在打开文件…',
  opening: '正在启动编辑器…',
  retry: '重试',
  close: '关闭',
  notSessionFile: '该地址不是当前会话工作区内的文件',
  hostRejected: '打开请求被拒绝（{status}）',
  editorUnavailable: 'OpenPencil 编辑器当前不可用',
  workbenchRejected: '编辑器工作台未能打开该文件',
} satisfies Record<string, string>

/** Open-tab dictionary key union. */
export type OpenpencilOpTabKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  resolving: 'Opening the file...',
  opening: 'Launching the editor...',
  retry: 'Retry',
  close: 'Close',
  notSessionFile: 'This address is not a file in the current session workspace',
  hostRejected: 'The open request was rejected ({status})',
  editorUnavailable: 'The OpenPencil editor is currently unavailable',
  workbenchRejected: 'The editor workbench could not open this file',
} satisfies Record<OpenpencilOpTabKey, string>
