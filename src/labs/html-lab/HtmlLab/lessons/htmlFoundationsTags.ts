import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the curriculum — before "Semantic HTML
// Basics" (which teaches WHICH tag to reach for), a total beginner needs
// "what is a tag" at all. Rewritten so the page skeleton, tags, and
// "element" each get their own step instead of being defined together in
// one paragraph.
export const htmlFoundationsTags: Lesson = {
  id: "html-foundations-tags",
  title: "What Is HTML?",
  description: "The page skeleton, tags, and elements — one idea at a time, assuming zero prior experience.",
  topic: "html",
  unit: "HTML Foundations",
  steps: [
    {
      id: "the-doctype",
      title: "<!DOCTYPE html> says \"this is a modern web page\"",
      instructions:
        "Look at the code panel on the left — even with nothing built yet, it's not empty. The very first line, `<!DOCTYPE html>`, tells the browser exactly how to interpret everything that follows: as a modern HTML page, using today's rules. Every single HTML page starts with this exact line — you'll never need to type it by hand in this tool, it's just always there.",
      patch: {},
    },
    {
      id: "head-and-body",
      title: "Every page splits into <head> and <body>",
      instructions:
        "Below the doctype are two sections. `<head>` holds information ABOUT the page that a visitor never sees directly — its title, for instance. `<body>` holds everything a visitor actually sees and reads. That split — invisible information vs. visible content — is the very first structural decision every HTML page makes.",
      patch: {},
    },
    {
      id: "opening-and-closing-tags",
      title: "A tag comes in a pair: opening and closing",
      instructions:
        "`<h1>` is an opening tag — it marks \"something starts here.\" `</h1>`, with the extra `/`, is its closing tag — \"that something ends here.\" Tags almost always come in these matching pairs, one to start, one to end, wrapped around whatever they apply to.",
      patch: {},
    },
    {
      id: "what-is-an-element",
      title: "A tag pair plus its contents is called an element",
      instructions:
        "An opening tag, a closing tag, and everything in between — together, the whole thing is called an element. `<h1>Hi, I'm Alex</h1>` is one element: an `<h1>` heading element containing the text \"Hi, I'm Alex.\" Here's the first real one, on the page for the first time.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Hi, I'm Alex", {}, { fontSize: "28px", margin: "0 0 8px", color: "#0f172a" }),
        ],
      },
    },
    {
      id: "your-first-paragraph",
      title: "A different tag means different meaning",
      instructions:
        "`<p>` means \"this is a paragraph of text\" — a completely different meaning from `<h1>`, even before either one has any styling at all. A browser (and a screen reader) already treats them differently the moment they're written: one is a heading, one is body text. That difference in meaning is exactly what a tag is for.",
      patch: {
        elements: [
          el("bio", "p", null, 1, "I'm a software developer who loves building things for the web.", {}, { color: "#334155", lineHeight: "1.6" }),
        ],
      },
    },
    {
      id: "challenge-hobbies-section",
      title: "Your turn: add a second section",
      instructions:
        "`<h2>` is a heading too, just one step down from `<h1>` — used for a new section within the page, rather than the page's single main title. Add an `<h2>` with the text \"My Hobbies\", followed by a `<p>` listing a few things you enjoy.",
      isChallenge: true,
      patch: {},
      hint: "Two new top-level elements: an <h2> after the bio paragraph, then a <p> after that — same shape as the <h1> and <p> you already have, just a size smaller for the heading.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "h2" },
        { tag: "p" },
      ],
      solutionPatch: {
        elements: [
          el("hobbies-heading", "h2", null, 2, "My Hobbies", {}, { fontSize: "20px", margin: "16px 0 8px", color: "#0f172a" }),
          el("hobbies-body", "p", null, 3, "Reading science fiction, hiking on weekends, and tinkering with old synthesizers.", {}, { color: "#334155", lineHeight: "1.6" }),
        ],
      },
    },
  ],
};
