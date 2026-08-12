/**
 * @dsh-external/dsh-openpencil — preview `.op` design documents in DSH.
 *
 * Plugin lifecycle: register the model-facing tool plus signed routes for
 * exact PNGs, immutable document snapshots, and the optional read-only Web
 * SDK canvas. Everything is
 * registered through `ctx.effect` (or a returned disposer) so unloading the
 * plugin removes every contribution.
 *
 * The `design_render` tool never returns an ImageBlock — the DeepSeek
 * adapter rejects image blocks anywhere in a request. The browser-only
 * envelope rides `output.presentationMeta` into `ToolCallBlock.meta`, and
 * the keyed `tool.call.toolview` client component renders a PNG-first card
 * and lazily mounts the OpenPencil canvas on demand.
 * @module @dsh-external/dsh-openpencil
 */
import type { Context } from '@deepseek-ai/cordis';
/** Stable plugin name (the loader entry id in cordis.patch.yml). */
export declare const name = "@dsh-external/dsh-openpencil";
/** Services this plugin's root fiber requires. */
export declare const inject: string[];
/** Plugin entry: mount every model-facing contribution. */
export declare function apply(ctx: Context): Promise<() => void>;
