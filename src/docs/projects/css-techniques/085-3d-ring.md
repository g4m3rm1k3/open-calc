---
concept: 085-3d-ring
name: CSS 3D Ring & Cylindrical Carousel Masterclass
category: CSS 3D Transforms, Spatial Geometry & Cylindrical Layouts
difficulty: Advanced
tags: [css, 3d-transforms, 3d-ring, cylinder-carousel, perspective, preserve-3d, transform-style, trigonometry, translateZ, rotateY, apothem, spatial-ui, 3d-carousel, modern-css, hardware-acceleration, animation]
---

# 085: CSS 3D Ring & Cylindrical Carousel Masterclass

## Overview & Executive Summary

In contemporary spatial interface design, presenting content along a flat 2D plane often fails to convey scale, hierarchy, and physical immersion. While standard horizontal carousels and linear grids are ubiquitous, **CSS 3D Rings** (also known as *cylindrical carousels*, *radial 3D prisms*, or *spatial turntables*) arrange DOM elements radially around a virtual 3D axis. This geometric configuration forms a continuous polygonal cylinder or celestial orbital ring that can rotate smoothly in response to user interaction, time-based keyframes, or pointer tracking.

A 3D Ring transforms a collection of $N$ discrete planar cards into an integrated 3D polyhedron where:
1. **Geometric Apothem Alignment**: Each card is rotated along the Y-axis by its angular step ($\theta_i = i \cdot \frac{360^\circ}{N}$) and translated outward along the local Z-axis by the exact polygon apothem radius ($r = \frac{w}{2 \tan(180^\circ / N)}$), ensuring seamless edge-to-edge alignment or mathematically uniform inter-card gaps.
2. **Camera Perspective Projection**: A virtual camera viewport with a defined focal length (`perspective: 1000px`) projects the 3D coordinates onto the 2D screen, creating authentic foreshortening, depth scaling, and parallax displacement.
3. **Hierarchical 3D Scene Graph**: By maintaining `transform-style: preserve-3d` across the container hierarchy, rotating the central ring pivot automatically orbits all child facets simultaneously without requiring individual coordinate recalculations.
4. **Compositor-Thread Execution**: With CSS 3D matrix operations (`matrix3d()`, `rotateY()`, `translate3d()`), modern browser graphics engines execute all orbital motion directly on the GPU compositor thread at a locked 60–120 FPS with 0ms layout reflow.

```
================================================================================
                       THE CSS 3D RING SPATIAL ARCHITECTURE
================================================================================

                               [ VIRTUAL CAMERA ]
                              perspective: 1000px
                             perspective-origin: 50% 50%
                                      │
                                      │ Focal Distance d
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │            3D VIEWPORT CONTAINER                 │
             │           (Establishes Viewing Frustum)          │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      RING PIVOT AXIS      │  <-- transform-style: preserve-3d
                        │   `transform: rotateY(θ)` │  <-- Rotates all facets together
                        └─────────────┬─────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
               ▼                      ▼                      ▼
        ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
        │  FACET 0    │        │  FACET 1    │        │  FACET 2    │
        │ rotateY(0°) │        │rotateY(45°) │        │rotateY(90°) │
        │translateZ(r)│        │translateZ(r)│        │translateZ(r)│
        └─────────────┘        └─────────────┘        └─────────────┘
               \                      │                      /
                \                     │                     /
                 \                    ▼                    /
                  \            . - ~ ~ ~ ~ - .            /
                   \         /                 \         /
                    \       |   CENTRAL AXIS    |       /
                     ▼      |      (0, 0)       |      ▼
                   [ F7 ]    \                 /    [ F3 ]
                               ' - ~ ~ ~ ~ - '
                                  /       \
                                 /         \
                              [ F6 ]     [ F4 ]
                                    \   /
                                    [ F5 ]
                             (Polygon Incircle Radius r)
================================================================================
```

---

## Quick Reference Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Name** | CSS 3D Ring & Cylindrical Carousel |
| **Category** | CSS 3D Transforms, Spatial Geometry & Cylindrical Layouts |
| **Specification** | [W3C CSS Transforms Module Level 2](https://www.w3.org/TR/css-transforms-2/), [CSS Values and Units Module Level 4](https://www.w3.org/TR/css-values-4/) |
| **Difficulty** | Advanced (4/5) |
| **What it produces** | Seamless 360-degree polygonal cylinders, card carousels, planetary HUD telemetry rings, panoramic portals, and gyroscopic multi-axis orbital rings constructed entirely with semantic HTML and CSS 3D transforms. |
| **Why it works** | Elements are positioned via polar-to-Cartesian 3D transformation matrices ($T = R_y(\theta) \times T_z(r)$) inside a `preserve-3d` context, allowing the parent turntable to revolve all facets in unified spatial depth on the GPU compositor thread. |
| **Key Properties** | `perspective`, `perspective-origin`, `transform-style: preserve-3d`, `rotateY()`, `rotateX()`, `translateZ()`, `backface-visibility`, `calc()`, `tan()`, `sin()`, `cos()`, `@property`. |
| **Strict Constraints** | Never apply `overflow: hidden`, `clip-path`, or `filter` directly to the `preserve-3d` pivot container (this triggers the *3D Flattening Trap*, collapsing all Z-depth to 2D); always compute the exact apothem radius to prevent card collision or gaps. |
| **Browser Baseline** | Baseline 2020+ for core 3D transforms (`perspective`, `preserve-3d`, `translateZ`); Baseline 2023+ for CSS trigonometric functions (`tan()`, `sin()`, `cos()`) and CSS `@property` Houdini registration. |
| **Acceptance Criteria** | Locked 60/120 FPS compositor rotation; zero visual tearing or Z-fighting between facets; accurate mathematical apothem radius; full keyboard `:focus-visible` navigation and `@media (prefers-reduced-motion)` 2D fallback. |

### Quick Preview

```html
<div class="ring-stage" aria-label="3D Cylindrical Ring Demo">
  <div class="ring-turntable" style="--total: 8; --item-width: 140px;">
    <div class="ring-card" style="--i: 0;"><span>01</span></div>
    <div class="ring-card" style="--i: 1;"><span>02</span></div>
    <div class="ring-card" style="--i: 2;"><span>03</span></div>
    <div class="ring-card" style="--i: 3;"><span>04</span></div>
    <div class="ring-card" style="--i: 4;"><span>05</span></div>
    <div class="ring-card" style="--i: 5;"><span>06</span></div>
    <div class="ring-card" style="--i: 6;"><span>07</span></div>
    <div class="ring-card" style="--i: 7;"><span>08</span></div>
  </div>
</div>
```

```css
@property --ring-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

:root {
  --perspective: 1000px;
  --ring-tilt: -12deg;
  --card-width: 140px;
  --card-height: 180px;
}

.ring-stage {
  inline-size: 100%;
  min-block-size: 380px;
  display: grid;
  place-items: center;
  perspective: var(--perspective);
  perspective-origin: 50% 50%;
  background: radial-gradient(circle at center, #1e1b4b, #09090b);
  overflow: hidden;
}

.ring-turntable {
  position: relative;
  inline-size: var(--card-width);
  block-size: var(--card-height);
  transform-style: preserve-3d;
  transform: rotateX(var(--ring-tilt)) rotateY(var(--ring-angle));
  animation: spinRing 24s linear infinite;
}

.ring-card {
  --angle: calc(var(--i) * (360deg / var(--total)));
  /* Mathematical Apothem Radius: r = w / (2 * tan(180deg / N)) */
  --radius: calc(var(--card-width) / (2 * tan(180deg / var(--total))));
  
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(168, 85, 247, 0.4);
  backdrop-filter: blur(8px);
  color: #f8fafc;
  font-size: 1.75rem;
  font-weight: 800;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37), inset 0 0 16px rgba(168, 85, 247, 0.2);
  backface-visibility: visible;
  
  /* Radially project each card into 3D cylinder space */
  transform: rotateY(var(--angle)) translateZ(var(--radius));
}

@keyframes spinRing {
  from { --ring-angle: 0deg; }
  to   { --ring-angle: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .ring-turntable {
    animation: none;
    transform: rotateX(0deg) rotateY(0deg);
  }
}
```

---

## 1. Mathematical Foundations & Spatial Geometry of 3D Rings

Building a distortion-free 3D ring requires a firm understanding of regular polygon geometry, trigonometry, perspective projection equations, and coordinate matrix transformations.

### 1.1 Cylindrical Trigonometry & The Polygon Apothem Derivation

When arranging $N$ rectangular facets of width $w$ into a regular polygonal prism (cylinder), each facet forms one side of an $N$-sided regular polygon inscribed inside a circle of radius $R$ (circumradius) and tangent to a circle of radius $r$ (inradius or **apothem**).

```
                      REGULAR POLYGON SECTOR GEOMETRY
                                     
                                     O (Origin / Center Axis)
                                    /|\
                                   / | \
                                  /  |  \
                                 /   |   \  Radius R (Circumradius)
                                /    |    \
                               /     | r   \
                              /      |      \
                             /       |       \
                            /θ/2     |        \
                           ┌─────────┴─────────┐
                           │◄─────── w ───────►│
                           A         M         B
                               Facet Width
```

1. **Central Angle ($\theta$)**:
   The entire circle ($360^\circ$ or $2\pi$ radians) is divided equally among $N$ facets:
   $$\theta = \frac{360^\circ}{N}$$
2. **Right Triangle Decomposition**:
   Bisecting the isosceles triangle $\triangle OAB$ along median $OM$ produces two right triangles with angle $\alpha = \frac{\theta}{2} = \frac{180^\circ}{N}$ at vertex $O$. The opposite side is half the facet width ($AM = \frac{w}{2}$), and the adjacent side is the apothem radius ($OM = r$).
3. **The Apothem Formula (Inradius $r$)**:
   $$\tan\left(\frac{180^\circ}{N}\right) = \frac{w / 2}{r} \implies r = \frac{w}{2 \cdot \tan\left(\frac{180^\circ}{N}\right)}$$
4. **Circumradius ($R$)**:
   $$\sin\left(\frac{180^\circ}{N}\right) = \frac{w / 2}{R} \implies R = \frac{w}{2 \cdot \sin\left(\frac{180^\circ}{N}\right)}$$
5. **Incorporating Custom Gaps ($g$)**:
   To insert a uniform horizontal gap $g$ between adjacent facets without distortion, substitute $(w + g)$ into the apothem formula:
   $$r_{\text{gap}} = \frac{w + g}{2 \cdot \tan\left(\frac{180^\circ}{N}\right)}$$

#### Exact Apothem Radii Reference Table (for $w = 200\text{px}$)

| Facet Count ($N$) | Central Angle ($\theta$) | Half Angle ($\theta/2$) | Tangent $\tan(\theta/2)$ | Apothem Radius $r$ ($w = 200\text{px}$) |
| :---: | :---: | :---: | :---: | :---: |
| **3** (Triangle) | $120.0^\circ$ | $60.0^\circ$ | $1.73205$ | $\mathbf{57.74\text{px}}$ |
| **4** (Square) | $90.0^\circ$ | $45.0^\circ$ | $1.00000$ | $\mathbf{100.00\text{px}}$ |
| **6** (Hexagon) | $60.0^\circ$ | $30.0^\circ$ | $0.57735$ | $\mathbf{173.21\text{px}}$ |
| **8** (Octagon) | $45.0^\circ$ | $22.5^\circ$ | $0.41421$ | $\mathbf{241.42\text{px}}$ |
| **10** (Decagon) | $36.0^\circ$ | $18.0^\circ$ | $0.32492$ | $\mathbf{307.77\text{px}}$ |
| **12** (Dodecagon) | $30.0^\circ$ | $15.0^\circ$ | $0.26795$ | $\mathbf{373.21\text{px}}$ |
| **16** (Hexadecagon) | $22.5^\circ$ | $11.25^\circ$ | $0.19891$ | $\mathbf{502.73\text{px}}$ |
| **20** (Icosagon) | $18.0^\circ$ | $9.0^\circ$ | $0.15838$ | $\mathbf{631.38\text{px}}$ |

---

### 1.2 Perspective Projection & Camera Frustum Mechanics

The CSS `perspective` property sets the virtual distance between the observer's eye (camera) and the $Z = 0$ canvas plane.

```
                               PERSPECTIVE PROJECTION FRUSTUM
                               
           Observer Eye
             (Camera)
                ● (0, 0, -d)
               / \
              /   \
             /     \
    ════════/═══════\════════  Z = 0 (CSS Projection Screen Canvas)
           /    w    \
          /           \
         /             \
        ┌───────────────┐      Z = +r (Front of Ring, closer -> appears magnified)
        │  Front Card   │      Scale = d / (d - r)
        └───────────────┘
               ...
        ┌───────────────┐      Z = -r (Back of Ring, farther -> appears diminished)
        │   Back Card   │      Scale = d / (d + r)
        └───────────────┘
```

1. **Apparent Scale Multiplier ($S_z$)**:
   For an object at depth $Z$ relative to a camera at focal distance $d$:
   $$S_z = \frac{d}{d - Z}$$
   - **Front Facet ($Z = +r$)**: Appears scaled by $S_{\text{front}} = \frac{d}{d - r} > 1.0$ (magnified toward the viewer).
   - **Back Facet ($Z = -r$)**: Appears scaled by $S_{\text{back}} = \frac{d}{d + r} < 1.0$ (diminished in the background).
2. **Choosing Optimal Perspective Values**:
   - `perspective: 500px` – Dramatic wide-angle fisheye lens; strong depth exaggeration, high foreground distortion.
   - `perspective: 1000px` – Standard balanced human vision (equivalent to a 50mm portrait lens); natural depth without excessive distortion (**Recommended**).
   - `perspective: 2000px` – Telephoto / isometric aesthetic; subtle spatial depth, minimal scaling variance between front and back facets.

---

### 1.3 3D Matrix Transformation Composition Order

Transformations in CSS are evaluated from right to left (in mathematical matrix notation: $M_{\text{final}} = M_1 \times M_2$). The order of operations is critical when generating a 3D ring.

```css
/* CORRECT: Rotate the local coordinate system first, then push outward along local Z */
transform: rotateY(var(--angle)) translateZ(var(--radius));

/* INCORRECT: Pushes forward along world Z first, then orbits around world origin */
transform: translateZ(var(--radius)) rotateY(var(--angle));
```

```
================================================================================
               TRANSFORMATION ORDER: LOCAL vs. WORLD MATRICES
================================================================================

[ 1. CORRECT: rotateY(θ) THEN translateZ(r) ]

  Step A: rotateY(45deg)           Step B: translateZ(r)
  Rotates local coordinate frame.   Translates outward along the *new* local Z.
  
            Y (up)                            Y (up)
            │   Z (pointing 45°)              │   Z
            │  /                              │  /  ┌─────────┐
            │ /                               │ /   │ Facet 1 │ at (r·sin45°, r·cos45°)
  ──────────┼────────── X           ──────────┼─────┴───────── X
           /                                 /
          /                                 /

--------------------------------------------------------------------------------

[ 2. INCORRECT: translateZ(r) THEN rotateY(θ) ]

  Step A: translateZ(r)            Step B: rotateY(45deg)
  Moves object straight to Z=+r.    Spins the object in-place at Z=+r!
                                    (All facets remain clumped at front!)
================================================================================
```

---

## 2. Core Anatomy of the CSS 3D Ring Pipeline

A production-grade CSS 3D Ring is structured into a 3-tier hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STAGE / VIEWPORT (.ring-stage)                           │
│    - perspective: 1000px;                                   │
│    - perspective-origin: 50% 50%;                           │
│    - Establishes the 3D camera frustum                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. TURNTABLE PIVOT (.ring-turntable)                        │
│    - transform-style: preserve-3d;                          │
│    - transform: rotateX(var(--tilt)) rotateY(var(--angle)); │
│    - Central anchor holding all facets in shared 3D space   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ 3A. FACET 0 (.ring-card)     │       │ 3B. FACET N (.ring-card)     │
│   - position: absolute;      │  ...  │   - position: absolute;      │
│   - rotateY(0deg)            │       │   - rotateY(calc(N * step))  │
│   - translateZ(var(--radius))│       │   - translateZ(var(--radius))│
│   - backface-visibility      │       │   - backface-visibility      │
└──────────────────────────────┘       └──────────────────────────────┘
```

### 2.1 The 3 Essential Architectural Layers

1. **The Stage Viewport (`.ring-stage`)**:
   - Holds the `perspective` property.
   - Defines the camera origin (`perspective-origin`).
   - Acts as a boundary container (`display: grid; place-items: center;`).
2. **The Turntable Pivot (`.ring-turntable`)**:
   - Holds `transform-style: preserve-3d`.
   - Dimensions match a single facet width/height (`inline-size: var(--card-w); block-size: var(--card-h);`).
   - Rotates around the global $Y$ or $X$ axis via keyframe animation or user interaction.
3. **The Facet Items (`.ring-card`)**:
   - Positioned `absolute` with `inset: 0` to stack at the exact center pivot before transformation.
   - Positioned radially using `transform: rotateY(var(--angle)) translateZ(var(--radius))`.
   - Configured with `backface-visibility: hidden` (for single-sided cards) or `visible` (for translucent/glassmorphic cylinders).

---

## 3. The 6 Core 3D Ring Architectural Patterns

### Pattern 1: The Cylindrical 3D Showcase Carousel with Floor Reflection

This pattern features high-polish product or media cards arranged in a rotating cylinder, accompanied by an interactive reflection floor, ambient light bloom, and active-facet focus elevation.

```
                     CYLINDRICAL SHOWCASE WITH FLOOR REFLECTION
                     
                               /───────────/  Top Camera Tilt (-10deg)
                              /   STAGE   /
                             /───────────/
                                   │
                           ┌───────┴───────┐
                     ┌─────┤ ACTIVE FACET  ├─────┐
                     │     │  (Front & Ctr)│     │
                 ┌───┴───┐ └───────┬───────┘ ┌───┴───┐
                 │Facet 7│         │         │Facet 1│
                 └───────┘   . - ~ ~ ~ - .   └───────┘
                     │     /               \     │
                     └─── (  Central Pivot  ) ───┘
                           \               /
                             ' - ~ ~ ~ - '
                     ─────────────────────────────
                     ░░░░░ Floor Reflection ░░░░░░
                     ─────────────────────────────
```

#### Complete Implementation:

```html
<section class="showcase-cylinder" aria-label="Product Showcase 3D Ring">
  <div class="cylinder-stage">
    <div class="cylinder-turntable" id="showcaseTurntable" style="--total: 6; --current-index: 0;">
      <!-- Facet 0 -->
      <article class="cylinder-card" style="--i: 0;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Quantum</div>
          <h3 class="card-title">Apex Pro X</h3>
          <p class="card-metric">128 TFLOPS</p>
          <div class="card-status">Active State</div>
        </div>
      </article>
      <!-- Facet 1 -->
      <article class="cylinder-card" style="--i: 1;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Neural</div>
          <h3 class="card-title">Synapse AI</h3>
          <p class="card-metric">99.8% Latency</p>
          <div class="card-status">Online</div>
        </div>
      </article>
      <!-- Facet 2 -->
      <article class="cylinder-card" style="--i: 2;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Security</div>
          <h3 class="card-title">Sentinel Zero</h3>
          <p class="card-metric">EAL 7+ Vault</p>
          <div class="card-status">Protected</div>
        </div>
      </article>
      <!-- Facet 3 -->
      <article class="cylinder-card" style="--i: 3;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Cloud</div>
          <h3 class="card-title">HyperScale</h3>
          <p class="card-metric">10 Gbps Mesh</p>
          <div class="card-status">Connected</div>
        </div>
      </article>
      <!-- Facet 4 -->
      <article class="cylinder-card" style="--i: 4;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Storage</div>
          <h3 class="card-title">TerraStore</h3>
          <p class="card-metric">1.2 PB Array</p>
          <div class="card-status">Synchronized</div>
        </div>
      </article>
      <!-- Facet 5 -->
      <article class="cylinder-card" style="--i: 5;" tabindex="0">
        <div class="card-glass">
          <div class="card-badge">Telemetry</div>
          <h3 class="card-title">OmniTrack</h3>
          <p class="card-metric">0.1ms Polling</p>
          <div class="card-status">Streaming</div>
        </div>
      </article>
    </div>
    
    <!-- Floor Reflection Surface -->
    <div class="cylinder-floor" aria-hidden="true"></div>
  </div>
  
  <!-- Carousel Navigation Controls -->
  <nav class="cylinder-controls" aria-label="Carousel Controls">
    <button class="nav-btn prev-btn" id="prevBtn" aria-label="Previous card">←</button>
    <div class="nav-indicators" id="indicators"></div>
    <button class="nav-btn next-btn" id="nextBtn" aria-label="Next card">→</button>
  </nav>
</section>
```

```css
:root {
  --ring-card-w: 220px;
  --ring-card-h: 300px;
  --ring-gap: 24px;
  --ring-tilt-angle: -8deg;
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}

.showcase-cylinder {
  position: relative;
  inline-size: 100%;
  min-block-size: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0c0a1f 60%, #030014 100%);
  overflow: hidden;
  padding-block: 2rem;
}

.cylinder-stage {
  position: relative;
  inline-size: 100%;
  block-size: 420px;
  display: grid;
  place-items: center;
  perspective: 1100px;
  perspective-origin: 50% 40%;
}

.cylinder-turntable {
  position: relative;
  inline-size: var(--ring-card-w);
  block-size: var(--ring-card-h);
  transform-style: preserve-3d;
  /* Active card rotation formula */
  --turntable-angle: calc(var(--current-index) * (-360deg / var(--total)));
  transform: rotateX(var(--ring-tilt-angle)) rotateY(var(--turntable-angle));
  transition: transform 600ms var(--ease-spring);
  will-change: transform;
}

.cylinder-card {
  --angle: calc(var(--i) * (360deg / var(--total)));
  /* Mathematical Apothem Radius with Gap: r = (w + g) / (2 * tan(180deg / N)) */
  --radius: calc((var(--ring-card-w) + var(--ring-gap)) / (2 * tan(180deg / var(--total))));
  
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateY(var(--angle)) translateZ(var(--radius));
  cursor: pointer;
  outline: none;
  transition: filter 400ms ease, opacity 400ms ease;
  -webkit-box-reflect: below 16px linear-gradient(to bottom, transparent 65%, rgba(0,0,0,0.3) 100%);
}

.cylinder-card:focus-visible .card-glass {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.4), 0 12px 36px rgba(168, 85, 247, 0.3);
}

.card-glass {
  inline-size: 100%;
  block-size: 100%;
  padding: 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  user-select: none;
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.cylinder-card:hover .card-glass {
  border-color: rgba(168, 85, 247, 0.6);
  transform: scale(1.03);
  box-shadow: 0 20px 48px rgba(147, 51, 234, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.card-badge {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.3);
  border-radius: 9999px;
}

.card-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.card-metric {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #38bdf8;
  font-family: ui-monospace, monospace;
}

.card-status {
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-status::before {
  content: "";
  inline-size: 6px;
  block-size: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

/* Floor Reflection & Radial Grid */
.cylinder-floor {
  position: absolute;
  inset-block-end: 20px;
  inline-size: 600px;
  block-size: 600px;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%);
  transform: rotateX(90deg) translateZ(-160px);
  pointer-events: none;
  filter: blur(16px);
}

/* Navigation Controls */
.cylinder-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-block-start: 1rem;
  z-index: 10;
}

.nav-btn {
  inline-size: 44px;
  block-size: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 1.25rem;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 200ms ease;
  backdrop-filter: blur(8px);
}

.nav-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.6);
  transform: scale(1.08);
}

.nav-btn:focus-visible {
  outline: 2px solid #a855f7;
  outline-offset: 4px;
}
```

```javascript
// Interactive Carousel Navigation Script
(function initShowcaseCylinder() {
  const turntable = document.getElementById('showcaseTurntable');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!turntable || !prevBtn || !nextBtn) return;

  const total = parseInt(turntable.style.getPropertyValue('--total')) || 6;
  let currentIndex = 0;

  function updateCarousel(newIndex) {
    currentIndex = (newIndex + total) % total;
    turntable.style.setProperty('--current-index', currentIndex);
    
    // Update ARIA and focus states
    const cards = turntable.querySelectorAll('.cylinder-card');
    cards.forEach((card, idx) => {
      if (idx === currentIndex) {
        card.setAttribute('aria-current', 'true');
        card.style.opacity = '1';
        card.style.filter = 'none';
      } else {
        card.removeAttribute('aria-current');
        card.style.opacity = '0.7';
        card.style.filter = 'brightness(0.85)';
      }
    });
  }

  prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
  nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));

  // Keyboard navigation
  turntable.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') updateCarousel(currentIndex - 1);
    if (e.key === 'ArrowRight') updateCarousel(currentIndex + 1);
  });

  // Direct card click
  const cards = turntable.querySelectorAll('.cylinder-card');
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => updateCarousel(idx));
  });

  updateCarousel(0);
})();
```

---

### Pattern 2: Continuous Particle & Icon Ring with Face-Camera Billboarding

When displaying partner logos, skill icons, or orbital particles, rotating elements will naturally show their reverse side or angle away from the viewer. **Face-Camera Billboarding** applies an equal and opposite counter-rotation (`rotateY(calc(var(--angle) * -1))`) to child icons so they constantly face the camera lens while revolving along the 3D ring.

```
                    CONTINUOUS RING WITH COUNTER-ROTATION
                    
               ┌─────────┐
               │ Icon 1  │ (Faces Camera: 0°)
               └────┬────┘
                    │
            . - ~ ~ ┼ ~ ~ - .
          /         │         \
    ┌────┴────┐     │     ┌────┴────┐
    │ Icon 4  │     ●     │ Icon 2  │ (All icons stay perpendicular to viewer)
    └─────────┘    Hub    └─────────┘
          \                   /
            ' - ~ ~ ┬ ~ ~ - '
                    │
               ┌────┴────┐
               │ Icon 3  │
               └─────────┘
```

#### Implementation:

```html
<div class="orbit-billboard-stage" aria-label="Technologies Ecosystem 3D Ring">
  <div class="orbit-billboard-ring" style="--total: 8; --orbit-radius: 180px;">
    <div class="orbit-node" style="--i: 0;"><div class="node-icon">⚡</div></div>
    <div class="orbit-node" style="--i: 1;"><div class="node-icon">⚛️</div></div>
    <div class="orbit-node" style="--i: 2;"><div class="node-icon">🚀</div></div>
    <div class="orbit-node" style="--i: 3;"><div class="node-icon">🛡️</div></div>
    <div class="orbit-node" style="--i: 4;"><div class="node-icon">💎</div></div>
    <div class="orbit-node" style="--i: 5;"><div class="node-icon">🔮</div></div>
    <div class="orbit-node" style="--i: 6;"><div class="node-icon">🌐</div></div>
    <div class="orbit-node" style="--i: 7;"><div class="node-icon">🔥</div></div>
  </div>
  <div class="orbit-core-hub">
    <span>CORE</span>
  </div>
</div>
```

```css
@property --orbit-spin {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.orbit-billboard-stage {
  position: relative;
  inline-size: 100%;
  min-block-size: 440px;
  display: grid;
  place-items: center;
  perspective: 900px;
  background: #09090b;
  overflow: hidden;
}

.orbit-billboard-ring {
  position: relative;
  inline-size: 60px;
  block-size: 60px;
  transform-style: preserve-3d;
  transform: rotateX(-16deg) rotateY(var(--orbit-spin));
  animation: spinBillboardRing 20s linear infinite;
}

.orbit-node {
  --angle: calc(var(--i) * (360deg / var(--total)));
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  /* Push outward to orbit radius */
  transform: rotateY(var(--angle)) translateZ(var(--orbit-radius));
}

/* Billboarding: Invert parent rotation to keep icon flat to camera */
.node-icon {
  inline-size: 100%;
  block-size: 100%;
  border-radius: 16px;
  background: rgba(30, 27, 75, 0.8);
  border: 1px solid #818cf8;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  /* Counter-rotate: cancels ring's tilt and current azimuthal rotation */
  transform: rotateY(calc(var(--angle) * -1 - var(--orbit-spin))) rotateX(16deg);
}

.orbit-core-hub {
  position: absolute;
  inline-size: 90px;
  block-size: 90px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #6366f1, #312e81);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-weight: 800;
  letter-spacing: 0.1em;
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
  z-index: 2;
  pointer-events: none;
}

@keyframes spinBillboardRing {
  from { --orbit-spin: 0deg; }
  to   { --orbit-spin: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-billboard-ring {
    animation: none;
  }
}
```

---

### Pattern 3: Gyroscopic Sci-Fi HUD Multi-Ring

By nesting multiple concentric 3D rings with differing radii, tilt angles, and rotational velocities across X, Y, and Z axes, you can construct intricate sci-fi holographic gimbals and quantum orbital instruments.

```
                      GYROSCOPIC MULTI-AXIS HUD GIMBAL
                      
                        / - - - - - - - - \   Outer Ring (Rotate Z/Y)
                       /   . - - - - - .   \
                      /   /  ┌───────┐  \   \  Middle Ring (Rotate X)
                     |   |   │ NUCLEUS│  |   |
                      \   \  └───────┘  /   /  Inner Ring (Rotate Y)
                       \   ` - - - - - '   /
                        \ - - - - - - - - /
```

#### Implementation:

```html
<div class="gyro-stage" aria-label="Sci-Fi Gyroscopic HUD">
  <div class="gyro-system">
    <!-- Outer Gimbal Ring (Rotate Z + Y) -->
    <div class="gyro-ring ring-outer" style="--total: 12; --r: 220px; --speed: 28s;">
      <div class="gyro-marker" style="--i: 0;"></div>
      <div class="gyro-marker" style="--i: 2;"></div>
      <div class="gyro-marker" style="--i: 4;"></div>
      <div class="gyro-marker" style="--i: 6;"></div>
      <div class="gyro-marker" style="--i: 8;"></div>
      <div class="gyro-marker" style="--i: 10;"></div>
    </div>
    
    <!-- Middle Gimbal Ring (Rotate X) -->
    <div class="gyro-ring ring-mid" style="--total: 8; --r: 160px; --speed: -18s;">
      <div class="gyro-marker cyan" style="--i: 0;"></div>
      <div class="gyro-marker cyan" style="--i: 2;"></div>
      <div class="gyro-marker cyan" style="--i: 4;"></div>
      <div class="gyro-marker cyan" style="--i: 6;"></div>
    </div>

    <!-- Inner Gimbal Ring (Rotate Y + Z) -->
    <div class="gyro-ring ring-inner" style="--total: 6; --r: 100px; --speed: 12s;">
      <div class="gyro-marker amber" style="--i: 0;"></div>
      <div class="gyro-marker amber" style="--i: 2;"></div>
      <div class="gyro-marker amber" style="--i: 4;"></div>
    </div>
    
    <!-- Holographic Energy Core -->
    <div class="gyro-core">
      <div class="core-pulse"></div>
      <span class="core-label">AI::SYNC</span>
    </div>
  </div>
</div>
```

```css
.gyro-stage {
  inline-size: 100%;
  min-block-size: 500px;
  display: grid;
  place-items: center;
  perspective: 1200px;
  background: radial-gradient(circle at center, #0a0f1d 0%, #02040a 100%);
  overflow: hidden;
}

.gyro-system {
  position: relative;
  inline-size: 10px;
  block-size: 10px;
  transform-style: preserve-3d;
  transform: rotateX(24deg) rotateY(-18deg);
}

.gyro-ring {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  border-radius: 50%;
}

.ring-outer {
  inline-size: calc(var(--r) * 2);
  block-size: calc(var(--r) * 2);
  margin-inline-start: calc(var(--r) * -1);
  margin-block-start: calc(var(--r) * -1);
  border: 1px dashed rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.2);
  animation: gyroSpinOuter var(--speed) linear infinite;
}

.ring-mid {
  inline-size: calc(var(--r) * 2);
  block-size: calc(var(--r) * 2);
  margin-inline-start: calc(var(--r) * -1);
  margin-block-start: calc(var(--r) * -1);
  border: 1px solid rgba(6, 182, 212, 0.35);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
  animation: gyroSpinMid var(--speed) linear infinite;
}

.ring-inner {
  inline-size: calc(var(--r) * 2);
  block-size: calc(var(--r) * 2);
  margin-inline-start: calc(var(--r) * -1);
  margin-block-start: calc(var(--r) * -1);
  border: 1px dotted rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.3);
  animation: gyroSpinInner var(--speed) linear infinite;
}

.gyro-marker {
  --angle: calc(var(--i) * (360deg / var(--total)));
  position: absolute;
  top: 50%;
  left: 50%;
  inline-size: 12px;
  block-size: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 12px #818cf8;
  transform: rotateZ(var(--angle)) translateY(calc(var(--r) * -1));
}

.gyro-marker.cyan { background: #22d3ee; box-shadow: 0 0 12px #22d3ee; }
.gyro-marker.amber { background: #fbbf24; box-shadow: 0 0 12px #fbbf24; }

.gyro-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  inline-size: 70px;
  block-size: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%);
  display: grid;
  place-items: center;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 800;
  color: #a5f3fc;
  text-shadow: 0 0 10px #22d3ee;
}

.core-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid #22d3ee;
  animation: corePulse 2s ease-out infinite;
}

@keyframes gyroSpinOuter {
  from { transform: rotateZ(0deg) rotateY(0deg); }
  to   { transform: rotateZ(360deg) rotateY(360deg); }
}

@keyframes gyroSpinMid {
  from { transform: rotateX(0deg) rotateZ(0deg); }
  to   { transform: rotateX(360deg) rotateZ(-360deg); }
}

@keyframes gyroSpinInner {
  from { transform: rotateY(0deg) rotateX(0deg); }
  to   { transform: rotateY(-360deg) rotateX(360deg); }
}

@keyframes corePulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
```

---

### Pattern 4: Interactive Pointer-Driven 3D Ring with Inertia & Scrubbing

This pattern allows users to drag or scrub with mouse/touch to spin the 3D ring smoothly, featuring velocity calculation, pointer capture, and keyboard arrow control.

```
                     POINTER-DRIVEN SCRUBBING ARCHITECTURE
                     
          Pointer Drag: ΔX (pixels)
                 │
                 ▼
          Angular Delta: Δθ = ΔX * sensitivity
                 │
                 ▼
          CSS Variable Update: `--ring-angle: calc(previous + Δθ)`
                 │
                 ▼
          Compositor Transformation: `transform: rotateY(var(--ring-angle))`
```

#### Implementation:

```html
<div class="interactive-ring-container" id="dragRingContainer">
  <div class="drag-instruction">Drag horizontally to inspect • Use ← / → keys</div>
  <div class="interactive-stage">
    <div class="interactive-turntable" id="interactiveTurntable" style="--total: 10; --ring-angle: 0deg;">
      <div class="card-item" style="--i: 0;"><div class="item-inner">Alpha</div></div>
      <div class="card-item" style="--i: 1;"><div class="item-inner">Beta</div></div>
      <div class="card-item" style="--i: 2;"><div class="item-inner">Gamma</div></div>
      <div class="card-item" style="--i: 3;"><div class="item-inner">Delta</div></div>
      <div class="card-item" style="--i: 4;"><div class="item-inner">Epsilon</div></div>
      <div class="card-item" style="--i: 5;"><div class="item-inner">Zeta</div></div>
      <div class="card-item" style="--i: 6;"><div class="item-inner">Eta</div></div>
      <div class="card-item" style="--i: 7;"><div class="item-inner">Theta</div></div>
      <div class="card-item" style="--i: 8;"><div class="item-inner">Iota</div></div>
      <div class="card-item" style="--i: 9;"><div class="item-inner">Kappa</div></div>
    </div>
  </div>
</div>
```

```css
.interactive-ring-container {
  position: relative;
  inline-size: 100%;
  min-block-size: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #090a0f;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
}

.interactive-ring-container:active {
  cursor: grabbing;
}

.drag-instruction {
  font-size: 0.85rem;
  color: #64748b;
  margin-block-end: 1.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.interactive-stage {
  position: relative;
  inline-size: 100%;
  block-size: 320px;
  display: grid;
  place-items: center;
  perspective: 1000px;
}

.interactive-turntable {
  position: relative;
  inline-size: 160px;
  block-size: 220px;
  transform-style: preserve-3d;
  transform: rotateX(-10deg) rotateY(var(--ring-angle));
  will-change: transform;
}

.card-item {
  --w: 160px;
  --angle: calc(var(--i) * (360deg / var(--total)));
  /* Apothem formula */
  --radius: calc(var(--w) / (2 * tan(180deg / var(--total))));
  
  position: absolute;
  inset: 0;
  transform: rotateY(var(--angle)) translateZ(var(--radius));
  transform-style: preserve-3d;
}

.item-inner {
  inline-size: 100%;
  block-size: 100%;
  border-radius: 16px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 1px solid #334155;
  color: #f1f5f9;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.card-item:hover .item-inner {
  border-color: #38bdf8;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}
```

```javascript
// High-performance pointer scrubbing with velocity inertia
(function initPointerRing() {
  const container = document.getElementById('dragRingContainer');
  const turntable = document.getElementById('interactiveTurntable');
  if (!container || !turntable) return;

  let currentAngle = 0;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let animationFrameId = null;

  const SENSITIVITY = 0.25; // Degrees per pixel
  const FRICTION = 0.94;    // Inertial decay

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    lastTime = performance.now();
    startAngle = currentAngle;
    velocity = 0;
    cancelAnimationFrame(animationFrameId);
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const now = performance.now();
    const deltaX = e.clientX - startX;
    const dt = Math.max(now - lastTime, 1);
    
    velocity = ((e.clientX - lastX) / dt) * 3;
    lastX = e.clientX;
    lastTime = now;

    currentAngle = startAngle + deltaX * SENSITIVITY;
    turntable.style.setProperty('--ring-angle', `${currentAngle}deg`);
  }

  function applyInertia() {
    if (Math.abs(velocity) > 0.05) {
      currentAngle += velocity;
      velocity *= FRICTION;
      turntable.style.setProperty('--ring-angle', `${currentAngle}deg`);
      animationFrameId = requestAnimationFrame(applyInertia);
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    try { container.releasePointerCapture(e.pointerId); } catch (_) {}
    applyInertia();
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      currentAngle += 36;
      turntable.style.setProperty('--ring-angle', `${currentAngle}deg`);
    } else if (e.key === 'ArrowRight') {
      currentAngle -= 36;
      turntable.style.setProperty('--ring-angle', `${currentAngle}deg`);
    }
  });
})();
```

---

### Pattern 5: Inward-Facing Panoramic Portal / Cylindrical Dome

While standard carousels face outward toward the camera, an **Inward-Facing Cylindrical Portal** reverses the facet direction (`translateZ(-radius) rotateY(180deg)`), placing the camera at the *interior* center of a 360-degree cylindrical room.

```
                      INWARD-FACING CYLINDRICAL PORTAL
                      
                            ┌───────────────┐
                            │ Back Facet In │
                            └───────┬───────┘
                                    │
                                    │ Face Inward
                                    ▼
                      . - ~ ~ ~ ~ ~ ~ ~ ~ ~ - .
                    /                           \
         Face In ─►│      CAMERA OBSERVER        │◄─ Face In
                   │         (Center)            │
                    \                           /
                      ' - ~ ~ ~ ~ ~ ~ ~ ~ ~ - '
                                    ▲
                                    │ Face Inward
                            ┌───────┴───────┐
                            │Front Facet In │
                            └───────────────┘
```

#### Implementation:

```html
<div class="portal-viewport" aria-label="360 Panoramic Cylindrical Chamber">
  <div class="portal-cylinder" style="--total: 12; --panel-width: 180px;">
    <div class="portal-panel" style="--i: 0;"><span>Sector 01</span></div>
    <div class="portal-panel" style="--i: 1;"><span>Sector 02</span></div>
    <div class="portal-panel" style="--i: 2;"><span>Sector 03</span></div>
    <div class="portal-panel" style="--i: 3;"><span>Sector 04</span></div>
    <div class="portal-panel" style="--i: 4;"><span>Sector 05</span></div>
    <div class="portal-panel" style="--i: 5;"><span>Sector 06</span></div>
    <div class="portal-panel" style="--i: 6;"><span>Sector 07</span></div>
    <div class="portal-panel" style="--i: 7;"><span>Sector 08</span></div>
    <div class="portal-panel" style="--i: 8;"><span>Sector 09</span></div>
    <div class="portal-panel" style="--i: 9;"><span>Sector 10</span></div>
    <div class="portal-panel" style="--i: 10;"><span>Sector 11</span></div>
    <div class="portal-panel" style="--i: 11;"><span>Sector 12</span></div>
  </div>
  <div class="portal-center-crosshair"></div>
</div>
```

```css
.portal-viewport {
  position: relative;
  inline-size: 100%;
  min-block-size: 480px;
  display: grid;
  place-items: center;
  perspective: 500px; /* Wide immersive angle */
  perspective-origin: 50% 50%;
  background: #020617;
  overflow: hidden;
}

.portal-cylinder {
  position: relative;
  inline-size: var(--panel-width);
  block-size: 260px;
  transform-style: preserve-3d;
  animation: spinPortal 36s linear infinite;
}

.portal-panel {
  --angle: calc(var(--i) * (360deg / var(--total)));
  /* Inradius Apothem */
  --radius: calc(var(--panel-width) / (2 * tan(180deg / var(--total))));
  
  position: absolute;
  inset: 0;
  /* Key distinction: translate outward, then flip 180deg so content faces inward */
  transform: rotateY(var(--angle)) translateZ(var(--radius)) rotateY(180deg);
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.6));
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: grid;
  place-items: center;
  color: #38bdf8;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  box-shadow: inset 0 0 20px rgba(56, 189, 248, 0.15);
  backface-visibility: hidden;
}

.portal-center-crosshair {
  position: absolute;
  inline-size: 24px;
  block-size: 24px;
  border: 2px solid rgba(244, 63, 94, 0.6);
  border-radius: 50%;
  pointer-events: none;
}

@keyframes spinPortal {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(-360deg); }
}
```

---

### Pattern 6: Double-Helix / Multi-Tier Spiral Ring Stack

By combining an angular step $\Delta \theta$ with an incremental vertical offset ($\Delta Y = i \cdot \text{step}$), the 3D ring transforms into an ascending cylindrical spiral or DNA double-helix.

```
                         CYLINDRICAL DOUBLE-HELIX STACK
                         
                             ▲ Y-Axis
                             │
                      ┌──────┴──────┐  Node 5 (Y = 150px, θ = 180°)
                      │   NODE 5    │
                      └──────┬──────┘
                             │
                      ┌──────┴──────┐  Node 3 (Y = 90px, θ = 108°)
                      │   NODE 3    │
                      └──────┬──────┘
                             │
                      ┌──────┴──────┐  Node 1 (Y = 30px, θ = 36°)
                      │   NODE 1    │
                      └──────┬──────┘
                   ──────────┼──────────
```

#### Implementation:

```html
<div class="helix-stage" aria-label="3D DNA Helix Spiral">
  <div class="helix-cylinder" style="--total: 10; --helix-radius: 120px; --y-step: 28px;">
    <!-- Strand A -->
    <div class="helix-node strand-a" style="--i: 0;">A0</div>
    <div class="helix-node strand-a" style="--i: 1;">A1</div>
    <div class="helix-node strand-a" style="--i: 2;">A2</div>
    <div class="helix-node strand-a" style="--i: 3;">A3</div>
    <div class="helix-node strand-a" style="--i: 4;">A4</div>
    <div class="helix-node strand-a" style="--i: 5;">A5</div>
    <div class="helix-node strand-a" style="--i: 6;">A6</div>
    <div class="helix-node strand-a" style="--i: 7;">A7</div>
    <div class="helix-node strand-a" style="--i: 8;">A8</div>
    <div class="helix-node strand-a" style="--i: 9;">A9</div>

    <!-- Strand B (Offset by 180 degrees) -->
    <div class="helix-node strand-b" style="--i: 0;">B0</div>
    <div class="helix-node strand-b" style="--i: 1;">B1</div>
    <div class="helix-node strand-b" style="--i: 2;">B2</div>
    <div class="helix-node strand-b" style="--i: 3;">B3</div>
    <div class="helix-node strand-b" style="--i: 4;">B4</div>
    <div class="helix-node strand-b" style="--i: 5;">B5</div>
    <div class="helix-node strand-b" style="--i: 6;">B6</div>
    <div class="helix-node strand-b" style="--i: 7;">B7</div>
    <div class="helix-node strand-b" style="--i: 8;">B8</div>
    <div class="helix-node strand-b" style="--i: 9;">B9</div>
  </div>
</div>
```

```css
.helix-stage {
  inline-size: 100%;
  min-block-size: 460px;
  display: grid;
  place-items: center;
  perspective: 1000px;
  background: #0b0f19;
  overflow: hidden;
}

.helix-cylinder {
  position: relative;
  inline-size: 40px;
  block-size: 40px;
  transform-style: preserve-3d;
  transform: rotateX(-12deg) rotateY(0deg);
  animation: spinHelix 14s linear infinite;
}

.helix-node {
  --angle-step: calc(360deg / var(--total));
  --angle: calc(var(--i) * var(--angle-step));
  --y-pos: calc((var(--i) - (var(--total) / 2)) * var(--y-step));
  
  position: absolute;
  inset: 0;
  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
}

.strand-a {
  background: linear-gradient(135deg, #ec4899, #be185d);
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.6);
  transform: translateY(var(--y-pos)) rotateY(var(--angle)) translateZ(var(--helix-radius));
}

.strand-b {
  background: linear-gradient(135deg, #06b6d4, #0e7490);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.6);
  /* Offset by 180deg to form double helix */
  transform: translateY(var(--y-pos)) rotateY(calc(var(--angle) + 180deg)) translateZ(var(--helix-radius));
}

@keyframes spinHelix {
  from { transform: rotateX(-12deg) rotateY(0deg); }
  to   { transform: rotateX(-12deg) rotateY(360deg); }
}
```

---

## 4. Modern CSS Engine & Mathematical Automation

With modern CSS trigonometric functions (`tan()`, `sin()`, `cos()`) and CSS Houdini `@property`, the entire geometry and animation of a 3D ring can be automated in 100% pure CSS without JavaScript runtime calculations or preprocessor compilers.

### 4.1 Zero-JS Dynamic Apothem Generation

Prior to CSS Math Level 4, developers had to hardcode pixel `translateZ` values in JavaScript. Today, `tan()` evaluates the exact polygon inradius directly in the stylesheet:

```css
:root {
  --card-width: 180px;
  --card-gap: 16px;
  --facet-count: 8;
}

.ring-facet {
  --n: var(--facet-count);
  --w: var(--card-width);
  --g: var(--card-gap);
  
  /* 1. Calculate the central angle subtended by one facet */
  --theta: calc(360deg / var(--n));
  
  /* 2. Compute the exact polygon apothem inradius */
  --apothem: calc((var(--w) + var(--g)) / (2 * tan(180deg / var(--n))));
  
  /* 3. Position the facet */
  transform: rotateY(calc(var(--i) * var(--theta))) translateZ(var(--apothem));
}
```

### 4.2 Smooth Interpolation with Houdini `@property`

When animating CSS custom properties representing angles, standard CSS treats them as un-interpolatable strings. Registering `--ring-angle` via `@property` enables smooth mathematical angle transitions:

```css
@property --ring-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.smooth-turntable {
  transform: rotateY(var(--ring-angle));
  transition: --ring-angle 800ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. Comprehensive Production Component Gallery

### 5.1 Interactive 3D Product Exhibition Ring

```html
<div class="exhibition-wrapper" id="exhibitionRing">
  <div class="exhibition-header">
    <span class="exhibition-eyebrow">Spatial Showcase</span>
    <h2 class="exhibition-headline">Next-Gen Hardware Matrix</h2>
  </div>

  <div class="exhibition-stage">
    <div class="exhibition-turntable" id="exhibitionTurntable" style="--total: 6; --current: 0;">
      <!-- Card 0 -->
      <article class="exhibit-card" style="--i: 0;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">⚡</div>
          <span class="exhibit-tag">Compute</span>
          <h3 class="exhibit-name">Nexus V100</h3>
          <p class="exhibit-desc">Liquid-cooled tensor processor with photonic interconnect.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$2,499</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
      <!-- Card 1 -->
      <article class="exhibit-card" style="--i: 1;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">🛡️</div>
          <span class="exhibit-tag">Security</span>
          <h3 class="exhibit-name">Aegis Core</h3>
          <p class="exhibit-desc">Quantum-resistant cryptographic enclave hardware module.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$1,899</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
      <!-- Card 2 -->
      <article class="exhibit-card" style="--i: 2;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">🌐</div>
          <span class="exhibit-tag">Network</span>
          <h3 class="exhibit-name">Strata 800G</h3>
          <p class="exhibit-desc">Ultra-low latency silicon optical fabric router.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$4,199</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
      <!-- Card 3 -->
      <article class="exhibit-card" style="--i: 3;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">🔮</div>
          <span class="exhibit-tag">Quantum</span>
          <h3 class="exhibit-name">Q-Bit Flux</h3>
          <p class="exhibit-desc">Superconducting 64-qubit cryogenic co-processor.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$9,500</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
      <!-- Card 4 -->
      <article class="exhibit-card" style="--i: 4;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">💾</div>
          <span class="exhibit-tag">Storage</span>
          <h3 class="exhibit-name">NV-Vault X</h3>
          <p class="exhibit-desc">100M IOPS direct PCIe Gen6 non-volatile array.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$3,250</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
      <!-- Card 5 -->
      <article class="exhibit-card" style="--i: 5;" tabindex="0">
        <div class="exhibit-content">
          <div class="exhibit-icon">🔋</div>
          <span class="exhibit-tag">Power</span>
          <h3 class="exhibit-name">SolidState 4K</h3>
          <p class="exhibit-desc">Redundant zero-emission solid-state grid power unit.</p>
          <div class="exhibit-footer">
            <span class="exhibit-price">$1,450</span>
            <button class="exhibit-btn">Configure</button>
          </div>
        </div>
      </article>
    </div>
  </div>

  <div class="exhibition-nav">
    <button class="ex-nav-btn" id="exPrev" aria-label="Previous exhibit">‹</button>
    <div class="ex-dots" id="exDots"></div>
    <button class="ex-nav-btn" id="exNext" aria-label="Next exhibit">›</button>
  </div>
</div>
```

```css
.exhibition-wrapper {
  inline-size: 100%;
  min-block-size: 640px;
  background: radial-gradient(circle at 50% 20%, #17153b 0%, #0c0a1a 60%, #05040d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 1.5rem;
  overflow: hidden;
  color: #f8fafc;
}

.exhibition-header {
  text-align: center;
  z-index: 2;
}

.exhibition-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #a855f7;
}

.exhibition-headline {
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.exhibition-stage {
  position: relative;
  inline-size: 100%;
  block-size: 380px;
  display: grid;
  place-items: center;
  perspective: 1100px;
  perspective-origin: 50% 45%;
}

.exhibition-turntable {
  --w: 240px;
  --h: 330px;
  --gap: 20px;
  position: relative;
  inline-size: var(--w);
  block-size: var(--h);
  transform-style: preserve-3d;
  --turn-angle: calc(var(--current) * (-360deg / var(--total)));
  transform: rotateX(-8deg) rotateY(var(--turn-angle));
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.exhibit-card {
  --angle: calc(var(--i) * (360deg / var(--total)));
  --radius: calc((var(--w) + var(--gap)) / (2 * tan(180deg / var(--total))));
  
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateY(var(--angle)) translateZ(var(--radius));
  cursor: pointer;
  outline: none;
  transition: filter 400ms ease, opacity 400ms ease;
  -webkit-box-reflect: below 12px linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.25) 100%);
}

.exhibit-content {
  inline-size: 100%;
  block-size: 100%;
  padding: 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.exhibit-card:hover .exhibit-content {
  border-color: rgba(168, 85, 247, 0.5);
  transform: scale(1.02);
  box-shadow: 0 24px 50px rgba(168, 85, 247, 0.25);
}

.exhibit-card:focus-visible .exhibit-content {
  border-color: #a855f7;
  outline: 2px solid #a855f7;
  outline-offset: 4px;
}

.exhibit-icon {
  font-size: 2rem;
}

.exhibit-tag {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.exhibit-name {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.exhibit-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
}

.exhibit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-start: 1rem;
}

.exhibit-price {
  font-size: 1.1rem;
  font-weight: 800;
  color: #a855f7;
  font-family: ui-monospace, monospace;
}

.exhibit-btn {
  background: #a855f7;
  border: none;
  color: #ffffff;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 200ms ease;
}

.exhibit-btn:hover {
  background: #9333ea;
}

.exhibition-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 2;
}

.ex-nav-btn {
  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.5rem;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 200ms ease;
}

.ex-nav-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.6);
}

.ex-dots {
  display: flex;
  gap: 0.5rem;
}

.ex-dot {
  inline-size: 8px;
  block-size: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 300ms ease;
}

.ex-dot.active {
  inline-size: 24px;
  border-radius: 4px;
  background: #a855f7;
}
```

```javascript
(function initExhibitionRing() {
  const turntable = document.getElementById('exhibitionTurntable');
  const prevBtn = document.getElementById('exPrev');
  const nextBtn = document.getElementById('exNext');
  const dotsContainer = document.getElementById('exDots');
  if (!turntable || !prevBtn || !nextBtn || !dotsContainer) return;

  const total = parseInt(turntable.style.getPropertyValue('--total')) || 6;
  let currentIndex = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = `ex-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(idx) {
    currentIndex = (idx + total) % total;
    turntable.style.setProperty('--current', currentIndex);

    // Update dots
    const dots = dotsContainer.querySelectorAll('.ex-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

    // Update cards opacity/dimming
    const cards = turntable.querySelectorAll('.exhibit-card');
    cards.forEach((c, i) => {
      if (i === currentIndex) {
        c.style.opacity = '1';
        c.style.filter = 'none';
      } else {
        c.style.opacity = '0.65';
        c.style.filter = 'brightness(0.8)';
      }
    });
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  goTo(0);
})();
```

---

## 6. Complete Interactive Showcase Component

Here is a fully self-contained interactive 3D Ring playground with interactive real-time control panels for facet count, camera perspective, ring tilt, gap width, rotation speed, auto-play toggles, and live apothem metrics.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 3D Ring Masterclass Playground</title>
  <style>
    :root {
      --bg-color: #07090e;
      --card-w: 160px;
      --card-h: 220px;
      --total: 8;
      --gap: 16px;
      --perspective: 1000px;
      --tilt: -10deg;
      --ring-angle: 0deg;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-color);
      color: #f8fafc;
      min-block-size: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
      padding: 2rem 1rem;
    }

    .master-app {
      inline-size: 100%;
      max-inline-size: 1000px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .app-header {
      text-align: center;
    }

    .app-title {
      font-size: 2.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.03em;
    }

    .app-subtitle {
      color: #94a3b8;
      font-size: 1rem;
      margin-block-start: 0.5rem;
    }

    /* 3D Stage Viewport */
    .stage-container {
      position: relative;
      inline-size: 100%;
      block-size: 460px;
      background: radial-gradient(circle at center, #111827 0%, #030712 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      display: grid;
      place-items: center;
      perspective: var(--perspective);
      perspective-origin: 50% 45%;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }

    .turntable-axis {
      position: relative;
      inline-size: var(--card-w);
      block-size: var(--card-h);
      transform-style: preserve-3d;
      transform: rotateX(var(--tilt)) rotateY(var(--ring-angle));
      will-change: transform;
    }

    .turntable-axis.is-animating {
      animation: autoSpinRing 20s linear infinite;
    }

    .facet-node {
      --theta: calc(360deg / var(--total));
      --angle: calc(var(--i) * var(--theta));
      /* Exact Polygon Apothem with Gap */
      --radius: calc((var(--card-w) + var(--gap)) / (2 * tan(180deg / var(--total))));
      
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
      transform: rotateY(var(--angle)) translateZ(var(--radius));
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.08));
      border: 1px solid rgba(168, 85, 247, 0.4);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      user-select: none;
      cursor: pointer;
      transition: border-color 200ms ease, box-shadow 200ms ease;
      -webkit-box-reflect: below 10px linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.2) 100%);
    }

    .facet-node:hover {
      border-color: #38bdf8;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.4);
    }

    .facet-index {
      font-size: 2rem;
      font-weight: 800;
      color: #38bdf8;
      font-family: ui-monospace, monospace;
    }

    .facet-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #cbd5e1;
    }

    @keyframes autoSpinRing {
      from { transform: rotateX(var(--tilt)) rotateY(0deg); }
      to   { transform: rotateX(var(--tilt)) rotateY(360deg); }
    }

    /* Live Controls Grid */
    .controls-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .control-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .control-label span {
      color: #38bdf8;
      font-family: ui-monospace, monospace;
    }

    input[type="range"] {
      inline-size: 100%;
      accent-color: #818cf8;
      cursor: pointer;
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
      grid-column: 1 / -1;
    }

    .toggle-btn {
      flex: 1;
      padding: 0.75rem;
      border-radius: 10px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      font-weight: 700;
      cursor: pointer;
      transition: all 200ms ease;
    }

    .toggle-btn.active {
      background: #6366f1;
      border-color: #818cf8;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
    }

    /* Telemetry HUD */
    .hud-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      background: #0f172a;
      border-radius: 12px;
      border: 1px solid #1e293b;
      font-family: ui-monospace, monospace;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .hud-stat-item b {
      color: #38bdf8;
    }
  </style>
</head>
<body>

  <div class="master-app">
    <header class="app-header">
      <h1 class="app-title">CSS 3D Ring Geometry Engine</h1>
      <p class="app-subtitle">Real-Time Trigonometric Apothem & Compositor Transform Visualizer</p>
    </header>

    <div class="stage-container" id="stage">
      <div class="turntable-axis is-animating" id="turntable">
        <!-- Rendered dynamically by script -->
      </div>
    </div>

    <!-- Live Telemetry -->
    <div class="hud-stats">
      <div class="hud-stat-item">Facet Count ($N$): <b id="statCount">8</b></div>
      <div class="hud-stat-item">Step Angle ($\theta$): <b id="statAngle">45.00°</b></div>
      <div class="hud-stat-item">Calculated Apothem ($r$): <b id="statApothem">212.46px</b></div>
      <div class="hud-stat-item">Circumradius ($R$): <b id="statCircum">229.98px</b></div>
    </div>

    <!-- Controls -->
    <div class="controls-panel">
      <div class="control-group">
        <label class="control-label" for="ctrlCount">Facets ($N$): <span id="valCount">8</span></label>
        <input type="range" id="ctrlCount" min="3" max="16" value="8" step="1">
      </div>

      <div class="control-group">
        <label class="control-label" for="ctrlPerspective">Perspective (px): <span id="valPerspective">1000px</span></label>
        <input type="range" id="ctrlPerspective" min="400" max="2500" value="1000" step="50">
      </div>

      <div class="control-group">
        <label class="control-label" for="ctrlTilt">Camera Tilt (°): <span id="valTilt">-10°</span></label>
        <input type="range" id="ctrlTilt" min="-45" max="45" value="-10" step="1">
      </div>

      <div class="control-group">
        <label class="control-label" for="ctrlGap">Inter-Card Gap (px): <span id="valGap">16px</span></label>
        <input type="range" id="ctrlGap" min="0" max="60" value="16" step="2">
      </div>

      <div class="btn-row">
        <button class="toggle-btn active" id="btnAutoSpin">Auto-Rotate [ON]</button>
        <button class="toggle-btn" id="btnReset">Reset Parameters</button>
      </div>
    </div>
  </div>

  <script>
    (function initMasterRing() {
      const turntable = document.getElementById('turntable');
      const ctrlCount = document.getElementById('ctrlCount');
      const ctrlPerspective = document.getElementById('ctrlPerspective');
      const ctrlTilt = document.getElementById('ctrlTilt');
      const ctrlGap = document.getElementById('ctrlGap');
      const btnAutoSpin = document.getElementById('btnAutoSpin');
      const btnReset = document.getElementById('btnReset');

      const valCount = document.getElementById('valCount');
      const valPerspective = document.getElementById('valPerspective');
      const valTilt = document.getElementById('valTilt');
      const valGap = document.getElementById('valGap');

      const statCount = document.getElementById('statCount');
      const statAngle = document.getElementById('statAngle');
      const statApothem = document.getElementById('statApothem');
      const statCircum = document.getElementById('statCircum');

      const CARD_WIDTH = 160;

      function renderFacets() {
        const count = parseInt(ctrlCount.value);
        const gap = parseInt(ctrlGap.value);
        const perspective = ctrlPerspective.value;
        const tilt = ctrlTilt.value;

        // Update CSS Custom Properties
        document.documentElement.style.setProperty('--total', count);
        document.documentElement.style.setProperty('--gap', `${gap}px`);
        document.documentElement.style.setProperty('--perspective', `${perspective}px`);
        document.documentElement.style.setProperty('--tilt', `${tilt}deg`);

        // Update UI Labels
        valCount.textContent = count;
        valPerspective.textContent = `${perspective}px`;
        valTilt.textContent = `${tilt}°`;
        valGap.textContent = `${gap}px`;

        // Calculate exact mathematical telemetry
        const thetaDeg = 360 / count;
        const halfAngleRad = (180 / count) * (Math.PI / 180);
        const apothem = (CARD_WIDTH + gap) / (2 * Math.tan(halfAngleRad));
        const circum = (CARD_WIDTH + gap) / (2 * Math.sin(halfAngleRad));

        statCount.textContent = count;
        statAngle.textContent = `${thetaDeg.toFixed(2)}°`;
        statApothem.textContent = `${apothem.toFixed(2)}px`;
        statCircum.textContent = `${circum.toFixed(2)}px`;

        // Rebuild Facets DOM
        turntable.innerHTML = '';
        for (let i = 0; i < count; i++) {
          const facet = document.createElement('div');
          facet.className = 'facet-node';
          facet.style.setProperty('--i', i);
          facet.innerHTML = `
            <span class="facet-index">${String(i + 1).padStart(2, '0')}</span>
            <span class="facet-label">Facet</span>
          `;
          turntable.appendChild(facet);
        }
      }

      // Event Listeners
      ctrlCount.addEventListener('input', renderFacets);
      ctrlPerspective.addEventListener('input', renderFacets);
      ctrlTilt.addEventListener('input', renderFacets);
      ctrlGap.addEventListener('input', renderFacets);

      btnAutoSpin.addEventListener('click', () => {
        const isSpinning = turntable.classList.toggle('is-animating');
        btnAutoSpin.classList.toggle('active', isSpinning);
        btnAutoSpin.textContent = isSpinning ? 'Auto-Rotate [ON]' : 'Auto-Rotate [OFF]';
      });

      btnReset.addEventListener('click', () => {
        ctrlCount.value = 8;
        ctrlPerspective.value = 1000;
        ctrlTilt.value = -10;
        ctrlGap.value = 16;
        renderFacets();
      });

      // Initial Mount
      renderFacets();
    })();
  </script>
</body>
</html>
```

---

## 7. Performance Optimization, GPU Layering & Compositor Secrets

CSS 3D Transforms execute at peak efficiency when properly isolated from browser layout and paint triggers. Understanding how the browser pipeline processes 3D matrices is essential for maintaining 120 FPS frame stability on mobile and desktop hardware.

### 7.1 The Browser Rendering Pipeline (Layout vs. Paint vs. Composite)

```
================================================================================
                    THE 3D RENDERING PIPELINE FOR 3D RINGS
================================================================================

 [ 1. JAVASCRIPT / KEYFRAMES ]
   Updates `--ring-angle` or `rotateY(θ)`
        │
        ▼
 [ 2. STYLE RESOLUTION ]
   Evaluates `calc()`, `tan()`, matrix compositions
        │
        ▼ (NO LAYOUT: Geometry is purely transformed, 0ms Reflow)
 [ 3. LAYOUT / REFLOW ]  ──► [ SKIPPED ]
        │
        ▼ (NO PAINT: If backface-visibility & layers are cached)
 [ 4. PAINT ]            ──► [ SKIPPED ]
        │
        ▼
 [ 5. GPU COMPOSITOR ]   ──► Executes 4x4 matrix transforms on graphics hardware
                             Locked 60 / 120 FPS execution!
================================================================================
```

### 7.2 The "3D Flattening Trap": Avoiding `overflow: hidden` on Preserve-3D

One of the most frequent bugs encountered in CSS 3D programming is the sudden flattening of 3D depth into a flat 2D plane.

> [!CAUTION]
> Applying `overflow: hidden`, `overflow: scroll`, `clip-path`, `filter`, or `opacity < 1` directly onto a container with `transform-style: preserve-3d` **forces the browser to flatten the 3D rendering context into a single 2D texture map**. All child $Z$-axis depth is destroyed!

```css
/* BROKEN: Destroys 3D depth for all children */
.ring-turntable {
  transform-style: preserve-3d;
  overflow: hidden; /* <-- CRITICAL ERROR: Flattens 3D space! */
}

/* CORRECT: Apply overflow: hidden only to the outer 2D viewport container */
.ring-stage {
  perspective: 1000px;
  overflow: hidden; /* <-- Correct: Clips outer stage without flattening inner 3D context */
}

.ring-turntable {
  transform-style: preserve-3d; /* Retains full 3D spatial coordinates */
}
```

### 7.3 Eliminating Sub-Pixel Text Blur in 3D Space

When elements are projected in 3D space, Chromium and WebKit rasterize text at the resting 2D resolution and apply texture filtering, causing text to appear slightly blurry or shimmering during rotation.

#### The 3-Step Anti-Blur Solution:
1. **Render at 2x and Scale Down**: Render card internal typography at high resolution and scale with CSS transform or sub-pixel padding.
2. **Backface Culling**: Add `backface-visibility: hidden` to facets that do not need to render from the rear.
3. **Sub-Pixel Antialiasing**: Enable `-webkit-font-smoothing: antialiased` and `transform: translate3d(0,0,0)`.

```css
.ring-card {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: rotateY(var(--angle)) translateZ(var(--radius)) translate3d(0, 0, 0);
}
```

---

## 8. Accessibility, Keyboard Interaction & Reduced Motion Engineering

A 3D Ring must remain fully navigable and comprehensible for users utilizing screen readers, keyboard-only input, and assistive devices.

### 8.1 Keyboard Navigation & Focus Parity

When cards are rotated in 3D space, standard `Tab` order will jump sequentially through DOM elements. However, if a card is currently on the back side of the cylinder ($Z < 0$), focusing it should automatically spin the ring to bring that card to the front center:

```javascript
document.querySelectorAll('.cylinder-card').forEach((card, index) => {
  card.addEventListener('focus', () => {
    // Spin turntable to bring focused card to front (θ = 0)
    turntable.style.setProperty('--current-index', index);
  });
});
```

### 8.2 ARIA Carousel Roles

Structure the 3D ring with standard W3C carousel accessibility semantics:

```html
<section 
  class="ring-stage" 
  role="region" 
  aria-roledescription="3D Carousel" 
  aria-label="Product Showcase Ring">
  
  <div class="ring-turntable" role="group" aria-live="polite">
    <article 
      class="ring-card" 
      role="group" 
      aria-roledescription="slide" 
      aria-label="1 of 8: Nexus V100"
      tabindex="0">
      <!-- Content -->
    </article>
  </div>
</section>
```

### 8.3 Vestibular Safety (`prefers-reduced-motion`)

Continuous 3D spinning and wide-angle perspective shifts can cause dizziness and nausea for users with vestibular disorders. Always provide an accessible 2D horizontal scroll snap or grid fallback:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable 3D turntable motion */
  .ring-stage {
    perspective: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    display: flex;
    justify-content: flex-start;
    padding: 1.5rem;
  }

  .ring-turntable {
    transform: none !important;
    animation: none !important;
    display: flex;
    gap: 1.5rem;
    inline-size: max-content;
    block-size: auto;
  }

  .ring-card {
    position: relative;
    inset: auto;
    transform: none !important;
    scroll-snap-align: center;
    inline-size: 240px;
  }
}
```

---

## 9. Common Pitfalls, Edge Cases & Debugging Matrix

| Issue / Symptom | Root Cause | Architectural Solution |
| :--- | :--- | :--- |
| **Complete 3D Flattening** (All cards render flat on the 2D plane) | An ancestor element between `.stage` and `.card` has `overflow: hidden`, `filter`, or `opacity < 1`. | Remove grouping filters/overflows from the `preserve-3d` container. Move `overflow: hidden` to the top-level viewport stage. |
| **Card Collision / Overlapping Edges** | The `translateZ` distance was calculated using circumradius ($R$) instead of apothem inradius ($r$), or using `sin()` instead of `tan()`. | Use the exact polygon apothem formula: $r = \frac{w}{2 \cdot \tan(180^\circ / N)}$. |
| **Z-Fighting / Visual Flickering** | Two overlapping transparent surfaces share the exact same floating-point $Z$-depth coordinate during rotation. | Add a micro-offset ($\Delta Z = 0.5\text{px}$) to the foreground surface or enable `backface-visibility: hidden`. |
| **Click Hitbox Hijacking** | A rear or side card with a larger transformed bounding box intercepts pointer clicks intended for the front card. | Apply `pointer-events: none` to rear-facing cards or compute active slide opacity/stacking order dynamically. |
| **Blurry Typography During Spin** | GPU texture downsampling occurs when rasterizing transformed text layers. | Add `-webkit-font-smoothing: antialiased` and ensure `translate3d(0,0,0)` triggers hardware compositing. |
| **Touch Gesture Lockup** | Default browser vertical scroll cancels horizontal drag scrubbing gestures. | Apply `touch-action: pan-y` on the interactive drag container to allow vertical scrolling while capturing horizontal swipes. |

---

## 10. Master Production Checklist

### Geometry & Trigonometry
- [ ] Central angle calculated as $\theta = 360^\circ / N$.
- [ ] Exact apothem inradius calculated as $r = \frac{w + \text{gap}}{2 \cdot \tan(180^\circ / N)}$ using CSS `tan()`.
- [ ] Transformation order strictly ordered: `rotateY(θ)` followed by `translateZ(r)`.
- [ ] Facet items anchored with `position: absolute; inset: 0;` inside the center turntable.

### Performance & Compositing
- [ ] Perspective applied exclusively on the outer viewport stage (`perspective: 800px - 1200px`).
- [ ] Turntable pivot configured with `transform-style: preserve-3d`.
- [ ] No `overflow: hidden`, `clip-path`, or `filter` declared on the `preserve-3d` container.
- [ ] Animated angles declared with `@property` or executed via matrix/transform properties only (0ms layout reflow).
- [ ] `backface-visibility` explicitly set depending on whether facets are single-sided (`hidden`) or glassmorphic (`visible`).

### Accessibility & UX
- [ ] Complete keyboard navigation with `:focus-visible` ring.
- [ ] Focusing a card brings it to the active front center ($Z > 0$).
- [ ] Valid ARIA roles (`role="region"`, `aria-roledescription="3D Carousel"`).
- [ ] Touch gestures configured with `touch-action: pan-y`.
- [ ] Complete `@media (prefers-reduced-motion: reduce)` fallback to 2D horizontal scroll snap or grid.

---

*Authored for the Open-Calc CSS Architecture & Spatial UI Series.*
