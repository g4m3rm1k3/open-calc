---
concept: 051-text-mask
name: CSS Text Masking
category: CSS Visual Effects & Compositing
difficulty: Intermediate to Advanced
tags: [css, text-mask, background-clip, mask-image, webkit-background-clip, webkit-text-fill-color, svg-mask, knockout-text, stencil-text, typography, compositing, visual-effects]
---

# 051: CSS Text Masking Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Text Masking & Knockout Typography |
| **Category** | Visual Effects, Typography & Compositing |
| **Specification** | [W3C CSS Backgrounds and Borders Level 4](https://www.w3.org/TR/css-backgrounds-4/#background-clip) & [W3C CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) |
| **Difficulty** | Intermediate to Advanced (3.5 / 5) |
| **What it produces** | Clipping vibrant gradients, textures, high-resolution imagery, and video directly inside letterforms; applying alpha gradient fades and spotlight reveals across typography; and punching text out of solid surfaces as stencil/cutout knockouts. |
| **Why it works** | The browser uses either the text glyph bounding geometry (`background-clip: text`) to bound background paint, or alpha/luminance raster stencils (`mask-image`, SVG `<mask>`) to multiply element opacity against the letterforms during compositing. |
| **Required CSS Concepts** | `background-clip: text`, `-webkit-text-fill-color`, `mask-image`, SVG `<mask id="...">`, `box-decoration-break`, CSS Custom Properties, Compositing & Blending (`mix-blend-mode`), `@supports`, `forced-colors`. |

```
================================================================================
                    THE TWO CORE PARADIGMS OF TEXT MASKING
================================================================================

PARADIGM 1: BACKGROUND CLIPPED TO TEXT (background-clip: text)
--------------------------------------------------------------------------------
   Rich Gradient / Image / Video        Text Silhouette         Rendered Output
   ┌──────────────────────────────┐    ┌──────────────┐       ┌──────────────┐
   │ ░░▒▒▓▓██████████▓▓▒▒░░       │ ×  │  FUTURE      │   =   │  FUTURE      │
   │ ░░▒▒▓▓██████████▓▓▒▒░░       │    │  TECH        │       │  TECH        │
   └──────────────────────────────┘    └──────────────┘       └──────────────┘
    (Background rendered only within the interior of the text glyph vectors)


PARADIGM 2: TEXT AS A STENCIL KNOCKOUT (SVG <mask> or mask-composite)
--------------------------------------------------------------------------------
   Solid Surface Plate / Glass         Text Cutout Stencil     Rendered Output
   ┌──────────────────────────────┐    ┌──────────────┐       ┌──────────────┐
   │██████████████████████████████│ -  │  PUNCH       │   =   │████ ░░░░ ████│
   │██████████████████████████████│    │  OUT         │       │████ ░░░░ ████│
   └──────────────────────────────┘    └──────────────┘       └──────────────┘
    (Solid card with transparent hole cut out in the shape of text, revealing background)
```

---

## 1. The Four Techniques of CSS Text Masking

CSS offers four distinct architectural approaches to mask and composite text. Choosing the right tool depends on your visual goal:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CSS TEXT MASKING TAXONOMY                             │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Technique            │ Primary Properties   │ Ideal Use Case                │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ **1. Gradient Text** │ `background-clip`    │ Gradient text, animated foil, │
│                      │ `-webkit-text-fill`  │ iridescent headings, metallics│
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ **2. Alpha Masking** │ `mask-image`         │ Text fade-out, shimmer shine, │
│    **over Text**     │ `-webkit-mask-image` │ cursor spotlight text reveal  │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ **3. SVG Cutout**    │ `mask: url(#id)`     │ Punching text holes in cards, │
│    **Knockout**      │ SVG `<mask id="...">`│ frosted glass stencils, video │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ **4. Blend Mode**    │ `mix-blend-mode`     │ Contrast-reversing text, live │
│    **Knockout**      │ `isolation: isolate` │ dark/light background flipping│
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 2. Deep Dive: `background-clip: text`

The most widely utilized text masking technique relies on clipping the background box of an element to the exact glyph contours of its foreground text.

### The Standard vs. Prefix Syntax

While `background-clip: text` is standardized in CSS Backgrounds and Borders Level 4, legacy Chromium and WebKit engines require vendor-prefixed declarations for both background clipping and text transparency:

```css
.gradient-heading {
  /* 1. Define the rich fill (gradient, image, or pattern) */
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #7b2ff7 100%);

  /* 2. Clip the background painting area to the foreground text glyphs */
  -webkit-background-clip: text;
  background-clip: text;

  /* 3. Make foreground text transparent to reveal the clipped background */
  -webkit-text-fill-color: transparent;
  color: transparent; /* Fallback for browsers supporting standard syntax */
}
```

> [!IMPORTANT]
> **Why `-webkit-text-fill-color: transparent`?**
> Setting `-webkit-text-fill-color: transparent` overrides the standard `color` property specifically for the glyph interior while preserving other font-related decorations such as `text-shadow`, `-webkit-text-stroke`, and underline strokes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNDERSTANDING THE PAINTING LAYERS                        │
│                                                                             │
│   Layer 1 (Bottom):   [Background Gradient / Pattern]                      │
│                                    ▲                                        │
│                                    │ Clipped by -webkit-background-clip: text
│                                    │                                        │
│   Layer 2 (Middle):   [Text Fill Glyph Interior] ──> Set to TRANSPARENT     │
│                                    │                                        │
│   Layer 3 (Top):      [-webkit-text-stroke / text-shadow] ──> Visible       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Multi-Line Text Wrapping: `box-decoration-break`

When masked text wraps across multiple lines, standard CSS treats all lines as a single fragmented box. This causes the gradient to stretch across the entire multi-line bounding rectangle, resulting in disjointed color fragments on each row.

To apply the gradient smoothly and independently to every line fragment, use `box-decoration-break: clone`:

```css
.multiline-masked-text {
  background: linear-gradient(90deg, #ff0844 0%, #ffb199 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  /* Clones background coordinates across each line wrap */
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
```

```
WITHOUT box-decoration-break: slice (Default)
┌──────────────────────────────────────────────┐
│ [Red -> Orange] Line 1                       │ <-- Only first 40% of gradient
│                 [Orange -> Pale Pink] Line 2 │ <-- Rest of gradient
└──────────────────────────────────────────────┘

WITH box-decoration-break: clone
┌──────────────────────────────────────────────┐
│ [Red ---------> Orange ---------> Pale Pink] │ <-- Full gradient on Line 1
│ [Red ---------> Orange ---------> Pale Pink] │ <-- Full gradient on Line 2
└──────────────────────────────────────────────┘
```

---

## 3. Applying `mask-image` to Typography

Instead of clipping the background into the text, you can apply `mask-image` **directly onto text elements** to modulate their visibility with alpha fades, sweeps, and dynamic lighting.

### Pattern 1: Horizontal Fade-Out / Text Teaser Mask

Fades long text gracefully into transparency before overflowing:

```css
.text-fade-edge {
  font-size: 1.25rem;
  color: #f8fafc;
  
  /* Alpha mask: 80% solid, fades to 0% transparency at right edge */
  -webkit-mask-image: linear-gradient(to right, black 70%, transparent 100%);
  mask-image: linear-gradient(to right, black 70%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

### Pattern 2: Holographic Shimmer / Light Beam Sweep

A narrow white/opaque band traveling across typography creates a luxurious metallic reflection:

```css
@keyframes shimmer-sweep {
  0% {
    -webkit-mask-position: -200% center;
    mask-position: -200% center;
  }
  100% {
    -webkit-mask-position: 200% center;
    mask-position: 200% center;
  }
}

.shimmer-text {
  color: #e2e8f0;
  
  /* Mask creates a 45-degree high-luminance slit traveling across text */
  -webkit-mask-image: linear-gradient(
    115deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 1.0) 50%,
    rgba(0, 0, 0, 0.2) 60%,
    rgba(0, 0, 0, 0.2) 100%
  );
  mask-image: linear-gradient(
    115deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 1.0) 50%,
    rgba(0, 0, 0, 0.2) 60%,
    rgba(0, 0, 0, 0.2) 100%
  );
  -webkit-mask-size: 200% 100%;
  mask-size: 200% 100%;
  
  animation: shimmer-sweep 3.5s infinite ease-in-out;
}
```

---

## 4. Reverse Knockout: Text as a Stencil Cutout

A **Text Knockout** (or Stencil Mask) reverses the traditional relationship: instead of filling text with an image, text is cut out of a solid container, turning the letters into transparent windows that reveal whatever sits behind the container.

### The SVG Luminance Mask Technique

SVG `<mask id="...">` is the most reliable cross-browser mechanism for punch-out typography:

```html
<!-- Hidden SVG definition defining the stencil -->
<svg class="svg-stencil-defs" width="0" height="0" aria-hidden="true">
  <defs>
    <mask id="text-knockout-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
      <!-- 1. White background = KEEP solid plate -->
      <rect x="0" y="0" width="1" height="1" fill="#ffffff" />
      <!-- 2. Black text = CUT HOLE through solid plate -->
      <text x="0.5" y="0.55" text-anchor="middle" dominant-baseline="middle" 
            fill="#000000" font-size="0.22" font-weight="900" font-family="sans-serif">
        STENCIL
      </text>
    </mask>
  </defs>
</svg>

<!-- DOM Card element referencing the stencil -->
<div class="stencil-card">
  <!-- Content beneath the card is visible through the letters 'STENCIL' -->
</div>
```

```css
.stencil-card {
  background: #0f172a;
  -webkit-mask: url(#text-knockout-mask);
  mask: url(#text-knockout-mask);
}
```

```
SVG LUMINANCE MASK RULES:
┌────────────────────────────────────────────────────────┐
│ #FFFFFF (White) in Mask  ==> Target Element is 100% OPAQUE │
│ #000000 (Black) in Mask  ==> Target Element is 100% HOLE   │
│ #808080 (Gray) in Mask   ==> Target Element is 50% OPAQUE  │
└────────────────────────────────────────────────────────┘
```

---

## 5. Five Complete Production Demonstrations

Here are five standalone, zero-dependency, production-ready implementations demonstrating modern text masking in real-world design systems.

---

### Demo 1: Cyberpunk Neon Hologram & Gradient Masked Typography

A high-impact display header featuring a vibrant animated cyber-gradient fill, animated diagonal scanline masks, layered neon stroke glow, and accessible text selection.

#### HTML Structure
```html
<section class="cyber-showcase" aria-label="Cyberpunk Typography Demo">
  <div class="cyber-container">
    <span class="cyber-tag">/// SYSTEM PROTOCOL v4.9</span>
    <h1 class="cyber-heading" data-text="NEURAL MATRIX">
      <span class="cyber-heading-fill">NEURAL MATRIX</span>
      <span class="cyber-heading-scanline" aria-hidden="true">NEURAL MATRIX</span>
    </h1>
    <p class="cyber-subtext">
      Next-generation neural rendering with hardware-accelerated CSS masking engines.
    </p>
    <div class="cyber-actions">
      <button class="cyber-btn primary">Initialize Interface</button>
      <button class="cyber-btn secondary">View Schematics</button>
    </div>
  </div>
</section>
```

#### CSS Implementation
```css
/* ==========================================================================
   Demo 1: Cyberpunk Neon & Gradient Masked Typography
   ========================================================================== */

:root {
  --cyber-bg: #05070d;
  --cyber-neon-cyan: #00f2fe;
  --cyber-neon-magenta: #ff007f;
  --cyber-neon-amber: #ffaa00;
  --cyber-neon-purple: #7928ca;
  --cyber-text-main: #f1f5f9;
  --cyber-text-muted: #64748b;
  --cyber-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.cyber-showcase {
  background-color: var(--cyber-bg);
  background-image: 
    radial-gradient(circle at 50% 20%, rgba(121, 40, 202, 0.25) 0%, transparent 60%),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 480px;
  font-family: var(--cyber-font);
  color: var(--cyber-text-main);
  box-sizing: border-box;
}

.cyber-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cyber-tag {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--cyber-neon-cyan);
  text-transform: uppercase;
  margin-bottom: 16px;
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
}

.cyber-heading {
  position: relative;
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 24px 0;
  text-transform: uppercase;
}

/* Layer 1: The Core Multi-Stop Gradient Masked Text */
.cyber-heading-fill {
  display: inline-block;
  background: linear-gradient(
    135deg,
    var(--cyber-neon-cyan) 0%,
    var(--cyber-neon-magenta) 45%,
    var(--cyber-neon-amber) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 0 30px rgba(0, 242, 254, 0.3));
  animation: cyber-gradient-flow 6s ease infinite alternate;
}

/* Layer 2: The Holographic Mask Scanline Overlay */
.cyber-heading-scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: inline-block;
  color: #ffffff;
  pointer-events: none;
  user-select: none;
  
  /* Horizontal scanline repeating alpha mask */
  -webkit-mask-image: repeating-linear-gradient(
    to bottom,
    black 0px,
    black 3px,
    transparent 3px,
    transparent 6px
  );
  mask-image: repeating-linear-gradient(
    to bottom,
    black 0px,
    black 3px,
    transparent 3px,
    transparent 6px
  );
  opacity: 0.35;
  mix-blend-mode: overlay;
}

@keyframes cyber-gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.cyber-subtext {
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 580px;
  color: var(--cyber-text-muted);
  margin: 0 0 36px 0;
}

.cyber-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.cyber-btn {
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;
}

.cyber-btn.primary {
  background: linear-gradient(135deg, var(--cyber-neon-cyan), var(--cyber-neon-magenta));
  color: #05070d;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
}

.cyber-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(255, 0, 127, 0.6);
}

.cyber-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--cyber-text-main);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.cyber-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Accessible selection color */
.cyber-heading-fill::selection {
  background-color: var(--cyber-neon-magenta);
  -webkit-text-fill-color: #ffffff;
  color: #ffffff;
}
```

---

### Demo 2: Cinematic Video/Image Knockout Hero Display

A full-screen cinematic banner where letterforms reveal an animated high-contrast motion texture or photography backdrop underneath, paired with dynamic hover responsiveness.

#### HTML Structure
```html
<div class="cinema-banner" aria-label="Cinematic Text Knockout Banner">
  <div class="cinema-backdrop" aria-hidden="true"></div>
  <div class="cinema-content">
    <span class="cinema-badge">SUMMER FILM EXPEDITION</span>
    <h1 class="cinema-title">WILDERNESS</h1>
    <p class="cinema-caption">Capturing untouched nature in 8K Ultra High Definition</p>
    <a href="#explore" class="cinema-link">
      <span>Discover Journey</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
    </a>
  </div>
</div>
```

#### CSS Implementation
```css
/* ==========================================================================
   Demo 2: Cinematic Video/Image Knockout Hero Display
   ========================================================================== */

:root {
  --cinema-bg: #090b10;
  --cinema-gold: #f59e0b;
  --cinema-text: #f8fafc;
  --cinema-muted: #94a3b8;
}

.cinema-banner {
  position: relative;
  overflow: hidden;
  background-color: var(--cinema-bg);
  border-radius: 20px;
  padding: 100px 32px;
  margin: 32px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

/* Ambient glow in background */
.cinema-backdrop {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 65%),
    linear-gradient(180deg, rgba(9, 11, 16, 0.4) 0%, rgba(9, 11, 16, 0.95) 100%);
  pointer-events: none;
}

.cinema-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
}

.cinema-badge {
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  font-weight: 700;
  color: var(--cinema-gold);
  text-transform: uppercase;
  margin-bottom: 20px;
  display: inline-block;
}

.cinema-title {
  margin: 0;
  font-size: clamp(3rem, 14vw, 9rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  /* Rich Image Masking Pipeline */
  background-image: 
    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.8) 0%, transparent 60%),
    linear-gradient(135deg, #f6d365 0%, #fda085 40%, #f5576c 75%, #4facfe 100%);
  background-size: 150% 150%;
  background-position: center;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;

  /* Subtle 3D dimension via drop shadow filter */
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.8));
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-position 0.6s ease;
}

.cinema-banner:hover .cinema-title {
  transform: scale(1.03);
  background-position: 70% 30%;
}

.cinema-caption {
  margin: 28px 0 36px 0;
  font-size: 1.2rem;
  color: var(--cinema-muted);
  font-weight: 400;
  letter-spacing: 0.02em;
}

.cinema-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--cinema-text);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.cinema-link:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--cinema-gold);
  transform: translateY(-2px);
}

.cinema-link svg {
  transition: transform 0.3s ease;
}

.cinema-link:hover svg {
  transform: translateX(4px);
}
```

---

### Demo 3: Interactive Spotlight / Torchlight Mask Reveal

An interactive dark-mode component where hovering and moving the mouse casts a radial torchlight beam over shrouded text, dynamically revealing secret copy beneath via CSS custom properties.

#### HTML Structure
```html
<div class="spotlight-card" id="spotlightCard" aria-label="Interactive Spotlight Text Card">
  <div class="spotlight-layer base-layer" aria-hidden="true">
    <h2 class="spotlight-title">RESTRICTED ARCHIVE</h2>
    <p class="spotlight-desc">Hover over this secure container to decrypt classified intelligence records.</p>
  </div>
  
  <div class="spotlight-layer reveal-layer">
    <h2 class="spotlight-title reveal">QUANTUM TELEMETRY DECRYPTED</h2>
    <p class="spotlight-desc reveal">Authorization Level 5 Granted: All telemetry streams active and synchronized.</p>
  </div>
  
  <div class="spotlight-hud">
    <span class="hud-status"><span class="hud-dot"></span> SENSOR ACTIVE</span>
    <span class="hud-coords" id="spotlightCoords">X: 50% | Y: 50%</span>
  </div>
</div>
```

#### CSS Implementation
```css
/* ==========================================================================
   Demo 3: Interactive Spotlight / Torchlight Mask Reveal
   ========================================================================== */

:root {
  --spot-bg: #0b0f19;
  --spot-card: #111827;
  --spot-border: #1f2937;
  --spot-gold: #fbbf24;
  --spot-cyan: #38bdf8;
}

.spotlight-card {
  position: relative;
  background-color: var(--spot-card);
  border: 1px solid var(--spot-border);
  border-radius: 16px;
  padding: 60px 40px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  cursor: crosshair;
  user-select: none;
  
  /* Initial CSS mouse coordinates */
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-radius: 180px;
}

.spotlight-layer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Layer 1: Dark, muted base state */
.base-layer .spotlight-title {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #374151;
  letter-spacing: -0.01em;
}

.base-layer .spotlight-desc {
  margin: 0;
  font-size: 1.05rem;
  color: #4b5563;
  max-width: 600px;
}

/* Layer 2: Torchlight illuminated layer with radial-gradient mask */
.reveal-layer {
  position: absolute;
  inset: 0;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;

  /* Radial alpha mask tracking CSS variables */
  -webkit-mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.6) 50%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--spotlight-radius) at var(--mouse-x) var(--mouse-y),
    black 0%,
    rgba(0, 0, 0, 0.6) 50%,
    transparent 100%
  );
}

.reveal-layer .spotlight-title.reveal {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--spot-cyan);
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
  letter-spacing: -0.01em;
}

.reveal-layer .spotlight-desc.reveal {
  margin: 0;
  font-size: 1.05rem;
  color: #e0f2fe;
  max-width: 600px;
}

.spotlight-hud {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  color: #6b7280;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.hud-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--spot-gold);
}

.hud-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--spot-gold);
  box-shadow: 0 0 8px var(--spot-gold);
  animation: pulse-dot 1.5s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
```

#### Companion JavaScript (Micro-Controller)
```javascript
// Attach interactive pointer coordinate tracker to spotlight card
const card = document.getElementById('spotlightCard');
const coordsDisplay = document.getElementById('spotlightCoords');

if (card) {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    
    if (coordsDisplay) {
      coordsDisplay.textContent = `X: ${Math.round(x)}px | Y: ${Math.round(y)}px`;
    }
  });
  
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    if (coordsDisplay) {
      coordsDisplay.textContent = 'X: 50% | Y: 50%';
    }
  });
}
```

---

### Demo 4: Frosted Glass Stencil Cutout Card

A frosted glassmorphism card where the headline is punched out of the translucent frosted glass plate using an SVG stencil mask, allowing vibrant background orbs to shine directly through the letters without blur.

#### HTML Structure
```html
<div class="glass-scene" aria-label="Frosted Glass Stencil Demo">
  <!-- Glowing background orbs -->
  <div class="glow-orb orb-1" aria-hidden="true"></div>
  <div class="glow-orb orb-2" aria-hidden="true"></div>

  <!-- Hidden SVG Mask Definition -->
  <svg class="stencil-defs" width="0" height="0" aria-hidden="true">
    <defs>
      <mask id="glass-cutout-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
        <!-- 1. White keeps the frosted glass card solid -->
        <rect width="1" height="1" fill="#ffffff" rx="0.04" ry="0.04" />
        <!-- 2. Black punches out the letterforms -->
        <text x="0.5" y="0.48" text-anchor="middle" dominant-baseline="middle"
              fill="#000000" font-family="system-ui, -apple-system, sans-serif"
              font-weight="900" font-size="0.14" letter-spacing="-0.005">
          APERTURE
        </text>
      </mask>
    </defs>
  </svg>

  <!-- The Frosted Glass Card with Cutout Typography -->
  <div class="glass-card-wrapper">
    <div class="glass-plate"></div>
    <div class="glass-card-body">
      <div class="glass-header">
        <span class="glass-pill">STENCIL COMPOSITING</span>
        <span class="glass-version">ISO // 100</span>
      </div>
      <div class="glass-spacer"></div>
      <p class="glass-desc">
        The typography above is a physical cutout in the frosted acrylic plate, rendering the moving gradient orbs sharp and unblurred through the letters.
      </p>
      <div class="glass-footer">
        <span>Optical Transmission: 99.4%</span>
        <button class="glass-btn">Configure Optics</button>
      </div>
    </div>
  </div>
</div>
```

#### CSS Implementation
```css
/* ==========================================================================
   Demo 4: Frosted Glass Stencil Cutout Card
   ========================================================================== */

.glass-scene {
  position: relative;
  min-height: 480px;
  background: #090d16;
  border-radius: 20px;
  padding: 40px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

.stencil-defs {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Background animated glow orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.8;
  animation: orb-float 8s infinite alternate ease-in-out;
}

.orb-1 {
  width: 260px;
  height: 260px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  top: 15%;
  left: 20%;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  bottom: 10%;
  right: 15%;
  animation-delay: -4s;
}

@keyframes orb-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, 30px) scale(1.15); }
}

.glass-card-wrapper {
  position: relative;
  width: 100%;
  max-width: 580px;
  min-height: 340px;
  border-radius: 20px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7);
}

/* The actual masked frosted plate */
.glass-plate {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;

  /* SVG Cutout Stencil Mask Applied */
  -webkit-mask: url(#glass-cutout-mask);
  mask: url(#glass-cutout-mask);
  pointer-events: none;
}

.glass-card-body {
  position: relative;
  z-index: 2;
  padding: 32px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  color: #f8fafc;
}

.glass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.glass-pill {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: #e2e8f0;
}

.glass-version {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: #94a3b8;
}

.glass-spacer {
  height: 110px; /* Space where 'APERTURE' is cut out */
}

.glass-desc {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0 0 24px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.glass-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #94a3b8;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.glass-btn {
  background: #ffffff;
  color: #090d16;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.glass-btn:hover {
  opacity: 0.9;
}
```

---

### Demo 5: Dual-Tone Multi-Line Flowing Paragraph with `box-decoration-break`

A modern editorial design demonstrating multi-line text gradient wrapping, inline highlight badges with seamless gradient masking, and hover contrast inversion.

#### HTML Structure
```html
<article class="editorial-card" aria-label="Editorial Masked Typography Article">
  <div class="editorial-meta">
    <time datetime="2026-08-15">AUGUST 15, 2026</time>
    <span class="editorial-dot"></span>
    <span>ESSAY // MODERN CSS</span>
  </div>
  
  <h2 class="editorial-headline">
    The art of <span class="editorial-gradient-span">seamless visual expression</span> through modern vector typography.
  </h2>
  
  <p class="editorial-body">
    By pairing <span class="editorial-highlight">hardware-accelerated masking pipelines</span> with fluid typographic scale, developers can transform static body copy into captivating kinetic experiences without compromising semantic accessibility.
  </p>
  
  <footer class="editorial-footer">
    <div class="author-block">
      <div class="author-avatar" aria-hidden="true">AG</div>
      <div>
        <div class="author-name">Antigravity Design Lab</div>
        <div class="author-role">Compositing Systems</div>
      </div>
    </div>
    <button class="editorial-read-btn">Read Complete Essay &rarr;</button>
  </footer>
</article>
```

#### CSS Implementation
```css
/* ==========================================================================
   Demo 5: Dual-Tone Multi-Line Kinetic Typography
   ========================================================================== */

:root {
  --ed-bg: #0f172a;
  --ed-card-bg: #1e293b;
  --ed-border: #334155;
  --ed-text: #f1f5f9;
  --ed-muted: #94a3b8;
  --ed-grad-start: #f43f5e;
  --ed-grad-mid: #a855f7;
  --ed-grad-end: #3b82f6;
}

.editorial-card {
  background-color: var(--ed-card-bg);
  border: 1px solid var(--ed-border);
  border-radius: 16px;
  padding: 48px;
  max-width: 720px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--ed-text);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.editorial-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--ed-muted);
  margin-bottom: 20px;
}

.editorial-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--ed-muted);
}

.editorial-headline {
  font-size: clamp(2rem, 4.5vw, 2.85rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0 0 24px 0;
}

/* Multi-line gradient span with clone decoration */
.editorial-gradient-span {
  background: linear-gradient(120deg, var(--ed-grad-start), var(--ed-grad-mid), var(--ed-grad-end));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.editorial-body {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 0 36px 0;
}

.editorial-highlight {
  font-weight: 700;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  border-bottom: 2px solid rgba(56, 189, 248, 0.4);
  padding-bottom: 2px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.editorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 24px;
  border-top: 1px solid var(--ed-border);
}

.author-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ed-grad-start), var(--ed-grad-mid));
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: 0.85rem;
  color: #ffffff;
}

.author-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ed-text);
}

.author-role {
  font-size: 0.8rem;
  color: var(--ed-muted);
}

.editorial-read-btn {
  background: rgba(255, 255, 255, 0.06);
  color: var(--ed-text);
  border: 1px solid var(--ed-border);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editorial-read-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #94a3b8;
  transform: translateX(3px);
}
```

---

## 6. Accessibility (a11y), Contrast & High-Contrast Mode

Text masking requires deliberate accessibility engineering to ensure screen readers, search engines, and assistive devices can parse your content effortlessly.

### 1. The Screen Reader Guarantee
Because `background-clip: text` and `mask-image` are applied to standard semantic HTML elements (`<h1>`, `<p>`, `<span>`), **the underlying DOM text remains 100% accessible to screen readers, translation engines, and text search (Ctrl/Cmd+F)**.

### 2. High-Contrast Mode & `forced-colors` Fix
In Windows High Contrast Mode (`forced-colors: active`), operating systems override custom font colors. If `-webkit-text-fill-color: transparent` remains active, the text may become completely invisible to low-vision users!

Protect your design with `@media (forced-colors: active)`:

```css
@media (forced-colors: active) {
  .cyber-heading-fill,
  .cinema-title,
  .editorial-gradient-span,
  .editorial-highlight {
    /* Reset text fill to system high-contrast theme text */
    -webkit-text-fill-color: CanvasText !important;
    color: CanvasText !important;
    background: none !important;
    forced-color-adjust: none;
  }
}
```

### 3. Accessible Text Selection (`::selection`)
When text has `-webkit-text-fill-color: transparent`, highlighting text can produce bizarre clipping artifacts where the selection highlight covers the text. Explicitly style the `::selection` pseudo-element:

```css
.gradient-text::selection {
  background-color: #3b82f6; /* Selection background */
  -webkit-text-fill-color: #ffffff; /* Restore solid text color during selection */
  color: #ffffff;
}
```

### 4. Reduced Motion Support
Honor users who have requested reduced animation:

```css
@media (prefers-reduced-motion: reduce) {
  .cyber-heading-fill,
  .shimmer-text,
  .glow-orb {
    animation: none !important;
  }
}
```

---

## 7. Progressive Enhancement with `@supports`

Always supply a high-contrast fallback for browsers or rendering environments where background clipping is disabled or unsupported:

```css
.resilient-gradient-heading {
  /* 1. Base Fallback: Solid high-contrast color */
  font-size: 3rem;
  font-weight: 800;
  color: #4facfe;
}

/* 2. Modern Enhancement: Gradient Masked */
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .resilient-gradient-heading {
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #7b2ff7 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
}
```

---

## 8. Cross-Browser Compatibility Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER COMPATIBILITY MATRIX                                  │
├───────────────────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Feature                   │ Chrome / Edge│ Safari (iOS) │ Firefox      │ Samsung Internet│
├───────────────────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ `-webkit-background-clip` │ ✔️ Full (v4+) │ ✔️ Full (v5+) │ ✔️ Full (v49+)│ ✔️ Full (v4+)   │
│ `background-clip: text`   │ ⚠️ Prefixed  │ ⚠️ Prefixed  │ ✔️ Standard  │ ⚠️ Prefixed    │
│ `-webkit-text-fill-color` │ ✔️ Full (v4+) │ ✔️ Full (v5+) │ ✔️ Full (v49+)│ ✔️ Full (v4+)   │
│ `box-decoration-break`    │ ⚠️ Prefixed  │ ⚠️ Prefixed  │ ✔️ Standard  │ ⚠️ Prefixed    │
│ `mask-image` (CSS Mask)   │ ⚠️ Prefixed  │ ⚠️ Prefixed  │ ✔️ Standard  │ ⚠️ Prefixed    │
│ SVG `mask: url(#id)`      │ ✔️ Full      │ ✔️ Full      │ ✔️ Full      │ ✔️ Full        │
└───────────────────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
```

> [!TIP]
> Always pair `-webkit-background-clip: text;` with `background-clip: text;` and `-webkit-box-decoration-break: clone;` with `box-decoration-break: clone;` to guarantee flawless cross-browser rendering.

---

## 9. Performance & Hardware Acceleration Guidelines

1. **Avoid Animating `background-size` or `font-size` directly on Masked Text**:
   - Modifying font geometry or background sizes triggers CPU text shaping and layout reflow.
   - Instead, animate `background-position`, CSS Custom Properties, or use GPU-accelerated `transform: translate3d()` / `scale()`.

2. **Subpixel Antialiasing & Crisp Font Edges**:
   - On macOS and WebKit, transparent text fills can sometimes exhibit slight subpixel fringing. Fix this with:
   ```css
   .masked-text {
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
     text-rendering: optimizeLegibility;
   }
   ```

3. **Promoting Animated Scanlines to Hardware Compositior**:
   - If using `mask-position` keyframe loops (like Demo 1 or Demo 3), declare `will-change`:
   ```css
   .animated-masked-text {
     will-change: mask-position, -webkit-mask-position;
   }
   ```

---

## 10. Common Pitfalls & Troubleshooting Guide

### 1. The "Invisible Text" Defect (Forgetting `-webkit-text-fill-color`)
* **Symptom**: You added `background: linear-gradient(...)` and `-webkit-background-clip: text`, but the text renders as a standard black/gray heading with a colored box behind it!
* **Cause**: Without setting `-webkit-text-fill-color: transparent` (or `color: transparent`), the default solid font glyphs paint over the clipped background layer.
* **Fix**: Always include `-webkit-text-fill-color: transparent; color: transparent;`.

### 2. Multi-Line Gradient Chopping
* **Symptom**: A two-line title starts with bright pink on line 1, but line 2 is suddenly dull blue without transitioning smoothly.
* **Cause**: The browser calculates the gradient box across the entire bounding rectangle.
* **Fix**: Add `-webkit-box-decoration-break: clone; box-decoration-break: clone;`.

### 3. Text Shadow Masking Collision
* **Symptom**: Applying `text-shadow: 0 10px 20px rgba(...)` to a `background-clip: text` element creates an ugly shadow box or is clipped out.
* **Cause**: `background-clip: text` clips all box shadows and text decorations into the glyph boundary.
* **Fix**: Use `filter: drop-shadow(...)` on the parent container instead of `text-shadow` on the text element itself.

```css
/* ❌ BROKEN */
.gradient-title {
  -webkit-background-clip: text;
  text-shadow: 0 10px 20px #00f2fe; /* Gets clipped/distorted */
}

/* ✔️ ROBUST */
.gradient-title {
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 10px 20px rgba(0, 242, 254, 0.4));
}
```

---

## 11. Quick Reference Cheatsheet

```css
/* 1. Universal Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* 2. Alpha Gradient Fade-Out on Text */
.text-fade-right {
  -webkit-mask-image: linear-gradient(to right, black 75%, transparent 100%);
  mask-image: linear-gradient(to right, black 75%, transparent 100%);
}

/* 3. Traveling Shimmer Mask on Typography */
.shimmer-text {
  -webkit-mask-image: linear-gradient(110deg, black 40%, rgba(0,0,0,0.2) 50%, black 60%);
  mask-image: linear-gradient(110deg, black 40%, rgba(0,0,0,0.2) 50%, black 60%);
  -webkit-mask-size: 200% 100%;
  mask-size: 200% 100%;
  animation: sweep 3s infinite;
}

/* 4. Inverted Stencil Cutout with SVG */
.stencil-container {
  -webkit-mask: url(#svg-text-mask-id);
  mask: url(#svg-text-mask-id);
}

/* 5. Accessible High Contrast Reset */
@media (forced-colors: active) {
  .gradient-text {
    -webkit-text-fill-color: CanvasText;
    color: CanvasText;
  }
}
```
