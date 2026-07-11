---
series: css-fundamentals
level: 9
title: Reading & Debugging CSS
lang: css
---

# Reading & Debugging CSS

Knowing how to write CSS is not enough. Knowing how to read it — and how to diagnose why it is not working — is equally important. This lesson teaches the DevTools workflows that experienced developers use every day, the patterns behind common CSS bugs, and how to think about the cascade systematically when something goes wrong.

## The Browser DevTools

Every major browser has CSS debugging tools under the Elements panel (Chrome/Edge), Inspector (Firefox), or Web Inspector (Safari).

```text
Elements/Inspector panel:
  ├─ HTML tree (left)
  │    Click any element to select it.
  └─ CSS panels (right):
       ├─ Styles — all rules that target the selected element,
       │    including inherited rules and browser defaults.
       │    Struck-through rules LOST the cascade.
       │    Greyed-out checkboxes let you toggle rules on/off.
       └─ Computed — the final, resolved value of every property.
            Expand a property to see which rule set it.
```

The Computed panel is the ground truth. If you need to know the actual `background-color` of an element — not what you wrote, but what the browser computed — look there.

## Common CSS Bugs and Their Causes

**Bug 1: A rule you wrote is not applying.**

```text
Cause A: Another rule with higher specificity is overriding it.
  → Open Styles panel. Find your property struck through.
    Look at what is above it (higher specificity or later source order).

Cause B: A typo in the property name or value.
  → Browsers silently ignore invalid declarations. Check spelling.
    Unknown property? The DevTools Styles panel shows a yellow warning icon.

Cause C: Wrong selector — it is not matching the element.
  → Hover the rule in DevTools. Matched elements briefly highlight.
    Or run document.querySelectorAll('your-selector') in the console.
```

**Bug 2: An inherited value is applying when you don't want it.**

```text
Cause: The parent has the property set, and the child inherits it.
  → Computed panel → expand the property → see "Inherited from .parent".
  Fix: Explicitly set the property to `initial`, `unset`, or a specific value.
```

**Bug 3: Margin is not collapsing (or is collapsing unexpectedly).**

```text
This is one of the most common CSS surprises.
Adjacent vertical margins collapse into one (the larger wins).
  → 20px bottom margin + 20px top margin = 20px gap, not 40px.
This is covered in the Box Model series. For now: if spacing is wrong,
check computed margin values in DevTools.
```

**Bug 4: An element is not visible or has no size.**

```text
Cause A: display: none — the element exists in the DOM but is hidden.
Cause B: visibility: hidden — space is reserved but content is invisible.
Cause C: width or height is 0, or overflow: hidden clips the content.
Cause D: color and background-color are the same.
  → Check the Computed panel for these properties.
```

## The Cascade Debugging Process

When a style is not applying, follow this checklist in order:

```text
1. Is the selector matching?
   → Paste it into the console: document.querySelectorAll('your-selector').length
   → If 0, the selector does not match any element.

2. Is the property being overridden?
   → Styles panel: find the property struck through.
   → The overriding rule will be shown above it.

3. Is the value valid?
   → Yellow warning icon in Styles panel = unknown or invalid value.
   → Browser silently discards invalid declarations.

4. Is it an inheritance issue?
   → Computed panel: expand the property.
   → If "Inherited from ...", trace it to the source.

5. Is it the box model?
   → Computed panel: scroll to the layout box diagram (margin, border, padding, content).
   → Visualise where the space is going.
```

## Reading Someone Else's CSS

When you open a codebase you did not write:

```text
1. Find the main stylesheet. In a React project: App.css, index.css, globals.css.
   In a traditional project: styles.css or style.css.

2. Look for a :root block at the top — this is the design token system.
   The variable names tell you the intent of every colour and spacing value.

3. Look at the class naming convention (BEM, utility classes, component names).
   This tells you how the CSS is organised mentally.

4. When a specific component looks wrong:
   Inspect it in DevTools → identify the class names → find those classes in the stylesheet.

5. Never edit until you understand what you are editing.
   Changing one rule can cascade to dozens of elements.
```

## Using the Console to Interrogate Styles

The browser console can answer CSS questions programmatically:

```javascript
// Get the computed value of a property
getComputedStyle(document.querySelector('.card')).backgroundColor

// Get all CSS custom properties on :root
const rootStyles = getComputedStyle(document.documentElement)
rootStyles.getPropertyValue('--color-primary')

// Check if an element matches a selector
document.querySelector('.card').matches('.card.featured')

// Find all elements that match a selector
document.querySelectorAll('p:not(.note)').length
```

These are the same techniques used in the CSS challenge test runner — `getComputedStyle` is the authoritative source of what the browser actually applied.

## Challenge: debugging_scenario

The HTML and CSS below have a deliberate bug: the `.message` element should be green, but something is overriding it. Fix the CSS so the element's text colour is `rgb(22, 163, 74)` (green) and `font-size` is `1rem` (16px).

You can add, change, or remove any rule — but you must use at least one selector.

```html
<div id="container">
  <p class="message">Status: OK</p>
</div>
```

```challenge
#container p {
  color: rgb(220, 38, 38); /* red — this should lose */
  font-size: 0.875rem;
}

/* Fix the cascade so .message is green at 16px */

```

```test
var el = getComputedStyle(document.querySelector('.message'))
assert el.color === 'rgb(22, 163, 74)'
assert el.fontSize === '16px'
```
