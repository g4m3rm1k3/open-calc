---
concept: 052-circular-mask
name: Circular Mask (mask-image) in Modern CSS
category: CSS Visual Effects, Masking & Compositing
difficulty: Intermediate to Advanced
tags: [css, mask, mask-image, circular-mask, radial-gradient, webkit-mask, svg-mask, compositing, visual-effects, spotlight, interactive-ui, modern-css]
---

# 052: CSS Circular Mask (`mask-image: radial-gradient`) Masterclass

## Overview & Executive Summary

In contemporary UI engineering and creative front-end design, controlling the visible silhouette, focal transparency, and boundary softness of elements is a fundamental visual discipline. While classic CSS primitives like `border-radius: 50%` round a box's border/background and `clip-path: circle()` carve crisp vector perimeters, **CSS Circular Masking** (`mask-image: radial-gradient(...)` and SVG circular masks) unlocks **true per-pixel 8-bit alpha compositing**.

Circular masking allows developers to seamlessly fade elements from a focal center, create feathered spotlights and vignette apertures, punch non-destructive circular notches (e.g., status badges on avatars), construct interactive cursor-following flashlight reveals, build annular (donut/ring) masks, and execute cinematic iris wipes—all natively in hardware-accelerated CSS without mutating source raster assets or incurring heavy canvas/WebGL overhead.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   THE CIRCULAR CSS MASKING ARCHITECTURE                     │
│                                                                             │
│   Source Element            Circular Mask (Alpha Map)       Composited UI   │
│   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐  │
│   │ Image, Video,    │      │  1.0 Alpha (Ctr) │      │  Focal Highlight │  │
│   │ Typography, or   │  ×   │    (●) Black     │  =   │    (●) Visible   │  │
│   │ UI Stacking Card │      │  0.0 Alpha (Out) │      │  ░░░ Soft Fade   │  │
│   │                  │      │    ( ) Trnsp     │      │      Transparent │  │
│   └──────────────────┘      └──────────────────┘      └──────────────────┘  │
│                                                                             │
│  [Source Pixel Color] × [Mask Alpha at Coordinate (x,y)] = Rendered Pixel   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Concept Name** | CSS Circular Mask (`mask-image: radial-gradient(circle...)`) |
| **Category** | Visual Effects, Masking & Layer Compositing |
| **Specification** | [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) |
| **Difficulty** | Intermediate to Advanced (3.5 / 5) |
| **Core Primitives** | `mask-image`, `-webkit-mask-image`, `radial-gradient()`, `mask-size`, `mask-position`, `mask-composite`, `@property` |
| **What it produces** | Continuous alpha-channel transparency graded circularly from any anchor point, enabling soft vignettes, crisp circle cutouts, donut knockouts, interactive torchlight reveals, and notch punch-outs. |
| **Why it works** | The rendering engine evaluates the mathematical radial distance from a designated focal point $(c_x, c_y)$ to each pixel coordinate $(x, y)$, computes the gradient stop alpha $\alpha$, and multiplies the source element's RGBA buffer by $\alpha$. |
| **Browser Support** | All evergreen browsers (Chrome, Edge, Safari, Firefox, iOS WebKit, Android Chrome). **Note**: WebKit/Blink engines require `-webkit-mask-*` declarations alongside standard `mask-*`. |

### Quick Preview

```html
<div class="circular-spotlight-card">
  <img src="cyber-city.jpg" alt="Cyberpunk Metropolis" />
  <div class="card-content">
    <h3>Neo Tokyo 2099</h3>
    <p>Soft radial aperture masking over content layer.</p>
  </div>
</div>
```

```css
.circular-spotlight-card {
  position: relative;
  width: 360px;
  height: 480px;
  overflow: hidden;
  border-radius: 16px;
}

.circular-spotlight-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  
  /* Modern Cross-Engine Circular Mask */
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
}
```

---

## 1. Geometric Foundations & Mental Models

To master circular masking, one must understand how 2D coordinate spaces translate into radial alpha values.

### 1.1 The Radial Coordinate Space

In CSS, a radial gradient defines an origin center $(c_x, c_y)$ and an ending shape radius $R$. For any given pixel $P(x, y)$ on the element:

$$\text{Distance } d = \sqrt{(x - c_x)^2 + (y - c_y)^2}$$

The alpha opacity value $\alpha(d)$ is determined by where $d$ falls along the defined gradient color stops:

```
Center (cx, cy)
      │
      ▼
      ● ───────────────────────────────► R (Ending Radius)
   d = 0                                d = R
   Alpha = 1.0 (Black/Opaque)           Alpha = 0.0 (Transparent)
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RADIAL GRADIENT STOP INTERPOLATION                       │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Stop Position (d)    │ Mask Color / Alpha   │ Rendered Element Visibility   │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ $0 \le d \le 30\%$   │ `black` ($\alpha=1$) │ $100\%$ Solid Visible         │
│ $30\% < d < 70\%$    │ Linear Falloff       │ $100\% \to 0\%$ Smooth Fade   │
│ $d \ge 70\%$         │ `transparent` ($0$)  │ $0\%$ Completely Invisible    │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 1.2 Alpha Masking Rule (Color Agnosticism)

Under the default `mask-mode: alpha`, **only the transparency channel of the mask gradient matters**:

* `rgb(0, 0, 0)` with $\alpha = 1.0$ is $100\%$ visible.
* `rgb(255, 255, 255)` with $\alpha = 1.0$ is $100\%$ visible.
* `rgb(255, 0, 128)` with $\alpha = 1.0$ is $100\%$ visible.
* `rgba(0, 0, 0, 0)` ($\alpha = 0.0$) is $100\%$ transparent (hidden).

> [!TIP]
> Always use `black` (or `#000`) and `transparent` when authoring gradient masks. It makes code intent unmistakable to other engineers on your team.

---

## 2. Circular Mask vs. `border-radius: 50%` vs. `clip-path: circle()`

Choosing the appropriate CSS technique is critical for rendering performance, anti-aliasing, and visual capability:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE CIRCULAR TECHNIQUES SPECTRUM                       │
├───────────────────┬─────────────────────────┬───────────────────────────────┤
│ border-radius: 50%│ clip-path: circle(...)  │ mask-image: radial-gradient() │
├───────────────────┼─────────────────────────┼───────────────────────────────┤
│ • Curves border & │ • Binary vector clip    │ • 8-bit per-pixel alpha mask  │
│   background only │ • Hard geometric edge   │ • Infinitely soft feathering  │
│ • Child overflow  │ • Zero edge feathering  │ • Inverted cutouts & holes    │
│   needs overflow: │ • High GPU performance  │ • Multi-circle compositing    │
│   hidden          │ • Sharp transitions     │ • Independent sizing/position │
└───────────────────┴─────────────────────────┴───────────────────────────────┘
```

### In-Depth Comparison Matrix

| Feature | `border-radius: 50%` | `clip-path: circle()` | `mask-image: radial-gradient()` |
| :--- | :--- | :--- | :--- |
| **Alpha Feathering / Soft Falloff** | ❌ No | ❌ No (strictly binary) | ✔️ **Yes (0% to 100% continuous)** |
| **Punched Holes / Annulus (Donuts)** | ❌ No | ⚠️ Complex (nested `evenodd` path) | ✔️ **Yes (effortless color stops)** |
| **Notch / Badge Cutouts** | ❌ No | ⚠️ Requires manual SVG clipPath | ✔️ **Yes (`mask-composite` / math)** |
| **Multiple Circular Apertures** | ❌ No | ❌ Single circle per rule | ✔️ **Yes (comma-separated gradients)** |
| **Anti-Aliased Subpixel Edges** | ✔️ Native | ⚠️ Browser rasterizer dependent | ✔️ **Custom subpixel anti-aliasing** |
| **Hit-Testing / Pointer Events** | Box bounds unless SVGs | Matches clipped shape | Box bounds (needs `pointer-events`) |
| **GPU Raster Overhead** | Minimal | Very Low | Low to Moderate |
| **Dynamic Positioning (`at x y`)** | ❌ No (box-bound) | ✔️ `circle(r at x y)` | ✔️ `radial-gradient(circle at x y)` |

---

## 3. Core Radial Gradient Syntax for Circular Masks

The full formal syntax for CSS circular masks is:

```css
mask-image: radial-gradient(
  [ <ending-shape> || <size> ] [ at <position> ]?,
  <color-stop-list>
);
```

### 3.1 Shape & Radius Sizing Keywords

To guarantee a circular (equidistant) mask rather than an ellipse, always declare the `circle` keyword:

```css
/* 1. Explicit Length Radius */
mask-image: radial-gradient(circle 120px at center, black 100%, transparent 100%);

/* 2. Closest-Side Keyword (Radius = distance to closest edge) */
mask-image: radial-gradient(circle closest-side at 30% 40%, black 100%, transparent 100%);

/* 3. Farthest-Side Keyword (Radius = distance to farthest edge) */
mask-image: radial-gradient(circle farthest-side at center, black 100%, transparent 100%);

/* 4. Closest-Corner Keyword (Radius = distance to closest vertex) */
mask-image: radial-gradient(circle closest-corner at center, black 100%, transparent 100%);

/* 5. Farthest-Corner Keyword (Default: covers entire bounding box) */
mask-image: radial-gradient(circle farthest-corner at center, black 100%, transparent 100%);
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RADIUS SIZING KEYWORDS VISUALIZED                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                      closest-side                       │               │
│   │                       ▲                                 │               │
│   │                       │                                 │               │
│   │           ┌───────────┼───────────┐                     │               │
│   │           │         ( ● )         │                     │               │
│   │   ◄───────┼───────────┼───────────┼───────────────►     │               │
│   │           │           │           │  farthest-side      │               │
│   │           └───────────┼───────────┘                     │               │
│   │                       ▼                                 │               │
│   │                                                         │               │
│   │                                       farthest-corner ──►               │
│   └─────────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Dynamic Positioning (`at <position>`)

The center anchor of the circle can be placed anywhere within or outside the element's coordinate box:

```css
/* Center */
mask-image: radial-gradient(circle at center, black, transparent);

/* Named Edges */
mask-image: radial-gradient(circle at top right, black, transparent);

/* Percentage Coordinates */
mask-image: radial-gradient(circle at 25% 75%, black, transparent);

/* Pixel / Calculation Offsets */
mask-image: radial-gradient(circle at calc(100% - 24px) 24px, black, transparent);

/* CSS Custom Property Driven (for cursor or sensor tracking) */
mask-image: radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent);
```

---

## 4. The 6 Fundamental Circular Mask Patterns

---

### Pattern 1: Crisp Anti-Aliased Circle Mask

#### The Subpixel Anti-Aliasing Problem
If you define abrupt zero-distance stops like `black 50%, transparent 50%`, browser rendering engines will produce visible **jagged staircase artifacts (aliasing)** on high-contrast backgrounds:

```css
/* ❌ JAGGED ALIASED EDGES */
mask-image: radial-gradient(circle, black 50%, transparent 50%);
```

#### The 1-Pixel Subpixel Delta Fix
To ensure clean anti-aliasing across standard and Retina displays, insert a subpixel transition ramp ($\approx 0.5\text{px} - 1.5\text{px}$ or $0.5\%$):

```css
/* ✔️ SILKY SMOOTH ANTI-ALIASED EDGE */
mask-image: radial-gradient(
  circle closest-side,
  black calc(100% - 1.5px),
  transparent 100%
);
```

```
Aliased (Hard Stop):      [1.0][1.0][1.0][0.0][0.0]  <-- Noticeable pixel jump
Anti-Aliased (Subpixel):  [1.0][1.0][0.7][0.2][0.0]  <-- Smooth optical blend
```

---

### Pattern 2: Soft Feathered Spotlight / Vignette Aperture

Creates a gradual, cinematic light falloff from solid opacity at the center to complete transparency at the outer boundary:

```css
.spotlight-vignette {
  -webkit-mask-image: radial-gradient(
    circle at 50% 50%,
    black 20%,
    rgba(0, 0, 0, 0.8) 45%,
    rgba(0, 0, 0, 0.2) 70%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle at 50% 50%,
    black 20%,
    rgba(0, 0, 0, 0.8) 45%,
    rgba(0, 0, 0, 0.2) 70%,
    transparent 100%
  );
}
```

```
┌──────────────────────────────────────┐
│ · · · · · · · · · · · · · · · · · ·  │  <-- 0% Alpha (Transparent)
│ · · · · ░░░░░░░░░░░░░░░░░░░ · · · ·  │  <-- 20% Alpha
│ · · · ░░█████████████████░░ · · · ·  │  <-- 80% Alpha
│ · · · ░░█████████████████░░ · · · ·  │  <-- 100% Solid Center
│ · · · · ░░░░░░░░░░░░░░░░░░░ · · · ·  │
│ · · · · · · · · · · · · · · · · · ·  │
└──────────────────────────────────────┘
```

---

### Pattern 3: Inverted Circular Cutout (Hole Punch / Keyhole Mask)

Often in modals, onboarding walkthroughs, or privacy overlays, you need the entire screen or card visible *except* for a transparent circular aperture punching through to the layer below.

#### Method A: Single Inverted Gradient (Easiest & Fastest)
Invert the color stops so the center is transparent and the outer perimeter is solid black:

```css
.keyhole-overlay {
  -webkit-mask-image: radial-gradient(
    circle 80px at var(--target-x, 50%) var(--target-y, 50%),
    transparent 0px,
    transparent 79px,
    black 80.5px,
    black 100%
  );
  mask-image: radial-gradient(
    circle 80px at var(--target-x, 50%) var(--target-y, 50%),
    transparent 0px,
    transparent 79px,
    black 80.5px,
    black 100%
  );
}
```

#### Method B: Dual Layer Composited Punch-Out (`mask-composite`)

```css
.keyhole-composited {
  /* Layer 1: Solid base | Layer 2: Circle punch */
  -webkit-mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 80px at center, black 100%, transparent 100%);
  -webkit-mask-composite: destination-out;

  mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 80px at center, black 100%, transparent 100%);
  mask-composite: subtract; /* Standard W3C */
}
```

---

### Pattern 4: Annular Mask (Donut / Concentric Ring)

By chaining color stops from transparent $\to$ opaque $\to$ transparent, you create hollow circular rings without SVG geometry:

```css
.donut-mask {
  -webkit-mask-image: radial-gradient(
    circle closest-side,
    transparent 0%,
    transparent calc(40% - 1px),
    black 40%,
    black calc(70% - 1px),
    transparent 70%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle closest-side,
    transparent 0%,
    transparent calc(40% - 1px),
    black 40%,
    black calc(70% - 1px),
    transparent 70%,
    transparent 100%
  );
}
```

```
┌──────────────────────────────────────┐
│          Transparent Void            │
│       ┌──────────────────────┐       │
│       │  Opaque Ring (40-70%)│       │
│       │   ┌──────────────┐   │       │
│       │   │ Transparent  │   │       │
│       │   │ Hole (0-40%) │   │       │
│       │   └──────────────┘   │       │
│       │                      │       │
│       └──────────────────────┘       │
└──────────────────────────────────────┘
```

---

### Pattern 5: Avatar with Circular Notch Cutout for Status Badge

A common design pattern in Discord, Slack, and iOS is an avatar with an overlapping online status badge or verified tick. Using a circular mask cutout punches a clean gap around the badge without needing a border matching a specific background color.

```css
.avatar-with-notch {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  
  /* Punch out a circular hole at bottom-right (x=68px, y=68px, r=14px) */
  -webkit-mask-image: radial-gradient(
    circle 15px at 68px 68px,
    transparent 0%,
    transparent 14px,
    black 15px,
    black 100%
  );
  mask-image: radial-gradient(
    circle 15px at 68px 68px,
    transparent 0%,
    transparent 14px,
    black 15px,
    black 100%
  );
}
```

```
┌───────────────────────────┐
│     AVATAR NOTCH MASK     │
│       ╭─────────╮         │
│      │  Avatar   │        │
│     │    Image    │       │
│      │          ╭───╮     │
│       ╰─────────┤ ◌ │<─── Transparent Cutout Notch
│                 ╰───╯     │
│             Status Badge  │
└───────────────────────────┘
```

---

### Pattern 6: Repeating Circular Matrix (Polka-Dot Alpha Grid)

Using `mask-size` and `mask-repeat`, a single circular radial gradient can be tiled infinitely across a surface:

```css
.halftone-dot-grid {
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 2px,
    transparent 2.5px
  );
  mask-image: radial-gradient(
    circle at center,
    black 2px,
    transparent 2.5px
  );
  -webkit-mask-size: 16px 16px;
  mask-size: 16px 16px;
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
}
```

---

## 5. Six Complete Production Implementations

Below are six production-ready UI components demonstrating the spectrum of circular masking techniques. Each implementation is self-contained with semantic HTML, modern CSS, responsive design tokens, and clean interactive logic.

---

### Implementation 1: Interactive Flashlight / Torchlight Reveal Card

An interactive dark-mode card where moving the cursor directs a realistic circular flashlight beam across a frosted glass dashboard panel, illuminating hidden telemetry data.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interactive Flashlight Reveal</title>
  <link rel="stylesheet" href="flashlight-card.css" />
</head>
<body>

  <div class="card-stage">
    <div class="flashlight-card" id="torchCard">
      <!-- Ambient Under-Layer (Dimly visible) -->
      <div class="card-layer ambient-layer">
        <div class="card-header">
          <span class="badge">SECURE VAULT</span>
          <span class="status-dot"></span>
        </div>
        <h2 class="card-title">Encrypted Storage Unit</h2>
        <p class="card-desc">Move your cursor to direct the beam and inspect internal components.</p>
        <div class="data-grid">
          <div class="data-cell">
            <span class="label">NODE ID</span>
            <span class="val">#984-ALPHA</span>
          </div>
          <div class="data-cell">
            <span class="label">INTEGRITY</span>
            <span class="val">99.98%</span>
          </div>
        </div>
      </div>

      <!-- Masked Highlight Layer (Revealed only under the circular beam) -->
      <div class="card-layer illuminated-layer" id="torchBeam">
        <div class="card-header">
          <span class="badge active">DECRYPTED ACTIVE</span>
          <span class="status-dot active"></span>
        </div>
        <h2 class="card-title neon">Encrypted Storage Unit</h2>
        <p class="card-desc bright">Quantum key verified. Directing optical sensor array.</p>
        <div class="data-grid">
          <div class="data-cell active">
            <span class="label">NODE ID</span>
            <span class="val neon">#984-ALPHA</span>
          </div>
          <div class="data-cell active">
            <span class="label">KEY HASH</span>
            <span class="val neon">0x7F...3B9</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="flashlight-card.js"></script>
</body>
</html>
```

```css
/* flashlight-card.css */
:root {
  --bg-dark: #090d16;
  --panel-bg: #111827;
  --panel-border: rgba(255, 255, 255, 0.08);
  --cyan-glow: #00f2fe;
  --neon-text: #38bdf8;
  --text-dim: #94a3b8;
  --torch-radius: 140px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
  padding: 24px;
}

.card-stage {
  perspective: 1000px;
}

.flashlight-card {
  position: relative;
  width: 380px;
  height: 320px;
  background: var(--panel-bg);
  border-radius: 24px;
  border: 1px solid var(--panel-border);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  cursor: crosshair;
}

.card-layer {
  position: absolute;
  inset: 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

/* Base Ambient Layer */
.ambient-layer {
  opacity: 0.35;
  filter: grayscale(80%) blur(0.5px);
  transition: opacity 0.3s ease;
}

/* Illuminated Layer with CSS Circular Mask */
.illuminated-layer {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15));
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 24px;
  
  /* CIRCULAR MASK ENGINE */
  -webkit-mask-image: radial-gradient(
    circle var(--torch-radius) at var(--torch-x, 50%) var(--torch-y, 50%),
    black 0%,
    rgba(0, 0, 0, 0.8) 50%,
    rgba(0, 0, 0, 0.2) 80%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--torch-radius) at var(--torch-x, 50%) var(--torch-y, 50%),
    black 0%,
    rgba(0, 0, 0, 0.8) 50%,
    rgba(0, 0, 0, 0.2) 80%,
    transparent 100%
  );
}

/* Typography & Sub-elements */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge.active {
  background: rgba(56, 189, 248, 0.2);
  color: var(--neon-text);
  border-color: rgba(56, 189, 248, 0.5);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
}

.status-dot.active {
  background: #00f2fe;
  box-shadow: 0 0 10px #00f2fe;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-title.neon {
  color: #fff;
  text-shadow: 0 0 15px rgba(56, 189, 248, 0.6);
}

.card-desc {
  font-size: 0.875rem;
  color: var(--text-dim);
  line-height: 1.5;
}

.card-desc.bright {
  color: #e2e8f0;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.data-cell {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.data-cell.active {
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(15, 23, 42, 0.6);
}

.label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.val {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 700;
}

.val.neon {
  color: var(--neon-text);
}
```

```javascript
// flashlight-card.js
const card = document.getElementById('torchCard');
const beam = document.getElementById('torchBeam');

function updateFlashlight(event) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Update CSS Custom Properties in Real-Time
  beam.style.setProperty('--torch-x', `${x}px`);
  beam.style.setProperty('--torch-y', `${y}px`);
}

card.addEventListener('mousemove', updateFlashlight);

// Reset to center smoothly when cursor departs
card.addEventListener('mouseleave', () => {
  beam.style.setProperty('--torch-x', '50%');
  beam.style.setProperty('--torch-y', '50%');
});
```

---

### Implementation 2: Avatar with Non-Destructive Notification Badge Notch

Traditional badge borders require hardcoding the background color (e.g. `border: 3px solid #ffffff`), which breaks whenever the avatar sits on gradients, imagery, dark mode transitions, or translucent glass cards. A circular mask cutout punches a clean transparent gap through the avatar pixels directly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Avatar Notch Cutout</title>
  <link rel="stylesheet" href="avatar-notch.css" />
</head>
<body>

  <!-- Dynamic Gradient Showcase (proves transparency) -->
  <div class="user-profile-strip">
    <div class="avatar-notch-container">
      <img
        class="masked-avatar"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
        alt="Sarah Connor Profile"
      />
      <!-- Overlapping Badge Element -->
      <span class="status-indicator online" aria-label="Status: Online"></span>
    </div>

    <div class="user-info">
      <h4 class="name">Sarah Connor</h4>
      <p class="role">Chief Security Architect</p>
    </div>
  </div>

</body>
</html>
```

```css
/* avatar-notch.css */
:root {
  --avatar-size: 88px;
  --badge-size: 20px;
  --notch-clearance: 5px; /* The transparent gap around the badge */
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
  font-family: system-ui, -apple-system, sans-serif;
  padding: 24px;
}

.user-profile-strip {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px 28px 16px 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.avatar-notch-container {
  position: relative;
  width: var(--avatar-size);
  height: var(--avatar-size);
}

.masked-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;

  /*
    MATHEMATICAL NOTCH CALCULATION:
    Badge Center: x = 74px, y = 74px (approx 84% from top-left)
    Badge Radius = 10px + 5px clearance = 15px notch radius
  */
  -webkit-mask-image: radial-gradient(
    circle calc((var(--badge-size) / 2) + var(--notch-clearance)) at 
      calc(var(--avatar-size) - (var(--badge-size) / 2)) 
      calc(var(--avatar-size) - (var(--badge-size) / 2)),
    transparent 0%,
    transparent 98%,
    black calc(98% + 1px),
    black 100%
  );
  mask-image: radial-gradient(
    circle calc((var(--badge-size) / 2) + var(--notch-clearance)) at 
      calc(var(--avatar-size) - (var(--badge-size) / 2)) 
      calc(var(--avatar-size) - (var(--badge-size) / 2)),
    transparent 0%,
    transparent 98%,
    black calc(98% + 1px),
    black 100%
  );
}

.status-indicator {
  position: absolute;
  width: var(--badge-size);
  height: var(--badge-size);
  bottom: 0;
  right: 0;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.status-indicator.online {
  background: #22c55e;
}

.user-info .name {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.user-info .role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}
```

---

### Implementation 3: Cinema Iris Aperture Wipe Transition

Uses `@property` registered typed CSS variables to animate a circular mask from $0\%$ to $150\%$ radius smoothly on hover or state change.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Circular Iris Wipe</title>
  <link rel="stylesheet" href="iris-wipe.css" />
</head>
<body>

  <div class="iris-stage">
    <div class="iris-banner">
      <!-- Base Layer 1 (Dark Monolith) -->
      <div class="banner-layer layer-monolith">
        <div class="banner-text">
          <span class="eyebrow">SUMMER COLLECTION</span>
          <h2>ASTRONOMICAL FORM</h2>
          <p>Hover anywhere to expand optical aperture.</p>
        </div>
      </div>

      <!-- Top Layer 2 (Vibrant Chroma - Masked by Iris) -->
      <div class="banner-layer layer-chroma">
        <div class="banner-text">
          <span class="eyebrow active">LIMITED EDITION</span>
          <h2 class="active">KINETIC SPECTRUM</h2>
          <p>Unleash full chromatic potential.</p>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
```

```css
/* iris-wipe.css */

/* Register CSS Custom Property for Hardware-Interpolated Animations */
@property --iris-radius {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

:root {
  --transition-speed: 0.75s;
  --ease-elastic: cubic-bezier(0.16, 1, 0.3, 1);
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0c0e14;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  color: #fff;
}

.iris-banner {
  position: relative;
  width: 580px;
  height: 360px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.banner-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 48px;
}

/* Layer 1: Monolith Dark Theme */
.layer-monolith {
  background: radial-gradient(circle at top right, #2d3748, #1a202c, #0f172a);
}

/* Layer 2: Vibrant Chroma Masked by Iris */
.layer-chroma {
  background: linear-gradient(135deg, #ff0844 0%, #ffb199 50%, #fcd34d 100%);
  color: #111827;

  /* CIRCULAR IRIS MASK */
  --iris-radius: 0%;
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 0%,
    black calc(var(--iris-radius) - 2px),
    transparent var(--iris-radius)
  );
  mask-image: radial-gradient(
    circle at center,
    black 0%,
    black calc(var(--iris-radius) - 2px),
    transparent var(--iris-radius)
  );
  
  transition: --iris-radius var(--transition-speed) var(--ease-elastic);
}

/* Expand Iris on Hover or Focus */
.iris-banner:hover .layer-chroma,
.iris-banner:focus-within .layer-chroma {
  --iris-radius: 120%;
}

.banner-text {
  max-width: 380px;
}

.eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  margin-bottom: 12px;
  color: #94a3b8;
}

.eyebrow.active {
  color: #831843;
}

h2 {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

h2.active {
  color: #0f172a;
}

p {
  font-size: 0.95rem;
  color: #cbd5e1;
}

.layer-chroma p {
  color: #334155;
  font-weight: 500;
}
```

---

### Implementation 4: Concentric Sonar / Radar Echo Pulse

Simulates an oceanic sonar or sci-fi telemetry radar scan using keyframe-animated annular (ring) circular masks.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Concentric Sonar Radar Mask</title>
  <link rel="stylesheet" href="sonar-radar.css" />
</head>
<body>

  <div class="radar-station">
    <div class="radar-screen">
      <!-- Background Coordinate Grid -->
      <div class="grid-layer"></div>

      <!-- Secret Target Ping Layer (Masked by Expanding Sonar Ring) -->
      <div class="sonar-wave-layer wave-1">
        <div class="radar-target target-alpha">
          <div class="blip"></div>
          <span class="blip-label">VESSEL #01 [SUB-ORBITAL]</span>
        </div>
        <div class="radar-target target-bravo">
          <div class="blip"></div>
          <span class="blip-label">ANOMALY #42</span>
        </div>
      </div>

      <!-- Sweeping Scanner Crosshair -->
      <div class="radar-hud">
        <div class="ring r-outer"></div>
        <div class="ring r-mid"></div>
        <div class="ring r-inner"></div>
        <div class="crosshair-x"></div>
        <div class="crosshair-y"></div>
      </div>
    </div>
  </div>

</body>
</html>
```

```css
/* sonar-radar.css */
@property --ring-offset {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #030712;
  font-family: 'JetBrains Mono', monospace;
  color: #10b981;
}

.radar-screen {
  position: relative;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, #022c22 0%, #064e3b 40%, #021a14 100%);
  border-radius: 50%;
  border: 4px solid #059669;
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.25), inset 0 0 40px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

/* Background Grid */
.grid-layer {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Sonar Wave Annular Mask Layer */
.sonar-wave-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #34d399, #10b981 60%, #059669);
  
  /* ANNULAR RING MASK WITH CONTINUOUS ANIMATION */
  --ring-offset: 0%;
  -webkit-mask-image: radial-gradient(
    circle at center,
    transparent 0%,
    transparent var(--ring-offset),
    black calc(var(--ring-offset) + 8%),
    transparent calc(var(--ring-offset) + 16%),
    transparent 100%
  );
  mask-image: radial-gradient(
    circle at center,
    transparent 0%,
    transparent var(--ring-offset),
    black calc(var(--ring-offset) + 8%),
    transparent calc(var(--ring-offset) + 16%),
    transparent 100%
  );
  
  animation: sonarSweep 3s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
}

@keyframes sonarSweep {
  0% {
    --ring-offset: 0%;
    opacity: 1;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    --ring-offset: 84%;
    opacity: 0;
  }
}

/* Radar Targets */
.radar-target {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-alpha {
  top: 110px;
  left: 260px;
}

.target-bravo {
  bottom: 120px;
  left: 90px;
}

.blip {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px #34d399, 0 0 20px #ffffff;
}

.blip-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #ecfdf5;
  background: rgba(6, 78, 59, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #34d399;
}

/* Static HUD Overlay */
.radar-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(16, 185, 129, 0.4);
  border-radius: 50%;
}
.r-inner { width: 120px; height: 120px; }
.r-mid   { width: 240px; height: 240px; }
.r-outer { width: 360px; height: 360px; }

.crosshair-x {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(16, 185, 129, 0.3);
}

.crosshair-y {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(16, 185, 129, 0.3);
}
```

---

### Implementation 5: Interactive Circular Magnifying Loupe (Before/After Lens)

An interactive circular lens where the cursor navigates over a vintage blueprint or schematic, revealing a magnified, high-resolution color restoration through a circular window.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Circular Magnifying Loupe</title>
  <link rel="stylesheet" href="loupe.css" />
</head>
<body>

  <div class="loupe-viewport" id="loupeBox">
    <!-- Under layer: Wireframe Schematic -->
    <div class="view-layer layer-schematic">
      <div class="schematic-content">
        <div class="hud-tag">BASE SCHEMATIC // REV 4</div>
        <div class="diagram-art wireframe"></div>
      </div>
    </div>

    <!-- Over layer: High-Detail Render (Masked by Loupe Circle) -->
    <div class="view-layer layer-rendered" id="loupeMask">
      <div class="schematic-content">
        <div class="hud-tag active">ACTIVE INSPECTION // QUANTUM</div>
        <div class="diagram-art rendered"></div>
      </div>
    </div>

    <!-- Visual Lens Rim Decoration -->
    <div class="lens-rim" id="lensRim"></div>
  </div>

  <script src="loupe.js"></script>
</body>
</html>
```

```css
/* loupe.css */
:root {
  --loupe-size: 160px;
  --pos-x: 50%;
  --pos-y: 50%;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b0f19;
  font-family: monospace;
}

.loupe-viewport {
  position: relative;
  width: 600px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
  cursor: none;
}

.view-layer {
  position: absolute;
  inset: 0;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

/* Layer 1: Monochrome Blueprint */
.layer-schematic {
  background: #111827;
  filter: grayscale(100%) contrast(120%);
}

/* Layer 2: Color Render masked by Loupe Circle */
.layer-rendered {
  background: radial-gradient(circle at center, #1e1b4b, #0f172a);
  
  /* CIRCULAR LOUPE APERTURE */
  -webkit-mask-image: radial-gradient(
    circle calc(var(--loupe-size) / 2) at var(--pos-x) var(--pos-y),
    black 0%,
    black calc(100% - 1.5px),
    transparent 100%
  );
  mask-image: radial-gradient(
    circle calc(var(--loupe-size) / 2) at var(--pos-x) var(--pos-y),
    black 0%,
    black calc(100% - 1.5px),
    transparent 100%
  );
}

.schematic-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hud-tag {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #64748b;
}

.hud-tag.active {
  color: #38bdf8;
}

.diagram-art {
  height: 240px;
  border-radius: 12px;
}

.diagram-art.wireframe {
  background: repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px);
  border: 1px solid #334155;
}

.diagram-art.rendered {
  background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.4);
}

/* Outer Metallic Lens Ring Indicator */
.lens-rim {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--loupe-size);
  height: var(--loupe-size);
  border-radius: 50%;
  border: 2px solid #38bdf8;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.3);
  pointer-events: none;
  transform: translate(calc(var(--pos-x) - (var(--loupe-size) / 2)), calc(var(--pos-y) - (var(--loupe-size) / 2)));
}
```

```javascript
// loupe.js
const loupeBox = document.getElementById('loupeBox');
const loupeMask = document.getElementById('loupeMask');
const lensRim = document.getElementById('lensRim');

loupeBox.addEventListener('mousemove', (e) => {
  const rect = loupeBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  loupeBox.style.setProperty('--pos-x', `${x}px`);
  loupeBox.style.setProperty('--pos-y', `${y}px`);
});
```

---

### Implementation 6: Halftone Polka-Dot Radial Matrix Hero Banner

Demonstrates how tiling circular gradient masks via `mask-size` and `mask-repeat` crafts a digital screen effect across high-resolution hero imagery.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Circular Halftone Mask Matrix</title>
  <link rel="stylesheet" href="halftone-banner.css" />
</head>
<body>

  <header class="halftone-hero">
    <!-- Masked Gradient Backdrop -->
    <div class="dot-matrix-backdrop"></div>
    
    <div class="hero-content">
      <span class="pill-label">FUTURE GRAPHICS ARCHITECTURE</span>
      <h1 class="headline">Procedural Dot Matrix Masks</h1>
      <p class="subtitle">
        Zero external assets. Infinite mathematical scalability powered by CSS radial gradients.
      </p>
      <div class="cta-row">
        <button class="btn btn-primary">Get Started</button>
        <button class="btn btn-secondary">Documentation</button>
      </div>
    </div>
  </header>

</body>
</html>
```

```css
/* halftone-banner.css */
body {
  margin: 0;
  background-color: #060911;
  font-family: 'Inter', system-ui, sans-serif;
  color: #ffffff;
}

.halftone-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  overflow: hidden;
}

.dot-matrix-backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  
  /* CIRCULAR DOT MATRIX MASK */
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 3px,
    transparent 3.5px
  );
  mask-image: radial-gradient(
    circle at center,
    black 3px,
    transparent 3.5px
  );
  -webkit-mask-size: 14px 14px;
  mask-size: 14px 14px;
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
  
  opacity: 0.7;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 640px;
  text-align: center;
}

.pill-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.headline {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 18px;
}

.subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.cta-row {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: #ffffff;
  color: #090d16;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.18);
}
```

---

## 6. Multi-Layer Circular Compositing (`mask-composite`)

Advanced visual architectures often demand combining multiple circular masks—such as punching two eyes and a smile through a card, or intersecting multiple spotlight apertures.

### 6.1 Standard vs. WebKit Keyword Mapping

When combining multiple comma-separated masks, the browser composes them using Boolean operations. However, the keywords differ between modern W3C standards and WebKit:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MASK COMPOSITING KEYWORD MAP                          │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Operation            │ W3C standard (`mask-composite`)                      │ WebKit Legacy (`-webkit-mask-composite`)             │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ **Union (Add)**      │ `add`                │ `source-over`                 │
│ **Difference (Sub)** │ `subtract`           │ `destination-out` / `xor`     │
│ **Intersection**     │ `intersect`          │ `source-in`                   │
│ **Exclusive OR**     │ `exclude`            │ `xor`                         │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 6.2 Dual Circular Spotlight Example

```css
.dual-spotlight {
  -webkit-mask-image: 
    radial-gradient(circle 100px at 30% 50%, black 100%, transparent 100%),
    radial-gradient(circle 100px at 70% 50%, black 100%, transparent 100%);
  -webkit-mask-composite: source-over; /* Union */

  mask-image: 
    radial-gradient(circle 100px at 30% 50%, black 100%, transparent 100%),
    radial-gradient(circle 100px at 70% 50%, black 100%, transparent 100%);
  mask-composite: add; /* W3C Union */
}
```

---

## 7. Performance, GPU Acceleration & Anti-Aliasing Optimization

### 7.1 Paint Costs & Hardware Layers

Masking operations are calculated during the **GPU rasterization & compositing phase**:

1. **Independent Mask Stacking Context**: Applying `mask-image` forces the browser to establish a **new stacking context** and an isolated off-screen rendering buffer.
2. **Promoting to GPU Composite Layer**: For smooth animations (e.g. mouse tracking or iris transitions), promote the masked element to its own compositor layer using:
   ```css
   .animated-mask-element {
     will-change: mask-image, -webkit-mask-image;
     transform: translateZ(0); /* Force hardware layer */
   }
   ```
3. **Avoid Unbounded Repaints**: When updating mouse positions via JavaScript, throttle events with `requestAnimationFrame()` to avoid triggering layout recalcs:

```javascript
let ticking = false;

function onMouseMove(e) {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      element.style.setProperty('--x', `${e.clientX}px`);
      element.style.setProperty('--y', `${e.clientY}px`);
      ticking = false;
    });
    ticking = true;
  }
}
```

---

## 8. Accessibility, Semantics & Usability

1. **DOM Tree & Screen Readers**:
   - `mask-image` purely modifies the **visual alpha layer**. Elements hidden by a mask (e.g. text outside a circular vignette) **remain fully readable** by screen readers (JAWS, NVDA, VoiceOver) and stay in the accessibility tree.
   - If content masked out should *not* be accessible to assistive tech, use `aria-hidden="true"` or `display: none`.

2. **Pointer Events & Click Traps**:
   - Areas rendered transparent by a mask still intercept click and hover events unless `pointer-events: none` is set on the container or hit-testing is delegated.

3. **Motion Sensitivity (`prefers-reduced-motion`)**:
   - Users with vestibular disorders can experience nausea from pulsing circular sonar waves or large expanding iris transitions. Always supply a reduced motion fallback:

```css
@media (prefers-reduced-motion: reduce) {
  .sonar-wave-layer {
    animation: none;
    -webkit-mask-image: none;
    mask-image: none;
    opacity: 0.5;
  }
  
  .iris-banner .layer-chroma {
    transition: none;
    --iris-radius: 100%;
  }
}
```

---

## 9. Common Pitfalls & Troubleshooting Matrix

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Mask renders blank in Safari / Chrome** | Missing `-webkit-mask-image` vendor prefix. | Always declare both `-webkit-mask-*` and `mask-*` rules in your CSS stylesheet. |
| **Jagged, pixelated, staircase edges** | Zero-distance color stops (`black 50%, transparent 50%`). | Add a $1\text{px}$ or $0.5\%$ subpixel delta (`calc(50% - 1px), transparent 50%`) for smooth anti-aliasing. |
| **Circle stretches into an ellipse** | Declared `radial-gradient(ellipse)` or omitted the `circle` keyword on non-square containers. | Explicitly specify `radial-gradient(circle ...)` or enforce `aspect-ratio: 1 / 1`. |
| **Mouse tracking feels laggy or stuttery** | Unthrottled DOM style mutations causing layout recalculations. | Use CSS custom properties updated via `requestAnimationFrame()` and add `will-change: mask-image`. |
| **Background color bleeds into badge notch** | Using borders instead of true circular masks. | Implement the non-destructive `radial-gradient()` transparent notch pattern (Pattern 5). |
| **Composite operations fail in Chrome/Safari** | Using W3C keywords (`subtract`) in `-webkit-mask-composite`. | Use WebKit keywords (`destination-out`) for `-webkit-mask-composite` alongside standard `mask-composite: subtract`. |

---

## 10. Quick Syntax Cheatsheet

```css
/* ==========================================================================
   CIRCULAR MASK QUICK REFERENCE SNIPPETS
   ========================================================================== */

/* 1. Basic Centered Circle (Anti-Aliased) */
.mask-circle {
  -webkit-mask-image: radial-gradient(circle closest-side, black calc(100% - 1px), transparent 100%);
  mask-image: radial-gradient(circle closest-side, black calc(100% - 1px), transparent 100%);
}

/* 2. Soft Spotlight Vignette */
.mask-spotlight {
  -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 75%);
  mask-image: radial-gradient(circle at center, black 30%, transparent 75%);
}

/* 3. Inverted Hole Punch / Keyhole */
.mask-keyhole {
  -webkit-mask-image: radial-gradient(circle 60px at center, transparent 99%, black 100%);
  mask-image: radial-gradient(circle 60px at center, transparent 99%, black 100%);
}

/* 4. Annulus (Donut Ring) */
.mask-donut {
  -webkit-mask-image: radial-gradient(circle, transparent 35%, black 36%, black 65%, transparent 66%);
  mask-image: radial-gradient(circle, transparent 35%, black 36%, black 65%, transparent 66%);
}

/* 5. Avatar Notification Notch */
.mask-notch {
  -webkit-mask-image: radial-gradient(circle 14px at calc(100% - 10px) calc(100% - 10px), transparent 98%, black 100%);
  mask-image: radial-gradient(circle 14px at calc(100% - 10px) calc(100% - 10px), transparent 98%, black 100%);
}

/* 6. Repeating Halftone Dot Matrix */
.mask-dots {
  -webkit-mask-image: radial-gradient(circle at center, black 2px, transparent 2.5px);
  mask-image: radial-gradient(circle at center, black 2px, transparent 2.5px);
  -webkit-mask-size: 12px 12px;
  mask-size: 12px 12px;
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
}
```
