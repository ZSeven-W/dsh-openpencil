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

test('generated skill retains upstream design knowledge and teaches the complete DSH draft pipeline', async () => {
  const onDisk = await readFile(DEFAULT_OUTPUT_PATH, 'utf8')
  assert.equal(OPENPENCIL_DESIGN_SKILL_CONTENT, onDisk)
  assert.equal(OPENPENCIL_DESIGN_SKILL_NAME, 'openpencil-design')

  for (const section of [
    '## DSH Workflow',
    '## Style Fingerprint and Anti-Slop',
    '## Native Interactive Controls',
    '## PenNode Schema',
    '## Semantic Roles',
    '## Layout Rules',
    '## Design Principles',
    '## Common Patterns',
    '### Navbar',
    '### Hero',
    '### Feature Card',
    '### Form Input',
    '### Footer',
    '## Common Mistakes',
  ]) assert.match(onDisk, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  for (const tool of [
    'openpencil_pipeline_begin',
    'openpencil_pipeline_context',
    'openpencil_pipeline_batch',
    'openpencil_pipeline_inspect',
    'openpencil_pipeline_finish',
    'openpencil_pipeline_abort',
  ]) assert.match(onDisk, new RegExp(tool))
  assert.match(onDisk, /complete native design-agent prompt/i)
  assert.match(onDisk, /skeleton-first|empty semantic section shells/i)
  assert.match(onDisk, /one semantic section per subsequent script batch/i)
  assert.match(onDisk, /Every batch forces post-processing/i)
  assert.match(onDisk, /post-final screenshot/i)
  assert.match(onDisk, /read_image/)
  assert.match(onDisk, /createIfAbsent/)
  assert.match(onDisk, /openpencil_new.*compatibility fast path/is)
  assert.match(onDisk, /not the default for quality-sensitive design work/i)
  assert.match(onDisk, /sandboxed QuickJS/)
  assert.match(onDisk, /I\(null, node\)/)
  assert.match(onDisk, /K\(kitId, parent, overrides\)/)
  assert.match(onDisk, /style fingerprint/i)
  assert.match(onDisk, /not an aesthetic generator/i)
  assert.match(onDisk, /requests editor auto-open only when.*surface is idle/i)
  assert.match(onDisk, /any mutation invalidates the old visual proof/i)
  assert.match(onDisk, /type: "text_input"/)
  assert.match(onDisk, /text_input.*text_area.*select/s)
  assert.match(onDisk, /width: "fill_container"/)
  assert.match(onDisk, /44–52 px/)
  assert.match(onDisk, /text_area.*96–160 px/s)
  assert.match(onDisk, /explicit design-system `fill`, `stroke: \{ thickness, fill: \[\.\.\.\] \}`, and `cornerRadius`/)
  assert.match(onDisk, /icon_font.*real glyph/s)
  assert.match(onDisk, /\n### Icons\n/)
  assert.match(onDisk, /Display:\s+40-56px/)
  assert.match(onDisk, /CJK: default to `"system-ui"`/)
  assert.match(onDisk, /Use a named Noto\/PingFang\/YaHei family only when.*confirms it is installed/s)
  assert.doesNotMatch(onDisk, /CJK: use `"Noto Sans SC\/JP\/KR"`/)
  assert.match(onDisk, /Cards in horizontal row: ALL/)

  assert.doesNotMatch(onDisk, /\bop\s+(?:start|insert|design|open|save|page|vars|codegen)/i)
  assert.doesNotMatch(onDisk, /design:refine|--post-process|Quick Reference.*CLI/i)
  assert.doesNotMatch(onDisk, /\bMCP\b|standalone MCP server|path icons will NOT resolve/i)
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
  assert.match(harness.registeredSkills[0].description, /openpencil_pipeline/)
  assert.match(harness.registeredSkills[0].whenToUse, /login and signup/)

  assert.equal(harness.promptSections.length, 1)
  assert.equal(harness.promptSections[0], OPENPENCIL_DESIGN_GUIDANCE_SECTION)
  assert.equal(harness.promptSections[0].name, 'openpencil:design-skill-guidance')
  assert.equal(harness.promptSections[0].order, 130)
  assert.match(harness.promptSections[0].text(), /load the bundled `openpencil-design` skill/)
  assert.match(harness.promptSections[0].text(), /openpencil_pipeline_begin.*openpencil_pipeline_batch/s)
  assert.match(harness.promptSections[0].text(), /post-final.*screenshot/s)
  assert.match(harness.promptSections[0].text(), /openpencil_new.*compatibility fast path/s)

  disposeGuidance()
  disposeSkill()
  assert.deepEqual(harness.counts(), {
    skillRemovalCount: 1,
    promptRemovalCount: 1,
    fiberDisposeCount: 2,
  })
})
