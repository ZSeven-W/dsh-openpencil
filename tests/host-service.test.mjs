import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('plugin mounts its HTTP routes through the rc.2 webServer service', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-openpencil-host-api-'))
  const previousDshHome = process.env.DSH_HOME
  process.env.DSH_HOME = join(root, 'dsh-home')

  const routeRegistrations = []
  const routeRemovals = []
  const injectedServices = []
  const registeredTools = []
  const emittedEvents = []
  const eventListeners = []
  let disposeInjectedRoutes
  let releaseEditorHostDispose
  const editorHostDisposeBarrier = new Promise(resolve => { releaseEditorHostDispose = resolve })
  const { EditorHostController } = await import('../lib/editor-host.js')
  const { DesignDraftController } = await import('../lib/design-draft-controller.js')
  const originalEditorHostDispose = EditorHostController.prototype.dispose
  const originalAbortOwner = DesignDraftController.prototype.abortOwner
  let editorHostDisposeCalls = 0
  const abortedDraftOwners = []
  EditorHostController.prototype.dispose = function disposeWithBarrier() {
    editorHostDisposeCalls += 1
    return editorHostDisposeBarrier
  }
  DesignDraftController.prototype.abortOwner = async function abortOwnerForHostTest(owner) {
    abortedDraftOwners.push(owner)
    return 0
  }

  const webServer = {
    register(route) {
      routeRegistrations.push(route)
      return () => { routeRemovals.push(route.path) }
    },
  }
  const ctx = {
    sessions: { get() { return undefined } },
    fs: {
      async lstat() { return undefined },
      async resolve(path) { return { targetKey: `test:${path}`, displayPath: path } },
      processPath(target) { return String(target.targetKey).replace(/^test:/, '') },
      async writeText(_target, content) {
        return { operation: 'create', version: 'test-version', before: null, after: content }
      },
    },
    sandboxPolicy: {
      resolve() { return { mode: 'workspace-write', workspaceRoot: root } },
    },
    get() { return undefined },
    tools: {
      register(tool) {
        registeredTools.push(tool)
        return () => {}
      },
    },
    effect(install) {
      return install()
    },
    on(name, listener) {
      eventListeners.push({ name, listener })
      return () => {}
    },
    emit(...args) {
      emittedEvents.push(args)
    },
    inject(services, install) {
      injectedServices.push([...services])
      install({
        webServer,
        effect(mount) {
          disposeInjectedRoutes = mount()
          return disposeInjectedRoutes
        },
      })
    },
    logger: { info() {} },
  }

  try {
    const { apply, inject } = await import(`../lib/index.js?host-api=${Date.now()}`)
    const disposePlugin = await apply(ctx)

    assert.deepEqual(inject, ['tools', 'sessions', 'fs', 'sandboxPolicy'])
    assert.deepEqual(injectedServices, [['skills'], ['systemPrompt'], ['webServer']])
    assert.equal(registeredTools.length, 11)
    assert.deepEqual(registeredTools.map(tool => tool.name), [
      'openpencil_render',
      'openpencil_selection',
      'openpencil_new',
      'openpencil_create',
      'openpencil_edit',
      'openpencil_pipeline_begin',
      'openpencil_pipeline_context',
      'openpencil_pipeline_batch',
      'openpencil_pipeline_inspect',
      'openpencil_pipeline_finish',
      'openpencil_pipeline_abort',
    ])
    assert.equal(registeredTools.some(tool => tool.name === 'design_render'), false, 'legacy render alias must remain client-only')
    assert.equal(registeredTools[0].output.schema.properties.sourceTool.const, 'openpencil_render')
    assert.deepEqual([...registeredTools[2].parameters.required].sort(), ['path', 'script'])
    assert.equal(registeredTools[2].output.schema.properties.created.const, true)
    assert.equal(registeredTools[2].output.schema.properties.sourceTool.const, 'openpencil_new')
    assert.equal(registeredTools[2].output.schema.properties.previewIntent.const, 'document')
    assert.equal(typeof registeredTools[2].output.presentationMeta, 'function')
    assert.deepEqual([...registeredTools[5].parameters.required].sort(), ['brief', 'path'])
    assert.deepEqual([...registeredTools[6].parameters.required].sort(), ['draftId', 'tool'])
    assert.deepEqual([...registeredTools[7].parameters.required].sort(), ['draftId'])
    assert.deepEqual([...registeredTools[8].parameters.required].sort(), ['draftId', 'kind'])
    assert.equal(typeof registeredTools[8].output.presentationMeta, 'function')
    assert.deepEqual([...registeredTools[9].parameters.required].sort(), ['draftId'])
    assert.deepEqual([...registeredTools[10].parameters.required].sort(), ['draftId'])
    assert.equal(typeof registeredTools[9].output.presentationMeta, 'function')
    assert.deepEqual(emittedEvents, [], 'registration alone must not claim a filesystem observation')
    assert.deepEqual(
      routeRegistrations.map(route => ({ kind: route.kind, path: route.path })),
      [
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/render' },
        { kind: 'exact', path: '/_dsh/dsh-openpencil/presentation' },
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/viewer-assets' },
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/editor' },
      ],
    )
    assert.equal(typeof disposeInjectedRoutes, 'function')

    for (const event of eventListeners.filter(event => event.name === 'session/disposed')) {
      event.listener({ id: 'disposed-draft-owner' })
    }
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(abortedDraftOwners, ['disposed-draft-owner'])

    const routeDisposal = disposeInjectedRoutes()
    const pluginDisposal = disposePlugin()
    let routeDisposed = false
    let pluginDisposed = false
    void routeDisposal.then(() => { routeDisposed = true })
    void pluginDisposal.then(() => { pluginDisposed = true })
    await new Promise(resolve => setImmediate(resolve))

    assert.equal(editorHostDisposeCalls, 1, 'route and plugin cleanup must join one editor-host disposal')
    assert.equal(routeDisposed, false, 'route cleanup must await the editor-host teardown')
    assert.equal(pluginDisposed, false, 'plugin cleanup must await the editor-host teardown')
    assert.deepEqual(routeRemovals.sort(), routeRegistrations.map(route => route.path).sort())

    releaseEditorHostDispose()
    await Promise.all([routeDisposal, pluginDisposal])
  } finally {
    releaseEditorHostDispose?.()
    EditorHostController.prototype.dispose = originalEditorHostDispose
    DesignDraftController.prototype.abortOwner = originalAbortOwner
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    await rm(root, { recursive: true, force: true })
  }
})
