# Concept: `Element.replaceWith()`

**What you'll understand by the end:** how to swap one real DOM
element for a completely different one, in place, without touching
its surrounding siblings.

**Prerequisites:** `dom-get-element-by-id.md`.

## Setup

Any modern browser. No install needed.

## The Problem

Updating an element that has many children (attributes, nested tags,
event listeners already attached) sometimes means building an entirely
new version of it rather than patching pieces in place — simpler to
reason about, at the cost of throwing away and rebuilding the whole
subtree. Doing that safely means putting the new element in *exactly*
the same position the old one occupied, without manually looking up
its parent and its exact child index by hand.

## The Isolated Example

```html
<div id="list">
  <p id="first">one</p>
  <p id="second">two</p>
  <p id="third">three</p>
</div>
<script>
  const replacement = document.createElement("p");
  replacement.textContent = "TWO (REPLACED)";
  document.getElementById("second").replaceWith(replacement);
</script>
```

**Real result:** the page shows `one`, `TWO (REPLACED)`, `three`, in
that exact order — the new `<p>` landed precisely where `#second` used
to be, between `#first` and `#third`, with no code ever referencing
`#list` (the parent) directly.

## Mechanical Walkthrough

- `document.getElementById("second")` — reappearing, `dom-get-element-
  by-id.md` — finds the specific element to be replaced.
- `.replaceWith(replacement)` — **(a) first appearance** — removes the
  element it's called on from the DOM and inserts `replacement` in the
  exact same position among its former siblings, in one call. The
  original element (`#second`) is now detached from the page entirely;
  only `replacement` remains in its place.

## CS Lens

This is a real, direct **in-place node substitution** in a tree
structure (the DOM is a tree — `dom-get-element-by-id.md`'s own
traversal already relies on this) — replacing one subtree with another
of a completely different shape, at a known position, without
re-deriving that position from scratch (walking up to the parent,
finding the child's index, removing and inserting at that index by
hand).

Also recognized in: React's own reconciliation swapping one rendered
element for another at the same position in its virtual tree; a
database `UPDATE` replacing one row's entire content while its primary
key (its "position" in the table) stays fixed; version control's own
file-replacement-at-the-same-path model.

## SE Lens

The alternative — clearing the old element's children and attributes
one by one and rebuilding them in place (`element.innerHTML = ""`,
then re-appending new children) — works, but keeps the *original*
element node itself, which matters if anything else held a reference
to it or if it had listeners attached that should genuinely be gone,
not just visually emptied. `.replaceWith()` discards the old node
entirely and its listeners along with it — the correct choice when a
"live" re-render (this project's own channel sidebars, rebuilt fresh
from `buildChannelSidebarElement` on every edit) is meant to be a
clean, complete replacement, not an in-place patch.

## Connection

Builds on `dom-get-element-by-id.md` and the `createElement`/
`textContent`/`addEventListener` construction pattern this project
already uses repeatedly (the tab bar, the project explorer tree, the
Program Details lists). Used directly in
`cnc-editor-electron/src/renderer.ts`'s `refreshChannelSidebarsShowingPath`:
when the actively edited document matches one of the currently
displayed channel sidebars, a completely fresh
`buildChannelSidebarElement(...)` is built from the document's new
content, and `.replaceWith()` swaps it in for the stale one — a clean
rebuild, not a partial patch of the old sidebar's own DOM.

## Try It Yourself

1. Call `.replaceWith()` with a plain string instead of an element —
   `document.getElementById("second").replaceWith("just text")` —
   and confirm the browser accepts it, inserting it as a real text
   node in the same position. `.replaceWith()` accepts nodes *or*
   strings, unlike most DOM methods that require a real `Node`.
2. Call `.replaceWith()` with more than one argument —
   `element.replaceWith(firstNew, secondNew)` — and confirm both land
   in sequence at the original element's position, proving it isn't
   limited to a strict one-for-one swap.
3. Keep a reference to the original element in a variable before
   replacing it, then try appending it somewhere else in the page
   afterward. Confirm this still works — `.replaceWith()` detaches an
   element from its old position; it doesn't destroy it.
