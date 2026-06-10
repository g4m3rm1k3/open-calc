# Creative Web Masterclass — LAB 03 — Flexbox: Aligning Things Along One Axis

**Prerequisites:** LAB-02. You know the box model and how padding, border, and margin work.
You know `box-sizing: border-box`. You can link a CSS file to an HTML file.

**What this lab adds:**
- `display: flex` turns a parent into a flex container that controls how its children arrange
- The main axis and cross axis — why `justify-content` and `align-items` are different
- `gap` as the clean alternative to margin between siblings
- `min-height: 100vh` to fill the viewport
- A practical nav bar and a centered card trio using only flexbox

**Time:** 50–65 minutes

---

## What You Will Build

Part 1 — a horizontal navigation bar:
```
┌─────────────────────────────────────────────────┐
│  Logo          Work    About    Contact          │
└─────────────────────────────────────────────────┘
```

Part 2 — three cards centered in the full viewport:
```
                 (viewport full height)
         ┌──────┐   ┌──────┐   ┌──────┐
         │Card 1│   │Card 2│   │Card 3│
         └──────┘   └──────┘   └──────┘
                 (centered vertically too)
```

Both layouts require one CSS property on the parent: `display: flex`.

---

> **Quick Check — answer before reading further:**
>
> 1. Without flexbox, `<div>` elements stack vertically. What CSS property on a parent
>    element do you think controls how its children are arranged?
> 2. You want three boxes side-by-side AND centered on screen. Do you think you need to
>    position each box individually, or tell the parent how to arrange them?
> 3. If you wanted the items to be 20px apart, would you use margin or something else?
>
> *(Answers at the end)*

---

## Concept: Flexbox and `display: flex`

**What it is:** Flexbox is a CSS layout mode where a parent element distributes and aligns
its direct children along one axis (row or column) using a set of properties.

**The problem before:**

Before flexbox, centering something on screen required something like this:

```css
/* Old way to center something — required knowing the element's exact height */
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

Getting elements side by side required `float: left`, which had to be "cleared" afterward
and caused many layout bugs. Even simple navigation bars required hacks.

**The solution:**

```css
.parent {
  display: flex;           /* turn on flexbox for this container */
  justify-content: center; /* center children along the main axis (row = horizontal) */
  align-items: center;     /* center children along the cross axis (row = vertical) */
}
```

Three properties. Children are centered in both directions.

**What it hides:** Flexbox hides the geometry of distributing free space. When you write
`justify-content: center`, the browser calculates the total width of all children,
subtracts it from the container width, then splits the remaining space evenly before the
first child and after the last. You never calculate that yourself. The invariant it
protects: children cannot overlap each other or escape their parent unless you explicitly
allow it with `overflow: visible` — Flexbox maintains the arrangement you declared.

**Canonical example (General Explanation):**
- **Real-world analogy:** A hotel valet arranging cars in a parking row. `justify-content`
  decides where the cars go along the row (start, center, end, spread evenly).
  `align-items` decides how they line up across the row (front bumper aligned, rear bumper
  aligned, or centered vertically in the space).
- **Minimal code form:** `display: flex` on the parent — that alone puts children in a row.
- **Why obvious:** One property on the parent controls all children. No touching children.

**Project Application:**
The portfolio navigation bar, the card grid, the hero text centering, and the ribbon nav
all use flexbox. It is the primary layout tool for this course. Master it here; use it
everywhere.

**Smallest possible example:**

```css
.row {
  display: flex;        /* children now arrange in a horizontal row */
  gap: 16px;            /* 16px space between each child */
}
```

**Why it matters here:** Both builds in this lab — nav bar and card layout — are solved
with `display: flex` on the parent.

**Watch for:** Flexbox properties on the *parent* control child positions.
Flexbox properties on the *children* (`flex: 1`, `align-self`) control individual behavior.
Do not mix them up. Start with parent properties first.

---

## Concept: Main Axis and Cross Axis

**What it is:** In a flex container, the **main axis** is the direction children are
arranged (default: horizontal row). The **cross axis** is perpendicular to it (default:
vertical). These two axes explain why there are separate properties for horizontal vs
vertical alignment.

**The problem before:** Without understanding axes, `justify-content` and `align-items`
seem arbitrary. Why do two different properties both mean "center"?

**The solution:** They target different axes. In a row layout:
- `justify-content` controls along the **main axis** (left ↔ right)
- `align-items` controls along the **cross axis** (up ↕ down)

When `flex-direction: column` is set, the axes flip:
- `justify-content` controls up ↕ down
- `align-items` controls left ↔ right

**Canonical example (General Explanation):**
- **Real-world analogy:** A bookshelf (main axis = left to right along the shelf).
  `justify-content` spaces the books along the shelf. `align-items` controls how books
  sit vertically on the shelf (bottom-aligned, top-aligned, or centered).
- **Minimal form:** `flex-direction: row` = horizontal main axis (default).
- **Why obvious:** Once you know which axis is "main," the two properties are obviously
  controlling different directions.

**Project Application:**
The nav bar uses `flex-direction: row` (default) with `justify-content: space-between`
to push logo left and links right. The card group uses `justify-content: center` and
`align-items: center` to center the three cards both horizontally and vertically.

**Smallest possible example:**
```css
.row-container {
  display: flex;
  flex-direction: row;   /* default: children in a horizontal row */
  justify-content: center; /* center along horizontal axis */
  align-items: center;     /* center along vertical axis */
}
```

**Why it matters here:** You will use both properties differently for the nav and the cards.

**Watch for:** `align-items` only works if the container has a height. If the container
shrinks to fit its content, `align-items: center` has no space to work with. You need to
give the container a height (like `min-height: 100vh`) to see vertical centering.

---

## Concept: `gap`

**What it is:** The `gap` property on a flex or grid container sets the space between
children without adding margins to the children themselves.

**The problem before:**

```css
/* Old way: margin on children */
.nav-link {
  margin-right: 24px;
}
/* Problem: the LAST child also gets margin-right — you need to remove it with :last-child */
.nav-link:last-child {
  margin-right: 0;
}
```

Every time you add a margin to create spacing between siblings, you have to handle the
edge case of the last child not having a trailing margin.

**The solution:** `gap` creates space *between* items only — never before the first or
after the last. No edge-case handling.

**Canonical example:**
```css
.nav {
  display: flex;
  gap: 24px;  /* 24px between each nav item — nothing before the first, nothing after last */
}
```

**Project Application:** Every flex row in this course uses `gap` for spacing between
children. The nav bar links, the card row, and the section grid all use `gap` instead
of margin for inter-item spacing.

**Smallest possible example:**
```css
.row { display: flex; gap: 20px; }
```

**Why it matters here:** The nav bar links need even spacing. `gap` is the right tool.

**Watch for:** `gap` only applies to the space *between* items. It does not add space
around the outside of the container. Use `padding` on the container for outer spacing.

---

## Step 1 — Create the Files

Create `projects/lab-03/index.html` and `projects/lab-03/styles.css`.

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 03 — Flexbox</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Part 1: Navigation bar -->
    <nav class="nav-bar">
      <span class="nav-logo">Portfolio</span>
      <div class="nav-links">
        <a href="#">Work</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </nav>

    <!-- Part 2: Three centered cards -->
    <div class="card-row">
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    </div>

  </body>
</html>
```

`styles.css` starts with only the reset:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** "Portfolio", then "Work About Contact" links on the next line,
> then "Card 1 Card 2 Card 3" stacked vertically. Everything is default browser styling —
> unstyled, stacked, no color. This is the HTML skeleton before any layout.

---

## Step 2 — Style the Nav Bar Background

Add to `styles.css`:

```css
body {
  margin: 0;           /* remove default 8px body margin so nav bar touches edges */
  font-family: system-ui, sans-serif;  /* use the OS default font — cleaner than Times New Roman */
}

.nav-bar {
  background: #111;    /* near-black background for the nav strip */
  padding: 0 24px;     /* 0 vertical, 24px horizontal — we control height with line height */
  color: white;        /* text and links default to white */
}
```

---

> **CSS AND SEE**
>
> **You should see:** A black horizontal band at the top containing the nav content.
> The logo and links are still stacked vertically inside it, but the background is visible.
>
> **Compare:** Before this step, there was no visible nav bar at all. The background makes
> the container visible and establishes the color context.

---

## Step 3 — Put Logo and Links on the Same Row with `justify-content`

Add `display: flex` and `justify-content` to `.nav-bar`:

```css
.nav-bar {
  background: #111;
  padding: 0 24px;
  color: white;
  display: flex;                   /* ← add: turn on flexbox */
  justify-content: space-between;  /* ← add: push logo left, links right */
  align-items: center;             /* ← add: center both vertically */
  height: 60px;                    /* ← add: give the bar a fixed height */
}
```

`space-between` distributes children so the first child goes to the start, the last to
the end, and any additional children are evenly spaced between them. With two children
(`.nav-logo` and `.nav-links`), logo goes left and links go right automatically.

---

> **CSS AND SEE**
>
> **You should see:** "Portfolio" on the left side of the black bar, "Work About Contact"
> on the right side — all on the same horizontal line, vertically centered.
>
> No positioning, no floats, no absolute values. Three CSS properties on the parent.
>
> **Change something:** Change `justify-content: space-between` to `justify-content: center`.
> Save. Logo and links cluster in the center. Change back to `space-between`.

---

## Step 4 — Space the Nav Links

The three links inside `.nav-links` are still bunched together. Add flexbox to `.nav-links`:

```css
.nav-links {
  display: flex;   /* the links container is also a flex row */
  gap: 24px;       /* 24px between each link */
}

.nav-links a {
  color: white;             /* override the default blue link color */
  text-decoration: none;    /* remove underline */
}
```

---

> **CSS AND SEE**
>
> **You should see:** "Work", "About", "Contact" evenly spaced with 24px gaps between them,
> white text, no underlines.
>
> **Change something:** Change `gap: 24px` to `gap: 4px`. Save. The links crowd together.
> Change it to `gap: 48px`. They spread far apart. Change back to `24px`.

---

## Step 5 — Build the Card Row

Now for Part 2. Add styles for the card row and cards:

```css
.card-row {
  display: flex;             /* children (the three cards) arrange in a row */
  justify-content: center;   /* center the row of cards horizontally */
  align-items: center;       /* center vertically */
  gap: 24px;                 /* 24px between each card */
  min-height: calc(100vh - 60px);  /* fill the rest of the viewport below the nav */
  background: #f5f5f5;       /* light grey so the card-row area is visible */
}
```

`min-height: calc(100vh - 60px)` fills the rest of the viewport. `100vh` is 100% of the
viewport height. `calc()` lets you do arithmetic with CSS values — here, subtracting the
nav bar's 60px height so the card area fills exactly the remaining space.

---

> **CSS AND SEE**
>
> **You should see:** The grey card row area fills the browser window below the nav bar.
> "Card 1 Card 2 Card 3" text is centered — but the cards are invisible because they have
> no background yet. The text is floating in the grey area, horizontally centered.
>
> **Why centered even without card backgrounds?** The text is centered because the flex
> container centers its children. The "children" here are the `.card` divs, even without
> any card styling.

---

## Step 6 — Style the Cards

```css
.card {
  background: white;        /* white card on grey background */
  border-radius: 8px;       /* rounded corners — radius is 8px */
  padding: 32px 24px;       /* top/bottom 32px, left/right 24px */
  width: 200px;             /* fixed width */
  text-align: center;       /* center the text inside each card */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);  /* subtle shadow for depth */
}
```

`box-shadow` takes: horizontal-offset vertical-offset blur-radius color.
- `0` horizontal — shadow directly below, not to either side
- `2px` vertical — 2px down
- `8px` blur — soft edges
- `rgba(0, 0, 0, 0.12)` — black at 12% opacity (very subtle)

`border-radius: 8px` rounds all four corners by 8px. Use `50%` for a perfect circle.

---

> **CSS AND SEE**
>
> **You should see:** Three white rounded cards with subtle shadows, centered both
> horizontally and vertically in the grey area below the nav bar.
>
> This is a complete, professional-looking layout achieved with about 30 lines of CSS.
>
> **Change something:** Change `justify-content: center` on `.card-row` to
> `justify-content: space-evenly`. Save. The cards spread to fill the row with equal
> space around them. Change back to `center`.

---

## 🎯 Challenge: Make It Responsive

**You know:** Flex items can wrap to new lines with `flex-wrap: wrap`.

**Task:** Make the three cards wrap to a single column when the window is narrow (below
600px). Do not use media queries — use only `flex-wrap` and a min-width on the cards.
Drag the browser window narrower than 600px to test.

**Hint:** When flex items have a `min-width` and the container is too narrow to fit them
all on one line, `flex-wrap: wrap` automatically moves items to the next line.

---

<details>
<summary>▶ Show Solution</summary>

```css
.card-row {
  display: flex;
  justify-content: center;
  align-items: center;       /* note: align-items centers along the cross axis;
                                with wrap and multiple rows, consider align-content instead */
  gap: 24px;
  flex-wrap: wrap;           /* ← allow cards to wrap when container is too narrow */
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
  padding: 40px;             /* ← add padding so cards don't touch the edges when wrapped */
}

.card {
  background: white;
  border-radius: 8px;
  padding: 32px 24px;
  width: 200px;
  min-width: 160px;          /* ← cards won't shrink below 160px before wrapping */
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

**Key insight:** `flex-wrap: wrap` tells the flex container "if children don't fit, start
a new row." Combined with a `min-width` or fixed `width` on children, the browser
automatically wraps without you specifying breakpoints. This is how many modern responsive
layouts work — intrinsic sizing driven by content needs, not arbitrary breakpoints.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Nav bar has logo left, links right | "Portfolio" and "Work About Contact" on one line, opposite sides |
| Nav links are spaced 24px apart | Visible gap between Work, About, Contact |
| Card row fills viewport below nav | Grey area extends to bottom of browser window |
| Three cards are centered both ways | Cards are horizontally and vertically centered in the grey area |
| Cards have rounded corners and shadow | White cards with curved corners and subtle elevation |

---

## What's Next

LAB 04 introduces CSS custom properties (variables). You will define a color once at the
top of the file and use it in 10 places — then change the color in one spot and watch all
10 update simultaneously.

---

## Transfer Exercise

Flexbox is the browser's layout model for one axis. Most UI frameworks have an equivalent:
SwiftUI uses `HStack` and `VStack`, Android Jetpack Compose uses `Row` and `Column`,
Flutter uses `Row` and `Column` as well.

Describe the SwiftUI `HStack` in terms of flexbox: which flexbox property does it
correspond to, and what would the equivalent of `justify-content: space-between` be?

---

## Quick Check Answers

**1. What CSS property on a parent controls how children are arranged?**
`display: flex`. Changing a container's `display` to `flex` activates flexbox layout
for all direct children. The parent's `justify-content` and `align-items` then control
the arrangement. Children do not need any special properties to participate.

**2. Do you position each box individually or tell the parent?**
You tell the parent. This is the core insight of flexbox: you put layout properties on
the container, not on the children. The parent decides how to distribute space. This
approach scales to any number of children — adding a fourth card to the row requires
zero additional CSS.

**3. Gap between items — margin or gap?**
`gap` on the flex container. It creates space between items without adding unwanted
space before the first or after the last item. Margin would work but requires an
edge-case fix for the last child. `gap` eliminates that entirely.
