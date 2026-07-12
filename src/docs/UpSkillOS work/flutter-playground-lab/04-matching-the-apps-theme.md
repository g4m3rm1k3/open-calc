# Lesson 4 — Matching the App's Theme

Today we study **derived values** and **reacting to context you don't own**. Our
case study is making DartPad's `theme=dark`/`theme=light` parameter follow
UpSkillOS's own light/dark toggle automatically, instead of being hardcoded to
`dark` the way Lesson 2 left it. This is a small amount of new code and a large
amount of a genuinely important idea: a component correctly reflecting *someone
else's* state, without owning that state itself.

---

## What You Will Build

Toggle UpSkillOS's own theme switcher (the sun/moon control in the app's top bar).
With Flutter Playground open, DartPad's own theme flips to match — light app, light
DartPad; dark app, dark DartPad — with no manual action inside the lab itself.

---

## What You Need to Know First

Lessons 1 through 3 of this set: `interface`, `useState`, union types, template
literals. Nothing else is assumed.

---

## The Lesson

### Step 1 — Where the App's Theme Actually Lives

Every part of UpSkillOS that needs to know "are we in dark mode right now" reads
from one shared place: `src/context/ThemeContext.jsx`. This file defines a **React
Context** — a mechanism for making a piece of state available to any component in
the tree, no matter how deeply nested, without manually passing it down as a prop
through every single component in between (a problem informally called **prop
drilling**: imagine `App` → `AppShell` → `HomePage` → `TopicTable` → `AppCard` all
having to accept and forward a `theme` prop just so the one component five levels
down that actually needs it can read it).

This lesson doesn't build a Context from scratch — that's a real, separate concept
worth its own lesson later, and this app already has one, built and working. Today's
job is *consuming* it, which is the far more common thing you'll actually do day to
day: `ThemeContext.jsx` exports a hook called `useGlobalTheme()`, and any component
anywhere in the app can call it to read the current theme.

#### Concept lab: reading a value from Context

Disposable — deleted at the end of this step.

Create `src/labs/_scratch/ThemeProbe.tsx`:

```typescript
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

export default function ThemeProbe() {
  const { isDarkGlobal } = useGlobalTheme()

  return <p>Dark mode is currently: {isDarkGlobal ? 'ON' : 'OFF'}</p>
}
```

**`import { useGlobalTheme } from '../../context/ThemeContext.jsx'`** — two `../`
segments walk *up* two folder levels from wherever this file lives before going back
down into `context/`. Relative import paths are always resolved from the *importing*
file's own location, not from the project root — this is why the exact same import
target needs a different-looking path depending on which file is doing the
importing.

**`const { isDarkGlobal } = useGlobalTheme()`** — object destructuring again (Lesson
1's `{ message }`), this time pulling one specific field out of everything
`useGlobalTheme()` returns. Reading `ThemeContext.jsx`'s own source shows it actually
returns four things (`studioTheme`, `setStudioTheme`, `isDarkGlobal`, `themeStyles`)
— destructuring lets you take exactly the one you need and ignore the rest, rather
than being forced to name and carry around fields you have no use for.

**`{isDarkGlobal ? 'ON' : 'OFF'}`** — the ternary operator from Lesson 3, now
choosing between two plain strings instead of two JSX blocks — the same operator,
applied to a new shape of problem, which is exactly the "one tool, multiple jobs"
point Lesson 3 opened with.

Render `<ThemeProbe />` with the usual temporary `HomePage.jsx` probe. Run the app.
**Expected output:** "Dark mode is currently: ON" or "OFF," matching whatever the
app's actual current theme is. Now click the app's own theme toggle (top bar, the
sun/moon icon) **without touching any code**. **Expected output:** the text updates
immediately, live, to the new value — proving `useGlobalTheme()` isn't reading a
one-time snapshot, it's subscribing to the live value, and this component
automatically re-renders whenever that shared value changes, exactly the same
re-render mechanism `setCount` triggered in Lesson 3, just now driven by a different
component (the theme toggle button) rather than this one.

Delete the probe and its `HomePage.jsx` import now.

**CS lens:** This is **the observer pattern**, though React's implementation hides
almost all of the machinery: `ThemeContext.jsx` is the *subject* holding the current
value; every component calling `useGlobalTheme()` is an *observer*, automatically
notified (via a re-render) whenever the subject's value changes. You never wrote a
subscribe/unsubscribe call yourself — `useGlobalTheme()` handles that entirely,
which is exactly why Context is worth using instead of hand-rolling this
notification system yourself for every new piece of shared state.

**SE lens:** This is **inversion of control** applied to state ownership:
`FlutterPlaygroundLab` will *react* to the theme without ever *owning* it, deciding
it, or being responsible for keeping it in sync with anything — a single shared
owner (`ThemeContext.jsx`) is the one source of truth, and every consumer trusts it
completely rather than keeping its own separate copy (the exact "single source of
truth" idea from `lesson-engine-autofind`'s Lesson 1, now appearing in a completely
different part of the codebase — the same principle, a different context entirely).

**Recognition — this "one shared source, many reactive observers" shape recurs
in:** spreadsheet formulas (every cell referencing `A1` updates automatically when
`A1` changes, with no cell "polling" `A1` itself), pub/sub messaging systems, DOM
events (many `addEventListener` calls all reacting to one click), and database
triggers (many downstream effects reacting to one row change).

---

### Step 2 — Deriving the DartPad URL From the Theme

Real project code. Replace `FlutterPlaygroundLab.tsx`'s hardcoded
`dartPadUrl` constant with a value computed from the live theme:

```typescript
import { useState } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

type ViewMode = 'phone' | 'full'

export default function FlutterPlaygroundLab({ onBack, onClose }: FlutterPlaygroundLabProps) {
  const close = onBack ?? onClose
  const [viewMode, setViewMode] = useState<ViewMode>('phone')
  const [isLoading, setIsLoading] = useState(true)
  const { isDarkGlobal } = useGlobalTheme()

  const dartPadTheme = isDarkGlobal ? 'dark' : 'light'
  const dartPadUrl = `https://dartpad.dev/embed-flutter.html?theme=${dartPadTheme}&run=true&split=50`

  // ...rest of the component unchanged
```

**`const dartPadTheme = isDarkGlobal ? 'dark' : 'light'`** — a **derived value**: a
new piece of information computed directly from existing state (`isDarkGlobal`),
recalculated fresh on every render, never stored in its own `useState`. This is a
deliberate, important choice, worth naming explicitly: `dartPadTheme` does *not*
need `useState('dark')` of its own. If it *did* have separate state, you'd need
extra code keeping it manually synchronized with `isDarkGlobal` every time that
changed — two sources of truth, needing to agree, the exact duplication problem
Step 1's SE lens just named. Because `dartPadTheme` is *computed* fresh from
`isDarkGlobal` every render, instead of stored, it is **structurally impossible**
for it to disagree with the real theme — there's no separate copy that could drift.

**`` `https://dartpad.dev/embed-flutter.html?theme=${dartPadTheme}&run=true&split=50` ``**
— a **template literal**, using backticks (`` ` ``) instead of quotes, and `${ }` to
embed an expression's value directly inside the string. This produces exactly the
same kind of URL string as Lesson 2's hardcoded version, except `theme=` now
contains whatever `dartPadTheme` currently evaluates to — `dark` or `light` —
recomputed fresh every render, which means every time `isDarkGlobal` changes (theme
toggle clicked), this whole component re-renders, `dartPadTheme` is recalculated,
`dartPadUrl` is rebuilt with the new theme value, and the `<iframe>`'s `src` prop
receives a genuinely different URL string.

**A consequence worth predicting before you see it:** because `src` is now a
*different string* than before, the browser treats this as loading an entirely new
page into the iframe — same as typing a new URL into an address bar — not as some
lighter "just repaint it a different color" update. That means DartPad **reloads
completely** every time the app's theme is toggled, including re-running `onLoad`
(so `isLoading` briefly becomes relevant again) and resetting any unsaved edits the
student made in the code editor. This is a real, honest tradeoff, not a hidden bug —
see Step 3.

---

### Step 3 — Run It, and See the Tradeoff You Just Read About

`npm run dev`, open Flutter Playground. Confirm it loads with whatever theme the app
is currently in. Type something into the DartPad code editor — anything, a comment,
an extra blank line — without running it. Now click UpSkillOS's own theme toggle in
the top bar.

**Expected output:** the phone-frame bezel and surrounding UI instantly reflect the
app's new theme (that part is ordinary Tailwind `dark:` classes, unrelated to this
lesson). DartPad itself briefly shows the "Loading DartPad…" overlay again, then
reloads showing its *default* starter code in the new theme — **your typed edit is
gone**, because the iframe didn't change color in place, it loaded a genuinely new
page.

This is worth sitting with rather than immediately "fixing," because it's a real
engineering tradeoff with no free option: reacting live to theme changes costs
losing in-progress edits on toggle; *not* reacting live would mean DartPad's theme
permanently mismatches the rest of the app the instant a user switches — every
component you build eventually has some version of this exact tension between
"always fresh" and "preserve what the user was doing." Naming a tradeoff explicitly,
rather than silently picking a side, is itself part of doing this well. A future
lesson could address it (loading student code into `localStorage` before reload,
using DartPad's postMessage API to change its theme without a full reload); this
lesson deliberately stops at "know exactly what you traded, and why," which is
often the actually-correct stopping point for a first version of a feature.

---

## Connect the Pieces

`FlutterPlaygroundLab` now reads the app's shared theme through
`useGlobalTheme()` — the same Context every other themed part of this app already
reads from — and derives `dartPadTheme`/`dartPadUrl` fresh on every render rather
than storing its own separate copy. No new `useState` was needed for this lesson;
Lesson 3's two state pieces (`viewMode`, `isLoading`) are untouched, and this
lesson's new behavior layers on top of them without modifying either.

---

## What Breaks Without This

Go back to Lesson 2's hardcoded `theme=dark` and never read `isDarkGlobal` at all:
DartPad stays permanently dark regardless of the app's own theme — switch
UpSkillOS to light mode, and the phone frame's *surrounding* UI turns light while
the DartPad editor inside it stays jarringly, permanently dark. Nothing crashes;
it's simply visually wrong, and — this is the important part — **it would look
correct to whoever built it and only ever tested in dark mode**, which is exactly
why deriving from the real shared value, rather than hardcoding whatever your own
screen happened to show while you were building it, matters.

---

## Definition of Done

- [ ] `FlutterPlaygroundLab.tsx` reads `isDarkGlobal` from `useGlobalTheme()` and
      derives `dartPadTheme`/`dartPadUrl` from it — no hardcoded `theme=dark`
      remains
- [ ] Toggling the app's theme while Flutter Playground is open visibly changes
      DartPad's own theme, and you watched this happen yourself
- [ ] You can explain why `dartPadTheme` does not have its own `useState`, and what
      would go wrong (specifically) if it did
- [ ] You can explain, in your own words, why changing an iframe's `src` causes a
      full reload rather than an in-place update — and you observed the "typed
      edit disappears on theme toggle" tradeoff directly, not just read about it
- [ ] `_scratch/ThemeProbe.tsx` and its `HomePage.jsx` probe are deleted
- [ ] `git commit` explaining why: for example, "Derive DartPad's theme param from
      the app's real useGlobalTheme() state instead of hardcoding dark — accepting
      the known tradeoff that theme toggles reload the embed and lose unsaved edits"
