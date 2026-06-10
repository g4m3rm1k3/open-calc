# Creative Web Masterclass — LAB 23 — Three Background: Canvas Behind HTML Content

**Prerequisites:** LAB-22. You know scene/camera/renderer and the full Three.js setup.

**What this lab adds:**
- Positioning the Three.js `<canvas>` as a fixed background behind HTML
- `alpha: true` renderer option — transparent Three.js canvas background
- HTML overlay content scrolling over the 3D scene
- `pointer-events: none` on the canvas so HTML links remain clickable
- The foundation pattern for the portfolio hero (LAB-30)

**Time:** 40–50 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  [Three.js scene: floating particles, fixed position] │
 │                                                      │
 │  ┌────────────────────────────────┐                  │
 │  │  PORTFOLIO                     │ ← HTML content   │
 │  │  Creative Web Developer        │   scrolls over   │
 │  │  [View Projects ↓]             │   the 3D scene   │
 │  └────────────────────────────────┘                  │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. A `<canvas>` is a normal block element. How do you make it stay fixed behind all
>    other page content, not scrolling with the page?
> 2. If the canvas is behind the HTML, how can the user still click on HTML links and
>    buttons even though the canvas is on top of nothing?
> 3. Three.js fills the canvas background with the scene's background color by default.
>    How would you make the canvas background transparent so the page's CSS background
>    shows through instead?
>
> *(Answers at the end)*

---

## Concept: Fixed-Position Background Canvas

**What it is:** By giving the Three.js canvas `position: fixed; top: 0; left: 0; z-index: -1`,
it stays locked to the viewport and renders behind all other content.

```css
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;           /* render behind all other content */
  pointer-events: none;  /* click-through — HTML elements remain clickable */
}
```

HTML content scrolls normally on top of this fixed canvas.

**`pointer-events: none`:** Disables all mouse interaction on the canvas element. Without
this, the canvas intercepts all mouse events (preventing clicks on HTML buttons and links
below). With it, mouse events pass through to whatever is below.

**Three.js `alpha: true`:**

```js
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);   // clear color with alpha 0 = fully transparent
```

`alpha: true` enables transparency in the WebGL context. `setClearColor(color, 0)` sets
the alpha of the clear color to 0, making the canvas background fully transparent.
The CSS `background` of `<body>` shows through.

---

## Step 1 — Create Files

`projects/lab-23/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 23 — Three Background</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Three.js renders here — JavaScript appends the <canvas> to <body> -->
    <!-- CSS positions it as a fixed background -->

    <!-- HTML overlay content scrolls over the 3D background -->
    <main class="page">

      <section class="hero-section">
        <div class="hero-content">
          <p class="hero-label">Creative Web Developer</p>
          <h1 class="hero-title">Building the Future<br>with Code</h1>
          <a href="#work" class="cta-btn">View My Work</a>
        </div>
      </section>

      <section class="content-section" id="work">
        <h2>Projects</h2>
        <div class="card-grid">
          <div class="card">
            <h3>Portfolio Site</h3>
            <p>Three.js background, scroll sections, and a particle system.</p>
          </div>
          <div class="card">
            <h3>Canvas Engine</h3>
            <p>A 2D particle physics engine built entirely with Canvas 2D API.</p>
          </div>
          <div class="card">
            <h3>3D Visualizer</h3>
            <p>An interactive data visualization with raycasting and orbit controls.</p>
          </div>
        </div>
      </section>

      <section class="content-section">
        <h2>About</h2>
        <p>I build creative web experiences using CSS, JavaScript, and Three.js.</p>
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
  --color-primary: #6c63ff;
  --color-bg: #0d0d1a;
  --color-surface: rgba(22, 22, 40, 0.7);
  --color-border: rgba(42, 42, 74, 0.6);
  --color-text: #e8e8f0;
  --color-muted: #7070a0;
}

/* ---- Base ---- */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

/* ---- Three.js canvas: fixed behind all content ---- */
canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;   /* HTML elements remain interactive */
}

/* ---- Page layout ---- */
.page { position: relative; }

/* ---- Hero section ---- */
.hero-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content { text-align: center; }

.hero-label {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0 0 16px 0;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  margin: 0 0 32px 0;
  line-height: 1.1;
  font-weight: 700;
}

.cta-btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background 0.2s ease, transform 0.2s ease;
}

.cta-btn:hover { background: #5550dd; transform: translateY(-2px); }

/* ---- Content sections ---- */
.content-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 24px;
}

.content-section h2 {
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0 0 40px 0;
}

.content-section p {
  color: var(--color-muted);
  line-height: 1.7;
  max-width: 60ch;
}

/* ---- Card grid ---- */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 28px;
  backdrop-filter: blur(12px);   /* frosted glass — blurs the Three.js background */
}

.card h3 { margin: 0 0 12px 0; font-size: 1.1rem; }
.card p { margin: 0; color: var(--color-muted); font-size: 0.9rem; line-height: 1.5; }
```

`.card { backdrop-filter: blur(12px) }` is glassmorphism — the card blurs whatever is
behind it (the Three.js canvas), creating a frosted glass effect. This looks stunning
when 3D content is moving behind the cards.

---

> **CSS AND SEE**
>
> **You should see:** A dark page with a hero section and cards. The cards have visible
> border and slight translucency. No Three.js yet — the canvas will be added by JavaScript.
> Scroll down to see the cards and about section.

---

## Step 3 — Three.js Background

`main.js`:

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
// No scene.background — we want transparency, handled by renderer

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// alpha: true enables WebGL alpha channel — required for transparency
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);   // clear color: black, alpha 0 = transparent
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

`alpha: true` in the constructor enables transparency. `setClearColor(0x000000, 0)`
sets the background clear color to black with alpha=0 (fully transparent). Without the
second argument `0`, the alpha defaults to `1` (opaque) even with `alpha: true`.

---

> **SAVE AND TRY**
>
> **You should see:** The same HTML page as before — the canvas is added but transparent.
> In DevTools Elements, find the `<canvas>` — it should be the first child of `<body>`.
> CSS positions it fixed behind the HTML content.

---

## Step 4 — Add Floating Particles

```js
// Floating particles in the background
const PARTICLE_COUNT = 150;
const particleGeometry = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions.push(
    (Math.random() - 0.5) * 20,   // x: spread across 20 units
    (Math.random() - 0.5) * 12,   // y: spread across 12 units
    (Math.random() - 0.5) * 8 - 2 // z: behind camera, slightly varied depth
  );
}

// BufferGeometry stores positions as a flat Float32Array
particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(new Float32Array(positions), 3)   // 3 floats per vertex
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0x6c63ff,
  size: 0.06,
  transparent: true,
  opacity: 0.6
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);
```

`THREE.Points` renders each vertex as a point/dot — perfect for particles. It is much
more efficient than creating a `Mesh` for each particle.

`THREE.BufferGeometry` with `setAttribute('position', ...)` is how Three.js stores
vertex data — a flat `Float32Array` with 3 consecutive values per vertex (x, y, z).

---

## Step 5 — Animation Loop

```js
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Slow drift of the entire particle system
  particleSystem.rotation.y = t * 0.05;
  particleSystem.rotation.x = t * 0.02;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

---

> **SAVE AND TRY**
>
> **You should see:** A field of small purple particles slowly rotating in the background.
> The HTML content (hero text, cards, etc.) floats on top. The glassmorphism cards blur
> the particles behind them. Scroll down — the particles stay fixed while the HTML scrolls.
>
> **Verify the layering:** Open DevTools Elements. The `<canvas>` is in `<body>`. Inspect
> its CSS — it should show `position: fixed; z-index: -1`.

---

## 🎯 Challenge: Scroll-Based Camera Movement

**You know:** `window.scrollY`, `camera.position`, the Three.js setup.

**Task:** Make the particle field shift slightly as the user scrolls — as if the camera
is drifting slowly through the particles. Update `camera.position.y` based on scroll:

```js
window.addEventListener('scroll', function () {
  camera.position.y = -window.scrollY * 0.003;
});
```

A negative value moves the camera down as the user scrolls — the particles appear to
drift upward slightly, reinforcing the scroll motion.

---

<details>
<summary>▶ Show Solution</summary>

Add to `main.js`:
```js
window.addEventListener('scroll', function () {
  camera.position.y = -window.scrollY * 0.003;   // subtle vertical drift
});
```

**Key insight:** Even a tiny camera movement (`0.003` per pixel) creates a noticeable
parallax effect between the fixed background and the scrolling HTML. This is the basis
for the full portfolio hero in LAB-30.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Canvas is behind HTML content | HTML text is readable over particles |
| Canvas stays fixed on scroll | Scroll down — particles stay, HTML scrolls |
| HTML links are clickable | Click "View My Work" button — it works |
| Glassmorphism cards blur background | Cards show frosted glass effect over particles |
| Particles slowly rotate | Particles drift slowly in the background |

---

## What's Next

LAB 24 begins the design and UX phase — Color System, HSL, and building a design palette.
Then LAB-25 through LAB-27 cover micro-interactions, visual hierarchy, and scroll reveals.
LAB-28 through LAB-34 bring everything together into the complete portfolio site.

---

## Quick Check Answers

**1. How do you make a canvas stay fixed behind all content?**
`position: fixed; top: 0; left: 0; z-index: -1;` in CSS. `position: fixed` removes the
element from the document flow and anchors it to the viewport — it does not scroll with
the page. `z-index: -1` renders it behind all other elements (which default to z-index 0).

**2. If the canvas has `pointer-events: none`, how can users click HTML elements below it?**
`pointer-events: none` means the element is invisible to mouse events — clicks pass
through it as if it does not exist. The underlying HTML elements (below in z-index, but
above in the DOM's event propagation) receive the click. This is exactly the behavior
we want: Three.js visuals render behind HTML, but HTML remains interactive.

**3. How do you make the Three.js canvas background transparent?**
Two steps: `new THREE.WebGLRenderer({ alpha: true })` enables the alpha channel in
the WebGL context. Then `renderer.setClearColor(0x000000, 0)` sets the clear alpha to 0
(fully transparent). Without both steps: `alpha: true` alone creates a transparent context
but Three.js defaults `setClearAlpha` to 1 (opaque). Without `alpha: true`, the WebGL
context has no alpha channel and transparency is impossible.
