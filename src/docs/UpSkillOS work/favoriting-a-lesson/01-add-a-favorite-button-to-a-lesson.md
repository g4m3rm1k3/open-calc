# Lesson — Favoriting a Course Lesson

Today we study **shared state with an inconsistent contract** — what
happens when several independent parts of an app read and write the same
piece of shared data, but never agreed, in writing, on exactly what shape
that data has. Our case study is UpSkillOS's real "Favourites" system (the
app calls it **Pins** internally), and a real, live bug in it, found while
figuring out how to add the thing you actually asked for: a favorite button
on a course lesson page, which — this is worth stating plainly — **does not
exist yet**. Every file and line below is real, current code.

---

## What You Will Build

A working ★ button on any course lesson page (`LessonPage.jsx`) that adds
that exact lesson to Favourites, visible correctly on the home page, in the
Start Menu's pinned list, and in the taskbar utility panel — all three,
because (Step 3 below) those three surfaces currently disagree about what a
pin object should contain, and you're about to fix that disagreement, not
just work around it. You'll also fix a live, reproducible bug this
disagreement already causes for a completely different feature.

---

## What You Need to Know First

Nothing from a prior lesson in this series is required. If you've done the
matrix-reducer lessons, one pattern reappears by name in Step 6: the
**guard clause** from `02-fixing-the-silent-invalid-input-bug.md`.

---

## The Lesson

### Step 1 — The Generic Store: `PinsContext.jsx`

Every favorite in this app — a whole course, a lab, a game, an interactive
widget — is called a **pin**, and every pin lives in one place:
`src/context/PinsContext.jsx`.

```javascript
export function PinsProvider({ children }) {
  const [pins, setPins] = useState(() => {
    try {
      if (!localStorage.getItem('oc-pins-seeded')) {
        localStorage.setItem('oc-pins-seeded', '1')
        localStorage.setItem('oc-pins', JSON.stringify(DEFAULT_PINS))
        return DEFAULT_PINS
      }
      return JSON.parse(localStorage.getItem('oc-pins') || '[]')
    } catch { return DEFAULT_PINS }
  })

  useEffect(() => {
    localStorage.setItem('oc-pins', JSON.stringify(pins))
  }, [pins])

  const addPin = useCallback((pin) => {
    setPins(prev => prev.some(p => p.id === pin.id) ? prev : [pin, ...prev])
  }, [])

  const removePin = useCallback((id) => {
    setPins(prev => prev.filter(p => p.id !== id))
  }, [])

  const isPinned = useCallback((id) => pins.some(p => p.id === id), [pins])
  // ...
}
```

**Walkthrough:** `localStorage` is the browser's persistent key-value
storage — unlike a normal JavaScript variable, it survives a page reload or
closing the browser entirely, because it's written to disk by the browser,
not held in memory. It only stores strings, so writing an array requires
`JSON.stringify(pins)` (turn the array into a text representation) and
reading it back requires `JSON.parse(...)` (turn that text back into a
real array). The `oc-pins-seeded` check is solving a specific, subtle bug
class: the *first* time a user ever opens the app, `localStorage.getItem('oc-pins')`
returns `null` (nothing's been written yet) — but after a user manually
removes every pin, it returns `'[]'` (an empty array, deliberately). Those
two situations — "never set" and "explicitly emptied" — look completely
different to a person but would look identical to naive code checking
`raw !== null` alone, since deleting everything eventually also produces a
falsy-ish empty state. The `oc-pins-seeded` flag is a second, independent
signal that only ever gets written once, the first time, so the code can
tell "never seeded" apart from "seeded, then cleared" — without it,
`DEFAULT_PINS` would either never apply, or would keep coming back after a
user intentionally cleared their favorites.

`addPin` and `removePin` are generic — they operate on `pin.id` only, and
`PinsContext` never looks at any other field on a pin object. That
genericity is the seed of the bug you're about to find: **nothing in this
file enforces what a valid pin actually contains.** Any object with an
`id` is accepted.

**CS lens — the "never set" vs. "explicitly empty" distinction:** this
recurs constantly: SQL's `NULL` versus an empty string, Python's `None`
versus `[]`, an HTTP `404 Not Found` versus a `200` with an empty body, a
`Map` that doesn't have a key versus one where that key's value is
`undefined`. Whenever "nothing here yet" and "deliberately nothing" are
different facts, a single falsy check can't tell them apart — you need a
second, explicit signal, exactly like `oc-pins-seeded` here.

### Step 2 — The Two Places That Already Add a Pin

Before building anything, find every place a pin currently gets created.
There are exactly two.

**`src/components/desktop/StartMenu.jsx`**, right-clicking any app icon:

```javascript
const togglePin = useCallback((pin) => {
  if (isPinned(pin.id)) removePin(pin.id)
  else addPin(pin)
  setContextMenu(null)
}, [isPinned, removePin, addPin])
```

Here, `pin` is the *entire app-list entry itself* — a course, lab, or game
already has `{ id, label, emoji, type, path, ... }` as its natural shape
(matching `DEFAULT_PINS` at the top of `PinsContext.jsx`), so pinning one
from the Start Menu just hands that existing object straight to `addPin`.

**`src/components/viz/VizFrame.jsx`**, the ★ button on an interactive
widget embedded inside a lesson:

```javascript
const pinId = `${id}::${location.pathname}`;
const pinned = isPinned(pinId);

function togglePin() {
  if (pinned) {
    removePin(pinId);
  } else {
    addPin({
      id: pinId,
      title: title || id,
      subtitle: location.pathname.replace("/chapter/", "Ch. ").replace("/", " › "),
      path: location.pathname,
      elementId: `viz-${id}`,
    });
  }
}
```

**Walkthrough:** `pinId` combines the widget's own `id` with the current
URL (`location.pathname`, from React Router's `useLocation()`) using `::`
as a separator — this is a **composite key**, needed because the same
`VizFrame` component (say, a generic angle-slider widget) is reused across
dozens of different lessons; without the pathname half, pinning that same
widget type from two different lessons would collide into a single pin.
Notice this object has *no* `label`, `emoji`, or `color` field — only
`title`, `subtitle`, `path`, `elementId`. Hold onto that; it's the whole
bug.

### Step 3 — Find and Fix a Real, Live Bug

Two different favorites lists exist in this app, and — read carefully —
they read *different field names* off the same pin objects.

`src/pages/HomePage.jsx`'s Favourites section:
```javascript
const meta = GLASS_META[pin.color] ?? GLASS_META.slate
// ...
{pin.emoji}
// ...
{pin.label}
```

`src/components/desktop/StartMenu.jsx`'s own pinned-items list reads the
same two fields, `pin.emoji` and `pin.label`.

`src/components/ui/UtilityPanel.jsx` and
`src/components/desktop/PinsNotesPopup.jsx` (the taskbar's pins popup),
meanwhile, read:
```javascript
{pin.subtitle || "Visualization"}
{pin.title}
```

**Two competing, undocumented shapes exist for the same "pin" concept** —
one reads `label`/`emoji`/`color`, the other reads `title`/`subtitle`.
`VizFrame.jsx` (Step 2) only ever sets the second shape. `PinsContext.jsx`
(Step 1) doesn't enforce either.

**Reproduce it.** Run `npm run dev`, open any lesson containing an
interactive widget (any `*Viz.jsx` component wrapped in `VizFrame` — most
precalculus or calculus lessons have one), click its ★ to pin it, then go
to the home page. Your new favorite renders in the Favourites grid with a
visible emoji and a **blank title** — because `HomePage.jsx` reads
`pin.label`, and this pin never set one. Open the Start Menu — the same
pin appears there with a blank label too. Open the taskbar's pins popup
(`PinsNotesPopup`), though, and it shows correctly — because *that*
surface reads the fields `VizFrame.jsx` actually set.

**The fix — set every field either consumer might read, in one place:**

```javascript
addPin({
  id: pinId,
  label: title || id,
  title: title || id,
  emoji: "📌",
  subtitle: location.pathname.replace("/chapter/", "Ch. ").replace("/", " › "),
  path: location.pathname,
  elementId: `viz-${id}`,
});
```

**SE lens:** The correct long-term fix is unifying `HomePage`/`StartMenu`
and `UtilityPanel`/`PinsNotesPopup` onto one single field set, so a pin
only ever needs to be built one way — that's a larger refactor touching
four files outside this lesson's scope (noted at the end, under Leftover
Cleanup). The fix here is the smallest correct change: since `PinsContext`
enforces nothing, *every* pin producer has to independently know and
satisfy both undocumented shapes until someone unifies them. That's the
real, current contract, whether or not it's written down anywhere — and
now you know it, which is exactly why you're about to build your new pin
producer (Step 6) with both shapes from the start, not discover this bug a
second time.

**Verify the fix:** unpin and re-pin the same widget, confirm it now shows
a correct icon and label in the Favourites grid, the Start Menu, *and* the
taskbar popup — all three, all consistent.

### Step 4 — Confirm the Real Gap: Lessons Can't Be Pinned At All

Search `src/pages/LessonPage.jsx` — the actual component that renders
*every* course lesson in the app — for `usePins`, `addPin`, `isPinned`,
`Favorite`. Nothing matches. `HomePage.jsx`'s Favourites section even says
so directly: *"Pinned from the Start Menu — right-click any item there to
pin or unpin."* You can favorite an entire course from the Start Menu.
You can favorite one interactive widget from inside a lesson (Step 2-3).
You cannot favorite *a lesson itself* — the actual content page you're
reading, as a whole — from anywhere. That's the feature.

### Step 5 — Design the Pin's Identity Correctly, Using a Precedent Already in This File

Before writing the button, decide what `id` a lesson pin should have.
`VizFrame.jsx`'s answer was `location.pathname` — the URL. Don't copy that
here; `LessonPage.jsx` already explains, in its own comments, why that's
the wrong choice for a lesson:

```javascript
// Progress is keyed by the lesson's own stable `id` field, not by the URL
// (route segments mirror file/folder names under src/courses/, and a
// rename there used to silently orphan every existing user's progress —
// confirmed real incident). Namespaced by course because lesson ids are
// NOT globally unique (confirmed real collisions across different
// courses, e.g. "ch3-001" exists in both calculus and precalculus).
const progressKey = courseId && lesson?.id ? `${courseId}::${lesson.id}` : ''
```

This is a **documented real incident**, sitting in the exact file you're
about to extend: someone renamed a lesson's file, its URL slug changed
with it, and every user's saved progress — which had been keyed by that
URL — silently vanished, because the key the app was looking up no longer
existed anywhere. `lesson.id` is a separate, stable field baked into the
lesson's own data, deliberately independent of its file path or URL, exact
for this reason. A pin, like progress, should survive a rename. Reuse the
same key shape:

```javascript
const pinId = courseId && lesson?.id ? `pin::${courseId}::${lesson.id}` : ''
```

The `pin::` prefix keeps a lesson pin's `id` from ever colliding with a
course pin's `id` (which is just the bare `courseId`, per `DEFAULT_PINS`)
or a `VizFrame` pin's `id` (which is `widgetId::pathname`) — three
different producers, three different id shapes, sharing one flat
`localStorage` array; the prefix is what keeps them from accidentally
matching.

**What breaks without this, concretely:** using `location.pathname` (like
`VizFrame` does) as a lesson's pin id would mean renaming a lesson's slug
— exactly the incident already described above — silently orphans the
favorite too, the same way it once orphaned progress, for the exact same
reason, in the exact same file, right next to the code that already
learned this lesson once.

### Step 6 — Decide How the Pin Gets Opened

`src/hooks/usePinLauncher.js` decides what happens when a pin is clicked,
branching on `pin.type`:

```javascript
if (pin.type === 'course' || pin.type === 'nav') {
  if (pin.path) navigate(pin.path)
  return
}
```

There's no `'lesson'` case. Two honest options:

1. **Add one.** A new `if (pin.type === 'lesson') { navigate(pin.path); return }` branch — clearer intent, costs one small, obvious addition to a file whose whole job is exactly this kind of branching.
2. **Reuse `'course'`.** A lesson page's path (`/chapter/${chapterId}/${lessonSlug}`) is just as `navigate`-able as a course's — the existing branch already does exactly what a lesson pin needs, with zero changes to this file.

**SE lens:** option 2 is the smaller, lower-risk change — the same
minimal-blast-radius instinct from the lesson-engine-autofind lessons
(`Omit<SeriesMeta, 'levels'>` kept every downstream consumer unchanged).
Use it for now; if lessons ever need pin-opening behavior that's
genuinely different from a course's (say, scrolling to a specific
paragraph), promoting it to its own `'lesson'` case later is a small,
localized change — not a reason to add the branch pre-emptively today.

### Step 7 — Build the Button

In `src/pages/LessonPage.jsx`, near the top of the component (Step 5's
variables already live here):

```javascript
import { usePins } from "../context/PinsContext.jsx";
// ...
const { addPin, removePin, isPinned } = usePins();
const pinId = courseId && lesson?.id ? `pin::${courseId}::${lesson.id}` : '';
const pinned = pinId ? isPinned(pinId) : false;

function toggleFavorite() {
  if (!pinId) return;
  if (pinned) {
    removePin(pinId);
  } else {
    addPin({
      id: pinId,
      label: lesson.title,
      title: lesson.title,
      emoji: "⭐",
      subtitle: chapter?.title ?? chapterId,
      type: "course",
      path: `/chapter/${chapterId}/${lessonSlug}`,
    });
  }
}
```

**Walkthrough:** `if (!pinId) return` is a **guard clause** — the same
shape used in the matrix-reducer bug-fix lesson to stop `startSession`
proceeding with invalid data. Here it stops `toggleFavorite` from ever
calling `addPin`/`removePin` with an empty string as an id, which would
happen for the (currently) rare lesson that lacks a stable `lesson.id` —
better to make the button silently do nothing for that edge case than
create a pin with a broken, empty identity. Every field discussed in
Step 3 and Step 6 is present: `label`+`title` (both readable shapes),
`emoji`, `subtitle`, and `type: "course"` + `path` so `usePinLauncher`
already knows how to open it.

Now add the button to the breadcrumb row — `LessonPage.jsx` already has an
`ml-auto` utility button here (`🔨 Edit in Builder`); add the favorite
toggle right next to it:

```jsx
<span className="text-slate-700 dark:text-slate-300">
  {lesson.title}
</span>
{pinId && (
  <button
    onClick={toggleFavorite}
    title={pinned ? "Remove from Favourites" : "Add to Favourites"}
    className={`ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-semibold transition-colors ${
      pinned
        ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-amber-300 hover:text-amber-600"
    }`}
  >
    {pinned ? "★ Favourited" : "☆ Favourite"}
  </button>
)}
<button
  onClick={() => navigate(`/lesson-builder/${chapterId}/${lessonSlug}`)}
  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
>
  🔨 Edit in Builder
</button>
```

**Walkthrough:** `{pinId && (...)}` — the whole button is conditionally
rendered; if `pinId` is an empty string (falsy), nothing renders at all,
so a lesson without a stable id simply doesn't offer a favorite button,
rather than offering a broken one. `ml-auto` (a Tailwind CSS utility class
meaning `margin-left: auto`) was moved from the "Edit in Builder" button
onto the new favorite button, since only the *first* item after the
breadcrumb trail should push everything after it to the right edge —
having two `ml-auto`s would fight each other for the same space.

### Step 8 — Verify End to End

Run `npm run dev`, open any course lesson with a stable `lesson.id` — most
lessons loaded through `courseLoader.js` have one; check the Definition of
Done below if a specific lesson's button doesn't appear. Click
"☆ Favourite" — it flips to "★ Favourited" immediately (no page reload;
`isPinned` re-derives from `PinsContext`'s state on every render). Go to
the home page — the lesson appears in Favourites with the correct title
and star icon. Open the Start Menu — same. Open the taskbar's pins popup —
same, because this pin was built with every field either shape needs.
Click the favorite from any of those three surfaces — it navigates back to
the exact lesson. Rename nothing, but *confirm you understand* why this
pin would survive a lesson-slug rename where a `VizFrame`-style,
pathname-based pin would not — that's Step 5's whole point, and it isn't
something you can click-test; it's something you should be able to explain.

---

## Connect the Pieces

`PinsContext.jsx` (Step 1) is deliberately shape-agnostic — it only ever
looks at `pin.id`. That genericity is what let two incompatible shapes
(Step 3) coexist in this app for as long as they have without ever
crashing anything — just silently rendering blank in some places. Adding a
third pin producer (this lesson) without first reading what the existing
consumers actually expect would have added a *third* incompatible shape,
compounding the exact problem you fixed in Step 3. The stable-id lesson
from `progressKey` (Step 5) — already paid for, already documented, in the
same file — is what makes this pin resilient the same way progress
tracking already is. Nothing here required inventing new infrastructure:
every piece was either already generic enough to reuse (`PinsContext`,
`usePinLauncher`'s `'course'` branch) or already had the right precedent
sitting a few lines away (`progressKey`).

---

## What Breaks Without This

Demonstrated directly in Step 3: a pin built with only `title`/`subtitle`
(no `label`/`emoji`) renders with a blank title in `HomePage.jsx`'s
Favourites grid and in `StartMenu.jsx`'s pinned list — silently, no error,
because JSX simply renders `undefined` as nothing. Demonstrated by
citation in Step 5: a pin keyed by URL path instead of `lesson.id` would
repeat a real, already-documented incident — a lesson rename silently
orphaning saved user state, this time favorites instead of progress.
Without the `if (!pinId) return` guard in Step 7, clicking the favorite
button on a lesson that lacks a stable id would call `addPin({ id: '', ... })`
— and because `PinsContext.jsx`'s `isPinned` checks `p.id === id`, *every*
such button across *every* lesson missing an id would then all read as
"pinned" simultaneously, since they'd all share the same empty-string id.

---

## Definition of Done

- [ ] `VizFrame.jsx`'s `addPin` call sets `label` and `emoji` in addition
      to `title`/`subtitle`; re-pinning a widget shows a correct title in
      the Favourites grid, the Start Menu, and the taskbar popup
- [ ] `LessonPage.jsx` has a working ☆/★ Favourite toggle in its
      breadcrumb row, next to "Edit in Builder"
- [ ] The pin's `id` is `pin::${courseId}::${lesson.id}` — not derived from
      the URL
- [ ] The button doesn't render at all for a lesson with no stable
      `lesson.id` (verified by finding one such lesson, or by temporarily
      testing with `lesson?.id` forced to `undefined`)
- [ ] A favorited lesson opens correctly from the home page, the Start
      Menu, and the taskbar pins popup — all three
- [ ] You can explain, without notes, why this pin's id is safe against a
      lesson-slug rename and cite the specific comment in `LessonPage.jsx`
      that proves the app already learned this lesson once, for progress
- [ ] `git commit` with a message explaining why — for example: "Add a
      Favourite toggle to lesson pages, and fix VizFrame pins rendering
      blank in the Favourites grid due to a label/title field mismatch"

---

## Leftover Cleanup Worth Doing (Not Required Above)

**Two pin shapes should become one.** `HomePage.jsx`/`StartMenu.jsx`
(`label`/`emoji`/`color`) and `UtilityPanel.jsx`/`PinsNotesPopup.jsx`
(`title`/`subtitle`) reading different fields off the same stored objects
is a real design debt, not just this lesson's bug. A future pass could
either standardize every consumer on one shape, or add a single
normalizing function (e.g. `normalizePin(pin)` called once, centrally,
wherever pins are read for display) so producers only need to satisfy one
contract and consumers can't drift apart again. Out of scope here — this
lesson's fix (populate both shapes) is the smallest correct change, not
the permanent one.

**`usePinLauncher`'s `'lesson'` type** — noted in Step 6 as the clearer
alternative not taken. Worth revisiting once a lesson pin needs to do
something a course pin's simple `navigate(pin.path)` can't (e.g. scrolling
to a specific reading checkpoint on open).
