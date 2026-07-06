# React Studio — Lesson 11 — Save and Load

## What You Will Build

Reload the page. Everything is still there — every widget, in its exact position,
with every configured button action intact. This lesson builds a **custom hook**
that combines `useReducer` with `localStorage`, and confronts, directly, a real
limitation of saving anything to disk: a button's action can be saved because it
was designed, back in lesson 10, as a plain string — a decision this lesson finally
explains in full.

---

## What You Need to Know First

Lesson 10 left `App` calling `useReducer(widgetsReducer, initialHistoryState)` for
all widget data, with `ButtonWidget.action` typed as `'none' | 'increment'`.

---

## Concept: Serialization Only Understands Data

**Serialization** is converting an in-memory value into a format that can be stored
or transmitted — here, converting a `HistoryState` object into a JSON string via
`JSON.stringify`, and back via `JSON.parse`. JSON can represent objects, arrays,
strings, numbers, booleans, and `null` — and nothing else. A JavaScript **function**
is not on that list: `JSON.stringify({ onClick: () => {} })` does not throw an
error and does not produce a placeholder — it silently omits the `onClick` key
entirely from the resulting string, as if it had never existed.

This is precisely why `ButtonWidget.action` was designed in lesson 10 as the string
`'increment'` rather than as an actual callback function stored directly on the
widget: a string survives being saved and reloaded perfectly; a function reference
never could. Every widget in this project has always been designed to be *plain
data* — no function ever lives inside a `Widget` object — and this lesson is the
moment that design decision, made three lessons ago without full explanation, pays
off directly.

---

## Step 1 — Build a Persisted Reducer Hook

**The problem:** `useReducer`'s initial state needs to come from `localStorage` when
something was already saved, and every change needs to be written back — logic that
has nothing to do with what widgets specifically are, and everything to do with a
pattern any reducer-managed state could reuse.

```tsx
import { useEffect, useReducer, type Dispatch } from 'react';

function usePersistedReducer<S, A>(
  reducer: (state: S, action: A) => S,
  storageKey: string,
  getDefaultState: () => S,
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? (JSON.parse(saved) as S) : getDefaultState();
    } catch {
      return getDefaultState();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  return [state, dispatch];
}
```

Replace `App`'s `useReducer` call:

```tsx
const [history, dispatch] = usePersistedReducer<HistoryState, WidgetAction>(
  widgetsReducer,
  'react-studio-widgets',
  () => ({
    past: [],
    present: [createRectangleWidget(60, 60), createRectangleWidget(220, 140), createRectangleWidget(380, 60)],
    future: [],
  }),
);
```

Save and reload the page. Move a widget, add another, change a button's label —
then actually reload the browser tab. Everything is exactly as you left it.

**Walkthrough:** `usePersistedReducer<S, A>` is a **generic function** — `S` and `A`
are **type parameters**, placeholders for whatever specific state and action types
the caller provides, filled in here as `<HistoryState, WidgetAction>`. This is what
makes it a genuinely reusable custom hook rather than something hardcoded to
widgets specifically: it could manage any reducer-based state in any future project,
persisted under any key.

`useReducer(reducer, undefined, initializerFunction)` is `useReducer`'s **three-argument
form** — the third argument is a function React calls exactly once, on the very
first render, to compute the initial state lazily. This matters here specifically
because computing the initial state involves reading and parsing `localStorage` — a
real, if small, amount of work that should happen once, not be recomputed on every
single render the way passing a plain second-argument value (as lesson 09 did)
would risk if that value were an expensive expression rather than a static object.

The `try { ... } catch { return getDefaultState(); }` around `JSON.parse` guards
against corrupted or incompatible saved data — a real concern for any project that
persists data across versions of itself: an earlier version of this project might
have saved widgets in a shape a newer `Widget` interface no longer matches exactly,
or `localStorage` could contain a hand-edited or truncated string that is not valid
JSON at all. Falling back to `getDefaultState()` means a corrupted save degrades to
"start fresh," not a crash on every subsequent load.

`useEffect(() => { localStorage.setItem(...); }, [storageKey, state])` re-runs every
time `state` changes to a new reference — which, because every reducer action in
this project produces a brand-new `HistoryState` object rather than mutating the old
one (the same immutability discipline from every lesson since lesson 02), is exactly
every time a real change happens, and never when nothing did.

**SE lens — why undo history itself is not what gets restored.** Reloading the page
restores `history.present` — the actual widget tree — but not `history.past` or
`history.future`. This is a deliberate choice, not an oversight: undo history
describes *how you got here during this editing session*, which is meaningless
information the moment the page reloads and the session restarts; the *design
itself* — the actual widgets — is the only part worth carrying forward.

---

## Step 2 — See the Limitation Directly

**The problem:** Understanding *why* actions are stored as strings is more
convincing after briefly seeing what would happen if they were not.

Temporarily change `ButtonWidget`'s `action` field to store a function instead:

```tsx
interface ButtonWidget extends BaseWidget {
  type: 'button';
  label: string;
  onClickAction: () => void; // temporary, for this demonstration only
}
```

Attempting to construct a widget this way, then saving and reloading, demonstrates
the exact failure: `JSON.stringify` silently drops `onClickAction` from the saved
string entirely — reloading produces a button with no memory of what it should do,
and no error anywhere explains why, because as far as `JSON.stringify` is concerned,
nothing went wrong; a function is simply not something it knows how to represent.
Revert this change back to `action: 'none' | 'increment'` afterward — it is not part
of this project going forward, only a deliberate, temporary demonstration of why the
real design is shaped the way it is.

**Concept — this is why "the design is data" was never optional.** Every widget in
this project, since lesson 01, has been describable entirely as plain data: numbers,
strings, and nested objects and arrays of the same. This was true before
serialization was ever a requirement, for an unrelated reason — it is what let
`updateWidget`, the reducer, and `JSON.stringify` (via `structuredClone`-like
copying throughout) all treat a widget uniformly. Persistence did not require
redesigning anything; it simply revealed, for the first time, a constraint that had
been true the entire time.

---

## Connect the Pieces

```
src/App.tsx        usePersistedReducer<S, A>() — a generic custom hook combining
                    useReducer's lazy init with a localStorage-writing effect
                    HistoryState is now durable across reloads; past/future are not
```

`widgetsReducer` and every action type from lesson 09 needed zero changes —
`usePersistedReducer` wraps `useReducer` without altering how state actually
transitions; it only changes where the initial state comes from and adds one
side effect after every change.

---

## What Breaks Without This

**Without the lazy initializer (loading `localStorage` directly as the second
argument instead):** `localStorage.getItem` and `JSON.parse` would need to run on
*every single render* of `App`, not just the first one — wasted, repeated work that
happens to be harmless here given how small this project's saved data is, but is
exactly the kind of unnecessary, repeated cost the lazy-initializer form of
`useReducer` (and `useState`) exists to avoid in general.

**Without the `try`/`catch` around `JSON.parse`:** Manually corrupt the saved value
— open the browser's DevTools, run `localStorage.setItem('react-studio-widgets',
'not valid json')`, and reload. Without the guard, `JSON.parse` throws, uncaught,
during the very first render — the entire application fails to start, with a blank
white page and nothing on screen to explain why, from a single malformed string in
storage this project itself wrote at some point.

---

## Definition of Done

- [ ] Reloading the browser tab preserves every widget's exact position, size, and configuration
- [ ] A button's configured action survives a reload
- [ ] Manually corrupting the saved `localStorage` value results in a fresh, working default canvas, not a crash
- [ ] You can explain what serialization is and specifically what `JSON.stringify` does with a function-valued property
- [ ] You can explain why `ButtonWidget.action` was designed as a string in lesson 10, now proven by this lesson's temporary demonstration
- [ ] You can explain what the lazy-initializer (third) argument to `useReducer` is for
- [ ] You can explain why undo/redo history is not persisted, only the current design
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Persist the widget tree to localStorage via a generic usePersistedReducer hook"
      ```

---

*Next: Lesson 12 — Performance. Add a few hundred widgets and drag one: the frame
rate visibly drops. This lesson measures that honestly, explains exactly why it
happens, and fixes it with `React.memo` — the first lesson where "why does React
re-render what it re-renders" stops being an abstract mental model and becomes
something you can watch happen and prevent.*
