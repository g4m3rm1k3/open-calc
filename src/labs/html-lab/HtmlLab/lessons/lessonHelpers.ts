import type { Fold } from "./lessonEngine";
import type { LabElement, LessonPatch, MediaQuery } from "./lessonTypes";

// Shared by every lesson content file — a lesson is a plain data file, and
// this is the one place that shape gets built, so a new lesson never has to
// redefine it.
export function el(
  id: string,
  tag: string,
  parentId: string | null,
  order: number,
  content = "",
  attrs: Record<string, string> = {},
  styles: Record<string, string> = {},
  mediaQueries: MediaQuery[] = [],
): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "", ...attrs }, styles, mediaQueries };
}

/** The one place the `<lab>::<lessonId>` progress-key convention is spelled
 *  out — every reader (runner, catalog, entry switcher) calls this instead
 *  of rebuilding the string. */
export function lessonProgressKey(lessonId: string): string {
  return `html-lessons::${lessonId}`;
}

/**
 * Turns a previous lesson's finished `Fold` into the patch a "recap" step
 * hands off with — carrying forward not just the elements but the actual
 * named JS/CSS blocks, not their already-joined text. Seeding only
 * `jsFiles: fold.state.jsFiles` would look identical on screen but silently
 * reset the block bookkeeping to empty, so the very next `jsBlocks` addition
 * in the new lesson would replace the whole script instead of adding to it —
 * every lesson that continues another lesson's page should seed its first
 * step with this instead of hand-picking fields.
 */
export function foldToPatch(fold: Fold): LessonPatch {
  return {
    elements: fold.state.elements,
    bodyStyles: fold.state.bodyStyles,
    jsBlocks: [...fold.blocks].map(([id, code]) => ({ id, code })),
    cssBlocks: [...fold.cssBlocks].map(([id, code]) => ({ id, code })),
    pageTitle: fold.state.pageTitle,
    faviconUrl: fold.state.faviconUrl,
  };
}
