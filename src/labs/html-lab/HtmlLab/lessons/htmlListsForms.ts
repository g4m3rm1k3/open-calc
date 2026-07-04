import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second HTML lesson — a fresh short page (a reading list), not chained to
// html-basics. <ul>, <ol>, <form>, and the label/input relationship each
// get their own step instead of being introduced together.
export const htmlListsForms: Lesson = {
  id: "html-lists-forms",
  title: "Lists & Forms",
  description: "ul, ol, li, form, and label — one idea at a time, on a reading list.",
  topic: "html",
  unit: "Lists & Forms",
  steps: [
    {
      id: "unordered-lists",
      title: "<ul> is a list where order doesn't matter",
      instructions:
        "Three items that belong together — that's a list. `<ul>` (unordered list) is for a list where the order genuinely doesn't matter; rearranging the items wouldn't change their meaning. Each individual item inside it is its own `<li>` (list item).",
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
      id: "ordered-lists",
      title: "<ol> is a list where order DOES matter",
      instructions:
        "`<ol>` (ordered list) looks almost identical to `<ul>` — same `<li>` items inside — but it means something different: the sequence itself carries meaning. Steps in a recipe, or a ranked top-10, belong in `<ol>`, because swapping two items would actually change what the list is saying. This reading list doesn't have a meaningful order, which is exactly why it's a `<ul>` and not an `<ol>`.",
      patch: {},
    },
    {
      id: "what-is-a-form",
      title: "<form> wraps anything collecting input",
      instructions:
        "Any time a page is asking for input — even just one field — that field belongs inside a `<form>`. Wrapping it is what makes pressing Enter submit the field, and it's what a screen reader expects when it encounters something meant to be filled in, rather than just read.",
      patch: {
        elements: [
          el("add-form", "form", null, 2, "", {}, { display: "flex", gap: "8px", marginTop: "20px" }),
          el("add-input", "input", "add-form", 0, "", { id: "new-book", type: "text", placeholder: "Book title" }, { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: "1" }),
          el("add-button", "button", "add-form", 1, "Add", { type: "submit" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
      },
    },
    {
      id: "label-input-relationship",
      title: "<label> connects to an input by matching for/id",
      instructions:
        "A `<label>`'s `for` attribute and an `<input>`'s `id` attribute, when they match exactly, link the two together — clicking the label focuses that specific input, and a screen reader announces the label's text the moment the input receives focus. The label below is visually hidden (sighted users can see \"Book title\" in the placeholder instead), but it's still there in the markup, still doing its job for assistive tech.",
      patch: {
        elements: [
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
