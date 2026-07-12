---
series: css-visual-design
level: 5
title: Dark Mode with Custom Properties
lang: css
---

# Dark Mode with Custom Properties

"Dark mode" implemented carelessly means setting `background: black` and `color: white` on `body` and hoping for the best. The result: eye-searing white text on black, images with white halos, input fields that vanish, buttons in the wrong shade. Done right, dark mode is a complete second theme.

The key insight: you don't need two sets of components. You need two sets of values for the same set of tokens. Every semantic token (`--color-surface`, `--color-text`, `--color-brand`) maps to a light-mode value by default and a dark-mode value inside `@media (prefers-color-scheme: dark)`. Components reference tokens; they never know which theme is active.

By the end of this lesson you will understand `prefers-color-scheme` and how to override it with a data attribute, be able to define dual-theme token mappings using CSS custom properties, and know the common dark mode pitfalls — pure black backgrounds, unchanged imagery, insufficient contrast on dark surfaces.

## prefers-color-scheme

```html
<div class="theme-card">
  <h2>Adapts automatically</h2>
  <p>This card uses CSS custom properties and responds to your OS dark mode preference. No JavaScript needed.</p>
  <button class="theme-btn">Primary Action</button>
</div>
```

```css
/* Define tokens for light mode */
:root {
  --bg-base:    #ffffff;
  --bg-surface: #f8fafc;
  --bg-raised:  #f1f5f9;
  --border:     #e2e8f0;
  --text-1:     #0f172a;
  --text-2:     #475569;
  --text-3:     #94a3b8;
  --accent:     hsl(245, 80%, 60%);
  --accent-fg:  #ffffff;
}

/* Override same tokens for dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base:    #0f172a;
    --bg-surface: #1e293b;
    --bg-raised:  #334155;
    --border:     #334155;
    --text-1:     #f1f5f9;
    --text-2:     #94a3b8;
    --text-3:     #475569;
    --accent:     hsl(245, 80%, 70%);   /* lighter in dark mode for same perceived contrast */
    --accent-fg:  #0f172a;
  }
}

body { background: var(--bg-base); }

.theme-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  font-family: system-ui, sans-serif;
}
.theme-card h2 { margin: 0 0 0.75rem; font-size: 1.25rem; font-weight: 700; color: var(--text-1); }
.theme-card p  { margin: 0 0 1.5rem; font-size: 0.9rem; color: var(--text-2); line-height: 1.6; }
.theme-btn {
  padding: 0.5rem 1.25rem;
  background: var(--accent);
  color: var(--accent-fg);
  border: none;
  border-radius: 7px;
  font-weight: 600;
  cursor: pointer;
}
```

**CS lens:** `prefers-color-scheme` is a CSS media feature that reads the OS-level preference. The browser exposes this value as part of the media query evaluation pipeline — the same system that reads screen width for responsive design. No JavaScript event or DOM manipulation is needed; CSS handles the entire theme switch. This is more performant and flash-free than JS-driven dark mode because the correct theme is applied before any paint.

## Manual dark mode toggle (data attribute pattern)

```html
<div class="demo-page" data-theme="light">
  <header class="demo-header">
    <span class="demo-logo">MyApp</span>
    <button class="toggle-btn" onclick="
      const page = this.closest('[data-theme]');
      page.dataset.theme = page.dataset.theme === 'dark' ? 'light' : 'dark';
      this.textContent = page.dataset.theme === 'dark' ? '☀ Light' : '🌙 Dark';
    ">🌙 Dark</button>
  </header>
  <main class="demo-main">
    <h2>Content area</h2>
    <p>This text responds to the manual theme toggle above.</p>
  </main>
</div>
```

```css
/* Light theme values (default) */
.demo-page[data-theme="light"] {
  --bg: #ffffff;
  --surface: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --subtext: #64748b;
}

/* Dark theme values */
.demo-page[data-theme="dark"] {
  --bg: #0f172a;
  --surface: #1e293b;
  --border: #334155;
  --text: #f1f5f9;
  --subtext: #94a3b8;
}

.demo-page { background: var(--bg); padding: 1rem; border-radius: 12px; transition: background 200ms; font-family: system-ui, sans-serif; }
.demo-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
.demo-logo   { font-weight: 700; color: var(--text); }
.toggle-btn  { padding: 0.4rem 0.9rem; background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.demo-main h2 { margin: 0 0 0.5rem; color: var(--text); font-size: 1.1rem; }
.demo-main p  { margin: 0; color: var(--subtext); font-size: 0.875rem; }
```

## Dark mode pitfalls

```html
<div class="pitfall-demo">
  <div class="pitfall bad">
    <h4>Bad: hardcoded colors</h4>
    <p style="color: #000000;">This text is hardcoded black — invisible on dark backgrounds.</p>
    <div style="background: #ffffff; padding: 0.5rem; border-radius: 4px; color: #333;">White box — creates a harsh island in dark mode.</div>
  </div>
  <div class="pitfall good">
    <h4>Good: semantic tokens</h4>
    <p style="color: var(--text-1, #0f172a);">Uses --text-1, which maps to the right color in each mode.</p>
    <div style="background: var(--bg-surface, #f8fafc); padding: 0.5rem; border-radius: 4px; color: var(--text-1, #0f172a); border: 1px solid var(--border, #e2e8f0);">Uses surface token — adapts automatically.</div>
  </div>
</div>
```

```css
.pitfall-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-family: system-ui, sans-serif; }
.pitfall { padding: 1rem; border-radius: 8px; border: 1px solid var(--border, #e2e8f0); }
.pitfall h4 { margin: 0 0 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.bad  h4 { color: #dc2626; }
.good h4 { color: #16a34a; }
.pitfall p { margin: 0 0 0.75rem; font-size: 0.85rem; line-height: 1.5; }
```

**SE lens:** The `data-theme` attribute pattern (used by Radix UI, shadcn/ui, and most modern component libraries) is preferred over class-based toggling (`.dark`) because attribute selectors communicate intent clearly: `[data-theme="dark"]` is self-documenting in a way that `.dark` is not. It also avoids specificity conflicts with existing class-based utility systems. JavaScript sets `document.documentElement.dataset.theme = 'dark'` and CSS handles everything else.

**Common mistakes:**
- Making dark mode backgrounds pure black (`#000000`) — this creates extreme contrast that causes eye strain. Dark mode backgrounds should be very dark grey, not black.
- Forgetting images and SVGs — images don't invert automatically. Use `filter: brightness(0.8)` on images in dark mode to reduce glare, and ensure SVGs use `currentColor` or CSS variables rather than hardcoded fills.

**Debug tip:** In Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-color-scheme" → select dark. This lets you test dark mode without changing your OS setting.

**Next:** Design tokens and theming systems — encoding your entire design language as variables.

## Challenge: dark_mode_card

Create a card that has light and dark mode variants using custom properties.

```html
<div id="mode-card">
  <h3 class="mc-title">Themed Card</h3>
  <p class="mc-body">This card adapts to light and dark mode.</p>
</div>
```

```css
:root {
  --mc-bg: #ffffff;
  --mc-text: #0f172a;
  --mc-subtext: #475569;
  --mc-border: #e2e8f0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --mc-bg: #1e293b;
    --mc-text: #f1f5f9;
    --mc-subtext: #94a3b8;
    --mc-border: #334155;
  }
}
#mode-card {
  background: var(--mc-bg);
  border: 1px solid var(--mc-border);
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 320px;
  font-family: system-ui, sans-serif;
}
.mc-title { margin: 0 0 0.5rem; color: var(--mc-text); font-size: 1.1rem; font-weight: 700; }
.mc-body  { margin: 0; color: var(--mc-subtext); font-size: 0.9rem; }
```

```test
const card = document.querySelector('#mode-card')
const style = getComputedStyle(card)
assert style.backgroundColor !== 'transparent'
assert style.borderRadius !== '0px'
const title = document.querySelector('.mc-title')
const body  = document.querySelector('.mc-body')
assert getComputedStyle(title).color !== getComputedStyle(body).color
assert parseInt(getComputedStyle(title).fontWeight) >= 600
const titleSize = parseFloat(getComputedStyle(title).fontSize)
const bodySize  = parseFloat(getComputedStyle(body).fontSize)
assert titleSize > bodySize
assert getComputedStyle(card).borderRadius !== '0px'
```
