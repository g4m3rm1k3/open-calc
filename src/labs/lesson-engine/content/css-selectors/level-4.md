---
series: css-selectors
level: 4
title: ":not(), :is(), :where()"
lang: css
---

# :not(), :is(), :where()

Three functional pseudo-classes that let you write complex selector logic concisely — negation, grouping, and zero-specificity grouping.

## :not() — Negation

`:not(selector)` matches every element that does NOT match the argument.

```css
/* Every li except the last one */
li:not(:last-child) {
  border-bottom: 1px solid #334155;
}

/* Every button except disabled ones */
button:not(:disabled) {
  cursor: pointer;
  background: #3b82f6;
}

/* Every p not inside .sidebar */
p:not(.sidebar p) {
  max-width: 65ch;
}
```

```text
:not() accepts any valid selector, including compound selectors.
It negates whatever matches inside the parentheses.
```

**CS lens:** `:not()` is logical negation in a selector. The set of matched elements is "everything this selector would match, minus what `:not()` says to exclude."

## :is() — Selector Grouping

`:is()` lets you pass a **list** of selectors and match any of them. It eliminates repetition.

```css
/* Without :is() — repetitive */
h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
  color: inherit;
  text-decoration: none;
}

/* With :is() — concise */
:is(h1, h2, h3, h4, h5, h6) a {
  color: inherit;
  text-decoration: none;
}
```

```text
:is(h1, h2, h3) a   →   matches an <a> inside any heading
```

The specificity of `:is()` is the specificity of its **most specific argument** — so `:is(#id, .class, p)` has ID-level specificity because `#id` is in the list.

## :where() — Zero-Specificity Grouping

`:where()` works identically to `:is()` but always has **zero specificity**.

```css
/* Reset link styles anywhere in these containers */
:where(header, footer, nav) a {
  text-decoration: none;
}
```

```text
:where() is useful for base styles and resets — styles you want to be
easy to override without needing higher-specificity selectors.
```

```css
/* :is() — high specificity, harder to override */
:is(.card, .panel) p { color: #94a3b8; }

/* :where() — zero specificity, easy to override */
:where(.card, .panel) p { color: #94a3b8; }
.card p { color: red; }  /* wins over :where() even with same specificity */
```

**SE lens:** `:where()` is the tool for writing design system base styles that downstream components can always override. Libraries like Tailwind's preflight use it so their resets never fight with your actual styles.

**Common mistakes:**
- Thinking `:not(.foo)` means "not an element with class foo" — it means "any element that doesn't match `.foo`", which includes elements with other classes AND elements of other types. `p:not(.foo)` is "a `<p>` element that does not have class `foo`" — much more specific.
- Using `:not()` with a complex selector in older browsers — `:not()` only accepted simple selectors before CSS Selectors Level 4. Compound selectors in `:not()` like `:not(.card p)` are modern CSS; check browser support if you need IE11.
- Forgetting that `:is()` takes the specificity of its most specific argument — `:is(#id, .class)` has ID-level specificity even when matching a class. Use `:where()` to avoid this.

**Debug tip:** Run `document.querySelectorAll('li:not(:last-child)')` in the Console to see which elements match before applying CSS. For `:is()` and `:where()`, the same approach works — the Selectors API supports all three.

**Next:** `:has()` — the parent selector. Select an element based on what its descendants contain — the feature CSS was missing for 25 years.

## Challenge: not-is-where

The HTML below has a list with a special `.skip` item and several headings with links. Apply styles using `:not()` and `:is()`.

1. Set `border-bottom` of every `<li>` **except** `.skip` to `1px solid rgb(51, 65, 85)`
2. Set `color` of `<a>` inside any heading (`h1`, `h2`, `h3`) to `rgb(148, 163, 184)`
3. Set `font-style` of every `<p>` that is **not** `.note` to `italic`

```html
<ul>
  <li id="a">Item 1</li>
  <li id="b" class="skip">Skip me</li>
  <li id="c">Item 3</li>
</ul>
<h2><a id="link" href="#">Heading link</a></h2>
<p id="p1">Normal paragraph</p>
<p id="p2" class="note">Note paragraph</p>
```

```challenge
/* Use :not(), :is(), or :where() */

```

```test
var a = document.querySelector('#a')
var b = document.querySelector('#b')
var link = document.querySelector('#link')
var p1 = document.querySelector('#p1')
var p2 = document.querySelector('#p2')
assert getComputedStyle(a).borderBottomColor === 'rgb(51, 65, 85)'
assert getComputedStyle(b).borderBottomStyle === 'none'
assert getComputedStyle(link).color === 'rgb(148, 163, 184)'
assert getComputedStyle(p1).fontStyle === 'italic'
assert getComputedStyle(p2).fontStyle === 'normal'
```
