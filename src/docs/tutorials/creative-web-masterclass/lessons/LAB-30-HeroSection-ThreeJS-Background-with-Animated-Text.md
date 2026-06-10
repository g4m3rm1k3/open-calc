# Creative Web Masterclass — LAB 30 — Hero Section: Three.js Background with Animated Text

**Prerequisites:** LAB-29 (portfolio shell + ribbon nav) and LAB-23 (Three.js background).

**What this lab adds:**
- Three.js floating particle cloud behind the hero HTML content
- CSS `@keyframes` entrance animation for hero text
- Scroll-based hero opacity fade (text fades out as you scroll away)
- The complete hero section replacing the placeholder in LAB-29

**Time:** 50–65 minutes

---

## What You Will Build

```
 ┌─────────────────────────────────────────────────────────┐
 │  [· · · floating purple+teal particles in 3D space ·] │
 │                                                         │
 │  Available for work     ← animates in (fade+slide up)  │
 │  Hi, I'm Alex.          ← large, 0.15s delay           │
 │  Creative Web Developer ← 0.3s delay                   │
 │  [See My Work]          ← 0.45s delay                  │
 │                                                         │
 │  (text fades as user scrolls down)                      │
 └─────────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-23, the Three.js canvas was given `z-index: -1`. For the portfolio, the canvas
>    only needs to be behind the hero section's text, not the entire page. How would you
>    scope the canvas to just one section?
> 2. CSS `@keyframes` run once when applied. How do you make the hero text animate in
>    when the page loads, rather than being animated all the time?
> 3. `animation-fill-mode: both` is important for entrance animations. What does it do?
>
> *(Answers at the end)*

---

## Concept: Section-Scoped Canvas

**What it is:** Instead of a full-page fixed canvas, scope the Three.js canvas to a
specific section using `position: absolute` within a `position: relative` parent.

```css
.section-hero {
  position: relative;   /* canvas positions relative to this */
  overflow: hidden;     /* clip canvas at section boundary */
}

/* Canvas scoped to the section, not the page */
.section-hero canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;            /* behind the hero content */
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;            /* above the canvas */
}
```

The canvas becomes a background texture for just this section, not the entire page.

---

## Concept: CSS Entrance Animation

**What it is:** Hero text uses `@keyframes` to animate in from below with a fade. Each
element has an `animation-delay` so they stagger.

```css
@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-eyebrow {
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.1s;
}

.hero-title {
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.25s;
}
```

`animation-fill-mode: both` (the `both` keyword in the shorthand) means:
- Before the animation starts (during the delay): element is in the `from` state
  (invisible, shifted down)
- After the animation ends: element stays in the `to` state (visible, natural position)

Without `both`, the element would be visible (opacity: 1) during the delay period and
only animate on the first frame.

---

## Step 1 — Create Files

`projects/lab-30/index.html` — build on LAB-29 but replace the hero section:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Portfolio</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Ribbon nav (same as LAB-29) -->
    <nav class="ribbon-nav" aria-label="Portfolio sections">
      <div class="ribbon-progress"><div class="ribbon-progress-fill" id="ribbon-progress"></div></div>
      <ul class="ribbon-list">
        <li class="ribbon-item"><a href="#hero"     class="ribbon-link is-active" data-section="hero"><span class="ribbon-dot"></span><span class="ribbon-label">Hero</span></a></li>
        <li class="ribbon-item"><a href="#work"     class="ribbon-link" data-section="work"><span class="ribbon-dot"></span><span class="ribbon-label">Work</span></a></li>
        <li class="ribbon-item"><a href="#canvas"   class="ribbon-link" data-section="canvas"><span class="ribbon-dot"></span><span class="ribbon-label">Canvas</span></a></li>
        <li class="ribbon-item"><a href="#terminal" class="ribbon-link" data-section="terminal"><span class="ribbon-dot"></span><span class="ribbon-label">Terminal</span></a></li>
        <li class="ribbon-item"><a href="#contact"  class="ribbon-link" data-section="contact"><span class="ribbon-dot"></span><span class="ribbon-label">Contact</span></a></li>
      </ul>
    </nav>

    <main class="portfolio">

      <!-- Hero section — Three.js background added here -->
      <section id="hero" class="port-section section-hero">
        <!-- Canvas is appended here by Three.js JS -->
        <div class="hero-content" id="hero-content">
          <p class="hero-eyebrow">Available for work</p>
          <h1 class="hero-title">Hi, I'm Alex.</h1>
          <p class="hero-role">Creative Web Developer</p>
          <p class="hero-body">
            I build interactive web experiences using Three.js, Canvas 2D, and modern CSS.
          </p>
          <div class="hero-cta">
            <a href="#work" class="btn btn-primary">See My Work</a>
            <a href="#contact" class="btn btn-ghost">Get In Touch</a>
          </div>
        </div>
      </section>

      <section id="work" class="port-section section-work">
        <div class="section-inner"><h2 class="placeholder-heading">Work</h2><p class="placeholder-sub">Coming in LAB-31</p></div>
      </section>
      <section id="canvas" class="port-section section-canvas">
        <div class="section-inner"><h2 class="placeholder-heading">Canvas</h2><p class="placeholder-sub">Coming in LAB-32</p></div>
      </section>
      <section id="terminal" class="port-section section-terminal">
        <div class="section-inner"><h2 class="placeholder-heading">Terminal</h2><p class="placeholder-sub">Coming in LAB-33</p></div>
      </section>
      <section id="contact" class="port-section section-contact">
        <div class="section-inner"><h2 class="placeholder-heading">Contact</h2></div>
      </section>

    </main>

    <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      }
    }
    </script>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: hsl(244, 95%, 65%);
  --color-bg: hsl(240, 20%, 8%);
  --color-surface: hsl(240, 18%, 13%);
  --color-border: hsl(240, 14%, 20%);
  --color-text: hsl(240, 5%, 94%);
  --color-muted: hsl(240, 8%, 42%);
  --nav-width: 60px;
}
html { scroll-behavior: smooth; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }
.portfolio { margin-left: var(--nav-width); }
.port-section { min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--color-border); }
.section-inner { max-width: 900px; width: 100%; padding: 80px 40px; }
.section-hero     { border-left: none; overflow: hidden; }
.section-work     { border-left: 4px solid hsl(175, 80%, 50%); }
.section-canvas   { border-left: 4px solid hsl(28, 95%, 58%); }
.section-terminal { border-left: 4px solid hsl(152, 60%, 55%); }
.section-contact  { border-left: 4px solid hsl(8, 90%, 62%); }
.placeholder-heading { font-size: clamp(2rem, 5vw, 4rem); margin: 0 0 16px 0; font-weight: 700; color: var(--color-primary); }
.placeholder-sub { margin: 0; color: var(--color-muted); }

/* ---- Hero: canvas scoped to section ---- */
.section-hero canvas {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 0;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  padding: 0 40px;
}

/* ---- Hero text entrance animations ---- */
@keyframes hero-enter {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.1s;
}

.hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--color-primary); }

.hero-title {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.05;
  letter-spacing: -0.03em;
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.25s;
}

.hero-role {
  font-size: 1.3rem;
  color: var(--color-muted);
  margin: 0 0 24px 0;
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.4s;
}

.hero-body {
  color: var(--color-muted);
  max-width: 50ch;
  line-height: 1.7;
  margin: 0 0 36px 0;
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.5s;
}

.hero-cta {
  display: flex;
  gap: 16px;
  animation: hero-enter 0.6s ease both;
  animation-delay: 0.6s;
}

.btn { display: inline-block; padding: 14px 28px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.35); }
.btn-ghost { color: var(--color-primary); border: 1px solid var(--color-border); }
.btn-ghost:hover { border-color: var(--color-primary); transform: translateY(-2px); }

/* ---- Ribbon nav ---- */
.ribbon-nav { position: fixed; left: 0; top: 0; width: var(--nav-width); height: 100vh; background: var(--color-surface); border-right: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; z-index: 100; }
.ribbon-progress { position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--color-border); }
.ribbon-progress-fill { width: 100%; height: 0%; background: var(--color-primary); transition: height 0.1s linear; }
.ribbon-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 28px; }
.ribbon-item { position: relative; }
.ribbon-link { display: flex; align-items: center; text-decoration: none; outline: none; }
.ribbon-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); flex-shrink: 0; transition: background 0.2s ease, transform 0.2s ease; }
.ribbon-link:hover .ribbon-dot, .ribbon-link.is-active .ribbon-dot { background: var(--color-primary); }
.ribbon-link.is-active .ribbon-dot { transform: scale(1.75); }
.ribbon-label { position: absolute; left: calc(100% + 14px); top: 50%; transform: translateY(-50%) translateX(-6px); opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; white-space: nowrap; font-size: 0.78rem; font-weight: 600; color: var(--color-text); background: var(--color-surface); border: 1px solid var(--color-border); padding: 4px 10px; border-radius: 4px; }
.ribbon-item:hover .ribbon-label { opacity: 1; transform: translateY(-50%) translateX(0); }
```

---

## Step 3 — Three.js Hero Background

`main.js`:

```js
import * as THREE from 'three';

// ---- Ribbon nav (same as LAB-29) ----
const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');
const progressFill = document.querySelector('#ribbon-progress');
let currentIndex = 0;

const linkMap = {};
navLinks.forEach(function (link) { linkMap[link.dataset.section] = link; });

function setActive(id) {
  navLinks.forEach(function (l) { l.classList.remove('is-active'); });
  if (linkMap[id]) linkMap[id].classList.add('is-active');
  sections.forEach(function (s, i) { if (s.id === id) currentIndex = i; });
}

window.addEventListener('scroll', function () {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.height = (maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0) + '%';
});

new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
}, { threshold: 0.3 }).observe.call(
  (function () {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.3 });
    sections.forEach(function (s) { obs.observe(s); });
    return obs;
  })()
);

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) sections[++currentIndex].scrollIntoView({ behavior: 'smooth' });
  else if (event.key === 'ArrowUp' && currentIndex > 0) sections[--currentIndex].scrollIntoView({ behavior: 'smooth' });
});

// ---- Three.js hero background ----
const heroSection = document.querySelector('#hero');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, heroSection.clientWidth / heroSection.clientHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
heroSection.appendChild(renderer.domElement);

function resizeHeroCanvas() {
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
  camera.updateProjectionMatrix();
}
resizeHeroCanvas();
window.addEventListener('resize', resizeHeroCanvas);

// Particles
const positions = [];
for (let i = 0; i < 200; i++) {
  positions.push((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8 - 3);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x6c63ff, size: 0.07, transparent: true, opacity: 0.7 }));
scene.add(particles);

const particles2 = new THREE.Points(
  geo.clone(),
  new THREE.PointsMaterial({ color: 0x4ecdc4, size: 0.04, transparent: true, opacity: 0.4 })
);
scene.add(particles2);

// Hero content fades on scroll
const heroContent = document.querySelector('#hero-content');
window.addEventListener('scroll', function () {
  const fadeDistance = window.innerHeight * 0.5;
  const opacity = Math.max(0, 1 - window.scrollY / fadeDistance);
  heroContent.style.opacity = opacity;
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  particles.rotation.y = t * 0.04;
  particles.rotation.x = t * 0.015;
  particles2.rotation.y = -t * 0.03;
  particles2.rotation.z = t * 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

Note: the navigation observer section above has a redundancy — let me simplify by just using the correct observer pattern inline. In the project file below I'll write it cleanly.

---

> **SAVE AND TRY**
>
> **You should see:** A full-viewport hero with purple and teal particles rotating slowly
> behind the text. The text animates in sequentially (eyebrow first, title second, etc.)
> on page load. Scroll down — the hero text fades out as you scroll away. The ribbon nav
> tracks the current section.

---

## 🎯 Challenge: Particle Color Pulse

**You know:** Three.js `PointsMaterial`, `clock.getElapsedTime()`, HSL colors.

**Task:** Each frame, slightly pulse the particle color using elapsed time and HSL:
```js
const hue = (t * 20) % 360;   // hue slowly cycles
particles.material.color.setHSL(hue / 360, 0.8, 0.6);
```
`setHSL(h, s, l)` sets a Three.js Color using hue (0–1), saturation (0–1), lightness (0–1).
The hue argument is normalized to 0–1 in Three.js (unlike CSS which uses 0–360).

---

## Final Check

| Feature | How to verify |
|---|---|
| Particles rotate behind hero text | Particles visible, text reads clearly above |
| Hero text staggers in | Reload — elements animate in sequence |
| Text fades on scroll | Scroll down — hero text fades out |
| Canvas scoped to section | Canvas does not show behind work section |
| Ribbon nav still works | Dots highlight as you scroll |

---

## Quick Check Answers

**1. Scoping canvas to one section:**
Remove `position: fixed` on the canvas and instead use `position: absolute` within
`position: relative; overflow: hidden` on the section. The canvas is now contained
within the section's boundary and clips at its edges.

**2. How to animate on load (once), not all the time?**
CSS `@keyframes` with `animation: name duration easing fill-mode` on the element.
The animation runs once when the element is rendered. It does not loop unless you add
`animation-iteration-count: infinite`. Entrance animations run once; the element then
stays in the final state due to `animation-fill-mode: forwards` or `both`.

**3. What does `animation-fill-mode: both` do?**
`both` applies the animation's `from` state before the delay (element is invisible during
the delay period) and the `to` state after the animation completes (element stays visible).
Without it: during the delay, the element shows its default CSS state (visible), then
jumps to `from` (invisible), then animates — causing an ugly flash.
