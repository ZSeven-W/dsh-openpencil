<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>Plugin DeepSeek Harness dành cho OpenPencil — xem trước, kiểm tra và chỉnh sửa các tài liệu <code>.op</code> thực ngay trong một cuộc hội thoại.</strong><br />
  <sub>Xem trước Đa khung Chính xác &bull; Canvas Tương tác &bull; Trình biên tập Quản lý &bull; Công cụ Thiết kế dành riêng cho Agent</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Bản phát hành plugin hiện tại: <code>0.1.0-rc.1</code> · Đã kiểm thử với DSH <code>0.1.0-rc.6</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md"><b>Tiếng Việt</b></a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — xem trước đa khung và trình biên tập thanh bên" width="100%" />
</p>
<p align="center"><sub>Xem trước <code>.op</code> đa khung chính xác với canvas tương tác và khu làm việc trình biên tập quản lý</sub></p>

## Vì sao chọn DSH OpenPencil

DSH OpenPencil kết nối [DeepSeek Harness](https://github.com/deepseek-ai/DSH) với [OpenPencil](https://github.com/ZSeven-W/openpencil) để Agent điều khiển một canvas thiết kế thực, có thể chỉnh sửa và tương tác, thay vì trả về một hình ảnh được tạo sẵn.

<table>
<tr>
<td width="50%">

### 🖼️ Xem trước Đa khung Chính xác

Trình xuất headless của OpenPencil được cài đặt sẽ kết xuất các bản xem trước trung thành với thiết kế: khung cấp cao nhất đầu tiên dưới dạng một PNG lớn an toàn để phát lại, cùng một dải ảnh thu nhỏ cuộn ngang, chọn bằng cách nhấp chuột và điều hướng trước/sau cho các tài liệu nhiều khung.

</td>
<td width="50%">

### 🗺️ Canvas Tương tác

"Mở canvas tương tác" tải trễ SDK Web OpenPencil chỉ đọc với các thao tác pan, zoom và vừa khung — kiểm tra mọi trang, nút lồng nhau hoặc trang không hoạt động mà không cần rời khỏi cuộc hội thoại.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Trình biên tập Quản lý

Với `editable: true`, hành động chỉnh sửa sẽ mở trình biên tập OpenPencil được quản lý — chọn đối tượng, lớp, thuộc tính, công cụ vẽ, hoàn tác/làm lại và ngữ nghĩa lưu tường minh — trong một khu làm việc bên phải có thể thay đổi kích thước kèm tùy chọn toàn màn hình.

</td>
<td width="50%">

### 🤖 Công cụ Thiết kế dành riêng cho Agent

Năm công cụ — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — cho phép Agent tạo, sửa đổi và đọc một canvas thực thông qua các chương trình `batch_design` giao dịch.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Cấp quyền được Kiểm soát bằng Capability

Các quyền truy cập hình ảnh và tài liệu là các capability được ký và ràng buộc băm. Siêu dữ liệu trình duyệt không bao giờ lộ một đường dẫn máy chủ tùy ý, và các capability xem trước/biên tập được ký không bao giờ đi vào kết quả công cụ chuẩn hoặc ngữ cảnh mô hình.

</td>
<td width="50%">

### ⚡ An toàn Giao dịch

Một tài liệu mới chỉ được công bố sau khi toàn bộ chương trình `batch_design` thành công. Công cụ không bao giờ ghi đè một đường dẫn đã tồn tại, một batch thất bại không để lại tệp rỗng nào, và việc lưu sử dụng một băm lạc quan với thay thế nguyên tử.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Tuân theo Diện mạo & Cảm nhận của DSH

Thẻ công cụ và trình biên tập quản lý tuân theo ngôn ngữ Trung/Anh và chủ đề sáng/tối của DSH mà không cần tải lại phiên chỉnh sửa.

</td>
<td width="50%">

### 🎯 Một Quy trình Hoàn chỉnh

"Yêu cầu trong cuộc hội thoại → Agent chỉnh sửa canvas thực → xem trước trực tiếp và kiểm chứng tương tác → tiếp tục lặp" — một vòng lặp duy nhất, không khứ hồi ảnh chụp màn hình.

</td>
</tr>
</table>

## Cài đặt vào DSH

DSH là một gói riêng. Cài một lần nếu bạn chưa có:

```sh
npm install -g @deepseek-ai/dsh@0.1.0-rc.6
```

Sau đó thêm plugin vào một profile và khởi động ứng dụng web:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Không muốn cài DSH toàn cục? Chạy đúng hai bước đó qua `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
```

> Plugin OpenPencil là công khai và không yêu cầu token npm. Nếu bản prerelease của DSH tự nó yêu cầu xác thực registry, hãy giữ thông tin xác thực đó trong một cấu hình npm cấp người dùng hoặc tạm thời bên ngoài thư mục checkout. Kho lưu trữ này cố ý không chứa bất kỳ thông tin xác thực registry nào.

## Công cụ Thiết kế

| Công cụ | Chức năng |
| --- | --- |
| `openpencil_new` | Tạo một tệp `.op` hoàn toàn mới từ một chương trình `batch_design` giao dịch, lưu nó một cách nguyên tử qua hệ thống tệp sandbox của DSH và không yêu cầu trình biên tập mở sẵn. |
| `openpencil_create` | Áp dụng một chương trình `batch_design` giao dịch để tạo hoặc tái cấu trúc các nút trên một canvas trực tiếp hiện có. |
| `openpencil_edit` | Sửa đổi một nút tường minh hoặc nút duy nhất do người dùng chọn. |
| `openpencil_render` | Tạo một ảnh chụp `.op` bất biến, định địa chỉ theo nội dung và kết xuất mọi khung cấp cao nhất trên trang đang hoạt động — `scale` và `editable` tùy chọn. |
| `openpencil_selection` | Đọc chính xác các nút đang được chọn trong canvas của trình biên tập trực tiếp. |

## Quy trình Thiết kế của Agent

Với một yêu cầu ngôn ngữ tự nhiên không kèm tài liệu hiện có, Agent nên gọi `openpencil_new` với một đường dẫn `.op` mới tương đối với workspace và chương trình `batch_design` hoàn chỉnh đầu tiên. Công cụ chạy chương trình đó trong một daemon OpenPencil được quản lý riêng tư và chỉ công bố tài liệu có thẩm quyền sau khi toàn bộ batch thành công. Nó không bao giờ ghi đè một đường dẫn đã tồn tại và một batch thất bại không để lại tệp rỗng nào. Agent sau đó nên gọi `openpencil_render` với đường dẫn được trả về, `editable: true` và `autoOpen: true` để trình bày thư viện ảnh và mở rộng trình biên tập một lần. Các thẻ lịch sử được phát lại hoặc được kết xuất ban đầu không bao giờ tự mở.

Chỉ dùng `openpencil_create` và `openpencil_edit` cho một canvas trực tiếp hiện có. Các chỉnh sửa của chúng vẫn chưa được lưu cho đến khi hành động Lưu của trình biên tập được thực hiện.

## Hợp đồng Kết xuất

`openpencil_render` chấp nhận một đường dẫn `.op`, tham số `scale` tùy chọn (`0 < scale <= 8`, mặc định `1`) và tham số `editable` tùy chọn (mặc định `false`). Để trống `width` và `height` cho đường dẫn OpenPencil chính xác: chúng mô tả một viewport lúc chạy, không phải kích thước xuất thiết kế, và chỉ được chấp nhận bởi dự phòng Jian có độ trung thực thấp hơn.

Việc tìm kiếm nhị phân OpenPencil kiểm tra theo thứ tự:

1. `DSH_OPENPENCIL_BINARY` hoặc `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` trong `PATH`

Việc tìm kiếm dự phòng Jian sử dụng `DSH_OPENPENCIL_JIAN`, một bản build phát hành cục bộ đã biết, rồi đến `PATH`. Nếu nhị phân OpenPencil chính xác thực sự không khả dụng, Jian có thể tạo ra dự phòng `runtime-preview` được gắn nhãn rõ ràng. Các lỗi kết xuất chính xác, hết thời gian chờ và PNG không hợp lệ không tự động chuyển sang dự phòng một cách âm thầm.

## Tài nguyên Web Viewer

DSH chỉ phục vụ `client.js` cho một client plugin, vì vậy SDK ESM của OpenPencil, WASM của nó và CanvasKit được đưa vào làm các tài nguyên cùng nguồn gốc tường minh:

```sh
pnpm run sync:viewer-assets
```

Lệnh sync ưu tiên dùng thư mục checkout `../openpencil` liền kề (phát triển cục bộ), rồi dự phòng sang submodule `vendor/openpencil` được đưa vào kho (CI và các bản clone mới). Ghi đè nó bằng `OPENPENCIL_ROOT` hoặc `--openpencil-root`. Một thư mục tài nguyên đã được dựng sẵn hoàn chỉnh có thể được chọn bằng `DSH_OPENPENCIL_VIEWER_SOURCE`. Việc tra cứu lúc chạy có thể được ghi đè bằng `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Tài nguyên viewer chỉ được tải trễ sau khi người dùng mở canvas. Nếu chúng vắng mặt hoặc không hợp lệ, bản xem trước PNG vẫn khả dụng và không có nút canvas nào được quảng bá.

## Trình biên tập Quản lý

Các phiên có thể chỉnh sửa sử dụng web host được quản lý của OpenPencil — cùng kiến trúc được `op-vscode` sử dụng. Plugin chỉ khởi động host sau một hành động người dùng được ủy quyền, giữ token daemon trong bộ nhớ, xác thực nguồn và origin của iframe, và đóng tiến trình khi phiên trình biên tập kết thúc. Bề mặt trình biên tập được chọn dần: chi tiết Tool gốc khi host khai báo ranh giới đó, nếu không thì là khu làm việc bên phải của plugin với các điều khiển thay đổi kích thước và toàn màn hình.

Nếu DSH tải lại hoặc gỡ plugin trong khi canvas đang có thay đổi chưa lưu, host giữ một bản nháp phục hồi cục bộ không thể đọc được trong tối đa bảy ngày. Việc mở lại cùng nguồn đó sẽ hỏi trước khi khôi phục nó vào canvas trực tiếp; phục hồi không bao giờ ghi đè tệp `.op` cho đến khi người dùng lưu một cách tường minh.

Việc tìm kiếm nhị phân và nguồn có thể được ghi đè bằng:

- `DSH_OPENPENCIL_EDITOR_BINARY` cho `op-host-web-server`;
- `DSH_OPENPENCIL_SOURCE_ROOT` (hoặc `OPENPENCIL_SOURCE_ROOT`) cho web bundle và các tài nguyên CanvasKit.

Việc lưu sử dụng một băm nguồn lạc quan, một thay thế nguyên tử và một capability kế thừa. Nếu nguồn thay đổi bên ngoài trình biên tập, plugin báo cáo một xung đột thay vì ghi đè nó.

## Siêu dữ liệu Kết quả

Kết quả hiển thị cho mô hình vẫn là JSON thuần. `presentationMeta.$dshOpenPencil` chỉ dành cho trình duyệt mang các quyền truy cập bổ sung cho:

- `image`: đường dẫn PNG, URL xem trước/tải xuống và width/height thực;
- `frames`: mọi khung cấp cao nhất được kết xuất chính xác theo thứ tự trang đang hoạt động, bao gồm id/tên/chỉ mục nút và các URL PNG đã ký;
- `document`: đường dẫn hành động nguồn cùng URL ảnh chụp bất biến, số byte và SHA-256;
- `viewer`: các URL SDK/WASM/CanvasKit theo phiên bản khi route tài nguyên được gắn;
- `editor`: các capability khởi chạy/làm mới có phạm vi khi `editable: true` được ủy quyền.

Kết quả cũng ghi lại `renderer`, `rendererBinary`, `fidelity` và mọi cảnh báo. Các thông điệp schema-v1 chỉ có PNG hiện có vẫn có thể được kết xuất.

DSH `0.1.0-rc.6` không lưu trữ siêu dữ liệu trình bày của trình duyệt cho các công cụ nằm lồng bên dưới PTC/Code Mode. Plugin khôi phục phép chiếu UI-only đó qua một endpoint same-origin, session-bound: trình duyệt chỉ gửi session id, call id và SHA-256 bất biến của tài liệu, trong khi host phân giải kết quả có thẩm quyền từ nhật ký phiên DSH bền vững và chỉ sử dụng một marker trong tiến trình có thời hạn ngắn để ủy quyền cho việc chỉnh sửa trực tiếp gần đây. Các capability xem trước/biên tập được ký không bao giờ đi vào kết quả công cụ chuẩn hoặc ngữ cảnh mô hình. Lịch sử bền vững có thể khôi phục các bản xem trước chỉ đọc; các quyền truy cập biên tập chỉ được cấp cho các kết quả trực tiếp gần đây, đáng tin cậy.

Đối với phát lại có giới hạn, việc phục hồi siêu dữ liệu lồng nhau chấp nhận tối đa 128 khung cấp cao nhất; các kết quả Code Mode lớn hơn vẫn khả dụng qua dự phòng JSON chuẩn của chúng.

## Giới hạn Hiện tại

- Các chỉnh sửa tiếp theo trên một canvas hiện có yêu cầu một trình biên tập quản lý đã được mở. Thay đổi vẫn chưa được lưu cho đến khi người dùng gọi hành động Lưu của nó.
- Canvas của Web SDK nhẹ chỉ đọc; chỉnh sửa đầy đủ sử dụng bề mặt trình biên tập quản lý riêng. Trên DSH `0.1.0-rc.6`, plugin sử dụng khu làm việc bên phải có thể thay đổi kích thước kèm tùy chọn toàn màn hình.
- Thư viện ảnh chính xác bao phủ các khung cấp cao nhất trên trang đang hoạt động; canvas tương tác vẫn là cách để kiểm tra các trang không hoạt động và các nút lồng nhau.
- Các bộ nhớ đệm kết xuất và ảnh chụp vẫn cần một chính sách lưu giữ ở cấp sản phẩm.

## Cấu trúc Dự án

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

## Xây dựng và Kiểm chứng

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

Việc xây dựng yêu cầu Node 24.11 trở lên và pnpm. Các gói host/client của DSH là các peer dependency do hồ sơ DSH mục tiêu cung cấp. Các công cụ xây dựng được phân giải từ dev dependencies cục bộ, thư mục checkout DSH đã liên kết đang hoạt động hoặc một bundle nguồn DSH đã cài đặt; `DSH_SOURCE_ROOT` có thể chọn một checkout nguồn một cách tường minh. Lockfile cố định các công cụ xây dựng công khai độc lập khi môi trường đó được cấp phát riêng biệt.

Đối với một bản prerelease riêng tư của DSH, hãy giữ thông tin xác thực npm được cấp bên ngoài kho lưu trữ này (ví dụ trong một `.npmrc` cấp người dùng hoặc tạm thời) và chạy trực tiếp phiên bản được yêu cầu:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
```

Không bao giờ commit `.npmrc`, `NPM_TOKEN` hoặc thông tin xác thực registry được sao chép. Kho lưu trữ này mặc định bỏ qua cấu hình npm cục bộ.

`test:host` thực hiện một kết xuất chính xác thực, xác thực hình học PNG IHDR và SHA-256, kiểm tra các capability hình ảnh/tài liệu bất biến qua HTTP và xác nhận rằng tài nguyên viewer có thể được cấp quyền. Các kích thước mong đợi phụ thuộc vào fixture.

## Hệ sinh thái

DSH OpenPencil là plugin DeepSeek Harness dành cho **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — công cụ thiết kế vector AI-native mã nguồn mở đầu tiên trên thế giới — và là một phần của gia đình **[ZSeven-W](https://github.com/ZSeven-W)** gồm các công cụ AI-native thuần Rust.

| Dự án | Mô tả |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | Công cụ thiết kế mà plugin này điều khiển — tạo canvas từ lời nhắc, các nhóm agent đồng thời, tệp `.op` thiết kế dạng mã và một máy chủ MCP tích hợp. Các bản xem trước chính xác, canvas tương tác và trình biên tập quản lý ở đây đều do chính OpenPencil cung cấp sức mạnh. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Một runtime async thuần Rust để vận hành các agent LLM — đa nhà cung cấp, hỗ trợ công cụ đầu cuối, quyền có cấu trúc, MCP thực, không một chút `unsafe` nào. Cung cấp sức mạnh cho runtime agent tích hợp của OpenPencil. |
| **[jian](https://github.com/ZSeven-W/jian)** | Khung giao diện UI thuần Rust, GPU-Skia — widgets, bố cục, sự kiện và hot reload trong một stack duy nhất. Là khung UI của OpenPencil và nguồn gốc của trình kết xuất dự phòng của plugin này. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Trợ lý lập trình AI-native mã nguồn mở cho terminal của bạn — đọc mã của bạn, chạy lệnh và điều khiển OpenPencil qua MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Hệ thống bộ nhớ local-first, phi vector cho các agent lập trình — bộ nhớ bền vững dưới dạng các tệp có thể kiểm tra, hoạt động trên nhiều runtime. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | Plugin skill LLM dạy các agent AI cách thiết kế bằng `op` — một người bạn đồng hành của plugin DSH này. |

Các plugin DSH cùng họ:

- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — giao việc cho agent DSH từ Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — một iOS Simulator sống động — và iPhone kết nối USB — ngay trong hội thoại
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — bộ nhớ dài hạn cho DSH

## Đóng góp

Rất hoan nghênh các đóng góp! Hãy fork và clone, tạo một nhánh, chạy `pnpm run build` và các bộ kiểm thử, commit theo [Conventional Commits](https://www.conventionalcommits.org/) và mở một PR tới nhánh `main`.

## Cộng đồng

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Tham gia Discord của chúng tôi</strong>
</a>
— Đặt câu hỏi, chia sẻ thiết kế, đề xuất tính năng.

**Cộng đồng được công nhận: [LINUX DO](https://linux.do/)**

## Giấy phép

[MIT](./LICENSE) — Bản quyền (c) 2026 ZSeven-W

Các thành phần của bên thứ ba được liệt kê trong [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
