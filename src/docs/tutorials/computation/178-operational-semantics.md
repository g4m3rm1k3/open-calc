# Lesson 178: Operational Semantics

**What you will build**: By the end of this lesson you'll write formal transition rules for this section's own `"add"` and `"var"` AST shapes — real, precise statements in the style of Lesson 160's own BNF grammar rules — and check them against `eval-env`'s own already-verified behavior from Lesson 164, confirming the formal rules and the real code agree exactly, value for value.

**What you need to know first**: Lesson 164's `eval-env` and its own already-verified `["add" ["var" "x"] 5]` result; Lesson 160's production-rule notation, reused here for a different purpose.

**Terms introduced in this lesson**:

- **operational semantics** — a precise, formal specification of what a program means, given as rules describing how its state transitions step by step during execution. *Why it matters*: `eval-env` (Lesson 164) is *one* implementation of this section's own language semantics; operational semantics writes down what any correct implementation must do, independent of Clojure, `cond`, or any other implementation detail.
- **transition rule** — a single formal rule stating how one piece of a program's state changes into the next, written `\langle e, env \rangle \to v` ("expression `e`, in environment `env`, transitions to value `v`"). *Why it matters*: the formal counterpart to one `cond` branch of `eval-env` — each branch is really one transition rule, informally.

**Objects and methods used**: None new. This lesson formalizes Lesson 164's own already-verified behavior rather than introducing new code.

---

## Concept Unit: Writing `eval-env`'s Own Rules Formally

### The Problem

`eval-env`'s `cond` branches describe, in Clojure, exactly what this section's toy language means. Can that meaning be written down independent of Clojure entirely — in a form any correct implementation, in any language, would have to satisfy?

### Introduce the concept in isolation

Two real transition rules, for this section's own language:

```
\langle n, env \rangle \to n                                    (a number evaluates to itself)

\langle \text{var}(x), env \rangle \to v    \text{ if } lookup(env, x) = v   (a variable evaluates to its bound value)

\langle \text{add}(e_1, e_2), env \rangle \to v_1 + v_2
    \text{ if } \langle e_1, env \rangle \to v_1 \text{ and } \langle e_2, env \rangle \to v_2
```

Each rule states a precondition (what has to already be true) and a conclusion (what transition that guarantees). The `"add"` rule's precondition — both operands must *already* transition to real values, `v_1` and `v_2` — is exactly `eval-env`'s own recursive calls, written as a formal requirement rather than a Clojure function call.

### Discard the throwaway example

Not applicable — these three rules describe real, already-implemented behavior; nothing here is throwaway.

### CS Lens

This is called **operational semantics** — specifically, this style (rules with preconditions above a line, a conclusion below) is called a **big-step** semantics, since `\langle e, env \rangle \to v` states an expression transitions directly to its *final* value, skipping over every intermediate step — Lesson 179 will contrast this against a *small-step* semantics, which describes each individual step instead.

### SE Lens

Writing rules this way, independent of any one language, is what lets two genuinely different implementations — this curriculum's own Clojure `eval-env`, and a hypothetical Python or Rust interpreter for the identical toy language — both be checked against the *same* specification, rather than one implementation silently becoming the unstated definition of "correct."

---

## Concept Unit: Checking the Rules Against Real, Already-Verified Output

### The Problem

Do these formal rules actually predict what `eval-env` computes, or could they look plausible and still diverge from the real implementation?

### Introduce the concept in isolation

Lesson 164 already verified, for real, that `(eval-env ["add" ["var" "x"] 5] [["x" 10]])` gives `15`. Checking that against this lesson's own rules, by hand:

1. `\langle \text{var}(x), [x{:}10] \rangle \to 10` — the `"var"` rule applies: `lookup([x{:}10], x) = 10`.
2. `\langle 5, [x{:}10] \rangle \to 5` — the number rule applies directly.
3. `\langle \text{add}(\text{var}(x), 5), [x{:}10] \rangle \to 15` — the `"add"` rule's precondition is satisfied by steps 1 and 2 (`v_1 = 10`, `v_2 = 5`), so its conclusion holds: `10 + 5 = 15`.

The formal rules predict exactly `15` — the identical value Lesson 164's own real `bb` run already produced. The rules aren't a new claim being introduced; they're a precise restatement of behavior already checked for real.

### Discard the throwaway example

Not applicable — this trace checks formal rules against output already verified in Lesson 164, this session.

### CS Lens

This three-step derivation is itself a **proof**, in Lesson 17's own proof-by-cases sense — each line's conclusion follows necessarily from its precondition and the rule being applied, the identical logical structure a mathematical proof uses, applied here to a program's execution instead of a mathematical claim.

### SE Lens

A real language's specification — Python's own language reference, ECMAScript's own spec — is written substantially this way: formal rules an implementation must satisfy, checkable independent of any one interpreter's source code, which is exactly why multiple genuinely different, independently-built implementations of the same language (CPython, PyPy) can all be correct simultaneously.

### Connection to the previous unit

The previous unit wrote the rules; this unit proves they aren't just plausible-looking notation — they predict the exact, already-verified real output, checked by hand rather than assumed to match.

---

## Connect the Pieces

Formal rules and real, already-verified code, agreeing on the identical value:

```
Rules predict: 15
eval-env (Lesson 164, verified): 15
```

The formal specification and the real implementation were never two different things being compared for the first time here — they were always describing the identical behavior; this lesson only made that agreement explicit and checkable.

## What Breaks Without This

Suppose `eval-env` were the *only* description of this section's language — no formal rules at all, just "whatever the Clojure code happens to do." A second implementation, built independently, would have nothing precise to check itself against beyond reading and matching Lesson 164's own source code line by line — any subtle divergence (an operand order swapped, a wrong index) would only surface as a real, silent behavioral difference, discovered by accident rather than caught by comparing against a specification neither implementation privileges over the other.

## Exercises

1. **Trace.** By hand, using this lesson's own three rules, derive the value of `\langle \text{add}(3, \text{var}(y)), [y{:}20] \rangle`, showing each step.
2. **Predict.** Before checking, predict what value the rules derive for `\langle \text{add}(\text{add}(1,2), 3), [] \rangle` — a nested `"add"`. Then verify against `eval-env` directly.
3. **Verify.** Confirm the rules' predicted value for Exercise 2 matches a real `bb` run of `(eval-env ["add" ["add" 1 2] 3] [])`.
4. **Break it, on purpose.** Write a *plausible-looking but wrong* rule for `"add"` — say, one requiring only `e_1` to transition to a value, ignoring `e_2` entirely — and describe a real input where this wrong rule's prediction would diverge from `eval-env`'s actual output.
5. **Generalize.** Describe, without coding it, a transition rule for `"fn"` nodes, matching `eval-env`'s own closure-building behavior from Lesson 165.
6. **Reconstruct.** Close this lesson. From memory, explain why the `"add"` rule's precondition needs *both* `e_1` and `e_2` to transition to values before its own conclusion can be trusted.

## Definition of Done

- [ ] You can write a formal transition rule with a precondition and conclusion, in this lesson's own notation.
- [ ] You can derive a value by hand using a sequence of rule applications, the way this lesson's own three-step trace did.
- [ ] You can explain why operational semantics is independent of any one implementation language.
- [ ] You completed Exercise 3 and confirmed a rule-derived prediction against real `bb` output.
- [ ] You completed Exercise 4 and described a real input where a deliberately wrong rule diverges from the real implementation.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm nested-add rule derivation matches eval-env output of 6; show ignoring e2 in the add rule diverges on any input where e2 isn't 0"` — not just `"lesson 178 exercise"`.

---

**Next lesson:** Lesson 179, *Small-Step vs Big-Step Semantics*, contrasts this lesson's own big-step rules — jumping straight to a final value — against small-step rules describing one individual step at a time, and shows what each style makes easy or hard to express.
