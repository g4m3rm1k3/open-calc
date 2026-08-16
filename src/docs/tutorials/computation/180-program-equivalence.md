# Lesson 180: Program Equivalence

**What you will build**: By the end of this lesson you'll prove `["fst" ["pair" ["var" "x"] ["var" "y"]]]` and the far simpler `["var" "x"]` are **equivalent** — not by inspecting their syntax, which looks nothing alike, but by checking they produce the identical result under every environment tested, including two genuinely different ones. `10` and `10`. `999` and `999`. Same denotation, completely different-looking programs.

**What you need to know first**: Lesson 156's denotation; Lesson 177's `"pair"`/`"fst"`; Lesson 178's operational semantics, revisited as the precise tool equivalence proofs are built from.

**Terms introduced in this lesson**:

- **program equivalence** — two programs are equivalent when they have the identical denotation: the same output for every possible input, regardless of how different their own syntax or implementation looks. *Why it matters*: names precisely the property that makes an optimization (replacing one program with a simpler, equivalent one) safe — an optimization that isn't provably equivalent to the original isn't an optimization, it's a different program that happens to look similar.

**Objects and methods used**: None new. This lesson reuses `eval-env` (Lesson 164, Lesson 177) and `=` (Lesson 6), each already covered.

---

## Concept Unit: Two Different-Looking Programs, One Denotation

### The Problem

`["fst" ["pair" ["var" "x"] ["var" "y"]]]` builds a pair and immediately reads its first component back out — genuinely more work than just reading `"x"` directly. Do these two programs actually compute the *same* thing, for every possible environment, or only by coincidence on one example?

### Introduce the concept in isolation

```
user=> (def prog-a ["fst" ["pair" ["var" "x"] ["var" "y"]]])
user=> (def prog-b ["var" "x"])
user=> (def env1 [["x" 10] ["y" 20]])
user=> (eval-env prog-a env1)
10
user=> (eval-env prog-b env1)
10
user=> (def env2 [["x" 999] ["y" 1]])
user=> (eval-env prog-a env2)
999
user=> (eval-env prog-b env2)
999
```

Under `env1`, both give `10`. Under a genuinely different environment, `env2` — different values for both `x` and `y` — both give `999`. Two checks, not one, on purposefully different environments: `prog-a` and `prog-b` agree every time. This is **program equivalence**: not that the two happen to match once, but that nothing about their real, computed meaning — their denotation, Lesson 156's own term — differs at all, regardless of which environment either runs under.

### Discard the throwaway example

Not applicable — both programs are real, and agreement was checked against two genuinely different environments, not assumed from one.

### Project Change

- **Reference Source**: Lesson 177's own `"pair"`/`"fst"` evaluation rules, checked here against a genuinely simpler equivalent expression.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks two existing programs against each other rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(eval-env prog-a env1)`, `(eval-env prog-b env1)`** — reappearing `eval-env` (Lesson 164, extended in Lesson 177): the same function, two different programs, one environment — the first of two checks.
- **`(eval-env prog-a env2)`, `(eval-env prog-b env2)`** — the identical comparison under a *different* environment — the second check, specifically chosen to differ from the first so agreement isn't just a coincidence of one particular `x`/`y` pair.

### CS Lens

`\text{fst}(\text{pair}(a, b)) \equiv a` is a real, provable equivalence — a genuine simplification rule, not merely an observation about this lesson's own two test environments: `"pair"` always builds `[a\text{-value}, b\text{-value}]`, and `"fst"` always reads position `0` of it back out, so the two operations always cancel, for *any* `a` and `b` at all, by Lesson 178's own operational semantics rules, not merely by these two spot checks.

### SE Lens

This exact equivalence is a real compiler optimization: a compiler recognizing `fst(pair(a, b))` can safely rewrite it directly to `a`, skipping the real work of constructing a pair only to immediately discard half of it — safe precisely because the rewrite is provably equivalent, not merely faster-looking.

---

## Concept Unit: A Second Equivalence — Commutativity, Rechecked

### The Problem

Is this section's own `"add"` — built from Clojure's `+` — provably equivalent regardless of argument order, the way Lesson 140 already proved for `mod4-add` specifically?

### Introduce the concept in isolation

```
user=> (def prog-c ["add" ["var" "x"] ["var" "y"]])
user=> (def prog-d ["add" ["var" "y"] ["var" "x"]])
user=> (eval-env prog-c env1)
30
user=> (eval-env prog-d env1)
30
user=> (eval-env prog-c env2)
1000
user=> (eval-env prog-d env2)
1000
```

`prog-c` and `prog-d` differ only in argument order — and agree under both environments, `30`/`30` and `1000`/`1000`. This is Lesson 140's own commutativity property, checked here at the level of *whole programs* rather than a single operation applied directly.

### Discard the throwaway example

Not applicable — real, verified agreement under two genuinely different environments.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of an already-known algebraic property, applied here to AST-level programs.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks two existing programs against each other rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["add" ["var" "x"] ["var" "y"]]`, `["add" ["var" "y"] ["var" "x"]]`** — reappearing AST shapes (Lesson 164), differing only in the order of their two operands — the entire test this unit runs.

### CS Lens

Two spot checks are evidence, not proof — real program equivalence, in general, is only fully established by an operational-semantics-based argument (Lesson 178) showing the two programs' rules *always* agree, for every possible input, not just the environments a lesson happened to try; this unit's two checks make the claim plausible and concrete, exactly the same honest distinction Lesson 141's own "spot check, not exhaustive proof" already drew for `concat`.

### SE Lens

A compiler reordering commutative operations for performance — evaluating whichever operand is cheaper first, say — depends on this exact equivalence holding for *every* real input, not just the ones a test suite happens to run; getting it wrong for even one input (an operation that isn't truly commutative, mistakenly assumed to be) is a real, silent correctness bug in the optimizer itself.

### Connection to the previous unit

The previous unit proved a real simplification (`fst(pair(a,b)) \equiv a`); this unit rechecks a familiar property (commutativity) at the level of whole programs, both real instances of the identical underlying idea — equivalence, checked rather than assumed.

---

## Connect the Pieces

Two real equivalences, each checked under two genuinely different environments:

```clojure
(println "fst(pair(x,y)) == x, env1:" (= (eval-env prog-a env1) (eval-env prog-b env1)))
(println "fst(pair(x,y)) == x, env2:" (= (eval-env prog-a env2) (eval-env prog-b env2)))
(println "add(x,y) == add(y,x), env1:" (= (eval-env prog-c env1) (eval-env prog-d env1)))
(println "add(x,y) == add(y,x), env2:" (= (eval-env prog-c env2) (eval-env prog-d env2)))
```

```
fst(pair(x,y)) == x, env1: true
fst(pair(x,y)) == x, env2: true
add(x,y) == add(y,x), env1: true
add(x,y) == add(y,x), env2: true
```

Two genuinely different pairs of programs, both equivalent — one pair because a construct-then-immediately-deconstruct cancels out; the other because addition simply doesn't care about order.

## What Breaks Without This

Suppose a compiler optimizer rewrote `fst(pair(a, b))` to `a` *without* this equivalence actually holding — say, if `"pair"` had some hidden side effect the rewrite silently dropped. Every program relying on that side effect would behave differently after "optimization" than before, a real, silent correctness bug introduced specifically because the rewrite was assumed equivalent rather than actually proven so. Program equivalence isn't a nicety — it's the exact, checkable condition an optimization has to satisfy to be a real optimization rather than an unintended behavior change wearing a performance justification.

## Exercises

1. **Trace.** By hand, using `eval-env`'s own rules, confirm `["snd" ["pair" ["var" "x"] ["var" "y"]]]` is equivalent to `["var" "y"]`, the mirror of this lesson's own `fst` equivalence.
2. **Predict.** Before checking, predict whether `["add" ["var" "x"] 0]` is equivalent to `["var" "x"]` alone. Then verify under two different environments.
3. **Verify.** Confirm `["add" ["add" ["var" "x"] 1] 1]` and `["add" ["var" "x"] 2]` are equivalent under at least two different environments.
4. **Break it, on purpose.** Find two programs that agree under *one* environment but genuinely differ under a second, and explain why a single check would have wrongly suggested they're equivalent.
5. **Generalize.** Describe, without coding it, why proving two programs equivalent for *every* possible environment (not just a few tested ones) generally requires an operational-semantics argument (Lesson 178), not just running more test cases.
6. **Reconstruct.** Close this lesson. From memory, explain why `fst(pair(a,b)) \equiv a` is a real, provable fact from `eval-env`'s own rules, not merely something this lesson's two environments happened to confirm.

## Definition of Done

- [ ] You can check whether two programs are equivalent by comparing their results under multiple different environments.
- [ ] You can explain why passing several spot checks is evidence for equivalence but not a full proof.
- [ ] You can explain why a compiler optimization's safety depends entirely on real program equivalence.
- [ ] You completed Exercise 3 and confirmed a real arithmetic equivalence under two environments.
- [ ] You completed Exercise 4 and found two programs that are not actually equivalent, despite agreeing on one environment.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm add(add(x,1),1) equivalent to add(x,2) under two environments; find two programs agreeing under env1 but diverging under env2"` — not just `"lesson 180 exercise"`.

---

**Next lesson:** Lesson 181, *Static Analysis*, uses this section's own AST-walking tools one more way — deriving real, useful information about a program (which variables it uses, whether it might fail) without ever executing it at all, the same discipline Lesson 173's type checker already applied to one specific question.
