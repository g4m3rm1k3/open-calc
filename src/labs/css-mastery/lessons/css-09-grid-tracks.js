export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-09-grid-tracks',
  title: '09. Grid Tracks',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-grid-tracks', label: 'Grid Tracks' },
    { id: 'cp-responsive-grid', label: 'Responsive Grid' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Four cards in two rows. Flexbox makes them wrap — but card heights are inconsistent and the second row doesn't align with the first row. You need a true two-dimensional grid where both rows and columns snap to the same tracks.",
      files: {
        html: `<div class="cards">
  <div class="card">
    <h3>Card 1</h3>
    <p>Short description.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 2</h3>
    <p>This card has a longer description that takes up more vertical space.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 3</h3>
    <p>Medium length description here.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 4</h3>
    <p>Brief.</p>
    <button>View</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

/* Using flex with wrap — rows don't align */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: calc(50% - 8px); /* two columns using flex */
}

h3     { margin: 0 0 8px; color: #3b82f6; }
p      { margin: 0 0 16px; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }
button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-container',
      defaultTab: 'css',
      text: "`display: grid` creates a grid container. By itself nothing looks different — the items still stack vertically. You need to define the tracks: the columns and rows that form the grid structure.",
      files: {
        html: `<div class="cards">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid; /* creates a grid — but no tracks defined yet */
  /* items still stack in one column — need grid-template-columns */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
  font-weight: 500;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-template-columns',
      defaultTab: 'css',
      text: "`grid-template-columns` defines the column structure. `200px 200px 200px 200px` creates four 200px columns. But fixed pixel values overflow on narrow screens. We need flexible columns.",
      files: {
        html: `<div class="cards">
  <div class="card">Card 1<br><small>200px</small></div>
  <div class="card">Card 2<br><small>200px</small></div>
  <div class="card">Card 3<br><small>200px</small></div>
  <div class="card">Card 4<br><small>200px</small></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: 200px 200px 200px 200px; /* four fixed columns */
  gap: 16px;
  /* problem: fixed widths overflow on narrow screens */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
}

small { color: #475569; font-size: 0.75rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fr-unit',
      defaultTab: 'css',
      text: "The `fr` unit means 'fraction of available space'. `1fr 1fr 1fr 1fr` creates four equal columns that fill the container. Change to `2fr 1fr` and the first column gets twice the space. The `fr` unit is unique to CSS Grid.",
      files: {
        html: `<div class="cards">
  <div class="card">1fr</div>
  <div class="card">1fr</div>
  <div class="card">1fr</div>
  <div class="card">1fr</div>
</div>
<div class="cards unequal">
  <div class="card">2fr</div>
  <div class="card">1fr</div>
  <div class="card">1fr</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; /* four equal flexible columns */
  gap: 16px;
  margin-bottom: 24px;
}

.unequal {
  grid-template-columns: 2fr 1fr 1fr; /* first column is twice as wide */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #3b82f6;
  font-weight: 700;
  text-align: center;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'repeat',
      defaultTab: 'css',
      text: "`repeat(4, 1fr)` is shorthand for `1fr 1fr 1fr 1fr`. `repeat(12, 1fr)` gives a 12-column grid. `repeat(3, 100px 200px)` alternates 100px and 200px three times. `repeat()` eliminates repetition in column definitions.",
      files: {
        html: `<div class="cards">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
  <div class="card">4</div>
  <div class="card">5</div>
  <div class="card">6</div>
  <div class="card">7</div>
  <div class="card">8</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* shorthand for: 1fr 1fr 1fr 1fr */
  gap: 12px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #3b82f6;
  font-weight: 700;
  text-align: center;
  font-size: 1.1rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-gap',
      defaultTab: 'css',
      text: "`gap` in grid works identically to flexbox — it adds space between cells, not around the edges. `gap: 24px` puts 24px between all cells. `gap: 16px 24px` uses 16px row-gap and 24px column-gap.",
      files: {
        html: `<div class="cards">
  <div class="card">Card 1<br><small>row-gap: 16px<br>column-gap: 24px</small></div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px; /* row-gap: 16px, column-gap: 24px */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
  font-size: 0.85rem;
}

small { display: block; margin-top: 6px; color: #475569; font-size: 0.75rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'auto-rows',
      defaultTab: 'css',
      text: "`grid-auto-rows` sets the height of rows created automatically. `grid-auto-rows: 200px` makes every row exactly 200px tall regardless of content. Cards are now equal height and perfectly aligned — a proper grid.",
      files: {
        html: `<div class="cards">
  <div class="card">
    <h3>Card 1</h3>
    <p>Short.</p>
  </div>
  <div class="card">
    <h3>Card 2</h3>
    <p>This card has more content but the row height is fixed so all cards in the same row are the same height.</p>
  </div>
  <div class="card">
    <h3>Card 3</h3>
    <p>Medium.</p>
  </div>
  <div class="card">
    <h3>Card 4</h3>
    <p>Brief.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  grid-auto-rows: 200px; /* every row exactly 200px tall */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden; /* content that overflows the 200px is clipped */
}

h3 { margin: 0 0 8px; color: #3b82f6; font-size: 0.9rem; }
p  { margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'auto-rows-minmax',
      defaultTab: 'css',
      text: "`minmax(200px, auto)` on `grid-auto-rows` is the defensive version: rows are AT LEAST 200px but grow if content is taller. This prevents content overflow while maintaining visual consistency across cards in the same row.",
      files: {
        html: `<div class="cards">
  <div class="card">
    <h3>Card 1</h3>
    <p>Short content.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 2</h3>
    <p>This card has significantly more content. It goes on and on with details that make it taller than the minimum height. The row expands to fit.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 3</h3>
    <p>Medium content here.</p>
    <button>View</button>
  </div>
  <div class="card">
    <h3>Card 4</h3>
    <p>Short.</p>
    <button>View</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  grid-auto-rows: minmax(200px, auto); /* min 200px, grows if needed */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  /* no overflow: hidden — content can expand the row */
}

h3     { margin: 0 0 8px; color: #3b82f6; font-size: 0.9rem; }
p      { margin: 0 0 16px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }
button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'auto-fill-auto-fit',
      defaultTab: 'css',
      text: "`repeat(auto-fill, minmax(220px, 1fr))` is the responsive grid trick: columns are at least 220px, as many as fit in the container. Resize the browser — columns adjust automatically. No media queries needed. This is one of the most powerful CSS patterns.",
      files: {
        html: `<div class="cards">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
  <div class="card">Card 7</div>
</div>
<p class="hint">Resize the browser — columns automatically adjust</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.cards {
  display: grid;
  /* auto-fill: create as many columns as fit at minimum 220px */
  /* 1fr: let them grow to fill available space evenly */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 24px;
  color: #94a3b8;
  font-weight: 500;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint { color: #475569; font-size: 0.8rem; margin-top: 8px; font-style: italic; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-grid-tracks'
    },
    {
      type: 'narration',
      id: 'explicit-vs-implicit',
      defaultTab: 'css',
      text: "Explicit tracks are the ones you define with `grid-template-columns` and `grid-template-rows`. Implicit tracks are created automatically when items overflow the defined grid. `grid-auto-rows` and `grid-auto-columns` control the size of these auto-created tracks.",
      files: {
        html: `<div class="grid">
  <div class="cell">Row 1 (explicit)</div>
  <div class="cell">Row 1 (explicit)</div>
  <div class="cell">Row 2 (implicit — auto created)</div>
  <div class="cell">Row 2 (implicit — auto created)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 120px; /* only one EXPLICIT row defined */
  grid-auto-rows: 80px;      /* implicit rows (overflow) use this height */
  gap: 12px;
}

.cell {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  color: #94a3b8;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
}

/* First two cells are in the explicit row (120px) */
/* Last two are in an implicit row (80px via grid-auto-rows) */`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-rows',
      defaultTab: 'css',
      text: "`grid-template-rows: 60px 1fr 60px` creates a header (60px), a middle area that fills available space (1fr), and a footer (60px). Combined with `min-height: 100vh` on the container, this is how full-page layouts are built in a single grid declaration.",
      files: {
        html: `<div class="page">
  <header class="header">Header</header>
  <main class="main">Main Content Area</main>
  <footer class="footer">Footer</footer>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.page {
  display: grid;
  grid-template-rows: 60px 1fr 48px; /* header, main (fills space), footer */
  min-height: 100vh;
}

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #3b82f6;
}

.main {
  background: #0f172a;
  padding: 32px 24px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.footer {
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 0 24px;
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.8rem;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-responsive-grid'
    },
    {
      type: 'challenge',
      id: 'ch-card-grid',
      text: "Display 8 cards in a 4-column grid with 24px gap between them. Each row should be a minimum of 180px tall. Use `repeat()` and `minmax()`.",
      hint: "`grid-template-columns: repeat(4, 1fr);`, `gap: 24px;`, `grid-auto-rows: minmax(180px, auto);`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
  <div class="card">Card 7</div>
  <div class="card">Card 8</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.card-grid {
  /* Add: display: grid, grid-template-columns with repeat(4, 1fr), gap: 24px, grid-auto-rows with minmax(180px, auto) */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  color: #94a3b8;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /display\s*:\s*grid/.test(css) &&
          /grid-template-columns/.test(css) &&
          /repeat/.test(css) &&
          /gap/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-auto-grid',
      text: "Create an auto-responsive photo grid where each photo is at least 200px wide and as many photos fit in a row as possible. No media queries allowed — use `auto-fill` and `minmax()`.",
      hint: "`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="photo-grid">
  <div class="photo">Photo 1</div>
  <div class="photo">Photo 2</div>
  <div class="photo">Photo 3</div>
  <div class="photo">Photo 4</div>
  <div class="photo">Photo 5</div>
  <div class="photo">Photo 6</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.photo-grid {
  display: grid;
  /* Add: responsive columns using auto-fill and minmax(200px, 1fr) */
  gap: 12px;
}

.photo {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.85rem;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return (/auto-fill/.test(css) || /auto-fit/.test(css)) && /minmax/.test(css);
      }
    }
  ]
};
