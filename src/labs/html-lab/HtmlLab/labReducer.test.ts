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

// Standalone copy of labReducer's private hexLum, for asserting on the actual
// shade a color got remapped to without exporting an internal helper just for tests.
function hexLumForTest(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
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
  it("does not recolor text on a descendant sitting on a non-neutral (genuine accent color) ancestor background", () => {
    const elements: LabElement[] = [
      // A "hero" section with its own deliberate violet brand gradient — a real
      // accent choice (mid luminance, not near-black/near-white chrome), unrelated
      // to the page body and something a global light/dark toggle should never touch.
      el("section1", "section", null, 0, { background: "linear-gradient(#7c3aed 0%, #a78bfa 100%)" }),
      el("h1-1", "h1", "section1", 0, { color: "#f8fafc" }, "Heading"),
    ];
    const state = stateWithColorMode(elements, "dark");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "light" });

    const h1 = next.elements.find((e) => e.id === "h1-1")!;
    // The heading's white text must survive — it's still sitting on the section's
    // own violet gradient, which didn't change, so flipping it to dark text would
    // make it unreadable against that unchanged backdrop.
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

describe("SET_COLOR_MODE — real incident: the startup demo never visibly changed", () => {
  // The demo page (exampleProject.ts) builds every section from its own explicit
  // #0f172a/#1e293b dark-navy styles instead of inheriting from body — nav
  // backgroundColor is a plain #0f172a, the hero uses a
  // linear-gradient(180deg, #0f172a 0%, #1e293b 100%), and CTA buttons use the
  // genuine accent color #3b82f6. Before this fix, cascadeBodyTheme's
  // saturation-based neutrality check refused to touch any of it — a gradient
  // never even passed the entry check, and #0f172a's hue saturation (~0.64)
  // read as "a deliberate color choice" even though it's just dark chrome.
  const navEl = el("nav1", "nav", null, 0, { backgroundColor: "#0f172a" });
  const heroEl = el("hero1", "section", null, 1, { background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" });
  const heroTitle = el("hero-title", "h1", "hero1", 0, { color: "#f8fafc" }, "Heading");
  const ctaButton = el("cta1", "button", "hero1", 1, { backgroundColor: "#3b82f6", color: "#ffffff" }, "Get started");

  function demoState(): LabState {
    return stateWithColorMode([navEl, heroEl, heroTitle, ctaButton], "dark");
  }

  it("relights a plain-color nav background when switching to Light", () => {
    const next = labReducer(demoState(), { type: "SET_COLOR_MODE", payload: "light" });
    const nav = next.elements.find((e) => e.id === "nav1")!;
    expect(hexLumForTest(nav.styles.backgroundColor)).toBeGreaterThan(0.85);
  });

  it("relights every stop of the hero's gradient background when switching to Light", () => {
    const next = labReducer(demoState(), { type: "SET_COLOR_MODE", payload: "light" });
    const hero = next.elements.find((e) => e.id === "hero1")!;
    const stops = hero.styles.background.match(/#[0-9a-fA-F]{6}/g) ?? [];
    expect(stops.length).toBeGreaterThan(0);
    for (const stop of stops) expect(hexLumForTest(stop)).toBeGreaterThan(0.85);
  });

  it("recolors the hero heading's white text once its dark gradient backdrop is also relit", () => {
    const next = labReducer(demoState(), { type: "SET_COLOR_MODE", payload: "light" });
    const title = next.elements.find((e) => e.id === "hero-title")!;
    expect(title.styles.color).not.toBe("#f8fafc");
  });

  it("leaves the genuine accent-colored CTA button untouched", () => {
    const next = labReducer(demoState(), { type: "SET_COLOR_MODE", payload: "light" });
    const button = next.elements.find((e) => e.id === "cta1")!;
    expect(button.styles.backgroundColor).toBe("#3b82f6");
    expect(button.styles.color).toBe("#ffffff");
  });
});

describe("SET_COLOR_MODE — real incident: a plain table never changed with the page", () => {
  // The Table structural scaffold (componentLibrary.ts) carries its entire
  // color identity in `borderBottom` — no backgroundColor/color at all on
  // <th>/<td> — so cascadeBodyTheme's old backgroundColor/background-only
  // scan had nothing to touch: the header/row dividers stayed light-gray
  // forever, even sitting on a page that had gone fully dark.
  const th = el("th1", "th", null, 0, { borderBottom: "2px solid #e2e8f0" }, "Column 1");
  const td = el("td1", "td", null, 1, { borderBottom: "1px solid #e2e8f0" }, "Row 1");

  it("relights a neutral th border when switching to Dark", () => {
    const state = stateWithColorMode([th, td], "light");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "dark" });
    const nextTh = next.elements.find((e) => e.id === "th1")!;
    const stop = nextTh.styles.borderBottom.match(/#[0-9a-fA-F]{6}/)?.[0];
    expect(stop).toBeDefined();
    expect(hexLumForTest(stop!)).toBeLessThan(0.35);
  });

  it("relights a neutral td border when switching to Dark", () => {
    const state = stateWithColorMode([th, td], "light");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "dark" });
    const nextTd = next.elements.find((e) => e.id === "td1")!;
    const stop = nextTd.styles.borderBottom.match(/#[0-9a-fA-F]{6}/)?.[0];
    expect(stop).toBeDefined();
    expect(hexLumForTest(stop!)).toBeLessThan(0.35);
  });

  it("leaves a deliberately accent-colored border untouched", () => {
    // Tag deliberately isn't <div>/<section>/etc — those also match the
    // generic Container component, whose own Dark theme unconditionally
    // overwrites `border` regardless of color, which would confound this
    // test with a different code path than the one under test here.
    const accentBordered = el("badge1", "span", null, 0, { border: "1px solid #3b82f6" });
    const state = stateWithColorMode([accentBordered], "light");
    const next = labReducer(state, { type: "SET_COLOR_MODE", payload: "dark" });
    const badge = next.elements.find((e) => e.id === "badge1")!;
    expect(badge.styles.border).toBe("1px solid #3b82f6");
  });
});

describe("DUPLICATE_ELEMENT — Ctrl/Alt+drag in the Tree", () => {
  it("clones a leaf element at the target position, leaving the original untouched", () => {
    const state: LabState = { ...initialState, elements: [el("a", "p", null, 0, {}, "Hello")] };
    const next = labReducer(state, { type: "DUPLICATE_ELEMENT", payload: { id: "a", parentId: null, order: 1 } });

    expect(next.elements).toHaveLength(2);
    const original = next.elements.find((e) => e.id === "a")!;
    expect(original.content).toBe("Hello");
    const clone = next.elements.find((e) => e.id !== "a")!;
    expect(clone.content).toBe("Hello");
    expect(clone.id).not.toBe("a");
    expect(next.selectedId).toBe(clone.id);
  });

  it("clones an entire subtree, remapping descendant parentIds to the new clone ids", () => {
    const state: LabState = {
      ...initialState,
      elements: [
        el("card", "div", null, 0),
        el("title", "h3", "card", 0, {}, "Title"),
        el("body", "p", "card", 1, {}, "Body text"),
      ],
    };
    const next = labReducer(state, { type: "DUPLICATE_ELEMENT", payload: { id: "card", parentId: null, order: 1 } });

    expect(next.elements).toHaveLength(6);
    const clonedCard = next.elements.find((e) => e.id !== "card" && e.tag === "div")!;
    const clonedChildren = next.elements.filter((e) => e.parentId === clonedCard.id);
    expect(clonedChildren.map((c) => c.content).sort()).toEqual(["Body text", "Title"]);
    // originals still intact and still pointing at the original card
    expect(next.elements.filter((e) => e.parentId === "card")).toHaveLength(2);
  });

  it("clears a copied HTML id attribute so the duplicate doesn't collide with the original", () => {
    const source: LabElement = { id: "a", tag: "div", parentId: null, order: 0, content: "", attrs: { id: "left", class: "" }, styles: {}, mediaQueries: [] };
    const state: LabState = { ...initialState, elements: [source] };
    const next = labReducer(state, { type: "DUPLICATE_ELEMENT", payload: { id: "a", parentId: null, order: 1 } });

    const clone = next.elements.find((e) => e.id !== "a")!;
    expect(clone.attrs.id).toBe("");
    // original keeps its id attribute
    expect(next.elements.find((e) => e.id === "a")!.attrs.id).toBe("left");
  });

  it("does nothing when the drop target isn't a container tag", () => {
    const state: LabState = {
      ...initialState,
      elements: [el("a", "p", null, 0, {}, "Hello"), el("b", "button", null, 1, {}, "World")],
    };
    const next = labReducer(state, { type: "DUPLICATE_ELEMENT", payload: { id: "a", parentId: "b", order: 0 } });
    expect(next.elements).toHaveLength(2);
  });

  it("shifts existing siblings at the drop position instead of overwriting them", () => {
    const state: LabState = {
      ...initialState,
      elements: [
        el("a", "p", null, 0, {}, "First"),
        el("b", "p", null, 1, {}, "Second"),
      ],
    };
    const next = labReducer(state, { type: "DUPLICATE_ELEMENT", payload: { id: "a", parentId: null, order: 1 } });
    const roots = next.elements.filter((e) => !e.parentId).sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
    expect(roots.map((e) => e.content)).toEqual(["First", "First", "Second"]);
  });
});
