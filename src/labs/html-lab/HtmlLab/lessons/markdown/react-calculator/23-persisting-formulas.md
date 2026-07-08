# React Calculator — Lesson 23 — Persisting Formulas

## What You Will Build

Saved formulas that survive leaving and re-entering ▶ Preview — closed
tab, reopened tab, real persistence, using `localStorage` and `useEffect`
for the first time in this project.

---

## What You Need to Know First

Lesson 22 — a working Formula Library: add, edit, delete, all held in
`formulas: SavedFormula[]`, entirely in memory.

---

## Step 1 — Name the Problem: Memory Isn't Storage

Every piece of state this project has built so far — `expression`,
`memory`, `formulas`, all of it — lives in memory, inside variables
JavaScript is tracking while the page is running. The moment ▶ Preview's
iframe reloads (or the page is closed), every one of those variables is
destroyed completely; there is no "recovering" it, because it never
existed anywhere except in that one running program's memory. Saving a
formula and then leaving Preview loses it, silently, every time — try it,
to see the problem honestly before fixing it.

---

## Step 2 — `localStorage`, a Browser API Used for the First Time

**Walkthrough — what `localStorage` actually is.** Every browser gives
each website a small, persistent key-value store — `localStorage` — tied
to that site's own origin (roughly, its domain), that survives closing the
tab, closing the browser entirely, and restarting the computer, until
something explicitly clears it. It is not part of React or JavaScript's
own language — it's a Web API, provided by the browser itself, reached
through the global `localStorage` object, the same way `document` and
`Math` are globals the browser provides rather than the language itself
defining them.

**CS lens — a key-value store, the same general data shape as
`OPERATORS` and `Record`, at the browser level instead of the language
level.** `localStorage` is, structurally, a **key-value store** — data
addressed by a unique string key, with no relationships or ordering
between entries — the exact same shape lesson 09's `OPERATORS` dispatch
table used inside a single running program. The difference is scope and
lifetime: `OPERATORS` lives in one function's memory, for one page load;
`localStorage` is a key-value store the *browser itself* maintains, per
website, surviving far longer. Recognizing the same underlying shape
(string keys, arbitrary values, lookup by key) reused at a different layer
of the system — language-level object, browser-level storage, and later,
a real database — is a large part of what makes unfamiliar tools faster
to learn: the shape is often not new, only the scope it operates at.

**Its real shape and real limits.** `localStorage.setItem(key, value)`
stores one string under one string key; `localStorage.getItem(key)`
retrieves it, returning `null` if that key was never set.
**`localStorage` only ever stores strings** — passing anything else to
`setItem` gets silently converted to its string form, usually not the way
you'd want. Most browsers cap total `localStorage` per origin around 5–10
megabytes — enormous for a list of formulas, genuinely limiting for
larger amounts of data a future project might want to store this way.

---

## Step 3 — Load Once, With a Lazy `useState` Initializer

Update `Calculator.tsx`:

```tsx
const [formulas, setFormulas] = React.useState<SavedFormula[]>(() => {
  const saved = localStorage.getItem("calculator-formulas");
  if (saved === null) return [];
  try {
    return JSON.parse(saved) as SavedFormula[];
  } catch {
    return [];
  }
});
```

**Walkthrough — `useState(() => ...)`, a function instead of a plain
value.** Every other `useState` call in this project has passed a plain
starting value directly — `React.useState("0")`, `React.useState(false)`.
Passing a **function** instead changes when the work inside it runs:
React calls it exactly once, on this component's very first render, and
uses whatever it returns as the initial state — on every render *after*
that, the function is never called again. This matters here because
reading and parsing `localStorage` is real work; without the function
wrapper (`React.useState(loadFormulasFromStorage())` instead of
`React.useState(() => loadFormulasFromStorage())`), that read-and-parse
would happen on **every single render** of `Calculator`, even though only
the very first result is ever actually used.

**Walkthrough — `JSON.parse`, the inverse of `JSON.stringify`, and the
formal names for both directions.** `JSON.stringify` (used since lesson
10's debug panel) converts a JavaScript value into a JSON-formatted
string — this direction, turning an in-memory value into a storable or
transmittable form, is called **serialization**. `JSON.parse` does the
reverse — turning stored or transmitted text back into a real, live
JavaScript value — called **deserialization**. Every time this project
saves anything outside its own running memory (here, `localStorage`; in a
real production app, often a network request to a server) it must
serialize first; every time it reads that same data back, it must
deserialize before using it as real objects again. `try`/`catch` around
`JSON.parse` guards against genuinely malformed stored text (someone
editing `localStorage` by hand through DevTools, or a future version of
this project changing what shape it expects to find there) — falling back
to an empty array rather than crashing the whole calculator on load.

**SE lens — persistence versus ephemeral state, named precisely.** Every
piece of state this project built before this lesson — `expression`,
`memory`, `scientificMode` — is **ephemeral**: it exists only in the
browser's memory, for as long as the page happens to stay loaded, and
vanishes completely the instant that page unloads, with no trace left
anywhere. `formulas`, from this lesson on, is **persistent**: written to
storage that outlives the page itself, recoverable the next time this
project runs, even after the browser fully closes. Choosing which state
deserves persistence and which doesn't is a real design decision, not an
automatic one — this project's own `expression` deliberately stays
ephemeral (a mid-typed calculation surviving a reload would be strange
and confusing), while `formulas` deliberately doesn't (losing a saved
formula on every reload would defeat the entire point of saving it).

---

## Step 4 — Save on Every Change, With `useEffect`

```tsx
React.useEffect(() => {
  localStorage.setItem("calculator-formulas", JSON.stringify(formulas));
}, [formulas]);
```

Click **▶ Preview**. Save a formula. Click back to **Edit**, then
**▶ Preview** again — the formula is still there, without ever being
re-saved by hand.

**Walkthrough — `useEffect(effect, dependencies)`, a hook used for the
first time.** `useEffect` is React's tool for **synchronizing** something
outside React's own rendering — here, the browser's `localStorage` — with
the current state. The function passed as its first argument runs *after*
React has finished updating the page to match the latest render, not
during rendering itself. The **dependency array**, `[formulas]`, controls
*when* it runs again: React compares each dependency to its value on the
previous render, and only re-runs the effect if at least one of them is
different. Concretely: saving a new formula changes `formulas` to a new
array → the dependency changed → the effect runs → `localStorage` is
updated with the latest list.

**The three shapes a dependency array can take, and why this project uses
the third.** No array at all runs the effect after *every single render*,
regardless of what changed — rarely what's actually wanted. An empty
array, `[]`, runs the effect exactly once, right after the first render,
and never again — correct for "do this one time on load," wrong here,
since formulas need saving every time they change, not just once. `[formulas]`
runs the effect after the first render *and* again every time `formulas`
specifically changes — exactly the behavior "keep `localStorage` in sync
with the current list" requires.

**SE lens — why loading happens in `useState`'s initializer, not in a
second `useEffect`.** It would be possible to load formulas inside an
`useEffect(() => { ... }, [])` instead, calling `setFormulas` once after
the first render. That works, but means the calculator briefly renders
with an *empty* formula list before the effect has a chance to run and
correct it — a visible, if brief, flash of "no formulas" even when some
are actually saved. Reading `localStorage` inside `useState`'s lazy
initializer happens *before* the very first render occurs at all, so the
correct list is there from the first frame the user ever sees.

---

## Connect the Pieces

```
Calculator.tsx   formulas' initial value now reads localStorage once,
                 lazily, before the first render
                 a useEffect keyed on [formulas] writes the current list
                 back to localStorage every time it changes
```

---

## What Breaks Without This

**Forgetting the `[formulas]` dependency array entirely** (just
`React.useEffect(() => { localStorage.setItem(...); });`): the effect now
runs after *every* render of `Calculator`, for *any* reason — typing a
digit, toggling scientific mode, anything — re-writing the exact same
`localStorage` value repeatedly, far more often than necessary. Not
incorrect, exactly, but wasteful — the dependency array exists specifically
to avoid this.

**Forgetting the `try`/`catch` around `JSON.parse`:** if `localStorage`
ever contains text that isn't valid JSON — corrupted by hand, or left over
from an incompatible earlier version of this project — `JSON.parse` throws,
uncaught, the moment `Calculator` tries to render for the very first time,
crashing the entire application before a single button ever appears.

---

## Definition of Done

- [ ] Saving a formula, leaving Preview, and re-entering Preview shows the formula still there
- [ ] You can explain what `localStorage` is and that it's a browser API, not part of React
- [ ] You can explain the three dependency-array shapes for `useEffect` and what each means
- [ ] You can explain why formulas are loaded inside `useState`'s initializer function rather than a second `useEffect`
- [ ] You can explain what a key-value store is and name another example of one at a different layer of this project

---

*Next: Lesson 24 — Expression History. Every calculation joins a running
list — the first feature this project builds primarily to look at, not to
compute with.*
