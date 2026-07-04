import { applyPatch } from "./lessonEngine";
import type { LessonPatch, LabState } from "./lessonTypes";

// A step's patch reveals in a fixed number of ticks regardless of how much
// text it contains, so a one-line style tweak and a 40-line script both take
// roughly the same amount of time to "type" — long code doesn't drag playback
// out, short code doesn't flash by instantly.
const TEXT_REVEAL_TICKS = 14;

function chunkTargets(prev: string, target: string, ticks: number): string[] {
  if (prev === target) return [];
  // Only the appended/changed suffix is animated — if the student's prior
  // code is a prefix of the new target (the common case: a step adds to
  // existing JS), the shared prefix appears immediately and only the new
  // part reveals gradually.
  let shared = 0;
  const max = Math.min(prev.length, target.length);
  while (shared < max && prev[shared] === target[shared]) shared++;
  const fixed = target.slice(0, shared);
  const rest = target.slice(shared);
  if (!rest) return [target];
  const step = Math.max(1, Math.ceil(rest.length / ticks));
  const out: string[] = [];
  for (let i = step; i < rest.length; i += step) {
    out.push(fixed + rest.slice(0, i));
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
    for (const text of chunkTargets(state.customCss, patch.customCss, TEXT_REVEAL_TICKS)) {
      state = { ...state, customCss: text };
      frames.push(state);
    }
  }

  if (patch.javascript !== undefined) {
    for (const text of chunkTargets(state.javascript, patch.javascript, TEXT_REVEAL_TICKS)) {
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
