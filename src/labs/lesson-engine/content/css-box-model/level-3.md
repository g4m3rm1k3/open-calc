---
series: css-box-model
level: 3
title: Border & Outline
lang: css
---

# Border & Outline

Borders are part of the box model — they occupy space and affect layout. Outlines look like borders but do not affect layout at all. Understanding the difference determines which you reach for.

## Border shapes and styles

Try changing `border-style` to `dashed`, `dotted`, or `double`. Change `border-radius` to `50%` to make a circle.

```html
<div id="card">Edit the CSS and watch me change</div>
```

```css
#card {
  width: 200px;
  padding: 24px;
  border: 4px solid #3b82f6;
  border-radius: 12px;
  background: #1e293b;
  color: #e2e8f0;
  font-family: system-ui;
  text-align: center;
}
```

## Per-side borders

Each side can have a different width, style, and colour. The left blue bar pattern is one of the most common UI decorations in dashboards and alert components.

```html
<div class="alert" id="info">Info — border-left accent</div>
<div class="alert" id="warn">Warning — thicker top border</div>
<div class="alert" id="pill">Pill button shape</div>
```

```css
.alert { padding: 12px 16px; margin-bottom: 8px; font-family: system-ui; color: #e2e8f0; background: #1e293b; }
#info  { border-left: 4px solid #3b82f6; border-right: none; border-top: none; border-bottom: none; }
#warn  { border-top: 4px solid #f59e0b; border-bottom: 1px solid #475569; border-left: none; border-right: none; }
#pill  { border-radius: 9999px; border: 2px solid #6366f1; display: inline-block; }
```

**CS lens:** Border is part of the box model. Each pixel of border width is added to (or subtracted from, with `border-box`) the rendered element size. Border always sits between padding and margin.

## Outline — visible but takes no space

`outline` looks like a border but is painted outside the border-box and takes up **no space**. Shift the layout never. This is why focus rings use `outline` — showing them should never move other elements.

```html
<button id="btn-border">border: 2px — shifts layout</button>
<button id="btn-outline">outline: 2px — no shift</button>
<p id="note">The border button is slightly larger. The outline button is identical in size to an unfocused button.</p>
```

```css
button { padding: 10px 20px; margin: 8px; font-family: system-ui; background: #1e293b; color: #e2e8f0; cursor: pointer; font-size: 14px; }
#btn-border  { border: 4px solid #3b82f6; }
#btn-outline { border: 1px solid #334155; outline: 4px solid #3b82f6; outline-offset: 3px; }
#note { color: #94a3b8; font-size: 12px; font-family: system-ui; }
```

## box-shadow — depth and focus rings without layout impact

`box-shadow` is also paint-only. Use it for card elevation or as a focus indicator alternative to `outline`. Try editing the blur and spread values.

```html
<div id="raised">Elevated card — box-shadow for depth</div>
<input id="focused" type="text" value="Focused input — inset shadow ring" />
```

```css
#raised  { padding: 20px; background: #1e293b; color: #e2e8f0; font-family: system-ui; box-shadow: 0 4px 6px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 12px; }
#focused { display: block; padding: 10px; background: #0f172a; color: #e2e8f0; border: 1px solid #334155; font-family: system-ui; font-size: 14px; box-shadow: inset 0 0 0 2px #3b82f6; width: 100%; box-sizing: border-box; outline: none; }
```

**SE lens:** Never remove `outline: none` without providing a custom focus indicator. Keyboard users rely on focus styles to navigate. Replacing the browser outline with a custom `box-shadow` or styled `outline` is fine — removing it entirely is an accessibility failure.

**Common mistakes:**
- Using `border-radius` and expecting child elements to be clipped — add `overflow: hidden` to the parent to clip children to the rounded corners.
- Setting `border: none` on an input to remove styles — this also removes the focus ring. Always provide a replacement focus style.
- Confusing `outline` and `border` when debugging layout shifts — if adding a visible ring shifts the layout, it is a border. If it does not, it is an outline.

**Debug tip:** In DevTools, outlines don't appear in the box model diagram (they take no space) but are visible in the Styles panel. If a focus ring is invisible, check for `outline: none` or `outline: 0` set in a CSS reset.

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
