---
concept: 057-cut-corners
name: CSS Cut Corners (Chamfers, Bevels & Inverted Notches)
category: CSS Shapes, Geometry & Visual FX
difficulty: Intermediate to Advanced
tags: [css, cut-corners, chamfer, bevel, clip-path, linear-gradient, radial-gradient, mask-image, corner-shape, cyberpunk-ui, gaming-ui, tickets, modern-css]
---

# 057: CSS Cut Corners (Chamfers, Bevels & Inverted Notches) Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Cut Corners (Chamfered Edges, Angled Bevels, Scooped Notches) |
| **Category** | Visual Styling, Shapes, Geometry & Component Architecture |
| **Specification** | [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) &bull; [W3C CSS Backgrounds and Borders Module Level 4 (`corner-shape`)](https://www.w3.org/TR/css-borders-4/#corner-shaping) |
| **Difficulty** | Intermediate to Advanced (3.5 / 5) |
| **What it produces** | Angular cut-off corners (chamfers/bevels), diagonal dog-ears, octagonal containers, sci-fi/cyberpunk HUD panels, ticket vouchers with circular scooped notches, and origami folded-corner cards—without extra markup or image assets. |
| **Why it works** | Achieved through coordinate-based vector clipping (`clip-path: polygon()`), multi-stop gradient slicing (`background: linear-gradient()`), alpha mask compositing (`mask-image`), and future declarative CSS corner shaping (`corner-shape: bevel`). |
| **Required CSS Concepts** | `clip-path: polygon()`, CSS Custom Properties (`var()`, `calc()`), CSS Gradients (`linear-gradient`, `radial-gradient`), `mask-image`, CSS Stacking Contexts & Pseudo-elements (`::before`, `::after`), `filter: drop-shadow()`. |

```
================================================================================
                    THE MENTAL MODEL OF CSS CUT CORNERS
================================================================================

    1. FLAT RECTANGLE               2. ANGLED CHAMFER (BEVEL)       3. SCOOPED NOTCH (RADIAL)
  ┌──────────────────┐             ┌─╲──────────────╲─┐            ┌─╭──────────────╮─┐
  │                  │             │  ╲   Cut Top    ╲ │           │ ╰─╮          ╭─╯ │
  │                  │      ───►   │   ──────────────  │   ───►    │   ────────────   │
  │                  │             │  ╱   Cut Bottom ╱ │           │ ╭─╯          ╰─╮ │
  └──────────────────┘             └─╱──────────────╱─┘            └─╰──────────────╯─┘
  [Standard 90° Box]               [clip-path / linear-grad]       [radial-gradient mask]
```

---

## 1. The Anatomy of a Cut Corner

In traditional physical design, machining, and industrial architecture:
- A **Chamfer** (or **Bevel**) is an interior or exterior transitional edge between two faces of an object, cut at an angle (typically $45^\circ$).
- A **Dog-Ear** is a single corner folded down or cropped off (common in file icons, notes, and tags).
- A **Concave / Scooped Notch** is an inverted circular cutout (hallmark of admission tickets, coupons, and mechanical linkages).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CORNER CUT ARCHETYPES IN UI                           │
├───────────────────────┬───────────────────────┬─────────────────────────────┤
│ 1. Single Top-Right   │ 2. Dual Diagonal      │ 3. Symmetrical Octagon      │
│   (Dog-Ear / Tech)    │   (Cyberpunk / Mecha) │   (Sci-Fi HUD / Armor Plate)│
│   ┌───────────────╲   │   ┌───────────────╲   │   ╱───────────────────────╲ │
│   │                │  │   │                │  │  │                         ││
│   │                │  │   │                │  │  │                         ││
│   └────────────────┘  │   ╲────────────────┘  │   ╲───────────────────────╱ │
├───────────────────────┼───────────────────────┼─────────────────────────────┤
│ 4. Single Bottom-Right│ 5. Scooped / Concave  │ 6. Stepped / Notch Cutout   │
│   (Action Button)     │   (Event Ticket / VIP)│   (Circuit / Hardware UI)   │
│   ┌────────────────┐  │   ╭─╮             ╭─╮ │   ┌───┐                 ┌───┐
│   │                │  │   │ ╰─┐         ┌─╯ │ │   │   └─────────────────┘   │
│   │                │  │   │ ╭─┘         └─╮ │ │   │   ┌─────────────────┐   │
│   └───────────────╱   │   ╰─╯             ╰─╯ │   └───┘                 └───┘
└───────────────────────┴───────────────────────┴─────────────────────────────┘
```

---

## 2. Comparison of Implementation Techniques

Before diving into code, here is an engineering matrix of the core strategies available in CSS:

| Technique | Browser Support | Border Styling | Shadows | Dynamic Child Media (Video/Img) | Hit-Test / Pointer Events |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`clip-path: polygon()`** | 98%+ (Universal) | ⚠️ Requires pseudo/wrapper | `filter: drop-shadow` only | ✔️ Fully clipped | ✔️ Perfectly follows shape |
| **Multi `linear-gradient`** | 99%+ (Legacy Safe) | ⚠️ Complex layered gradients | `box-shadow` stays square | ❌ Background only | ❌ Rectangular hitbox |
| **CSS `mask-image`** | 96%+ (Prefix WebKit) | ⚠️ Masked border tricks | `filter: drop-shadow` only | ✔️ Fully masked | ❌ Rectangular hitbox |
| **SVG 9-Slice (`border-image`)**| 98%+ | ✔️ Native vector strokes | `filter: drop-shadow` only | ❌ Frame only | ❌ Rectangular hitbox |
| **`corner-shape: bevel`** | Emerging (W3C Spec) | ✔️ Native `border` property | ✔️ Native `box-shadow` | ✔️ Native overflow clip | ✔️ Native shape hitbox |

---

## 3. Technique 1: Vector Geometry with `clip-path: polygon()`

The modern gold standard for cut corners is `clip-path: polygon()`. It requires **zero extra DOM elements**, handles variable sizes effortlessly via CSS custom properties, and shapes both visual pixels and mouse/touch hit-testing.

```
                  (0, 0)                      (100% - cut, 0)
                     ┌───────────────────────────────┐
                     │                                ╲ (100%, cut)
                     │                                 │
                     │                                 │
                     │                                 │
                     │                                 │
                     └─────────────────────────────────┘
                   (0, 100%)                       (100%, 100%)
```

### 3.1 Single Top-Right Cut (The Classic Tech / Dog-Ear)

```css
.cut-top-right {
  --cut: 20px;
  background: #3b82f6;
  clip-path: polygon(
    0 0,                          /* Top-Left */
    calc(100% - var(--cut)) 0,    /* Top edge before cut */
    100% var(--cut),              /* Right edge after cut */
    100% 100%,                    /* Bottom-Right */
    0 100%                        /* Bottom-Left */
  );
}
```

### 3.2 Dual Diagonal Cuts (The Cyberpunk / Sci-Fi Angle)
Opposing diagonal chamfers (Top-Left and Bottom-Right) create an aggressive, high-tech aesthetic:

```css
.cut-diagonal {
  --cut: 18px;
  background: #0f172a;
  color: #38bdf8;
  clip-path: polygon(
    var(--cut) 0,                 /* Start of top edge */
    100% 0,                       /* Top-Right (square) */
    100% calc(100% - var(--cut)),/* Right edge before cut */
    calc(100% - var(--cut)) 100%,/* Bottom edge after cut */
    0 100%,                       /* Bottom-Left (square) */
    0 var(--cut)                  /* Left edge before cut */
  );
}
```

### 3.3 All 4 Symmetrical Cut Corners (Octagonal Chamfer)

```
        (cut, 0)                       (100% - cut, 0)
            ┌─────────────────────────────┐
 (0, cut)  ╱                               ╲  (100%, cut)
          │                                 │
          │                                 │
          │                                 │
(0, 100%-cut) ╲                            ╱  (100%, 100%-cut)
            └─────────────────────────────┘
      (cut, 100%)                      (100% - cut, 100%)
```

```css
.cut-all-4 {
  --cut: 16px;
  background: #1e293b;
  clip-path: polygon(
    /* Top Edge */
    var(--cut) 0%,
    calc(100% - var(--cut)) 0%,
    /* Right Edge */
    100% var(--cut),
    100% calc(100% - var(--cut)),
    /* Bottom Edge */
    calc(100% - var(--cut)) 100%,
    var(--cut) 100%,
    /* Left Edge */
    0% calc(100% - var(--cut)),
    0% var(--cut)
  );
}
```

### 3.4 Asymmetrical Custom Property Formula
By decomposing each corner into its own CSS custom property, you can control any individual corner cut independently:

```css
.cut-custom {
  --tl: 24px; /* Top-Left */
  --tr: 0px;  /* Top-Right (square) */
  --br: 24px; /* Bottom-Right */
  --bl: 8px;  /* Bottom-Left */

  clip-path: polygon(
    /* Top-Left */
    var(--tl) 0%,
    /* Top-Right */
    calc(100% - var(--tr)) 0%,
    100% var(--tr),
    /* Bottom-Right */
    100% calc(100% - var(--br)),
    calc(100% - var(--br)) 100%,
    /* Bottom-Left */
    var(--bl) 100%,
    0% calc(100% - var(--bl)),
    /* Back to Top-Left */
    0% var(--tl)
  );
}
```

---

## 4. Technique 2: Multi-Gradient Slicing (The CSS Secrets Pattern)

Before `clip-path` gained universal support, Lea Verou pioneered the **Multi-Gradient Slicing** technique. It uses four independent $45^\circ$ angled linear gradients, each occupying one quadrant ($50\% \times 50\%$) of the background.

```
┌───────────────────────────────┬───────────────────────────────┐
│ Top-Left Quadrant (135deg)    │ Top-Right Quadrant (225deg)   │
│                               │                               │
│  transparent 15px, #4f46e5 0  │  transparent 15px, #4f46e5 0  │
│  at 0 0                       │  at 100% 0                    │
├───────────────────────────────┼───────────────────────────────┤
│ Bottom-Left Quadrant (45deg)  │ Bottom-Right Quadrant (315deg)│
│                               │                               │
│  transparent 15px, #4f46e5 0  │  transparent 15px, #4f46e5 0  │
│  at 0 100%                    │  at 100% 100%                 │
└───────────────────────────────┴───────────────────────────────┘
```

### 4.1 The 4-Corner Angled Linear Gradient Code

```css
.gradient-cut-corners {
  --cut: 16px;
  --bg-color: #6366f1;

  background:
    /* Top-Left */
    linear-gradient(135deg, transparent var(--cut), var(--bg-color) 0) top left,
    /* Top-Right */
    linear-gradient(225deg, transparent var(--cut), var(--bg-color) 0) top right,
    /* Bottom-Right */
    linear-gradient(315deg, transparent var(--cut), var(--bg-color) 0) bottom right,
    /* Bottom-Left */
    linear-gradient(45deg,  transparent var(--cut), var(--bg-color) 0) bottom left;

  /* Crucial: Set background-size to slightly over 50% to prevent subpixel hairline gaps */
  background-size: 51% 51%;
  background-repeat: no-repeat;
}
```

> [!IMPORTANT]
> **Subpixel Antialiasing Seam Fix**: Setting `background-size: 50% 50%` causes faint 1px hairline rendering seams on Retina/HiDPI screens where the four gradient quadrants meet. Using `background-size: 51% 51%` or `calc(50% + 1px) calc(50% + 1px)` ensures an imperceptible overlap that completely eliminates the glitch.

---

### 4.2 Inverted Rounded / Scooped Corners (Radial Gradient Slicing)

By replacing `linear-gradient` with `radial-gradient`, you get **scooped (concave) corners**—the quintessential design pattern for tickets, coupons, and mechanical notches:

```css
.scooped-ticket {
  --notch: 20px;
  --bg-color: #0f172a;

  background:
    /* Top-Left Notch */
    radial-gradient(circle at top left, transparent var(--notch), var(--bg-color) calc(var(--notch) + 0.5px)) top left,
    /* Top-Right Notch */
    radial-gradient(circle at top right, transparent var(--notch), var(--bg-color) calc(var(--notch) + 0.5px)) top right,
    /* Bottom-Right Notch */
    radial-gradient(circle at bottom right, transparent var(--notch), var(--bg-color) calc(var(--notch) + 0.5px)) bottom right,
    /* Bottom-Left Notch */
    radial-gradient(circle at bottom left, transparent var(--notch), var(--bg-color) calc(var(--notch) + 0.5px)) bottom left;

  background-size: 51% 51%;
  background-repeat: no-repeat;
}
```

---

## 5. Technique 3: CSS Masking (`mask-image`)

While background gradients only clip the background color, **CSS Masking** clips the entire DOM element, including its foreground text, background images, embedded videos, borders, and children.

```css
.masked-cut-card {
  --cut: 20px;

  /* WebKit Prefix for Chrome, Safari, Edge */
  -webkit-mask:
    linear-gradient(135deg, transparent var(--cut), #000 0) top left,
    linear-gradient(225deg, transparent var(--cut), #000 0) top right,
    linear-gradient(315deg, transparent var(--cut), #000 0) bottom right,
    linear-gradient(45deg,  transparent var(--cut), #000 0) bottom left;
  -webkit-mask-size: 51% 51%;
  -webkit-mask-repeat: no-repeat;

  /* Standard W3C Specification */
  mask:
    linear-gradient(135deg, transparent var(--cut), #000 0) top left,
    linear-gradient(225deg, transparent var(--cut), #000 0) top right,
    linear-gradient(315deg, transparent var(--cut), #000 0) bottom right,
    linear-gradient(45deg,  transparent var(--cut), #000 0) bottom left;
  mask-size: 51% 51%;
  mask-repeat: no-repeat;
}
```

---

## 6. The Hard Problems & Architectural Solutions

When developers attempt to build real-world components with cut corners, they immediately run into three major CSS roadblocks:
1. **The Border Problem**: Traditional `border: 2px solid cyan` renders outside the clipped area or gets sliced straight off.
2. **The Box-Shadow Problem**: Traditional `box-shadow: 0 10px 20px black` casts a rectangular shadow, completely ignoring the cut corners.
3. **The Focus Ring Problem**: Default `:focus-visible` outlines render as a square box around the clipped polygon.

Let's solve each one thoroughly.

---

### 6.1 Solution 1: Borders on Cut Corners (The 3 Best Methods)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SOLVING THE CUT-CORNER BORDER                         │
│                                                                             │
│   METHOD A: Pseudo-Element Underlay       METHOD B: Mask Composite Exclude  │
│   ┌───────────────────────────────┐       ┌───────────────────────────────┐ │
│   │ Outer: clip-path + border-bg  │       │ Outer: padding + gradient bg  │ │
│   │  ┌─────────────────────────┐  │       │  ┌─────────────────────────┐  │ │
│   │  │ Inner: Inset clip-path  │  │       │  │ Mask hollows out center │  │ │
│   │  │        dark background  │  │       │  │ leaving a crisp stroke  │  │ │
│   │  └─────────────────────────┘  │       │  └─────────────────────────┘  │ │
│   └───────────────────────────────┘       └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Method A: The Double-Clipped Pseudo-Element (Recommended)
This approach places a background gradient on the main container, and clips a `::before` pseudo-element inset by `2px` with matching background color:

```css
.cut-border-box {
  --cut: 20px;
  --border-width: 2px;
  --border-color: #06b6d4;
  --bg-color: #0f172a;

  position: relative;
  background: var(--border-color);
  clip-path: polygon(
    var(--cut) 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut)),
    0 var(--cut)
  );
  padding: var(--border-width);
}

.cut-border-box::before {
  content: '';
  position: absolute;
  inset: var(--border-width);
  background: var(--bg-color);
  clip-path: polygon(
    calc(var(--cut) - var(--border-width) * 0.414) 0,
    calc(100% - (var(--cut) - var(--border-width) * 0.414)) 0,
    100% calc(var(--cut) - var(--border-width) * 0.414),
    100% calc(100% - (var(--cut) - var(--border-width) * 0.414)),
    calc(100% - (var(--cut) - var(--border-width) * 0.414)) 100%,
    calc(var(--cut) - var(--border-width) * 0.414) 100%,
    0 calc(100% - (var(--cut) - var(--border-width) * 0.414)),
    0 calc(var(--cut) - var(--border-width) * 0.414)
  );
  z-index: -1;
}
```

> [!TIP]
> **The $45^\circ$ Geometry Inset Formula**: When insetting a $45^\circ$ chamfered border by thickness $t$, the inner chamfer cut distance decreases by $t \times (\sqrt{2} - 1) \approx 0.414 \times t$. For a standard $2\text{px}$ stroke, the difference is less than $1\text{px}$, allowing standard matching cuts in most UI designs.

---

### 6.2 Solution 2: Drop Shadows with `filter: drop-shadow()`

Because `clip-path` cuts away pixels post-rasterization, standard `box-shadow` is clipped and fails. Instead, use `filter: drop-shadow()`, which analyzes the **actual visible alpha contour** of the element and projects a shadow conforming precisely to the angled chamfers:

```css
/* WRONG: Box shadow will be rectangular or completely cut off */
.bad-shadow {
  clip-path: polygon(...);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); /* ❌ Fails */
}

/* RIGHT: Drop shadow conforms perfectly to the cut-corner geometry */
.good-shadow {
  clip-path: polygon(...);
  filter:
    drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))
    drop-shadow(0 10px 20px rgba(6, 182, 212, 0.25)); /* ✔️ Perfect neon chamfer glow */
}
```

---

### 6.3 Solution 3: Accessible Focus Indicators (`:focus-visible`)

Standard browser outlines (`outline: 2px solid cyan`) draw a square box around clipped elements. To provide WCAG-compliant, aesthetically matching focus rings:

```css
.cut-button:focus-visible {
  outline: none; /* Remove default square outline */
  filter:
    drop-shadow(0 0 0 2px #38bdf8)
    drop-shadow(0 0 8px rgba(56, 189, 248, 0.8));
}
```

---

## 7. The Future: W3C `corner-shape: bevel` (CSS Borders 4)

The CSS Working Group is standardizing the `corner-shape` property in [CSS Backgrounds and Borders Module Level 4](https://www.w3.org/TR/css-borders-4/#corner-shaping). This will make cut corners as simple and native as `border-radius`:

```css
/* Future W3C Standard Syntax */
.future-chamfer {
  border-radius: 20px;
  corner-shape: bevel; /* Options: round | bevel | scoop | notch | squircle */
  border: 2px solid #38bdf8;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}
```

### Progressive Enhancement Strategy with `@supports`:
```css
.card {
  /* Fallback: Modern clip-path */
  --cut: 16px;
  clip-path: polygon(
    var(--cut) 0, calc(100% - var(--cut)) 0,
    100% var(--cut), 100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%, var(--cut) 100%,
    0 calc(100% - var(--cut)), 0 var(--cut)
  );
}

@supports (corner-shape: bevel) {
  .card {
    clip-path: none;
    border-radius: 16px;
    corner-shape: bevel;
  }
}
```

---

## 8. Real-World Component Showcase (Complete HTML & CSS)

Below are five production-ready, fully styled UI components demonstrating diverse cut-corner techniques.

---

### Component 1: Cyberpunk 2077 HUD Action Button

A futuristic button featuring opposing chamfers, animated laser shine sweep, pulsing neon border, and tactile active press.

```html
<button class="cyber-btn" type="button">
  <span class="cyber-btn__glitch"></span>
  <span class="cyber-btn__content">INITIALIZE SYSTEM</span>
  <span class="cyber-btn__tag">R-23</span>
</button>
```

```css
:root {
  --cyber-yellow: #fcee0a;
  --cyber-red: #ff003c;
  --cyber-blue: #00f0ff;
  --cyber-dark: #0d0d0d;
}

.cyber-btn {
  --cut: 16px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--cyber-dark);
  background: var(--cyber-yellow);
  border: none;
  cursor: pointer;
  outline: none;
  clip-path: polygon(
    0 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut))
  );
  filter: drop-shadow(4px 4px 0px var(--cyber-red));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cyber-btn:hover {
  background: var(--cyber-blue);
  color: #fff;
  filter: drop-shadow(6px 6px 0px var(--cyber-red)) drop-shadow(0 0 12px var(--cyber-blue));
  transform: translate(-2px, -2px);
}

.cyber-btn:active {
  transform: translate(2px, 2px);
  filter: drop-shadow(0px 0px 0px var(--cyber-red));
}

.cyber-btn__tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--cyber-dark);
  color: var(--cyber-yellow);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}

.cyber-btn:hover .cyber-btn__tag {
  background: #fff;
  color: var(--cyber-dark);
}

.cyber-btn:focus-visible {
  outline: 2px solid var(--cyber-blue);
  outline-offset: 4px;
}
```

---

### Component 2: Sci-Fi Gamer / Esports Inventory Card

An esports player stats panel with asymmetrical cut corners, layered neon border gradient, and dark carbon-fiber styling.

```html
<div class="esports-card">
  <div class="esports-card__inner">
    <div class="esports-card__badge">LEGENDARY</div>
    <h3 class="esports-card__title">PHANTOM STRIKER</h3>
    <p class="esports-card__class">Assault Operative // Tier 4</p>
    <div class="esports-card__stats">
      <div class="stat-item">
        <span class="stat-label">PWR</span>
        <span class="stat-val">98</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">SPD</span>
        <span class="stat-val">85</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">DEF</span>
        <span class="stat-val">92</span>
      </div>
    </div>
  </div>
</div>
```

```css
.esports-card {
  --cut: 24px;
  --border-size: 2px;
  position: relative;
  width: 320px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #6366f1 100%);
  clip-path: polygon(
    var(--cut) 0%,
    100% 0%,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0% 100%,
    0% var(--cut)
  );
  padding: var(--border-size);
  filter: drop-shadow(0 15px 30px rgba(0, 242, 254, 0.25));
  transition: transform 0.3s ease, filter 0.3s ease;
}

.esports-card:hover {
  transform: translateY(-6px);
  filter: drop-shadow(0 20px 40px rgba(0, 242, 254, 0.45));
}

.esports-card__inner {
  background: #090d16;
  padding: 28px 24px;
  clip-path: polygon(
    calc(var(--cut) - 1px) 0%,
    100% 0%,
    100% calc(100% - (var(--cut) - 1px)),
    calc(100% - (var(--cut) - 1px)) 100%,
    0% 100%,
    0% calc(var(--cut) - 1px)
  );
}

.esports-card__badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.1);
  border-left: 3px solid #00f2fe;
  padding: 4px 10px;
  margin-bottom: 12px;
}

.esports-card__title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1px;
  margin: 0 0 4px 0;
}

.esports-card__class {
  color: #94a3b8;
  font-size: 12px;
  margin: 0 0 24px 0;
  text-transform: uppercase;
}

.esports-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
}

.stat-val {
  font-size: 22px;
  color: #38bdf8;
  font-weight: 900;
  font-family: monospace;
}
```

---

### Component 3: VIP Cinema Ticket with Scooped Notches & Perforation

A perforated ticket voucher featuring circular scooped side cutouts using radial gradient masking, a dashed tear line, and realistic drop shadow.

```html
<div class="ticket-wrapper">
  <div class="ticket">
    <div class="ticket__stub ticket__section">
      <span class="ticket__code">ADMIT ONE</span>
      <h4 class="ticket__stub-title">INTERSTELLAR</h4>
      <span class="ticket__seat">ROW C &bull; SEAT 14</span>
    </div>
    <div class="ticket__divider"></div>
    <div class="ticket__body ticket__section">
      <div class="ticket__event">IMAX 70MM PRESENTATION</div>
      <div class="ticket__details">
        <div><strong>DATE:</strong> 15 OCT 2026</div>
        <div><strong>TIME:</strong> 20:00 EST</div>
        <div><strong>HALL:</strong> AUDITORIUM 01</div>
      </div>
      <div class="ticket__barcode">||| | |||| || | ||||| ||| | |||</div>
    </div>
  </div>
</div>
```

```css
.ticket-wrapper {
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.3));
}

.ticket {
  --radius: 16px;
  --bg: #1e1b4b;
  display: flex;
  width: 520px;
  color: #ffffff;
  position: relative;
  background: var(--bg);

  /* Scooped cutouts at center divider top and bottom */
  -webkit-mask:
    radial-gradient(circle at 140px 0, transparent var(--radius), #000 calc(var(--radius) + 0.5px)) top left,
    radial-gradient(circle at 140px 100%, transparent var(--radius), #000 calc(var(--radius) + 0.5px)) bottom left;
  -webkit-mask-size: 100% 51%;
  -webkit-mask-repeat: no-repeat;
  mask:
    radial-gradient(circle at 140px 0, transparent var(--radius), #000 calc(var(--radius) + 0.5px)) top left,
    radial-gradient(circle at 140px 100%, transparent var(--radius), #000 calc(var(--radius) + 0.5px)) bottom left;
  mask-size: 100% 51%;
  mask-repeat: no-repeat;
}

.ticket__stub {
  width: 140px;
  flex-shrink: 0;
  background: #312e81;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ticket__code {
  font-size: 10px;
  letter-spacing: 2px;
  color: #a5b4fc;
  font-weight: 800;
}

.ticket__stub-title {
  margin: 12px 0;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.ticket__seat {
  font-size: 11px;
  color: #c7d2fe;
  font-weight: 600;
}

.ticket__divider {
  width: 0;
  border-left: 2px dashed rgba(255, 255, 255, 0.25);
  margin: 20px 0;
}

.ticket__body {
  flex-grow: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ticket__event {
  font-size: 12px;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 1.5px;
}

.ticket__details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  font-size: 11px;
  color: #cbd5e1;
  margin: 16px 0;
}

.ticket__details strong {
  display: block;
  color: #94a3b8;
  font-size: 9px;
}

.ticket__barcode {
  font-family: monospace;
  font-size: 18px;
  letter-spacing: 4px;
  color: #818cf8;
  text-align: center;
}
```

---

### Component 4: Origami Folded "Dog-Ear" Note Card

A realistic paper note card with a 3D folded triangle flap over the cut corner, casting an authentic underside shadow.

```html
<div class="dog-ear-card">
  <div class="dog-ear-card__flap"></div>
  <div class="dog-ear-card__content">
    <span class="note-date">OCTOBER 15</span>
    <h3 class="note-title">Release Architecture Checklist</h3>
    <p class="note-body">All vector clip paths verified across WebKit, Blink, and Gecko engines with responsive custom properties.</p>
  </div>
</div>
```

```css
.dog-ear-card {
  --fold-size: 36px;
  --paper-bg: #fffbeb;
  --flap-bg: #fef08a;

  position: relative;
  width: 320px;
  padding: 32px 28px;
  background: var(--paper-bg);
  color: #451a03;
  border-radius: 4px;

  /* Cut off top-right corner to make room for the fold */
  clip-path: polygon(
    0 0,
    calc(100% - var(--fold-size)) 0,
    100% var(--fold-size),
    100% 100%,
    0 100%
  );
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.12));
}

/* The folded triangular paper flap */
.dog-ear-card__flap {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--fold-size);
  height: var(--fold-size);
  background: linear-gradient(135deg, var(--flap-bg) 50%, #fde047 50%);
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  filter: drop-shadow(-3px 3px 4px rgba(0, 0, 0, 0.22));
}

.note-date {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #b45309;
}

.note-title {
  margin: 8px 0 12px 0;
  font-size: 18px;
  font-weight: 800;
  color: #78350f;
}

.note-body {
  font-size: 13px;
  line-height: 1.6;
  color: #92400e;
  margin: 0;
}
```

---

### Component 5: Tech Breadcrumb Stepper with Interlocking Chamfers

A responsive chevron/breadcrumb navigation stepper using matching positive and negative cut corners to create interlocking puzzle tabs.

```html
<nav aria-label="Checkout Progress">
  <ol class="stepper">
    <li class="step step--complete">
      <span class="step__num">1</span>
      <span class="step__label">Cart</span>
    </li>
    <li class="step step--active">
      <span class="step__num">2</span>
      <span class="step__label">Shipping</span>
    </li>
    <li class="step">
      <span class="step__num">3</span>
      <span class="step__label">Payment</span>
    </li>
    <li class="step">
      <span class="step__num">4</span>
      <span class="step__label">Confirmation</span>
    </li>
  </ol>
</nav>
```

```css
.stepper {
  --arrow: 16px;
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
}

.step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px 14px calc(24px + var(--arrow));
  background: #1e293b;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  margin-right: -10px;

  /* Arrow pointing right on right edge, notched arrow on left edge */
  clip-path: polygon(
    0 0,
    calc(100% - var(--arrow)) 0,
    100% 50%,
    calc(100% - var(--arrow)) 100%,
    0 100%,
    var(--arrow) 50%
  );
  transition: all 0.2s ease;
}

/* First step doesn't have an inward left notch */
.step:first-child {
  padding-left: 24px;
  clip-path: polygon(
    0 0,
    calc(100% - var(--arrow)) 0,
    100% 50%,
    calc(100% - var(--arrow)) 100%,
    0 100%
  );
}

.step--complete {
  background: #0f766e;
  color: #ccfbf1;
}

.step--active {
  background: #0284c7;
  color: #ffffff;
  z-index: 2;
}

.step__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 800;
}
```

---

## 9. Performance & Mathematical Guidelines

### 9.1 GPU Compositing Efficiency
- **`clip-path: polygon()`**: Extremely performant. Modern rendering engines (Blink, Gecko, WebKit) convert 2D polygons directly into GPU vertex buffers with minimal raster overhead.
- **`background: linear-gradient`**: Rasterized at element scale. Re-rendered on layout resize, but has zero compositor overhead during GPU scrolling.
- **`mask-image`**: Incurs an offscreen compositing pass where the mask alpha is multiplied against the element pixels. Best reserved for image/video wrappers or dynamic card surfaces.

### 9.2 Hit-Testing & Pointer Event Behavior
One of the greatest advantages of `clip-path: polygon()` over gradient tricks is **mouse hit testing**:
```
┌─────────────────────────────────────────────────────────┐
│                    HIT TESTING BEHAVIOR                 │
│                                                         │
│   clip-path: polygon(...)       background: linear-grad │
│   ┌──────────────────╲          ┌──────────────────╲    │
│   │ Inside: CLICKABLE │ ░░░░    │ Inside: CLICKABLE │ ▓▓│
│   │                   │ Cutout: │                   │Cut│
│   │                   │ NO CLICK│                   │OUT│
│   └───────────────────┘ ░░░░    └───────────────────┘ ▓▓│
│   [Transparent cut area         [Clipped visual area    │
│    passes clicks through]        STILL captures clicks!]│
└─────────────────────────────────────────────────────────┘
```
If a button has cut corners, clicks inside the cut triangle will pass through to elements underneath when using `clip-path`. With `background: linear-gradient`, the transparent corner still intercepts clicks.

---

## 10. Summary & Quick-Reference Cheatsheet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CSS CUT CORNERS CHEATSHEET                             │
├─────────────────────────┬───────────────────────────────────────────────────┤
│ Single Top-Right        │ clip-path: polygon(0 0, calc(100% - 15px) 0,      │
│ (Dog-Ear / Tech Button) │                    100% 15px, 100% 100%, 0 100%); │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Dual Opposing Chamfers  │ clip-path: polygon(15px 0, 100% 0,                │
│ (Cyberpunk / Diagonal)  │                    100% calc(100% - 15px),        │
│                         │                    calc(100% - 15px) 100%,        │
│                         │                    0 100%, 0 15px);               │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ 4-Corner Octagonal Box  │ clip-path: polygon(15px 0, calc(100% - 15px) 0,   │
│ (Sci-Fi Armor Panel)    │                    100% 15px,                     │
│                         │                    100% calc(100% - 15px),        │
│                         │                    calc(100% - 15px) 100%,        │
│                         │                    15px 100%, 0 calc(100% - 15px),│
│                         │                    0 15px);                       │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Scooped / Inverted Arc  │ radial-gradient(circle at top left, transparent   │
│ (Event Ticket Voucher)  │                 15px, var(--bg) 15.5px);          │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Drop Shadows            │ filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));  │
│ (Box-shadow replacement)│                                                   │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ Subpixel Seam Fix       │ background-size: 51% 51% (or calc(50% + 1px))     │
└─────────────────────────┴───────────────────────────────────────────────────┘
```
