# Lesson 2: Viewport Units

## 1. The Mental Model & Problem Solved

Percentages (`%`) are relative to the *parent* container. 

**The Problem:** If you want a `<div>` to fill exactly 100% of the browser window's height, writing `height: 100%;` usually fails. Why? Because it tries to be 100% of its parent (the `<body>`), which is 100% of its parent (the `<html>`), which might only be 50 pixels tall! You have to write an unbroken chain of `height: 100%` all the way up the DOM tree to make it work.
**The Solution:** Viewport units (`vw`, `vh`) bypass the parent entirely. They are relative to the physical glass screen of the user's browser window (the "Viewport"). 

## 2. The Complete Grammar

### Viewport Width & Height
- **`vw` (Viewport Width):** 1vw is exactly 1% of the width of the browser window. (`100vw` = full width).
- **`vh` (Viewport Height):** 1vh is exactly 1% of the height of the browser window. (`100vh` = full height).
- **Initial value / Inherited / Animatable:** N/A (These are value types).
- **Applies to:** Any property that accepts a length (`width`, `height`, `font-size`, `padding`, etc.).

### Viewport Minimum & Maximum
- **`vmin`:** 1% of whichever is *smaller*: the width or the height. 
- **`vmax`:** 1% of whichever is *larger*: the width or the height.

## 3. Syntax Evolution & Modern Usage

**The Mobile Scrollbar Bug**
In the early days of mobile web design, developers used `height: 100vh;` to make full-screen hero sections. But mobile browsers (like Safari on iOS) have a URL address bar that dynamically hides and shows as you scroll.
When the URL bar is visible, `100vh` ignores it and draws the box *behind* the URL bar, cutting off the bottom of your content!

Modern CSS (Level 4) fixed this by introducing specific viewport units:
- **`svh` (Small Viewport Height):** The safe height when the URL bar is fully expanded.
- **`lvh` (Large Viewport Height):** The maximum height when the URL bar is fully hidden.
- **`dvh` (Dynamic Viewport Height):** The height that dynamically calculates and shifts as the URL bar appears/disappears.

Always use `100dvh` instead of `100vh` for full-screen mobile layouts today.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  height: 50 vh; /* Invalid! */
  width: 100vw%; /* Invalid! */
}
```

**Error Recovery:**
- `height: 50 vh;` is dropped due to the space.
- `width: 100vw%;` is dropped. You cannot combine two different units (viewport and percentage) into a single string. (You must use `calc()` to combine units, which we learn in Lesson 4).

## 5. Accessibility (A11y)

**The `vw` Font-Size Tragedy:**
Developers often think it's clever to make text infinitely scalable by writing `font-size: 5vw;`. This means the text is always 5% of the screen width.
This is an **accessibility disaster**. 
1. If the user opens the site on a massive 4K TV, the text becomes cartoonishly huge.
2. If the user opens it on a tiny phone, the text shrinks to micro-pixels and becomes completely unreadable.
3. If a visually impaired user uses their browser zoom feature, the font *ignores them* because the physical screen width hasn't changed! 
**Rule:** Never use pure `vw` for `font-size`.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** an element with `width: 50vw`.
2. Grab the edge of your browser window with your mouse and slowly drag it to make the window smaller and larger.
3. Watch the element resize in real-time. It is constantly recalculating its width to be exactly 50% of whatever the current window width is.
4. **Performance impact:** Viewport units are extremely performant because the browser engine hooks them directly into the window resize event. However, the modern `dvh` unit forces the browser to recalculate layout every frame while the user is scrolling on a mobile device (as the URL bar moves). Use `dvh` only when necessary for full-screen containers.

## 7. Prediction Checkpoints

### Checkpoint 1: Perfect Squares
```html
<style>
  .box {
    width: 50vw;
    height: 50vw;
    background: red;
  }
</style>
```
**Question:** If the user opens this on a tall, narrow mobile phone, what shape is the red box? (A tall rectangle, or a perfect square?)

*...predict your answer before reading below...*

**Explanation:** It is a **perfect square**. 
Even though `height` is usually vertical, we mapped it to `50vw` (Viewport Width). Because both the width and the height are pulling their math from the *exact same horizontal measurement*, they will always equal the exact same pixel value. This is a brilliant trick for building responsive squares.

## 8. Compare Similar Features

### `100%` vs `100vw`
- **`width: 100%`:** Fills 100% of the *parent element*.
- **`width: 100vw`:** Fills 100% of the *screen*. If the parent is a 400px column in the center of the page, `100vw` will aggressively break out of the column and smash into the left and right edges of the monitor.

## 9. Decision Guide

- **I want a hero image to fill the exact height of the user's phone screen** -> `height: 100dvh;`
- **I want a box to always be a perfect square** -> `width: 20vw; height: 20vw;`
- **I want fluid text that scales with the screen** -> *Wait for Lesson 4 where we learn `clamp()`! Never use pure `vw`.*

## 10. The Real Project

Apply this to our `styles.css`. Let's create a full-screen wrapper to center our card perfectly on the user's monitor.

```css
/* styles.css */
body {
  /* ... previous font properties ... */
  
  /* Make the body exactly the height of the user's screen, even on mobile */
  min-height: 100dvh;
  margin: 0;
  
  /* Flexbox (taught later) to center the card */
  display: flex;
  align-items: center;
}

.card {
  /* ... unchanged ... */
}
```

## 11. Mastery Checklist

- [ ] I can explain the difference between `100%` and `100vw`.
- [ ] I know why we use `100dvh` instead of `100vh` on mobile (The URL bar).
- [ ] I know why using `5vw` for `font-size` breaks accessibility zooming.
- [ ] I can use `vw` on both width and height to create a responsive square.
- [ ] I have applied the `100dvh` wrapper to my project code.
