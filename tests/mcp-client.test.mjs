import assert from 'node:assert/strict'
import { test } from 'node:test'

const mcp = await import('../lib/mcp-client.js')

test('parses successful OpenPencil MCP text JSON', () => {
  const result = mcp.parseOpenPencilMcpResponse('get_selection', {
    jsonrpc: '2.0', id: 1,
    result: {
      content: [{ type: 'text', text: '{"selectedIds":["n1"],"activePageId":"p1","nodes":[]}' }],
    },
  })
  assert.deepEqual(result.value, { selectedIds: ['n1'], activePageId: 'p1', nodes: [] })
})

test('surfaces JSON-RPC, MCP isError, and transactional applied=false failures', () => {
  assert.throws(() => mcp.parseOpenPencilMcpResponse('x', {
    jsonrpc: '2.0', id: 1, error: { message: 'denied' },
  }), /denied/)
  assert.throws(() => mcp.parseOpenPencilMcpResponse('x', {
    jsonrpc: '2.0', id: 1, result: { isError: true, content: [{ type: 'text', text: 'bad patch' }] },
  }), /bad patch/)
  assert.throws(() => mcp.parseOpenPencilMcpResponse('batch_design', {
    jsonrpc: '2.0', id: 1,
    result: { content: [{ type: 'text', text: '{"applied":false,"errors":["line 2 failed"]}' }] },
  }), /line 2 failed/)
})

test('projects a bounded selection snapshot with id-only fallbacks', () => {
  const selection = mcp.selectionSnapshotFromMcp('/tmp/demo.op', {
    activePageId: 'p1', selectedIds: ['n1', '', 7],
    nodes: [{ id: 'n1', type: 'frame', name: 'Home', x: 1, y: 2, width: 375, height: 812 }, { nope: true }],
  }, 123)
  assert.deepEqual(selection, {
    sourcePath: '/tmp/demo.op', activePageId: 'p1', selectedIds: ['n1'], updatedAt: 123,
    nodes: [{ id: 'n1', type: 'frame', name: 'Home', x: 1, y: 2, width: 375, height: 812 }],
  })
})
