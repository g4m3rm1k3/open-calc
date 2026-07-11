---
series: css-selectors
level: 3
title: Form Pseudo-classes
lang: css
---

# Form Pseudo-classes

Forms have a rich set of states — checked, unchecked, disabled, required, valid, invalid. CSS has pseudo-classes for all of them, so you can style form controls purely in CSS based on their actual state, with no JavaScript required.

## :checked

`:checked` matches checkboxes and radio buttons that are currently checked, and `<option>` elements that are selected.

```css
input[type="checkbox"]:checked + label {
  color: #10b981;
  text-decoration: line-through;
}
```

```text
The adjacent sibling combinator (+) selects the <label> immediately
after a CHECKED checkbox. When unchecked, the rule does not apply.
```

This is the foundation of pure-CSS toggle patterns — no JavaScript needed to reflect checked state.

## :disabled and :enabled

```css
input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #1e293b;
}

button:enabled {
  cursor: pointer;
  background: #3b82f6;
}
```

```text
:disabled — element has the disabled attribute (cannot be interacted with)
:enabled  — element is NOT disabled (interactive, the default)
```

## :required and :optional

```css
input:required { border-left: 3px solid #f59e0b; }
input:optional { border-left: 3px solid #475569; }
```

```text
:required — input has the required attribute
:optional — input does NOT have required (all other inputs)
```

## :valid and :invalid

`:valid` and `:invalid` reflect the browser's built-in form validation state.

```css
input:valid   { border-color: #10b981; }
input:invalid { border-color: #ef4444; }
```

```text
An <input type="email"> with a valid email address → :valid
An <input type="email"> with invalid text → :invalid
An <input required> that is empty → :invalid
```

**SE lens:** These pseudo-classes let you give users visual feedback about form state without writing any validation JavaScript. The browser computes validity; CSS responds to it.

## :focus

`:focus` applies when an element has keyboard or programmatic focus. It is the most important accessibility-related pseudo-class.

```css
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-color: #3b82f6;
}
```

**Important:** Never remove the focus outline without providing an alternative. The outline is how keyboard users know where they are.

**CS lens:** Focus is a browser-managed property — part of the DOM accessibility tree. `:focus` is a pseudo-class because it reflects runtime state, not document structure. The same applies to `:checked`, `:disabled`, and `:valid`.

**Common mistakes:**
- Removing `outline: none` on `:focus` without providing a visible alternative — this breaks keyboard navigation for all users. Always replace the outline with a custom focus style, never just remove it.
- Using `:disabled` on elements that don't support the `disabled` attribute (like `<div>` or `<span>`). Only form elements (`input`, `button`, `select`, `textarea`, `fieldset`) support `:disabled`.
- `:valid` matches as soon as the page loads — an empty unrequired input is `:valid` immediately, which may show green borders before the user types anything. Combine with `:not(:placeholder-shown)` to avoid styling empty inputs.

**Debug tip:** DevTools Elements panel shows pseudo-class states under `:hov` (Force element state). Toggle `:disabled`, `:checked`, `:focus` to preview styles without interacting with the element.

**Next:** `:not()`, `:is()`, `:where()` — functional pseudo-classes for negation and grouping that eliminate repetitive selector lists.

## Challenge: form states

The HTML below has a disabled input, a required input, and a checked checkbox. Apply styles purely with form pseudo-classes.

1. Set `opacity` of any `:disabled` input to `0.4`
2. Set `cursor` of any `:disabled` input to `not-allowed`
3. Set `border-left` of `:required` inputs to `3px solid rgb(245, 158, 11)` (amber)
4. Set `color` of the `<label>` after the `:checked` checkbox to `rgb(16, 185, 129)` (green)
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
