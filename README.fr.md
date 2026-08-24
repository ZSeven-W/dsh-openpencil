<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>Le plugin DeepSeek Harness pour OpenPencil — prévisualisez, inspectez et modifiez de véritables documents <code>.op</code> directement dans une conversation.</strong><br />
  <sub>Aperçus multi-images exacts &bull; Canevas interactif &bull; Éditeur géré &bull; Outils de conception natifs pour agents</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Version actuelle du plugin : <code>0.1.0-rc.4</code> · Testé jusqu'à DSH <code>0.1.1-rc.2</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md"><b>Français</b></a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — aperçu multi-images et éditeur latéral" width="100%" />
</p>
<p align="center"><sub>Aperçus <code>.op</code> multi-images exacts avec un canevas interactif et l'espace de travail de l'éditeur géré</sub></p>

## Pourquoi DSH OpenPencil

DSH OpenPencil connecte [DeepSeek Harness](https://github.com/deepseek-ai/DSH) à [OpenPencil](https://github.com/ZSeven-W/openpencil) afin qu'un agent pilote un véritable canevas de conception modifiable et interactif, au lieu de renvoyer une image générée.

<table>
<tr>
<td width="50%">

### 🖼️ Aperçus multi-images exacts

L'exportateur sans interface d'OpenPencil installé produit des aperçus fidèles à la conception : la première image de premier niveau en grand PNG sûr pour la relecture, plus une piste de vignettes défilant horizontalement, la sélection au clic et la navigation précédent/suivant pour les documents multi-images.

</td>
<td width="50%">

### 🗺️ Canevas interactif

« Ouvrir le canevas interactif » monte paresseusement le SDK web en lecture seule d'OpenPencil avec déplacement, zoom et ajustement — inspectez n'importe quelle page, nœud imbriqué ou page inactive sans quitter la conversation.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Éditeur géré

Avec `editable: true`, l'action d'édition ouvre l'éditeur géré d'OpenPencil — sélection, calques, propriétés, outils de dessin, annuler/rétablir et sémantique d'enregistrement explicite — dans un espace de travail latéral droit redimensionnable, avec une option plein écran.

</td>
<td width="50%">

### 🤖 Outils de conception natifs pour agents

Cinq outils — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — permettent à l'agent de créer, modifier et lire un véritable canevas via des programmes transactionnels `batch_design`.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Autorisations contrôlées par capacités

Les autorisations d'image et de document sont des capacités signées, liées à un hachage. Les métadonnées du navigateur n'exposent jamais un chemin d'hôte arbitraire, et les capacités signées d'aperçu/éditeur n'entrent jamais dans le résultat canonique de l'outil ni dans le contexte du modèle.

</td>
<td width="50%">

### ⚡ Sécurité transactionnelle

Un nouveau document n'est publié qu'après la réussite complète du programme `batch_design`. L'outil n'écrase jamais un chemin existant, un lot échoué ne laisse aucun fichier vide derrière lui, et les enregistrements utilisent un hachage optimiste avec remplacement atomique.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Suit l'apparence de DSH

La carte de l'outil et l'éditeur géré suivent la locale chinois/anglais et le thème clair/sombre de DSH sans recharger la session d'édition.

</td>
<td width="50%">

### 🎯 Un flux de travail complet

« Exigence dans la conversation → l'agent modifie le véritable canevas → aperçu en direct et validation de l'interaction → itérez » — une seule boucle, sans allers-retours de captures d'écran.

</td>
</tr>
</table>

## Installation dans DSH

DSH est un paquet distinct. Installez-le une fois si vous ne l'avez pas déjà :

```sh
npm install -g @deepseek-ai/dsh@latest
```

Ajoutez ensuite le plugin à un profil et lancez l'application web :

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Pour le développement local, compilez ce checkout, liez son chemin absolu au profil Web, puis redémarrez complètement DSH :

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

La dépendance `link:` rend les recompilations ultérieures visibles depuis ce checkout. DSH doit toutefois être entièrement redémarré après le remplacement de la dépendance du profil, car le profil Web fourni ne recharge pas à chaud les bundles hôte par défaut.

Vous préférez ne pas installer DSH globalement ? Exécutez les deux mêmes étapes via `pnpm dlx` :

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> Le plugin OpenPencil est public et ne requiert aucun jeton npm. Si la pré-version DSH elle-même requiert une authentification auprès du registre, conservez cet identifiant dans une configuration npm au niveau utilisateur ou temporaire, hors du dépôt. Ce dépôt ne contient délibérément aucun identifiant de registre.

## Outils de conception

| Outil | Rôle |
| --- | --- |
| `openpencil_new` | Crée un tout nouveau `.op` à partir d'un script QuickJS transactionnel `batch_design`, l'enregistre de manière atomique via le système de fichiers isolé de DSH et renvoie dans le même appel une présentation modifiable signée que DSH ouvre automatiquement dans l'éditeur latéral. |
| `openpencil_create` | Applique un programme transactionnel `batch_design` pour générer ou restructurer des nœuds sur un canevas existant. |
| `openpencil_edit` | Modifie un nœud explicite ou le nœud unique sélectionné par l'utilisateur. |
| `openpencil_render` | Crée un instantané `.op` immuable, adressé par contenu, et rend chaque image de premier niveau de la page active — `scale` et `editable` en option. |
| `openpencil_selection` | Lit les nœuds exacts sélectionnés dans le canevas de l'éditeur actif. |

## Flux de conception piloté par l'agent

Pour une demande en langage naturel sans document existant, l'agent doit appeler `openpencil_new` avec un nouveau chemin `.op` relatif à l'espace de travail et le premier programme `batch_design` complet. L'outil exécute ce programme dans un démon OpenPencil géré privé et ne publie le document de référence qu'après la réussite complète du lot. Il n'écrase jamais un chemin existant et un lot échoué ne laisse aucun fichier vide derrière lui. Le même appel renvoie une présentation modifiable signée, puis DSH ouvre automatiquement l'éditeur latéral avec le document de référence. Ce flux ne requiert ni second appel à `openpencil_render`, ni aperçu PNG. Les cartes historiques relues ou hydratées ne s'ouvrent jamais automatiquement.

`openpencil_new` utilise la véritable interface QuickJS `script` de `batch_design` : l'agent construit avec des appels `I`/`K` et des données, tableaux et boucles JavaScript ordinaires, sans écrire manuellement des `operations` de bas niveau. DSH active toujours `postProcess`, puis appelle explicitement `finalize_design` après la création. Cela complète, avant publication, un nettoyage de fin d'exécution équivalent à celui de l'hôte OpenPencil intégré. Le runtime géré est fourni avec le plugin et ne dépend pas du binaire de bureau. Il s'agit du chemin de création actuel ; il n'est pas présenté comme passant par les outils distincts `design_skeleton`, `design_content` ou `design_refine`.

Utilisez `openpencil_create` et `openpencil_edit` uniquement pour un canevas existant. Leurs modifications restent non enregistrées tant que l'action Enregistrer de l'éditeur n'a pas été déclenchée.

## Contrat de rendu

`openpencil_render` accepte un chemin `.op`, une `scale` optionnelle (`0 < scale <= 8`, valeur par défaut `1`) et un `editable` optionnel (`false` par défaut). Laissez `width` et `height` non définis pour le chemin exact d'OpenPencil : ils décrivent une fenêtre d'affichage au runtime, et non des dimensions d'export de conception, et ne sont acceptés que par le moteur de secours Jian, de fidélité inférieure.

La découverte du binaire OpenPencil vérifie, dans l'ordre :

1. `DSH_OPENPENCIL_BINARY` ou `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` sur `PATH`

La découverte du moteur de secours Jian utilise `DSH_OPENPENCIL_JIAN`, une version de release locale connue, puis `PATH`. Si le binaire OpenPencil exact est réellement indisponible, Jian peut produire un rendu de secours `runtime-preview` clairement étiqueté. Les échecs du moteur de rendu exact, les délais d'attente et les PNG invalides ne basculent pas silencieusement en mode de secours.

## Ressources de la visionneuse web

DSH ne sert que `client.js` pour un plugin client ; le SDK ESM d'OpenPencil, son WASM et CanvasKit sont donc préparés comme des ressources explicites de même origine :

```sh
pnpm run sync:viewer-assets
```

La commande de synchronisation privilégie un dépôt voisin `../openpencil` (développement local), en recourant en dernier ressort au sous-module vendored `vendor/openpencil` (CI et nouveaux clones). Remplacez-la avec `OPENPENCIL_ROOT` ou `--openpencil-root`. Un répertoire de ressources précompilées complet peut être sélectionné avec `DSH_OPENPENCIL_VIEWER_SOURCE`. La recherche au runtime peut être remplacée avec `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Les ressources de la visionneuse sont chargées paresseusement uniquement après que l'utilisateur a ouvert le canevas. Si elles sont absentes ou invalides, l'aperçu PNG reste disponible et aucun bouton de canevas n'est proposé.

## Éditeur géré

Les sessions modifiables utilisent l'hôte web géré d'OpenPencil — la même architecture que celle d'`op-vscode`. Le plugin ne démarre l'hôte qu'après une action utilisateur autorisée, conserve le jeton du démon en mémoire, valide la source et l'origine de l'iframe, et ferme le processus lorsque la session d'édition se termine. La surface de l'éditeur est sélectionnée progressivement : les détails natifs de l'outil lorsque l'hôte déclare ce point d'intégration, sinon l'espace de travail latéral droit du plugin, avec des contrôles de redimensionnement et de plein écran.

Le démarrage utilise un listening handshake sûr avec les montages lents : les sondes de disponibilité ne commencent qu'après que l'hôte intégré a annoncé son adresse d'écoute. Aucune installation de bureau d'OpenPencil n'est requise.

Les installations publiées prennent en charge six cibles natives : `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64` et `win32-x64` ; les paquets Linux requièrent glibc. Le paquet racine sélectionne le paquet de plateforme adapté au système d'exploitation et au processeur au moyen d'`optionalDependencies` aux versions exactes (par exemple `@zseven-w/dsh-openpencil-darwin-arm64`). Ce paquet fournit `op-host-web-server`, le bundle web de l'éditeur et CanvasKit sous la forme d'un même runtime cohérent. L'éditeur géré ne dépend donc ni de `/Applications/OpenPencil.app`, ni d'`openpencil-desktop` dans le `PATH`, ni d'un checkout des sources d'OpenPencil. Cette règle concerne les sessions modifiables gérées ; le moteur de rendu PNG exact conserve le contrat distinct de découverte du binaire décrit plus haut.

Si DSH recharge ou décharge le plugin alors que le canevas contient des modifications non enregistrées, l'hôte conserve un brouillon de récupération local opaque pendant sept jours au maximum. Rouvrir la même source demande confirmation avant de la restaurer dans le canevas actif ; la récupération n'écrase jamais le fichier `.op` tant que l'utilisateur n'a pas explicitement enregistré.

Les paquets officiels des six plateformes reçoivent leurs points de terminaison bootstrap de collaboration Chine/Monde pendant le build de release protégé, qui valide les valeurs injectées avant publication. Un build local autonome dépourvu de cette injection peut remplacer le bootstrap avant de démarrer DSH avec `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap` ; la valeur doit utiliser `https` et exactement le chemin `/api/v1/collaboration/bootstrap`.

La synchronisation du canevas entre appareils exige que le runtime natif PC/DSH et l'application mobile soient tous deux mis à jour vers la même ligne de publication OpenPencil contenant le correctif actuel de la file de collaboration. Associer une ancienne application mobile à un runtime PC plus récent peut encore afficher les curseurs distants sans recevoir les commits du canevas.

Pour développer depuis ce dépôt, construisez d'abord le bundle Web de l'éditeur, puis l'hôte natif, et préparez enfin ce runtime cohérent avant de lancer DSH.

`pnpm run build:editor-web` exécute le gate de bundle WASM officiellement pris en charge par OpenPencil. Il nécessite Bash, Cargo/Rust avec la cible `wasm32-unknown-unknown`, la CLI `wasm-bindgen`, `wasm-opt` de Binaryen, Node.js et `gzip` ; CanvasKit ne nécessite pas EMSDK. Le build Web n'utilise pas les variables de build du bootstrap de collaboration. Avant `pnpm run build:editor-runtime`, définissez à la fois `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` et `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL`. Elles sont utilisées uniquement par le build Cargo natif, qui échoue en mode fail closed si l'une manque. Une fois les deux builds réussis, préparez le runtime avec la dernière commande.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

Les remplacements explicites du runtime ne sont acceptés que sous la forme d'un ensemble complet et cohérent :

- `DSH_OPENPENCIL_EDITOR_BINARY` pour `op-host-web-server` ;
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` pour le bundle web compilé de l'éditeur ;
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` pour les ressources CanvasKit.

Ne fournir qu'une partie de cet ensemble constitue une configuration invalide ; le plugin ne mélange pas les chemins personnalisés avec les ressources du runtime fourni dans le paquet.

Les enregistrements utilisent un hachage de source optimiste, un remplacement atomique et une capacité successeur. Si la source change en dehors de l'éditeur, le plugin signale un conflit au lieu de l'écraser.

## Métadonnées de résultat

Le résultat visible par le modèle reste un simple JSON. `presentationMeta.$dshOpenPencil`, réservé au navigateur, porte des autorisations additionnelles pour :

- `image` : chemin PNG, URL d'aperçu/téléchargement, et largeur/hauteur réelles ;
- `frames` : chaque image de premier niveau rendue exactement, dans l'ordre de la page active, avec son identifiant/nom/index de nœud et ses URL PNG signées ;
- `document` : chemin de l'action source plus URL d'instantané immuable, octets et SHA-256 ;
- `viewer` : URL SDK/WASM/CanvasKit versionnées lorsque la route des ressources est rattachée ;
- `editor` : capacités de lancement/actualisation limitées lorsque `editable: true` est autorisé.

Le résultat enregistre également `renderer`, `rendererBinary`, `fidelity` et d'éventuels avertissements. Les messages existants de schéma v1, uniquement PNG, restent rendables.

DSH `0.1.1-rc.2` ne persiste pas les métadonnées de présentation du navigateur pour les outils imbriqués sous PTC/Code Mode. Le plugin récupère cette projection UI-only via un point de terminaison de même origine, lié à la session : le navigateur n'envoie que le session id, le call id et le SHA-256 immuable du document, tandis que l'hôte résout le résultat de référence à partir du journal de session DSH durable et utilise un marqueur éphémère en mémoire uniquement pour autoriser l'édition en direct récente. Les capacités signées d'aperçu/éditeur n'entrent jamais dans le résultat canonique de l'outil ni dans le contexte du modèle. L'historique durable peut restaurer des aperçus en lecture seule ; les autorisations d'éditeur ne sont délivrées que pour des résultats en direct récents et fiables.

Pour une relecture bornée, la récupération des métadonnées imbriquées accepte jusqu'à 128 images de premier niveau ; les résultats Code Mode plus volumineux restent disponibles via leur repli JSON canonique.

## Limites actuelles

- Les modifications ultérieures d'un canevas existant nécessitent un éditeur géré déjà ouvert. Les changements restent non enregistrés jusqu'à ce que l'utilisateur déclenche son action Enregistrer.
- Le canevas léger du SDK web est en lecture seule ; l'édition complète passe par la surface d'éditeur géré distincte. Sur DSH `0.1.1-rc.2`, le plugin utilise l'espace de travail droit redimensionnable avec une option plein écran.
- La galerie exacte couvre les images de premier niveau de la page active ; le canevas interactif reste le moyen d'inspecter les pages inactives et les nœuds imbriqués.
- Les caches de rendu et d'instantanés ont encore besoin d'une politique de conservation au niveau du produit.

## Structure du projet

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

## Compilation et vérification

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

Les compilations nécessitent Node 24.11 ou plus récent et pnpm. Les paquets hôte/client de DSH sont des dépendances de pairs fournies par le profil DSH cible. Les outils de compilation sont résolus à partir des dépendances de développement locales, du dépôt DSH lié actif ou d'un bundle source DSH installé ; `DSH_SOURCE_ROOT` permet de sélectionner explicitement un dépôt source. Le lockfile épingle les outils de compilation publics autonomes lorsque cet environnement est provisionné séparément.

Pour une pré-version DSH privée, conservez l'identifiant npm délivré hors de ce dépôt (par exemple dans un `.npmrc` au niveau utilisateur ou temporaire) et exécutez directement la version demandée :

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

Ne validez jamais `.npmrc`, `NPM_TOKEN` ou des identifiants de registre copiés. Ce dépôt ignore la configuration npm locale par défaut.

`test:host` effectue un véritable rendu exact, valide la géométrie IHDR et le SHA-256 des PNG, exerce les capacités immuables image/document via HTTP et vérifie que les ressources de la visionneuse peuvent être octroyées. Les dimensions attendues sont propres aux fixtures.

## Écosystème

DSH OpenPencil est le plugin DeepSeek Harness pour **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — le premier outil de conception vectorielle open source et natif IA au monde — et fait partie de la famille **[ZSeven-W](https://github.com/ZSeven-W)** d'outils 100 % Rust et natifs IA.

| Projet | Présentation |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | L'outil de conception piloté par ce plugin — génération de canevas à partir d'une invite, équipes d'agents concurrentes, fichiers `.op` au design-as-code et serveur MCP intégré. Les aperçus exacts, le canevas interactif et l'éditeur géré présentés ici sont propulsés par OpenPencil lui-même. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Un runtime asynchrone 100 % Rust pour déployer des agents LLM — multi-fournisseur, capable d'utiliser des outils de bout en bout, permissions structurées, véritable MCP, zéro `unsafe`. Alimente le runtime d'agent intégré d'OpenPencil. |
| **[jian](https://github.com/ZSeven-W/jian)** | Framework d'interface purement Rust sur GPU-Skia — widgets, disposition, événements et rechargement à chaud dans une seule pile. Le framework d'interface d'OpenPencil, et la source du moteur de rendu de secours de ce plugin. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Assistant de codage open source et natif IA pour votre terminal — lit votre code, exécute des commandes et pilote OpenPencil via MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Système de mémoire local-first, non vectoriel, pour les agents de codage — une mémoire durable sous forme de fichiers inspectables, fonctionnant sur tous les runtimes. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | Le plugin de compétence LLM qui apprend aux agents IA à concevoir avec `op` — un compagnon de ce plugin DSH. |

Les autres plugins DSH :

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — un émulateur Android ou un appareil USB, en direct dans la conversation, piloté entièrement via adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — déléguer des tâches aux agents DSH depuis Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — un simulateur iOS — et un iPhone en USB — vivants dans la conversation
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — mémoire à long terme pour DSH

## Contribuer

Les contributions sont les bienvenues ! Forkez et clonez, créez une branche, exécutez `pnpm run build` et les suites de tests, validez avec des [Conventional Commits](https://www.conventionalcommits.org/) et ouvrez une PR vers `main`.

## Communauté

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Rejoignez notre Discord</strong>
</a>
— Posez vos questions, partagez vos créations, proposez des fonctionnalités.

**Communauté reconnue : [LINUX DO](https://linux.do/)**

## Licence

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Les composants tiers sont répertoriés dans [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
