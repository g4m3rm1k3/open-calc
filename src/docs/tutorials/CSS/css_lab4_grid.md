# CSS Masterclass — Lab 4
## CSS Grid: Two-Dimensional Layouts

---

**What this lab is about.**

Flexbox handles one direction at a time — a row or a column. CSS Grid handles
both directions simultaneously. It is the right tool whenever you need items
to align across both rows and columns at the same time.

You will use Grid for:
- Settings panels where labels in column 1 align with inputs in column 2
  across every row
- The overall application shell (rows and columns together)
- Anything where you want precise control over both dimensions at once

The rule of thumb: if you're thinking about rows AND columns at the same time,
use Grid. If you're thinking about one direction, use Flex.

Create a new file called `grid-experiments.html`. You will build it up through
the lab.

---

## Part 1 — The HTML first, no styles

Type this. Save it. Open it in the browser and look at the plain unstyled
structure before touching any CSS.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSS Grid</title>
</head>
<body>

  <h1>CSS Grid Experiments</h1>

  <!-- Experiment 1: Basic grid -->
  <section id="exp-1">
    <h2>Experiment 1 — Basic Grid</h2>
    <div class="grid-basic">
      <div class="cell">1</div>
      <div class="cell">2</div>
      <div class="cell">3</div>
      <div class="cell">4</div>
      <div class="cell">5</div>
      <div class="cell">6</div>
    </div>
  </section>

  <!-- Experiment 2: Named columns with different sizes -->
  <section id="exp-2">
    <h2>Experiment 2 — Mixed column sizes</h2>
    <div class="grid-mixed">
      <div class="cell">Fixed 120px</div>
      <div class="cell">Flexible 1fr</div>
      <div class="cell">Flexible 2fr</div>
    </div>
  </section>

  <!-- Experiment 3: The settings form pattern -->
  <section id="exp-3">
    <h2>Experiment 3 — Settings form (label + input aligned)</h2>
    <div class="settings-form">

      <label>Feed Rate</label>
      <input type="number" value="1200">
      <span>mm/min</span>

      <label>Spindle RPM</label>
      <input type="number" value="12000">
      <span>RPM</span>

      <label>Safe Z Height</label>
      <input type="number" value="5">
      <span>mm</span>

      <label>Cut Depth</label>
      <input type="number" value="-2">
      <span>mm</span>

      <label>Passes</label>
      <input type="number" value="1">
      <span></span>

    </div>
  </section>

  <!-- Experiment 4: Spanning cells -->
  <section id="exp-4">
    <h2>Experiment 4 — Spanning rows and columns</h2>
    <div class="grid-span">
      <div class="cell span-wide">I span 2 columns</div>
      <div class="cell">Normal</div>
      <div class="cell span-tall">I span 2 rows</div>
      <div class="cell">Normal</div>
      <div class="cell">Normal</div>
      <div class="cell">Normal</div>
      <div class="cell">Normal</div>
    </div>
  </section>

  <!-- Experiment 5: Named template areas — the app shell -->
  <section id="exp-5">
    <h2>Experiment 5 — Named areas (the app shell)</h2>
    <div class="app-shell">
      <div class="shell-menubar">Menubar</div>
      <div class="shell-toolbar">Toolbar</div>
      <div class="shell-sidebar">Sidebar</div>
      <div class="shell-canvas">Canvas</div>
      <div class="shell-panel">Panel</div>
      <div class="shell-status">Status</div>
    </div>
  </section>

  <!-- Experiment 6: Auto-filling card grid -->
  <section id="exp-6">
    <h2>Experiment 6 — Auto-fill card grid</h2>
    <div class="card-grid">
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
      <div class="card">Card 4</div>
      <div class="card">Card 5</div>
      <div class="card">Card 6</div>
      <div class="card">Card 7</div>
      <div class="card">Card 8</div>
    </div>
  </section>

</body>
</html>
```

Save and open. You see plain stacked content. Every element is a block taking
up the full width. Nothing is in a grid yet. This is the baseline.

---

## Part 2 — Base styles

Add `<style>` inside `<head>`. Add these rules one group at a time.
Save and refresh after each group.

**Step 1 — Reset and body. Save.**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0d0d1a;
  color: #c0c0d8;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  padding: 40px;
}
```

**Step 2 — Headings and sections. Save.**

```css
h1 {
  font-size: 20px;
  color: #8899cc;
  margin-bottom: 40px;
}

h2 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #445566;
  margin-bottom: 12px;
}

section {
  margin-bottom: 60px;
}
```

**Step 3 — The cell style used in every experiment. Save.**

```css
.cell {
  background: #1a1a3e;
  border: 1px solid rgba(51, 119, 255, 0.3);
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
  color: #8899cc;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Part 3 — The basic grid

Grid starts with `display: grid` on the container. Then you define the columns.

Add CSS for Experiment 1. Save after each step.

**Step 1 — Turn on grid. Save.**

```css
.grid-basic {
  display: grid;
}
```

Nothing changes visually. The cells are still stacked. You turned on grid
but haven't defined any columns — grid defaults to a single column.

**Step 2 — Define three equal columns. Save.**

```css
.grid-basic {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

The six cells arrange into two rows of three. `1fr` means one fraction of the
available space. Three `1fr` columns split the space into equal thirds.

`fr` is a unit that only exists in grid. It means "one share of the leftover
space after fixed sizes are taken out." Two `1fr` columns are equal halves.
`2fr 1fr` gives the first column twice as much space as the second.

**Step 3 — Add gap between cells. Save.**

```css
.grid-basic {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
```

Space appears between cells. `gap` in grid works the same as in flex — spacing
between items, not at the edges.

**Step 4 — Shorthand: repeat(). Save.**

```css
.grid-basic {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
```

`repeat(3, 1fr)` is exactly the same as `1fr 1fr 1fr`. For many columns this
shorthand is much cleaner.

---

## Part 4 — Mixed column sizes

Add CSS for Experiment 2. Save after each step.

**Step 1 — Define the mixed columns. Save.**

```css
.grid-mixed {
  display: grid;
  grid-template-columns: 120px 1fr 2fr;
  gap: 8px;
}
```

Three cells appear. First column is exactly 120px. Second column takes one
share of the remaining space. Third column takes two shares — twice as wide
as the second.

This is the single most common grid pattern in application UIs: a fixed-size
column for labels and flexible columns for content.

**Step 2 — Try minmax(). Save.**

```css
.grid-mixed {
  display: grid;
  grid-template-columns: 120px minmax(100px, 1fr) 2fr;
  gap: 8px;
}
```

`minmax(100px, 1fr)` means the column is at least 100px but grows up to `1fr`.
Resize the browser window to see it: the column shrinks as the window gets
smaller but never below 100px.

---

## Part 5 — The settings form pattern

This is the most practically important grid pattern for CAD/CAM panels. Three
columns: label, input, unit. Every row aligns perfectly because it's a grid.

Add CSS for Experiment 3. Save after each step.

**Step 1 — Plain grid layout. Save.**

```css
.settings-form {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px 12px;
  align-items: center;
  max-width: 420px;
}
```

The labels, inputs, and units snap into three columns. Every label aligns with
every other label. Every input aligns. Every unit label aligns. One `display:
grid` rule does what would take dozens of margin and width rules with flexbox.

`gap: 8px 12px` — the first value is the row gap, the second is the column gap.
`auto` for the first and last columns means "only as wide as the content needs."
`1fr` for the middle column means "fill the remaining space."
`align-items: center` vertically centers each cell in its row.

**Step 2 — Style the labels. Save.**

```css
.settings-form label {
  font-size: 12px;
  color: #6677aa;
  text-align: right;
  white-space: nowrap;
}
```

Labels turn grey, right-aligned, and don't wrap. Right-aligned labels next
to left-aligned inputs is the standard form pattern — the eyes can scan down
the center line between them.

**Step 3 — Style the inputs. Save.**

```css
.settings-form input {
  height: 26px;
  background: #080818;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 3px;
  color: #c0c0d8;
  font-family: 'Consolas', monospace;
  font-size: 12px;
  padding: 0 8px;
  outline: none;
  text-align: right;
  -moz-appearance: textfield;
}

.settings-form input::-webkit-outer-spin-button,
.settings-form input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.settings-form input:focus {
  border-color: rgba(51, 119, 255, 0.6);
}
```

**Step 4 — Style the unit labels. Save.**

```css
.settings-form span {
  font-size: 10px;
  color: #445566;
  white-space: nowrap;
}
```

The form now looks exactly like the properties panel in a professional CAD
application. Every row is perfectly aligned across all three columns because
the grid enforces alignment — you never have to set widths or margins on
individual rows.

This is the reason to use Grid over Flex for forms. With Flex, each row is
an independent flex container. Labels in row 1 and row 2 have no connection —
you have to set a fixed `width` on every label to make them align. With Grid,
the columns span all rows automatically.

---

## Part 6 — Spanning cells

Sometimes a cell needs to occupy more than one column or row. Add CSS for
Experiment 4.

**Step 1 — Set up the grid. Save.**

```css
.grid-span {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 80px);
  gap: 8px;
}
```

The cells flow into a 3×3 grid. Each row is exactly 80px tall.

**Step 2 — Make one cell span two columns. Save.**

```css
.span-wide {
  grid-column: span 2;
  background: rgba(51, 187, 119, 0.15);
  border-color: rgba(51, 187, 119, 0.4);
  color: #88ccaa;
}
```

The "I span 2 columns" cell stretches across two columns. The other cells
reflow around it.

**Step 3 — Make another cell span two rows. Save.**

```css
.span-tall {
  grid-row: span 2;
  background: rgba(220, 50, 80, 0.15);
  border-color: rgba(220, 50, 80, 0.4);
  color: #cc8899;
}
```

The "I span 2 rows" cell stretches down across two rows.

`grid-column: span 2` means "take up 2 column tracks."
`grid-row: span 2` means "take up 2 row tracks."

You can also specify exact positions:

```css
grid-column: 1 / 3;   /* from line 1 to line 3 (spans 2 columns) */
grid-column: 2 / 4;   /* from line 2 to line 4 (columns 2 and 3) */
grid-row: 1 / -1;     /* from line 1 to the last line (spans all rows) */
```

Grid lines are numbered from 1 (left/top edge) to n+1 where n is the number
of tracks. `-1` refers to the last line.

---

## Part 7 — Named template areas: the app shell

Grid's most powerful feature for application layouts is named template areas.
You draw the layout as ASCII art in your CSS, then assign each element to
a named region.

Add CSS for Experiment 5. Take your time reading each step.

**Step 1 — The grid template. Save.**

```css
.app-shell {
  display: grid;
  height: 400px;
  grid-template-columns: 48px 1fr 240px;
  grid-template-rows: 28px 36px 1fr 22px;
  grid-template-areas:
    "menubar  menubar  menubar"
    "toolbar  toolbar  toolbar"
    "sidebar  canvas   panel"
    "status   status   status";
}
```

Nothing changes visually yet — the children haven't been assigned to areas.
But read the `grid-template-areas` carefully. Each string is a row. Each word
is a cell. Repeating the same word across columns means that area spans those
columns. This is your entire app layout drawn as text.

**Step 2 — Assign children to areas. Save.**

```css
.shell-menubar { grid-area: menubar; }
.shell-toolbar { grid-area: toolbar; }
.shell-sidebar { grid-area: sidebar; }
.shell-canvas  { grid-area: canvas;  }
.shell-panel   { grid-area: panel;   }
.shell-status  { grid-area: status;  }
```

The app shell appears. Six elements snap into their exact regions. Menubar
spans all three columns. Toolbar spans all three. The middle row has three
separate columns. Status bar spans all three.

**Step 3 — Style each region. Save.**

```css
.shell-menubar {
  background: #060610;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 11px;
  color: #334466;
}

.shell-toolbar {
  background: #0f0f1e;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
  font-size: 11px;
  color: #445577;
}

.shell-sidebar {
  background: #0f0f1e;
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  gap: 4px;
}

.shell-canvas {
  background: #080810;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #223344;
}

.shell-panel {
  background: #0f0f1e;
  border-left: 1px solid rgba(255,255,255,0.07);
  padding: 8px;
  font-size: 11px;
  color: #445566;
}

.shell-status {
  background: #060610;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 10px;
  color: #334455;
  font-family: 'Consolas', monospace;
}
```

You now have a complete, proportioned application shell built with CSS Grid.
The entire layout is defined by `grid-template-areas` — change one word there
and the whole layout changes.

---

## Part 8 — Flex vs Grid: when to use which

Now that you know both, here is the decision framework:

**Use Flex when:**
- Items are in one direction (a row OR a column)
- Items should grow and shrink based on available space
- The number of items is dynamic or unknown
- You need the spacer pattern (pushing items to opposite ends)

Examples: toolbar, navigation menu, a row of buttons, a column of list items,
the overall app body (which is a column of stacking regions).

**Use Grid when:**
- Items need to align in both dimensions simultaneously
- You know the column structure in advance
- You want labels in one column to align with inputs in another across all rows
- You are defining a fixed page/panel layout with named regions

Examples: settings forms, the app shell layout, card grids, any panel where
two or more columns of content must stay aligned.

**The hybrid approach (most real layouts):**

The outer shell is Grid — it places the major regions (menubar, sidebar,
canvas, panel, status). Inside each region, Flex handles the item arrangement.
A toolbar region is a flex row. A panel body is a flex column. A settings form
is a grid.

Grid and Flex are not alternatives — they work together. The shell is Grid.
Everything inside the shell is Flex.

---

## Part 9 — The auto-fill card grid

This is the grid pattern for a responsive set of cards that fills available
space without media queries.

Add CSS for Experiment 6. Save after each step.

**Step 1 — The auto-fill grid. Save.**

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
```

The cards arrange into columns. Try resizing the browser window — the number
of columns changes automatically as the window gets wider or narrower. Each
card is always between 180px and `1fr` wide.

`auto-fill` creates as many columns as will fit. `minmax(180px, 1fr)` makes
each column at least 180px but able to grow to fill available space.

This is the complete responsive grid. No media queries. No breakpoints. It
just works at every width.

**Step 2 — Style the cards. Save.**

```css
.card {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 20px;
  font-size: 13px;
  color: #6677aa;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card:hover {
  border-color: rgba(51,119,255,0.3);
  background: #111128;
}
```

Clean cards with hover states. Resize the window — watch the columns adjust.

**The difference between auto-fill and auto-fit:**

`auto-fill` creates empty columns to fill the space when there aren't enough
items. `auto-fit` collapses empty columns so existing items can grow larger.
For most purposes they behave identically when items fill the space. The
difference only shows when there are fewer items than would fill the row.

---

## Part 10 — Row and column alignment

Grid has alignment properties just like Flex. The key ones:

**`justify-items`** — aligns cells horizontally within their column track.
Default is `stretch` (fills the track).

**`align-items`** — aligns cells vertically within their row track.
Default is `stretch` (fills the track).

**`justify-content`** — aligns the entire grid horizontally within the
container. Only matters if the total grid width is less than the container.

**`align-content`** — aligns the entire grid vertically within the container.
Only matters if the total grid height is less than the container.

For individual cells, use `justify-self` and `align-self` to override
the grid-level alignment.

Add this experiment to see it in action:

```html
<section id="exp-alignment">
  <h2>Alignment within grid cells</h2>
  <div class="grid-align">
    <div class="cell" style="justify-self: start; align-self: start;">start/start</div>
    <div class="cell" style="justify-self: center; align-self: center;">center/center</div>
    <div class="cell" style="justify-self: end; align-self: end;">end/end</div>
    <div class="cell">stretch/stretch (default)</div>
    <div class="cell" style="justify-self: start; align-self: end;">start/end</div>
    <div class="cell" style="justify-self: end; align-self: start;">end/start</div>
  </div>
</section>
```

```css
.grid-align {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 100px);
  gap: 8px;
}
```

Each cell sits differently within its 100px-tall track based on its
`align-self` value. The default (no alignment set) stretches to fill the
track.

---

## Part 11 — Apply to camtool.html

Open `camtool.html`. You are going to convert one section from Flex to Grid
where Grid is the better tool, and add a properly-aligned settings section.

**Task 1: Convert the CAM settings panel to use Grid.**

The right dock has `.panel-body` with the collapsible sections. Inside the
Geometry section you have form rows built with Flex. Convert them to use
Grid so all labels and all inputs align across rows.

Find the Geometry section in your HTML. Change the form rows to this structure:

```html
<details class="section" open>
  <summary class="section-header">CAM Settings</summary>
  <div class="section-body">

    <div class="prop-grid">
      <label>Feed Rate</label>
      <input type="number" class="form-input" value="1200">
      <span class="form-unit">mm/min</span>

      <label>Spindle</label>
      <input type="number" class="form-input" value="12000">
      <span class="form-unit">RPM</span>

      <label>Safe Z</label>
      <input type="number" class="form-input" value="5" step="0.1">
      <span class="form-unit">mm</span>

      <label>Cut Depth</label>
      <input type="number" class="form-input" value="-2" step="0.1">
      <span class="form-unit">mm</span>

      <label>Passes</label>
      <input type="number" class="form-input" value="1" step="1" min="1">
      <span class="form-unit"></span>
    </div>

  </div>
</details>
```

Add the `.prop-grid` CSS:

```css
.prop-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px 8px;
  align-items: center;
}

.prop-grid label {
  font-size: 11px;
  color: #6677aa;
  text-align: right;
  white-space: nowrap;
}

.prop-grid .form-unit {
  font-size: 10px;
  color: #445566;
  white-space: nowrap;
}
```

Save and refresh. The labels all align in a column. The inputs all align.
The unit labels all align. This is what Grid does that Flex cannot — enforces
alignment across rows without fixed widths.

**Task 2: Look at the shell with fresh eyes.**

Your `camtool.html` shell uses Flex for everything. That is correct — the
outer shell is a column of stacking regions, and each region is a row or column
of items. Grid named areas would be an alternative approach for the outer shell.

Compare your Flex-based shell to the Grid-based shell in Experiment 5.
They produce the same visual result. The Grid approach is more explicit about
the layout structure. The Flex approach is more flexible when regions need to
resize dynamically (which they will, when you add splitters in Lab 8).

For the CAM application, keep the Flex shell and use Grid inside panels
for forms. That is the right combination.

---

## What you learned in this lab

- `display: grid` with `grid-template-columns` defines the column structure
- `fr` is the grid fraction unit — splits available space proportionally
- `repeat(n, size)` is shorthand for repeating column definitions
- `gap` creates spacing between cells (row gap and column gap)
- `minmax(min, max)` creates flexible columns with size limits
- The settings form pattern: `grid-template-columns: auto 1fr auto` with
  `align-items: center` aligns labels, inputs, and units perfectly
- `grid-column: span n` and `grid-row: span n` make a cell occupy multiple tracks
- `grid-template-areas` names regions and places children using `grid-area`
- `auto-fill` with `minmax` creates responsive grids without media queries
- Grid is for two-dimensional alignment. Flex is for one-dimensional flow.
- Use Grid for forms and the shell layout. Use Flex inside regions.

## What comes in Lab 5

Lab 5 is Transitions and Animations. This is what makes UI feel alive —
hover states that fade in smoothly, panels that slide open, buttons that
have a satisfying press response. You will learn when animation makes UI
better and when it makes it worse, and build the exact transitions your
`camtool.html` needs.
