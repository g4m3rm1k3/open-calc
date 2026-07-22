# Concept: JSX Fragments

**What you'll understand by the end:** how to return multiple sibling elements from a component without wrapping them in an unnecessary extra DOM element.

**Prerequisites:** `jsx-syntax.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

A component can only return *one* JSX element — this is a real, structural rule of how JSX compiles (see `jsx-syntax.md`: a JSX expression is a single function-call-shaped value, not a list of them). But a component conceptually needing to render several sibling elements at its top level — a heading followed by a paragraph, with no meaningful shared container — is forced to either wrap them in an extra element that has no real purpose, or find another way to satisfy the one-root-element rule.

## The Isolated Example

The problem, shown directly — this does not compile:
```tsx
function Header() {
  return (
    <h1>Title</h1>
    <p>Subtitle</p>
  );
}
```
**Real compiler error:**
```
Adjacent JSX elements must be wrapped in an enclosing tag.
```

Wrapping in an unnecessary `<div>` (works, but adds a real, unwanted element):
```tsx
function Header() {
  return (
    <div>
      <h1>Title</h1>
      <p>Subtitle</p>
    </div>
  );
}
```

Using a Fragment instead:
```tsx
function Header() {
  return (
    <>
      <h1>Title</h1>
      <p>Subtitle</p>
    </>
  );
}
```

**Real, inspected DOM output for the Fragment version:**
```html
<h1>Title</h1>
<p>Subtitle</p>
```
No wrapping `<div>` present at all — compared against the wrapped version's real output, which does include one.

**What this proves:** the Fragment version satisfies JSX's one-root-element rule (compiles without error, exactly like the `<div>`-wrapped version) while producing genuinely different, leaner real DOM output — no extra element exists in the actual page.

## Mechanical Walkthrough

- `<>...</>` is shorthand for `<React.Fragment>...</React.Fragment>` — a real, built-in component whose entire purpose is grouping children to satisfy the "one root element" rule, while rendering *none* of itself into the actual DOM.
- Unlike a `<div>`, a Fragment contributes zero real elements, zero CSS styling hooks, and zero effect on layout — it exists purely at the JSX/React level, invisible once rendered to a real page.
- The longer form, `<React.Fragment key={...}>`, is needed instead of the shorthand `<>` specifically when a `key` prop must be supplied (relevant when rendering a list of fragments — the shorthand syntax doesn't support attributes at all).

## CS Lens

A Fragment is a **null container** — a grouping construct that exists structurally (to satisfy a syntactic or type-level requirement: "exactly one root") without contributing any actual substance to what it groups. This shape recurs anywhere a language or API requires a single container even when the *logical* content is genuinely a list — an empty-tag XML wrapper used purely to satisfy a schema requiring one root element is a direct parallel.

Also recognized in: SQL's own sometimes-necessary derived-table wrapping (a query engine occasionally requiring a subquery be wrapped in an outer `SELECT * FROM (...)` purely to satisfy a syntactic requirement, contributing nothing semantically), and any API requiring a single top-level object even when the real payload is a bare list (wrapping it as `{"items": [...]}` purely to have one root key).

## SE Lens

Reaching for a real `<div>` purely to satisfy JSX's one-root rule is a common, easy default that has a real cost: an extra, meaningless element in the actual DOM can break CSS layouts that assume a specific parent-child structure (flexbox/grid rules keyed to direct children, for instance), and adds noise when inspecting the real page structure in browser dev tools. A Fragment is the correct default whenever there's no genuine styling or semantic reason for a wrapping element to exist at all.

## Connection

Builds on `jsx-syntax.md`. Commonly needed at a component's top level whenever it renders several logically-independent pieces — a heading, a data viewport, and a raw data dump, for instance — with no shared container that would otherwise make semantic sense.

## Try It Yourself

1. Compare the real rendered DOM (via browser dev tools' element inspector) between a `<div>`-wrapped version and a Fragment-wrapped version of the same two sibling elements, confirming the Fragment version has one fewer element in the actual page.
2. Try adding a `className` attribute directly to a `<>` shorthand fragment (`<> className="wrapper">`) and read the real syntax error — then rewrite it using the explicit `<React.Fragment>` form to see why the longer form exists.
3. Render a list of items, each needing to be a Fragment (grouping a label and a value without a wrapping element per item), and add the required `key` prop to each — using the explicit `<React.Fragment key={...}>` form, since the shorthand can't carry attributes.
