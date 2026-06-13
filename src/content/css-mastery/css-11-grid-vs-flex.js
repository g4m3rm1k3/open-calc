export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-11-grid-vs-flex',
  title: '11. Grid vs Flexbox',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-grid-vs-flex', label: 'Grid vs Flex' },
    { id: 'cp-composite', label: 'Composite Layouts' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Every tutorial says 'use flexbox for 1D, grid for 2D.' But what does that actually mean in practice? And what about the cases where both work? You've been forcing one system to do what the other is designed for. Let's settle this.",
      files: {
        html: `<div class="page-attempt">
  <header class="header">
    <div class="logo">Brand</div>
    <nav class="nav">
      <a href="#">Home</a><a href="#">About</a><a href="#">Work</a>
    </nav>
  </header>
  <div class="body-area">
    <aside class="sidebar">Sidebar</aside>
    <div class="content-area">
      <div class="cards">
        <div class="card">Card 1</div>
        <div class="card">Card 2</div>
        <div class="card">Card 3</div>
      </div>
    </div>
  </div>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* Only flexbox — requires nesting and workarounds */
.page-attempt {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo { font-weight: 700; color: #3b82f6; }
.nav  { display: flex; gap: 4px; }
.nav a { color: #94a3b8; text-decoration: none; padding: 8px 12px; font-size: 0.88rem; }

.body-area {
  flex: 1;
  display: flex; /* nested flex for sidebar+content */
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 20px;
  color: #64748b;
  font-size: 0.85rem;
}

.content-area { flex: 1; padding: 24px; }

.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  flex: 1;
  min-width: 160px;
  color: #94a3b8;
}

.footer {
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 0 24px;
  height: 48px;
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.8rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: '1d-vs-2d',
      defaultTab: 'css',
      text: "Flexbox lays items out along ONE axis — either a row or a column. It can wrap to multiple rows, but each row is independent — items in row 2 don't align with items in row 1. Grid controls BOTH axes simultaneously — items in different rows CAN align because tracks span the full container.",
      files: {
        html: `<p class="label">Flexbox: row 2 doesn't align with row 1</p>
<div class="flex-demo">
  <div class="item wide">Wide item</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item">D — row 2</div>
  <div class="item">E</div>
</div>

<p class="label">Grid: all rows align to the same tracks</p>
<div class="grid-demo">
  <div class="item wide">Wide item</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item">D — row 2</div>
  <div class="item">E</div>
  <div class="item"></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.label { color: #475569; font-size: 0.75rem; font-family: monospace; margin: 16px 0 6px; text-transform: uppercase; }

.item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px 16px;
  color: #94a3b8;
  font-size: 0.82rem;
}

.wide { background: #1d4ed8; color: white; }

/* Flex: rows are independent — items in row 2 don't snap to row 1's columns */
.flex-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: #1a2535;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.flex-demo .wide { flex: 0 0 calc(50% - 4px); }
.flex-demo .item { flex: 0 0 calc(25% - 6px); }

/* Grid: all items align to the same column tracks */
.grid-demo {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #1a2535;
  padding: 12px;
  border-radius: 8px;
}

.grid-demo .wide { grid-column: span 2; background: #065f46; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'when-flex',
      defaultTab: 'css',
      text: "Use flexbox when the layout flows from the content: nav bars, button groups, card content, toolbars. The items determine their own sizes and the container accommodates them. When you're thinking 'arrange these items in a row', reach for flexbox.",
      files: {
        html: `<div class="demo">
  <p class="label">Flexbox use cases</p>

  <!-- Navigation bar -->
  <nav class="navbar">
    <div class="logo">Brand</div>
    <div class="links">
      <a href="#">Home</a><a href="#">About</a><a href="#">Work</a>
    </div>
    <button class="cta">Sign Up</button>
  </nav>

  <!-- Button group -->
  <div class="btn-group">
    <button>Bold</button>
    <button>Italic</button>
    <button>Underline</button>
    <button class="sep">|</button>
    <button>Link</button>
  </div>

  <!-- Tag list (unknown count) -->
  <div class="tags">
    <span class="tag">React</span>
    <span class="tag">TypeScript</span>
    <span class="tag">CSS</span>
    <span class="tag">Node.js</span>
    <span class="tag">Docker</span>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.label { color: #3b82f6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; }

.navbar {
  background: #1e293b;
  border-radius: 8px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 52px;
  margin-bottom: 12px;
}

.logo { font-weight: 700; color: #3b82f6; font-size: 0.95rem; }
.links { display: flex; gap: 4px; }
.links a { color: #94a3b8; text-decoration: none; padding: 6px 10px; font-size: 0.82rem; border-radius: 4px; }
.cta { background: #3b82f6; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }

.btn-group {
  background: #1e293b;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 12px;
}

.btn-group button {
  background: #334155;
  color: #f1f5f9;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.82rem;
}
.sep { background: transparent; color: #475569; cursor: default; }

.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { background: #1e3a5f; color: #93c5fd; border: 1px solid #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'when-grid',
      defaultTab: 'css',
      text: "Use grid when the LAYOUT determines item placement: dashboards, galleries, page structure. You define a rigid structure first, then place items into it. When you're thinking 'I need a 3-column, 4-row layout', reach for grid.",
      files: {
        html: `<div class="demo">
  <p class="label">Grid use cases</p>

  <!-- Photo gallery with strict grid -->
  <div class="gallery">
    <div class="photo p1">Feature</div>
    <div class="photo p2">1</div>
    <div class="photo p3">2</div>
    <div class="photo p4">3</div>
    <div class="photo p5">4</div>
  </div>

  <!-- Dashboard layout -->
  <div class="dash">
    <div class="d-header">Header</div>
    <div class="d-side">Side</div>
    <div class="d-main">Main</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.label { color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; }

.gallery {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 100px 100px;
  gap: 8px;
  margin-bottom: 16px;
}

.photo {
  background: #1e293b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 700;
}

.p1 { grid-row: span 2; background: #1d4ed8; color: white; } /* feature photo spans 2 rows */
.p2 { background: #065f46; color: white; }
.p3 { background: #7c2d12; color: white; }
.p4 { background: #4c1d95; color: white; }
.p5 { background: #1e3a5f; }

.dash {
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-rows: 40px 100px;
  gap: 6px;
  grid-template-areas:
    'header header'
    'side   main  ';
}

.d-header { grid-area: header; background: #1e293b; border-radius: 6px; display: flex; align-items: center; padding: 0 12px; color: #3b82f6; font-weight: 600; font-size: 0.82rem; }
.d-side   { grid-area: side;   background: #1e293b; border-radius: 6px; padding: 12px; color: #64748b; font-size: 0.78rem; }
.d-main   { grid-area: main;   background: #1e293b; border-radius: 6px; padding: 12px; color: #94a3b8; font-size: 0.78rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'they-work-together',
      defaultTab: 'css',
      text: "The myth: you must choose one. The reality: use both at different levels. The PAGE STRUCTURE is a grid (header, sidebar, main, footer). The NAVBAR inside the header is flex. The CARDS inside main are a grid. The CONTENT inside each card is flex. This is the professional pattern.",
      files: {
        html: `<div class="page">
  <header class="header">
    <div class="logo">◆ Brand</div>
    <nav class="nav">
      <a href="#">Features</a><a href="#">Pricing</a><a href="#">Docs</a>
    </nav>
    <button class="cta-btn">Get Started</button>
  </header>
  <aside class="sidebar">
    <a href="#">Dashboard</a>
    <a href="#">Projects</a>
    <a href="#">Settings</a>
  </aside>
  <main class="main">
    <div class="card-grid">
      <div class="card">
        <div class="card-header">
          <span class="icon">◆</span>
          <strong>Feature A</strong>
        </div>
        <p>Description text</p>
        <button>View</button>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="icon">★</span>
          <strong>Feature B</strong>
        </div>
        <p>More text here</p>
        <button>View</button>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="icon">●</span>
          <strong>Feature C</strong>
        </div>
        <p>Brief</p>
        <button>View</button>
      </div>
    </div>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* LEVEL 1: Grid for page structure */
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
  grid-template-areas:
    'header header'
    'sidebar main ';
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }

/* LEVEL 2: Flex for header internals */
.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;           /* flex for the header row */
  align-items: center;
  gap: 24px;
}

.logo { font-weight: 700; color: #3b82f6; font-size: 1rem; }
.nav  { display: flex; gap: 4px; flex: 1; }
.nav a { color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; }
.cta-btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }

/* LEVEL 2: Flex for sidebar internals */
.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 16px 8px;
  display: flex;           /* flex for sidebar nav */
  flex-direction: column;
  gap: 2px;
}

.sidebar a { color: #94a3b8; text-decoration: none; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; }
.sidebar a:hover { background: #334155; color: #f1f5f9; }

.main { background: #0f172a; padding: 24px; }

/* LEVEL 2: Grid for card gallery */
.card-grid {
  display: grid;           /* grid for equal card columns */
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* LEVEL 3: Flex for card internals */
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  display: flex;           /* flex for card content */
  flex-direction: column;
}

.card-header {
  display: flex;           /* flex for icon + title row */
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.icon { font-size: 1.2rem; color: #3b82f6; }
strong { font-size: 0.9rem; }
.card p { color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0 0 12px; flex: 1; }
.card button { background: #334155; color: #f1f5f9; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; margin-top: auto; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'composite-layout',
      defaultTab: 'css',
      text: "Start with the grid: define the page zones. Then add flexbox to each zone for its internal layout. Outer grid controls macro layout. Inner flex controls micro layout. This is what production applications look like.",
      files: {
        html: `<div class="app">
  <header class="app-header">
    <div class="logo">◆ App</div>
    <div class="header-actions">
      <span class="user">Jane D.</span>
      <button>Log out</button>
    </div>
  </header>
  <div class="app-body">
    <nav class="app-nav">
      <a href="#">Home</a>
      <a href="#">Projects</a>
      <a href="#">Reports</a>
    </nav>
    <section class="app-content">
      <h2>Dashboard</h2>
      <div class="metrics">
        <div class="metric"><strong>1,234</strong><span>Users</span></div>
        <div class="metric"><strong>98.7%</strong><span>Uptime</span></div>
        <div class="metric"><strong>42ms</strong><span>Response</span></div>
        <div class="metric"><strong>\$12k</strong><span>Revenue</span></div>
      </div>
    </section>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* GRID: full page structure */
.app {
  display: grid;
  grid-template-rows: 56px 1fr;
  min-height: 100vh;
}

/* FLEX: header is a row with space-between */
.app-header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo { font-weight: 700; color: #3b82f6; }
.header-actions { display: flex; gap: 12px; align-items: center; }
.user { color: #94a3b8; font-size: 0.85rem; }
.header-actions button { background: #334155; color: #f1f5f9; border: 1px solid #475569; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }

/* FLEX: body is sidebar + content row */
.app-body {
  display: flex;
}

/* FLEX: nav items stack vertically */
.app-nav {
  width: 180px;
  flex-shrink: 0;
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-nav a { color: #94a3b8; text-decoration: none; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; }
.app-nav a:hover { background: #334155; color: #f1f5f9; }

.app-content { flex: 1; padding: 28px; }
.app-content h2 { margin-top: 0; color: #3b82f6; }

/* FLEX: metrics in a responsive row */
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.metric {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.metric strong { font-size: 1.8rem; color: #3b82f6; }
.metric span   { font-size: 0.75rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-for-unknown-count',
      defaultTab: 'css',
      text: "When you don't know how many items there are — a tag list, a dynamic button group, search results — flexbox is the right choice. It adapts to any number of items. Grid requires knowing the column count in advance (or using `auto-fill`).",
      files: {
        html: `<div class="demo">
  <p class="label">Flex: dynamic tags (unknown count)</p>
  <div class="tag-cloud">
    <span class="tag">React</span>
    <span class="tag">CSS</span>
    <span class="tag">TypeScript</span>
    <span class="tag">Node</span>
    <span class="tag">Docker</span>
    <span class="tag">AWS</span>
    <span class="tag">GraphQL</span>
    <span class="tag">Testing</span>
  </div>

  <p class="label" style="margin-top:16px">Grid: strict 3-col layout (known count)</p>
  <div class="strict-grid">
    <div class="g-item">Item A</div>
    <div class="g-item">Item B</div>
    <div class="g-item">Item C</div>
    <div class="g-item">Item D</div>
    <div class="g-item">Item E</div>
    <div class="g-item">Item F</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.label { color: #475569; font-size: 0.75rem; font-family: monospace; margin: 0 0 8px; text-transform: uppercase; }

/* Flex: items determine their own size, container adapts */
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }

.tag {
  background: #1e3a5f;
  color: #93c5fd;
  border: 1px solid #3b82f6;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
}

/* Grid: structure determines placement */
.strict-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.g-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px;
  color: #94a3b8;
  font-size: 0.82rem;
  text-align: center;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-for-strict-alignment',
      defaultTab: 'css',
      text: "If you need items in different rows to align vertically — a data table, a form with labels and inputs — grid is the right choice. Flexbox can't do this: each row is independent. Grid's explicit tracks guarantee vertical alignment across rows.",
      files: {
        html: `<form class="form">
  <div class="field">
    <label>Full Name</label>
    <input type="text" placeholder="Jane Smith">
  </div>
  <div class="field">
    <label>Email</label>
    <input type="email" placeholder="jane@example.com">
  </div>
  <div class="field">
    <label>Company</label>
    <input type="text" placeholder="Acme Corp">
  </div>
  <div class="field">
    <label>Role</label>
    <input type="text" placeholder="Senior Developer">
  </div>
</form>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

/* Grid: labels and inputs align perfectly across all rows */
.form {
  display: grid;
  grid-template-columns: 140px 1fr; /* label column + input column */
  gap: 16px 12px;
  max-width: 480px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
}

.field {
  display: contents; /* makes label and input direct grid children */
}

label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 14px;
  color: #f1f5f9;
  font-size: 0.85rem;
  font-family: sans-serif;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'performance',
      defaultTab: 'css',
      text: "Both are extremely performant in modern browsers. The old advice about avoiding grid for 'simple' layouts is outdated. Choose based on what model fits the layout, not performance concerns. Both have near-identical performance in 2024+ browsers.",
      files: {
        html: `<div class="demo">
  <div class="flex-example">
    <p class="heading">Flexbox</p>
    <p>Same performance as Grid. Choose based on what the layout needs, not speed.</p>
  </div>
  <div class="grid-example">
    <p class="heading">Grid</p>
    <p>Same performance as Flexbox. Use it whenever two-dimensional control is needed.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.demo { display: flex; gap: 20px; }

.flex-example, .grid-example {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  flex: 1;
}

.heading { margin: 0 0 8px; font-weight: 700; color: #3b82f6; }
p { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.6; }

.grid-example .heading { color: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-grid-vs-flex'
    },
    {
      type: 'narration',
      id: 'practical-guide',
      defaultTab: 'css',
      text: "The practical decision guide: Is the layout driven by content or by a defined structure? Content-driven (items set the size) → Flexbox. Structure-driven (layout sets the size) → Grid. Does alignment need to work across multiple rows? Yes → Grid. No → Flexbox. This covers 95% of decisions.",
      files: {
        html: `<div class="guide">
  <div class="rule flex-rule">
    <h3>Use Flexbox when...</h3>
    <ul>
      <li>Content determines item sizes</li>
      <li>You have a row OR column (not both)</li>
      <li>Items can wrap naturally</li>
      <li>Unknown number of items (tags, buttons)</li>
      <li>Card internals (icon + text + button)</li>
    </ul>
  </div>
  <div class="rule grid-rule">
    <h3>Use Grid when...</h3>
    <ul>
      <li>Layout determines item placement</li>
      <li>You need row AND column alignment</li>
      <li>You have named layout regions</li>
      <li>Items must align across rows</li>
      <li>Page structure (header, sidebar, main)</li>
    </ul>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.guide { display: flex; gap: 20px; flex-wrap: wrap; }

.rule {
  flex: 1;
  min-width: 240px;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #334155;
}

.flex-rule { background: #1e293b; border-color: #3b82f6; }
.grid-rule { background: #1e293b; border-color: #10b981; }

h3 { margin: 0 0 12px; font-size: 0.95rem; }
.flex-rule h3 { color: #3b82f6; }
.grid-rule h3 { color: #10b981; }

ul { margin: 0; padding-left: 18px; }
li { color: #94a3b8; font-size: 0.82rem; line-height: 1.8; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'both-same-element',
      defaultTab: 'css',
      text: "An element can only have one `display` type at a time — it cannot be both `flex` and `grid`. But you can achieve complex effects by nesting: a grid item that is also a flex container, or a flex item that is also a grid container. There's no performance penalty for nesting display types.",
      files: {
        html: `<div class="outer-grid">
  <div class="cell a">Grid child — also a Flex container
    <div class="flex-child">Flex A</div>
    <div class="flex-child">Flex B</div>
    <div class="flex-child">Flex C</div>
  </div>
  <div class="cell b">Grid child — also a Flex container
    <div class="flex-child">Item 1</div>
    <div class="flex-child grow">Item 2 (flex-grow: 1)</div>
    <div class="flex-child">Item 3</div>
  </div>
  <div class="cell c">Grid child — simple</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

/* GRID: defines the outer 3-column structure */
.outer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.cell {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  color: #64748b;
  font-size: 0.78rem;
  font-style: italic;
  margin-bottom: 8px;
}

/* FLEX: grid cells .a and .b are ALSO flex containers */
.a, .b {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flex-child {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px 12px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-style: normal;
}

.grow { flex-grow: 1; background: #1e3a5f; color: #93c5fd; border-color: #3b82f6; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-composite'
    },
    {
      type: 'challenge',
      id: 'ch-page-layout',
      text: "Build a full page layout: `.page` with a 64px header and 48px footer using CSS Grid. Inside the header, use Flexbox for the navbar (logo left, links right). The validator checks that outer element uses grid AND an inner element uses flex.",
      hint: "On `.page`: `display: grid; grid-template-rows: 64px 1fr 48px;`. On `.header`: `display: flex; justify-content: space-between; align-items: center;`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page">
  <header class="header">
    <div class="logo">◆ Brand</div>
    <nav class="nav">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>
  <main class="main">
    <h2>Main Content</h2>
    <p>Grid handles the page structure. Flex handles the navbar.</p>
  </main>
  <footer class="footer">© 2026 Brand</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.page {
  min-height: 100vh;
  /* Add: display: grid with rows 64px 1fr 48px */
}

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  /* Add: display: flex, justify-content: space-between, align-items: center */
}

.logo { font-weight: 700; color: #3b82f6; }
.nav  { /* Add flex + gap */ }
.nav a { color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 4px; font-size: 0.88rem; }

.main {
  background: #0f172a;
  padding: 32px;
}

.main h2 { margin-top: 0; color: #3b82f6; }
.main p  { color: #94a3b8; }

.footer {
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.8rem;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const gridCount = (css.match(/display\s*:\s*grid/g) || []).length;
        const flexCount = (css.match(/display\s*:\s*flex/g) || []).length;
        return gridCount >= 1 && flexCount >= 1;
      }
    },
    {
      type: 'challenge',
      id: 'ch-correct-tool',
      text: "Build an image gallery: use CSS Grid for the 3-column gallery layout. Each gallery item should have a caption bar below the image — make the caption bar a flex container to align its icon and text side by side.",
      hint: "On `.gallery`: `display: grid; grid-template-columns: repeat(3, 1fr);`. On `.caption`: `display: flex; align-items: center; gap: 8px;`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="gallery">
  <div class="item">
    <div class="photo">Photo 1</div>
    <div class="caption">
      <span class="caption-icon">★</span>
      <span class="caption-text">Mountain View</span>
    </div>
  </div>
  <div class="item">
    <div class="photo">Photo 2</div>
    <div class="caption">
      <span class="caption-icon">◆</span>
      <span class="caption-text">City Lights</span>
    </div>
  </div>
  <div class="item">
    <div class="photo">Photo 3</div>
    <div class="caption">
      <span class="caption-icon">●</span>
      <span class="caption-text">Ocean Sunset</span>
    </div>
  </div>
  <div class="item">
    <div class="photo">Photo 4</div>
    <div class="caption">
      <span class="caption-icon">★</span>
      <span class="caption-text">Forest Path</span>
    </div>
  </div>
  <div class="item">
    <div class="photo">Photo 5</div>
    <div class="caption">
      <span class="caption-icon">◆</span>
      <span class="caption-text">Desert Dunes</span>
    </div>
  </div>
  <div class="item">
    <div class="photo">Photo 6</div>
    <div class="caption">
      <span class="caption-icon">●</span>
      <span class="caption-text">Waterfall</span>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.gallery {
  /* Add: display: grid with repeat(3, 1fr) columns and gap */
}

.item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.photo {
  background: #334155;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.85rem;
}

.caption {
  padding: 10px 14px;
  /* Add: display: flex, align-items: center, gap: 8px */
}

.caption-icon { color: #3b82f6; font-size: 0.9rem; }
.caption-text { color: #94a3b8; font-size: 0.82rem; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasGrid = /display\s*:\s*grid/.test(css);
        const hasFlex = /display\s*:\s*flex/.test(css);
        return hasGrid && hasFlex;
      }
    }
  ]
};
