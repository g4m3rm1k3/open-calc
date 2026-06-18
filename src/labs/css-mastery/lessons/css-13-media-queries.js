export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-13-media-queries',
  title: '13. Media Queries',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-breakpoints', label: 'Breakpoints' },
    { id: 'cp-responsive', label: 'Responsive Patterns' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Three columns on desktop. On mobile they squeeze together unreadably. Media queries let you apply different CSS based on the viewport size. One set of HTML, multiple CSS rules for different screen sizes. The layout changes — the HTML stays identical.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="grid">
  <div class="card">
    <div class="icon">🛒</div>
    <h3>Product One</h3>
    <p>A great product description that wraps on narrow screens.</p>
    <span class="price">\$29</span>
  </div>
  <div class="card">
    <div class="icon">🎧</div>
    <h3>Product Two</h3>
    <p>Another product description with useful details.</p>
    <span class="price">\$49</span>
  </div>
  <div class="card">
    <div class="icon">💡</div>
    <h3>Product Three</h3>
    <p>Yet another product that needs space to breathe.</p>
    <span class="price">\$19</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

/* No media queries — always 3 columns, breaks on small screens */
.grid {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  min-width: 0;
}

.icon { font-size: 2rem; margin-bottom: 12px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; }

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'syntax',
      defaultTab: 'css',
      text: "`@media (max-width: 768px) { }` — everything inside applies ONLY when the viewport is 768px wide or less. You can put any CSS inside. Think of it as a conditional: 'if the screen is small, apply these rules instead.' The simplest way to prove it's working is to change the background color at a breakpoint.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <p>Resize the browser window to see the background change.</p>
  <p class="note">Wide screen: blue. Narrow screen (≤768px): purple.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  background: #1d4ed8; /* default: desktop blue */
  padding: 48px;
  border-radius: 12px;
  text-align: center;
  transition: background 0.3s;
}

p { margin-bottom: 8px; line-height: 1.6; }
.note { font-size: 0.9rem; opacity: 0.8; }

/* When viewport is 768px or narrower, apply these styles */
@media (max-width: 768px) {
  body {
    background: #0f172a;
  }
  .demo {
    background: #7c3aed; /* changes to purple on small screens */
    padding: 32px 24px;
  }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'mobile-first',
      defaultTab: 'css',
      text: "Desktop-first: write desktop CSS, then use `max-width` media queries to undo it for mobile. Mobile-first: write mobile CSS first, then use `min-width` queries to ENHANCE for desktop. Mobile-first is the professional standard — you start minimal and add complexity. Mobile pages are also leaner because they don't download overriding CSS they immediately discard.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="comparison">
  <div class="panel">
    <h3>Desktop-first</h3>
    <pre>.layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
/* Then override for mobile: */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}</pre>
  </div>
  <div class="panel better">
    <h3>Mobile-first ✓</h3>
    <pre>.layout {
  display: grid;
  grid-template-columns: 1fr;
}
/* Then enhance for desktop: */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr 1fr;
  }
}</pre>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.comparison { display: flex; gap: 16px; }

.panel {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
}

.panel.better {
  border-color: #3b82f6;
  background: #1e3a5f;
}

h3 { font-size: 1rem; margin-bottom: 16px; color: #94a3b8; }

pre {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: #cbd5e1;
  line-height: 1.7;
  white-space: pre-wrap;
  background: rgba(0,0,0,0.2);
  padding: 12px;
  border-radius: 8px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'min-width',
      defaultTab: 'css',
      text: "Mobile-first pattern in action: the column layout starts as a single column (the default — no query needed). At 640px+ it becomes two columns. At 1024px+ it becomes three. Each `@media (min-width: ...)` query adds to the previous rules rather than overriding them. Watch: narrow the preview to see the columns collapse one at a time.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
}

/* Default (mobile): single column */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* 640px+: two columns */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 1024px+: three columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  font-weight: 600;
  color: #94a3b8;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'three-breakpoints',
      defaultTab: 'css',
      text: "You don't need a breakpoint for every device. Three golden breakpoints cover almost every real-world layout: `480px` (small phones in portrait), `768px` (tablets and large phones in landscape), `1024px` (desktops and large tablets). Most UIs only need two of these three. Adding more breakpoints usually signals that the layout wasn't designed flexibly enough.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="breakpoint-demo">
  <div class="indicator">
    <span class="sm">📱 &lt; 480px — Mobile</span>
    <span class="md">📱 480–768px — Large Phone</span>
    <span class="lg">💻 768–1024px — Tablet</span>
    <span class="xl">🖥 &gt; 1024px — Desktop</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breakpoint-demo {
  width: 100%;
  max-width: 500px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
}

.indicator span {
  display: none; /* hide all by default */
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px 24px;
  border-radius: 8px;
  text-align: center;
  width: 100%;
}

/* Show the correct label at each breakpoint range */
.sm { display: block; background: #7c3aed; }

@media (min-width: 480px) {
  .sm { display: none; }
  .md { display: block; background: #3b82f6; }
}

@media (min-width: 768px) {
  .md { display: none; }
  .lg { display: block; background: #0891b2; }
}

@media (min-width: 1024px) {
  .lg { display: none; }
  .xl { display: block; background: #10b981; }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'typography-breakpoints',
      defaultTab: 'css',
      text: "Responsive typography at breakpoints is the simplest approach: `h1 { font-size: 2rem; }` then `@media (min-width: 768px) { h1 { font-size: 3.5rem; } }`. The heading grows on desktop. This is perfectly valid for most sites. The next lesson covers fluid typography using `clamp()` which scales smoothly without any breakpoints at all.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="hero">
  <h1>Responsive Heading</h1>
  <p>This paragraph also scales. Resize the preview to see the font size jump at 768px.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  padding: 60px 24px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

/* Mobile default */
h1 {
  font-size: 2rem;
  line-height: 1.2;
  margin-bottom: 16px;
}

p {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.7;
}

/* Desktop enhancement */
@media (min-width: 768px) {
  h1 {
    font-size: 3.5rem;
  }

  p {
    font-size: 1.2rem;
  }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-responsive',
      defaultTab: 'css',
      text: "A product grid that adapts at three breakpoints: one column on mobile, two on tablet, four on desktop. Three `@media` rules. The grid changes completely but the HTML is untouched. This is the power of the cascade — earlier rules are overridden by later ones when the conditions match.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="product-grid">
  <div class="product"><div class="thumb"></div><h4>Widget A</h4><span>\$12</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget B</h4><span>\$18</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget C</h4><span>\$9</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget D</h4><span>\$24</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget E</h4><span>\$15</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget F</h4><span>\$32</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget G</h4><span>\$7</span></div>
  <div class="product"><div class="thumb"></div><h4>Widget H</h4><span>\$21</span></div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
}

/* Mobile: 1 column */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.product {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.thumb {
  height: 120px;
  background: linear-gradient(135deg, #334155, #1e293b);
}

h4 { padding: 12px 12px 4px; font-size: 0.95rem; }
span { display: block; padding: 0 12px 12px; color: #3b82f6; font-weight: 700; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'nav-responsive',
      defaultTab: 'css',
      text: "The classic navbar to hamburger problem. On mobile, hide nav links with `display: none` and show them stacked when `.is-open` is toggled. On desktop, links show horizontally always. The CSS half is just controlling `display` and `flex-direction` — JavaScript toggles the class. Here the mobile menu is pre-opened so you can see the pattern.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<nav class="navbar">
  <div class="nav-brand">MyApp</div>
  <button class="hamburger" onclick="this.closest('.navbar').querySelector('.nav-links').classList.toggle('is-open')">☰</button>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Work</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.navbar {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.2rem;
  padding: 16px 0;
  color: #f8fafc;
  flex: 1;
}

.hamburger {
  display: block; /* visible on mobile */
  background: none;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
}

/* Mobile nav: hidden by default, shown when .is-open */
.nav-links {
  display: none;
  flex-direction: column;
  width: 100%;
  padding: 8px 0 16px;
  list-style: none;
}

.nav-links.is-open {
  display: flex;
}

.nav-links a {
  display: block;
  padding: 12px 0;
  color: #94a3b8;
  text-decoration: none;
  border-bottom: 1px solid #334155;
}

/* Desktop: show links horizontally, hide hamburger */
@media (min-width: 768px) {
  .hamburger {
    display: none;
  }

  .nav-links {
    display: flex !important;
    flex-direction: row;
    width: auto;
    padding: 0;
    gap: 4px;
  }

  .nav-links a {
    padding: 20px 16px;
    border-bottom: none;
  }

  .nav-links a:hover {
    color: #f8fafc;
  }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'print-media',
      defaultTab: 'css',
      text: "`@media print` lets you define print-specific styles. Hide the nav, sidebar, and buttons. Show full URLs after links. Increase font size. Use black text on white background. Many developers forget about print — users sometimes print articles and get a nav, ads, and dark background consuming all the ink.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<nav class="site-nav">Navigation — hidden on print</nav>
<article class="content">
  <h1>An Article About CSS</h1>
  <p>This article is readable on screen and printable. The navigation, buttons, and dark background disappear when printed.</p>
  <p>Check out the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries">MDN docs</a> for more details — when printed, the URL will appear after the link text.</p>
  <button class="share-btn">Share This</button>
</article>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.site-nav {
  background: #1e293b;
  padding: 16px 24px;
  border-radius: 8px;
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.content {
  max-width: 640px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
}

h1 { font-size: 2rem; margin-bottom: 16px; }
p { color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
a { color: #3b82f6; }

.share-btn {
  background: #3b82f6;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

/* Print styles */
@media print {
  body {
    background: white;
    color: black;
    padding: 0;
  }

  .site-nav,
  .share-btn {
    display: none; /* hide non-content elements */
  }

  .content {
    background: white;
    padding: 0;
    max-width: 100%;
  }

  a {
    color: black;
  }

  /* Show full URLs after links */
  a::after {
    content: ' (' attr(href) ')';
    font-size: 0.8em;
    color: #666;
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-breakpoints'
    },
    {
      type: 'narration',
      id: 'hover-media',
      defaultTab: 'css',
      text: "`@media (hover: hover)` tests whether the primary input device supports hovering — i.e., a mouse. Touch devices report `hover: none`. Avoid hover-only interactions on touch devices: users can't hover with their fingers. Wrap hover styles in this query to ensure they only apply on real mouse devices, not on phones.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <h3>Hover-safe Card</h3>
    <p>The hover effect only applies on devices with a mouse. No hover trap on touchscreens.</p>
  </div>
  <div class="card">
    <h3>Another Card</h3>
    <p>On touch devices, both cards look identical. On desktop, hovering lifts this card.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  /* No transition here — applied inside hover: hover to avoid empty transitions on touch */
}

h3 { margin-bottom: 8px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }

/* Only apply hover effects on devices with a real mouse */
@media (hover: hover) {
  .card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.4);
    border-color: #3b82f6;
  }
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'prefer-reduced-motion',
      defaultTab: 'css',
      text: "`@media (prefers-reduced-motion: reduce)` detects users who have enabled 'Reduce Motion' in their OS accessibility settings. These users can experience motion sickness, epilepsy, or vestibular disorders from animated interfaces. Inside this query, disable or simplify animations. This is not optional polish — it's an accessibility requirement.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="spinner"></div>
  <p class="label">Loading spinner — animates only if user has not requested reduced motion</p>
  <div class="slide-in">
    <p>This content slides in on page load — respects motion preferences too.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 48px 24px;
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
}

.slide-in {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  max-width: 400px;
}

.label { font-size: 0.9rem; color: #94a3b8; text-align: center; }

/* Animations only run if user is OK with motion */
@media (prefers-reduced-motion: no-preference) {
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .spinner {
    animation: spin 0.8s linear infinite;
  }

  .slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-responsive'
    },
    {
      type: 'challenge',
      id: 'ch-mobile-grid',
      text: "Make the product grid show 1 column on small screens (default), 2 columns at 640px+, and 4 columns at 1024px+. Use mobile-first (min-width) media queries. The HTML is already written — only add CSS.",
      hint: "Start with `grid-template-columns: 1fr` as the default. Then add two `@media (min-width: ...)` blocks: one at 640px with `repeat(2, 1fr)` and one at 1024px with `repeat(4, 1fr)`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="product-grid">
  <div class="product">A</div>
  <div class="product">B</div>
  <div class="product">C</div>
  <div class="product">D</div>
  <div class="product">E</div>
  <div class="product">F</div>
  <div class="product">G</div>
  <div class="product">H</div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
}

.product-grid {
  display: grid;
  gap: 12px;
  /* Add grid-template-columns: 1fr as the default (mobile) */
}

/* Add @media (min-width: 640px) for 2 columns */

/* Add @media (min-width: 1024px) for 4 columns */

.product {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #94a3b8;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasMediaQuery = /@media/.test(css);
        const hasMinWidth = /min-width/.test(css);
        const hasMultipleColumns = /grid-template-columns/.test(css);
        return hasMediaQuery && hasMinWidth && hasMultipleColumns;
      }
    },
    {
      type: 'challenge',
      id: 'ch-nav-responsive',
      text: "Make the horizontal navbar collapse to a vertical stack on screens below 600px. On mobile, links should be `flex-direction: column`. On desktop (600px+), links should be horizontal. Use a mobile-first approach.",
      hint: "Set `flex-direction: column` as the default for `.nav-links`. Then add `@media (min-width: 600px)` with `flex-direction: row` to switch to horizontal on desktop.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<nav class="navbar">
  <span class="brand">Brand</span>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Work</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.navbar {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 16px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
}

.nav-links {
  display: flex;
  /* Add flex-direction: column here for mobile */
  list-style: none;
  gap: 4px;
  width: 100%;
}

.nav-links a {
  display: block;
  padding: 10px 16px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 6px;
}

/* Add @media (min-width: 600px) to make links horizontal */`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasMedia = /@media/.test(css);
        const hasColumnSomewhere = /flex-direction\s*:\s*column/.test(css);
        const hasRowOrDefault = /flex-direction\s*:\s*row/.test(css) || (hasMedia && /min-width\s*:\s*600/.test(css));
        return hasMedia && hasColumnSomewhere && hasRowOrDefault;
      }
    }
  ]
};
