---
series: contributor-series
level: 6
title: The Theming System
lang: css
---

# The Theming System

Every component in this project uses colors and spacing from the same set of variables. A card doesn't know whether the current theme is dark or light — it just reads `var(--color-surface)` and the theme system provides the right value. Change the theme, every component updates automatically.

This matters for contributors writing lesson content that includes HTML demonstrations. If your demo uses `background: #1e293b` directly, it will look wrong in light mode. If it uses `var(--color-surface)`, it will adapt to whatever theme the user has active.

By the end of this lesson you will understand the project's CSS custom property tokens, know which variables to use for backgrounds, text, borders, and brand colors in lesson HTML demonstrations, and be able to write demo HTML/CSS that looks correct across all themes.

## How themes are defined

```html
<div class="theme-example dark-theme">
  <div class="theme-card">
    <h3>Dark Theme Card</h3>
    <p>This card looks correct in dark theme because it uses theme tokens, not hardcoded colors.</p>
    <button class="theme-btn">Action</button>
  </div>
</div>
```

```css
/* The theming system defines tokens for every visual property.
   Components reference tokens, not literal colors.
   When the theme changes, every component updates automatically. */

.dark-theme {
  --bg-0: #0f172a;         /* darkest background */
  --bg-1: #1e293b;         /* card backgrounds */
  --bg-2: #334155;         /* hover backgrounds */
  --txt-1: #f1f5f9;        /* primary text */
  --txt-2: #94a3b8;        /* secondary text */
  --border: #334155;       /* borders */
  --accent: #818cf8;       /* interactive color */
}

.theme-card {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem;
  font-family: system-ui, sans-serif;
}
.theme-card h3 { margin: 0 0 0.5rem; color: var(--txt-1); font-size: 1rem; }
.theme-card p  { margin: 0 0 1rem; color: var(--txt-2); font-size: 0.875rem; line-height: 1.5; }
.theme-btn {
  padding: 0.4rem 1rem;
  background: var(--accent);
  color: #0f172a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}
```

**CS lens:** The `var(--bg-1)` pattern is **late binding** — the token name is fixed at code-write time, but the value is resolved at render time based on the active theme. This is analogous to a variable reference in a programming language: `x` is bound to its value when the code runs, not when it's written. Theme switching is just changing which value the token resolves to.

## How components access the theme

```html
<div class="tsx-example">
  <div class="ui-demo">
    <p class="ui-txt-1">Primary text (ui.txt1)</p>
    <p class="ui-txt-2">Secondary text (ui.txt2)</p>
    <div class="ui-bg-1 ui-border">A card (ui.bg1 + ui.border)</div>
  </div>
</div>
```

```css
/* In TypeScript components, the theme is accessed via the ThemeContext:
   const { themeStyles } = useGlobalTheme()
   const ui = themeStyles.ui

   The ui object provides Tailwind class strings:
   ui.bg0   → 'bg-slate-950'    (darkest bg)
   ui.bg1   → 'bg-slate-900'    (card bg)
   ui.bg2   → 'bg-slate-800'    (hover bg)
   ui.txt1  → 'text-slate-50'   (primary text)
   ui.txt2  → 'text-slate-400'  (secondary text)
   ui.border → 'border-slate-700' (borders)

   Usage in JSX:
   <div className={`${ui.bg1} ${ui.txt1} ${ui.border}`}>Content</div>
*/

/* Demo rendering: */
.tsx-example { font-family: system-ui, sans-serif; background: #0f172a; padding: 1.25rem; border-radius: 10px; }
.ui-demo { display: flex; flex-direction: column; gap: 0.75rem; }
.ui-txt-1 { color: #f1f5f9; margin: 0; font-size: 0.875rem; }
.ui-txt-2 { color: #94a3b8; margin: 0; font-size: 0.875rem; }
.ui-bg-1  { background: #1e293b; padding: 0.75rem 1rem; border-radius: 8px; color: #f1f5f9; font-size: 0.8rem; }
.ui-border { border: 1px solid #334155; }
```

## Why hardcoded colors break themes

```html
<div class="hardcode-demo">
  <div class="bad-card">
    Bad: hardcoded colors
  </div>
  <div class="good-card">
    Good: theme tokens
  </div>
</div>
```

```css
/* The dark theme is active here */
:root {
  --txt-1: #f1f5f9;
  --bg-1:  #1e293b;
  --border: #334155;
}

.hardcode-demo { display: flex; gap: 1rem; background: #0f172a; padding: 1rem; border-radius: 8px; font-family: system-ui, sans-serif; }

/* BAD: hardcoded — looks wrong in dark mode */
.bad-card {
  background: #ffffff;     /* ← hardcoded white — harsh in dark mode */
  color: #000000;          /* ← hardcoded black — wrong in dark mode */
  border: 1px solid #cccccc;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  flex: 1;
  font-weight: 500;
}

/* GOOD: tokens — adapts to any theme */
.good-card {
  background: var(--bg-1);
  color: var(--txt-1);
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  flex: 1;
  font-weight: 500;
}
```

**SE lens:** The theming system is the reason every lab and component in the project looks consistent even though they were built at different times by different contributors. The contract is: never use a hardcoded color in a component. Always use a theme token. This single rule eliminates an entire category of "my new component looks wrong in dark mode" bugs.

**Common mistakes:**
- Using Tailwind's color classes directly (`text-slate-50`) instead of the ui token classes — Tailwind classes are fine for one-off styling, but theme-aware components should use the `ui.*` token classes from `useGlobalTheme()` so they automatically update when the theme changes.
- Hardcoding `#ffffff` or `#000000` — these work in one theme and break in the other.

**Debug tip:** To test your component in both light and dark mode, look for the theme toggle in the top nav. If your component looks wrong in one mode, check every color value — any hardcoded value is a bug.

**Next:** Your first contribution — putting it all together.

## Challenge: theming_concepts

Answer questions about the theming system.

```challenge javascript
const answers = {
  // What CSS feature does the theming system use to define theme values?
  cssFeature: '',
  // True or false: you should use hardcoded colors like '#ffffff' in components
  hardcodeColors: true,
  // In TypeScript components, what hook gives you access to theme tokens?
  hook: '',
  // What object from that hook contains the Tailwind class strings?
  uiObject: '',
}
```

```test
assert answers.cssFeature.toLowerCase().includes('custom') || answers.cssFeature.toLowerCase().includes('variable') || answers.cssFeature.includes('var(')
assert answers.hardcodeColors === false
assert answers.hook.includes('useGlobal') || answers.hook.includes('Theme') || answers.hook.includes('theme')
assert answers.uiObject === 'ui' || answers.uiObject.includes('ui')
```
