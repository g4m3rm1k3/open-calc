export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-06-flex-direction',
  title: '06. Flex Direction & Wrapping',
  chapter: 'css-ch2',
  language: 'web',
  checkpoints: [
    { id: 'cp-flex-basics', label: 'Flex Basics' },
    { id: 'cp-flex-direction', label: 'Direction & Wrap' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Your navbar has 5 items. On a wide screen it fits. On a phone it overflows. The items don't wrap. They don't collapse. They just spill off screen. Flexbox solves this — and the solution is simpler than you think.",
      files: {
        html: `<nav class="navbar">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Portfolio</a>
  <a href="#">Contact</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.navbar {
  background: #1e293b;
  padding: 0 24px;
  border-bottom: 1px solid #334155;
  /* no flex yet — items will overflow in a narrow viewport */
  width: 380px; /* simulate narrow screen */
  overflow: hidden; /* show the overflow problem */
}

.navbar a {
  display: inline-block;
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 20px;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-basics',
      defaultTab: 'css',
      text: "One rule changes everything: `display: flex`. The container becomes a flex container. Its direct children become flex items. By default items line up in a row. They do NOT wrap — they shrink to fit the container width.",
      files: {
        html: `<nav class="navbar">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Portfolio</a>
  <a href="#">Contact</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.navbar {
  background: #1e293b;
  padding: 0 12px;
  border-bottom: 1px solid #334155;
  display: flex; /* one rule — everything changes */
  width: 380px;  /* simulate narrow viewport */
}

.navbar a {
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 12px;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-direction',
      defaultTab: 'css',
      text: "`flex-direction` controls the main axis. `row` (default) is left-to-right. `column` is top-to-bottom. `row-reverse` is right-to-left. `column-reverse` is bottom-to-top. Whatever direction you pick, items flow ALONG that axis.",
      files: {
        html: `<div class="demo">
  <p class="label">row (default)</p>
  <div class="flex-row">
    <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  </div>

  <p class="label">column</p>
  <div class="flex-col">
    <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  </div>

  <p class="label">row-reverse</p>
  <div class="flex-row-rev">
    <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.label { color: #475569; font-size: 0.75rem; font-family: monospace; margin: 16px 0 8px; text-transform: uppercase; }

.item {
  background: #1d4ed8;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 700;
  min-width: 48px;
  text-align: center;
}

.flex-row     { display: flex; flex-direction: row;         gap: 8px; }
.flex-col     { display: flex; flex-direction: column;      gap: 8px; width: 60px; }
.flex-row-rev { display: flex; flex-direction: row-reverse; gap: 8px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-wrap',
      defaultTab: 'css',
      text: "By default, flex items never wrap — they squeeze to fit. `flex-wrap: wrap` allows items to wrap onto the next line when they don't fit. Most real layouts need wrap when the container can be narrower than the combined item width.",
      files: {
        html: `<nav class="navbar">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Portfolio</a>
  <a href="#">Contact</a>
</nav>
<p class="note">On narrow widths, items wrap to the next row</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 16px; }

.navbar {
  background: #1e293b;
  padding: 0 12px;
  border-bottom: 1px solid #334155;
  display: flex;
  flex-wrap: wrap; /* items wrap to the next line when they don't fit */
  width: 300px;    /* narrow container to demonstrate wrapping */
}

.navbar a {
  color: #94a3b8;
  text-decoration: none;
  padding: 14px 16px;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
}

.navbar a:hover { color: #f1f5f9; background: #334155; }

.note { color: #475569; font-size: 0.8rem; margin-top: 8px; font-style: italic; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-flow',
      defaultTab: 'css',
      text: "`flex-flow` combines `flex-direction` and `flex-wrap` into one shorthand. `flex-flow: row wrap` is equivalent to setting both properties. This is the shorthand you'll use most often for responsive row layouts.",
      files: {
        html: `<nav class="navbar">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Portfolio</a>
  <a href="#">Contact</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 16px; }

.navbar {
  background: #1e293b;
  padding: 0 12px;
  border-bottom: 1px solid #334155;
  display: flex;
  flex-flow: row wrap; /* shorthand: direction + wrap in one property */
  width: 300px;
}

.navbar a {
  color: #94a3b8;
  text-decoration: none;
  padding: 14px 16px;
  font-weight: 500;
  font-size: 0.85rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'gap',
      defaultTab: 'css',
      text: "Instead of adding `margin` to flex items (which creates unwanted space at the edges), use `gap`. `gap: 16px` adds space BETWEEN items — no extra space before the first or after the last. `column-gap` and `row-gap` control each axis independently.",
      files: {
        html: `<div class="demo">
  <p class="label">With margin (edge problems)</p>
  <div class="btn-group margin-version">
    <button class="btn">Save</button>
    <button class="btn">Cancel</button>
    <button class="btn">Delete</button>
  </div>

  <p class="label">With gap (clean edges)</p>
  <div class="btn-group gap-version">
    <button class="btn">Save</button>
    <button class="btn">Cancel</button>
    <button class="btn">Delete</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.label { color: #475569; font-size: 0.75rem; font-family: monospace; margin: 16px 0 8px; text-transform: uppercase; }

.btn-group {
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  border: 1px solid #334155;
}

.btn {
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* margin approach — creates space at edges too */
.margin-version .btn { margin: 0 8px; }

/* gap approach — clean, no edge space */
.gap-version { gap: 16px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'row-gap',
      defaultTab: 'css',
      text: "When flex items wrap, `row-gap` controls the space between rows. Without it, wrapped rows sit flush against each other. `gap: 8px 16px` is shorthand for `row-gap: 8px` and `column-gap: 16px` simultaneously.",
      files: {
        html: `<div class="tags">
  <span class="tag">JavaScript</span>
  <span class="tag">TypeScript</span>
  <span class="tag">React</span>
  <span class="tag">Node.js</span>
  <span class="tag">CSS</span>
  <span class="tag">HTML</span>
  <span class="tag">Git</span>
  <span class="tag">Docker</span>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px; /* row-gap: 8px, column-gap: 12px */
  max-width: 360px;
}

.tag {
  background: #1e3a5f;
  color: #93c5fd;
  border: 1px solid #3b82f6;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'real-navbar',
      defaultTab: 'css',
      text: "Our navbar: flex container, row direction, wraps on small screens, gap between items, padding on the container. Logo on the left, nav items on the right using `justify-content: space-between`. This is the layout pattern for 90% of website headers.",
      files: {
        html: `<header class="header">
  <div class="logo">◆ Brand</div>
  <nav class="nav">
    <a href="#">Home</a>
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
  justify-content: space-between; /* logo left, nav right */
  align-items: center;
  flex-wrap: wrap;                /* wraps on narrow screens */
  gap: 12px;
}

.logo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3b82f6;
  padding: 16px 0;
}

.nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 14px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 4px;
}

.nav a:hover { color: #f1f5f9; background: #334155; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'column-layout',
      defaultTab: 'css',
      text: "Turn the container vertical with `flex-direction: column`. Now items stack. This is the 'mobile nav' pattern — the same HTML, different flex-direction. Combined with a media query, one HTML structure handles both desktop and mobile.",
      files: {
        html: `<nav class="mobile-nav">
  <div class="nav-logo">◆ Brand</div>
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Work</a>
  <a href="#">Contact</a>
</nav>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.mobile-nav {
  background: #1e293b;
  border-right: 1px solid #334155;
  width: 220px;
  min-height: 100vh;
  display: flex;
  flex-direction: column; /* vertical stack — mobile/sidebar layout */
  padding: 8px;
  gap: 2px;
}

.nav-logo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3b82f6;
  padding: 16px 12px 24px;
  border-bottom: 1px solid #334155;
  margin-bottom: 8px;
}

.mobile-nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
}

.mobile-nav a:hover { color: #f1f5f9; background: #334155; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-flex-basics'
    },
    {
      type: 'narration',
      id: 'flex-items-order',
      defaultTab: 'css',
      text: "The `order` property rearranges flex items without changing the HTML. Default `order` is 0. Items with lower order appear first. This is useful for accessibility: put main content first in the HTML (screen readers read it first) but visually position a sidebar before it.",
      files: {
        html: `<div class="row">
  <div class="item a">A (order: 2)</div>
  <div class="item b">B (order: 0)</div>
  <div class="item c">C (order: 1)</div>
</div>
<p class="note">Visual order: B, C, A — DOM order: A, B, C</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.row {
  display: flex;
  gap: 12px;
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
}

.item {
  padding: 16px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.a { background: #1d4ed8; order: 2; } /* appears last visually */
.b { background: #065f46; order: 0; } /* appears first visually */
.c { background: #7c2d12; order: 1; } /* appears second visually */

.note { color: #475569; font-size: 0.8rem; margin-top: 8px; font-style: italic; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flex-direction-column-use',
      defaultTab: 'css',
      text: "Column flex containers are perfect for card interiors: icon on top, title, description, and a button at the bottom. The button gets pushed to the bottom with `margin-top: auto` — this is flexbox's equivalent of 'push to bottom', consuming all available space above it.",
      files: {
        html: `<div class="cards">
  <div class="card">
    <div class="icon">◆</div>
    <h3>Short description</h3>
    <p>A brief feature.</p>
    <button>Learn More</button>
  </div>
  <div class="card">
    <div class="icon">★</div>
    <h3>Much longer description</h3>
    <p>This card has a lot more text in the body. Way more than the first card. Multiple sentences of detail about the feature.</p>
    <button>Learn More</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards { display: flex; gap: 20px; align-items: stretch; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 220px;
  display: flex;              /* card is a flex container */
  flex-direction: column;     /* items stack vertically */
  gap: 8px;
}

.icon { font-size: 2rem; color: #3b82f6; }
h3   { margin: 0; color: #f1f5f9; font-size: 0.95rem; }
p    { margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: auto; /* pushes button to bottom regardless of content height */
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-flex-direction'
    },
    {
      type: 'challenge',
      id: 'ch-navbar',
      text: "Given a navbar with a logo and 4 links, make it a horizontal flex row with the logo on the left and links grouped on the right. Links should wrap on narrow widths.",
      hint: "Add `display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;` to `.navbar`. Make `.nav-links` a flex container with `gap`.",
      defaultTab: 'css',
      startFiles: {
        html: `<header class="navbar">
  <div class="logo">◆ Brand</div>
  <div class="nav-links">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Work</a>
    <a href="#">Contact</a>
  </div>
</header>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.navbar {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  /* Add flex layout here */
}

.logo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3b82f6;
  padding: 16px 0;
}

.nav-links {
  /* Make this a flex row with gap */
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 12px;
  font-size: 0.9rem;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /display\s*:\s*flex/.test(css) && /flex-wrap\s*:\s*wrap/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-card-footer',
      text: "The card has a title, body text, and a button. Use `flex-direction: column` on the card so the button is always at the very bottom, regardless of how much text is in the body.",
      hint: "On `.card`: `display: flex; flex-direction: column;`. On `.btn`: `margin-top: auto;`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="cards">
  <div class="card">
    <h3>Plan A</h3>
    <p>Basic plan with essential features.</p>
    <button class="btn">Get Started</button>
  </div>
  <div class="card">
    <h3>Plan B</h3>
    <p>Pro plan with advanced features, priority support, custom domains, and unlimited projects for growing teams.</p>
    <button class="btn">Get Started</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 220px;
  /* Add flex-direction: column here */
}

h3  { margin: 0 0 8px; color: #3b82f6; }
p   { margin: 0 0 16px; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }

.btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  /* Add margin-top: auto to push to bottom */
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /flex-direction\s*:\s*column/.test(css) && /margin.*auto|margin-top.*auto/.test(css);
      }
    }
  ]
};
