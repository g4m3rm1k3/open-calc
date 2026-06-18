export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-16-container-queries',
  title: '16. Container Queries',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-container-queries', label: 'Container Queries' },
    { id: 'cp-cq-advanced', label: 'Advanced CQ' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "The same card component in two different layouts. In the main feed it has room — image beside text looks great. In the sidebar it's narrow — image beside text is cramped. Media queries respond to the VIEWPORT. But the card doesn't know which layout it's in. You'd need to write sidebar-specific selectors. Container queries solve this: the card responds to its own container's width.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page-layout">
  <main class="main-feed">
    <h3>Main Feed (wide)</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Article Title</h4>
        <p>In a wide context, the image should sit beside the text in a row layout.</p>
      </div>
    </div>
  </main>

  <aside class="sidebar">
    <h3>Sidebar (narrow)</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Article Title</h4>
        <p>In a narrow context, the same card component should stack image above text.</p>
      </div>
    </div>
  </aside>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.page-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

.main-feed, .sidebar {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}

h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 16px; }

/* No container queries yet — card is always a column, broken in wide context */
.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column; /* always stacked — ignores available space */
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 120px;
  flex-shrink: 0;
}

.card-body {
  padding: 16px;
}

h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'container-queries-idea',
      defaultTab: 'css',
      text: "Container queries let a component respond to its OWN container's size. The card can say: 'if my container is wider than 400px, show the image beside the text.' It doesn't know or care whether that container is a main feed, a sidebar, or a modal. The component is truly self-contained. This is component-level responsiveness.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h2>The Container Query Idea</h2>
  <div class="row">
    <div class="wrapper-wide">
      <p class="label">Wide container → row layout</p>
      <div class="smart-card"><div class="sc-img"></div><div class="sc-body"><h4>Title</h4><p>Content adapts to its container width, not the viewport.</p></div></div>
    </div>
    <div class="wrapper-narrow">
      <p class="label">Narrow container → stack layout</p>
      <div class="smart-card"><div class="sc-img"></div><div class="sc-body"><h4>Title</h4><p>Same component, different container.</p></div></div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

h2 { font-size: 1.3rem; margin-bottom: 24px; }
.label { font-size: 0.75rem; color: #64748b; margin-bottom: 8px; font-family: monospace; }

.row { display: flex; gap: 24px; align-items: start; }

.wrapper-wide {
  flex: 2;
  background: #1e293b;
  border: 1px dashed #3b82f6;
  border-radius: 10px;
  padding: 16px;
  /* Will be a container */
}

.wrapper-narrow {
  flex: 1;
  background: #1e293b;
  border: 1px dashed #6366f1;
  border-radius: 10px;
  padding: 16px;
  /* Will be a container */
}

.smart-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sc-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 100px;
}

.sc-body { padding: 12px; }
h4 { font-size: 0.95rem; margin-bottom: 6px; }
p { font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'containment',
      defaultTab: 'css',
      text: "First, declare the container: `container-type: inline-size` on the parent element. This tells the browser 'this element is a container — children can query my size.' Without this declaration on the parent, there is nothing to query. The children remain unaware of their context.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page-layout">
  <main class="main-feed">
    <h3>Main Feed</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body"><h4>Article</h4><p>Container-type is now set on the parents. Cards can now query their container.</p></div>
    </div>
  </main>
  <aside class="sidebar">
    <h3>Sidebar</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body"><h4>Article</h4><p>Same card, narrow container.</p></div>
    </div>
  </aside>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.page-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

.main-feed, .sidebar {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  /* Step 1: Declare these as containers */
  container-type: inline-size;
}

h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 16px; }

.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Step 2: Container queries will go here next */
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 120px;
  flex-shrink: 0;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'cq-syntax',
      defaultTab: 'css',
      text: "`@container (min-width: 400px) { .card { flex-direction: row; } }` — almost identical to media queries, but checks the container's width. When the card's container is wider than 400px, the card switches to a row layout. When the container is narrow, it stacks. The card is now context-aware without knowing anything about the viewport.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page-layout">
  <main class="main-feed">
    <h3>Main Feed (wide container)</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body"><h4>Article Title</h4><p>Wide container → row layout. Image beside text.</p></div>
    </div>
  </main>
  <aside class="sidebar">
    <h3>Sidebar (narrow container)</h3>
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body"><h4>Article Title</h4><p>Narrow container → stacked layout.</p></div>
    </div>
  </aside>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.page-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

.main-feed, .sidebar {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  container-type: inline-size; /* declare as containers */
}

h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 16px; }

/* Default (narrow): stacked */
.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 120px;
  flex-shrink: 0;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

/* When the CONTAINER is wider than 380px: row layout */
@container (min-width: 380px) {
  .card {
    flex-direction: row;
  }

  .card-img {
    width: 140px;
    height: auto;
    min-height: 120px;
  }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'container-name',
      defaultTab: 'css',
      text: "You can name containers and query them by name. `container-name: sidebar` on the container, then `@container sidebar (min-width: 300px)` in the child. This lets a deeply nested component respond specifically to a named ancestor — even if there are other containers in between. Useful when you have overlapping container hierarchies.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="layout">
  <div class="card-list">
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Named Container Query</h4>
        <p>This card queries the "card-list" container by name, not just the nearest container.</p>
      </div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.layout {
  max-width: 700px;
  margin: 0 auto;
}

/* Named container — children can reference this by name */
.card-list {
  container-type: inline-size;
  container-name: card-list; /* assign a name */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}

.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 130px;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

/* Query the NAMED container — not just the nearest ancestor */
@container card-list (min-width: 400px) {
  .card { flex-direction: row; }
  .card-img { width: 150px; height: auto; min-height: 120px; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'cq-units',
      defaultTab: 'css',
      text: "Container query units: `cqi` = 1% of the container's inline (horizontal) size. `cqb` = 1% of the block (vertical) size. `cqmin` = smaller of the two. Use these like vw/vh but relative to the container. `font-size: clamp(0.875rem, 3cqi, 1.25rem)` makes text scale with the component's own width — a completely self-contained responsive font.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="layout">
  <div class="wide-panel">
    <h3>Wide Panel</h3>
    <p class="fluid-text">This text uses font-size: clamp(0.875rem, 2cqi, 1.25rem) — it scales with the PANEL width, not the viewport.</p>
  </div>
  <div class="narrow-panel">
    <h3>Narrow Panel</h3>
    <p class="fluid-text">Same CSS, narrower container — text is proportionally smaller.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.layout {
  display: flex;
  gap: 24px;
  align-items: start;
}

/* Both panels are containers */
.wide-panel, .narrow-panel {
  container-type: inline-size;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
}

.wide-panel { flex: 2; }
.narrow-panel { flex: 1; }

h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 12px;
}

.fluid-text {
  /* Scales with the container width using cqi units */
  font-size: clamp(0.75rem, 2cqi, 1.125rem);
  color: #94a3b8;
  line-height: 1.6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'component-vs-viewport',
      defaultTab: 'css',
      text: "Container queries enforce component-level thinking: each component owns its responsive behavior entirely. The parent layout doesn't need to know what breakpoints a child uses. Drop the same card component into a 3-column grid, a sidebar, a modal, or a full-width feed — it adapts correctly every time. This is what 'truly reusable components' means.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<h2>The same card component in 3 different contexts:</h2>
<div class="context-demo">
  <!-- Context 1: Full width -->
  <div class="full-width-ctx">
    <span class="ctx-label">Full width</span>
    <div class="reusable-card"><div class="rc-img"></div><div class="rc-body"><strong>Card</strong><p>Row layout when wide</p></div></div>
  </div>

  <!-- Context 2: Grid cell -->
  <div class="grid-ctx">
    <span class="ctx-label">2-column grid</span>
    <div class="reusable-card"><div class="rc-img"></div><div class="rc-body"><strong>Card</strong><p>Adapts to cell width</p></div></div>
    <div class="reusable-card"><div class="rc-img"></div><div class="rc-body"><strong>Card</strong><p>Adapts to cell width</p></div></div>
  </div>

  <!-- Context 3: Narrow sidebar -->
  <div class="narrow-ctx">
    <span class="ctx-label">Sidebar</span>
    <div class="reusable-card"><div class="rc-img"></div><div class="rc-body"><strong>Card</strong><p>Stacked when narrow</p></div></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

h2 { font-size: 1.1rem; color: #94a3b8; margin-bottom: 20px; }

.context-demo {
  display: grid;
  grid-template-columns: 1fr 1fr 200px;
  gap: 16px;
  align-items: start;
}

.full-width-ctx {
  grid-column: 1 / -1; /* spans all columns */
}

.ctx-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  margin-bottom: 8px;
}

/* ALL three contexts are containers */
.full-width-ctx, .grid-ctx, .narrow-ctx {
  container-type: inline-size;
  background: #1e293b;
  border: 1px dashed #334155;
  border-radius: 10px;
  padding: 12px;
}

.grid-ctx {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* The card component — self-contained responsive behavior */
.reusable-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column; /* default: stacked */
}

.rc-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 80px;
  flex-shrink: 0;
}

.rc-body {
  padding: 10px 12px;
  font-size: 0.8rem;
}

.rc-body strong { display: block; margin-bottom: 4px; }
.rc-body p { color: #64748b; font-size: 0.75rem; }

/* Card adapts to its container — not the viewport */
@container (min-width: 340px) {
  .reusable-card { flex-direction: row; }
  .rc-img { width: 100px; height: auto; min-height: 80px; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'media-plus-container',
      defaultTab: 'css',
      text: "Media queries and container queries are complementary, not competing. Media queries handle PAGE-level structure: which grid layout to use, whether to show the mobile nav. Container queries handle COMPONENT-level adaptation: how a card looks in a given context. Use both — one for macro layout, one for micro component behavior.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="card-grid">
    <div class="card"><div class="card-img"></div><div class="card-body"><h4>Post One</h4><p>Media query changes the grid. Container query changes the card layout within each cell.</p></div></div>
    <div class="card"><div class="card-img"></div><div class="card-body"><h4>Post Two</h4><p>Both queries working together.</p></div></div>
    <div class="card"><div class="card-img"></div><div class="card-body"><h4>Post Three</h4><p>Macro + micro responsiveness.</p></div></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

/* PAGE-level: media query controls the grid column count */
.card-grid {
  display: grid;
  grid-template-columns: 1fr; /* mobile: 1 column */
  gap: 16px;
}

@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr); /* tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr); /* desktop: 3 columns */
  }
}

/* COMPONENT-level: container query controls the card layout */
.card {
  container-type: inline-size;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 130px;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

/* When a grid cell is wide enough, switch to row layout */
@container (min-width: 360px) {
  .card { flex-direction: row; }
  .card-img { width: 130px; height: auto; min-height: 120px; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'browser-support',
      defaultTab: 'css',
      text: "Container queries are supported in all major browsers since 2023: Chrome 105+, Firefox 110+, Safari 16+. If you need to support older browsers, use `@supports (container-type: inline-size) { }` to progressively enhance. Without the support check, unsupported browsers simply ignore the `@container` rules — cards stay in their default layout, which is fine.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="wrapper">
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Progressive Enhancement</h4>
        <p>Old browsers get the default (stacked) layout. Modern browsers get the full container query experience.</p>
      </div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.page { max-width: 700px; margin: 0 auto; }

.wrapper {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}

/* Default: works everywhere */
.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 140px;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }

/* Progressive enhancement: only applies in supporting browsers */
@supports (container-type: inline-size) {
  .wrapper {
    container-type: inline-size;
  }

  @container (min-width: 400px) {
    .card { flex-direction: row; }
    .card-img { width: 150px; height: auto; min-height: 120px; }
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-container-queries'
    },
    {
      type: 'narration',
      id: 'style-queries',
      defaultTab: 'css',
      text: "Style queries (`@container style(--variant: compact)`) let components adapt based on CSS custom property values — not just size. Set `--variant: compact` on a container and all children can query it. This is how design system components adapt to context without JavaScript prop drilling: the parent sets a CSS variable, children respond.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="context-default">
  <div class="adaptive-card"><span class="badge">Default</span><h4>Standard Card</h4><p>Normal padding and font sizes.</p></div>
</div>
<div class="context-compact" style="--variant: compact">
  <div class="adaptive-card"><span class="badge">Compact</span><h4>Compact Card</h4><p>Smaller padding and font sizes via style query.</p></div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.context-default, .context-compact {
  container-type: style; /* enable style queries */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}

.context-compact {
  border-color: #6366f1;
}

/* Default card styles */
.adaptive-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
}

.badge {
  display: inline-block;
  background: #334155;
  color: #94a3b8;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-bottom: 12px;
}

h4 { font-size: 1.1rem; margin-bottom: 8px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }

/* Style query: adapt when --variant is 'compact' */
@container style(--variant: compact) {
  .adaptive-card {
    padding: 12px;
  }

  .badge {
    background: #4f46e5;
    color: #c7d2fe;
  }

  h4 { font-size: 0.95rem; }
  p { font-size: 0.8rem; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'real-world-use',
      defaultTab: 'css',
      text: "The most common container query use cases: card components that stack or go horizontal based on available space; navigation that collapses when its container is narrow; data tables that simplify when space is tight; sidebar widgets that change density based on their column width. Any component you want to drop anywhere and have 'just work' is a container query candidate.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="dashboard">
  <div class="section full">
    <h3>Stat Cards — Full Width</h3>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">2,847</div><div class="stat-label">Users</div></div>
      <div class="stat-card"><div class="stat-num">98.2%</div><div class="stat-label">Uptime</div></div>
      <div class="stat-card"><div class="stat-num">\$124k</div><div class="stat-label">Revenue</div></div>
    </div>
  </div>
  <div class="section narrow">
    <h3>Sidebar</h3>
    <div class="stat-card"><div class="stat-num">2,847</div><div class="stat-label">Users</div></div>
    <div class="stat-card"><div class="stat-num">98.2%</div><div class="stat-label">Uptime</div></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 20px;
  align-items: start;
}

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  container-type: inline-size;
  container-name: section;
}

h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 16px; }

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

/* Wide section: stat cards in a row */
@container section (min-width: 400px) {
  .stat-grid { flex-direction: row; }

  .stat-card {
    flex: 1;
    align-items: center;
    text-align: center;
    padding: 20px;
  }

  .stat-num { font-size: 1.75rem; }
  .stat-label { font-size: 0.85rem; }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-cq-advanced'
    },
    {
      type: 'challenge',
      id: 'ch-card-cq',
      text: "Make the card component display image above text when its container is narrow, and image beside text (flex-direction: row) when its container is wider than 400px. Use container queries — not media queries.",
      hint: "Add `container-type: inline-size` to the `.card-wrapper`. Then write `@container (min-width: 400px) { .card { flex-direction: row; } }`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="layout">
  <div class="card-wrapper wide">
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Wide Context</h4>
        <p>Should show image beside text in a row when container is wide.</p>
      </div>
    </div>
  </div>
  <div class="card-wrapper narrow">
    <div class="card">
      <div class="card-img"></div>
      <div class="card-body">
        <h4>Narrow Context</h4>
        <p>Should stack image above text when container is narrow.</p>
      </div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.layout { display: flex; flex-direction: column; gap: 20px; }

.card-wrapper {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
  /* Add container-type: inline-size here */
}

.wide { max-width: 600px; }
.narrow { max-width: 280px; }

/* Default: stacked */
.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-img {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  height: 120px;
  flex-shrink: 0;
}

.card-body { padding: 16px; }
h4 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

/* Add @container (min-width: 400px) to switch to row layout */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasContainerType = /container-type\s*:\s*inline-size/.test(css);
        const hasContainerQuery = /@container/.test(css);
        return hasContainerType && hasContainerQuery;
      }
    },
    {
      type: 'challenge',
      id: 'ch-responsive-widget',
      text: "A stat widget shows a large number stacked above a label by default. When its container is wider than 300px, the number and label should appear side by side. Implement this with container queries so the widget works in any context.",
      hint: "The widget's parent needs `container-type: inline-size`. Then `@container (min-width: 300px)` can switch the widget's `flex-direction` from column to row.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="contexts">
  <div class="ctx-narrow">
    <div class="widget">
      <div class="widget-number">2,847</div>
      <div class="widget-label">Active Users</div>
    </div>
  </div>
  <div class="ctx-wide">
    <div class="widget">
      <div class="widget-number">2,847</div>
      <div class="widget-label">Active Users</div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contexts { display: flex; flex-direction: column; gap: 16px; }

.ctx-narrow {
  width: 180px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  /* Add container-type here */
}

.ctx-wide {
  width: 400px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  /* Add container-type here */
}

/* Default: stacked */
.widget {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.widget-number {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.widget-label {
  font-size: 0.85rem;
  color: #64748b;
}

/* Add @container (min-width: 300px) for side-by-side layout */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasContainerType = /container-type\s*:\s*inline-size/.test(css);
        const hasContainerQuery = /@container\s*\(.*min-width/.test(css);
        return hasContainerType && hasContainerQuery;
      }
    }
  ]
};
