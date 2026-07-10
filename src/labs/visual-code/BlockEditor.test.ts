// Tests for the pure helper functions extracted from HTML Lab's
// VisualJsPanel.tsx into the shared block-editor widget — the part of this
// refactor with real logic worth covering directly (the palette/program/
// field-picker UI itself is covered by the existing lesson/transpiler tests
// plus a live Playwright pass across both hosts, not here).

import { describe, expect, it } from "vitest";
import { computeDomHints, computeClassHints, computeVariableHints, filterPaletteBlocks, type HintElement } from "./BlockEditor.tsx";
import { createBlock } from "./blocks.ts";
import type { Block } from "./types.ts";

function el(tag: string, id = "", cls = ""): HintElement {
  return { tag, attrs: { id, class: cls } };
}

describe("computeDomHints", () => {
  it("collects #id, .class, and bare-tag hints from a live elements array", () => {
    const hints = computeDomHints([el("button", "scoreButton"), el("div", "", "card highlight")], "");
    expect(hints).toContain("#scoreButton");
    expect(hints).toContain(".card");
    expect(hints).toContain(".highlight");
    expect(hints).toContain("button");
    expect(hints).toContain("div");
  });

  it("also collects hints from a raw HTML string — Visual Code Studio has no elements array, only project.html", () => {
    const hints = computeDomHints([], '<button id="scoreButton" class="primary">Go</button>');
    expect(hints).toContain("#scoreButton");
    expect(hints).toContain(".primary");
  });

  it("de-duplicates hints seen in both the elements array and the html string", () => {
    const hints = computeDomHints([el("button", "scoreButton")], '<button id="scoreButton">Go</button>');
    expect(hints.filter(h => h === "#scoreButton")).toHaveLength(1);
  });

  it("returns an empty array for an empty project (Visual Code Studio's EMPTY_PROJECT has real html though, so this is the degenerate case)", () => {
    expect(computeDomHints([], "")).toEqual([]);
  });
});

describe("computeClassHints", () => {
  it("extracts class names from dom hints", () => {
    expect(computeClassHints(["#btn", ".primary", ".card", "div"], "")).toEqual(["primary", "card"]);
  });

  it("also extracts class selectors from a separate css string, when one exists", () => {
    const hints = computeClassHints([], ".highlight, .warning { color: red; }");
    expect(hints).toContain("highlight");
    expect(hints).toContain("warning");
  });

  it("works with an empty css string — Visual Code Studio has no separate css source", () => {
    expect(computeClassHints([".primary"], "")).toEqual(["primary"]);
  });
});

describe("computeVariableHints", () => {
  it("collects names from Variable and Read Value blocks anywhere in the tree, including nested", () => {
    const btn = createBlock("event");
    const inner: Block = { ...createBlock("variable"), fields: { ...createBlock("variable").fields, name: "count" } };
    btn.children = [inner];
    const outer: Block = { ...createBlock("readValue"), fields: { ...createBlock("readValue").fields, name: "userInput" } };
    const hints = computeVariableHints([btn, outer]);
    expect(hints).toContain("count");
    expect(hints).toContain("userInput");
  });

  it("ignores blocks with no name field and de-duplicates repeated names", () => {
    const a: Block = { ...createBlock("variable"), fields: { ...createBlock("variable").fields, name: "score" } };
    const b: Block = { ...createBlock("variable"), fields: { ...createBlock("variable").fields, name: "score" } };
    const log = createBlock("log");
    expect(computeVariableHints([a, b, log])).toEqual(["score"]);
  });

  it("returns an empty array for an empty block list", () => {
    expect(computeVariableHints([])).toEqual([]);
  });
});

describe("filterPaletteBlocks", () => {
  it("excludes childOnly blocks (chainStep) regardless of query", () => {
    expect(filterPaletteBlocks("").some(b => b.type === "chainStep")).toBe(false);
    expect(filterPaletteBlocks("then").some(b => b.type === "chainStep")).toBe(false);
  });

  it("excludes tsOnly blocks by default, includes them when allowTsOnly is true", () => {
    expect(filterPaletteBlocks("interface").some(b => b.type === "interface")).toBe(false);
    expect(filterPaletteBlocks("interface", true).some(b => b.type === "interface")).toBe(true);
  });

  it("matches on label, category, or description text", () => {
    const results = filterPaletteBlocks("promise chain");
    expect(results.length).toBe(0); // no block's label/category/description literally contains this phrase
    expect(filterPaletteBlocks("ready").some(b => b.type === "whenReady")).toBe(true);
  });

  it("returns every non-childOnly, non-tsOnly block for an empty query", () => {
    const results = filterPaletteBlocks("");
    expect(results.length).toBeGreaterThan(20);
    expect(results.every(b => !b.childOnly && !b.tsOnly)).toBe(true);
  });
});
