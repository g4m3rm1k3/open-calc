import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// A first, deliberately small lesson: builds one page across 5 steps,
// teaching semantic tags (header/nav/main/article/footer) instead of
// generic <div>s, ending in one structural challenge. Proves the step
// engine end to end before the full HTML → CSS → JS curriculum is authored.
export const htmlBasics: Lesson = {
  id: "html-basics",
  title: "Semantic HTML Basics",
  description: "Build one real page, learning which tag to reach for and why.",
  topic: "html",
  unit: "Semantic Structure",
  steps: [
    {
      id: "intro-header",
      title: "Start with a header",
      instructions:
        "Every page needs a way to say \"here's what this page is.\" That's what `<header>` is for — not `<div class=\"header\">`, the real `<header>` tag. Screen readers and search engines both understand it without any extra markup.",
      patch: {
        elements: [
          el("header", "header", null, 0, "", {}, { padding: "24px 32px", backgroundColor: "#0f172a", display: "block" }),
          el("h1", "h1", "header", 0, "My Journal", {}, { color: "#f8fafc", margin: "0", fontSize: "28px", display: "block" }),
        ],
      },
    },
    {
      id: "add-nav",
      title: "Add navigation",
      instructions:
        "Links that let someone move around your site belong inside `<nav>` — even just two of them. It tells assistive tech \"this group of links is for navigating,\" which a plain `<div>` full of `<a>` tags never does.",
      patch: {
        elements: [
          el("nav", "nav", null, 1, "", {}, { display: "flex", gap: "16px", padding: "12px 32px", backgroundColor: "#1e293b" }),
          el("nav-a1", "a", "nav", 0, "Home", { href: "#" }, { color: "#94a3b8", textDecoration: "none" }),
          el("nav-a2", "a", "nav", 1, "About", { href: "#" }, { color: "#94a3b8", textDecoration: "none" }),
        ],
      },
    },
    {
      id: "add-main",
      title: "The real content goes in <main>",
      instructions:
        "`<main>` marks the one piece of a page that's actually unique to it — not the header, not the nav, the content itself. A page should only ever have one `<main>`.",
      patch: {
        elements: [
          el("main", "main", null, 2, "", {}, { padding: "32px", display: "block" }),
          el("main-p", "p", "main", 0, "Welcome to my journal — a place I write about what I'm learning.", {}, { color: "#334155", lineHeight: "1.6" }),
        ],
      },
    },
    {
      id: "add-article",
      title: "Each entry is an <article>",
      instructions:
        "A blog post, a comment, a product card — anything that would still make sense if you pulled it out and put it on its own page belongs in `<article>`. Let's add the first journal entry inside `<main>`.",
      patch: {
        elements: [
          el("article", "article", "main", 1, "", {}, { padding: "16px 0", borderTop: "1px solid #e2e8f0", display: "block" }),
          el("article-h2", "h2", "article", 0, "Day 1: Getting Started", {}, { fontSize: "20px", margin: "0 0 8px", color: "#0f172a" }),
          // Element `content` is inserted raw into the generated HTML (matching
          // how the rest of HTML Lab already works, e.g. exampleProject.ts) —
          // a literal "<div>" here would get reparsed as a real nested tag the
          // moment the HTML tab round-trips, hence the escaped entity.
          el("article-p", "p", "article", 1, "Today I learned the difference between &lt;div&gt; and a semantic tag.", {}, { color: "#334155", lineHeight: "1.6" }),
        ],
      },
    },
    {
      id: "challenge-footer",
      title: "Your turn: add a footer",
      instructions:
        "Every page ends with a `<footer>` — usually a copyright line, sometimes more links. Add a `<footer>` as its own top-level element (a sibling of `<header>`, `<nav>`, and `<main>` — not nested inside any of them), with one `<p>` inside it.",
      isChallenge: true,
      patch: {}, // blank scaffold — nothing added yet, the student builds this
      hint: "Use the Toolbox's \"+ New\" or drag a plain element onto the canvas, set its tag to `footer` in the Properties panel, then add a `<p>` inside it with some text.",
      expected: [
        { tag: "header" },
        { tag: "nav" },
        { tag: "main" },
        { tag: "footer", children: [{ tag: "p" }] },
      ],
      solutionPatch: {
        elements: [
          el("footer", "footer", null, 3, "", {}, { padding: "16px 32px", backgroundColor: "#0f172a", display: "block" }),
          el("footer-p", "p", "footer", 0, "© 2026 My Journal", {}, { color: "#94a3b8", margin: "0", fontSize: "13px" }),
        ],
      },
    },
  ],
};
