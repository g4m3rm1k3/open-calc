// Tests for real incidents in the HTML Lab canvas/theme reducer:
// (1) CanvasPanel only renders an element's children when its tag is in
//     CONTAINER_TAGS, so a <table> without <thead>/<tr>/<th> whitelisted
//     rendered as an empty box even though the nested elements existed in state.
// (2) Switching the page's body theme (e.g. Slate) flipped a section's white
//     heading text to dark navy even though the section sat on its own
//     unrelated dark background, because the contrast-cascade heuristic only
//     checked the element's OWN background and didn't look at what it was
//     actually sitting on (an ancestor's gradient/solid background).

import { describe, it, expect } from "vitest";
import { labReducer, initialState, CONTAINER_TAGS } from "./labReducer";
import type { LabElement, LabState } from "./types";

function el(id: string, tag: string, parentId: string | null, order: number, styles: Record<string, string> = {}, content = ""): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "" }, styles, mediaQueries: [] };
}

describe("CONTAINER_TAGS — table structure renders in the canvas", () => {
  it("includes the table family so <thead>/<tr>/<th> aren't silently dropped", () => {
    for (const tag of ["table", "thead", "tbody", "tr", "th", "td"]) {
      expect(CONTAINER_TAGS.has(tag)).toBe(true);
    }
  });
});

describe("APPLY_BODY_THEME — cascadeBodyTheme respects ancestor backgrounds", () => {
  function stateWithHeroSection(): LabState {
    const elements: LabElement[] = [
      // A "hero" section with its own dark gradient background — unrelated to the page body.
      el("section1", "section", null, 0, { background: "linear-gradient(#0f172a 0%, #1e293b 100%)" }),
      el("h1-1", "h1", "section1", 0, { color: "#f8fafc" }, "Heading"),
    ];
    return { ...initialState, elements, bodyStyles: { ...initialState.bodyStyles, backgroundColor: "#0f172a" } };
  }

  it("does not recolor text on a descendant sitting on a non-neutral ancestor background", () => {
    const state = stateWithHeroSection();
    const next = labReducer(state, { type: "APPLY_BODY_THEME", payload: { backgroundColor: "#f8fafc" } });

    const h1 = next.elements.find((e) => e.id === "h1-1")!;
    // The heading's white text must survive — it's still sitting on the section's
    // own dark gradient, which didn't change, so flipping it to dark text would
    // make it unreadable against that unchanged dark backdrop.
    expect(h1.styles.color).toBe("#f8fafc");
  });

  it("still recolors text with no ancestor background, to follow the new body theme", () => {
    const elements: LabElement[] = [el("p1", "p", null, 0, { color: "#f8fafc" }, "Text")];
    const state: LabState = { ...initialState, elements, bodyStyles: { ...initialState.bodyStyles, backgroundColor: "#0f172a" } };
    const next = labReducer(state, { type: "APPLY_BODY_THEME", payload: { backgroundColor: "#f8fafc" } });

    const p = next.elements.find((e) => e.id === "p1")!;
    expect(p.styles.color).not.toBe("#f8fafc");
  });
});
