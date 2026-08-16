# 025: Sticky Layouts in CSS

`position: sticky` is one of the most powerful and versatile layout tools in modern CSS. It seamlessly blends **relative** and **fixed** positioning based on the user's scroll position. An element behaves like `position: relative` until its containing block crosses a specified threshold within its scroll container (usually the viewport), at which point it "sticks" like `position: fixed`—until its parent boundary ends.

This guide provides a comprehensive, production-grade reference for mastering sticky layouts in modern CSS, including foundational mechanics, common patterns, edge cases, and debugging techniques.

---

## 1. How `position: sticky` Works: The Mechanics

To master sticky layouts, you must understand the relationship between three components:

```
+--------------------------------------------------------------------+
|  1. SCROLL CONTAINER (e.g. <body> or an overflow: auto element)   |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |  2. STICKY CONTAINER / PARENT (Containing Block)             |  |
|  |                                                              |  |
|  |  +--------------------------------------------------------+  |  |
|  |  |  3. STICKY ELEMENT (position: sticky; top: 0;)          |  |  |
|  |  |     - Relative state before threshold                  |  |  |
|  |  |     - Fixed/Stuck state between threshold & boundary   |  |  |
|  |  |     - Pushed out when parent ends                      |  |  |
|  |  +--------------------------------------------------------+  |  |
|  |                                                              |  |
|  |  (Remaining content of the parent container...)              |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  (Other sibling elements in the scroll container...)               |
+--------------------------------------------------------------------+
```

### The Three States of a Sticky Element

1. **Pre-Stick (Relative State):**
   When the scroll position is before the specified threshold (e.g., `top: 0`), the element occupies normal document flow just like `position: relative`.
2. **Stuck (Sticky State):**
   When scrolling brings the element to its inset threshold (e.g., `top: 0` reaches the top of the scrollport), the element stays pinned at that position relative to the scroll viewport.
3. **Post-Stick (Contained Boundary State):**
   A sticky element **can never escape its parent container**. When the bottom edge of the parent container reaches the bottom edge of the sticky element, the sticky element stops sticking and scrolls upward with its parent.

### The Two Non-Negotiable Rules

For `position: sticky` to function:
1. **An Inset Threshold is Required:** You must define at least one of `top`, `bottom`, `left`, or `right`. Without an inset, sticky behaves identically to `position: relative`.
2. **The Parent Must Be Taller Than the Sticky Element:** If the parent container is the exact same height as the sticky element, the element has zero distance to stick across.

---

## 2. Core Sticky Layout Patterns

---

### Pattern 1: Sticky Navigation Header with Glassmorphism

A sticky site header stays pinned to the top of the viewport during page scrolling while respecting modern design aesthetics like backdrop blur and dynamic elevation.

#### HTML Structure
```html
<header class="site-header">
  <div class="header-container">
    <a href="/" class="logo">
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <span>ModernApp</span>
    </a>
    
    <nav class="main-nav" aria-label="Main Navigation">
      <ul class="nav-list">
        <li><a href="#features">Features</a></li>
        <li><a href="#solutions">Solutions</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#docs">Docs</a></li>
      </ul>
    </nav>

    <div class="header-actions">
      <a href="#login" class="btn-ghost">Log In</a>
      <a href="#signup" class="btn-primary">Get Started</a>
    </div>
  </div>
</header>

<main class="page-content">
  <!-- Long page content -->
</main>
```

#### CSS Implementation
```css
/* Sticky Header Root */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  
  /* Modern Glassmorphism styling */
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* Optional Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .site-header {
    background-color: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(51, 65, 85, 0.8);
  }
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #0f172a;
  text-decoration: none;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #3b82f6;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list a {
  text-decoration: none;
  color: #475569;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-list a:hover {
  color: #3b82f6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-ghost {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.btn-primary {
  text-decoration: none;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
```

---

### Pattern 2: Sticky Sidebar in a Multi-Column Layout

In documentation sites, dashboard apps, and e-commerce catalogs, sidebars (Table of Contents, filter panels, or navigation trees) should remain visible as the user scrolls through extensive body content.

#### The Crucial Grid / Flexbox Pitfall
In CSS Grid and Flexbox, sibling items by default have `align-items: stretch` or `align-self: stretch`. This stretches the sidebar container to match the height of the main content column. **However**, if you apply `position: sticky` to an internal wrapper inside the sidebar column without setting `align-self: start`, the container column itself is stretched, but the child needs proper heights to scroll correctly.

Setting `align-self: start` on the sticky sidebar grid item ensures the item only occupies its intrinsic content height, allowing it to glide along the parent grid track.

#### HTML Structure
```html
<div class="docs-layout">
  <!-- Sticky Sidebar -->
  <aside class="docs-sidebar" aria-label="Documentation Navigation">
    <div class="sidebar-sticky-content">
      <h3 class="sidebar-title">Getting Started</h3>
      <ul class="sidebar-links">
        <li><a href="#introduction" class="active">Introduction</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
        <li><a href="#quick-start">Quick Start</a></li>
      </ul>

      <h3 class="sidebar-title">Core Architecture</h3>
      <ul class="sidebar-links">
        <li><a href="#reactivity">Reactivity Engine</a></li>
        <li><a href="#state-management">State Management</a></li>
        <li><a href="#routing">Client Routing</a></li>
        <li><a href="#ssr">Server-Side Rendering</a></li>
      </ul>

      <h3 class="sidebar-title">API Reference</h3>
      <ul class="sidebar-links">
        <li><a href="#hooks">Built-in Hooks</a></li>
        <li><a href="#utilities">Utility Functions</a></li>
        <li><a href="#typescript">TypeScript Types</a></li>
      </ul>
    </div>
  </aside>

  <!-- Main Article Content -->
  <main class="docs-content">
    <article>
      <h1>Comprehensive Guide to Modern Architecture</h1>
      <p class="lead">Learn how to build scalable, high-performance web applications with modular patterns.</p>
      
      <section id="introduction">
        <h2>Introduction</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      </section>

      <section id="installation">
        <h2>Installation</h2>
        <p>Follow standard package manager workflows to install dependencies...</p>
      </section>

      <!-- Additional lengthy sections -->
    </article>
  </main>
</div>
```

#### CSS Implementation
```css
/* Multi-column Grid Layout */
.docs-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 3rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Sidebar Column */
.docs-sidebar {
  /* CRITICAL: align-self: start prevents the sidebar element from stretching */
  align-self: start;
  
  /* Make the sidebar sticky */
  position: sticky;
  top: 5rem; /* Space below sticky top navigation header */
  max-height: calc(100vh - 6rem); /* Fit within viewport height */
  overflow-y: auto; /* Enable independent scrolling if sidebar items exceed viewport */
  padding-right: 1rem;
}

/* Smooth custom scrollbar for sidebar */
.docs-sidebar::-webkit-scrollbar {
  width: 4px;
}
.docs-sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.sidebar-title:first-child {
  margin-top: 0;
}

.sidebar-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-links li {
  margin-bottom: 0.25rem;
}

.sidebar-links a {
  display: block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #334155;
  text-decoration: none;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
}

.sidebar-links a:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.sidebar-links a.active {
  color: #2563eb;
  background-color: #eff6ff;
  border-left-color: #2563eb;
  font-weight: 600;
}

/* Main Content Area */
.docs-content {
  min-width: 0; /* Prevents overflow with code blocks and long strings */
  line-height: 1.75;
  color: #334155;
}

.docs-content h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.docs-content .lead {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.docs-content section {
  margin-bottom: 3rem;
}

/* Responsive adjustment for tablets and mobile */
@media (max-width: 768px) {
  .docs-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .docs-sidebar {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}
```

---

### Pattern 3: Stacked Group Headers (iOS / Contacts Style)

In alphabetically sorted contacts, chronological activity feeds, or categorized timelines, each section header sticks to the top as you scroll through its section, and is automatically pushed upward and replaced when the next section header arrives.

This works **natively without any JavaScript** because each sticky header is scoped to its own `<section>` parent container.

```
SCROLL PROGRESSION:
[Section A Start] -> Header "A" sticks to top
[Section A Scroll] -> Header "A" remains stuck
[Section B Enters] -> Header "B" hits Header "A" and pushes it offscreen
[Section B Scroll] -> Header "B" remains stuck
```

#### HTML Structure
```html
<div class="contacts-feed">
  <section class="contact-group">
    <header class="group-header">A</header>
    <ul class="contact-list">
      <li class="contact-item">
        <div class="avatar">AA</div>
        <div class="info">
          <strong>Aaron Adams</strong>
          <span>aaron@example.com</span>
        </div>
      </li>
      <li class="contact-item">
        <div class="avatar">AB</div>
        <div class="info">
          <strong>Abigail Bennett</strong>
          <span>abigail@example.com</span>
        </div>
      </li>
      <li class="contact-item">
        <div class="avatar">AL</div>
        <div class="info">
          <strong>Alexander Lewis</strong>
          <span>alex@example.com</span>
        </div>
      </li>
    </ul>
  </section>

  <section class="contact-group">
    <header class="group-header">B</header>
    <ul class="contact-list">
      <li class="contact-item">
        <div class="avatar">BC</div>
        <div class="info">
          <strong>Beatrice Clark</strong>
          <span>beatrice@example.com</span>
        </div>
      </li>
      <li class="contact-item">
        <div class="avatar">BD</div>
        <div class="info">
          <strong>Benjamin Davis</strong>
          <span>ben@example.com</span>
        </div>
      </li>
    </ul>
  </section>

  <section class="contact-group">
    <header class="group-header">C</header>
    <ul class="contact-list">
      <li class="contact-item">
        <div class="avatar">CW</div>
        <div class="info">
          <strong>Charlotte Walker</strong>
          <span>charlotte@example.com</span>
        </div>
      </li>
      <li class="contact-item">
        <div class="avatar">CP</div>
        <div class="info">
          <strong>Christopher Perez</strong>
          <span>chris@example.com</span>
        </div>
      </li>
    </ul>
  </section>
</div>
```

#### CSS Implementation
```css
.contacts-feed {
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.contact-group {
  position: relative; /* Defines containing block */
}

/* The Sticky Group Header */
.group-header {
  position: sticky;
  top: 0;
  z-index: 10;
  
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  
  padding: 0.5rem 1.25rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: #0284c7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  /* Subtle glass effect */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(248, 250, 252, 0.9);
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item:hover {
  background-color: #f8fafc;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
}

.info strong {
  font-size: 0.95rem;
  color: #1e293b;
}

.info span {
  font-size: 0.8rem;
  color: #64748b;
}
```

---

### Pattern 4: Stacking Sticky Cards ("Deck of Cards" Effect)

A favorite interactive storytelling and product feature presentation pattern: as the user scrolls, feature cards stick and stack on top of one another with progressive offset or subtle scale and shadow changes.

```
+------------------------------------+
| Card 1 (top: 2rem)                 |
+------------------------------------+
  | Card 2 (top: 4rem)               |
  +----------------------------------+
    | Card 3 (top: 6rem)             |
    +--------------------------------+
```

#### HTML Structure
```html
<section class="cards-stack-container">
  <div class="stack-card" style="--card-index: 1;">
    <div class="card-content">
      <div class="card-badge">Step 01</div>
      <h2>Seamless Integration</h2>
      <p>Connect your entire toolchain with one-click SDK integrations and automated schema discovery.</p>
    </div>
  </div>

  <div class="stack-card" style="--card-index: 2;">
    <div class="card-content">
      <div class="card-badge">Step 02</div>
      <h2>Real-time Processing</h2>
      <p>Process millions of concurrent telemetry streams with sub-millisecond edge compute nodes.</p>
    </div>
  </div>

  <div class="stack-card" style="--card-index: 3;">
    <div class="card-content">
      <div class="card-badge">Step 03</div>
      <h2>Automated Governance</h2>
      <p>Continuous compliance monitoring with audit trails, cryptographic verification, and instant alerts.</p>
    </div>
  </div>

  <div class="stack-card" style="--card-index: 4;">
    <div class="card-content">
      <div class="card-badge">Step 04</div>
      <h2>Actionable Insights</h2>
      <p>Turn raw telemetry into automated workflows, AI predictive maintenance, and strategic dashboards.</p>
    </div>
  </div>
</section>
```

#### CSS Implementation
```css
.cards-stack-container {
  max-width: 800px;
  margin: 4rem auto;
  padding: 0 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stack-card {
  position: sticky;
  /* Progressive top offset using CSS variable calculation */
  top: calc(3rem + (var(--card-index, 1) * 1.5rem));
  
  /* Height and background styling */
  min-height: 260px;
  border-radius: 16px;
  padding: 2.5rem;
  
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  
  /* Smooth transitions */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Thematic gradients for each card */
.stack-card[style*="--card-index: 1"] {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-color: #bae6fd;
}
.stack-card[style*="--card-index: 2"] {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  border-color: #ddd6fe;
}
.stack-card[style*="--card-index: 3"] {
  background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
  border-color: #fbcfe8;
}
.stack-card[style*="--card-index: 4"] {
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
  border-color: #a7f3d0;
}

.card-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: #0f172a;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.card-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.card-content p {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #475569;
}
```

---

### Pattern 5: Sticky Table Headers and Fixed Column (Data Grid)

In wide, scrollable tables, users need headers fixed to the top when scrolling vertically, and ID/Name columns fixed to the left when scrolling horizontally.

#### The `border-collapse` Challenge
In standard tables with `border-collapse: collapse`, sticky `<th>` cells will visually clip and drop their borders in several browsers. The industry-standard solution is:
1. Set `border-collapse: separate; border-spacing: 0;` on the `<table>`.
2. Use `box-shadow` or `border-bottom` on the individual sticky cells.

#### HTML Structure
```html
<div class="table-scroll-container">
  <table class="data-table">
    <thead>
      <tr>
        <th class="col-sticky-corner">Employee ID</th>
        <th>Full Name</th>
        <th>Department</th>
        <th>Role</th>
        <th>Location</th>
        <th>Start Date</th>
        <th>Status</th>
        <th>Salary (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-sticky">EMP-00101</td>
        <td>Sophia Martinez</td>
        <td>Engineering</td>
        <td>Staff Engineer</td>
        <td>San Francisco, CA</td>
        <td>2021-03-15</td>
        <td><span class="badge badge-active">Active</span></td>
        <td>$185,000</td>
      </tr>
      <tr>
        <td class="col-sticky">EMP-00102</td>
        <td>Liam Johnson</td>
        <td>Product Design</td>
        <td>Lead Designer</td>
        <td>New York, NY</td>
        <td>2020-08-01</td>
        <td><span class="badge badge-active">Active</span></td>
        <td>$160,000</td>
      </tr>
      <tr>
        <td class="col-sticky">EMP-00103</td>
        <td>Emma Watson</td>
        <td>Marketing</td>
        <td>Growth Director</td>
        <td>London, UK</td>
        <td>2019-11-12</td>
        <td><span class="badge badge-active">Active</span></td>
        <td>$145,000</td>
      </tr>
      <!-- Multiple table rows -->
    </tbody>
  </table>
</div>
```

#### CSS Implementation
```css
/* Scrollable table viewport */
.table-scroll-container {
  max-width: 100%;
  max-height: 400px;
  overflow: auto; /* Scroll container */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  /* CRITICAL FOR STICKY HEADERS: Use separate borders to prevent border dropping */
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  text-align: left;
}

/* 1. Sticky Table Header (Vertical Scroll) */
.data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem 1rem;
  white-space: nowrap;
  /* Box shadow acts as persistent bottom border during sticky scroll */
  box-shadow: inset 0 -1px 0 #e2e8f0;
}

/* 2. Sticky Left Column (Horizontal Scroll) */
.data-table tbody td.col-sticky {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: #ffffff;
  font-weight: 600;
  color: #0f172a;
  /* Box shadow acts as persistent right border */
  box-shadow: inset -1px 0 0 #e2e8f0, inset 0 -1px 0 #f1f5f9;
}

/* 3. Sticky Top-Left Corner Cell (Both Dimensions) */
.data-table thead th.col-sticky-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3; /* Highest z-index to stay above both header and column */
  background-color: #f1f5f9;
  box-shadow: inset -1px -1px 0 #cbd5e1;
}

.data-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  color: #334155;
}

.data-table tbody tr:hover td {
  background-color: #f8fafc;
}
.data-table tbody tr:hover td.col-sticky {
  background-color: #f8fafc;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-active {
  background-color: #dcfce7;
  color: #15803d;
}
```

---

### Pattern 6: Bottom Sticky Actions Bar (Mobile CTA / Floating Toolbar)

Sticky elements can also stick to the bottom (`bottom: 0`). This is frequently used for checkout summary drawers, mobile bottom navigation bars, or floating action bars that stay visible on screen until the footer or end-of-page area is reached.

#### HTML Structure
```html
<div class="product-page">
  <div class="product-details">
    <!-- Long description, reviews, images -->
  </div>

  <div class="sticky-action-bar">
    <div class="action-bar-inner">
      <div class="price-summary">
        <span class="price-label">Total Price</span>
        <span class="price-amount">$249.00</span>
      </div>
      <div class="action-buttons">
        <button class="btn-secondary">Save for Later</button>
        <button class="btn-checkout">Proceed to Checkout</button>
      </div>
    </div>
  </div>
</div>
```

#### CSS Implementation
```css
.product-page {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.sticky-action-bar {
  position: sticky;
  bottom: 1rem; /* Floats 1rem above viewport bottom */
  z-index: 50;
  
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.action-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.price-summary {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.625rem 1rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-checkout {
  padding: 0.625rem 1.25rem;
  border: none;
  background: #2563eb;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}
```

---

## 3. The 5 Most Common Sticky Pitfalls & How to Fix Them

### Pitfall 1: Ancestor with `overflow: hidden`, `auto`, or `scroll`
* **Symptom:** You added `position: sticky; top: 0;`, but the element scrolls away normally as if it were `position: relative`.
* **Root Cause:** If any ancestor element between the sticky element and the viewport has `overflow: hidden`, `overflow: auto`, `overflow: scroll`, or `overflow: clip`, the sticky element becomes trapped inside that ancestor's coordinate space rather than the viewport.
* **Diagnosis Script:** Run this snippet in your browser DevTools console to locate the offending ancestor:
  ```javascript
  let parent = document.querySelector('.your-sticky-element').parentElement;
  while (parent && parent !== document.body) {
    const { overflow, overflowX, overflowY } = getComputedStyle(parent);
    if (/(auto|scroll|hidden|clip)/.test(overflow + overflowX + overflowY)) {
      console.warn('Offending ancestor breaking sticky:', parent);
    }
    parent = parent.parentElement;
  }
  ```
* **Fix:** Remove `overflow: hidden` on ancestors, or use `overflow: clip` on modern browsers only when horizontal overflow isolation is needed.

---

### Pitfall 2: Missing Inset Property (`top`, `bottom`, `left`, `right`)
* **Symptom:** Element refuses to stick.
* **Root Cause:** `position: sticky` requires an edge threshold. Without `top: 0` (or another value), the browser doesn't know where the element should anchor.
* **Fix:** Always supply at least one inset value:
  ```css
  .sticky-item {
    position: sticky;
    top: 0; /* Or top: 1.5rem, bottom: 0, etc. */
  }
  ```

---

### Pitfall 3: Parent Has Same Height as Sticky Element (Grid / Flexbox Stretch)
* **Symptom:** Sticky element does not stay pinned.
* **Root Cause:** A sticky element can only travel within its parent's bounding box. If the parent container is only as tall as the sticky element itself, there is no scroll runway.
* **Fix:**
  - For CSS Grid / Flexbox sidebars, set `align-self: start;` on the sidebar grid item so its height does not collapse or lock inappropriately.
  - Ensure the parent container spans the full height of the section.

---

### Pitfall 4: `border-collapse: collapse` on Tables
* **Symptom:** Table headers flicker, lose borders, or bleed backgrounds while scrolling.
* **Root Cause:** Collapsed border models share borders across rows/cells, preventing individual `th` cells from retaining independent border layers during GPU-accelerated scrolling.
* **Fix:** Set `border-collapse: separate; border-spacing: 0;` on the `<table>` and use `box-shadow` or cell borders for dividers.

---

### Pitfall 5: Stacking Context & `z-index` Clipping
* **Symptom:** Content below the sticky header scrolls over it instead of under it.
* **Root Cause:** Sibling elements positioned later in the DOM with relative positioning or new stacking contexts (e.g. `transform`, `opacity < 1`, `filter`) render with higher default paint orders.
* **Fix:** Explicitly assign a `z-index` to the sticky element:
  ```css
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 50; /* Creates an elevated stacking layer */
  }
  ```

---

## 4. Complete Interactive Showcase (`index.html`)

Below is a complete, self-contained, copy-paste-ready HTML file combining a Sticky Navigation Header, a Sticky Two-Column Sidebar, and Stacked Section Headers with modern styling.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Sticky Layouts Showcase</title>
  <style>
    /* ==========================================================================
       CSS Reset & Modern Design Tokens
       ========================================================================== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg-body: #f8fafc;
      --bg-surface: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --header-height: 4rem;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-body);
      color: var(--text-main);
      line-height: 1.6;
    }

    /* ==========================================================================
       1. Sticky Top Navigation Bar
       ========================================================================== */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: var(--header-height);
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
    }

    .nav-container {
      max-width: 1200px;
      height: 100%;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary);
      text-decoration: none;
    }

    .menu {
      display: flex;
      gap: 1.5rem;
      list-style: none;
    }

    .menu a {
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.15s ease;
    }

    .menu a:hover {
      color: var(--primary);
    }

    /* ==========================================================================
       2. Multi-Column Layout with Sticky Sidebar
       ========================================================================== */
    .layout-grid {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 2.5rem;
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem 5rem;
    }

    .sticky-sidebar {
      align-self: start; /* PREVENTS STRETCH PITFALL */
      position: sticky;
      top: calc(var(--header-height) + 1.5rem);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
    }

    .sidebar-nav-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .sidebar-menu {
      list-style: none;
    }

    .sidebar-menu li {
      margin-bottom: 0.35rem;
    }

    .sidebar-menu a {
      display: block;
      padding: 0.5rem 0.75rem;
      color: var(--text-main);
      text-decoration: none;
      font-size: 0.9rem;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .sidebar-menu a:hover {
      background-color: #eff6ff;
      color: var(--primary);
    }

    /* ==========================================================================
       3. Main Content with Stacked Section Headers
       ========================================================================== */
    .main-stream {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .content-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
    }

    /* Sticky Section Header */
    .sticky-section-title {
      position: sticky;
      top: var(--header-height);
      z-index: 10;
      background-color: rgba(248, 250, 252, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 0.875rem 1.5rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary);
      border-bottom: 1px solid var(--border-color);
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-body p {
      margin-bottom: 1rem;
      color: #334155;
    }

    .card-body p:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 840px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
      .sticky-sidebar {
        position: static;
      }
    }
  </style>
</head>
<body>

  <!-- 1. Sticky Navigation Bar -->
  <nav class="site-nav">
    <div class="nav-container">
      <a href="#" class="brand">StickyCraft CSS</a>
      <ul class="menu">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#mechanics">Mechanics</a></li>
        <li><a href="#examples">Examples</a></li>
      </ul>
    </div>
  </nav>

  <!-- 2. Multi-column Layout -->
  <div class="layout-grid">
    <!-- Sticky Sidebar -->
    <aside class="sticky-sidebar">
      <div class="sidebar-nav-title">Page Navigation</div>
      <ul class="sidebar-menu">
        <li><a href="#section-1">1. Foundations</a></li>
        <li><a href="#section-2">2. Inset Thresholds</a></li>
        <li><a href="#section-3">3. Boundary Scope</a></li>
        <li><a href="#section-4">4. Stacking Context</a></li>
      </ul>
    </aside>

    <!-- Main Content with Stacked Headers -->
    <main class="main-stream">
      <section id="section-1" class="content-card">
        <h2 class="sticky-section-title">1. Foundations of Sticky Positioning</h2>
        <div class="card-body">
          <p>Sticky positioning behaves as relative positioning until it reaches a designated scroll threshold, at which point it adheres to the viewport edge until its parent container is scrolled past.</p>
          <p>This provides an elegant solution for headers, sidebars, toolbars, and grouped lists without requiring JavaScript scroll listeners or manual DOM style mutations.</p>
        </div>
      </section>

      <section id="section-2" class="content-card">
        <h2 class="sticky-section-title">2. Inset Thresholds & Containment</h2>
        <div class="card-body">
          <p>You must specify at least one threshold property: <code>top</code>, <code>bottom</code>, <code>left</code>, or <code>right</code>. Without this threshold, the browser defaults to standard relative flow.</p>
          <p>The containing block sets the boundary of sticky motion. When the bottom boundary of the section arrives, it smoothly carries the sticky title out of view.</p>
        </div>
      </section>

      <section id="section-3" class="content-card">
        <h2 class="sticky-section-title">3. Boundary Scope & Multi-Headers</h2>
        <div class="card-body">
          <p>Because each section header is scoped to its own section element, as you scroll from Section 2 to Section 3, Section 3's header seamlessly replaces Section 2's header at the top edge.</p>
          <p>This natural containment mechanism eliminates the need for complex intersection observers or scroll math.</p>
        </div>
      </section>

      <section id="section-4" class="content-card">
        <h2 class="sticky-section-title">4. Stacking Context & Elevation</h2>
        <div class="card-body">
          <p>Always pair sticky elements with appropriate <code>z-index</code> values to ensure they float cleanly above standard content blocks and below modal overlays.</p>
          <p>Using translucent backgrounds with <code>backdrop-filter: blur()</code> provides visual continuity, allowing subtle hints of background content to pass through.</p>
        </div>
      </section>
    </main>
  </div>

</body>
</html>
```

---

## 5. Summary & Quick Reference Table

| Feature / Scenario | Required CSS Rule | Key Consideration / Gotcha |
| :--- | :--- | :--- |
| **Sticky Navigation Bar** | `position: sticky; top: 0; z-index: 100;` | Use `backdrop-filter: blur()` for modern glass styling. |
| **Sticky Sidebar (Grid/Flex)** | `align-self: start; position: sticky; top: 2rem;` | Without `align-self: start`, grid item stretches and won't scroll. |
| **Tall Sidebar (Scrollable)** | `max-height: calc(100vh - 4rem); overflow-y: auto;` | Allows sidebar content to scroll internally if taller than viewport. |
| **Stacked Group Headers** | `position: sticky; top: 0;` inside `<section>` | Headers automatically push each other out when their parent ends. |
| **Sticky Table Header** | `thead th { position: sticky; top: 0; }` | Must use `border-collapse: separate;` on table. |
| **Sticky Table First Column** | `tbody td:first-child { position: sticky; left: 0; }` | Give top-left corner cell highest `z-index`. |
| **Stacking Card Deck** | `top: calc(2rem + (var(--index) * 1.5rem));` | Increment `top` offset per card to create staggered stack. |
| **Bottom Floating Bar** | `position: sticky; bottom: 1rem; z-index: 50;` | Sticks to viewport bottom until parent container ends. |
| **Troubleshooting Sticky** | Verify ancestor overflow styles | Any ancestor with `overflow: hidden/auto/scroll` disables viewport stickiness. |
