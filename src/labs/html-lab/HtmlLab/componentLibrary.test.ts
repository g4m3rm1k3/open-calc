// A WCAG-lite contrast audit over every predefined component theme variant
// (Card/Hero/Nav/etc.'s Clean/Dark/Glass swatches in COMPONENTS). These are
// hand-authored color pairs — nothing catches a typo'd hex or a variant where
// the text color didn't get updated alongside its background until this runs.
// Not a pixel-perfect WCAG checker (translucent/rgba backgrounds are skipped —
// contrast against them depends on whatever's behind them, which we can't know
// statically), but it catches the case that actually matters: a plain-hex
// foreground/background pair that's too close to read.

import { describe, it, expect } from "vitest";
import { COMPONENTS, detectComponents, buildThemeUpdates, cascadeComponentThemes } from "./componentLibrary";
import type { LabElement } from "./types";

function el(id: string, tag: string, parentId: string | null, order: number, styles: Record<string, string> = {}, content = ""): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "" }, styles, mediaQueries: [] };
}

function relativeLuminance(hex: string): number {
  const toLinear = (c: number): number => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(hex.slice(1, 3), 16));
  const g = toLinear(parseInt(hex.slice(3, 5), 16));
  const b = toLinear(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// The worst (lowest-contrast) hex stop in a background value against a given
// foreground — handles a plain color and a multi-stop gradient the same way.
// Returns null if the background has no plain hex at all (rgba()/transparent/
// "none" — genuinely can't be checked statically).
function worstContrastAgainstBackground(fgHex: string, bg: string | undefined): number | null {
  if (!bg) return null;
  const stops = bg.match(/#[0-9a-fA-F]{6}/g);
  if (!stops || stops.length === 0) return null;
  return Math.min(...stops.map((stop) => contrastRatio(fgHex, stop)));
}

const MIN_CONTRAST = 3.0; // lenient (WCAG AA large-text threshold) — this is a smoke test, not a certifier

describe("Component theme variants — text stays readable against its own background", () => {
  for (const comp of COMPONENTS) {
    for (const group of comp.themeGroups) {
      for (const theme of group.themes) {
        const bg = theme.parentStyles?.backgroundColor || theme.parentStyles?.background;

        if (theme.parentStyles?.color && theme.parentStyles.color.startsWith("#") && bg) {
          const ratio = worstContrastAgainstBackground(theme.parentStyles.color, bg);
          if (ratio !== null) {
            it(`${comp.id} / ${theme.id}: parent text is readable against its own background`, () => {
              expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST);
            });
          }
        }

        for (const [tag, tagStyles] of Object.entries(theme.childStylesByTag ?? {})) {
          const childBg = tagStyles.backgroundColor || tagStyles.background || bg;
          if (tagStyles.color && tagStyles.color.startsWith("#") && childBg) {
            const ratio = worstContrastAgainstBackground(tagStyles.color, childBg);
            if (ratio !== null) {
              it(`${comp.id} / ${theme.id} / <${tag}>: text is readable against its background`, () => {
                expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST);
              });
            }
          }
        }
      }
    }
  }
});

describe("detectComponents — real incident: generic Container shadowed the specific Hero match", () => {
  // A hero section (<section> containing button/h1/p) satisfies BOTH the
  // generic Container matcher (any div/section/article/header/footer) and the
  // specific Hero matcher (children are exactly button,h1,p). Container used
  // to be declared first in COMPONENTS, so cascadeComponentThemes' `matched[0]`
  // always picked Container's theme — which has no `background: "none"`
  // override — leaving a hero's old gradient stuck underneath the new fill.
  function heroElements(): LabElement[] {
    return [
      el("hero1", "section", null, 0, { background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" }),
      el("h1-1", "h1", "hero1", 0, { color: "#f8fafc" }, "Heading"),
      el("p-1", "p", "hero1", 1, { color: "#94a3b8" }, "Tagline"),
      el("btn-1", "button", "hero1", 2, { backgroundColor: "#3b82f6", color: "#ffffff" }, "Get Started"),
    ];
  }

  it("matches Hero before the generic Container for a hero-shaped section", () => {
    const matched = detectComponents("hero1", heroElements());
    expect(matched[0]?.id).toBe("hero");
  });

  it("cascadeComponentThemes clears the old gradient when switching to Glass", () => {
    const updates = cascadeComponentThemes(heroElements(), "glass");
    const heroUpdate = updates.find((u) => u.id === "hero1");
    expect(heroUpdate?.styles.background).toBe("none");
  });
});

describe("Table theme application reaches th/td through thead/tbody/tr wrappers", () => {
  function tableElements(): LabElement[] {
    return [
      el("table1", "table", null, 0, {}),
      el("thead1", "thead", "table1", 0, {}),
      el("tr1",    "tr",    "thead1", 0, {}),
      el("th1",    "th",    "tr1", 0, { borderBottom: "2px solid #e2e8f0" }, "Column 1"),
      el("tbody1", "tbody", "table1", 1, {}),
      el("tr2",    "tr",    "tbody1", 0, {}),
      el("td1",    "td",    "tr2", 0, { borderBottom: "1px solid #e2e8f0" }, "Row 1"),
    ];
  }

  it("matches the Table component when a <table> is selected", () => {
    const matched = detectComponents("table1", tableElements());
    expect(matched.some((c) => c.id === "table-structure")).toBe(true);
  });

  it("applies the Dark theme's th/td styles despite being two levels below <table>", () => {
    const tableComp = COMPONENTS.find((c) => c.id === "table-structure")!;
    const darkTheme = tableComp.themeGroups.flatMap((g) => g.themes).find((t) => t.id === "table-dark")!;
    const updates = buildThemeUpdates("table1", tableElements(), darkTheme);

    const thUpdate = updates.find((u) => u.id === "th1");
    const tdUpdate = updates.find((u) => u.id === "td1");
    expect(thUpdate?.styles.color).toBe("#f8fafc");
    expect(tdUpdate?.styles.color).toBe("#cbd5e1");
  });
});
