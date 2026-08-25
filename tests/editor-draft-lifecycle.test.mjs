import assert from 'node:assert/strict'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

const fakeHostSource = `#!/usr/bin/env node
const fs = require('node:fs')
const http = require('node:http')
const logPath = process.env.FAKE_DRAFT_LOG
const fileIndex = process.argv.indexOf('--file')
const sourcePath = process.argv[fileIndex + 1]
const handshakeDelay = Number(process.env.FAKE_DRAFT_HANDSHAKE_DELAY_MS || 0)
let document = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
let version = 1
let active = 0
let maxActive = 0
function log(value) { fs.appendFileSync(logPath, JSON.stringify(value) + '\\n') }
const server = http.createServer((req, res) => {
  if (req.url === '/api/mcp/document' && req.method === 'GET') {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ document, version }))
    return
  }
  if (req.url === '/api/mcp/version') {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ version }))
    return
  }
  if (req.url === '/mcp' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      const request = JSON.parse(body)
      const tool = request.params.name
      const args = request.params.arguments || {}
      active += 1
      maxActive = Math.max(maxActive, active)
      log({ event: 'start', tool, active, maxActive })
      const delay = Number(args.delayMs || 0)
      setTimeout(() => {
        let value
        if (tool === 'batch_design') {
          const children = Array.isArray(document.children) ? document.children : []
          document = { ...document, children: [...children, { id: 'n-' + version, name: String(args.script || '') }] }
          version += 1
          value = { applied: true }
        } else if (tool === 'apply_design_system') {
          document = { ...document, designSystem: args.name }
          version += 1
          value = { applied: true }
        } else if (tool === 'set_variables') {
          document = { ...document, variables: args.variables }
          version += 1
          value = { applied: true }
        } else if (tool === 'finalize_design' || tool === 'enrich_images') {
          value = { repairs: 0, advisories: [] }
        } else if (tool === 'get_screenshot') {
          active -= 1
          log({ event: 'end', tool, active, maxActive })
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({
            jsonrpc: '2.0', id: request.id,
            result: { content: [
              { type: 'image', data: '${PNG_BASE64}', mimeType: 'image/png' },
              { type: 'text', text: JSON.stringify({ nodeId: args.nodeId, image_base64: '${PNG_BASE64}', token: 'fake-draft-token-123456789' }) },
            ] },
          }))
          return
        } else {
          value = { ok: true, tool, token: 'fake-draft-token-123456789', sourcePath }
        }
        active -= 1
        log({ event: 'end', tool, active, maxActive })
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({
          jsonrpc: '2.0', id: request.id,
          result: { content: [{ type: 'text', text: JSON.stringify(value) }] },
        }))
      }, delay)
    })
    return
  }
  res.statusCode = 200
  res.setHeader('content-type', 'application/javascript')
  res.end('/* fake managed editor */')
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
  log({ event: 'host', pid: process.pid, sourcePath })
  setTimeout(() => {
    process.stdout.write(JSON.stringify({ ok: true, port, token: 'fake-draft-token-123456789', version: 'test' }) + '\\n')
  }, handshakeDelay)
})
process.stdin.resume()
process.stdin.on('end', close)
process.on('SIGTERM', close)
`

function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 3_000
  while (Date.now() < deadline) {
    const value = await predicate()
    if (value) return value
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`timed out waiting for ${label}`)
}

async function logEntries(logPath) {
  const text = await readFile(logPath, 'utf8').catch(() => '')
  return text.trim() === '' ? [] : text.trim().split('\n').map(line => JSON.parse(line))
}

async function createHarness(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-openpencil-draft-test-'))
  const binary = join(root, 'fake-host.cjs')
  const logPath = join(root, 'events.jsonl')
  await Promise.all([writeFile(binary, fakeHostSource), writeFile(logPath, '')])
  await chmod(binary, 0o755)
  const previousLog = process.env.FAKE_DRAFT_LOG
  const previousHandshakeDelay = process.env.FAKE_DRAFT_HANDSHAKE_DELAY_MS
  process.env.FAKE_DRAFT_LOG = logPath
  process.env.FAKE_DRAFT_HANDSHAKE_DELAY_MS = String(options.handshakeDelayMs ?? 0)
  const { DesignDraftController } = await import(`../lib/design-draft-controller.js?draft=${Date.now()}-${Math.random()}`)
  const controller = new DesignDraftController({
    binary,
    webBundleDir: root,
    canvasKitDir: root,
    openPencilVersion: 'test',
    revision: '0'.repeat(40),
    source: 'override',
  }, options)
  return {
    root,
    logPath,
    controller,
    async host() {
      return waitFor(async () => (await logEntries(logPath)).find(entry => entry.event === 'host'), 'draft host')
    },
    async cleanup() {
      await controller.dispose()
      if (previousLog === undefined) delete process.env.FAKE_DRAFT_LOG
      else process.env.FAKE_DRAFT_LOG = previousLog
      if (previousHandshakeDelay === undefined) delete process.env.FAKE_DRAFT_HANDSHAKE_DELAY_MS
      else process.env.FAKE_DRAFT_HANDSHAKE_DELAY_MS = previousHandshakeDelay
      await rm(root, { recursive: true, force: true })
    },
  }
}

test('draft persists across calls, isolates owners, rejects paths, and serializes concurrent mutations', async () => {
  const harness = await createHarness()
  try {
    const begun = await harness.controller.begin({
      ownerSessionId: 'owner-a',
      target: { id: 'artifact-a', label: 'Login' },
      signal: new AbortController().signal,
    })
    assert.equal(JSON.stringify(begun).includes('dsh-openpencil-draft-'), false)
    await assert.rejects(
      harness.controller.call(begun.draftId, 'owner-b', 'get_design_prompt', {}),
      /different DSH session/,
    )
    await assert.rejects(
      harness.controller.call(begun.draftId, 'owner-a', 'get_design_prompt', { filePath: '/tmp/escape.op' }),
      /cannot include filePath/,
    )

    const first = harness.controller.call(begun.draftId, 'owner-a', 'batch_design', {
      script: 'first', delayMs: 80,
    })
    const second = harness.controller.call(begun.draftId, 'owner-a', 'batch_design', {
      script: 'second', delayMs: 20,
    })
    const [firstResult, secondResult] = await Promise.all([first, second])
    assert.equal(firstResult.version, 2)
    assert.equal(secondResult.version, 3)
    const snapshot = await harness.controller.snapshot(begun.draftId, 'owner-a')
    assert.deepEqual(JSON.parse(snapshot.documentJson).children.map(node => node.name), ['first', 'second'])
    const variableResult = await harness.controller.call(begun.draftId, 'owner-a', 'set_variables', {
      variables: { accent: { type: 'color', value: '#A9642F' } },
    })
    assert.equal(variableResult.version, 4)
    const tokenSnapshot = await harness.controller.snapshot(begun.draftId, 'owner-a')
    assert.equal(JSON.parse(tokenSnapshot.documentJson).variables.accent.value, '#A9642F')
    const entries = await logEntries(harness.logPath)
    assert.equal(Math.max(...entries.map(entry => entry.maxActive ?? 0)), 1)

    const context = await harness.controller.call(begun.draftId, 'owner-a', 'get_design_prompt', {})
    assert.equal(JSON.stringify(context).includes('fake-draft-token'), false)
    assert.equal(JSON.stringify(context).includes('dsh-openpencil-draft-'), false)
  } finally {
    await harness.cleanup()
  }
})

test('finish requires a current screenshot, preserves a draft on publish failure, and closes before queued work after success', async () => {
  const harness = await createHarness()
  try {
    const begun = await harness.controller.begin({
      ownerSessionId: 'owner-publish', target: { id: 'publish-target' }, signal: new AbortController().signal,
    })
    await harness.controller.call(begun.draftId, 'owner-publish', 'batch_design', { script: 'initial' })
    await harness.controller.screenshot(begun.draftId, 'owner-publish')
    await harness.controller.finalize(begun.draftId, 'owner-publish')
    await assert.rejects(
      harness.controller.finish(begun.draftId, 'owner-publish', { publish: async () => ({ ok: true }) }),
      error => error?.code === 'OPENPENCIL_DRAFT_VISUAL_INSPECTION_REQUIRED',
    )
    const screenshot = await harness.controller.screenshot(begun.draftId, 'owner-publish')
    assert.equal(screenshot.mimeType, 'image/png')
    assert.ok(screenshot.bytes.length > 32)
    assert.deepEqual(screenshot.metadata, { nodeId: 'root', token: '[redacted]' })

    await assert.rejects(
      harness.controller.finish(begun.draftId, 'owner-publish', {
        publish: async snapshot => {
          assert.equal(JSON.stringify(snapshot).includes('dsh-openpencil-draft-'), false)
          throw new Error('publish failed')
        },
      }),
      /publish failed/,
    )
    const retryMutation = await harness.controller.call(
      begun.draftId, 'owner-publish', 'batch_design', { script: 'after failed publish' },
    )
    assert.equal(retryMutation.changed, true)
    await harness.controller.finalize(begun.draftId, 'owner-publish')
    await harness.controller.screenshot(begun.draftId, 'owner-publish')

    let releasePublish
    const publishing = harness.controller.finish(begun.draftId, 'owner-publish', {
      publish: () => new Promise(resolve => { releasePublish = resolve }),
    })
    await waitFor(() => releasePublish, 'publish callback')
    const queued = harness.controller.call(begun.draftId, 'owner-publish', 'batch_design', { script: 'too late' })
    releasePublish({ stored: true })
    const finished = await publishing
    assert.deepEqual(finished.published, { stored: true })
    await assert.rejects(queued, /ended before its operation started/)
    await assert.rejects(
      harness.controller.snapshot(begun.draftId, 'owner-publish'),
      /has ended/,
    )
  } finally {
    await harness.cleanup()
  }
})

test('owner abort and controller disposal stop daemons and cancellation retires uncertain mutations', async () => {
  const harness = await createHarness()
  try {
    const first = await harness.controller.begin({
      ownerSessionId: 'owner-abort', target: { id: 'abort-target' }, signal: new AbortController().signal,
    })
    const firstHost = await harness.host()
    assert.equal(await harness.controller.abortOwner('owner-abort'), 1)
    await waitFor(() => !isAlive(firstHost.pid), 'owner daemon exit')
    await assert.rejects(harness.controller.snapshot(first.draftId, 'owner-abort'), /has ended/)

    const second = await harness.controller.begin({
      ownerSessionId: 'owner-cancel', target: { id: 'cancel-target' }, signal: new AbortController().signal,
    })
    const abort = new AbortController()
    const mutation = harness.controller.call(second.draftId, 'owner-cancel', 'batch_design', {
      script: 'cancelled', delayMs: 1_000,
    }, { signal: abort.signal })
    await waitFor(async () => (await logEntries(harness.logPath)).filter(entry => entry.event === 'start').length >= 1, 'mutation start')
    abort.abort(new Error('cancel mutation'))
    await assert.rejects(mutation)
    await assert.rejects(harness.controller.snapshot(second.draftId, 'owner-cancel'), /has ended/)

    const third = await harness.controller.begin({
      ownerSessionId: 'owner-dispose', target: { id: 'dispose-target' }, signal: new AbortController().signal,
    })
    const firstDispose = harness.controller.dispose()
    assert.equal(harness.controller.dispose(), firstDispose)
    await firstDispose
    await assert.rejects(harness.controller.snapshot(third.draftId, 'owner-dispose'), /has ended/)
  } finally {
    await harness.cleanup()
  }
})

test('draft limits enforce one active draft per owner and the configured global cap', async () => {
  const harness = await createHarness({ maxDrafts: 2 })
  try {
    await harness.controller.begin({
      ownerSessionId: 'owner-one', target: { id: 'one' }, signal: new AbortController().signal,
    })
    await assert.rejects(harness.controller.begin({
      ownerSessionId: 'owner-one', target: { id: 'duplicate' }, signal: new AbortController().signal,
    }), /already has an active/)
    await harness.controller.begin({
      ownerSessionId: 'owner-two', target: { id: 'two' }, signal: new AbortController().signal,
    })
    await assert.rejects(harness.controller.begin({
      ownerSessionId: 'owner-three', target: { id: 'three' }, signal: new AbortController().signal,
    }), /capacity is full/)
  } finally {
    await harness.cleanup()
  }
})

test('owner disposal cancels and joins a draft that is still starting', async () => {
  const harness = await createHarness({ handshakeDelayMs: 1_000 })
  try {
    const beginning = harness.controller.begin({
      ownerSessionId: 'owner-starting', target: { id: 'starting' }, signal: new AbortController().signal,
    })
    const host = await harness.host()
    assert.equal(await harness.controller.abortOwner('owner-starting'), 1)
    await assert.rejects(beginning, /owner session ended during startup/)
    await waitFor(() => !isAlive(host.pid), 'starting daemon exit')
    const entries = await logEntries(harness.logPath)
    await assert.rejects(readFile(entries.find(entry => entry.event === 'host').sourcePath), error => error?.code === 'ENOENT')
  } finally {
    await harness.cleanup()
  }
})
