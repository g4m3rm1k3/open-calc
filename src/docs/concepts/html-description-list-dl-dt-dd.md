# Concept: The HTML Description List (`<dl>`, `<dt>`, `<dd>`)

**What you'll understand by the end:** the real HTML element built
specifically for a list of label/value pairs — and why using it instead
of generic `<div>`s communicates real structure to the browser and to
assistive technology, not just to a human reading the source.

**Prerequisites:** `html-id-attribute.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A panel showing "Program Number: O1234", "Title: Test Part", "Size: 90
bytes" is, structurally, a real list of named facts about one thing —
not a sequence of independent paragraphs, and not a data table (there's
only ever one row of values, not many rows sharing columns). Building
it from generic `<div>`s with CSS classes for "label" and "value" works
visually, but the HTML itself carries no real information that these
elements are label/value pairs at all — a screen reader, a browser
extension, or a future maintainer reading the markup has to guess from
class names alone.

## The Isolated Example

```html
<dl>
  <dt>Species</dt>
  <dd>Canis familiaris</dd>
  <dt>Diet</dt>
  <dd>Omnivore</dd>
</dl>
```

**Real rendering, default browser styling:** each `<dt>` renders on its
own line in normal weight; each `<dd>` renders on the next line,
indented from the left margin — with no CSS written at all.

**What this proves:** the browser already knows, from the element
names alone, that this is a label/value structure, and applies real
default layout (indentation) reflecting that — proof this is a genuine,
recognized HTML structure, not a generic container repurposed by
convention.

## Mechanical Walkthrough

- `<dl>` — **(a) first appearance** — "description list," the
  container. Like `<ul>`/`<ol>` (unordered/ordered lists, used
  elsewhere in this project for the project explorer tree), it may only
  contain a specific set of real children — here, `<dt>` and `<dd>`
  elements, in any number and order.
- `<dt>` — "description term" — the label half of one pair (`"Species"`).
- `<dd>` — "description details" — the value half of the same pair
  (`"Canis familiaris"`), associated with the `<dt>` immediately before
  it by their real, adjacent position in the markup — no `id`/`for`
  linking is needed, unlike `<label for="...">`.

## CS Lens

This is **using a data structure whose shape matches the data** —
the same instinct behind choosing a `Map` over an array of pairs when
data really is key/value, or a `struct` with named fields over a bare
tuple. HTML's own element vocabulary includes a real type for
label/value collections; reaching for it instead of generic containers
is the markup-language equivalent of choosing the type that actually
describes the data, rather than a general-purpose one that happens to
work.

Also recognized in: a REST API returning `{"species": "...", "diet":
"..."}` (a real object, not an array of unlabeled values) for the exact
same reason — the shape of the representation should match the shape
of the real data.

## SE Lens

This is **semantic HTML** — choosing an element for what it *means*,
not just how it happens to render. A sighted user with a mouse cannot
tell a `<dl>` from a styled `<div>` at a glance, but a screen reader
announces "description list, 2 items" and lets a user jump term-by-term
— real, existing assistive-technology behavior that a generic `<div>`
structure does not provide, no matter how it's styled. Semantic markup
also means less CSS is required to get sensible default behavior (the
indentation seen above came free), and it documents the data's real
shape directly in the markup, for any future reader — human or machine
— without needing to infer it from class names.

## Connection

Builds on `html-id-attribute.md` (each `<dd>` in this project's real
Program Details panel gets its own `id`, exactly like any other element
this project targets from `renderer.ts`) and `css-grid-layout.md` (the
`#program-summary-fields` block uses the same two-column
`grid-template-columns: auto 1fr` technique already established for
`.machine-check-form`, applied here to lay `<dt>`/`<dd>` pairs side by
side instead of stacked). Used directly in
`cnc-editor-electron/src/index.html`'s Program Details panel — eight
real `<dt>`/`<dd>` pairs (Program Number, Title, Sequence Range,
Sequence Count, File Name, Path, Size, Modified), each `<dd>` given its
own `id` so `renderer.ts` can set its `.textContent` directly.

## Try It Yourself

1. Remove the CSS `grid-template-columns` rule from
   `#program-summary-fields` and reload — confirm the browser's
   *default* `<dl>` styling (each term on its own line, its value
   indented on the next line) is still a real, readable layout on its
   own, without any project CSS at all.
2. Put two `<dd>` elements in a row after one `<dt>` — confirm this is
   valid, real HTML (a term can have more than one value) and both
   render, one after another.
3. Open a real browser's accessibility inspector (or a screen reader,
   if available) on a page using `<dl>`/`<dt>`/`<dd>` and confirm it is
   announced as a distinct structure, not as generic, unlabeled text —
   the real, concrete benefit named in the SE Lens above.
