<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>Das DeepSeek-Harness-Plugin für OpenPencil – echte <code>.op</code>-Dokumente direkt in einer Unterhaltung anzeigen, untersuchen und bearbeiten.</strong><br />
  <sub>Exakte Multi-Frame-Vorschauen &bull; Interaktive Leinwand &bull; Verwalteter Editor &bull; Agent-native Design-Tools</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Aktuelle Plugin-Version: <code>0.1.0-rc.5</code> · Bis einschließlich DSH <code>0.1.1-rc.2</code> getestet</sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md"><b>Deutsch</b></a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil – Multi-Frame-Vorschau und Seitenleisten-Editor" width="100%" />
</p>
<p align="center"><sub>Exakte Multi-Frame-<code>.op</code>-Vorschauen mit einer interaktiven Leinwand und dem Arbeitsbereich des verwalteten Editors</sub></p>

## Warum DSH OpenPencil

DSH OpenPencil verbindet [DeepSeek Harness](https://github.com/deepseek-ai/DSH) mit [OpenPencil](https://github.com/ZSeven-W/openpencil), sodass ein Agent eine echte, bearbeitbare, interaktive Design-Leinwand steuert, statt ein generiertes Bild zurückzugeben.

<table>
<tr>
<td width="50%">

### 🖼️ Exakte Multi-Frame-Vorschauen

Der installierte Headless-Exporter von OpenPencil rendert designgetreue Vorschauen: den ersten Frame der obersten Ebene als großes, replaysicheres PNG sowie eine horizontal scrollbare Miniaturbildleiste mit Auswählen per Klick und Zurück-/Weiter-Navigation für Dokumente mit mehreren Frames.

</td>
<td width="50%">

### 🗺️ Interaktive Leinwand

„Interaktive Leinwand öffnen“ lädt die schreibgeschützte OpenPencil-Web-SDK bei Bedarf nach und bietet Schwenken, Zoomen und Einpassen – beliebige Seiten, verschachtelte Knoten oder inaktive Seiten lassen sich untersuchen, ohne die Unterhaltung zu verlassen.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Verwalteter Editor

Mit `editable: true` öffnet die Bearbeiten-Aktion den verwalteten OpenPencil-Editor – Auswahl, Ebenen, Eigenschaften, Zeichenwerkzeuge, Rückgängig/Wiederholen und explizite Speichersemantik – in einem in der Größe veränderbaren Arbeitsbereich auf der rechten Seite mit Vollbild-Option.

</td>
<td width="50%">

### 🤖 Agent-native Design-Tools

Fünf direkte Canvas-Tools plus sechs `openpencil_pipeline_*`-Tools ermöglichen es dem Agenten, über verwaltete OpenPencil-Laufzeiten eine echte Leinwand zu erstellen, zu prüfen, zu verfeinern, zu veröffentlichen, zu ändern und zu lesen.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Durch Capabilities geschützte Grants

Bild- und Dokument-Grants sind signierte, an Hashes gebundene Capabilities. Browser-Metadaten legen niemals einen beliebigen Host-Pfad offen, und signierte Vorschau-/Editor-Capabilities gelangen nie in das kanonische Tool-Ergebnis oder den Modellkontext.

</td>
<td width="50%">

### ⚡ Transaktionale Sicherheit

Ein Dokument der vollständigen Pipeline bleibt ein privater, unveröffentlichter Entwurf, bis alle nativen und DSH-Qualitäts-Gates bestanden sind. Die Veröffentlichung überschreibt keinen vorhandenen Pfad; Abbruch oder fehlerhafte Batches hinterlassen kein leeres Ziel.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Übernimmt das Look & Feel von DSH

Die Tool-Karte und der verwaltete Editor übernehmen das Chinesisch-/Englisch-Locale und das Hell-/Dunkel-Design von DSH, ohne die Bearbeitungssitzung neu zu laden.

</td>
<td width="50%">

### 🎯 Ein vollständiger Workflow

„Anforderung → privater Entwurf → semantische Batches → Prüfung und Korrektur exakter PNGs → atomare Veröffentlichung nach Qualitäts-Gates“ – ein vollständiger Ablauf in DSH.

</td>
</tr>
</table>

## Installation in DSH

DSH ist ein eigenes Paket. Installiere es einmalig, falls noch nicht vorhanden:

```sh
npm install -g @deepseek-ai/dsh@latest
```

Füge dann das Plugin einem Profil hinzu und starte die Web-App:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Für die lokale Entwicklung bauen Sie diesen Checkout, verlinken seinen absoluten Pfad mit dem Web-Profil und starten DSH anschließend vollständig neu:

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

Die `link:`-Abhängigkeit macht spätere Neubauten direkt aus diesem Checkout sichtbar. Nach dem Ersetzen der Profilabhängigkeit muss DSH jedoch vollständig neu gestartet werden, da das mitgelieferte Web-Profil Host-Bundles standardmäßig nicht per Hot Reload aktualisiert.

Lieber ohne globale DSH-Installation? Führe dieselben zwei Schritte über `pnpm dlx` aus:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> Das OpenPencil-Plugin ist öffentlich und benötigt kein npm-Token. Wenn die DSH-Prerelease selbst eine Registry-Authentifizierung erfordert, bewahren Sie diese Anmeldedaten in einer npm-Konfiguration auf Benutzer- oder temporärer Ebene außerhalb des Checkouts auf. Dieses Repository enthält bewusst keine Registry-Anmeldedaten.

## Design-Tools

| Tool | Funktion |
| --- | --- |
| `openpencil_new` | Kompatibler Schnellpfad für einfache Aufgaben: führt ein transaktionales QuickJS-`batch_design`-Skript aus, veröffentlicht nur bei noch nicht vorhandenem Ziel und gibt eine bearbeitbare Darstellung zurück. Für produktionsreife Designs ist die vollständige Pipeline vorzuziehen. |
| `openpencil_pipeline_begin` | Startet einen sitzungseigenen privaten Entwurf für einen neuen arbeitsbereichsrelativen `.op`-Pfad; die Zieldatei bleibt unveröffentlicht und unberührt. |
| `openpencil_pipeline_context` | Lädt den nativen dynamischen Design-Agent-Prompt zusammen mit relevanten Richtlinien, Styleguides, Variablen/Themes und UI-Kit-Metadaten oder Skriptreferenzen. |
| `openpencil_pipeline_batch` | Wendet semantische QuickJS-Batches seriell auf den Entwurf an: zuerst das Gerüst, danach Abschnitte und Verfeinerungen. |
| `openpencil_pipeline_inspect` | Führt native Qualitäts- oder aufgelöste Layout-Prüfungen aus oder erzeugt ein exaktes PNG, das das Modell per Bildlesefunktion visuell prüfen kann. |
| `openpencil_pipeline_finish` | Führt native Finalisierung, Lint, Layout, Screenshot-Aktualität und DSH-Qualitäts-Gates aus, veröffentlicht dann atomar mit `createIfAbsent` und gibt eine bearbeitbare Darstellung zurück. |
| `openpencil_pipeline_abort` | Verwirft den unveröffentlichten Entwurf, ohne die Zieldatei anzulegen. |
| `openpencil_create` | Wendet ein transaktionales `batch_design`-Programm an, um Knoten auf einer vorhandenen Live-Leinwand zu erzeugen oder umzustrukturieren. |
| `openpencil_edit` | Modifiziert einen expliziten Knoten oder den einzelnen vom Benutzer ausgewählten Knoten. |
| `openpencil_render` | Erstellt einen unveränderlichen, inhaltsadressierten `.op`-Snapshot und rendert jeden Frame der obersten Ebene auf der aktiven Seite – optional mit `scale` und `editable`. |
| `openpencil_selection` | Liest die exakt auf der Leinwand des Live-Editors ausgewählten Knoten. |

## Agent-Design-Workflow

Für produktionsreife Designs verwenden Sie `openpencil_pipeline_begin` → `openpencil_pipeline_context` → wiederholt `openpencil_pipeline_batch` und `openpencil_pipeline_inspect` → `openpencil_pipeline_finish`. Der Entwurfs-Daemon ist privat für die besitzende DSH-Sitzung; der angeforderte Arbeitsbereichspfad existiert erst nach erfolgreicher Veröffentlichung. Zwischen-Screenshots des privaten Entwurfs legen keine bearbeitbare Seitenleiste offen, damit Benutzeränderungen nicht mit Agent-Batches konkurrieren; Bearbeitbarkeit wird erst nach der Veröffentlichung erteilt.

Der Kontext ist keine statische Vorlage: Er kombiniert den nativen dynamischen Design-Agent-Prompt von OpenPencil mit relevanten Richtlinien, Styleguides, Variablen/Themes und UI-Kits. Erstellen Sie zuerst ein strukturelles Gerüst und ergänzen sowie verfeinern Sie danach semantische Abschnitte. Erfolgreiche Batches geben zugunsten der Geschwindigkeit nur kompakte Layout-Diagnosen zurück; das vollständige aufgelöste Layout wird bei Bedarf über `openpencil_pipeline_inspect` angefordert. Rufen Sie mindestens nach Fertigstellung von Signatur/Überschrift und erneut nach Aufbau der Hauptaufgabe bzw. des Formulars samt CTA `openpencil_pipeline_inspect` mit `kind: "screenshot"` auf. Das Modell öffnet jedes exakte PNG mit der Bildlesefunktion, behebt sichtbaren Beschnitt, Überlauf, Hierarchie, Abstände, Proportionen, Kontrast und Textlesbarkeit und wiederholt den Vorgang nach Bedarf; die visuelle Prüfung geschieht nicht automatisch.

Beim Fertigstellen laufen die native Finalisierung, Lint- und Layout-Prüfung von OpenPencil sowie das DSH-Qualitäts-Gate. Diese deterministischen Prüfungen erzeugen weder Geschmack noch visuelle Ausgereiftheit. Nach der Finalisierung muss ein separater neuer exakter Screenshot aufgenommen und vom Modell visuell geprüft werden; Zwischen-Screenshots der Meilensteine können das Aktualitäts-Gate nach der Finalisierung niemals erfüllen. Erst der anschließende Finish-Aufruf erstellt das Ziel atomar mit `createIfAbsent`. Bei einem fehlgeschlagenen Gate oder `openpencil_pipeline_abort` bleibt das Ziel abwesend. Jedes veröffentlichte Generierungsergebnis ist eine einzige Presentation mit exakter finaler PNG-Vorschau und dokumentgebundener Bearbeitungsberechtigung; sie öffnet die Seitenleiste nur im Leerlauf automatisch, ersetzt nie den Editor einer anderen Sitzung und behält stets **Leinwand bearbeiten** für einen ausdrücklichen Wechsel. Auch ein über PTC/Code Mode verschachteltes Ergebnis von `openpencil_pipeline_finish` bewahrt diese Presentation und fällt nie auf gewöhnliches JSON oder eine schreibgeschützte Karte zurück. Historische oder hydrierte Karten öffnen sich nicht automatisch.

Innerhalb desselben laufenden DSH-Dienstes lässt sich nach einem Browserwechsel oder Neuladen eine strikt geparste dauerhafte Veröffentlichung von `openpencil_new` oder `openpencil_pipeline_finish` als exaktes PNG mit ausdrücklicher Aktion **Leinwand bearbeiten** wiederherstellen. Eine Verlaufskarte öffnet die Seitenleiste nie automatisch; der Benutzer muss diese Aktion anklicken. Ein gewöhnlicher historischer `openpencil_render` bleibt schreibgeschützt, und Nicht-Loopback-Verbindungen erhalten niemals einen Editor-Grant.

Der gebündelte `openpencil-design`-Skill bleibt die Anleitung für Skripting und Qualität; die verwaltete Laufzeit benötigt keine Desktop-Binärdatei. `openpencil_new` bleibt als kompatibler Einzel-Batch-Schnellpfad erhalten, für produktionsreife Generierung sollte jedoch die vollständige Pipeline verwendet werden.

Verwenden Sie `openpencil_create` und `openpencil_edit` nur für eine vorhandene Live-Leinwand. Ihre Änderungen bleiben bis zur Aktion „Speichern“ im Editor ungespeichert.

## Web-Viewer-Assets

DSH liefert für ein Client-Plugin nur `client.js` aus; daher werden die OpenPencil-ESM-SDK, ihr WASM und CanvasKit als explizite Same-Origin-Assets bereitgestellt:

```sh
pnpm run sync:viewer-assets
```

Der Sync-Befehl bevorzugt ein benachbartes `../openpencil`-Checkout (lokale Entwicklung) und greift andernfalls auf das eingebundene `vendor/openpencil`-Submodul zurück (CI und frische Klone). Überschreiben Sie es mit `OPENPENCIL_ROOT` oder `--openpencil-root`. Ein vollständiges vorgefertigtes Asset-Verzeichnis kann mit `DSH_OPENPENCIL_VIEWER_SOURCE` ausgewählt werden. Die Suche zur Laufzeit kann mit `DSH_OPENPENCIL_VIEWER_ASSET_DIR` überschrieben werden.

Viewer-Assets werden erst nachgeladen, nachdem der Benutzer die Leinwand geöffnet hat. Sind sie nicht vorhanden oder ungültig, bleibt die PNG-Vorschau verfügbar und es wird kein Leinwand-Button angezeigt.

## Verwalteter Editor

Bearbeitbare Sitzungen nutzen den verwalteten Web-Host von OpenPencil – dieselbe Architektur wie bei `op-vscode`. Das Plugin startet den Host erst nach einer autorisierten Benutzeraktion, hält das Daemon-Token im Arbeitsspeicher, validiert iframe-Quelle und -Origin und beendet den Prozess, wenn die Editor-Sitzung endet. Die Editor-Oberfläche wird schrittweise ausgewählt: native Tool-Details, wenn der Host diese Schnittstelle deklariert, andernfalls der rechtsseitige Arbeitsbereich des Plugins mit Größenänderung und Vollbild-Steuerung.

Der Start verwendet einen für langsame Mounts sicheren listening handshake: Bereitschaftsprüfungen beginnen erst, nachdem der mitgelieferte Host seine gebundene Adresse gemeldet hat. Eine Desktop-Installation von OpenPencil ist nicht erforderlich.

Veröffentlichte Installationen unterstützen sechs native Ziele: `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64` und `win32-x64`; die Linux-Pakete setzen glibc voraus. Das Root-Paket wählt über exakt versionierte `optionalDependencies` anhand von Betriebssystem und CPU das passende Plattformpaket aus (zum Beispiel `@zseven-w/dsh-openpencil-darwin-arm64`). Dieses Paket stellt `op-host-web-server`, das Web-Bundle des Editors und CanvasKit als eine zusammengehörige Laufzeit bereit. Der verwaltete Editor hängt daher weder von `/Applications/OpenPencil.app` noch von `openpencil-desktop` im `PATH` oder einem OpenPencil-Quell-Checkout ab.

Wenn DSH das Plugin neu lädt oder entlädt, während die Leinwand ungespeicherte Änderungen enthält, bewahrt der Host bis zu sieben Tage lang einen undurchsichtigen lokalen Wiederherstellungsentwurf auf. Beim erneuten Öffnen derselben Quelle wird nachgefragt, bevor sie in die Live-Leinwand wiederhergestellt wird; die Wiederherstellung überschreibt die `.op`-Datei nie, bis der Benutzer explizit speichert.

Die offiziellen Pakete für alle sechs Plattformen erhalten ihre Bootstrap-Endpunkte für die Zusammenarbeit in China und weltweit während des geschützten Release-Builds; die injizierten Endpunkte werden vor der Veröffentlichung validiert. Bei einem lokalen Eigenbau ohne diese Injektion kann der Bootstrap vor dem Start von DSH mit `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap` überschrieben werden. Der Wert muss `https` verwenden und exakt den Pfad `/api/v1/collaboration/bootstrap` besitzen.

Für die geräteübergreifende Leinwandsynchronisierung müssen sowohl die native PC/DSH-Laufzeit als auch die mobile App auf dieselbe OpenPencil-Release-Linie aktualisiert werden, die die aktuelle Korrektur der Kollaborationswarteschlange enthält. Wird eine ältere mobile App mit einer neueren PC-Laufzeit kombiniert, können weiterhin entfernte Cursor sichtbar sein, obwohl keine Leinwand-Commits empfangen werden.

Bei der Entwicklung aus diesem Repository müssen vor dem Start von DSH zuerst das Web-Bundle des Editors und dann der native Host gebaut werden; anschließend wird die zusammengehörige Laufzeit bereitgestellt.

`pnpm run build:editor-web` führt das von OpenPencil unterstützte WASM-Bundle-Gate aus. Erforderlich sind Bash, Cargo/Rust mit dem Target `wasm32-unknown-unknown`, die `wasm-bindgen`-CLI, `wasm-opt` aus Binaryen, Node.js und `gzip`; CanvasKit benötigt kein EMSDK. Der Web-Build verwendet die Build-Variablen für den Collaboration-Bootstrap nicht. Vor `pnpm run build:editor-runtime` müssen sowohl `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` als auch `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL` gesetzt sein. Sie werden ausschließlich vom nativen Cargo-Build verwendet, der beim Fehlen einer Variablen nach dem Fail-closed-Prinzip abbricht. Nach beiden erfolgreichen Builds wird die Laufzeit mit dem letzten Befehl bereitgestellt.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

Explizite Laufzeit-Überschreibungen werden nur als vollständiger, zusammengehöriger Satz akzeptiert:

- `DSH_OPENPENCIL_EDITOR_BINARY` für `op-host-web-server`;
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` für das gebaute Editor-Web-Bundle;
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` für die CanvasKit-Assets.

Nur einen Teil dieses Satzes anzugeben ist ungültig; das Plugin kombiniert keine benutzerdefinierten Pfade mit den Laufzeit-Assets des Pakets.

Speichervorgänge nutzen einen optimistischen Quell-Hash, ein atomares Ersetzen und eine Nachfolger-Capability. Wenn sich die Quelle außerhalb des Editors ändert, meldet das Plugin einen Konflikt, statt sie zu überschreiben.

## Ergebnis-Metadaten

Das für das Modell sichtbare Ergebnis bleibt einfaches JSON. Das nur im Browser verfügbare `presentationMeta.$dshOpenPencil` enthält additive Grants für:

- `image`: PNG-Pfad, Vorschau-/Download-URLs und echte Breite/Höhe;
- `frames`: jeder exakt gerenderte Frame der obersten Ebene in der Reihenfolge der aktiven Seite, einschließlich Knoten-ID/-Name/-Index und signierter PNG-URLs;
- `document`: Quell-Aktionspfad plus unveränderliche Snapshot-URL, Bytes und SHA-256;
- `viewer`: versionierte SDK-/WASM-/CanvasKit-URLs, wenn die Asset-Route angehängt ist;
- `editor`: eingeschränkte Start-/Aktualisierungs-Capabilities, wenn `editable: true` autorisiert ist.

Das Ergebnis erfasst außerdem `renderer`, `rendererBinary`, `fidelity` und etwaige Warnungen. Vorhandene reine PNG-Schema-v1-Nachrichten bleiben renderbar.

DSH `0.1.1-rc.2` speichert Browser-Präsentationsmetadaten für Tools, die unter PTC/Code Mode verschachtelt sind, nicht dauerhaft. Das Plugin stellt diese reine UI-Projektion über einen Same-Origin-, sitzungsgebundenen Endpunkt wieder her: Der Browser sendet nur die Sitzungs-ID, die Call-ID und den unveränderlichen Dokument-SHA-256, während der Host das maßgebliche Ergebnis aus dem dauerhaften DSH-Sitzungsprotokoll auflöst und einen kurzlebigen In-Process-Marker ausschließlich zur Autorisierung aktueller Live-Bearbeitungen verwendet. Signierte Vorschau-/Editor-Capabilities gelangen nie in das kanonische Tool-Ergebnis oder den Modellkontext. Der dauerhafte Verlauf eines gewöhnlichen `openpencil_render` bleibt schreibgeschützt. Eine strikt geparste dauerhafte Veröffentlichung von `openpencil_new` oder `openpencil_pipeline_finish` kann nur über Loopback und nach ausdrücklichem Klick des Benutzers einen Editor-Grant erhalten; das automatische Öffnen der Seitenleiste bleibt aktuellen, vertrauenswürdigen Live-Ergebnissen vorbehalten.

Für eine begrenzte Wiedergabe akzeptiert die verschachtelte Metadaten-Wiederherstellung bis zu 128 Frames der obersten Ebene; größere Code-Mode-Ergebnisse bleiben über ihren kanonischen JSON-Fallback verfügbar.

## Aktuelle Einschränkungen

- Folgeänderungen an einer vorhandenen Leinwand setzen einen bereits geöffneten verwalteten Editor voraus. Änderungen bleiben ungespeichert, bis der Benutzer dessen Aktion „Speichern“ ausführt.
- Die leichtgewichtige Leinwand der Web-SDK ist schreibgeschützt; die vollständige Bearbeitung nutzt die separate Oberfläche des verwalteten Editors. Auf DSH `0.1.1-rc.2` verwendet das Plugin den in der Größe veränderbaren rechten Arbeitsbereich mit Vollbild-Option.
- Die exakte Galerie umfasst Frames der obersten Ebene auf der aktiven Seite; die interaktive Leinwand bleibt der Weg, um inaktive Seiten und verschachtelte Knoten zu untersuchen.
- Render- und Snapshot-Caches benötigen weiterhin eine produktweite Aufbewahrungsrichtlinie.

## Projektstruktur

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

## Build und Verifizieren

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host /absolute/path/to/design.op 375 1091
```

Builds erfordern Node 24.11 oder neuer und pnpm. DSH-Host-/Client-Pakete sind Peer-Abhängigkeiten, die vom Ziel-DSH-Profil bereitgestellt werden. Build-Tools werden aus lokalen Dev-Abhängigkeiten, dem aktiven verlinkten DSH-Checkout oder einem installierten DSH-Quellbundle aufgelöst; mit `DSH_SOURCE_ROOT` kann ein Quell-Checkout explizit ausgewählt werden. Die Lockfile pinnt eigenständige öffentliche Build-Tools, wenn diese Umgebung separat bereitgestellt wird.

Für eine private DSH-Prerelease bewahren Sie die ausgegebene npm-Anmeldeinformation außerhalb dieses Repositorys auf (zum Beispiel in einer `.npmrc` auf Benutzer- oder temporärer Ebene) und führen Sie die angeforderte Version direkt aus:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

Committen Sie niemals `.npmrc`, `NPM_TOKEN` oder kopierte Registry-Anmeldedaten. Dieses Repository ignoriert die lokale npm-Konfiguration standardmäßig.

`test:host` führt einen echten exakten Render durch, validiert PNG-IHDR-Geometrie und SHA-256, testet unveränderliche Bild-/Dokument-Capabilities über HTTP und prüft, ob Viewer-Assets gewährbar sind. Die erwarteten Abmessungen sind fixture-spezifisch.

## Ökosystem

DSH OpenPencil ist das DeepSeek-Harness-Plugin für **[OpenPencil](https://github.com/ZSeven-W/openpencil)** – das weltweit erste quelloffene, AI-native Vektor-Design-Tool – und Teil der **[ZSeven-W](https://github.com/ZSeven-W)**-Familie reiner Rust- und AI-nativer Tools.

| Projekt | Was es ist |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | Das Design-Tool, das dieses Plugin steuert – Prompt-zu-Leinwand-Generierung, parallele Agent-Teams, Design-als-Code-`.op`-Dateien und ein integrierter MCP-Server. Die exakten Vorschauen, die interaktive Leinwand und der verwaltete Editor hier werden von OpenPencil selbst betrieben. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Eine Async-Runtime aus reinem Rust für die Auslieferung von LLM-Agenten – Multi-Provider, durchgängig tool-fähig, strukturierte Berechtigungen, echtes MCP, null `unsafe`. Treibt die integrierte Agent-Runtime von OpenPencil an. |
| **[jian](https://github.com/ZSeven-W/jian)** | Ein UI-Framework aus reinem Rust mit GPU-Skia – Widgets, Layout, Ereignisse und Hot Reload in einem Stack. OpenPencils UI-Framework und die Quelle des Fallback-Renderers dieses Plugins. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Ein quelloffener, AI-nativer Coding-Assistent für Ihr Terminal – liest Ihren Code, führt Befehle aus und steuert OpenPencil über MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Ein Local-first-, nicht-vektorbasiertes Speichersystem für Coding-Agenten – dauerhafter Speicher als einsehbare Dateien, funktioniert über Laufzeiten hinweg. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | Das LLM-Skill-Plugin, das KI-Agenten beibringt, wie sie mit `op` designen – ein Begleiter zu diesem DSH-Plugin. |

Weitere DSH-Plugins:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — ein Live-Android-Emulator oder USB-Gerät in der Konversation, vollständig über adb gesteuert
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — Arbeit aus Claude Code / Codex an DSH-Agenten delegieren
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — ein lebender iOS-Simulator — und ein iPhone per USB — in der Konversation
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — Langzeitgedächtnis für DSH

## Mitwirken

Beiträge sind willkommen! Forken und klonen Sie das Repository, erstellen Sie einen Branch, führen Sie `pnpm run build` und die Test-Suites aus, committen Sie mit [Conventional Commits](https://www.conventionalcommits.org/) und eröffnen Sie einen PR gegen `main`.

## Community

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Treten Sie unserem Discord bei</strong>
</a>
– Stellen Sie Fragen, teilen Sie Designs, schlagen Sie Funktionen vor.

**Anerkannte Community: [LINUX DO](https://linux.do/)**

## Lizenz

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Komponenten von Drittanbietern sind in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) aufgeführt.
