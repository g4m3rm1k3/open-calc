---
concept: 056-diagonal-cards
name: CSS Diagonal Cards
category: CSS UI Patterns, Geometric Layouts & Visual Effects
difficulty: Intermediate to Advanced
tags: [css, diagonal-cards, clip-path, transform, skew, rotate, linear-gradient, pseudo-elements, grid, flexbox, visual-effects, modern-css, interactive-ui, animations, oklch]
---

# 056: CSS Diagonal Cards Masterclass

## Overview & Metadata

| Property | Details |
| :--- | :--- |
| **Concept Name** | CSS Diagonal Cards (Angled, Skewed, Clipped & Cascading Cards) |
| **Category** | UI Patterns, Geometric Layouts & Visual Effects |
| **Specification** | [W3C CSS Transforms Module Level 2](https://www.w3.org/TR/css-transforms-2/) / [CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) / [CSS Values Level 4](https://www.w3.org/TR/css-values-4/) |
| **Difficulty** | Intermediate to Advanced (3.8 / 5) |
| **What it produces** | High-impact UI cards featuring angled edges, diagonal section dividers, skewed parallelogram silhouettes, fanned card decks, isometric perspective layouts, and dynamic diagonal hover reveals—breaking the monotony of traditional rectangular card grids. |
| **Why it works** | Modern CSS provides geometric transform matrices (`skewX()`, `skewY()`, `rotateZ()`), vector clipping paths (`clip-path: polygon()`), angled gradient color-stops, and 3D stacking contexts that alter visual geometry while maintaining semantic DOM structure and crisp typography. |
| **Required CSS Concepts** | CSS Transforms (`skew`, `rotate`, `translate3d`), `clip-path: polygon()`, CSS Pseudo-elements (`::before`, `::after`), `transform-origin`, Counter-Transforms, Stacking Contexts & `z-index`, `filter: drop-shadow()`, CSS Custom Properties, Trigonometric functions (`tan()`, `atan()`), Container Queries (`@container`). |

```
================================================================================
                    THE MENTAL MODEL OF DIAGONAL CARDS
================================================================================

 1. CLIP-PATH SLICING                 2. SKEW & COUNTER-SKEW
 ┌───────────────────────────┐        ┌───────────────────────────┐
 │                           │ ╱      │  \                     \  │
 │     Card Content Area     │╱       │   \  Inner Content      \ │ (Counter-
 │                           │        │    \ (Upright Text)      \│  skewed)
 └───────────────────────────┘        └─────\─────────────────────\
 (Vector polygon cut)                 (Geometric shear angle: -12deg)

 3. ANGLED PSEUDO-ELEMENT             4. FANNED / ROTATED DECK
 ┌───────────────────────────┐              ┌─────────┐
 │ ░░░░░░░░░░░░░░░░░░░░░░░░╱ │           ┌──│ Card 2  │──┐
 │ ░ Angled Background ░░░╱  │          ┌──│ └─────────┘ │──┐
 │ Content unaffected    ╱   │          │  │ Card 1      │  │ Card 3
 └───────────────────────────┘          └──│ (0deg)      │──┘
 (Independent decorative layer)            └─────────────┘
                                           (-10deg)   (+10deg)
```

---

## 1. Anatomy & Architectural Comparison of Techniques

Creating diagonal cards can be achieved through five distinct CSS architectural strategies. Choosing the optimal technique depends on border requirements, drop shadows, responsive flexibility, and interactive states.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DIAGONAL CARD IMPLEMENTATION TAXONOMY                    │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Strategy          │ Primary Mechanism │ Shadow Support    │ Best Use Case   │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 1. Polygon Clip   │ `clip-path:       │ Requires `filter: │ Split imagery,  │
│    Path           │   polygon(...)`   │ drop-shadow()`    │ angled headers  │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 2. Skew & Counter │ `transform:       │ Standard `box-    │ Parallelogram   │
│    Skew           │   skewX(θ)`       │ shadow` works     │ pricing tables  │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 3. Pseudo-Element │ `::before` with   │ Standard `box-    │ Decorative color│
│    Backdrop       │   skew or clip    │ shadow` on parent │ accents/badges  │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 4. Angled         │ `linear-gradient( │ Standard `box-    │ High-performance│
│    Gradients      │   135deg, ...)`   │ shadow` works     │ zero-DOM splits │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 5. Rotated Deck / │ `transform:       │ Full 3D shadows & │ Interactive fan │
│    Isometric Stack│   rotate(θ)`      │ perspective depth │ decks & galleries│
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

---

## 2. Mathematical & Trigonometric Foundations

Precision in diagonal layouts prevents content clipping, unexpected gaps, and jagged rendering.

```
                     w (Card Width)
     ┌─────────────────────────────────────────┐
     │                                         │
     │                                         │
   h │                 CARD BODY               │
     │                                         │
     ├─────────────────────────────────────────┴──┐
     │ ╲ θ (Angle of slope)                       │
     │   ╲                                        │ Δy = w × tan(θ)
     │     ╲                                      │
     └───────┴────────────────────────────────────┘
```

### 2.1 The Vertical Offset Formula

Given a card of width $w$ and a desired diagonal angle $\theta$:
$$\Delta y = w \times \tan(\theta)$$

In modern CSS, this can be calculated dynamically using CSS trigonometric functions:

```css
:root {
  --card-width: 320px;
  --angle-deg: 8deg;
  /* In CSS Values 4 supported browsers: */
  --angle-offset: calc(var(--card-width) * tan(var(--angle-deg)));
}
```

### 2.2 Content-Safety Boundary Calculation

When an edge is sliced at an angle, the usable vertical content height decreases at the acute corner. To avoid text overlapping the diagonal boundary, apply directional padding:

$$\text{Safe Bottom Padding} = \text{Base Padding} + \Delta y$$

```css
.diagonal-card {
  --slope-height: 48px;
  padding-block-start: 2rem;
  padding-inline: 1.5rem;
  padding-block-end: calc(2rem + var(--slope-height));
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--slope-height)), 0 100%);
}
```

---

## 3. Technique Deep-Dives & Production Patterns

---

### Technique 1: Vector `clip-path: polygon()` Diagonal Slicing

Vector clipping cuts the element along arbitrary polygonal vertices without altering the coordinate system of inner text.

```
 Vertex 1 (0% 0%)                         Vertex 2 (100% 0%)
        ┌─────────────────────────────────────────┐
        │                                         │
        │             CARD CONTENT                │
        │                                         │
        │                                         │
        └─────────────────────────────────────────┐ Vertex 3 (100% calc(100% - 40px))
 Vertex 4 (0% 100%)                       ▲
        ▲                                 │ Sliced slope (40px)
        └─────────────────────────────────┘
```

#### CSS Implementation

```css
/* Card Container */
.clip-diagonal-card {
  position: relative;
  background: oklch(0.2 0.04 260);
  color: oklch(0.95 0.01 260);
  border-radius: 16px; /* Note: clip-path will cut off standard border-radius at clipped corners */
  overflow: hidden;
  
  /* Sliced diagonal bottom */
  clip-path: polygon(
    0 0,                                   /* Top-Left */
    100% 0,                                /* Top-Right */
    100% calc(100% - var(--slope, 40px)),  /* Angled Right Bottom */
    0 100%                                 /* Bottom-Left */
  );

  /* Drop shadows on clipped elements require filter: drop-shadow on parent/wrapper */
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
  transition: clip-path 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.clip-diagonal-card:hover {
  /* Dynamic morphing slope on hover */
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - (var(--slope, 40px) * 1.5)),
    0 100%
  );
}
```

> [!IMPORTANT]
> **The Shadow Dilemma**: Standard `box-shadow` is clipped and made invisible by `clip-path`. You **must** apply `filter: drop-shadow()` to a parent wrapper, or apply the clip-path to an inner background `::before` pseudo-element instead of the container root.

---

### Technique 2: Skew & Counter-Skew Architecture (`transform: skewX`)

The skew method shears the card container into a sleek parallelogram. Counter-skewing the child content restores horizontal upright text and media.

```
       ORIGINAL BOX                   SKEWED PARENT             COUNTER-SKEWED INNER
 ┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
 │                      │        │ \                  \ │        │   ┌──────────────┐   │
 │    Lorem Ipsum       │  ───►  │  \   Lorem Ipsum    \│  ───►  │   │ Lorem Ipsum  │   │
 │                      │        │   \                  \        │   └──────────────┘   │
 └──────────────────────┘        └────\──────────────────\       └──────────────────────┘
                                  transform: skewX(-12deg)         transform: skewX(12deg)
```

#### Structural HTML

```html
<article class="skew-card">
  <div class="skew-card__inner">
    <span class="skew-card__tag">Pro Plan</span>
    <h3 class="skew-card__title">Enterprise Cloud</h3>
    <p class="skew-card__desc">High-concurrency distributed compute engine with instant provisioning.</p>
    <button class="skew-card__cta" type="button">Deploy Node</button>
  </div>
</article>
```

#### CSS Implementation

```css
:root {
  --card-skew-angle: -10deg;
}

/* Skewed Outer Shell */
.skew-card {
  --skew: var(--card-skew-angle);
  position: relative;
  width: 320px;
  background: linear-gradient(135deg, oklch(0.25 0.05 280), oklch(0.18 0.03 280));
  border: 1px solid oklch(0.4 0.1 280 / 0.4);
  border-radius: 12px;
  transform: skewX(var(--skew));
  transform-origin: center center;
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.5);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
  will-change: transform;
}

/* Counter-Skewed Inner Content (Restores Upright Geometry) */
.skew-card__inner {
  transform: skewX(calc(var(--skew) * -1));
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Smooth Interactive Expansion */
.skew-card:hover {
  transform: skewX(calc(var(--skew) * 0.5)) translateY(-8px) scale(1.02);
  border-color: oklch(0.65 0.22 280);
  box-shadow: 0 24px 48px -12px oklch(0.65 0.22 280 / 0.35);
}

.skew-card:hover .skew-card__inner {
  transform: skewX(calc(var(--skew) * -0.5));
}
```

---

### Technique 3: Angled Pseudo-Element Slices & Split Headers

This non-destructive pattern places angled visual elements in `::before` and `::after` layers. The card container remains a standard rectangular box with full `border-radius`, `box-shadow`, and overflow containment.

```
 ┌─────────────────────────────────────────┐ ◄── Card Root (Unskewed, border-radius intact)
 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 │ ░░░░░░░ IMAGE / HEADER BANNER ░░░░░░░░░ │
 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 │ ╲                                       │ ◄── Angled cut on ::after overlay
 │   ╲─────────────────────────────────────│
 │                                         │
 │        Primary Body Typography          │
 │                                         │
 └─────────────────────────────────────────┘
```

#### CSS Implementation

```css
.split-diagonal-card {
  position: relative;
  width: 340px;
  background: oklch(0.16 0.02 250);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
  border: 1px solid oklch(0.3 0.04 250 / 0.5);
}

/* Image Header Container */
.split-diagonal-card__media {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.split-diagonal-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Angled Bottom Divider via Pseudo-Element */
.split-diagonal-card__media::after {
  content: '';
  position: absolute;
  inset-inline: -10%;
  bottom: -2px;
  height: 60px;
  background: oklch(0.16 0.02 250);
  transform: rotate(-5deg);
  transform-origin: bottom right;
  transition: transform 0.35s ease;
}

.split-diagonal-card:hover .split-diagonal-card__media::after {
  transform: rotate(-8deg) scaleY(1.2);
}

.split-diagonal-card__content {
  position: relative;
  z-index: 1;
  padding: 1.5rem 2rem 2rem;
}
```

---

### Technique 4: High-Performance Diagonal Gradients (Zero Extra DOM)

Using hard-stop linear gradients creates razor-sharp diagonal color splits on a single DOM element without transform overhead or layout recalculations.

```
 0% 0%                                  100% 0%
 ┌─────────────────────────────────────────┐
 │ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ ╱ │
 │ █ █ Accent Gradient (Primary) █ █ █ ╱   │
 │ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ ╱     │  Angle: 135deg
 │ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ ╱       │  Hard stop at 45%
 │                               ╱         │
 │     Dark Surface (Base)      ╱          │
 └─────────────────────────────╱───────────┘
 0% 100%                                100% 100%
```

#### CSS Anti-Aliasing Subpixel Technique

> [!TIP]
> **Eliminating Jagged Gradient Edges**: A pure hard stop like `oklch(...) 50%, oklch(...) 50%` creates staircase pixel artifacts on non-Retina displays. Adding a `0.5px` or `0.1%` smoothing delta ensures smooth anti-aliased diagonal boundary rendering.

```css
.gradient-diagonal-card {
  width: 320px;
  padding: 2rem;
  border-radius: 16px;
  
  /* Anti-aliased 135-degree diagonal split */
  background: linear-gradient(
    135deg,
    oklch(0.55 0.25 300) 0%,
    oklch(0.45 0.22 280) calc(40% - 0.5px),
    oklch(0.18 0.03 260) calc(40% + 0.5px),
    oklch(0.14 0.02 260) 100%
  );
  
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  color: #ffffff;
}
```

---

### Technique 5: Fanned & Cascading Diagonal Deck (`transform: rotate`)

Organizes multiple cards into an interactive stacked deck where each card rests at a calculated diagonal angle and fans out on hover or focus.

```
       RESTING STACK (Cascading Arc)                 HOVERED FAN OUT
             ┌───────────┐                         ┌───────────┐
         ┌───│  Card 3   │───┐              ┌──────│  Card 2   │──────┐
     ┌───│   └───────────┘   │───┐       ┌──│      └───────────┘      │──┐
     │   │      Card 2       │   │       │  │ Card 1             Card 3│  │
     └───│      (0deg)       │───┘       └──│ (-18deg)          (+18deg)│──┘
         └───────────────────┘              └─────────────────────────┘
        Card 1 (-6°)  Card 3 (+6°)
```

#### CSS Implementation

```css
.card-deck {
  position: relative;
  width: 300px;
  height: 420px;
  margin-inline: auto;
  perspective: 1000px;
}

.deck-card {
  --i: 0; /* Index from 0 to 2 */
  --base-angle: 8deg;
  --angle: calc((var(--i) - 1) * var(--base-angle));
  --offset-x: calc((var(--i) - 1) * 24px);

  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: oklch(0.22 0.04 260);
  border: 1px solid oklch(0.4 0.08 260 / 0.4);
  padding: 2rem;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);

  transform: translateX(var(--offset-x)) rotateZ(var(--angle));
  transform-origin: 50% 120%;
  transition: transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              box-shadow 0.3s ease,
              z-index 0s 0.1s;
  z-index: var(--i);
  cursor: pointer;
}

/* Hover Deck Spreading Interaction */
.card-deck:hover .deck-card {
  --base-angle: 18deg;
  --offset-x: calc((var(--i) - 1) * 80px);
}

.card-deck .deck-card:hover {
  transform: translateX(calc((var(--i) - 1) * 80px)) translateY(-24px) rotateZ(0deg) scale(1.05);
  z-index: 10;
  box-shadow: 0 28px 56px -12px oklch(0.6 0.2 260 / 0.4);
  border-color: oklch(0.65 0.22 260);
}
```

---

## 4. Complete Interactive Showcase (All 5 Techniques)

Below is an interactive, fully contained HTML and CSS demonstration file featuring the five distinct diagonal card variations styled with modern tokens, glassmorphism, animated accents, and responsive layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Diagonal Cards Masterclass</title>
  <style>
    /* ==========================================================================
       1. DESIGN SYSTEM & TOKENS
       ========================================================================== */
    :root {
      --bg-canvas: oklch(0.12 0.02 260);
      --bg-surface: oklch(0.18 0.03 260);
      --bg-surface-raised: oklch(0.22 0.04 260);
      
      --text-primary: oklch(0.98 0.01 260);
      --text-secondary: oklch(0.75 0.03 260);
      --text-muted: oklch(0.55 0.02 260);

      --accent-cyan: oklch(0.78 0.18 195);
      --accent-purple: oklch(0.68 0.24 300);
      --accent-amber: oklch(0.82 0.18 75);
      --accent-emerald: oklch(0.76 0.20 150);

      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 22px;

      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      background-color: var(--bg-canvas);
      background-image: 
        radial-gradient(at 0% 0%, oklch(0.2 0.08 260 / 0.5) 0px, transparent 50%),
        radial-gradient(at 100% 100%, oklch(0.18 0.08 310 / 0.4) 0px, transparent 50%);
      color: var(--text-primary);
      font-family: var(--font-sans);
      padding: 4rem 2rem;
      line-height: 1.6;
    }

    .container {
      max-width: 1280px;
      margin-inline: auto;
      display: flex;
      flex-direction: column;
      gap: 5rem;
    }

    header {
      text-align: center;
      max-width: 720px;
      margin-inline: auto;
    }

    header h1 {
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text-primary), var(--accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }

    header p {
      color: var(--text-secondary);
      font-size: 1.125rem;
    }

    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
      align-items: start;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 24px;
      background: var(--accent-cyan);
      border-radius: 4px;
      transform: skewX(-15deg);
    }

    /* Common Typography / Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      width: fit-content;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 0.925rem;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s ease, filter 0.2s ease;
    }

    .btn:hover {
      filter: brightness(1.15);
      transform: translateY(-2px);
    }

    /* ==========================================================================
       DEMO 1: CYBERPUNK ANGLED CLIP-PATH CARD
       ========================================================================== */
    .card-clip-wrapper {
      filter: drop-shadow(0 16px 32px rgba(0, 0, 0, 0.45));
    }

    .card-clip {
      position: relative;
      background: var(--bg-surface);
      color: var(--text-primary);
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      
      /* Multi-angle Polygon Cut */
      clip-path: polygon(
        0 0,
        calc(100% - 32px) 0,
        100% 32px,
        100% 100%,
        32px 100%,
        0 calc(100% - 32px)
      );
      
      border-left: 3px solid var(--accent-cyan);
      transition: transform 0.3s ease, background-color 0.3s ease;
    }

    .card-clip::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, transparent 50%, var(--accent-cyan) 50%);
    }

    .card-clip:hover {
      transform: translateY(-6px);
      background: var(--bg-surface-raised);
    }

    .card-clip .badge {
      background: oklch(0.78 0.18 195 / 0.15);
      color: var(--accent-cyan);
      border: 1px solid oklch(0.78 0.18 195 / 0.3);
    }

    /* ==========================================================================
       DEMO 2: SKEWED PARALLELOGRAM PRICING CARD
       ========================================================================== */
    .card-skew {
      --skew-deg: -10deg;
      position: relative;
      background: linear-gradient(160deg, oklch(0.24 0.05 300), oklch(0.18 0.03 280));
      border: 1px solid oklch(0.45 0.15 300 / 0.4);
      border-radius: var(--radius-md);
      transform: skewX(var(--skew-deg));
      transform-origin: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
    }

    .card-skew__content {
      transform: skewX(calc(var(--skew-deg) * -1));
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .card-skew:hover {
      transform: skewX(calc(var(--skew-deg) * 0.4)) translateY(-8px);
      border-color: var(--accent-purple);
      box-shadow: 0 24px 48px -8px oklch(0.68 0.24 300 / 0.3);
    }

    .card-skew:hover .card-skew__content {
      transform: skewX(calc(var(--skew-deg) * -0.4));
    }

    .price-value {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .price-value span {
      font-size: 1rem;
      font-weight: 400;
      color: var(--text-muted);
    }

    /* ==========================================================================
       DEMO 3: DIAGONAL SPLIT MEDIA CARD (PSEUDO-ELEMENT)
       ========================================================================== */
    .card-split {
      position: relative;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid oklch(0.3 0.04 260 / 0.5);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }

    .card-split:hover {
      transform: translateY(-6px);
    }

    .card-split__media {
      position: relative;
      height: 180px;
      background: linear-gradient(135deg, oklch(0.5 0.2 150), oklch(0.3 0.15 200));
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 1.5rem;
    }

    /* Angled cutting wedge */
    .card-split__media::after {
      content: '';
      position: absolute;
      left: -10%;
      right: -10%;
      bottom: -15px;
      height: 50px;
      background: var(--bg-surface);
      transform: rotate(-6deg);
      transform-origin: bottom right;
      transition: transform 0.35s ease;
    }

    .card-split:hover .card-split__media::after {
      transform: rotate(-9deg) scaleY(1.3);
    }

    .card-split__body {
      position: relative;
      z-index: 1;
      padding: 1.5rem 2rem 2.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ==========================================================================
       DEMO 4: ZERO-DOM DIAGONAL GRADIENT CARD
       ========================================================================== */
    .card-gradient {
      position: relative;
      padding: 2.5rem 2rem;
      border-radius: var(--radius-lg);
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      
      /* Hard-Stop Diagonal Gradient with Anti-Aliasing Guard */
      background: linear-gradient(
        135deg,
        oklch(0.7 0.2 75) 0%,
        oklch(0.6 0.2 60) calc(32% - 0.5px),
        var(--bg-surface) calc(32% + 0.5px),
        var(--bg-surface) 100%
      );
      
      border: 1px solid oklch(0.35 0.06 75 / 0.3);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card-gradient:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px -10px oklch(0.7 0.2 75 / 0.25);
    }

    /* ==========================================================================
       DEMO 5: INTERACTIVE FANNED DIAGONAL DECK
       ========================================================================== */
    .deck-container {
      position: relative;
      height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .deck {
      position: relative;
      width: 260px;
      height: 340px;
    }

    .deck-item {
      --angle: 0deg;
      --shift-x: 0px;
      --shift-y: 0px;

      position: absolute;
      inset: 0;
      border-radius: var(--radius-md);
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid oklch(0.4 0.08 260 / 0.4);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
      
      transform: translate(var(--shift-x), var(--shift-y)) rotateZ(var(--angle));
      transform-origin: center 110%;
      transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.3s ease;
      cursor: pointer;
    }

    .deck-item:nth-child(1) {
      --angle: -8deg;
      --shift-x: -24px;
      background: oklch(0.2 0.04 260);
      z-index: 1;
    }

    .deck-item:nth-child(2) {
      --angle: 0deg;
      --shift-x: 0px;
      background: oklch(0.24 0.05 280);
      z-index: 2;
    }

    .deck-item:nth-child(3) {
      --angle: 8deg;
      --shift-x: 24px;
      background: oklch(0.28 0.06 300);
      z-index: 3;
    }

    /* Fan out on deck hover */
    .deck-container:hover .deck-item:nth-child(1) {
      --angle: -18deg;
      --shift-x: -70px;
      --shift-y: 10px;
    }

    .deck-container:hover .deck-item:nth-child(3) {
      --angle: 18deg;
      --shift-x: 70px;
      --shift-y: 10px;
    }

    .deck-item:hover {
      transform: translate(var(--shift-x), -20px) rotateZ(0deg) scale(1.06) !important;
      z-index: 10 !important;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
      border-color: var(--accent-cyan);
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <h1>CSS Diagonal Cards</h1>
      <p>Modern geometric layouts leveraging vector clipping paths, transform shearing, angled split viewports, and fanned deck architectures.</p>
    </header>

    <div class="showcase-grid">

      <!-- 1. Clip Path Card -->
      <section>
        <h2 class="section-title">Polygon Clip-Path</h2>
        <div class="card-clip-wrapper">
          <article class="card-clip">
            <span class="badge">Tactical Edge</span>
            <h3>Neural Pipeline</h3>
            <p style="color: var(--text-secondary); font-size: 0.925rem;">
              Geometric vertex clipping creating bespoke cyberpunk chamfers and diagonal corner facets.
            </p>
            <button class="btn" style="background: var(--accent-cyan); color: #000;" type="button">
              Execute Model
            </button>
          </article>
        </div>
      </section>

      <!-- 2. Skew Card -->
      <section>
        <h2 class="section-title">Skew & Counter-Skew</h2>
        <article class="card-skew">
          <div class="card-skew__content">
            <span class="badge" style="background: oklch(0.68 0.24 300 / 0.2); color: var(--accent-purple);">
              Pro Tier
            </span>
            <div class="price-value">$49<span>/mo</span></div>
            <p style="color: var(--text-secondary); font-size: 0.925rem;">
              True parallelogram card chassis with counter-skewed text preserving strict horizontal legibility.
            </p>
            <button class="btn" style="background: var(--accent-purple); color: #fff;" type="button">
              Upgrade Now
            </button>
          </div>
        </article>
      </section>

      <!-- 3. Split Media Card -->
      <section>
        <h2 class="section-title">Angled Pseudo-Divider</h2>
        <article class="card-split">
          <div class="card-split__media">
            <span>ANALYTICS</span>
          </div>
          <div class="card-split__body">
            <span class="badge" style="background: oklch(0.76 0.2 150 / 0.15); color: var(--accent-emerald);">
              Telemetry
            </span>
            <h3>Realtime Ingestion</h3>
            <p style="color: var(--text-secondary); font-size: 0.925rem;">
              Angled divider slicing the media viewport while maintaining normal rounded card borders.
            </p>
          </div>
        </article>
      </section>

      <!-- 4. Gradient Split Card -->
      <section>
        <h2 class="section-title">Diagonal Gradient</h2>
        <article class="card-gradient">
          <span class="badge" style="background: oklch(0.82 0.18 75 / 0.2); color: var(--accent-amber);">
            Zero Extra DOM
          </span>
          <h3>Hyper-Velocity Storage</h3>
          <p style="color: var(--text-secondary); font-size: 0.925rem;">
            Hard-stop angled color gradient with subpixel smoothing for instantaneous zero-overhead rendering.
          </p>
          <button class="btn" style="background: var(--accent-amber); color: #000;" type="button">
            Read Specs
          </button>
        </article>
      </section>

      <!-- 5. Fanned Deck -->
      <section>
        <h2 class="section-title">Fanned Rotated Deck</h2>
        <div class="deck-container">
          <div class="deck">
            <div class="deck-item">
              <span class="badge" style="background: rgba(255,255,255,0.1);">Alpha</span>
              <h4>Edge Compute</h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Node 01</span>
            </div>
            <div class="deck-item">
              <span class="badge" style="background: rgba(255,255,255,0.1);">Beta</span>
              <h4>Vector Cache</h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Node 02</span>
            </div>
            <div class="deck-item">
              <span class="badge" style="background: rgba(255,255,255,0.1);">Gamma</span>
              <h4>Cluster Router</h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Node 03</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

</body>
</html>
```

---

## 5. Responsive Design Strategies & Container Queries

Diagonal lines and skewed angles occupy additional horizontal and vertical space. If unconstrained, steep angles can crowd typography on mobile screens.

```
       DESKTOP (Steep 12° Slope)                    MOBILE (Reduced 4° Slope or Flat)
 ┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
 │                                      │        │                                      │
 │                                      │        │                                      │
 ├──────────────────────────────────────┴──┐     ├──────────────────────────────────────┴┐
 │ ╲                                       │     │ ╲                                     │
 └───┴─────────────────────────────────────┘     └───┴───────────────────────────────────┘
     Offset = 48px (Ample screen height)             Offset = 16px (Preserves viewport space)
```

### Fluid Responsive Angle with `clamp()` and Container Queries

```css
.responsive-diagonal-card {
  container-type: inline-size;
  container-name: card;
}

.responsive-diagonal-card__inner {
  /* Fluid diagonal height scaling between 16px and 48px */
  --slope: clamp(16px, 6cqi, 48px);
  
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - var(--slope)),
    0 100%
  );
  
  padding-block-end: calc(1.5rem + var(--slope));
}

/* Fallback / Flattening for very narrow mobile contexts */
@container card (max-width: 280px) {
  .responsive-diagonal-card__inner {
    clip-path: none;
    padding-block-end: 1.5rem;
  }
}
```

---

## 6. Accessibility, Focus States & Motion Safety

1. **Focus Outline Visibility**: Elements clipped via `clip-path` will clip standard `:focus-visible` outlines. Always apply `:focus-visible` rings with `outline-offset: -3px` or use an unclipped outer wrapper for keyboard navigation indicators.
2. **Hit-Testing & Pointer Events**: Skewed elements with `transform: skewX()` maintain rectangular bounding boxes for mouse hit testing unless paired with `clip-path`. Ensure overlapping sibling cards have appropriate `pointer-events` or spacing to prevent accidental mis-clicks.
3. **Motion Sensitivity (`prefers-reduced-motion`)**: Interactive rotation and skew hover effects must be dampened for users who have requested reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  .card-skew,
  .card-skew__content,
  .deck-item,
  .card-clip,
  .split-diagonal-card__media::after {
    transition: none !important;
    transform: none !important;
  }

  .card-skew:hover,
  .deck-container:hover .deck-item {
    transform: none !important;
  }
}
```

---

## 7. Comparative Reference Matrix

| Feature | `clip-path: polygon()` | `transform: skewX()` | Angled `::after` Divider | Angled `linear-gradient` | Rotated `rotateZ()` Deck |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DOM Overhead** | None (Single element) | 1 Inner Wrapper | 1 Media/Child Container | None (Single element) | Multi-card Parent Container |
| **Box Shadows** | Requires `filter: drop-shadow` | Native `box-shadow` works | Native `box-shadow` works | Native `box-shadow` works | Native `box-shadow` with 3D layers |
| **Border Radius** | Cut off at clipped vertices | Supported (sheared) | Fully supported | Fully supported | Fully supported |
| **Hit Testing Precision** | Exact polygon boundary | Transformed box boundary | Rectangular container | Rectangular container | Transformed box boundary |
| **Animation Cost** | Low (if vertex count constant) | Very Low (GPU accelerated) | Very Low (GPU accelerated) | Low (Paint triggered) | Very Low (GPU accelerated) |
| **Text Uprightness** | Automatic | Requires counter-skew | Automatic | Automatic | Requires counter-rotation |

---

## 8. Common Pitfalls & Troubleshooting Checklist

- [ ] **Blurry text during skew or rotate**: Add `backface-visibility: hidden` and `transform: translateZ(0)` to promote the element to a discrete GPU compositing layer.
- [ ] **Drop shadows disappeared**: If using `clip-path`, replace `box-shadow` with `filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3))` on the parent wrapper.
- [ ] **Staircase / Jagged gradient edges**: Insert a `0.5px` or `1px` transition gap between hard color stops in `linear-gradient`.
- [ ] **Focus ring cut off**: Add `outline-offset: -4px` so the outline stays inside the clipped boundary, or wrap the card in an unclipped focusable anchor.
- [ ] **Text overlapping the diagonal cut**: Calculate vertical padding as `Base Padding + (Width * tan(Angle))` to guarantee safe reading clearance.
