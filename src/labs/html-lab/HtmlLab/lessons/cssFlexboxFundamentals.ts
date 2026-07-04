import { computeSolvedStateAtStep } from "./lessonEngine";
import { cssBoxModel } from "./cssBoxModel";
import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Third CSS Foundations lesson — Flexbox from scratch, on three small
// "skill badge" boxes added to the running profile page, BEFORE "Flexbox
// Makeover" (which assumes flex-direction/justify-content/align-items are
// already familiar and applies them to a full real page).
const pageWithBoxModel = computeSolvedStateAtStep(cssBoxModel, cssBoxModel.steps.length - 1);

export const cssFlexboxFundamentals: Lesson = {
  id: "css-flexbox-fundamentals",
  title: "Flexbox Fundamentals",
  description: "display: flex, justify-content, and align-items — layout basics on three small boxes before using them for real.",
  topic: "css",
  unit: "Flexbox & Layout",
  steps: [
    {
      id: "recap-page",
      title: "Here's the page so far",
      instructions: "Adding a row of skill badges to the bottom of the profile page you've been building.",
      patch: { elements: pageWithBoxModel.elements },
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
      id: "justify-content",
      title: "justify-content spaces items along the row",
      instructions:
        "`justify-content` controls how extra space along the row (the *main axis*) gets distributed. `space-between` pushes the first item to the left edge, the last to the right edge, and spreads the rest evenly between them.",
      patch: {
        elements: [
          el("badges", "div", null, 5, "", {}, { display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "16px" }),
        ],
      },
    },
    {
      id: "align-items",
      title: "align-items lines items up the other way",
      instructions:
        "The badges aren't all the same height — notice \"JavaScript\" has more padding, so it's taller. `align-items: center` controls the *cross axis* (up and down, when the main axis is a row) — it centers every item vertically no matter how tall it is, instead of stretching or top-aligning them.",
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
        "Add a new flex container with three items of your choice inside it. Make it a column instead of a row using `flex-direction: column`, and center every item horizontally with `align-items: center` (in a column, align-items controls the horizontal axis).",
      isChallenge: true,
      patch: {},
      hint: "display: flex; flex-direction: column; align-items: center; — flex-direction: column flips which axis is \"main\" and which is \"cross\", so align-items now centers left-to-right instead of top-to-bottom.",
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
