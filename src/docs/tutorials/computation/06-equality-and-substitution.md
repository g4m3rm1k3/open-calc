# Lesson 6: Equality and Substitution

**What you will build**: By the end of this lesson you'll be able to precisely say what it means for two values to be "the same" — and know that this question actually has more than one correct answer depending on what you're asking. You'll also gain the reasoning tool this entire series leans on from here forward: if two expressions are equal, either one can be substituted for the other anywhere, without changing the result.

**What you need to know first**: Lesson 1's *correctness* (checking a candidate answer against a criterion — this lesson makes "does it match?" precise), Lesson 2's exact-versus-approximate values, Lesson 3's *binding*, and Lesson 5's proof that `(* 2 2)` and `(+ 2 2)` reach the same value by different routes.

**Terms introduced in this lesson**:

- **equality** — a comparison asking whether two expressions denote the same value. *Why it matters*: Lesson 1's *correctness* already depended on comparing a candidate answer to an expected one; this lesson gives that comparison a precise, checkable mechanism instead of leaving "matches" as an intuition.
- **assignment** — in most other languages (including Python), the act of associating a name with a value, often spelled `=` — a symbol that looks like equality-testing but performs a completely different operation. *Why it matters*: Python spells assignment `=` and equality-testing `==`; Clojure spells them `def` (a word, covered in Lesson 3) and `=` (a comparison) — exactly the opposite symbol for exactly the opposite purpose. Carrying Python's `=` habit into Clojure code is a real, easy mistake worth naming precisely, not just warning about vaguely.
- **identity** — a comparison asking whether two expressions refer to the very same underlying value in memory, not merely to equal values. *Why it matters*: two things can be equal without being the same thing in every sense — a distinction that matters little now, but becomes essential once Lesson 167 introduces values that can change after they're created.
- **substitution** — replacing an expression with another expression known to have an equal value, without changing the result of whatever contains it. *Why it matters*: this is the actual reasoning technique behind nearly every proof and derivation in the rest of this series, starting with Lesson 14's inductive thinking and Lesson 15's mathematical induction.

**Objects and methods used**:

- **`=`**
  - *What it is:* a function in Clojure's core library that tests whether two (or more) values are equal.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` denote the same value, `false` otherwise — verified this session: `(= 4 4)` → `true`, `(= (* 2 2) (+ 2 2))` → `true` (equal values from different expressions), and, more precisely than "same number" might suggest, `(= 1 1.0)` → `false` (Concept Unit 1 covers exactly why).
  - *Its use:* every Concept Unit in this lesson.
- **`==`**
  - *What it is:* a function in Clojure's core library that tests numeric equality specifically, ignoring the exactness distinction `=` respects.
  - *Implementation:* `(== a b)` — verified this session: `(== 1 1.0)` → `true`, even though `(= 1 1.0)` → `false`.
  - *Its use:* Concept Unit 1, to prove that `=`'s stricter behavior on `1` versus `1.0` is deliberate, not an oversight — a different, real function exists specifically for the looser comparison.
- **`identical?`**
  - *What it is:* a function in Clojure's core library that tests whether two expressions refer to the exact same underlying value, not merely equal ones.
  - *Implementation:* `(identical? a b)` — verified this session: `(identical? 5 5)` → `true`, but `(identical? 100000000 100000000)` → `false`, even though `(= 100000000 100000000)` → `true`. (Concept Unit 3 explains this difference.)
  - *Its use:* Concept Unit 3, to prove equality and identity are genuinely different questions.

---

## Concept Unit: Value Equality — `=`

### The Problem

Lesson 5's traces repeatedly claimed two differently-built expressions "give the same result" — `(* 2 2)` and `(+ 2 2)` were both said to equal `4`. What, precisely, makes that claim checkable, rather than just something asserted in prose?

### Introduce the concept in isolation

```
user=> (= 4 4)
true
user=> (= (+ 2 2) 4)
true
user=> (= (* 2 2) (+ 2 2))
true
```

`=` evaluates both of its arguments to values first (Lesson 2's evaluation rule, as always), then compares the two resulting values — not the notation that produced them. `(* 2 2)` and `(+ 2 2)` look nothing alike as expressions; both evaluate to `4`, and `=` reports them equal, exactly as Lesson 5's traces assumed.

Now a case that looks like it should also be `true`, but isn't:

```
user=> (= 1 1.0)
false
```

Recall Lesson 2's Concept Unit 4: `1` (no decimal point) and `1.0` (with one) are different *kinds* of value in Clojure — an exact whole number versus a decimal approximation — even though they represent the same mathematical magnitude. `=` treats that difference as real: two values are only `=`-equal if they match in both magnitude *and* exactness category. This isn't a quirk or an oversight — a different function exists specifically for the looser comparison:

```
user=> (== 1 1.0)
true
```

`==` compares magnitude only, ignoring the exact/approximate distinction `=` respects. Both functions are correct, real, verified behavior — they simply answer different questions: "are these the very same kind of value, magnitude included" (`=`), versus "do these represent the same number, regardless of kind" (`==`).

### Discard the throwaway example

REPL-only, same as every prior lesson's early examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(= (* 2 2) (+ 2 2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`=`** — first appearance as a called function (covered fully in Objects and methods used, above): compares the values its arguments evaluate to.
- **`(* 2 2)`, `(+ 2 2)`** — reappearing forms (Lesson 2); both evaluate to `4` before `=` ever compares anything — `=` never sees the original notation, only the resulting values, per Lesson 2's evaluation rule.

### CS Lens

Comparing the *value* two expressions produce, rather than the notation used to produce it, is exactly Lesson 1's correctness criterion made mechanical: "recompute from scratch and compare" only works if "compare" has a precise meaning, which is what `=` supplies. Also recognized in: a spelling checker comparing a typed word to a dictionary entry (comparing the *word*, not which key was pressed to type it), and a vending machine accepting exact change made of different coin combinations (a quarter and a nickel, or three dimes — different notation for the same value, both accepted).

### SE Lens

The alternative — a language with only one equality operator that treats `1` and `1.0` as interchangeable everywhere — would make Lesson 2's exact-versus-approximate distinction unobservable once two such values needed comparing, silently erasing information the rest of a computation might have depended on. Having *both* `=` (strict) and `==` (magnitude-only) available means a program can choose, deliberately, which question it's actually asking — rather than the language forcing one answer regardless of which one was intended.

---

## Concept Unit: Equality Is Not Assignment

### The Problem

If you've written `x = 5` in Python before, that line performs *assignment* — it makes the name `x` refer to `5` from that point forward. Clojure has a symbol that looks similar, `=`, and it does something entirely different: it *compares*, producing `true` or `false`, and creates no binding at all. Given that Lesson 3 already covered how Clojure actually creates bindings (`def`), what happens if `=` and `def` get confused for each other?

### Introduce the concept in isolation

```
user=> (def result (= 5 5))
#'user/result
user=> result
true
user=> (def result (= 5 6))
#'user/result
user=> result
false
```

`(= 5 5)` and `(= 5 6)` each evaluate to a plain value — `true` or `false` — no different in kind from `4` or `1/3` in earlier lessons. `def` doesn't treat `=`'s result specially; it binds `result` to whatever that expression evaluates to, exactly as Lesson 3 already established for any other expression. This proves the two are entirely unrelated operations that merely happen to compose cleanly: `=` produces a value; `def` binds a name to a value, any value, including the result of a comparison.

The naming collision worth stating plainly: Python's `x = 5` is Clojure's `(def x 5)` (Lesson 3); Python's `x == 5` is Clojure's `(= x 5)` (this lesson). Clojure's `=` is never assignment, under any circumstance — the language has no symbol that means "compare" in one context and "assign" in another, the way `=` does across Python, C, Java, and many other languages.

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
(def result (= 5 5))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= 5 5)`** — reappearing form (Concept Unit 1), sitting in the position `def` expects a value-producing expression — no different from `(+ 1 2)` sitting there in Lesson 3.
- **`(def result ...)`** — reappearing `def` (Lesson 3); the only fact worth restating is that the value being bound happens to be a boolean this time, which `def` has no special handling for — it binds whatever value the expression evaluates to, unconditionally.

### CS Lens

Keeping "compare" and "assign" as two entirely separate, unrelated pieces of syntax — rather than overloading one symbol for both — is a real, deliberate language-design choice, not an arbitrary one: Also recognized in: a legal document requiring separate, distinct signatures for "I agree this is accurate" versus "I authorize this to happen" (two different acts, even when they occur near each other), and a spreadsheet distinguishing typing a formula into a cell from checking whether two cells' values match with a separate `=` comparison formula.

### SE Lens

Languages that spell both operations `=` (with a second character, `==`, needed to disambiguate) create a well-known, real category of bug: writing `if (x = 5)` when `if (x == 5)` was meant, silently performing an assignment where a comparison was intended. Clojure's choice to give assignment an entirely different *word* (`def`) rather than a symbol variant makes that specific mistake syntactically impossible — a design tradeoff Lesson 173 (*Type Systems*) and Section VIII's semantics material return to repeatedly: what a language's syntax makes impossible to write is often as important as what it makes convenient.

### Connection to the previous unit

The previous unit established what `=` actually computes; this unit draws the boundary around what it explicitly does *not* do — anything Lesson 3's `def` already covers.

---

## Concept Unit: Equality Is Not Identity

### The Problem

`(= 100000000 100000000)` — two separately-written copies of the same large number — should be `true` by Concept Unit 1's own rule: same value, so equal. But are two separately-written `100000000`s actually *the same* `100000000`, in every sense, or merely two different things that happen to be equal?

### Introduce the concept in isolation

```
user=> (= 100000000 100000000)
true
user=> (identical? 100000000 100000000)
false
```

Both lines involve the exact same value, `100000000` — `=` correctly reports them equal. But `identical?`, a different comparison, reports `false`: the two `100000000`s are not the *same* underlying value, even though they're equal ones. Now compare a smaller number:

```
user=> (identical? 5 5)
true
```

For `5`, `identical?` reports `true` — the same comparison, a different answer, depending only on which number is involved. This isn't a bug in `identical?`; it's revealing something real: small numbers happen to be represented as shared, reused values behind the scenes (an implementation detail this series returns to properly in Lesson 191, *Memory as an Address Space*, and Lesson 194, *Heap Allocation*), while larger ones like `100000000` are freshly created, separate values each time they're written — equal, but not the same one.

This proves the claim precisely: **equality asks "do these represent the same value," identity asks "are these the same value" — two different questions, verifiably different answers, even using nothing but plain numbers.**

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
(identical? 100000000 100000000)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`identical?`** — first appearance as a called function (covered fully in Objects and methods used, above): compares whether two expressions refer to the exact same underlying value, a stricter question than `=`'s "do they represent equal values."
- **`100000000 100000000`** — reappearing numeric literals (Lesson 2); the only new fact is that writing the same large number twice produces two separate values, per this unit's isolated example, rather than one shared one.

### CS Lens

Equal-but-not-identical is the same distinction as two separately-printed copies of the same photograph (identical in every visible detail, but two different physical objects — damaging one doesn't affect the other) versus a photograph and its own reflection in a mirror (the same object, viewed twice). Also recognized in: two people with the same name (equal as strings, not the same person), and — much later in this series — Lesson 104's *persistent data structures*, where "are these two structures equal" and "do they secretly share memory" turn out to be a genuinely useful thing to be able to ask separately.

### SE Lens

Right now, with only plain numbers in play, the distinction between equal and identical barely matters — nothing in this series so far can change after it's created, so "are they the same one" has no practical consequence yet. That changes the moment a value *can* be modified in place: two names that are `identical?` (the literal same value) will both see a change made through either one; two names that are merely `=` (equal, separate values) will not. Lesson 167 (*Mutable State*) is the lesson where this distinction stops being a curiosity and starts being load-bearing — this unit exists so that lesson has vocabulary already in place, rather than introducing "identity" and "mutation" as two new ideas at once.

### Connection to the previous unit

The previous unit distinguished `=` from assignment; this unit distinguishes `=` from a different comparison entirely — `identical?` — proving that "equal" was never the same question as "the same one," even though both units are, in their own way, about what `=` does and doesn't mean.

---

## Concept Unit: Substitution — Equal Expressions Can Replace Each Other

### The Problem

If `(+ 2 3)` and `5` are equal (Concept Unit 1's kind of claim), does that mean `(square (+ 2 3))` and `(square 5)` are also equal — can one expression be swapped for an equal one *inside* a larger expression, and trust the overall result doesn't change?

### Introduce the concept in isolation

```
user=> (defn square [n] (* n n))
#'user/square
user=> (= (+ 2 3) 5)
true
user=> (= (square (+ 2 3)) (square 5))
true
```

`(+ 2 3)` and `5` are equal — confirmed directly. Replacing `(+ 2 3)` with `5` *inside* `square`'s argument position produces two calls, `(square (+ 2 3))` and `(square 5)`, that are themselves equal — confirmed directly, again. Nothing about `square` needed to know or care that its argument arrived as a compound expression instead of a literal; per Lesson 2's evaluation rule, `(+ 2 3)` reduces to `5` before `square` is ever applied, so `square` receives the exact same value either way.

This is **substitution**, stated precisely: if two expressions are equal, replacing one with the other anywhere inside a larger expression does not change that larger expression's value. It isn't a new mechanism — it follows directly from Lesson 2's evaluation rule (sub-expressions reduce to values before anything is applied to them) and Concept Unit 1's definition of equality (same value, regardless of notation) — but naming it explicitly turns it into a reusable reasoning tool: to know whether two expressions are equal, it's enough to know their pieces are equal, without tracing the whole thing by hand every time.

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
(= (square (+ 2 3)) (square 5))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(square (+ 2 3))`** — reappearing call (Lesson 4) with a reappearing sub-expression (Lesson 2) in argument position; reduces to `25`, the same way any nested expression reduces, per Lesson 2's rule.
- **`(square 5)`** — reappearing call (Lesson 4); reduces to `25` directly.
- **Outer `(= ... ...)`** — reappearing form (Concept Unit 1); compares the two resulting values, both `25`, and reports `true`.

### CS Lens

Substitution — replace equals with equals, trust the result — is the exact reasoning step behind ordinary algebra ("if *x = y*, then *f(x) = f(y)*," true for any function *f*) and is the foundational move behind mathematical proof by induction (Lesson 15), where showing a property holds for a smaller case and substituting it into a larger one is the entire technique. Also recognized in: a recipe substitution ("use 1 cup applesauce instead of 1 cup oil" — trusted to work *because* the substitution is understood to be equivalent for the recipe's purposes, not because the two ingredients are the same substance), and refactoring code (Lesson 280) — the entire premise of "this change preserves behavior" is substitution, applied to program text instead of arithmetic.

### SE Lens

Substitution only preserves a result when the two things being swapped are *actually* equal in every sense the surrounding code depends on — Concept Unit 3 is the direct warning attached to this: swapping an `identical?` value for a merely-`=`-equal one is always safe for computations like this lesson's (nothing here can change after creation), but stops being automatically safe once mutation enters the picture, because code elsewhere might be relying on the specific object, not just its current value. This lesson's substitution examples are all safe for exactly that reason — there's nothing yet in this series that could tell the difference.

### Connection to the previous unit

The previous unit proved equality and identity are different questions; this unit shows why the distinction this lesson has been building — precisely what "equal" means — pays off immediately: substitution is only trustworthy because equality was pinned down carefully enough to know exactly what it does and doesn't guarantee.

---

## Connect the Pieces

One expression exercising every idea in this lesson:

```
user=> (defn square [n] (* n n))
#'user/square
user=> (def uses-substitution (= (square (+ 1 4)) (square 5)))
#'user/uses-substitution
user=> uses-substitution
true
```

`(square (+ 1 4))` and `(square 5)` are equal by substitution (Concept Unit 4: `(+ 1 4)` and `5` are equal, so the larger expressions built from them are too) — checked here with `=`, the value-equality comparison from Concept Unit 1, not confused with `def` performing assignment (Concept Unit 2) even though the whole expression is, in the same line, bound to a name with `def`. And because `true` here is a plain boolean value, not a reference to anything that could change, whether `uses-substitution` is `=`-equal to some other `true` or `identical?` to it (Concept Unit 3) would, for a value this simple, come out the same either way — a fact that stops holding once Lesson 167 introduces values that can be modified after they're created.

## What Breaks Without This

Suppose substitution were assumed to hold *unconditionally* — always safe to swap equal-looking things for each other, without checking which kind of equal. Compare:

```
user=> (= 1 1.0)
false
user=> (== 1 1.0)
true
```

If code somewhere assumed "`==`-equal" was strong enough to justify substituting `1.0` for `1` — say, inside a context that specifically needed an exact value, like Lesson 2's `(/ 1 3)` staying an exact fraction — the substitution would silently change the computation's exactness category, something `==` was never claiming to preserve in the first place. `==`'s entire purpose (Concept Unit 1) is comparing magnitude while deliberately ignoring exactness; treating its `true` as license for substitution wherever `=`'s stricter `true` was actually required is exactly the kind of "technically related, not actually interchangeable" mistake this lesson's careful definitions exist to prevent.

## Exercises

1. **Trace.** Predict, then verify: is `(= (* 3 4) (+ 6 6))` `true` or `false`? Both sides reduce to numbers — trace each side by hand first.
2. **Predict.** Predict whether `(= 2 2.0)` and `(== 2 2.0)` give the same answer as `(= 1 1.0)` and `(== 1 1.0)` did in this lesson. Run both and check.
3. **Identity.** Pick a number large enough that you'd expect it isn't cached (try something with several digits), and confirm for yourself, the way Concept Unit 3 did, that it's `=`-equal to a separately-written copy of itself but not `identical?` to it.
4. **Break it, on purpose.** Write an expression using `def` where you intended to write a comparison with `=` — the mistake Concept Unit 2 named directly — and observe what actually happens (a binding gets created; nothing compares anything). Then fix it.
5. **Generalize.** Using `square` and `=`, write a substitution proof — like Concept Unit 4's — showing two *different* pairs of equal expressions (not `(+ 2 3)` and `5`) produce equal results when substituted into `square`.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between `=`, `==`, and `identical?` — one sentence each — and explain why substitution needing equality to be precise, not approximate, is the actual point of this whole lesson.

## Definition of Done

- [ ] You can state, from memory, why `(= 1 1.0)` is `false` while `(== 1 1.0)` is `true`.
- [ ] You can explain, without looking back, why Clojure's `=` is never assignment, and what Clojure uses instead.
- [ ] You've verified, yourself, a real equal-but-not-identical pair of numbers.
- [ ] You completed Exercise 5 — your own substitution proof, not the one from this lesson.
- [ ] Commit your Exercise 5 proof to your notes repository, with a commit message stating *why* the substitution is valid — for example, `"Prove square(4+1) = square(5) — 4+1 and 5 are = equal, so substituting one for the other inside square doesn't change the result"` — not just `"lesson 6 exercise"`.

---

**Next lesson:** Lesson 7, *Predicates and Boolean Logic*, is where `=`'s `true`/`false` results stop being an endpoint and start being building blocks — combined with `AND`, `OR`, and `NOT` into more complex conditions, and finally used to make functions that decide, rather than only compute.
