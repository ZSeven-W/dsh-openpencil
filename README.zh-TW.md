<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>DeepSeek Harness 的 OpenPencil 外掛程式——在對話中預覽、檢視並編輯真實的 <code>.op</code> 文件。</strong><br />
  <sub>精確多影格預覽 &bull; 互動式畫布 &bull; 受管編輯器 &bull; 代理原生設計工具</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · 目前外掛程式發行版：<code>0.1.0-rc.2</code> · 已於 DSH <code>0.1.1-rc.1</code> 測試</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md"><b>繁體中文</b></a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — 多影格預覽與側邊欄編輯器" width="100%" />
</p>
<p align="center"><sub>結合互動式畫布與受管編輯器工作台的精確多影格 <code>.op</code> 預覽</sub></p>

## 為什麼選擇 DSH OpenPencil

DSH OpenPencil 將 [DeepSeek Harness](https://github.com/deepseek-ai/DSH) 與 [OpenPencil](https://github.com/ZSeven-W/openpencil) 串接起來，讓代理（Agent）直接驅動一個真實、可編輯、可互動的設計畫布，而不是回傳一張生成的圖片。

<table>
<tr>
<td width="50%">

### 🖼️ 精確多影格預覽

所安裝的 OpenPencil 無頭匯出器會產生忠於設計的預覽：第一個頂層影格以大型、可安全重播的 PNG 呈現，另附水平捲動的縮圖列，可點選選取，並為多影格文件提供上一張／下一張導覽。

</td>
<td width="50%">

### 🗺️ 互動式畫布

「開啟互動式畫布」會以惰性載入方式掛載唯讀的 OpenPencil Web SDK，支援平移、縮放與適配——不必離開對話，即可檢視任何頁面、巢狀節點或未啟用的頁面。

</td>
</tr>
<tr>
<td width="50%">

### ✏️ 受管編輯器

當 `editable: true` 時，編輯動作會在可調整大小的右側工作台開啟受管的 OpenPencil 編輯器，並提供全螢幕選項——包含選取、圖層、屬性、繪圖工具、復原／重做，以及明確的儲存語意。

</td>
<td width="50%">

### 🤖 代理原生設計工具

五個工具——`openpencil_new`、`openpencil_create`、`openpencil_edit`、`openpencil_render`、`openpencil_selection`——讓代理能透過交易性的 `batch_design` 程式建立、修改並讀取真實畫布。

</td>
</tr>
<tr>
<td width="50%">

### 🔐 能力門控授權

圖片與文件授權是經過簽署、綁定雜湊的能力。瀏覽器後設資料絕不會暴露任意的宿主路徑，而簽署過的預覽／編輯器能力也絕不會進入標準工具結果或模型上下文。

</td>
<td width="50%">

### ⚡ 交易性安全

新的文件只有在整個 `batch_design` 程式成功後才會發布。工具絕不會覆寫既有的路徑，失敗的批次不會留下空檔案，儲存時則採用樂觀雜湊搭配原子替換。

</td>
</tr>
<tr>
<td width="50%">

### 🌍 延續 DSH 的外觀與操作感受

工具卡片與受管編輯器會沿用 DSH 的中／英文語系與淺色／深色主題，無須重新載入編輯階段。

</td>
<td width="50%">

### 🎯 一套完整的工作流程

「對話中的需求 → 代理編輯真實畫布 → 即時預覽與互動驗證 → 持續疊代」——單一迴圈，無需來回截圖。

</td>
</tr>
</table>

## 安裝到 DSH

DSH 是獨立的套件。若尚未安裝，先裝一次：

```sh
npm install -g @deepseek-ai/dsh@0.1.1-rc.1
```

接著把外掛裝進某個 profile 並啟動 Web 應用：

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

不想全域安裝 DSH？用 `pnpm dlx` 執行同樣的兩步：

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

> OpenPencil 外掛程式是公開的，不需要 npm token。如果 DSH 預發行版本身需要 registry 驗證，請將該憑證存放在 checkout 目錄以外的使用者層級或暫時性 npm 設定中。本儲存庫刻意不包含任何 registry 憑證。

## 設計工具

| 工具 | 功能說明 |
| --- | --- |
| `openpencil_new` | 從單一交易性的 `batch_design` 程式建立全新的 `.op` 檔案，透過 DSH 的沙盒檔案系統以原子方式儲存，且不需要事先開啟編輯器。 |
| `openpencil_create` | 套用交易性的 `batch_design` 程式，在既有的即時畫布上產生或重構節點。 |
| `openpencil_edit` | 修改明確指定的節點，或使用者選取的單一節點。 |
| `openpencil_render` | 建立不可變、以內容定址的 `.op` 快照，並渲染作用中頁面上的所有頂層影格——可選的 `scale` 與 `editable`。 |
| `openpencil_selection` | 讀取即時編輯器畫布中實際選取的節點。 |

## 代理設計工作流程

針對沒有既有文件的自然語言請求，代理應以新的、相對於工作區的 `.op` 路徑與第一份完整的 `batch_design` 程式呼叫 `openpencil_new`。該工具會在私有的受管 OpenPencil 守護程序中執行此程式，並且只有在整個批次成功後才會發布權威文件。它絕不會覆寫既有的路徑，失敗的批次也不會留下空檔案。接著，代理應以回傳的路徑、`editable: true` 與 `autoOpen: true` 呼叫 `openpencil_render`，以呈現畫廊並展開編輯器一次。重播或初始即定案的歷史卡片絕不會自動開啟。

只有在處理既有的即時畫布時，才使用 `openpencil_create` 與 `openpencil_edit`。它們的編輯內容在執行編輯器的儲存動作之前都會維持未儲存狀態。

## 渲染契約

`openpencil_render` 接受一個 `.op` 路徑、可選的 `scale`（`0 < scale <= 8`，預設為 `1`）與可選的 `editable`（預設為 `false`）。在精確的 OpenPencil 路徑下，請讓 `width` 與 `height` 保持未設定：它們描述的是執行期的視埠，而非設計匯出尺寸，且只有保真度較低的 Jian 備援才會接受。

OpenPencil 二進位檔的搜尋依下列順序進行：

1. `DSH_OPENPENCIL_BINARY` 或 `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `PATH` 上的 `openpencil-desktop`

Jian 備援的搜尋會依序使用 `DSH_OPENPENCIL_JIAN`、已知的本機發行建置，然後是 `PATH`。如果精確的 OpenPencil 二進位檔確實無法取得，Jian 可能會產生一個清楚標示的 `runtime-preview` 備援。精確渲染器的失敗、逾時與無效的 PNG 不會被靜默地降級為備援。

## Web 檢視器資源

DSH 僅為用戶端外掛程式提供 `client.js`，因此 OpenPencil ESM SDK、其 WASM 與 CanvasKit 會以明確的同源資源方式進行暫存：

```sh
pnpm run sync:viewer-assets
```

同步指令優先使用同層的 `../openpencil` checkout（本機開發），並在無法取得時退回使用 vendored 的 `vendor/openpencil` submodule（CI 與全新 clone）。可用 `OPENPENCIL_ROOT` 或 `--openpencil-root` 覆寫。完整的預先建置資源目錄可透過 `DSH_OPENPENCIL_VIEWER_SOURCE` 選取。執行期的查詢路徑則可用 `DSH_OPENPENCIL_VIEWER_ASSET_DIR` 覆寫。

檢視器資源會在使用者開啟畫布之後才進行惰性載入。如果資源缺失或無效，PNG 預覽仍然可用，且不會宣傳畫布按鈕。

## 受管編輯器

可編輯的階段使用 OpenPencil 的受管 Web 宿主——與 `op-vscode` 所使用的架構相同。外掛程式只在經過授權的使用者動作之後才會啟動宿主，將守護程式的 token 保存在記憶體中，驗證 iframe 的來源與 origin，並在編輯階段結束時關閉程序。編輯器介面會逐步選定：當宿主宣告該接縫時使用原生的 Tool 詳細資訊，否則使用外掛程式具備調整大小與全螢幕控制項的右側工作台。

如果在畫布仍有未儲存變更時，DSH 重新載入或卸載外掛程式，宿主會保留一份不透明的本機復原草稿，最長七天。重新開啟相同來源時，會先詢問再將草稿還原到即時畫布；在使用者明確儲存之前，復原絕不會覆寫 `.op` 檔案。

二進位檔與來源的搜尋可透過以下方式覆寫：

- `DSH_OPENPENCIL_EDITOR_BINARY`：用於 `op-host-web-server`；
- `DSH_OPENPENCIL_SOURCE_ROOT`（或 `OPENPENCIL_SOURCE_ROOT`）：用於 Web 套件與 CanvasKit 資源。

儲存採用樂觀的來源雜湊、原子替換與後繼（successor）能力。如果來源在編輯器之外發生變更，外掛程式會回報衝突，而不是覆寫它。

## 結果後設資料

模型可見的結果維持為純 JSON。僅供瀏覽器使用的 `presentationMeta.$dshOpenPencil` 承載下列附加授權：

- `image`：PNG 路徑、預覽／下載 URL，以及真實的寬／高；
- `frames`：依作用中頁面順序排列、每個精確渲染的頂層影格，包含其節點 id／名稱／索引與簽署的 PNG URL；
- `document`：來源動作路徑，加上不可變的快照 URL、位元組數與 SHA-256；
- `viewer`：在資源路由已掛接時提供帶版本修訂的 SDK／WASM／CanvasKit URL；
- `editor`：在 `editable: true` 獲得授權時提供具範疇的啟動／重新整理能力。

結果也會記錄 `renderer`、`rendererBinary`、`fidelity` 與任何警告。既有、僅含 PNG 的 schema-v1 訊息仍可正常渲染。

DSH `0.1.1-rc.1` 不會為巢狀於 PTC/Code Mode 之下的工具持久化瀏覽器呈現後設資料。外掛程式會透過同源、綁定 session 的端點復原該 UI-only 投影：瀏覽器只會傳送 session id、call id 與不可變的文件 SHA-256，而宿主則從持久的 DSH session 記錄中解析權威結果，並僅使用短暫的處理程序內標記來授權近期的即時編輯。簽署過的預覽／編輯器能力絕不會進入標準工具結果或模型上下文。持久的歷史記錄可還原唯讀預覽；編輯器授權僅針對近期、可信的即時結果核發。

為控制重播範圍，巢狀後設資料的復原最多接受 128 個頂層影格；更大的 Code Mode 結果仍可透過其標準 JSON 備援取得。

## 目前的限制

- 對既有畫布進行後續編輯，需要一個已開啟的受管編輯器。在使用者執行其儲存動作之前，變更都會維持未儲存狀態。
- 輕量的 Web SDK 畫布為唯讀；完整的編輯功能使用獨立的受管編輯器介面。在 DSH `0.1.1-rc.1` 上，外掛程式使用具全螢幕選項的可調整大小右側工作台。
- 精確畫廊涵蓋作用中頁面上的頂層影格；互動式畫布仍是檢視未啟用頁面與巢狀節點的方式。
- 渲染與快照快取仍需要產品層級的保留策略。

## 專案結構

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

## 建置與驗證

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

建置需要 Node 24.11 或更新版本，以及 pnpm。DSH 的 host／client 套件是由目標 DSH profile 提供的對等相依（peer dependency）。建置工具會從本機開發相依、目前連結的 DSH checkout 或已安裝的 DSH 來源套件中解析；`DSH_SOURCE_ROOT` 可明確指定來源 checkout。當該環境為另行佈建時，lockfile 會固定獨立的公開建置工具。

若為私有的 DSH 預發行版，請將核發的 npm 憑證存放在本儲存庫之外（例如使用者層級或暫時性的 `.npmrc`），並直接執行要求的版本：

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

絕對不要提交 `.npmrc`、`NPM_TOKEN` 或複製的 registry 憑證。本儲存庫預設會忽略本機的 npm 設定。

`test:host` 會執行一次真實的精確渲染，驗證 PNG IHDR 幾何與 SHA-256，透過 HTTP 測試不可變的圖片／文件能力，並檢查檢視器資源是否可被授權。預期的尺寸會依測試樣本（fixture）而異。

## 生態系

DSH OpenPencil 是 **[OpenPencil](https://github.com/ZSeven-W/openpencil)** 的 DeepSeek Harness 外掛程式——OpenPencil 是全球第一款開源的 AI 原生向量設計工具——同時也是 **[ZSeven-W](https://github.com/ZSeven-W)** 這個純 Rust、AI 原生工具家族的一份子。

| 專案 | 說明 |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | 本外掛程式所驅動的設計工具——提示詞到畫布的生成、並行代理團隊、以設計即程式碼（design-as-code）呈現的 `.op` 檔案，以及內建的 MCP 伺服器。這裡的精確預覽、互動式畫布與受管編輯器皆由 OpenPencil 本身驅動。 |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | 純 Rust 的非同步執行期，用於交付 LLM 代理——多供應商、端到端具備工具能力、結構化權限、真正的 MCP、零 `unsafe`。為 OpenPencil 內建的代理執行期提供動力。 |
| **[jian](https://github.com/ZSeven-W/jian)** | 純 Rust、GPU-Skia 的 UI 框架——將 widgets、版面配置、事件與熱重載整合在單一技術棧中。是 OpenPencil 的 UI 框架，也是此外掛程式備援渲染器的來源。 |
| **[Zode](https://github.com/ZSeven-W/zode)** | 開源、AI 原生的終端機程式設計助手——讀取你的程式碼、執行指令，並透過 MCP 驅動 OpenPencil。 |
| **[noema](https://github.com/ZSeven-W/noema)** | 為程式設計代理打造、以本機為優先的非向量記憶系統——以可檢視的檔案形式提供持久記憶，可跨執行期運作。 |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | 教導 AI 代理如何使用 `op` 進行設計的 LLM skill 外掛程式——是此 DSH 外掛程式的夥伴專案。 |

同系列的 DSH 外掛：

- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — 從 Claude Code / Codex 把任務派給 DSH agent
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — 在對話中執行 iOS 模擬器與 USB 連接的實機
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — DSH 的長期記憶

## 貢獻

歡迎貢獻！Fork 並 clone、建立分支、執行 `pnpm run build` 與測試套件、使用 [Conventional Commits](https://www.conventionalcommits.org/) 提交，並針對 `main` 開啟 PR。

## 社群

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> 加入我們的 Discord</strong>
</a>
— 提問、分享設計、建議功能。

**認可社群：[LINUX DO](https://linux.do/)**

## 授權

[MIT](./LICENSE) — 版權所有（c）2026 ZSeven-W

第三方元件列於 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。