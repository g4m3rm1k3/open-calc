import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the CSS track — before "Flexbox Makeover"
// (which assumes you already know what a CSS rule even is), this teaches
// what CSS is, that every style you set becomes a real rule, and the two
// most basic selector types: the element itself, and a reusable class.
export const cssFoundationsIntro: Lesson = {
  id: "css-foundations-intro",
  title: "What Is CSS?",
  description: "HTML says what something IS — CSS says what it looks like. Assumes zero prior experience.",
  topic: "css",
  unit: "CSS Foundations",
  steps: [
    {
      id: "structure-vs-style",
      title: "Unstyled HTML is still a real page",
      instructions:
        "HTML describes what something IS — a heading, a paragraph. It doesn't say what it looks like. Right now this page has zero styling, and that's completely normal: browsers apply sensible defaults, but every visual choice from here is CSS's job, not HTML's.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Alex Rivera", {}, {}),
          el("lead", "p", null, 1, "Frontend developer based in Chicago.", {}, {}),
        ],
      },
    },
    {
      id: "your-first-rule",
      title: "Every style becomes a real rule",
      instructions:
        "Watch the CSS tab as this happens: `<h1>` is getting a color and a font size. Whatever style you set here, it appears there as an actual CSS rule — a target (a *selector*) and a list of `property: value;` pairs. That's genuinely all CSS is.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Alex Rivera", {}, { color: "#0f172a", fontSize: "32px", margin: "0 0 4px" }),
        ],
      },
    },
    {
      id: "class-selectors",
      title: "A class selector can style many elements at once",
      instructions:
        "An `id` selector styles exactly one element. A *class* selector — written with a dot, like `.note` — matches every element with that class, no matter how many there are or how many you add later. Here's one paragraph using a class, with its own rule in the CSS tab.",
      patch: {
        elements: [
          el("note", "p", null, 2, "Available for freelance work starting next month.", { class: "note" }, {}),
        ],
        customCss: ".note {\n  color: #64748b;\n  font-style: italic;\n}",
      },
    },
    {
      id: "challenge-style-the-lead",
      title: "Your turn: style the lead paragraph",
      instructions:
        "Select the \"Frontend developer...\" paragraph and give it a `color` of `#334155` and a `line-height` of `1.6`.",
      isChallenge: true,
      patch: {},
      hint: "Click the paragraph in the canvas (or select it in the Tree tab), then use the Properties panel on the right to set its color and line-height — exactly the same way the heading's color and font-size were set two steps ago.",
      expected: [
        { tag: "h1" },
        { tag: "p", styles: { color: "#334155", lineHeight: "1.6" } },
      ],
      solutionPatch: {
        elements: [
          el("lead", "p", null, 1, "Frontend developer based in Chicago.", {}, { color: "#334155", lineHeight: "1.6" }),
        ],
      },
    },
  ],
};
