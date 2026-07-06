# React Studio — Lesson 10 — Wiring Actions

## What You Will Build

A new Button widget joins the toolbar. Selecting one lets you choose, from a
dropdown in the Properties Panel, what it does: nothing, or "Increment Counter." A
small counter display, fixed in the corner of the screen, shows the current count.
A "▶ Run" button in the panel fires the configured action immediately, so you can
prove the wiring works without leaving edit mode. This is the first time this
project needs two genuinely different *kinds* of state — what the canvas looks like,
and what the running application is currently doing — and the first real use of
**Context** to connect them.

---

## What You Need to Know First

Lesson 09 left every widget mutation flowing through `dispatch` into a reducer
managing `{ past, present, future }`. `Widget` is a discriminated union of
`RectangleWidget | CircleWidget | TextWidget | GroupWidget`.

---

## Concept: Two Kinds of State, Named

Everything this project has managed so far — every widget's position, size, and
type — describes the **design**: what the canvas looks like, edited by a person
building the app. A counter's current value is different in kind: it describes the
**runtime** — what the app being built is *doing*, right now, for whoever is using
it. These are not the same axis of change at all: editing a button's label should
never be undoable alongside the counter's value changing, and the counter
incrementing should never appear in the same undo history as moving a rectangle.
Keeping them as two entirely separate pieces of state, managed differently, is a
direct consequence of recognising they answer two different questions.

---

## Step 1 — Add a Button Widget

**The problem:** Nothing on the canvas can represent something interactive yet.

```tsx
interface ButtonWidget extends BaseWidget {
  type: 'button';
  label: string;
  action: 'none' | 'increment';
}

type Widget = RectangleWidget | CircleWidget | TextWidget | GroupWidget | ButtonWidget;

function createButtonWidget(x: number, y: number): ButtonWidget {
  return {
    id: crypto.randomUUID(),
    type: 'button',
    x,
    y,
    width: 120,
    height: 40,
    label: 'Click me',
    action: 'none',
  };
}
```

Add a case to `renderWidgetContent`:

```tsx
case 'button':
  return (
    <button style={{ width: '100%', height: '100%' }}>
      {widget.label}
    </button>
  );
```

Add an "Add Button" toolbar button following the existing pattern, and remember to
add a matching `case 'button':` to `widgetLabel` in `LayersPanel` (the exhaustiveness
check from lesson 06 will refuse to compile `renderWidgetContent` until you do —
confirm this by temporarily deleting the new `case` and reading the resulting error).

**Walkthrough:** Notice this real `<button>` element has no `onClick` at all yet.
Clicking it on the canvas still selects the widget, exactly like every other
widget type — the click event starts on this inner `<button>`, but since nothing
handles it there, it bubbles up to `WidgetView`'s own `onClick`, which selects the
widget, exactly as designed since lesson 03. This is deliberate: while editing, a
click should select, not execute — this button doing something real, from an actual
click, waits for lesson 13's Preview mode, where the whole point is that the canvas
stops being an editor and starts behaving like the finished app.

---

## Step 2 — Create the Runtime State, Behind a Context

**The problem:** A counter needs to live somewhere both the Properties Panel (to
test it) and, eventually, deeply nested button widgets (possibly inside several
layers of groups) can reach — without every intermediate component needing to
accept and forward a prop it has no actual use for itself.

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppRuntimeContextValue {
  counter: number;
  increment: () => void;
}

const AppRuntimeContext = createContext<AppRuntimeContextValue | null>(null);

function useAppRuntime(): AppRuntimeContextValue {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be called inside an AppRuntimeProvider');
  }
  return context;
}

function AppRuntimeProvider({ children }: { children: ReactNode }) {
  const [counter, setCounter] = useState(0);

  const value: AppRuntimeContextValue = {
    counter,
    increment: () => setCounter((current) => current + 1),
  };

  return <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>;
}
```

**Walkthrough:** `createContext<AppRuntimeContextValue | null>(null)` creates a
**Context** — a channel any descendant component can read from directly, without
it being passed down explicitly as a prop through every component in between. The
initial value, `null`, is only ever seen by a component that tries to read this
context *outside* of a `Provider` — a mistake, not a normal state of the app —
which is exactly what `useAppRuntime`'s `if (!context) { throw ... }` guards
against: instead of a confusing crash deep inside whatever code first tries to use
`context.counter` on a `null` value, this throws immediately, at the actual moment
of misuse, with a message naming exactly what went wrong.

`<AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>`
is how a Context actually supplies a value: any component rendered anywhere inside
this `Provider` — no matter how many other components sit in between — can call
`useContext(AppRuntimeContext)` (wrapped here as `useAppRuntime`) and receive
`value` directly.

**CS lens — why this problem specifically needed Context, not just another prop.**
Passing `increment` down as an ordinary prop would work for a button that is a
direct child of `App`. But a button can be nested inside a group, which can be
nested inside another group, arbitrarily deep, per lesson 08's recursive rendering
— reaching a deeply nested button would mean `renderWidgetContent`'s `'group'` case
threading `increment` through every single recursive call, purely so it can be
handed down one more level, with every intermediate layer needing to accept and
immediately forward a prop it has no use for itself. This pattern has a name —
**prop drilling** — and Context exists specifically to avoid it for state that
genuinely needs to reach an arbitrary, unpredictable depth in the tree.

**SE lens — a custom hook as a guarded doorway.** `useAppRuntime` is this project's
first **custom hook** — an ordinary function, its name starting with `use` by
convention (the same convention that lets React verify hooks are only called in
valid places), that wraps `useContext` with a clearer name and a safety check.
Every future component that needs the runtime calls `useAppRuntime()` instead of
`useContext(AppRuntimeContext)` directly — one place owns "how do you correctly get
the app runtime," and every consumer benefits from its guard automatically.

---

## Step 3 — Wire the Panel

**The problem:** Selecting a button widget needs to show an action dropdown, and a
way to test it immediately.

Add to `PropertiesPanel`, inside the case where `widget.type === 'button'`:

```tsx
const { increment } = useAppRuntime();

// ...
<label>
  Label
  <input
    type="text"
    value={widget.label}
    onChange={(event) => onChange(widget.id, { label: event.target.value })}
  />
</label>
<label>
  Action
  <select
    value={widget.action}
    onChange={(event) => onChange(widget.id, { action: event.target.value as ButtonWidget['action'] })}
  >
    <option value="none">None</option>
    <option value="increment">Increment Counter</option>
  </select>
</label>
{widget.action === 'increment' && (
  <button onClick={increment}>▶ Run</button>
)}
```

Add a small, always-visible counter display somewhere fixed on screen, and wrap
`App`'s returned JSX in the provider:

```tsx
function CounterDisplay() {
  const { counter } = useAppRuntime();
  return <div style={{ position: 'fixed', top: 12, right: 12 }}>Counter: {counter}</div>;
}

function App() {
  // ...all existing state and handlers...

  return (
    <AppRuntimeProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* existing canvas, PropertiesPanel, LayersPanel */}
      </div>
      <CounterDisplay />
    </AppRuntimeProvider>
  );
}
```

Save and reload. Add a button widget, select it, choose "Increment Counter," and
click "▶ Run" in the panel: the counter display updates immediately.

**Walkthrough:** `event.target.value as ButtonWidget['action']` uses a **type
assertion** — a plain `<select>`'s `value` is always a `string` as far as the DOM is
concerned, with no way for TypeScript to know it will only ever be `'none'` or
`'increment'` (the two `<option>` values actually offered); `as
ButtonWidget['action']` tells the compiler to trust that this string is one of
those two — reasonable here because the only two `<option>` elements rendered are
exactly those two values, so no other string could actually arrive. `ButtonWidget['action']`
is an **indexed access type** — reading a specific property's type directly out of
an existing interface, so if `action`'s allowed values ever changed, this assertion
would automatically track the new type with no separate update needed.

`{widget.action === 'increment' && <button onClick={increment}>▶ Run</button>}` uses
the `&&` operator for **conditional rendering** — a common JSX idiom: if the left
side of `&&` is falsy, JSX renders nothing at all; if it is truthy, JSX renders the
right side. This "Run" button only appears once an action has actually been
configured, since testing an action set to "None" has nothing to test.

---

## Connect the Pieces

```
src/App.tsx              AppRuntimeContext, AppRuntimeProvider, useAppRuntime() —
                          a second, independent state system alongside the widget reducer
ButtonWidget               A new member of the Widget union — visually present now,
                            functionally inert on the canvas until lesson 13
PropertiesPanel             Reads useAppRuntime() to power its "Run" test button
CounterDisplay               A tiny component whose entire job is reading one Context value
```

---

## What Breaks Without This

**Without a guard in `useAppRuntime` (returning `context!` with a non-null
assertion instead of checking and throwing):** Accidentally render `CounterDisplay`
outside `AppRuntimeProvider` — a real, easy mistake once the component tree grows
past one file. `context.counter` throws `Cannot read properties of null`, with a
stack trace pointing at the line that dereferenced it, giving no hint about the
actual, structural cause: a missing ancestor `Provider`, several component
boundaries away from the actual crash site.

**Without Context (passing `increment` down as an ordinary prop instead):** As long
as buttons are always a direct child of `App`, this works. The moment a button is
grouped — a completely ordinary thing to do, already supported since lesson 08 —
`increment` would need to be threaded manually through `renderWidgetContent`'s
recursive `'group'` case, and every other widget type's rendering path, whether or
not they have any use for it, purely so it can reach a button buried inside.

---

## Definition of Done

- [ ] A Button widget can be added, selected, and shows a label + action dropdown in the panel
- [ ] Choosing "Increment Counter" and clicking "▶ Run" updates the visible counter
- [ ] The counter display and the Properties Panel both read the same `AppRuntimeContext`, with no props passed between them
- [ ] Clicking a button widget directly on the canvas still selects it, and does not yet fire its action
- [ ] You can explain the difference between this project's "design" state and "runtime" state, and why they are managed separately
- [ ] You can explain what prop drilling is and why a button nested inside groups makes it a real problem here
- [ ] You can explain what `useAppRuntime`'s null check protects against, concretely
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add a Button widget and app runtime state, connected via Context"
      ```

---

*Next: Lesson 11 — Save and Load. Reloading the page currently forgets everything.
This lesson adds a custom hook that persists the widget tree to `localStorage` —
and confronts a real limitation head-on: a button's `action` can be saved as data,
but a JavaScript function never could be, which is exactly why actions were
designed as strings back in lesson 10, not callbacks.*
