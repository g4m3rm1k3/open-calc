---
series: css-fundamentals
level: 8
title: Custom Properties
lang: css
---

# Custom Properties

Custom properties (often called CSS variables) let you store values with a name and reuse them across the stylesheet. They are native CSS — they respond to the cascade and inheritance in ways that Sass/Less variables cannot. Custom properties are the foundation of modern design systems, dark mode, and dynamic theming.

## Declaring and Using Custom Properties

Custom property names start with `--`. Declare them on `:root` to make them available everywhere. Change `--color-primary` once and every element that references it updates.

```html
<button class="btn">Primary Button</button>
<button class="btn btn-outline">Outline Button</button>
<div class="card">
  <p>Card using the same --radius and --spacing tokens</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
:root {
  --color-primary: #3b82f6;
  --color-text: #e2e8f0;
  --spacing-md: 1rem;
  --radius: 8px;
}
.btn {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-md) calc(var(--spacing-md) * 2);
  border-radius: var(--radius);
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
}
.btn-outline {
  background-color: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}
.card {
  background: #1e293b;
  padding: var(--spacing-md);
  border-radius: var(--radius);
  color: var(--color-text);
  margin-top: 16px;
}
```

**Naming:** custom property names start with `--` and are case-sensitive. Convention: use kebab-case.

**CS lens:** Custom properties are resolved at **computed value time**, not at parse time. This means they participate in the cascade and can be different for different elements. A Sass variable is expanded at build time and cannot change based on DOM context.

## Fallback Values

`var()` accepts an optional fallback, used if the variable is not set. The card below uses `--card-text` which is not declared anywhere — so it falls back to `#1e293b`.

```html
<div class="card-a">Uses --card-text (not declared) → falls back to #e2e8f0</div>
<div class="card-b">Uses --card-bg (declared on this element) → custom green bg</div>
<div class="card-c">Nested fallback: --undefined → --color-primary → #3b82f6</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
:root { --color-primary: #3b82f6; }
.card-a, .card-b, .card-c {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--card-text, #e2e8f0);  /* fallback: #e2e8f0 */
}
.card-a { background: #1e293b; }
.card-b { --card-bg: #064e3b; background: var(--card-bg, #1e293b); }
.card-c { background: var(--undefined, var(--color-primary, #64748b)); }
```

The fallback is anything after the first comma. It can itself be another `var()` — nested fallbacks are valid.

## Custom Properties in the Cascade and Inheritance

Custom properties inherit — each button picks up the nearest ancestor's value of `--accent`. Overriding a custom property in a component re-themes all descendants automatically.

```html
<div class="root-level">
  <button class="themed-btn">Root level — blue accent</button>
  <div class="dark-zone">
    <button class="themed-btn">Inside .dark-zone — lightblue accent</button>
    <div class="inverted-zone">
      <button class="themed-btn">Inside .inverted-zone — navy accent</button>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
:root          { --accent: #3b82f6; }
.dark-zone     { --accent: #93c5fd; }
.inverted-zone { --accent: #1e3a5f; }
.root-level, .dark-zone, .inverted-zone {
  padding: 16px;
  background: #1e293b;
  border-radius: 8px;
  margin-bottom: 8px;
}
.themed-btn {
  background-color: var(--accent);   /* picks up nearest ancestor's --accent */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}
```

This is how dark mode works — change two variables on `:root` and the entire page re-themes with no JavaScript.

## calc() — Arithmetic with Variables

`calc()` lets you compute values at layout time, including mixing units. Edit `--sidebar-width` and the main content area adjusts automatically.

```html
<div id="layout">
  <aside id="sidebar">Sidebar<br>280px</aside>
  <main id="main">Main content<br>calc(100% - 280px - 1.5rem gap)</main>
</div>
<p id="fluid">Fluid font: calc(1rem + 0.5vw) — resize the preview to see it scale</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
:root {
  --sidebar-width: 280px;
  --gap: 1.5rem;
}
#layout {
  display: flex;
  gap: var(--gap);
  margin-bottom: 16px;
}
#sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 13px;
}
#main {
  width: calc(100% - var(--sidebar-width) - var(--gap));
  background: #0f172a;
  border: 1px solid #334155;
  padding: 16px;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  box-sizing: border-box;
}
#fluid {
  font-size: calc(1rem + 0.5vw);
  color: #818cf8;
  margin: 0;
}
```

`calc()` supports `+`, `-`, `*`, `/`. Whitespace around `+` and `-` is required.

## A Design Token System

The professional use case for custom properties is a **design token system** — named values for all visual decisions. Palette tokens describe raw colours; semantic tokens describe intent; components use semantic tokens.

```html
<div class="token-card">
  <span class="badge-brand">Brand</span>
  <h2 class="token-heading">Design Token Demo</h2>
  <p class="token-body">This card uses only semantic tokens. Change --blue-500 and everything updates.</p>
  <button class="token-btn">Primary Action</button>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
:root {
  /* Colour palette */
  --blue-500: #3b82f6;
  --blue-700: #1d4ed8;
  --slate-900: #0f172a;
  --slate-100: #f1f5f9;

  /* Semantic tokens */
  --color-brand:       var(--blue-500);
  --color-brand-hover: var(--blue-700);
  --color-surface:     #1e293b;
  --color-text:        var(--slate-100);

  /* Spacing scale */
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Radius */
  --radius-md: 8px;
}
.token-card {
  background: var(--color-surface);
  padding: var(--space-8);
  border-radius: var(--radius-md);
  color: var(--color-text);
  max-width: 400px;
}
.badge-brand {
  display: inline-block;
  background: var(--color-brand);
  color: white;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--space-2);
}
.token-heading { margin: var(--space-2) 0; font-size: 1.25rem; }
.token-body    { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: var(--space-4); }
.token-btn {
  background: var(--color-brand);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}
.token-btn:hover { background: var(--color-brand-hover); }
```

**SE lens:** This is the CSS equivalent of named constants in programming. Magic numbers scattered through code become unmaintainable; magic colours scattered through CSS have the same problem.

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
