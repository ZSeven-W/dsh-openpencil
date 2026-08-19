<p align="center">
  <img src="./docs/images/dsh-openpencil-logo.png" alt="DSH OpenPencil" width="120" />
</p>

<h1 align="center">DSH OpenPencil</h1>

<p align="center">
  <strong>O plugin do DeepSeek Harness para o OpenPencil — visualize, inspecione e edite documentos <code>.op</code> reais dentro de uma conversa.</strong><br />
  <sub>Pré-visualizações Exatas de Múltiplos Quadros &bull; Canvas Interativo &bull; Editor Gerenciado &bull; Ferramentas de Design Nativas de Agente</sub>
</p>

<p align="center">
  <sub>npm: <a href="https://www.npmjs.com/package/@zseven-w/dsh-openpencil"><code>@zseven-w/dsh-openpencil</code></a> · Versão atual do plugin: <code>0.1.0-rc.1</code> · Testado com DSH <code>0.1.0-rc.6</code></sub>
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

Cinco ferramentas — `openpencil_new`, `openpencil_create`, `openpencil_edit`, `openpencil_render`, `openpencil_selection` — permitem que o Agente crie, modifique e leia um canvas real por meio de programas transacionais `batch_design`.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Concessões Controladas por Capacidades

As concessões de imagem e documento são capacidades assinadas e vinculadas a hash. Os metadados do navegador nunca expõem um caminho arbitrário do host, e as capacidades assinadas de pré-visualização/edição nunca entram no resultado canônico da ferramenta nem no contexto do modelo.

</td>
<td width="50%">

### ⚡ Segurança Transacional

Um novo documento só é publicado depois que todo o programa `batch_design` é concluído com sucesso. A ferramenta nunca sobrescreve um caminho existente, um lote com falha não deixa nenhum arquivo vazio para trás e os salvamentos usam um hash otimista com substituição atômica.

</td>
</tr>
<tr>
<td width="50%">

### 🌍 Segue o Visual do DSH

O cartão da ferramenta e o editor gerenciado seguem a localização chinês/inglês do DSH e o tema claro/escuro sem recarregar a sessão de edição.

</td>
<td width="50%">

### 🎯 Um Fluxo de Trabalho Completo

"Requisito na conversa → o Agente edita o canvas real → pré-visualização ao vivo e validação por interação → continue iterando" — um único loop, sem idas e voltas de capturas de tela.

</td>
</tr>
</table>

## Instalação no DSH

O DSH é um pacote separado. Instale-o uma vez, se ainda não tiver:

```sh
npm install -g @deepseek-ai/dsh@0.1.0-rc.6
```

Depois adicione o plugin a um perfil e inicie o app web:

```sh
dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
dsh web
```

Prefere não instalar o DSH globalmente? Rode os mesmos dois passos via `pnpm dlx`:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh plugin --profile web add @zseven-w/dsh-openpencil@latest
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
```

> O plugin do OpenPencil é público e não exige token npm. Se a pré-versão do DSH em si exigir autenticação de registro, mantenha essa credencial em um config npm no nível do usuário ou temporário, fora do checkout. Este repositório não contém intencionalmente nenhuma credencial de registro.

## Ferramentas de Design

| Ferramenta | O que ela faz |
| --- | --- |
| `openpencil_new` | Cria um `.op` totalmente novo a partir de um único programa transacional `batch_design`, salva-o atomicamente por meio do filesystem com sandbox do DSH e não exige um editor aberto previamente. |
| `openpencil_create` | Aplica um programa transacional `batch_design` para gerar ou reestruturar nós em um canvas ao vivo existente. |
| `openpencil_edit` | Modifica um nó explícito ou o único nó selecionado pelo usuário. |
| `openpencil_render` | Cria um snapshot `.op` imutável e endereçado por conteúdo e renderiza todos os quadros de nível superior da página ativa — com `scale` e `editable` opcionais. |
| `openpencil_selection` | Lê exatamente os nós selecionados no canvas ao vivo do editor. |

## Fluxo de Trabalho de Design do Agente

Para uma solicitação em linguagem natural sem um documento existente, o Agente deve chamar `openpencil_new` com um novo caminho `.op` relativo ao workspace e o primeiro programa `batch_design` completo. A ferramenta executa esse programa em um daemon gerenciado privado do OpenPencil e publica o documento autoritativo somente depois que todo o lote é concluído com sucesso. Ela nunca sobrescreve um caminho existente e um lote com falha não deixa nenhum arquivo vazio para trás. Em seguida, o Agente deve chamar `openpencil_render` com o caminho retornado, `editable: true` e `autoOpen: true` para apresentar a galeria e expandir o editor uma vez. Cartões históricos reproduzidos ou inicialmente resolvidos nunca são abertos automaticamente.

Use `openpencil_create` e `openpencil_edit` somente para um canvas ao vivo existente. As edições permanecem não salvas até a ação Salvar do editor.

## Contrato de Renderização

O `openpencil_render` aceita um caminho `.op`, um `scale` opcional (`0 < scale <= 8`, padrão `1`) e um `editable` opcional (`false` por padrão). Deixe `width` e `height` sem definição para o caminho exato do OpenPencil: eles descrevem um viewport em tempo de execução, não dimensões de exportação de design, e são aceitos apenas pelo fallback Jian de fidelidade inferior.

A descoberta do binário do OpenPencil verifica, nesta ordem:

1. `DSH_OPENPENCIL_BINARY` ou `DSH_OPENPENCIL_DESKTOP`
2. `/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
3. `~/Applications/OpenPencil.app/Contents/MacOS/openpencil-desktop`
4. `openpencil-desktop` no `PATH`

A descoberta do fallback Jian usa `DSH_OPENPENCIL_JIAN`, uma build de release local conhecida e, em seguida, `PATH`. Se o binário exato do OpenPencil estiver genuinamente indisponível, o Jian pode produzir um fallback `runtime-preview` claramente rotulado. Falhas do renderizador exato, tempos limite e PNGs inválidos não caem silenciosamente no fallback.

## Recursos do Visualizador Web

O DSH serve apenas `client.js` para um plugin de cliente, então o ESM SDK do OpenPencil, seu WASM e o CanvasKit são preparados como recursos explícitos de mesma origem:

```sh
pnpm run sync:viewer-assets
```

O comando de sincronização prefere um checkout irmão `../openpencil` (desenvolvimento local), recorrendo ao submódulo fornecido `vendor/openpencil` (CI e clones novos). Substitua-o com `OPENPENCIL_ROOT` ou `--openpencil-root`. Um diretório de recursos pré-compilado completo pode ser selecionado com `DSH_OPENPENCIL_VIEWER_SOURCE`. A busca em tempo de execução pode ser substituída com `DSH_OPENPENCIL_VIEWER_ASSET_DIR`.

Os recursos do visualizador são carregados de forma preguiçosa somente depois que o usuário abre o canvas. Se estiverem ausentes ou inválidos, a pré-visualização em PNG permanece disponível e nenhum botão de canvas é anunciado.

## Editor Gerenciado

As sessões editáveis usam o host web gerenciado do OpenPencil — a mesma arquitetura usada pelo `op-vscode`. O plugin inicia o host somente após uma ação autorizada do usuário, mantém o token do daemon na memória, valida a origem e o src do iframe e encerra o processo quando a sessão do editor termina. A superfície do editor é selecionada progressivamente: detalhes nativos da ferramenta quando o host declara essa costura; caso contrário, o workbench direito do plugin com controles de redimensionamento e tela cheia.

Se o DSH recarregar ou descarregar o plugin enquanto o canvas estiver sujo, o host mantém um rascunho de recuperação local opaco por até sete dias. Reabrir a mesma fonte pergunta antes de restaurá-la no canvas ao vivo; a recuperação nunca sobrescreve o arquivo `.op` até que o usuário salve explicitamente.

A descoberta de binários e fontes pode ser substituída com:

- `DSH_OPENPENCIL_EDITOR_BINARY` para `op-host-web-server`;
- `DSH_OPENPENCIL_SOURCE_ROOT` (ou `OPENPENCIL_SOURCE_ROOT`) para o bundle web e os recursos do CanvasKit.

Os salvamentos usam um hash de fonte otimista, uma substituição atômica e uma capacidade sucessora. Se a fonte mudar fora do editor, o plugin relata um conflito em vez de sobrescrevê-la.

## Metadados do Resultado

O resultado visível ao modelo permanece JSON simples. O `presentationMeta.$dshOpenPencil` somente para navegador carrega concessões aditivas para:

- `image`: caminho do PNG, URLs de pré-visualização/download e largura/altura reais;
- `frames`: todos os quadros de nível superior renderizados exatamente na ordem da página ativa, incluindo id/nome/índice do nó e URLs de PNG assinadas;
- `document`: caminho da ação de origem mais URL de snapshot imutável, bytes e SHA-256;
- `viewer`: URLs de SDK/WASM/CanvasKit com versão quando a rota de recursos está anexada;
- `editor`: capacidades de abertura/atualização com escopo quando `editable: true` é autorizado.

O resultado também registra `renderer`, `rendererBinary`, `fidelity` e quaisquer avisos. Mensagens existentes somente PNG do schema-v1 permanecem renderizáveis.

O DSH `0.1.0-rc.6` não persiste metadados de apresentação do navegador para ferramentas aninhadas sob PTC/Code Mode. O plugin recupera essa projeção UI-only por meio de um endpoint de mesma origem e vinculado à sessão: o navegador envia apenas o session id, o call id e o SHA-256 imutável do documento, enquanto o host resolve o resultado autoritativo a partir do log de sessão durável do DSH e usa um marcador de curta duração no processo apenas para autorizar edições ao vivo recentes. Capacidades assinadas de pré-visualização/editor nunca entram no resultado canônico da ferramenta nem no contexto do modelo. O histórico durável pode restaurar pré-visualizações somente leitura; as concessões de editor são emitidas apenas para resultados ao vivo recentes e confiáveis.

Para reprodução limitada, a recuperação de metadados aninhados aceita até 128 quadros de nível superior; resultados maiores do Code Mode permanecem disponíveis por meio de seu fallback JSON canônico.

## Limitações Atuais

- Edições de acompanhamento em um canvas existente exigem um editor gerenciado já aberto. As alterações permanecem não salvas até que o usuário invoque sua ação Salvar.
- O canvas do Web SDK leve é somente leitura; a edição completa usa a superfície separada do editor gerenciado. No DSH `0.1.0-rc.6`, o plugin usa o workbench direito redimensionável com opção de tela cheia.
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
pnpm run test:host -- /absolute/path/to/design.op 375 1091
```

As compilações exigem Node 24.11 ou mais recente e pnpm. Os pacotes host/cliente do DSH são dependências pares fornecidas pelo perfil DSH de destino. As ferramentas de build são resolvidas a partir de dependências de desenvolvimento locais, do checkout DSH vinculado ativo ou de um bundle de fonte DSH instalado; `DSH_SOURCE_ROOT` pode selecionar explicitamente um checkout de fonte. O lockfile fixa as ferramentas de build públicas autônomas quando esse ambiente é provisionado separadamente.

Para uma pré-versão privada do DSH, mantenha a credencial npm emitida fora deste repositório (por exemplo, em um `.npmrc` no nível do usuário ou temporário) e execute a versão solicitada diretamente:

```sh
pnpm dlx --package=@deepseek-ai/dsh@0.1.0-rc.6 dsh web
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
