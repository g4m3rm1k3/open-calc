---
series: css-responsive
level: 7
title: A Complete Responsive Page
lang: css
---

# A Complete Responsive Page

Every technique from this series combines in a real page layout: mobile-first base, media query for the two-column layout, fluid typography with `clamp()`, responsive images with `aspect-ratio`, an auto-fit grid, and container queries on the cards. This is what production responsive CSS looks like.

## The page structure — mobile first

Start with the mobile layout. Everything stacks. Navigation is vertical. One-column content.

```html
<div class="page">
  <header class="site-header">
    <div class="header-brand">⚡ UpskillOS</div>
    <nav class="header-nav">
      <a class="nav-link" href="#">Courses</a>
      <a class="nav-link" href="#">Labs</a>
      <a class="nav-link active" href="#">Pro</a>
    </nav>
  </header>
  <div class="hero">
    <div class="hero-content">
      <h1 class="hero-title">Learn to code for real</h1>
      <p class="hero-sub">Not just syntax — the ideas behind every line. Interactive lessons, live code, real feedback.</p>
      <div class="hero-actions">
        <button class="btn-primary">Start Free</button>
        <button class="btn-ghost">Browse Courses</button>
      </div>
    </div>
    <div class="hero-visual">
      <div class="code-preview">
        <div class="code-line"><span class="kw">def</span> <span class="fn">greet</span>(name):</div>
        <div class="code-line pad">  <span class="kw">return</span> <span class="str">f"Hello, {name}!"</span></div>
        <div class="code-line"><span class="fn">print</span>(greet(<span class="str">"World"</span>))</div>
        <div class="code-output">→ Hello, World!</div>
      </div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; }
/* Mobile base */
.page { padding: 0; }
.site-header { background: #1e293b; padding: 14px 16px; }
.header-brand { color: #818cf8; font-weight: 800; font-size: 1rem; margin-bottom: 10px; }
.header-nav { display: flex; gap: 4px; flex-wrap: wrap; }
.nav-link { color: #94a3b8; text-decoration: none; padding: 6px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.nav-link.active { color: #818cf8; background: #1e1b4b; }
.hero { padding: 24px 16px; display: flex; flex-direction: column; gap: 20px; }
.hero-title { color: #e2e8f0; font-size: clamp(1.75rem, 5vw, 2.5rem); margin: 0 0 12px; line-height: 1.15; }
.hero-sub { color: #94a3b8; font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.7; margin: 0 0 20px; }
.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-primary { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px; }
.hero-visual { background: #1e293b; border-radius: 12px; padding: 20px; }
.code-preview { font-family: 'Fira Code', monospace; font-size: 13px; display: flex; flex-direction: column; gap: 4px; }
.code-line { color: #e2e8f0; }
.kw  { color: #a78bfa; }
.fn  { color: #60a5fa; }
.str { color: #86efac; }
.code-output { color: #4ade80; margin-top: 8px; border-top: 1px solid #334155; padding-top: 8px; font-size: 12px; }
/* Wide — side by side */
@media (min-width: 768px) {
  .site-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; }
  .header-brand { margin-bottom: 0; }
  .hero { flex-direction: row; align-items: center; padding: 40px 32px; }
  .hero-content { flex: 1; }
  .hero-visual { flex: 1; }
}
```

## The course grid section — intrinsic responsive

The courses section uses `auto-fit` with `minmax()` — no grid-specific media queries needed. Container queries on each card adapt their internal layout.

```html
<section class="courses-section">
  <h2 class="section-title">Featured Courses</h2>
  <div class="course-grid">
    <div class="course-wrap">
      <article class="course-card">
        <div class="course-thumb">🐍</div>
        <div class="course-body">
          <h3 class="course-name">Python Fundamentals</h3>
          <p class="course-desc">From variables to virtual environments.</p>
          <div class="course-meta">36 levels · Beginner</div>
        </div>
        <button class="course-btn">Start</button>
      </article>
    </div>
    <div class="course-wrap">
      <article class="course-card">
        <div class="course-thumb">🎨</div>
        <div class="course-body">
          <h3 class="course-name">CSS Mastery</h3>
          <p class="course-desc">Flexbox, Grid, animations, and responsive design.</p>
          <div class="course-meta">60+ levels · Beginner</div>
        </div>
        <button class="course-btn">Start</button>
      </article>
    </div>
    <div class="course-wrap">
      <article class="course-card">
        <div class="course-thumb">⚡</div>
        <div class="course-body">
          <h3 class="course-name">JavaScript</h3>
          <p class="course-desc">Closures, async/await, and the event loop.</p>
          <div class="course-meta">10 levels · Intermediate</div>
        </div>
        <button class="course-btn">Start</button>
      </article>
    </div>
  </div>
</section>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; }
.courses-section { padding: 24px 16px; }
@media (min-width: 768px) { .courses-section { padding: 40px 32px; } }
.section-title { color: #e2e8f0; font-size: clamp(1.25rem, 3vw, 1.75rem); margin: 0 0 20px; }
/* Intrinsic grid — no media queries */
.course-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
/* Container on each card wrapper */
.course-wrap { container-type: inline-size; }
/* Card — compact by default */
.course-card { background: #1e293b; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.course-thumb { font-size: 2rem; }
.course-body { flex: 1; }
.course-name { color: #e2e8f0; font-size: 14px; font-weight: 700; margin: 0 0 6px; }
.course-desc { color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px; }
.course-meta { color: #475569; font-size: 11px; font-weight: 600; }
.course-btn { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; align-self: flex-start; }
/* Wide card — horizontal layout via container query */
@container (min-width: 300px) {
  .course-card { flex-direction: row; align-items: center; }
  .course-thumb { font-size: 2.5rem; flex-shrink: 0; }
  .course-btn { margin-left: auto; flex-shrink: 0; }
}
```

**CS lens:** This page uses three distinct responsive mechanisms simultaneously: `@media` for the page-level two-column switch, `auto-fit`+`minmax` for the grid's column count (intrinsic), and `@container` for the card's internal layout. Each mechanism operates at a different level of the component hierarchy — page, grid, component. This separation of concerns is what makes the CSS maintainable.

**SE lens:** This is the production pattern. Build the mobile layout as the default. Add media queries only for structural layout changes. Use intrinsic sizing for collections. Use container queries for component-level responsiveness. The result: a page that works everywhere, with CSS that is easy to reason about at each level.

**Common mistakes:**
- Writing a media query for every element — leads to 10+ breakpoints scattered across the file. Define 2-3 structural breakpoints, use intrinsic layout everywhere else.
- Mixing `px` and `vw` units without `clamp()` — text either overflows on narrow screens or becomes tiny on wide ones.

**Debug tip:** The Chrome DevTools device toolbar has a "Responsive" mode where you can drag to resize. Watch the grid reflow as you drag — you should see it reflow smoothly with no sudden jumps (except at your structural media query breakpoints).

**Next:** CSS Animations — transitions, transforms, and keyframes for motion that enhances (not distracts from) the user experience.

## Challenge: full_responsive

Style a card with responsive typography and a container query.

1. `.page` — `padding: 16px`
2. `.title` — `font-size: clamp(1.25rem, 3vw, 2rem)`, `color: #e2e8f0`
3. `.card-wrap` — `container-type: inline-size`
4. `@container (min-width: 350px)` — `.card` `flex-direction: row`

```html
<div class="page">
  <h1 class="title">Responsive Page</h1>
  <div class="card-wrap">
    <div class="card">
      <div id="ci" style="background:#6366f1;color:white;padding:16px;border-radius:8px;font-size:1.5rem;text-align:center;">📘</div>
      <div id="cb" style="padding:12px;">
        <div style="color:#e2e8f0;font-weight:700;margin-bottom:4px;">Course Title</div>
        <div style="color:#64748b;font-size:13px;">Course description.</div>
      </div>
    </div>
  </div>
</div>
```

```challenge
body { background: #0f172a; font-family: system-ui; }

.page {
  /* add padding */
}

.title {
  margin: 0 0 16px;
  /* add font-size with clamp() and color */
}

.card-wrap {
  /* add container-type */
}

.card {
  background: #1e293b;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* add @container query for row layout at 350px */
```

```test
var page  = getComputedStyle(document.querySelector('.page'))
var title = getComputedStyle(document.querySelector('.title'))
var wrap  = getComputedStyle(document.querySelector('.card-wrap'))
assert parseFloat(page.padding) >= 12
assert parseFloat(title.fontSize) >= 20
assert wrap.containerType === 'inline-size'
var rules = Array.from(document.styleSheets[0].cssRules)
var hasContainer = rules.some(r => r.constructor.name === 'CSSContainerRule')
assert hasContainer
```
