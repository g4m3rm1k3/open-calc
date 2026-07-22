# Concept: Keeping a Component Mounted vs. Conditionally Rendering It

**What you'll understand by the end:** why a component that only
renders when a condition is true loses all of its own internal state
the moment that condition becomes false — and the real alternative
that keeps it alive, hidden, instead.

**Prerequisites:** `react-usestate-hook.md`.

## Setup

A React project (`npm create vite@latest my-app -- --template react-ts`).

## The Problem

Showing and hiding a component by conditionally including it in what a
parent renders (`{visible && <Panel />}`) feels like the obvious way to
toggle something on and off. It has a real, easy-to-miss consequence:
React only keeps a component's own internal state alive for as long as
that component is actually part of the rendered tree. The instant a
conditional stops including it, React unmounts it — discarding every
`useState`/`useRef` value it was holding — and including it again later
creates a brand-new instance, starting completely fresh.

## The Isolated Example

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

function Demo() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <button onClick={() => setVisible((v) => !v)}>Toggle</button>
      {visible && <Counter />}
    </>
  );
}
```

**Real output (click the counter to 5, click Toggle twice — hiding
then showing `Counter` again):**
```
Counter shows: 5
(Toggle clicked — Counter removed from the tree)
(Toggle clicked — Counter added back)
Counter shows: 0
```

**The fix — keep it mounted, hide it visually instead:**

```tsx
function Demo() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <button onClick={() => setVisible((v) => !v)}>Toggle</button>
      <div style={{ display: visible ? "block" : "none" }}>
        <Counter />
      </div>
    </>
  );
}
```

**Real output, the identical sequence of clicks:**
```
Counter shows: 5
(Toggle clicked — hidden, but still mounted)
(Toggle clicked — shown again)
Counter shows: 5
```

## Mechanical Walkthrough

- `{visible && <Counter />}` — when `visible` is `false`, this
  expression evaluates to `false`, and React renders nothing in that
  position at all; `Counter`'s own component instance (and everything
  `useState` was holding for it) is destroyed, not paused.
- `<div style={{ display: visible ? "block" : "none" }}><Counter /></div>`
  — `Counter` is *always* part of what's rendered; only its own CSS
  `display` changes. React never removes it from the tree, so its
  internal state persists exactly as it was, the whole time it's
  hidden.
- `display: none` removes the element from layout entirely (unlike
  `visibility: hidden`, which still reserves its space) — visually
  indistinguishable from the conditional-render version when hidden,
  the real difference is invisible until you look at *state*, not
  appearance.

## CS Lens

This is the same underlying distinction as a paused process versus a
killed one: a paused process keeps its memory/state intact, ready to
resume exactly where it left off; a killed-and-restarted one starts
from scratch, indistinguishable from a process that had never run
before. Conditionally rendering a component is the "kill and restart"
option; hiding a mounted one is the "pause" option.

Also recognized in: mobile app lifecycle (an app backgrounded, not
force-quit, keeps its in-memory state); a virtual machine's own
suspend/resume (memory snapshot preserved) versus shutdown/boot (state
discarded); browser tabs (an inactive tab's JavaScript keeps running
and its state persists, unlike closing and reopening it).

## SE Lens

The real cost of keeping every hidden component mounted: none of them
ever release the memory/DOM nodes they're holding, and if there are
many rarely-shown ones, that's real, wasted resource use for
convenience. The real cost of conditional rendering: any state that
component owns is gone the moment it's hidden, silently, with no
warning at the type or runtime level — a real, common source of "why
did my selection/scroll-position/form-input reset" bugs in tabbed or
accordion-style UIs, discovered only by actually noticing the loss,
since nothing about the code looks wrong. The right choice depends on
how expensive the component is to keep alive versus how much its own
state genuinely needs to survive being hidden — there's no universally
correct default.

## Connection

Builds on `react-usestate-hook.md` (this is entirely about what
happens to that state across a mount/unmount boundary). Directly
relevant to any tabbed interface, accordion, or modal where a user
reasonably expects "hidden" to mean "paused," not "reset."

## Try It Yourself

1. Add a second sibling using the conditional-render version and a
   third using the hide-with-CSS version, both wrapping their own
   independent `Counter`, side by side — toggle each and confirm one
   resets while the other doesn't, using the identical `Counter`
   component in both cases.
2. Add a `useEffect` inside `Counter` with an empty dependency array
   that logs `"Counter mounted"`, and a cleanup that logs `"Counter
   unmounted"` — confirm the conditional-render version logs both on
   every toggle, while the hide-with-CSS version logs `"mounted"`
   exactly once, ever.
3. Measure a real, if usually small, memory-use difference: mount 50
   instances of a component using each approach, hide all of them, and
   compare (via browser dev tools' own memory profiler) how much stays
   allocated in the "keep mounted" version versus the "conditionally
   render" one — a concrete look at the real tradeoff named in the SE
   Lens, not just a claim about it.
