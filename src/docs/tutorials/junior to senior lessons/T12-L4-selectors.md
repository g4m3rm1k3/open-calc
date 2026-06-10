# Junior to Senior — T12·L4 — Selectors

**Prerequisites:** T12·L3 (Cascade and Specificity). You can read a specificity score
and explain why one rule beats another. This lesson teaches the full selector vocabulary —
every way to target an element in CSS — so you can write rules that target exactly what
you intend and nothing else.

**What this lab adds:**
- Type, class, and ID selectors — when to use each
- Combinator selectors: descendant, child, adjacent sibling, general sibling
- Attribute selectors: target elements by their HTML attributes
- Pseudo-classes: `:hover`, `:focus`, `:nth-child`, `:not`, `:is`, `:where`
- Pseudo-elements: `::before`, `::after`, `::placeholder`
- How to read a complex selector by parsing it right-to-left

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You want to style only `<li>` elements that are DIRECT children of a `<ul>`, not
>    nested deeper. Which combinator do you use?
> 2. You want to style every other row in a table. Which pseudo-class can do this?
> 3. You want to add a decorative `›` arrow before every `<a>` link in a nav menu
>    but you cannot edit the HTML. How do you add content via CSS?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You want to style just the first paragraph after a heading. You target `p` and accidentally
style every paragraph on the page. You add a class to the paragraph to narrow it down.
The class proliferates everywhere. Eventually your HTML is drowning in classes that exist
only to anchor CSS, and your CSS file has hundreds of them.

CSS selectors give you surgical targeting. You can say "only `<p>` elements that immediately
follow an `<h2>`, inside a `.card`, when the card is hovered". No class needed on the paragraph.

---

## Step 1 — Basic Selectors

Create `selectors.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Selectors</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; }
  </style>
</head>
<body>
  <h1>Selector Demo</h1>

  <section class="card">
    <h2>Card Heading</h2>
    <p>First paragraph</p>
    <p class="note">Second paragraph (note)</p>
    <p>Third paragraph</p>
  </section>

  <section class="card">
    <h2>Second Card</h2>
    <p>Another paragraph</p>
  </section>
</body>
</html>
```

### CSS AND SEE

You should see a plain page with two sections. Add basic selectors one at a time:

```css
/* Type selector — targets every h2 */
h2 { color: darkblue; }

/* Class selector — targets elements with class="card" */
.card { background: #f9f9f9; padding: 16px; margin-bottom: 12px; }

/* Class selector on a specific element — only p elements with class="note" */
p.note { background: #fffbe6; border-left: 3px solid gold; padding-left: 8px; }
```

### CSS AND SEE

Add these styles one at a time, refreshing after each to see the isolated effect.

**You should see:**
- `h2` — both headings turn dark blue
- `.card` — both sections get a gray background and padding
- `p.note` — only the second paragraph (the one with class `note`) gets the yellow highlight

**The difference between `.note` and `p.note`:** `.note` targets any element with that class.
`p.note` targets only `<p>` elements with that class. If a `<div class="note">` existed,
`.note` would style it but `p.note` would not.

---

## Concept: Combinator Selectors — Targeting by Relationship

**What it is:** Selectors that target elements based on their position relative to another
element in the HTML structure.

**The four combinators:**

| Combinator | Syntax | Meaning |
|---|---|---|
| Descendant | `A B` (space) | B anywhere inside A, at any depth |
| Child | `A > B` | B that is a DIRECT child of A (not deeper) |
| Adjacent sibling | `A + B` | B that immediately follows A (same parent) |
| General sibling | `A ~ B` | Any B that follows A (same parent, not necessarily adjacent) |

**Why the difference between descendant and child matters:**

```html
<ul>
  <li>Level 1                        <!-- .ul li targets this -->
    <ul>
      <li>Level 2</li>               <!-- .ul li targets this too! -->
    </ul>
  </li>
</ul>
```

`ul li` (descendant) targets BOTH level-1 and level-2 items.
`ul > li` (child) targets ONLY the level-1 items — direct children only.

For nested navigation menus, this distinction is critical: styling `ul > li` means
the style does not accidentally cascade into sub-menus.

**The mechanism:** The browser reads combinators right-to-left. For `section.card > p`,
it first finds all `<p>` elements, then filters to only those whose immediate parent
is a `section.card`.

**Canonical example:** Family relationships. Descendant = all descendants (children,
grandchildren, etc.). Child = only direct children. Adjacent sibling = the next brother/sister.
General sibling = any following brother/sister.

**You will see this again in:**
- Every navigation menu uses `ul > li` to avoid styling nested menu items accidentally.
- The CSS adjacent sibling combinator (`+`) is used in the "lobotomized owl" pattern:
  `* + * { margin-top: 1rem; }` — adds spacing between any two adjacent elements without
  setting margin on the first child.

---

## Step 2 — Add Combinator Selectors

Add to the `<style>` in `selectors.html`:

```css
/* Child combinator: only p that is a DIRECT child of .card */
.card > p { color: #444; }

/* Adjacent sibling: p that immediately follows h2 */
h2 + p { font-weight: bold; }

/* General sibling: all p that follow a p.note (same parent) */
p.note ~ p { color: #888; font-style: italic; }
```

### CSS AND SEE

**You should see:**
- `h2 + p` — only the FIRST paragraph after each heading is bold (the adjacent sibling)
- `p.note ~ p` — the third paragraph (which follows `.note`) is gray and italic
- The second paragraph (`.note` itself) is not affected by `p.note ~ p` because a
  sibling combinator targets siblings that FOLLOW, not the element itself

**Change something:** Change `h2 + p` to `h2 ~ p` (adjacent to general sibling).

**Expected:** Now ALL paragraphs that follow the h2 become bold — not just the first one.

---

## Concept: Attribute Selectors

**What it is:** Selectors that target elements based on the presence or value of their
HTML attributes.

**The syntax:**

| Selector | Matches |
|---|---|
| `[disabled]` | Any element with a `disabled` attribute (value irrelevant) |
| `[type="text"]` | Elements where `type` equals exactly `"text"` |
| `[href^="https"]` | Elements where `href` starts with `"https"` |
| `[href$=".pdf"]` | Elements where `href` ends with `".pdf"` |
| `[class*="icon"]` | Elements where `class` contains `"icon"` anywhere |

**Why use attribute selectors instead of classes:**

You cannot always add a class. Third-party HTML, auto-generated markup, or semantic
HTML elements already carry their meaning in attributes. Styling `input[type="checkbox"]`
is cleaner than adding a class to every checkbox in a form.

**The alternative that was not chosen:** Adding a class to every element that needs styling.
This works but bloats HTML with presentational classes (`class="link-external"` instead
of `[target="_blank"]`). Attribute selectors let HTML remain semantic.

**You will see this again in:**
- Form styling: `input[type="submit"]`, `input:disabled`, `input:required`
- Link styling: `a[href^="mailto:"]`, `a[target="_blank"]`
- ARIA styling: `[aria-expanded="true"]`, `[aria-selected="true"]` — you will use this
  in T12·L15 Accessibility to style states without adding JavaScript-managed classes

---

## Step 3 — Attribute Selectors in Action

Add a form section to `selectors.html`:

```html
<section class="card" style="margin-top: 20px;">   <!-- ← add to body -->
  <h2>Form Demo</h2>
  <form>
    <input type="text" placeholder="Your name">
    <input type="email" placeholder="Your email" required>
    <input type="submit" value="Submit">
    <input type="text" placeholder="Disabled field" disabled>
  </form>
</section>
```

Add CSS:

```css
form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }

/* Attribute selectors: */
input[type="submit"] { background: cornflowerblue; color: white; border: none; cursor: pointer; }
input[required] { border-color: #e74c3c; }
input[disabled] { background: #eee; color: #999; cursor: not-allowed; }
```

### CSS AND SEE

**You should see:**
- Submit button is blue — targeted by `input[type="submit"]`
- Email field has a red border — targeted by `input[required]` (it has the `required` attribute)
- Disabled field is gray — targeted by `input[disabled]`

No extra classes were added to the HTML. The attributes already present carry the meaning.

---

## Concept: Pseudo-Classes — Targeting Element States

**What it is:** A pseudo-class targets an element when it is in a specific state —
hovered, focused, checked, the first of its type, etc. Syntax: `:pseudo-class`.

**The most important pseudo-classes:**

| Pseudo-class | Targets |
|---|---|
| `:hover` | Element the mouse is currently over |
| `:focus` | Element that has keyboard focus (tabbed to, or clicked) |
| `:active` | Element being clicked right now (while mouse button is held) |
| `:checked` | Checkbox or radio that is checked |
| `:disabled` | Form element with `disabled` attribute |
| `:required` | Form element with `required` attribute |
| `:first-child` | Element that is the first child of its parent |
| `:last-child` | Element that is the last child of its parent |
| `:nth-child(n)` | Element that is the nth child |
| `:not(selector)` | Element that does NOT match a selector |
| `:is(selector)` | Groups multiple selectors — lower code duplication |
| `:where(selector)` | Same as `:is()` but with ZERO specificity |

**`:nth-child` patterns:**

```css
li:nth-child(2)     /* exactly the 2nd child */
li:nth-child(odd)   /* 1st, 3rd, 5th... */
li:nth-child(even)  /* 2nd, 4th, 6th... */
li:nth-child(3n)    /* every 3rd: 3, 6, 9... */
li:nth-child(3n+1)  /* every 3rd starting at 1: 1, 4, 7... */
```

**`:is()` vs `:where()` — the specificity difference:**

```css
/* :is() takes the specificity of its most specific argument */
:is(h1, h2, h3) { color: blue; }   /* specificity (0,0,1) — element */

/* :where() always has zero specificity */
:where(h1, h2, h3) { color: blue; }  /* specificity (0,0,0) */
```

Use `:where()` when writing reusable base styles that should be easily overridable.
Use `:is()` when you want the grouped selector to participate in normal specificity.

**You will see this again in:**
- `:focus-visible` (T12·L15): like `:focus` but only shows when navigating by keyboard —
  used to show focus rings for keyboard users but hide them for mouse clicks.
- `:has()` (covered briefly in T12·L14 Responsive): style a parent based on what it contains —
  e.g., `form:has(input:invalid) .submit-btn { opacity: 0.5; }`.

---

## Step 4 — Pseudo-Classes in Action

Add to the existing CSS:

```css
/* Interaction states */
input[type="submit"]:hover  { background: #1a6cb5; }
input[type="submit"]:active { background: #0e4a82; transform: scale(0.98); }
input:focus { outline: 2px solid cornflowerblue; outline-offset: 2px; }

/* Structural pseudo-classes */
.card:first-child { border-top: 3px solid cornflowerblue; }
p:not(.note) { font-size: 15px; }
```

Also add a list:

```html
<section class="card" style="margin-top: 20px;">   <!-- ← add to body -->
  <h2>nth-child Demo</h2>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
    <li>Item 4</li>
    <li>Item 5</li>
  </ul>
</section>
```

```css
li:nth-child(even) { background: #f0f0f0; }
li:first-child { font-weight: bold; }
li:last-child  { color: #888; }
```

### CSS AND SEE

**You should see:**
- Submit button gets darker on hover and even darker + slightly smaller on click
- Text inputs get a blue outline when focused (tabbing through the form shows this)
- The very first `.card` has a blue top border
- Even-numbered list items have a light gray background
- First list item is bold; last list item is gray

**Change something:** Change `li:nth-child(even)` to `li:nth-child(3n+1)`.

**Expected:** Items 1, 4 (every 3rd, starting at 1) get the background. Items 2, 3, 5 do not.

---

## Concept: Pseudo-Elements — Adding and Styling Rendered Content

**What it is:** A pseudo-element creates or targets a specific part of an element that
is not in the HTML structure. Syntax: `::pseudo-element` (double colon, unlike pseudo-classes).

**The main pseudo-elements:**

| Pseudo-element | What it does |
|---|---|
| `::before` | Inserts content BEFORE the element's content (inside the element) |
| `::after` | Inserts content AFTER the element's content (inside the element) |
| `::placeholder` | Styles the placeholder text of inputs |
| `::selection` | Styles text the user has highlighted |
| `::first-line` | Styles only the first line of a block of text |
| `::first-letter` | Styles only the first letter (drop caps) |

**`::before` and `::after` require `content`:**

```css
.card::before {
  content: '★ ';      /* required — even empty: content: '' */
  color: gold;
}
```

Without `content`, the pseudo-element does not render — the property is mandatory.
`content: ''` (empty string) renders a zero-width element that still participates in layout.

**What they are used for:**

1. **Decorative content** — icons, bullets, badges — without adding to the HTML
2. **Layout tricks** — the clearfix hack, absolutely-positioned overlays, decorative underlines
3. **Counters** — CSS counters let `::before` display auto-incrementing numbers

**What they hide:** Generated content is added to the DOM by the browser. It behaves like
a real element (you can position it, size it, etc.) but it is not in the HTML source.
Screen readers generally do not read `::before`/`::after` content — for decorative use only.

**You will see this again in:**
- Custom checkboxes and radio buttons: the actual `<input>` is hidden; `::before` on a
  sibling creates the visual indicator.
- The "clearfix" legacy technique: `::after { content: ''; display: block; clear: both; }`
- Tooltips and badges added purely with CSS.

**Watch for:** `::before` and `::after` are children of the element, not siblings.
`position: absolute` inside them is relative to the parent element's position context.

---

## Step 5 — Pseudo-Elements

Add to CSS:

```css
/* Arrow before every card heading */
.card h2::before {
  content: '▸ ';
  color: cornflowerblue;
}

/* Styled placeholder */
input::placeholder {
  color: #bbb;
  font-style: italic;
}

/* Highlighted text selection */
::selection {
  background: cornflowerblue;
  color: white;
}

/* Decorative underline via ::after */
.card h2 {
  position: relative;   /* so ::after can be positioned relative to it */
  display: inline-block;
}
.card h2::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: cornflowerblue;
}
```

### CSS AND SEE

**You should see:**
- Every card heading now has a blue `▸` arrow before it (added by CSS, not HTML)
- Input placeholders are gray and italic
- Selecting any text on the page turns it blue with white text

**Change something:** Change `content: '▸ '` to `content: counter(section) '. '` and add
`counter-increment: section` to `.card`. This is CSS counters — each card gets an
automatically incrementing number before its heading.

---

## 🎯 Challenge: Style a Navigation Without Touching the HTML

**Given HTML (do not modify it):**

```html
<nav id="main-nav">
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#" class="active">About</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

**Requirements:**
1. Horizontal navigation (list items side by side)
2. Links are dark text, no underline
3. Active link is underlined
4. Last link has `›` after it using `::after`
5. Hovered links change color
6. No IDs or new classes in CSS — use combinators and pseudo-classes only

---

<details>
<summary>▶ Show Solution</summary>

```css
#main-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 24px;
}

#main-nav a {
  text-decoration: none;
  color: #333;
}

#main-nav a:hover {
  color: cornflowerblue;
}

#main-nav .active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

#main-nav li:last-child a::after {
  content: ' ›';
  color: #999;
}
```

**Key insight:** `#main-nav li:last-child a::after` reads right-to-left:
1. Find `::after` pseudo-elements
2. Of those generated from `<a>` elements
3. Where the `<a>` is inside a `<li>` that is the last child
4. Where that `<li>` is inside `#main-nav`

Reading selectors right-to-left (from the target back to the context) makes complex
selectors easy to parse. The browser also evaluates them this way for performance.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Descendant vs child combinator | `ul li` styles nested items; `ul > li` does not |
| Adjacent sibling | `h2 + p` bolds only the first paragraph after each heading |
| Attribute selector | `input[required]` styles only required inputs |
| `:nth-child(even)` | Every other list item gets a background |
| `:not()` | `p:not(.note)` skips the note paragraph |
| `::before` with content | Arrow appears before heading text without HTML changes |
| `::placeholder` | Input placeholder text is styled differently |
| Selection | Highlighted text shows custom colors |

---

## Quick Check Answers

**1. Style only `<li>` that are DIRECT children of a `<ul>`. Which combinator?**

The child combinator: `ul > li`. The descendant combinator (`ul li`, just a space) would
target li elements at any depth — including li elements inside nested ul elements inside
the original ul. The child combinator ensures only one level of depth.

**2. Style every other row in a table. Which pseudo-class?**

`tr:nth-child(even)` or `tr:nth-child(odd)`. `even` targets rows 2, 4, 6... — the
"zebra striping" pattern. You can also use `tr:nth-child(2n)` (equivalent to even) or
`tr:nth-child(2n+1)` (equivalent to odd).

**3. Add a `›` before `<a>` links via CSS without editing HTML. How?**

Use the `::before` pseudo-element:

```css
nav a::before {
  content: '› ';
}
```

`::before` inserts generated content inside the element, before the element's own content.
The `content` property is required — without it, the pseudo-element does not render.
