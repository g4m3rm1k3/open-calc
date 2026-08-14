# Concept: CSS Custom Properties (CSS Variables)

**What you'll understand by the end:** how to declare a named, reusable value in CSS, use it throughout a stylesheet, and read it back from JavaScript.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Any plain HTML file with a `<style>` block or linked stylesheet — no build tool needed.

## The Problem

A color, spacing value, or font used in several different CSS rules, written out literally each time (`#07111e` repeated in ten different rules), means changing that value later requires finding and editing every single occurrence — real, error-prone repetition, and a real risk of missing one and ending up with an inconsistent result.

## The Isolated Example

```css
:root {
  --brand-color: #46d89f;
}

h1 {
  color: var(--brand-color);
}

button {
  background-color: var(--brand-color);
  border: 2px solid var(--brand-color);
}
```

**Real, rendered result:** the heading's text, and the button's background and border, all render in the identical green (`#46d89f`) — three separate rules, one real source of truth.

**Changing exactly one line:**
```css
:root {
  --brand-color: #ff8b8b;
}
```
**Real result:** all three — heading text, button background, button border — immediately render red instead, with zero changes to any rule that uses `var(--brand-color)`.

**What this proves:** every consumer of `--brand-color` updated together, from one single edit — direct, visible confirmation that they all really do read from the same named source, not three independently-set matching values that merely started out equal by coincidence.

## Mechanical Walkthrough

- `--brand-color: #46d89f;` declares a **custom property** — the `--` prefix is required and is what distinguishes a custom (author-defined) property from a real, built-in CSS property like `color` or `background-color`.
- Declaring it inside `:root { ... }` scopes it to the document's root element — since CSS's inheritance (see `css-rule-syntax-selectors-cascade.md`) flows custom properties down to descendants exactly like any other inherited value, this makes it effectively available anywhere in the page.
- `var(--brand-color)` substitutes the custom property's current value wherever it appears — used as an ordinary value inside any declaration (`color: var(--brand-color);`), anywhere a literal value like `#46d89f` could otherwise go.
- Unlike a compile-time-only preprocessor variable (Sass/LESS variables, which are resolved once, when the stylesheet is compiled), a CSS custom property is a **real, live, runtime value** — it can be read and even reassigned dynamically via JavaScript (`element.style.setProperty("--brand-color", "blue")`), and changes take effect immediately, with no rebuild step.
- `var()` optionally accepts a second argument as a fallback (`var(--maybe-undefined, black)`), used if the named custom property was never actually declared.

## CS Lens

This is **named, indirect reference** applied to a stylesheet — the same underlying idea as a constant in a programming language (`_MOTION_CODES` in `dict-as-lookup-table.md`'s domain, or `DEFAULT_MOTION` from `python-default-parameter-values.md`'s neighboring lesson): a single source of truth referenced everywhere it's needed, rather than the same literal value duplicated at every point of use.

Also recognized in: Sass/LESS's own compile-time variables (an earlier, less powerful version of this same idea, resolved before any CSS ships, rather than live in the browser), and design-token systems generally (Material Design, most major design systems define colors/spacing once, centrally, and reference them everywhere).

## SE Lens

Because custom properties are real, live browser values (not resolved away at build time), they enable use cases a compile-time-only variable system cannot: switching an entire page's color scheme at runtime by reassigning a handful of custom properties on `:root` (a real, common technique for implementing light/dark mode), with every rule using `var(...)` picking up the change automatically, with no rebuild and no JavaScript touching individual elements at all.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md`. Directly enables `browser-getcomputedstyle.md`'s technique for reading a CSS-declared value back into JavaScript/TypeScript code.

## Try It Yourself

1. Declare a custom property with no fallback, reference it with `var(--never-declared)` on some element's `color`, and observe the real, resulting behavior (the property falls back to its *inherited* or initial value, not an error) — then add a fallback (`var(--never-declared, orange)`) and confirm it's used instead.
2. Override a `:root`-scoped custom property inside a more specific selector (e.g. `.dark-section { --brand-color: black; }`) and confirm elements inside `.dark-section` use the overridden value while elements outside it still use `:root`'s original — direct proof custom properties follow the same cascade/inheritance rules as any other CSS value.
3. Use JavaScript to read a custom property's live value (`getComputedStyle(document.documentElement).getPropertyValue("--brand-color")`) and then change it (`document.documentElement.style.setProperty("--brand-color", "purple")`) — confirm the page's rendering updates immediately, with no page reload.
