import { computeSolvedStateAtStep } from "./lessonEngine";
import { cssFoundationsIntro } from "./cssFoundationsIntro";
import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second CSS Foundations lesson — continues the Alex Rivera profile page
// from "What Is CSS?". Every element on a page is secretly a box; this
// lesson makes that box visible, layer by layer: content, padding, border,
// margin, then box-sizing (the one property that decides whether padding
// and border grow the box or eat into it).
const profilePage = computeSolvedStateAtStep(cssFoundationsIntro, cssFoundationsIntro.steps.length - 1);

export const cssBoxModel: Lesson = {
  id: "css-box-model",
  title: "The Box Model",
  description: "Content, padding, border, and margin — every element is a box, whether it looks like one or not.",
  topic: "css",
  unit: "CSS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the profile page so far",
      instructions: "The page from What Is CSS? — a name, a title, and an availability note.",
      patch: { elements: profilePage.elements },
    },
    {
      id: "content-and-padding",
      title: "Content, then padding around it",
      instructions:
        "Every box has four layers, from the inside out: content (the text or elements themselves), padding (space between the content and the edge), border (a line at the edge), and margin (space outside the edge, pushing other elements away). Here's a card with just padding added so far — notice how it pushes the border/background outward from the text, not the text inward.",
      patch: {
        elements: [
          el("card", "div", null, 3, "", {}, { padding: "20px", backgroundColor: "#f8fafc", marginTop: "20px" }),
          el("card-text", "p", "card", 0, "Padding is breathing room between your content and the edge of its box.", {}, { margin: "0", color: "#334155" }),
        ],
      },
    },
    {
      id: "border-and-margin",
      title: "Border sits between padding and margin",
      instructions:
        "A `border` draws a visible line right where padding ends. `margin` is the space OUTSIDE that line — it doesn't affect the box's own background or border, it only pushes neighboring elements away. Watch the border appear, and the gap it creates above the note below.",
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
        "By default, `width` only sets the CONTENT's width — padding and border get added on top, so a 300px-wide box with 20px of padding on each side actually takes up 340px. `box-sizing: border-box` changes the rule: padding and border now count AS PART OF the 300px, so the box never grows past the width you gave it. This card just switched to border-box with a fixed width — resize the padding later and it'll never overflow its column.",
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
