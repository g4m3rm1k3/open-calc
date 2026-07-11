---
series: css-fundamentals
level: 6
title: The Cascade
lang: css
---

# The Cascade

When two CSS rules target the same element and set the same property, something has to decide which one wins. That something is the **cascade** — the algorithm the browser uses to sort competing declarations and choose one. Cascade is not random; it is a deterministic priority system with four layers. Understanding it means never again wondering "why isn't my style applying?"

## The Four Cascade Layers (in priority order)

The cascade resolves conflicts by checking, in order:

```text
1. Origin & importance   — where did the rule come from, and is it !important?
2. Specificity           — how targeted is the selector?
3. Source order          — which rule comes later in the stylesheet?
4. Inheritance           — (only if no rule wins in 1–3)
```

Higher layers override lower layers completely. A more specific selector does not matter if a `!important` from a different origin already won.

## Layer 1 — Origin

CSS rules come from three origins, in priority order from lowest to highest (for normal rules):

```text
1. User-agent (browser defaults)  — lowest
2. User styles                    — middle (user's browser preferences)
3. Author (your stylesheet)       — highest
```

For `!important` rules, the order **reverses** (user-agent `!important` beats author `!important`). This protects accessibility settings — if a user forces large fonts via their browser, no author stylesheet can override that preference.

In practice, you write author styles. The browser default's lower priority is why your `color: red` on `p` beats the browser's built-in `p { color: black }`.

## Layer 2 — Specificity

Within the same origin, specificity determines which selector wins. Specificity is a three-part score (a, b, c):

```text
a = number of ID selectors (#)
b = number of class selectors (.), attribute selectors ([attr]), pseudo-classes (:hover)
c = number of type selectors (p, div), pseudo-elements (::before)
```

Examples:

```css
p                { color: black; }   /* (0,0,1) — type */
.note            { color: blue;  }   /* (0,1,0) — class */
p.note           { color: green; }   /* (0,1,1) — type + class */
#intro           { color: red;   }   /* (1,0,0) — ID */
#intro.note      { color: orange;}   /* (1,1,0) — ID + class */
```

```html
<p id="intro" class="note">What colour am I?</p>
```

```text
Competing: (0,0,1)=black, (0,1,0)=blue, (0,1,1)=green, (1,0,0)=red, (1,1,0)=orange
Highest a-count wins: (1,1,0) orange. Colour is orange.
```

Comparison is done left-to-right: a higher `a` always beats any `b` or `c`. Only if `a` is equal do you compare `b`, and only if both are equal do you compare `c`.

**CS lens:** Specificity is computed once per declaration and cached. The browser never "recalculates" it dynamically — it runs the cascade once during style recalculation, and the result is stored in the style structure. This is why CSS is generally performant even on large documents.

## Layer 3 — Source Order

When origin and specificity are equal, the **later** rule wins:

```css
p { color: red;  }   /* declared first */
p { color: blue; }   /* declared second — wins */
```

This is why the order of your CSS rules matters. In a large stylesheet, rules for specific components at the bottom of the file will override general rules at the top, which is usually what you want.

## !important — Escaping the Cascade

`!important` bypasses the normal cascade priority and promotes a declaration to the highest priority within its origin:

```css
.error {
  color: red !important; /* wins over any non-!important rule, regardless of specificity */
}

#special-case {
  color: green; /* loses to .error's !important, even though ID > class normally */
}
```

`!important` is not a tool to use regularly. It signals "this must always win" — a decision that creates future maintenance problems when you need to override it (you'd need another `!important` with equal or higher origin). Reserve it for utility classes that must always apply, and accessibility overrides.

## Practical Debugging

When a style is not applying:

```text
1. Open browser DevTools → Elements → Computed
2. Find the property that is wrong
3. Look at which rule is shown with strikethrough — that rule lost the cascade
4. Click the rule to see its selector and specificity
5. Find what is overriding it and why
```

The Computed panel shows the winning value; the Styles panel shows all competing rules, with losing ones struck through. This is the fastest path from "why isn't this working?" to "oh, that's why."

## Challenge: cascade_order

The HTML element `#message` has multiple rules competing for the same properties. Write rules so that:
1. A type selector `p` sets `color: black` and `font-size: 14px`
2. A class selector `.info` sets `color: blue` and `font-size: 16px`
3. The `#message` ID selector sets `color: green` — which should win due to higher specificity

The test verifies the computed result (what actually wins), not how many rules you wrote.

```html
<p id="message" class="info">Status message</p>
```

```challenge
p {

}

.info {

}

#message {

}
```

```test
var el = getComputedStyle(document.querySelector('#message'))
assert el.color === 'rgb(0, 128, 0)'
assert el.fontSize === '16px'
```
