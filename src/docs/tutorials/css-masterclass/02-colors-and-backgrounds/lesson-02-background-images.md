# Lesson 2: Background Images

## 1. The Mental Model & Problem Solved

The `background-image` property doesn't just load pictures; it defines the visual texture of the element's background layer. 

**The Problem:** If you place an HTML `<img>` tag on a page, it takes up physical layout space and pushes text out of the way. If you try to put text *over* an `<img>` tag, you have to use complex absolute positioning.
**The Solution:** `background-image` paints the graphic directly onto the background canvas of the box. The text naturally flows over it because the image isn't part of the document flow; it's just "wallpaper".

## 2. The Complete Grammar

### `background-image`
- **Formal syntax:** `background-image: <bg-image>#` (Can accept a comma-separated list of multiple images!)
- **Accepted value types:** `url(...)`, `linear-gradient(...)`, `radial-gradient(...)`, `none`.
- **Initial value:** `none`.
- **Inherited:** **No.**
- **Animatable:** Yes (But usually terrible for performance unless using cross-fades).
- **Percentages allowed?:** N/A.
- **Computed value:** Absolute URI or gradient function.
- **Applies to:** All elements.

### `background-size`
- **Formal syntax:** `background-size: <bg-size>#`
- **Accepted value types:** `cover`, `contain`, lengths (`px`), percentages (`%`).
- **Initial value:** `auto` (The image's natural physical size).
- **Inherited:** No.
- **Animatable:** Yes.

### `background-repeat`
- **Initial value:** `repeat` (Tiles infinitely in both X and Y directions).

### `background-position`
- **Initial value:** `0% 0%` (Top Left corner).

## 3. Syntax Evolution & Modern Usage

Background properties are so commonly used together that CSS provides a `background` shorthand property.
```css
background: url('img.jpg') center / cover no-repeat;
```
However, using the shorthand can be dangerous because any property you *don't* specify is secretly reset to its initial value. If you write `background: url('a.jpg');`, it implicitly sets `background-size: auto` and wipes out any previous `background-size: cover` you might have declared earlier. Therefore, it's often safer to write out the individual properties when maintaining large codebases.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  background-image: url('missing-file.jpg');
  background-size: shrink; /* Invalid! */
}
```

**Error Recovery:**
- `url('missing-file.jpg');` is **valid CSS**. The CSS parser has no idea the file is missing until the network request fails milliseconds later. The browser simply leaves the background transparent and moves on without crashing.
- `background-size: shrink;` is dropped entirely. The valid keywords are `cover` or `contain`.

## 5. Accessibility (A11y)

Never use `background-image` for a graphic that contains vital information (like a chart with data, or a logo with text). Screen readers **cannot see background images** and will completely ignore them. 

If the image is purely decorative (like a subtle texture or a stock photo of a landscape behind a title), use `background-image`. If the image is actual data the user needs to understand, use an HTML `<img>` tag with an `alt="Description"` attribute.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** an element with a background image.
2. In the Styles tab, locate the `background-size: cover;` rule.
3. Click the value `cover` and type `contain` instead. Watch how the image suddenly stops cropping itself and shrinks to fit entirely inside the box, leaving empty white space around it.
4. Delete the `background-repeat: no-repeat;` line. If the image is smaller than the box, you will instantly see it tile infinitely like bathroom tiles.
5. **Performance impact:** High-resolution background images take time to download. The browser will render the text immediately, but the background will remain blank until the image arrives. Always specify a fallback `background-color` so the text is still readable while the image is downloading.

## 7. Prediction Checkpoints

### Checkpoint 1: Multiple Backgrounds
```html
<style>
  .box {
    background-image: url('top-layer.png'), url('bottom-layer.jpg');
  }
</style>
```
**Question:** CSS allows a comma-separated list of images. Which image renders on top?

*...predict your answer before reading below...*

**Explanation:** The **first image (`top-layer.png`)** renders on top. 
CSS background layers stack like a deck of cards, with the first item in the list being the top card closest to the user.

## 8. Compare Similar Features

### `background-size: cover` vs `background-size: contain`
- **`cover`:** Guarantees the entire box is filled. If the image and box have different aspect ratios, the image is zoomed in and the edges are cropped off. No empty space is ever allowed.
- **`contain`:** Guarantees the entire image is visible. If the aspect ratios differ, the image shrinks until it fits, leaving empty "letterbox" space inside the box.

## 9. Decision Guide

- **I want a hero image that fills the whole screen without stretching** -> `background-size: cover; background-position: center;`
- **I have a company logo that must not be cropped** -> `background-size: contain; background-repeat: no-repeat;`
- **I want a seamless repeating brick texture** -> `background-repeat: repeat;`

## 10. The Real Project

Apply this to our `styles.css`. We will use a placeholder image for now, and ensure it covers the card perfectly without repeating.

```css
/* styles.css */
.card {
  width: 100%;
  max-width: 400px;
  min-height: 250px;
  padding: 24px;
  margin: 16px auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  
  /* Apply the background image stack */
  background-color: #ffffff; /* Fallback color while image loads! */
  background-image: url('https://via.placeholder.com/400x250');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  color: #333333;
}
```

## 11. Mastery Checklist

- [ ] I know why we use `background-image` for decoration and `<img>` for semantic data.
- [ ] I can explain the visual difference between `cover` and `contain`.
- [ ] I know why the default `background-repeat` behavior causes tiling.
- [ ] I understand that CSS doesn't error if the image URL is broken.
- [ ] I can toggle `cover` to `contain` in DevTools to see the layout shift.
- [ ] I have applied the background image rules to my project code.
