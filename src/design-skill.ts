/** Bundled DSH playbook for creating deliberate OpenPencil designs. */

import { readFileSync } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'

export const OPENPENCIL_DESIGN_SKILL_NAME = 'openpencil-design'

export const OPENPENCIL_DESIGN_SKILL_DESCRIPTION =
  'Create production-quality OpenPencil .op interfaces in DSH with the complete native '
  + 'openpencil_pipeline_* workflow: context, skeleton-first batches, quality/layout feedback, '
  + 'post-final visual inspection, and atomic publication.'

export const OPENPENCIL_DESIGN_SKILL_WHEN_TO_USE =
  'Any request to create a new .op design, especially forms, login and signup '
  + 'screens, mobile UI, dashboards, landing pages, or work that needs a deliberate visual system.'

export const OPENPENCIL_DESIGN_SKILL_CONTENT = readFileSync(
  new URL('./assets/openpencil-design/SKILL.md', import.meta.url),
  'utf8',
)

export const OPENPENCIL_DESIGN_GUIDANCE_SECTION = {
  name: 'openpencil:design-skill-guidance',
  order: 130,
  text: () => 'For a new OpenPencil design, load the bundled `openpencil-design` skill and use '
    + '`openpencil_pipeline_begin` → context/style resolution → skeleton-first '
    + '`openpencil_pipeline_batch` calls → mandatory intermediate screenshot/read_image checkpoints → layout/quality inspection → native finalization → '
    + 'a post-final `openpencil_pipeline_inspect(kind:"screenshot")` visual read → '
    + '`openpencil_pipeline_finish`. The begin result carries OpenPencil\'s complete native '
    + 'design-agent prompt; follow it as the authoritative design contract. Repair every diagnostic '
    + 'and visible defect before atomic publication. Call begin without shell preflight, keep context '
    + 'resolution bounded, and do not inspect plugin/vendor/runtime source during ordinary generation. '
    + 'In PTC/Code Mode invoke skill, pipeline, task-list, and read_image tools inside run_code only. '
    + '`openpencil_new` is only a compatibility '
    + 'fast path for an explicitly requested simple one-shot draft, not the default quality pipeline.',
} as const

interface SkillService {
  register(skill: {
    name: string
    description: string
    whenToUse?: string
    content: string
    source: string
  }): () => void
}

interface SystemPromptService {
  section(section: {
    name: string
    order: number
    text: () => string
  }): () => void
}

interface DisposableFiber {
  dispose(): unknown
}

function disposeFiber(fiber: unknown): void {
  if (typeof fiber !== 'object' || fiber === null || !('dispose' in fiber)) return
  const dispose = (fiber as DisposableFiber).dispose
  if (typeof dispose === 'function') void dispose.call(fiber)
}

/** Register the playbook only when the profile provides DSH's skill service. */
export function registerOpenPencilDesignSkill(ctx: Context): () => void {
  const fiber = ctx.inject(['skills'], skillCtx => {
    const skills = (skillCtx as Context & { skills?: SkillService }).skills
    // Defensive for lightweight host mocks that invoke every optional inject
    // callback with the same partial context.
    if (typeof skills?.register !== 'function') return
    skillCtx.effect(() => skills.register({
      name: OPENPENCIL_DESIGN_SKILL_NAME,
      description: OPENPENCIL_DESIGN_SKILL_DESCRIPTION,
      whenToUse: OPENPENCIL_DESIGN_SKILL_WHEN_TO_USE,
      content: OPENPENCIL_DESIGN_SKILL_CONTENT,
      source: 'bundled',
    }), 'dsh-openpencil:design-skill')
  })
  return () => disposeFiber(fiber)
}

/** Add a short reminder; the detailed contract remains in the on-demand skill. */
export function registerOpenPencilDesignGuidance(ctx: Context): () => void {
  const fiber = ctx.inject(['systemPrompt'], promptCtx => {
    const systemPrompt = (promptCtx as Context & { systemPrompt?: SystemPromptService }).systemPrompt
    if (typeof systemPrompt?.section !== 'function') return
    promptCtx.effect(
      () => systemPrompt.section(OPENPENCIL_DESIGN_GUIDANCE_SECTION),
      'dsh-openpencil:design-skill-guidance',
    )
  })
  return () => disposeFiber(fiber)
}
