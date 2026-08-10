# Concept: `getComputedStyle`

**What you'll understand by the end:** how to read the real, final CSS value actually applied to an element from JavaScript, as opposed to only what's written in an inline `style` attribute.

**Prerequisites:** `css-custom-properties.md`, `dom-query-selector.md`.

## Setup

Any plain HTML page with a `<style>` block or linked stylesheet — no build tool needed.

## The Problem

An element's real, final appearance is the result of the entire CSS cascade — rules from a stylesheet, inheritance, the browser's own defaults — not just whatever happens to be written directly in its `style="..."` attribute, which is often nothing at all. Reading `element.style.color` only ever sees that one, usually-empty, inline source — it says nothing about what a stylesheet actually made the element look like.

## The Isolated Example

```html
<style>
  p { color: rgb(70, 216, 159); }
</style>
<p id="target">Hello</p>
<script>
  const el = document.getElementById("target");
  console.log("inline style.color:", el.style.color);
  console.log("computed color:", getComputedStyle(el).color);
</script>
```

**Real output:**
```
inline style.color: 
computed color: rgb(70, 216, 159)
```

**What this proves:** `el.style.color` is empty — nothing was ever written to this element's own inline `style` attribute — while `getComputedStyle(el).color` correctly reports the real, final color the browser actually rendered, resolved entirely from the separate `<style>` rule via the cascade (see `css-rule-syntax-selectors-cascade.md`).

## Mechanical Walkthrough

- `getComputedStyle(element)` returns a live object representing every real, final CSS property value currently applied to `element`, after the browser has fully resolved the cascade, specificity, inheritance, and any custom property substitutions (see `css-custom-properties.md`).
- Properties are read off this object either by name (`.color`) or, for custom properties specifically, via `.getPropertyValue("--custom-name")` (dot-notation doesn't work for names containing `-`, which every custom property's name does).
- Values returned are always in their fully-resolved, browser-normalized form — a color declared as `#46d89f` in CSS is commonly returned as `"rgb(70, 216, 159)"` by `getComputedStyle`, a real, worth-expecting normalization, not a preserved copy of the original CSS text.
- The returned object is **live** — reading the same property again after the page's styling changes reflects the new, current value, without needing to call `getComputedStyle` again (though re-calling it is also completely safe and common).

## CS Lens

This is a real instance of exposing a **resolved, derived state** rather than raw input — `getComputedStyle` doesn't show what was *written*, it shows what the browser's own cascade-resolution algorithm actually *computed*, after combining every applicable rule. The same distinction (raw declared input versus fully resolved output) appears anywhere a system performs non-trivial resolution over layered inputs — a build system reporting a package's final resolved version number, after every version constraint across a dependency tree has been reconciled, is a similar shape in a completely different domain.

Also recognized in: any configuration system with layered overrides (environment-specific config merged over defaults) that provides a way to inspect the final, merged result rather than only the individual layers that produced it.

## SE Lens

Reading real, cascade-resolved values via `getComputedStyle` — rather than duplicating a color or spacing value directly in JavaScript code — is what keeps a single CSS source of truth genuinely single: any code that needs to know "what color is currently active" asks the browser what it actually rendered, rather than maintaining its own, separately-hardcoded guess that CSS could later silently disagree with. The real cost: `getComputedStyle` performs real work resolving the cascade, so calling it very frequently (inside a tight animation loop, for instance) is measurably more expensive than reading a plain JavaScript variable — a real, worth-knowing performance tradeoff for a technique otherwise well-suited to occasional reads.

## Connection

Builds on `css-custom-properties.md` and `dom-query-selector.md`'s underlying DOM-element-lookup mechanism. Commonly used specifically to bridge a value declared once in CSS into JavaScript/TypeScript code that needs the same value (for instance, handing a CSS-declared color to a non-CSS-aware rendering API).

## Try It Yourself

1. Read a property that was never explicitly set anywhere (e.g. `getComputedStyle(el).fontWeight` on a plain `<p>` with no font-weight rule) and confirm it still returns a real, valid value — the browser's own built-in default — proving `getComputedStyle` always reflects the true final state, never `undefined` for a valid property name.
2. Change the CSS rule's color value and re-read `getComputedStyle(el).color` without reloading the page — confirm it reflects the new value immediately, direct proof the object represents current, live state rather than a one-time snapshot taken when first called.
3. Compare `getComputedStyle(el).getPropertyValue("color")` against `getComputedStyle(el).color` for the same element — confirm both return the identical value, demonstrating the two access styles (method call versus property access) are equivalent for ordinary (non-custom) properties, while only the method form works for custom (`--`-prefixed) property names.
