import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssFlexboxMakeover } from "./cssFlexboxMakeover";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Continues the journal page from "Flexbox Makeover" — the CSS unit's
// running project so far has been entirely Flexbox (one-dimensional: a row
// OR a column). Grid is the one for BOTH at once. display:grid,
// grid-template-columns (with its repeat()/fr shorthand), and gap each get
// their own step.
const priorFold = computeSolvedFoldAtStep(cssFlexboxMakeover, cssFlexboxMakeover.steps.length - 1);

export const cssGridFundamentals: Lesson = {
  id: "css-grid-fundamentals",
  title: "CSS Grid Fundamentals",
  description: "display: grid, grid-template-columns, fr units, and gap — one idea at a time on a stats section.",
  topic: "css",
  unit: "CSS Grid",
  steps: [
    {
      id: "recap-page",
      title: "Here's the journal page so far",
      instructions: "Header, nav, and footer are all Flexbox rows now. Adding a stats section to the bottom of the page.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "two-dimensional-layout",
      title: "Grid handles rows AND columns at once",
      instructions:
        "Flexbox, from the last two lessons, is one-dimensional — a single row, or a single column, never both at the same time. Grid is two-dimensional: rows and columns together in one layout, which is exactly what a grid of equal boxes needs. Here are three stat boxes, stacking by default because nothing's telling them to do otherwise yet.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { marginTop: "24px", padding: "0 32px" }),
          el("stat-1", "div", "stats", 0, "12 — Posts Published", {}, { padding: "16px", background: "#f1f5f9", borderRadius: "8px", textAlign: "center", fontWeight: "700" }),
          el("stat-2", "div", "stats", 1, "5 — Years Writing", {}, { padding: "16px", background: "#f1f5f9", borderRadius: "8px", textAlign: "center", fontWeight: "700" }),
          el("stat-3", "div", "stats", 2, "1.2k — Subscribers", {}, { padding: "16px", background: "#f1f5f9", borderRadius: "8px", textAlign: "center", fontWeight: "700" }),
        ],
      },
    },
    {
      id: "display-grid",
      title: "display: grid turns on grid layout",
      instructions:
        "Same idea as `display: flex` from the last two lessons — `display: grid` tells a container \"lay out your direct children using grid rules,\" turning the feature on. On its own it doesn't define any actual rows or columns yet; the next step is what shapes those.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { display: "grid", marginTop: "24px", padding: "0 32px" }),
        ],
      },
    },
    {
      id: "grid-template-columns",
      title: "grid-template-columns defines the columns themselves",
      instructions:
        "`grid-template-columns: repeat(3, 1fr)` describes exactly three columns. `1fr` is a unit meaning \"one fraction of whatever space is left\" — three columns of `1fr` each split the available width evenly between them. `repeat(3, 1fr)` just saves typing `1fr 1fr 1fr` by hand; it means the same thing.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "24px", padding: "0 32px" }),
        ],
      },
    },
    {
      id: "gap-property",
      title: "gap works the same way in Grid and Flexbox",
      instructions:
        "Right now the three boxes are touching. `gap` creates space BETWEEN grid cells (or flex items, from the last two lessons) without the old trick of adding margin to every box and then subtracting it back out at the edges — one property, and it never adds extra space around the outside of the whole group.",
      patch: {
        elements: [
          el("stats", "div", null, 4, "", {}, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "24px", padding: "0 32px" }),
        ],
      },
    },
    {
      id: "challenge-two-column-grid",
      title: "Your turn: a two-column grid",
      instructions:
        "Add a new grid container with two items inside it (anything you like). Give it `display: grid`, `grid-template-columns: repeat(2, 1fr)`, and a `gap` of your choice.",
      isChallenge: true,
      patch: {},
      hint: "Same shape as the stats section: a <div> with display: grid, grid-template-columns: repeat(2, 1fr), and gap, containing two child <div>s.",
      expected: [
        { tag: "header" },
        { tag: "nav" },
        { tag: "main" },
        { tag: "footer" },
        { tag: "div" },
        {
          tag: "div",
          styles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)" },
          children: [{ tag: "div" }, { tag: "div" }],
        },
      ],
      solutionPatch: {
        elements: [
          el("links-grid", "div", null, 5, "", {}, { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "16px", padding: "0 32px" }),
          el("links-1", "div", "links-grid", 0, "RSS Feed", {}, { padding: "12px", background: "#f1f5f9", borderRadius: "8px", textAlign: "center" }),
          el("links-2", "div", "links-grid", 1, "Newsletter", {}, { padding: "12px", background: "#f1f5f9", borderRadius: "8px", textAlign: "center" }),
        ],
      },
    },
  ],
};
