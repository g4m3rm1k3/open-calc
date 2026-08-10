# Concept: Browser `localStorage`

**What you'll understand by the end:** how to save a small piece of data
in the browser so it survives a page reload or the browser closing
entirely, without any server or database involved.

**Prerequisites:** None beyond plain JavaScript.

## Setup

Any browser's own developer console, or (as run for this file) Node.js
22+ with its experimental Web Storage support enabled:
```
node --experimental-webstorage --localstorage-file=./demo.sqlite -e "..."
```
In an actual browser, `localStorage` is already a global — no setup, no
flags, no import.

## The Problem

A JavaScript variable, or even React state, lives only in memory for as
long as the current page is open — reload the page, and it's gone; close
the tab, and it's gone. Some values (a chosen theme, a "don't show this
again" dismissal, a draft the user hasn't submitted yet) need to survive
past that, without requiring a server round-trip or a login just to
remember one small preference.

## The Isolated Example

```javascript
localStorage.setItem("cnc-theme", "nord");
console.log("getItem right after setItem:", localStorage.getItem("cnc-theme"));
console.log("getItem for a never-set key:", localStorage.getItem("cnc-theme-missing"));
```

**Real output, run this session:**
```
getItem right after setItem: nord
getItem for a never-set key: null
```

**What this proves:** a value written with `setItem` is immediately
readable back with `getItem`, under the exact key used to store it, and a
key that was never set returns `null` rather than throwing — a real,
checkable "was this ever saved?" signal, not an error to catch.

## Mechanical Walkthrough

- `localStorage` — **(a) first appearance** — a global object, provided
  by the browser itself (not imported, not installed), backed by
  persistent storage tied to the page's own origin (`localhost-loopback-address.md`-adjacent
  concept: same-origin scoping — a page on one origin cannot read another
  origin's `localStorage`).
- `.setItem(key, value)` — **(a) first appearance** — stores `value`
  (always coerced to a string) under `key`, overwriting any previous
  value at that key. Returns nothing.
- `.getItem(key)` — **(a) first appearance** — returns the string stored
  at `key`, or `null` if nothing was ever stored there — never `undefined`,
  never a thrown error.

## CS Lens

`localStorage` is a real, if minimal, **key-value store** — the same
fundamental interface (`get`, `set`, keyed by a string) as a Redis
instance, a Python `dict` used for lookups (`dict-as-lookup-table.md`), or
a filesystem's own directory-of-files model, just scoped to one browser
origin instead of a whole server or process.

Also recognized in: `sessionStorage` (the same interface, cleared when
the tab closes instead of persisting), browser cookies (an older, more
limited version of the same idea), any key-value database, environment
variable lookups.

## SE Lens

The real alternative for "remember this across visits" is a server-side
database, tied to a logged-in user. That alternative is the *only* option
when the data needs to be available on a different device, or needs to
survive the user clearing their browser data, or needs to be visible to
anyone other than that one browser. `localStorage` is the right choice
specifically when none of those are true — a pure per-device UI
preference — because it needs no backend request, no schema, and no
account system at all. The real cost being accepted: the data is
genuinely gone if the user clears site data, is invisible on any other
device, and (everything stored is a plain string) requires manual
serialization for anything beyond a single value.

## Connection

Builds on nothing beyond plain JavaScript. Used in this project's real
code to remember which theme was last selected in
`design-tokens-theming-pattern.md`, so a returning visit doesn't reset to
the default look.

## Try It Yourself

1. Call `localStorage.setItem("count", 1)` (a number, not a string), then
   `localStorage.getItem("count")` — check its real type with `typeof` and
   confirm `localStorage` silently coerced the number to a string on the
   way in.
2. Call `localStorage.removeItem("cnc-theme")`, then `getItem` the same
   key again — confirm it now returns `null`, the same as a key that was
   never set at all.
