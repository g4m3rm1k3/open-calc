# Concept: Writing a CSS Custom Property from JavaScript

**What you'll understand by the end:** how to change a CSS custom
property's actual value from JavaScript, at runtime — not just read one
back (`browser-getcomputedstyle.md`), but genuinely change what every
rule using `var(--that-property)` renders as, with no page reload.

**Prerequisites:** `css-custom-properties.md`, `browser-getcomputedstyle.md`.

## Setup

Any plain HTML page with a `<style>` block or linked stylesheet — no
build tool needed. Verified this session using `jsdom`, a library that
implements the DOM in plain Node.js for testing purposes:
```
npm install jsdom
```

## The Problem

`css-custom-properties.md` showed how to *declare* `--color-bg` once and
reuse it everywhere via `var(--color-bg)`, and `browser-getcomputedstyle.md`
showed how to *read* its current value back into JavaScript. Neither
shows how to change it — and a real theme switcher needs exactly that: one
JavaScript call that updates a value, after which every CSS rule already
written with `var(--color-bg)`, anywhere in the stylesheet, picks up the
new value immediately, with no rule ever needing to be rewritten.

## The Isolated Example

```javascript
const root = document.documentElement;
console.log("before:", getComputedStyle(root).getPropertyValue("--color-bg") || "(empty)");
root.style.setProperty("--color-bg", "#ff0000");
console.log("after setProperty:", getComputedStyle(root).getPropertyValue("--color-bg"));
```

**Real output, run this session:**
```
before: (empty)
after setProperty: #ff0000
```

**What this proves:** before any JavaScript ran, `--color-bg` had never
been declared at all, so reading it back produced nothing; a single
`setProperty` call is enough to give it a real value, immediately
readable back through the exact same `getComputedStyle` path
`browser-getcomputedstyle.md` already established for reading any other
CSS value.

## Mechanical Walkthrough

- `document.documentElement` — **(b) reappearing** — the `<html>` element
  itself, already used as the natural place to declare project-wide
  custom properties in `css-custom-properties.md`'s own `:root` selector
  (`:root` and `document.documentElement` refer to the exact same element).
- `.style` — **(b) reappearing**, per `browser-getcomputedstyle.md` —
  the element's own *inline* style object, as opposed to `getComputedStyle(...)`'s
  fully-resolved view.
- `.setProperty(name, value)` — **(a) first appearance** — a method on
  that inline style object specifically for custom properties (a plain
  `element.style.color = "red"` assignment only works for real, built-in
  CSS properties; a name starting with `--` has to go through
  `setProperty` instead). Writes `value` into the element's own inline
  style, under the given custom property name — which then wins the
  cascade over whatever a stylesheet's `:root` block declared, because
  inline styles always outrank stylesheet rules.
- `getComputedStyle(root).getPropertyValue("--color-bg")` — **(b)
  reappearing**, per `browser-getcomputedstyle.md` — confirms the change
  by reading the *resolved* value back, the same call used before any
  change was made.

## CS Lens

This is a direct, physical reflection of the browser's own
**cascade-and-recompute model**: every property on every element is
recomputed from all applicable rules whenever any input to that
computation changes, and an inline custom property is simply the
highest-priority input available. Nothing here is a snapshot taken once
and manually reapplied — the browser itself keeps every `var(--color-bg)`
usage, everywhere in the page, wired to this one source of truth.

Also recognized in: spreadsheet formulas recalculating when a referenced
cell changes, reactive/observable state libraries, any "single source of
truth, many dependent views" architecture.

## SE Lens

The real alternative is generating and swapping an entire second
stylesheet (a `<link>` tag pointing at a different `.css` file per theme,
or a `<style>` block whose full text gets replaced). That alternative
scales to changing *anything* about the CSS, including rules that don't
use custom properties at all — a real capability this approach doesn't
have. It costs real duplication: every rule has to exist, in full, in
every stylesheet variant. `setProperty` on a handful of custom properties
is the better fit specifically when every themeable difference already
funnels through a small, fixed set of named values — which is exactly
what a`design-tokens-theming-pattern.md` catalog is built to guarantee.

## Connection

Builds on `css-custom-properties.md` and `browser-getcomputedstyle.md`.
Used in this project's real code as the actual mechanism behind
`design-tokens-theming-pattern.md`'s theme switch — every token a theme
defines gets pushed in with one `setProperty` call each.

## Try It Yourself

1. Set a custom property on a specific element instead of
   `document.documentElement`, declare a rule elsewhere using
   `var(--that-property)` on a *different* element, and confirm the
   second element does *not* pick up the change — custom properties
   inherit down the DOM tree, they don't broadcast globally, which is
   exactly why this project sets them on `documentElement`, the ancestor
   of everything.
2. Call `root.style.removeProperty("--color-bg")` after setting it, then
   read it back with `getComputedStyle` — confirm it falls back to
   whatever a stylesheet's own `:root` block declares, rather than
   staying empty.
