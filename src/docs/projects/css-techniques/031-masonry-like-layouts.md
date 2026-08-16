# CSS Technique: Masonry-Like Layouts

A **Masonry layout** (popularized by Pinterest) arranges items of uneven heights or widths into a tight, staggered grid without empty vertical gaps. Unlike standard CSS grid layouts—where row heights are determined by the tallest item in each row—a masonry layout packs items into the next available vertical space.

This guide explores the modern techniques to achieve masonry-like layouts in CSS, from standard pure-CSS approaches to upcoming specifications and practical progressive enhancements.

---

## 1. Overview of Techniques

| Technique | Approach | Reading Order | Browser Support | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **CSS Multi-Columns** | `column-count` / `column-width` | Top-to-bottom (Column-first) | Universal (All browsers) | Static galleries, text/image boards |
| **CSS Grid + Row Span** | `grid-auto-rows` + `span` | Left-to-right (Row-first) | Modern browsers | Card layouts with predictable aspect ratios |
| **CSS Grid Native Masonry** | `grid-template-rows: masonry` | Left-to-right (Row-first) | Experimental (CSS Grid Level 3) | Future-proof standard layouts |
| **Flexbox Column Wrap** | `flex-flow: column wrap` | Configurable (with `order`) | Universal (All browsers) | Fixed-height containers |

---

## 2. Technique 1: CSS Multi-Columns (Pure CSS, Universal Support)

The most robust, zero-JavaScript pure CSS method uses the **CSS Multi-column Layout Module**. Items flow from top to bottom inside columns.

### HTML

```html
<div class="masonry-columns">
  <div class="masonry-item">
    <img src="https://picsum.photos/400/300?random=1" alt="Architecture landscape">
    <div class="content">
      <h3>Modern Architecture</h3>
      <p>Clean lines and structural forms built for functionality.</p>
    </div>
  </div>

  <div class="masonry-item">
    <img src="https://picsum.photos/400/500?random=2" alt="Portrait photography">
    <div class="content">
      <h3>Urban Exploration</h3>
      <p>A deeper look into vertical spaces, towering skyscrapers, and architectural symmetry.</p>
    </div>
  </div>

  <div class="masonry-item">
    <img src="https://picsum.photos/400/250?random=3" alt="Minimalist decor">
    <div class="content">
      <h3>Minimal Design</h3>
      <p>Less is more.</p>
    </div>
  </div>

  <div class="masonry-item">
    <img src="https://picsum.photos/400/420?random=4" alt="Natural textures">
    <div class="content">
      <h3>Organic Materials</h3>
      <p>Wood, stone, and raw clay integrated into modern interior spaces.</p>
    </div>
  </div>

  <div class="masonry-item">
    <img src="https://picsum.photos/400/350?random=5" alt="Industrial lighting">
    <div class="content">
      <h3>Lighting & Shadows</h3>
      <p>Subtle ambient light balancing high-contrast shadows.</p>
    </div>
  </div>
</div>
```

### CSS

```css
/* Container: Defines column distribution and spacing */
.masonry-columns {
  /* Dynamic column count based on available space */
  column-width: 320px;
  column-gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Items: Prevent cards from splitting across columns */
.masonry-item {
  break-inside: avoid;
  page-break-inside: avoid; /* Legacy fallback */
  margin-bottom: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.masonry-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.masonry-item img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.masonry-item .content {
  padding: 1.25rem;
}

.masonry-item h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: #1a202c;
}

.masonry-item p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #4a5568;
}

/* Optional: Breakpoint adjustments if column-count is preferred over column-width */
@media (max-width: 768px) {
  .masonry-columns {
    column-width: 240px;
    column-gap: 1rem;
    padding: 1rem;
  }

  .masonry-item {
    margin-bottom: 1rem;
  }
}
```

### How It Works & Key Properties
- `column-width: 320px;`: Automatically computes how many 320px+ columns fit into the container width. If the viewport is 960px wide, it renders 3 columns; if it's 640px, it renders 2 columns.
- `break-inside: avoid;`: **Critical rule.** Prevents individual cards from splitting horizontally across column boundaries.
- **Reading Order Caveat**: Items fill column 1 completely, then column 2, then column 3. This is ideal for photo feeds, but not for chronologically ordered articles where users expect left-to-right reading.

---

## 3. Technique 2: CSS Grid with Native Masonry (`CSS Grid Level 3`)

The CSS Grid Level 3 specification introduces native masonry support using `grid-template-rows: masonry`.

### HTML

```html
<div class="native-masonry">
  <article class="card">
    <img src="https://picsum.photos/400/260" alt="Sample 1">
    <div class="card-body">
      <h3>First Item</h3>
      <p>Short description.</p>
    </div>
  </article>

  <article class="card">
    <img src="https://picsum.photos/400/480" alt="Sample 2">
    <div class="card-body">
      <h3>Second Item (Taller)</h3>
      <p>This item is much taller and demonstrates how following items will pack beneath it.</p>
    </div>
  </article>

  <article class="card">
    <img src="https://picsum.photos/400/320" alt="Sample 3">
    <div class="card-body">
      <h3>Third Item</h3>
      <p>Flows left-to-right first, then fills gaps.</p>
    </div>
  </article>
</div>
```

### CSS (with Progressive Enhancement)

```css
/* Fallback: Multi-column or standard grid */
.native-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Progressive enhancement for browsers supporting native CSS Masonry */
@supports (grid-template-rows: masonry) or (display: masonry) {
  .native-masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-template-rows: masonry;
    align-tracks: stretch;
    gap: 1.5rem;
  }
}

.card {
  background: #1e1e2f;
  color: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.card img {
  width: 100%;
  height: auto;
  display: block;
}

.card-body {
  padding: 1rem;
}
```

### Why Native Masonry is the Ideal Future
1. **Preserves DOM & Visual Order**: Elements flow row-by-row (`1 -> 2 -> 3`), preserving logical keyboard accessibility (Tab navigation) and screen-reader flow.
2. **True Grid Integration**: Retains all CSS Grid capabilities like `grid-column: span 2` to create feature cards spanning multiple columns.

---

## 4. Technique 3: CSS Grid + Granular Row Spans (Quantized Grid)

If you need a left-to-right reading order with wide browser support, you can use a dense CSS grid with small row tracks (`grid-auto-rows: 10px` or `20px`) and span classes based on content height.

### HTML

```html
<div class="quantized-grid">
  <div class="card card-small">
    <div class="badge">Short</div>
    <h3>Quick Update</h3>
    <p>Compact card spanning fewer vertical tracks.</p>
  </div>

  <div class="card card-tall">
    <div class="badge">Feature</div>
    <h3>Comprehensive Report</h3>
    <p>Detailed overview containing rich statistics, long-form content, and multiple sections that naturally require extra vertical height.</p>
    <p>Additional paragraph demonstrating taller span.</p>
  </div>

  <div class="card card-medium">
    <div class="badge">Standard</div>
    <h3>Product Showcase</h3>
    <p>Medium card spanning intermediate row increments.</p>
  </div>

  <div class="card card-large">
    <div class="badge">Spotlight</div>
    <h3>Hero Announcement</h3>
    <p>Prominent item spanning both 2 columns and multiple row increments.</p>
  </div>
</div>
```

### CSS

```css
.quantized-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* Granular row track base unit */
  grid-auto-rows: 20px;
  grid-auto-flow: dense; /* Fills empty gaps automatically */
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Height-based spanning classes (multiples of 20px + gap) */
.card-small {
  grid-row-end: span 8;  /* ~160px + gap */
}

.card-medium {
  grid-row-end: span 12; /* ~240px + gap */
}

.card-tall {
  grid-row-end: span 18; /* ~360px + gap */
}

.card-large {
  grid-column: span 2;
  grid-row-end: span 14;
}

@media (max-width: 640px) {
  .card-large {
    grid-column: span 1;
  }
}
```

---

## 5. Complete Standalone Demo (Ready to Run)

Here is a complete, copy-pasteable HTML file demonstrating a modern, responsive masonry layout with dynamic aspect ratios and dark mode styling:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern CSS Masonry Layout</title>
  <style>
    /* Design Tokens */
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --border: #334155;
      --radius: 16px;
      --gap: 1.5rem;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      min-height: 100vh;
      padding: 3rem 1.5rem;
    }

    header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 3rem;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    header p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    /* --- Core Masonry Styles --- */
    .masonry-gallery {
      column-width: 300px;
      column-gap: var(--gap);
      max-width: 1400px;
      margin: 0 auto;
    }

    .gallery-item {
      break-inside: avoid;
      margin-bottom: var(--gap);
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .gallery-item:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }

    .gallery-item img {
      width: 100%;
      height: auto;
      display: block;
      background-color: #273549;
    }

    .item-info {
      padding: 1.25rem;
    }

    .item-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .item-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .item-desc {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-muted);
    }

    /* Focus accessibility */
    .gallery-item:focus-within {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }
  </style>
</head>
<body>

  <header>
    <h1>Staggered Masonry Layout</h1>
    <p>Pure CSS multi-column flow with seamless gap prevention and variable height media.</p>
  </header>

  <main class="masonry-gallery">
    <article class="gallery-item">
      <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop" alt="Mountain valley">
      <div class="item-info">
        <span class="item-tag">Nature</span>
        <h2 class="item-title">Alpine Solitude</h2>
        <p class="item-desc">Crystal clear reflection on glacial lakes under early morning mist.</p>
      </div>
    </article>

    <article class="gallery-item">
      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop" alt="Skyscraper view">
      <div class="item-info">
        <span class="item-tag">Architecture</span>
        <h2 class="item-title">Glass & Steel</h2>
        <p class="item-desc">High-rise geometric angles reflecting the twilight horizon across the metropolis.</p>
      </div>
    </article>

    <article class="gallery-item">
      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop" alt="Circuit board macro">
      <div class="item-info">
        <span class="item-tag">Technology</span>
        <h2 class="item-title">Silicon Architecture</h2>
        <p class="item-desc">Macro photography of modern microchips.</p>
      </div>
    </article>

    <article class="gallery-item">
      <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop" alt="Foggy forest hills">
      <div class="item-info">
        <span class="item-tag">Wilderness</span>
        <h2 class="item-title">Mist in the Pines</h2>
        <p class="item-desc">Dense pine canopy holding morning moisture in northern temperate rainforests.</p>
      </div>
    </article>

    <article class="gallery-item">
      <div class="item-info">
        <span class="item-tag">Text Only</span>
        <h2 class="item-title">Pure Editorial Note</h2>
        <p class="item-desc">Masonry items do not require images; cards with pure typography adapt seamlessly into the column flow without causing awkward gaps.</p>
      </div>
    </article>
  </main>

</body>
</html>
```

---

## 6. Accessibility & Best Practices

1. **Tab & Screen Reader Ordering**:
   - When using Multi-column layout (`column-count`), the Tab index progresses downwards through the first column before moving to the top of the next column.
   - For content where order matters (such as ordered rankings or article timelines), use **Native CSS Masonry** or **Quantized Grid** to keep DOM order aligned with visual order.

2. **Image Aspect Ratios & Layout Shifts (CLS)**:
   - Provide `width` and `height` attributes on `<img>` tags or use CSS `aspect-ratio` to reserve space before images load, avoiding sudden Cumulative Layout Shifts (CLS).

3. **Smooth Column Transitions**:
   - Use `break-inside: avoid;` to prevent child items from splitting.
   - Ensure child images use `display: block;` to prevent unwanted extra inline whitespace at the bottom.
