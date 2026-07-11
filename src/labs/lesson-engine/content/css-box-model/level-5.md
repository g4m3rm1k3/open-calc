---
series: css-box-model
level: 5
title: Display — Block, Inline, Inline-Block
lang: css
---

# Display — Block, Inline, Inline-Block

The `display` property controls how an element participates in document flow. It determines whether the element takes up full width, flows with text, or sits somewhere in between.

## Block vs inline — see the difference

Same content, different `display` values. Change `display` between `block` and `inline` on `#b` to see the layout shift.

```html
<div id="a">Block A — full width, stacks vertically</div>
<div id="b">Block B — stacks below A even though there's room beside it</div>
<br>
<span id="c">Inline C</span>
<span id="d">Inline D — flows right beside C</span>
<span id="e">Inline E — wraps when the line fills</span>
```

```css
#a, #b { background: #3b82f6; color: white; padding: 10px; margin-bottom: 4px; font-family: system-ui; }
#c, #d, #e { background: #10b981; color: white; padding: 4px 8px; font-family: system-ui; }
```

**CS lens:** A block element generates a block-level box. The block formatting context means block boxes stack vertically. Their width defaults to 100% of the containing block. Inline elements generate inline-level boxes that flow in a line box.

## Width and height are ignored on inline elements

Try setting `width: 200px` and `height: 60px` on the `span` — nothing changes. Inline elements size to their content only.

```html
<p>Text before <span id="tag">I am inline — width and height do nothing</span> text after continues here without a break.</p>
```

```css
p    { color: #e2e8f0; font-family: system-ui; background: #1e293b; padding: 12px; }
#tag { background: #6366f1; color: white; padding: 4px 8px; width: 300px; height: 60px; /* these have no effect */ }
```

## inline-block — flows like text, sizes like a block

`inline-block` combines both: sits in a line like inline, but accepts `width`, `height`, and all sides of `margin`/`padding` like block. This is how badge and tag components work.

```html
<p id="prose">
  Status: <span class="tag green">Active</span>
  Role: <span class="tag blue">Admin</span>
  Plan: <span class="tag purple">Pro</span>
  These sit inline with the text and wrap naturally.
</p>
```

```css
#prose   { color: #e2e8f0; font-family: system-ui; background: #1e293b; padding: 16px; line-height: 2; }
.tag     { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.green   { background: #10b981; color: white; }
.blue    { background: #3b82f6; color: white; }
.purple  { background: #6366f1; color: white; }
```

## display: none vs visibility: hidden

`none` removes the element from layout entirely. `visibility: hidden` hides it but keeps its space. Edit both and watch what happens to the surrounding elements.

```html
<div id="a">Box A</div>
<div id="b">Box B — I am hidden but my space is reserved</div>
<div id="c">Box C — watch where I end up depending on how B is hidden</div>
```

```css
#a, #b, #c { padding: 16px; margin-bottom: 8px; font-family: system-ui; color: white; }
#a { background: #3b82f6; }
#b { background: #6366f1; visibility: hidden; /* try: display: none */ }
#c { background: #10b981; }
```

**SE lens:** `display: none` is the standard toggle for showing/hiding UI. `visibility: hidden` is useful when you want to hide content without causing layout shifts — e.g., hiding a placeholder at the same size as content that will load in.

**Common mistakes:**
- Setting `width` and `height` on an `inline` element expecting them to apply — switch to `display: inline-block` or `block`.
- Using `inline-block` for nav items and getting unexpected gaps — whitespace in HTML source creates small gaps. Fix with flexbox or `font-size: 0` on the parent.
- Using `display: none` for accessibility hiding — screen readers also ignore it. Use a visually-hidden class for content that should be hidden visually but read by screen readers.

**Debug tip:** In DevTools, elements with `display: none` appear dimmed in the Elements panel. To temporarily reveal a hidden element, select it and uncheck the `display` property in the Styles panel.

**Next:** Sizing constraints — `min-width`, `max-width`, `clamp()` — making elements responsive without media queries.

## Challenge: display

Apply display values to make the layout correct.

1. Set `display` of `#block-el` to `block` and `width` to `100%`
2. Set `display` of `#inline-el` to `inline`
3. Set `display` of `#ib` to `inline-block`, `padding` to `8px 16px`
4. Set `display` of `#gone` to `none`

```html
<div id="block-el">Block</div>
<span id="inline-el">Inline</span>
<span id="ib">Inline-Block</span>
<div id="gone">Hidden</div>
```

```challenge
/* Set display values */

```

```test
var block = document.querySelector('#block-el')
var inline = document.querySelector('#inline-el')
var ib = document.querySelector('#ib')
var gone = document.querySelector('#gone')
assert getComputedStyle(block).display === 'block'
assert getComputedStyle(block).width !== '0px'
assert getComputedStyle(inline).display === 'inline'
assert getComputedStyle(ib).display === 'inline-block'
assert getComputedStyle(ib).paddingTop === '8px'
assert getComputedStyle(gone).display === 'none'
```
