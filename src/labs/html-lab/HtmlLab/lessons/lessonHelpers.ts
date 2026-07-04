import type { LabElement } from "./lessonTypes";

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
): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "", ...attrs }, styles, mediaQueries: [] };
}

/** The one place the `<lab>::<lessonId>` progress-key convention is spelled
 *  out — every reader (runner, catalog, entry switcher) calls this instead
 *  of rebuilding the string. */
export function lessonProgressKey(lessonId: string): string {
  return `html-lessons::${lessonId}`;
}
