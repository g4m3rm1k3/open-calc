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
import { labReducer, initialState, CONTAINER_TAGS, computeBodyStyles, inferBodyTheme } from "./labReducer";
import type { LabElement, LabState, BodyThemeState } from "./types";

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

function stateWithColorMode(elements: LabElement[], colorMode: "light" | "dark"): LabState {
  const bodyTheme: BodyThemeState = { ...initialState.bodyTheme, colorMode };
  return { ...initialState, elements, bodyTheme, bodyStyles: computeBodyStyles(bodyTheme) };
}

describe("SET_COLOR_MODE — cascadeBodyTheme respects ancestor backgrounds", () => {
  it("does not recolor text on a descendant sitting on a non-neutral ancestor background", () => {
    const elements: LabElement[] = [
      // A "hero" section with its own dark gradient background — unrelated to the page body.
      el("section1", "section", null, 0, { background: "linear-gradient(#0f172a 0%, #1e293b 100%)" }),
      el("h1-1", "h1", "section1", 0, { color: "#f8fafc" }, "Heading"),
    ];
    const state = stateWithColorMode(elements, "dark");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "light" });

    const h1 = next.elements.find((e) => e.id === "h1-1")!;
    // The heading's white text must survive — it's still sitting on the section's
    // own dark gradient, which didn't change, so flipping it to dark text would
    // make it unreadable against that unchanged dark backdrop.
    expect(h1.styles.color).toBe("#f8fafc");
  });

  it("still recolors text with no ancestor background, to follow the new body theme", () => {
    const elements: LabElement[] = [el("p1", "p", null, 0, { color: "#f8fafc" }, "Text")];
    const state = stateWithColorMode(elements, "dark");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "light" });

    const p = next.elements.find((e) => e.id === "p1")!;
    expect(p.styles.color).not.toBe("#f8fafc");
  });
});

describe("computeBodyStyles — independent style axes", () => {
  it("keeps the dark text color and picks the dark-toned gradient when Glass is on in Dark mode", () => {
    const styles = computeBodyStyles({ colorMode: "dark", glass: true, centered: false });
    expect(styles.color).toBe("#f8fafc");
    expect(styles.background).toContain("#4c1d95");
    expect(styles.backgroundColor).toBeUndefined();
  });

  it("picks the light-toned gradient when Glass is on in Light mode", () => {
    const styles = computeBodyStyles({ colorMode: "light", glass: true, centered: false });
    expect(styles.color).toBe("#0f172a");
    expect(styles.background).toContain("#ddd6fe");
  });

  it("Centered never changes color or background", () => {
    const withoutCentered = computeBodyStyles({ colorMode: "dark", glass: false, centered: false });
    const withCentered = computeBodyStyles({ colorMode: "dark", glass: false, centered: true });
    expect(withCentered.color).toBe(withoutCentered.color);
    expect(withCentered.backgroundColor).toBe(withoutCentered.backgroundColor);
    expect(withCentered.maxWidth).toBe("1024px");
  });
});

describe("TOGGLE_GLASS / TOGGLE_CENTERED — axes stay independent", () => {
  it("switching color mode while Glass is already on keeps Glass on", () => {
    const state = labReducer(initialState, { type: "TOGGLE_GLASS" });
    expect(state.bodyTheme.glass).toBe(true);

    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "dark" });
    expect(next.bodyTheme.glass).toBe(true);
    expect(next.bodyStyles.background).toContain("#4c1d95"); // dark-mode glass gradient, not dropped
  });

  it("toggling Centered on top of Dark + Glass leaves both other axes untouched", () => {
    let state = labReducer(initialState, { type: "SET_COLOR_MODE", payload: "dark" });
    state = labReducer(state, { type: "TOGGLE_GLASS" });
    state = labReducer(state, { type: "TOGGLE_CENTERED" });

    expect(state.bodyTheme).toEqual({ colorMode: "dark", glass: true, centered: true });
    expect(state.bodyStyles.maxWidth).toBe("1024px");
    expect(state.bodyStyles.background).toContain("#4c1d95");
  });
});

describe("LOAD_EXAMPLE — bodyTheme stays in sync with whatever bodyStyles the example sets", () => {
  // Real incident: examples (including the app's own startup example) set
  // bodyStyles directly with their own hardcoded colors, entirely bypassing the
  // bodyTheme axis system. Without inferBodyTheme, the Global Style panel kept
  // showing "Light" as active — because bodyTheme was never touched — even
  // though the loaded example's actual page was dark.
  it("infers Dark from a loaded example's dark backgroundColor, not left at the default Light", () => {
    const darkExampleStyles = { backgroundColor: "#0f172a", color: "#f8fafc" };
    const next = labReducer(initialState, {
      type: "LOAD_EXAMPLE",
      payload: { elements: [], bodyStyles: darkExampleStyles, javascript: "" },
    });
    expect(next.bodyTheme.colorMode).toBe("dark");
  });

  it("infers Light from a loaded example's light backgroundColor", () => {
    const lightExampleStyles = { backgroundColor: "#ffffff", color: "#0f172a" };
    const next = labReducer(initialState, {
      type: "LOAD_EXAMPLE",
      payload: { elements: [], bodyStyles: lightExampleStyles, javascript: "" },
    });
    expect(next.bodyTheme.colorMode).toBe("light");
  });
});

describe("inferBodyTheme", () => {
  it("detects glass from a gradient background with no plain backgroundColor", () => {
    const theme = inferBodyTheme({ background: "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)" });
    expect(theme.glass).toBe(true);
    expect(theme.colorMode).toBe("dark");
  });

  it("detects centered from a maxWidth", () => {
    const theme = inferBodyTheme({ backgroundColor: "#f8fafc", maxWidth: "1024px" });
    expect(theme.centered).toBe(true);
  });
});
