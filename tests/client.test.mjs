import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const require = createRequire(import.meta.url)
let client
globalThis.window = {
  location: { href: 'http://127.0.0.1:3080/' },
  __ModuleLoader__: {
    load(definition) {
      client = definition.factory(require)
    },
  },
}
await import(`../lib/client.js?test=${Date.now()}`)

function settled(meta) {
  return {
    kind: 'result',
    isError: false,
    content: [],
    meta,
  }
}

function memoryStorage() {
  const values = new Map()
  return {
    values,
    getItem(key) { return values.get(key) ?? null },
    setItem(key, value) { values.set(key, value) },
    removeItem(key) { values.delete(key) },
  }
}

function flushAsync() {
  return new Promise(resolve => setImmediate(resolve))
}

function controlledPollTimer() {
  const scheduled = []
  const cancelled = []
  return {
    scheduled,
    cancelled,
    timer: {
      schedule(callback, delayMs) {
        const handle = { callback, delayMs }
        scheduled.push(handle)
        return handle
      },
      cancel(handle) { cancelled.push(handle) },
    },
  }
}

test('keeps the established v1 PNG envelope replayable', () => {
  const grant = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 1,
      image: {
        path: '/cache/render.png',
        previewUrl: '/preview-token',
        downloadUrl: '/preview-token?download=1',
      },
    },
  }))
  assert.deepEqual(grant.image, {
    path: '/cache/render.png',
    previewUrl: '/preview-token',
    downloadUrl: '/preview-token?download=1',
    width: undefined,
    height: undefined,
  })
  assert.equal(grant.document, undefined)
  assert.equal(grant.viewer, undefined)
})

test('accepts the additive document and viewer grants', () => {
  const grant = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 1,
      image: {
        path: '/cache/render.png',
        previewUrl: '/preview-token',
        downloadUrl: '/preview-token?download=1',
        width: 375,
        height: 1091,
      },
      document: {
        path: '/designs/home.op',
        url: '/document-token',
        downloadUrl: '/document-token?download=1',
        bytes: 2048,
        sha256: 'abc123',
        mimeType: 'application/json',
      },
      viewer: {
        sdkUrl: '/viewer/rev/sdk.js',
        wasmUrl: '/viewer/rev/sdk.wasm',
        canvasKitBaseUrl: '/viewer/rev/canvaskit/',
      },
      editor: {
        enabled: true,
        launchUrl: '/editor/launch-token',
        refreshUrl: '/editor/refresh',
      },
      renderer: 'openpencil',
      rendererBinary: '/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop',
      fidelity: 'exact',
      warnings: ['one warning'],
    },
  }))
  assert.equal(grant.document.url, '/document-token')
  assert.equal(grant.document.path, '/designs/home.op')
  assert.equal(grant.viewer.sdkUrl, '/viewer/rev/sdk.js')
  assert.equal(grant.viewer.canvasKitBaseUrl, '/viewer/rev/canvaskit/')
  assert.deepEqual(grant.editor, {
    enabled: true,
    launchUrl: '/editor/launch-token',
    refreshUrl: '/editor/refresh',
  })
  assert.equal(grant.image.width, 375)
  assert.equal(grant.renderer, 'openpencil')
  assert.equal(grant.rendererBinary, '/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop')
  assert.equal(grant.fidelity, 'exact')
  assert.deepEqual(grant.warnings, ['one warning'])
})

test('supports schema v2 and legacy source URL aliases', () => {
  const grant = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 2,
      sourceUrl: '/legacy-document-token',
      sourcePath: '/designs/legacy.op',
    },
  }))
  assert.equal(grant.schemaVersion, 2)
  assert.equal(grant.document.url, '/legacy-document-token')
  assert.equal(grant.document.path, '/designs/legacy.op')
})

test('preserves ordered top-level frame grants for the gallery', () => {
  const grant = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 2,
      frames: [
        {
          path: '/cache/a.png', previewUrl: '/preview-a', downloadUrl: '/preview-a?download=1',
          width: 390, height: 844, id: 'n171', name: 'Music Home', index: 0,
        },
        {
          path: '/cache/b.png', previewUrl: '/preview-b', downloadUrl: '/preview-b?download=1',
          width: 390, height: 844, id: 'n543', name: 'Search', index: 1,
        },
        { path: '/cache/broken.png', previewUrl: '/broken' },
      ],
    },
  }))
  assert.equal(grant.image.previewUrl, '/preview-a')
  assert.equal(grant.frames.length, 2)
  assert.deepEqual(grant.frames.map(frame => ({ id: frame.id, name: frame.name, index: frame.index })), [
    { id: 'n171', name: 'Music Home', index: 0 },
    { id: 'n543', name: 'Search', index: 1 },
  ])
})

test('gallery helpers clamp selection and prefer frame names', () => {
  assert.equal(client.normalizeFrameIndex(-10, 4), 0)
  assert.equal(client.normalizeFrameIndex(99, 4), 3)
  assert.equal(client.normalizeFrameIndex(1.9, 4), 1)
  assert.equal(client.frameLabel({ name: 'Premium' }, 3), 'Premium')
  assert.equal(client.frameLabel({ id: 'n669' }, 3), 'n669')
  assert.equal(client.frameLabel({}, 3), 'Frame 4')
})

test('gallery zoom helpers use bounded 25% stops and a clear percentage', () => {
  assert.equal(client.GALLERY_ZOOM_MIN, 0.25)
  assert.equal(client.GALLERY_ZOOM_MAX, 4)
  assert.equal(client.GALLERY_ZOOM_STEP, 0.25)
  assert.equal(client.clampGalleryZoom(-5), 0.25)
  assert.equal(client.clampGalleryZoom(9), 4)
  assert.equal(client.clampGalleryZoom(Number.NaN), 1)
  assert.equal(client.nextGalleryZoom(1, 1), 1.25)
  assert.equal(client.nextGalleryZoom(1, -1), 0.75)
  assert.equal(client.nextGalleryZoom(0.61, 1), 0.75)
  assert.equal(client.nextGalleryZoom(0.61, -1), 0.5)
  assert.equal(client.nextGalleryZoom(0.25, -1), 0.25)
  assert.equal(client.nextGalleryZoom(4, 1), 4)
  assert.equal(client.galleryZoomPercent(1.246), '125%')
  assert.equal(client.galleryZoomPercent(0.08), '8%')
  assert.equal(client.galleryZoomPercent(0.004), '0.4%')
  assert.equal(client.galleryZoomPercent(0.0001), '0.1%')
})

test('gallery fit-view zoom contains the entire frame and permits very small automatic scales', () => {
  assert.equal(client.calculateGalleryFitViewZoom(1000, 500, 500, 1000), 0.5)
  assert.equal(client.calculateGalleryFitViewZoom(300, 560, 375, 5600), 0.1)
  assert.equal(client.calculateGalleryFitViewZoom(5000, 5000, 100, 100), 4)
  assert.equal(client.calculateGalleryFitViewZoom(0, 560, 375, 1000), 1)
  assert.equal(client.nextGalleryZoom(0.1, 1), 0.25, 'manual zoom exits a tiny fit at its minimum')
})

test('gallery card sizing expands to content and restores the compact viewport', () => {
  assert.equal(client.GALLERY_COMPACT_MAX_HEIGHT, 560)
  assert.equal(client.galleryViewportMaxHeight(false), 560)
  assert.equal(client.galleryViewportMaxHeight(true), undefined)
})

test('gallery toolbar controls share a vertically-centered box', () => {
  assert.equal(client.GALLERY_TOOLBAR_CONTROL_HEIGHT, 28)
  assert.deepEqual(client.GALLERY_TOOLBAR_CONTROL_LAYOUT, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    height: 28,
    lineHeight: 1,
    verticalAlign: 'middle',
  })
  assert.deepEqual(client.GALLERY_TOOLBAR_CONTROL_CONTENT_LAYOUT, {
    display: 'inline-block',
    lineHeight: 1,
    transform: 'translateY(-1px)',
    pointerEvents: 'none',
  })
})

test('gallery and render-card copy follow the resolved DSH locale', () => {
  const zhGallery = client.frameGalleryCopy('zh')
  assert.equal(zhGallery.reset, '重置')
  assert.equal(zhGallery.fitFrame, '适应画面')
  assert.equal(zhGallery.fitContent, '适应内容')
  assert.equal(zhGallery.restoreCard, '还原卡片')
  assert.equal(zhGallery.previous, '上一页')
  assert.equal(zhGallery.next, '下一页')
  assert.equal(client.frameLabel({}, 3, 'zh'), '页面 4')

  const enGallery = client.frameGalleryCopy('en')
  assert.equal(enGallery.reset, 'Reset')
  assert.equal(enGallery.fitFrame, 'Fit frame')
  assert.equal(client.frameLabel({}, 3, 'en'), 'Frame 4')

  const zhCard = client.designRenderCopy('zh')
  assert.equal(zhCard.designRender, 'OpenPencil 渲染')
  assert.equal(zhCard.openInteractiveCanvas, '打开交互画布')
  assert.equal(zhCard.editCanvas, '编辑画布')
  assert.equal(zhCard.editInSidebar, '在侧边栏编辑')
  assert.equal(zhCard.downloadPng, '下载 PNG')
  assert.equal(zhCard.noPreview, '当前宿主没有可用的预览通道。')

  const enCard = client.designRenderCopy('en')
  assert.equal(enCard.designRender, 'OpenPencil render')
  assert.equal(enCard.openInteractiveCanvas, 'Open interactive canvas')
  assert.equal(enCard.editCanvas, 'Edit canvas')
  assert.equal(enCard.noPreview, 'No preview channel available in this host.')
})

test('live OpenPencil selection is parsed, scoped by DSH session, and labelled bilingually', () => {
  const emptyBeforePoll = client.getOpenPencilSelectionSnapshot('session-empty')
  assert.strictEqual(
    client.getOpenPencilSelectionSnapshot('session-empty'),
    emptyBeforePoll,
    'empty snapshots must stay referentially stable for useSyncExternalStore',
  )
  const selection = client.liveSelectionOf({
    sourcePath: '/designs/home.op', activePageId: 'page-1', selectedIds: ['n42'], updatedAt: 7,
    nodes: [{ id: 'n42', type: 'text', name: 'Hero title', x: 12, y: 20, width: 320, height: 48 }],
  })
  assert.ok(selection)
  assert.equal(client.hasOpenPencilSelection(selection), true)
  assert.equal(client.hasOpenPencilSelection({ ...selection, selectedIds: [] }), false)
  assert.deepEqual(client.OPENPENCIL_SELECTION_DOCK_LAYOUT, {
    boxSizing: 'border-box',
    flex: 'none',
    width: 'calc(100% - var(--dsh-composer-side-clearance, 16px) - var(--dsh-composer-side-clearance, 16px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px))',
    maxWidth: 'calc(var(--dsh-composer-card-max-width, 780px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px) - var(--dsh-composer-dock-inset, 8px))',
    margin: '0 auto',
  })
  assert.equal(client.selectionNodeLabel(selection, 'en'), 'Hero title')
  assert.equal(client.selectionNodeLabel(selection, 'zh'), 'Hero title')
  assert.equal(client.selectionNodeDetail(selection, 'en'), 'text · 320 × 48 · n42')

  client.publishOpenPencilSelection('session-a', selection)
  assert.equal(client.getOpenPencilSelectionSnapshot('session-a').selection.nodes[0].id, 'n42')
  assert.equal(client.getOpenPencilSelectionSnapshot('session-b').selection, undefined)
  client.clearOpenPencilSelection('session-b')
  assert.ok(client.getOpenPencilSelectionSnapshot('session-a').selection)
  client.clearOpenPencilSelection('session-a', '/designs/home.op')
  assert.equal(client.getOpenPencilSelectionSnapshot('session-a').selection, undefined)
})

test('selection labels retain id-only and multi-select fallbacks', () => {
  const multi = {
    sourcePath: '/designs/home.op', activePageId: 'page-1', selectedIds: ['n1', 'n2'], nodes: [], updatedAt: 1,
  }
  assert.equal(client.selectionNodeLabel(multi, 'zh'), '已选择 2 个节点')
  assert.equal(client.selectionNodeLabel(multi, 'en'), '2 nodes selected')
  assert.equal(client.selectionNodeDetail(multi, 'en'), 'n1 · n2')
})

test('gallery zoom shortcuts require Ctrl or Command', () => {
  assert.equal(client.galleryZoomShortcut('+', false), undefined)
  assert.equal(client.galleryZoomShortcut('=', true), 'in')
  assert.equal(client.galleryZoomShortcut('+', true), 'in')
  assert.equal(client.galleryZoomShortcut('-', true), 'out')
  assert.equal(client.galleryZoomShortcut('_', true), 'out')
  assert.equal(client.galleryZoomShortcut('0', true), 'reset')
  assert.equal(client.galleryZoomShortcut('ArrowRight', true), undefined)
})

test('gallery keyboard zoom never reverses direction at automatic fit limits', () => {
  assert.equal(client.galleryZoomCommandTarget(0.1, 'out'), undefined)
  assert.equal(client.galleryZoomCommandTarget(0.1, 'in'), 0.25)
  assert.equal(client.galleryZoomCommandTarget(4, 'in'), undefined)
  assert.equal(client.galleryZoomCommandTarget(1, 'out'), 0.75)
  assert.equal(client.galleryZoomCommandTarget(0.4, 'reset'), 1)
})

test('rejects partial viewer metadata instead of guessing an asset revision', () => {
  const grant = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 1,
      document: { url: '/document-token' },
      viewer: { sdkUrl: '/viewer/sdk.js' },
    },
  }))
  assert.equal(grant.viewer, undefined)
})

test('rejects disabled or partial editor grants', () => {
  const disabled = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 2,
      document: { url: '/document-token' },
      editor: { enabled: false, launchUrl: '/launch' },
    },
  }))
  assert.equal(disabled.editor, undefined)
  const partial = client.grantOf(settled({
    $dshOpenPencil: {
      schemaVersion: 2,
      document: { url: '/document-token' },
      editor: { enabled: true },
    },
  }))
  assert.equal(partial.editor, undefined)
})

test('the page-wide canvas coordinator closes the previous owner only', () => {
  const closed = []
  const first = Symbol('first')
  const second = Symbol('second')
  const releaseFirst = client.claimCanvas(first, () => { closed.push('first') })
  const releaseSecond = client.claimCanvas(second, () => { closed.push('second') })
  assert.deepEqual(closed, ['first'])
  releaseFirst()

  const third = Symbol('third')
  const releaseThird = client.claimCanvas(third, () => { closed.push('third') })
  assert.deepEqual(closed, ['first', 'second'])
  releaseSecond()
  releaseThird()
})

test('sizes the canvas backing store from its CSS box and DPR', () => {
  const canvas = { clientWidth: 375, clientHeight: 640, width: 300, height: 150 }
  assert.deepEqual(client.sizeCanvasForDisplay(canvas, 2), {
    cssWidth: 375,
    cssHeight: 640,
    dpr: 2,
  })
  assert.equal(canvas.width, 750)
  assert.equal(canvas.height, 1280)
})

test('canvas backing sizing safely handles an unavailable layout or DPR', () => {
  const canvas = { clientWidth: 0, clientHeight: 0, width: 300, height: 150 }
  assert.deepEqual(client.sizeCanvasForDisplay(canvas, Number.NaN), {
    cssWidth: 1,
    cssHeight: 1,
    dpr: 1,
  })
  assert.equal(canvas.width, 1)
  assert.equal(canvas.height, 1)
})

test('editor bridge accepts only typed JSON-string messages', () => {
  assert.deepEqual(client.parseEditorInbound(JSON.stringify({
    type: 'op-bridge/dirty-changed', generation: 2, revision: 5, dirty: true,
  })), {
    type: 'op-bridge/dirty-changed', generation: 2, revision: 5, dirty: true,
  })
  assert.deepEqual(client.parseEditorInbound(JSON.stringify({ type: 'op-shell/save' })), { type: 'op-shell/save' })
  assert.equal(client.parseEditorInbound({ type: 'op-shell/save' }), undefined)
  assert.equal(client.parseEditorInbound('{"type":"op-bridge/ready","generation":-1,"revision":0}'), undefined)
  assert.equal(client.parseEditorInbound('{"type":"foreign"}'), undefined)
})

test('editor bridge pins loopback iframe source and origin', () => {
  assert.equal(client.editorOrigin('http://127.0.0.1:49152/?embed=vscode'), 'http://127.0.0.1:49152')
  assert.equal(
    client.editorIframeUrlWithTheme('http://127.0.0.1:49152/?embed=vscode', 'light'),
    'http://127.0.0.1:49152/?embed=vscode&theme=light',
  )
  assert.equal(
    client.editorIframeUrlWithTheme('http://localhost:49152/?embed=vscode&theme=light#canvas', 'dark'),
    'http://localhost:49152/?embed=vscode&theme=dark#canvas',
  )
  assert.equal(
    client.editorIframeUrlWithLocale('http://127.0.0.1:49152/?embed=vscode&theme=dark', 'zh-CN'),
    'http://127.0.0.1:49152/?embed=vscode&theme=dark&locale=zh-CN',
  )
  assert.equal(
    client.editorIframeUrlWithLocale('http://localhost:49152/?embed=vscode&locale=zh-CN#canvas', 'en-US'),
    'http://localhost:49152/?embed=vscode&locale=en-US#canvas',
  )
  assert.throws(() => client.editorOrigin('https://example.com/editor'), /loopback origin/)

  const frame = {}
  const data = JSON.stringify({ type: 'op-bridge/opened', generation: 4 })
  assert.deepEqual(client.editorMessageFrom(
    { source: frame, origin: 'http://127.0.0.1:49152', data },
    frame,
    'http://127.0.0.1:49152',
  ), { type: 'op-bridge/opened', generation: 4 })
  assert.equal(client.editorMessageFrom(
    { source: {}, origin: 'http://127.0.0.1:49152', data },
    frame,
    'http://127.0.0.1:49152',
  ), undefined)
  assert.equal(client.editorMessageFrom(
    { source: frame, origin: 'http://127.0.0.1:7', data },
    frame,
    'http://127.0.0.1:49152',
  ), undefined)
})

test('editor bridge emits the strict resolved DSH theme message', () => {
  assert.equal(
    client.encodeEditorOutbound({ type: 'op-bridge/theme', colorScheme: 'dark' }),
    '{"type":"op-bridge/theme","colorScheme":"dark"}',
  )
  assert.deepEqual(client.inject, ['slots', 'theme', 'locale'])
})

test('registers canonical OpenPencil render views and client-only legacy replay aliases', () => {
  const registrations = []
  client.apply({
    on() { return () => {} },
    theme: { getTheme: () => ({ active: { colorScheme: 'light' } }) },
    locale: { getLocale: () => ({ active: 'en' }) },
    slots: {
      inject(_name, install) { return install() },
      register(definition, component) {
        registrations.push({ definition, component })
        return () => {}
      },
    },
  })

  assert.equal(client.OPENPENCIL_RENDER_TOOL_NAME, 'openpencil_render')
  assert.equal(client.LEGACY_DESIGN_RENDER_TOOL_NAME, 'design_render')
  assert.deepEqual(registrations.map(({ definition }) => definition), [
    { name: 'tool.call.toolview', key: 'openpencil_render' },
    { name: 'tool.details.toolview', key: 'openpencil_render' },
    { name: 'tool.call.toolview', key: 'design_render' },
    { name: 'tool.details.toolview', key: 'design_render' },
    { name: 'conversation.input.dock', id: 'openpencil-selection', order: 30 },
  ])
})

test('stock rc.2 can leave the optional details slot undeclared', () => {
  const registrations = []
  const pending = []
  client.apply({
    on() { return () => {} },
    theme: { getTheme: () => ({ active: { colorScheme: 'light' } }) },
    locale: { getLocale: () => ({ active: 'en' }) },
    slots: {
      inject(name, install) {
        if (name === 'tool.details.toolview') {
          pending.push(name)
          return () => {}
        }
        return install()
      },
      register(definition) {
        registrations.push(definition)
        return () => {}
      },
    },
  })

  assert.deepEqual(pending, ['tool.details.toolview', 'tool.details.toolview'])
  assert.deepEqual(registrations, [
    { name: 'tool.call.toolview', key: 'openpencil_render' },
    { name: 'tool.call.toolview', key: 'design_render' },
    { name: 'conversation.input.dock', id: 'openpencil-selection', order: 30 },
  ])
})

test('editor launch prefers native details and falls back to the plugin modal', () => {
  const calls = []
  assert.equal(client.requestOpenPencilEditor(
    () => { calls.push('details') },
    () => { calls.push('modal') },
  ), 'details')
  assert.deepEqual(calls, ['details'])

  assert.equal(client.requestOpenPencilEditor(
    undefined,
    () => { calls.push('modal') },
  ), 'modal')
  assert.deepEqual(calls, ['details', 'modal'])
})

test('editor bridge maps and emits the resolved DSH locale as BCP 47', () => {
  assert.equal(client.editorLocaleFromDsh('zh'), 'zh-CN')
  assert.equal(client.editorLocaleFromDsh('en'), 'en-US')
  assert.equal(
    client.encodeEditorOutbound({ type: 'op-bridge/locale', locale: 'zh-CN' }),
    '{"type":"op-bridge/locale","locale":"zh-CN"}',
  )
})

test('editor panel chrome follows the resolved editor locale', () => {
  const zh = client.editorPanelCopy('zh-CN')
  assert.equal(zh.save, '保存')
  assert.equal(zh.saving, '保存中…')
  assert.equal(zh.unsaved, '未保存')
  assert.equal(zh.saved, '已保存')
  assert.equal(zh.loading, '正在加载可编辑的 OpenPencil 画布…')
  assert.equal(zh.errorTitle, 'OpenPencil 编辑器不可用')
  assert.equal(zh.pngFallback, '打开 PNG 预览')
  assert.equal(zh.editorTitle('home.op'), 'OpenPencil 编辑器：home.op')
  assert.equal(zh.saveConflict(7), 'OpenPencil 保存冲突（服务器版本 7）')

  const en = client.editorPanelCopy('en-US')
  assert.equal(en.save, 'Save')
  assert.equal(en.saving, 'Saving…')
  assert.equal(en.loading, 'Loading editable OpenPencil canvas…')
  assert.equal(en.editorTitle('home.op'), 'OpenPencil editor: home.op')
  assert.equal(en.syncConflict(7), 'The source changed outside this editor (server v7). Save was stopped.')
})

test('fallback editor modal chrome follows the resolved editor locale', () => {
  assert.deepEqual(client.editorModalCopy('zh-CN'), {
    title: 'OpenPencil 编辑器',
    close: '关闭',
    discard: 'OpenPencil 中有未保存的更改，确定关闭并放弃吗？',
  })
  assert.deepEqual(client.editorModalCopy('en-US'), {
    title: 'OpenPencil editor',
    close: 'Close',
    discard: 'OpenPencil has unsaved changes. Close and discard them?',
  })
})

test('fallback editor modal confirms only when the managed editor is dirty', () => {
  const cleanRoot = { querySelector() { return null } }
  let confirmations = 0
  assert.equal(client.confirmEditorModalClose(cleanRoot, 'discard?', () => {
    confirmations += 1
    return false
  }), true)
  assert.equal(confirmations, 0)

  const dirtyRoot = { querySelector(selector) {
    assert.equal(selector, '[data-tool-details-dirty="true"]')
    return {}
  } }
  assert.equal(client.confirmEditorModalClose(dirtyRoot, 'discard?', message => {
    confirmations += 1
    assert.equal(message, 'discard?')
    return false
  }), false)
  assert.equal(client.confirmEditorModalClose(dirtyRoot, 'discard?', () => {
    confirmations += 1
    return true
  }), true)
  assert.equal(confirmations, 2)
})

test('selection polling stops and clears state on terminal 404 and 410 responses', async () => {
  for (const status of [404, 410]) {
    const clock = controlledPollTimer()
    let stops = 0
    let calls = 0
    client.startEditorSelectionPolling({
      url: `/editor/selection/${status}`,
      fetcher: async () => {
        calls += 1
        return new Response(null, { status })
      },
      onValue() { assert.fail('terminal responses must not publish a selection') },
      onStop() { stops += 1 },
      timer: clock.timer,
    })
    await flushAsync()
    assert.equal(calls, 1)
    assert.equal(stops, 1, `${status} must clear the live selection`)
    assert.equal(clock.scheduled.length, 0, `${status} must not schedule another poll`)
  }
})

test('selection polling retries transient failures and cleanup cancels the next timer', async () => {
  const clock = controlledPollTimer()
  const values = []
  let calls = 0
  let stops = 0
  const stop = client.startEditorSelectionPolling({
    url: '/editor/selection/transient',
    fetcher: async () => {
      calls += 1
      if (calls === 1) return new Response(null, { status: 503 })
      return Response.json({ selection: { selectedIds: ['n1'] } })
    },
    onValue(value) { values.push(value) },
    onStop() { stops += 1 },
    intervalMs: 123,
    timer: clock.timer,
  })
  await flushAsync()
  assert.equal(clock.scheduled.length, 1)
  assert.equal(clock.scheduled[0].delayMs, 123)

  clock.scheduled.shift().callback()
  await flushAsync()
  assert.equal(calls, 2)
  assert.deepEqual(values, [{ selection: { selectedIds: ['n1'] } }])
  assert.equal(clock.scheduled.length, 1)

  const pending = clock.scheduled[0]
  stop()
  stop()
  assert.deepEqual(clock.cancelled, [pending])
  assert.equal(stops, 1, 'cleanup must clear selection exactly once')
})

test('selection polling cleanup aborts an in-flight request without scheduling a retry', async () => {
  const clock = controlledPollTimer()
  let observedSignal
  let stops = 0
  const stop = client.startEditorSelectionPolling({
    url: '/editor/selection/in-flight',
    fetcher: async (_url, init = {}) => {
      observedSignal = init.signal
      return new Promise((_resolve, reject) => {
        observedSignal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
      })
    },
    onValue() { assert.fail('an aborted request must not publish a selection') },
    onStop() { stops += 1 },
    timer: clock.timer,
  })
  await flushAsync()
  assert.equal(observedSignal.aborted, false)
  stop()
  await flushAsync()
  assert.equal(observedSignal.aborted, true)
  assert.equal(stops, 1)
  assert.equal(clock.scheduled.length, 0)
})

test('editor control capabilities remain on the DSH origin', () => {
  assert.equal(
    client.editorControlUrl('/_dsh/dsh-openpencil/editor/launch'),
    'http://127.0.0.1:3080/_dsh/dsh-openpencil/editor/launch',
  )
  assert.throws(
    () => client.editorControlUrl('https://example.com/save'),
    /same-origin/,
  )
})

test('expired editor launch refreshes once and prefers current launch docJson', async () => {
  const calls = []
  const fetcher = async (url, init = {}) => {
    calls.push({ url, init })
    if (calls.length === 1) return new Response(null, { status: 410 })
    if (calls.length === 2) {
      return Response.json({ launchUrl: '/_dsh/dsh-openpencil/editor/fresh-cap' })
    }
    return Response.json({
      sessionId: 'editor-1',
      iframeUrl: 'http://127.0.0.1:49152/?embed=vscode',
      token: 'daemon-secret',
      saveUrl: '/_dsh/dsh-openpencil/editor/save/editor-1',
      closeUrl: '/_dsh/dsh-openpencil/editor/close/editor-1',
      docJson: '{"source":"current"}',
    })
  }
  const prepared = await client.prepareManagedEditor({
    enabled: true,
    launchUrl: '/_dsh/dsh-openpencil/editor/old-cap',
  }, {
    path: '/workspace/design.op',
    url: '/_dsh/dsh-openpencil/render/document-cap',
  }, { fetcher })

  assert.equal(prepared.documentJson, '{"source":"current"}')
  assert.equal(calls.length, 3, 'launch docJson must avoid fetching the immutable historical snapshot')
  assert.equal(calls[0].url, 'http://127.0.0.1:3080/_dsh/dsh-openpencil/editor/old-cap')
  assert.equal(calls[1].url, 'http://127.0.0.1:3080/_dsh/dsh-openpencil/editor/refresh')
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    launchUrl: '/_dsh/dsh-openpencil/editor/old-cap',
    sourcePath: '/workspace/design.op',
    documentUrl: '/_dsh/dsh-openpencil/render/document-cap',
  })
  assert.equal(calls[2].url, 'http://127.0.0.1:3080/_dsh/dsh-openpencil/editor/fresh-cap')
})

test('old editor host falls back to the immutable document only when launch omits docJson', async () => {
  const calls = []
  const fetcher = async (url, init = {}) => {
    calls.push({ url, init })
    if (calls.length === 1) {
      return Response.json({
        sessionId: 'editor-old',
        iframeUrl: 'http://127.0.0.1:49153/?embed=vscode',
        token: 'daemon-secret',
        saveUrl: '/editor/save/editor-old',
        closeUrl: '/editor/close/editor-old',
        docJson: 42,
      })
    }
    return new Response('{"source":"snapshot"}', { status: 200 })
  }
  const prepared = await client.prepareManagedEditor({
    enabled: true,
    launchUrl: '/editor/launch-old-host',
  }, {
    path: '/workspace/design.op',
    url: '/render/immutable-document',
  }, { fetcher })
  assert.equal(prepared.documentJson, '{"source":"snapshot"}')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].url, 'http://127.0.0.1:3080/render/immutable-document')
})

test('current or renewed editor contracts never reopen an immutable historical snapshot', async () => {
  const launchWithoutDoc = {
    sessionId: 'editor-current',
    iframeUrl: 'http://127.0.0.1:49154/?embed=vscode',
    token: 'daemon-secret',
    saveUrl: '/editor/save/current',
    closeUrl: '/editor/close/current',
  }
  let currentCalls = 0
  await assert.rejects(client.prepareManagedEditor({
    enabled: true,
    launchUrl: '/editor/current-launch',
    refreshUrl: '/editor/current-refresh',
  }, {
    path: '/workspace/design.op',
    url: '/render/old-snapshot',
  }, {
    fetcher: async () => {
      currentCalls += 1
      return Response.json(launchWithoutDoc)
    },
  }), /omitted current docJson/)
  assert.equal(currentCalls, 2, 'current contract must close its launched daemon without fetching the historical snapshot')

  let renewedCalls = 0
  await assert.rejects(client.prepareManagedEditor({
    enabled: true,
    launchUrl: '/editor/replayed-old-cap',
  }, {
    path: '/workspace/design.op',
    url: '/render/old-snapshot',
  }, {
    fetcher: async () => {
      renewedCalls += 1
      if (renewedCalls === 1) return new Response(null, { status: 410 })
      if (renewedCalls === 2) return Response.json({ launchUrl: '/editor/renewed-cap' })
      return Response.json(launchWithoutDoc)
    },
  }), /omitted current docJson/)
  assert.equal(renewedCalls, 4, 'renewed launch must close its daemon instead of reading the historical document')
})

test('cancelled editor mount closes exactly the launch that completed after cancellation', async () => {
  const calls = []
  const fetcher = async (url, init = {}) => {
    calls.push({ url, init })
    if (calls.length === 1) {
      return Response.json({
        sessionId: 'cancelled-session',
        iframeUrl: 'http://127.0.0.1:49155/?embed=vscode',
        token: 'daemon-secret',
        saveUrl: '/editor/session/cancelled-session/save',
        closeUrl: '/editor/session/cancelled-session',
        docJson: '{"source":"current"}',
      })
    }
    return Response.json({ ok: true })
  }

  const prepared = await client.prepareManagedEditorForMount({
    enabled: true,
    launchUrl: '/editor/cancelled-launch',
    refreshUrl: '/editor/cancelled-refresh',
  }, {
    path: '/workspace/design.op',
    url: '/render/document',
  }, () => false, { fetcher, sessionId: 'dsh-session' })

  assert.equal(prepared, undefined)
  assert.equal(calls.length, 2)
  assert.equal(calls[1].url, 'http://127.0.0.1:3080/editor/session/cancelled-session')
  assert.equal(calls[1].init.method, 'DELETE')
  assert.equal(calls[1].init.keepalive, true)
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    sessionId: 'cancelled-session',
    dirty: false,
  })
})

test('editor launch refresh is limited to 410 and one retry', async () => {
  let notGoneCalls = 0
  await assert.rejects(client.launchManagedEditor({
    enabled: true,
    launchUrl: '/editor/not-found',
  }, {
    path: '/workspace/design.op',
    url: '/render/document',
  }, {
    fetcher: async () => {
      notGoneCalls += 1
      return new Response(null, { status: 404 })
    },
  }), /launch failed \(404\)/)
  assert.equal(notGoneCalls, 1, '404 must not invoke refresh')

  let goneCalls = 0
  const goneUrls = []
  await assert.rejects(client.launchManagedEditor({
    enabled: true,
    launchUrl: '/editor/stale',
    refreshUrl: '/editor/custom-refresh',
  }, {
    path: '/workspace/design.op',
    url: '/render/document',
  }, {
    fetcher: async (url) => {
      goneCalls += 1
      goneUrls.push(url)
      if (goneCalls === 2) return Response.json({ launchUrl: '/editor/still-stale' })
      return new Response(null, { status: 410 })
    },
  }), /launch failed \(410\)/)
  assert.equal(goneCalls, 3, 'a second 410 must not create a refresh loop')
  assert.equal(goneUrls[1], 'http://127.0.0.1:3080/editor/custom-refresh')
})

test('refresh conflict is surfaced without launching or reading the historical document', async () => {
  const calls = []
  await assert.rejects(client.prepareManagedEditor({
    enabled: true,
    launchUrl: '/editor/expired-cap',
    refreshUrl: '/editor/refresh-cap',
  }, {
    path: '/workspace/design.op',
    url: '/render/signed-document-cap',
  }, {
    fetcher: async (url, init = {}) => {
      calls.push({ url, init })
      if (calls.length === 1) return new Response(null, { status: 410 })
      return Response.json({
        error: 'source-changed',
        message: 'render again before editing',
      }, { status: 409 })
    },
  }), /refresh failed \(409\)/)
  assert.equal(calls.length, 2, '409 must not launch again or fetch the historical document')
  assert.equal(calls[1].url, 'http://127.0.0.1:3080/editor/refresh-cap')
})

test('save successor survives a reload and is preferred when the same card reopens', async () => {
  const storage = memoryStorage()
  const original = {
    enabled: true,
    launchUrl: '/editor/original-card-cap',
    refreshUrl: '/editor/original-refresh',
  }
  const successor = client.rememberEditorSuccessor(original.launchUrl, {
    ok: true,
    token: 'must-not-persist',
    docJson: '{"must":"not persist"}',
    sourcePath: '/workspace/must-not-persist.op',
    editor: {
      enabled: true,
      launchUrl: '/editor/successor-cap',
      refreshUrl: '/editor/successor-refresh',
      token: 'nested-token-must-not-persist',
    },
  }, { storage })

  assert.deepEqual(successor, {
    enabled: true,
    launchUrl: 'http://127.0.0.1:3080/editor/successor-cap',
    refreshUrl: 'http://127.0.0.1:3080/editor/successor-refresh',
  })
  const key = client.editorSuccessorStorageKey(original.launchUrl)
  const persisted = storage.values.get(key)
  assert.deepEqual(JSON.parse(persisted), {
    launchUrl: 'http://127.0.0.1:3080/editor/successor-cap',
    refreshUrl: 'http://127.0.0.1:3080/editor/successor-refresh',
  })
  assert.equal(persisted.includes('token'), false)
  assert.equal(persisted.includes('workspace'), false)
  assert.equal(persisted.includes('must persist'), false)

  // A fresh component/module instance resolves from the same tab storage.
  const afterReload = client.editorGrantForBoot(original, { storage })
  assert.deepEqual(afterReload, successor)
  const calls = []
  const prepared = await client.prepareManagedEditor(afterReload, {
    path: '/workspace/design.op',
    url: '/render/original-document-cap',
  }, {
    fetcher: async (url) => {
      calls.push(url)
      return Response.json({
        sessionId: 'successor-session',
        iframeUrl: 'http://127.0.0.1:49160/?embed=vscode',
        token: 'ephemeral-daemon-token',
        saveUrl: '/editor/save/successor-session',
        closeUrl: '/editor/close/successor-session',
        docJson: '{"source":"after-save"}',
      })
    },
  })
  assert.equal(calls[0], 'http://127.0.0.1:3080/editor/successor-cap')
  assert.equal(prepared.documentJson, '{"source":"after-save"}')
})

test('successor storage rejects cross-origin or corrupt capabilities and falls back safely', () => {
  const storage = memoryStorage()
  const original = {
    enabled: true,
    launchUrl: '/editor/original-safe-cap',
    refreshUrl: '/editor/original-safe-refresh',
  }
  const key = client.editorSuccessorStorageKey(original.launchUrl)
  storage.setItem(key, JSON.stringify({
    launchUrl: 'https://attacker.example/launch',
    refreshUrl: '/editor/apparently-safe-refresh',
    token: 'injected',
  }))
  assert.equal(client.editorGrantForBoot(original, { storage }), original)
  assert.equal(storage.getItem(key), null, 'invalid stored successors should be discarded')

  storage.setItem(key, '{not-json')
  assert.equal(client.editorGrantForBoot(original, { storage }), original)
  assert.equal(storage.getItem(key), null, 'corrupt stored successors should be discarded')

  client.rememberEditorSuccessor(original.launchUrl, {
    editor: {
      enabled: true,
      launchUrl: '/editor/temporarily-valid',
      refreshUrl: '/editor/temporarily-valid-refresh',
    },
  }, { storage })
  assert.notEqual(storage.getItem(key), null)
  assert.equal(client.rememberEditorSuccessor(original.launchUrl, {
    editor: {
      enabled: true,
      launchUrl: '/editor/new-launch',
      refreshUrl: 'https://attacker.example/refresh',
    },
  }, { storage }), undefined)
  assert.equal(storage.getItem(key), null, 'an invalid save successor must not leave a stale capability')

  const deniedStorage = {
    getItem() { throw new Error('sessionStorage denied') },
    setItem() { throw new Error('sessionStorage denied') },
    removeItem() { throw new Error('sessionStorage denied') },
  }
  assert.equal(client.editorGrantForBoot(original, { storage: deniedStorage }), original)
  assert.doesNotThrow(() => client.rememberEditorSuccessor(original.launchUrl, {
    editor: {
      enabled: true,
      launchUrl: '/editor/safe-successor',
      refreshUrl: '/editor/safe-successor-refresh',
    },
  }, { storage: deniedStorage }))
  assert.throws(
    () => client.editorSuccessorStorageKey('https://attacker.example/original'),
    /same-origin/,
  )
})

test('the page-wide editor coordinator closes only the previous owner', () => {
  const closed = []
  const first = Symbol('first-editor')
  const second = Symbol('second-editor')
  const releaseFirst = client.claimEditor(first, () => { closed.push('first') })
  const releaseSecond = client.claimEditor(second, () => { closed.push('second') })
  assert.deepEqual(closed, ['first'])
  releaseFirst()
  const third = Symbol('third-editor')
  const releaseThird = client.claimEditor(third, () => { closed.push('third') })
  assert.deepEqual(closed, ['first', 'second'])
  releaseSecond()
  releaseThird()
})

test('dirty editor close requires explicit confirmation', () => {
  let calls = 0
  assert.equal(client.confirmEditorClose(false, () => { calls += 1; return false }), true)
  assert.equal(calls, 0)
  assert.equal(client.confirmEditorClose(true, () => { calls += 1; return false }), false)
  assert.equal(client.confirmEditorClose(true, () => { calls += 1; return true }), true)
  assert.equal(calls, 2)
})
