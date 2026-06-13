export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-07-flex-alignment',
  title: '07. Flex Alignment',
  chapter: 'css-ch2',
  language: 'web',
  checkpoints: [
    { id: 'cp-alignment', label: 'Alignment' },
    { id: 'cp-nested-flex', label: 'Nested Flex' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You have a row of pricing cards. They are different heights because descriptions have different lengths. Nothing lines up. The 'Buy Now' buttons are at completely different vertical positions. The page looks broken. Flexbox alignment fixes all of this.",
      files: {
        html: `<div class="pricing">
  <div class="card">
    <h3>Starter</h3>
    <p class="price">\$9/mo</p>
    <p class="desc">Basic features for individuals.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Pro</h3>
    <p class="price">\$29/mo</p>
    <p class="desc">Advanced features for teams. Includes priority support, custom domains, unlimited projects, and detailed analytics.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Enterprise</h3>
    <p class="price">\$99/mo</p>
    <p class="desc">Everything in Pro.</p>
    <button>Buy Now</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.pricing {
  display: flex;
  gap: 20px;
  /* no align-items — default is stretch, but buttons are still at different heights */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 200px;
  /* no internal layout — buttons at different heights */
}

h3     { margin: 0 0 8px; color: #3b82f6; }
.price { margin: 0 0 12px; font-size: 1.4rem; font-weight: 700; color: #f1f5f9; }
.desc  { margin: 0 0 16px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'axes',
      defaultTab: 'css',
      text: "Flexbox has two axes. The main axis is the direction of flow — by default horizontal (row). The cross axis is perpendicular — by default vertical. Alignment properties control DIFFERENT axes. Mixing them up is the #1 flexbox mistake.",
      files: {
        html: `<div class="diagram">
  <div class="axis main-axis">→ main axis (justify-content)</div>
  <div class="container">
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
    <div class="cross-label">↕ cross axis (align-items)</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.diagram { width: 380px; }

.main-axis {
  color: #3b82f6;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 4px;
  font-family: monospace;
}

.container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  height: 120px;
  gap: 12px;
  position: relative;
}

.item {
  background: #1d4ed8;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 700;
}

.cross-label {
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: monospace;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'justify-content',
      defaultTab: 'css',
      text: "`justify-content` controls spacing ALONG the main axis. `flex-start` (default): items bunch at the start. `flex-end`: bunch at the end. `center`: centered. `space-between`: first left, last right, equal gaps between. `space-around`: equal space around each item.",
      files: {
        html: `<div class="demo">
  <div class="row start"><div class="i">A</div><div class="i">B</div><div class="i">C</div></div>
  <div class="row end"><div class="i">A</div><div class="i">B</div><div class="i">C</div></div>
  <div class="row center"><div class="i">A</div><div class="i">B</div><div class="i">C</div></div>
  <div class="row between"><div class="i">A</div><div class="i">B</div><div class="i">C</div></div>
  <div class="row around"><div class="i">A</div><div class="i">B</div><div class="i">C</div></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.row {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
}

.i {
  background: #1d4ed8;
  color: white;
  padding: 10px 18px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.9rem;
}

.start   { justify-content: flex-start; }   /* default */
.end     { justify-content: flex-end; }
.center  { justify-content: center; }
.between { justify-content: space-between; }
.around  { justify-content: space-around; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'align-items',
      defaultTab: 'css',
      text: "`align-items` controls how items sit on the CROSS axis. `stretch` (default): items stretch to fill the container height. `flex-start`: sit at the top. `flex-end`: sit at the bottom. `center`: center vertically. `baseline`: items align so their text baselines match.",
      files: {
        html: `<div class="demo">
  <p class="label">stretch (default)</p>
  <div class="row stretch"><div class="i tall">A</div><div class="i">B</div><div class="i short">C</div></div>
  <p class="label">flex-start</p>
  <div class="row start"><div class="i tall">A</div><div class="i">B</div><div class="i short">C</div></div>
  <p class="label">center</p>
  <div class="row center"><div class="i tall">A</div><div class="i">B</div><div class="i short">C</div></div>
  <p class="label">flex-end</p>
  <div class="row end"><div class="i tall">A</div><div class="i">B</div><div class="i short">C</div></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }

.label { color: #475569; font-size: 0.72rem; font-family: monospace; margin: 12px 0 4px; text-transform: uppercase; }

.row {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px;
  height: 80px;
  display: flex;
  gap: 8px;
}

.i {
  background: #1d4ed8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  min-width: 36px;
  text-align: center;
}

.tall  { padding: 16px; }
.short { padding: 4px 16px; }

.stretch { align-items: stretch; }
.start   { align-items: flex-start; }
.center  { align-items: center; }
.end     { align-items: flex-end; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'align-items-stretch',
      defaultTab: 'css',
      text: "With `align-items: stretch` (the default), all cards stretch to the height of the tallest card — equal heights automatically. But the buttons inside are still at different vertical positions because there's no internal layout controlling where they sit within each card.",
      files: {
        html: `<div class="pricing">
  <div class="card">
    <h3>Starter</h3>
    <p class="desc">Basic features.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Pro</h3>
    <p class="desc">Advanced features for teams with priority support, custom domains, and unlimited projects.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Enterprise</h3>
    <p class="desc">Everything in Pro.</p>
    <button>Buy Now</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.pricing {
  display: flex;
  gap: 20px;
  align-items: stretch; /* cards same height — but buttons not aligned */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 200px;
  /* no internal flex — buttons float wherever content ends */
}

h3   { margin: 0 0 8px; color: #3b82f6; }
.desc { margin: 0 0 16px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fix-with-column',
      defaultTab: 'css',
      text: "The fix: make each CARD a flex column. `flex-direction: column` on each card. Then give the button `margin-top: auto`. `margin: auto` in flexbox consumes all available space — it pushes the button to the bottom of every card. Now all buttons align perfectly.",
      files: {
        html: `<div class="pricing">
  <div class="card">
    <h3>Starter</h3>
    <p class="desc">Basic features.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Pro</h3>
    <p class="desc">Advanced features for teams with priority support, custom domains, and unlimited projects.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Enterprise</h3>
    <p class="desc">Everything in Pro.</p>
    <button>Buy Now</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.pricing {
  display: flex;
  gap: 20px;
  align-items: stretch; /* cards same height */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 200px;
  display: flex;           /* card is now a flex container */
  flex-direction: column;  /* children stack vertically */
}

h3   { margin: 0 0 8px; color: #3b82f6; }
.desc { margin: 0 0 16px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  margin-top: auto; /* consumes all available space above — pushes to bottom */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'align-self',
      defaultTab: 'css',
      text: "`align-self` overrides `align-items` for a SPECIFIC item. While all items stretch, one particular item can center itself or sit at the top. This is how you put an avatar image at center while text items in the same row stretch.",
      files: {
        html: `<div class="row">
  <img class="avatar" src="" alt="Avatar">
  <div class="info">
    <strong>Jane Smith</strong>
    <p>Senior Developer — she has a longer bio that makes this item taller than the avatar.</p>
  </div>
  <button class="action">Follow</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.row {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: stretch; /* default: all stretch */
  gap: 16px;
  max-width: 400px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #334155; /* placeholder color — no image */
  flex-shrink: 0;
  align-self: center;  /* override: avatar centers on cross axis */
}

.info {
  flex: 1;
}

.info strong { display: block; margin-bottom: 4px; color: #f1f5f9; }
.info p      { margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

.action {
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #475569;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  align-self: flex-start; /* override: button sits at the top */
  flex-shrink: 0;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'gap-vs-margin',
      defaultTab: 'css',
      text: "Setting margin on flex items creates gaps but also creates an unwanted gap at the outer edges. `gap: 24px` on the container adds space ONLY between items — no edge artifacts. Always prefer gap over margin for spacing flex items.",
      files: {
        html: `<p class="label">margin: 0 12px on items (creates edge space)</p>
<div class="row margin-row">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<p class="label">gap: 24px on container (clean edges)</p>
<div class="row gap-row">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.label { color: #475569; font-size: 0.75rem; font-family: monospace; margin: 16px 0 6px; }

.row {
  background: #1e293b;
  border: 1px dashed #334155;
  border-radius: 8px;
  padding: 12px;
  display: flex;
}

.card {
  background: #1d4ed8;
  color: white;
  padding: 16px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  flex: 1;
  text-align: center;
}

/* margin approach — adds space at edges too */
.margin-row .card { margin: 0 12px; }

/* gap approach — only between items */
.gap-row { gap: 24px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-baseline',
      defaultTab: 'css',
      text: "`baseline` alignment is valuable when items have different font sizes. All items align so their text baselines sit on the same line. Great for navigation items where some have icons or larger text — the text baselines stay consistent.",
      files: {
        html: `<nav class="nav">
  <a class="logo-link">◆ Brand</a>
  <a href="#">Features</a>
  <a href="#" class="highlight">Start Free Trial</a>
  <a href="#" class="small">Log in</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.nav {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  align-items: baseline; /* text baselines align across different sizes */
  gap: 4px;
}

.nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 12px;
  font-size: 0.9rem;
}

.logo-link { font-size: 1.2rem; font-weight: 700; color: #3b82f6; margin-right: 16px; }
.highlight { background: #3b82f6; color: white; border-radius: 6px; font-weight: 600; }
.small     { font-size: 0.78rem; margin-left: auto; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-alignment'
    },
    {
      type: 'narration',
      id: 'space-between-cards',
      defaultTab: 'css',
      text: "`justify-content: space-between` with two items: first goes far left, last goes far right. With one item, it goes far left. With three items: first left, last right, middle centered. This is the 'logo left, nav right' header pattern.",
      files: {
        html: `<header class="header">
  <div class="logo">◆ Brand</div>
  <nav class="nav-links">
    <a href="#">About</a>
    <a href="#">Work</a>
    <a href="#">Contact</a>
  </nav>
</header>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  justify-content: space-between; /* logo far left, nav far right */
  align-items: center;
}

.logo { font-size: 1.1rem; font-weight: 700; color: #3b82f6; padding: 16px 0; }

.nav-links { display: flex; gap: 4px; }
.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 14px;
  font-size: 0.9rem;
  border-radius: 4px;
}
.nav-links a:hover { color: #f1f5f9; background: #334155; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'nested-flex',
      defaultTab: 'css',
      text: "Flex containers can be nested. An outer flex container lays out the overall structure (three columns). An inner flex container within each column arranges that column's items. This is how dashboards and complex layouts are built.",
      files: {
        html: `<div class="dashboard">
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <a href="#">Dashboard</a>
      <a href="#">Projects</a>
      <a href="#">Team</a>
      <a href="#">Settings</a>
    </nav>
  </aside>
  <main class="main">
    <div class="stats">
      <div class="stat-card"><strong>1,234</strong><span>Projects</span></div>
      <div class="stat-card"><strong>56</strong><span>Active</span></div>
      <div class="stat-card"><strong>99%</strong><span>Uptime</span></div>
    </div>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

/* Outer flex: sidebar + main side by side */
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  width: 200px;
  flex-shrink: 0;
  padding: 16px;
}

/* Inner flex: nav items stacked vertically */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.sidebar-nav a:hover { background: #334155; color: #f1f5f9; }

.main { flex: 1; padding: 24px; }

/* Inner flex: stat cards in a row */
.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.stat-card strong { font-size: 1.8rem; color: #3b82f6; }
.stat-card span   { font-size: 0.78rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-nested-flex'
    },
    {
      type: 'challenge',
      id: 'ch-pricing',
      text: "Make the pricing cards equal height AND align all 'Buy Now' buttons at the bottom of each card. The outer container should stretch all cards to equal height. Each card should be a flex column. The button should use `margin-top: auto`.",
      hint: "Outer `.pricing`: `display: flex; align-items: stretch;`. Each `.card`: `display: flex; flex-direction: column;`. The `button`: `margin-top: auto;`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="pricing">
  <div class="card">
    <h3>Basic</h3>
    <p class="desc">Essential tools.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Professional</h3>
    <p class="desc">Full feature set with team collaboration, advanced reporting, and priority support.</p>
    <button>Buy Now</button>
  </div>
  <div class="card">
    <h3>Team</h3>
    <p class="desc">For growing teams.</p>
    <button>Buy Now</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.pricing {
  display: flex;
  gap: 20px;
  /* Add align-items: stretch */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 200px;
  /* Add display: flex; flex-direction: column */
}

h3   { margin: 0 0 8px; color: #3b82f6; }
.desc { margin: 0 0 16px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  /* Add margin-top: auto */
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /flex-direction\s*:\s*column/.test(css) && /margin.*auto|margin-top.*auto/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-header',
      text: "Build a page header: logo on the far left, nav links in the center, a CTA button on the far right. All items must be vertically centered. Use `justify-content: space-between` and `align-items: center`.",
      hint: "On `.header`: `display: flex; justify-content: space-between; align-items: center;`. Make `.nav` a flex container with gap for the links.",
      defaultTab: 'css',
      startFiles: {
        html: `<header class="header">
  <div class="logo">◆ Brand</div>
  <nav class="nav">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </nav>
  <button class="cta">Get Started</button>
</header>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 32px;
  height: 64px;
  /* Add flex layout: space-between + align-items center */
}

.logo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3b82f6;
}

.nav {
  /* Make this a flex row with gap */
}

.nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 8px 12px;
  font-size: 0.9rem;
  border-radius: 4px;
}

.cta {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /justify-content\s*:\s*space-between/.test(css) && /align-items\s*:\s*center/.test(css);
      }
    }
  ]
};
