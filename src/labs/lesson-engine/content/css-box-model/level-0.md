---
series: css-box-model
level: 0
title: The Box Model
lang: css
---

# The Box Model

Every element in CSS is a rectangular box with four layers: content, padding, border, and margin. The example below shows all four on screen — edit the values and watch the box change.

## The four layers

Try changing `padding`, `border`, and `margin` to see exactly what each layer does. The blue area is the element background — it covers content and padding but not margin.

```html
<div id="box">Content</div>
<div id="neighbour">Neighbour element</div>
```

```css
#box {
  width: 200px;
  padding: 24px;
  border: 4px solid #3b82f6;
  margin: 32px;
  background: #1e293b;
  color: #e2e8f0;
  font-family: system-ui;
}
#neighbour {
  background: #0f172a;
  color: #94a3b8;
  padding: 12px;
  font-family: system-ui;
  font-size: 13px;
}
```

Notice: the margin area is transparent — you can see the page background through it. The padding area has the same blue-grey background as the content. That is the defining difference between them.

**CS lens:** This is a compositional data structure. Each box nests inside the next. The browser lays out the page by computing these four values for every element and placing the resulting rectangles in space.

## The content-box sizing trap

By default, `width` sets the content area only. Padding and border are added on top — so your box ends up wider than declared. Change `width` to `200px` and calculate what actually renders.

```html
<div id="trap">I declared width: 200px</div>
<div id="ruler" style="display:flex;margin-top:4px;">
  <div style="width:200px;height:4px;background:#3b82f6;"></div>
  <div style="width:48px;height:4px;background:#ef4444;"></div>
</div>
<p id="label">Blue = 200px declared. Red = 48px added by padding+border.</p>
```

```css
#trap {
  width: 200px;
  padding: 20px;
  border: 4px solid #6366f1;
  background: #1e293b;
  color: #e2e8f0;
  font-family: system-ui;
}
#label { color: #94a3b8; font-family: system-ui; font-size: 13px; margin: 4px 0; }
```

Total rendered width: 200 + 20 + 20 + 4 + 4 = **248px**. This surprises every developer the first time.

**SE lens:** When a layout behaves unexpectedly, the first step is always to open DevTools and inspect the box model. Wrong element size almost always means unexpected padding, border, or margin. Open DevTools now, select `#trap`, and look at the box model diagram in the Computed tab.

**Common mistakes:**
- Thinking `width: 200px` means the element is 200px on screen — by default it is 200px *content* plus padding plus border.
- Confusing padding and margin: padding has the element's background-color; margin is always transparent.
- Forgetting that `background-color` fills the padding area but NOT the margin area.

**Debug tip:** Open DevTools → Elements → select any element → look at the box at the bottom of the Computed tab. It shows exact pixel values for content, padding, border, and margin. Hover over each region to highlight that layer on the page.

**Next:** `box-sizing: border-box` — a single line that makes `width` and `height` mean what you actually want.

## Challenge: box_model

Apply box model properties to `#box` so the tests pass.

1. Set `width` to `200px`
2. Set `padding` to `20px` on all sides
3. Set `border` to `4px solid rgb(59, 130, 246)`
4. Set `margin` to `32px` on all sides

```html
<div id="box">Box</div>
```

```challenge
#box {
  /* Set width, padding, border, and margin */
}
```

```test
var box = document.querySelector('#box')
var s = getComputedStyle(box)
assert s.width === '200px'
assert s.paddingTop === '20px'
assert s.paddingRight === '20px'
assert s.borderTopWidth === '4px'
assert s.borderTopColor === 'rgb(59, 130, 246)'
assert s.marginTop === '32px'
```
