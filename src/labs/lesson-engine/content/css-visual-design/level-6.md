---
series: css-visual-design
level: 6
title: Design Tokens and Theming Systems
lang: css
---

# Design Tokens and Theming Systems

Imagine a company rebrands. Their primary color changes from blue to green. If every component hardcodes `#4f46e5`, the engineer must find and replace every instance across hundreds of files — missing some, breaking others. If every component uses `var(--color-brand-500)`, the change is one line.

Design tokens are the abstraction that makes this possible. A token is a named, semantic value: not "that blue" but "the primary interactive color." Tokens sit between the raw values and the components. Change the token, change the entire product.

By the end of this lesson you will understand the three-tier token model (global → semantic → component), know how to define primitive and semantic tokens as CSS custom properties, and be able to build a theming system that supports multiple visual identities from the same component tree.

## Token naming conventions

```html
<div class="token-demo">
  <div class="token-row">
    <code>--color-brand-500</code>
    <div class="swatch" style="background: hsl(245,80%,55%)"></div>
    <span>Raw value — the brand hue at scale step 500</span>
  </div>
  <div class="token-row">
    <code>--color-action-primary</code>
    <div class="swatch" style="background: hsl(245,80%,55%)"></div>
    <span>Semantic alias — "use this for primary buttons"</span>
  </div>
  <div class="token-row">
    <code>--color-action-primary-hover</code>
    <div class="swatch" style="background: hsl(245,80%,45%)"></div>
    <span>Component-specific — hover state of primary action</span>
  </div>
</div>
```

```css
/* Three layers of tokens — raw → semantic → component */
:root {
  /* Layer 1: Raw (reference) tokens — the full palette */
  --color-brand-100: hsl(245, 80%, 95%);
  --color-brand-300: hsl(245, 80%, 80%);
  --color-brand-500: hsl(245, 80%, 55%);
  --color-brand-700: hsl(245, 80%, 35%);
  --color-brand-900: hsl(245, 80%, 15%);

  /* Layer 2: Semantic (alias) tokens — meaning, not value */
  --color-action-primary:       var(--color-brand-500);
  --color-action-primary-hover: var(--color-brand-700);
  --color-action-primary-fg:    #ffffff;

  /* Layer 3: Component tokens (optional — for large systems) */
  --btn-primary-bg:    var(--color-action-primary);
  --btn-primary-hover: var(--color-action-primary-hover);
  --btn-primary-text:  var(--color-action-primary-fg);
}

.token-demo { display: flex; flex-direction: column; gap: 0.75rem; font-family: monospace; font-size: 0.85rem; }
.token-row  { display: flex; align-items: center; gap: 1rem; }
.token-row code { width: 230px; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
.swatch     { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0; flex-shrink: 0; }
.token-row span { color: #475569; font-family: system-ui; font-size: 0.8rem; }
```

**CS lens:** This three-layer token architecture mirrors the separation of concerns principle. Raw tokens are data (the full palette). Semantic tokens are interpretation (what each color means). Component tokens are application (how a specific component uses it). You can change a brand color by editing one raw token; every semantic and component token updates automatically via CSS variable references.

## A complete token file

```html
<div class="system-demo">
  <nav class="demo-nav">
    <span class="demo-brand">Brand</span>
    <div class="demo-links">
      <a class="demo-link active">Home</a>
      <a class="demo-link">Docs</a>
      <a class="demo-link">Pricing</a>
    </div>
    <button class="demo-cta">Get started</button>
  </nav>
  <main class="demo-content">
    <div class="demo-alert info">ℹ Update available — version 2.1 is out</div>
    <div class="demo-alert success">✓ Your changes have been saved</div>
    <div class="demo-alert danger">✕ Failed to connect to database</div>
  </main>
</div>
```

```css
/* Complete token set — change brand hue to rebrand the entire demo */
:root {
  /* Brand */
  --brand-h: 245;
  --color-primary:   hsl(var(--brand-h), 80%, 55%);
  --color-primary-dark: hsl(var(--brand-h), 80%, 42%);
  --color-primary-light: hsl(var(--brand-h), 80%, 95%);

  /* Neutrals */
  --color-bg:      #ffffff;
  --color-surface: #f8fafc;
  --color-border:  #e2e8f0;
  --color-text-1:  #0f172a;
  --color-text-2:  #64748b;

  /* Semantic */
  --color-info:    hsl(210, 80%, 50%);
  --color-success: hsl(142, 60%, 40%);
  --color-danger:  hsl(0,   70%, 50%);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Spacing */
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
}

.system-demo { font-family: system-ui, sans-serif; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }

.demo-nav { display: flex; align-items: center; gap: 1rem; padding: var(--space-2) var(--space-4); border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
.demo-brand { font-weight: 800; color: var(--color-primary); font-size: 1.1rem; margin-right: auto; }
.demo-links { display: flex; gap: 0.25rem; }
.demo-link  { padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); color: var(--color-text-2); text-decoration: none; font-size: 0.875rem; cursor: pointer; }
.demo-link.active { background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
.demo-cta   { padding: 0.4rem 1rem; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-size: 0.875rem; }
.demo-cta:hover { background: var(--color-primary-dark); }

.demo-content { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.demo-alert { padding: 0.65rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; border-left: 3px solid currentColor; }
.demo-alert.info    { background: hsl(210, 80%, 96%); color: hsl(210, 80%, 30%); }
.demo-alert.success { background: hsl(142, 60%, 95%); color: hsl(142, 60%, 25%); }
.demo-alert.danger  { background: hsl(0, 70%, 96%);   color: hsl(0, 70%, 30%); }
```

**SE lens:** Tools like Style Dictionary (Amazon), Token Studio (Figma plugin), and Theo (Salesforce) compile design token files (JSON/YAML) into CSS custom properties, iOS Swift constants, Android XML, and JavaScript exports simultaneously — one source of truth for all platforms. This means a designer changing a token in Figma can trigger a CI pipeline that updates the token file, regenerates platform-specific outputs, and opens a PR. The manual work is "approve this PR."

**Common mistakes:**
- Skipping semantic tokens and using raw values everywhere — `color: var(--color-brand-500)` in 40 components means changing the action color requires 40 edits. `color: var(--color-action-primary)` everywhere means one edit.
- Token names that describe appearance instead of meaning — `--blue-button` breaks when the button becomes green. `--button-primary-bg` survives any rebrand.

**Debug tip:** In Chrome DevTools, the Styles panel shows resolved CSS variable values — hover over a `var(--token-name)` reference to see the actual computed value and trace where it's defined.

**Congratulations — CSS Visual Design complete!** You now have the full toolkit: color theory, typography, spacing, shadows, accessibility, dark mode, and design tokens.

## Challenge: design_tokens

Apply design tokens to a button.

```html
<button id="token-btn">Primary Action</button>
```

```css
:root {
  --btn-bg:      hsl(245, 80%, 55%);
  --btn-hover:   hsl(245, 80%, 42%);
  --btn-text:    #ffffff;
  --btn-radius:  8px;
  --btn-pad-v:   10px;
  --btn-pad-h:   20px;
}
#token-btn {
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-v) var(--btn-pad-h);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 150ms;
}
#token-btn:hover { background: var(--btn-hover); }
```

```test
const btn = document.querySelector('#token-btn')
const style = getComputedStyle(btn)
assert style.backgroundColor !== 'transparent'
assert style.color === 'rgb(255, 255, 255)' || style.color.includes('255, 255, 255')
assert style.cursor === 'pointer'
assert parseFloat(style.borderRadius) > 0
assert style.transition.includes('background')
```
