import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Third HTML lesson — a short book-review page. Where html-basics taught
// landmark tags and html-lists-forms taught lists/forms, this one is about
// INLINE text semantics: <strong>/<em> vs <b>/<i>, <blockquote>/<cite>, and
// <time>. Two challenges instead of one — a small mid-lesson check right
// after <em> is introduced, then the usual end-of-lesson one — so a concept
// gets tested while it's still fresh instead of only at the very end.
export const htmlTextSemantics: Lesson = {
  id: "html-text-semantics",
  title: "Text & Inline Semantics",
  description: "Learn which inline tag actually means something — <strong> and <em> vs. plain bold and italic.",
  topic: "html",
  unit: "Text & Inline Semantics",
  steps: [
    {
      id: "intro-review",
      title: "Start with the words",
      instructions:
        "A review is mostly text, so mostly `<p>` tags. One `<h1>` for the title, one `<p>` for the opening line — nothing fancy yet.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Dune: A Review", {}, { fontSize: "28px", margin: "0 0 12px", color: "#0f172a" }),
          el("lead", "p", null, 1, "It took me three tries to get past the first fifty pages. I'm glad I kept going.", {}, { color: "#334155", lineHeight: "1.7" }),
        ],
      },
    },
    {
      id: "strong-warning",
      title: "<strong> means it, <b> just looks like it",
      instructions:
        "`<strong>` tells a screen reader \"this part actually matters more\" — it's not just bold text, it changes how the sentence is announced. `<b>` only changes the look, with zero semantic weight. A spoiler warning is exactly the kind of thing that should be `<strong>`.",
      patch: {
        elements: [
          el("warning", "p", null, 2, "Fair warning: ", {}, { color: "#334155", lineHeight: "1.7" }),
          el("warning-strong", "strong", "warning", 0, "there are major spoilers below.", {}, {}),
        ],
      },
    },
    {
      id: "challenge-emphasis",
      title: "Your turn: genuine emphasis",
      instructions:
        "Add one more paragraph. Somewhere in it, use `<em>` around a word or phrase you'd actually stress if you were reading it out loud — not just italics for decoration, real emphasis that changes the sentence's meaning.",
      isChallenge: true,
      patch: {},
      hint: "Something like: <p>This book completely <em>changed</em> how I think about world-building.</p> — the emphasized word is the one that would sound different if you said it out loud.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "p" },
        { tag: "p", children: [{ tag: "em" }] },
      ],
      solutionPatch: {
        elements: [
          el("emphasis-p", "p", null, 3, "This book completely ", {}, { color: "#334155", lineHeight: "1.7" }),
          el("emphasis-em", "em", "emphasis-p", 0, "changed", {}, {}),
        ],
      },
    },
    {
      id: "blockquote",
      title: "<blockquote> marks a pulled quotation",
      instructions:
        "A quote pulled directly from the book itself — not your own writing — belongs in `<blockquote>`. It tells a reader, and a screen reader, exactly where your commentary stops and someone else's original words begin.",
      patch: {
        elements: [
          el("quote", "blockquote", null, 4, "", {}, { margin: "20px 0", padding: "4px 0 4px 16px", borderLeft: "3px solid #cbd5e1", color: "#475569", fontStyle: "italic" }),
          el("quote-text", "p", "quote", 0, "Fear is the mind-killer.", {}, { margin: "0 0 4px" }),
        ],
      },
    },
    {
      id: "cite",
      title: "<cite> names the source of a quotation",
      instructions:
        "When a quote names where it came from, that name — the book title, the author, the speaker — goes in `<cite>`, usually right alongside the `<blockquote>` it belongs to. It's a small tag with one very specific job: marking \"this text is the name of the work or person being cited.\"",
      patch: {
        elements: [
          el("quote-cite", "cite", "quote", 1, "— Frank Herbert, Dune", {}, { fontStyle: "normal", fontSize: "13px", color: "#64748b" }),
        ],
      },
    },
    {
      id: "challenge-byline",
      title: "Your turn: a dated byline",
      instructions:
        "Add a final paragraph noting when you reviewed it — something like \"Reviewed on \" followed by a `<time>` element wrapping the actual date, with a `datetime` attribute in YYYY-MM-DD format. `<time>` lets software (and search engines) read a date that's written in a human-friendly way.",
      isChallenge: true,
      patch: {},
      hint: "<p>Reviewed on <time datetime=\"2026-01-03\">January 3, 2026</time></p> — the visible text can be friendly, `datetime` is what machines read.",
      expected: [
        { tag: "h1" },
        { tag: "p" },
        { tag: "p" },
        { tag: "p" },
        { tag: "blockquote" },
        { tag: "p", children: [{ tag: "time" }] },
      ],
      solutionPatch: {
        elements: [
          el("byline", "p", null, 5, "Reviewed on ", {}, { color: "#64748b", fontSize: "13px" }),
          el("byline-time", "time", "byline", 0, "January 3, 2026", { datetime: "2026-01-03" }, {}),
        ],
      },
    },
  ],
};
