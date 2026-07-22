# Concept: `useImperativeHandle` — Sending a Command, Not Describing State

**What you'll understand by the end:** when a parent needs to trigger a
real, one-shot *action* on a child component — as opposed to describing
what the child should continuously look like — and how `forwardRef` +
`useImperativeHandle` let a parent do that directly, without inventing
a piece of state whose only job is to fake being an event.

**Prerequisites:** `react-useref-hook.md`, `react-useeffect-hook.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

React's normal data flow is one-directional and declarative: a parent
passes props down, a child renders based on their *current value*, and
a child re-renders whenever a prop actually changes. That model fits
describing *state* ("the camera should currently be showing tool #3")
perfectly — but some real interactions are *actions*, not state ("align
the camera with this plane, right now") — and actions don't have a
"current value" a prop can hold. Modeling an action as a prop (e.g., a
"requested view" value the child watches for changes) forces an awkward
workaround: the exact same action requested twice in a row (say, the
user clicks the same button again after moving the camera away) doesn't
look like a *change* to that prop at all, so nothing would trigger the
second time.

## The Isolated Example

```tsx
import { forwardRef, useImperativeHandle, useState } from "react";

interface FlasherHandle {
  flash: () => void;
}

const Flasher = forwardRef<FlasherHandle, {}>(function Flasher(_props, ref) {
  const [isFlashing, setIsFlashing] = useState(false);

  useImperativeHandle(ref, () => ({
    flash: () => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
    },
  }));

  return <div>{isFlashing ? "FLASH!" : "..."}</div>;
});

function Parent() {
  const flasherRef = useRef<FlasherHandle>(null);
  return (
    <>
      <Flasher ref={flasherRef} />
      <button onClick={() => flasherRef.current?.flash()}>Flash</button>
    </>
  );
}
```

**Real behavior:** clicking "Flash" any number of times in a row —
even in rapid succession, even with no other prop ever changing —
triggers the exact same real flash animation every single time.

**What this proves:** there was never a real *value* changing here at
all ("flash" isn't a state `Flasher` has, it's a thing it *does*) — a
plain prop describing "should be flashing: true/false" would need real,
extra bookkeeping (a toggle, a counter) just to make the *same* logical
request distinguishable as "new" on a second click; the imperative
handle sidesteps that by directly calling the action, every time,
regardless of whether anything "changed."

## Mechanical Walkthrough

- `forwardRef<FlasherHandle, Props>(...)` — lets a component receive a
  `ref` from its parent at all; without it, `ref` is reserved for
  React's own internal use (usually pointing at a DOM node) and isn't
  passed to your component as a normal prop.
- `useImperativeHandle(ref, () => ({ flash: ... }))` — decides exactly
  what the parent's `ref.current` actually exposes: not the whole
  component internals, just this one, deliberately narrow real API
  (here, a single `flash` method) — the parent can call `flash()` but
  has no access to `Flasher`'s own internal `isFlashing` state at all.
- The parent calls `flasherRef.current?.flash()` directly, inside a real
  event handler (`onClick`) — an ordinary function call, not a prop
  passed down and reacted to; nothing about *rendering* is involved in
  triggering it.

## CS Lens

This is the same real distinction as **commands vs. queries** (or,
more broadly, imperative vs. declarative interfaces): a query/declarative
description says what something *is* right now, and a system reacts to
that description changing; a command says "do this," once, regardless
of what came before. Most of a well-designed UI is declarative (props
describing current state) — imperative handles are a deliberate,
narrow escape hatch for the real, remaining cases (playing a one-shot
animation, focusing an input, scrolling to a position, and — here —
repositioning a camera) that are genuinely actions, not state.

Also recognized in: `element.focus()`/`element.scrollIntoView()` in the
plain DOM API (real actions, not attributes reflecting current state);
a video player's own `play()`/`pause()` methods (as opposed to a
"currently playing: true/false" prop it merely observes); a database
`INSERT`/`UPDATE` command (does something) versus a `SELECT` query
(describes/reads current state) — `concepts/declarative-vs-imperative-
queries.md` names this same distinction in that different, SQL-specific
context.

## SE Lens

The real, recurring temptation this concept exists to name and resist:
reaching for `useImperativeHandle` by default whenever a parent needs
to "tell a child to do something," when a plain, declarative prop would
actually describe the real situation more simply and more idiomatically
in most cases. The real, narrow test for when it's actually warranted:
does the thing being triggered have a genuine "do this again, identically,
even though nothing about the current state changed" requirement? If a
plain prop change would already trigger the right behavior every real
time it's needed, an imperative handle is real, unnecessary complexity;
if (as with re-selecting an already-selected camera view) it wouldn't,
the imperative handle is the more honest, more correct choice, not a
shortcut around "proper" React style.

## Connection

Builds on `react-useref-hook.md` (imperative handles are exposed
*through* a ref) and `react-useeffect-hook.md` (the alternative,
declarative approach this concept deliberately steps outside of).

## Try It Yourself

1. Replace the imperative handle with a plain `shouldFlash: boolean`
   prop and a `useEffect` reacting to it — click a button that flips it
   `true` then `false` again in one call (so React batches it into a
   single actual change) and observe that a *second* click, without
   anything else changing in between, has to work around the fact that
   "true → false → true" isn't a change `useEffect`'s own dependency
   array can see happen twice in a row without an extra counter.
2. Expose a *second* real method from the same imperative handle (e.g.
   `reset: () => void`) and call both from the parent — confirm each
   one triggers its own real, independent action.
3. Try calling `flasherRef.current?.flash()` from inside a `useEffect`
   in the parent instead of a click handler — reason about whether this
   is still a legitimate real use (an action, still triggered once, in
   response to a real event) or whether it's crossed back into something
   that should really just be a declarative prop instead.
