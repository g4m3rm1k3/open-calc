import { initialState, withMainJsCode } from "../labReducer";
import { generateExportHtml } from "../htmlSync";
import type {
  Lesson, LessonStep, LessonPatch, LabElement, LabState,
  ExpectedNode, BehaviorScript, Assertion, ValidationResult,
} from "./lessonTypes";

// ─── Patch application ────────────────────────────────────────────────────────

export function applyPatch(state: LabState, patch: LessonPatch): LabState {
  let elements = state.elements;
  if (patch.removeElementIds?.length) {
    const removeSet = new Set(patch.removeElementIds);
    elements = elements.filter((e) => !removeSet.has(e.id));
  }
  if (patch.elements?.length) {
    // Map preserves insertion order and does NOT move an existing key on
    // re-set, so restyling an element from an earlier step never reshuffles
    // it — only genuinely new ids get appended.
    const byId = new Map(elements.map((e) => [e.id, e]));
    for (const el of patch.elements) byId.set(el.id, el);
    elements = Array.from(byId.values());
  }
  return {
    ...state,
    elements,
    bodyStyles: patch.bodyStyles ? { ...state.bodyStyles, ...patch.bodyStyles } : state.bodyStyles,
    jsFiles: patch.javascript !== undefined ? withMainJsCode(state.jsFiles, patch.javascript) : state.jsFiles,
    customCss: patch.customCss !== undefined ? patch.customCss : state.customCss,
  };
}

// A running fold also carries the current *named* JS/CSS blocks (id -> code),
// separately from `state.jsFiles[0]`/`state.customCss` (which just hold their
// joined text) — upserting a block by id and re-joining is what lets a step
// change ONE handler or rule without the lesson author ever hand-typing the
// whole accumulated script/stylesheet as a single string. `LabState` itself
// has no concept of blocks (the rest of the app — the reducer, the code
// panel, the exporter — only ever deals in the plain joined strings, treating
// jsFiles[0] as "the main file"), so this bookkeeping lives here, in the
// lesson engine, and nowhere else.
export interface Fold {
  state: LabState;
  blocks: Map<string, string>;
  cssBlocks: Map<string, string>;
}

function upsertBlocks(blocks: Map<string, string>, entries: { id: string; code: string }[]): Map<string, string> {
  const next = new Map(blocks);
  for (const b of entries) next.set(b.id, b.code);
  return next;
}

function foldPatch(fold: Fold, patch: LessonPatch): Fold {
  const usesJsBlocks = !!patch.jsBlocks?.length;
  const usesCssBlocks = !!patch.cssBlocks?.length;
  let state = applyPatch(fold.state, {
    ...patch,
    javascript: usesJsBlocks ? undefined : patch.javascript,
    customCss: usesCssBlocks ? undefined : patch.customCss,
  });
  const blocks = usesJsBlocks ? upsertBlocks(fold.blocks, patch.jsBlocks!) : fold.blocks;
  const cssBlocks = usesCssBlocks ? upsertBlocks(fold.cssBlocks, patch.cssBlocks!) : fold.cssBlocks;
  if (usesJsBlocks) state = { ...state, jsFiles: withMainJsCode(state.jsFiles, [...blocks.values()].join("\n\n")) };
  if (usesCssBlocks) state = { ...state, customCss: [...cssBlocks.values()].join("\n\n") };
  return { state, blocks, cssBlocks };
}

// A challenge step's `.patch` is the blank/scaffold shown when the student
// first arrives — but a LATER step that builds on top of it needs the
// *solved* version, or the lesson would silently regress once you pass a
// challenge and move on. `.solutionPatch` is what later steps fold in.
//
// Elements and blocks are MERGED, not replaced: a challenge's scaffold
// (e.g. a "Clear" button added by `patch.elements`, for the student to wire
// up) still needs to exist in the solved state even though `solutionPatch`
// usually only specifies the new code — solving a challenge means adding to
// what was already there, not replacing it. Real incident: a later lesson
// chaining off a solved challenge lost that challenge's own scaffold button
// entirely, because solutionPatch never re-listed it and the lookup that
// used to just prefer solutionPatch wholesale dropped it silently.
function effectivePatch(step: LessonStep): LessonPatch {
  if (!step.isChallenge || !step.solutionPatch) return step.patch;
  const mergedElements = [...(step.patch.elements ?? []), ...(step.solutionPatch.elements ?? [])];
  const mergedJsBlocks = [...(step.patch.jsBlocks ?? []), ...(step.solutionPatch.jsBlocks ?? [])];
  const mergedCssBlocks = [...(step.patch.cssBlocks ?? []), ...(step.solutionPatch.cssBlocks ?? [])];
  return {
    ...step.solutionPatch,
    elements: mergedElements.length ? mergedElements : undefined,
    jsBlocks: mergedJsBlocks.length ? mergedJsBlocks : undefined,
    cssBlocks: mergedCssBlocks.length ? mergedCssBlocks : undefined,
  };
}

// ─── Cumulative step state ────────────────────────────────────────────────────

/** The fold (state + running JS block map) the student should SEE on
 *  arriving at `stepIndex` — prior steps folded as solved, this step shown
 *  as its own raw (possibly blank) patch. */
export function computeFoldAtStep(lesson: Lesson, stepIndex: number): Fold {
  const upTo = Math.min(Math.max(stepIndex, 0), lesson.steps.length - 1);
  let fold: Fold = { state: { ...initialState }, blocks: new Map(), cssBlocks: new Map() };
  for (let i = 0; i < upTo; i++) {
    fold = foldPatch(fold, effectivePatch(lesson.steps[i]));
  }
  return foldPatch(fold, lesson.steps[upTo].patch);
}

/** The state the student should SEE on arriving at `stepIndex` — see
 *  `computeFoldAtStep`. Most callers only need the state, not the block map. */
export function computeStateAtStep(lesson: Lesson, stepIndex: number): LabState {
  return computeFoldAtStep(lesson, stepIndex).state;
}

/** The fold as if `stepIndex` (inclusive) were solved — used for "Skip to
 *  solution" and as the foundation the next step (or the next LESSON, when
 *  chaining) is computed on top of. */
export function computeSolvedFoldAtStep(lesson: Lesson, stepIndex: number): Fold {
  const upTo = Math.min(Math.max(stepIndex, 0), lesson.steps.length - 1);
  let fold: Fold = { state: { ...initialState }, blocks: new Map(), cssBlocks: new Map() };
  for (let i = 0; i <= upTo; i++) {
    fold = foldPatch(fold, effectivePatch(lesson.steps[i]));
  }
  return fold;
}

/** The state as if `stepIndex` (inclusive) were solved — see
 *  `computeSolvedFoldAtStep`. Most callers only need the state, not the
 *  block map (which matters only for a NEXT step/lesson's own playback). */
export function computeSolvedStateAtStep(lesson: Lesson, stepIndex: number): LabState {
  return computeSolvedFoldAtStep(lesson, stepIndex).state;
}

// ─── HTML/CSS structural validation ───────────────────────────────────────────
// Checked by tag + a *subset* of style properties, not deep equality —
// properties the lesson doesn't care about shouldn't fail the check, and two
// students can reasonably add extra attributes/content beyond what's asked.

export function validateStructure(elements: LabElement[], expected: ExpectedNode[]): ValidationResult {
  const feedback: string[] = [];
  const roots = elements.filter((e) => !e.parentId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  compareLevel(roots, expected, "top level", elements, feedback);
  return { passed: feedback.length === 0, feedback };
}

function compareLevel(
  actual: LabElement[],
  expected: ExpectedNode[],
  where: string,
  allElements: LabElement[],
  feedback: string[],
): void {
  expected.forEach((exp, i) => {
    const act = actual[i];
    const at = `${where}, position ${i + 1}`;
    if (!act) {
      feedback.push(`Expected a <${exp.tag}> at ${at}, but there's nothing there.`);
      return;
    }
    if (act.tag !== exp.tag) {
      feedback.push(`Expected <${exp.tag}> at ${at}, found <${act.tag}>.`);
    }
    for (const [prop, value] of Object.entries(exp.styles ?? {})) {
      const actualValue = act.styles[prop];
      if (actualValue !== value) {
        feedback.push(`<${act.tag}> at ${at}: expected ${prop} to be "${value}", found "${actualValue ?? "(not set)"}".`);
      }
    }
    if (exp.children) {
      const kids = allElements.filter((e) => e.parentId === act.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      compareLevel(kids, exp.children, `<${act.tag}>'s children`, allElements, feedback);
    }
  });
}

// ─── JS behavioral validation ─────────────────────────────────────────────────
// Runs the student's actual code in a real (hidden, temporary) iframe and
// scripts an interaction, rather than diffing source text — two students can
// write correct, completely different-looking JS (a `for` loop vs.
// `.forEach`) and a text diff would wrongly fail one of them.
//
// The iframe needs both "allow-scripts" and "allow-same-origin" together —
// normally a sandbox anti-pattern, since combined they let framed content
// escape the sandbox — but this frame only ever runs the student's own
// locally-generated code (never third-party content), stays hidden
// off-screen, and is destroyed immediately after the check, so the relaxed
// same-origin access (needed to read `contentDocument` for assertions) has
// no realistic exposure.
export async function validateBehavior(
  elements: LabElement[],
  bodyStyles: Record<string, string>,
  customCss: string,
  javascript: string,
  script: BehaviorScript,
): Promise<ValidationResult> {
  const feedback: string[] = [];
  const html = generateExportHtml(elements, bodyStyles, customCss, javascript, []);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.sandbox.add("allow-scripts", "allow-same-origin");
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const doc = iframe.contentDocument;
    if (!doc) {
      return { passed: false, feedback: ["Could not run your code to check it — try again."] };
    }

    for (const step of script.interactions) {
      const el = doc.querySelector(step.selector);
      if (!el) {
        feedback.push(`Could not find an element matching "${step.selector}" to interact with.`);
        continue;
      }
      if (step.action === "click") {
        (el as HTMLElement).click();
      } else {
        (el as HTMLInputElement).value = step.value ?? "";
        el.dispatchEvent(new Event(step.action, { bubbles: true }));
      }
    }

    for (const a of script.assertions) {
      const el = doc.querySelector(a.selector);
      if (!el) {
        feedback.push(`Expected to find an element matching "${a.selector}".`);
        continue;
      }
      const actual = readAssertedProperty(el, a.property, a.styleProp);
      if (actual.trim() !== a.expected.trim()) {
        feedback.push(`Expected "${a.selector}" ${a.property} to be "${a.expected}", found "${actual}".`);
      }
    }
  } finally {
    document.body.removeChild(iframe);
  }

  return { passed: feedback.length === 0, feedback };
}

function readAssertedProperty(el: Element, property: Assertion["property"], styleProp?: string): string {
  if (property === "style") return (el as HTMLElement).style.getPropertyValue(styleProp ?? "");
  if (property === "className") return el.className;
  if (property === "checked") return String((el as HTMLInputElement).checked);
  if (property === "value") return (el as HTMLInputElement).value;
  return el.textContent ?? "";
}
