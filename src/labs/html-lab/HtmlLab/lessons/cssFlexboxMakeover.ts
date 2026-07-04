import { computeSolvedStateAtStep } from "./lessonEngine";
import { htmlBasics } from "./htmlBasics";
import type { Lesson, LabElement } from "./lessonTypes";

function el(
  id: string,
  tag: string,
  parentId: string | null,
  order: number,
  content = "",
  attrs: Record<string, string> = {},
  styles: Record<string, string> = {},
): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "", ...attrs }, styles, mediaQueries: [] };
}

// Picks up exactly where "Semantic HTML Basics" left off — the finished
// journal page (folding its challenge step as solved, same as any other
// completed step) becomes this lesson's own starting content. This is what
// "the same page, restyled" means in practice: no new engine machinery, the
// CSS lesson just seeds its first step with another lesson's already-computed
// end state instead of building its own page from scratch.
const journalPage = computeSolvedStateAtStep(htmlBasics, htmlBasics.steps.length - 1);

export const cssFlexboxMakeover: Lesson = {
  id: "css-flexbox-makeover",
  title: "Flexbox Makeover",
  description: "Take the journal page from Semantic HTML Basics and give it real layout with Flexbox.",
  topic: "css",
  unit: "Flexbox & Layout",
  steps: [
    {
      id: "recap-page",
      title: "Here's the page you built",
      instructions:
        "This is the journal page from Semantic HTML Basics — solid structure, no layout yet. Every section just stacks top to bottom because that's what block elements do by default. Let's change that.",
      patch: { elements: journalPage.elements },
    },
    {
      id: "header-flex-row",
      title: "Flexbox turns stacking into rows",
      instructions:
        "Setting `display: flex` on `<header>` changes how its children lay out — instead of each one taking the full width and stacking, they sit side by side in a row. Add a small badge next to the title to see it happen.",
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
        "The nav is already `display: flex` from the HTML lesson — it just never told its children how to share the extra space. `justify-content: space-between` pushes the first link to the left edge and the last to the right, with even gaps between whatever's in the middle.",
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
        "Make `<footer>` a flex row with `justify-content: space-between`, then add a second element inside it — a `<a>` link with the text \"Back to top\" — so the copyright line and the link sit at opposite ends.",
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
