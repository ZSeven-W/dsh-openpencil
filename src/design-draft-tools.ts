/** Model-facing orchestration for OpenPencil's complete, unpublished design pipeline. */

import { createHash } from 'node:crypto'
import { copyFile, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, join } from 'node:path'
import type FileSystem from '@deepseek-ai/dsh-fs'
import type { FsObservation, FsTarget } from '@deepseek-ai/dsh-fs'
import type SandboxPolicyService from '@deepseek-ai/dsh-sandbox-policy'
import { defineTool, type JsonValue, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { inspectGeneratedDesignQuality } from './design-quality.js'
import type {
  DesignDraftCallResult,
  DesignDraftController,
  DesignDraftScreenshot,
} from './design-draft-controller.js'
import type { EditorHostController } from './editor-host.js'
import {
  type DocumentSnapshot,
  RenderAccessController,
  createRenderOutput,
  createDocumentSnapshotFromText,
  projectImageArtifactGrant,
  projectDocumentGrant,
  renderDir,
  stateRoot,
  verifyRenderOutput,
  type RenderFrame,
} from './renderer.js'
import {
  OPENPENCIL_PIPELINE_ABORT_TOOL_NAME,
  OPENPENCIL_PIPELINE_BATCH_TOOL_NAME,
  OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME,
  OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME,
  OPENPENCIL_PIPELINE_FINISH_TOOL_NAME,
  OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME,
} from './tool-names.js'

const MAX_BRIEF_LENGTH = 64 * 1024
const MAX_BATCH_LENGTH = 256 * 1024
const MAX_SCREENSHOT_BYTES = 16 * 1024 * 1024
const MAX_TARGETED_CONTEXT_CALLS = 4
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const EXPLICIT_MOBILE_BRIEF = /(?:\b(?:mobile|phone|iphone|ios|android)\b|移动(?:端|应用|界面)?|手机(?:端|应用|界面)?)/iu
const EXPLICIT_CANVAS_SIZE = /(?:^|\D)(\d{3,4})\s*(?:x|×|✕|\*)\s*(\d{3,5})(?:\D|$)/iu

const CONTEXT_TOOLS = [
  'get_guidelines',
  'get_style_guide',
  'list_style_guides',
  'get_variables',
  'get_active_theme',
  'set_variables',
  'set_themes',
  'set_active_axis_value',
  'list_ui_kits',
  'list_components',
  'get_component',
  'batch_get',
  'read_nodes',
  'find_empty_space',
  'get_canvas_bounds',
  'apply_design_system',
  'enrich_images',
] as const

type ContextTool = typeof CONTEXT_TOOLS[number]

export interface DesignDraftToolServices {
  fs: FileSystem
  sandboxPolicy: SandboxPolicyService
  render: RenderAccessController
  observe(target: FsTarget, observation: FsObservation, exec: ToolRunContext): void
  /** Test seam and pre-commit artifact builder; defaults to the real cache. */
  createDocumentSnapshot?: typeof createDocumentSnapshotFromText
}

interface PendingPublication {
  ownerSessionId: string
  requestedPath: string
  processPath: string
  target: FsTarget
  previewCount: number
  canvas: DraftCanvasContract
  canvasValidated: boolean
  contextCalls: Set<string>
  enrichmentUsed: boolean
  latestRootScreenshot?: { path: string; version: number; bytes: number; sha256: string }
}

export interface DraftCanvasContract {
  platform: 'web' | 'mobile'
  width: number
  seedHeight: number
  finalHeight: number | 'fit_content'
  fixedViewport: boolean
  rootCount: 1
  rootType: 'frame'
}

export interface PublishedDraft {
  draftId: string
  path: string
  filename: string
  bytes: number
  sha256: string
  created: true
  applied: true
  saved: true
  published: true
  sourceTool: typeof OPENPENCIL_PIPELINE_FINISH_TOOL_NAME
  previewIntent: 'document'
  editable: true
  autoOpenEditor: true
  preview: RenderFrame
  document: DocumentSnapshot
  note: string
}

/** Compact unpublished result projected into the live editor workbench. */
export interface BegunDraft {
  draftId: string
  path: string
  version: number
  createdAt?: number
  platform: 'web' | 'mobile'
  canvas: DraftCanvasContract
  buildContract: JsonValue
  editorState: JsonValue
  styleGuideTags: JsonValue
  document: DocumentSnapshot
  sourceTool: typeof OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME
  previewIntent: 'document'
  editable: true
  autoOpenEditor: true
  liveCanvas: true
  published: false
  next: string
}

class DesignDraftJsQualityError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super('OpenPencil draft failed the DSH publication quality gate')
    this.issues = issues
  }
}

const renderJson = (_args: unknown, value: unknown): [{ type: 'text'; text: string }] => [{
  type: 'text',
  text: JSON.stringify(value, null, 2),
}]

function ownerSessionId(exec: ToolRunContext): string {
  if (exec.agent === undefined) {
    throw new Error('OpenPencil design drafts require an agent-owned DSH execution')
  }
  // Draft lifetime is tied to `session/disposed`, whose event carries this
  // same identity. DSH currently enforces agent.id === session.id, but using
  // the session directly keeps the lifecycle contract explicit.
  return String(exec.agent.session.id)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asJson(value: unknown): JsonValue {
  return (value ?? null) as JsonValue
}

function draftCanvasContract(brief: string): DraftCanvasContract {
  const explicit = EXPLICIT_CANVAS_SIZE.exec(brief)
  const explicitWidth = explicit === null ? undefined : Number(explicit[1])
  const explicitHeight = explicit === null ? undefined : Number(explicit[2])
  const validExplicit = explicitWidth !== undefined
    && explicitHeight !== undefined
    && Number.isSafeInteger(explicitWidth)
    && Number.isSafeInteger(explicitHeight)
    && explicitWidth >= 240
    && explicitWidth <= 3_840
    && explicitHeight >= 240
    && explicitHeight <= 20_000
  const mobile = EXPLICIT_MOBILE_BRIEF.test(brief) || (validExplicit && explicitWidth <= 500)
  const width = validExplicit ? explicitWidth! : mobile ? 390 : 1_440
  const seedHeight = validExplicit ? explicitHeight! : mobile ? 844 : 900
  return {
    platform: mobile ? 'mobile' : 'web',
    width,
    seedHeight,
    finalHeight: validExplicit ? seedHeight : 'fit_content',
    fixedViewport: validExplicit,
    rootCount: 1,
    rootType: 'frame',
  }
}

/**
 * Small, version-pinned subset of the native design contract needed to make
 * the first valid batch. It deliberately avoids the full native prompt while
 * giving the model executable field names instead of asking it to guess.
 */
function compactBuildContract(canvas: DraftCanvasContract): JsonValue {
  return {
    version: 'openpencil-batch-v2',
    canvas: {
      instruction: `Create exactly one root frame at ${canvas.width}x${canvas.seedHeight} in the first batch.`,
      width: canvas.width,
      seedHeight: canvas.seedHeight,
      finalHeight: canvas.finalHeight,
      finalHeightInstruction: canvas.fixedViewport
        ? 'Keep the explicitly requested numeric viewport.'
        : 'After the content flow is complete, update the root height to "fit_content".',
    },
    script: {
      runtime: 'sandboxed QuickJS',
      create: 'const root = I(null, node); const child = I(root, node);',
      component: 'K(kitId, parent, overrides) only with a real kit id returned by native context.',
      rules: [
        'I and K are the only creation functions; use const/let, arrays, and loops for repeated content.',
        'A child parent is the binding returned by an earlier I/K call, never an invented id or display name.',
        'Do not use imports, console, Node.js, browser, network, filesystem, or update/delete operations in script mode.',
      ],
    },
    firstBatch: {
      purpose: 'Make the live canvas visibly useful as fast as possible; stop after the empty page-region skeleton.',
      required: [
        `Create one fixed root frame with width ${canvas.width} and height ${canvas.seedHeight}.`,
        'Create 4-8 named top-level frame shells directly under the root binding.',
        'Keep every shell empty: omit children or use children:[]; do not create descendants.',
        'Use no more than 10 I(...) calls total, including the root.',
      ],
      forbidden: [
        'text, icon_font, image, path, controls, ref, K(...), G(...), or any non-frame node',
        'nested content, inline child nodes, or I(...) calls parented below a top-level shell',
        'filling a shell with labels, icons, images, controls, cards, or decorative content',
      ],
      completion: 'Return immediately after the root and empty named shells exist. Populate them in subsequent batches.',
    },
    operations: 'For later edits use newline DSL U("exact-id", patch), R, D, M, C, or G; ids must come from prior native results.',
    node: {
      types: ['frame', 'text', 'rectangle', 'ellipse', 'line', 'path', 'image', 'icon_font', 'group', 'ref', 'text_input', 'text_area', 'select', 'checkbox'],
      container: 'width/height: number | "fill_container" | "fit_content"; layout: "vertical" | "horizontal" | "none"; gap; padding is only a number, [vertical,horizontal], or [top,right,bottom,left] (never an object); justifyContent; alignItems; clipContent; cornerRadius.',
      text: 'Use content (not text), fontSize, fontWeight, lineHeight, letterSpacing, textAlign, and a fill array.',
      paint: 'fill is [{type:"solid",color:"#RRGGBB"}]; stroke is {thickness,fill:[...]}; effects is an array.',
      controls: 'Use native text_input/text_area/select/checkbox nodes. Inputs need width:"fill_container" and an explicit 44-52px height; password text_input uses secure:true; leadingIcon/trailingIcon accept only a glyph-name string such as "mail" or "eye", never an object or node.',
      icons: 'Use icon_font with iconFontName (for example search, cart, heart, user); never emoji or guessed SVG/path data.',
    },
    layoutRules: [
      'Never set x/y on children inside a layout container.',
      'Do not put fill_container inside a fit_content parent on the same axis.',
      'Use equal sizing strategies for siblings in a row and verify fixed item widths fit the inner width.',
      'First create only the fixed root and 4-8 empty named top-level frame shells; populate those shells in later batches.',
    ],
  } as JsonValue
}

function draftRootNodes(document: Record<string, unknown>): unknown[] {
  if (Array.isArray(document.children) && document.children.length > 0) return document.children
  if (!Array.isArray(document.pages)) return []
  return document.pages.flatMap(page => isRecord(page) && Array.isArray(page.children) ? page.children : [])
}

function canvasContractDiagnostics(documentJson: string, canvas: DraftCanvasContract): string[] {
  let document: unknown
  try {
    document = JSON.parse(documentJson)
  } catch {
    return ['The native draft document is not valid JSON.']
  }
  if (!isRecord(document)) return ['The native draft document root is invalid.']
  const roots = draftRootNodes(document)
  if (roots.length !== canvas.rootCount) {
    return [`Canvas contract requires exactly one root frame; current root count is ${roots.length}.`]
  }
  const root = roots[0]
  if (!isRecord(root) || root.type !== canvas.rootType) {
    return ['Canvas contract requires the single root node to be a frame.']
  }
  if (root.width !== canvas.width) {
    return [`Canvas contract requires root width ${canvas.width}px; current root width is ${String(root.width)}.`]
  }
  if (canvas.fixedViewport && root.height !== canvas.seedHeight) {
    return [`Canvas contract requires the explicit root height ${canvas.seedHeight}px; current root height is ${String(root.height)}.`]
  }
  return []
}

function contextFingerprint(tool: ContextTool, args: Record<string, unknown>): string {
  const canonical = (value: unknown): string => {
    if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
    if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`
  }
  return `${tool}:${canonical(args)}`
}

function publicCall(result: DesignDraftCallResult): Record<string, JsonValue> {
  return {
    tool: result.tool,
    value: asJson(result.value),
    version: result.version,
    changed: result.changed === true,
    hasImage: result.hasImage === true,
  }
}

function assertNoExternalArguments(value: unknown, location = 'arguments', depth = 0): void {
  if (depth > 20) throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: arguments are too deeply nested`)
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoExternalArguments(item, `${location}[${index}]`, depth + 1))
    return
  }
  if (!isRecord(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (/(?:^|_)(?:file|source|output|preset|svg|html|snapshot)?path$/i.test(key)
      || /(?:url|uri|directory|outputdir|export|import|spawn)/i.test(key)) {
      throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: ${location}.${key} is not allowed in an isolated design draft`)
    }
    assertNoExternalArguments(child, `${location}.${key}`, depth + 1)
  }
}

const ISSUE_FIELD = /(?:issues$|^advisories$|^diagnostics$|^errors$|^emptyShells$|^intentQuestions$|^imageSlots$)/i
const OBSERVATIONAL_QUALITY_FIELD = /^emptyShells$/i

function issueValues(value: unknown, options: { includeObservational?: boolean } = {}): string[] {
  const includeObservational = options.includeObservational ?? true
  const issues: string[] = []
  const seen = new Set<object>()
  const visit = (candidate: unknown, key = '', depth = 0): void => {
    if (depth > 8 || candidate === null || candidate === undefined) return
    if (typeof candidate !== 'object') return
    if (seen.has(candidate)) return
    seen.add(candidate)
    if (Array.isArray(candidate)) {
      if (ISSUE_FIELD.test(key)) {
        for (const entry of candidate) {
          if (typeof entry === 'string' && entry.trim().length > 0) issues.push(entry.slice(0, 300))
          else if (isRecord(entry)) issues.push(JSON.stringify(entry).slice(0, 300))
        }
      } else {
        for (const entry of candidate) visit(entry, key, depth + 1)
      }
      return
    }
    for (const [childKey, child] of Object.entries(candidate)) {
      if (ISSUE_FIELD.test(childKey)) {
        // Empty shells include intentional layout primitives such as spacers
        // and dividers. Keep them visible in quality inspection, but let the
        // publication gate exclude this observational heuristic without
        // weakening any other native diagnostic category.
        if (!includeObservational && OBSERVATIONAL_QUALITY_FIELD.test(childKey)) continue
        if (Array.isArray(child)) visit(child, childKey, depth + 1)
        else if (typeof child === 'string' && child.trim().length > 0) issues.push(child.slice(0, 300))
      } else {
        visit(child, childKey, depth + 1)
      }
    }
  }
  visit(value)
  return issues.slice(0, 30)
}

function blockingLintValue(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.issues)) return value
  return {
    ...value,
    // OpenPencil's own fixer deliberately treats Info as observational. Keep
    // it visible in the returned lint report, but do not make an informational
    // heuristic an impossible publication gate (notably for host-owned chrome).
    issues: value.issues.filter(issue => !(
      isRecord(issue)
      && typeof issue.severity === 'string'
      && issue.severity.toLocaleLowerCase('en-US') === 'info'
    )),
  }
}

function presentationMeta(editorHost: EditorHostController, render: RenderAccessController) {
  return (_args: unknown, value: JsonValue): JsonValue => {
    const result = value as unknown as PublishedDraft
    const editor = editorHost.grantFor(result.path, result.document?.sha256)
    return projectDocumentGrant(value, render, editor)
  }
}

function inspectionPreviewFilename(sha256: string): string {
  return `render-stage-${sha256}.png`
}

function inspectionPresentationMeta(render: RenderAccessController) {
  return (_args: unknown, value: JsonValue): JsonValue => {
    if (!isRecord(value) || value.kind !== 'screenshot' || !isRecord(value.screenshot)) return value
    const artifact = value.screenshot
    if (
      typeof artifact.bytes !== 'number'
      || typeof artifact.sha256 !== 'string'
      || typeof artifact.width !== 'number'
      || typeof artifact.height !== 'number'
    ) return value
    return projectImageArtifactGrant(value, render, {
      filename: inspectionPreviewFilename(artifact.sha256),
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      width: artifact.width,
      height: artifact.height,
      name: 'Live design preview',
      index: 0,
    })
  }
}

async function persistInspectionScreenshot(screenshot: DesignDraftScreenshot): Promise<{
  path: string
  filename: string
  mimeType: 'image/png'
  bytes: number
  sha256: string
  width?: number
  height?: number
}> {
  if (screenshot.mimeType !== 'image/png') throw new Error('OpenPencil draft screenshot must be a PNG')
  if (!Buffer.isBuffer(screenshot.bytes) || screenshot.bytes.length === 0) {
    throw new Error('OpenPencil draft screenshot was empty')
  }
  if (screenshot.bytes.length < PNG_SIGNATURE.length
    || !screenshot.bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('OpenPencil draft screenshot did not contain PNG bytes')
  }
  if (screenshot.bytes.length > MAX_SCREENSHOT_BYTES) {
    throw new Error('OpenPencil draft screenshot exceeded the safe cache limit')
  }
  const sha256 = createHash('sha256').update(screenshot.bytes).digest('hex')
  const filename = `${sha256}.png`
  const directory = join(stateRoot(), 'design-draft-inspections')
  const path = join(directory, filename)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  try {
    await writeFile(path, screenshot.bytes, { flag: 'wx', mode: 0o600 })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    const existing = await readFile(path)
    if (!existing.equals(screenshot.bytes)) {
      throw new Error('OpenPencil content-addressed draft screenshot was modified')
    }
  }
  const browserFilename = inspectionPreviewFilename(sha256)
  const browserDirectory = renderDir()
  const browserPath = join(browserDirectory, browserFilename)
  await mkdir(browserDirectory, { recursive: true, mode: 0o700 })
  try {
    await writeFile(browserPath, screenshot.bytes, { flag: 'wx', mode: 0o600 })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    const existing = await readFile(browserPath)
    if (!existing.equals(screenshot.bytes)) {
      throw new Error('OpenPencil content-addressed browser preview was modified')
    }
  }
  const verified = await verifyRenderOutput(browserPath)
  if (verified.bytes !== screenshot.bytes.length || verified.sha256 !== sha256) {
    throw new Error('OpenPencil browser preview did not match its inspection screenshot')
  }
  return {
    path,
    filename,
    mimeType: 'image/png',
    bytes: screenshot.bytes.length,
    sha256,
    width: verified.width,
    height: verified.height,
  }
}

/** Owns model tool definitions and the publication metadata kept outside the daemon. */
export class DesignDraftToolController {
  readonly #drafts: DesignDraftController
  readonly #pending = new Map<string, PendingPublication>()
  readonly #editorHost: EditorHostController
  readonly #services: DesignDraftToolServices
  #disposed = false
  #disposePromise: Promise<void> | undefined

  constructor(editorHost: EditorHostController, services: DesignDraftToolServices) {
    this.#editorHost = editorHost
    this.#services = services
    this.#drafts = editorHost.designDrafts
  }

  createTools() {
    return [
      this.#beginTool(),
      this.#contextTool(),
      this.#batchTool(),
      this.#inspectTool(),
      this.#finishTool(),
      this.#abortTool(),
    ] as const
  }

  async abortOwner(owner: string): Promise<void> {
    await this.#drafts.abortOwner(owner)
    for (const [draftId, pending] of this.#pending) {
      if (pending.ownerSessionId === owner) this.#pending.delete(draftId)
    }
  }

  dispose(): Promise<void> {
    this.#disposePromise ??= (async () => {
      this.#disposed = true
      this.#pending.clear()
      await this.#drafts.dispose()
    })()
    return this.#disposePromise
  }

  #requirePending(draftId: string, owner: string): PendingPublication {
    if (this.#disposed) throw new Error('OpenPencil design-draft tools are disposed')
    const pending = this.#pending.get(draftId)
    if (pending === undefined || pending.ownerSessionId !== owner) {
      throw new Error('OpenPencil design draft does not exist or belongs to another DSH agent')
    }
    return pending
  }

  #beginTool() {
    const drafts = this.#drafts
    const services = this.#services
    const editorHost = this.#editorHost
    return defineTool({
      name: OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME,
      description: 'Begin a fast, private OpenPencil design draft and immediately open its live canvas. '
        + 'Use this for new production designs. It validates a new .op target, starts one native daemon, '
        + 'and returns compact authoritative starter context. The target is not created until pipeline_finish.',
      parameters: {
        path: { type: 'string', required: true, description: 'New workspace-relative or absolute .op target. It must not exist.' },
        brief: { type: 'string', required: true, description: 'The user\'s design request. Preserve it; do not invent a mobile platform when none was requested.' },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderJson,
        presentationMeta: (_args: unknown, value: JsonValue): JsonValue => {
          if (!isRecord(value) || typeof value.draftId !== 'string') return value
          const pending = this.#pending.get(value.draftId)
          if (pending === undefined || !isRecord(value.document)) return value
          const editor = editorHost.grantForDraft(value.draftId, pending.ownerSessionId)
          return projectDocumentGrant(value, services.render, editor)
        },
      },
      execute: async (args: { path: string; brief: string }, exec) => {
        const requestedPath = args.path.trim()
        const brief = args.brief.trim()
        if (requestedPath.length === 0) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: path is required`)
        if (extname(requestedPath).toLowerCase() !== '.op') throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: path must end in .op`)
        if (brief.length === 0) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: brief is required`)
        if (brief.length > MAX_BRIEF_LENGTH) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: brief is too large`)
        const canvas = draftCanvasContract(brief)
        const owner = ownerSessionId(exec)
        const policy = services.sandboxPolicy.resolve({ session: exec.agent?.session })
        if (services.fs.sandboxMode !== undefined && policy.mode === 'read-only') {
          throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: a design draft requires Workspace Write access`)
        }
        const pathInfo = await services.fs.lstat(requestedPath, { cwd: policy.workspaceRoot }, exec.signal)
        if (pathInfo !== undefined) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: target already exists: ${requestedPath}`)
        const target = await services.fs.resolve(requestedPath, { cwd: policy.workspaceRoot, signal: exec.signal })
        const processPath = services.fs.processPath(target)
        if (!isAbsolute(processPath) || extname(processPath).toLowerCase() !== '.op') {
          throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: target must resolve to an absolute local .op path`)
        }
        let parentInfo
        try {
          parentInfo = await lstat(dirname(processPath))
        } catch {
          throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: target parent is not available to the local OpenPencil host`)
        }
        if (!parentInfo.isDirectory()) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: target parent must be a local directory`)
        const resolvedInfo = await services.fs.stat(target, exec.signal)
        if (resolvedInfo !== undefined) {
          services.observe(target, { kind: 'present', version: resolvedInfo.version }, exec)
          throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: target already exists: ${requestedPath}`)
        }
        services.observe(target, { kind: 'absent' }, exec)

        const begun = await drafts.begin({
          ownerSessionId: owner,
          target: { id: String(target.targetKey), label: target.displayPath, kind: 'file' },
          signal: exec.signal,
        })
        try {
          const editorState = await drafts.call(begun.draftId, owner, 'get_editor_state', {}, { signal: exec.signal })
          const styleGuideTags = await drafts.call(begun.draftId, owner, 'get_style_guide_tags', {}, { signal: exec.signal })
          const authoritative = await drafts.snapshot(begun.draftId, owner, { signal: exec.signal })
          const document = await (services.createDocumentSnapshot ?? createDocumentSnapshotFromText)(
            authoritative.documentJson,
          )
          this.#pending.set(begun.draftId, {
            ownerSessionId: owner,
            requestedPath,
            processPath,
            target,
            previewCount: 0,
            canvas,
            canvasValidated: false,
            contextCalls: new Set(),
            enrichmentUsed: false,
          })
          return {
            draftId: begun.draftId,
            path: processPath,
            version: authoritative.version,
            ...(begun.createdAt === undefined ? {} : { createdAt: begun.createdAt }),
            platform: canvas.platform,
            canvas: asJson(canvas),
            buildContract: compactBuildContract(canvas),
            editorState: asJson(editorState.value),
            styleGuideTags: asJson(styleGuideTags.value),
            document: asJson(document),
            sourceTool: OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME,
            previewIntent: 'document',
            editable: true,
            autoOpenEditor: true,
            liveCanvas: true,
            published: false,
            next: `Use the returned canvas and buildContract directly. Make the first ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME} script only the fixed root plus 4-8 empty named top-level frame shells, with at most 10 I calls and no text, icon, image, control, or nested content; return after that fast live-canvas skeleton, then populate the shells in later batches. Do not re-fetch the design-agent prompt or already-returned context.`,
          }
        } catch (error) {
          await drafts.abort(begun.draftId, owner).catch(() => {})
          throw error
        }
      },
      presentCall: (args: { path: string }) => ({ card: 'generic', title: `Begin OpenPencil pipeline for ${args.path}`, kind: 'execute', locations: [{ path: args.path }] }),
    })
  }

  #contextTool() {
    const drafts = this.#drafts
    return defineTool({
      name: OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME,
      description: 'Read native design context for an unpublished OpenPencil pipeline draft. '
        + 'Use it only for context not already returned by pipeline_begin. The allowlist includes bounded design reads, draft-local design-system/theme configuration, and post-final enrich_images; '
        + 'filesystem paths, URLs, imports, exports, and spawned agents are forbidden.',
      parameters: {
        draftId: { type: 'string', required: true, description: 'Draft id returned by openpencil_pipeline_begin.' },
        tool: { type: 'string', required: true, enum: [...CONTEXT_TOOLS], description: 'Allowed native OpenPencil context tool.' },
        arguments: { type: 'object', additionalProperties: true, description: 'Native tool arguments. Do not pass file/path/URL/import/export/spawn fields.' },
      },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
      execute: async (args: { draftId: string; tool: ContextTool; arguments?: Record<string, unknown> }, exec) => {
        const owner = ownerSessionId(exec)
        const pending = this.#requirePending(args.draftId, owner)
        if (!CONTEXT_TOOLS.includes(args.tool)) throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: tool is not allowed`)
        const nativeArgs = { ...(args.arguments ?? {}) }
        assertNoExternalArguments(nativeArgs)
        if (args.tool === 'enrich_images') {
          for (const key of Object.keys(nativeArgs)) {
            if (key !== 'timeout_seconds' && key !== 'root_ids') {
              throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: enrich_images only accepts timeout_seconds and root_ids`)
            }
          }
          if (nativeArgs.root_ids !== undefined && (
            !Array.isArray(nativeArgs.root_ids)
            || !nativeArgs.root_ids.every(id => typeof id === 'string' && id.trim().length > 0)
          )) throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: enrich_images root_ids must be an array of node ids`)
        }
        const fingerprint = contextFingerprint(args.tool, nativeArgs)
        if (pending.contextCalls.has(fingerprint)) {
          throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: this exact native context request was already consumed; continue from the prior result`)
        }
        if (args.tool === 'enrich_images') {
          if (pending.enrichmentUsed) {
            throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: enrich_images already ran for this draft`)
          }
        } else if (pending.contextCalls.size >= MAX_TARGETED_CONTEXT_CALLS) {
          throw new Error(`${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME}: targeted context budget exhausted; continue with the compact begin contract and current draft`)
        }
        const result = await drafts.call(args.draftId, owner, args.tool, nativeArgs, { signal: exec.signal })
        pending.contextCalls.add(fingerprint)
        if (args.tool === 'enrich_images') pending.enrichmentUsed = true
        return { draftId: args.draftId, ...publicCall(result) }
      },
      presentCall: (args: { tool: string }) => ({ card: 'generic', title: `Read OpenPencil draft context: ${args.tool}`, kind: 'read' }),
    })
  }

  #batchTool() {
    const drafts = this.#drafts
    return defineTool({
      name: OPENPENCIL_PIPELINE_BATCH_TOOL_NAME,
      description: 'Apply one transactional native batch_design step to an unpublished draft. '
        + 'The first script is a strict fast-live-canvas checkpoint: create only the fixed root plus 4-8 empty named top-level frame shells, use at most 10 I calls, and stop without text, icons, images, controls, K/G calls, or nested content. '
        + 'Populate those shells with script in subsequent batches, then use operations for later U/R/D/M/G/C repairs. '
        + 'Exactly one must be provided. OpenPencil post-processing is always forced on and the begin canvas width is enforced. '
        + 'The batch returns its own native diagnostics without adding automatic quality/layout round trips; use pipeline_inspect only for a concrete diagnostic or visual milestone.',
      parameters: {
        draftId: { type: 'string', required: true },
        script: { type: 'string', description: 'Sandboxed QuickJS creation program. First call: fixed root + 4-8 empty named top-level frame shells only, at most 10 I calls, no content or nesting. Later calls may use I/K to populate exact shells.' },
        operations: { type: 'string', description: 'Transactional edit operations for existing draft nodes.' },
        pageId: { type: 'string', description: 'Optional page id from native editor state.' },
        canvasWidth: { type: 'number', description: 'Optional compatibility assertion. When provided it must equal the canvas width returned by pipeline_begin; the wrapper always supplies that authoritative width.' },
      },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
      execute: async (args: { draftId: string; script?: string; operations?: string; pageId?: string; canvasWidth?: number }, exec) => {
        const owner = ownerSessionId(exec)
        const pending = this.#requirePending(args.draftId, owner)
        const script = args.script?.trim() ?? ''
        const operations = args.operations?.trim() ?? ''
        if ((script === '') === (operations === '')) {
          throw new Error(`${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}: provide exactly one non-empty script or operations value`)
        }
        const source = script === '' ? operations : script
        if (source.length > MAX_BATCH_LENGTH) throw new Error(`${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}: batch source is too large`)
        if (args.canvasWidth !== undefined && (!Number.isFinite(args.canvasWidth) || args.canvasWidth <= 0 || args.canvasWidth > 16_384)) {
          throw new Error(`${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}: canvasWidth must be greater than 0 and at most 16384`)
        }
        if (args.canvasWidth !== undefined && args.canvasWidth !== pending.canvas.width) {
          throw new Error(`${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}: canvasWidth must match the ${pending.canvas.width}px begin canvas contract`)
        }
        const batch = await drafts.call(args.draftId, owner, 'batch_design', {
          ...(script === '' ? { operations } : { script }),
          postProcess: true,
          ...(args.pageId === undefined || args.pageId.trim() === '' ? {} : { pageId: args.pageId }),
          canvasWidth: pending.canvas.width,
        }, { signal: exec.signal })
        const snapshot = await drafts.snapshot(args.draftId, owner, { signal: exec.signal })
        const version = snapshot.version
        const canvasDiagnostics = canvasContractDiagnostics(snapshot.documentJson, pending.canvas)
        pending.canvasValidated = canvasDiagnostics.length === 0
        const diagnostics = [...canvasDiagnostics, ...issueValues(batch.value)].slice(0, 30)
        return {
          draftId: args.draftId,
          version,
          changed: batch.changed === true,
          batch: asJson(batch.value),
          canvas: asJson(pending.canvas),
          canvasCheck: {
            valid: pending.canvasValidated,
            diagnostics: canvasDiagnostics,
          },
          diagnostics,
          canContinue: true,
          next: diagnostics.length === 0
            ? `Continue the next semantic batch; at each visual milestone call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot" so the user receives an exact preview. If the current model supports image input, open it with read_image; after one explicit unsupported-image error, do not retry or inspect source.`
            : 'Repair every reported diagnostic with another operations batch before finishing.',
        }
      },
      presentCall: () => ({ card: 'generic', title: 'Build OpenPencil draft batch', kind: 'execute' }),
    })
  }

  #inspectTool() {
    const drafts = this.#drafts
    return defineTool({
      name: OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME,
      description: 'Inspect an unpublished draft using native resolved layout, composite quality/lint, or an exact PNG screenshot. '
        + 'Layout inspection returns the resolved node array directly as tree (not a nested layout.layout envelope). '
        + 'Screenshot always returns a bounded content-addressed DSH cache path for the user preview and records proof for that exact draft version. '
        + 'Open it with read_image only when the current model supports image input; after one explicit unsupported-image error, do not retry or inspect source.',
      parameters: {
        draftId: { type: 'string', required: true },
        kind: { type: 'string', required: true, enum: ['layout', 'quality', 'screenshot'] },
        nodeId: { type: 'string', description: 'Optional node id for screenshot. Omit for the root design.' },
        maxDepth: {
          type: 'number',
          description: 'Optional layout-only depth, default 6 and max 12. Omit for quality and screenshot inspection.',
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderJson,
        presentationMeta: inspectionPresentationMeta(this.#services.render),
      },
      execute: async (args: { draftId: string; kind: 'layout' | 'quality' | 'screenshot'; nodeId?: string; maxDepth?: number }, exec) => {
        const owner = ownerSessionId(exec)
        this.#requirePending(args.draftId, owner)
        if (args.kind === 'layout') {
          const maxDepth = args.maxDepth ?? 6
          if (!Number.isSafeInteger(maxDepth) || maxDepth < 1 || maxDepth > 12) {
            throw new Error(`${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME}: maxDepth must be an integer from 1 through 12`)
          }
          const layout = await drafts.call(args.draftId, owner, 'snapshot_layout', { maxDepth }, { signal: exec.signal })
          const rawLayout = layout.value
          const tree = isRecord(rawLayout) && 'layout' in rawLayout
            ? rawLayout.layout
            : rawLayout
          return {
            draftId: args.draftId,
            kind: args.kind,
            version: layout.version,
            tree: asJson(tree),
            diagnostics: issueValues(rawLayout),
          } as Record<string, JsonValue>
        }
        if (args.kind === 'quality') {
          const quality = await drafts.call(args.draftId, owner, 'get_design_quality', {}, { signal: exec.signal })
          const lint = await drafts.call(args.draftId, owner, 'lint_document', {}, { signal: exec.signal })
          return {
            draftId: args.draftId,
            kind: args.kind,
            version: lint.version,
            quality: asJson(quality.value),
            lint: asJson(lint.value),
            diagnostics: issueValues({ quality: quality.value, lint: lint.value }),
          } as Record<string, JsonValue>
        }
        const screenshot = await drafts.screenshot(args.draftId, owner, {
          ...(args.nodeId === undefined || args.nodeId.trim() === '' ? {} : { nodeId: args.nodeId }),
          signal: exec.signal,
        })
        const artifact = await persistInspectionScreenshot(screenshot)
        const pending = this.#requirePending(args.draftId, owner)
        if (args.nodeId === undefined || args.nodeId.trim() === '' || args.nodeId === 'root') {
          pending.previewCount += 1
          pending.latestRootScreenshot = {
            path: artifact.path,
            version: screenshot.version,
            bytes: artifact.bytes,
            sha256: artifact.sha256,
          }
        }
        return {
          draftId: args.draftId,
          kind: args.kind,
          version: screenshot.version,
          screenshot: artifact,
          next: `The exact user preview is ready at ${artifact.path}. If the current model supports image input, open it with read_image and judge the rendered composition; after one explicit unsupported-image error, do not retry or inspect source. Continue with native quality/finalize gates and state honestly when model visual review was unavailable.`,
        } as Record<string, JsonValue>
      },
      presentCall: (args: { kind: string }) => ({ card: 'generic', title: `Inspect OpenPencil draft: ${args.kind}`, kind: 'read' }),
    })
  }

  #finishTool() {
    const drafts = this.#drafts
    const services = this.#services
    return defineTool({
      name: OPENPENCIL_PIPELINE_FINISH_TOOL_NAME,
      description: 'Finalize and publish a complete OpenPencil draft in two phases. '
        + 'Each call runs native finalization, design quality, lint, and layout checks. Diagnostics/advisories keep the draft private for repair. '
        + 'A clean finalized version must then receive a distinct pipeline_inspect(kind:"screenshot") user preview before finish is called again. '
        + 'Use read_image only when the current model supports image input; an explicit unsupported-image error must not be retried or replaced by source inspection. '
        + 'Only that exact post-final screenshot version may pass the JS quality gate and atomic DSH createIfAbsent publication. '
        + 'The published presentation pairs the exact PNG with an editable document grant, an Edit canvas action, and idle-only editor auto-open, including in nested PTC/Code Mode.',
      parameters: {
        draftId: { type: 'string', required: true, description: 'Draft id returned by pipeline_begin.' },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderJson,
        presentationMeta: presentationMeta(this.#editorHost, services.render),
      },
      execute: async (args: { draftId: string }, exec) => {
        const owner = ownerSessionId(exec)
        const pending = this.#requirePending(args.draftId, owner)
        if (pending.previewCount === 0) {
          return {
            draftId: args.draftId,
            path: pending.processPath,
            published: false,
            stage: 'needs_visual_preview',
            diagnostics: [],
            canContinue: true,
            next: `Before finalization, call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot" to generate the exact user preview. If the current model supports image input, open the PNG with read_image and repair visible defects; after one explicit unsupported-image error, do not retry or inspect source, and continue with native quality/finalize gates while stating that model visual review was unavailable.`,
          }
        }
        const finalized = await drafts.finalize(args.draftId, owner, { signal: exec.signal })
        const finalizedSnapshot = await drafts.snapshot(args.draftId, owner, { signal: exec.signal })
        const canvasDiagnostics = canvasContractDiagnostics(finalizedSnapshot.documentJson, pending.canvas)
        pending.canvasValidated = canvasDiagnostics.length === 0
        if (!pending.canvasValidated) {
          return {
            draftId: args.draftId,
            path: pending.processPath,
            published: false,
            stage: 'needs_correction',
            version: finalizedSnapshot.version,
            diagnostics: canvasDiagnostics,
            canContinue: true,
            next: `Repair the authoritative ${pending.canvas.width}px root canvas contract with ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}, then take a fresh screenshot and finish again.`,
          }
        }
        const quality = await drafts.call(args.draftId, owner, 'get_design_quality', {}, { signal: exec.signal })
        const lint = await drafts.call(args.draftId, owner, 'lint_document', {}, { signal: exec.signal })
        const layout = await drafts.call(args.draftId, owner, 'snapshot_layout', { maxDepth: 8 }, { signal: exec.signal })
        const blockingLint = blockingLintValue(lint.value)
        const nativeDiagnostics = issueValues({
          finalize: finalized.value,
          quality: quality.value,
          lint: blockingLint,
          layout: layout.value,
        }, { includeObservational: false })
        if (nativeDiagnostics.length > 0) {
          return {
            draftId: args.draftId,
            path: pending.processPath,
            published: false,
            stage: 'needs_correction',
            version: layout.version,
            finalize: asJson(finalized.value),
            quality: asJson(quality.value),
            lint: asJson(blockingLint),
            layoutCheck: {
              version: layout.version,
              diagnostics: issueValues(layout.value),
            },
            diagnostics: nativeDiagnostics,
            canContinue: true,
            next: `Blocking native diagnostics remain (Info lint has already been excluded). Repair these exact items with ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}, re-inspect, then finish again; do not inspect detector source.`,
          }
        }

        let published: PublishedDraft
        try {
          const finished = await drafts.finish(args.draftId, owner, {
            signal: exec.signal,
            publish: async (authoritative): Promise<PublishedDraft> => {
              const jsDiagnostics = inspectGeneratedDesignQuality(authoritative.documentJson)
              if (jsDiagnostics.length > 0) throw new DesignDraftJsQualityError(jsDiagnostics)
              const inspected = pending.latestRootScreenshot
              if (inspected === undefined || inspected.version !== authoritative.version) {
                throw new Error(`${OPENPENCIL_PIPELINE_FINISH_TOOL_NAME}: current post-final preview artifact is unavailable`)
              }
              const policy = services.sandboxPolicy.resolve({ session: exec.agent?.session })
              if (services.fs.sandboxMode !== undefined && policy.mode === 'read-only') {
                throw new Error(`${OPENPENCIL_PIPELINE_FINISH_TOOL_NAME}: publishing requires Workspace Write access`)
              }
              const currentPathInfo = await services.fs.lstat(pending.requestedPath, { cwd: policy.workspaceRoot }, exec.signal)
              if (currentPathInfo !== undefined) throw new Error(`${OPENPENCIL_PIPELINE_FINISH_TOOL_NAME}: target now exists: ${pending.requestedPath}`)
              const currentTarget = await services.fs.resolve(pending.requestedPath, { cwd: policy.workspaceRoot, signal: exec.signal })
              const currentProcessPath = services.fs.processPath(currentTarget)
              if (currentProcessPath !== pending.processPath || String(currentTarget.targetKey) !== String(pending.target.targetKey)) {
                throw new Error(`${OPENPENCIL_PIPELINE_FINISH_TOOL_NAME}: target identity changed while the draft was open`)
              }
              const previewPath = await createRenderOutput()
              await copyFile(inspected.path, previewPath)
              let preview: RenderFrame
              try {
                const verified = await verifyRenderOutput(previewPath)
                if (verified.bytes !== inspected.bytes || verified.sha256 !== inspected.sha256) {
                  throw new Error(`${OPENPENCIL_PIPELINE_FINISH_TOOL_NAME}: post-final preview changed since visual inspection`)
                }
                preview = {
                  path: previewPath,
                  filename: basename(previewPath),
                  mimeType: 'image/png',
                  bytes: verified.bytes,
                  width: verified.width,
                  height: verified.height,
                  sha256: verified.sha256,
                  index: 0,
                }
              } catch (error) {
                await rm(previewPath, { force: true }).catch(() => {})
                throw error
              }
              let document: DocumentSnapshot
              try {
                document = await (services.createDocumentSnapshot ?? createDocumentSnapshotFromText)(
                  authoritative.documentJson,
                )
              } catch (error) {
                await rm(previewPath, { force: true }).catch(() => {})
                throw error
              }
              let outcome
              try {
                outcome = await services.fs.writeText(
                  pending.target,
                  authoritative.documentJson,
                  { kind: 'createIfAbsent' },
                  exec.signal,
                  policy,
                )
              } catch (error) {
                await rm(previewPath, { force: true }).catch(() => {})
                throw error
              }
              // createIfAbsent writes the exact supplied UTF-8 text. All
              // fallible presentation artifacts were prepared first, so an
              // observer failure after commit must not turn success into an
              // unretryable half-published draft.
              try {
                services.observe(pending.target, { kind: 'present', version: outcome.version }, exec)
              } catch {
                // Best-effort post-commit notification only.
              }
              return {
                draftId: args.draftId,
                path: pending.processPath,
                filename: basename(pending.processPath),
                bytes: document.bytes,
                sha256: document.sha256,
                created: true,
                applied: true,
                saved: true,
                published: true,
                sourceTool: OPENPENCIL_PIPELINE_FINISH_TOOL_NAME,
                previewIntent: 'document',
                editable: true,
                autoOpenEditor: true,
                preview,
                document,
                note: `Published ${pending.processPath} atomically after native quality, lint, layout, screenshot, and DSH quality gates; the exact preview remains paired with its editable document and DSH requests idle-only editor auto-open.`,
              }
            },
          })
          published = finished.published
        } catch (error) {
          if (error instanceof DesignDraftJsQualityError) {
            return {
              draftId: args.draftId,
              path: pending.processPath,
              published: false,
              stage: 'needs_correction',
              version: layout.version,
              diagnostics: error.issues,
              canContinue: true,
              next: `Repair DSH quality diagnostics with ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME}, take a new screenshot, then finish again.`,
            }
          }
          const code = isRecord(error) && typeof error.code === 'string' ? error.code : undefined
          if (code === 'OPENPENCIL_DRAFT_VISUAL_INSPECTION_REQUIRED') {
            return {
              draftId: args.draftId,
              path: pending.processPath,
              published: false,
              stage: 'needs_visual_inspection',
              version: layout.version,
              diagnostics: [],
              canContinue: true,
              next: `Call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot" to generate the exact post-final user preview. If the current model supports image input, open it with read_image and correct visible defects. After one explicit unsupported-image error, do not retry or inspect source; rely on the native quality/finalize gates, state that model visual review was unavailable, and call finish again.`,
            }
          }
          throw error
        }
        this.#pending.delete(args.draftId)
        return published as unknown as Record<string, JsonValue>
      },
      presentCall: () => ({ card: 'generic', title: 'Finalize OpenPencil design pipeline', kind: 'execute' }),
    })
  }

  #abortTool() {
    const drafts = this.#drafts
    return defineTool({
      name: OPENPENCIL_PIPELINE_ABORT_TOOL_NAME,
      description: 'Abort one unpublished OpenPencil design draft and remove its private native runtime. No target .op file is created.',
      parameters: { draftId: { type: 'string', required: true } },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
      execute: async (args: { draftId: string }, exec) => {
        const owner = ownerSessionId(exec)
        const pending = this.#requirePending(args.draftId, owner)
        await drafts.abort(args.draftId, owner)
        this.#pending.delete(args.draftId)
        return { draftId: args.draftId, path: pending.processPath, aborted: true, published: false }
      },
      presentCall: () => ({ card: 'generic', title: 'Abort OpenPencil design draft', kind: 'execute' }),
    })
  }
}

export function createDesignDraftToolController(
  editorHost: EditorHostController,
  services: DesignDraftToolServices,
): DesignDraftToolController {
  return new DesignDraftToolController(editorHost, services)
}
