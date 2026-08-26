import { readFile, mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const DEFAULT_BUNDLE_PATH = resolve(
  root,
  'vendor/openpencil/crates/op-cli/assets/skill-bundle.json',
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

function thinDshAdapter() {
  return `---
name: openpencil-design
description: Fast DSH adapter for native OpenPencil generation with a live canvas, substantial batches, visual verification, and atomic publication.
---

# OpenPencil Design in DSH

This is a thin host adapter, not a second design manual. The compact result of \`openpencil_pipeline_begin\` is the authoritative run contract. It is intentionally small so ordinary design work can begin without injecting a second native manual.

## Fast Default Path

1. Start immediately. Choose a new workspace-relative \`.op\` path and call \`openpencil_pipeline_begin({path, brief})\` once. Do not run a shell preflight, create an eight-item task list, spawn helper agents, or inspect plugin/runtime source for an ordinary design request. The live canvas opens from this result; continue building while the user watches it.
2. Resolve platform from explicit user language. An unqualified page, homepage, dashboard, form, or screen defaults to **web/desktop**. Use a mobile canvas only when the request explicitly says \`mobile\`, \`phone\`, \`iOS\`, \`Android\`, \`移动\`, or \`手机\`.
3. Preserve the complete begin result as one compact authoritative run contract. Its \`canvas\` and \`buildContract\` fields contain the executable, runtime-matched node and QuickJS rules needed for the first batch. Do not re-read fields already returned by begin, and do not fetch variables, schema, or the full native prompt as a ritual. Only when a genuinely missing named guideline/kit is required, or the user explicitly asks for one, make one targeted \`openpencil_pipeline_context\` call and consume it once.
4. Make the first \`openpencil_pipeline_batch({script})\` a strict fast-live-canvas checkpoint: create exactly the fixed-size root specified by \`canvas\` plus **4–8 empty named top-level frame shells** directly under it. Use at most **10 \`I(...)\` calls total**. Do not create text, icons, images, paths, controls, components, nested frames, inline children, or any other content, and do not use \`K(...)\` or \`G(...)\`. Return immediately after the empty shells appear; populate them in later batches. The wrapper supplies and verifies the authoritative canvas width. A normal page should still take about **2–4 substantial batches**: fast skeleton, primary content, optional secondary content, and concrete repair. Do not split every card or label into its own batch.
5. After primary composition, always call \`openpencil_pipeline_inspect({kind:"screenshot"})\` so the user receives an exact PNG preview. Only when the current model supports image input, open it with \`read_image\` and repair visible defects. If one call explicitly reports that image input is unsupported, do not retry and do not inspect source or schema; continue with native quality/finalize gates and state honestly that model visual review was unavailable. Use numeric inspection only for a concrete diagnostic.
6. Call \`openpencil_pipeline_finish\` to finalize, then always generate its required distinct post-final screenshot user preview. Apply the same optional \`read_image\` rule. A repair requires another finalize and fresh screenshot; otherwise finish again for atomic \`createIfAbsent\` publication.
7. On cancellation, call \`openpencil_pipeline_abort\`. Do not create a second \`openpencil_render\` card for a pipeline result.

## Native Context Is Authoritative

Follow the begin \`buildContract\` and native schema exactly. They provide runtime-matched node and QuickJS rules without the full native manual. Do not invent fonts, themes, platforms, or requirements; the user's brief and current native contract win.

## Substantial Batch Rules

- \`script\` runs in the pipeline's sandboxed QuickJS, not in DSH's outer code runtime. Create the root with \`I(null, node)\`, capture every \`I()\` return value, and pass that binding as the parent of descendants created in the same script.
- Use \`K(kitId, parent, overrides)\` only with a real kit id supplied by native context. In later batches, refer to an existing shell only by the exact quoted node id returned by the pipeline; never invent an id or use a display name as an id.
- \`padding\` accepts only a number, \`[vertical, horizontal]\`, or \`[top, right, bottom, left]\`; never pass a padding object. Native control \`leadingIcon\` and \`trailingIcon\` fields accept only glyph-name strings such as \`"mail"\` or \`"eye"\`, never objects or icon nodes.
- Prefer one coherent script per meaningful page region over many tiny calls. OpenPencil post-processing already runs after every batch. The wrapper returns native batch diagnostics and verifies the root canvas contract without automatically running full quality/layout inspections after every step. Repair concrete failures and move on when it is clean.
- Do not call full layout, quality, style-guide, variables, or editor-state reads between healthy batches. A screenshot is the useful appearance checkpoint; numeric inspection is for targeted debugging.

## Live Canvas and Visual Proof

The sidebar canvas should open at begin and stay attached to the same private draft, so each batch becomes visible without waiting for publication. Do not stop to narrate internal planning while the canvas is empty. Create the skeleton first, then keep it moving.

The live canvas is not model vision. Always generate draft and post-final PNG user previews. When image input is supported, check their hierarchy, clipping, spacing, typography, controls, icons, contrast, image treatment, and legibility; otherwise follow the non-retry rule above.

## Publication Gate

\`openpencil_pipeline_finish\` owns native finalize, lint, layout, freshness, and atomic publication. Its gate is intentionally two-phase: finalize, always generate a new user screenshot, then finish again; visually inspect only when supported. Any mutation invalidates that proof. Intentional \`emptyShells\` hints such as spacers/dividers remain observational and do not alone block publication; every other native diagnostic still blocks.

\`openpencil_new\` remains a compatibility path only when the user explicitly asks for a simple one-shot draft. Ordinary generated designs use the live pipeline above.
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

  const output = `${thinDshAdapter().trimEnd()}\n`

  for (const required of [
    'openpencil_pipeline_begin',
    'openpencil_pipeline_context',
    'openpencil_pipeline_batch',
    'openpencil_pipeline_inspect',
    'openpencil_pipeline_finish',
    'openpencil_pipeline_abort',
    'read_image',
    'createIfAbsent',
    'openpencil_new',
    'sandboxed QuickJS',
    'I(null, node)',
    'K(kitId, parent, overrides)',
    'compact authoritative run contract',
    'buildContract',
    'web/desktop',
    '2–4 substantial batches',
    'live canvas',
    'post-final',
  ]) requireSentinel(output, required, 'generated DSH skill')

  const banned = [
    /\bop\s+(?:start|stop|status|open|save|get|selection|read-nodes|layout|find-space|insert|update|delete|move|copy|replace|design|page|vars|themes|codegen)/i,
    /design:refine/i,
    /--post-process/i,
    /Quick Reference.*CLI/i,
    /set_variables|set_themes/i,
    /Noto Sans|PingFang|YaHei|system-ui/i,
  ]
  for (const pattern of banned) {
    if (pattern.test(output)) fail(`generated DSH skill retained banned upstream workflow ${pattern}`)
  }
  return output
}

export async function buildDesignSkill(options = {}) {
  const bundlePath = resolve(options.bundlePath ?? DEFAULT_BUNDLE_PATH)
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
