# Video Notes — Lesson 01 — The App Shell

## What You Will Build

A static, three-part layout: a video list on the left, a player area in the
middle, and a notes panel on the right — the visible skeleton of everything
this series builds. Nothing is dynamic yet. One fake video title sits in the
list, a placeholder message sits where the player will go, and another sits
where notes will go. This lesson is entirely HTML and CSS; JavaScript has not
entered the project yet, because nothing here needs it yet.

---

## What You Need to Know First

Nothing. This is the first lesson. If you have never written HTML or CSS
before, every term below is explained the moment it appears.

---

## Concept: What HTML Lab Actually Is

**HTML Lab** is the tool this entire project is built in — a browser-based
editor with no installation step, no terminal, and no separate program to
open. Everything you type is saved automatically as you go; there is no
"save" button and nothing to lose by closing the tab and coming back later.

Open HTML Lab and click **+ New** to start a blank project. Along the top you
will see several tabs: **HTML**, **CSS**, **JavaScript**, **Tree**, **Toolbox**,
and **Lessons**. The first three are the ones this lesson uses: the **HTML**
tab holds this page's structure, the **CSS** tab holds its appearance, and
the **JavaScript** tab (empty for now) will hold its behaviour once lesson 02
needs it.

**▶ Preview**, in the top toolbar, is how you see your work actually running
— as a real, live web page, exactly as a visitor's browser would render it.
Editing HTML or CSS updates the canvas in the middle of the screen already,
but Preview is the honest test: it runs your page the same way it will run
everywhere else. Click it often. Every step in this lesson ends by telling
you what you should see there.

**Something HTML Lab does for you, worth knowing explicitly:** a full web
page needs a `<!DOCTYPE html>` declaration, an `<html>` root element, a
`<head>` section, and a `<body>` — the same boilerplate every real HTML file
needs. HTML Lab assembles all of that automatically from what you write in
the HTML, CSS, and JavaScript tabs; the HTML tab itself holds only what would
normally go *inside* `<body>`. This is not a simplification that hides
something you will need to unlearn later — it is exactly the part of a real
HTML file that never changes from project to project, generated for you so
every keystroke you type is content that actually varies.

---

## Step 1 — Build the Structure

**The problem:** Before anything can be styled or made interactive, the three
regions of this application — video list, player, notes — need to exist as
real elements.

Click the **HTML** tab and type:

```html
<div class="app">
  <aside class="video-list">
    <h2>My Videos</h2>
    <div class="video-item video-item-active">JavaScript Basics</div>
  </aside>

  <main class="player-area">
    <p class="player-placeholder">Select a video to play it here.</p>
  </main>

  <aside class="notes-panel">
    <h2>Notes</h2>
    <p class="notes-placeholder">Notes for the selected video will appear here.</p>
  </aside>
</div>
```

Click **▶ Preview**. You will see three regions stacked on top of each other,
unstyled — plain black text on a white background, in the order they appear
in the HTML. That is correct. Structure exists; appearance does not yet.

**Walkthrough:** `<div class="app">` is the outermost container — everything
in this application lives inside it. A `<div>` is the most generic block
element HTML has; it carries no meaning of its own, which is exactly right
for a container whose only job is grouping other elements together.

`<aside>` is a **semantic element** — a tag that describes *what a section of
content is for*, not just how it should look. `<aside>` means "content
related to the main content, but not the main content itself" — here, the
video list and the notes panel, both supporting the actual video playing in
the middle. `<main>` means exactly what it says: the primary content of the
page — the video player. Using the right semantic element matters beyond
style: screen readers announce `<main>` as the page's primary landmark,
letting a visually impaired visitor jump straight to it instead of tabbing
through a sidebar first.

`class="video-item video-item-active"` — an element can have more than one
class, separated by spaces. `video-item` will style every video row the same
way; `video-item-active` will style only the one currently selected
differently. Giving the *currently selected* video a second, additional
class — rather than writing an entirely separate style for "selected videos"
— means the two classes' styles simply combine on whichever element has both.

`<h2>` is used for both panel headings ("My Videos", "Notes") rather than
`<h1>` — HTML headings form a hierarchy, `<h1>` through `<h6>`, and a page
should have exactly one `<h1>` describing the whole page (added in Step 2).
`<h2>` correctly marks these as subsections of that one main heading, not
competing top-level titles.

**SE lens — placeholder text is not decoration, it is honest communication.**
"Select a video to play it here." tells a user exactly what is missing and
what to do about it. A blank rectangle communicates nothing — a user cannot
tell whether it is broken, loading, or simply empty by design. Every empty
state in this project, from here on, says what is missing and why.

---

## Step 2 — Give the Page a Title and a Real Heading

**The problem:** The browser tab currently shows no title, and the page has
no `<h1>` — the one heading that should describe the whole application.

Add one line above `.app` in the HTML tab:

```html
<h1>Video Notes</h1>
<div class="app">
  ...
```

Save. "Video Notes" now appears above the three panels.

**Walkthrough:** This `<h1>` is the one and only top-level heading for the
entire page — everything else (the `<h2>`s from Step 1) is a subsection of
it. This is not just a visual choice: browsers, screen readers, and search
engines all use heading level to understand a page's structure, the same way
a book's table of contents uses chapter and section numbers.

---

## Step 3 — Reset the Box Model

**The problem:** Every browser applies its own small set of default styles
(margins around `<body>`, default spacing around headings) that differ
slightly between browsers and get in the way of deliberate, consistent
layout.

Click the **CSS** tab and type:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

**Walkthrough:** `*` is the **universal selector** — it matches every single
element on the page. `*::before` and `*::after` are **pseudo-elements**:
content that CSS itself can insert before or after an element's real content
(not used yet in this project, but any element could have one added later,
so they need this same reset too). `margin: 0; padding: 0;` removes the
inconsistent default spacing browsers apply to elements like headings and
lists, giving every element a blank, entirely deliberate spacing which the
rest of this project's CSS controls explicitly.

`box-sizing: border-box` changes what a `width` declaration actually means.
By default (`content-box`), `width: 200px` describes only the inner content
area — add `padding: 20px` and the element becomes `240px` wide in total,
40px wider than what was declared. `border-box` makes `width: 200px` mean
the *entire visible box*, padding and border included, so the content area
shrinks to fit instead. This single line prevents an entire category of
"my layout is a few pixels off and I don't know why" bugs, and is applied in
essentially every professional CSS codebase for exactly that reason.

---

## Step 4 — Design Tokens: Colours and Spacing in One Place

**The problem:** This project will need the same handful of colours and
spacing values in dozens of places over the coming lessons. Writing the
actual colour value every time means eighteen lessons from now, changing the
background colour requires finding and editing it in eighteen different
places — and missing one leaves a visible inconsistency with no error to
point at it.

Add to the top of the CSS tab, above the reset:

```css
:root {
  --colour-page-bg:   #0f172a;
  --colour-panel-bg:  #1e293b;
  --colour-border:    #334155;
  --colour-text:      #f1f5f9;
  --colour-muted:     #94a3b8;
  --colour-accent:    #6366f1;

  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;

  --radius: 0.5rem;
}
```

**Walkthrough:** `:root` is a CSS selector matching the document's root
element — effectively the same as `html`, but conventionally used
specifically when defining values meant to apply globally. `--colour-page-bg:
#0f172a;` defines a **CSS custom property** (informally, a "CSS variable") —
a named value, defined once, readable anywhere else in the stylesheet with
`var(--colour-page-bg)`. Every property here follows one of two purposes:
`--colour-*` values are every colour this project uses; `--space-*` values
are the handful of spacing amounts used for padding and gaps, so that "a
little bit of space" and "a lot of space" mean the same measurement
everywhere they appear, rather than each panel inventing its own numbers.

**SE lens — a single source of truth.** If this project later needs a
different accent colour, exactly one line changes, and every element using
`var(--colour-accent)` updates automatically. This is not a minor
convenience: it is what makes a consistent visual design *possible* to
maintain past a handful of elements, and it is exactly the pattern lesson 16
extends to build real light/dark theme switching — themes will turn out to
be "define a second `:root`-like block with different values," which only
works because every colour was already routed through a variable from this
very first lesson.

**The rule for the rest of this project:** no hardcoded colour, size, or
spacing value anywhere else in the CSS. Every value is one of these
variables, or built from them.

---

## Step 5 — Lay Out the Three Panels

**The problem:** The video list, player, and notes panel currently stack
vertically, in source order, because that is what block-level elements do
by default. They need to sit side by side instead.

Add to the CSS tab:

```css
body {
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
  font-family: system-ui, sans-serif;
}

h1 {
  padding: var(--space-md) var(--space-lg);
  font-size: 1.25rem;
}

.app {
  display: flex;
  height: calc(100vh - 3.5rem);
}

.video-list {
  width: 220px;
  flex-shrink: 0;
  background-color: var(--colour-panel-bg);
  border-right: 1px solid var(--colour-border);
  padding: var(--space-md);
  overflow-y: auto;
}

.video-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  color: var(--colour-muted);
  cursor: pointer;
}

.video-item-active {
  background-color: var(--colour-accent);
  color: white;
}

.player-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.player-placeholder,
.notes-placeholder {
  color: var(--colour-muted);
  font-size: 0.875rem;
}

.notes-panel {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--colour-panel-bg);
  border-left: 1px solid var(--colour-border);
  padding: var(--space-md);
}
```

Click **▶ Preview**. Three panels now sit side by side, filling the height
of the window: a dark sidebar with a highlighted "JavaScript Basics" entry,
a centred placeholder message, and a matching sidebar on the right.

**Walkthrough:** `display: flex` on `.app` turns it into a **flex
container** — its direct children (`.video-list`, `.player-area`,
`.notes-panel`) become **flex items**, laid out in a row by default instead
of stacking. This is the entire mechanism behind the side-by-side layout;
nothing else in this stylesheet positions anything manually.

`width: 220px` combined with `flex-shrink: 0` on `.video-list` fixes its
width and specifically forbids Flexbox from shrinking it to make room for
other content — without `flex-shrink: 0`, a flex item is allowed to shrink
below its declared width if space is tight, which would make the sidebar's
width unreliable. `.player-area` instead gets `flex: 1` — shorthand meaning
"grow to fill whatever space remains after fixed-width siblings are
accounted for," which is exactly the behaviour a variable-width centre panel
needs.

`height: calc(100vh - 3.5rem)` sets `.app`'s height to the full viewport
height (`100vh`, where `1vh` is 1% of the browser window's visible height)
minus roughly the space the `<h1>` above it takes up — `calc()` lets a CSS
value be computed from an expression mixing different units, here a
percentage-of-viewport value and a fixed `rem` value, something neither unit
could express alone.

`align-items: center; justify-content: center;` on `.player-area` centres
the placeholder text both vertically and horizontally — `align-items`
controls the **cross axis** (vertical, for a row-direction flex container),
`justify-content` controls the **main axis** (horizontal).

`overflow-y: auto` on `.video-list` means that once enough videos exist to
exceed the sidebar's height, a scrollbar appears automatically, rather than
the list overflowing the page or being clipped invisibly.

---

## Connect the Pieces

```
HTML tab   Three regions: .video-list, .player-area, .notes-panel, inside one .app container
CSS tab    Design tokens (:root), a box-sizing reset, and a Flexbox layout using both
```

Every colour and spacing value used in Step 5 came from Step 4's variables —
nothing here is a number invented on the spot. `.video-item` and
`.video-item-active`, defined but only demonstrated on one hardcoded video
so far, are what lesson 02 reuses the moment there is a real, dynamic list
to apply them to.

---

## What Breaks Without This

**Without `box-sizing: border-box`:** Add `padding: 20px` to `.video-list`
temporarily and remove the `box-sizing` reset. The sidebar becomes `260px`
wide (`220px` declared plus `20px` padding on each side) instead of the
declared `220px` — a real, silent layout bug that only becomes obvious once
several elements' widths no longer add up the way their CSS claims they
should.

**Without `flex-shrink: 0` on the sidebars:** Temporarily add enough text to
`.player-placeholder` to force the layout to feel cramped. Without
`flex-shrink: 0`, `.video-list` and `.notes-panel` are allowed to shrink
below their declared `220px`/`280px` widths to make room — a "fixed-width"
sidebar that quietly is not actually fixed the moment content elsewhere
grows.

**Without CSS custom properties (hardcoding `#0f172a` directly in every
rule instead):** Change the background colour once, everywhere it was
written using `var(--colour-page-bg)`, by editing one line. Now imagine
doing the same after hardcoding the value directly in `body`, `.video-list`,
and `.notes-panel` separately — three edits, and a fourth, forgotten
occurrence anywhere else in the file stays the old colour with no warning.

---

## Definition of Done

- [ ] Clicking ▶ Preview shows three side-by-side panels filling the window height
- [ ] The video list shows one highlighted, hardcoded video entry
- [ ] The player area and notes panel both show placeholder text explaining what belongs there
- [ ] The CSS file contains no hardcoded colour, spacing, or radius value — every one is a `var(--...)`
- [ ] You can explain what `box-sizing: border-box` changes about what `width` means
- [ ] You can explain what makes `.app` a flex container and its children flex items
- [ ] You can explain why `.video-list` needs both `width` and `flex-shrink: 0` to stay a truly fixed width
- [ ] You can explain what a CSS custom property is and why every colour in this project routes through one
- [ ] There is nothing to commit or save — HTML Lab has already kept every change you made

---

*Next: Lesson 02 — Rendering the List. The one hardcoded video becomes many,
generated from a real array of video objects — the first line of JavaScript
this project writes, and the first time this project's data and its on-screen
appearance are two separate things kept in sync by code instead of by hand.*
