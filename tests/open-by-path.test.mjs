import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { OPEN_BY_PATH_ROUTE, OpenByPathController } from '../lib/open-by-path.js'
import { RENDER_ROUTE_PREFIX, RenderAccessController } from '../lib/renderer.js'

function startServer(controller) {
  const server = createServer((req, res) => { void controller.handle(req, res) })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

function closeServer(server) {
  return new Promise(resolve => server.close(resolve))
}

async function post(server, body, headers = {}) {
  const port = server.address().port
  const response = await fetch(`http://127.0.0.1:${port}${OPEN_BY_PATH_ROUTE}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return { status: response.status, json: await response.json().catch(() => undefined) }
}

function originHeader(server) {
  return { origin: `http://127.0.0.1:${server.address().port}` }
}

function stubSessions(sessionsById) {
  return { get: id => sessionsById.get(id) }
}

function stubEditor() {
  return {
    grantFor: (path, sha256) => ({
      enabled: true,
      launchUrl: `/_dsh/dsh-openpencil/editor/token-${sha256.slice(0, 8)}/launch`,
      refreshUrl: `/_dsh/dsh-openpencil/editor/token-${sha256.slice(0, 8)}/refresh`,
    }),
  }
}

async function makeWorkspace() {
  const root = await mkdtemp(join(tmpdir(), 'open-by-path-'))
  // Isolate the immutable snapshot store (createDocumentSnapshot persists into
  // the state root) for this test, mirroring the presentation-hydration tests.
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = join(root, 'dsh-home')
  const workspace = join(root, 'ws')
  await mkdir(join(workspace, 'sub'), { recursive: true })
  const content = JSON.stringify({ spike: 'open-by-path' })
  await writeFile(join(workspace, 'design.op'), content)
  await writeFile(join(workspace, 'sub', 'inner.op'), content)
  await writeFile(join(workspace, 'notes.txt'), 'not a design')
  await writeFile(join(workspace, 'empty.op'), '')
  await writeFile(join(root, 'outside.op'), content)
  const sha256 = createHash('sha256').update(content).digest('hex')
  const restore = () => { process.env.DSH_HOME = previousHome }
  return { root, workspace, content, sha256, restore }
}

function sharedFixtures() {
  const render = new RenderAccessController(randomBytes(32))
  render.attachRoute()
  return { render }
}

test('open-by-path mints the full grant for a session workspace .op', async () => {
  const { root, workspace, content, sha256, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const { status, json } = await post(server, { sessionId: 's1', path: 'design.op' }, originHeader(server))
    assert.equal(status, 200)
    assert.equal(json.ok, true)
    assert.equal(json.grant.schemaVersion, 2)
    assert.equal(json.grant.document.sha256, sha256)
    assert.equal(json.grant.document.path, join(workspace, 'design.op'))
    assert.ok(json.grant.document.url.startsWith(RENDER_ROUTE_PREFIX))
    assert.ok(json.grant.document.downloadUrl.startsWith(RENDER_ROUTE_PREFIX))
    assert.equal(json.grant.editor.enabled, true)
    assert.ok(json.grant.editor.launchUrl.includes(sha256.slice(0, 8)))
    assert.equal(json.grant.document.bytes, Buffer.byteLength(content))
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path resolves workspace-relative subdirectories and absolute contained paths', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const sub = await post(server, { sessionId: 's1', path: 'sub/inner.op' }, originHeader(server))
    assert.equal(sub.status, 200)
    const absolute = await post(server, { sessionId: 's1', path: join(workspace, 'design.op') }, originHeader(server))
    assert.equal(absolute.status, 200)
    assert.equal(absolute.json.grant.document.path, join(workspace, 'design.op'))
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path refuses paths outside the session workspace', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const outside = await post(server, { sessionId: 's1', path: join(root, 'outside.op') }, originHeader(server))
    assert.equal(outside.status, 403)
    const traversal = await post(server, { sessionId: 's1', path: '../outside.op' }, originHeader(server))
    assert.equal(traversal.status, 403)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path refuses non-.op, missing, and empty files with distinct statuses', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const nonOp = await post(server, { sessionId: 's1', path: 'notes.txt' }, originHeader(server))
    assert.equal(nonOp.status, 400)
    const missing = await post(server, { sessionId: 's1', path: 'ghost.op' }, originHeader(server))
    assert.equal(missing.status, 404)
    const empty = await post(server, { sessionId: 's1', path: 'empty.op' }, originHeader(server))
    assert.equal(empty.status, 422)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path refuses unknown sessions and sessions without a workspace', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([
      ['s1', { header: { cwd: workspace } }],
      ['s2', { header: {} }],
    ])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const unknown = await post(server, { sessionId: 's3', path: 'design.op' }, originHeader(server))
    assert.equal(unknown.status, 404)
    const noCwd = await post(server, { sessionId: 's2', path: 'design.op' }, originHeader(server))
    assert.equal(noCwd.status, 404)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path requires DSH request authentication without a browser Origin', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => false)
  const server = await startServer(controller)
  try {
    const rejected = await post(server, { sessionId: 's1', path: 'design.op' })
    assert.equal(rejected.status, 403)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path rejects GET and malformed bodies', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const port = server.address().port
    const getResponse = await fetch(`http://127.0.0.1:${port}${OPEN_BY_PATH_ROUTE}`, {
      headers: originHeader(server),
    })
    assert.equal(getResponse.status, 405)
    assert.equal(getResponse.headers.get('allow'), 'POST')
    const badJson = await post(server, '{not json', { ...originHeader(server) })
    assert.equal(badJson.status, 400)
    const missingFields = await post(server, { sessionId: 's1' }, originHeader(server))
    assert.equal(missingFields.status, 400)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})

test('open-by-path follows file content: a changed file mints a different snapshot', async () => {
  const { root, workspace, restore } = await makeWorkspace()
  const { render } = sharedFixtures()
  const controller = new OpenByPathController({
    sessions: stubSessions(new Map([['s1', { header: { cwd: workspace } }]])),
    render,
    editor: stubEditor(),
  })
  controller.attachRequestAuthentication(() => true)
  const server = await startServer(controller)
  try {
    const first = await post(server, { sessionId: 's1', path: 'design.op' }, originHeader(server))
    assert.equal(first.status, 200)
    await writeFile(join(workspace, 'design.op'), JSON.stringify({ spike: 'changed' }))
    const second = await post(server, { sessionId: 's1', path: 'design.op' }, originHeader(server))
    assert.equal(second.status, 200)
    assert.notEqual(second.json.grant.document.sha256, first.json.grant.document.sha256)
    assert.notEqual(second.json.grant.editor.launchUrl, first.json.grant.editor.launchUrl)
  } finally {
    await closeServer(server)
    restore()
    await rm(root, { recursive: true, force: true })
  }
})
