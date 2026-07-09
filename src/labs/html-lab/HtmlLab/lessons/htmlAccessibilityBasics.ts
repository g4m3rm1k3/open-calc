import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssResponsiveDesign } from "./cssResponsiveDesign";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Seventh HTML lesson — a review pass over the journal page built across
// the HTML and CSS units, not a fresh page: landmarks, aria-label, a real
// skip link, aria-hidden on decorative content, focus order, and one
// icon-only-button challenge each get their own step.
const priorFold = computeSolvedFoldAtStep(cssResponsiveDesign, cssResponsiveDesign.steps.length - 1);

export const htmlAccessibilityBasics: Lesson = {
  id: "html-accessibility-basics",
  title: "Accessibility Basics",
  description: "Landmarks, aria-label, a real skip link, aria-hidden, and focus order — reviewing the journal page.",
  topic: "html",
  unit: "Accessibility Basics",
  steps: [
    {
      id: "recap-page",
      title: "The journal page, built across the last several lessons",
      instructions: "Header, nav, main, footer, and two Flexbox/Grid sections — all real semantic HTML already. Time to look at it through an accessibility lens.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "landmarks-review",
      title: "header/nav/main/footer are already landmarks",
      instructions:
        "Back in Semantic HTML Basics, `<header>`, `<nav>`, `<main>`, and `<footer>` were chosen over generic `<div>`s because they mean something. That meaning is also what makes them LANDMARKS — a screen reader user can pull up a list of every landmark on the page and jump straight to any one of them, the same way a sighted user's eye jumps straight to the nav bar without reading everything above it first. A page built entirely out of `<div>`s has no landmarks to jump to at all.",
      patch: {},
    },
    {
      id: "aria-label-on-nav",
      title: "aria-label names a landmark more specifically",
      instructions:
        "With only one `<nav>` on this page, a screen reader just announces it as \"navigation.\" `aria-label` overrides that announced name with something more specific — useful the moment a page has more than one `<nav>` (a main menu AND a footer nav, say), since \"navigation\" and \"navigation\" would otherwise be indistinguishable. It changes nothing visible at all.",
      patch: {
        elements: [
          el("nav", "nav", null, 1, "", { "aria-label": "Main navigation" }, {
            display: "flex", justifyContent: "space-between", gap: "16px",
            padding: "12px 32px", backgroundColor: "#1e293b",
          }),
        ],
      },
    },
    {
      id: "skip-link",
      title: "A skip link lets keyboard users bypass the nav",
      instructions:
        "Every keyboard-only visitor has to Tab through the header and every nav link before reaching the actual content — on every single page. A \"skip link\" is a real, ordinary `<a>` at the very top of the page pointing at the content's `id` (`href=\"#main-content\"`); activating it jumps focus straight past all of that. Many real sites visually hide this link until it receives keyboard focus (a CSS detail, not covered here) — kept always-visible here to keep the example simple. `<main>` gets the `id` the link points to.",
      patch: {
        elements: [
          el("skip-link", "a", null, -1, "Skip to main content", { href: "#main-content" }, {
            display: "block", padding: "6px 12px", fontSize: "12px",
            color: "#94a3b8", backgroundColor: "#0f172a", textDecoration: "none",
          }),
          el("main", "main", null, 2, "", { id: "main-content" }, { padding: "32px", display: "block" }),
        ],
      },
    },
    {
      id: "aria-hidden-decorative",
      title: "aria-hidden removes purely decorative content from the announcement",
      instructions:
        "A small ★ icon next to the journal title adds nothing a screen reader user needs to hear — the title itself already says everything. `aria-hidden=\"true\"` tells assistive tech to skip an element entirely, as if it weren't in the markup at all, while it stays perfectly visible for sighted users. It should never be used on anything that actually carries information — only on the purely ornamental.",
      patch: {
        elements: [
          // -1, not 0 — h1 (order 0) and header-badge (order 1, from Flexbox
          // Makeover) both already exist under "header"; this only needs to
          // slot in BEFORE them, not renumber elements it isn't touching.
          el("header-star", "span", "header", -1, "★", { "aria-hidden": "true" }, { marginRight: "10px", color: "#facc15" }),
        ],
      },
    },
    {
      id: "focus-order-and-tabindex",
      title: "Tab order follows DOM order — leave it that way",
      instructions:
        "Pressing Tab moves focus through the page in exactly the order elements appear in the HTML — nothing about CSS positioning changes that, by default. `tabindex=\"0\"` can make a normally unfocusable element (like a `<div>`) join that natural order; a POSITIVE `tabindex` (1, 2, 3...) instead forces a custom order, which almost always ends up fighting the visual layout and confusing keyboard users rather than helping them. The rule that holds almost every time: don't set a positive `tabindex` — let source order do its job.",
      patch: {},
    },
    {
      id: "challenge-icon-button-aria-label",
      title: "Your turn: label an icon-only button",
      instructions:
        "A search button has been added to the nav — but it's just a 🔍 icon, no visible text at all, so a screen reader currently has nothing to announce for it. Add `aria-label=\"Search\"` to it.",
      isChallenge: true,
      patch: {
        elements: [
          el("nav-search-btn", "button", "nav", 2, "🔍", { type: "button" }, {
            background: "transparent", border: "none", color: "#94a3b8",
            fontSize: "16px", cursor: "pointer",
          }),
        ],
      },
      hint: "Same button, one more attribute: aria-label=\"Search\" — same idea as aria-label on the nav earlier, just on a button this time.",
      expected: [
        { tag: "a" },
        { tag: "header" },
        {
          tag: "nav",
          children: [
            { tag: "a" }, { tag: "a" },
            { tag: "button", attrs: { "aria-label": "Search" } },
          ],
        },
        { tag: "main" },
        { tag: "footer" },
        { tag: "div" },
        { tag: "div" },
      ],
      solutionPatch: {
        elements: [
          el("nav-search-btn", "button", "nav", 2, "🔍", { type: "button", "aria-label": "Search" }, {
            background: "transparent", border: "none", color: "#94a3b8",
            fontSize: "16px", cursor: "pointer",
          }),
        ],
      },
    },
  ],
};
