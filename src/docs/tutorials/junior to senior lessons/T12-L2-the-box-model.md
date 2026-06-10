# Junior to Senior — T12·L2 — The Box Model

**Prerequisites:** T12·L1 (How Browsers Render). You know the four rendering stages
(parse → style → layout → paint) and that CSS is separate from HTML. This lesson
explains the layout stage in detail — every element is a box, and understanding the
exact dimensions of that box is why spacing either works or fights you.

**What this lab adds:**
- What the box model is — the four layers every element has
- Why `width: 200px` can give you a 230px-wide element
- What `box-sizing: border-box` does and why every modern CSS codebase uses it
- Why `margin` is outside the box and `padding` is inside
- Why `!important` is a symptom of not understanding the box model

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You set `width: 200px` on a div. You also set `padding: 20px`. How wide is the
>    rendered div in the browser? (Think before answering — the answer surprises most people.)
> 2. You have two boxes next to each other. The left box has `margin-right: 20px`. The
>    right box has `margin-left: 20px`. How much space is between them?
> 3. You cannot figure out why your button is too wide. Name two CSS properties that
>    could be contributing to its width beyond `width` itself.
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You set `width: 200px` on a box. You measure it in the browser and it is 240px wide.
You add `!important`. It is still 240px. You copy the code into a CodePen and it works.
You spend 45 minutes finding out that somewhere you also have `padding: 20px` and
`border: 10px solid`. You had no mental model of how width is calculated.

This lesson gives you that mental model. Once you understand what a box is made of,
width stops being mysterious.

---

## Step 1 — See the Problem

Create `box-model.html` inside the `css-foundations` folder from T12·L1 (or create a new folder):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Box Model</title>
  <style>
    .broken-box {
      width: 200px;
      padding: 20px;
      border: 10px solid black;
      background: cornflowerblue;
    }
  </style>
</head>
<body>
  <div class="broken-box">I should be 200px wide.</div>
</body>
</html>
```

### CSS AND SEE

Open this file in your browser. The box is blue. It says it should be 200px wide.

**Measure it:** Right-click the blue box → Inspect. In DevTools, hover over the element in
the Elements panel. A tooltip appears showing its dimensions.

**You should see:** The box is **260px** wide — not 200px.

- `width: 200px` — the content area
- `padding: 20px` on each side — adds 40px total
- `border: 10px` on each side — adds 20px total
- **Total: 200 + 40 + 20 = 260px**

Your `width: 200px` only set the width of the CONTENT AREA. The padding and border were
added on top of it. This is the box model.

---

## Concept: The Box Model

**What it is:** Every HTML element is a rectangular box made of four nested layers.
From inside out:

1. **Content** — where text and child elements live. `width` and `height` set this by default.
2. **Padding** — transparent space INSIDE the border. Background color fills it. Clicking it activates the element.
3. **Border** — a visible (or invisible) line between padding and margin.
4. **Margin** — transparent space OUTSIDE the border. Background color does NOT fill it. It creates distance from neighboring elements.

```
┌─────────────────────────────────────┐
│             MARGIN                  │
│   ┌─────────────────────────────┐   │
│   │           BORDER            │   │
│   │   ┌─────────────────────┐   │   │
│   │   │       PADDING       │   │   │
│   │   │   ┌─────────────┐   │   │   │
│   │   │   │   CONTENT   │   │   │   │
│   │   │   │  (width ×   │   │   │   │
│   │   │   │   height)   │   │   │   │
│   │   │   └─────────────┘   │   │   │
│   │   └─────────────────────┘   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**The problem before this concept:** Without this model, you adjust `width` and cannot
predict what appears on screen. You add padding and the element grows in an unexpected
direction. You add margin and wonder why the background color does not fill the gap.

**The mechanism:** The browser calculates the total space an element occupies as:

```
total width  = margin-left + border-left + padding-left + content-width + padding-right + border-right + margin-right
total height = margin-top + border-top + padding-top + content-height + padding-bottom + border-bottom + margin-bottom
```

When you set `width: 200px`, you are ONLY setting `content-width`. Everything else adds to it.

**Canonical example:** A picture frame. The painting inside is the content. The white mat
is the padding (inside the frame, same background). The frame itself is the border.
The wall space around the frame is the margin (outside, not part of the frame).

**What it hides:** Manual dimension arithmetic. You no longer calculate "my content is
120px, padding is 15px each side, border is 5px each side, so I need to tell my parent
160px of space". The box model tracks these layers so the layout engine can compute it.

**You will see this again in:**
- Every CSS layout system (Flexbox, Grid) works on boxes. The box model is the foundation.
- `devtools` always shows the box model diagram — once you know the layers, you can debug any spacing issue.
- React Native uses the same box model. Qt and native UI frameworks use the same concept (often called insets, padding, margin under different names).
- The CSS `outline` property is intentionally outside the box model — it draws around the border without affecting layout.

**Watch for:** `padding` adds space INSIDE (background fills it, clicks register there).
`margin` adds space OUTSIDE (background does NOT fill it, clicks do NOT register there).
Swapping them is one of the most common CSS spacing mistakes.

---

## Step 2 — Inspect the Box Model in DevTools

The browser's DevTools has a dedicated box model diagram:

1. Right-click `.broken-box` → Inspect
2. In the Elements panel, click on the div
3. In the right panel, scroll down to find the **Computed** tab (in Chrome) or the box diagram at the bottom of the **Rules** panel (in Firefox)
4. You will see a nested diagram exactly like the one above, with the actual pixel values filled in

**You should see:**
- Content: 200 × [height]
- Padding: 20 (all four sides)
- Border: 10 (all four sides)
- Margin: 0

This is the authoritative source of truth for any spacing mystery. Before guessing, always
look here first.

**Change something:** Set `margin: 15px` on `.broken-box`. Inspect again.

**Expected:** The margin ring in the DevTools diagram shows 15. The box is still 260px wide —
margin is outside the box and does NOT affect width.

---

## Concept: `box-sizing` — Changing How Width Is Calculated

**What it is:** A CSS property that changes WHAT the `width` and `height` values refer to.

**Two values:**

| Value | What `width` means |
|---|---|
| `content-box` | Width of the content area only (default) |
| `border-box` | Width including padding + border |

**The problem:** With `content-box` (the default), you cannot look at `width: 200px` and
know the element is 200px wide. You must mentally add padding and border.

**The fix:** With `border-box`, `width: 200px` means the element, from the left border edge
to the right border edge, is EXACTLY 200px. Padding and border shrink inward into the content
area instead of expanding outward.

```
content-box (default):
  width: 200px  ← content only
  padding: 20px ← adds to outside → total = 240px

border-box:
  width: 200px  ← content + padding + border
  padding: 20px ← shrinks content → total = 200px
```

**Why this matters:** When you are building a layout and you say "this column is 200px
wide", you mean the column is 200px wide — not 200px plus however much padding you happen
to add later. `border-box` makes `width` mean what you intend it to mean.

**The alternative that was not chosen:** `content-box` (default) was the original design
decision from the 1990s. It was chosen because it precisely separates the concerns: content
size is separate from padding. In theory it is more mathematically pure. In practice,
every working web developer applies `border-box` globally because `content-box` makes
responsive layouts nearly impossible to reason about.

**You will see this again in:**
- Every CSS reset, CSS framework (Tailwind, Bootstrap), and design system uses `* { box-sizing: border-box }` as its first rule.
- React Native uses `border-box` behavior by default — they learned from the web.

**Watch for:** When working on an existing codebase that does NOT have `border-box` set
globally, your layouts will behave differently than expected. Check whether the reset is present before debugging.

---

## Step 3 — Fix It with `box-sizing`

Update `box-model.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Box Model</title>
  <style>
    /* Apply border-box to every element — the universal fix: */
    *, *::before, *::after {     /* ← add this */
      box-sizing: border-box;   /* ← add this */
    }                            /* ← add this */

    .broken-box {
      width: 200px;
      padding: 20px;
      border: 10px solid black;
      background: cornflowerblue;
    }
  </style>
</head>
<body>
  <div class="broken-box">I should be 200px wide.</div>
</body>
</html>
```

### CSS AND SEE

Save and refresh. Inspect the element again.

**You should see:** The box is now exactly **200px** wide. The content area has shrunk to
`200 - 40 (padding) - 20 (border) = 140px`, but the TOTAL width is 200px.

The name `.broken-box` is now a lie — rename it in your head. It works.

**Change something:** Add `border: 30px solid black` and keep `width: 200px`.

**Expected:** The box stays 200px wide. The content area shrinks to 200 - 40 - 60 = 100px.
Content cannot go below zero — if you add enough padding and border, the content area
collapses to zero (the border/padding still render, the content just disappears).

---

## Concept: Margin and Padding — When to Use Each

**What it is:** Two different kinds of space that serve different purposes.

**Padding is space inside the element:**
- The background color fills padding
- Mouse clicks register in the padding area (the element is "clickable" there)
- Use padding when you want the element itself to feel larger — a button with text that is too close to its edges needs more padding, not more margin

**Margin is space outside the element:**
- The background color does NOT fill margin (you see whatever is behind the element)
- Mouse clicks do NOT register in the margin area
- Use margin to push elements away from their neighbors

**The confusion:** Both create space. The difference is which side of the border they are on.

```html
<!-- Padding: space INSIDE the border -->
<button style="padding: 20px; background: blue;">Click me</button>
<!-- The blue background fills the 20px padding. The button feels bigger. -->

<!-- Margin: space OUTSIDE the border -->
<button style="margin: 20px; background: blue;">Click me</button>
<!-- There is 20px of gap around the button. The gap is NOT blue. -->
```

**Canonical example:** Personal space vs. personal size. Padding makes you larger
(your coat is still yours — background, clicks). Margin pushes others away (the empty
space between you and the next person belongs to neither).

---

## Step 4 — See the Difference

Add two buttons to `box-model.html`:

```html
<body>
  <div class="broken-box">I should be 200px wide.</div>

  <div style="background: #eee; margin-top: 40px;">  <!-- ← add this -->
    <button style="                                   <!-- ← add this -->
      padding: 20px;                                  <!-- ← add this -->
      background: cornflowerblue;                     <!-- ← add this -->
      border: none;                                   <!-- ← add this -->
    ">Padding button</button>                         <!-- ← add this -->

    <button style="                                   <!-- ← add this -->
      margin: 20px;                                   <!-- ← add this -->
      background: cornflowerblue;                     <!-- ← add this -->
      border: none;                                   <!-- ← add this -->
    ">Margin button</button>                          <!-- ← add this -->
  </div>                                              <!-- ← add this -->
</body>
```

### CSS AND SEE

Save and refresh.

**You should see:**
- **Padding button:** The blue background extends 20px around the text. The button is large.
- **Margin button:** The blue background is tight around the text (no extra space inside).
  There is a gap between the button and the gray background container — but that gap is gray, not blue.

**Hover each button:** Notice that with the padding button, a larger area is clickable
(the whole blue region responds to the cursor). With the margin button, only the tight
blue area responds — the 20px gap around it is not part of the button.

**Change something:** Swap `padding: 20px` and `margin: 20px` between the two buttons.

**Expected:** Now the margin button has the large blue area (padding makes the background larger),
and the padding button has the tight text with a gap around it that does not highlight on hover.

---

## Concept: Margin Collapsing

**What it is:** When two vertical margins meet, they do NOT add together. The larger one wins.

```
Box A: margin-bottom: 30px
Box B: margin-top:    20px

Gap between them: 30px (NOT 50px)
```

The browser takes the MAXIMUM of the two touching margins, not the sum.

**Why this exists:** In printed typography, headings and paragraphs have their own spacing.
If a heading's bottom margin and a paragraph's top margin stacked, every heading/paragraph
pair would have double the intended spacing. Collapsing makes documents composed of
independently-styled components produce consistent vertical rhythm.

**When it happens:**
1. Adjacent siblings (A's bottom margin meets B's top margin)
2. Parent and first/last child (if no border, padding, or BFC between them — covered in T12·L10 Positioning)

**When it does NOT happen:**
- Horizontal margins (left/right never collapse)
- Elements in a flex container or grid container (covered in T12·L8 and T12·L9)
- Elements with `overflow` set to anything other than `visible`

**Watch for:** Adding `margin-top: 20px` to a paragraph when its container already has
`margin-top: 40px` — you will see no change because the container's 40px is larger and
wins the collapse. You add more and more margin, nothing changes. This is one of the most
confusing CSS behaviors for beginners.

---

## Step 5 — See Margin Collapse

Add to `box-model.html`:

```html
<div style="background: #eee; margin-top: 60px;">  <!-- ← add below the buttons -->
  <p style="margin: 30px; background: pink;">Top paragraph (margin: 30px)</p>
  <p style="margin: 20px; background: lightgreen;">Bottom paragraph (margin: 20px)</p>
</div>
```

### CSS AND SEE

**You should see:** There is space between the two paragraphs, but it is 30px (the larger
margin), not 50px (the sum of both).

**Measure it:** Open DevTools, hover over the gap between the two paragraphs. The tooltip
shows the gap is 30px.

**Change something:** Set both paragraphs to `margin: 40px`.

**Expected:** The gap between them is 40px, not 80px. Margins of equal size collapse into one.

**Change something else:** Add `padding: 1px` to the gray container div.

**Expected:** Now the paragraphs' top/bottom margins no longer collapse with the container's
edges — padding breaks the collapse between parent and child. You will see this come up again
in T12·L10 when we discuss Block Formatting Contexts.

---

## 🎯 Challenge: Build a Card with Correct Spacing

**You know:** The box model, `box-sizing: border-box`, padding vs. margin.

**The spec:**
- A card that is exactly 320px wide
- 16px of padding inside on all sides
- A 1px solid `#ddd` border
- 12px of gap between cards when placed next to each other (use margin)
- A title and a body text inside
- The card background is white; the page background is `#f5f5f5`

**Task:** Build it. Without looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Card Challenge</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      background: #f5f5f5;
      padding: 24px;
      font-family: sans-serif;
    }

    .card {
      width: 320px;
      padding: 16px;
      border: 1px solid #ddd;
      background: white;
      margin-bottom: 12px;
    }

    .card-title {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .card-body {
      margin: 0;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2 class="card-title">Card One</h2>
    <p class="card-body">This card is exactly 320px wide because border-box
    includes the 1px border and 16px padding in that 320px.</p>
  </div>

  <div class="card">
    <h2 class="card-title">Card Two</h2>
    <p class="card-body">The 12px gap between cards comes from margin-bottom
    on the card, which is outside the box and does not affect the card's width.</p>
  </div>
</body>
</html>
```

**Key insight:** Without `box-sizing: border-box`, each card would be `320 + 2 (border) = 322px`
wide, not 320px. With it, the content area shrinks to `320 - 32 (padding) - 2 (border) = 286px`
and the total is exactly 320px. The `margin-bottom: 12px` is outside the box — it creates the
gap between cards without affecting the card's own width.

</details>

---

## Concept: Why `!important` Is a Symptom

**What it is:** A CSS declaration that overrides the normal cascade and specificity rules
(you will learn those fully in T12·L3). The syntax: `color: red !important;`.

**Why people reach for it:** A rule is not applying. Adding `!important` forces it. The
problem is "fixed." But the root cause is usually one of:

1. A specificity conflict (a more specific rule wins — covered in T12·L3)
2. A box model misunderstanding (the property works, but the value is wrong because another layer is being missed)
3. A cascade problem (the wrong rule is winning because it appears later — covered in T12·L3)

When you truly understand the box model and the cascade, you almost never need `!important`.
The times it is legitimate: overriding third-party CSS that you cannot modify, and utility
classes that must always win (like `.hidden { display: none !important }`).

**The cost:** Every `!important` declaration makes the next one harder to override, escalating
the arms race until the CSS file is unmaintainable. It is a symptom of not knowing which rule
is winning and why.

**You will see this again in:**
- T12·L3 covers the cascade and specificity — once you understand those, you will know exactly
  which rule wins in any conflict without needing `!important`.
- Inspecting any large production CSS file: you will find `!important` clustered around
  theme overrides and third-party integrations.

---

## Final Check

| Concept | How to verify |
|---|---|
| Default box model adds padding/border to width | `width: 200px` + `padding: 20px` + `border: 10px` → inspect → 260px |
| `border-box` makes width include padding/border | Add `* { box-sizing: border-box }` → same styles → inspect → 200px |
| Padding is inside (background fills it) | Padding button: blue area is large and clickable throughout |
| Margin is outside (background does not fill it) | Margin button: gap around it is NOT blue, not clickable |
| Margin collapse | Two adjacent elements: 30px + 20px margins → gap is 30px, not 50px |
| Card challenge | Card renders exactly 320px wide with visible 1px border and 16px interior spacing |

---

## Quick Check Answers

**1. `width: 200px` + `padding: 20px`. How wide is the rendered div?**

With the default `box-sizing: content-box`: 240px. The `width` only sets the content area.
Padding adds 20px on each side (left + right = 40px) outside the content. Total = 240px.
With `box-sizing: border-box`: 200px. Padding shrinks inward into the content area.

**2. Left box has `margin-right: 20px`, right box has `margin-left: 20px`. How much space between them?**

40px. Horizontal margins do NOT collapse — only vertical (top/bottom) margins collapse.
Left and right margins always add together.

**3. Two CSS properties contributing to a button's width besides `width` itself?**

`padding-left` and `padding-right` (adds to content width in the default `content-box` model),
`border-left-width` and `border-right-width` (also adds). Other valid answers: inherited width
from a parent, `min-width`, content that is wider than the specified width.
