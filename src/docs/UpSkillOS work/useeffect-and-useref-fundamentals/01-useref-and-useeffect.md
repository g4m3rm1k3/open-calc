# useRef and useEffect: The Two Escape Hatches From Pure Rendering

Today we study **mutable values that don't trigger re-renders** and **synchronizing
with something outside React**. Our case study is real, already-running code in this
app: the draggable panel in `src/tools/matrix-reducer/MatrixReducer.jsx`, and — once
you've understood it there — the near-identical drag logic in
`src/components/desktop/FloatingWindow.jsx`, the window system every lab in this app
opens inside of. This pattern appears twice in this codebase because it's the
correct, standard way to solve one specific, recurring problem: tracking a mouse
drag across the whole window, not just one element.

---

## What You Will Build

Nothing new yet — today you *read and fully explain* two pieces of real, working
production code, and prove your understanding by breaking one small piece,
predicting what will go wrong, and confirming it. `useRef` and `useEffect` are two
of the most important hooks in this entire app, and both deserve to be understood
from a real example before you ever need to write your own.

---

## What You Need to Know First

`useState`, from the Flutter Playground lesson set (`useeffect-and-useref-fundamentals`
assumes you've done at least Lesson 3 of that set, or already know what `useState`
returns and why `setX` triggers a re-render). Nothing else is assumed.

---

## The Lesson

### Step 1 — The Problem `useState` Alone Can't Solve

Every `useState` you've used so far changes something *visible* — a view mode, a
loading flag, text on screen. Dragging a panel needs something different: while the
mouse button is held down, you need to remember "yes, currently dragging" across
many rapid `mousemove` events (a real mouse drag fires dozens of these per second),
but that "currently dragging" flag itself never needs to appear anywhere in the UI —
nothing renders differently because of it. If you used `useState` for it anyway,
every single `mousemove` event would trigger a full re-render of the component, dozens
of times a second, for a value nobody ever displays — wasted work, and, at enough
scale, visibly janky performance (recall Lesson 14's "hot path" framing from
`LESSON_CONTRACT.md`, if you've read the contract itself: a value changing 60+ times
a second is about as hot a path as this app has).

### Step 2 — `useRef`: A Box That Persists Without Causing Renders

#### Concept lab: watching a ref *not* cause a re-render

Disposable — create `src/labs/_scratch/RefProbe.tsx`, delete it at the end of this
step.

```typescript
import { useRef, useState } from 'react'

export default function RefProbe() {
  const renderCount = useRef(0)
  const [, forceRerender] = useState(0)

  renderCount.current = renderCount.current + 1

  return (
    <div>
      <p>This component has rendered {renderCount.current} time(s).</p>
      <button onClick={() => forceRerender(n => n + 1)}>Force a re-render</button>
    </div>
  )
}
```

**`useRef(0)`** returns an object with exactly one property: `.current`, initialized
here to `0`. That object itself is created **once**, on the first render, and React
hands back the *exact same object* on every subsequent render — unlike a `useState`
value, which is a fresh value each render. **Reading or writing `.current` never
triggers a re-render** — that's the entire point of `useRef`. `renderCount.current =
renderCount.current + 1` mutates that box directly, on every single render, and
because it's the same persistent object each time, the count genuinely accumulates.

**`const [, forceRerender] = useState(0)`** — array destructuring again, but this
time the first slot is left empty (just a bare comma). This is a real, valid pattern:
you're saying "I don't need the current value this state holds, only its setter" —
here used purely to manually trigger a re-render on demand, for this experiment
only; you will not do this in real project code, where re-renders should always be
caused by a value that's actually used.

Render `<RefProbe />` via the usual `HomePage.jsx` probe. **Expected output:** "This
component has rendered 1 time(s)." Click "Force a re-render" a few times. **Expected
output:** the count increases — 2, 3, 4 — proving `renderCount.current` really is
persisting and accumulating across renders, without ever being the *reason* a render
happened. Delete the probe now.

**CS lens:** `useRef` gives you a **mutable cell with stable identity across
renders** — a direct escape hatch from React's normal "state changes cause
re-renders" model, used specifically for values whose changes should be invisible
to the render cycle.

**SE lens:** This is choosing the right tool for the right kind of state:
**render-relevant state** (`useState`) versus **render-irrelevant bookkeeping**
(`useRef`). Reaching for `useState` for everything works, but wastes render cycles
on values nobody displays; reaching for `useRef` for everything means the UI
silently fails to update when a value genuinely does need to be shown. Knowing which
is which — "will the screen ever need to look different because of this?" — is the
actual skill, more than either hook individually.

---

### Step 3 — `useEffect`: Running Code *Because* You Rendered

`useState` and `useRef` both handle values. Neither one, by itself, lets you *do*
something — attach a global event listener, start a timer, fetch data — in response
to a component appearing on screen. That's `useEffect`'s job: **run this code after
React has rendered**, and optionally **run this cleanup code before the component
disappears, or before the effect runs again**.

#### Concept lab: an effect, and its cleanup, both proven with your own eyes

Disposable — `src/labs/_scratch/EffectProbe.tsx`.

```typescript
import { useEffect, useState } from 'react'

export default function EffectProbe() {
  const [show, setShow] = useState(true)

  return (
    <div>
      <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} the ticking component</button>
      {show && <Ticker />}
    </div>
  )
}

function Ticker() {
  useEffect(() => {
    console.log('Ticker mounted — starting interval')
    const intervalId = setInterval(() => console.log('tick'), 1000)

    return () => {
      console.log('Ticker unmounting — clearing interval')
      clearInterval(intervalId)
    }
  }, [])

  return <p>I am ticking. Check the console.</p>
}
```

**`useEffect(() => { ... }, [])`** takes two arguments: a function to run, and a
**dependency array**. `[]` — empty — means "run this function exactly once, after
the very first render, and never again on its own." `console.log(...)` and
`setInterval(() => console.log('tick'), 1000)` run immediately: `setInterval` is a
built-in browser function that calls the given function repeatedly, every `1000`
milliseconds (one second), and returns an `intervalId` you can later use to stop it.

**The `return () => { ... }` inside the effect is the cleanup function** — React
calls it automatically right before this component is removed from the screen (or,
with a non-empty dependency array, right before the effect re-runs). `clearInterval(intervalId)`
stops the repeating timer using the ID captured when it was created.

Render `<EffectProbe />` via the usual probe, open your browser console, and click
"Hide"/"Show" a few times. **Expected output, in the console:**
```
Ticker mounted — starting interval
tick
tick
tick
Ticker unmounting — clearing interval
Ticker mounted — starting interval
tick
tick
...
```

Watch it closely: after clicking "Hide," `tick` genuinely stops appearing — proving
`clearInterval` actually ran and actually stopped the timer, not just that the
component disappeared from view. **Now comment out the `return () => { ... }` cleanup
function** and repeat the Hide/Show clicks.

**Expected output this time:** ticks **keep appearing in the console after you've
hidden the component** — one interval per every time you've ever clicked "Show,"
all still running, all still logging, forever, invisible, because nothing ever
stopped them. This is a real, common category of bug called a **memory/resource
leak**: work that should have stopped kept running because nothing told it to.
Restore the cleanup function, confirm ticking correctly stops again, then delete
`EffectProbe.tsx` and its probe.

**CS lens:** This is **lifecycle management** — code that needs to start when a
component appears and definitely stop when it disappears, expressed as a matched
pair (setup, teardown) rather than two disconnected pieces of code you'd have to
remember to keep in sync by hand.

**SE lens:** The cleanup function is **resource acquisition paired with guaranteed
release** — the same discipline `try`/`finally` blocks enforce in many languages, or
what a database connection pool depends on (every connection *checked out* must be
*checked back in*, or the pool eventually runs dry). `useEffect`'s cleanup pattern is
React's version of that same universal rule: anything you start, you must have a
plan to stop.

**Recognition — setup/teardown pairing recurs in:** file handles (`open()`/`close()`
in nearly every language), database transactions (`BEGIN`/`COMMIT` or `ROLLBACK`),
Python's `with` statement, C#'s `using` statement, and — closest to home — the exact
`window.addEventListener`/`window.removeEventListener` pairing you're about to read
in Step 4, which is this same idea applied to global browser events instead of a
timer.

---

### Step 4 — Reading the Real Code: `MatrixReducer.jsx`'s Drag Logic

Open `src/tools/matrix-reducer/MatrixReducer.jsx` and find this (line numbers will
drift as the file changes, but the shape won't):

```javascript
const dragging   = useRef(false);
const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

const startDrag = (e) => {
  e.preventDefault();
  dragging.current = true;
  dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
};

useEffect(() => {
  const move = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragOrigin.current.mx;
    const dy = e.clientY - dragOrigin.current.my;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - PANEL_W, dragOrigin.current.px + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 80, dragOrigin.current.py + dy)),
    });
  };
  const up = () => { dragging.current = false; };
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  return () => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  };
}, []);
```

You now have every piece needed to read this precisely, with nothing left
unexplained:

**`dragging = useRef(false)`** — exactly Step 2's pattern: a boolean that changes
many times a second during a drag, and must never itself cause a re-render (the
*position* update, via `setPos`, is what actually needs to re-render; "are we
currently dragging" does not).

**`dragOrigin = useRef({ mx, my, px, py })`** — a second ref, holding the mouse
position and panel position *at the moment the drag started* — needed on every
subsequent `mousemove` to compute how far the mouse has traveled since, but never
itself displayed.

**`startDrag`** runs once, on `mousedown`: flips `dragging.current` to `true` and
records the starting point into `dragOrigin.current`. Because both are refs, neither
line causes a render — correct, since nothing visible has changed yet, only bookkeeping.

**The `useEffect(() => { ... }, [])`** runs once, when this component first mounts
— exactly Step 3's empty-array behavior. Inside it: `move` and `up` are defined as
local functions, then attached to the whole `window` (not just this component's own
DOM element) via `window.addEventListener` — **this is why `useRef` and a
window-level listener are used together**: a drag needs to keep tracking the mouse
even when it moves off the original element entirely, which only a listener on the
whole window can catch. `move` checks `dragging.current` first — if a drag isn't
active, it does nothing at all, even though it's still receiving every mouse
movement on the page. When it is active, `dx`/`dy` compute the total distance moved
since `dragOrigin`, and `setPos` — an ordinary `useState` setter — updates the
*visible* position, which is exactly why this call, unlike the ref updates, does
trigger a re-render: the panel's on-screen position is exactly what should change.

**`Math.max(0, Math.min(window.innerWidth - PANEL_W, ...))`** — clamps the new `x`
position between `0` and `window.innerWidth - PANEL_W`, preventing the panel from
being dragged off either edge of the screen; the matching `y` clamp does the same
vertically.

**`return () => { window.removeEventListener(...); window.removeEventListener(...); }`**
— the cleanup function, removing both listeners. Because the dependency array is
`[]`, this cleanup only ever runs once, when the component is finally removed from
the screen entirely — correctly matching "stop tracking the mouse globally the
moment this draggable thing no longer exists," exactly Step 3's leaked-interval
danger, now avoided for real.

**The exact same shape, confirmed in a second real file:** `src/components/desktop/FloatingWindow.jsx`
implements window dragging (and, from earlier work this session, resizing) with
`dragging`/`origin` refs and the identical `useEffect`-with-window-listeners
pattern. Two different developers (or the same developer, at two different times)
independently arrived at the same shape for the same underlying problem — global
mouse tracking across a drag — which is exactly what "recognize the pattern" is
for: once you know this shape, you'll recognize it instantly the third time, instead
of re-deriving it from scratch.

---

### Step 5 — Break It, Predict It, Confirm It

In `MatrixReducer.jsx`, temporarily delete just the `return () => { ... }` cleanup
block from the `useEffect` (leave everything else, including the `addEventListener`
calls, in place). Before running anything: **write down your own prediction** of
what will go wrong, based on everything Step 3 and Step 4 just taught you.

Run the app, open the Matrix Reducer tool, drag its panel around a bit, then close
the tool's window (however this app lets you dismiss it) and reopen it. Drag again.

**Expected output, matching the prediction you should have been able to make
yourself:** dragging behaves oddly or inconsistently after reopening — because the
*first* set of `mousemove`/`mouseup` listeners was never removed when the panel
first closed, so now two (or more, with repeated open/close cycles) full sets of
listeners are all responding to the same mouse events simultaneously, each one
computing and setting position independently. Restore the cleanup function, confirm
dragging is smooth and single again after reopening the tool multiple times.

---

## Connect the Pieces

`useRef` and `useEffect` solve two different halves of the same real problem:
`useRef` holds mutable bookkeeping that must survive across many rapid events
without causing renders; `useEffect` is where you reach outside a single render to
attach something that needs to persist and later be torn down. They appear together
constantly, in this exact shape, whenever a component needs to track a global
browser event (mouse drag, window resize, scroll, keyboard shortcuts) rather than
just an event on its own DOM element.

---

## What Breaks Without This

Demonstrated concretely in Step 5: missing cleanup accumulates duplicate global
event listeners every time a component mounts, each one independently reacting to
the same real mouse events — a resource leak that gets visibly worse (not
immediately broken, *worse*, compounding) the more times a user opens and closes
the affected component, exactly the kind of bug that's easy to miss in a quick test
(open once, looks fine) and only surfaces after real, repeated use.

---

## Definition of Done

- [ ] You can explain why `dragging`/`dragOrigin` are `useRef` and not `useState`,
      specifically in terms of what would happen to render performance if they were
      `useState` instead
- [ ] You can explain what the empty `[]` dependency array means, and read
      `MatrixReducer.jsx`'s real `useEffect` correctly because of it
- [ ] You reproduced the Step 3 leaked-interval bug and the Step 5 duplicate-listener
      bug yourself, with your own eyes, not just read about them
- [ ] You can point to the matching drag pattern in `FloatingWindow.jsx` and name,
      specifically, what's the same and why
- [ ] `_scratch/RefProbe.tsx` and `_scratch/EffectProbe.tsx`, and all `HomePage.jsx`
      probes, are deleted
- [ ] `git commit` is **not** required for this lesson — no project file was
      permanently changed; this lesson was entirely reading, breaking, and
      restoring real existing code to prove understanding of it
