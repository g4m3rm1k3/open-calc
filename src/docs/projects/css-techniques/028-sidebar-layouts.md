# 028: Sidebar Layouts in Modern CSS

The **Sidebar Layout** is one of the most foundational and ubiquitous design patterns on the web. It pairs a **fixed, intrinsic, or sticky secondary column** (the sidebar) with a **fluid, flexible main content area**. 

You see this pattern everywhere:
- **Application Shells & Dashboards** (e.g., Notion, Slack, Jira, GitHub, VS Code)
- **Documentation Sites & Knowledge Bases** (e.g., MDN, Tailwind Docs, Vite, Next.js)
- **Content & Editorial Platforms** (Blogs with author bios, table of contents, and newsletters)
- **E-Commerce Catalog Pages** (Faceted search and filter sidebars alongside product grids)

While building a sidebar once required float hacks, rigid percentage calculations, or brittle negative margins, modern CSS provides four powerful, elegant paradigms: **CSS Grid**, **CSS Flexbox (including intrinsic breakpoint-free math)**, **CSS `position: sticky`**, and **Container Queries (`@container`)**.

---

## 1. Anatomy of Modern Sidebar Layouts

```
========================= 1. CLASSIC TWO-COLUMN =========================
+----------------------+-------------------------------------------------+
|   SIDEBAR (Fixed)    |               MAIN CONTENT (Fluid)              |
|   width: 280px       |               flex: 1 1 0 / 1fr                 |
|                      |                                                 |
|   - Navigation       |   - Articles / Data tables                      |
|   - Filters          |   - Forms / Visualizations                      |
|   - Controls         |   - Dynamic responsive cards                    |
+----------------------+-------------------------------------------------+

=========================== 2. FULL APP SHELL ============================
+------------------------------------------------------------------------+
|                          HEADER / TOP BAR                              |
+----------------------+---------------------------------+---------------+
|   PRIMARY NAV RAIL   |      MAIN WORKSPACE (Scroll)    | CONTEXT ASIDE |
|   (e.g., 64px-240px) |      (Independent scroll)       | (e.g., 280px) |
+----------------------+---------------------------------+---------------+
|                          FOOTER / STATUS BAR                           |
+------------------------------------------------------------------------+

=========================== 3. STICKY TOC ASIDE ==========================
+-------------------------------------------------+----------------------+
|               MAIN ARTICLE (Scrolls)            |   STICKY ASIDE (TOC) |
|               Long readable content             |   position: sticky   |
|               paragraphs, code blocks, images   |   top: 2rem          |
+-------------------------------------------------+----------------------+
```

### Core Requirements for a Robust Sidebar Layout:
1. **Fluid Main Content:** The main area must expand or contract to fill 100% of the remaining horizontal space without pushing the sidebar off-screen.
2. **Defensive Sizing (`min-width: 0`):** Prevent wide internal children (code blocks, wide tables, images) from blowing out the grid track or flex item.
3. **Independent Scrolling (App Shells):** In dashboard/app modes, the sidebar and main viewport should scroll independently to maintain immediate access to navigation.
4. **Viewport Resilience (`100dvh`):** Handle dynamic mobile browser address bars without jumping or content cutoff.
5. **Mobile Adaptability:** Seamlessly collapse from a multi-column side-by-side view into a single column, an off-canvas drawer, or an icon-only navigation rail.

---

## 2. Technique A: The CSS Grid Application Shell (2D Grid)

CSS Grid is the gold standard for full-page application shells. It manages both columns and rows simultaneously, decouples HTML source order from visual layout, and eliminates the need for arbitrary wrapper elements.

### HTML Markup (`app-shell.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern App Shell Sidebar Layout</title>
  <link rel="stylesheet" href="app-shell.css" />
</head>
<body>
  <div class="app-layout">
    <!-- Top Header -->
    <header class="app-header">
      <div class="brand">
        <svg class="brand-logo" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="4"></rect>
          <path d="M9 3v18"></path>
        </svg>
        <span class="brand-title">DevSpace Studio</span>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" aria-label="Search">Search (⌘K)</button>
        <div class="user-avatar" aria-label="User Profile">JD</div>
      </div>
    </header>

    <!-- Sidebar Navigation -->
    <aside class="app-sidebar" aria-label="Primary Navigation">
      <nav class="sidebar-nav">
        <div class="nav-group">
          <span class="nav-heading">Platform</span>
          <a href="#overview" class="nav-item is-active">
            <span class="nav-icon">📊</span> Overview
          </a>
          <a href="#analytics" class="nav-item">
            <span class="nav-icon">📈</span> Analytics
          </a>
          <a href="#deployments" class="nav-item">
            <span class="nav-icon">🚀</span> Deployments
            <span class="nav-badge">12</span>
          </a>
        </div>

        <div class="nav-group">
          <span class="nav-heading">Settings</span>
          <a href="#team" class="nav-item">
            <span class="nav-icon">👥</span> Team Access
          </a>
          <a href="#integrations" class="nav-item">
            <span class="nav-icon">🔌</span> Integrations
          </a>
          <a href="#billing" class="nav-item">
            <span class="nav-icon">💳</span> Billing & Plans
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="storage-meter">
          <div class="meter-label">
            <span>Storage Used</span>
            <span>78%</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill" style="width: 78%;"></div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Scrollable Workspace -->
    <main class="app-main">
      <div class="content-container">
        <div class="page-header">
          <div>
            <h1 class="page-title">Deployments & Services</h1>
            <p class="page-description">Manage microservices, edge routing, and continuous integration pipelines.</p>
          </div>
          <button class="btn btn-primary">+ New Service</button>
        </div>

        <!-- Dashboard Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total Requests</span>
            <span class="stat-value">4.82M</span>
            <span class="stat-delta positive">+14.2% from last week</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Avg. Latency</span>
            <span class="stat-value">28ms</span>
            <span class="stat-delta positive">-4ms faster</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Error Rate (5xx)</span>
            <span class="stat-value">0.012%</span>
            <span class="stat-delta neutral">Stable</span>
          </div>
        </div>

        <!-- Wide Table Section (Tests overflow containment) -->
        <div class="panel">
          <h2 class="panel-title">Active Edge Clusters</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cluster ID</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Instances</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>us-east-prod-01</code></td>
                  <td>N. Virginia (us-east-1)</td>
                  <td><span class="badge badge-success">Healthy</span></td>
                  <td>32 pods</td>
                  <td>99.99%</td>
                </tr>
                <tr>
                  <td><code>eu-central-prod-02</code></td>
                  <td>Frankfurt (eu-central-1)</td>
                  <td><span class="badge badge-success">Healthy</span></td>
                  <td>18 pods</td>
                  <td>99.98%</td>
                </tr>
                <tr>
                  <td><code>ap-southeast-prod-01</code></td>
                  <td>Singapore (ap-southeast-1)</td>
                  <td><span class="badge badge-warning">Degraded</span></td>
                  <td>12 pods</td>
                  <td>99.82%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

### CSS Stylesheet (`app-shell.css`)

```css
/* ==========================================================================
   1. Design Tokens & Global Reset
   ========================================================================== */
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  
  /* Color Palette */
  --color-bg: #0b0f17;
  --color-surface: #111827;
  --color-surface-hover: #1f2937;
  --color-surface-card: #141d2e;
  --color-border: #1f293d;
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-accent: #10b981;
  --color-warning: #f59e0b;

  /* Sizing Units */
  --header-height: 64px;
  --sidebar-width: 260px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.5;
  overflow: hidden; /* Prevents outer double scrollbars in App Shell */
}

/* ==========================================================================
   2. Grid App Shell Architecture
   ========================================================================== */
.app-layout {
  display: grid;
  height: 100dvh; /* Dynamic mobile viewport height */
  width: 100vw;

  /* Define 2 Rows: Header (fixed) and Content (takes all remaining height) */
  grid-template-rows: var(--header-height) 1fr;

  /* Define 2 Columns: Sidebar (fixed width) and Main (fluid 1fr) */
  grid-template-columns: var(--sidebar-width) 1fr;

  /* Named Area Grid System */
  grid-template-areas:
    "header  header"
    "sidebar main";
}

/* ==========================================================================
   3. Header Area
   ========================================================================== */
.app-header {
  grid-area: header;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.brand-logo {
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
}

/* ==========================================================================
   4. Sidebar Area (Independent Scroll Container)
   ========================================================================== */
.app-sidebar {
  grid-area: sidebar;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto; /* Scrollable if navigation items exceed viewport */
  overscroll-behavior: contain; /* Isolates scroll chaining */
}

.sidebar-nav {
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-heading {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 0.25rem 0.75rem;
  margin-bottom: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.nav-item.is-active {
  background-color: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-badge {
  margin-left: auto;
  font-size: 0.75rem;
  background-color: var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.storage-meter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.meter-label {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
}

.meter-track {
  height: 6px;
  background-color: var(--color-border);
  border-radius: 9999px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 9999px;
}

/* ==========================================================================
   5. Main Scrollable Workspace Area
   ========================================================================== */
.app-main {
  grid-area: main;
  overflow-y: auto; /* Independent vertical scrolling */
  overscroll-behavior: contain;
  background-color: var(--color-bg);
  
  /* CRITICAL: Allows grid tracks to shrink below child content size */
  min-width: 0;
  min-height: 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.page-description {
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  font-size: 0.9375rem;
}

/* UI Elements */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.btn-secondary:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat-delta {
  font-size: 0.75rem;
  font-weight: 500;
}
.stat-delta.positive { color: var(--color-accent); }
.stat-delta.neutral { color: var(--color-text-muted); }

/* Panel & Responsive Table */
.panel {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table code {
  font-family: var(--font-mono);
  background-color: var(--color-surface-hover);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

/* ==========================================================================
   6. Responsive Layout Breakpoints
   ========================================================================== */
@media (max-width: 840px) {
  html, body {
    overflow: auto; /* Restores normal document scrolling on mobile */
  }

  .app-layout {
    height: auto;
    min-height: 100dvh;
    grid-template-rows: var(--header-height) auto 1fr;
    grid-template-columns: 100%;
    grid-template-areas:
      "header"
      "sidebar"
      "main";
  }

  .app-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .nav-group {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .nav-heading {
    display: none;
  }
}
```

---

## 3. Technique B: The "Holy Sidebar" Algorithm (Zero-Media-Query Flexbox)

Popularized by Heydon Pickering (*Every Layout*), this pure CSS Flexbox technique creates an **intrinsically responsive sidebar without requiring a single `@media` query**.

### The Core Concept & Mathematics:
1. Both the **Sidebar** and **Main** are siblings inside a wrapping flex container (`display: flex; flex-wrap: wrap;`).
2. The **Sidebar** is assigned a fixed target basis (`flex-basis: 250px; flex-grow: 1;`).
3. The **Main Content** is given an oversized growth factor and a proportional minimum percentage:
   ```css
   .main {
     flex-basis: 0;
     flex-grow: 999;
     min-inline-size: 55%; /* Or min-width: 55% */
   }
   ```
4. **How the Magic Happens:**
   - **On Wide Screens:** The main content expands `999x` faster than the sidebar to claim all available room, while the sidebar remains near its `250px` basis.
   - **On Narrow Screens:** As soon as the main content cannot satisfy its `55%` minimum threshold alongside the `250px` sidebar, the layout breaks to a new line. When wrapped, both elements expand via `flex-grow` to take **100% full width** automatically!

### Complete HTML & CSS Implementation

```html
<section class="intrinsic-sidebar-wrapper">
  <aside class="intrinsic-sidebar">
    <div class="card-box">
      <h3>Table of Contents</h3>
      <ul class="toc-list">
        <li><a href="#intro">Introduction</a></li>
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#performance">Performance Metrics</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
      </ul>
    </div>
  </aside>

  <main class="intrinsic-main">
    <article class="card-box article-content">
      <h2>Understanding Intrinsic Sizing in Modern Layouts</h2>
      <p>
        By letting content and mathematical constraints dictate wrapping rather than hardcoded 
        viewport breakpoints, our layout automatically adjusts to any parent container width.
      </p>
      <p>
        Whether placed in a modal, a split-pane, or a mobile viewport, it behaves consistently!
      </p>
    </article>
  </main>
</section>
```

```css
/* Container: Wrapping Flexbox with Gap */
.intrinsic-sidebar-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
}

/* Sidebar: Target width of 240px, grows moderately */
.intrinsic-sidebar {
  flex-basis: 240px;
  flex-grow: 1;
}

/* Main Content: Absorbs available space, wraps when below 55% width */
.intrinsic-main {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 55%;
}

/* Visual Styles */
.card-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toc-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.toc-list a {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9375rem;
}

.toc-list a:hover {
  text-decoration: underline;
}
```

---

## 4. Technique C: Sticky Sidebar with CSS `position: sticky`

In documentation sites and long-form articles, you often want the sidebar (e.g., Table of Contents or Social Sharing Bar) to remain **pinned in view as the user scrolls down the page**.

### HTML Structure (`sticky-sidebar.html`)

```html
<div class="doc-layout">
  <!-- Main Article (Long scrolling content) -->
  <main class="doc-main">
    <article class="prose">
      <h1>Advanced CSS Architecture</h1>
      <p class="lead">Building maintainable, resilient design systems with modern CSS primitives.</p>

      <section id="section-1">
        <h2>1. Cascade Layers (@layer)</h2>
        <p>
          Cascade layers grant explicit control over the specificity order of style declarations.
          By organizing styles into <code>reset</code>, <code>base</code>, <code>components</code>, 
          and <code>utilities</code>, teams avoid specificity wars without relying on <code>!important</code>.
        </p>
        <div class="callout">
          <strong>Tip:</strong> Layers are evaluated by declaration order: the last declared layer wins!
        </div>
      </section>

      <section id="section-2">
        <h2>2. Container Queries (@container)</h2>
        <p>
          Unlike viewport media queries, container queries evaluate the dimensions of a component's 
          direct parent. This enables truly modular components that look perfect in narrow sidebars, 
          modal dialogs, or expansive main content streams.
        </p>
      </section>

      <section id="section-3">
        <h2>3. Color Spaces & OKLCH</h2>
        <p>
          The OKLCH color space matches human visual perception, making programmatic palette 
          generation predictable with uniform perceived lightness across all hues.
        </p>
      </section>
    </article>
  </main>

  <!-- Sticky Sidebar (Table of Contents) -->
  <aside class="doc-sidebar">
    <div class="sticky-card">
      <h3 class="toc-title">On This Page</h3>
      <nav class="toc-nav">
        <a href="#section-1" class="toc-link is-active">1. Cascade Layers</a>
        <a href="#section-2" class="toc-link">2. Container Queries</a>
        <a href="#section-3" class="toc-link">3. Color Spaces & OKLCH</a>
      </nav>
      <hr class="divider" />
      <div class="feedback-box">
        <span>Was this helpful?</span>
        <div class="feedback-buttons">
          <button class="mini-btn">👍 Yes</button>
          <button class="mini-btn">👎 No</button>
        </div>
      </div>
    </div>
  </aside>
</div>
```

### CSS Implementation (`sticky-sidebar.css`)

```css
/* Two-Column Grid for Docs */
.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px; /* Fluid main + 260px sidebar */
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  align-items: start; /* CRITICAL: Prevents sidebar track from stretching to full height */
}

.doc-main {
  min-width: 0; /* Prevents overflow blowouts */
}

/* ==========================================================================
   Sticky Sidebar Configuration
   ========================================================================== */
.doc-sidebar {
  /* Enables stickiness relative to the scrolling viewport */
  position: sticky;
  top: 2rem; /* Distance from viewport top when sticking */

  /* Constrain height to viewport so internal content can scroll if long */
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.sticky-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.toc-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toc-link {
  color: #475569;
  text-decoration: none;
  font-size: 0.875rem;
  padding-left: 0.5rem;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
}

.toc-link:hover {
  color: #0f172a;
  border-left-color: #94a3b8;
}

.toc-link.is-active {
  color: #2563eb;
  font-weight: 600;
  border-left-color: #2563eb;
}

.divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.25rem 0;
}

.feedback-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #64748b;
}

.feedback-buttons {
  display: flex;
  gap: 0.5rem;
}

.mini-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Responsive Collapse for Small Screens */
@media (max-width: 900px) {
  .doc-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .doc-sidebar {
    position: static; /* Disable stickiness on mobile */
    max-height: none;
    order: -1; /* Display TOC above article on mobile if desired */
  }
}
```

---

## 5. Technique D: Container-Queried Modular Sidebar

Modern component design often places the exact same sidebar widget into different containers (e.g., as a standalone sidebar on desktop, or inside a modal dialog on mobile). With **CSS Container Queries (`@container`)**, the sidebar's internal widgets adapt to their allocated width rather than the browser window!

```css
/* 1. Register the Sidebar as a Query Container */
.app-sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* 2. Style internal elements based on sidebar's width */
.sidebar-user-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* When the sidebar has ample room (e.g., expanded state > 220px) */
@container sidebar (min-width: 220px) {
  .sidebar-user-card {
    flex-direction: row;
    align-items: center;
  }
  
  .user-details {
    display: block;
  }
}

/* When the sidebar is collapsed or narrow (e.g. icon-rail state < 100px) */
@container sidebar (max-width: 99px) {
  .user-details,
  .nav-item span.label {
    display: none; /* Only show icons */
  }
  
  .nav-item {
    justify-content: center;
    padding: 0.75rem 0;
  }
}
```

---

## 6. Deep Technical Breakdown & Key CSS Properties

| CSS Property / Concept | Purpose & Technical Mechanics |
| :--- | :--- |
| **`grid-template-columns: 260px 1fr`** | Creates an explicit two-column track. The first is locked at `260px`; `1fr` automatically assigns 100% of remaining available space to the main column. |
| **`minmax(200px, 280px) 1fr`** | Sizing constraint that lets the sidebar flex between a minimum and maximum threshold. |
| **`min-width: 0` / `min-inline-size: 0`** | **CRITICAL DEFENSE:** By default, grid items have `min-width: auto`, preventing them from shrinking smaller than their contents. Wide child elements (code snippets, tables) will break the layout unless `min-width: 0` is specified on `.app-main`. |
| **`min-height: 100dvh`** | Dynamic Viewport Height (`dvh`) ensures the app shell accurately fills 100% of the screen across mobile browsers without jumping when URL bars collapse. |
| **`overscroll-behavior: contain`** | Prevents scroll chaining. When scrolling reaches the top or bottom of the sidebar, the main page behind it won't scroll unintentionally. |
| **`align-items: start` (on Sticky Parent)** | In CSS Grid, items stretch vertically by default (`align-items: stretch`). A stretched sidebar matches the main column height, leaving no room to stick! Setting `align-items: start` gives the sidebar its natural height so it can freely slide and stick. |
| **`flex-basis: 0; flex-grow: 999;`** | The mathematical engine behind Heydon's breakpoint-free sidebar. Forces the main item to dominate horizontal expansion while maintaining intrinsic wrapping. |

---

## 7. Comparison Matrix: Which Sidebar Technique Should You Use?

| Feature | CSS Grid App Shell | Intrinsic Flexbox | Sticky `position: sticky` |
| :--- | :--- | :--- | :--- |
| **Best Used For** | Web Apps, Dashboards, IDEs | Fluid Landing Pages, Cards | Blogs, Docs, Table of Contents |
| **Scrolling Model** | Independent inner pane scrolls | Full page document scroll | Full page document scroll |
| **Media Queries** | Required for major breakpoints | **0 Media Queries Needed** | Minimal for un-sticking on mobile |
| **DOM Requirements** | Flat structure | Sibling elements | Sibling elements |
| **Header/Footer Integration**| Built-in 2D rows | Requires nested flex containers | Sits inside page body |

---

## 8. Common Pitfalls & Troubleshooting Guide

### 1. The Grid Blowout Bug
* **Symptom:** You add a code block (`<pre><code>`) or a wide `<table>` inside the main column, and the sidebar gets squished or the entire page gains horizontal scroll.
* **Fix:** Add `min-width: 0;` (or `min-inline-size: 0;`) to the `.app-main` grid child.

### 2. Sticky Sidebar Won't Stick
* **Symptom:** `position: sticky; top: 2rem;` is declared on `.sidebar`, but it scrolls away naturally.
* **Troubleshooting Steps:**
  1. Check ancestor elements for `overflow: hidden`, `overflow: auto`, or `overflow: scroll`. Any overflow container on a parent kills sticky behavior.
  2. Check the parent's `align-items` property in Grid/Flexbox. If `align-items: stretch` (the default) is active, the sidebar is already the exact same height as the parent, meaning there is zero distance to slide. Add `align-items: start;` to the grid/flex parent.
  3. Ensure a `top`, `bottom`, `left`, or `right` value is explicitly specified.

### 3. Mobile Double Scrollbars
* **Symptom:** On desktop app shells with independent panes, desktop works great, but mobile screens show clunky nested scrollbars.
* **Fix:** In your `@media (max-width: 840px)` query, set `html, body { overflow: auto; }` and reset `.app-layout, .app-main, .app-sidebar { height: auto; overflow: visible; }`.

---

## 9. Hands-On Exercises & Experiments

1. **Invert the Sidebar:** Modify the CSS Grid demo's `grid-template-areas` to `"header header" "main sidebar"` and `grid-template-columns: 1fr var(--sidebar-width)`. Notice how the sidebar moves to the right without changing a single line of HTML.
2. **Build an Icon-Only Collapsed Rail:** Add a CSS class `.is-collapsed` that sets `--sidebar-width: 72px;` and uses `@container` or simple class modifiers to hide navigation labels while keeping icons centered.
3. **Experiment with Heydon's Ratio:** In the Flexbox Intrinsic Sidebar demo, adjust `min-inline-size: 55%` down to `40%` and up to `70%`. Resize your browser window and observe the exact pixel threshold where the wrapping occurs!
