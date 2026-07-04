import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssBoxModel } from "./cssBoxModel";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Third CSS Foundations lesson — Flexbox from scratch, on three small
// "skill badge" boxes added to the running profile page, BEFORE "Flexbox
// Makeover" (which assumes flex-direction/justify-content/align-items are
// already familiar and applies them to a full real page). Main axis and
// cross axis get their own step before justify-content/align-items lean on
// that vocabulary.
const priorFold = computeSolvedFoldAtStep(cssBoxModel, cssBoxModel.steps.length - 1);

export const cssFlexboxFundamentals: Lesson = {
  id: "css-flexbox-fundamentals",
  title: "Flexbox Fundamentals",
  description: "display: flex, the two axes, justify-content, and align-items — one idea at a time on three small boxes.",
  topic: "css",
  unit: "Flexbox & Layout",
  steps: [
    {
      id: "recap-page",
      title: "Here's the page so far",
      instructions: "Adding a row of skill badges to the bottom of the profile page you've been building.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "flex-row",
      title: "display: flex turns stacking into a row",
      instructions:
        "Without any layout instructions, block-level elements like these three badges each take a full line and stack vertically — that's the default. Setting `display: flex` on their container changes the rule entirely: now its direct children line up in a row instead.",
      patch: {
        elements: [
          el("badges", "div", null, 5, "", {}, { display: "flex", gap: "10px", marginTop: "16px" }),
          el("badge-1", "div", "badges", 0, "HTML", {}, { padding: "6px 14px", background: "#fde68a", borderRadius: "6px", fontSize: "13px", fontWeight: "700" }),
          el("badge-2", "div", "badges", 1, "CSS", {}, { padding: "6px 14px", background: "#bfdbfe", borderRadius: "6px", fontSize: "13px", fontWeight: "700" }),
          el("badge-3", "div", "badges", 2, "JavaScript", {}, { padding: "10px 14px", background: "#bbf7d0", borderRadius: "6px", fontSize: "13px", fontWeight: "700" }),
        ],
      },
    },
    {
      id: "main-axis-and-cross-axis",
      title: "Flexbox thinks in two axes: main and cross",
      instructions:
        "Once a container is `display: flex`, its layout is described using two directions: the MAIN axis is the direction items line up in — a row, left to right, by default — and the CROSS axis runs perpendicular to it — up and down, for a row. The next two steps each control spacing along one of these axes: one along the main axis, one along the cross axis.",
      patch: {},
    },
    {
      id: "justify-content",
      title: "justify-content spaces items along the MAIN axis",
      instructions:
        "`justify-content` controls how extra leftover space along the main axis gets distributed between items. `space-between` pushes the first item all the way to the start of the row, the last item all the way to the end, and spreads the rest evenly in between.",
      patch: {
        elements: [
          el("badges", "div", null, 5, "", {}, { display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "16px" }),
        ],
      },
    },
    {
      id: "align-items",
      title: "align-items lines items up along the CROSS axis",
      instructions:
        "The badges aren't all the same height — \"JavaScript\" has more padding, so it's taller than the other two. `align-items: center` controls the cross axis — up and down, since the main axis here is a row — and centers every item vertically no matter how tall it individually is, instead of the default, which stretches every item to match the tallest one.",
      patch: {
        elements: [
          el("badges", "div", null, 5, "", {}, { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "16px" }),
        ],
      },
    },
    {
      id: "challenge-column-stack",
      title: "Your turn: stack them in a centered column",
      instructions:
        "Add a new flex container with three items of your choice inside it. Make it a column instead of a row using `flex-direction: column`, then center every item with `align-items: center` — remember, `flex-direction: column` swaps which direction is \"main\" and which is \"cross,\" so `align-items` now centers left-to-right instead of top-to-bottom.",
      isChallenge: true,
      patch: {},
      hint: "display: flex; flex-direction: column; align-items: center; — flex-direction: column flips which axis is main and which is cross, so align-items now centers left-to-right instead of top-to-bottom.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "p" },
        { tag: "div" },
        { tag: "div" },
        { tag: "div" },
        {
          tag: "div",
          styles: { display: "flex", flexDirection: "column", alignItems: "center" },
          children: [{ tag: "div" }, { tag: "div" }, { tag: "div" }],
        },
      ],
      solutionPatch: {
        elements: [
          el("stack", "div", null, 6, "", {}, { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "16px" }),
          el("stack-1", "div", "stack", 0, "Step 1", {}, { padding: "6px 14px", background: "#e2e8f0", borderRadius: "6px", fontSize: "13px" }),
          el("stack-2", "div", "stack", 1, "Step 2", {}, { padding: "6px 14px", background: "#e2e8f0", borderRadius: "6px", fontSize: "13px" }),
          el("stack-3", "div", "stack", 2, "Step 3", {}, { padding: "6px 14px", background: "#e2e8f0", borderRadius: "6px", fontSize: "13px" }),
        ],
      },
    },
  ],
};
