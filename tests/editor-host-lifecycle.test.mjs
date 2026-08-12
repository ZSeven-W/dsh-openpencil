import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { createServer, request as httpRequest } from 'node:http'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const fakeHostSource = `#!/usr/bin/env node
const fs = require('node:fs')
const http = require('node:http')
const delay = Number(process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS || 0)
const logPath = process.env.FAKE_EDITOR_LOG
const server = http.createServer((_req, res) => {
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
  fs.appendFileSync(logPath, JSON.stringify({ pid: process.pid, port }) + '\\n')
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
    const entries = text.trim() === '' ? [] : text.trim().split('\n').map(line => JSON.parse(line))
    if (entries.length >= count) return entries
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`fake editor host did not record ${count} start(s)`)
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

async function createHarness(delayMs) {
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

  const previousBinary = process.env.DSH_OPENPENCIL_EDITOR_BINARY
  const previousDelay = process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS
  const previousLog = process.env.FAKE_EDITOR_LOG
  process.env.DSH_OPENPENCIL_EDITOR_BINARY = binary
  process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS = String(delayMs)
  process.env.FAKE_EDITOR_LOG = logPath

  const { EditorHostController } = await import(`../lib/editor-host.js?lifecycle=${Date.now()}-${Math.random()}`)
  const controller = new EditorHostController(randomBytes(32))
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
    logPath,
    request,
    origin,
    async cleanup() {
      detach()
      await controller.dispose()
      await closeServer(server)
      if (previousBinary === undefined) delete process.env.DSH_OPENPENCIL_EDITOR_BINARY
      else process.env.DSH_OPENPENCIL_EDITOR_BINARY = previousBinary
      if (previousDelay === undefined) delete process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS
      else process.env.FAKE_EDITOR_HANDSHAKE_DELAY_MS = previousDelay
      if (previousLog === undefined) delete process.env.FAKE_EDITOR_LOG
      else process.env.FAKE_EDITOR_LOG = previousLog
      await rm(root, { recursive: true, force: true })
    },
  }
}

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
