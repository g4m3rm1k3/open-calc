# React Calculator — Lesson 08 — Where Should Math Live?

## What You Will Build

A real, working `+` button. Press `2`, `+`, `3`, `=`, and the display shows
`5` — computed by a function that has never heard of React, called from a
component that has never done arithmetic itself. This is the smallest
possible proof of this project's central idea, stated in its own
[README](README.md): the math engine is not React, and React is not the
math engine.

---

## What You Need to Know First

Lesson 07 — `Calculator` holds `value`/`setValue` and a working `C` button.
This lesson renames and extends that state to support a real operator, so
read `handleDigit`/`handleClear` in `Calculator.tsx` once before starting.

---

## Step 1 — Start `engine.ts`, and Put One Function In It

Click **+ File** in the JavaScript tab and create `engine.ts`.

```typescript
function add(firstOperand: number, secondOperand: number): number {
  return firstOperand + secondOperand;
}

const OPERATORS: Readonly<Record<string, (a: number, b: number) => number>> = {
  "+": add,
};
```

**Walkthrough — `add`, deliberately trivial.** This function is almost
insultingly simple — that's the point. Its entire job is being *correct*
and being *only* about addition. It doesn't know what a "display" is. It
doesn't know it's being called from a button. It takes two numbers and
returns their sum, exactly the way `columnLetter()` in the TypeScript
Spreadsheet project took a number and returned a letter — a **pure
function**: given the same inputs, it always returns the same output, and
it doesn't read or change anything outside itself.

**Walkthrough — `OPERATORS`, a dispatch table.** `Record<string, (a: number,
b: number) => number>` describes a plain object where every key is a
string and every value is a function taking two numbers and returning a
number. `OPERATORS["+"]` retrieves the `add` function itself — not the
result of calling it — which can then be called separately with whatever
two numbers are needed at the time. This is the exact same **dispatch
table** pattern the TypeScript Spreadsheet project used for `SUM`, `AVG`,
`MIN`, `MAX`, and `COUNT` in its own lesson 10: a lookup from a name to a
function, so that *which* function runs is decided by data (a string
that arrived from a button click) instead of a chain of `if` statements
checked one by one. `Readonly<...>` — introduced for `BUILT_IN_FUNCTIONS`
in that same project — prevents any code from accidentally reassigning
`OPERATORS["+"]` to something else after it's defined.

**SE lens — this file has one responsibility, and it isn't UI.**
`engine.ts` will grow throughout this project — subtraction, multiplication,
division, trigonometry, memory, formulas — and not one line of it will
ever mention `React`, `useState`, JSX, or a button. This is **separation of
concerns**: the rules of arithmetic and the rules of "what happens when
someone clicks something" are two different problems, solved in two
different files, so that a bug in one can never be a bug in the other. As
this project's README states plainly: the engine doesn't know a screen
exists.

---

## Step 2 — Track an Operator in `Calculator`

Real arithmetic needs to remember more than one thing: the value typed
*before* an operator was pressed, and *which* operator is waiting to be
applied. Replace `Calculator.tsx`'s contents:

```tsx
function Calculator() {
  const [display, setDisplay] = React.useState("0");
  const [previousValue, setPreviousValue] = React.useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = React.useState<string | null>(null);
  const [startFresh, setStartFresh] = React.useState(false);

  function handleDigit(digit: string): void {
    if (startFresh || display === "0") {
      setDisplay(digit);
      setStartFresh(false);
    } else {
      setDisplay(display + digit);
    }
  }

  function handleOperator(operator: string): void {
    const currentValue = Number(display);
    if (pendingOperator !== null && previousValue !== null) {
      const result = OPERATORS[pendingOperator](previousValue, currentValue);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(currentValue);
    }
    setPendingOperator(operator);
    setStartFresh(true);
  }

  function handleEquals(): void {
    if (pendingOperator === null || previousValue === null) return;
    const currentValue = Number(display);
    const result = OPERATORS[pendingOperator](previousValue, currentValue);
    setDisplay(String(result));
    setPreviousValue(null);
    setPendingOperator(null);
    setStartFresh(true);
  }

  function handleClear(): void {
    setDisplay("0");
    setPreviousValue(null);
    setPendingOperator(null);
    setStartFresh(false);
  }

  return (
    <div className="calculator">
      <Display value={display} />
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onEquals={handleEquals}
        onClear={handleClear}
      />
    </div>
  );
}
```

**Walkthrough — four pieces of state, and what each one remembers.**
`display` is what's on screen — unchanged from lesson 07. `previousValue`
is the number that was on screen the moment an operator was last pressed —
`number | null`, because there isn't one yet when the calculator first
starts. `pendingOperator` is which operation is waiting to run — also
possibly `null`. `startFresh` is new: a flag meaning "the next digit
pressed should start a brand new number, not append to what's showing."
Without it, pressing `2`, then `+`, then `3` would show `"23"` instead of
`"3"` — the display would keep appending instead of realizing a fresh
number just started. `handleDigit` from lesson 06 is extended here,
checking `startFresh` in addition to the existing "still showing the
untouched zero" check.

**Walkthrough — `handleOperator`.** `Number(display)` converts the
currently-displayed string into a real number to compute with — `Number`
is a built-in JavaScript function; `Number("3")` returns `3`, and
`Number("abc")` would return `NaN` ("Not a Number"), a case this project
comes back to once real expressions can be malformed, starting lesson 13.
If a `pendingOperator` already exists — meaning the user pressed an
operator, typed a second number, and is now pressing *another* operator
before ever pressing `=` — the previous operation runs immediately,
chaining forward, before the new operator is recorded. This chaining
behavior is exactly what produces the bug lesson 10 exposes on purpose;
it's kept here, honestly, rather than hidden, because seeing it fail is
how the next few lessons earn their reason to exist.

**Walkthrough — `handleEquals`.** Nearly identical to the chaining branch
of `handleOperator`, but afterward it fully resets `pendingOperator` and
`previousValue` to `null` — `=` means "I'm done with this operation,"
where pressing another operator means "and now do this next one too."

---

## Step 3 — Add the `+` and `=` Buttons

Update `Keypad.tsx`:

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
      <Button label="=" onClick={onEquals} />
      <Button label="C" onClick={onClear} />
    </div>
  );
}
```

Click **▶ Preview**. Click `2`, `+`, `3`, `=`. The display shows `5`.

**Walkthrough.** `onClick={() => onOperator("+")}` follows the exact same
closure pattern lesson 06 used for digits — a tiny wrapper supplying the
one piece of information (`"+"`) that `handleOperator` needs but `Button`
itself doesn't know about. `onClick={onEquals}` and `onClick={onClear}`
are passed directly, with no wrapper, because `handleEquals` and
`handleClear` already take no arguments — the same distinction lesson 07
made explicit for the Clear button.

---

## Connect the Pieces

```
engine.ts        add() — pure, no React; OPERATORS — a dispatch table
                 mapping operator symbols to functions
Calculator.tsx   previousValue, pendingOperator, startFresh — enough state
                 to perform one real operation; handleOperator/handleEquals
                 call into engine.ts, never compute anything themselves
```

---

## What Breaks Without This

**Calling `previousValue + currentValue` directly inside `Calculator.tsx`,
instead of `OPERATORS[pendingOperator](previousValue, currentValue)`:**
the calculator would still work today — but adding subtraction in the very
next lesson would mean writing a new `if (pendingOperator === "-")`
branch, and multiplication another, and division another. Every new
operator would mean editing `handleOperator` again. Lesson 09 adds three
more operators and edits `handleOperator` exactly zero times — that's only
possible because the dispatch table already exists.

---

## Definition of Done

- [ ] `engine.ts` exists with `add` and an `OPERATORS` dispatch table
- [ ] `2 + 3 =` correctly shows `5`
- [ ] You can explain what a pure function is, using `add` as the example
- [ ] You can explain what `startFresh` prevents, concretely

---

*Next: Lesson 09 — Wiring the Operator Buttons. Subtraction, multiplication,
and division join addition — and `handleOperator` doesn't change at all.*
