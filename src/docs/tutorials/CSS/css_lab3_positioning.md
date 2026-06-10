# CSS Masterclass — Lab 3
## Positioning: Putting Things Exactly Where You Want Them

---

**What this lab is about.**

Flexbox and Grid handle flow — items arranged in rows and columns, growing and
shrinking together. But some things need to break out of that flow entirely.
Dropdown menus. Floating panels. Tooltips. Overlays. A context menu that
appears under your cursor. A panel that pins to the top of the screen while
you scroll.

All of these use CSS positioning. It is the one concept that unlocks complete
freedom over where anything goes on the screen.

**How this lab works differently.**

You write the HTML first with zero CSS. You look at the unstyled structure.
Then you add CSS one rule at a time, saving after each one, watching what
changes. Every property lands on something visible so you see exactly what
it does.

Create a new file called `positioning.html`. You will build it up piece by
piece through the lab.

---

## Part 1 — Start with the HTML, no styles at all

Type this file exactly. Do not add any CSS yet. Just the HTML.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Positioning</title>
</head>
<body>

  <h1>Positioning Experiments</h1>

  <!-- Experiment 1: Static vs Relative -->
  <section id="exp-1">
    <h2>Experiment 1 — Static and Relative</h2>

    <div class="parent">
      <div class="box box-a">A — static (default)</div>
      <div class="box box-b">B — we will move this one</div>
      <div class="box box-c">C — static</div>
    </div>

  </section>

  <!-- Experiment 2: Absolute -->
  <section id="exp-2">
    <h2>Experiment 2 — Absolute Positioning</h2>

    <div class="parent">
      <div class="box box-a">A — normal flow</div>
      <div class="box box-b">B — we will take this out of flow</div>
      <div class="box box-c">C — normal flow</div>
    </div>

  </section>

  <!-- Experiment 3: The anchor — relative parent, absolute child -->
  <section id="exp-3">
    <h2>Experiment 3 — Anchoring an absolute element</h2>

    <div class="card">
      <p>This is a card with some content inside it.</p>
      <p>There will be a badge pinned to the top-right corner.</p>
      <div class="badge">NEW</div>
    </div>

  </section>

  <!-- Experiment 4: Fixed -->
  <section id="exp-4">
    <h2>Experiment 4 — Fixed Positioning</h2>
    <p>There will be a fixed element that stays on screen even when you scroll.</p>
    <div class="fixed-bar">I am fixed to the bottom of the viewport</div>
  </section>

  <!-- Experiment 5: Sticky -->
  <section id="exp-5">
    <h2>Experiment 5 — Sticky Positioning</h2>

    <div class="sticky-container">
      <div class="sticky-header">SECTION A — I stick to the top when scrolling</div>
      <div class="sticky-item">Item 1</div>
      <div class="sticky-item">Item 2</div>
      <div class="sticky-item">Item 3</div>
      <div class="sticky-item">Item 4</div>
      <div class="sticky-item">Item 5</div>
      <div class="sticky-header">SECTION B — I also stick</div>
      <div class="sticky-item">Item 6</div>
      <div class="sticky-item">Item 7</div>
      <div class="sticky-item">Item 8</div>
      <div class="sticky-item">Item 9</div>
      <div class="sticky-item">Item 10</div>
      <div class="sticky-header">SECTION C — Me too</div>
      <div class="sticky-item">Item 11</div>
      <div class="sticky-item">Item 12</div>
      <div class="sticky-item">Item 13</div>
      <div class="sticky-item">Item 14</div>
      <div class="sticky-item">Item 15</div>
    </div>

  </section>

  <!-- Experiment 6: Dropdown menu -->
  <section id="exp-6">
    <h2>Experiment 6 — Dropdown Menu</h2>

    <div class="menu-root">
      <button class="menu-trigger">File</button>
      <div class="dropdown">
        <div class="dropdown-item">New</div>
        <div class="dropdown-item">Open</div>
        <div class="dropdown-item">Save</div>
        <div class="dropdown-sep"></div>
        <div class="dropdown-item">Quit</div>
      </div>
    </div>

  </section>

  <!-- Experiment 7: Tooltip -->
  <section id="exp-7">
    <h2>Experiment 7 — Tooltip</h2>

    <button class="has-tooltip">
      Hover over me
      <span class="tooltip">This is a tooltip that appears on hover</span>
    </button>

  </section>

  <!-- Experiment 8: Overlay / Modal backdrop -->
  <section id="exp-8">
    <h2>Experiment 8 — Overlay</h2>
    <button id="open-overlay">Open Overlay</button>
    <div class="overlay" id="overlay">
      <div class="overlay-panel">
        <h3>I am a modal panel</h3>
        <p>The dark overlay behind me is position: fixed covering the whole screen.</p>
        <button id="close-overlay">Close</button>
      </div>
    </div>
  </section>

</body>
</html>
```

Save it. Open in the browser. You see plain unstyled HTML — all the sections
stacked, no colors, browser default styling. This is the starting point. Every
CSS rule you add from here will change something visible.

---

## Part 2 — Base styles: make it readable

Add a `<style>` block inside `<head>`. Start with the universal reset and
base styles. Add these, save, and refresh after each group.

**Step 1 — The reset. Save and refresh.**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

Everything loses its default spacing. The headings and paragraphs collapse
together. Text is crammed to the top-left. This is expected — you are about
to add proper spacing.

**Step 2 — Body and typography. Save and refresh.**

```css
body {
  background: #0d0d1a;
  color: #c0c0d8;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 40px;
}
```

The page turns dark. Text becomes readable. The `line-height: 1.6` gives text
breathing room — without it lines are too tight. Notice how `padding: 40px` on
the body creates a margin around all the content. This is body padding, not
margin — the background color fills the padding area.

**Step 3 — Headings. Save and refresh.**

```css
h1 {
  font-size: 20px;
  color: #8899cc;
  margin-bottom: 40px;
  letter-spacing: 0.05em;
}

h2 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #445566;
  margin-bottom: 16px;
}

section {
  margin-bottom: 60px;
}
```

The h1 and h2 now look like section headers. The sections have space between
them. Notice how `margin-bottom` on `section` pushes each experiment apart —
this is where margin belongs: spacing between sections, not inside them.

**Step 4 — The experiment boxes. Save and refresh.**

```css
.parent {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.box {
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Consolas', monospace;
}

.box-a { background: rgba(51,119,255,0.15);  border: 1px solid rgba(51,119,255,0.4);  color: #8899ff; }
.box-b { background: rgba(119,51,255,0.15); border: 1px solid rgba(119,51,255,0.4); color: #aa88ff; }
.box-c { background: rgba(51,187,119,0.15); border: 1px solid rgba(51,187,119,0.4); color: #88ccaa; }
```

Now the parent containers look like panels and the colored boxes are visible
inside them. The three experiments using `.parent` and `.box` now show their
content clearly. You are ready to add positioning.

---

## Part 3 — Understanding position: static

Every element has `position: static` by default. Static means the element sits
in the **normal document flow** — elements stack from top to bottom (block) or
left to right (inline) in the order they appear in the HTML.

In static positioning, the properties `top`, `left`, `bottom`, and `right` do
absolutely nothing. They are ignored.

You do not need to write `position: static` — it is the default. You only
write a position value when you want to change from the default.

Look at Experiment 1 in the browser. Box A, B, and C are stacked in a column
inside the flex container. They are all static. This is normal flow.

---

## Part 4 — position: relative

`position: relative` does two things:

1. The element stays in the normal flow. Other elements still see it in its
   original place. The space it occupied is preserved.
2. You can now move it visually using `top`, `left`, `bottom`, `right` —
   relative to where it would have been.

Add this CSS. Save and refresh.

```css
.box-b {
  position: relative;
  top: 20px;
  left: 30px;
}
```

Look at Experiment 1. Box B has shifted — 20px down from where it was, 30px
to the right. But notice something important: **the gap where B used to be is
still there**. Box C did not move up to fill the space. The flow still
reserves the original spot for B.

This is the key difference between `relative` and `absolute`. Relative moves
the visual rendering but keeps the element in the flow. The "ghost" of B is
still there taking up space.

**When to use it:**
- Fine-tuning position of one element without disturbing others
- Most importantly: as an **anchor** for absolutely positioned children
  (this is what you use it for 95% of the time)

Remove the `top` and `left` from `.box-b` after looking at it — you don't
want to carry that offset into the next experiments:

```css
.box-b {
  position: relative;
  /* top and left removed */
}
```

---

## Part 5 — position: absolute

`position: absolute` is completely different:

1. The element is **removed from the normal flow**. Other elements act as if
   it does not exist.
2. It positions itself relative to the nearest ancestor that has any position
   value other than `static`. If no such ancestor exists, it positions relative
   to the document itself.
3. `top`, `left`, `bottom`, `right` now work — measured from the edges of
   that ancestor.

Add this to `.box-b`. Save and refresh.

```css
.box-b {
  position: absolute;
  top: 0;
  left: 0;
}
```

Look at Experiment 2. Box B has disappeared from its place between A and C.
Boxes A and C are now next to each other — the space B occupied is gone.
B is sitting somewhere on the page — probably at the very top-left of the
document, because there is no positioned ancestor for it to anchor to yet.

This is the critical thing to understand: **an absolutely positioned element
needs an anchor**. Without one, it floats to the document origin.

---

## Part 6 — The anchor: relative parent + absolute child

This is the single most important positioning pattern. Almost everything that
"pops out" of the normal layout — dropdowns, tooltips, badges, floating buttons
— uses this pattern.

The rule: add `position: relative` to the **parent** you want to anchor to.
The absolutely positioned child will then measure its `top`/`left`/`right`/`bottom`
from that parent's edges.

Add `position: relative` to `.parent`:

```css
.parent {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;   /* ADD THIS */
}
```

Save and refresh. Now look at Experiment 2. Box B has jumped to the top-left
corner of the `.parent` container — it is anchored to the parent now, not
to the document.

Try changing the values. Save after each:

```css
.box-b {
  position: absolute;
  top: 0;
  right: 0;      /* top-right corner */
}
```

```css
.box-b {
  position: absolute;
  bottom: 0;
  right: 0;      /* bottom-right corner */
}
```

```css
.box-b {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);   /* perfect center */
}
```

That last one is worth understanding. `top: 50%; left: 50%` puts the top-left
corner of B at the center of the parent. `transform: translate(-50%, -50%)`
shifts B left by half its own width and up by half its own height — centering
it perfectly. This is the standard CSS centering trick.

---

## Part 7 — The badge: a real use of relative + absolute

Look at Experiment 3 in your HTML. You have a `.card` with a `.badge` inside
it. The badge should sit in the top-right corner of the card regardless of the
card's content.

Add CSS for the card. Add each rule, save, and refresh:

**Step 1 — Style the card. Save and refresh.**

```css
.card {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
}

.card p {
  color: #8899aa;
  font-size: 13px;
  margin-bottom: 8px;
}
```

A styled card appears. The badge text shows up below the paragraphs because
it is still in the normal flow.

**Step 2 — Make the card the anchor. Save and refresh.**

```css
.card {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  position: relative;   /* ADD: card becomes the anchor */
}
```

Nothing visually changes yet. The card is now a positioning anchor.

**Step 3 — Position the badge. Save and refresh.**

```css
.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #dd3355;
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 7px;
  border-radius: 10px;
}
```

The badge now sits in the top-right corner of the card, slightly outside
its border because `top: -10px; right: -10px` places it 10px above and 10px
to the right of the card's edges. It floats above the card content because
absolutely positioned elements are removed from flow.

This exact pattern — `position: relative` on the parent, `position: absolute`
on the child with `top`/`right` — is how you build:
- Notification badges on icons
- Close buttons on panels
- Corner labels on cards
- The expand/collapse arrow on a panel header
- Any decorative element that overlays its container

---

## Part 8 — position: fixed

`position: fixed` removes an element from the normal flow and positions it
relative to the **viewport** — the browser window. It stays in that position
even when the page scrolls.

Add styles for the fixed bar. Save and refresh.

```css
.fixed-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: #111130;
  border-top: 1px solid rgba(51,119,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6688aa;
  font-family: 'Consolas', monospace;
}
```

A bar appears at the bottom of the browser window. Scroll up and down — it
stays fixed to the bottom of the viewport.

`left: 0; right: 0` stretches it edge to edge. This is equivalent to
`width: 100%` but works correctly for fixed elements that stretch to the
viewport width.

**When to use fixed:**
- The application status bar (always visible at the bottom)
- A floating action button that stays visible
- A notification toast that appears in a corner
- Modal overlays that cover the whole screen

**The problem with fixed:** It is removed from flow, so it overlaps content
underneath it. You need to add padding to the bottom of the page content equal
to the fixed bar's height, otherwise the last content is hidden behind it.
In a flex application layout this is handled by the shell structure — the fixed
regions are part of the flex column so nothing overlaps.

---

## Part 9 — position: sticky

Sticky is the most recently added position value. It is a hybrid of relative
and fixed:

- The element starts in the normal flow (like relative)
- When the user scrolls and the element reaches a threshold you define,
  it "sticks" and behaves like fixed — staying on screen
- When the user scrolls back, it returns to its normal position

Add these styles. Save and refresh.

```css
.sticky-container {
  height: 300px;
  overflow-y: auto;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: #1a1a3a;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #6677aa;
}

.sticky-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #778899;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.sticky-item:hover {
  background: rgba(255,255,255,0.03);
}
```

Scroll through the list. Section headers stick to the top as you scroll past
them, then unstick when the next section header reaches them.

**Critical requirement for sticky:** The parent element must have a defined
height and `overflow: auto` (or `scroll`). Sticky only sticks within its
scrolling container. If the container has `overflow: visible` or no defined
height, sticky behaves like relative and never sticks.

**When to use sticky:**
- Section headers in long scrollable lists (exactly what you just built)
- Table headers that stay visible when scrolling a long table
- A toolbar that sticks when the page scrolls past it

---

## Part 10 — z-index: controlling what sits on top

When positioned elements overlap, `z-index` controls which one appears on top.
Higher number = closer to the viewer = drawn on top.

`z-index` only works on elements that have a position value other than static.
Setting `z-index` on a static element does nothing.

Add a visual demonstration. Add this to your HTML inside `<section id="exp-1">`,
right after the `.parent` div:

```html
<div class="z-demo">
  <div class="z-box z1">z-index: 1</div>
  <div class="z-box z2">z-index: 2</div>
  <div class="z-box z3">z-index: 3</div>
</div>
```

Now add the CSS. Save and refresh after each step.

**Step 1 — The container. Save.**

```css
.z-demo {
  position: relative;
  height: 100px;
  margin-top: 16px;
}
```

Nothing visible yet — the boxes are static and have no styling.

**Step 2 — Make the boxes overlap. Save.**

```css
.z-box {
  position: absolute;
  width: 160px;
  height: 60px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: 'Consolas', monospace;
  border: 1px solid rgba(255,255,255,0.2);
}

.z1 { top: 0;    left: 0;   background: rgba(220, 50,  80,  0.8); }
.z2 { top: 15px; left: 40px; background: rgba(51,  119, 255, 0.8); }
.z3 { top: 30px; left: 80px; background: rgba(51,  187, 119, 0.8); }
```

Three colored boxes overlap each other. Right now the green one (z3) is on
top because it appears last in the HTML. Without explicit z-index, later
elements appear on top of earlier ones.

**Step 3 — Explicitly set z-index values. Save.**

```css
.z1 { top: 0;    left: 0;   background: rgba(220, 50,  80,  0.8); z-index: 3; }
.z2 { top: 15px; left: 40px; background: rgba(51,  119, 255, 0.8); z-index: 1; }
.z3 { top: 30px; left: 80px; background: rgba(51,  187, 119, 0.8); z-index: 2; }
```

The red box (z-index: 3) is now on top even though it appears first in the HTML.
The blue box (z-index: 1) is at the bottom of the stack.

**The z-index values to use in an application:**

Pick a system and stick to it. Here is a good one:

```css
:root {
  --z-base:    0;     /* normal content */
  --z-raised:  10;    /* slightly elevated: dropdowns, tooltips */
  --z-menu:    100;   /* menus that float above everything */
  --z-overlay: 1000;  /* modal overlays */
  --z-toast:   2000;  /* notifications on top of everything */
}
```

This system means you never have to think about z-index — you just use the
right variable for the context.

---

## Part 11 — The dropdown menu: putting it all together

The dropdown menu combines everything in this lab:
- `position: relative` on the trigger container (the anchor)
- `position: absolute` on the dropdown (positioned relative to the trigger)
- `z-index` to float above other content
- `:hover` to show and hide it

Add CSS for the dropdown. Add each rule, save, and watch it change.

**Step 1 — Style the trigger button. Save.**

```css
.menu-root {
  display: inline-block;
  position: relative;
}

.menu-trigger {
  height: 28px;
  padding: 0 14px;
  background: #111120;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #8899aa;
  font-size: 13px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  cursor: pointer;
}

.menu-trigger:hover {
  background: #1a1a30;
  color: #c0c0d8;
}
```

A styled button appears. The `.menu-root` is `display: inline-block` so it
wraps tightly around the button and becomes the positioning anchor.

**Step 2 — Style the dropdown panel. Save.**

```css
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 160px;
  background: #111120;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  z-index: 100;
}
```

The dropdown panel appears below the button. `top: 100%` means "start at the
bottom edge of the parent" — perfectly positioned below the trigger. It always
appears below the trigger even if you move the trigger around the page.

**Step 3 — Style the items. Save.**

```css
.dropdown-item {
  padding: 7px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #8899aa;
  cursor: pointer;
}

.dropdown-item:hover {
  background: rgba(51,119,255,0.15);
  color: #c0c0d8;
}

.dropdown-sep {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 4px 0;
}
```

The items have hover states. The separator is a horizontal line.

**Step 4 — Hide the dropdown by default, show on hover. Save.**

```css
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 160px;
  background: #111120;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  z-index: 100;

  /* Hidden by default */
  display: none;
}

.menu-root:hover .dropdown {
  display: block;
}
```

Now the dropdown hides until you hover over the trigger. Hover over "File" —
the menu appears. Move the mouse away — it disappears.

This is a pure CSS dropdown. No JavaScript. It works because `.menu-root:hover`
matches when the mouse is anywhere inside `.menu-root` — including inside the
dropdown itself. As long as your cursor is over the trigger or the open menu,
it stays visible.

**The limitation:** This CSS-only approach closes the menu the instant the
mouse leaves. Real application menus stay open until you click elsewhere. That
requires JavaScript — which you will add in the UI Labs. For now, understand
the CSS positioning mechanics.

---

## Part 12 — The tooltip

A tooltip is the same pattern as the dropdown — absolute positioned, anchored
to a relative parent, shown on hover.

Add CSS for the tooltip:

**Step 1 — Make the button the anchor. Save.**

```css
.has-tooltip {
  position: relative;
  display: inline-block;
  padding: 8px 16px;
  background: #111120;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #8899aa;
  cursor: pointer;
  font-size: 13px;
}

.has-tooltip:hover {
  color: #c0c0d8;
}
```

**Step 2 — Position the tooltip above the button. Save.**

```css
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a3a;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #c0c0d8;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  z-index: 100;

  /* Hidden by default */
  display: none;
}

.has-tooltip:hover .tooltip {
  display: block;
}
```

Hover over the button. The tooltip appears above it. Let's break down the
positioning:

- `bottom: calc(100% + 8px)` — places the bottom edge of the tooltip 100% of
  the button's height above the button, plus 8px gap. It sits above the button.
- `left: 50%` — moves the tooltip's left edge to the center of the button
- `transform: translateX(-50%)` — shifts the tooltip left by half its own width,
  centering it over the button
- `white-space: nowrap` — prevents the tooltip from wrapping to multiple lines

**Step 3 — Add the arrow. Save.**

A small triangle pointing down from the tooltip to the button makes it look
professional. Add this using a `::after` pseudo-element:

```css
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(255,255,255,0.15);
}
```

A small triangle appears at the bottom of the tooltip pointing toward the
button. The triangle is made from CSS borders — a technique worth understanding:

When you set borders on all four sides of a zero-size element with
`transparent` on three sides and a color on one, the colored border
creates a triangle. The angle points away from the colored side.

---

## Part 13 — The overlay

An overlay covers the entire screen behind a modal panel. It is always
`position: fixed` because it needs to cover the viewport regardless of scroll.

**Step 1 — Style the overlay backdrop. Save.**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  /* Hidden by default */
  display: none;
}
```

`inset: 0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`. It
stretches the overlay to fill the entire viewport.

**Step 2 — Style the panel inside the overlay. Save.**

```css
.overlay-panel {
  background: #111120;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 16px 48px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overlay-panel h3 {
  font-size: 16px;
  color: #c0c0d8;
}

.overlay-panel p {
  font-size: 13px;
  color: #7788aa;
  line-height: 1.6;
}

.overlay-panel button {
  align-self: flex-end;
  padding: 8px 20px;
  background: #3377ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.overlay-panel button:hover {
  background: #4488ff;
}
```

**Step 3 — Wire the open/close with JavaScript. Save.**

This is the one small script in this lab. Add it just before `</body>`:

```html
<script>
  document.getElementById('open-overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'flex';
  });

  document.getElementById('close-overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
  });

  // Close when clicking the backdrop (not the panel)
  document.getElementById('overlay').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
</script>
```

Click "Open Overlay". The dark backdrop covers the page. The panel sits
centered over it. Click "Close" or click outside the panel to dismiss it.

Notice `e.target === this` in the backdrop click handler. `e.target` is the
element that was actually clicked. `this` is the overlay div. If the user
clicked the panel (which is inside the overlay), `e.target` is the panel,
not the overlay — so the condition is false and nothing happens. If the user
clicked the dark backdrop directly, `e.target` is the overlay itself —
condition is true, overlay closes. This is the correct way to make a
dismissible overlay.

---

## Part 14 — The five position values: the complete mental model

Here is when to use each one:

**`static` (default)**
Use it: always, as the default. You never write it.
The element is in the normal flow. `top`/`left`/`right`/`bottom` are ignored.

**`relative`**
Use it for:
1. Making an element the anchor for an absolutely positioned child.
   You almost always add it to a parent container with nothing else.
2. Fine-tuning an element's position by a small amount without removing
   it from flow.

**`absolute`**
Use it for:
- Anything that "pops out" of the flow: dropdowns, tooltips, badges,
  floating buttons, context menus.
- Always pair with a `position: relative` ancestor to anchor it.
- `top`/`left`/`right`/`bottom` are measured from the nearest positioned ancestor.

**`fixed`**
Use it for:
- Things that must stay on screen regardless of scroll: the status bar,
  notification toasts, modal overlays.
- Measured from the viewport edges, not any parent.
- `inset: 0` + a background color = full-screen overlay.

**`sticky`**
Use it for:
- Section headers in scrollable lists.
- Headers that should travel with the page until they hit the top,
  then stick there.
- Requires the parent to have a defined height and overflow.

---

## Part 15 — Apply to camtool.html

Open `camtool.html`. You are going to add two things using what you learned.

**Task 1: Identify all the positioned elements.**

Look through your CSS. Find every element that has a `position` value. For
each one, answer:
- What type of positioning does it use?
- What is it anchored to?
- Why does it need positioning instead of just being in the flow?

There should be at least one — the `.viewport` section has
`position: relative`. It needs this so the canvas element inside it can later
be positioned absolutely to fill it.

**Task 2: Add a notification badge to the G-CODE button.**

Find the G-CODE button in your toolbar. Add a small badge to it showing
that there are unsaved changes. The badge should sit in the top-right corner
of the button, slightly overlapping its edge.

The HTML change — give the button a wrapper:

```html
<div class="tbtn-wrapper">
  <button class="tbtn tbtn-accent" title="Generate G-code (Ctrl+G)">G-CODE</button>
  <span class="tbtn-badge">!</span>
</div>
```

The CSS to add:

```css
.tbtn-wrapper {
  position: relative;
  display: inline-flex;
}

.tbtn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: #dd3355;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
```

Save and refresh. A small red dot with "!" sits in the top-right corner of
the G-CODE button. `pointer-events: none` makes the badge invisible to mouse
events — clicking the button area still triggers the button, not the badge.

---

## What you learned in this lab

- `static` is the default. Elements sit in normal flow. `top`/`left` do nothing.
- `relative` keeps the element in flow but allows visual offset. Used mainly
  as an anchor for absolute children.
- `absolute` removes the element from flow. Positions relative to the nearest
  positioned ancestor. Without a positioned ancestor it floats to the document.
- The anchor pattern: `position: relative` on the parent, `position: absolute`
  on the child. This is how every dropdown, tooltip, badge, and floating panel
  works.
- `fixed` positions relative to the viewport. Stays put on scroll.
  `inset: 0` stretches to cover the full viewport.
- `sticky` sticks to a threshold as the user scrolls. Requires a scrolling
  parent container.
- `z-index` controls layering order. Only works on positioned elements.
  Use a z-index scale with CSS variables.
- `top: 100%` places an element directly below its parent.
- `transform: translateX(-50%)` combined with `left: 50%` centers horizontally.
- `calc()` combines units: `bottom: calc(100% + 8px)` means "above parent
  plus 8px gap."

## What comes in Lab 4

Lab 4 is CSS Grid — the tool for two-dimensional layouts. Where flex handles
one direction at a time, Grid handles rows and columns simultaneously. You will
build a settings panel with a precise grid layout, a card grid that adapts to
available space, and understand when to use Grid versus when to use Flex.
After Lab 4 you will have every layout tool you need to build any UI you
can imagine.
