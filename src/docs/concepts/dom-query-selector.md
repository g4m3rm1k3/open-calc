# Concept: `document.querySelector`

**What you'll understand by the end:** how to find a DOM element using any real CSS selector, not just an id, and how TypeScript can be told what kind of element to expect back.

**Prerequisites:** `dom-get-element-by-id.md`.

## Setup

Any HTML page loaded in a browser, with a `<script>` tag or linked JS file. For the TypeScript-typed form, `npm install --save-dev typescript`.

## The Problem

`getElementById` (see `dom-get-element-by-id.md`) only ever searches by a single `id` attribute — it can't find "the first `<button>` inside `.toolbar`," or "the element with class `active`," or any of the countless other ways CSS can already describe *which* element is wanted. Something more general is needed that reuses the same selector language CSS itself uses, rather than inventing a second, narrower lookup language just for JavaScript.

## The Isolated Example

```html
<div class="toolbar">
  <button id="run">Run</button>
  <button class="danger">Stop</button>
</div>
<script>
  const byId = document.getElementById("run");
  const byClass = document.querySelector(".danger");
  const byDescendant = document.querySelector(".toolbar button");

  console.log(byId.textContent);
  console.log(byClass.textContent);
  console.log(byDescendant.textContent);
</script>
```

**Real output (browser console):**
```
Run
Stop
Run
```

**What this proves:** `querySelector(".danger")` found an element `getElementById` has no way to express at all (there's no id involved), and `querySelector(".toolbar button")` demonstrates a full CSS descendant selector — any valid CSS selector string works, returning the *first* matching element in document order.

## Mechanical Walkthrough

- `document.querySelector(selector)` accepts any valid CSS selector string and returns the first matching `Element` in the document, or `null` if nothing matches — the `null` case connects directly to `typescript-non-null-assertion.md`, since TypeScript types this return as `Element | null`.
- `#run` (an id selector), `.danger` (a class selector), `.toolbar button` (a descendant combinator) — all standard CSS selector syntax, unchanged from how the same strings would appear in a stylesheet.
- In TypeScript, `document.querySelector<HTMLPreElement>("#points")` supplies a generic type parameter (see `typescript-generics.md`) narrowing the return type from the generic `Element | null` to the more specific `HTMLPreElement | null` — TypeScript cannot verify this claim on its own (it doesn't parse the actual HTML file), so this is a developer assertion, not a proven fact.

## CS Lens

`querySelector` reuses one query language (CSS selectors) across two different consumers — the stylesheet cascade and direct DOM lookup — rather than defining a second, parallel query syntax. This is a real instance of **language reuse across subsystems**: once a selector grammar exists and is well understood, extending its use elsewhere avoids asking developers to learn and maintain two separate, overlapping ways to say "this specific element."

Also recognized in: XPath (a comparably general query language for XML/HTML trees, predating widespread `querySelector` support), and SQL `WHERE` clauses reused identically across a `SELECT`, an `UPDATE`, and a `DELETE` — one predicate language, multiple consuming operations.

## SE Lens

`querySelector` is strictly more general than `getElementById` — every id lookup `getElementById` can do, `querySelector("#" + id)` can also do — but that generality has a real, measurable runtime cost: `getElementById` can use a direct id-indexed lookup, while `querySelector` must parse the selector string and, for anything beyond a bare id, potentially walk matching candidates. For code whose only need is "find this one element by its id," `getElementById` remains the more direct, slightly faster, and more explicitly-scoped choice — `querySelector`'s generality earns its cost specifically when a lookup genuinely needs CSS selector expressiveness `getElementById` cannot provide.

## Connection

Builds on `dom-get-element-by-id.md`. Commonly paired with `typescript-non-null-assertion.md` (`document.querySelector<T>("#id")!`) when the developer knows, from a specific controlled HTML file, that the element genuinely exists.

## Try It Yourself

1. Call `document.querySelector(".missing")` for a selector matching nothing in the page, and confirm it returns `null` rather than throwing — reason about why a lookup returning "nothing found" as a value, rather than an exception, requires every caller to handle the not-found case explicitly (connects to `typescript-union-types.md`'s `T | null` pattern).
2. Look up `document.querySelectorAll`, and rewrite the descendant example to log the text of *every* `<button>` inside `.toolbar`, not just the first — reasoning about why a plural lookup needs a different return type (a static `NodeList`, not a single `Element | null`).
3. In the TypeScript version, deliberately supply the wrong generic type (`document.querySelector<HTMLButtonElement>("#points")` where `#points` is actually a `<pre>` element), and confirm `tsc` does *not* catch the mismatch — direct proof that the generic parameter here is an unverified developer assertion, not a checked fact, exactly like `typescript-non-null-assertion.md`'s `!`.
