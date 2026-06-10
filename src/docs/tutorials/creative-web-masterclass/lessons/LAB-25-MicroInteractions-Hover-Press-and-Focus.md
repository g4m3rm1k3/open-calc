# Creative Web Masterclass — LAB 25 — Micro-Interactions: Hover, Press, and Focus

**Prerequisites:** LAB-24. You have the color system. This lab adds UI polish through CSS.

**What this lab adds:**
- Hover states — subtle lift, color shift, and glow
- `:active` press states — tactile feedback on click
- `:focus-visible` — accessible keyboard focus rings
- CSS `transition` layering — multiple properties animating together
- Button variants, icon buttons, card interactions

**Time:** 40–55 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  [Primary Btn]  [Secondary]  [Ghost]  [Icon ↗]       │
 │  ↑ hover: lift + glow    press: push down             │
 │                                                      │
 │  ┌─────────────────┐  ← card: hover lifts + glows    │
 │  │ Project Title   │                                 │
 │  │ Description...  │                                 │
 │  │ [View →]        │                                 │
 │  └─────────────────┘                                 │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. CSS `:hover` works on any element. Why is it important to also handle `:focus-visible`
>    for keyboard users?
> 2. What is the difference between `:focus` and `:focus-visible`?
> 3. A button has `transition: background 0.2s ease`. If you add a hover state that also
>    changes `transform` (lift), do you need to add `transform` to the transition property?
>
> *(Answers at the end)*

---

## Concept: The Micro-Interaction Pattern

**What it is:** A micro-interaction is a small, instant, purposeful response to user
action. It confirms that the UI received the input and hints at what will happen.

The three micro-interaction states every interactive element needs:

| State | Trigger | What it communicates |
|---|---|---|
| `:hover` | Mouse over | "This is interactive" |
| `:active` | Mouse button held down | "I received your press" |
| `:focus-visible` | Keyboard tab | "This is selected for keyboard input" |

Without all three: mouse users might get hover states but keyboard users see no feedback.
Screen readers and assistive technology users navigate by keyboard — focus states are
not cosmetic.

---

## Concept: Box Shadow for Glow and Lift

**What it is:** `box-shadow` creates depth cues and glows. For lift, add a colored shadow
below the element. For glow, add a large, blurred, transparent shadow of the same color
as the element.

```css
/* Base: no shadow */
.btn { box-shadow: none; }

/* Hover: lift (shadow below) + glow (colored spread) */
.btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),            /* shadow below */
    0 0 0 0px rgba(108, 99, 255, 0),           /* glow: zero size */
    0 8px 24px rgba(108, 99, 255, 0.3);        /* colored glow */
}

/* Press: push down — reverse the lift */
.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
```

The `:active` state reverses the lift — `translateY(0)` and smaller shadow — giving
tactile "press down" feedback.

---

## Concept: `:focus-visible` vs `:focus`

**What it is:** `:focus` activates whenever an element receives focus — including when
clicking with a mouse. `:focus-visible` activates only when the browser determines focus
should be visible — keyboard navigation, not mouse clicks.

```css
/* Modern approach: only show focus ring for keyboard navigation */
.btn:focus { outline: none; }          /* remove default focus ring for all focus */
.btn:focus-visible {                   /* restore focus ring for keyboard users */
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}
```

This gives mouse users a clean experience (no outline on click) while preserving
accessibility for keyboard users (clear focus indicator).

---

## Step 1 — Create Files

`projects/lab-25/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 25 — Micro-Interactions</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="demo-page">

      <section class="demo-section">
        <h2>Button Variants</h2>
        <p>Hover, press, and tab through each button.</p>
        <div class="btn-row">
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-ghost">Ghost</button>
          <button class="btn btn-danger">Danger</button>
          <button class="btn btn-icon" aria-label="Open link">↗</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>Interactive Cards</h2>
        <div class="card-row">
          <article class="project-card">
            <div class="card-tag">Three.js</div>
            <h3>3D Particle Field</h3>
            <p>Mouse-interactive particle system with repulsion forces.</p>
            <a href="#" class="card-link">View Project <span>→</span></a>
          </article>
          <article class="project-card">
            <div class="card-tag">Canvas 2D</div>
            <h3>Scroll Parallax</h3>
            <p>Two-layer parallax with lerp smoothing and fade.</p>
            <a href="#" class="card-link">View Project <span>→</span></a>
          </article>
          <article class="project-card">
            <div class="card-tag">CSS</div>
            <h3>Color System</h3>
            <p>HSL-based design token system with live theme switching.</p>
            <a href="#" class="card-link">View Project <span>→</span></a>
          </article>
        </div>
      </section>

      <section class="demo-section">
        <h2>Form Inputs</h2>
        <form class="demo-form">
          <label class="field">
            <span class="field-label">Your Name</span>
            <input type="text" placeholder="Enter your name" class="input">
          </label>
          <label class="field">
            <span class="field-label">Message</span>
            <textarea placeholder="What are you building?" class="input" rows="3"></textarea>
          </label>
          <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
      </section>

    </div>
  </body>
</html>
```

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: hsl(244, 95%, 65%);
  --color-primary-dark: hsl(244, 80%, 50%);
  --color-secondary: hsl(240, 18%, 22%);
  --color-danger: hsl(8, 90%, 62%);
  --color-bg: hsl(240, 20%, 8%);
  --color-surface: hsl(240, 18%, 13%);
  --color-border: hsl(240, 14%, 22%);
  --color-text: hsl(240, 5%, 94%);
  --color-muted: hsl(240, 8%, 42%);
}

body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }

.demo-page { max-width: 900px; margin: 0 auto; padding: 60px 24px; display: flex; flex-direction: column; gap: 64px; }

.demo-section h2 { margin: 0 0 8px 0; font-size: 1.25rem; color: var(--color-text); }
.demo-section > p { margin: 0 0 24px 0; color: var(--color-muted); font-size: 0.9rem; }

/* ---- Buttons ---- */
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

.btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  /* Transition ALL properties that change on hover/active */
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.12s ease;
}

.btn:focus { outline: none; }
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* Primary */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.35), 0 1px 4px rgba(0,0,0,0.3);
}
.btn-primary:active { transform: translateY(0); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }

/* Secondary */
.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-secondary:hover {
  background: hsl(240, 18%, 28%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.btn-secondary:active { transform: translateY(0); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-ghost:hover {
  background: rgba(108, 99, 255, 0.1);
  transform: translateY(-2px);
}
.btn-ghost:active { transform: translateY(0); background: rgba(108, 99, 255, 0.2); }

/* Danger */
.btn-danger {
  background: var(--color-danger);
  color: white;
}
.btn-danger:hover {
  background: hsl(8, 90%, 55%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35);
}
.btn-danger:active { transform: translateY(0); }

/* Icon button */
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-2px) rotate(15deg);   /* rotate adds character to the icon */
  box-shadow: 0 4px 16px rgba(108,99,255,0.3);
}
.btn-icon:active { transform: translateY(0) rotate(0); }

/* ---- Project cards ---- */
.card-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }

.project-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 28px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(108,99,255,0.3);
  border-color: rgba(108, 99, 255, 0.4);
}

.project-card:active { transform: translateY(-1px); }

.card-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: rgba(108,99,255,0.1);
  border-radius: 4px;
  padding: 3px 8px;
  margin-bottom: 14px;
}

.project-card h3 { margin: 0 0 8px 0; font-size: 1.1rem; }
.project-card p { margin: 0 0 20px 0; color: var(--color-muted); font-size: 0.88rem; line-height: 1.5; }

.card-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.15s ease;   /* animate only the gap — arrow slides away from text */
}

.card-link:hover { gap: 8px; }   /* arrow moves right on hover */
.card-link:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; border-radius: 2px; }

/* ---- Form inputs ---- */
.demo-form { display: flex; flex-direction: column; gap: 20px; max-width: 480px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.85rem; color: var(--color-muted); font-weight: 500; }

.input {
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  resize: vertical;
}

.input::placeholder { color: var(--color-muted); }

.input:hover { border-color: hsl(240, 14%, 30%); }

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2);   /* soft glow ring */
}
```

The card's `.card-link:hover { gap: 8px }` is a subtle trick — the `→` arrow moves right
because the gap between the text and the arrow widens. The `transition: gap 0.15s ease`
makes it animate. This is "micro" — barely noticeable, but very polished.

---

> **CSS AND SEE**
>
> **You should see:** All button variants, three project cards, and a form. Hover each button
> — they lift and glow. Press them — they push down. Tab through with the keyboard — a
> visible focus ring appears (outline, not box-shadow). Hover the cards — they lift with a
> glow border. Hover the "View Project →" link — the arrow slides away from the text.

---

## 🎯 Challenge: Loading State

**You know:** CSS transitions, `:active`, JavaScript click events.

**Task:** When the "Send Message" submit button is clicked, it should enter a "loading" state:
1. Change its text to "Sending..." 
2. Change its background to a muted color
3. Add a CSS `@keyframes` spinning border using `border-top-color` animation
4. Disable the button so it cannot be clicked again
5. After 2 seconds (use `setTimeout`), reset it to "Send Message"

---

<details>
<summary>▶ Show Solution</summary>

In `styles.css` add:
```css
.btn-loading {
  background: var(--color-secondary) !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
```

Create `main.js`:
```js
const form = document.querySelector('.demo-form');
const submitBtn = form.querySelector('[type="submit"]');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  submitBtn.textContent = 'Sending...';
  submitBtn.classList.add('btn-loading');
  submitBtn.disabled = true;

  setTimeout(function () {
    submitBtn.textContent = 'Send Message';
    submitBtn.classList.remove('btn-loading');
    submitBtn.disabled = false;
  }, 2000);
});
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Buttons lift on hover | Hover button — it moves up 2px |
| Buttons push down on click | Hold mouse button — button moves down |
| Focus ring visible on tab | Tab through page — focused element has outline |
| Card glow on hover | Hover card — border glows purple |
| Arrow slides on hover | Hover "View Project →" — arrow moves right |
| Input focus ring | Click input — soft purple glow ring appears |

---

## What's Next

LAB 26 covers visual hierarchy — using size, contrast, and spacing to guide the viewer's
eye through a page. This is the design principle behind professional portfolio layouts.

---

## Quick Check Answers

**1. Why handle `:focus-visible` for keyboard users?**
Not all users have mice. Keyboard users navigate by pressing Tab. Without a visible
`:focus` indicator, they cannot tell which element is currently selected — making the
UI unusable. The `:focus-visible` pseudo-class provides focus feedback only when the
browser detects keyboard navigation, so the ring only appears when it is needed.

**2. `:focus` vs `:focus-visible`?**
`:focus` activates on any focus event — mouse click, keyboard Tab, programmatic
`.focus()` calls. A mouse user clicking a button triggers `:focus` even though they do
not need a focus ring (they can see where they clicked). `:focus-visible` only activates
when the browser determines the user is navigating by keyboard. Modern approach: use
`:focus { outline: none }` to remove the default ring, then `:focus-visible { outline: ... }`
to restore it only for keyboard navigation.

**3. Do you need to add `transform` to the transition list?**
Yes. `transition: background 0.2s ease` only animates `background`. If the `:hover` state
also changes `transform`, that change will be instantaneous (not animated) unless you add
`transform` to the transition property. The cleanest approach: list every property that
changes on hover/active: `transition: background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease`.
