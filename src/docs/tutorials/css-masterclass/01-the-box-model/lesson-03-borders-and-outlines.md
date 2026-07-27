# Lesson 3: Borders and Outlines

## 1. The Mental Model & Problem Solved

Once you have defined the dimensions, internal padding, and external margin of a box, the mathematical geometry exists, but it might be completely invisible on the screen. 

**The Problem:** We need a way to draw a physical line denoting the exact edge of an element, and we need to be able to soften the harsh 90-degree corners into curves.
**The Solution:** 
- `border`: Draws a physical stroke exactly between the padding and the margin, consuming space.
- `outline`: Draws a decorative stroke outside the border, *without* consuming space.
- `border-radius`: Applies a clipping mask to round the corners of the background and the border.

## 2. The Complete Grammar

### `border`
- **Formal syntax:** `border: <line-width> || <line-style> || <color>`
- **Accepted value types:** lengths (`px`, `rem`), keywords (`thin`, `medium`, `thick`), styles (`solid`, `dashed`, `dotted`, etc.), colors (`#hex`, `rgb`, etc.).
- **Initial value:** `medium none currentcolor`
- **Inherited:** No.
- **Animatable:** Yes (Width/Color are animatable; Style is not).
- **Percentages allowed?:** No.
- **Computed value:** Absolute pixels for width, absolute color for color.
- **Applies to:** All elements.

### `outline`
- **Formal syntax:** `outline: <outline-width> || <outline-style> || <outline-color>`
- **Initial value:** `medium none invert` (or `currentcolor`).
- **Inherited:** No.
- **Animatable:** Yes.
- **Percentages allowed?:** No.
- **Applies to:** All elements.

### `border-radius`
- **Formal syntax:** `border-radius: <length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
- **Initial value:** `0`.
- **Inherited:** No.
- **Animatable:** Yes.
- **Percentages allowed?:** Yes (Resolves against the corresponding box dimension—width for horizontal radius, height for vertical).
- **Applies to:** All elements.

## 3. Syntax Evolution & Modern Usage

In older CSS, rounding corners required creating 4 separate images (one for each corner) in Photoshop and using absolute positioning to stick them to the corners of a `<div>`. `border-radius` eliminated millions of lines of hacky code across the internet.

`outline` was historically used for accessibility (focus rings when tabbing through a page). Modern CSS introduced `outline-offset`, allowing the outline to float slightly away from the element, creating a beautiful halo effect.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  border: 1px red; /* Missing style! */
  border: 1px solid blurp; /* Invalid color! */
  border-radius: -10px; /* Invalid radius! */
}
```

**Error Recovery:**
- `border: 1px red;` is **valid but invisible**. The initial value for style is `none`. Because you omitted the style, the browser interprets it as `border: 1px none red;`. It draws a 1px invisible red line.
- `border: 1px solid blurp;` is dropped entirely.
- `border-radius: -10px;` is dropped. Radii cannot be negative.

## 5. Accessibility (A11y)

**Crucial A11y Rule:** Never, ever write `outline: none;` without providing an alternative focus state! 
When a user navigates a website using the `Tab` key on a keyboard (because they cannot use a mouse), the browser draws an `outline` around the currently focused element. If you remove the outline because you think it's ugly, keyboard users will have no idea where they are on the page. Use `:focus-visible { outline: 2px solid blue; }` to style it beautifully instead of deleting it.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** your card.
2. In the Styles tab, locate the `border: 1px solid #ccc;` rule.
3. Click on the color square next to `#ccc` to open the color picker.
4. Drag the opacity slider down. Notice how the border becomes transparent, but it *doesn't* reveal the card's background color beneath it. This proves that `border` lives strictly outside the padding layer, not on top of it.
5. **Performance impact:** `border-radius` can be expensive to render on mobile devices because it requires the GPU to generate an anti-aliased clipping mask. Animating `border-radius` triggers Paint.

## 7. Prediction Checkpoints

### Checkpoint 1: The Circle
```html
<style>
  .box {
    width: 200px;
    height: 200px;
    background: blue;
    border-radius: 50%;
  }
</style>
```
**Question:** What shape is drawn on the screen?

*...predict your answer before reading below...*

**Explanation:** A **perfect circle**. 
When `border-radius` uses percentages, 50% means the curve starts exactly halfway down the edge. On a perfect square, 50% creates a circle. (If it were a rectangle, 50% would create an oval).

### Checkpoint 2: Outline vs Border Geometry
```html
<style>
  .box-1 { border: 50px solid red; width: 100px; height: 100px; }
  .box-2 { outline: 50px solid blue; width: 100px; height: 100px; }
</style>
```
**Question:** Which box takes up more physical space on the webpage layout?

*...predict your answer before reading below...*

**Explanation:** **Box 1 (Red)** takes up more space.
`border` physically pushes surrounding elements away to make room for its 50px thickness. `outline` takes up 0 pixels in the layout engine—it draws its 50px blue line directly on top of whatever is next to it, overlapping it completely.

## 8. Compare Similar Features

### `border` vs `outline`
- **`border`:** Consumes layout space. Respects `border-radius` (curves with the corners).
- **`outline`:** Consumes 0 layout space (draws over other elements). Usually does *not* respect `border-radius` in older browsers, but modern browsers attempt to curve it. Best used for focus states.

## 9. Decision Guide

- **I want a permanent visible edge around my box** -> `border`
- **I want to highlight an element when the user tabs to it** -> `outline`
- **I want to make a circle for a user avatar** -> `border-radius: 50%;` (requires a square width/height)

## 10. The Real Project

Apply this to our `styles.css`.

```css
/* styles.css */
.card {
  width: 100%;
  max-width: 400px;
  min-height: 250px;
  padding: 24px;
  margin: 16px auto;
  
  /* Draw a 1px solid gray line around the box */
  border: 1px solid #ccc;
  
  /* Soften the sharp 90-degree corners */
  border-radius: 8px;
}
```

## 11. Mastery Checklist

- [ ] I can explain why `outline: none` ruins accessibility.
- [ ] I know that `border` takes up physical space, but `outline` does not.
- [ ] I can use `border-radius: 50%` to turn a square into a circle.
- [ ] I understand that omitting the border `style` makes the border invisible.
- [ ] I have applied the border and radius to my project code.
