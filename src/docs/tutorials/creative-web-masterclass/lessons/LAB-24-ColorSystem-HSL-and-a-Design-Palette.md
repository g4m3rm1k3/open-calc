# Creative Web Masterclass — LAB 24 — Color System: HSL and a Design Palette

**Prerequisites:** LAB-08 (CSS custom properties). This lab is about design foundations, not new JavaScript.

**What this lab adds:**
- HSL color model — Hue, Saturation, Lightness and why it is better than hex for systematic design
- Building a full color palette with CSS custom properties
- Semantic color tokens (using colors by role, not by value)
- Dark mode palette
- A color swatch page to visualize the system

**Time:** 40–55 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  Primary   Secondary   Accent   Neutral   Semantic    │
 │  ■ 900     ■ 900       ■ 900    ■ 900                 │
 │  ■ 700     ■ 700       ■ 700    ■ 700     ■ Success   │
 │  ■ 500     ■ 500       ■ 500    ■ 500     ■ Warning   │
 │  ■ 300     ■ 300       ■ 300    ■ 300     ■ Danger    │
 │  ■ 100     ■ 100       ■ 100    ■ 100                 │
 └──────────────────────────────────────────────────────┘
   A systematic color palette — 5 hues × 5 shades + semantic colors.
```

---

> **Quick Check — answer before reading further:**
>
> 1. CSS hex colors (`#6c63ff`) encode Red, Green, and Blue channels. Why is this format
>    difficult to work with when you need "a slightly lighter version of this color"?
> 2. HSL stands for Hue, Saturation, Lightness. What does "hue 240" mean? What does
>    "lightness 60%" mean?
> 3. What is a "semantic color token"? Give an example of one and explain why it is better
>    than using a raw color value directly.
>
> *(Answers at the end)*

---

## Concept: HSL Color Model

**What it is:** HSL describes color with three intuitive values:
- **Hue:** A position on the color wheel, 0–360 degrees. 0/360 = red, 120 = green, 240 = blue.
- **Saturation:** How vivid the color is. 0% = completely gray, 100% = fully saturated.
- **Lightness:** How light or dark. 0% = black, 50% = pure color, 100% = white.

**Why it is better than hex for design:**

```css
/* Hex: to get a lighter version you must calculate RGB manually */
--color-primary: #6c63ff;   /* how do I make this 20% lighter? */

/* HSL: lightness is a direct axis — adjust it intuitively */
--color-primary-500: hsl(244, 95%, 69%);  /* base */
--color-primary-300: hsl(244, 95%, 80%);  /* lighter — just increase lightness */
--color-primary-700: hsl(244, 95%, 55%);  /* darker — decrease lightness */
```

The hue (244) and saturation (95%) stay the same — only lightness changes. You can
build a full shade scale by varying lightness on a single hue.

**Canonical lightness scale:**

| Name | Lightness | Use |
|---|---|---|
| 900 | 15% | Very dark — backgrounds, shadows |
| 700 | 35% | Dark — dark mode text, borders |
| 500 | 60% | Base — main brand color |
| 300 | 75% | Light — highlights, hover states |
| 100 | 92% | Very light — light mode backgrounds |

---

## Concept: Semantic Color Tokens

**What it is:** A semantic token is a CSS custom property named by *purpose*, not by
value. Instead of using `--color-primary-500` directly in component styles, you define
an alias layer:

```css
:root {
  /* Primitive tokens — the palette */
  --purple-500: hsl(244, 95%, 69%);
  --neutral-900: hsl(240, 20%, 8%);
  --neutral-100: hsl(240, 5%, 95%);

  /* Semantic tokens — purpose-named aliases */
  --color-brand: var(--purple-500);
  --color-bg: var(--neutral-900);
  --color-text: var(--neutral-100);
  --color-surface: hsl(240, 20%, 14%);
  --color-border: hsl(240, 15%, 20%);
}
```

When you change `--color-brand: var(--purple-500)` to `var(--teal-500)`, every button,
link, and highlight that uses `--color-brand` updates automatically. You change the
design in one place.

**Watch for:** Semantic tokens should describe role, not appearance: `--color-danger`
not `--color-red`. In a dark mode theme, `--color-danger` might still be a shade of red,
but now you can swap it for any color without renaming everything.

---

## Step 1 — Create Files

`projects/lab-24/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 24 — Color System</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="swatch-page">

      <header class="page-header">
        <h1>Design Color System</h1>
        <p>A systematic palette using HSL — adjusting lightness along a single hue.</p>
      </header>

      <section class="palette-group">
        <h2>Primary (Purple — hue 244)</h2>
        <div class="swatch-row">
          <div class="swatch" style="--swatch: var(--primary-900)"><span>900</span></div>
          <div class="swatch" style="--swatch: var(--primary-700)"><span>700</span></div>
          <div class="swatch" style="--swatch: var(--primary-500)"><span>500 ← base</span></div>
          <div class="swatch" style="--swatch: var(--primary-300)"><span>300</span></div>
          <div class="swatch" style="--swatch: var(--primary-100)"><span>100</span></div>
        </div>
      </section>

      <section class="palette-group">
        <h2>Accent (Coral — hue 8)</h2>
        <div class="swatch-row">
          <div class="swatch" style="--swatch: var(--accent-900)"><span>900</span></div>
          <div class="swatch" style="--swatch: var(--accent-700)"><span>700</span></div>
          <div class="swatch" style="--swatch: var(--accent-500)"><span>500 ← base</span></div>
          <div class="swatch" style="--swatch: var(--accent-300)"><span>300</span></div>
          <div class="swatch" style="--swatch: var(--accent-100)"><span>100</span></div>
        </div>
      </section>

      <section class="palette-group">
        <h2>Neutral (Dark blue-gray — hue 240)</h2>
        <div class="swatch-row">
          <div class="swatch" style="--swatch: var(--neutral-900)"><span>900</span></div>
          <div class="swatch" style="--swatch: var(--neutral-700)"><span>700</span></div>
          <div class="swatch" style="--swatch: var(--neutral-500)"><span>500</span></div>
          <div class="swatch" style="--swatch: var(--neutral-300)"><span>300</span></div>
          <div class="swatch" style="--swatch: var(--neutral-100)"><span>100</span></div>
        </div>
      </section>

      <section class="palette-group">
        <h2>Semantic Tokens</h2>
        <div class="swatch-row">
          <div class="swatch" style="--swatch: var(--color-bg)"><span>Background</span></div>
          <div class="swatch" style="--swatch: var(--color-surface)"><span>Surface</span></div>
          <div class="swatch" style="--swatch: var(--color-brand)"><span>Brand</span></div>
          <div class="swatch" style="--swatch: var(--color-success)"><span>Success</span></div>
          <div class="swatch" style="--swatch: var(--color-danger)"><span>Danger</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2>Applied Example</h2>
        <div class="demo-card">
          <span class="demo-badge">New</span>
          <h3>Interactive 3D Scene</h3>
          <p>Built with Three.js, Canvas 2D, and CSS animations.</p>
          <div class="demo-actions">
            <button class="btn btn-primary">View Project</button>
            <button class="btn btn-outline">Source Code</button>
          </div>
        </div>
      </section>

    </div>
    <script src="main.js"></script>
  </body>
</html>
```

---

## Step 2 — The Color System CSS

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  /* ---- Primary palette: purple (hue 244) ---- */
  --primary-900: hsl(244, 50%, 18%);
  --primary-700: hsl(244, 70%, 40%);
  --primary-500: hsl(244, 95%, 65%);   /* #6c63ff equivalent */
  --primary-300: hsl(244, 90%, 78%);
  --primary-100: hsl(244, 60%, 93%);

  /* ---- Accent palette: coral (hue 8) ---- */
  --accent-900: hsl(8, 50%, 18%);
  --accent-700: hsl(8, 70%, 38%);
  --accent-500: hsl(8, 90%, 62%);      /* #ff6b6b equivalent */
  --accent-300: hsl(8, 85%, 76%);
  --accent-100: hsl(8, 60%, 93%);

  /* ---- Neutral palette: blue-gray (hue 240) ---- */
  --neutral-900: hsl(240, 20%, 8%);    /* very dark — page background */
  --neutral-800: hsl(240, 18%, 13%);
  --neutral-700: hsl(240, 14%, 22%);
  --neutral-500: hsl(240, 8%, 42%);    /* muted text */
  --neutral-300: hsl(240, 6%, 72%);    /* light text */
  --neutral-100: hsl(240, 5%, 94%);    /* near white */

  /* ---- Semantic tokens: role-named aliases ---- */
  --color-bg: var(--neutral-900);
  --color-surface: hsl(240, 18%, 13%);
  --color-border: hsl(240, 14%, 22%);
  --color-text: var(--neutral-100);
  --color-muted: var(--neutral-500);
  --color-brand: var(--primary-500);
  --color-brand-dark: var(--primary-700);
  --color-accent: var(--accent-500);

  /* ---- Status colors ---- */
  --color-success: hsl(152, 60%, 55%);
  --color-warning: hsl(38, 90%, 58%);
  --color-danger: var(--accent-500);
  --color-info: hsl(200, 80%, 58%);
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

.swatch-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.page-header h1 { margin: 0 0 8px 0; color: var(--color-brand); font-size: 2rem; }
.page-header p { margin: 0; color: var(--color-muted); }

.palette-group h2 { margin: 0 0 16px 0; font-size: 1rem; color: var(--color-muted); font-weight: 400; }

.swatch-row { display: flex; gap: 8px; }

/* Each .swatch reads its color from a --swatch custom property set inline */
.swatch {
  flex: 1;
  height: 80px;
  background: var(--swatch);
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 8px;
  position: relative;
}

.swatch span {
  font-size: 0.7rem;
  font-family: monospace;
  color: rgba(255,255,255,0.6);
  mix-blend-mode: difference;   /* readable on both light and dark swatches */
}

/* ---- Demo section ---- */
.demo-section h2 { margin: 0 0 24px 0; font-size: 1.1rem; color: var(--color-muted); font-weight: 400; }

.demo-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
}

.demo-badge {
  display: inline-block;
  background: var(--color-brand);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.demo-card h3 { margin: 0 0 8px 0; font-size: 1.2rem; }
.demo-card p { margin: 0 0 24px 0; color: var(--color-muted); font-size: 0.9rem; line-height: 1.5; }

.demo-actions { display: flex; gap: 12px; }

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn:hover { opacity: 0.85; transform: translateY(-1px); }

.btn-primary { background: var(--color-brand); color: white; }
.btn-outline { background: transparent; color: var(--color-brand); border: 1px solid var(--color-brand); }
```

The swatch trick: each `.swatch` div has `style="--swatch: var(--primary-500)"` set
inline. The CSS reads `background: var(--swatch)`. This avoids creating a separate class
for every shade — one class, custom property per swatch.

`mix-blend-mode: difference` on the label text makes it readable on both dark and light
backgrounds — it inverts its color based on what is behind it.

---

> **CSS AND SEE**
>
> **You should see:** A grid of color swatches showing primary, accent, neutral, and
> semantic colors. Below them, a demo card using the semantic tokens. The card's badge
> uses `--color-brand`, the buttons use `--color-brand`.
>
> **Change something:** In DevTools, change `--primary-500` on `:root` to
> `hsl(160, 95%, 45%)` (teal). Every element using `--color-brand` (the badge, the primary
> button) instantly turns teal — the whole system updates from one variable.

---

## Step 3 — JavaScript Theme Switch

`main.js`:

```js
// No complex JavaScript needed — demonstrate the power of CSS tokens
// by toggling between dark and light mode at runtime

const root = document.documentElement;

// Create toggle button
const btn = document.createElement('button');
btn.textContent = 'Switch to Light Mode';
btn.className = 'btn btn-outline';
btn.style.cssText = 'position:fixed;bottom:20px;right:20px;';
document.body.appendChild(btn);

let isDark = true;

btn.addEventListener('click', function () {
  isDark = !isDark;

  if (isDark) {
    root.style.setProperty('--color-bg', 'hsl(240, 20%, 8%)');
    root.style.setProperty('--color-surface', 'hsl(240, 18%, 13%)');
    root.style.setProperty('--color-text', 'hsl(240, 5%, 94%)');
    root.style.setProperty('--color-muted', 'hsl(240, 8%, 42%)');
    btn.textContent = 'Switch to Light Mode';
  } else {
    root.style.setProperty('--color-bg', 'hsl(240, 5%, 96%)');
    root.style.setProperty('--color-surface', 'hsl(240, 5%, 100%)');
    root.style.setProperty('--color-text', 'hsl(240, 20%, 12%)');
    root.style.setProperty('--color-muted', 'hsl(240, 8%, 50%)');
    btn.textContent = 'Switch to Dark Mode';
  }
});
```

`root.style.setProperty('--color-bg', '...')` overrides a CSS custom property at runtime.
This is the JavaScript equivalent of writing a new value on `:root`. Every element using
`--color-bg` updates instantly — the entire design system responds to a single toggle.

---

> **SAVE AND TRY**
>
> **You should see:** A fixed button at the bottom-right. Click it — the entire page
> switches from dark to light mode. The primitive palette (swatch colors) stays the same,
> but `--color-bg`, `--color-surface`, and `--color-text` change, making the page feel
> completely different. This demonstrates the power of semantic tokens.

---

## 🎯 Challenge: Brand Color Switcher

**You know:** CSS custom properties, `setProperty`, HSL.

**Task:** Add three brand color preset buttons (Purple, Teal, Orange). When clicked, they
change `--primary-500` and all derived tokens (brand, primary button) to a new hue.
Purple = `hsl(244, 95%, 65%)`, Teal = `hsl(175, 80%, 50%)`, Orange = `hsl(28, 95%, 58%)`.

---

<details>
<summary>▶ Show Solution</summary>

```js
const presets = [
  { label: 'Purple', color: 'hsl(244, 95%, 65%)' },
  { label: 'Teal',   color: 'hsl(175, 80%, 50%)' },
  { label: 'Orange', color: 'hsl(28, 95%, 58%)' }
];

const presetRow = document.createElement('div');
presetRow.style.cssText = 'position:fixed;bottom:20px;left:20px;display:flex;gap:8px;';
document.body.appendChild(presetRow);

presets.forEach(function (preset) {
  const b = document.createElement('button');
  b.textContent = preset.label;
  b.className = 'btn btn-outline';
  b.addEventListener('click', function () {
    root.style.setProperty('--primary-500', preset.color);
    root.style.setProperty('--color-brand', preset.color);
  });
  presetRow.appendChild(b);
});
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All swatches render | 5 color groups with 5 shades each visible |
| Semantic tokens work | Badge and button both use brand color |
| Dark/light toggle changes design | Click button — background and text colors change |
| Brand color isolation | Changing one primitive token updates all brand uses |

---

## What's Next

LAB 25 covers micro-interactions — the small hover, press, and focus animations that make
a UI feel alive and responsive. These are the details that separate a professional portfolio
from a student project.

---

## Quick Check Answers

**1. Why is hex hard to work with for design systems?**
Hex encodes RGB directly — to get a "lighter" version you must compute new R, G, B values
manually. There is no intuitive relationship between `#6c63ff` and a lighter or darker
variant. HSL separates the human-meaningful properties: hue (which color), saturation
(how vivid), and lightness (how bright). To make a lighter version, add to the lightness.
To desaturate, reduce saturation. The math matches human intuition.

**2. What does "hue 240" mean? "Lightness 60%"?**
Hue 240 is the position 240° around the color wheel — this is blue. Hue 0/360 = red,
120 = green, 240 = blue. Lightness 60% means the color is 60% of the way from black to
white — a medium-bright shade. 0% would be black, 50% is the pure hue at full saturation,
100% is white.

**3. What is a semantic color token? Give an example.**
A semantic token names a color by its *role* in the design, not its value.
`--color-brand: var(--primary-500)` is a semantic token — `brand` describes what it is
used for (the primary brand color). Using `var(--color-brand)` in button styles instead
of `var(--primary-500)` means you can swap the brand color by changing the alias, without
touching every button. It also communicates intent — a developer reading
`background: var(--color-danger)` knows this is an error/warning state, not just "a red color."
