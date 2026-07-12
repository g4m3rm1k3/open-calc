# Lesson 6 — Definition of Done: Shipping the Feature

Today we study **the difference between "works when I tried it" and "handles what I
didn't try."** Our case study is closing the two real gaps still open in Flutter
Playground: nothing happens if DartPad fails to load (no network, DartPad itself
down, a typo'd gist ID), and there's no way to get back to a known-good state
without manually clicking the dropdown and toggle back. Both are small. Both are the
difference between a demo and a feature you'd actually ship.

This is also the last lesson in this set. By the end, Flutter Playground stops being
"the thing we're building through these lessons" and becomes, plainly, a real part
of this app — no different in standing from Decomp Lab or Image Lab.

---

## What You Will Build

An error state that appears if DartPad fails to load, instead of a permanently
blank iframe. A "Reset" button that returns the lab to its default view mode and
example in one click. Updated `meta`/registry descriptions reflecting that this is a
finished feature, not a placeholder. A final, whole-feature verification pass.

---

## What You Need to Know First

Lessons 1 through 5 of this set, in full — this lesson doesn't introduce as much
brand-new syntax as the earlier ones; it's mostly applying everything already taught,
plus one new browser event.

---

## The Lesson

### Step 1 — What Happens Right Now If DartPad Fails to Load

Before writing anything, cause the failure honestly, so "what breaks without this"
isn't hypothetical. Temporarily change `dartPadUrl` to a URL that cannot possibly
resolve:

```typescript
const dartPadUrl = 'https://this-domain-does-not-exist-12345.dev/'
```

Run the app, open Flutter Playground. **Expected output:** "Loading DartPad…" stays
on screen **forever** — `isLoading` started `true`, and nothing ever calls
`setIsLoading(false)`, because `onLoad` only fires on a *successful* load; a failed
one never fires it. The user is left staring at a permanent loading message with no
indication anything is actually wrong, no way to know if it's still "about to
finish" or broken forever. Revert `dartPadUrl` back to the real template literal
from Lesson 5 before continuing.

**This is the same failure shape as Lesson 3's "what breaks without `onLoad`"
section** — a permanently-stuck loading state — caused by a genuinely different
trigger (a real network/load failure, instead of a missing handler). Recognizing
that two different bugs produce the identical symptom is itself a real debugging
skill: the fix in Lesson 3 was adding the handler that was missing; the fix here has
to be a *different* handler entirely, because `onLoad` already exists and correctly
does nothing when the load fails — it was never supposed to fire in that case.

---

### Step 2 — Handling the Failure: `onError`

Add one more piece of state, alongside `viewMode` and `isLoading`:

```typescript
const [hasError, setHasError] = useState(false)
```

Add `onError` next to the existing `onLoad` on both `<iframe>` elements:

```typescript
<iframe
  src={dartPadUrl}
  title="DartPad — live Flutter editor"
  sandbox="allow-scripts"
  allow="clipboard-write"
  onLoad={() => setIsLoading(false)}
  onError={() => { setIsLoading(false); setHasError(true) }}
  className="h-full w-full border-0"
/>
```

And render an error message, replacing the loading overlay when `hasError` is true
(both need to layer in the same relative-positioned container from Lesson 3):

```typescript
{hasError ? (
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-4 text-center text-xs font-semibold text-red-400">
    <span>DartPad couldn't load.</span>
    <span className="text-slate-500">Check your internet connection and try again.</span>
  </div>
) : isLoading ? (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black text-xs font-semibold text-slate-400">
    Loading DartPad…
  </div>
) : null}
```

**`onError={() => { setIsLoading(false); setHasError(true) }}`** — `onError` is a
real, standard browser event (same category as `onLoad`), firing when an element
that loads external content — `<iframe>`, `<img>`, `<script>` — fails to load it,
for any reason: no network, DNS failure, the server refusing the connection, and
more. **The arrow function's body here is wrapped in `{ }` with two statements
inside**, a syntax difference from every arrow function so far in this lesson set.
`() => setCount(count + 1)` (Lesson 3) had no `{ }` — that shorthand form is only
valid for a single expression, and it *implicitly* returns that expression's value.
The moment you need more than one statement — here, two separate `setX` calls in
sequence — you need `{ }` around the body, and with `{ }` present, nothing is
returned automatically; you'd need an explicit `return` if a value actually needed
returning (it doesn't, here — `void`, same as Lesson 1's `onBack?: () => void`).

**`{hasError ? (<error JSX>) : isLoading ? (<loading JSX>) : null}`** — a **chained
ternary**: the first `?`/`:` picks between "show the error" and "evaluate the next
part," and that next part is itself another full ternary picking between "show
loading" and `null` (render nothing). Read it top to bottom: if there's an error,
show the error, full stop — check nothing else. Otherwise, if still loading, show
loading. Otherwise, show nothing. This correctly handles all three states as
mutually exclusive, because `hasError` is checked first and short-circuits the rest
— you'll never see both messages at once, and once you understand this reads as
"if / else if / else" but written as an expression instead of statements, chained
ternaries stop being intimidating and start being exactly that familiar shape.

---

### Step 3 — Verify the Fix

Repeat Step 1's broken-URL experiment, now with `onError` in place. **Expected
output:** "DartPad couldn't load. Check your internet connection and try again."
appears — a specific, honest message, instead of an indefinite spinner. Revert the
URL back to real. Confirm the normal loading → success flow still works exactly as
in every previous lesson (this is worth explicitly re-checking: adding error
handling is a common place to accidentally break the success path by mis-nesting a
condition).

---

### Step 4 — A Reset Button, Exercising Everything at Once

Add one button to the header bar, next to the existing view-mode toggle and
dropdown:

```typescript
<button
  onClick={() => {
    setViewMode('phone')
    setSelectedExampleId('default')
  }}
  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
>
  Reset
</button>
```

**Nothing here is new syntax** — this is deliberate. Every piece (an arrow function
calling two `setX` functions in sequence, reusing state you already built) is
already fully explained by earlier lessons in this set. This step exists to prove
something different: that the individual pieces this series taught — a `useState`
for view mode, a `useState` for the selected example, both changeable independently
— **compose**, cleanly, into a new small feature with zero new concepts required.
That composability was the entire payoff of building each piece as its own clean,
independent unit across Lessons 3 and 5, rather than one tangled block that only
worked one specific way.

Run it: switch to full-editor view, pick "Your own gist," then click Reset.
**Expected output:** both instantly return to phone view and the default example —
proving `setViewMode` and `setSelectedExampleId` genuinely are independent, since
one button correctly resets both without disturbing `isLoading`/`hasError`, which
correctly *do* still respond naturally to whatever load DartPad ends up doing next.

---

### Step 5 — Ship It: Remove the "Coming Soon" Language

This lab is no longer a placeholder. Update both `meta` objects — in
`src/labs/flutter-playground/index.jsx` and the matching entry in
`src/labs/registry.js` — removing the "Currently a placeholder" sentence from
Lesson 1:

```javascript
desc: 'A live, editable Flutter/Dart code editor embedded right in the app, shown in a phone-frame mockup by default so real mobile screen constraints are visible while you work. Pick a starter example, switch to full-editor view for more room, and everything reflects the app\'s own light/dark theme automatically.',
```

**Why this matters as its own step, not just cosmetic cleanup:** `desc` is what a
student browsing Explore or the Start Menu reads *before* ever opening this lab —
it's a promise about what they're about to get. Leaving stale "coming soon" language
in a finished feature actively undersells it and could make someone skip past
something that's actually done. Keeping user-facing descriptions honestly in sync
with what the code actually does **right now** is itself a real, ongoing software
engineering discipline, not a one-time task — the same discipline this entire app's
`registry.js`/`meta.js` files depend on across every lab in it.

---

## Connect the Pieces

Flutter Playground now has four independent pieces of state — `viewMode`,
`isLoading`, `hasError`, `selectedExampleId` — each owned entirely by this one
component, each changed only through its own `setX` function, each reacting to a
different real trigger (a button click, an `onLoad` event, an `onError` event, a
`<select>`'s `onChange`). None of them know about each other directly; they simply
all happen to be read together in the same render to decide what to show. This is
the actual shape of most real UI components you'll build in this app going forward
— not one big tangled state object, several small independent ones, composed.

---

## What Breaks Without This

Demonstrated concretely in Step 1: without `onError`, a failed load is
indistinguishable, from the user's point of view, from "still loading, just taking
a while" — forever. There is no way to tell those two states apart without this
lesson's fix, and a user experiencing it has no path forward except guessing to
reload the whole lab and hoping.

---

## Definition of Done — For the Whole Series

This checklist covers the entire feature, Lessons 1 through 6, not just today:

- [ ] `FlutterPlaygroundLab.tsx` has zero TypeScript errors — run
      `npx tsc --noEmit` against the project and confirm nothing in this file is
      reported
- [ ] The lab is reachable from Explore, the Start Menu, and search, with an
      accurate, non-placeholder description
- [ ] DartPad loads in phone-frame view by default, is editable and runnable, and
      switching to full-editor view and back both work
- [ ] The theme toggle in the app's top bar changes DartPad's theme
- [ ] The starter-example dropdown correctly switches between the default counter
      and your own real gist
- [ ] A broken/unreachable URL shows the error message, not a permanent spinner —
      and you verified this by actually breaking it, both today and in Lesson 3
- [ ] The Reset button returns view mode and selected example to their defaults in
      one click
- [ ] Every `_scratch/` probe file created across all six lessons has been deleted
      — check `src/labs/_scratch/` doesn't exist at all right now
- [ ] You can, without opening this lesson set again, explain to someone else: what
      `sandbox`/`allow` do and why they're set the way they are; why `dartPadUrl` is
      a derived value instead of stored state; what makes the `<select>`
      "controlled"; and why `onError` was necessary even though `onLoad` already
      existed
- [ ] `git commit` explaining why: for example, "Add error handling and a reset
      control to Flutter Playground, and update its listing copy to reflect a
      finished feature — closes out the six-lesson build with the last two real
      gaps a shipped feature needs that a working demo doesn't"

---

*This is the end of the Flutter Playground Lab lesson set. Everything built across
these six lessons — a typed component, a sandboxed third-party embed, two
independent `useState` toggles, live Context consumption, a typed array driving a
controlled form input, and error handling — are not "Flutter Playground techniques."
They are the actual, general shape of a large fraction of what you will build in
this app, and in React generally, from here forward. The next feature you build
will reuse nearly all of it.*
