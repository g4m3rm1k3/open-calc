# Creative Web Masterclass — LAB 02 — Box Model: Every Element Is a Rectangle

**Prerequisites:** LAB-01. You have Live Server running and know how to edit HTML and
see changes instantly. You know that the browser applies default styles.

**What this lab adds:**
- A colored box built step by step from content → padding → border → margin
- The box model mental model: every element is four nested rectangles
- DevTools box model diagram showing exact pixel measurements
- `box-sizing: border-box` and why you will use it on every project from now on

**Time:** 45–60 minutes

---

## What You Will Build

```
  ┌──── margin (transparent gap outside) ────────────────────────┐
  │                                                               │
  │   ┌──── border (visible line) ───────────────────────────┐   │
  │   │                                                       │   │
  │   │   ┌──── padding (space inside, same color as bg) ─┐  │   │
  │   │   │                                                │  │   │
  │   │   │   Content text lives here                      │  │   │
  │   │   │                                                │  │   │
  │   │   └────────────────────────────────────────────────┘  │   │
  │   │                                                       │   │
  │   └───────────────────────────────────────────────────────┘   │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘
```

A styled card with a background, interior space, a visible border, and outer separation
from other elements. Each layer added one step at a time. DevTools shows exact pixels.

---

> **Quick Check — answer before reading further:**
>
> 1. You set `width: 300px` on a box. Then you add `padding: 20px` and `border: 5px solid`.
>    Without looking it up — what is the total rendered width? Does padding go inside the
>    300px or does it push the box wider?
> 2. What is the visual difference between padding and margin?
> 3. If you want a gap between two side-by-side boxes, do you put it on padding or margin?
>
> *(Answers at the end)*

---

## Concept: The Box Model

**What it is:** The box model is the browser's layout rule that every HTML element
occupies a rectangular space made of four nested layers: content, padding, border, margin.

**The problem before:**

Without the box model mental model, layout becomes guesswork. You add `padding: 20px`
and the element grows in a way you did not predict. You add a `border` and suddenly the
element is 10px wider than you intended and the layout breaks. You set `width: 300px` but
the element renders at 310px. Without understanding the four layers, every layout problem
looks like a mystery.

**The solution:** Once you know the four layers and their order (content inside → padding →
border → margin), every size calculation becomes arithmetic you can do in your head — and
DevTools shows you the exact numbers.

**What it hides:** The box model hides the browser's internal geometry calculations.
When you set `padding: 20px`, the browser adds 20px to all four sides of the content
area and expands the rendered element accordingly. You never calculate where the border
rectangle starts — you just declare the layers and the browser computes the geometry.
The invariant it protects: elements cannot overlap their own layers. Padding is always
inside the border; margin is always outside it. That order never changes.

**Canonical example (General Explanation):**
- **Real-world analogy:** A framed picture. The picture is the content. The mat board
  around the picture is the padding — inside the frame, same color as the background.
  The frame itself is the border. The gap on the wall around the frame before the next
  picture is the margin.
- **Minimal code form:**
  ```css
  .box {
    padding: 20px;   /* space between content and border */
    border: 2px solid black;
    margin: 40px;    /* space between this box and others */
  }
  ```
- **Why obvious:** The analogy maps directly. Padding = mat board (inside). Border = frame.
  Margin = wall gap (outside). Each layer stacks outward from the content.

**Project Application (The "Why" here):**
Every component in the portfolio — cards, buttons, navigation items, hero text — relies on
the box model for its spacing. Knowing which layer to adjust (padding for interior breathing
room, border for visual edge, margin for separation from siblings) is the single most
important CSS skill for controlling layout.

**Smallest possible example:**

```css
.card {
  padding: 24px;
  border: 1px solid #ccc;
  margin: 16px;
  background: white;
}
```

**Why it matters here:** Before adding any real design, you need to control how much space
your elements take up. Without the box model, you cannot predictably size anything.

**Watch for:** The default `box-sizing` is `content-box`, which means `width: 300px` sets
only the *content* width — the total rendered width is 300 + padding + border. This trips
up every beginner. You will fix this in Step 5 with `box-sizing: border-box`.

---

## Concept: `box-sizing: border-box`

**What it is:** A CSS property that changes how `width` and `height` are calculated so
they include padding and border rather than being added on top of them.

**The problem before:**

```css
/* content-box (the default) */
.card {
  width: 300px;
  padding: 20px;
  border: 5px solid;
}
/* Actual rendered width: 300 + 20 + 20 + 5 + 5 = 350px — not 300 */
```

You wrote `width: 300px` but the element is 350px wide. Every time you add padding or a
border you have to recalculate the width. In a grid layout this breaks alignment.

**The solution:**

```css
* {
  box-sizing: border-box; /* padding and border are included IN the width */
}
.card {
  width: 300px;
  padding: 20px;
  border: 5px solid;
}
/* Actual rendered width: exactly 300px — padding and border live inside it */
```

**Canonical example (General Explanation):**
- **Real-world analogy:** A 12-inch pizza box. `content-box`: the pizza is 12 inches and
  the cardboard adds more. `border-box`: the whole package — pizza plus cardboard — is
  12 inches. You ordered a 12-inch box; you get a 12-inch box.
- **Minimal form:** `* { box-sizing: border-box }` at the top of every CSS file.
- **Why obvious:** The box's stated size matches its physical footprint.

**Project Application:**
You will put `* { box-sizing: border-box }` at the top of every CSS file in this course.
Without it, any element with both a declared width and any padding will render wider than
declared — which breaks grid layouts, flex sizing, and anything with percentage widths.

**Smallest possible example:**

```css
*, *::before, *::after {
  box-sizing: border-box;  /* includes padding and border in width/height */
}
```

**Why it matters here:** Starting from this lab, every CSS file begins with this reset.
It prevents the most common box model surprise before you encounter it.

**Watch for:** The universal selector `*` applies to every element. `*::before` and
`*::after` cover pseudo-elements (introduced in a later lab). Include both to be complete.

---

## Step 1 — Create the HTML

Create `projects/lab-02/` with `index.html` and `styles.css`.

In `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 02 — Box Model</title>
    <link rel="stylesheet" href="styles.css">   <!-- ← links the CSS file -->
  </head>
  <body>
    <div class="card">
      Box Model Demo
    </div>
  </body>
</html>
```

The `<link rel="stylesheet" href="styles.css">` line is how HTML connects to a CSS file.
`rel="stylesheet"` tells the browser what kind of file it is. `href="styles.css"` is the
path to the file, relative to the HTML file. Since both files are in `lab-02/`, the name
alone is enough.

Leave `styles.css` empty for now.

---

> **CSS AND SEE**
>
> Open `index.html` with Live Server.
>
> **You should see:** The text "Box Model Demo" in the top-left corner of the page,
> in the browser's default small font. No color, no border, nothing styled — just the
> text sitting in the document flow.
>
> This is the baseline. Every CSS change from here is additive from this raw starting point.
>
> **Compare:** It looks identical to raw HTML without any CSS. That is correct — you have a
> CSS file linked, but it is empty. Linking an empty CSS file changes nothing.

---

## Step 2 — Add Background and See the Content Area

In `styles.css`, add:

```css
*, *::before, *::after {
  box-sizing: border-box; /* padding and border count inside the stated width */
}

.card {
  background: #4a90d9;   /* blue so the box is visible against the white page */
}
```

---

> **CSS AND SEE**
>
> Save. The text now has a blue background.
>
> **You should see:** The blue background stretches the full width of the page. The
> text sits flush against the top-left corner of the blue area.
>
> **Why full width?** `div` is a block element. By default, block elements expand
> to fill their parent's width. The parent is `<body>`, and `<body>` fills the window.
>
> **Change something:** Change `background: #4a90d9` to `background: coral`. Save.
> The color changes. Change it back to `#4a90d9`.

---

## Step 3 — Add a Width to Contain the Box

Add to `.card`:

```css
.card {
  background: #4a90d9;
  width: 300px;           /* ← add this: fixed width so the card is not edge-to-edge */
}
```

---

> **CSS AND SEE**
>
> **You should see:** The blue background is now 300px wide. The text is inside it.
>
> **In DevTools:** Right-click the blue box → Inspect. In the Elements panel, click the
> Computed tab. Find `width` — it reads `300px`.
>
> Also look at the Elements panel's bottom section — the box model diagram. It shows a
> nested rectangle diagram. Right now all four layers (margin, border, padding, content)
> are visible but the outer three show 0.

---

## Step 4 — Add Padding

```css
.card {
  background: #4a90d9;
  width: 300px;
  padding: 24px;          /* ← add this: space between text and border */
}
```

Padding creates breathing room between the content (the text) and the edge of the box.
The background color fills the padding area — padding and content share the same background.

---

> **CSS AND SEE**
>
> **You should see:** The text is no longer pressed against the top-left. There is now
> visible space between the text and all four edges of the blue box.
>
> **In DevTools box model diagram:** The padding layer now shows `24` on all four sides.
> The content area is now 300 - 24 - 24 = 252px wide (because of `border-box` sizing,
> the padding comes out of the 300px, not added to it).
>
> **Change something:** Change `padding: 24px` to `padding: 48px`. Save. The card expands
> inward — more space around the text. Change back to `24px`.

---

## Step 5 — Add a Border

```css
.card {
  background: #4a90d9;
  width: 300px;
  padding: 24px;
  border: 3px solid #1a5fa8;   /* ← add: 3px thick solid line, darker blue */
}
```

`border` takes three values in order: thickness, style, color.
- `3px` — the line is 3px thick
- `solid` — a single continuous line (alternatives: `dashed`, `dotted`, `double`)
- `#1a5fa8` — a darker shade of the background color

---

> **CSS AND SEE**
>
> **You should see:** A dark blue outline appears around the entire card.
>
> **In DevTools box model:** The border layer now shows `3` on all four sides.
> The total rendered width is still exactly 300px — the border and padding both
> came out of the 300px because `box-sizing: border-box` is active.
>
> **Verify this:** In Computed tab, find `width` — still `300px`.
>
> **Change something:** Temporarily remove `box-sizing: border-box` from the `*` rule
> (comment it out with `/* */`). Save. Now check Computed width — it will show `306px`
> (300 + 3 + 3 for the border). The border pushed the box wider. Uncomment the rule.
> This is exactly why `border-box` matters.

---

## Step 6 — Add Margin

```css
.card {
  background: #4a90d9;
  width: 300px;
  padding: 24px;
  border: 3px solid #1a5fa8;
  margin: 40px;             /* ← add: space between this card and the page edge */
}
```

Margin is transparent. It pushes the card away from neighboring elements and the page edges,
but it does not take on the background color — you see through it to the body behind.

---

> **CSS AND SEE**
>
> **You should see:** The card is no longer flush with the top-left corner. There is now
> a 40px gap between the card and each edge of the viewport.
>
> **In DevTools box model:** All four layers are now visible with values:
> - Margin: 40 on all sides
> - Border: 3 on all sides
> - Padding: 24 on all sides
> - Content: the remaining space
>
> **Change something:** Change `margin: 40px` to `margin: 40px auto`. Save.
> The card centers horizontally. `auto` on the left and right margin divides the
> remaining space evenly — this is the classic CSS centering technique for block elements.
> Keep this change.

---

## Step 7 — Add a Second Card to See Margin Collapse

Add a second card below the first in `index.html`:

```html
<body>
  <div class="card">Box Model Demo — Card One</div>
  <div class="card">Box Model Demo — Card Two</div>   <!-- ← add this -->
</body>
```

---

> **CSS AND SEE**
>
> **You should see:** Two cards stacked vertically. The gap between them is `40px` —
> not `80px`, even though each card has `margin: 40px` on all sides.
>
> **Why?** Vertical margins between adjacent block elements **collapse** — the browser
> uses the larger of the two margins, not the sum. Both cards have `margin-bottom: 40px`
> and `margin-top: 40px`. The 40px collapse to a single 40px gap.
>
> This is called **margin collapse** — a CSS rule that often surprises beginners.
> It only applies to vertical (block-axis) margins between siblings.
>
> **Change something:** Add `margin-bottom: 80px` to `.card`. Save. The gap between
> cards becomes `80px` (the larger of the two margins). Remove `margin-bottom: 80px`.

---

## 🎯 Challenge: Four-Side Control

**You know:** `margin: 40px` sets all four sides equally. CSS also allows different
values per side.

**Task:** Modify `.card` so it has: 16px padding on top and bottom, 32px padding on
left and right, a margin of 60px on top, 20px on the right, 60px on bottom, 20px on
the left. Use the shorthand properties (not separate `padding-top`, `padding-left`, etc.).

**Starting code:**
```css
.card {
  background: #4a90d9;
  width: 300px;
  padding: 24px;
  border: 3px solid #1a5fa8;
  margin: 40px auto;
}
```

**Hint:** Both `margin` and `padding` follow the same shorthand rule:
- `property: top right bottom left` (4 values = each side)
- `property: vertical horizontal` (2 values = top/bottom, then left/right)

---

<details>
<summary>▶ Show Solution</summary>

```css
.card {
  background: #4a90d9;
  width: 300px;
  padding: 16px 32px;           /* top/bottom: 16px, left/right: 32px */
  border: 3px solid #1a5fa8;
  margin: 60px 20px;            /* top/bottom: 60px, left/right: 20px */
}
```

Or using 4-value shorthand:
```css
padding: 16px 32px 16px 32px;  /* top right bottom left */
margin: 60px 20px 60px 20px;
```

**Key insight:** The 4-value shorthand goes clockwise from the top — top, right, bottom,
left. A useful mnemonic: **TR**ou**BL**e (Top, Right, Bottom, Left). Once you know this
order, you can set any combination of sides with a single property.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Card has blue background | Blue box visible on white page |
| 24px padding visible | Space between text and border in DevTools diagram shows 24 |
| 3px border visible | Dark blue outline around card |
| Margin centers card horizontally | Card is centered, not flush left |
| `border-box` sizing active | DevTools computed width = declared width (300px) |
| Margin collapse on two cards | Gap between cards is 40px not 80px |

---

## What's Next

LAB 03 introduces Flexbox — the CSS layout system for arranging multiple elements in a row
or column. You will use the box model knowledge from this lab to control individual element
sizes while Flexbox handles their positions relative to each other.

---

## Transfer Exercise

The box model concept — four nested layers controlling size and spacing — appears outside CSS.
Describe the "box model" of a printed business card: what would correspond to content, padding,
border, and margin? What breaks if the margin (bleed area) is zero?

---

## Quick Check Answers

**1. Width with padding and border added — what is the total?**
With the default `box-sizing: content-box`: 300 (content) + 20 + 20 (padding) + 5 + 5
(border) = 350px total rendered width. With `box-sizing: border-box`: exactly 300px —
padding and border live inside the stated width. The difference is why every CSS project
should start with `* { box-sizing: border-box }`.

**2. Visual difference between padding and margin?**
Padding is the space *inside* the border. It shares the element's background color —
you see the background filling the padding area. Margin is the space *outside* the border.
It is always transparent — you see the parent element's background through the margin.
If you want the colored area to be bigger, use padding. If you want a gap before the next
element, use margin.

**3. Gap between two side-by-side boxes — padding or margin?**
Margin. Padding increases the colored area inside the element. Margin creates transparent
space between elements. For a gap between siblings, use `margin-right` on the first
element, or `gap` in a Flexbox or Grid container (which you will learn in the next lab).
