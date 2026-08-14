# Concept: `position: sticky`

**What you'll understand by the end:** how an element can stay in
normal document flow (unlike `fixed`) while still "locking" itself in
place once scrolling would otherwise carry it past a threshold.

**Prerequisites:** `css-fixed-positioning-and-stacking.md`.

## Setup

Plain HTML/CSS, any browser.

## The Problem

`css-fixed-positioning-and-stacking.md` already covered `position:
fixed` — an element pinned relative to the *viewport*, completely
removed from document flow, requiring manual positioning (`top`,
`left`, etc.) to place it anywhere at all. That's the right tool for a
toolbar that should always sit in the same screen position. It's the
wrong tool for something narrower and more common: a table's header
row that should scroll normally *until* it reaches the top of its
scrolling container, and only then stick there — resuming normal
scroll if the user scrolls back up past its original position.
`fixed` can't do that at all; it has no concept of "only once you'd
scroll past this point."

## The Isolated Example

```html
<div style="height: 150px; overflow-y: auto; border: 1px solid black;">
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr><th style="position: sticky; top: 0; background: white;">Header</th></tr>
    </thead>
    <tbody>
      <!-- 30 real <tr> rows, enough to make the container scroll -->
    </tbody>
  </table>
</div>
```

**Real output:** scrolling this container's content shows every `<tr>`
scroll normally underneath the header — but the header row itself stays
visibly pinned to the top of the scrolling box the entire time, never
scrolling out of view, resuming normal position only if there's nowhere
left to stick (the very top of the scrolled content).

**What this proves:** `position: sticky` isn't "always fixed" and isn't
"always normal flow" — it's genuinely both, switching automatically
based on scroll position, with no JavaScript scroll-listener required
to detect the threshold.

## Mechanical Walkthrough

- `position: sticky` — the element behaves as normal document flow
  (unlike `fixed`, which removes it from flow entirely) until it would
  scroll past the threshold set by the next property.
- `top: 0` — the actual threshold: this element sticks once its own top
  edge would otherwise scroll above `0` pixels from the top of its
  nearest scrolling ancestor (the `overflow-y: auto` container here).
  Without a `top`/`left`/`bottom`/`right` value, `sticky` has no
  threshold and behaves exactly like normal `static` positioning.
- `background: white` — a real, necessary companion in practice (not
  strictly part of the mechanism): without an opaque background, the
  scrolling rows underneath would visibly show through the "stuck"
  header as they pass beneath it.

## CS Lens

Not a hard CS concept — a real browser layout feature, not an
algorithm.

## SE Lens

The alternative — a JavaScript scroll-event listener that toggles a
"stuck" class once a measured scroll offset crosses a threshold — was
the only way to achieve this effect before `sticky` existed, and it's
strictly worse: it runs on every scroll event (a real, measurable
performance cost `sticky` has zero equivalent to, since the browser's
own layout engine handles it natively), and it requires manually
re-measuring the threshold if content or window size changes. `sticky`
trades that away for one real limitation: a `sticky` element is bounded
by its nearest scrolling ancestor and can never stick past that
ancestor's own edges — if the scrolling container itself scrolls out of
view, the "stuck" element goes with it, which is correct in most cases
but occasionally surprises someone expecting viewport-wide stickiness
(that case genuinely does need `fixed`, at the top-level document).

## Connection

Builds on `css-fixed-positioning-and-stacking.md` — understanding what
`fixed` *doesn't* do (respect a scrolling ancestor's normal flow at all)
is what makes `sticky`'s hybrid behavior make sense as its own, distinct
value rather than "a variant of fixed."

## Try It Yourself

1. Remove `top: 0` from the sticky header and confirm it now scrolls
   away normally — proof `sticky` alone does nothing without a
   threshold property.
2. Change the scrolling container's `overflow-y` from `auto` to
   `visible` and confirm the sticky behavior stops working entirely —
   `sticky` requires a genuinely scrolling ancestor to stick relative
   to.
3. Add a second `<th>` with its own `position: sticky; left: 0` (instead
   of `top`) inside a horizontally-scrolling table, and confirm a column
   can stick just as a row can — the mechanism isn't specific to
   vertical scrolling.
