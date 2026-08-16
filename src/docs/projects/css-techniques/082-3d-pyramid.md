---
concept: 082-3d-pyramid
name: CSS 3D Pyramid & Polyhedral Architecture Masterclass
category: CSS 3D Transforms, Geometric Modeling & Spatial Projection
difficulty: Advanced
tags: [css, 3d-pyramid, 3d-transforms, preserve-3d, perspective, clip-path, geometry, trigonometry, tetrahedron, frustum, lighting-simulation, glassmorphism, keyframes, modern-css]
---

# 082: CSS 3D Pyramid & Polyhedral Architecture Masterclass

## Overview & Executive Summary

In three-dimensional computer graphics and spatial UI engineering, constructing non-orthogonal polyhedra is the ultimate test of a developer's mastery over the CSS 3D transform pipeline. While rendering 3D cubes requires straightforward $90^\circ$ dihedral face alignments, **CSS 3D Pyramids** demand precise spatial trigonometry, non-planar compound angle rotations, and polygon clipping algorithms to join triangular facets seamlessly at a singular vanishing apex without gaps, hairline seams, or Z-fighting artifacts.

A **CSS 3D Pyramid** is a hardware-accelerated volumetric mesh composed of planar DOM elements positioned in a three-dimensional coordinate system using CSS Transforms Level 2 (`perspective`, `transform-style: preserve-3d`, `rotate3d`, and `translate3d`).

```
================================================================================
                    CSS 3D PYRAMID SPATIAL TAXONOMY
================================================================================

   1. Regular 4-Sided (Square Base)          2. Regular Tetrahedron (3-Sided)
               ▲ Apex (0, -h, 0)                          ▲ Apex
              / █ \                                      / █ \
             /  █  \                                    /  █  \
            /   █   \  <-- Slant Height L              /   █   \ <-- Equilateral Facet
           /    █    \                                /    █    \    (θ = 70.53°)
          /  .-'█`-._ \                              /  .-' '`-._ \
         /.-'   █    `-█                            /.-'         `-█
        ┌───────┴───────┐                          ┌───────────────┐
        │  Square Base  │                          │ Triangle Base │
        └───────────────┘                          └───────────────┘

   3. Stepped Ziggurat / Mesoamerican        4. Cyberpunk Glass Hologram
            ┌───┬───┐ (Temple Altar)                      ▲ Floating Core
          ┌─┴───┴───┴─┐ (Tier 3)                         / █ \  (Backdrop Blur)
        ┌─┴───────────┴─┐ (Tier 2)                      / [●] \ (Glowing Orb)
      ┌─┴───────────────┴─┐ (Tier 1)                   /   █   \
     ═╧═══════════════════╧═ Ground                   /════█════\ Neon Edge Glow
================================================================================
```

### Core Engineering Challenges Solved in This Masterclass
1. **Slant Height ($L$) vs. Altitude ($h$) Mismatch**: Why treating a pyramid's height as the face element's CSS `height` creates broken geometries, and how to compute the true hypotenuse slant length via the 3D Pythagorean theorem ($L = \sqrt{h^2 + (s/2)^2}$).
2. **Compound Incline & Azimuth Euler Angles**: Deriving exact face tilt angles ($\theta = \arctan(h / (s/2))$) and coupling them with polar azimuth rotations (`rotateY(0deg)`, `90deg`, `180deg`, `270deg`).
3. **Face Clipping & Sub-Pixel Seam Elimination**: Deploying modern `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)` with micro-scale overdraw compensation to prevent hairline cracks on high-DPI displays.
4. **Photometric Light Scattering & Surface Normals**: Simulating Lambertian directional key lighting, ambient occlusion corner creasing, and dynamic specular glares purely through CSS gradient math without WebGL or Canvas dependencies.
5. **Interactive Orbital Kinematics**: Establishing 60/120 FPS compositor-thread gyroscopic rotations, exploded-view assembly mechanics, and accessible reduced-motion states.

---

## Quick Reference Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Name** | CSS 3D Pyramid & Polyhedral Architecture |
| **Category** | CSS 3D Transforms, Geometric Modeling & Spatial Light Simulation |
| **Specification** | [W3C CSS Transforms Module Level 2](https://www.w3.org/TR/css-transforms-2/), [CSS Masking Module Level 1 (`clip-path`)](https://www.w3.org/TR/css-masking-1/) |
| **Difficulty** | Advanced (4.5 / 5) |
| **What it produces** | Volumetric 3-sided, 4-sided, stepped, and holographic 3D pyramids that rotate, cast dynamic ground shadows, support interactive lighting, and assemble/explode along face normal vectors. |
| **Why it works** | Browser rendering engines construct a 4x4 homogenous coordinate transformation matrix for each element; when nested inside a `preserve-3d` context, the GPU compositor renders all polygons into a shared 3D depth buffer. |
| **Key Properties** | `transform`, `transform-style: preserve-3d`, `perspective`, `perspective-origin`, `transform-origin`, `clip-path`, `backface-visibility`, `will-change`, `@property`. |
| **Strict Constraints** | Any ancestor with `overflow: hidden`, `clip-path`, `filter`, or `opacity < 1` (in older specifications) can flatten the 3D stacking context into 2D; slant height must strictly match the hypotenuse length. |
| **Browser Baseline** | Baseline 2020+ across all modern browsers (Chromium 88+, Firefox 85+, Safari 14.1+, Edge 88+) for hardware-accelerated 3D transforms, `clip-path` polygons, and custom property transitions. |
| **Acceptance Criteria** | Zero pixel gaps along edges at any rotation angle; zero layout reflows during continuous spin (0ms layout); smooth 60/120 FPS compositor execution; full `@media (prefers-reduced-motion)` fallbacks. |

---

### Quick Preview

Below is a self-contained, minimal 4-sided 3D pyramid with an animated continuous turntable spin and authentic directional face shading:

```html
<div class="pyramid-scene" aria-label="3D Rotating Pyramid Demonstration">
  <div class="pyramid-assembly">
    <div class="pyramid-face face-front"></div>
    <div class="pyramid-face face-back"></div>
    <div class="pyramid-face face-left"></div>
    <div class="pyramid-face face-right"></div>
    <div class="pyramid-base"></div>
    <div class="pyramid-shadow"></div>
  </div>
</div>
```

```css
:root {
  --base-size: 160px;          /* Square base side length (s) */
  --pyramid-height: 140px;     /* Apex height (h) */
  /* Slant Height L = sqrt(h^2 + (s/2)^2) = sqrt(140^2 + 80^2) = sqrt(26000) ≈ 161.245px */
  --slant-height: 161.25px;
  /* Pitch Angle α = atan((s/2) / h) = atan(80 / 140) = atan(0.5714) ≈ 29.74deg */
  --tilt-angle: 29.74deg;
  --anim-duration: 10s;
}

/* 1. Spatial Viewport Container */
.pyramid-scene {
  width: 320px;
  height: 320px;
  display: grid;
  place-items: center;
  perspective: 800px;
  perspective-origin: 50% 30%;
  background: radial-gradient(circle at center, #1e293b, #0f172a);
  border-radius: 16px;
  overflow: hidden;
}

/* 2. Central 3D Pivot Assembly */
.pyramid-assembly {
  position: relative;
  width: var(--base-size);
  height: var(--base-size);
  transform-style: preserve-3d;
  animation: turntableSpin var(--anim-duration) linear infinite;
  will-change: transform;
}

/* 3. Base Face (Ground Plane) */
.pyramid-base {
  position: absolute;
  inset: 0;
  background: #090d16;
  transform: rotateX(90deg) translateZ(calc(var(--base-size) / -2));
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
}

/* 4. Triangular Lateral Faces */
.pyramid-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--base-size);
  height: var(--slant-height);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
}

/* 5. Compound 3D Positioning (Azimuth Y + Pitch X) */
.face-front {
  background: linear-gradient(to bottom, #f59e0b, #b45309);
  transform: rotateY(0deg) translateZ(calc(var(--base-size) / 2)) rotateX(calc(-1 * var(--tilt-angle)));
}

.face-right {
  background: linear-gradient(to bottom, #fbbf24, #d97706);
  transform: rotateY(90deg) translateZ(calc(var(--base-size) / 2)) rotateX(calc(-1 * var(--tilt-angle)));
}

.face-back {
  background: linear-gradient(to bottom, #d97706, #92400e);
  transform: rotateY(180deg) translateZ(calc(var(--base-size) / 2)) rotateX(calc(-1 * var(--tilt-angle)));
}

.face-left {
  background: linear-gradient(to bottom, #b45309, #78350f);
  transform: rotateY(270deg) translateZ(calc(var(--base-size) / 2)) rotateX(calc(-1 * var(--tilt-angle)));
}

/* 6. Dynamic Ground Contact Shadow */
.pyramid-shadow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
  transform: rotateX(90deg) translateZ(calc(var(--base-size) / -2 - 1px));
  filter: blur(8px);
}

/* 7. Keyframe Turntable Animation */
@keyframes turntableSpin {
  0% {
    transform: rotateX(-20deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}
```

---

## 1. Geometric Foundations, Spatial Trigonometry & Coordinate Mechanics

Building a 3D pyramid in CSS requires moving beyond 2D box models and entering non-Euclidean transformation spaces where planar rectangles are clipped into polygons and oriented in 3D coordinate space.

### 1.1 The Mathematical Model of the 4-Sided Pyramid

Consider a right regular square pyramid with base length $s$ and vertical height $h$:

```
                    Apex (0, -h, 0)
                         ▲
                        /│\
                       / │ \
                      /  │  \
   Slant Height (L)  /   │   \  Slant Height (L)
                    /    │ h  \
                   /     │     \
                  /      │      \
                 /       ▼ (0,0,0)
     (-s/2, 0)  ┌────────┼────────┐ (+s/2, 0)
                │◄────── s/2 ────►│
                └─────────────────┘
                     Base (s)
```

#### Formula Derivation:
1. **Half-Base ($b$)**:
   $$b = \frac{s}{2}$$
2. **Slant Height ($L$)** (Hypotenuse of the internal right triangle):
   $$L = \sqrt{h^2 + b^2} = \sqrt{h^2 + \left(\frac{s}{2}\right)^2}$$
3. **Face Incline Angle from Ground ($\theta_{\text{ground}}$)**:
   $$\theta_{\text{ground}} = \arctan\left(\frac{h}{b}\right) = \arctan\left(\frac{2h}{s}\right)$$
4. **Face Pitch Angle from Vertical ($\alpha_{\text{pitch}}$)**:
   $$\alpha_{\text{pitch}} = 90^\circ - \theta_{\text{ground}} = \arctan\left(\frac{b}{h}\right) = \arctan\left(\frac{s}{2h}\right)$$

#### Numerical Reference Table for Common Proportions:

| Base Size ($s$) | Height ($h$) | Half-Base ($s/2$) | Slant Height ($L$) | Ground Angle ($\theta$) | Vertical Pitch ($\alpha$) | Shape Aesthetic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **$200\text{px}$** | **$100\text{px}$** | $100\text{px}$ | $141.42\text{px}$ | $45.00^\circ$ | $45.00^\circ$ | Low-profile / Pavilion |
| **$200\text{px}$** | **$141.42\text{px}$** | $100\text{px}$ | $173.21\text{px}$ | $54.74^\circ$ | $35.26^\circ$ | Regular Octahedron Half |
| **$200\text{px}$** | **$127.32\text{px}$** | $100\text{px}$ | $161.90\text{px}$ | $51.85^\circ$ | $38.15^\circ$ | **Great Pyramid of Giza (Golden Ratio $\phi$)** |
| **$200\text{px}$** | **$160\text{px}$** | $100\text{px}$ | $188.68\text{px}$ | $58.00^\circ$ | $32.00^\circ$ | Steep Monumental Obelisk |
| **$200\text{px}$** | **$240\text{px}$** | $100\text{px}$ | $260.00\text{px}$ | $67.38^\circ$ | $22.62^\circ$ | Sharp Gothic Spire |

> [!IMPORTANT]
> If you set the CSS `height` of `.pyramid-face` to the pyramid's vertical height $h$ ($140\text{px}$) instead of its slant height $L$ ($161.25\text{px}$), the tops of the four triangular faces will **never meet**. They will stop short, leaving an open square hole at the top. Always calculate and apply $L$ as the element's CSS `height` or `block-size`.

---

### 1.2 The CSS 3D Transformation Pipeline

When the browser evaluates CSS transforms on elements inside a `transform-style: preserve-3d` context, it concatenates multiple transformation matrices into a single $4 \times 4$ projective matrix:

```
[ Viewport: perspective(d) ]
            │
            ▼
[ Scene Assembly: rotateX(pitch) × rotateY(yaw) ]
            │
            ├──────────────────────┬──────────────────────┬──────────────────────┐
            ▼                      ▼                      ▼                      ▼
    [ Front Face ]          [ Right Face ]         [ Back Face ]          [ Left Face ]
   rotateY(0deg)          rotateY(90deg)         rotateY(180deg)        rotateY(270deg)
   translateZ(s/2)        translateZ(s/2)        translateZ(s/2)        translateZ(s/2)
   rotateX(-α)            rotateX(-α)            rotateX(-α)            rotateX(-α)
```

```
================================================================================
                    TRANSFORM ORDERING MATRIX IN CSS
================================================================================

   Initial State             1. rotateY(azimuth)      2. translateZ(s/2)       3. rotateX(-α)
   (Flat at origin)          (Orient to compass)      (Push to base edge)      (Tilt inward to apex)

        ┌───┐                     ┌───┐                     ┌───┐                     / \
        │   │                     │   │                     │   │                    /   \
        │   │        ───►        ╱   ╱        ───►         │   │        ───►        /     \
        └───┘                   └───┘                      └───┘                   └─────┘
                                                      (Displaced in Z)         (Slanted at apex)
================================================================================
```

#### Why Transform Order Matters:
In CSS, transforms are evaluated from **right to left** mathematically, which corresponds to applying local coordinate operations in **left-to-right** syntactic order:
1. `rotateY(N deg)`: Rotates the local coordinate frame so $+Z$ points outward along the respective compass direction (North, East, South, West).
2. `translateZ(calc(var(--base-size) / 2))`: Translates the face forward from the center pivot to the perimeter of the square base.
3. `rotateX(calc(-1 * var(--tilt-angle)))`: Tilts the top of the face inward around its bottom edge toward the vertical center axis ($Y$-axis).

---

### 1.3 The Regular Tetrahedron (3-Sided Equilateral Pyramid)

A regular tetrahedron is a polyhedron composed of four identical equilateral triangular faces. It possesses tetrahedral symmetry ($T_d$):

```
                       Apex (0, -H, 0)
                            ▲
                           /█\
                          / █ \
                         /  █  \
                        /   █   \
                       /  .-' `-. \
                      /.-'   ●   `-█
                     ┌───────┼───────┐
                     │   Centroid    │
                     └───────────────┘
```

#### Mathematical Constants for Regular Tetrahedron of Edge Length $s$:
1. **Face Altitude (Slant Height $L$)**:
   $$L = s \cdot \frac{\sqrt{3}}{2} \approx 0.8660 \cdot s$$
2. **Total Tetrahedron Height ($H$)**:
   $$H = s \cdot \sqrt{\frac{2}{3}} \approx 0.8165 \cdot s$$
3. **Inradius of Base ($r_{\text{in}}$)** (Distance from base centroid to midpoints of edges):
   $$r_{\text{in}} = \frac{s}{2\sqrt{3}} \approx 0.2887 \cdot s$$
4. **Circumradius of Base ($r_{\text{circ}}$)** (Distance from base centroid to vertices):
   $$r_{\text{circ}} = \frac{s}{\sqrt{3}} \approx 0.5774 \cdot s$$
5. **Dihedral Angle Between Faces ($\theta_{\text{dihedral}}$)**:
   $$\theta_{\text{dihedral}} = \arccos\left(\frac{1}{3}\right) \approx 70.5288^\circ \approx 70.53^\circ$$
6. **Incline Angle from Vertical ($\alpha_{\text{tetra}}$)**:
   $$\alpha_{\text{tetra}} = 90^\circ - \theta_{\text{dihedral}} = 90^\circ - 70.53^\circ = 19.47^\circ$$

Three lateral faces are spaced at $120^\circ$ azimuth intervals (`0deg`, `120deg`, `240deg`), pushed outward by $r_{\text{in}}$, and tilted inward by $19.47^\circ$.

---

## 2. The 5 Core Architectural Techniques for CSS 3D Pyramids

Depending on visual requirements (glassmorphism, borders, solid shading, or stepped terraces), different CSS implementation patterns offer distinct advantages:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 5 PYRAMID ARCHITECTURAL PATTERNS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Clipped Polygons (Gold Standard)  │ Full gradient, border-image, & glass │
│ 2. Apex-Anchored Transform Assembly   │ Simplified pivot math for explosions │
│ 3. Zero-Box Border Miter Assembly    │ Legacy, subpixel-crisp, solid colors │
│ 4. Regular Tetrahedron (3-Sided)     │ Organic crystal & deltahedron meshes │
│ 5. Stepped Frustum / Mesoamerican    │ Tiered cubes with multi-face bevels  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Technique 1: Modern `clip-path` Triangular Faces (The Gold Standard)

The most flexible, maintainable, and visually rich technique uses standard HTML `<div>` elements clipped to isosceles triangles via `clip-path: polygon()`.

#### Advantages:
- Supports rich linear and radial gradients for realistic lighting.
- Allows internal nested elements (text, icons, badges, UI widgets).
- Compatible with CSS `backdrop-filter` for glassmorphic refraction.
- Enables precise hover hitboxes when using `clip-path` on interactive containers.

```html
<div class="pyramid-container">
  <div class="pyramid-gold">
    <div class="face f-north"><span>N</span></div>
    <div class="face f-east"><span>E</span></div>
    <div class="face f-south"><span>S</span></div>
    <div class="face f-west"><span>W</span></div>
    <div class="base"></div>
  </div>
</div>
```

```css
:root {
  --s: 180px;                    /* Base side */
  --h: 150px;                    /* Height */
  --L: 174.93px;                 /* sqrt(150^2 + 90^2) */
  --tilt: 30.96deg;              /* atan(90 / 150) */
  --half-s: calc(var(--s) / 2);
}

.pyramid-gold {
  position: relative;
  width: var(--s);
  height: var(--s);
  transform-style: preserve-3d;
}

.pyramid-gold .face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  backface-visibility: visible;
}

/* North Face */
.f-north {
  background: linear-gradient(135deg, #f59e0b, #b45309);
  transform: rotateY(0deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
}

/* East Face */
.f-east {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  transform: rotateY(90deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
}

/* South Face */
.f-south {
  background: linear-gradient(135deg, #d97706, #78350f);
  transform: rotateY(180deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
}

/* West Face */
.f-west {
  background: linear-gradient(135deg, #92400e, #451a03);
  transform: rotateY(270deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
}

/* Base */
.pyramid-gold .base {
  position: absolute;
  inset: 0;
  background: #271506;
  transform: rotateX(90deg) translateZ(calc(-1 * var(--half-s)));
}
```

---

### Technique 2: Apex-Anchored Transform Architecture

Instead of anchoring each face to the base perimeter (`transform-origin: 50% 100%`), you can anchor all faces at the **top apex point** (`transform-origin: 50% 0%`).

```
          ┌─────────┐
          │  APEX   │ <── transform-origin: 50% 0%
         ╱ ╲       ╱ ╲
        ╱   ╲     ╱   ╲
       ╱     ╲   ╱     ╲
      ┌───────┐ ┌───────┐
       Face 1    Face 2   (Fanned outward around apex)
```

#### Why use Apex-Anchoring?
- **Exploded / Deconstruction Animations**: Easy to animate faces swinging open like petals from the top or detaching along radial vectors.
- **Apex Alignment Precision**: The apex vertex remains mathematically fixed at $(0, -h, 0)$, eliminating subpixel rounding jitter at the top tip.

```css
.face-apex-anchored {
  position: absolute;
  top: 50%;
  left: 0;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 0%; /* Anchored at tip */
}

/* Apex-anchored faces translate upward to apex, then rotate outward */
.face-apex-front {
  transform: translateY(calc(-1 * var(--h))) rotateY(0deg) rotateX(var(--tilt));
}
.face-apex-right {
  transform: translateY(calc(-1 * var(--h))) rotateY(90deg) rotateX(var(--tilt));
}
.face-apex-back {
  transform: translateY(calc(-1 * var(--h))) rotateY(180deg) rotateX(var(--tilt));
}
.face-apex-left {
  transform: translateY(calc(-1 * var(--h))) rotateY(270deg) rotateX(var(--tilt));
}
```

---

### Technique 3: Zero-Dimension Border Miter 3D Pyramid

Before `clip-path` achieved universal browser baseline support, developers utilized CSS border miters (`width: 0; height: 0; border-left: ...; border-right: ...; border-bottom: ...`).

```
┌─────────────────────────────────────────────────────────┐
│               BORDER MITER TRIANGLE MECHANISM           │
│                                                         │
│                   border-left: 90px solid transparent   │
│                 ╱\                                      │
│                ╱  \  border-right: 90px solid transp.   │
│               ╱    \                                    │
│              ╱──────\                                   │
│       border-bottom: 175px solid #d97706                │
└─────────────────────────────────────────────────────────┘
```

```css
.miter-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: 0;
  height: 0;
  border-left: 90px solid transparent;
  border-right: 90px solid transparent;
  border-bottom: 175px solid #d97706;
  transform-origin: 50% 175px;
}

.miter-front {
  border-bottom-color: #f59e0b;
  transform: rotateY(0deg) translateZ(90px) rotateX(-31deg);
}
```

> [!NOTE]
> While border-miter triangles are lightweight, they cannot render CSS background gradients, backdrop filters, or internal DOM children. Modern production code should use **Technique 1 (`clip-path`)**.

---

### Technique 4: Regular Tetrahedron (3-Sided Equilateral Pyramid)

A 3-sided pyramid constructed with mathematically exact dihedral rotations:

```html
<div class="tetra-scene">
  <div class="tetra-assembly">
    <div class="tetra-face tetra-1"></div>
    <div class="tetra-face tetra-2"></div>
    <div class="tetra-face tetra-3"></div>
    <div class="tetra-base"></div>
  </div>
</div>
```

```css
:root {
  --tetra-edge: 160px;
  /* Slant height L = s * sqrt(3) / 2 ≈ 138.56px */
  --tetra-slant: 138.56px;
  /* Inradius r_in = s / (2 * sqrt(3)) ≈ 46.19px */
  --tetra-rin: 46.19px;
  /* Pitch angle α = 90deg - 70.53deg = 19.47deg */
  --tetra-pitch: 19.47deg;
}

.tetra-assembly {
  position: relative;
  width: var(--tetra-edge);
  height: var(--tetra-edge);
  transform-style: preserve-3d;
  animation: tetraSpin 12s linear infinite;
}

.tetra-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--tetra-edge);
  height: var(--tetra-slant);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
}

.tetra-1 {
  background: linear-gradient(to bottom, #ec4899, #be185d);
  transform: rotateY(0deg) translateZ(var(--tetra-rin)) rotateX(calc(-1 * var(--tetra-pitch)));
}

.tetra-2 {
  background: linear-gradient(to bottom, #8b5cf6, #6d28d9);
  transform: rotateY(120deg) translateZ(var(--tetra-rin)) rotateX(calc(-1 * var(--tetra-pitch)));
}

.tetra-3 {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  transform: rotateY(240deg) translateZ(var(--tetra-rin)) rotateX(calc(-1 * var(--tetra-pitch)));
}

.tetra-base {
  position: absolute;
  left: 0;
  top: 50%;
  width: var(--tetra-edge);
  height: var(--tetra-slant);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background: #1e1b4b;
  transform: rotateX(90deg) translateZ(0);
}

@keyframes tetraSpin {
  0% { transform: rotateX(-25deg) rotateY(0deg); }
  100% { transform: rotateX(-25deg) rotateY(360deg); }
}
```

---

### Technique 5: Stepped Mesoamerican / Mayan Frustum Pyramid

A stepped pyramid (Ziggurat) consists of multiple concentric truncated square prisms (frustums) stacked along the $Y$-axis with diminishing dimensions.

```
                  ┌─────────┐ Altar Platform
               ┌──┴─────────┴──┐ Tier 3
            ┌──┴───────────────┴──┐ Tier 2
         ┌──┴─────────────────────┴──┐ Tier 1 (Base)
```

```html
<div class="ziggurat-assembly">
  <!-- Tier 1 (Base Level: 200px) -->
  <div class="ziggurat-tier tier-1">
    <div class="z-face z-front"></div>
    <div class="z-face z-back"></div>
    <div class="z-face z-left"></div>
    <div class="z-face z-right"></div>
    <div class="z-top"></div>
  </div>
  
  <!-- Tier 2 (Middle Level: 150px) -->
  <div class="ziggurat-tier tier-2">
    <div class="z-face z-front"></div>
    <div class="z-face z-back"></div>
    <div class="z-face z-left"></div>
    <div class="z-face z-right"></div>
    <div class="z-top"></div>
  </div>
  
  <!-- Tier 3 (Top Level: 100px) -->
  <div class="ziggurat-tier tier-3">
    <div class="z-face z-front"></div>
    <div class="z-face z-back"></div>
    <div class="z-face z-left"></div>
    <div class="z-face z-right"></div>
    <div class="z-top"></div>
  </div>
</div>
```

```css
.ziggurat-assembly {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  animation: turntableSpin 14s linear infinite;
}

.ziggurat-tier {
  position: absolute;
  transform-style: preserve-3d;
}

/* Tier Sizing & Vertical Elevation */
.tier-1 {
  width: 200px;
  height: 200px;
  --th: 30px;
  transform: translateZ(0);
}

.tier-2 {
  width: 150px;
  height: 150px;
  inset: 25px;
  --th: 30px;
  transform: translateY(-30px);
}

.tier-3 {
  width: 100px;
  height: 100px;
  inset: 50px;
  --th: 30px;
  transform: translateY(-60px);
}

/* Frustum Faces */
.z-face {
  position: absolute;
  width: 100%;
  height: var(--th);
  background: #78716c;
  border: 1px solid #57534e;
}

.tier-1 .z-front { transform: rotateY(0deg) translateZ(100px); background: #a8a29e; }
.tier-1 .z-right { transform: rotateY(90deg) translateZ(100px); background: #78716c; }
.tier-1 .z-back  { transform: rotateY(180deg) translateZ(100px); background: #57534e; }
.tier-1 .z-left  { transform: rotateY(270deg) translateZ(100px); background: #44403c; }

.tier-2 .z-front { transform: rotateY(0deg) translateZ(75px); background: #a8a29e; }
.tier-2 .z-right { transform: rotateY(90deg) translateZ(75px); background: #78716c; }
.tier-2 .z-back  { transform: rotateY(180deg) translateZ(75px); background: #57534e; }
.tier-2 .z-left  { transform: rotateY(270deg) translateZ(75px); background: #44403c; }

.tier-3 .z-front { transform: rotateY(0deg) translateZ(50px); background: #a8a29e; }
.tier-3 .z-right { transform: rotateY(90deg) translateZ(50px); background: #78716c; }
.tier-3 .z-back  { transform: rotateY(180deg) translateZ(50px); background: #57534e; }
.tier-3 .z-left  { transform: rotateY(270deg) translateZ(50px); background: #44403c; }

.z-top {
  position: absolute;
  inset: 0;
  background: #d6d3d1;
  transform: rotateX(90deg) translateZ(0);
}
```

---

## 3. Advanced Lighting, Shading & Realistic Optical Texturing

Pure 3D geometry without surface lighting appears flat and unconvincing. In 3D rendering engines, lighting is calculated using the **Lambertian Cosine Law**:
$$I = I_{\text{ambient}} + I_{\text{directional}} \cdot \max(0, \vec{N} \cdot \vec{L})$$

where $\vec{N}$ is the face's unit surface normal vector, and $\vec{L}$ is the directional light vector.

```
             Directional Key Light (\vec{L})
                     \
                      \  θ
                       \
                        ▼
                 ┌──────────────┐
                 │ Face Normal  │   Intensity I = cos(θ)
                 │   (\vec{N})  │
                 └──────────────┘
```

In CSS, we approximate photorealistic lighting through three complementary techniques:

### 3.1 Directional Gradient Mapping

By applying specific angle-tuned linear gradients to each face, we simulate a stationary light source (e.g., top-left overhead sun):

```css
/* Sun Position: Top-Left Front (+X: -0.5, +Y: -1.0, +Z: +0.8) */

.face-front {
  /* Receives direct key light at top-left; slight falloff to bottom-right */
  background: linear-gradient(145deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%);
}

.face-right {
  /* In half-shadow (penumbra); ambient scattering */
  background: linear-gradient(160deg, #d97706 0%, #b45309 60%, #78350f 100%);
}

.face-back {
  /* In full shadow (umbra); dark ambient tone with subtle rim bounce */
  background: linear-gradient(180deg, #92400e 0%, #78350f 70%, #451a03 100%);
}

.face-left {
  /* Grazing incident light; high-contrast top rim */
  background: linear-gradient(130deg, #fbbf24 0%, #d97706 40%, #92400e 100%);
}
```

---

### 3.2 Glassmorphism & Cybernetic Hologram Texturing

For sci-fi HUDs, crypto portals, or high-tech dashboards, the pyramid can be rendered as a semi-transparent glowing crystal with internal refractions:

```css
.hologram-face {
  position: absolute;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background: linear-gradient(
    180deg,
    rgba(56, 189, 248, 0.4) 0%,
    rgba(14, 165, 233, 0.15) 60%,
    rgba(2, 132, 199, 0.05) 100%
  );
  border: 1px solid rgba(56, 189, 248, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 
    inset 0 0 20px rgba(56, 189, 248, 0.3),
    0 0 15px rgba(56, 189, 248, 0.2);
}

/* Neon Scanline Matrix overlay */
.hologram-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 4px,
    rgba(56, 189, 248, 0.2) 5px,
    transparent 6px
  );
  pointer-events: none;
}
```

---

### 3.3 Realistic Ground Contact & Ambient Occlusion Shadows

A floating 3D object without a grounding shadow breaks spatial immersion. Ground shadows must be placed on the $X-Z$ plane and blurred:

```css
.ground-plane {
  position: absolute;
  width: calc(var(--s) * 1.8);
  height: calc(var(--s) * 1.8);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotateX(90deg) translateZ(calc(var(--s) / -2 - 2px));
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    transparent 70%
  );
  filter: blur(10px);
  pointer-events: none;
}
```

---

## 4. Kinematics, Interactive Orbit & Particle Choreography

### 4.1 Houdini `@property` Driven Continuous Spin

By registering custom angular properties with CSS Houdini `@property`, browsers can interpolate smooth 3D rotations without string parsing overhead:

```css
@property --orbit-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.houdini-pyramid {
  transform: rotateX(-20deg) rotateY(var(--orbit-angle));
  animation: houdiniOrbit 8s linear infinite;
}

@keyframes houdiniOrbit {
  to {
    --orbit-angle: 360deg;
  }
}
```

---

### 4.2 Interactive Gyroscopic Mouse/Pointer Tracking

Using CSS custom properties `--rx` and `--ry` manipulated via pointer events or CSS hover zones:

```css
.interactive-scene {
  --rx: -25deg;
  --ry: 45deg;
  perspective: 900px;
}

.interactive-pyramid {
  transform-style: preserve-3d;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover-zone tilt modifiers (Pure CSS Fallback) */
.scene-quadrant-top-left:hover ~ .interactive-pyramid { --rx: -10deg; --ry: 20deg; }
.scene-quadrant-top-right:hover ~ .interactive-pyramid { --rx: -10deg; --ry: 70deg; }
.scene-quadrant-bottom-left:hover ~ .interactive-pyramid { --rx: -40deg; --ry: 20deg; }
.scene-quadrant-bottom-right:hover ~ .interactive-pyramid { --rx: -40deg; --ry: 70deg; }
```

---

### 4.3 Exploded-View Assembly Animation

In architectural visualizations and technical exploded diagrams, detaching the pyramid faces along their face normals reveals internal contents (such as a glowing power crystal):

```css
/* Normal Vector Translation on Hover */
.pyramid-assembly:hover .face-front {
  transform: rotateY(0deg) translateZ(calc(var(--half-s) + 50px)) rotateX(calc(-1 * var(--tilt) - 15deg));
  transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pyramid-assembly:hover .face-right {
  transform: rotateY(90deg) translateZ(calc(var(--half-s) + 50px)) rotateX(calc(-1 * var(--tilt) - 15deg));
  transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pyramid-assembly:hover .face-back {
  transform: rotateY(180deg) translateZ(calc(var(--half-s) + 50px)) rotateX(calc(-1 * var(--tilt) - 15deg));
  transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pyramid-assembly:hover .face-left {
  transform: rotateY(270deg) translateZ(calc(var(--half-s) + 50px)) rotateX(calc(-1 * var(--tilt) - 15deg));
  transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 5. Comprehensive Production Component Gallery

Below are four distinct production-grade 3D pyramid components suited for diverse modern web applications.

---

### Component A: The Egyptian Giza Sandstone Monument

Simulates ancient limestone blocks with weathered rock gradients, directional desert sunlight, and heat-haze ground contact.

```html
<div class="giza-card" tabindex="0">
  <div class="giza-scene">
    <div class="giza-pyramid">
      <div class="g-face g-north">
        <div class="hieroglyph-layer"></div>
      </div>
      <div class="g-face g-east">
        <div class="hieroglyph-layer"></div>
      </div>
      <div class="g-face g-south">
        <div class="hieroglyph-layer"></div>
      </div>
      <div class="g-face g-west">
        <div class="hieroglyph-layer"></div>
      </div>
      <div class="g-capstone"></div>
      <div class="g-shadow"></div>
    </div>
  </div>
  <div class="giza-info">
    <h4>Khufu Pyramid</h4>
    <p>Golden Ratio Proportion ($\phi = 1.618$) &bull; 51.85&deg; Slope</p>
  </div>
</div>
```

```css
.giza-card {
  width: 320px;
  background: #1c1917;
  border: 1px solid #44403c;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.giza-scene {
  width: 240px;
  height: 220px;
  perspective: 750px;
  perspective-origin: 50% 25%;
  display: grid;
  place-items: center;
}

.giza-pyramid {
  --s: 140px;
  --h: 113.3px;        /* 140 * 0.809 */
  --L: 133.2px;        /* sqrt(113.3^2 + 70^2) */
  --tilt: 31.7deg;     /* atan(70 / 113.3) */
  
  position: relative;
  width: var(--s);
  height: var(--s);
  transform-style: preserve-3d;
  transform: rotateX(-22deg) rotateY(40deg);
  transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.giza-card:hover .giza-pyramid,
.giza-card:focus-visible .giza-pyramid {
  transform: rotateX(-22deg) rotateY(220deg);
}

.g-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
}

.g-north {
  background: linear-gradient(135deg, #fde68a 0%, #d97706 60%, #92400e 100%);
  transform: rotateY(0deg) translateZ(70px) rotateX(calc(-1 * var(--tilt)));
}

.g-east {
  background: linear-gradient(135deg, #fbbf24 0%, #b45309 60%, #78350f 100%);
  transform: rotateY(90deg) translateZ(70px) rotateX(calc(-1 * var(--tilt)));
}

.g-south {
  background: linear-gradient(135deg, #b45309 0%, #78350f 70%, #451a03 100%);
  transform: rotateY(180deg) translateZ(70px) rotateX(calc(-1 * var(--tilt)));
}

.g-west {
  background: linear-gradient(135deg, #f59e0b 0%, #92400e 60%, #78350f 100%);
  transform: rotateY(270deg) translateZ(70px) rotateX(calc(-1 * var(--tilt)));
}

.g-shadow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.8) 0%, transparent 65%);
  transform: rotateX(90deg) translateZ(-71px);
  filter: blur(12px);
}

.giza-info {
  text-align: center;
  color: #e7e5e4;
}

.giza-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  color: #fef08a;
}

.giza-info p {
  margin: 0;
  font-size: 0.8125rem;
  color: #a8a29e;
}
```

---

### Component B: The Cyberpunk Neon Power Pyramid

An interactive energy core pyramid featuring wireframe grid borders, neon scanlines, and an internal floating power sphere.

```html
<div class="cyber-reactor" tabindex="0">
  <div class="reactor-viewport">
    <div class="reactor-assembly">
      <!-- Internal Floating Power Core -->
      <div class="power-core"></div>
      
      <!-- Hologram Pyramid Facets -->
      <div class="c-face c-front"></div>
      <div class="c-face c-right"></div>
      <div class="c-face c-back"></div>
      <div class="c-face c-left"></div>
      
      <!-- Energy Ground Ring -->
      <div class="energy-ring"></div>
    </div>
  </div>
  <div class="reactor-hud">
    <div class="hud-status"><span class="pulse-dot"></span> REACTOR ACTIVE</div>
    <div class="hud-gauge">OUTPUT: 98.4 GW</div>
  </div>
</div>
```

```css
.cyber-reactor {
  width: 320px;
  background: #020617;
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 0 30px rgba(6, 182, 212, 0.15),
    inset 0 0 20px rgba(6, 182, 212, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.reactor-viewport {
  width: 240px;
  height: 240px;
  perspective: 800px;
  perspective-origin: 50% 30%;
  display: grid;
  place-items: center;
}

.reactor-assembly {
  --s: 140px;
  --h: 130px;
  --L: 147.65px;      /* sqrt(130^2 + 70^2) */
  --tilt: 28.3deg;    /* atan(70 / 130) */
  
  position: relative;
  width: var(--s);
  height: var(--s);
  transform-style: preserve-3d;
  animation: cyberSpin 9s linear infinite;
}

.cyber-reactor:hover .reactor-assembly {
  animation-play-state: paused;
}

/* Floating Reactor Core */
.power-core {
  position: absolute;
  width: 36px;
  height: 36px;
  left: 50%;
  top: 50%;
  margin-left: -18px;
  margin-top: -18px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #67e8f9, #06b6d4 50%, #083344 100%);
  box-shadow: 
    0 0 25px #06b6d4,
    0 0 50px #0891b2;
  transform: translateY(-45px);
  animation: corePulse 2s ease-in-out infinite alternate;
}

.c-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
  background: linear-gradient(
    180deg,
    rgba(6, 182, 212, 0.4) 0%,
    rgba(6, 182, 212, 0.1) 70%,
    rgba(8, 51, 68, 0.05) 100%
  );
  border: 1px solid rgba(34, 211, 238, 0.7);
  box-shadow: inset 0 0 15px rgba(6, 182, 212, 0.3);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.c-front { transform: rotateY(0deg) translateZ(70px) rotateX(calc(-1 * var(--tilt))); }
.c-right { transform: rotateY(90deg) translateZ(70px) rotateX(calc(-1 * var(--tilt))); }
.c-back  { transform: rotateY(180deg) translateZ(70px) rotateX(calc(-1 * var(--tilt))); }
.c-left  { transform: rotateY(270deg) translateZ(70px) rotateX(calc(-1 * var(--tilt))); }

.energy-ring {
  position: absolute;
  width: 180px;
  height: 180px;
  left: 50%;
  top: 50%;
  margin-left: -90px;
  margin-top: -90px;
  border-radius: 50%;
  border: 2px dashed rgba(6, 182, 212, 0.6);
  transform: rotateX(90deg) translateZ(-70px);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
  animation: ringPulse 4s linear infinite;
}

@keyframes cyberSpin {
  0% { transform: rotateX(-20deg) rotateY(0deg); }
  100% { transform: rotateX(-20deg) rotateY(360deg); }
}

@keyframes corePulse {
  0% { transform: translateY(-45px) scale(0.85); box-shadow: 0 0 20px #06b6d4; }
  100% { transform: translateY(-45px) scale(1.15); box-shadow: 0 0 40px #22d3ee; }
}

.reactor-hud {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: monospace;
  font-size: 0.75rem;
  color: #67e8f9;
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  margin-right: 4px;
}
```

---

### Component C: The Crystal Prismatic Tetrahedron Badge

An ultra-sleek, 3-sided luxury crystal prism with iridescent chromatic dispersion.

```html
<div class="prism-badge" tabindex="0">
  <div class="prism-scene">
    <div class="prism-assembly">
      <div class="p-face p-1"></div>
      <div class="p-face p-2"></div>
      <div class="p-face p-3"></div>
      <div class="p-base"></div>
    </div>
  </div>
  <div class="prism-label">PRISM PRO &bull; TIER III</div>
</div>
```

```css
.prism-badge {
  width: 280px;
  background: radial-gradient(circle at 50% 0%, #1e1b4b, #0f172a);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.prism-scene {
  width: 200px;
  height: 200px;
  perspective: 700px;
  perspective-origin: 50% 25%;
  display: grid;
  place-items: center;
}

.prism-assembly {
  --edge: 140px;
  --slant: 121.24px;   /* 140 * sqrt(3) / 2 */
  --rin: 40.41px;      /* 140 / (2 * sqrt(3)) */
  --pitch: 19.47deg;
  
  position: relative;
  width: var(--edge);
  height: var(--edge);
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(20deg);
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.prism-badge:hover .prism-assembly {
  transform: rotateX(-20deg) rotateY(380deg);
}

.p-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--edge);
  height: var(--slant);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.p-1 {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.6) 0%, rgba(168, 85, 247, 0.3) 100%);
  border: 1px solid rgba(244, 114, 182, 0.8);
  transform: rotateY(0deg) translateZ(var(--rin)) rotateX(calc(-1 * var(--pitch)));
}

.p-2 {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(59, 130, 246, 0.3) 100%);
  border: 1px solid rgba(192, 132, 252, 0.8);
  transform: rotateY(120deg) translateZ(var(--rin)) rotateX(calc(-1 * var(--pitch)));
}

.p-3 {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(16, 185, 129, 0.3) 100%);
  border: 1px solid rgba(96, 165, 250, 0.8);
  transform: rotateY(240deg) translateZ(var(--rin)) rotateX(calc(-1 * var(--pitch)));
}

.p-base {
  position: absolute;
  left: 0;
  top: 50%;
  width: var(--edge);
  height: var(--slant);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background: #0f172a;
  transform: rotateX(90deg) translateZ(0);
}

.prism-label {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #d8b4fe;
}
```

---

### Component D: Interactive Exploded-View Architecture

Displays a technical polyhedral breakdown with smooth interactive deconstruction.

```html
<div class="exploded-card" tabindex="0">
  <div class="exploded-scene">
    <div class="exploded-assembly">
      <div class="exp-face exp-front">FRONT</div>
      <div class="exp-face exp-right">RIGHT</div>
      <div class="exp-face exp-back">BACK</div>
      <div class="exp-face exp-left">LEFT</div>
      <div class="exp-base">BASE</div>
    </div>
  </div>
  <p class="exploded-hint">Hover or focus to explode spatial assembly</p>
</div>
```

```css
.exploded-card {
  width: 320px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.exploded-scene {
  width: 260px;
  height: 240px;
  perspective: 800px;
  perspective-origin: 50% 20%;
  display: grid;
  place-items: center;
}

.exploded-assembly {
  --s: 130px;
  --h: 120px;
  --L: 136.47px;      /* sqrt(120^2 + 65^2) */
  --tilt: 28.44deg;   /* atan(65 / 120) */
  
  position: relative;
  width: var(--s);
  height: var(--s);
  transform-style: preserve-3d;
  transform: rotateX(-25deg) rotateY(35deg);
  transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.exp-face {
  position: absolute;
  left: 0;
  bottom: 50%;
  width: var(--s);
  height: var(--L);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transform-origin: 50% 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.exp-front {
  background: rgba(99, 102, 241, 0.85);
  border: 1px solid #a5b4fc;
  transform: rotateY(0deg) translateZ(65px) rotateX(calc(-1 * var(--tilt)));
}

.exp-right {
  background: rgba(79, 70, 229, 0.85);
  border: 1px solid #818cf8;
  transform: rotateY(90deg) translateZ(65px) rotateX(calc(-1 * var(--tilt)));
}

.exp-back {
  background: rgba(67, 56, 202, 0.85);
  border: 1px solid #6366f1;
  transform: rotateY(180deg) translateZ(65px) rotateX(calc(-1 * var(--tilt)));
}

.exp-left {
  background: rgba(55, 48, 163, 0.85);
  border: 1px solid #4f46e5;
  transform: rotateY(270deg) translateZ(65px) rotateX(calc(-1 * var(--tilt)));
}

.exp-base {
  position: absolute;
  inset: 0;
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid #4338ca;
  display: grid;
  place-items: center;
  font-family: monospace;
  font-size: 0.75rem;
  color: #a5b4fc;
  transform: rotateX(90deg) translateZ(-65px);
  transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hover / Focus Exploded State */
.exploded-card:hover .exp-front,
.exploded-card:focus-visible .exp-front {
  transform: rotateY(0deg) translateZ(110px) rotateX(calc(-1 * var(--tilt) - 15deg));
}

.exploded-card:hover .exp-right,
.exploded-card:focus-visible .exp-right {
  transform: rotateY(90deg) translateZ(110px) rotateX(calc(-1 * var(--tilt) - 15deg));
}

.exploded-card:hover .exp-back,
.exploded-card:focus-visible .exp-back {
  transform: rotateY(180deg) translateZ(110px) rotateX(calc(-1 * var(--tilt) - 15deg));
}

.exploded-card:hover .exp-left,
.exploded-card:focus-visible .exp-left {
  transform: rotateY(270deg) translateZ(110px) rotateX(calc(-1 * var(--tilt) - 15deg));
}

.exploded-card:hover .exp-base,
.exploded-card:focus-visible .exp-base {
  transform: rotateX(90deg) translateZ(-110px);
}

.exploded-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}
```

---

## 6. Complete Interactive Master Showcase Application

Below is a complete, single-file HTML & CSS demo combining an interactive theme switcher, custom speed control, wireframe toggles, and pitch/yaw rotation sliders:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 3D Pyramid Master Showcase</title>
  <style>
    :root {
      --bg-gradient: radial-gradient(circle at center, #1e293b, #0f172a);
      --card-bg: rgba(15, 23, 42, 0.85);
      --card-border: rgba(255, 255, 255, 0.1);
      --accent: #6366f1;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      
      /* Pyramid Trigonometric Parameters */
      --s: 180px;
      --h: 150px;
      --L: 174.93px;
      --tilt: 30.96deg;
      --half-s: calc(var(--s) / 2);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: var(--bg-gradient);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--text);
      padding: 2rem;
    }

    .showcase-app {
      width: 100%;
      max-width: 780px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 2.5rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
    }

    @media (max-width: 700px) {
      .showcase-app {
        grid-template-columns: 1fr;
      }
    }

    /* 3D Viewport Stage */
    .stage-container {
      position: relative;
      height: 360px;
      perspective: 900px;
      perspective-origin: 50% 30%;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .master-pyramid-assembly {
      position: relative;
      width: var(--s);
      height: var(--s);
      transform-style: preserve-3d;
      animation: masterTurntable 10s linear infinite;
      will-change: transform;
    }

    /* Lateral Face Styling */
    .master-face {
      position: absolute;
      left: 0;
      bottom: 50%;
      width: var(--s);
      height: var(--L);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      transform-origin: 50% 100%;
      transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), background 300ms ease;
    }

    .mf-front {
      background: linear-gradient(145deg, #f59e0b, #b45309);
      transform: rotateY(0deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
    }

    .mf-right {
      background: linear-gradient(160deg, #fbbf24, #d97706);
      transform: rotateY(90deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
    }

    .mf-back {
      background: linear-gradient(180deg, #d97706, #78350f);
      transform: rotateY(180deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
    }

    .mf-left {
      background: linear-gradient(135deg, #b45309, #451a03);
      transform: rotateY(270deg) translateZ(var(--half-s)) rotateX(calc(-1 * var(--tilt)));
    }

    .master-base {
      position: absolute;
      inset: 0;
      background: #1c1917;
      transform: rotateX(90deg) translateZ(calc(-1 * var(--half-s)));
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
    }

    .master-shadow {
      position: absolute;
      width: calc(var(--s) * 1.6);
      height: calc(var(--s) * 1.6);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotateX(90deg) translateZ(calc(-1 * var(--half-s) - 2px));
      background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.8) 0%, transparent 65%);
      filter: blur(10px);
    }

    /* Cyber Theme Modifier */
    .theme-cyber .mf-front,
    .theme-cyber .mf-right,
    .theme-cyber .mf-back,
    .theme-cyber .mf-left {
      background: linear-gradient(180deg, rgba(6, 182, 212, 0.4) 0%, rgba(8, 51, 68, 0.1) 100%);
      border: 1px solid #22d3ee;
      backdrop-filter: blur(4px);
    }

    /* Emerald Crystal Modifier */
    .theme-emerald .mf-front { background: linear-gradient(145deg, #34d399, #059669); }
    .theme-emerald .mf-right { background: linear-gradient(160deg, #6ee7b7, #10b981); }
    .theme-emerald .mf-back  { background: linear-gradient(180deg, #059669, #065f46); }
    .theme-emerald .mf-left  { background: linear-gradient(135deg, #047857, #022c22); }

    /* Controls Panel */
    .controls-panel {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.5rem;
    }

    .controls-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .controls-header p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .control-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .theme-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .theme-btn {
      flex: 1;
      padding: 0.625rem 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 200ms ease;
    }

    .theme-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .theme-btn.active {
      background: var(--accent);
      border-color: #818cf8;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    .slider-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--accent);
    }

    .spec-sheet {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.75rem;
      color: #a5b4fc;
      line-height: 1.5;
    }

    @keyframes masterTurntable {
      0% { transform: rotateX(-20deg) rotateY(0deg); }
      100% { transform: rotateX(-20deg) rotateY(360deg); }
    }
  </style>
</head>
<body>

  <main class="showcase-app">
    <!-- 3D Stage Viewport -->
    <div class="stage-container" id="stage">
      <div class="master-pyramid-assembly" id="pyramid">
        <div class="master-face mf-front"></div>
        <div class="master-face mf-right"></div>
        <div class="master-face mf-back"></div>
        <div class="master-face mf-left"></div>
        <div class="master-base"></div>
        <div class="master-shadow"></div>
      </div>
    </div>

    <!-- UI Controls -->
    <div class="controls-panel">
      <div class="controls-header">
        <h2>3D Pyramid Engine</h2>
        <p>Real-time spatial trigonometry & GPU shading</p>
      </div>

      <!-- Theme Selector -->
      <div class="control-group">
        <label class="control-label">Material Preset</label>
        <div class="theme-buttons">
          <button class="theme-btn active" onclick="setTheme('gold', this)">Sandstone</button>
          <button class="theme-btn" onclick="setTheme('cyber', this)">Hologram</button>
          <button class="theme-btn" onclick="setTheme('emerald', this)">Emerald</button>
        </div>
      </div>

      <!-- Rotation Speed Slider -->
      <div class="control-group">
        <label class="control-label">Turntable Speed</label>
        <div class="slider-row">
          <input type="range" min="2" max="20" value="10" id="speedSlider" oninput="setSpeed(this.value)">
          <span id="speedValue" style="font-size: 0.8125rem; width: 40px;">10s</span>
        </div>
      </div>

      <!-- Math Specs -->
      <div class="spec-sheet">
        <div>Base Side (s): 180.00px</div>
        <div>Apex Height (h): 150.00px</div>
        <div>Slant Height (L): 174.93px</div>
        <div>Incline Angle (θ): 59.04°</div>
        <div>Pitch Angle (α): 30.96°</div>
      </div>
    </div>
  </main>

  <script>
    function setTheme(themeName, btn) {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const pyramid = document.getElementById('pyramid');
      pyramid.classList.remove('theme-cyber', 'theme-emerald');
      if (themeName !== 'gold') {
        pyramid.classList.add('theme-' + themeName);
      }
    }

    function setSpeed(val) {
      document.getElementById('speedValue').textContent = val + 's';
      document.getElementById('pyramid').style.animationDuration = val + 's';
    }
  </script>
</body>
</html>
```

---

## 7. Performance Optimization, GPU Layering & Compositor Secrets

### 7.1 Isolating Transformations to the GPU Compositor

To sustain a rock-solid 60 FPS or 120 FPS frame rate during complex 3D rotations, transformations must bypass the browser's CPU **Layout** and **Paint** pipelines:

```
[ JavaScript / Trigger ] ──► [ Layout (0ms) ] ──► [ Paint (0ms) ] ──► [ GPU Composite (<1ms) ]
```

#### Optimization Rules:
1. **Never animate layout properties**: Never modify `width`, `height`, `margin`, `top`, or `left` in animation keyframes.
2. **Promote the assembly container**:
   ```css
   .pyramid-assembly {
     transform-style: preserve-3d;
     will-change: transform;
   }
   ```
3. **Use 3D translation vectors**: Use `translateZ()` or `translate3d(x, y, z)` to ensure graphics driver layer promotion.

---

### 7.2 Eliminating Z-Fighting and Sub-Pixel Cracks

When multiple 3D planes share the exact same spatial depth coordinates, GPU floating-point precision limitations cause flickering raster artifacts known as **Z-Fighting**:

```
                       Hairline Seam (< 0.5px)
                              ▼
                        / \       / \
                       /   \ █ █ /   \  <-- Unclipped background showing through
                      /     \ █ /     \
```

#### Prevention Strategies:
1. **Subpixel Overlap Scaling**: Apply a tiny $1.002\times$ scale factor or a $0.5\text{px}$ `margin-top: -0.5px` to the clipped face to bridge subpixel anti-aliasing gaps.
2. **Micro Depth Offsets**: Give adjacent intersecting planes a fractional Z-offset:
   ```css
   .pyramid-base {
     transform: rotateX(90deg) translateZ(calc(var(--half-s) * -1 - 0.1px));
   }
   ```
3. **Explicit Backface Culling**:
   ```css
   .pyramid-face {
     backface-visibility: hidden; /* For opaque pyramids: cuts fragment shader load in half */
   }
   ```

---

## 8. Accessibility, Input Modalities & Reduced Motion Engineering

3D volumetric animations can induce vestibular disorientation or motion sickness in users sensitive to continuous motion.

### 8.1 Motion-Safe Degradation Strategy

Under `@media (prefers-reduced-motion: reduce)`:
- Halt continuous rotational loops.
- Lock the pyramid into an elegant, high-contrast **isometric 3D perspective** ($\text{rotateX}(-25^\circ)\ \text{rotateY}(45^\circ)$) where all facets are clearly visible.

```css
@media (prefers-reduced-motion: reduce) {
  .pyramid-assembly,
  .master-pyramid-assembly,
  .reactor-assembly,
  .tetra-assembly {
    animation: none !important;
    transform: rotateX(-22deg) rotateY(40deg) !important;
    transition: none !important;
  }
  
  .power-core {
    animation: none !important;
  }
}
```

---

### 8.2 Keyboard Accessibility & Semantic Structure

Ensure 3D scenes communicate their purpose to assistive technologies via ARIA:

```html
<div 
  class="pyramid-scene" 
  role="region" 
  aria-label="Interactive 3D Egyptian Pyramid Model"
  tabindex="0"
>
  <div class="sr-only">
    A 3D square pyramid model with four triangular limestone faces oriented at a 51.8 degree angle.
  </div>
  <div class="pyramid-assembly" aria-hidden="true">
    <!-- Faces are purely decorative; hidden from screen readers -->
    <div class="pyramid-face face-front"></div>
    ...
  </div>
</div>
```

---

## 9. Common Pitfalls, Edge Cases & Debugging Matrix

| Issue | Root Cause | Diagnosis & Resolution |
| :--- | :--- | :--- |
| **Faces appear completely flat (2D)** | Ancestor element has `overflow: hidden`, `clip-path`, `filter`, or is missing `transform-style: preserve-3d`. | Inspect DOM hierarchy; ensure every parent between the `perspective` root and the face elements specifies `transform-style: preserve-3d; overflow: visible;`. |
| **Faces do not touch at the apex (open hole at top)** | Face element CSS `height` was set to vertical altitude $h$ instead of slant hypotenuse $L$. | Recalculate slant height: $L = \sqrt{h^2 + (s/2)^2}$. Set element `height: var(--slant-height);`. |
| **Apex drifts or separates during rotation** | Incorrect `transform-origin` point (default `50% 50%` rotates around face center instead of base edge). | Set `transform-origin: 50% 100%;` (for base anchoring) or `transform-origin: 50% 0%;` (for apex anchoring). |
| **Black flickering along joined edges** | GPU Z-fighting caused by co-planar polygon boundaries. | Add a micro-offset `translateZ(0.1px)` or apply `backface-visibility: hidden`. |
| **Click/hover events triggered outside triangular boundary** | The rectangular bounding box of the DOM element captures events even outside the clipped area. | Ensure `clip-path: polygon(...)` is applied directly to the interactive container, which clips pointer hitboxes in modern browsers. |
| **Jagged anti-aliasing edges on Safari** | WebKit subpixel antialiasing bug on transformed clipped layers. | Apply `transform: translateZ(0);` and `-webkit-font-smoothing: antialiased;` to force MSAA smoothing. |

---

## 10. Master Production Checklist

Use this 20-point verification checklist before deploying CSS 3D Pyramids in production:

- [ ] **1. Perspective Defined**: Viewport container has an appropriate `perspective: 600px - 1200px` and `perspective-origin`.
- [ ] **2. 3D Context Preserved**: All intermediate parent wrappers declare `transform-style: preserve-3d;`.
- [ ] **3. No Flattening Hazards**: No intermediate container has `overflow: hidden`, `contain: paint`, or unsupported `filter` properties.
- [ ] **4. Exact Slant Height**: Face `height` strictly equals the 3D hypotenuse $L = \sqrt{h^2 + (s/2)^2}$.
- [ ] **5. Accurate Pitch Angle**: Pitch angle strictly equals $\arctan((s/2) / h)$.
- [ ] **6. Correct Transform Origin**: Lateral faces use `transform-origin: 50% 100%` (or `50% 0%`).
- [ ] **7. Precise Azimuth Offsets**: Faces rotated at exact cardinal intervals (`0deg`, `90deg`, `180deg`, `270deg` for 4-sided; `0deg`, `120deg`, `240deg` for 3-sided).
- [ ] **8. Clean Polygon Clipping**: `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)` applied without residual border-radius.
- [ ] **9. Base Cap Fitted**: Square base face positioned at $Y = 0$ / $Z = -s/2$ to enclose the polyhedron.
- [ ] **10. Photometric Shading**: Surface gradients simulate realistic key light and ambient occlusion.
- [ ] **11. Ground Contact Shadow**: Ground shadow plane rendered on $X-Z$ plane with realistic radial blur.
- [ ] **12. GPU Compositor Isolation**: Keyframe animations only touch `transform` and `opacity`.
- [ ] **13. Layer Promotion**: `will-change: transform` declared on rotating assemblies.
- [ ] **14. Z-Fighting Elimination**: Micro depth offsets and `backface-visibility: hidden` applied where needed.
- [ ] **15. Subpixel Seam Prevention**: Overdraw scaling ($1.002\times$) bridges high-DPI raster gaps.
- [ ] **16. Reduced Motion Support**: `@media (prefers-reduced-motion: reduce)` halts continuous spin into a fixed isometric projection.
- [ ] **17. Accessibility Semantics**: 3D scene wrapped in accessible container with descriptive text for screen readers.
- [ ] **18. Touch / Pointer Support**: Interactive scenes respond smoothly to pointer hover or drag gestures.
- [ ] **19. Cross-Browser Validation**: Verified on Chromium, Safari (WebKit), and Firefox Gecko engines.
- [ ] **20. Mobile Viewport Resiliency**: CSS units scale gracefully across mobile and desktop displays.
