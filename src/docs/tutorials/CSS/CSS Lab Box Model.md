# CSS Masterclass — Lab 1
## How Everything Is Sized: The Box Model

---

**What this lab is about.**

Before you can control layout, you need to understand the one thing that governs
how every single element on a page takes up space. It's called the box model.
Every layout bug you've ever had — things too wide, things overflowing, padding
making things the wrong size — traces back to not having this fully internalized.

By the end of this lab you will understand exactly why things are the size they
are and how to control it precisely. This is the foundation every other CSS
concept builds on.

---

## Part 1 — Every element is a rectangle

No matter what it looks like — a circle, a rounded card, a diagonal line — every
HTML element occupies a rectangular region of space. That rectangle has four
layers:

```
┌─────────────────────────────────────┐
│              MARGIN                 │  ← space outside the element
│   ┌─────────────────────────────┐   │
│   │           BORDER            │   │  ← the visible edge
│   │   ┌─────────────────────┐   │   │
│   │   │       PADDING       │   │   │  ← space inside the border
│   │   │   ┌─────────────┐   │   │   │
│   │   │   │   CONTENT   │   │   │   │  ← your actual text/image
│   │   │   └─────────────┘   │   │   │
│   │   └─────────────────────┘   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

These four layers exist on every element, all the time, even if they're zero.
When you set `width: 200px` — which part are you setting? That depends on one
property that changes everything.

---

## Part 2 — The box-sizing disaster

Create a new file called `box-model.html`. Type this:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Box Model</title>
  <style>

    body {
      background: #0d0d1a;
      color: white;
      padding: 40px;
      font-family: monospace;
    }

    .box {
      width: 300px;
      padding: 20px;
      border: 4px solid #3377ff;
      background: #1a1a3e;
      margin-bottom: 20px;
    }

  </style>
</head>
<body>

  <div class="box">
    I am 300px wide — or am I?
  </div>

</body>
</html>
```

Save and open in the browser. The box appears. Now open browser DevTools
(F12 or right-click → Inspect). Click on the box. In the DevTools panel,
find the box model diagram — it's usually in the "Computed" tab or at the
bottom of the "Styles" panel. It shows the four layers.

**What is the actual width of that box?**

You set `width: 300px`. But the box has `padding: 20px` on each side and
`border: 4px` on each side. By default, CSS adds those on top:

```
Total width = 300px + 20px left padding + 20px right padding + 4px left border + 4px right border
Total width = 348px
```

Your box is 348px wide even though you wrote `width: 300px`. This is the
`content-box` model — the default, and it is the source of more layout bugs
than anything else in CSS.

To see this: add a second box with a different color and watch the widths differ
even though both have `width: 300px`:

```html
<div class="box">I have padding: 20px so I'm actually 348px wide</div>

<div class="box" style="padding: 0;">I have no padding so I'm exactly 300px wide</div>
```

The box with no padding aligns differently than the one with padding, even
though both have `width: 300px`. This is why layouts break when you add padding.

---

## Part 3 — The fix: border-box

`box-sizing: border-box` changes the model so that `width` includes the padding
and border. When you say `width: 300px`, you get 300px total — the content area
shrinks to make room for padding and border.

Add this rule to your `<style>` block, before anything else:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

Save and refresh. The box is now exactly 300px. Adding padding no longer changes
the outer size. This is how every human thinks `width` should work.

This is the very first rule in every professional CSS file. It is so universally
used that not having it is considered a mistake. You will add it to every project
you ever start.

The `*` selector targets every element. `*::before` and `*::after` catch the
pseudo-elements that CSS sometimes creates. Without those, you can have subtle
bugs in very specific situations.

---

## Part 4 — Margin, padding, and the difference

Margin and padding look similar — both create space — but they are completely
different:

**Padding** is inside the element. It's part of the element's background. It
pushes the content away from the border but the background color fills it.

**Margin** is outside the element. It's always transparent. It creates space
between elements.

To see the difference, add this to your file:

```css
.demo-padding {
  width: 200px;
  padding: 30px;
  background: #1a3a6e;
  border: 2px solid #3377ff;
  margin-bottom: 16px;
}

.demo-margin {
  width: 200px;
  padding: 8px;
  background: #1a3a6e;
  border: 2px solid #3377ff;
  margin: 30px;
}
```

```html
<div class="demo-padding">padding: 30px — blue background fills the padding area</div>
<div class="demo-margin">margin: 30px — space outside, no background</div>
```

The padding box has blue background pushing the text away from the edges.
The margin box has invisible space around it — the dark body background shows
through the margin area.

**When to use which:**

- Use **padding** when you want space inside an element — between text and its
  background/border.
- Use **margin** when you want space between elements.

This distinction becomes very important when building panels and cards. The
panel header has `padding` so the text sits away from the edges with the correct
background color. The gap between panels uses `margin` or `gap` in a flex
container.

---

## Part 5 — Margin collapse: the weird behavior you need to know

Vertical margins between elements do not always add up. When the bottom margin
of one element meets the top margin of the next, they **collapse** — only the
larger value is used.

Add this to your file:

```css
.block-a {
  background: #2a1a4e;
  border: 1px solid #7744ff;
  padding: 12px;
  margin-bottom: 40px;
}

.block-b {
  background: #1a2a4e;
  border: 1px solid #3377ff;
  padding: 12px;
  margin-top: 20px;
}
```

```html
<div class="block-a">I have margin-bottom: 40px</div>
<div class="block-b">I have margin-top: 20px</div>
```

You might expect 60px of space between them (40 + 20). But you get 40px — the
larger of the two. This is margin collapse. It only happens between block
elements in the normal document flow, and only vertically.

It does NOT happen:
- With horizontal margins (left/right)
- Inside flex or grid containers
- When there's a border or padding between the parent and child
- With `position: absolute` or `position: fixed` elements

In practice: when you're building application layouts with flexbox, margin
collapse almost never bites you because flex containers disable it. But when
you're styling typography — headings, paragraphs — it matters constantly.

The cleanest way to avoid thinking about it: use `gap` in flex/grid containers
instead of margins for spacing between items.

---

## Part 6 — Width and height: why height is different

Width behaves one way. Height behaves differently. This confuses everyone.

**Width**: by default, block elements stretch to fill their parent's width.
A `div` inside a 500px container is 500px wide without you doing anything.

**Height**: by default, elements shrink to fit their content. A `div` with
one line of text is one line tall, regardless of the container's height.

To see this:

```css
.container {
  width: 400px;
  height: 300px;
  background: #1a1a3e;
  border: 2px solid #3377ff;
}

.child {
  background: rgba(255, 100, 100, 0.3);
  border: 1px solid #ff5555;
  padding: 8px;
  /* No width or height set */
}
```

```html
<div class="container">
  <div class="child">I fill the width automatically but only wrap my content's height</div>
</div>
```

The child fills the full 400px width automatically. But it's only as tall as
its text — not the full 300px of the container.

To make the child fill the height too:

```css
.child {
  height: 100%;
}
```

But `height: 100%` only works if the parent has a defined height. The parent
has `height: 300px` so it works here. If the parent's height were defined by
its content (no explicit height), `height: 100%` would have no effect.

This is the root cause of the problem from Lab 1 where you needed
`height: 100%` on both `html` and `body`. The viewport height exists but
the browser doesn't automatically pass it down to `html` and `body` — you
have to ask.

**The practical rule:** Width flows down automatically. Height must be
explicitly requested at every level of the tree, or you use flexbox with
`flex: 1` which handles it properly.

---

## Part 7 — Display: how elements participate in layout

Every element has a `display` value that controls how it behaves in the layout.
The most important values:

**`block`** — takes up the full available width, starts on a new line. Default
for `div`, `p`, `h1`, `section`, `article`.

**`inline`** — sits in a line with text, only as wide as its content. Default
for `span`, `a`, `strong`, `em`. You cannot set width or height on inline
elements.

**`inline-block`** — sits in a line like inline, but you CAN set width and
height. Useful for buttons that need to sit in text flow.

**`flex`** — the container becomes a flex container, children become flex
items. This is the primary layout tool.

**`grid`** — the container becomes a grid container. For two-dimensional
layouts.

**`none`** — element is removed from the page completely. Takes up no space.
(Different from `visibility: hidden` which hides the element but keeps
its space.)

Test this:

```css
.inline-demo span {
  background: #2a1a4e;
  border: 1px solid #7744ff;
  padding: 8px;
  width: 200px;      /* has NO effect on inline elements */
  height: 60px;      /* has NO effect on inline elements */
}

.inline-block-demo span {
  display: inline-block;
  background: #1a2a4e;
  border: 1px solid #3377ff;
  padding: 8px;
  width: 200px;      /* NOW it works */
  height: 60px;      /* NOW it works */
}
```

```html
<div class="inline-demo">
  <span>First</span>
  <span>Second</span>
  <span>Third — width and height ignored on inline elements</span>
</div>

<div class="inline-block-demo">
  <span>First</span>
  <span>Second</span>
  <span>Third — width and height work with inline-block</span>
</div>
```

---

## Part 8 — Experiment: deliberately break things to understand them

This is the most important learning technique in CSS. Pick any property you
want to understand and remove it, then watch what breaks.

Take the application shell from Lab 1. Open `camtool.html`. Find these rules
and try removing these specific properties one at a time. Save, refresh, observe
what happens, then put it back before removing the next one:

**Experiment 1:** Remove `flex-shrink: 0` from `.menubar`.
Make the browser window very short (drag the bottom edge up). The menubar
compresses. Without `flex-shrink: 0`, flex is allowed to shrink it.

**Experiment 2:** Remove `min-height: 0` from `.app-body`.
The layout may look fine at first. Add a long list of items to the properties
panel to make it overflow. The panel now expands and pushes the statusbar off
screen. `min-height: 0` is what allows flex children to shrink below their
content size.

**Experiment 3:** Remove `overflow: hidden` from `html, body`.
Resize the window. Notice that scroll bars appear. The app no longer fills
the window cleanly — it behaves like a webpage instead of an application.

**Experiment 4:** Remove `min-width: 0` from `.main-area`.
Make the browser window narrow. The main area stops shrinking and overflows
past the right edge. `min-width: 0` tells flex "you are allowed to shrink
smaller than your content."

**Experiment 5:** Change `box-sizing: border-box` to `box-sizing: content-box`
for `.form-input`. Set `width: 100%` on an input inside a panel. The input
overflows its container because the content-box model adds padding on top
of the width.

Each experiment teaches you what that property actually does better than reading
about it ever could, because you see the exact breakage it prevents.

---

## Part 9 — Units: when to use px, %, em, rem, vh, vw

Different CSS units are appropriate in different situations. Using the wrong
unit causes things to behave unexpectedly when content changes or the window
resizes.

**`px` — pixels**
Fixed size. Use for: borders (always 1px), icon sizes, minimum widths,
anything that should never change size regardless of context. Most of your
spacing in an application UI is in pixels because you want precise, consistent
spacing.

```css
border: 1px solid #333;    /* always 1 pixel */
min-width: 40px;           /* never smaller than 40px */
width: 260px;              /* fixed panel width */
```

**`%` — percentage of parent**
Use for: widths that should fill available space, layout divisions. Percentages
for height only work if the parent has an explicit height.

```css
width: 100%;     /* fill parent width */
width: 50%;      /* half the parent width */
```

**`em` — relative to the element's font-size**
1em equals the current font-size. If `font-size: 16px`, then `1em = 16px`. If
you change the font-size, everything in em scales with it. Use for: padding and
spacing that should scale with text size — good for readable typography.

```css
font-size: 16px;
padding: 0.5em;   /* = 8px, scales if font-size changes */
line-height: 1.5; /* = 24px — line-height without units is a multiplier */
```

**`rem` — relative to the ROOT element's font-size**
Unlike `em`, `rem` is always relative to `html`'s font-size, not the current
element. No cascading surprises. Use for: consistent spacing that should scale
globally but not cascade. Most modern CSS uses `rem` for font sizes.

```css
html { font-size: 16px; }
h1 { font-size: 2rem; }     /* = 32px always */
p  { font-size: 1rem; }     /* = 16px always */
```

**`vh` and `vw` — viewport height and width**
`100vh` = the full viewport height. `100vw` = the full viewport width.
Use for: elements that should fill the screen regardless of content.

```css
height: 100vh;    /* fill the entire viewport height */
```

**`fr` — fraction (CSS Grid only)**
Divides available space. Use inside CSS Grid. `1fr` = one fraction of available
space. `2fr 1fr` = two thirds and one third.

**For application UIs like CAD/CAM, you mostly use:**
- `px` for all sizing, spacing, borders
- `%` for widths that fill a container (`width: 100%`)
- `vh` for the app shell height (`height: 100vh`)
- `fr` when using CSS Grid

---

## Part 10 — The experiment file

Here is a complete file that demonstrates all the box model concepts. Type it
out in a new file called `box-experiments.html`. As you type each section, stop
and look at it in the browser before continuing.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Box Model Experiments</title>
  <style>

    /* The universal rule — always first */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: #0d0d1a;
      color: #c0c0d8;
      font-family: 'Consolas', monospace;
      font-size: 13px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #556688;
      margin-bottom: 12px;
    }

    /* ── Experiment 1: content-box vs border-box ── */

    .experiment-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .content-box-demo {
      box-sizing: content-box;  /* overrides the universal rule above */
      width: 200px;
      padding: 20px;
      border: 4px solid #dd3355;
      background: #2a1a2e;
      color: #ffaaaa;
    }

    .border-box-demo {
      box-sizing: border-box;
      width: 200px;
      padding: 20px;
      border: 4px solid #3377ff;
      background: #1a1a2e;
      color: #aaaaff;
    }

    /* ── Experiment 2: margin vs padding ── */

    .outer {
      background: #1a2a1a;
      border: 1px dashed #336633;
    }

    .padding-demo {
      background: #2a4a2a;
      border: 2px solid #44aa44;
      padding: 24px;
      font-size: 12px;
    }

    .margin-demo {
      background: #2a4a2a;
      border: 2px solid #44aa44;
      margin: 24px;
      font-size: 12px;
    }

    /* ── Experiment 3: height inheritance ── */

    .height-parent {
      height: 150px;
      background: #1a1a3a;
      border: 1px solid #3333aa;
      display: flex;
      gap: 8px;
      padding: 8px;
    }

    .height-auto {
      background: #3333aa44;
      border: 1px solid #5555cc;
      padding: 8px;
      /* no height set — shrinks to content */
    }

    .height-full {
      height: 100%;
      background: #3333aa44;
      border: 1px solid #5555cc;
      padding: 8px;
    }

    /* ── Experiment 4: display values ── */

    .display-demo span {
      background: #2a1a4e;
      border: 1px solid #7744ff;
      padding: 8px 12px;
      /* inline — cannot set width/height */
    }

    .display-demo.block-mode span {
      display: block;
      width: 180px;
      margin-bottom: 4px;
    }

    .display-demo.inline-block-mode span {
      display: inline-block;
      width: 120px;
      height: 40px;
      vertical-align: middle;
    }

    /* ── Experiment 5: overflow ── */

    .overflow-parent {
      width: 300px;
      height: 80px;
      background: #1a1a3a;
      border: 1px solid #3377ff;
      margin-bottom: 8px;
    }

    .overflow-visible { overflow: visible; }
    .overflow-hidden  { overflow: hidden;  }
    .overflow-scroll  { overflow: scroll;  }
    .overflow-auto    { overflow: auto;    }

    .overflow-content {
      background: #3377ff33;
      border: 1px solid #3377ff;
      padding: 8px;
      width: 400px;    /* wider than parent */
      white-space: nowrap;
    }

    /* Labels */
    .label {
      font-size: 11px;
      color: #445566;
      margin-bottom: 4px;
    }

    .value {
      color: #88aaff;
    }

  </style>
</head>
<body>

  <!-- Experiment 1: box-sizing -->
  <div>
    <h2>Experiment 1 — content-box vs border-box (both have width: 200px)</h2>
    <div class="experiment-row">

      <div>
        <div class="label">box-sizing: content-box (default, broken)</div>
        <div class="content-box-demo">
          width: 200px<br>
          padding: 20px<br>
          border: 4px<br>
          <span class="value">actual width: 248px</span>
        </div>
      </div>

      <div>
        <div class="label">box-sizing: border-box (correct)</div>
        <div class="border-box-demo">
          width: 200px<br>
          padding: 20px<br>
          border: 4px<br>
          <span class="value">actual width: 200px</span>
        </div>
      </div>

    </div>
  </div>

  <!-- Experiment 2: margin vs padding -->
  <div>
    <h2>Experiment 2 — padding is inside (background fills it), margin is outside (transparent)</h2>
    <div class="experiment-row">

      <div>
        <div class="label">padding: 24px — background color fills the padding area</div>
        <div class="outer">
          <div class="padding-demo">I have padding: 24px</div>
        </div>
      </div>

      <div>
        <div class="label">margin: 24px — the outer div's background shows through the margin</div>
        <div class="outer">
          <div class="margin-demo">I have margin: 24px</div>
        </div>
      </div>

    </div>
  </div>

  <!-- Experiment 3: height inheritance -->
  <div>
    <h2>Experiment 3 — height: 100% only works when the parent has a defined height</h2>
    <div class="height-parent">
      <div class="height-auto">
        No height set.<br>Shrinks to content.
      </div>
      <div class="height-full">
        height: 100%<br>Fills parent.
      </div>
    </div>
    <div class="label" style="margin-top: 8px;">
      Parent has height: 150px. The right box fills it because height: 100% works
      when the parent has an explicit height.
    </div>
  </div>

  <!-- Experiment 4: display values -->
  <div>
    <h2>Experiment 4 — display: inline, block, and inline-block</h2>

    <div class="label">inline (default for span) — sits in a line, ignores width/height</div>
    <div class="display-demo" style="margin-bottom: 16px;">
      <span>First</span>
      <span>Second</span>
      <span>Third</span>
    </div>

    <div class="label">display: block — each on its own line, full width</div>
    <div class="display-demo block-mode" style="margin-bottom: 16px;">
      <span>First</span>
      <span>Second</span>
      <span>Third</span>
    </div>

    <div class="label">display: inline-block — sits in a line but respects width/height</div>
    <div class="display-demo inline-block-mode">
      <span>First</span>
      <span>Second</span>
      <span>Third</span>
    </div>
  </div>

  <!-- Experiment 5: overflow -->
  <div>
    <h2>Experiment 5 — overflow controls what happens when content is larger than its container</h2>

    <div class="label">overflow: visible (default) — content escapes the box</div>
    <div class="overflow-parent overflow-visible" style="margin-bottom: 24px;">
      <div class="overflow-content">I am 400px wide but my container is only 300px wide</div>
    </div>

    <div class="label">overflow: hidden — content is clipped at the box edge</div>
    <div class="overflow-parent overflow-hidden" style="margin-bottom: 8px;">
      <div class="overflow-content">I am 400px wide but my container is only 300px wide</div>
    </div>

    <div class="label">overflow: scroll — always shows scrollbars</div>
    <div class="overflow-parent overflow-scroll" style="margin-bottom: 8px;">
      <div class="overflow-content">I am 400px wide but my container is only 300px wide</div>
    </div>

    <div class="label">overflow: auto — shows scrollbars only when needed (use this)</div>
    <div class="overflow-parent overflow-auto">
      <div class="overflow-content">I am 400px wide but my container is only 300px wide</div>
    </div>
  </div>

</body>
</html>
```

Type this out fully. Do not rush the overflow section — it is the most
important part of this lab for building panels. Every scrollable panel in
your application uses `overflow: auto` or `overflow-y: auto`.

---

## Part 11 — Overflow: the concept you will use in every panel

The overflow experiments above show the four values. Here is when to use each
one and why it matters for CAD/CAM panels:

**`overflow: visible`** — the default. Content escapes. Never use this on
panels or containers. It looks broken and is.

**`overflow: hidden`** — content is clipped. The element becomes a clipping
region. Use this on:
- The app root (so nothing escapes the window)
- Elements with rounded corners that need to clip their children
- Intermediate flex containers that need to shrink below content size

**`overflow: auto`** — shows scrollbars only when content overflows. Use this
on every scrollable panel. The properties panel, the G-code output, the entity
list — all use `overflow: auto` (or `overflow-y: auto` to scroll only vertically
and clip horizontally).

**`overflow: scroll`** — always shows scrollbars even when not needed. Almost
never use this. The persistent scrollbar takes up space and looks wrong when
empty.

**The hidden power of overflow: hidden:** When you set `overflow: hidden` on an
element, it also becomes a new **block formatting context**. This has a side
effect you will rely on: it prevents margin collapse and makes floats behave.
In flex layouts you mostly don't need this, but knowing it exists saves you from
mysterious layout bugs.

**`overflow-x` and `overflow-y`:** You can control horizontal and vertical
overflow separately:

```css
.panel-body {
  overflow-y: auto;    /* scroll vertically when content is tall */
  overflow-x: hidden;  /* clip horizontally — no horizontal scroll */
}
```

This is the correct setting for almost every panel in the application. Content
in a panel grows vertically. Horizontal overflow is almost always a bug.

---

## Part 12 — Putting it together: a panel that scrolls correctly

This is the real-world application of everything in this lab. Build a panel
that scrolls its content correctly without overflowing its container. Create
a new file called `scrolling-panel.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Scrolling Panel</title>
  <style>

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
      overflow: hidden;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

    body {
      background: #0d0d1a;
      color: #c0c0d8;
      font-family: 'Consolas', monospace;
      font-size: 13px;
      display: flex;
      height: 100vh;
      padding: 24px;
      gap: 16px;
    }

    /* ── The panel: fixed height, scrolls inside ── */
    .panel {
      width: 260px;
      height: 100%;          /* fill the flex parent (body has height: 100vh) */
      background: #0f0f1e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      display: flex;
      flex-direction: column; /* header on top, body fills rest */
    }

    .panel-header {
      height: 32px;
      background: #111120;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      padding: 0 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #556688;
      flex-shrink: 0;    /* NEVER shrink — header stays visible */
    }

    .panel-body {
      flex: 1;           /* take all remaining height */
      min-height: 0;     /* allow it to shrink (needed for flex) */
      overflow-y: auto;  /* scroll when content overflows */
      overflow-x: hidden;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ── The content items ── */
    .item {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 12px;
      color: #8899bb;
      flex-shrink: 0;    /* items never shrink — they stay their full height */
    }

    .item:hover {
      background: rgba(51, 119, 255, 0.1);
      border-color: rgba(51, 119, 255, 0.3);
      color: #c0c0d8;
    }

    /* ── A panel that does NOT scroll correctly ── */
    .panel-broken {
      width: 260px;
      height: 100%;
      background: #0f0f1e;
      border: 1px solid rgba(255, 50, 50, 0.3);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
    }

    .panel-broken .panel-body {
      flex: 1;
      /* Missing: min-height: 0 */
      /* Missing: overflow-y: auto */
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

  </style>
</head>
<body>

  <!-- CORRECT panel — scrolls properly -->
  <div class="panel">
    <div class="panel-header">Correct Panel</div>
    <div class="panel-body">
      <!-- 20 items — more than fit in the panel -->
      <div class="item">Entity 001 — Line</div>
      <div class="item">Entity 002 — Circle</div>
      <div class="item">Entity 003 — Arc</div>
      <div class="item">Entity 004 — Line</div>
      <div class="item">Entity 005 — Polyline</div>
      <div class="item">Entity 006 — Circle</div>
      <div class="item">Entity 007 — Line</div>
      <div class="item">Entity 008 — Arc</div>
      <div class="item">Entity 009 — Line</div>
      <div class="item">Entity 010 — Circle</div>
      <div class="item">Entity 011 — Line</div>
      <div class="item">Entity 012 — Circle</div>
      <div class="item">Entity 013 — Arc</div>
      <div class="item">Entity 014 — Line</div>
      <div class="item">Entity 015 — Circle</div>
      <div class="item">Entity 016 — Line</div>
      <div class="item">Entity 017 — Arc</div>
      <div class="item">Entity 018 — Line</div>
      <div class="item">Entity 019 — Circle</div>
      <div class="item">Entity 020 — Polyline</div>
    </div>
  </div>

  <!-- BROKEN panel — overflows instead of scrolling -->
  <div class="panel-broken">
    <div class="panel-header" style="background:#111120; border-bottom:1px solid rgba(255,255,255,0.07); height:32px; display:flex; align-items:center; padding:0 12px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:#553333; flex-shrink:0;">Broken Panel</div>
    <div class="panel-body">
      <div class="item">Entity 001 — Line</div>
      <div class="item">Entity 002 — Circle</div>
      <div class="item">Entity 003 — Arc</div>
      <div class="item">Entity 004 — Line</div>
      <div class="item">Entity 005 — Polyline</div>
      <div class="item">Entity 006 — Circle</div>
      <div class="item">Entity 007 — Line</div>
      <div class="item">Entity 008 — Arc</div>
      <div class="item">Entity 009 — Line</div>
      <div class="item">Entity 010 — Circle</div>
      <div class="item">Entity 011 — Line</div>
      <div class="item">Entity 012 — Circle</div>
      <div class="item">Entity 013 — Arc</div>
      <div class="item">Entity 014 — Line</div>
      <div class="item">Entity 015 — Circle</div>
      <div class="item">Entity 016 — Line</div>
      <div class="item">Entity 017 — Arc</div>
      <div class="item">Entity 018 — Line</div>
      <div class="item">Entity 019 — Circle</div>
      <div class="item">Entity 020 — Polyline</div>
    </div>
  </div>

</body>
</html>
```

Open this file. The left panel scrolls. The right panel overflows and extends
past the bottom of the page — the classic symptom.

Compare the two `.panel-body` rules side by side:

```css
/* Working */
.panel .panel-body {
  flex: 1;
  min-height: 0;     /* ← allows flexbox to shrink below content size */
  overflow-y: auto;  /* ← enables scrolling */
}

/* Broken */
.panel-broken .panel-body {
  flex: 1;
  /* no min-height: 0 → flex refuses to shrink → panel grows indefinitely */
  /* no overflow-y → content escapes the container */
}
```

Every scrollable panel in your CAD application uses this exact pattern:
`flex: 1`, `min-height: 0`, `overflow-y: auto`. Without all three, it breaks.
With all three, it always works. Commit this pattern to memory.

---

## What you learned in this lab

- The box model has four layers: content, padding, border, margin
- `box-sizing: border-box` makes width and height behave sensibly — always use it
- Padding is inside the element (background fills it). Margin is outside (transparent).
- Margin collapse happens vertically between block elements — flex containers
  prevent it
- Width fills automatically. Height must be requested explicitly at every level,
  or you use `flex: 1`
- `display` controls how an element participates in layout
- `overflow: auto` is what makes panels scroll — combined with `flex: 1` and
  `min-height: 0`
- When something is too wide or tall and overflowing, `overflow: hidden` clips it

## What comes in Lab 2

Lab 2 is entirely about Flexbox — the layout system you use for 70% of
everything. You will learn what every flex property actually does, build
every common flex pattern from scratch, and understand why flex containers
behave the way they do. By the end of Lab 2 you will be able to look at any
single-axis layout — toolbars, sidebars, stacked panels, row-of-cards — and
write the CSS for it immediately without guessing.