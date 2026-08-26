<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>OpenPencil için DeepSeek Harness eklentisi — sohbet içinde gerçek <code>.op</code> belgelerini önizleyin, inceleyin ve düzenleyin.</strong><br />
  <sub>Birebir Çok Kareli Önizlemeler &bull; Etkileşimli Tuval &bull; Yönetilen Düzenleyici &bull; Ajan-Yerli Tasarım Araçları</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Geçerli eklenti sürümü: <code>0.1.0-rc.6</code> · DSH <code>0.1.1-rc.2</code> sürümüne kadar test edildi</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md"><b>Türkçe</b></a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — çok kareli önizleme ve kenar çubuğu düzenleyicisi" width="100%" />
</p>
<p align="center"><sub>Etkileşimli tuval ve yönetilen düzenleyici çalışma alanıyla birebir çok kareli <code>.op</code> önizlemeleri</sub></p>

## Neden DSH OpenPencil

DSH OpenPencil, [DeepSeek Harness](https://github.com/deepseek-ai/DSH) ile [OpenPencil](https://github.com/ZSeven-W/openpencil)'ı birbirine bağlar; böylece bir Ajan, üretilmiş bir görsel döndürmek yerine gerçek, düzenlenebilir, etkileşimli bir tasarım tuvalini yönetir.

<table>
<tr>
<td width="50%">

### 🖼️ Birebir Çok Kareli Önizlemeler

Kurulu OpenPencil başsız dışa aktarıcısı tasarıma sadık önizlemeler üretir: ilk üst düzey kare, oynatıma uygun büyük bir PNG olarak; ayrıca çok kareli belgeler için yatay kaydırılabilir bir küçük resim şeridi, tıklayarak seçme ve önceki/sonraki gezinme.

</td>
<td width="50%">

### 🗺️ Etkileşimli Tuval

"Etkileşimli tuvale aç" seçeneği, salt okunur OpenPencil Web SDK'sını kaydırma, yakınlaştırma ve sığdırma ile tembel olarak yükler — sohbetten çıkmadan herhangi bir sayfayı, iç içe düğümü veya etkin olmayan sayfayı inceleyin.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Yönetilen Düzenleyici

`editable: true` ile düzenleme eylemi, yönetilen OpenPencil düzenleyicisini — seçim, katmanlar, özellikler, çizim araçları, geri al/yinele ve açık kaydetme semantiği — tam ekran seçeneği olan yeniden boyutlandırılabilir sağ taraftaki çalışma alanında açar.

</td>
<td width="50%">

### 🤖 Ajan-Yerli Tasarım Araçları

Beş doğrudan tuval aracı ve altı `openpencil_pipeline_*` aracı, Ajan'ın yönetilen OpenPencil çalışma zamanları üzerinden gerçek bir tuval oluşturmasını, incelemesini, iyileştirmesini, yayımlamasını, değiştirmesini ve okumasını sağlar.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Yetenek Kapılı Yetkiler

Görsel ve belge yetkileri, imzalı ve karmaya bağlı yeteneklerdir. Tarayıcı meta verileri asla rastgele bir ana makine yolunu açığa çıkarmaz ve imzalı önizleme/düzenleyici yetenekleri hiçbir zaman kanonik araç sonucuna veya model bağlamına girmez.

</td>
<td width="50%">

### ⚡ İşlemsel Güvenlik

Tam pipeline belgesi, tüm yerel ve DSH kalite kapılarından geçene kadar özel ve yayımlanmamış bir taslak olarak kalır. Yayın mevcut yolu üzerine yazmaz; iptal veya başarısız toplu işlem boş bir hedef bırakmaz.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 DSH Görünüm ve Hissini Takip Eder

Araç kartı ve yönetilen düzenleyici, düzenleme oturumunu yeniden yüklemeden DSH'nin Çince/İngilizce yerel ayarını ve açık/koyu temasını takip eder.

</td>
<td width="50%">

### 🎯 Tek ve Eksiksiz Bir İş Akışı

"Gereksinim → özel taslak → anlamsal toplu işlemler → birebir PNG inceleme ve düzeltme → kalite kapılarından sonra atomik yayın" — DSH içinde eksiksiz bir döngü.

</td>
</tr>
</table>

## DSH'ye Kurulum

DSH ayrı bir pakettir. Henüz yoksa bir kez kurun:

```sh
npm install -g @deepseek-ai/dsh@latest
```

Ardından eklentiyi bir profile ekleyin ve web uygulamasını başlatın:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@next
dsh web
```

Yerel geliştirme için bu checkout'u derleyin, mutlak yolunu Web profiline bağlayın ve ardından DSH'yi tamamen yeniden başlatın:

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

`link:` bağımlılığı sonraki derlemeleri bu checkout'tan görünür kılar. Ancak sağlanan Web profili varsayılan olarak ana bilgisayar paketlerini sıcak yeniden yüklemediğinden, profil bağımlılığı değiştirildikten sonra DSH tamamen yeniden başlatılmalıdır.

DSH'yi global kurmak istemiyor musunuz? Aynı iki adımı `pnpm dlx` ile çalıştırın:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@next
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> OpenPencil eklentisi geneldir ve npm belirteci gerektirmez. DSH ön sürümünün kendisi kayıt defteri kimlik doğrulaması gerektiriyorsa, bu kimlik bilgisini çalışma kopyasının dışında kullanıcı düzeyinde veya geçici bir npm yapılandırmasında saklayın. Bu depo bilinçli olarak hiçbir kayıt defteri kimlik bilgisi içermez.

## Tasarım Araçları

| Araç | Ne yapar |
| --- | --- |
| `openpencil_new` | Basit işler için uyumlu hızlı yol: tek bir işlemsel QuickJS `batch_design` betiği çalıştırır, yalnızca hedef yoksa yayımlar ve düzenlenebilir bir sunum döndürür. Üretim tasarımında tam pipeline'ı tercih edin. |
| `openpencil_pipeline_begin` | Çalışma alanına göreli yeni bir `.op` yolu için oturuma ait özel taslak başlatır; hedef dosya yayımlanmamış ve dokunulmamış kalır. |
| `openpencil_pipeline_context` | Yerel dinamik tasarım ajanı prompt'unu ilgili yönergeler, stil kılavuzları, değişkenler/temalar ve UI kit meta verileri veya betik referanslarıyla yükler. |
| `openpencil_pipeline_batch` | Anlamsal QuickJS toplu işlemlerini taslağa seri uygular: önce iskelet, ardından bölümler ve iyileştirmeler. |
| `openpencil_pipeline_inspect` | Yerel kalite veya çözümlenmiş yerleşim incelemesi yapar ya da modelin görsel okuma ile açıp inceleyebileceği birebir PNG oluşturur. |
| `openpencil_pipeline_finish` | Yerel sonlandırma, lint, yerleşim, ekran görüntüsü güncelliği ve DSH kalite kapılarını çalıştırır; ardından `createIfAbsent` ile atomik yayımlar ve düzenlenebilir bir sunum döndürür. |
| `openpencil_pipeline_abort` | Hedef dosyayı oluşturmadan yayımlanmamış taslağı atar. |
| `openpencil_create` | Mevcut canlı bir tuvalde düğümler oluşturmak veya yeniden yapılandırmak için işlemsel bir `batch_design` programı uygular. |
| `openpencil_edit` | Belirli bir düğümü veya kullanıcının seçtiği tek düğümü değiştirir. |
| `openpencil_render` | Değişmez, içeriğe dayalı bir `.op` anlık görüntüsü oluşturur ve etkin sayfadaki her üst düzey kareyi işler — isteğe bağlı `scale` ve `editable`. |
| `openpencil_selection` | Canlı düzenleyici tuvalinde seçilen düğümlerin tamamını okur. |

## Ajan Tasarım İş Akışı

Üretim tasarımında `openpencil_pipeline_begin` → `openpencil_pipeline_context` → yinelenen `openpencil_pipeline_batch` ve `openpencil_pipeline_inspect` çağrıları → `openpencil_pipeline_finish` sırasını kullanın. Taslak daemon'u sahibi olan DSH oturumuna özeldir ve istenen çalışma alanı yolu yayın başarıyla tamamlanana kadar mevcut değildir. Ara özel taslak ekran görüntüleri düzenlenebilir yan paneli açığa çıkarmaz; böylece kullanıcı düzenlemeleri Ajan toplu işlemleriyle yarışmaz. Düzenleme yetkisi yalnızca yayından sonra verilir.

Bağlam statik bir şablon değildir: OpenPencil'ın yerel dinamik tasarım ajanı prompt'unu ilgili yönergeler, stil kılavuzları, değişkenler/temalar ve UI kits ile birleştirir. Önce yapısal iskeleti kurun, ardından içeriği ve iyileştirmeleri anlamsal bölüm toplu işlemleriyle ekleyin. Hız için başarılı toplu işlem yalnızca kompakt yerleşim tanılamaları döndürür; tam çözümlenmiş yerleşimi gerektiğinde `openpencil_pipeline_inspect` ile isteyin. En azından imza/başlık oluşturulduktan sonra ve ana görev ya da form ile CTA tamamlandıktan sonra `openpencil_pipeline_inspect` aracını `kind: "screenshot"` ile çağırın. Her dönüm noktasında model birebir PNG'yi görsel okuma ile açar, görünen kırpma, taşma, hiyerarşi, aralık, oran, kontrast ve metin okunabilirliği sorunlarını düzeltir ve gerektiğinde tekrarlar; görsel inceleme otomatik gerçekleşmez.

Bitirme, OpenPencil'ın yerel sonlandırma, lint ve yerleşim kontrolleriyle DSH kalite kapısını çalıştırır. Bu belirlenimci kontroller zevk veya görsel cila yaratmaz. Sonlandırmadan sonra ayrı ve yeni bir birebir ekran görüntüsü alın ve modele görsel olarak inceletin; ara dönüm noktası ekran görüntüleri sonlandırma sonrası güncellik kapısını hiçbir zaman karşılayamaz. Ancak bundan sonraki finish çağrısı hedefi `createIfAbsent` ile atomik olarak oluşturur. Kapı başarısız olursa veya `openpencil_pipeline_abort` çağrılırsa hedef yok kalır. Yayımlanan her üretim sonucu, birebir final PNG önizlemesini ve belge kapsamlı düzenleme yetkisini birlikte taşıyan tek bir presentation'dır; yan paneli yalnızca boşken otomatik açar, başka oturumun düzenleyicisini değiştirmez ve açık geçiş için **Tuvali düzenle** eylemini her zaman korur. PTC/Code Mode üzerinden iç içe dönen `openpencil_pipeline_finish` sonucu da aynı presentation'ı korur ve asla sıradan JSON'a ya da salt okunur karta indirgenmez. Geçmiş veya hydrate edilmiş kartlar otomatik açılmaz.

Aynı çalışan DSH hizmeti içinde tarayıcı değiştirme veya yeniden yükleme sonrasında, `openpencil_new` ya da `openpencil_pipeline_finish` kaynaklı, sıkı biçimde ayrıştırılmış kalıcı yayın birebir PNG ve açık **Tuvali düzenle** eylemiyle geri yüklenebilir. Geçmiş kart yan paneli asla otomatik açmaz; kullanıcı bu eyleme tıklamalıdır. Sıradan geçmiş `openpencil_render` salt okunur kalır ve loopback olmayan bağlantılara hiçbir zaman düzenleyici yetkisi verilmez.

Paketle gelen `openpencil-design` skill'i betik ve kalite kılavuzu olmaya devam eder; yönetilen çalışma zamanı masaüstü ikili dosyasına bağlı değildir. `openpencil_new` uyumlu tek toplu işlem hızlı yolu olarak kalır, ancak üretim kalitesinde üretim tam pipeline'ı tercih etmelidir.

`openpencil_create` ve `openpencil_edit`'i yalnızca mevcut canlı bir tuval için kullanın. Düzenlemeleri, düzenleyicinin Kaydet eylemine kadar kaydedilmemiş halde kalır.

## Web Görüntüleyici Varlıkları

DSH bir istemci eklentisi için yalnızca `client.js` sunar; bu nedenle OpenPencil ESM SDK'sı, WASM'ı ve CanvasKit, açıkça aynı kaynaklı varlıklar olarak hazırlanır:

```sh
pnpm run sync:viewer-assets
```

Senkronizasyon komutu kardeş bir `../openpencil` çalışma kopyasını tercih eder (yerel geliştirme), gerekirse depoya gömülü `vendor/openpencil` alt modülüne geri döner (CI ve yeni klonlar). `OPENPENCIL_ROOT` veya `--openpencil-root` ile geçersiz kılabilirsiniz. Eksiksiz, önceden derlenmiş bir varlık dizini `DSH_OPENPENCIL_VIEWER_SOURCE` ile seçilebilir. Çalışma zamanı araması `DSH_OPENPENCIL_VIEWER_ASSET_DIR` ile geçersiz kılınabilir.

Görüntüleyici varlıkları yalnızca kullanıcı tuvale açtıktan sonra tembel olarak yüklenir. Yoksa veya geçersizse PNG önizlemesi kullanılabilir kalır ve hiçbir tuval düğmesi tanıtılmaz.

## Yönetilen Düzenleyici

Düzenlenebilir oturumlar, `op-vscode` tarafından kullanılan mimariyle aynı olan OpenPencil'in yönetilen web ana bilgisayarını kullanır. Eklenti ana bilgisayarı yalnızca yetkili bir kullanıcı eyleminin ardından başlatır, arka plan süreci belirtecini bellekte tutar, iframe kaynağını ve kaynağını doğrular ve düzenleyici oturumu sona erdiğinde süreci kapatır. Düzenleyici yüzeyi aşamalı olarak seçilir: ana bilgisayar bu arayüzü bildirdiğinde yerel Araç ayrıntıları, aksi takdirde yeniden boyutlandırma ve tam ekran kontrolleriyle eklentinin sağ taraftaki çalışma alanı.

Başlatma, yavaş bağlamalarda güvenli bir listening handshake kullanır: hazır olma denetimleri yalnızca paketlenmiş ana bilgisayar bağlı adresini bildirdikten sonra başlar. Masaüstü OpenPencil kurulumu gerekmez.

Yayımlanan kurulumlar altı yerel hedefi destekler: `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64` ve `win32-x64`; Linux paketleri glibc gerektirir. Kök paket, işletim sistemi ve CPU'ya göre tam sürümlü `optionalDependencies` aracılığıyla uygun platform paketini seçer (örneğin `@zseven-w/dsh-openpencil-darwin-arm64`). Bu paket, birbiriyle eşleşen `op-host-web-server`, düzenleyici web paketi ve CanvasKit'i tek bir çalışma zamanı olarak sunar. Bu nedenle yönetilen düzenleyici `/Applications/OpenPencil.app` uygulamasına, `PATH` üzerindeki `openpencil-desktop` dosyasına veya bir OpenPencil kaynak checkout'una bağlı değildir.

Tuval kirliyken DSH eklentiyi yeniden yükler veya kaldırırsa, ana bilgisayar en fazla yedi gün boyunca opak bir yerel kurtarma taslağı tutar. Aynı kaynağı yeniden açmak, onu canlı tuvale geri yüklemeden önce sorar; kurtarma, kullanıcı açıkça kaydedene kadar `.op` dosyasını asla üzerine yazmaz.

Altı platformun resmi paketleri, korumalı release derlemesi sırasında Çin ve Global iş birliği bootstrap uç noktalarıyla enjekte edilir; enjekte edilen değerler yayımdan önce doğrulanır. Bu enjeksiyon olmadan yerelde oluşturulan bir derleme, DSH başlatılmadan önce bootstrap değerini `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap` ile geçersiz kılabilir. Değer `https` kullanmalı ve yol tam olarak `/api/v1/collaboration/bootstrap` olmalıdır.

Cihazlar arası tuval eşitlemesi için hem PC/DSH yerel çalışma zamanı hem de mobil uygulama, güncel iş birliği kuyruğu düzeltmesini içeren aynı OpenPencil sürüm hattına güncellenmelidir. Eski bir mobil uygulama yeni bir PC çalışma zamanıyla birlikte kullanıldığında uzak imleçler görünse bile tuval commit'leri alınamayabilir.

Bu depodan geliştirme yaparken DSH'yi başlatmadan önce sırasıyla düzenleyici Web bundle'ını ve yerel ana bilgisayarı derleyin, ardından birbiriyle eşleşen çalışma zamanını hazırlayın.

`pnpm run build:editor-web`, OpenPencil'ın resmi olarak desteklediği WASM bundle gate'ini çalıştırır. Bash, `wasm32-unknown-unknown` target'ı bulunan Cargo/Rust, `wasm-bindgen` CLI, Binaryen `wasm-opt`, Node.js ve `gzip` gerekir; CanvasKit için EMSDK gerekmez. Web derlemesi iş birliği bootstrap derleme değişkenlerini kullanmaz. `pnpm run build:editor-runtime` öncesinde hem `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` hem de `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL` ayarlanmalıdır. Bunlar yalnızca yerel Cargo derlemesinde kullanılır ve değişkenlerden biri eksikse derleme fail closed biçiminde durur. Her iki derleme de başarıyla tamamlandıktan sonra son komutla çalışma zamanını hazırlayın.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

Açık çalışma zamanı geçersiz kılmaları yalnızca eksiksiz ve birbiriyle eşleşen bir küme olarak kabul edilir:

- `op-host-web-server` için `DSH_OPENPENCIL_EDITOR_BINARY`;
- derlenmiş düzenleyici web paketi için `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR`;
- CanvasKit varlıkları için `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR`.

Kümenin yalnızca bir bölümünü sağlamak geçersiz bir yapılandırmadır; eklenti özel yolları paketlenmiş çalışma zamanı varlıklarıyla birleştirmez.

Kaydetmeler iyimser bir kaynak karması, atomik bir değiştirme ve bir ardıl yetenek kullanır. Kaynak düzenleyicinin dışında değişirse eklenti, üzerine yazmak yerine bir çakışma bildirir.

## Sonuç Meta Verileri

Model tarafından görülebilen sonuç, düz JSON olarak kalır. Yalnızca tarayıcıya özel `presentationMeta.$dshOpenPencil` şunlar için ek yetkiler taşır:

- `image`: PNG yolu, önizleme/indirme URL'leri ve gerçek genişlik/yükseklik;
- `frames`: etkin sayfa sırasına göre birebir işlenmiş her üst düzey kare; düğüm kimliği/adı/dizini ve imzalı PNG URL'leri dahil;
- `document`: kaynak eylem yolu artı değişmez anlık görüntü URL'si, bayt sayısı ve SHA-256;
- `viewer`: varlık yolu bağlandığında sürümlenmiş SDK/WASM/CanvasKit URL'leri;
- `editor`: `editable: true` yetkilendirildiğinde kapsamlı başlatma/yenileme yetenekleri.

Sonuç ayrıca `renderer`, `rendererBinary`, `fidelity` ve varsa uyarıları kaydeder. Yalnızca PNG içeren mevcut schema-v1 iletileri işlenebilir kalır.

DSH `0.1.1-rc.2`, PTC/Kod Modu altında iç içe yer alan araçların tarayıcı sunum meta verilerini kalıcı hale getirmez. Eklenti bu yalnızca UI'ya özgü yansımayı aynı kaynaklı, oturuma bağlı bir uç nokta aracılığıyla kurtarır: tarayıcı yalnızca oturum kimliğini, çağrı kimliğini ve değişmez belge SHA-256'sını gönderir; ana bilgisayar ise otoriter sonucu kalıcı DSH oturum günlüğünden çözer ve yalnızca yakın tarihli canlı düzenlemeyi yetkilendirmek için kısa ömürlü, süreç içi bir işaret kullanır. İmzalı önizleme/düzenleyici yetenekleri hiçbir zaman kanonik araç sonucuna veya model bağlamına girmez. Sıradan `openpencil_render` kalıcı geçmişi salt okunur kalır. `openpencil_new` veya `openpencil_pipeline_finish` kaynaklı, sıkı biçimde ayrıştırılmış kalıcı yayın yalnızca loopback üzerinden ve kullanıcının açık tıklamasından sonra düzenleyici yetkisi alabilir; yan panelin otomatik açılması yakın tarihli, güvenilen canlı sonuçlarla sınırlıdır.

Sınırlı oynatım için iç içe meta veri kurtarması en fazla 128 üst düzey kare kabul eder; daha büyük Kod Modu sonuçları, kanonik JSON yedeği aracılığıyla kullanılabilir kalır.

## Güncel Sınırlamalar

- Mevcut bir tuvale yapılan sonraki düzenlemeler, önceden açılmış bir yönetilen düzenleyici gerektirir. Değişiklikler, kullanıcı Kaydet eylemini çağırana kadar kaydedilmemiş kalır.
- Hafif Web SDK tuvali salt okunurdur; tam düzenleme ayrı yönetilen düzenleyici yüzeyini kullanır. DSH `0.1.1-rc.2` üzerinde eklenti, tam ekran seçeneğiyle yeniden boyutlandırılabilir sağ çalışma alanını kullanır.
- Birebir galeri, etkin sayfadaki üst düzey kareleri kapsar; etkin olmayan sayfaları ve iç içe düğümleri incelemenin yolu etkileşimli tuval olarak kalır.
- İşleme ve anlık görüntü önbellekleri hâlâ ürün düzeyinde bir saklama ilkesi gerektirir.

## Proje Yapısı

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

## Derleme ve Doğrulama

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host /absolute/path/to/design.op 375 1091
```

Derlemeler Node 24.11 veya daha yenisini ve pnpm gerektirir. DSH ana bilgisayar/istemci paketleri, hedef DSH profili tarafından sağlanan eş bağımlılıklardır. Derleme araçları yerel geliştirme bağımlılıklarından, etkin bağlantılı DSH çalışma kopyasından veya kurulu bir DSH kaynak paketinden çözümlenir; `DSH_SOURCE_ROOT` bir kaynak çalışma kopyasını açıkça seçebilir. Kilit dosyası, bu ortam ayrı olarak sağlandığında bağımsız genel derleme araçlarını sabitler.

Özel bir DSH ön sürümü için verilen npm kimlik bilgisini bu deponun dışında tutun (örneğin kullanıcı düzeyinde veya geçici bir `.npmrc` içinde) ve istenen sürümü doğrudan çalıştırın:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

`.npmrc`, `NPM_TOKEN` veya kopyalanmış kayıt defteri kimlik bilgilerini asla işlemeyin. Bu depo varsayılan olarak yerel npm yapılandırmasını yok sayar.

`test:host` gerçek bir birebir işleme gerçekleştirir, PNG IHDR geometrisini ve SHA-256'yı doğrular, HTTP üzerinden değişmez görsel/belge yeteneklerini sınar ve görüntüleyici varlıklarının yetki verilebilir olduğunu kontrol eder. Beklenen boyutlar fikstüre özgüdür.

## Ekosistem

DSH OpenPencil, **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — dünyanın ilk açık kaynaklı, yapay zekâ yerli vektör tasarım aracı — için DeepSeek Harness eklentisidir ve saf Rust, yapay zekâ yerli araçlardan oluşan **[ZSeven-W](https://github.com/ZSeven-W)** ailesinin bir parçasıdır.

| Proje | Nedir |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | Bu eklentinin yönlendirdiği tasarım aracı — komuttan tuvale üretim, eşzamanlı ajan ekipleri, kod olarak tasarım `.op` dosyaları ve yerleşik bir MCP sunucusu. Buradaki birebir önizlemeler, etkileşimli tuval ve yönetilen düzenleyici, OpenPencil'in kendisi tarafından desteklenir. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | LLM ajanlarını dağıtmak için saf Rust eşzamansız çalışma zamanı — çok sağlayıcılı, uçtan uca araç yetenekli, yapılandırılmış izinler, gerçek MCP, sıfır `unsafe`. OpenPencil'in yerleşik ajan çalışma zamanını destekler. |
| **[jian](https://github.com/ZSeven-W/jian)** | Saf Rust, GPU-Skia UI çerçevesi — tek bir yığında pencere öğeleri, yerleşim, olaylar ve anında yeniden yükleme. OpenPencil'in UI çerçevesi ve bu eklentinin yedek işleyicisinin kaynağı. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Terminaliniz için açık kaynaklı, yapay zekâ yerli kodlama asistanı — kodunuzu okur, komutları çalıştırır ve OpenPencil'ı MCP üzerinden yönlendirir. |
| **[noema](https://github.com/ZSeven-W/noema)** | Kodlama ajanları için yerel öncelikli, vektör tabanlı olmayan bellek sistemi — incelenebilir dosyalar olarak kalıcı bellek, çalışma zamanları arasında çalışır. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | Yapay zekâ ajanlarına `op` ile nasıl tasarım yapılacağını öğreten LLM beceri eklentisi — bu DSH eklentisinin bir eşlikçisi. |

Diğer DSH eklentileri:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — sohbetin içinde canlı bir Android emülatörü ya da USB cihazı — tamamen adb üzerinden sürülür
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — Claude Code / Codex üzerinden DSH ajanlarına iş dağıtın
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — sohbetin içinde canlı bir iOS simülatörü — ve USB'ye bağlı bir iPhone
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — DSH için uzun süreli bellek

## Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Fork edip kopyalayın, bir dal oluşturun, `pnpm run build` ve test paketlerini çalıştırın, [Conventional Commits](https://www.conventionalcommits.org/) ile işleyin ve `main` dalına bir PR açın.

## Topluluk

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Discord'umuza Katılın</strong>
</a>
— Sorular sorun, tasarımlarınızı paylaşın, özellikler önerin.

**Tanınan topluluk: [LINUX DO](https://linux.do/)**

## Lisans

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Üçüncü taraf bileşenler [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) içinde listelenmiştir.
