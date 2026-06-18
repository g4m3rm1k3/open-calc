export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-25-native-html',
  title: '25. Native HTML & Default Styles',
  chapter: 'css-ch5',
  language: 'web',
  checkpoints: [
    { id: 'cp-dialog', label: '<dialog> Element' },
    { id: 'cp-details', label: '<details> & <summary>' },
    { id: 'cp-form-elements', label: 'Form Elements' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'html',
      text: "You build a modal. It's 80 lines of HTML, 60 lines of CSS, and 40 lines of JavaScript: open/close logic, focus trapping, Escape key handler, aria-modal attribute, backdrop click handling. Then you discover `<dialog>`. It does all of this — for free. Developers constantly reinvent what browsers already built, and the browser version is more accessible, more robust, and takes fewer lines.",
      files: {
        html: `<!-- The custom modal approach (before) -->
<div class="modal-overlay" id="overlay">
  <div class="modal" role="dialog" aria-modal="true">
    <h2>Custom Modal</h2>
    <p>80 lines of JS to manage focus, Escape key, click-outside...</p>
    <button onclick="document.getElementById('overlay').style.display='none'">Close</button>
  </div>
</div>
<button onclick="document.getElementById('overlay').style.display='flex'">Open custom modal</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155; max-width: 400px; width: 90%; }
.modal h2 { margin: 0 0 12px; color: #e2e8f0; }
.modal p { color: #94a3b8; margin: 0 0 20px; }
button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'dialog-element',
      defaultTab: 'html',
      text: "The native `<dialog>` element handles focus trapping, Escape key, and accessibility automatically. Call `.showModal()` to open as a modal with a native backdrop. The `::backdrop` pseudo-element styles the overlay. No JavaScript focus management needed.",
      files: {
        html: `<dialog id="my-dialog">
  <h2>Native Dialog</h2>
  <p>Press Escape to close. Focus is trapped. Backdrop click does nothing by default.</p>
  <form method="dialog">
    <button>Close (form method=dialog)</button>
  </form>
</dialog>

<button onclick="document.getElementById('my-dialog').showModal()">
  Open Native Dialog
</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

dialog {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  color: #f1f5f9;
  max-width: 400px;
  width: 90%;
}

dialog h2 { margin: 0 0 12px; color: #e2e8f0; }
dialog p { color: #94a3b8; margin: 0 0 20px; }

dialog::backdrop {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}

button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'dialog-animation',
      defaultTab: 'html',
      text: "The `<dialog>` element can be animated open and closed using `@starting-style` (new in 2024) or by toggling a class. Here's a clean CSS-only entry animation using `@starting-style` — the dialog scales up from 95% when it opens.",
      files: {
        html: `<dialog id="d2">
  <h2>Animated Dialog</h2>
  <p>Smoothly scales up on open.</p>
  <form method="dialog">
    <button>Close</button>
  </form>
</dialog>
<button onclick="document.getElementById('d2').showModal()">Open Animated</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

dialog {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  color: #f1f5f9;
  max-width: 400px;
  width: 90%;
  transform: scale(1);
  opacity: 1;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* @starting-style defines the "from" state when dialog first appears */
@starting-style {
  dialog[open] {
    transform: scale(0.95);
    opacity: 0;
  }
}

dialog::backdrop { background: rgba(0,0,0,0.7); }
dialog h2 { margin: 0 0 12px; }
dialog p { color: #94a3b8; margin: 0 0 20px; }
button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-dialog'
    },
    {
      type: 'narration',
      id: 'details-summary',
      defaultTab: 'html',
      text: "`<details>` and `<summary>` give you an accessible accordion/disclosure widget with zero JavaScript. Click the summary to toggle the content. The `open` attribute is added/removed by the browser. Style `details[open]` to change the expanded state.",
      files: {
        html: `<div class="faq">
  <details class="faq-item">
    <summary>What is CSS cascade layering?</summary>
    <p>Cascade layers let you control specificity at the layer level, not the selector level. You declare a priority order and all styles in lower layers lose to higher layers regardless of specificity.</p>
  </details>

  <details class="faq-item">
    <summary>When should I use :has()?</summary>
    <p>Use :has() when you want to style a parent based on its children's state — form validation UI, card variants based on content, or conditional layout adjustments.</p>
  </details>

  <details class="faq-item" open>
    <summary>Does &lt;dialog&gt; work everywhere?</summary>
    <p>Yes — as of 2023, &lt;dialog&gt; has baseline support across all major browsers. Safari added full support in Safari 15.4.</p>
  </details>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.faq { display: flex; flex-direction: column; gap: 8px; max-width: 560px; }

.faq-item { background: #1e293b; border-radius: 8px; border: 1px solid #334155; overflow: hidden; }

.faq-item summary {
  padding: 16px 20px;
  cursor: pointer;
  font-weight: 600;
  color: #e2e8f0;
  list-style: none; /* remove default arrow */
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.faq-item summary::after {
  content: '+';
  font-size: 1.4rem;
  color: #3b82f6;
  transition: transform 0.2s;
}

.faq-item[open] summary::after { transform: rotate(45deg); }
.faq-item[open] { border-color: #3b82f640; }

.faq-item p { padding: 0 20px 20px; margin: 0; color: #94a3b8; line-height: 1.7; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'details-animation',
      defaultTab: 'css',
      text: "Until recently, animating the `<details>` open/close required JavaScript. Now `interpolate-size: allow-keywords` lets you transition `height: 0` to `height: auto`. Combine with `@starting-style` and you have a CSS-only animated accordion.",
      files: {
        html: `<details class="accordion">
  <summary>Click to expand (CSS-only animation)</summary>
  <div class="content">
    <p>This content animates open and closed using native CSS — no JavaScript required. The interpolate-size property enables transitions to/from auto dimensions.</p>
    <p>This is a game-changer for accordions, tooltips, and any height: auto transitions.</p>
  </div>
</details>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Enable auto-dimension transitions */
:root { interpolate-size: allow-keywords; }

.accordion {
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #334155;
  max-width: 500px;
  overflow: hidden;
}

.accordion summary {
  padding: 16px 20px;
  cursor: pointer;
  font-weight: 600;
  color: #e2e8f0;
  list-style: none;
}

.accordion .content {
  padding: 0 20px;
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease, padding 0.3s ease;
}

.accordion[open] .content {
  height: auto;
  padding: 0 20px 20px;
}

@starting-style {
  .accordion[open] .content { height: 0; padding: 0 20px; }
}

.content p { color: #94a3b8; margin: 0 0 12px; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-details'
    },
    {
      type: 'narration',
      id: 'popover-api',
      defaultTab: 'html',
      text: "The Popover API (2023) adds `popover` attribute to any element and `popovertarget` to any button. The browser manages show/hide, focus, Escape key, and light-dismiss (clicking outside). Style with `[popover]` and `::backdrop`. No JavaScript needed for the open/close behavior.",
      files: {
        html: `<button popovertarget="tip">Show Tip ▼</button>

<div id="tip" popover>
  <strong>Pro tip:</strong> Native popovers handle Escape, focus, and light-dismiss automatically.
  They're accessible by default and work for tooltips, menus, and notifications.
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; }

[popover] {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  color: #e2e8f0;
  max-width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  /* Popover is centered by default — no positioning needed */
}

[popover]::backdrop { background: rgba(0,0,0,0.3); }
[popover] strong { color: #38bdf8; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'form-styling',
      defaultTab: 'css',
      text: "Native form elements are notoriously hard to style — or so they used to be. Modern CSS has `accent-color` to theme checkboxes, radios, and range sliders. `appearance: none` removes all browser styling so you can build from scratch. The `:user-valid` and `:user-invalid` pseudo-classes only apply AFTER the user has interacted with a field.",
      files: {
        html: `<form class="form">
  <label class="row">
    <input type="checkbox" checked> I agree to the terms
  </label>
  <label class="row">
    <input type="radio" name="plan" checked> Free
  </label>
  <label class="row">
    <input type="radio" name="plan"> Pro
  </label>
  <label class="col">
    Volume <input type="range" min="0" max="100" value="60">
  </label>
  <label class="col">
    Email <input type="email" placeholder="you@example.com" required>
  </label>
</form>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.form { background: #1e293b; padding: 24px; border-radius: 10px; max-width: 360px; display: flex; flex-direction: column; gap: 16px; }

/* accent-color themes checkboxes, radios, and range natively */
:root { accent-color: #3b82f6; }

.row { display: flex; align-items: center; gap: 10px; cursor: pointer; color: #e2e8f0; }
.col { display: flex; flex-direction: column; gap: 6px; color: #94a3b8; font-size: 0.9rem; }

input[type="email"] { background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 1rem; width: 100%; }
input[type="range"] { width: 100%; }

/* :user-invalid only triggers AFTER interaction */
input:user-invalid { border-color: #ef4444; outline: none; box-shadow: 0 0 0 3px #ef444430; }
input:user-valid { border-color: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-form-elements'
    },
    {
      type: 'narration',
      id: 'semantic-html',
      defaultTab: 'html',
      text: "CSS only works its best when the HTML is semantic. `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>` — these give you free accessibility landmarks, predictable styling hooks, and cleaner selectors. They also give browsers and screen readers context to navigate the page structure.",
      files: {
        html: `<body>
  <header class="site-header">
    <nav aria-label="Main navigation">
      <a href="#">Logo</a>
      <a href="#">Work</a>
      <a href="#">About</a>
    </nav>
  </header>

  <main>
    <article class="post">
      <header>
        <h1>Semantic HTML Matters</h1>
        <time datetime="2024-01-15">January 15, 2024</time>
      </header>
      <p>Semantic elements give browsers and screen readers the context they need.</p>
    </article>

    <aside class="sidebar">
      <p>Related links</p>
    </aside>
  </main>

  <footer class="site-footer">
    <p>© 2024</p>
  </footer>
</body>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }

.site-header { background: #1e293b; border-bottom: 1px solid #334155; }
.site-header nav { display: flex; gap: 4px; padding: 12px 24px; align-items: center; }
.site-header a { color: #94a3b8; text-decoration: none; padding: 8px 14px; border-radius: 6px; }
.site-header a:first-child { font-weight: 700; color: #e2e8f0; margin-right: auto; }

main { display: grid; grid-template-columns: 1fr 220px; gap: 24px; padding: 32px 24px; align-items: start; }
.post { background: #1e293b; padding: 28px; border-radius: 10px; }
.post header { margin-bottom: 16px; }
.post h1 { margin: 0 0 6px; font-size: 1.4rem; color: #e2e8f0; }
time { color: #64748b; font-size: 0.85rem; }
.post p { color: #94a3b8; line-height: 1.7; margin: 0; }
.sidebar { background: #1e293b; padding: 20px; border-radius: 10px; font-size: 0.9rem; color: #64748b; }

.site-footer { background: #1e293b; border-top: 1px solid #334155; padding: 16px 24px; color: #475569; font-size: 0.85rem; }`,
        js: ''
      }
    },
    {
      type: 'challenge',
      id: 'ch-dialog',
      text: "Style the native `<dialog>` so it looks polished: dark background `#1e293b`, rounded corners `12px`, white text, a `::backdrop` with a semi-transparent dark overlay. The close button should be blue. Test by clicking 'Open'.",
      hint: "Target the dialog element directly: dialog { background: #1e293b; ... } and dialog::backdrop { background: rgba(0,0,0,0.7); }",
      defaultTab: 'css',
      startFiles: {
        html: `<dialog id="dlg">
  <h2>Styled Dialog</h2>
  <p>Add CSS to make this look great.</p>
  <form method="dialog">
    <button class="close-btn">Close</button>
  </form>
</dialog>
<button class="open-btn" onclick="document.getElementById('dlg').showModal()">Open</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Style the dialog and its backdrop */

.open-btn { background: #334155; color: #f1f5f9; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /dialog\s*\{/.test(css) && /::backdrop/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-details',
      text: "Style the `<details>` element as an accordion: summary should be bold and have a `+` icon that rotates to `×` when open. The content should have padding. Use `details[open]` to style the expanded state.",
      hint: "Use summary::after { content: '+' } and details[open] summary::after { transform: rotate(45deg) } for the icon. Target details[open] for expanded styles.",
      defaultTab: 'css',
      startFiles: {
        html: `<details>
  <summary>What is the cascade?</summary>
  <p>The cascade is the algorithm that resolves conflicts when multiple CSS rules target the same element. It considers specificity, source order, and @layer priority.</p>
</details>

<details>
  <summary>What is specificity?</summary>
  <p>Specificity is a score computed per CSS rule. The rule with the highest score wins, regardless of source order, when two rules target the same property on the same element.</p>
</details>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 8px; }

/* Style details as an accordion with open/close icon */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /details/.test(css) && /summary/.test(css) && /\[open\]/.test(css);
      }
    }
  ]
};
