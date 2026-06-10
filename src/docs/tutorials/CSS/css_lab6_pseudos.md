# CSS Masterclass — Lab 6
## Pseudo-classes and Pseudo-elements: CSS That Responds to State

---

**What this lab is about.**

Every interactive element in your application has multiple states: resting,
hovered, focused, active, disabled, checked. Pseudo-classes let CSS respond
to those states without any JavaScript.

Pseudo-elements let you add visual elements — arrows, underlines, indicators,
decorative shapes — directly in CSS without adding any HTML. The section
collapse arrow, the dropdown chevron, the active tool indicator — all of these
can be pure CSS.

By the end of this lab you will be able to style every state of every component
completely, and generate visual decorations without touching the HTML.

Create `pseudo.html`. Build it up through the lab.

---

## Part 1 — The HTML first, no styles

Type this. Save. Open in the browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pseudo-classes and Pseudo-elements</title>
</head>
<body>

  <h1>Pseudo-classes and Pseudo-elements</h1>

  <!-- Experiment 1: Interactive state pseudo-classes -->
  <section id="exp-1">
    <h2>Experiment 1 — Interactive states</h2>

    <div class="state-demos">
      <button class="state-btn">Normal button</button>
      <button class="state-btn" disabled>Disabled button</button>
      <a href="#" class="state-link">A link</a>
      <a href="#" class="state-link visited-demo">A visited link</a>
    </div>

    <div class="input-states">
      <input type="text" class="state-input" placeholder="Click to focus me">
      <input type="text" class="state-input" value="I have content" placeholder="Type here">
      <input type="text" class="state-input error" value="Invalid value">
      <input type="text" class="state-input" placeholder="Required field" required>
    </div>

  </section>

  <!-- Experiment 2: Structural pseudo-classes -->
  <section id="exp-2">
    <h2>Experiment 2 — Structural pseudo-classes</h2>

    <ul class="entity-list">
      <li class="entity-item">Line — from (0,0) to (100,50)</li>
      <li class="entity-item">Circle — center (50,50) radius 30</li>
      <li class="entity-item">Arc — center (0,0) radius 80, 0° to 90°</li>
      <li class="entity-item">Line — from (10,10) to (90,90)</li>
      <li class="entity-item">Circle — center (20,80) radius 15</li>
      <li class="entity-item">Polyline — 5 points</li>
      <li class="entity-item">Arc — center (50,50) radius 40, 180° to 270°</li>
    </ul>

  </section>

  <!-- Experiment 3: Form pseudo-classes -->
  <section id="exp-3">
    <h2>Experiment 3 — Form state pseudo-classes</h2>

    <form class="demo-form" novalidate>

      <div class="form-row">
        <label>Feed Rate</label>
        <input type="number" min="1" max="30000" value="1200" required>
        <span class="unit">mm/min</span>
      </div>

      <div class="form-row">
        <label>Passes</label>
        <input type="number" min="1" max="20" value="0" required>
        <span class="unit"></span>
      </div>

      <div class="form-row">
        <label>Snap to grid</label>
        <input type="checkbox" id="snap-check">
        <span class="unit"></span>
      </div>

      <div class="form-row">
        <label>Units</label>
        <select>
          <option>Millimeters</option>
          <option>Inches</option>
        </select>
        <span class="unit"></span>
      </div>

    </form>

  </section>

  <!-- Experiment 4: ::before and ::after — adding content in CSS -->
  <section id="exp-4">
    <h2>Experiment 4 — ::before and ::after</h2>

    <div class="pseudo-demos">
      <div class="with-arrow">Settings Panel</div>
      <div class="with-badge">Notifications</div>
      <div class="with-line">Section Divider</div>
      <div class="with-dot active-dot">Active Tool</div>
      <div class="with-dot">Inactive Tool</div>
      <div class="quote-block">The best CAD/CAM software is the one you built yourself.</div>
    </div>

  </section>

  <!-- Experiment 5: The section header arrow -->
  <section id="exp-5">
    <h2>Experiment 5 — Pure CSS collapsible section</h2>

    <details class="css-section">
      <summary class="css-section-header">Geometry</summary>
      <div class="css-section-body">
        <p>X1: 0.000 mm</p>
        <p>Y1: 0.000 mm</p>
        <p>X2: 100.000 mm</p>
        <p>Y2: 50.000 mm</p>
        <p>Length: 111.803 mm</p>
      </div>
    </details>

    <details class="css-section">
      <summary class="css-section-header">Style</summary>
      <div class="css-section-body">
        <p>Color: #3377ff</p>
        <p>Layer: Layer 0</p>
        <p>Line width: 1px</p>
      </div>
    </details>

    <details class="css-section">
      <summary class="css-section-header">Info</summary>
      <div class="css-section-body">
        <p>ID: 42</p>
        <p>Type: Line</p>
      </div>
    </details>

  </section>

  <!-- Experiment 6: nth-child patterns -->
  <section id="exp-6">
    <h2>Experiment 6 — nth-child: striped lists and special items</h2>

    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Length</th>
          <th>Layer</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>001</td><td>Line</td><td>111.803</td><td>Layer 0</td></tr>
        <tr><td>002</td><td>Circle</td><td>188.496</td><td>Layer 0</td></tr>
        <tr><td>003</td><td>Arc</td><td>62.832</td><td>Layer 1</td></tr>
        <tr><td>004</td><td>Line</td><td>56.569</td><td>Layer 0</td></tr>
        <tr><td>005</td><td>Polyline</td><td>234.100</td><td>Layer 1</td></tr>
        <tr><td>006</td><td>Circle</td><td>94.248</td><td>Layer 2</td></tr>
        <tr><td>007</td><td>Arc</td><td>31.416</td><td>Layer 0</td></tr>
        <tr><td>008</td><td>Line</td><td>70.711</td><td>Layer 1</td></tr>
      </tbody>
    </table>

  </section>

  <!-- Experiment 7: :not() — excluding elements -->
  <section id="exp-7">
    <h2>Experiment 7 — :not() selector</h2>

    <div class="button-group">
      <button class="group-btn">Select</button>
      <button class="group-btn">Line</button>
      <button class="group-btn active">Arc</button>
      <button class="group-btn">Circle</button>
      <button class="group-btn" disabled>Trim</button>
    </div>

  </section>

</body>
</html>
```

Save and open. Plain unstyled HTML. Look at the structure — a form, a list,
a table, buttons, details elements. Nothing is styled yet.

---

## Part 2 — Base styles

Add `<style>` in `<head>`. Add these, save and refresh after each step.

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
  line-height: 1.6;
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
  margin-bottom: 16px;
}

section {
  margin-bottom: 60px;
}
```

---

## Part 3 — Interactive state pseudo-classes

Pseudo-classes start with a single colon. They target elements based on their
current state or position in the document.

Add CSS for Experiment 1. Save after each step and hover/click/focus elements
to see each state activate.

**Step 1 — Base button and layout. Save.**

```css
.state-demos {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.state-btn {
  padding: 9px 20px;
  background: #1a1a3e;
  border: 1px solid rgba(51,119,255,0.3);
  border-radius: 5px;
  color: #6688cc;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background 80ms ease, border-color 80ms ease, color 80ms ease,
              transform 80ms ease, box-shadow 80ms ease;
}
```

**Step 2 — :hover state. Save.**

```css
.state-btn:hover {
  background: #252550;
  border-color: rgba(51,119,255,0.6);
  color: #99aadd;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

Hover over the first button. It lifts and brightens.

**Step 3 — :active state (the press). Save.**

```css
.state-btn:active {
  background: #111130;
  transform: translateY(1px);
  box-shadow: none;
}
```

Click and hold. The button pushes down.

**Step 4 — :focus-visible state. Save.**

```css
.state-btn:focus-visible {
  outline: 2px solid #3377ff;
  outline-offset: 3px;
}

.state-btn:focus:not(:focus-visible) {
  outline: none;
}
```

Tab to the button using your keyboard. A blue ring appears. Click with the
mouse — no ring. This is the correct pattern: keyboard users get a focus
indicator, mouse users do not get the distraction.

`:focus-visible` is the modern standard. It only activates when the browser
determines the focus is worth showing — keyboard navigation and sequential
tab focus. `:focus:not(:focus-visible)` removes focus rings from mouse clicks.

**Step 5 — :disabled state. Save.**

```css
.state-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}
```

The disabled button is greyed out. `cursor: not-allowed` would show a "not
allowed" cursor, but `pointer-events: none` prevents any mouse interaction
at all — so the cursor never changes over it. Keep both in case `pointer-events`
is overridden somewhere.

**Step 6 — Link states. Save.**

```css
.state-link {
  color: #5588ff;
  font-size: 13px;
  text-decoration: none;
  transition: color 80ms ease;
}

.state-link:hover   { color: #88aaff; text-decoration: underline; }
.state-link:visited { color: #9966cc; }
.state-link:active  { color: #ff6644; }
```

The four link states in order. `:link` (unvisited), `:visited`, `:hover`,
`:active`. Always define them in this order — the cascade applies them
correctly when they overlap.

---

## Part 4 — Input states

Add CSS for the input elements in Experiment 1.

**Step 1 — Base input. Save.**

```css
.input-states {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
}

.state-input {
  height: 32px;
  background: #080818;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #c0c0d8;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  padding: 0 10px;
  outline: none;
  transition: border-color 160ms ease, background 160ms ease;
  width: 100%;
}
```

**Step 2 — :focus state. Save.**

```css
.state-input:focus {
  border-color: rgba(51,119,255,0.7);
  background: #0a0a20;
}
```

Click any input. The border highlights blue and the background subtly darkens.
This is the standard focus pattern for inputs — clearly shows which field is
active without being harsh.

**Step 3 — :placeholder-shown pseudo-class. Save.**

```css
.state-input:placeholder-shown {
  color: #445566;
  font-style: italic;
}
```

`:placeholder-shown` matches when the input is empty and showing its placeholder.
You can use this to style the placeholder text directly, but also as a hook for
other styles — for example, showing a label differently when a field is empty.

**Step 4 — :not(:placeholder-shown) — when the field has content. Save.**

```css
.state-input:not(:placeholder-shown) {
  border-color: rgba(255,255,255,0.15);
}
```

The second input (which has a value) gets a slightly stronger border, showing
it has content. `:not(:placeholder-shown)` matches when the input has a value
typed into it.

**Step 5 — Error state. Save.**

```css
.state-input.error {
  border-color: rgba(220,50,80,0.6);
  background: rgba(220,50,80,0.05);
}

.state-input.error:focus {
  border-color: rgba(220,50,80,0.9);
}
```

The third input (which has the `.error` class in the HTML) shows a red border.
In the real application, JavaScript adds this class when validation fails.

---

## Part 5 — Structural pseudo-classes

These target elements based on their position in the HTML tree.

Add CSS for Experiment 2. Save after each step.

**Step 1 — Base list. Save.**

```css
.entity-list {
  list-style: none;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  overflow: hidden;
  max-width: 500px;
}

.entity-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #7788aa;
  font-family: 'Consolas', monospace;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
```

A clean list. All items look the same.

**Step 2 — :first-child and :last-child. Save.**

```css
.entity-item:first-child {
  color: #99aacc;
  font-weight: 600;
}

.entity-item:last-child {
  border-bottom: none;
}
```

The first item is slightly brighter. The last item loses its bottom border
(removing the double border at the bottom of the container). `:last-child` for
removing trailing borders or margins is one of the most useful CSS patterns.

**Step 3 — :nth-child() for alternating rows. Save.**

```css
.entity-item:nth-child(even) {
  background: rgba(255,255,255,0.02);
}
```

Every other row gets a very subtle background tint. `:nth-child(even)` matches
every second item. `:nth-child(odd)` matches every first, third, fifth item.

**Step 4 — :hover on list items. Save.**

```css
.entity-item:hover {
  background: rgba(51,119,255,0.08);
  color: #aabbdd;
  cursor: pointer;
}
```

Hover over rows. They highlight. Combined with the alternating background,
this creates a clear interactive list that always shows the hovered row
regardless of whether it's even or odd.

**Step 5 — :nth-child with a formula. Save.**

```css
.entity-item:nth-child(3n) {
  border-left: 2px solid rgba(51,119,255,0.2);
}
```

`:nth-child(3n)` matches every third item (items 3, 6, 9...). The formula
is `An + B` where A and B are numbers. Common patterns:

```css
:nth-child(2n)    /* every 2nd: 2, 4, 6... (same as :even) */
:nth-child(2n+1)  /* every 2nd starting at 1: 1, 3, 5... (same as :odd) */
:nth-child(3n)    /* every 3rd: 3, 6, 9... */
:nth-child(3n+1)  /* every 3rd starting at 1: 1, 4, 7... */
:nth-child(-n+3)  /* first 3 items only */
:nth-child(n+4)   /* all items from the 4th onward */
```

---

## Part 6 — Form pseudo-classes

These are specific to form elements. Add CSS for Experiment 3.

**Step 1 — The form grid layout. Save.**

```css
.demo-form {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px 12px;
  align-items: center;
  max-width: 400px;
}

.demo-form label {
  font-size: 12px;
  color: #6677aa;
  text-align: right;
  white-space: nowrap;
}

.demo-form input,
.demo-form select {
  height: 28px;
  background: #080818;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  color: #c0c0d8;
  font-family: 'Consolas', monospace;
  font-size: 12px;
  padding: 0 8px;
  outline: none;
  transition: border-color 160ms ease;
}

.demo-form .unit {
  font-size: 10px;
  color: #445566;
}
```

**Step 2 — :focus. Save.**

```css
.demo-form input:focus,
.demo-form select:focus {
  border-color: rgba(51,119,255,0.6);
}
```

Click each field. The border turns blue on focus.

**Step 3 — :valid and :invalid. Save.**

```css
.demo-form input:invalid {
  border-color: rgba(220,50,80,0.5);
}

.demo-form input:valid:not(:placeholder-shown) {
  border-color: rgba(51,187,119,0.4);
}
```

The Passes field has `value="0"` and `min="1"` — zero is below the minimum,
so it's invalid. Its border turns red. The Feed Rate field (value: 1200,
min: 1) is valid and shows a green border.

`:valid` and `:invalid` respond to HTML5 validation attributes: `required`,
`min`, `max`, `minlength`, `maxlength`, `pattern`. The browser validates
automatically — you just style the states.

`:valid:not(:placeholder-shown)` — the extra condition prevents showing the
green border on empty fields that are technically valid (empty is neither
valid nor invalid for most fields until submitted).

**Step 4 — :checked for the checkbox. Save.**

```css
.demo-form input[type="checkbox"] {
  width: 16px;
  height: 16px;
  appearance: none;
  background: #080818;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: background 80ms ease, border-color 80ms ease;
}

.demo-form input[type="checkbox"]:checked {
  background: #3377ff;
  border-color: #3377ff;
}
```

Click the checkbox. It turns blue when checked. `appearance: none` removes
the default browser checkbox so you can style it completely.

**Step 5 — Add the checkmark using ::after. Save.**

```css
.demo-form input[type="checkbox"] {
  width: 16px;
  height: 16px;
  appearance: none;
  background: #080818;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: background 80ms ease, border-color 80ms ease;
  position: relative;
}

.demo-form input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 80ms ease;
}

.demo-form input[type="checkbox"]:checked::after {
  opacity: 1;
}
```

The checkmark appears when checked. It's made from a CSS border trick:
a rectangle with only the right and bottom borders visible, rotated 45 degrees.
No image, no SVG — pure CSS.

---

## Part 7 — ::before and ::after: adding content in CSS

Pseudo-elements use double colons. They create virtual child elements at the
start (`::before`) or end (`::after`) of an element's content. They are
invisible unless you give them `content: ''` and some CSS.

Add CSS for Experiment 4. Save after each step.

**Step 1 — Layout for the demo items. Save.**

```css
.pseudo-demos {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

.pseudo-demos > div {
  padding: 14px 18px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 5px;
  font-size: 13px;
  color: #8899aa;
  position: relative;
}
```

Boxes appear in a column.

**Step 2 — An arrow using ::after. Save.**

```css
.with-arrow {
  padding-right: 36px;
}

.with-arrow::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-right: 2px solid #445566;
  border-bottom: 2px solid #445566;
  transform: translateY(-50%) rotate(-45deg);
}
```

A small arrow (chevron) appears on the right side of the "Settings Panel"
box. It's two borders of a square rotated 45 degrees — the same technique
used for the checkmark. No HTML added.

**Step 3 — A badge number using ::after. Save.**

```css
.with-badge {
  padding-right: 48px;
}

.with-badge::after {
  content: '3';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: #dd3355;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
}
```

A red badge with "3" appears on the right of the "Notifications" box.
`content: '3'` sets the text content of the pseudo-element. You can put
any text in `content`.

**Step 4 — A decorative line using ::before and ::after. Save.**

```css
.with-line {
  text-align: center;
  color: #445566;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  overflow: hidden;
}

.with-line::before,
.with-line::after {
  content: '';
  display: inline-block;
  vertical-align: middle;
  width: 100px;
  height: 1px;
  background: rgba(255,255,255,0.08);
}

.with-line::before {
  margin-right: 12px;
}

.with-line::after {
  margin-left: 12px;
}
```

A "Section Divider" label with lines extending from each side. Both pseudo-
elements are used together to create a symmetric decoration. Common for
section headers and separators.

**Step 5 — An active dot indicator using ::before. Save.**

```css
.with-dot {
  padding-left: 28px;
  color: #556677;
}

.with-dot::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #334455;
  transition: background 160ms ease;
}

.with-dot.active-dot {
  color: #c0c0d8;
}

.with-dot.active-dot::before {
  background: #3377ff;
  box-shadow: 0 0 8px rgba(51,119,255,0.5);
}
```

The "Active Tool" item has a blue glowing dot. The "Inactive Tool" has a dark
dot. Adding or removing the `.active-dot` class switches the indicator.
No HTML changed — just a class toggle.

**Step 6 — A decorative quote using ::before. Save.**

```css
.quote-block {
  font-style: italic;
  color: #778899;
  padding-left: 20px;
  border-left: 3px solid rgba(51,119,255,0.4);
  line-height: 1.7;
}

.quote-block::before {
  content: '"';
  position: absolute;
  left: -4px;
  top: -8px;
  font-size: 48px;
  color: rgba(51,119,255,0.2);
  font-family: Georgia, serif;
  line-height: 1;
}
```

A large decorative quotation mark floats behind the text. `content: '"'`
uses the actual Unicode curly quote character.

---

## Part 8 — The section header arrow (pure CSS)

This is the most practical use of pseudo-elements in the CAM application.
The section header arrow that rotates when open — all in CSS, no HTML, no
JavaScript for the animation.

Add CSS for Experiment 5. Save after each step.

**Step 1 — Style the details element. Save.**

```css
.css-section {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
```

The three sections are separated by lines.

**Step 2 — Style the summary (the clickable header). Save.**

```css
.css-section-header {
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 10px 0 24px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #556688;
  cursor: pointer;
  user-select: none;
  list-style: none;
  position: relative;
  transition: color 80ms ease, background 80ms ease;
}

.css-section-header::-webkit-details-marker {
  display: none;
}

.css-section-header:hover {
  color: #8899bb;
  background: rgba(255,255,255,0.02);
}
```

`list-style: none` and `::-webkit-details-marker { display: none }` remove
the default browser triangle. You are replacing it with your own.

**Step 3 — Add the arrow using ::before. Save.**

```css
.css-section-header::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid #445566;
  border-bottom: 1.5px solid #445566;
  transform: translateY(-60%) rotate(-45deg);
  transition: transform 160ms ease, border-color 80ms ease;
}

.css-section-header:hover::before {
  border-color: #6677aa;
}
```

A small arrow appears to the left of each header. It points right (→) when
closed.

**Step 4 — Rotate the arrow when open. Save.**

```css
details[open] .css-section-header::before {
  transform: translateY(-30%) rotate(45deg);
}
```

Click a section header. The arrow rotates 90 degrees from → to ↓. The
transition makes it smooth.

`details[open]` is an attribute selector that matches `<details>` elements
with the `open` attribute — which the browser adds and removes automatically
when the user clicks the summary.

**Step 5 — Style the section body. Save.**

```css
.css-section-body {
  padding: 10px 10px 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.css-section-body p {
  font-size: 12px;
  font-family: 'Consolas', monospace;
  color: #7788aa;
}
```

Click the section headers. They open and close with smooth arrow rotation.
This is the properties panel's collapsible section — built entirely in CSS.

---

## Part 9 — nth-child: the data table

Add CSS for Experiment 6. Save after each step.

**Step 1 — Base table. Save.**

```css
.data-table {
  border-collapse: collapse;
  width: 100%;
  max-width: 600px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
}
```

**Step 2 — Table headers. Save.**

```css
.data-table th {
  background: #111120;
  color: #556688;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 8px 14px;
  text-align: left;
  border-bottom: 2px solid rgba(255,255,255,0.08);
}
```

**Step 3 — Table rows. Save.**

```css
.data-table td {
  padding: 9px 14px;
  color: #7788aa;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
```

**Step 4 — Alternating row colors using :nth-child. Save.**

```css
.data-table tbody tr:nth-child(even) {
  background: rgba(255,255,255,0.02);
}
```

Every other row has a subtle tint. Striped tables dramatically improve
readability for dense data — the eye can track across a row without losing
its place.

**Step 5 — Hover on rows. Save.**

```css
.data-table tbody tr:hover {
  background: rgba(51,119,255,0.08);
  color: #aabbcc;
}

.data-table tbody tr:hover td {
  color: #aabbcc;
}
```

Hover over rows. They highlight. The highlight works on both even and odd rows
because `:hover` has higher specificity than `:nth-child`.

**Step 6 — First column styling. Save.**

```css
.data-table td:first-child,
.data-table th:first-child {
  color: #445566;
  width: 60px;
}

.data-table td:last-child,
.data-table th:last-child {
  color: #664488;
}
```

The ID column (first) is dimmer. The Layer column (last) is purple-tinted.
`:first-child` and `:last-child` on `td` elements target the first and last
column cells.

---

## Part 10 — :not() selector

`:not(selector)` matches elements that do NOT match the selector inside.
It is one of the most useful selectors for avoiding repeated overrides.

Add CSS for Experiment 7. Save after each step.

**Step 1 — Base button group. Save.**

```css
.button-group {
  display: flex;
  gap: 2px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  padding: 4px;
  width: fit-content;
}

.group-btn {
  padding: 7px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #556688;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background 80ms ease, color 80ms ease, border-color 80ms ease;
}
```

**Step 2 — Hover using :not() to exclude disabled and active buttons. Save.**

```css
.group-btn:not(.active):not(:disabled):hover {
  background: rgba(255,255,255,0.05);
  color: #99aacc;
}
```

Hover over each button. The hover only applies to buttons that are not `.active`
and not `disabled`. Without `:not()` you would have to write:

```css
/* Without :not() — verbose and fragile */
.group-btn:hover { background: ...; }
.group-btn.active:hover { background: initial; }  /* undo it for active */
.group-btn:disabled:hover { background: initial; } /* undo it for disabled */
```

With `:not()` you express the intent directly: hover works on buttons that
are neither active nor disabled.

**Step 3 — Active state. Save.**

```css
.group-btn.active {
  background: rgba(51,119,255,0.15);
  border-color: rgba(51,119,255,0.4);
  color: #7799ff;
}
```

**Step 4 — Disabled state. Save.**

```css
.group-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Step 5 — Remove border-radius from middle buttons for a connected group look. Save.**

```css
.group-btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.group-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.group-btn:last-child {
  border-radius: 0 4px 4px 4px;
}
```

The buttons now join together visually — first button rounded on the left only,
last button rounded on the right only, middle buttons with no border-radius.
A segmented control, entirely in CSS using `:first-child`, `:last-child`,
and `:not()`.

---

## Part 11 — :is() and :where() — writing selectors efficiently

These are modern selectors that let you group targets without repeating the
full selector chain.

**:is()** — matches any element that matches any selector in the list:

```css
/* Without :is() — repetitive */
.panel-header:hover,
.panel-header:focus,
.panel-header:active {
  background: var(--bg-hover);
}

/* With :is() — cleaner */
.panel-header:is(:hover, :focus, :active) {
  background: var(--bg-hover);
}
```

**:where()** — same as `:is()` but has zero specificity. Useful for base
styles that are easy to override:

```css
/* :where() styles are easy to override because they add no specificity */
:where(button, input, select) {
  font-family: inherit;
  font-size: inherit;
}
```

Add these as utility rules to see them work:

```css
/* Style any heading that is hovered or focused */
:is(h1, h2, h3):hover {
  color: #8899cc;
}

/* Give all form elements consistent base styles with zero specificity cost */
:where(input, select, textarea, button) {
  font-family: inherit;
}
```

---

## Part 12 — Apply to camtool.html

Open `camtool.html`. Apply everything you learned to give every component
complete, correct state styling.

**Task 1 — Complete the form input states. Save.**

Find `.form-input` in your CSS. Add all states:

```css
.form-input:focus {
  border-color: rgba(51,119,255,0.6);
  outline: none;
}

.form-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-input:read-only {
  color: #556677;
  cursor: default;
}
```

**Task 2 — Complete button states. Save.**

Find `.tbtn` and add:

```css
.tbtn:focus-visible {
  outline: 2px solid #3377ff;
  outline-offset: 2px;
}

.tbtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Task 3 — Add alternating row colors to the entity list. Save.**

If your properties panel or any future panel has a list, add:

```css
.panel-list-item:nth-child(even) {
  background: rgba(255,255,255,0.015);
}

.panel-list-item:last-child {
  border-bottom: none;
}
```

**Task 4 — Replace the section chevron with a pure CSS pseudo-element. Save.**

In your `camtool.html`, the `.section-header` has `::before` with the `›`
character. Replace it with the CSS arrow technique from Part 8:

```css
.section-header {
  /* existing styles... */
  position: relative;
  padding-left: 24px;
}

.section-header::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid #445566;
  border-bottom: 1.5px solid #445566;
  transform: translateY(-60%) rotate(-45deg);
  transition: transform 160ms ease;
}

details[open] > .section-header::before {
  transform: translateY(-30%) rotate(45deg);
}
```

Save and test. Click the section headers in the Properties panel. The arrow
rotates smoothly. No text character — a clean CSS border-based arrow.

---

## What you learned in this lab

- `:hover`, `:active`, `:focus-visible` — the three standard interactive states
  for every button and input
- `:disabled` — styles and behavior for inactive elements
- `:placeholder-shown` — targets inputs by whether they show their placeholder
- `:valid` and `:invalid` — style fields based on HTML5 validation automatically
- `:checked` — for checkboxes, radio buttons, and toggles
- `:first-child`, `:last-child`, `:nth-child()` — structural targeting
- `:nth-child(even/odd)` — alternating row styling for tables and lists
- `:not()` — exclude elements from a selector, express intent directly
- `::before` and `::after` — add visual elements without HTML, using `content`
- The arrow trick: rotated CSS border creates chevrons and checkmarks
- `details[open]` — target the open state of collapsible elements
- `:is()` — group selectors cleanly
- `:focus-visible` vs `:focus` — show focus rings for keyboard, not mouse

## What comes in Lab 7

Lab 7 brings everything together. You will build the complete, polished
`camtool.html` from scratch using everything from Labs 1–6. Every section is
properly styled with the box model, flex and grid layouts, positioning for
menus and overlays, transitions for all interactive states, and pseudo-classes
and pseudo-elements for all component states. When Lab 7 is done you have a
complete, professional application shell ready for JavaScript.
