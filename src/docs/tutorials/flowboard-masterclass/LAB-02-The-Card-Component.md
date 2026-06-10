# FlowBoard Masterclass — LAB 02 — The Card Component

**Prerequisites:** LAB-01 complete.  
You have: Vite running at `localhost:5173`, `App.tsx` showing "FlowBoard" and a subtitle on a dark background, and a working understanding of React components, JSX, `export default`, and `className`.

**What this lab adds:**
- A `Card` component in its own file — the first time you use one component inside another
- The card styled with the CSS Box Model — each property added one at a time so you see exactly what it does

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. You have written `App.tsx` with a component inside it. If you create a second file `Card.tsx` with its own component, how do you think you get that card to appear inside `App`?
> 2. An HTML `<div>` has a default size based on its content. If you put one line of text inside a `<div>`, what do you predict the `<div>`'s width will be?
> 3. CSS has a property called `padding`. Without looking it up — what do you think it controls?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

At the end of this lab, your browser shows:

```
┌─────────────────────────────────────────────┐
│                                             │
│               FlowBoard                    │
│        Your work, your way.                 │
│                                             │
│   ┌─────────────────────────┐              │
│   │                         │              │
│   │   Fix the login bug     │              │
│   │   Bug                   │              │
│   │                         │              │
│   └─────────────────────────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

A white card with rounded corners and a soft shadow, sitting on the dark background. The text is hardcoded for now. Making the card accept real data comes in LAB-03.

---

## Concept: Component Composition

**What it is:** Component composition is placing one component inside another component's JSX — the same way you nest HTML elements — to build a UI out of smaller, focused pieces.

**The problem before:**

```tsx
// Without composition — everything crammed into App:
function App() {
  return (
    <div>
      <h1>FlowBoard</h1>
      <div className="card">
        <h3>Fix the login bug</h3>
        <span>Bug</span>
      </div>
      <div className="card">
        <h3>Add dark mode</h3>
        <span>Feature</span>
      </div>
      {/* ten more cards here, all pasted directly into App */}
    </div>
  );
}
```

When there are 20 cards, `App` is 200 lines. When you want to change how a card looks, you hunt through `App` to find it. Nothing about the card is reusable or changeable in one place.

**The solution:**

```tsx
// Card is its own component — its structure is defined once:
function Card() {
  return (
    <div className="card">
      <h3>Fix the login bug</h3>
      <span>Bug</span>
    </div>
  );
}

// App uses it like an HTML tag:
function App() {
  return (
    <div>
      <h1>FlowBoard</h1>
      <Card />   {/* ← renders everything Card returns */}
      <Card />   {/* ← same component, used twice */}
    </div>
  );
}
```

**What it hides:** Component composition hides the internal structure of each component from the components that use it. `App` does not know that `Card` contains an `<h3>` and a `<span>`. The invariant it protects: changing `Card`'s internal structure never requires changes in `App` — as long as `Card` still returns valid JSX.

**Canonical example (General):**
Think of it like LEGO. Each brick has a shape and snaps into other bricks. You do not redesign the whole model to change one brick. You replace that brick.

**Why it matters here:** You will create `Card.tsx` as a separate file. `App.tsx` imports it and uses `<Card />`. From this moment forward, every piece of UI in FlowBoard lives in its own component file.

**Watch for:** Component names must start with a capital letter. `<Card />` is your component. `<card />` is treated as an unknown HTML element — it renders, but it is not your component. TypeScript will not warn you. The output will just be wrong.

---

## Concept: Importing CSS into a React Component

**What it is:** A React component's CSS lives in a `.css` file alongside it. The component pulls that CSS into the page using an `import` statement at the top of its `.tsx` file.

**The form:**

```tsx
// Card.tsx
import './Card.css';   // ← loads the CSS rules into the page

function Card() {
  return <div className="card">...</div>;
}
```

**How it works:** Vite sees `import './Card.css'` and adds those CSS rules to the page when the app loads. The rules are **global** — any element anywhere on the page with `className="card"` will be styled by them, not only elements inside `Card`.

**The naming collision problem:** Because rules are global, if two different CSS files both define `.card`, they will both apply and can conflict. This is a real problem in large projects. CSS Modules — introduced in a later lab — solve it by making class names file-scoped. For now: only one file defines `.card`.

**Why it matters here:** You will create `Card.css` alongside `Card.tsx`. The `import` is what connects them.

**Watch for:** The `./` prefix is required. It means "same folder as this file." Without it, the import fails because it tries to find an npm package named `Card.css`.

---

## Concept: The CSS Box Model

**What it is:** Every HTML element on a page is a rectangular box. The CSS Box Model defines four layers of space around an element's content, from the inside out: content, padding, border, and margin.

```
┌──────────────────────────────────────────────┐
│                   margin                     │
│   ┌──────────────────────────────────────┐   │
│   │               border                 │   │
│   │   ┌──────────────────────────────┐   │   │
│   │   │            padding           │   │   │
│   │   │   ┌──────────────────────┐   │   │   │
│   │   │   │       content        │   │   │   │
│   │   │   └──────────────────────┘   │   │   │
│   │   └──────────────────────────────┘   │   │
│   └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

| Layer | What it is | Where it is |
|---|---|---|
| **Content** | The text, image, or child elements | The innermost box |
| **Padding** | Space between the content and the border | Inside the border |
| **Border** | A visible (or invisible) line around the padding | Between padding and margin |
| **Margin** | Space between this element and its neighbors | Outside the border — not part of the element's background |

**Why it matters here:** These four properties are what make a `<div>` look like a card instead of a line of text. You will add each layer one step at a time and see exactly what it does.

**Watch for:** Padding adds space *inside* the box — the element gets bigger. Margin adds space *outside* — other elements are pushed away, but the element itself does not visually grow. New CSS learners frequently use the wrong one and wonder why the spacing looks wrong.

---

## Step 1 — Create the Card Component (No CSS Yet)

In `src/`, create a new file named `Card.tsx`. Type this from scratch:

```tsx
function Card() {
  return (
    <div className="card">
      <h3 className="card-title">Fix the login bug</h3>
      <span className="card-label">Bug</span>
    </div>
  );
}

export default Card;
```

**What each part does:**

```
function Card() {            ← a React component — a function that returns JSX
  return (                   ← the () lets the JSX span multiple lines
    <div className="card">   ← the outer container, className is the CSS hook
      <h3 className="card-title">Fix the login bug</h3>  ← the card's title text
      <span className="card-label">Bug</span>            ← a small inline label
    </div>
  );
}

export default Card;   ← taught in LAB-01: makes this importable in other files
```

The `className` values (`"card"`, `"card-title"`, `"card-label"`) are names you chose. They do nothing until you create CSS rules that target them.

---

## Step 2 — Import Card into App

Open `src/App.tsx`. Your current file looks something like this:

```tsx
import './App.css';

function App() {
  return (
    <div className="app">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
    </div>
  );
}

export default App;
```

Add one `import` line and use `<Card />` inside the JSX:

```tsx
import './App.css';
import Card from './Card';         // ← add this

function App() {
  return (
    <div className="app">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <Card />                     {/* ← add this */}
    </div>
  );
}

export default App;
```

**What `import Card from './Card'` does:**

```
import          ← ES module import keyword (taught in LAB-01)
Card            ← the name you give it in this file
from './Card'   ← the file to load — ./ means same folder, .tsx extension is optional
```

TypeScript follows the `from` path, finds `Card.tsx`, sees `export default Card`, and makes that function available here under the name `Card`. When React renders `<Card />`, it calls that function and puts the returned JSX in the page.

### SAVE AND TRY

Save both files. Open `http://localhost:5173` (start `npm run dev` if it is not running).

**You should see:** The "FlowBoard" title, the subtitle, and below them — plain unstyled text: "Fix the login bug" and "Bug". No box. No color. No border. Just text.

That is correct. The component is working. Now you make it look like a card.

**In the browser:** Right-click "Fix the login bug" and select **Inspect**. DevTools opens and highlights `<div class="card">`. Notice in the Styles panel: no rules apply to `.card` yet. The element exists; it just has no visual definition.

**Change something:** In `App.tsx`, change `<Card />` to `<Card /><Card />`. Save. Two copies of the text appear. Change it back to one `<Card />`.

---

## Step 3 — Create Card.css and Add a Background Color

Create a new file `src/Card.css`. Type this:

```css
.card {
  background-color: #ffffff;
}
```

Then open `src/Card.tsx` and add the import at the very top:

```tsx
import './Card.css';       // ← add this as the first line

function Card() {
```

### CSS AND SEE

Save both files.

**You should see:** The card text now has a white background behind it. The white region is roughly as wide as the text inside it.

**Why not full-width?** A `<div>` is a **block-level** element — it normally stretches to fill its parent's full width. But `.app` from LAB-01 has `display: flex` on it. Flex children do not expand to fill their parent; they shrink to fit their content instead. The block-level default only applies when the parent is a normal (non-flex) container. Either way, you will give the card an explicit `width` in Step 7, so the end result is the same.

**What changed:** Before — transparent background (the dark page showed through). After — `background-color: #ffffff` fills the element's box with white.

**Change something:** Change `#ffffff` to `#f0f4ff`. Save. A soft blue tint. Change it to `#fffbe6`. Save. A warm yellow. Change it back to `#ffffff`.

---

## Step 4 — Add Padding

In `src/Card.css`, add the `padding` property:

```css
.card {
  background-color: #ffffff;
  padding: 16px;              /* ← add this */
}
```

**`padding` — space inside the box:**

`padding: 16px` adds 16 pixels of space between the card's content (the text) and the card's edge — on all four sides at once.

The four ways to write `padding`:

```css
padding: 16px;                 /* all four sides */
padding: 12px 20px;            /* top+bottom: 12px,  left+right: 20px */
padding: 8px 16px 8px 16px;    /* top  right  bottom  left  (clockwise) */
padding-top: 8px;              /* individual side */
```

### CSS AND SEE

Save.

**You should see:** Space appears around the text inside the white region. The text is no longer flush with the top-left edge of the white box.

**What changed:** The white region grew taller (16px of space was added above and below the text) and the text shifted right (16px of space was added to the left).

**Change something:** Change `padding: 16px` to `padding: 4px`. Save. The text nearly touches the edges. Change it to `padding: 48px`. Save. Very roomy. Change it back to `padding: 16px`.

---

## Step 5 — Add Rounded Corners

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;           /* ← add this */
}
```

**`border-radius` — rounding the corners:**

`border-radius` curves the corners of the element's box. The value is the radius of the curve.

```css
border-radius: 8px;             /* 8px curve on all four corners */
border-radius: 4px 8px 4px 8px; /* top-left  top-right  bottom-right  bottom-left */
border-radius: 50%;             /* full circle (only when width = height) */
```

Note: `border-radius` rounds the background-color region even when no `border` is visible. It is not just for borders — it clips the entire box.

### CSS AND SEE

Save.

**You should see:** The sharp 90° corners of the white card are now rounded.

**Change something:** Change `8px` to `24px`. Save. Very rounded — almost pill-shaped. Change to `2px`. Save. Barely noticeable. Change back to `8px`.

---

## Step 6 — Add a Box Shadow

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);   /* ← add this */
}
```

**`box-shadow` — simulated depth:**

`box-shadow` draws a shadow behind the element, giving the illusion that it hovers above the page.

The syntax:

```
box-shadow: offset-x  offset-y  blur-radius  spread-radius  color;
            0         2px       8px           (omitted=0)    rgba(0, 0, 0, 0.20)
```

| Value | What it controls |
|---|---|
| `offset-x` | Horizontal shift. Positive = shadow goes right. `0` = directly below. |
| `offset-y` | Vertical shift. Positive = shadow goes down. |
| `blur-radius` | Softness of the shadow edge. `0` = hard edge. Larger = more diffuse. |
| `spread-radius` | Size of the shadow relative to the element. Omitted here — defaults to `0`. |
| `color` | The shadow's color. |

**`rgba()` — color with transparency:**  
`rgba(red, green, blue, alpha)` is the same as `rgb()` but with a fourth value — alpha — for opacity. Alpha runs from `0` (invisible) to `1` (fully opaque). `rgba(0, 0, 0, 0.20)` is black at 20% opacity: a faint, dark shadow.

Multiple shadows are separated by commas. Many real UIs use two shadows together — one sharp and close, one diffuse and distant:

```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08);
```

### CSS AND SEE

Save.

**You should see:** A soft shadow below and around the card. The card appears to float slightly above the dark background.

**Change something:** Change `rgba(0, 0, 0, 0.20)` to `rgba(0, 0, 0, 0.80)`. Save. A heavy, dark shadow — too strong. Change `8px` blur to `0px`. Save. A hard silhouette with no softness. Change both values back: `0 2px 8px rgba(0, 0, 0, 0.20)`.

---

## Step 7 — Give the Card a Fixed Width

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);
  width: 280px;                                 /* ← add this */
}
```

**`width` — explicit horizontal size:**  
By default, a block-level `<div>` expands to fill its parent's full width. `width: 280px` overrides that — the card is exactly 280 pixels wide, regardless of how wide the page is.

`280px` is a common task-card width: wide enough for a short sentence, narrow enough to fit several cards side by side (which you will do in LAB-04).

### CSS AND SEE

Save.

**You should see:** The white card shrinks from full-page width to 280 pixels. It sits in the center of the page (because `App`'s flex container is still centering its children from LAB-01).

**Change something:** Change `width: 280px` to `width: 100px`. Save. The text wraps aggressively — too narrow. Change to `width: 600px`. Change back to `width: 280px`.

---

## 🎯 Challenge: Add a Border

**You know:** The CSS Box Model has four layers. You have used `background-color`, `padding`, `border-radius`, and `box-shadow`. The `border` layer sits between padding and margin.

**Task:** Add a 1-pixel solid border in a light grey color (`#e0e0e0`) to `.card` in `Card.css`.

**Hints:**
- The `border` shorthand takes three values in this order: thickness, style, color. Example: `border: 2px dashed red;`
- `solid` is the most common style. Others include `dashed`, `dotted`, and `none`.

<details>
<summary>Show solution</summary>

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);
  width: 280px;
  border: 1px solid #e0e0e0;
}
```

</details>

**Key insight:** On a card with a box-shadow, the border is subtle. Try temporarily removing `box-shadow` to see the border clearly. In practice, a modern card uses either a border *or* a shadow — rarely both at full visibility. This card uses both because you are learning both.

---

## 🎯 Challenge: Add a Margin-Top to Separate the Card from the Subtitle

**You know:** `margin` is the outermost layer of the box model. It creates space between elements.

**Task:** Add `margin-top` to `.card` so the card sits 24px below the subtitle, instead of immediately below it.

**Hints:**
- `margin-top: 24px` adds space above the element.
- Unlike `padding` (which is inside the box), `margin` is outside — it does not change the card's background color or size.

<details>
<summary>Show solution</summary>

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);
  width: 280px;
  border: 1px solid #e0e0e0;
  margin-top: 24px;
}
```

</details>

**Key insight:** The gap appears outside the white card box — it does not become part of the card's background. If you inspect the card in DevTools, you will see the margin shown in orange in the box model diagram.

---

## Final State of Card.css

After both challenges, your `Card.css` should look like this:

```css
.card {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.20);
  width: 280px;
  border: 1px solid #e0e0e0;
  margin-top: 24px;
}
```

---

## Final Check

Verify each item in the browser before moving on:

| What to check | How to verify |
|---|---|
| Card renders on page | "Fix the login bug" and "Bug" are visible |
| Card has white background | Card is clearly white against the dark background |
| Card has padding | Text is not flush with the edge — breathing room on all sides |
| Card has rounded corners | Corners visibly curved |
| Card has a shadow | Soft shadow visible below/around the card |
| Card is not full-width | Card is roughly 280px wide — does not stretch wall-to-wall |
| Two `<Card />` tags render two cards | Temporarily add a second `<Card />` in App, confirm two cards appear, remove it |
| No TypeScript errors | Terminal shows no red error text under `npm run dev` |
| HMR works | Change `#ffffff` to another color, the browser updates without a page reload |

---

## End State Summary

**New files created:**
- `src/Card.tsx` — a React component returning hardcoded JSX, no props yet
- `src/Card.css` — `background-color`, `padding`, `border-radius`, `box-shadow`, `width`, `border`, `margin-top`

**Modified files:**
- `src/App.tsx` — added `import Card from './Card'` and `<Card />` in the JSX

**Visual state:** Dark background (`#1a1a2e`), "FlowBoard" title centered, subtitle below it, and below that — a white 280px card with rounded corners, shadow, and the text "Fix the login bug / Bug".

**Concepts introduced in this lab:**
- Component composition — using a component inside another component's JSX
- Importing CSS into a React component — `import './Card.css'`
- The CSS Box Model — the four layers: content, padding, border, margin
- `padding` — space inside the box between content and border
- `border-radius` — rounded corners
- `box-shadow` — simulated elevation via offset, blur, spread, and color
- `rgba()` — color with an opacity (alpha) channel
- `border` shorthand — thickness, style, color
- `width` — explicit horizontal size

**What LAB-03 adds:** The `Card` component currently has hardcoded text. LAB-03 introduces the TypeScript `interface` to describe the shape of a card's data, and React **props** to pass different data to each `Card`. After LAB-03, you will render three different cards from an array — no copy-pasting.

---

## Quick Check Answers

1. **How do you get `Card` to appear inside `App`?**  
   `import Card from './Card'` at the top of `App.tsx`, then write `<Card />` in the JSX where you want it to appear. The import tells JavaScript where to find the component; the JSX tag is where it gets placed in the output.

2. **What width does a `<div>` have by default?**  
   The full width of its parent element. A block-level element (like `<div>`) expands horizontally to fill all available space. Height is only as tall as its content — no extra. This is why the unstyled card was full page width but only two lines tall.

3. **What does `padding` control?**  
   The space between the element's content (the text) and its border or edge. It is space *inside* the box. More padding = the element visually grows. It is not the same as `margin`, which adds space *outside* the box to push other elements away.
