import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  DEFAULT_BUNDLE_PATH,
  DEFAULT_OUTPUT_PATH,
  buildDesignSkill,
  createDshDesignSkill,
} from '../scripts/build-design-skill.mjs'
import {
  OPENPENCIL_DESIGN_GUIDANCE_SECTION,
  OPENPENCIL_DESIGN_SKILL_CONTENT,
  OPENPENCIL_DESIGN_SKILL_NAME,
  registerOpenPencilDesignGuidance,
  registerOpenPencilDesignSkill,
} from '../lib/design-skill.js'

test('generated skill is a thin, direct adapter over the authoritative native draft context', async () => {
  const onDisk = await readFile(DEFAULT_OUTPUT_PATH, 'utf8')
  assert.equal(OPENPENCIL_DESIGN_SKILL_CONTENT, onDisk)
  assert.equal(OPENPENCIL_DESIGN_SKILL_NAME, 'openpencil-design')

  for (const section of [
    '## Fast Default Path',
    '## Native Context Is Authoritative',
    '## Substantial Batch Rules',
    '## Live Canvas and Visual Proof',
    '## Publication Gate',
  ]) assert.match(onDisk, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  for (const tool of [
    'openpencil_pipeline_begin',
    'openpencil_pipeline_context',
    'openpencil_pipeline_batch',
    'openpencil_pipeline_inspect',
    'openpencil_pipeline_finish',
    'openpencil_pipeline_abort',
  ]) assert.match(onDisk, new RegExp(tool))
  assert.match(onDisk, /compact authoritative run contract/i)
  assert.match(onDisk, /canvas.*buildContract/is)
  assert.match(onDisk, /runtime-matched node and QuickJS rules/i)
  assert.match(onDisk, /Do not re-read fields already returned by begin/i)
  assert.match(onDisk, /do not fetch variables, schema, or the full native prompt as a ritual/i)
  assert.doesNotMatch(onDisk, /get_design_agent_prompt/i)
  assert.match(onDisk, /defaults to \*\*web\/desktop\*\*/i)
  assert.match(onDisk, /only when the request explicitly says.*mobile.*phone.*iOS.*Android.*移动.*手机/is)
  assert.match(onDisk, /first.*batch.*4–8 empty named top-level frame shells/is)
  assert.match(onDisk, /at most \*\*10.*I\(\.\.\.\).*calls total/is)
  assert.match(onDisk, /Do not create text, icons, images, paths, controls, components, nested frames, inline children/is)
  assert.match(onDisk, /Return immediately after the empty shells appear; populate them in later batches/i)
  assert.match(onDisk, /padding.*only a number.*\[vertical, horizontal\].*\[top, right, bottom, left\].*never pass a padding object/is)
  assert.match(onDisk, /leadingIcon.*trailingIcon.*only glyph-name strings.*never objects or icon nodes/is)
  assert.match(onDisk, /2–4 substantial batches/i)
  assert.match(onDisk, /Do not split every card or label into its own batch/i)
  assert.match(onDisk, /wrapper supplies and verifies the authoritative canvas width/i)
  assert.match(onDisk, /without automatically running full quality\/layout inspections/i)
  assert.match(onDisk, /live canvas opens from this result/i)
  assert.match(onDisk, /post-final screenshot/i)
  assert.match(onDisk, /read_image/)
  assert.match(onDisk, /always call.*inspect.*screenshot.*user receives an exact PNG preview/is)
  assert.match(onDisk, /Only when the current model supports image input.*read_image/is)
  assert.match(onDisk, /explicitly reports that image input is unsupported.*do not retry.*do not inspect source or schema/is)
  assert.match(onDisk, /continue with native quality\/finalize gates.*state honestly that model visual review was unavailable/is)
  assert.match(onDisk, /Intentional.*emptyShells.*observational.*do not alone block publication/is)
  assert.match(onDisk, /every other native diagnostic still blocks/i)
  assert.match(onDisk, /createIfAbsent/)
  assert.match(onDisk, /openpencil_new.*compatibility path/is)
  assert.match(onDisk, /sandboxed QuickJS/)
  assert.match(onDisk, /I\(null, node\)/)
  assert.match(onDisk, /K\(kitId, parent, overrides\)/)
  assert.match(onDisk, /gate is intentionally two-phase/i)
  assert.match(onDisk, /Any mutation invalidates that proof/i)

  assert.doesNotMatch(onDisk, /\bop\s+(?:start|insert|design|open|save|page|vars|codegen)/i)
  assert.doesNotMatch(onDisk, /design:refine|--post-process|Quick Reference.*CLI/i)
  assert.doesNotMatch(onDisk, /\bMCP\b|standalone MCP server|path icons will NOT resolve/i)
  assert.doesNotMatch(onDisk, /set_variables|set_themes/i)
  assert.doesNotMatch(onDisk, /Noto Sans|PingFang|YaHei|system-ui/i)
  assert.doesNotMatch(onDisk, /designAgentPrompt/i)
  assert.doesNotMatch(onDisk, /## PenNode Schema|## Common Patterns|### Navbar|### Form Input/i)

  const bytes = Buffer.byteLength(onDisk, 'utf8')
  const estimatedTokens = Math.ceil([...onDisk].length / 4)
  assert.ok(bytes <= 7_500, `thin adapter grew to ${bytes} bytes`)
  assert.ok(estimatedTokens <= 1_600, `thin adapter grew to about ${estimatedTokens} tokens`)
})

test('build is deterministic and fails closed when the upstream contract drifts', async () => {
  const bundle = JSON.parse(await readFile(DEFAULT_BUNDLE_PATH, 'utf8'))
  const upstream = bundle.files['skills/openpencil-design/SKILL.md']
  const first = createDshDesignSkill(upstream)
  const second = createDshDesignSkill(upstream)
  assert.equal(first, second)
  assert.equal(first, await readFile(DEFAULT_OUTPUT_PATH, 'utf8'))

  const root = await mkdtemp(join(tmpdir(), 'dsh-openpencil-design-skill-'))
  try {
    const rebuiltPath = join(root, 'rebuilt', 'SKILL.md')
    const rebuilt = await buildDesignSkill({ outputPath: rebuiltPath })
    assert.equal(rebuilt.outputPath, rebuiltPath)
    assert.equal(await readFile(rebuiltPath, 'utf8'), first)

    const brokenPath = join(root, 'skill-bundle.json')
    const broken = structuredClone(bundle)
    broken.files['skills/openpencil-design/SKILL.md'] = upstream.replace('## Layout Rules', '## Layout Contract')
    await writeFile(brokenPath, JSON.stringify(broken), 'utf8')
    await assert.rejects(
      buildDesignSkill({ bundlePath: brokenPath, outputPath: join(root, 'SKILL.md') }),
      /Layout Rules count is 0|missing sentinel.*layout containers/i,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

function serviceHarness() {
  const injections = []
  const registeredSkills = []
  const promptSections = []
  let skillRemovalCount = 0
  let promptRemovalCount = 0
  let fiberDisposeCount = 0
  const ctx = {
    inject(names, install) {
      injections.push([...names])
      const effectDisposers = []
      const child = {
        ...(names.includes('skills') ? {
          skills: {
            register(skill) {
              registeredSkills.push(skill)
              return () => { skillRemovalCount += 1 }
            },
          },
        } : {}),
        ...(names.includes('systemPrompt') ? {
          systemPrompt: {
            section(section) {
              promptSections.push(section)
              return () => { promptRemovalCount += 1 }
            },
          },
        } : {}),
        effect(mount) {
          const dispose = mount()
          if (typeof dispose === 'function') effectDisposers.push(dispose)
          return dispose
        },
      }
      install(child)
      return {
        dispose() {
          fiberDisposeCount += 1
          for (const dispose of effectDisposers.reverse()) dispose()
        },
      }
    },
  }
  return {
    ctx,
    injections,
    registeredSkills,
    promptSections,
    counts: () => ({ skillRemovalCount, promptRemovalCount, fiberDisposeCount }),
  }
}

test('optional skill and system-prompt services register and tear down with their fibers', () => {
  const harness = serviceHarness()
  const disposeSkill = registerOpenPencilDesignSkill(harness.ctx)
  const disposeGuidance = registerOpenPencilDesignGuidance(harness.ctx)

  assert.deepEqual(harness.injections, [['skills'], ['systemPrompt']])
  assert.equal(harness.registeredSkills.length, 1)
  assert.deepEqual(
    {
      name: harness.registeredSkills[0].name,
      source: harness.registeredSkills[0].source,
      content: harness.registeredSkills[0].content,
    },
    {
      name: 'openpencil-design',
      source: 'bundled',
      content: OPENPENCIL_DESIGN_SKILL_CONTENT,
    },
  )
  assert.match(harness.registeredSkills[0].description, /Fast DSH adapter|live canvas/i)
  assert.match(harness.registeredSkills[0].whenToUse, /ordinary pages/)

  assert.equal(harness.promptSections.length, 1)
  assert.equal(harness.promptSections[0], OPENPENCIL_DESIGN_GUIDANCE_SECTION)
  assert.equal(harness.promptSections[0].name, 'openpencil:design-skill-guidance')
  assert.equal(harness.promptSections[0].order, 130)
  assert.match(harness.promptSections[0].text(), /load `openpencil-design`/)
  assert.match(harness.promptSections[0].text(), /openpencil_pipeline_begin.*openpencil_pipeline_batch/s)
  assert.match(harness.promptSections[0].text(), /post-final.*screenshot/s)
  assert.match(harness.promptSections[0].text(), /authoritative run contract/i)
  assert.match(harness.promptSections[0].text(), /defaults to web\/desktop/i)
  assert.match(harness.promptSections[0].text(), /without a task list/i)
  assert.match(harness.promptSections[0].text(), /first batch.*fixed root plus 4-8 empty named top-level frame shells.*at most 10 I calls.*no text, icon, image, control, or nested content/is)
  assert.match(harness.promptSections[0].text(), /Always generate one useful draft screenshot.*required distinct post-final screenshot/is)
  assert.match(harness.promptSections[0].text(), /read_image.*only when the current model supports image input.*unsupported-image error.*do not retry or inspect source/is)
  assert.doesNotMatch(harness.promptSections[0].text(), /task-list updates|set_variables|set_themes/i)

  disposeGuidance()
  disposeSkill()
  assert.deepEqual(harness.counts(), {
    skillRemovalCount: 1,
    promptRemovalCount: 1,
    fiberDisposeCount: 2,
  })
})
