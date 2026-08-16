# Equal-Width Cards in Modern CSS

**Name:** Equal-Width Cards  
**Category:** Layout & Alignment / Component Design  
**Difficulty:** 2/5  
**What it produces:** A row or multi-row grid of card components where every card in a row maintains the exact same width regardless of the length of titles, descriptions, badges, images, or child elements within individual cards.  
**Why it works:** Modern layout engines (CSS Grid and Flexbox) provide mechanisms to distribute available horizontal space equally across sibling items based on layout-defined tracks (`1fr`, `flex-basis: 0`) rather than content-defined intrinsic sizing (`auto`, `max-content`).  
**Required CSS concepts:** CSS Grid (`grid-template-columns`, `fr` units, `minmax()`, `auto-fit` / `auto-fill`), Flexbox (`flex-grow`, `flex-shrink`, `flex-basis`, `gap`), Container Queries (`container-type`, `@container`), Intrinsic vs. Extrinsic Sizing (`min-width: 0`, `box-sizing`).

---

## 1. Anatomy of the Problem: Intrinsic vs. Extrinsic Sizing

By default in CSS, elements size themselves based on their content (**intrinsic sizing**). When multiple cards with varying content lengths are placed in a horizontal container without explicit sizing rules, cards with longer titles or extra tags expand, while cards with shorter text shrink.

```
DEFAULT FLOW (Unequal Widths - Jagged & Inconsistent):
+--------------------+--------------------------------+-----------------+
| Card 1 (Short)     | Card 2 (Long Title & Details)  | Card 3 (Medium) |
| "Basic Plan"       | "Enterprise Cloud Sync Pro"    | "Team Edition"  |
| Width: 220px       | Width: 460px                   | Width: 320px    |
+--------------------+--------------------------------+-----------------+

EQUAL-WIDTH LAYOUT (Symmetrical & Balanced):
+-----------------------+-----------------------+-----------------------+
| Card 1 (Short)        | Card 2 (Long Title)   | Card 3 (Medium)       |
| "Basic Plan"          | "Enterprise Cloud..." | "Team Edition"        |
| Width: 33.333% (1fr)  | Width: 33.333% (1fr)  | Width: 33.333% (1fr)  |
+-----------------------+-----------------------+-----------------------+
```

### The 4 Core Challenges of Equal-Width Cards:
1. **Content Disparity:** Sibling cards have drastically different text lengths, badges, or buttons.
2. **Dynamic Wrapping:** Multi-row layouts must maintain equal column widths across rows without stretching trailing "orphan" cards across the full container.
3. **The "Grid Blowout" Bug:** Grid items defaulting to `min-width: auto` can cause cards with unbreaking words, code blocks, or wide media to blow out of their `1fr` track.
4. **Gap Handling:** Adding margins or gaps between cards without breaking percentage-based width calculations.

---

## 2. Technique 1: CSS Grid (The Industry Standard)

CSS Grid is the most declarative, reliable, and powerful method for creating equal-width card layouts.

### A. Fixed Column Count with `1fr` Units

The `fr` (fractional) unit automatically calculates equal proportions of the available free track space after subtracting grid gaps.

```html
<section class="grid-equal-3">
  <article class="card">...</article>
  <article class="card">...</article>
  <article class="card">...</article>
</section>
```

```css
.grid-equal-3 {
  display: grid;
  /* 3 equal columns: each gets exactly 1/3 of the container width minus gaps */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}
```

> [!IMPORTANT]
> **Why `minmax(0, 1fr)` instead of `1fr`?**  
> In CSS Grid, grid items have a default `min-width: auto` (which resolves to `min-content`). If a card contains a long unbreaking URL, a `<pre><code>` block, or a wide image, `1fr` will allow that column to expand beyond the other columns to prevent content clipping. Using `minmax(0, 1fr)` sets the minimum track size to `0`, strictly enforcing equal widths under all circumstances.

---

### B. Responsive Equal-Width Auto-Wrapping (`auto-fit` vs. `auto-fill`)

To create a responsive card grid that automatically wraps into 1, 2, 3, or 4 equal-width columns without requiring breakpoint media queries:

```css
.grid-auto-cards {
  display: grid;
  /* Automatically wraps into equal-width cards of at least 280px */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}
```

#### Understanding `min(100%, 280px)`
On very narrow mobile viewports (e.g., a 320px wide screen with 24px of page padding), `280px` plus gaps might exceed the viewport width and trigger horizontal scrolling. Using `min(100%, 280px)` guarantees that on screens smaller than 280px, the card smoothly scales down to `100%` container width.

#### `auto-fit` vs. `auto-fill` Behavior with Few Cards

| Keyword | 1 or 2 Cards in a 4-Card Wide Container | Visual Result |
| :--- | :--- | :--- |
| `auto-fit` | Collapses empty tracks to 0px; existing cards stretch equally to fill the entire container. | Cards expand to fill remaining row width. |
| `auto-fill` | Preserves empty ghost tracks; existing cards stay at their minimum width without expanding. | Cards maintain fixed column width, leaving empty space to the right. |

```css
/* Cards expand to share available width equally */
.card-grid-fit {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

/* Cards preserve rigid column slots even if only 1 card exists */
.card-grid-fill {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
```

---

## 3. Technique 2: Flexbox (Single-Row & Math-Based Multi-Row)

Flexbox can achieve equal-width cards, but requires understanding the mathematical difference between `flex-basis: 0` and `flex-basis: auto`.

### A. Single-Row Equal-Width Cards (`flex: 1 1 0`)

To make all flex items in a single row equal in width regardless of their content:

```html
<div class="flex-equal-row">
  <div class="card">Short</div>
  <div class="card">Medium content length</div>
  <div class="card">Extremely long descriptive content block</div>
</div>
```

```css
.flex-equal-row {
  display: flex;
  gap: 1.5rem;
}

.flex-equal-row .card {
  /* flex: 1 1 0 translates to: flex-grow: 1; flex-shrink: 1; flex-basis: 0; */
  flex: 1 1 0;
  min-width: 0; /* Prevents text/code overflow from widening the flex item */
}
```

---

### The Math: Why `flex: 1 1 0` Works and `flex-grow: 1` Fails

Consider a 900px wide container with 3 cards with content sizes of 100px, 300px, and 200px (no gaps for simple math):

```
SCENARIO 1: Using flex-grow: 1 (with default flex-basis: auto)
- Total initial content width = 100px + 300px + 200px = 600px
- Remaining free space = 900px - 600px = 300px
- Distributed free space per item = 300px / 3 = 100px
- Final Card 1 width = 100px (content) + 100px (growth) = 200px
- Final Card 2 width = 300px (content) + 100px (growth) = 400px  <-- NOT EQUAL!
- Final Card 3 width = 200px (content) + 100px (growth) = 300px

SCENARIO 2: Using flex: 1 1 0 (with flex-basis: 0)
- Total initial base width = 0px + 0px + 0px = 0px
- Remaining free space = 900px - 0px = 900px
- Distributed free space per item = 900px / 3 = 300px
- Final Card 1 width = 0px + 300px = 300px
- Final Card 2 width = 0px + 300px = 300px  <-- EXACTLY EQUAL!
- Final Card 3 width = 0px + 300px = 300px
```

> [!NOTE]
> In CSS Flexbox, the shorthand `flex: 1` sets `flex-grow: 1`, `flex-shrink: 1`, and `flex-basis: 0%` (or `0` in modern specs). Writing `flex-grow: 1;` alone leaves `flex-basis: auto`, which preserves content width bias.

---

### B. Multi-Row Wrapping in Flexbox & The "Last Row Orphan" Problem

When using `flex-wrap: wrap` with `flex: 1 1 0`, if you have 4 cards in a container intended for 3 columns:
- Row 1 has 3 cards: each is **33.333%** wide.
- Row 2 has 1 card: that single orphan card expands to **100%** width!

```
THE FLEXBOX ORPHAN PROBLEM:
+-------------------+-------------------+-------------------+
| Card 1 (33.33%)   | Card 2 (33.33%)   | Card 3 (33.33%)   |
+-------------------+-------------------+-------------------+
| Card 4 (100% - Stretches across the entire row!)          |
+-----------------------------------------------------------+
```

#### The Flexbox Solution: Explicit `calc()` Basis with Zero Growth
To keep all cards at equal 3-column width even when the last row has fewer items, disable `flex-grow` and calculate exact track widths incorporating the `gap`:

```css
:root {
  --grid-gap: 1.5rem;
  --columns: 3;
}

.flex-wrapped-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
}

.flex-wrapped-grid .card {
  /* Formula: (100% - total_gaps_in_row) / number_of_columns */
  flex: 0 0 calc((100% - (var(--columns) - 1) * var(--grid-gap)) / var(--columns));
  min-width: 0;
  box-sizing: border-box;
}

/* Responsive Breakpoints */
@media (max-width: 900px) {
  .flex-wrapped-grid .card {
    flex: 0 0 calc((100% - (2 - 1) * var(--grid-gap)) / 2); /* 2 columns */
  }
}

@media (max-width: 600px) {
  .flex-wrapped-grid .card {
    flex: 0 0 100%; /* 1 column */
  }
}
```

---

## 4. Technique 3: Container Queries (`@container`)

Container Queries allow card components to dynamically adjust their equal-width column distribution based on the **width of their direct parent container** rather than the global viewport width. This is ideal for modular design systems where cards might live inside a narrow sidebar, a modal, or a wide main content area.

```html
<div class="card-container-wrapper">
  <div class="card-container">
    <article class="card">...</article>
    <article class="card">...</article>
    <article class="card">...</article>
  </div>
</div>
```

```css
/* 1. Define the containment context on the parent */
.card-container-wrapper {
  container-type: inline-size;
  container-name: cardDeck;
}

/* 2. Base 1-column layout for small container sizes */
.card-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

/* 3. Switch to 2 equal-width columns when container >= 520px */
@container cardDeck (min-width: 520px) {
  .card-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 4. Switch to 3 equal-width columns when container >= 840px */
@container cardDeck (min-width: 840px) {
  .card-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* 5. Switch to 4 equal-width columns when container >= 1150px */
@container cardDeck (min-width: 1150px) {
  .card-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

---

## 5. Combining Equal-Width + Equal-Height + Subgrid

For true production-grade card designs, equal width is combined with **equal height** and **internal row synchronization** (Subgrid):

```
2D SUBGRID ALIGNMENT ACROSS EQUAL-WIDTH COLUMNS:
+------------------------+------------------------+------------------------+
| Image (Fixed Ratio)    | Image (Fixed Ratio)    | Image (Fixed Ratio)    |
+------------------------+------------------------+------------------------+
| Short Title (1 line)   | Long Title (3 lines    | Medium Title (2 lines) |
|                        | of wrapping text)      |                        |
+------------------------+------------------------+------------------------+
| Description Text...    | Description Text...    | Description Text...    |
+------------------------+------------------------+------------------------+
| [ Action Button ]      | [ Action Button ]      | [ Action Button ]      |
+------------------------+------------------------+------------------------+
```

```css
/* Parent Grid */
.subgrid-card-deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Card spans 4 internal row tracks and inherits grid row sizing */
.subgrid-card {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.subgrid-card .card-media {
  grid-row: 1;
}

.subgrid-card .card-title {
  grid-row: 2;
  margin: 0;
  padding: 1.25rem 1.25rem 0.5rem;
}

.subgrid-card .card-body {
  grid-row: 3;
  padding: 0 1.25rem 1.25rem;
  color: #64748b;
}

.subgrid-card .card-footer {
  grid-row: 4;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  align-self: end;
}
```

---

## 6. Common Pitfalls & How to Avoid Them

### Pitfall 1: The "Grid Blowout" / `min-width: auto` Trap
- **The Issue:** A card with a long uninterrupted string (e.g. `https://github.com/some/very/long/path/name`), a `<pre>` block, or an image without `max-width: 100%` causes one column to stretch wider than its siblings.
- **The Fix:** Always use `minmax(0, 1fr)` in `grid-template-columns` and add `min-width: 0; overflow-wrap: break-word;` to the card:
  ```css
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .card {
    min-width: 0;
    overflow-wrap: break-word;
  }
  .card img {
    max-width: 100%;
    height: auto;
  }
  ```

### Pitfall 2: Using `width: 33.333%` with `gap`
- **The Issue:** Setting `width: 33.333%` on cards inside a container with `gap: 1rem` causes the row to total `100% + 2rem`, which forces the 3rd card to wrap onto the next line.
- **The Fix:** Use CSS Grid with `repeat(3, 1fr)` which automatically subtracts the gap before dividing space, or use `calc((100% - 2 * 1rem) / 3)`.

### Pitfall 3: `flex: 1` vs. `flex-grow: 1` Confusion
- **The Issue:** Writing `flex-grow: 1;` leaves `flex-basis: auto`, giving wider cards more space if their content is longer.
- **The Fix:** Use `flex: 1 1 0;` (or the shorthand `flex: 1`).

### Pitfall 4: Missing `box-sizing: border-box`
- **The Issue:** Borders and padding add to the computed width of cards, breaking equal percentage calculations.
- **The Fix:** Apply universal border-box sizing:
  ```css
  *, *::before, *::after {
    box-sizing: border-box;
  }
  ```

---

## 7. Comparison & Decision Matrix

| Feature / Criteria | CSS Grid (`minmax(0, 1fr)`) | Flexbox (`flex: 1 1 0`) | Flexbox (`calc()`) | Container Queries (`@container`) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Use Case** | 2D responsive grids & dashboards | Single-row equal toolbars/cards | Multi-row wrapping without grid | Component-isolated modular cards |
| **Enforces Equal Widths** | **Yes** (Strict) | **Yes** (Single row) | **Yes** (Multi-row fixed) | **Yes** (Based on parent width) |
| **Handles Orphan Cards** | **Yes** (Retains column slot) | **No** (Orphan stretches 100%) | **Yes** (Retains column slot) | **Yes** (Retains column slot) |
| **Handles Content Overflow** | With `minmax(0, 1fr)` | With `min-width: 0` | With `min-width: 0` | With `minmax(0, 1fr)` |
| **Subgrid Support** | **Yes** | No | No | **Yes** |
| **Complexity** | Low (1-2 lines) | Low | Moderate (Math in `calc()`) | Low-Moderate |
| **Browser Support** | All modern browsers (Baseline) | All modern browsers (Baseline) | All modern browsers (Baseline) | All modern browsers (Baseline) |

---

## 8. Complete Ready-to-Use Interactive Demo

Below is a self-contained, production-grade demonstration showcasing CSS Grid equal-width cards with varied content, responsive wrapping, sub-element vertical alignment, and container query integration.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Equal-Width Cards Demo - Modern CSS</title>
  <style>
    /* ==========================================================================
       Design Tokens & CSS Variables
       ========================================================================== */
    :root {
      --bg-canvas: #090d16;
      --bg-surface: #111827;
      --bg-surface-elevated: #1e293b;
      --bg-surface-hover: #273549;
      --border-subtle: #334155;
      --border-focus: #6366f1;
      
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      
      --accent-indigo: #6366f1;
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      
      --radius-sm: 0.375rem;
      --radius-md: 0.75rem;
      --radius-lg: 1rem;
      --radius-full: 9999px;
      
      --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      --shadow-hover: 0 20px 35px -10px rgba(99, 102, 241, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
      
      --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ==========================================================================
       Reset & Base Styles
       ========================================================================== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 3rem 1.5rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .container {
      max-width: 1200px;
      width: 100%;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    header h1 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }

    header p {
      color: var(--text-secondary);
      font-size: 1.125rem;
      max-width: 650px;
      margin: 0 auto;
    }

    /* ==========================================================================
       Controls & Layout Switcher Bar
       ========================================================================== */
    .controls-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .controls-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .indicator-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 10px var(--accent-emerald);
    }

    .btn-group {
      display: flex;
      background: var(--bg-canvas);
      padding: 0.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      gap: 0.25rem;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .tab-btn:hover {
      color: var(--text-primary);
    }

    .tab-btn.active {
      background: var(--accent-indigo);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }

    /* ==========================================================================
       Card Deck Grid: Equal-Width Implementation
       ========================================================================== */
    /* Container Query Parent */
    .card-deck-wrapper {
      container-type: inline-size;
      container-name: cardGridContainer;
      width: 100%;
    }

    /* Primary Grid Layout: Guarantees Equal Widths Across Columns */
    .card-grid {
      display: grid;
      /* minmax(0, 1fr) prevents long unbroken content from blowing out column width */
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 1.75rem;
      align-items: stretch; /* Ensures equal card heights */
    }

    /* Alternate Flexbox Mode (Toggled via JS) */
    .card-grid.mode-flex {
      display: flex;
      flex-wrap: wrap;
    }

    .card-grid.mode-flex .card {
      /* Flexible math basis for equal widths with wrapping */
      flex: 1 1 calc(33.333% - 1.75rem);
      min-width: 280px;
    }

    /* ==========================================================================
       Card Component Architecture
       ========================================================================== */
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column; /* Stacks internal elements vertically */
      box-shadow: var(--shadow-card);
      transition: var(--transition-smooth);
      position: relative;
      min-width: 0; /* Critical: Prevents content blowout */
    }

    .card:hover {
      transform: translateY(-6px);
      border-color: var(--border-focus);
      box-shadow: var(--shadow-hover);
      background: var(--bg-surface-elevated);
    }

    /* Card Top Accent Stripe */
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--card-accent, var(--accent-indigo)), transparent);
      opacity: 0.8;
    }

    .card-1 { --card-accent: var(--accent-indigo); }
    .card-2 { --card-accent: var(--accent-cyan); }
    .card-3 { --card-accent: var(--accent-emerald); }
    .card-4 { --card-accent: var(--accent-amber); }

    /* Media Banner */
    .card-media {
      position: relative;
      width: 100%;
      height: 160px;
      background: #1e293b;
      overflow: hidden;
    }

    .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .card:hover .card-media img {
      transform: scale(1.06);
    }

    /* Card Content Body */
    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto; /* Expands to fill available vertical height */
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-indigo { background: rgba(99, 102, 241, 0.18); color: #c7d2fe; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-cyan   { background: rgba(6, 182, 212, 0.18);  color: #a5f3fc; border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge-emerald{ background: rgba(16, 185, 129, 0.18); color: #a7f3d0; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-amber  { background: rgba(245, 158, 11, 0.18); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3); }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.35;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }

    .card-description {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex-grow: 1; /* Pushes footer to bottom */
      overflow-wrap: break-word; /* Prevents overflow from long strings */
    }

    /* Unbreaking URL Demonstration block inside card */
    .unbreaking-code {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.75rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      overflow-x: auto;
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
    }

    /* Metric / Stats Area */
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-top: 1px dashed var(--border-subtle);
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .meta-value {
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Pinned Bottom Actions */
    .card-footer {
      margin-top: auto; /* Fallback guarantee to align bottom edge */
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.7rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: var(--transition-smooth);
    }

    .btn-primary {
      background: var(--accent-indigo);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:hover {
      background: #4f46e5;
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: #64748b;
    }

    /* Width Measurer Overlay */
    .width-tag {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-family: monospace;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      pointer-events: none;
    }

    /* Responsive Notes */
    footer {
      margin-top: 4rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <div class="header-badge">
        <span>●</span> CSS Technique #024
      </div>
      <h1>Equal-Width Cards in Modern CSS</h1>
      <p>Demonstrating strict equal-width track sizing across cards with drastically different content lengths, badges, and media.</p>
    </header>

    <!-- Controls Panel -->
    <div class="controls-panel">
      <div class="controls-info">
        <div class="indicator-dot"></div>
        <span id="status-label">Engine: <strong>CSS Grid minmax(0, 1fr)</strong> (All 4 cards mathematically equal)</span>
      </div>
      <div class="btn-group" role="tablist">
        <button class="tab-btn active" id="btn-grid" onclick="switchLayout('grid')">CSS Grid (1fr)</button>
        <button class="tab-btn" id="btn-flex" onclick="switchLayout('flex')">Flexbox (flex: 1 1 0)</button>
      </div>
    </div>

    <!-- Cards Grid Container -->
    <div class="card-deck-wrapper">
      <section class="card-grid" id="main-grid">

        <!-- Card 1: Minimal / Short Content -->
        <article class="card card-1">
          <div class="card-media">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" alt="Abstract gradient" />
            <div class="width-tag" id="w-card-1">calc(100%)</div>
          </div>
          <div class="card-body">
            <div class="badge-row">
              <span class="badge badge-indigo">Basic</span>
            </div>
            <h2 class="card-title">Starter Kit</h2>
            <p class="card-description">
              Lightweight tools for solo creators starting a new project.
            </p>
            <div class="card-meta">
              <span>Latency</span>
              <span class="meta-value">~12ms</span>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary">Deploy</button>
            </div>
          </div>
        </article>

        <!-- Card 2: Extremely Long Content & Unbreaking Technical String -->
        <article class="card card-2">
          <div class="card-media">
            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80" alt="Retro hardware" />
            <div class="width-tag" id="w-card-2">calc(100%)</div>
          </div>
          <div class="card-body">
            <div class="badge-row">
              <span class="badge badge-cyan">Distributed</span>
              <span class="badge badge-indigo">High-Load</span>
            </div>
            <h2 class="card-title">Enterprise Real-Time Event Ingestion Engine with Global Failover</h2>
            <p class="card-description">
              Scalable multi-region cluster management with automated zero-downtime replication, edge caching, and cryptographic audit logs.
              <code class="unbreaking-code">https://api.cloud.corp/v3/telemetry/nodes/09a8f7b6c5d4e3f210a</code>
            </p>
            <div class="card-meta">
              <span>Throughput</span>
              <span class="meta-value">2.4M req/s</span>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary">Deploy</button>
            </div>
          </div>
        </article>

        <!-- Card 3: Medium Content with Features List -->
        <article class="card card-3">
          <div class="card-media">
            <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80" alt="Matrix security code" />
            <div class="width-tag" id="w-card-3">calc(100%)</div>
          </div>
          <div class="card-body">
            <div class="badge-row">
              <span class="badge badge-emerald">Security</span>
            </div>
            <h2 class="card-title">Zero-Trust Identity Proxy</h2>
            <p class="card-description">
              End-to-end mutual TLS authentication, context-aware policy enforcement, and single sign-on integration for microservices.
            </p>
            <div class="card-meta">
              <span>Compliance</span>
              <span class="meta-value">SOC2 & ISO</span>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary">Deploy</button>
            </div>
          </div>
        </article>

        <!-- Card 4: Action & Pricing Focused -->
        <article class="card card-4">
          <div class="card-media">
            <img src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&q=80" alt="Vibrant fluid pattern" />
            <div class="width-tag" id="w-card-4">calc(100%)</div>
          </div>
          <div class="card-body">
            <div class="badge-row">
              <span class="badge badge-amber">Analytics</span>
            </div>
            <h2 class="card-title">Predictive AI Insights</h2>
            <p class="card-description">
              Turn streaming telemetry into actionable business forecasts using automated ML pipelines and custom dashboards.
            </p>
            <div class="card-meta">
              <span>Accuracy</span>
              <span class="meta-value">99.84%</span>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary">Deploy</button>
            </div>
          </div>
        </article>

      </section>
    </div>

    <footer>
      <p>Equal-Width Cards Tutorial &bull; Tested across Chrome, Firefox, Safari & Edge</p>
    </footer>
  </div>

  <script>
    // Update live width tags to verify equal-width precision
    function updateCardWidthMetrics() {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const tag = document.getElementById(`w-card-${index + 1}`);
        if (tag) {
          tag.textContent = `${Math.round(rect.width)}px`;
        }
      });
    }

    // Toggle between CSS Grid and Flexbox implementations
    function switchLayout(mode) {
      const grid = document.getElementById('main-grid');
      const btnGrid = document.getElementById('btn-grid');
      const btnFlex = document.getElementById('btn-flex');
      const statusLabel = document.getElementById('status-label');

      if (mode === 'grid') {
        grid.classList.remove('mode-flex');
        btnGrid.classList.add('active');
        btnFlex.classList.remove('active');
        statusLabel.innerHTML = 'Engine: <strong>CSS Grid minmax(0, 1fr)</strong> (All 4 cards mathematically equal)';
      } else {
        grid.classList.add('mode-flex');
        btnFlex.classList.add('active');
        btnGrid.classList.remove('active');
        statusLabel.innerHTML = 'Engine: <strong>Flexbox (flex: 1 1 calc(...))</strong> (Equal width distribution)';
      }
      setTimeout(updateCardWidthMetrics, 50);
    }

    window.addEventListener('load', updateCardWidthMetrics);
    window.addEventListener('resize', updateCardWidthMetrics);
  </script>
</body>
</html>
```

---

## 9. Summary Checklist & Best Practices

- [x] **Primary Choice:** Use `display: grid; grid-template-columns: repeat(N, minmax(0, 1fr));` for fixed column layouts or `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` for responsive wrapping.
- [x] **Always Prevent Blowout:** Use `minmax(0, 1fr)` rather than bare `1fr`, and pair with `min-width: 0;` on cards to handle long URLs, code, or images.
- [x] **Flexbox Rule:** If using Flexbox, always set `flex: 1 1 0;` rather than `flex-grow: 1;` so that free space calculations ignore existing content sizes.
- [x] **Combine Equal Width with Equal Height:** Use `align-items: stretch;` (default in Grid) and `display: flex; flex-direction: column;` inside the card with `margin-top: auto;` or `flex-grow: 1;` on the description to keep footer buttons aligned.
- [x] **Component Isolation:** Use `@container (min-width: ...)` when cards need to respond to their widget/sidebar container rather than the browser window.
