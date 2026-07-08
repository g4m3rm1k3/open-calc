# React Calculator — Lesson 05 — State: Giving the Display a Memory

## What You Will Build

The display holds a real, changing value for the first time. Tap it, and
the number grows. This exact tap is not the calculator's real input method
— that's built in lesson 06, with the actual keypad. What matters in this
lesson is narrower and more important: proving that a component can hold a
value that changes while the page is running, and that changing it makes
React redraw the screen.

---

## What You Need to Know First

Lesson 04 — a `Display` component currently hardcoded to always show
`"0"`, and a `Keypad` rendering ten buttons that don't do anything yet.

---

## Step 1 — Why `let` Doesn't Work

**The problem:** The obvious first idea — give `Display` an ordinary
variable instead of a hardcoded string — doesn't do what it looks like it
should. Try it, to see the failure honestly, before the real fix:

```tsx
function Display() {
  let value = "0";
  value = "99";
  return <div className="display">{value}</div>;
}
```

Click **▶ Preview**. The display shows `"99"` — because `value` was
reassigned before the component ever returned anything, so this particular
case looks like it worked. But add a way to change `value` *after* the
first render — for instance, a click:

```tsx
function Display() {
  let value = "0";
  return (
    <div className="display" onClick={() => { value = "99"; }}>
      {value}
    </div>
  );
}
```

Click **▶ Preview** and click the display. Nothing changes on screen —
even though `value` genuinely is `"99"` internally the instant after the
click.

**Walkthrough — why this fails.** `Display()` is a plain JavaScript
function. Every time React wants to know what `Display` should show, it
calls `Display()` again, from scratch — and every local variable inside a
function, including `let value = "0"`, is recreated fresh on every call,
with no memory of what happened last time. The click handler above *does*
reassign `value` — but nothing tells React "something changed, please call
`Display()` again and put the new result on the page." The assignment
happens; the redraw never gets triggered; and even if it somehow did,
calling `Display()` again would just recreate `value` as `"0"` from
scratch anyway, throwing away the click's change entirely.

**CS lens — this is the difference between a value and state.** A plain
variable inside a function exists only for the duration of that one
function call — the same as a local variable in `columnLetter()` from the
TypeScript Spreadsheet project, gone the moment the function returns.
**State** is different: it is a value React itself remembers *between*
calls to a component function, tied to that specific place in the
component tree, and — critically — changing it is what tells React "call
this component again, something it depends on is different now."

**Object lifetime, named explicitly, since state is the first thing in
this project that has one.** Every value in a program has a **lifetime**
— the span of time between when it's created and when it's destroyed and
its memory reclaimed. A local variable's lifetime is exactly one function
call: born when the call starts, gone when it returns. `Display`'s state
has a *longer* lifetime: it's created once, the first time `Display`
**mounts** (appears in the tree for the first time), and it survives every
subsequent re-render, until `Display` **unmounts** (is removed from the
tree entirely — lesson 15 is where this first genuinely happens, when
`ScientificPad` toggles off). This mount → survives many re-renders →
unmount span is a component instance's lifetime, and it's precisely why
state can "remember" anything at all: it's tied to that lifetime, not to
any single call of the component function.

**A precise refinement worth having, on exactly what "the function is
called again" means.** Lesson 01 said re-rendering means calling the
component function again — true, but one detail matters here: React
doesn't confuse *this* `Display`'s state with some *other* `Display`'s
state, even though both would be running the identical function
`Display()`. React tracks state per **position in the tree**, not per
function — if this project ever rendered two `<Display />` elements side
by side, each would get its own, completely independent `useState("0")`
call and its own independent value, despite both running the exact same
code. "Which `Display`" is determined by where it sits in the component
tree lesson 02 introduced, not by anything written inside the function
itself.

---

## Step 2 — `useState`

Replace `Display.tsx`'s contents:

```tsx
function Display() {
  const [value, setValue] = React.useState("0");
  return (
    <div className="display" onClick={() => setValue(value + "1")}>
      {value}
    </div>
  );
}
```

Click **▶ Preview**. Click the display several times. The number actually
grows — `"0"` becomes `"01"`, then `"011"`, then `"0111"` — a real,
changing value, redrawn correctly every time.

**Walkthrough — `React.useState("0")`.** `useState` is a **hook** — a
special kind of function, always starting with `use`, that lets a function
component tap into React's own machinery (here: memory between renders).
It's called through the global `React` object because, as this project's
[README](README.md) explains, there's no real `import { useState } from
'react'` available in this sandbox — `React.useState` is the same function,
reached the only way this environment can reach it. `useState("0")` does
two things: it tells React "remember a value here, starting at `\"0\"` the
very first time this component ever renders," and it hands back **two**
things every single time `Display` runs.

**Walkthrough — array destructuring, and why exactly two values.**
`const [value, setValue] = React.useState("0");` is **array destructuring**
— pulling values out of an array by position instead of by name. `useState`
always returns an array of exactly two items: the **current** value
(`value`, whatever it is right now — `"0"` on the very first render, then
whatever it was last set to on every render after) and a **setter
function** (`setValue`) whose only job is changing that value. The names
`value` and `setValue` are not special — they're ordinary variable names
chosen by whoever calls `useState`; naming the setter `set` + the capitalized
value name (`value`/`setValue`, later `angleMode`/`setAngleMode`) is a
convention this project uses everywhere from here on, not a rule React
enforces.

**Walkthrough — what actually happens on a click.** `onClick={() =>
setValue(value + "1")}` runs `setValue(value + "1")` — string
concatenation, gluing `"1"` onto the end of whatever `value` currently is
— exactly once, the moment the display is clicked. Calling the setter does
something `let value = "99"` never could: it tells React "the state behind
this component changed, and its new value is this." React responds by
calling `Display()` again — a real second execution of the function — and
this time, `React.useState("0")` does **not** reset back to `"0"`. It
returns the value React has been remembering, which is now the freshly
updated one. The `"0"` argument only ever matters on a component's very
first render, ever, for as long as that component stays on the page.

**Walkthrough — `value + "1")` never modifies `value` itself; strings
cannot be modified at all.** A **string** in JavaScript is **immutable** —
once created, its contents can never change; `value + "1"` doesn't alter
the string `value` currently points to, it computes and returns a brand
new string, which `setValue` then stores as the new state. This is worth
noticing early, because it's the *easy* case: strings, numbers, and
booleans are all immutable by nature, so there's no way to accidentally
"mutate them in place" even if you tried. Lesson 18 revisits this exact
concern for arrays and objects, which genuinely *can* be mutated in place
(`.push()`, direct property assignment) — a real danger strings and
numbers simply don't have, which is part of why the mistake doesn't show
up until this project starts holding more complex state.

**A crucial, commonly-confused point about timing: `setValue` does not
change `value` immediately, inside the handler that called it.** Calling
`setValue(value + "1")` does not reach back and update the `value` variable
currently in scope — that specific `value` was created by *this* render's
call to `useState`, and like every `const`, it never changes for the rest
of this render. What `setValue` actually does is tell React "the next
time you render this component, start `useState` off from this new value
instead." If the click handler read `value` again on the very next line,
immediately after calling `setValue`, it would still see the *old* value —
the update only becomes visible the *next* time `Display` runs, as a
brand-new call with a brand-new `value` from a fresh `useState`. This is
why every setter call in this entire project is written to depend only on
values already known at the moment it's called, never assuming a state
setter has taken effect by the very next line of the same function.

**CS lens — `() => setValue(value + "1")` is a closure.** The arrow
function passed to `onClick` refers to `value` and `setValue` — two names
it never received as its own parameters, reaching out instead to variables
that exist in the surrounding `Display` function. A function that
"remembers" and can still use variables from the scope it was defined in,
even when it's called later, from somewhere else entirely (here, by
React's own event system, whenever a click actually happens) is called a
**closure**. Every event handler in this project, from here on, is a
closure — this is the mechanism, not a special case.

**SE lens — why state lives inside the component that owns it, for now.**
`Display` owns its own display value, entirely by itself — nothing outside
`Display` can see or change it. This is deliberate and temporary: it makes
`Display` simple to reason about on its own, in isolation, exactly the way
`Button`'s `label` prop made `Button` simple in lesson 03. **Forward
connection:** the real keypad buttons live in a *different* component,
`Keypad`, and lesson 07 (Lifting State Up) is entirely about what happens
the moment two sibling components both need access to the same state —
this lesson deliberately stops short of that problem so state itself can
be understood on its own first.

---

## Connect the Pieces

```
Display.tsx   React.useState("0") — value remembered between renders,
              setValue — the only way to change it and trigger a redraw
              onClick — a placeholder interaction, replaced in lesson 06
```

---

## What Breaks Without This

**Using `let value = "0"` and reassigning it in a click handler (Step 1):**
No error at all — no red squiggly, no console warning, no crash. The
screen simply never updates, silently, which is a harder bug to notice and
diagnose than an outright error. This is the single most common first
mistake with React state, and the reason this lesson demonstrates the
broken version deliberately, live, before showing the fix.

**Calling `setValue` with the exact same value it already holds** (try
changing the click handler to `setValue(value)`): the display doesn't
visibly change, and React is smart enough not to bother re-rendering the
component at all in this case — a real, if minor, optimization worth
knowing about now, before lesson 14 (React.memo) makes a bigger deal of
render-avoidance on purpose.

---

## Definition of Done

- [ ] `Display` uses `React.useState("0")` instead of a hardcoded string
- [ ] Clicking the display visibly grows the number
- [ ] You can explain why a plain `let` variable can't hold state across renders
- [ ] You can explain exactly what the two values `useState` returns represent
- [ ] You can explain what a closure is, using this lesson's `onClick` as the example
- [ ] You can explain what "lifetime" means for a value, contrasting a local variable's lifetime with state's
- [ ] You can explain why two `<Display />` elements on the same page would not share state, even though both run identical code
- [ ] You can explain why strings are immutable and how that relates to `value + "1"`
- [ ] You can explain why reading `value` on the line right after calling `setValue` still shows the old value

---

*Next: Lesson 06 — Events: Wiring Up the Buttons. The placeholder click on
the display is replaced by the real thing: ten actual digit buttons, each
appending its own label.*
