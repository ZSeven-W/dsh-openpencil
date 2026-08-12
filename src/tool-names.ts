/** Canonical model-facing OpenPencil tool names. */
export const OPENPENCIL_RENDER_TOOL_NAME = 'openpencil_render' as const
export const OPENPENCIL_SELECTION_TOOL_NAME = 'openpencil_selection' as const
export const OPENPENCIL_CREATE_TOOL_NAME = 'openpencil_create' as const
export const OPENPENCIL_EDIT_TOOL_NAME = 'openpencil_edit' as const

/**
 * Historical render name retained only by the browser presentation layer so
 * existing conversation cards and details panels remain replayable. The host
 * deliberately does not register this alias as a model-facing tool.
 */
export const LEGACY_DESIGN_RENDER_TOOL_NAME = 'design_render' as const

export const OPENPENCIL_TOOL_NAMES = [
  OPENPENCIL_RENDER_TOOL_NAME,
  OPENPENCIL_SELECTION_TOOL_NAME,
  OPENPENCIL_CREATE_TOOL_NAME,
  OPENPENCIL_EDIT_TOOL_NAME,
] as const
