# Junior to Senior — T12·L13 — Design Tokens

**Prerequisites:** T12·L12 (Component States). You have components with states.
This lesson teaches design tokens — the system that names and stores every colour,
spacing value, font size, and radius in one place so components consume from the system
instead of hardcoding values.

**What this lab adds:**
- What a design token is and why it is different from a CSS custom property
- Three levels of tokens: primitive, semantic, component
- CSS custom properties as the implementation of tokens in the browser
- How `prefers-color-scheme` enables dark mode from tokens alone
- Building a full token system and applying it to a card component

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `--color-blue-500: hsl(219, 79%, 60%)` vs `--color-primary: var(--color-blue-500)`.
>    What is the difference? Which one do components use and why?
> 2. You want to support dark mode. Where is the minimum place to change values — in every
>    component or in one central location?
> 3. `var(--space-4)` — the variable is not defined anywhere. What does the browser render?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You are building a design system. You have `cornflowerblue` in 23 places. The client wants to
change the primary colour to teal. You change it in 23 places. You miss one. Two weeks later
you find it.

Design tokens solve this by naming things semantically. You have one place that says
"primary colour is teal". Every component that uses the primary colour reads from there.
Change one value, everything updates.

---

## Step 1 — The Problem: Hardcoded Values Everywhere

Look at the components you have built so far. They use `cornflowerblue` directly:

```css
.btn { background: cornflowerblue; }
.badge { background: cornflowerblue; }
.input:focus { border-color: cornflowerblue; }
.link { color: cornflowerblue; }
```

**The problem:** "cornflowerblue" is not a role, it is a colour value. If the primary colour
changes, you search for "cornflowerblue" and replace. If you also used `hsl(219, 79%, 66%)`
which is visually close but technically different, you miss it.

**Change something:** In your components from previous lessons, replace `cornflowerblue`
with `hotpink`. How many places did you have to change?

---

## Concept: Design Tokens — Three Levels

**What it is:** Design tokens are named, semantic values that represent visual design
decisions. They are implemented as CSS custom properties.

**The three levels:**

**Level 1 — Primitive tokens:** Raw values with no semantic meaning.

```css
:root {
  --primitive-blue-100: hsl(219, 79%, 92%);
  --primitive-blue-300: hsl(219, 79%, 75%);
  --primitive-blue-500: hsl(219, 79%, 60%);
  --primitive-blue-700: hsl(219, 79%, 40%);
  --primitive-blue-900: hsl(219, 79%, 20%);

  --primitive-gray-100: hsl(0, 0%, 96%);
  --primitive-gray-300: hsl(0, 0%, 80%);
  --primitive-gray-500: hsl(0, 0%, 50%);
  --primitive-gray-700: hsl(0, 0%, 30%);
  --primitive-gray-900: hsl(0, 0%, 10%);

  --primitive-space-1: 0.25rem;
  --primitive-space-2: 0.5rem;
  --primitive-space-3: 0.75rem;
  --primitive-space-4: 1rem;
  --primitive-space-5: 1.5rem;
  --primitive-space-6: 2rem;
}
```

These are the full palette. Components never use these directly.

**Level 2 — Semantic tokens:** Named by role, not value. Reference primitives.

```css
:root {
  --color-background:      var(--primitive-gray-100);
  --color-surface:         white;
  --color-text-primary:    var(--primitive-gray-900);
  --color-text-secondary:  var(--primitive-gray-500);
  --color-border:          var(--primitive-gray-300);

  --color-primary:         var(--primitive-blue-500);
  --color-primary-hover:   var(--primitive-blue-700);
  --color-primary-subtle:  var(--primitive-blue-100);

  --color-danger:          hsl(0, 65%, 45%);
  --color-success:         hsl(140, 65%, 35%);

  --space-xs:  var(--primitive-space-1);
  --space-sm:  var(--primitive-space-2);
  --space-md:  var(--primitive-space-4);
  --space-lg:  var(--primitive-space-5);
  --space-xl:  var(--primitive-space-6);

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-pill: 99px;

  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.5rem;
  --font-size-2xl:  2rem;

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;
}
```

Components use THESE tokens — not primitives.

**Level 3 — Component tokens:** Per-component references to semantic tokens.

```css
.btn {
  --btn-background:    var(--color-primary);
  --btn-hover-bg:      var(--color-primary-hover);
  --btn-text:          white;
  --btn-padding-v:     var(--space-sm);
  --btn-padding-h:     var(--space-lg);
  --btn-radius:        var(--radius-md);
  --btn-font-size:     var(--font-size-base);
  --btn-font-weight:   var(--font-weight-bold);

  background:    var(--btn-background);
  color:         var(--btn-text);
  padding:       var(--btn-padding-v) var(--btn-padding-h);
  border-radius: var(--btn-radius);
  font-size:     var(--btn-font-size);
  font-weight:   var(--btn-font-weight);
}
```

**Why three levels?**

1. A designer changes the brand from blue to teal: change 5 primitive values. Done.
2. A designer adds a red theme: reassign semantic tokens in a `[data-theme="red"]` selector.
3. A button needs a special size in one context: override component tokens locally.

**What it hides:** Every colour decision, spacing decision, and size decision is stored
exactly once. Components never have raw values — they have semantic names. The meaning
of a component's style is legible from its token names.

**Canonical example:** Variables in programming. You do not hardcode `3.14159` in 20 places —
you define `PI = 3.14159` once. Design tokens are `PI` for visual decisions.

**You will see this again in:**
- Every professional design system (Material Design, Carbon, shadcn) is token-based
- Figma: design tokens can be synced directly to CSS variables via tools like Style Dictionary
- Tailwind's config is a design token system — you define colours, spacing, and radii once;
  every utility class references the token.
- T12·L20 (Reading and Building Designs): Figma files map directly to token systems

---

## Step 2 — Implement the Token System

Create `tokens.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Design Tokens</title>
  <style>
    /* ── PRIMITIVE TOKENS ─────────────────────────────── */
    :root {
      --p-blue-100: hsl(219, 79%, 93%);
      --p-blue-300: hsl(219, 79%, 78%);
      --p-blue-500: hsl(219, 79%, 60%);
      --p-blue-700: hsl(219, 79%, 42%);
      --p-blue-900: hsl(219, 79%, 22%);

      --p-gray-50:  hsl(0, 0%, 97%);
      --p-gray-100: hsl(0, 0%, 94%);
      --p-gray-200: hsl(0, 0%, 88%);
      --p-gray-500: hsl(0, 0%, 50%);
      --p-gray-700: hsl(0, 0%, 28%);
      --p-gray-900: hsl(0, 0%, 10%);

      --p-sp-1: 0.25rem;
      --p-sp-2: 0.5rem;
      --p-sp-3: 0.75rem;
      --p-sp-4: 1rem;
      --p-sp-5: 1.5rem;
      --p-sp-6: 2rem;
    }

    /* ── SEMANTIC TOKENS (light mode) ─────────────────── */
    :root {
      --color-bg:             var(--p-gray-50);
      --color-surface:        white;
      --color-border:         var(--p-gray-200);

      --color-text:           var(--p-gray-900);
      --color-text-secondary: var(--p-gray-500);

      --color-primary:        var(--p-blue-500);
      --color-primary-hover:  var(--p-blue-700);
      --color-primary-subtle: var(--p-blue-100);

      --color-danger:         hsl(0, 70%, 44%);
      --color-success:        hsl(140, 60%, 32%);

      --space-xs: var(--p-sp-1);
      --space-sm: var(--p-sp-2);
      --space-md: var(--p-sp-4);
      --space-lg: var(--p-sp-5);
      --space-xl: var(--p-sp-6);

      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-pill: 99px;

      --font-sm:   0.875rem;
      --font-base: 1rem;
      --font-lg:   1.125rem;
      --font-xl:   1.5rem;
    }

    /* ── DARK MODE — reassign semantic tokens only ────── */
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg:             hsl(220, 20%, 12%);
        --color-surface:        hsl(220, 15%, 18%);
        --color-border:         hsl(220, 15%, 28%);

        --color-text:           hsl(0, 0%, 92%);
        --color-text-secondary: hsl(0, 0%, 60%);

        --color-primary:        var(--p-blue-300);
        --color-primary-hover:  var(--p-blue-100);
        --color-primary-subtle: var(--p-blue-900);
      }
    }

    /* ── BASE STYLES ───────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: system-ui, sans-serif;
      font-size: var(--font-base);
      background: var(--color-bg);
      color: var(--color-text);
      margin: 0;
      padding: var(--space-xl);
    }

    /* ── CARD COMPONENT ────────────────────────────────── */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      max-width: 360px;
    }

    .card__title {
      font-size: var(--font-lg);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 var(--space-sm);
    }

    .card__description {
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0 0 var(--space-lg);
    }

    /* ── BUTTON COMPONENT ──────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: white;
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      font-size: var(--font-base);
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }

    .btn:hover  { background: var(--color-primary-hover); }
    .btn:active { transform: scale(0.97); }

    .btn:focus-visible {
      outline: 3px solid var(--color-primary);
      outline-offset: 3px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2 class="card__title">CNC Toolpath Generator</h2>
    <p class="card__description">
      Calculates optimal cutting paths for 2.5-axis machining operations.
      Runs in a background process with real-time progress.
    </p>
    <button class="btn">Start Job</button>
  </div>
</body>
</html>
```

### CSS AND SEE

**You should see:** A clean card with correct hierarchy, using tokens throughout.
Notice nothing in the component CSS has a raw colour value — everything references
a semantic token.

**Test dark mode:** Open DevTools → Rendering tab (three-dot menu → More tools) → check
"Emulate CSS media feature `prefers-color-scheme`" → dark. The entire page switches to
dark mode. The component CSS is unchanged — only the semantic tokens reassigned in
`@media (prefers-color-scheme: dark)`.

**Change the primary colour:** Change `--p-blue-500` to `hsl(280, 70%, 55%)` (purple).
Both the button and the focus ring change simultaneously — they both consume `--color-primary`,
which references `--p-blue-500`.

---

## Concept: CSS Custom Properties — How `var()` Works

**What it is:** CSS custom properties (often called CSS variables) are user-defined
properties that begin with `--`. They cascade and inherit like regular CSS properties.

**The `var()` function:** Reads the value of a custom property. Optionally provides a fallback:

```css
color: var(--color-text);               /* use the token */
color: var(--color-text, #1a1a1a);     /* use the token, fall back to #1a1a1a if undefined */
```

**Cascading:** Custom properties inherit like `color` — they pass down from parent to children.
Setting `--color-primary: red` on a `.card` element changes it for ALL descendants of that card.
This is how component-level theme overrides work:

```css
.card--danger {
  --color-primary: var(--color-danger);
  /* All .btn elements inside this card now use danger colour: */
}
```

**What happens when a variable is not defined:**

```css
color: var(--does-not-exist);
```

The browser uses the property's initial value — for `color`, that is the inherited colour
or the browser default. It does NOT crash. It silently falls back. This can make debugging
difficult — always check the computed value in DevTools when a token seems to be ignored.

**`@property` (advanced):** CSS now has `@property` for typed custom properties with
defaults and animation support:

```css
@property --progress {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}
```

This allows animating custom properties and prevents invalid values. Beyond scope for now.

---

## Step 3 — Override Tokens at Component Level

Add a danger variant to the card:

```html
<div class="card" style="--color-primary: var(--color-danger); margin-top: var(--space-lg);">  <!-- ← add -->
  <h2 class="card__title">Delete Account</h2>
  <p class="card__description">
    This action is permanent and cannot be undone.
  </p>
  <button class="btn">Delete Account</button>
</div>
```

### CSS AND SEE

**You should see:** The second card's button is red — without adding any new CSS classes.
By setting `--color-primary: var(--color-danger)` on the card element, all descendants
that consume `--color-primary` (including the `.btn`) inherit the override.

**This is the cascading inheritance of CSS custom properties.** It is how design systems
enable contextual theming without modifier classes everywhere.

---

## 🎯 Challenge: Add an Icon Token System

**You know:** CSS custom properties, `@keyframes`, `::before`/`::after`.

**Task:** Extend the token system to support icon sizes and a simple icon implementation.

1. Add `--icon-sm: 1rem`, `--icon-md: 1.25rem`, `--icon-lg: 1.5rem` tokens
2. Create a `.icon` utility that sizes a text character or Unicode symbol to the icon size
3. Add an icon before the button text in the card (use Unicode: ▶ for start, ✕ for delete)
4. The icon should use `--icon-md` and the same colour as the button text

---

<details>
<summary>▶ Show Solution</summary>

Add to `:root` semantic tokens:
```css
--icon-sm: 1rem;
--icon-md: 1.25rem;
--icon-lg: 1.5rem;
```

Add utility:
```css
.icon {
  font-size: var(--icon-md);
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
```

Update button HTML:
```html
<button class="btn">
  <span class="icon">▶</span>
  Start Job
</button>
```

For the delete card:
```html
<button class="btn">
  <span class="icon">✕</span>
  Delete Account
</button>
```

**Key insight:** The icon inherits `color: white` from the button because `color` is an
inherited property. No separate token or colour declaration is needed. Token-based systems
work with CSS inheritance — you define the colour once on the button, and all text-based
children (including icons) inherit it. This is why `color` is a token-friendly property.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Primitive → semantic → component chain | Change a primitive value — semantic and component consumers update |
| Dark mode from tokens | DevTools emulate dark → page switches without touching component CSS |
| Token override at component level | `--color-primary: danger` on parent → child button turns red |
| `var()` fallback | Delete a token — fallback value renders instead of crash |
| No raw values in components | Search component CSS for any hex or hsl — find none |

---

## Quick Check Answers

**1. `--color-blue-500` vs `--color-primary: var(--color-blue-500)`. Why do components use semantic?**

`--color-blue-500` is a primitive — it tells you the colour value, not the role.
`--color-primary` is semantic — it tells you what the colour is FOR.
A button that uses `--color-primary` says "I am styled with the primary brand colour."
A button that uses `--color-blue-500` says "I am blue." When the brand changes from blue to
teal, you change `--color-primary: var(--color-teal-500)` in one place. Every consumer
of `--color-primary` updates. If components used `--color-blue-500` directly, you would
need to find every use and replace it — defeating the purpose.

**2. Minimum place to change values for dark mode?**

The semantic token definitions — one media query block that reassigns `--color-bg`,
`--color-surface`, `--color-text`, and `--color-primary` to dark-appropriate values.
Component CSS reads from semantic tokens and never changes. This is the entire advantage
of the three-level token system: dark mode is implemented once, in the token definitions,
not in every component.

**3. `var(--space-4)` — variable not defined. What renders?**

The browser uses the property's initial value or inherited value. For `margin: var(--space-4)`,
the initial value of `margin` is `0`. The margin renders as 0, with no error or crash.
For `color: var(--undefined)`, the browser uses the inherited `color` or the initial value
(`CanvasText` / the browser default). Custom property resolution is always silent — check
the computed tab in DevTools when a token seems to have no effect.
