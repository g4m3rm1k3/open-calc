# React Calculator — Lesson 10 — Why Doesn't 2+3×4 Equal 20?

## What You Will Build

A small, real debug panel underneath the calculator, showing exactly what
`previousValue` and `pendingOperator` hold at every moment — and, watching
it live, an explanation for a wrong answer the calculator has been quietly
capable of producing since lesson 08.

---

## What You Need to Know First

Lesson 09 — all four operators working correctly for expressions with a
single operator in them.

---

## Step 1 — See the Bug

Click **▶ Preview**. Type `2`, `+`, `3`, `×`, `4`, `=`.

The display shows `20`.

The correct answer — the one a real expression `2+3×4` evaluates to, by
the ordinary rules of arithmetic every calculator claims to follow — is
`14`: multiplication happens before addition, so `3×4` is computed first
(`12`), then `2+12` (`14`). `20` comes from doing the operations in the
order they were *typed*, left to right, with no regard for which operator
binds tighter: `2+3` first (`5`), then `5×4` (`20`).

---

## Step 2 — Add a Debug Panel to Watch It Happen

**The problem:** the bug is real, but invisible — nothing on screen
currently shows *why* `20` comes out, only that it does. Seeing the
internal state change, live, makes the cause undeniable instead of
theoretical.

Update `Calculator.tsx`'s `return` statement to add a debug panel:

```tsx
return (
  <div className="calculator">
    <Display value={display} />
    <Keypad
      onDigit={handleDigit}
      onOperator={handleOperator}
      onEquals={handleEquals}
      onClear={handleClear}
    />
    <div className="debug-panel">
      <p>previousValue: {previousValue === null ? "null" : previousValue}</p>
      <p>pendingOperator: {pendingOperator === null ? "null" : pendingOperator}</p>
    </div>
  </div>
);
```

Click **▶ Preview** again. Type `2`. Press `+`. The panel shows
`previousValue: 2`, `pendingOperator: +`. Press `3`. Press `×`. **Watch the
panel the instant you press `×`** — `previousValue` jumps straight to `5`,
before `4` has even been typed. The addition already happened, the moment
the second operator was pressed, exactly as `handleOperator`'s chaining
branch was written to do in lesson 08. By the time `×` and `4` are ready
to combine, `2+3` is no longer visible anywhere in the calculator's state
— only its result, `5`, is left.

**Walkthrough — `previousValue === null ? "null" : previousValue`.** JSX
can render a string or a number directly, but rendering `null` itself
produces nothing at all on screen — a blank debug panel would be more
confusing than helpful. This ternary explicitly turns the *absence* of a
value into the visible text `"null"`, so the panel always shows something
meaningful, matching the same instinct that made the TypeScript Spreadsheet
project's own debug panel echo raw tokens before its parser could do
anything useful with them yet.

---

## Step 3 — Name the Real Problem

**CS lens — this is an operator precedence problem.** Every arithmetic
operator has a **precedence** — a ranking of which operations bind more
tightly than others. Multiplication and division outrank addition and
subtraction; `3×4` is a single "unit" that addition has to treat as one
number, not two separate operations to perform in typing order.
`handleOperator`'s chaining logic has no concept of precedence at all — it
treats every operator identically, applying whichever one is pending the
instant the *next* operator arrives, regardless of which one "should" bind
tighter mathematically.

**SE lens — the current design cannot be patched with a small fix.**
`handleOperator` only ever sees one pending operator and one previous
value at a time — by the time `×` arrives, `2+3` has already been
collapsed into `5`, and that information is genuinely gone, not just
hidden. There is no `if` statement that could be added to the current
design to recover it. What's needed is a fundamentally different
approach: read the *entire* expression as a whole, understand its full
structure — including which parts are "inside" others — and only then
compute a single, correct answer. That is exactly what a **parser** does,
and it's exactly what the TypeScript Spreadsheet project's own formula
engine already builds, for the same underlying reason: `=A1+B1×2` has the
identical precedence problem `2+3×4` does, solved the identical way.

**The plan for lessons 11 through 14:** stop computing eagerly, operator by
operator, entirely. Instead, let the display accumulate the full raw
expression as typed — `"2+3×4"`, as one string — and only when `=` is
pressed, hand that whole string to a real tokenizer, then a real parser,
then a real evaluator, each built from scratch, each with no idea a
calculator button exists.

---

## Connect the Pieces

```
Calculator.tsx   a debug panel, temporary — its entire purpose is proving
                 this lesson's point; it stays until the eager model it's
                 exposing is replaced in lesson 14
```

---

## What Breaks Without This

Already demonstrated, live: any expression mixing addition or subtraction
with multiplication or division in the same input — `2+3×4`, `10-2÷2`, any
of them — computes a wrong, left-to-right answer instead of the
mathematically correct one.

---

## Definition of Done

- [ ] The debug panel is visible and updates live as operators are pressed
- [ ] You've watched, personally, `previousValue` collapse `2+3` into `5` before `×4` is ever considered
- [ ] You can explain operator precedence in your own words
- [ ] You can explain why no small patch to `handleOperator` could fix this

---

*Next: Lesson 11 — Tokenizing an Expression. The first real step of the
fix: turning a raw string like "2+3×4" into a list of meaningful pieces.*
