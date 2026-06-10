# Creative Web Masterclass — LAB 31 — Work Section: Card Grid

**Prerequisites:** LAB-30 (portfolio with hero section complete).

**What this lab adds:**
- A real Work section replacing the LAB-30 placeholder
- CSS Grid card layout with a featured first card
- Project cards with image placeholder, tags, and a hover-reveal overlay
- Scroll-reveal animation on the cards using IntersectionObserver

**Time:** 40–50 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  Work                                                │
 │  ─────────────────────────────                       │
 │  ┌──────────────────┐  ┌───────┐  ┌───────┐         │
 │  │                  │  │       │  │       │         │
 │  │  Featured card   │  │ Card  │  │ Card  │         │
 │  │  (spans 2 rows)  │  │       │  │       │         │
 │  │                  │  └───────┘  └───────┘         │
 │  └──────────────────┘                                │
 │  ┌───────┐  ┌───────┐  ┌───────┐                    │
 │  │ Card  │  │ Card  │  │ Card  │ ← slide in on scroll│
 │  └───────┘  └───────┘  └───────┘                    │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. `grid-template-columns: 2fr 1fr 1fr` creates three columns. The first is how wide
>    relative to the others?
> 2. How do you make one grid item span two rows without changing the container?
> 3. We want each card to fade in as it scrolls into view. Should we use a CSS animation,
>    a CSS transition, or IntersectionObserver + a class toggle? What's the difference?
>
> *(Answers at the end)*

---

## Concept: CSS Grid with a Featured Card

**What it is:** CSS Grid lets you define rows and columns once on a container, then place
items into them. The `fr` unit means "fraction of remaining space":

```css
.work-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
}
```

`display: grid` turns the container into a grid. `grid-template-columns: 2fr 1fr 1fr`
creates three columns. Total space = 2 + 1 + 1 = 4 units. Column 1 gets 2/4 = 50%.
Columns 2 and 3 each get 1/4 = 25%.

`gap: 24px` sets a 24px gutter between both rows and columns in one property. Before
`gap` existed you had to use margins on children, which meant handling the last child
as a special case. `gap` eliminates that.

To make the first card span two row tracks (taller than the others):

```css
.work-card--featured {
  grid-row: span 2;
}
```

`grid-row: span 2` tells this specific item to occupy two consecutive row tracks. The
grid automatically places the remaining items into the remaining cells. No extra markup
or math required — the browser handles it.

---

## Concept: Hover Overlay

**What it is:** The overlay sits on top of the card image and is hidden (opacity 0).
On hover, it fades in. The key is `position: absolute` on the overlay inside
`position: relative` on the card:

```css
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  opacity: 0;
  transition: opacity 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.work-card:hover .card-overlay { opacity: 1; }
```

`position: absolute; inset: 0` — `inset` is a shorthand for `top: 0; right: 0; bottom: 0; left: 0`.
It stretches the overlay to exactly cover its containing block. The containing block is
`.card-image`, which has `position: relative` — that's what anchors the absolute element.

`opacity: 0` hides the overlay without removing it from the DOM. Unlike `display: none`,
opacity can be transitioned. `pointer-events` is still active when opacity is 0 — the
cursor would trigger hover on the overlay even while invisible. We don't need to disable
that here because `.work-card:hover` fires from the card itself, not the overlay.

`display: flex; align-items: center; justify-content: center` puts the overlay content
(the "View" button) dead-centre of the image.

---

## Step 1 — Update index.html (Work Section)

Open `projects/lab-30/index.html` and replace the entire work section placeholder with:

```html
<section id="work" class="port-section section-work">
  <div class="section-inner">

    <div class="section-header">
      <p class="section-eyebrow">Selected projects</p>
      <h2 class="section-title">Work</h2>
    </div>

    <div class="work-grid">

      <!-- Featured card: spans two rows, first column -->
      <article class="work-card work-card--featured" data-reveal="fade-up">
        <div class="card-image" style="background: hsl(244, 50%, 22%);">
          <div class="card-overlay">
            <a href="#" class="btn btn-primary">View Project</a>
          </div>
        </div>
        <div class="card-body">
          <div class="card-tags">
            <span class="tag">Three.js</span>
            <span class="tag">WebGL</span>
          </div>
          <h3 class="card-title">Immersive 3D Experience</h3>
          <p class="card-desc">Interactive particle system with real-time audio reactivity.</p>
        </div>
      </article>

      <article class="work-card" data-reveal="fade-up" style="--reveal-delay: 0.1s">
        <div class="card-image" style="background: hsl(175, 50%, 18%);">
          <div class="card-overlay"><a href="#" class="btn btn-primary">View</a></div>
        </div>
        <div class="card-body">
          <div class="card-tags"><span class="tag">Canvas 2D</span></div>
          <h3 class="card-title">Particle Widget</h3>
          <p class="card-desc">Mouse-reactive particle field.</p>
        </div>
      </article>

      <article class="work-card" data-reveal="fade-up" style="--reveal-delay: 0.2s">
        <div class="card-image" style="background: hsl(28, 50%, 18%);">
          <div class="card-overlay"><a href="#" class="btn btn-primary">View</a></div>
        </div>
        <div class="card-body">
          <div class="card-tags"><span class="tag">CSS</span><span class="tag">JS</span></div>
          <h3 class="card-title">CSS Animation Lab</h3>
          <p class="card-desc">Scroll-driven micro-interactions.</p>
        </div>
      </article>

      <article class="work-card" data-reveal="fade-up" style="--reveal-delay: 0.15s">
        <div class="card-image" style="background: hsl(152, 40%, 15%);">
          <div class="card-overlay"><a href="#" class="btn btn-primary">View</a></div>
        </div>
        <div class="card-body">
          <div class="card-tags"><span class="tag">Node.js</span></div>
          <h3 class="card-title">Data Dashboard</h3>
          <p class="card-desc">Real-time chart with live updates.</p>
        </div>
      </article>

      <article class="work-card" data-reveal="fade-up" style="--reveal-delay: 0.25s">
        <div class="card-image" style="background: hsl(200, 50%, 16%);">
          <div class="card-overlay"><a href="#" class="btn btn-primary">View</a></div>
        </div>
        <div class="card-body">
          <div class="card-tags"><span class="tag">Three.js</span></div>
          <h3 class="card-title">3D Product Viewer</h3>
          <p class="card-desc">Orbit-controlled model showcase.</p>
        </div>
      </article>

      <article class="work-card" data-reveal="fade-up" style="--reveal-delay: 0.35s">
        <div class="card-image" style="background: hsl(8, 45%, 16%);">
          <div class="card-overlay"><a href="#" class="btn btn-primary">View</a></div>
        </div>
        <div class="card-body">
          <div class="card-tags"><span class="tag">CSS Grid</span></div>
          <h3 class="card-title">Portfolio Template</h3>
          <p class="card-desc">This site — open source.</p>
        </div>
      </article>

    </div>
  </div>
</section>
```

Two things to notice in this HTML:

**`data-reveal="fade-up"`** on every card. This is an attribute selector pattern — CSS
can target `[data-reveal]` and the IntersectionObserver can `querySelectorAll('[data-reveal]')`.
The value `"fade-up"` describes *which* animation to use. Later you can add `"fade-left"` or
`"zoom-in"` variants by adding CSS rules for each value.

**`style="--reveal-delay: 0.1s"`** is an inline custom property. Setting a CSS variable
on an element via the `style` attribute makes it available to that element and all its
children. The CSS transition rule will use `var(--reveal-delay, 0s)` — so each card reads
its own stagger delay directly. This avoids needing `.card:nth-child(1)`, `.card:nth-child(2)`,
etc. selectors.

---

## Step 2 — Styles

Add these blocks to `styles.css` after the hero CSS. Write them one section at a time.

### Section header

```css
.section-header { margin-bottom: 48px; }

.section-eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-eyebrow::before { content: ''; width: 22px; height: 1px; background: var(--color-primary); }

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}
```

`section-eyebrow` uses the same pattern as `hero-eyebrow` from LAB-30: a short decorative
line before the text using `::before`. `display: flex; align-items: center; gap: 10px` lays
the pseudo-element (line) and the text side-by-side with a gap between them.

`clamp(2rem, 4vw, 3rem)` — `section-title` is smaller than the hero title (which used
`clamp(3rem, 7vw, 5.5rem)`). The pattern is the same: minimum size, fluid size, maximum
size. This prevents the title from overflowing on mobile.

### Work grid and card base

```css
.work-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
}

.work-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}
```

`overflow: hidden` on the card clips the `.card-image` to the card's border-radius. Without
it, the image's rectangular corners would stick out beyond the card's rounded corners.

`transition: transform 0.2s ease, box-shadow 0.2s ease` — only listing the specific
properties that change is more performant than `transition: all`. When the browser sees
`transition: all`, it monitors every possible property for changes. Listing `transform`
and `box-shadow` explicitly means the browser only tracks those two.

### Featured card

```css
.work-card--featured { grid-row: span 2; display: flex; flex-direction: column; }

.card-image { width: 100%; aspect-ratio: 16 / 9; position: relative; flex-shrink: 0; }

.work-card--featured .card-image { aspect-ratio: unset; flex: 1; min-height: 220px; }
```

`grid-row: span 2` makes the featured card occupy two row tracks — it's taller.

`display: flex; flex-direction: column` on the featured card lets us make the image grow.
`.card-image { flex: 1 }` on the featured variant says "take up all available vertical
space after the `.card-body`". Without `flex-direction: column`, the image would stay
`aspect-ratio: 16/9` and the extra row height would just become whitespace.

`aspect-ratio: unset` removes the 16:9 constraint on the featured card's image. The image
can now grow freely to fill its flex container.

`flex-shrink: 0` on the normal `.card-image` prevents it from squishing even if the card
is very short. Combined with `aspect-ratio: 16/9`, this ensures the image always maintains
its correct proportions.

### Overlay

```css
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.work-card:hover .card-overlay { opacity: 1; }
```

The selector `.work-card:hover .card-overlay` means: when `.work-card` is hovered, find
the `.card-overlay` *inside* it and set `opacity: 1`. This is a descendant selector
triggered by hover on the ancestor. You could write `.card-image:hover .card-overlay` but
that would only trigger when hovering the image area — not the card body below the image.
Using `.work-card:hover` means the overlay shows wherever the cursor is on the card.

### Card body

```css
.card-body { padding: 20px; }

.card-tags { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }

.tag {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  padding: 3px 8px;
  border-radius: 4px;
}

.card-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 8px 0; }
.card-desc  { font-size: 0.85rem; color: var(--color-muted); margin: 0; line-height: 1.5; }
```

`flex-wrap: wrap` on `.card-tags` lets tags flow to a second line if there are too many
to fit — no overflow, no clipping.

`.tag` uses `var(--color-bg)` for its background (darker than the card surface). This
creates a subtle pill with a border and no fill — visually distinct from the card without
being heavy.

### Scroll reveal

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.5s ease var(--reveal-delay, 0s),
              transform 0.5s ease var(--reveal-delay, 0s);
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

`[data-reveal]` is an *attribute selector*. It targets any element that has a `data-reveal`
attribute, regardless of its tag or class. This is the same element used in LAB-27.

`opacity: 0; transform: translateY(28px)` — the card starts invisible and 28px below its
natural position. When `.is-visible` is added by JavaScript, those properties change to
`opacity: 1; transform: none` — and the CSS `transition` animates the change smoothly.

`var(--reveal-delay, 0s)` reads the custom property from the element's `style` attribute
(set inline in HTML as `style="--reveal-delay: 0.1s"`). The `, 0s` fallback means elements
without a `--reveal-delay` animate immediately with no delay.

### Responsive collapse

```css
@media (max-width: 700px) {
  .work-grid { grid-template-columns: 1fr; }
  .work-card--featured { grid-row: auto; }
}
```

Below 700px, the three-column grid collapses to one column. `grid-row: auto` removes the
`span 2` on the featured card — on a single-column layout, spanning two rows just makes
the first card very tall, which looks odd on mobile. `auto` returns it to normal height.

---

> **CSS AND SEE**
>
> **You should see:** Six cards in a 2+1+1 grid. The first card is taller and spans two rows.
> Hover any card — the overlay fades in revealing a button. Cards start at opacity 0 (the
> scroll reveal CSS is applied, but `.is-visible` hasn't been added yet — that needs
> JavaScript). If cards are invisible, that's correct at this stage.

---

## Step 3 — JavaScript: Scroll Reveal for Cards

Append these lines to `main.js`. Put them after the ribbon nav + Three.js blocks:

```js
// Animate cards into view as the work section scrolls in
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(function (el) { revealObserver.observe(el); });
```

Step by step:

**`document.querySelectorAll('[data-reveal]')`** selects all elements with a `data-reveal`
attribute. Because we put `data-reveal="fade-up"` on each card in the HTML, this gives us
all six cards.

**`new IntersectionObserver(callback, { threshold: 0.12 })`** creates an observer. The
callback fires whenever any observed element's visibility crosses the 12% threshold —
meaning 12% of the element has entered (or left) the viewport.

Inside the callback, **`entry.isIntersecting`** is `true` when the element is entering
the viewport and `false` when leaving. We only want to act on entry, so we check
`if (entry.isIntersecting)`.

**`entry.target.classList.add('is-visible')`** adds the class. This triggers the CSS
transition: `opacity` goes from 0 to 1, `transform` goes from `translateY(28px)` to
`translateY(0)`. The transition duration (0.5s) and delay (`--reveal-delay`) are already
set in CSS — JavaScript only toggles the class.

**`revealObserver.unobserve(entry.target)`** stops watching this specific element. Once
the card has animated in there's nothing more to do. Keeping it observed would mean the
callback fires again when the user scrolls back up (and the card leaves the viewport),
and again when they scroll down again. We want a one-shot animation, so we unobserve
immediately after adding the class.

Why `threshold: 0.12`? The cards are large. Waiting until 30% of the card is visible
(threshold 0.3) means the card might already be nearly fully visible before the animation
fires — the user barely sees it animate. 12% fires earlier, giving a satisfying entrance
where the card clearly slides in as it comes into view.

---

> **SAVE AND TRY**
>
> **You should see:** Scroll down to the Work section — each card fades and slides up into
> position. The stagger delays (0.1s, 0.15s, 0.2s, 0.25s, 0.35s) make them appear one
> after the other rather than all at once. Hover any card to see the overlay. Resize the
> browser below 700px — grid collapses to a single column.

---

## 🎯 Challenge: Card Count Badge

**You know:** CSS `::before`, `content`, `counter`.

**Task:** Add a zero-padded number to each card (01, 02, 03...) using CSS counters:

```css
.work-grid { counter-reset: card; }

.work-card::before {
  counter-increment: card;
  content: counter(card, decimal-leading-zero);
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 0.7rem;
  color: var(--color-muted);
  font-weight: 700;
  letter-spacing: 0.05em;
  z-index: 1;
}
```

`counter-reset: card` initialises a counter named "card" on the grid container.
`counter-increment: card` on each `.work-card::before` increments it before generating
the content. `decimal-leading-zero` formats the count as 01, 02, 03 rather than 1, 2, 3.
The counter increments in DOM order — the featured card gets 01, the others 02 through 06.

---

## Final Check

| Feature | How to verify |
|---|---|
| Featured card taller | First card spans two rows, taller than neighbours |
| Hover overlay | Hover any card — overlay fades in with button |
| Scroll reveal with stagger | Scroll to Work — cards animate in sequence |
| Responsive | Resize below 700px — grid collapses to one column |

---

## Quick Check Answers

**1. How wide is the first column in `2fr 1fr 1fr`?**
Total = 2 + 1 + 1 = 4 units. The first column gets 2/4 = 50% of the available space.
The other two each get 1/4 = 25%.

**2. How to span two rows?**
`grid-row: span 2` on the item. The container does not need to change — the grid
auto-places all other items around the spanning item.

**3. CSS animation vs transition vs IntersectionObserver + class?**
- `@keyframes` animation: runs on page load (or when the element appears in the DOM).
  Good for on-load effects. Bad for scroll-triggered: it would run before the element
  is visible.
- CSS `transition`: fires when a CSS property *changes value*. Requires a trigger — a
  class change, a hover, a state change. Nothing fires it automatically.
- IntersectionObserver + class: JS fires when the element scrolls into the viewport,
  then adds a class — which triggers the transition. Perfect for scroll-reveal because
  the animation starts at exactly the right moment.
