<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>O plugin do DeepSeek Harness para o OpenPencil — visualize, inspecione e edite documentos <code>.op</code> reais dentro de uma conversa.</strong><br />
  <sub>Pré-visualizações Exatas de Múltiplos Quadros &bull; Canvas Interativo &bull; Editor Gerenciado &bull; Ferramentas de Design Nativas de Agente</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Versão atual do plugin: <code>0.1.0-rc.5</code> · Testado até o DSH <code>0.1.1-rc.2</code></sub>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md"><b>Português</b></a> · <a href="./README.ru.md">Русский</a> · <a href="./README.hi.md">हिन्दी</a> · <a href="./README.tr.md">Türkçe</a> · <a href="./README.th.md">ไทย</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><img src="https://img.shields.io/npm/v/%40zseven-w%2Fdsh-openpencil?style=flat&color=cfb537" alt="npm" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/actions/workflows/check.yml"><img src="https://img.shields.io/github/actions/workflow/status/ZSeven-W/dsh-openpencil/check.yml?label=CI" alt="CI" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/stargazers"><img src="https://img.shields.io/github/stars/ZSeven-W/dsh-openpencil?style=flat&color=cfb537" alt="Estrelas" /></a>
  <a href="https://github.com/ZSeven-W/dsh-openpencil/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ZSeven-W/dsh-openpencil?color=64748b" alt="Licença" /></a>
  <a href="https://discord.gg/h9Fmyy6pVh"><img src="https://img.shields.io/badge/Discord-Join%20chat-5865F2?logo=discord&logoColor=white" alt="Discord" /></a>
</p>

<br />

<p align="center">
  <img src="./docs/images/dsh-openpencil-overview.png" alt="DSH OpenPencil — pré-visualização de múltiplos quadros e editor lateral" width="100%" />
</p>
<p align="center"><sub>Pré-visualizações exatas de <code>.op</code> de múltiplos quadros com um canvas interativo e o workbench do editor gerenciado</sub></p>

## Por que o DSH OpenPencil

O DSH OpenPencil conecta o [DeepSeek Harness](https://github.com/deepseek-ai/DSH) ao [OpenPencil](https://github.com/ZSeven-W/openpencil) para que um Agente controle um canvas de design real, editável e interativo, em vez de retornar uma imagem gerada.

<table>
<tr>
<td width="50%">

### 🖼️ Pré-visualizações Exatas de Múltiplos Quadros

O exportador headless do OpenPencil instalado gera pré-visualizações fiéis ao design: o primeiro quadro de nível superior como um PNG grande e seguro para repetição, além de uma faixa de miniaturas com rolagem horizontal, clique para selecionar e navegação anterior/próxima para documentos com vários quadros.

</td>
<td width="50%">

### 🗺️ Canvas Interativo

"Abrir canvas interativo" monta de forma preguiçosa o Web SDK somente leitura do OpenPencil com pan, zoom e ajuste à tela — inspecione qualquer página, nó aninhado ou página inativa sem sair da conversa.

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Editor Gerenciado

Com `editable: true`, a ação de edição abre o editor gerenciado do OpenPencil — seleção, camadas, propriedades, ferramentas de desenho, desfazer/refazer e semântica explícita de salvamento — em um workbench direito redimensionável com opção de tela cheia.

</td>
<td width="50%">

### 🤖 Ferramentas de Design Nativas de Agente

Cinco ferramentas diretas de canvas e seis ferramentas `openpencil_pipeline_*` permitem que o Agente crie, inspecione, refine, publique, modifique e leia um canvas real por meio dos runtimes gerenciados do OpenPencil.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Concessões Controladas por Capacidades

As concessões de imagem e documento são capacidades assinadas e vinculadas a hash. Os metadados do navegador nunca expõem um caminho arbitrário do host, e as capacidades assinadas de pré-visualização/edição nunca entram no resultado canônico da ferramenta nem no contexto do modelo.

</td>
<td width="50%">

### ⚡ Segurança Transacional

Um documento do pipeline completo permanece como rascunho privado e não publicado até passar por todas as barreiras de qualidade nativas e do DSH. A publicação não sobrescreve caminhos existentes, e cancelamentos ou lotes com falha não deixam um destino vazio.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Segue o Visual do DSH

O cartão da ferramenta e o editor gerenciado seguem a localização chinês/inglês do DSH e o tema claro/escuro sem recarregar a sessão de edição.

</td>
<td width="50%">

### 🎯 Um Fluxo de Trabalho Completo

"Requisito → rascunho privado → lotes semânticos → revisão e correção de PNGs exatos → publicação atômica após as barreiras de qualidade" — um fluxo completo dentro do DSH.

</td>
</tr>
</table>

## Instalação no DSH

O DSH é um pacote separado. Instale-o uma vez, se ainda não tiver:

```sh
npm install -g @deepseek-ai/dsh@latest
```

Depois adicione o plugin a um perfil e inicie o app web:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Para desenvolvimento local, compile este checkout, vincule seu caminho absoluto ao perfil Web e reinicie completamente o DSH:

```sh
pnpm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-openpencil
dsh web
```

A dependência `link:` torna recompilações posteriores visíveis a partir deste checkout. No entanto, o DSH deve ser totalmente reiniciado após substituir a dependência do perfil, pois o perfil Web fornecido não faz hot reload dos bundles do host por padrão.

Prefere não instalar o DSH globalmente? Rode os mesmos dois passos via `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

> O plugin do OpenPencil é público e não exige token npm. Se a pré-versão do DSH em si exigir autenticação de registro, mantenha essa credencial em um config npm no nível do usuário ou temporário, fora do checkout. Este repositório não contém intencionalmente nenhuma credencial de registro.

## Ferramentas de Design

| Ferramenta | O que ela faz |
| --- | --- |
| `openpencil_new` | Caminho rápido compatível para tarefas simples: executa um script QuickJS transacional de `batch_design`, publica apenas se o destino não existir e retorna uma apresentação editável. Prefira o pipeline completo para design de produção. |
| `openpencil_pipeline_begin` | Inicia um rascunho privado pertencente à sessão para um novo caminho `.op` relativo ao workspace; o arquivo de destino permanece não publicado e intacto. |
| `openpencil_pipeline_context` | Carrega o prompt dinâmico nativo do agente de design com diretrizes, guias de estilo, variáveis/temas e metadados ou referências de script de UI kits relevantes. |
| `openpencil_pipeline_batch` | Aplica em série lotes QuickJS semânticos ao rascunho: primeiro o esqueleto, depois as seções e o refinamento. |
| `openpencil_pipeline_inspect` | Executa inspeções nativas de qualidade ou layout resolvido, ou cria um PNG exato que o modelo pode abrir por leitura de imagem e revisar visualmente. |
| `openpencil_pipeline_finish` | Executa finalização nativa, lint, layout, atualidade da captura e barreiras de qualidade do DSH; depois publica atomicamente com `createIfAbsent` e retorna uma apresentação editável. |
| `openpencil_pipeline_abort` | Descarta o rascunho não publicado sem criar o arquivo de destino. |
| `openpencil_create` | Aplica um programa transacional `batch_design` para gerar ou reestruturar nós em um canvas ao vivo existente. |
| `openpencil_edit` | Modifica um nó explícito ou o único nó selecionado pelo usuário. |
| `openpencil_render` | Cria um snapshot `.op` imutável e endereçado por conteúdo e renderiza todos os quadros de nível superior da página ativa — com `scale` e `editable` opcionais. |
| `openpencil_selection` | Lê exatamente os nós selecionados no canvas ao vivo do editor. |

## Fluxo de Trabalho de Design do Agente

Para design de produção, use `openpencil_pipeline_begin` → `openpencil_pipeline_context` → chamadas repetidas de `openpencil_pipeline_batch` e `openpencil_pipeline_inspect` → `openpencil_pipeline_finish`. O daemon de rascunho é privado para a sessão DSH proprietária, e o caminho solicitado no workspace não existe até a publicação ser concluída com sucesso. Capturas intermediárias do rascunho privado nunca expõem uma barra lateral editável, evitando que edições do usuário disputem com os lotes do Agente; a edição só é concedida após a publicação.

O contexto não é um modelo estático: ele combina o prompt dinâmico nativo do agente de design do OpenPencil com diretrizes, guias de estilo, variáveis/temas e UI kits relevantes. Construa primeiro um esqueleto estrutural e depois adicione conteúdo e refinamento em lotes de seções semânticas. Para manter a velocidade, cada lote bem-sucedido retorna apenas diagnósticos compactos de layout; solicite o layout resolvido completo por `openpencil_pipeline_inspect` quando necessário. No mínimo, chame `openpencil_pipeline_inspect` com `kind: "screenshot"` após definir a assinatura/o título e novamente após montar a tarefa principal ou o formulário com o CTA. Em cada marco, o modelo abre o PNG exato com leitura de imagem, corrige recortes, overflow, hierarquia, espaçamento, proporções, contraste e legibilidade visíveis e repete conforme necessário; a revisão visual não acontece automaticamente.

A finalização executa as verificações nativas de finalização, lint e layout do OpenPencil, além da barreira de qualidade do DSH. Essas verificações determinísticas não criam bom gosto nem polimento visual. Após finalizar, tire outra captura exata e independente e faça o modelo revisá-la visualmente; capturas dos marcos intermediários nunca podem satisfazer essa barreira de atualidade pós-finalização. Somente então a última chamada finish cria o destino atomicamente com `createIfAbsent`. Se uma barreira falhar ou `openpencil_pipeline_abort` for chamado, o destino continua ausente. Todo resultado gerado e publicado é uma única apresentação que contém a prévia PNG final exata e uma concessão editável limitada ao documento; ela só abre automaticamente a barra lateral quando está livre, nunca substitui o editor de outra sessão e sempre mantém **Editar tela** para uma troca explícita. Um resultado de `openpencil_pipeline_finish` aninhado via PTC/Code Mode preserva a mesma apresentação e nunca se reduz a JSON comum ou cartão somente leitura. Cartões históricos ou hidratados não são abertos automaticamente.

Dentro do mesmo serviço DSH em execução, trocar de navegador ou recarregar permite recuperar uma publicação durável e analisada estritamente de `openpencil_new` ou `openpencil_pipeline_finish` como o PNG exato com a ação explícita **Editar tela**. Um cartão histórico nunca abre automaticamente a barra lateral; o usuário precisa clicar nessa ação. Um `openpencil_render` histórico comum permanece somente leitura, e conexões não-loopback nunca recebem uma concessão de editor.

A skill `openpencil-design` incluída continua sendo o guia de scripting e qualidade, e o runtime gerenciado não depende do binário de desktop. `openpencil_new` permanece como um caminho rápido compatível de lote único, mas a geração para produção deve priorizar o pipeline completo.

Use `openpencil_create` e `openpencil_edit` somente para um canvas ao vivo existente. As edições permanecem não salvas até a ação Salvar do editor.

## Recursos do Visualizador Web

O DSH serve apenas `client.js` para um plugin de cliente, então o ESM SDK do OpenPencil, seu WASM e o CanvasKit são preparados como recursos explícitos de mesma origem:

```sh
pnpm run sync:viewer-assets
```

O comando de sincronização prefere um checkout irmão `../openpencil` (desenvolvimento local), recorrendo ao submódulo fornecido `vendor/openpencil` (CI e clones novos). Substitua-o com `OPENPENCIL_ROOT` ou `--openpencil-root`. Um diretório de recursos pré-compilado completo pode ser selecionado com `DSH_OPENPENCIL_VIEWER_SOURCE`. A busca em tempo de execução pode ser substituída com `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Os recursos do visualizador são carregados de forma preguiçosa somente depois que o usuário abre o canvas. Se estiverem ausentes ou inválidos, a pré-visualização em PNG permanece disponível e nenhum botão de canvas é anunciado.

## Editor Gerenciado

As sessões editáveis usam o host web gerenciado do OpenPencil — a mesma arquitetura usada pelo `op-vscode`. O plugin inicia o host somente após uma ação autorizada do usuário, mantém o token do daemon na memória, valida a origem e o src do iframe e encerra o processo quando a sessão do editor termina. A superfície do editor é selecionada progressivamente: detalhes nativos da ferramenta quando o host declara essa costura; caso contrário, o workbench direito do plugin com controles de redimensionamento e tela cheia.

A inicialização usa um listening handshake seguro para montagens lentas: as verificações de prontidão começam somente depois que o host incluído anuncia seu endereço vinculado. Nenhuma instalação desktop do OpenPencil é necessária.

As instalações publicadas oferecem seis destinos nativos: `darwin-arm64`, `darwin-x64`, `linux-arm64`, `linux-x64`, `win32-arm64` e `win32-x64`; os pacotes Linux exigem glibc. O pacote raiz seleciona o pacote de plataforma adequado ao sistema operacional e à CPU por meio de `optionalDependencies` com versões exatas (por exemplo, `@zseven-w/dsh-openpencil-darwin-arm64`). Esse pacote fornece `op-host-web-server`, o bundle web do editor e o CanvasKit como um único runtime compatível. Portanto, o editor gerenciado não depende de `/Applications/OpenPencil.app`, de `openpencil-desktop` no `PATH` nem de um checkout do código-fonte do OpenPencil.

Se o DSH recarregar ou descarregar o plugin enquanto o canvas estiver sujo, o host mantém um rascunho de recuperação local opaco por até sete dias. Reabrir a mesma fonte pergunta antes de restaurá-la no canvas ao vivo; a recuperação nunca sobrescreve o arquivo `.op` até que o usuário salve explicitamente.

Os pacotes oficiais das seis plataformas recebem seus endpoints de bootstrap de colaboração para China e Global durante o build de release protegido, que valida os valores injetados antes da publicação. Um build local próprio sem essa injeção pode substituir o bootstrap antes de iniciar o DSH com `OPENPENCIL_COLLAB_BOOTSTRAP_URL=https://<your-host>/api/v1/collaboration/bootstrap`; o valor deve usar `https` e exatamente o caminho `/api/v1/collaboration/bootstrap`.

A sincronização do canvas entre dispositivos exige que o runtime nativo de PC/DSH e o aplicativo móvel sejam atualizados para a mesma linha de lançamento do OpenPencil que contém a correção atual da fila de colaboração. Misturar um aplicativo móvel antigo com um runtime de PC mais novo ainda pode mostrar os cursores remotos sem receber os commits do canvas.

Ao desenvolver a partir deste repositório, compile primeiro o bundle Web do editor, depois o host nativo e, por fim, prepare esse runtime compatível antes de iniciar o DSH.

`pnpm run build:editor-web` executa o gate de bundle WASM oficialmente suportado pelo OpenPencil. Ele requer Bash, Cargo/Rust com o target `wasm32-unknown-unknown`, a CLI `wasm-bindgen`, o `wasm-opt` do Binaryen, Node.js e `gzip`; o CanvasKit não requer EMSDK. O build Web não usa as variáveis de build do bootstrap de colaboração. Antes de `pnpm run build:editor-runtime`, defina `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_CN` e `OPENPENCIL_BUILD_COLLAB_BOOTSTRAP_URL_GLOBAL`. Elas são usadas somente pelo build Cargo nativo, que falha em modo fail closed se qualquer uma estiver ausente. Depois que os dois builds forem concluídos com sucesso, prepare o runtime com o último comando.

```sh
pnpm run build:editor-web
pnpm run build:editor-runtime
pnpm run stage:editor-runtime
```

As substituições explícitas do runtime só são aceitas como um conjunto completo e compatível:

- `DSH_OPENPENCIL_EDITOR_BINARY` para `op-host-web-server`;
- `DSH_OPENPENCIL_EDITOR_WEB_BUNDLE_DIR` para o bundle web compilado do editor;
- `DSH_OPENPENCIL_EDITOR_CANVASKIT_DIR` para os recursos do CanvasKit.

Fornecer apenas parte desse conjunto é uma configuração inválida; o plugin não combina caminhos personalizados com os recursos do runtime incluído no pacote.

Os salvamentos usam um hash de fonte otimista, uma substituição atômica e uma capacidade sucessora. Se a fonte mudar fora do editor, o plugin relata um conflito em vez de sobrescrevê-la.

## Metadados do Resultado

O resultado visível ao modelo permanece JSON simples. O `presentationMeta.$dshOpenPencil` somente para navegador carrega concessões aditivas para:

- `image`: caminho do PNG, URLs de pré-visualização/download e largura/altura reais;
- `frames`: todos os quadros de nível superior renderizados exatamente na ordem da página ativa, incluindo id/nome/índice do nó e URLs de PNG assinadas;
- `document`: caminho da ação de origem mais URL de snapshot imutável, bytes e SHA-256;
- `viewer`: URLs de SDK/WASM/CanvasKit com versão quando a rota de recursos está anexada;
- `editor`: capacidades de abertura/atualização com escopo quando `editable: true` é autorizado.

O resultado também registra `renderer`, `rendererBinary`, `fidelity` e quaisquer avisos. Mensagens existentes somente PNG do schema-v1 permanecem renderizáveis.

O DSH `0.1.1-rc.2` não persiste metadados de apresentação do navegador para ferramentas aninhadas sob PTC/Code Mode. O plugin recupera essa projeção UI-only por meio de um endpoint de mesma origem e vinculado à sessão: o navegador envia apenas o session id, o call id e o SHA-256 imutável do documento, enquanto o host resolve o resultado autoritativo a partir do log de sessão durável do DSH e usa um marcador de curta duração no processo apenas para autorizar edições ao vivo recentes. Capacidades assinadas de pré-visualização/editor nunca entram no resultado canônico da ferramenta nem no contexto do modelo. O histórico durável de um `openpencil_render` comum permanece somente leitura. Uma publicação durável e analisada estritamente de `openpencil_new` ou `openpencil_pipeline_finish` só pode receber uma concessão de editor via loopback e após um clique explícito do usuário; a abertura automática da barra lateral fica reservada a resultados ao vivo recentes e confiáveis.

Para reprodução limitada, a recuperação de metadados aninhados aceita até 128 quadros de nível superior; resultados maiores do Code Mode permanecem disponíveis por meio de seu fallback JSON canônico.

## Limitações Atuais

- Edições de acompanhamento em um canvas existente exigem um editor gerenciado já aberto. As alterações permanecem não salvas até que o usuário invoque sua ação Salvar.
- O canvas do Web SDK leve é somente leitura; a edição completa usa a superfície separada do editor gerenciado. No DSH `0.1.1-rc.2`, o plugin usa o workbench direito redimensionável com opção de tela cheia.
- A galeria exata cobre os quadros de nível superior da página ativa; o canvas interativo continua sendo a forma de inspecionar páginas inativas e nós aninhados.
- Os caches de renderização e snapshot ainda precisam de uma política de retenção no nível do produto.

## Estrutura do Projeto

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

## Compilação e Verificação

```sh
pnpm run sync:viewer-assets
pnpm run build
pnpm run test:viewer-assets
pnpm run test:client
pnpm run test:host /absolute/path/to/design.op 375 1091
```

As compilações exigem Node 24.11 ou mais recente e pnpm. Os pacotes host/cliente do DSH são dependências pares fornecidas pelo perfil DSH de destino. As ferramentas de build são resolvidas a partir de dependências de desenvolvimento locais, do checkout DSH vinculado ativo ou de um bundle de fonte DSH instalado; `DSH_SOURCE_ROOT` pode selecionar explicitamente um checkout de fonte. O lockfile fixa as ferramentas de build públicas autônomas quando esse ambiente é provisionado separadamente.

Para uma pré-versão privada do DSH, mantenha a credencial npm emitida fora deste repositório (por exemplo, em um `.npmrc` no nível do usuário ou temporário) e execute a versão solicitada diretamente:

```sh
pnpm dlx --package=@deepseek-ai/dsh@latest dsh web
```

Nunca faça commit de `.npmrc`, `NPM_TOKEN` ou credenciais de registro copiadas. Este repositório ignora a configuração npm local por padrão.

O `test:host` executa uma renderização exata real, valida a geometria IHDR do PNG e o SHA-256, exercita as capacidades imutáveis de imagem/documento por HTTP e verifica se os recursos do visualizador são concedíveis. As dimensões esperadas são específicas do fixture.

## Ecossistema

O DSH OpenPencil é o plugin do DeepSeek Harness para **[OpenPencil](https://github.com/ZSeven-W/openpencil)** — a primeira ferramenta de design vetorial open-source nativa de IA do mundo — e faz parte da família **[ZSeven-W](https://github.com/ZSeven-W)** de ferramentas nativas de IA em Rust puro.

| Projeto | O que é |
| ------- | ---------- |
| **[OpenPencil](https://github.com/ZSeven-W/openpencil)** | A ferramenta de design que este plugin controla — geração de prompt para canvas, equipes de agentes concorrentes, arquivos `.op` de design-como-código e um servidor MCP integrado. As pré-visualizações exatas, o canvas interativo e o editor gerenciado aqui são alimentados pelo próprio OpenPencil. |
| **[agent-rs](https://github.com/ZSeven-W/agent-rs)** | Um runtime assíncrono em Rust puro para distribuir agentes de LLM — multi-provedor, com ferramentas de ponta a ponta, permissões estruturadas, MCP real e zero `unsafe`. Alimenta o runtime de agente integrado do OpenPencil. |
| **[jian](https://github.com/ZSeven-W/jian)** | Framework de UI em Rust puro com GPU-Skia — widgets, layout, eventos e hot reload em uma única stack. O framework de UI do OpenPencil e a origem do renderizador fallback deste plugin. |
| **[Zode](https://github.com/ZSeven-W/zode)** | Assistente de codificação open-source e nativo de IA para o seu terminal — lê seu código, executa comandos e controla o OpenPencil por MCP. |
| **[noema](https://github.com/ZSeven-W/noema)** | Sistema de memória local-first e não vetorial para agentes de codificação — memória durável como arquivos inspecionáveis, funciona entre runtimes. |
| **[openpencil-skill](https://github.com/ZSeven-W/openpencil-skill)** | O plugin de skill de LLM que ensina agentes de IA a projetar com `op` — um companheiro deste plugin do DSH. |

Outros plugins do DSH:

- [DSH Android](https://github.com/ZSeven-W/dsh-android) — um emulador Android ou dispositivo USB ao vivo dentro da conversa, tudo conduzido via adb
- [DSH Crew](https://github.com/ZSeven-W/dsh-crew) — delegar trabalho a agentes DSH a partir do Claude Code / Codex
- [DSH iOS](https://github.com/ZSeven-W/dsh-ios) — um simulador de iOS — e um iPhone por USB — dentro da conversa
- [DSH Noema](https://github.com/ZSeven-W/dsh-noema) — memória de longo prazo para o DSH

## Como Contribuir

Contribuições são bem-vindas! Faça um fork e clone, crie um branch, execute `pnpm run build` e as suítes de teste, faça commit com [Conventional Commits](https://www.conventionalcommits.org/) e abra um PR contra o `main`.

## Comunidade

<a href="https://discord.gg/h9Fmyy6pVh">
  <img src="https://raw.githubusercontent.com/ZSeven-W/openpencil/main/screenshot/logo-discord.svg" alt="Discord" width="16" />
  <strong> Junte-se ao nosso Discord</strong>
</a>
— Tire dúvidas, compartilhe designs e sugira recursos.

**Comunidade reconhecida: [LINUX DO](https://linux.do/)**

## Licença

[MIT](./LICENSE) — Copyright (c) 2026 ZSeven-W

Os componentes de terceiros estão listados em [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
