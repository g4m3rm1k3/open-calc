# Lesson 178: Operational Semantics

**What you will build**: By the end of this lesson you'll write the `"add"` rule's own precondition and conclusion as a real, runnable Clojure predicate — `add-rule-holds?` — and prove it actually agrees with `eval-env`'s real behavior, verified this session: `true` for the real rule, `false` for a deliberately wrong rule that ignores one operand. The formal rule isn't decoration here; it's a real claim, checked exactly the way every other claim in this curriculum has been.

**What you need to know first**: Lesson 164's `eval-env`; Lesson 160's production-rule notation, reused here for a different purpose.

**Terms introduced in this lesson**:

- **operational semantics** — a precise, formal specification of what a program means, given as rules describing how its state transitions step by step during execution. *Why it matters*: `eval-env` (Lesson 164) is *one* implementation of this section's own language semantics; operational semantics writes down what any correct implementation must do, independent of Clojure, `cond`, or any other implementation detail.
- **transition rule** — a single formal rule stating how one piece of a program's state changes into the next, written `\langle e, env \rangle \to v` ("expression `e`, in environment `env`, transitions to value `v`"). *Why it matters*: the formal counterpart to one `cond` branch of `eval-env` — each branch is really one transition rule, informally.

**Objects and methods used**: None new. This lesson reuses `eval-env` (Lesson 164), `and`/`=` (Lesson 7, Lesson 6), and `+` (Lesson 2), each already covered.

---

## Concept Unit: A Transition Rule, Written as a Real Predicate

### The Problem

`eval-env`'s `"add"` branch computes a value. Can the *rule* it's supposedly following — "the sum's value is the sum of its two operands' own values" — be written down and checked as a real, separate claim, rather than trusted just because the code runs without error?

### Introduce the concept in isolation

```clojure
(declare add-rule-check)
(defn add-rule-holds? [e1 e2 env]
  (add-rule-check (eval-env e1 env) (eval-env e2 env) (eval-env ["add" e1 e2] env)))

(defn add-rule-check [v1 v2 actual]
  (= (+ v1 v2) actual))
```

```
user=> (add-rule-holds? ["var" "x"] 5 [["x" 10]])
true
user=> (eval-env ["add" ["var" "x"] 5] [["x" 10]])
15
```

`add-rule-holds?` doesn't just call `eval-env` and trust it — it independently computes `e1`'s value (`10`) and `e2`'s value (`5`), and checks that `eval-env`'s *own* real result for the full `"add"` expression equals their sum. `true`, confirmed against the real `15` `eval-env` actually produces. This is the **transition rule** for `"add"`, written formally as `\langle add(e_1,e_2), env\rangle \to v_1+v_2$ if `\langle e_1,env\rangle\to v_1` and `\langle e_2,env\rangle \to v_2` — and, here, as real, runnable code checking that exact claim against real behavior, not merely asserting it in prose.

### Discard the throwaway example

Not applicable — `add-rule-holds?`/`add-rule-check` are real, reusable, and verified this session against `eval-env`'s own real output.

### Project Change

- **Reference Source**: Lesson 164's own `eval-env`, checked here against an independently-written rule rather than modified.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn add-rule-check [v1 v2 actual]
  (= (+ v1 v2) actual))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(eval-env e1 env)`, `(eval-env e2 env)`** — reappearing `eval-env` (Lesson 164), called *independently* on each operand — the rule's own precondition, computed for real rather than assumed.
- **`(eval-env ["add" e1 e2] env)`** — reappearing `eval-env`, called on the *whole* expression — the rule's own conclusion, also computed for real.
- **`(= (+ v1 v2) actual))`** — reappearing `+`/`=` (Lesson 2, Lesson 6): the actual check — does the whole expression's real result equal the sum of its two parts' real results, independently computed.

### CS Lens

This is called **operational semantics** — specifically, this style (a precondition, then a conclusion) is a **big-step** rule: `\langle e,env\rangle \to v` states an expression transitions directly to its *final* value, skipping every intermediate step — Lesson 179 contrasts this against small-step rules, which name each individual step instead.

### SE Lens

Writing the rule as an independent check, rather than trusting `eval-env`'s own internal recursive calls, is exactly what lets a *second*, differently-built implementation of this toy language be verified against the identical rule — the rule doesn't care how `eval-env` computes `e1`'s value, only that whatever it computes satisfies the stated relationship.

---

## Concept Unit: A Wrong Rule, Caught by the Same Check

### The Problem

Would a *plausible-looking but wrong* rule — one that quietly ignores half of what `"add"` actually requires — get caught by this same style of check, or would it slip through unnoticed?

### Introduce the concept in isolation

```clojure
(declare add-rule-wrong-check)
(defn add-rule-wrong-holds? [e1 e2 env]
  (add-rule-wrong-check (eval-env e1 env) (eval-env ["add" e1 e2] env)))

(defn add-rule-wrong-check [v1 actual]
  (= v1 actual))
```

```
user=> (add-rule-wrong-holds? ["var" "x"] 5 [["x" 10]])
false
```

`add-rule-wrong-holds?` is a rule that never looks at `e2` at all — it claims the whole expression's value should just equal `e1`'s value alone, `10`. Checked against `eval-env`'s real result, `15`, it fails: `false`. The wrong rule isn't wrong because it looks unreasonable — it's wrong because, checked against real behavior, its own prediction (`10`) genuinely diverges from what actually happens (`15`).

### Discard the throwaway example

Not applicable — a real, deliberately wrong rule, checked and shown to fail on real input.

### Project Change

- **Reference Source**: No reference counterpart — a deliberately incorrect rule, built to demonstrate this lesson's own verification method by contrast.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn add-rule-wrong-check [v1 actual]
  (= v1 actual))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(add-rule-wrong-check (eval-env e1 env) (eval-env ["add" e1 e2] env))`** — the wrong rule's own precondition never computes `e2`'s value at all — the actual mistake, visible directly in which arguments the function even accepts.
- **`(= v1 actual)`** — checks the wrong prediction (`e1`'s value alone) against the real result — correctly reports `false`, since real `"add"` behavior genuinely depends on `e2`.

### CS Lens

This three-step pattern — state a rule, check it against real behavior, watch a wrong version fail — is Lesson 17's own proof-by-contradiction discipline, applied to a specification instead of a mathematical claim: a rule is trustworthy exactly because a wrong alternative, checked the identical way, demonstrably isn't.

### SE Lens

A real language specification gets exactly this kind of adversarial check during its own development: not just "does the obviously-correct rule pass," but "does a plausible-looking wrong rule actually fail" — the same "test the test" discipline Lesson 158's own checkpoint already required for a monoid checker.

### Connection to the previous unit

The previous unit showed a real rule holding; this unit shows a wrong one failing the identical check — proof the verification method itself is doing real work, not just agreeing with whatever it's given.

---

## Connect the Pieces

A real rule and a wrong one, checked against the identical real behavior:

```clojure
(println "Real rule holds:" (add-rule-holds? ["var" "x"] 5 [["x" 10]]))
(println "Wrong rule holds:" (add-rule-wrong-holds? ["var" "x"] 5 [["x" 10]]))
```

```
Real rule holds: true
Wrong rule holds: false
```

Both rules were checked the identical way, against the identical real `eval-env` behavior — only one actually matches it.

## What Breaks Without This

Suppose `eval-env` were the *only* description of this section's language, with no formal rule ever written down and checked independently. A subtle bug — an operand order swapped somewhere in a future edit to `eval-env` — would have nothing to be caught against except the *unstated* assumption that whatever the code currently does is correct by definition. This lesson's own `add-rule-holds?`, built independently and checked against real output, is a real, second source of truth `eval-env` itself can be verified against, exactly the way the wrong rule in this lesson's second unit was caught rather than silently accepted.

## Exercises

1. **Trace.** By hand, using `add-rule-check`'s own definition, confirm why `(add-rule-holds? 3 4 [])` is `true`.
2. **Predict.** Before checking, predict `(add-rule-holds? ["add" 1 2] 3 [])` — a nested `"add"` as `e1`. Then verify.
3. **Verify.** Confirm the rule holds for `(add-rule-holds? ["var" "y"] ["var" "x"] [["x" 10] ["y" 20]])`, using two real variables instead of a variable and a literal.
4. **Break it, on purpose.** Write a *different* wrong rule — one that checks `(= v2 actual)` instead, ignoring `e1` — and find a real environment where this wrong rule *accidentally* holds despite being wrong in general.
5. **Generalize.** Describe, without coding it, how a rule-checker for `"fn"` nodes would work, matching `eval-env`'s own closure-building behavior from Lesson 165.
6. **Reconstruct.** Close this lesson. From memory, explain why `add-rule-wrong-holds?` failing is proof the checking method works, not proof that `"add"` itself is broken.

## Definition of Done

- [ ] You can write a transition rule as a real, checkable Clojure predicate.
- [ ] You can verify a real rule holds against `eval-env`'s actual behavior.
- [ ] You can write a deliberately wrong rule and show it fails the identical check.
- [ ] You completed Exercise 3 and verified the rule against two real variables.
- [ ] You completed Exercise 4 and found a real environment where a different wrong rule accidentally holds.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm add rule holds for two-variable case; find x=0 makes the e2-ignoring wrong rule accidentally hold"` — not just `"lesson 178 exercise"`.

---

**Next lesson:** Lesson 179, *Small-Step vs Big-Step Semantics*, contrasts this lesson's own big-step rules — jumping straight to a final value — against a real, single-step reducer that exposes every intermediate state along the way.
