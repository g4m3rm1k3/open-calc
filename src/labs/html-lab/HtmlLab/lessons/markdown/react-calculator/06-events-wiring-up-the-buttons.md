# React Calculator — Lesson 06 — Events: Wiring Up the Buttons

## What You Will Build

The real thing: click `7`, then `8`, and the display shows `78`. The
placeholder click from lesson 05 is gone. Every one of the ten real digit
buttons now does what it looks like it should.

---

## What You Need to Know First

Lesson 05 — `Display` holding its own state with `React.useState`, updated
by a placeholder click directly on the display itself.

---

## Step 1 — Name the Problem: State Lives in the Wrong Component

**The problem:** `Display`'s state is only reachable from inside
`Display`. The real digit buttons live in `Keypad` — a completely
different component, a *sibling* of `Display` under `Calculator`, not a
parent or a child of it. `Keypad` has no way to reach into `Display` and
call its `setValue` — React components can't reach sideways into each
other like that, on purpose (lesson 07 explains exactly why this
restriction exists and is a good thing).

The fix: move the state up to the one component that actually contains
both of them — `Calculator` — and hand each child exactly what it needs as
props. `Display` gets the current value to *show*. `Keypad` gets a
function to *call* when a digit is pressed.

---

## Step 2 — Move the State Up to `Calculator`

Replace `Calculator.tsx`'s contents:

```tsx
function Calculator() {
  const [value, setValue] = React.useState("0");

  function handleDigit(digit: string): void {
    setValue(value === "0" ? digit : value + digit);
  }

  return (
    <div className="calculator">
      <Display value={value} />
      <Keypad onDigit={handleDigit} />
    </div>
  );
}
```

**Walkthrough — `handleDigit`, and why `value === "0"` is checked first.**
Appending blindly (`value + digit`) would turn the calculator's starting
`"0"` into `"07"`, then `"078"` — a real calculator never shows a leading
zero once a real digit has been typed. `value === "0" ? digit : value +
digit` reads: "if the display is still showing the untouched starting
zero, replace it outright; otherwise, append." This is the first real
piece of calculator *behavior* this project has needed — small, but it's
the first line of code here driven by how calculators actually work,
rather than by a React concept.

**PL lens — `value === "0" ? digit : value + digit` is an expression, not
a statement, and the difference is worth being precise about.** A
**statement** performs an action but has no value of its own (`if
(condition) { ... }` is a statement — it cannot be used anywhere a value
is expected, like inside `setValue(...)`). An **expression** evaluates
*to* a value, and can be used anywhere a value is needed — a ternary
(`condition ? a : b`) is always an expression, which is exactly why it
fits directly inside `setValue(...)`'s parentheses, where a plain `if`
statement syntactically could not. This project uses ternaries specifically
in these value-producing spots (here, and in lesson 14's `displayValue`)
precisely because the position they sit in requires an expression, not a
statement — an `if` would need to be restructured entirely (assigning to a
variable first, then passing that variable) to do the same job.

**Walkthrough — `Display` and `Keypad` now take props.** `Calculator`
passes `value={value}` to `Display` (data flowing **down**) and
`onDigit={handleDigit}` to `Keypad` (a **function** flowing down, so a
child can report something happening back **up**, without ever touching
`Calculator`'s state directly itself). Neither child ever calls `setValue`
by name — only `Calculator`, the component that actually owns the state,
does that. This one-way flow — state owned by one component, changes
requested by calling a function that component handed down — is the shape
every piece of shared state in this entire project will take, starting
now.

**Forward connection.** Moving state to a shared parent so two children
can both use it is called **lifting state up** — common enough in React to
have its own name. This lesson does it because there was no other way to
make the real buttons work. Lesson 07 stops and properly names what just
happened, and shows exactly what breaks if you don't do it.

---

## Step 3 — Update `Display` to Receive Its Value as a Prop

Replace `Display.tsx`'s contents:

```tsx
interface DisplayProps {
  value: string;
}

function Display({ value }: DisplayProps) {
  return <div className="display">{value}</div>;
}
```

**Walkthrough.** `Display` no longer calls `React.useState` at all — it
has nothing left to remember on its own. It just receives `value` and
shows it, exactly the same shape as `Button` receiving `label` in lesson
03. A component that only receives props and renders them, with no state
of its own, is often called a **presentational** component — it doesn't
know or care *where* its data came from, only how to show it.

---

## Step 4 — Update `Keypad` and `Button` to Report Clicks

Replace `Keypad.tsx`'s contents:

```tsx
const digitLabels = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

interface KeypadProps {
  onDigit: (digit: string) => void;
}

function Keypad({ onDigit }: KeypadProps) {
  return (
    <div className="keypad">
      {digitLabels.map((label) => (
        <Button key={label} label={label} onClick={() => onDigit(label)} />
      ))}
    </div>
  );
}
```

Replace `Button.tsx`'s contents:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return (
    <button className="calc-button" onClick={onClick}>
      {label}
    </button>
  );
}
```

Click **▶ Preview**. Click `7`, then `8`. The display shows `78`.

**Walkthrough — `onDigit: (digit: string) => void`, your first function
prop type.** `KeypadProps` doesn't just describe data anymore — `onDigit`
is typed as a **function**: something that accepts one `string` argument
and returns nothing (`void`). This is exactly the same "what does this
promise to do" contract a regular function's type signature gives, applied
to something being passed around as a prop instead of called directly.

**CS lens — accepting a function as an argument makes `Button` a
higher-order component.** A **higher-order function** is any function
that takes another function as an argument, returns one, or both.
`Button({ label, onClick })` takes `onClick` — a function — as one of its
two "arguments" (its props object's fields); `.map()` (lesson 04) is
higher-order the other way, taking a function and calling it. React
components that accept a function prop like `onClick` are, by the exact
same reasoning, higher-order — this is not a special or advanced pattern
in this project, it's the ordinary, constant shape of how a child reports
something happening to whatever rendered it. Every single component in
this project from `Button` onward is higher-order in this sense.

**Walkthrough — the arrow function inside `.map()`.** `onClick={() =>
onDigit(label)}` is deliberate, not `onClick={onDigit}`. `Button`'s own
`onClick` prop is typed as `() => void` — a function that takes **no**
arguments. `onDigit`, though, needs to know *which* digit was pressed.
Wrapping it in a tiny arrow function, `() => onDigit(label)`, creates a
new, no-argument function that already "remembers" which `label` it
belongs to — a different one for each of the ten buttons, thanks to
`.map()` calling this code fresh for every item in `digitLabels`. This is
the same **closure** mechanism named in lesson 05 — a function that keeps
access to variables from the scope it was created in — applied here for a
new reason: not remembering state across renders, but wrapping a function
that needs an argument (`onDigit(label)`) inside one that doesn't (what
`Button`'s `onClick` actually expects), so each of the ten buttons closes
over its own, different `label`.

**CS lens — this is an event handler, formally, and here is the entire
pipeline it kicks off.** Clicking a button fires a browser **event** — a
signal that something happened, generated by the browser itself, not your
code. `onClick={onClick}` registers `Button`'s `onClick` prop as the
**callback** — a function handed to something else, to be called later,
in response to something happening, rather than called directly by name
right now — that runs when that specific `<button>` element's click event
fires. React normalizes this across every browser into what it calls a
**SyntheticEvent** system, but the mental model is the same one used
everywhere in web development, and it's worth tracing end to end, once,
explicitly: a click fires a browser **event** → React calls the
registered **handler** (`onDigit(label)`, here) → the handler calls
`setValue`, **scheduling** a state update rather than applying it that
same instant → React **re-renders** the affected components (calls them
again, as functions, per lesson 01's core definition) → React compares
the new description to the old one and updates only the real DOM that
actually changed → the browser **paints** the updated pixels on screen.
Every click in this entire project runs this same seven-step pipeline;
nothing about it is unique to digit buttons.

**Connect to the real world — this seven-step pipeline is why React apps
feel fast despite constantly rebuilding descriptions of the whole UI.**
It's tempting to assume "calling every component function again on every
click" must be slow — real browsers repaint sixty times a second, and
lesson 25 names the actual **16.6-millisecond budget** this has to fit
inside. The step this lesson's pipeline glosses over as "React compares
the new description to the old one" is doing the real work: React never
touches the actual DOM for anything that didn't change, which is dramatically
cheaper than rebuilding real browser elements from scratch. This is the
concrete payoff of the entire "component as a function returning a
description" model from lesson 01 — describing the *whole* UI freshly, in
plain JavaScript objects, every render, is cheap; touching the *real* DOM
is the genuinely expensive part, and React's diffing exists specifically
to minimize exactly that.

**SE lens — three components, three completely different jobs.** `Button`
doesn't know it's part of a calculator — it just reports "I was clicked."
`Keypad` doesn't know what a click *means* — it just knows which label was
attached to whichever button fired, and passes that upward unchanged.
`Calculator` is the only component that knows what a digit press should
*do* to the running total. Splitting "something happened," "which thing,"
and "what that means" across three separate components is the same
single-responsibility idea from lesson 02, now applied to behavior instead
of just layout.

---

## Connect the Pieces

```
Calculator.tsx   useState lives here now; handleDigit() is the one place
                 that knows how digits update the display
Display.tsx      value prop — no state of its own anymore
Keypad.tsx       onDigit prop — passed through to every Button, together
                 with which digit each one represents
Button.tsx       onClick prop — reports a plain click, knows nothing about
                 calculators
```

---

## What Breaks Without This

**Writing `onClick={onDigit(label)}` instead of `onClick={() =>
onDigit(label)}` (a very easy typo to make):** `onDigit(label)` calls the
function *immediately*, while `Keypad` is rendering — not when the button
is clicked — and whatever it returns (`undefined`, since `onDigit` returns
`void`) becomes the actual `onClick` prop. The result: digits get appended
the instant the page loads, all ten of them, and clicking a button
afterward does nothing at all, silently. This is one of the most common
real React bugs, and the reason the arrow-function wrapper is worth
understanding, not just copying.

**Skipping the `value === "0"` check in `handleDigit`:** every click
starts by permanently gluing onto a leading zero — pressing `7`, then `8`
would show `"078"` forever, an honest but wrong result no real calculator
would ever display.

---

## Definition of Done

- [ ] `Calculator` owns the state; `Display` and `Keypad` receive props instead
- [ ] Clicking real digit buttons builds up the display correctly, with no leading zero
- [ ] You can explain why `Keypad` can't just call `Display`'s `setValue` directly
- [ ] You can explain what a closure is, using `() => onDigit(label)` as the example
- [ ] You can list, in order, the seven steps between a click and a repainted screen

---

*Next: Lesson 07 — Lifting State Up. What just happened gets a name, a
general rule, and a second real feature — a working Clear button — built
the same way on purpose.*
