import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { createDesignDraftToolController } from '../lib/design-draft-tools.js'
import { createDocumentSnapshotFromText, RenderAccessController } from '../lib/renderer.js'

const previousDshHome = process.env.DSH_HOME
const testRoot = await mkdtemp(join(tmpdir(), 'dsh-openpencil-pipeline-tools-'))
process.env.DSH_HOME = join(testRoot, 'dsh-home')
after(async () => {
  if (previousDshHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = previousDshHome
  await rm(testRoot, { recursive: true, force: true })
})

const DRAFT_ID = 'd'.repeat(32)
const SAFE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const CLEAN_QUALITY = {
  geometryIssues: [], layoutIssues: [], contrastIssues: [], iconIssues: [],
  structureIssues: [], emptyShells: [], intentQuestions: [], variableIssues: [],
  imageSlots: [], navIssues: [],
}
const CLEAN_DOCUMENT = JSON.stringify({
  version: '1.0.0',
  children: [{ type: 'frame', id: 'root', name: 'Root', width: 390, height: 844, children: [] }],
})

class FakeDraftController {
  calls = []
  aborts = []
  abortOwners = []
  beginCalls = []
  disposeCalls = 0
  finishCalls = 0
  screenshotCalls = []
  png = SAFE_PNG
  version = 0
  finalized = false
  screenshotVersion
  documentJson = CLEAN_DOCUMENT
  quality = CLEAN_QUALITY
  lint = { count: 0, issues: [] }
  layout = { layout: [], layoutIssues: [] }
  finalizeValue = { applied: true, advisories: [] }

  async begin(options) {
    this.beginCalls.push(options)
    return {
      draftId: DRAFT_ID,
      target: options.target,
      version: this.version,
      createdAt: 123,
      token: 'must-not-escape',
      daemonPath: '/private/tmp/dsh-openpencil-draft-secret/draft.op',
    }
  }

  async call(draftId, owner, tool, args, options) {
    this.calls.push({ draftId, owner, tool, args, options })
    let changed = false
    let value
    if (tool === 'get_design_agent_prompt') value = { prompt: 'complete native prompt', verifyProtocol: 'screenshot' }
    else if (tool === 'get_editor_state') value = { activePageId: 'page-1' }
    else if (tool === 'get_style_guide_tags') value = { tags: ['editorial'] }
    else if (tool === 'get_variables') value = { variables: {} }
    else if (tool === 'get_design_quality') value = this.quality
    else if (tool === 'lint_document') value = this.lint
    else if (tool === 'snapshot_layout') value = this.layout
    else if (tool === 'batch_design' || tool === 'apply_design_system') {
      value = { applied: true, layoutIssues: [] }
      this.version += 1
      changed = true
      this.screenshotVersion = undefined
    } else if (tool === 'finalize_design') {
      value = this.finalizeValue
      if (!this.finalized) {
        this.finalized = true
        this.version += 1
        changed = true
        this.screenshotVersion = undefined
      }
    } else value = { ok: true }
    return { draftId, tool, value, text: JSON.stringify(value), version: this.version, changed, hasImage: false }
  }

  finalize(draftId, owner, options) {
    return this.call(draftId, owner, 'finalize_design', {}, options)
  }

  async snapshot(draftId) {
    return { draftId, version: this.version, documentJson: this.documentJson }
  }

  async screenshot(draftId, owner, options) {
    this.screenshotCalls.push({ draftId, owner, options })
    this.screenshotVersion = this.version
    return {
      draftId,
      version: this.version,
      bytes: this.png,
      mimeType: 'image/png',
      metadata: { width: 390, height: 844 },
    }
  }

  async finish(draftId, owner, options) {
    this.finishCalls += 1
    if (this.screenshotVersion !== this.version) {
      const error = new Error('current screenshot required')
      error.code = 'OPENPENCIL_DRAFT_VISUAL_INSPECTION_REQUIRED'
      throw error
    }
    const published = await options.publish({ draftId, version: this.version, documentJson: this.documentJson })
    return { draftId, version: this.version, published }
  }

  async abort(draftId, owner) {
    this.aborts.push({ draftId, owner })
    return true
  }

  async abortOwner(owner) {
    this.abortOwners.push(owner)
    return 1
  }

  async dispose() {
    this.disposeCalls += 1
  }
}

async function createHarness(options = {}) {
  const workspaceRoot = await mkdtemp(join(testRoot, 'workspace-'))
  const processPath = join(workspaceRoot, 'design.op')
  const target = { targetKey: `local:${processPath}`, displayPath: processPath }
  const draft = options.draft ?? new FakeDraftController()
  const calls = { lstat: [], resolve: [], stat: [], write: [], observe: [], grant: [], snapshot: [] }
  const fs = {
    sandboxMode: options.sandboxMode ?? 'workspace-write',
    async lstat(path, resolveOptions, signal) {
      calls.lstat.push({ path, resolveOptions, signal })
      return typeof options.pathInfo === 'function' ? options.pathInfo() : options.pathInfo
    },
    async resolve(path, resolveOptions) {
      calls.resolve.push({ path, resolveOptions })
      return options.changedTarget ?? target
    },
    processPath(received) {
      return received === target ? processPath : options.changedProcessPath ?? processPath
    },
    async stat(received, signal) {
      calls.stat.push({ received, signal })
      return options.resolvedInfo
    },
    async writeText(received, content, intent, signal, policy) {
      calls.write.push({ received, content, intent, signal, policy })
      if (options.writeError) throw options.writeError
      return { operation: 'create', version: 'fs-v1', before: null, after: content }
    },
  }
  const policy = { mode: options.policyMode ?? 'workspace-write', workspaceRoot }
  const sandboxPolicy = { resolve() { return policy } }
  const editorHost = {
    designDrafts: draft,
    grantFor(path, sha256) {
      calls.grant.push({ path, sha256 })
      return undefined
    },
  }
  const render = new RenderAccessController(randomBytes(32))
  const controller = createDesignDraftToolController(editorHost, {
    fs,
    sandboxPolicy,
    render,
    observe(received, observation, exec) {
      calls.observe.push({ received, observation, exec })
      if (options.observeError !== undefined && observation.kind === 'present') throw options.observeError
    },
    async createDocumentSnapshot(text) {
      calls.snapshot.push(text)
      if (options.snapshotError !== undefined) throw options.snapshotError
      return createDocumentSnapshotFromText(text)
    },
  })
  const tools = Object.fromEntries(controller.createTools().map(tool => [tool.name, tool]))
  const signal = new AbortController().signal
  const session = { id: 'session-from-exec', header: { cwd: workspaceRoot } }
  const exec = { agent: { id: 'session-from-exec', session }, signal }
  return { calls, controller, draft, exec, fs, policy, processPath, target, tools, workspaceRoot }
}

async function begin(harness, brief = 'Design a deliberate mobile account screen') {
  return harness.tools.openpencil_pipeline_begin.execute({ path: 'design.op', brief }, harness.exec)
}

test('pipeline begin derives owner from execution, validates an absent local target, and returns only public native context', async () => {
  const harness = await createHarness()
  const result = await begin(harness)

  assert.equal(harness.draft.beginCalls.length, 1)
  assert.equal(harness.draft.beginCalls[0].ownerSessionId, 'session-from-exec')
  assert.deepEqual(harness.draft.beginCalls[0].target, {
    id: String(harness.target.targetKey), label: harness.target.displayPath, kind: 'file',
  })
  assert.deepEqual(harness.draft.calls.slice(0, 4).map(call => [call.owner, call.tool]), [
    ['session-from-exec', 'get_design_agent_prompt'],
    ['session-from-exec', 'get_editor_state'],
    ['session-from-exec', 'get_style_guide_tags'],
    ['session-from-exec', 'get_variables'],
  ])
  assert.deepEqual(harness.draft.calls[0].args, {
    userMessage: 'Design a deliberate mobile account screen', verifyProtocol: 'screenshot',
  })
  assert.equal(result.published, false)
  assert.equal(result.designAgentPrompt.prompt, 'complete native prompt')
  assert.equal(harness.calls.write.length, 0, 'begin must keep the target absent')
  assert.equal(harness.calls.observe[0].observation.kind, 'absent')
  const serialized = JSON.stringify(result)
  assert.doesNotMatch(serialized, /must-not-escape|dsh-openpencil-draft-secret/)
  assert.equal('ownerSessionId' in harness.tools.openpencil_pipeline_begin.parameters.properties, false)
})

test('pipeline begin refuses read-only, existing, non-op, and non-agent calls before starting a daemon', async () => {
  const readOnly = await createHarness({ policyMode: 'read-only' })
  await assert.rejects(begin(readOnly), /Workspace Write/)
  const existing = await createHarness({ pathInfo: { type: 'file' } })
  await assert.rejects(existing.tools.openpencil_pipeline_begin.execute({ path: 'design.op', brief: 'brief' }, existing.exec), /already exists/)
  const badExtension = await createHarness()
  await assert.rejects(badExtension.tools.openpencil_pipeline_begin.execute({ path: 'design.json', brief: 'brief' }, badExtension.exec), /end in \.op/)
  const noAgent = await createHarness()
  await assert.rejects(
    noAgent.tools.openpencil_pipeline_begin.execute({ path: 'design.op', brief: 'brief' }, { signal: noAgent.exec.signal }),
    /agent-owned/,
  )
})

test('context is allowlisted and recursively rejects path, URL, export, import, and spawn-shaped arguments', async () => {
  const harness = await createHarness()
  await begin(harness)
  const before = harness.draft.calls.length
  await assert.rejects(
    harness.tools.openpencil_pipeline_context.execute({
      draftId: DRAFT_ID,
      tool: 'batch_get',
      arguments: { nested: { filePath: '/private/tmp/escape.op' } },
    }, harness.exec),
    /not allowed in an isolated design draft/,
  )
  assert.equal(harness.draft.calls.length, before)
  await assert.rejects(
    harness.tools.openpencil_pipeline_context.execute({ draftId: DRAFT_ID, tool: 'spawn_agents', arguments: {} }, harness.exec),
    /must be one of|tool is not allowed/,
  )
  const result = await harness.tools.openpencil_pipeline_context.execute({
    draftId: DRAFT_ID, tool: 'apply_design_system', arguments: { name: 'halo' },
  }, harness.exec)
  assert.equal(result.tool, 'apply_design_system')
  const variables = await harness.tools.openpencil_pipeline_context.execute({
    draftId: DRAFT_ID,
    tool: 'set_variables',
    arguments: { variables: { accent: { type: 'color', value: '#A9642F' } } },
  }, harness.exec)
  assert.equal(variables.tool, 'set_variables')
  const prompt = await harness.tools.openpencil_pipeline_context.execute({
    draftId: DRAFT_ID,
    tool: 'get_design_agent_prompt',
    arguments: {},
  }, harness.exec)
  assert.equal(prompt.tool, 'get_design_agent_prompt')
  assert.deepEqual(harness.draft.calls.at(-1).args, {
    userMessage: 'Design a deliberate mobile account screen',
    verifyProtocol: 'screenshot',
  })
  await assert.rejects(
    harness.tools.openpencil_pipeline_context.execute({
      draftId: DRAFT_ID, tool: 'enrich_images', arguments: { timeout_seconds: 30, prompt: 'escape' },
    }, harness.exec),
    /only accepts timeout_seconds and root_ids/,
  )
})

test('batch forces post-processing and always returns native quality plus resolved layout feedback', async () => {
  const harness = await createHarness()
  await begin(harness)
  const result = await harness.tools.openpencil_pipeline_batch.execute({
    draftId: DRAFT_ID,
    script: 'const root = I(null, {type:"frame", width:390, height:844});',
    canvasWidth: 390,
  }, harness.exec)
  const batch = harness.draft.calls.find(call => call.tool === 'batch_design')
  assert.equal(batch.args.postProcess, true)
  assert.equal(batch.args.canvasWidth, 390)
  assert.deepEqual(harness.draft.calls.slice(-2).map(call => call.tool), ['get_design_quality', 'snapshot_layout'])
  assert.deepEqual(result.quality, CLEAN_QUALITY)
  assert.deepEqual(result.layoutCheck, { version: harness.draft.version, diagnostics: [] })
  await assert.rejects(
    harness.tools.openpencil_pipeline_batch.execute({ draftId: DRAFT_ID, script: 'I(null,{})', operations: 'U("1",{})' }, harness.exec),
    /exactly one/,
  )
})

test('screenshot inspection tolerates an irrelevant maxDepth and exposes one safe content-addressed cache file', async () => {
  const harness = await createHarness()
  await begin(harness)
  const result = await harness.tools.openpencil_pipeline_inspect.execute({
    draftId: DRAFT_ID,
    kind: 'screenshot',
    maxDepth: 8,
  }, harness.exec)
  assert.match(result.screenshot.path, /dsh-openpencil\/design-draft-inspections\/[a-f0-9]{64}\.png$/)
  assert.equal(result.screenshot.mimeType, 'image/png')
  assert.equal(result.screenshot.bytes, SAFE_PNG.length)
  assert.equal(harness.draft.screenshotCalls[0].owner, 'session-from-exec')
  const serialized = JSON.stringify(result)
  assert.doesNotMatch(serialized, /safe-png-bytes|token|managed-draft|draft\.op/)
})

test('layout inspection flattens the native layout envelope into one direct tree', async () => {
  const harness = await createHarness()
  harness.draft.layout = { layout: [{ id: 'root', width: 390, height: 844 }], layoutIssues: [] }
  await begin(harness)
  const result = await harness.tools.openpencil_pipeline_inspect.execute({
    draftId: DRAFT_ID,
    kind: 'layout',
    maxDepth: 8,
  }, harness.exec)
  assert.deepEqual(result.tree, [{ id: 'root', width: 390, height: 844 }])
  assert.equal('layout' in result, false)
  assert.deepEqual(result.diagnostics, [])
})

test('finish requires an early preview and a distinct post-final screenshot before atomic publication', async () => {
  const harness = await createHarness()
  await begin(harness)

  const first = await harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec)
  assert.equal(first.published, false)
  assert.equal(first.stage, 'needs_visual_preview')
  assert.equal(harness.calls.write.length, 0)

  await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  const second = await harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec)
  assert.equal(second.published, false)
  assert.equal(second.stage, 'needs_visual_inspection')

  await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  const third = await harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec)
  assert.equal(third.published, true)
  assert.equal(third.sourceTool, 'openpencil_pipeline_finish')
  assert.equal(third.autoOpenEditor, true)
  assert.equal(third.preview.mimeType, 'image/png')
  assert.equal(third.preview.width, 1)
  assert.equal(third.preview.height, 1)
  assert.deepEqual(harness.calls.write[0].intent, { kind: 'createIfAbsent' })
  assert.equal(harness.calls.observe.at(-1).observation.kind, 'present')
  await assert.rejects(
    harness.tools.openpencil_pipeline_abort.execute({ draftId: DRAFT_ID }, harness.exec),
    /does not exist|another DSH agent/,
  )
})

test('native diagnostics and the post-screenshot JS gate keep the draft private and repairable', async () => {
  const nativeBlocked = await createHarness()
  nativeBlocked.draft.quality = { ...CLEAN_QUALITY, contrastIssues: [{ nodeId: '7', ratio: 1.4 }] }
  await begin(nativeBlocked)
  await nativeBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, nativeBlocked.exec)
  const nativeResult = await nativeBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, nativeBlocked.exec)
  assert.equal(nativeResult.stage, 'needs_correction')
  assert.equal(nativeResult.canContinue, true)
  assert.equal(nativeBlocked.draft.finishCalls, 0)
  assert.equal(nativeBlocked.calls.write.length, 0)

  const lintInfo = await createHarness()
  lintInfo.draft.lint = {
    count: 1,
    issues: [{ severity: 'info', code: 'absolute-positioning-share', nodeId: 'host-owned' }],
  }
  await begin(lintInfo)
  await lintInfo.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, lintInfo.exec)
  const lintInfoResult = await lintInfo.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, lintInfo.exec)
  assert.equal(lintInfoResult.stage, 'needs_visual_inspection')

  const lintWarning = await createHarness()
  lintWarning.draft.lint = {
    count: 1,
    issues: [{ severity: 'warning', code: 'text-explicit-height', nodeId: 'n1' }],
  }
  await begin(lintWarning)
  await lintWarning.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, lintWarning.exec)
  const lintWarningResult = await lintWarning.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, lintWarning.exec)
  assert.equal(lintWarningResult.stage, 'needs_correction')
  assert.equal(lintWarning.draft.finishCalls, 0)

  const jsBlocked = await createHarness()
  jsBlocked.draft.documentJson = JSON.stringify({
    version: '1.0.0',
    children: [{ type: 'frame', name: 'Login', children: [{
      type: 'frame', name: 'Form', children: [{ type: 'text_input', height: 20 }],
    }] }],
  })
  await begin(jsBlocked)
  await jsBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, jsBlocked.exec)
  await jsBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, jsBlocked.exec)
  await jsBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, jsBlocked.exec)
  const jsResult = await jsBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, jsBlocked.exec)
  assert.equal(jsResult.stage, 'needs_correction')
  assert.equal(jsResult.canContinue, true)
  assert.match(jsResult.diagnostics.join(' '), /fill_container|height/i)
  assert.equal(jsBlocked.calls.write.length, 0)
})

test('publication races retain the draft; explicit abort, owner cleanup, and plugin disposal tear it down', async () => {
  const writeError = new Error('createIfAbsent lost race')
  const harness = await createHarness({ writeError })
  await begin(harness)
  await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  await harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec)
  await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  await assert.rejects(harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec), /lost race/)
  const aborted = await harness.tools.openpencil_pipeline_abort.execute({ draftId: DRAFT_ID }, harness.exec)
  assert.equal(aborted.aborted, true)
  assert.deepEqual(harness.draft.aborts, [{ draftId: DRAFT_ID, owner: 'session-from-exec' }])

  const ownerHarness = await createHarness()
  await begin(ownerHarness)
  await ownerHarness.controller.abortOwner('session-from-exec')
  assert.deepEqual(ownerHarness.draft.abortOwners, ['session-from-exec'])
  await ownerHarness.controller.dispose()
  await ownerHarness.controller.dispose()
  assert.equal(ownerHarness.draft.disposeCalls, 1)
})

test('publication prepares presentation artifacts before commit and treats post-commit observation as best effort', async () => {
  const snapshotBlocked = await createHarness({ snapshotError: new Error('snapshot cache unavailable') })
  await begin(snapshotBlocked)
  await snapshotBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, snapshotBlocked.exec)
  await snapshotBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, snapshotBlocked.exec)
  await snapshotBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, snapshotBlocked.exec)
  await assert.rejects(
    snapshotBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, snapshotBlocked.exec),
    /snapshot cache unavailable/,
  )
  assert.equal(snapshotBlocked.calls.write.length, 0, 'target must remain absent when presentation preparation fails')

  const observerBlocked = await createHarness({ observeError: new Error('observer failed after commit') })
  await begin(observerBlocked)
  await observerBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, observerBlocked.exec)
  await observerBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, observerBlocked.exec)
  await observerBlocked.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, observerBlocked.exec)
  const published = await observerBlocked.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, observerBlocked.exec)
  assert.equal(published.published, true)
  assert.equal(observerBlocked.calls.write.length, 1)
})

test('publication rejects a post-final PNG whose cached bytes changed after visual inspection', async () => {
  const draft = new FakeDraftController()
  draft.png = Buffer.concat([SAFE_PNG, Buffer.from([0])])
  const harness = await createHarness({ draft })
  await begin(harness)
  await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  await harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec)
  const inspected = await harness.tools.openpencil_pipeline_inspect.execute({ draftId: DRAFT_ID, kind: 'screenshot' }, harness.exec)
  await writeFile(inspected.screenshot.path, Buffer.concat([draft.png, Buffer.from([1])]))
  await assert.rejects(
    harness.tools.openpencil_pipeline_finish.execute({ draftId: DRAFT_ID }, harness.exec),
    /preview changed since visual inspection/,
  )
  assert.equal(harness.calls.write.length, 0)
})
