# CSS Masterclass — Lesson 6: Typography, Colors & Visual Design

> This lesson covers everything that makes UI *look good* — fonts, color systems, shadows, borders, gradients, and the principles that separate polished from mediocre.

---

## 1. Typography Foundation

### Loading fonts

```css
/* System font stack — zero load time */
font-family: system-ui, -apple-system, sans-serif;

/* Google Fonts — add to <head> */
/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"> */

/* Self-hosted — best for performance */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;   /* show fallback immediately, swap when loaded */
}
```

### Core font properties

```css
font-family: 'Inter', system-ui, sans-serif;
font-size: 1rem;           /* always use rem for font sizes */
font-weight: 400;          /* 100–900, or: thin/light/normal/bold/black */
font-style: italic | normal | oblique;
line-height: 1.5;          /* unitless — relative to font-size. Recommended: 1.4–1.7 */
letter-spacing: 0.02em;    /* use em for letter-spacing, scales with font-size */
word-spacing: 0.1em;
text-transform: uppercase | lowercase | capitalize | none;
font-variant: small-caps;
```

### Type scale — use a modular scale

```css
:root {
  --scale: 1.25;   /* Major Third — clean, not too dramatic */
  
  --text-xs:   0.64rem;    /* 10.24px */
  --text-sm:   0.8rem;     /* 12.8px */
  --text-base: 1rem;       /* 16px */
  --text-md:   1.25rem;    /* 20px */
  --text-lg:   1.563rem;   /* 25px */
  --text-xl:   1.953rem;   /* 31px */
  --text-2xl:  2.441rem;   /* 39px */
  --text-3xl:  3.052rem;   /* 49px */
}
```

### Fluid typography (no breakpoints)

```css
:root {
  --text-base: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1rem + 0.75vw, 1.375rem);
  --text-xl:   clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  --text-2xl:  clamp(1.5rem, 1rem + 2.5vw, 2.5rem);
  --text-3xl:  clamp(2rem, 1rem + 4vw, 4rem);
}
```

---

## 2. Text Layout Properties

```css
/* Line length — 60-75ch is the sweet spot for readability */
.prose {
  max-width: 65ch;
  line-height: 1.7;
}

/* Alignment */
text-align: left | right | center | justify | start | end;

/* Wrapping */
white-space: normal;      /* wrap (default) */
white-space: nowrap;      /* no wrap */
white-space: pre;         /* preserve whitespace and newlines */
white-space: pre-wrap;    /* preserve whitespace, but do wrap */
white-space: pre-line;    /* preserve newlines, collapse spaces, wrap */

/* Overflow */
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;  /* show "..." when text overflows */

/* Multi-line truncation */
display: -webkit-box;
-webkit-line-clamp: 3;    /* truncate after 3 lines */
-webkit-box-orient: vertical;
overflow: hidden;

/* Word breaking */
word-break: break-word;    /* break long words to prevent overflow */
overflow-wrap: break-word; /* same, different property */
hyphens: auto;             /* add hyphens when breaking words */
```

### Optical sizing and font features

```css
/* Variable fonts */
font-variation-settings: 'wght' 650, 'wdth' 80;

/* OpenType features */
font-feature-settings: 'liga' 1, 'kern' 1;   /* ligatures and kerning */
font-variant-numeric: oldstyle-nums;           /* oldstyle numbers */
font-variant-numeric: tabular-nums;            /* fixed-width numbers (great for tables) */
font-variant-ligatures: common-ligatures;

/* Optical size axis */
font-optical-sizing: auto;
```

---

## 3. Decorative Text

```css
/* Underline control */
text-decoration: underline;
text-decoration: none;
text-decoration-color: var(--color-accent);
text-decoration-style: solid | dashed | dotted | wavy;
text-decoration-thickness: 2px;
text-underline-offset: 3px;   /* space between text and underline */

/* Text shadow */
text-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
text-shadow: 0 0 20px rgb(59 130 246 / 0.5);   /* glow effect */

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Color in Depth

### Building a color palette with HSL

The key insight: keep hue fixed, vary saturation and lightness.

```css
:root {
  /* Brand color family */
  --hue: 220;
  
  --brand-50:  hsl(var(--hue) 100% 97%);
  --brand-100: hsl(var(--hue) 95% 93%);
  --brand-200: hsl(var(--hue) 90% 85%);
  --brand-300: hsl(var(--hue) 85% 72%);
  --brand-400: hsl(var(--hue) 80% 62%);
  --brand-500: hsl(var(--hue) 75% 52%);   /* base */
  --brand-600: hsl(var(--hue) 75% 42%);
  --brand-700: hsl(var(--hue) 75% 32%);
  --brand-800: hsl(var(--hue) 70% 22%);
  --brand-900: hsl(var(--hue) 65% 14%);
  
  /* Neutral gray (slightly tinted toward brand hue) */
  --gray-50:  hsl(var(--hue) 20% 98%);
  --gray-100: hsl(var(--hue) 15% 95%);
  --gray-200: hsl(var(--hue) 10% 88%);
  --gray-500: hsl(var(--hue) 8% 55%);
  --gray-900: hsl(var(--hue) 10% 10%);
}
```

### Semantic color tokens (always do this)

```css
:root {
  /* Interactive */
  --color-link:          var(--brand-600);
  --color-link-hover:    var(--brand-700);
  --color-link-visited:  hsl(280 60% 45%);
  
  /* Feedback */
  --color-success: hsl(142 76% 36%);
  --color-warning: hsl(38 92% 50%);
  --color-error:   hsl(0 84% 60%);
  --color-info:    hsl(199 89% 48%);
  
  /* Surfaces */
  --color-bg:           white;
  --color-surface:      var(--gray-50);
  --color-surface-2:    var(--gray-100);
  --color-border:       var(--gray-200);
  --color-border-focus: var(--brand-500);
  
  /* Text */
  --color-text:         var(--gray-900);
  --color-text-muted:   var(--gray-500);
  --color-text-subtle:  hsl(var(--hue) 8% 70%);
  --color-text-on-brand: white;
}
```

---

## 5. Backgrounds

### Solid and transparent

```css
background-color: var(--color-surface);
background-color: transparent;
background-color: rgb(59 130 246 / 0.1);  /* tinted transparent */
```

### Gradients

```css
/* Linear gradient */
background: linear-gradient(to right, #667eea, #764ba2);
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
background: linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.7));

/* Multi-stop */
background: linear-gradient(
  to bottom,
  hsl(220 80% 95%) 0%,
  hsl(220 60% 90%) 50%,
  hsl(220 40% 85%) 100%
);

/* Radial gradient */
background: radial-gradient(circle at center, #667eea, #764ba2);
background: radial-gradient(ellipse at top left, #ffd700 0%, transparent 60%);

/* Conic gradient */
background: conic-gradient(from 0deg, red, yellow, green, blue, red);

/* Layered gradients (multiple backgrounds!) */
background:
  linear-gradient(rgb(0 0 0 / 0.3), rgb(0 0 0 / 0.3)),  /* dark overlay */
  url('/image.jpg') center/cover;
```

### Mesh gradients (modern CSS)

```css
.mesh {
  background:
    radial-gradient(ellipse at 20% 20%, hsl(240 100% 70% / 0.6), transparent 50%),
    radial-gradient(ellipse at 80% 80%, hsl(340 100% 70% / 0.6), transparent 50%),
    radial-gradient(ellipse at 50% 50%, hsl(60 100% 70% / 0.6), transparent 50%),
    hsl(220 30% 15%);
}
```

---

## 6. Borders & Outlines

```css
/* Border shorthand */
border: 1px solid var(--color-border);
border: 2px dashed var(--color-accent);

/* Individual sides */
border-top: none;
border-bottom: 2px solid currentColor;  /* currentColor = inherits text color */

/* Individual properties */
border-width: 1px;
border-style: solid | dashed | dotted | double | groove | ridge | inset | outset;
border-color: var(--color-border);

/* Radius */
border-radius: 0.5rem;
border-radius: 50%;                     /* circle */
border-radius: 1rem 0.5rem;             /* tl/br, tr/bl */
border-radius: 1rem 0.5rem 0.5rem 1rem; /* tl, tr, br, bl */
border-top-left-radius: 2rem 1rem;      /* x y separately */

/* Outline (doesn't affect layout, used for focus) */
outline: 2px solid var(--color-accent);
outline-offset: 3px;      /* gap between border and outline */
```

---

## 7. Shadows

### `box-shadow`

`box-shadow: offsetX offsetY blur spread color`

```css
/* Subtle elevation */
box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);

/* Multiple shadows for realistic depth */
box-shadow:
  0 1px 1px rgb(0 0 0 / 0.04),
  0 2px 4px rgb(0 0 0 / 0.06),
  0 4px 8px rgb(0 0 0 / 0.08);

/* Inset shadow */
box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.1);

/* Glow effect */
box-shadow: 0 0 20px rgb(59 130 246 / 0.5);

/* Colored shadow (matches element color) */
.card:hover {
  box-shadow: 0 8px 30px rgb(59 130 246 / 0.3);
}

/* Layered — looks the most natural */
box-shadow:
  0 1px 2px rgb(0 0 0 / 0.04),
  0 4px 6px rgb(0 0 0 / 0.06),
  0 10px 15px rgb(0 0 0 / 0.08),
  0 20px 25px rgb(0 0 0 / 0.04);
```

### Elevation system

```css
:root {
  --shadow-sm:  0 1px 2px rgb(0 0 0 / 0.08);
  --shadow-md:  0 2px 8px rgb(0 0 0 / 0.12), 0 1px 3px rgb(0 0 0 / 0.08);
  --shadow-lg:  0 4px 20px rgb(0 0 0 / 0.15), 0 2px 6px rgb(0 0 0 / 0.08);
  --shadow-xl:  0 8px 40px rgb(0 0 0 / 0.20), 0 4px 10px rgb(0 0 0 / 0.08);
  --shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.4);
}
```

---

## 8. `filter` and `backdrop-filter`

```css
/* filter — applies to element and its contents */
filter: blur(4px);
filter: brightness(0.8);
filter: contrast(1.2);
filter: grayscale(1);
filter: saturate(1.5);
filter: sepia(0.5);
filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.3));  /* like box-shadow but for non-rect shapes */
filter: hue-rotate(90deg);
filter: invert(1);

/* Multiple filters */
filter: brightness(1.1) contrast(1.05) saturate(1.1);

/* backdrop-filter — applies to what's BEHIND the element */
.glass {
  background: rgb(255 255 255 / 0.15);
  backdrop-filter: blur(12px) saturate(1.8);
  border: 1px solid rgb(255 255 255 / 0.3);
}
/* This is the "glassmorphism" effect */
```

---

## 9. Visual Design Principles (applied)

### Spacing rhythm

Use a consistent spacing scale derived from your base unit.

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Visual hierarchy in practice

```css
/* Big thing = important, small = less important */
.page-title   { font-size: var(--text-3xl); font-weight: 700; }
.section-title { font-size: var(--text-xl); font-weight: 600; }
.body-text    { font-size: var(--text-base); font-weight: 400; }
.caption      { font-size: var(--text-sm); color: var(--color-text-muted); }

/* Use color saturation for emphasis */
.primary   { color: var(--color-text); }          /* full saturation = high emphasis */
.secondary { color: var(--color-text-muted); }    /* muted = less emphasis */
.tertiary  { color: var(--color-text-subtle); }   /* nearly invisible = decorative */
```

### The "space between related things" rule

Close = related. Far = separate.

```css
.card {
  padding: var(--space-6);   /* interior breathing room */
}

.card + .card {
  margin-top: var(--space-4);   /* cards are siblings — relatively close */
}

.section + .section {
  margin-top: var(--space-20);  /* sections are distinct — far apart */
}
```

---

## Quick Reference Card

```
Typography:
  font-size: clamp(1rem, 1rem + 0.5vw, 1.25rem)
  line-height: 1.5–1.7 for body
  max-width: 65ch for prose
  font-variant-numeric: tabular-nums  (tables/numbers)
  text-overflow: ellipsis (+ overflow:hidden + white-space:nowrap)

Colors:
  hsl(220 80% 55%) → hue saturation% lightness%
  Change hue → different color, same feel
  Change lightness → lighter/darker variant
  Tinted grays → use low saturation, same hue as brand

Shadows:
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08)
  Multiple layers = natural depth
  Spread 0 = sharp, spread positive = bigger

Glassmorphism:
  background: rgb(255 255 255 / 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 0.3);

Gradient text:
  background: linear-gradient(135deg, ...);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
```

---

