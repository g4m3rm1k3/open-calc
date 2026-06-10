# Junior to Senior — T12·L12 — Component States

**Prerequisites:** T12·L11 (Visual Hierarchy). You understand how to communicate
importance through CSS. This lesson teaches component states — the different visual
forms a UI component takes based on user interaction, data state, or application state.

**What this lab adds:**
- What a component state is and why it must be communicated visually
- The seven universal component states: default, hover, focus, active, disabled, loading, error
- How to encode states with CSS pseudo-classes, CSS custom properties, and data attributes
- The `transition` property — smooth state changes
- Building a complete button component with all states
- Building an input component with validation states

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A button has `cursor: not-allowed` but no `pointer-events: none`. Can the user still
>    click it? Can a JavaScript `click` event still fire?
> 2. `:focus` vs `:focus-visible`. What is the difference and why do modern stylesheets
>    use `:focus-visible` instead of `:focus`?
> 3. You want a button to smoothly change background colour on hover. You set
>    `transition: background-color 0.2s`. This works. Now you also want the colour to
>    animate on mouseout. Do you need additional CSS?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You have a button. The user clicks it. Nothing visual changes while the click is happening.
The form is loading. The user does not know if it worked. They click again. The form submits
twice. The data is duplicated.

Component states communicate system status. A loading state says "I heard you." A disabled
state says "not now." An error state says "something went wrong." Without states,
the interface is unresponsive — technically functional but communicatively broken.

---

## Step 1 — The Stateless Button Problem

Create `states.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Component States</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
      --space-4: 1rem;    --space-5: 1.5rem;  --space-6: 2rem;
    }

    body { font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 0 var(--space-5); }

    /* The naive button — no states */
    .btn-naive {
      padding: var(--space-2) var(--space-5);
      background: cornflowerblue;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h2>Stateless button:</h2>
  <button class="btn-naive">Submit</button>
  <button class="btn-naive">Submit</button>
</body>
</html>
```

### CSS AND SEE

**You should see:** Two identical buttons. Try interacting with them. No visual feedback
on hover. No visual press feedback on click. No way to distinguish "can be clicked" from
"currently being clicked". A user cannot tell if the system responded.

---

## Concept: The Seven Universal Component States

**What it is:** Every interactive component has the same seven potential states.
CSS communicates these states through property changes triggered by pseudo-classes
or attribute changes.

| State | Trigger | What to communicate |
|---|---|---|
| **Default** | At rest | "Available for interaction" |
| **Hover** | Mouse over | "This is interactive" |
| **Focus** | Keyboard navigation | "This element is selected for keyboard input" |
| **Active** | Being pressed (mousedown) | "The click is registering" |
| **Disabled** | `disabled` attribute or `aria-disabled` | "Interaction is not available right now" |
| **Loading** | Async operation in progress | "I heard you, processing" |
| **Error** | Validation failure or server error | "Something went wrong, here is what" |

**Why all seven matter:**

- **Hover without active:** The user cannot tell if the click registered
- **Focus without hover:** Keyboard users cannot see which element they are on
- **Disabled that looks the same as default:** Users try to click it and wonder why nothing happens
- **No loading state:** Users double-submit forms, causing duplicate records
- **No error state:** Users do not know what went wrong or what to fix

**The design principle:** Every state change must be visually distinguishable from every
other state. A sighted user should be able to tell the button state at a glance.

**You will see this again in:**
- React component libraries (Radix, shadcn): all components expose state via `data-*` attributes
- Accessibility standards (WCAG 2.1): focus state is required; disabled must be programmatically determinable
- T12·L15 (Accessibility): focus styles have specific contrast requirements

---

## Step 2 — Build a Button with All States

Add a proper button component:

```html
<h2 style="margin-top: var(--space-6);">Button with all states:</h2>   <!-- ← add -->

<div style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center;">
  <button class="btn">Default</button>
  <button class="btn btn--loading" disabled>Loading...</button>
  <button class="btn" disabled>Disabled</button>
</div>
```

Add to `<style>`:

```css
.btn {
  /* Base layout */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);

  /* Sizing */
  padding: var(--space-2) var(--space-5);
  min-width: 100px;

  /* Typography */
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1;

  /* Colour */
  background: cornflowerblue;
  color: white;
  border: 2px solid transparent;

  /* Shape */
  border-radius: 6px;
  cursor: pointer;

  /* Transition — smooth ALL state changes: */
  transition:
    background-color 0.15s ease,
    color           0.15s ease,
    border-color    0.15s ease,
    opacity         0.15s ease,
    transform       0.1s ease;
}

/* HOVER — darken slightly: */
.btn:hover:not(:disabled) {
  background: hsl(219, 79%, 52%);
}

/* FOCUS (keyboard) — ring: */
.btn:focus-visible {
  outline: 3px solid cornflowerblue;
  outline-offset: 3px;
  background: hsl(219, 79%, 52%);
}

/* ACTIVE — press effect: */
.btn:active:not(:disabled) {
  transform: scale(0.97);
  background: hsl(219, 79%, 42%);
}

/* DISABLED — muted: */
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* LOADING — still disabled, shows spinner-like text: */
.btn--loading {
  position: relative;
  color: transparent;   /* hide the text */
}

.btn--loading::after {
  content: '⟳';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### CSS AND SEE

**You should see:** Three buttons:
- Default: blue, responds to hover (darker) and click (shrinks slightly)
- Loading: blue with a spinning arrow, disabled (not clickable)
- Disabled: faded blue, `cursor: not-allowed`

Tab through the buttons with keyboard. When focus lands on "Default", a blue outline
ring should appear — that is `:focus-visible`.

**Change something:** Remove `transition: ...` from `.btn`.

**Expected:** All state changes become instant — hover goes from blue to darker-blue
with no animation. Add it back. The transition makes the state change feel smooth
and intentional instead of jarring.

**Change something else:** Change `.btn:focus-visible` to `.btn:focus`.

**Expected:** Click the button with the mouse. A focus ring appears even on mouse clicks —
which looks wrong. `.focus-visible` is smarter: it only shows the ring when keyboard
navigation triggered the focus.

---

## Concept: CSS Transitions — Smooth State Changes

**What it is:** `transition` defines how CSS property changes animate between their
old and new values.

**Syntax:**

```css
transition: property duration timing-function delay;

/* Single property: */
transition: background-color 0.2s ease;

/* Multiple properties: */
transition:
  background-color 0.15s ease,
  transform        0.1s ease;

/* All properties (expensive — avoid): */
transition: all 0.2s ease;
```

**The timing functions:**

| Value | Description | Use when |
|---|---|---|
| `ease` | Slow in, fast middle, slow out | Most UI interactions |
| `ease-in` | Starts slow, speeds up | Elements exiting (fade out) |
| `ease-out` | Starts fast, slows down | Elements entering (drop in) |
| `linear` | Constant speed | Loading spinners, progress bars |
| `ease-in-out` | Symmetric: slow-fast-slow | Page transitions |

**The rule:** Transitions should be short for interactions (100–200ms) and moderate for
animations (200–400ms). Longer than 400ms feels sluggish for button interactions.

**Why `transition: all` is dangerous:**

`all` transitions every property that changes. If you change `display` or `position`,
unexpected animations occur. If you add more states later, they all animate unexpectedly.
Name exactly which properties should transition.

**You will see this again in:**
- CSS animations (`@keyframes`) — like the spinner above — are for looping or complex
  multi-step animations; `transition` is for A→B state changes
- React: CSS transitions work perfectly in React components because the class/state
  change triggers the same pseudo-class or property change

---

## Step 3 — Input States

Build a form input with all validation states:

```html
<h2 style="margin-top: var(--space-6);">Input states:</h2>   <!-- ← add -->

<div style="display: flex; flex-direction: column; gap: var(--space-4);">

  <!-- Default -->
  <div class="field">
    <label class="field__label">Email address</label>
    <input class="field__input" type="email" placeholder="you@example.com">
  </div>

  <!-- Error state — use data attribute to set state: -->
  <div class="field" data-state="error">
    <label class="field__label">Email address</label>
    <input class="field__input" type="email" value="not-an-email" aria-describedby="email-error">
    <span class="field__message" id="email-error">Please enter a valid email address.</span>
  </div>

  <!-- Success state: -->
  <div class="field" data-state="success">
    <label class="field__label">Username</label>
    <input class="field__input" type="text" value="johndoe">
    <span class="field__message">Username is available!</span>
  </div>

  <!-- Disabled: -->
  <div class="field">
    <label class="field__label">Account type</label>
    <input class="field__input" type="text" value="Professional" disabled>
  </div>

</div>
```

Add to `<style>`:

```css
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #444;
}

.field__input {
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-family: inherit;
  color: #1a1a1a;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
}

/* Focus state — ring: */
.field__input:focus {
  outline: none;
  border-color: cornflowerblue;
  box-shadow: 0 0 0 3px hsl(219 79% 66% / 0.3);
}

/* Disabled: */
.field__input:disabled {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

/* Error state — use data attribute on the parent: */
.field[data-state="error"] .field__input {
  border-color: #c0392b;
}
.field[data-state="error"] .field__input:focus {
  box-shadow: 0 0 0 3px hsl(0 65% 45% / 0.2);
}
.field[data-state="error"] .field__message {
  color: #c0392b;
  font-size: 0.8125rem;
}

/* Success state: */
.field[data-state="success"] .field__input {
  border-color: #27ae60;
}
.field[data-state="success"] .field__message {
  color: #27ae60;
  font-size: 0.8125rem;
}

.field__message {
  font-size: 0.8125rem;
  color: #666;
}
```

### CSS AND SEE

**You should see:** Four inputs with distinct visual states:
- Default: gray border, focus gives blue ring
- Error: red border and message
- Success: green border and message
- Disabled: gray background, no cursor

**Why data attributes for state instead of classes?**

`data-state="error"` vs `class="field field--error"`. Either works.
Data attributes are cleaner when the state is controlled by JavaScript (you set
`element.dataset.state = 'error'` in one line). Classes require
`classList.remove('field--default')` and `classList.add('field--error')`.
Design systems like Radix UI use data attributes for all component states.

---

## 🎯 Challenge: Build a Toggle Switch

**Task:** Create a toggle switch that:
1. Visually looks like a sliding toggle (pill-shaped track, circular handle)
2. Shows "off" state (gray track, handle on left)
3. Animates to "on" state (green track, handle on right) when the checkbox is checked
4. Works with keyboard (tabbing + spacebar)
5. No JavaScript — CSS only using `:checked` pseudo-class

---

<details>
<summary>▶ Show Solution</summary>

```html
<h2 style="margin-top: var(--space-6);">Toggle Switch:</h2>

<label class="toggle" style="display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer; user-select: none;">
  <!-- The hidden checkbox provides the state: -->
  <input type="checkbox" class="toggle__input" style="position: absolute; opacity: 0; width: 0; height: 0;">
  <!-- The visual toggle: -->
  <span class="toggle__track"></span>
  <span style="font-size: 0.9375rem;">Enable notifications</span>
</label>

<style>
  .toggle__track {
    position: relative;
    width: 44px;
    height: 24px;
    background: #ccc;
    border-radius: 99px;
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  /* The handle (::after pseudo-element): */
  .toggle__track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
  }

  /* When checked: green track */
  .toggle__input:checked + .toggle__track {
    background: #27ae60;
  }

  /* When checked: slide the handle right */
  .toggle__input:checked + .toggle__track::after {
    transform: translateX(20px);
  }

  /* Focus ring on the track for keyboard navigation: */
  .toggle__input:focus-visible + .toggle__track {
    outline: 3px solid cornflowerblue;
    outline-offset: 2px;
  }
</style>
```

**Key insight:** The trick is using the `<input type="checkbox">` for state (checked/unchecked)
but hiding it visually. The adjacent sibling combinator `+` targets the `.toggle__track`
when `.toggle__input:checked` is true. No JavaScript. The checkbox's `:checked`
pseudo-class IS the state — CSS reads it directly.

The handle's movement: `transform: translateX(20px)` moves it from left to right.
`transition: transform 0.2s ease` makes it slide. The track colour transitions with
`transition: background 0.2s ease`.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Hover state | Button darkens on mouse over |
| `:focus-visible` | Tab to button — ring appears; mouse click — ring does not |
| Active state | Button shrinks slightly while pressed |
| Disabled opacity | Disabled button is faded; cursor is not-allowed |
| Loading spinner | Loading button shows spinning icon; text is hidden |
| Transition | Remove transition — state changes become instant/jarring |
| Input error state | Red border + red message on error field |
| Input focus ring | Focus shows `box-shadow` ring, not default browser outline |

---

## Quick Check Answers

**1. `cursor: not-allowed` but no `pointer-events: none`. Can user click it?**

Yes, the user can still click it — `cursor: not-allowed` only changes the cursor shape.
JavaScript `click` events still fire. `pointer-events: none` is what actually prevents
all pointer interactions (hover, click, etc.). For a disabled button, use both: the HTML
`disabled` attribute prevents JavaScript events AND applies `:disabled` pseudo-class styles;
`cursor: not-allowed` communicates the state visually.

**2. `:focus` vs `:focus-visible`?**

`:focus` applies whenever an element has focus — including when the user clicks it with a
mouse. This causes focus rings to appear on mouse clicks, which is visually noisy and
generally unexpected. `:focus-visible` uses browser heuristics to determine if the focus
should be visible — it shows the ring when the user is navigating by keyboard (tab, arrows)
but not when they click with a mouse. Modern accessibility guidelines recommend using
`:focus-visible` and removing the browser default `:focus` outline styles, replacing them
with `:focus-visible` styles.

**3. `transition: background-color 0.2s`. Works on hover. Does mouseout also animate?**

Yes. `transition` describes how a property changes between ANY two states — not just hover-in.
When the mouse leaves, the `background-color` transitions back to its default value using
the same timing. You do not need additional CSS for the reverse transition. If you want
different timings for hover-in vs hover-out, you put the `transition` in both the base
style and the `:hover` style with different values — the active rule's transition applies.
