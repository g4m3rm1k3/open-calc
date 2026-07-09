import { computeSolvedFoldAtStep } from "./lessonEngine";
import { cssResponsiveDesign } from "./cssResponsiveDesign";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Continues the journal page from "Responsive Design & Media Queries" — the
// last CSS lesson before this one. :hover (a genuinely new idea — every
// selector so far has applied unconditionally), transition, @keyframes, and
// animation each get their own step. Graded challenges check the
// transition/animation STYLE PROPERTY on an element (validateStructure
// already supports this) rather than hand-written :hover/@keyframes CSS
// text, which nothing in the engine diffs — the :hover/@keyframes rules
// themselves are always author-provided scaffolding, narrated and shown in
// the CSS tab, same pattern css-foundations-intro already uses for its own
// class-selector step.
const priorFold = computeSolvedFoldAtStep(cssResponsiveDesign, cssResponsiveDesign.steps.length - 1);

export const cssTransitionsAnimations: Lesson = {
  id: "css-transitions-animations",
  title: "Transitions & Animations",
  description: ":hover, transition, @keyframes, and animation — one idea at a time on the journal page.",
  topic: "css",
  unit: "Transitions & Animations",
  steps: [
    {
      id: "recap-page",
      title: "The journal page so far",
      instructions: "Structure, Flexbox, Grid, responsive layout — all done. Nothing on this page moves yet; that's what this lesson adds.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "hover-pseudo-class",
      title: ":hover applies ONLY while the mouse is actually over it",
      instructions:
        "Every selector so far — element, `#id`, `.class` — applies all the time, unconditionally. `:hover`, attached to the end of a selector, is different: `.nav-link:hover` only matches while a mouse pointer is actually sitting over that element, and stops matching the instant it leaves. Switch to Preview and hover over a nav link to see it — right now the color just snaps, instantly, the moment the mouse arrives or leaves.",
      patch: {
        elements: [
          el("nav-a1", "a", "nav", 0, "Home", { href: "#", class: "nav-link" }, { color: "#94a3b8", textDecoration: "none" }),
          el("nav-a2", "a", "nav", 1, "About", { href: "#", class: "nav-link" }, { color: "#94a3b8", textDecoration: "none" }),
        ],
        cssBlocks: [{ id: "nav-link-hover", code: ".nav-link:hover {\n  color: #f8fafc;\n}" }],
      },
    },
    {
      id: "transition-smooths-it",
      title: "transition turns a snap into a smooth change",
      instructions:
        "`transition: color 0.2s ease;` tells the browser: whenever THIS element's `color` changes, for ANY reason, animate it smoothly over 0.2 seconds instead of snapping instantly. It's set on the link itself (its normal, always-on style), not inside the `:hover` rule — that's what lets it smooth the change in BOTH directions, hovering on and moving away. Preview again — the color now fades instead of snapping.",
      patch: {
        elements: [
          el("nav-a1", "a", "nav", 0, "Home", { href: "#", class: "nav-link" }, { color: "#94a3b8", textDecoration: "none", transition: "color 0.2s ease" }),
          el("nav-a2", "a", "nav", 1, "About", { href: "#", class: "nav-link" }, { color: "#94a3b8", textDecoration: "none", transition: "color 0.2s ease" }),
        ],
      },
    },
    {
      id: "challenge-transition-the-footer-link",
      title: "Your turn: smooth the footer link too",
      instructions:
        "The \"Back to top\" link in the footer already has a `:hover` rule (given below) that lightens its color, but the change still snaps. Add `transition: color 0.2s ease;` to the link's OWN style — same property and value as the nav links.",
      isChallenge: true,
      patch: {
        elements: [
          el("footer-top-link", "a", "footer", 1, "Back to top", { href: "#", class: "footer-link" }, { color: "#94a3b8", fontSize: "13px", textDecoration: "none" }),
        ],
        cssBlocks: [{ id: "footer-link-hover", code: ".footer-link:hover {\n  color: #f8fafc;\n}" }],
      },
      hint: "Select the \"Back to top\" link and add transition: color 0.2s ease; to its style — exactly what the nav links got two steps ago.",
      expected: [
        { tag: "header" },
        { tag: "nav" },
        { tag: "main" },
        {
          tag: "footer",
          children: [{ tag: "p" }, { tag: "a", styles: { transition: "color 0.2s ease" } }],
        },
      ],
      solutionPatch: {
        elements: [
          el("footer-top-link", "a", "footer", 1, "Back to top", { href: "#", class: "footer-link" }, { color: "#94a3b8", fontSize: "13px", textDecoration: "none", transition: "color 0.2s ease" }),
        ],
      },
    },
    {
      id: "keyframes-basics",
      title: "@keyframes names a whole sequence, not just A and B",
      instructions:
        "`transition` only ever smooths a change from one value to another — it needs something else (like `:hover`) to trigger it. `@keyframes` is different: it names a full animation sequence as a series of snapshots at percentages of its duration. `fade-in` below has two snapshots: `from` (0%, fully transparent) and `to` (100%, fully opaque) — a fade, defined once, by name, ready to be used anywhere.",
      patch: {
        cssBlocks: [{ id: "fade-in-keyframes", code: "@keyframes fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}" }],
      },
    },
    {
      id: "animation-property",
      title: "animation applies a @keyframes sequence by name",
      instructions:
        "`animation: fade-in 0.6s ease;` runs the `fade-in` sequence from the last step over 0.6 seconds — and unlike `transition`, it needs no trigger at all; it just plays. Applied here to the welcome paragraph in `<main>`, so it fades in on its own the moment the page loads.",
      patch: {
        elements: [
          el("main-p", "p", "main", 0, "Welcome to my journal — a place I write about what I'm learning.", {}, { color: "#334155", lineHeight: "1.6", animation: "fade-in 0.6s ease" }),
        ],
      },
    },
    {
      id: "challenge-animate-a-new-badge",
      title: "Your turn: animate a new badge",
      instructions:
        "A \"New!\" badge has been added next to the journal title, but it just appears instantly. Give it `animation: fade-in 0.6s ease;` — same `@keyframes` sequence from two steps ago, applied to a different element.",
      isChallenge: true,
      patch: {
        elements: [
          el("new-badge", "span", "header", 2, "New!", {}, { fontSize: "11px", color: "#0f172a", background: "#facc15", padding: "2px 8px", borderRadius: "999px", fontWeight: "700", marginLeft: "10px" }),
        ],
      },
      hint: "Select the \"New!\" badge and add animation: fade-in 0.6s ease; to its style — the exact same value the welcome paragraph got.",
      expected: [
        {
          tag: "header",
          // header's children so far, in order: h1 (title), header-badge
          // (the "✎ Draft" span from Flexbox Makeover), then this new badge.
          children: [
            { tag: "h1" }, { tag: "span" },
            { tag: "span", styles: { animation: "fade-in 0.6s ease" } },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("new-badge", "span", "header", 2, "New!", {}, { fontSize: "11px", color: "#0f172a", background: "#facc15", padding: "2px 8px", borderRadius: "999px", fontWeight: "700", marginLeft: "10px", animation: "fade-in 0.6s ease" }),
        ],
      },
    },
  ],
};
