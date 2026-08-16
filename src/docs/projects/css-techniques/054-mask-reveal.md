---
concept: 054-mask-reveal
name: CSS Mask Reveal Techniques & Animations
category: CSS Visual Effects & Compositing
difficulty: Intermediate to Advanced
tags: [css, mask-reveal, mask-image, mask-position, mask-size, gradient-reveal, spotlight-reveal, cursor-tracking, text-reveal, scroll-reveal, transitions, keyframes, at-property, webkit-mask, modern-css]
---

# 054: CSS Mask Reveal Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Mask Reveal (`mask-image`, `mask-position`, `mask-size`, `@keyframes`, `@property`) |
| **Category** | Visual Effects, Compositing, Micro-Interactions & Animation |
| **Specification** | [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) & [CSS Properties and Values API Level 1](https://www.w3.org/TR/css-properties-values-api-1/) |
| **Difficulty** | Intermediate to Advanced (3.8 / 5) |
| **What it produces** | Dynamic, cinematic reveal animations—such as directional wipes, expanding circular irises, mouse-following spotlights, interactive before/after split sliders, venetian blinds shutters, and scroll-driven unveils—purely via GPU-accelerated CSS masking. |
| **Why it works** | By dynamically animating the position, scale, geometry, or color-stop thresholds of a mask alpha channel (`mask-image`), the browser continuously recalculates visible vs. hidden pixel regions, creating seamless visual transitions without altering DOM structure or manipulating canvas pixels. |
| **Required CSS Concepts** | CSS Masking Suite (`mask-*` / `-webkit-mask-*`), CSS Gradients (`linear`, `radial`, `conic`), CSS Keyframe Animations & Transitions, CSS Custom Properties & `@property`, Modern Stacking Contexts, Pointer Coordinates, `prefers-reduced-motion`. |

```
================================================================================
                       THE MASK REVEAL PIPELINE
================================================================================

 [State 0: Hidden / Masked Off]
   Target Element Content               Mask Aperture (Alpha Matte)             Composited Output
   ┌───────────────────────────┐        ┌───────────────────────────┐         ┌───────────────────────────┐
   │ System Status: ACTIVE     │        │ ░░░░░░░░░░░░░░░░░░░░░░░░░ │         │                           │
   │ CPU Load: 12%             │   ×    │ Alpha: 0.0 (Transparent)  │   =     │       [ INVISIBLE ]       │
   │ Network: 10 Gbps          │        │                           │         │                           │
   └───────────────────────────┘        └───────────────────────────┘         └───────────────────────────┘

 [Transition / Keyframe / Mouse Move / Scroll Progress]
        │
        ▼  Mask translates, expands, or interpolates gradient stops via CSS
 [State 1: Progressive Reveal]
   ┌───────────────────────────┐        ┌───────────────────────────┐         ┌───────────────────────────┐
   │ System Status: ACTIVE     │        │ █████████████░░░░░░░░░░░░ │         │ System Status: ACTIVE     │
   │ CPU Load: 12%             │   ×    │ Alpha: 1.0   Alpha: 0.0   │   =     │ CPU Load: 12%             │
   │ Network: 10 Gbps          │        │ (Opaque)     (Transparent)│         │                           │
   └───────────────────────────┘        └───────────────────────────┘         └───────────────────────────┘

 [State 2: Fully Unveiled]
   ┌───────────────────────────┐        ┌───────────────────────────┐         ┌───────────────────────────┐
   │ System Status: ACTIVE     │        │ █████████████████████████ │         │ System Status: ACTIVE     │
   │ CPU Load: 12%             │   ×    │ Alpha: 1.0 (Full Opaque)  │   =     │ CPU Load: 12%             │
   │ Network: 10 Gbps          │        │                           │         │ Network: 10 Gbps          │
   └───────────────────────────┘        └───────────────────────────┘         └───────────────────────────┘
```

---

## 1. Core Mechanics: How Mask Reveals Function

A **Mask Reveal** is the controlled transition of an element from hidden (or partially hidden) to fully visible by modulating the alpha matte of a CSS mask.

Unlike basic `opacity` animations (which fade an entire element uniformly) or `clip-path` transitions (which are restricted to sharp, binary vector polygons), **CSS Mask Reveals deliver**:
1. **Pixel-Level Alpha Falloff**: Soft, feathered leading edges, organic dissolves, and custom gradient transitions.
2. **Multi-Layer Stacking**: Revealing a glowing wireframe, a translated background, or a localized spotlight over top of static base content.
3. **Hardware Acceleration**: GPU fragment shaders calculate alpha multiplication on dedicated composition layers without triggering expensive DOM reflows.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REVEAL TECHNIQUE COMPARISON                           │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Property             │ Edge Softness        │ Animation Capability          │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ `opacity`            │ Uniform across frame │ Simple fade in / fade out     │
│ `clip-path`          │ Hard vector only     │ Polygon / circle morphing     │
│ `mask-image` Reveal  │ Soft, feathered,     │ Directional wipes, spotlights,│
│                      │ photographic, or hard│ irises, shutter blinds, sweeps│
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 2. The 3 Primary Mask Reveal Architectures

Depending on the desired visual effect and performance budget, CSS Mask Reveals are structured using one of three primary mechanics:

### 1. The Oversized Translation Technique (`mask-position`)
An oversized gradient mask (e.g., `mask-size: 300% 100%`) contains both transparent and opaque zones. Shifting `mask-position` sweeps the opaque window across the element.

```
Mask Layer (300% Width):
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  Transparent (0% Alpha) │  Feathered Ramp (0→1)   │   Opaque (100% Alpha)   │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
◄─────────────────────────── Translate Mask Position ─────────────────────────►
```

### 2. The Radial Iris / Spotlight Scale Technique (`mask-size` or Custom Geometry)
A centered radial gradient mask expands from `0px` radius to `150%` of the element container diagonal, creating a circular camera-iris reveal.

### 3. The Modern Registered Custom Property Technique (`@property`)
Registering CSS custom properties (e.g. `--reveal: 0%`) via `@property` allows CSS `@keyframes` and transitions to smoothly interpolate gradient color stops directly without stepping artifacts.

---

## 3. The 7 Essential Mask Reveal Patterns

---

### Pattern 1: Linear Gradient Diagonal Wipe (Hover / Auto-Play)

#### Visual Overview
A crisp yet softly feathered diagonal sweep moves across a card, unveiling secondary details or rich media beneath.

```
┌─────────────────────────────────────────────────────────┐
│ Card Media / Content                                    │
│ ████████████████████░░░░░░░░░░░░░░░░░░                  │
│ ████████████████████████████░░░░░░░░░░  <── Wipe Front  │
│ ██████████████████████████████████░░░░      (Feathered) │
│                                                         │
│ [Hover / Trigger drives mask-position across bounds]    │
└─────────────────────────────────────────────────────────┘
```

#### HTML
```html
<article class="reveal-card-diagonal" tabindex="0">
  <div class="card-base-content">
    <span class="badge">System Architecture</span>
    <h3>Distributed Event Bus</h3>
    <p>Hover or focus to inspect underlying telemetry pipelines.</p>
  </div>
  
  <div class="card-revealed-layer" aria-hidden="true">
    <div class="telemetry-grid">
      <div class="metric"><span>Throughput:</span><strong>2.4 GB/s</strong></div>
      <div class="metric"><span>Latency:</span><strong>1.8 ms</strong></div>
      <div class="metric"><span>Partitions:</span><strong>64 Active</strong></div>
      <div class="metric"><span>Redundancy:</span><strong>3x Raft</strong></div>
    </div>
  </div>
</article>
```

#### CSS
```css
.reveal-card-diagonal {
  position: relative;
  width: 100%;
  max-width: 440px;
  min-height: 220px;
  background: #0f172a;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
  color: #f8fafc;
  cursor: pointer;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease;
}

.reveal-card-diagonal:hover,
.reveal-card-diagonal:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(56, 189, 248, 0.4);
}

.card-base-content .badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.card-base-content h3 {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
}

.card-base-content p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* The Revealed Layer using Oversized Mask Sweep */
.card-revealed-layer {
  position: absolute;
  inset: 0;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  /* Setup 300% width diagonal linear gradient mask */
  -webkit-mask-image: linear-gradient(
    135deg,
    transparent 0%,
    transparent 35%,
    black 65%,
    black 100%
  );
  mask-image: linear-gradient(
    135deg,
    transparent 0%,
    transparent 35%,
    black 65%,
    black 100%
  );
  
  -webkit-mask-size: 300% 300%;
  mask-size: 300% 300%;
  
  /* Initial state: Hidden off to the bottom-right */
  -webkit-mask-position: 100% 100%;
  mask-position: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  transition: -webkit-mask-position 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              mask-position 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: mask-position, -webkit-mask-position;
}

/* Trigger Reveal on Parent Hover/Focus */
.reveal-card-diagonal:hover .card-revealed-layer,
.reveal-card-diagonal:focus-visible .card-revealed-layer {
  -webkit-mask-position: 0% 0%;
  mask-position: 0% 0%;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

.metric {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric span {
  font-size: 0.75rem;
  color: #cbd5e1;
}

.metric strong {
  font-size: 1.05rem;
  color: #38bdf8;
  font-family: monospace;
}
```

---

### Pattern 2: Expanding Radial Iris Aperture (Camera Shutter Reveal)

#### Visual Overview
A circular aperture expands outward from the center point, creating an organic camera-lens or cinematic iris opening.

```
       [Stage 1: Closed]               [Stage 2: Expanding]             [Stage 3: Full Aperture]
     ┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
     │                   │             │      ░█████░      │             │███████████████████│
     │        (•)        │     ──►     │    ███████████    │     ──►     │███████████████████│
     │                   │             │      ░█████░      │             │███████████████████│
     └───────────────────┘             └───────────────────┘             └───────────────────┘
```

#### HTML
```html
<section class="iris-banner" tabindex="0">
  <div class="banner-underlay">
    <div class="banner-text">
      <h2>Next-Gen Quantum Core</h2>
      <p>Instantaneous state synchronization across planetary clusters.</p>
    </div>
  </div>
  
  <div class="banner-overlay-iris">
    <div class="banner-text highlight">
      <h2>Hyper-Speed Operational</h2>
      <p>Sub-millisecond quorum achieved with zero consensus drift.</p>
    </div>
  </div>
</section>
```

#### CSS
```css
.iris-banner {
  position: relative;
  width: 100%;
  max-width: 600px;
  min-height: 260px;
  border-radius: 20px;
  overflow: hidden;
  box-sizing: border-box;
  background: #090d16;
  border: 1px solid #1e293b;
  cursor: pointer;
}

.banner-underlay,
.banner-overlay-iris {
  position: absolute;
  inset: 0;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.banner-underlay {
  background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
}

.banner-text {
  text-align: center;
  color: #94a3b8;
  max-width: 440px;
}

.banner-text h2 {
  color: #f1f5f9;
  font-size: 1.75rem;
  margin: 0 0 10px;
}

.banner-text p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.banner-overlay-iris {
  background: linear-gradient(135deg, #4338ca 0%, #ec4899 100%);
  
  /* Radial Mask setup with feathered edge */
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 0%,
    black 60%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle at center,
    black 0%,
    black 60%,
    transparent 100%
  );
  
  /* Size starts at 0% (closed aperture) */
  -webkit-mask-size: 0% 0%;
  mask-size: 0% 0%;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  
  transition: -webkit-mask-size 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
              mask-size 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: mask-size, -webkit-mask-size;
}

.banner-text.highlight h2 {
  color: #ffffff;
}

.banner-text.highlight p {
  color: #fce7f3;
}

/* On hover / focus: expand mask beyond corner hypotenuse (300% ensures full coverage) */
.iris-banner:hover .banner-overlay-iris,
.iris-banner:focus-visible .banner-overlay-iris {
  -webkit-mask-size: 300% 300%;
  mask-size: 300% 300%;
}
```

---

### Pattern 3: Interactive Pointer Spotlight Reveal (Mouse-Tracking Mask)

#### Visual Overview
A glowing, ultra-precise flashlight or radar spotlight follows the user's cursor across a dark interface card, revealing hidden circuitry, grid lines, or high-contrast typography directly under the mouse pointer.

```
       Cursor Position (X, Y)
                 │
                 ▼
     ┌───────────────────────────┐
     │                           │
     │          .─-─.            │
     │        '  ███  '  <── Spotlight radius dynamically positioned at (--x, --y)
     │       (  █████  )         Reveals hidden content underneath!
     │        '  ███  '          │
     │          '─-─'            │
     │                           │
     └───────────────────────────┘
```

#### HTML
```html
<div class="spotlight-card" id="spotlightCard">
  <!-- Default Base Layer (Subdued Dark Mode) -->
  <div class="spotlight-layer-base">
    <div class="spotlight-content">
      <div class="icon-lock">🛡️</div>
      <h3>Encrypted Vault Partition</h3>
      <p>Move your cursor across this surface to illuminate hidden cryptographic keys.</p>
    </div>
  </div>

  <!-- Hidden Illuminated Layer (Revealed only beneath cursor) -->
  <div class="spotlight-layer-glow" aria-hidden="true">
    <div class="spotlight-content">
      <div class="icon-lock active">⚡</div>
      <h3 class="glow-title">ACCESS GRANTED: LEVEL 4</h3>
      <div class="cipher-keys">
        <code>KEY_A: 0x9F4B_771C_88E2</code>
        <code>CIPHER: AES-GCM-256-POLY1305</code>
        <code>NONCE: 8812049182390192</code>
      </div>
    </div>
  </div>
</div>
```

#### CSS
```css
.spotlight-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-radius: 180px;

  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: 260px;
  border-radius: 18px;
  background: #0b0f19;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.spotlight-layer-base,
.spotlight-layer-glow {
  position: absolute;
  inset: 0;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.spotlight-content {
  width: 100%;
}

.spotlight-layer-base h3 {
  color: #e2e8f0;
  margin: 12px 0 6px;
  font-size: 1.25rem;
}

.spotlight-layer-base p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.icon-lock {
  font-size: 2rem;
}

/* The Masked Spotlight Layer */
.spotlight-layer-glow {
  background: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    #1e1b4b 0%,
    #0f172a 100%
  );
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 18px;

  /* Radial Mask centered precisely at the cursor CSS variables */
  -webkit-mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.6) 65%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.6) 65%,
    transparent 100%
  );

  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  will-change: mask-image, -webkit-mask-image;
}

/* Fade in spotlight when mouse enters container */
.spotlight-card:hover .spotlight-layer-glow {
  opacity: 1;
}

.glow-title {
  color: #38bdf8;
  margin: 12px 0 10px;
  font-size: 1.25rem;
  letter-spacing: 0.05em;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
}

.cipher-keys {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cipher-keys code {
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 0.8rem;
  color: #a5f3fc;
  background: rgba(6, 182, 212, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(6, 182, 212, 0.2);
}
```

#### JavaScript (Pointer Event Listener for CSS Custom Properties)
```javascript
const card = document.getElementById('spotlightCard');

card.addEventListener('pointermove', (event) => {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Set coordinates directly onto the DOM element for GPU-bound CSS rendering
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
});
```

---

### Pattern 4: Smooth Dual-Layer Split Slider Reveal (Before / After Comparison)

#### Visual Overview
A split comparison slider that uses a single CSS mask to unveil a modified layer (e.g., Code vs. Render, Dark vs. Light, Unprocessed RAW vs. Color-Graded Output).

```
   0%                                   Slider Pos (e.g. 62%)                      100%
   ┌──────────────────────────────────────────────┬───────────────────────────────────┐
   │ Layer A: Wireframe / Raw                     │ Layer B: Render / Graded          │
   │ █████████████████████████████████████████████│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
   │                                              │                                   │
   └──────────────────────────────────────────────┴───────────────────────────────────┘
                                                  ▲
                                             Divider Bar
```

#### HTML
```html
<div class="split-mask-slider" id="compareContainer">
  <!-- Background Image: Processed Render -->
  <div class="slide-layer layer-after">
    <div class="layer-badge">High-Res Render</div>
    <div class="render-visual-artistic"></div>
  </div>

  <!-- Foreground Masked Image: Wireframe Mesh -->
  <div class="slide-layer layer-before">
    <div class="layer-badge wire-badge">Topology Wireframe</div>
    <div class="render-visual-wireframe"></div>
  </div>

  <!-- Interactive Range Input controlling CSS Variable -->
  <input 
    type="range" 
    class="slider-handle-control" 
    id="splitRange" 
    min="0" 
    max="100" 
    value="50" 
    aria-label="Image comparison slider"
  >
  
  <!-- Visual Divider Handle Indicator -->
  <div class="slider-divider-line" style="left: 50%;">
    <div class="handle-grip">⇄</div>
  </div>
</div>
```

#### CSS
```css
.split-mask-slider {
  --split-pos: 50%;

  position: relative;
  width: 100%;
  max-width: 640px;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-sizing: border-box;
  background: #020617;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.slide-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  z-index: 5;
}

.wire-badge {
  right: auto;
  left: 16px;
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.3);
}

/* Background Artwork */
.render-visual-artistic {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%);
}

/* Wireframe Foreground Artwork */
.render-visual-wireframe {
  width: 100%;
  height: 100%;
  background-color: #0f172a;
  background-image: 
    linear-gradient(rgba(244, 63, 94, 0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244, 63, 94, 0.25) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Masking the Foreground Layer based on --split-pos variable */
.layer-before {
  -webkit-mask-image: linear-gradient(
    to right,
    black 0%,
    black var(--split-pos),
    transparent var(--split-pos),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    black 0%,
    black var(--split-pos),
    transparent var(--split-pos),
    transparent 100%
  );
  will-change: mask-image, -webkit-mask-image;
}

/* Range input mapped over entire component */
.slider-handle-control {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 20;
  margin: 0;
}

/* Visual Line & Handle */
.slider-divider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ffffff;
  pointer-events: none;
  z-index: 10;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.handle-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: #ffffff;
  color: #0f172a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

#### JavaScript (Sync Range Input with CSS Custom Property)
```javascript
const slider = document.getElementById('splitRange');
const container = document.getElementById('compareContainer');
const divider = container.querySelector('.slider-divider-line');

slider.addEventListener('input', (e) => {
  const value = `${e.target.value}%`;
  container.style.setProperty('--split-pos', value);
  divider.style.left = value;
});
```

---

### Pattern 5: Multi-Bar Venetian Shutter Blinds Reveal

#### Visual Overview
The element reveals via repeating geometric slats or venetian blinds that expand concurrently from thin lines to full width.

```
       [Stage 1: Closed Slats]         [Stage 2: Half Open]          [Stage 3: Fully Open]
     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
     │ ─────────────────────── │     │ ██████████░░░░░░░░░░░░░ │     │ ███████████████████████ │
     │ ─────────────────────── │ ──► │ ██████████░░░░░░░░░░░░░ │ ──► │ ███████████████████████ │
     │ ─────────────────────── │     │ ██████████░░░░░░░░░░░░░ │     │ ███████████████████████ │
     └─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

#### CSS Implementation using Repeating Linear Gradient
```css
@property --blind-open {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.venetian-reveal-card {
  --blind-open: 0%;

  position: relative;
  width: 100%;
  max-width: 440px;
  min-height: 200px;
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
  color: white;
}

.venetian-revealed-media {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;

  /* 20px repeating horizontal blinds */
  -webkit-mask-image: repeating-linear-gradient(
    to bottom,
    black 0%,
    black var(--blind-open),
    transparent var(--blind-open),
    transparent 20px
  );
  mask-image: repeating-linear-gradient(
    to bottom,
    black 0%,
    black var(--blind-open),
    transparent var(--blind-open),
    transparent 20px
  );

  transition: --blind-open 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: mask-image, -webkit-mask-image;
}

/* On hover/focus, expand each 20px stripe from 0% to 20px (100% coverage) */
.venetian-reveal-card:hover .venetian-revealed-media,
.venetian-reveal-card:focus-visible .venetian-revealed-media {
  --blind-open: 20px;
}
```

---

### Pattern 6: Shimmering Text Knockout Sweep Reveal

#### Visual Overview
A hero headline that appears with a sweeping metallic or rainbow mask gradient, making typography unveil progressively with a specular highlight.

```
       [Sweep Direction ────────►]
     ┌─────────────────────────────────────────────────────────┐
     │   K I N E T I C   T Y P O G R A P H Y   R E V E A L     │
     │   ░░░░░░░░░░░░░░░████████████████████████████           │
     │   (Transparent)   (Specular Peak)       (Fully Visible) │
     └─────────────────────────────────────────────────────────┘
```

#### HTML
```html
<div class="text-reveal-container">
  <h1 class="text-mask-headline">
    ENGINEERED FOR SUPREMACY
  </h1>
</div>
```

#### CSS
```css
.text-reveal-container {
  padding: 40px 20px;
  background: #030712;
  text-align: center;
}

.text-mask-headline {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
  
  /* Vibrant Metallic Holographic Gradient */
  background: linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  /* Sweeping Mask Setup */
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 20%,
    black 40%,
    black 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 20%,
    black 40%,
    black 100%
  );
  
  -webkit-mask-size: 250% 100%;
  mask-size: 250% 100%;
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  animation: textMaskSweep 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes textMaskSweep {
  0% {
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
    opacity: 0;
    transform: translateY(12px);
  }
  30% {
    opacity: 1;
  }
  100% {
    -webkit-mask-position: 0% 0;
    mask-position: 0% 0;
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Pattern 7: Modern Scroll-Driven Mask Reveal (`animation-timeline`)

#### Visual Overview
As the user scrolls the page, an element progressively unmasks proportional to its intersection within the viewport—without needing ScrollMagic, GSAP, or window scroll event listeners.

```
 Viewport Top
┌───────────────────────────┐
│                           │
│   [ Scroll Direction ▼ ]  │
│   ┌───────────────────┐   │
│   │ █████████████████ │   │ ◄── Element entering viewport:
│   │ ░░░░░░░░░░░░░░░░░ │   │     Mask expands from 0% to 100% scroll progress
│   └───────────────────┘   │
│                           │
└───────────────────────────┘
 Viewport Bottom
```

#### CSS
```css
/* Register CSS property for smooth scroll interpolation */
@property --scroll-reveal {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.scroll-masked-section {
  --scroll-reveal: 0%;

  width: 100%;
  max-width: 680px;
  margin: 60px auto;
  border-radius: 20px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #334155;

  /* Progressive Fallback Mask */
  -webkit-mask-image: linear-gradient(
    to bottom,
    black var(--scroll-reveal),
    transparent calc(var(--scroll-reveal) + 20%)
  );
  mask-image: linear-gradient(
    to bottom,
    black var(--scroll-reveal),
    transparent calc(var(--scroll-reveal) + 20%)
  );

  /* Modern CSS Scroll-Driven Animations Specification */
  animation: scrollUnveil linear both;
  animation-timeline: view(block);
  animation-range: entry 15% cover 50%;
}

@keyframes scrollUnveil {
  from {
    --scroll-reveal: 0%;
    transform: scale(0.95);
  }
  to {
    --scroll-reveal: 100%;
    transform: scale(1);
  }
}

/* Fallback for browsers without Scroll Timeline support */
@supports not (animation-timeline: view()) {
  .scroll-masked-section {
    -webkit-mask-image: none;
    mask-image: none;
  }
}
```

---

## 4. Deep Dive: CSS `@property` for Smooth Mask Interpolation

Historically, animating CSS gradients caused harsh stepping or flickering because browsers could not natively interpolate between strings like `linear-gradient(...)`.

By defining strongly typed custom properties with `@property`, modern browsers smoothly interpolate gradient stops, radii, and angles at a native 60–120 FPS.

```css
/* 1. Registering Custom Percentage Property */
@property --mask-stop {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

/* 2. Registering Custom Angle Property */
@property --mask-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* 3. Registering Custom Length Property */
@property --mask-radius {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}
```

### Animating Registered Properties with `@keyframes`
```css
.card-property-reveal {
  --mask-stop: 0%;
  
  -webkit-mask-image: linear-gradient(
    to right,
    black 0%,
    black var(--mask-stop),
    transparent calc(var(--mask-stop) + 15%),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    black 0%,
    black var(--mask-stop),
    transparent calc(var(--mask-stop) + 15%),
    transparent 100%
  );
  
  transition: --mask-stop 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-property-reveal:hover {
  --mask-stop: 100%;
}
```

---

## 5. Master Production Showcase: Interactive Cybernetic Telemetry Card

Here is a complete, fully functional, responsive, and production-grade master component demonstrating combined cursor-tracked spotlight reveal, diagonal gradient sweeps, glassmorphic HUD overlays, and high-performance GPU compositing.

### Complete HTML & CSS Showcase

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Mask Reveal Production Masterclass</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <style>
    /* ==========================================================================
       1. CSS CUSTOM PROPERTIES & TOKENS
       ========================================================================== */
    :root {
      --bg-dark: #030712;
      --card-bg: #090e1a;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-cyan: #06b6d4;
      --accent-blue: #3b82f6;
      --accent-emerald: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      line-height: 1.5;
    }

    .showcase-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .showcase-header h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 8px;
    }

    .showcase-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* ==========================================================================
       2. TELEMETRY CARD MASK REVEAL CONTAINER
       ========================================================================== */
    .telemetry-card {
      --mouse-x: 50%;
      --mouse-y: 50%;
      --spotlight-radius: 200px;

      position: relative;
      width: 100%;
      max-width: 520px;
      min-height: 320px;
      border-radius: 24px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      overflow: hidden;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.7),
        0 0 0 1px rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.4s ease,
                  box-shadow 0.4s ease;
    }

    .telemetry-card:hover {
      transform: translateY(-4px);
      border-color: rgba(6, 182, 212, 0.35);
      box-shadow: 
        0 30px 60px -15px rgba(0, 0, 0, 0.8),
        0 0 30px rgba(6, 182, 212, 0.15);
    }

    /* ==========================================================================
       3. BASE LAYER (DEFAULT STATIC STATE)
       ========================================================================== */
    .card-layer-base {
      position: absolute;
      inset: 0;
      padding: 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 1;
    }

    .top-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #64748b;
      box-shadow: 0 0 8px rgba(100, 116, 139, 0.5);
    }

    .cluster-id {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #64748b;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .card-layer-base h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 16px 0 8px;
    }

    .card-layer-base p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .base-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.85rem;
      color: #64748b;
    }

    .hint-text {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ==========================================================================
       4. REVEALED SPOTLIGHT HUD LAYER
       ========================================================================== */
    .card-layer-revealed {
      position: absolute;
      inset: 0;
      padding: 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 2;
      pointer-events: none;
      background: 
        radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        #0b1329;
      
      /* Cross-Browser Radial Gradient Mask */
      -webkit-mask-image: radial-gradient(
        circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
        black 0%,
        rgba(0, 0, 0, 0.8) 60%,
        transparent 100%
      );
      mask-image: radial-gradient(
        circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
        black 0%,
        rgba(0, 0, 0, 0.8) 60%,
        transparent 100%
      );

      opacity: 0;
      transition: opacity 0.35s ease;
      will-change: mask-image, -webkit-mask-image;
    }

    .telemetry-card:hover .card-layer-revealed {
      opacity: 1;
    }

    /* Revealed state live elements */
    .active-dot {
      background: var(--accent-emerald);
      box-shadow: 0 0 10px var(--accent-emerald);
      animation: pulseDot 2s infinite ease-in-out;
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }

    .live-status {
      color: var(--accent-emerald);
    }

    .hud-title {
      color: #ffffff !important;
      text-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
    }

    .stats-matrix {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 16px 0;
    }

    .stat-box {
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      backdrop-filter: blur(8px);
    }

    .stat-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #a5f3fc;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-val {
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .revealed-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid rgba(6, 182, 212, 0.2);
      font-size: 0.85rem;
    }

    .action-btn {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    /* ==========================================================================
       5. ACCESSIBILITY: REDUCED MOTION OVERRIDE
       ========================================================================== */
    @media (prefers-reduced-motion: reduce) {
      .telemetry-card {
        transition: none;
      }
      .card-layer-revealed {
        -webkit-mask-image: none !important;
        mask-image: none !important;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .telemetry-card:hover .card-layer-revealed,
      .telemetry-card:focus-visible .card-layer-revealed {
        opacity: 1;
      }
    }
  </style>
</head>
<body>

  <header class="showcase-header">
    <h1>CSS Mask Reveal Engine</h1>
    <p>Hover or move your cursor across the card to unveil real-time telemetry.</p>
  </header>

  <main>
    <article class="telemetry-card" id="interactiveTelemetryCard" tabindex="0">
      
      <!-- Base Subdued View -->
      <div class="card-layer-base">
        <div class="top-meta">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>Standby Node</span>
          </div>
          <span class="cluster-id">NODE::US-EAST-01</span>
        </div>

        <div>
          <h2>Autonomous Gateway</h2>
          <p>Zero-trust ingress proxy handling edge TLS termination and rate-limiting enforcement.</p>
        </div>

        <div class="base-footer">
          <span class="hint-text">💡 Hover to inspect live metrics</span>
          <span>v2.4.8</span>
        </div>
      </div>

      <!-- Revealed Live Telemetry Layer -->
      <div class="card-layer-revealed" aria-hidden="true">
        <div class="top-meta">
          <div class="status-indicator live-status">
            <span class="status-dot active-dot"></span>
            <span>Live Stream Synchronized</span>
          </div>
          <span class="cluster-id" style="color: var(--accent-cyan);">RTT: 0.42ms</span>
        </div>

        <div>
          <h2 class="hud-title">ACTIVE CLUSTER TELEMETRY</h2>
          <div class="stats-matrix">
            <div class="stat-box">
              <span class="stat-label">Requests</span>
              <span class="stat-val">42.8k/s</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">CPU Load</span>
              <span class="stat-val">18.4%</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Health</span>
              <span class="stat-val">99.99%</span>
            </div>
          </div>
        </div>

        <div class="revealed-footer">
          <span style="color: #38bdf8; font-family: var(--font-mono); font-size: 0.75rem;">TLS 1.3 / HTTP/3 QUIC</span>
          <button class="action-btn" type="button">Purge Cache</button>
        </div>
      </div>

    </article>
  </main>

  <script>
    // High-performance pointer tracking updating CSS custom variables
    const card = document.getElementById('interactiveTelemetryCard');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  </script>
</body>
</html>
```

---

## 6. Accessibility & Reduced Motion Best Practices

Interactive and animated mask reveals can trigger vestibular motion sensitivity or cause confusion for users relying on screen readers. Follow these accessibility rules:

### 1. The `prefers-reduced-motion` Media Query
When a user requests reduced motion in their OS settings, disable sweeping/zooming mask animations in favor of simple, static opacity reveals:

```css
@media (prefers-reduced-motion: reduce) {
  .card-revealed-layer,
  .banner-overlay-iris,
  .spotlight-layer-glow {
    -webkit-mask-image: none !important;
    mask-image: none !important;
    transition: opacity 0.15s ease-in-out !important;
  }
}
```

### 2. ARIA & Screen Reader Management
* When using a dual-layer mask reveal where the hidden layer repeats or enhances text, mark the overlay layer with `aria-hidden="true"`, or ensure the DOM order is logical.
* If the reveal discloses interactive controls (like buttons or links), ensure they receive keyboard `:focus-visible` and that focus unmasks the container:

```css
.reveal-card:focus-within .card-revealed-layer {
  -webkit-mask-position: 0% 0%;
  mask-position: 0% 0%;
  opacity: 1;
}
```

---

## 7. Performance & GPU Rendering Optimization

CSS Masking incurs GPU fragment shader operations during compositing. Follow these rules to guarantee smooth 60fps / 120fps frame rates:

### 1. Promote Masked Containers to Dedicated Compositing Layers
When animating `mask-position` or custom properties inside `mask-image`, declare `will-change`:

```css
.card-revealed-layer {
  will-change: mask-position, -webkit-mask-position;
  transform: translateZ(0); /* Promotes layer on legacy WebKit */
}
```

### 2. Prefer CSS Gradients Over Heavy Raster Bitmaps
* Procedural gradients (`linear-gradient`, `radial-gradient`) are evaluated algebraically by GPU fragment shaders and consume zero texture VRAM.
* Avoid using large 4K uncompressed PNGs for mask reveals unless complex artistic brush strokes are strictly required.

---

## 8. Cross-Browser Compatibility Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER COMPATIBILITY TABLE                               │
├────────────────────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤
│ Feature                    │ Chrome/Edge │ Safari      │ Firefox     │ iOS Safari      │
├────────────────────────────┼─────────────┼─────────────┼─────────────┼─────────────────┤
│ `mask-image` (Standard)    │ 120+        │ 15.4+       │ 53+         │ 15.4+           │
│ `-webkit-mask-image`       │ 1.0+        │ 4.0+        │ N/A         │ 3.2+            │
│ `@property` Interpolation  │ 85+         │ 16.4+       │ 128+        │ 16.4+           │
│ `animation-timeline: view` │ 115+        │ ⚠️ Preview  │ ⚠️ Flag     │ ⚠️ Preview      │
└────────────────────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘
```

> [!IMPORTANT]
> **The Dual Prefix Golden Rule**: Even in modern browsers, Chromium and WebKit engines have the highest reliability when both `-webkit-mask-*` and standard `mask-*` rules are defined in tandem.

---

## 9. Common Pitfalls & Troubleshooting Guide

### 1. The Mask Disappears or Does Not Animate in Safari / Chrome
* **Symptom**: CSS works in Firefox, but element is completely invisible or fails to animate in Safari / Chrome.
* **Cause**: Missing `-webkit-` vendor prefix on `mask-image`, `mask-size`, or `mask-position`.
* **Fix**: Always declare both prefixed and standard properties:
  ```css
  -webkit-mask-image: linear-gradient(black, transparent);
  mask-image: linear-gradient(black, transparent);
  -webkit-mask-position: 0% 0%;
  mask-position: 0% 0%;
  ```

### 2. Mask Gradient Stop Jumping Instead of Smoothly Transitioning
* **Symptom**: Transitioning a gradient like `linear-gradient(to right, black var(--pos), transparent var(--pos))` snaps instantly between 0% and 100%.
* **Cause**: Untyped CSS custom variables cannot be interpolated by default.
* **Fix**: Register the custom variable with `@property`:
  ```css
  @property --pos {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 0%;
  }
  ```

### 3. Mask Repeated Tiling Artifacts
* **Symptom**: A single spotlight or sweep duplicates across the surface in a grid.
* **Cause**: `mask-repeat` defaults to `repeat` just like `background-repeat`.
* **Fix**: Explicitly set `-webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;`.

---

## 10. Quick Syntax Reference Cheatsheet

```css
/* 1. Diagonal Wipe Reveal */
-webkit-mask-image: linear-gradient(135deg, transparent 40%, black 60%);
mask-image: linear-gradient(135deg, transparent 40%, black 60%);
-webkit-mask-size: 300% 300%;
mask-size: 300% 300%;
-webkit-mask-position: 100% 100%; /* Transition to 0% 0% on hover */
mask-position: 100% 100%;

/* 2. Expanding Radial Iris Reveal */
-webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
-webkit-mask-size: 0% 0%; /* Transition to 300% 300% on hover */
mask-size: 0% 0%;
-webkit-mask-position: center;
mask-position: center;
-webkit-mask-repeat: no-repeat;
mask-repeat: no-repeat;

/* 3. Pointer-Tracked Spotlight Reveal */
-webkit-mask-image: radial-gradient(circle 180px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%);
mask-image: radial-gradient(circle 180px at var(--mouse-x) var(--mouse-y), black 0%, transparent 100%);

/* 4. Split Comparison Mask */
-webkit-mask-image: linear-gradient(to right, black var(--pos), transparent var(--pos));
mask-image: linear-gradient(to right, black var(--pos), transparent var(--pos));

/* 5. Venetian Shutter Blinds */
-webkit-mask-image: repeating-linear-gradient(to bottom, black 0 var(--open), transparent var(--open) 20px);
mask-image: repeating-linear-gradient(to bottom, black 0 var(--open), transparent var(--open) 20px);
```
