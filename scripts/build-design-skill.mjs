import { readFile, mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const DEFAULT_BUNDLE_PATH = resolve(
  root,
  'vendor/openpencil/crates/op-cli/assets/skill-bundle.json',
)
export const DEFAULT_FORM_SKILL_PATH = resolve(
  root,
  'vendor/openpencil/crates/op-ai-skills/skills/domains/form-ui.md',
)
export const DEFAULT_COMPONENT_SKILL_PATH = resolve(
  root,
  'vendor/openpencil/crates/op-ai-skills/skills/phases/generation/jian-components.md',
)
export const DEFAULT_ANTI_SLOP_SKILL_PATH = resolve(
  root,
  'vendor/openpencil/crates/op-ai-skills/skills/phases/generation/anti-slop.md',
)
export const DEFAULT_OUTPUT_PATH = resolve(root, 'lib/assets/openpencil-design/SKILL.md')

const UPSTREAM_SKILL_KEY = 'skills/openpencil-design/SKILL.md'
const REQUIRED_UPSTREAM_HEADINGS = [
  '## Quick Reference — `op` CLI',
  '## PenNode Schema',
  '## Semantic Roles',
  '## Layout Rules',
  '## Design Principles',
  '## Layered Workflow',
  '## Common Patterns',
  '## Common Mistakes',
  '## Full Example — `op insert` Workflow (Recommended)',
]
const REQUIRED_PATTERN_HEADINGS = ['Navbar', 'Hero', 'Feature Card', 'Form Input', 'Footer']

function fail(message) {
  throw new Error(`build-design-skill: ${message}`)
}

function countLine(markdown, line) {
  return markdown.split('\n').filter(candidate => candidate.trimEnd() === line).length
}

function requireSentinel(markdown, sentinel, source) {
  if (!markdown.includes(sentinel)) fail(`${source} is missing sentinel ${JSON.stringify(sentinel)}`)
}

function validateSingleHeadings(markdown) {
  for (const heading of REQUIRED_UPSTREAM_HEADINGS) {
    const count = countLine(markdown, heading)
    if (count !== 1) fail(`upstream ${heading} count is ${count}, expected exactly 1`)
  }
  for (const heading of REQUIRED_PATTERN_HEADINGS) {
    const pattern = new RegExp(`^### ${heading}(?:\\s|$)`, 'gm')
    const count = [...markdown.matchAll(pattern)].length
    if (count !== 1) fail(`upstream common pattern ${heading} count is ${count}, expected exactly 1`)
  }
}

function section(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(`${startHeading}\n`)
  const end = markdown.indexOf(`${endHeading}\n`, start + startHeading.length)
  if (start < 0 || end < 0 || end <= start) {
    fail(`cannot extract ${startHeading} before ${endHeading}`)
  }
  return markdown.slice(start, end).trimEnd()
}

function adaptSchema(schema) {
  const nativeTypes = 'frame|rectangle|text|ellipse|line|polygon|path|image|icon_font|group|ref|text_input|text_area|select|switch|checkbox|slider|number_input|progress|tabs|radio_group'
  const withNativeTypes = schema.replace(
    'frame|rectangle|text|ellipse|line|polygon|path|image|icon_font|group|ref',
    nativeTypes,
  )
  if (withNativeTypes === schema) fail('upstream PenNode type union sentinel drifted')
  // Locate boundaries after expanding the type union; offsets from the
  // original string are no longer valid once the replacement grows it.
  const iconStart = withNativeTypes.indexOf('### Icons — Two Options\n')
  const imageStart = withNativeTypes.indexOf('### Image\n', iconStart)
  if (iconStart < 0 || imageStart < 0) fail('upstream PenNode schema icon/image boundaries drifted')

  const icons = `### Icons

Use \`icon_font\` with a real lowercase kebab-case Lucide glyph. It renders directly in the DSH-managed build and does not need a second resolver pass.

\`\`\`json
{ "type": "icon_font", "name": "Lock Icon", "iconFontName": "lock",
  "width": 20, "height": 20,
  "fill": [{ "type": "solid", "color": "#6B7280" }] }
\`\`\`

The field is \`iconFontName\`, not \`iconName\` or \`icon\`. Never substitute emoji, initials, or text characters for interface icons.`

  return `${withNativeTypes.slice(0, iconStart)}${icons}\n\n${withNativeTypes.slice(imageStart)}`
    .replace(
      'AI image placeholders (resolved by `design:refine`):',
      'AI image placeholders (only when the managed resolver is available):',
    )
}

function commonPatterns() {
  return `## Common Patterns

These retain the upstream Navbar, Hero, Feature Card, Form Input, and Footer patterns, but express them as the sandboxed QuickJS accepted by \`openpencil_pipeline_batch({script})\` (and by the compatibility \`openpencil_new\` fast path). Within one script, capture every \`I()\` return value and pass that binding as the next parent. In a later semantic batch, adding children to an existing shell may use the exact quoted node id returned by the previous batch/layout result. Never use a quoted name or an invented id.

### Navbar

\`\`\`js
const nav = I(root, { type: "frame", role: "navbar", width: "fill_container", height: 64, layout: "horizontal", padding: [0, 24], justifyContent: "space_between", alignItems: "center", fill: [{ type: "solid", color: "#FFFDF8" }] });
I(nav, { type: "text", content: "Northstar", fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 700, lineHeight: 1.2, fill: [{ type: "solid", color: "#17221B" }] });
const action = I(nav, { type: "frame", role: "button", width: 116, height: 44, layout: "horizontal", justifyContent: "center", alignItems: "center", cornerRadius: 12, fill: [{ type: "solid", color: "#D45D3F" }] });
I(action, { type: "text", content: "Start project", fontFamily: "Inter", fontSize: 14, fontWeight: 650, lineHeight: 1.3, fill: [{ type: "solid", color: "#FFFFFF" }] });
\`\`\`

### Hero

\`\`\`js
const hero = I(root, { type: "frame", role: "hero", width: "fill_container", height: "fit_content", layout: "vertical", padding: [72, 64], gap: 20, alignItems: "start", fill: [{ type: "linear_gradient", angle: 125, stops: [{ offset: 0, color: "#F7F1E7" }, { offset: 1, color: "#E8EFE8" }] }] });
I(hero, { type: "text", role: "heading", content: "Ideas deserve a point of view", width: 720, textGrowth: "fixed-width", fontFamily: "Space Grotesk", fontSize: 52, fontWeight: 720, lineHeight: 1.08, letterSpacing: -1.2, fill: [{ type: "solid", color: "#17221B" }] });
I(hero, { type: "text", role: "body-text", content: "A deliberate system for turning a rough brief into a memorable interface.", width: 560, textGrowth: "fixed-width", fontFamily: "Inter", fontSize: 17, fontWeight: 400, lineHeight: 1.55, fill: [{ type: "solid", color: "#526057" }] });
\`\`\`

### Feature Card

\`\`\`js
const card = I(grid, { type: "frame", role: "feature-card", width: "fill_container", height: "fit_content", layout: "vertical", padding: 24, gap: 14, cornerRadius: 16, fill: [{ type: "solid", color: "#FFFDF8" }], stroke: { thickness: 1, fill: [{ type: "solid", color: "#DDE3DC" }] }, effects: [{ type: "shadow", offsetX: 0, offsetY: 8, blur: 24, spread: -8, color: "#17221B1A" }] });
I(card, { type: "icon_font", iconFontName: "sparkles", width: 24, height: 24, fill: [{ type: "solid", color: "#D45D3F" }] });
I(card, { type: "text", content: "One signature moment", width: "fill_container", textGrowth: "fixed-width", fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 650, lineHeight: 1.25, fill: [{ type: "solid", color: "#17221B" }] });
\`\`\`

### Form Input

Use native leaves, not rectangle/text imitations. In a stacked form every control is full width: single-line \`text_input\` and \`select\` controls are 44–52 px high, while a multiline \`text_area\` receives an intentional 96–160 px height. Design-system fill, stroke, and corner radius are always explicit.

\`\`\`js
const form = I(root, { type: "frame", name: "Sign in form", width: "fill_container", height: "fit_content", layout: "vertical", gap: 16 });
I(form, { type: "text_input", name: "Email", value: "", placeholder: "name@studio.com", leadingIcon: "mail", width: "fill_container", height: 48, fill: [{ type: "solid", color: "#FFFDF8" }], stroke: { thickness: 1, fill: [{ type: "solid", color: "#C8D1C9" }] }, cornerRadius: 12 });
I(form, { type: "text_input", name: "Password", value: "", placeholder: "Enter your password", secure: true, leadingIcon: "lock", trailingIcon: "eye", width: "fill_container", height: 48, fill: [{ type: "solid", color: "#FFFDF8" }], stroke: { thickness: 1, fill: [{ type: "solid", color: "#C8D1C9" }] }, cornerRadius: 12 });
I(form, { type: "checkbox", label: "Remember this device", checked: false, width: "fill_container", height: 44, fill: [{ type: "solid", color: "#D45D3F" }], stroke: { thickness: 1, fill: [{ type: "solid", color: "#9EAAA0" }] }, cornerRadius: 6 });
\`\`\`

For a known component from an available kit, instantiate it instead of redrawing it: \`const submit = K(availableKitId, form, { width: "fill_container", height: 48 });\`. \`availableKitId\` must be a real id supplied by the editor/task context; never invent one. If no kit id is known, build with supported native nodes and semantic \`I()\` calls.

### Footer

\`\`\`js
const footer = I(root, { type: "frame", role: "footer", width: "fill_container", height: "fit_content", layout: "horizontal", padding: [40, 64], gap: 64, justifyContent: "space_between", fill: [{ type: "solid", color: "#17221B" }] });
I(footer, { type: "text", content: "Northstar — built with intention.", fontFamily: "Inter", fontSize: 14, lineHeight: 1.5, fill: [{ type: "solid", color: "#DCE5DD" }] });
\`\`\``
}

function adaptDesignPrinciples(principles) {
  const upstream = 'CJK: use `"Noto Sans SC/JP/KR"`, lineHeight >= 1.3, letterSpacing: 0 always.'
  const portable = 'CJK: default to `"system-ui"` for a portable DSH document, with lineHeight >= 1.3 and letterSpacing: 0. Use Noto Sans, PingFang, Microsoft YaHei, or another named CJK family only when the editor context or user confirms it is installed.'
  if (!principles.includes(upstream)) fail('upstream CJK typography sentinel drifted')
  return principles.replace(upstream, portable)
}

function commonMistakes() {
  return `## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Setting x/y inside layout container | Remove x/y — engine auto-positions |
| Cards with different width strategies | All siblings use the same sizing strategy |
| \`fill_container\` child in \`fit_content\` parent | Use fixed width or switch the parent to \`fill_container\` |
| Pure black text \`#000000\` | Use \`#111111\` or a palette-specific near-black |
| Heavy drop shadows | Use subtle, palette-tinted elevation |
| Emoji, initials, or text as icons | Use \`icon_font\` with a real glyph or a known kit component |
| Lorem ipsum placeholder | Write realistic, concise copy |
| Fixed height on text | Use \`textGrowth: "fixed-width"\` instead |
| Unverified named font for CJK | Default to \`system-ui\`; use Noto/PingFang/YaHei only when availability is confirmed |
| Negative letter spacing on CJK | Keep it at zero |
| Rectangle/text lookalike input | Emit native \`text_input\`, \`text_area\`, \`select\`, \`switch\`, or \`checkbox\` |
| Native control with implicit styling or size | Set intentional width/height plus explicit \`fill\`, \`stroke\`, and \`cornerRadius\` |
| Password input without secure entry | Set \`secure: true\` on the native \`text_input\` |
| Generic initial badge + white card + saturated CTA | Choose a named visual concept and one signature moment before writing nodes |
| Expecting finalization to make a weak design attractive | Fix typography, sizing, palette, composition, and iconography in the script itself |`
}

function dshPrefix() {
  return `---
name: openpencil-design
description: Design production-quality OpenPencil .op interfaces in DSH with the complete native openpencil_pipeline workflow, iterative visual verification, and atomic publication.
---

# OpenPencil Design in DSH

Load this skill before beginning a new OpenPencil design. The pipeline begin result includes OpenPencil's complete native design-agent prompt; that prompt is the authoritative, version-matched design contract and must be followed in full.

## DSH Workflow

1. Choose a new workspace-relative \`.op\` filename and call \`openpencil_pipeline_begin({path, brief})\`. It validates Workspace Write and the absent local target but keeps all bytes private. Never put a path, URL, import, export, or spawned-agent request into native draft context.
2. Read the returned \`designAgentPrompt\`, \`editorState\`, \`styleGuideTags\`, and \`variables\`. Follow the native prompt in full. Use \`openpencil_pipeline_context\` to resolve the correct product guideline, visual style, UI kits/components, and variables. On a blank document, apply one matching built-in design system before visual nodes when available; otherwise configure a compact draft-local token/theme map with the allowlisted \`set_variables\` / \`set_themes\` calls. Re-read variables and the active theme before creating the skeleton.
3. Translate the brief and resolved native context into one explicit **style fingerprint**: named visual concept, heading/body font pairing, neutral and accent palette, radius scale, elevation treatment, density, and one signature visual moment.
4. Call \`openpencil_pipeline_batch({script})\` first with only the fixed-size root and empty semantic section shells. Inside sandboxed QuickJS, use \`I(null, node)\`, capture every returned binding, and pass it as the parent of later \`I(parent, node)\` calls. \`K(kitId, parent, overrides)\` is only for a real id returned by context. Do not run \`I\` or \`K\` in DSH's outer code runtime.
5. Fill one semantic section per subsequent script batch; keep each batch small enough to diagnose (normally at most 25 operations). Use \`I("<existing-shell-id>", node)\` only with the exact id returned by the prior batch/layout result; descendants created in the same script still use captured bindings. Use canonical \`layout\`, \`gap\`, \`padding\`, \`justifyContent\`, \`alignItems\`, \`cornerRadius\`, \`fill\`, \`stroke\`, and \`effects\`. Every batch forces post-processing and returns native quality plus resolved layout; repair its diagnostics immediately with another \`script\` or \`operations\` batch.
6. Do not design blind. Two intermediate visual checkpoints are mandatory: (a) immediately after the signature visual + headline establish the composition, and (b) after the primary form/task + CTA are present. At each checkpoint call \`openpencil_pipeline_inspect(kind:"screenshot")\` with the root, open the returned safe cache path with \`read_image\`, judge the actual pixels, and repair visible composition, spacing, typography, control, icon, and contrast defects before adding more sections. These previews are model-requested visual inspections, not automatic vision.
7. Use \`openpencil_pipeline_inspect(kind:"layout")\` and \`kind:"quality"\` before finishing. Confirm every shell is populated, content is complete, layout issues and blocking lint are empty, variables resolve, and the composition meets the native prompt rather than merely passing structural checks. Full layout trees are intentionally on-demand; successful batch results carry only compact layout diagnostics to keep the DSH loop fast.
8. Call \`openpencil_pipeline_finish\` for the first finalize phase. The tool refuses to finalize if no root preview was taken. Native finalization, composite quality, blocking lint, and layout then run while the target is still absent; informational lint remains visible but is not a publication blocker. If any advisory or diagnostic is returned, keep iterating. If native quality reports intentional image slots and image resolution is available, call the allowlisted \`openpencil_pipeline_context(tool:"enrich_images")\` with only bounded \`timeout_seconds\`/\`root_ids\`, then finalize and inspect the changed version again.
9. Once the finalized version is clean, take a distinct post-final \`openpencil_pipeline_inspect(kind:"screenshot")\`, open it with \`read_image\`, and judge clipping, overflow, hierarchy, balance, spacing, typography, control proportions, iconography, contrast, and text legibility. Correct every visible defect, then finalize and take a new screenshot because any mutation invalidates the old visual proof. An intermediate screenshot can never satisfy this post-final gate, even when finalization is a no-op.
10. Call \`openpencil_pipeline_finish\` again only after the exact current finalized version has a visually reviewed screenshot. DSH then applies its JS quality gate, atomically creates the target with \`createIfAbsent\`, and returns one publication presentation that pairs that exact final PNG with the editable document grant and an explicit Edit canvas action. It requests editor auto-open only when the sidebar surface is idle. This remains true through nested PTC/Code Mode hydration. Do not call \`openpencil_render\` merely to recreate the final card. If the user explicitly requests another generated-artifact render, pass \`editable:true, autoOpen:true\` so the preview never loses its sidebar action. On cancellation call \`openpencil_pipeline_abort\`; session/plugin disposal also aborts unpublished drafts.

\`openpencil_new\` remains only as a compatibility fast path when the user explicitly asks for a simple one-shot draft. It does not provide the complete context → iterative batches → post-final screenshot gate above and is not the default for quality-sensitive design work.

OpenPencil's post-processing/finalization repairs deterministic structural and layout defects. **It is not an aesthetic generator**: it will not invent a visual concept, fix generic typography, size controls intentionally, choose brand colors, or replace fake icons. Those decisions must already be present in the iterative design batches and verified in the post-final screenshot.

## Fast, Evidence-First Execution

- Call \`openpencil_pipeline_begin\` directly. It already validates Workspace Write, the parent directory, the \`.op\` extension, and target absence; do not run shell preflights.
- In PTC/Code Mode, invoke every native tool — including skill loading, task-list updates, pipeline tools, and \`read_image\` — from inside one \`run_code\` program. Do not first attempt the same tool directly. Preserve the first begin result; if a composite program selected only part of it, call pipeline context \`get_design_agent_prompt\` with no arguments to recover the stored brief instead of calling begin again.
- The begin result already contains the matched native prompt, editor state, style tags, and variables. Normally use only three additional context calls before the skeleton: one product guideline, one \`get_style_guide({tags:[...], platform:"mobile"|"webapp"|"landing-page"|"slides"})\`, and one bounded \`list_ui_kits\` query. Do not fetch the same context twice.
- Treat the skill, begin result, and native tool results as authoritative. Do not inspect plugin/vendor/runtime source, generated assets, font directories, or lint implementation during an ordinary design run. A tool failure should be reported through its bounded diagnostic and retried only when the contract says it is retryable.
- Successful batch results deliberately return bindings, native quality, and compact layout diagnostics rather than the whole layout tree. Request full layout only when a diagnostic needs geometry; use the mandatory PNG checkpoints to judge appearance.
- Repair concrete diagnostics, but do not optimize against informational lint heuristics or reverse-engineer their detector. Informational lint is visible evidence, not a publication blocker.

## Style Fingerprint and Anti-Slop

- Name the direction before creating nodes (for example, “warm editorial field notes”, not “modern clean UI”). Make the palette, typography, radii, elevation, and density express that direction.
- Avoid the repeated initial-letter logo, floating white form card, bright purple/blue CTA, and evenly stacked generic modules unless the brief asks for them.
- Use at most two saturated colors, real product copy, strong negative space, a clear type hierarchy, and one distinctive but restrained visual moment.
- For CJK, default to OpenPencil's portable \`system-ui\`, line height at least 1.3, and zero letter spacing. Use a named Noto/PingFang/YaHei family only when the editor context or user confirms it is installed.
- Use real \`icon_font\` glyphs or a known \`K()\` component. Never use emoji, initials, or Unicode symbols as interface icons.
- Brand providers use the lazy-loaded brand catalog with both fields present: WeChat is \`{type:"icon_font", iconFontFamily:"simple-icons", iconFontName:"wechat"}\` and Apple is \`{type:"icon_font", iconFontFamily:"simple-icons", iconFontName:"apple"}\`. Putting \`simple-icons:…\` entirely in \`iconFontName\`, or using Lucide's fruit \`apple\`, renders the wrong glyph. An equivalent authored SVG \`path\` must carry \`iconId:"simple-icons:wechat"\` or \`iconId:"simple-icons:apple"\` so diagnostics can verify its identity.

## Native Interactive Controls

New designs must emit first-class \`text_input\`, \`text_area\`, \`select\`, \`switch\`, \`checkbox\`, \`slider\`, \`number_input\`, \`progress\`, \`tabs\`, and \`radio_group\` nodes. Do not draw frame/rectangle/text lookalikes.

- Every native control declares intentional width and height plus explicit design-system \`fill\`, \`stroke: { thickness, fill: [...] }\`, and \`cornerRadius\`.
- Every stacked \`text_input\` and \`select\` uses \`width: "fill_container"\` and an explicit 44–52 px height (normally 48). A multiline \`text_area\` is also full width but uses an intentional 96–160 px height.
- Text inputs/areas include \`value\` and an intentional \`placeholder\`; selects/radio groups include \`options\` and \`value\`; switches/checkboxes include explicit \`checked\`.
- A password \`text_input\` explicitly sets \`secure: true\`; a trailing eye glyph is presentation, not secure-entry semantics.
- Buttons are 44–52 px high. Paired controls are true twins: same dimensions, radius, and icon size.

## Minimal Executable Shape

\`\`\`js
const root = I(null, { type: "frame", name: "Account", width: 390, height: 844, layout: "vertical", gap: 24, padding: 20, fill: [{ type: "solid", color: "#F7F1E7" }] });
const form = I(root, { type: "frame", width: "fill_container", height: "fit_content", layout: "vertical", gap: 16 });
I(form, { type: "text_input", value: "", placeholder: "name@studio.com", leadingIcon: "mail", width: "fill_container", height: 48, fill: [{ type: "solid", color: "#FFFDF8" }], stroke: { thickness: 1, fill: [{ type: "solid", color: "#C8D1C9" }] }, cornerRadius: 12 });
\`\`\`
`
}

export function createDshDesignSkill(upstreamMarkdown) {
  if (typeof upstreamMarkdown !== 'string' || upstreamMarkdown.length < 10_000) {
    fail('upstream SKILL.md is missing or unexpectedly small')
  }
  requireSentinel(upstreamMarkdown, 'name: openpencil-design', 'upstream SKILL.md')
  requireSentinel(upstreamMarkdown, '### Common Properties', 'upstream SKILL.md')
  requireSentinel(upstreamMarkdown, 'Roles declare intent', 'upstream SKILL.md')
  requireSentinel(upstreamMarkdown, 'NEVER set x/y on children inside layout containers', 'upstream SKILL.md')
  requireSentinel(upstreamMarkdown, 'No emoji as icons.', 'upstream SKILL.md')
  validateSingleHeadings(upstreamMarkdown)

  const schema = adaptSchema(section(upstreamMarkdown, '## PenNode Schema', '## Semantic Roles'))
  const roles = section(upstreamMarkdown, '## Semantic Roles', '## Layout Rules')
  const layout = section(upstreamMarkdown, '## Layout Rules', '## Design Principles')
  const principles = adaptDesignPrinciples(section(upstreamMarkdown, '## Design Principles', '## Layered Workflow'))
  const output = [
    dshPrefix().trimEnd(),
    schema,
    roles,
    layout,
    principles,
    commonPatterns(),
    commonMistakes(),
    '',
  ].join('\n\n')

  for (const required of [
    'openpencil_pipeline_begin',
    'openpencil_pipeline_context',
    'openpencil_pipeline_batch',
    'openpencil_pipeline_inspect',
    'openpencil_pipeline_finish',
    'openpencil_pipeline_abort',
    'designAgentPrompt',
    'read_image',
    'createIfAbsent',
    'openpencil_new',
    'sandboxed QuickJS',
    'I(null, node)',
    'K(kitId, parent, overrides)',
    'style fingerprint',
    'It is not an aesthetic generator',
    'type: "text_input"',
    'width: "fill_container"',
    'height: 48',
    '### Form Input',
    '## PenNode Schema',
    '## Semantic Roles',
    '## Layout Rules',
    '## Design Principles',
    '## Common Patterns',
    '## Common Mistakes',
  ]) requireSentinel(output, required, 'generated DSH skill')

  const banned = [
    /\bop\s+(?:start|stop|status|open|save|get|selection|read-nodes|layout|find-space|insert|update|delete|move|copy|replace|design|page|vars|themes|codegen)/i,
    /design:refine/i,
    /--post-process/i,
    /Quick Reference.*CLI/i,
  ]
  for (const pattern of banned) {
    if (pattern.test(output)) fail(`generated DSH skill retained banned upstream workflow ${pattern}`)
  }
  return output
}

function validateAuxiliarySkills({ form, components, antiSlop }) {
  for (const sentinel of [
    'Inputs: height 44px',
    'width="fill_container" in forms',
    'Buttons: height 44-52px',
    'NEVER use emoji as icons',
  ]) requireSentinel(form, sentinel, 'form-ui.md')
  for (const sentinel of [
    'Emit the native node directly through `I(parent, {...})`',
    'Every native control MUST explicitly carry `fill`, `stroke`, and',
    '`cornerRadius`',
    '`text_input`, `text_area`',
  ]) requireSentinel(components, sentinel, 'jian-components.md')
  for (const sentinel of [
    'ANTI-SLOP RULES',
    'Creative Variation',
    'Typography personality shift',
  ]) requireSentinel(antiSlop, sentinel, 'anti-slop.md')
}

export async function buildDesignSkill(options = {}) {
  const bundlePath = resolve(options.bundlePath ?? DEFAULT_BUNDLE_PATH)
  const formPath = resolve(options.formPath ?? DEFAULT_FORM_SKILL_PATH)
  const componentPath = resolve(options.componentPath ?? DEFAULT_COMPONENT_SKILL_PATH)
  const antiSlopPath = resolve(options.antiSlopPath ?? DEFAULT_ANTI_SLOP_SKILL_PATH)
  const outputPath = resolve(options.outputPath ?? DEFAULT_OUTPUT_PATH)
  let bundle
  try {
    bundle = JSON.parse(await readFile(bundlePath, 'utf8'))
  } catch (error) {
    fail(`cannot read upstream bundle ${bundlePath}: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (bundle?.version !== '__OPENPENCIL_VERSION__') {
    fail('upstream bundle version sentinel changed')
  }
  const upstreamMarkdown = bundle?.files?.[UPSTREAM_SKILL_KEY]
  if (typeof upstreamMarkdown !== 'string') fail(`upstream bundle has no ${UPSTREAM_SKILL_KEY}`)

  const [form, components, antiSlop] = await Promise.all([
    readFile(formPath, 'utf8'),
    readFile(componentPath, 'utf8'),
    readFile(antiSlopPath, 'utf8'),
  ]).catch(error => fail(`cannot read OpenPencil design contracts: ${error instanceof Error ? error.message : String(error)}`))
  validateAuxiliarySkills({ form, components, antiSlop })

  const content = createDshDesignSkill(upstreamMarkdown)
  await mkdir(dirname(outputPath), { recursive: true })
  const temporary = `${outputPath}.tmp-${process.pid}`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, outputPath)
  return { outputPath, bytes: Buffer.byteLength(content), content }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  const result = await buildDesignSkill()
  console.log(`built ${result.outputPath} (${result.bytes} bytes)`)
}
