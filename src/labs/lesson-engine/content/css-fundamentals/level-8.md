---
series: css-fundamentals
level: 8
title: Custom Properties
lang: css
---

# Custom Properties

Custom properties (often called CSS variables) let you store values with a name and reuse them across the stylesheet. They are not a preprocessor feature — they are native CSS, understood by the browser, and they respond to the cascade and inheritance in ways that Sass/Less variables cannot. Custom properties are the foundation of modern design systems, dark mode, and dynamic theming.

## Declaring and Using Custom Properties

```css
:root {
  --color-primary: #3b82f6;
  --color-text: #1e293b;
  --spacing-md: 1rem;
  --radius: 8px;
}

button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-md) calc(var(--spacing-md) * 2);
  border-radius: var(--radius);
  border: none;
}
```

```text
--color-primary: #3b82f6  — declaration: name starts with --, value is anything
var(--color-primary)       — usage: reads the current value
```

**Naming:** custom property names start with `--` and are case-sensitive. `--color-primary` and `--Color-Primary` are different properties. Convention: use kebab-case.

**`:root`:** CSS `:root` matches the document root (`<html>`), with one level of specificity higher than `html`. Variables declared here are available everywhere in the document.

**CS lens:** Custom properties are resolved at **computed value time**, not at parse time. This means they participate in the cascade and can be different for different elements. A Sass variable is expanded at build time and cannot change based on DOM context.

## Fallback Values

`var()` accepts an optional fallback, used if the variable is not set:

```css
.card {
  color: var(--card-text, #1e293b);          /* fallback: #1e293b */
  background: var(--card-bg, var(--bg-default, white)); /* nested fallback */
}
```

The fallback is anything after the first comma. It can itself be another `var()`.

## Custom Properties in the Cascade and Inheritance

This is where custom properties differ from Sass variables — they inherit and cascade:

```css
:root     { --accent: blue; }
.dark     { --accent: lightblue; }
.inverted { --accent: navy; }

button {
  background-color: var(--accent);
}
```

```html
<div class="dark">
  <button>Inside .dark → lightblue background</button>
  <div class="inverted">
    <button>Inside .inverted → navy background</button>
  </div>
</div>
<button>At root → blue background</button>
```

Each button picks up the nearest ancestor's value of `--accent`. Overriding a custom property in a component re-themes all descendants automatically.

This is how dark mode works:

```css
:root {
  --bg: white;
  --text: #1e293b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --text: #f1f5f9;
  }
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

Change two variables → the entire page re-themes. No JavaScript needed.

## calc() — Arithmetic with Variables

`calc()` lets you compute values, including mixing units:

```css
:root {
  --sidebar-width: 280px;
  --gap: 1.5rem;
}

.main-content {
  width: calc(100% - var(--sidebar-width) - var(--gap));
  margin-left: calc(var(--sidebar-width) + var(--gap));
}

.scale-font {
  font-size: calc(1rem + 0.5vw);  /* fluid typography */
}
```

```text
calc(100% - 280px - 1.5rem) — browser computes this at layout time
The mixed units (%, px, rem) are resolved when the layout is calculated.
```

`calc()` supports `+`, `-`, `*`, `/`. Whitespace around `+` and `-` is required.

## A Design Token System

The professional use case for custom properties is a **design token system** — named values for all visual decisions:

```css
:root {
  /* Colour palette */
  --blue-500: #3b82f6;
  --blue-700: #1d4ed8;
  --slate-900: #0f172a;
  --slate-100: #f1f5f9;

  /* Semantic tokens */
  --color-brand: var(--blue-500);
  --color-brand-hover: var(--blue-700);
  --color-surface: white;
  --color-text: var(--slate-900);

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

Palette tokens describe raw colours. Semantic tokens reference palette tokens and describe *intent* (`--color-brand`). Components use semantic tokens. When the brand colour changes, update one palette token — everything updates.

**SE lens:** This is the CSS equivalent of named constants in programming. Magic numbers scattered through code become unmaintainable; magic colours scattered through CSS have the same problem. A design token system makes the relationship between design decisions and CSS explicit and auditable.

## Challenge: design_tokens

Define the following custom properties on `:root`:
- `--color-primary: #6d28d9` (purple)
- `--color-bg: #faf5ff` (very light purple)
- `--radius: 12px`
- `--spacing: 1.25rem`

Then apply them so that `#card` has:
- `background-color: var(--color-bg)`
- `border: 2px solid var(--color-primary)`
- `border-radius: var(--radius)`
- `padding: var(--spacing)`

```html
<div id="card">Content</div>
```

```challenge
:root {

}

#card {

}
```

```test
var card = getComputedStyle(document.querySelector('#card'))
assert card.backgroundColor === 'rgb(250, 245, 255)'
assert card.borderTopColor === 'rgb(109, 40, 217)'
assert card.borderTopWidth === '2px'
assert card.borderRadius === '12px'
assert card.paddingTop === '20px'
```
