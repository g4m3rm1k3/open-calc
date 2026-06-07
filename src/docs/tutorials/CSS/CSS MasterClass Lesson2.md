# CSS Masterclass — Lesson 2: Units, Values & CSS Variables

---

## 1. Absolute Units

Only use these when the value truly must not scale.

| Unit | Equals | Use case |
|------|--------|----------|
| `px` | 1 device-independent pixel | Borders, fine details, media query breakpoints |
| `pt` | 1/72 inch | Print stylesheets only |
| `cm`, `mm`, `in` | Physical units | Print only |

> **`px` is NOT a physical pixel.** On a 2× retina display, `1px` = 2 hardware pixels. It's a "reference pixel" — approximately 1/96 inch at arm's length.

---

## 2. Relative Units — the core of responsive design

### Font-relative

| Unit | Relative to | Best use |
|------|-------------|----------|
| `em` | Current element's `font-size` | Padding, margin that should scale with text |
| `rem` | Root element's `font-size` (`:root` / `html`) | Consistent spacing across components |
| `ch` | Width of the `0` glyph | `max-width` for readable line lengths |
| `ex` | x-height of font | Rarely used |
| `cap` | Cap-height of font | Fine typography |
| `lh` | Current line-height | Spacing tied to line rhythm |

```css
/* em: compounds through nesting — can be a footgun */
.parent { font-size: 1.5em; }   /* 24px if root is 16px */
.child  { font-size: 1.5em; }   /* 36px — 1.5 * 24! */

/* rem: always relative to :root — predictable */
:root { font-size: 16px; }
.parent { font-size: 1.5rem; }  /* 24px */
.child  { font-size: 1.5rem; }  /* 24px — same, not compounding */
```

**Rule of thumb:**
- Use `rem` for font sizes and most spacing
- Use `em` for padding/margin that should scale *with the component's own font-size*
- Use `ch` for prose `max-width` (60–75ch is the readable sweet spot)

### Viewport-relative

| Unit | Equals |
|------|--------|
| `vw` | 1% of viewport width |
| `vh` | 1% of viewport height |
| `vmin` | 1% of the smaller dimension |
| `vmax` | 1% of the larger dimension |
| `svh` | 1% of "small viewport height" (excludes mobile browser chrome) |
| `dvh` | 1% of "dynamic viewport height" (updates as chrome shows/hides) |
| `svw`, `dvw` | Small/dynamic viewport width |

```css
/* Full-screen hero */
.hero { min-height: 100svh; }  /* use svh not vh on mobile */

/* Fluid typography without media queries */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }
```

### Container-relative (modern, very useful)

```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}

/* Also: cqi, cqb, cqw, cqh — like vw/vh but for containers */
.card-title { font-size: clamp(1rem, 3cqi, 1.5rem); }
```

---

## 3. The `calc()` Function

Mixes units. Essential for layout math.

```css
.sidebar { width: calc(300px - 2rem); }
.content  { width: calc(100% - 300px); }

/* Nested calc */
.element {
  padding: calc(1rem + 2vw);
  margin-top: calc(var(--spacing-base) * 2);
}

/* With CSS variables (very powerful) */
:root { --sidebar-width: 280px; }
.main { width: calc(100vw - var(--sidebar-width) - 2rem); }
```

---

## 4. `min()`, `max()`, `clamp()`

These three eliminate most media queries for sizing.

```css
/* min(): use the smaller of the two */
.container { width: min(90%, 1200px); }
/* = never wider than 1200px, never wider than 90% of viewport */

/* max(): use the larger of the two */
.btn { padding: max(0.5rem, 2vw); }
/* = at least 0.5rem, scales up on wide screens */

/* clamp(min, preferred, max) */
.prose { font-size: clamp(1rem, 1rem + 0.5vw, 1.25rem); }
/* never smaller than 1rem, never larger than 1.25rem, fluid between */

h1 { font-size: clamp(2rem, 5vw + 1rem, 5rem); }
/* Beautiful fluid type scale — no breakpoints needed */
```

**The fluid type formula:** `clamp(MIN, PREFERRED_AT_SOME_VIEWPORT + SCALE, MAX)`

---

## 5. Color Values

### Named, hex, rgb

```css
.a { color: rebeccapurple; }          /* named — 140+ available */
.b { color: #3b82f6; }                /* hex */
.c { color: #3b82f680; }              /* hex with alpha (last 2 digits) */
.d { color: rgb(59, 130, 246); }      /* rgb */
.e { color: rgb(59 130 246 / 0.5); }  /* modern syntax — space-separated, / for alpha */
```

### HSL — most designer-friendly

`hsl(hue, saturation%, lightness%)`

- **Hue:** 0–360 (red=0, green=120, blue=240)
- **Saturation:** 0% = gray, 100% = vivid
- **Lightness:** 0% = black, 50% = normal, 100% = white

```css
/* Easy to create harmonious color families */
:root {
  --brand-hue: 220;
  --brand:         hsl(var(--brand-hue) 80% 55%);
  --brand-light:   hsl(var(--brand-hue) 80% 75%);
  --brand-dark:    hsl(var(--brand-hue) 80% 35%);
  --brand-faint:   hsl(var(--brand-hue) 80% 97%);
  --brand-border:  hsl(var(--brand-hue) 40% 85%);
}
```

### OKLCH — the modern choice

`oklch(lightness chroma hue)` — perceptually uniform, no surprise brightness shifts when rotating hue.

```css
:root {
  --brand: oklch(60% 0.2 250);       /* lightness, chroma, hue */
  --brand-light: oklch(80% 0.15 250);
}
```

> Use OKLCH for design systems. HSL is fine for quick work. Both are better than hex for maintainability.

---

## 6. CSS Custom Properties (Variables)

The single biggest quality-of-life upgrade in modern CSS. Variables you define, browser evaluates at runtime.

### Declaration and use

```css
/* Declare on :root to make globally available */
:root {
  --color-primary: #3b82f6;
  --color-surface: #ffffff;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --radius: 0.5rem;
  --shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --transition: 200ms ease;
}

.btn {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  transition: background var(--transition);
}
```

### Fallback values

```css
color: var(--brand-color, #3b82f6);   /* use #3b82f6 if --brand-color isn't set */
```

### Variables are inherited and scoped

```css
/* Global defaults */
:root { --accent: blue; }

/* Override for a specific component subtree */
.dark-theme {
  --accent: lightblue;
}

/* Override for one element */
.special-btn {
  --accent: gold;
}

/* All children of .dark-theme see --accent: lightblue */
/* .special-btn and its children see --accent: gold */
```

### Variables in calc()

```css
:root {
  --cols: 3;
  --gap: 1.5rem;
}

.grid-item {
  width: calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols));
}

/* Change grid from 3 to 4 cols: one variable change */
@media (min-width: 1200px) {
  :root { --cols: 4; }
}
```

### Dynamic variables with JavaScript

```js
// Read
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')

// Write — instant live update, no class toggling
document.documentElement.style.setProperty('--color-primary', '#ef4444')

// This is how dark mode, themes, and live color pickers work
document.documentElement.style.setProperty('--brand-hue', '0') // → red theme
```

### Building a design token system

```css
/* TIER 1: Raw values (primitives) — don't use directly in components */
:root {
  --blue-100: hsl(214 100% 97%);
  --blue-500: hsl(214 80% 55%);
  --blue-900: hsl(214 80% 15%);
  --gray-100: hsl(0 0% 96%);
  --gray-900: hsl(0 0% 10%);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
}

/* TIER 2: Semantic tokens — use these in components */
:root {
  --color-text:        var(--gray-900);
  --color-text-muted:  hsl(0 0% 45%);
  --color-bg:          white;
  --color-surface:     var(--gray-100);
  --color-border:      hsl(0 0% 88%);
  --color-accent:      var(--blue-500);
  --color-accent-subtle: var(--blue-100);
}

/* TIER 3: Dark mode — just reassign semantic tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text:    hsl(0 0% 93%);
    --color-bg:      hsl(0 0% 8%);
    --color-surface: hsl(0 0% 12%);
    --color-border:  hsl(0 0% 22%);
    --color-accent:  hsl(214 80% 65%);
    --color-accent-subtle: hsl(214 40% 18%);
  }
}

/* Components use semantic tokens — dark mode is automatic */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
```

---

## 7. `@property` — Typed Variables (Modern)

Lets you declare the type of a CSS variable, enabling transitions on variables:

```css
@property --hue {
  syntax: '<number>';
  initial-value: 220;
  inherits: false;
}

/* Now you can animate the variable itself */
.rainbow {
  background: hsl(var(--hue) 80% 55%);
  animation: hue-shift 3s linear infinite;
}

@keyframes hue-shift {
  to { --hue: 580; }
}
```

---

## Quick Reference Card

```
Units:
  px        → fixed, use for borders & breakpoints
  rem       → relative to :root font-size (16px default)
  em        → relative to own font-size (compounds!)
  %         → relative to parent
  vw/vh     → viewport
  svh/dvh   → mobile-safe viewport height
  ch        → width of '0', use for readable line lengths

Fluid sizing:
  clamp(min, preferred, max)
  min(a, b)  max(a, b)  calc(a + b)

Colors:
  hsl(220 80% 55%)          → designer-friendly
  oklch(60% 0.2 250)        → perceptually uniform
  rgb(59 130 246 / 0.5)     → with alpha

Variables:
  --name: value;            → declare
  var(--name, fallback)     → use
  Scoped to element + children
  JS: el.style.setProperty('--name', value)
```

---
