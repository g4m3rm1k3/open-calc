# LAB 9 — CSS Functions: calc(), min(), max(), clamp()

**Prerequisites:** Labs 1–8. You have: the full Mastercam grid layout, flexbox ribbon, design token system, dark/light toggle, styled panels and status bar.

**What this lab adds:**
- The left and right panels get fluid min/max constraints — they never get too narrow or too wide
- Typography uses `clamp()` for sizes that adapt without media queries
- The viewport fills available space more robustly with `calc()`
- A consistent spacing scale replaces magic numbers throughout

**Time:** 45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between `calc(100% - 260px)` and `1fr` in a grid? When would you use `calc()` instead of `fr`?
> 2. `clamp(200px, 25%, 400px)` — what does each argument do? What happens at a 1000px container? At a 600px container?
> 3. Why is `min(100%, 260px)` safer than just `260px` for a panel width?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete:
- Dragging the panel resize handle never makes the panel collapse below 160px or exceed 480px — enforced by `clamp()` in the token itself
- The ribbon label font size adapts fluidly between small and large viewports without a media query
- All spacing in the interface uses tokens from a consistent scale — no more magic numbers like `4px`, `6px`, `8px` scattered through the stylesheet
- The viewport has a minimum usable width — it never collapses to zero even if both panels are maximised

---

## Step 0 — The Problems You Would Hit Without This Lab

### Problem A — The collapsing panel

If you completed the Lab 8 resize challenge, try this: drag the left panel handle all the way to the left. The panel collapses to nothing. The tree items disappear. The layout breaks.

Without `clamp()`, the `--panel-w` token accepts any value — including `0px` or negative numbers. The grid has no floor.

### Problem B — The magic number problem

Search your `style.css` for padding values. You'll find `padding: 4px 6px`, `padding: 3px 8px`, `padding: 5px 4px`, `padding: 6px 8px`. These numbers were chosen in the moment. They're inconsistent. Change one and the interface looks uneven. There's no system.

### Problem C — Fixed font sizes at edge cases

The ribbon group labels are `8px`. The badge text is `8px`. The section count is `8px`. On a high-density 4K monitor, `8px` is readable. On a small laptop, it's barely visible. There's no floor — the text can render too small to read.

CSS functions solve all three problems.

---

## Part 1 — Concepts

---

### Concept: `calc()` — Mixed-Unit Arithmetic

**What it is:** A CSS function that performs arithmetic at render time, allowing you to mix units that CSS cannot otherwise combine.

**The problem before:**
```css
/* You want: "full width minus the left panel width" */
/* These units can't be combined with + or - directly */
.viewport { width: 100% - 260px; }   /* INVALID — syntax error */
```

**The solution:**
```css
.viewport { width: calc(100% - 260px); }
/* The browser calculates this at render time: */
/* If container is 1200px: calc(1200px - 260px) = 940px */
/* If container is 800px:  calc(800px  - 260px) = 540px */
```

**The mechanism:**
`calc()` supports `+`, `-`, `*`, `/`. The operands can be any CSS length, percentage, angle, time, or number — but the result must be a valid value for the property it's used on.

**Rules:**
```css
/* + and - require spaces around the operator */
calc(100% - 20px)    /* ✓ */
calc(100%-20px)      /* ✗ — parsed as "100%" minus "-20px" — wrong */

/* * and / do not require spaces (but it's clearer with them) */
calc(100% / 3)       /* ✓ — one third of available space */
calc(2 * var(--spacing-4))  /* ✓ — double a spacing token */
```

**With custom properties:**
```css
:root { --panel-w: 260px; }
.viewport { width: calc(100% - var(--panel-w) - var(--props-w)); }
/* Updates automatically when the tokens change */
```

**Canonical example — a container with a sidebar:**
```css
.sidebar  { width: 200px; float: left; }
.content  { width: calc(100% - 200px); margin-left: 200px; }
/* Content is always exactly the right width regardless of viewport size */
```

**Project Application:**
- Status bar coordinate column: `width: calc(3 * var(--spacing-8))` — three coordinate readouts
- Viewport minimum width: `min-width: calc(100% - var(--panel-w) - var(--props-w) - 200px)` — never collapses fully
- Spacing calculations: `padding: calc(var(--spacing-1) * 2) var(--spacing-2)`

**Smallest possible example — try in DevTools:**
```css
/* In a 500px container */
.box {
  width: calc(100% - 40px);   /* always 460px regardless of container size */
  background: lightblue;
}
```

**Constraints:** `calc()` cannot concatenate strings — only numeric operations. Division requires a unitless denominator: `calc(100px / 2)` works; `calc(100px / 2px)` is invalid. You cannot use `calc()` in media query conditions directly (use custom properties instead).

**Failure modes:**

| Mistake | Symptom | Fix |
|---|---|---|
| Missing spaces around `+` or `-` | Calculation silently fails — property ignored | Always space: `calc(100% - 20px)` |
| Dividing by zero | Invalid value — property ignored | Guard with `max()` or `clamp()` |
| Mixing incompatible types | `calc(1em * 1rem)` — invalid | Only multiply/divide with one unitless value |

**You will see this again in:** Every CSS layout that mixes fixed and fluid values. Tailwind's `calc()` utilities. CSS Grid's `repeat()` with `calc()`. Custom component sizing.

**Watch for:** Using `calc()` when `fr` or `clamp()` is the better tool. `calc()` is for arithmetic. `fr` is for proportional space distribution. `clamp()` is for constrained ranges. Use the right tool.

---

### Concept: `min()`, `max()`, `clamp()` — Responsive Constraints Without Media Queries

**What they are:** CSS comparison functions that return a value based on which of their arguments wins a comparison. They allow you to set responsive constraints — floors, ceilings, and ranges — directly in the value, without media queries.

**`min(a, b)` — returns the smaller value:**
```css
width: min(500px, 100%);
/* On a 400px container: min(500px, 400%) = 400px — 100% wins (smaller) */
/* On a 800px container: min(500px, 800%) = 500px — 500px wins (smaller) */
/* Translation: "at most 500px, but never wider than the container" */
```

**`max(a, b)` — returns the larger value:**
```css
width: max(200px, 50%);
/* On a 300px container: max(200px, 150%) = 200px — 200px wins (larger) */
/* On a 600px container: max(200px, 300%) = 300px — 50% wins (larger) */
/* Translation: "at least 200px, but grows with the container beyond that" */
```

**`clamp(minimum, ideal, maximum)` — constrains a value within a range:**
```css
width: clamp(200px, 25%, 400px);
/* If 25% of container < 200px: use 200px (floor) */
/* If 25% of container > 400px: use 400px (ceiling) */
/* Otherwise: use 25% (ideal) */
/* Translation: "25% of container, but never less than 200px or more than 400px" */
```

**`clamp()` is `max(minimum, min(ideal, maximum))`:**
```css
clamp(200px, 25%, 400px)
/* is identical to */
max(200px, min(25%, 400px))
```
They're equivalent. `clamp()` is cleaner to read.

**Fluid typography with `clamp()`:**
```css
font-size: clamp(10px, 1.2vw, 14px);
/* Minimum: 10px — never smaller than this */
/* Ideal: 1.2vw — scales with viewport width */
/* Maximum: 14px — never larger than this */
/* On an 800px viewport:  1.2vw = 9.6px  → clamp returns 10px (floor) */
/* On a 1000px viewport:  1.2vw = 12px   → clamp returns 12px (ideal) */
/* On a 1400px viewport:  1.2vw = 16.8px → clamp returns 14px (ceiling) */
```

The font size adapts to the viewport without a single media query. At small sizes it hits the floor (readable minimum). At large sizes it hits the ceiling (doesn't grow too large). In between, it scales fluidly.

**The panel width constraint:**
```css
:root { --panel-w: 260px; }

/* In the resize handler: */
document.documentElement.style.setProperty(
  '--panel-w',
  clamp(160, e.clientX, 480) + 'px'  /* JavaScript clamp */
);

/* Or in CSS — constrain any computed value: */
.left-panel { width: clamp(160px, var(--panel-w), 480px); }
```

**`vw` and `vh` units — viewport relative:**
```css
1vw = 1% of viewport width
1vh = 1% of viewport height
100vw = full viewport width
100vh = full viewport height
```
Used in `clamp()` for fluid typography and sizing that scales with the screen.

**Canonical example — a card that adapts:**
```css
.card {
  width: clamp(280px, 45%, 600px);
  /* Never narrower than 280px (readable) */
  /* Never wider than 600px (not too wide for reading) */
  /* 45% of container in between */
}
```

**Project Application:**
- `--panel-w` constrained: `clamp(160px, var(--panel-w), 480px)`
- Ribbon labels: `font-size: clamp(8px, 0.9vw, 10px)`
- Spacing tokens: base scale used with `calc()` for derived values

**Smallest possible example:**
```html
<div style="width: clamp(200px, 50%, 400px); background: lightblue; padding: 8px">
  Resize the browser — I stay between 200px and 400px
</div>
```
Open in browser. Resize the window — the div grows and shrinks between 200px and 400px, always staying within its constraints.

**Constraints:** All three values in `clamp()` must be compatible types (all lengths, or all numbers). The minimum must be less than the maximum — `clamp(400px, 50%, 200px)` always returns 400px (the minimum always wins when it's larger than the maximum).

**Failure modes:**

| Mistake | Symptom | Fix |
|---|---|---|
| `clamp()` minimum > maximum | Always returns minimum — fluid range never activates | Ensure min < max |
| Using `clamp()` for font-size with very small minimum | Text unreadable at minimum | Never go below 10px for any readable text |
| `vw` units for font-size without a minimum | Text becomes unreadably small on narrow screens | Always use `clamp()` with a floor when using `vw` for font-size |

**You will see this again in:** Every responsive design system. Tailwind's `fluid` utilities generate `clamp()` values. CSS frameworks (Open Props, Utopia) provide pre-calculated `clamp()` type scales. Job interview topic: "how do you implement fluid typography without media queries?"

**Watch for:** Using `clamp()` where a simple `min()` or `max()` is enough. If you only need a floor or a ceiling — not both — use the simpler function.

---

### Concept: Spacing Systems and Design Tokens for Spacing

**What it is:** A defined scale of spacing values — a limited set of sizes that all padding, margin, and gap values must come from. Instead of choosing `6px` vs `7px` vs `8px` by feel, you choose from a pre-defined scale.

**The problem before:**
```css
/* Magic numbers scattered throughout — inconsistent by feel */
.tree-item      { padding: 5px 8px; }
.prop-row       { padding: 3px 8px; }
.ribbon-group   { padding: 4px 6px 2px; }
.status-bar     { padding: 0 8px; }
.ribbon-tabs    { padding: 0 4px; }
/* Is the difference between 4px and 5px intentional? Nobody knows. */
```

**The solution — a defined scale:**
```css
:root {
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 6px;
  --space-4: 8px;
  --space-5: 12px;
  --space-6: 16px;
  --space-7: 24px;
  --space-8: 32px;
}

/* Now every spacing decision is intentional */
.tree-item    { padding: var(--space-2) var(--space-4); }  /* 4px 8px */
.prop-row     { padding: var(--space-1) var(--space-4); }  /* 2px 8px */
.ribbon-group { padding: var(--space-2) var(--space-3);  } /* 4px 6px */
```

**Why a scale (not arbitrary values)?**
The scale creates visual rhythm. When all spacing comes from the same set of values, the interface looks intentional and consistent. Arbitrary values look random — even if each individual value seems reasonable, the combination looks uneven.

**Common scales:**
- **4px base (4, 8, 12, 16, 24, 32, 48)** — the most common; multiples of 4 align with most grid systems
- **8px base (8, 16, 24, 32, 48, 64)** — used in Material Design
- **Fibonacci-ish (2, 4, 6, 10, 16, 26)** — for very dense UIs

For a Mastercam-style dense application: a 4px base scale works well.

**Project Application:** Replace every hardcoded padding and gap value in `style.css` with spacing tokens. The interface won't look different — but changing `--space-4` from `8px` to `10px` will consistently update every element that uses it.

**Watch for:** Creating too many tokens — a token for every possible value defeats the purpose. The discipline is choosing from the scale, not adding to it every time you need a new value. If your design needs a value not in the scale, ask whether the nearest scale value would work.

---

## Part 2 — Build It

### Step 1 — Add spacing and size tokens to `:root`

In `style.css`, add to the `:root` block (after the existing tokens):

```css
/* ── SPACING SCALE ──────────────────────────────────────── */
--space-1:  2px;    /* micro — badge padding, tight separators */
--space-2:  4px;    /* small — compact button padding, icon gaps */
--space-3:  6px;    /* medium-small — ribbon group padding */
--space-4:  8px;    /* base — standard padding unit */
--space-5: 12px;    /* medium — section spacing */
--space-6: 16px;    /* large — panel padding, modal padding */
--space-7: 24px;    /* x-large — between major sections */
--space-8: 32px;    /* xx-large — page-level margins */
```

### SAVE AND TRY

Save. Refresh Chrome. No visible change — you've added tokens but not used them yet. This is correct.

---

### Step 2 — Add `clamp()` constraints to the panel width token

The `--panel-w` token currently accepts any value — including zero. Add a constraint.

In `style.css`, find the `.left-panel` rule and update it:

```css
.left-panel {
  /* clamp() enforces floor and ceiling on whatever --panel-w is set to */
  width: clamp(160px, var(--panel-w), 480px);
  /* ↑ minimum    ↑ current value    ↑ maximum */

  background: var(--bg-panel);
  border-right: 1px solid var(--bd);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
}
```

**Wait — why `width` here when the grid column controls the width?**

Good question. The grid column `var(--panel-w)` controls how much space the grid allocates to the left panel column. The `width: clamp()` on `.left-panel` itself doesn't override the grid — in a grid layout, `width` on a grid child is overridden by the grid track. Instead, update the grid column definition:

```css
/* Update .app-body to use clamp() in the column definition */
.app-body {
  display: grid;
  grid-template-columns: clamp(160px, var(--panel-w), 480px) 1fr var(--props-w);
  /* ↑ left panel constrained         ↑ viewport fluid  ↑ right panel fixed */
  grid-template-rows: 1fr;
  grid-template-areas: "left-panel viewport right-panel";
  overflow: hidden;
  min-height: 0;
}
```

Remove the `width: clamp()` from `.left-panel` — the grid column definition handles it now.

### SAVE AND TRY

Save. Refresh Chrome. If you have the resize handle from Lab 8:

**Test the constraint:** Drag the panel handle all the way left. The panel stops at 160px — it won't collapse. Drag all the way right — the panel stops at 480px. The `clamp()` enforces both limits through the grid column.

**Change something:** Change `160px` to `300px` in the `clamp()`. Save. The panel can no longer be resized smaller than 300px. Change it back to `160px`.

---

### Step 3 — Add viewport minimum width

The viewport (1fr column) could technically collapse to zero if both panels are at their maximum widths. Add a minimum:

```css
.viewport {
  background: var(--bg-viewport);
  position: relative;
  overflow: hidden;
  min-width: 200px;     /* viewport never collapses below 200px — always usable */
}
```

**Why `min-width` on the child rather than `minmax()` in the grid?**

Both work. `min-width` on the child is simpler to read. The grid equivalent would be:

```css
grid-template-columns: clamp(160px, var(--panel-w), 480px) minmax(200px, 1fr) var(--props-w);
```

`minmax(200px, 1fr)` means "at least 200px, at most 1fr." Either approach is valid — use whichever reads more clearly to you.

### SAVE AND TRY

Save. Refresh Chrome. Drag both panels to their maximum widths — the viewport stays at a minimum of 200px, never collapses.

---

### Step 4 — Fluid typography with `clamp()`

The ribbon group labels and badge text are fixed at `8px`. On very small viewports they're unreadable; on large displays they could be slightly larger. Add fluid sizing:

```css
/* Fluid ribbon label — scales between 8px and 10px with viewport */
.ribbon-group-label {
  font-size: clamp(8px, 0.85vw, 10px);
  /* At 940px viewport:  0.85vw = 8.0px  → 8px (floor) */
  /* At 1200px viewport: 0.85vw = 10.2px → 10px (ceiling) */
  /* In between: scales fluidly */
  color: var(--txt-dimmer);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding-top: var(--space-1);
  border-top: 1px solid var(--bd);
  margin-top: auto;
}

/* Fluid badge text */
.badge-ok, .badge-warn, .badge-err, .badge-info {
  font-size: clamp(7px, 0.75vw, 9px);
  padding: var(--space-1) var(--space-2);    /* ← spacing tokens */
  border-radius: 8px;
  margin-left: auto;
  flex-shrink: 0;
}
```

### CSS AND SEE

Save. Refresh Chrome. Resize the browser window slowly from narrow to wide — watch the ribbon label text size change subtly. At the narrowest it stops at 8px; at the widest it stops at 10px.

**In DevTools:** Click a `.ribbon-group-label` → Computed tab → `font-size`. As you resize the browser, the computed value updates in real time between 8px and 10px.

---

### Step 5 — Replace magic numbers with spacing tokens

Go through `style.css` and replace hardcoded padding and gap values with spacing tokens. This is a find-and-replace exercise — you're not changing the visual output, you're making the values intentional.

Key replacements:

```css
/* Tree items */
.tree-item {
  padding: var(--space-2) var(--space-4);     /* was: 5px 8px → now: 4px 8px */
  /* Note: 5px isn't in the scale. The nearest is 4px. */
  /* If 5px was intentional, add --space-2-5: 5px to the scale. */
  /* Usually 4px is fine — the difference is imperceptible. */
}

/* Ribbon group */
.ribbon-group {
  padding: var(--space-2) var(--space-3) var(--space-1);   /* 4px 6px 2px */
}

/* Ribbon buttons */
.ribbon-btn {
  padding: var(--space-1) var(--space-3);    /* 2px 6px */
  gap: var(--space-1);
}

/* Status bar */
.status-bar span {
  padding: 0 var(--space-4);    /* 0 8px */
  gap: var(--space-2);          /* 4px between label and value */
}

/* Panel tabs */
.panel-tabs span {
  padding: var(--space-2) var(--space-2);    /* 4px 4px */
}

/* Tree section header */
.tree-section-header {
  padding: var(--space-2) var(--space-4);    /* 4px 8px */
}

/* Prop rows */
.prop-row {
  padding: var(--space-1) var(--space-4);    /* 2px 8px */
  gap: var(--space-3);                       /* 6px */
  min-height: 22px;
}

/* Props header */
.props-header {
  padding: var(--space-3) var(--space-4);    /* 6px 8px */
}
```

### SAVE AND TRY

Save. Refresh Chrome.

**You should see:** No visual change — or very minor changes where a `5px` became `4px`. The interface looks the same. That's the point — you've made the values systematic without changing the appearance.

**Test the system:** Temporarily change `--space-4` from `8px` to `12px`. Save. Every element that uses `--space-4` for padding gets wider simultaneously — the ribbon group, the status bar, the tree items, the prop rows. Change it back. This is a design system working correctly.

---

### Step 6 — Add `calc()` for derived spacing

Some spacing values are logically related to others. Express those relationships explicitly:

```css
/* Ribbon body height is always ribbon height minus tab height */
/* Instead of the magic number 62px: */
:root {
  /* Add this derived token */
  --ribbon-body-h: calc(var(--ribbon-h) - var(--ribbon-tabs-h));
  /* = calc(88px - 26px) = 62px — but now it's self-documenting */
  /* Change --ribbon-h and --ribbon-body-h updates automatically */
}
```

Find `.ribbon-body` in `style.css` and ensure it uses this token:

```css
.ribbon-body {
  height: var(--ribbon-body-h);    /* was: 62px — now derived from other tokens */
  /* ... rest of ribbon-body styles ... */
}
```

### SAVE AND TRY

Save. Refresh Chrome. No visual change — but now the magic number `62px` is gone. It's expressed as a relationship between two other tokens.

**Test it:** Change `--ribbon-h` from `88px` to `100px`. Save. The ribbon gets taller, AND the ribbon body height automatically updates to `74px` (100 - 26). Change it back. The system maintains its own consistency.

---

## Challenge: Fluid panel width

Currently `--panel-w` is set to a fixed `260px` in `:root`. The panel can be resized by drag, but its initial size is always 260px regardless of the viewport.

**Task:** Change `--panel-w` to use `clamp()` so the panel starts at 20% of the viewport width, but never less than 200px and never more than 320px. The resize handle should still work on top of this.

**Hints:**
1. `20vw` is 20% of the viewport width
2. The token definition goes in `:root`
3. The grid column already uses `clamp(160px, var(--panel-w), 480px)` — these clamp values interact. Think about which clamp wins.

<details>
<summary>▶ Show Solution</summary>

```css
:root {
  --panel-w: clamp(200px, 20vw, 320px);
  /* At 800px viewport:  20vw = 160px → clamp returns 200px (floor) */
  /* At 1200px viewport: 20vw = 240px → clamp returns 240px (ideal) */
  /* At 1800px viewport: 20vw = 360px → clamp returns 320px (ceiling) */
}
```

The grid column also has a `clamp(160px, var(--panel-w), 480px)`. These nest:
- At 1200px viewport: `--panel-w` resolves to 240px. Grid clamp: `clamp(160px, 240px, 480px)` = 240px. ✓
- After drag resize to 400px: `--panel-w` is 400px (set by JS). Grid clamp: `clamp(160px, 400px, 480px)` = 400px. ✓
- After drag resize to 50px: `--panel-w` is 50px (set by JS). Grid clamp: `clamp(160px, 50px, 480px)` = 160px. ✓ (outer clamp enforces the floor)

**Key insight:** `clamp()` values can be nested. The inner `clamp()` in the token handles the viewport-relative default. The outer `clamp()` in the grid column handles the resize bounds. Both are independent constraints — each enforces its own range.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Panel resize has floor | Drag panel handle left — stops at 160px, won't collapse |
| Panel resize has ceiling | Drag panel handle right — stops at 480px |
| Viewport has minimum width | Maximise both panels — viewport stays at least 200px |
| Ribbon label text scales | Resize browser slowly — label font size changes between 8–10px |
| Spacing tokens in use | Search `style.css` for hardcoded `5px`, `6px`, `8px` — most should be tokens |
| `--ribbon-body-h` is derived | Change `--ribbon-h` to `100px` — ribbon body adjusts automatically |
| No visual regression | Interface looks identical to Lab 8 (spacing changes are imperceptible) |

---

## Quick Check Answers

**1. `calc(100% - 260px)` vs `1fr` — when to use `calc()`?**
`1fr` divides available space proportionally among all `fr` tracks — it's relative to the grid container and other tracks. `calc(100% - 260px)` is a direct arithmetic expression relative to the parent's width. In a grid, `1fr` is almost always the right choice for fluid columns. Use `calc()` when you need to express a specific arithmetic relationship between units that can't be combined any other way — like setting a `height` that is `100vh` minus the header height (`calc(100vh - 88px)`), or padding that is half a token value (`calc(var(--space-4) / 2)`).

**2. `clamp(200px, 25%, 400px)` — what does each argument do?**
The first argument (`200px`) is the minimum — the value never goes below this. The second (`25%`) is the ideal — used when it falls within the range. The third (`400px`) is the maximum — never exceeded. At a 1000px container: `25% = 250px` which is between 200px and 400px → returns 250px. At a 600px container: `25% = 150px` which is below the 200px minimum → returns 200px (floor enforced).

**3. Why is `min(100%, 260px)` safer than just `260px`?**
`260px` is an absolute value — on a viewport narrower than 260px, the panel overflows its container. `min(100%, 260px)` says "260px, or 100% of the container — whichever is smaller." On a narrow viewport, it returns 100% (container width), preventing overflow. On a normal desktop, it returns 260px. It's a defensive constraint that prevents layout breakage on unexpectedly small screens.

---

# Where You Are Now

Your `style.css` now has:
- A complete spacing scale (`--space-1` through `--space-8`) replacing magic numbers
- `clamp()` constraints on the left panel column — floors and ceilings enforced
- Fluid typography on ribbon labels and badges — scales with viewport without media queries
- `calc()` for derived token values — `--ribbon-body-h` is computed from other tokens
- A viewport minimum width — the center column never collapses

The interface still looks identical to Lab 8 — which is exactly right. This lab made the values systematic and defensive, not visually different.

**What comes next — Lab 10 (Responsive Design):**
The interface currently has a fixed desktop layout. Lab 10 adds what happens at different viewport sizes — the panel becomes a slide-out drawer on narrow screens, the ribbon collapses, and media queries are written as enhancements rather than patches. This is where `@media` queries appear for the first time — because you've held off until you understand what they're actually for.