export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-12-viewport',
  title: '12. The Viewport',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-units', label: 'Viewport Units' },
    { id: 'cp-mobile-first', label: 'Mobile First' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Your site looks perfect on your desktop. On a mobile phone, it renders at 980px — the full desktop width — then scales the entire page down. Everything is tiny and users have to pinch-to-zoom. The browser simulates a wide viewport to prevent old sites from breaking on mobile. The fix is one line of HTML.",
      files: {
        html: `<!DOCTYPE html>
<!-- NO viewport meta tag — browser renders at ~980px then scales down -->
<html>
<head>
  <title>No Viewport</title>
</head>
<body>
  <div class="hero">
    <h1>Welcome to My Site</h1>
    <p>This text is technically readable on desktop, but on a phone the entire page is scaled down to fit the screen — making everything tiny and requiring pinch-to-zoom.</p>
    <button class="btn">Get Started</button>
  </div>
  <div class="cards">
    <div class="card">Feature One</div>
    <div class="card">Feature Two</div>
    <div class="card">Feature Three</div>
  </div>
</body>
</html>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  padding: 80px 40px;
  text-align: center;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: 48px;
  margin-bottom: 16px;
  color: #f8fafc;
}

p {
  font-size: 18px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.btn {
  background: #3b82f6;
  color: white;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.cards {
  display: flex;
  gap: 24px;
  padding: 40px;
}

.card {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
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
      id: 'mobile-meta',
      defaultTab: 'css',
      text: "Add this to your HTML `<head>`: `<meta name='viewport' content='width=device-width, initial-scale=1'>`. `width=device-width` tells the browser: the viewport width should equal the device's actual screen width, not a pretend 980px. `initial-scale=1` means no scaling. The page now renders at the real device width — no pinching required.",
      files: {
        html: `<!DOCTYPE html>
<html>
<head>
  <title>With Viewport Meta</title>
  <!-- This single line fixes the mobile scaling problem -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div class="hero">
    <h1>Welcome to My Site</h1>
    <p>With the viewport meta tag, this page now renders at the actual device width. Text is readable. No pinching required.</p>
    <button class="btn">Get Started</button>
  </div>
  <div class="cards">
    <div class="card">Feature One</div>
    <div class="card">Feature Two</div>
    <div class="card">Feature Three</div>
  </div>
</body>
</html>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  padding: 60px 24px;
  text-align: center;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #f8fafc;
}

p {
  font-size: 1rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

.btn {
  background: #3b82f6;
  color: white;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  font-weight: 600;
  color: #94a3b8;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'device-pixels',
      defaultTab: 'css',
      text: "Modern phones have screens with 2x or 3x pixel density — 1 CSS pixel = 2×2 or 3×3 physical pixels on a Retina display. An iPhone 15 has a 3x device pixel ratio: 1 CSS pixel maps to 9 physical pixels. This is why images can look blurry on mobile: you showed a 100×100px image in a 100px container, but the hardware expects 300×300px to look sharp. CSS pixels are what you control. Physical pixels are the hardware's concern.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="pixel-demo">
    <div class="css-pixel"></div>
    <p>1 CSS pixel</p>
  </div>
  <div class="pixel-demo">
    <div class="physical-pixels">
      <div class="p"></div><div class="p"></div><div class="p"></div>
      <div class="p"></div><div class="p"></div><div class="p"></div>
      <div class="p"></div><div class="p"></div><div class="p"></div>
    </div>
    <p>9 physical pixels (3x display)</p>
  </div>
</div>
<p class="note">You write CSS in CSS pixels. The browser handles mapping to physical pixels automatically. For sharp images on high-DPI displays, provide 2x or 3x resolution images.</p>`,
        css: `* { box-sizing: border-box; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.demo {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  margin-bottom: 32px;
}

.pixel-demo { text-align: center; }
.pixel-demo p { margin-top: 12px; font-size: 0.85rem; color: #94a3b8; }

.css-pixel {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border: 2px solid #60a5fa;
  margin: 0 auto;
}

.physical-pixels {
  display: grid;
  grid-template-columns: repeat(3, 16px);
  grid-template-rows: repeat(3, 16px);
  gap: 1px;
  background: #334155;
  padding: 1px;
  margin: 0 auto;
  width: fit-content;
}

.p {
  width: 16px;
  height: 16px;
  background: #6366f1;
}

.note {
  background: #1e293b;
  border: 1px solid #334155;
  border-left: 3px solid #3b82f6;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #94a3b8;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'viewport-units-vh',
      defaultTab: 'css',
      text: "`1vh` = 1% of the viewport height. `100vh` = the full visible height of the browser window. This is how you make a full-screen hero section that fills exactly one screen regardless of device. No more guessing at pixel values. The hero always fills the viewport — on a phone, a tablet, or a wide monitor.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<section class="hero">
  <h1>Full Viewport Hero</h1>
  <p>height: 100vh — this section fills exactly the visible browser window</p>
  <a class="btn" href="#next">Scroll Down ↓</a>
</section>
<section id="next" class="next-section">
  <p>The next section starts exactly where the viewport ends.</p>
</section>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  height: 100vh; /* Fill the full viewport height */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  background: linear-gradient(160deg, #1e3a5f 0%, #0f172a 100%);
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  margin-bottom: 16px;
  color: #f8fafc;
}

p {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 32px;
}

.btn {
  background: #3b82f6;
  color: white;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.next-section {
  padding: 80px 24px;
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'vw-unit',
      defaultTab: 'css',
      text: "`1vw` = 1% of the viewport width. `50vw` = half the viewport width. `100vw` = full viewport width. Unlike `%` which is relative to the PARENT element, `vw` is always relative to the viewport. This is useful for full-bleed banners that must escape a constrained container — the banner below breaks out of the narrow article container to span the full viewport width.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<article class="article">
  <h2>An Article with a Max-Width Container</h2>
  <p>This paragraph is constrained to the article's max-width. Content flows normally.</p>

  <div class="full-bleed-banner">
    <p>This banner uses <code>width: 100vw</code> — it escapes the article container and spans the full viewport</p>
  </div>

  <p>After the banner, content returns to the constrained width.</p>
</article>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 0;
}

.article {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 24px;
}

h2 { font-size: 1.8rem; margin-bottom: 16px; }
p { color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }

.full-bleed-banner {
  /* Break out of the max-width container */
  width: 100vw;
  /* Shift left to align with the viewport edge */
  margin-left: calc(-50vw + 50%);
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 24px;
}

.full-bleed-banner p {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'vw-gotcha',
      defaultTab: 'css',
      text: "Careful: `width: 100vw` includes the scrollbar width. On a page with a vertical scrollbar, `100vw` is wider than the usable viewport area, causing horizontal overflow and an unwanted horizontal scrollbar. Use `width: 100%` on most elements — it stops at the content edge. Reserve `100vw` for fixed-positioned elements or when you explicitly want to include scrollbar space.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="with-vw">width: 100vw — may cause horizontal scroll when scrollbar is present (try adding overflow-y: scroll to body)</div>
  <div class="with-percent">width: 100% — always stays within the content area, scrollbar-safe</div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
  /* overflow-y: scroll; uncomment to see the 100vw overflow */
}

.demo { display: flex; flex-direction: column; gap: 16px; }

.with-vw {
  width: 100vw; /* includes scrollbar — can overflow */
  background: linear-gradient(90deg, #ef4444, #dc2626);
  padding: 20px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.with-percent {
  width: 100%; /* stops at parent edge — always safe */
  background: linear-gradient(90deg, #10b981, #059669);
  padding: 20px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'dvh-unit',
      defaultTab: 'css',
      text: "On mobile browsers, `100vh` includes the space behind the address bar and toolbar. When those UI elements are shown, your '100vh' element is actually taller than the visible area — users see a scrollbar on what should be a full-screen section. `100dvh` (dynamic viewport height) always equals the currently visible height, automatically adjusting as the mobile browser UI shows and hides.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="comparison">
  <div class="hero-vh">
    <h2>height: 100vh</h2>
    <p>On mobile, this may extend behind the browser toolbar. Users might see a small scrollbar even though you intended full-screen.</p>
  </div>
  <div class="hero-dvh">
    <h2>height: 100dvh</h2>
    <p>Dynamic viewport height — always exactly the visible area. No surprise scrollbars on mobile.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.comparison {
  display: flex;
  gap: 4px;
}

.hero-vh, .hero-dvh {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.hero-vh {
  height: 100vh; /* old: may extend behind mobile UI */
  background: linear-gradient(160deg, #7f1d1d, #1e293b);
  border-right: 2px solid #334155;
}

.hero-dvh {
  height: 100dvh; /* new: always the visible area */
  background: linear-gradient(160deg, #14532d, #1e293b);
}

h2 { font-size: 1.2rem; margin-bottom: 12px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'vmin-vmax',
      defaultTab: 'css',
      text: "`vmin` is the smaller of vw and vh. `vmax` is the larger. On a portrait phone (375×812px), `vmin = 375px` (width) and `vmax = 812px` (height). On landscape (812×375px), they flip automatically. This is useful for making elements that scale appropriately in any orientation — like a square avatar that's always 50% of the shorter dimension.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="vmin-box">
    <span>50vmin</span>
    <p>Half the shorter dimension. Portrait: half viewport width. Landscape: half viewport height.</p>
  </div>
  <div class="vmax-box">
    <span>30vmax</span>
    <p>30% of the longer dimension. Always the bigger side.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
  display: flex;
  align-items: center;
  min-height: 100vh;
}

.demo {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.vmin-box, .vmax-box {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.vmin-box span {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 12px;
}

.vmax-box span {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 12px;
}

p { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'rem-vs-px',
      defaultTab: 'css',
      text: "`rem` (root em) is relative to the root (`<html>`) font size — by default 16px in all browsers. `1rem = 16px`, `1.5rem = 24px`, `2rem = 32px`. Unlike `px`, rem scales with the user's browser font size preference. Users who set their browser to 20px base font size get proportionally larger text. Accessibility best practice: use rem for all font-sizes so users who need larger text can get it.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="panel">
    <h3>Fixed pixels</h3>
    <p class="px-text">font-size: 18px — ignores user font preferences. If the user sets browser font to 24px, this stays at 18px.</p>
  </div>
  <div class="panel">
    <h3>Relative rem</h3>
    <p class="rem-text">font-size: 1.125rem — scales with user preferences. Change the :root font-size below to see it adapt.</p>
  </div>
</div>
<style>
  /* Try changing 16px to 24px to simulate a user with larger text preferences */
  :root { font-size: 16px; }
</style>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
:root { font-size: 16px; } /* Default browser font size */

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.demo { display: flex; gap: 24px; }

.panel {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
}

h3 { font-size: 1rem; color: #94a3b8; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }

.px-text {
  font-size: 18px; /* fixed — user preferences have no effect */
  line-height: 1.6;
  color: #f8fafc;
  background: linear-gradient(90deg, rgba(239,68,68,0.1), transparent);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.rem-text {
  font-size: 1.125rem; /* 18px at default, but scales with user preference */
  line-height: 1.6;
  color: #f8fafc;
  background: linear-gradient(90deg, rgba(16,185,129,0.1), transparent);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #10b981;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-units'
    },
    {
      type: 'narration',
      id: 'percentage-width',
      defaultTab: 'css',
      text: "`width: 100%` is relative to the parent container. `width: 100vw` is relative to the viewport. Inside a max-width article container, `width: 100%` keeps the element inside the container. `width: 100vw` breaks it out to fill the full viewport — useful for full-bleed images or banners, but most elements should use `100%`.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="container">
  <h2>Inside a max-width container</h2>
  <div class="box percent">width: 100% — stays inside the container</div>
  <div class="box vw">width: 100vw — breaks out of the container</div>
  <p>The container max-width is 600px. See how 100% respects that, while 100vw does not.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 0;
  overflow-x: hidden;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 24px;
  background: #1e293b;
  border-radius: 12px;
}

h2 { padding: 24px 0 16px; font-size: 1.3rem; }
p { padding: 16px 0 24px; font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }

.box {
  padding: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.percent {
  width: 100%; /* respects the container */
  background: #10b981;
  color: white;
}

.vw {
  width: 100vw; /* ignores the container */
  margin-left: calc(-50vw + 50%);
  background: #3b82f6;
  color: white;
  border-radius: 0;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'ch3-preview',
      defaultTab: 'css',
      text: "The viewport meta tag and viewport units are the foundation of responsive design. Now we build: media queries let you apply different CSS based on viewport size. Fluid typography scales smoothly between sizes using `clamp()`. Container queries let components respond to their own container rather than the global viewport. Responsive images use `object-fit` and `aspect-ratio` to handle any screen. All of these build on what you just learned.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="roadmap">
  <h2>Chapter 3: Responsive Design</h2>
  <div class="lessons">
    <div class="lesson done">12. The Viewport ✓</div>
    <div class="lesson next">13. Media Queries →</div>
    <div class="lesson">14. Fluid Typography</div>
    <div class="lesson">15. Responsive Images</div>
    <div class="lesson">16. Container Queries</div>
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

.roadmap {
  max-width: 480px;
  width: 100%;
}

h2 {
  font-size: 1.5rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
}

.lessons { display: flex; flex-direction: column; gap: 8px; }

.lesson {
  padding: 16px 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
}

.lesson.done {
  background: #14532d;
  border-color: #166534;
  color: #86efac;
}

.lesson.next {
  background: #1e3a5f;
  border-color: #1d4ed8;
  color: #93c5fd;
  font-weight: 700;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-mobile-first'
    },
    {
      type: 'challenge',
      id: 'ch-hero',
      text: "Create a hero section that fills exactly the viewport height, and centers its content both horizontally and vertically. The `.hero` should use `100vh` or `100dvh` for height, and center content with flexbox or grid.",
      hint: "Set `height: 100vh` on `.hero`. Then `display: flex; align-items: center; justify-content: center;` will center the content in both directions.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<section class="hero">
  <div class="content">
    <h1>Hero Section</h1>
    <p>Center me vertically and horizontally in the viewport.</p>
  </div>
</section>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  /* Add height: 100vh or 100dvh */
  /* Add display and alignment to center .content */
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px dashed #334155;
}

.content {
  text-align: center;
  padding: 24px;
}

h1 { font-size: 2.5rem; margin-bottom: 12px; }
p { color: #94a3b8; font-size: 1.1rem; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasHeight = /100vh|100dvh/.test(css);
        const hasFlex = /display\s*:\s*flex/.test(css) && /align-items\s*:\s*center/.test(css);
        const hasGrid = /display\s*:\s*grid/.test(css) && /place-items\s*:\s*center/.test(css);
        return hasHeight && (hasFlex || hasGrid);
      }
    },
    {
      type: 'challenge',
      id: 'ch-text-sizes',
      text: "Convert the stylesheet from `px` values to `rem` for all font-size properties. Use `1rem = 16px` as your base. The heading is 32px, the paragraph is 16px, the small text is 12px. Replace each px font-size with its rem equivalent.",
      hint: "32px = 2rem, 16px = 1rem, 12px = 0.75rem. Replace each `font-size: XXpx` with `font-size: Xrem`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="article">
  <h1>The Heading</h1>
  <p>A paragraph of body text. This is the standard reading size.</p>
  <small>A small caption or footnote.</small>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.article {
  max-width: 600px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
}

h1 {
  font-size: 32px; /* convert to rem */
  margin-bottom: 16px;
}

p {
  font-size: 16px; /* convert to rem */
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 12px;
}

small {
  font-size: 12px; /* convert to rem */
  color: #64748b;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasRem = /font-size\s*:\s*[\d.]+rem/.test(css);
        const noPxFontSize = !/font-size\s*:\s*\d+px/.test(css);
        return hasRem && noPxFontSize;
      }
    }
  ]
};
