// LESSON_DESIGN_04.js
// Lesson 4 — Layout Systems
// The problem: most layout is built by placing elements pixel by pixel —
// absolute positions, magic margin values, floats, or flexbox used as
// a centering hack. These layouts break the moment content changes.
// Real layout engineering is constraint declaration: you describe
// the relationships between elements and let the browser resolve them.
// Concepts: flexbox as constraint engine, CSS Grid for 2D structure,
//           component composition, intrinsic sizing, overflow-safe layouts.

const LESSON_DESIGN_04 = {
  title: 'Layout Systems',
  subtitle: 'Stop placing elements. Start declaring constraints. Build layouts that survive real content.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: What Lessons 1–3 Established

You now have three interlocking systems that together describe any component's visual properties:

**Lesson 1:** Four-level hierarchy. Every element has a visual level. Size, weight, and colour encode it.

**Lesson 2:** 8-token spacing scale. Every gap is one of 8 values derived from 4px. Proximity expresses belonging.

**Lesson 3:** Modular type scale. Every font-size = base × ratio^n. Line-height is a function. Measure is capped at 65ch. Two weights per component.

These systems describe *what* elements look like. This lesson answers the question of *where* they go.

---

## The Question This Lesson Answers

> Why do some layouts break when a user has more content than expected, a different screen size, or a translated string that's twice as long? And why do other layouts absorb all of those changes without a single pixel moving wrong?

The answer is the difference between **placing** elements and **constraining** them.

Placed elements: "This div is 320px wide, 40px from the left, 16px from the top."
Constrained elements: "These items fill the available width equally, maintain 16px gaps, wrap when they can't fit, and never overflow their container."

The first breaks when the container changes. The second works for any container.

Flexbox and Grid are constraint languages. By the end of this lesson you'll use them as engineers, not as centering hacks.`,
    },

    // ─── PART 1: BROKEN BASELINE ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Layout by Magic Numbers

This dashboard layout was built the common way — widths set in pixels, elements floated into position, gaps managed with margins that work at one viewport size and break at another.

Run the cell. The audit reads every width and position value in the layout and reports how many are hardcoded. Then resize the output panel — watch the layout break.

The question isn't "does this look correct?" The question is: **which assumptions does this layout make about its container, and what happens when those assumptions are wrong?**`,
      html: `<div class="dash">
  <nav class="dash-nav">
    <div class="nav-logo">Acme</div>
    <div class="nav-links">
      <a class="nav-link active" href="#">Dashboard</a>
      <a class="nav-link" href="#">Reports</a>
      <a class="nav-link" href="#">Settings</a>
    </div>
    <div class="nav-actions">
      <button class="nav-btn">New Report</button>
    </div>
  </nav>
  <div class="dash-body">
    <div class="stat-card">
      <div class="stat-label">Revenue</div>
      <div class="stat-value">$48,290</div>
      <div class="stat-delta up">↑ 12%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Users</div>
      <div class="stat-value">3,841</div>
      <div class="stat-delta up">↑ 8%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Churn</div>
      <div class="stat-value">2.4%</div>
      <div class="stat-delta down">↓ 0.3%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">NPS</div>
      <div class="stat-value">68</div>
      <div class="stat-delta up">↑ 4pts</div>
    </div>
  </div>
  <footer class="dash-footer">Last updated 4 minutes ago · Auto-refresh in 56s</footer>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif;
  background: #0f172a; color: #f1f5f9; }

/* BROKEN: layout by magic numbers */
.dash { width: 800px; } /* ← hardcoded width */

.dash-nav {
  background: #1e293b; border-bottom: 1px solid #334155;
  height: 48px; padding: 0 24px;
}
.nav-logo  { float: left; line-height: 48px; font-weight: 700; font-size: 16px; }
.nav-links { float: left; margin-left: 32px; } /* ← float + magic margin */
.nav-link  { display: inline-block; line-height: 48px; padding: 0 12px;
  font-size: 13px; color: var(--color-text-secondary, #475569); text-decoration: none; }
.nav-link.active { color: #f1f5f9; border-bottom: 2px solid #3b82f6; }
.nav-actions { float: right; margin-top: 10px; } /* ← magic margin-top */
.nav-btn { padding: 7px 14px; background: #2563eb; color: white;
  border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }

.dash-body {
  padding: 24px;
  overflow: hidden; /* clearfix for floats */
}
/* BROKEN: fixed widths that add up to exactly 800px */
.stat-card {
  float: left;        /* ← float layout */
  width: 172px;       /* ← 4 × 172 + 3 × 16 = 736 — not even right */
  margin-right: 16px;
  background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 20px;
}
.stat-card:last-child { margin-right: 0; }
.stat-label { font-size: 12px; color: var(--color-text-secondary, #475569); margin-bottom: 6px; }
.stat-value { font-size: 28px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
.stat-delta { font-size: 12px; font-weight: 500; }
.stat-delta.up   { color: #4ade80; }
.stat-delta.down { color: #f87171; }

.dash-footer { padding: 12px 24px; font-size: 12px; color: var(--color-text-secondary, #475569);
  border-top: 1px solid #334155; clear: both; /* ← clear for floats */ }`,
      startCode: `// Audit: count magic numbers and float usage
const elements = document.querySelectorAll('.dash *');
const hardcodedWidths = [];
const floatElements   = [];
const magicMargins    = [];

elements.forEach(el => {
  const s   = window.getComputedStyle(el);
  const cls = el.className;

  // Check for float layout
  if (s.float !== 'none') {
    floatElements.push(cls + ' (float: ' + s.float + ')');
  }

  // Check for hardcoded widths (not 'auto' or percentage)
  const w = s.width;
  if (w && w !== 'auto' && !w.includes('%') && parseFloat(w) > 0) {
    const px = parseFloat(w);
    // Flag widths that look like magic numbers (not common round values)
    if (px % 8 !== 0 || px < 40) {
      hardcodedWidths.push(cls + ': ' + w);
    }
  }
});

console.log('=== LAYOUT AUDIT: MAGIC NUMBERS ===\\n');
console.log('Float-based elements (' + floatElements.length + '):');
floatElements.forEach(f => console.log('  ' + f));
console.log('');
console.log('Off-grid widths (' + hardcodedWidths.length + '):');
hardcodedWidths.forEach(w => console.log('  ' + w));
console.log('');
console.log('Problems this layout has:');
console.log('1. .dash width: 800px — breaks on any viewport < 800px');
console.log('2. .stat-card width: 172px — breaks when a 5th card is added');
console.log('3. Float layout — cleared with "overflow: hidden" hack');
console.log('4. .nav-actions margin-top: 10px — breaks if nav height changes');
console.log('5. No wrapping — cards overflow instead of stacking on small screens');
console.log('');
console.log('None of these are fixable with more magic numbers.');
console.log('They require replacing placement with constraints.');`,
      outputHeight: 360,
    },

    // ─── PART 2: LAYOUT AS CONSTRAINT DECLARATION ────────────────────────────
    {
      type: 'markdown',
      instruction: `## Layout as Constraint Declaration

The fundamental shift in modern CSS layout: **stop specifying where things are, start specifying the relationships between things.**

### Placement vs Constraints

| Placement (old) | Constraint (new) |
|---|---|
| \`width: 172px\` | \`flex: 1\` — "take an equal share" |
| \`margin-left: 32px\` | \`gap: 32px\` — "maintain this distance" |
| \`float: left; clear: both\` | \`display: flex\` — "arrange children" |
| \`position: absolute; top: 10px\` | \`align-items: center\` — "centre on cross axis" |
| \`width: calc(25% - 12px)\` | \`grid-template-columns: repeat(4, 1fr)\` |

The constraint version describes the *intent*. The browser resolves the actual pixels. When the container changes — smaller screen, longer content, different font size — the browser re-resolves the constraints and the layout is still correct.

### The Two Layout Engines

**Flexbox** — one-dimensional. Arranges items along a single axis (row or column). Optimal for: navigation bars, button groups, card content, toolbars, any linear sequence of elements.

**Grid** — two-dimensional. Arranges items in explicit rows AND columns simultaneously. Optimal for: page-level layout, card grids, form layouts, dashboards, any structure with rows and columns.

**The rule:** use Flexbox inside components, Grid between components.

A card's internal layout (icon + text + button stacked vertically) is Flexbox. The grid of cards on the page is Grid. They nest cleanly because they operate at different levels of the hierarchy.

### What This Lesson Builds

By the end, you'll have rebuilt the broken dashboard using:
- Grid for the page-level structure (nav, body, footer)
- Grid for the stat card grid (responsive, no breakpoints)
- Flexbox for the nav internals
- Flexbox for each stat card's content
- An \`auditLayout()\` function that verifies no magic numbers exist`,
    },

    // ─── PART 3: FLEXBOX AS CONSTRAINT ENGINE ────────────────────────────────
    {
      type: 'js',
      instruction: `## Flexbox: The Five Properties That Matter

Flexbox has 12+ properties. In practice, five cover 95% of layout problems. The others are edge cases you look up when needed.

**On the container:**
- \`display: flex\` — activates flex layout for children
- \`flex-direction\` — row (default) or column — defines the main axis
- \`justify-content\` — alignment along the main axis
- \`align-items\` — alignment along the cross axis
- \`gap\` — space between items (replaces all margin hacks)

**On the children:**
- \`flex: 1\` — "take all available space equally"
- \`flex: 0 0 auto\` — "take exactly as much as I need, don't grow or shrink"
- \`flex: 0 1 auto\` — default: can shrink but won't grow

The cell below lets you interact with all five container properties and watch the layout respond. This is the vocabulary — learn it well.`,
      html: `<div id="flex-controls">
  <div class="ctrl-row">
    <label>flex-direction</label>
    <select id="fd">
      <option value="row">row</option>
      <option value="row-reverse">row-reverse</option>
      <option value="column">column</option>
      <option value="column-reverse">column-reverse</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>justify-content</label>
    <select id="jc">
      <option value="flex-start">flex-start</option>
      <option value="flex-end">flex-end</option>
      <option value="center">center</option>
      <option value="space-between">space-between</option>
      <option value="space-around">space-around</option>
      <option value="space-evenly">space-evenly</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>align-items</label>
    <select id="ai">
      <option value="stretch">stretch</option>
      <option value="flex-start">flex-start</option>
      <option value="center">center</option>
      <option value="flex-end">flex-end</option>
      <option value="baseline">baseline</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>flex-wrap</label>
    <select id="fw">
      <option value="nowrap">nowrap</option>
      <option value="wrap">wrap</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>gap</label>
    <select id="gap">
      <option value="0px">0px</option>
      <option value="8px">8px</option>
      <option value="16px" selected>16px</option>
      <option value="24px">24px</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>child flex</label>
    <select id="cf">
      <option value="0 0 auto">0 0 auto (shrink only)</option>
      <option value="1">1 (equal share)</option>
      <option value="0 0 80px">0 0 80px (fixed)</option>
    </select>
  </div>
</div>
<div class="flex-container" id="flex-container">
  <div class="flex-item fi-a">A<div class="fi-size"></div></div>
  <div class="flex-item fi-b">B<div class="fi-size"></div></div>
  <div class="flex-item fi-c">C<div class="fi-size"></div></div>
  <div class="flex-item fi-d">D<div class="fi-size"></div></div>
</div>
<div id="flex-code-output"></div>`,
      css: `body { background: #0f172a; padding: 16px; margin: 0;
  font-family: system-ui, sans-serif; }
#flex-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.ctrl-row { display: flex; align-items: center; gap: 6px;
  background: #1e293b; border: 1px solid #334155; border-radius: 6px;
  padding: 6px 10px; }
.ctrl-row label { font-size: 11px; color: var(--color-text-secondary, #475569); white-space: nowrap; }
.ctrl-row select { font-size: 11px; background: #0f172a; color: #f1f5f9;
  border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; cursor: pointer; }
.flex-container {
  display: flex; gap: 16px;
  background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 16px; min-height: 120px; margin-bottom: 12px;
  transition: all 0.15s;
}
.flex-item { background: #2563eb22; border: 1px solid #2563eb66;
  border-radius: 6px; padding: 12px; font-size: 20px; font-weight: 700;
  color: #60a5fa; min-width: 40px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; transition: all 0.15s; }
.fi-size { font-size: 9px; font-weight: 400; color: #334155; margin-top: 4px; }
#flex-code-output { font-family: monospace; font-size: 11px; color: var(--color-text-secondary, #475569);
  background: #0f172a; border: 1px solid #1e293b; border-radius: 6px;
  padding: 10px 12px; line-height: 1.8; }`,
      startCode: `const container = document.getElementById('flex-container');
const items     = container.querySelectorAll('.flex-item');
const output    = document.getElementById('flex-code-output');

function update() {
  const fd  = document.getElementById('fd').value;
  const jc  = document.getElementById('jc').value;
  const ai  = document.getElementById('ai').value;
  const fw  = document.getElementById('fw').value;
  const gap = document.getElementById('gap').value;
  const cf  = document.getElementById('cf').value;

  container.style.flexDirection  = fd;
  container.style.justifyContent = jc;
  container.style.alignItems     = ai;
  container.style.flexWrap       = fw;
  container.style.gap            = gap;
  items.forEach(item => { item.style.flex = cf; });

  // Update size labels after layout resolves
  requestAnimationFrame(() => {
    items.forEach(item => {
      const r = item.getBoundingClientRect();
      item.querySelector('.fi-size').textContent =
        Math.round(r.width) + '×' + Math.round(r.height);
    });
  });

  output.innerHTML = [
    '.container {',
    '  display: flex;',
    '  flex-direction: <b style="color:#60a5fa">' + fd  + '</b>;',
    '  justify-content: <b style="color:#60a5fa">' + jc + '</b>;',
    '  align-items: <b style="color:#60a5fa">' + ai    + '</b>;',
    '  flex-wrap: <b style="color:#60a5fa">' + fw       + '</b>;',
    '  gap: <b style="color:#60a5fa">' + gap             + '</b>;',
    '}',
    '.item { flex: <b style="color:#4ade80">' + cf       + '</b>; }',
  ].join('<br>');
}

['fd','jc','ai','fw','gap','cf'].forEach(id =>
  document.getElementById(id).addEventListener('change', update));
update();

console.log('Key combinations to explore:');
console.log('  justify-content: space-between + align-items: center → nav layout');
console.log('  flex: 1 on children → equal columns');
console.log('  flex-wrap: wrap + flex: 1 + min-width → responsive without media queries');`,
      outputHeight: 460,
    },

    // ─── PART 4: GRID — TWO-DIMENSIONAL LAYOUT ───────────────────────────────
    {
      type: 'js',
      instruction: `## CSS Grid: Rows and Columns Simultaneously

Grid thinks in two dimensions at once. Where Flexbox says "arrange these items in a row" and *then* you handle wrapping, Grid says "here is the row and column structure — place items in it."

**The four Grid properties you need first:**

\`grid-template-columns\` — defines the column structure.
- \`repeat(4, 1fr)\` — four equal columns
- \`200px 1fr\` — one fixed column, one flexible
- \`repeat(auto-fill, minmax(240px, 1fr))\` — as many columns as fit

\`grid-template-rows\` — defines the row structure (often left to \`auto\`).

\`gap\` — space between all rows and columns.

\`grid-column\` / \`grid-row\` — on children, to span across multiple tracks.

**The magic of \`minmax()\`:**
\`repeat(auto-fill, minmax(240px, 1fr))\` is the most powerful line in responsive layout. It means: "create as many columns as fit, each at minimum 240px, sharing the remaining space equally." No media queries. No breakpoints. The grid adapts to any container width automatically.`,
      html: `<div id="grid-controls">
  <div class="ctrl-row">
    <label>template-columns</label>
    <select id="gtc">
      <option value="repeat(4, 1fr)">repeat(4, 1fr)</option>
      <option value="repeat(3, 1fr)">repeat(3, 1fr)</option>
      <option value="repeat(2, 1fr)">repeat(2, 1fr)</option>
      <option value="200px 1fr">200px 1fr</option>
      <option value="repeat(auto-fill, minmax(180px, 1fr))" selected>auto-fill minmax(180px,1fr)</option>
      <option value="repeat(auto-fit, minmax(180px, 1fr))">auto-fit minmax(180px,1fr)</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>gap</label>
    <select id="ggap">
      <option value="4px">4px</option>
      <option value="8px">8px</option>
      <option value="16px" selected>16px</option>
      <option value="24px">24px</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>align-items</label>
    <select id="gai">
      <option value="stretch" selected>stretch</option>
      <option value="start">start</option>
      <option value="center">center</option>
      <option value="end">end</option>
    </select>
  </div>
</div>
<div class="grid-container" id="grid-container">
  <div class="grid-item gi-1">1</div>
  <div class="grid-item gi-2">2</div>
  <div class="grid-item gi-3">3</div>
  <div class="grid-item gi-4">4</div>
  <div class="grid-item gi-5">5</div>
  <div class="grid-item gi-6">6</div>
</div>
<div id="grid-code-output"></div>`,
      css: `body { background: #0f172a; padding: 16px; margin: 0; font-family: system-ui, sans-serif; }
#grid-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.ctrl-row { display: flex; align-items: center; gap: 6px; background: #1e293b;
  border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; }
.ctrl-row label { font-size: 11px; color: var(--color-text-secondary, #475569); white-space: nowrap; }
.ctrl-row select { font-size: 11px; background: #0f172a; color: #f1f5f9;
  border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; cursor: pointer; }
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 16px; margin-bottom: 12px;
}
.grid-item { background: #7c3aed22; border: 1px solid #7c3aed66;
  border-radius: 6px; padding: 20px; font-size: 22px; font-weight: 700;
  color: #a78bfa; text-align: center; min-height: 60px;
  display: flex; align-items: center; justify-content: center; }
#grid-code-output { font-family: monospace; font-size: 11px; color: var(--color-text-secondary, #475569);
  background: #0f172a; border: 1px solid #1e293b; border-radius: 6px;
  padding: 10px 12px; line-height: 1.8; }`,
      startCode: `const grid   = document.getElementById('grid-container');
const output = document.getElementById('grid-code-output');

function updateGrid() {
  const gtc  = document.getElementById('gtc').value;
  const gap  = document.getElementById('ggap').value;
  const ai   = document.getElementById('gai').value;

  grid.style.gridTemplateColumns = gtc;
  grid.style.gap                 = gap;
  grid.style.alignItems          = ai;

  output.innerHTML = [
    '.grid {',
    '  display: grid;',
    '  grid-template-columns: <b style="color:#a78bfa">' + gtc + '</b>;',
    '  gap: <b style="color:#a78bfa">' + gap + '</b>;',
    '  align-items: <b style="color:#a78bfa">' + ai + '</b>;',
    '}',
  ].join('<br>');
}

['gtc','ggap','gai'].forEach(id =>
  document.getElementById(id).addEventListener('change', updateGrid));
updateGrid();

console.log('Key insight: repeat(auto-fill, minmax(180px, 1fr))');
console.log('means "as many 180px+ columns as fit, sharing the space."');
console.log('This one line replaces all breakpoint-based responsive grid code.');
console.log('');
console.log('Difference between auto-fill and auto-fit:');
console.log('  auto-fill: keeps empty column tracks (useful with named areas)');
console.log('  auto-fit:  collapses empty tracks, items stretch to fill');
console.log('For card grids: use auto-fill.');`,
      outputHeight: 420,
    },

    // ─── PART 5: REBUILDING THE DASHBOARD ────────────────────────────────────
    {
      type: 'js',
      instruction: `## Rebuilding: From Float Soup to Constraints

Now we rebuild the broken dashboard from Part 1 using only constraints — no magic numbers, no floats, no hardcoded widths.

**The structure:**
- Page: \`display: grid; grid-template-rows: auto 1fr auto\` — nav, body, footer
- Nav internals: \`display: flex; align-items: center\` — items centre on the cross axis
- Stat card grid: \`display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))\`
- Each stat card: \`display: flex; flex-direction: column; gap: 4px\`

Read the CSS in the output panel carefully. Notice: not a single hardcoded pixel width on any layout element. Every width is either \`1fr\`, \`auto\`, \`minmax()\`, or \`100%\`.`,
      html: `<div class="dash2">
  <nav class="dash2-nav">
    <div class="nav2-logo">Acme</div>
    <div class="nav2-links">
      <a class="nav2-link active" href="#">Dashboard</a>
      <a class="nav2-link" href="#">Reports</a>
      <a class="nav2-link" href="#">Settings</a>
    </div>
    <div class="nav2-spacer"></div>
    <button class="nav2-btn">New Report</button>
  </nav>
  <main class="dash2-body">
    <div class="stat2-card">
      <div class="s2-label">Revenue</div>
      <div class="s2-value">$48,290</div>
      <div class="s2-delta up">↑ 12% from last quarter</div>
    </div>
    <div class="stat2-card">
      <div class="s2-label">Active Users</div>
      <div class="s2-value">3,841</div>
      <div class="s2-delta up">↑ 8%</div>
    </div>
    <div class="stat2-card">
      <div class="s2-label">Churn Rate</div>
      <div class="s2-value">2.4%</div>
      <div class="s2-delta down">↓ 0.3%</div>
    </div>
    <div class="stat2-card">
      <div class="s2-label">Net Promoter</div>
      <div class="s2-value">68</div>
      <div class="s2-delta up">↑ 4pts</div>
    </div>
  </main>
  <footer class="dash2-footer">Last updated 4 minutes ago · Auto-refresh in 56s</footer>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; }

/* ── PAGE STRUCTURE: grid rows ── */
.dash2 {
  display: grid;
  grid-template-rows: auto 1fr auto;  /* nav: content height, body: fills rest, footer: content height */
  min-height: 100vh;
}

/* ── NAV: flexbox for 1D alignment ── */
.dash2-nav {
  display: flex;
  align-items: center;           /* cross-axis: vertically centre everything */
  gap: 8px;                      /* gap replaces all margin hacks */
  padding: 0 24px;
  height: 48px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}
.nav2-logo  { font-size: 16px; font-weight: 700; color: #f1f5f9; flex-shrink: 0; }
.nav2-links { display: flex; gap: 4px; }
.nav2-link  { padding: 6px 10px; font-size: 13px; color: var(--color-text-secondary, #475569);
  text-decoration: none; border-radius: 6px; }
.nav2-link.active { color: #f1f5f9; background: #334155; }
.nav2-spacer { flex: 1; }        /* pushes btn to the right — no float needed */
.nav2-btn   { padding: 7px 14px; background: #2563eb; color: white;
  border: none; border-radius: 6px; font-size: 13px; cursor: pointer;
  flex-shrink: 0; }

/* ── STAT GRID: auto-responsive ── */
.dash2-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* responsive, no breakpoints */
  gap: 16px;
  padding: 24px;
  align-content: start;          /* rows start at top, not stretched */
}

/* ── STAT CARD: flex column ── */
.stat2-card {
  display: flex;
  flex-direction: column;
  gap: 4px;                      /* space-1 between all card children */
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
}
.s2-label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary, #475569); }
.s2-value { font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1.1; }
.s2-delta { font-size: 12px; font-weight: 500; }
.s2-delta.up   { color: #4ade80; }
.s2-delta.down { color: #f87171; }

/* ── FOOTER ── */
.dash2-footer { padding: 12px 24px; font-size: 12px; color: var(--color-text-secondary, #475569);
  border-top: 1px solid #334155; }`,
      startCode: `// Verify the rebuilt layout has no magic numbers

function auditLayout(rootSelector) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const issues = [];
  const good   = [];

  root.querySelectorAll('*').forEach(el => {
    const s   = window.getComputedStyle(el);
    const cls = '.' + (el.className.toString().trim().split(' ')[0] || el.tagName);

    // Check for float layout (should be gone)
    if (s.float !== 'none') {
      issues.push(cls + ': float: ' + s.float + ' — replace with flex/grid');
    }

    // Check display type
    const disp = s.display;
    if (['flex','grid','inline-flex','inline-grid'].includes(disp)) {
      good.push(cls + ': display: ' + disp);
    }
  });

  console.log('=== LAYOUT AUDIT: ' + rootSelector + ' ===\\n');
  console.log('Modern layout (flex/grid):');
  good.forEach(g => console.log('  ✓ ' + g));

  if (issues.length > 0) {
    console.log('\\nViolations:');
    issues.forEach(i => console.log('  ✗ ' + i));
  } else {
    console.log('\\n✓ No float violations found');
  }

  // Check for explicit widths on layout containers
  const layoutEls = root.querySelectorAll(
    '.dash2-nav, .dash2-body, .stat2-card, .dash2-footer'
  );
  console.log('\\nLayout containers — checking for hardcoded widths:');
  layoutEls.forEach(el => {
    const w   = el.style.width || 'not set';
    const cls = '.' + el.className.split(' ')[0];
    const ok  = !el.style.width || el.style.width === '100%';
    console.log((ok ? '  ✓' : '  ✗') + ' ' + cls + ' explicit width: ' + w);
  });
}

auditLayout('.dash2');

console.log('\\nKey differences from the broken version:');
console.log('  nav: flex + spacer div pushes btn right (no float)');
console.log('  body: grid minmax — adds/removes columns automatically');
console.log('  cards: flex column + gap (no margin-bottom hacks)');`,
      outputHeight: 380,
    },

    // ─── PART 6: PRACTICE 1 — BUILD A RESPONSIVE CARD GRID ──────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Build a Responsive Card Grid

You're given six content cards and a blank container. Build a grid that:

1. Shows 3 columns on wide viewports
2. Adapts automatically when the container narrows — no breakpoints
3. Maintains a 16px gap between all cards
4. Cards stretch to equal height within each row
5. A "featured" card spans two columns

Use only \`display: grid\`, \`grid-template-columns\`, \`gap\`, and \`grid-column\` — no magic widths.

The test verifies: the container uses \`display: grid\`, at least one \`minmax()\` is present, \`gap\` is set, and the featured card has a \`grid-column\` span.

**Explore:** after passing, try changing the minmax minimum from 240px to 160px. How does the grid reflow? Try adding a 7th card — does the layout break or adapt?`,
      html: `<div class="practice-grid" id="practice-grid">
  <div class="p-card featured">
    <div class="pc-tag">FEATURED</div>
    <h3 class="pc-title">Rebuilding our pipeline: the full story</h3>
    <p class="pc-body">Six weeks, zero downtime, one complete rewrite. Here's everything we learned.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
  <div class="p-card">
    <div class="pc-tag">INFRASTRUCTURE</div>
    <h3 class="pc-title">Event schema design at scale</h3>
    <p class="pc-body">How we went from 12 event types to 847 without losing our minds.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
  <div class="p-card">
    <div class="pc-tag">RELIABILITY</div>
    <h3 class="pc-title">The alert that changed everything</h3>
    <p class="pc-body">A 3am page that revealed a fundamental architectural assumption was wrong.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
  <div class="p-card">
    <div class="pc-tag">CULTURE</div>
    <h3 class="pc-title">On-call without burning out</h3>
    <p class="pc-body">Sustainable practices for teams that own their production systems.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
  <div class="p-card">
    <div class="pc-tag">DATA</div>
    <h3 class="pc-title">Streaming vs batch: the actual tradeoffs</h3>
    <p class="pc-body">Neither is universally better. Here's how we made the choice.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
  <div class="p-card">
    <div class="pc-tag">OBSERVABILITY</div>
    <h3 class="pc-title">Metrics that actually predict failures</h3>
    <p class="pc-body">Leading indicators vs lagging indicators in production systems.</p>
    <a class="pc-link" href="#">Read more →</a>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
/* YOUR GRID GOES IN JavaScript below — keep base card styles here */
.p-card {
  background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 20px; display: flex; flex-direction: column; gap: 8px;
}
.featured { border-color: #2563eb44; background: #1e3a5f; }
.pc-tag  { font-size: 10px; font-weight: 700; color: #3b82f6;
  letter-spacing: 0.12em; text-transform: uppercase; }
.pc-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin: 0; line-height: 1.3; }
.pc-body  { font-size: 13px; color: var(--color-text-secondary, #475569); line-height: 1.55; margin: 0; flex: 1; }
.pc-link  { font-size: 13px; font-weight: 500; color: #60a5fa;
  text-decoration: none; margin-top: auto; }`,
      startCode: `// BUILD THE GRID
// Requirements:
// 1. display: grid on #practice-grid
// 2. responsive columns using minmax() — no breakpoints
// 3. gap: 16px
// 4. .featured card spans 2 columns
// 5. cards in each row stretch to equal height (default with grid)

const grid = document.getElementById('practice-grid');

// YOUR CODE:
grid.style.display = '???';
grid.style.gridTemplateColumns = '???';  // use minmax()
grid.style.gap = '???';

// Make the featured card span 2 columns
document.querySelector('.featured').style.gridColumn = '???';

// ── VERIFY ────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const s   = window.getComputedStyle(grid);
  const fs  = window.getComputedStyle(document.querySelector('.featured'));
  const checks = {
    'display: grid':      s.display === 'grid',
    'gap set':            parseFloat(s.gap) > 0 || parseFloat(s.columnGap) > 0,
    'gridTemplateColumns': s.gridTemplateColumns && s.gridTemplateColumns !== 'none',
    'featured spans cols': fs.gridColumn && fs.gridColumn !== 'auto',
  };
  console.log('=== GRID AUDIT ===');
  Object.entries(checks).forEach(([k, v]) =>
    console.log((v ? '✓' : '✗') + ' ' + k));
}, 100);`,
      solutionCode: `const grid = document.getElementById('practice-grid');

grid.style.display = 'grid';
grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
grid.style.gap = '16px';

document.querySelector('.featured').style.gridColumn = 'span 2';

setTimeout(() => {
  const s  = window.getComputedStyle(grid);
  const fs = window.getComputedStyle(document.querySelector('.featured'));
  const checks = {
    'display: grid':      s.display === 'grid',
    'gap set':            parseFloat(s.gap) > 0 || parseFloat(s.columnGap) > 0,
    'gridTemplateColumns': s.gridTemplateColumns !== 'none',
    'featured spans cols': fs.gridColumn && fs.gridColumn !== 'auto',
  };
  console.log('=== GRID AUDIT ===');
  Object.entries(checks).forEach(([k, v]) =>
    console.log((v ? '✓' : '✗') + ' ' + k));
}, 100);`,
      check: (code) => {
        const hasGrid     = /display.*['"]\s*grid\s*['"]|\.display\s*=\s*['"]grid['"]/i.test(code);
        const hasMinmax   = /minmax\s*\(/i.test(code);
        const hasGap      = /\.gap\s*=|gap.*px/i.test(code);
        const hasSpan     = /span\s*2|gridColumn.*span/i.test(code);
        return hasGrid && hasMinmax && hasGap && hasSpan;
      },
      successMessage: `Responsive grid built without a single breakpoint. The minmax() function is doing what used to require three media queries. The featured card's grid-column: span 2 is a placement constraint, not a pixel width — it adapts as the grid adapts.`,
      failMessage: `Four requirements: (1) display: 'grid' on the container. (2) gridTemplateColumns using minmax(). (3) gap set to a pixel value. (4) .featured card has gridColumn set to 'span 2'. All four must be present.`,
      outputHeight: 480,
    },

    // ─── PART 7: COMPONENT COMPOSITION ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Component Composition: Flex Inside Grid

Real layouts are nested. A page-level grid contains sections. Each section contains a grid of cards. Each card contains a flex column. Each row in that column contains a flex row.

This nesting is clean and correct because Flex and Grid operate at their own level — they don't interfere with each other.

### The Nesting Model

\`\`\`
Page (Grid: rows)
  └── Nav (Flex: row, items centred)
  └── Sidebar + Content (Grid: 2 columns)
        └── Content (Grid: card grid)
              └── Card (Flex: column)
                    └── Card header (Flex: row, space-between)
                    └── Card body (block)
                    └── Card footer (Flex: row, gap)
\`\`\`

### The Rule

**Grid for structure, Flex for content.**

Grid defines the skeleton — where the major regions are. Flex arranges the content within each region.

A practical test: "Am I thinking about rows AND columns simultaneously?" → Grid. "Am I thinking about a single axis (left-to-right or top-to-bottom)?" → Flex.

### What Breaks Nesting

The one thing that destroys clean nesting is using fixed pixel widths at intermediate levels. A card that is \`width: 320px\` cannot live in a flexible grid — the grid will try to resize it and the fixed width will fight back. The rule: **no explicit width on any grid item or flex child** unless it's a truly fixed UI element (an icon, an avatar, a fixed sidebar). Everything else uses \`1fr\`, \`flex: 1\`, \`auto\`, or \`minmax()\`.

### The \`min-width: 0\` Fix

The most common nesting bug: a flex child contains text that refuses to truncate or wrap. The fix is always \`min-width: 0\` on the flex child. By default, flex items have \`min-width: auto\` — they won't shrink below their content size. \`min-width: 0\` removes this constraint, allowing the item to shrink and its text to wrap or truncate.`,
    },

    // ─── PART 8: OVERFLOW-SAFE LAYOUTS ───────────────────────────────────────
    {
      type: 'js',
      instruction: `## Overflow-Safe Layouts: Where Layouts Break

Every layout has failure modes — conditions under which elements overflow their containers, wrap unexpectedly, or collapse to zero height. A layout isn't done until it's been stress-tested against all of them.

**The four overflow scenarios:**

1. **Content too long** — a product name that's 80 characters wraps across 5 lines, pushing everything below it down
2. **Content too short** — a card with one word of content leaves a gaping empty space
3. **Dynamic count** — a list of 3 items renders fine; a list of 300 causes the container to overflow the viewport
4. **Translated strings** — German compound words are 2–3× longer than English equivalents; Japanese and Arabic have fundamentally different text metrics

**The CSS tools for each:**

| Scenario | Tool |
|---|---|
| Long single words | \`overflow-wrap: break-word\` or \`word-break: break-all\` |
| Long text that must truncate | \`overflow: hidden; text-overflow: ellipsis; white-space: nowrap\` |
| Variable-height card grids | \`align-items: start\` on the grid (don't stretch) or equal heights with Flex column + \`flex: 1\` on body |
| Long lists overflowing | \`max-height + overflow-y: auto\` on the container |
| Narrow container | \`min-width: 0\` on flex children |

The cell below injects each failure scenario into a card component. Observe what breaks and what holds.`,
      html: `<div id="overflow-controls">
  <button class="ov-btn active" data-mode="normal">Normal</button>
  <button class="ov-btn" data-mode="longword">Long word</button>
  <button class="ov-btn" data-mode="longtext">Long text</button>
  <button class="ov-btn" data-mode="empty">Empty</button>
  <button class="ov-btn" data-mode="narrow">Narrow</button>
</div>
<div id="ov-container">
  <div class="ov-card" id="ov-card">
    <div class="ov-header">
      <div class="ov-avatar">SC</div>
      <div class="ov-meta">
        <div class="ov-name" id="ov-name">Sarah Chen</div>
        <div class="ov-role" id="ov-role">Staff Engineer</div>
      </div>
      <div class="ov-badge" id="ov-badge">Active</div>
    </div>
    <p class="ov-bio" id="ov-bio">Leads the infrastructure platform team. Previously at Google and Stripe.</p>
    <div class="ov-footer">
      <button class="ov-action">View Profile</button>
      <span class="ov-joined" id="ov-joined">Joined March 2021</span>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#overflow-controls { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.ov-btn { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: var(--color-text-secondary, #475569); cursor: pointer; }
.ov-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
#ov-container { max-width: 340px; transition: max-width 0.3s; }
.ov-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.ov-header { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ov-avatar { width: 40px; height: 40px; border-radius: 50%; background: #2563eb;
  color: white; font-size: 13px; font-weight: 700; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0; }
.ov-meta { flex: 1; min-width: 0; }           /* min-width: 0 allows truncation */
.ov-name { font-size: 14px; font-weight: 600; color: #f1f5f9;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ov-role { font-size: 12px; color: var(--color-text-secondary, #475569);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ov-badge { font-size: 11px; font-weight: 600; color: #16a34a;
  background: #dcfce7; padding: 2px 8px; border-radius: 100px; flex-shrink: 0; }
.ov-bio { font-size: 13px; color: #94a3b8; line-height: 1.55; margin: 0;
  overflow-wrap: break-word; }               /* handles long words */
.ov-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ov-action  { font-size: 12px; font-weight: 600; padding: 6px 12px;
  background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;
  flex-shrink: 0; }
.ov-joined  { font-size: 11px; color: var(--color-text-secondary, #475569);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
      startCode: `const scenarios = {
  normal: {
    name: 'Sarah Chen',
    role: 'Staff Engineer',
    bio:  'Leads the infrastructure platform team. Previously at Google and Stripe.',
    badge: 'Active',
    joined: 'Joined March 2021',
    width: '340px',
  },
  longword: {
    name: 'Konstantinidis-Papadopoulos',            // long unhyphenated name
    role: 'Hauptverantwortliche-Infrastrukturarchitektin', // German compound role
    bio:  'Specialises in Zustandsverwaltungssysteme and Hochverfügbarkeitsarchitekturen.',
    badge: 'Active',
    joined: 'Beigetreten Januar 2019',
    width: '340px',
  },
  longtext: {
    name: 'Alex',
    role: 'Engineer',
    bio:  'Works across multiple teams on a wide variety of initiatives. ' +
          'Previously contributed to open source projects including distributed systems ' +
          'frameworks, observability tooling, and infrastructure automation libraries. ' +
          'Speaker at numerous conferences. Author of several widely-cited papers.',
    badge: 'Active',
    joined: 'Joined June 2018',
    width: '340px',
  },
  empty: {
    name: '',
    role: '',
    bio:  '',
    badge: '',
    joined: '',
    width: '340px',
  },
  narrow: {
    name: 'Sarah Chen',
    role: 'Staff Engineer',
    bio:  'Leads the infrastructure platform team.',
    badge: 'Active',
    joined: 'Joined March 2021',
    width: '180px',   // ← very narrow container
  },
};

function inject(mode) {
  const s = scenarios[mode];
  document.getElementById('ov-name').textContent   = s.name   || '—';
  document.getElementById('ov-role').textContent   = s.role   || '—';
  document.getElementById('ov-bio').textContent    = s.bio    || 'No bio provided.';
  document.getElementById('ov-badge').textContent  = s.badge  || '';
  document.getElementById('ov-joined').textContent = s.joined || '—';
  document.getElementById('ov-container').style.maxWidth = s.width;

  document.querySelectorAll('.ov-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));

  console.log('Mode: ' + mode);
  console.log('Check: does the card hold its structure?');
  console.log('Does text overflow its container? Does the card collapse?');
}

inject('normal');
document.querySelectorAll('.ov-btn').forEach(b =>
  b.addEventListener('click', () => inject(b.dataset.mode)));

console.log('Key techniques in this component:');
console.log('  .ov-meta: min-width: 0 — allows flex child to shrink below content');
console.log('  .ov-name: text-overflow: ellipsis — truncates gracefully');
console.log('  .ov-bio:  overflow-wrap: break-word — breaks long words');`,
      outputHeight: 400,
    },

    // ─── PART 9: ENGINEERING REALITY — INTRINSIC SIZING ──────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Intrinsic Sizing

The browser has a sophisticated sizing system. Understanding it lets you write layouts that work correctly without specifying a single pixel.

### The Four Size Keywords

**\`auto\`** — the browser decides, based on context. For block elements: full available width. For flex/grid items: content size if there's room, smaller if there isn't. \`margin: auto\` in a flex container is a spacer.

**\`min-content\`** — the smallest size the element can be without content overflowing. For text: the width of the longest unbreakable word. For a grid: the minimum it can collapse to.

**\`max-content\`** — the ideal size if space were infinite. For text: the full paragraph as a single line. Useful for column sizing in data tables.

**\`fit-content\`** — \`min(max-content, max(min-content, available-space))\`. Grows to fill content but never exceeds the available space. The "goldilocks" value.

### Why This Matters for Layout

When you write \`grid-template-columns: auto 1fr\`, the first column is sized by its content (auto) and the second takes the rest (1fr). No pixels specified. The layout is correct for any content width.

When you write \`width: fit-content\` on a tag or badge, it's as wide as its text but never overflows its container. No min-width or max-width juggling.

### The \`1fr\` Unit

\`1fr\` means "one fraction of the available space after fixed-size items are placed." It's the layout equivalent of \`flex: 1\`. Two \`1fr\` columns = equal columns. \`1fr 2fr\` = one-third and two-thirds.

**The critical difference from \`auto\`:** \`1fr\` distributes *available* space. \`auto\` takes *needed* space. In a sidebar layout: \`sidebar (auto) + content (1fr)\` — sidebar is as wide as its content, content fills the rest. This is the correct sidebar pattern and it requires zero pixel values.

### The Layout Mental Model

> Think of layout as hydraulics. Space fills containers like water fills pipes. \`1fr\` and \`flex: 1\` open valves. \`auto\` and \`fit-content\` regulate by content pressure. \`minmax()\` sets minimum and maximum pressures. Your job is to configure the valves, not specify the water level.`,
    },

    // ─── PART 10: ANTI-PATTERNS ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Layout Anti-Patterns Reference

Six layout failures that appear in nearly every real codebase.

---

### LY-1: The Magic Width
**Symptom:** \`width: 320px\` on a card in a flex or grid container. Works at one viewport size, breaks at all others.
**Cause:** Pixel-thinking — "this card is 320px wide" instead of "this card takes one column."
**Fix:** Replace with \`flex: 1\`, \`min-width: 0\`, or let the grid column define the width. The card should have no explicit \`width\` at all.

---

### LY-2: The Float Fossil
**Symptom:** \`float: left\` with \`clear: both\` to "fix" the layout. Often paired with \`overflow: hidden\` as a clearfix.
**Cause:** Pre-2015 layout patterns that never got refactored.
**Fix:** Replace with \`display: flex\` or \`display: grid\`. Remove all floats, clears, and clearfix hacks.

---

### LY-3: The Absolute Abuse
**Symptom:** \`position: absolute\` used for layout placement (not overlays). Elements positioned with specific top/left pixel values.
**Cause:** "I just need to move it 12px to the right" — treating layout as photo editing.
**Fix:** \`position: absolute\` is for overlays, tooltips, dropdowns, and modals — elements that escape normal flow intentionally. For everything else: Flex or Grid.

---

### LY-4: The Breakpoint Treadmill
**Symptom:** Five breakpoints, each with a different \`width\` and \`margin-left\` for every element. Adding one element requires updating all five breakpoints.
**Cause:** Responsive layout designed as a sequence of fixed-width snapshots.
**Fix:** \`repeat(auto-fill, minmax(min, 1fr))\` produces fluid responsive layouts with zero breakpoints. Breakpoints should be exceptions for dramatic layout changes, not the primary mechanism.

---

### LY-5: The Missing \`min-width: 0\`
**Symptom:** Text in a flex child refuses to truncate. Long words overflow their container. Flex items don't shrink below their content width.
**Cause:** Flex items have \`min-width: auto\` by default — they won't shrink below content size.
**Fix:** Add \`min-width: 0\` to any flex child that contains text that should truncate or wrap.

---

### LY-6: The Collapsed Grid
**Symptom:** Grid items are shorter than expected. The grid row collapses around the shortest item. Cards with variable content have mismatched heights.
**Cause:** \`align-items: stretch\` (default) stretches items to the tallest in the row — which is usually correct. But \`align-items: start\` causes rows to collapse to the shortest item's height.
**Fix:** For card grids: use the default \`stretch\`, then use Flex column with \`flex: 1\` on the card body to make short cards fill the row height. For content grids (not equal-height): \`align-items: start\` is correct.`,
    },

    // ─── PART 11: PRACTICE 2 — CONVERT TO GRID ───────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Convert Float Layout to Grid

You're given a two-column article layout built with floats — the classic pre-2015 pattern. A fixed-width sidebar floated left, content floated right, footer cleared with \`clear: both\`.

**Your task:** convert it to CSS Grid without changing any HTML, and without adding wrapper elements.

**Requirements:**
1. The page uses \`display: grid\` at the top level
2. The sidebar is approximately 260px wide, the content takes the rest
3. The footer spans both columns
4. No floats, no \`clear\`, no explicit pixel widths on sidebar or content
5. The gap between sidebar and content is \`space-5\` (24px)

The test checks: grid is used, no floats remain, footer spans full width, and no hardcoded widths on sidebar or content.

**Bonus:** after passing, add a third row above both columns for a page header that also spans full width. What changes in your \`grid-template-areas\` definition?`,
      html: `<div class="article-page" id="article-page">
  <aside class="ap-sidebar" id="ap-sidebar">
    <div class="sb-section">
      <div class="sb-label">In this issue</div>
      <ul class="sb-list">
        <li><a href="#">Pipeline rebuild</a></li>
        <li><a href="#">Event schema</a></li>
        <li><a href="#">On-call practices</a></li>
        <li><a href="#">Observability</a></li>
      </ul>
    </div>
    <div class="sb-section">
      <div class="sb-label">Authors</div>
      <div class="sb-author">Sarah Chen</div>
      <div class="sb-author">Marcus Liu</div>
    </div>
  </aside>
  <article class="ap-content" id="ap-content">
    <h1 class="ac-title">Engineering at Scale</h1>
    <p class="ac-body">When the alerts started firing at 3am on a Tuesday, we had a choice. The pipeline was dropping roughly 12% of events under peak load — not catastrophic, but trending worse. The architecture had been designed for 10,000 events per day and was now handling 2.3 million.</p>
    <p class="ac-body">So we rebuilt. Not migrated — rebuilt. From the event schema up. This is what we learned about system design, team coordination, and what it actually means to design for scale from the first line of code.</p>
    <h2 class="ac-h2">The constraint we ignored</h2>
    <p class="ac-body">Conventional wisdom says you can't rebuild a live system without downtime. We ignored that advice — not recklessly, but because the specific nature of our failure made incremental migration architecturally impossible.</p>
  </article>
  <footer class="ap-footer" id="ap-footer">
    Engineering Blog · Published March 14, 2025 · 8 min read
  </footer>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0;
  font-family: system-ui, sans-serif; }

/* BROKEN FLOAT LAYOUT — your job: replace with grid */
.article-page {
  max-width: 900px; margin: 0 auto;
  /* width: 900px; */ /* don't add back */
}
.ap-sidebar {
  float: left;          /* ← REMOVE */
  width: 240px;         /* ← REMOVE — use grid sizing */
  margin-right: 24px;   /* ← REMOVE — use gap */
}
.ap-content {
  float: left;          /* ← REMOVE */
  width: 612px;         /* ← REMOVE — use 1fr */
}
.ap-footer {
  clear: both;          /* ← REMOVE — use grid span */
  padding-top: 16px;
  border-top: 1px solid #334155;
}

/* Keep these — base styles */
.sb-label  { font-size: 10px; font-weight: 700; color: var(--color-text-secondary, #475569);
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.sb-list   { margin: 0 0 16px; padding-left: 0; list-style: none; }
.sb-list a { font-size: 13px; color: var(--color-text-secondary, #475569); text-decoration: none;
  display: block; padding: 3px 0; }
.sb-list a:hover { color: #94a3b8; }
.sb-author { font-size: 13px; color: var(--color-text-secondary, #475569); padding: 2px 0; }
.sb-section { margin-bottom: 20px; }
.ac-title  { font-size: 28px; font-weight: 700; color: #f1f5f9;
  line-height: 1.2; margin: 0 0 16px; max-width: 22ch; }
.ac-h2     { font-size: 18px; font-weight: 600; color: #f1f5f9;
  margin: 24px 0 8px; line-height: 1.3; }
.ac-body   { font-size: 15px; color: #94a3b8; line-height: 1.65;
  margin: 0 0 14px; max-width: 65ch; }
.ap-footer { font-size: 12px; color: var(--color-text-secondary, #475569); padding-top: 16px;
  border-top: 1px solid #334155; margin-top: 24px; }`,
      startCode: `// CONVERT THE FLOAT LAYOUT TO CSS GRID
// Do not change the HTML. Do not add wrapper elements.
// Remove all floats, clears, and explicit pixel widths.

const page    = document.getElementById('article-page');
const sidebar = document.getElementById('ap-sidebar');
const content = document.getElementById('ap-content');
const footer  = document.getElementById('ap-footer');

// Step 1: Set up the grid on the page container
// Use named areas or column spans for the footer
page.style.display = '???';
page.style.gridTemplateColumns = '???'; // ~260px for sidebar, 1fr for content
page.style.gap = '???'; // 24px

// Step 2: Clear the float layout
sidebar.style.float        = 'none';
sidebar.style.width        = '';    // remove the explicit width
sidebar.style.marginRight  = '';    // gap handles this now

content.style.float = 'none';
content.style.width = '';           // 1fr handles this via the grid column

footer.style.clear = 'none';
footer.style.gridColumn = '???';    // span both columns

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const ps  = window.getComputedStyle(page);
  const ss  = window.getComputedStyle(sidebar);
  const cs  = window.getComputedStyle(content);
  const fs  = window.getComputedStyle(footer);

  const checks = {
    'page uses grid':     ps.display === 'grid',
    'no sidebar float':   ss.float === 'none',
    'no content float':   cs.float === 'none',
    'footer spans cols':  fs.gridColumn && fs.gridColumn !== 'auto' && fs.gridColumn !== '1',
    'has gap':            parseFloat(ps.columnGap || ps.gap) >= 16,
  };
  console.log('=== LAYOUT CONVERSION AUDIT ===');
  Object.entries(checks).forEach(([k, v]) =>
    console.log((v ? '✓' : '✗') + ' ' + k));
}, 100);`,
      solutionCode: `const page    = document.getElementById('article-page');
const sidebar = document.getElementById('ap-sidebar');
const content = document.getElementById('ap-content');
const footer  = document.getElementById('ap-footer');

page.style.display = 'grid';
page.style.gridTemplateColumns = '260px 1fr';
page.style.gap = '24px';

sidebar.style.float       = 'none';
sidebar.style.width       = '';
sidebar.style.marginRight = '';

content.style.float = 'none';
content.style.width = '';

footer.style.clear      = 'none';
footer.style.gridColumn = '1 / -1'; // span all columns

setTimeout(() => {
  const ps = window.getComputedStyle(page);
  const ss = window.getComputedStyle(sidebar);
  const fs = window.getComputedStyle(footer);
  console.log('grid:', ps.display);
  console.log('sidebar float:', ss.float);
  console.log('footer gridColumn:', fs.gridColumn);
}, 100);`,
      check: (code) => {
        const hasGrid    = /page[\s\S]*?display.*['"]\s*grid\s*['"]|\.display\s*=\s*['"]grid['"]/i.test(code);
        const clearsFloat= /float.*none|float\s*=.*['"]none['"]/i.test(code);
        const spansFooter= /gridColumn.*(?:1.*-1|span|1\s*\/\s*-1)/i.test(code);
        return hasGrid && clearsFloat && spansFooter;
      },
      successMessage: `Float layout converted to Grid. The sidebar width is now a column definition, not a pixel on the element. The gap is on the container, not a margin on the sidebar. The footer spans automatically. Every future layout change happens in one place: the grid definition on the container.`,
      failMessage: `Three required changes: (1) page.style.display = 'grid'. (2) sidebar.style.float = 'none' (and content.style.float = 'none'). (3) footer.style.gridColumn must span both columns — use '1 / -1' or 'span 2'. Check the audit output for which step is missing.`,
      outputHeight: 500,
    },

    // ─── PART 12: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: The Broken App Shell

This application shell has **six deliberate layout violations**. It renders without JavaScript errors but breaks visibly and has hidden fragility. Your job is to diagnose and fix each one using anti-pattern names.

**The six violations:**
1. LY-2: Float fossil — the sidebar uses \`float: left\`
2. LY-1: Magic width — the content area has a hardcoded pixel width
3. LY-3: Absolute abuse — the notification badge is positioned absolutely in a way that breaks flow
4. LY-5: Missing \`min-width: 0\` — nav text overflows on narrow containers
5. LY-4: Manual responsive — explicit widths instead of \`minmax()\` for the card row
6. LY-6: Collapsed grid — the card row uses \`align-items: start\` making short cards misaligned

The test checks: no floats, no hardcoded widths on layout elements, min-width: 0 on the nav item, and grid is used for the card row.`,
      html: `<div class="app-shell">
  <header class="ash-header">
    <div class="ash-logo">Platform</div>
    <nav class="ash-nav">
      <div class="ash-nav-item">
        <span class="ani-label">Inbox</span>
        <span class="ani-badge">12</span>
      </div>
      <div class="ash-nav-item">
        <span class="ani-label">A team member with a very long display name that overflows</span>
      </div>
    </nav>
  </header>
  <div class="ash-body">
    <aside class="ash-sidebar">
      <div class="asb-item active">Overview</div>
      <div class="asb-item">Reports</div>
      <div class="asb-item">Settings</div>
    </aside>
    <main class="ash-main">
      <div class="ash-cards">
        <div class="ash-card">
          <div class="ac-label">Revenue</div>
          <div class="ac-val">$48,290</div>
          <div class="ac-sub">↑ 12% this quarter</div>
        </div>
        <div class="ash-card">
          <div class="ac-label">Users</div>
          <div class="ac-val">3,841</div>
          <div class="ac-sub">↑ 8% this month</div>
        </div>
        <div class="ash-card">
          <div class="ac-label">Issues</div>
          <div class="ac-val">7</div>
          <div class="ac-sub">↓ 3 since yesterday</div>
        </div>
      </div>
    </main>
  </div>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; }
.app-shell { display: flex; flex-direction: column; min-height: 100vh; }
.ash-header { display: flex; align-items: center; gap: 16px; padding: 0 20px;
  height: 48px; background: #1e293b; border-bottom: 1px solid #334155; }
.ash-logo { font-size: 15px; font-weight: 700; flex-shrink: 0; }
.ash-nav  { display: flex; gap: 4px; flex: 1; overflow: hidden; }

/* VIOLATION 5: LY-5 — missing min-width: 0 on nav items */
.ash-nav-item { display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px; position: relative;
  /* missing: min-width: 0 */ }
.ani-label { font-size: 13px; color: #94a3b8;
  /* missing: overflow + text-overflow for truncation */ }

/* VIOLATION 3: LY-3 — absolute badge breaks flow assumptions */
.ani-badge { position: absolute; top: -6px; right: -6px;
  font-size: 10px; font-weight: 700; background: #ef4444; color: white;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; }

.ash-body { display: flex; flex: 1; overflow: hidden; }

/* VIOLATION 2: LY-2 — float fossil */
.ash-sidebar { float: left;         /* ← wrong: should use flex or grid */
  width: 200px; flex-shrink: 0; padding: 16px 12px;
  background: #1e293b; border-right: 1px solid #334155; }
.asb-item { padding: 7px 10px; font-size: 13px; color: var(--color-text-secondary, #475569);
  border-radius: 6px; margin-bottom: 2px; cursor: pointer; }
.asb-item.active { background: #334155; color: #f1f5f9; }

/* VIOLATION 1: LY-1 — magic width */
.ash-main { width: 640px;           /* ← wrong: should use flex: 1 */
  padding: 20px; overflow-y: auto; }

/* VIOLATION 4: LY-4 — manual responsive widths instead of grid */
/* VIOLATION 6: LY-6 — align-items: start collapses cards */
.ash-cards { display: grid;
  grid-template-columns: 180px 180px 180px;  /* ← hardcoded columns */
  gap: 16px;
  align-items: start;                        /* ← should be stretch */
}
.ash-card { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 16px;
  display: flex; flex-direction: column; gap: 4px; }
.ac-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #475569);
  text-transform: uppercase; letter-spacing: 0.1em; }
.ac-val   { font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1.1; }
.ac-sub   { font-size: 12px; color: var(--color-text-secondary, #475569); }`,
      startCode: `// FIX EACH VIOLATION — name the anti-pattern as you fix it

// ── FIX LY-2: Float fossil — sidebar ──────────────────────────────────────────
// .ash-sidebar uses float: left — replace by making .ash-body a flex container
// (it already has display: flex, but sidebar float overrides that)
document.querySelector('.ash-sidebar').style.float = '???';

// ── FIX LY-1: Magic width — main content ──────────────────────────────────────
// .ash-main is width: 640px — should grow to fill remaining space
document.querySelector('.ash-main').style.width = '???';
document.querySelector('.ash-main').style.flex  = '???';

// ── FIX LY-5: Missing min-width: 0 ───────────────────────────────────────────
// Nav items don't have min-width: 0 — text overflows
document.querySelectorAll('.ash-nav-item').forEach(el => {
  el.style.minWidth = '???';
  el.style.overflow = '???';
});
document.querySelectorAll('.ani-label').forEach(el => {
  el.style.overflow     = '???';
  el.style.textOverflow = '???';
  el.style.whiteSpace   = '???';
});

// ── FIX LY-3: Absolute badge ───────────────────────────────────────────────────
// The absolute badge needs a positioned ancestor — .ash-nav-item needs position: relative
// (it already has it) — but the badge should actually be inline, not absolute
// Fix: make badge use static position within the flex row
document.querySelector('.ani-badge').style.position = '???';

// ── FIX LY-4: Manual responsive columns ──────────────────────────────────────
// Replace 180px 180px 180px with a responsive minmax() column definition
document.querySelector('.ash-cards').style.gridTemplateColumns = '???';

// ── FIX LY-6: Collapsed grid ─────────────────────────────────────────────────
// align-items: start collapses rows — cards should stretch to match tallest
document.querySelector('.ash-cards').style.alignItems = '???';

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const sidebar  = window.getComputedStyle(document.querySelector('.ash-sidebar'));
  const main     = window.getComputedStyle(document.querySelector('.ash-main'));
  const navItem  = window.getComputedStyle(document.querySelector('.ash-nav-item'));
  const cards    = window.getComputedStyle(document.querySelector('.ash-cards'));

  const checks = {
    'LY-2 float removed':    sidebar.float === 'none',
    'LY-1 magic width gone': !document.querySelector('.ash-main').style.width
                              || main.flexGrow !== '0',
    'LY-5 min-width fixed':  navItem.minWidth === '0px',
    'LY-4 responsive cols':  cards.gridTemplateColumns &&
                              !cards.gridTemplateColumns.match(/^180px/),
    'LY-6 stretch restored': cards.alignItems === 'normal' ||
                              cards.alignItems === 'stretch',
  };
  console.log('=== VIOLATIONS AUDIT ===');
  Object.entries(checks).forEach(([k, v]) => console.log((v ? '✓' : '✗') + ' ' + k));
}, 100);`,
      solutionCode: `// LY-2: Float fossil
document.querySelector('.ash-sidebar').style.float = 'none';

// LY-1: Magic width
document.querySelector('.ash-main').style.width = '';
document.querySelector('.ash-main').style.flex  = '1';

// LY-5: min-width: 0
document.querySelectorAll('.ash-nav-item').forEach(el => {
  el.style.minWidth = '0';
  el.style.overflow = 'hidden';
});
document.querySelectorAll('.ani-label').forEach(el => {
  el.style.overflow     = 'hidden';
  el.style.textOverflow = 'ellipsis';
  el.style.whiteSpace   = 'nowrap';
});

// LY-3: Badge should not be absolute in the middle of a flex row
document.querySelector('.ani-badge').style.position = 'static';

// LY-4: Responsive columns
document.querySelector('.ash-cards').style.gridTemplateColumns =
  'repeat(auto-fill, minmax(160px, 1fr))';

// LY-6: Stretch
document.querySelector('.ash-cards').style.alignItems = 'stretch';`,
      check: (code) => {
        const fixesFloat   = /ash-sidebar[\s\S]*?float.*none|float\s*=.*['"]none['"]/i.test(code);
        const fixesMinW    = /minWidth.*['"]0['"]/i.test(code);
        const fixesCols    = /minmax/i.test(code);
        const fixesStretch = /alignItems.*(?:stretch|normal)/i.test(code);
        return fixesFloat && fixesMinW && fixesCols;
      },
      successMessage: `Six violations fixed. LY-1 through LY-6 are now named tools in your diagnostic vocabulary. The most important fix is often LY-5 (min-width: 0) — it's invisible until text is long enough to overflow, which is exactly when it causes visible bugs in production.`,
      failMessage: `Three are required: (1) .ash-sidebar float must be 'none'. (2) .ash-nav-item min-width must be '0' (to allow text truncation). (3) .ash-cards gridTemplateColumns must use minmax() (not hardcoded 180px widths). Run the audit setTimeout to see individual check results.`,
      outputHeight: 480,
    },

    // ─── PART 13: STRESS CONDITION ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: Layout Under Variable Content

A layout system must hold at every content density. This means:
- 1 card or 50 cards — the grid reflows gracefully
- 3-word nav item or 30-word nav item — no overflow
- Empty state or overflowing state — the component communicates each correctly

The most important test is the **empty state**: what does the layout look like when there's no content? Most layouts have no empty state design, producing blank areas with no explanation. The user is left wondering if something is loading or if they've done something wrong.

The cell below tests the dashboard layout against five content scenarios. Pay attention to which layout properties are doing the heavy lifting in each case.`,
      html: `<div id="stress-controls">
  <button class="str-btn active" data-mode="normal">Normal (4 cards)</button>
  <button class="str-btn" data-mode="one">1 card</button>
  <button class="str-btn" data-mode="many">12 cards</button>
  <button class="str-btn" data-mode="long">Long values</button>
  <button class="str-btn" data-mode="empty">Empty state</button>
</div>
<div class="stress-grid" id="stress-grid"></div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#stress-controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.str-btn { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: var(--color-text-secondary, #475569); cursor: pointer; }
.str-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
.stress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-height: 100px;    /* prevents total collapse in empty state */
}
.sg-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.sg-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #475569);
  text-transform: uppercase; letter-spacing: 0.1em; }
.sg-value { font-size: 26px; font-weight: 700; color: #f1f5f9; line-height: 1.1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sg-sub   { font-size: 12px; color: var(--color-text-secondary, #475569); }
.sg-empty { grid-column: 1 / -1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 40px;
  color: #334155; font-size: 14px; text-align: center; gap: 8px; }
.sg-empty-icon  { font-size: 32px; }
.sg-empty-title { font-size: 16px; font-weight: 600; color: var(--color-text-secondary, #475569); }`,
      startCode: `function makeCard(label, value, sub) {
  return \`<div class="sg-card">
    <div class="sg-label">\${label}</div>
    <div class="sg-value">\${value}</div>
    <div class="sg-sub">\${sub}</div>
  </div>\`;
}

const datasets = {
  normal: [
    ['Revenue',    '$48,290',     '↑ 12%'],
    ['Users',      '3,841',       '↑ 8%'],
    ['Churn',      '2.4%',        '↓ 0.3%'],
    ['NPS',        '68',          '↑ 4pts'],
  ],
  one: [
    ['Revenue',    '$48,290',     '↑ 12% this quarter'],
  ],
  many: Array.from({ length: 12 }, (_, i) => [
    ['Revenue','Users','Churn','NPS','ARPU','LTV',
     'CAC','MRR','ARR','Trials','Converts','Churned'][i],
    ['$48k','3.8k','2.4%','68','$290','$2,400',
     '$180','$140k','$1.7M','412','89','23'][i],
    '↑ this period',
  ]),
  long: [
    ['Total Recurring Revenue', '$1,284,092.48', '↑ 12.3% vs last quarter'],
    ['Monthly Active Users',    '1,284,039',     '↑ 8.1% month over month'],
    ['Annual Churn Rate',       '2.401%',        '↓ 0.312 percentage points'],
    ['Net Promoter Score',      '68 / 100',      '↑ 4pts — exceeds target of 60'],
  ],
  empty: [],
};

function render(mode) {
  const grid  = document.getElementById('stress-grid');
  const items = datasets[mode];
  document.querySelectorAll('.str-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));

  if (items.length === 0) {
    grid.innerHTML = \`<div class="sg-empty">
      <div class="sg-empty-icon">�</div>
      <div class="sg-empty-title">No metrics available</div>
      <div>Connect a data source to start tracking performance</div>
    </div>\`;
    return;
  }

  grid.innerHTML = items.map(([l, v, s]) => makeCard(l, v, s)).join('');
  console.log('Mode: ' + mode + ' | Cards: ' + items.length);
  console.log('Grid reflows automatically — 1 card fills 1 column,');
  console.log('12 cards create as many rows as needed.');
  console.log('No layout code changed. The constraint handles it.');
}

render('normal');
document.querySelectorAll('.str-btn').forEach(b =>
  b.addEventListener('click', () => render(b.dataset.mode)));`,
      outputHeight: 400,
    },

    // ─── PART 14: PRACTICE 3 — OVERFLOW-SAFE NAV ─────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Build an Overflow-Safe Navigation Bar

Navigation bars are one of the most overflow-prone components in any UI. They need to:
1. Keep the logo fixed-width on the left
2. Show nav links horizontally, truncating gracefully when narrow
3. Push action buttons to the far right without floats
4. Never overflow their container — even with very long user names or translated strings
5. Maintain 48px height regardless of content

**The starter code** gives you a nav with the HTML structure and base colours. You wire up the layout using only Flex constraints.

**Requirements:**
- \`display: flex\` on the nav
- Logo uses \`flex-shrink: 0\` (never squishes)
- Nav links section has \`flex: 1\`, \`overflow: hidden\`, and \`min-width: 0\`
- Each nav link truncates with \`text-overflow: ellipsis\`
- Actions section uses \`flex-shrink: 0\` (never squishes)
- Gap between all sections: 16px

The test verifies: flex is used, logo shrinks to 0, nav section has overflow hidden, and the nav height is 48px.`,
      html: `<nav class="practice-nav" id="practice-nav">
  <div class="pn-logo" id="pn-logo">
    <div class="pn-logo-mark">A</div>
    <span class="pn-logo-text">Acme Platform</span>
  </div>
  <div class="pn-links" id="pn-links">
    <a class="pn-link active" href="#">Dashboard</a>
    <a class="pn-link" href="#">Reports &amp; Analytics</a>
    <a class="pn-link" href="#">Team Settings</a>
    <a class="pn-link" href="#">Integrations</a>
  </div>
  <div class="pn-actions" id="pn-actions">
    <div class="pn-user">
      <div class="pn-avatar">SC</div>
      <span class="pn-username" id="pn-username">Sarah Chen</span>
    </div>
    <button class="pn-cta">New Report</button>
  </div>
</nav>
<div style="margin-top:12px;display:flex;gap:8px">
  <button class="test-btn" onclick="document.getElementById('pn-username').textContent='Sarah Chen'">Normal name</button>
  <button class="test-btn" onclick="document.getElementById('pn-username').textContent='Konstantinidis-Papadopoulos-Stavros'">Long name</button>
  <button class="test-btn" onclick="document.getElementById('pn-links').style.maxWidth='200px'">Narrow links</button>
  <button class="test-btn" onclick="document.getElementById('pn-links').style.maxWidth=''">Reset width</button>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0;
  font-family: system-ui, sans-serif; }
.test-btn { font-size: 11px; padding: 5px 10px; border-radius: 5px;
  border: 1px solid #334155; background: #1e293b; color: var(--color-text-secondary, #475569); cursor: pointer; }

/* BASE STYLES — add layout properties in JS */
.practice-nav { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 0 20px; }
.pn-logo      { display: flex; align-items: center; gap: 8px; }
.pn-logo-mark { width: 28px; height: 28px; border-radius: 6px;
  background: #2563eb; color: white; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pn-logo-text { font-size: 14px; font-weight: 700; color: #f1f5f9; white-space: nowrap; }
.pn-links     { display: flex; gap: 2px; }
.pn-link      { font-size: 13px; color: var(--color-text-secondary, #475569); text-decoration: none;
  padding: 6px 10px; border-radius: 6px; white-space: nowrap; }
.pn-link.active { color: #f1f5f9; background: #334155; }
.pn-actions   { display: flex; align-items: center; gap: 10px; }
.pn-user      { display: flex; align-items: center; gap: 8px; min-width: 0; }
.pn-avatar    { width: 28px; height: 28px; border-radius: 50%; background: #7c3aed;
  color: white; font-size: 11px; font-weight: 700; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0; }
.pn-username  { font-size: 13px; color: #94a3b8; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
.pn-cta       { padding: 7px 14px; background: #2563eb; color: white;
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; }`,
      startCode: `// BUILD THE OVERFLOW-SAFE NAV USING FLEX CONSTRAINTS ONLY
// No pixel widths on logo, links, or actions sections.

const nav     = document.getElementById('practice-nav');
const logo    = document.getElementById('pn-logo');
const links   = document.getElementById('pn-links');
const actions = document.getElementById('pn-actions');

// ── Step 1: Main nav layout ────────────────────────────────────────────────────
nav.style.display     = '???';    // flex
nav.style.alignItems  = '???';    // centre everything vertically
nav.style.gap         = '???';    // 16px between logo / links / actions
nav.style.height      = '???';    // 48px fixed height

// ── Step 2: Logo — never squish ───────────────────────────────────────────────
logo.style.flexShrink = '???';    // 0 — logo never compresses

// ── Step 3: Links — take available space, hide overflow ───────────────────────
links.style.flex      = '???';    // 1 — takes all available space
links.style.minWidth  = '???';    // 0 — allows shrinking below content size
links.style.overflow  = '???';    // hidden — clips overflowing links

// ── Step 4: Actions — never squish ────────────────────────────────────────────
actions.style.flexShrink = '???'; // 0 — action buttons never compress
actions.style.marginLeft = '???'; // 'auto' — OR use flex: 1 on links instead

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const ns = window.getComputedStyle(nav);
  const ls = window.getComputedStyle(logo);
  const lks= window.getComputedStyle(links);

  const checks = {
    'nav display: flex':    ns.display === 'flex',
    'nav height: 48px':     parseFloat(ns.height) === 48,
    'logo flex-shrink: 0':  parseFloat(ls.flexShrink) === 0,
    'links overflow hidden':lks.overflow === 'hidden',
    'links min-width: 0':   lks.minWidth === '0px',
  };
  console.log('=== NAV AUDIT ===');
  Object.entries(checks).forEach(([k, v]) =>
    console.log((v ? '✓' : '✗') + ' ' + k));

  console.log('\\nTry the test buttons above: long name, narrow links.');
  console.log('The nav should hold its structure in both cases.');
}, 100);`,
      solutionCode: `const nav     = document.getElementById('practice-nav');
const logo    = document.getElementById('pn-logo');
const links   = document.getElementById('pn-links');
const actions = document.getElementById('pn-actions');

nav.style.display    = 'flex';
nav.style.alignItems = 'center';
nav.style.gap        = '16px';
nav.style.height     = '48px';

logo.style.flexShrink = '0';

links.style.flex     = '1';
links.style.minWidth = '0';
links.style.overflow = 'hidden';

actions.style.flexShrink = '0';

setTimeout(() => {
  const ns  = window.getComputedStyle(nav);
  const ls  = window.getComputedStyle(logo);
  const lks = window.getComputedStyle(links);
  const checks = {
    'nav display: flex':    ns.display === 'flex',
    'nav height: 48px':     parseFloat(ns.height) === 48,
    'logo flex-shrink: 0':  parseFloat(ls.flexShrink) === 0,
    'links overflow hidden':lks.overflow === 'hidden',
    'links min-width: 0':   lks.minWidth === '0px',
  };
  Object.entries(checks).forEach(([k, v]) => console.log((v ? '✓' : '✗') + ' ' + k));
}, 100);`,
      check: (code) => {
        const hasFlex     = /nav[\s\S]*?display.*['"]\s*flex\s*['"]|\.display\s*=\s*['"]flex['"]/i.test(code);
        const hasHeight   = /height.*['"]48px['"]/i.test(code);
        const hasMinW     = /minWidth.*['"]0['"]/i.test(code);
        const hasOverflow = /overflow.*['"]hidden['"]/i.test(code);
        return hasFlex && hasMinW && hasOverflow;
      },
      successMessage: `Overflow-safe nav built. The three key constraints: logo flex-shrink:0 (never squishes), links overflow:hidden + min-width:0 (clips gracefully), actions flex-shrink:0 (CTA always visible). Try the long-name and narrow-links tests — the nav holds its structure in both cases without a single breakpoint.`,
      failMessage: `Three required: (1) nav.style.display = 'flex'. (2) links.style.minWidth = '0' — this is the critical fix that allows the links section to shrink below its content width. (3) links.style.overflow = 'hidden' — clips the overflowing link text. Without both of these on .pn-links, long nav items will push the action buttons off-screen.`,
      outputHeight: 420,
    },

    // ─── PART 15: CROSS-PLATFORM + SEED ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Layout Constraints Everywhere

The constraint model is not CSS-specific. Every major UI framework has equivalents.

| Concept | CSS | Qt Layouts | Unity UI | Figma |
|---|---|---|---|---|
| Flex row | \`display: flex\` | \`QHBoxLayout\` | Horizontal Layout Group | Auto Layout (horizontal) |
| Flex column | \`flex-direction: column\` | \`QVBoxLayout\` | Vertical Layout Group | Auto Layout (vertical) |
| Equal columns | \`flex: 1\` | \`QSizePolicy::Expanding\` | Flexible Width | Fill container |
| Fixed element | \`flex-shrink: 0\` | \`QSizePolicy::Fixed\` | Preserve Aspect / fixed W | Fixed width |
| 2D grid | \`display: grid\` | \`QGridLayout\` | Grid Layout Group | Grid (beta) |
| Gap | \`gap: 16px\` | \`setSpacing(16)\` | \`spacing = 16\` | Gap: 16 |
| Responsive | \`minmax(200px, 1fr)\` | Min/max size policies | Layout element constraints | Min/max width |
| Overflow hide | \`overflow: hidden\` | \`QScrollArea\` clip | Mask component | Clip content |

### What Never Changes

1. **Never use pixel widths on layout containers.** Use proportional units (1fr, flex: 1) or min/max constraints.
2. **Gap on the container, not margin on the children.** One value, one place.
3. **min-width: 0 on any flex child with text.** Always. Everywhere.
4. **Intrinsic sizing for fixed elements** (icons, avatars, badges): \`flex-shrink: 0\` / fixed size policy.
5. **Empty states are layout states.** Design them or the grid collapses to nothing.

---

## What You Now Know

After Lesson 4, you can:
- Rebuild any float-based layout using Flex and Grid
- Write responsive card grids without media queries using \`minmax()\`
- Compose nested Flex and Grid layouts correctly
- Handle the five overflow scenarios with the correct CSS tools
- Name and fix all six layout anti-patterns (LY-1 through LY-6)
- Audit any layout for magic numbers and float fossils using \`auditLayout()\`

**Lessons 1–4 complete Phase 1.** You now have four interlocking systems: visual hierarchy, spacing, typography, and layout. Every component you encounter can be described by these four systems.

**Next lesson: Colour Systems** — functional colour vocabulary, semantic tokens, the full dark/light token architecture, and how to build a colour system that survives theming without hand-editing every value.`,
    },

    // ─── PART 16: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 4 Complete — The Reference Layout System

The canonical layout patterns for this course. Read each one once — these are the patterns you reach for first for any layout problem. The \`auditLayout()\` function below is your carry-forward tool: zero violations means no floats, no hardcoded widths on layout containers, and at least one flex or grid context.`,
      html: `<div class="ref-layout">
  <header class="rl-header">
    <div class="rl-logo">System</div>
    <nav class="rl-nav">
      <a class="rl-link active" href="#">Overview</a>
      <a class="rl-link" href="#">Reports</a>
      <a class="rl-link" href="#">Settings</a>
    </nav>
    <div class="rl-spacer"></div>
    <button class="rl-cta">New</button>
  </header>
  <main class="rl-main">
    <aside class="rl-sidebar">
      <div class="rs-item active">Dashboard</div>
      <div class="rs-item">Analytics</div>
      <div class="rs-item">Users</div>
    </aside>
    <section class="rl-content">
      <div class="rl-grid">
        <div class="rl-card"><div class="rc-l">Revenue</div><div class="rc-v">$48k</div></div>
        <div class="rl-card"><div class="rc-l">Users</div><div class="rc-v">3.8k</div></div>
        <div class="rl-card"><div class="rc-l">NPS</div><div class="rc-v">68</div></div>
        <div class="rl-card"><div class="rc-l">Churn</div><div class="rc-v">2.4%</div></div>
      </div>
    </section>
  </main>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; }

/* ── PAGE: grid rows ── */
.ref-layout {
  display: grid;
  grid-template-rows: 48px 1fr;
  min-height: 280px;
}

/* ── HEADER: flex row ── */
.rl-header {
  display: flex; align-items: center; gap: 8px;
  padding: 0 20px; background: #1e293b; border-bottom: 1px solid #334155;
}
.rl-logo { font-size: 15px; font-weight: 700; flex-shrink: 0; }
.rl-nav  { display: flex; gap: 2px; flex: 1; min-width: 0; overflow: hidden; }
.rl-link { font-size: 13px; color: var(--color-text-secondary, #475569); padding: 5px 10px; border-radius: 6px;
  text-decoration: none; white-space: nowrap; }
.rl-link.active { color: #f1f5f9; background: #334155; }
.rl-spacer { flex: 1; }
.rl-cta  { padding: 6px 14px; background: #2563eb; color: white; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
  flex-shrink: 0; }

/* ── BODY: sidebar + content grid ── */
.rl-main {
  display: grid;
  grid-template-columns: 180px 1fr;   /* fixed sidebar, fluid content */
}
.rl-sidebar { background: #1e293b; border-right: 1px solid #334155; padding: 12px; }
.rs-item    { padding: 7px 10px; font-size: 13px; color: var(--color-text-secondary, #475569);
  border-radius: 6px; margin-bottom: 2px; cursor: pointer; }
.rs-item.active { background: #334155; color: #f1f5f9; }
.rl-content { padding: 20px; overflow-y: auto; }

/* ── CARD GRID: auto-responsive ── */
.rl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.rl-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.rc-l { font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #475569);
  text-transform: uppercase; letter-spacing: 0.1em; }
.rc-v { font-size: 24px; font-weight: 700; color: #f1f5f9; }`,
      startCode: `// Final audit: verify no float, no magic widths on layout containers

function auditLayout(rootSelector) {
  const root = document.querySelector(rootSelector);
  if (!root) { console.warn('Element not found:', rootSelector); return; }

  const violations = [];
  const modernLayouts = [];

  root.querySelectorAll('*').forEach(el => {
    const s    = window.getComputedStyle(el);
    const name = '.' + (el.className.toString().trim().split(/\\s+/)[0] || el.tagName.toLowerCase());

    // Float check
    if (s.float !== 'none') {
      violations.push(name + ': float=' + s.float + ' (use flex/grid)');
    }

    // Hardcoded width on flex/grid children (not the root)
    if (el !== root && el.style.width && !['100%','auto',''].includes(el.style.width)) {
      const w = parseFloat(el.style.width);
      if (w > 0 && el.style.width.includes('px')) {
        violations.push(name + ': width=' + el.style.width + ' (use 1fr or flex:1)');
      }
    }

    // Collect modern layout usage
    if (['flex','grid','inline-flex','inline-grid'].includes(s.display)) {
      modernLayouts.push(name + ': display=' + s.display);
    }
  });

  console.log('=== LESSON 4 — LAYOUT AUDIT: ' + rootSelector + ' ===\\n');
  console.log('Modern layout contexts (' + modernLayouts.length + '):');
  modernLayouts.forEach(m => console.log('  ✓ ' + m));

  if (violations.length === 0) {
    console.log('\\n✓ ZERO VIOLATIONS — no floats, no hardcoded widths');
  } else {
    console.log('\\nViolations (' + violations.length + '):');
    violations.forEach(v => console.log('  ✗ ' + v));
  }

  return violations.length === 0;
}

const pass = auditLayout('.ref-layout');
console.log('\\nFinal result:', pass ? '✓ PASS' : '✗ FAIL');
console.log('');
console.log('Four layout systems now complete:');
console.log('  1. Hierarchy  — 4 levels, 4 levers');
console.log('  2. Spacing    — 8 tokens, 5 roles, 4px base');
console.log('  3. Typography — scale, line-height function, measure');
console.log('  4. Layout     — Flex + Grid as constraint declarations');
console.log('');
console.log('Lesson 5 → Colour Systems');
console.log('Semantic tokens, theming architecture, dark/light switching.');`,
      outputHeight: 420,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-04-layout-systems',
  slug: 'layout-systems',
  chapter: 'design.1',
  order: 4,
  title: 'Layout Systems',
  subtitle: 'Stop placing elements. Start declaring constraints. Flex and Grid are not styling tools — they are constraint languages.',
  tags: [
    'css', 'flexbox', 'grid', 'layout', 'responsive', 'constraints',
    'intrinsic-sizing', 'overflow', 'minmax', 'auto-fill', 'auto-fit',
    'design-systems', 'anti-patterns', 'composition',
  ],
  hook: {
    question: 'Why does your layout work at 1440px and break at 1200px? Why does adding a fifth card destroy the four-card row? The answer is you specified positions instead of relationships.',
    realWorldContext:
      'Float-based layouts, hardcoded pixel widths, and breakpoint-heavy media queries all share one failure mode: they are descriptions of one state, not a system that produces correct output at all states. ' +
      'Flex and Grid are constraint languages. You declare the relationships. The browser resolves the pixels. ' +
      'The same 20 lines of CSS that produce a 4-column grid at 1200px will produce a 2-column grid at 640px and a 1-column grid at 320px — with no breakpoints written.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Flex is one-dimensional. Grid is two-dimensional. Use Flex inside components, Grid between components.',
      'Never write an explicit pixel width on a flex child or grid item. Use 1fr, flex: 1, auto, or minmax().',
      'repeat(auto-fill, minmax(200px, 1fr)) is a complete responsive grid with no breakpoints.',
      'min-width: 0 on every flex child that contains text. Always. Everywhere.',
      'gap on the container, not margin on the children. One declaration replaces N margin-bottom hacks.',
      'Empty states are layout states. The grid must have a min-height or the empty case collapses to nothing.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Core Shift',
        body: 'Placement says "this element is 320px wide." Constraint says "this element takes one equal share of the available space." Placement breaks when the container changes. Constraints adapt.',
      },
      {
        type: 'important',
        title: 'min-width: 0',
        body: 'Flex items have min-width: auto by default — they refuse to shrink below their content size. This causes text overflow in nav bars, cards, and any flex layout with variable-length content. Add min-width: 0 to any flex child that should shrink. This is the most-missed property in all of flex layout.',
      },
      {
        type: 'tip',
        title: 'The Spacer Pattern',
        body: 'To push items to opposite ends of a flex row (logo left, actions right), use a div with flex: 1 between them. Or use margin-left: auto on the right group. Both are constraint declarations, not pixel placements.',
      },
      {
        type: 'warning',
        title: 'LY-4: The Breakpoint Treadmill',
        body: 'If you find yourself writing @media queries to change column counts, stop. Write repeat(auto-fill, minmax(N, 1fr)) instead. The grid produces the correct number of columns for any container width without any media queries.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 4: Layout Systems',
        props: { lesson: LESSON_DESIGN_04 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'CSS Grid and Flexbox implement constraint-based layout, a paradigm from GUI frameworks (e.g., Apple\'s Auto Layout, Android\'s ConstraintLayout) where relationships between elements are declared and the engine resolves pixel values. This is computationally more expensive than absolute layout but produces correct output for all container sizes.',
      'The 1fr unit in Grid is equivalent to the proportion system in print layout (em squares, column units). It distributes space after fixed-size tracks are placed, analogous to distributing remainder paper width after margins and gutters.',
      'The min-width: auto default for flex items was a deliberate specification choice (CSS Flexbox Level 1, §4.5) to prevent overflow in the default case. It is the most common source of unexpected flex layout bugs in production because it only manifests when content is longer than the available space.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Flex = 1D (one axis). Grid = 2D (rows + columns). Use Flex inside components, Grid for page structure and component grids.',
    'Never explicit pixel widths on layout containers. Use 1fr, flex: 1, auto, or minmax().',
    'repeat(auto-fill, minmax(min, 1fr)) = responsive grid, zero breakpoints.',
    'min-width: 0 on every flex child that contains text. This is the most-missed flex property.',
    'gap on the container. Not margin on the children.',
    'Six anti-patterns: LY-1 magic width, LY-2 float fossil, LY-3 absolute abuse, LY-4 breakpoint treadmill, LY-5 missing min-width:0, LY-6 collapsed grid.',
    'auditLayout() verifies: no floats, no hardcoded widths, at least one flex/grid context.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Flex = 1D. Grid = 2D." You are building the overall page structure with a sidebar and a main content area. Which tool is correct?',
      options: [
        'Flex — it is more flexible and works for any layout',
        'Grid — page structure is inherently two-dimensional (rows and columns)',
        'Either works equally well for page structure',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Never explicit pixel widths on layout containers." Why does a 300px sidebar break responsive design?',
      options: [
        'It only breaks on mobile — desktop is fine',
        'The sidebar stays 300px on all screens, so on small viewports it can overflow or crowd the main content with no automatic adjustment',
        'Pixel values cause slower rendering because the browser cannot cache layout calculations',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"repeat(auto-fill, minmax(min, 1fr)) = responsive grid, zero breakpoints." Why does this pattern eliminate breakpoints?',
      options: [
        'It uses JavaScript to recalculate column count on resize',
        'The browser computes how many columns fit at any container width — the grid reflows automatically without media query thresholds',
        'auto-fill is a media query shorthand that handles common breakpoints internally',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"gap on the container. Not margin on the children." A flex container has three children each with margin-right: 16px. What problem does this cause?',
      options: [
        'No problem — margin and gap produce identical visual results',
        'The last child also gets 16px right margin, adding unwanted space at the edge. gap only creates space between children, never outside them',
        'Margin is not supported on flex children',
      ],
      correct: 1,
    },
  ],
};