/** Bundled DSH playbook for creating deliberate OpenPencil designs. */

import { readFileSync } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'

export const OPENPENCIL_DESIGN_SKILL_NAME = 'openpencil-design'

export const OPENPENCIL_DESIGN_SKILL_DESCRIPTION =
  'Fast DSH adapter for creating production-quality OpenPencil .op interfaces with a live canvas, '
  + 'a few substantial native batches, visual verification, and atomic publication.'

export const OPENPENCIL_DESIGN_SKILL_WHEN_TO_USE =
  'Any request to create a new .op design, including ordinary pages, dashboards, landing pages, '
  + 'forms, and explicitly requested mobile interfaces.'

export const OPENPENCIL_DESIGN_SKILL_CONTENT = readFileSync(
  new URL('./assets/openpencil-design/SKILL.md', import.meta.url),
  'utf8',
)

export const OPENPENCIL_DESIGN_GUIDANCE_SECTION = {
  name: 'openpencil:design-skill-guidance',
  order: 130,
  text: () => 'For a new OpenPencil design, load `openpencil-design` and call '
    + '`openpencil_pipeline_begin` once. Its compact canvas and buildContract are the authoritative run contract matched to the native runtime; never '
    + 'refetch startup context or request the full native prompt during ordinary generation. An unqualified page defaults to '
    + 'web/desktop, while mobile is chosen only when the user explicitly says mobile, phone, iOS, '
    + 'Android, 移动, or 手机. Begin immediately without a task list, then use a few substantial '
    + '`openpencil_pipeline_batch` calls while the live canvas is open. The first batch is strictly the fixed root plus 4-8 empty named top-level frame shells, at most 10 I calls total, with no text, icon, image, control, or nested content; return immediately, then populate those shells. The wrapper verifies the begin canvas width and does not add full quality/layout reads after every healthy batch. Always generate one useful draft screenshot for the user, run '
    + 'native finalize, and always generate the required distinct post-final screenshot. Use `read_image` only when the current model supports image input; after one explicit unsupported-image error, do not retry or inspect source, and continue with native gates while honestly stating that model visual review was unavailable. Repair if needed, then '
    + 'finish for atomic publication. Do not repeat context/style lookups or inspect source during '
    + 'ordinary generation. The current native contract always wins over adapter assumptions.',
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
