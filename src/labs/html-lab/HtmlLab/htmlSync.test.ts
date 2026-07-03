// @vitest-environment happy-dom
//
// Tests for real incidents hit while importing external HTML into HTML Lab:
// a <table> lost its <thead>/<tr>/<th> children entirely (CONTAINER_TAGS gap,
// fixed in labReducer.ts), and a toast/dark-mode toggle stopped working because
// the import baked class-based rules into one-time inline styles (fixed in
// applyImportedCssToDoc). These guard against both regressing silently.

import { describe, it, expect } from "vitest";
import { parseHtmlDocument, elementsToCss, applyCssToElements } from "./htmlSync";
import type { LabElement } from "./types";

describe("parseHtmlDocument — table structure", () => {
  it("preserves <thead>/<tr>/<th> children instead of dropping them", () => {
    const html = `<!DOCTYPE html><html><body>
      <table>
        <thead><tr><th>Name</th><th>Status</th></tr></thead>
        <tbody><tr><td>Item 1</td><td>Online</td></tr></tbody>
      </table>
    </body></html>`;

    const { elements } = parseHtmlDocument(html);
    const tags = elements.map((e) => e.tag);
    expect(tags).toEqual(expect.arrayContaining(["table", "thead", "tbody", "tr", "th", "td"]));

    const thElements = elements.filter((e) => e.tag === "th");
    expect(thElements.map((e) => e.content)).toEqual(["Name", "Status"]);
  });
});

describe("parseHtmlDocument — class-toggle interactivity survives import", () => {
  it("does not bake a stateful class's base rule into a static inline style", () => {
    const html = `<!DOCTYPE html><html><head><style>
      .toast { position: fixed; transform: translateY(120px); }
      .toast.show { transform: translateY(0); }
    </style></head><body>
      <div class="toast" id="toast">Hi</div>
    </body></html>`;

    const { elements, css } = parseHtmlDocument(html);
    const toast = elements.find((e) => e.attrs?.class === "toast");
    expect(toast).toBeDefined();
    // The base rule must NOT be frozen as an inline style — inline styles beat
    // stylesheet rules regardless of specificity, which would permanently block
    // any later classList.toggle("show") from ever having a visual effect.
    expect(toast!.styles.transform).toBeUndefined();
    // Both rules must survive as real, live CSS so the runtime class toggle works.
    expect(css).toContain(".toast");
    expect(css).toContain(".toast.show");
  });

  it("preserves a body.<modifier> rule instead of silently dropping it", () => {
    const html = `<!DOCTYPE html><html><head><style>
      body.dark { --bg: #0f172a; }
    </style></head><body></body></html>`;

    const { css } = parseHtmlDocument(html);
    expect(css).toContain("body.dark");
  });
});

describe("elementsToCss / applyCssToElements — real incident: CSS tab editing snowballed the reset block", () => {
  // The CSS tab's onChange handler round-trips the FULL displayed text (reset
  // + body{} + per-element rules + "/* Custom CSS */" + customCss) back
  // through applyCssToElements to re-extract customCss, then elementsToCss
  // re-injects a fresh copy of the reset on top. applyCssToElements stripped
  // the data-lab-id blocks, the body{} block, and the "/* Custom CSS */"
  // marker text — but never the reset block itself, so every edit captured
  // another copy of it into customCss, which then rendered as an *additional*
  // reset copy on the next render — an unbounded duplicate pileup on every
  // single keystroke, not just an occasional glitch.
  function elements(): LabElement[] {
    return [{ id: "e1", tag: "div", parentId: null, order: 0, content: "", attrs: { id: "", class: "" }, styles: { color: "#0f172a" }, mediaQueries: [] }];
  }

  it("re-parsing the generated CSS unchanged does not grow customCss", () => {
    const els = elements();
    const generated = elementsToCss(els, "", {});
    const { customCss } = applyCssToElements(generated, els);
    expect(customCss).toBe("");
  });

  it("stays stable across many edit round-trips instead of accumulating the reset", () => {
    const els = elements();
    let customCss = "";
    for (let i = 0; i < 10; i++) {
      const generated = elementsToCss(els, customCss, {});
      customCss = applyCssToElements(generated, els).customCss;
    }
    expect(customCss).toBe("");
    // Directly guard the actual symptom the user hit: repeated "/* Reset */"
    // headers piling up in the editor text after many rounds of editing.
    const finalGenerated = elementsToCss(els, customCss, {});
    expect(finalGenerated.match(/\/\*\s*Reset\s*\*\//g)?.length ?? 0).toBe(1);
  });

  it("preserves a genuine hand-written custom rule across a round-trip", () => {
    const els = elements();
    const generated = elementsToCss(els, ".my-rule { color: red; }", {});
    const { customCss } = applyCssToElements(generated, els);
    expect(customCss).toContain(".my-rule");
  });
});
