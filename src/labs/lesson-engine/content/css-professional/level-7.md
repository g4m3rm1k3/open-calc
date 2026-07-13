---
series: css-professional
level: 7
title: Professional CSS Reference
lang: css
---

# Professional CSS Reference

The previous seven levels introduced each technique in isolation. In a real project, they work together: cascade layers resolve conflicts between design system tokens and component overrides; native HTML elements reduce JavaScript surface area; class-toggled state keeps theming clean; typed custom properties enable smooth transitions; BEM naming keeps the stylesheet readable across a team.

This level builds one complete, production-grade UI — a settings panel — that uses all of these techniques together. The goal is not to introduce new syntax, but to show how professional CSS architecture looks when it's all wired up.

By the end of this lesson you will recognize each professional CSS technique in context, understand how they compose without conflicting, and have a complete reference implementation you can study when building real production UI.

## The settings panel

```html
<div class="settings" data-theme="light">

  <header class="settings__header">
    <h1 class="settings__title">Account Settings</h1>
    <button class="settings__theme-toggle" onclick="
      const s = this.closest('.settings');
      s.dataset.theme = s.dataset.theme === 'dark' ? 'light' : 'dark';
      this.textContent = s.dataset.theme === 'dark' ? '☀' : '🌙';
    ">🌙</button>
  </header>

  <nav class="settings__nav">
    <button class="settings__nav-item settings__nav-item--active" onclick="setTab(this, 'profile')">Profile</button>
    <button class="settings__nav-item" onclick="setTab(this, 'security')">Security</button>
    <button class="settings__nav-item" onclick="setTab(this, 'notifications')">Notifications</button>
  </nav>

  <main class="settings__content">

    <section id="tab-profile" class="settings__tab settings__tab--visible">
      <div class="settings__group">
        <label class="settings__label" for="s-name">Display name</label>
        <input class="settings__input" id="s-name" type="text" value="Jane Smith" />
      </div>
      <div class="settings__group">
        <label class="settings__label" for="s-email">Email</label>
        <input class="settings__input" id="s-email" type="email" value="jane@example.com" />
      </div>
      <div class="settings__actions">
        <button class="settings__btn settings__btn--primary">Save changes</button>
        <button class="settings__btn settings__btn--ghost">Cancel</button>
      </div>
    </section>

    <section id="tab-security" class="settings__tab">
      <div class="settings__group">
        <label class="settings__label settings__label--required" for="s-pw">New password</label>
        <input class="settings__input" id="s-pw" type="password" placeholder="Enter new password" />
      </div>
      <details class="settings__expander">
        <summary class="settings__expander-toggle">Password requirements</summary>
        <ul class="settings__requirements">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One number or symbol</li>
        </ul>
      </details>
    </section>

    <section id="tab-notifications" class="settings__tab">
      <label class="settings__toggle-row">
        <div class="settings__toggle-info">
          <strong>Email notifications</strong>
          <span>Receive weekly digest emails</span>
        </div>
        <input type="checkbox" class="settings__checkbox" checked />
      </label>
      <label class="settings__toggle-row">
        <div class="settings__toggle-info">
          <strong>Marketing emails</strong>
          <span>Promotions and product updates</span>
        </div>
        <input type="checkbox" class="settings__checkbox" />
      </label>
    </section>

  </main>
</div>

<script>
function setTab(btn, id) {
  btn.closest('.settings').querySelectorAll('.settings__nav-item').forEach(b => b.classList.remove('settings__nav-item--active'))
  btn.classList.add('settings__nav-item--active')
  btn.closest('.settings').querySelectorAll('.settings__tab').forEach(t => t.classList.remove('settings__tab--visible'))
  btn.closest('.settings').querySelector('#tab-' + id).classList.add('settings__tab--visible')
}
</script>
```

```css
@layer reset, tokens, settings;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
}

@layer tokens {
  .settings[data-theme="light"] {
    --bg:       #ffffff;  --surface: #f8fafc;  --border: #e2e8f0;
    --text-1:   #0f172a;  --text-2: #475569;   --text-3: #94a3b8;
    --accent:   #6366f1;  --accent-fg: white;
    --accent-bg: #eef2ff;
  }
  .settings[data-theme="dark"] {
    --bg:       #0f172a;  --surface: #1e293b;  --border: #334155;
    --text-1:   #f1f5f9;  --text-2: #94a3b8;   --text-3: #475569;
    --accent:   #818cf8;  --accent-fg: #0f172a;
    --accent-bg: #1e1b4b;
  }
}

@layer settings {
  .settings {
    font-family: system-ui, sans-serif;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: background 200ms, border-color 200ms;
    max-width: 520px;
  }

  /* Header */
  .settings__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .settings__title { font-size: 1rem; font-weight: 700; color: var(--text-1); }
  .settings__theme-toggle { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 1rem; }

  /* Nav */
  .settings__nav { display: flex; gap: 2px; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border); }
  .settings__nav-item {
    padding: 0.35rem 0.9rem; border-radius: 6px; border: none;
    background: transparent; color: var(--text-2); font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: background 150ms, color 150ms;
  }
  .settings__nav-item--active { background: var(--accent-bg); color: var(--accent); font-weight: 600; }
  .settings__nav-item:not(.settings__nav-item--active):hover { background: var(--surface); }

  /* Tab panels */
  .settings__content { padding: 1.5rem; }
  .settings__tab { display: none; flex-direction: column; gap: 1.25rem; }
  .settings__tab--visible { display: flex; }

  /* Form elements */
  .settings__group { display: flex; flex-direction: column; gap: 0.4rem; }
  .settings__label { font-size: 0.8rem; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.04em; }
  .settings__label--required::after { content: ' *'; color: #dc2626; }
  .settings__input {
    padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 7px;
    font-size: 0.9rem; background: var(--bg); color: var(--text-1);
    outline: none; transition: border-color 150ms, box-shadow 150ms;
  }
  .settings__input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }

  /* Actions */
  .settings__actions { display: flex; gap: 0.5rem; padding-top: 0.5rem; }
  .settings__btn { padding: 0.5rem 1.1rem; border-radius: 7px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: background 150ms; }
  .settings__btn--primary { background: var(--accent); color: var(--accent-fg); }
  .settings__btn--ghost { background: transparent; color: var(--text-2); border-color: var(--border); }

  /* Expander */
  .settings__expander { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .settings__expander-toggle { padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: var(--text-2); cursor: pointer; list-style: none; }
  .settings__requirements { padding: 0.5rem 1rem 0.75rem 2rem; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; color: var(--text-2); }

  /* Toggle rows */
  .settings__toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem; border: 1px solid var(--border); border-radius: 8px;
    cursor: pointer; transition: background 150ms;
  }
  .settings__toggle-row:hover { background: var(--surface); }
  .settings__toggle-info { display: flex; flex-direction: column; gap: 2px; }
  .settings__toggle-info strong { font-size: 0.875rem; color: var(--text-1); }
  .settings__toggle-info span   { font-size: 0.78rem; color: var(--text-3); }
  .settings__checkbox { width: 1.1rem; height: 1.1rem; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
}
```

**CS lens:** The architecture of this settings panel demonstrates **layered abstraction** — the same principle as OS kernel/userland separation and networking's OSI model. The token layer defines values. The component layer defines structure. The state layer (class toggles) defines transitions between states. JavaScript only crosses the layer boundary at one point: writing to CSS variables. Each layer can change without affecting the others. This is the same reason TCP/IP doesn't need to change when a new application protocol is invented — well-defined layers absorb change locally.

**SE lens:** This panel uses every professional technique in sequence: `@layer` for priority control, `data-theme` attribute for clean theme switching, `<details>` for the native expander, `classList.toggle` for tab switching where CSS owns the visible/hidden state, CSS custom properties throughout for complete theming support, and BEM naming for all components. The result is a component that can be dropped into any project, themed by changing the token layer, and extended without specificity conflicts.

**Congratulations — CSS Professional complete.** You've covered cascade layers, native HTML elements, CSS state ownership, CSS/JavaScript integration, scroll-driven animations, `@property`, and professional methodology. You are now equipped to write and maintain CSS at production scale.

## Challenge: professional_component

Build a styled toggle switch.

```html
<label id="toggle-label" class="toggle-switch">
  <input type="checkbox" class="toggle-switch__input">
  <span class="toggle-switch__track">
    <span class="toggle-switch__thumb"></span>
  </span>
  <span class="toggle-switch__label">Enable feature</span>
</label>
```

```challenge css
.toggle-switch { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-family: system-ui, sans-serif; font-size: 0.9rem; color: #0f172a; }
.toggle-switch__input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-switch__track {
  width: 44px; height: 24px;
  background: #e2e8f0;
  border-radius: 99px;
  position: relative;
  transition: background 200ms;
  flex-shrink: 0;
}
.toggle-switch__input:checked + .toggle-switch__track { background: #6366f1; }
.toggle-switch__thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 20px; height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
  transition: transform 200ms;
}
.toggle-switch__input:checked + .toggle-switch__track .toggle-switch__thumb { transform: translateX(20px); }
```

```test
const label = document.querySelector('#toggle-label')
const input = document.querySelector('.toggle-switch__input')
const track = document.querySelector('.toggle-switch__track')
const thumb = document.querySelector('.toggle-switch__thumb')
assert label && input && track && thumb
assert getComputedStyle(track).borderRadius !== '0px'
assert getComputedStyle(thumb).background !== '' || getComputedStyle(thumb).backgroundColor !== 'transparent'
input.click()
assert input.checked === true
input.click()
assert input.checked === false
```
