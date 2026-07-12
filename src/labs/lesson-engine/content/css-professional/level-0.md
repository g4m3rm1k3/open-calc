---
series: css-professional
level: 0
title: Cascade Layers
lang: css
---

# Cascade Layers

In any large CSS codebase, there comes a moment where you add a style and it doesn't work — because something else is overriding it. So you make the selector more specific. Then something else overrides that. Eventually you reach for `!important`. That flag then breaks something else. This cycle is the specificity war, and it's the most common source of CSS technical debt.

`@layer` ends it. Cascade layers let you declare which CSS has priority independent of selector specificity. A `.btn` rule in the `utilities` layer beats a `.sidebar .btn.active` rule in the `base` layer — not because it's more specific, but because you declared `utilities` above `base` in the layer order.

By the end of this lesson you will understand how cascade layers sit in the cascade priority order, be able to define a layered CSS architecture with `@layer`, and know when to use layers vs specificity to resolve CSS conflicts.

## The problem cascade layers solve

```html
<button class="btn">Base button</button>
<button class="btn btn-primary">Primary button</button>
```

```css
/* Without layers: specificity determines everything.
   .btn-primary has the same specificity as .btn — order matters.
   Themes, overrides, and third-party CSS fight over position in the file. */

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #e2e8f0;
  color: #1e293b;
  cursor: pointer;
  font-weight: 500;
}
/* If any rule above has higher specificity, this loses regardless of intent */
.btn-primary {
  background: #6366f1;
  color: white;
}
```

## @layer — explicit priority order

```html
<div class="layer-demo">
  <button class="btn">Default</button>
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
</div>
```

```css
/* Declare the layer stack — lower in the list = higher priority */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer base {
  body { font-family: system-ui, sans-serif; padding: 2rem; }
  button { cursor: pointer; }
}

@layer components {
  .btn {
    padding: 0.5rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 7px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 150ms;
  }
  .btn-primary   { background: #6366f1; color: white; border-color: #6366f1; }
  .btn-secondary { background: transparent; color: #6366f1; border-color: #6366f1; }
}

@layer utilities {
  /* Utilities always win over components — regardless of specificity */
  .mt-4 { margin-top: 1rem; }
  .hidden { display: none; }
}

.layer-demo { display: flex; gap: 0.75rem; }
```

**CS lens:** The cascade is a priority algorithm with multiple inputs: origin (browser/user/author), `!important`, layers, specificity, and source order. `@layer` inserts a new step between origin and specificity — layers declared later in the `@layer` statement beat those declared earlier, regardless of selector specificity. A `.btn` rule in the `utilities` layer beats a `#header .nav .btn.primary` rule in the `components` layer. Layer position wins over specificity.

## Layering third-party CSS

```html
<div class="third-party-demo">
  <p class="prose">This text is styled by a hypothetical third-party library, but our utilities can override it without specificity tricks.</p>
  <p class="prose mt-override">This one gets an override.</p>
</div>
```

```css
/* Wrap third-party CSS in a layer — it can never beat unlayered styles */
@layer third-party {
  /* Simulated third-party with aggressive specificity */
  .third-party-demo .prose {
    color: #0ea5e9;
    font-size: 1.1rem;
    line-height: 1.8;
    font-family: Georgia, serif;
  }
}

/* Unlayered CSS always wins over layered CSS */
.mt-override {
  color: #1e293b;   /* beats the layered rule even though it's less specific */
  font-family: system-ui, sans-serif;
}

.third-party-demo { padding: 1rem; background: #f8fafc; border-radius: 8px; }
```

**SE lens:** The most valuable use of `@layer` in production is taming third-party CSS. When you import a UI library (Bootstrap, Tailwind base styles, a component library), wrap it in `@layer vendor`. Now all your application styles — even low-specificity ones — automatically win without `!important`. This eliminates the entire category of "I can't override this third-party style" problems.

**Common mistakes:**
- Declaring layers without the explicit order statement — if you omit `@layer reset, base, components`, layers take priority based on their first appearance in the file. Always declare the order explicitly at the top.
- Using `!important` inside a layer — `!important` inside a layer reverses the layer priority order, which is confusing and almost never the right tool.

**Debug tip:** In Chrome DevTools Styles panel, rules show their layer name (e.g., `@layer components`) next to the selector. The cascade panel (Computed → show all) shows exactly which layer's rule is winning for each property.

**Next:** `@scope` — writing CSS that's scoped to a component without naming conventions.

## Challenge: layer_priority

Set up cascade layers so utilities always win over components.

```html
<div id="layer-test">
  <button class="comp-btn override-color">Button</button>
</div>
```

```css
@layer components, utilities;

@layer components {
  .comp-btn {
    background: #6366f1;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
}

@layer utilities {
  .override-color { background: #dc2626; }
}
```

```test
const btn = document.querySelector('.comp-btn.override-color')
const bg = getComputedStyle(btn).backgroundColor
assert bg === 'rgb(220, 38, 38)' || bg.includes('220, 38, 38')
assert getComputedStyle(btn).color.includes('255, 255, 255')
assert getComputedStyle(btn).borderRadius !== '0px'
const rules = Array.from(document.styleSheets[0].cssRules)
const hasLayer = rules.some(r => r.constructor.name === 'CSSLayerStatementRule' || r.constructor.name === 'CSSLayerBlockRule' || (r.cssText || '').includes('@layer'))
assert hasLayer
```
