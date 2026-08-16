# 026: Full-Screen Layouts in Modern CSS

**Name:** Full-Screen Layouts  
**Category:** Layout & Viewport Sizing  
**Difficulty:** 2/5  
**What it produces:** Immersive web interfaces that accurately span 100% of the viewport width and height—such as application shells, interactive dashboards, landing page hero sections, split-screen portals, and vertical scroll-snap presentations—without unexpected vertical clipping, address-bar jumping on mobile, or unwanted layout shifts.  
**Why it works:** Modern CSS viewport units (`100dvh`, `100svh`, `100lvh`), CSS Grid/Flexbox height distribution (`1fr`, `flex: 1`), and CSS Box Sizing rules allow developers to calculate visible screen space deterministically, accounting for mobile browser toolbars, virtual keyboards, and device safe area notches.  
**Required CSS concepts:** Viewport Units (`vh`, `vw`, `dvh`, `svh`, `lvh`), Box Model & Sizing (`box-sizing: border-box`, `min-height`, `height`), CSS Grid & Flexbox Formatting Contexts, Mobile Safe Area Insets (`env(safe-area-inset-*)`), Overflow Isolation (`overflow: hidden`, `overflow-y: auto`, `overscroll-behavior`).  

---

## 1. Anatomy & Mental Model

A full-screen layout aims to fill the user's visible screen area without creating unintended scrollbars or losing content beneath browser navigation toolbars.

```
+-------------------------------------------------------------+  ▲
|  [ TOP TOOLBAR / DYNAMIC BROWSER ADDRESS BAR (Expand/Shrink)] |  │
+-------------------------------------------------------------+  │
|  HEADER (Site Logo, Search, User Profile)                   |  │
+-------------------------+-----------------------------------+  │ 100dvh
|                         |  MAIN CONTENT AREA                |  │ (Dynamic
|  SIDEBAR NAVIGATION     |  - Independent vertical scroll    |  │  Viewport
|  - Fixed or collapsible |  - Flexible data cards / tables   |  │  Height)
|  - Full height column   |  - Zero window-level scroll jank  |  │
|                         |                                   |  │
+-------------------------+-----------------------------------+  │
|  [ BOTTOM SAFE AREA / MOBILE HOME INDICATOR / TOOLBAR ]     |  │
+-------------------------------------------------------------+  ▼
```

### The 4 Pillars of Full-Screen Layouts:
1. **Accurate Height Sizing:** Using `100dvh` (with fallback to `100vh` or `100%`) instead of fixed pixel heights so the container adapts seamlessly to desktop monitors, tablets, and phones.
2. **Internal Scroll Containment:** Locking the outer document window (`overflow: hidden`) and allowing only specific internal panels (e.g., `<main>`) to scroll (`overflow-y: auto`).
3. **Safe Area Awareness:** Accommodating hardware notches, home indicator bars, and punch-hole cameras using `env(safe-area-inset-*)` and `viewport-fit=cover`.
4. **Resilience to Content Overflow:** Using `min-height` instead of rigid `height` when content might expand beyond the viewport on smaller screens.

---

## 2. The Viewport Units Evolution: `vh` vs `dvh` vs `svh` vs `lvh`

For years, developers used `height: 100vh` to create full-screen layouts. However, on mobile devices (iOS Safari and Chrome for Android), `100vh` caused a notorious bug: the browser UI (URL bar and bottom toolbar) dynamically expands and collapses as the user scrolls, but `100vh` is calculated based on the *maximum* height where toolbars are hidden. This caused bottom buttons, action bars, and footers to be covered by the browser's own UI.

CSS Viewport Units Level 4 introduced specialized units to solve this once and for all:

```
                  MOBILE BROWSER VIEWPORT STATES
  
   [Toolbars Expanded]                        [Toolbars Collapsed]
+-------------------------+                +-------------------------+
| [ URL Bar Visible ]     |                | [ Minimal URL Bar ]     |
+-------------------------+                +-------------------------+
|                         |                |                         |
|                         |                |                         |
|                         |                |                         |
|  Small Viewport Height  |                |  Large Viewport Height  |
|  (100svh)               |                |  (100lvh)               |
|                         |                |                         |
|                         |                |                         |
+-------------------------+                |                         |
| [ Bottom Toolbar ]      |                |                         |
+-------------------------+                +-------------------------+
```

| Unit | Name | Description | Best Use Case |
| :--- | :--- | :--- | :--- |
| `100vh` | Viewport Height (Legacy) | Static height based on browser's initial estimate. | Fallback for older browsers. |
| `100svh` | Small Viewport Height | Height when all browser toolbars are **expanded** (smallest available space). | Guaranteed visible alerts, critical forms, login dialogs. |
| `100lvh` | Large Viewport Height | Height when all browser toolbars are **collapsed** (largest available space). | Background hero artwork, wallpaper illustrations. |
| `100dvh` | Dynamic Viewport Height | **Dynamically updates** in real time as toolbars expand or collapse. | **Primary standard for modern full-screen apps and shells.** |
| `100cqh` | Container Query Height | Height relative to the nearest query container parent. | Modular full-height component cards. |

### The Production Fallback Syntax
```css
.full-screen-container {
  min-height: 100vh;   /* Fallback for legacy browsers */
  min-height: 100dvh;  /* Modern standard */
}
```

---

## 3. Pattern 1: Modern SaaS Application Shell (Grid-Based)

The **Application Shell** pattern is the backbone of single-page apps (SPAs), web consoles, IDEs, and admin dashboards. The header and sidebar remain locked in place, while the main view scrolls independently.

### HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>App Shell - Full-Screen Layout</title>
  <link rel="stylesheet" href="app-shell.css" />
</head>
<body>
  <div class="app-shell">
    <!-- Top Global Header -->
    <header class="app-header">
      <div class="header-brand">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span class="brand-name">NexusCloud</span>
      </div>
      <div class="header-search">
        <input type="search" placeholder="Search resources, logs, clusters..." />
      </div>
      <div class="header-user">
        <button class="btn-notification" aria-label="Notifications">🔔</button>
        <div class="user-avatar" title="Alex Rivera">AR</div>
      </div>
    </header>

    <!-- Collapsible / Full-Height Sidebar -->
    <aside class="app-sidebar" aria-label="Main Navigation">
      <nav class="sidebar-nav">
        <ul>
          <li><a href="#dashboard" class="nav-item active"><span class="icon">📊</span> Dashboard</a></li>
          <li><a href="#deployments" class="nav-item"><span class="icon">🚀</span> Deployments</a></li>
          <li><a href="#databases" class="nav-item"><span class="icon">🗄️</span> Databases</a></li>
          <li><a href="#analytics" class="nav-item"><span class="icon">📈</span> Analytics</a></li>
          <li><a href="#settings" class="nav-item"><span class="icon">⚙️</span> Settings</a></li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="system-status">
          <span class="status-indicator"></span>
          <span>All systems operational</span>
        </div>
      </div>
    </aside>

    <!-- Scrollable Main Viewport Area -->
    <main class="app-main">
      <div class="main-content">
        <div class="page-header">
          <h1>Cluster Overview</h1>
          <button class="btn-primary">+ New Cluster</button>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-title">Active Nodes</span>
            <span class="metric-value">128</span>
            <span class="metric-change positive">↑ 12% vs last week</span>
          </div>
          <div class="metric-card">
            <span class="metric-title">CPU Utilization</span>
            <span class="metric-value">42.8%</span>
            <span class="metric-change neutral">Normal range</span>
          </div>
          <div class="metric-card">
            <span class="metric-title">Memory Allocation</span>
            <span class="metric-value">78.2 GB</span>
            <span class="metric-change positive">Healthy buffer</span>
          </div>
          <div class="metric-card">
            <span class="metric-title">Error Rate</span>
            <span class="metric-value">0.003%</span>
            <span class="metric-change positive">↓ 0.01%</span>
          </div>
        </div>

        <section class="data-table-section">
          <h2>Active Services</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>Instances</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>auth-gateway</strong></td>
                  <td><span class="badge badge-success">Running</span></td>
                  <td>us-east-1</td>
                  <td>8 / 8</td>
                  <td>99.99%</td>
                </tr>
                <tr>
                  <td><strong>payments-worker</strong></td>
                  <td><span class="badge badge-success">Running</span></td>
                  <td>us-east-1</td>
                  <td>4 / 4</td>
                  <td>99.95%</td>
                </tr>
                <tr>
                  <td><strong>image-processor</strong></td>
                  <td><span class="badge badge-warning">High Load</span></td>
                  <td>eu-central-1</td>
                  <td>12 / 16</td>
                  <td>99.80%</td>
                </tr>
                <tr>
                  <td><strong>realtime-sync</strong></td>
                  <td><span class="badge badge-success">Running</span></td>
                  <td>ap-southeast-1</td>
                  <td>6 / 6</td>
                  <td>100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</body>
</html>
```

### CSS Implementation (`app-shell.css`)

```css
/* ==========================================================================
   1. Reset, CSS Variables & Safe Area Setup
   ========================================================================== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --color-bg-base: #090d16;
  --color-bg-surface: #111827;
  --color-bg-subtle: #1f2937;
  --color-border: #374151;
  --color-text-main: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;

  --header-height: 64px;
  --sidebar-width: 250px;
}

/* Prevent body scrolling so the app behaves like native desktop software */
html,
body {
  height: 100%;
  overflow: hidden;
  font-family: var(--font-sans);
  background-color: var(--color-bg-base);
  color: var(--color-text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ==========================================================================
   2. Full-Screen App Shell Grid
   ========================================================================== */
.app-shell {
  display: grid;
  height: 100vh;
  height: 100dvh; /* Dynamic full screen */
  width: 100vw;
  overflow: hidden;

  /* 2 Rows: Fixed Header (auto/64px), Remaining Body (1fr) */
  grid-template-rows: var(--header-height) 1fr;

  /* 2 Columns: Fixed Sidebar (250px), Fluid Main (1fr) */
  grid-template-columns: var(--sidebar-width) 1fr;

  grid-template-areas:
    "header  header"
    "sidebar main";

  /* Respect device safe area insets (notches, home bars) */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

/* ==========================================================================
   3. Header Component
   ========================================================================== */
.app-header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.15rem;
}

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--color-accent);
}

.header-search input {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  width: 320px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.header-search input:focus {
  border-color: var(--color-accent);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-notification {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* ==========================================================================
   4. Sidebar Component (Fixed Height, Internal Column)
   ========================================================================== */
.app-sidebar {
  grid-area: sidebar;
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem 0.75rem;
  overflow-y: auto; /* Scrollable if sidebar navigation exceeds height */
}

.sidebar-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background-color: var(--color-bg-subtle);
  color: var(--color-text-main);
}

.nav-item.active {
  background-color: var(--color-accent);
  color: #ffffff;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

/* ==========================================================================
   5. Main Scrollable Content Area
   ========================================================================== */
.app-main {
  grid-area: main;
  overflow-y: auto; /* Independent inner scrolling */
  overflow-x: hidden;
  min-width: 0;     /* CRITICAL: Prevents 1fr grid blow-out from wide children */
  min-height: 0;    /* CRITICAL: Allows 1fr grid track to shrink and scroll */
  padding: 2rem;
  background-color: var(--color-bg-base);
  overscroll-behavior-y: contain; /* Prevents parent rubber-banding */
  scrollbar-gutter: stable;       /* Prevents layout shift when scrollbar appears */
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
}

.btn-primary {
  background-color: var(--color-accent);
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
}

/* Metrics Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-title {
  font-size: 0.825rem;
  color: var(--color-text-muted);
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.metric-change {
  font-size: 0.775rem;
}
.metric-change.positive { color: var(--color-success); }
.metric-change.neutral { color: var(--color-text-muted); }

/* Table Container */
.table-container {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

th, td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-success { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }

/* ==========================================================================
   6. Responsive Layout Breakpoints
   ========================================================================== */
@media (max-width: 840px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-height) 1fr auto;
    grid-template-areas:
      "header"
      "main"
      "sidebar";
  }

  .header-search input {
    display: none;
  }

  .app-sidebar {
    border-right: none;
    border-top: 1px solid var(--color-border);
    padding: 0.5rem;
  }

  .app-sidebar .sidebar-footer {
    display: none;
  }

  .sidebar-nav ul {
    flex-direction: row;
    justify-content: space-around;
  }

  .nav-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .app-main {
    padding: 1.25rem;
  }
}
```

---

## 4. Pattern 2: Immersive Full-Screen Hero (Landing Page Section)

Landing pages often require a 100% full-viewport hero section that perfectly frames an eye-catching headline, background media/gradients, and a call-to-action button, with a subtle scroll indicator pinned to the bottom.

### HTML Structure (`hero.html`)

```html
<section class="hero-fullscreen">
  <div class="hero-background"></div>
  
  <header class="hero-navbar">
    <span class="logo">AURA.AI</span>
    <nav class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#docs">Documentation</a>
    </nav>
    <a href="#get-started" class="cta-pill">Launch App</a>
  </header>

  <div class="hero-content">
    <span class="hero-badge">✨ Next-Gen Neural Intelligence</span>
    <h1 class="hero-title">Build Autonomous Systems in Real Time</h1>
    <p class="hero-subtitle">
      Deploy stateful cognitive agents, vector memory pipelines, and edge-native neural models with zero infrastructure friction.
    </p>
    <div class="hero-actions">
      <button class="btn-hero-primary">Start Free Trial</button>
      <button class="btn-hero-secondary">Book a Demo →</button>
    </div>
  </div>

  <div class="hero-scroll-indicator" aria-hidden="true">
    <span>Scroll to explore</span>
    <div class="mouse-icon">
      <div class="mouse-wheel"></div>
    </div>
  </div>
</section>

<!-- Next Page Section -->
<section id="features" class="content-section">
  <div class="container">
    <h2>Engineered for High-Throughput Autonomy</h2>
    <p>Continue standard document flow below the full-screen hero fold...</p>
  </div>
</section>
```

### CSS Implementation (`hero.css`)

```css
/* ==========================================================================
   Full-Screen Hero Container
   ========================================================================== */
.hero-fullscreen {
  position: relative;
  width: 100%;
  /* Use min-height so small screens with large content don't clip */
  min-height: 100vh;
  min-height: 100dvh;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  padding: 1.5rem 2rem 2.5rem;
  overflow: hidden;
  background-color: #030712;
  color: #ffffff;
  box-sizing: border-box;
}

/* Subtle Animated Background Mesh */
.hero-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
  filter: blur(40px);
  z-index: 1;
  pointer-events: none;
}

/* Top Navbar inside Hero */
.hero-navbar {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 900;
  font-size: 1.35rem;
  letter-spacing: -0.05em;
  background: linear-gradient(to right, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #ffffff;
}

.cta-pill {
  padding: 0.5rem 1.15rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.cta-pill:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Center Hero Content */
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin: auto 0; /* Auto vertical margins keep content perfectly centered */
  padding: 2rem 0;
}

.hero-badge {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 9999px;
  color: #a5b4fc;
  font-size: 0.8rem;
  font-weight: 600;
}

.hero-title {
  /* Fluid typography scaling smoothly between 2rem and 4rem */
  font-size: clamp(2.25rem, 5vw + 1rem, 4.25rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.5vw + 0.5rem, 1.25rem);
  color: #94a3b8;
  max-width: 640px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.6);
}

.btn-hero-secondary {
  background: transparent;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Pinned Scroll Down Indicator */
.hero-scroll-indicator {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.mouse-icon {
  width: 20px;
  height: 32px;
  border: 2px solid #64748b;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.mouse-wheel {
  width: 4px;
  height: 8px;
  background-color: #94a3b8;
  border-radius: 2px;
  animation: scrollWheel 1.5s infinite ease-in-out;
}

@keyframes scrollWheel {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

/* Subsequent Standard Content Section */
.content-section {
  padding: 6rem 2rem;
  background-color: #0f172a;
  color: #f8fafc;
}

.content-section .container {
  max-width: 1100px;
  margin: 0 auto;
}
```

---

## 5. Pattern 3: Full-Screen Split Screen (50/50 Desktop / Stacked Mobile)

The **Split Screen** layout is standard for authentication pages (Login, Sign-Up), onboarding flows, and comparison views. One side holds a branded graphic or testimonial, while the other side contains an interactive form.

### HTML Structure (`split-screen.html`)

```html
<div class="split-layout">
  <!-- Left Media Panel (Fixed/Branded) -->
  <div class="split-media">
    <div class="media-overlay"></div>
    <div class="media-content">
      <span class="quote-badge">Customer Story</span>
      <blockquote class="quote-text">
        “NexusCloud cut our deployment pipeline times by 70%. We migrated our entire fleet in less than a weekend.”
      </blockquote>
      <div class="quote-author">
        <strong>Sarah Chen</strong>
        <span>VP of Engineering, HyperScale Inc.</span>
      </div>
    </div>
  </div>

  <!-- Right Interactive Panel (Scrollable Form) -->
  <div class="split-content">
    <div class="form-wrapper">
      <div class="form-header">
        <h2>Create your account</h2>
        <p>Start your 14-day free trial. No credit card required.</p>
      </div>

      <form class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" placeholder="Alex Rivera" required />
        </div>

        <div class="form-group">
          <label for="email">Work Email</label>
          <input type="email" id="email" placeholder="alex@company.com" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="••••••••••••" required />
        </div>

        <button type="submit" class="btn-submit">Get Started</button>
      </form>

      <footer class="form-footer">
        <p>Already have an account? <a href="#login">Log in</a></p>
      </footer>
    </div>
  </div>
</div>
```

### CSS Implementation (`split-screen.css`)

```css
/* Container fills entire screen */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100vw;
}

/* Left Branded Panel */
.split-media {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 4rem;
  overflow: hidden;
}

.media-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quote-badge {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.quote-text {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.4;
}

.quote-author strong {
  display: block;
  font-size: 1rem;
}

.quote-author span {
  font-size: 0.875rem;
  color: #c7d2fe;
}

/* Right Content Panel */
.split-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background-color: #ffffff;
  overflow-y: auto; /* Handles tall forms on smaller vertical screens */
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-header h2 {
  font-size: 1.85rem;
  color: #0f172a;
  font-weight: 700;
}

.form-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.btn-submit {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 0.85rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #4338ca;
}

.form-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.form-footer a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
}

/* Mobile Responsive Stack */
@media (max-width: 860px) {
  .split-layout {
    grid-template-columns: 1fr;
  }

  .split-media {
    padding: 2.5rem 1.5rem;
  }

  .quote-text {
    font-size: 1.15rem;
  }
}
```

---

## 6. Pattern 4: Full-Page Vertical Scroll Snap (Presentations & Slides)

CSS Scroll Snap lets users cleanly swipe or scroll through a sequence of full-screen sections with native momentum physics.

### HTML Structure (`scroll-snap.html`)

```html
<div class="snap-container">
  <section class="snap-section section-one" id="slide-1">
    <div class="slide-content">
      <span class="slide-step">01 // DISCOVERY</span>
      <h2>Autonomous Intelligence</h2>
      <p>Continuous reasoning across distributed edge clusters.</p>
    </div>
  </section>

  <section class="snap-section section-two" id="slide-2">
    <div class="slide-content">
      <span class="slide-step">02 // INTEGRATION</span>
      <h2>Unified Vector Pipelines</h2>
      <p>Sub-millisecond semantic search across billions of documents.</p>
    </div>
  </section>

  <section class="snap-section section-three" id="slide-3">
    <div class="slide-content">
      <span class="slide-step">03 // SCALE</span>
      <h2>Global Edge Deployment</h2>
      <p>Deploy anywhere in under 60 seconds with deterministic consistency.</p>
    </div>
  </section>
</div>
```

### CSS Implementation (`scroll-snap.css`)

```css
/* ==========================================================================
   Scroll Snap Parent Container
   ========================================================================== */
.snap-container {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow-y: scroll;
  scroll-snap-type: y mandatory; /* Mandates snapping along vertical axis */
  scroll-behavior: smooth;      /* Smooth programmatic transitions */
  overscroll-behavior-y: none;  /* Eliminates outer bounce */
}

/* ==========================================================================
   Individual Full-Screen Slide
   ========================================================================== */
.snap-section {
  height: 100vh;
  height: 100dvh;
  width: 100%;
  scroll-snap-align: start;  /* Snaps to top of viewport */
  scroll-snap-stop: always;  /* Forces stopping on each slide during fast flick */

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.slide-content {
  max-width: 680px;
  text-align: center;
  color: #ffffff;
}

.slide-step {
  font-family: monospace;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
  margin-bottom: 0.75rem;
}

.slide-content h2 {
  font-size: clamp(2rem, 4vw + 1rem, 3.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
}

.slide-content p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Distinctive thematic palettes */
.section-one { background: linear-gradient(135deg, #0f172a, #1e293b); }
.section-two { background: linear-gradient(135deg, #1e1b4b, #312e81); }
.section-three { background: linear-gradient(135deg, #064e3b, #047857); }
```

---

## 7. Technical Reference: Sizing Methods Compared

| Sizing Technique | Code | Behavior on Mobile | Overflow Behavior | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **Dynamic Viewport (`dvh`)** | `min-height: 100dvh;` | Adjusts dynamically to browser toolbars. | Fluid; expands if content exceeds height. | **Modern websites, landing pages, general layouts.** |
| **Fixed Viewport (`vh`)** | `height: 100vh;` | Fixed to max viewport; toolbars overlap bottom. | Clips or forces scrollbar. | Legacy fallback only. |
| **Chained Percentage (`100%`)** | `html, body, .app { height: 100%; }` | Stable across all browsers; respects iframe parents. | Requires explicit `height: 100%` on every ancestor. | **Native-like App Shells and SPAs.** |
| **Position Fixed Inset 0** | `position: fixed; inset: 0;` | Bypasses all ancestor DOM sizing trees. | Traps viewport; content must scroll internally. | Full-screen modals, overlays, lock screens. |

---

## 8. Common Traps & Best Practices Checklist

### ❌ 1. Using Rigid `height: 100vh` on Content Pages
* **The Bug:** If a mobile user has a small device or switches to landscape mode, content overflows and gets cut off without any way to scroll.
* **The Fix:** Use `min-height: 100dvh` instead of `height: 100vh`.

### ❌ 2. Missing `min-height: 0` and `min-width: 0` in Nested Grid/Flexbox
* **The Bug:** By default, flex and grid items have `min-height: auto` and `min-width: auto`. A long table or code block inside the main panel will expand the entire page, breaking your 100% viewport lock.
* **The Fix:** Declare `min-height: 0` and `min-width: 0` on scrollable grid/flex children.

### ❌ 3. Forgetting Safe Area Insets (`env(safe-area-inset-*)`)
* **The Bug:** On devices with notches or home indicator bars (iPhone, iPad, modern Android), edge-to-edge content is hidden beneath hardware cameras or navigation gestures.
* **The Fix:** Add `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` in HTML and apply `padding-bottom: env(safe-area-inset-bottom, 0px)` in CSS.

### ❌ 4. Layout Jumps from Appearing Scrollbars
* **The Bug:** When navigating between a short view and a long scrollable view, the UI jumps horizontally as the browser scrollbar appears and disappears.
* **The Fix:** Add `scrollbar-gutter: stable;` on the scrollable container.

---

## 9. Interactive Practice Exercises

1. **Test the Dynamic Viewport:** Open the Application Shell (`Pattern 1`) on a mobile browser or Chrome DevTools Device Mode. Scroll down and observe how the layout dynamically adjusts as the mobile address bar collapses.
2. **Break and Fix Grid Shrinkage:** Remove `min-height: 0` and `min-width: 0` from `.app-main` in the App Shell demo. Insert an unformatted `<table>` with 20 wide columns and observe how the grid breaks; re-add the properties to see the scrollbar isolated cleanly to the table.
3. **Build a Full-Screen Modal:** Use `position: fixed; inset: 0;` with `backdrop-filter: blur(12px)` and `display: grid; place-items: center;` to create an edge-to-edge modal takeover that sits above the full-screen layout.
