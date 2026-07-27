# Lesson 1: Absolute vs Relative Units

## 1. The Mental Model & Problem Solved

CSS must measure things: how wide a box is, how big a font is, how thick a border is.

**The Problem:** If you measure everything in physical units (like centimeters or fixed pixels), your design breaks when viewed on devices with radically different screen sizes (a 4-inch phone vs a 65-inch TV) or when a user zooms in to read.
**The Solution:** CSS provides a dual system of measurement:
- **Absolute units:** Hardcoded measurements that theoretically map to physical dimensions and do not change.
- **Relative units:** Measurements that calculate their final size dynamically based on another value (like the parent's size or the user's OS settings).

## 2. The Complete Grammar

### Absolute Units
- **`px` (Pixels):** The workhorse of the web. Historically mapped to 1 physical screen pixel. Modern CSS defines it as an angular measurement (`1/96th` of an inch) so a 10px box looks physically the same size on a low-res monitor as it does on a high-res Retina screen.
- **`cm`, `mm`, `in`, `pt`, `pc`:** Real-world physical units (Centimeters, inches, points). 
  - *Initial/Inherited/Animatable:* N/A (These are value types, not properties).
  - *Applies to:* Only useful for print stylesheets (e.g., generating PDFs from CSS). Never use these for screen UI.

### Relative Units
- **`rem` (Root EM):** Relative to the `font-size` of the root `<html>` element. If the root is 16px, `1rem` = 16px. `2rem` = 32px.
- **`em`:** Relative to the `font-size` of the *current element* (or the parent, if used on the `font-size` property itself).
- **`%` (Percentage):** Relative to the corresponding dimension of the parent element (e.g., `width: 50%` means half the parent's width).

## 3. Syntax Evolution & Modern Usage

In 2005, developers built websites with `width: 800px; font-size: 12px;`. 
In modern CSS, `px` is largely banished for typography and layout containers.
- **Typography:** Always use `rem`.
- **Layout Containers:** Use `%`, `vw`, or Flexbox/Grid fractions.
- **When is `px` okay?:** Small, rigid details that should never scale, like a `1px` border, a `4px` box-shadow, or an `8px` border-radius.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  width: 50 px; /* Invalid! */
  width: 50p;   /* Invalid! */
}
```

**Error Recovery:**
- `width: 50 px;` is dropped. You cannot have a space between the number and the unit.
- `width: 50p;` is dropped. The parser does not guess typos. It only recognizes exact unit keywords.

## 5. Accessibility (A11y)

**The `px` Font-Size Tragedy:**
If a visually impaired user goes into their browser settings and changes their default font size from `Medium (16px)` to `Very Large (24px)`, the browser changes the root `<html>` font size to 24px.
If your CSS says `font-size: 1rem;`, your text scales perfectly to 24px, and the user can read your site.
If your CSS says `font-size: 16px;`, you violently overwrite the root setting, trapping the text at 16px. The user cannot read your site. **Never use `px` for font sizes.**

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** a paragraph with `font-size: 2rem`.
2. Go to the **Computed** tab.
3. Notice that `2rem` does not appear in the Computed tab. The browser has already done the math. If the root is 16px, the Computed tab shows `32px`.
4. **Performance impact:** Relative units (`rem`, `%`) require the browser to perform algebra during the Layout phase (walking up the DOM tree to find the parent values). This math is incredibly fast and hardware-optimized. There is no measurable performance penalty for using relative units over absolute units.

## 7. Prediction Checkpoints

### Checkpoint 1: The `em` Multiplier Trap
```html
<style>
  .parent { font-size: 20px; }
  .child { font-size: 2em; }
  .grandchild { font-size: 2em; }
</style>
<div class="parent">
  <div class="child">
    <div class="grandchild">Text</div>
  </div>
</div>
```
**Question:** In physical computed pixels, how big is the "Text" in the grandchild?

*...predict your answer before reading below...*

**Explanation:** It is **80px**. 
Because `em` is relative to the parent, it compounds exponentially. 
- Parent = 20px.
- Child = 2 * 20 = 40px.
- Grandchild = 2 * 40 = 80px. 
This compounding math is exactly why we use `rem` (which always references the root) instead of `em` for font sizes.

## 8. Compare Similar Features

### `rem` vs `%`
- **`rem`:** Looks up the DOM tree specifically for the `<html>` root's `font-size`.
- **`%`:** Looks at the immediate parent box. `width: 50%` is half the parent's width. `font-size: 50%` is half the parent's font size.

## 9. Decision Guide

- **I need a tiny, crisp border** -> `border: 1px solid black;`
- **I am setting font sizes** -> `font-size: 1.25rem;`
- **I am setting padding on a button, and I want the padding to grow if the font size grows** -> `padding: 0.5em 1em;`
- **I want a box to take up half the screen** -> `width: 50%;`

## 10. The Real Project

Apply this to our `styles.css`. We will ensure our card uses modern, accessible units.

```css
/* styles.css */
.card {
  width: 100%;
  max-width: 400px;
  
  /* Use 'rem' for spacing so the card breathes more if the user's font is huge */
  padding: 1.5rem;
  margin: 1rem auto;
  
  /* Use 'px' for rigid, non-scaling details */
  border: 1px solid #ccc;
  border-radius: 8px;
}

.card-title {
  /* Use 'rem' for typography */
  font-size: 1.25rem;
}
```

## 11. Mastery Checklist

- [ ] I can explain why `px` on fonts ruins accessibility.
- [ ] I understand the exponential danger of nesting `em` units.
- [ ] I know that `rem` stands for Root EM.
- [ ] I can explain why a space between a number and a unit breaks CSS.
- [ ] I can use DevTools to see the final computed `px` value of a `rem`.
- [ ] I have applied the relative units to my project code.
