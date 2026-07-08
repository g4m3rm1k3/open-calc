# React Calculator — Lesson 07 — Lifting State Up

## What You Will Build

A working Clear button — a permanent, real calculator feature — built
using the exact same pattern lesson 06 used out of necessity. This lesson
adds nothing conceptually new to *write*; it names something you already
did, explains why it's the only correct option, and proves it by building
a second real feature with it.

---

## What You Need to Know First

Lesson 06 — `Calculator` owns `value`/`setValue`; `Display` and `Keypad`
receive it through props.

---

## Step 1 — What "Owns" a Piece of State Actually Means

Lesson 06 kept saying `Calculator` "owns" `value`. That word has been
doing real work without ever being defined. Define it now, precisely,
because every lesson from here on depends on it:

> **A piece of state always has exactly one owner: the component that
> calls `useState` (or, later, `useReducer`) for it.** The owner is
> responsible for creating the state, updating it, deciding which
> descendants are allowed to read it, and passing it down as props to
> whichever of them need it. Every other component is either a
> **consumer** — it receives the value through props and reads it — or an
> **actor** — it receives a function through props and calls it to
> request a change, without ever touching the state directly itself.

`Calculator` is `value`'s owner. `Display` is a consumer — it only ever
reads `value`, through the prop lesson 06 gave it. `Keypad` is an actor —
it never sees `value` at all, only `onDigit`, a function it calls to
*request* a change, leaving the actual updating entirely to the owner.
Neither `Display` nor `Keypad` could become the owner instead without
losing the ability to coordinate with the other — which is exactly the
motivation for lifting state up, arrived at now with the vocabulary to
state it precisely instead of just doing it.

## Step 2 — Naming What Lesson 06 Already Did

**Lifting state up** is the name for moving a piece of state from the
component that first seemed to need it, up to the closest shared ancestor
of every component that actually needs it — in the tree vocabulary lesson
02 established, the closest node that has both candidates as descendants.
`Display` looked like the natural home for the display value, right up
until `Keypad` also needed to change it — at which point the *only*
component that can coordinate both of them, and therefore the only
component that can correctly be the owner, is their common ancestor,
`Calculator`.

**SE lens — why React doesn't let components reach sideways.** It would
be technically possible to design a UI framework where any component could
directly grab and mutate any other component's internal state, anywhere in
the tree. React deliberately doesn't allow this. Every component's state
is fully private to it — nothing outside can see or change it except
through props that component explicitly agreed to accept. This is
**encapsulation**, the same principle a class's private fields enforce in
traditional object-oriented code: a component's internals are its own
business, and everything it exposes to the outside is a deliberate,
visible choice (its props), not an accident of implementation.

**Why this restriction is good, not just annoying.** Imagine the opposite:
if `Keypad` could reach into `Display` and call its `setValue` directly,
you would need to read *every other component in the entire project*
before trusting that `Display`'s value only changes in ways `Display`
itself expects. With state lifted to a shared parent and passed down
explicitly, `Calculator.tsx`'s `handleDigit` function is the *only* place
in the whole project responsible for how digits affect the display — one
file to read, one function to trust, no matter how large this project
eventually gets.

**CS/SE lens — dependencies only ever point one way: downward.** In this
project's component tree, information — props — only ever flows from a
node to its children, never sideways to a sibling and never upward to a
parent. This is called **dependency direction**, and React enforces it as
a hard rule: a component can depend on (receive data from) its ancestors,
never its siblings, and never its descendants. `Keypad` cannot depend on
`Display` because they're siblings — neither is an ancestor of the other.
The *only* node both can depend on is their shared ancestor, `Calculator`
— which is precisely, mechanically, why lifting state to the closest
shared ancestor isn't just *a* solution, it's the *only* location in the
whole tree that both `Display` and `Keypad` are structurally allowed to
depend on at all. Every "where should this state live" question in this
project from here on has the identical answer-shape: find the lowest node
in the tree that is an ancestor of everything that needs it.

---

## Step 3 — What Breaks Without Lifting: A Live Demonstration

**The problem:** to see why lifting state is the *only* correct option
here — not just *a* nice option — it helps to see the broken alternative
fail, the same way lesson 05 showed a broken `let` before the real fix.

Temporarily give `Display` its own separate state back, alongside
`Calculator`'s:

```tsx
// Display.tsx — TEMPORARY, to prove a point, not the real code
function Display() {
  const [value] = React.useState("0");
  return <div className="display">{value}</div>;
}
```

If `Display` no longer accepts a `value` prop, `Calculator`'s `handleDigit`
has nothing left to update that would actually reach the screen —
`Calculator`'s own `value` state changes, correctly, but `Display` is
reading from a *completely separate* piece of state that nothing ever
touches. Clicking digits would silently do nothing visible at all, for a
totally different reason than lesson 06's typo — not a wiring mistake this
time, but **two independent sources of truth that were never the same
value to begin with.**

**Revert this** back to lesson 06's real version — `Display` accepting a
`value` prop — before continuing. This step was for understanding, not for
keeping.

**CS lens — single source of truth.** A **single source of truth** means
exactly one place in a program owns the real, authoritative copy of a
piece of information — every other place that displays or uses it reads
from that one place, rather than keeping its own separate copy that could
drift out of sync. `Calculator`'s `value` is this project's single source
of truth for the display. The moment two components each keep their own
`useState` for what's supposed to be the same logical value, there is no
longer one truth — there are two, and nothing keeps them equal.

---

## Step 4 — Add a Real Clear Button

With state already correctly lifted, adding a second feature that needs to
affect the display is now small. In `Calculator.tsx`, add a `handleClear`
function next to `handleDigit`:

```tsx
function Calculator() {
  const [value, setValue] = React.useState("0");

  function handleDigit(digit: string): void {
    setValue(value === "0" ? digit : value + digit);
  }

  function handleClear(): void {
    setValue("0");
  }

  return (
    <div className="calculator">
      <Display value={value} />
      <Keypad onDigit={handleDigit} onClear={handleClear} />
    </div>
  );
}
```

Update `KeypadProps` and `Keypad` in `Keypad.tsx` to accept and use it:

```tsx
const digitLabels = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

interface KeypadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
}

function Keypad({ onDigit, onClear }: KeypadProps) {
  return (
    <div className="keypad">
      {digitLabels.map((label) => (
        <Button key={label} label={label} onClick={() => onDigit(label)} />
      ))}
      <Button label="C" onClick={onClear} />
    </div>
  );
}
```

Click **▶ Preview**. Type a few digits, then click `C`. The display resets
to `"0"`.

**Walkthrough.** Notice `<Button label="C" onClick={onClear} />` passes
`onClear` directly, with **no** wrapping arrow function — unlike the digit
buttons. This is intentional, not an inconsistency: `Button`'s `onClick`
prop expects a no-argument function (`() => void`), and `onClear` already
*is* exactly that — `handleClear` takes no arguments. The digit buttons
needed a wrapping arrow function specifically because `onDigit` needs an
argument (*which* digit) that only the wrapper can supply. When a prop
already matches the exact shape needed, passing it directly is correct and
simpler — recognizing *when* a wrapper is needed, versus when it would
just be unnecessary extra code, is worth noticing explicitly here.

**Forward connection — this two-level pass-through is not yet "prop
drilling," but it's the shape that becomes a real problem later.** Right
now, `onDigit` and `onClear` travel exactly one level — `Calculator` to
`Keypad` — a completely normal, healthy use of props. Lesson 17 names
**prop drilling** precisely: passing a prop down through one or more
*intermediate* components that don't use it themselves, purely so a
distant descendant can eventually receive it. This project doesn't hit
that problem yet because `Keypad` is both the recipient and the user of
`onDigit`/`onClear` — but as this tree grows deeper (a settings value
needed by a component three levels down, say), the exact same lifting
instinct this lesson just named formally starts to strain, which is the
honest motivation lesson 17's `Context` actually solves.

**SE lens — this is why the pattern is worth having a name.** `handleClear`
took three lines, in the one file that already owns the state it needs to
change. No new state was introduced anywhere. No component needed to be
taught about any other component. Every feature this project adds from
here on that touches the display — parentheses, percent, scientific
functions, memory — follows this exact same shape: a new handler function
in `Calculator`, passed down as a prop to whichever button needs to call
it.

---

## Connect the Pieces

```
Calculator.tsx   handleDigit() and handleClear() — two handlers, one
                 shared state, the single source of truth for the display
Keypad.tsx       onDigit and onClear props, both passed straight through
                 to the buttons that need them
```

---

## What Breaks Without This

Already demonstrated live in Step 2: giving `Display` its own separate
`useState` instead of a `value` prop creates two disconnected copies of
what should be one value — `Calculator`'s changes become invisible,
silently, with no error anywhere to point at the cause.

---

## Definition of Done

- [ ] A working `C` button clears the display back to `"0"`
- [ ] `Display` still has zero state of its own — only a `value` prop
- [ ] You can state, from memory, the formal definition of what it means for a component to "own" a piece of state
- [ ] You can explain what "lifting state up" means and why React requires it here
- [ ] You can explain what a "single source of truth" is, using Step 3's broken demo as the concrete example
- [ ] You can explain why `onClear` is passed directly but `onDigit` needs a wrapping arrow function
- [ ] You can say, for `Display` and `Keypad` each, whether they're a consumer or an actor with respect to `value`

---

*Next: Lesson 08 — Where Should Math Live? The calculator can now hold and
clear a value — but it still can't actually compute anything. The math
engine is born, and it will not contain a single line of React.*
