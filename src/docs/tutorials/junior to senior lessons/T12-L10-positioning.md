# Junior to Senior — T12·L10 — Positioning

**Prerequisites:** T12·L9 (Grid). You understand Flexbox and Grid. This lesson teaches
the `position` property — the escape hatch that takes elements OUT of normal flow for
overlays, tooltips, sticky headers, and absolute placement.

**What this lab adds:**
- What "normal flow" is and why most elements stay in it
- `position: relative` — the reference point for absolute children
- `position: absolute` — remove an element from flow and place it precisely
- `position: fixed` — relative to the viewport (the browser window)
- `position: sticky` — in flow until scrolled to a threshold, then fixed
- `z-index` — controlling which elements paint on top
- `overflow: hidden` — clipping content and creating block formatting contexts

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. An element with `position: absolute; top: 0; left: 0`. Where does it appear?
>    What determines "top-left of what"?
> 2. The difference between `position: fixed` and `position: sticky`. When would you
>    use each for a navigation bar?
> 3. You have two overlapping elements. The second one is on top. You give the first
>    `z-index: 999` but it is still behind. Why might this happen?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You need a badge in the top-right corner of an avatar. You need a dropdown that floats
above the other content. You need a header that stays at the top as you scroll.
Flexbox and Grid cannot do these — they work WITHIN normal flow. Positioning is the
tool for elements that need to break out of it.

---

## Step 1 — What Is Normal Flow?

Create `positioning.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Positioning</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
      --space-5: 1.5rem; --space-6: 2rem; --space-7: 3rem;
    }

    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 var(--space-4); }

    .box {
      background: cornflowerblue;
      color: white;
      padding: var(--space-3) var(--space-4);
      border-radius: 4px;
      margin-bottom: var(--space-2);
    }
  </style>
</head>
<body>
  <h2>Normal flow — each box in sequence:</h2>
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
  <div class="box">Box 3</div>
</body>
</html>
```

### CSS AND SEE

Three boxes stacked. This is normal flow: block elements are laid out one after the other,
each taking the full width, stacking vertically. The document flows from top to bottom.

**Normal flow is the default.** Every element in normal flow occupies space that other
elements cannot use. Taking an element out of flow means its siblings act as if it does
not exist — they fill the gap it left.

---

## Concept: `position: relative` — The Reference Anchor

**What it is:** The element stays in normal flow (its space is preserved) but it can be
moved from that position using `top`, `right`, `bottom`, `left`. More importantly, it
creates a **positioned ancestor** — a coordinate origin for any absolutely positioned
descendants.

**What changes:**
1. The element can be offset: `top: 10px` moves it 10px down from where it normally would be
2. The element is now a **positioning context** — its children with `position: absolute`
   measure from THIS element's edges, not the page

**What does NOT change:**
- The element still occupies space in flow (its original "ghost" position is kept)
- Other elements do not move to fill around it

**When you use ONLY `position: relative` without offset values:**
- The element does not move visually
- It is used purely to create a positioning context for absolute children

**Canonical example:** A photo frame. The frame stays in the layout (takes up space).
But any `position: absolute` element inside it (a badge, a caption overlay) measures
from the frame's corner, not the page corner.

---

## Concept: `position: absolute` — Out of Normal Flow

**What it is:** The element is removed from normal flow. Other elements ignore it.
It is positioned relative to its nearest positioned ancestor (an ancestor with
`position` set to anything other than `static`). If no positioned ancestor exists,
it is positioned relative to the initial containing block (effectively the `<html>` element).

**What changes:**
- The element's space in flow is removed — siblings collapse to fill the gap
- `top`, `right`, `bottom`, `left` place the element relative to the positioned ancestor
- `width` and `height` default to the element's content size (no longer block-width)

**The most common use:**

```css
.container {
  position: relative;   /* positioning context */
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;          /* places badge at top-right corner of container */
}
```

Without `position: relative` on the container, the badge would position itself relative
to some parent much higher in the tree — usually the wrong place.

**You will see this again in:**
- Tooltip positioning: tooltip is `position: absolute` inside a `position: relative` trigger
- Dropdown menus: the dropdown panel is `position: absolute` below its button
- Image overlays, hover effects, progress bar fills, loading spinners
- T12·L17 (Component Design): badge-on-avatar pattern uses this exactly

**Watch for:** When an absolutely positioned element is not where you expect, the first
question is: "What is its nearest positioned ancestor?" Use DevTools to check
(`position` in the computed styles of each parent).

---

## Step 2 — Absolute Positioning in Practice

Build an avatar with a notification badge:

```html
<h2 style="margin-top: var(--space-6);">Avatar with badge:</h2>   <!-- ← add -->

<div style="
  position: relative;           /* ← creates positioning context */
  display: inline-block;
  width: 56px;
  height: 56px;
">
  <!-- The avatar circle -->
  <div style="
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: cornflowerblue;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.25rem;
  ">JD</div>

  <!-- The badge — absolute, positioned at top-right of the container -->
  <div style="
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    background: #e63946;
    color: white;
    border-radius: 50%;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
  ">3</div>
</div>
```

### CSS AND SEE

**You should see:** A blue circle with initials "JD" and a small red badge with "3" at
the top-right — overlapping the circle.

**Change something:** Remove `position: relative` from the outer container.

**Expected:** The badge jumps to a completely different position — it is now measured
from the nearest positioned ancestor higher up the DOM, which is likely the `<body>`.
Add `position: relative` back.

---

## Concept: `position: fixed` — Relative to the Viewport

**What it is:** The element is removed from normal flow AND positioned relative to the
**viewport** (the browser window) — not any ancestor element. It stays in the same place
even as the user scrolls.

**Use cases:**
- Sticky navigation bars
- Floating action buttons (bottom-right "+" button)
- Cookie consent banners at the bottom
- Chat widgets

**What to watch for:**

Fixed elements require explicit width handling:

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;           /* stretch full width */
  height: 56px;
  background: white;
  z-index: 100;
}

body {
  padding-top: 56px;  /* prevent content hiding behind the fixed navbar */
}
```

Without `padding-top` on body, the first content is hidden behind the fixed bar.

**`position: fixed` vs `position: sticky`:**

| Fixed | Sticky |
|---|---|
| Always in the same viewport position | In normal flow until scrolled past a threshold |
| Removed from flow — content scrolls behind it | Still in flow — only becomes fixed at the threshold |
| Stays forever | Returns to normal flow when scrolling back past the parent boundary |

---

## Step 3 — Fixed Header and Sticky Section

Add a long page with fixed header and sticky section headings:

```html
<!-- Replace the entire <body> content with this: -->
<body>

  <!-- Fixed header -->
  <header style="
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: #1a1a2e;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 var(--space-5);
    z-index: 100;
  ">
    Fixed Navigation Bar
  </header>

  <!-- Push content below the fixed header -->
  <main style="padding-top: 56px; padding: 72px var(--space-5) var(--space-5);">

    <section style="margin-bottom: var(--space-7);">
      <!-- Sticky section heading -->
      <h2 style="
        position: sticky;
        top: 56px;                    /* sticks at exactly the header height */
        background: #f5f5f5;
        padding: var(--space-2) 0;
        margin: 0 0 var(--space-4);
        z-index: 10;
      ">Section One</h2>

      <p>Scroll down to see sticky behavior. This text is long enough to require scrolling.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
    </section>

    <section>
      <h2 style="
        position: sticky;
        top: 56px;
        background: #f5f5f5;
        padding: var(--space-2) 0;
        margin: 0 0 var(--space-4);
        z-index: 10;
      ">Section Two</h2>

      <p>Second section content. Scroll back up to see section one reappear.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
      <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
    </section>

  </main>

</body>
```

### CSS AND SEE

Scroll the page up and down.

**You should see:**
- The dark header stays at the top always (fixed)
- "Section One" sticks just below the header when scrolled past (sticky at `top: 56px`)
- "Section Two" takes over when it scrolls to the sticky position, replacing "Section One"
- When scrolled all the way back up, "Section One" is back in its normal position

**Change something:** Change `position: sticky` to `position: fixed` on a section heading.

**Expected:** The section heading is now fixed like the header — it no longer scrolls
with the page, and it does not swap out for "Section Two". The difference between sticky
and fixed becomes clear.

---

## Concept: `z-index` — Stacking Order

**What it is:** A number that controls which element paints on TOP when elements overlap.
Higher `z-index` = closer to the viewer.

**The catch:** `z-index` only works on positioned elements (`relative`, `absolute`,
`fixed`, `sticky`) and flex/grid items. It has no effect on `position: static` (default).

**Stacking contexts:**

A new stacking context is created by certain CSS properties:
- `position: relative/absolute/fixed/sticky` with `z-index` other than `auto`
- `opacity < 1`
- `transform`, `filter`, `will-change`
- `isolation: isolate`

Within a stacking context, `z-index` values are compared ONLY within that context —
not against the entire document.

**Why z-index: 999 can still lose:**

```html
<div style="position: relative; z-index: 1;">    <!-- stacking context A -->
  <div style="z-index: 9999;">High z-index</div>  <!-- compared within A -->
</div>
<div style="position: relative; z-index: 2;">    <!-- stacking context B -->
  <div style="z-index: 1;">Low z-index</div>      <!-- compared within B -->
</div>
```

The "Low z-index" element in context B (z-index: 2) paints on top of "High z-index" in
context A (z-index: 1) — because B's stacking context (z-index: 2) beats A's (z-index: 1).
The z-index inside A is irrelevant when comparing against B.

**Practical z-index scale (avoid arbitrary values):**

```css
:root {
  --z-below:   -1;
  --z-base:     0;
  --z-overlay: 10;     /* dropdowns, tooltips */
  --z-modal:   100;    /* modal dialogs */
  --z-nav:     200;    /* sticky headers */
  --z-toast:   300;    /* notifications over everything */
}
```

Using a scale prevents the `z-index: 9999` arms race.

**You will see this again in:**
- Modal dialogs need `z-index` above all other content
- Dropdown menus over cards, cards over backgrounds
- T12·L12 (Component States): dropdowns use `position: absolute` + `z-index`

---

## Step 4 — `z-index` in Practice

Add an overlapping demo to the page (below the sticky sections):

```html
<section style="padding: var(--space-5); position: relative;">   <!-- ← add -->
  <h2>z-index demo:</h2>

  <div style="position: relative; height: 100px; background: #eee; border-radius: 8px;">
    <div style="
      position: absolute;
      top: 10px; left: 10px;
      width: 100px; height: 80px;
      background: cornflowerblue;
      display: flex; align-items: center; justify-content: center;
      color: white; border-radius: 4px;
      z-index: 2;
    ">z-index: 2</div>

    <div style="
      position: absolute;
      top: 30px; left: 60px;
      width: 100px; height: 80px;
      background: #e63946;
      display: flex; align-items: center; justify-content: center;
      color: white; border-radius: 4px;
      z-index: 1;
    ">z-index: 1</div>
  </div>

</section>
```

### CSS AND SEE

**You should see:** Two overlapping boxes. The blue one (z-index: 2) appears on top.

**Change something:** Swap the z-index values — give blue `z-index: 1` and red `z-index: 2`.

**Expected:** The red box now appears on top.

**Change something else:** Remove both `z-index` declarations.

**Expected:** The red box is on top — when z-index is equal (or not set), the element
that appears LATER in the DOM paints on top. Source order is the fallback.

---

## 🎯 Challenge: Build a Tooltip Component

**Task:** Build a button that shows a tooltip above it on hover, using only CSS
(no JavaScript):

1. The tooltip is `position: absolute` above the button
2. The tooltip is hidden by default (`opacity: 0; pointer-events: none`)
3. On button hover, the tooltip appears (`opacity: 1`)
4. The tooltip has a small triangle pointing down (using `::after` with borders)
5. The tooltip does not affect page layout when shown (it is out of flow)

---

<details>
<summary>▶ Show Solution</summary>

```html
<div style="position: relative; display: inline-block; margin-top: 80px;">
  <button class="tooltip-btn" style="
    padding: 8px 16px;
    background: cornflowerblue;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  ">Hover me</button>

  <div class="tooltip" style="
    position: absolute;
    bottom: calc(100% + 8px);   /* 8px above the button */
    left: 50%;
    transform: translateX(-50%);  /* center over the button */
    background: #1a1a2e;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.875rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  ">This is a tooltip</div>
</div>

<style>
  .tooltip-btn:hover + .tooltip,
  .tooltip-btn:focus + .tooltip {
    opacity: 1;
  }

  /* Triangle pointing down via CSS borders */
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1a1a2e;
  }
</style>
```

**Key insight:** `pointer-events: none` prevents the tooltip from interfering with
mouse interaction — without it, moving the mouse over the tooltip could trigger hover
states. `transition: opacity` provides the fade animation. The CSS-only trigger uses
the adjacent sibling combinator `+` — when `.tooltip-btn:hover` is true, the next sibling
(`.tooltip`) has `opacity: 1`.

The triangle is a pure CSS trick: a zero-size `::after` element with borders on all sides.
Setting three borders to `transparent` and one to a colour creates a triangle pointing
in the direction of the transparent borders.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `position: relative` creates context | Badge jumps without `position: relative` on parent |
| `position: absolute` removes from flow | Sibling elements collapse as if the element does not exist |
| `position: fixed` | Header stays at top while page scrolls |
| `position: sticky` | Section heading sticks until parent ends |
| `z-index` stacking | Higher z-index element paints on top |
| Stacking context trap | Element in a lower stacking context cannot win against higher context |

---

## Quick Check Answers

**1. `position: absolute; top: 0; left: 0`. Where does it appear? Measured from what?**

It appears at the top-left of its nearest positioned ancestor — any ancestor with
`position` set to `relative`, `absolute`, `fixed`, or `sticky`. If no positioned ancestor
exists, it is measured from the initial containing block (the `<html>` element's content
area, effectively the top-left of the document).

**2. `position: fixed` vs `position: sticky` for a nav bar?**

`position: fixed`: The navbar is immediately fixed to the viewport top. It is removed from
document flow — content below it must have `padding-top` to avoid being hidden behind it.
Use when you always want the navbar visible from page load.

`position: sticky`: The navbar scrolls with the content until it reaches `top: 0`, then
sticks. It is still in flow until the threshold — no need for `padding-top`. The navbar
appears to "come up and stick" as the user scrolls past it. Better UX for pages where the
hero image or content above the nav should be visible on load.

**3. `z-index: 999` and still behind. Why?**

The element is inside a stacking context with a low `z-index`. The stacking context
created by a positioned ancestor (e.g., `position: relative; z-index: 1`) forms a
container. All `z-index` values inside that context are compared only within it.
If a sibling stacking context has `z-index: 2`, every element inside it (regardless of
their own z-index) paints on top of everything in the `z-index: 1` context. The fix:
either raise the stacking context's z-index or use `isolation: isolate` to control
context creation.
