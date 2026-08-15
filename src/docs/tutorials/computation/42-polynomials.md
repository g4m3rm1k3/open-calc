# Lesson 42: Polynomials

**What you will build**: By the end of this lesson you'll be able to represent a polynomial as a plain list of coefficients — simpler than Lesson 41's general expression tree — and evaluate it two different ways: naively, and using Horner's method, a genuinely famous technique derived directly from Lesson 13's factoring, that provably needs far fewer multiplications for the identical answer.

**What you need to know first**: Lesson 41's symbolic expressions, Lesson 13's factoring, and Lesson 15's proven sum formula — this lesson's efficiency count uses it directly.

**Terms introduced in this lesson**:

- **polynomial** — an expression of the form `c0 + c1x + c2x² + ... + cnxⁿ`, fully described by its list of coefficients. *Why it matters*: a specific, more restricted kind of symbolic expression than Lesson 41's general operator trees — restricted enough that a plain list of numbers, without any operator symbols at all, is enough to represent one completely.
- **Horner's method** — evaluating a polynomial by repeatedly factoring out `x`, transforming `c0 + c1x + c2x² + ...` into `c0 + x(c1 + x(c2 + ...))`, reducing the number of multiplications needed. *Why it matters*: a real, famous, provably more efficient way to compute the identical value — derived here directly from Lesson 13's factoring technique, not introduced as a memorized trick.

**Objects and methods used**: None new. This lesson combines `if`, `empty?`, `first`, `rest`, `+`, and `*`, each already fully covered.

---

## Concept Unit: Representing a Polynomial as a List of Coefficients

### The Problem

Lesson 41's expression trees can represent *any* combination of operators and operands — genuinely general, at the cost of needing operator symbols (`+`, `*`) explicitly written into the structure at every level. A polynomial like `5 + 2x + 3x²` has a much more restricted shape: always addition at the top level, always `x` raised to a specific power in each term. Does representing one really need Lesson 41's full generality?

### Introduce the concept in isolation

```clojure
(def poly (list 5 2 3))
```

This single, plain list — no operator symbols, no nesting — represents `5 + 2x + 3x²` completely: position `0` (`5`) is the coefficient of `x⁰`, position `1` (`2`) is the coefficient of `x¹`, position `2` (`3`) is the coefficient of `x²`. Nothing about a polynomial's *shape* varies from one to the next — only its coefficients do — so a list of coefficients, in a fixed, agreed-upon order (lowest power first), captures everything needed.

### Discard the throwaway example

Not applicable — `poly` is a real example this lesson's remaining units evaluate directly.

### Generalizing

This is a direct instance of Lesson 1's own lesson about representation: choosing exactly the information a problem's operations actually need, no more. A general expression tree could represent `5 + 2x + 3x²` too — but every one of its internal `+` and `*` symbols would be entirely predictable from the polynomial's own regular shape, carried along for no benefit.

### CS Lens

Also recognized in: a spreadsheet's column of numbers standing in for a formula that's the same shape in every row, and a piano roll (in music software) recording only *which notes, when* — the shared musical structure (rhythm grid, instrument) is fixed, and only the varying content needs to be stored.

### SE Lens

A representation with less structure to carry is both simpler to build correctly and cheaper to process — this lesson's next two units both benefit directly from the coefficient list's regularity, in ways Lesson 41's general tree representation couldn't offer for a polynomial specifically.

---

## Concept Unit: Evaluating Naively — Counting the Multiplications

### The Problem

Given `poly`'s coefficient list, compute its value at a specific `x` the direct way: multiply each coefficient by the correct power of `x`, and sum the results.

### Introduce the concept in isolation

```clojure
(defn power [base exponent]
  (if (= exponent 0)
    1
    (* base (power base (- exponent 1)))))

(defn eval-poly-naive [coeffs x power-index]
  (if (empty? coeffs)
    0
    (+ (* (first coeffs) (power x power-index)) (eval-poly-naive (rest coeffs) x (+ power-index 1)))))
```

```
user=> (eval-poly-naive (list 5 2 3) 4 0)
61
```

Trace it: `5 × 4⁰ = 5 × 1 = 5`, `2 × 4¹ = 2 × 4 = 8`, `3 × 4² = 3 × 16 = 48` — summing to `61`, matching `5 + 2(4) + 3(4²) = 5 + 8 + 48 = 61` computed by hand.

Now count the actual multiplications this required. `power`'s own recursive definition does exactly `exponent` multiplications: `power(x, 0)` does `0`; `power(x, 1)` does `1`; `power(x, 2)` does `2`. Computing all three powers independently — the way `eval-poly-naive` does, once per coefficient — costs `0 + 1 + 2 = 3` multiplications just for the powers, matching Lesson 15's own proven sum formula shape exactly. Add one more multiplication per coefficient (`coefficient × power`) — `3` more — for a total of `6` multiplications to evaluate this three-coefficient (degree-2) polynomial.

### Discard the throwaway example

Not applicable — `eval-poly-naive` is a real function, and its exact cost is the direct motivation for the next unit.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn eval-poly-naive [coeffs x power-index]
  (if (empty? coeffs)
    0
    (+ (* (first coeffs) (power x power-index)) (eval-poly-naive (rest coeffs) x (+ power-index 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`power-index`** — reappearing accumulator-style parameter (Lesson 34's shape), tracking which power of `x` the current coefficient corresponds to, incremented by exactly `1` with every recursive call.
- **`(* (first coeffs) (power x power-index))`** — reappearing arithmetic (Lessons 2, 20's `power`-style recursion), computing one term of the polynomial directly from its definition.

### CS Lens

For a polynomial with `n + 1` coefficients (degree `n`), this naive approach costs `0 + 1 + 2 + ... + n` multiplications for the powers alone — exactly Lesson 15's proven `n(n+1)/2` — plus `n + 1` more for the coefficient multiplications. The power computation alone already grows **quadratically** with the polynomial's degree, the identical growth shape Lesson 28 found for `reverse-naive`.

### SE Lens

Every one of those power computations is, in a real sense, wasted: `power(x, 2)` recomputes `power(x, 1)` from scratch internally, which recomputes `power(x, 0)` — overlapping subproblems, in exactly Lesson 23's and Lesson 38's sense, hiding inside what looks like ordinary arithmetic rather than an obviously recursive function.

### Connection to the previous unit

The previous unit chose a compact representation; this unit evaluates it the direct way and, by actually counting the cost, uncovers real, quantifiable waste — the same discipline Lesson 28 applied to `reverse-naive`, now applied to polynomial evaluation.

---

## Concept Unit: Horner's Method — Refactoring via Repeated Factoring

### The Problem

`eval-poly-naive`'s waste comes from recomputing powers of `x` independently, term by term. Lesson 13 already derived a general technique for restructuring an expression to reduce repeated work — factoring. Does it apply here?

### Introduce the concept in isolation

Apply Lesson 13's factoring directly to the polynomial itself, not to code:

```
5 + 2x + 3x²
= 5 + x(2 + 3x)              (factor x out of the second and third terms)
= 5 + x(2 + x(3))            (factor x out of the remaining "3x" term inside)
```

Every multiplication by a *power* of `x` has been replaced by nested multiplications by `x` itself, one at a time — no term needs its own independently-computed `x²`, `x³`, and so on; each one is built by multiplying the *previous* result by `x` exactly once. This is **Horner's method**. Translate it directly into code:

```clojure
(defn eval-poly-horner [coeffs x]
  (if (empty? coeffs)
    0
    (+ (first coeffs) (* x (eval-poly-horner (rest coeffs) x)))))
```

```
user=> (eval-poly-horner (list 5 2 3) 4)
61
```

The same answer, `61`, as the naive version — confirming the factored form is genuinely equal, not merely similar. Trace it: `eval-poly-horner((3), 4)` computes `3 + 4 × 0 = 3`; `eval-poly-horner((2 3), 4)` computes `2 + 4 × 3 = 14`; `eval-poly-horner((5 2 3), 4)` computes `5 + 4 × 14 = 61`. Count the multiplications: exactly one per recursive call — `3`, not `6` — half of the naive version's cost for this three-coefficient polynomial, and the gap only widens as the polynomial grows: for `n + 1` coefficients, Horner's method needs exactly `n` multiplications (roughly), compared to naive's `n(n+1)/2`-plus-`(n+1)` — **linear** growth instead of quadratic.

### Discard the throwaway example

Not applicable — `eval-poly-horner` is a real, meaningfully better function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of the factored form just derived by hand.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn eval-poly-horner [coeffs x]
  (if (empty? coeffs)
    0
    (+ (first coeffs) (* x (eval-poly-horner (rest coeffs) x)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(* x (eval-poly-horner (rest coeffs) x))`** — the key structural difference from the naive version: `x` is multiplied by the *recursive result* directly, once per call, rather than by an independently-computed power — this single multiplication per call is exactly what the factored form `5 + x(2 + x(3))` calls for, read directly off the parenthesization.
- **`(+ (first coeffs) ...)`** — reappearing addition, combining the current coefficient with everything the recursive call already built — no `power-index` accumulator needed at all, unlike the naive version, since Horner's structure never needs to know *which* power it's currently at, only to keep multiplying by `x` one more time at each level.

### CS Lens

Horner's method is a genuinely famous, centuries-old technique (predating computers entirely, originally derived for evaluating polynomials by hand), still the standard way polynomial evaluation is actually implemented in real numerical software — not a teaching simplification invented for this lesson, but the real, practically-used algorithm, derived here from exactly the same factoring technique Lesson 13 taught in the abstract.

### SE Lens

Horner's method also needs no separate `power-index` parameter and no separate `power` function at all — the factored structure eliminates the very quantity (`power-index`) whose bookkeeping the naive version needed, alongside eliminating the redundant computation itself. A genuinely better algebraic form frequently simplifies the code too, not just its cost — the same "provably equal, meaningfully clearer" benefit Lesson 13's own SE Lens already named for factored expressions.

### Connection to the previous unit

The previous unit counted the naive version's real, quantified cost; this unit is the direct fix, derived by applying an already-known technique (factoring) to the polynomial itself, verified to produce the identical answer while requiring provably less work.

---

## Connect the Pieces

Both evaluation methods, agreeing, on a larger polynomial where the cost difference is more pronounced:

```clojure
(def bigger-poly (list 1 1 1 1 1 1))    ; 1 + x + x² + x³ + x⁴ + x⁵

(println "Naive:" (eval-poly-naive bigger-poly 2 0))
(println "Horner:" (eval-poly-horner bigger-poly 2))
```

```
Naive: 63
Horner: 63
```

Both agree — `1 + 2 + 4 + 8 + 16 + 32 = 63`, confirmed by direct calculation. The naive version, for this six-coefficient (degree-5) polynomial, needs `0+1+2+3+4+5 = 15` power-multiplications plus `6` coefficient-multiplications — `21` total. Horner's method needs `5` (roughly one per coefficient beyond the first). The gap, already visible at this small size, is exactly the quadratic-versus-linear difference Concept Unit 3 predicted — the same shape of improvement Lesson 28 found comparing `reverse-naive` to `reverse-acc`.

## What Breaks Without This

Suppose Horner's method were applied to a coefficient list ordered the *wrong* way — highest power first instead of lowest, without adjusting the formula:

```clojure
(def poly-wrong-order (list 3 2 5))    ; meant to be 5 + 2x + 3x², but written backward

(println "Horner on wrongly-ordered coefficients:" (eval-poly-horner poly-wrong-order 4))
```

```
Horner on wrongly-ordered coefficients: 100
```

`100`, not `61` — because `eval-poly-horner`'s specific factored form assumes coefficients are listed lowest-power-first, exactly the convention Concept Unit 1 established; fed the reversed list, it silently computes a *different*, equally valid-looking polynomial (`3 + 2x + 5x²`, which does equal `100` at `x = 4`) instead of the intended one. This isn't a bug in Horner's method — it's Lesson 1's original warning again: a representation's convention (here, coefficient order) is part of its meaning, and code trusting that convention produces a confidently wrong answer, not an error, when the convention is silently violated.

## Exercises

1. **Trace.** By hand, trace `(eval-poly-horner (list 1 0 2) 3)` (representing `1 + 0x + 2x² = 1 + 2x²`), showing each recursive call.
2. **Predict.** Before running it, predict how many multiplications `eval-poly-naive` needs for a degree-4 polynomial (5 coefficients), using this lesson's `n(n+1)/2 + (n+1)` formula. Compare to Horner's roughly `n`.
3. **Verify.** Confirm both `eval-poly-naive` and `eval-poly-horner` agree on `(list 2 0 0 1)` (representing `2 + x³`) at `x = 3`.
4. **Break it, on purpose.** Construct a coefficient list ordered highest-power-first (the way "What Breaks Without This" did), and confirm `eval-poly-horner` silently computes a different, specific, wrong polynomial rather than erroring.
5. **Generalize.** Write a function `poly-degree` that returns a polynomial's degree (the highest power with a nonzero coefficient) from its coefficient list — careful with trailing zero coefficients, like `(list 5 2 0)`, which represents a degree-1 polynomial (`5 + 2x`), not degree-2.
6. **Reconstruct.** Close this lesson. From memory, derive Horner's factored form for a four-coefficient polynomial `c0 + c1x + c2x² + c3x³`, the same way Concept Unit 3 derived it for three coefficients.

## Definition of Done

- [ ] You can represent a polynomial as a coefficient list and evaluate it both naively and with Horner's method, getting matching answers.
- [ ] You can state, precisely, how many multiplications each method requires for a given number of coefficients.
- [ ] You completed Exercise 5 (`poly-degree`) and correctly handled a trailing zero coefficient.
- [ ] You can derive Horner's factored form for a polynomial of a size not already shown in this lesson (Exercise 6).
- [ ] Commit `poly-degree` and your Exercise 2 multiplication-count comparison to your notes repository, with a commit message stating the concrete counts you found — for example, `"Add poly-degree; verified naive needs 14 mults vs Horner's 4 for a degree-4 polynomial"` — not just `"lesson 42 exercise"`.

---

**Next lesson:** Lesson 43, *Exponents and Logarithms*, derives the algebraic laws behind the powers this lesson's polynomials used throughout, and connects them directly to the growth-rate reasoning this series has already been counting by hand since Lesson 23.
