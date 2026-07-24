# A Taskbar Shortcut That Quietly Navigated You Away From Your Course

## What You Will Build

`02-...md` gave Canvas Notes a taskbar icon using `route:
'/lab/canvas-notes'` — the same generic URL every other way of opening
this lab already uses. That lesson even noted, correctly, that this
route still ends up opening a floating window, just by a different
path (`EntryShell` → `openWindow`) than a direct `loader`. What it
didn't check: whether taking that different path had any side effect
of its own. It does — and this lesson fixes it, switching the entry to
`loader`, the same direct-open mechanism `StartMenu.jsx` already uses
for every lab it opens.

## What You Need to Know First

`01-...md` and `02-...md` in this same folder — assumed fresh: the
`PINNED_APPS` array, `route` vs `loader` in `openPinnedApp`, and
`.map()`. `lab-registry-autofind/01-...md` — assumed fresh: `meta.js`
as the source of truth for a lab's identity.

---

## The Lesson

### Where you're working

`src/components/desktop/Taskbar.jsx`'s `PINNED_APPS` array, one
entry changed from `route` to `loader`. Compare against
`src/components/desktop/StartMenu.jsx`'s `handleOpenLab`, which
already does this correctly for every lab reachable from the Start
Menu — nothing there needed to change.

### Concept Unit: Two Paths to the Same Window, One With an Extra Step

#### The Problem

`route: '/lab/canvas-notes'` and `loader: () => getLabEntry('canvas-notes')...`
both end with the exact same floating window on screen. `02-...md`
already established that. What it didn't trace all the way through:
`route` doesn't go there *directly*. `navigate('/lab/canvas-notes')`
renders `App.jsx`'s `/lab/:labKey` route, which is `<EntryShell .../>`
— and `EntryShell` does two things once it's loaded the lab, not one:

```js
// EntryShell.jsx, the effect that runs once the lab's component is loaded
openWindow({ id: key, label: entry.label, /* ... */ })
navigate(backTo, { replace: true })   // ← this line
```

`backTo` for every lab opened this way is `"/labs"` (set in `App.jsx`
alongside the route). That second line is invisible if you're already
looking at the Labs gallery when you click something — you don't
notice a navigate-to-`/labs` when you're already on `/labs`. It's very
visible the moment you're anywhere else.

#### Introduce the Concept in Isolation

Verified directly against the real app, this session — not a
reproduction, the actual bug as a user would hit it:

```js
// Starting point: any page that isn't /labs or / — standing in for
// "in the middle of a course or another lab."
await page.goto('.../#/reference')
console.log(await page.evaluate(() => location.hash))   // '#/reference'

// Click the Canvas Notes taskbar icon (ORIGINAL code — route: '/lab/canvas-notes')
await taskbarButton.click()
console.log(await page.evaluate(() => location.hash))   // what does this print?
```

With the original `route`-based entry, the second `console.log`
prints `'#/labs'` — not `'#/reference'`. The URL changed twice in
quick succession (`/reference` → `/lab/canvas-notes` → `/labs`)
before the user ever got a chance to look at anything. Closing the
newly-opened window at that point leaves the Labs gallery on screen,
not the reference page the user actually started on.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/components/desktop/Taskbar.jsx`
- **Change type:** fix (swap `route` for `loader` on one entry)
- **Dependencies:** `src/labs/labLoader.js`'s `getLabEntry` — already
  used by `StartMenu.jsx` and `EntryShell.jsx`, imported here for the
  first time by `Taskbar.jsx`

#### The New Code

```js
import { getLabEntry } from '../../labs/labLoader.js'

const PINNED_APPS = [
  { id: 'rpg-workout', label: 'RPG Workout', emoji: '⚔️', route: '/rpg-workout' },
  { id: 'brain', label: 'Brain Training', emoji: '🧠', route: '/brain' },
  { id: 'canvas-notes', label: 'Canvas Notes', emoji: '🗒️', loader: () => getLabEntry('canvas-notes').then((e) => e.component) },
]
```

#### The Updated Project

(Shown whole above — `openPinnedApp` itself, established in `01-...md`,
needed no changes at all: it already had a `loader` branch, just
nothing in `PINNED_APPS` had used it until now.)

Real output after the fix, exact same sequence repeated:
```
URL before opening Canvas Notes: #/reference
URL immediately after opening Canvas Notes: #/reference
Canvas Notes window actually opened (pen tool present): true
URL after closing the window: #/reference
Still on the Reference page (not stranded on Labs): true
```

#### Mechanical Walkthrough
- `getLabEntry('canvas-notes')` — the exact function
`labLoader.js` exports and `StartMenu.jsx`/`EntryShell.jsx` already
call; it returns `{ ...meta, component }` for the given lab key,
resolving the dynamic `import()` under the hood. `.then((e) =>
- e.component)` — established `async`/`await`-adjacent Promise chaining (`01-...md`'s `async`/`await` lab covers the same mechanism) — unwraps

just the `component` field, matching exactly what `openPinnedApp`'s
existing `const Component = await app.loader()` line expects to
receive. Nothing about `openPinnedApp` changed; it was always capable
of this, waiting for a `PINNED_APPS` entry that actually used it.

#### CS Lens

Two code paths that produce the *same visible result* in the common
case, but differ in a side effect that only manifests under a specific
starting condition, is exactly the shape of a race condition or a
context-dependent bug: correct-looking in the environment it was
tested in (the Labs gallery, where a navigate-to-`/labs` is invisible),
wrong in an environment that wasn't tried (anywhere else). Two
different execution paths reaching "the same" outcome by different
means is worth distrusting until you've actually traced *both* all the
way through, not just confirmed they end up looking similar on screen.

#### SE Lens

- The alternative fix — leaving `route` in place and instead changing
`EntryShell`'s `backTo` to remember wherever the user came from,
- rather than a fixed `"/labs"` — would also solve this, and would fix
it for *every* lab opened via a route-based trigger, not just Canvas
Notes' taskbar shortcut. It's a bigger, riskier change (touching
`EntryShell.jsx`, used by every lab in the app) for a problem that, for
this one shortcut, has a simpler fix already sitting one line away:
use the direct-open path that already exists and that `StartMenu.jsx`
already trusts for this exact purpose. Worth flagging as a real
follow-up if this same navigate-away behavior turns out to bother users
elsewhere (e.g., searching for a lab from the Start Menu while
mid-lesson) — but out of scope for fixing one taskbar icon.

#### Connect to What Came Before

`02-...md` traced `route` all the way to "ends up in a floating
window" and stopped there, treating that as the end of the story. This
lesson is what happens when you keep tracing one step further — the
same discipline `canvas-notes-lab/04-...md`'s `insertBefore` bug and
this same folder's `02-...md` comment fix both came from: something
that looks finished until it's actually exercised end-to-end, from a
real starting condition, not just checked against the case that
happened to be easy to test.

## Connect the Pieces

Canvas Notes' taskbar icon now opens the exact same way
`StartMenu.jsx` already opens every lab: `getLabEntry(key)` resolves
the component directly, `openWindow(...)` renders it as a floating
window, and nothing about the browser's URL is ever touched. Whatever
page the user was on — a lesson, another lab, the reference library —
stays exactly where it was, underneath the new window, and reappears
exactly as it was the moment that window is closed.

## What Breaks Without This

Verified live, this session, both ways: with the original
`route`-based entry, opening Canvas Notes while on any page other than
`/labs` silently rewrites the URL twice (to `/lab/canvas-notes`, then
to `/labs`) before the user can react, and closing the window leaves
the Labs gallery on screen instead of wherever they actually started.
With the fix, the URL never changes at any point in the sequence.

## Exercises

- Open Canvas Notes from the Start Menu instead of the taskbar, from
  several different starting pages. Confirm it already behaved
  correctly before this lesson — explain why, given
  `StartMenu.jsx`'s `handleOpenLab` was never the buggy code path.
- `RPG Workout` and `Brain Training` still use `route`, and are still
  correct to — they're meant to replace the current page with a
  dedicated full page, not float above it. Explain, in your own words,
  the one-sentence rule for deciding which of `route` or `loader` a
  future pinned app should use.

## Definition of Done

- [ ] Canvas Notes' `PINNED_APPS` entry uses `loader`, calling
      `getLabEntry('canvas-notes')`, not `route`
- [ ] Verified live, this session: opening Canvas Notes from the
      taskbar while on a non-Labs page leaves the URL completely
      unchanged, and closing the window leaves that same page visible
- [ ] You can explain, without notes, the exact two-step sequence
      (`navigate` to the route, then `EntryShell`'s own `navigate` to
      `backTo`) that caused the original bug
- [ ] `git commit` with a message explaining why — for example: "Fix
      Canvas Notes' taskbar icon navigating users away from their
      current page — route-based opening went through EntryShell,
      which redirects to backTo (\"/labs\") after opening; switched to
      the same direct getLabEntry + openWindow path StartMenu.jsx
      already uses, which never touches the URL at all"
