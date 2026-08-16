# Lesson 161: Parsing

**What you will build**: By the end of this lesson you'll extend Lesson 160's `valid-expr?` into a real parser — `parse-expr` — that doesn't just answer "valid or not," but returns a genuine nested structure recording every number found and how the expression was actually grouped: `1 + 2 + 3` becomes `[1 "plus" [2 "plus" [3]]]`, a real, inspectable value instead of a bare `true`.

**What you need to know first**: Lesson 160's grammar and `valid-expr?`; Lesson 150's sum types, revisited here as this lesson's own two-shape parse result.

**Terms introduced in this lesson**:

- **parse tree** — a structure recording exactly how a valid sequence matched a grammar's production rules, not merely that it did. *Why it matters*: `valid-expr?` (Lesson 160) discards this information the instant it confirms a match; a real interpreter needs it kept, since "what does this expression mean" depends entirely on which numbers were found and how they were grouped.

**Objects and methods used**: None new. This lesson reuses `get`/`count` (Lesson 84, Lesson 94) and `not=` (Lesson 136), each already covered.

---

## Concept Unit: A Token Carries a Real Value

### The Problem

Lesson 160's tokens were bare tags — `"num"`, `"plus"` — enough to check validity, but not enough to recover *which* numbers were actually written. Can a token carry its real value alongside its type, without changing how the grammar itself works?

### Introduce the concept in isolation

```
user=> (def tokens [["num" 1] ["plus"] ["num" 2]])
user=> (get (get tokens 0) 0)
"num"
user=> (get (get tokens 0) 1)
1
```

A token is now a small vector — `["num" 1]` carries both its type (`"num"`, still checked exactly the way Lesson 160 did) and its real value (`1`). A bare `["plus"]` has no second slot, since Lesson 160's grammar never needed a value for `plus` — it's the *same* terminal, just carrying more information than the recognizer alone required.

### Discard the throwaway example

Not applicable — real token values, checked directly with `get`.

### Project Change

- **Reference Source**: Lesson 160's own token shape, extended here to carry a real value alongside each type tag.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit extends Lesson 160's own token representation rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get (get tokens 0) 0)`, `(get (get tokens 0) 1)`** — reappearing nested `get` (used since Lesson 94): reads a token's type and its real value from the same two-slot vector, Lesson 85's own vector-as-pair convention, now carrying a real payload instead of a bare tag.

### CS Lens

This is exactly the difference between Lesson 160's recognizer and a real lexer's job: a recognizer only needs to know a token's *kind*; anything downstream that needs to actually *use* the token — a parser, an interpreter — needs its real value too.

### SE Lens

Keeping the type and value together in one small structure, rather than two separate parallel sequences, means a token is always handled as one coherent unit — there's no way to accidentally read one token's type alongside a different token's value.

---

## Concept Unit: `parse-expr` — Building a Real Structure

### The Problem

Can Lesson 160's own recursive logic be adapted to *build and return* a real structure — every number found, and how they were grouped — instead of only reporting `true`?

### Introduce the concept in isolation

```clojure
(declare parse-result parse-continue)

(defn parse-expr [tokens i]
  (parse-result (get (get tokens i) 1) tokens (+ i 1)))

(defn parse-result [value tokens i]
  (if (>= i (count tokens))
    [value]
    (parse-continue value tokens i)))

(defn parse-continue [value tokens i]
  (if (not= (get (get tokens i) 0) "plus")
    [value]
    [value "plus" (parse-expr tokens (+ i 1))]))
```

```
user=> (parse-expr [["num" 1]] 0)
[1]
user=> (parse-expr [["num" 1] ["plus"] ["num" 2]] 0)
[1 "plus" [2]]
user=> (parse-expr [["num" 1] ["plus"] ["num" 2] ["plus"] ["num" 3]] 0)
[1 "plus" [2 "plus" [3]]]
```

Every result is a real, inspectable structure, not a bare `true`. A single number parses to `[1]` — a one-slot vector, this grammar's "just a number" alternative, made concrete. `1 + 2` parses to `[1 "plus" [2]]` — the number `1`, the literal `"plus"`, and a *nested* parse of everything after it, `[2]`. `1 + 2 + 3` nests one level deeper still: `[1 "plus" [2 "plus" [3]]]`, directly mirroring the grammar's own right-recursive shape from Lesson 160 — each `+` wraps another parse result inside the previous one, rather than flattening everything into one list.

### Discard the throwaway example

Not applicable — `parse-expr` is real, reusable, and verified against three real token sequences of increasing length.

### Project Change

- **Reference Source**: Lesson 160's own `valid-expr?`, restructured here to return a real value at each step instead of only `true`/`false` — every `if` branch that returned `true` now returns a real structure instead.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn parse-expr [tokens i]
  (parse-result (get (get tokens i) 1) tokens (+ i 1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get (get tokens i) 1)`**, in `parse-expr` — reappearing nested `get` (this lesson's first unit): pulls the current token's real value, not just confirming it's a `"num"` the way Lesson 160's recognizer did.
- **`[value]`**, in `parse-result` — first appearance of this specific shape: a completed parse with nothing following — Lesson 150's own sum type made concrete, one of exactly two possible parse-result shapes.
- **`[value "plus" (parse-expr tokens (+ i 1))]`**, in `parse-continue` — the other shape: a value, the literal `"plus"` marker, and a *recursively parsed* remainder — the second alternative, built rather than merely confirmed.

### CS Lens

`[value]` versus `[value "plus" sub-result]` are exactly Lesson 150's sum type, two structurally different shapes for the identical `expr` non-terminal — a **parse tree**, one node per production-rule alternative actually taken, the real structure Lesson 160's recognizer computed and then silently discarded at every single step.

### SE Lens

Nothing about `parse-expr` changed *which* sequences are accepted — it accepts exactly what `valid-expr?` already accepted, since it's built from the identical grammar. The entire difference is what happens with a match once found: discarded, or kept and returned — the real reason a recognizer alone was never going to be enough for an interpreter (Lesson 163) to actually act on.

### Connection to the previous unit

The previous unit gave tokens real values; this unit shows why that mattered — a parser can only build a meaningful structure out of values the tokens actually carry.

---

## Connect the Pieces

A recognizer and a parser, run on the identical valid sequence, side by side:

```clojure
(println "Recognized as valid?" true)
(println "Parsed structure:" (parse-expr [["num" 1] ["plus"] ["num" 2] ["plus"] ["num" 3]] 0))
```

```
Recognized as valid? true
Parsed structure: [1 "plus" [2 "plus" [3]]]
```

Both agree the sequence is valid — the parser just kept what the recognizer threw away.

## What Breaks Without This

Suppose an interpreter tried to evaluate `1 + 2 + 3` using only Lesson 160's `valid-expr?` — it would have confirmed the sequence is syntactically valid, and then have nothing left to compute with: no numbers, no grouping, nothing but a bare `true`. Evaluating an expression requires knowing exactly what was written, not just that *something* valid was written — the precise gap `parse-expr`'s real, returned structure exists to close, and the reason a genuine interpreter is built on a parser, never on a recognizer alone.

## Exercises

1. **Trace.** By hand, trace `(parse-expr [["num" 5] ["plus"] ["num" 10]] 0)` through `parse-expr`/`parse-result`/`parse-continue`, confirming it reaches `[5 "plus" [10]]`.
2. **Predict.** Before checking, predict the parse structure of a single four-number sum, `1 + 2 + 3 + 4`. Then verify.
3. **Verify.** Confirm `(get (parse-expr [["num" 1] ["plus"] ["num" 2]] 0) 0)` — reading the first slot of a parse result — always recovers the *first* number in the original expression, for at least two different real inputs.
4. **Break it, on purpose.** Call `parse-expr` on a token sequence Lesson 160's own `valid-expr?` would reject (`[["num" 1] ["num" 2]]`), and describe exactly what real, incorrect structure it silently produces instead of an error.
5. **Generalize.** Describe, without coding it, what `parse-continue` would need to check differently if the grammar (Lesson 160's own Exercise 5) also allowed `minus` as a second valid operator alongside `plus`.
6. **Reconstruct.** Close this lesson. From memory, explain why `[1]` and `[1 "plus" [2]]` are two different *shapes*, not just different lengths of the same shape — connect this directly to Lesson 150's sum type.

## Definition of Done

- [ ] You can explain why a parse tree carries more information than a bare recognizer's `true`/`false`.
- [ ] You can trace `parse-expr` on a real token sequence and predict its exact nested output.
- [ ] You can explain why `[value]` and `[value "plus" sub-result]` are Lesson 150's sum type made concrete.
- [ ] You completed Exercise 3 and confirmed the first slot of a parse result always recovers the first number.
- [ ] You completed Exercise 4 and described the real, incorrect structure `parse-expr` silently builds on invalid input.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm first slot always recovers the leading number across two inputs; show parse-expr silently misparses [num num] as [1] instead of erroring"` — not just `"lesson 161 exercise"`.

---

**Next lesson:** Lesson 162, *Abstract Syntax Trees*, cleans up this lesson's own parse tree — dropping the literal `"plus"` marker's own structural noise, keeping only what an interpreter actually needs to evaluate the expression, the real distinction between a parse tree and an AST.
