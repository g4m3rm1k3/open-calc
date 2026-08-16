---
concept: 053-animated-mask
name: CSS Animated Mask Masterclass
category: CSS Visual Effects & Compositing
difficulty: Advanced
tags: [css, animated-mask, mask-image, mask-position, mask-size, keyframes, transitions, modern-css, visual-effects, interactive-ui, webkit-mask, animation-timeline, houdini]
---

# 053: CSS Animated Mask Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Animated Masking (`mask-position`, `mask-size`, `@keyframes`, Houdini `@property`) |
| **Category** | Visual Effects, Keyframe Animations & Hardware-Accelerated Compositing |
| **Specification** | [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) & [CSS Animations Level 1/2](https://www.w3.org/TR/css-animations-1/) |
| **Difficulty** | Advanced (4.5 / 5) |
| **What it produces** | Dynamic, cinematic visual transitions—including skeleton shimmer loaders, interactive spotlight/flashlight reveals, circular iris transitions, liquid wipes, radar sweeps, and scroll-driven reveals—operating directly on per-pixel alpha channels without DOM duplication or canvas overhead. |
| **Why it works** | The browser's compositing engine evaluates mask properties (`mask-position`, `mask-size`) and Houdini registered custom properties (`@property`) along a continuous interpolation timeline. At each frame, the calculated alpha or luminance stencil is multiplied against the source element's raster buffer on the GPU. |
| **Required CSS Concepts** | CSS Masking Suite (`mask-image`, `mask-position`, `mask-size`, `mask-repeat`), CSS `@keyframes`, Houdini `@property`, CSS Custom Properties (`var(--...)`), Hardware Acceleration (`will-change`), Pointer Events & CSS Variables, Scroll-Driven Animations (`animation-timeline`). |

```
================================================================================
                    THE KINETIC PIPELINE OF CSS ANIMATED MASKS
================================================================================

   1. SOURCE ELEMENT (Text, Media, UI Component)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ [ Card Title ]  Lorem ipsum dolor sit amet, consectetur elit...        │
   │ [ Image Asset ] (Full color, rendered once in GPU texture memory)      │
   └────────────────────────────────────────────────────────────────────────┘
                                     × (Multiplied Frame-by-Frame)
   2. ANIMATED MASK LAYER (Alpha Map in Motion)
   Frame 0% (Start)           Frame 50% (Midway)           Frame 100% (End)
   ┌──────────────┐           ┌──────────────┐            ┌──────────────┐
   │████░░░·······│  ───────> │····████░░░···│   ───────> │··········████│
   │(Position X=0)│           │(Position X=½)│            │(Position X=1)│
   └──────────────┘           └──────────────┘            └──────────────┘
                                     │
                                     ▼
   3. COMPOSITED DISPLAY OUTPUT (60 FPS / 120 FPS)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Content wipes, shimmers, or expands into view with feather-soft edges  │
   │ without triggering layout reflows or DOM mutations.                    │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Core Mechanics: How Masks Animate in Modern CSS

Animating a mask layer involves modifying the alpha stencil applied to a DOM element across time. Depending on the desired visual aesthetic, developers can animate four distinct aspects of the mask:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   THE 4 CORE MASK ANIMATION TECHNIQUES                     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. Coordinate Translation            │ 2. Spatial Scale / Expansion         │
│ • Animates `mask-position`           │ • Animates `mask-size`               │
│ • Shifts the stencil across X/Y axes │ • Shrinks or expands the aperture    │
│ • Ideal for: Shimmer, wipes, scans   │ • Ideal for: Iris reveals, portals   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 3. Houdini Gradient Stop Mutation   │ 4. Vector Path Morphing              │
│ • Animates `@property` stop offsets  │ • Animates SVG `<mask id="...">`     │
│ • Morphs gradient colorstops & radii │ • Interpolates bezier paths via CSS  │
│ • Ideal for: Soft focus, spotlights  │ • Ideal for: Organic blobs, liquids  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### The WebKit Prefix Mandate
Because Chromium (Chrome, Edge, Brave) and WebKit (Safari, iOS WebViews) continue to mandate vendor prefixes for CSS masking, every animated mask declaration requires dual-property syntax:

```css
.animated-stencil {
  /* WebKit Engine */
  -webkit-mask-image: linear-gradient(90deg, transparent, black 50%, transparent);
  -webkit-mask-size: 200% 100%;
  -webkit-mask-position: -100% 0;
  -webkit-mask-repeat: no-repeat;

  /* Standard Specification */
  mask-image: linear-gradient(90deg, transparent, black 50%, transparent);
  mask-size: 200% 100%;
  mask-position: -100% 0;
  mask-repeat: no-repeat;

  /* Hardware Acceleration */
  will-change: mask-position, -webkit-mask-position;
  animation: sweepMask 2.5s infinite linear;
}

@keyframes sweepMask {
  0% {
    -webkit-mask-position: -100% 0;
    mask-position: -100% 0;
  }
  100% {
    -webkit-mask-position: 200% 0;
    mask-position: 200% 0;
  }
}
```

---

## 2. Animatability Matrix & The Houdini `@property` Solution

Historically, CSS gradients could **not** be smoothly animated directly because the browser treated the entire `linear-gradient(...)` string as an uninterpolatable discrete value (causing an abrupt flash between states).

Modern CSS resolves this with two primary strategies:

1. **Geometry Transformation**: Moving the oversized gradient using `mask-position` or `mask-size` (supported across all modern browsers).
2. **Houdini `@property` Typed Custom Properties**: Formally registering custom variables with explicit syntax types (`<percentage>`, `<length>`, `<angle>`), allowing the browser's interpolation engine to smoothly compute intermediate values frame by frame.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ANIMATION APPROACH COMPARISON                            │
├───────────────────┬──────────────┬──────────────┬───────────────────────────┤
│ Approach          │ Performance  │ Complexity   │ Best Used For             │
├───────────────────┼──────────────┼──────────────┼───────────────────────────┤
│ `mask-position`   │ ⭐⭐⭐⭐⭐ 60+fps │ Low          │ Linear wipes, shimmers    │
│ `mask-size`       │ ⭐⭐⭐⭐  60fps │ Low-Moderate │ Iris opens, radial portals│
│ Houdini CSS Stops │ ⭐⭐⭐⭐⭐ 60+fps │ Moderate     │ Dynamic spotlight radius  │
│ Mouse CSS Vars    │ ⭐⭐⭐⭐⭐ Direct │ Low          │ Interactive cursor halos  │
│ SVG `<mask path>` │ ⭐⭐⭐   30-60fps│ Moderate-High│ Organic blob morphing     │
└───────────────────┴──────────────┴──────────────┴───────────────────────────┘
```

### Registering Houdini Variables for Smooth Gradient Animation
```css
@property --mask-stop {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@property --mask-radius {
  syntax: '<length>';
  inherits: false;
  initial-value: 50px;
}

@property --mask-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
```

---

## 3. The 8 Master Animated Mask Patterns

---

### Pattern 1: Continuous Skeleton Shimmer Loader (Hardware-Accelerated)

#### The Problem
Standard loading skeletons that animate simple `opacity` pulse uniformly, looking sluggish and generic. High-end modern design systems (Linear, Vercel, Apple) employ a diagonal high-intensity sheen that sweeps across the card, illuminating typography and media placeholders with a continuous, glass-like reflection.

```
0ms:   [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] (Dark Base)
500ms: [░░░░░░░░██████░░░░░░░░░░░░░░░░░░] (Sheen Sweeps Right)
1000ms:[░░░░░░░░░░░░░░░░░░██████░░░░░░░░] (Continuous Sheen)
```

#### HTML
```html
<article class="skeleton-card" aria-busy="true" aria-label="Loading content">
  <div class="skeleton-header">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-meta">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-subtitle"></div>
    </div>
  </div>
  <div class="skeleton-body">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line skeleton-short"></div>
  </div>
</article>
```

#### CSS
```css
:root {
  --skel-bg: #1e293b;
  --skel-bone: #334155;
  --skel-glow: rgba(255, 255, 255, 0.45);
}

.skeleton-card {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: var(--skel-bg);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

/* Individual bone placeholders */
.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--skel-bone);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 12px;
  background: var(--skel-bone);
  border-radius: 6px;
  width: 100%;
}

.skeleton-title {
  width: 65%;
  height: 16px;
}

.skeleton-subtitle {
  width: 40%;
}

.skeleton-short {
  width: 50%;
}

/* Single Composited Animated Shimmer Mask Applied to the Container */
.skeleton-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  pointer-events: none;

  /* The mask uses an angled gradient: 0% transparent, 50% solid white peak, 100% transparent */
  -webkit-mask-image: linear-gradient(
    110deg,
    transparent 20%,
    black 48%,
    black 52%,
    transparent 80%
  );
  mask-image: linear-gradient(
    110deg,
    transparent 20%,
    black 48%,
    black 52%,
    transparent 80%
  );

  -webkit-mask-size: 250% 100%;
  mask-size: 250% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  /* Shimmer motion */
  will-change: mask-position, -webkit-mask-position;
  animation: skeletonSheen 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  opacity: 0.15;
}

@keyframes skeletonSheen {
  0% {
    -webkit-mask-position: 130% 0;
    mask-position: 130% 0;
  }
  100% {
    -webkit-mask-position: -130% 0;
    mask-position: -130% 0;
  }
}
```

#### Why It Works
Instead of animating each line's background independently (which causes 5+ layout redraws), we generate an absolute pseudo-element over the entire card. The `-webkit-mask-image` acts as an angled slit. Animating `-webkit-mask-position` from `130% 0` to `-130% 0` moves the alpha aperture across the GPU texture at 120 FPS.

---

### Pattern 2: Interactive Pointer Spotlight / Flashlight Reveal

#### The Problem
Interactive portfolio hero sections and product teasers often require revealing high-tech inner circuitry, blueprints, or vibrant art beneath a dark surface precisely where the user's cursor hovers.

```
       [  Dark Obscuring Top Layer  ]
                   │
            (User Pointer @ X, Y)
                   ▼
         ┌───────────────────┐
         │     . - ~ - .     │  <── Soft Radial Falloff (Alpha: 1.0)
         │   ( Spotlight )   │
         │     ' - _ - '     │  <── Outer Rim (Alpha: 0.0)
         └───────────────────┘
```

#### HTML
```html
<div class="spotlight-stage" id="spotlightCard">
  <!-- Base Background Content -->
  <div class="underlayer-content">
    <div class="blueprint-grid"></div>
    <div class="chip-circuit">
      <div class="chip-core">QUANTUM M3-PRO</div>
      <p class="chip-stats">3.8 GHz • 128-Core Neural Engine</p>
    </div>
  </div>

  <!-- Foreground Reveal Layer (Masked by Cursor) -->
  <div class="spotlight-aperture" aria-hidden="true">
    <div class="glowing-art-content">
      <div class="blueprint-grid glowing"></div>
      <div class="chip-circuit glowing">
        <div class="chip-core neon">QUANTUM M3-PRO // UNLOCKED</div>
        <p class="chip-stats neon">MAX FREQUENCY ACTIVE • 10.4 TFLOPS</p>
      </div>
    </div>
  </div>
</div>
```

#### CSS
```css
.spotlight-stage {
  position: relative;
  width: 100%;
  max-width: 540px;
  height: 320px;
  background: #090d16;
  border-radius: 20px;
  border: 1px solid #1e293b;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
  cursor: crosshair;

  /* Coordinates dynamically updated via pointer events */
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-radius: 140px;
  --spotlight-feather: 70px;
}

.underlayer-content {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 32px;
  opacity: 0.35;
  filter: grayscale(0.8);
}

/* The Aperture Layer: Revealed ONLY within the radial mask zone */
.spotlight-aperture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: #020617;

  /* Standard & WebKit Radial Mask with dynamic center coordinates */
  -webkit-mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.8) 50%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.8) 50%,
    transparent 100%
  );
}

.glowing-art-content {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 32px;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), #1e1b4b 0%, #030712 100%);
}

.chip-circuit {
  text-align: center;
  padding: 24px 32px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.chip-circuit.glowing {
  border: 1px solid #38bdf8;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
}

.chip-core {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #94a3b8;
}

.chip-core.neon {
  color: #38bdf8;
  text-shadow: 0 0 12px #38bdf8, 0 0 24px rgba(56, 189, 248, 0.5);
}

.chip-stats {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
}

.chip-stats.neon {
  color: #7dd3fc;
}
```

#### JavaScript Driver (Smooth Micro-Interactivity)
```javascript
const card = document.getElementById('spotlightCard');

card.addEventListener('pointermove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  card.style.setProperty('--mouse-x', `${x.toFixed(2)}%`);
  card.style.setProperty('--mouse-y', `${y.toFixed(2)}%`);
});

card.addEventListener('pointerleave', () => {
  card.style.setProperty('--mouse-x', '50%');
  card.style.setProperty('--mouse-y', '50%');
});
```

---

### Pattern 3: Cinematic Circular Iris / Portal Expansion Wipe

#### The Problem
Transitioning between two scenes or revealing high-resolution hero banners often looks abrupt when using standard slide-in or fade animations. An expanding circular camera iris (popularized by retro cinema and modern Apple product launch pages) delivers a dramatic, focal-point entrance.

```
State 0% (Closed)        State 50% (Expanding)       State 100% (Full View)
┌────────────────┐       ┌────────────────┐         ┌────────────────┐
│████████████████│       │█████      █████│         │                │
│██████( )███████│ ────> │███ (      ) ███│  ─────> │   FULL IMAGE   │
│████████████████│       │█████      █████│         │    REVEALED    │
└────────────────┘       └────────────────┘         └────────────────┘
```

#### HTML
```html
<div class="iris-viewport">
  <img
    class="iris-media"
    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80"
    alt="Masterpiece Oil Painting"
  />
  <div class="iris-overlay">
    <div class="iris-badge">GALLERY COLLECTION 2026</div>
    <h2 class="iris-headline">The Anatomy of Classical Resonance</h2>
    <p class="iris-sub">Hover to expand the cinematic aperture</p>
  </div>
</div>
```

#### CSS
```css
/* Register Houdini @property for smooth float interpolation of the radius */
@property --iris-size {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.iris-viewport {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 380px;
  border-radius: 24px;
  overflow: hidden;
  background: #020617;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}

.iris-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  --iris-size: 15%;

  /* Dual radial mask: Center is opaque, exterior is feathered to zero */
  -webkit-mask-image: radial-gradient(
    circle at center,
    black var(--iris-size),
    rgba(0, 0, 0, 0.4) calc(var(--iris-size) + 4%),
    transparent calc(var(--iris-size) + 12%)
  );
  mask-image: radial-gradient(
    circle at center,
    black var(--iris-size),
    rgba(0, 0, 0, 0.4) calc(var(--iris-size) + 4%),
    transparent calc(var(--iris-size) + 12%)
  );

  transition: --iris-size 0.85s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(1.08);
}

/* Hover or Active Reveal Trigger */
.iris-viewport:hover .iris-media,
.iris-viewport:focus-within .iris-media {
  --iris-size: 100%;
  transform: scale(1);
}

.iris-overlay {
  position: relative;
  z-index: 2;
  padding: 32px;
  background: linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, transparent 100%);
  width: 100%;
  pointer-events: none;
}

.iris-badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #38bdf8;
  margin-bottom: 8px;
}

.iris-headline {
  font-size: 1.5rem;
  color: #f8fafc;
  margin: 0 0 6px 0;
  font-weight: 700;
}

.iris-sub {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}
```

---

### Pattern 4: Diagonal High-Fashion Text Wipe Reveal

#### The Problem
Standard opacity fades for headlines feel ordinary. Editorial publications, luxury brand landing pages, and title sequences often utilize an angled hard-edge wipe where letters slice into existence with crisp typography.

```
Mask Gradient: [ Black (100%) | Sharp 45° Edge | Transparent (0%) ]
Motion: Translates along X-axis from -100% to 100%
Result: Letters slice into view along a 45-degree diagonal blade.
```

#### HTML
```html
<section class="banner-stage">
  <div class="editorial-container">
    <span class="eyebrow-tag">SPRING / SUMMER 2026</span>
    <h1 class="wipe-title">
      <span class="wipe-line">ARCHITECTURAL</span>
      <span class="wipe-line delay-1">MINIMALISM</span>
    </h1>
    <p class="wipe-desc delay-2">
      Form strictly follows structural integrity. Precision-engineered garments
      crafted for the modern metropolitan nomad.
    </p>
  </div>
</section>
```

#### CSS
```css
.banner-stage {
  background: #09090b;
  padding: 60px 40px;
  border-radius: 24px;
  color: #fafafa;
  max-width: 680px;
}

.eyebrow-tag {
  font-size: 0.8rem;
  letter-spacing: 3px;
  color: #a1a1aa;
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
}

.wipe-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -1px;
  margin: 0 0 20px 0;
  text-transform: uppercase;
}

.wipe-line {
  display: block;

  /* Angled hard-edge mask */
  -webkit-mask-image: linear-gradient(
    125deg,
    black 0%,
    black 45%,
    rgba(0, 0, 0, 0.1) 48%,
    transparent 52%,
    transparent 100%
  );
  mask-image: linear-gradient(
    125deg,
    black 0%,
    black 45%,
    rgba(0, 0, 0, 0.1) 48%,
    transparent 52%,
    transparent 100%
  );

  -webkit-mask-size: 280% 100%;
  mask-size: 280% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  /* Start in fully invisible zone */
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;

  animation: diagonalTextWipe 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.wipe-line.delay-1 {
  animation-delay: 0.25s;
}

.wipe-desc {
  font-size: 1.05rem;
  color: #a1a1aa;
  max-width: 480px;
  line-height: 1.6;
  margin: 0;

  -webkit-mask-image: linear-gradient(to right, black 0%, black 70%, transparent 100%);
  mask-image: linear-gradient(to right, black 0%, black 70%, transparent 100%);
  -webkit-mask-size: 200% 100%;
  mask-size: 200% 100%;
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;

  animation: horizontalTextWipe 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.5s;
}

@keyframes diagonalTextWipe {
  0% {
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
    transform: translateY(8px);
  }
  100% {
    -webkit-mask-position: 0% 0;
    mask-position: 0% 0;
    transform: translateY(0);
  }
}

@keyframes horizontalTextWipe {
  0% {
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
  }
  100% {
    -webkit-mask-position: 0% 0;
    mask-position: 0% 0;
  }
}
```

---

### Pattern 5: Conic Radar / Sonar HUD Scanner Animation

#### The Problem
Cyberpunk dashboards, telemetry tracking panels, and biometric scanning interfaces require an authentic rotating sweep beam that continuously scans across data nodes, revealing hidden markers as the beam passes.

```
       360-Degree Conic Mask
             12 o'clock
                 ▲
             . - ~ - .
           /     │     \  <── Opaque Leading Edge (1.0 Alpha)
          │  Rotated    │
          │   Sweep     │ <── Continuous Falloff to 0.0 Alpha
           \     │     /
             ' - _ - '
```

#### HTML
```html
<div class="radar-container" role="region" aria-label="Biometric Radar Sweep">
  <div class="radar-grid">
    <div class="radar-ring ring-1"></div>
    <div class="radar-ring ring-2"></div>
    <div class="radar-ring ring-3"></div>
    <div class="radar-crosshair-x"></div>
    <div class="radar-crosshair-y"></div>
  </div>

  <!-- Detected Targets (Revealed by Conic Mask) -->
  <div class="radar-sweep-layer">
    <div class="target-blip blip-1" style="top: 25%; left: 65%;">
      <span class="blip-label">TARGET ALPHA [98.4%]</span>
    </div>
    <div class="target-blip blip-2" style="top: 70%; left: 35%;">
      <span class="blip-label">TARGET BETA [SECURE]</span>
    </div>
    <div class="target-blip blip-3" style="top: 45%; left: 20%;">
      <span class="blip-label">ANOMALY DETECTED</span>
    </div>
  </div>
</div>
```

#### CSS
```css
@property --radar-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.radar-container {
  position: relative;
  width: 320px;
  height: 320px;
  background: #020617;
  border-radius: 50%;
  border: 2px solid #059669;
  box-shadow: 0 0 35px rgba(5, 150, 105, 0.2), inset 0 0 30px rgba(5, 150, 105, 0.15);
  overflow: hidden;
}

.radar-grid {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.radar-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.ring-1 { width: 30%; height: 30%; }
.ring-2 { width: 60%; height: 60%; }
.ring-3 { width: 90%; height: 90%; }

.radar-crosshair-x {
  position: absolute;
  width: 100%;
  height: 1px;
  background: rgba(16, 185, 129, 0.25);
}

.radar-crosshair-y {
  position: absolute;
  height: 100%;
  width: 1px;
  background: rgba(16, 185, 129, 0.25);
}

/* The Animated Conic Mask Layer */
.radar-sweep-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.35) 100%);

  /* Conic gradient mask with animated starting rotation angle */
  -webkit-mask-image: conic-gradient(
    from var(--radar-angle),
    black 0deg,
    rgba(0, 0, 0, 0.5) 45deg,
    transparent 75deg,
    transparent 360deg
  );
  mask-image: conic-gradient(
    from var(--radar-angle),
    black 0deg,
    rgba(0, 0, 0, 0.5) 45deg,
    transparent 75deg,
    transparent 360deg
  );

  animation: rotateRadar 3.5s linear infinite;
}

@keyframes rotateRadar {
  0% {
    --radar-angle: 0deg;
  }
  100% {
    --radar-angle: 360deg;
  }
}

.target-blip {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 10px #34d399, 0 0 20px #10b981;
}

.blip-label {
  position: absolute;
  left: 14px;
  top: -4px;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  color: #6ee7b7;
  white-space: nowrap;
  letter-spacing: 1px;
}
```

---

### Pattern 6: Pure Scroll-Driven Mask Reveal (`animation-timeline: view()`)

#### The Problem
Modern web experiences frequently fade elements in and out dynamically based on their scroll position inside the viewport. Using JavaScript `scroll` or `IntersectionObserver` listeners incurs event loop lag and main-thread serialization penalties.

Modern CSS Scroll-Driven Animations enable 100% declarative, compositor-thread mask transitions tied directly to scroll progress.

```
Viewport Top ──────────────────────
                                       Scroll Down ↓
Element Entering: Mask-size = 0%       [   Aperture closed   ]
Element Centered: Mask-size = 100%     [ Aperture 100% open  ]
Element Exiting:  Mask-size = 0%       [   Aperture closes   ]
Viewport Bottom ───────────────────
```

#### HTML
```html
<section class="scroll-story-section">
  <div class="scroll-reveal-card">
    <div class="card-visual">
      <img
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80"
        alt="Microchip Silicon Wafer"
      />
    </div>
    <div class="card-content">
      <span class="tech-tag">HARDWARE ACCELERATED</span>
      <h3>Zero-JS Scroll Driven Compositing</h3>
      <p>
        As this card enters the viewport, the CSS Mask expands from a pinhole to
        full dimensions, driven strictly by the GPU compositor timeline.
      </p>
    </div>
  </div>
</section>
```

#### CSS
```css
.scroll-story-section {
  padding: 80px 20px;
  display: flex;
  justify-content: center;
}

.scroll-reveal-card {
  width: 100%;
  max-width: 580px;
  background: #0f172a;
  border-radius: 24px;
  border: 1px solid #1e293b;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.card-visual {
  width: 100%;
  height: 280px;
  position: relative;
  overflow: hidden;
}

.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* Initial mask settings */
  -webkit-mask-image: radial-gradient(circle at center, black 0%, black 60%, transparent 100%);
  mask-image: radial-gradient(circle at center, black 0%, black 60%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;

  /* Progressive Enhancement: Scroll Timeline */
  animation: scrollAperture linear both;
  animation-timeline: view(block);
  animation-range: entry 10% cover 60%;
}

@keyframes scrollAperture {
  0% {
    -webkit-mask-size: 0% 0%;
    mask-size: 0% 0%;
    filter: blur(10px);
    transform: scale(1.15);
  }
  100% {
    -webkit-mask-size: 220% 220%;
    mask-size: 220% 220%;
    filter: blur(0px);
    transform: scale(1);
  }
}

.card-content {
  padding: 28px;
}

.tech-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #38bdf8;
}

.card-content h3 {
  color: #f8fafc;
  font-size: 1.35rem;
  margin: 8px 0 12px 0;
}

.card-content p {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}
```

---

### Pattern 7: Venetian Blind & Multi-Stripe Staggered Wipe

#### The Problem
Presenting hero banners or high-impact photography often benefits from graphic, rhythmic geometric reveals—such as vertical or horizontal louvers/slats slicing open in unison.

```
Mask Slits:
[██░░░░] [██░░░░] [██░░░░] [██░░░░] [██░░░░]  <── 0% Width (Closed)
[████░░] [████░░] [████░░] [████░░] [████░░]  <── 50% Width
[██████] [██████] [██████] [██████] [██████]  <── 100% Width (Fully Open)
```

#### HTML
```html
<div class="venetian-stage" tabindex="0">
  <div class="venetian-banner">
    <img
      src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"
      alt="Abstract Neon Sculpture"
    />
    <div class="venetian-caption">
      <span class="caption-index">01 // VISUAL DESIGN</span>
      <h2>Chromatic Resonance</h2>
    </div>
  </div>
</div>
```

#### CSS
```css
@property --stripe-width {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.venetian-stage {
  max-width: 620px;
  border-radius: 20px;
  overflow: hidden;
  background: #020617;
  cursor: pointer;
}

.venetian-banner {
  position: relative;
  width: 100%;
  height: 360px;
}

.venetian-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  --stripe-width: 0%;

  /* Repeating linear mask creates 6 equidistant vertical louvers */
  -webkit-mask-image: repeating-linear-gradient(
    90deg,
    black 0%,
    black var(--stripe-width),
    transparent var(--stripe-width),
    transparent 16.666%
  );
  mask-image: repeating-linear-gradient(
    90deg,
    black 0%,
    black var(--stripe-width),
    transparent var(--stripe-width),
    transparent 16.666%
  );

  transition: --stripe-width 0.9s cubic-bezier(0.77, 0, 0.175, 1),
              filter 0.9s ease;
  filter: contrast(1.2) brightness(0.8);
}

.venetian-stage:hover img,
.venetian-stage:focus-within img {
  --stripe-width: 16.666%;
  filter: contrast(1) brightness(1);
}

.venetian-caption {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  padding: 16px 20px;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.caption-index {
  font-size: 0.75rem;
  color: #38bdf8;
  font-weight: 700;
  letter-spacing: 2px;
}

.venetian-caption h2 {
  margin: 4px 0 0 0;
  font-size: 1.25rem;
}
```

---

### Pattern 8: Dynamic SVG Organic Morphing Mask

#### The Problem
CSS gradients produce geometric lines, circles, and cones. When an art director requests organic, fluid, amorphous liquid blobs that morph dynamically while masking an interactive video or portrait, SVG `<mask id="...">` integrated with CSS keyframes provides the ultimate solution.

```
SVG Defs: <mask id="liquidBlob"> <path d="M... (Morphing Bezier Curve)" /> </mask>
CSS: -webkit-mask: url(#liquidBlob);
Result: Ultra-smooth organic fluid boundary masking live HTML elements.
```

#### HTML
```html
<div class="blob-mask-stage">
  <div class="masked-avatar-container">
    <img
      class="blob-masked-media"
      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
      alt="Creative Director Portrait"
    />
  </div>

  <div class="profile-details">
    <span class="role-badge">LEAD CREATIVE DIRECTOR</span>
    <h3>Elena Rostova</h3>
    <p>Pioneering fluid generative aesthetics and kinetic typography systems.</p>
  </div>
</div>

<!-- Inline SVG Stencil Definition -->
<svg class="svg-mask-defs" width="0" height="0" aria-hidden="true">
  <defs>
    <mask id="fluidMorphMask" maskContentUnits="objectBoundingBox">
      <!-- White fill = 100% visible in luminance mask mode -->
      <path
        fill="#ffffff"
        d="M 0.5 0.05 C 0.8 0.02, 0.98 0.2, 0.95 0.5 C 0.92 0.8, 0.75 0.98, 0.5 0.95 C 0.25 0.92, 0.02 0.8, 0.05 0.5 C 0.08 0.2, 0.2 0.08, 0.5 0.05 Z"
      >
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M 0.5 0.05 C 0.8 0.02, 0.98 0.2, 0.95 0.5 C 0.92 0.8, 0.75 0.98, 0.5 0.95 C 0.25 0.92, 0.02 0.8, 0.05 0.5 C 0.08 0.2, 0.2 0.08, 0.5 0.05 Z;
            M 0.5 0.02 C 0.9 0.1, 0.95 0.4, 0.9 0.75 C 0.85 0.95, 0.6 0.98, 0.45 0.9 C 0.2 0.8, 0.05 0.65, 0.02 0.4 C -0.01 0.15, 0.2 0.05, 0.5 0.02 Z;
            M 0.5 0.05 C 0.8 0.02, 0.98 0.2, 0.95 0.5 C 0.92 0.8, 0.75 0.98, 0.5 0.95 C 0.25 0.92, 0.02 0.8, 0.05 0.5 C 0.08 0.2, 0.2 0.08, 0.5 0.05 Z
          "
        />
      </path>
    </mask>
  </defs>
</svg>
```

#### CSS
```css
.blob-mask-stage {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px;
  background: #0f172a;
  border-radius: 24px;
  max-width: 580px;
  border: 1px solid #1e293b;
}

.masked-avatar-container {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  filter: drop-shadow(0 12px 24px rgba(56, 189, 248, 0.25));
}

.blob-masked-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  /* Standard & WebKit reference to SVG Mask */
  -webkit-mask: url('#fluidMorphMask');
  mask: url('#fluidMorphMask');
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.svg-mask-defs {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  visibility: hidden;
}

.profile-details {
  flex: 1;
}

.role-badge {
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: #38bdf8;
  font-weight: 700;
}

.profile-details h3 {
  margin: 6px 0 8px 0;
  color: #f8fafc;
  font-size: 1.4rem;
}

.profile-details p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}
```

---

## 4. Hardware Acceleration & 120 FPS Rendering Performance

CSS masking involves per-pixel multiplication. When improperly coded, it can cause repeated CPU paint cycles and frame drops. Follow these architectural rules:

### 1. Promoting the Mask to a Dedicated GPU Layer
Inform the browser's compositor ahead of time to allocate an independent rendering plane:
```css
.optimized-mask-layer {
  /* Notify compositor of high-frequency property transitions */
  will-change: mask-position, -webkit-mask-position, transform;
  transform: translateZ(0); /* Force layer creation */
}
```

### 2. Geometry Transforms vs. Full Gradient Repaints
* **Optimal (0ms Main-Thread Time)**: Keeping the gradient static and animating `mask-position` or `mask-size`. The GPU translates/scales the existing texture map.
* **Houdini (Sub-1ms Paint Time)**: Animating registered `@property` numbers. The shader recompiles parameters on the GPU.
* **Avoid (Heavy CPU Paint)**: Modifying unregistered inline gradient strings via JavaScript `element.style.maskImage = ...` on every `requestAnimationFrame`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRAME PERFORMANCE BUDGET                           │
├────────────────────────────────┬─────────────────┬──────────────────────────┤
│ Technique                      │ Frame Time (GPU)│ Main Thread Overhead     │
├────────────────────────────────┼─────────────────┼──────────────────────────┤
│ `mask-position` Translation    │ ~0.2 ms         │ 0.0 ms (Compositor Only) │
│ Registered `@property` Stops   │ ~0.6 ms         │ 0.0 ms (Shader Uniforms) │
│ Pointer CSS Variable Updates   │ ~0.8 ms         │ 0.1 ms (Direct Mutation) │
│ Unregistered String Keyframes  │ ~14.0 ms (Lag!) │ 12.0 ms (Full Repaint)   │
└────────────────────────────────┴─────────────────┴──────────────────────────┘
```

---

## 5. Accessibility, User Preferences & Graceful Fallbacks

### Honoring Reduced Motion (`prefers-reduced-motion`)
Users with vestibular disorders or motion sensitivities must be provided with instant, non-moving visual alternatives:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable continuous shimmers and wipes */
  .skeleton-card::after,
  .radar-sweep-layer,
  .wipe-line,
  .iris-media {
    animation: none !important;
    transition: none !important;
    -webkit-mask-position: 0% 0 !important;
    mask-position: 0% 0 !important;
    --iris-size: 100% !important;
    --stripe-width: 16.666% !important;
  }

  /* Provide a simple static opacity fallback */
  .skeleton-card {
    opacity: 0.75;
  }
}
```

### Progressive Enhancement with `@supports`
```css
/* Baseline Fallback for Older Browsers */
.hero-reveal-banner {
  opacity: 1;
  border-radius: 16px;
}

/* Enhanced Animated Mask Experience */
@supports ((-webkit-mask-image: linear-gradient(black, transparent)) or
          (mask-image: linear-gradient(black, transparent))) {
  .hero-reveal-banner {
    -webkit-mask-image: linear-gradient(90deg, black, transparent);
    mask-image: linear-gradient(90deg, black, transparent);
  }
}
```

---

## 6. Common Pitfalls & Debugging Strategies

### 1. The "Discrete Gradient Snap" Bug
* **Symptom**: You animate a gradient stop from `0%` to `100%` in `@keyframes`, but it snaps abruptly at 50% instead of smoothing.
* **Cause**: The CSS variable was not registered with `@property`, so the browser treats it as an untyped string.
* **Fix**:
```css
@property --my-stop {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
```

### 2. The Unexpected Wallpaper Tiling Artifact
* **Symptom**: An animated radial spotlight reveals multiple copies of itself across the card.
* **Cause**: `mask-repeat` defaults to `repeat`. As the spotlight moves or expands, adjacent tiles render into view.
* **Fix**: Always specify `mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;`.

### 3. Safari Mask Invisibility (Missing WebKit Sizing)
* **Symptom**: Mask renders on Chrome/Firefox but disappears completely on iOS Safari.
* **Cause**: WebKit requires explicit `-webkit-mask-size` whenever `-webkit-mask-image` is defined.
* **Fix**:
```css
-webkit-mask-size: 100% 100%;
mask-size: 100% 100%;
```

### 4. Subpixel Jitter During Smooth Panning
* **Symptom**: Text or thin borders shimmer with antialiasing noise during `mask-position` animations.
* **Fix**: Add `backface-visibility: hidden;` and `transform: translateZ(0);` to lock the raster layer to integer pixel boundaries.

---

## 7. Complete Interactive Multi-Demo Showcase

Below is a self-contained, copy-pasteable HTML and CSS showcase assembling multiple advanced animated mask techniques into an interactive dark-mode dashboard.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Animated Mask Masterclass Showcase</title>
  <style>
    /* Global Resets & Design Tokens */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-space: #030712;
      --card-surface: #0f172a;
      --card-border: #1e293b;
      --accent-cyan: #38bdf8;
      --accent-emerald: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    @property --iris-val {
      syntax: '<percentage>';
      inherits: false;
      initial-value: 12%;
    }

    body {
      background-color: var(--bg-space);
      color: var(--text-main);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }

    header {
      text-align: center;
      max-width: 640px;
    }

    header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    header p {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 460px));
      gap: 32px;
      width: 100%;
      max-width: 1020px;
      justify-content: center;
    }

    .demo-panel {
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .panel-title {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--accent-cyan);
      text-transform: uppercase;
    }

    /* 1. Shimmer Skeleton Component */
    .skeleton-box {
      position: relative;
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }

    .skel-line {
      height: 12px;
      background: #334155;
      border-radius: 6px;
    }

    .skel-line.w-80 { width: 80%; }
    .skel-line.w-50 { width: 50%; }
    .skel-line.w-100 { width: 100%; }

    .skeleton-box::after {
      content: '';
      position: absolute;
      inset: 0;
      background: #ffffff;
      opacity: 0.12;
      pointer-events: none;
      -webkit-mask-image: linear-gradient(
        105deg,
        transparent 30%,
        black 50%,
        transparent 70%
      );
      mask-image: linear-gradient(
        105deg,
        transparent 30%,
        black 50%,
        transparent 70%
      );
      -webkit-mask-size: 200% 100%;
      mask-size: 200% 100%;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      animation: sweepShimmer 2s infinite linear;
    }

    @keyframes sweepShimmer {
      0% {
        -webkit-mask-position: 150% 0;
        mask-position: 150% 0;
      }
      100% {
        -webkit-mask-position: -50% 0;
        mask-position: -50% 0;
      }
    }

    /* 2. Interactive Iris Card */
    .iris-box {
      position: relative;
      height: 180px;
      border-radius: 12px;
      overflow: hidden;
      background: #020617;
      cursor: pointer;
    }

    .iris-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      --iris-val: 16%;
      -webkit-mask-image: radial-gradient(
        circle at center,
        black var(--iris-val),
        transparent calc(var(--iris-val) + 12%)
      );
      mask-image: radial-gradient(
        circle at center,
        black var(--iris-val),
        transparent calc(var(--iris-val) + 12%)
      );
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      transition: --iris-val 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.6s ease;
      transform: scale(1.05);
    }

    .iris-box:hover .iris-img {
      --iris-val: 100%;
      transform: scale(1);
    }

    .iris-label {
      position: absolute;
      bottom: 12px;
      left: 12px;
      font-size: 0.8rem;
      background: rgba(0, 0, 0, 0.7);
      padding: 4px 10px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    /* 3. Text Wipe */
    .wipe-box {
      background: #090d16;
      padding: 24px;
      border-radius: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }

    .wipe-heading {
      font-size: 1.4rem;
      font-weight: 800;
      -webkit-mask-image: linear-gradient(120deg, black 40%, transparent 60%);
      mask-image: linear-gradient(120deg, black 40%, transparent 60%);
      -webkit-mask-size: 250% 100%;
      mask-size: 250% 100%;
      animation: wipeText 2.5s infinite alternate ease-in-out;
    }

    @keyframes wipeText {
      0% {
        -webkit-mask-position: 100% 0;
        mask-position: 100% 0;
      }
      100% {
        -webkit-mask-position: 0% 0;
        mask-position: 0% 0;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Animated CSS Masking Suite</h1>
    <p>Hardware-accelerated alpha channel transitions & kinetic UI stencils.</p>
  </header>

  <main class="demo-grid">
    <!-- Panel 1 -->
    <section class="demo-panel">
      <span class="panel-title">01 // Sheen Skeleton Mask</span>
      <div class="skeleton-box">
        <div class="skel-line w-80"></div>
        <div class="skel-line w-100"></div>
        <div class="skel-line w-50"></div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted);">
        A single angled linear mask sweeping across container elements at 60 FPS.
      </p>
    </section>

    <!-- Panel 2 -->
    <section class="demo-panel">
      <span class="panel-title">02 // Houdini Radial Iris Reveal</span>
      <div class="iris-box">
        <img
          class="iris-img"
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
          alt="Abstract 3D Artwork"
        />
        <div class="iris-label">Hover to Expand Aperture</div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted);">
        Smooth aperture interpolation driven by typed <code>@property --iris-val</code>.
      </p>
    </section>

    <!-- Panel 3 -->
    <section class="demo-panel">
      <span class="panel-title">03 // Diagonal Typography Wipe</span>
      <div class="wipe-box">
        <div class="wipe-heading">COMPOSITED KINETIC TYPE</div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted);">
        High-fashion diagonal mask wipe translating across text boundaries.
      </p>
    </section>
  </main>
</body>
</html>
```

---

## 8. Summary & Best Practice Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ANIMATED MASK PRODUCTION CHECKLIST                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] Always supply dual `-webkit-mask-*` and standard `mask-*` declarations. │
│ [ ] Set `mask-repeat: no-repeat` to prevent unexpected tiling artifacts.    │
│ [ ] Declare `will-change: mask-position` to promote layers to the GPU.      │
│ [ ] Register Houdini variables with `@property` when animating colorstops.  │
│ [ ] Wrap high-frequency animations in `@media (prefers-reduced-motion)`.    │
│ [ ] Prefer algebraic gradients over heavy 4K raster PNG mask assets.        │
│ [ ] Test on WebKit (Safari/iOS) for strict `-webkit-mask-size` compliance.  │
└─────────────────────────────────────────────────────────────────────────────┘
```
