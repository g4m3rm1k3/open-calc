import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssGridFundamentals } from "./cssGridFundamentals";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Continues the journal page from "CSS Grid Fundamentals." Mobile-first
// responsive design: design the simplest (narrow-screen) layout as the
// DEFAULT with no media query at all, then use a media query to layer on
// a richer layout once there's enough width for it — never the other way
// around.
//
// Note: this app's per-element `mediaQueries` (added via the Properties
// panel's Layout section, or the `el()` helper's optional 8th argument)
// generate real `@media (min-width: ...) { ... }` rules — visible proof
// this isn't a simulated feature. `validateStructure` doesn't check
// mediaQueries yet, though, so this lesson's graded challenge sticks to
// checking the mobile-first BASE styles; using a media query on top is
// taught and encouraged, just not enforced by the checker.
const priorFold = computeSolvedFoldAtStep(cssGridFundamentals, cssGridFundamentals.steps.length - 1);

export const cssResponsiveDesign: Lesson = {
  id: "css-responsive-design",
  title: "Responsive Design & Media Queries",
  description: "Why screen size matters, mobile-first layout, and media queries — one idea at a time.",
  topic: "css",
  unit: "Responsive Design",
  steps: [
    {
      id: "recap-page",
      title: "Here's the journal page so far",
      instructions: "The stats section is a fixed 3-column grid right now — on a narrow phone screen, that's three uncomfortably thin columns.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "why-responsive-design",
      title: "The same page has to work on very different screens",
      instructions:
        "A phone screen might be 375px wide; a laptop might be 1440px or more. A layout that looks great at one size can be genuinely broken at the other — three columns that are comfortable on a laptop can each shrink to just a few characters wide on a phone. Responsive design just means writing CSS that adapts to the screen it's actually being viewed on, instead of assuming one fixed size.",
      patch: {},
    },
    {
      id: "mobile-first-default",
      title: "Design the narrow screen first",
      instructions:
        "\"Mobile-first\" means your DEFAULT styles — the ones with no special condition attached at all — are written for the smallest, most constrained screen first, and complexity gets ADDED for bigger screens afterward, never the reverse. Here, the stats section's default just became a single stacked column, which is a perfectly reasonable layout on a phone even though it's not the final design.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px", padding: "0 32px" }),
        ],
      },
    },
    {
      id: "media-query-for-wider-screens",
      title: "A media query is a rule that only applies sometimes",
      instructions:
        "`@media (min-width: 600px) { ... }` wraps a block of CSS that the browser only applies once the viewport is at least 600px wide — narrower than that, the whole block is ignored, and the mobile-first default from the last step is all that applies. The stats section now switches to the 3-column grid from the last lesson, but ONLY at 600px and up. Check the CSS tab — there's a real `@media` block down at the bottom, generated from this exact page.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px", padding: "0 32px" }, [
            { breakpoint: "600px", prop: "display", value: "grid" },
            { breakpoint: "600px", prop: "gridTemplateColumns", value: "repeat(3, 1fr)" },
          ]),
        ],
      },
    },
    {
      id: "challenge-mobile-first-links",
      title: "Your turn: make the links section mobile-first too",
      instructions:
        "The two-column links grid from the last lesson has the same problem — restyle it so its DEFAULT (no media query) is a single stacked column with `display: flex; flex-direction: column;`, matching the mobile-first pattern from the stats section.",
      isChallenge: true,
      patch: {},
      hint: "Just the base styles need to change to display: flex; flex-direction: column; — for real practice afterward, try adding a media query in the Properties panel's Layout section to switch it back to a 2-column grid at 600px, the same way the stats section does.",
      expected: [
        { tag: "header" },
        { tag: "nav" },
        { tag: "main" },
        { tag: "footer" },
        { tag: "div" },
        { tag: "div", styles: { display: "flex", flexDirection: "column" } },
      ],
      solutionPatch: {
        elements: [
          el("links-grid", "div", null, 5, "", {}, { display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", padding: "0 32px" }, [
            { breakpoint: "600px", prop: "display", value: "grid" },
            { breakpoint: "600px", prop: "gridTemplateColumns", value: "repeat(2, 1fr)" },
          ]),
        ],
      },
    },
  ],
};
