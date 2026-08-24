<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>The DeepSeek Harness plugin for OpenPencil — preview, inspect, and edit real <code>.op</code> documents inside a conversation.</strong><br />
  <sub>Exact Multi-Frame Previews &bull; Interactive Canvas &bull; Managed Editor &bull; Agent-Native Design Tools</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Current plugin release: <code>0.1.0-rc.3</code> · Tested through DSH <code>0.1.1-rc.2</code></sub>
</p>

<p align="center">
  <a href="./README.md"><b>English</b></a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><img src="https://img.shields.io/npm/v/%40zseven-w%2Fdsh-openpencil?style=flat&color=cfb537" alt="npm" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/actions/workflows/check.yml"><img src="https://img.shields.io/github/actions/workflow/status/ZSeven-W/dsh-openpencil/check.yml?label=CI" alt="CI" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/stargazers"><img src="https://img.shields.io/github/stars/ZSeven-W/dsh-openpencil?style=flat&color=cfb537" alt="Stars" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ZSeven-W/dsh-openpencil?color=64748b" alt="License" /></a>
  <a href="https://discord.gg/h9Fmyy6pVh"><img src="https://img.shields.io/badge/Discord-Join%20chat-5865F2?logo=discord&logoColor=white" alt="Discord" /></a>
</p>

<br />

<p align="center">
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — multi-frame preview and sidebar editor" width="100%" />
</p>
<p align="center"><sub>Exact multi-frame <code>.op</code> previews with an interactive canvas and the managed editor workbench</sub></p>

## Why DSH OpenPencil

DSH OpenPencil connects [DeepSeek Harness](https://github.com/deepseek-ai/DSH) with [OpenPencil](https://github.com/ZSeven-W/openpencil) so an Agent drives a real, editable, interactive design canvas instead of returning a generated image.

<table>
<tr>
<td width="50%">

### 🖼️ Exact Multi-Frame Previews

The installed OpenPencil headless exporter renders design-faithful previews: the first top-level frame as a large replay-safe PNG, plus a horizontally scrollable thumbnail rail, click-to-select, and previous/next navigation for multi-frame documents.

</td>
<td width="50%">

### 🗺️ Interactive Canvas

"Open interactive canvas" lazily mounts the read-only OpenPencil Web SDK with pan, zoom, and fit — inspect any page, nested node, or inactive page without leaving the conversation.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Managed Editor

With `editable: true`, the edit action opens the managed OpenPencil editor — selection, layers, properties, drawing tools, undo/redo, and explicit save semantics — in a resizable right-hand workbench with a full-screen option.

</td>
<td width="50%">

### 🤖 Agent-Native Design Tools

Five tools — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — let the Agent create, modify, and read a real canvas through transactional `batch_design` programs.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Capability-Gated Grants

Image and document grants are signed, hash-bound capabilities. Browser metadata never exposes an arbitrary host path, and signed preview/editor capabilities never enter the canonical tool result or model context.

</td>
<td width="50%">

### ⚡ Transactional Safety

A new document is published only after the whole `batch_design` program succeeds. The tool never overwrites an existing path, a failed batch leaves no empty file behind, and saves use an optimistic hash with atomic replace.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Follows DSH Look & Feel

The tool card and managed editor follow DSH's Chinese/English locale and light/dark theme without reloading the editing session.

</td>
<td width="50%">

### 🎯 One Complete Workflow

"Requirement in conversation → Agent edits the real canvas → live preview and interaction validation → keep iterating" — one loop, no screenshot round-trips.

</td>
</tr>
</table>

## Install into DSH

DSH is a separate package. Install it once if you do not already have it:

```sh
npm install -g @deepseek-ai/dsh@0.1.1-rc.2
```

Then add the plugin to a profile and start the web app:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

For local development, build the checkout, link its absolute path into the Web profile, and then restart DSH:

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

The `link:` dependency exposes subsequent rebuilds from this checkout, but DSH must be fully restarted after replacing the profile dependency because the shipped Web profile does not hot-reload host bundles by default.

Prefer not to install DSH globally? Run the same two steps through `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.2 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.2 dsh web
```

> The OpenPencil plugin is public and requires no npm token. If the DSH prerelease itself requires registry authentication, keep that credential in a user-level or temporary npm config outside the checkout. This repository intentionally contains no registry credentials.

## Design Tools

| Tool | What it does |
| --- | --- |
| `openpencil_new` | Creates a brand-new `.op` from one transactional QuickJS `batch_design` script, saves it atomically through DSH's sandboxed filesystem, and returns a signed editable presentation that DSH opens in the sidebar in the same tool call. No pre-opened editor, PNG preview, or follow-up render is required. |
| `openpencil_create` | Applies a transactional `batch_design` program to generate or restructure nodes on an existing live canvas. |
| `openpencil_edit` | Modifies an explicit node or the single node selected by the user. |
| `openpencil_render` | Creates an immutable, content-addressed `.op` snapshot and renders every top-level frame on the active page — optional `scale` and `editable`. |
| `openpencil_selection` | Reads the exact nodes selected in the live editor canvas. |

## Agent Design Workflow

For a natural-language request with no existing document, the Agent should call `openpencil_new` with a new workspace-relative `.op` path and the first complete `batch_design` program. The tool runs that program in a private managed OpenPencil daemon and publishes the authoritative document only after the whole batch succeeds. It never overwrites an existing path and a failed batch leaves no empty file behind. The same successful tool call returns a signed, document-scoped editable presentation, and DSH automatically opens the editor sidebar with the authoritative document JSON. No second `openpencil_render` call or PNG preview is involved. Replayed, hydrated, or initially-settled historical cards can recover the document presentation but never receive an editor grant or auto-open.

`openpencil_new` uses the real QuickJS `script` surface of `batch_design`: the Agent builds with `I`/`K` calls and ordinary JavaScript data, arrays, and loops instead of hand-writing low-level `operations`. DSH always enables `postProcess`, then explicitly calls `finalize_design` after creation. This supplies the same end-of-run cleanup as the built-in OpenPencil host before the document is published. The managed runtime is bundled with the plugin and does not require the desktop binary. This is the current creation path; it does not claim to route creation through the separate `design_skeleton`, `design_content`, or `design_refine` tools.

Use `openpencil_create` and `openpencil_edit` only for an existing live canvas. Their edits remain unsaved until the editor Save action.

## Rendering Contract

`openpencil_render` accepts a `.op` path, an optional `scale` (`0 < scale <= 8`, default `1`), and optional `editable` (`false` by default). Leave `width` and `height` unset for the exact OpenPencil path: they describe a runtime viewport, not design export dimensions, and are accepted only by the lower-fidelity Jian fallback.

OpenPencil binary discovery checks, in order:

1. `DSH_OPENPENCIL_BINARY` or `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` on `PATH`

Jian fallback discovery uses `DSH_OPENPENCIL_JIAN`, a known local release build, then `PATH`. If the exact OpenPencil binary is genuinely unavailable, Jian may produce a clearly labelled `runtime-preview` fallback. Exact renderer failures, timeouts, and invalid PNGs do not silently fall back.

## Web Viewer Assets

DSH serves only `client.js` for a client plugin, so the OpenPencil ESM SDK, its WASM, and CanvasKit are staged as explicit same-origin assets:

```sh
pnpm run sync:viewer-assets
```

The sync command prefers a sibling `../openpencil` checkout (local development), falling back to the vendored `vendor/openpencil` submodule (CI and fresh clones). Override it with `OPENPENCIL_ROOT` or `--openpencil-root`. A complete prebuilt asset directory can be selected with `DSH_OPENPENCIL_VIEWER_SOURCE`. Runtime lookup can be overridden with `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Viewer assets are lazy-loaded only after the user opens the canvas. If they are absent or invalid, PNG preview remains available and no canvas button is advertised.

## Managed Editor

Editable sessions use OpenPencil's managed web host — the same architecture used by `op-vscode`. The plugin starts the host only after an authorized user action, keeps the daemon token in memory, validates iframe source and origin, and closes the process when the editor session ends. The editor surface is selected progressively: native Tool details when the host declares that seam, otherwise the plugin's right-hand workbench with resize and full-screen controls.

Startup uses a slow-mount-safe listening handshake: readiness probes begin only after the bundled host announces its bound address. No desktop OpenPencil installation is required.

Published installations provide six native package targets: `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64`, and `win32-x64`; both Linux packages target glibc. The root package declares every platform package under exact-version `optionalDependencies`, allowing npm to select the matching package by OS and CPU. Each platform package stages `op-host-web-server`, the editor web bundle, and CanvasKit as one matching atomic runtime. The managed editor therefore does not depend on `/Applications/OpenPencil.app`, `openpencil-desktop` on `PATH`, or an OpenPencil source checkout. This applies to managed editable sessions; the exact PNG renderer retains the separate binary discovery contract described above.

If DSH reloads or unloads the plugin while the canvas is dirty, the host keeps an opaque local recovery draft for up to seven days. Reopening the same source asks before restoring it into the live canvas; recovery never overwrites the `.op` file until the user explicitly saves.

Official six-platform packages receive their China and Global collaboration bootstrap endpoints during the protected release build, which validates the injected endpoints before publishing. A local self-build without that injection may override the bootstrap before starting DSH with `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap`; the value must use `https` and exactly the `/api/v1/collaboration/bootstrap` path.

Cross-device canvas synchronization requires both the PC/DSH native runtime and the mobile app to be updated to the same OpenPencil release line that includes the current collaboration queue fix. Mixing an older mobile app with a newer PC runtime may still show remote cursors while failing to receive canvas commits.

When developing from this repository, build the editor Web bundle, build the native host, and then stage that matching runtime before launching DSH.

`pnpm run build:editor-web` runs OpenPencil's supported WASM bundle gate. It requires Bash, Cargo/Rust with the `wasm32-unknown-unknown` target, the `wasm-bindgen` CLI, Binaryen's `wasm-opt`, Node.js, and `gzip`; CanvasKit does not require EMSDK. The Web build does not use the collaboration bootstrap build variables. Before `pnpm run build:editor-runtime`, set both `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` and `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL`; they are used only by the native Cargo build, which fails closed if either is missing. After both builds succeed, stage the runtime with the final command below.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

Explicit runtime overrides are accepted only as one complete, matching set:

- `DSH_OPENPENCIL_EDITOR_BINARY` for `op-host-web-server`;
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` for the built editor web bundle;
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` for the CanvasKit assets.

Providing only part of the set is invalid; the plugin does not combine custom paths with packaged runtime assets.

Saves use an optimistic source hash, an atomic replace, and a successor capability. If the source changes outside the editor, the plugin reports a conflict instead of overwriting it.

## Result Metadata

The model-visible result stays plain JSON. Browser-only `presentationMeta.$dshOpenPencil` carries additive grants for:

- `image`: PNG path, preview/download URLs, and real width/height;
- `frames`: every exact-rendered top-level frame in active-page order, including its node id/name/index and signed PNG URLs;
- `document`: source action path plus immutable snapshot URL, bytes, and SHA-256;
- `viewer`: revisioned SDK/WASM/CanvasKit URLs when the asset route is attached;
- `editor`: scoped launch/refresh capabilities when `editable: true` is authorized.

The result also records `renderer`, `rendererBinary`, `fidelity`, and any warnings. Existing PNG-only schema-v1 messages remain renderable.

DSH `0.1.1-rc.2` does not persist browser presentation metadata for tools nested under PTC/Code Mode. The plugin recovers that UI-only projection through a same-origin, session-bound endpoint: the browser sends only the session id, call id, and immutable document SHA-256, while the host resolves the authoritative result from the durable DSH session log and uses a short-lived in-process marker only to authorize recent live editing. Signed preview/editor capabilities never enter the canonical tool result or model context. Durable history can restore read-only previews; editor grants are issued only for recent, trusted live results.

For bounded replay, nested metadata recovery accepts up to 128 top-level frames; larger Code Mode results remain available through their canonical JSON fallback.

## Current Limits

- Follow-up edits to an existing canvas require an already-open managed editor. Changes remain unsaved until the user invokes its Save action.
- The lightweight Web SDK canvas is read-only; full editing uses the separate managed editor surface. On DSH `0.1.1-rc.2`, the plugin uses the resizable right workbench with a full-screen option.
- The exact gallery covers top-level frames on the active page; the interactive canvas remains the way to inspect inactive pages and nested nodes.
- Render and snapshot caches still need a product-level retention policy.

## Project Structure

```text
dsh-openpencil/
├── src/                       Plugin sources (TypeScript)
│   ├── index.ts               Host plugin entry — Cordis service, tools, assets
│   ├── tool.ts / design-tools.ts / new-tool.ts   Host-side design tools
│   ├── renderer.ts            Exact OpenPencil renderer + Jian fallback
│   ├── editor-host.ts / editor-recovery.ts       Managed editor lifecycle + drafts
│   ├── viewer-assets.ts       Web SDK / WASM / CanvasKit asset staging
│   ├── mcp-client.ts          OpenPencil MCP connection
│   └── client/                Browser client — React workbench, gallery, selection dock
├── lib/                       Compiled output (published to npm)
├── scripts/                   Build helpers — viewer asset sync, client build, host tests
├── tests/                     Node test suites (client, host API, MCP, viewer assets)
├── docs/images/               Documentation screenshots
├── vendor/openpencil/         OpenPencil checkout (git submodule — viewer asset source)
├── cordis.patch.yml           DSH bundle patch that mounts the plugin
├── tsconfig.json              Host / Node TypeScript config
└── tsconfig.client.json       Browser client TypeScript config
```

## Build and Verify

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

Builds require Node 24.11 or newer and pnpm. DSH host/client packages are peer dependencies supplied by the target DSH profile. Build tools are resolved from local dev dependencies, the active linked DSH checkout, or an installed DSH source bundle; `DSH_SOURCE_ROOT` can select a source checkout explicitly. The lockfile pins standalone public build tooling when that environment is provisioned separately.

For a private DSH prerelease, keep the issued npm credential outside this repository (for example in a user-level or temporary `.npmrc`) and run the requested version directly:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.2 dsh web
```

Never commit `.npmrc`, `NPM_TOKEN`, or copied registry credentials. This repository ignores local npm configuration by default.

`test:host` performs a real exact render, validates PNG IHDR geometry and SHA-256, exercises immutable image/document capabilities over HTTP, and checks that viewer assets are grantable. The expected dimensions are fixture-specific.

## Ecosystem

DSH OpenPencil is the DeepSeek Harness plugin for **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — the world's first open-source AI-native vector design tool — and part of the **[ZSeven-W](https://github.com/ZSeven-W)** family of pure-Rust, AI-native tools.

| Project | What it is |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | The design tool this plugin drives — prompt-to-canvas generation, concurrent agent teams, design-as-code `.op` files, and a built-in MCP server. The exact previews, interactive canvas, and managed editor here are powered by OpenPencil itself. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | A pure-Rust async runtime for shipping LLM agents — multi-provider, tool-capable end-to-end, structured permissions, real MCP, zero `unsafe`. Powers OpenPencil's built-in agent runtime. |
| **[jian](https://github.com/ZSeven-W/jian)** | Pure-Rust, GPU-Skia UI framework — widgets, layout, events, and hot reload in one stack. OpenPencil's UI framework, and the source of this plugin's fallback renderer. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Open-source, AI-native coding assistant for your terminal — reads your code, runs commands, and drives OpenPencil over MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Local-first, non-vector memory system for coding agents — durable memory as inspectable files, works across runtimes. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | The LLM skill plugin that teaches AI agents how to design with `op` — a companion to this DSH plugin. |

Sibling DSH plugins:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — a live Android emulator or USB device inside the conversation, driven entirely through adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — dispatch work to DSH agents from Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — a live iOS Simulator and a USB-connected iPhone, inside the conversation
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — long-term memory for DSH

## Contributing

Contributions are welcome! Fork and clone, create a branch, run `pnpm run build` and the test suites, commit with [Conventional Commits](https://www.conventionalcommits.org/), and open a PR against `main`.

## Community

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Join our Discord</strong>
</a>
— Ask questions, share designs, suggest features.

**Recognized community: [LINUX DO](https://linux.do/)**

## License

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Third-party components are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
