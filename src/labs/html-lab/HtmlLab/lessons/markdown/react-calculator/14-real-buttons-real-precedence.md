# React Calculator — Lesson 14 — Real Buttons, Real Precedence

## What You Will Build

The eager operator model is gone. The display builds a real expression as
you type — `2+3×4` appears exactly as typed — and pressing `=` calls the
engine built across the last four lessons to compute it correctly: `14`,
not `20`. Parentheses, percent, and sign-change all work for the first
time, built on top of the same `evaluate` function, with no new parsing
logic needed for any of them.

---

## What You Need to Know First

Lesson 13 — a finished `evaluate(source: string): CalculatorResult`
function, confirmed correct from the browser console.

---

## Step 1 — Replace the Eager State With a Raw Expression String

Replace `Calculator.tsx`'s contents entirely:

```tsx
function Calculator() {
  const [expression, setExpression] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);

  function handleDigit(digit: string): void {
    setExpression(expression + digit);
    setResult(null);
  }

  function handleOperator(operator: string): void {
    setExpression(expression + operator);
    setResult(null);
  }

  function handleParen(paren: string): void {
    setExpression(expression + paren);
    setResult(null);
  }

  function handleEquals(): void {
    const outcome = evaluate(expression === "" ? "0" : expression);
    setResult(outcome.kind === "success" ? String(outcome.value) : outcome.message);
  }

  function handlePercent(): void {
    const outcome = evaluate(expression === "" ? "0" : expression);
    if (outcome.kind === "success") {
      setExpression(String(outcome.value / 100));
      setResult(null);
    } else {
      setResult(outcome.message);
    }
  }

  function handleSignChange(): void {
    const outcome = evaluate(expression === "" ? "0" : expression);
    if (outcome.kind === "success") {
      setExpression(String(outcome.value * -1));
      setResult(null);
    } else {
      setResult(outcome.message);
    }
  }

  function handleClear(): void {
    setExpression("");
    setResult(null);
  }

  const displayValue = result !== null ? result : (expression === "" ? "0" : expression);

  return (
    <div className="calculator">
      <Display value={displayValue} />
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onParen={handleParen}
        onEquals={handleEquals}
        onPercent={handlePercent}
        onSignChange={handleSignChange}
        onClear={handleClear}
      />
    </div>
  );
}
```

**Walkthrough — `expression` replaces `display`, `previousValue`,
`pendingOperator`, and `startFresh` all at once.** Every one of lessons
08–10's four pieces of state existed to support *eager, one-operator-at-a-
time* computation — the exact design lesson 10 proved was fundamentally
wrong. `expression` is dramatically simpler: it's just the raw text typed
so far, exactly as typed, with nothing computed until `=` is pressed.
`handleDigit`, `handleOperator`, and `handleParen` are now nearly
identical — each just appends its own character to `expression` — because
none of them need to know anything about precedence anymore. That
knowledge lives entirely inside `evaluate`, called exactly once, only when
the user actually asks for an answer.

**Walkthrough — `result: string | null`, kept separate from
`expression`.** `expression` is what the user is currently building.
`result` is what `=` most recently computed — kept as a *second*, separate
piece of state rather than overwriting `expression`, specifically so
pressing `C` clears both cleanly, and so a future lesson (24, expression
history) can record `expression` and `result` as two distinct, meaningful
pieces of the same completed calculation.

**Walkthrough — `handleEquals`, finally calling the real engine.**
`evaluate(expression)` runs the full tokenize → parse → evaluate pipeline
built across lessons 11–13 on whatever the user actually typed.
`outcome.kind === "success" ? String(outcome.value) : outcome.message`
narrows the `CalculatorResult` union exactly the way it was designed to
force: a successful result shows the computed number; a failure shows the
engine's own specific error message (`"Division by zero"`, or a parse
error like `"Expected \")\""`) directly, with no crash and no silent wrong
answer.

**Walkthrough — `handlePercent` and `handleSignChange` reuse `evaluate`
instead of parsing anything new.** Both work by evaluating whatever has
been typed so far into a real number, transforming that number (`÷ 100`,
`× -1`), and starting a fresh expression from the result. Neither needed a
single new line inside `engine.ts` — this is the payoff of lesson 08's
original decision to give the engine one clear public function: any new
calculator feature that can be expressed as "evaluate, then transform" gets
built entirely in the UI layer, for free. **Honest scope note:** this is a
simpler percent behavior than some scientific calculators use (where, for
example, `200+10%` means "10% of 200," not "10% of itself") — this
project's version is the same immediate, no-context percent a basic
four-function calculator uses, chosen deliberately to keep the engine's
grammar unchanged.

---

## Step 2 — Update `Keypad` and `Button` for the New Buttons

Replace `Keypad.tsx`'s contents:

```tsx
const digitLabels = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (operator: string) => void;
  onParen: (paren: string) => void;
  onEquals: () => void;
  onPercent: () => void;
  onSignChange: () => void;
  onClear: () => void;
}

function Keypad({ onDigit, onOperator, onParen, onEquals, onPercent, onSignChange, onClear }: KeypadProps) {
  return (
    <div className="keypad">
      {digitLabels.map((label) => (
        <Button key={label} label={label} onClick={() => onDigit(label)} />
      ))}
      <Button label="+" onClick={() => onOperator("+")} />
      <Button label="-" onClick={() => onOperator("-")} />
      <Button label="×" onClick={() => onOperator("×")} />
      <Button label="÷" onClick={() => onOperator("÷")} />
      <Button label="(" onClick={() => onParen("(")} />
      <Button label=")" onClick={() => onParen(")")} />
      <Button label="%" onClick={onPercent} />
      <Button label="+/-" onClick={onSignChange} />
      <Button label="=" onClick={onEquals} />
      <Button label="C" onClick={onClear} />
    </div>
  );
}
```

`Button.tsx` needs no changes — it was already a generic `label` +
`onClick` component since lesson 06, with no idea what any specific button
does. Click **▶ Preview**. Type `2`, `+`, `3`, `×`, `4`, `=`. The display
shows `14`.

---

## Connect the Pieces

```
Calculator.tsx   expression + result — the entire state model, replacing
                 four pieces of eager-computation state with two
Keypad.tsx       ten new/updated props, one per keypad feature, all
                 following the same pattern since lesson 06
engine.ts        untouched in this lesson — every new button feature was
                 built by composing evaluate(), not extending the grammar
```

---

## What Breaks Without This

**Forgetting the `expression === "" ? "0" : expression` guard before
calling `evaluate`:** pressing `=` on a totally empty display calls
`tokenize("")`, which returns an empty token array, which `parsePrimary`
correctly rejects with `"Expected a number or \"(\", but the expression
ended"` — not a crash, but a confusing error message for what should just
mean "the answer is zero." The guard turns "nothing typed yet" into the
same case as "the display already shows 0," which is what a user actually
expects pressing `=` on a blank calculator to do.

---

## Definition of Done

- [ ] `2+3×4=` correctly shows `14`
- [ ] Parentheses, percent, and sign-change all work
- [ ] A division by zero shows a real message, not `Infinity` or a crash
- [ ] `engine.ts` was not modified in this lesson
- [ ] You can explain why `handlePercent` and `handleSignChange` didn't need any new parsing logic

---

*Next: Lesson 15 — Conditional Rendering: Scientific Mode Toggle. A second
row of buttons appears and disappears — the first time this project
decides to render something, or not, based on state.*
