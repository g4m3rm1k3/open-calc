export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-20-scroll-driven',
  title: '20. Scroll-Driven Animations',
  chapter: 'css-ch4',
  language: 'web',
  checkpoints: [
    { id: 'cp-scroll-driven', label: 'Scroll-Driven' },
    { id: 'cp-scroll-patterns', label: 'Scroll Patterns' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Elements that should reveal themselves as you scroll down. Traditionally this required JavaScript: IntersectionObserver, event listeners, class toggling, and careful cleanup. CSS scroll-driven animations do the same thing declaratively — no JavaScript — and run on the GPU compositor thread. Scroll-linked, not event-driven.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="hero">
    <h1>Scroll Down</h1>
    <p>Sections below should reveal as you scroll. Right now they just appear instantly. We'll fix this with CSS scroll-driven animations.</p>
  </div>
  <div class="sections">
    <div class="section">Section 1 — appears instantly</div>
    <div class="section">Section 2 — appears instantly</div>
    <div class="section">Section 3 — appears instantly</div>
    <div class="section">Section 4 — appears instantly</div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 24px;
  background: linear-gradient(160deg, #1e3a5f, #0f172a);
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  margin-bottom: 16px;
}

.hero p {
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 480px;
  line-height: 1.7;
}

.sections {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 40px;
  font-size: 1.1rem;
  color: #94a3b8;
  text-align: center;
  /* No animation yet — sections appear instantly */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'animation-timeline',
      defaultTab: 'css',
      text: "`animation-timeline: scroll()` links an animation's progress to the document's scroll position. As you scroll down, the animation plays forward. Stop scrolling, animation stops. Scroll back up, animation reverses. The most concrete example: a progress bar that fills as you scroll through the page.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="progress-bar"></div>
<div class="content">
  <div class="hero">
    <h1>Reading Progress</h1>
    <p>The blue bar at the top fills as you scroll. It's pure CSS — no JavaScript.</p>
  </div>
  <div class="article">
    <p>Scroll down to see the progress bar fill. The bar's width is linked directly to the scroll position via animation-timeline: scroll().</p>
    <p>This is a common UI pattern on long-form articles and documentation pages.</p>
    <p>The animation-timeline property replaces the scroll event listener pattern that required JavaScript, requestAnimationFrame, and careful cleanup.</p>
    <p>It runs on the compositor thread — the GPU — meaning it's smooth even when the main JavaScript thread is busy.</p>
    <p>Keep scrolling...</p>
    <p>The bar fills proportionally with how far you've scrolled through the document.</p>
    <p>Almost done.</p>
    <p>100% — you reached the bottom.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

/* The progress bar — fixed at the top */
@keyframes progress-grow {
  from { width: 0%; }
  to   { width: 100%; }
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  z-index: 100;
  /* Link animation progress to scroll position */
  animation: progress-grow linear;
  animation-timeline: scroll(); /* scroll() = document scroll */
}

.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
}

h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 16px; }
.hero p { font-size: 1.1rem; color: #94a3b8; max-width: 480px; line-height: 1.7; }

.article {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article p {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.8;
  padding: 20px 24px;
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #334155;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'scroll-function',
      defaultTab: 'css',
      text: "The `scroll()` function specifies WHICH scroller drives the animation. `scroll()` with no arguments uses the nearest scrolling ancestor (or the root). `scroll(root)` explicitly uses the root document scroll. `scroll(self)` uses the element's own scrollbar — useful for animating elements based on their own overflow scroll.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <div class="scroller-demo">
    <div class="scrollable-box">
      <div class="inner-progress"></div>
      <div class="scroll-content">
        <p>This box has its own scrollbar.</p>
        <p>The inner progress bar uses animation-timeline: scroll(self)</p>
        <p>It tracks THIS box's scroll, not the page scroll.</p>
        <p>Scroll inside this box to see it work.</p>
        <p>Keep scrolling...</p>
        <p>The bar grows as you scroll inside the box.</p>
        <p>Bottom of this scrollable area.</p>
      </div>
    </div>
    <p class="caption">scroll(self) — tracks the element's own scroll, not the page</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.scroller-demo { width: 100%; max-width: 400px; }

.scrollable-box {
  height: 280px;
  overflow-y: scroll;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  position: relative;
}

/* Progress bar inside the scrollable box */
@keyframes inner-progress {
  from { width: 0%; }
  to   { width: 100%; }
}

.inner-progress {
  position: sticky;
  top: 0;
  height: 4px;
  background: #10b981;
  z-index: 1;
  /* Tracks the scrollable-box's own scrollbar */
  animation: inner-progress linear;
  animation-timeline: scroll(self); /* THIS element's scroll */
}

.scroll-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scroll-content p {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.6;
  background: #0f172a;
  border-radius: 6px;
  padding: 12px;
}

.caption {
  margin-top: 12px;
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  font-family: monospace;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'view-function',
      defaultTab: 'css',
      text: "`animation-timeline: view()` links animation progress to the element's position in the viewport. As the element enters the viewport from below, the animation plays forward. As it exits the top, the animation continues (or reverses). This is the 'fade in on scroll' pattern — without a single line of JavaScript.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="spacer">↓ Scroll down to see cards reveal</div>
  <div class="cards">
    <div class="reveal-card">
      <h3>Card One</h3>
      <p>This card fades in as it enters the viewport from below.</p>
    </div>
    <div class="reveal-card">
      <h3>Card Two</h3>
      <p>Each card has its own view() timeline.</p>
    </div>
    <div class="reveal-card">
      <h3>Card Three</h3>
      <p>No JavaScript. No IntersectionObserver.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px;
}

.spacer {
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #334155;
  letter-spacing: 0.1em;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 80px;
}

@keyframes revealCard {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 32px;
  /* Link animation to this element's viewport position */
  animation: revealCard linear;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}

h3 { font-size: 1.2rem; margin-bottom: 12px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'animation-range',
      defaultTab: 'css',
      text: "`animation-range` maps the animation to a specific portion of the element's scroll timeline. `entry 0% entry 100%` means the animation plays as the element enters the viewport — from when the element's bottom enters the viewport bottom to when the element's top reaches the viewport top. `exit` maps to when the element leaves. `cover` is when the element fully covers the viewport.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="spacer">↓ Scroll</div>
  <div class="range-cards">
    <div class="range-card entry-range">
      <h3>entry 0% → entry 50%</h3>
      <p>Animation plays as the element's first half enters the viewport. Fast reveal at the bottom of the screen.</p>
    </div>
    <div class="range-card cover-range">
      <h3>cover 0% → cover 100%</h3>
      <p>Animation plays for the entire time the element is in view. Slow, parallax-like effect.</p>
    </div>
    <div class="range-card exit-range">
      <h3>exit 0% → exit 100%</h3>
      <p>Animation plays as the element exits the viewport at the top.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px;
}

.spacer {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #334155;
}

.range-cards {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 100px;
}

.range-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 32px;
}

h3 {
  font-family: monospace;
  font-size: 1rem;
  margin-bottom: 12px;
  color: #3b82f6;
}

p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }

@keyframes fade-slide {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dim-to-bright {
  from { opacity: 0.2; }
  to   { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-20px); }
}

.entry-range {
  animation: fade-slide linear;
  animation-timeline: view();
  animation-range: entry 0% entry 50%; /* reveals as bottom half enters */
}

.cover-range {
  animation: dim-to-bright linear;
  animation-timeline: view();
  animation-range: cover 0% cover 100%; /* entire time in viewport */
}

.exit-range {
  animation: fade-out linear;
  animation-timeline: view();
  animation-range: exit 0% exit 100%; /* as it exits at the top */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fade-in-on-scroll',
      defaultTab: 'css',
      text: "The complete, production-ready fade-in-on-scroll pattern in three lines of CSS. Define the keyframes once. Apply `animation-timeline: view()` and `animation-range: entry 0% entry 50%` to any element. Every element with these rules gets a reveal animation as it enters the viewport. No JavaScript. No configuration.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <header class="page-header">
    <h1>My Portfolio</h1>
    <p>Scroll down to see each section reveal</p>
  </header>
  <main>
    <div class="reveal section-a">
      <h2>About Me</h2>
      <p>A full-width section that fades in and slides up as it enters the viewport.</p>
    </div>
    <div class="reveal section-b">
      <h2>My Work</h2>
      <p>Another section with the same three-line animation pattern applied.</p>
    </div>
    <div class="reveal section-c">
      <h2>Contact</h2>
      <p>Last section. The pattern is composable — add the class and it just works.</p>
    </div>
  </main>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.page {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
}

h1 { font-size: clamp(2.5rem, 6vw, 4rem); margin-bottom: 16px; }
.page-header p { font-size: 1.1rem; color: #94a3b8; }

/* Define the reveal keyframes once */
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply to any element that should reveal on scroll */
.reveal {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% entry 50%;
}

/* Individual section styling */
.section-a, .section-b, .section-c {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 48px;
  margin-bottom: 32px;
}

.section-a { border-left: 4px solid #3b82f6; }
.section-b { border-left: 4px solid #6366f1; }
.section-c { border-left: 4px solid #10b981; }

h2 { font-size: 1.75rem; margin-bottom: 16px; }
p { font-size: 1rem; color: #94a3b8; line-height: 1.7; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'progress-bar',
      defaultTab: 'css',
      text: "A reading progress indicator is one of the most common scroll-driven animation use cases. The bar at the top fills as you read. Two steps: 1. Define `@keyframes progress { from { width: 0%; } to { width: 100%; } }`. 2. Apply `animation-timeline: scroll(root)` to the bar. The entire thing is five lines of CSS.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="reading-progress"></div>
<article class="article">
  <h1>How CSS Scroll-Driven Animations Work</h1>
  <p>The progress bar above fills as you read this article. It's five lines of CSS and zero JavaScript.</p>
  <p>CSS scroll-driven animations work by replacing the animation's time axis with a scroll axis. Instead of "0 seconds to 2 seconds", the animation runs from "0px scrolled to max scroll".</p>
  <p>The animation-timeline property is the key. Setting it to scroll() links the animation's playhead to the page's scroll position. The browser maps scroll progress (0–100%) to animation progress (0–100%).</p>
  <p>Because it runs on the compositor thread — the same thread as CSS transforms and opacity — it doesn't block the main JavaScript thread. It keeps running smoothly even during heavy JavaScript work.</p>
  <p>The scroll(root) argument explicitly references the root scrolling element (the document). You can also query a specific named container using scroll(nearest) or a named ancestor.</p>
  <p>For the reading progress bar pattern, you want the animation to run from when the user is at the very top of the page to when they're at the very bottom.</p>
  <p>Keep reading...</p>
  <p>The bar should now be nearly full.</p>
  <p>End of article — 100%.</p>
</article>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

/* Reading progress bar */
@keyframes progress {
  from { width: 0%; }
  to   { width: 100%; }
}

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #6366f1, #10b981);
  z-index: 999;
  /* 5 lines total: */
  animation: progress linear;
  animation-timeline: scroll(root);
}

.article {
  max-width: 640px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.2;
}

p {
  font-size: 1.05rem;
  color: #94a3b8;
  line-height: 1.8;
  padding: 20px 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'parallax',
      defaultTab: 'css',
      text: "Scroll-linked parallax: a background element moves at a slower speed than the content, creating depth. As the user scrolls down 200px, the background moves only 100px — it 'lags behind'. In CSS, use `animation-timeline: scroll()` to link a `transform: translateY()` to scroll progress, with a range that covers the full document scroll.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="parallax-hero">
  <div class="parallax-bg"></div>
  <div class="hero-content">
    <h1>Parallax Effect</h1>
    <p>The background gradient moves at a different speed than this text as you scroll.</p>
  </div>
</div>
<div class="content-section">
  <p>After the parallax hero, regular content continues here.</p>
  <p>The parallax effect only applies to the hero section background.</p>
  <p>Scroll back up to see it in action.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.parallax-hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Background element that moves at a different rate */
@keyframes parallax-move {
  from { transform: translateY(-20%); }
  to   { transform: translateY(20%); }
}

.parallax-bg {
  position: absolute;
  inset: -30%;
  background: linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 30%, #7c3aed 60%, #be185d 100%);
  /* Link movement to scroll — moves at a different rate than content */
  animation: parallax-move linear;
  animation-timeline: scroll(root);
  animation-range: cover 0% cover 100%;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
  max-width: 600px;
}

h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}

p {
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.7;
  text-shadow: 0 1px 8px rgba(0,0,0,0.5);
}

.content-section {
  max-width: 640px;
  margin: 0 auto;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-section p {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.7;
  background: #1e293b;
  border-radius: 8px;
  padding: 20px 24px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'browser-support',
      defaultTab: 'css',
      text: "Scroll-driven animations landed in Chrome/Edge 115 (July 2023), Firefox 110 (March 2023), and Safari 18. For older browsers, the animation simply doesn't run — elements appear in their final state without the reveal animation, which is acceptable. Use `@supports (animation-timeline: scroll())` for progressive enhancement if you need to provide a JavaScript fallback.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="support-demo">
  <h2>Progressive Enhancement Pattern</h2>
  <div class="cards">
    <div class="card safe-reveal">
      <h3>Graceful Fallback</h3>
      <p>Old browsers see this card fully visible (no animation). Modern browsers get the scroll-reveal effect. Neither breaks.</p>
    </div>
    <div class="card safe-reveal">
      <h3>@supports Check</h3>
      <p>Wrap in @supports (animation-timeline: scroll()) to explicitly detect support and provide an alternative.</p>
    </div>
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

.support-demo {
  max-width: 640px;
  width: 100%;
}

h2 { font-size: 1.3rem; margin-bottom: 24px; color: #94a3b8; }

.cards { display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 28px;
}

h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }

@keyframes card-reveal {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Only apply scroll-driven animations if the browser supports them */
@supports (animation-timeline: scroll()) {
  .safe-reveal {
    animation: card-reveal linear;
    animation-timeline: view();
    animation-range: entry 0% entry 50%;
  }
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-scroll-driven'
    },
    {
      type: 'narration',
      id: 'sticky-progress',
      defaultTab: 'css',
      text: "A sticky header that transitions from transparent to solid as you scroll past the hero — a ubiquitous UI pattern. Without scroll-driven animations, this requires a JavaScript scroll listener. With CSS: link `background-color` and `box-shadow` to the scroll position using an animation with a capped range of just the first 100px of scroll.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<header class="site-header">
  <span class="logo">MySite</span>
  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Work</a>
  </nav>
</header>
<main>
  <div class="hero">
    <h1>Scroll Up to See the Header</h1>
    <p>The header starts transparent. As you scroll down, it transitions to a solid dark background with a shadow.</p>
  </div>
  <div class="content">
    <p>More content here. The header is now solid.</p>
    <p>Scroll back to the top to see it become transparent again.</p>
  </div>
</main>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

/* Header starts transparent, transitions to solid on scroll */
@keyframes header-solidify {
  from {
    background-color: transparent;
    box-shadow: none;
  }
  to {
    background-color: rgba(15, 23, 42, 0.95);
    box-shadow: 0 1px 0 #334155, 0 4px 20px rgba(0,0,0,0.4);
  }
}

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* Link solidification to first 100px of scroll */
  animation: header-solidify linear;
  animation-timeline: scroll(root);
  animation-range: 0px 120px; /* runs only over the first 120px of scroll */
}

.logo {
  font-weight: 700;
  font-size: 1.2rem;
}

nav { display: flex; gap: 24px; }
nav a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; }
nav a:hover { color: #f8fafc; }

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 24px 60px;
  background: linear-gradient(160deg, #1e3a5f, #0f172a);
}

h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 20px; line-height: 1.2; }
.hero p { font-size: 1.1rem; color: #94a3b8; max-width: 480px; line-height: 1.7; }

.content {
  max-width: 640px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content p {
  font-size: 1rem;
  color: #94a3b8;
  background: #1e293b;
  border-radius: 8px;
  padding: 20px 24px;
  line-height: 1.7;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'when-to-use-js',
      defaultTab: 'css',
      text: "CSS scroll-driven animations excel at: progress bars, reveal-on-scroll effects, parallax, and sticky header transitions. Reach for JavaScript when you need: 'animate once, stay revealed permanently even when scrolled back'; trigger logic based on data or user state; complex conditional behavior (only reveal if a prerequisite is met). CSS handles continuous scroll-linked rendering. JavaScript handles one-time state changes and logic.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="guide">
  <h2>CSS vs JavaScript for Scroll</h2>
  <div class="table">
    <div class="row header">
      <span>Use Case</span><span>CSS scroll-driven</span><span>JavaScript</span>
    </div>
    <div class="row">
      <span>Progress bar</span>
      <span class="yes">✓ Perfect fit</span>
      <span class="ok">Works</span>
    </div>
    <div class="row">
      <span>Reveal on scroll (reverses)</span>
      <span class="yes">✓ Perfect fit</span>
      <span class="ok">Works</span>
    </div>
    <div class="row">
      <span>Reveal once (stays revealed)</span>
      <span class="no">Not supported</span>
      <span class="yes">✓ Use JS</span>
    </div>
    <div class="row">
      <span>Parallax effect</span>
      <span class="yes">✓ Perfect fit</span>
      <span class="ok">Works</span>
    </div>
    <div class="row">
      <span>Animate only if data condition met</span>
      <span class="no">Not possible</span>
      <span class="yes">✓ Use JS</span>
    </div>
    <div class="row">
      <span>Sticky header on scroll</span>
      <span class="yes">✓ Perfect fit</span>
      <span class="ok">Works</span>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.guide { max-width: 640px; }
h2 { font-size: 1.3rem; margin-bottom: 20px; }

.table {
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  padding: 12px 16px;
  border-bottom: 1px solid #334155;
  gap: 8px;
  align-items: center;
}

.row:last-child { border-bottom: none; }
.row:nth-child(even) { background: rgba(255,255,255,0.02); }

.header {
  background: #334155 !important;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.row span { font-size: 0.85rem; color: #94a3b8; }

.yes { color: #6ee7b7 !important; font-weight: 600; }
.ok  { color: #fcd34d !important; }
.no  { color: #fca5a5 !important; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-scroll-patterns'
    },
    {
      type: 'challenge',
      id: 'ch-progress-bar',
      text: "Create a reading progress bar that fills from 0% to 100% as the user scrolls from top to bottom of the page. Use `animation-timeline: scroll()`. The bar should be fixed at the top of the page.",
      hint: "Define `@keyframes fill { from { width: 0%; } to { width: 100%; } }`. Apply `animation: fill linear; animation-timeline: scroll();` to a fixed-position bar at the top.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Progress bar goes here -->
<div class="progress-bar"></div>

<div class="content">
  <h1>A Long Article</h1>
  <p>Scroll down to see the progress bar fill. Make the bar fill from 0% to 100% as you scroll the page.</p>
  <p>More content here...</p>
  <p>Keep scrolling...</p>
  <p>Almost there...</p>
  <p>Last paragraph — bar should be full.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

/* Define @keyframes for the progress fill */

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: #3b82f6;
  /* Add animation-timeline: scroll() here */
}

.content {
  max-width: 640px;
  margin: 0 auto;
  padding: 60px 24px 200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 { font-size: 2rem; }
p {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.7;
  background: #1e293b;
  padding: 20px 24px;
  border-radius: 8px;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasScrollTimeline = /animation-timeline\s*:\s*scroll/.test(css);
        const hasKeyframes = /@keyframes/.test(css);
        const hasWidthInKeyframes = /@keyframes[^{]*\{[^@]*width/.test(css.replace(/\n/g, ' '));
        return hasScrollTimeline && hasKeyframes && hasWidthInKeyframes;
      }
    },
    {
      type: 'challenge',
      id: 'ch-reveal',
      text: "Make at least 3 content sections fade in as they enter the viewport. Each section should start invisible (opacity: 0) and become fully visible as it enters. Use `animation-timeline: view()` with an appropriate `animation-range`.",
      hint: "Define `@keyframes reveal { from { opacity: 0; } to { opacity: 1; } }`. Apply to each `.section`: `animation: reveal linear; animation-timeline: view(); animation-range: entry 0% entry 60%;`.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <div class="spacer">↓ Scroll down</div>
  <div class="section">
    <h2>Section One</h2>
    <p>This should fade in as it enters the viewport.</p>
  </div>
  <div class="section">
    <h2>Section Two</h2>
    <p>This should also fade in on scroll.</p>
  </div>
  <div class="section">
    <h2>Section Three</h2>
    <p>And this one too.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 24px 120px;
}

.spacer {
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #334155;
}

/* Define @keyframes for the reveal animation */

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 32px;
  /* Add animation-timeline: view() here */
}

h2 { font-size: 1.5rem; margin-bottom: 12px; }
p { font-size: 1rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasViewTimeline = /animation-timeline\s*:\s*view\s*\(\s*\)/.test(css);
        const hasKeyframes = /@keyframes/.test(css);
        const hasOpacity = /opacity/.test(css);
        return hasViewTimeline && hasKeyframes && hasOpacity;
      }
    }
  ]
};
