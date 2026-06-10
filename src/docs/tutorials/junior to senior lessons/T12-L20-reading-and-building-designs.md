# Junior to Senior — T12·L20 — Reading and Building Designs

**Prerequisites:** T12·L19 (Navigation Patterns). You have the full CSS toolkit —
layout, components, tokens, states, motion, and accessibility. This final lesson
teaches how to READ a design (Figma, screenshot, or specification) and TRANSLATE it
into code systematically — without guessing or fighting CSS.

**What this lab adds:**
- The inspection workflow: what to look for before writing a single line
- Reading spacing from designs: the grid, the units, the rhythm
- Identifying design tokens from a design: colours, typography, radii
- Decomposing a design into components and layout layers
- Building a complete interface from a visual specification
- Common design-to-CSS translation mistakes and how to avoid them

**Time:** 90–120 minutes (building the final project)

---

> **Quick Check — try to answer before reading:**
>
> 1. You get a Figma design. The heading says `font-size: 24`. The dev mode shows
>    it is `24px`. But your `rem`-based system would make this `1.5rem`. Which do you use?
> 2. You see equal spacing of 16px between every section on a design. The designer used
>    16px everywhere. You have `--space-4: 1rem (16px)`. Should you use the token?
> 3. A design shows a card with a shadow. DevTools shows `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`.
>    How do you make this into a token?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

A designer hands you a Figma file. You open it and see a beautiful interface. You open
your editor and stare at a blank CSS file. Where do you start?

Without a system, you eyeball spacing, copy pixel values, and fight with the browser
until it looks similar. The result is brittle — change the design and everything breaks.

With a system, you read the design as a set of decisions: tokens, layouts, components,
states. You build the token layer first, then the layout, then the components. The result
maps directly to the design and can be updated in minutes.

---

## The Inspection Workflow — Five Steps Before Writing Code

**Step 1 — Identify the colour palette:**

Open the design. List every unique colour used. Group them:
- Text colours (usually 2–3 values: primary, secondary, muted)
- Background colours (usually 2–3: page, card, hover)
- Brand colours (usually 1 primary + 2–3 shades)
- Semantic colours (success, danger, warning)
- Border colours (usually 1–2)

These become your primitive and semantic tokens.

**Step 2 — Identify the spacing rhythm:**

Look at the spaces between elements. In a well-designed system, the same few values
appear repeatedly: `4, 8, 12, 16, 24, 32, 48`. Write down which spacing value is used
for what role.

If the design uses completely arbitrary spacing, it was not built with a system — you will
need to normalise it when translating to CSS.

**Step 3 — Identify the typography scale:**

List every unique font size, weight, and line height. Map them to your `rem` scale.
Identify which are headings, body, secondary, captions.

**Step 4 — Identify the component hierarchy:**

Starting from the smallest pieces and working outward:
1. Atoms: buttons, inputs, badges, icons
2. Molecules: form fields (label + input + hint), stat cards
3. Organisms: navigation bar, sidebar, data table
4. Layout: the page structure (where is the sidebar, where is the header)

**Step 5 — Identify the states:**

For every interactive component: what does it look like when hovered, focused, disabled,
loading, in error? If the design does not show all states, you create them from the
design's language (usually darker for hover, muted for disabled).

---

## Step 1 — Read a Design Specification

For this lesson, you will build the following specification (described precisely enough
to implement without a Figma file):

```
╔══════════════════════════════════════════════════════════╗
║  DARK NAV: height 56px, bg #12192a                       ║
║  Logo (white, bold 16px) ← 20px gap → NAV LINKS → gap → ║
║  User avatar (32px circle, primary blue)                 ║
╠═══════════════╦══════════════════════════════════════════╣
║  SIDEBAR      ║  MAIN                                    ║
║  width: 220px ║  Breadcrumbs: 12px, gray separators      ║
║  bg: white    ║  ─────────────────────────────────────   ║
║  border-right ║  H1 "Active Jobs"  (24px bold)            ║
║               ║  Subtitle (14px gray #888)               ║
║  Nav items:   ║  ─────────────────────────────────────   ║
║  14px, #555   ║  STAT ROW: 4 cards, 16px gap             ║
║  8px padding  ║  Card: white, 1px border, 8px radius     ║
║  4px radius   ║  padding: 16px                           ║
║               ║  Label: 12px gray uppercase              ║
║  Active: blue ║  Value: 32px bold                        ║
║  bg tint,     ║  ─────────────────────────────────────   ║
║  blue text    ║  TABLE: full width, striped rows         ║
║               ║  Header: bold 13px, #888, uppercase       ║
╚═══════════════╩══════════════════════════════════════════╝
```

---

## Step 2 — Extract the Tokens

Before writing a single layout line, extract ALL tokens from the spec:

Create `dashboard.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <style>
    /* ─── PRIMITIVE TOKENS ───────────────────── */
    :root {
      --p-navy-950: hsl(220, 50%, 12%);
      --p-blue-500: hsl(219, 79%, 60%);
      --p-blue-100: hsl(219, 79%, 92%);
      --p-blue-800: hsl(219, 79%, 30%);

      --p-gray-50:  hsl(0, 0%, 97%);
      --p-gray-100: hsl(0, 0%, 94%);
      --p-gray-200: hsl(0, 0%, 88%);
      --p-gray-400: hsl(0, 0%, 65%);
      --p-gray-500: hsl(0, 0%, 50%);
      --p-gray-700: hsl(0, 0%, 33%);
      --p-gray-900: hsl(0, 0%, 10%);

      --p-green-500: hsl(140, 60%, 40%);
      --p-red-500:   hsl(0,   70%, 48%);

      --sp-1: 4px;
      --sp-2: 8px;
      --sp-3: 12px;
      --sp-4: 16px;
      --sp-5: 24px;
      --sp-6: 32px;
      --sp-7: 48px;
    }

    /* ─── SEMANTIC TOKENS ────────────────────── */
    :root {
      --color-nav-bg:    var(--p-navy-950);
      --color-bg:        var(--p-gray-50);
      --color-surface:   white;
      --color-border:    var(--p-gray-200);
      --color-text:      var(--p-gray-900);
      --color-secondary: var(--p-gray-500);
      --color-muted:     var(--p-gray-400);
      --color-primary:   var(--p-blue-500);
      --color-primary-bg: var(--p-blue-100);
      --color-active-text: var(--p-blue-800);

      --font-xs:   0.75rem;    /* 12px */
      --font-sm:   0.875rem;   /* 14px */
      --font-base: 0.9375rem;  /* 15px */
      --font-lg:   1rem;       /* 16px */
      --font-xl:   1.5rem;     /* 24px */
      --font-2xl:  2rem;       /* 32px */

      --weight-regular: 400;
      --weight-medium:  500;
      --weight-bold:    700;

      --radius-sm: 4px;
      --radius-md: 8px;

      --shadow-card: 0 1px 3px hsl(0 0% 0% / 0.06), 0 1px 2px hsl(0 0% 0% / 0.04);
    }

    /* ─── RESET ─────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; font-size: var(--font-base); background: var(--color-bg); color: var(--color-text); }
    a { text-decoration: none; }
    ul { list-style: none; }
  </style>
</head>
<body>

  <!-- Content goes here: Step 3 -->

</body>
</html>
```

### CSS AND SEE

Nothing visible yet. But every decision from the spec is now named. Before touching layout.

---

## Step 3 — Build the Layout Shell

Add the layout layers in order (outside-in):

```html
<body>

  <!-- 1. Navigation (fixed, topmost) -->
  <nav class="topnav">
    <a class="topnav__logo" href="#">CNC·SIM</a>
    <ul class="topnav__links">
      <li><a class="topnav__link" href="#">Dashboard</a></li>
      <li><a class="topnav__link topnav__link--active" href="#">Jobs</a></li>
      <li><a class="topnav__link" href="#">Tools</a></li>
      <li><a class="topnav__link" href="#">Settings</a></li>
    </ul>
    <div class="topnav__right">
      <div class="avatar">JD</div>
    </div>
  </nav>

  <!-- 2. App shell: sidebar + main -->
  <div class="app-shell">

    <aside class="sidebar">
      <!-- sidebar content: Step 4 -->
    </aside>

    <main class="main">
      <!-- main content: Step 5 -->
    </main>

  </div>

</body>
```

Add layout CSS:

```css
/* ─── LAYOUT ─────────────────────────────── */
.topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: var(--color-nav-bg);
  display: flex;
  align-items: center;
  padding: 0 var(--sp-5);
  gap: var(--sp-4);
  color: white;
}

.topnav__logo { font-size: var(--font-lg); font-weight: var(--weight-bold); color: white; }

.topnav__links {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; gap: var(--sp-3);
}

.topnav__link { color: hsl(0 0% 60%); font-size: var(--font-sm); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); transition: color 0.15s, background 0.15s; }
.topnav__link:hover { color: white; background: hsl(0 0% 100% / 0.08); }
.topnav__link--active { color: white; font-weight: var(--weight-medium); }

.topnav__right { margin-left: auto; }

.avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); color: white; font-size: var(--font-xs); font-weight: var(--weight-bold); display: flex; align-items: center; justify-content: center; cursor: pointer; }

.app-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: calc(100vh - 56px);
}

.sidebar {
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--sp-4) var(--sp-3);
}

.main {
  padding: var(--sp-5);
  max-width: 1100px;
}
```

### CSS AND SEE

The shell renders — dark nav, sidebar strip, and main content area. No content yet.

---

## Step 4 — Sidebar Content

```html
<!-- Replace the <!-- sidebar content --> comment: -->
<nav>
  <p class="nav-section">Workspace</p>
  <ul class="nav-list">
    <li><a class="nav-item" href="#">Overview</a></li>
    <li><a class="nav-item nav-item--active" href="#">Jobs</a></li>
    <li><a class="nav-item" href="#">Tools</a></li>
  </ul>
  <p class="nav-section" style="margin-top: var(--sp-5);">Account</p>
  <ul class="nav-list">
    <li><a class="nav-item" href="#">Settings</a></li>
    <li><a class="nav-item" href="#">Help</a></li>
  </ul>
</nav>
```

```css
.nav-section { font-size: var(--font-xs); font-weight: var(--weight-bold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-muted); padding: 0 var(--sp-2); margin-bottom: var(--sp-1); }
.nav-list { display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: block; padding: var(--sp-2) var(--sp-2); border-radius: var(--radius-sm); font-size: var(--font-sm); color: var(--color-secondary); transition: background 0.1s, color 0.1s; }
.nav-item:hover { background: var(--p-gray-100); color: var(--color-text); }
.nav-item--active { background: var(--color-primary-bg); color: var(--color-active-text); font-weight: var(--weight-medium); }
```

---

## Step 5 — Main Content

```html
<!-- Replace the <!-- main content --> comment: -->
<header style="margin-bottom: var(--sp-5);">
  <h1 style="font-size: var(--font-xl); font-weight: var(--weight-bold); margin-bottom: var(--sp-1);">Active Jobs</h1>
  <p style="font-size: var(--font-sm); color: var(--color-secondary);">3 jobs currently running on the cluster</p>
</header>

<!-- Stat cards row -->
<div class="stat-row">
  <div class="stat-card">
    <p class="stat-card__label">Running</p>
    <p class="stat-card__value">3</p>
  </div>
  <div class="stat-card">
    <p class="stat-card__label">Queued</p>
    <p class="stat-card__value">7</p>
  </div>
  <div class="stat-card">
    <p class="stat-card__label">Completed Today</p>
    <p class="stat-card__value" style="color: var(--p-green-500);">24</p>
  </div>
  <div class="stat-card">
    <p class="stat-card__label">Failed</p>
    <p class="stat-card__value" style="color: var(--p-red-500);">1</p>
  </div>
</div>

<!-- Jobs table -->
<table class="table">
  <thead>
    <tr>
      <th class="table__th">Job ID</th>
      <th class="table__th">File</th>
      <th class="table__th">Status</th>
      <th class="table__th">Progress</th>
      <th class="table__th">Started</th>
    </tr>
  </thead>
  <tbody>
    <tr class="table__row">
      <td class="table__td">#1742</td>
      <td class="table__td">part-A.dxf</td>
      <td class="table__td"><span class="badge badge--success">Running</span></td>
      <td class="table__td">
        <div class="progress"><div class="progress__bar" style="width: 67%"></div></div>
      </td>
      <td class="table__td" style="color: var(--color-secondary);">2 min ago</td>
    </tr>
    <tr class="table__row">
      <td class="table__td">#1741</td>
      <td class="table__td">bracket.dxf</td>
      <td class="table__td"><span class="badge badge--success">Running</span></td>
      <td class="table__td">
        <div class="progress"><div class="progress__bar" style="width: 34%"></div></div>
      </td>
      <td class="table__td" style="color: var(--color-secondary);">5 min ago</td>
    </tr>
    <tr class="table__row">
      <td class="table__td">#1740</td>
      <td class="table__td">housing.dxf</td>
      <td class="table__td"><span class="badge">Queued</span></td>
      <td class="table__td">
        <div class="progress"><div class="progress__bar" style="width: 0%"></div></div>
      </td>
      <td class="table__td" style="color: var(--color-secondary);">Waiting</td>
    </tr>
  </tbody>
</table>
```

Add CSS:

```css
/* ─── STAT CARDS ──────────────────────── */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); margin-bottom: var(--sp-5); }

.stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--sp-4); box-shadow: var(--shadow-card); }
.stat-card__label { font-size: var(--font-xs); font-weight: var(--weight-bold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-secondary); margin-bottom: var(--sp-1); }
.stat-card__value { font-size: var(--font-2xl); font-weight: var(--weight-bold); line-height: 1; }

/* ─── TABLE ───────────────────────────── */
.table { width: 100%; border-collapse: collapse; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }

.table__th { font-size: var(--font-xs); font-weight: var(--weight-bold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-secondary); padding: var(--sp-3) var(--sp-4); text-align: left; background: var(--p-gray-50); border-bottom: 1px solid var(--color-border); }
.table__td { padding: var(--sp-3) var(--sp-4); font-size: var(--font-sm); border-bottom: 1px solid var(--p-gray-100); vertical-align: middle; }
.table__row:last-child .table__td { border-bottom: none; }
.table__row:hover .table__td { background: var(--p-gray-50); }

/* ─── PROGRESS BAR ────────────────────── */
.progress { background: var(--p-gray-100); border-radius: 99px; height: 6px; overflow: hidden; width: 120px; }
.progress__bar { height: 100%; background: var(--color-primary); border-radius: 99px; transition: width 0.3s ease; }

/* ─── BADGES ──────────────────────────── */
.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 99px; font-size: var(--font-xs); font-weight: var(--weight-bold); background: var(--p-gray-100); color: var(--p-gray-700); }
.badge--success { background: hsl(140 55% 88%); color: hsl(140 55% 28%); }
```

### CSS AND SEE

**You should see:** A complete, professional dashboard — dark navbar, white sidebar,
stat cards in a 4-column row, and a data table with progress bars and status badges.

Everything is built from the token system. Every colour, size, and spacing value
traces back to a named token.

---

## Concept: Common Design-to-CSS Translation Mistakes

**Mistake 1: Converting `px` to `px` instead of `rem`**

The design shows `font-size: 14px`. You write `font-size: 14px`. The design is done.
But you lose the user's browser size preference and the global scaling ability.
Always convert: `14px ÷ 16px = 0.875rem`. Use a token: `--font-sm: 0.875rem`.

**Mistake 2: Hardcoding design's specific values instead of using tokens**

The design uses `16px` padding on every card. You write `padding: 16px` on `.card`.
Later, the designer changes all card padding to 20px. You find 34 instances of `16px`.
Use a token. Write `padding: var(--space-md)`. Change the token once.

**Mistake 3: Rebuilding spacing from visual inspection**

You look at the gap between a heading and a paragraph and estimate "that looks like 12px."
You write `margin-bottom: 12px`. It was actually `--sp-3: 12px`. The values match, but
you have abandoned the system. What if the system changes? Use the token.

**Mistake 4: Not building the states**

The design shows one state (default). You build only that. No hover, no focus, no error.
The interface looks complete but is inaccessible and feels unresponsive. Always ask:
"What are all the states this component can be in?"

**Mistake 5: Building components before the layout**

You build the stat card perfectly. Then you try to place it in a grid. The grid does
not exist yet. You write positioning overrides. Build layout first; components fill in.

---

## 🎯 Final Challenge: Complete the Dashboard

**Task:** Your dashboard is missing:
1. A responsive stat row that wraps to 2 columns at `< 768px`
2. A `prefers-color-scheme: dark` mode that switches the token values
3. A `prefers-reduced-motion` guard on the progress bar transition

Add all three without touching any component CSS — only token definitions and media queries.

---

<details>
<summary>▶ Show Solution</summary>

**1. Responsive stat row:**
```css
@media (max-width: 767px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}
```

**2. Dark mode via tokens:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-nav-bg:    hsl(220, 50%, 8%);
    --color-bg:        hsl(220, 20%, 10%);
    --color-surface:   hsl(220, 15%, 16%);
    --color-border:    hsl(220, 15%, 24%);
    --color-text:      hsl(0, 0%, 92%);
    --color-secondary: hsl(0, 0%, 58%);
    --color-muted:     hsl(0, 0%, 45%);
    --color-primary-bg: hsl(219, 79%, 20%);
    --color-active-text: hsl(219, 79%, 75%);
    --p-gray-50:  hsl(220, 15%, 14%);
    --p-gray-100: hsl(220, 12%, 20%);
  }
}
```

**3. Reduced motion guard:**
```css
@media (prefers-reduced-motion: reduce) {
  .progress__bar { transition: none; }
}
```

**Key insight:** All three changes required zero component CSS edits. They work because
every component consumes tokens, not raw values. This is the payoff of the token system —
a single dark mode block switches the entire application. A single media query makes the
layout responsive. A single override disables an animation. The investment in the token
layer at the start is paid back every time a global change is needed.

</details>

---

## Final Check

| What to verify | How |
|---|---|
| Tokens used throughout | Search CSS for any hex or `px` font-size — find none in components |
| Nav links truly centered | Widen/narrow sidebar — links stay centered on the full nav width |
| Active nav item | `.nav-item--active` has colored background from token |
| Stat cards 4-column | Desktop view: 4 equal columns from `repeat(4, 1fr)` |
| Table row hover | Hover a row — subtle background from `var(--p-gray-50)` |
| Progress bar | Values show correct widths; transition on load |
| Badge variants | Running = green, Queued = gray — semantic colour from token |

---

## Quick Check Answers

**1. Design says `24px`, your system uses `rem`. Which do you use?**

Convert to `rem` and use the token: `1.5rem`. The design was created in px because
Figma works in px. CSS should use `rem` to respect the user's font size preference and
to enable global scaling via `:root { font-size }`. The token (`--font-xl: 1.5rem`)
is the source of truth in CSS. The fact that it evaluates to 24px at the default font
size is the connection back to the design — not the raw `24px` value.

**2. Designer used 16px everywhere. Should you use the token?**

Yes. The designer's intent was "this is the base spacing unit." Your token `--space-4: 1rem`
(16px) encodes that same intent. Using the token means: if the spacing system ever shifts
(say, to 18px base), one change propagates everywhere. Using `16px` directly means that
same change requires finding every instance. The value matching the token is not coincidence —
it is evidence you are building to the same system the designer used.

**3. `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`. Make it a token. How?**

```css
:root {
  --shadow-md: 0 4px 12px hsl(0 0% 0% / 0.1);
}
```

Then in the component: `box-shadow: var(--shadow-md)`. Name it semantically (not `--shadow-blue-card`).
`--shadow-md` means "medium elevation shadow" — it can be reused anywhere that level of elevation
is needed. In dark mode, you would reassign: `--shadow-md: 0 4px 12px hsl(0 0% 0% / 0.3)` —
darker shadows look more realistic on dark backgrounds.
