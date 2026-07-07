# React Calculator — Lesson 09 — Wiring the Operator Buttons

## What You Will Build

Subtraction, multiplication, and division, working alongside addition.
`handleOperator` in `Calculator.tsx` — the function that actually runs an
operation — will not change by a single character.

---

## What You Need to Know First

Lesson 08 — `engine.ts` with `add` and an `OPERATORS` dispatch table;
`Calculator` wired to a real `+` button through it.

---

## Step 1 — Add Three Functions to `engine.ts`

```typescript
function subtract(firstOperand: number, secondOperand: number): number {
  return firstOperand - secondOperand;
}

function multiply(firstOperand: number, secondOperand: number): number {
  return firstOperand * secondOperand;
}

function divide(firstOperand: number, secondOperand: number): number {
  return firstOperand / secondOperand;
}

const OPERATORS: Readonly<Record<string, (a: number, b: number) => number>> = {
  "+": add,
  "-": subtract,
  "×": multiply,
  "÷": divide,
};
```

**Walkthrough.** Three more pure functions, each exactly as small as `add`.
Notice the dispatch table's keys are `"×"` and `"÷"` — the actual symbols a
calculator shows, not the `*` and `/` a programming language uses for the
same operations. Nothing requires them to match; `OPERATORS` just needs
its keys to be whatever strings will actually arrive from button clicks.

**What isn't handled yet, on purpose.** `divide(5, 0)` doesn't throw an
error — JavaScript's own division returns `Infinity`, silently. Try it
once you've wired the `÷` button below: `5 ÷ 0 =` shows `Infinity` on
screen, which is technically what JavaScript computed but not what a
calculator should ever display to a person. This project leaves that gap
open, honestly, until lesson 13 — turning failures like this into a real,
handled `Result` is that lesson's entire subject, and handling it here
first would mean doing the same work twice.

---

## Step 2 — Add the Buttons

Update `Keypad.tsx`, adding three more operator buttons next to `+`:

```tsx
const digitLabels = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (operator: string) => void;
  onEquals: () => void;
  onClear: () => void;
}

function Keypad({ onDigit, onOperator, onEquals, onClear }: KeypadProps) {
  return (
    <div className="keypad">
      {digitLabels.map((label) => (
        <Button key={label} label={label} onClick={() => onDigit(label)} />
      ))}
      <Button label="+" onClick={() => onOperator("+")} />
      <Button label="-" onClick={() => onOperator("-")} />
      <Button label="×" onClick={() => onOperator("×")} />
      <Button label="÷" onClick={() => onOperator("÷")} />
      <Button label="=" onClick={onEquals} />
      <Button label="C" onClick={onClear} />
    </div>
  );
}
```

Click **▶ Preview**. Try `9`, `-`, `4`, `=` (shows `5`). Try `6`, `×`, `7`,
`=` (shows `42`). `Calculator.tsx` was not opened this entire lesson.

**Walkthrough — tracing one click all the way through, mechanically.**
Click `×`. `Button`'s `onClick` prop — the arrow function
`() => onOperator("×")` that `Keypad` built for this specific button —
runs. It calls `onOperator("×")`, which is `Calculator`'s `handleOperator`
function, received as a prop, being invoked with the string `"×"` as its
`operator` argument. Inside `handleOperator`, `pendingOperator` gets set
to `"×"` — not called yet, only *remembered*. Nothing is computed at this
point; `handleOperator` only decides whether a *previous* pending
operation needs to run first (there isn't one yet, if this is the first
operator pressed). The actual multiplication doesn't happen until the
*next* operator or `=` is pressed, at which point `OPERATORS["×"]` is
finally looked up and called with two real numbers. Being able to trace a
single click through every function it passes through, in order, without
guessing, is the actual skill "understanding the code" refers to — not
just recognizing what each piece does in isolation.

**CS lens and SE lens together — this is the open/closed principle,
exactly as named in the TypeScript Spreadsheet project's own dispatch
table lesson.** A piece of code is **open for extension** when new
behavior can be added to it, and **closed for modification** when adding
that behavior never requires editing code that already works and is
already tested. `handleOperator` reads `OPERATORS[pendingOperator]` — it
was written once, in lesson 08, without knowing subtraction, multiplication,
or division would ever exist, and it did not need to know. Adding three
new operators meant adding three new dispatch-table entries and three new
buttons — zero risk of breaking the addition logic that already worked,
because that logic was never touched.

**Connect to the real world.** A plain object mapping short strings to
functions is one of the most common patterns in production software,
under many different names. A command-line tool like `git` internally maps
the word after `git` (`commit`, `push`, `status`) to a different handler
function the same way `OPERATORS` maps `"×"` to `multiply`. A web
framework maps an HTTP method and path to the function that handles that
specific route. A Redux reducer (a pattern this project builds its own
version of, starting in lesson 18) maps `action.type` strings to state-
update logic. Once you can see `OPERATORS` for what it is — a lookup table
deciding *what to run* based on a piece of data received at runtime —
you'll start recognizing the same shape everywhere.

---

## Connect the Pieces

```
engine.ts        subtract(), multiply(), divide() — three new pure
                 functions; OPERATORS now has four entries
Keypad.tsx       three new operator buttons, wired identically to "+"
Calculator.tsx   unchanged — handleOperator already worked generically
```

---

## What Breaks Without This

Already named above: `÷` by zero currently shows `Infinity`, not a real
error message — a concrete, visible gap this project carries forward
honestly until lesson 13, rather than papering over it here with a
half-fix that would need to be redone anyway.

**A second, easy-to-miss failure mode:** if `OPERATORS`' key for
multiplication were typo'd as `"x"` (the letter) instead of `"×"` (the
multiplication sign `Keypad` actually sends), `OPERATORS["×"]` would
return `undefined` — not an error, just a missing value. `handleOperator`
would then try to *call* `undefined` as if it were a function
(`undefined(previousValue, currentValue)`), which throws
`TypeError: OPERATORS[pendingOperator] is not a function` — a real crash,
and one whose error message points at the call site, not the actual
mistake (the mismatched key sitting quietly in the object literal above
it). Keeping the dispatch table's keys and the button labels that feed it
visibly side by side, as this project does, is what makes a mismatch like
this easy to spot by eye before it ever becomes a runtime error.

---

## Definition of Done

- [ ] All four operators (`+ - × ÷`) work correctly
- [ ] `Calculator.tsx` was not modified in this lesson
- [ ] You can explain the open/closed principle using `handleOperator` and `OPERATORS` as the example
- [ ] You can trace a single button click through every function it passes through, in order
- [ ] You've confirmed, live, that `5 ÷ 0` shows `Infinity` rather than a real error
- [ ] You can explain why a typo'd dispatch-table key fails with a confusing error pointing at the wrong line

---

*Next: Lesson 10 — Why Doesn't 2+3×4 Equal 20? The calculator works for
every example so far — until it's given an expression with two different
operators in one line.*
