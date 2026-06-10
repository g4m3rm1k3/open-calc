# Junior to Senior — T12·L5 — Typography

**Prerequisites:** T12·L4 (Selectors). You can target any element precisely. This lesson
teaches how to control text — size, weight, spacing, line height, font families — and why
getting typography right makes everything else look more professional, even before you
touch layout.

**What this lab adds:**
- The `font-family` stack — why you always list multiple fonts
- `font-size` units: `px`, `rem`, `em` — which to use and why
- `line-height` — what it controls and why the unitless value is preferred
- `letter-spacing` and `word-spacing`
- `font-weight`, `font-style`, `text-decoration`, `text-transform`
- Loading custom fonts with `@font-face` and Google Fonts
- What makes a typographic scale and why arbitrary sizes look wrong

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `font-size: 2em` on a paragraph inside a div that has `font-size: 20px`.
>    What is the paragraph's actual font size in pixels?
> 2. `font-size: 2rem`. What is it relative to? What is the typical default?
> 3. You set `line-height: 24px` on body text that is 16px. Why might this break
>    on headings later?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You set `font-size: 18px` on a paragraph, `font-size: 24px` on a heading, `font-size: 14px`
on a caption. All arbitrary. The page feels chaotic — the text sizes do not relate to each other.
Later you want to make the whole page slightly larger for accessibility. You change every
`font-size` declaration individually.

Good typography has a system: a base size, a scale, and relative units so you change one
value to update everything.

---

## Step 1 — See the Problem with Arbitrary Sizes

Create `typography.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Typography</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { max-width: 700px; margin: 40px auto; padding: 0 16px; }

    /* Arbitrary sizes — the wrong approach */
    h1 { font-size: 31px; }
    h2 { font-size: 22px; }
    p  { font-size: 17px; }
    small { font-size: 11px; }
  </style>
</head>
<body>
  <h1>Article Title</h1>
  <h2>Section Heading</h2>
  <p>This is body text. It should be comfortable to read at the standard line length.</p>
  <small>A caption or footnote in smaller text.</small>
</body>
</html>
```

### CSS AND SEE

The page renders, but the sizes are arbitrary — no clear relationship between them.
If a client says "make everything 20% larger for accessibility", you must change four numbers.

**Change something:** Try to make everything larger by changing only `body { font-size: 20px; }`.

**Expected:** Nothing changes — the headings and paragraphs all have fixed `px` sizes that
ignore what the body says. This is the problem with pixel-only typography.

---

## Concept: CSS Length Units — `px`, `em`, and `rem`

**What it is:** CSS has multiple units for length. For typography, three are important.

**`px` — absolute pixels:**
- `font-size: 20px` is always exactly 20 pixels
- Never changes based on context
- Problem: completely disconnected from the user's browser settings and from the parent element
- Use when: borders, shadows, elements that must be a specific hardware size

**`em` — relative to the PARENT element's font size:**
- `font-size: 1.5em` means 1.5 × the parent's font size
- If the parent is 20px: `1.5em = 30px`
- Problem: em units compound. A `1.5em` inside a `1.5em` inside a `1.5em` gives
  `20 × 1.5 × 1.5 × 1.5 = 67.5px` — the "em compounding problem"
- Use `em` when you want a measurement to scale WITH the element's font (like padding on
  a button — `padding: 0.5em 1em` makes the button's padding proportional to its text size)

**`rem` — relative to the ROOT element's font size:**
- `rem` = "root em" — always relative to the `<html>` element's `font-size`
- If `html { font-size: 16px }` (default): `1rem = 16px`, `2rem = 32px`
- Does NOT compound — a `2rem` inside a `2rem` is still `2rem` (32px)
- The browser default for `<html>` is `16px` unless the user changes it in browser settings
- Use `rem` for: font sizes, spacing that should be globally proportional

**Why `rem` for font sizes:**

If a user has poor vision and sets their browser's default font size to 20px, `rem` units
respond to that — `1rem` becomes `20px`, everything scales. `px` units ignore the user's
preference. This is both better UX and required by accessibility standards (WCAG 2.1).

**The alternative that was not chosen:** Using only `px`. Works for sighted users, but
fails people who need larger text. The original CSS spec had `pt` (points), `cm`, `mm`,
`in` — all absolute units, all wrong for screen typography.

**Canonical example:** Rem is like a standardized unit in a blueprint. The architect sets
1 unit = 10 feet. Every measurement in the building uses multiples of that unit. Change
the base and everything re-scales proportionally.

**You will see this again in:**
- Every design system uses a base `font-size` on `:root` and `rem` everywhere else
- Tailwind's default: `text-sm` = `0.875rem`, `text-base` = `1rem`, `text-lg` = `1.125rem`
- T12·L13 (Design Tokens): tokens are expressed in `rem` so they scale with the root

---

## Step 2 — Switch to `rem` Typography

Update `typography.html`:

```css
/* Set the base — everything else is relative to this: */
:root {
  font-size: 16px;     /* ← the base unit */
}

body {
  font-family: sans-serif;
  font-size: 1rem;     /* ← 16px */
  line-height: 1.6;    /* ← unitless — explained next */
  color: #333;
}

h1 { font-size: 2rem;     }   /* 32px */
h2 { font-size: 1.5rem;   }   /* 24px */
p  { font-size: 1rem;     }   /* 16px */
small { font-size: 0.875rem; } /* 14px */
```

### CSS AND SEE

**Change something:** Change `:root { font-size: 16px; }` to `:root { font-size: 20px; }`.

**Expected:** EVERYTHING on the page gets larger — heading, body text, small text —
all proportionally. This is the entire point of `rem`: one change, global effect.

Change it back to `16px`.

---

## Concept: `line-height` — Why Unitless Is Correct

**What it is:** The height of each line of text. Controls the vertical space between lines.

**The three ways to write it:**

```css
line-height: 24px;   /* absolute — fixed regardless of font size */
line-height: 1.5em;  /* relative to THIS element's font size */
line-height: 1.5;    /* unitless — relative to the INHERITED font size */
```

**Why unitless is almost always correct:**

Unitless `line-height` is a multiplier: the computed line-height = `font-size × line-height`.

When you set `line-height: 1.6` on the body:
- A 16px paragraph has `16 × 1.6 = 25.6px` line height
- A 32px heading has `32 × 1.6 = 51.2px` line height

The proportions remain correct at every size. Headings get proportionally more line spacing
because they are larger — exactly what good typography needs.

**The problem with `px` line-height:**

If you set `line-height: 24px` globally and later add a 48px heading, the heading's
lines will be cramped — 24px line height is tight for 48px text. You must remember to
override it everywhere. Unitless does this automatically.

**Practical values:**
- `1.4`–`1.6` for body text
- `1.1`–`1.3` for headings (larger text needs less relative spacing)
- `1.0` for single-line elements (buttons, labels)

**You will see this again in:**
- Every CSS reset includes `line-height: 1.5` on `body`
- The `normal` keyword (browser default) is approximately `1.2` — too tight for comfortable reading

---

## Step 3 — Typography Properties

Add to the CSS in `typography.html`:

```css
h1 {
  font-size: 2rem;
  line-height: 1.2;          /* tighter for headings */
  font-weight: 700;          /* bold — matches <strong> visually */
  letter-spacing: -0.02em;   /* slight tightening for large headings */
  margin: 0 0 0.5rem 0;
}

h2 {
  font-size: 1.5rem;
  line-height: 1.3;
  font-weight: 600;
  margin: 2rem 0 0.75rem 0;
}

p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  max-width: 65ch;            /* limit line length for readability */
}

small {
  font-size: 0.875rem;
  color: #666;
  display: block;             /* so margin works */
  margin-top: 0.25rem;
}
```

### CSS AND SEE

**You should see:** Noticeably better typography. The `max-width: 65ch` on paragraphs is
especially important — `ch` is a unit equal to the width of the "0" character in the current
font. `65ch` is approximately 65 characters per line — the typographically recommended range
for comfortable reading.

**Change something:** Remove `max-width: 65ch` and stretch the browser window wide.

**Expected:** Paragraphs stretch full width. The lines become too long to track easily.
Add it back.

**Change something else:** Change `letter-spacing: -0.02em` on the h1 to `letter-spacing: 0.1em`.

**Expected:** The heading looks spread out and "airy" — negative letter-spacing on large
headings is common in professional design; positive letter-spacing is for ALL-CAPS text
and small labels where tight spacing looks cramped.

---

## Concept: The `font-family` Stack

**What it is:** A comma-separated list of fonts in priority order. The browser tries
the first font; if it is not installed on the user's system, it tries the second, and so on.
The last entry is always a generic family.

**The five generic families:**

| Generic | Meaning |
|---|---|
| `serif` | Fonts with small strokes at the ends of letters (Times New Roman) |
| `sans-serif` | Fonts without those strokes (Arial, Helvetica) |
| `monospace` | Fixed-width characters (Courier, Consolas) — for code |
| `cursive` | Handwriting-style fonts |
| `fantasy` | Decorative fonts |

**Why a stack:**

```css
font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
```

- `Segoe UI` — Windows system font (looks great on Windows 10+)
- `system-ui` — the operating system's default UI font (San Francisco on macOS, Roboto on Android)
- `-apple-system` — same as `system-ui` but the older syntax for Safari
- `sans-serif` — last resort: browser picks any installed sans-serif font

**Why not just `sans-serif`:** The browser's fallback varies by OS and may look dated.
The stack above gives you the native system font on every platform — the same font the OS
uses for its own UI, which users are accustomed to reading.

**Why not just a single font name:** If the user does not have that font installed, the
browser falls back to its default serif (usually Times New Roman) — almost never what you want.

**System font stack (modern approach):**

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

This is what GitHub, Linear, and most modern web applications use — renders the native
system font on every platform.

---

## Step 4 — Loading Custom Fonts

Two approaches — Google Fonts (network) and `@font-face` (local):

**Google Fonts (simplest):**

```html
<!-- In the <head>, BEFORE your styles: -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

Then in CSS:

```css
body { font-family: 'Inter', system-ui, sans-serif; }
```

**`@font-face` (self-hosted):**

```css
@font-face {
  font-family: 'Inter';            /* the name you will use in font-family */
  src: url('fonts/inter.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;              /* show fallback font while loading */
}
```

`woff2` (Web Open Font Format 2) is the current standard — compressed, widely supported.

**`font-display: swap`:** Without it, text is invisible until the font loads ("flash of
invisible text" — FOIT). With `swap`, the browser shows the fallback font immediately
and swaps when the custom font loads. This is better UX.

**The alternative:** Not loading custom fonts. System font stacks render instantly, require
no network request, and match the user's OS aesthetic. For many applications — particularly
developer tools and dashboards — system fonts are the correct choice.

**You will see this again in:**
- T12·L17 (Component Design): font-family is a design token; it is set once and consumed everywhere.
- Performance: web fonts are one of the largest performance bottlenecks. The `preconnect`
  hints above reduce the connection time for Google Fonts.

---

### CSS AND SEE

Add the Google Fonts `<link>` to `typography.html` and update `body { font-family: 'Inter', system-ui, sans-serif; }`.

**You should see:** The page renders in Inter — a clean, modern sans-serif designed for screens.
The difference is subtle on some systems if your system font is already Inter or similar.

**Change something:** Add `font-weight: 600` to h1 and h2 but remove the `600` weight
from the Google Fonts URL (change `400;600;700` to just `400`).

**Expected:** The headings appear in `400` weight (regular) — the browser cannot find
`600` in the loaded font and falls back to the nearest available weight. Always load the
weights you use.

---

## 🎯 Challenge: Build a Typographic Article

**Task:** Using only the concepts from this lesson, style an article that looks like a
well-designed blog post:

1. A clear hierarchy: H1, H2, H3, body text, blockquote, code snippet
2. All font sizes in `rem`
3. Comfortable line length (`max-width: 65ch` on paragraphs)
4. Distinct visual difference between heading levels
5. A blockquote styled with a left border and italic text
6. Code text in a monospace font with a light background

No layout yet — just text, sizes, weights, spacing.

---

<details>
<summary>▶ Show Solution</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Article</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root { font-size: 16px; }

    body {
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      line-height: 1.65;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    h1 { font-size: 2.25rem; line-height: 1.15; font-weight: 700; margin: 0 0 0.5rem; }
    h2 { font-size: 1.5rem;  line-height: 1.25; font-weight: 600; margin: 2.5rem 0 0.75rem; }
    h3 { font-size: 1.15rem; line-height: 1.3;  font-weight: 600; margin: 2rem 0 0.5rem; }

    p {
      max-width: 65ch;
      margin: 0 0 1rem;
    }

    blockquote {
      border-left: 3px solid cornflowerblue;
      margin: 1.5rem 0;
      padding: 0.5rem 1rem;
      font-style: italic;
      color: #555;
    }

    blockquote p { margin: 0; }

    code {
      font-family: 'Consolas', 'Menlo', monospace;
      font-size: 0.9em;
      background: #f4f4f4;
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>The Typography of the Web</h1>
  <p>Good typography is invisible. When it works, you read the content — not the font.</p>
  <h2>Sizing</h2>
  <p>Use <code>rem</code> for font sizes so a single root change scales everything.</p>
  <h3>The Scale</h3>
  <p>Sizes should relate to each other: 1rem, 1.5rem, 2.25rem — not arbitrary pixels.</p>
  <blockquote>
    <p>"Typography is the craft of endowing human language with a durable visual form."</p>
  </blockquote>
</body>
</html>
```

**Key insight:** `max-width: 65ch` on `body` instead of on every `p` is a shortcut —
but it limits ALL block elements, not just paragraphs. Setting it on `p` individually
gives more flexibility (headings can be full-width; paragraphs are constrained). Both
approaches are valid depending on the design.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `rem` scales with root | Change `:root { font-size }` — all `rem` values update |
| `em` inherits from parent | `font-size: 2em` inside a `24px` parent = `48px` |
| Unitless `line-height` | Heading and body have appropriate spacing without overrides |
| `max-width: 65ch` | Paragraphs stop at ~65 characters regardless of window width |
| `font-family` stack | Remove first font — second in stack applies |
| Google Fonts | Custom font renders (check Network tab for the request) |

---

## Quick Check Answers

**1. `font-size: 2em` inside a `20px` parent. Actual size?**

40px. `em` is relative to the parent's font size. `2 × 20px = 40px`. If the 40px
element had a child with `font-size: 1.5em`, that child would be `1.5 × 40 = 60px` —
this is the em compounding problem. `rem` avoids it by always referencing the root.

**2. `font-size: 2rem`. What is it relative to? Default?**

Relative to the `<html>` element's font size. The browser default is `16px` unless the
user has changed their browser settings. So `2rem = 32px` by default. Unlike `em`,
`rem` does not compound — a `2rem` nested at any depth is always `2 × root font size`.

**3. `line-height: 24px` globally. Why does it break on headings?**

`24px` is an absolute value. A 16px body paragraph has comfortable spacing (24/16 = 1.5).
A 48px heading would have `24px` line height — tighter than the text itself, causing
lines to overlap on multi-line headings. Unitless `1.5` would give the heading `72px`
line height, which is appropriate. Absolute line heights must be individually overridden
for each font size — unitless handles it automatically.
