---
series: css-professional
level: 2
title: CSS Owns the State
lang: css
---

# CSS Owns the State

When JavaScript sets `element.style.display = 'none'`, it's doing CSS's job. This seems harmless until you need to add a transition — now you have to modify the JavaScript. Or until you want a dark mode — now the override is inline and the media query can't touch it. Or until you need to debug why something is hidden — now you have to read both files.

The clean separation: JavaScript owns state (open/closed, active/inactive, loading/loaded). CSS owns appearance (what those states look like). JavaScript sets a class or data attribute; CSS responds to it. One change point, two jobs, zero overlap.

By the end of this lesson you will understand the state/appearance separation pattern, know why inline styles from JavaScript break theming and transitions, and be able to refactor JavaScript-driven styling to class/attribute-driven CSS.

## The wrong pattern

```html
<div class="wrong-demo">
  <nav id="wrong-nav" class="nav-menu">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
  <button onclick="
    const nav = document.getElementById('wrong-nav');
    nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
  ">Toggle (style.display)</button>
  <p class="note">❌ Can't animate. Can't theme. JS and CSS are coupled.</p>
</div>
```

```css
.wrong-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
.nav-menu { display: flex; flex-direction: column; background: #1e293b; padding: 0.75rem; border-radius: 8px; gap: 0.25rem; }
.nav-menu a { color: #94a3b8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; font-size: 0.875rem; }
.note { font-size: 0.8rem; color: #dc2626; margin: 0; }
button { padding: 0.4rem 1rem; background: #334155; color: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
```

## The right pattern — class toggling

```html
<div class="right-demo">
  <nav id="right-nav" class="nav-menu is-hidden">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
  <button onclick="
    document.getElementById('right-nav').classList.toggle('is-hidden');
  ">Toggle (classList.toggle)</button>
  <p class="note">✓ Animatable. Themeable. JS just sets state.</p>
</div>
```

```css
.right-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }

.nav-menu {
  display: flex;
  flex-direction: column;
  background: #1e293b;
  padding: 0.75rem;
  border-radius: 8px;
  gap: 0.25rem;
  /* Animatable state — CSS owns this */
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
  transition: max-height 300ms ease, opacity 200ms ease, padding 200ms ease;
}
.nav-menu.is-hidden {
  max-height: 0;
  opacity: 0;
  padding: 0;
}
.nav-menu a { color: #94a3b8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 5px; font-size: 0.875rem; }
.note { font-size: 0.8rem; margin: 0; }
.right-demo .note { color: #16a34a; }
button { padding: 0.4rem 1rem; background: #334155; color: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
```

**CS lens:** This is the **single responsibility principle** applied to the browser. JavaScript's responsibility: model the state (open/closed, active/inactive, loading/loaded). CSS's responsibility: render each state. State classes (`.is-open`, `.is-hidden`, `.is-loading`) are the interface between the two. This is exactly the same principle that makes React's declarative rendering powerful — you declare what state looks like, not how to mutate the DOM step by step.

## Data attributes as state

```html
<div class="data-demo">
  <div class="theme-switcher" data-theme="light">
    <div class="switcher-content">
      <h3>Card Title</h3>
      <p>This card's appearance is controlled by data-theme on the parent.</p>
    </div>
    <div class="switcher-controls">
      <button onclick="this.closest('[data-theme]').dataset.theme='light'">Light</button>
      <button onclick="this.closest('[data-theme]').dataset.theme='dark'">Dark</button>
      <button onclick="this.closest('[data-theme]').dataset.theme='contrast'">High Contrast</button>
    </div>
  </div>
</div>
```

```css
/* Data attributes convey richer state than boolean classes */
.theme-switcher[data-theme="light"] {
  --bg: #ffffff; --text: #0f172a; --subtext: #475569; --border: #e2e8f0;
}
.theme-switcher[data-theme="dark"] {
  --bg: #0f172a; --text: #f1f5f9; --subtext: #94a3b8; --border: #334155;
}
.theme-switcher[data-theme="contrast"] {
  --bg: #000000; --text: #ffffff; --subtext: #ffff00; --border: #ffffff;
}

.theme-switcher {
  background: var(--bg); color: var(--text);
  border: 2px solid var(--border);
  border-radius: 10px; overflow: hidden;
  transition: background 200ms, color 200ms, border-color 200ms;
  font-family: system-ui, sans-serif;
}
.switcher-content { padding: 1.25rem 1.5rem; }
.switcher-content h3 { margin: 0 0 0.5rem; font-size: 1rem; }
.switcher-content p  { margin: 0; font-size: 0.875rem; color: var(--subtext); line-height: 1.5; }
.switcher-controls { display: flex; gap: 0.5rem; padding: 0.75rem 1.5rem; border-top: 1px solid var(--border); flex-wrap: wrap; }
.switcher-controls button { padding: 0.35rem 0.9rem; background: var(--border); color: var(--text); border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
```

## CSS state via `:has()`

```html
<div class="has-demo">
  <label class="checkbox-card">
    <input type="checkbox" class="checkbox-input">
    <div class="checkbox-content">
      <strong>Subscribe to updates</strong>
      <p>Get notified when new content is available.</p>
    </div>
  </label>
</div>
```

```css
/* :has() lets a parent respond to its children's state — no JavaScript */
.has-demo { font-family: system-ui, sans-serif; }
.checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
  max-width: 360px;
}
/* Parent responds when its checkbox child is checked */
.checkbox-card:has(.checkbox-input:checked) {
  border-color: #6366f1;
  background: #eef2ff;
}
.checkbox-input { width: 1rem; height: 1rem; accent-color: #6366f1; margin-top: 2px; flex-shrink: 0; }
.checkbox-content strong { font-size: 0.9rem; color: #0f172a; }
.checkbox-content p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #475569; }
```

**SE lens:** `:has()` is the most significant CSS selector addition in a decade. Before it, every "parent responds to child state" pattern required JavaScript. Now a form can highlight when it contains a checked checkbox, a card grid can reflow when it contains more than 4 items, a nav can change when it contains an active link — all in CSS. This eliminates an entire category of reactive JavaScript and the maintenance burden that comes with it.

**Common mistakes:**
- `element.style.color = 'red'` for dynamic theming — these inline styles override everything, including `!important` in stylesheets. They also can't be transitioned. Use `element.style.setProperty('--my-token', 'red')` to set CSS variables instead.
- State classes like `.open-on-mobile-only` — if your state class name encodes layout details, you've mixed concerns. The class should name the state (`.is-open`), not the visual treatment.

**Debug tip:** In DevTools Elements panel, you can manually add, remove, and toggle classes in the class attribute to test state transitions without clicking through the UI.

**Next:** CSS and JavaScript — reading computed styles and writing custom properties from JS.

## Challenge: state_toggle

Toggle a visible/hidden state using only a class, not style manipulation.

```html
<button id="toggle-btn" onclick="document.getElementById('toggle-panel').classList.toggle('panel-hidden')">Toggle Panel</button>
<div id="toggle-panel" class="panel">
  <p>I can be hidden and shown via class toggle.</p>
</div>
```

```challenge css
.panel {
  padding: 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 0.75rem;
  max-height: 200px;
  opacity: 1;
  overflow: hidden;
  transition: max-height 300ms ease, opacity 200ms ease;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
}
.panel.panel-hidden {
  max-height: 0;
  opacity: 0;
}
#toggle-btn {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
```

```test
const panel = document.querySelector('#toggle-panel')
const btn   = document.querySelector('#toggle-btn')
assert !panel.classList.contains('panel-hidden')
assert panel.style.display === '' || panel.style.display === undefined
btn.click()
assert panel.classList.contains('panel-hidden')
assert panel.style.display === '' || panel.style.display === undefined
btn.click()
assert !panel.classList.contains('panel-hidden')
```
