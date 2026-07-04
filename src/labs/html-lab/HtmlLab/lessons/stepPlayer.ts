import { applyPatch, type Fold } from "./lessonEngine";
import type { LessonPatch, LabState } from "./lessonTypes";

/** One step of "watch it get built" playback. `caption` and `revealedIds`
 *  are known directly from whatever was just applied — a lesson step's
 *  patch already says exactly what's new, so there's nothing to diff or
 *  guess after the fact. */
export interface PlaybackFrame {
  state: LabState;
  revealedIds: string[];
  caption: string;
}

function joinBlocks(blocks: Map<string, string>): string {
  return [...blocks.values()].join("\n\n");
}

/**
 * Ordered frames between `prevFold` and the fully-applied patch — one frame
 * per element inserted/restyled/removed, one per JS block, one per CSS
 * block, one per changed body style. The final frame's state always equals
 * folding `patch` onto `prevFold` in one shot; playback only changes how
 * the result is revealed; never the result itself.
 */
export function buildPlaybackFrames(prevFold: Fold, patch: LessonPatch): PlaybackFrame[] {
  const frames: PlaybackFrame[] = [];
  let state = prevFold.state;
  let jsBlocks = prevFold.blocks;
  let cssBlocks = prevFold.cssBlocks;

  if (patch.removeElementIds?.length) {
    for (const id of patch.removeElementIds) {
      const removedTag = state.elements.find((e) => e.id === id)?.tag ?? "element";
      state = applyPatch(state, { removeElementIds: [id] });
      frames.push({ state, revealedIds: [], caption: `Removing <${removedTag}>` });
    }
  }

  for (const el of patch.elements ?? []) {
    const isNew = !state.elements.some((e) => e.id === el.id);
    state = applyPatch(state, { elements: [el] });
    const parent = el.parentId ? state.elements.find((e) => e.id === el.parentId) : null;
    const where = parent ? ` inside <${parent.tag}>` : "";
    const caption = isNew ? `Adding <${el.tag}>${where}` : `Updating <${el.tag}>'s styles`;
    frames.push({ state, revealedIds: [el.id], caption });
  }

  for (const block of patch.jsBlocks ?? []) {
    jsBlocks = new Map(jsBlocks);
    jsBlocks.set(block.id, block.code);
    state = { ...state, javascript: joinBlocks(jsBlocks) };
    frames.push({ state, revealedIds: [], caption: describeCode(block.code, "Typing") });
  }

  for (const block of patch.cssBlocks ?? []) {
    cssBlocks = new Map(cssBlocks);
    cssBlocks.set(block.id, block.code);
    state = { ...state, customCss: joinBlocks(cssBlocks) };
    frames.push({ state, revealedIds: [], caption: describeCode(block.code, "Writing") });
  }

  // Legacy escape hatch for a single, self-contained snippet not worth
  // splitting into blocks — lands in one frame, no per-line animation.
  if (patch.javascript !== undefined && !patch.jsBlocks?.length) {
    state = { ...state, javascript: patch.javascript };
    frames.push({ state, revealedIds: [], caption: "Typing the JavaScript" });
  }
  if (patch.customCss !== undefined && !patch.cssBlocks?.length) {
    state = { ...state, customCss: patch.customCss };
    frames.push({ state, revealedIds: [], caption: "Writing the CSS" });
  }

  if (patch.bodyStyles) {
    for (const [prop, value] of Object.entries(patch.bodyStyles)) {
      if (state.bodyStyles[prop] === value) continue;
      state = { ...state, bodyStyles: { ...state.bodyStyles, [prop]: value } };
      frames.push({ state, revealedIds: [], caption: `Adjusting the page's ${prop}` });
    }
  }

  // A patch with nothing to reveal (shouldn't normally happen — every step
  // changes something) still needs to land on the target state.
  if (frames.length === 0) frames.push({ state: applyPatch(prevFold.state, patch), revealedIds: [], caption: "" });

  return frames;
}

function describeCode(code: string, verb: string): string {
  const firstLine = code.split("\n").find((l) => l.trim() !== "")?.trim() ?? "";
  const shown = firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
  return shown ? `${verb}: ${shown}` : `${verb} the code`;
}
