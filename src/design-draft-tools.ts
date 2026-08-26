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
  projectDocumentGrant,
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
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const CONTEXT_TOOLS = [
  'get_editor_state',
  'get_design_agent_prompt',
  'get_guidelines',
  'get_style_guide_tags',
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
  'snapshot_layout',
  'find_empty_space',
  'get_canvas_bounds',
  'get_design_quality',
  'lint_document',
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
  brief: string
  requestedPath: string
  processPath: string
  target: FsTarget
  previewCount: number
  latestRootScreenshot?: { path: string; version: number; bytes: number; sha256: string }
}

export interface PublishedDraft {
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

function issueValues(value: unknown): string[] {
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
  return {
    path,
    filename,
    mimeType: 'image/png',
    bytes: screenshot.bytes.length,
    sha256,
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
    return defineTool({
      name: OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME,
      description: 'Begin the complete OpenPencil design-agent pipeline in a private unpublished draft. '
        + 'Use this for new production designs. It requires Workspace Write, validates a new .op target, '
        + 'starts an isolated native draft, and returns OpenPencil\'s complete design-agent prompt plus '
        + 'editor state, style-guide tags, and variables. The target is not created until pipeline_finish.',
      parameters: {
        path: { type: 'string', required: true, description: 'New workspace-relative or absolute .op target. It must not exist.' },
        brief: { type: 'string', required: true, description: 'The complete user design brief, including product, platform, content, and constraints.' },
      },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
      execute: async (args: { path: string; brief: string }, exec) => {
        const requestedPath = args.path.trim()
        const brief = args.brief.trim()
        if (requestedPath.length === 0) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: path is required`)
        if (extname(requestedPath).toLowerCase() !== '.op') throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: path must end in .op`)
        if (brief.length === 0) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: brief is required`)
        if (brief.length > MAX_BRIEF_LENGTH) throw new Error(`${OPENPENCIL_PIPELINE_BEGIN_TOOL_NAME}: brief is too large`)
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
          const designAgentPrompt = await drafts.call(begun.draftId, owner, 'get_design_agent_prompt', {
            userMessage: brief,
            verifyProtocol: 'screenshot',
          }, { signal: exec.signal })
          const editorState = await drafts.call(begun.draftId, owner, 'get_editor_state', {}, { signal: exec.signal })
          const styleGuideTags = await drafts.call(begun.draftId, owner, 'get_style_guide_tags', {}, { signal: exec.signal })
          const variables = await drafts.call(begun.draftId, owner, 'get_variables', {}, { signal: exec.signal })
          this.#pending.set(begun.draftId, {
            ownerSessionId: owner,
            brief,
            requestedPath,
            processPath,
            target,
            previewCount: 0,
          })
          return {
            draftId: begun.draftId,
            path: processPath,
            version: variables.version,
            ...(begun.createdAt === undefined ? {} : { createdAt: begun.createdAt }),
            designAgentPrompt: asJson(designAgentPrompt.value),
            editorState: asJson(editorState.value),
            styleGuideTags: asJson(styleGuideTags.value),
            variables: asJson(variables.value),
            published: false,
            next: `Use ${OPENPENCIL_PIPELINE_CONTEXT_TOOL_NAME} to resolve guidelines/style and then ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME} in skeleton-first batches.`,
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
        + 'The allowlist includes the full design-agent read surface, draft-local design-system/variable/theme configuration, and bounded post-final enrich_images; '
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
        if (args.tool === 'get_design_agent_prompt' && nativeArgs.userMessage === undefined) {
          nativeArgs.userMessage = pending.brief
          nativeArgs.verifyProtocol ??= 'screenshot'
        }
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
        const result = await drafts.call(args.draftId, owner, args.tool, nativeArgs, { signal: exec.signal })
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
        + 'Use script for skeleton-first I/K creation and operations for later U/R/D/M/G/C repairs. '
        + 'Exactly one must be provided. OpenPencil post-processing is always forced on; every result includes native quality and compact resolved-layout diagnostics. '
        + 'Use pipeline_inspect(kind:"screenshot") plus read_image at visual milestones instead of relying on numeric layout alone.',
      parameters: {
        draftId: { type: 'string', required: true },
        script: { type: 'string', description: 'Sandboxed QuickJS creation program using I/K.' },
        operations: { type: 'string', description: 'Transactional edit operations for existing draft nodes.' },
        pageId: { type: 'string', description: 'Optional page id from native editor state.' },
        canvasWidth: { type: 'number', description: 'Optional post-processing canvas width.' },
      },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
      execute: async (args: { draftId: string; script?: string; operations?: string; pageId?: string; canvasWidth?: number }, exec) => {
        const owner = ownerSessionId(exec)
        this.#requirePending(args.draftId, owner)
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
        const batch = await drafts.call(args.draftId, owner, 'batch_design', {
          ...(script === '' ? { operations } : { script }),
          postProcess: true,
          ...(args.pageId === undefined || args.pageId.trim() === '' ? {} : { pageId: args.pageId }),
          ...(args.canvasWidth === undefined ? {} : { canvasWidth: args.canvasWidth }),
        }, { signal: exec.signal })
        const quality = await drafts.call(args.draftId, owner, 'get_design_quality', {}, { signal: exec.signal })
        const layout = await drafts.call(args.draftId, owner, 'snapshot_layout', { maxDepth: 4 }, { signal: exec.signal })
        const layoutDiagnostics = issueValues(layout.value)
        const diagnostics = issueValues({ batch: batch.value, quality: quality.value, layout: layout.value })
        return {
          draftId: args.draftId,
          version: layout.version,
          changed: batch.changed === true,
          batch: asJson(batch.value),
          quality: asJson(quality.value),
          layoutCheck: {
            version: layout.version,
            diagnostics: layoutDiagnostics,
          },
          diagnostics,
          canContinue: true,
          next: diagnostics.length === 0
            ? `Continue the next semantic batch; at each visual milestone call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot" and open it with read_image.`
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
        + 'Screenshot returns a bounded content-addressed DSH cache path that can be opened with read_image and records visual verification for that exact draft version.',
      parameters: {
        draftId: { type: 'string', required: true },
        kind: { type: 'string', required: true, enum: ['layout', 'quality', 'screenshot'] },
        nodeId: { type: 'string', description: 'Optional node id for screenshot. Omit for the root design.' },
        maxDepth: {
          type: 'number',
          description: 'Optional layout-only depth, default 6 and max 12. Omit for quality and screenshot inspection.',
        },
      },
      output: { schema: { type: 'object', additionalProperties: true }, render: renderJson },
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
          next: `Open ${artifact.path} with read_image, judge the rendered composition, and use ${OPENPENCIL_PIPELINE_BATCH_TOOL_NAME} for any visual correction.`,
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
        + 'A clean finalized version must then be inspected with pipeline_inspect(kind:"screenshot") and read visually before finish is called again. '
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
            next: `Before finalization, call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot", open the exact PNG with read_image, and repair visible defects. Numeric quality/layout alone is not a design preview.`,
          }
        }
        const finalized = await drafts.finalize(args.draftId, owner, { signal: exec.signal })
        const quality = await drafts.call(args.draftId, owner, 'get_design_quality', {}, { signal: exec.signal })
        const lint = await drafts.call(args.draftId, owner, 'lint_document', {}, { signal: exec.signal })
        const layout = await drafts.call(args.draftId, owner, 'snapshot_layout', { maxDepth: 8 }, { signal: exec.signal })
        const blockingLint = blockingLintValue(lint.value)
        const nativeDiagnostics = issueValues({
          finalize: finalized.value,
          quality: quality.value,
          lint: blockingLint,
          layout: layout.value,
        })
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
              next: `Call ${OPENPENCIL_PIPELINE_INSPECT_TOOL_NAME} with kind:"screenshot", open its cache path with read_image, correct any visible defects, then call finish again.`,
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
