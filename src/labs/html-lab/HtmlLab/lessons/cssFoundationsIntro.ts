import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the CSS track — before "Flexbox Makeover"
// (which assumes a CSS rule is already familiar), this teaches what CSS is
// and the three most basic selector types, each on its own: the element
// itself, an id, and a reusable class.
export const cssFoundationsIntro: Lesson = {
  id: "css-foundations-intro",
  title: "What Is CSS?",
  description: "HTML says what something IS — CSS says what it looks like. One selector type at a time, assuming zero prior experience.",
  topic: "css",
  unit: "CSS Foundations",
  steps: [
    {
      id: "structure-vs-style",
      title: "Unstyled HTML is still a real page",
      instructions:
        "HTML describes what something IS — a heading, a paragraph. It doesn't say what it looks like. Right now this page has zero styling, and that's completely normal: browsers apply sensible defaults, but every visual choice from here on is CSS's job, not HTML's.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Alex Rivera", {}, {}),
          el("lead", "p", null, 1, "Frontend developer based in Chicago.", {}, {}),
        ],
      },
    },
    {
      id: "what-is-a-css-rule",
      title: "A rule is a target plus a list of properties",
      instructions:
        "Watch the CSS tab as this happens: the heading is about to get a color and a size. Whatever style you set, it appears there as an actual CSS RULE, made of two parts — a SELECTOR that says what to target (here, every `<h1>`), and a DECLARATION BLOCK in `{ }` full of `property: value;` pairs, one per line. That two-part shape — target, then properties — is genuinely all a CSS rule ever is.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Alex Rivera", {}, { color: "#0f172a", fontSize: "32px", margin: "0 0 4px" }),
        ],
      },
    },
    {
      id: "id-selectors",
      title: "An id selector (#) targets exactly one element",
      instructions:
        "An element's `id` attribute is meant to be unique — no two elements on the same page should share one. A selector written with a `#` in front, like `#lead`, targets the ONE element with that exact id, and only that one, no matter how the rest of the page changes around it. This tool assigns each element an id like this automatically behind the scenes, which is how a single element's styles stay attached to it specifically.",
      patch: {},
    },
    {
      id: "class-selectors",
      title: "A class selector (.) can target many elements at once",
      instructions:
        "Unlike an id, a `class` attribute can be reused — put the same class on ten different elements, and a selector written with a `.` in front, like `.note`, targets ALL of them at once with one single rule. Here's a paragraph with `class=\"note\"` and its own `.note` rule in the CSS tab — add ten more elements with that same class later, and this one rule would style every single one of them, automatically, with no extra work.",
      patch: {
        elements: [
          el("note", "p", null, 2, "Available for freelance work starting next month.", { class: "note" }, {}),
        ],
        cssBlocks: [{ id: "note-class", code: ".note {\n  color: #64748b;\n  font-style: italic;\n}" }],
      },
    },
    {
      id: "challenge-style-the-lead",
      title: "Your turn: style the lead paragraph",
      instructions:
        "Select the \"Frontend developer...\" paragraph and give it a `color` of `#334155` and a `line-height` of `1.6` (`line-height` controls the vertical spacing between lines of wrapped text — `1.6` means each line takes up 1.6× its own font size in height, which is a comfortable amount of breathing room for body text).",
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
