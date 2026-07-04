import { computeSolvedFoldAtStep } from "./lessonEngine";
import { htmlBasics } from "./htmlBasics";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Picks up exactly where "Semantic HTML Basics" left off — the finished
// journal page (folding its challenge step as solved, same as any other
// completed step) becomes this lesson's own starting content. Comes AFTER
// "Flexbox Fundamentals" in the catalog, so display:flex/justify-content/
// align-items are assumed already learned — this lesson is deliberately
// about APPLYING them to a real page, not re-teaching the vocabulary.
const priorFold = computeSolvedFoldAtStep(htmlBasics, htmlBasics.steps.length - 1);

export const cssFlexboxMakeover: Lesson = {
  id: "css-flexbox-makeover",
  title: "Flexbox Makeover",
  description: "Apply what Flexbox Fundamentals taught to a real page — the journal from Semantic HTML Basics.",
  topic: "css",
  unit: "Flexbox & Layout",
  steps: [
    {
      id: "recap-page",
      title: "Here's the page you built",
      instructions:
        "This is the journal page from Semantic HTML Basics — solid structure, no layout yet. Every section just stacks top to bottom, because that's what block elements do by default. Time to put Flexbox Fundamentals to use on a real page instead of a small isolated example.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "header-flex-row",
      title: "Make the header a flex row",
      instructions:
        "Same `display: flex` from Flexbox Fundamentals, applied here to `<header>` — its children stop stacking and line up in a row instead. A small badge has been added next to the title so there's a second item to actually see lining up.",
      patch: {
        elements: [
          el("header", "header", null, 0, "", {}, {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "24px 32px", backgroundColor: "#0f172a",
          }),
          el("header-badge", "span", "header", 1, "✎ Draft", {}, {
            fontSize: "12px", color: "#0f172a", background: "#f8fafc",
            padding: "4px 10px", borderRadius: "999px", fontWeight: "600",
          }),
        ],
      },
    },
    {
      id: "nav-space-between",
      title: "One property, no new elements",
      instructions:
        "The nav is already `display: flex` from the HTML lesson — it just never had `justify-content` set. Adding `justify-content: space-between` pushes the first link to the left edge and the last to the right, with even gaps between whatever's in the middle — the exact same property from Flexbox Fundamentals, just applied to real navigation links instead of practice badges.",
      patch: {
        elements: [
          el("nav", "nav", null, 1, "", {}, {
            display: "flex", justifyContent: "space-between", gap: "16px",
            padding: "12px 32px", backgroundColor: "#1e293b",
          }),
        ],
      },
    },
    {
      id: "challenge-footer-flex",
      title: "Your turn: lay out the footer",
      instructions:
        "Make `<footer>` a flex row with `justify-content: space-between`, then add a second element inside it — an `<a>` link with the text \"Back to top\" — so the copyright line and the link sit at opposite ends.",
      isChallenge: true,
      patch: {},
      hint: "Restyle the existing `<footer>` (don't recreate it) with `display: flex; justify-content: space-between;`, then add an `<a>` as its second child.",
      expected: [
        { tag: "header" },
        { tag: "nav" },
        { tag: "main" },
        {
          tag: "footer",
          styles: { display: "flex", justifyContent: "space-between" },
          children: [{ tag: "p" }, { tag: "a" }],
        },
      ],
      solutionPatch: {
        elements: [
          el("footer", "footer", null, 3, "", {}, {
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 32px", backgroundColor: "#0f172a",
          }),
          el("footer-top-link", "a", "footer", 1, "Back to top", { href: "#" }, {
            color: "#94a3b8", fontSize: "13px", textDecoration: "none",
          }),
        ],
      },
    },
  ],
};
