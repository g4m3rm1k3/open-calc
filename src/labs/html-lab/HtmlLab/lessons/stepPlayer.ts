import { applyPatch } from "./lessonEngine";
import type { LessonPatch, LabState } from "./lessonTypes";

// A JS/CSS reveal happens one LINE per frame — that's what makes it read as
// "typing it in" rather than a dump — capped at this many frames so a future
// pathologically long script can't drag playback out forever (every lesson
// today is well under the cap, so in practice it's always exactly one line
// per frame; only past the cap do multiple lines start batching together).
const MAX_TEXT_REVEAL_FRAMES = 16;

function chunkLines(prev: string, target: string, maxFrames: number): string[] {
  if (prev === target) return [];
  // Only the appended/changed lines are animated — if the student's prior
  // code's lines are an exact prefix of the new target's lines (the common
  // case: a step adds more JS below what's already there), those lines
  // appear immediately and only the new ones reveal gradually. Comparing
  // whole lines (not characters) means a fully-matching earlier line is
  // never re-typed just because a later line changed.
  const prevLines = prev === "" ? [] : prev.split("\n");
  const targetLines = target.split("\n");
  let sharedLines = 0;
  const maxShared = Math.min(prevLines.length, targetLines.length);
  while (sharedLines < maxShared && prevLines[sharedLines] === targetLines[sharedLines]) sharedLines++;
  const fixedLines = targetLines.slice(0, sharedLines);
  const restLines = targetLines.slice(sharedLines);
  if (restLines.length === 0) return [target];
  const batch = Math.max(1, Math.ceil(restLines.length / maxFrames));
  const out: string[] = [];
  for (let i = batch; i < restLines.length; i += batch) {
    out.push([...fixedLines, ...restLines.slice(0, i)].join("\n"));
  }
  out.push(target);
  return out;
}

/**
 * Ordered intermediate states between `prevState` and `applyPatch(prevState,
 * patch)` — one frame per element inserted/restyled, then chunked reveals for
 * javascript/customCss text growth, then one frame per changed body style.
 * The final frame always equals `applyPatch(prevState, patch)` exactly;
 * playback only changes how the result is revealed, never the result itself.
 */
export function buildPlaybackFrames(prevState: LabState, patch: LessonPatch): LabState[] {
  const frames: LabState[] = [];
  let state = prevState;

  if (patch.removeElementIds?.length) {
    state = applyPatch(state, { removeElementIds: patch.removeElementIds });
    frames.push(state);
  }

  for (const el of patch.elements ?? []) {
    state = applyPatch(state, { elements: [el] });
    frames.push(state);
  }

  if (patch.customCss !== undefined) {
    for (const text of chunkLines(state.customCss, patch.customCss, MAX_TEXT_REVEAL_FRAMES)) {
      state = { ...state, customCss: text };
      frames.push(state);
    }
  }

  if (patch.javascript !== undefined) {
    for (const text of chunkLines(state.javascript, patch.javascript, MAX_TEXT_REVEAL_FRAMES)) {
      state = { ...state, javascript: text };
      frames.push(state);
    }
  }

  if (patch.bodyStyles) {
    for (const [prop, value] of Object.entries(patch.bodyStyles)) {
      if (state.bodyStyles[prop] === value) continue;
      state = { ...state, bodyStyles: { ...state.bodyStyles, [prop]: value } };
      frames.push(state);
    }
  }

  // A patch with nothing to reveal (shouldn't normally happen — every step
  // changes something) still needs to land on the target state.
  if (frames.length === 0) frames.push(applyPatch(prevState, patch));

  return frames;
}

/** The element id(s) a frame transition touched, for driving a "just
 *  revealed" highlight — undefined for pure text/style frames. */
export function frameRevealedIds(prevFrame: LabState, frame: LabState): string[] {
  if (frame.elements === prevFrame.elements) return [];
  const prevIds = new Set(prevFrame.elements.map((e) => e.id));
  const changed = frame.elements.filter((e) => {
    const before = prevFrame.elements.find((p) => p.id === e.id);
    return !before || before !== e;
  });
  return changed.length ? changed.map((e) => e.id) : [...prevIds].filter((id) => !frame.elements.some((e) => e.id === id));
}

/**
 * A short, human-readable caption for what changed between two consecutive
 * playback frames — "Adding <nav>", "Typing the JavaScript", etc. Derived
 * entirely from the frame diff (same identity-comparison `frameRevealedIds`
 * already uses), so authoring a lesson never needs to write captions by hand.
 */
export function describeFrameTransition(prev: LabState, cur: LabState): string {
  if (cur.elements !== prev.elements) {
    const changed = cur.elements.filter((e) => {
      const before = prev.elements.find((p) => p.id === e.id);
      return !before || before !== e;
    });
    if (changed.length) {
      const el = changed[0];
      const isNew = !prev.elements.some((p) => p.id === el.id);
      const parent = el.parentId ? cur.elements.find((e) => e.id === el.parentId) : null;
      const where = parent ? ` inside <${parent.tag}>` : "";
      return isNew ? `Adding <${el.tag}>${where}` : `Updating <${el.tag}>'s styles`;
    }
    const removed = prev.elements.find((p) => !cur.elements.some((e) => e.id === p.id));
    if (removed) return `Removing <${removed.tag}>`;
  }
  if (cur.javascript !== prev.javascript) return "Typing the JavaScript";
  if (cur.customCss !== prev.customCss) return "Writing the CSS";
  if (cur.bodyStyles !== prev.bodyStyles) return "Adjusting the page's styles";
  return "";
}
