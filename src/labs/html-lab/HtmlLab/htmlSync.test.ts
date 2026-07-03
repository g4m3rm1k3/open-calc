// @vitest-environment happy-dom
//
// Tests for real incidents hit while importing external HTML into HTML Lab:
// a <table> lost its <thead>/<tr>/<th> children entirely (CONTAINER_TAGS gap,
// fixed in labReducer.ts), and a toast/dark-mode toggle stopped working because
// the import baked class-based rules into one-time inline styles (fixed in
// applyImportedCssToDoc). These guard against both regressing silently.

import { describe, it, expect } from "vitest";
import { parseHtmlDocument } from "./htmlSync";

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
