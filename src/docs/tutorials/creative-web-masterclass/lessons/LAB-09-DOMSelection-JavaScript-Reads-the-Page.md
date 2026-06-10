# Creative Web Masterclass — LAB 09 — DOM Selection: JavaScript Reads the Page

**Prerequisites:** LAB-08. You know the DOM concept from LAB-00. You know CSS properties
and custom properties. This lab is your first JavaScript.

**What this lab adds:**
- `document.querySelector()` — selecting an element from the DOM
- `.textContent` and `.style` — reading and writing properties on DOM elements
- `.classList.add()`, `.classList.remove()`, `.classList.toggle()` — changing CSS classes
- A button that changes a card's content and switches its theme

**Time:** 50–65 minutes

---

## What You Will Build

A card with three buttons. Each button changes something about the card:

```
  ┌─────────────────────────────────────┐
  │  Status: Idle                        │
  │  Description text here               │
  └─────────────────────────────────────┘

  [ Change Text ]  [ Toggle Theme ]  [ Reset ]

  After "Change Text":
  ┌─────────────────────────────────────┐
  │  Status: Active                     │
  │  JavaScript changed this text.      │
  └─────────────────────────────────────┘
```

No page reload. JavaScript reads and modifies the DOM in place.

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-00 you changed text in DevTools and the page updated instantly. Why did
>    that change disappear when you reloaded? What is different when JavaScript does it?
> 2. If `querySelector('.card')` selects the first element with class `card`, what do
>    you think `querySelectorAll('.card')` returns?
> 3. CSS classes are strings like `"active"` or `"dark"`. How do you think JavaScript
>    adds a class to an element without removing the ones already there?
>
> *(Answers at the end)*

---

## Concept: `document.querySelector()`

**What it is:** `document.querySelector(selector)` searches the DOM for the first element
that matches a CSS selector and returns it as a JavaScript object you can read and modify.

**The problem before:**

JavaScript could only target elements by their ID using `document.getElementById('myId')`.
This forced every interactable element to have a unique ID — cluttering HTML with IDs that
existed only to make JavaScript work.

**The solution:**

```js
const card = document.querySelector('.card');      // first element with class "card"
const title = document.querySelector('#page-title'); // element with id "page-title"
const btn = document.querySelector('button');       // first <button> in the document
```

Any CSS selector works — class, ID, tag, pseudo-class, attribute selector, descendant
combinators. `querySelector` returns a live DOM node object with properties and methods.

**What it hides:** `querySelector` hides the DOM tree traversal. It walks the entire tree
from the root, applies the CSS selector matching algorithm, and returns the first match.
You never write a loop to scan elements. The invariant: it always returns either the first
matching element or `null` — it never throws an error for no match (unlike `getElementById`
when the element genuinely does not exist).

**Canonical example (General Explanation):**
- **Real-world analogy:** A filing cabinet search. `querySelector('.invoice')` is like
  "give me the first folder with the label 'invoice' — I don't care which drawer."
- **Minimal form:**
  ```js
  const heading = document.querySelector('h1');  // get the first h1
  console.log(heading.textContent);              // print its text
  ```
- **Why obvious:** The same selector syntax you use in CSS (`'.card'`, `'#id'`, `'button'`)
  works identically in JavaScript. No new syntax to learn.

**Project Application:**
Every piece of JavaScript in this course starts with `document.querySelector()` to get
a reference to the element it needs to work with. Canvas setup, scroll tracking, the
ribbon nav — all start with `querySelector`.

**Smallest possible example:**

```js
const btn = document.querySelector('.my-button');
btn.textContent = 'Clicked!';
```

**Why it matters here:** You cannot modify an element in JavaScript until you have a
reference to it. `querySelector` is how you get that reference.

**Watch for:** If the element does not exist when the script runs, `querySelector` returns
`null`. Calling `.textContent` on `null` throws a TypeError. Always put your `<script>` tag
at the end of `<body>` (after the HTML), or use `DOMContentLoaded` — this ensures the
elements exist before the script runs.

---

## Concept: `.textContent` and `.style`

**What it is:** `.textContent` is a property on a DOM element that holds all the text
inside it. `.style` is an object that holds inline style overrides for that element.

**The problem before:** Without `.textContent`, you could only change an element's entire
HTML contents with `.innerHTML` — which runs any embedded JavaScript and creates security
risks (called XSS — cross-site scripting).

**The solution:**

```js
const heading = document.querySelector('h1');
heading.textContent = 'New heading text';   // safe text, no HTML parsing
heading.style.color = 'red';               // inline style, overrides CSS
```

`.textContent` treats the value as plain text — any `<script>` tags in it will not run.
`.style` sets inline styles using camelCase property names (`backgroundColor`, not
`background-color`).

**Canonical example:**
- **Minimal form:**
  ```js
  element.textContent = 'Safe text here';  // sets text only
  element.style.fontSize = '2rem';         // sets font-size via inline style
  ```
- **Why camelCase?** CSS uses hyphens (`background-color`), but JavaScript identifiers
  cannot contain hyphens. The DOM translates by removing hyphens and capitalizing the next
  letter: `background-color` → `.backgroundColor`.

**Project Application:**
Updating the portfolio's "active project" count, showing user-selected filter labels, and
displaying real-time canvas statistics all use `.textContent`.

**Smallest possible example:**
```js
document.querySelector('.status').textContent = 'Loading…';
```

**Why it matters here:** Changing displayed text without reloading is the foundation of
every interactive web application.

**Watch for:** `.style` sets *inline* styles with the highest specificity. They override
everything in your CSS file. For theming and state changes, prefer toggling CSS classes
(next concept) instead of setting `.style` directly.

---

## Concept: `.classList`

**What it is:** The `.classList` property of a DOM element is an object with methods for
adding, removing, and toggling CSS class names — letting JavaScript change appearance by
switching between CSS rule sets rather than writing inline styles.

**The problem before:**

```js
/* Manipulating className directly — fragile */
element.className = 'card active dark';  // overwrites ALL existing classes
element.className = element.className.replace('active', '');  // remove one class
```

Editing the `className` string directly is error-prone — adding a class might overwrite
existing ones; removing requires string manipulation.

**The solution:**

```js
element.classList.add('active');      // add a class (no duplicates)
element.classList.remove('active');   // remove a class (safe if not present)
element.classList.toggle('active');   // add if absent, remove if present
element.classList.contains('active'); // returns true/false
```

**What it hides:** `.classList` hides the string parsing of the `className` attribute.
Internally, class names are stored as a space-separated string — `classList` maintains
this correctly, preventing duplicates on `add` and failing silently on `remove` if the
class is not present. The invariant: you cannot accidentally corrupt the class string.

**Canonical example:**
- **Real-world analogy:** A tag board — you pin a tag labeled "active" to an item without
  removing its other tags. `classList.add` pins. `classList.remove` unpins. `classList.toggle`
  checks whether the tag is pinned and does the opposite.
- **Minimal form:**
  ```js
  const card = document.querySelector('.card');
  card.classList.toggle('dark-mode');  // add dark-mode if absent, remove if present
  ```

**Project Application:**
The dark/light theme toggle, scroll-reveal class additions, active nav dots, and hover
state management throughout the portfolio all use `classList.toggle` and `classList.add`.

**Smallest possible example:**
```js
document.querySelector('.btn').addEventListener('click', () => {
  document.querySelector('.card').classList.toggle('active');
});
```

**Why it matters here:** This is the primary way JavaScript controls CSS — by switching
classes, not by writing inline styles. It keeps styling in CSS where it belongs.

**Watch for:** `classList.toggle` returns `true` if the class was added, `false` if removed.
This return value lets you track state: `const isActive = el.classList.toggle('active')`.

---

## Step 1 — Create Files

`projects/lab-09/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 09 — DOM Selection</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <div class="demo-page">

      <div class="card" id="demo-card">
        <p class="card-status">Status: Idle</p>
        <p class="card-desc">Edit this card using the buttons below.</p>
      </div>

      <div class="btn-row">
        <button class="btn" id="btn-change">Change Text</button>
        <button class="btn" id="btn-theme">Toggle Theme</button>
        <button class="btn" id="btn-reset">Reset</button>
      </div>

    </div>

    <!-- Script goes at the bottom of body so all HTML above is parsed first -->
    <script src="main.js"></script>
  </body>
</html>
```

The `<script src="main.js">` at the end of `<body>` is critical. If it were in `<head>`,
the script would run before the HTML elements are parsed — `querySelector('.card')` would
return `null` because the card does not exist yet.

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** A card with status text and description, plus three unstyled buttons.
> No interactivity yet — `main.js` does not exist.

---

## Step 2 — Base Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-bg: #f5f5f5;
  --color-surface: white;
  --color-text: #1a1a2e;
  --color-primary: #6c63ff;
  --color-border: #e0e0f0;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

.demo-page {
  max-width: 480px;
  margin: 80px auto;
  padding: 0 24px;
}

.card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Dark variant — applied by JavaScript via classList */
.card.is-dark {
  background: #1a1a2e;
  border-color: #4a4a8a;
  color: white;
}

.card-status {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin: 0 0 8px 0;
}

.card.is-dark .card-status { color: #a09aff; }   /* lighter purple on dark bg */

.card-desc {
  margin: 0;
  line-height: 1.6;
}

.btn-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }
```

---

> **CSS AND SEE**
>
> **You should see:** A white card with status text and description, and three purple buttons.
> No functionality yet — clicking the buttons does nothing.

---

## Step 3 — Select the Elements in JavaScript

Create `projects/lab-09/main.js`:

```js
// Get references to the elements we will work with.
// document.querySelector searches the DOM for the first matching element.

const card = document.querySelector('#demo-card');           // by ID selector
const statusEl = document.querySelector('.card-status');      // by class selector
const descEl = document.querySelector('.card-desc');          // by class selector
const btnChange = document.querySelector('#btn-change');
const btnTheme = document.querySelector('#btn-theme');
const btnReset = document.querySelector('#btn-reset');

// Log to verify the selections before doing anything else
console.log('card found:', card);
console.log('statusEl found:', statusEl);
```

---

> **SAVE AND TRY**
>
> Save. Open DevTools Console (`F12` → Console tab).
>
> **You should see:** Two lines printed:
> ```
> card found: <div class="card" id="demo-card">
> statusEl found: <p class="card-status">Status: Idle</p>
> ```
>
> These are live DOM node objects. Click the arrow to expand them in the console and
> explore their properties.
>
> **Change something:** Change `document.querySelector('#demo-card')` to
> `document.querySelector('.nonexistent')`. Save. The console now logs `null`. Any
> attempt to call `.textContent` on `null` would crash. Change it back.

---

## Step 4 — Wire the "Change Text" Button

Add to `main.js` (after the querySelector lines):

```js
// "Change Text" button — updates textContent on two elements
btnChange.addEventListener('click', function () {
  statusEl.textContent = 'Status: Active';              // plain text — not innerHTML
  descEl.textContent = 'JavaScript changed this text.'; // replaces existing text
});
```

`addEventListener` registers a function to call when the button is clicked. The function is
called a **callback** — it is defined here but called later by the browser when the click
event fires. `'click'` is the event name. Any DOM element can listen for `'click'`.

---

> **SAVE AND TRY**
>
> Click the "Change Text" button.
>
> **You should see:** Status changes to "Status: Active" and the description to
> "JavaScript changed this text." — with no page reload.
>
> **In DevTools Elements panel:** While the text shows "Status: Active," look at the
> `<p class="card-status">` element. Its content is `Status: Active` — the DOM is live.
>
> **Change something:** Change `'click'` to `'dblclick'`. Save. Now the button only
> responds to double-clicks. Change back to `'click'`.

---

## Step 5 — Wire the "Toggle Theme" Button

```js
// "Toggle Theme" button — adds or removes the "is-dark" class
btnTheme.addEventListener('click', function () {
  card.classList.toggle('is-dark');  // add if absent, remove if present
});
```

`classList.toggle('is-dark')` checks whether the card has the class `is-dark`:
- If the card does NOT have `is-dark`, it adds it
- If the card DOES have `is-dark`, it removes it

The CSS rule `.card.is-dark` is already written in `styles.css` — JavaScript only controls
which class is present. The visual result comes entirely from CSS.

---

> **SAVE AND TRY**
>
> Click "Toggle Theme."
>
> **You should see:** The card transitions smoothly to a dark background with white text
> (because of the `transition` property in CSS).
>
> Click "Toggle Theme" again — it returns to light.
>
> **In DevTools Elements panel:** While dark mode is active, look at the card's `class`
> attribute: `class="card is-dark"`. Click "Toggle Theme" — it becomes `class="card"`.
>
> **Change something:** In `styles.css`, change the `.card` transition from `0.3s` to
> `1s`. Save. The theme switch now takes a full second. The change is CSS only — no JS
> change needed. Change back to `0.3s`.

---

## Step 6 — Wire the "Reset" Button

```js
// "Reset" button — returns both text and class to original state
btnReset.addEventListener('click', function () {
  statusEl.textContent = 'Status: Idle';
  descEl.textContent = 'Edit this card using the buttons below.';
  card.classList.remove('is-dark');  // remove only — do not toggle (toggling would add it back if not present)
});
```

`classList.remove` is safer than `classList.toggle` here because we always want to end
up in the light state. `toggle` would flip it: if already light, it would make it dark.

---

> **SAVE AND TRY**
>
> 1. Click "Change Text" — text changes.
> 2. Click "Toggle Theme" — dark mode on.
> 3. Click "Reset" — text returns to original, dark mode off.
>
> **You should see:** The card returns to its exact starting state.
>
> **In DevTools Console:** Type:
> ```js
> document.querySelector('#demo-card').classList
> ```
> **Expected:** `DOMTokenList []` — an empty class list (only `card` base class, which
> is always there, but `is-dark` is gone).

---

## 🎯 Challenge: Counter Card

**You know:** `querySelector`, `textContent`, `classList.toggle`, event listeners.

**Task:** Add a second card with a number counter. The card should show a count starting
at 0. Add "+" and "−" buttons that increment and decrement the count. When the count is
above 5, the card gets a class `is-high` that changes its border to `var(--color-primary)`.
When the count returns to 5 or below, the class is removed.

**Starting HTML:**
```html
<div class="card" id="counter-card">
  <p class="counter-label">Count</p>
  <p class="counter-value">0</p>
</div>
<div class="btn-row">
  <button class="btn" id="btn-plus">+</button>
  <button class="btn" id="btn-minus">−</button>
</div>
```

**Hint:** Store the count in a JavaScript variable. On each button click, update the
variable and then set `counterValueEl.textContent` to the new value.

---

<details>
<summary>▶ Show Solution</summary>

```js
const counterCard = document.querySelector('#counter-card');
const counterValueEl = document.querySelector('.counter-value');
const btnPlus = document.querySelector('#btn-plus');
const btnMinus = document.querySelector('#btn-minus');

let count = 0;   // mutable variable — let, not const, because it changes

function updateCounter() {
  counterValueEl.textContent = count;                // update display
  if (count > 5) {
    counterCard.classList.add('is-high');             // above threshold
  } else {
    counterCard.classList.remove('is-high');          // at or below threshold
  }
}

btnPlus.addEventListener('click', function () {
  count = count + 1;   // increment
  updateCounter();
});

btnMinus.addEventListener('click', function () {
  count = count - 1;   // decrement
  updateCounter();
});
```

In `styles.css` add:
```css
.card.is-high { border-color: var(--color-primary); }
```

**Key insight:** Separating `updateCounter()` into its own function — rather than
duplicating the update logic in both button handlers — is the "single source of truth"
principle. The display always reflects the current `count` value because there is only
one place that reads `count` and updates the DOM. Change the update logic once; both
buttons benefit.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| "Change Text" updates card text | Click → status and description both update |
| "Toggle Theme" switches dark/light | Click → dark mode on; click again → light mode |
| Theme transition is smooth | Class change is animated (not instant snap) |
| "Reset" restores original state | Click after changes → card returns to starting state |
| Script does not run before HTML | No console errors about null elements |

---

## What's Next

LAB 10 introduces `addEventListener` in depth — specifically `mousemove` and `keydown`
events. You will track the mouse cursor position and display it live on screen.

---

## Transfer Exercise

`querySelector` and `classList` are JavaScript's way of bridging code and visual output.
The same pattern exists in native mobile development: in Swift/UIKit, you get a reference
with `@IBOutlet var titleLabel: UILabel!` and change it with `titleLabel.text = "Hello"`.
In Android/Kotlin, `val btn = findViewById<Button>(R.id.myButton)` then `btn.text = "Click"`.

What is the key difference between the browser's `querySelector` approach and the mobile
`IBOutlet`/`findViewById` approach? Which one is more brittle when the UI changes?

---

## Quick Check Answers

**1. Why did DevTools edits disappear on reload, while JavaScript edits persist?**
DevTools edits modify the live in-memory DOM, which is discarded when the page reloads
(a fresh DOM is built from the source file). JavaScript edits from `<script>` are part of
the page's program — they run every time the page loads. The script runs again, and if
a button has been clicked, the click handler runs. But the *state* (which button was clicked)
is also lost on reload unless saved to `localStorage` or a server. The edits "persist"
only within the current session.

**2. What does `querySelectorAll` return?**
A `NodeList` — a live (or static, depending on the method) collection of all matching
elements. Unlike a JavaScript array, a `NodeList` does not have array methods like `.map`
or `.filter` by default, but you can iterate it with `for...of` or convert it with
`Array.from(nodeList)`.

**3. How does JavaScript add a class without removing existing ones?**
Via `classList.add('new-class')`. It internally reads the existing class list, checks that
`new-class` is not already present, and appends it. The string representation becomes
`"existing-class new-class"`. Using `element.className = 'new-class'` would overwrite the
entire class string — removing all existing classes. `classList.add` is always the right
choice.
