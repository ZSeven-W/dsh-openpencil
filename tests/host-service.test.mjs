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
  let disposeInjectedRoutes

  const webServer = {
    register(route) {
      routeRegistrations.push(route)
      return () => { routeRemovals.push(route.path) }
    },
  }
  const ctx = {
    tools: {
      register(tool) {
        registeredTools.push(tool)
        return () => {}
      },
    },
    effect(install) {
      return install()
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
    const { apply } = await import(`../lib/index.js?host-api=${Date.now()}`)
    const disposePlugin = await apply(ctx)

    assert.deepEqual(injectedServices, [['webServer']])
    assert.equal(registeredTools.length, 4)
    assert.deepEqual(registeredTools.map(tool => tool.name), [
      'openpencil_render',
      'openpencil_selection',
      'openpencil_create',
      'openpencil_edit',
    ])
    assert.equal(registeredTools.some(tool => tool.name === 'design_render'), false, 'legacy render alias must remain client-only')
    assert.equal(registeredTools[0].output.schema.properties.sourceTool.const, 'openpencil_render')
    assert.deepEqual(
      routeRegistrations.map(route => ({ kind: route.kind, path: route.path })),
      [
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/render' },
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/viewer-assets' },
        { kind: 'prefix', path: '/_dsh/dsh-openpencil/editor' },
      ],
    )
    assert.equal(typeof disposeInjectedRoutes, 'function')

    disposeInjectedRoutes()
    assert.deepEqual(routeRemovals.sort(), routeRegistrations.map(route => route.path).sort())
    disposePlugin()
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    await rm(root, { recursive: true, force: true })
  }
})
