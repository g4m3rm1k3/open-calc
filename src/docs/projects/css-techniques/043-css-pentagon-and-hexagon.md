---
concept: 043-css-pentagon-and-hexagon
name: CSS Pentagon & Hexagon Shapes and Layouts
category: CSS Shapes & Geometric Layouts
difficulty: Intermediate to Advanced
tags: [css, shapes, pentagon, hexagon, clip-path, polygon, honeycomb-grid, trigonometry, math-functions, responsive-design, filter-drop-shadow, pseudo-elements]
---

# 043: CSS Pentagon & Hexagon Shapes and Layouts Masterclass

## Overview & Mathematical Geometry

Creating non-rectangular geometry has historically been one of the most intriguing challenges in CSS. Standard CSS box models generate rectangular bounding boxes with orthogonal axes. However, modern CSS specifications—notably the **CSS Shapes Module**, **CSS Masking Module (Level 1)**, **CSS Mathematical Functions (`sin()`, `cos()`)**, and **CSS Grid**—allow developers to create pixel-perfect regular polygons such as **pentagons** (5-sided) and **hexagons** (6-sided) with native clipping, responsive scaling, image-fill support, and interlocking honeycomb layouts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REGULAR POLYGON GEOMETRY                           │
│                                                                             │
│             PENTAGON (5 Sided)                      HEXAGON (6 Sided)       │
│                                                                             │
│                  (50%, 0%)                         (50%, 0%)                │
│                     ▲                                 ▲                     │
│                    / \                               / \                    │
│      (0%, 38.2%)  /   \  (100%, 38.2%)   (0%, 25%)  /   \  (100%, 25%)     │
│                 ◄       ►                         ◄       ►                 │
│                  \     /                          │       │                 │
│                   \   /                           │       │                 │
│                    ▼─▼                   (0%, 75%) ◄       ► (100%, 75%)    │
│            (18%, 100%) (82%, 100%)                  \   /                   │
│                                                      \ /                    │
│                                                       ▼                     │
│                                                   (50%, 100%)               │
│       Interior Angle: 108°                         Interior Angle: 120°     │
│       Central Angle:  72°                          Central Angle:  60°      │
│       Golden Ratio:   φ ≈ 1.618                    Equilateral Triangles: 6 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Geometric Foundations & Trigonometric Derivations

To construct regular polygons in CSS, we map angular coordinates on a unit circle or bounding box using trigonometry:

$$x = x_c + r \cdot \sin(\theta), \quad y = y_c - r \cdot \cos(\theta)$$

where $(x_c, y_c) = (50\%, 50\%)$ is the center, and $r = 50\%$ is the bounding radius.

### Regular Pentagon Coordinate Calculation

A regular pentagon inscribed inside a square box centered at $(50\%, 50\%)$ with radius $R = 50\%$:

| Vertex | Angle ($\theta$) | Formula $(X, Y)$ | Calculated Coordinate | Scaled to Box Edge ($0\% - 100\%$) |
| :--- | :--- | :--- | :--- | :--- |
| **Top Vertex** | $0^\circ$ | $(50\% + 50\% \sin(0^\circ),\; 50\% - 50\% \cos(0^\circ))$ | `50.0% 0.0%` | `50.0% 0.0%` |
| **Top-Right** | $72^\circ$ | $(50\% + 50\% \sin(72^\circ),\; 50\% - 50\% \cos(72^\circ))$ | `97.6% 34.5%` | `100.0% 38.2%` |
| **Bottom-Right** | $144^\circ$ | $(50\% + 50\% \sin(144^\circ),\; 50\% - 50\% \cos(144^\circ))$ | `79.4% 90.5%` | `82.0% 100.0%` |
| **Bottom-Left** | $216^\circ$ | $(50\% + 50\% \sin(216^\circ),\; 50\% - 50\% \cos(216^\circ))$ | `20.6% 90.5%` | `18.0% 100.0%` |
| **Top-Left** | $288^\circ$ | $(50\% + 50\% \sin(288^\circ),\; 50\% - 50\% \cos(288^\circ))$ | `2.4% 34.5%` | `0.0% 38.2%` |

> [!NOTE]
> When bounding-box optimization is applied to maximize the pentagon area inside a rectangular element, the vertices scale to:
> `clip-path: polygon(50% 0%, 100% 38.2%, 82% 100%, 18% 100%, 0% 38.2%);`

---

### Regular Hexagon Orientations

Hexagons can be oriented in two primary directions: **Pointy-Topped** (vertical) and **Flat-Topped** (horizontal).

```
        POINTY-TOPPED (Vertical)                    FLAT-TOPPED (Horizontal)
               (50%, 0%)                              (25%, 0%)     (75%, 0%)
                  ▲                                      ┌───────────┐
                 / \                                    /             \
    (0%, 25%)   /   \   (100%, 25%)         (0%, 50%)  ◄               ► (100%, 50%)
               ◄     ►                                  \             /
               │     │                                   └───────────┘
    (0%, 75%)  ◄     ►  (100%, 75%)                   (25%, 100%)   (75%, 100%)
                \   /
                 \ /                               Width : Height Ratio:
                  ▼                                    2 : √3 ≈ 1.1547 : 1
             (50%, 100%)
         Width : Height Ratio:
          √3 : 2 ≈ 1 : 1.1547
```

- **Pointy-Topped Hexagon Polygon**:
  `polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`
- **Flat-Topped Hexagon Polygon**:
  `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`

---

## 2. Core Implementation Methods Comparison

There are three primary techniques for creating pentagons and hexagons in CSS:

```
                                  ┌───────────────────────────┐
                                  │   CSS Polygon Techniques  │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
     ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐
     │ Method 1: clip-path   │      │ Method 2: CSS sin/cos │      │ Method 3: Pseudo Elm  │
     │ polygon(...) (Modern) │      │ Dynamic Trigonometry  │      │ Border & Rotated Rect │
     └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
     - High performance             - Dynamic vertex counts        - Zero clip-path support
     - Clips child content/media    - Mathematical precision       - Complex DOM & overflow
     - True hit-testing bounds      - CSS Level 4 values           - Difficult content fit
```

| Feature / Attribute | Modern `clip-path: polygon()` | CSS Math `sin()` / `cos()` | Legacy Pseudo-Element Transforms |
| :--- | :--- | :--- | :--- |
| **Browser Support** | All Modern Browsers (98%+) | Chrome 111+, Safari 15.4+, FF 108+ | All Browsers (Legacy IE9+) |
| **Media / Child Content Clipping** | Yes (Images, Videos, Canvas) | Yes (Inside `polygon()`) | No (Requires tricky nested transforms) |
| **Hit-Testing / Pointer Events** | Clipped to exact polygon bounds | Clipped to exact polygon bounds | Rectangular bounding boxes overlap |
| **Borders & Outlines** | Requires `filter: drop-shadow` or pseudo | Requires `filter: drop-shadow` | Direct CSS `border` properties |
| **Maintenance & Code Size** | Minimal (1 line of CSS) | Flexible & Parametric | High (3 elements, multiple rotations) |

---

## 3. Method 1: The Modern `clip-path` Approach (Recommended)

### 3.1 CSS Pentagons

#### Pointy-Topped Regular Pentagon

```html
<div class="pentagon-card">
  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop" alt="Avatar" class="shape-media" />
  <div class="pentagon-content">
    <h3>Rank V</h3>
    <span>Master</span>
  </div>
</div>
```

```css
.pentagon-card {
  --shape-size: 240px;
  position: relative;
  width: var(--shape-size);
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  
  /* Pointy-topped pentagon clipping */
  clip-path: polygon(
    50% 0%,       /* Top vertex */
    100% 38.2%,   /* Upper-right vertex */
    82% 100%,     /* Lower-right vertex */
    18% 100%,     /* Lower-left vertex */
    0% 38.2%      /* Upper-left vertex */
  );
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pentagon-card:hover {
  transform: scale(1.05) translateY(-4px);
}

.shape-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  mix-blend-mode: overlay;
}
```

#### House-Style / Badge Pentagon (Flat-Bottomed Arrow)

```css
.pentagon-badge {
  width: 200px;
  height: 220px;
  background: linear-gradient(180deg, #0ea5e9, #2563eb);
  clip-path: polygon(
    50% 0%,     /* Peak */
    100% 35%,   /* Top Right */
    100% 100%,  /* Bottom Right */
    0% 100%,    /* Bottom Left */
    0% 35%      /* Top Left */
  );
}
```

---

### 3.2 CSS Hexagons

#### Pointy-Topped Hexagon (Vertical)

To ensure the pointy-topped hexagon is equilateral (all sides equal), the aspect ratio between width and height must follow:

$$\text{Height} = \frac{2}{\sqrt{3}} \times \text{Width} \approx 1.1547 \times \text{Width} \quad (\text{Ratio } \sqrt{3} : 2 \text{ or } 1 : 1.1547)$$

```css
.hexagon-pointy {
  --hex-width: 200px;
  width: var(--hex-width);
  /* Perfect equilateral geometry */
  aspect-ratio: 1 / 1.1547;
  background: linear-gradient(145deg, #10b981, #059669);
  
  /* Pointy-topped hexagon vertex map */
  clip-path: polygon(
    50% 0%,      /* Top corner */
    100% 25%,    /* Upper-right */
    100% 75%,    /* Lower-right */
    50% 100%,    /* Bottom corner */
    0% 75%,      /* Lower-left */
    0% 25%       /* Upper-left */
  );
  
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}
```

#### Flat-Topped Hexagon (Horizontal)

To ensure the flat-topped hexagon is equilateral, the aspect ratio between width and height must follow:

$$\text{Width} = \frac{2}{\sqrt{3}} \times \text{Height} \approx 1.1547 \times \text{Height} \quad (\text{Ratio } 2 : \sqrt{3} \text{ or } 1.1547 : 1)$$

```css
.hexagon-flat {
  --hex-height: 180px;
  height: var(--hex-height);
  /* Perfect equilateral geometry */
  aspect-ratio: 1.1547 / 1;
  background: linear-gradient(145deg, #f59e0b, #d97706);
  
  /* Flat-topped hexagon vertex map */
  clip-path: polygon(
    25% 0%,      /* Top-left */
    75% 0%,      /* Top-right */
    100% 50%,    /* Right corner */
    75% 100%,    /* Bottom-right */
    25% 100%,    /* Bottom-left */
    0% 50%       /* Left corner */
  );
  
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}
```

---

## 4. Solving the "No Border / No Box-Shadow" Limitation

Standard CSS `border` and `box-shadow` properties evaluate against the rectangular box model. When `clip-path` is used, standard `box-shadow` is completely clipped away, and standard `border` renders as a clipped rectangle.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE CLIP-PATH SHADOW PROBLEM                          │
│                                                                             │
│       Standard box-shadow:                     drop-shadow filter:          │
│       ┌──────────────┐                        (Filters polygon contour)     │
│  Cut  │  ▲        ▲  │ Cut                       /─────────\                │
│  out! │ / █──────█ \ │ out!                     /  ▄▄▄▄▄▄▄  \               │
│       │/  │ Shape│  \│                         /  █ Shape █  \              │
│       │\  █──────█  /│                        /  ▀▀▀▀▀▀▀▀▀▀▀  \             │
│  Cut  │ \ ▲        ▲/ │ Cut                  ( Smooth shadow  )             │
│  out! └──────────────┘ out!                   \ conforms here /             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technique A: Native Shadow with `filter: drop-shadow()`

`filter: drop-shadow()` applies a shadow around the **alpha-channel and clipped boundary** of the element rather than its bounding box.

```css
/* Apply drop-shadow to the wrapper element, NOT the clipped element */
.shape-wrapper {
  display: inline-block;
  /* Multi-layered glow and depth */
  filter: drop-shadow(0px 8px 16px rgba(99, 102, 241, 0.4))
          drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2));
  transition: filter 0.3s ease;
}

.shape-wrapper:hover {
  filter: drop-shadow(0px 12px 24px rgba(168, 85, 247, 0.6))
          drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.3));
}

.shape-wrapper .clipped-shape {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}
```

### Technique B: Glowing Multi-Layered Polygonal Borders

To render a high-precision, sharp border around any clipped polygon, use nested clipped layers or pseudo-elements with `inset`:

```html
<div class="hex-border-frame">
  <div class="hex-inner-content">
    <span class="cyber-text">SECURITY NODE</span>
  </div>
</div>
```

```css
.hex-border-frame {
  --hex-size: 200px;
  --border-width: 3px;
  --border-color: #00f2fe;
  
  width: var(--hex-size);
  aspect-ratio: 1 / 1.1547;
  background: var(--border-color);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  display: grid;
  place-items: center;
  filter: drop-shadow(0 0 12px rgba(0, 242, 254, 0.5));
  transition: transform 0.3s ease, filter 0.3s ease;
}

.hex-inner-content {
  /* Inner cutout that creates the border thickness */
  width: calc(100% - (var(--border-width) * 2));
  height: calc(100% - (var(--border-width) * 2));
  background: #0f172a;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
}

.hex-border-frame:hover {
  transform: translateY(-4px) scale(1.03);
  filter: drop-shadow(0 0 20px rgba(0, 242, 254, 0.85));
}
```

---

## 5. Method 2: Trigonometric CSS Mathematical Functions (`sin()`, `cos()`)

In modern CSS (CSS Values and Units Module Level 4), native `sin()`, `cos()`, `tan()`, and `asin()` can compute polygon coordinates dynamically from angles using CSS custom properties:

```css
@property --angle-offset {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0deg;
}

.dynamic-pentagon {
  --r: 50%;     /* Radius */
  --cx: 50%;    /* Center X */
  --cy: 50%;    /* Center Y */
  
  /* Angular steps: 360deg / 5 = 72deg */
  --p0-x: calc(var(--cx) + var(--r) * sin(0deg));
  --p0-y: calc(var(--cy) - var(--r) * cos(0deg));
  
  --p1-x: calc(var(--cx) + var(--r) * sin(72deg));
  --p1-y: calc(var(--cy) - var(--r) * cos(72deg));
  
  --p2-x: calc(var(--cx) + var(--r) * sin(144deg));
  --p2-y: calc(var(--cy) - var(--r) * cos(144deg));
  
  --p3-x: calc(var(--cx) + var(--r) * sin(216deg));
  --p3-y: calc(var(--cy) - var(--r) * cos(216deg));
  
  --p4-x: calc(var(--cx) + var(--r) * sin(288deg));
  --p4-y: calc(var(--cy) - var(--r) * cos(288deg));
  
  width: 220px;
  aspect-ratio: 1 / 1;
  background: linear-gradient(45deg, #ec4899, #8b5cf6);
  
  clip-path: polygon(
    var(--p0-x) var(--p0-y),
    var(--p1-x) var(--p1-y),
    var(--p2-x) var(--p2-y),
    var(--p3-x) var(--p3-y),
    var(--p4-x) var(--p4-y)
  );
}
```

---

## 6. Method 3: Legacy Transform & Border Hacks (Historical Reference)

Before CSS `clip-path` enjoyed universal support, developers relied on **3-overlapping rotated rectangles** for hexagons and **triangle + rectangle pseudo-elements** for pentagons.

### The 3-Rotated Rectangle Hexagon

```
                 ┌──────────┐
                /│          │\
               / │  Middle  │ \
              /  │  Rotate  │  \
             /   │   +60°   │   \
            /    │          │    \
           /     └──────────┘     \
          ┌────────────────────────┐
          │      Base Rectangle    │
          └────────────────────────┘
           \     ┌──────────┐     /
            \    │          │    /
             \   │  Middle  │   /
              \  │  Rotate  │  /
               \ │   -60°   │ /
                \│          │/
                 └──────────┘
```

```css
/* Container Box */
.legacy-hexagon {
  position: relative;
  width: 104px;
  height: 60px;
  background-color: #3b82f6;
  margin: 30px auto;
}

/* 60-degree rotated clone */
.legacy-hexagon::before,
.legacy-hexagon::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: inherit;
}

.legacy-hexagon::before {
  transform: rotate(60deg);
}

/* -60-degree rotated clone */
.legacy-hexagon::after {
  transform: rotate(-60deg);
}
```

> [!WARNING]
> Legacy pseudo-element techniques cause invisible rectangular hitboxes that overlap neighboring links/buttons, fail to clip inner content (like photos or text), and require rigid, non-fluid pixel dimensions. Always prefer modern `clip-path`.

---

## 7. Practical Real-World Patterns

---

### Pattern 1: Interlocking Responsive Hexagonal (Honeycomb) Grid

The interlocking honeycomb grid is one of the most sought-after geometric CSS architectures. It allows hexagons to nestle together without gaps.

```
Row 1:       / \     / \     / \
            | 1 |   | 2 |   | 3 |
           / \ / \ / \ / \ / \ / \
Row 2:    |   | 4 |   | 5 |   |   |
           \ / \ / \ / \ / \ / \ /
Row 3:      | 6 |   | 7 |   | 8 |
             \ /     \ /     \ /
```

#### The Mathematical Spacing Rules for Pointy-Topped Honeycombs

1. **Horizontal Step**: Adjacent hexagons in the same row share a center-to-center distance equal to:
   $$\text{Horizontal Distance} = \text{Width} + \text{Gap}$$
2. **Vertical Offset**: Successive rows are offset vertically by:
   $$\text{Vertical Shift} = 75\% \times \text{Height} + \left(\frac{\sqrt{3}}{2} \times \text{Gap}\right)$$
3. **Staggered Indentation**: Every alternating row is shifted horizontally by $50\%$ of the column width:
   $$\text{Odd/Even Row Offset} = 50\% \times (\text{Width} + \text{Gap})$$

#### Complete Honeycomb Component (HTML & CSS)

```html
<section class="honeycomb-gallery" aria-label="Hexagonal Portfolio Showcase">
  <div class="honeycomb-grid">
    
    <!-- Item 1 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop" alt="Abstract Art 1" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">CYBERNETICS</span>
          <h4 class="cell-title">Neural Mesh</h4>
        </div>
      </div>
    </article>

    <!-- Item 2 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop" alt="Abstract Art 2" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">ARCHITECTURE</span>
          <h4 class="cell-title">Spatial Core</h4>
        </div>
      </div>
    </article>

    <!-- Item 3 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&auto=format&fit=crop" alt="Abstract Art 3" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">QUANTUM</span>
          <h4 class="cell-title">Flux Engine</h4>
        </div>
      </div>
    </article>

    <!-- Item 4 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop" alt="Abstract Art 4" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">AUTOMATION</span>
          <h4 class="cell-title">Synth Vector</h4>
        </div>
      </div>
    </article>

    <!-- Item 5 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop" alt="Abstract Art 5" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">DATAGRID</span>
          <h4 class="cell-title">Apex Pulse</h4>
        </div>
      </div>
    </article>

    <!-- Item 6 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop" alt="Abstract Art 6" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">SECURITY</span>
          <h4 class="cell-title">Cipher Vault</h4>
        </div>
      </div>
    </article>

    <!-- Item 7 -->
    <article class="honeycomb-cell">
      <div class="honeycomb-shape">
        <img class="honeycomb-img" src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop" alt="Abstract Art 7" />
        <div class="honeycomb-overlay">
          <span class="badge-tag">CRYPTO</span>
          <h4 class="cell-title">Zero Proof</h4>
        </div>
      </div>
    </article>

  </div>
</section>
```

```css
:root {
  --hex-cell-width: clamp(140px, 18vw, 220px);
  --hex-cell-ratio: 1.1547; /* 2 / sqrt(3) */
  --hex-cell-height: calc(var(--hex-cell-width) * var(--hex-cell-ratio));
  --hex-gap: 14px;
}

.honeycomb-gallery {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding: 4rem 1.5rem;
  background-color: #0b0f19;
  display: flex;
  justify-content: center;
}

.honeycomb-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: calc((var(--hex-cell-width) + var(--hex-gap)) * 4);
  margin: 0 auto;
  padding-bottom: calc(var(--hex-cell-height) * 0.25);
}

.honeycomb-cell {
  position: relative;
  width: var(--hex-cell-width);
  height: var(--hex-cell-height);
  margin: calc(var(--hex-gap) / 2);
  margin-bottom: calc((var(--hex-cell-height) * -0.25) + (var(--hex-gap) / 2));
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.35s ease,
              z-index 0s 0.1s;
  z-index: 1;
}

.honeycomb-cell:hover {
  transform: scale(1.1) translateY(-8px);
  filter: drop-shadow(0 14px 28px rgba(0, 242, 254, 0.45));
  z-index: 20;
}

.honeycomb-shape {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #1e293b, #0f172a);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  overflow: hidden;
}

.honeycomb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease;
  filter: grayscale(40%) brightness(0.85);
}

.honeycomb-cell:hover .honeycomb-img {
  transform: scale(1.15);
  filter: grayscale(0%) brightness(1.05);
}

.honeycomb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.92) 15%, rgba(15, 23, 42, 0.2) 65%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2.2rem;
  padding-inline: 1rem;
  text-align: center;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.badge-tag {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.cell-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
}
```

---

### Pattern 2: Pentagon RPG Skill Tree Node & Stat Badges

Pentagonal geometries are the gold standard for skill trees, game stats, and radar attribute nodes.

```html
<div class="skill-tree-node">
  <div class="pentagon-glow-ring">
    <div class="pentagon-frame">
      <div class="pentagon-core">
        <svg class="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span class="node-level">LVL 99</span>
      </div>
    </div>
  </div>
  <h4 class="node-title">Grandmaster Mastery</h4>
</div>
```

```css
.skill-tree-node {
  --node-size: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pentagon-glow-ring {
  filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.6));
  transition: filter 0.3s ease;
}

.pentagon-glow-ring:hover {
  filter: drop-shadow(0 0 26px rgba(236, 72, 153, 0.95))
          drop-shadow(0 0 6px #ffffff);
}

.pentagon-frame {
  width: var(--node-size);
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #f43f5e, #8b5cf6, #ec4899);
  clip-path: polygon(50% 0%, 100% 38.2%, 82% 100%, 18% 100%, 0% 38.2%);
  display: grid;
  place-items: center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.skill-tree-node:hover .pentagon-frame {
  transform: scale(1.08) rotate(3deg);
}

.pentagon-core {
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  background: radial-gradient(circle at center, #1e1b4b 20%, #09090b 90%);
  clip-path: polygon(50% 0%, 100% 38.2%, 82% 100%, 18% 100%, 0% 38.2%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fb7185;
  gap: 0.35rem;
}

.node-icon {
  width: 32px;
  height: 32px;
  stroke: #fda4af;
  filter: drop-shadow(0 0 6px rgba(251, 113, 133, 0.8));
}

.node-level {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #fff;
}

.node-title {
  font-family: 'Outfit', sans-serif;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
```

---

### Pattern 3: Hexagonal Metric / KPI Dashboard Cards

```html
<div class="kpi-hex-card">
  <div class="kpi-backdrop">
    <div class="kpi-interior">
      <div class="kpi-spark"></div>
      <span class="kpi-label">UPTIME</span>
      <span class="kpi-value">99.98%</span>
      <span class="kpi-delta">+0.04%</span>
    </div>
  </div>
</div>
```

```css
.kpi-hex-card {
  --kpi-width: 170px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
}

.kpi-hex-card:hover {
  transform: translateY(-6px);
}

.kpi-backdrop {
  width: var(--kpi-width);
  aspect-ratio: 1 / 1.1547;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.8), rgba(99, 102, 241, 0.2));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: grid;
  place-items: center;
}

.kpi-interior {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  background: #0f172a;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0.5rem;
  text-align: center;
  position: relative;
}

.kpi-spark {
  position: absolute;
  top: 15%;
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
}

.kpi-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.kpi-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #f8fafc;
  margin-block: 0.2rem;
}

.kpi-delta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #4ade80;
}
```

---

## 8. Hit-Testing, Pointer Events & Accessibility

### 8.1 Hit-Testing Behavior
Unlike `border-radius` or opacity hacks, the CSS `clip-path` property **updates the element's actual pointer events collision area**. 

```
┌────────────────────────────────────────────────────────┐
│ Mouse Cursor Here ──► ░░░░░░░░░░░░░░░░                 │
│                       ░░░░░░▲░░░░░░░░░                 │
│                       ░░░░ / \ ░░░░░░░                 │
│                       ░░░ /   \ ░░░░░░                 │
│                       ░░ ◄     ► ░░░░░  (NO click /    │
│                       ░░░ \   / ░░░░░░   NO hover      │
│                       ░░░░░▼─▼░░░░░░░░   triggered in  │
│                       ░░░░░░░░░░░░░░░░   shaded area)  │
└────────────────────────────────────────────────────────┘
```
Clicks, hovers, and touch taps that occur in the clipped-away bounding box corners pass through to whichever DOM elements lie directly underneath.

### 8.2 Accessible Focus Rings
Because browser default `:focus-visible` outlines draw a standard rectangular box around the element, polygon-clipped interactive elements require custom focus-visible styling:

```css
/* Remove default square focus ring and replace with drop-shadow glow */
.honeycomb-cell:focus-visible {
  outline: none;
}

.honeycomb-cell:focus-visible .honeycomb-shape {
  filter: drop-shadow(0 0 0 3px #ffffff) drop-shadow(0 0 12px #38bdf8);
}
```

---

## 9. Complete Production Sandbox & Quick Reference

### Full Formula Matrix

| Shape & Orientation | Vertex Coordinate String (`clip-path: polygon(...)`) | Recommended Aspect Ratio |
| :--- | :--- | :--- |
| **Pointy Pentagon** | `50% 0%, 100% 38.2%, 82% 100%, 18% 100%, 0% 38.2%` | `1 / 1` |
| **Flat-Base Pentagon** | `50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%` | `1 / 1.1` |
| **Inverted Pentagon** | `18% 0%, 82% 0%, 100% 61.8%, 50% 100%, 0% 61.8%` | `1 / 1` |
| **Pointy Hexagon (Vertical)** | `50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%` | `1 / 1.1547` ($\sqrt{3} : 2$) |
| **Flat Hexagon (Horizontal)** | `25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%` | `1.1547 / 1` ($2 : \sqrt{3}$) |

---

## 10. Summary & Key Takeaways

1. **Clip-Path is King**: Modern `clip-path: polygon(...)` provides the highest performance, cleanest markup, native media clipping, and accurate pointer event hit-testing.
2. **Aspect Ratio Dictates Geometry**: Regular polygons require precise aspect ratios ($\sqrt{3}:2$ or $1:1.1547$ for equilateral pointy-topped hexagons) to avoid squished or stretched vertices.
3. **Use `filter: drop-shadow()`**: Bypass the rectangular limitation of `box-shadow` by applying `drop-shadow()` filters to wrapper elements or nested SVG frames.
4. **Interlocking Grids Depend on Percentage Offsets**: Pointy-topped honeycomb grids require a vertical offset of $-25\%$ of height plus half the gap to interlock seamlessly.
5. **Preserve Accessibility**: Always provide custom `:focus-visible` glowing drop shadows to replace default rectangular focus rings.
