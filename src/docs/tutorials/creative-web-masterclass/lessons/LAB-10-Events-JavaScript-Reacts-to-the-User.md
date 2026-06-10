# Creative Web Masterclass — LAB 10 — Events: JavaScript Reacts to the User

**Prerequisites:** LAB-09. You know `querySelector`, `textContent`, `classList`, and click events.

**What this lab adds:**
- The event object — the data the browser passes to every event callback
- `mousemove` — tracking cursor position in real time
- `keydown` — responding to keyboard input
- `mouseenter` / `mouseleave` — hover detection without CSS
- A live cursor tracker and a key display panel

**Time:** 45–60 minutes

---

## What You Will Build

```
  Move the mouse:
  Cursor: X 423  Y 218        ← live position updates every frame

  Press any key:
  Last key: ArrowRight        ← shows the key name

  Hover the cards:
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Card 1  │  │▐HOVERED▌│  │  Card 3  │
  └──────────┘  └──────────┘  └──────────┘
                 ↑ border lights up on hover (JavaScript hover, not CSS :hover)
```

---

> **Quick Check — answer before reading further:**
>
> 1. You learned `'click'` as the event name. What do you predict the event name is for
>    mouse movement? For key presses?
> 2. Every event callback receives one argument — the event object. What do you think it
>    contains? Why is it passed to the callback?
> 3. Can you use CSS `:hover` and JavaScript `mouseenter` on the same element at the same
>    time? Do they conflict?
>
> *(Answers at the end)*

---

## Concept: The Event Object

**What it is:** When the browser calls an event callback, it passes one argument — the event
object — which contains information about what just happened: where the mouse was, which key
was pressed, which element triggered the event, and more.

**The problem before:** If callbacks received no information, `mousemove` would only tell
you "the mouse moved" — not *where* it moved to. You would need a separate mechanism to
read the mouse position after the fact.

**The solution:**

```js
document.addEventListener('mousemove', function (event) {
  // event.clientX — X position from the left edge of the browser window
  // event.clientY — Y position from the top edge of the browser window
  console.log(event.clientX, event.clientY);
});
```

Every event type gives its own properties. `mousemove` gives `clientX`, `clientY`.
`keydown` gives `event.key` (the key name like `"ArrowRight"` or `"a"`).
`click` gives `event.target` (the element that was clicked).

**What it hides:** The event object hides browser-internal state — raw mouse coordinates,
keyboard scan codes, touch positions, scroll amounts. You get a normalized object with
human-readable properties rather than low-level hardware values. The invariant: every event
callback always receives exactly one event object as its first argument. There is no
second argument, no global state to check.

**Canonical example (General Explanation):**
- **Real-world analogy:** A doorbell notification includes who rang it and at what time —
  not just "someone rang." The notification (event object) carries the context.
- **Minimal form:**
  ```js
  btn.addEventListener('click', function (event) {
    console.log('Clicked element:', event.target);   // which element was clicked
    console.log('At position:', event.clientX, event.clientY);
  });
  ```

**Project Application:**
`event.clientX` and `event.clientY` are used in LAB-16 to make particles follow the mouse.
`event.key` powers the terminal section's keyboard interaction in LAB-33.

**Smallest possible example:**
```js
document.addEventListener('keydown', function (event) {
  console.log(event.key);  // "Enter", "ArrowUp", "a", "Shift", etc.
});
```

**Why it matters here:** Every interactive feature in the portfolio depends on reading the
event object. Without it, you could only detect *that* something happened, not *what*.

**Watch for:** `event.clientX` is relative to the *browser window*. `event.pageX` is
relative to the *full document* (including scroll). For canvas-based interactions, you will
need to subtract the canvas's bounding rect — covered in LAB-16.

---

## Concept: `mousemove`

**What it is:** The `'mousemove'` event fires every time the mouse pointer moves, up to
the browser's refresh rate (60+ times per second), providing the cursor's current position.

**The problem before:** There was no way to know where the cursor was unless the user
clicked something. Hover effects needed CSS; tracking position needed polling.

**The solution:**

```js
document.addEventListener('mousemove', function (event) {
  const x = event.clientX;   // 0 = left edge, increases rightward
  const y = event.clientY;   // 0 = top edge, increases downward
  updateCursorDisplay(x, y);
});
```

**Canonical example:**
- **Real-world analogy:** A motion sensor that sends a signal every time something moves
  in front of it — not just when movement starts or stops.
- **Minimal form:** `document.addEventListener('mousemove', e => console.log(e.clientX, e.clientY))`

**Project Application:**
LAB-16 (canvas particles) and LAB-22 (Three.js raycasting) both read `mousemove` to track
the cursor and respond to its position.

**Smallest possible example:**
```js
document.addEventListener('mousemove', function (event) {
  xEl.textContent = event.clientX;
  yEl.textContent = event.clientY;
});
```

**Why it matters here:** Cursor tracking is a foundational technique for all interactive
visualizations in this course.

**Watch for:** `mousemove` fires very frequently. Avoid doing heavy computation directly
inside the handler — store the coordinates in variables and process them in a
`requestAnimationFrame` loop (LAB-11). For now, updating text is fast enough.

---

## Concept: `keydown`

**What it is:** The `'keydown'` event fires when any key is pressed, providing the key's
name as a readable string via `event.key`.

**The problem before:** Keyboard interactions were only accessible via form elements
(`<input>` onchange). You could not respond to arrow keys or modifier keys in general.

**The solution:**

```js
document.addEventListener('keydown', function (event) {
  console.log(event.key);  // "a", "Enter", "ArrowUp", "Shift", " " (space), etc.
  if (event.key === 'Escape') {
    closeModal();
  }
});
```

`event.key` is the human-readable name. `event.code` is the physical key position
(`'KeyA'` regardless of language layout). Use `event.key` for semantic meaning,
`event.code` for physical position (e.g., WASD movement in a game where "W" should mean
the physical top key of the cluster, not the character "W").

**Canonical example:**
- **Real-world analogy:** A piano — each key press triggers a specific note. `event.key`
  tells you the note name; `event.code` tells you which physical key on the keyboard.

**Project Application:**
The terminal section in LAB-33 will use `keydown` to detect typing. The keyboard shortcut
for toggling dark mode in the portfolio will use `keydown` with `event.key === 'd'`.

**Smallest possible example:**
```js
document.addEventListener('keydown', function (event) {
  lastKeyEl.textContent = event.key;
});
```

**Watch for:** Some keys fire `keydown` repeatedly while held. Use `event.repeat` (a
boolean) to skip repeated firings if you only want to respond once per press.

---

## Step 1 — Create Files

`projects/lab-10/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 10 — Events</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="demo-page">

      <!-- Cursor tracker -->
      <section class="panel">
        <h2>Mouse Position</h2>
        <p>Move your mouse anywhere on the page.</p>
        <div class="coords">
          X: <span id="cursor-x">—</span>
          &nbsp;&nbsp;
          Y: <span id="cursor-y">—</span>
        </div>
      </section>

      <!-- Key display -->
      <section class="panel">
        <h2>Last Key Pressed</h2>
        <p>Press any key.</p>
        <div class="key-display" id="key-display">—</div>
      </section>

      <!-- JS hover cards -->
      <section class="panel">
        <h2>JavaScript Hover</h2>
        <div class="hover-row">
          <div class="hover-card" data-index="1">Card 1</div>
          <div class="hover-card" data-index="2">Card 2</div>
          <div class="hover-card" data-index="3">Card 3</div>
        </div>
        <p id="hover-label" class="hover-label">Hover a card</p>
      </section>

    </div>
    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server. Three panels stacked — tracker, key display, hover cards. All static.

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: #6c63ff;
  --color-bg: #0d0d1a;
  --color-surface: #161628;
  --color-border: #2a2a4a;
  --color-text: #e8e8f0;
  --color-muted: #7070a0;
}
body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }
.demo-page { max-width: 600px; margin: 0 auto; padding: 60px 24px; display: flex; flex-direction: column; gap: 32px; }
.panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; }
.panel h2 { margin: 0 0 8px 0; font-size: 1rem; color: var(--color-primary); }
.panel p { margin: 0 0 16px 0; color: var(--color-muted); font-size: 0.9rem; }
.coords { font-family: monospace; font-size: 1.5rem; font-weight: 700; }
.key-display { font-family: monospace; font-size: 1.5rem; font-weight: 700; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 6px; padding: 12px 20px; display: inline-block; min-width: 120px; text-align: center; }
.hover-row { display: flex; gap: 12px; margin-bottom: 16px; }
.hover-card { flex: 1; background: var(--color-bg); border: 2px solid var(--color-border); border-radius: 8px; padding: 20px; text-align: center; cursor: default; transition: border-color 0.15s ease, color 0.15s ease; }
.hover-card.is-hovered { border-color: var(--color-primary); color: var(--color-primary); }
.hover-label { color: var(--color-muted); font-size: 0.85rem; margin: 0; min-height: 1.2em; }
```

---

> **CSS AND SEE**
>
> **You should see:** A dark-themed page with three panels. No interactivity yet.

---

## Step 3 — Mouse Position Tracker

`main.js`:

```js
// --- Mouse Position Tracker ---

const cursorXEl = document.querySelector('#cursor-x');  // the <span> for the X value
const cursorYEl = document.querySelector('#cursor-y');  // the <span> for the Y value

// Listen for mouse movement anywhere on the document
document.addEventListener('mousemove', function (event) {
  // event.clientX is the cursor's X distance from the left edge of the viewport
  // event.clientY is the cursor's Y distance from the top edge of the viewport
  // Math.round removes decimal fractions — positions are always whole pixels visually
  cursorXEl.textContent = Math.round(event.clientX);
  cursorYEl.textContent = Math.round(event.clientY);
});
```

---

> **SAVE AND TRY**
>
> Move the mouse over the page.
>
> **You should see:** The X and Y numbers update continuously as you move. The update
> is nearly instantaneous — `mousemove` fires up to 60+ times per second.
>
> **In DevTools Console:**
> ```js
> // Manually fire a test to confirm the elements are correct:
> document.querySelector('#cursor-x').textContent = '999';
> ```
> **Expected:** The X display shows "999". This confirms the element reference is correct.
>
> **Change something:** Change `event.clientX` to `event.pageX`. Move your mouse to the
> bottom of the page (below the panel fold). The values now differ when the page is
> scrolled. `clientX` is relative to the window; `pageX` includes scroll offset.
> Change back to `clientX`.

---

## Step 4 — Key Display

Add to `main.js`:

```js
// --- Key Display ---

const keyDisplayEl = document.querySelector('#key-display');

// Listen for key presses on the whole document — no element needs focus
document.addEventListener('keydown', function (event) {
  // event.key is the human-readable key name
  // Examples: "a", "Enter", "ArrowUp", "Escape", "Shift", " " (space)
  keyDisplayEl.textContent = event.key;
});
```

---

> **SAVE AND TRY**
>
> Click anywhere on the page to ensure the page has keyboard focus. Press keys.
>
> **You should see:** The key display updates to show the name of each key pressed.
> Arrow keys show "ArrowUp", "ArrowDown", etc. Space shows a single space character.
>
> **Change something:** Add `if (event.repeat) return;` as the first line of the callback.
> Hold a key down. The display updates once and stops. Remove the line — now holding a key
> shows rapid updates. `event.repeat` is `true` when a key fires from being held.

---

## Step 5 — JavaScript Hover on Cards

```js
// --- JavaScript Hover Cards ---

// querySelectorAll returns a NodeList of ALL matching elements
const hoverCards = document.querySelectorAll('.hover-card');
const hoverLabelEl = document.querySelector('#hover-label');

// Loop over all cards and attach events to each
hoverCards.forEach(function (card) {
  // mouseenter fires once when the cursor enters the element's area
  card.addEventListener('mouseenter', function () {
    card.classList.add('is-hovered');                        // apply hovered style
    hoverLabelEl.textContent = 'Hovering: ' + card.dataset.index;  // show which card
    // card.dataset.index reads the data-index="1" attribute from the HTML
  });

  // mouseleave fires once when the cursor exits the element's area
  card.addEventListener('mouseleave', function () {
    card.classList.remove('is-hovered');                     // remove hovered style
    hoverLabelEl.textContent = 'Hover a card';              // reset label
  });
});
```

`querySelectorAll('.hover-card')` returns a `NodeList` — all three cards. `.forEach` runs
the callback for each one, passing the current element as `card`. Inside the callback,
`card` refers to the specific card being hovered — not a fixed selection.

`card.dataset.index` reads the `data-index` attribute: `<div data-index="2">` → `card.dataset.index === "2"`. `data-*` attributes are a standard way to attach custom metadata to HTML elements.

---

> **SAVE AND TRY**
>
> Hover over each card.
>
> **You should see:** The hovered card gets a purple border and text. The label below
> shows which card is being hovered. Moving off restores the original state.
>
> **Change something:** Change `'mouseenter'` to `'mouseover'`. Save. Hover over a card —
> it works. But move from a card to its text child. `mouseover` fires again because it
> bubbles — it fires when entering any child too. `mouseenter` only fires when entering
> the element itself. Change back to `mouseenter`.

---

## 🎯 Challenge: Keyboard-Controlled Highlight

**You know:** `keydown`, `event.key`, `classList`, `querySelectorAll`, `forEach`.

**Task:** Make the arrow keys cycle through the three hover cards, highlighting one at a
time. `ArrowRight` should move the highlight forward; `ArrowLeft` should move it backward.
The highlight should wrap around: pressing `ArrowRight` on the last card highlights the first.

**Hint:** Store the currently highlighted index as a variable. On `ArrowRight`, increment
it. On `ArrowLeft`, decrement it. Use the modulo operator `%` to wrap: `(index + 1) % 3`.

---

<details>
<summary>▶ Show Solution</summary>

```js
let activeIndex = -1;   // -1 = nothing highlighted at start

function highlightCard(newIndex) {
  // Remove highlight from all cards
  hoverCards.forEach(function (c) { c.classList.remove('is-hovered'); });

  // Apply highlight to the new active card
  activeIndex = newIndex;
  if (activeIndex >= 0) {
    hoverCards[activeIndex].classList.add('is-hovered');
    hoverLabelEl.textContent = 'Active: Card ' + (activeIndex + 1);
  }
}

document.addEventListener('keydown', function (event) {
  keyDisplayEl.textContent = event.key;   // keep existing key display working

  const count = hoverCards.length;        // 3
  if (event.key === 'ArrowRight') {
    const next = (activeIndex + 1) % count;  // 0→1→2→0
    highlightCard(next);
  } else if (event.key === 'ArrowLeft') {
    const prev = (activeIndex - 1 + count) % count;  // 0→2→1→0
    highlightCard(prev);
  }
});
```

**Key insight:** `(index - 1 + count) % count` handles backward wrapping. Without adding
`count` before the modulo, `(-1) % 3` in JavaScript returns `-1` (not `2`), because
JavaScript's `%` is a remainder operator, not a true mathematical modulo. Adding `count`
first ensures the value is always positive before the modulo.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Cursor X/Y updates on mouse move | Move mouse — numbers change continuously |
| Key display shows key names | Press keys — names appear (ArrowUp, Enter, etc.) |
| Card highlights on JS hover | Hover a card — purple border and text appear |
| Label shows which card is hovered | Hover label updates with the card's data-index |
| Hover cleans up on leave | Move cursor off card — border and label reset |

---

## What's Next

LAB 11 introduces `requestAnimationFrame` — the JavaScript animation loop. Instead of
reacting to events, you will write code that runs 60 times per second and smoothly animates
a square across the screen.

---

## Transfer Exercise

Event-driven programming — "register a callback, browser calls it when something happens"
— is the dominant pattern in UI programming across all platforms. In Node.js, `EventEmitter`
does the same thing. In Python GUI toolkits (tkinter, PyQt), `button.bind('click', handler)`.

What is the key architectural difference between event-driven code (where the framework
calls your code) and procedural code (where your code calls everything in sequence)? Which
approach is better for user interfaces, and why?

---

## Quick Check Answers

**1. Event names for mouse movement and key presses?**
`'mousemove'` for mouse movement. `'keydown'` for key presses (fires when the key is
pressed down). There is also `'keyup'` (fires when the key is released) and `'keypress'`
(deprecated — avoid it). `'mousemove'` is the standard; it fires on every detected
movement, not just when movement starts.

**2. What does the event object contain?**
Context about the event that fired. For `mousemove`: cursor position (`clientX`, `clientY`,
`pageX`, `pageY`), which element triggered it (`target`), and modifier key states
(`shiftKey`, `ctrlKey`). For `keydown`: the key name (`key`), the physical key code
(`code`), whether it is a repeat (`repeat`). The browser assembles this object and passes
it to every registered callback — you never construct it yourself.

**3. Do CSS `:hover` and JavaScript `mouseenter` conflict?**
No — they are independent mechanisms that can both be active simultaneously. CSS `:hover`
is a pure styling mechanism evaluated by the CSS engine. JavaScript `mouseenter` is an
event that triggers a callback. They can apply different changes to the same element at
the same time. In practice, use CSS `:hover` for styling (transitions, color changes) and
JavaScript `mouseenter`/`mouseleave` when you need to track state, update other elements,
or do anything CSS cannot do on its own.
