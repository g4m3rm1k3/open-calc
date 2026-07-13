---
series: css-visual-design
level: 7
title: A Complete Design System in CSS
lang: css
---

# A Complete Design System in CSS

Every technique in this series — color scales, type hierarchy, spacing systems, elevation, contrast, dark mode, tokens — exists to serve one goal: a product where every page looks like it was made by the same mind, regardless of who built each component.

That coherence doesn't happen by accident. It requires a system: a shared vocabulary of decisions that every component draws from. Without it, teams diverge — different blues, different spacing, different shadow styles — and the product looks fragmented even when individual components look fine.

By the end of this lesson you will see how all the techniques from this series assemble into a working design system, understand the relationship between tokens, components, and documentation, and be able to bootstrap a new project's visual foundation from first principles.

## The token foundation

```html
<div class="ds-preview">
  <p class="ds-preview-text">Token foundation applied — everything below uses these variables.</p>
</div>
```

```css
/* ─── DESIGN SYSTEM TOKENS ───────────────────────────────────── */
:root {
  /* Brand hue — change this one value to rebrand */
  --brand-h: 245;

  /* Color scale */
  --color-brand-50:  hsl(var(--brand-h), 80%, 97%);
  --color-brand-100: hsl(var(--brand-h), 80%, 93%);
  --color-brand-500: hsl(var(--brand-h), 80%, 55%);
  --color-brand-600: hsl(var(--brand-h), 80%, 45%);
  --color-brand-900: hsl(var(--brand-h), 80%, 15%);

  /* Semantic colors */
  --color-primary:       var(--color-brand-500);
  --color-primary-hover: var(--color-brand-600);
  --color-primary-fg:    #ffffff;
  --color-success:       hsl(142, 60%, 40%);
  --color-warning:       hsl(38,  90%, 48%);
  --color-danger:        hsl(0,   70%, 50%);

  /* Surfaces */
  --surface-page:    #ffffff;
  --surface-raised:  #f8fafc;
  --surface-sunken:  #f1f5f9;
  --border-default:  #e2e8f0;
  --border-strong:   #cbd5e1;

  /* Text */
  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-muted:     #94a3b8;

  /* Type scale */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;

  /* Spacing */
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06);
}

.ds-preview { padding: var(--space-4); background: var(--color-brand-50); border: 1px solid var(--color-brand-100); border-radius: var(--radius-md); }
.ds-preview-text { margin: 0; font-size: var(--text-sm); color: var(--color-brand-600); font-family: system-ui, sans-serif; font-weight: 500; }
```

## Components built on the tokens

```html
<div class="ds-page">

  <!-- Buttons -->
  <section class="ds-section">
    <h3 class="ds-section-title">Buttons</h3>
    <div class="ds-row">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
      <button class="btn btn-ghost">Ghost</button>
      <button class="btn btn-danger">Danger</button>
      <button class="btn btn-primary" disabled>Disabled</button>
    </div>
  </section>

  <!-- Badges -->
  <section class="ds-section">
    <h3 class="ds-section-title">Badges</h3>
    <div class="ds-row">
      <span class="badge badge-default">Default</span>
      <span class="badge badge-primary">Primary</span>
      <span class="badge badge-success">Success</span>
      <span class="badge badge-warning">Warning</span>
      <span class="badge badge-danger">Danger</span>
    </div>
  </section>

  <!-- Cards -->
  <section class="ds-section">
    <h3 class="ds-section-title">Cards</h3>
    <div class="card-grid">
      <div class="card card-flat">
        <h4 class="card-title">Flat card</h4>
        <p class="card-body">Used for items in a list or table where borders define structure.</p>
      </div>
      <div class="card card-raised">
        <h4 class="card-title">Raised card</h4>
        <p class="card-body">Used for standalone content items that should feel clickable.</p>
      </div>
    </div>
  </section>

  <!-- Form controls -->
  <section class="ds-section">
    <h3 class="ds-section-title">Form controls</h3>
    <div class="form-stack">
      <label class="label" for="ds-input">Email address</label>
      <input class="input" id="ds-input" type="email" placeholder="you@example.com" />
      <span class="helper">We'll never share your email.</span>
    </div>
  </section>

</div>
```

```css
/* ─── BASE ────────────────────────────────────────────────────── */
.ds-page { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: var(--space-8); padding: var(--space-6); background: var(--surface-page); border: 1px solid var(--border-default); border-radius: var(--radius-xl); }
.ds-section-title { margin: 0 0 var(--space-3); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; color: var(--text-muted); }
.ds-row { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.ds-section { display: flex; flex-direction: column; }

/* ─── BUTTONS ─────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm); font-weight: 600;
  border-radius: var(--radius-md); border: 1px solid transparent;
  cursor: pointer; transition: background 150ms, box-shadow 150ms, border-color 150ms;
  outline: none;
}
.btn:focus-visible { box-shadow: 0 0 0 3px rgb(99 102 241 / 0.35); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-primary   { background: var(--color-primary);    color: var(--color-primary-fg); }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-secondary { background: var(--surface-raised);   color: var(--text-primary); border-color: var(--border-default); }
.btn-secondary:hover:not(:disabled) { background: var(--surface-sunken); }
.btn-ghost     { background: transparent;             color: var(--color-primary); }
.btn-ghost:hover:not(:disabled) { background: var(--color-brand-50); }
.btn-danger    { background: var(--color-danger);     color: white; }
.btn-danger:hover:not(:disabled) { background: hsl(0, 70%, 42%); }

/* ─── BADGES ──────────────────────────────────────────────────── */
.badge {
  display: inline-flex; align-items: center;
  padding: 2px 10px;
  font-size: var(--text-xs); font-weight: 600;
  border-radius: 99px;
}
.badge-default { background: var(--surface-sunken);       color: var(--text-secondary); }
.badge-primary { background: var(--color-brand-100);      color: var(--color-brand-600); }
.badge-success { background: hsl(142,60%,93%);            color: hsl(142,60%,25%); }
.badge-warning { background: hsl(38, 90%, 93%);           color: hsl(38, 80%,25%); }
.badge-danger  { background: hsl(0, 70%, 95%);            color: hsl(0, 70%,30%); }

/* ─── CARDS ───────────────────────────────────────────────────── */
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
.card { padding: var(--space-4) var(--space-6); border-radius: var(--radius-lg); }
.card-title { margin: 0 0 var(--space-2); font-size: var(--text-base); font-weight: 600; color: var(--text-primary); }
.card-body  { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
.card-flat  { background: var(--surface-raised); border: 1px solid var(--border-default); }
.card-raised { background: var(--surface-page); border: 1px solid var(--border-default); box-shadow: var(--shadow-md); transition: box-shadow 200ms, transform 200ms; cursor: pointer; }
.card-raised:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }

/* ─── FORM ────────────────────────────────────────────────────── */
.form-stack { display: flex; flex-direction: column; gap: var(--space-1); max-width: 320px; }
.label  { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
.input  { padding: var(--space-2) var(--space-3); border: 1px solid var(--border-strong); border-radius: var(--radius-md); font-size: var(--text-base); color: var(--text-primary); background: var(--surface-page); outline: none; box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.04); transition: border-color 150ms, box-shadow 150ms; }
.input:focus { border-color: var(--color-primary); box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 3px rgb(99 102 241 / 0.2); }
.helper { font-size: var(--text-xs); color: var(--text-muted); }
```

**CS lens:** A design system is an application of the **single source of truth** principle from software architecture. Every color, spacing value, and component style is defined exactly once — in the token layer — and every consumer references it. This is the same principle as a normalized database (one row per fact) and a Redux store (one store per application state). The invariant: if the same value appears in two places, it is a bug. Design systems enforce this at the CSS level.

**SE lens:** This 200-line token + component layer is the core of every major design system — Tailwind's configuration, Material Design's token spec, and Atlassian's Atlaskit all follow this pattern. The leverage is enormous: one designer changes `--brand-h: 245` to `--brand-h: 160` and the entire product goes from indigo to green, correctly, consistently, across every component. That is the return on investment for building the system first.

**Congratulations — CSS Visual Design complete.** You have the foundations of professional-grade UI engineering: color theory, typography, spacing, shadows, accessibility, dark mode, and a complete design token system.

## Challenge: ds_button_variants

Build two button variants using design tokens.

```html
<div id="ds-challenge">
  <button class="ch-btn ch-primary">Save changes</button>
  <button class="ch-btn ch-secondary">Cancel</button>
</div>
```

```challenge css
:root {
  --ch-primary: hsl(245, 80%, 55%);
  --ch-primary-text: white;
  --ch-secondary-bg: #f1f5f9;
  --ch-secondary-text: #0f172a;
  --ch-border: #e2e8f0;
  --ch-radius: 8px;
}
#ds-challenge { display: flex; gap: 8px; }
.ch-btn { padding: 8px 18px; border-radius: var(--ch-radius); font-weight: 600; font-size: 0.875rem; cursor: pointer; border: 1px solid transparent; }
.ch-primary   { background: var(--ch-primary); color: var(--ch-primary-text); }
.ch-secondary { background: var(--ch-secondary-bg); color: var(--ch-secondary-text); border-color: var(--ch-border); }
```

```test
const primary   = document.querySelector('.ch-primary')
const secondary = document.querySelector('.ch-secondary')
assert primary && secondary
const pBg = getComputedStyle(primary).backgroundColor
const sBg = getComputedStyle(secondary).backgroundColor
assert pBg !== sBg
assert getComputedStyle(primary).color.includes('255, 255, 255')
assert parseFloat(getComputedStyle(primary).borderRadius) > 0
assert getComputedStyle(primary).cursor === 'pointer'
```
