<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>OpenPencil के लिए DeepSeek Harness प्लगइन — बातचीत के अंदर वास्तविक <code>.op</code> दस्तावेज़ों का पूर्वावलोकन, निरीक्षण और संपादन।</strong><br />
  <sub>सटीक मल्टी-फ़्रेम पूर्वावलोकन &bull; इंटरैक्टिव कैनवास &bull; प्रबंधित संपादक &bull; एजेंट-नेटिव डिज़ाइन टूल</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · वर्तमान प्लगइन रिलीज़: <code>0.1.0-rc.2</code> · DSH <code>0.1.1-rc.1</code> के साथ परीक्षित</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md"><b>हिन्दी</b></a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — मल्टी-फ़्रेम पूर्वावलोकन और साइडबार संपादक" width="100%" />
</p>
<p align="center"><sub>इंटरैक्टिव कैनवास और प्रबंधित संपादक वर्कबेंच के साथ सटीक मल्टी-फ़्रेम <code>.op</code> पूर्वावलोकन</sub></p>

## DSH OpenPencil क्यों

DSH OpenPencil [DeepSeek Harness](https://github.com/deepseek-ai/DSH) को [OpenPencil](https://github.com/ZSeven-W/openpencil) से जोड़ता है, ताकि कोई एजेंट जनित छवि लौटाने के बजाय एक वास्तविक, संपादन-योग्य, इंटरैक्टिव डिज़ाइन कैनवास को चलाए।

<table>
<tr>
<td width="50%">

### 🖼️ सटीक मल्टी-फ़्रेम पूर्वावलोकन

इंस्टॉल किया गया OpenPencil हेडलेस एक्सपोर्टर डिज़ाइन-वफ़ादार पूर्वावलोकन प्रस्तुत करता है: पहला टॉप-लेवल फ़्रेम एक बड़ी रीप्ले-सुरक्षित PNG के रूप में, साथ ही क्षैतिज रूप से स्क्रॉल होने वाली थंबनेल पट्टी, क्लिक-टू-सिलेक्ट, और मल्टी-फ़्रेम दस्तावेज़ों के लिए पिछला/अगला नेविगेशन।

</td>
<td width="50%">

### 🗺️ इंटरैक्टिव कैनवास

"इंटरैक्टिव कैनवास खोलें" पैन, ज़ूम और फ़िट के साथ रीड-ओनली OpenPencil Web SDK को आलसी ढंग से माउंट करता है — बातचीत से बाहर निकले बिना किसी भी पेज, नेस्टेड नोड या निष्क्रिय पेज का निरीक्षण करें।

</td>
</tr>
<tr>
<td width="50%">

### ✏️ प्रबंधित संपादक

`editable: true` के साथ, संपादन क्रिया प्रबंधित OpenPencil संपादक खोलती है — चयन, परतें, गुण, ड्रॉइंग टूल, पूर्ववत/पुनः करना, और स्पष्ट सेव सेमैंटिक्स — पूर्ण-स्क्रीन विकल्प के साथ एक आकार-बदलने योग्य दाएँ-हाथ वर्कबेंच में।

</td>
<td width="50%">

### 🤖 एजेंट-नेटिव डिज़ाइन टूल

पाँच टूल — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — एजेंट को ट्रांज़ैक्शनल `batch_design` प्रोग्राम के माध्यम से एक वास्तविक कैनवास बनाने, संशोधित करने और पढ़ने देते हैं।

</td>
</tr>
<tr>
<td width="50%">

### 🔐 क्षमता-गेटेड अनुदान

छवि और दस्तावेज़ अनुदान हस्ताक्षरित, हैश-बद्ध क्षमताएँ हैं। ब्राउज़र मेटाडेटा कभी भी कोई मनमाना होस्ट पथ उजागर नहीं करता, और हस्ताक्षरित पूर्वावलोकन/संपादक क्षमताएँ कभी भी कैनोनिकल टूल परिणाम या मॉडल संदर्भ में प्रवेश नहीं करतीं।

</td>
<td width="50%">

### ⚡ ट्रांज़ैक्शनल सुरक्षा

एक नया दस्तावेज़ तभी प्रकाशित होता है जब पूरा `batch_design` प्रोग्राम सफल हो जाता है। टूल किसी मौजूदा पथ को कभी अधिलेखित नहीं करता, असफल बैच कोई खाली फ़ाइल पीछे नहीं छोड़ता, और सेव परमाणु प्रतिस्थापन के साथ एक आशावादी हैश का उपयोग करते हैं।

</td>
</tr>
<tr>
<td width="50%">

### 🌍 DSH के लुक एंड फील का पालन करता है

टूल कार्ड और प्रबंधित संपादक संपादन सत्र को पुनः लोड किए बिना DSH के चीनी/अंग्रेज़ी लोकेल और लाइट/डार्क थीम का पालन करते हैं।

</td>
<td width="50%">

### 🎯 एक संपूर्ण वर्कफ़्लो

"बातचीत में आवश्यकता → एजेंट वास्तविक कैनवास संपादित करता है → लाइव पूर्वावलोकन और इंटरैक्शन सत्यापन → दोहराते रहें" — एक ही लूप, कोई स्क्रीनशॉट राउंड-ट्रिप नहीं।

</td>
</tr>
</table>

## DSH में इंस्टॉल करें

DSH अलग पैकेज है। अगर पहले से नहीं है तो एक बार इंस्टॉल करें:

```sh
npm install -g @deepseek-ai/dsh@0.1.0-rc.6
```

फिर प्लगइन को किसी प्रोफ़ाइल में जोड़ें और वेब ऐप शुरू करें:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

DSH को ग्लोबली इंस्टॉल नहीं करना चाहते? वही दो चरण `pnpm dlx` से चलाएँ:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
```

> OpenPencil प्लगइन सार्वजनिक है और इसके लिए किसी npm टोकन की आवश्यकता नहीं है। यदि DSH प्री-रिलीज़ को स्वयं रजिस्ट्री प्रमाणीकरण की आवश्यकता होती है, तो उस क्रेडेंशियल को चेकआउट के बाहर उपयोगकर्ता-स्तरीय या अस्थायी npm कॉन्फ़िग में रखें। इस रिपॉज़िटरी में जानबूझकर कोई रजिस्ट्री क्रेडेंशियल नहीं है।

## डिज़ाइन टूल

| टूल | यह क्या करता है |
| --- | --- |
| `openpencil_new` | एक ट्रांज़ैक्शनल `batch_design` प्रोग्राम से बिल्कुल नया `.op` बनाता है, उसे DSH के सैंडबॉक्स्ड फ़ाइलसिस्टम के माध्यम से परमाणु रूप से सेव करता है, और किसी पूर्व-खोले गए संपादक की आवश्यकता नहीं होती। |
| `openpencil_create` | किसी मौजूदा लाइव कैनवास पर नोड उत्पन्न करने या पुनर्संरचना करने के लिए एक ट्रांज़ैक्शनल `batch_design` प्रोग्राम लागू करता है। |
| `openpencil_edit` | एक स्पष्ट नोड या उपयोगकर्ता द्वारा चयनित एकमात्र नोड को संशोधित करता है। |
| `openpencil_render` | एक अपरिवर्तनीय, कंटेंट-एड्रेस्ड `.op` स्नैपशॉट बनाता है और सक्रिय पेज पर हर टॉप-लेवल फ़्रेम प्रस्तुत करता है — वैकल्पिक `scale` और `editable`। |
| `openpencil_selection` | लाइव संपादक कैनवास में चयनित सटीक नोड्स को पढ़ता है। |

## एजेंट डिज़ाइन वर्कफ़्लो

किसी मौजूदा दस्तावेज़ के बिना प्राकृतिक-भाषा अनुरोध के लिए, एजेंट को एक नए वर्कस्पेस-सापेक्ष `.op` पथ और पहले पूर्ण `batch_design` प्रोग्राम के साथ `openpencil_new` को कॉल करना चाहिए। टूल उस प्रोग्राम को एक निजी प्रबंधित OpenPencil डेमन में चलाता है और पूरा बैच सफल होने के बाद ही प्रामाणिक दस्तावेज़ प्रकाशित करता है। यह किसी मौजूदा पथ को कभी अधिलेखित नहीं करता और असफल बैच कोई खाली फ़ाइल पीछे नहीं छोड़ता। एजेंट को फिर लौटाए गए पथ, `editable: true` और `autoOpen: true` के साथ `openpencil_render` को कॉल करके गैलरी प्रस्तुत करनी चाहिए और संपादक को एक बार विस्तारित करना चाहिए। रीप्ले किए गए या शुरू में स्थिर हुए ऐतिहासिक कार्ड कभी स्वतः नहीं खुलते।

`openpencil_create` और `openpencil_edit` का उपयोग केवल किसी मौजूदा लाइव कैनवास के लिए करें। संपादक की सेव क्रिया तक उनके संपादन असेवित रहते हैं।

## रेंडरिंग अनुबंध

`openpencil_render` एक `.op` पथ, एक वैकल्पिक `scale` (`0 < scale <= 8`, डिफ़ॉल्ट `1`), और वैकल्पिक `editable` (डिफ़ॉल्ट रूप से `false`) स्वीकार करता है। सटीक OpenPencil पथ के लिए `width` और `height` को अनसेट छोड़ें: वे डिज़ाइन निर्यात आयामों का नहीं, बल्कि रनटाइम व्यूपोर्ट का वर्णन करते हैं, और केवल निम्न-फ़िडेलिटी Jian फ़ॉलबैक द्वारा स्वीकार किए जाते हैं।

OpenPencil बाइनरी डिस्कवरी इस क्रम में जाँच करती है:

1. `DSH_OPENPENCIL_BINARY` or `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` on `PATH`

Jian फ़ॉलबैक डिस्कवरी `DSH_OPENPENCIL_JIAN`, एक ज्ञात स्थानीय रिलीज़ बिल्ड, फिर `PATH` का उपयोग करती है। यदि सटीक OpenPencil बाइनरी वास्तव में अनुपलब्ध है, तो Jian स्पष्ट रूप से लेबल किया हुआ `runtime-preview` फ़ॉलबैक उत्पन्न कर सकता है। सटीक रेंडरर विफलताएँ, टाइमआउट और अमान्य PNG चुपचाप फ़ॉलबैक नहीं करते।

## वेब व्यूअर एसेट

DSH क्लाइंट प्लगइन के लिए केवल `client.js` परोसता है, इसलिए OpenPencil ESM SDK, उसका WASM और CanvasKit को स्पष्ट समान-मूल (same-origin) एसेट के रूप में स्टेज किया जाता है:

```sh
pnpm run sync:viewer-assets
```

सिंक कमांड एक सहोदर `../openpencil` चेकआउट को प्राथमिकता देता है (स्थानीय विकास), वेंडर किए गए `vendor/openpencil` सबमॉड्यूल (CI और नई क्लोन) पर फ़ॉलबैक करता है। इसे `OPENPENCIL_ROOT` या `--openpencil-root` से ओवरराइड करें। `DSH_OPENPENCIL_VIEWER_SOURCE` से एक संपूर्ण पूर्व-निर्मित एसेट निर्देशिका चुनी जा सकती है। `DSH_OPENPENCIL_VIEWER_ASSET_DIR` से रनटाइम लुकअप को ओवरराइड किया जा सकता है।

व्यूअर एसेट उपयोगकर्ता के कैनवास खोलने के बाद ही आलसी-लोड होती हैं। यदि वे अनुपस्थित या अमान्य हैं, तो PNG पूर्वावलोकन उपलब्ध रहता है और कोई कैनवास बटन विज्ञापित नहीं किया जाता।

## प्रबंधित संपादक

संपादन-योग्य सत्र OpenPencil के प्रबंधित वेब होस्ट का उपयोग करते हैं — वही आर्किटेक्चर जो `op-vscode` द्वारा उपयोग किया जाता है। प्लगइन होस्ट को केवल एक अधिकृत उपयोगकर्ता क्रिया के बाद शुरू करता है, डेमन टोकन को मेमोरी में रखता है, iframe स्रोत और ओरिजिन को मान्य करता है, और संपादक सत्र समाप्त होने पर प्रक्रिया को बंद कर देता है। संपादक सतह चुनिंदा रूप से चुनी जाती है: जब होस्ट उस सीम की घोषणा करता है तो नेटिव Tool विवरण, अन्यथा रीसाइज़ और फ़ुल-स्क्रीन नियंत्रणों के साथ प्लगइन का दाएँ-हाथ वर्कबेंच।

यदि कैनवास गंदा (dirty) होने पर DSH प्लगइन को पुनः लोड या अनलोड करता है, तो होस्ट सात दिनों तक एक अपारदर्शी स्थानीय रिकवरी ड्राफ़्ट रखता है। उसी स्रोत को फिर से खोलने पर उसे लाइव कैनवास में पुनर्स्थापित करने से पहले पूछा जाता है; जब तक उपयोगकर्ता स्पष्ट रूप से सेव नहीं करता, रिकवरी कभी भी `.op` फ़ाइल को अधिलेखित नहीं करती।

बाइनरी और स्रोत डिस्कवरी को इसके साथ ओवरराइड किया जा सकता है:

- `DSH_OPENPENCIL_EDITOR_BINARY` `op-host-web-server` के लिए;
- `DSH_OPENPENCIL_SOURCE_ROOT` (या `OPENPENCIL_SOURCE_ROOT`) वेब बंडल और CanvasKit एसेट के लिए।

सेव एक आशावादी स्रोत हैश, एक परमाणु प्रतिस्थापन और एक उत्तराधिकारी क्षमता का उपयोग करते हैं। यदि स्रोत संपादक के बाहर बदलता है, तो प्लगइन उसे अधिलेखित करने के बजाय संघर्ष की रिपोर्ट करता है।

## परिणाम मेटाडेटा

मॉडल-दृश्यमान परिणाम सादा JSON ही रहता है। केवल-ब्राउज़र `presentationMeta.$dshOpenPencil` इनके लिए अतिरिक्त अनुदान वहन करता है:

- `image`: PNG पथ, पूर्वावलोकन/डाउनलोड URL, और वास्तविक चौड़ाई/ऊँचाई;
- `frames`: सक्रिय-पेज क्रम में हर सटीक-रेंडर किया गया टॉप-लेवल फ़्रेम, जिसमें उसका नोड id/नाम/इंडेक्स और हस्ताक्षरित PNG URL शामिल हैं;
- `document`: स्रोत क्रिया पथ के साथ अपरिवर्तनीय स्नैपशॉट URL, बाइट्स और SHA-256;
- `viewer`: जब एसेट रूट संलग्न हो तो संशोधित-संस्करणित SDK/WASM/CanvasKit URL;
- `editor`: जब `editable: true` अधिकृत हो तो स्कोप्ड लॉन्च/रिफ़्रेश क्षमताएँ।

परिणाम `renderer`, `rendererBinary`, `fidelity` और कोई भी चेतावनी भी दर्ज करता है। मौजूदा केवल-PNG schema-v1 संदेश रेंडर करने योग्य बने रहते हैं।

DSH `0.1.0-rc.6` PTC/Code Mode के अंतर्गत नेस्टेड टूल के लिए ब्राउज़र प्रस्तुति मेटाडेटा को बनाए नहीं रखता। प्लगइन उस केवल-UI प्रक्षेपण को एक समान-मूल, सत्र-बद्ध एंडपॉइंट के माध्यम से पुनर्प्राप्त करता है: ब्राउज़र केवल सत्र id, कॉल id और अपरिवर्तनीय दस्तावेज़ SHA-256 भेजता है, जबकि होस्ट स्थायी DSH सत्र लॉग से प्रामाणिक परिणाम हल करता है और हाल के लाइव संपादन को अधिकृत करने के लिए केवल एक अल्पकालिक इन-प्रोसेस मार्कर का उपयोग करता है। हस्ताक्षरित पूर्वावलोकन/संपादक क्षमताएँ कभी भी कैनोनिकल टूल परिणाम या मॉडल संदर्भ में प्रवेश नहीं करतीं। स्थायी इतिहास रीड-ओनली पूर्वावलोकन बहाल कर सकता है; संपादक अनुदान केवल हाल के, विश्वसनीय लाइव परिणामों के लिए जारी किए जाते हैं।

सीमित रीप्ले के लिए, नेस्टेड मेटाडेटा रिकवरी 128 तक टॉप-लेवल फ़्रेम स्वीकार करती है; बड़े Code Mode परिणाम अपने कैनोनिकल JSON फ़ॉलबैक के माध्यम से उपलब्ध रहते हैं।

## वर्तमान सीमाएँ

- किसी मौजूदा कैनवास पर अनुवर्ती संपादनों के लिए पहले से खुले प्रबंधित संपादक की आवश्यकता होती है। जब तक उपयोगकर्ता उसकी सेव क्रिया नहीं चलाता, परिवर्तन असेवित रहते हैं।
- हल्का Web SDK कैनवास रीड-ओनली है; पूर्ण संपादन अलग प्रबंधित संपादक सतह का उपयोग करता है। DSH `0.1.0-rc.6` पर, प्लगइन फ़ुल-स्क्रीन विकल्प के साथ आकार-बदलने योग्य दाएँ वर्कबेंच का उपयोग करता है।
- सटीक गैलरी सक्रिय पेज पर टॉप-लेवल फ़्रेम को कवर करती है; निष्क्रिय पेजों और नेस्टेड नोड्स के निरीक्षण का तरीका इंटरैक्टिव कैनवास ही रहता है।
- रेंडर और स्नैपशॉट कैश को अभी भी उत्पाद-स्तरीय प्रतिधारण नीति की आवश्यकता है।

## प्रोजेक्ट संरचना

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

## बिल्ड और सत्यापन

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

बिल्ड के लिए Node 24.11 या उससे नया संस्करण और pnpm आवश्यक है। DSH होस्ट/क्लाइंट पैकेज लक्षित DSH प्रोफ़ाइल द्वारा प्रदान की गई पीयर निर्भरताएँ हैं। बिल्ड टूल स्थानीय डेव निर्भरताओं, सक्रिय लिंक किए गए DSH चेकआउट या इंस्टॉल किए गए DSH स्रोत बंडल से हल किए जाते हैं; `DSH_SOURCE_ROOT` स्पष्ट रूप से एक स्रोत चेकआउट चुन सकता है। जब उस वातावरण को अलग से प्रावधानित किया जाता है, तो लॉकफ़ाइल स्टैंडअलोन सार्वजनिक बिल्ड टूलिंग को पिन करती है।

निजी DSH प्री-रिलीज़ के लिए, जारी किया गया npm क्रेडेंशियल इस रिपॉज़िटरी के बाहर रखें (उदाहरण के लिए उपयोगकर्ता-स्तरीय या अस्थायी `.npmrc` में) और अनुरोधित संस्करण सीधे चलाएँ:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
```

`.npmrc`, `NPM_TOKEN` या कॉपी किए गए रजिस्ट्री क्रेडेंशियल कभी कमिट न करें। यह रिपॉज़िटरी डिफ़ॉल्ट रूप से स्थानीय npm कॉन्फ़िगरेशन को अनदेखा करती है।

`test:host` एक वास्तविक सटीक रेंडर करता है, PNG IHDR ज्यामिति और SHA-256 को मान्य करता है, HTTP पर अपरिवर्तनीय छवि/दस्तावेज़ क्षमताओं का परीक्षण करता है, और जाँचता है कि व्यूअर एसेट अनुदेय (grantable) हैं। अपेक्षित आयाम फिक्स्चर-विशिष्ट होते हैं।

## इकोसिस्टम

DSH OpenPencil **[OpenPencil](https://github.com/ZSeven-W/openpencil)** के लिए DeepSeek Harness प्लगइन है — दुनिया का पहला ओपन-सोर्स AI-नेटिव वेक्टर डिज़ाइन टूल — और शुद्ध-Rust, AI-नेटिव टूल के **[ZSeven-W](https://github.com/ZSeven-W)** परिवार का हिस्सा है।

| प्रोजेक्ट | यह क्या है |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | वह डिज़ाइन टूल जिसे यह प्लगइन चलाता है — प्रॉम्प्ट-टू-कैनवास जनरेशन, समवर्ती एजेंट टीमें, डिज़ाइन-एज़-कोड `.op` फ़ाइलें और एक अंतर्निहित MCP सर्वर। यहाँ के सटीक पूर्वावलोकन, इंटरैक्टिव कैनवास और प्रबंधित संपादक OpenPencil द्वारा ही संचालित हैं। |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | LLM एजेंट भेजने के लिए एक शुद्ध-Rust async रनटाइम — मल्टी-प्रोवाइडर, एंड-टू-एंड टूल-सक्षम, संरचित अनुमतियाँ, वास्तविक MCP, शून्य `unsafe`। OpenPencil के अंतर्निहित एजेंट रनटाइम को शक्ति देता है। |
| **[jian](https://github.com/ZSeven-W/jian)** | शुद्ध-Rust, GPU-Skia UI फ्रेमवर्क — एक ही स्टैक में विजेट, लेआउट, इवेंट और हॉट रीलोड। OpenPencil का UI फ्रेमवर्क, और इस प्लगइन के फ़ॉलबैक रेंडरर का स्रोत। |
| **[Zode](https://github.com/ZSeven-W/zode)** | आपके टर्मिनल के लिए ओपन-सोर्स, AI-नेटिव कोडिंग सहायक — आपका कोड पढ़ता है, कमांड चलाता है और MCP के माध्यम से OpenPencil चलाता है। |
| **[noema](https://github.com/ZSeven-W/noema)** | कोडिंग एजेंट के लिए लोकल-फ़र्स्ट, नॉन-वेक्टर मेमोरी सिस्टम — निरीक्षण-योग्य फ़ाइलों के रूप में स्थायी मेमोरी, रनटाइम में काम करती है। |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | LLM स्किल प्लगइन जो AI एजेंटों को `op` के साथ डिज़ाइन करना सिखाता है — इस DSH प्लगइन का साथी। |

DSH के अन्य प्लगइन:

- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — Claude Code / Codex से DSH एजेंट को काम सौंपें
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — बातचीत के भीतर चलता iOS सिम्युलेटर — और USB से जुड़ा iPhone
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — DSH के लिए दीर्घकालिक स्मृति

## योगदान

योगदान का स्वागत है! Fork और clone करें, एक ब्रांच बनाएँ, `pnpm run build` और टेस्ट सुइट चलाएँ, [Conventional Commits](https://www.conventionalcommits.org/) के साथ कमिट करें, और `main` के विरुद्ध एक PR खोलें।

## समुदाय

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> हमारे Discord से जुड़ें</strong>
</a>
— प्रश्न पूछें, डिज़ाइन साझा करें, सुविधाएँ सुझाएँ।

**मान्यता प्राप्त समुदाय: [LINUX DO](https://linux.do/)**

## लाइसेंस

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

तृतीय-पक्ष घटक [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) में सूचीबद्ध हैं।
