# Lesson 1: Dimensions

## 1. The Mental Model & Problem Solved

Every element on a web page is a rectangular box. By default, a box (like a `<div>`) takes up 100% of the horizontal space available to it and only enough vertical space to wrap its contents. 

**The Problem:** Unconstrained boxes are terrible for user interfaces. A box that stretches across an entire widescreen monitor makes text unreadable (the lines are too long). A box that shrinks tightly to one word looks broken. 
**The Solution:** The dimension properties (`width`, `height`, `min-width`, `max-width`, etc.) allow us to command the browser engine to constrain these mathematical boxes to specific boundaries.

## 2. The Complete Grammar

### `width` / `height`
- **Formal syntax:** `width: <length> | <percentage> | auto`
- **Accepted value types:** pixels (`px`), rems (`rem`), percentages (`%`), viewport units (`vw`, `vh`), `auto`, `fit-content`, `min-content`, `max-content`.
- **Initial value:** `auto` (Width expands to fill parent; Height collapses to wrap children).
- **Inherited:** **No.** If width inherited, every child would explicitly lock itself to the parent's width, breaking horizontal padding.
- **Animatable:** Yes (but extremely expensive).
- **Percentages allowed?:** Yes (Resolves relative to the parent's content box).
- **Computed value:** Absolute pixels (e.g., `400px`).
- **Applies to:** All elements except non-replaced inline elements (like `<span>`).

### `min-width` / `min-height`
- **Initial value:** `auto` (for flex/grid items) or `0` (for block boxes).
- **Inherited:** No.
- **Animatable:** Yes.
- **Applies to:** All elements except non-replaced inline elements.

### `max-width` / `max-height`
- **Initial value:** `none` (no limit).
- **Inherited:** No.
- **Animatable:** Yes.
- **Applies to:** All elements except non-replaced inline elements.

## 3. Syntax Evolution & Modern Usage

In the early days of CSS, developers used rigid `width: 800px;` to build fixed-width layouts (often designed for 1024x768 monitors). 

With the advent of smartphones, this broke completely. Modern CSS heavily favors **intrinsic sizing** (letting the content dictate the size) and **fluid constraints** (`max-width: 400px; width: 100%;`) rather than rigid absolutes. We almost never declare a fixed `height` in modern CSS, because if text translates to a language with longer words (like German), a fixed height will cause the text to overflow and break the UI.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  width: 400;       /* Invalid! */
  height: -50px;    /* Invalid! */
  max-width: auto;  /* Invalid! */
}
```

**Error Recovery:**
- `width: 400;` is dropped entirely. You **must** include a unit (`px`, `rem`, etc.) for non-zero values. The parser marks this line as invalid and ignores it.
- `height: -50px;` is dropped. Dimensions cannot be negative.
- `max-width: auto;` is dropped. The initial value is `none`, not `auto`.

## 5. Accessibility (A11y)

Fixed heights are a massive accessibility hazard. If a visually impaired user zooms their browser to 200%, the text size doubles. If the text is trapped in a box with `height: 200px;`, the text will spill out of the box and overlap with other elements, rendering the site unusable. 
**Rule:** Use `min-height` instead of `height` to allow boxes to grow dynamically with zoomed text.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open your HTML project.
2. Right-click the element and select **Inspect**.
3. In the **Styles** tab, change the `width` of an element.
4. Open the **Performance** tab and run a profile while animating width.
5. **Performance impact:** Animating `width` or `height` is one of the most expensive things you can do in CSS. It triggers **Layout** (calculating the geometry of the box), which triggers **Paint** (drawing the pixels), which triggers **Composite**. Animating dimensions causes "Layout Thrashing" and will drop your framerate below 60fps on slow devices. Avoid animating dimensions whenever possible (animate `transform: scale()` instead).

## 7. Prediction Checkpoints

### Checkpoint 1: The Clash of Constraints
```html
<style>
  .box {
    width: 500px;
    max-width: 300px;
  }
</style>
<div class="box">Content</div>
```
**Question:** The developer asked for a 500px width, but also a 300px max-width. How wide is the box?

*...predict your answer before reading below...*

**Explanation:** The box is **300px**. 
CSS constraint resolution rules dictate that `max-width` overrides `width`. 

### Checkpoint 2: The Ultimate Clash
```html
<style>
  .box {
    width: 200px;
    max-width: 100px;
    min-width: 300px;
  }
</style>
```
**Question:** Which property wins when `min-width` and `max-width` contradict each other?

*...predict your answer before reading below...*

**Explanation:** The box is **300px**. 
CSS dictates that `min-width` is the absolute king. It overrides `max-width`, which overrides `width`. The hierarchy is `min > max > preferred`.

## 8. Compare Similar Features

### `height` vs `min-height`
- `height: 200px;`: The box is strictly 200px tall. If you put 300px of text inside it, the text spills out the bottom.
- `min-height: 200px;`: The box is *at least* 200px tall. If you put 300px of text inside it, the box automatically stretches to 300px to contain it safely.

## 9. Decision Guide

- **I want a box to stretch fluidly but never get too wide** -> `width: 100%; max-width: 400px;`
- **I want a box to have a specific size, but grow if text wraps** -> `min-height: 250px;`
- **I want to animate a box growing larger** -> *Don't animate width/height. Use `transform: scale()` (Covered later).*

## 10. The Real Project

Apply this to our `styles.css`. We are creating a `.card` class that will fluidly fill its parent, but never exceed 400px wide, ensuring optimal reading length.

```css
/* styles.css */
.card {
  width: 100%;
  max-width: 400px;
  min-height: 250px;
}
```
*(You will need to create a `<div class="card"></div>` in your `index.html` to see this).*

## 11. Mastery Checklist

- [ ] I can explain the hierarchy between `width`, `max-width`, and `min-width`.
- [ ] I know why we use `min-height` instead of `height` for accessibility.
- [ ] I can explain why animating `width` is a terrible idea for performance.
- [ ] I understand that missing a unit (like `width: 400;`) causes the CSS parser to drop the rule entirely.
- [ ] I have applied the dimension constraints to my project code.
