export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-10-grid-areas',
  title: '10. Grid Areas',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-grid-areas', label: 'Grid Areas' },
    { id: 'cp-dashboard', label: 'Dashboard Layout' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You need a dashboard: header spanning full width, sidebar on the left, main content on the right, footer spanning full width. Without grid areas this requires nested flex containers, absolute positioning, or percentage hacks. Grid areas make it 12 lines of CSS.",
      files: {
        html: `<div class="dashboard">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* Without grid areas — requires tricks to get the right layout */
.dashboard {
  display: flex;
  flex-wrap: wrap;
  min-height: 100vh;
}

.header { width: 100%; background: #1e293b; border-bottom: 1px solid #334155; padding: 20px 24px; font-weight: 700; color: #3b82f6; }
.sidebar { width: 220px; background: #1e293b; border-right: 1px solid #334155; padding: 24px; }
.main { flex: 1; padding: 32px; }
.footer { width: 100%; background: #1e293b; border-top: 1px solid #334155; padding: 16px 24px; color: #475569; font-size: 0.82rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-column-span',
      defaultTab: 'css',
      text: "`grid-column: 1 / 3` places an item from column line 1 to column line 3 — spanning 2 columns. `grid-column: 1 / -1` means 'start at line 1 and end at the last line' — spanning the full width regardless of how many columns there are.",
      files: {
        html: `<div class="grid">
  <div class="header">Header (1 / -1 = full width)</div>
  <div class="left">Left</div>
  <div class="right">Right</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.header {
  grid-column: 1 / -1; /* start at line 1, end at last line — spans all columns */
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 20px;
  color: #93c5fd;
  font-weight: 600;
  text-align: center;
}

.left, .right {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
  text-align: center;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-row-span',
      defaultTab: 'css',
      text: "`grid-row: 1 / 3` makes an item span 2 rows vertically. `span 2` is convenient shorthand: `grid-row: span 2` means 'take 2 row tracks starting wherever the auto-placement algorithm puts you'.",
      files: {
        html: `<div class="grid">
  <div class="tall">Tall item<br>(row: span 2)</div>
  <div class="short">Short 1</div>
  <div class="short">Short 2</div>
  <div class="short">Short 3</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px;
  gap: 12px;
}

.tall {
  background: #1d4ed8;
  border-radius: 8px;
  padding: 20px;
  color: white;
  font-weight: 600;
  grid-row: span 2; /* spans 2 row tracks */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.short {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-template-areas',
      defaultTab: 'css',
      text: "This is the power move. Draw your layout as ASCII art in the CSS. Each string is a row. Names in strings map to elements. Repeat a name across multiple cells to span columns. One glance at the CSS and you can see the entire layout.",
      files: {
        html: `<div class="dashboard">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.dashboard {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 60px 1fr 48px;
  min-height: 100vh;

  /* The magic: draw your layout as ASCII art */
  grid-template-areas:
    'header  header'
    'sidebar main  '
    'footer  footer';
}

/* Labels shown — areas not assigned yet */
.header, .sidebar, .main, .footer {
  padding: 20px;
  font-weight: 600;
  border: 1px solid #334155;
  display: flex;
  align-items: center;
}

.header  { background: #1e293b; color: #3b82f6; }
.sidebar { background: #1e293b; color: #64748b; font-size: 0.85rem; }
.main    { background: #0f172a; color: #94a3b8; }
.footer  { background: #1e293b; color: #475569; font-size: 0.82rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-area',
      defaultTab: 'css',
      text: "`grid-area: header` on an element assigns it to the 'header' area. `grid-area: sidebar` for the sidebar. The browser handles placement automatically — no need to specify column or row numbers.",
      files: {
        html: `<div class="dashboard">
  <header class="header">◆ Brand — Dashboard Header</header>
  <aside class="sidebar">
    <nav>
      <a href="#">Overview</a>
      <a href="#">Projects</a>
      <a href="#">Team</a>
    </nav>
  </aside>
  <main class="main">
    <h2>Main Content</h2>
    <p>This is placed by grid-area: main</p>
  </main>
  <footer class="footer">© 2026 Brand — grid-area: footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.dashboard {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 60px 1fr 48px;
  min-height: 100vh;
  grid-template-areas:
    'header  header'
    'sidebar main  '
    'footer  footer';
}

/* Each element claims its named area */
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Styling */
.header  { background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; font-weight: 700; color: #3b82f6; }
.sidebar { background: #1e293b; border-right: 1px solid #334155; padding: 20px 12px; }
.sidebar nav { display: flex; flex-direction: column; gap: 2px; }
.sidebar a { color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; }
.sidebar a:hover { background: #334155; color: #f1f5f9; }
.main    { background: #0f172a; padding: 32px; }
.main h2 { margin-top: 0; color: #3b82f6; }
.main p  { color: #94a3b8; }
.footer  { background: #1e293b; border-top: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; color: #475569; font-size: 0.8rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'dots-for-empty',
      defaultTab: 'css',
      text: "Use `.` for an empty cell in `grid-template-areas`. `'sidebar . main'` means sidebar on the left, an empty gap in the middle, main on the right. The dot is a placeholder that reserves space without assigning it to any element.",
      files: {
        html: `<div class="layout">
  <div class="header">Header</div>
  <div class="sidebar">Sidebar</div>
  <div class="main">Main (gap between sidebar and main)</div>
  <div class="footer">Footer</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.layout {
  display: grid;
  grid-template-columns: 160px 40px 1fr; /* three columns: sidebar, gap, main */
  grid-template-rows: 48px 1fr 40px;
  min-height: 300px;
  gap: 8px;

  grid-template-areas:
    'header  header header'
    'sidebar .      main  '  /* . = empty cell */
    'footer  footer footer';
}

.header  { grid-area: header;  background: #1e3a5f; border: 1px solid #3b82f6; border-radius: 6px; padding: 0 16px; display: flex; align-items: center; color: #93c5fd; font-weight: 600; }
.sidebar { grid-area: sidebar; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 12px; color: #64748b; font-size: 0.8rem; display: flex; align-items: center; }
.main    { grid-area: main;    background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 16px; color: #94a3b8; font-size: 0.85rem; display: flex; align-items: center; }
.footer  { grid-area: footer;  background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 0 16px; display: flex; align-items: center; color: #475569; font-size: 0.78rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'named-lines',
      defaultTab: 'css',
      text: "You can name grid lines in `grid-template-columns`: `[sidebar-start] 220px [sidebar-end content-start] 1fr [content-end]`. Then reference them: `grid-column: sidebar-start / content-end`. This is for complex layouts that need precise, semantic positioning.",
      files: {
        html: `<div class="layout">
  <div class="header">Header</div>
  <div class="sidebar">Sidebar — positioned by name</div>
  <div class="content">Content — positioned by name</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.layout {
  display: grid;
  /* Named lines in brackets */
  grid-template-columns:
    [sidebar-start] 220px
    [sidebar-end content-start] 1fr
    [content-end];
  grid-template-rows: 56px 1fr;
  min-height: 280px;
  gap: 8px;
}

.header {
  grid-column: sidebar-start / content-end; /* spans full width by name */
  background: #1e3a5f;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  color: #93c5fd;
  font-weight: 600;
}

.sidebar {
  grid-column: sidebar-start / sidebar-end; /* sidebar track by name */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 16px;
  color: #64748b;
  font-size: 0.82rem;
}

.content {
  grid-column: content-start / content-end; /* content track by name */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 16px;
  color: #94a3b8;
  font-size: 0.85rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'responsive-areas',
      defaultTab: 'css',
      text: "Change `grid-template-areas` at different breakpoints. Desktop: sidebar + main side by side. Mobile: stack everything in one column with the same HTML. The `@media` query just redraws the ASCII art.",
      files: {
        html: `<div class="dashboard">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* Desktop layout */
.dashboard {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 60px 1fr 48px;
  min-height: 100vh;
  grid-template-areas:
    'header  header'
    'sidebar main  '
    'footer  footer';
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

.header  { background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; font-weight: 700; color: #3b82f6; }
.sidebar { background: #1e293b; border-right: 1px solid #334155; padding: 24px 16px; color: #64748b; font-size: 0.85rem; }
.main    { background: #0f172a; padding: 24px; color: #94a3b8; }
.footer  { background: #1e293b; border-top: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; color: #475569; font-size: 0.8rem; }

/* Mobile layout — same HTML, different ASCII art */
@media (max-width: 640px) {
  .dashboard {
    grid-template-columns: 1fr;          /* single column */
    grid-template-rows: 60px auto 1fr 48px;
    grid-template-areas:
      'header '
      'sidebar'
      'main   '
      'footer ';
  }

  .sidebar { border-right: none; border-bottom: 1px solid #334155; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'subgrid',
      defaultTab: 'css',
      text: "`subgrid` lets a grid item use its parent's track definitions for its own children. A grid item can say 'span 2 columns and align my children to my parent's column lines'. This solves the cross-card alignment problem when cards are in a grid but their internals need to match.",
      files: {
        html: `<div class="product-grid">
  <div class="product">
    <img class="thumb" alt="Product">
    <h3>Widget Alpha</h3>
    <p class="desc">A short description.</p>
    <p class="price">\$49</p>
    <button>Add to Cart</button>
  </div>
  <div class="product">
    <img class="thumb" alt="Product">
    <h3>Widget Beta Pro</h3>
    <p class="desc">A much longer description that spans several lines of text about features.</p>
    <p class="price">\$129</p>
    <button>Add to Cart</button>
  </div>
  <div class="product">
    <img class="thumb" alt="Product">
    <h3>Widget Gamma</h3>
    <p class="desc">Medium length.</p>
    <p class="price">\$89</p>
    <button>Add to Cart</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

/* Outer grid defines 5 rows for each card's internal sections */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto 1fr auto auto; /* image, title, desc, price, button */
  gap: 16px 20px;
  align-items: start;
}

/* Each product spans all 5 row tracks using subgrid */
.product {
  display: grid;
  grid-row: span 5;
  grid-template-rows: subgrid; /* uses parent's row tracks */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
  gap: 0;
}

.thumb {
  background: #334155;
  height: 140px;
  display: block;
  width: 100%;
}

.product h3   { padding: 16px 16px 4px; margin: 0; color: #f1f5f9; font-size: 0.95rem; }
.product .desc { padding: 0 16px; margin: 0; color: #94a3b8; font-size: 0.8rem; line-height: 1.5; }
.product .price { padding: 8px 16px; margin: 0; font-size: 1.2rem; font-weight: 700; color: #3b82f6; }
.product button { margin: 0 16px 16px; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-grid-areas'
    },
    {
      type: 'narration',
      id: 'holy-grail',
      defaultTab: 'css',
      text: "The 'holy grail' layout — header, left sidebar, main content, right sidebar, footer — stumped web developers for a decade. With CSS Grid it is 12 lines. Header and footer span full width. Left and right sidebars are fixed. Main content fills the middle.",
      files: {
        html: `<div class="holy-grail">
  <header class="header">Header</header>
  <aside class="left">Left Sidebar</aside>
  <main class="main">Main Content — the holy grail</main>
  <aside class="right">Right Sidebar</aside>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.holy-grail {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  grid-template-rows: 56px 1fr 44px;
  min-height: 100vh;
  gap: 0;

  grid-template-areas:
    'header header header'
    'left   main   right '
    'footer footer footer';
}

.header { grid-area: header; }
.left   { grid-area: left; }
.main   { grid-area: main; }
.right  { grid-area: right; }
.footer { grid-area: footer; }

/* Styling */
.header { background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; font-weight: 700; color: #3b82f6; font-size: 1rem; }
.left   { background: #1a2535; border-right: 1px solid #334155; padding: 20px 14px; color: #64748b; font-size: 0.82rem; }
.right  { background: #1a2535; border-left: 1px solid #334155; padding: 20px 14px; color: #64748b; font-size: 0.82rem; }
.main   { background: #0f172a; padding: 32px; color: #94a3b8; }
.footer { background: #1e293b; border-top: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; color: #475569; font-size: 0.78rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-areas-vs-columns',
      defaultTab: 'css',
      text: "Use `grid-template-areas` when the layout has named semantic regions (header, sidebar, main). Use column/row numbers for programmatic or data-driven layouts (a calendar, a Kanban board, an image mosaic). Areas are for visual design; numbers are for algorithmic placement.",
      files: {
        html: `<div class="calendar">
  <div class="day-header">Mon</div>
  <div class="day-header">Tue</div>
  <div class="day-header">Wed</div>
  <div class="day-header">Thu</div>
  <div class="day-header">Fri</div>
  <div class="day">1</div>
  <div class="day">2</div>
  <div class="event">Meeting (spans Tue–Thu)</div>
  <div class="day">5</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.calendar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.day-header {
  background: #334155;
  padding: 8px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-radius: 4px;
}

.day {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 10px;
  color: #94a3b8;
  font-size: 0.85rem;
  min-height: 60px;
}

/* Column numbers for data-driven placement — areas would be impractical here */
.event {
  grid-column: 2 / 5; /* spans columns 2, 3, 4 (Tue through Thu) */
  background: #1d4ed8;
  border-radius: 4px;
  padding: 10px;
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-dashboard'
    },
    {
      type: 'challenge',
      id: 'ch-dashboard',
      text: "Given HTML with header, sidebar, main, and footer elements, implement a CSS Grid layout using `grid-template-areas`. Header and footer span full width. Sidebar is 200px. Main fills remaining space.",
      hint: "On `.page`: `display: grid; grid-template-columns: 200px 1fr; grid-template-rows: 60px 1fr 48px; grid-template-areas: 'header header' 'sidebar main' 'footer footer';`. On each child: `grid-area: [name];`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.page {
  min-height: 100vh;
  /* Add: display: grid, columns, rows, and grid-template-areas */
}

/* Assign each element to its area with grid-area */
.header  { background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; font-weight: 700; color: #3b82f6; }
.sidebar { background: #1e293b; border-right: 1px solid #334155; padding: 20px; color: #64748b; font-size: 0.85rem; }
.main    { background: #0f172a; padding: 32px; color: #94a3b8; }
.footer  { background: #1e293b; border-top: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; color: #475569; font-size: 0.8rem; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /grid-template-areas/.test(css) && /grid-area/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-responsive-areas',
      text: "Extend the dashboard to stack all areas in a single column on screens narrower than 768px. Add a `@media` query that changes the `grid-template-areas` to a single-column vertical stack.",
      hint: "Add `@media (max-width: 768px) { .page { grid-template-columns: 1fr; grid-template-areas: 'header' 'sidebar' 'main' 'footer'; } }`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* Desktop layout — already done */
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr 48px;
  min-height: 100vh;
  grid-template-areas:
    'header  header'
    'sidebar main  '
    'footer  footer';
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

.header  { background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; font-weight: 700; color: #3b82f6; }
.sidebar { background: #1e293b; border-right: 1px solid #334155; padding: 20px; color: #64748b; font-size: 0.85rem; }
.main    { background: #0f172a; padding: 24px; color: #94a3b8; }
.footer  { background: #1e293b; border-top: 1px solid #334155; padding: 0 24px; display: flex; align-items: center; color: #475569; font-size: 0.8rem; }

/* Add a @media (max-width: 768px) query here that stacks everything in one column */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /@media/.test(css) && (css.match(/grid-template-areas/g) || []).length >= 2;
      }
    }
  ]
};
