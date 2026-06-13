export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-24-selector-scope',
  title: '24. Selector Scope & Modern Selectors',
  chapter: 'css-ch5',
  language: 'web',
  checkpoints: [
    { id: 'cp-is-where', label: ':is() and :where()' },
    { id: 'cp-has', label: ':has() Parent Selector' },
    { id: 'cp-scope', label: '@scope' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You write styles for a `.card` component. A month later you find `.card` styles bleeding into a completely different page section that also uses `.card` as a generic class name. You've been bitten by the global nature of CSS. Modern CSS has tools to contain styles to a subtree: `:is()`, `:where()`, `:has()`, and `@scope`. These are game-changers.",
      files: {
        html: `<div class="sidebar">
  <div class="card">Sidebar card — should NOT get card styles</div>
</div>

<div class="main">
  <div class="card">Main card — should get card styles</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; gap: 24px; }

/* .card affects BOTH — there's no scoping */
.card { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 12px; font-weight: 600; }

.sidebar { width: 200px; background: #1e293b; padding: 16px; border-radius: 8px; }
.main { flex: 1; background: #1e293b; padding: 16px; border-radius: 8px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'is-selector',
      defaultTab: 'css',
      text: "`:is()` takes a list of selectors and matches any of them. It de-duplicates long selector lists. It takes the specificity of its MOST SPECIFIC argument. This is perfect for matching multiple heading levels or states without repetition.",
      files: {
        html: `<article>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <p>Paragraph</p>
  <section>
    <h2>Section Heading 2</h2>
    <p>Section paragraph</p>
  </section>
</article>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

article { background: #1e293b; padding: 24px; border-radius: 8px; color: #e2e8f0; }
article p { color: #94a3b8; line-height: 1.6; }

/* Without :is() — 3 separate rules */
/* h1, h2, h3 { color: #38bdf8; } */

/* With :is() — one rule that's easier to maintain */
/* Specificity = (0,0,0,1) — same as h1 */
:is(h1, h2, h3) { color: #38bdf8; margin: 0 0 12px; }

/* Scoped to article — same as writing article h1, article h2, article h3 */
/* article :is(h1, h2, h3) { color: #38bdf8; } */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'where-selector',
      defaultTab: 'css',
      text: "`:where()` is identical to `:is()` — except its specificity is ALWAYS zero: (0,0,0,0). This makes it perfect for base styles that should be easy to override. If you write a base stylesheet and want zero-specificity reset styles, use `:where()`. Any class can override it without specificity battles.",
      files: {
        html: `<nav>
  <a href="#">Nav Link 1</a>
  <a href="#">Nav Link 2</a>
</nav>

<footer>
  <a href="#" class="footer-link">Footer Link</a>
</footer>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; }

nav, footer { background: #1e293b; padding: 16px; border-radius: 8px; }

/* :where() = (0,0,0,0) specificity — any class can override */
:where(nav, footer) a {
  color: #94a3b8;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
}

/* (0,0,1,0) — easily overrides :where() rule */
.footer-link { color: #3b82f6; text-decoration: underline; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-is-where'
    },
    {
      type: 'narration',
      id: 'has-selector',
      defaultTab: 'css',
      text: "`:has()` is the parent selector CSS has needed for decades. It matches an element IF it contains a matching descendant. You can now style a `.card` differently when it contains an image, style a `label` when its paired `input` is checked, or style a `section` when it has an `h2` child.",
      files: {
        html: `<div class="card">
  <p>Card without image — compact style</p>
</div>

<div class="card">
  <div class="card-img" style="background: linear-gradient(135deg, #3b82f6, #7c3aed); height: 120px; border-radius: 6px;"></div>
  <p>Card with image — gets larger padding and different border</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

.card { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; }
.card p { margin: 0; color: #94a3b8; }

/* Style .card differently when it contains .card-img */
.card:has(.card-img) {
  padding: 0;
  border-color: #3b82f6;
  overflow: hidden;
}

.card:has(.card-img) .card-img { border-radius: 8px 8px 0 0; }
.card:has(.card-img) p { padding: 16px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'has-form',
      defaultTab: 'css',
      text: "`:has()` in forms is exceptional. Style a label differently when its input is checked. Style a form section when it contains an invalid input. Style a `.field` when it `:has(input:focus)`. This replaces JavaScript-driven class toggling for many common UI patterns.",
      files: {
        html: `<form>
  <div class="field">
    <label>
      <input type="checkbox">
      Accept terms
    </label>
  </div>
  <div class="field">
    <label>Email</label>
    <input type="email" placeholder="you@example.com" required>
  </div>
</form>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

form { background: #1e293b; padding: 24px; border-radius: 8px; display: flex; flex-direction: column; gap: 16px; max-width: 360px; }

.field { display: flex; flex-direction: column; gap: 6px; }
label { color: #94a3b8; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
input[type="email"] { background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 1rem; }

/* Field gets a green border when it :has a checked checkbox */
.field:has(input:checked) label { color: #10b981; }
.field:has(input:checked) { background: #10b98115; border-radius: 6px; padding: 8px; }

/* Field gets a red border when it :has an invalid, non-empty input */
.field:has(input:invalid:not(:placeholder-shown)) input { border-color: #ef4444; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-has'
    },
    {
      type: 'narration',
      id: 'scope-rule',
      defaultTab: 'css',
      text: "`@scope` is the newest tool for scoping styles to a component subtree. It takes a root selector (where scope starts) and optionally a limit selector (where scope stops). Styles inside only apply between the root and the limit — a true component boundary in pure CSS.",
      files: {
        html: `<div class="card">
  <h2>Card Title</h2>
  <p>Card paragraph</p>
  <div class="footer">
    <p>Footer paragraph — NOT styled by card scope</p>
  </div>
</div>

<p>Outside paragraph — not scoped</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #94a3b8; padding: 32px; display: flex; flex-direction: column; gap: 16px; }

.card { background: #1e293b; padding: 24px; border-radius: 8px; }
.footer { background: #0f172a; padding: 16px; border-radius: 6px; margin-top: 12px; }

/* @scope: root = .card, limit = .footer */
/* Styles only apply inside .card BUT stop at .footer */
@scope (.card) to (.footer) {
  h2 { color: #38bdf8; margin: 0 0 12px; }
  p { color: #e2e8f0; margin: 0; line-height: 1.6; } /* .footer p is NOT matched */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'nesting',
      defaultTab: 'css',
      text: "Native CSS nesting (no preprocessor) is now supported. Inside a rule, `&` refers to the parent selector. Nested selectors are scoped to the parent automatically. This is the same nesting syntax as SCSS — it generates scoped selectors without the build step.",
      files: {
        html: `<nav class="nav">
  <a href="#">Home</a>
  <a href="#" class="active">About</a>
  <a href="#">Work</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Native CSS nesting — no SCSS/PostCSS needed */
.nav {
  display: flex;
  gap: 4px;
  background: #1e293b;
  padding: 8px;
  border-radius: 8px;

  & a {
    color: #94a3b8;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    transition: background 0.15s, color 0.15s;

    &:hover { background: #334155; color: #f1f5f9; }
    &.active { background: #3b82f620; color: #3b82f6; font-weight: 600; }
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-scope'
    },
    {
      type: 'narration',
      id: 'combining',
      defaultTab: 'css',
      text: "The power comes from combining these tools. A component can use `:where()` for zero-specificity base styles, `:has()` for state-driven styling, and `@scope` for boundary enforcement — all without JavaScript, all in plain CSS.",
      files: {
        html: `<div class="toggle-card">
  <h3>Feature Toggle</h3>
  <label class="toggle">
    <input type="checkbox" id="feat">
    <span class="label-text">Enable Dark Mode</span>
  </label>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

@scope (.toggle-card) {
  :scope { background: #1e293b; padding: 24px; border-radius: 10px; max-width: 320px; border: 1px solid #334155; transition: border-color 0.2s; }
  h3 { margin: 0 0 16px; color: #e2e8f0; }

  .toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .toggle input { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; }

  :where(.label-text) { color: #94a3b8; font-size: 0.95rem; }

  /* :has() drives the active state — pure CSS, no JS */
  :scope:has(input:checked) { border-color: #3b82f6; background: #1e293b; }
  :scope:has(input:checked) .label-text { color: #3b82f6; font-weight: 600; }
}`,
        js: ''
      }
    },
    {
      type: 'challenge',
      id: 'ch-has',
      text: "Use `:has()` to make the `.form-group` show a green background (`#10b98120`) and green border when its `input` is valid (has a value that passes validation). The input is `type=\"email\"` — it's invalid when empty or malformed.",
      hint: "Use .form-group:has(input:valid) { background: ...; border-color: ...; } — :valid on input applies when the field has a valid value.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="form-group">
  <label>Email Address</label>
  <input type="email" placeholder="you@example.com">
  <span class="hint">Enter a valid email to see the success state</span>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.form-group { background: #1e293b; padding: 20px; border-radius: 8px; border: 2px solid #334155; max-width: 360px; transition: background 0.2s, border-color 0.2s; }
label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px; }
input { width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 1rem; }
.hint { display: block; font-size: 0.8rem; color: #64748b; margin-top: 8px; }

/* Add :has() rule to show success state */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /:has\(\s*input:valid\s*\)/.test(css) || /:has\(\s*input:not\(:invalid\)\s*\)/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-is-where',
      text: "Refactor the three separate heading rules into a single `:is()` rule. Then wrap that rule in `:where()` so it has zero specificity — allowing any single class to override it easily. Verify the `.special` class can override the heading color to purple.",
      hint: "Use :where(h1, h2, h3) { color: #38bdf8; } — the :where() wrapper makes specificity (0,0,0,0), so .special { color: #7c3aed; } easily overrides it.",
      defaultTab: 'css',
      startFiles: {
        html: `<article>
  <h1>Heading 1</h1>
  <h2 class="special">Special Heading 2 (should be purple)</h2>
  <h3>Heading 3</h3>
</article>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

article { background: #1e293b; padding: 24px; border-radius: 8px; }

/* Refactor these 3 rules into a single :where(:is()) rule */
h1 { color: #38bdf8; margin: 0 0 12px; }
h2 { color: #38bdf8; margin: 0 0 12px; }
h3 { color: #38bdf8; margin: 0 0 12px; }

.special { color: #7c3aed; } /* This should win easily */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /:where\(/.test(css) && /:is\(/.test(css);
      }
    }
  ]
};
