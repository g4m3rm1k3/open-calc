import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the curriculum — before "Semantic HTML
// Basics" (which teaches WHICH tag to reach for), a total beginner needs
// "what is a tag" at all. This lesson assumes zero prior knowledge: a tag,
// an element, and the page skeleton every document already has.
export const htmlFoundationsTags: Lesson = {
  id: "html-foundations-tags",
  title: "What Is HTML?",
  description: "Tags, elements, and the skeleton every page starts with — assumes zero prior experience.",
  topic: "html",
  unit: "HTML Foundations",
  steps: [
    {
      id: "the-skeleton",
      title: "Every page starts with the same skeleton",
      instructions:
        "Look at the code panel on the left — even with nothing built yet, it's not empty. `<!DOCTYPE html>` tells the browser \"this is a modern HTML page.\" `<head>` holds information about the page that the reader never sees directly (like its title). `<body>` holds everything a visitor actually sees. Every single HTML page starts this way — you'll never need to type this part by hand in this tool.",
      patch: {},
    },
    {
      id: "your-first-tag",
      title: "A tag is a marker; together, an element",
      instructions:
        "`<h1>` is a tag — a marker that says \"a big heading starts here.\" `</h1>` is its closing tag — \"the heading ends here.\" The tag, its closing tag, and everything between them together are called an *element*. Different tags mean different things: `<h1>` means \"the most important heading on this page.\"",
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
        "`<p>` means \"this is a paragraph of text.\" It looks nothing like `<h1>` when styled, but even completely unstyled, a browser (and a screen reader) already treats them differently — one's a heading, one's body text. That difference is exactly what a tag is for.",
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
        "Add an `<h2>` (a smaller heading than `<h1>` — used for a new section, not the whole page) with the text \"My Hobbies\", followed by a `<p>` listing a few things you enjoy.",
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
