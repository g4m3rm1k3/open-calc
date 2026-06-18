export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-21-specificity',
  title: '21. Specificity & The Cascade',
  chapter: 'css-ch5',
  language: 'web',
  checkpoints: [
    { id: 'cp-specificity-score', label: 'Specificity Score' },
    { id: 'cp-cascade-order', label: 'Cascade Order' },
    { id: 'cp-inheritance', label: 'Inheritance' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You write `.btn { color: red; }`. You add a rule below it: `.btn { color: blue; }`. Blue wins — that makes sense. But then you write `.header .btn { color: red; }` and now your blue is gone. You add `!important` to force blue back. Three days later you need to override *that*. This is how CSS spaghetti is born. The problem isn't the cascade — it's not understanding specificity.",
      files: {
        html: `<div class="header">
  <button class="btn">I should be blue</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.btn { color: blue; background: #1e293b; border: 2px solid #3b82f6; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }

/* This selector wins — even though it comes earlier in the file */
/* .header .btn is MORE SPECIFIC than .btn */
.header .btn { color: red; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'what-is-specificity',
      defaultTab: 'css',
      text: "Specificity is a score the browser computes for each CSS rule. The rule with the highest score wins — regardless of source order. There are 4 columns: inline styles (1,0,0,0), IDs (0,1,0,0), classes/attributes/pseudo-classes (0,0,1,0), elements/pseudo-elements (0,0,0,1). Compare columns left to right — the first column that differs decides the winner.",
      files: {
        html: `<p id="intro" class="highlight lead">What color am I?</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* (0,0,0,1) — element selector */
p { color: #94a3b8; font-size: 1.2rem; }

/* (0,0,1,0) — class selector */
.highlight { color: #f59e0b; }

/* (0,0,2,0) — two class selectors */
.highlight.lead { color: #10b981; }

/* (0,1,0,0) — ID selector — wins over all classes */
#intro { color: #3b82f6; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'score-examples',
      defaultTab: 'css',
      text: "Let's make the scores visible. `p` = (0,0,0,1). `.btn` = (0,0,1,0). `.nav .btn` = (0,0,2,0). `#header .btn` = (0,1,1,0). `style=\"\"` = (1,0,0,0). The scores don't carry over between columns — 11 class selectors (0,0,11,0) does NOT beat a single ID (0,1,0,0). Columns are infinite.",
      files: {
        html: `<div id="header">
  <nav class="nav">
    <button class="btn" style="color: #a855f7">Button</button>
  </nav>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* (0,0,0,1) = element */
button { color: #94a3b8; font-size: 1rem; }

/* (0,0,1,0) = class */
.btn { color: #10b981; background: #1e293b; border: 2px solid #334155; padding: 12px 24px; border-radius: 6px; cursor: pointer; }

/* (0,0,2,0) = two classes */
.nav .btn { color: #3b82f6; }

/* (0,1,1,0) = ID + class */
#header .btn { color: #f59e0b; }

/* inline style above = (1,0,0,0) — wins everything */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'source-order',
      defaultTab: 'css',
      text: "When specificity scores are equal, the rule that appears LAST in the stylesheet wins. This is the cascade's tiebreaker. Order matters only when specificity is equal. This is why utility-class libraries like Tailwind put their overrides at the end — they want the same specificity but ensure they win the order battle.",
      files: {
        html: `<p class="text">Source order tiebreaker</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

/* Same specificity (0,0,1,0) — last one wins */
.text { color: #ef4444; font-size: 1.4rem; font-weight: 600; }
.text { color: #10b981; } /* this wins — same score, comes later */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'important',
      defaultTab: 'css',
      text: "`!important` overrides ALL specificity — even inline styles. It is a nuclear option. Once you use it, the only way to override it is with another `!important`. This escalates specificity wars and is the root cause of unmaintainable CSS. Use it only for truly immutable rules like accessibility overrides.",
      files: {
        html: `<p id="msg" class="msg" style="color: #f59e0b">What color wins?</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

/* !important beats inline style (1,0,0,0) AND ID (0,1,0,0) */
.msg { color: #3b82f6 !important; font-size: 1.4rem; font-weight: 600; }

#msg { color: #ef4444; } /* (0,1,0,0) — loses to !important */`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-specificity-score'
    },
    {
      type: 'narration',
      id: 'cascade-layers',
      defaultTab: 'css',
      text: "The cascade applies rules in this order of precedence (lowest to highest): browser defaults → user stylesheets → author stylesheets → `!important` author → `!important` user → `!important` browser. 'Author' means your CSS. Within author stylesheets, `@layer` lets you assign explicit cascade layers so you control this ordering deliberately.",
      files: {
        html: `<button class="btn primary">Cascade Demo</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Define layer order: base loses to components loses to utilities */
@layer base, components, utilities;

@layer utilities {
  .btn { color: white; } /* wins — utilities layer is highest */
}

@layer base {
  .btn { color: #94a3b8; background: #334155; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }
}

@layer components {
  .primary { background: #3b82f6; } /* wins over base, loses to utilities */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'specificity-in-practice',
      defaultTab: 'css',
      text: "The winning approach: keep specificity flat. Use only class selectors. Never nest more than two levels deep. Never use IDs for styling. Never use `!important` in author CSS. This is the methodology behind BEM, Tailwind, and CSS Modules — all are essentially ways to keep specificity at (0,0,1,0) across the board.",
      files: {
        html: `<!-- BAD: specificity creep -->
<div class="card">
  <div class="card__header">
    <button id="save-btn" class="btn">Save</button>
  </div>
</div>

<style>
  /* This creates an arms race */
  #save-btn { color: red; }
  .card .card__header .btn { color: blue; }
</style>

<!-- GOOD: flat class selectors -->
<button class="btn btn--primary">Save</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Flat: all (0,0,1,0) — no nesting, no IDs */
.btn { padding: 12px 24px; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; background: #334155; color: #94a3b8; }
.btn--primary { background: #3b82f6; color: white; }
.btn--danger { background: #ef4444; color: white; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-cascade-order'
    },
    {
      type: 'narration',
      id: 'inheritance',
      defaultTab: 'css',
      text: "Some CSS properties inherit — child elements receive the parent's computed value automatically. `color`, `font-family`, `font-size`, `line-height`, `letter-spacing`, `text-align` all inherit. Layout properties (`margin`, `padding`, `border`, `width`) do NOT inherit. This is why setting `font-family` on `body` applies everywhere — children inherit it.",
      files: {
        html: `<article class="article">
  <h2>Heading</h2>
  <p>Paragraph with a <strong>bold word</strong> inside.</p>
  <ul>
    <li>List item one</li>
    <li>List item two</li>
  </ul>
</article>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0f172a; padding: 32px; }

/* Set font and color on parent — ALL descendants inherit */
.article {
  font-family: 'Georgia', serif;
  color: #e2e8f0;
  line-height: 1.7;
  font-size: 1rem;
  max-width: 500px;
  /* padding does NOT inherit */
  background: #1e293b;
  padding: 24px;
  border-radius: 8px;
}

h2 { color: #38bdf8; } /* override inherited color for heading */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'inherit-initial-unset',
      defaultTab: 'css',
      text: "You can force inheritance with `inherit`, reset to browser default with `initial`, and use `unset` to behave like `inherit` for inheritable properties or `initial` for non-inheritable ones. The `revert` keyword restores to the browser's user-agent stylesheet value — useful for un-styling elements while keeping accessibility defaults.",
      files: {
        html: `<div class="parent">
  Parent text
  <div class="child-inherit">inherit — takes parent's color</div>
  <div class="child-initial">initial — browser default (black)</div>
  <div class="child-unset">unset — inherits (because color inherits)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; padding: 32px; }

.parent { color: #3b82f6; background: #1e293b; padding: 24px; border-radius: 8px; display: flex; flex-direction: column; gap: 12px; }

.child-inherit { color: inherit; background: #0f172a; padding: 12px; border-radius: 4px; }
.child-initial { color: initial; background: #0f172a; padding: 12px; border-radius: 4px; }
.child-unset { color: unset; background: #0f172a; padding: 12px; border-radius: 4px; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-inheritance'
    },
    {
      type: 'narration',
      id: 'devtools-specificity',
      defaultTab: 'css',
      text: "Browser DevTools show you exactly which rule wins and which are crossed out. In Chrome DevTools, open the Styles panel — strikethrough text means that rule was overridden. Hover over a selector to see its specificity score in a tooltip. This is the fastest way to diagnose cascade issues in real projects.",
      files: {
        html: `<button class="btn save-btn" id="save">Save Changes</button>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

/* Open DevTools and inspect .save-btn to see the cascade in action */
button { background: #334155; color: #94a3b8; } /* (0,0,0,1) — overridden */
.btn { background: #1e293b; color: #e2e8f0; padding: 12px 24px; border: 2px solid #334155; border-radius: 6px; font-size: 1rem; cursor: pointer; } /* (0,0,1,0) — overridden */
.save-btn { background: #3b82f6; color: white; } /* (0,0,1,0) — wins (source order) */
#save { border-color: #60a5fa; } /* (0,1,0,0) — wins for border */`,
        js: ''
      }
    },
    {
      type: 'challenge',
      id: 'ch-override',
      text: "The `.highlight` class is being overridden by the `#box` ID rule which makes the text red. Without touching the HTML or using `!important`, fix the CSS so `.highlight` wins and text is green (`#10b981`).",
      hint: "Give .highlight a higher specificity by adding another selector — like `.container .highlight` — to beat the ID's (0,1,0,0) score.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="container">
  <div id="box" class="highlight">Fix me — I should be green</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

#box { color: red; font-size: 1.3rem; padding: 20px; background: #1e293b; border-radius: 8px; }

/* Fix .highlight to win against #box — no !important allowed */
.highlight { color: #94a3b8; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /\.container\s+\.highlight|\.highlight\.highlight|\.highlight\[/.test(css) ||
          /\.container\s+#box|html\s+\.highlight/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-flat',
      text: "Refactor the nested, high-specificity CSS into flat class selectors. Each button variant should use only a single class. The visual result should be identical — blue primary button, red danger button.",
      hint: "Replace `.card .actions button.primary` with `.btn-primary` and `.card .actions button.danger` with `.btn-danger`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card">
  <div class="actions">
    <button class="btn primary">Save</button>
    <button class="btn danger">Delete</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.card { background: #1e293b; padding: 24px; border-radius: 8px; }
.actions { display: flex; gap: 12px; }

/* Refactor these to flat single-class selectors */
.card .actions button.primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }
.card .actions button.danger { background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const noDeepNesting = !/.card\s+.actions/.test(css);
        const hasFlat = /\.(btn-primary|btn--primary|primary-btn)\s*\{/.test(css) ||
          /\.primary\s*\{[^}]*background\s*:\s*#3b82f6/.test(css);
        return noDeepNesting && hasFlat;
      }
    }
  ]
};
