---
series: css-box-model
level: 3
title: Border & Outline
lang: css
---

# Border & Outline

Borders are part of the box model — they occupy space and affect layout. Outlines look like borders but do not affect layout at all. Understanding the difference determines which you reach for in a given situation.

## Border Properties

A border has three components: width, style, and colour.

```css
.card {
  border: 2px solid #334155;       /* shorthand: width style colour */

  /* Or set individually: */
  border-width: 2px;
  border-style: solid;
  border-color: #334155;

  /* Or per-side: */
  border-top: 4px solid #3b82f6;
  border-right: none;
  border-bottom: 1px dashed #475569;
  border-left: 4px solid #3b82f6;
}
```

```text
Border styles: solid | dashed | dotted | double | groove | ridge | none | hidden
```

## Border Radius

`border-radius` rounds the corners. It applies to the border-box (border + padding + content).

```css
.pill   { border-radius: 9999px; }    /* fully rounded sides */
.circle { border-radius: 50%; }        /* perfect circle (when width == height) */
.card   { border-radius: 8px; }        /* slight rounding */

/* Per-corner */
.asymmetric {
  border-radius: 8px 8px 0 0;  /* top-left top-right bottom-right bottom-left */
}
```

## Outline vs Border

```css
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 4px;
}
```

```text
border  → part of the box model; adds to element size; affects layout
outline → painted OUTSIDE the border; takes up NO SPACE; does not shift layout
```

`outline-offset` adds space between the element and the outline — this creates a visible gap between the focus ring and the button.

**CS lens:** An outline is a render-only decoration. It is drawn on top of whatever is behind the element, without affecting the flow of surrounding elements. This is why focus styles use `outline` and not `border` — showing a focus ring should never shift the page layout.

## box-shadow as an Alternative

`box-shadow` is also paint-only (no layout impact) and gives more control:

```css
.card {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Inset shadow */
.input:focus {
  box-shadow: inset 0 0 0 2px #3b82f6;
}
```

```text
box-shadow: offset-x  offset-y  blur  spread  colour
            0         1px       3px   (no spread)  rgba(0,0,0,0.3)
```

Multiple shadows are separated by commas. Like `outline`, they do not affect layout.

**SE lens:** Never remove `outline: none` without providing a custom focus indicator. Keyboard users rely on focus styles to navigate. Replacing the outline with a `box-shadow` is fine — removing it entirely is an accessibility failure.

**Common mistakes:**
- Using `border-radius` on an element and expecting the background to be clipped — it is, but only if `overflow` is not `visible`. For child elements that overflow rounded corners, add `overflow: hidden` to the parent.
- Setting `border: none` vs `border: 0` — both remove the border, but `none` sets `border-style` to none, while `0` sets `border-width` to 0. Both work; `none` is slightly more explicit.
- Confusing `outline` and `box-shadow` — outlines always form a rectangle (or follow `border-radius` in modern browsers); box-shadow follows `border-radius` naturally and can be blurred. Either works for focus rings.

**Debug tip:** In DevTools, outlines don't appear in the box model diagram (they take no space) but they are visible in the Styles panel. If a focus ring is invisible, check whether `outline: none` or `outline: 0` was set somewhere in the cascade — a common CSS reset culprit.

**Next:** Overflow — what happens when content is bigger than its container, and how `hidden`, `auto`, and `scroll` each handle it.

## Challenge: borders

Apply border and border-radius to `#card`.

1. Set `border` to `2px solid rgb(51, 65, 85)`
2. Set `border-top` to `4px solid rgb(59, 130, 246)` (overrides top only)
3. Set `border-radius` to `8px`
4. Set `padding` to `24px`

```html
<div id="card">Card content</div>
```

```challenge
#card {
  /* Apply border, border-top, border-radius, and padding */
}
```

```test
var card = document.querySelector('#card')
var s = getComputedStyle(card)
assert s.borderTopWidth === '4px'
assert s.borderTopColor === 'rgb(59, 130, 246)'
assert s.borderRightWidth === '2px'
assert s.borderRightColor === 'rgb(51, 65, 85)'
assert s.borderRadius === '8px'
assert s.paddingTop === '24px'
```
