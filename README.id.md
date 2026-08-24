<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>Plugin DeepSeek Harness untuk OpenPencil — pratinjau, periksa, dan edit dokumen <code>.op</code> asli di dalam percakapan.</strong><br />
  <sub>Pratinjau Multi-Frame Akurat &bull; Kanvas Interaktif &bull; Editor Terkelola &bull; Alat Desain Asli-Agen</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Rilis plugin saat ini: <code>0.1.0-rc.4</code> · Diuji hingga DSH <code>0.1.1-rc.2</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md"><b>Bahasa Indonesia</b></a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — pratinjau multi-frame dan editor bilah samping" width="100%" />
</p>
<p align="center"><sub>Pratinjau <code>.op</code> multi-frame akurat dengan kanvas interaktif dan workbench editor terkelola</sub></p>

## Mengapa DSH OpenPencil

DSH OpenPencil menghubungkan [DeepSeek Harness](https://github.com/deepseek-ai/DSH) dengan [OpenPencil](https://github.com/ZSeven-W/openpencil) sehingga sebuah Agen menggerakkan kanvas desain yang nyata, dapat diedit, dan interaktif — alih-alih mengembalikan gambar yang dihasilkan.

<table>
<tr>
<td width="50%">

### 🖼️ Pratinjau Multi-Frame Akurat

Eksportir OpenPencil headless yang terpasang merender pratinjau yang setia pada desain: frame tingkat-teratas pertama sebagai PNG besar yang aman untuk diputar ulang, plus deretan thumbnail yang dapat digulir secara horizontal, klik-untuk-memilih, serta navigasi sebelumnya/berikutnya untuk dokumen multi-frame.

</td>
<td width="50%">

### 🗺️ Kanvas Interaktif

"Buka kanvas interaktif" memasang OpenPencil Web SDK bersifat baca-saja secara lazy dengan pan, zoom, dan fit — periksa halaman mana pun, simpul bersarang, atau halaman nonaktif tanpa meninggalkan percakapan.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Editor Terkelola

Dengan `editable: true`, aksi edit membuka editor OpenPencil terkelola — seleksi, lapisan, properti, alat gambar, undo/redo, dan semantik simpan eksplisit — di workbench sisi kanan yang dapat diubah ukurannya dengan opsi layar penuh.

</td>
<td width="50%">

### 🤖 Alat Desain Asli-Agen

Lima alat — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — memungkinkan Agen membuat, mengubah, dan membaca kanvas nyata melalui program `batch_design` transaksional.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Izin Berbasis Kapabilitas

Izin gambar dan dokumen adalah kapabilitas bertanda tangan yang terikat hash. Metadata peramban tidak pernah mengekspos jalur host sembarangan, dan kapabilitas pratinjau/editor bertanda tangan tidak pernah masuk ke hasil alat kanonis atau konteks model.

</td>
<td width="50%">

### ⚡ Keamanan Transaksional

Dokumen baru diterbitkan hanya setelah seluruh program `batch_design` berhasil. Alat ini tidak pernah menimpa jalur yang sudah ada, batch yang gagal tidak meninggalkan file kosong, dan penyimpanan menggunakan hash optimistis dengan penggantian atomik.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Mengikuti Tampilan & Nuansa DSH

Kartu alat dan editor terkelola mengikuti lokale Tionghoa/Inggris serta tema terang/gelap DSH tanpa memuat ulang sesi pengeditan.

</td>
<td width="50%">

### 🎯 Satu Alur Kerja Lengkap

"Kebutuhan dalam percakapan → Agen mengedit kanvas nyata → pratinjau langsung dan validasi interaksi → terus beriterasi" — satu putaran, tanpa bolak-balik tangkapan layar.

</td>
</tr>
</table>

## Instalasi ke DSH

DSH adalah paket terpisah. Pasang sekali jika belum ada:

```sh
npm install -g @deepseek-ai/dsh@latest
```

Lalu tambahkan plugin ke sebuah profil dan jalankan aplikasi web:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Untuk pengembangan lokal, bangun checkout ini, tautkan path absolutnya ke profil Web, lalu mulai ulang DSH sepenuhnya:

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

Dependensi `link:` membuat hasil build ulang berikutnya langsung terlihat dari checkout ini. Namun, DSH harus dimulai ulang sepenuhnya setelah dependensi profil diganti karena profil Web bawaan tidak melakukan hot reload bundle host secara default.

Tidak ingin memasang DSH secara global? Jalankan dua langkah yang sama lewat `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> Plugin OpenPencil bersifat publik dan tidak memerlukan token npm. Jika DSH prerelease itu sendiri memerlukan autentikasi registry, simpan kredensial tersebut di konfigurasi npm tingkat-pengguna atau sementara di luar checkout. Repositori ini sengaja tidak memuat kredensial registry apa pun.

## Alat Desain

| Alat | Fungsinya |
| --- | --- |
| `openpencil_new` | Membuat `.op` baru dari satu skrip QuickJS `batch_design` transaksional, menyimpannya secara atomik melalui sistem file sandbox DSH, lalu dalam pemanggilan alat yang sama mengembalikan presentasi dapat diedit yang bertanda tangan sehingga DSH otomatis membuka bilah samping editor. |
| `openpencil_create` | Menerapkan program `batch_design` transaksional untuk menghasilkan atau menyusun ulang simpul pada kanvas langsung yang sudah ada. |
| `openpencil_edit` | Mengubah simpul eksplisit atau simpul tunggal yang dipilih pengguna. |
| `openpencil_render` | Membuat snapshot `.op` yang tidak dapat diubah dan diarahkan-oleh-konten, lalu merender setiap frame tingkat-teratas pada halaman aktif — `scale` dan `editable` opsional. |
| `openpencil_selection` | Membaca simpul persis yang dipilih pada kanvas editor langsung. |

## Alur Kerja Desain Agen

Untuk permintaan berbahasa alami tanpa dokumen yang sudah ada, Agen sebaiknya memanggil `openpencil_new` dengan jalur `.op` baru yang relatif terhadap workspace dan program `batch_design` lengkap pertama. Alat ini menjalankan program tersebut di daemon OpenPencil terkelola yang privat dan menerbitkan dokumen otoritatif hanya setelah seluruh batch berhasil. Alat ini tidak pernah menimpa jalur yang sudah ada, dan batch yang gagal tidak meninggalkan file kosong. Presentasi dapat diedit yang bertanda tangan dari pemanggilan sukses yang sama membuat DSH otomatis membuka bilah samping editor; tidak diperlukan pemanggilan `openpencil_render` kedua ataupun pratinjau PNG. Kartu yang diputar ulang, historis, atau dihidrasi tidak pernah terbuka otomatis.

`openpencil_new` memakai antarmuka QuickJS `script` yang sebenarnya dari `batch_design`: Agen membangun dengan panggilan `I`/`K` serta data, array, dan loop JavaScript biasa tanpa menulis `operations` tingkat rendah secara manual. DSH selalu mengaktifkan `postProcess`, lalu secara eksplisit memanggil `finalize_design` setelah pembuatan. Langkah ini melengkapi pembersihan akhir yang setara dengan tahap penutup host bawaan OpenPencil sebelum dokumen diterbitkan. Runtime terkelola dibundel bersama plugin dan tidak bergantung pada biner desktop. Inilah jalur pembuatan saat ini; dokumentasi ini tidak menyatakan bahwa jalur tersebut melewati alat terpisah `design_skeleton`, `design_content`, atau `design_refine`.

Gunakan `openpencil_create` dan `openpencil_edit` hanya untuk kanvas langsung yang sudah ada. Pengeditannya tetap belum disimpan hingga aksi Simpan pada editor.

## Kontrak Rendering

`openpencil_render` menerima jalur `.op`, `scale` opsional (`0 < scale <= 8`, default `1`), dan `editable` opsional (default `false`). Biarkan `width` dan `height` kosong untuk jalur OpenPencil yang akurat: keduanya menggambarkan viewport runtime, bukan dimensi ekspor desain, dan hanya diterima oleh fallback Jian berfidelitas lebih rendah.

Penemuan biner OpenPencil memeriksa, secara berurutan:

1. `DSH_OPENPENCIL_BINARY` atau `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` di `PATH`

Penemuan fallback Jian menggunakan `DSH_OPENPENCIL_JIAN`, build rilis lokal yang diketahui, lalu `PATH`. Jika biner OpenPencil yang akurat benar-benar tidak tersedia, Jian dapat menghasilkan fallback `runtime-preview` yang diberi label jelas. Kegagalan renderer akurat, waktu habis, dan PNG tidak valid tidak akan diam-diam dialihkan ke fallback.

## Aset Penampil Web

DSH hanya menyajikan `client.js` untuk plugin klien, sehingga OpenPencil ESM SDK, WASM-nya, dan CanvasKit disiapkan sebagai aset same-origin yang eksplisit:

```sh
pnpm run sync:viewer-assets
```

Perintah sinkronisasi lebih mengutamakan checkout `../openpencil` yang bersebelahan (pengembangan lokal), dengan fallback ke submodul `vendor/openpencil` yang di-vendor (CI dan clone baru). Ganti dengan `OPENPENCIL_ROOT` atau `--openpencil-root`. Direktori aset pra-build yang lengkap dapat dipilih dengan `DSH_OPENPENCIL_VIEWER_SOURCE`. Pencarian saat runtime dapat diganti dengan `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Aset penampil dimuat secara lazy hanya setelah pengguna membuka kanvas. Jika tidak ada atau tidak valid, pratinjau PNG tetap tersedia dan tidak ada tombol kanvas yang ditampilkan.

## Editor Terkelola

Sesi yang dapat diedit menggunakan host web terkelola OpenPencil — arsitektur yang sama dengan `op-vscode`. Plugin memulai host hanya setelah aksi pengguna yang berwenang, menyimpan token daemon di memori, memvalidasi sumber dan origin iframe, serta menutup proses saat sesi editor berakhir. Permukaan editor dipilih secara progresif: detail Tool native saat host mendeklarasikan sambungan tersebut, jika tidak maka workbench sisi kanan plugin dengan kontrol ubah-ukuran dan layar penuh.

Startup menggunakan listening handshake yang aman untuk mount lambat: probe kesiapan baru dimulai setelah host bawaan mengumumkan alamat yang telah di-bind. Instalasi OpenPencil desktop tidak diperlukan.

Instalasi yang dipublikasikan memilih paket yang sesuai dengan OS/CPU saat ini dari enam paket platform native: `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64`, dan `win32-x64`; kedua paket Linux menargetkan glibc. Paket root mendeklarasikan semuanya sebagai `optionalDependencies` dengan versi persis agar pengelola paket memilih varian yang benar (misalnya `@zseven-w/dsh-openpencil-darwin-arm64`). Paket tersebut menyertakan `op-host-web-server`, bundel web editor, dan CanvasKit sebagai satu runtime yang saling cocok. Karena itu, editor terkelola tidak bergantung pada `/Applications/OpenPencil.app`, `openpencil-desktop` di `PATH`, ataupun checkout sumber OpenPencil. Ketentuan ini berlaku untuk sesi terkelola yang dapat diedit; renderer PNG presisi tetap mengikuti kontrak penemuan biner terpisah yang dijelaskan di atas.

Jika DSH memuat ulang atau melepas plugin saat kanvas masih kotor (belum disimpan), host menyimpan draf pemulihan lokal yang tidak transparan hingga tujuh hari. Membuka ulang sumber yang sama akan menanyakan sebelum memulihkannya ke kanvas langsung; pemulihan tidak pernah menimpa file `.op` hingga pengguna menyimpan secara eksplisit.

Paket resmi untuk keenam platform menerima endpoint bootstrap kolaborasi China dan Global selama build release yang dilindungi; nilai yang disuntikkan divalidasi sebelum dipublikasikan. Build mandiri lokal tanpa penyuntikan tersebut dapat menimpa bootstrap sebelum memulai DSH dengan `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap`; nilainya harus menggunakan `https` dan path harus tepat `/api/v1/collaboration/bootstrap`.

Sinkronisasi kanvas lintas perangkat mengharuskan runtime native PC/DSH dan aplikasi seluler sama-sama diperbarui ke lini rilis OpenPencil yang sama dan memuat perbaikan antrean kolaborasi saat ini. Menggabungkan aplikasi seluler lama dengan runtime PC yang lebih baru masih dapat menampilkan kursor jarak jauh tanpa menerima commit kanvas.

Saat mengembangkan dari repositori ini, sebelum menjalankan DSH build terlebih dahulu Web bundle editor, lalu host native, kemudian stage runtime yang saling cocok tersebut.

`pnpm run build:editor-web` menjalankan WASM bundle gate yang didukung resmi oleh OpenPencil. Langkah ini memerlukan Bash, Cargo/Rust dengan target `wasm32-unknown-unknown`, CLI `wasm-bindgen`, `wasm-opt` dari Binaryen, Node.js, dan `gzip`; CanvasKit tidak memerlukan EMSDK. Web build tidak menggunakan variabel build bootstrap kolaborasi. Sebelum `pnpm run build:editor-runtime`, tetapkan `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` dan `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL`. Keduanya hanya digunakan oleh native Cargo build, yang akan fail closed jika salah satunya tidak ada. Setelah kedua build berhasil, stage runtime dengan perintah terakhir.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

Override runtime eksplisit hanya diterima sebagai satu set lengkap yang saling cocok:

- `DSH_OPENPENCIL_EDITOR_BINARY` untuk `op-host-web-server`;
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` untuk bundel web editor yang telah dibangun;
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` untuk aset CanvasKit.

Memberikan hanya sebagian dari set tersebut merupakan konfigurasi yang tidak valid; plugin tidak menggabungkan path khusus dengan aset runtime yang disertakan dalam paket.

Penyimpanan menggunakan hash sumber optimistis, penggantian atomik, dan kapabilitas penerus. Jika sumber berubah di luar editor, plugin melaporkan konflik alih-alih menimpanya.

## Metadata Hasil

Hasil yang terlihat model tetap berupa JSON polos. `presentationMeta.$dshOpenPencil` khusus peramban membawa izin tambahan untuk:

- `image`: jalur PNG, URL pratinjau/unduh, serta lebar/tinggi asli;
- `frames`: setiap frame tingkat-teratas yang dirender akurat sesuai urutan halaman aktif, termasuk id/nama/indeks simpul dan URL PNG bertanda tangan;
- `document`: jalur aksi sumber plus URL snapshot yang tidak dapat diubah, byte, dan SHA-256;
- `viewer`: URL SDK/WASM/CanvasKit berrevisi saat rute aset terpasang;
- `editor`: kapabilitas peluncuran/penyegaran terbatas saat `editable: true` diberi otorisasi.

Hasil juga mencatat `renderer`, `rendererBinary`, `fidelity`, dan peringatan apa pun. Pesan schema-v1 yang hanya berisi PNG yang sudah ada tetap dapat dirender.

DSH `0.1.1-rc.2` tidak menyimpan metadata presentasi peramban secara persisten untuk alat yang bersarang di bawah PTC/Code Mode. Plugin memulihkan proyeksi UI-only tersebut melalui endpoint same-origin yang terikat sesi: peramban hanya mengirim session id, call id, dan SHA-256 dokumen yang tidak dapat diubah, sementara host menyelesaikan hasil otoritatif dari log sesi DSH yang tahan lama dan menggunakan penanda dalam-proses berumur pendek hanya untuk mengotorisasi pengeditan langsung terbaru. Kapabilitas pratinjau/editor bertanda tangan tidak pernah masuk ke hasil alat kanonis atau konteks model. Riwayat tahan lama dapat memulihkan pratinjau baca-saja; izin editor hanya diterbitkan untuk hasil langsung terbaru yang tepercaya.

Untuk pemutaran ulang yang terbatas, pemulihan metadata bersarang menerima hingga 128 frame tingkat-teratas; hasil Code Mode yang lebih besar tetap tersedia melalui fallback JSON kanonisnya.

## Batasan Saat Ini

- Pengeditan lanjutan pada kanvas yang sudah ada memerlukan editor terkelola yang sudah terbuka. Perubahan tetap belum disimpan hingga pengguna memanggil aksi Simpan.
- Kanvas Web SDK yang ringan bersifat baca-saja; pengeditan penuh menggunakan permukaan editor terkelola terpisah. Pada DSH `0.1.1-rc.2`, plugin menggunakan workbench kanan yang dapat diubah ukurannya dengan opsi layar penuh.
- Galeri akurat mencakup frame tingkat-teratas pada halaman aktif; kanvas interaktif tetap menjadi cara untuk memeriksa halaman nonaktif dan simpul bersarang.
- Cache render dan snapshot masih memerlukan kebijakan retensi tingkat produk.

## Struktur Proyek

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

## Build dan Verifikasi

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

Build memerlukan Node 24.11 atau lebih baru dan pnpm. Paket host/klien DSH adalah dependensi peer yang disediakan oleh profil DSH target. Alat build diselesaikan dari dependensi dev lokal, checkout DSH tertaut yang aktif, atau bundel sumber DSH yang terpasang; `DSH_SOURCE_ROOT` dapat memilih checkout sumber secara eksplisit. Lockfile mengunci alat build publik yang berdiri sendiri saat lingkungan tersebut disediakan secara terpisah.

Untuk DSH prerelease privat, simpan kredensial npm yang diterbitkan di luar repositori ini (misalnya di `.npmrc` tingkat-pengguna atau sementara) dan jalankan versi yang diminta secara langsung:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

Jangan pernah melakukan commit pada `.npmrc`, `NPM_TOKEN`, atau kredensial registry yang disalin. Repositori ini mengabaikan konfigurasi npm lokal secara default.

`test:host` melakukan render akurat sungguhan, memvalidasi geometri PNG IHDR dan SHA-256, menguji kapabilitas gambar/dokumen yang tidak dapat diubah melalui HTTP, dan memeriksa bahwa aset penampil dapat diberikan izin. Dimensi yang diharapkan bersifat spesifik terhadap fixture.

## Ekosistem

DSH OpenPencil adalah plugin DeepSeek Harness untuk **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — alat desain vektor AI-native open-source pertama di dunia — dan bagian dari keluarga **[ZSeven-W](https://github.com/ZSeven-W)** yang berisi alat AI-native murni-Rust.

| Proyek | Penjelasan |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | Alat desain yang digerakkan plugin ini — generasi prompt-ke-kanvas, tim agen konkuren, file `.op` desain-sebagai-kode, dan server MCP bawaan. Pratinjau akurat, kanvas interaktif, dan editor terkelola di sini ditenagai oleh OpenPencil itu sendiri. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Runtime async murni-Rust untuk mengirimkan agen LLM — multi-penyedia, mampu menggunakan alat end-to-end, izin terstruktur, MCP nyata, tanpa `unsafe` sama sekali. Menopang runtime agen bawaan OpenPencil. |
| **[jian](https://github.com/ZSeven-W/jian)** | Framework UI GPU-Skia murni-Rust — widget, tata letak, event, dan hot reload dalam satu stack. Framework UI OpenPencil, dan sumber renderer fallback plugin ini. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Asisten pengodean AI-native open-source untuk terminal Anda — membaca kode Anda, menjalankan perintah, dan menggerakkan OpenPencil melalui MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Sistem memori non-vektor, local-first untuk agen pengodean — memori tahan lama sebagai file yang dapat diperiksa, bekerja di berbagai runtime. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | Plugin skill LLM yang mengajarkan agen AI cara mendesain dengan `op` — pendamping plugin DSH ini. |

Plugin DSH lainnya:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — emulator Android atau perangkat USB langsung di dalam percakapan, digerakkan sepenuhnya melalui adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — delegasikan pekerjaan ke agen DSH dari Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — iOS Simulator langsung — dan iPhone via USB — di dalam percakapan
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — memori jangka panjang untuk DSH

## Kontribusi

Kontribusi sangat diterima! Fork dan clone, buat branch, jalankan `pnpm run build` dan rangkaian tes, commit dengan [Conventional Commits](https://www.conventionalcommits.org/), lalu buka PR ke `main`.

## Komunitas

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Gabung Discord kami</strong>
</a>
— Ajukan pertanyaan, bagikan desain, sarankan fitur.

**Komunitas yang diakui: [LINUX DO](https://linux.do/)**

## Lisensi

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Komponen pihak ketiga tercantum di [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
