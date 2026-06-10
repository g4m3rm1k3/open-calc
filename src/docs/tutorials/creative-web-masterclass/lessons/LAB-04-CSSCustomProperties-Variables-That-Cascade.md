# Creative Web Masterclass — LAB 04 — CSS Custom Properties: Variables That Cascade

**Prerequisites:** LAB-03. You know flexbox, the box model, and how CSS files link to HTML.

**What this lab adds:**
- CSS custom properties (variables) — declare once, use everywhere
- `:root` as the global scope for design tokens
- How changing one variable propagates to every element that references it
- A practical dark/light theme switcher using a single variable swap

**Time:** 40–55 minutes

---

## What You Will Build

A page where one variable controls the entire color scheme:

```
  --color-primary: #6c63ff;   ← change this ONE value

  ┌──────────────────────────────────┐
  │  ██ Heading text                 │  ← color from --color-primary
  │                                  │
  │  [ View Work ]                   │  ← background from --color-primary
  │                                  │
  │  ┌──────────────────────────┐    │
  │  │ Card with primary border │    │  ← border from --color-primary
  │  └──────────────────────────┘    │
  └──────────────────────────────────┘

  Change the variable → all three update simultaneously
```

Then a class-swap dark mode that changes all surface colors with one variable update.

---

> **Quick Check — answer before reading further:**
>
> 1. You use the hex color `#6c63ff` in 15 places across your CSS. Then the designer
>    changes it to `#5a52d4`. How many edits do you need? Is there a better way?
> 2. What do you think "cascade" means in "CSS custom properties cascade"?
> 3. If you define `--color-bg: white` on `:root` and `--color-bg: #111` on `.dark`,
>    which value wins when an element has class `dark`?
>
> *(Answers at the end)*

---

## Concept: CSS Custom Properties

**What it is:** A CSS custom property is a named slot in the cascade that stores any CSS
value. You declare it with `--name: value` and read it with `var(--name)`.

**The problem before:**

```css
/* Without custom properties — the same color repeated everywhere */
.nav-bar     { background: #6c63ff; }
.button      { background: #6c63ff; }
.card-border { border-color: #6c63ff; }
.heading     { color: #6c63ff; }
.link:hover  { color: #6c63ff; }
```

When the designer says "change the brand color," you search for every instance of `#6c63ff`
and edit each one. Forget one and the design is inconsistent. This is also fragile — any
typo in the hex creates a silent wrong color with no error.

**The solution:**

```css
:root {
  --color-primary: #6c63ff;   /* declare once */
}

.nav-bar     { background: var(--color-primary); }
.button      { background: var(--color-primary); }
.card-border { border-color: var(--color-primary); }
.heading     { color: var(--color-primary); }
```

Change the value on `:root` — every element updates.

**What it hides:** Custom properties hide the fact that CSS values are normally static
strings baked into each rule. Without them, there is no connection between two rules that
happen to use the same hex value — the browser sees them as independent. Custom properties
introduce a reference — every rule that calls `var(--color-primary)` reads from the same
named slot, so they all see the same current value. The invariant it protects: when you
change the variable declaration, every reference to it is guaranteed to update.

**Canonical example (General Explanation):**
- **Real-world analogy:** A variable on a spreadsheet. You put `$12.99` in cell A1 and
  write `=A1*quantity` in 30 other cells. Change A1 to `$14.99` and all 30 cells update.
  The cells reference the source; they do not store their own copy.
- **Minimal form:**
  ```css
  :root { --spacing: 16px; }
  .card { padding: var(--spacing); }
  .button { margin: var(--spacing); }
  ```
- **Why obvious:** One declaration, two uses. Change the declaration once, both uses update.

**Project Application:**
The portfolio's design tokens — primary color, background color, text color, font size
scale — will all be CSS custom properties on `:root`. When you add a dark mode in this lab,
you override those tokens in one place. The rest of the CSS never changes.

**Smallest possible example:**

```css
:root {
  --color-primary: #6c63ff;
}
h1 {
  color: var(--color-primary);
}
```

**Why it matters here:** Every lab from this point forward uses custom properties for colors
and spacing. You will never hard-code the same hex value twice.

**Watch for:** Custom property names must start with `--` (two dashes). A single dash (`-`)
is not a custom property — it may be part of a regular CSS property name. Also, `var()`
reads the *nearest ancestor* that defines the variable, not just `:root`.

---

## Concept: `:root` and the Cascade

**What it is:** `:root` is a CSS pseudo-class that matches the `<html>` element — the top
of the DOM tree. Custom properties defined there are available to every element in the page
because all elements are descendants of `<html>`.

**The problem before:** If you define `--color-primary` on `.button`, only `.button` and
its children can use it. Other elements that try `var(--color-primary)` get no value.

**The solution:** Define global tokens on `:root` — they cascade down to every element.
Override specific tokens on a scoped selector (`.dark`, `.card`, etc.) to change only
elements inside that scope.

**Canonical example (General Explanation):**
- **Real-world analogy:** A building-wide announcement system. `:root` is the building PA
  speaker. A custom property on a single room overrides the announcement only inside that room.
- **Minimal form:**
  ```css
  :root { --bg: white; }        /* whole page */
  .dark { --bg: #111; }         /* only .dark containers */
  body { background: var(--bg); }
  ```

**Project Application:**
All design tokens go on `:root`. Dark mode overrides go on `.theme-dark` (a class you add
to `<body>` with JavaScript in Step 5).

**Smallest possible example:**
```css
:root { --color-text: #333; }
p { color: var(--color-text); }
```

**Why it matters here:** `:root` is where the design system lives. Every other selector
either inherits from it or overrides specific variables.

**Watch for:** `:root` has higher specificity than `html` (because it is a pseudo-class).
If you define the same property on both `:root` and `html`, `:root` wins.

---

## Step 1 — Create Files and Define Tokens

Create `projects/lab-04/index.html` and `projects/lab-04/styles.css`.

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 04 — CSS Custom Properties</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="page">
      <h1 class="heading">Creative Developer</h1>
      <p class="subtext">Building interfaces one variable at a time.</p>
      <button class="button">View Work</button>
      <div class="card">
        <p>This card uses the same color tokens as everything else.</p>
      </div>
      <button class="toggle-theme" onclick="document.body.classList.toggle('theme-dark')">
        Toggle Dark Mode
      </button>
    </main>
  </body>
</html>
```

The `onclick` attribute runs one line of JavaScript inline: it toggles the class `theme-dark`
on `<body>`. When `theme-dark` is present, dark-mode CSS rules apply. When absent, light mode
applies. You will define those rules in Step 4.

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** Plain unstyled content — heading, paragraph, two buttons, card text.
> No colors, no layout. Default browser styling only.

---

## Step 2 — Declare Design Tokens on `:root`

`styles.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  /* Color tokens */
  --color-primary: #6c63ff;        /* brand purple */
  --color-bg: #ffffff;             /* page background */
  --color-surface: #f8f8ff;        /* card/section background */
  --color-text: #1a1a2e;           /* main text */
  --color-text-muted: #6b6b8a;     /* secondary text */
  --color-border: rgba(108, 99, 255, 0.2);  /* subtle primary-tinted border */

  /* Spacing tokens */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  --spacing-xl: 64px;

  /* Typography tokens */
  --font-body: system-ui, sans-serif;
  --font-size-base: 1rem;           /* 1rem = 16px by default */
}
```

This declares every design decision once. No element uses a raw color or spacing value
after this — they all reference these tokens.

---

> **CSS AND SEE**
>
> Save. The page looks identical. That is correct — you have declared variables but have
> not used them yet. Variables on `:root` are inert until referenced with `var()`.

---

## Step 3 — Apply Tokens to Elements

Add to `styles.css`:

```css
body {
  margin: 0;
  font-family: var(--font-body);         /* use the token, not a raw font name */
  background: var(--color-bg);
  color: var(--color-text);
}

.page {
  max-width: 600px;
  margin: 0 auto;                        /* center horizontally */
  padding: var(--spacing-xl) var(--spacing-lg);  /* 64px top/bottom, 32px sides */
}

.heading {
  color: var(--color-primary);           /* heading uses brand color */
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.subtext {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}
```

---

> **CSS AND SEE**
>
> **You should see:** Purple heading text, muted grey subtext, centered content on a white page.
>
> **Why use `var(--spacing-md)` instead of `16px`?** If you later decide all spacings
> should be slightly larger, you change the token once. Everything that references it updates.

---

## Step 4 — Style the Button and Card

```css
.button {
  background: var(--color-primary);     /* brand color background */
  color: white;
  border: none;
  border-radius: 6px;
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px top/bottom, 16px sides */
  font-size: var(--font-size-base);
  cursor: pointer;                       /* show hand cursor on hover */
  margin-bottom: var(--spacing-lg);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.toggle-theme {
  background: transparent;
  border: 1px solid var(--color-text-muted);
  border-radius: 4px;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
```

---

> **CSS AND SEE**
>
> **You should see:** A purple button, a light purple-tinted card, and a small grey
> "Toggle Dark Mode" button at the bottom.
>
> **Now test the variable:** Change `--color-primary: #6c63ff` to `--color-primary: #e63946`.
> Save. Watch the heading color and button background both change to red simultaneously.
> Change it back to `#6c63ff`.
>
> **This is the payoff:** One edit, three elements updated. No search-and-replace.

---

## Step 5 — Add Dark Mode by Overriding Tokens

Add to `styles.css`:

```css
/* Dark mode: override surface tokens when body has .theme-dark */
body.theme-dark {
  --color-bg: #1a1a2e;              /* dark background */
  --color-surface: #16213e;         /* slightly lighter dark card background */
  --color-text: #e2e2f0;            /* light text */
  --color-text-muted: #8080a0;      /* muted light text */
  --color-border: rgba(108, 99, 255, 0.3);
  /* --color-primary stays the same — brand purple works on dark backgrounds */
}
```

No other CSS changes. Every rule that references `var(--color-bg)`, `var(--color-text)`, etc.
automatically uses the overridden values when `.theme-dark` is on the body, because CSS
custom properties re-evaluate based on the nearest ancestor that defines them.

---

> **CSS AND SEE**
>
> Click "Toggle Dark Mode."
>
> **You should see:** The entire page switches to a dark background with light text.
> The purple heading and button remain purple — only the surface and text tokens changed.
>
> Click again to switch back to light mode.
>
> **In DevTools:** With dark mode active, inspect `<body>`. In the Computed tab, find
> `--color-bg`. It shows `#1a1a2e` — the overridden value. Click the body class to
> `theme-dark` off in DevTools and watch it switch back to `#ffffff`.

---

## 🎯 Challenge: Add a New Theme Token

**You know:** Custom properties on `:root` are overridden by the same property on `.theme-dark`.

**Task:** Add a `--color-accent` token — different from `--color-primary` — and use it as
the hover background for `.button`. The accent should be `#ff6b6b` in light mode and
`#ff8e8e` in dark mode.

**Starting code:**
```css
:root {
  /* add --color-accent here */
}
body.theme-dark {
  /* override --color-accent here */
}
.button:hover {
  /* use var(--color-accent) here */
}
```

**Hint:** CSS transitions are not taught until LAB-05 — for now, the hover color change
will be instant. Focus on getting the variable working correctly in both themes.

---

<details>
<summary>▶ Show Solution</summary>

```css
:root {
  --color-primary: #6c63ff;
  --color-accent: #ff6b6b;   /* ← add */
  /* ...other tokens... */
}

body.theme-dark {
  /* ...other dark tokens... */
  --color-accent: #ff8e8e;   /* ← add: lighter for dark mode contrast */
}

.button:hover {
  background: var(--color-accent);  /* ← add */
}
```

**Key insight:** Adding a new design token requires three things: declare it on `:root`,
override it in every theme variation, and use it via `var()` wherever needed. The rest of
the CSS does not change. This is the power of the token system — new tokens are additive.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Design tokens declared on `:root` | Open DevTools → inspect `<html>` → Computed shows `--color-primary` etc. |
| Heading uses brand color | Purple `<h1>` text visible |
| Button uses brand color | Purple button background |
| Card uses surface token | Card has light purple-tinted background |
| Dark mode toggles all surfaces | Click toggle → page goes dark, click again → light |
| Brand color unchanged in dark mode | `--color-primary` remains purple in both themes |

---

## What's Next

LAB-05 introduces CSS transitions — the `transition` property that makes state changes
(like `:hover`) animate smoothly instead of snapping. You will add smooth hover effects to
the button and card you built here.

---

## Transfer Exercise

CSS custom properties are CSS's version of a concept called "design tokens" — named values
representing design decisions that propagate through a system. The same concept exists in
other design systems: iOS uses `UIColor.systemBlue`, Android uses `@color/colorPrimary`,
and Figma uses "style" tokens.

Describe one specific advantage of using named tokens over hard-coded values in an iOS app
that supports both light and dark mode. How is the mechanism the same as CSS custom properties?

---

## Quick Check Answers

**1. Changing a color in 15 places — is there a better way?**
Without custom properties: 15 manual edits, risk of typos, and the 16th instance that was
added three weeks ago in a forgotten CSS file. With custom properties: one edit on `:root`.
The variable is the better way — and it is exactly what CSS custom properties are for.

**2. What does "cascade" mean for custom properties?**
CSS properties "cascade" — they flow down from parent elements to children, and children
can override them. Custom properties participate in the cascade: a variable defined on
`:root` is inherited by all elements (because all elements are descendants of the root),
but a variable redefined on a specific element overrides it for that element and its
descendants only.

**3. Which value wins — `:root` or `.dark`?**
The `.dark` value wins for any element inside `.dark`. CSS custom properties follow normal
cascade rules: a more specific or more recent declaration overrides a less specific one.
`.dark` scopes the override, so only descendants of `.dark` see the new value — other
parts of the page continue using the `:root` value.
