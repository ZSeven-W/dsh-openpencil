<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>ปลั๊กอิน DeepSeek Harness สำหรับ OpenPencil — ดูตัวอย่าง ตรวจสอบ และแก้ไขเอกสาร <code>.op</code> จริงภายในบทสนทนา</strong><br />
  <sub>พรีวิวหลายเฟรมที่แม่นยำ &bull; แคนวาสแบบอินเทอร์แอกทีฟ &bull; โปรแกรมแก้ไขแบบจัดการ &bull; เครื่องมือออกแบบสำหรับ Agent โดยเฉพาะ</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · เวอร์ชันปลั๊กอินปัจจุบัน: <code>0.1.0-rc.2</code> · ทดสอบกับ DSH <code>0.1.1-rc.1</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md"><b>ไทย</b></a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — พรีวิวหลายเฟรมและโปรแกรมแก้ไขแถบด้านข้าง" width="100%" />
</p>
<p align="center"><sub>พรีวิวหลายเฟรม <code>.op</code> ที่แม่นยำ พร้อมแคนวาสแบบอินเทอร์แอกทีฟและเวิร์กเบนช์โปรแกรมแก้ไขแบบจัดการ</sub></p>

## ทำไมต้อง DSH OpenPencil

DSH OpenPencil เชื่อมต่อ [DeepSeek Harness](https://github.com/deepseek-ai/DSH) เข้ากับ [OpenPencil](https://github.com/ZSeven-W/openpencil) เพื่อให้ Agent ขับเคลื่อนแคนวาสออกแบบจริงที่แก้ไขได้และโต้ตอบได้ แทนที่จะส่งกลับเป็นเพียงรูปภาพที่ถูกสร้างขึ้น

<table>
<tr>
<td width="50%">

### 🖼️ พรีวิวหลายเฟรมที่แม่นยำ

ตัวส่งออกแบบ headless ของ OpenPencil ที่ติดตั้งไว้จะเรนเดอร์พรีวิวที่ตรงตามงานออกแบบ: เฟรมระดับบนสุดเฟรมแรกเป็น PNG ขนาดใหญ่ที่เล่นซ้ำได้อย่างปลอดภัย พร้อมแถบภาพขนาดย่อที่เลื่อนแนวนอนได้ คลิกเพื่อเลือก และปุ่มนำทางก่อนหน้า/ถัดไปสำหรับเอกสารหลายเฟรม

</td>
<td width="50%">

### 🗺️ แคนวาสแบบอินเทอร์แอกทีฟ

คำสั่ง "Open interactive canvas" จะโหลด OpenPencil Web SDK แบบอ่านอย่างเดียวแบบ lazy พร้อมการแพน ซูม และจัดให้พอดี — ตรวจสอบหน้าใด ๆ โหนดที่ซ้อนกัน หรือหน้าที่ไม่ได้ใช้งานได้โดยไม่ต้องออกจากบทสนทนา

</td>
</tr>
<tr>
<td width="50%">

### ✏️ โปรแกรมแก้ไขแบบจัดการ

เมื่อตั้งค่า `editable: true` การแก้ไขจะเปิดโปรแกรมแก้ไข OpenPencil แบบจัดการ — การเลือก เลเยอร์ คุณสมบัติ เครื่องมือวาดภาพ เลิกทำ/ทำซ้ำ และความหมายของการบันทึกที่ชัดเจน — ในเวิร์กเบนช์ด้านขวาที่ปรับขนาดได้พร้อมตัวเลือกเต็มหน้าจอ

</td>
<td width="50%">

### 🤖 เครื่องมือออกแบบสำหรับ Agent โดยเฉพาะ

เครื่องมือห้าตัว — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — ให้ Agent สร้าง แก้ไข และอ่านแคนวาสจริงผ่านโปรแกรม `batch_design` แบบ transactional

</td>
</tr>
<tr>
<td width="50%">

### 🔐 การอนุญาตแบบกำหนดด้วยความสามารถ

สิทธิ์ภาพและเอกสารเป็นความสามารถที่ลงนามและผูกกับแฮช เมตาดาต้าในเบราว์เซอร์ไม่เปิดเผยพาธของโฮสต์ตามอำเภอใจ และความสามารถพรีวิว/แก้ไขที่ลงนามจะไม่เข้าไปในผลลัพธ์เครื่องมือหลักหรือบริบทของโมเดล

</td>
<td width="50%">

### ⚡ ความปลอดภัยแบบ Transactional

เอกสารใหม่จะถูกเผยแพร่ก็ต่อเมื่อโปรแกรม `batch_design` ทั้งหมดสำเร็จเท่านั้น เครื่องมือจะไม่เขียนทับพาธที่มีอยู่ แบทช์ที่ล้มเหลวจะไม่ทิ้งไฟล์ว่างไว้ และการบันทึกใช้แฮชแบบ optimistic พร้อมการแทนที่แบบ atomic

</td>
</tr>
<tr>
<td width="50%">

### 🌍 ตามรูปลักษณ์และความรู้สึกของ DSH

การ์ดเครื่องมือและโปรแกรมแก้ไขแบบจัดการเป็นไปตามภาษา จีน/อังกฤษ และธีมสว่าง/มืดของ DSH โดยไม่ต้องโหลดเซสชันการแก้ไขใหม่

</td>
<td width="50%">

### 🎯 เวิร์กโฟลว์ครบวงจรเดียว

"ความต้องการในบทสนทนา → Agent แก้ไขแคนวาสจริง → พรีวิวสดและการตรวจสอบการโต้ตอบ → วนซ้ำต่อไป" — วงจรเดียว ไม่ต้องส่ง screenshot ไปมา

</td>
</tr>
</table>

## ติดตั้งลงใน DSH

DSH เป็นแพ็กเกจแยกต่างหาก ถ้ายังไม่มีให้ติดตั้งหนึ่งครั้ง:

```sh
npm install -g @deepseek-ai/dsh@0.1.1-rc.1
```

จากนั้นเพิ่มปลั๊กอินเข้าโปรไฟล์แล้วเริ่มเว็บแอป:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

ไม่อยากติดตั้ง DSH แบบ global? รันสองขั้นตอนเดียวกันผ่าน `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

> ปลั๊กอิน OpenPencil เป็นแบบสาธารณะและไม่ต้องใช้ npm token หาก DSH prerelease เองต้องมีการยืนยันตัวตนของ registry ให้เก็บข้อมูลรับรองนั้นไว้ใน npm config ระดับผู้ใช้หรือชั่วคราวนอก checkout ที่เก็บนี้ตั้งใจไม่ให้มีข้อมูลรับรอง registry ใด ๆ

## เครื่องมือออกแบบ

| เครื่องมือ | หน้าที่ |
| --- | --- |
| `openpencil_new` | สร้าง `.op` ใหม่ทั้งหมดจากโปรแกรม `batch_design` แบบ transactional หนึ่งโปรแกรม บันทึกแบบ atomic ผ่านระบบไฟล์ sandbox ของ DSH และไม่ต้องเปิดโปรแกรมแก้ไขไว้ก่อน |
| `openpencil_create` | ใช้โปรแกรม `batch_design` แบบ transactional เพื่อสร้างหรือจัดโครงสร้างโหนดใหม่บนแคนวาสสดที่มีอยู่ |
| `openpencil_edit` | แก้ไขโหนดที่ระบุชัดเจนหรือโหนดเดียวที่ผู้ใช้เลือก |
| `openpencil_render` | สร้างสแนปช็อต `.op` แบบ immutable และอ้างอิงตามเนื้อหา แล้วเรนเดอร์เฟรมระดับบนสุดทุกเฟรมบนหน้าที่ใช้งานอยู่ — รองรับ `scale` และ `editable` แบบไม่บังคับ |
| `openpencil_selection` | อ่านโหนดที่เลือกอยู่จริงในแคนวาสของโปรแกรมแก้ไขสด |

## เวิร์กโฟลว์การออกแบบของ Agent

สำหรับคำขอภาษาธรรมชาติที่ยังไม่มีเอกสารเดิม Agent ควรเรียก `openpencil_new` พร้อมพาธ `.op` ใหม่ที่สัมพันธ์กับเวิร์กสเปซและโปรแกรม `batch_design` ฉบับสมบูรณ์ชุดแรก เครื่องมือจะรันโปรแกรมนั้นใน daemon OpenPencil แบบจัดการส่วนตัว และเผยแพร่เอกสารฉบับหลักก็ต่อเมื่อแบทช์ทั้งหมดสำเร็จเท่านั้น เครื่องมือจะไม่เขียนทับพาธที่มีอยู่ และแบทช์ที่ล้มเหลวจะไม่ทิ้งไฟล์ว่างไว้ หลังจากนั้น Agent ควรเรียก `openpencil_render` พร้อมพาธที่คืนมา `editable: true` และ `autoOpen: true` เพื่อแสดงแกลเลอรีและขยายโปรแกรมแก้ไขหนึ่งครั้ง การ์ดประวัติที่ถูกเล่นซ้ำหรือตั้งค่าครั้งแรกจะไม่เปิดอัตโนมัติ

ใช้ `openpencil_create` และ `openpencil_edit` เฉพาะกับแคนวาสสดที่มีอยู่เท่านั้น การแก้ไขของทั้งคู่จะยังไม่ถูกบันทึกจนกว่าผู้ใช้จะกดบันทึกในโปรแกรมแก้ไข

## ข้อตกลงการเรนเดอร์

`openpencil_render` รับพาธ `.op`, `scale` แบบไม่บังคับ (`0 < scale <= 8`, ค่าเริ่มต้น `1`) และ `editable` แบบไม่บังคับ (ค่าเริ่มต้น `false`) ปล่อย `width` และ `height` ไว้ไม่ตั้งค่าสำหรับพาธ OpenPencil ที่แม่นยำ: ค่าเหล่านี้อธิบาย viewport ตอนรัน ไม่ใช่ขนาดส่งออกของงานออกแบบ และยอมรับได้เฉพาะใน Jian fallback ที่มีความเที่ยงตรงต่ำกว่าเท่านั้น

การค้นหาไบนารี OpenPencil จะตรวจสอบตามลำดับ:

1. `DSH_OPENPENCIL_BINARY` or `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` บน `PATH`

การค้นหา Jian fallback ใช้ `DSH_OPENPENCIL_JIAN` ซึ่งเป็น release build ในเครื่องที่รู้จัก จากนั้นจึงใช้ `PATH` หากไบนารี OpenPencil ที่แม่นยำไม่พร้อมใช้งานจริง ๆ Jian อาจสร้าง fallback `runtime-preview` ที่ติดฉลากชัดเจน ความล้มเหลวของตัวเรนเดอร์ที่แม่นยำ การหมดเวลา และ PNG ที่ไม่ถูกต้องจะไม่ถูก fall back อย่างเงียบ ๆ

## สินทรัพย์ Web Viewer

DSH ให้บริการเฉพาะ `client.js` สำหรับปลั๊กอินฝั่งไคลเอนต์ ดังนั้น OpenPencil ESM SDK, WASM และ CanvasKit จึงถูกจัดเตรียมเป็นสินทรัพย์ same-origin อย่างชัดเจน:

```sh
pnpm run sync:viewer-assets
```

คำสั่ง sync จะเลือกใช้ checkout `../openpencil` ที่อยู่ข้างเคียง (การพัฒนาท้องถิ่น) เป็นอันดับแรก และใช้ submodule `vendor/openpencil` ที่ vendor ไว้เป็นตัวสำรอง (CI และการ clone ใหม่) ใช้ `OPENPENCIL_ROOT` หรือ `--openpencil-root` เพื่อแทนที่ ไลบรารีสินทรัพย์ที่ build ไว้ล่วงหน้าทั้งหมดสามารถเลือกได้ด้วย `DSH_OPENPENCIL_VIEWER_SOURCE` และการค้นหาตอนรันสามารถแทนที่ได้ด้วย `DSH_OPENPENCIL_VIEWER_ASSET_DIR`

สินทรัพย์ viewer จะถูกโหลดแบบ lazy หลังจากผู้ใช้เปิดแคนวาสเท่านั้น หากสินทรัพย์ไม่มีหรือไม่ถูกต้อง พรีวิว PNG ยังคงใช้งานได้ และจะไม่มีการแสดงปุ่มแคนวาส

## โปรแกรมแก้ไขแบบจัดการ

เซสชันที่แก้ไขได้ใช้ managed web host ของ OpenPencil — สถาปัตยกรรมเดียวกับที่ `op-vscode` ใช้ ปลั๊กอินจะเริ่ม host ก็ต่อเมื่อมีการกระทำของผู้ใช้ที่ได้รับอนุญาต เก็บโทเค็น daemon ไว้ในหน่วยความจำ ตรวจสอบ source และ origin ของ iframe และปิดโพรเซสเมื่อเซสชันของโปรแกรมแก้ไขสิ้นสุด พื้นผิวตัวแก้ไขจะถูกเลือกแบบค่อยเป็นค่อยไป: รายละเอียดเครื่องมือแบบเนทีฟเมื่อ host ประกาศจุดเชื่อมต่อนั้น มิฉะนั้นจะใช้เวิร์กเบนช์ด้านขวาของปลั๊กอินพร้อมการปรับขนาดและปุ่มเต็มหน้าจอ

หาก DSH โหลดซ้ำหรือยกเลิกการโหลดปลั๊กอินในขณะที่แคนวาสยังไม่บันทึก host จะเก็บร่างกู้คืนในเครื่องแบบ opaque ไว้นานสูงสุดเจ็ดวัน การเปิด source เดียวกันซ้ำจะถามก่อนกู้คืนลงในแคนวาสสด การกู้คืนจะไม่เขียนทับไฟล์ `.op` จนกว่าผู้ใช้จะบันทึกอย่างชัดเจน

การค้นหาไบนารีและ source สามารถแทนที่ได้ด้วย:

- `DSH_OPENPENCIL_EDITOR_BINARY` สำหรับ `op-host-web-server`;
- `DSH_OPENPENCIL_SOURCE_ROOT` (หรือ `OPENPENCIL_SOURCE_ROOT`) สำหรับเว็บบันเดิลและสินทรัพย์ CanvasKit

การบันทึกใช้แฮช source แบบ optimistic การแทนที่แบบ atomic และความสามารถของผู้สืบทอด หาก source เปลี่ยนแปลงนอกโปรแกรมแก้ไข ปลั๊กอินจะรายงานความขัดแย้งแทนที่จะเขียนทับ

## เมตาดาต้าของผลลัพธ์

ผลลัพธ์ที่โมเดลมองเห็นยังคงเป็น JSON ธรรมดา `presentationMeta.$dshOpenPencil` สำหรับเบราว์เซอร์เท่านั้นถือสิทธิ์แบบเพิ่มเติมสำหรับ:

- `image`: พาธ PNG, URL พรีวิว/ดาวน์โหลด และความกว้าง/ความสูงจริง;
- `frames`: เฟรมระดับบนสุดทุกเฟรมที่เรนเดอร์อย่างแม่นยำตามลำดับหน้าที่ใช้งานอยู่ รวมถึง node id/name/index และ URL PNG ที่ลงนาม;
- `document`: พาธการกระทำ source พร้อม URL สแนปช็อตแบบ immutable, ขนาดไบต์ และ SHA-256;
- `viewer`: URL SDK/WASM/CanvasKit แบบมีรุ่นเมื่อเชื่อมต่อเส้นทางสินทรัพย์;
- `editor`: ความสามารถเปิด/รีเฟรชแบบจำกัดขอบเขตเมื่อ `editable: true` ได้รับอนุญาต

ผลลัพธ์ยังบันทึก `renderer`, `rendererBinary`, `fidelity` และคำเตือนใด ๆ ข้อความ schema-v1 ที่เป็น PNG เท่านั้นยังคงเรนเดอร์ได้

DSH `0.1.1-rc.1` จะไม่คงเมตาดาต้าการนำเสนอในเบราว์เซอร์สำหรับเครื่องมือที่ซ้อนอยู่ใต้ PTC/Code Mode ปลั๊กอินจะกู้คืน projection แบบ UI-only นั้นผ่าน endpoint แบบ same-origin ที่ผูกกับเซสชัน: เบราว์เซอร์ส่งเฉพาะ session id, call id และ SHA-256 ของเอกสารแบบ immutable ในขณะที่ host แก้ไขผลลัพธ์ฉบับหลักจากบันทึกเซสชัน DSH ที่ทนทาน และใช้ marker ในโพรเซสอายุสั้นเพื่ออนุญาตการแก้ไขสดล่าสุดเท่านั้น ความสามารถพรีวิว/แก้ไขที่ลงนามจะไม่เข้าไปในผลลัพธ์เครื่องมือหลักหรือบริบทของโมเดล ประวัติที่ทนทานสามารถกู้คืนพรีวิวแบบอ่านอย่างเดียว และสิทธิ์แก้ไขจะออกให้เฉพาะผลลัพธ์สดล่าสุดที่เชื่อถือได้เท่านั้น

สำหรับการเล่นซ้ำแบบจำกัดขอบเขต การกู้คืนเมตาดาต้าแบบซ้อนยอมรับเฟรมระดับบนสุดสูงสุด 128 เฟรม ผลลัพธ์ Code Mode ที่ใหญ่กว่ายังคงเข้าถึงได้ผ่าน canonical JSON fallback

## ข้อจำกัดปัจจุบัน

- การแก้ไขต่อเนื่องบนแคนวาสที่มีอยู่ต้องมีโปรแกรมแก้ไขแบบจัดการที่เปิดไว้แล้ว การเปลี่ยนแปลงจะยังไม่ถูกบันทึกจนกว่าผู้ใช้จะเรียกใช้การบันทึก
- แคนวาส Web SDK แบบน้ำหนักเบาเป็นแบบอ่านอย่างเดียว การแก้ไขเต็มรูปแบบใช้พื้นผิวโปรแกรมแก้ไขแบบจัดการแยกต่างหาก บน DSH `0.1.1-rc.1` ปลั๊กอินใช้เวิร์กเบนช์ด้านขวาที่ปรับขนาดได้พร้อมตัวเลือกเต็มหน้าจอ
- แกลเลอรีที่แม่นยำครอบคลุมเฟรมระดับบนสุดบนหน้าที่ใช้งานอยู่ แคนวาสแบบอินเทอร์แอกทีฟยังคงเป็นวิธีตรวจสอบหน้าที่ไม่ได้ใช้งานและโหนดที่ซ้อนกัน
- แคชการเรนเดอร์และสแนปช็อตยังต้องมีนโยบายการเก็บรักษาระดับผลิตภัณฑ์

## โครงสร้างโปรเจกต์

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

## Build และตรวจสอบ

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

การ build ต้องใช้ Node 24.11 ขึ้นไปและ pnpm แพ็กเกจ host/client ของ DSH เป็น peer dependencies ที่มาจากโปรไฟล์ DSH เป้าหมาย เครื่องมือ build ถูกแก้ไขจาก dev dependencies ในเครื่อง, checkout DSH ที่ลิงก์อยู่ หรือ DSH source bundle ที่ติดตั้งไว้; `DSH_SOURCE_ROOT` สามารถเลือก source checkout ได้อย่างชัดเจน ล็อกไฟล์จะตรึงเครื่องมือ build สาธารณะแบบ standalone เมื่อสภาพแวดล้อมนั้นถูกจัดเตรียมแยกต่างหาก

สำหรับ DSH prerelease ส่วนตัว ให้เก็บข้อมูลรับรอง npm ที่ออกให้ไว้นอกที่เก็บนี้ (เช่นใน `.npmrc` ระดับผู้ใช้หรือชั่วคราว) และรันเวอร์ชันที่ต้องการโดยตรง:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

ห้าม commit `.npmrc`, `NPM_TOKEN` หรือข้อมูลรับรอง registry ที่คัดลอกมา ที่เก็บนี้ละเว้นการกำหนดค่า npm ในเครื่องตามค่าเริ่มต้น

`test:host` ทำการเรนเดอร์ที่แม่นยำจริง ตรวจสอบเรขาคณิต PNG IHDR และ SHA-256 ทดสอบความสามารถภาพ/เอกสารแบบ immutable ผ่าน HTTP และตรวจสอบว่าสินทรัพย์ viewer อนุญาตได้ ขนาดที่คาดหวังขึ้นอยู่กับฟิกซ์เจอร์แต่ละชุด

## ระบบนิเวศ

DSH OpenPencil คือปลั๊กอิน DeepSeek Harness สำหรับ **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — เครื่องมือออกแบบเวกเตอร์แบบ AI-native โอเพนซอร์สตัวแรกของโลก — และเป็นส่วนหนึ่งของตระกูล **[ZSeven-W](https://github.com/ZSeven-W)** เครื่องมือแบบ AI-native ที่เขียนด้วย Rust บริสุทธิ์

| โปรเจกต์ | คำอธิบาย |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | เครื่องมือออกแบบที่ปลั๊กอินนี้ขับเคลื่อน — การสร้าง prompt-to-canvas, ทีม agent แบบทำงานพร้อมกัน, ไฟล์ `.op` แบบ design-as-code และ MCP server ในตัว พรีวิวที่แม่นยำ แคนวาสแบบอินเทอร์แอกทีฟ และโปรแกรมแก้ไขแบบจัดการที่นี่ขับเคลื่อนโดย OpenPencil เอง |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | รันไทม์ async แบบ Rust บริสุทธิ์สำหรับส่งมอบ LLM agent — รองรับหลายผู้ให้บริการ, มีความสามารถใช้เครื่องมือแบบ end-to-end, การอนุญาตแบบมีโครงสร้าง, MCP จริง, `unsafe` เป็นศูนย์ ขับเคลื่อนรันไทม์ agent ในตัวของ OpenPencil |
| **[jian](https://github.com/ZSeven-W/jian)** | เฟรมเวิร์ก UI แบบ GPU-Skia และ Rust บริสุทธิ์ — วิดเจ็ต เลย์เอาต์ อีเวนต์ และ hot reload ในสแตกเดียว เป็นเฟรมเวิร์ก UI ของ OpenPencil และเป็นที่มาของตัวเรนเดอร์ fallback ของปลั๊กอินนี้ |
| **[Zode](https://github.com/ZSeven-W/zode)** | ผู้ช่วยเขียนโค้ดแบบ AI-native โอเพนซอร์สสำหรับเทอร์มินัลของคุณ — อ่านโค้ดของคุณ รันคำสั่ง และขับเคลื่อน OpenPencil ผ่าน MCP |
| **[noema](https://github.com/ZSeven-W/noema)** | ระบบหน่วยความจำแบบ local-first ที่ไม่ใช่เวกเตอร์สำหรับ coding agent — หน่วยความจำที่ทนทานในรูปไฟล์ที่ตรวจสอบได้ ทำงานได้ข้ามรันไทม์ |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | ปลั๊กอินทักษะ LLM ที่สอน AI agent วิธีออกแบบด้วย `op` — คู่หูของปลั๊กอิน DSH นี้ |

ปลั๊กอิน DSH อื่นในตระกูลเดียวกัน:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — อีมูเลเตอร์ Android หรืออุปกรณ์ผ่าน USB แบบสดภายในบทสนทนา ขับเคลื่อนทั้งหมดผ่าน adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — มอบหมายงานให้เอเจนต์ DSH จาก Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — iOS Simulator ที่ทำงานจริง — และ iPhone ที่ต่อผ่าน USB — ภายในบทสนทนา
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — หน่วยความจำระยะยาวสำหรับ DSH

## การมีส่วนร่วม

ยินดีต้อนรับการมีส่วนร่วม! Fork และ clone สร้าง branch รัน `pnpm run build` และชุดทดสอบ commit ด้วย [Conventional Commits](https://www.conventionalcommits.org/) และเปิด PR ไปที่ `main`

## ชุมชน

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> เข้าร่วม Discord ของเรา</strong>
</a>
— ถามคำถาม แบ่งปันงานออกแบบ แนะนำฟีเจอร์

**ชุมชนที่ได้รับการยอมรับ: [LINUX DO](https://linux.do/)**

## สัญญาอนุญาต

[MIT](./LICENSE) — ลิขสิทธิ์ (c) 2026 ZSeven-W

คอมโพเนนต์ของบุคคลที่สามระบุไว้ใน [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
