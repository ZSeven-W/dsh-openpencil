<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>OpenPencil 用の DeepSeek Harness プラグイン — 会話の中で実際の <code>.op</code> ドキュメントをプレビュー、検査、編集できます。</strong><br />
  <sub>正確なマルチフレームプレビュー &bull; インタラクティブキャンバス &bull; マネージドエディター &bull; エージェントネイティブなデザインツール</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · 現在のプラグインリリース: <code>0.1.0-rc.2</code> · DSH <code>0.1.1-rc.1</code> でテスト済み</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md"><b>日本語</b></a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — マルチフレームプレビューとサイドバーエディター" width="100%" />
</p>
<p align="center"><sub>インタラクティブキャンバスとマネージドエディターワークベンチによる正確なマルチフレーム <code>.op</code> プレビュー</sub></p>

## DSH OpenPencil の特長

DSH OpenPencil は [DeepSeek Harness](https://github.com/deepseek-ai/DSH) と [OpenPencil](https://github.com/ZSeven-W/openpencil) を連携させ、生成された画像を返すのではなく、エージェントが実際に編集可能でインタラクティブなデザインキャンバスを操作できるようにします。

<table>
<tr>
<td width="50%">

### 🖼️ 正確なマルチフレームプレビュー

インストール済みの OpenPencil ヘッドレスエクスポーターがデザインを忠実に再現したプレビューをレンダリングします。最初のトップレベルフレームは大きなリプレイ安全な PNG として、さらに水平スクロール可能なサムネイルレール、クリックでの選択、マルチフレームドキュメント用の前後ナビゲーションを備えています。

</td>
<td width="50%">

### 🗺️ インタラクティブキャンバス

「インタラクティブキャンバスを開く」は、パン・ズーム・フィット機能を持つ読み取り専用の OpenPencil Web SDK を遅延マウントします。会話から離れることなく、任意のページ、ネストされたノード、非アクティブなページを検査できます。

</td>
</tr>
<tr>
<td width="50%">

### ✏️ マネージドエディター

`editable: true` を指定すると、編集アクションがマネージド OpenPencil エディター（選択、レイヤー、プロパティ、描画ツール、元に戻す/やり直し、明示的な保存セマンティクス）を開きます。リサイズ可能な右側のワークベンチで表示され、全画面オプションも利用できます。

</td>
<td width="50%">

### 🤖 エージェントネイティブなデザインツール

`openpencil_new`、`openpencil_create`、`openpencil_edit`、`openpencil_render`、`openpencil_selection` の5つのツールにより、エージェントはトランザクション型の `batch_design` プログラムを通じて実際のキャンバスを作成、変更、読み取りできます。

</td>
</tr>
<tr>
<td width="50%">

### 🔐 ケーパビリティで制御された認可

画像とドキュメントの認可は、署名付きでハッシュにバインドされたケーパビリティです。ブラウザのメタデータが任意のホストパスを公開することは決してなく、署名付きのプレビュー/エディターのケーパビリティが正規のツール結果やモデルコンテキストに入ることもありません。

</td>
<td width="50%">

### ⚡ トランザクション安全性

新しいドキュメントは、`batch_design` プログラム全体が成功した場合にのみ公開されます。このツールは既存のパスを上書きせず、失敗したバッチが空のファイルを残すこともありません。保存は楽観的ハッシュとアトミックな置き換えを使用します。

</td>
</tr>
<tr>
<td width="50%">

### 🌍 DSH の外観と操作感に準拠

ツールカードとマネージドエディターは、編集セッションをリロードすることなく、DSH の中国語/英語ロケールとライト/ダークテーマに追従します。

</td>
<td width="50%">

### 🎯 ひとつの完全なワークフロー

「会話での要件 → エージェントが実際のキャンバスを編集 → ライブプレビューと操作の検証 → 反復を継続」— スクリーンショットの往復なしのひとつのループです。

</td>
</tr>
</table>

## DSH へのインストール

DSH は別パッケージです。未導入なら一度インストールします:

```sh
npm install -g @deepseek-ai/dsh@0.1.1-rc.1
```

次にプラグインをプロファイルへ追加し、Web アプリを起動します:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

DSH をグローバルに入れたくない場合は、同じ 2 ステップを `pnpm dlx` で実行します:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

> OpenPencil プラグインは公開されており、npm トークンは不要です。DSH プレリリース自体にレジストリ認証が必要な場合は、その認証情報をチェックアウト外のユーザーレベルまたは一時的な npm 設定に保持してください。このリポジトリには意図的にレジストリの認証情報が含まれていません。

## デザインツール

| ツール | 機能 |
| --- | --- |
| `openpencil_new` | 1つのトランザクション型 `batch_design` プログラムから新しい `.op` を作成し、DSH のサンドボックス化されたファイルシステムを介してアトミックに保存します。事前にエディターを開く必要はありません。 |
| `openpencil_create` | 既存のライブキャンバス上でノードを生成・再構築するために、トランザクション型 `batch_design` プログラムを適用します。 |
| `openpencil_edit` | 明示的なノード、またはユーザーが選択した単一のノードを変更します。 |
| `openpencil_render` | 不変でコンテンツアドレス型の `.op` スナップショットを作成し、アクティブページ上のすべてのトップレベルフレームをレンダリングします — オプションの `scale` と `editable` 付き。 |
| `openpencil_selection` | ライブエディターのキャンバスで選択されている正確なノードを読み取ります。 |

## エージェントのデザインワークフロー

既存のドキュメントがない自然言語のリクエストでは、エージェントは新しいワークスペース相対の `.op` パスと最初の完全な `batch_design` プログラムを指定して `openpencil_new` を呼び出す必要があります。このツールはプライベートなマネージド OpenPencil デーモンでそのプログラムを実行し、バッチ全体が成功した場合にのみ正式なドキュメントを公開します。既存のパスを上書きすることはなく、失敗したバッチが空のファイルを残すこともありません。その後、エージェントは返されたパス、`editable: true`、`autoOpen: true` を指定して `openpencil_render` を呼び出し、ギャラリーを表示してエディターを1回展開する必要があります。リプレイされたカードや初期状態で確定した過去のカードが自動的に開くことはありません。

`openpencil_create` と `openpencil_edit` は、既存のライブキャンバスに対してのみ使用します。これらの編集は、エディターの保存アクションが実行されるまで未保存のままです。

## レンダリング契約

`openpencil_render` は `.op` パス、オプションの `scale`（`0 < scale <= 8`、デフォルトは `1`）、オプションの `editable`（デフォルトは `false`）を受け付けます。正確な OpenPencil パスでは `width` と `height` は設定しないでください。これらはデザインのエクスポート寸法ではなくランタイムのビューポートを表し、低忠実度の Jian フォールバックでのみ受け入れられます。

OpenPencil バイナリの検出は次の順序でチェックします:

1. `DSH_OPENPENCIL_BINARY` または `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `PATH` 上の `openpencil-desktop`

Jian フォールバックの検出は `DSH_OPENPENCIL_JIAN`、既知のローカルリリースビルド、次に `PATH` を使用します。正確な OpenPencil バイナリが本当に利用できない場合、Jian は明確にラベル付けされた `runtime-preview` フォールバックを生成することがあります。正確なレンダラーの失敗、タイムアウト、無効な PNG が黙ってフォールバックされることはありません。

## Web ビューアーアセット

DSH はクライアントプラグインに `client.js` のみを配信するため、OpenPencil ESM SDK、その WASM、CanvasKit は明示的な同一オリジンのアセットとしてステージングされます:

```sh
pnpm run sync:viewer-assets
```

同期コマンドは、隣接する `../openpencil` チェックアウト（ローカル開発）を優先し、ベンダリングされた `vendor/openpencil` サブモジュール（CI と新規クローン）にフォールバックします。`OPENPENCIL_ROOT` または `--openpencil-root` で上書きできます。ビルド済みの完全なアセットディレクトリは `DSH_OPENPENCIL_VIEWER_SOURCE` で選択できます。ランタイムの参照先は `DSH_OPENPENCIL_VIEWER_ASSET_DIR` で上書きできます。

ビューアーアセットは、ユーザーがキャンバスを開いた後にのみ遅延ロードされます。それらが存在しないか無効な場合、PNG プレビューは引き続き利用可能で、キャンバスボタンは表示されません。

## マネージドエディター

編集可能なセッションは OpenPencil のマネージド Web ホストを使用します — `op-vscode` と同じアーキテクチャです。プラグインは、認可されたユーザー操作の後にのみホストを起動し、デーモントークンをメモリ内に保持し、iframe のソースとオリジンを検証し、エディターセッションが終了するとプロセスを閉じます。エディターのサーフェスは段階的に選択されます。ホストがそのシームを宣言する場合はネイティブの Tool 詳細、それ以外の場合はリサイズと全画面コントロールを備えたプラグインの右側ワークベンチです。

キャンバスが未保存の状態で DSH がプラグインをリロードまたはアンロードした場合、ホストは不透明なローカルリカバリードラフトを最大7日間保持します。同じソースを再度開くと、ライブキャンバスへの復元前に確認を求められます。リカバリーはユーザーが明示的に保存するまで `.op` ファイルを上書きしません。

バイナリとソースの検出は次のもので上書きできます:

- `DSH_OPENPENCIL_EDITOR_BINARY` — `op-host-web-server` 用;
- `DSH_OPENPENCIL_SOURCE_ROOT`（または `OPENPENCIL_SOURCE_ROOT`）— Web バンドルと CanvasKit アセット用。

保存は楽観的ソースハッシュ、アトミックな置き換え、後継ケーパビリティを使用します。エディターの外部でソースが変更された場合、プラグインは上書きせずに競合を報告します。

## 結果メタデータ

モデルに表示される結果はプレーンな JSON のままです。ブラウザ専用の `presentationMeta.$dshOpenPencil` は次の追加の認可を保持します:

- `image`: PNG パス、プレビュー/ダウンロード URL、実際の幅/高さ;
- `frames`: アクティブページの順序での正確にレンダリングされたすべてのトップレベルフレーム。ノードの id/名前/インデックスと署名付き PNG URL を含みます;
- `document`: ソースアクションパスに加え、不変のスナップショット URL、バイト数、SHA-256;
- `viewer`: アセットルートが接続されている場合の、リビジョン付き SDK/WASM/CanvasKit URL;
- `editor`: `editable: true` が認可された場合の、スコープ付きの起動/更新ケーパビリティ。

結果には `renderer`、`rendererBinary`、`fidelity`、および任意の警告も記録されます。既存の PNG のみの schema-v1 メッセージは引き続きレンダリング可能です。

DSH `0.1.1-rc.1` は、PTC/Code Mode 配下にネストされたツールのブラウザプレゼンテーションメタデータを永続化しません。プラグインは、同一オリジンでセッションにバインドされたエンドポイントを通じて、その UI-only の投影を復元します。ブラウザは session id、call id、不変のドキュメント SHA-256 のみを送信し、ホストは永続的な DSH セッションログから正式な結果を解決し、短命のインプロセスマーカーを直近のライブ編集の認可にのみ使用します。署名付きのプレビュー/エディターのケーパビリティが正規のツール結果やモデルコンテキストに入ることはありません。永続的な履歴は読み取り専用のプレビューを復元でき、エディターの認可は直近の信頼できるライブ結果に対してのみ発行されます。

制限付きリプレイのため、ネストされたメタデータのリカバリーは最大128個のトップレベルフレームを受け入れます。より大きな Code Mode の結果は、正規の JSON フォールバックを通じて引き続き利用可能です。

## 現在の制限

- 既存キャンバスへの追跡編集には、すでに開いているマネージドエディターが必要です。変更は、ユーザーがその保存アクションを実行するまで未保存のままです。
- 軽量な Web SDK キャンバスは読み取り専用です。本格的な編集には別のマネージドエディターのサーフェスを使用します。DSH `0.1.1-rc.1` では、プラグインは全画面オプション付きのリサイズ可能な右ワークベンチを使用します。
- 正確なギャラリーはアクティブページ上のトップレベルフレームを対象とします。非アクティブなページやネストされたノードの検査には、引き続きインタラクティブキャンバスを使用します。
- レンダリングとスナップショットのキャッシュには、製品レベルの保持ポリシーがまだ必要です。

## プロジェクト構造

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

## ビルドと検証

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

ビルドには Node 24.11 以降と pnpm が必要です。DSH のホスト/クライアントパッケージは、対象の DSH プロファイルが提供するピア依存関係です。ビルドツールは、ローカルの開発依存関係、アクティブなリンク済み DSH チェックアウト、またはインストール済みの DSH ソースバンドルから解決されます。`DSH_SOURCE_ROOT` でソースチェックアウトを明示的に選択できます。ロックファイルは、その環境が別途プロビジョニングされる場合に、スタンドアロンの公開ビルドツールを固定します。

プライベートな DSH プレリリースでは、発行された npm 認証情報をこのリポジトリの外（たとえばユーザーレベルまたは一時的な `.npmrc`）に保持し、要求されたバージョンを直接実行してください:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

`.npmrc`、`NPM_TOKEN`、またはコピーしたレジストリ認証情報をコミットしないでください。このリポジトリはデフォルトでローカルの npm 設定を無視します。

`test:host` は実際の正確なレンダリングを実行し、PNG の IHDR ジオメトリと SHA-256 を検証し、HTTP 経由で不変の画像/ドキュメントケーパビリティを実行し、ビューアーアセットが付与可能かどうかを確認します。期待される寸法はフィクスチャ固有です。

## エコシステム

DSH OpenPencil は **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — 世界初のオープンソースの AI ネイティブベクターデザインツール — 用の DeepSeek Harness プラグインであり、純 Rust の AI ネイティブツール群 **[ZSeven-W](https://github.com/ZSeven-W)** ファミリーの一員です。

| プロジェクト | 概要 |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | このプラグインが操作するデザインツール — プロンプトからキャンバスへの生成、並行エージェントチーム、デザイン・アズ・コードの `.op` ファイル、組み込みの MCP サーバー。ここでの正確なプレビュー、インタラクティブキャンバス、マネージドエディターは、すべて OpenPencil 自身によって動作しています。 |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | LLM エージェントを出荷するための純 Rust の非同期ランタイム — マルチプロバイダー、エンドツーエンドのツール対応、構造化された権限、本物の MCP、`unsafe` ゼロ。OpenPencil の組み込みエージェントランタイムを支えています。 |
| **[jian](https://github.com/ZSeven-W/jian)** | 純 Rust の GPU-Skia UI フレームワーク — ウィジェット、レイアウト、イベント、ホットリロードをひとつのスタックに統合。OpenPencil の UI フレームワークであり、このプラグインのフォールバックレンダラーの源泉です。 |
| **[Zode](https://github.com/ZSeven-W/zode)** | ターミナル向けのオープンソースの AI ネイティブコーディングアシスタント — コードを読み、コマンドを実行し、MCP 経由で OpenPencil を操作します。 |
| **[noema](https://github.com/ZSeven-W/noema)** | コーディングエージェント向けのローカルファーストで非ベクターのメモリシステム — 検査可能なファイルとしての永続的なメモリで、ランタイムをまたいで動作します。 |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | AI エージェントに `op` でのデザイン方法を教える LLM スキルプラグイン — この DSH プラグインのコンパニオンです。 |

同じ DSH プラグインファミリー：

- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — Claude Code / Codex から DSH エージェントに作業を委譲
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — 会話の中で動く iOS シミュレータと USB 接続の実機
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — DSH の長期記憶

## コントリビューション

コントリビューションを歓迎します！フォークしてクローンし、ブランチを作成し、`pnpm run build` とテストスイートを実行し、[Conventional Commits](https://www.conventionalcommits.org/) に従ってコミットし、`main` に対して PR を開いてください。

## コミュニティ

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong>Discord に参加</strong>
</a>
— 質問をしたり、デザインを共有したり、機能を提案したりできます。

**認定コミュニティ: [LINUX DO](https://linux.do/)**

## ライセンス

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

サードパーティコンポーネントは [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) に記載されています。
