# Calculator — Lesson 01 — The Display

## What You Will Build

An HTML page with a calculator face: a dark display showing the number `0`, a
precision selector, and the page title "Calculator" in the browser tab. No
buttons yet. No logic. No TypeScript.

The point of this lesson is not the display itself — it is establishing two
things that every subsequent lesson depends on: a version-controlled project,
and a CSS design token system that makes every visual decision a named,
changeable value in one place.

When you open the page you will see:
- A dark calculator shell centred on the page
- A display area showing `0` in a monospace font, right-aligned
- No hardcoded colour or size values anywhere — every value is a CSS custom property
- A Git repository with one commit recording why this state exists

---

## Before You Begin: Version Control

Before writing a single file, you need a version control system. This is not
optional and it is not something to set up later. Its value begins the moment
the first file is written.

### What version control is and why it exists

Version control records every change made to a project as a named snapshot in
time. Each snapshot has a message explaining why it was taken. This gives you
four capabilities nothing else provides:

**Return to any prior state.** If you break something and cannot work out how
to fix it, you restore the exact state from before you broke it — not an
approximation, the exact state.

**See what changed and why.** You can inspect the difference between any two
snapshots and read the message that explains the reason for each change. Six
months from now, when you ask "why is this code here?", the history tells you.

**Work on two things at once without mixing them.** You can create a separate
line of development — called a *branch* — for each new feature, and merge
them back when they are ready. The main branch stays clean.

**Understand your own history.** For a learner working alone, this matters
most. You will make wrong decisions. You will change your mind. The history
is how you learn from that — not from memory, but from record.

Git is the version control system used by almost all professional software
development today. It was created by Linus Torvalds in 2005 to manage the
Linux kernel — one of the largest open-source codebases in existence. When
you push code to GitHub or GitLab, you are pushing a Git repository. Learning
Git is not learning a tool that might change — it is learning the vocabulary
of collaborative software development.

### The three states of a file

At any point, a file tracked by Git is in one of three states:

**Modified** — you have changed the file, but Git does not yet know about the
change. The change exists only in your working directory.

**Staged** — you have marked the change for inclusion in the next snapshot.
Git knows about the change and has set it aside, but has not yet recorded it
permanently. The staging area exists so that you can group related changes
together even if you made them at different times.

**Committed** — the change has been permanently recorded in the repository's
history. It now has a unique identifier — a 40-character hash — and can
always be retrieved exactly as it was.

### The commands

**`git init`** — creates a Git repository in the current folder. Git creates
a hidden `.git` directory that stores the entire history of every commit.
You run this once per project. It requires no internet connection — the
repository is entirely local until you choose to push it to a remote host
like GitHub.

**`git add <file>`** — stages a file. Git reads the current state of
`<file>` and marks it for the next commit. If you change `<file>` again
after staging, you need to `git add` it again — staging captures the file
at the moment of the `add` call, not at the moment of the commit.

**`git commit -m "message"`** — records all staged files as a permanent
snapshot. The `-m` flag provides the commit message inline. Every commit is
stored permanently — you cannot lose it unless you explicitly delete it.

### What a commit message should communicate

The commit message is not a description of which files changed. Git records
that automatically. The message exists to communicate what Git cannot record:
*why this state is worth saving*.

"Add display" describes files. It tells nothing about purpose or context.

"Establish the calculator shell and CSS design token system: every visual
decision is a named variable, changeable in one place" explains what now
exists and what it enables. A reader who has never seen this project
understands the intent.

Write messages as if you are explaining your decision to yourself six months
from now, when you have forgotten what this week looked like.

### What `.gitignore` is

`.gitignore` is a file that tells Git which files and directories it should
never track. When you install packages in lesson 02, a `node_modules/`
directory will appear containing hundreds of thousands of files — the source
code of every package the project depends on. These must never be committed:
they make the repository enormous, and they do not need to be committed because
they can always be regenerated exactly from `package.json` by running
`npm install`. The same `package.json` on any machine produces the same
`node_modules/`.

The `.gitignore` entry for `node_modules/` will be added in lesson 02. For
now, the project has no packages.

### Initialise the repository

Open a terminal in the folder you will use for this project and run:

```
git init
```

You will see:

```
Initialized empty Git repository in /path/to/your/project/.git/
```

The `.git/` directory now exists. Do not edit or delete it. It is the
repository.

---

## What You Need to Know First

No prior lessons. This is lesson one.

You will write HTML and CSS in this lesson. If you have not written them
before:

**HTML** is a structure language. You write tags (`<div>`, `<span>`,
`<select>`) to describe what exists on the page. HTML does not describe how
things look — that is CSS's job. HTML does not describe what things do — that
is JavaScript's job. These three concerns are intentionally separate.

**CSS** controls appearance: colours, sizes, fonts, layout. It targets HTML
elements by their tags, classes, and IDs, and applies visual rules to them.

The separation is a design principle called *separation of concerns*. It
exists because the reasons you change structure, appearance, and behaviour
are different. If you mix them — putting colour values inside HTML tags, or
layout logic inside JavaScript — changing one requires changing all three.
Keeping them separate means a colour change is a CSS-only change.

---

## Concept: How a Browser Turns a File into a Page

Before writing any code, understand what the browser actually does when you
open an HTML file. This is the pipeline every web page goes through:

```
1. Parse HTML        The browser reads the HTML file character by character
                     and builds an in-memory tree of objects called the DOM
                     (Document Object Model). Every tag becomes a node in
                     the tree.

2. Load CSS          When the parser encounters <link rel="stylesheet">,
                     it fetches the CSS file and builds a separate tree
                     called the CSSOM (CSS Object Model).

3. Build render tree The DOM and CSSOM are combined. Each visible element
                     gets the CSS rules that apply to it.

4. Layout            The browser calculates the position and size of every
                     element on the page — this is where flexbox, widths,
                     heights, and margins are resolved.

5. Paint             The browser converts the layout into pixels. This is
                     where colours appear.

6. Composite         Layers are assembled and sent to the screen.
```

*DOM* stands for Document Object Model. The DOM is the browser's live,
in-memory representation of the HTML document. TypeScript interacts with
the page through the DOM — `document.getElementById('display')` is a DOM
query: "find the node in the DOM tree whose `id` attribute is `'display'`."

This pipeline matters because it explains why CSS must be linked in `<head>`
before `<body>`: if the browser paints before CSS loads, the page flashes
with no styling. It explains why `<script>` tags that manipulate the DOM
are placed at the end of `<body>`: the DOM must exist before JavaScript
tries to read it.

---

## Concept: The CSS Box Model

Every HTML element is a rectangular box. The box has four layers:

```
┌─────────────────────────────────────────┐
│                 margin                  │  space outside the border
│  ┌───────────────────────────────────┐  │
│  │             border                │  │  the visible edge
│  │  ┌─────────────────────────────┐  │  │
│  │  │          padding            │  │  │  space between border and content
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │       content         │  │  │  │  text, images, child elements
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**The `box-sizing` problem:**

By default (`box-sizing: content-box`), `width: 300px` means the *content*
is 300px wide. Add `padding: 20px` and the element is now 340px wide.
Add `border: 1px` and it is 342px wide. The declared width and the actual
width disagree.

`box-sizing: border-box` makes `width: 300px` mean the element — including
padding and border — is 300px wide. The content area shrinks to accommodate
them. The declared width is the actual width. This is almost always what
you want.

The fix is applied globally with `*` (the universal selector, which matches
every element):

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

`*::before` and `*::after` are *pseudo-elements* — content injected by CSS
before or after an element's content. They need `border-box` too because
they participate in layout.

This reset is included in every professional CSS project. It is not optional
— it is the first rule you write.

---

## Concept: CSS Custom Properties (Design Tokens)

A *CSS custom property* is a named value defined once and used everywhere.
You define it with a double-dash prefix and read it with `var()`:

```css
:root {
  --colour-display-background: #0f3460;
}

.display {
  background-color: var(--colour-display-background);
}
```

`:root` is a CSS pseudo-class that matches the root element of the document
— the `<html>` tag. Custom properties defined on `:root` are accessible to
every element on the page because every element is a descendant of `:root`.
CSS properties cascade downward through the DOM tree.

**Why not write the colour directly?**

If `#0f3460` appears in twelve rules and you want to change the display
colour, you change twelve rules — and miss at least two. With a custom
property, you change it once. Every rule that reads `var(--colour-display-background)`
updates automatically.

This is the *single source of truth* principle: each design decision is
recorded in exactly one place. When you want to know what colour the display
is, you read one line. When you want to change it, you change one line.

**TypeScript reads CSS custom properties:**

```typescript
getComputedStyle(document.documentElement)
  .getPropertyValue('--colour-display-text')
```

This matters from lesson 02 onward: when TypeScript draws on the canvas, it
reads colours from CSS rather than maintaining a separate copy. The CSS
theme and the drawn output always agree.

**Real-world connection — design tokens at scale:**

This exact pattern is how every major design system works. Google's Material
Design 3 defines its entire colour system as CSS custom properties:
`--md-sys-color-primary`, `--md-sys-color-on-surface`. GitHub's Primer design
system defines colours, spacing, and typography as variables. Shopify's
Polaris does the same. When a designer says "update the brand colour," the
engineer changes one variable. No search, no missed instances.

The requirement in this project is absolute: **no hardcoded colour, size,
or spacing value anywhere in CSS or TypeScript**. Every value is a custom
property. This is not a preference — it is an architectural decision that
prevents an entire class of maintenance problems.

---

## Concept: Why Calculator Displays Use Monospace Fonts

A *monospace font* is a font where every character occupies exactly the same
horizontal width. `1` is as wide as `8`. `0` is as wide as `.`.

```
Proportional:  1 1 1 1 1    ← narrow characters close together
Monospace:     1 1 1 1 1    ← every character the same width
```

In a calculator display, numbers change as the user types. If digits have
different widths (proportional font), the display shifts horizontally as
digits appear or disappear — `1111` is narrower than `8888`, so the display
appears to jitter. With a monospace font, every digit occupies the same
space. The display is stable.

This is the reason terminal windows, code editors, and scientific
calculators all use monospace fonts. Alignment and predictability matter
more than aesthetics.

Common monospace fonts: `Courier New` (universal, installed on all systems),
`Consolas` (Windows), `Menlo` (macOS), `monospace` (browser fallback to
the system default).

A *font stack* lists fonts in preference order. If the first is unavailable,
the browser tries the next:

```css
font-family: 'Courier New', Consolas, monospace;
```

The final `monospace` is the *generic family name* — a guaranteed fallback
that resolves to whatever monospace font the system provides.

---

## Step 1 — Create the HTML Structure

**The problem:** We need a page the browser can open. The HTML defines
the skeleton — what elements exist and how they are nested.

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator</title>
  <link rel="stylesheet" href="src/style.css">
</head>
<body>
  <div class="calculator">

    <div class="precision-bar">
      <label class="precision-label" for="precision-select">Precision</label>
      <select class="precision-select" id="precision-select">
        <option value="2">2 sig. fig.</option>
        <option value="4">4 sig. fig.</option>
        <option value="6">6 sig. fig.</option>
        <option value="8">8 sig. fig.</option>
        <option value="10" selected>10 sig. fig.</option>
      </select>
    </div>

    <div class="display">
      <span class="display-value">0</span>
    </div>

  </div>
</body>
</html>
```

Open `index.html` in a browser now. You see unstyled elements — grey
background, default text, no layout. That is correct. The structure exists;
the appearance does not yet. This is a working page at its most minimal.

**Walkthrough — what each line does:**

`<!DOCTYPE html>` is a declaration, not an HTML tag. It tells the browser
"this document uses the HTML5 standard." Without it, browsers enter *quirks
mode* — a compatibility mode for documents written before the HTML standard
was unified, where many CSS properties behave unexpectedly. Always include it.

`<html lang="en">` is the root element. Every other element is a descendant
of this one. The `lang="en"` attribute declares the document's language.
Screen readers use it to choose a voice. Search engines use it to understand
which audience the page is for. Spell checkers use it. It costs nothing to
include; the cost of omitting it is invisible but real.

`<meta charset="UTF-8">` declares the character encoding. *UTF-8* is a
character encoding standard that can represent every character in every
human language using one to four bytes per character. Without it, the
browser guesses — and guesses wrong for any text containing non-ASCII
characters (accented letters, mathematical symbols, non-Latin scripts).
Always declare it, always use UTF-8.

`<meta name="viewport" content="width=device-width, initial-scale=1.0">`
controls how the page scales on mobile devices. Without it, mobile browsers
assume the page is designed for a desktop and scale it down to fit — your
calculator appears tiny and unreadable. `width=device-width` tells the
browser to make the layout width match the device's screen width.
`initial-scale=1.0` sets the initial zoom to 100%. Every page that should
be usable on a phone needs this.

`<link rel="stylesheet" href="src/style.css">` tells the browser to load
the CSS file. `rel="stylesheet"` identifies the relationship: this linked
file is a stylesheet. `href="src/style.css"` is the *relative path* from
`index.html` to the CSS file — it lives in the `src/` subdirectory relative
to `index.html`. When the browser encounters this tag, it fetches the file
before continuing to render the page body.

`<select id="precision-select">` is a dropdown element. The `id` is used by
TypeScript in lesson 05 to read the selected precision. The `<option>` elements
are the available choices. `selected` on the last option makes it the default.
This element is inert for now — it appears but nothing responds to changes until
lesson 05.

`<span class="display-value">0</span>` is an inline element containing the
display text. The number `0` is hardcoded here for now. TypeScript will
replace it dynamically starting from lesson 03.

**SE lens — IDs and classes serve different masters:**

Both `.display-value` and `#display-value` exist on the same element. The
class is for CSS: `.display-value { font-size: ... }`. The ID is for
TypeScript: `document.getElementById('display-value')`. Keeping them separate
means renaming the CSS class (a styling decision) never breaks the TypeScript
(a behaviour dependency). The two concerns evolve independently.

---

## Step 2 — Write the CSS

**The problem:** The HTML structure is visible but has no appearance.
The calculator needs dimensions, colours, and layout.

Create `src/style.css`:

```css
/* ── Reset ──────────────────────────────────────────────────────────────── */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Design tokens ──────────────────────────────────────────────────────── */
/* Every colour, size, and spacing value in this project is defined here.   */
/* Nothing else in CSS or TypeScript contains a hardcoded value.            */

:root {
  /* Colours */
  --colour-page-background:      #0f0f23;
  --colour-calculator-surface:   #1e293b;
  --colour-display-background:   #0f3460;
  --colour-display-text:         #e2e8f0;
  --colour-border:                #334155;
  --colour-precision-text:        #64748b;

  /* Typography */
  --font-display:    'Courier New', Consolas, monospace;
  --font-ui:          system-ui, sans-serif;
  --size-display:     2.5rem;
  --size-precision:   0.75rem;

  /* Spacing */
  --space-sm:   0.5rem;
  --space-md:   1rem;
  --space-lg:   1.5rem;

  /* Dimensions */
  --width-calculator:  320px;
  --radius-calculator: 0.75rem;
  --radius-display:    0.5rem;
}

/* ── Page ───────────────────────────────────────────────────────────────── */

body {
  background-color: var(--colour-page-background);
  font-family:      var(--font-ui);
  display:          flex;
  align-items:      center;
  justify-content:  center;
  min-height:       100vh;
  margin:           0;
}

/* ── Calculator shell ───────────────────────────────────────────────────── */

.calculator {
  background-color: var(--colour-calculator-surface);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-calculator);
  padding:          var(--space-lg);
  width:            var(--width-calculator);
}

/* ── Precision bar ──────────────────────────────────────────────────────── */

.precision-bar {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             var(--space-sm);
  margin-bottom:   var(--space-sm);
}

.precision-label,
.precision-select {
  color:       var(--colour-precision-text);
  font-size:   var(--size-precision);
  font-family: var(--font-display);
}

.precision-select {
  background-color: var(--colour-page-background);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-display);
  padding:          0.2rem var(--space-sm);
  cursor:           pointer;
}

/* ── Display ────────────────────────────────────────────────────────────── */

.display {
  background-color: var(--colour-display-background);
  border-radius:    var(--radius-display);
  padding:          var(--space-md) var(--space-lg);
  min-height:       4rem;
  display:          flex;
  align-items:      center;
  justify-content:  flex-end;
}

.display-value {
  color:          var(--colour-display-text);
  font-family:    var(--font-display);
  font-size:      var(--size-display);
  letter-spacing: 0.05em;
}
```

Save and open `index.html`. A dark calculator shell appears centred on the
page. The display shows `0` in a monospace font. The precision selector sits
above it.

**Walkthrough — what the layout rules do:**

`body { display: flex; align-items: center; justify-content: center; min-height: 100vh; }`

`display: flex` turns the body into a *flex container*. Its direct children
— in this case, the single `.calculator` div — become *flex items*. Flexbox
is a layout mode designed for distributing space along one axis (row or
column, defaulting to row).

`align-items: center` centres flex items along the *cross axis* — the axis
perpendicular to the main axis. For a row layout, the cross axis is vertical.
This centres the calculator vertically.

`justify-content: center` centres flex items along the *main axis* — the
primary direction of the flex layout. For a row layout, this is horizontal.
This centres the calculator horizontally.

`min-height: 100vh` sets the body's minimum height to `100vh`. `vh` is a
*viewport unit*: `1vh` equals 1% of the browser window's visible height.
`100vh` is the full visible height. Without this, the body would be only
as tall as its content — the calculator — and flexbox centring would have
nothing to centre within.

**CS lens — flexbox as a layout algorithm:**

Flexbox is an algorithm that distributes space. Before flexbox, centring an
element required either table tricks or absolute positioning with negative
margins — both fragile and hard to reason about. Flexbox makes the
distribution explicit: `justify-content` and `align-items` are the two axes
of control, and every possible distribution has a named value.

The same algorithm powers every modern UI framework: React Native uses
flexbox for all layout. Flutter uses a flexbox-inspired system. The browser's
default layout algorithm (block flow) predates the web as an application
platform; flexbox was designed for it.

**CS lens — `rem` as a relative unit:**

`2.5rem` is not 2.5 pixels. `rem` stands for *root em* — a multiple of the
root element's font size. By default, browsers set the root font size to
`16px`. So `1rem = 16px`, `2.5rem = 40px`.

Using `rem` rather than `px` means the calculator scales correctly when the
user changes their browser's font size setting (an accessibility feature used
by people with visual impairments). Hard pixel values do not scale.
`rem` values do.

---

## Connect the Pieces

```
index.html          Structure — does not change after this lesson
src/style.css       Design tokens — extended whenever a new UI element appears
```

The HTML scaffold built here is permanent. The IDs (`precision-select`,
`display-value`) are how TypeScript will find these elements from lesson 02
onward. The CSS tokens defined in `:root` are read by every subsequent lesson
that adds visual elements. When lesson 09 adds a DEG/RAD toggle, it uses
`--colour-display-text`. When lesson 11 adds a canvas for the coordinate
plane, it reads `--colour-border`. Nothing is hardcoded; everything extends
the token system established here.

---

## What Breaks Without This

**Without `box-sizing: border-box`:**

Add `padding: 20px` to `.calculator`. With `content-box`, the calculator
becomes `320px + 40px = 360px` wide — wider than declared. Layout breaks
silently. With `border-box`, `320px` means `320px` regardless of padding.
Every CSS project in production uses this reset. Omitting it is the source
of layout bugs that are difficult to diagnose because the element appears to
be the wrong size when it is technically at its declared size.

**Without CSS custom properties:**

Change `--colour-display-background` to a bright colour. Every rule using
`var(--colour-display-background)` updates immediately. Now remove the
custom property and hardcode `#0f3460` directly in `.display`. Make the
same colour change. You must find every occurrence. Miss one and the display
and the calculator shell show different blues — a visual inconsistency with
no error message, invisible in the CSS, visible only in the rendered page.

**Without `min-height: 100vh` on `body`:**

The flexbox centring works — but only if the body is tall enough to centre
within. Without `min-height: 100vh`, the body is exactly as tall as the
calculator, and there is no vertical space in which to centre it. The
calculator appears at the top-left of the page instead of the centre.

---

## Definition of Done

- [ ] The browser tab title reads "Calculator"
- [ ] A dark calculator shell is centred on the page
- [ ] The display shows `0` in a monospace font, right-aligned
- [ ] The precision selector is visible above the display
- [ ] `src/style.css` contains no hardcoded colour or size values — every value is `var(--...)`
- [ ] Changing `--colour-display-background` in CSS changes the display colour on page refresh
- [ ] You can explain what a CSS custom property is and why it exists
- [ ] You can explain what `box-sizing: border-box` does and what breaks without it
- [ ] You can explain what `display: flex`, `justify-content: center`, and `align-items: center` do together
- [ ] You can explain what `100vh` means and why it is needed here
- [ ] You can explain why calculator displays use monospace fonts
- [ ] You can explain what `<!DOCTYPE html>` is and what happens without it
- [ ] You can explain what `lang="en"` communicates and who reads it
- [ ] You can explain what `meta charset="UTF-8"` does and what breaks without it
- [ ] You can explain what `meta viewport` does and why it matters
- [ ] You can explain the three states of a Git file: modified, staged, and committed
- [ ] You can explain what a good commit message communicates that Git does not record automatically
- [ ] Run: `git add index.html src/style.css` then commit:
      `git commit -m "Establish calculator shell and CSS design token system: every visual decision is a named variable in one place"`

---

*Next: Lesson 02 — Buttons and Types. The button grid appears. TypeScript
enters the project for the first time — at the exact moment the first logic
file is needed, not before. The reason TypeScript exists is demonstrated
before a single type annotation is written.*
