# CSS Masterclass — Lab 2

## Flexbox: The Complete Mental Model

---

**What this lab is about.**

Flexbox is the layout system you use for anything that arranges items in a
single direction — a row or a column. That covers toolbars, sidebars, stacked
panels, navigation bars, button groups, form rows, and the overall app shell.
It is the most important CSS feature to master for building application UIs.

Most tutorials list flex properties. This lab teaches you the **mental model**:
how flex actually thinks about space, so you can predict what any combination of
flex properties will produce without trial and error.

By the end you will be able to look at any layout and immediately know which
flex properties to write.

---

## Part 1 — What flex actually does

When you set `display: flex` on an element, two things happen:

1. The element becomes a **flex container**. It controls how its children
   are laid out.
2. The direct children become **flex items**. They respond to flex properties.

Flex does one thing: it distributes space among items along one axis.

That's it. Everything else — alignment, wrapping, ordering — is secondary.
The core question flex answers is: **"how do the children share the available
space?"**

Create `flex-experiments.html` and start with this base:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Flex Experiments</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        background: #0d0d1a;
        color: #c0c0d8;
        font-family: "Consolas", monospace;
        font-size: 12px;
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }

      h2 {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #445566;
        margin-bottom: 10px;
      }

      /* The container we will experiment with */
      .box {
        background: #0f0f1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        padding: 8px;
      }

      /* The items inside */
      .item {
        background: #1a1a3e;
        border: 1px solid rgba(51, 119, 255, 0.4);
        border-radius: 3px;
        padding: 8px 12px;
        color: #8899cc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
      }

      /* Color variants for visibility */
      .item.a {
        border-color: rgba(51, 119, 255, 0.6);
        background: rgba(51, 119, 255, 0.12);
      }
      .item.b {
        border-color: rgba(119, 51, 255, 0.6);
        background: rgba(119, 51, 255, 0.12);
      }
      .item.c {
        border-color: rgba(51, 187, 119, 0.6);
        background: rgba(51, 187, 119, 0.12);
      }
      .item.d {
        border-color: rgba(255, 150, 50, 0.6);
        background: rgba(255, 150, 50, 0.12);
      }
      .item.e {
        border-color: rgba(220, 50, 80, 0.6);
        background: rgba(220, 50, 80, 0.12);
      }
    </style>
  </head>
  <body>
    <h2>Starting point — no flex yet</h2>
    <div class="box">
      <div class="item a">A</div>
      <div class="item b">B</div>
      <div class="item c">C</div>
    </div>
  </body>
</html>
```

Open this in the browser. You see three boxes stacked vertically. They are
`div` elements so they are `display: block` by default — each takes a full
line.

Now add `display: flex` to `.box`:

```css
.box {
  background: #0f0f1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 8px;
  display: flex; /* ADD THIS */
}
```

Save and refresh. The three boxes are now side by side in a row. Each one
shrinks to fit its content. The flex container distributed them along the
horizontal axis.

This one property changed everything. That is flex.

---

## Part 2 — The two axes

Every flex container has a **main axis** and a **cross axis**.

`flex-direction: row` (the default):

- Main axis runs left → right
- Cross axis runs top → bottom

`flex-direction: column`:

- Main axis runs top → bottom
- Cross axis runs left → right

```
flex-direction: row

  ←───────── main axis ──────────→
  ↑  [  A  ] [  B  ] [  C  ]
  │
 cross
 axis
  │
  ↓

flex-direction: column

  ↑  [  A  ]   ←── cross axis ──→
  │  [  B  ]
 main
 axis
  │  [  C  ]
  ↓
```

All flex properties work relative to these axes. When you understand which axis
something operates on, the behavior is predictable.

Add this section to your experiment file, after the first experiment:

```html
<h2>flex-direction: column</h2>
<div
  class="box"
  style="display: flex; flex-direction: column; gap: 4px; height: 200px;"
>
  <div class="item a">A</div>
  <div class="item b">B</div>
  <div class="item c">C</div>
</div>
```

The items stack vertically again — but now as flex items in a column, not as
normal block elements. The difference matters when you start controlling sizes.

---

## Part 3 — flex-grow, flex-shrink, flex-basis: the three that matter most

These three properties control how a flex item behaves when there is extra space
or not enough space.

**`flex-basis`** — the item's starting size along the main axis, before any
space is distributed. Think of it as the "natural size" the item wants to be.

**`flex-grow`** — if there is leftover space in the container, how much does
this item take? `0` = take nothing extra. `1` = take a share. `2` = take twice
as large a share as items with `1`.

**`flex-shrink`** — if items overflow the container, how much does this item
give up? `0` = never shrink. `1` = shrink proportionally. Default is `1`.

They are usually written together with the shorthand `flex`:

```css
flex: grow shrink basis;

flex: 1; /* flex: 1 1 0  — grow, shrink, start from 0 */
flex: 0; /* flex: 0 1 auto — don't grow, can shrink, natural size */
flex: none; /* flex: 0 0 auto — don't grow, don't shrink, natural size */
```

Add experiments for each:

```html
<h2>flex-grow — distributing leftover space</h2>
<div class="box" style="display: flex; gap: 4px;">
  <div class="item a" style="flex-grow: 0;">grow: 0 (natural width)</div>
  <div class="item b" style="flex-grow: 1;">grow: 1 (takes leftover space)</div>
  <div class="item c" style="flex-grow: 0;">grow: 0 (natural width)</div>
</div>
```

The middle item expands to fill all remaining space. The other two stay at
their content width. This is how a search bar in a toolbar works — the label
and button are fixed, the input expands to fill the middle.

```html
<h2>flex-grow with ratios — two items splitting the space</h2>
<div class="box" style="display: flex; gap: 4px;">
  <div class="item a" style="flex-grow: 1;">grow: 1 (1/3 of space)</div>
  <div class="item b" style="flex-grow: 2;">grow: 2 (2/3 of space)</div>
</div>
```

Item B gets twice as much space as item A. The `flex-grow` values are ratios,
not fixed widths.

```html
<h2>flex-shrink — items giving up space when container is too small</h2>
<div class="box" style="display: flex; gap: 4px; width: 300px;">
  <div class="item a" style="flex-basis: 200px; flex-shrink: 1;">
    shrink: 1 (will shrink)
  </div>
  <div class="item b" style="flex-basis: 200px; flex-shrink: 0;">
    shrink: 0 (won't shrink)
  </div>
</div>
```

Both items want to be 200px, but the container is only 300px (minus the gap,
about 296px). Together they need 400px. Something has to give. Item A shrinks
because `flex-shrink: 1`. Item B stays at 200px because `flex-shrink: 0`.
Item A takes the overflow penalty alone.

This is how `flex-shrink: 0` works in the application shell — the menubar and
statusbar refuse to shrink while the content area takes all the flex pressure.

---

## Part 4 — The shorthand `flex: 1` explained completely

`flex: 1` is the most commonly written flex value. Let's understand exactly
what it means:

`flex: 1` expands to `flex: 1 1 0`:

- `flex-grow: 1` — take available space
- `flex-shrink: 1` — give up space if needed
- `flex-basis: 0` — start from zero width/height before growing

Starting from zero is important. It means the item grows to fill space based
on the available space, not its content size. If you have two siblings both
with `flex: 1`, they split the space exactly equally regardless of content.

Compare `flex: 1` to `flex: 1 1 auto`:

- `flex: 1 1 auto` starts from the item's natural content size, then grows
- `flex: 1` (`flex: 1 1 0`) starts from zero, then grows

```html
<h2>flex: 1 vs flex: 1 1 auto — the difference matters</h2>
<div class="box" style="display: flex; gap: 4px; margin-bottom: 8px;">
  <div class="item a" style="flex: 1;">flex: 1 — equal halves</div>
  <div class="item b" style="flex: 1;">flex: 1 — equal halves</div>
</div>
<div class="box" style="display: flex; gap: 4px;">
  <div class="item a" style="flex: 1 1 auto;">
    flex: 1 1 auto — splits based on content size
  </div>
  <div class="item b" style="flex: 1 1 auto;">short</div>
</div>
```

In the first row both items are exactly equal. In the second row the longer
item is slightly wider because it starts from its content size before growing.
For most application layouts, `flex: 1` (equal distribution from zero) is what
you want.

---

## Part 5 — Alignment: justify-content and align-items

These two properties control where items sit in the container when there is
space around them.

**`justify-content`** — positions items along the **main axis** (horizontal
for rows, vertical for columns). Applies when there is leftover space that
no item is consuming with `flex-grow`.

**`align-items`** — positions items along the **cross axis** (vertical for
rows, horizontal for columns).

Add this section to your file. Read the value, predict the result, then look
at what happens:

```html
<h2>justify-content — distributing items along the main axis</h2>

<div style="display: flex; flex-direction: column; gap: 6px;">
  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      flex-start (default)
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; justify-content: flex-start;"
    >
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      flex-end
    </div>
    <div class="box" style="display:flex; gap:4px; justify-content: flex-end;">
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">center</div>
    <div class="box" style="display:flex; gap:4px; justify-content: center;">
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      space-between — first and last at edges, equal gaps between
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; justify-content: space-between;"
    >
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      space-around — equal space around each item
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; justify-content: space-around;"
    >
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      space-evenly — truly equal space between all gaps
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; justify-content: space-evenly;"
    >
      <div class="item a" style="width:80px;">A</div>
      <div class="item b" style="width:80px;">B</div>
      <div class="item c" style="width:80px;">C</div>
    </div>
  </div>
</div>
```

Now the cross axis:

```html
<h2>align-items — positioning items on the cross axis</h2>

<div style="display: flex; flex-direction: column; gap: 6px;">
  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      stretch (default) — items fill the cross axis
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; height:80px; align-items: stretch;"
    >
      <div class="item a">A</div>
      <div class="item b">B</div>
      <div class="item c">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      flex-start — items align to the top
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; height:80px; align-items: flex-start;"
    >
      <div class="item a">A</div>
      <div class="item b" style="padding: 16px 12px;">B (taller)</div>
      <div class="item c">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      center — items align to the middle (what you want for toolbars)
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; height:80px; align-items: center;"
    >
      <div class="item a">A</div>
      <div class="item b" style="padding: 16px 12px;">B (taller)</div>
      <div class="item c">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      flex-end — items align to the bottom
    </div>
    <div
      class="box"
      style="display:flex; gap:4px; height:80px; align-items: flex-end;"
    >
      <div class="item a">A</div>
      <div class="item b" style="padding: 16px 12px;">B (taller)</div>
      <div class="item c">C</div>
    </div>
  </div>

  <div>
    <div style="font-size:10px; color:#445566; margin-bottom:4px;">
      baseline — items align by their text baseline
    </div>
    <div
      class="box"
      style="display:flex; gap:8px; height:80px; align-items: baseline;"
    >
      <div class="item a" style="font-size:11px;">small text</div>
      <div class="item b" style="font-size:22px;">BIG TEXT</div>
      <div class="item c" style="font-size:14px;">medium text</div>
    </div>
  </div>
</div>
```

The most important one for toolbars: `align-items: center`. Every toolbar and
menubar you build uses it so buttons of different heights sit centered on the
same vertical midpoint.

---

## Part 6 — gap: the right way to space items

Before `gap`, you had to use `margin` on every item to create space between
them. This caused problems — the last item had margin on the wrong side, the
first item had margin you didn't want, and you had to use `:last-child` selectors
to remove them.

`gap` is spacing between items only. No gap at the edges.

```css
.box {
  display: flex;
  gap: 8px; /* same gap horizontal and vertical */
  gap: 8px 16px; /* row-gap vertical, column-gap horizontal */
}
```

```html
<h2>gap vs margin — gap is cleaner</h2>

<div style="font-size:10px; color:#445566; margin-bottom:4px;">
  With margin — awkward, need to remove margin from last item
</div>
<div class="box" style="display:flex;">
  <div class="item a" style="margin-right:8px;">A</div>
  <div class="item b" style="margin-right:8px;">B</div>
  <div class="item c">C — no margin-right here, ugly</div>
</div>

<div style="font-size:10px; color:#445566; margin-bottom:4px; margin-top:12px;">
  With gap — clean, even spacing everywhere
</div>
<div class="box" style="display:flex; gap:8px;">
  <div class="item a">A</div>
  <div class="item b">B</div>
  <div class="item c">C</div>
</div>
```

Use `gap` for spacing between flex children. Use `padding` on the container for
spacing from the edges to the children. You almost never need `margin` on flex
items.

---

## Part 7 — The spacer: pushing items to opposite ends

This is one of the most useful flex patterns. In a toolbar you want some buttons
on the left and some on the right with space in between. The spacer achieves this
without JavaScript or absolute positioning.

```html
<h2>The spacer pattern — push items to opposite ends</h2>
<div class="box" style="display:flex; align-items:center; gap:4px;">
  <div class="item a">File</div>
  <div class="item b">Edit</div>
  <div class="item c">View</div>

  <!-- The spacer: a flex item with flex: 1 that eats all leftover space -->
  <div style="flex: 1;"></div>

  <div class="item d">Settings</div>
  <div class="item e">Help</div>
</div>
```

The spacer div has no content and no visible style. It just has `flex: 1`. Since
it is the only item consuming leftover space, it eats all of it, pushing
everything after it to the right edge.

This is exactly what `.tbtn-spacer` does in your `camtool.html`. It pushes
the G-CODE and SIM buttons to the right of the toolbar.

**Alternative using `margin-left: auto`:**

```html
<div class="box" style="display:flex; align-items:center; gap:4px;">
  <div class="item a">Left item</div>
  <div class="item b">Left item</div>
  <!-- No spacer element needed: -->
  <div class="item c" style="margin-left: auto;">I'm pushed right</div>
</div>
```

`margin-left: auto` on a flex item consumes all leftover space on its left side,
effectively pushing the item to the right. Works the same as the spacer but
without an extra element. Use whichever you find more readable.

---

## Part 8 — Nesting flex containers

Real layouts are flex containers inside flex containers. The app shell from
Lab 1 is exactly this: the `.app` is a column flex container, `.app-body` is
another column flex container inside it, `.workspace` is a row flex container
inside that.

Each container only controls its direct children. Children of children are
unaffected by the outer container's flex properties.

```html
<h2>Nested flex — the app shell pattern</h2>

<div
  style="
  display: flex;
  flex-direction: column;
  height: 300px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
"
>
  <!-- Top bar: fixed height -->
  <div
    style="
    height: 32px;
    background: #111120;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    flex-shrink: 0;
    font-size: 11px;
    color: #445566;
  "
  >
    <span>File</span>
    <span>Edit</span>
    <span>View</span>
  </div>

  <!-- Middle: fills remaining height, splits into 3 columns -->
  <div
    style="
    display: flex;
    flex: 1;
    min-height: 0;
  "
  >
    <!-- Left column: fixed width -->
    <div
      style="
      width: 48px;
      background: #0f0f1e;
      border-right: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 4px;
      gap: 4px;
    "
    >
      <div class="item a" style="width:36px; height:36px; font-size:10px;">
        V
      </div>
      <div class="item b" style="width:36px; height:36px; font-size:10px;">
        L
      </div>
      <div class="item c" style="width:36px; height:36px; font-size:10px;">
        C
      </div>
    </div>

    <!-- Center: fills everything -->
    <div
      style="
      flex: 1;
      min-width: 0;
      background: #080810;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334455;
      font-size: 12px;
    "
    >
      Canvas area — flex: 1 fills the rest
    </div>

    <!-- Right column: fixed width -->
    <div
      style="
      width: 200px;
      background: #0f0f1e;
      border-left: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      padding: 8px;
      font-size: 11px;
      color: #445566;
    "
    >
      Properties panel
    </div>
  </div>

  <!-- Bottom bar: fixed height -->
  <div
    style="
    height: 22px;
    background: #060610;
    border-top: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 10px;
    color: #445566;
    flex-shrink: 0;
  "
  >
    Status bar — flex-shrink: 0
  </div>
</div>
```

Type this out. Notice the nesting:

- Outer container: column, 300px tall
- Top bar: `flex-shrink: 0` — stays fixed height
- Middle: `flex: 1; min-height: 0` — fills remaining space, becomes a ROW container
- Inside middle: left (`flex-shrink: 0`), center (`flex: 1`), right (`flex-shrink: 0`)
- Bottom bar: `flex-shrink: 0` — stays fixed height

This is the exact same structure as your `camtool.html` shell. Once you can
build this nested flex structure from memory, you can build any application
layout.

---

## Part 9 — flex-wrap: when items should wrap to a new line

By default, flex items never wrap. They shrink to fit or overflow. Sometimes
you want items to wrap — like a card grid or a chip list.

```css
flex-wrap: nowrap; /* default — all items in one line, shrink to fit */
flex-wrap: wrap; /* items wrap to next line when they overflow */
flex-wrap: wrap-reverse; /* wraps in reverse direction */
```

```html
<h2>flex-wrap — wrapping button chips</h2>

<div style="font-size:10px; color:#445566; margin-bottom:4px;">
  nowrap (default) — items shrink, no wrapping
</div>
<div class="box" style="display:flex; gap:6px; flex-wrap:nowrap; width:400px;">
  <div class="item a" style="white-space:nowrap; padding:6px 14px;">
    Snap to Grid
  </div>
  <div class="item b" style="white-space:nowrap; padding:6px 14px;">
    Show Axes
  </div>
  <div class="item c" style="white-space:nowrap; padding:6px 14px;">
    Show Grid
  </div>
  <div class="item d" style="white-space:nowrap; padding:6px 14px;">
    Ortho Mode
  </div>
  <div class="item e" style="white-space:nowrap; padding:6px 14px;">
    Polar Snap
  </div>
</div>

<div style="font-size:10px; color:#445566; margin-bottom:4px; margin-top:12px;">
  wrap — items wrap to next line
</div>
<div class="box" style="display:flex; gap:6px; flex-wrap:wrap; width:400px;">
  <div class="item a" style="white-space:nowrap; padding:6px 14px;">
    Snap to Grid
  </div>
  <div class="item b" style="white-space:nowrap; padding:6px 14px;">
    Show Axes
  </div>
  <div class="item c" style="white-space:nowrap; padding:6px 14px;">
    Show Grid
  </div>
  <div class="item d" style="white-space:nowrap; padding:6px 14px;">
    Ortho Mode
  </div>
  <div class="item e" style="white-space:nowrap; padding:6px 14px;">
    Polar Snap
  </div>
</div>
```

For application toolbars you almost always want `nowrap` — toolbars don't wrap.
`flex-wrap: wrap` is useful for option panels, tag/chip lists, and responsive
card grids.

---

## Part 10 — align-self: overriding alignment for one item

`align-items` sets alignment for all children. `align-self` overrides it for
a specific child.

```html
<h2>align-self — override alignment for one item</h2>
<div
  class="box"
  style="display:flex; gap:8px; height:100px; align-items:center;"
>
  <div class="item a">Default (center)</div>
  <div class="item b" style="align-self: flex-start;">
    align-self: flex-start
  </div>
  <div class="item c">Default (center)</div>
  <div class="item d" style="align-self: flex-end;">align-self: flex-end</div>
  <div class="item e" style="align-self: stretch;">align-self: stretch</div>
</div>
```

Most items stay centered. B is pushed to the top. D is pushed to the bottom.
E stretches to fill the full height. The outer `align-items: center` is the
default, and `align-self` overrides it per item.

---

## Part 11 — order: rearranging items without changing the HTML

`order` changes visual order without changing the HTML structure. Default
is `0`. Lower numbers appear first. Negative numbers appear before items
with `order: 0`.

```html
<h2>order — visual reordering</h2>
<div class="box" style="display:flex; gap:4px;">
  <div class="item a" style="order: 3;">HTML 1st, shown 3rd</div>
  <div class="item b" style="order: 1;">HTML 2nd, shown 1st</div>
  <div class="item c" style="order: 2;">HTML 3rd, shown 2nd</div>
</div>
```

You rarely use this in normal application UIs, but it's useful for responsive
design where you want to reorder elements at different screen sizes, or for
keyboard-accessible UIs where the tab order (which follows HTML order) should
differ from the visual order.

---

## Part 12 — The five flex patterns you will use constantly

These are the patterns that solve 90% of layout problems. Memorize them.

Add all five to your experiment file:

```html
<h2>Pattern 1 — Fixed header + scrolling body (every panel)</h2>
<div
  style="
  height: 200px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  overflow: hidden;
"
>
  <div
    style="
    height: 32px; flex-shrink: 0;
    background: #111120;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; padding: 0 12px;
    font-size: 11px; color: #556688;
  "
  >
    Panel Header
  </div>
  <div
    style="
    flex: 1; min-height: 0;
    overflow-y: auto;
    padding: 8px;
    display: flex; flex-direction: column; gap: 4px;
  "
  >
    <div class="item a">Row 1</div>
    <div class="item b">Row 2</div>
    <div class="item c">Row 3</div>
    <div class="item a">Row 4</div>
    <div class="item b">Row 5</div>
    <div class="item c">Row 6</div>
    <div class="item a">Row 7</div>
    <div class="item b">Row 8</div>
  </div>
</div>

<h2>Pattern 2 — Centered content</h2>
<div
  style="
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  background: #0f0f1e;
  gap: 12px;
"
>
  <div class="item a" style="padding: 10px 20px;">Cancel</div>
  <div class="item b" style="padding: 10px 20px;">OK</div>
</div>

<h2>Pattern 3 — Toolbar: left group + spacer + right group</h2>
<div
  style="
  height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
"
>
  <div class="item a" style="padding: 4px 10px; font-size:11px;">New</div>
  <div class="item a" style="padding: 4px 10px; font-size:11px;">Open</div>
  <div class="item a" style="padding: 4px 10px; font-size:11px;">Save</div>
  <div style="flex: 1;"></div>
  <div class="item b" style="padding: 4px 10px; font-size:11px;">Settings</div>
</div>

<h2>Pattern 4 — Form row: label + input + unit</h2>
<div
  style="
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
"
>
  <div style="display:flex; align-items:center; gap:8px;">
    <label
      style="width:80px; text-align:right; font-size:11px; color:#556688; flex-shrink:0;"
      >Feed Rate</label
    >
    <input
      type="number"
      value="1200"
      style="
      flex: 1; height: 24px;
      background: #080818; border: 1px solid rgba(255,255,255,0.13);
      border-radius: 3px; color: #c0c0d8;
      font-family: Consolas; font-size: 12px;
      padding: 0 6px; outline: none;
    "
    />
    <span style="font-size:10px; color:#445566; width:30px;">mm/min</span>
  </div>
  <div style="display:flex; align-items:center; gap:8px;">
    <label
      style="width:80px; text-align:right; font-size:11px; color:#556688; flex-shrink:0;"
      >Spindle</label
    >
    <input
      type="number"
      value="12000"
      style="
      flex: 1; height: 24px;
      background: #080818; border: 1px solid rgba(255,255,255,0.13);
      border-radius: 3px; color: #c0c0d8;
      font-family: Consolas; font-size: 12px;
      padding: 0 6px; outline: none;
    "
    />
    <span style="font-size:10px; color:#445566; width:30px;">RPM</span>
  </div>
</div>

<h2>Pattern 5 — Three column layout: fixed | flex | fixed</h2>
<div
  style="
  height: 120px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  overflow: hidden;
"
>
  <div
    style="
    width: 48px; flex-shrink: 0;
    background: #111120;
    border-right: 1px solid rgba(255,255,255,0.07);
    display: flex; flex-direction: column;
    align-items: center; padding: 8px 4px; gap: 4px;
  "
  >
    <div class="item a" style="width:32px;height:32px;font-size:10px;">V</div>
    <div class="item b" style="width:32px;height:32px;font-size:10px;">L</div>
  </div>

  <div
    style="flex:1; min-width:0; background:#080810; display:flex; align-items:center; justify-content:center; color:#334455; font-size:12px;"
  >
    Canvas
  </div>

  <div
    style="
    width: 200px; flex-shrink: 0;
    background: #111120;
    border-left: 1px solid rgba(255,255,255,0.07);
    padding: 8px; font-size:11px; color:#445566;
  "
  >
    Properties
  </div>
</div>
```

---

## Part 13 — The mental model: how to think about any flex layout

When you look at a layout and want to write the CSS, ask these questions in
order:

**1. Which direction do the children go?**
Row (left to right) → `flex-direction: row`
Column (top to bottom) → `flex-direction: column`

**2. Which children have a fixed size and which fill the space?**
Fixed → `flex-shrink: 0` and a defined width/height
Fill → `flex: 1; min-height: 0` (or `min-width: 0` for rows)

**3. How should they align on the cross axis?**
Usually `align-items: center` for toolbars and rows.
Usually `align-items: stretch` (default) for panels and columns.

**4. Is there spacing between items?**
Use `gap`. Not margin on individual items.

**5. Is there anything being pushed to an edge?**
Use a spacer div with `flex: 1` or `margin-left: auto` on the pushed item.

That's the whole process. Apply those five questions to any layout and you
have the CSS. Flex is not complicated — there are just a lot of properties
with similar names that obscure the simple underlying model.

---

## Part 14 — Apply to camtool.html

Open `camtool.html` from Lab 1. Look at the rules for `.app`, `.app-body`,
`.workspace`, `.main-area`, `.toolbar`, and `.statusbar`.

For each one, answer the five mental model questions:

1. What direction?
2. Which children are fixed, which fill?
3. How do children align?
4. What is the spacing strategy?
5. Is anything being pushed to an edge?

Write your answers down before looking at the CSS. Then compare your answers
to the CSS that's already there. If your answers match the CSS, you understand
it. If they don't match, find the discrepancy and understand why the CSS does
what it does.

This exercise is more valuable than anything I can explain in writing.

Then do this: deliberately change one flex value in each rule, save, look at
what breaks, and understand why that value was necessary. Change `flex: 1` to
`flex: 0` on `.main-area`. Change `min-height: 0` to nothing on `.app-body`.
Change `flex-shrink: 0` to `flex-shrink: 1` on `.menubar`. Each one will
break something specific and each breakage will teach you one concrete thing.

---

## What you learned in this lab

- Flex distributes space along one axis — that's the whole model
- `flex-grow` claims leftover space. `flex-shrink` gives up space when needed.
  `flex-basis` is the starting size.
- `flex: 1` means grow, shrink, start from zero — equal distribution
- `flex-shrink: 0` means never shrink — use on fixed-height toolbars and headers
- `justify-content` controls spacing along the main axis
- `align-items` controls alignment on the cross axis
- `gap` is the right way to space items — not margin
- The spacer pattern (`flex: 1` empty div or `margin-left: auto`) pushes items
  to opposite ends
- Nested flex containers: each one only controls its direct children
- The five questions: direction, fixed vs fill, alignment, spacing, pushed items

## What comes in Lab 3

Lab 3 is CSS Grid — the layout system for two-dimensional arrangements. Where
flex handles one direction at a time, Grid handles rows and columns
simultaneously. It's the tool for the overall application shell, card layouts,
and anything that needs items to align both horizontally and vertically.
After Grid, you will have covered every layout situation you'll encounter
in the CAD/CAM UI.
