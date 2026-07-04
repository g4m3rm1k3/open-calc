import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssFoundationsIntro } from "./cssFoundationsIntro";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second CSS Foundations lesson — continues the Alex Rivera profile page.
// Every element on a page is secretly a box with four layers; this teaches
// each one on its own (padding, then border, then margin) instead of
// naming all four in one sentence, then box-sizing.
const priorFold = computeSolvedFoldAtStep(cssFoundationsIntro, cssFoundationsIntro.steps.length - 1);

export const cssBoxModel: Lesson = {
  id: "css-box-model",
  title: "The Box Model",
  description: "Padding, border, margin, and box-sizing — one layer of the box at a time.",
  topic: "css",
  unit: "CSS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the profile page so far",
      instructions: "The page from What Is CSS? — a name, a title, and an availability note.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "what-is-the-box-model",
      title: "Every element is secretly a box",
      instructions:
        "Whether or not it looks like one, every single element on a page — a heading, a paragraph, a button — is a rectangular box under the hood. That box is built from layers: the content itself sits in the middle, and padding, border, and margin can each be added around it, one wrapped around the next. The next few steps add each of those layers one at a time, so it's clear what each one actually does.",
      patch: {},
    },
    {
      id: "padding",
      title: "Padding is space INSIDE the box's edge",
      instructions:
        "Padding sits between the content and the edge of its own box — it pushes the border and background outward, away from the text, rather than pushing the text itself anywhere. Here's a card with padding added: notice the background color now extends well past the text, because the box grew to include that padding.",
      patch: {
        elements: [
          el("card", "div", null, 3, "", {}, { padding: "20px", backgroundColor: "#f8fafc", marginTop: "20px" }),
          el("card-text", "p", "card", 0, "Padding is breathing room between your content and the edge of its box.", {}, { margin: "0", color: "#334155" }),
        ],
      },
    },
    {
      id: "border",
      title: "Border draws a visible line at the box's edge",
      instructions:
        "`border` draws a visible line exactly where the padding ends and the box's edge is — it's the layer that makes a box actually look like a box. Watch it appear around the card, right at the outer edge of the padding added in the last step.",
      patch: {
        elements: [
          el("card", "div", null, 3, "", {}, { padding: "20px", backgroundColor: "#f8fafc", marginTop: "20px", border: "2px solid #cbd5e1", borderRadius: "8px" }),
        ],
      },
    },
    {
      id: "margin",
      title: "Margin is space OUTSIDE the box, pushing others away",
      instructions:
        "Margin is the one layer that isn't really part of the box's own appearance at all — it doesn't affect that box's background or border, it only adds empty space beyond its edge, pushing NEIGHBORING elements further away. Watch the gap open up between the card and the note below it as margin gets added underneath.",
      patch: {
        elements: [
          el("card", "div", null, 3, "", {}, { padding: "20px", backgroundColor: "#f8fafc", marginTop: "20px", marginBottom: "20px", border: "2px solid #cbd5e1", borderRadius: "8px" }),
        ],
      },
    },
    {
      id: "box-sizing",
      title: "box-sizing decides what \"width\" actually means",
      instructions:
        "By default, `width` sets only the CONTENT's width — padding and border get added ON TOP of it, so a 300px-wide box with 20px of padding on each side actually takes up 340px total. `box-sizing: border-box` changes that rule: padding and border now count AS PART OF the 300px, so the box never grows past the width you gave it, no matter how much padding or border you add later. This card just switched to border-box with a fixed width.",
      patch: {
        elements: [
          el("card", "div", null, 3, "", {}, { padding: "20px", backgroundColor: "#f8fafc", marginTop: "20px", marginBottom: "20px", border: "2px solid #cbd5e1", borderRadius: "8px", width: "320px", boxSizing: "border-box" }),
        ],
      },
    },
    {
      id: "challenge-sizing-box",
      title: "Your turn: build a fixed-size box",
      instructions:
        "Add a new `<div>` that's exactly 200px wide no matter what — give it `width: 200px`, `padding: 16px`, `border: 1px solid` (any color), and `box-sizing: border-box` so the padding and border don't push it past 200px.",
      isChallenge: true,
      patch: {},
      hint: "Without box-sizing: border-box, 200px width + 16px padding on each side + border would render wider than 200px. Setting box-sizing: border-box is what keeps the total at exactly 200px.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "p" },
        { tag: "div" },
        {
          tag: "div",
          styles: { width: "200px", padding: "16px", boxSizing: "border-box" },
        },
      ],
      solutionPatch: {
        elements: [
          el("sizing-box", "div", null, 4, "Always 200px wide.", {}, { width: "200px", padding: "16px", border: "1px solid #94a3b8", boxSizing: "border-box", marginTop: "12px" }),
        ],
      },
    },
  ],
};
