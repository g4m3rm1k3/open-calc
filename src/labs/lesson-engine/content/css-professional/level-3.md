---
series: css-professional
level: 3
title: CSS and JavaScript
lang: css
---

# CSS and JavaScript

CSS and JavaScript both act on the same DOM, which means they can talk to each other — but the channel matters. When JavaScript writes `element.style.color = '#ff0000'`, that inline style overrides everything in your stylesheets and breaks your theming system. When JavaScript writes `element.style.setProperty('--current-color', '#ff0000')`, it sets a CSS variable that your stylesheets control.

This pattern keeps the boundary clean: JavaScript computes values, CSS applies them. JavaScript reads computed styles to make decisions, but the actual rendering rules stay in CSS.

By the end of this lesson you will understand `getComputedStyle`, `setProperty`, and `CSSStyleDeclaration`, know how to use JavaScript to write to CSS custom properties (not inline styles), and be able to build CSS+JS interactions that stay maintainable as the codebase grows.

## Reading CSS values from JavaScript

```html
<div class="read-demo">
  <div id="target-box" class="target-box">Hover over the card to read its styles</div>
  <div id="style-readout" class="readout">Hover the box to see computed styles</div>
</div>
```

```css
:root {
  --brand-color: hsl(245, 80%, 55%);
  --card-radius: 12px;
}
.read-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1rem; }
.target-box {
  padding: 2rem;
  background: var(--brand-color);
  color: white;
  border-radius: var(--card-radius);
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: transform 150ms;
}
.target-box:hover { transform: scale(1.02); }
.readout { background: #0f172a; color: #94a3b8; padding: 1rem; border-radius: 8px; font-size: 0.8rem; font-family: monospace; line-height: 1.8; white-space: pre; }
```

```html
<script>
document.querySelector('.target-box').addEventListener('mouseenter', function() {
  const el = this
  const computed = getComputedStyle(el)
  const root = getComputedStyle(document.documentElement)

  // Read resolved CSS values:
  const bg         = computed.backgroundColor
  const radius     = computed.borderRadius
  const brandToken = root.getPropertyValue('--brand-color').trim()
  const radiusToken = root.getPropertyValue('--card-radius').trim()

  document.getElementById('style-readout').textContent =
    `backgroundColor: ${bg}\n` +
    `borderRadius:    ${radius}\n` +
    `--brand-color:   ${brandToken}\n` +
    `--card-radius:   ${radiusToken}`
})
</script>
```

**CS lens:** `getComputedStyle(element)` returns the **resolved** values — the final pixel values after inheritance, calc(), and variable substitution. It reads property values but cannot read custom property values (they're not in the computed style in the traditional sense). To read a custom property, use `getComputedStyle(element).getPropertyValue('--my-var')`. Writing to a custom property uses `element.style.setProperty('--my-var', value)`.

## Writing CSS variables from JavaScript

```html
<div class="write-demo">
  <div class="control-panel">
    <label>Hue: <input type="range" id="hue-slider" min="0" max="360" value="245"></label>
    <label>Saturation: <input type="range" id="sat-slider" min="20" max="100" value="80"></label>
    <label>Lightness: <input type="range" id="lit-slider" min="20" max="80" value="55"></label>
  </div>
  <div id="dynamic-card" class="dynamic-card">
    <h3>Dynamic Color</h3>
    <p>Drag the sliders to change the color token. The card, button, and border all update — because they all reference the same variable.</p>
    <button class="dynamic-btn">Primary Button</button>
  </div>
</div>
<script>
  function updateColor() {
    const h = document.getElementById('hue-slider').value
    const s = document.getElementById('sat-slider').value
    const l = document.getElementById('lit-slider').value
    // Write to a CSS variable — everything that references it updates
    document.documentElement.style.setProperty('--dynamic-hue', h)
    document.documentElement.style.setProperty('--dynamic-sat', s + '%')
    document.documentElement.style.setProperty('--dynamic-lit', l + '%')
  }
  document.querySelectorAll('input[type=range]').forEach(el => el.addEventListener('input', updateColor))
</script>
```

```css
:root {
  --dynamic-hue: 245;
  --dynamic-sat: 80%;
  --dynamic-lit: 55%;
  --dynamic-color: hsl(var(--dynamic-hue), var(--dynamic-sat), var(--dynamic-lit));
}
.write-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1rem; }
.control-panel { display: flex; flex-direction: column; gap: 0.5rem; }
.control-panel label { font-size: 0.85rem; color: #475569; display: flex; align-items: center; gap: 0.75rem; }
.control-panel input { flex: 1; accent-color: var(--dynamic-color); }

.dynamic-card {
  padding: 1.5rem;
  border: 2px solid hsl(var(--dynamic-hue), var(--dynamic-sat), 85%);
  border-radius: 10px;
  background: hsl(var(--dynamic-hue), var(--dynamic-sat), 97%);
}
.dynamic-card h3 { margin: 0 0 0.5rem; color: hsl(var(--dynamic-hue), var(--dynamic-sat), 25%); }
.dynamic-card p  { margin: 0 0 1rem; font-size: 0.875rem; color: #475569; line-height: 1.5; }
.dynamic-btn {
  padding: 0.5rem 1.25rem;
  background: var(--dynamic-color);
  color: white;
  border: none;
  border-radius: 7px;
  font-weight: 600;
  cursor: pointer;
}
```

## Responding to CSS transitions with JavaScript

```html
<div class="transition-demo">
  <div id="animated-box" class="anim-box">Click me</div>
  <div id="transition-log" class="transition-log">Click the box to start...</div>
</div>
<script>
  const box = document.getElementById('animated-box')
  const log = document.getElementById('transition-log')
  box.addEventListener('click', () => box.classList.toggle('anim-box--expanded'))
  box.addEventListener('transitionstart', e => {
    log.textContent = `transitionstart: ${e.propertyName}`
  })
  box.addEventListener('transitionend', e => {
    log.textContent = `transitionend: ${e.propertyName} → transition complete`
  })
</script>
```

```css
.transition-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1rem; }
.anim-box {
  width: 100px; height: 100px;
  background: #6366f1;
  border-radius: 10px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 600; font-size: 0.8rem; text-align: center;
  transition: width 400ms ease, height 400ms ease, border-radius 400ms ease;
}
.anim-box--expanded { width: 240px; height: 60px; border-radius: 30px; }
.transition-log { font-size: 0.8rem; color: #475569; font-family: monospace; padding: 0.5rem; background: #f8fafc; border-radius: 6px; }
```

**SE lens:** The correct layering is: CSS variables are the interface between JavaScript and CSS. JavaScript only calls `setProperty()` and `getPropertyValue()` on CSS variables — never reads or writes `element.style.color` or other concrete properties. This means: theming works, dark mode works, transitions work, and changing the design never requires changing JavaScript. The variable is the contract between the two systems.

**Common mistakes:**
- Using `element.style.color = value` for dynamic theming — this creates inline styles that break theming, dark mode, and transitions. Always write to a CSS variable instead.
- Reading `element.style.color` expecting the computed color — `element.style` only returns inline styles, not computed ones. Use `getComputedStyle(element)` to get the actual rendered value.

**Debug tip:** In DevTools, the Elements panel's Styles tab shows CSS variables with their current values. Editing a variable live in DevTools updates every element that references it — useful for exploring dynamic changes before writing JS.

**Next:** Scroll-driven animations — animating based on scroll position using pure CSS.

## Challenge: js_css_variable

Write JavaScript that sets a CSS variable to change a button's color.

```html
<button id="color-btn" onclick="
  document.documentElement.style.setProperty('--btn-dynamic-bg', 'hsl(142, 60%, 40%)');
  document.documentElement.style.setProperty('--btn-dynamic-text', 'white');
  this.textContent = 'Color changed!';
">Change my color</button>
```

```css
:root {
  --btn-dynamic-bg: #6366f1;
  --btn-dynamic-text: white;
}
#color-btn {
  padding: 0.6rem 1.5rem;
  background: var(--btn-dynamic-bg);
  color: var(--btn-dynamic-text);
  border: none;
  border-radius: 7px;
  font-weight: 600;
  cursor: pointer;
  transition: background 300ms;
  font-size: 0.9rem;
}
```

```test
const btn = document.querySelector('#color-btn')
const initialBg = getComputedStyle(btn).backgroundColor
assert getComputedStyle(btn).transition.includes('background') || getComputedStyle(btn).transitionProperty.includes('background')
btn.click()
const newBg = getComputedStyle(btn).backgroundColor
assert newBg !== initialBg
assert btn.textContent.includes('changed')
const rootStyle = document.documentElement.style.getPropertyValue('--btn-dynamic-bg')
assert rootStyle.includes('142') || rootStyle.includes('green') || newBg.includes('51, 1')
assert document.documentElement.style.getPropertyValue('--btn-dynamic-text').includes('white')
```
