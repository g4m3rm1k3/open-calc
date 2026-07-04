import { initialState } from "../labReducer";
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
    javascript: patch.javascript !== undefined ? patch.javascript : state.javascript,
    customCss: patch.customCss !== undefined ? patch.customCss : state.customCss,
  };
}

// A challenge step's `.patch` is the blank/scaffold shown when the student
// first arrives — but a LATER step that builds on top of it needs the
// *solved* version, or the lesson would silently regress once you pass a
// challenge and move on. `.solutionPatch` is what later steps fold in.
//
// Elements are MERGED, not replaced: a challenge's scaffold (e.g. a "Clear"
// button added by `patch.elements` for the student to wire up) still needs
// to exist in the solved state even though `solutionPatch` usually only
// specifies the new `javascript` — solving a challenge means adding to what
// was already on the page, not replacing it. Real incident: a later lesson
// chaining off a solved challenge lost that challenge's own scaffold button
// entirely, because solutionPatch never re-listed it and the lookup that
// used to just prefer solutionPatch wholesale dropped it silently.
function effectivePatch(step: LessonStep): LessonPatch {
  if (!step.isChallenge || !step.solutionPatch) return step.patch;
  const mergedElements = [...(step.patch.elements ?? []), ...(step.solutionPatch.elements ?? [])];
  return {
    ...step.solutionPatch,
    elements: mergedElements.length ? mergedElements : undefined,
  };
}

// ─── Cumulative step state ────────────────────────────────────────────────────

/** The state the student should SEE on arriving at `stepIndex` — prior steps
 *  folded as solved, this step shown as its own raw (possibly blank) patch. */
export function computeStateAtStep(lesson: Lesson, stepIndex: number): LabState {
  const upTo = Math.min(Math.max(stepIndex, 0), lesson.steps.length - 1);
  let state: LabState = { ...initialState };
  for (let i = 0; i < upTo; i++) {
    state = applyPatch(state, effectivePatch(lesson.steps[i]));
  }
  return applyPatch(state, lesson.steps[upTo].patch);
}

/** The state as if `stepIndex` (inclusive) were solved — used for "Skip to
 *  solution" and as the foundation the next step is computed on top of. */
export function computeSolvedStateAtStep(lesson: Lesson, stepIndex: number): LabState {
  const upTo = Math.min(Math.max(stepIndex, 0), lesson.steps.length - 1);
  let state: LabState = { ...initialState };
  for (let i = 0; i <= upTo; i++) {
    state = applyPatch(state, effectivePatch(lesson.steps[i]));
  }
  return state;
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
