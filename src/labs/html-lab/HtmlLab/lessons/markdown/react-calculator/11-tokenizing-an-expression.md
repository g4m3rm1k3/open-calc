# React Calculator — Lesson 11 — Tokenizing an Expression

## What You Will Build

A debug line under the calculator showing a raw string like `"2+3×4"`
broken into a real list of meaningful pieces: the number `2`, a `plus`
symbol, the number `3`, a `multiply` symbol, the number `4`. Nothing is
computed yet — this lesson is entirely about turning text into structure.

---

## What You Need to Know First

Lesson 10 — the precedence bug, diagnosed and understood, and the plan to
stop computing eagerly in favor of reading a whole expression at once.

---

## Step 1 — Define What a Token Is

In `engine.ts`, above the existing functions:

```typescript
type Token =
  | { kind: "number"; value: number }
  | { kind: "plus" }
  | { kind: "minus" }
  | { kind: "multiply" }
  | { kind: "divide" }
  | { kind: "leftParen" }
  | { kind: "rightParen" };
```

**Walkthrough — a discriminated union, the exact pattern behind this whole
project's `Cell` type in the TypeScript Spreadsheet series.** `Token` is
one of seven distinct shapes, distinguished by a shared field, `kind`,
where every variant uses a different literal string. `{ kind: "number";
value: number }` is the only variant carrying extra data — a token
representing `42` needs to remember *which* number it is; a token
representing `+` needs nothing beyond the fact that it *is* a plus sign.
TypeScript uses the `kind` field to **narrow** which shape you're looking
at: checking `token.kind === "number"` lets you safely access
`token.value` afterward, and TypeScript will flag it as an error if you
try to read `.value` on a token whose `kind` hasn't been checked yet.

**SE lens — a symbol and a value are different problems.** `"+"` as a
character in a string and `{ kind: "plus" }` as a token are not the same
thing. The character is just text — one of countless characters that
could appear anywhere. The token is a *classification*: "this specific
piece of the input is, unambiguously, an addition operator." Tokenizing is
the step where raw, undifferentiated text becomes a sequence of things the
rest of the program can reason about by *meaning* instead of by character.

---

## Step 2 — Write `tokenize`

Add to `engine.ts`:

```typescript
function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < source.length) {
    const character = source[position];

    if (character >= "0" && character <= "9") {
      let digits = "";
      while (position < source.length && source[position] >= "0" && source[position] <= "9") {
        digits += source[position];
        position += 1;
      }
      tokens.push({ kind: "number", value: Number(digits) });
      continue;
    }

    if (character === "+") { tokens.push({ kind: "plus" }); position += 1; continue; }
    if (character === "-") { tokens.push({ kind: "minus" }); position += 1; continue; }
    if (character === "×") { tokens.push({ kind: "multiply" }); position += 1; continue; }
    if (character === "÷") { tokens.push({ kind: "divide" }); position += 1; continue; }
    if (character === "(") { tokens.push({ kind: "leftParen" }); position += 1; continue; }
    if (character === ")") { tokens.push({ kind: "rightParen" }); position += 1; continue; }

    throw new Error(`Unrecognized character "${character}" at position ${position}`);
  }

  return tokens;
}
```

**Walkthrough — the main loop, and what "algorithm" means, precisely.**
`position` tracks which character of `source` is being examined right
now, starting at `0` and advancing until every character has been
consumed. This whole function is an **algorithm** — a finite, precise,
step-by-step procedure for solving one specific problem, guaranteed to
finish — and it's worth being able to name its shape: `tokenize` looks at
`source` exactly once, left to right, never revisiting a character once
`position` has moved past it. An algorithm that examines each of `n` input
items a constant number of times is said to run in **O(n) time** ("order
n," or "linear time") — its cost grows directly in proportion to the
input's length, not faster. This won't matter for a calculator expression
a person can type (a handful of characters), but naming it now means
lesson 25's discussion of a genuinely *slow* algorithm has real vocabulary
to contrast against. This scanning technique itself is called **lexing**
— scanning input one piece at a time, left to right — exactly the same
technique the TypeScript Spreadsheet project's own `Token` scanner used
for spreadsheet formulas.

**CS lens — how `character >= "0" && character <= "9"` actually works.**
JavaScript compares strings character by character using each character's
underlying numeric **code point** — every character a computer can
display is really stored as a number (`"0"` is code point 48, `"9"` is
57, following the ASCII standard almost every text encoding still
preserves for these characters). `">="` and `"<="` on single-character
strings compare those numbers directly, which is exactly why this range
check correctly matches every digit character and nothing else — it isn't
comparing digits mathematically, it's comparing them as the specific,
consecutive block of code points ASCII happens to assign the ten digit
characters.

**CS lens — "maximal munch," the formal name for what the digit-scanning
loop does.** Consuming the *longest possible* match at each position
before producing a single token — reading all of `"42"` as one number
instead of stopping after `"4"` — is a real, named strategy in compiler
theory called **maximal munch** (or "longest match"). It's the standard
rule real-world lexers follow specifically to avoid the exact ambiguity
named in "What Breaks Without This" below: without it, there would be no
principled way to know whether to stop consuming digits after one
character or several. Naming the strategy is what turns "obviously you
keep reading digits" into a rule that generalizes — the identical
principle is what lets a real language's lexer correctly read `variable1`
as one identifier token instead of `variable` followed by `1`.

**Walkthrough — the digit-scanning inner loop.** A single digit character
isn't a complete number by itself — `"42"` needs both `"4"` and `"2"`
consumed together to produce the number `42`, not two separate one-digit
tokens. The inner `while` keeps appending characters to `digits` for as
long as the current character is still a digit, then converts the
accumulated string with `Number(digits)` exactly once. `continue` skips
straight back to the top of the outer loop — `position` has already been
advanced past every digit that was just consumed, so there's nothing left
to do this iteration.

**Walkthrough — the operator and parenthesis checks.** Each is a single
character, consumed and turned into its token in one step: `position += 1`
moves past it, `continue` returns to the top of the loop. These are
listed as separate `if` statements rather than a lookup table on purpose —
there are only six of them, each producing a token with no extra data, and
a table would add a layer of indirection for no real benefit here (contrast
with `OPERATORS` in `engine.ts`, which genuinely earns a lookup table
because it maps to different *functions*, not just different token shapes).

**Walkthrough — the final `throw`.** If a character matches none of the
above, it's something this calculator's grammar has no meaning for.
**Honest note about this specific project:** every character that can ever
reach `tokenize` comes from a button click — a digit, an operator symbol,
or a parenthesis — so this exact line can never actually run in this
calculator as built. It's written anyway, the way a tokenizer *should*
always be written: assuming nothing about how it might be called, rather
than trusting its only current caller to always behave. A future version
of this project that accepted typed keyboard input, not just clicks, would
need exactly this safeguard, and it would already be here.

---

## Step 3 — A Debug Line to See It Work

Update `Calculator.tsx`'s debug panel:

```tsx
<div className="debug-panel">
  <p>previousValue: {previousValue === null ? "null" : previousValue}</p>
  <p>pendingOperator: {pendingOperator === null ? "null" : pendingOperator}</p>
  <p>tokens: {JSON.stringify(tokenize(display))}</p>
</div>
```

Click **▶ Preview**. Type `2`, `+`, `3`, `×`, `4` (don't press `=` yet —
`display` still only holds whatever the eager model last computed, so for
now, just watch `tokenize` run against whatever single number is currently
showing). Try typing a lone multi-digit number, like `42`, and confirm the
debug line shows one single `{"kind":"number","value":42}` token, not two
one-digit ones.

**Walkthrough — `JSON.stringify`.** A built-in JavaScript function that
converts a value — here, an array of token objects — into a JSON-formatted
string, suitable for displaying as plain text. `tokenize` returns real
JavaScript objects, not strings; without `JSON.stringify`, React would
show `[object Object]` for each token instead of its actual contents.

**Honest limitation, temporary.** This debug line calls `tokenize(display)`
directly, but `display` right now only ever holds whatever the *eager*
model last showed — never the full raw expression `"2+3×4"` as one string.
That's exactly what lesson 14 changes. This step exists to prove
`tokenize` itself is correct, in isolation, before it's asked to do real
work.

---

## Connect the Pieces

```
engine.ts        Token — a discriminated union classifying each piece of
                 an expression; tokenize() — turns a raw string into an
                 array of Tokens, left to right
Calculator.tsx   a debug line calling tokenize() directly, proving it
                 works before lesson 14 wires it into real input
```

---

## What Breaks Without This

**Trying to read a number as a single character instead of scanning
forward for every consecutive digit:** `"42"` would tokenize as two
separate number tokens, `4` and `2`, rather than one `42` — a parser built
on top of that would have no way to tell the difference between the
expression `4+2` (typed with an operator) and the number `42` (typed as
two digits in a row).

---

## Definition of Done

- [ ] `Token` is defined as a discriminated union with a `kind` field
- [ ] `tokenize` correctly turns `"2+3×4"` into five tokens: number, plus, number, multiply, number
- [ ] Multi-digit numbers produce one token, not one per digit
- [ ] You can explain what lexing is and why it's a separate step from parsing
- [ ] You can explain why `"0" <= character <= "9"` works, in terms of character code points
- [ ] You can explain what "maximal munch" means and why the digit loop needs it

---

*Next: Lesson 12 — Parsing With Precedence. A list of tokens becomes a
tree — the structure that finally lets multiplication bind tighter than
addition.*
