# Lesson 2: Text Spacing

## 1. The Mental Model & Problem Solved

Reading text on a screen is inherently fatiguing for the human eye. 

**The Problem:** Default browser spacing mashes lines of text together vertically and clumps letters horizontally. If lines are too close, the eye loses its place when dropping to the next line. If they are too far apart, the lines feel disconnected.
**The Solution:** We must sculpt the negative space *inside* and *around* the text using CSS text spacing properties (`line-height`, `letter-spacing`, `word-spacing`).

## 2. The Complete Grammar

### `line-height`
- **Formal syntax:** `line-height: normal | <number> | <length> | <percentage>`
- **Accepted value types:** Unitless numbers (`1.5`), lengths (`px`, `rem`), percentages (`%`), keywords (`normal`).
- **Initial value:** `normal` (Depends on the user agent, usually computes to ~1.2).
- **Inherited:** **Yes.**
- **Animatable:** Yes.
- **Percentages allowed?:** Yes (Relative to the font size of the element itself).
- **Computed value:** Absolute length (For percentages/lengths) or the number itself (For unitless numbers).
- **Applies to:** All elements.

### `letter-spacing` (Tracking)
- **Formal syntax:** `letter-spacing: normal | <length>`
- **Initial value:** `normal`.
- **Inherited:** **Yes.**
- **Animatable:** Yes.
- **Percentages allowed?:** No.
- **Computed value:** Absolute length.

### `word-spacing`
- **Formal syntax:** `word-spacing: normal | <length-percentage>`
- **Initial value:** `normal`.
- **Inherited:** **Yes.**

## 3. Syntax Evolution & Modern Usage

**The Unitless `line-height` Rule**
In older codebases, you might see `line-height: 24px` or `line-height: 150%`. Modern CSS best practices mandate using **unitless numbers** (e.g., `line-height: 1.5`). 
Why? Because of inheritance math. 
If a parent is `20px` with a `150%` line-height, it computes to `30px`. That `30px` absolute value is inherited by children. If a child has `10px` text, it will still have a massive `30px` line-height!
If you use a unitless number (`1.5`), the *multiplier* is inherited, not the computed result. The child will correctly multiply its `10px` text by `1.5` to get `15px`.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
p {
  line-height: -1.5; /* Invalid! */
  letter-spacing: 2%; /* Invalid! */
}
```

**Error Recovery:**
- `line-height: -1.5;` is dropped. Line-height cannot be negative.
- `letter-spacing: 2%;` is dropped. Letter spacing accepts lengths (`px`, `em`, `rem`) but *not* percentages in standard CSS.

## 5. Accessibility (A11y)

**WCAG Spacing Requirements:**
To ensure readability for users with cognitive disabilities (like dyslexia), the WCAG accessibility guidelines state:
- Line spacing (line-height) must be at least **1.5** (150%) within paragraphs.
- Letter spacing must be at least **0.12 times** the font size (e.g., `0.12em`).
- Word spacing must be at least **0.16 times** the font size (e.g., `0.16em`).

You don't always have to go that far for general UI, but `line-height: 1.5` is the universal baseline for body paragraphs.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** a `<p>` tag.
2. Look at the box model diagram in the **Computed** tab.
3. Notice that `line-height` actually increases the *content height* of the text node itself. It adds space evenly above and below the text glyph (called "leading" in traditional typography).
4. **Performance impact:** Animating `line-height` or `letter-spacing` is brutally expensive. It changes the geometry of the text, causing the words to reflow and wrap differently, triggering **Layout** for the entire page. Never animate these properties on hover.

## 7. Prediction Checkpoints

### Checkpoint 1: The Magic of `em`
```html
<style>
  h1 {
    font-size: 2rem;
    letter-spacing: 0.1em;
  }
  p {
    font-size: 1rem;
    letter-spacing: 0.1em;
  }
</style>
```
**Question:** In physical pixels, which element has more space between its letters?

*...predict your answer before reading below...*

**Explanation:** The **`<h1>`** has more space.
The `em` unit is relative to the element's *current font size*. For the `h1`, `0.1 * 2rem = 0.2rem` of spacing. For the `p`, it's `0.1 * 1rem = 0.1rem`. Using `em` for letter-spacing is brilliant because the spacing scales dynamically if you change the font size!

## 8. Compare Similar Features

### `line-height` vs `margin-bottom`
- **`line-height`:** Adds space *between the lines of a single paragraph*.
- **`margin-bottom`:** Adds space *between separate paragraphs*. 
Do not use `line-height: 3` to push two paragraphs apart; use `margin`.

## 9. Decision Guide

- **I'm styling a long paragraph of body text** -> `line-height: 1.5;`
- **I'm styling a massive, bold `<h1>` headline** -> `line-height: 1.1;` or `1.2` (Headlines need tighter spacing or they look disconnected).
- **I'm styling ALL CAPS SUBTITLES** -> `letter-spacing: 0.05em;` (All caps text is very hard to read without extra breathing room between the letters).

## 10. The Real Project

Apply this to our `styles.css`.

```css
/* styles.css */
.card-description {
  /* Provide accessible line spacing for reading */
  line-height: 1.5;
  
  /* Use 'em' so the spacing scales perfectly if we change font-size later */
  letter-spacing: 0.01em; 
}

.card-label {
  /* Tight, punchy spacing for small UI labels */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## 11. Mastery Checklist

- [ ] I know why we use unitless numbers (`1.5`) for `line-height` instead of percentages or pixels.
- [ ] I can explain why `line-height` differs for headlines (`1.1`) vs paragraphs (`1.5`).
- [ ] I understand why `em` is the perfect unit for `letter-spacing`.
- [ ] I know not to animate text spacing because it triggers Layout.
- [ ] I have applied the spacing rules to my project code.
