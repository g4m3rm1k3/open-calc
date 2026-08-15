# Lesson 8: Truth Tables and Logical Equivalence

**What you will build**: By the end of this lesson you'll be able to prove, mechanically and exhaustively, whether two differently-written boolean conditions always agree — not just on the cases you happened to try, but on every possible case. You'll use this to prove Lesson 7's `broken-withdrawal` bug was a genuine logical error (not just a style difference), and to simplify a real negated condition into a clearer, provably equivalent one.

**What you need to know first**: Lesson 6's *equality* (this lesson applies the same idea to whole boolean expressions, not just single values) and Lesson 7's `and`, `or`, `not`, and the comparison predicates.

**Terms introduced in this lesson**:

- **truth table** — a table listing every possible combination of truth values for a boolean expression's inputs, together with the expression's output for each one. *Why it matters*: with only `true` and `false` to choose from, there are always a small, fixed number of combinations to check — turning "does this always hold?" from an open-ended question into a finite, mechanical one.
- **logical equivalence** — two boolean expressions are equivalent if they produce the same output for every possible combination of their inputs. *Why it matters*: this is Lesson 6's *equality*, applied to whole formulas instead of single values — two expressions that look completely different in their notation can still be proven, exhaustively, to always agree.
- **De Morgan's laws** — the equivalences "not (p and q)" = "(not p) or (not q)," and "not (p or q)" = "(not p) and (not q)." *Why it matters*: verified directly in this lesson, and likely the single most useful pair of equivalences for simplifying a negated condition into a clearer, un-negated one, from here forward.

**Objects and methods used**: None new. This lesson reuses `and`, `or`, `not` (Lesson 7), the comparison predicates (Lesson 7), and `=` (Lesson 6) — the new content here is a reasoning technique applied to them, not new syntax.

---

## Concept Unit: Truth Tables — Enumerating Every Case

### The Problem

Lesson 7's `implies` was checked against four specific combinations of `true` and `false` and matched implication's definition every time. Four checks is not the same thing as a proof that it *always* matches — how would you actually be certain, rather than just unlucky not to have found a counterexample yet?

### Introduce the concept in isolation

With two boolean inputs, there are exactly four possible combinations — `true`/`true`, `true`/`false`, `false`/`true`, `false`/`false` — and no fifth one is possible, because a boolean has no other values (Lesson 7's Concept Unit 3 established `true` and `false` as the only two). Checking all four is therefore not a sample — it's every case there is:

```
user=> (defn implies [p q] (or (not p) q))
#'user/implies
user=> (implies true true)
true
user=> (implies true false)
false
user=> (implies false true)
true
user=> (implies false false)
true
```

Arranged as a table:

| p     | q     | `(implies p q)` |
|-------|-------|------------------|
| true  | true  | true             |
| true  | false | false            |
| false | true  | true             |
| false | false | true             |

This is a **truth table**: every row is one possible combination of inputs, and because there are only four combinations total for two boolean inputs, this table is a complete, exhaustive account of `implies`'s behavior — not four examples out of many, but literally all of them. Confirming `implies` matches logical implication's definition on all four rows is a genuine proof that it always does, for any `p` and `q` — there's no fifth combination left that could disagree.

### Discard the throwaway example

REPL-only, same as prior lessons' early examples — though `implies`, again, is worth keeping around for the rest of this lesson.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(implies true false)
```

(the second row of the table above, checked against `implies` from Lesson 7.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(implies true false)`** — a reappearing call (Lesson 7); nothing new syntactically. What's new is the *purpose* of making this call: not to use the result, but to fill in one specific, deliberately chosen row of an exhaustive table.

### CS Lens

Checking every possible case because there happen to be few enough to check them all is called **exhaustive proof** or **proof by cases**, formalized properly in Lesson 17 (*Proof by Cases and Contradiction*) — a truth table is exhaustive proof's smallest, most concrete instance, since a boolean input only ever has two possible values. Also recognized in: a hardware test suite that checks every input combination for a small digital circuit (Lesson 185, *Boolean Circuits*, is exactly this, at the level of physical logic gates), and a vending machine's coin-acceptance mechanism, tested against every valid and invalid coin it might receive.

### SE Lens

Exhaustive checking only stays practical because the number of combinations is small — two boolean inputs give four rows, three give eight, and the count doubles with every additional input. This is the first hint of a cost this series will return to directly in Lesson 51 (*Big-O*): a technique that works cleanly for two or three inputs can become impractical to check exhaustively by hand well before it becomes impossible in principle — a real, common tension between "provably correct" and "practical to actually verify."

---

## Concept Unit: Logical Equivalence — Same Truth Table, Different Expression

### The Problem

De Morgan's rule claims `not (p and q)` always produces the same result as `(not p) or (not q)` — two expressions that look nothing alike. Lesson 6 established that two *values* are equal when they denote the same thing, regardless of the expression that produced them. Does the same idea extend to two *boolean expressions*, each built from different variables and connectives?

### Introduce the concept in isolation

```
user=> (defn form-a [p q] (not (and p q)))
#'user/form-a
user=> (defn form-b [p q] (or (not p) (not q)))
#'user/form-b
user=> (= (form-a true true) (form-b true true))
true
user=> (= (form-a true false) (form-b true false))
true
user=> (= (form-a false true) (form-b false true))
true
user=> (= (form-a false false) (form-b false false))
true
```

Every one of the four possible rows agrees — `form-a` and `form-b` produce the same output for every combination of `p` and `q`, with nothing left unchecked. This is **logical equivalence**: two boolean expressions with the same truth table, checked here by literally comparing each row's output with `=` (Lesson 6), applied for the first time to a claim about entire *formulas*, not single values. `form-a` and `form-b` are, provably, always interchangeable — this is the first of **De Morgan's laws**, verified directly rather than taken on faith.

### Discard the throwaway example

REPL-only.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (form-a true true) (form-b true true))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(form-a true true)`, `(form-b true true)`** — reappearing calls (Lesson 4); each evaluates independently to a boolean.
- **`=`** — reappearing (Lesson 6); compares the two resulting booleans for one specific row, exactly the same mechanism used to compare two numbers in Lesson 6, applied here to the outputs of two boolean expressions instead.

### CS Lens

Two syntactically different expressions proven to always produce the same result is the exact idea behind a compiler's **optimization** (Lesson 204, *Compilers and Optimization*): replacing one expression with a provably equivalent, cheaper or clearer one, trusting the proof rather than re-deriving it every time. Also recognized in: two different, equally valid routes to the same destination (different paths, same outcome), and two different recipes that happen to produce the same finished dish.

### SE Lens

Being able to state and check "these two conditions are equivalent" precisely — rather than eyeballing two pieces of code and guessing they probably do the same thing — is what makes refactoring (Lesson 280) trustworthy instead of risky. A truth table is a small, self-contained instance of the much larger obligation professional code changes carry: prove the replacement behaves identically, don't just assert it looks similar.

### Connection to the previous unit

The previous unit checked one function's output against a known definition, row by row; this unit compares *two different functions'* outputs against each other, row by row — the same exhaustive-checking technique, now proving a relationship between two expressions instead of validating one.

---

## Concept Unit: Proving Non-Equivalence — When a Truth Table Doesn't Match

### The Problem

Lesson 7's "What Breaks Without This" swapped `and` for `or` in `apply-withdrawal`'s condition and produced a real bug. That was shown with one concrete, broken example — a withdrawal of `-5` that should have been rejected and wasn't. Is there a way to state, precisely and completely, *why* that swap was wrong, rather than just pointing at one input where it happened to go wrong?

### Introduce the concept in isolation

```
user=> (defn form-and [p q] (and p q))
#'user/form-and
user=> (defn form-or [p q] (or p q))
#'user/form-or
user=> (= (form-and true true) (form-or true true))
true
user=> (= (form-and true false) (form-or true false))
false
```

The table doesn't need to be finished — one disagreeing row is already enough. On `p = true`, `q = false`: `form-and` gives `false` (not both are true), `form-or` gives `true` (at least one is) — genuinely different answers, not just different-looking code. `and` and `or` are **not** logically equivalent, and this single row is a complete proof of that — a table only needs one mismatched row to prove non-equivalence, the same way a truth table needs *every* row to match to prove equivalence.

This is the precise version of Lesson 7's bug: `broken-withdrawal` used `(or (valid-withdrawal-amount? amount) (>= balance amount))` where `apply-withdrawal` used `and`. Lesson 7 showed one concrete input (`amount = -5`) where they disagreed; this unit shows *why* one was guaranteed to exist — `and` and `or` disagree on the "exactly one condition is true" row, and an invalid, negative amount against a sufficient balance is exactly that row in disguise: `valid-withdrawal-amount?` false, `(>= balance amount)` true.

### Discard the throwaway example

REPL-only.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (form-and true false) (form-or true false))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(form-and true false)`, `(form-or true false)`** — reappearing calls; this row's outputs, `false` and `true` respectively, are the actual counterexample.
- **`=`** — reappearing (Lesson 6); reports `false` here, which is the proof — not an error, but the expected, correct result of comparing two values that genuinely differ.

### CS Lens

A single row where two things disagree is called a **counterexample**, and finding one is often far cheaper than proving equivalence: proving `and` equivalent to `or` would require checking all four rows and finding them all matching; proving them *not* equivalent needed exactly one. This asymmetry — one disagreement disproves, but only a complete match proves — recurs throughout this series' proof techniques, starting formally with Lesson 17's proof by contradiction.

### SE Lens

Lesson 7's bug was caught by testing one specific input by hand. This unit's version — checking the underlying logical shapes against each other — catches the *entire category* of inputs that would trigger it, not just the one example that happened to get tried. Lesson 278 (*Property-Based Testing*) is exactly this idea, scaled up: instead of testing one hand-picked input, generate and check every input a specification allows, the same exhaustive spirit this lesson's truth tables already apply by hand to booleans.

### Connection to the previous unit

The previous unit proved two expressions equivalent by checking every row matched; this unit proves two different expressions are *not* equivalent, using the same table, needing only one mismatched row instead of a complete match.

---

## Concept Unit: Simplifying a Condition Using a Known Equivalence

### The Problem

A condition like "not (the balance is positive and the amount is positive)" is correct, but written negated — a reader has to mentally flip it to understand what actually makes it true. De Morgan's law, verified in Concept Unit 2, says this can be rewritten. Does rewriting it actually produce a clearer, still-correct condition in real code, not just an abstract `p`/`q` formula?

### Introduce the concept in isolation

```
user=> (defn blocked? [balance amount] (not (and (> balance 0) (> amount 0))))
#'user/blocked?
user=> (defn blocked-simplified? [balance amount] (or (<= balance 0) (<= amount 0)))
#'user/blocked-simplified?
```

`blocked-simplified?` was built by applying De Morgan's law directly: `not (p and q)` became `(not p) or (not q)`, then each `(not (> x 0))` was rewritten as `(<= x 0)` — "not greater than zero" and "less than or equal to zero" being the same claim about a number, stated without a `not` at all. Check a few concrete cases:

```
user=> (blocked? 100 50)
false
user=> (blocked-simplified? 100 50)
false
user=> (blocked? -5 50)
true
user=> (blocked-simplified? -5 50)
true
user=> (blocked? 100 0)
true
user=> (blocked-simplified? 100 0)
true
```

Every case checked agrees, including the boundary case (`amount = 0`, where "greater than zero" and "less than or equal to zero" meet). This isn't yet a complete proof the way Concept Unit 2's four-row table was — `balance` and `amount` aren't booleans, so there are far more than four combinations to check — but De Morgan's law itself *was* proven exhaustively in Concept Unit 2, for arbitrary `p` and `q`; applying an already-proven equivalence to two specific sub-expressions (`(> balance 0)` and `(> amount 0)`, standing in for `p` and `q`) is Lesson 6's substitution, not a new claim needing its own from-scratch proof.

### Discard the throwaway example

REPL-only, though both functions are worth keeping for Connect the Pieces, below.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn blocked-simplified? [balance amount] (or (<= balance 0) (<= amount 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(or (<= balance 0) (<= amount 0))`** — built from reappearing `or` (Lesson 7) and reappearing comparison predicates (Lesson 7); the only new fact is *why* this particular shape was chosen — it's the De Morgan-transformed version of `blocked?`'s negated `and`, not an independently-invented condition.

### CS Lens

Rewriting `not (p and q)` into `(not p) or (not q)`, then simplifying each `not (> x 0)` into `(<= x 0)`, is the same kind of transformation a compiler's optimizer performs constantly (Lesson 204) — replacing one expression with a logically identical but more efficient or more readable one. Also recognized in: simplifying "it is not the case that both the door is locked and the window is locked" into "the door is unlocked or the window is unlocked" — the same rewrite, in English instead of code.

### SE Lens

`blocked?` and `blocked-simplified?` are provably interchangeable, which means the choice between them is purely about readability, not correctness — and that's a real, worthwhile improvement: a reader parsing `(not (and (> balance 0) (> amount 0)))` has to mentally apply De Morgan's law themselves to understand what makes the condition true; `(or (<= balance 0) (<= amount 0))` states it directly. Lesson 291 (*Designing for Change*) returns to this exact tradeoff — code that's merely correct and code that's correct *and* easy for the next reader to verify are not the same achievement, even when they compute identically.

### Connection to the previous unit

The previous unit proved two connectives are never interchangeable; this unit uses an equivalence that *was* proven (De Morgan's law, Concept Unit 2) to justify rewriting a real condition — the productive use of exactly the kind of proof the last two units established how to construct.

---

## Connect the Pieces

One file, exercising every idea from this lesson:

```clojure
(defn blocked? [balance amount] (not (and (> balance 0) (> amount 0))))
(defn blocked-simplified? [balance amount] (or (<= balance 0) (<= amount 0)))

(println "Case 1 (100, 50):" (blocked? 100 50) (blocked-simplified? 100 50))
(println "Case 2 (-5, 50):" (blocked? -5 50) (blocked-simplified? -5 50))
(println "Case 3 (100, 0):" (blocked? 100 0) (blocked-simplified? 100 0))
(println "Both forms match on every case tried:"
         (= (blocked? 100 50) (blocked-simplified? 100 50))
         (= (blocked? -5 50) (blocked-simplified? -5 50))
         (= (blocked? 100 0) (blocked-simplified? 100 0)))
```

Run it:

```
Case 1 (100, 50): false false
Case 2 (-5, 50): true true
Case 3 (100, 0): true true
Both forms match on every case tried: true true true
```

`blocked-simplified?` exists because De Morgan's law was proven equivalent by exhaustive truth table (Concept Unit 2) — a proof that covers `p` and `q` as pure booleans, in general — and then applied by substitution (Lesson 6) to this specific pair of predicates. The concrete checks above aren't the proof itself; they're a spot check confirming the substitution was done correctly, the way running code after a refactor confirms the refactor was applied correctly, even though the real guarantee of correctness came from the proof, not from these few examples.

## What Breaks Without This

Suppose the simplification were done slightly wrong — a common, easy mistake with De Morgan's law is forgetting to flip *both* the connective *and* each inner condition:

```clojure
(defn blocked-wrong? [balance amount] (or (> balance 0) (> amount 0)))
```

This keeps `or` (correctly flipped from `and`) but forgets to negate the inner comparisons. Check it against the original:

```
user=> (defn blocked? [balance amount] (not (and (> balance 0) (> amount 0))))
user=> (defn blocked-wrong? [balance amount] (or (> balance 0) (> amount 0)))
user=> (= (blocked? 100 50) (blocked-wrong? 100 50))
false
```

A real disagreement, on the very first case tried — proof, by the same counterexample technique as Concept Unit 3, that `blocked-wrong?` is not equivalent to `blocked?` at all, despite being built from a real equivalence (De Morgan's law) applied incompletely. The lesson here is precise: an equivalence justifies a *complete*, correctly-applied rewrite — every connective and every inner term — not a partial one that merely resembles it.

## Exercises

1. **Trace.** Build the full four-row truth table, by hand, for `(not (or p q))` and `(and (not p) (not q))` — the second half of De Morgan's laws. Do they match on every row?
2. **Predict.** Before checking, predict whether `(and p (or q r))` and `(or (and p q) (and p r))` are equivalent for all combinations of `p`, `q`, and `r` (eight rows this time, not four). Check as many rows as you need to find out — remember, one disagreement is enough to disprove; only a full match proves.
3. **Counterexample.** Find a single row that proves `(implies p q)` (Lesson 7) is *not* equivalent to `(and p q)`.
4. **Break it, on purpose.** Take Exercise 1's second law and apply it incorrectly (the way "What Breaks Without This" did to the first law) — flip the connective but forget to negate one of the inner terms. Find a concrete case where it disagrees with the correct version.
5. **Generalize.** Using De Morgan's law, simplify `(not (or (= status "closed") (= status "frozen")))` into an un-negated form. (`=` compared against text — a *string* — hasn't been formally taught yet; treat it the same as comparing any two values with `=` from Lesson 6.)
6. **Reconstruct.** Close this lesson. From memory, explain why checking one disagreeing row is enough to disprove equivalence, while checking three matching rows out of four is *not* enough to prove it.

## Definition of Done

- [ ] You can build a complete truth table, by hand, for a two-variable boolean expression.
- [ ] You can explain, from memory, why one mismatched row disproves equivalence but a full table is needed to prove it.
- [ ] You completed Exercise 2 (the three-variable distributive law) and found either a full match or a counterexample.
- [ ] You can explain, precisely, why Lesson 7's `broken-withdrawal` bug was guaranteed to exist, using this lesson's vocabulary (not just "it used the wrong connective").
- [ ] Commit your Exercise 5 simplification to your notes repository, with a commit message naming the equivalence that justifies it — for example, `"Simplify status-blocked condition via De Morgan's law — not(closed or frozen) becomes not-closed and not-frozen"` — not just `"lesson 8 exercise"`.

---

**Next lesson:** Lesson 9, *Quantifiers*, extends this lesson's "check every case" idea past a small, fixed handful of boolean rows — to claims about *every* element of a whole collection, or the *existence* of at least one that satisfies some condition, translated directly into the loops and searches this series builds from here forward.
