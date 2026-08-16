# 033: CSS Auto-Fit Grids Masterclass

## Overview

Responsive web design traditionally relied heavily on explicit `@media` queries with hardcoded breakpoints (`@media (min-width: 768px)`, `@media (min-width: 1024px)`, etc.). 

**Auto-fit grids**—popularized by the **RAM (Repeat, Auto, Minmax)** pattern—revolutionize responsive layout architecture. By combining CSS Grid's `repeat()`, the `auto-fit` keyword, and the `minmax()` function, a container dynamically computes the optimal number of columns based on available space and stretches items to fit seamlessly across the viewport—**completely free of media queries**.

```css
/* The Canonical RAM Pattern */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}
```

---

## 1. Anatomy of the Auto-Fit Formula

The auto-fit declaration consists of three tightly coupled CSS Grid mechanics:

```
grid-template-columns: repeat( auto-fit, minmax( min(100%, 280px), 1fr ) );
                       ──────  ────────  ───────────────────────────────
                          │       │                     │
                          │       │                     └─ Track size range [min, max]
                          │       └─ Fit strategy (collapses empty tracks)
                          └─ Repeat function (creates as many tracks as fit)
```

| Component | Role | Mechanism |
| :--- | :--- | :--- |
| `repeat()` | Track duplicator | Automatically repeats track definitions across the inline axis. |
| `auto-fit` | Space consumer & track collapser | Calculates the maximum number of tracks that fit the container width, then collapses any unoccupied tracks to `0px` and allows occupied tracks to expand into the remaining space. |
| `minmax(min, max)` | Flexible track boundary | Defines the minimum threshold (e.g., `280px`) and maximum upper limit (e.g., `1fr`) for each individual column track. |
| `min(100%, 280px)` | Mobile-safe minimum clamp | Ensures the track minimum never exceeds the viewport width on narrow devices (< 280px), eliminating horizontal scrollbars. |
| `1fr` | Fractional unit distribution | Distributes all leftover space proportionally among the active tracks. |

---

## 2. `auto-fit` vs `auto-fill`: The Critical Difference

Both `auto-fit` and `auto-fill` calculate how many tracks of minimum size can fit in the container. However, **they behave drastically differently when there are fewer items than available column slots**.

### Visual Comparison

Suppose a container is **1200px wide**, the minimum column width is **250px**, and there are only **2 items**.

```
Container Width: 1200px (Capacity = 4 tracks of ~250-300px)
Number of Items: 2

┌─────────────────────────────────────────────────────────────────────────────┐
│ auto-fill Behavior: Empty tracks preserved                                  │
├──────────────────────┬──────────────────────┬───────────────┬───────────────┤
│       Item 1         │       Item 2         │ [Empty Track] │ [Empty Track] │
│     (w: ~285px)      │     (w: ~285px)      │   (w: ~285px) │   (w: ~285px) │
└──────────────────────┴──────────────────────┴───────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ auto-fit Behavior: Empty tracks collapsed (0px), items stretch to full width│
├─────────────────────────────────────────────┬───────────────────────────────┤
│                   Item 1                    │            Item 2             │
│                 (w: ~588px)                 │          (w: ~588px)          │
└─────────────────────────────────────────────┴───────────────────────────────┘
```

### Detailed Breakdown

| Property Keyword | Behavior with Surplus Space | Ideal Use Cases |
| :--- | :--- | :--- |
| `auto-fit` | **Collapses empty tracks to `0px`**. The remaining items expand to occupy 100% of the container width via `1fr`. | • Product cards<br>• Dashboard metrics / KPIs<br>• Media galleries<br>• Blog post listings |
| `auto-fill` | **Preserves empty tracks**. Items maintain their standard calculated size without stretching, leaving empty space on the right (or inline-end). | • Fixed-size photo albums<br>• Toolbar / dock item slots<br>• Drag-and-drop drop zones |

---

## 3. The Mobile-Safe Formula: Preventing Grid Blowout

### The Common Pitfall
A naive implementation uses `repeat(auto-fit, minmax(320px, 1fr))`. When viewed on an older phone or small viewport of **300px**, the grid enforces the `320px` minimum track size, causing **unwanted horizontal overflow and scrollbars**.

```css
/* ❌ DANGEROUS on viewports < 320px */
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
```

### The Modern Solution: `min()` Guard
Wrap the minimum constraint in `min(100%, <size>)`. If the viewport is smaller than `320px`, the track minimum gracefully shrinks to `100%` of the container width.

```css
/* ✅ 100% SAFE across all device widths */
grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
```

### Preventing Text / Asset Blowout with `min-width: 0`
Grid items have an initial `min-width: auto` setting. Long unbroken URLs, `<pre>` code blocks, or wide tables can force a grid column to expand wider than `1fr`. Add `min-width: 0` to direct grid children:

```css
.grid > * {
  min-width: 0; /* Allows text truncation and overflow handling */
}
```

---

## 4. Production-Ready Practical Patterns

### Pattern 1: Responsive Product & Feature Card Grid

A production-ready card catalog that seamlessly adapts from 1 column on mobile to 2, 3, 4, or 5 columns on ultra-wide screens without a single media query.

#### HTML
```html
<section class="catalog-section">
  <div class="section-header">
    <h2>Featured Products</h2>
    <p>Explore our curated collection of workspace essentials.</p>
  </div>

  <div class="product-grid">
    <!-- Card 1 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://picsum.photos/600/400?random=10" alt="Mechanical Keyboard" loading="lazy" />
        <span class="badge">Bestseller</span>
      </div>
      <div class="card-body">
        <span class="category">Peripherals</span>
        <h3 class="title">Ergonomic Mechanical Keyboard</h3>
        <p class="description">Custom linear switches, hot-swappable PCB, and CNC anodized aluminum chassis.</p>
      </div>
      <div class="card-footer">
        <span class="price">$189.00</span>
        <button type="button" class="btn-primary">Add to Cart</button>
      </div>
    </article>

    <!-- Card 2 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://picsum.photos/600/400?random=11" alt="Studio Monitor Headphones" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="category">Audio</span>
        <h3 class="title">Precision Studio Headphones</h3>
        <p class="description">Neutral sound curve, memory foam earpads, and active noise cancellation.</p>
      </div>
      <div class="card-footer">
        <span class="price">$249.00</span>
        <button type="button" class="btn-primary">Add to Cart</button>
      </div>
    </article>

    <!-- Card 3 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://picsum.photos/600/400?random=12" alt="Ultra-wide Monitor Arm" loading="lazy" />
        <span class="badge new">New</span>
      </div>
      <div class="card-body">
        <span class="category">Ergonomics</span>
        <h3 class="title">Heavy-Duty Monitor Arm</h3>
        <p class="description">Gas-spring counterbalance system supporting displays up to 49 inches.</p>
      </div>
      <div class="card-footer">
        <span class="price">$119.00</span>
        <button type="button" class="btn-primary">Add to Cart</button>
      </div>
    </article>

    <!-- Card 4 -->
    <article class="product-card">
      <div class="card-media">
        <img src="https://picsum.photos/600/400?random=13" alt="Desk Mat" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="category">Accessories</span>
        <h3 class="title">Merino Wool Desk Mat</h3>
        <p class="description">Natural water-resistant felt with non-slip natural cork backing.</p>
      </div>
      <div class="card-footer">
        <span class="price">$45.00</span>
        <button type="button" class="btn-primary">Add to Cart</button>
      </div>
    </article>
  </div>
</section>
```

#### CSS
```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-hover: #334155;
  --color-border: #334155;
  --color-text-main: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-accent: #38bdf8;
  --color-accent-hover: #0ea5e9;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
}

.catalog-section {
  max-width: 1360px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: var(--font-sans);
  color: var(--color-text-main);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.section-header p {
  color: var(--color-text-muted);
  margin: 0;
}

/* 🚀 Responsive Auto-Fit Grid */
.product-grid {
  display: grid;
  /* Auto-fits columns with a safe minimum of 280px and max of 1fr */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.75rem;
}

/* Card Container with Flexbox distribution */
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease;
  min-width: 0; /* Prevents overflow blowout */
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent);
}

.card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background-color: #000;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .card-media img {
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.6rem;
  background: rgba(15, 23, 42, 0.85);
  color: #fbbf24;
  backdrop-filter: blur(8px);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.new {
  color: var(--color-accent);
  border-color: rgba(56, 189, 248, 0.3);
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Pushes footer to the bottom */
}

.category {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  margin-bottom: 0.35rem;
}

.title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  line-height: 1.35;
}

.description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin: 0;
}

.card-footer {
  padding: 1rem 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  color: #0f172a;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s active;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

---

### Pattern 2: Dynamic KPI & Metrics Dashboard

Dashboard metric cards benefit significantly from `auto-fit`. When filtered to only show 1 or 2 metrics, the remaining cards expand gracefully to fill the width instead of leaving awkward empty gaps on the right.

#### HTML
```html
<div class="metrics-grid">
  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">Total Revenue</span>
      <span class="trend positive">+14.2%</span>
    </div>
    <div class="metric-value">$124,592</div>
    <div class="metric-caption">vs. $109,100 last month</div>
  </div>

  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">Active Subscriptions</span>
      <span class="trend positive">+8.1%</span>
    </div>
    <div class="metric-value">1,420</div>
    <div class="metric-caption">98.4% renewal rate</div>
  </div>

  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">Avg. Response Time</span>
      <span class="trend positive">-24ms</span>
    </div>
    <div class="metric-value">142ms</div>
    <div class="metric-caption">P99 SLA target < 200ms</div>
  </div>

  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">Error Rate</span>
      <span class="trend negative">+0.04%</span>
    </div>
    <div class="metric-value">0.12%</div>
    <div class="metric-caption">Within acceptable thresholds</div>
  </div>
</div>
```

#### CSS
```css
.metrics-grid {
  display: grid;
  /* Auto-fits metric tiles; minimum 220px */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 1.25rem;
  width: 100%;
}

.metric-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
}

.trend {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.trend.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.trend.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.metric-value {
  font-size: 1.85rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.03em;
}

.metric-caption {
  font-size: 0.75rem;
  color: #64748b;
}
```

---

### Pattern 3: Fluid Auto-Fit Media Gallery

An adaptive photo gallery utilizing modern `aspect-ratio` and `object-fit: cover` to ensure flawless cropping at any dynamic track size.

#### HTML
```html
<div class="gallery-grid">
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=20" alt="Mountain range" loading="lazy" />
    <figcaption>Alpine Vista</figcaption>
  </figure>
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=21" alt="Ocean coastline" loading="lazy" />
    <figcaption>Pacific Shore</figcaption>
  </figure>
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=22" alt="Forest trail" loading="lazy" />
    <figcaption>Deep Forest</figcaption>
  </figure>
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=23" alt="Desert dunes" loading="lazy" />
    <figcaption>Sahara Sunrise</figcaption>
  </figure>
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=24" alt="Misty lake" loading="lazy" />
    <figcaption>Emerald Lake</figcaption>
  </figure>
  <figure class="gallery-item">
    <img src="https://picsum.photos/800/600?random=25" alt="Night sky" loading="lazy" />
    <figcaption>Celestial Night</figcaption>
  </figure>
</div>
```

#### CSS
```css
.gallery-grid {
  display: grid;
  /* Dense, fluid auto-fit gallery with 200px threshold */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 1rem;
}

.gallery-item {
  position: relative;
  margin: 0;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background-color: #1e293b;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.08);
}

.gallery-item figcaption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 2rem 0.75rem 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  transform: translateY(100%);
  transition: transform 0.25s ease;
}

.gallery-item:hover figcaption,
.gallery-item:focus-within figcaption {
  transform: translateY(0);
}
```

---

### Pattern 4: Responsive Form & Filter Toolbar

An adaptive control bar where search inputs, selects, and buttons dynamically wrap and distribute space evenly across screens.

#### HTML
```html
<form class="filter-toolbar" role="search">
  <div class="control-group search-group">
    <label for="search-input">Keyword Search</label>
    <input type="search" id="search-input" placeholder="Search orders, clients, or IDs..." />
  </div>

  <div class="control-group">
    <label for="status-select">Status</label>
    <select id="status-select">
      <option value="all">All Statuses</option>
      <option value="active">Active</option>
      <option value="pending">Pending</option>
      <option value="archived">Archived</option>
    </select>
  </div>

  <div class="control-group">
    <label for="date-range">Date Range</label>
    <select id="date-range">
      <option value="30d">Last 30 Days</option>
      <option value="90d">Last 3 Months</option>
      <option value="12m">Past Year</option>
      <option value="custom">Custom Range</option>
    </select>
  </div>

  <div class="control-group action-group">
    <button type="submit" class="btn-filter">Apply Filters</button>
  </div>
</form>
```

#### CSS
```css
.filter-toolbar {
  display: grid;
  /* Auto-fits controls with a flexible minimum of 180px */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 1rem;
  align-items: end;
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #334155;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.control-group input,
.control-group select {
  height: 42px;
  padding: 0 0.85rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.control-group input:focus,
.control-group select:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.btn-filter {
  height: 42px;
  width: 100%;
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-filter:hover {
  background: #0ea5e9;
}
```

---

## 5. Advanced Techniques & Superpowers

### Superpower 1: Perfect Alignment with CSS Subgrid

A classic problem with auto-fit card grids is that titles or descriptions of unequal lengths cause the card footers and action buttons to misalign across sibling cards in the same row.

Using **CSS Subgrid** (`grid-template-rows: subgrid`), card sub-elements (Media, Header, Body, Footer) lock directly into parent-level row tracks across the entire dynamic auto-fit grid!

```css
/* Container */
.subgrid-catalog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}

/* Card spans 4 rows of the parent grid */
.subgrid-card {
  grid-row: span 4;
  display: grid;
  grid-template-rows: subgrid; /* Inherits row track alignments! */
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
}

/* All headers, bodies, and footers across the row now align perfectly! */
.subgrid-card .media  { grid-row: 1; }
.subgrid-card .header { grid-row: 2; }
.subgrid-card .body   { grid-row: 3; }
.subgrid-card .footer { grid-row: 4; }
```

---

### Superpower 2: Combining `auto-fit` with Container Queries

While `auto-fit` makes the **grid container** responsive without viewport media queries, combining it with **CSS Container Queries** allows the **individual cards** to alter their own internal design based on their computed column width.

```css
/* Step 1: Make the grid item a container */
.product-card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Step 2: Adapt card styling when column width is wide */
@container card (min-width: 420px) {
  .product-card {
    display: grid;
    grid-template-columns: 140px 1fr;
    grid-template-rows: auto auto;
  }

  .card-media {
    grid-row: 1 / -1;
    aspect-ratio: auto;
    height: 100%;
  }
}
```

---

## 6. Common Pitfalls & Solutions

### Pitfall 1: Horizontal Overflow on Mobile Devices (< 320px)
* **Problem**: Declaring `repeat(auto-fit, minmax(320px, 1fr))` creates a minimum track constraint wider than narrow phone viewports (e.g. 280px–300px).
* **Fix**: Always wrap the minimum size inside `min(100%, ...)`, e.g., `repeat(auto-fit, minmax(min(100%, 320px), 1fr))`.

### Pitfall 2: Long Content Blowout
* **Problem**: By default, grid items have `min-width: auto`. A long word, string without breaks, or code block expands the item beyond `1fr`.
* **Fix**: Apply `min-width: 0` to direct grid children.

### Pitfall 3: Stretched Images with Unspecified Aspect Ratios
* **Problem**: When `auto-fit` columns expand on large screens, child images stretch vertically if their container height isn't controlled.
* **Fix**: Use `aspect-ratio: 16 / 9` (or desired ratio) with `object-fit: cover` and `width: 100%`.

### Pitfall 4: Choosing `auto-fill` when `auto-fit` was intended
* **Problem**: In a 3-item list inside a wide screen, `auto-fill` leaves a giant empty void on the right because it reserves tracks for items 4 and 5.
* **Fix**: Use `auto-fit` so empty tracks collapse to `0px` and the 3 items expand cleanly across the entire container width.

---

## 7. Interactive Standalone HTML Demo

You can copy and paste this complete, self-contained HTML file directly into your browser or test environment:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Auto-Fit Grids Live Demo</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2rem;
      text-align: center;
    }

    header h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    header p {
      color: #94a3b8;
      font-size: 1rem;
    }

    /* Interactive Toolbar */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
      background: #131b2e;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid #1e293b;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      border: 1px solid #334155;
      background: #1e293b;
      color: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background: #334155;
      border-color: #475569;
    }

    .btn.active {
      background: #38bdf8;
      color: #090d16;
      border-color: #38bdf8;
    }

    /* 🚀 THE AUTO-FIT GRID */
    .dynamic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: 1.5rem;
      transition: all 0.3s ease;
    }

    /* Alternate class to compare auto-fill */
    .dynamic-grid.mode-fill {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    }

    .card {
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: #38bdf8;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      display: grid;
      place-items: center;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .card h3 {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .card p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
      flex-grow: 1;
    }

    .card-meta {
      font-size: 0.75rem;
      color: #64748b;
      border-top: 1px solid #1e293b;
      padding-top: 0.75rem;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <h1>CSS Auto-Fit Grids</h1>
      <p>Resize your browser window or toggle items to observe dynamic track re-calculation.</p>
    </header>

    <div class="toolbar">
      <button class="btn" id="btn-add">➕ Add Card</button>
      <button class="btn" id="btn-remove">➖ Remove Card</button>
      <button class="btn active" id="btn-autofit">Mode: auto-fit</button>
      <button class="btn" id="btn-autofill">Mode: auto-fill</button>
    </div>

    <div class="dynamic-grid" id="grid">
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>Zero Media Queries</h3>
        <p>Columns fluidly resize and wrap entirely based on container width.</p>
        <div class="card-meta">Track: minmax(min(100%, 260px), 1fr)</div>
      </div>
      <div class="card">
        <div class="card-icon">📐</div>
        <h3>Mobile-Safe min()</h3>
        <p>Eliminates horizontal scrolling on ultra-compact mobile displays.</p>
        <div class="card-meta">Track: minmax(min(100%, 260px), 1fr)</div>
      </div>
      <div class="card">
        <div class="card-icon">💎</div>
        <h3>Proportional 1fr</h3>
        <p>Leftover horizontal space is evenly distributed among active tracks.</p>
        <div class="card-meta">Track: minmax(min(100%, 260px), 1fr)</div>
      </div>
    </div>
  </div>

  <script>
    const grid = document.getElementById('grid');
    const btnAdd = document.getElementById('btn-add');
    const btnRemove = document.getElementById('btn-remove');
    const btnAutoFit = document.getElementById('btn-autofit');
    const btnAutoFill = document.getElementById('btn-autofill');

    const icons = ['🚀', '🔮', '🎯', '🎨', '🔥', '✨', '💡', '🛡️'];

    btnAdd.addEventListener('click', () => {
      const count = grid.children.length + 1;
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-icon">${randomIcon}</div>
        <h3>Feature Card #${count}</h3>
        <p>Dynamically instantiated card adjusting seamlessly to current track constraints.</p>
        <div class="card-meta">Track: minmax(min(100%, 260px), 1fr)</div>
      `;
      grid.appendChild(card);
    });

    btnRemove.addEventListener('click', () => {
      if (grid.children.length > 1) {
        grid.removeChild(grid.lastElementChild);
      }
    });

    btnAutoFit.addEventListener('click', () => {
      grid.classList.remove('mode-fill');
      btnAutoFit.classList.add('active');
      btnAutoFill.classList.remove('active');
    });

    btnAutoFill.addEventListener('click', () => {
      grid.classList.add('mode-fill');
      btnAutoFill.classList.add('active');
      btnAutoFit.classList.remove('active');
    });
  </script>
</body>
</html>
```

---

## 8. Summary & Quick Reference

| Snippet Purpose | CSS Declaration |
| :--- | :--- |
| **Standard Card Grid** | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));` |
| **Compact Tag / Pill Grid** | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr));` |
| **Hero / Large Feature Grid** | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));` |
| **Subgrid Row Alignment** | `grid-template-rows: subgrid; grid-row: span 4;` |
| **Content Overflow Guard** | `min-width: 0;` on direct grid children |
