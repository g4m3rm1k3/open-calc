---
concept: 049-gradient-mask
name: Gradient Masks in Modern CSS
category: CSS Visual Effects & Compositing
difficulty: Intermediate to Advanced
tags: [css, mask-image, gradient-mask, webkit-mask, linear-gradient, radial-gradient, conic-gradient, visual-effects, compositing, modern-css]
---

# 049: CSS Gradient Mask Masterclass

## Overview

In modern web design, controlling the visible silhouette, edge softness, and transparency gradients of elements is essential for creating high-end, polished user interfaces. While properties like `opacity` apply a uniform transparency across an entire element and `clip-path` creates sharp, binary geometric cutouts, **CSS Gradient Masking** (`mask-image`) provides **per-pixel alpha channel control**.

By compositing a CSS gradient over an element, you can smoothly fade out content, create dynamic vignettes, design seamless carousel edges, build glowing spotlight hover states, and craft hardware-accelerated shimmer animations—all purely in CSS without modifying underlying images or relying on canvas/SVG hacks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CSS MASKING PIPELINE                                │
│                                                                             │
│   Source Element            Mask Gradient (Alpha Map)       Rendered Output │
│   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐  │
│   │ Content, Text,   │      │ Alpha: 1.0 (Opaq)│      │ Fully Visible    │  │
│   │ Image, Video, or │  +   │        │         │  =   │        │         │  │
│   │ Container Grid   │      │        ▼         │      │ Soft Falloff     │  │
│   │                  │      │ Alpha: 0.0 (Trns)│      │ Faded to 0% Alpha│  │
│   └──────────────────┘      └──────────────────┘      └──────────────────┘  │
│                                                                             │
│   [The source element's pixels are multiplied by the mask's alpha channel]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Core Mechanics: How Gradient Masks Work

CSS Masking works by treating an image or gradient as a **luminance or alpha matte**:

1. **Alpha Channel Masking (Default in CSS)**: The browser reads the alpha transparency channel of the mask.
   - Where the mask gradient is **opaque** (`alpha = 1.0`, e.g., `black`, `white`, `red`), the underlying element is **100% visible**.
   - Where the mask gradient is **transparent** (`alpha = 0.0`, e.g., `transparent`, `rgba(0,0,0,0)`), the underlying element is **completely invisible**.
   - Where the mask gradient is **semi-transparent** (`0.0 < alpha < 1.0`), the underlying element is **translucent**.
2. **Color Agnosticism**: In alpha mode, the actual color hue (`black`, `white`, `blue`) does **not** matter—only the alpha value counts. However, using `black` and `transparent` is the industry standard for clarity and readability.

```
Mask Value:       rgba(0,0,0, 1.0) ─────────> rgba(0,0,0, 0.5) ─────────> rgba(0,0,0, 0.0)
Visual Result:    100% Opaque                 50% Translucent             0% (Invisible)
```

---

## 2. Essential CSS Mask Properties Suite

The CSS Masking Module Level 1 defines a comprehensive suite of properties analogous to the `background-*` property family:

| Property | Standard Syntax | WebKit Prefix (Required for Safari/Blink) | Description |
| :--- | :--- | :--- | :--- |
| **Mask Image** | `mask-image` | `-webkit-mask-image` | Specifies one or more gradients or images used as masks. |
| **Mask Size** | `mask-size` | `-webkit-mask-size` | Sets the dimensions of the mask layer (`cover`, `contain`, explicit `px`/`%`). |
| **Mask Repeat** | `mask-repeat` | `-webkit-mask-repeat` | Controls tiling (`no-repeat`, `repeat`, `repeat-x`, `repeat-y`). |
| **Mask Position** | `mask-position` | `-webkit-mask-position` | Sets the initial position of the mask layer (`center`, `top left`, `50% 100%`). |
| **Mask Mode** | `mask-mode` | `-webkit-mask-mode` | Determines whether the mask uses `alpha` or `luminance` values. |
| **Mask Composite** | `mask-composite` | `-webkit-mask-composite` | Defines how multiple mask layers combine (`add`, `subtract`, `intersect`, `exclude`). |
| **Mask Shorthand** | `mask` | `-webkit-mask` | Shorthand declaring image, position, size, repeat, and composite in one rule. |

> [!IMPORTANT]
> **Vendor Prefixing Requirement**: While CSS Masking is widely standardized, Chromium (Chrome, Edge, Opera, Brave) and WebKit (Safari, iOS Browsers) still require the `-webkit-` prefix for complete property support. Always declare both `-webkit-mask-*` and standard `mask-*` rules in your stylesheets.

```css
/* Cross-Browser Safe Declaration Pattern */
.masked-element {
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

---

## 3. The 7 Essential Gradient Mask Patterns

---

### Pattern 1: Scroll Overflow Indicator & Text Fade-Out ("Read More" Teaser)

#### The Problem
Truncating lengthy articles or dashboard comment cards with `overflow: hidden` or `text-overflow: ellipsis` creates abrupt visual cutoffs. A soft bottom gradient fade signals that more content exists beneath the fold.

```
┌─────────────────────────────────────────────────────────┐
│ Card Header                                             │
│ Lorem ipsum dolor sit amet, consectetur adipiscing elit.│  <── 100% Opaque
│ Pellentesque habitant morbi tristique senectus et netus │
│ et malesuada fames ac turpis egestas. Vestibulum tortor │  <── Fade Begins
│ . . . . . . . . . . . . . . . . . . . . . . . . . . . . │  <── 50% Alpha
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <── 0% Alpha (Hidden)
└─────────────────────────────────────────────────────────┘
```

#### HTML
```html
<article class="preview-card">
  <h3 class="card-title">System Architecture Overview</h3>
  <div class="card-content-fade">
    <p>
      The core processing engine distributes incoming event streams across
      clustered node worker pools using partition keys. When memory pressure
      reaches the 85% watermark, backpressure propagation signals upstream
      ingestion pipelines to throttle batch submissions.
    </p>
    <p>
      Worker health checks run on a 500ms heartbeat. Unresponsive partitions
      trigger autonomous failover migration to standby replicas within 1.2
      seconds, guaranteeing zero data loss under Byzantine fault conditions.
    </p>
  </div>
  <button class="expand-btn" type="button">Read Full Telemetry Report</button>
</article>
```

#### CSS
```css
.preview-card {
  max-width: 480px;
  padding: 1.5rem;
  background: #1e1e24;
  border-radius: 12px;
  border: 1px solid #2e2e38;
  color: #e2e8f0;
  font-family: system-ui, -apple-system, sans-serif;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #ffffff;
}

.card-content-fade {
  max-height: 120px;
  overflow: hidden;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #94a3b8;

  /* Linear Gradient Mask: Solid black for top 50%, fading to transparent at bottom */
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 40%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 40%,
    transparent 100%
  );

  transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              -webkit-mask-image 0.4s ease,
              mask-image 0.4s ease;
}

/* Expanded state removes the mask fade */
.preview-card.is-expanded .card-content-fade {
  max-height: 500px;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 100%);
  mask-image: linear-gradient(to bottom, black 0%, black 100%);
}

.expand-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.expand-btn:hover {
  background: #2563eb;
}
```

#### Mechanical Breakdown
1. `linear-gradient(to bottom, black 0%, black 40%, transparent 100%)` maintains total opacity for the first 40% of the content height.
2. From `40%` to `100%`, the alpha channel linearly transitions from `1.0` to `0.0`, dissolving the typography cleanly into whatever background lies underneath.
3. When toggling `.is-expanded`, the mask smoothly transitions to full opacity while `max-height` expands.

---

### Pattern 2: Dual Edge Fading Marquee / Infinite Carousel

#### The Problem
Scrolling carousels, partner logo ticker bars, and tag clouds abruptly terminate against container boundaries. Applying soft fading masks on both the left and right edges produces a high-end, seamless "infinity" portal effect.

```
       Left Fade                                      Right Fade
    ┌───░░▒▓██──────────────────────────────────────██▓▒░░───┐
    │ <  [Logo A]   [Logo B]   [Logo C]   [Logo D]  [Logo E] >│
    └───░░▒▓██──────────────────────────────────────██▓▒░░───┘
```

#### HTML
```html
<section class="ticker-wrapper" aria-label="Supported Integrations">
  <div class="ticker-track">
    <div class="ticker-item">PostgreSQL</div>
    <div class="ticker-item">Redis</div>
    <div class="ticker-item">GraphQL</div>
    <div class="ticker-item">Kubernetes</div>
    <div class="ticker-item">Docker</div>
    <div class="ticker-item">WebAssembly</div>
    <div class="ticker-item">TypeScript</div>
    <!-- Duplicated items for seamless marquee loop -->
    <div class="ticker-item" aria-hidden="true">PostgreSQL</div>
    <div class="ticker-item" aria-hidden="true">Redis</div>
    <div class="ticker-item" aria-hidden="true">GraphQL</div>
    <div class="ticker-item" aria-hidden="true">Kubernetes</div>
    <div class="ticker-item" aria-hidden="true">Docker</div>
    <div class="ticker-item" aria-hidden="true">WebAssembly</div>
    <div class="ticker-item" aria-hidden="true">TypeScript</div>
  </div>
</section>
```

#### CSS
```css
.ticker-wrapper {
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  overflow: hidden;
  padding: 1.5rem 0;
  background: #0f172a;
  border-radius: 12px;

  /* Multi-stop horizontal mask: transparent -> black -> black -> transparent */
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
}

.ticker-track {
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: marquee-scroll 20s linear infinite;
}

.ticker-wrapper:hover .ticker-track {
  animation-play-state: paused;
}

.ticker-item {
  padding: 0.6rem 1.25rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 9999px;
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

#### Mechanical Breakdown
- `linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)` applies two distinct gradient ramps in a single declaration:
  - Left edge: `0% (0.0 alpha)` to `12% (1.0 alpha)`.
  - Center field: `12%` to `88%` remains completely opaque (`1.0 alpha`).
  - Right edge: `88% (1.0 alpha)` to `100% (0.0 alpha)`.
- No nested overlay `div` elements with fixed background colors are required, making this component completely transparent to any background beneath it.

---

### Pattern 3: Radial Vignette & Organic Image Hero Blending

#### The Problem
Rectangular hero images often look disjointed when placed on textured or dark backgrounds. Radial gradient masking softly melts image perimeters into the background with zero hard borders.

```
       ┌──────────────────────────────────────┐
       │   ░░░▒▒▓▓██████████████████▓▓▒▒░░    │
       │  ░░▒▓████████████████████████▓▒░░    │
       │  ▒▓██████   [ HERO IMAGE ]   ████▓▒  │
       │  ░░▒▓████████████████████████▓▒░░    │
       │   ░░░▒▒▓▓██████████████████▓▓▒▒░░    │
       └──────────────────────────────────────┘
```

#### HTML
```html
<div class="hero-media-frame">
  <img 
    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
    alt="Abstract 3D rendering of generative waves" 
    class="vignette-image"
  />
  <div class="hero-caption">
    <h2>Neural Synthesis Engine</h2>
    <p>Autonomous generative visual pipelines running in WebGPU compute shaders.</p>
  </div>
</div>
```

#### CSS
```css
.hero-media-frame {
  position: relative;
  max-width: 900px;
  margin-inline: auto;
  border-radius: 16px;
  overflow: hidden;
  background: #09090b;
}

.vignette-image {
  display: block;
  width: 100%;
  height: 450px;
  object-fit: cover;

  /* Radial Mask: Full center circle, dissolving elliptically outward */
  -webkit-mask-image: radial-gradient(
    ellipse 75% 65% at 50% 50%,
    black 40%,
    transparent 95%
  );
  mask-image: radial-gradient(
    ellipse 75% 65% at 50% 50%,
    black 40%,
    transparent 95%
  );
}

.hero-caption {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  color: #fafafa;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.hero-caption h2 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.hero-caption p {
  margin: 0;
  color: #a1a1aa;
  font-size: 1.1rem;
}
```

---

### Pattern 4: Interactive Dynamic Spotlight Hover Effect

#### The Problem
Modern SaaS dashboards (e.g., Stripe, Linear, Vercel) feature cards that reveal an underlying accent grid or glowing border strictly around the user's cursor.

```
       ┌──────────────────────────────────────┐
       │ Default Card Background (Subtle)     │
       │             ╭──────────╮             │
       │             │ Cursor   │             │
       │             │ Glow Area│             │
       │             ╰──────────╯             │
       │ (Underlying high-contrast grid shown)│
       └──────────────────────────────────────┘
```

#### HTML
```html
<div class="spotlight-card" id="spotlightCard">
  <!-- The masked layer revealing the glowing gradient texture -->
  <div class="spotlight-glow" aria-hidden="true"></div>
  
  <!-- Actual content on top -->
  <div class="card-body">
    <span class="badge">Enterprise Tier</span>
    <h3>Distributed Edge Clustering</h3>
    <p>Zero-latency consensus across 35 global regions with Byzantine fault tolerance.</p>
    <div class="metrics">
      <div><strong>99.999%</strong> SLA Uptime</div>
      <div><strong>< 2ms</strong> Edge Latency</div>
    </div>
  </div>
</div>
```

#### CSS
```css
.spotlight-card {
  position: relative;
  max-width: 420px;
  padding: 2rem;
  background: #111116;
  border: 1px solid #22222a;
  border-radius: 16px;
  overflow: hidden;
  color: #f4f4f5;
  font-family: system-ui, sans-serif;
}

/* Base card body sitting above the glow */
.card-body {
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #27272a;
  color: #a1a1aa;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.spotlight-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  color: #ffffff;
}

.spotlight-card p {
  color: #71717a;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.metrics {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #a1a1aa;
}

.metrics strong {
  display: block;
  font-size: 1.1rem;
  color: #38bdf8;
}

/* The glow layer with interactive radial mask */
.spotlight-glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(
    circle 300px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(56, 189, 248, 0.4),
    rgba(168, 85, 247, 0.2) 40%,
    transparent 80%
  );
  
  /* Mask limits the glow boundary with a soft feather */
  -webkit-mask-image: radial-gradient(
    circle 220px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle 220px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    black 0%,
    transparent 100%
  );

  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.spotlight-card:hover .spotlight-glow {
  opacity: 1;
}
```

#### JavaScript for Pointer Tracking
```javascript
const card = document.getElementById('spotlightCard');

card.addEventListener('pointermove', (event) => {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
});
```

---

### Pattern 5: High-Performance Animated Shimmer / Skeleton Loader

#### The Problem
Standard CSS skeleton loaders often use complex DOM overlays or multiple pseudo-elements that trigger costly paint cycles. Animating a single gradient mask layer (`mask-position`) offers superior performance and clean markup.

```
       Frame 0%                     Frame 50%                    Frame 100%
   ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
   │██░░░▒▒▓▓█████████│   ───>  │█████████▓▓▒▒░░░██│   ───>  │██████████████████│
   └──────────────────┘         └──────────────────┘         └──────────────────┘
       [Mask at Left]              [Mask in Center]             [Mask at Right]
```

#### HTML
```html
<div class="skeleton-card" aria-busy="true" aria-label="Loading profile content">
  <div class="skeleton-avatar"></div>
  <div class="skeleton-lines">
    <div class="skeleton-line skeleton-title"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line skeleton-short"></div>
  </div>
</div>
```

#### CSS
```css
.skeleton-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #18181b;
  border-radius: 12px;
  max-width: 400px;

  /* Shimmer gradient defined as an angled mask */
  -webkit-mask-image: linear-gradient(
    110deg,
    black 30%,
    rgba(0, 0, 0, 0.25) 50%,
    black 70%
  );
  mask-image: linear-gradient(
    110deg,
    black 30%,
    rgba(0, 0, 0, 0.25) 50%,
    black 70%
  );
  
  -webkit-mask-size: 200% 100%;
  mask-size: 200% 100%;
  
  -webkit-mask-position: 100% 0;
  mask-position: 100% 0;

  animation: mask-shimmer 1.8s infinite linear;
}

@keyframes mask-shimmer {
  0% {
    -webkit-mask-position: 150% 0;
    mask-position: 150% 0;
  }
  100% {
    -webkit-mask-position: -50% 0;
    mask-position: -50% 0;
  }
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #27272a;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: center;
}

.skeleton-line {
  height: 12px;
  background: #27272a;
  border-radius: 6px;
  width: 100%;
}

.skeleton-title {
  height: 16px;
  width: 60%;
  background: #3f3f46;
}

.skeleton-short {
  width: 40%;
}
```

---

### Pattern 6: Inverted Cutout / Hole-Punch Spotlight with `mask-composite`

#### The Problem
When building onboarding product walkthroughs, modal dialog backdrops, or scanner viewfinders, you need to darken the entire viewport *except* for a highlighted circular or rounded-rectangular target area.

```
       ┌──────────────────────────────────────────────┐
       │   Opaque Dark Modal Backdrop (Alpha: 0.8)    │
       │               ╭──────────────╮               │
       │               │ Cutout Hole  │               │
       │               │ (Alpha: 0.0) │               │
       │               │ Target Element               │
       │               ╰──────────────╯               │
       │                                              │
       └──────────────────────────────────────────────┘
```

#### HTML
```html
<div class="onboarding-overlay" aria-label="Feature Highlight Backdrop">
  <!-- Cutout dynamically focused over coordinate (300px, 200px) -->
</div>
```

#### CSS
```css
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  pointer-events: none;

  /* Layer 1: Solid base covering full screen */
  /* Layer 2: Radial gradient defining the clear hole */
  -webkit-mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 90px at var(--focus-x, 50%) var(--focus-y, 40%), black 80%, transparent 100%);
  mask-image: 
    linear-gradient(black, black),
    radial-gradient(circle 90px at var(--focus-x, 50%) var(--focus-y, 40%), black 80%, transparent 100%);

  /* Subtract the radial hole from the solid base */
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}
```

#### Mask Compositing Cross-Vendor Matrix
Compositing multiple mask layers requires understanding vendor operator mappings:

| Desired Operation | Standard CSS (`mask-composite`) | WebKit Engine (`-webkit-mask-composite`) | Result |
| :--- | :--- | :--- | :--- |
| **Add / Union** | `add` | `source-over` | Combines both masks together into one coverage area. |
| **Subtract / Difference** | `subtract` | `destination-out` | Cuts the top mask shape out of the bottom mask. |
| **Intersect** | `intersect` | `source-in` | Keeps only the overlapping pixels of both masks. |
| **XOR / Exclude** | `exclude` | `xor` | Keeps everything except where both masks overlap. |

---

### Pattern 7: Conic Gradient Radar / Rotating Sweep Effect

#### The Problem
Creating radar scanners, futuristic loader indicators, or conic gauge sweeps without canvas or video assets.

```
                  12 o'clock (0% Alpha)
                         ▲
                     .───│───.
                  .─'    │    '─.
                .'       │       '.
               /         │         \
              │          │          │
    9 o'clock ├──────────┼──────────┤ 3 o'clock
              │          │          │
               \         │         /
                '.       │       .'
                  '─.    │    .─'
                     '───│───'
                         ▼
                   (100% Alpha Sweep)
```

#### HTML
```html
<div class="radar-scanner" role="progressbar" aria-label="System Scanner">
  <div class="radar-grid"></div>
  <div class="radar-sweep"></div>
</div>
```

#### CSS
```css
.radar-scanner {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: #022c22;
  border: 2px solid #059669;
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.3);
  overflow: hidden;
}

.radar-grid {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at center, transparent 30%, #059669 31%, transparent 32%, transparent 60%, #059669 61%, transparent 62%),
    linear-gradient(to right, transparent 49.5%, #059669 50%, transparent 50.5%),
    linear-gradient(to bottom, transparent 49.5%, #059669 50%, transparent 50.5%);
  opacity: 0.4;
}

.radar-sweep {
  position: absolute;
  inset: 0;
  background: #10b981;

  /* Conic gradient mask: sweeping from transparent (0deg) to full opaque (360deg) */
  -webkit-mask-image: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(0, 0, 0, 0.1) 270deg,
    black 360deg
  );
  mask-image: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(0, 0, 0, 0.1) 270deg,
    black 360deg
  );

  border-radius: 50%;
  animation: radar-spin 3s linear infinite;
}

@keyframes radar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 4. Browser Compatibility & Cross-Vendor Best Practices

### Support Status Matrix (2026 Baseline)

| Browser | `mask-image` (Standard) | `-webkit-mask-image` (Prefixed) | Notes |
| :--- | :--- | :--- | :--- |
| **Google Chrome / Chromium** | Full Support (v120+) | Full Support (v4+) | Prefix historically used; standard supported in modern versions. |
| **Apple Safari (macOS & iOS)** | Full Support (v16.4+) | Full Support (v4+) | Both supported; `-webkit-` retained for legacy compatibility. |
| **Mozilla Firefox** | Full Support (v53+) | Full Support (v78+) | Supports both prefixed and unprefixed syntax cleanly. |
| **Microsoft Edge** | Full Support (v120+) | Full Support (v79+) | Mirrors Chromium engine behavior. |

### Production Rules of Thumb

1. **Always Supply Both Declarations**: Write the `-webkit-` rule first, followed immediately by the standard unprefixed property.
2. **Beware of Property Name Aliases**: 
   - Use `-webkit-mask-size` when using `-webkit-mask-image`.
   - Use standard `mask-size` alongside standard `mask-image`.
3. **Verify Mask Modes**: If using SVG masks, explicitly set `mask-mode: alpha;` or `-webkit-mask-source-type: alpha;` to avoid luminance mismatches between browser engines.

```css
/* Production-Ready Dual Declaration Template */
.selector {
  /* 1. WebKit Prefix */
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  /* 2. Standard CSS */
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-position: center;
}
```

---

## 5. Performance, Hardware Acceleration & Compositing

Gradient masks alter the rendering pipeline of the browser. Understanding the underlying mechanics prevents layout jank and high GPU memory consumption:

```
DOM Mutation / Scroll
       │
       ▼
1. Recalculate Styles
       │
       ▼
2. Layout (Geometry & Flow)
       │
       ▼
3. Paint (Draw commands recorded to display lists)
       │
       ▼
4. Composite & Masking Phase  <── [GPU Shader applies Alpha Multiply]
       │
       ▼
Rendered Frame on Screen
```

### Performance Golden Rules

1. **Promote Masked Animated Layers to GPU**:
   When animating `mask-position` or rotating elements with complex masks, hint the browser using `will-change`:
   ```css
   .animated-masked-layer {
     will-change: mask-position, -webkit-mask-position;
     transform: translateZ(0); /* Force discrete stacking compositing layer */
   }
   ```
2. **Avoid Masking Giant Non-Composited Canvases**: Masking an element forces the browser to create an offscreen drawing buffer. Keep masked element dimensions constrained to what is visible in the viewport.
3. **Prefer Vector Math Stops Over Pixel-Heavy PNG Masks**: CSS gradients (`linear-gradient`, `radial-gradient`) are computed natively in shader math with virtually zero texture upload overhead compared to high-resolution PNG alpha masks.

---

## 6. Accessibility & Progressive Enhancement

### Graceful Fallback Strategy
Not all legacy environments or printing engines execute CSS mask compositing. Use `@supports` queries to apply sensible fallback styling:

```css
/* Fallback: Standard solid layout */
.card-content-fade {
  max-height: 140px;
  overflow: hidden;
  position: relative;
}

/* Progressive Enhancement: Apply gradient mask only when supported */
@supports ((-webkit-mask-image: none) or (mask-image: none)) {
  .card-content-fade {
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  }
}
```

### High Contrast & Motion Safety (`forced-colors` & `prefers-reduced-motion`)

1. **High Contrast Mode (`forced-colors: active`)**:
   Users with visual impairments often enable Windows High Contrast or system high-contrast color schemes. In this mode, delicate gradient fades can make text illegible.
   ```css
   @media (forced-colors: active) {
     .card-content-fade,
     .ticker-wrapper,
     .vignette-image {
       -webkit-mask-image: none !important;
       mask-image: none !important;
     }
   }
   ```

2. **Reduced Motion (`prefers-reduced-motion: reduce`)**:
   Disable automated mask translation animations for users sensitive to vestibular motion triggers:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .skeleton-card,
     .radar-sweep,
     .ticker-track {
       animation: none !important;
     }
   }
   ```

---

## 7. Common Pitfalls & How to Avoid Them

### Pitfall 1: Interactive Pointer Events on Transparent Masked Regions
**Symptom**: Buttons or links hidden beneath a `transparent` section of a gradient mask can still be clicked, or transparent regions block clicks to elements underneath.  
**Cause**: CSS masks only alter **visual pixel alpha**; they do **not** alter the DOM bounding box or click hit-testing geometry.  
**Solution**: Use `pointer-events: none;` on masked overlay wrappers, or apply `pointer-events: auto;` specifically to active interactive child buttons.

### Pitfall 2: Forgetting That Gradient Stop Colors Default to Black
**Symptom**: Writing `linear-gradient(to bottom, transparent, white)` and seeing unexpected white fringe artifacts on dark backgrounds.  
**Cause**: In CSS, `transparent` is actually `rgba(0, 0, 0, 0)` (transparent black). Interpolating from `transparent black` to `solid white` causes midpoint dirty grayish tones.  
**Solution**: Keep colors identical and vary only the alpha channel:
```css
/* Risky (Color transition occurs during fade) */
mask-image: linear-gradient(to bottom, transparent, white);

/* Bulletproof (Pure alpha transition) */
mask-image: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1));
/* or simply */
mask-image: linear-gradient(to bottom, transparent, black);
```

### Pitfall 3: Subgrid / Flexbox Child Stacking Context Bugs
**Symptom**: Applying `mask-image` to a container clips sticky children or breaks `z-index` layering with parent elements.  
**Cause**: Applying `mask-image` (or `-webkit-mask-image`) creates a **new Stacking Context** and a **containing block for fixed positioned descendants**, identical to `opacity < 1` or `transform`.  
**Solution**: Move fixed or sticky child elements outside the masked container in the DOM hierarchy.

---

## 8. Summary & Quick Reference Cheat Sheet

```css
/* ==========================================================================
   CSS GRADIENT MASK CHEAT SHEET
   ========================================================================== */

/* 1. Single Direction Bottom Fade (Text Read-More) */
.mask-fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

/* 2. Dual Horizontal Edge Fade (Infinite Carousel) */
.mask-fade-horizontal {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

/* 3. Four-Corner Soft Vignette (Photos & Maps) */
.mask-vignette-radial {
  -webkit-mask-image: radial-gradient(ellipse at center, black 50%, transparent 95%);
  mask-image: radial-gradient(ellipse at center, black 50%, transparent 95%);
}

/* 4. Interactive Spotlight Cursor Hole */
.mask-spotlight {
  -webkit-mask-image: radial-gradient(circle 200px at var(--x) var(--y), black 0%, transparent 100%);
  mask-image: radial-gradient(circle 200px at var(--x) var(--y), black 0%, transparent 100%);
}

/* 5. Inverted Cutout (Modal Spotlight Window) */
.mask-inverted-hole {
  -webkit-mask-image: linear-gradient(black, black), radial-gradient(circle 100px at 50% 50%, black 100%, transparent 100%);
  mask-image: linear-gradient(black, black), radial-gradient(circle 100px at 50% 50%, black 100%, transparent 100%);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}
```
