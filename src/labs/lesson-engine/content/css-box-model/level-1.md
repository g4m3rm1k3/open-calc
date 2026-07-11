---
series: css-box-model
level: 1
title: box-sizing
lang: css
---

# box-sizing

The default CSS box model adds padding and border on top of the declared `width`, making it nearly impossible to build predictable layouts. `box-sizing: border-box` fixes this — and is used in every professional CSS project today.

## The Content-Box Problem

```css
.two-columns {
  float: left;
  width: 50%;
  padding: 20px;  /* adds 40px total (left + right) */
}
```

```text
Expected:  50% + 50% = 100% → fits perfectly
Actual:    50% + 40px + 50% + 40px = 100% + 80px → overflows
```

With `box-sizing: content-box` (the default), every time you add padding to a percentage-width element, the layout breaks. This is why CSS layouts were notoriously fragile in the early web.

## box-sizing: border-box

With `border-box`, the declared `width` and `height` include padding and border. The content box shrinks to accommodate them.

```css
.box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid #3b82f6;
}
```

```text
Total rendered width:  300px (EXACTLY — padding and border are inside)
Content width:         300px - 20px - 20px - 2px - 2px = 256px
```

You say `300px`, the element is `300px`. Padding and border are subtracted from the content area, not added to the outside.

## The Universal Reset

Every modern project applies this at the top of its stylesheet:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

```text
* → all elements
*::before, *::after → pseudo-elements too (they also form boxes)
```

This single rule makes all padding and border subtract from the declared size. Width means total width. Predictable. Always.

**CS lens:** `border-box` changes the semantics of the `width` property from "content area size" to "total element size including padding and border." This is the model most developers intuitively expect — and that most other layout systems use by default.

## When content-box is useful

Practically never for layout. The only case where `content-box` is intentional is when you want padding to push the visual boundary outward — such as an element whose `width` is computed from text length, where you want padding to add space around the text without affecting the text reflow.

**SE lens:** The CSS specification defaulted to `content-box` for historical reasons — it was an early specification decision that predated the problems it would cause. `border-box` is so universally preferred that the CSS working group has discussed making it the default in a future version.

**Common mistakes:**
- Applying `box-sizing: border-box` to one element and expecting it to inherit everywhere — `box-sizing` does not inherit by default. The universal reset (`*, *::before, *::after { box-sizing: border-box }`) is required to cover all elements.
- Using `box-sizing: border-box` and then being surprised that `min-width` and `max-width` also use border-box semantics — they do. The constraint applies to the total rendered width.
- Forgetting that `margin` is *never* included in `border-box` sizing — margin is always outside the box regardless of `box-sizing`.

**Debug tip:** In DevTools Computed tab, the box model diagram shows the content size separately from padding and border. With `border-box`, the content size will be smaller than your declared `width` (padding and border are subtracted from it). With `content-box`, the content size equals your declared `width`.

**Next:** Margin — the space outside the border — and the surprising behaviour of margin collapsing.

## Challenge: border-box

Apply `box-sizing: border-box` to `#box` so its total rendered width stays at `300px` despite padding and border.

1. Set `box-sizing` to `border-box`
2. Set `width` to `300px`
3. Set `padding` to `30px`
4. Set `border` to `5px solid rgb(16, 185, 129)`

The test verifies the computed `width` is still `300px` (not 370px).

```html
<div id="box">Fixed Width</div>
```

```challenge
#box {
  /* Make total width 300px including padding and border */
}
```

```test
var box = document.querySelector('#box')
var s = getComputedStyle(box)
assert s.boxSizing === 'border-box'
assert s.width === '300px'
assert s.paddingTop === '30px'
assert s.borderTopWidth === '5px'
```
