---
series: css-selectors
level: 3
title: Form Pseudo-classes
lang: css
---

# Form Pseudo-classes

Forms have a rich set of states — checked, disabled, required, valid, invalid. CSS has pseudo-classes for all of them, letting you style form controls based on their actual state with no JavaScript required.

## :disabled and :enabled

Disabled inputs look visually distinct. Click the "Enable" button (JS) or just remove `disabled` from the HTML to see the styles switch.

```html
<form>
  <label>Name (enabled)</label>
  <input type="text" placeholder="Enter name" id="name-input">
  <label>Email (disabled)</label>
  <input type="email" value="locked@example.com" disabled id="email-input">
  <button type="button" id="btn-enabled">Enabled button</button>
  <button type="button" disabled>Disabled button</button>
</form>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
label { display: block; font-size: 12px; color: #94a3b8; margin: 10px 0 4px; }
input, button { display: block; width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 14px; margin-bottom: 4px; box-sizing: border-box; }
input:disabled { opacity: 0.4; cursor: not-allowed; background: #0f172a; }
button { cursor: pointer; background: #3b82f6; color: white; border: none; font-weight: 600; }
button:disabled { opacity: 0.4; cursor: not-allowed; background: #334155; }
```

**CS lens:** Focus is a browser-managed property — part of the DOM accessibility tree. `:focus` is a pseudo-class because it reflects runtime state, not document structure. The same applies to `:checked`, `:disabled`, and `:valid`.

## :required and :optional — visual priority

Required fields get an amber left accent; optional fields get a subtle grey one. No JavaScript, no class toggling.

```html
<form>
  <label>Full Name <span style="color:#f59e0b;">*</span></label>
  <input type="text" required placeholder="Required">
  <label>Company <span style="color:#475569;">(optional)</span></label>
  <input type="text" placeholder="Optional">
  <label>Email <span style="color:#f59e0b;">*</span></label>
  <input type="email" required placeholder="Required">
</form>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
label { display: block; font-size: 12px; color: #94a3b8; margin: 10px 0 4px; }
input { display: block; width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 14px; box-sizing: border-box; margin-bottom: 2px; }
input:required { border-left: 3px solid #f59e0b; }
input:optional { border-left: 3px solid #334155; }
```

## :valid and :invalid — live validation feedback

Type in the email field. The border turns green when the format is valid and red when it is not. No JavaScript event listeners.

```html
<form>
  <label>Email address</label>
  <input type="email" id="email" placeholder="you@example.com">
  <label>Username (min 3 chars)</label>
  <input type="text" id="user" minlength="3" placeholder="At least 3 characters">
  <label>Age (18-99)</label>
  <input type="number" id="age" min="18" max="99" placeholder="18 to 99">
</form>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
label { display: block; font-size: 12px; color: #94a3b8; margin: 10px 0 4px; }
input { display: block; width: 100%; padding: 10px 12px; border-radius: 6px; border: 2px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; }
input:not(:placeholder-shown):valid   { border-color: #10b981; }
input:not(:placeholder-shown):invalid { border-color: #ef4444; }
```

## :checked — pure CSS toggle patterns

When the checkbox is checked, the adjacent label changes style. No JavaScript. Click the checkbox to see it change.

```html
<ul style="list-style:none;padding:0;">
  <li><input type="checkbox" id="t1"> <label for="t1">Buy groceries</label></li>
  <li><input type="checkbox" id="t2" checked> <label for="t2">Write tests</label></li>
  <li><input type="checkbox" id="t3"> <label for="t3">Deploy to prod</label></li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
li { padding: 8px 0; display: flex; align-items: center; gap: 10px; }
label { color: #e2e8f0; cursor: pointer; font-size: 15px; }
input[type="checkbox"]:checked + label { color: #10b981; text-decoration: line-through; opacity: 0.7; }
input[type="checkbox"] { accent-color: #10b981; width: 16px; height: 16px; cursor: pointer; }
```

**SE lens:** These pseudo-classes let you give users visual feedback about form state without writing any validation JavaScript. The browser computes validity; CSS responds to it.

**Common mistakes:**
- Removing `outline: none` on `:focus` without providing a visible alternative — this breaks keyboard navigation. Always replace with a custom focus style.
- `:valid` matches empty unrequired inputs immediately on page load. Combine with `:not(:placeholder-shown)` to only style fields the user has interacted with.
- `:disabled` only works on actual form elements (`input`, `button`, `select`, etc.) — not on `<div>` or `<span>`.

**Debug tip:** DevTools Elements panel shows pseudo-class states under `:hov` (Force element state). Toggle `:disabled`, `:checked`, `:focus` to preview styles without interacting with the element.

**Next:** `:not()`, `:is()`, `:where()` — functional pseudo-classes for negation and grouping that eliminate repetitive selector lists.

## Challenge: form states

Apply styles purely with form pseudo-classes.

1. Set `opacity` of any `:disabled` input to `0.4`
2. Set `cursor` of any `:disabled` input to `not-allowed`
3. Set `border-left` of `:required` inputs to `3px solid rgb(245, 158, 11)`
4. Set `color` of the `<label>` after the `:checked` checkbox to `rgb(16, 185, 129)`
5. Set `font-weight` of that same label to `600`

```html
<input id="off" type="text" value="Disabled" disabled>
<input id="req" type="text" placeholder="Required field" required>
<input id="chk" type="checkbox" checked>
<label id="lbl">Task complete</label>
```

```challenge
/* Use form pseudo-classes */

```

```test
var off = document.querySelector('#off')
var req = document.querySelector('#req')
var lbl = document.querySelector('#lbl')
var sOff = getComputedStyle(off)
var sReq = getComputedStyle(req)
var sLbl = getComputedStyle(lbl)
assert sOff.opacity === '0.4'
assert sOff.cursor === 'not-allowed'
assert sReq.borderLeftWidth === '3px'
assert sReq.borderLeftColor === 'rgb(245, 158, 11)'
assert sLbl.color === 'rgb(16, 185, 129)'
assert sLbl.fontWeight === '600'
```
