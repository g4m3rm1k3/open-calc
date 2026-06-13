export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-08-flex-sizing',
  title: '08. Flex Sizing',
  chapter: 'css-ch2',
  language: 'web',
  checkpoints: [
    { id: 'cp-flex-sizing', label: 'Flex Sizing' },
    { id: 'cp-flex-layout', label: 'Flex Layouts' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You have a sidebar + main content layout. The sidebar should be a fixed 240px. The main content should fill all remaining space. Instead, both columns end up the same width. Flex sizing properties fix this.",
      files: {
        html: `<div class="layout">
  <aside class="sidebar">Sidebar (should be 240px)</aside>
  <main class="main">Main Content (should fill remaining space)</main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 24px;
  /* no sizing — gets equal share with main */
}

.main {
  background: #0f172a;
  padding: 24px;
  /* no sizing — gets equal share with sidebar */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-grow',
      defaultTab: 'css',
      text: "`flex-grow` determines how items share EXTRA space. The default is 0 (no growing). `flex-grow: 1` means 'take a share of remaining space'. If one item is grow:1 and another is grow:2, remaining space splits 1/3 and 2/3.",
      files: {
        html: `<div class="container">
  <div class="item a">grow: 0 (no growth)</div>
  <div class="item b">grow: 1 (one share)</div>
  <div class="item c">grow: 2 (two shares)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
}

.item {
  padding: 16px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
}

.a { background: #1d4ed8; flex-grow: 0; min-width: 80px; } /* no growth */
.b { background: #065f46; flex-grow: 1; } /* takes 1/3 of remaining space */
.c { background: #7c2d12; flex-grow: 2; } /* takes 2/3 of remaining space */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grow-demo',
      defaultTab: 'css',
      text: "Three items in a 600px container: grow 0, grow 1, grow 2. Each item starts at 50px natural width. Remaining space: 600 - 150 = 450px. Item A gets none. Item B gets 1/3 (150px → 200px total). Item C gets 2/3 (300px → 350px total).",
      files: {
        html: `<div class="container">
  <div class="item a">A<br><small>grow:0<br>stays 50px</small></div>
  <div class="item b">B<br><small>grow:1<br>+150px</small></div>
  <div class="item c">C<br><small>grow:2<br>+300px</small></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  width: 600px; /* explicit width for the math demo */
}

.item {
  padding: 12px 8px;
  border-radius: 6px;
  font-weight: 700;
  text-align: center;
  width: 50px;        /* base width for all — extra space distributed by flex-grow */
  font-size: 0.78rem;
  line-height: 1.4;
}

small { font-weight: 400; display: block; margin-top: 4px; }

.a { background: #1d4ed8; flex-grow: 0; }
.b { background: #065f46; flex-grow: 1; }
.c { background: #7c2d12; flex-grow: 2; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-shrink',
      defaultTab: 'css',
      text: "`flex-shrink` is the mirror: how much an item shrinks when there isn't enough space. Default is 1 — all items shrink proportionally. `flex-shrink: 0` means 'never shrink me'. This is exactly what you need for the fixed sidebar.",
      files: {
        html: `<div class="container narrow">
  <div class="item a">shrink: 1 (shrinks with container)</div>
  <div class="item b">shrink: 0 (never shrinks)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  width: 300px; /* narrow container to trigger shrinking */
}

.item {
  padding: 16px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
}

.a {
  background: #ef4444;
  flex-shrink: 1;  /* will shrink when container is narrow */
  width: 200px;
}

.b {
  background: #10b981;
  flex-shrink: 0;  /* refuses to shrink — stays at natural width */
  width: 160px;
  white-space: nowrap;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'sidebar-fixed',
      defaultTab: 'css',
      text: "The sidebar: `flex-shrink: 0; width: 240px`. It never shrinks. The main content: `flex-grow: 1`. It takes all remaining space. Whether the window is 900px or 1400px, the sidebar stays 240px and content fills the rest.",
      files: {
        html: `<div class="layout">
  <aside class="sidebar">
    <h3>Navigation</h3>
    <a href="#">Dashboard</a>
    <a href="#">Projects</a>
    <a href="#">Team</a>
    <a href="#">Settings</a>
  </aside>
  <main class="main">
    <h2>Main Content</h2>
    <p>The sidebar is always exactly 240px. This area fills all remaining space.</p>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 24px 16px;
  width: 240px;       /* desired width */
  flex-shrink: 0;     /* never shrinks below 240px */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar h3 { margin: 0 0 12px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.sidebar a  { color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 0.88rem; }
.sidebar a:hover { background: #334155; color: #f1f5f9; }

.main {
  flex-grow: 1; /* takes all remaining space */
  padding: 32px;
  background: #0f172a;
}

.main h2 { margin-top: 0; color: #3b82f6; }
.main p  { color: #94a3b8; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-basis',
      defaultTab: 'css',
      text: "`flex-basis` is the item's ideal size BEFORE growing or shrinking happens. Unlike `width`, it respects the flex context more naturally. `flex-basis: 240px` is the preferred way to set a starting size in flexbox — `width` works too, but `flex-basis` is semantically the right property.",
      files: {
        html: `<div class="layout">
  <aside class="sidebar">Sidebar — flex-basis: 240px</aside>
  <main class="main">Main — flex-grow: 1, flex-basis: 0</main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 24px;
  flex-basis: 240px;  /* preferred way to set starting size in flexbox */
  flex-shrink: 0;
}

.main {
  background: #0f172a;
  padding: 24px;
  flex-grow: 1;       /* fills remaining space */
  flex-basis: 0;      /* start from 0, grow to fill everything */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-shorthand',
      defaultTab: 'css',
      text: "`flex: 1` is shorthand for `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`. `flex: 0 0 240px` means `flex-grow: 0; flex-shrink: 0; flex-basis: 240px`. The three-value form is the most expressive and what professionals use in production code.",
      files: {
        html: `<div class="layout">
  <aside class="sidebar">Sidebar<br><code>flex: 0 0 240px</code></aside>
  <main class="main">Main Content<br><code>flex: 1</code></main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 24px;
  flex: 0 0 240px; /* grow:0 shrink:0 basis:240px — fixed width, never changes */
}

.main {
  background: #0f172a;
  padding: 24px;
  flex: 1; /* shorthand for grow:1 shrink:1 basis:0% — fills everything */
}

code {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-family: monospace;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-none',
      defaultTab: 'css',
      text: "`flex: none` is shorthand for `flex-grow: 0; flex-shrink: 0; flex-basis: auto`. An item that refuses to grow or shrink — its size is determined entirely by its content or explicit width. Perfect for avatars and icons that should never distort.",
      files: {
        html: `<div class="profile-card">
  <div class="avatar">JD</div>
  <div class="info">
    <strong>Jane Doe</strong>
    <p>Senior Developer · Frontend Team · San Francisco, CA</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  max-width: 400px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex: none; /* never grows, never shrinks — always 48×48 */
}

.info { flex: 1; } /* takes remaining space */
.info strong { display: block; font-size: 0.95rem; margin-bottom: 4px; }
.info p      { margin: 0; color: #64748b; font-size: 0.8rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'auto-layout',
      defaultTab: 'css',
      text: "`flex-basis: auto` uses the item's width or natural content size as the starting point. This is the semantically correct choice when you want items to start at their natural size but can grow or shrink from there.",
      files: {
        html: `<div class="toolbar">
  <button class="btn icon-btn">★</button>
  <button class="btn">Save Draft</button>
  <button class="btn primary">Publish</button>
  <div class="spacer"></div>
  <button class="btn">Cancel</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.toolbar {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.85rem;
  flex-basis: auto; /* starts at natural content size */
  flex-shrink: 0;   /* doesn't shrink — keeps natural size */
}

.icon-btn { padding: 8px 12px; }
.primary  { background: #3b82f6; border-color: #3b82f6; font-weight: 600; }

.spacer { flex: 1; } /* pushes "Cancel" to the right */`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-flex-sizing'
    },
    {
      type: 'narration',
      id: 'min-max-with-flex',
      defaultTab: 'css',
      text: "`min-width` and `max-width` constrain flex behavior. Even with `flex-grow: 1`, an item won't grow past its `max-width`. This creates responsive columns: `flex: 1; min-width: 200px; max-width: 400px` — each column claims available space but within sensible bounds.",
      files: {
        html: `<div class="columns">
  <div class="col">Column 1</div>
  <div class="col">Column 2</div>
  <div class="col">Column 3</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.columns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.col {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 24px;
  flex: 1;             /* grows to fill space */
  min-width: 200px;    /* never smaller than 200px — wraps instead */
  max-width: 400px;    /* never wider than 400px — caps growth */
  color: #94a3b8;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'three-column',
      defaultTab: 'css',
      text: "A classic three-column layout: left sidebar (fixed 200px), main content (flex: 1), right sidebar (fixed 200px). Both sidebars never shrink. Main always fills the middle. `flex: 0 0 200px` is the complete specification for a fixed-width non-shrinking column.",
      files: {
        html: `<div class="three-col">
  <aside class="sidebar-left">
    <h4>Navigation</h4>
    <a href="#">Item 1</a>
    <a href="#">Item 2</a>
    <a href="#">Item 3</a>
  </aside>
  <main class="content">
    <h2>Main Content</h2>
    <p>The main content fills all space between the two sidebars.</p>
  </main>
  <aside class="sidebar-right">
    <h4>Related</h4>
    <p>Tags, links, metadata here.</p>
  </aside>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.three-col {
  display: flex;
  min-height: 100vh;
}

.sidebar-left, .sidebar-right {
  flex: 0 0 200px; /* fixed width, never grows, never shrinks */
  background: #1e293b;
  padding: 24px 16px;
}

.sidebar-left { border-right: 1px solid #334155; }
.sidebar-right { border-left: 1px solid #334155; }

.sidebar-left a  { display: block; color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 2px; }
.sidebar-left a:hover { background: #334155; color: #f1f5f9; }

h4 { margin: 0 0 12px; color: #475569; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; }

.content {
  flex: 1; /* fills everything between the two sidebars */
  padding: 32px;
  background: #0f172a;
}

.content h2 { margin-top: 0; color: #3b82f6; }
.content p  { color: #94a3b8; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-flex-layout'
    },
    {
      type: 'challenge',
      id: 'ch-sidebar',
      text: "Make the `.sidebar` exactly 280px wide and NEVER shrink. Make the `.content` fill all remaining space. Use flex properties on each element.",
      hint: "On `.sidebar`: `flex: 0 0 280px;` or `flex-shrink: 0; width: 280px;`. On `.content`: `flex: 1;` or `flex-grow: 1;`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="layout">
  <aside class="sidebar">
    <h3>Sidebar</h3>
    <p>Always 280px wide</p>
  </aside>
  <main class="content">
    <h2>Main Content</h2>
    <p>Should fill all remaining space</p>
  </main>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 24px;
  /* Make this fixed at 280px and never shrink */
}

.content {
  background: #0f172a;
  padding: 32px;
  /* Make this fill remaining space */
}

h2, h3 { margin-top: 0; color: #3b82f6; }
p      { color: #94a3b8; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasFixed = /flex\s*:\s*0\s+0\s+280px/.test(css) ||
          (/flex-shrink\s*:\s*0/.test(css) && /width\s*:\s*280px|flex-basis\s*:\s*280px/.test(css));
        const hasFill = /flex\s*:\s*1/.test(css) || /flex-grow\s*:\s*1/.test(css);
        return hasFixed && hasFill;
      }
    },
    {
      type: 'challenge',
      id: 'ch-avatar-row',
      text: "Build a user card with a 40×40 avatar on the left that never grows or shrinks, and user info (name + role) on the right that fills available space.",
      hint: "On `.avatar`: `flex: none;` or `flex-shrink: 0; flex-grow: 0;`. On `.user-info`: `flex: 1;`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="user-card">
  <div class="avatar">AB</div>
  <div class="user-info">
    <strong>Alex Brown</strong>
    <span>Product Designer</span>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  max-width: 360px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  /* Add flex: none to prevent growing/shrinking */
}

.user-info {
  /* Add flex: 1 to fill remaining space */
}

.user-info strong { display: block; font-size: 0.9rem; margin-bottom: 2px; }
.user-info span   { color: #64748b; font-size: 0.8rem; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const avatarNone = /flex\s*:\s*none/.test(css) ||
          (/flex-shrink\s*:\s*0/.test(css) && /flex-grow\s*:\s*0/.test(css));
        const infoFill = /flex\s*:\s*1/.test(css) || /flex-grow\s*:\s*1/.test(css);
        return avatarNone && infoFill;
      }
    }
  ]
};
