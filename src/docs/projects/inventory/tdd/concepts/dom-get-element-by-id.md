# Concept: `document.getElementById`

**What you'll understand by the end:** how JavaScript looks up a specific element in the page by its `id`, and what happens when the lookup fails.

**Prerequisites:** `html-id-attribute.md`.

## Setup

Any modern browser. No install needed.

## The Problem

Once an element has a stable `id` (see `html-id-attribute.md`), JavaScript needs an actual API to find that real, live element in the page so it can be read or changed.

## The Isolated Example

```html
<p id="target">original text</p>
<script>
  const found = document.getElementById("target");
  console.log(found.textContent);

  const missing = document.getElementById("does-not-exist");
  console.log(missing);
</script>
```

**Real output (browser console):**
```
original text
null
```

**What this proves:** a matching `id` returns the real element, live from the page — reading its `.textContent` shows the actual current text. A non-matching id doesn't throw an error or return an empty placeholder — it returns exactly `null`. This matters because calling `.textContent = ...` on the result of a failed lookup throws a real, common error ("cannot set properties of null") — worth recognizing by name and cause if it ever appears.

## Mechanical Walkthrough

- `document` is a global object every browser provides, representing the currently-loaded page.
- The DOM (Document Object Model) is the browser's in-memory tree representation of the HTML — every tag becomes a node in that tree.
- `.getElementById(id)` walks that tree looking for a node whose `id` attribute equals the given string, stopping at the first match (since valid HTML never has two elements share an `id`, "first" should also be "only").
- On no match, it returns `null` — JavaScript's explicit "no value" — rather than throwing, and rather than returning some placeholder object.

## CS Lens

This is a **keyed lookup into a tree structure** — conceptually the same operation as a dictionary/map lookup by key, just searching a tree (the DOM) instead of a flat hash table, and returning a sentinel (`null`) rather than raising on a miss.

Also recognized in: every framework's underlying DOM-access mechanism — React's `useRef` ultimately reaches a real DOM node the same way, just managed by the framework's own bookkeeping instead of called directly by application code.

## SE Lens

`getElementById` is one of several DOM query methods (`querySelector`, `getElementsByClassName`, among others) — the fastest of them, since browsers can look ids up more directly than a general CSS-selector search has to. Reaching for it specifically (rather than a more general selector) is a real, deliberate choice when the target element already has a stable, unique `id` for exactly this purpose — using a slower, more general lookup when a faster, exact one is available is a real, if usually minor, performance tradeoff.

## Connection

Builds directly on `html-id-attribute.md`. Commonly the very first step before `textcontent-vs-innerhtml-xss.md`'s assignment — find the element, then change it.

## Try It Yourself

1. Call `.textContent = "new text"` directly on the result of `document.getElementById("does-not-exist")`, with no null check. Read the real error message and note exactly what it says failed.
2. Add a null check (`if (found) { ... }`) around a lookup that might fail, and confirm the code no longer throws even when the id is missing — a real, minimal defensive pattern worth having a name for.
3. Try `document.getElementById("target")` a second time after removing the element from the page entirely (`found.remove()`). Confirm the second lookup now also returns `null` — the DOM tree, not just the id string, is what's actually being searched.
