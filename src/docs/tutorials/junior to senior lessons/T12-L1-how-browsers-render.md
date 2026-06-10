# Junior to Senior — T12·L1 — How Browsers Render

**Prerequisites:** T0·L1 (Git Workflow). You can create files and run a terminal.
No prior CSS knowledge required. This lesson teaches what the browser actually does
with your HTML and CSS before a single pixel appears on screen — because knowing the
pipeline makes every CSS property predictable instead of mysterious.

**What this lab adds:**
- The four stages of rendering: parse → style → layout → paint
- Why CSS exists as a separate language from HTML
- What the DOM is and why you need to know it
- What "the cascade" is before you learn the rules
- Why changing one CSS property can move everything else on the page

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write `<p style="color: red">Hello</p>`. Where exactly does the browser
>    store the information that this paragraph is red? Is it in the HTML file?
> 2. You change the font size of a heading. The paragraph below it moves down.
>    You did not touch the paragraph. Why did it move?
> 3. HTML describes structure. CSS describes appearance. Why are these two separate
>    languages instead of one?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Most CSS tutorials start with properties: `color`, `font-size`, `margin`. You copy the examples,
they work, then something unexpected happens — a rule that should apply doesn't, or a change
in one place breaks something in another. You add `!important`. It fixes it temporarily.
Three months later the file is 800 lines and nothing is predictable.

The reason is that you are driving a car without knowing what an engine is. You know which
pedal makes it go faster, but you do not know why, so when something goes wrong you have
no way to diagnose it.

This lesson gives you the engine. Every CSS concept for the rest of the curriculum connects
back to what you learn here.

---

## Step 1 — What the Browser Actually Receives

Create a new folder and file:

```bash
mkdir css-foundations && cd css-foundations
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Render demo</title>
  </head>
  <body>
    <h1>Hello</h1>
    <p>This is a paragraph.</p>
  </body>
</html>
```

### SAVE AND TRY

Open `index.html` directly in a browser (drag the file onto the browser, or right-click → Open with).

**You should see:** A white page with "Hello" in large bold text and a paragraph below it.

**In the browser, open DevTools:** Press F12 (Windows) or Cmd+Option+I (Mac). Click the
**Elements** tab.

**You should see:** A tree structure that looks like your HTML. Click the triangle next to
`<body>` to expand it. You can see `<h1>` and `<p>` as items in the tree.

This tree is NOT your HTML file. This is the **DOM** — the Document Object Model. It is
the browser's internal representation of your page, built FROM your HTML.

**Change something:** In the Elements panel, double-click the word "Hello" inside the `<h1>`.
Type "Changed". Press Enter.

**Expected:** The page text changes to "Changed" immediately. Your HTML file was NOT changed.
The DOM is separate from the file — it is a live object in memory.

Close DevTools and reload the page. "Hello" is back — the file was never touched.

---

### Concept: The DOM — The Browser's Internal Model

**What it is:** The DOM (Document Object Model) is a tree of objects the browser builds
from your HTML. Each HTML tag becomes a node in the tree. The browser works with the DOM —
not with your HTML file — for everything it does after the initial parse.

**The problem before (no DOM):**

Imagine if the browser worked directly with the raw HTML text. To change the colour of a
paragraph, you would have to scan thousands of characters of text, find the right tag,
insert a `style` attribute, and re-render the whole page from scratch. Extremely slow.

**The solution:**

```
Your HTML file (text):              DOM (objects in memory):
                                    
<body>                              body
  <h1>Hello</h1>          →           ├── h1 ("Hello")
  <p>A paragraph.</p>                 └── p ("A paragraph.")
</body>
```

The browser parses HTML ONCE, builds the DOM, then works exclusively with the DOM objects.
Changing a paragraph's colour means finding the paragraph object and setting its colour
property — O(1), instant.

**What it hides:** The conversion from text to objects. You write text; the browser builds
a queryable, modifiable tree. When JavaScript runs `document.querySelector('p')`, it
searches the DOM tree, not the HTML file.

**Canonical example:** Think of the DOM like a blueprint converted into a 3D model. The
blueprint (HTML) is read once. The 3D model (DOM) is what gets built. Architects work with
the model — they do not re-read the blueprint every time they want to check a measurement.

**You will see this again in:**
- Every time you use `document.querySelector()` in JavaScript
- React's virtual DOM is a copy of the DOM used to diff changes efficiently
- DevTools Elements panel shows the DOM — not your HTML file

**Watch for:** The DOM and your HTML file can diverge. JavaScript can add elements that were
never in your HTML. If you "inspect" something and it looks different from your source code,
JavaScript changed the DOM after the page loaded.

---

## Step 2 — The Four Rendering Stages

Now that you know what the DOM is, here is what the browser does with it before anything appears on screen.

Add a stylesheet to `index.html`. Update the `<head>`:

```html
<head>
  <title>Render demo</title>
  <style>
    h1 {
      color: navy;
      font-size: 48px;
    }
    p {
      color: grey;
      margin-top: 24px;
    }
  </style>
</head>
```

### SAVE AND TRY

Reload the page.

**You should see:** "Hello" is now navy blue and larger. The paragraph is grey with space above it.

Now open DevTools → **Elements** tab. Click on the `<h1>` element. Look at the right panel —
you should see a **Styles** section showing the rules that apply to this element.

**You should see:**
```
h1 {
  color: navy;
  font-size: 48px;
}
```

This is the browser's CSSOM — the CSS Object Model. Just as it built a DOM from your HTML,
it built a CSSOM from your CSS.

---

### Concept: The Four Stages — Parse, Style, Layout, Paint

**What it is:** Every time a page loads (and every time CSS changes), the browser runs
through four stages:

```
Stage 1: PARSE
  HTML text → DOM tree
  CSS text  → CSSOM (CSS Object Model)

Stage 2: STYLE (the "cascade")
  Combine DOM + CSSOM
  For each element: which CSS rules apply? What is the final value of every property?
  Result: a "render tree" — each element with its computed styles

Stage 3: LAYOUT (also called "reflow")
  For each element in the render tree: what is its size and position on screen?
  This is where the browser calculates exact pixel coordinates.
  Result: every element has an exact (x, y, width, height) on screen.

Stage 4: PAINT
  Actually draw pixels at those coordinates.
  Result: what you see.
```

**Why this matters for CSS:**

Every CSS property affects a specific stage. Some properties (like `color`) only affect Stage 4 (paint). They are cheap to change — the browser skips stages 1-3 and just repaints.

Other properties (like `font-size` or `margin`) affect Stage 3 (layout). Changing them forces the browser to recalculate positions for every affected element — which is why changing one element's size can move other elements.

```
Change color: paint only         → fast
Change font-size: layout → paint → slower
Change transform: paint only*    → fast (handled by GPU)
```

**This is why changing the heading's font size moved the paragraph** — font-size triggers a layout recalculation, and the paragraph's position depends on the heading's height, so it moves.

**What it hides:** The browser does this work so you don't have to. You declare what you want
(`font-size: 48px`); the browser computes where everything goes. Without this, you would have
to manually specify `x` and `y` coordinates for every element on every screen size.

**Canonical example:** Building a physical newspaper. Parse = reporters write their stories (raw content). Style = editors decide fonts, colours, column assignments. Layout = typesetters calculate exactly where each column and image fits. Paint = the printing press puts ink on paper. If a story gets longer (font-size increase), the typesetter must recalculate every column below it — layout runs again.

**Project application:** When you understand which stage a CSS property affects, you know
the cost of changing it — and you know why a small change can have large consequences.

**Smallest possible example:**

```css
/* This only triggers paint (cheap): */
p { color: red; }

/* This triggers layout + paint (more expensive): */
p { font-size: 20px; }

/* This triggers layout + paint for the entire page (expensive): */
body { font-size: 20px; }
```

**You will see this again in:**
- Performance audits in DevTools — "Layout Shift" and "Paint" are reported separately
- CSS animations: properties that trigger only paint (`opacity`, `transform`) are smooth;
  properties that trigger layout (`width`, `height`, `margin`) can cause jank
- React performance: re-renders trigger the style and layout stages

**Watch for:** The phrase "triggers a reflow" means Stage 3 ran. Reading certain JavaScript
properties (`element.offsetHeight`, `element.getBoundingClientRect()`) FORCES a layout
calculation immediately — if you do this in a loop, it is catastrophically slow.

---

## Step 3 — Why CSS Exists Separately From HTML

**The problem before CSS (1994):**

Early HTML had `<font color="red">`, `<center>`, `<b>`, `<i>`. Structure and appearance were
mixed in the same tags. If you wanted all paragraphs to be a different colour, you added
`<font>` tags to every single paragraph. Thousands of tags. Impossible to maintain.

**The CSS solution (1996):**

Separate the concerns:
- HTML describes WHAT the content is (a heading, a paragraph, a list)
- CSS describes HOW it looks (colour, size, spacing)

```html
<!-- HTML: structure only -->
<h1>Hello</h1>
<p>A paragraph.</p>

<!-- CSS: appearance only -->
h1 { color: navy; }
p { color: grey; }
```

Change the colour of every paragraph on a 500-page site: edit ONE CSS rule. With inline HTML
attributes, you would edit 5,000 tags.

**This is not just a technical choice.** It is a design principle that applies everywhere:
separate what something IS from what it LOOKS LIKE. You will see this in Qt stylesheets,
Android XML themes, SwiftUI modifiers — every mature UI framework separates structure from style.

---

## Step 4 — What "The Cascade" Means

The C in CSS stands for "Cascading." This is the mechanism that decides which rule wins
when multiple rules apply to the same element.

Add this to your `<style>` block:

```html
<style>
  h1 {
    color: navy;
    font-size: 48px;
  }
  h1 {
    color: red;    /* ← same element, different colour */
  }
  p {
    color: grey;
    margin-top: 24px;
  }
</style>
```

### SAVE AND TRY

Reload the page.

**You should see:** The heading is RED — not navy. The second rule for `h1` overrode the
first.

**In DevTools Elements panel**, click the `<h1>`. In the Styles panel you should see:

```
h1 {
  color: red;
}
h1 {
  color: ~~navy~~;    ← struck through — overridden
  font-size: 48px;
}
```

The browser shows you WHICH rule won and which was overridden. This is the cascade in action.

**Change something:** Swap the order — put `color: red` FIRST and `color: navy` SECOND.
Reload. Expected: the heading is now navy — the LAST rule wins when two rules have equal
weight.

Change it back to the original order.

---

### Concept: The Cascade — Rules Have Priority

**What it is:** When multiple CSS rules apply to the same element for the same property,
the cascade determines which one wins. The winning rule is the one with the highest
priority. Priority is determined by three factors, in order:

1. **Origin** — where the rule came from (browser default, your stylesheet, or inline style)
2. **Specificity** — how precisely the selector targets the element
3. **Order** — when specificity is equal, the last rule wins

**The problem before:** Without a cascade, conflicting rules would be undefined behaviour —
different browsers could show different colours for the same element.

**The solution:** A defined algorithm. Every browser runs the same calculation, every time.
The result is always deterministic.

**What it hides:** The calculation. You do not manually score rules — the browser runs the
algorithm automatically. But when you UNDERSTAND the algorithm, you can predict the result
instead of guessing.

**Canonical example:** A company has three HR policies: the country law (highest priority),
the company handbook (medium priority), the manager's preference (lowest priority). If all
three say different things about vacation days, country law wins. The cascade works the same
way: inline styles (highest) override stylesheets (medium) override browser defaults (lowest).

**You will see this again in:**
- Every time a CSS rule "isn't working" — the cascade is the reason
- CSS frameworks like Tailwind deliberately use specificity to control the cascade
- CSS custom properties (variables) work WITH the cascade — you will use them heavily

**Watch for:** `!important` is a way to skip the cascade entirely and force a rule to win.
It is a symptom of not understanding why your rule is losing. Every `!important` in a
stylesheet is a diagnostic: something about the cascade was not understood. After T12·L3
(Specificity), you will not need `!important` again.

---

## Step 5 — Putting It Together

Update `index.html` to the complete version that demonstrates all four concepts:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Render demo</title>
    <style>
      /* The browser built a CSSOM from this */

      /* Rule 1: targets all h1 elements */
      h1 {
        color: navy;        /* triggers paint */
        font-size: 48px;    /* triggers layout + paint */
      }

      /* Rule 2: same specificity as Rule 1, comes after, so it wins for color */
      h1 {
        color: darkblue;
      }

      /* Rule 3: targets all p elements */
      p {
        color: grey;
        margin-top: 24px;   /* triggers layout: moves elements below it */
        line-height: 1.6;   /* triggers layout */
      }
    </style>
  </head>
  <body>
    <!-- The browser built a DOM from this -->
    <h1>Hello</h1>
    <p>This is a paragraph.</p>
    <p>This is another paragraph.</p>
  </body>
</html>
```

### SAVE AND TRY

Open the file in a browser.

**You should see:** "Hello" in dark blue (darkblue won over navy — same specificity, later
rule wins), and two grey paragraphs with space above each.

**In DevTools:**

1. Open Elements panel. Click `<h1>`. In Styles panel, verify `darkblue` is applied and
   `navy` is struck through.
2. Click `<p>`. Verify `margin-top: 24px` appears.
3. Click **Computed** tab (next to Styles). This shows the FINAL computed value for every
   property — the result of the cascade. Scroll to `color` — you should see `rgb(0, 0, 139)`
   (which is darkblue).

**Change something:** Add `color: red` directly to the `<h1>` tag as an inline style:

```html
<h1 style="color: red">Hello</h1>
```

Reload. Expected: heading is now red even though the stylesheet says darkblue. Inline styles
(origin: inline) beat stylesheet rules (origin: stylesheet) — even rules that come later.

Remove the inline style before continuing.

---

## 🎯 Challenge: Diagnose a Broken Stylesheet

**You know:** The DOM, the cascade, the four rendering stages.

**Task:** This HTML has a bug. The heading should be red, but it appears blue.
Using only DevTools (no code changes), diagnose WHY the heading is blue instead of red.
Write your diagnosis before looking at the solution.

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      h1 { color: blue; }
      h1 { color: blue; }
      h1 { color: blue; }
      .title { color: red; }
    </style>
  </head>
  <body>
    <h1 class="title">This should be red</h1>
  </body>
</html>
```

Open this in a browser and use DevTools to understand which rule is winning and why.

---

<details>
<summary>▶ Show Solution</summary>

**The diagnosis:**

In DevTools → Elements → click the `<h1>` → Styles panel.

You should see the `.title { color: red }` rule listed, but the `h1 { color: blue }` rule
ALSO listed — and one of them is struck through.

Wait — the `.title` rule should win because class selectors (`.title`) have HIGHER
specificity than element selectors (`h1`). So why is the heading blue?

Look more carefully at the order. If `.title { color: red }` appears BEFORE `h1 { color: blue }`
in the stylesheet, and they have the same specificity... but they DON'T have the same
specificity. A class selector beats an element selector.

**The actual bug:** If the heading is BLUE, it means the three `h1` rules are somehow
winning. This should NOT happen — `.title` should win regardless of order.

**Check the HTML:** The `<h1>` tag must actually have `class="title"` for `.title` to apply.
If the class is misspelled (`.Title`, `.TITLE`) or not applied, `.title` matches nothing
and all three `h1` rules apply — the last one wins: blue.

**The diagnosis:** Open DevTools → Elements. Click the `<h1>`. Check the Styles panel.
If `.title { color: red }` is NOT listed at all, the class is not matching. Hover over the
`<h1>` in Elements to confirm `class="title"` is present.

**Key insight:** Specificity only matters when the selector MATCHES the element. A high-specificity
rule that doesn't match does nothing. This is the most common CSS debugging scenario:
"my rule isn't applying" almost always means the selector isn't matching — not that there's
a specificity problem.

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| DOM vs HTML file | Edit text in DevTools Elements panel — file unchanged, page changes |
| Four rendering stages | Change `font-size` → paragraph moves (layout ran). Change `color` → nothing moves (only paint ran) |
| Cascade: last rule wins | Two identical selectors with different values — the later one wins |
| Inline styles win | `style="color: red"` beats any stylesheet rule |
| DevTools Computed tab | Shows final values after cascade resolution |

---

## Quick Check Answers

**1. Where does the browser store that the paragraph is red?**

In the DOM — specifically in the element's computed style. When the browser parses
`<p style="color: red">`, it builds a DOM node for the paragraph and stores the colour
property on that node's style object. The HTML file is read once and the information is
transferred to the DOM. After that, the file is not consulted again — the DOM is the source
of truth for the running page.

**2. You changed the heading's font size and the paragraph below it moved. Why?**

`font-size` triggers the layout stage (Stage 3). During layout, the browser calculates the
pixel position of every element. The paragraph's position depends on the heading's height.
When the heading got taller (larger font size), the calculation for the paragraph's Y
position changed — it needed more space, so it moved down. You did not touch the paragraph;
the browser recalculated its position because its input (heading height) changed.

**3. Why are HTML and CSS separate languages?**

Separation of concerns: HTML describes WHAT content is (structure); CSS describes HOW it
looks (presentation). Mixing them, as early HTML did with `<font>` and `<center>` tags,
makes both harder to maintain. To change the appearance of 1,000 paragraphs, you edit one
CSS rule instead of 1,000 HTML tags. This principle — separate what something IS from
what it LOOKS LIKE — appears in every mature UI framework: Qt stylesheets, Android themes,
SwiftUI modifiers.
