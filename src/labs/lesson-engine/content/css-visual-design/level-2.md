---
series: css-visual-design
level: 2
title: Spacing Systems
lang: css
---

# Spacing Systems

Take any UI that looks "off" to a designer, and inconsistent spacing is usually the culprit. Elements are too close here, too far apart there — the page has no internal rhythm, so the eye never settles. Individual components look fine in isolation but the whole looks accidental.

A spacing system solves this by limiting every gap, padding, and margin to values from a fixed scale. When every distance is a multiple of the same base unit, layouts feel coherent even before you think about colors or typography.

By the end of this lesson you will understand the 8-point grid and why multiples of 8 align with screen pixel densities, be able to define a spacing scale as CSS custom properties, and apply consistent spacing to layout components.

## The 8-point grid

```html
<div class="grid-demo">
  <div class="space-1">4px</div>
  <div class="space-2">8px</div>
  <div class="space-3">12px</div>
  <div class="space-4">16px</div>
  <div class="space-6">24px</div>
  <div class="space-8">32px</div>
  <div class="space-12">48px</div>
  <div class="space-16">64px</div>
</div>
```

```css
/* 4px base, multiples of 4 for density, multiples of 8 for layout */
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
}

.grid-demo { display: flex; align-items: flex-end; gap: 8px; font-family: monospace; font-size: 0.75rem; }
.grid-demo div { background: #6366f1; color: white; display: flex; align-items: flex-end; justify-content: center; padding: 4px 2px; border-radius: 4px 4px 0 0; }
.space-1  { width: var(--space-1);  height: var(--space-1); }
.space-2  { width: var(--space-2);  height: var(--space-2); }
.space-3  { width: var(--space-3);  height: var(--space-3); }
.space-4  { width: var(--space-4);  height: var(--space-4); }
.space-6  { width: var(--space-6);  height: var(--space-6); }
.space-8  { width: var(--space-8);  height: var(--space-8); }
.space-12 { width: var(--space-12); height: var(--space-12); }
.space-16 { width: var(--space-16); height: var(--space-16); }
```

**CS lens:** The 8-point grid is a constraint system. Constraints reduce decision space — instead of choosing from infinite pixel values, you choose from 8-10 scale values. This is the same principle as type scales, color scales, and breakpoint systems. The fewer valid options, the more consistent the result, and the fewer arguments about whether a gap should be 13px or 14px.

## Spacing as relationship

```html
<div class="card-demo">
  <div class="card">
    <div class="card-header">
      <h3>Related things are close</h3>
      <span class="badge">New</span>
    </div>
    <p class="card-body">Spacing communicates relationship. Elements close together feel related. Elements far apart feel independent. This is the Gestalt principle of proximity.</p>
    <div class="card-footer">
      <button class="btn-primary">Save</button>
      <button class="btn-secondary">Cancel</button>
    </div>
  </div>
</div>
```

```css
.card-demo { padding: var(--space-6); background: #f8fafc; border-radius: 12px; }
.card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);  /* inner content close to top edge */
  border-bottom: 1px solid #e2e8f0;
}
.card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #0f172a; }
.badge { background: #6366f1; color: white; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; }

.card-body {
  padding: var(--space-6);                  /* comfortable reading space */
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  gap: var(--space-2);                      /* buttons close together — they're a group */
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}
.btn-primary   { padding: var(--space-2) var(--space-4); background: #6366f1; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: var(--space-2) var(--space-4); background: transparent; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; }
```

## Padding vs margin

```html
<div class="pm-demo">
  <div class="section-a">
    <h4>Section A</h4>
    <p>Margin pushes things away from outside. Padding creates space inside.</p>
  </div>
  <div class="section-b">
    <h4>Section B</h4>
    <p>The gap between sections is margin. The breathing room inside each section is padding.</p>
  </div>
</div>
```

```css
.pm-demo { background: #f1f5f9; padding: var(--space-4); border-radius: 8px; }
.section-a, .section-b {
  background: white;
  padding: var(--space-4) var(--space-6);   /* space INSIDE the element */
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.section-a { margin-bottom: var(--space-4); } /* space OUTSIDE, pushes B down */
.section-a h4, .section-b h4 { margin: 0 0 var(--space-2); font-size: 0.9rem; font-weight: 600; color: #0f172a; }
.section-a p,  .section-b p  { margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5; }
```

**SE lens:** Design tokens for spacing (like Tailwind's `p-4`, `gap-6`, `mt-8`) encode the spacing system directly into utility classes. When a designer says "increase the card density," the change is a single token value, not hunting through component styles. This is why design-system-first teams move faster on UI changes — the constraint is also the shortcut.

**Common mistakes:**
- Mixing padding and margin unpredictably — prefer using `gap` for spacing between siblings (in flex/grid), padding for space inside elements, and margin sparingly for section-level separation.
- Using arbitrary pixel values (13px, 17px, 22px) — pick the nearest value from your scale. The inconsistency of arbitrary values is visible to users even if they can't articulate why.

**Debug tip:** In DevTools, hovering over an element shows its box model — orange is margin, green is padding, blue is content. This makes it immediately clear why elements are spaced the way they are.

**Next:** Shadows and depth — creating elevation and visual layers.

## Challenge: spacing_card

Apply consistent spacing using the scale.

```html
<div id="spacing-card">
  <h2 class="card-title">Card Title</h2>
  <p class="card-text">Some card content here.</p>
  <button class="card-btn">Action</button>
</div>
```

```css
:root {
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
}
#spacing-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 300px;
}
.card-title { margin: 0; font-size: 1.25rem; font-weight: 700; }
.card-text  { margin: 0; font-size: 0.9rem; color: #475569; }
.card-btn   { padding: var(--space-2) var(--space-4); background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; align-self: flex-start; }
```

```test
const card = document.querySelector('#spacing-card')
const style = getComputedStyle(card)
const padding = parseFloat(style.paddingTop)
assert padding >= 16
assert style.display === 'flex' || style.display === 'grid'
const gap = parseFloat(style.gap || style.rowGap || '0')
assert gap >= 8
const btn = document.querySelector('.card-btn')
const btnPad = parseFloat(getComputedStyle(btn).paddingLeft)
assert btnPad >= 8
assert getComputedStyle(card).borderRadius !== '0px'
```
