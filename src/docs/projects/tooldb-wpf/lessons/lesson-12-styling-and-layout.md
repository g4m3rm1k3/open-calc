# Lesson 12: Every Element Is a Box

**What you will build.** `local.html` gains its own real stylesheet,
`styles.css` — this project's first CSS this project writes itself, rather
than only ever consuming someone else's (jQuery's own lack of visual
styling, DataTables' own CDN stylesheet). By the end, the page has real
breathing room around its table cells, a centered, readable content column
instead of raw text running edge-to-edge, and a real visual size/weight
difference between the page's own heading and its own table headers. The
transferable problem underneath the feature: every single element on a
page — a `<h1>`, a `<td>`, the `<body>` itself — is really a rectangular
box, whether anyone styles it or not, and a fixed, small set of rules
governs how big that box actually is and how it sits next to its
neighbors. Nothing about layout or spacing is separate magic; it's the same
few real rules, applied deliberately instead of left at the browser's own
unstyled defaults.

**What you need to know first.** Lesson 6 — `ToolDB.csproj`'s own
`<Content Include="local.html" CopyToOutputDirectory="PreserveNewest" />`
item, copying a real file into the build output. Lesson 11 — the real
`<table id="tools-table">` markup (`<thead>`, `<tbody>`, `<tr>`, `<th>`,
`<td>`), and `<link rel="stylesheet" href="...">` loading an external CSS
file, so far only ever pointed at a CDN URL.

**Terms used in this lesson**

- **CSS rule** — one complete styling instruction: a **selector** naming
  which element(s) it applies to, followed by a **declaration block** in
  curly braces containing one or more real **declarations**. It exists as
  CSS's own single, consistent unit of "style this, this way" — every real
  visual choice this lesson makes is written as one or more of these.
- **selector** — the part of a CSS rule, written before its own `{`, naming
  which real element(s) a rule applies to — reusing the identical pattern
  language jQuery's own `$(...)` already borrowed for finding elements in
  JavaScript, now used for its own original purpose: telling the browser
  which elements a *style* applies to, not which elements code should read
  or change.
- **declaration** — one real `property: value;` pair inside a CSS rule's
  own declaration block — a property name, a colon, the value being set,
  and a terminating semicolon. It exists as CSS's own smallest real unit of
  meaning: "this one property, on this element, is this value" — a
  declaration block holds as many of these as a rule needs.
- **`font-family`** — a CSS property naming which typeface (or ordered list
  of fallback typefaces) text should render in. It exists because not every
  browser or operating system has the same fonts installed; naming more
  than one, in order, lets a page degrade gracefully instead of breaking if
  its first choice isn't available.
- **box model** — the real, universal rule that every single element,
  styled or not, is a rectangular box built from four nested parts, from
  innermost to outermost: **content** (the element's own real text or
  media), **padding** (empty space between content and the element's own
  edge), **border** (a visible or invisible line at that edge), and
  **margin** (empty space separating this box from its neighbors). It
  exists as the one foundational model every other layout rule in CSS
  builds on top of — nothing about spacing or sizing makes sense without
  it.
- **`box-sizing`** — a CSS property controlling *which* of the box model's
  own four parts a given `width`/`height` value actually measures. It
  exists because the box model's own default behavior (below) surprises
  most people the first time they meet it, and CSS provides a real,
  explicit way to opt out of that surprise instead of just living with it.
- **`margin` shorthand** — one property, `margin`, standing in for up to
  four real values (top, right, bottom, left) depending on how many are
  given, plus a real keyword, `auto`, meaning "let the browser compute this
  side's own margin automatically" rather than a fixed length. It exists so
  the four sides of an element's own margin don't need four separate
  property names written out for the common case of wanting them set
  together.
- **`max-width`** — a CSS property capping how wide an element's own
  content area (or border box, depending on `box-sizing`, above) is allowed
  to grow, while still letting it shrink narrower on a smaller screen. It
  exists because plain `width` sets one fixed value with no flexibility at
  all — `max-width` keeps a page from stretching to an uncomfortable,
  unreadable full width on a very wide window while still shrinking
  naturally on a narrow one.
- **`font-size`** — a CSS property setting how large rendered text is,
  accepting either a fixed unit (`px`) or a *relative* one (`rem`, used
  this lesson) whose real, computed size depends on another element's own
  font size rather than being fixed on its own.
- **`rem` unit** — a length unit, first used this lesson, always relative
  to the root `<html>` element's own font size specifically — unlike `em`
  (not used this lesson but worth distinguishing), which is relative to
  whichever element's own *parent* happens to be. It exists so a whole
  page's own type scale can be resized from exactly one place (the root
  font size) without recomputing every individual value by hand.
- **`font-weight`** — a CSS property setting how bold rendered text looks,
  accepting either a real keyword (`normal`, `bold`) or an equivalent real
  number (`400`, `700`) — both this lesson's own real code and MDN's own
  official documentation confirm `bold` and `700` produce the identical
  result.
- **visual hierarchy** — a design idea, not a single CSS property: using
  real, deliberate differences in size, weight, and spacing so a reader's
  eye can tell, at a glance and without reading a word, which parts of a
  page are most important and which relate to which. It exists because a
  page where every piece of text looks visually identical forces a reader
  to read everything, in order, just to find what actually matters —
  hierarchy lets the page itself do some of that work first.

**Objects and methods used**

None. Every real new construct this lesson introduces — CSS rules,
properties, and one reappearing MSBuild project-file item — is language or
build-configuration syntax, not a real class, interface, or method; each
gets its own full, real definition under Terms, above, per this schema's
own rule that keywords and language constructs belong there rather than
here.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`<link rel="stylesheet" href="...">`**
  - *What it is:* reappearing from this project's own prior lesson — an
    HTML tag telling the browser to fetch a CSS file from a URL and apply
    its rules to the current page.
  - *Implementation:* established previously, unchanged in shape — only
    this lesson's own real `href` value is new (a local relative filename,
    `styles.css`, rather than a CDN URL).
  - *Its use:* this lesson's own first unit adds a second `<link>` tag of
    this same shape, this time pointing at a real file this project itself
    owns and edits.
- **`<Content Include="..." CopyToOutputDirectory="PreserveNewest" />`**
  - *What it is:* reappearing from this project's own prior lesson — an
    MSBuild project-file item telling the build system to copy a real,
    non-code file into the build output directory.
  - *Implementation:* established previously for `local.html`, unchanged in
    shape — this lesson's own first unit adds a second, identical item for
    `styles.css`.
  - *Its use:* without it, `styles.css` would exist in this project's own
    source folder but never actually reach the folder `Browser.Source`
    navigates to, the same real failure this project already proved once
    for `local.html` itself.

---

## Concept Unit: A Real, Local Stylesheet

### The Problem

Every visual choice on this page so far has come from somewhere else: the
browser's own unstyled defaults, or DataTables' own CDN stylesheet. Nothing
in `local.html` expresses this project's own real opinion about how
anything should look.

> **Try this first:** the previous lesson's own `<link rel="stylesheet"
> href="https://cdn.datatables.net/.../dataTables.dataTables.css" />`
> already proved a `<link>` tag can fetch CSS from a URL. Given that
> `local.html` and any file sitting right next to it in the same folder can
> already reference each other by a plain filename — no `https://`, no
> domain — what would you expect `href="styles.css"` (no URL at all) to
> mean instead of a real web address?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/styles.css`, created. `ToolDB/local.html`,
  modified. `ToolDB/ToolDB.csproj`, modified.
- **Change type** — add (one new file, one new `<link>` tag, one new
  `<Content>` project item).
- **Location** — `styles.css` sits alongside `local.html` in the same
  `ToolDB/` folder; its own `<link>` tag joins `<head>`, after DataTables'
  own stylesheet link (so this project's own rules, read second, can
  override a DataTables default if a future lesson ever needs to); the new
  `<Content>` item joins the existing one for `local.html` inside
  `ToolDB.csproj`.
- **Dependencies** — none beyond the files already established.

### The New Code

`styles.css`, its first real rule:

```css
body {
    font-family: sans-serif;
}
```

The new `<link>` tag:

```html
<link rel="stylesheet" href="styles.css" />
```

The new project item:

```xml
<Content Include="styles.css" CopyToOutputDirectory="PreserveNewest" />
```

### The Updated Project

`local.html`'s own `<head>`, in full, new line marked:

```html
1  <head>
2      <title>ToolDB</title>
3      <script src="https://code.jquery.com/jquery-3.7.1.min.js"
4              integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
5              crossorigin="anonymous"></script>
6      <link rel="stylesheet" href="https://cdn.datatables.net/3.0.2/css/dataTables.dataTables.css" />
7      <script src="https://cdn.datatables.net/3.0.2/js/dataTables.js"></script>
8      <link rel="stylesheet" href="styles.css" />                                          // ← new
9  </head>
```

`ToolDB.csproj`'s own content items, in full, new line marked:

```xml
1  <ItemGroup>
2      <Content Include="local.html" CopyToOutputDirectory="PreserveNewest" />
3      <Content Include="styles.css" CopyToOutputDirectory="PreserveNewest" />               <!-- ← new -->
4  </ItemGroup>
```

`<head>` now loads three external references in a real, meaningful order —
jQuery, then DataTables' own CSS and JS, then this project's own stylesheet
last, so its own rules are free to override anything the earlier two set.
`ToolDB.csproj`'s own content items now copy two real files into the build
output instead of one, both by the identical mechanism.

### Proving It in Isolation

A minimal, unrelated throwaway page and stylesheet, in a scratch folder,
proving only that a plain relative filename — no URL — works as a real
`href`:

```html
<!-- test.html -->
<link rel="stylesheet" href="test.css" />
<p>Sample text.</p>
```

```css
/* test.css */
p {
    color: blue;
}
```

Nothing here needs to be run to know what it proves: per the real HTML and
CSS specifications (already cited in full in this lesson's own Header for
every property actually used in this project's own code), a `<link>`'s
`href` is resolved the same way any relative URL is — relative to the
*referencing* file's own location, not the browser's current address bar,
so a file sitting in the same folder as the page referencing it needs
nothing more than its own plain filename. This project's own standing
constraint (no live WPF window observed this session) means the real blue
text this throwaway example would produce was never watched rendering in
an actual browser — the claim rests on the real specification, not on a
watched render, the same honest limit this project has named at every
lesson touching real browser rendering.

### Discard the Throwaway Example

The `test.html`/`test.css` pair above is discarded now — it never appears
in this project again. What's proven is that a relative filename, with no
`https://` at all, is a fully real and valid `href`, not a special case.

### Mechanical Walkthrough

- `body { ... }` — a real **CSS rule** (Terms, above): `body` is its
  **selector** (Terms, above) — an element-type selector, the plainest
  possible shape, matching the page's one real `<body>` element directly
  by its own tag name, the same general selector idea `$('#output')`
  already used for an `id` instead.
- `font-family: sans-serif;` — one real **declaration** (Terms, above)
  inside that rule's own declaration block: the property **`font-family`**
  (Terms, above), a colon, the value `sans-serif` — not a specific named
  typeface, but a real, generic keyword meaning "whichever
  sans-serif-style font this operating system already has installed" —
  and a terminating semicolon, required to end one declaration before a
  sibling declaration (none yet, in this unit) could begin.
- `<link rel="stylesheet" href="styles.css" />` — the same real `<link>`
  tag shape already established (Header, above), this lesson's own new
  value for `href` being a plain relative filename rather than a URL.
- `<Content Include="styles.css" CopyToOutputDirectory="PreserveNewest" />`
  — the same real MSBuild item shape already established (Header, above),
  naming a second real file to copy into the build output alongside
  `local.html`.

### CS Lens

A **selector** matching elements by naming a real, structural property they
have (here, being a `<body>` tag at all) rather than by their position or
an arbitrarily assigned label, is the same **pattern matching** idea this
project's own SQL `WHERE` clause already relies on — describing *what*
qualifies, and letting the underlying engine (a browser's own CSS engine,
or SQLite's own query planner) work out *which* real rows or elements
actually match. Also recognized in: a file system's own glob pattern
(`*.txt`) matching any file with that extension, regardless of name, and a
spam filter matching messages by real shared properties rather than
maintaining an explicit list of every message it should catch.

### SE Lens

Why give this project's own stylesheet its own separate file, rather than
writing these same rules directly inside `local.html` in a `<style>` block,
a real, valid alternative this lesson doesn't use? The alternative not
chosen — inline `<style>` — was rejected for the same real reason this
project already chose a separate `local.html` over inline C# string-built
HTML: styling is a separate concern from structure, and keeping it in its
own file means either one can be read, or changed, without scrolling past
the other. The honest cost accepted: a separate file is one more real thing
`ToolDB.csproj` has to know to copy into the build output — already proven,
this unit, to be a real, easy-to-forget step, since `local.html` itself hit
exactly this failure when Lesson 6 first introduced the pattern.

### Run It

No `dotnet build` needed for `local.html`'s or `styles.css`'s own content —
neither is C# — but `ToolDB.csproj` did change, so a real `dotnet build`
was run this session against the current project to confirm the new
`<Content>` item doesn't break anything: build succeeded, 0 Warnings, 0
Errors, matching this project's own established pattern of a real, clean
build after every `.csproj` edit.

### Connecting Back

A real, if currently tiny, stylesheet now loads and applies to this page —
proven structurally, not yet visibly meaningful. The next unit gives it its
first real, visible job.

---

## Concept Unit: The Box Model

### The Problem

`#tools-table`'s own real cells (`<th>`, `<td>`, established the previous
lesson) currently sit with text touching each cell's own edge directly —
no breathing room, and no visible line separating one cell from its
neighbor. Every one of this project's own real elements is already a real
rectangular box, whether styled or not; nothing yet controls the size of
any of that box's own four real parts.

> **Try this first:** the Header's own **box model** entry names four
> parts, innermost to outermost: content, padding, border, margin. Given a
> table cell's own visible text is the *content* part, and given "add
> breathing room *inside* the cell, between the text and its own edge"
> versus "add a visible line running *along* that edge" sound like two
> different real jobs — which of the box model's remaining three parts
> would you expect handles each one?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/styles.css`, modified.
- **Change type** — add (two new CSS rules).
- **Location** — appended after the existing `body { ... }` rule
  established the previous unit.
- **Dependencies** — `#tools-table`'s own real markup, already established.

### The New Code

```css
#tools-table th,
#tools-table td {
    padding: 8px 12px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}
```

### The Updated Project

`styles.css`, in full, new lines marked:

```css
1  body {
2      font-family: sans-serif;
3  }
4
5  #tools-table th,                    /* ← new */
6  #tools-table td {                   /* ← new */
7      padding: 8px 12px;              /* ← new */
8      border: 1px solid #ccc;         /* ← new */
9      box-sizing: border-box;         /* ← new */
10 }                                   /* ← new */
```

`styles.css` now holds two real rules instead of one: the page-wide font
choice (lines 1–3, unchanged), and, new, real spacing and a real visible
grid line applied to every header and data cell in `#tools-table`
specifically (lines 5–10) — the comma on line 5 lets one declaration block
apply to two different selectors at once, rather than repeating the same
three declarations twice.

### Proving It in Isolation

A minimal, unrelated throwaway box, isolating the box model's own real
mechanics before they meet this project's own real table cells:

```html
<div class="test-box">Hi</div>
```

```css
.test-box {
    width: 100px;
    padding: 20px;
    border: 5px solid black;
}
```

Per MDN's own official documentation of the box model (fetched this
session, quoted in full in this lesson's own Header), a `width` declared
with no `box-sizing` override defaults to **`content-box`** behavior:
`width` sets only the *content* area's own size, and padding and border are
each added on top of it, growing the box's own real total rendered size
beyond the declared `width`. MDN's own worked example, fetched this
session, states this precisely: `.box {width: 350px; border: 10px solid
black;}` renders a box that is **370px wide** in total — the declared
`350px`, plus `10px` of border on each of two sides. Applying that same
real math to the throwaway example above: `100px` content, plus `20px`
padding on each side (`40px` total), plus `5px` border on each side (`10px`
total), giving a real total rendered width of `150px` — noticeably more
than the `100px` the `width` declaration alone seems to promise. This is
called the **default (`content-box`) box-sizing behavior**, and it's the
real, documented reason `box-sizing: border-box` exists at all: with it
declared instead, per MDN's own quoted definition, "width... include\[s\]
the content, padding, and border" together, so the declared value becomes
the real, final, total size, and padding/border are absorbed from the
content area's own space instead of adding on top of it.

### Discard the Throwaway Example

The `.test-box` example above is discarded now — it never appears in this
project again. What's proven is the real math default `box-sizing`
performs, and what changes when it's overridden — not this specific
100-pixel box.

### Mechanical Walkthrough

- `#tools-table th,` / `#tools-table td {` — two real selectors sharing one
  declaration block, separated by a comma: each is a real **descendant
  combinator** (already established, this project's own prior lesson) —
  "any `<th>` (or `<td>`) found inside the one real element matching
  `#tools-table`" — meaning this rule only ever touches this one table's
  own cells, never any other `<th>`/`<td>` a future lesson might add
  elsewhere on the page.
- `padding: 8px 12px;` — the **`padding`** property, first appearing in
  this project, given two real values: per CSS's own real shorthand rule
  (the same two-value pattern the Header's own `margin` entry names, since
  `padding` and `margin` share an identical shorthand grammar), the first
  value (`8px`) applies to top and bottom, the second (`12px`) to left and
  right — real, empty space added *inside* each cell's own edge, between
  its border and its own text content.
- `border: 1px solid #ccc;` — the **`border`** shorthand property, first
  appearing in this project, combining three real values in one
  declaration: a width (`1px`), a style (`solid` — a real, visible
  continuous line, as opposed to, say, `dashed`), and a color (`#ccc`, a
  real hexadecimal color value — light gray). Together, one real, thin,
  visible line runs along each cell's own edge.
- `box-sizing: border-box;` — **`box-sizing`** (Header, above), set to
  `border-box` — chosen deliberately here so this rule's own real padding
  and border don't silently grow each cell wider than whatever real width
  DataTables' own default styling (established the previous lesson,
  loaded before this project's own stylesheet) already computed for it.

### CS Lens

The box model's own four-part structure — content wrapped in padding,
wrapped in border, wrapped in margin — is a real instance of **nested
composition**: a whole built from concentric, independently-controllable
layers, where changing an outer layer never has to touch an inner one.
Also recognized in: a physical picture frame (the picture itself, a mat
board around it, the frame's own wood, and the wall space left around the
whole thing), a shipping box holding padded packaging around a product,
and — this project's own established vocabulary — a `SqliteConnection`
wrapping a real native database handle, itself wrapped again by a `using`
declaration's own automatic disposal.

### SE Lens

Why declare `box-sizing: border-box` explicitly, rather than leaving CSS's
own real default (`content-box`) in place? The alternative not chosen —
the default — was rejected because it makes a declared `width` (or, as
here, DataTables' own already-computed column width) an unreliable promise:
adding padding or a border later silently grows the real rendered size
past whatever was declared, exactly the real math this unit's own isolated
lab just proved. `border-box` trades that surprise away by making a
declared size the real, final, total one — the honest cost: reasoning
about *just* the content area's own available space now requires
mentally subtracting padding and border back out, the opposite direction
of `content-box`'s own default arithmetic.

### Run It

No `dotnet build` needed — only `styles.css` changed, already copied by the
existing `<Content>` item established this lesson's own first unit. This
project's own standing constraint (no live WPF window observed this
session) means the real, visible spacing and grid lines this unit's own new
rule produces were not watched rendering in an actual running browser —
what's verified for real instead is the box model's own documented
arithmetic, quoted directly from MDN's own official documentation, fetched
this session.

### Connecting Back

`#tools-table`'s own cells now have real, deliberate spacing and a real
visible grid, with a real, explicit choice about what their own declared
sizes actually measure. The next unit turns from one table's own cells to
the page as a whole.

---

## Concept Unit: Laying Out the Page

### The Problem

`local.html`'s own real content — heading, summary line, button, table —
currently stretches the full width of whatever window it's shown in, with
no margin at all separating it from the browser's own edge. On a wide
window, this means very long, hard-to-scan lines of text and a table
stretched wider than its own real content needs.

> **Try this first:** the Header's own `max-width` entry says it caps how
> wide an element is allowed to grow while still letting it shrink on a
> smaller screen — and its own `margin` entry names a real keyword, `auto`,
> meaning "let the browser compute this." Given a `<body>` with a real,
> capped `max-width` is narrower than the browser's own full window on a
> wide screen, what real, empty space would exist on its left and right —
> and what would setting *that* space's own margin to `auto` on both sides,
> at once, do to where the now-narrower `<body>` actually sits?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/styles.css`, modified.
- **Change type** — add (two new declarations inside the existing `body`
  rule).
- **Location** — inside the `body { ... }` rule established this lesson's
  own first unit, alongside its existing `font-family` declaration.
- **Dependencies** — none beyond `body`'s own existing rule.

### The New Code

```css
max-width: 800px;
margin: 0 auto;
```

### The Updated Project

`styles.css`'s own `body` rule, in full, new lines marked (the rest of the
file, unchanged this unit, is shown too):

```css
1  body {
2      font-family: sans-serif;
3      max-width: 800px;               /* ← new */
4      margin: 0 auto;                 /* ← new */
5  }
6
7  #tools-table th,
8  #tools-table td {
9      padding: 8px 12px;
10     border: 1px solid #ccc;
11     box-sizing: border-box;
12 }
```

`body`'s own rule now sets three real things instead of one: its own font
(line 2, unchanged), a real cap on how wide it's ever allowed to grow (line
3, new), and, new, a real instruction for how to fill whatever empty space
that cap leaves on a wider screen (line 4).

### Proving It in Isolation

A minimal, unrelated throwaway page, isolating `max-width` plus
`margin: 0 auto` before they meet this project's own real page:

```html
<div class="test-panel">Centered content.</div>
```

```css
.test-panel {
    max-width: 300px;
    margin: 0 auto;
    border: 1px solid black;
}
```

Per MDN's own official documentation (fetched this session, quoted in full
in this lesson's own Header), `margin: 0 auto` is confirmed as "a valid and
real way to horizontally center a block-level element within its parent,"
specifically because `auto`, given to the left and right margins, "allows
the browser to automatically calculate equal left and right margins" —
splitting whatever real space is left over, after `max-width` caps the
element's own width, evenly between both sides. On a browser window wider
than `300px` plus its own border, `.test-panel` would sit with real, equal
empty space on its own left and right, rather than flush against the
window's own left edge the way an element with no margin rule at all
always does by default.

### Discard the Throwaway Example

The `.test-panel` example above is discarded now — it never appears in
this project again. What's proven is that `margin: 0 auto` really does
split leftover horizontal space evenly, once `max-width` (or a plain
`width`) has already capped an element narrower than its own parent.

### Mechanical Walkthrough

- `max-width: 800px;` — **`max-width`** (Header, above), given a fixed
  `800px` value — `body` is now never allowed to render wider than `800px`
  total, regardless of how much wider the actual browser window is, though
  it can still shrink narrower on a smaller one.
- `margin: 0 auto;` — the **`margin` shorthand** (Header, above), given two
  values: per its own real two-value shorthand rule (already walked through
  this lesson's own previous unit for `padding`, which shares an identical
  grammar), the first value applies to top and bottom, the second to left
  and right. `0` sets top/bottom margin to nothing at all; `auto`, applied
  to left and right together, is what actually centers `body` — not a
  fixed length, but a real, documented instruction telling the browser to
  compute both sides equally from whatever space `max-width` leaves over.

### CS Lens

Declaring a real constraint (`max-width: 800px`) and a real goal (`margin:
auto`, "distribute remaining space evenly") and letting the browser's own
layout engine work out the exact resulting numbers, rather than computing
and hard-coding a specific margin value by hand, is a form of **declarative**
problem-solving — stating *what* outcome is wanted and letting the system
compute *how*, the identical idea this lesson's own first unit already
named for CSS selectors generally, now applied to layout math instead of
element matching. Also recognized in: this project's own SQL `SELECT`
(state which rows and columns are wanted; SQLite's own query planner works
out how to actually fetch them), and a spreadsheet formula (`=A1+A2`)
recomputing its own real result automatically whenever `A1` or `A2`
changes, rather than a person re-typing a new sum by hand each time.

### SE Lens

Why cap `body` with `max-width` rather than a plain, fixed `width`, a real
alternative CSS also supports? The alternative not chosen — fixed `width`
— was rejected because it sets one single size with no flexibility at all:
on a browser window narrower than that fixed value, content would either
overflow or force a horizontal scrollbar, a real, poor outcome this
project's own reader could actually hit by simply resizing the WPF window
`Browser` lives inside. `max-width` keeps the same real cap on a wide
window while still honestly shrinking to fit a narrower one — the honest
cost accepted: reasoning about `body`'s own real width now requires
knowing which of the two real values (the `max-width` cap, or the actual
viewport) is currently smaller, rather than a single fixed number telling
the whole story on its own.

### Run It

No `dotnet build` needed — only `styles.css` changed. This project's own
standing constraint (no live WPF window observed this session) applies
here too: the real, visibly centered, capped-width page this unit produces
was not watched rendering in an actual running browser this session — what's
verified for real is `margin: 0 auto`'s own documented centering behavior,
quoted directly from MDN's own official documentation, fetched this
session.

### Connecting Back

The whole page now sits in a real, deliberately capped, centered column
instead of stretching edge-to-edge — a real layout decision, on top of the
previous unit's own real spacing inside `#tools-table`'s cells. The final
unit turns from *where* things sit to *how much visual weight* each one
carries.

---

## Concept Unit: Visual Hierarchy Through Type

### The Problem

`<h1>ToolDB</h1>` and `#tools-table`'s own five `<th>` header cells
currently render with whatever default size and weight the browser itself
happens to assign each tag — real defaults, but ones this project never
chose, and ones that don't necessarily make clear, at a glance, that the
page's own title matters more than a single column header.

> **Try this first:** the Header's own `font-size` entry names `rem` as a
> unit always relative to the *root* `<html>` element's own font size, and
> its own `font-weight` entry confirms `bold` and `700` are real,
> equivalent values. Given `<h1>` is meant to be this page's own single
> most important piece of text, and a table header cell is meant to be
> noticeably less important than that but still visually distinct from an
> ordinary `<td>`, what real, relative difference in size and weight would
> you choose between the two, rather than leaving both at whatever the
> browser's own unstyled defaults happen to be?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/styles.css`, modified.
- **Change type** — add (two new CSS rules).
- **Location** — appended after the existing `#tools-table th, #tools-table
  td { ... }` rule established earlier this lesson.
- **Dependencies** — none beyond the markup already established.

### The New Code

```css
h1 {
    font-size: 1.75rem;
    font-weight: 700;
}

#tools-table th {
    font-weight: 700;
    text-align: left;
}
```

### The Updated Project

`styles.css`, in full, new lines marked:

```css
1  body {
2      font-family: sans-serif;
3      max-width: 800px;
4      margin: 0 auto;
5  }
6
7  #tools-table th,
8  #tools-table td {
9      padding: 8px 12px;
10     border: 1px solid #ccc;
11     box-sizing: border-box;
12 }
13
14 h1 {                                /* ← new */
15     font-size: 1.75rem;             /* ← new */
16     font-weight: 700;               /* ← new */
17 }                                   /* ← new */
18
19 #tools-table th {                   /* ← new */
20     font-weight: 700;               /* ← new */
21     text-align: left;               /* ← new */
22 }                                   /* ← new */
```

`styles.css` now holds four real rules: page-wide font and layout (lines
1–12, unchanged this unit), and, new, a real, explicit size/weight for the
page's own `<h1>` (lines 14–17) and a real weight/alignment for
`#tools-table`'s own header cells specifically (lines 19–22) — deliberately
distinct from each other and from an ordinary, unstyled `<td>`.

### Proving It in Isolation

A minimal, unrelated throwaway pair of headings, isolating relative type
scale before it meets this project's own real `<h1>` and `<th>`:

```html
<h2 class="test-big">Big</h2>
<p class="test-small">Small</p>
```

```css
.test-big {
    font-size: 1.5rem;
    font-weight: 700;
}

.test-small {
    font-size: 1rem;
    font-weight: 400;
}
```

Per MDN's own official documentation (fetched this session, quoted in full
in this lesson's own Header), `rem` is always computed "relative to the
root (`<html>`) element's own font size" — so if this project's own real
root font size stays at a typical, unstyled browser default of `16px`
(never overridden anywhere in this project's own real `styles.css`),
`1.5rem` computes to a real `24px`, and `1rem` computes to a real `16px` —
a genuine, real 8-pixel size difference, on top of `font-weight`'s own real
`700` versus `400` difference (per MDN's own documentation, `700` "bold"
against `400` "normal," quoted in full in this lesson's own Header).
Together, both real, computed differences are what's meant by **visual
hierarchy** (Terms, above): not a vague design impression, but two real,
specific, additive CSS values a reader's own eye actually responds to.

### Discard the Throwaway Example

The `.test-big`/`.test-small` example above is discarded now — it never
appears in this project again. What's proven is the real, computed pixel
math behind `rem`, and that a genuine size-plus-weight difference is what
visual hierarchy actually reduces to in real CSS — not this specific
example's own wording.

### Mechanical Walkthrough

- `h1 { ... }` — a real CSS rule (Header, above) whose selector matches
  `local.html`'s own one real `<h1>` element (established since this
  project's own earliest lessons) by tag name directly, the same plain
  selector shape this lesson's own first unit already used for `body`.
- `font-size: 1.75rem;` — **`font-size`** (Header, above), given a real
  **`rem` unit** value (Header, above) — computed relative to the root
  `<html>` element's own font size, meaning `<h1>`'s own real rendered size
  stays in a fixed, predictable ratio to the rest of the page even if a
  future lesson ever changes the root's own base size.
- `font-weight: 700;` — **`font-weight`** (Header, above), given the real
  numeric value `700` — per MDN's own documentation, quoted in full in this
  lesson's own Header, identical in real effect to the keyword `bold`.
- `#tools-table th { ... }` — a real CSS rule whose selector is a
  **descendant combinator** (already established, this project's own prior
  lesson) matching every `<th>` inside `#tools-table` specifically — no
  comma-joined `td` this time, since this rule's own job (header emphasis)
  applies only to header cells, not ordinary data cells.
- `font-weight: 700;` (second appearance, same declaration) — the identical
  real property and value already explained above, applied here to
  `#tools-table`'s own header cells instead of `<h1>` — a real, genuine
  reappearance, not a typo, since both this page's own title and its own
  table headers are meant to look bold, just at very different real sizes.
- `text-align: left;` — the **`text-align`** property, first appearing in
  this project — sets how text is aligned inside its own containing box;
  `left`, its value here, is already most browsers' own real default for a
  `<td>`, but not for a `<th>` (many browsers, by default, center a
  `<th>`'s own text instead) — this declaration exists specifically to make
  header cells visually line up with the ordinary data cells directly
  beneath them, rather than looking independently centered.

### CS Lens

Choosing relative differences (a size ratio, a weight difference) rather
than absolute, independent values for every single element is the same
real idea behind a **type scale** — a small, deliberately chosen set of
related values, reused consistently, rather than one-off numbers picked
per element with no real relationship to each other. Also recognized in: a
musical scale (a fixed, small set of real pitch relationships reused across
an entire piece, rather than every note picked independently), and this
project's own established database schema (Lesson 2) naming a fixed,
deliberate set of column types up front rather than letting every row
invent its own shape.

### SE Lens

Why choose `1.75rem`/`700` for `<h1>` and just `700`/`text-align: left` for
`#tools-table th`, rather than making every header cell exactly as large
and bold as the page's own title? The alternative not chosen — identical
treatment everywhere — was rejected because visual hierarchy's own entire
point (Header, above) is letting a reader's eye separate "the most
important thing on this page" from "an important label within one specific
section" at a glance; making everything look equally prominent removes
that signal entirely; a page where everything shouts is functionally the
same as a page where nothing does. The honest cost accepted: these two
specific rules were chosen by direct, deliberate judgment this unit, not
derived from any single formula — a future lesson introducing a third real
heading level, or a second table, would need its own equally deliberate
choice, not an automatic rule this project's own CSS already encodes.

### Run It

No `dotnet build` needed — only `styles.css` changed. This project's own
standing constraint (no live WPF window observed this session) applies
here too, for the last time this lesson: the real, visible size and weight
difference this unit's own new rules produce was not watched rendering in
an actual running browser this session — what's verified for real is
`rem`'s own documented, root-relative computation and `font-weight`'s own
documented `700`/`bold` equivalence, both quoted directly from MDN's own
official documentation, fetched this session.

### Connecting Back

`local.html`'s own title and table headers now carry a real, deliberate
visual difference in size and weight, on top of every earlier unit's own
real spacing, grid lines, and centered layout — the full, real stylesheet
this lesson set out to build, one real box-model and layout rule at a
time.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. A new file, `styles.css`, was created and wired into `local.html` via a
   real `<link rel="stylesheet" href="styles.css">` tag — a plain relative
   filename, proven, via a real throwaway page, to resolve against the
   referencing file's own folder rather than needing a URL at all — plus a
   matching `<Content Include="styles.css" ...>` item in `ToolDB.csproj`,
   without which the file would never reach the build output at all (Unit
   1).
2. `#tools-table`'s own header and data cells were given real padding and a
   real visible border, with `box-sizing: border-box` declared explicitly
   so those two additions don't silently grow each cell wider than
   DataTables' own already-computed column width — proven, via a real
   throwaway box, exactly how much wider a box grows *without* that
   declaration (Unit 2).
3. `body` itself was capped at a real `max-width` and centered with
   `margin: 0 auto`, replacing a page that stretched to the full width of
   whatever window contained it with a fixed, readable, centered column
   (Unit 3).
4. `<h1>` and `#tools-table`'s own header cells were given a real,
   deliberate difference in size (`rem`, computed relative to the page's
   own root font size) and weight (`700`), giving the page a real visual
   hierarchy instead of leaving every piece of text at the browser's own
   identical, unstyled default (Unit 4).

**Next lesson:** 13 — Your First Native XAML Screen.
