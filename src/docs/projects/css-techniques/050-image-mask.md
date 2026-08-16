---
concept: 050-image-mask
name: CSS Image Masking
category: CSS Visual Effects & Compositing
difficulty: Intermediate to Advanced
tags: [css, mask, mask-image, mask-size, mask-repeat, mask-position, mask-composite, mask-mode, svg-mask, gradient-mask, webkit-mask, clipping, visual-effects, compositing]
---

# 050: CSS Image Masking Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Image Masking (`mask`, `mask-image`) |
| **Category** | Visual Effects, Compositing & Layering |
| **Specification** | [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) |
| **Difficulty** | Intermediate to Advanced (3.5 / 5) |
| **What it produces** | Pixel-level opacity control over any HTML element or media using images, SVGs, or CSS gradients as luminance/alpha stencils—allowing smooth feathered edges, complex organic cutouts, multi-layer composite cutaways, text knockouts, and interactive spotlight reveals. |
| **Why it works** | The browser calculates the alpha channel or luminance values of the masking layer and multiplies them against the target element's rendered pixels during compositing, rendering black/transparent mask regions invisible and white/opaque regions fully visible. |
| **Required CSS Concepts** | CSS Stacking Contexts, Alpha vs. Luminance Channels, CSS Gradients (`linear`, `radial`, `conic`), Vector Graphics (SVG `<mask>`), CSS Custom Properties, Compositing Operations (`mask-composite`), Vendor Prefixes (`-webkit-mask-*`). |

```
================================================================================
                    THE MENTAL MODEL OF CSS IMAGE MASKING
================================================================================

    TARGET ELEMENT (Image / Content)           MASK LAYER (Gradient / SVG / PNG)
    ┌──────────────────────────────┐          ┌──────────────────────────────┐
    │                              │          │██████████████░░░░░░░░░░      │
    │      Full Color Image        │    ×     │  Opaque       Feather   Zero │
    │      or DOM Component        │          │  (Alpha: 1)   (0.5)    (0.0) │
    │                              │          │██████████████░░░░░░░░░░      │
    └──────────────────────────────┘          └──────────────────────────────┘
                                     │
                                     ▼
                          COMPOSITED FINAL OUTPUT
    ┌──────────────────────────────┐
    │██████████████░░░░░░░░░░      │
    │  Fully       Soft      Gone  │
    │  Visible     Fade      (100% │
    │              Edge      Trnsp)│
    └──────────────────────────────┘
```

---

## 1. Masking vs. Clipping: Key Differences

Developers often confuse `mask-image` with `clip-path`. While both restrict the visible region of an element, their mathematical capabilities and use cases differ fundamentally:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIPPING vs. MASKING                               │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ `clip-path` (Hard Vector Edges)      │ `mask-image` (Soft & Grayscale Alpha)│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Binary: Inside = 100%, Outside = 0%│ • Continuous: 0% to 100% opacity     │
│ • Hard, sharp polygonal boundaries  │ • Soft feathered edges, blurs, glows │
│ • Defined by geometric shapes/paths  │ • Driven by PNGs, SVGs, or Gradients │
│ • Cannot achieve smooth gradient fade│ • Supports multi-layer compositing   │
│ • Higher performance (simple vectors)│ • Richer artistic / tactile effects  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

| Feature | `clip-path` | `mask-image` |
| :--- | :--- | :--- |
| **Alpha / Opacity Control** | ❌ No (binary visible/invisible) | ✔️ Yes (smooth 8-bit alpha transitions) |
| **Gradients as Stencils** | ❌ No | ✔️ Yes (`linear-gradient`, `radial-gradient`) |
| **External Raster Stencils** | ❌ No | ✔️ Yes (PNG, WebP, AVIF) |
| **SVG Masks with Filters** | ⚠️ Limited | ✔️ Yes (Full SVG `<mask>` with luminance) |
| **Soft Edge Feathering** | ❌ No (always crisp edges) | ✔️ Yes (infinite smoothness) |
| **Multi-layer Compositing** | ❌ No | ✔️ Yes (`add`, `subtract`, `intersect`, `exclude`) |
| **GPU Raster Overhead** | Extremely Low | Low to Moderate (depends on resolution) |

---

## 2. Core Syntax & The Property Family

Like `background`, the `mask` property is a shorthand for a complete suite of longhand sub-properties.

> [!IMPORTANT]
> **Cross-Browser Support Rule**: Most modern WebKit/Blink browsers (Chrome, Safari, Edge, Opera) still require the `-webkit-` vendor prefix for CSS masking properties. Always specify both `-webkit-mask-*` and standard `mask-*` declarations.

```css
.masked-element {
  /* WebKit / Chromium Legacy Engine */
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  /* W3C Standard Specification */
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-position: center;
}
```

### The Longhand Properties

```
                            ┌────────────────────────┐
                            │      mask (Shorthand)  │
                            └───────────┬────────────┘
                                        │
     ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
     ▼                  ▼               ▼               ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  mask-image  │ │  mask-size   │ │mask-position │ │ mask-repeat  │ │  mask-mode   │
│  url / grad  │ │cover/contain │ │center / 50%  │ │no-repeat/tile│ │alpha / lumin │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
     │                  │               │               │                  │
     ▼                  ▼               ▼               ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ mask-origin  │ │  mask-clip   │ │mask-composite│ │  mask-type   │ │mask-border   │
│content/border│ │padding/border│ │add / subtract│ │ (SVG internal│ │ 9-slice mask│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### 1. `mask-image`
Specifies the image source(s) used as the mask. Can take `none`, a `url(...)` referencing an SVG/raster image, or any CSS gradient function (`linear-gradient()`, `radial-gradient()`, `conic-gradient()`).
```css
mask-image: url('/masks/brush-stroke.svg');
mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
mask-image: url('pattern.png'), linear-gradient(to right, black, transparent);
```

#### 2. `mask-size`
Defines the dimensions of the mask image within the mask painting area. Accepts length values, percentages, or the keywords `cover` and `contain`.
```css
mask-size: cover;          /* Scales to cover entire element */
mask-size: contain;        /* Scales to fit without cropping */
mask-size: 100% 50%;       /* Custom width and height */
mask-size: 64px 64px;      /* Fixed repeating tile size */
```

#### 3. `mask-position`
Sets the initial position of the mask layer relative to the `mask-origin`.
```css
mask-position: center;
mask-position: top right;
mask-position: 50% calc(100% - 20px);
```

#### 4. `mask-repeat`
Controls whether and how the mask image tiles across the element.
```css
mask-repeat: no-repeat;    /* Single mask stencil */
mask-repeat: repeat;       /* Pattern tiling across X & Y */
mask-repeat: repeat-x;     /* Horizontal stripe repetition */
mask-repeat: round;        /* Stretches tiles to prevent partial clipping */
mask-repeat: space;        /* Distributes tiles evenly with whitespace */
```

#### 5. `mask-origin` & `mask-clip`
Determines the reference box for positioning (`mask-origin`) and bounds for painting (`mask-clip`).
* `border-box`: Includes padding and border.
* `padding-box`: Default for standard HTML boxes (excludes border).
* `content-box`: Restricts mask strictly to content area.
* `fill-box`, `stroke-box`, `view-box`: Geometry boxes for SVG elements.

```css
mask-origin: border-box;
mask-clip: content-box;
```

#### 6. `mask-mode`
Specifies whether the mask is treated as an **Alpha mask** or a **Luminance mask**.
```css
mask-mode: alpha;        /* Uses alpha/opacity channel */
mask-mode: luminance;    /* Uses grayscale brightness channel */
mask-mode: match-source; /* Default: SVG <mask> = luminance, raster/grad = alpha */
```

---

## 3. Alpha Masking vs. Luminance Masking

Understanding the distinction between **Alpha** and **Luminance** is critical to avoid unexpected results.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ALPHA vs. LUMINANCE MASKS                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ALPHA MASKING (`mask-mode: alpha`)   │ LUMINANCE MASKING (`luminance`)      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Governed by the Alpha (A) channel  │ • Governed by perceived Brightness   │
│ • Color is completely irrelevant     │ • Alpha is ignored; RGB determines A │
│ • `rgba(255, 0, 0, 1.0)` is OPAQUE   │ • `#FFFFFF` (White) = 100% OPAQUE    │
│ • `rgba(0, 0, 0, 0.0)` is INVISIBLE  │ • `#000000` (Black) = 100% INVISIBLE │
│ • Standard for CSS Gradients & PNGs  │ • `#808080` (50% Gray) = 50% OPACITY │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Alpha Mask Example
In alpha masks, any color with `alpha = 1` acts as a solid stencil:
```css
/* Both produce the EXACT same result in alpha mode: */
mask-image: linear-gradient(to right, black, transparent);
mask-image: linear-gradient(to right, red, rgba(255, 0, 0, 0));
```

### Luminance Mask Example
In luminance masks (standard in SVG `<mask>` elements), color brightness dictates opacity:
```html
<svg width="0" height="0">
  <mask id="luminance-stencil" maskUnits="objectBoundingBox">
    <!-- White center is visible; black border is invisible -->
    <rect width="100%" height="100%" fill="black" />
    <circle cx="50%" cy="50%" r="40%" fill="white" />
  </mask>
</svg>
```

```css
.target {
  mask: url('#luminance-stencil');
}
```

---

## 4. Fundamental Gradient Masking Techniques

CSS Gradients are the most versatile mask sources because they require **zero external assets or HTTP requests**, scale infinitely, and can be dynamically manipulated with CSS custom properties.

### Technique 4.1: Edge Fade-Out (Feathered Vignette)
Fades the bottom or perimeter of a card/image into the background without needing to match the background color (vital for dark/light mode and transparent layouts):

```css
.feathered-card {
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 70%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 70%,
    transparent 100%
  );
}
```

```
┌──────────────────────────────────────┐
│  Solid visible content (black 0-70%) │
│                                      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <-- Linear falloff
│ ···································· │  <-- Transparent (100%)
└──────────────────────────────────────┘
```

### Technique 4.2: Radial Spotlight / Island Mask
Reveals a soft circular aperture in the center of an element while feathering out the perimeter:

```css
.spotlight-reveal {
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 40%,
    rgba(0, 0, 0, 0.4) 70%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle at center,
    black 40%,
    rgba(0, 0, 0, 0.4) 70%,
    transparent 100%
  );
}
```

### Technique 4.3: Scroll Overflow Indicator Mask
Creates smooth top and bottom fade indicators on scrollable containers to visually communicate that additional content exists beyond the fold:

```css
.scrollable-stream {
  overflow-y: auto;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0px,
    black 32px,
    black calc(100% - 32px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0px,
    black 32px,
    black calc(100% - 32px),
    transparent 100%
  );
}
```

```
┌──────────────────────────────────────┐  ▲ Top Fade (32px)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ▼
│ Fully visible scrollable text/cards  │
│ ...                                  │
│ ...                                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ▲ Bottom Fade (32px)
└──────────────────────────────────────┘  ▼
```

---

## 5. Multi-Layer Compositing (`mask-composite`)

Just as you can stack multiple background images, you can layer multiple masks on a single element and blend their silhouettes using `mask-composite`.

```
================================================================================
                    MASK COMPOSITING OPERATIONS
================================================================================

     MASK LAYER A (Rectangle)                 MASK LAYER B (Circle)
     ┌───────────────────────┐               
     │                       │                   ╭────────╮
     │                       │                 │          │
     │                       │                 │          │
     │                       │                   ╰────────╯
     └───────────────────────┘               

 1. ADD (Union): Both visible              2. SUBTRACT: A with B cut out
    ┌───────────────────────┐                 ┌──────────╭───╮───┐
    │                       │                 │          │   │   │
    │                   ╭───┴───╮             │          ╰───╯   │
    │                   │       │             │                  │
    └───────────────────┴───────┘             └──────────────────┘

 3. INTERSECT: Only overlapping            4. EXCLUDE (XOR): Everything except overlap
                        ╭───┐                 ┌──────────╭───╮───┐
                        │   │                 │          │   │   │
                        └───┘                 │          ╰───╯───┤
                                              └──────────────────┴───────┘
```

> [!WARNING]
> **Composite Keyword Incompatibilities**:
> The standard specification defines `add`, `subtract`, `intersect`, and `exclude`.
> WebKit's legacy engine (`-webkit-mask-composite`) uses Porter-Duff compositing keywords: `source-over`, `source-out`, `source-in`, `xor`, `destination-out`.
> 
> When building cross-browser composite masks, map standard operations to their WebKit equivalents:

| Operation Goal | Standard `mask-composite` | WebKit `-webkit-mask-composite` |
| :--- | :--- | :--- |
| **Union (Merge both)** | `add` | `source-over` |
| **Cutout (A minus B)** | `subtract` | `source-out` (or `destination-out`) |
| **Intersection (Overlap only)** | `intersect` | `source-in` |
| **XOR (Mutual difference)** | `exclude` | `xor` |

### Ticket Voucher Cutout Example
Creates a realistic coupon with half-circle notches punched out of both sides using purely CSS gradients and compositing:

```css
.ticket-voucher {
  /* Layer 1: Base solid mask */
  /* Layer 2: Left circle cutout */
  /* Layer 3: Right circle cutout */
  -webkit-mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 16px at 0% 50%, transparent 15px, black 16px),
    radial-gradient(circle 16px at 100% 50%, transparent 15px, black 16px);
  -webkit-mask-composite: source-in;

  mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 16px at 0% 50%, transparent 15px, black 16px),
    radial-gradient(circle 16px at 100% 50%, transparent 15px, black 16px);
  mask-composite: intersect;
}
```

---

## 6. Vector SVG & Custom Shape Masking

When geometric gradients are insufficient, vector SVGs provide crisp, resolution-independent organic silhouettes (such as brush strokes, torn paper, dynamic blobs, and corporate branding).

### Inline SVG vs. External SVG URL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SVG MASKING ARCHITECTURES                             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Method A: External SVG Asset File    │ Method B: Inline SVG `<mask id="...">`│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ ```css                               │ ```html                              │
│ .element {                           │ <svg width="0" height="0">           │
│   mask-image: url('blob.svg');       │   <mask id="blob-mask">              │
│   mask-size: contain;                │     <path fill="white" d="..." />    │
│   mask-repeat: no-repeat;            │   </mask>                            │
│ }                                    │ </svg>                               │
│ ```                                  │ ```css                               │
│                                      │ .element {                           │
│                                      │   mask: url(#blob-mask);             │
│                                      │ }                                    │
│                                      │ ```                                  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

#### Advantage of Method B (Inline `<mask id="...">`):
* Allows hardware-accelerated morphing of the SVG `<path>` using CSS animations or JavaScript.
* Scales automatically using `maskContentUnits="objectBoundingBox"` without recalculating pixel sizes.

---

## 7. Four Complete Production Demonstrations

Here are four comprehensive, fully self-contained, and interactive examples demonstrating various real-world CSS image masking techniques.

---

### Demo 1: The Glassmorphic Hero Card with Edge-Feathered Media

**Technique Demonstrated:** Linear gradient feathering, smooth vignette transitions, high-contrast typography, and backdrop blur integration without hard borders.

#### HTML Structure
```html
<article class="hero-mask-card" id="heroMaskDemo">
  <div class="card-media-wrapper">
    <img 
      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80" 
      alt="Cosmic Aurora Nebula" 
      class="card-image"
    />
    <div class="card-overlay"></div>
  </div>

  <div class="card-content">
    <span class="badge">CSS Masking</span>
    <h2 class="card-title">Atmospheric Depth Through Gradient Masking</h2>
    <p class="card-description">
      By applying a dual-axis feathered linear mask to the media layer, the image smoothly dissolves into the deep obsidian canvas, eliminating harsh boundary lines.
    </p>
    <div class="card-footer">
      <button class="btn-primary" type="button">Explore Technique</button>
      <span class="read-time">3 min read</span>
    </div>
  </div>
</article>
```

#### CSS Implementation
```css
:root {
  --bg-surface: #0a0d14;
  --bg-card: #121722;
  --accent-cyan: #00f2fe;
  --accent-purple: #4facfe;
  --text-main: #f0f4f8;
  --text-muted: #94a3b8;
  --border-glass: rgba(255, 255, 255, 0.08);
}

.hero-mask-card {
  position: relative;
  width: 100%;
  max-width: 580px;
  background-color: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  overflow: hidden;
  box-shadow: 
    0 20px 40px -15px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.hero-mask-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 30px 60px -20px rgba(0, 242, 254, 0.25),
    0 0 0 1px rgba(0, 242, 254, 0.3);
}

.card-media-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
  background-color: #000;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  /* The Key CSS Mask: Seamless fade to bottom and soft corners */
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 55%,
    rgba(0, 0, 0, 0.6) 80%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 55%,
    rgba(0, 0, 0, 0.6) 80%,
    transparent 100%
  );
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.hero-mask-card:hover .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at top right,
    rgba(0, 242, 254, 0.15),
    transparent 70%
  );
}

.card-content {
  position: relative;
  padding: 0 32px 32px 32px;
  margin-top: -40px; /* Pull content up over the feathered image */
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.badge {
  align-self: flex-start;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-cyan);
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.card-title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-main);
}

.card-description {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.btn-primary {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0a0d14;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 242, 254, 0.3);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.read-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}
```

---

### Demo 2: The Ticket Voucher with Dual Cutout Compositing

**Technique Demonstrated:** Multi-mask gradient blending using `mask-composite: intersect` / `source-in` to create physical cutout ticket notches without extra wrapper divs or complex SVG geometry.

#### HTML Structure
```html
<div class="voucher-ticket" id="voucherDemo">
  <div class="voucher-body">
    <div class="voucher-brand">
      <div class="brand-icon">★</div>
      <span class="brand-name">CYBERFEST 2026</span>
    </div>
    <div class="voucher-info">
      <h3 class="voucher-title">VIP All-Access Pass</h3>
      <p class="voucher-subtitle">Main Arena &bull; Section A &bull; Row 01</p>
    </div>
  </div>

  <div class="voucher-divider"></div>

  <div class="voucher-stub">
    <span class="stub-label">ADMIT</span>
    <span class="stub-number">#08492</span>
    <span class="stub-barcode">||| | |||| ||| ||</span>
  </div>
</div>
```

#### CSS Implementation
```css
.voucher-ticket {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 140px;
  width: 100%;
  max-width: 520px;
  min-height: 140px;
  background: linear-gradient(135deg, #1e2640 0%, #0f1424 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.6);

  /* --- COMPOSITE MASK CONFIGURATION --- */
  /*
   * Layer 1: Base rectangle (keeps entire ticket visible)
   * Layer 2: Left radial notch (cuts out circle at X: 0, Y: 50%)
   * Layer 3: Right radial notch (cuts out circle at X: 100%, Y: 50%)
   * Layer 4: Divider top notch (cuts circle at divider top)
   * Layer 5: Divider bottom notch (cuts circle at divider bottom)
   */
  -webkit-mask-image:
    linear-gradient(black, black),
    radial-gradient(circle 14px at calc(100% - 140px) 0%, transparent 13px, black 14px),
    radial-gradient(circle 14px at calc(100% - 140px) 100%, transparent 13px, black 14px);
  -webkit-mask-composite: source-in;

  mask-image:
    linear-gradient(black, black),
    radial-gradient(circle 14px at calc(100% - 140px) 0%, transparent 13px, black 14px),
    radial-gradient(circle 14px at calc(100% - 140px) 100%, transparent 13px, black 14px);
  mask-composite: intersect;
}

.voucher-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.voucher-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.brand-icon {
  font-size: 1rem;
}

.voucher-title {
  margin: 8px 0 4px 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #f8fafc;
}

.voucher-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.voucher-divider {
  width: 2px;
  height: calc(100% - 32px);
  align-self: center;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 50%
  );
  background-size: 2px 8px;
  background-repeat: repeat-y;
}

.voucher-stub {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
}

.stub-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #64748b;
}

.stub-number {
  font-size: 1.15rem;
  font-weight: 800;
  color: #38bdf8;
  margin: 4px 0;
}

.stub-barcode {
  font-family: monospace;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  color: #94a3b8;
}
```

---

### Demo 3: Interactive Spotlight / Torch Explorer (Mouse Tracking)

**Technique Demonstrated:** Combining CSS Custom Properties (`--mouse-x`, `--mouse-y`) with dynamic radial gradient masking to reveal a hidden illuminated artwork underneath an obsidian veil.

#### HTML Structure
```html
<div class="spotlight-stage" id="spotlightContainer">
  <!-- Base Layer: Muted Darkened Room -->
  <div class="stage-dark">
    <div class="secret-text">Hover or drag across this canvas to shine the flashlight</div>
  </div>

  <!-- Top Layer: Brilliant Secret Canvas Masked to Cursor -->
  <div class="stage-illuminated" id="torchMask">
    <img 
      src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80" 
      alt="Vibrant Neon City" 
      class="illuminated-media"
    />
    <div class="illuminated-hud">
      <div class="hud-target">TARGET LOCATED</div>
      <div class="hud-coords">SEC-09 // LAT: 42.18</div>
    </div>
  </div>
</div>
```

#### CSS Implementation
```css
.spotlight-stage {
  position: relative;
  width: 100%;
  max-width: 640px;
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  background: #05070a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  cursor: crosshair;
}

.stage-dark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #0e131f 0%, #05070a 100%);
  z-index: 1;
}

.secret-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #334155;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stage-illuminated {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none; /* Let mouse events pass through to stage */

  /* CSS Variables for Dynamic Coordinates (Default: Center 50% 50%) */
  --x: 50%;
  --y: 50%;
  --torch-radius: 120px;

  /* The Radial Flashlight Mask */
  -webkit-mask-image: radial-gradient(
    circle var(--torch-radius) at var(--x) var(--y),
    black 0%,
    rgba(0, 0, 0, 0.7) 65%,
    rgba(0, 0, 0, 0.15) 85%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--torch-radius) at var(--x) var(--y),
    black 0%,
    rgba(0, 0, 0, 0.7) 65%,
    rgba(0, 0, 0, 0.15) 85%,
    transparent 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  will-change: mask-image, -webkit-mask-image;
}

.illuminated-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.2) contrast(1.1);
}

.illuminated-hud {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 8px;
  border-left: 3px solid #00f2fe;
}

.hud-target {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00f2fe;
  letter-spacing: 0.1em;
}

.hud-coords {
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: monospace;
}
```

#### JavaScript Listener (Coordinate Binding)
```javascript
const stage = document.getElementById('spotlightContainer');
const torchMask = document.getElementById('torchMask');

if (stage && torchMask) {
  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    torchMask.style.setProperty('--x', `${x.toFixed(2)}%`);
    torchMask.style.setProperty('--y', `${y.toFixed(2)}%`);
  });

  // Soft reset when cursor exits
  stage.addEventListener('pointerleave', () => {
    torchMask.style.setProperty('--x', '50%');
    torchMask.style.setProperty('--y', '50%');
  });
}
```

---

### Demo 4: Organic Vector Blob & Kinetic Shimmer Mask for Profile Badges

**Technique Demonstrated:** SVG `<clipPath>` vs SVG `<mask>` integration with an animated linear shimmer shine moving across an organic masked avatar.

#### HTML Structure
```html
<div class="avatar-shimmer-container">
  <!-- Hidden SVG defining the reusable organic mask stencil -->
  <svg width="0" height="0" class="svg-definitions" aria-hidden="true">
    <defs>
      <!-- Luminance mask with smooth organic rounded contour -->
      <mask id="organicBlobMask" maskContentUnits="objectBoundingBox">
        <path 
          d="M 0.22,0.08 C 0.45,-0.04 0.78,-0.02 0.91,0.18 C 1.05,0.38 0.98,0.72 0.84,0.89 C 0.70,1.05 0.38,1.02 0.19,0.91 C 0.01,0.80 -0.04,0.52 0.03,0.32 C 0.09,0.14 0.08,0.15 0.22,0.08 Z" 
          fill="white" 
        />
      </mask>
    </defs>
  </svg>

  <div class="avatar-frame">
    <!-- Masked Image -->
    <img 
      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
      alt="Executive Profile" 
      class="avatar-image"
    />
    <!-- Masked Animated Glint / Shimmer Streak -->
    <div class="shimmer-streak"></div>
  </div>

  <div class="profile-details">
    <h4 class="profile-name">Alexandra Vance</h4>
    <p class="profile-role">Principal Creative Technologist</p>
  </div>
</div>
```

#### CSS Implementation
```css
.avatar-shimmer-container {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #111625;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-width: 440px;
}

.avatar-frame {
  position: relative;
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  filter: drop-shadow(0 10px 18px rgba(0, 242, 254, 0.25));

  /* Standard & WebKit SVG mask reference */
  -webkit-mask: url('#organicBlobMask');
  mask: url('#organicBlobMask');
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Kinetic Shimmer Glint traveling across the masked avatar */
.shimmer-streak {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 80%
  );
  transform: translateX(-100%);
  animation: sweepGlint 3.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

@keyframes sweepGlint {
  0% {
    transform: translateX(-100%) rotate(15deg);
  }
  30%, 100% {
    transform: translateX(120%) rotate(15deg);
  }
}

.profile-name {
  margin: 0 0 4px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.profile-role {
  margin: 0;
  font-size: 0.85rem;
  color: #38bdf8;
}

.svg-definitions {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}
```

---

## 8. Comparison Matrix: Mask vs. Other Compositing Primitives

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 COMPREHENSIVE CSS PRIMITIVE COMPARISON                                 │
├──────────────────┬─────────────────┬─────────────────┬──────────────────┬──────────────────────────────┤
│ Capability       │ `mask-image`    │ `clip-path`     │ `mix-blend-mode` │ `opacity`                    │
├──────────────────┼─────────────────┼─────────────────┼──────────────────┼──────────────────────────────┤
│ **Edge Quality** │ Soft / Feathered│ Crisp / Vector  │ Color Blended    │ Uniform / Solid              │
│ **Alpha Range**  │ 0.0 to 1.0 Grad │ Binary (In/Out) │ N/A (Color Math) │ Uniform (Entire Element)     │
│ **Asset Source** │ Grad / PNG / SVG│ Shapes / Polygon│ Background Below │ Numerical Float              │
│ **Compositing**  │ Union, Subtract │ Single Shape    │ Screen, Multiply │ Multiplies Descendant Layers │
│ **GPU Impact**   │ Moderate        │ Extremely Low   │ Moderate-High    │ Lowest (Standard Opacity)    │
│ **Best Use**     │ Fades, Vignettes│ Geometric Crops │ Darken/Lighten FX│ Entrance & Exit Fades        │
└──────────────────┴─────────────────┴─────────────────┴──────────────────┴──────────────────────────────┘
```

---

## 9. Performance & Rendering Optimization

Applying masks triggers GPU rasterization and off-screen framebuffer allocation. Follow these guidelines to maintain a smooth 60fps / 120fps frame rate:

### 1. Promote High-Frequency Animated Masks to Hardware Layers
If you are animating `mask-position` or custom properties inside `mask-image`, declare `will-change`:
```css
.animated-mask {
  will-change: mask-position, -webkit-mask-position;
}
```

### 2. Avoid Massive Viewport Repaints on High-DPI Displays
* Prefer CSS gradients (`radial-gradient`, `linear-gradient`) over massive 4K PNG raster files.
* Gradients are computed algebraically by the GPU fragment shader and consume almost zero memory bandwidth.

### 3. Progressive Enhancement with `@supports`
Always provide a clean fallback for environments where CSS Masking may be disabled or unaccelerated:

```css
.card-hero-media {
  /* Fallback: Standard overflow crop */
  border-radius: 16px;
  opacity: 0.9;
}

@supports (mask-image: linear-gradient(black, transparent)) or 
          (-webkit-mask-image: linear-gradient(black, transparent)) {
  .card-hero-media {
    border-radius: 0;
    opacity: 1;
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }
}
```

---

## 10. Common Pitfalls & Troubleshooting Guide

### 1. The "Invisible Mask" Bug (Missing WebKit Prefix)
* **Symptom**: Mask works perfectly in Firefox, but appears completely transparent or ignored in Chrome, Edge, and Safari.
* **Fix**: Ensure `-webkit-mask-image`, `-webkit-mask-size`, and `-webkit-mask-position` are explicitly defined.

```css
/* ❌ INCOMPLETE (Fails in Safari & Chromium) */
.element {
  mask-image: linear-gradient(black, transparent);
}

/* ✔️ ROBUST CROSS-BROWSER */
.element {
  -webkit-mask-image: linear-gradient(black, transparent);
  mask-image: linear-gradient(black, transparent);
}
```

### 2. The Color Confusion in Alpha Masks
* **Symptom**: Writing `linear-gradient(white, black)` expecting black to be hidden, but both ends remain 100% visible!
* **Cause**: In `alpha` mode (the default for CSS gradients), the browser only inspects the **Alpha channel**. `white` is `rgba(255,255,255,1)` and `black` is `rgba(0,0,0,1)`—both are 100% opaque.
* **Fix**: Always transition from solid to `transparent` (e.g. `linear-gradient(black, transparent)`).

### 3. Unexpected Mask Tiling
* **Symptom**: A single SVG badge or cutout unexpectedly repeats like a tiled wallpaper across the element.
* **Cause**: Like `background-repeat`, `mask-repeat` defaults to `repeat`.
* **Fix**: Explicitly set `-webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;`.

---

## 11. Quick Syntax Cheatsheet

```css
/* 1. Linear Feathered Dissolve */
mask-image: linear-gradient(to bottom, black 70%, transparent 100%);

/* 2. Soft Circular Aperture */
mask-image: radial-gradient(circle at center, black 50%, transparent 100%);

/* 3. Repeating Horizontal Stripes / Slits */
mask-image: repeating-linear-gradient(to bottom, black 0 4px, transparent 4px 8px);

/* 4. External Vector Stencil */
mask-image: url('stencil.svg');
mask-size: contain;
mask-position: center;
mask-repeat: no-repeat;

/* 5. Cutout Multi-Mask Composite */
mask-image: linear-gradient(black, black), radial-gradient(circle 20px at 0 50%, transparent 19px, black 20px);
mask-composite: intersect; /* WebKit: source-in */
```
