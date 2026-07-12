# Lesson 3 — State: The Phone Frame and a Loading Indicator

Today we study **state** — the idea that a component can remember something between
renders and change what it shows in response to events. Our case study is two real
features that both need it: a toggle between "phone frame" view and "full editor"
view, and a loading indicator that disappears once DartPad has actually finished
loading. Two different features, same underlying tool — a deliberate repetition, on
purpose, so you see `useState` solve two genuinely different problems back to back.

---

## What You Will Build

A button that switches `FlutterPlaygroundLab` between two visual modes: a **phone
frame** (the DartPad iframe shown small, centered, and visually framed to look like
a physical phone — the actual teaching payoff of this whole lab: students see real
mobile screen constraints, not an arbitrary rectangle) and a **full editor** view
(the iframe filling the whole window, easier to actually write code in). You'll also
add a loading spinner that shows while DartPad's iframe is still loading and
disappears the instant it's ready, instead of showing a blank white rectangle for
the first second or two.

---

## What You Need to Know First

Lessons 1 and 2 of this set. You should have a working iframe embed with
`sandbox="allow-scripts"` and understand what an origin is. Nothing else is assumed.

---

## The Lesson

### Step 1 — Why a Component Needs to "Remember" Anything

Every component you've written so far in this lesson set has been **stateless** —
`Greeting`, `Announcement`, and `FlutterPlaygroundLab` all compute their entire
output purely from their props, every single time they render, with no memory of
anything that happened before. That's fine for content that never changes while
you're looking at it. It falls apart the instant you need something to *change in
response to a click*, because a plain JavaScript function has no way to remember
"the last time I ran, the user had clicked the button" — each call starts fresh,
exactly as `double(21)` in Lesson 1 owes nothing to any previous call to `double`.

React solves this with a **hook** called `useState`. A hook is a special kind of
function — its name always starts with `use`, by a strict convention React itself
enforces — that lets a function component tap into React's own machinery for things
plain functions can't do alone, like remembering a value across renders.

#### Concept lab: the smallest possible counter

Disposable, deleted at the end of this step.

Create `src/labs/_scratch/Counter.tsx`:

```typescript
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  )
}
```

**`import { useState } from 'react'`** — an import statement, same shape as every
import you've seen. `react` (no `./` prefix) is a **bare specifier** — it means
"look this up in `node_modules`," the folder where every installed package lives,
rather than "look in this same folder" (which is what a `./`-prefixed path means).
`react` is the package this entire app is built on; `useState` is one specific
function it exports.

**`const [count, setCount] = useState(0)`** — this is the single densest line in
this lesson, and it deserves being taken apart piece by piece.

`useState(0)` is a function call. `0` is the **initial value** — what `count` will
be the very first time this component ever renders. `useState` returns exactly two
things, always, in this fixed order: the **current value**, and a **function to
change it**. `const [count, setCount] = ...` is **array destructuring** — the same
family of shorthand as the object destructuring you saw in Lesson 1's
`{ message }: AnnouncementProps`, but for arrays instead of objects: it pulls the
first returned item into a variable named `count`, and the second into a variable
named `setCount`. The names `count` and `setCount` are not required by React — you
could call them anything — but "value, setValue" is such a strong, universal
convention in this codebase and in React generally that breaking it would make your
code harder for anyone (including future you) to read at a glance.

**`onClick={() => setCount(count + 1)}`** — `() => setCount(count + 1)` is an
**arrow function** (explained fully now, first appearance in this lesson set): the
empty `()` means it takes no parameters, and `=> setCount(count + 1)` is what it
does when called — call `setCount` with the current `count` plus one. **Why this has
to be wrapped in a function instead of writing `onClick={setCount(count + 1)}`
directly:** without the wrapping arrow function, `setCount(count + 1)` would run
*immediately*, the instant this component renders — JSX evaluates whatever's inside
`{ }` right away. Wrapping it in `() => ...` creates a function *value* — a
description of "do this later" — that React stores and calls only when the actual
click happens, not while it's just building the description of what to render.

**What `setCount` actually does, mechanically, when it's called:** it does *not*
just change a variable in place. It tells React "the next time this component
renders, `count` should be this new value" — and React responds by scheduling a
**re-render**: it calls `Counter()` again, from the top, and this time
`useState(0)`'s "initial value" argument is ignored (React already knows this
component has state and remembers what it currently is) and `count` comes back as
the new number instead. The JSX `<p>Current count: {count}</p>` is a completely new
description built from that new value, and React updates only the specific DOM text
that actually changed — not by throwing away and rebuilding the whole page, a detail
this lesson doesn't need to go deeper on yet, only that it happens.

Render `<Counter />` the same probe way as before — temporarily import and place it
in `HomePage.jsx`, run the app, and click the button several times. **Expected
output:** the number visibly increases with each click, starting at 0. This is state
working: the same component instance, remembering something, across multiple
separate renders, purely because of `useState`.

Delete `src/labs/_scratch/Counter.tsx` and the probe lines in `HomePage.jsx` now.

**CS lens:** This is the introduction of **mutable state into an otherwise pure
computation** — recall Lesson 1's CS lens calling a component "a pure function of
its inputs." `useState` is React's controlled, structured escape hatch from that
purity: state genuinely changes over time, but *only* through `setCount`, never by
directly reassigning `count`, which keeps the "when does this change and why" fully
traceable — every state change in this app happens through some `setX` call you can
search for and find.

**SE lens:** This is **encapsulation of mutable state**: nothing outside `Counter`
can reach in and directly modify `count` — the only way to change it is calling
`setCount`, which `Counter` controls entirely. Compare this to a global variable
that any code anywhere could reassign — that would make it impossible to reason
about where a change came from. Confining state to the component that owns it, and
exposing only a controlled way to change it, is the same idea private class fields
and getter/setter methods enforce in object-oriented languages.

**Recognition — this "controlled mutation through one gate" shape recurs in:**
database transactions (data only changes through `UPDATE`/`INSERT` statements, never
by directly editing files on disk), Redux and other state-management libraries
(state only changes by dispatching an action, never by mutating the store directly),
version control (a file's history only changes through commits, not by silently
editing history), and encapsulated class fields in any OOP language.

---

### Step 2 — The Real Toggle: Phone Frame vs. Full Editor

Real project code now. `FlutterPlaygroundLab.tsx` needs a piece of state
remembering which of two view modes is active. Update it:

```typescript
import { useState } from 'react'

type ViewMode = 'phone' | 'full'

export default function FlutterPlaygroundLab({ onBack, onClose }: FlutterPlaygroundLabProps) {
  const close = onBack ?? onClose
  const [viewMode, setViewMode] = useState<ViewMode>('phone')
  const dartPadUrl = 'https://dartpad.dev/embed-flutter.html?theme=dark&run=true&split=50'

  return (
    <div className="relative flex h-full w-full flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 px-4 dark:border-white/10">
        {close && (
          <button
            onClick={close}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
          >
            Labs
          </button>
        )}
        <span className="font-black tracking-tight text-slate-900 dark:text-slate-100">
          Flutter Playground
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setViewMode(viewMode === 'phone' ? 'full' : 'phone')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
        >
          {viewMode === 'phone' ? 'Switch to full editor' : 'Switch to phone view'}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
        {viewMode === 'phone' ? (
          <div className="h-[640px] w-[320px] shrink-0 overflow-hidden rounded-[36px] border-[10px] border-slate-900 bg-black shadow-2xl dark:border-slate-700">
            <iframe
              src={dartPadUrl}
              title="DartPad — live Flutter editor"
              sandbox="allow-scripts"
              allow="clipboard-write"
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <iframe
            src={dartPadUrl}
            title="DartPad — live Flutter editor"
            sandbox="allow-scripts"
            allow="clipboard-write"
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  )
}
```

**`type ViewMode = 'phone' | 'full'`** — a **type alias** for a **union of string
literal types**. This is a genuinely new piece of TypeScript syntax: `'phone'` and
`'full'` here are not the general type `string` (which would accept *any* string,
`'banana'` included) — each one is a type containing exactly one possible value, and
`|` combines them into a type meaning "exactly one of these specific strings, and
nothing else." Try, right now, changing `setViewMode('phone')` anywhere to
`setViewMode('telephone')` and watch TypeScript reject it immediately — the same
fail-fast guarantee from Lesson 1's `double(value: number)`, now applied to a small,
fixed, named set of valid strings instead of "any number." This is the same shape as
`TransformType`/`EdgeMethod` if you've read any of this session's Decomp Lab or
Image Lab work — a deliberate, small, exhaustive set of valid states, checked at
compile time.

**`useState<ViewMode>('phone')`** — the `<ViewMode>` here is a **generic type
argument**, first appearance in this lesson set. `useState` doesn't know, just by
looking at `'phone'`, whether you intend `viewMode` to ever hold anything besides the
literal string `'phone'` forever — without help, TypeScript would infer the loosest
type that fits, which could just be `string`. Writing `useState<ViewMode>(...)`
tells TypeScript explicitly: "the value this state holds is always a `ViewMode` —
`'phone'` or `'full'`, never anything else, and the starting value happens to be
`'phone'`." This is what makes the earlier `setViewMode('telephone')` mistake catch
at compile time instead of becoming a silent runtime state your UI can't render
correctly (nothing in the JSX below has a branch for `'telephone'`).

**`setViewMode(viewMode === 'phone' ? 'full' : 'phone')`** — `===` is JavaScript's
**strict equality operator**, comparing both value and type with no automatic
conversion (as opposed to `==`, which sometimes converts differing types before
comparing — a frequent source of subtle bugs this codebase, and this lesson series,
avoids entirely by never using `==`). `condition ? valueIfTrue : valueIfFalse` is the
**ternary operator** — a compact `if`/`else` that produces a *value* rather than
running a statement block: read it as "if `viewMode === 'phone'` is true, this whole
expression evaluates to `'full'`; otherwise, it evaluates to `'phone'`." The whole
line reads as "flip to whichever mode isn't currently active."

**`{viewMode === 'phone' ? ( <phone JSX> ) : ( <full JSX> )}`** — the same ternary
operator, now choosing between two entire blocks of JSX instead of two strings.
This is **conditional rendering**, a second technique alongside Lesson 1's `{condition
&& <jsx/>}` — `&&` is right for "render this, or render nothing"; the ternary is
right for "render exactly one of these two alternatives, always one or the other,
never neither." Both compile down to ordinary JavaScript expressions inside JSX's
`{ }` escape.

**The phone-frame styling, piece by piece:** `h-[640px] w-[320px]` are **Tailwind
arbitrary values** — square brackets let you specify an exact CSS value
(`640px`/`320px`, a plausible modern phone screen size) when none of Tailwind's
predefined size classes (`h-8`, `h-full`, etc.) fit what you need. `rounded-[36px]`
gives it the heavily-rounded corners of a physical phone body — far more rounded
than this app's usual UI corners, which is exactly the point: it should visually
read as "phone," not "app panel." `border-[10px] border-slate-900` is a thick, dark
border acting as the phone's physical **bezel** (the rim around a phone's screen);
`bg-black` fills the area behind the iframe in case the iframe hasn't finished
loading yet, so you see black (looking like an off phone screen) instead of the
page's background color bleeding through. `overflow-hidden` clips the iframe's sharp
rectangular corners to the frame's rounded ones — without it, the iframe's corners
would visibly poke out past the rounded bezel.

**Notice the iframe's `sandbox`/`allow`/`title` attributes are identical in both
branches** — this is deliberate repetition, not a mistake to "clean up" yet. A later
step in a future lesson could extract this into a small shared piece to avoid typing
it twice, but this lesson isn't teaching that refactor yet — right now, the
priority is that both branches are independently readable, and premature
abstraction (extracting something into a shared helper before you're sure it won't
diverge) is its own real software engineering mistake, not automatically a virtue.

---

### Step 3 — A Loading Indicator: `useState` Solving a Different Problem

Same tool, genuinely different job. Right now, until DartPad's iframe finishes
loading (which takes a real, noticeable second or two — it's compiling and starting
an actual Dart environment), the user sees blank black nothing. Add a loading state:

```typescript
const [isLoading, setIsLoading] = useState(true)
```

And update *both* `<iframe>` elements to include an `onLoad` handler:

```typescript
<iframe
  src={dartPadUrl}
  title="DartPad — live Flutter editor"
  sandbox="allow-scripts"
  allow="clipboard-write"
  onLoad={() => setIsLoading(false)}
  className="h-full w-full border-0"
/>
```

And render a loading message conditionally, layered on top, right after the
`<iframe>` inside the phone-frame `<div>` (and again in the full-editor branch):

```typescript
{isLoading && (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black text-xs font-semibold text-slate-400">
    Loading DartPad…
  </div>
)}
```

(This requires the phone-frame `<div>` and the full-editor `<iframe>`'s immediate
wrapper to have `className="relative ..."` added, so `absolute inset-0` positions
relative to that box instead of the whole page — a connection back to the
`relative`/`absolute` positioning pair Decomp Lab's onboarding banner used earlier
this session, if you've seen that code.)

**`useState(true)`** — no `<ViewMode>`-style generic argument needed here.
TypeScript looks at the initial value `true` and **infers** the type automatically:
because you handed it a `boolean`, it assumes `isLoading` will always be a
`boolean`, no annotation required. This is the same inference that let
`double(value: number): number` in Lesson 1 not need extra type hints inside its own
body — TypeScript is often able to work out a type from context, and you only write
an explicit type (like `<ViewMode>`) when there isn't enough context for it to guess
correctly on its own, exactly the situation `useState('phone')` was in.

**`onLoad={() => setIsLoading(false)}`** — `onLoad` is a real, standard browser
event, not React-specific — every `<iframe>` (and `<img>`, and a handful of other
elements) fires a `load` event the moment its content has fully finished loading.
React exposes it as the `onLoad` prop, following the same `on` + capitalized-event-name
convention as `onClick`. The handler is another arrow function, same shape as
`setCount`'s — when the real `load` event fires, call `setIsLoading(false)`, which
triggers exactly one re-render, and this time `isLoading` is `false`, so the
`{isLoading && ...}` block renders nothing at all.

**`pointer-events-none`** — a CSS property, not React-specific, that makes an
element (and everything inside it) invisible to mouse clicks — clicks pass straight
through to whatever's underneath. Without it, the loading overlay (even after it's
supposed to have faded, if this were animated) would sit on top of the iframe and
intercept clicks meant for DartPad. Here it matters even while the overlay is
visible: without it, you couldn't click anywhere near the loading iframe at all
while it loads, even though there's nothing to click yet regardless.

---

### Step 4 — Run It

`npm run dev`, open Flutter Playground. **Expected output:** briefly, "Loading
DartPad…" appears centered inside the black phone-frame screen; within a second or
two it disappears and the real DartPad editor is visible and interactive, in the
phone frame by default. Click "Switch to full editor" — the phone frame disappears,
the iframe expands to fill the whole window, exactly as before Lesson 3. Click the
button again — it returns to the phone frame, and (this is worth actually watching
happen) **the loading indicator does not reappear**, because `isLoading` is
component state that persists across re-renders caused by `viewMode` changing — the
iframe itself never reloaded, so `onLoad` never fires again, so `isLoading` stays
`false`. Two independent pieces of state, changing independently, exactly as
designed.

---

## Connect the Pieces

`FlutterPlaygroundLab` now holds two pieces of state: `viewMode` (a `ViewMode`
union, starting at `'phone'`) and `isLoading` (a `boolean`, starting `true`). Both
are read in the JSX to decide what to render, and both are only ever changed through
their own `setX` function — `setViewMode` from a button click, `setIsLoading` from a
real browser `load` event. The iframe's `sandbox`/`allow` attributes from Lesson 2
are unchanged and still apply identically in both view modes — state controls *how*
the iframe is framed and *whether* a loading overlay covers it, never *what
permissions* it runs with; those stay fixed regardless of view mode, exactly as they
should.

---

## What Breaks Without This

Remove the `onLoad` handler entirely (keep `isLoading` state and the overlay JSX):
`isLoading` starts `true` and nothing ever calls `setIsLoading(false)` — the
"Loading DartPad…" overlay covers the iframe **permanently**, forever, even though
DartPad loaded and is fully working underneath it, completely invisible and
unusable behind an overlay that no longer means anything.

Remove `pointer-events-none` from the overlay while `onLoad` still works correctly:
briefly, for the second or two the overlay is visible, any click in that area does
nothing (not even reaching the loading iframe, which has nothing to click yet
anyway) — a small, easy-to-miss defect, but a real one, and the kind that only shows
up if someone clicks unusually fast.

---

## Definition of Done

- [ ] `FlutterPlaygroundLab.tsx` has a working phone-frame / full-editor toggle
      driven by `useState<ViewMode>`
- [ ] A loading indicator appears on mount and disappears exactly once DartPad's
      `onLoad` fires, using a second, independent `useState(true)`
- [ ] Toggling view mode after loading has finished does **not** re-show the
      loading indicator — you watched this yourself, not just read the explanation
- [ ] You can explain what array destructuring pulls out of `useState`'s return
      value, and why the wrapping arrow function in `onClick={() => setCount(...)}`
      is required instead of calling `setCount` directly inline
- [ ] You can explain the difference between `'phone' | 'full'` (a union of string
      literal types) and plain `string`
- [ ] `_scratch/Counter.tsx` and its `HomePage.jsx` probe are deleted
- [ ] `git commit` explaining why: for example, "Add phone-frame/full-editor toggle
      and a real loading indicator to Flutter Playground — two independent pieces of
      component state solving two different UX problems with the same tool"
