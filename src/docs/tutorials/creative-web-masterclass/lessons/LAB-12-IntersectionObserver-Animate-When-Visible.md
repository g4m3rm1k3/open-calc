# Creative Web Masterclass — LAB 12 — IntersectionObserver: Animate When Visible

**Prerequisites:** LAB-11. You know requestAnimationFrame, classList, and events.

**What this lab adds:**
- `IntersectionObserver` — a browser API that watches when elements enter or leave the viewport
- The observer pattern: create once, watch many elements, react to changes
- Scroll-triggered entrance animations without listening to the scroll event
- A page where sections animate in as you scroll down

**Time:** 45–60 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  Section 1   ← already visible, fully opaque         │
 │                                                      │
 │                                                      │
 │  Section 2   ← partially scrolled in, mid-fade       │
 │                                                      │
 └──────────────────────────────────────────────────────┘
   Scroll down →
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │  Section 3   ← just crossed threshold, animating in  │
 │                                                      │
 │  Section 4   ← invisible, below viewport             │
 └──────────────────────────────────────────────────────┘
```

Each section starts invisible and shifted down. When it scrolls into view, it fades
up into position.

---

> **Quick Check — answer before reading further:**
>
> 1. If you wanted to trigger an animation when an element scrolls into view, the naive
>    approach is: listen to the `scroll` event and check `element.getBoundingClientRect()`
>    every scroll event. What is the problem with this approach?
> 2. What does "observer pattern" mean? What two things is an observer watching for?
> 3. What might "threshold: 0.2" mean for an IntersectionObserver?
>
> *(Answers at the end)*

---

## Concept: `IntersectionObserver`

**What it is:** `IntersectionObserver` is a browser API that calls a callback whenever a
watched element crosses a visibility threshold — for example, when it first enters the
viewport, or when 50% of it becomes visible. It replaces the pattern of listening to `scroll`
events and manually checking element positions.

**The problem before:**

```js
// The naive approach — listening to scroll events
window.addEventListener('scroll', function () {
  elements.forEach(function (el) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('is-visible');  // element is in view
    }
  });
});
```

This fires on *every scroll event* — which can be dozens per second while the user scrolls.
For each event, every element is measured (`getBoundingClientRect` forces the browser to
calculate layout). On a page with 50 elements, that is 50 layout recalculations per scroll
event, potentially hundreds per second. The page stutters.

**The solution:**

```js
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
});

observer.observe(someElement);
```

The browser handles the geometry checks internally — in native code, off the main thread.
Your callback only fires when something *changes*. If nothing new enters or leaves the
viewport, the callback is never called.

**What it hides:** The intersection math, the scroll position tracking, the layout
calculations. You see only "entering" or "leaving." The browser does the geometry.

**Canonical example:**

- **Real-world analogy:** A security camera with motion detection. You do not watch a live
  feed constantly — the camera only alerts you when something *moves*. `IntersectionObserver`
  alerts you only when elements *cross a threshold*.
- **Minimal form:**
  ```js
  const observer = new IntersectionObserver(callback);
  observer.observe(element);
  ```
- **Why obvious:** Without `observer.observe(element)` the callback never fires — the
  observer exists but watches nothing. Call `observe` on each element you want to track.

**Project Application:**
The portfolio (LAB-27, LAB-28) uses IntersectionObserver to trigger section entrance
animations and to highlight the correct nav item as each section scrolls into view.

**Watch for:** The callback receives an `entries` array, not a single entry. Each call may
report multiple elements at once (if several cross the threshold in the same frame). Always
loop over `entries`.

---

## Concept: The `IntersectionObserverEntry`

**What it is:** Each item in the `entries` array is an `IntersectionObserverEntry`. It tells
you which element changed and what happened to it.

The properties you will use:

| Property | Type | Meaning |
|---|---|---|
| `entry.target` | Element | The DOM element being observed |
| `entry.isIntersecting` | boolean | `true` if entering viewport, `false` if leaving |
| `entry.intersectionRatio` | number (0–1) | What fraction of the element is visible |

**Canonical example:**

```js
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    // entry.target  — which element
    // entry.isIntersecting  — is it visible?
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);  // stop watching once animated in
    }
  });
});
```

`observer.unobserve(entry.target)` stops watching an element after it has animated in —
because the animation only needs to happen once, and watching unnecessary elements wastes
memory.

**Watch for:** `entry.isIntersecting` is `false` on the initial observation call if the
element is below the fold. You only get `true` once it actually enters.

---

## Concept: Observer Options

**What it is:** `IntersectionObserver` takes an optional second argument — an options object
that controls when the callback fires.

```js
const observer = new IntersectionObserver(callback, {
  threshold: 0.15,   // fire when 15% of the element is visible
  rootMargin: '0px'  // no margin adjustment
});
```

**`threshold`:** A number from 0 to 1. `0` means "fire as soon as any pixel appears."
`0.5` means "fire when 50% is visible." `1` means "only fire when the whole element is
in view." For entrance animations, `0.1`–`0.2` works well — the animation triggers early
enough to feel natural.

**`rootMargin`:** Shrinks or expands the effective viewport. `rootMargin: '-10% 0px'`
means "only count as intersecting when the element is at least 10% inside the viewport" —
useful for making animations trigger a little later.

**Watch for:** `threshold` can also be an array: `[0, 0.25, 0.5, 0.75, 1]` — the callback
fires at each threshold crossing. This is used for progress effects but not needed here.

---

## Step 1 — Create Files

`projects/lab-12/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 12 — IntersectionObserver</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <header class="site-header">
      <h1>Scroll Down</h1>
      <p>Each section animates in when it enters the viewport.</p>
    </header>

    <main class="page-content">

      <section class="reveal-section">
        <h2>Section One</h2>
        <p>This section is visible on page load — it starts already in the viewport.</p>
      </section>

      <section class="reveal-section">
        <h2>Section Two</h2>
        <p>This one enters from below as you scroll.</p>
      </section>

      <section class="reveal-section">
        <h2>Section Three</h2>
        <p>Each section has the same entrance animation — fade up from below.</p>
      </section>

      <section class="reveal-section">
        <h2>Section Four</h2>
        <p>The observer watches all sections at once. You only write one observer.</p>
      </section>

      <section class="reveal-section">
        <h2>Section Five</h2>
        <p>Once a section animates in, the observer stops watching it — no wasted work.</p>
      </section>

    </main>

    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** All five sections stacked vertically with plain text, no styling.
> Scroll — no animations yet.

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

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

/* ---- Header ---- */
.site-header {
  height: 100vh;                  /* takes the full viewport — forces the user to scroll */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.site-header h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  margin: 0 0 16px 0;
  color: var(--color-primary);
}

.site-header p { color: var(--color-muted); margin: 0; }

/* ---- Page content ---- */
.page-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  gap: 80px;              /* large gap — each section is clearly separated */
}

/* ---- Sections: hidden state ---- */
.reveal-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 48px 40px;

  /* Hidden state: invisible AND shifted 40px down */
  opacity: 0;
  transform: translateY(40px);

  /* Transition: when is-visible is added, both properties animate */
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* ---- Sections: visible state ---- */
.reveal-section.is-visible {
  opacity: 1;
  transform: translateY(0);   /* back to natural position */
}

.reveal-section h2 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: var(--color-primary);
}

.reveal-section p { margin: 0; color: var(--color-muted); line-height: 1.6; }
```

Two CSS rules do all the visual work:
- `.reveal-section`: hidden state — `opacity: 0` and shifted down 40px. Also has a
  `transition` so changes to those properties animate smoothly.
- `.reveal-section.is-visible`: visible state — `opacity: 1` and back to `translateY(0)`.

JavaScript adds the `is-visible` class. The CSS handles the animation automatically when
the class is added. This separation is the right pattern: **JavaScript manages state,
CSS manages appearance.**

---

> **CSS AND SEE**
>
> **You should see:** A full-height header saying "Scroll Down." The five sections are
> invisible — they have `opacity: 0` — so the page looks empty below the header. That is
> correct. The sections exist but are hidden.
>
> **In DevTools:** Inspect one `.reveal-section`. You will see `opacity: 0` and
> `transform: translateY(40px)`. In the Styles panel, manually check the `is-visible` class
> to see the section appear and slide up. Uncheck it to hide it again.

---

## Step 3 — Create the Observer and Observe All Sections

`main.js`:

```js
// Select all sections — querySelectorAll returns a NodeList
const sections = document.querySelectorAll('.reveal-section');

// Create one observer that handles all sections
const observer = new IntersectionObserver(
  function (entries) {
    // entries is an array — multiple sections can cross the threshold at once
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // The section has entered the viewport — animate it in
        entry.target.classList.add('is-visible');
        // Stop watching this section — the animation only needs to happen once
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15   // fire when 15% of the section is visible
  }
);

// Tell the observer to watch each section
sections.forEach(function (section) {
  observer.observe(section);
});
```

Reading this in three parts:
1. **Create the observer:** `new IntersectionObserver(callback, options)`. The callback
   fires when observed elements cross the 15% threshold.
2. **In the callback:** For each entry that is intersecting, add `is-visible` and stop
   watching it (`unobserve`).
3. **Start observing:** Loop over all sections and call `observer.observe(section)`. Without
   this step, the callback never fires.

---

> **SAVE AND TRY**
>
> **You should see:** When you open the page, the header fills the screen. The first section
> (Section One) is invisible — it is just below the fold. As you scroll down, each section
> fades up into view. Once a section is visible, it stays visible.
>
> **In DevTools:** Open the Elements panel. Scroll down to Section One. Watch the class
> attribute — when the section enters the viewport, `is-visible` appears automatically.
>
> **Change something:** Change `threshold: 0.15` to `threshold: 0.5`. Reload and scroll.
> The animation now triggers later — when half the section is visible. Change back to `0.15`.

---

## Step 4 — Add Staggered Delay

Right now all sections animate at the same speed. Adding a `transition-delay` based on
the section's index makes sections that appear together animate in sequence — a "stagger."

Update `main.js`:

```js
const sections = document.querySelectorAll('.reveal-section');

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Get the element's index from its data-index attribute
        const delay = entry.target.dataset.index * 0.1;   // 0s, 0.1s, 0.2s, 0.3s, 0.4s
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// Set data-index on each section so the callback can read the index
sections.forEach(function (section, index) {
  section.dataset.index = index;
  observer.observe(section);
});
```

`section.dataset.index = index` writes a `data-index` attribute to each section element.
`entry.target.dataset.index` reads it back inside the callback. The delay is the index
multiplied by 0.1 seconds — so section 0 has no delay, section 1 delays 0.1s, section 2
delays 0.2s, and so on.

This only matters when multiple sections enter the viewport at the same time (for example,
on a large monitor where several sections are visible at once). They animate in one by one
instead of all at once.

---

> **SAVE AND TRY**
>
> **You should see:** Sections still animate in on scroll. If you reload and the first section
> is visible alongside the second, they animate in sequence with a slight stagger.
>
> **Verify:** Open DevTools → Elements. Scroll to where two sections are both in view at
> load time (zoom out the browser window to make them fit). Watch both `data-index` attributes
> appear and `is-visible` classes get added in quick succession.

---

## 🎯 Challenge: Animate From the Left

**You know:** IntersectionObserver, CSS transitions, classList, data attributes.

**Task:** Add a second group of "feature cards" to the page that animate in from the
*left side* instead of from below. These should use a separate CSS class (`slide-in-card`)
and animate via `transform: translateX(-60px)` → `translateX(0)`.

**HTML to add inside `.page-content`:**
```html
<div class="feature-row">
  <div class="slide-in-card" data-label="Performance">Loads in under 1 second.</div>
  <div class="slide-in-card" data-label="Design">Pixel-perfect on every screen.</div>
  <div class="slide-in-card" data-label="Code">Clean, maintainable JavaScript.</div>
</div>
```

**Hint:** Create a second `IntersectionObserver` (or extend the first one) to observe the
`.slide-in-card` elements separately from the `.reveal-section` elements.

---

<details>
<summary>▶ Show Solution</summary>

In `styles.css` add:
```css
.feature-row { display: flex; gap: 16px; }

.slide-in-card {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  color: var(--color-muted);
  font-size: 0.9rem;
  opacity: 0;
  transform: translateX(-60px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.slide-in-card.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.slide-in-card::before {
  content: attr(data-label);   /* reads the data-label attribute as content */
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
```

In `main.js` add:
```js
const cards = document.querySelectorAll('.slide-in-card');

const cardObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.index * 0.12;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('is-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

cards.forEach(function (card, index) {
  card.dataset.index = index;
  cardObserver.observe(card);
});
```

**Key insight:** Each observer is independent — the section observer and card observer run
separately with their own thresholds and callbacks. You can have as many observers as needed.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Sections are hidden on load | Open page — only header visible, no sections below |
| Sections animate in on scroll | Scroll down — each section fades and slides up |
| Once visible, sections stay visible | Scroll back up — sections remain opaque |
| Stagger works when multiple visible | Reload, zoom out — multiple sections stagger |
| `unobserve` called after animation | DevTools Performance — observer fires fewer times |

---

## What's Next

LAB 13 adds scroll parallax — two layers that move at different speeds as you scroll,
creating a sense of depth. You will use `window.scrollY` and `requestAnimationFrame`
together for the first time.

---

## Transfer Exercise

`IntersectionObserver` was designed to replace a specific pattern. Find three real-world
uses of IntersectionObserver beyond entrance animations: infinite scroll, lazy-loading images,
and sticky header detection. For each one, describe which `isIntersecting` event (entering
or leaving) triggers the behavior, and what happens when it fires.

---

## Quick Check Answers

**1. Why is listening to the scroll event for visibility checks bad?**
The `scroll` event fires many times per second while scrolling — potentially 60+ times.
For each event, calling `getBoundingClientRect()` on multiple elements forces the browser
to perform synchronous layout recalculation. On a page with many elements, this can block
the main thread and cause visible stuttering. `IntersectionObserver` offloads geometry
tracking to native browser code and only calls JavaScript when something changes.

**2. What does "observer pattern" mean?**
An observer pattern has two roles: a *subject* (the thing being watched) and an *observer*
(the watcher). The observer registers interest in the subject. When the subject changes
state, it notifies all registered observers. `IntersectionObserver` watches DOM elements
(subjects) and notifies a callback (observer) when their visibility changes.

**3. What does `threshold: 0.2` mean?**
The observer fires the callback when at least 20% of the observed element is visible
within the viewport. Below 20%, the element is considered not intersecting. This prevents
animations from triggering the instant a single pixel appears — the element needs to
be meaningfully visible first.
