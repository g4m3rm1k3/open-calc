# FlowBoard Masterclass — LAB 03 — Styling the Card

**Prerequisites:** LAB-02 — Cards From Data. You have multiple cards rendering from an array, a clean console, and `Card.tsx` with a `CardProps` interface.

**What this lab adds:**
- Visual card styling: white background, border, padding, border-radius, box shadow
- Understanding of the CSS box model — what padding, margin, and border actually do to an element's size
- The `className` prop — how React connects a component to its CSS

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. In HTML you write `class="card"`. In React JSX you write `className="card"`. Why do you think React uses a different attribute name?
> 2. If you add `padding: 16px` to a box that is `200px` wide, does the box stay `200px` wide or does it grow?
> 3. What do you think `box-shadow` draws — a duplicate copy of the element, or something else?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, each card has a clean visual appearance: white background, light border, rounded corners, padding so the text has breathing room, and a subtle shadow that lifts the card off the background.

```
(before — plain browser default text)

Fix login button
The login button does not respond on mobile screens.

Update homepage hero image
New design approved in Figma.


(after — styled cards)

┌─────────────────────────────────────────┐
│                                         │
│  Fix login button                       │
│  The login button does not respond      │
│  on mobile screens.                     │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  Update homepage hero image             │
│  New design approved in Figma.          │
│                                         │
└─────────────────────────────────────────┘
```

This lab is entirely about CSS. No new JavaScript concepts. No new React concepts. Just visual appearance — one property at a time, each one followed by a save and a look.

---

## Concept: The CSS Box Model

**What it is:** Every HTML element is rendered as a rectangular box. The box has four layers: content, padding, border, and margin. Together these layers are called the box model.

**The problem before:**

Without understanding the box model, CSS sizing feels random. You set `width: 200px` but the element takes up `230px` of space. You add `padding` and the element grows wider unexpectedly. You cannot predict how changing one property affects the final size on screen.

**The solution:** Understand the four layers, what each one does, and how they combine.

```
┌──────────────────────────────────────────────────┐
│                    margin                        │
│   ┌──────────────────────────────────────────┐   │
│   │                 border                   │   │
│   │   ┌──────────────────────────────────┐   │   │
│   │   │              padding             │   │   │
│   │   │   ┌──────────────────────────┐   │   │   │
│   │   │   │         content          │   │   │   │
│   │   │   └──────────────────────────┘   │   │   │
│   │   └──────────────────────────────────┘   │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**The four layers — what each does:**

**Content** — the actual text, image, or child elements. `width` and `height` set this layer's size by default.

**Padding** — space *inside* the border, between the content and the edge. Padding is part of the element's background color area. Clicking anywhere in the padding area triggers click events on the element.

**Border** — a line drawn around the padding. You can control its thickness, style (solid, dashed, dotted), and color.

**Margin** — space *outside* the border, between this element and its neighbors. Margin is transparent — it shows the parent's background. Margins collapse vertically (two stacked elements' margins merge into one).

**The sizing surprise:**

By default, `width` and `height` set only the content area. Adding `padding: 16px` and `border: 1px solid` to a `200px` wide element gives a total box width of:

```
200px (content) + 16px (left padding) + 16px (right padding) + 1px (left border) + 1px (right border)
= 234px total
```

This surprises almost everyone. The fix is `box-sizing: border-box`, which redefines `width` to include padding and border:

```css
/* With border-box: width = 200px total, including padding and border */
.card {
  box-sizing: border-box;  /* width now means "total box width" */
  width: 200px;
  padding: 16px;           /* fits inside the 200px */
  border: 1px solid black; /* also fits inside the 200px */
}
```

**Modern CSS practice:** Set `box-sizing: border-box` globally (on all elements) as the first rule in your CSS. This is standard in every professional CSS setup. We will do this in this lab.

**You will see this again in:** Every web project. The box model is the foundational mental model of CSS layout. Every div, paragraph, button, and card you will ever style uses these four layers. Job interviews test this.

**Watch for:** `margin` collapses vertically. If two stacked elements both have `margin-bottom: 16px` and `margin-top: 16px`, the space between them is `16px` (the larger one wins), not `32px`. This is called margin collapse and it only happens vertically, never horizontally.

---

## Concept: `className` in React

**What it is:** `className` is the JSX attribute that adds a CSS class to an element. It is the JSX equivalent of the HTML `class` attribute.

**The problem before:**

If you write `<div class="card">` in JSX, TypeScript gives you a warning: "Did you mean `className`?" React uses `className` instead of `class` because `class` is a reserved word in JavaScript — it is used to define ES6 classes (`class Card extends Component`). JSX compiles to JavaScript, so using `class` in JSX would conflict with the JavaScript keyword.

```tsx
// Wrong — compiles to { class: "card" } which conflicts with JS reserved word
<div class="card">

// Correct — JSX convention; compiles to { className: "card" }
<div className="card">
```

**Canonical example:**

```tsx
// In JSX: className on the element
function Card() {
  return <div className="card">content</div>;
}

// In CSS: the class selector targets it
/* Card.css */
.card {
  background: white;
  border: 1px solid #ddd;
}
```

**Where the CSS file comes from:** You create it. Then you import it into the component file. The import triggers Vite to inject the CSS into the browser's `<head>` at runtime.

**Project application:** We will create `Card.css` with a `.card` class and import it in `Card.tsx`. The `<div>` in the `Card` component gets `className="card"`.

**You will see this again in:** Every React component with styles. `className` vs `class` is a near-universal React interview question.

**Watch for:** The import path for a CSS file is `import './Card.css'` — a relative path starting with `./`. Forgetting `./` causes a "module not found" error because Node module resolution looks for installed packages without it, and `Card.css` is not an npm package.

---

## Step 1 — Create `Card.css` and apply a background color

The rule: structure first, style after. You already have the structure (`Card.tsx`). Now you add CSS one rule at a time, seeing each change immediately.

In VS Code Explorer, right-click `src/components/` and create a new file: `Card.css`.

Your `src/components/` folder now has:

```
src/components/
├── Card.tsx
└── Card.css   ← new
```

Start with the absolute minimum — just a background color to prove the class is connected:

```css
/* Card.css */

/* Global box-sizing reset — applied here so cards behave predictably.
   In a later lab we will move this to index.css for the whole app.
   border-box makes width include padding and border (not just content). */
*, *::before, *::after {
  box-sizing: border-box;
}

/* .card is the main container for each task card.
   Start with just a background color — we will add more properties step by step. */
.card {
  background-color: white;
}
```

Now import this CSS file in `Card.tsx`. Add one line at the top of `Card.tsx`:

```tsx
// Card.tsx

import './Card.css'; // ← add this — Vite injects this CSS into the browser

export interface CardProps {
  title: string;
  description: string;
}

export function Card(props: CardProps) {
  return (
    <div className="card"> {/* ← change from <div> to <div className="card"> */}
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </div>
  );
}
```

### CSS AND SEE

Save both files. Look at the browser.

**You should see:** The cards now have a white background against whatever color the page background is (probably white too — so you may not see much difference yet). The text is unchanged.

**Verify the class is applied:** DevTools → Elements. Click on a card's `<div>`. In the Styles panel on the right, you should see `.card { background-color: white; }` listed. If it's not there, the import is missing or the `className` attribute was not added.

**Compare:** Before this step, the cards had no class and used the browser's default transparent background. After this step, the class is connected and the CSS is active.

---

## Step 2 — Add padding

Padding gives the content breathing room inside the card's edges. Without it, the text sits right at the edge of the box — cramped and hard to read.

```css
/* Card.css */

*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  background-color: white;
  padding: 16px;   /* ← add this — 16px of space on all four sides */
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** The text inside each card now has space around it on all four sides. The card is visibly larger than before — the content area is the same size, but the padding added `16px` on each side.

**Experiment:** Change `padding: 16px` to `padding: 4px`. Save. The text is cramped against the edges. Change it to `padding: 40px`. The cards are excessively spacious. Change it back to `16px`.

**Shorthand:** `padding: 16px` sets all four sides equally. You can also set sides individually:

```css
padding-top: 12px;
padding-right: 16px;
padding-bottom: 12px;
padding-left: 16px;

/* Or use the shorthand: top/bottom first, then left/right */
padding: 12px 16px;  /* 12px top/bottom, 16px left/right */
```

We use `padding: 16px` (all four sides equal) for simplicity.

---

## Step 3 — Add a border

A border draws a line around the padding, visually separating the card from its surroundings.

```css
.card {
  background-color: white;
  padding: 16px;
  border: 1px solid #e2e8f0;  /* ← add this — thin light-gray solid line */
}
```

The `border` shorthand sets three properties at once: `thickness style color`. Breaking it down:
- `1px` — one pixel thick
- `solid` — a continuous line (alternatives: `dashed`, `dotted`, `none`)
- `#e2e8f0` — a light gray hex color

### CSS AND SEE

Save. Look at the browser.

**You should see:** Each card now has a visible light gray rectangle around it. The padding keeps the text away from the border.

**Experiment:** Change `1px solid #e2e8f0` to `2px dashed red`. Save. See the thick red dashed border. Change it back to `1px solid #e2e8f0`.

---

## Step 4 — Add border-radius

Sharp corners feel abrupt. Rounded corners soften the card and match modern UI conventions.

```css
.card {
  background-color: white;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;  /* ← add this — rounds all four corners */
}
```

`border-radius: 8px` means each corner is a quarter-circle with an 8px radius. Larger values make more rounded corners. A `border-radius` equal to half the element's height makes a pill shape. A `border-radius: 50%` makes a circle (if the element is square).

### CSS AND SEE

Save. The cards now have rounded corners.

**Experiment:** Change `8px` to `24px`. Very rounded. Change to `2px`. Barely rounded. Change to `0`. Sharp corners again. Change back to `8px`.

---

## Step 5 — Add box-shadow

A box shadow creates the illusion of depth — the card appears to float slightly above the background.

```css
.card {
  background-color: white;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);  /* ← add this */
}
```

**Reading the box-shadow value:** `0 1px 3px rgba(0, 0, 0, 0.1)`

- `0` — horizontal offset: the shadow is directly below, not shifted left or right
- `1px` — vertical offset: the shadow is 1 pixel below the element
- `3px` — blur radius: how soft/spread-out the shadow edge is (0 = hard edge, large = soft)
- `rgba(0, 0, 0, 0.1)` — the color: black at 10% opacity (nearly transparent)

`rgba` is "red green blue alpha" — a color format that includes transparency. `rgba(0, 0, 0, 0.1)` is black at 10% opacity. `rgba(0, 0, 0, 1.0)` is fully opaque black.

**What box-shadow draws:** Not a copy of the element. The browser draws a color-filled rectangle the same size as the element, offsets it by the specified amounts, blurs it by the specified radius, and renders it behind the element. You see only the parts of the shadow not covered by the element itself.

### CSS AND SEE

Save. The cards now appear to float slightly.

**Experiment:** Change `rgba(0, 0, 0, 0.1)` to `rgba(0, 0, 0, 0.4)`. Save. The shadow is much darker and more prominent. Change it back to `0.1`.

**Experiment:** Change `0 1px 3px` to `4px 4px 0` (no blur, shifted diagonally). Save. You get a hard, retro-style shadow. Change it back.

---

## Step 6 — Tighten up the typography

The card has two text elements: the `<h3>` title and the `<p>` description. The `<h3>` default styles (large font, top margin) are too heavy for a compact card.

```css
/* Card.css */

*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  background-color: white;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* .card-title targets the heading inside each card.
   We scope it to ".card .card-title" to avoid accidentally
   styling h3 elements elsewhere in the app. */
.card-title {
  margin: 0 0 8px 0;  /* top right bottom left — only bottom margin */
  font-size: 15px;
  font-weight: 600;   /* semi-bold — readable but not heavy */
  color: #1a202c;     /* near-black for good contrast */
}

.card-description {
  margin: 0;          /* remove default paragraph margin */
  font-size: 13px;
  color: #718096;     /* medium gray — secondary text, less prominent than title */
  line-height: 1.5;   /* 1.5× font size — comfortable line spacing for readability */
}
```

Now add these class names to the JSX in `Card.tsx`:

```tsx
export function Card(props: CardProps) {
  return (
    <div className="card">
      <h3 className="card-title">{props.title}</h3>        {/* ← add className */}
      <p className="card-description">{props.description}</p> {/* ← add className */}
    </div>
  );
}
```

### CSS AND SEE

Save both files. Look at the browser.

**You should see:** The title is now a clean semi-bold 15px text. The description is slightly smaller in a softer gray. The tight spacing between title and description makes the card compact and readable.

**Verify:** Open DevTools → Elements. Click on the title text. In the Styles panel you should see `.card-title` rules applied. The browser's default `h3` styles (`font-size: 1.5em`, large margins) should be overridden by your `.card-title` rules.

---

## 🎯 Challenge: Add a hover state

**You know:** CSS classes, box-shadow, border, `className` in React

**Task:** When the user hovers over a card, the shadow should become more prominent (deeper/darker) to indicate the card is interactive. Use a CSS `:hover` pseudo-class. No JavaScript or React changes needed — pure CSS.

**Starting code:** Your current `Card.css`.

**Hints:**

1. CSS pseudo-classes apply rules when an element is in a certain state: `.card:hover { ... }`
2. A smooth visual transition uses the `transition` property: `transition: box-shadow 0.15s ease`

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```css
.card {
  background-color: white;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.15s ease; /* ← smooth the shadow change */
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* ← larger, darker shadow on hover */
}
```

**Key insight:** `:hover` is a CSS pseudo-class — it applies rules only when the element matches a certain browser state. The `transition` property tells the browser to animate changes to `box-shadow` over 0.15 seconds using the `ease` timing function (starts fast, slows at the end). Without `transition`, the shadow change is instant. The animation makes the interaction feel polished without any JavaScript.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `Card.css` exists in `src/components/` | VS Code Explorer panel |
| `Card.css` is imported in `Card.tsx` | First line of `Card.tsx` shows `import './Card.css'` |
| Cards have white background | Browser — cards are white |
| Cards have padding (text not at edge) | DevTools → Box Model panel shows 16px padding |
| Cards have a light gray border | Browser — visible rectangular border around each card |
| Cards have rounded corners | Browser — corners are visibly rounded |
| Cards have a shadow | Browser — subtle shadow below each card |
| Title and description have correct typography styles | DevTools → Styles — `.card-title` and `.card-description` rules visible |
| No TypeScript errors | Problems panel is clean |
| No console errors | DevTools → Console is clean |

---

## Quick Check Answers

**1. Why does React use `className` instead of `class`?**

Because `class` is a reserved word in JavaScript — it defines ES6 classes (`class Card { ... }`). JSX compiles to JavaScript function calls, so JSX attributes become JavaScript object properties. An object property named `class` would shadow or conflict with the JavaScript keyword `class`. React chose `className` to avoid this collision. The compiled output is `React.createElement('div', { className: 'card' })` — a plain object property, no conflict.

**2. Does `padding: 16px` on a `200px` wide box keep it at `200px` or make it grow?**

By default (without `box-sizing: border-box`), it grows. The default `box-sizing` is `content-box`, which means `width: 200px` sets only the content area. Adding `padding: 16px` adds 16px on the left and 16px on the right — the total box width becomes `200 + 16 + 16 = 232px`. With `box-sizing: border-box`, the box stays `200px` and the padding fits inside — the content shrinks to `200 - 32 = 168px` instead.

**3. What does `box-shadow` actually draw?**

Not a copy of the element. The browser creates a color-filled rectangle the same dimensions as the element, places it at the specified offset (`x-offset y-offset`), blurs it by the `blur-radius` amount, then renders it below the element in the paint order. You only see the parts of the shadow that extend beyond the element's edges. The element itself covers the center of the shadow. The result appears as if the element is elevated above the page surface, casting a shadow on it.

---

## Next Lab

In **LAB-04**, you will arrange the cards in a proper column layout with controlled spacing between them. Right now the cards stack but the spacing is determined by margin collapse and default browser behavior. The next lab teaches Flexbox — starting by seeing what happens when you do nothing versus when you apply explicit layout rules.
