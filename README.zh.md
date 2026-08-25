<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>OpenPencil 的 DeepSeek Harness 插件 —— 在对话中预览、检查并编辑真实的 <code>.op</code> 文档。</strong><br />
  <sub>精确多帧预览 &bull; 交互式画布 &bull; 托管编辑器 &bull; 智能体原生设计工具</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · 当前插件版本：<code>0.1.0-rc.5</code> · 已通过 DSH <code>0.1.1-rc.2</code> 测试</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md"><b>简体中文</b></a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil —— 多帧预览与侧边栏编辑器" width="100%" />
</p>
<p align="center"><sub>带交互式画布与托管编辑器工作台的精确多帧 <code>.op</code> 预览</sub></p>

## 为什么选择 DSH OpenPencil

DSH OpenPencil 将 [DeepSeek Harness](https://github.com/deepseek-ai/DSH) 与 [OpenPencil](https://github.com/ZSeven-W/openpencil) 连接起来，让智能体（Agent）驱动一个真实、可编辑、可交互的设计画布，而不是返回一张生成的图片。

<table>
<tr>
<td width="50%">

### 🖼️ 精确多帧预览

已安装的 OpenPencil 无头导出器会渲染忠实于设计的预览：第一个顶层帧以大型可回放 PNG 呈现，另有一条可水平滚动的缩略图栏，支持点击选择以及多帧文档的上一个/下一个导航。

</td>
<td width="50%">

### 🗺️ 交互式画布

「打开交互式画布」会按需挂载只读的 OpenPencil Web SDK，支持平移、缩放与适应视图 —— 无需离开对话即可检查任意页面、嵌套节点或非活动页面。

</td>
</tr>
<tr>
<td width="50%">

### ✏️ 托管编辑器

启用 `editable: true` 后，编辑操作会打开托管的 OpenPencil 编辑器 —— 包含选择、图层、属性、绘图工具、撤销/重做以及明确的保存语义 —— 呈现在一个可调整大小的右侧工作台中，并支持全屏选项。

</td>
<td width="50%">

### 🤖 智能体原生设计工具

五个直接操作画布的工具，加上六个 `openpencil_pipeline_*` 工具，让智能体能通过托管的 OpenPencil 运行时创建、检查、细化、发布、修改和读取真实画布。

</td>
</tr>
<tr>
<td width="50%">

### 🔐 能力门控授权

图像与文档授权是经过签名、与哈希绑定的能力凭据。浏览器元数据永远不会暴露任意的宿主机路径，签名的预览/编辑器能力也永远不会进入规范的工具结果或模型上下文。

</td>
<td width="50%">

### ⚡ 事务性安全

完整管线中的文档会一直保留在私有、未发布的草稿中，直到通过全部原生与 DSH 质量门禁。发布绝不会覆盖已有路径，中止或批次失败也不会留下空的目标文件。

</td>
</tr>
<tr>
<td width="50%">

### 🌍 遵循 DSH 外观与风格

工具卡片与托管编辑器会跟随 DSH 的中文/英文语言环境以及浅色/深色主题，无需重新加载编辑会话。

</td>
<td width="50%">

### 🎯 一个完整的工作流

「需求 → 私有草稿 → 语义化批次 → 精确 PNG 视觉检查与修复 → 质量门禁后的原子发布」—— 全部在 DSH 内完成闭环。

</td>
</tr>
</table>

## 安装到 DSH

DSH 是独立的包。若尚未安装，先装一次：

```sh
npm install -g @deepseek-ai/dsh@latest
```

然后把插件装进某个 profile 并启动 Web 应用：

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

本地开发时，先构建当前检出目录，再把其绝对路径链接进 Web profile，随后完整重启 DSH：

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

`link:` 依赖会让后续重新构建的产物直接从当前检出目录生效；但替换 profile 依赖后必须完整重启 DSH，因为随附的 Web profile 默认不会热重载宿主插件包。

不想全局安装 DSH？用 `pnpm dlx` 跑同样的两步：

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> OpenPencil 插件是公开的，无需 npm token。如果 DSH 预发布版本本身需要 registry 身份验证，请将该凭据保存在仓库检出目录之外的用户级或临时 npm 配置中。本仓库刻意不包含任何 registry 凭据。

## 设计工具

| 工具 | 作用 |
| --- | --- |
| `openpencil_new` | 面向简单任务的兼容快速路径：运行一份事务性 QuickJS `batch_design` 脚本，以“仅在不存在时创建”的语义发布并返回可编辑呈现。生产级设计应优先使用下方完整管线。 |
| `openpencil_pipeline_begin` | 为新的工作区相对 `.op` 路径启动仅归当前会话所有的私有草稿；目标文件保持未发布且不会被改动。 |
| `openpencil_pipeline_context` | 加载原生动态 design-agent prompt，以及相关 guidelines、style guides、变量/主题和 UI kit 元数据或脚本引用。 |
| `openpencil_pipeline_batch` | 将语义化 QuickJS 批次串行应用到草稿；先搭结构骨架，再按区块补充与细化。 |
| `openpencil_pipeline_inspect` | 执行原生质量检查或解析后布局检查，或生成精确 PNG，供模型用图像读取能力打开并进行视觉检查。 |
| `openpencil_pipeline_finish` | 执行原生最终化、lint、布局、截图时效与 DSH 质量门禁，然后用 `createIfAbsent` 原子发布并返回可编辑呈现。 |
| `openpencil_pipeline_abort` | 丢弃未发布草稿，不创建目标文件。 |
| `openpencil_create` | 在现有的活动画布上应用事务性 `batch_design` 程序来生成或重构节点。 |
| `openpencil_edit` | 修改显式指定的节点或用户选中的单个节点。 |
| `openpencil_render` | 创建不可变、内容寻址的 `.op` 快照，并渲染活动页面上的每个顶层帧 —— 可选 `scale` 与 `editable` 参数。 |
| `openpencil_selection` | 读取实时编辑器画布中当前选中的确切节点。 |

## 智能体设计工作流

生产级设计应按顺序使用 `openpencil_pipeline_begin` → `openpencil_pipeline_context` → 多轮 `openpencil_pipeline_batch` 与 `openpencil_pipeline_inspect` → `openpencil_pipeline_finish`。草稿守护进程仅对其所属的 DSH 会话可见；发布成功前，请求的工作区路径并不存在。中间私有草稿截图绝不暴露可编辑侧边栏，以免用户编辑与智能体批次并发冲突；只有发布成功后才授予编辑能力。

上下文不是静态模板，而是把 OpenPencil 原生 design-agent prompt 与相关 guidelines、style guides、变量/主题和 UI kits 动态组合起来。先搭结构骨架，再按语义区块补充内容并细化。为兼顾速度，成功的 batch 调用只返回紧凑布局诊断；需要完整解析布局时再调用 `openpencil_pipeline_inspect`。至少要设置两个中间视觉里程碑：完成 signature/heading 后一次，完成主要任务或 form 加 CTA 后再一次；每次都调用 `openpencil_pipeline_inspect` 并传入 `kind: "screenshot"`，让模型用图像读取能力打开精确 PNG，修复可见的裁切、溢出、层级、间距、控件比例、对比度和文字可读性，并按需重复。视觉检查不会自动发生。

完成阶段会执行 OpenPencil 原生最终化、lint 和布局检查，以及 DSH 质量门禁。这些确定性检查不会创造审美或视觉精致度。最终化之后必须另拍一张新的精确截图，并让模型进行视觉检查；任何中间里程碑截图都绝不能满足最终化后的截图时效门禁。只有这样，最后一次 finish 调用才会通过 `createIfAbsent` 原子创建目标文件。门禁失败或调用 `openpencil_pipeline_abort` 时，目标文件仍不存在。每个已发布的生成结果都是同一个 presentation，其中同时包含精确最终 PNG 预览和限定于该文档的可编辑授权；它只在侧边栏空闲时自动打开，绝不替换另一会话的编辑器，并始终保留 **编辑画布** 供用户显式切换。即使 `openpencil_pipeline_finish` 嵌套在 PTC/Code Mode 中调用，返回结果也必须保留同一 presentation，绝不能退化成普通 JSON 或只读卡片。历史或水合卡片不会自动打开。

在同一持续运行的 DSH 服务内，切换浏览器或重载后，经过严格解析的 `openpencil_new` 或 `openpencil_pipeline_finish` 持久化 publication 可以恢复为精确 PNG 与明确的 **编辑画布** 操作。历史卡片绝不会自动打开侧边栏，必须由用户点击该操作。普通历史 `openpencil_render` 始终保持只读，非 loopback 连接也绝不会获得编辑器授权。

随包提供的 `openpencil-design` skill 仍负责脚本与质量指导，托管运行时也不依赖桌面版二进制。`openpencil_new` 继续作为兼容的单批次快速路径，但生产级设计生成应优先使用完整管线。

仅在已有的活动画布上使用 `openpencil_create` 与 `openpencil_edit`。在编辑器执行保存（Save）操作之前，它们的编辑都保持未保存状态。

## Web 查看器资源

DSH 仅为客户端插件提供 `client.js`，因此 OpenPencil ESM SDK、其 WASM 以及 CanvasKit 被放置为显式的同源资源：

```sh
pnpm run sync:viewer-assets
```

同步命令优先使用同级目录下的 `../openpencil` 检出（本地开发），回退到随附的 `vendor/openpencil` 子模块（CI 与全新克隆）。可通过 `OPENPENCIL_ROOT` 或 `--openpencil-root` 覆盖。可通过 `DSH_OPENPENCIL_VIEWER_SOURCE` 选择完整的预构建资源目录。可通过 `DSH_OPENPENCIL_VIEWER_ASSET_DIR` 覆盖运行时查找。

查看器资源仅在用户打开画布后才按需加载。如果这些资源缺失或无效，PNG 预览仍然可用，并且不会展示画布按钮。

## 托管编辑器

可编辑会话使用 OpenPencil 的托管 Web 宿主 —— 与 `op-vscode` 相同的架构。插件仅在经过授权的用户操作之后启动该宿主，将守护进程令牌保存在内存中，校验 iframe 来源与源站，并在编辑器会话结束时关闭进程。编辑器界面采用渐进式选择：若宿主声明该原生接缝，则使用原生 Tool 详情；否则使用插件带调整大小与全屏控件的右侧工作台。

启动过程使用可安全应对慢速挂载的 listening handshake：只有在随包宿主报告已绑定地址后才开始就绪探测。无需安装桌面版 OpenPencil。

发布版提供六个原生平台包目标：`darwin-arm64`、`darwin-x64`、`linux-arm64`、`linux-x64`、`win32-arm64` 与 `win32-x64`；两个 Linux 包均以 glibc 为目标。根包将所有平台包声明为精确版本的 `optionalDependencies`，由 npm 根据 OS 与 CPU 选择匹配的包。每个平台包都将 `op-host-web-server`、编辑器 Web 打包产物与 CanvasKit 作为一套相互匹配的原子运行时随包提供。因此，托管编辑器默认不依赖 `/Applications/OpenPencil.app`、`PATH` 中的 `openpencil-desktop`，也不依赖 OpenPencil 源码检出。

如果画布处于未保存状态时 DSH 重新加载或卸载插件，宿主会保留一份不透明的本地恢复草稿，最长七天。重新打开同一来源时，会先询问是否将其恢复到活动画布中；在用户明确保存之前，恢复过程绝不会覆盖 `.op` 文件。

正式六平台包会在受保护的 release 构建中注入并校验中国区/全球区协作 bootstrap 端点，通过校验后才发布。未注入该配置的本地自建版本，可在启动 DSH 前使用 `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap` 覆盖；该值必须使用 `https`，且路径必须严格为 `/api/v1/collaboration/bootstrap`。

跨设备画布同步要求 PC/DSH 原生运行时与移动端 App 都更新到包含当前协作队列修复的同一 OpenPencil 发布线。旧移动端与新 PC 运行时混用时，仍可能只看到远端光标而收不到画布提交。

在本仓库中开发时，启动 DSH 前须依次构建编辑器 Web bundle、构建原生宿主，再暂存这套相互匹配的运行时。

`pnpm run build:editor-web` 会运行 OpenPencil 官方支持的 WASM bundle gate。它要求 Bash、带 `wasm32-unknown-unknown` target 的 Cargo/Rust、`wasm-bindgen` CLI、Binaryen 的 `wasm-opt`、Node.js 与 `gzip`；CanvasKit 不需要 EMSDK。Web 构建不使用协作 bootstrap 构建变量。运行 `pnpm run build:editor-runtime` 前必须同时设置 `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` 与 `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL`；它们仅用于原生 Cargo 构建，缺少任一变量都会 fail closed。两项构建都成功后，再执行最后一条命令暂存运行时。

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

如果本地没有受保护的 release bootstrap 地址，可直接构建原生宿主并在 Web bundle 完成后暂存，用于非生产 smoke。这样会验证精确预览、MCP 与托管编辑器路径；协作仍需要显式的运行时 bootstrap 覆盖或正式发布包。

```sh
cargo build --manifest-path vendor/openpencil/Cargo.toml --locked --release -p op-host-web-server
pnpm run stage:editor-runtime
```

若要显式覆盖运行时，以下三项必须作为完整且相互匹配的一套同时提供：

- `DSH_OPENPENCIL_EDITOR_BINARY` 用于 `op-host-web-server`；
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` 用于已构建的编辑器 Web 打包产物；
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` 用于 CanvasKit 资源。

只提供其中一部分属于无效配置；插件不会将自定义路径与随包运行时资源拼接使用。

保存采用乐观源哈希、原子替换以及后继能力凭据。如果来源在编辑器之外发生了变化，插件会报告冲突而不是覆盖它。

## 结果元数据

模型可见的结果保持为纯 JSON。仅浏览器可见的 `presentationMeta.$dshOpenPencil` 携带附加的授权，包括：

- `image`：PNG 路径、预览/下载 URL 以及真实宽高；
- `frames`：按活动页面顺序排列的每个精确渲染的顶层帧，包括其节点 id/名称/索引以及签名的 PNG URL；
- `document`：源操作路径以及不可变快照 URL、字节数与 SHA-256；
- `viewer`：在资源路由挂载时提供带版本号的 SDK/WASM/CanvasKit URL；
- `editor`：在 `editable: true` 获得授权时提供作用域限定的启动/刷新能力。

结果还会记录 `renderer`、`rendererBinary`、`fidelity` 以及任何警告。现有的仅 PNG 的 schema-v1 消息仍然可以渲染。

DSH `0.1.1-rc.2` 不会为嵌套在 PTC/Code Mode 下的工具持久化浏览器展示元数据。插件会通过同源、会话绑定的端点恢复该仅 UI（UI-only）投影：浏览器仅发送 session id、call id 以及不可变文档的 SHA-256，而宿主则从持久的 DSH 会话日志中解析权威结果，并仅使用一个短暂存活的进程内标记（in-process marker）来授权近期的实时编辑。签名的预览/编辑器能力永远不会进入规范的工具结果或模型上下文。普通 `openpencil_render` 的持久历史始终只读。经过严格解析的 `openpencil_new` 或 `openpencil_pipeline_finish` 持久化 publication，只有在 loopback 连接且用户显式点击后才可能获得编辑器授权；自动打开侧边栏仅保留给最近、可信的实时结果。

为了限制回放范围，嵌套元数据恢复最多接受 128 个顶层帧；更大的 Code Mode 结果仍可通过其规范 JSON 回退获得。

## 当前限制

- 对现有画布的后续编辑需要一个已打开的托管编辑器。在用户调用其保存（Save）操作之前，更改保持未保存状态。
- 轻量级 Web SDK 画布是只读的；完整编辑使用独立的托管编辑器界面。在 DSH `0.1.1-rc.2` 上，插件使用带全屏选项的可调整大小右侧工作台。
- 精确图库涵盖活动页面上的顶层帧；交互式画布仍是检查非活动页面与嵌套节点的方式。
- 渲染与快照缓存仍需要产品级的保留策略。

## 项目结构

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

## 构建与验证

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host /absolute/path/to/design.op 375 1091
```

构建需要 Node 24.11 或更高版本以及 pnpm。DSH host/client 包是目标 DSH profile 提供的对等依赖（peer dependencies）。构建工具从本地开发依赖、当前链接的 DSH 检出或已安装的 DSH 源码包中解析；`DSH_SOURCE_ROOT` 可以显式指定源码检出。当该环境单独配置时，lockfile 会锁定独立的公共构建工具。

对于私有 DSH 预发布版本，请将签发的 npm 凭据保存在本仓库之外（例如用户级或临时的 `.npmrc` 中），并直接运行所需版本：

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

切勿提交 `.npmrc`、`NPM_TOKEN` 或复制的 registry 凭据。本仓库默认忽略本地 npm 配置。

`test:host` 会执行一次真实的精确渲染，校验 PNG IHDR 几何信息与 SHA-256，通过 HTTP 验证不可变图像/文档能力，启动已暂存的托管编辑器，推送实时选择，执行一次 MCP 修改，保存，并验证重新打开的是最新字节。预期尺寸随测试夹具而异。

## 生态系统

DSH OpenPencil 是 **[OpenPencil](https://github.com/ZSeven-W/openpencil)** 的 DeepSeek Harness 插件 —— 全球首款开源、AI 原生的矢量设计工具 —— 也是 **[ZSeven-W](https://github.com/ZSeven-W)** 纯 Rust、AI 原生工具家族的一员。

| 项目 | 简介 |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | 本插件所驱动的设计工具 —— 提示词到画布的生成、并发智能体团队、以代码为设计的 `.op` 文件，以及内置的 MCP 服务器。本文中的精确预览、交互式画布与托管编辑器均由 OpenPencil 本身提供支持。 |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | 用于交付 LLM 智能体的纯 Rust 异步运行时 —— 多提供商、端到端工具能力、结构化权限、真正的 MCP、零 `unsafe`。为 OpenPencil 的内置智能体运行时提供动力。 |
| **[jian](https://github.com/ZSeven-W/jian)** | 纯 Rust、GPU-Skia UI 框架 —— 小部件、布局、事件与热重载集成于同一技术栈。OpenPencil 的 UI 框架，也是本插件回退渲染器的来源。 |
| **[Zode](https://github.com/ZSeven-W/zode)** | 面向终端、开源、AI 原生的编程助手 —— 阅读你的代码、运行命令，并通过 MCP 驱动 OpenPencil。 |
| **[noema](https://github.com/ZSeven-W/noema)** | 面向编码智能体的本地优先、非向量记忆系统 —— 以可检查文件形式提供持久记忆，可跨运行时工作。 |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | 教会 AI 智能体如何使用 `op` 进行设计的 LLM skill 插件 —— 本 DSH 插件的配套项目。 |

同系列的 DSH 插件：

- [DSH Android](https://github.com/ZSeven-W/dsh-android) —— 在对话中运行 Android 模拟器或 USB 真机，全部由 adb 驱动
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) —— 从 Claude Code / Codex 把任务派给 DSH agent
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) —— 在对话中运行 iOS 模拟器与 USB 连接的真机
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) —— DSH 的长期记忆

## 参与贡献

欢迎贡献！Fork 并克隆仓库，创建分支，运行 `pnpm run build` 与测试套件，使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范提交，并向 `main` 分支发起 PR。

## 社区

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> 加入我们的 Discord</strong>
</a>
—— 提出问题、分享设计、建议功能。

**社区认可：[LINUX DO](https://linux.do/)**

## 许可证

[MIT](./LICENSE) —— 版权所有（c）2026 ZSeven-W

第三方组件列于 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
