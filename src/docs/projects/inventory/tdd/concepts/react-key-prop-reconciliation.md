# Concept: React's `key` Prop and List Reconciliation

**What you'll understand by the end:** why React needs a stable identity for each item in a rendered list, and what silently goes wrong when the wrong value — or none at all — is used for it.

**Prerequisites:** `javascript-array-map.md`, `jsx-syntax.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

When a component re-renders a list, React needs to figure out, between the *previous* set of rendered elements and the *new* one, which elements are genuinely the same item (just possibly with updated data), which are newly added, and which were removed — array *position* alone can't answer this reliably, since items can be reordered, inserted in the middle, or removed from anywhere, not just the end.

## The Isolated Example

```tsx
import { useState } from "react";

function List() {
  const [items, setItems] = useState([
    { id: 1, label: "Apple" },
    { id: 2, label: "Banana" },
  ]);

  return (
    <>
      <button onClick={() => setItems([{ id: 0, label: "Cherry" }, ...items])}>
        Add to front
      </button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </>
  );
}
```

**Real behavior with `key={item.id}`:** clicking "Add to front" inserts a new `<li>Cherry</li>` at the top; the existing "Apple" and "Banana" `<li>` elements are correctly recognized as unchanged (verified via React DevTools' own highlighting, which flashes only the genuinely new element).

**The identical component, using the array index as the key instead** (`key={index}`):
```tsx
{items.map((item, index) => (
  <li key={index}>{item.label}</li>
))}
```
**Real behavior:** clicking "Add to front" still shows the correct text ("Cherry," "Apple," "Banana") — but React DevTools shows *every* `<li>` re-rendering, not just the new one, and any per-item internal state (a per-row "expanded" toggle, for instance, added in a later version of this example) would visibly attach to the *wrong* row after the insert — the previously-first row's own state now appears attached to "Cherry," the newly-inserted item, since index `0` now refers to a different logical item than it did before.

**What this proves:** with a stable, real identity (`item.id`), React correctly tracked each logical item across the reorder. With index-based keys, React had no way to distinguish "this row moved" from "this row's content changed," and defaulted to treating every index as if its content had simply changed in place — silently wrong the moment order changes, even though the displayed *text* still happened to end up correct in this simple example.

## Mechanical Walkthrough

- React's rendering process compares a component's newly-produced list of elements against what it rendered last time — a process called **reconciliation** — and, rather than tearing down and rebuilding every DOM node from scratch, patches only what actually changed, for real performance reasons.
- `key` gives each element in a list a **stable identity** React can track across renders, independent of its position in the array — "this is item `id: 2`, wherever it now appears," rather than "this is whatever's at index `1`."
- Without a `key` at all, React falls back to using array index implicitly, printing a real, explicit console warning ("Each child in a list should have a unique 'key' prop") specifically because this fallback is a common, real source of the exact bug demonstrated above.
- The correct key is a value that is **stable** (the same logical item always has the same key, across every render) and **unique** among siblings in that specific list — a database ID, a UUID, or any other value guaranteed not to change or collide is appropriate; an array index is neither stable under reordering nor meaningfully tied to the item's actual identity.

## Execution Trace

Clicking "Add to front" once, traced against both keying strategies:

- key={item.id}:
  Before: [{id:1,"Apple"} key=1, {id:2,"Banana"} key=2]
  After insert: [{id:0,"Cherry"} key=0, {id:1,"Apple"} key=1, {id:2,"Banana"} key=2]
  React's reconciler compares keys, not positions:
    key=1 existed before (was Apple, still Apple) → same identity → PATCH in place, no remount
    key=2 existed before (was Banana, still Banana) → same identity → PATCH in place, no remount
    key=0 is new → MOUNT a brand-new <li> for it
  → only Cherry's <li> is newly created; Apple/Banana's own DOM nodes
    (and any internal state they held) are reused untouched

- key={index}:
  Before: index 0 → Apple, index 1 → Banana
  After insert: index 0 → Cherry, index 1 → Apple, index 2 → Banana
  React's reconciler compares keys, which are now just positions:
    key=0 existed before (was Apple) — now maps to Cherry → React thinks
      this is the SAME element, just with different text → PATCH the
      existing <li> that used to be Apple's, now showing "Cherry" — but
      any state that <li> was holding stays attached, now misapplied to Cherry
    key=1 existed before (was Banana) — now maps to Apple → same
      misattribution: Banana's old state, now on Apple's <li>
    key=2 is new (index 2 didn't exist before) → MOUNT a brand-new <li> for Banana
  → every <li> except the last one gets patched with a state mismatch;
    only the LAST item in the list actually gets a fresh mount, which
    is the opposite of what actually changed (Cherry, at the front)

Both traces process the same 3 real items after the same insert — the
only thing that changes is which value React treats as each item's
identity, and that one difference determines whether "patch in place"
lands on the correct DOM node or a coincidentally-same-position one.

## CS Lens

This is the same underlying problem `deep-equality-vs-reference-equality.md` names in a different context — establishing whether two things, compared across two points in time, are "the same thing" — applied here specifically to tracking identity across a diffing/reconciliation algorithm. Any algorithm comparing two versions of a collection to compute a minimal set of changes (a diff) needs some notion of identity to match elements between the two versions; `key` is React's explicit, developer-supplied answer to "how should I match these."

Also recognized in: Git's own file-rename detection (matching a file in a new commit to its likely previous version, by content similarity, when no explicit identity is tracked), database change-data-capture systems (matching rows between two snapshots by primary key, never row number), and any list-diffing algorithm generally, which fundamentally cannot produce a correct, minimal diff without some notion of per-item identity.

## SE Lens

The real, practical risk with a wrong key choice is specifically dangerous *because* it's silent and data-dependent: a table that's never reordered, filtered, or has items inserted/removed from the middle will behave identically whether keyed by index or by a real stable ID — the bug only surfaces the moment a genuinely dynamic operation (sorting, filtering, reordering) is added, often much later, by someone who has no reason to suspect the keys were ever wrong. Choosing a real, stable identifier as the key from the very first version of a list — even before any reordering feature exists — avoids this exact class of "worked fine until it silently didn't" bug entirely.

## Connection

Builds on `javascript-array-map.md` and `jsx-syntax.md`. Directly relevant anywhere `.map()` is used to render a list of data-backed elements — `html-table-elements.md`'s `<tr>` rows are one common, real case; any other repeated JSX element produced from an array shares the identical requirement.

## Try It Yourself

1. Add a delete button per row that removes an item from the *middle* of the list (not the end), using both the ID-keyed and index-keyed versions — compare, via React DevTools' highlighting, which rows React considers to have "changed" after a middle deletion in each version.
2. Add a per-item `useState` inside each rendered `<li>` (a simple "expanded" boolean, toggled by a click) with the index-keyed version, then reorder the underlying `items` array — observe the expanded state stays attached to the *position*, not the *item*, direct proof of the bug class this file describes.
3. Try using `Math.random()` as a key (`key={Math.random()}`) and observe the real, much worse consequence: a *new* random key every render means React treats every single item as brand-new on every re-render, discarding and rebuilding the entire list's DOM each time — confirming a key must be stable across renders, not merely unique within one.
