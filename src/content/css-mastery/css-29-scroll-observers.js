export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-29-scroll-observers',
  title: '29. Scroll Observers',
  chapter: 'css-ch6',
  language: 'web',
  checkpoints: [
    { id: 'cp-intersection', label: 'IntersectionObserver' },
    { id: 'cp-thresholds', label: 'Thresholds & Margins' },
    { id: 'cp-patterns', label: 'Real Patterns' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'js',
      text: "You want elements to fade in when they scroll into view. Your first instinct: listen to `scroll` events, use `getBoundingClientRect()` on each element, check if it's in the viewport. This runs on every scroll tick — 60 times per second. With 20 elements, that's 1200 DOM reads per second. It stutters on mobile and kills the main thread. `IntersectionObserver` is the browser-native solution: it fires a callback only when elements enter or leave the viewport, off the main thread.",
      files: {
        html: `<div class="page">
  <div class="hero">
    <h1>Scroll Down</h1>
    <p>Elements below will animate in as you scroll</p>
  </div>
  <div class="cards">
    <div class="card reveal">Card 1</div>
    <div class="card reveal">Card 2</div>
    <div class="card reveal">Card 3</div>
    <div class="card reveal">Card 4</div>
    <div class="card reveal">Card 5</div>
    <div class="card reveal">Card 6</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.hero { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
h1 { font-size: 3rem; margin: 0 0 12px; color: #38bdf8; }
.hero p { color: #94a3b8; }

.cards { padding: 40px 32px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 600px; margin: 0 auto; }

.card { background: #1e293b; padding: 32px; border-radius: 12px; font-weight: 700; font-size: 1.1rem; color: #e2e8f0; border: 1px solid #334155; text-align: center; }

/* Initial state: invisible and shifted down */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.5s ease, transform 0.5s ease; }

/* When JS adds .is-visible, animate in */
.reveal.is-visible { opacity: 1; transform: translateY(0); }`,
        js: `const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.2 }); // fire when 20% of element is visible

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));`
      }
    },
    {
      type: 'narration',
      id: 'io-basics',
      defaultTab: 'js',
      text: "`IntersectionObserver` takes a callback and options object. The callback receives an array of `IntersectionObserverEntry` objects — one per observed element. `entry.isIntersecting` is true when the element enters the viewport. `entry.intersectionRatio` is 0–1 (what fraction is visible). Options: `threshold` (ratio to fire at) and `rootMargin` (expand/shrink the viewport).",
      files: {
        html: `<div class="spacer">↓ Scroll down to see the box</div>
<div class="target" id="target">
  <div class="status" id="status">Not intersecting</div>
  <div class="ratio" id="ratio">0%</div>
</div>
<div class="spacer">More content below</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.spacer { height: 100vh; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 1.5rem; }

.target { margin: 0 auto; max-width: 400px; background: #1e293b; border-radius: 12px; padding: 40px; text-align: center; border: 2px solid #334155; transition: border-color 0.3s, background 0.3s; }
.target.intersecting { border-color: #3b82f6; background: #1e3a5f; }

.status { font-size: 1.2rem; font-weight: 700; color: #ef4444; margin-bottom: 8px; }
.target.intersecting .status { color: #10b981; }

.ratio { font-size: 2rem; font-weight: 700; color: #64748b; }
.target.intersecting .ratio { color: #3b82f6; }`,
        js: `const target = document.getElementById('target');
const statusEl = document.getElementById('status');
const ratioEl = document.getElementById('ratio');

const observer = new IntersectionObserver((entries) => {
  const entry = entries[0];

  if (entry.isIntersecting) {
    target.classList.add('intersecting');
    statusEl.textContent = 'Intersecting ✓';
  } else {
    target.classList.remove('intersecting');
    statusEl.textContent = 'Not intersecting';
  }

  ratioEl.textContent = Math.round(entry.intersectionRatio * 100) + '%';
}, {
  threshold: Array.from({ length: 101 }, (_, i) => i / 100) // fire every 1%
});

observer.observe(target);`
      }
    },
    {
      type: 'narration',
      id: 'threshold-options',
      defaultTab: 'js',
      text: "`threshold: 0` fires as soon as one pixel enters. `threshold: 1` fires only when the element is fully visible. An array like `[0, 0.25, 0.5, 0.75, 1]` fires at each of those ratios. `rootMargin` works like CSS margin — `rootMargin: '-100px'` means \"fire when 100px inside the viewport\" — great for anticipating scroll entrance.",
      files: {
        html: `<div class="page">
  <div class="spacer">Scroll down →</div>
  <div class="boxes">
    <div class="box" id="box0">threshold: 0 (1px)</div>
    <div class="box" id="box1">threshold: 0.5 (50%)</div>
    <div class="box" id="box2">threshold: 1 (100%)</div>
    <div class="box margin" id="box3">rootMargin: -50px</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }
.spacer { height: 100vh; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 1.2rem; }
.boxes { padding: 32px; display: flex; flex-direction: column; gap: 200px; max-width: 500px; margin: 0 auto; padding-bottom: 100vh; }

.box { background: #1e293b; padding: 32px; border-radius: 10px; text-align: center; font-weight: 600; border: 2px solid #334155; color: #64748b; transition: background 0.3s, border-color 0.3s, color 0.3s; }
.box.lit { background: #1e3a5f; border-color: #3b82f6; color: #e2e8f0; }`,
        js: `function makeObserver(selector, threshold, rootMargin = '0px') {
  const el = document.querySelector(selector);
  new IntersectionObserver(([entry]) => {
    el.classList.toggle('lit', entry.isIntersecting);
  }, { threshold, rootMargin }).observe(el);
}

makeObserver('#box0', 0);          // fires at 1px
makeObserver('#box1', 0.5);        // fires at 50%
makeObserver('#box2', 1.0);        // fires at 100% (may never fire if box is tall)
makeObserver('#box3', 0, '-50px'); // rootMargin shrinks viewport by 50px on all sides`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-intersection'
    },
    {
      type: 'narration',
      id: 'once-vs-repeat',
      defaultTab: 'js',
      text: "Two common patterns: fire once (animations that play on first scroll into view) and fire repeatedly (sticky headers, active nav links). For once: `observer.unobserve(entry.target)` inside the callback after adding the class. For repeat: leave the observer running.",
      files: {
        html: `<div class="page">
  <div class="spacer">Scroll down for both patterns</div>
  <div class="section">
    <div class="once reveal">Animates once — try scrolling out and back</div>
    <div class="repeat reveal">Animates every time it enters — scroll away and return</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }
.spacer { height: 100vh; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 1.1rem; }
.section { padding: 40px 32px; display: flex; flex-direction: column; gap: 80px; max-width: 480px; margin: 0 auto; padding-bottom: 100vh; }

.reveal { background: #1e293b; padding: 28px; border-radius: 10px; font-weight: 600; border: 2px solid #334155; color: #64748b; opacity: 0; transform: translateX(-20px); transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.3s; }
.reveal.is-visible { opacity: 1; transform: none; border-color: #3b82f6; color: #e2e8f0; }`,
        js: `// Observer for elements that animate once (fire-and-forget)
const onceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      onceObserver.unobserve(entry.target); // stop watching
    }
  });
}, { threshold: 0.3 });

// Observer for elements that animate every time they enter/leave
const repeatObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
    // Note: no unobserve — stays active
  });
}, { threshold: 0.3 });

onceObserver.observe(document.querySelector('.once'));
repeatObserver.observe(document.querySelector('.repeat'));`
      }
    },
    {
      type: 'narration',
      id: 'active-nav',
      defaultTab: 'js',
      text: "Active navigation links: observe each section, track which is intersecting, highlight the corresponding nav link. Each section gets `data-section` that matches the nav link's `data-target`. This is how modern single-page sites handle scroll-driven navigation without any routing library.",
      files: {
        html: `<nav class="sticky-nav" id="nav">
  <a data-target="intro">Intro</a>
  <a data-target="features">Features</a>
  <a data-target="pricing">Pricing</a>
  <a data-target="contact">Contact</a>
</nav>

<main>
  <section data-section="intro"><h2>Introduction</h2><p>First section content. Scroll down.</p></section>
  <section data-section="features"><h2>Features</h2><p>Features section content.</p></section>
  <section data-section="pricing"><h2>Pricing</h2><p>Pricing section content.</p></section>
  <section data-section="contact"><h2>Contact</h2><p>Contact section content.</p></section>
</main>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.sticky-nav { position: sticky; top: 0; background: #1e293b; display: flex; gap: 4px; padding: 12px 20px; z-index: 10; border-bottom: 1px solid #334155; }
.sticky-nav a { color: #64748b; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: background 0.15s, color 0.15s; }
.sticky-nav a.is-active { background: #3b82f620; color: #3b82f6; font-weight: 600; }

section { min-height: 60vh; padding: 60px 40px; border-bottom: 1px solid #1e293b; }
h2 { color: #38bdf8; margin: 0 0 12px; }
p { color: #94a3b8; }`,
        js: `const navLinks = document.querySelectorAll('[data-target]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.dataset.section;

    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.dataset.target === id);
    });
  });
}, {
  rootMargin: '-30% 0px -60% 0px', // section is "active" when it's in the middle 10% of screen
  threshold: 0
});

document.querySelectorAll('[data-section]').forEach(s => observer.observe(s));`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-thresholds'
    },
    {
      type: 'narration',
      id: 'lazy-images',
      defaultTab: 'js',
      text: "Lazy loading images: observe each `<img>` with `data-src`. When it intersects, copy `data-src` to `src` and stop observing. The browser then loads the image. This is how every image-heavy site avoids loading 3MB of images upfront. (Note: modern browsers have native `loading=\"lazy\"` — but the IO pattern is useful for custom skeletons and blur-up effects.)",
      files: {
        html: `<div class="gallery">
  <div class="img-wrapper" data-bg="#3b82f6">
    <div class="placeholder"></div>
  </div>
  <div class="img-wrapper" data-bg="#10b981">
    <div class="placeholder"></div>
  </div>
  <div class="img-wrapper" data-bg="#f59e0b">
    <div class="placeholder"></div>
  </div>
  <div class="img-wrapper" data-bg="#ef4444">
    <div class="placeholder"></div>
  </div>
  <div class="img-wrapper" data-bg="#7c3aed">
    <div class="placeholder"></div>
  </div>
  <div class="img-wrapper" data-bg="#06b6d4">
    <div class="placeholder"></div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 32px; max-width: 500px; margin: 0 auto; }

.img-wrapper { aspect-ratio: 4/3; border-radius: 10px; overflow: hidden; background: #1e293b; }

.placeholder { width: 100%; height: 100%; background: #334155; transition: background 0.8s ease, opacity 0.5s ease; }

/* When loaded class is added, fade in the real color */
.img-wrapper.loaded .placeholder { opacity: 1; }`,
        js: `// Simulate lazy-loading by faking a 300ms network delay
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const wrapper = entry.target;
    const color = wrapper.dataset.bg;

    // Simulate loading delay
    setTimeout(() => {
      wrapper.querySelector('.placeholder').style.background = color;
      wrapper.classList.add('loaded');
    }, 300 + Math.random() * 400); // stagger

    observer.unobserve(wrapper); // stop watching after load
  });
}, { threshold: 0.1 });

document.querySelectorAll('.img-wrapper').forEach(el => observer.observe(el));`
      }
    },
    {
      type: 'narration',
      id: 'staggered-reveal',
      defaultTab: 'js',
      text: "Staggered scroll reveal: observe a container, not the items. When the container enters, add `is-visible` to each child with a delay based on index. Use CSS custom properties for the delay. This is the pattern behind almost every marketing page's 'features grid' animation.",
      files: {
        html: `<div class="spacer">Scroll down for staggered reveal</div>
<div class="features" id="features">
  <div class="feature">
    <div class="icon">⚡</div>
    <h3>Fast</h3>
    <p>Built for performance</p>
  </div>
  <div class="feature">
    <div class="icon">🔒</div>
    <h3>Secure</h3>
    <p>Zero-trust architecture</p>
  </div>
  <div class="feature">
    <div class="icon">📱</div>
    <h3>Responsive</h3>
    <p>Works on every screen</p>
  </div>
  <div class="feature">
    <div class="icon">🎨</div>
    <h3>Customizable</h3>
    <p>Themed via CSS variables</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }
.spacer { height: 100vh; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 1.1rem; }

.features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 40px 32px; max-width: 560px; margin: 0 auto; padding-bottom: 60px; }

.feature {
  background: #1e293b;
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #334155;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease calc(var(--i, 0) * 120ms),
              transform 0.5s ease calc(var(--i, 0) * 120ms);
}

.feature.is-visible { opacity: 1; transform: none; }

.icon { font-size: 2rem; margin-bottom: 12px; }
h3 { margin: 0 0 6px; color: #e2e8f0; }
p { margin: 0; color: #64748b; font-size: 0.9rem; }`,
        js: `const featuresEl = document.getElementById('features');

// Set --i on each item
featuresEl.querySelectorAll('.feature').forEach((el, i) => {
  el.style.setProperty('--i', i);
});

const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;

  featuresEl.querySelectorAll('.feature').forEach(el => {
    el.classList.add('is-visible');
  });

  observer.unobserve(featuresEl); // fire once
}, { threshold: 0.1 });

observer.observe(featuresEl);`
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-patterns'
    },
    {
      type: 'narration',
      id: 'resize-observer',
      defaultTab: 'js',
      text: "`ResizeObserver` fires when an element changes size — not when the window resizes, but when the ELEMENT resizes. Use it when an element's content changes dynamically and you need to respond to its new dimensions. This is how container queries work conceptually under the hood.",
      files: {
        html: `<div class="resizable" id="resizable">
  <p>Drag the handle to resize this element</p>
  <div id="dimensions" class="dimensions">waiting...</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 32px; }

.resizable {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 10px;
  padding: 24px;
  width: 300px;
  min-height: 120px;
  resize: both; /* native CSS resize handle */
  overflow: auto;
}

.resizable p { color: #94a3b8; margin: 0 0 16px; }

.dimensions { font-family: monospace; font-size: 0.85rem; color: #3b82f6; background: #0f172a; padding: 10px 14px; border-radius: 6px; }`,
        js: `const el = document.getElementById('resizable');
const dims = document.getElementById('dimensions');

const ro = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    dims.textContent = \`width: \${Math.round(width)}px  height: \${Math.round(height)}px\`;
  }
});

ro.observe(el);`
      }
    },
    {
      type: 'challenge',
      id: 'ch-reveal',
      text: "Set up an `IntersectionObserver` that adds `.is-visible` to each `.card` when it enters the viewport with a threshold of 0.3. The CSS already defines the animation. Use `observer.unobserve(entry.target)` so each card only animates once.",
      hint: "new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.3 })",
      defaultTab: 'js',
      startFiles: {
        html: `<div class="spacer">↓ Scroll down</div>
<div class="cards">
  <div class="card">Card One</div>
  <div class="card">Card Two</div>
  <div class="card">Card Three</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }
.spacer { height: 100vh; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 1.1rem; }
.cards { padding: 40px 32px; display: flex; flex-direction: column; gap: 200px; max-width: 400px; margin: 0 auto; padding-bottom: 100vh; }

.card { background: #1e293b; padding: 32px; border-radius: 10px; font-weight: 700; font-size: 1.2rem; text-align: center; border: 2px solid #334155; color: #e2e8f0; opacity: 0; transform: translateY(30px); transition: opacity 0.5s ease, transform 0.5s ease; }
.card.is-visible { opacity: 1; transform: none; border-color: #3b82f6; }`,
        js: `// Set up IntersectionObserver to add .is-visible when cards scroll into view`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /IntersectionObserver/.test(js) && /is-visible/.test(js) && /unobserve/.test(js);
      }
    },
    {
      type: 'challenge',
      id: 'ch-active-nav',
      text: "Complete the active navigation: observe each `section[data-section]`. When a section intersects (with `rootMargin: '-40% 0px -50% 0px'`), find the nav link whose `data-target` matches and add `.is-active` to it. Remove `.is-active` from all other links.",
      hint: "In the callback: const id = entry.target.dataset.section; navLinks.forEach(l => l.classList.toggle('is-active', l.dataset.target === id));",
      defaultTab: 'js',
      startFiles: {
        html: `<nav class="nav" id="nav">
  <a data-target="one">One</a>
  <a data-target="two">Two</a>
  <a data-target="three">Three</a>
</nav>
<section data-section="one"><h2>Section One</h2></section>
<section data-section="two"><h2>Section Two</h2></section>
<section data-section="three"><h2>Section Three</h2></section>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }
.nav { position: sticky; top: 0; background: #1e293b; display: flex; gap: 4px; padding: 12px 20px; border-bottom: 1px solid #334155; }
.nav a { color: #64748b; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
.nav a.is-active { background: #3b82f620; color: #3b82f6; font-weight: 600; }
section { min-height: 80vh; padding: 60px 40px; border-bottom: 1px solid #1e293b; }
h2 { color: #38bdf8; }`,
        js: `const navLinks = document.querySelectorAll('[data-target]');

// Set up IntersectionObserver on sections to drive active nav link`
      },
      validate: (ctx) => {
        const js = ctx.files?.js || '';
        return /IntersectionObserver/.test(js) && /is-active/.test(js) && /data-section|dataset\.section/.test(js);
      }
    }
  ]
};
