# Junior to Senior — T12·L6 — Colour

**Prerequisites:** T12·L5 (Typography). You can control text with a typographic system.
This lesson teaches how colour works in CSS — the formats, the relationships between
colours, contrast ratios, and why a colour system beats picking colours by feel.

**What this lab adds:**
- The four CSS colour formats: keyword, hex, `rgb()`, `hsl()`
- Why `hsl()` is the most useful format for building a palette
- What contrast ratio is and why it matters for readability
- How to create a tint/shade scale from a single hue
- `opacity` vs `rgba()`/`hsla()` — when each applies
- The `currentColor` keyword

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `#ff0000` and `rgb(255, 0, 0)` and `red` — are these the same colour?
> 2. You have `hsl(200, 70%, 50%)`. You want a lighter version of the same colour.
>    What do you change and in which direction?
> 3. White text on a light yellow background. A user with low vision tries to read it.
>    What specific property makes this a problem and what standard defines the minimum
>    requirement?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You pick a blue: `#2196f3`. Then you need a lighter blue for hover: `#64b5f6`. Then a darker
blue for active: `#1565c0`. You find these by searching Google Images for "blue shades".
They do not quite match. The hover is a different tone than the base. The page looks inconsistent.

The problem is that you were picking colours in the wrong format. Hex values hide the
relationship between colours. `hsl()` makes it visible — and a palette falls out naturally.

---

## Step 1 — The Four Colour Formats

Create `colour.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Colour</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 16px; }

    .swatch {
      display: inline-block;
      width: 80px;
      height: 80px;
      margin: 4px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h2>All the same colour:</h2>
  <div class="swatch" style="background: red;"           title="keyword"></div>
  <div class="swatch" style="background: #ff0000;"       title="hex"></div>
  <div class="swatch" style="background: rgb(255,0,0);"  title="rgb"></div>
  <div class="swatch" style="background: hsl(0,100%,50%);" title="hsl"></div>
</body>
</html>
```

### CSS AND SEE

**You should see:** Four identical red squares. All four formats describe the same colour.
They are interchangeable — the browser converts all of them to the same internal representation.

---

## Concept: Colour Formats — hex, rgb, hsl

**What it is:** Four ways to describe the same colour. The format does not change the colour —
it changes how easy the colour is to work with.

**Hex (`#rrggbb`):**
- Each pair is 0-255 in hexadecimal (00=0, ff=255)
- `#ff0000` = red at full intensity (255), green 0, blue 0
- Short form: `#f00` = `#ff0000` (when both digits of a pair are identical)
- Problem: the relationship between two hex values is invisible. Is `#3a5bd2` darker or
  lighter than `#4e72e8`? You cannot tell without converting.

**`rgb(r, g, b)`:**
- Three values 0–255 (or percentages)
- `rgb(255, 0, 0)` = red
- Modern syntax: `rgb(255 0 0)` — commas optional in CSS Color Level 4
- Problem: same as hex — the relationship between colours is not visible in the numbers

**`hsl(hue, saturation%, lightness%)`:**
- **Hue:** 0–360 degrees on the colour wheel (0=red, 120=green, 240=blue, 360=red again)
- **Saturation:** 0%=gray, 100%=full colour
- **Lightness:** 0%=black, 50%=pure colour, 100%=white

**Why `hsl()` is the best format for building palettes:**

```css
hsl(200, 70%, 20%)   /* dark navy */
hsl(200, 70%, 35%)   /* dark blue */
hsl(200, 70%, 50%)   /* base blue */
hsl(200, 70%, 65%)   /* light blue */
hsl(200, 70%, 80%)   /* pale blue */
hsl(200, 70%, 92%)   /* near-white blue tint */
```

All six colours are the same hue and saturation — only lightness changes. They look like
they belong together because they DO belong together — they are the same colour at different
brightnesses. This is how a tint/shade scale is built.

**What it hides:** The colour wheel, artist's colour mixing, the perceptual relationships
between colours. You specify the colour's position on the wheel (hue), how much colour vs
gray (saturation), and how bright or dark (lightness). The browser handles the conversion.

**Canonical example:** Hue is which crayon you pick. Saturation is how hard you press (full
pressure = vivid, light pressure = washed out). Lightness is how much white or black wax
is mixed in.

**The `oklch()` format (modern):** A newer format where equal numerical differences produce
equal PERCEIVED differences in colour. For example, `hsl(60, 100%, 50%)` (yellow) and
`hsl(240, 100%, 50%)` (blue) at the same lightness value look very different in perceived
brightness because human eyes are more sensitive to yellow. `oklch` fixes this. It is
supported in all modern browsers but beyond the scope of this lesson.

**You will see this again in:**
- Design tokens (T12·L13): tokens are often expressed in `hsl` so saturation and lightness
  adjustments are explicit.
- CSS custom properties: `--color-primary: hsl(200, 70%, 50%);` — one declaration, every
  shade derived from it with `hsl(200, 70%, var(--primary-lightness))`.

---

## Step 2 — Build a Colour Scale

Add to `colour.html`:

```html
<h2 style="margin-top: 32px;">HSL Scale — one hue, six shades:</h2>  <!-- ← add -->
<div class="swatch" style="background: hsl(200, 70%, 20%);" title="900"></div>
<div class="swatch" style="background: hsl(200, 70%, 35%);" title="700"></div>
<div class="swatch" style="background: hsl(200, 70%, 50%);" title="500 (base)"></div>
<div class="swatch" style="background: hsl(200, 70%, 65%);" title="300"></div>
<div class="swatch" style="background: hsl(200, 70%, 80%);" title="100"></div>
<div class="swatch" style="background: hsl(200, 70%, 93%);" title="50"></div>
```

### CSS AND SEE

**You should see:** Six squares, all the same blue hue, ranging from dark navy to near-white.
They are visually cohesive — clearly the same family.

**Change something:** Change the hue from `200` to `280` on all six (a purple/violet).

**Expected:** A purple scale with the same cohesiveness. The saturation and lightness
relationships are identical — you changed only the hue.

---

## Concept: Contrast Ratio — Accessibility and Readability

**What it is:** A number (1:1 to 21:1) that describes how different two colours are in
perceived brightness. 1:1 means identical (invisible). 21:1 is black on white (maximum).

**The WCAG 2.1 AA standard (the web accessibility minimum):**
- Normal text (under 18pt / 24px): requires **4.5:1** minimum contrast ratio
- Large text (18pt+ / 24px+ bold or 18.67px+ regular): requires **3:1** minimum
- UI components (icons, input borders): requires **3:1** minimum

**Why this matters:** White text on light yellow, gray text on white, blue text on green —
many combinations that look fine to people with full colour vision are illegible to people
with colour-vision deficiency (affects ~8% of males) or low contrast sensitivity.
Contrast ratio is an objective measurement, not a subjective one.

**How to check:** Browser DevTools shows the contrast ratio in the Styles panel when
you click a colour swatch next to a `color` property. It shows the ratio and a pass/fail
indicator for AA and AAA standards.

**Practical palette approach:**
- Dark text (`#1a1a1a` = ~hsl(0,0%,10%)) on white: 19:1 — always passes
- Mid-value backgrounds need dark text OR significantly dark text
- The base colour (`lightness: 50%`) is often unusable as text on white — it fails 4.5:1

**The alternative that fails:** Choosing text and background colours by appearance without
checking ratio. Looks fine on a calibrated monitor in good lighting; fails on phones
outdoors and for users with visual impairments.

**You will see this again in:**
- T12·L15 (Accessibility): contrast is one of the WCAG criteria you must meet before launch
- All design systems (Material Design, Apple HIG) publish their own contrast-checked colour scales
- The `color-contrast()` CSS function (experimental) will eventually let CSS pick the
  highest-contrast option automatically

---

## Step 3 — Check Contrast in DevTools

Add text-on-colour examples:

```html
<h2 style="margin-top: 32px;">Contrast Check:</h2>   <!-- ← add -->
<div style="background: hsl(200, 70%, 50%); padding: 16px;">
  <p style="color: white; margin: 0;">White on base blue — check the ratio</p>
</div>
<div style="background: hsl(200, 70%, 93%); padding: 16px; margin-top: 8px;">
  <p style="color: hsl(200, 70%, 35%); margin: 0;">Dark blue on light blue — good contrast</p>
</div>
<div style="background: white; padding: 16px; margin-top: 8px;">
  <p style="color: hsl(200, 70%, 65%); margin: 0;">Light blue on white — probably fails</p>
</div>
```

### CSS AND SEE

**Measure each combination:** For each paragraph, right-click → Inspect → find the `color`
property in the Styles panel → click the colour swatch → a colour picker opens. Look for
the contrast ratio display.

**You should see:**
- White on `hsl(200,70%,50%)` — around 3:1. FAILS for normal text (needs 4.5:1).
- Dark blue on light blue — should pass comfortably
- Light blue on white — likely fails

**Change something:** Change the base blue text to `hsl(200, 70%, 20%)` (the dark shade).

**Expected:** Contrast ratio improves significantly — dark text on light backgrounds is
the easiest way to achieve compliance.

---

## Concept: `opacity`, `rgba()`, and `hsla()` — Transparency

**What it is:** Two ways to make an element or colour partially transparent.

**`opacity` (property on the element):**
```css
.box { opacity: 0.5; }
```
- Affects the ENTIRE element including its children and text
- `0` = invisible, `1` = fully opaque
- A 50% opaque parent means its text, borders, and children are also 50% opaque —
  there is no way to make children more opaque than the parent with `opacity`

**`rgba()` and `hsla()` (alpha channel in the colour value):**
```css
.box { background: rgba(0, 0, 0, 0.5); }
.box { background: hsla(0, 0%, 0%, 0.5); }
/* Modern syntax (no need for rgba/hsla): */
.box { background: rgb(0 0 0 / 0.5); }
.box { background: hsl(0 0% 0% / 0.5); }
```
- Affects ONLY that specific colour property
- Children are not affected — they can be fully opaque
- Use when you want a semi-transparent background but fully opaque text inside

**When to use each:**
- `opacity`: fade an entire element (loading skeleton, disabled state, hover fade-out)
- `rgba`/`hsla`: transparent background while keeping text readable

**You will see this again in:**
- Modal overlays: `background: rgb(0 0 0 / 0.5)` on the backdrop — dark semi-transparent
  background over the page, but the modal itself is fully opaque
- Hover effects: `opacity: 0.8` on a button hover is simpler than adjusting the colour value

---

## Step 4 — Transparency

Add:

```html
<h2 style="margin-top: 32px;">Transparency:</h2>    <!-- ← add -->
<div style="                                          <!-- ← add -->
  background: hsl(200, 70%, 50%);
  padding: 16px;
  position: relative;
">
  <p style="color: white; margin: 0;">Full opacity text</p>
  <!-- Overlay: semi-transparent background, opaque text -->
  <div style="
    background: rgb(0 0 0 / 0.4);
    padding: 8px;
    margin-top: 8px;
    border-radius: 4px;
  ">
    <p style="color: white; margin: 0;">Semi-transparent overlay, but text stays white (0.4 alpha on background only)</p>
  </div>
</div>
```

### CSS AND SEE

**Change something:** Move the `rgb(0 0 0 / 0.4)` to an `opacity: 0.4` property on the
overlay div instead.

**Expected:** The overlay and its text both become 40% opaque — you can see the blue
background through the text, making it hard to read. This is the difference between
`opacity` (applies to everything) and alpha in the colour value (applies to one property only).

---

## 🎯 Challenge: Build a Colour System

**Task:** Create a colour system for a hypothetical application with:

1. A primary colour (your choice of hue) with 5 shades (very dark to very light)
2. A neutral grey scale (5 values, fully desaturated)
3. A semantic red for errors, a semantic green for success
4. Demonstrate each combination passes AA contrast (4.5:1 for text)
5. Use CSS custom properties (variables) to store the colours

The variables syntax: `--color-name: value;` defined in `:root {}`.
Used as: `background: var(--color-primary-500);`.

---

<details>
<summary>▶ Show Solution</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Colour System</title>
  <style>
    :root {
      /* Primary: blue-teal */
      --color-primary-900: hsl(195, 80%, 15%);
      --color-primary-700: hsl(195, 75%, 28%);
      --color-primary-500: hsl(195, 70%, 42%);
      --color-primary-300: hsl(195, 65%, 68%);
      --color-primary-100: hsl(195, 60%, 90%);

      /* Neutral grays */
      --color-gray-900: hsl(0, 0%, 10%);
      --color-gray-700: hsl(0, 0%, 30%);
      --color-gray-500: hsl(0, 0%, 50%);
      --color-gray-300: hsl(0, 0%, 75%);
      --color-gray-100: hsl(0, 0%, 95%);

      /* Semantic */
      --color-error:   hsl(0, 75%, 45%);
      --color-success: hsl(140, 65%, 35%);
    }

    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; padding: 24px; }

    .swatch-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .swatch {
      width: 100px; height: 60px;
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h2>Primary Scale</h2>
  <div class="swatch-row">
    <div class="swatch" style="background: var(--color-primary-900); color: white;">900</div>
    <div class="swatch" style="background: var(--color-primary-700); color: white;">700</div>
    <div class="swatch" style="background: var(--color-primary-500); color: white;">500</div>
    <div class="swatch" style="background: var(--color-primary-300); color: var(--color-primary-900);">300</div>
    <div class="swatch" style="background: var(--color-primary-100); color: var(--color-primary-900);">100</div>
  </div>
  <h2>Semantic</h2>
  <div class="swatch-row">
    <div class="swatch" style="background: var(--color-error); color: white;">Error</div>
    <div class="swatch" style="background: var(--color-success); color: white;">Success</div>
  </div>
</body>
</html>
```

**Key insight:** Notice that for the light swatches (300, 100), the text uses the darkest
primary colour, not white — because white on a light background would fail contrast.
The rule: use dark text on light backgrounds, light text on dark backgrounds. The midpoint
(500) is the most dangerous — check it in DevTools before using it with white text.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| All four formats describe the same colour | Four identical swatches in the step 1 demo |
| `hsl` lightness creates a scale | Six swatches — same hue, visibly graduated brightness |
| Contrast ratio checked | DevTools shows ratio; white on base blue fails 4.5:1 |
| `rgba` vs `opacity` | Opacity makes text semi-transparent too; rgba alpha only affects background |
| CSS custom properties | Change one variable in `:root` — all uses update |

---

## Quick Check Answers

**1. `#ff0000`, `rgb(255, 0, 0)`, `red` — same colour?**

Yes, all three are identical. `#ff0000` is hex (ff=255 red, 00=0 green, 00=0 blue).
`rgb(255, 0, 0)` is the same channels in decimal. `red` is a CSS named colour keyword
that maps to exactly `#ff0000`. The browser converts all three to the same internal colour.

**2. `hsl(200, 70%, 50%)`. Want lighter. What changes?**

Increase the lightness value: `hsl(200, 70%, 70%)`. Lightness is the third value.
50% is the midpoint (pure colour). Higher values approach white. The hue (200) and
saturation (70%) stay the same, so it looks like the same colour family, just brighter.

**3. White text on light yellow — what property and what standard?**

The property is contrast ratio — the perceptual brightness difference between foreground
and background colours. The standard is WCAG 2.1 (Web Content Accessibility Guidelines),
which requires a minimum 4.5:1 ratio for normal-size text (AA level). White on light
yellow is likely around 1.5:1 — severely failing. The fix: use dark text on light backgrounds.
