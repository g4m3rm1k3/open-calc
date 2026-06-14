export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-22-variables',
  title: '22. CSS Custom Properties',
  chapter: 'css-ch5',
  language: 'web',
  checkpoints: [
    { id: 'cp-define-use', label: 'Define & Use' },
    { id: 'cp-scoping', label: 'Scoping' },
    { id: 'cp-theming', label: 'Theming' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You have a brand color. It's `#3b82f6`. It appears 47 times in your stylesheet — in buttons, links, borders, shadows, focus rings. The designer changes it to `#2563eb`. You do a find-and-replace. You miss 3 places. The UI is now inconsistent. The solution is CSS custom properties — variables that exist natively in the browser, no preprocessor required.",
      files: {
        html: `<button class="btn">Primary</button>
<a href="#" class="link">A link</a>
<div class="card">
  <div class="card-header">Header</div>
  <p>Card body text with a <span class="accent">highlighted word</span>.</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

/* #3b82f6 is scattered everywhere — change one, miss some */
.btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }
.btn:hover { background: #2563eb; box-shadow: 0 0 0 3px #3b82f680; }
.link { color: #3b82f6; }
.link:hover { color: #2563eb; }
.card { background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #3b82f640; }
.card-header { background: #3b82f620; padding: 12px 20px; border-bottom: 1px solid #3b82f640; font-weight: 600; }
.card p { padding: 16px 20px; margin: 0; }
.accent { color: #3b82f6; font-weight: 600; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'define-variable',
      defaultTab: 'css',
      text: "Custom properties are declared with double-dash prefix: `--name: value`. They're defined on a selector — usually `:root` for global scope (`:root` is the `<html>` element). They're read with `var(--name)`. Now the brand color lives in one place. Change it once.",
      files: {
        html: `<button class="btn">Primary</button>
<a href="#" class="link">A link</a>
<div class="card">
  <div class="card-header">Header</div>
  <p>Card body with an <span class="accent">accent</span>.</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

/* ONE place to change the brand color */
:root {
  --brand: #3b82f6;
  --brand-dark: #2563eb;
  --brand-faint: #3b82f620;
  --brand-ring: #3b82f680;
}

.btn { background: var(--brand); color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }
.btn:hover { background: var(--brand-dark); box-shadow: 0 0 0 3px var(--brand-ring); }
.link { color: var(--brand); }
.link:hover { color: var(--brand-dark); }
.card { background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid var(--brand-faint); }
.card-header { background: var(--brand-faint); padding: 12px 20px; border-bottom: 1px solid var(--brand-faint); font-weight: 600; }
.card p { padding: 16px 20px; margin: 0; }
.accent { color: var(--brand); font-weight: 600; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fallback-values',
      defaultTab: 'css',
      text: "`var()` accepts a fallback value as its second argument: `var(--brand, #3b82f6)`. If `--brand` is not defined in the current scope, the fallback is used. You can nest fallbacks: `var(--x, var(--y, red))`. This is essential when consuming variables from external contexts (component libraries, themes) where the variable might not be defined.",
      files: {
        html: `<div class="widget">
  <p>This widget uses --accent with a fallback.</p>
  <button class="widget-btn">Action</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* --accent is NOT defined anywhere — fallback kicks in */
.widget {
  background: var(--surface, #1e293b);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--border, #334155);
}

.widget-btn {
  background: var(--accent, #10b981); /* fallback to green */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-define-use'
    },
    {
      type: 'narration',
      id: 'scoping',
      defaultTab: 'css',
      text: "Custom properties cascade and inherit like regular CSS. Define a variable on any ancestor element — all descendants can read it. Define it on a specific component and it only affects that component's subtree. This is called scoping. You can override a global variable locally without changing the global definition.",
      files: {
        html: `<div class="btn-group">
  <button class="btn">Default</button>
</div>

<div class="btn-group danger-zone">
  <button class="btn">Danger Context</button>
</div>

<div class="btn-group success-zone">
  <button class="btn">Success Context</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

/* Global default */
:root { --btn-bg: #3b82f6; --btn-text: white; }

/* Local scope overrides */
.danger-zone { --btn-bg: #ef4444; }
.success-zone { --btn-bg: #10b981; }

/* .btn always reads from the nearest ancestor's --btn-bg */
.btn {
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-group { background: #1e293b; padding: 16px; border-radius: 8px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'component-tokens',
      defaultTab: 'css',
      text: "Best practice: define component-local tokens that reference global tokens. The component exposes `--card-bg` and `--card-border`. These default to global tokens. Users can override per-instance. This is the 'design token' pattern — separate what the component IS from what it LOOKS like.",
      files: {
        html: `<div class="card">Default card</div>

<div class="card" style="--card-bg: #1a1a2e; --card-border: #7c3aed; --card-text: #c4b5fd;">
  Custom card via inline vars
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

:root {
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-text: #e2e8f0;
}

.card {
  /* Component tokens default to global tokens */
  background: var(--card-bg, var(--color-surface));
  border: 1px solid var(--card-border, var(--color-border));
  color: var(--card-text, var(--color-text));
  padding: 24px;
  border-radius: 8px;
  font-size: 1rem;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-scoping'
    },
    {
      type: 'narration',
      id: 'full-theme',
      defaultTab: 'css',
      text: "Here's a complete dark/light theme built entirely with custom properties. All values reference tokens from `:root`. Switching themes means swapping one class on `<body>` — no JavaScript CSS-in-JS, no React context, just the cascade.",
      files: {
        html: `<body class="dark">
  <div class="page">
    <nav class="navbar">
      <span class="logo">Brand</span>
      <button class="btn" onclick="document.body.classList.toggle('dark')">
        Toggle Theme
      </button>
    </nav>
    <main class="content">
      <h1>Hello World</h1>
      <p>This page switches themes via a CSS class toggle.</p>
      <button class="btn btn--primary">Primary Action</button>
    </main>
  </div>
</body>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

:root {
  --bg: #ffffff;
  --surface: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --brand: #2563eb;
  --brand-text: #ffffff;
}

body.dark {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
  --brand: #3b82f6;
}

body { margin: 0; font-family: sans-serif; background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }

.navbar { background: var(--surface); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
.logo { font-weight: 700; font-size: 1.1rem; }
.content { padding: 40px 24px; max-width: 600px; }
h1 { color: var(--text); margin: 0 0 12px; }
p { color: var(--text-muted); }
.btn { background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
.btn--primary { background: var(--brand); color: var(--brand-text); border-color: var(--brand); margin-top: 16px; display: block; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'calc-with-vars',
      defaultTab: 'css',
      text: "Custom properties can hold any CSS value — numbers, colors, lengths, even partial values. They work with `calc()`. One powerful pattern: store a raw number in a variable (no unit), then use `calc()` to apply the unit. This lets you do arithmetic on design tokens.",
      files: {
        html: `<div class="scale-demo">
  <div class="box" style="--size: 1">Size 1</div>
  <div class="box" style="--size: 2">Size 2</div>
  <div class="box" style="--size: 3">Size 3</div>
  <div class="box" style="--size: 4">Size 4</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.scale-demo { display: flex; align-items: flex-end; gap: 16px; }

.box {
  --base: 40px;
  width: calc(var(--base) * var(--size));
  height: calc(var(--base) * var(--size));
  background: #3b82f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: calc(0.7rem + var(--size) * 0.15rem);
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-theming'
    },
    {
      type: 'narration',
      id: 'media-query-vars',
      defaultTab: 'css',
      text: "Custom properties can be redefined inside media queries. This is far cleaner than duplicating full rule-sets. Define spacing and font sizes once at `:root`, then update just the variables at breakpoints — all components that use those variables automatically adapt.",
      files: {
        html: `<div class="container">
  <h1 class="heading">Responsive Typography</h1>
  <p class="body-text">This text adapts to screen size by updating custom properties in a media query — not by repeating CSS rules for every element.</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

:root {
  --font-heading: 1.5rem;
  --font-body: 0.9rem;
  --container-pad: 20px;
}

@media (min-width: 640px) {
  :root {
    --font-heading: 2rem;
    --font-body: 1rem;
    --container-pad: 32px;
  }
}

@media (min-width: 1024px) {
  :root {
    --font-heading: 2.8rem;
    --font-body: 1.1rem;
    --container-pad: 64px;
  }
}

.container { padding: var(--container-pad); max-width: 800px; margin: 0 auto; }
.heading { font-size: var(--font-heading); margin: 0 0 16px; color: #38bdf8; }
.body-text { font-size: var(--font-body); line-height: 1.7; color: #94a3b8; margin: 0; }`,
        js: ''
      }
    },
    {
      type: 'challenge',
      id: 'ch-tokens',
      text: "The card below has hardcoded colors scattered everywhere. Extract them into three custom properties on `:root`: `--surface` for the card background, `--accent` for the heading color and button background, and `--muted` for the paragraph text color.",
      hint: "Define variables on :root { --surface: ...; --accent: ...; --muted: ...; } then use var() to replace the hardcoded values.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card">
  <h2 class="card-title">Design Token</h2>
  <p class="card-body">Extract the colors into custom properties.</p>
  <button class="card-btn">Action</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 40px; }

/* Extract these colors to :root custom properties */
.card { background: #1e293b; padding: 28px; border-radius: 10px; max-width: 320px; }
.card-title { color: #8b5cf6; margin: 0 0 12px; }
.card-body { color: #94a3b8; margin: 0 0 20px; line-height: 1.6; }
.card-btn { background: #8b5cf6; color: white; border: none; padding: 10px 22px; border-radius: 6px; cursor: pointer; font-size: 0.95rem; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /:root\s*\{/.test(css) && /var\(--/.test(css) &&
          (css.match(/--[a-z]/g) || []).length >= 3;
      }
    },
    {
      type: 'challenge',
      id: 'ch-scope',
      text: "The page has a `.card` component. Without changing the `.card` rule itself, make the second card show a purple accent (`#7c3aed`) by scoping a custom property override on the `.variant` class.",
      hint: "Add `.variant { --card-accent: #7c3aed; }` — the card reads from --card-accent, so the scoped variable overrides just for that card.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card">
  <div class="card-accent-bar"></div>
  <p>Default card (blue accent)</p>
</div>

<div class="card variant">
  <div class="card-accent-bar"></div>
  <p>This card should have a purple accent</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; gap: 20px; }

:root { --card-accent: #3b82f6; }

.card { background: #1e293b; border-radius: 8px; overflow: hidden; width: 200px; }
.card-accent-bar { height: 4px; background: var(--card-accent); }
.card p { padding: 16px; margin: 0; font-size: 0.9rem; color: #94a3b8; }

/* Add your .variant rule here */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /\.variant\s*\{[^}]*--card-accent\s*:\s*#7c3aed/i.test(css) ||
          /\.variant\s*\{[^}]*--card-accent\s*:\s*purple/.test(css);
      }
    }
  ]
};
