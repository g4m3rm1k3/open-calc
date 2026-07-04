import { computeSolvedStateAtStep } from "./lessonEngine";
import { htmlFoundationsTags } from "./htmlFoundationsTags";
import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second HTML Foundations lesson — picks up the About Me page from "What Is
// HTML?" (same seeding technique as cssFlexboxMakeover: fold the finished
// state of an earlier lesson into this one's first step). Teaches <div>,
// <span>, and attributes (id/class) — the generic, "no meaning of its own"
// tags — deliberately BEFORE "Semantic HTML Basics" teaches when a more
// specific tag beats them.
const aboutMePage = computeSolvedStateAtStep(htmlFoundationsTags, htmlFoundationsTags.steps.length - 1);

export const htmlFoundationsDivSpan: Lesson = {
  id: "html-foundations-div-span",
  title: "Div, Span & Attributes",
  description: "The two tags with no meaning of their own — and id/class, the attributes that make them useful.",
  topic: "html",
  unit: "HTML Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the page from What Is HTML?",
      instructions: "The About Me page you started last lesson — a heading, a bio, and a hobbies section.",
      patch: { elements: aboutMePage.elements },
    },
    {
      id: "group-with-div",
      title: "<div> groups things with no meaning of its own",
      instructions:
        "`<div>` doesn't mean anything — it's a plain box, useful purely for grouping other elements together so you can treat them as one unit (style them together, move them together). Here's a small \"card\" — a heading and a paragraph grouped inside one `<div>`.",
      patch: {
        elements: [
          el("contact-card", "div", null, 4, "", {}, { marginTop: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }),
          el("contact-heading", "h3", "contact-card", 0, "Get In Touch", {}, { fontSize: "16px", margin: "0 0 4px", color: "#0f172a" }),
          el("contact-body", "p", "contact-card", 1, "Email me any time — I usually reply within a day.", {}, { color: "#334155", margin: "0" }),
        ],
      },
    },
    {
      id: "inline-with-span",
      title: "<span> is div's inline cousin",
      instructions:
        "`<span>` is just as meaningless as `<div>` — the difference is `<div>` always starts a new line (block), `<span>` sits right in the middle of text (inline). Reach for `<span>` when you need to target one word or phrase inside a sentence without breaking the flow of the paragraph.",
      patch: {
        elements: [
          el("fun-fact", "p", null, 5, "Fun fact: ", {}, { color: "#334155", lineHeight: "1.6", marginTop: "12px" }),
          el("fun-fact-span", "span", "fun-fact", 0, "I've been coding since I was twelve.", {}, {}),
        ],
      },
    },
    {
      id: "attributes-intro",
      title: "id and class: naming your elements",
      instructions:
        "An attribute adds extra information to a tag. `id` gives ONE element a unique name — no two elements on a page should share an id. `class` gives a REUSABLE label — put the same class on ten elements, and one CSS rule styles all ten at once. Watch the CSS tab: one rule, `.highlight`, is about to apply to the span below.",
      patch: {
        elements: [
          el("contact-card", "div", null, 4, "", { id: "contact-card" }, { marginTop: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }),
          el("fun-fact-span", "span", "fun-fact", 0, "I've been coding since I was twelve.", { class: "highlight" }, {}),
        ],
        customCss: ".highlight {\n  font-weight: 700;\n  color: #0f172a;\n}",
      },
    },
    {
      id: "challenge-your-own-card",
      title: "Your turn: build a card of your own",
      instructions:
        "Add a new `<div>` containing an `<h3>` and a `<p>` of your choice — then, inside that paragraph, wrap one meaningful word in a `<span>`.",
      isChallenge: true,
      patch: {},
      hint: "Same shape as the contact card: a <div> with an <h3> and a <p> inside it. Then, inside the <p>'s content, add a <span> as its own child for one word — like the \"Fun fact\" paragraph does.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "h2" },
        { tag: "p" },
        { tag: "div" },
        { tag: "p" },
        {
          tag: "div",
          children: [
            { tag: "h3" },
            { tag: "p", children: [{ tag: "span" }] },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("skills-card", "div", null, 6, "", {}, { marginTop: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }),
          el("skills-heading", "h3", "skills-card", 0, "What I Work With", {}, { fontSize: "16px", margin: "0 0 4px", color: "#0f172a" }),
          el("skills-body", "p", "skills-card", 1, "Mostly ", {}, { color: "#334155", margin: "0" }),
          el("skills-span", "span", "skills-body", 0, "JavaScript", {}, { fontWeight: "700" }),
        ],
      },
    },
  ],
};
