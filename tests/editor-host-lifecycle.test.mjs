import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { createServer, request as httpRequest } from 'node:http'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { test } from 'node:test'

const fakeHostSource = `#!/usr/bin/env node
const fs = require('node:fs')
const http = require('node:http')
const delay = Number(process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS || 0)
const logPath = process.env.FAKE_EDITOR_LOG
const mcpDelay = Number(process.env.FAKE_EDITOR_MCP_DELAY_MS || 0)
const documentDelay = Number(process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS || 0)
let version = 1
const fileIndex = process.argv.indexOf('--file')
const sourcePath = process.argv[fileIndex + 1]
let document = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const server = http.createServer((req, res) => {
  if (req.url === '/api/mcp/document' && req.method === 'GET') {
    const snapshot = JSON.stringify({ document, version })
    fs.appendFileSync(logPath, JSON.stringify({ event: 'document-read-start' }) + '\\n')
    setTimeout(() => {
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(snapshot)
    }, documentDelay)
    return
  }
  if (req.url === '/api/mcp/document' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      const value = JSON.parse(body)
      if (value.baseVersion !== version) {
        res.statusCode = 409
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ ok: false, error: 'version-conflict', version }))
        return
      }
      document = value.document
      version += 1
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ ok: true, version }))
    })
    return
  }
  if (req.url === '/api/mcp/version') {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ version }))
    return
  }
  if (req.url === '/mcp' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      const call = JSON.parse(body)
      const tool = call && call.params && call.params.name
      const args = call && call.params && call.params.arguments
      fs.appendFileSync(logPath, JSON.stringify({ event: 'mcp-start', tool, args }) + '\\n')
      setTimeout(() => {
        if (tool === 'update_node' && args && typeof args.id === 'string') {
          const children = Array.isArray(document.children) ? document.children : []
          document = {
            ...document,
            children: [
              ...children.filter(child => !child || child.id !== args.id),
              { id: args.id, ...(typeof args.name === 'string' ? { name: args.name } : {}) },
            ],
          }
        }
        if (tool === 'batch_design') {
          document = {
            ...document,
            children: [
              ...(Array.isArray(document.children) ? document.children : []),
              { id: 'node-final-batch', name: 'Mutation from batch_design' },
            ],
          }
        }
        // A successful finalize is allowed to be a no-op. The real runtime
        // does not advance its document version when no cleanup is needed.
        if (tool !== 'finalize_design') version += 1
        const value = tool === 'finalize_design'
          ? { roots: 1, repairs: 0, advisories: [], summary: 'No repairs needed' }
          : { applied: true }
        res.statusCode = 200
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: 'fake-mcp',
          result: {
            content: [{ type: 'text', text: JSON.stringify(value) }],
          },
        }))
      }, mcpDelay)
    })
    return
  }
  res.statusCode = 200
  res.setHeader('content-type', 'application/javascript')
  res.end('/* fake OpenPencil web host */')
})
let closing = false
function close() {
  if (closing) return
  closing = true
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 200).unref()
}
server.listen(0, '127.0.0.1', () => {
  const port = server.address().port
  fs.appendFileSync(logPath, JSON.stringify({
    pid: process.pid,
    port,
    sourcePath,
    webBundleDir: process.env.OPENPENCIL_WEB_BUNDLE_DIR,
    canvasKitDir: process.env.OPENPENCIL_CANVASKIT_DIR,
  }) + '\\n')
  setTimeout(() => {
    process.stdout.write(JSON.stringify({ ok: true, port, token: 'fake-daemon-token-123456789', version: 'test' }) + '\\n')
  }, delay)
})
process.stdin.resume()
process.stdin.on('end', close)
process.on('SIGTERM', close)
`

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function closeServer(server) {
  return new Promise(resolve => server.close(resolve))
}

async function waitForHosts(path, count) {
  const deadline = Date.now() + 3_000
  while (Date.now() < deadline) {
    const text = await readFile(path, 'utf8').catch(() => '')
    const entries = text.trim() === ''
      ? []
      : text.trim().split('\n').map(line => JSON.parse(line)).filter(entry => Number.isInteger(entry.pid))
    if (entries.length >= count) return entries
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`fake editor host did not record ${count} start(s)`)
}

async function waitForLogEvent(path, event) {
  const deadline = Date.now() + 3_000
  while (Date.now() < deadline) {
    const text = await readFile(path, 'utf8').catch(() => '')
    const entries = text.trim() === '' ? [] : text.trim().split('\n').map(line => JSON.parse(line))
    if (entries.some(entry => entry.event === event)) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`fake editor host did not record ${event}`)
}

async function readMcpCalls(path) {
  const text = await readFile(path, 'utf8').catch(() => '')
  return text.trim() === ''
    ? []
    : text.trim().split('\n').map(line => JSON.parse(line)).filter(entry => entry.event === 'mcp-start')
}

class MockResponse extends EventEmitter {
  statusCode = 0
  writableFinished = false
  destroyed = false
  headers = new Map()
  body = ''

  setHeader(name, value) {
    this.headers.set(name.toLowerCase(), value)
  }

  end(body = '') {
    this.body = String(body)
    this.writableFinished = true
    this.emit('finish')
  }
}

function pendingRequest(path, method, origin, remoteAddress = '127.0.0.1') {
  const request = new PassThrough()
  request.url = path
  request.method = method
  request.headers = {
    origin,
    host: new URL(origin).host,
    'content-type': 'application/json',
  }
  Object.defineProperty(request, 'socket', {
    configurable: true,
    value: { remoteAddress },
  })
  return request
}

async function dispatchControllerRequest(controller, path, method, origin, remoteAddress, body = '') {
  const request = pendingRequest(path, method, origin, remoteAddress)
  const response = new MockResponse()
  const handled = controller.handle(request, response)
  request.end(body)
  await handled
  return response
}

function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function waitForExit(pid) {
  const deadline = Date.now() + 3_000
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`fake editor host ${pid} did not exit`)
}

async function createHarness(delayMs, runtimeVersion = 'test') {
  const root = await mkdtemp(join(tmpdir(), 'dsh-openpencil-editor-lifecycle-'))
  const binary = join(root, 'fake-editor-host.cjs')
  const logPath = join(root, 'hosts.jsonl')
  const sourcePath = join(root, 'design.op')
  const document = '{"version":1,"children":[]}'
  await Promise.all([
    writeFile(binary, fakeHostSource),
    writeFile(logPath, ''),
    writeFile(sourcePath, document),
  ])
  await chmod(binary, 0o755)

  const previousDshHome = process.env.DSH_HOME
  const previousDelay = process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS
  const previousMcpDelay = process.env.FAKE_EDITOR_MCP_DELAY_MS
  const previousDocumentDelay = process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS
  const previousLog = process.env.FAKE_EDITOR_LOG
  process.env.DSH_HOME = join(root, 'dsh-home')
  process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS = String(delayMs)
  process.env.FAKE_EDITOR_MCP_DELAY_MS = '0'
  process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS = '0'
  process.env.FAKE_EDITOR_LOG = logPath

  const masterKey = randomBytes(32)
  const { EditorHostController } = await import(`../lib/editor-host.js?lifecycle=${Date.now()}-${Math.random()}`)
  const { EditorRecoveryStore } = await import(`../lib/editor-recovery.js?lifecycle=${Date.now()}-${Math.random()}`)
  const controller = new EditorHostController(masterKey, {
    binary,
    webBundleDir: root,
    canvasKitDir: root,
    openPencilVersion: runtimeVersion,
    revision: '0'.repeat(40),
    source: 'override',
  })
  const recoveryStore = new EditorRecoveryStore(masterKey)
  const detach = controller.attachRoute()
  const grant = controller.grantFor(sourcePath, sha256(document))
  assert.ok(grant)

  const server = createServer((req, res) => { void controller.handle(req, res) })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  assert.equal(typeof address, 'object')
  const origin = `http://127.0.0.1:${address.port}`
  const request = (path, init = {}) => fetch(`${origin}${path}`, {
    ...init,
    headers: { origin, ...(init.headers ?? {}) },
  })

  return {
    controller,
    detach,
    grant,
    root,
    sourcePath,
    sourceDocument: document,
    recoveryStore,
    logPath,
    request,
    origin,
    async cleanup() {
      detach()
      await controller.dispose()
      await closeServer(server)
      if (previousDshHome === undefined) delete process.env.DSH_HOME
      else process.env.DSH_HOME = previousDshHome
      if (previousDelay === undefined) delete process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS
      else process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS = previousDelay
      if (previousMcpDelay === undefined) delete process.env.FAKE_EDITOR_MCP_DELAY_MS
      else process.env.FAKE_EDITOR_MCP_DELAY_MS = previousMcpDelay
      if (previousDocumentDelay === undefined) delete process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS
      else process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS = previousDocumentDelay
      if (previousLog === undefined) delete process.env.FAKE_EDITOR_LOG
      else process.env.FAKE_EDITOR_LOG = previousLog
      await rm(root, { recursive: true, force: true })
    },
  }
}

test('editor peer classifier accepts only loopback network addresses', async () => {
  const { isLoopbackRemoteAddress } = await import(`../lib/editor-host.js?peer=${Date.now()}-${Math.random()}`)
  for (const address of [
    '127.0.0.1',
    '127.255.255.254',
    '::1',
    '::ffff:127.0.0.1',
    '::ffff:127.42.3.9',
    '::ffff:7f00:1',
  ]) assert.equal(isLoopbackRemoteAddress(address), true, address)
  for (const address of [
    undefined,
    'localhost',
    '0.0.0.0',
    '192.0.2.44',
    '::',
    '::ffff:126.255.255.255',
    '::ffff:128.0.0.1',
    '::ffff:c000:22c',
  ]) assert.equal(isLoopbackRemoteAddress(address), false, String(address))
})

test('managed editor rejects a daemon from a different OpenPencil release and reaps it', async () => {
  const harness = await createHarness(0, '0.8.5')
  try {
    const response = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'version-mismatch' }),
    })
    assert.equal(response.status, 500)
    assert.match(
      (await response.json()).error,
      /runtime version mismatch: expected 0\.8\.5, received test/,
    )
    const [host] = await waitForHosts(harness.logPath, 1)
    await waitForExit(host.pid)
  } finally {
    await harness.cleanup()
  }
})

test('managed editor always injects both asset directories from its verified atomic runtime', async () => {
  const previousBundle = process.env.OPENPENCIL_WEB_BUNDLE_DIR
  const previousCanvasKit = process.env.OPENPENCIL_CANVASKIT_DIR
  process.env.OPENPENCIL_WEB_BUNDLE_DIR = '/tmp/unrelated-openpencil-web-bundle'
  process.env.OPENPENCIL_CANVASKIT_DIR = '/tmp/unrelated-openpencil-canvaskit'
  const harness = await createHarness(0)
  try {
    const response = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'atomic-runtime-env' }),
    })
    assert.equal(response.status, 200, await response.clone().text())
    const [host] = await waitForHosts(harness.logPath, 1)
    assert.equal(host.webBundleDir, harness.root)
    assert.equal(host.canvasKitDir, harness.root)
  } finally {
    if (previousBundle === undefined) delete process.env.OPENPENCIL_WEB_BUNDLE_DIR
    else process.env.OPENPENCIL_WEB_BUNDLE_DIR = previousBundle
    if (previousCanvasKit === undefined) delete process.env.OPENPENCIL_CANVASKIT_DIR
    else process.env.OPENPENCIL_CANVASKIT_DIR = previousCanvasKit
    await harness.cleanup()
  }
})

test('createDocumentBatch uses a transient daemon without replacing the active editor', async () => {
  const harness = await createHarness(0)
  try {
    const ownerSessionId = 'owner-visible-editor'
    const launchResponse = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: ownerSessionId }),
    })
    assert.equal(launchResponse.status, 200, await launchResponse.clone().text())
    const launch = await launchResponse.json()
    const [visibleHost] = await waitForHosts(harness.logPath, 1)
    assert.equal(isAlive(visibleHost.pid), true)

    const result = await harness.controller.createDocumentBatch({
      script: 'const root = I(null, { type: "frame", name: "Fresh design", width: 390, height: 844 });',
      canvasWidth: 390,
      signal: new AbortController().signal,
    })
    const hosts = await waitForHosts(harness.logPath, 2)
    const transientHost = hosts[1]

    await waitForExit(transientHost.pid)
    assert.equal(isAlive(visibleHost.pid), true, 'transient generation must not retire the browser-owned editor')
    assert.notEqual(transientHost.sourcePath, harness.sourcePath)
    await assert.rejects(readFile(transientHost.sourcePath), error => error?.code === 'ENOENT')
    assert.deepEqual(JSON.parse(result.documentJson).children, [
      { id: 'node-final-batch', name: 'Mutation from batch_design' },
    ])
    assert.deepEqual(await readMcpCalls(harness.logPath), [
      {
        event: 'mcp-start',
        tool: 'batch_design',
        args: {
          script: 'const root = I(null, { type: "frame", name: "Fresh design", width: 390, height: 844 });',
          postProcess: true,
          canvasWidth: 390,
        },
      },
      { event: 'mcp-start', tool: 'finalize_design', args: {} },
    ])
    assert.deepEqual(result.result, {
      pipeline: { mode: 'script', postProcessed: true, finalized: true },
      build: { applied: true },
      finalize: { roots: 1, repairs: 0, advisories: [], summary: 'No repairs needed' },
    })

    const selection = await harness.controller.getActiveSelection({ ownerSessionId })
    assert.equal(selection.sourcePath, harness.sourcePath)
    const closeResponse = await harness.request(launch.closeUrl, { method: 'DELETE' })
    assert.equal(closeResponse.status, 200)
  } finally {
    await harness.cleanup()
  }
})

test('createDocumentBatch aborts startup and removes its transient daemon and starter', async () => {
  const harness = await createHarness(1_000)
  try {
    const abort = new AbortController()
    const creating = harness.controller.createDocumentBatch({
      script: 'I(null, { type: "frame", name: "Cancelled" });',
      signal: abort.signal,
    })
    const [transientHost] = await waitForHosts(harness.logPath, 1)
    abort.abort(new Error('cancel new design'))
    await assert.rejects(creating, /cancel new design/)
    await waitForExit(transientHost.pid)
    await assert.rejects(readFile(transientHost.sourcePath), error => error?.code === 'ENOENT')
  } finally {
    await harness.cleanup()
  }
})

test('controller disposal stops and joins an in-flight transient design batch', async () => {
  const harness = await createHarness(0)
  try {
    process.env.FAKE_EDITOR_MCP_DELAY_MS = '1_000'
    const creating = harness.controller.createDocumentBatch({
      script: 'I(null, { type: "frame", name: "Disposed" });',
      signal: new AbortController().signal,
    })
    const [transientHost] = await waitForHosts(harness.logPath, 1)
    await waitForLogEvent(harness.logPath, 'mcp-start')
    let creatingSettled = false
    const outcome = creating.then(
      value => ({ status: 'fulfilled', value }),
      error => ({ status: 'rejected', error }),
    ).finally(() => { creatingSettled = true })
    const disposal = harness.controller.dispose()
    await disposal
    const creationOutcome = await outcome
    assert.equal(creatingSettled, true, 'dispose must not resolve before the accepted transient operation settles')
    assert.ok(creationOutcome.status === 'fulfilled' || creationOutcome.status === 'rejected')
    await waitForExit(transientHost.pid)
    await assert.rejects(readFile(transientHost.sourcePath), error => error?.code === 'ENOENT')
  } finally {
    await harness.cleanup()
  }
})

test('editor launch capability rejects a non-loopback socket despite spoofed loopback Host and Origin', async () => {
  const harness = await createHarness(0)
  try {
    const response = await dispatchControllerRequest(
      harness.controller,
      harness.grant.launchUrl,
      'POST',
      harness.origin,
      '192.0.2.44',
      JSON.stringify({ sessionId: 'remote-attacker' }),
    )
    assert.equal(response.statusCode, 403)
    assert.match(JSON.parse(response.body).error, /loopback network peer/)
    assert.equal((await readFile(harness.logPath, 'utf8')).trim(), '', 'rejected peer must not start an editor child')
    await assert.rejects(harness.controller.getActiveSelection(), /No active OpenPencil editor/)
  } finally {
    await harness.cleanup()
  }
})

test('selection bearer remains usable by local GETs without Origin and rejects remote peers', async () => {
  const harness = await createHarness(0)
  try {
    const launch = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'selection-peer-test' }),
    })).json()

    const browserGet = await fetch(`${harness.origin}${launch.selectionUrl}`)
    assert.equal(browserGet.status, 200, 'same-origin browser GET may legitimately omit Origin')

    const mappedLoopback = await dispatchControllerRequest(
      harness.controller,
      launch.selectionUrl,
      'GET',
      harness.origin,
      '::ffff:127.42.3.9',
    )
    assert.equal(mappedLoopback.statusCode, 200)

    const remote = await dispatchControllerRequest(
      harness.controller,
      launch.selectionUrl,
      'GET',
      harness.origin,
      '198.51.100.19',
    )
    assert.equal(remote.statusCode, 403, 'opaque session id is not sufficient for a remote network peer')
    assert.match(JSON.parse(remote.body).error, /loopback network peer/)
  } finally {
    await harness.cleanup()
  }
})

test('concurrent launch requests serialize and stale cleanup cannot close the successor', async () => {
  const harness = await createHarness(120)
  try {
    const firstPending = harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-one' }),
    })
    await waitForHosts(harness.logPath, 1)
    const secondPending = harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-two' }),
    })

    const first = await (await firstPending).json()
    const second = await (await secondPending).json()
    const hosts = await waitForHosts(harness.logPath, 2)

    assert.notEqual(first.sessionId, second.sessionId)
    assert.equal(isAlive(hosts[0].pid), false, 'successor launch must retire the first child')
    assert.equal((await fetch(second.iframeUrl)).status, 200)

    const staleClose = await harness.request(first.closeUrl, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: first.sessionId }),
    })
    assert.equal(staleClose.status, 200)
    assert.equal((await fetch(second.iframeUrl)).status, 200, 'stale effect cleanup must not stop the successor')

    const currentClose = await harness.request(second.closeUrl, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: second.sessionId }),
    })
    assert.equal(currentClose.status, 200)
    assert.equal(isAlive(hosts[1].pid), false)
  } finally {
    await harness.cleanup()
  }
})

test('user close returns 409 without stopping an editor while a save is in flight', async () => {
  const harness = await createHarness(0)
  try {
    const launchResponse = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-saving' }),
    })
    const launch = await launchResponse.json()
    const [host] = await waitForHosts(harness.logPath, 1)

    const saveRequest = pendingRequest(launch.saveUrl, 'POST', harness.origin)
    const saveResponse = new MockResponse()
    const savePending = harness.controller.handle(saveRequest, saveResponse)

    const close = await harness.request(launch.closeUrl, { method: 'DELETE' })
    assert.equal(close.status, 409)
    assert.match((await close.json()).error, /saving or applying/)
    assert.equal(isAlive(host.pid), true, 'rejected close must keep the managed editor alive')
    assert.equal((await fetch(launch.iframeUrl)).status, 200)

    saveRequest.end(JSON.stringify({
      sessionId: launch.sessionId,
      docJson: '{"version":1,"children":[]}',
      generation: 0,
      revision: 1,
    }))
    await savePending
    assert.equal(saveResponse.statusCode, 200)

    const retry = await harness.request(launch.closeUrl, { method: 'DELETE' })
    assert.equal(retry.status, 200)
    await waitForExit(host.pid)
  } finally {
    await harness.cleanup()
  }
})

test('dirty daemon recovery survives a session close and restores without overwriting the source', async () => {
  const harness = await createHarness(0)
  try {
    const first = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-recovery-one' }),
    })).json()
    const originalSource = await readFile(join(harness.root, 'design.op'), 'utf8')
    const draft = { version: 1, children: [{ id: 'unsaved-recovery-node' }] }
    const daemonOrigin = new URL(first.iframeUrl).origin
    const changed = await fetch(`${daemonOrigin}/api/mcp/document`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ document: draft, sourceClientId: 'test', baseVersion: 1 }),
    })
    assert.equal(changed.status, 200)

    const captured = await harness.request(first.recoveryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: first.sessionId }),
    })
    assert.equal(captured.status, 200, await captured.clone().text())
    const captureBody = await captured.json()
    assert.equal(captureBody.ok, true)
    assert.match(captureBody.recovery.id, /^[A-Za-z0-9_-]{43}$/)
    assert.equal(JSON.stringify(captureBody).includes(harness.root), false, 'public recovery metadata must not expose an absolute path')

    assert.equal((await harness.request(first.closeUrl, { method: 'DELETE' })).status, 200)
    const second = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-recovery-two' }),
    })).json()
    assert.equal(second.recovery.id, captureBody.recovery.id)

    const restored = await harness.request(`${second.recoveryUrl}/${second.recovery.id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: second.sessionId }),
    })
    assert.equal(restored.status, 200)
    assert.deepEqual(JSON.parse((await restored.json()).docJson), draft)
    assert.equal(await readFile(join(harness.root, 'design.op'), 'utf8'), originalSource, 'restore must not overwrite the .op source')
  } finally {
    await harness.cleanup()
  }
})

test('recovery keeps the launch baseline when disk and daemon both diverge', async () => {
  const harness = await createHarness(0)
  try {
    const first = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-baseline-a' }),
    })).json()
    const sourcePath = join(harness.root, 'design.op')
    const externalSource = '{"version":1,"children":[{"id":"external-b"}]}'
    const daemonDraft = { version: 1, children: [{ id: 'daemon-c' }] }
    await writeFile(sourcePath, externalSource)
    const pushed = await fetch(`${new URL(first.iframeUrl).origin}/api/mcp/document`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ document: daemonDraft, sourceClientId: 'test', baseVersion: 1 }),
    })
    assert.equal(pushed.status, 200)

    const capture = await (await harness.request(first.recoveryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: first.sessionId }),
    })).json()
    assert.equal(capture.ok, true)
    assert.equal((await harness.request(first.closeUrl, { method: 'DELETE' })).status, 200)

    const grantForExternalSource = harness.controller.grantFor(sourcePath, sha256(externalSource))
    assert.ok(grantForExternalSource)
    const reopened = await (await harness.request(grantForExternalSource.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-source-b' }),
    })).json()
    assert.equal(reopened.recovery.id, capture.recovery.id)
    assert.equal(
      reopened.recovery.sourceChangedSinceCapture,
      true,
      'recovery C was based on launch baseline A, even though disk B was used for the clean comparison',
    )
  } finally {
    await harness.cleanup()
  }
})

test('idle pruning captures a dirty daemon before stopping it', async () => {
  const harness = await createHarness(0)
  const realDateNow = Date.now
  try {
    const launched = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-idle-dirty' }),
    })).json()
    const [host] = await waitForHosts(harness.logPath, 1)
    const daemonDraft = { version: 1, children: [{ id: 'idle-unsaved' }] }
    const pushed = await fetch(`${new URL(launched.iframeUrl).origin}/api/mcp/document`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ document: daemonDraft, sourceClientId: 'test', baseVersion: 1 }),
    })
    assert.equal(pushed.status, 200)

    const launchedAt = realDateNow()
    Date.now = () => launchedAt + 5 * 60 * 60 * 1000
    const pruneProbe = await harness.request('/_dsh/dsh-openpencil/editor/not-found')
    assert.equal(pruneProbe.status, 404)
    Date.now = realDateNow
    await waitForExit(host.pid)

    const reopened = await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-after-idle' }),
    })).json()
    assert.ok(reopened.recovery, 'idle cleanup must persist recovery metadata before stopping the daemon')
  } finally {
    Date.now = realDateNow
    await harness.cleanup()
  }
})

test('user close returns 409 without stopping an editor while an MCP mutation is in flight', async () => {
  const harness = await createHarness(0)
  try {
    process.env.FAKE_EDITOR_MCP_DELAY_MS = '150'
    const launchResponse = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-mutating' }),
    })
    const launch = await launchResponse.json()
    const [host] = await waitForHosts(harness.logPath, 1)

    const mutation = harness.controller.callActiveMcp('update_node', { id: 'node-1', name: 'Updated' }, {
      ownerSessionId: 'owner-mutating',
    })
    await waitForLogEvent(harness.logPath, 'mcp-start')

    const close = await harness.request(launch.closeUrl, { method: 'DELETE' })
    assert.equal(close.status, 409)
    assert.match((await close.json()).error, /saving or applying/)
    assert.equal(isAlive(host.pid), true, 'rejected close must keep the managed editor alive')
    assert.equal((await fetch(launch.iframeUrl)).status, 200)

    await mutation
    const retry = await harness.request(launch.closeUrl, { method: 'DELETE' })
    assert.equal(retry.status, 200)
    await waitForExit(host.pid)
  } finally {
    await harness.cleanup()
  }
})

test('controller disposal waits for an in-flight save before stopping the editor', async () => {
  const harness = await createHarness(0)
  try {
    const launchResponse = await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-force-dispose' }),
    })
    const launch = await launchResponse.json()
    const [host] = await waitForHosts(harness.logPath, 1)

    const saveRequest = pendingRequest(launch.saveUrl, 'POST', harness.origin)
    const saveResponse = new MockResponse()
    const savePending = harness.controller.handle(saveRequest, saveResponse)

    const firstDispose = harness.controller.dispose()
    const repeatedDispose = harness.controller.dispose()
    assert.equal(repeatedDispose, firstDispose, 'concurrent disposers must join one teardown promise')
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.equal(isAlive(host.pid), true, 'disposal must not kill a child before its accepted save settles')

    saveRequest.end(JSON.stringify({
      sessionId: launch.sessionId,
      docJson: '{"version":1,"children":[]}',
      generation: 0,
      revision: 1,
    }))
    await savePending
    await firstDispose
    await waitForExit(host.pid)
    assert.equal(saveResponse.statusCode, 200)
    await assert.rejects(
      harness.controller.getActiveSelection(),
      /No active OpenPencil editor/,
    )
  } finally {
    await harness.cleanup()
  }
})

test('controller disposal captures the final delayed MCP mutation before stopping the editor', async () => {
  const harness = await createHarness(0)
  try {
    process.env.FAKE_EDITOR_MCP_DELAY_MS = '150'
    await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-dispose-mutation' }),
    })).json()
    const [host] = await waitForHosts(harness.logPath, 1)

    const mutation = harness.controller.callActiveMcp('update_node', {
      id: 'node-final-dispose',
      name: 'Mutation before dispose',
    }, { ownerSessionId: 'owner-dispose-mutation' })
    await waitForLogEvent(harness.logPath, 'mcp-start')

    const disposing = harness.controller.dispose()
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.equal(isAlive(host.pid), true, 'disposal must wait for the delayed MCP mutation')

    await mutation
    await disposing
    await waitForExit(host.pid)
    const recovery = await harness.recoveryStore.find(
      harness.sourcePath,
      sha256(harness.sourceDocument),
      harness.sourceDocument,
    )
    assert.ok(recovery, 'disposal must persist the dirty post-mutation daemon document')
    const recovered = await harness.recoveryStore.read(harness.sourcePath, recovery.id)
    assert.ok(recovered)
    assert.deepEqual(JSON.parse(recovered.documentJson).children, [
      { id: 'node-final-dispose', name: 'Mutation before dispose' },
    ])
  } finally {
    await harness.cleanup()
  }
})

test('successor launch captures the final delayed MCP mutation before retiring the old editor', async () => {
  const harness = await createHarness(0)
  try {
    process.env.FAKE_EDITOR_MCP_DELAY_MS = '150'
    await (await harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-first-mutation' }),
    })).json()
    const [firstHost] = await waitForHosts(harness.logPath, 1)

    const mutation = harness.controller.callActiveMcp('update_node', {
      id: 'node-final-successor',
      name: 'Mutation before successor',
    }, { ownerSessionId: 'owner-first-mutation' })
    await waitForLogEvent(harness.logPath, 'mcp-start')

    const successorPending = harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-successor' }),
    })
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.equal(isAlive(firstHost.pid), true, 'successor launch must wait before retiring the mutating editor')

    await mutation
    const successor = await (await successorPending).json()
    await waitForExit(firstHost.pid)
    assert.ok(successor.recovery, 'successor launch must surface the retired editor recovery')
    const recovered = await harness.recoveryStore.read(harness.sourcePath, successor.recovery.id)
    assert.ok(recovered)
    assert.deepEqual(JSON.parse(recovered.documentJson).children, [
      { id: 'node-final-successor', name: 'Mutation before successor' },
    ])
  } finally {
    await harness.cleanup()
  }
})

for (const scenario of [
  {
    tool: 'update_node',
    args: { id: 'node-final-capture', name: 'Mutation after capture started' },
    expected: { id: 'node-final-capture', name: 'Mutation after capture started' },
  },
  {
    tool: 'batch_design',
    args: { operations: 'U("root", {"name":"Mutation from batch_design"})' },
    expected: { id: 'node-final-batch', name: 'Mutation from batch_design' },
  },
]) {
  test(`recovery capture serializes ${scenario.tool} accepted after capture starts through final close`, async () => {
    const harness = await createHarness(0)
    try {
      process.env.FAKE_EDITOR_DOCUMENT_DELAY_MS = '120'
      process.env.FAKE_EDITOR_MCP_DELAY_MS = '80'
      const launch = await (await harness.request(harness.grant.launchUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: `owner-capture-${scenario.tool}` }),
      })).json()

      const capturePending = harness.request(launch.recoveryUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: launch.sessionId }),
      })
      await waitForLogEvent(harness.logPath, 'document-read-start')

      const mutation = harness.controller.callActiveMcp(scenario.tool, scenario.args, {
        ownerSessionId: `owner-capture-${scenario.tool}`,
      })
      const initialCapture = await capturePending
      assert.equal(initialCapture.status, 200)
      assert.equal((await initialCapture.json()).recovery, null, 'the first capture intentionally observed the clean pre-mutation document')
      await waitForLogEvent(harness.logPath, 'mcp-start')
      const closePending = harness.request(launch.closeUrl, { method: 'DELETE' })
      await mutation

      const close = await closePending
      assert.equal(close.status, 200, await close.clone().text())
      const recovery = await harness.recoveryStore.find(
        harness.sourcePath,
        sha256(harness.sourceDocument),
        harness.sourceDocument,
      )
      assert.ok(recovery, 'atomic close must refresh recovery after the queued Agent mutation')
      const recovered = await harness.recoveryStore.read(harness.sourcePath, recovery.id)
      assert.ok(recovered)
      assert.deepEqual(JSON.parse(recovered.documentJson).children, [scenario.expected])
    } finally {
      await harness.cleanup()
    }
  })
}

test('route disposal terminates a pending launch and prevents late registration', async () => {
  const harness = await createHarness(5_000)
  try {
    const pending = harness.request(harness.grant.launchUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'owner-pending' }),
    })
    const [host] = await waitForHosts(harness.logPath, 1)
    harness.detach()
    await harness.controller.dispose()

    const response = await pending
    assert.notEqual(response.status, 200)
    assert.equal(isAlive(host.pid), false, 'pending managed child must be reaped during disposal')
    await assert.rejects(
      harness.controller.getActiveSelection(),
      /No active OpenPencil editor/,
    )
  } finally {
    await harness.cleanup()
  }
})

test('client disconnect before launch response terminates the precise pending child', async () => {
  const harness = await createHarness(5_000)
  try {
    const requestClosed = new Promise(resolve => {
      const request = httpRequest(`${harness.origin}${harness.grant.launchUrl}`, {
        method: 'POST',
        headers: {
          origin: harness.origin,
          'content-type': 'application/json',
        },
      })
      request.once('error', resolve)
      request.end(JSON.stringify({ sessionId: 'owner-disconnected' }))
      void waitForHosts(harness.logPath, 1).then(() => request.destroy())
    })
    const [host] = await waitForHosts(harness.logPath, 1)
    await requestClosed
    await waitForExit(host.pid)
    await assert.rejects(
      harness.controller.getActiveSelection(),
      /No active OpenPencil editor/,
    )
  } finally {
    await harness.cleanup()
  }
})
