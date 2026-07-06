# React Studio — Lesson 09 — Undo and Redo

## What You Will Build

Ctrl+Z reverts the last change — a move, a resize, a group. Ctrl+Shift+Z restores
whatever was just undone. Every edit this project has made since lesson 02 has been
a dead end with no way back; this lesson fixes that for all of them at once, by
replacing every scattered `setWidgets` call with a single **reducer** managing the
entire widget tree and its history together.

---

## What You Need to Know First

Lesson 08 left `App` calling `setWidgets` directly from several different places:
`handleAddWidget`, `updateWidget`, and `handleGroupSelected`, each computing its own
new array from the current one.

---

## Concept: Why Undo Is a Reducer Problem, Not a `useState` Problem

Every one of this project's state changes so far has been an *arbitrary* update:
"here is the entirely new array, `useState`, please remember it." Undo requires
something more structured: a record of *what kind of change* just happened, so it
can be reversed or reapplied — and doing that consistently across every different
kind of edit (adding, moving, grouping) means every edit needs to go through one
single, common gateway, rather than each `setWidgets` call site independently
deciding how to also update a history stack.

`useReducer` is React's hook for exactly this shape of problem: state that changes
only in response to a fixed, named set of **actions**, all funneled through one
function that decides, given the current state and an action, what the next state
should be.

---

## Step 1 — Model History as Past, Present, and Future

**The problem:** Undo needs to remember every previous state, not just the current
one; redo needs to remember states that were undone, in case they are wanted back.

```tsx
interface HistoryState {
  past: Widget[][];
  present: Widget[];
  future: Widget[][];
}

type WidgetAction =
  | { type: 'ADD_WIDGET'; widget: Widget }
  | { type: 'UPDATE_WIDGET'; id: string; updates: Partial<Widget> }
  | { type: 'UPDATE_WIDGET_LIVE'; id: string; updates: Partial<Widget> }
  | { type: 'GROUP_WIDGETS'; group: GroupWidget; groupedIds: string[] }
  | { type: 'BEGIN_INTERACTION' }
  | { type: 'UNDO' }
  | { type: 'REDO' };
```

**Walkthrough:** `past` and `future` are each an array *of* widget arrays — a stack
of every previous, and every undone, complete snapshot of the canvas. `present` is
the one currently shown. `WidgetAction` is a discriminated union, exactly like
`Widget` itself — every distinct thing that can happen to this project's data is
named here, once, as its own variant. `UPDATE_WIDGET_LIVE` and `BEGIN_INTERACTION`
are explained in Step 3; ignore them until then.

---

## Step 2 — Write the Reducer

**The problem:** Given the current `HistoryState` and one `WidgetAction`, compute
the next `HistoryState` — the one function every future change to this project's
data will go through.

```tsx
function applyWidgetAction(widgets: Widget[], action: WidgetAction): Widget[] {
  switch (action.type) {
    case 'ADD_WIDGET':
      return [...widgets, action.widget];
    case 'UPDATE_WIDGET':
    case 'UPDATE_WIDGET_LIVE':
      return widgets.map((widget) => (widget.id === action.id ? { ...widget, ...action.updates } : widget));
    case 'GROUP_WIDGETS':
      return [...widgets.filter((widget) => !action.groupedIds.includes(widget.id)), action.group];
    default:
      return widgets;
  }
}

function widgetsReducer(state: HistoryState, action: WidgetAction): HistoryState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const [next, ...remainingFuture] = state.future;
      return {
        past: [...state.past, state.present],
        present: next,
        future: remainingFuture,
      };
    }
    case 'BEGIN_INTERACTION':
      return { ...state, past: [...state.past, state.present], future: [] };
    case 'UPDATE_WIDGET_LIVE':
      return { ...state, present: applyWidgetAction(state.present, action) };
    default:
      return {
        past: [...state.past, state.present],
        present: applyWidgetAction(state.present, action),
        future: [],
      };
  }
}
```

Replace `App`'s `useState<Widget[]>` for widgets with:

```tsx
const [history, dispatch] = useReducer(widgetsReducer, {
  past: [],
  present: [createRectangleWidget(60, 60), createRectangleWidget(220, 140), createRectangleWidget(380, 60)],
  future: [],
});
const widgets = history.present;
```

Update every call site: `handleAddWidget` now calls `dispatch({ type: 'ADD_WIDGET',
widget: newWidget })`; `updateWidget(id, updates)` becomes `dispatch({ type:
'UPDATE_WIDGET', id, updates })`; `handleGroupSelected` dispatches `{ type:
'GROUP_WIDGETS', group, groupedIds: selectedIds }` instead of calling `setWidgets`
directly.

**Walkthrough:** `useReducer(reducerFunction, initialState)` returns the current
state (`history`) and a **`dispatch`** function — instead of calling a setter with
the new value directly (as every `useState` in this project has done so far), you
call `dispatch(action)`, describing *what happened*, and the reducer decides what
the new state actually is. The reducer itself must be a **pure function**: given the
same state and action, it always produces the same result, with no side effects —
this is what makes it safe for React to call it however and whenever it needs to.

Every branch of `widgetsReducer`'s `default` case does the same three things:
push the *current* `present` onto `past` (recording what existed right before this
change, for undo to return to), compute the new `present` via `applyWidgetAction`,
and reset `future` to an empty array. That last part matters: once a *new* edit
happens, whatever was previously undone (sitting in `future`, waiting for a
possible redo) is no longer a valid "next" state to redo into — a new branch of
history has begun, and the old redo path is gone, exactly matching how undo/redo
works in every real application you have used.

`state.past.slice(0, -1)` returns every element except the last — `-1` as the end
index in `.slice` counts backward from the end, so `slice(0, -1)` means "from the
start, up to (not including) the last element." `const [next, ...remainingFuture] =
state.future` uses **array destructuring with a rest pattern**: `next` gets the
first element, and `...remainingFuture` collects everything else into a new array —
the same rest syntax used, in a different context, for a function's own rest
parameters.

---

## Step 3 — Commit One History Entry Per Drag, Not One Per Pixel

**The problem:** Dragging fires `mousemove` dozens of times per second, and lesson
04's drag handler called `updateWidget` on every single one. If each of those became
its own undo step, undoing one visual drag of a few hundred pixels would require
pressing Ctrl+Z dozens of times to fully reverse — a real, easily-missed usability
bug in any undo system built on top of a feature that fires this often.

Update the drag start handler to record history exactly once, before the drag
begins:

```tsx
function handleMouseDownOnWidget(widget: Widget, event: React.MouseEvent) {
  event.stopPropagation();
  handleSelectWidget(widget.id, event.shiftKey);
  dispatch({ type: 'BEGIN_INTERACTION' });
  setDragState({
    widgetId: widget.id,
    offsetX: event.clientX - widget.x,
    offsetY: event.clientY - widget.y,
  });
}
```

And update the `mousemove` handler from lesson 04 to dispatch the *live* variant,
which — as Step 2's reducer shows — updates `present` directly without touching
`past` or `future` at all:

```tsx
function handleMouseMove(event: MouseEvent) {
  if (!dragState) return;
  dispatch({
    type: 'UPDATE_WIDGET_LIVE',
    id: dragState.widgetId,
    updates: {
      x: event.clientX - dragState.offsetX,
      y: event.clientY - dragState.offsetY,
    },
  });
}
```

Save and reload. Drag a widget across the canvas, release, then press Ctrl+Z once:
the widget jumps back to exactly where it was *before the drag started* — not one
pixel back, the whole gesture, undone in a single step.

**Walkthrough:** `BEGIN_INTERACTION`, dispatched exactly once, the moment a drag
starts, pushes the pre-drag `present` onto `past` a single time. Every subsequent
`UPDATE_WIDGET_LIVE` during that same drag updates `present` in place, bypassing the
history bookkeeping entirely — dozens of these can fire without creating dozens of
undo steps, because they were deliberately routed through the one reducer case that
does not touch `past`. The net effect: one undo step per *gesture*, regardless of
how many raw browser events that gesture happened to generate — a real, deliberate
design decision, not an accident of how often `mousemove` fires.

**SE lens — a known, stated limitation.** The Properties Panel's number inputs
still call plain `UPDATE_WIDGET` on every keystroke, meaning typing a new width
character by character creates one undo step per character. This is a smaller
problem in practice — typing is naturally rate-limited by human speed, unlike a
120Hz stream of mouse-move events — and the exact same `BEGIN_INTERACTION` +
`_LIVE` technique used here for dragging would resolve it identically (commit once
when the field is focused, update live on every keystroke, exactly as a drag
commits once on mouse-down and updates live on every move). It is not built here on
purpose, to keep this lesson's scope to the one place the problem is actually severe;
it is a direct, natural extension left for you to add.

---

## Step 4 — Wire Up Undo and Redo

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey;
    const isRedo = (event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey;

    if (isUndo) {
      event.preventDefault();
      dispatch({ type: 'UNDO' });
    } else if (isRedo) {
      event.preventDefault();
      dispatch({ type: 'REDO' });
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Walkthrough:** `event.ctrlKey || event.metaKey` checks for Ctrl (Windows/Linux) or
Cmd (`metaKey`, macOS) — supporting both without asking which operating system the
user is on. `event.preventDefault()` stops the browser's own default behaviour for
this key combination (some browsers have built-in shortcuts on similar keys) from
firing alongside this project's own handling. The empty dependency array, `[]`,
means this effect's setup runs exactly once, when `App` first mounts, and its
cleanup runs only when `App` unmounts — appropriate here, since this listener does
not depend on any state that changes over time; `dispatch` itself, notably, is
guaranteed stable by React across every render, so it never needs to appear in a
dependency array at all.

---

## Connect the Pieces

```
src/App.tsx      useReducer replaces useState for widgets; every mutation is now
                 an action, funneled through one pure reducer
                 BEGIN_INTERACTION / UPDATE_WIDGET_LIVE split one history entry
                 per gesture from many rapid, live updates
```

`updateWidget`, `handleAddWidget`, and `handleGroupSelected` all still exist, as
thin wrappers that call `dispatch` with the right action — every other component in
this project (`WidgetView`, `PropertiesPanel`, `LayersPanel`) needed zero changes,
because they never called `setWidgets` directly; they only ever called functions
`App` gave them, which is exactly the seam that made this entire refactor possible
without touching any other file.

---

## What Breaks Without This

**Without `BEGIN_INTERACTION` / `UPDATE_WIDGET_LIVE` (dispatching plain
`UPDATE_WIDGET` on every `mousemove`):** Drag a widget 300 pixels. Press Ctrl+Z
once: it moves back a handful of pixels — one mouse-move event's worth — not to
where the drag started. A user would need to press undo dozens of times to reverse
one drag they experienced as a single action.

**Without resetting `future` on every new action (in the reducer's `default`
case):** Undo a move, then make a *different* new edit, then press Ctrl+Shift+Z
(redo). Without clearing `future`, redo would restore the state from the move that
was undone — a change the user has already abandoned by making a new edit — silently
discarding the new edit they just made in favour of one they explicitly reversed.

---

## Definition of Done

- [ ] Ctrl+Z undoes the most recent change; Ctrl+Shift+Z redoes it
- [ ] Undoing a drag reverts the whole gesture in one step, not one step per pixel moved
- [ ] Making a new edit after an undo correctly discards the old redo history
- [ ] Every widget mutation goes through `dispatch`, not a direct `setWidgets` call
- [ ] You can explain the difference between `useState` and `useReducer`, and why undo specifically needs the latter
- [ ] You can explain what `past`, `present`, and `future` each represent, and what "undo" and "redo" do to them mechanically
- [ ] You can explain why dragging needed a `BEGIN_INTERACTION` / `_LIVE` split and typing in the Properties Panel does not (yet)
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Replace ad hoc state updates with a reducer; add undo/redo with one history entry per gesture"
      ```

---

*Next: Lesson 10 — Wiring Actions. A button widget's click can be configured, in the
Properties Panel, to run a real action — incrementing a counter shown elsewhere in
the app. This is the first time this project needs two genuinely different kinds of
state: the design (what the canvas looks like) and the runtime (what the app is
currently doing) — and the first real use of Context, to reach the second kind from
deep inside the widget tree without threading it through every level by hand.*
