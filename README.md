# DSH OpenPencil

DeepSeek Harness plugin for previewing and editing OpenPencil `.op` documents inside a conversation.

![DSH OpenPencil multi-frame preview and sidebar editor](docs/images/dsh-openpencil-overview.png)

## 项目介绍

DSH OpenPencil 是连接 DeepSeek Harness 与 OpenPencil 的设计协作插件。现在，它已经可以在对话中直接渲染 `.op` 设计文件，以多页面画廊展示结果，并按需打开可缩放的交互画布或侧边栏完整编辑器，同时跟随 DSH 的语言与主题。下一阶段，我们会进一步实现 DeepSeek Harness 对 OpenPencil 的“直驱”：让智能体不只看到一张渲染图，而是能够理解画布结构、节点、选区和设计上下文，直接完成页面生成、组件修改、布局调整、视觉检查与保存，把“对话提出需求—画布实时编辑—结果验证—继续迭代”变成一条完整闭环。

## What works

- `design_render` creates an immutable, content-addressed `.op` snapshot.
- OpenPencil's installed headless exporter is the default, design-fidelity renderer.
- The tool card shows the first top-level frame as a large replay-safe PNG. Multi-frame documents add a horizontally scrollable thumbnail rail, click-to-select, and previous/next navigation.
- The large preview supports manual zoom, reset, fit-frame, and fit-content modes.
- “Open interactive canvas” lazily mounts the read-only OpenPencil Web SDK. The canvas supports pan, zoom, and fit.
- With `editable: true`, “Edit in sidebar” opens the managed OpenPencil editor with selection, layers, properties, drawing tools, undo/redo, and explicit save semantics.
- The tool card and managed editor follow DSH's Chinese/English locale and light/dark theme without reloading the editing session.
- Image and document grants are signed, hash-bound capabilities. Browser metadata does not expose an arbitrary host path.
- If the exact OpenPencil binary is genuinely unavailable, Jian may produce a clearly labelled `runtime-preview` fallback. Exact renderer failures, timeouts, and invalid PNGs do not silently fall back.

The read-only Web SDK viewer and the managed editor are intentionally separate paths. Only one Web SDK viewer and one managed editor are active at a time because their current browser hosts own page-wide render pumps. “Edit source .op” remains available as a direct DSH file action.

## Install into DSH

Use an authenticated DSH prerelease without installing it globally:

```sh
git clone git@github.com:dsh-external/dsh-openpencil.git
npx --yes -p @deepseek-ai/dsh@0.0.1-rc.1 \
  dsh plugin --profile web add /absolute/path/to/dsh-openpencil
npx --yes -p @deepseek-ai/dsh@0.0.1-rc.1 dsh web
```

Keep the private registry credential in a user-level or temporary npm config outside the checkout. This repository intentionally contains no registry credentials.

## Rendering contract

`design_render` accepts a `.op` path, an optional `scale` (`0 < scale <= 8`, default `1`), and optional `editable` (`false` by default). Leave `width` and `height` unset for the exact OpenPencil path: they describe a runtime viewport, not design export dimensions, and are accepted only by the lower-fidelity Jian fallback.

OpenPencil binary discovery checks, in order:

1. `DSH_OPENPENCIL_BINARY` or `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` on `PATH`

Jian fallback discovery uses `DSH_OPENPENCIL_JIAN`, a known local release build, then `PATH`.

## Web viewer assets

DSH serves only `client.js` for a client plugin, so the OpenPencil ESM SDK, its WASM, and CanvasKit are staged as explicit same-origin assets:

```sh
npm run sync:viewer-assets
```

The sync command defaults to a sibling `../openpencil` checkout. Override it with `OPENPENCIL_ROOT` or `--openpencil-root`. A complete prebuilt asset directory can be selected with `DSH_OPENPENCIL_VIEWER_SOURCE`. Runtime lookup can be overridden with `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Viewer assets are lazy-loaded only after the user opens the canvas. If they are absent or invalid, PNG preview remains available and no canvas button is advertised.

## Managed editor

Editable sessions use OpenPencil's managed web host, the same architecture used by `op-vscode`. The plugin starts the host only after an authorized user action, keeps the daemon token in memory, validates iframe source and origin, and closes the process when the editor session ends.

Binary and source discovery can be overridden with:

- `DSH_OPENPENCIL_EDITOR_BINARY` for `op-host-web-server`;
- `DSH_OPENPENCIL_SOURCE_ROOT` (or `OPENPENCIL_SOURCE_ROOT`) for the web bundle and CanvasKit assets.

Saves use an optimistic source hash, an atomic replace, and a successor capability. If the source changes outside the editor, the plugin reports a conflict instead of overwriting it.

## Build and verify

```sh
npm run sync:viewer-assets
npm run build
npm run test:viewer-assets
npm run test:client
npm run test:host -- /absolute/path/to/design.op 375 1091
```

Builds require Node 24.11 or newer. DSH host/client packages are peer dependencies supplied by the target DSH profile. Build tools are resolved from local dev dependencies, the active linked DSH checkout, or an installed DSH source bundle; `DSH_SOURCE_ROOT` can select a source checkout explicitly. The lockfile pins standalone public build tooling when that environment is provisioned separately.

For a private DSH prerelease, keep the issued npm credential outside this repository (for example in a user-level or temporary `.npmrc`) and run the requested version directly:

```sh
npx --yes -p @deepseek-ai/dsh@0.0.1-rc.1 dsh web
```

Never commit `.npmrc`, `NPM_TOKEN`, or copied registry credentials. This repository ignores local npm configuration by default.

`test:host` performs a real exact render, validates PNG IHDR geometry and SHA-256, exercises immutable image/document capabilities over HTTP, and checks that viewer assets are grantable. The expected dimensions are fixture-specific.

## Result metadata

The model-visible result stays plain JSON. Browser-only `presentationMeta.$dshOpenPencil` carries additive grants for:

- `image`: PNG path, preview/download URLs, and real width/height;
- `frames`: every exact-rendered top-level frame in active-page order, including its node id/name/index and signed PNG URLs;
- `document`: source action path plus immutable snapshot URL, bytes, and SHA-256;
- `viewer`: revisioned SDK/WASM/CanvasKit URLs when the asset route is attached.
- `editor`: scoped launch/refresh capabilities when `editable: true` is authorized.

The result also records `renderer`, `rendererBinary`, `fidelity`, and any warnings. Existing PNG-only schema-v1 messages remain renderable.

## Current limits

- `design_create` and `design_edit` are not implemented by this package.
- The lightweight Web SDK canvas is read-only; full editing uses the separate managed sidebar editor.
- The exact gallery covers top-level frames on the active page; the interactive canvas remains the way to inspect inactive pages and nested nodes.
- Render and snapshot caches still need a product-level retention policy.
