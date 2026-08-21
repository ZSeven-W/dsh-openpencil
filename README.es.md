<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>El plugin de DeepSeek Harness para OpenPencil: previsualiza, inspecciona y edita documentos <code>.op</code> reales dentro de una conversación.</strong><br />
  <sub>Vistas previas multi-marco exactas &bull; Lienzo interactivo &bull; Editor administrado &bull; Herramientas de diseño nativas para agentes</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Versión actual del plugin: <code>0.1.0-rc.2</code> · Probado con DSH <code>0.1.1-rc.1</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md"><b>Español</b></a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
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
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — vista previa multi-marco y editor lateral" width="100%" />
</p>
<p align="center"><sub>Vistas previas <code>.op</code> multi-marco exactas con un lienzo interactivo y el banco de trabajo del editor administrado</sub></p>

## Por qué DSH OpenPencil

DSH OpenPencil conecta [DeepSeek Harness](https://github.com/deepseek-ai/DSH) con [OpenPencil](https://github.com/ZSeven-W/openpencil) para que un agente maneje un lienzo de diseño real, editable e interactivo en lugar de devolver una imagen generada.

<table>
<tr>
<td width="50%">

### 🖼️ Vistas previas multi-marco exactas

El exportador headless de OpenPencil instalado genera vistas previas fieles al diseño: el primer marco de nivel superior como un PNG grande seguro para la reproducción, más una franja de miniaturas con desplazamiento horizontal, clic para seleccionar y navegación anterior/siguiente para documentos multi-marco.

</td>
<td width="50%">

### 🗺️ Lienzo interactivo

«Abrir lienzo interactivo» monta de forma diferida el SDK web de solo lectura de OpenPencil con desplazamiento, zoom y ajuste: inspecciona cualquier página, nodo anidado o página inactiva sin salir de la conversación.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Editor administrado

Con `editable: true`, la acción de edición abre el editor administrado de OpenPencil (selección, capas, propiedades, herramientas de dibujo, deshacer/rehacer y semántica de guardado explícito) en un panel lateral derecho redimensionable con opción de pantalla completa.

</td>
<td width="50%">

### 🤖 Herramientas de diseño nativas para agentes

Cinco herramientas — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — permiten al agente crear, modificar y leer un lienzo real mediante programas transaccionales `batch_design`.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Otorgamientos controlados por capacidades

Los otorgamientos de imagen y documento son capacidades firmadas vinculadas a un hash. Los metadatos del navegador nunca exponen una ruta arbitraria del host, y las capacidades firmadas de vista previa/editor nunca entran en el resultado canónico de la herramienta ni en el contexto del modelo.

</td>
<td width="50%">

### ⚡ Seguridad transaccional

Un documento nuevo solo se publica después de que todo el programa `batch_design` se ejecute correctamente. La herramienta nunca sobrescribe una ruta existente, un lote fallido no deja ningún archivo vacío y los guardados usan un hash optimista con reemplazo atómico.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Sigue la apariencia de DSH

La tarjeta de la herramienta y el editor administrado siguen la configuración regional chino/inglés de DSH y su tema claro/oscuro sin recargar la sesión de edición.

</td>
<td width="50%">

### 🎯 Un flujo de trabajo completo

«Requisito en la conversación → el agente edita el lienzo real → vista previa en vivo y validación de interacción → seguir iterando»: un solo bucle, sin ciclos de ida y vuelta con capturas de pantalla.

</td>
</tr>
</table>

## Instalación en DSH

DSH es un paquete aparte. Instálalo una vez si aún no lo tienes:

```sh
npm install -g @deepseek-ai/dsh@0.1.1-rc.1
```

Luego añade el plugin a un perfil e inicia la app web:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

¿Prefieres no instalar DSH globalmente? Ejecuta los mismos dos pasos con `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

> El plugin de OpenPencil es público y no requiere un token de npm. Si la versión preliminar de DSH en sí requiere autenticación del registro, mantén esa credencial en una configuración de npm a nivel de usuario o temporal, fuera del checkout. Este repositorio no contiene credenciales de registro a propósito.

## Herramientas de diseño

| Herramienta | Qué hace |
| --- | --- |
| `openpencil_new` | Crea un `.op` completamente nuevo a partir de un programa transaccional `batch_design`, lo guarda de forma atómica a través del sistema de archivos aislado de DSH y no requiere un editor abierto previamente. |
| `openpencil_create` | Aplica un programa transaccional `batch_design` para generar o reestructurar nodos en un lienzo en vivo existente. |
| `openpencil_edit` | Modifica un nodo explícito o el único nodo seleccionado por el usuario. |
| `openpencil_render` | Crea una instantánea `.op` inmutable direccionada por contenido y renderiza cada marco de nivel superior de la página activa — con `scale` y `editable` opcionales. |
| `openpencil_selection` | Lee los nodos exactos seleccionados en el lienzo del editor en vivo. |

## Flujo de trabajo de diseño del agente

Para una solicitud en lenguaje natural sin documento existente, el agente debe llamar a `openpencil_new` con una ruta `.op` nueva relativa al workspace y el primer programa `batch_design` completo. La herramienta ejecuta ese programa en un demonio privado y administrado de OpenPencil y publica el documento canónico solo después de que todo el lote se ejecute correctamente. Nunca sobrescribe una ruta existente y un lote fallido no deja ningún archivo vacío. Después, el agente debe llamar a `openpencil_render` con la ruta devuelta, `editable: true` y `autoOpen: true` para presentar la galería y expandir el editor una sola vez. Las tarjetas históricas reproducidas o ya resueltas inicialmente nunca se abren automáticamente.

Usa `openpencil_create` y `openpencil_edit` solo para un lienzo en vivo existente. Sus ediciones permanecen sin guardar hasta la acción de guardado del editor.

## Contrato de renderizado

`openpencil_render` acepta una ruta `.op`, una `scale` opcional (`0 < scale <= 8`, por defecto `1`) y un `editable` opcional (`false` por defecto). Deja `width` y `height` sin establecer para la ruta exacta de OpenPencil: describen un viewport en tiempo de ejecución, no las dimensiones de exportación de diseño, y solo las acepta el fallback Jian de menor fidelidad.

La detección del binario de OpenPencil verifica, en este orden:

1. `DSH_OPENPENCIL_BINARY` o `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` en `PATH`

La detección del fallback Jian usa `DSH_OPENPENCIL_JIAN`, una compilación de lanzamiento local conocida, y luego `PATH`. Si el binario exacto de OpenPencil no está realmente disponible, Jian puede producir un fallback `runtime-preview` claramente etiquetado. Los fallos del renderizador exacto, los tiempos de espera y los PNG no válidos no recurren silenciosamente al fallback.

## Recursos del visor web

DSH solo sirve `client.js` para un plugin de cliente, por lo que el SDK ESM de OpenPencil, su WASM y CanvasKit se preparan como recursos explícitos del mismo origen:

```sh
pnpm run sync:viewer-assets
```

El comando de sincronización prefiere un checkout hermano `../openpencil` (desarrollo local), recurriendo al submódulo vendored `vendor/openpencil` (CI y clones nuevos). Puedes anularlo con `OPENPENCIL_ROOT` o `--openpencil-root`. Se puede seleccionar un directorio de recursos precompilado completo con `DSH_OPENPENCIL_VIEWER_SOURCE`. La búsqueda en tiempo de ejecución se puede anular con `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Los recursos del visor se cargan de forma diferida solo después de que el usuario abre el lienzo. Si faltan o no son válidos, la vista previa PNG sigue disponible y no se anuncia ningún botón de lienzo.

## Editor administrado

Las sesiones editables usan el host web administrado de OpenPencil, la misma arquitectura que usa `op-vscode`. El plugin inicia el host solo después de una acción de usuario autorizada, mantiene el token del demonio en memoria, valida la fuente y el origen del iframe y cierra el proceso cuando termina la sesión del editor. La superficie del editor se selecciona de forma progresiva: los detalles nativos de la herramienta cuando el host declara esa costura; de lo contrario, el panel lateral derecho del plugin con controles de redimensionamiento y pantalla completa.

Si DSH recarga o descarga el plugin mientras el lienzo tiene cambios sin guardar, el host conserva un borrador local de recuperación opaco durante un máximo de siete días. Al reabrir la misma fuente, se pregunta antes de restaurarla en el lienzo en vivo; la recuperación nunca sobrescribe el archivo `.op` hasta que el usuario guarda explícitamente.

La detección de binarios y fuentes se puede anular con:

- `DSH_OPENPENCIL_EDITOR_BINARY` para `op-host-web-server`;
- `DSH_OPENPENCIL_SOURCE_ROOT` (o `OPENPENCIL_SOURCE_ROOT`) para el bundle web y los recursos de CanvasKit.

Los guardados usan un hash optimista de la fuente, un reemplazo atómico y una capacidad sucesora. Si la fuente cambia fuera del editor, el plugin informa de un conflicto en lugar de sobrescribirla.

## Metadatos del resultado

El resultado visible para el modelo sigue siendo JSON simple. El `presentationMeta.$dshOpenPencil`, solo de navegador, transporta otorgamientos aditivos para:

- `image`: ruta del PNG, URLs de vista previa/descarga y ancho/alto reales;
- `frames`: cada marco de nivel superior renderizado con exactitud, en el orden de la página activa, incluidos su id/nombre/índice de nodo y las URLs firmadas de los PNG;
- `document`: ruta de la acción de origen más la URL de la instantánea inmutable, los bytes y el SHA-256;
- `viewer`: URLs de SDK/WASM/CanvasKit con revisión cuando la ruta de recursos está conectada;
- `editor`: capacidades de lanzamiento/actualización acotadas cuando se autoriza `editable: true`.

El resultado también registra `renderer`, `rendererBinary`, `fidelity` y cualquier advertencia. Los mensajes existentes de esquema v1 de solo PNG siguen siendo renderizables.

DSH `0.1.1-rc.1` no persiste los metadatos de presentación del navegador para las herramientas anidadas bajo PTC/Code Mode. El plugin recupera esa proyección UI-only a través de un endpoint del mismo origen vinculado a la sesión: el navegador envía únicamente el session id, el call id y el SHA-256 inmutable del documento, mientras que el host resuelve el resultado canónico a partir del registro de sesión duradero de DSH y usa un marcador breve en proceso solo para autorizar la edición en vivo reciente. Las capacidades firmadas de vista previa/editor nunca entran en el resultado canónico de la herramienta ni en el contexto del modelo. El historial duradero puede restaurar vistas previas de solo lectura; los otorgamientos de editor solo se emiten para resultados en vivo recientes y de confianza.

Para una reproducción acotada, la recuperación de metadatos anidados acepta hasta 128 marcos de nivel superior; los resultados mayores del modo Código siguen disponibles mediante su fallback JSON canónico.

## Limitaciones actuales

- Las ediciones posteriores de un lienzo existente requieren un editor administrado ya abierto. Los cambios permanecen sin guardar hasta que el usuario invoca su acción de guardado.
- El lienzo ligero del SDK web es de solo lectura; la edición completa usa la superficie separada del editor administrado. En DSH `0.1.1-rc.1`, el plugin usa el panel lateral derecho redimensionable con opción de pantalla completa.
- La galería exacta cubre los marcos de nivel superior de la página activa; el lienzo interactivo sigue siendo la forma de inspeccionar páginas inactivas y nodos anidados.
- Las cachés de renderizado e instantáneas aún necesitan una política de retención a nivel de producto.

## Estructura del proyecto

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

## Compilación y verificación

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

Las compilaciones requieren Node 24.11 o superior y pnpm. Los paquetes de host/cliente de DSH son dependencias pares proporcionadas por el perfil DSH de destino. Las herramientas de compilación se resuelven desde las dependencias de desarrollo locales, el checkout de DSH vinculado activo o un bundle de código fuente de DSH instalado; `DSH_SOURCE_ROOT` puede seleccionar un checkout de código fuente explícitamente. El lockfile fija las herramientas de compilación públicas independientes cuando ese entorno se aprovisiona por separado.

Para una versión preliminar privada de DSH, mantén la credencial npm emitida fuera de este repositorio (por ejemplo, en un `.npmrc` a nivel de usuario o temporal) y ejecuta directamente la versión solicitada:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.1-rc.1 dsh web
```

Nunca hagas commit de `.npmrc`, `NPM_TOKEN` ni credenciales de registro copiadas. Este repositorio ignora la configuración local de npm por defecto.

`test:host` realiza un renderizado exacto real, valida la geometría IHDR del PNG y el SHA-256, ejercita las capacidades inmutables de imagen/documento a través de HTTP y comprueba que los recursos del visor se pueden otorgar. Las dimensiones esperadas son específicas de cada fixture.

## Ecosistema

DSH OpenPencil es el plugin de DeepSeek Harness para **[OpenPencil](https://github.com/ZSeven-W/openpencil)**, la primera herramienta de diseño vectorial nativa de IA de código abierto del mundo, y forma parte de la familia **[ZSeven-W](https://github.com/ZSeven-W)** de herramientas nativas de IA en Rust puro.

| Proyecto | Qué es |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | La herramienta de diseño que impulsa este plugin: generación de prompt a lienzo, equipos de agentes concurrentes, archivos `.op` de diseño como código y un servidor MCP integrado. Las vistas previas exactas, el lienzo interactivo y el editor administrado de aquí están impulsados por el propio OpenPencil. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Un runtime asíncrono en Rust puro para distribuir agentes de LLM: multiproveedor, con capacidad de herramientas de extremo a extremo, permisos estructurados, MCP real y cero `unsafe`. Impulsa el runtime de agente integrado de OpenPencil. |
| **[jian](https://github.com/ZSeven-W/jian)** | Marco de trabajo de UI en Rust puro y GPU-Skia: widgets, diseño, eventos y recarga en caliente en una sola pila. El marco de trabajo de UI de OpenPencil y el origen del renderizador de respaldo de este plugin. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Asistente de codificación nativo de IA y de código abierto para tu terminal: lee tu código, ejecuta comandos y maneja OpenPencil a través de MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Sistema de memoria no vectorial y local-first para agentes de codificación: memoria duradera como archivos inspeccionables, funciona entre runtimes. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | El plugin de habilidades LLM que enseña a los agentes de IA a diseñar con `op`: un compañero de este plugin de DSH. |

Otros plugins de DSH:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — un emulador de Android o un dispositivo USB en vivo dentro de la conversación, gobernado por completo a través de adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — delegar trabajo a agentes DSH desde Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — un simulador de iOS —y un iPhone por USB— dentro de la conversación
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — memoria a largo plazo para DSH

## Contribuciones

¡Las contribuciones son bienvenidas! Haz fork y clona, crea una rama, ejecuta `pnpm run build` y las suites de pruebas, haz commit con [Conventional Commits](https://www.conventionalcommits.org/) y abre un PR contra `main`.

## Comunidad

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Únete a nuestro Discord</strong>
</a>
— Haz preguntas, comparte diseños, sugiere funciones.

**Comunidad reconocida: [LINUX DO](https://linux.do/)**

## Licencia

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Los componentes de terceros se enumeran en [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).