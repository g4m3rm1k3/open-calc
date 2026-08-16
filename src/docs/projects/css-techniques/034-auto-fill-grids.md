# 034: CSS Auto-Fill Grids Masterclass

## Overview

In modern responsive web design, crafting layouts that effortlessly adapt from narrow mobile viewports (280px) to ultra-wide desktop monitors (4K+) without writing dozens of brittle `@media` queries is one of the most sought-after capabilities.

CSS Grid provides this superpower via **`repeat(auto-fill, ...)`**. Combined with the `minmax()` function, `auto-fill` enables browsers to dynamically calculate the optimal number of grid columns that can fit inside a container and automatically adjust track counts as space expands or contracts.

This comprehensive guide breaks down the syntax, mechanics, real-world patterns, deep architectural differences between `auto-fill` and `auto-fit`, mobile-proofing strategies, and advanced modern integrations (such as CSS Container Queries and Subgrid).

---

## 1. Syntax & Core Mechanics

The foundational pattern for responsive CSS Grid layouts without media queries is:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### How the Browser Calculates Tracks

When the browser encounters `repeat(auto-fill, minmax(min_size, max_size))`:

1. **Calculates Available Width**: Measures the container's inline size minus padding and borders.
2. **Accounts for Gaps**: Deducts spacing between potential tracks based on `gap` or `column-gap`.
3. **Determines Maximum Track Count**: Divides available width by the minimum track size (`280px`) plus gap.
4. **Creates Track Slots**: Creates as many distinct column tracks as mathematically possible—**even if there are not enough grid items to fill them**.
5. **Distributes Excess Space**: If `1fr` is used as the upper bound in `minmax()`, the browser stretches all created tracks equally to absorb remaining free container space.

```
Container: 900px wide, Gap: 20px, Track Min: 280px

Step 1: 900px space available
Step 2: (Track + Gap) -> 280px + 20px = 300px per column unit
Step 3: 900px / 300px = 3 columns can fit!
Step 4: 3 tracks created @ (900px - (2 * 20px)) / 3 = 286.66px each (via 1fr)
```

---

## 2. The Deep Dive: `auto-fill` vs. `auto-fit`

The single most common source of confusion in CSS Grid track repetition is the distinction between `auto-fill` and `auto-fit`.

Both keywords automatically compute track counts, but they behave radically differently when the container has **fewer grid items than the number of available column tracks**.

### Visual Comparison (Container wide enough for 4 columns, but only 2 items present)

```
========================================================================================
1. repeat(auto-fill, minmax(200px, 1fr))  [4 tracks created, 2 items present]
+--------------------+--------------------+--------------------+--------------------+
|   Item 1 (25%)     |   Item 2 (25%)     |   [Empty Track]    |   [Empty Track]    |
|   (Holds size)     |   (Holds size)     |   (Preserves grid) |   (Preserves grid) |
+--------------------+--------------------+--------------------+--------------------+
-> Empty tracks remain open in the layout; items maintain their natural proportion.

========================================================================================
2. repeat(auto-fit, minmax(200px, 1fr))   [4 tracks calculated, empty tracks collapsed]
+-----------------------------------------+-----------------------------------------+
|              Item 1 (50%)               |              Item 2 (50%)               |
|         (Stretched to fill space)       |         (Stretched to fill space)       |
+-----------------------------------------+-----------------------------------------+
-> Empty tracks are collapsed to 0px; remaining items expand across the entire width.
========================================================================================
```

### Architectural Comparison Matrix

| Property / Feature | `auto-fill` | `auto-fit` |
| :--- | :--- | :--- |
| **Empty Track Handling** | **Preserves empty tracks** as real grid slots. | **Collapses empty tracks** down to `0px`. |
| **Item Sizing with `1fr`** | Tracks expand based on the **total potential tracks**. | Tracks expand based on the **populated tracks only**. |
| **Behavior with Few Items** | Items stay locked to their natural column slots. | Items stretch across the entire container width. |
| **Grid Line Numbers** | Generates grid lines for all potential slots (e.g. 1 to 5). | Collapses unused line numbers together at the end. |
| **Best Used For** | Product cards, toolbars, dashboards where card proportions must remain constant. | Hero banners, feature lists, tag clouds where full-width expansion is preferred. |

---

## 3. Mobile-Proofing: The `min(100%, Xpx)` Defensive Pattern

A notorious bug with `repeat(auto-fill, minmax(300px, 1fr))` occurs on small mobile screens (e.g., viewport width 280px on foldable devices) or within narrow nested sidebar panels.

If the container is narrower than the minimum size (`300px`), the grid item **cannot shrink below 300px**, triggering an unwanted horizontal scrollbar / layout overflow.

### The Problematic Rule
```css
/* ❌ Flawed: Causes horizontal overflow when container < 300px */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

### The Bulletproof Solution
By nesting CSS `min()` inside `minmax()`, the minimum bound dynamically resolves to `100%` on screens narrower than `300px`, completely eliminating overflow:

```css
/* ✅ Bulletproof: Flawlessly scales from 0px to infinite */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}
```

```
Scenario A (Desktop 1200px):
  min(100%, 300px) -> resolves to 300px -> produces 3-4 auto-filled columns.

Scenario B (Mobile 280px):
  min(100%, 300px) -> resolves to 280px (100%) -> single 280px column, zero overflow!
```

---

## 4. Real-World Practical Patterns & Demonstrations

### Pattern 1: E-Commerce Product Shelf (Consistent Proportions)

In an e-commerce catalog with search filters, filtering down to 1 or 2 items with `auto-fit` will violently expand those 2 cards into gigantic 600px-wide monstrosities. With `auto-fill`, cards retain their intended dimensions.

#### HTML
```html
<section class="product-showcase">
  <header class="showcase-header">
    <h2>Featured Hardware</h2>
    <span class="badge">Filtered: 2 items</span>
  </header>

  <div class="product-grid">
    <!-- Card 1 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500" alt="Audio Interface" />
        <span class="stock-tag">In Stock</span>
      </div>
      <div class="card-body">
        <span class="category">Audio Engineering</span>
        <h3>DSP Preamp Processor</h3>
        <p class="description">Ultra-low latency audio processing unit with analog-digital matrix converters.</p>
        <div class="card-footer">
          <span class="price">$499.00</span>
          <button type="button" class="btn-action">Add to Cart</button>
        </div>
      </div>
    </article>

    <!-- Card 2 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500" alt="Mechanical Keyboard" />
        <span class="stock-tag">Limited</span>
      </div>
      <div class="card-body">
        <span class="category">Peripherals</span>
        <h3>Custom CNC Macro Pad</h3>
        <p class="description">Machined brass chassis with hot-swappable tactile mechanical switches.</p>
        <div class="card-footer">
          <span class="price">$149.00</span>
          <button type="button" class="btn-action">Add to Cart</button>
        </div>
      </div>
    </article>
  </div>
</section>
```

#### CSS
```css
.product-showcase {
  max-width: 1280px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #0f172a;
  border-radius: 16px;
  color: #f8fafc;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.badge {
  background: #334155;
  color: #94a3b8;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

/* =======================================================
   The Core Auto-Fill Grid:
   Cards will ALWAYS stay between 280px and 1fr width.
   Empty columns remain present, preserving card proportions.
   ======================================================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}

.product-card {
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.3);
}

.card-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #090d16;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.stock-tag {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #818cf8;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-body h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #f1f5f9;
}

.description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #94a3b8;
  margin-bottom: 1.25rem;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #334155;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
}

.btn-action {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-action:hover {
  background: #4338ca;
}
```

---

### Pattern 2: Interactive Application Action Palette / Tool Dock

In desktop-grade web applications, toolbars require uniform slot sizes. When tools are dynamically toggled or hidden based on active context, `auto-fill` maintains a rigid slot matrix rather than warping tool button shapes.

#### HTML
```html
<nav class="tool-dock" aria-label="Editor Tools">
  <div class="dock-header">
    <span>Canvas Utilities</span>
    <span class="hotkey">Auto-Fill Matrix</span>
  </div>

  <div class="dock-grid">
    <button class="tool-btn active" title="Select Pointer">
      <span class="tool-icon">↖</span>
      <span class="tool-name">Select</span>
    </button>
    <button class="tool-btn" title="Pen Tool">
      <span class="tool-icon">✎</span>
      <span class="tool-name">Draw</span>
    </button>
    <button class="tool-btn" title="Vector Rectangle">
      <span class="tool-icon">▢</span>
      <span class="tool-name">Shape</span>
    </button>
    <button class="tool-btn" title="Typography">
      <span class="tool-icon">T</span>
      <span class="tool-name">Text</span>
    </button>
    <button class="tool-btn" title="Asset Media">
      <span class="tool-icon">◫</span>
      <span class="tool-name">Media</span>
    </button>
    <button class="tool-btn" title="Color Picker">
      <span class="tool-icon">◉</span>
      <span class="tool-name">Palette</span>
    </button>
  </div>
</nav>
```

#### CSS
```css
.tool-dock {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 1rem;
  max-width: 680px;
  margin: 2rem auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  color: #e4e4e7;
}

.dock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: #a1a1aa;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.hotkey {
  font-family: monospace;
  background: #27272a;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* =======================================================
   Rigid Tool Matrix with Fixed Min/Max Tracks:
   Slots remain strictly 80px wide. Empty slots stay ready.
   ======================================================= */
.dock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.75rem;
}

.tool-btn {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.15s ease;
  aspect-ratio: 1 / 1;
}

.tool-btn:hover {
  background: #3f3f46;
  color: #ffffff;
  border-color: #71717a;
}

.tool-btn.active {
  background: #3b82f6;
  border-color: #60a5fa;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

.tool-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.tool-name {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
```

---

### Pattern 3: Auto-Fill Grid with Subgrid Integration

When auto-filled cards have varying text lengths, aligning internal elements (like titles, tags, and action buttons) across different rows is traditionally problematic. Modern CSS **Subgrid** harmonizes seamlessly with `auto-fill`.

#### HTML
```html
<div class="subgrid-showcase">
  <div class="auto-subgrid">
    <!-- Card A -->
    <div class="sub-card">
      <div class="sub-header">
        <span class="pill-badge status-live">Live Analytics</span>
        <h3>Real-time WebSocket Pipeline Stream</h3>
      </div>
      <p class="sub-text">Continuous ingestion of telemetry metrics across 32 distributed nodes with sub-millisecond serialization.</p>
      <div class="sub-action">
        <a href="#pipeline" class="link-btn">Inspect Metrics &rarr;</a>
      </div>
    </div>

    <!-- Card B -->
    <div class="sub-card">
      <div class="sub-header">
        <span class="pill-badge status-idle">Scheduled</span>
        <h3>Nightly Database Sharding</h3>
      </div>
      <p class="sub-text">Automated partitioned snapshot creation.</p>
      <div class="sub-action">
        <a href="#sharding" class="link-btn">Manage Schedule &rarr;</a>
      </div>
    </div>

    <!-- Card C -->
    <div class="sub-card">
      <div class="sub-header">
        <span class="pill-badge status-alert">Security Notice</span>
        <h3>Edge SSL Certificate Key Rotation Policy</h3>
      </div>
      <p class="sub-text">Zero-downtime automated cryptographic certificate rotation across global edge Points of Presence.</p>
      <div class="sub-action">
        <a href="#security" class="link-btn">Review Logs &rarr;</a>
      </div>
    </div>
  </div>
</div>
```

#### CSS
```css
.subgrid-showcase {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #0b0f19;
  border-radius: 16px;
  color: #e2e8f0;
}

/* 1. Main Container: Auto-fill calculates dynamic column count */
.auto-subgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 1.5rem;
}

/* 2. Grid Items: Span 3 rows and inherit row sizing from the parent grid */
.sub-card {
  background: #131c31;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* Perfectly synchronizes headers, body, & actions */
  row-gap: 1rem;
}

.sub-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pill-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.status-live { background: #064e3b; color: #34d399; }
.status-idle { background: #374151; color: #9ca3af; }
.status-alert { background: #7f1d1d; color: #f87171; }

.sub-card h3 {
  font-size: 1.125rem;
  line-height: 1.35;
  margin: 0;
  color: #f8fafc;
}

.sub-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #94a3b8;
  margin: 0;
}

.sub-action {
  display: flex;
  align-items: flex-end;
  border-top: 1px solid #1e293b;
  padding-top: 1rem;
}

.link-btn {
  color: #38bdf8;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.15s ease;
}

.link-btn:hover {
  color: #7dd3fc;
  text-decoration: underline;
}
```

---

### Pattern 4: Container Queries + Auto-Fill Synergy

By applying `container-type: inline-size` to a parent component, `repeat(auto-fill, ...)` responds directly to the **local component boundary** rather than the global viewport width. This makes cards truly modular across main views, sidebars, modals, or widgets.

#### HTML
```html
<div class="modular-widget">
  <aside class="sidebar-slot">
    <h4>Sidebar Widget (Narrow)</h4>
    <div class="metric-container">
      <div class="metrics-grid">
        <div class="metric-box">
          <span class="m-label">Latency</span>
          <span class="m-value">12ms</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Uptime</span>
          <span class="m-value">99.98%</span>
        </div>
      </div>
    </div>
  </aside>

  <main class="main-slot">
    <h4>Main Dashboard (Wide)</h4>
    <div class="metric-container">
      <div class="metrics-grid">
        <div class="metric-box">
          <span class="m-label">CPU Cores</span>
          <span class="m-value">64 / 64</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Throughput</span>
          <span class="m-value">4.2 GB/s</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Memory Usage</span>
          <span class="m-value">41.2 GB</span>
        </div>
        <div class="metric-box">
          <span class="m-label">Error Rate</span>
          <span class="m-value">0.001%</span>
        </div>
      </div>
    </div>
  </main>
</div>
```

#### CSS
```css
.modular-widget {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  color: #f1f5f9;
}

.sidebar-slot { width: 300px; }
.main-slot { flex: 1; }

/* Establish the container context */
.metric-container {
  container-type: inline-size;
  container-name: metricCard;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 1rem;
}

/* Auto-fill seamlessly adapts to the container's inline width */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
  gap: 1rem;
}

.metric-box {
  background: #1f2937;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 3px solid #6366f1;
}

.m-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.m-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}
```

---

## 5. Common Pitfalls & How to Avoid Them

### Pitfall 1: Placing `<flex>` (`1fr`) in the `min` Argument of `minmax()`

```css
/* ❌ SYNTAX ERROR / INVALID CSS */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(1fr, 300px));
}
```
**Why it fails**: In the CSS Grid specification, fractional flex units (`fr`) can only represent free space distribution in the **maximum** constraint (`max` argument of `minmax()`). A minimum size must resolve to a definitive length, percentage, or intrinsic keyword (`min-content`, `max-content`, `auto`).

**Fix**: Always place `<flex>` in the second argument:
```css
/* ✅ Correct */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

---

### Pitfall 2: Track Gaps Causing Unexpected Wraps (Subpixel Calculation)

When using `minmax(25%, 1fr)` with `auto-fill` and a `gap`:
```css
/* ⚠️ Danger: 4 columns of 25% + 3 gaps = >100% width! */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(25%, 1fr));
  gap: 1rem;
}
```
**Why it happens**: Four tracks at `25%` equal `100%` of container width. Adding `3 * 1rem` gaps pushes total required width above `100%`. The browser is forced to drop to 3 columns.

**Fix**: Use fixed pixel minimums or `calc()` formulas:
```css
/* ✅ Correct: Accounts for gaps mathematically */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(calc(25% - 0.75rem), 1fr));
  gap: 1rem;
}
```

---

### Pitfall 3: Multi-column Spanning (`grid-column: span 2`) with `auto-fill`

If you instruct an item to span across 2 columns on a container that resolves to only 1 auto-filled column, the item forces the creation of an implicit second track, re-introducing horizontal overflow.

**Fix**: Restrict spanning using container queries or media queries:
```css
@container (min-width: 600px) {
  .featured-card {
    grid-column: span 2;
  }
}
```

---

## 6. Complete Standalone Interactive Showcase

Save the snippet below as an HTML file to interactively test and compare `auto-fill` against `auto-fit` with dynamic item count controls and live resizing:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Auto-Fill Grids Masterclass Demo</title>
  <style>
    :root {
      --bg-main: #090d16;
      --bg-panel: #111827;
      --bg-card: #1f2937;
      --border-color: #374151;
      --accent-fill: #3b82f6;
      --accent-fit: #10b981;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-main);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2rem 1rem;
      line-height: 1.5;
    }

    .wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      margin-top: 2rem;
    }

    .demo-section {
      background: var(--bg-panel);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .demo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .demo-title {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .code-tag {
      font-family: monospace;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .tag-fill {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .tag-fit {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Grid Implementations */
    .grid-auto-fill {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
      gap: 1.25rem;
      min-height: 180px;
      background: rgba(0, 0, 0, 0.2);
      border: 2px dashed rgba(59, 130, 246, 0.3);
      padding: 1rem;
      border-radius: 12px;
    }

    .grid-auto-fit {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
      gap: 1.25rem;
      min-height: 180px;
      background: rgba(0, 0, 0, 0.2);
      border: 2px dashed rgba(16, 185, 129, 0.3);
      padding: 1rem;
      border-radius: 12px;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .card-num {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .card-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .explanation-box {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>CSS Auto-Fill vs. Auto-Fit</h1>
      <p class="subtitle">Both containers below hold only <strong>2 items</strong> inside an area wide enough for 4 columns.</p>
    </header>

    <div class="comparison-grid">
      <!-- Auto-Fill Section -->
      <section class="demo-section">
        <div class="demo-header">
          <h2 class="demo-title">1. Auto-Fill Grids</h2>
          <span class="code-tag tag-fill">repeat(auto-fill, minmax(220px, 1fr))</span>
        </div>
        <div class="grid-auto-fill">
          <div class="card">
            <span class="card-num">1</span>
            <strong>Card Alpha</strong>
            <span class="card-desc">Width capped at 1 track</span>
          </div>
          <div class="card">
            <span class="card-num">2</span>
            <strong>Card Beta</strong>
            <span class="card-desc">Empty tracks preserved &rarr;</span>
          </div>
        </div>
        <p class="explanation-box">
          💡 <strong>Notice:</strong> The 2 cards preserve their normal column widths. The browser created empty phantom tracks on the right, keeping card dimensions uniform and balanced.
        </p>
      </section>

      <!-- Auto-Fit Section -->
      <section class="demo-section">
        <div class="demo-header">
          <h2 class="demo-title">2. Auto-Fit Grids</h2>
          <span class="code-tag tag-fit">repeat(auto-fit, minmax(220px, 1fr))</span>
        </div>
        <div class="grid-auto-fit">
          <div class="card">
            <span class="card-num">1</span>
            <strong>Card Alpha</strong>
            <span class="card-desc">Expanded to 50% width</span>
          </div>
          <div class="card">
            <span class="card-num">2</span>
            <strong>Card Beta</strong>
            <span class="card-desc">Expanded to 50% width</span>
          </div>
        </div>
        <p class="explanation-box">
          💡 <strong>Notice:</strong> The browser collapsed empty tracks to 0px and stretched the 2 cards to consume 50% of the entire container width each.
        </p>
      </section>
    </div>
  </div>
</body>
</html>
```

---

## 7. Decision Tree & Cheat Sheet

```
                                [ Responsive Grid Requirement ]
                                               │
                       Is the number of items variable or filtered?
                                       ┌───────┴───────┐
                                      YES              NO
                                       │                │
            Should items preserve card size         Do items need to stretch
            when only 1 or 2 items exist?          across 100% of container?
                    ┌──────────┴──────────┐                     │
                   YES                    NO                    │
                    │                      │                    │
              [ auto-fill ]          [ auto-fit ]          [ auto-fit ]
            (e.g., Catalogs,       (e.g., Hero grids,    (e.g., Equal full
             Tool Docks, Media)     Metrics banners)      width distribution)
```

### Key Formula Reference

| Goal | Formula |
| :--- | :--- |
| **Standard Responsive Auto-Fill** | `grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));` |
| **Strict Fixed-Size Matrix** | `grid-template-columns: repeat(auto-fill, 80px);` |
| **Container-Relative Sizing** | `grid-template-columns: repeat(auto-fill, minmax(min(100%, 25cqw), 1fr));` |
| **Auto-Fill with Subgrid** | Parent: `repeat(auto-fill, minmax(min(100%, 300px), 1fr));`<br>Child: `grid-row: span 3; grid-template-rows: subgrid;` |
