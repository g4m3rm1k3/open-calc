// Unit tests for the pure parts of the lesson engine — patch folding and
// structural validation. `validateBehavior` runs real script execution
// inside a srcdoc iframe, which happy-dom doesn't reliably emulate, so it's
// covered by a live Playwright pass instead (see the plan's verification
// section), not here.

import { describe, it, expect } from "vitest";
import { applyPatch, computeStateAtStep, computeSolvedStateAtStep, validateStructure, validatePageMeta } from "./lessonEngine";
import { initialState, mainJsCode, withMainJsCode } from "../labReducer";
import type { Lesson, LabElement } from "./lessonTypes";

function el(id: string, tag: string, parentId: string | null, order: number, content = "", styles: Record<string, string> = {}, attrs: Record<string, string> = {}): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "", ...attrs }, styles, mediaQueries: [] };
}

describe("applyPatch", () => {
  it("appends new elements and preserves existing ones", () => {
    const state = { ...initialState, elements: [el("a", "div", null, 0)] };
    const next = applyPatch(state, { elements: [el("b", "p", null, 1)] });
    expect(next.elements.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("upserts by id — restyling an element from an earlier step doesn't duplicate or reorder it", () => {
    const state = { ...initialState, elements: [el("a", "div", null, 0), el("b", "p", null, 1)] };
    const next = applyPatch(state, { elements: [el("a", "div", null, 0, "", { color: "red" })] });
    expect(next.elements.map((e) => e.id)).toEqual(["a", "b"]);
    expect(next.elements[0].styles.color).toBe("red");
  });

  it("removes elements listed in removeElementIds", () => {
    const state = { ...initialState, elements: [el("a", "div", null, 0), el("b", "p", null, 1)] };
    const next = applyPatch(state, { removeElementIds: ["b"] });
    expect(next.elements.map((e) => e.id)).toEqual(["a"]);
  });

  it("replaces javascript wholesale when present, leaves it alone when absent", () => {
    const state = { ...initialState, jsFiles: withMainJsCode(initialState.jsFiles, "console.log(1)") };
    expect(mainJsCode(applyPatch(state, { javascript: "console.log(2)" }).jsFiles)).toBe("console.log(2)");
    expect(mainJsCode(applyPatch(state, {}).jsFiles)).toBe("console.log(1)");
  });

  it("merges bodyStyles instead of replacing the whole object", () => {
    const state = { ...initialState, bodyStyles: { color: "black", margin: "0" } };
    const next = applyPatch(state, { bodyStyles: { color: "white" } });
    expect(next.bodyStyles).toEqual({ color: "white", margin: "0" });
  });

  it("carries pageTitle/faviconUrl forward when a patch doesn't set them, applies them when it does", () => {
    const state = { ...initialState, pageTitle: "Existing Title", faviconUrl: "existing.ico" };
    expect(applyPatch(state, {}).pageTitle).toBe("Existing Title");
    expect(applyPatch(state, {}).faviconUrl).toBe("existing.ico");
    const next = applyPatch(state, { pageTitle: "New Title", faviconUrl: "new.ico" });
    expect(next.pageTitle).toBe("New Title");
    expect(next.faviconUrl).toBe("new.ico");
  });
});

describe("validatePageMeta", () => {
  it("passes when the page title matches what's expected", () => {
    const result = validatePageMeta({ pageTitle: "My Cool Site", faviconUrl: "" }, { expectedPageTitle: "My Cool Site" });
    expect(result.passed).toBe(true);
  });

  it("fails with a specific message when the page title doesn't match", () => {
    const result = validatePageMeta({ pageTitle: "Wrong Title", faviconUrl: "" }, { expectedPageTitle: "My Cool Site" });
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("My Cool Site");
    expect(result.feedback[0]).toContain("Wrong Title");
  });

  it("passes when the favicon URL matches what's expected", () => {
    const result = validatePageMeta({ pageTitle: "", faviconUrl: "icon.ico" }, { expectedFaviconUrl: "icon.ico" });
    expect(result.passed).toBe(true);
  });

  it("fails when the favicon URL is unset but expected", () => {
    const result = validatePageMeta({ pageTitle: "", faviconUrl: "" }, { expectedFaviconUrl: "icon.ico" });
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("(not set)");
  });

  it("ignores a field the step doesn't check", () => {
    const result = validatePageMeta({ pageTitle: "Anything", faviconUrl: "" }, { expectedFaviconUrl: "icon.ico" });
    expect(result.passed).toBe(false);
    expect(result.feedback).toHaveLength(1); // only the favicon complaint, not pageTitle
  });
});

describe("computeStateAtStep — real incident shape: a later step must not regress a solved challenge", () => {
  const lesson: Lesson = {
    id: "test-lesson",
    title: "Test",
    description: "",
    topic: "html",
    unit: "Test",
    steps: [
      { id: "s1", title: "Add a div", instructions: "", patch: { elements: [el("a", "div", null, 0)] } },
      {
        id: "s2", title: "Challenge: add a p", instructions: "", isChallenge: true,
        patch: {}, // blank scaffold shown to the student
        expected: [{ tag: "div" }, { tag: "p" }],
        solutionPatch: { elements: [el("b", "p", null, 1, "hello")] },
      },
      { id: "s3", title: "Add a span after", instructions: "", patch: { elements: [el("c", "span", null, 2)] } },
    ],
  };

  it("shows the challenge step's blank scaffold, not its solution, when arriving on it", () => {
    const state = computeStateAtStep(lesson, 1);
    expect(state.elements.map((e) => e.id)).toEqual(["a"]); // no "b" — challenge unsolved
  });

  it("folds the challenge as SOLVED into any step that comes after it", () => {
    const state = computeStateAtStep(lesson, 2);
    expect(state.elements.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("computeSolvedStateAtStep shows the challenge already solved, for 'Skip to solution'", () => {
    const state = computeSolvedStateAtStep(lesson, 1);
    expect(state.elements.map((e) => e.id)).toEqual(["a", "b"]);
  });
});

describe("computeSolvedStateAtStep — real incident: a challenge's own scaffold element must survive folding", () => {
  // A challenge whose scaffold (patch.elements) adds a button for the
  // student to wire up, where solutionPatch only specifies the new
  // javascript — the button itself must still be present once the step is
  // treated as solved, or a later lesson chaining off this one (or "Skip to
  // solution") loses the very element the solution's JS refers to.
  const lesson: Lesson = {
    id: "test-lesson-2",
    title: "Test",
    description: "",
    topic: "js",
    unit: "Test",
    steps: [
      {
        id: "s1", title: "Challenge: wire up a button", instructions: "", isChallenge: true,
        patch: { elements: [el("clearBtn", "button", null, 0, "Clear")] },
        behavior: { interactions: [], assertions: [] },
        solutionPatch: { javascript: "clearBtn.addEventListener('click', () => {});" },
      },
    ],
  };

  it("keeps the scaffold button in the solved state even though solutionPatch never re-lists it", () => {
    const state = computeSolvedStateAtStep(lesson, 0);
    expect(state.elements.map((e) => e.id)).toEqual(["clearBtn"]);
    expect(mainJsCode(state.jsFiles)).toBe("clearBtn.addEventListener('click', () => {});");
  });
});

describe("validateStructure", () => {
  it("passes when tags and required styles match", () => {
    const elements = [el("a", "nav", null, 0), el("b", "footer", null, 1, "", { color: "red" })];
    const result = validateStructure(elements, [{ tag: "nav" }, { tag: "footer", styles: { color: "red" } }]);
    expect(result.passed).toBe(true);
  });

  it("fails with a specific message when a tag doesn't match", () => {
    const elements = [el("a", "div", null, 0)];
    const result = validateStructure(elements, [{ tag: "nav" }]);
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("Expected <nav>");
    expect(result.feedback[0]).toContain("found <div>");
  });

  it("fails with a specific message when a required style value doesn't match", () => {
    const elements = [el("a", "footer", null, 0, "", { color: "blue" })];
    const result = validateStructure(elements, [{ tag: "footer", styles: { color: "red" } }]);
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("color");
    expect(result.feedback[0]).toContain("red");
    expect(result.feedback[0]).toContain("blue");
  });

  it("checks nested children recursively", () => {
    const elements = [el("a", "footer", null, 0), el("b", "span", "a", 0)];
    const result = validateStructure(elements, [{ tag: "footer", children: [{ tag: "p" }] }]);
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("<p>");
  });

  it("doesn't fail for extra unrelated styles the student added beyond what's checked", () => {
    const elements = [el("a", "footer", null, 0, "", { color: "red", padding: "40px" })];
    const result = validateStructure(elements, [{ tag: "footer", styles: { color: "red" } }]);
    expect(result.passed).toBe(true);
  });

  it("passes when a required attribute matches", () => {
    const elements = [el("a", "button", null, 0, "", {}, { "aria-label": "Close" })];
    const result = validateStructure(elements, [{ tag: "button", attrs: { "aria-label": "Close" } }]);
    expect(result.passed).toBe(true);
  });

  it("fails with a specific message when a required attribute is missing or wrong", () => {
    const elements = [el("a", "button", null, 0)];
    const result = validateStructure(elements, [{ tag: "button", attrs: { "aria-label": "Close" } }]);
    expect(result.passed).toBe(false);
    expect(result.feedback[0]).toContain("aria-label");
    expect(result.feedback[0]).toContain("(not set)");
  });
});
