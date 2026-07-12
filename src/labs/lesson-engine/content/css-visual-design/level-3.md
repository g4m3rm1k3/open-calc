---
series: css-visual-design
level: 3
title: Shadows and Depth
lang: css
---

# Shadows and Depth

A flat UI is hard to read — everything lives at the same visual layer, so nothing stands out as interactive or prioritized. Shadows fix this by creating a sense of elevation: buttons look clickable because they appear raised, modals look focused because they appear above the rest of the page.

But shadows only work when they're consistent. A random `box-shadow` here, a different one there, creates visual noise rather than a coherent elevation language. Production design systems define a small set of elevation levels — typically five or so — and every component picks from that set.

By the end of this lesson you will understand CSS `box-shadow` syntax, be able to build a 5-level elevation scale as reusable variables, and know when to use each elevation level for cards, dropdowns, dialogs, and tooltips.

## Elevation scale

```html
<div class="elevation-demo">
  <div class="card elev-0">Flat (0)</div>
  <div class="card elev-1">Subtle (1)</div>
  <div class="card elev-2">Card (2)</div>
  <div class="card elev-3">Dropdown (3)</div>
  <div class="card elev-4">Modal (4)</div>
</div>
```

```css
/* 5-step elevation scale — each step is clearly distinguishable */
:root {
  --shadow-0: none;
  --shadow-1: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-2: 0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10);
  --shadow-3: 0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10);
  --shadow-4: 0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10);
}

.elevation-demo {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 3rem;
  background: #f1f5f9;
  border-radius: 12px;
  flex-wrap: wrap;
}
.card {
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}
.elev-0 { box-shadow: var(--shadow-0); border: 1px solid #e2e8f0; }
.elev-1 { box-shadow: var(--shadow-1); }
.elev-2 { box-shadow: var(--shadow-2); }
.elev-3 { box-shadow: var(--shadow-3); }
.elev-4 { box-shadow: var(--shadow-4); }
```

**CS lens:** `box-shadow` syntax: `offset-x offset-y blur-radius spread-radius color`. Stacking two shadows (a soft large shadow + a sharp small shadow) better approximates how real shadows look — physical objects cast a large diffuse shadow from ambient light and a sharp direct shadow from a point source. The `rgb(0 0 0 / 0.10)` syntax uses the modern space-separated form with `/` for alpha, equivalent to `rgba(0,0,0,0.10)`.

## Interactive elevation (hover lift)

```html
<div class="lift-demo">
  <div class="lift-card">
    <h3>Hover me</h3>
    <p>Elevation changes communicate that something is interactive — it "lifts" toward you.</p>
  </div>
  <div class="lift-card">
    <h3>And me</h3>
    <p>This pattern is widely used for cards, product tiles, and any clickable surface.</p>
  </div>
</div>
```

```css
.lift-demo { display: flex; gap: 1.5rem; padding: 2rem; background: #f8fafc; border-radius: 10px; }
.lift-card {
  flex: 1;
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow-2);
  transition: box-shadow 200ms ease, transform 200ms ease;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}
.lift-card:hover {
  box-shadow: var(--shadow-4);
  transform: translateY(-2px);   /* physically move up to reinforce the depth illusion */
}
.lift-card h3 { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; color: #0f172a; }
.lift-card p  { margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5; }
```

## Inset shadows and pressed states

```html
<div class="press-demo">
  <button class="press-btn">Click me</button>
  <input class="press-input" type="text" placeholder="Focus me" />
</div>
```

```css
.press-demo { display: flex; gap: 1rem; align-items: center; padding: 2rem; background: #f8fafc; border-radius: 10px; }

.press-btn {
  padding: 0.6rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 0 0 #4338ca;          /* bottom shadow = raised appearance */
  transition: box-shadow 100ms, transform 100ms;
}
.press-btn:active {
  box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.2);  /* inset = pressed down */
  transform: translateY(1px);
}

.press-input {
  padding: 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.05);  /* inset = recessed well */
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.press-input:focus {
  border-color: #6366f1;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 3px rgb(99 102 241 / 0.2);
}
```

**SE lens:** Shadows are stateful UI feedback. A button that looks raised signals "push me." A pressed button that sinks confirms "I heard you." An input with an inset shadow signals "type in here." An input with a focus ring signals "you are here." These are affordance cues — visual signals about how an interface element behaves. Good affordances reduce the need for tooltips and instructions.

**Common mistakes:**
- Using the same shadow everywhere — five different shadow intensities with no system looks noisy. Define 4-5 levels and only use those.
- Dark, opaque shadows — `box-shadow: 0 4px 8px #000` looks harsh. Real shadows are low-opacity and slightly warm (use a dark warm hue instead of pure black).

**Debug tip:** In DevTools, you can edit `box-shadow` values directly in the Styles panel. A box-shadow editor popup appears when you click the small colored square next to any shadow value.

**Next:** Contrast and accessibility — WCAG ratios and making UI readable for everyone.

## Challenge: shadow_elevation

Add a hover elevation effect to a card.

```html
<div id="elev-card">Hover over me</div>
```

```css
#elev-card {
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.10);
  transition: box-shadow 200ms ease, transform 200ms ease;
  display: inline-block;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  cursor: pointer;
}
#elev-card:hover {
  box-shadow: 0 10px 20px rgb(0 0 0 / 0.12);
  transform: translateY(-3px);
}
```

```test
const card = document.querySelector('#elev-card')
const base = getComputedStyle(card).boxShadow
assert base !== 'none'
assert base.includes('rgb') || base.includes('rgba')
assert getComputedStyle(card).backgroundColor !== 'transparent'
assert getComputedStyle(card).transition.includes('box-shadow')
assert getComputedStyle(card).transition.includes('transform')
```
