// A WCAG-lite contrast audit over every predefined component theme variant
// (Card/Hero/Nav/etc.'s Clean/Dark/Glass swatches in COMPONENTS). These are
// hand-authored color pairs — nothing catches a typo'd hex or a variant where
// the text color didn't get updated alongside its background until this runs.
// Not a pixel-perfect WCAG checker (translucent/rgba backgrounds are skipped —
// contrast against them depends on whatever's behind them, which we can't know
// statically), but it catches the case that actually matters: a plain-hex
// foreground/background pair that's too close to read.

import { describe, it, expect } from "vitest";
import { COMPONENTS } from "./componentLibrary";

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
