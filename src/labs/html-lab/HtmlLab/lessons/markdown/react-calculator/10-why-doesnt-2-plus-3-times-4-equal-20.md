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

**SE lens — is this actually a bug? A precise answer, not a reflexive
one.** A **bug** is a program's behavior disagreeing with its
*specification* — and "20" is only wrong relative to a specific
specification: the ordinary rules of arithmetic, the ones this project's
own README committed to when it called itself a "Student Scientific
Calculator." Against a *different*, entirely legitimate specification —
"evaluate operators strictly in the order they were pressed" — `20` is
exactly correct, not a bug at all. This distinction is not pedantic:
knowing which specification a piece of software is actually supposed to
meet is the very first step of any real debugging process, before
touching a single line of code, and skipping it is how engineers sometimes
"fix" software into behaving differently from what it was actually meant
to do.

**Connect to the real world — this isn't hypothetical, and it isn't even
rare.** Cheap, simple four-function calculators — the kind built from
inexpensive chips for decades, still sold today — genuinely do implement
strict left-to-right evaluation, by design, not by accident or bug. Typing
`2 + 3 × 4 =` into one of those *correctly*, by its own specification,
shows `20`. Scientific and graphing calculators, by contrast, implement
full operator precedence, matching the mathematical convention taught in
school — because their specification is different: they're built to
evaluate a written mathematical *expression* the way a textbook would, not
to replay a sequence of button presses literally. This project chose, back
in its own README, to be the second kind — which is precisely why `20` is
a real bug *here*, for *this* project, even though the identical behavior
ships correctly, on purpose, in millions of real, working calculators.

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

**SE lens — naming the general technique this step just used: print
debugging, and where it fits next to other real debugging tools.** Adding
a temporary, visible readout of a program's internal state, specifically
to watch it change over time, is called **print debugging** — named for
`print`/`console.log` statements, the original and still most common form
of it, even though this project's version prints to the actual page
instead of the console. It is a real, legitimate, professional technique,
not a beginner's crutch — used constantly by engineers at every experience
level, specifically because it requires no extra tooling and shows exactly
what actually happened, rather than what the code was *supposed* to do.
The browser's own DevTools offer a more powerful alternative for harder
cases: a real **debugger**, with **breakpoints** — a line of code marked
to pause execution entirely the instant it runs, letting you inspect every
variable in scope at that exact moment, then step forward one line at a
time. This project's bug was simple enough that a temporary debug panel
was the faster, more direct tool; a breakpoint would have shown the same
truth, just through a different lens. Knowing both exist, and choosing
whichever fits the specific bug in front of you, is itself part of the
skill — this lesson deliberately reaches for the lighter one first.

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

**A second, related property, worth naming even though this specific bug
isn't about it: associativity.** Precedence answers "which operator binds
tighter, `+` or `×`." **Associativity** answers a different question:
when two operators of the *same* precedence appear in a row, which one
happens first? `10-3-2` could mean `(10-3)-2 = 5` or `10-(3-2) = 9` —
subtraction is **left-associative**, meaning the left one happens first,
which is why the correct answer is `5`. Every operator in this project
(`+`, `-`, `×`, `÷`) is left-associative, matching ordinary arithmetic, and
lesson 12's parser builds this in structurally (its `while` loops naturally
group left-to-right) rather than needing a separate rule for it.

**Why this half-works for expressions with only one precedence level, and
why that's a trap.** Typing `2+3+4` with the current eager model
correctly gives `9`, purely by accident: with only one operator appearing
repeatedly, "apply immediately, left to right" and "respect precedence and
associativity" happen to produce the same answer, since there's no higher-
precedence operator around to be skipped over incorrectly. This is exactly
what makes the bug easy to miss during lessons 08 and 09 — every example
tested there used a single operator, or one where left-to-right happened
to already be correct. The bug was always present; `2+3×4` is simply the
first input that exposes it. A **state machine** — a system defined by a
fixed set of states (here: "no pending operator," "one pending operator")
and rules for moving between them — is what `handleOperator` actually is;
the two-state version this project built happens to be too simple a
machine to represent "an operator waiting behind a higher-precedence one
that hasn't happened yet," which is the real information `2+3×4` needs
remembered and this design has nowhere to put.

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

**Connect to the real world — order of operations is a real, contested
notation problem, not just a grade-school mnemonic.** PEMDAS (Parentheses,
Exponents, Multiplication/Division, Addition/Subtraction) or BODMAS
(Brackets, Orders, Division/Multiplication, Addition/Subtraction) — the
same rule under two different regional names — is genuinely ambiguous at
its edges even among professional mathematicians: expressions like
`8÷2(2+2)`, which depend on whether implicit multiplication (`2(2+2)`,
with no visible `×`) binds tighter than ordinary division, have produced
real, ongoing public disagreement, precisely because different textbooks
and calculators apply slightly different conventions. This project sidesteps
the ambiguity entirely by requiring an explicit operator between every pair
of values — there is no implicit multiplication anywhere in this
calculator's grammar — a real, deliberate scope decision that removes an
entire category of disputed cases before they can ever come up.

**CS lens — a preview of the tool that actually solves this: a formal
grammar.** The fix this bug needs isn't a cleverer `if` statement — it's a
precise, written-down set of rules describing exactly what a valid
expression looks like and how its pieces relate, called a **grammar**.
Lesson 12 will write this project's grammar explicitly, as a small set of
rules with names like `Expression`, `Addition`, `Multiplication`, each
one defined in terms of the ones below it in precedence — the exact
mechanism that finally gives "multiplication binds tighter than addition"
a real, structural home in the code, instead of being an ad hoc rule
`handleOperator` was never actually taught.

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
