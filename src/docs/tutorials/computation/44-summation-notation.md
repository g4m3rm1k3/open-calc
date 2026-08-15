# Lesson 44: Summation Notation

**What you will build**: By the end of this lesson you'll be able to read and write sigma notation (`Σ`) fluently, translate any of this series' summing loops into it directly, and translate it back — turning a compact mathematical formula into runnable Clojure and a piece of running code into the formula it actually computes.

**What you need to know first**: `list-sum` and `sum-to` (Lessons 20, 27) and Lesson 15's proven sum formula — this lesson gives the notation those functions have been silently standing in for.

**Terms introduced in this lesson**:

- **summation notation** (**sigma notation**, `Σ`) — a compact way of writing "add up this expression for every value of a variable across some range." *Why it matters*: every summing function this series has written — `sum-to`, `list-sum`, `eval-poly-naive`'s term-by-term total — has been computing exactly what this notation describes; this lesson gives the description its own precise, standard symbol.
- **index variable** — the variable inside a summation that takes on each value in the range being summed over, one at a time. *Why it matters*: distinguishes the variable being stepped through (this lesson's `i`) from any other variable that might appear in the summed expression, like a polynomial's `x`.

**Objects and methods used**: None new. This lesson gives already-written code (`sum-to`, `list-sum`, `eval-poly-naive`) a formal mathematical notation, rather than introducing new Clojure constructs.

---

## Concept Unit: What Sigma Notation Actually Says

### The Problem

`sum-to`'s recursive definition (Lesson 20) — `0` if `n = 0`, otherwise `n` plus the sum of the first `n - 1` — precisely describes "the sum of every integer from `1` to `n`." Mathematics has a standard, compact way to write exactly that description, without needing to restate a whole recursive definition every time.

### Introduce the concept in isolation

> **Σ (i = 1 to n) i** means: add up the expression `i`, once for each value of `i` starting at `1` and ending at `n`.

For `n = 4`: `Σ (i=1 to 4) i = 1 + 2 + 3 + 4 = 10`, matching `sum-to 4`'s own result exactly (Lesson 20 computed the identical `10`). The notation has three parts: what's being summed (`i`, here — but it could be any expression involving `i`), the **index variable**'s starting value (`i = 1`), and its ending value (`n`). Reading it as an instruction: set `i` to `1`, add the expression's value; set `i` to `2`, add its value; continue through `i = n`; stop.

### Discard the throwaway example

Not applicable — this notation is what the rest of this lesson translates to and from real code.

### Generalizing

The summed expression doesn't have to be the index variable alone — `Σ (i=1 to n) i²` means "add up `i²` for every `i` from `1` to `n`" (`1 + 4 + 9 + ... + n²`), and `Σ (i=0 to 2) (coefficient_i × x^i)` is precisely Lesson 42's `eval-poly-naive`, written in one line instead of a recursive function definition.

### CS Lens

Sigma notation and `sum-to`'s recursive definition describe the *identical* computation, in two different notations — the same "same underlying thing, different representation" relationship Lesson 20 already established between a recursive definition and its recursive function, and Lesson 42 established between a polynomial's algebraic form and its coefficient list.

### SE Lens

A closed-form or notational description like `Σ (i=1 to n) i` is often what a specification (Lesson 1) states directly — "the total is the sum of every item's price" — while a recursive function or a loop is the *implementation* choice for actually computing it. Recognizing when code is computing something with a standard mathematical name is what makes Lesson 15's proven formula (`n(n+1)/2`) discoverable as a faster alternative in the first place, rather than something to reinvent from scratch.

---

## Concept Unit: Translating Code Into Sigma Notation

### The Problem

`list-sum` (Lesson 27) sums an arbitrary list, not a range of integers. Does sigma notation still apply, and how would it be written for a list instead of a numeric range?

### Introduce the concept in isolation

For a list `L` with elements `L₁, L₂, ..., Lₙ` (using subscripts for "the first element," "the second element," and so on):

> **Σ (i=1 to n) Lᵢ** means: add up `Lᵢ` — the `i`-th element of `L` — for every `i` from `1` to `n`.

For `L = (10, 20, 30)`: `Σ (i=1 to 3) Lᵢ = L₁ + L₂ + L₃ = 10 + 20 + 30 = 60`, matching `(list-sum (list 10 20 30))`'s own result.

Lesson 42's `eval-poly-naive` translates the same way, with the index variable playing the role of the exponent instead of a position: given coefficients `c₀, c₁, ..., cₙ`,

> **Σ (i=0 to n) cᵢxⁱ** means: add up `cᵢ × x^i` for every `i` from `0` to `n`.

This is `5 + 2x + 3x²`'s sigma-notation form exactly — three terms, `i = 0`, `1`, `2`, each contributing `cᵢ × x^i`, summed — precisely what `eval-poly-naive`'s recursive code computes, one term per recursive call.

### Discard the throwaway example

Not applicable — this translation applies directly to functions already written and trusted.

### CS Lens

Every summing loop or recursive accumulation this series has written translates to sigma notation the same way: identify the index variable, its range, and the expression being summed at each step — exactly the three pieces of information `reduce` (Lesson 27) needs too (a starting value, an operation, and a sequence to walk), the same underlying shape recognized from a third angle.

### SE Lens

Being able to state a piece of code's purpose in sigma notation is a genuine communication tool — "this computes `Σ (i=1 to n) priceᵢ × quantityᵢ`" says, in one line, exactly what a longer loop's cumulative effect is, in a form a reader can verify against a specification without tracing every iteration by hand.

### Connection to the previous unit

The previous unit introduced sigma notation's three parts abstractly; this unit translates two already-trusted functions (`list-sum`, `eval-poly-naive`) into it directly, confirming the translation is exact, not approximate.

---

## Concept Unit: Translating Sigma Notation Into Code

### The Problem

Given a sigma-notation formula that hasn't been implemented yet — say, `Σ (i=1 to n) i³` (the sum of cubes) — derive the Clojure function it describes.

### Introduce the concept in isolation

Read the notation's three parts directly as a recursive function's own three parts, the same translation Lesson 20 already performed for `sum-to`:

- The index variable's starting value (`i = 1`) and ending value (`n`) become the function's base case boundary.
- The summed expression (`i³`) becomes what gets added at each step.

```clojure
(defn sum-of-cubes [n]
  (if (= n 0)
    0
    (+ (power n 3) (sum-of-cubes (- n 1)))))
```

```
user=> (sum-of-cubes 3)
36
```

Check: `Σ (i=1 to 3) i³ = 1³ + 2³ + 3³ = 1 + 8 + 27 = 36`, matching exactly.

### Discard the throwaway example

Not applicable — `sum-of-cubes` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of `Σ (i=1 to n) i³` into `sum-to`'s own established shape.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `power`, from Lesson 42.

### The New Code — type it yourself

```clojure
(defn sum-of-cubes [n]
  (if (= n 0)
    0
    (+ (power n 3) (sum-of-cubes (- n 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(power n 3)`** — reappearing `power` (Lesson 42), computing the summed expression, `i³`, for the current value of the index variable (here, `n`, counting down — the same "index variable direction doesn't have to match the notation's own left-to-right reading" flexibility `sum-to` already used, counting down from `n` to `0` rather than up from `1`).
- **`(+ (power n 3) (sum-of-cubes (- n 1)))`** — reappearing `sum-to`-shaped recursion (Lesson 20), with `(power n 3)` in place of the bare `n` — the exact same translation process, applied to a different summed expression.

### CS Lens

This translation process — read off the index range as the base case boundary, read off the summed expression as what's added at each step — works identically for *any* sigma-notation formula, which is exactly why sigma notation and this series' recursive summing functions are two notations for the same underlying idea, not two different techniques.

### SE Lens

Given a formula in a specification stated with sigma notation, this translation is close to mechanical, the same "derive the function from the definition" confidence Lesson 20 established for recursive data — a real, practical skill for turning a mathematical requirement directly into a first, trustworthy implementation, before any optimization (a closed-form formula, if one exists and is provable, per Lesson 15) is even considered.

### Connection to the previous unit

The previous unit translated existing code *into* notation; this unit reverses the direction, translating notation *into* new code — confirming the relationship works both ways, not just as a retrospective description.

---

## Connect the Pieces

Both directions, checked against each other, using this lesson's new function:

```clojure
(println "sum-of-cubes 4:" (sum-of-cubes 4))
(println "Sigma (i=1 to 4) i^3, by hand: 1+8+27+64 =" (+ 1 8 27 64))
(println "They agree:" (= (sum-of-cubes 4) (+ 1 8 27 64)))
```

```
sum-of-cubes 4: 100
Sigma (i=1 to 4) i^3, by hand: 1+8+27+64 = 100
They agree: true
```

`sum-of-cubes`, derived directly from `Σ (i=1 to n) i³`'s notation, matches a hand-computed sum of the same four cubes exactly — confirming the translation from notation to code (Concept Unit 3) produced a function that genuinely computes what the notation describes, not merely something that resembles it.

## What Breaks Without This

Suppose `Σ (i=1 to n) i³` were mistranslated with the index range off by one — starting the recursion at `n` but stopping at `1` instead of `0` (a boundary mistake, the exact category Lesson 22 named directly):

```clojure
(defn broken-sum-of-cubes [n]
  (if (= n 1)
    (power n 3)
    (+ (power n 3) (broken-sum-of-cubes (- n 1)))))
```

```
user=> (broken-sum-of-cubes 4)
```

This actually produces the correct `100` for `n = 4` — the boundary mistake is subtler than it looks: the base case fires at `n = 1`, correctly including the `i = 1` term, so this particular version happens to work. The real risk surfaces on `n = 0`: `Σ (i=1 to 0) i³` should be an **empty sum** — zero terms, totaling `0`, the same "nothing to add" base case every summing function in this series has used — but `broken-sum-of-cubes 0` never reaches its `(= n 1)` base case at all (it decrements past it, toward `-1`, `-2`, ...), failing to terminate correctly, exactly Lesson 21's `sum-by-twos` mistake reappearing in a new translation. Getting sigma notation's boundary exactly right — including the edge case of an empty range — matters precisely because it's invisible until an edge case like `n = 0` actually occurs.

## Exercises

1. **Trace.** Write out `Σ (i=1 to 5) (2i)` term by term (`2×1, 2×2, ..., 2×5`), sum them by hand, and confirm your total.
2. **Predict.** Before deriving it, predict whether `Σ (i=1 to n) 2i` equals `2 × Σ (i=1 to n) i` in general. Verify using Lesson 15's proven formula for `Σ (i=1 to n) i`.
3. **Translate.** Derive a Clojure function for `Σ (i=1 to n) (2i - 1)` (the sum of the first `n` odd numbers), and verify it against a hand-computed case.
4. **Break it, on purpose.** Confirm, by running it yourself, that `broken-sum-of-cubes` from "What Breaks Without This" fails to terminate correctly on `n = 0` (or produces a clearly wrong/never-ending computation) — you may need to interrupt it if it doesn't error on its own.
5. **Generalize.** Translate `list-sum` applied to a list of *squares* — `Σ (i=1 to n) Lᵢ²`, given a list `L` — into a single Clojure function, without first computing a separate list of squares.
6. **Reconstruct.** Close this lesson. From memory, state sigma notation's three parts, and explain why `broken-sum-of-cubes`'s mistranslation was invisible for `n = 4` but not for `n = 0`.

## Definition of Done

- [ ] You can read a sigma-notation formula aloud, correctly identifying the index variable, its range, and the summed expression.
- [ ] You can translate a sigma-notation formula into a working recursive function, and a recursive function's total into sigma notation.
- [ ] You completed Exercise 3 (sum of odd numbers) and verified it against a hand-computed case.
- [ ] You can explain why an empty range (`n = 0`) is the specific case that exposed "What Breaks Without This"'s mistranslation.
- [ ] Commit your Exercise 3 and Exercise 5 functions to your notes repository, with a commit message stating the sigma-notation formula each one implements — for example, `"Add sum-of-odds (sigma i=1 to n of 2i-1) and sum-of-squares-in-list (sigma i=1 to n of L_i^2)"` — not just `"lesson 44 exercise"`.

---

**Next lesson:** Lesson 45, *Product Notation*, gives multiplication the identical treatment sigma notation just gave addition — connecting directly to `factorial` and to the counting principles Section IV builds on next.
