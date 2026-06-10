# Junior to Senior — T12·L15 — Accessibility

**Prerequisites:** T12·L14 (Responsive Design). You can build responsive layouts.
This lesson teaches CSS accessibility — not ARIA, not semantic HTML, but specifically
the CSS decisions that make interfaces usable by keyboard, screen reader, and
low-vision users.

**What this lab adds:**
- Why `outline: none` is one of the most harmful CSS rules
- `:focus-visible` — the modern approach to focus indicators
- `prefers-reduced-motion` — respecting users who cannot tolerate animation
- Contrast ratio requirements and how to test them
- `visually-hidden` — hiding content from screens but not screen readers
- Skip links — keyboard navigation for long pages
- `pointer-events` and `user-select` accessibility implications

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A developer removes `outline: none` from all focusable elements. Who does this hurt?
>    What percentage of web users navigate by keyboard?
> 2. A loading spinner has `animation: spin 0.5s linear infinite`. A user has
>    `prefers-reduced-motion: reduce` set in their OS. Why might this animation
>    specifically harm them?
> 3. `display: none` vs `visibility: hidden` vs the `.visually-hidden` technique.
>    Which one hides content visually but keeps it accessible to screen readers?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Accessibility is often treated as a checkbox — add `alt` text, use semantic HTML, done.
But CSS makes or breaks accessibility independently of HTML. A button with correct ARIA
labels is still inaccessible if its focus state is invisible. An animation is inaccessible
if it triggers vestibular disorder symptoms. A contrast ratio of 2:1 is inaccessible for
low-vision users even if the text is perfectly readable for others.

This lesson covers the CSS layer of accessibility — the decisions only you can make.

---

## Step 1 — The Focus Indicator Problem

Create `accessibility.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.5rem;
    }

    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 var(--space-4); }

    /* THE WORST CSS RULE EVER WRITTEN: */
    /* * { outline: none; } */

    .btn {
      padding: var(--space-2) var(--space-4);
      background: cornflowerblue;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h2>Focus test — tab through these:</h2>
  <button class="btn">Button One</button>
  <button class="btn" style="margin-left: 12px;">Button Two</button>
  <a href="#section">Jump to section</a>
  <input type="text" placeholder="Text field" style="margin-left: 12px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
</body>
</html>
```

### CSS AND SEE

**Tab through the elements.** Press Tab repeatedly to move focus through them.

**You should see:** Each focusable element gets the browser's default focus indicator —
usually a blue outline ring. This is the mechanism keyboard users rely on to see where
they are on the page.

**Now uncomment `* { outline: none; }` in the style.**

**Tab through again.**

**You should see:** Nothing. No focus indicator. You have no idea which element is focused.
You are navigating blind.

This is what happens on thousands of websites. `outline: none` was added to suppress
the "ugly" focus ring, with no replacement provided. Keyboard users — people who cannot
use a mouse due to motor disability — cannot use these pages.

**Fix it:** Add a custom focus style that is always visible:

```css
/* Comment out the outline: none. Add this instead: */
:focus-visible {
  outline: 3px solid cornflowerblue;
  outline-offset: 3px;
}
```

**Tab through again.** Focus is visible. It no longer appears on mouse clicks (`:focus-visible`
uses browser heuristics to hide the ring on pointer interactions).

---

## Concept: Focus Indicators — The CSS Rules

**The WCAG 2.1 AA requirements for focus indicators:**

1. **Visible:** There MUST be a visible focus indicator on all focusable elements
2. **Contrast:** The focus indicator must have a 3:1 contrast ratio against adjacent colours
3. **Non-suppression:** `outline: none` without a replacement is a WCAG failure

**The correct pattern:**

```css
/* Remove the default and replace — never just remove: */
:focus-visible {
  outline: none;                      /* remove browser default */
  box-shadow: 0 0 0 3px cornflowerblue;  /* replace with custom */
}

/* For dark backgrounds, use a light ring: */
.dark-surface :focus-visible {
  box-shadow: 0 0 0 3px white;
}
```

**Why `box-shadow` instead of `outline` for custom rings:**

`outline` follows the element's shape but does NOT follow `border-radius`. A rounded button
with `border-radius: 6px` gets a square outline ring. `box-shadow` follows the shape:

```css
/* Outline — square ring even on rounded button: */
button:focus-visible { outline: 3px solid blue; }

/* Box shadow — follows border-radius: */
button:focus-visible { box-shadow: 0 0 0 3px blue; }
```

`outline-offset` also exists and works for separated rings (the ring floats outside the
element). For tight rings that follow shape: use `box-shadow`. For classic separated rings:
use `outline` + `outline-offset`.

**You will see this again in:**
- WCAG 2.2 (2023) adds stricter focus indicator requirements — the focus area must meet
  minimum size requirements
- Every accessible design system has a well-designed focus token — T12·L13's token system
  should include `--focus-ring-color` and `--focus-ring-width`

---

## Step 2 — Custom Focus Indicators

Update the styles in `accessibility.html`:

```css
/* Base: clean default — NOT outline: none (which would suppress completely) */
:focus { outline: none; }     /* removes browser default */

/* Replacement: visible, contrast-passing ring */
:focus-visible {
  outline: 3px solid cornflowerblue;
  outline-offset: 4px;
  border-radius: 3px;         /* subtle rounding on the ring */
}

/* Button: integrated ring (no offset — sits on the button) */
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px white, 0 0 0 6px cornflowerblue;  /* inner white gap + blue ring */
}
```

### CSS AND SEE

Tab through the elements. Each element now has a custom, clearly visible focus indicator.
The buttons have a double-ring (white gap + blue outer ring) that works on any background.

**Change something:** Change the `box-shadow` on `.btn:focus-visible` to use dark values:
`0 0 0 3px black, 0 0 0 6px cornflowerblue`. The white gap disappears but the blue ring
is still visible.

---

## Concept: `prefers-reduced-motion` — Respecting Motion Sensitivity

**What it is:** A CSS media feature that detects the user's operating system setting
for reduced motion. Users with vestibular disorders, epilepsy, migraines, or ADHD can
set this preference; the website must respect it.

**Vestibular disorder:** An inner-ear condition. Fast-moving or spinning animations on
screen cause real physical symptoms — nausea, dizziness, headaches. Approximately 35%
of adults over 40 have some form of vestibular disorder. A spinning loading animation
or a fast page transition is not cosmetic — it is a health concern for these users.

**The correct pattern:**

```css
/* Define animations: */
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes slide   { from { transform: translateX(-100%); } to { transform: translateX(0); } }

/* Apply animations by default: */
.spinner { animation: spin 0.8s linear infinite; }
.modal-enter { animation: slide 0.3s ease; }

/* Remove animations for users who requested reduction: */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;      /* stop the spin */
    opacity: 0.5;         /* visual feedback that loading is happening */
  }
  .modal-enter {
    animation: none;
    /* The element appears instantly instead of sliding */
  }
}
```

**The common mistake:** Setting `animation: none` on `*` in a media query block. This
works but loses the loading feedback entirely. A better approach: slow down or simplify,
do not remove entirely.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;   /* effectively instant, but not visually broken */
    transition-duration: 0.01ms !important;
  }
}
```

**When to use which:**

- Decorative animations (bouncing logos, parallax): remove entirely for `reduce`
- Progress indicators: keep a static or very slow version — complete removal confuses the user
- Page transitions: disable entirely — sudden appearance is better than a motion trigger

**You will see this again in:**
- T12·L16 (Motion and Animation): all animations include a `prefers-reduced-motion` guard
- React component libraries: Framer Motion has a `useReducedMotion()` hook

---

## Step 3 — Motion Guards

Add animated elements and guards:

```html
<h2 style="margin-top: var(--space-5);">Animation with motion guard:</h2>   <!-- ← add -->

<div style="display: flex; gap: var(--space-4); align-items: center; padding: var(--space-4); background: #f5f5f5; border-radius: 8px;">
  <div class="spinner" style="
    width: 32px; height: 32px;
    border: 3px solid #ddd;
    border-top-color: cornflowerblue;
    border-radius: 50%;
  "><!-- spinner --></div>

  <div class="slide-in" style="
    background: cornflowerblue;
    color: white;
    padding: var(--space-2) var(--space-3);
    border-radius: 4px;
  ">Notification: Job complete</div>
</div>
```

Add to CSS:

```css
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes slide { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }

.spinner    { animation: spin 0.8s linear infinite; }
.slide-in   { animation: slide 0.3s ease; }

/* Motion guard: */
@media (prefers-reduced-motion: reduce) {
  .spinner  { animation: none; border-top-color: cornflowerblue; opacity: 0.5; }
  .slide-in { animation: none; }
}
```

### CSS AND SEE

In DevTools → Rendering → "Emulate CSS media feature `prefers-reduced-motion`" → reduce.

**You should see:** The spinner stops spinning. The notification appears instantly
instead of sliding in.

---

## Concept: `visually-hidden` — Accessible Text

**What it is:** A CSS pattern that hides content VISUALLY but keeps it accessible to
screen readers. Different from `display: none` (which hides from everyone).

**When you need it:**

- An icon button with no visible text: `<button><svg>...</svg></button>` — screen readers say "button" with no label
- A label for a form section that does not fit the visual design
- Skip-to-content links that are only visible on focus

**The technique:**

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Why this pattern and not `display: none`:**

- `display: none`: hidden from everyone, including screen readers. ARIA reads nothing.
- `visibility: hidden`: same — inaccessible.
- `.visually-hidden`: the element is in the DOM, screen readers announce it, but it is
  clipped to 1px × 1px so it is not visible. `overflow: hidden` prevents the 1px from
  taking up space.

**Why not `opacity: 0`:**

Opacity-zero elements are still visible to screen readers (good) but they ALSO still
take up space and intercept click events (bad).

**The show-on-focus variant (for skip links):**

```css
.skip-link {
  position: absolute;
  top: -100px;   /* off-screen by default */
  left: 0;
  z-index: 1000;
  padding: 8px 16px;
  background: white;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;       /* slides into view on focus */
}
```

---

## Step 4 — Skip Link and Visually Hidden Labels

Add to `accessibility.html`:

```html
<!-- Skip link — add FIRST in body: -->
<a href="#main-content" class="skip-link" style="
  position: absolute;
  top: -100px;
  left: 0;
  padding: var(--space-2) var(--space-4);
  background: cornflowerblue;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 6px 0;
  z-index: 1000;
  transition: top 0.15s;
">Skip to main content</a>

<style>
  .skip-link:focus { top: 0; }
</style>

<main id="main-content">

<h2>Icon buttons with screen reader labels:</h2>
<div style="display: flex; gap: var(--space-3);">

  <button class="btn" style="width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
    <span aria-hidden="true">✕</span>    <!-- icon: hidden from screen reader -->
    <span class="visually-hidden">Close dialog</span>  <!-- accessible label -->
  </button>

  <button class="btn" style="width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
    <span aria-hidden="true">+</span>
    <span class="visually-hidden">Add new item</span>
  </button>

</div>
</main>
```

Add to CSS:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### CSS AND SEE

**Tab through the page.** The skip link appears at the top of the screen when focused —
this lets keyboard users skip the navigation and jump directly to main content.

**Enable a screen reader** (Windows Narrator: Win+Ctrl+Enter, or macOS VoiceOver: Cmd+F5)
and tab to the icon buttons. The screen reader should announce "Close dialog, button" and
"Add new item, button" — the `.visually-hidden` text is read; the icon `✕` is ignored
(because of `aria-hidden="true"`).

---

## Final Check

| Concept | How to verify |
|---|---|
| Focus indicator visible | Tab through page — every element gets a visible ring |
| `:focus-visible` not on mouse clicks | Click a button — no ring; tab to it — ring appears |
| Custom box-shadow ring | Button focus ring follows border-radius |
| `prefers-reduced-motion` | DevTools emulate reduce — spinner stops, slide is instant |
| `.visually-hidden` | Screen reader reads label; element is invisible on screen |
| Skip link | Tab once — skip link appears; press Enter — focus jumps to main content |

---

## Quick Check Answers

**1. `outline: none` on all focusable elements. Who does this hurt?**

Keyboard users — people who navigate with Tab, arrow keys, and Enter because they cannot
use a mouse (motor disabilities, power users, people in situations where a mouse is unavailable).
Approximately 7% of users navigate by keyboard. `outline: none` without a replacement means
they cannot see which element is focused and cannot navigate the page. This is a WCAG 2.1
AA failure (Success Criterion 2.4.7: Focus Visible).

**2. `animation: spin 0.5s linear infinite`. Why might this harm vestibular disorder users?**

Spinning animation triggers the vestibular system — the inner ear mechanism for balance.
People with vestibular disorders (benign paroxysmal positional vertigo, Meniere's disease,
vestibular migraine, and others) experience dizziness, nausea, and disorientation from
motion on screen. The vestibular system cannot distinguish between physical motion and
visual motion — it responds to both. A spinning animation causes the same physical symptoms
as spinning in a chair. `prefers-reduced-motion: reduce` is a medical accessibility need,
not a preference.

**3. `display: none` vs `visibility: hidden` vs `.visually-hidden`:**

`display: none`: Element is completely removed from layout and accessibility tree. Screen readers do not find it.
`visibility: hidden`: Element is invisible but occupies space. Screen readers do not read it.
`.visually-hidden`: Element is in the accessibility tree and layout, but positioned 1px × 1px, clipped to invisible. Screen readers read it. This is the technique for content that must be accessible but should not be visually rendered (icon button labels, skip link text at rest).
