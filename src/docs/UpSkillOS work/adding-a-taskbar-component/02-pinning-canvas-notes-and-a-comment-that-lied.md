# Pinning Canvas Notes to the Taskbar — and a Comment That Started Lying

## What you will build

Canvas Notes already existed and was already reachable (Start Menu
search, the Labs gallery) — but, same gap `01-...md` closed for Health
Tracker, there was no one-click icon for it in the taskbar next to RPG
Workout and Brain Training. This lesson adds that icon. It also fixes
something the change itself caused: a comment above `PINNED_APPS` that
was accurate right up until this edit, and would have been quietly
wrong from that point on if left alone.

## What you need to know first

`adding-a-taskbar-component/01-...md` — assumed fresh: arrays, objects,
arrow functions, `.map()`, and the `route`-vs-`loader` branch inside
`openPinnedApp` are all established there and not re-taught here.

---

## The lesson

### Where you're working

The same file as last time: `src/components/desktop/Taskbar.jsx`,
the `PINNED_APPS` array and the comment directly above it.

### Adding the entry

`01-...md` already established: an item in `PINNED_APPS` with a
`route` field takes the `navigate(app.route)` branch of
`openPinnedApp`, no `loader` needed. Canvas Notes already has a route —
not a dedicated one like `/health`, but the generic `/lab/:labKey`
catch-all every lab in this app opens through:

```javascript
const PINNED_APPS = [
  { id: 'rpg-workout', label: 'RPG Workout', emoji: '⚔️', route: '/rpg-workout' },
  { id: 'brain', label: 'Brain Training', emoji: '🧠', route: '/brain' },
  { id: 'canvas-notes', label: 'Canvas Notes', emoji: '🗒️', route: '/lab/canvas-notes' },
]
```

Same shape, same branch, same `.map()` that already knows how to turn
however many objects are in this array into that many buttons — nothing
about that part needed re-deriving.

### The Problem the comment created

`01-...md`'s own file, before this change, carried this comment:

```javascript
// RPG Workout and Brain Training are tall, scrollable content pages — not
// fixed-size games/labs — so they route to their own dedicated pages instead
// of opening through the floating-window manager. FloatingWindow's content
// area uses `overflow-hidden` with no scroll, which is correct for canvas
// games but silently clips/cuts off anything taller than the window.
const PINNED_APPS = [ ... ]
```

Read literally, this says: *entries in this array with a `route` field
bypass the floating-window manager.* That was true of every entry that
existed when it was written. The moment Canvas Notes' entry was added —
also using `route` — that sentence became false for one of the three
items in the exact array it sits directly above, without a single
character of the comment itself changing.

### Introduce the concept in isolation

```javascript
// A comment describing "all X have property Y" is a claim about the
// ENTIRE collection, re-checked implicitly every time something reads it —
// but never automatically re-verified when the collection changes.
const claim = "every fruit in this basket is round"
const basket = ['apple', 'orange']   // claim holds

basket.push('banana')                // basket changed
console.log(claim)                   // "every fruit in this basket is round" — unchanged text
console.log(basket)                  // [ 'apple', 'orange', 'banana' ] — claim now false
```

Run, real output:
```
every fruit in this basket is round
[ 'apple', 'orange', 'banana' ]
```

**What this proves:** nothing enforces the comment. `claim` is just a
string sitting near `basket` — pushing `'banana'` onto the array has
zero effect on it, the same way adding an object to `PINNED_APPS` has
zero effect on a comment sitting a few lines above. A comment is not
code the language checks; it's a claim a human wrote once, that stays
exactly as written no matter what happens to the thing it describes.

#### Discard the throwaway example

### Project change

- **File:** `src/components/desktop/Taskbar.jsx`
- **Change type:** fix (the comment above `PINNED_APPS`)
- **Dependencies:** the new `canvas-notes` entry above

### The new code

```javascript
// `route` just navigates there; `loader` (see openPinnedApp below) opens the
// app as a floating window directly. RPG Workout and Brain Training are
// tall, scrollable content pages — not fixed-size games/labs — so their
// route points at a dedicated page instead of a floating window at all:
// FloatingWindow's content area uses `overflow-hidden` with no scroll, which
// is correct for canvas games but silently clips/cuts off anything taller
// than the window. Canvas Notes' route is different — `/lab/canvas-notes`
// is the same generic `/lab/:labKey` catch-all every lab already opens
// through (EntryShell → openWindow), so it still ends up in a floating
// window; it just gets there via a navigate instead of a direct loader.
```

### Mechanical walkthrough

The old comment made one true statement do double duty: "these route"
and "routing means no floating window" were fused into a single claim,
true only because every entry that existed happened to satisfy both at
once. The fix splits them back apart: `route` describes *how* the app
opens (via `navigate`, established in `01-...md`), not *what kind of
window it ends up in* — that second part depends entirely on what the
route itself points at. `/rpg-workout` and `/brain` point at dedicated
full pages; `/lab/canvas-notes` points at `EntryShell`, which calls
`openWindow` itself. Same mechanism (`route` → `navigate`), three
different entries, two different outcomes — the corrected comment says
so explicitly instead of implying a rule that only happened to hold by
coincidence.

### CS lens

This is exactly why a comment describing *emergent* behavior of a data
structure ("everything in this array currently does X") is riskier
than one describing what the *code itself* guarantees. **Recognized
in:** a database's stale doc-comment claiming "this column is always
non-null" after a later migration allowed nulls, with no compiler or
runtime check that would have caught the comment going out of date;
a README's "supported browsers" list that quietly stops matching what
the code actually requires after a later PR raises the minimum version
without anyone updating that one paragraph.

### SE lens

The alternative to fixing the comment would be leaving it and trusting
future readers to notice the mismatch themselves by reading all three
entries and `openPinnedApp` closely enough to spot it — the same trust
that let it go stale unnoticed the moment this change landed. Comments
describing "why," attached physically next to the code whose behavior
prompted them, are only as reliable as whoever edits that code
remembering to re-read and update every comment nearby — which is
exactly the discipline this fix is: not a new feature, a maintenance
habit applied to a two-line addition that touched a claim three lines
above it.

## Connect the pieces

Adding Canvas Notes to `PINNED_APPS` needed nothing new from
`01-...md`'s array/object/`.map()`/`route` mechanics — the entire
change was one object, taking a branch that already existed. What *was*
new is noticing that the comment sitting above that array was making a
claim specific to the two entries that existed before, and that a
third entry taking the same `route` field for a different underlying
reason broke that claim silently. Fixing code and fixing the comment
describing it are two different edits, and only one of them shows up
in a diff of behavior.

## What breaks without this

Nothing user-visible — this is a maintainability failure, not a
runtime one. Left unfixed, a future contributor reading only the old
comment before adding a fourth pinned app would reasonably conclude
"routes bypass the floating-window manager," add a genuinely
full-page app expecting the same, and be confused when a *different*
future addition (one that, like Canvas Notes, points at `/lab/:labKey`)
opens in a floating window instead — the comment would have actively
misled them, with nothing to say it might be wrong.

## Exercises

- Find one other comment anywhere in `Taskbar.jsx` that describes
  something about the *current* contents of `PINNED_APPS` or `windows`
  rather than a rule the code itself enforces. Ask whether a future
  addition to either array could make it false the same way this one
  did.

## Definition of done

- [ ] `PINNED_APPS` has a `canvas-notes` entry using `route: '/lab/canvas-notes'`
- [ ] The comment above `PINNED_APPS` describes `route` accurately for
      all three entries, not just the two it was originally written
      against
- [ ] Verified live: the taskbar shows a Canvas Notes icon; clicking it
      opens the lab in a floating window with its drawing toolbar and
      content loaded, not a blank shell
- [ ] You can explain, without notes, why `route: '/lab/canvas-notes'`
      still results in a floating window even though `route` fields
      elsewhere in the same array explicitly avoid one
- [ ] The change is committed:

```bash
git add src/components/desktop/Taskbar.jsx
git commit -m "Pin Canvas Notes in the taskbar, and correct the PINNED_APPS comment — it implied all `route` entries skip the floating-window manager, which stopped being true the moment this entry (routing into EntryShell, same as any other lab) was added"
```
