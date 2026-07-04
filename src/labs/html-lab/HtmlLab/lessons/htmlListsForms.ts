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

// Second HTML lesson — a fresh short page (a reading list), not chained to
// html-basics. Proves the multi-element playback path on <ul>/<li> and a
// real <form>, and gives the catalog a second entry in the same unit-group
// pattern the CSS/JS lessons will keep following.
export const htmlListsForms: Lesson = {
  id: "html-lists-forms",
  title: "Lists & Forms",
  description: "Build a reading list with a real <ul> and a form for adding to it.",
  topic: "html",
  unit: "Lists & Forms",
  steps: [
    {
      id: "intro-list",
      title: "A list is a <ul>, not three <div>s",
      instructions:
        "Three items that belong together, in an order the reader should follow — that's a `<ul>` (or `<ol>` if the order itself matters, like steps in a recipe). Each item is its own `<li>`.",
      patch: {
        elements: [
          el("h1", "h1", null, 0, "My Reading List", {}, { fontSize: "26px", margin: "0 0 16px", color: "#0f172a" }),
          el("list", "ul", null, 1, "", {}, { padding: "0 0 0 20px", margin: "0", color: "#334155", lineHeight: "1.8" }),
          el("li-1", "li", "list", 0, "The Pragmatic Programmer", {}, {}),
          el("li-2", "li", "list", 1, "Designing Data-Intensive Applications", {}, {}),
          el("li-3", "li", "list", 2, "A Philosophy of Software Design", {}, {}),
        ],
      },
    },
    {
      id: "add-form",
      title: "Collecting input needs a <form>",
      instructions:
        "Any time you're asking for input — even just one field — wrap it in a `<form>`. It's what makes the Enter key submit, what lets a `<label>` correctly point at its field, and what screen readers expect.",
      patch: {
        elements: [
          el("add-form", "form", null, 2, "", {}, { display: "flex", gap: "8px", marginTop: "20px" }),
          el("add-label", "label", "add-form", 0, "New book", { for: "new-book" }, { position: "absolute", width: "1px", height: "1px", overflow: "hidden" }),
          el("add-input", "input", "add-form", 1, "", { id: "new-book", type: "text", placeholder: "Book title" }, { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: "1" }),
          el("add-button", "button", "add-form", 2, "Add", { type: "submit" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
      },
    },
    {
      id: "challenge-labelled-input",
      title: "Your turn: label it properly",
      instructions:
        "Add one more field to the form for the author's name: a `<label>` (visually hidden like the one above is fine) correctly linked to an `<input>` via matching `for`/`id`, placed before the Add button.",
      isChallenge: true,
      patch: {},
      hint: "The `<label>`'s `for` attribute and the `<input>`'s `id` attribute need to match exactly — that's the link a screen reader (and a click on the label) relies on.",
      expected: [
        { tag: "h1" },
        { tag: "ul" },
        {
          tag: "form",
          children: [
            { tag: "label" },
            { tag: "input" },
            { tag: "label" },
            { tag: "input" },
            { tag: "button" },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("author-label", "label", "add-form", 2, "Author", { for: "author" }, { position: "absolute", width: "1px", height: "1px", overflow: "hidden" }),
          el("author-input", "input", "add-form", 3, "", { id: "author", type: "text", placeholder: "Author" }, { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: "1" }),
          el("add-button", "button", "add-form", 4, "Add", { type: "submit" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
      },
    },
  ],
};
