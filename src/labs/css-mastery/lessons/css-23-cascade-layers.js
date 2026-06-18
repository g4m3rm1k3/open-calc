export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-23-cascade-layers',
  title: '23. Cascade Layers',
  chapter: 'css-ch5',
  language: 'web',
  checkpoints: [
    { id: 'cp-layer-declare', label: 'Declaring Layers' },
    { id: 'cp-layer-order', label: 'Layer Order' },
    { id: 'cp-layer-import', label: 'Third-party Layers' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Your CSS file is 2,000 lines. You have a third-party reset at the top, your base styles, component styles, and utility overrides at the bottom. A `.text-red` utility class doesn't override a component's `.card p { color: blue }` because the component uses a more specific selector. You add `!important` to your utility. Now you can't override the utility either. The real problem: specificity is the wrong tool for controlling style precedence at scale.",
      files: {
        html: `<div class="card">
  <p class="text-red">This text should be red (utility class)</p>
  <p>Normal card paragraph</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Component: .card p has (0,0,2,0) */
.card p { color: #94a3b8; background: #1e293b; padding: 12px 16px; border-radius: 4px; margin: 8px 0; }
.card { background: #0f172a; border: 1px solid #334155; padding: 16px; border-radius: 8px; }

/* Utility: .text-red has (0,0,1,0) — LOSES to .card p */
.text-red { color: #ef4444; }

/* The utility class loses the specificity battle even though it's "more important" */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'what-are-layers',
      defaultTab: 'css',
      text: "`@layer` creates named cascade layers. All rules inside a lower-priority layer lose to rules in a higher-priority layer — regardless of specificity. The layer order is determined by the first time each layer name appears in your stylesheet. Later layers win. Unlayered styles beat all layers.",
      files: {
        html: `<div class="card">
  <p class="text-red">Now the utility wins</p>
  <p>Normal card paragraph</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Declare layer order: base < components < utilities */
@layer base, components, utilities;

@layer components {
  /* (0,0,2,0) — high specificity, but lower layer */
  .card p { color: #94a3b8; background: #1e293b; padding: 12px 16px; border-radius: 4px; margin: 8px 0; }
  .card { background: #0f172a; border: 1px solid #334155; padding: 16px; border-radius: 8px; }
}

@layer utilities {
  /* (0,0,1,0) — lower specificity, but HIGHER layer — wins */
  .text-red { color: #ef4444; }
  .text-blue { color: #3b82f6; }
  .text-green { color: #10b981; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'declare-order',
      defaultTab: 'css',
      text: "The `@layer base, components, utilities` declaration at the top is the key. This single statement locks in the layer priority order. Even if `@layer components` appears before `@layer utilities` in the file, the first declaration controls which wins. This separates cascade control from source order.",
      files: {
        html: `<p class="msg">What layer wins?</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* The ORDER declaration comes first — this is the priority list */
/* utilities > components > base (later = higher priority) */
@layer base, components, utilities;

/* Even though 'components' appears later in the file than 'utilities'... */
@layer utilities {
  .msg { color: #10b981; } /* wins because utilities > components */
}

/* ...components still loses to utilities */
@layer components {
  .msg { color: #ef4444; background: #1e293b; padding: 16px; border-radius: 8px; font-size: 1.2rem; }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-layer-declare'
    },
    {
      type: 'narration',
      id: 'unlayered-wins',
      defaultTab: 'css',
      text: "Unlayered styles — CSS not inside any `@layer` — automatically win against all layered styles. This is intentional: it means adding layers to existing code is backwards-compatible. Existing unlayered overrides still work. Third-party libraries can be wrapped in a low-priority layer without touching their source.",
      files: {
        html: `<p class="msg">Unlayered vs layered</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

@layer utilities;

@layer utilities {
  .msg { color: #3b82f6; font-size: 1.2rem; } /* layered — loses */
}

/* Unlayered — wins against ALL layers */
.msg { color: #10b981; background: #1e293b; padding: 16px; border-radius: 8px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'reset-in-layer',
      defaultTab: 'css',
      text: "The killer use case: wrap third-party CSS resets in a `@layer reset`. The reset gets the lowest priority. Your component styles always win — no more fighting `normalize.css` or browser resets with `!important`. The reset does its job on unstyled elements without interfering with your styled ones.",
      files: {
        html: `<ul class="nav-list">
  <li><a href="#">Home</a></li>
  <li><a href="#">About</a></li>
  <li><a href="#">Work</a></li>
</ul>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Reset gets lowest priority */
@layer reset {
  ul { list-style: disc; padding-left: 2em; } /* browser-style reset */
  a { color: blue; text-decoration: underline; } /* default link style */
}

/* Component styles always win over reset — no !important needed */
.nav-list { list-style: none; padding: 0; display: flex; gap: 8px; }
.nav-list a { color: #94a3b8; text-decoration: none; padding: 8px 16px; border-radius: 6px; transition: background 0.15s; }
.nav-list a:hover { background: #1e293b; color: #f1f5f9; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-layer-order'
    },
    {
      type: 'narration',
      id: 'nested-layers',
      defaultTab: 'css',
      text: "Layers can be nested with dot notation: `@layer framework.reset`, `@layer framework.components`. This lets library authors create their own internal layer hierarchy that doesn't conflict with your layers. Nesting is a namespacing tool.",
      files: {
        html: `<div class="widget">
  <h3>Widget Title</h3>
  <p>Widget content</p>
  <button class="widget-btn">Action</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* A library might ship with its own internal layers */
@layer lib.base, lib.components;

@layer lib.base {
  .widget { background: #1e293b; padding: 20px; border-radius: 8px; }
  .widget h3 { margin: 0 0 12px; color: #e2e8f0; }
  .widget p { margin: 0 0 16px; color: #94a3b8; }
}

@layer lib.components {
  /* lib.components > lib.base */
  .widget-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
}

/* Your unlayered override always wins over all lib.* layers */
.widget h3 { color: #38bdf8; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'practical-architecture',
      defaultTab: 'css',
      text: "A practical 4-layer architecture for real projects: `@layer reset, base, components, utilities`. Reset: `normalize.css`. Base: element defaults, typography. Components: `.card`, `.btn`, `.navbar`. Utilities: single-purpose overrides `.hidden`, `.text-center`, `.mt-4`. The layers encode the intent — utilities are supposed to override components.",
      files: {
        html: `<div class="card mt-lg">
  <h2>Card Component</h2>
  <p>Body text</p>
  <button class="btn text-bold">Action</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
  h1, h2, h3 { font-weight: inherit; }
}

@layer base {
  body { font-family: sans-serif; line-height: 1.6; }
  h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: #e2e8f0; }
  p { color: #94a3b8; }
}

@layer components {
  .card { background: #1e293b; padding: 24px; border-radius: 10px; border: 1px solid #334155; }
  .btn { background: #3b82f6; color: white; border: none; padding: 10px 22px; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 16px; display: block; }
}

@layer utilities {
  .mt-lg { margin-top: 32px; }
  .text-bold { font-weight: 700; }
  .hidden { display: none; }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-layer-import'
    },
    {
      type: 'narration',
      id: 'important-in-layers',
      defaultTab: 'css',
      text: "`!important` inside a layer reverses the layer order. A `!important` rule in a lower-priority layer beats a `!important` rule in a higher-priority layer. This is intentional — it lets user accessibility stylesheets (`!important` at the bottom) override author `!important` rules. For author CSS, just don't use `!important` with layers.",
      files: {
        html: `<p class="msg">!important in layers reverses priority</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

@layer base, utilities;

@layer utilities {
  /* !important in utilities layer */
  .msg { color: #ef4444 !important; }
}

@layer base {
  /* !important in base — WINS because !important reverses layer order */
  .msg { color: #10b981 !important; background: #1e293b; padding: 16px; border-radius: 8px; font-size: 1.2rem; }
}`,
        js: ''
      }
    },
    {
      type: 'challenge',
      id: 'ch-layer-fix',
      text: "The `.highlight` utility class should override the `.article p` component style, but right now the component wins due to higher specificity. Introduce `@layer components, utilities` to fix the precedence without changing any selectors or adding `!important`.",
      hint: "Wrap .article styles in @layer components { } and .highlight in @layer utilities { }. Declare @layer components, utilities at the top so utilities win.",
      defaultTab: 'css',
      startFiles: {
        html: `<article class="article">
  <p>Normal paragraph.</p>
  <p class="highlight">This should be highlighted yellow — but specificity blocks it.</p>
</article>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

/* Wrap these in @layer components and @layer utilities */
.article p { color: #94a3b8; background: #1e293b; padding: 12px 16px; border-radius: 4px; margin: 8px 0; font-size: 1rem; }
.article { border: 1px solid #334155; padding: 16px; border-radius: 8px; }

.highlight { color: #fbbf24; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /@layer/.test(css) && /components/.test(css) && /utilities/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-reset-layer',
      text: "Wrap all the 'reset' styles (the `*`, `ul`, `a` rules) inside `@layer reset` so your component styles (`.nav` and `.nav a`) always win without needing `!important`.",
      hint: "Add @layer reset { } around the reset rules and @layer components { } around the .nav rules. Declare @layer reset, components at the top.",
      defaultTab: 'css',
      startFiles: {
        html: `<ul class="nav">
  <li><a href="#">Home</a></li>
  <li><a href="#">About</a></li>
  <li><a href="#">Contact</a></li>
</ul>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Wrap these in @layer reset */
ul { list-style: disc; padding-left: 2em; margin: 0; }
a { color: blue; text-decoration: underline; }

/* Wrap these in @layer components */
.nav { list-style: none; padding: 0; display: flex; gap: 4px; }
.nav a { color: #94a3b8; text-decoration: none; padding: 8px 16px; border-radius: 6px; }
.nav a:hover { background: #1e293b; color: #f1f5f9; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /@layer\s+reset/.test(css) && /@layer\s+[a-z,\s]*components/.test(css);
      }
    }
  ]
};
