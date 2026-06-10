# Junior to Senior — T12·L3 — The Cascade and Specificity

**Prerequisites:** T12·L2 (The Box Model). You know that every element is a box and
that `box-sizing: border-box` makes width predictable. This lesson explains why one
CSS rule wins over another — the exact algorithm the browser uses so you never have
to guess again.

**What this lab adds:**
- What "the cascade" means — the three-layer priority system
- What specificity is — the scoring system the browser uses
- Why `#id` beats `.class` and `.class` beats `p`
- What inheritance is and why `color` inherits but `border` does not
- How to read a specificity conflict in DevTools and know exactly which rule won

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have `.box { color: red; }` and `div { color: blue; }`.
>    The element is `<div class="box">`. What color is the text? Why?
> 2. You have `<p style="color: green">` and a stylesheet with `p { color: purple; }`.
>    What color is the paragraph?
> 3. A `<span>` inside a `<p>` has no `color` set on it. The paragraph is red.
>    The span text is also red. You did not set anything on the span. Why?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You write a CSS rule. It does not apply. You add another rule. The first one still wins.
You add `!important`. Now a different rule breaks. You keep adding rules at the bottom of
the file trying to override what came before. The file grows. Everything breaks.

The root cause: you did not know which rule wins and why. There is a precise algorithm.
It is not random, it is not based on order alone, and once you know it, every conflict
is diagnosable in 30 seconds.

---

## Step 1 — See a Conflict That Does Not Behave as Expected

Create `cascade.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cascade</title>
  <style>
    p { color: blue; }
    p { color: red; }
  </style>
</head>
<body>
  <p>What color am I?</p>
</body>
</html>
```

### CSS AND SEE

**You should see:** Red text. The second `p { color: red; }` wins because it appears later.
When specificity is equal, the last rule wins. This is the most basic cascade rule.

**Change something:** Swap the order — put `color: red` first and `color: blue` second.

**Expected:** Blue text. The last declaration of equal specificity always wins. This is
called **source order** — the final tiebreaker in the cascade.

---

## Concept: The Cascade — Three Layers of Priority

**What it is:** "Cascade" refers to how the browser resolves conflicts between CSS rules.
It is a three-layer priority system. Higher layers always win over lower layers.

**The three layers (highest priority first):**

| Layer | Example | Priority |
|---|---|---|
| 1. Origin and `!important` | `color: red !important` | Highest |
| 2. Specificity | `#id` vs `.class` vs `p` | Middle |
| 3. Source order | Last declaration wins | Tiebreaker |

**The algorithm the browser runs for every element and every property:**

1. Collect ALL rules that match this element
2. Filter by origin (user agent stylesheet, author stylesheet, inline styles) — higher origin wins
3. If still tied: compare specificity scores — higher score wins
4. If still tied: last source position wins

**What it hides:** The browser runs this algorithm on hundreds of elements and thousands
of properties every time the page renders. You write rules; the browser resolves conflicts.

**Canonical example:** A courtroom. The judge applies rules in order of authority:
constitutional law (origin + !important) overrides statute (specificity) overrides
common law (source order). Lower authority only applies when higher authority is silent.

**You will see this again in:**
- CSS frameworks: Tailwind uses single-class utilities (.text-red) that rely on specificity
  being equal so source order controls them. Override via `!important` utilities.
- React-in-JS libraries: emotion, styled-components — they inject styles with controlled
  specificity to avoid conflicts.
- Design tokens (T12·L13): token-based systems use low-specificity rules so component
  styles can always override.

**Watch for:** When a rule is not applying, the cascade is always the explanation.
Open DevTools → the Styles panel shows all matching rules, crossed out ones are overridden.
The winning rule is always at the top within its specificity tier.

---

## Concept: Specificity — The Scoring System

**What it is:** A three-digit score assigned to every CSS selector. Higher score wins
over lower score, regardless of source order.

**The scoring:**

```
Selector type          | Score component | Example
-----------------------|-----------------|---------------------------
Inline style           |  [1, 0, 0, 0]   | style="color: red"
ID selector            |  [0, 1, 0, 0]   | #header
Class, attribute, pseudo-class | [0, 0, 1, 0] | .box   [type="text"]   :hover
Element, pseudo-element | [0, 0, 0, 1]  | p   div   ::before
```

**How to read the score:** Count the components in the selector.

| Selector | ID | Class | Element | Score | Written as |
|---|---|---|---|---|---|
| `p` | 0 | 0 | 1 | 1 | (0,0,1) |
| `.box` | 0 | 1 | 0 | 10 | (0,1,0) |
| `div.box` | 0 | 1 | 1 | 11 | (0,1,1) |
| `#header` | 1 | 0 | 0 | 100 | (1,0,0) |
| `#header .box` | 1 | 1 | 0 | 110 | (1,1,0) |
| `style="..."` | — | — | — | 1000 | (1,0,0,0) |

**The critical rule:** Each column is compared independently, left to right.
A selector with score (0,1,0) ALWAYS beats a selector with score (0,0,99).
No number of element selectors can add up to beat a single class. No number
of classes can add up to beat a single ID.

**The problem before this concept:** You write `div p { color: blue; }` and
then `.intro { color: red; }` expecting red to win because it came later.
It does not — `div p` has two element selectors (0,0,2) and `.intro` has one
class (0,1,0). The class wins regardless of source order.

**You will see this again in:**
- Debugging any large CSS codebase: the most common conflict is an ID in the HTML
  that is unintentionally making a rule impossible to override without more specificity.
- CSS methodology (BEM, SMACSS, Atomic CSS) exists specifically to keep specificity low
  so source order can be used for intentional overrides.

**Watch for:** Never use IDs for styling if you can avoid it. IDs have a specificity of
(1,0,0) — any class combination cannot override them. IDs are appropriate for JavaScript
targeting and anchor links, not for CSS hooks.

---

## Step 2 — Watch Specificity Win Over Source Order

Update `cascade.html`:

```html
<style>
  p { color: blue; }      /* (0,0,1) — last */
  .intro { color: red; }  /* (0,1,0) — first */
</style>

<body>
  <p class="intro">What color am I?</p>   <!-- ← update this -->
</body>
```

### CSS AND SEE

**You should see:** Red text — even though `.intro { color: red; }` appears BEFORE
`p { color: blue; }` in the stylesheet.

**Why:** `.intro` has specificity (0,1,0). `p` has specificity (0,0,1). Class beats element,
regardless of source order.

**Measure it in DevTools:** Right-click the paragraph → Inspect → Styles panel on the right.

**You should see:**
- `.intro { color: red; }` — the winning rule, no strikethrough
- `p { color: blue; }` — strikethrough — overridden

This panel is the exact diagnosis tool. It shows every matching rule, the winner at the
top within each specificity tier, and losers struck through.

**Change something:** Add `#unique { color: green; }` to the stylesheet and
`id="unique"` to the paragraph.

**Expected:** Green — ID (1,0,0) beats class (0,1,0) beats element (0,0,1). Inspect again:
all three rules are visible; only the ID rule is not struck through.

---

## Concept: Inheritance — Why Some Properties Spread to Children

**What it is:** Some CSS properties automatically pass their value down to child elements.
The child does not need to declare the property — it inherits from its parent.

**Which properties inherit:**

Text-related properties inherit:
- `color`
- `font-family`
- `font-size`
- `font-weight`
- `line-height`
- `text-align`

Box-related properties do NOT inherit:
- `margin`, `padding`, `border`
- `width`, `height`
- `background`
- `display`

**The reason for the split:** Text properties are designed to cascade visually through
documents. If you set a font on `<body>`, every paragraph, heading, and span should use
it. If `margin` inherited, every nested element would accumulate the parent's margin —
nested lists would have exponentially larger indentation.

**The mechanism:** When the browser calculates a property value for an element and finds
no matching rule, it checks: does this property inherit? If yes, use the parent's computed
value. If no, use the initial value (the browser default).

**The `inherit` keyword:** You can force any property to inherit by writing `inherit`:

```css
.child {
  border: inherit;   /* explicitly inherit the parent's border — unusual but valid */
}
```

**Canonical example:** Typography at a newspaper. The editor sets the body font once.
Every story, caption, and headline uses that font unless it overrides it locally.
The margins of each box are NOT inherited — the editor sets those individually.

**You will see this again in:**
- CSS custom properties (variables, T12·L13) inherit — this is why you can set
  `--accent-color` on `:root` and use it anywhere in the document.
- `currentColor` — a keyword that uses the element's own `color` value for properties
  that do not inherit (like `border-color: currentColor`).

---

## Step 3 — See Inheritance in Action

Add to `cascade.html`:

```html
<div style="color: purple; font-size: 20px;">   <!-- ← add to body -->
  <p>I inherit purple and 20px from the div.</p>
  <p style="color: orange;">I override color but inherit font-size.</p>
  <p>
    I inherit purple. <span>My span also inherits purple</span>
    because span has no color set.
  </p>
</div>
```

### CSS AND SEE

**You should see:**
- All three paragraphs are 20px — they inherit `font-size`
- First and third paragraphs are purple — they inherit `color`
- Second paragraph is orange — it overrides `color` but still inherits `font-size`
- The span in the third paragraph is also purple — it inherits from the paragraph,
  which inherits from the div

**Change something:** Add `border: 2px solid currentColor` to the first paragraph.

**Expected:** The paragraph gets a purple border — `currentColor` uses the element's own
`color` value, which was inherited as purple.

---

## Step 4 — Read a Full Conflict in DevTools

Build a realistic scenario that requires diagnosis:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cascade Diagnosis</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body { font-family: sans-serif; color: #333; }

    .card { background: white; padding: 16px; }
    .card p { color: #666; font-size: 14px; }

    #featured { background: #fffbe6; }
    #featured p { font-size: 16px; }

    .highlight { color: red; }
  </style>
</head>
<body>
  <div class="card" id="featured">
    <p class="highlight">What color and size am I?</p>
  </div>
</body>
</html>
```

### CSS AND SEE

**Predict before looking:** The paragraph has:
- `.card p` → `color: #666; font-size: 14px;` — score (0,1,1)
- `#featured p` → `font-size: 16px;` — score (1,0,1)
- `.highlight` → `color: red;` — score (0,1,0)

**For `color`:** `.card p` (0,1,1) vs `.highlight` (0,1,0). The score (0,1,1) wins — two
components vs one. Color is #666 — NOT red.

**For `font-size`:** `#featured p` (1,0,1) vs `.card p` (0,1,1). ID column: 1 vs 0 — ID
wins. Font-size is 16px.

Open DevTools and verify. You should see:
- The paragraph is `color: #666` and `font-size: 16px`
- `.highlight { color: red; }` is struck through

**This is how you diagnose every CSS conflict:** find the competing rules, compare their
specificity scores, the highest score wins. If scores are equal, last source position wins.

**Change something:** Change `.card p { color: #666; }` to `#main .card p { color: #666; }`.
Add `id="main"` to the body. Now the score becomes (1,1,1) vs `.highlight`'s (0,1,0).
The #666 color wins.

---

## 🎯 Challenge: Fix the Broken Stylesheet

**The broken file:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Challenge</title>
  <style>
    #nav a { color: white; }
    #nav a:hover { color: yellow; }
    .nav-link { color: blue; }
    .nav-link.active { color: orange; }
  </style>
</head>
<body>
  <nav id="nav">
    <a class="nav-link" href="#">Home</a>
    <a class="nav-link active" href="#">About</a>
  </nav>
</body>
</html>
```

**The problem:** The "About" link should be orange (it has the `active` class) but it is white.

**Task:** Without changing the HTML and without using `!important`, fix the CSS so that:
1. Normal links are white
2. Hovered links are yellow
3. The active link is orange

Write the solution in your head first, then implement and verify.

---

<details>
<summary>▶ Show Solution</summary>

**Why it is broken:**
- `#nav a { color: white; }` has specificity (1,0,1)
- `.nav-link.active { color: orange; }` has specificity (0,2,0)

Column by column: ID column is 1 vs 0 — the ID wins. White overrides orange.

**The fix:** Make the active rule include the ID context so it wins:

```css
#nav a { color: white; }
#nav a:hover { color: yellow; }
#nav .nav-link { color: white; }
#nav .nav-link.active { color: orange; }   /* (1,2,0) — beats (1,0,1) */
```

Or the simpler fix — lower the specificity of the base rule by not using an ID:

```css
.nav-link { color: white; }           /* (0,1,0) */
.nav-link:hover { color: yellow; }    /* (0,2,0) */
.nav-link.active { color: orange; }   /* (0,2,0) — tied, but after hover, last wins */
```

**Key insight:** The root problem was mixing ID selectors with class selectors in the same
context. IDs create a specificity mountain that class-based overrides cannot climb without
also using an ID. The solution is to keep specificity consistently low — use classes only,
avoid IDs for styling, and rely on source order as the tiebreaker. This is why CSS
methodologies like BEM exist: to keep specificity flat.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Source order (cascade tiebreaker) | Two identical selectors — last one wins |
| Specificity: class beats element | `.intro { color: red }` before `p { color: blue }` — red wins |
| Specificity: ID beats class | `#unique { color: green }` — green wins over all classes |
| DevTools strike-through | Overridden rules appear struck through in Styles panel |
| Inheritance: color passes down | Set `color: purple` on a div — child paragraphs and spans are purple |
| Inheritance: border does not pass down | Set `border: 1px solid red` on a div — child paragraphs have no border |
| `!important` problem | Can explain why it creates unmaintainable CSS, not the first solution |

---

## Quick Check Answers

**1. `.box { color: red }` and `div { color: blue }`. `<div class="box">`. What color?**

Red. `.box` has specificity (0,1,0). `div` has specificity (0,0,1). Class beats element.
Source order is irrelevant — specificity resolves the conflict first.

**2. `<p style="color: green">` with `p { color: purple; }` in the stylesheet. What color?**

Green. Inline styles have the highest specificity — they are equivalent to (1,0,0,0) in the
old scoring system, or in the modern model they come from a higher origin layer than author
stylesheets. Inline always wins over stylesheets (barring `!important` in the stylesheet,
which creates an arms-race).

**3. A span inside a red paragraph with no color set on the span. Why is it red?**

Inheritance. The `color` property inherits — when the browser calculates the span's color
and finds no matching rule, it looks at the parent's computed color value (red) and uses it.
The span never needed a rule because inheritance provided the value automatically.
