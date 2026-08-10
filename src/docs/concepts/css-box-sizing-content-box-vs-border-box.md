# Concept: `box-sizing` — `content-box` vs. `border-box`

**What you'll understand by the end:** why a declared `width` doesn't
always mean the element's actual, rendered width — and the one CSS
property that decides which it means.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Plain HTML/CSS, any browser.

## The Problem

`width`, `padding`, and `border` all affect how wide an element looks
on screen — but they don't obviously say whether `width` is measured
*before* or *after* padding and border get added. Get this wrong and an
element sized to fill its container (`width: 100%`) can end up wider
than that container, overflowing it — with no error, just a layout
that's subtly, silently broken.

## The Isolated Example

```html
<div style="width: 200px; border: 1px solid black;">
  <div id="box" style="width: 100%; padding: 10px; border: 2px solid red;">
    content
  </div>
</div>
<script>
  console.log(document.getElementById("box").getBoundingClientRect().width);
</script>
```

**Real output (default browser behavior):**
```
224
```

**What this proves:** the inner box's declared `width: 100%` resolves
to `200px` (its container's width) — but its *actual rendered* width is
`224px` (`200 + 10*2 padding + 2*2 border`), overflowing its 200px-wide
container by 24px. `width` only ever described the *content* area; the
padding and border were added on top of it, not carved out of it.

**The fix:**

```css
#box {
  box-sizing: border-box;
}
```

**Real output, same element, this one property added:**
```
200
```

## Mechanical Walkthrough

- Default `box-sizing: content-box` — `width` sets only the content
  area's size; padding and border are added *outside* that, growing the
  element's total rendered size past the declared `width`.
- `box-sizing: border-box` — `width` instead sets the element's *total*
  rendered size (content + padding + border together); the browser
  shrinks the actual content area to make room for padding/border
  *within* that total, rather than adding them on top.
- Nothing about `padding`/`border`'s own declared values changes between
  the two modes — only what `width` is measured relative to changes.

## CS Lens

Not a hard CS concept — a real, load-bearing convention decision in a
layout system (what a size property is measured relative to), not an
algorithm.

## SE Lens

The real, historical reason `content-box` is still the CSS default
despite `border-box` being what most developers actually want: changing
the default outright would have silently broken every existing page
built assuming the old behavior — a real backward-compatibility
constraint, not an oversight. The common, real-world fix isn't setting
`box-sizing` per element (as this concept's own fix does, scoped
narrowly on purpose) but a global reset (`*, *::before, *::after {
box-sizing: border-box; }`) applied once, near the top of a project's
own stylesheet — deliberately not done project-wide here, so this fix
stays scoped to the one element it was needed for.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md`. Directly relevant
whenever `width: 100%` (or any other percentage/fixed width) is combined
with non-zero `padding`/`border` on the same element — exactly the
combination that silently overflows under the default `content-box`.

## Try It Yourself

1. Remove `box-sizing: border-box` from the fixed example and add
   `overflow: hidden` to the *outer* container instead — observe the
   inner box's content getting visually clipped rather than the layout
   itself correcting, proving `overflow` hides the symptom without
   fixing the actual sizing mismatch.
2. Change the inner box's `padding` to `0` with `content-box` still in
   effect (no `border-box`) — confirm the overflow shrinks to exactly
   match the border's own width (`2px * 2 = 4px`), isolating padding and
   border as two independently-additive causes of the same overflow.
3. Add a global `* { box-sizing: border-box; }` reset instead of
   targeting `#box` alone, and confirm every other element on the page
   that also mixed `width` with padding/border now sizes correctly too
   — the real, common production fix named in the SE Lens.
