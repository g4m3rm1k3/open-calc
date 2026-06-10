# Junior to Senior — T12·L7 — Spacing Systems

**Prerequisites:** T12·L6 (Colour). You understand the box model, typography in `rem`,
and colour in `hsl`. This lesson explains why arbitrary spacing makes interfaces feel
wrong, how a spacing scale works, and how CSS custom properties lock in a system so you
never fight spacing again.

**What this lab adds:**
- Why arbitrary spacing feels inconsistent (the visual rhythm problem)
- What a spacing scale is and how to build one from a base unit
- How to use CSS custom properties as a spacing token system
- When to use `margin` vs `padding` vs `gap` (a Flexbox/Grid property, previewed here)
- The `clamp()` function for fluid spacing that responds to viewport size

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your design has margins of 14px, 16px, 17px, 20px, 22px across different elements.
>    Why does this look wrong even though the values are close?
> 2. You want 24px of space between a heading and a paragraph. Is that `margin-bottom`
>    on the heading, `margin-top` on the paragraph, or `gap` on a flex parent? Does it matter?
> 3. `clamp(16px, 4vw, 48px)` — what does this produce at a 400px viewport?
>    At a 1200px viewport?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Open any page you have built. Count how many different spacing values you have used.
If the answer is more than seven, you have chaos. Every time you needed "a little more space"
you picked a new number. Now components do not relate to each other. The spacing does not
tell a visual story of what belongs together and what is separate.

A spacing system is not about visual polish — it is about making decisions once and executing
consistently, so the layout communicates hierarchy through space, not colour alone.

---

## Step 1 — See Inconsistent Spacing

Create `spacing.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spacing Systems</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 16px; }
  </style>
</head>
<body>
  <!-- Inconsistent spacing — the wrong approach -->
  <h1 style="margin-bottom: 14px;">Dashboard</h1>
  <p  style="margin-bottom: 22px;">Overview of your data.</p>

  <div style="background: #f5f5f5; padding: 17px; margin-bottom: 11px;">
    <h2 style="margin-bottom: 9px;">Card One</h2>
    <p style="margin: 0;">Some content here.</p>
  </div>

  <div style="background: #f5f5f5; padding: 20px; margin-bottom: 16px;">
    <h2 style="margin-bottom: 8px;">Card Two</h2>
    <p style="margin: 0;">Some content here.</p>
  </div>
</body>
</html>
```

### CSS AND SEE

The page renders. Look carefully — the two cards look almost the same but slightly different.
Card one uses `padding: 17px` and `margin-bottom: 9px`. Card two uses `padding: 20px` and
`margin-bottom: 8px`. There is no reason for the difference — they were typed arbitrarily.
The result is a subtle inconsistency that makes the page look unpolished.

---

## Concept: Spacing Scale — Multiples of a Base Unit

**What it is:** A limited set of spacing values, each a multiple of a single base unit.
You choose only from this set — you never type an arbitrary pixel value.

**Why it works:** When every spacing value in the design is from the same scale, the eye
perceives visual rhythm. Elements that belong together have small space between them.
Elements that are sections apart have large space. The ratios are consistent.

**A typical 8-point scale:**

| Name | Value | Rem | When to use |
|---|---|---|---|
| `--space-1` | 4px | 0.25rem | Internal tight spacing (icon-to-label gap) |
| `--space-2` | 8px | 0.5rem | Compact padding (dense UI) |
| `--space-3` | 12px | 0.75rem | Input padding, small gaps |
| `--space-4` | 16px | 1rem | Default padding, default gaps |
| `--space-5` | 24px | 1.5rem | Card padding, section internal spacing |
| `--space-6` | 32px | 2rem | Between major sections |
| `--space-7` | 48px | 3rem | Page section breaks |
| `--space-8` | 64px | 4rem | Hero sections, major vertical rhythm |

**Why base-8?** Most grids are multiples of 8 (screens are divisible by 8 in common
device sizes). Base-4 also works (halves of 8, for fine-grained control). The specific
base matters less than the consistency.

**The alternative that was not chosen:** Arbitrary values. When two developers work on the
same project with no scale, the page accumulates 30 different spacing values. The scale
is a decision you make once and a rule you follow always.

**What it hides:** The visual decision of "how much space?" You reduce this to "which step
on the scale?" The system makes the decision; you only choose which step.

**Canonical example:** Music uses measures (bars) of equal length. A rest is one beat,
two beats, or four beats — not 1.3 beats. The consistent grid creates rhythm.
Arbitrary spacing is like playing notes of random length.

**You will see this again in:**
- Tailwind CSS: `p-4` = 1rem (16px), `p-8` = 2rem (32px), `gap-6` = 1.5rem. The utility
  classes are a spacing scale with named stops.
- Material Design: 8dp grid system
- T12·L13 (Design Tokens): spacing tokens are the scale values stored as variables

---

## Step 2 — Implement the Scale with Custom Properties

Update `spacing.html`:

```html
<style>
  *, *::before, *::after { box-sizing: border-box; }

  :root {                             /* ← add this block */
    --space-1: 0.25rem;   /*  4px */
    --space-2: 0.5rem;    /*  8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.5rem;    /* 24px */
    --space-6: 2rem;      /* 32px */
    --space-7: 3rem;      /* 48px */
    --space-8: 4rem;      /* 64px */
  }

  body {
    font-family: sans-serif;
    max-width: 700px;
    margin: var(--space-7) auto;   /* ← use scale values */
    padding: 0 var(--space-4);
  }
</style>
```

And rewrite the HTML:

```html
<body>
  <h1 style="margin-bottom: var(--space-3);">Dashboard</h1>
  <p  style="margin-bottom: var(--space-5);">Overview of your data.</p>

  <div style="background: #f5f5f5; padding: var(--space-5); margin-bottom: var(--space-4);">
    <h2 style="margin-bottom: var(--space-2);">Card One</h2>
    <p style="margin: 0;">Some content here.</p>
  </div>

  <div style="background: #f5f5f5; padding: var(--space-5); margin-bottom: var(--space-4);">
    <h2 style="margin-bottom: var(--space-2);">Card Two</h2>
    <p style="margin: 0;">Some content here.</p>
  </div>
</body>
```

### CSS AND SEE

**You should see:** Both cards now have identical padding (`--space-5`) and identical margin
(`--space-4`). The visual consistency is immediate — they look like they belong together.

**Change something:** Change `--space-5` from `1.5rem` to `2rem` in `:root`.

**Expected:** Both cards get larger padding simultaneously — you changed one value and both
updated. This is the power of using variables as a system.

---

## Concept: Margin vs Padding vs Gap

**What it is:** Three ways to create space. Each has a specific purpose.

**`margin`** — space OUTSIDE the element:
- Creates distance from neighboring elements
- Participates in margin collapse (T12·L2)
- Cannot be used inside flex or grid containers for gaps (use `gap` instead)
- Use for: pushing elements away from their neighbors

**`padding`** — space INSIDE the element:
- Creates interior room inside the background boundary
- No margin collapse
- Use for: making an element feel larger, creating breathing room inside a card

**`gap`** — space BETWEEN flex or grid children:
- Applies only inside `display: flex` or `display: grid` (full lessons T12·L8 and T12·L9)
- Does NOT add space before the first child or after the last child (unlike margin)
- Does NOT collapse
- Use for: consistent spacing between items in a row or grid

**Why `gap` is better than `margin` for row/column spacing:**

With `margin-right: 16px` on flex children:
- The last child also gets `margin-right: 16px` — a gap after the last item
- You need `&:last-child { margin-right: 0 }` to remove it
- With `gap: 16px`: no space before first child, no space after last child, only BETWEEN

**When margin is the right tool:**
- Pushing a single element away from others (a submit button with `margin-top: auto` to
  push it to the bottom of a flex column)
- Space between sections on a page
- Any context where `gap` is not available (non-flex, non-grid layouts)

**You will see this again in:**
- T12·L8 (Flexbox): `gap` replaces margin for all inter-child spacing
- T12·L9 (Grid): `gap` (also written `column-gap`/`row-gap`) is the primary spacing tool
- The "lobotomized owl" pattern: `* + * { margin-top: 1rem; }` — adds top margin to any
  element that follows another, adding vertical rhythm without touching the first child

---

## Step 3 — See the Difference

Add a third section to `spacing.html`:

```html
<h2 style="margin-top: var(--space-7); margin-bottom: var(--space-3);">   <!-- ← add -->
  Margin vs Gap comparison:
</h2>

<!-- With margin — note the gap after the last button -->
<div style="display: flex; background: #e8f4f8; padding: var(--space-3);">
  <button style="margin-right: 12px; padding: 8px 16px;">Button A</button>
  <button style="margin-right: 12px; padding: 8px 16px;">Button B</button>
  <button style="margin-right: 12px; padding: 8px 16px;">Button C</button>
</div>

<p style="font-size: 0.85rem; color: #666; margin: var(--space-2) 0 var(--space-3);">
  ^ Notice the extra space after "Button C" (it has margin-right but no neighbor)
</p>

<!-- With gap — no trailing space -->
<div style="display: flex; gap: 12px; background: #e8f4f8; padding: var(--space-3);">
  <button style="padding: 8px 16px;">Button A</button>
  <button style="padding: 8px 16px;">Button B</button>
  <button style="padding: 8px 16px;">Button C</button>
</div>

<p style="font-size: 0.85rem; color: #666; margin: var(--space-2) 0;">
  ^ gap: only adds space BETWEEN items, not after the last one
</p>
```

### CSS AND SEE

**You should see:** The first row has a visible gap after "Button C" that visually unbalances
the row. The second row using `gap` is symmetrically padded — equal space on all sides.

---

## Concept: `clamp()` — Fluid Spacing

**What it is:** A CSS function that sets a value with a minimum, a preferred, and a maximum.
The preferred value is usually viewport-relative.

**Syntax:** `clamp(minimum, preferred, maximum)`

```css
padding: clamp(1rem, 4vw, 3rem);
```

- `1rem` — the floor: never less than this
- `4vw` — preferred: 4% of the viewport width
- `3rem` — ceiling: never more than this

**At different viewports:**
- 400px wide: `4vw = 16px` → returns `16px` (between floor and ceiling) → `1rem`
- 600px wide: `4vw = 24px` → returns `24px` → `1.5rem`
- 1200px wide: `4vw = 48px` → returns `48px` = `3rem` (hits ceiling)

**Why this is useful for spacing:**

On a small phone, you want compact padding (1rem). On a wide desktop, you want generous
padding (3rem). In between, it scales smoothly. Without `clamp`, you write two or three
media queries manually. With `clamp`, the scale is automatic.

**Use cases:**
- Padding on sections: tight on mobile, generous on desktop
- Font sizes on headings (used in T12·L5 Challenge extension)
- Margins between page sections

**The alternative:** Media queries with discrete breakpoints:
```css
padding: 1rem;
@media (min-width: 768px) { padding: 2rem; }
@media (min-width: 1200px) { padding: 3rem; }
```
`clamp` replaces three rules with one. Media queries are appropriate for layout changes;
`clamp` is better for smooth scaling of a single property.

**You will see this again in:**
- T12·L14 (Responsive Design): `clamp()` for fluid typography and spacing is the
  modern alternative to having separate mobile and desktop stylesheets.
- `min()` and `max()` — related functions: `max(1rem, 4vw)` means "at least 1rem, larger if viewport allows"

---

## Step 4 — Fluid Section Padding

Add a section with `clamp()` padding:

```html
<section style="                                        <!-- ← add -->
  background: hsl(195, 60%, 92%);
  padding: clamp(1rem, 4vw, 3rem);
  margin-top: var(--space-7);
  border-radius: 8px;
">
  <h2 style="margin: 0 0 var(--space-3);">Fluid Section</h2>
  <p style="margin: 0;">
    This section's padding uses clamp(1rem, 4vw, 3rem). Resize the browser window.
  </p>
</section>
```

### CSS AND SEE

Open DevTools → drag the browser window narrower and wider.

**You should see:** The padding of the section scales smoothly. At narrow widths it is
tight; at wide widths it is generous — with no media queries.

---

## 🎯 Challenge: Spacing Audit and Fix

**Given this broken layout (create a new file, paste this in):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spacing Audit</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; max-width: 700px; margin: 50px auto; }
    .card { background: #f5f5f5; padding: 17px; margin-bottom: 14px; border-radius: 6px; }
    h2 { margin-bottom: 7px; }
    .tag { display: inline-block; background: #ddd; padding: 3px 7px; margin-right: 5px; font-size: 13px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1 style="margin-bottom: 22px;">Projects</h1>
  <div class="card">
    <h2>Alpha Project</h2>
    <p style="margin-bottom: 9px;">Description text goes here.</p>
    <span class="tag">React</span><span class="tag">TypeScript</span>
  </div>
  <div class="card">
    <h2>Beta Project</h2>
    <p style="margin-bottom: 11px;">Another description.</p>
    <span class="tag">Python</span><span class="tag">FastAPI</span>
  </div>
</body>
</html>
```

**Task:**
1. Create a spacing scale (minimum 6 steps, base 4 or 8px)
2. Replace ALL spacing values (margin, padding, font-size) with scale values
3. The two cards must be visually identical — no arbitrary differences
4. Tags should use `gap` instead of `margin-right`

---

<details>
<summary>▶ Show Solution</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spacing Audit — Fixed</title>
  <style>
    :root {
      --space-1: 0.25rem;   /* 4px */
      --space-2: 0.5rem;    /* 8px */
      --space-3: 0.75rem;   /* 12px */
      --space-4: 1rem;      /* 16px */
      --space-5: 1.5rem;    /* 24px */
      --space-6: 2rem;      /* 32px */
      --space-7: 3rem;      /* 48px */
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: sans-serif;
      max-width: 700px;
      margin: var(--space-7) auto;
    }

    h1 { margin-bottom: var(--space-5); }

    .card {
      background: #f5f5f5;
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      border-radius: 6px;
    }

    h2 { margin-bottom: var(--space-2); }

    p { margin-bottom: var(--space-3); }

    .tags {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .tag {
      background: #ddd;
      padding: var(--space-1) var(--space-2);
      font-size: 0.8125rem;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>Projects</h1>
  <div class="card">
    <h2>Alpha Project</h2>
    <p>Description text goes here.</p>
    <div class="tags">
      <span class="tag">React</span>
      <span class="tag">TypeScript</span>
    </div>
  </div>
  <div class="card">
    <h2>Beta Project</h2>
    <p>Another description.</p>
    <div class="tags">
      <span class="tag">Python</span>
      <span class="tag">FastAPI</span>
    </div>
  </div>
</body>
</html>
```

**Key insight:** Tags wrapped in a `<div class="tags">` with `display: flex; gap` is cleaner
than margin on individual spans — no trailing gap, no need for `:last-child` exceptions,
and the flex container handles wrapping automatically with `flex-wrap: wrap`.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Spacing scale defined | `:root` has 6–8 `--space-N` variables, all multiples of base |
| Scale used consistently | No arbitrary pixel values in spacing properties |
| Variable system | Change one `:root` variable — all uses update |
| Gap vs margin | Button row with `gap` has no trailing space; margin version does |
| `clamp()` scales | Resize window — section padding grows and shrinks smoothly |

---

## Quick Check Answers

**1. Margins of 14px, 16px, 17px, 20px, 22px — why does it look wrong?**

The eye expects rhythmic repetition. When spacing values are close but not equal, the
visual system perceives inconsistency without being able to name it — "something feels
off". On a scale, each value represents a deliberate step. Off-scale values break the
rhythm the way an off-beat note breaks a melody. The brain is sensitive to these ratios
even when viewers cannot consciously identify the pixel differences.

**2. 24px between heading and paragraph — which property?**

Any of the three can work, but `margin-bottom` on the heading is most common for
structural separation — headings naturally push the content below away. The end result
is functionally identical: all three create 24px of space. The difference matters when
the parent is a flex container (where `gap` is cleaner) or when you later add elements
in between (margin on individual elements is more fragile).

**3. `clamp(16px, 4vw, 48px)` — at 400px and 1200px viewport:**

At 400px: `4vw = 16px`. `clamp(16px, 16px, 48px) = 16px` (at the minimum floor).
At 1200px: `4vw = 48px`. `clamp(16px, 48px, 48px) = 48px` (at the maximum ceiling).
At 800px: `4vw = 32px`. `clamp(16px, 32px, 48px) = 32px` (the preferred value, between floor and ceiling).
