# Lesson 1: Color and Opacity

## 1. The Mental Model

Don't think of "color" as a single property. Every pixel the browser draws has a color, and CSS provides granular control over different spatial regions of an element's bounding box. 

When you apply a color in CSS, you are instructing the browser's paint engine to fill a specific mathematical region of the element: the text glyphs, the background canvas, the stroke around the edge, etc.

In this lesson, we will focus exclusively on two properties:
- `color`: Controls the color of the vector text glyphs (and text decorations like underlines).
- `background-color`: Controls the physical surface behind the Content and the Padding layers.

*(Note: We will cover borders and shadows in upcoming lessons once we understand how the box model interacts with them).*

## 2. The Complete Grammar

### `color`
- **Formal syntax:** `color: <color>`
- **Accepted value types:** Named colors, Hex, RGB, HSL, LCH, OKLCH, `currentcolor`, `transparent`.
- **Initial value:** Browser dependent (usually black, or white in dark mode).
- **Inherited:** **Yes.** Text elements inside a container naturally want to match the container's reading color.
- **Animatable:** Yes (interpolates via RGB or specified color space).
- **Percentages allowed?:** No.
- **Computed value:** The absolute `rgba()` or `color()` value the browser resolves it to.
- **Applies to:** All elements and text.

### `background-color`
- **Formal syntax:** `background-color: <color>`
- **Accepted value types:** Same as `color`.
- **Initial value:** `transparent`.
- **Inherited:** **No.** If every child inherited its parent's background color, rendering engines would waste massive resources repainting the same opaque color over itself dozens of times.
- **Animatable:** Yes.
- **Percentages allowed?:** No.
- **Computed value:** The absolute `rgba()` or `color()` value.
- **Applies to:** All elements.

### `opacity`
- **Formal syntax:** `opacity: <alpha-value>`
- **Accepted value types:** Number (0.0 to 1.0) or Percentage (0% to 100%).
- **Initial value:** `1.0` (fully opaque).
- **Inherited:** **No.** (But it applies to the *entire flattened element tree*, effectively acting like it does).
- **Animatable:** Yes.
- **Percentages allowed?:** Yes (100% = 1.0).
- **Computed value:** The specified number clamped to the range [0.0, 1.0].
- **Applies to:** All elements.

## 3. Syntax Evolution & Modern Usage

CSS colors have evolved massively over the last two decades. Understanding the history (CSS Color Modules) explains why you see different syntax online.

### Level 3 (Legacy Standard)
The syntax you'll see in older tutorials uses comma separation and distinct `rgb()` vs `rgba()` functions.
```css
color: rgb(255, 0, 0);       /* Solid Red */
color: rgba(255, 0, 0, 0.5); /* 50% transparent red */
```

### Level 4 (Modern Standard)
Modern CSS removes the commas, merges `rgba` into `rgb`, and uses a forward slash `/` for the alpha channel.
```css
color: rgb(255 0 0);       /* Solid Red */
color: rgb(255 0 0 / 50%); /* 50% transparent red */
color: hsl(0 100% 50% / 0.5); 
```

### Level 5 (Wide Gamut & Perceptual Spaces)
Traditional `rgb()` uses the **sRGB** color space. Modern monitors (like Apple's Retina displays) use **Display P3**, which can display vastly more vibrant colors. If you declare `rgb(0 255 0)`, a modern monitor actually clips it to a duller green because it's bound by the legacy sRGB limit.

To access the full vibrant range of modern monitors, CSS introduced `oklch()`:
```css
/* Lightness (0-1), Chroma (vibrancy), Hue (angle) */
color: oklch(0.6 0.25 150); 
```

### System Colors
Browsers expose semantic variables matching the user's OS theme (light/dark mode).
```css
color: CanvasText;         /* The default OS text color */
background-color: Canvas;  /* The default OS background color */
```

## 4. CSS Parsing, Error Recovery, & Invalid Values

What happens if you make a typo?

```css
.card {
    color: red;
    color: blu; /* Typo! */
    background-color: rgb(500 0 0); /* Out of bounds! */
}
```

**Error Recovery (The `blu` typo):**
CSS does not crash like JavaScript. It uses a fault-tolerant parser. If it sees `color: blu;`, it marks the declaration as **invalid and drops it completely**. Because of the cascade, the previous valid rule (`color: red;`) survives. The text will be red.

**Value Clamping (The `500` error):**
If you provide a valid format but out-of-bounds numbers like `rgb(500 0 0)`, the browser doesn't drop it. It **clamps** it to the maximum allowable value (`255`). The computed value becomes `rgb(255, 0, 0)`.

## 5. Accessibility (A11y)

Color is dangerous in UI design.
- **Contrast Ratios:** Text must have a WCAG contrast ratio of at least 4.5:1 against its background. Light gray text on a white background fails this test and makes your site unusable for visually impaired users.
- **Alpha Transparency Danger:** Using `rgb(... / 50%)` for text colors is a massive accessibility risk. If the background changes beneath it, the text might become unreadable because the background color blends into the text glyphs. Always use solid colors for text where possible.

## 6. DevTools & Performance (Real Browser Visualization)

Don't trust static diagrams. Prove it in the browser.

1. Open your HTML project.
2. Right-click the `.card` and select **Inspect**.
3. In the right panel, find the **Computed** tab.
4. Look for `background-color`. Even if you wrote `#fff`, the Computed tab will show you how the browser translated it (e.g., `rgb(255, 255, 255)`).

**Performance (Paint vs Composite):**
- Toggle the `color` checkbox off and on in the Styles tab. Changing `color` or `background-color` forces the browser to **Paint** (re-calculate the pixels on the screen). This is computationally expensive to animate.
- Toggle `opacity`. `opacity` does not trigger Paint. It triggers **Composite**. The browser takes a cached "photo" of the element on the GPU and just fades the photo. It is vastly cheaper to animate.

## 7. Prediction Checkpoints

Don't read ahead until you've guessed the answer.

### Checkpoint 1: Inheritance
```html
<style>
  body {
    color: red;
    background-color: blue;
  }
  .card {
    /* No CSS written for .card yet */
  }
</style>
<body>
  <div class="card">Hello World</div>
</body>
```
**Question:** What color is the text "Hello World", and what color is the background of the `.card`?

*...predict your answer before reading below...*

**Explanation:** The text is **red**. The `color` property inherits down to children. 
The background of the card is **transparent** (the Initial Value). Because it is transparent, you see the `body`'s blue background shining through it. `background-color` does *not* inherit.

### Checkpoint 2: Specified vs Computed
```html
<style>
  .card {
    color: red;
    color: #00ff00;
    color: rg(0, 0, 255);
  }
</style>
```
**Question:** What color will the text compute to?

*...predict your answer before reading below...*

**Explanation:** The text is **green** (`#00ff00`). 
The cascade applies rules top-to-bottom. It sets it to red, then overwrites it to green. The third line is an invalid function name (`rg` instead of `rgb`), so the CSS parser's error recovery completely drops it. The green survives.

## 8. Compare Similar Features: `opacity` vs `rgb( / alpha)`

They both create transparency, but they solve fundamentally different problems.

- **`opacity: 0.5`**: Makes the entire flattened element tree (background, text, children) 50% transparent. Used for fading entire components in/out.
- **`background-color: rgb(255 0 0 / 50%)`**: Makes *only* the background red and 50% transparent. The text remains 100% solid. Used for glassmorphism and overlays.

## 9. Decision Guide

- **I want to color text** -> `color`
- **I want to color the box** -> `background-color`
- **I want to fade EVERYTHING (text and background)** -> `opacity`
- **I want to fade ONLY the background** -> `background-color: rgb(... / 50%)`
- **I want the border to match the text color dynamically** -> `currentColor`
- **I want the most vibrant green my modern monitor can output** -> `oklch()`

## 10. The Real Project

Apply this knowledge to our ongoing `.card` component. We will use Hex colors for simplicity, but know that the browser will compute them to RGB.

```css
/* styles.css */
.card {
  /* ... previous box model properties ... */

  /* Set the surface color of the card to solid white */
  background-color: #ffffff;
  
  /* Set the text glyphs to dark gray for high-contrast readability */
  color: #333333;
}
```

## 11. Mastery Checklist

Before moving on, verify your mental model:
- [ ] I can explain why `color` affects text, and `background-color` affects the padding/content area.
- [ ] I can choose between hex, RGB, and OKLCH based on my specific problem.
- [ ] I know exactly when to use `opacity` versus an `rgb()` alpha color.
- [ ] I understand why text inherits color, but backgrounds rely on being transparent.
- [ ] I can explain how the CSS parser recovers from a typo.
- [ ] I can open DevTools and verify the Computed value of an element.
- [ ] I've applied the changes to the ongoing project code (`styles.css`).
