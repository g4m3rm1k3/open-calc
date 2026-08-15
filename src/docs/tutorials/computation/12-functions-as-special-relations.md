# Lesson 12: Functions as Special Relations

**What you will build**: By the end of this lesson you'll have the precise, formal definition of a function — not just "something you can call with `defn`," but a specific kind of relation, distinguished by one exact rule. You'll be able to classify a function as total or partial, and as injective, surjective, or bijective — vocabulary that lets you state exactly what kind of guarantee a transformation makes, instead of describing it loosely.

**What you need to know first**: Relations, ordered pairs, domain, and range from the previous lesson, and the informal notion of a function this series has used since Lesson 4.

**Terms introduced in this lesson**:

- **single-valued** — a relation's property of pairing each domain element with exactly one range element, never more than one. *Why it matters*: this is the one restriction that turns a general relation into a function — named precisely so "is this a function" becomes a checkable property, not a judgment call.
- **total function** — a function defined for every element of its stated domain, with no exceptions. *Why it matters*: distinguishes an unconditional guarantee ("this works for any input of the right type") from one with gaps.
- **partial function** — a function defined for only some elements of what would otherwise be its domain, undefined for the rest. *Why it matters*: names, precisely, the situation this series has already brushed against without naming — a transformation that can't produce an answer for every conceivable input, and needs its actual domain stated honestly.
- **injective** (**one-to-one**) — a function where different inputs always produce different outputs; no two distinct domain elements share a range element. *Why it matters*: this is exactly the property that makes a function reversible — given an output, an injective function's input can always be uniquely recovered.
- **surjective** (**onto**) — a function where every element of the stated codomain is actually produced by some input. *Why it matters*: distinguishes "every output *type* that could occur, does occur, for some input" from a function that only ever reaches part of its declared range.
- **bijective** — a function that is both injective and surjective. *Why it matters*: exactly the condition under which a function can be perfectly undone — every output came from exactly one input, and every declared possible output actually occurs.
- **codomain** — the set of values a function is declared to produce results within, which may include values the function never actually returns. *Why it matters*: distinct from *range* (the values a function's outputs actually are) — the gap between the two is precisely what "not surjective" means.

**Objects and methods used**: None new. This lesson reuses `contains?` (already covered) applied to relations built exactly as in the previous lesson — the new content is a classification system for relations already representable with existing tools.

---

## Concept Unit: A Function Is a Relation With One Rule Added

### The Problem

The previous lesson's `has-account` related `"alice"` to *both* `"checking"` and `"savings"` — two different pairs sharing the same first element. Lesson 4 called `square` a function, and `square` never gives two different answers for the same input. What exact rule separates a relation like `has-account`, which can't be called the way `square` is called, from one that can?

### Introduce the concept in isolation

```clojure
(def square-relation #{[1 1] [2 4] [3 9] [-1 1] [-2 4]})
```

```
user=> (contains? square-relation [2 4])
true
user=> (contains? square-relation [2 5])
false
```

Inspect `square-relation`'s pairs: `1→1`, `2→4`, `3→9`, `-1→1`, `-2→4`. Every first element appears in exactly one pair — `2` is only ever paired with `4`, never with anything else. Compare this to `has-account`, where `"alice"` appeared as the first element of *two* pairs, `["alice" "checking"]` and `["alice" "savings"]`. That's the entire difference: a relation is **single-valued** when no domain element appears as the first element of more than one pair — and a single-valued relation is precisely what this series has been calling a function since it first used `defn`.

Notice `-1` and `1` both map to `1` — two *different* domain elements sharing the *same* range element. This is still allowed under single-valuedness (the restriction is about one input never having two different outputs, not about two inputs sharing one output) — a distinction this lesson returns to directly once injective functions are defined.

### Discard the throwaway example

REPL-only, same as prior lessons' early examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def square-relation #{[1 1] [2 4] [3 9] [-1 1] [-2 4]})
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`#{[1 1] [2 4] ...}`** — a set of ordered pairs, built exactly the same way as the previous lesson's relations; the only fact worth restating is that this particular set happens to satisfy single-valuedness, a property of *which* pairs were chosen, not of the syntax used to write them.

### Formal Definition, Walked Through

> A relation *R* is a **function** if it is **single-valued**: for every *a* in its domain, there is exactly one *b* such that *(a, b)* is a member of *R*.

- *"exactly one b"* — not "at most one" and not "at least one." A relation missing pairs for some domain elements entirely is addressed by the next unit (partial functions); this definition, on its own, is about what happens *for elements that do appear* — each gets exactly one partner, never a choice between two.

### CS Lens

Single-valuedness is exactly what a spreadsheet formula guarantees for any one cell (one formula, one resulting value — never two candidate values competing for the same cell) and what a dictionary lookup guarantees for a well-formed dictionary (one key, one definition — a dictionary with two conflicting definitions for the same word listed as if both were "the" definition would be a broken dictionary, the same way a non-single-valued relation isn't a function). Also recognized in: a vending machine's price list (each product code maps to exactly one price, never two).

### SE Lens

Recognizing that `defn` has been quietly enforcing single-valuedness this whole time — a Clojure function genuinely cannot return two different values for one call, only one — is what makes the earlier, informal use of "function" in this series retroactively precise: nothing about Lesson 4's functions needs correcting now that the formal definition has arrived; the formal definition simply names the guarantee that was already there.

---

## Concept Unit: Total vs. Partial Functions

### The Problem

`square-relation`'s domain is exactly `{1, 2, 3, -1, -2}` — whatever pairs happen to be listed. What about a function like reciprocal, `1/x`, where `x = 0` produces no valid answer at all? Is "reciprocal" still a function over the domain of all numbers, given there's a value it can't handle?

### Introduce the concept in isolation

```clojure
(def reciprocal-relation #{[1 1] [2 1/2] [4 1/4] [-2 -1/2]})
```

Every pair here is single-valued — reciprocal is a genuine function over the specific domain `{1, 2, 4, -2}`. But `0` was deliberately left out: there's no pair `[0 ...]`, because there's no valid reciprocal of zero. If the *intended* domain were "every number," reciprocal would be undefined at exactly one point within it.

This is the distinction: a **total function** is defined for every element of its *stated* domain, with no gaps — `reciprocal-relation`, restricted to `{1, 2, 4, -2}`, is total, because every one of those four values has a pair. The same reciprocal rule, if its stated domain were claimed to be "every number," would be a **partial function** — defined for most of that domain, but not all of it, with `0` as the specific gap.

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
(def reciprocal-relation #{[1 1] [2 1/2] [4 1/4] [-2 -1/2]})
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Formal Definition, Walked Through

> A function *f* with intended domain *D* is **total** if it is defined for every element of *D*, and **partial** if there exists some element of *D* for which it is undefined.

- *"intended domain"* — total and partial are always relative to a *claimed* domain, not some absolute fact about the function's rule alone: reciprocal is total over `{1, 2, 4, -2}` (every claimed element has an answer) and partial over "all numbers" (one claimed element, zero, doesn't). Stating the domain honestly is what makes the distinction meaningful at all.

### CS Lens

Partiality is the mathematical shape behind a real, everyday programming hazard: division by zero, an array index outside a collection's bounds, or looking up a key that isn't present — each is a function whose *implementation* accepts a domain wider than its *rule* can actually handle. Lesson 187 (*Integer Representation*) and Lesson 282 (*Error Handling*) both return to exactly this gap, at greater depth, later in this series.

### SE Lens

The alternative to naming a function's true domain honestly is letting its partiality surface only as a crash or an incorrect result, discovered whenever an out-of-domain input first happens to occur — the exact "technically valid, silently wrong (or silently broken)" failure this series has been naming since the very first lesson. Stating a function's real domain up front, and treating it as total *over that stated domain* rather than pretending it's total over a wider one, is the more honest and more checkable choice.

### Connection to the previous unit

The previous unit established what makes a relation single-valued *for the elements it covers*; this unit asks the separate question of whether it covers *every* element it claims to.

---

## Concept Unit: Injective Functions (One-to-One)

### The Problem

`square-relation` mapped both `1` and `-1` to `4`... to `1`, and both `2` and `-2` to `4`. Given an output of `1` from that relation, is there a way to know for certain which input produced it?

### Introduce the concept in isolation

```
square-relation: 1→1, 2→4, 3→9, -1→1, -2→4
```

Given the output `1`, there are *two* possible inputs that could have produced it: `1` or `-1`. There's no way to recover the original input from the output alone — the output `1` doesn't uniquely identify where it came from. Compare a different function over the same rough domain, doubling instead of squaring:

```clojure
(def double-relation #{[1 2] [2 4] [3 6] [-1 -2] [-2 -4]})
```

Here, every output is produced by exactly one input: `2` only ever comes from `1`, `4` only ever comes from `2`, `-2` only ever comes from `-1`. Given any output this relation actually produces, the input that produced it can always be uniquely determined.

This is the difference: `double-relation` is **injective** (one-to-one) — distinct inputs always produce distinct outputs. `square-relation` is not — two distinct inputs, `1` and `-1`, produced the identical output.

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
(def double-relation #{[1 2] [2 4] [3 6] [-1 -2] [-2 -4]})
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Formal Definition, Walked Through

> A function *f* is **injective** if, for all *a₁* and *a₂* in its domain, *f(a₁) = f(a₂)* implies *a₁ = a₂*.

- *"implies"* — this is Lesson 7's implication, precisely: the claim isn't "different inputs happen not to collide" for the examples checked so far, it's a guarantee holding for *every* pair of inputs — the same all-or-nothing strength Lesson 9's universal quantifier already established for "for all."
- Checking `square-relation`'s two pairs `[1 1]` and `[-1 1]` directly: `f(1) = f(-1) = 1`, but `1 ≠ -1` — the implication's premise held, and its conclusion didn't, which is exactly what makes an implication false (Lesson 7's own truth table for implication: true premise, false conclusion, is the one case where the whole implication fails) — one clean counterexample, disproving injectivity for `square-relation` completely.

### CS Lens

Injectivity is exactly the property a hash function needs to *not* have collisions (Lesson 89, *Hash Tables*, examines what happens when it does), the property a serial number or a database primary key is specifically designed to guarantee (no two records ever share one), and the property that makes a cryptographic function reversible only with the right key, rather than by anyone who merely sees the output.

### SE Lens

Whether a transformation needs to be injective depends entirely on what it's used for: a login system mapping usernames to session identifiers needs injectivity (two different users must never receive session identifiers that collide); a function that buckets ages into ranges like "18-25" deliberately isn't injective, and that's correct, not a flaw — many different ages are supposed to map to the same bucket. Demanding injectivity where it isn't needed adds a constraint the problem never required; failing to demand it where it *is* needed is a real, serious bug.

### Connection to the previous unit

The previous unit asked whether every input has an output; this unit asks a different question about the outputs themselves — whether they ever collide — independent of whether the function is total or partial.

---

## Concept Unit: Surjective Functions (Onto) and Bijections

### The Problem

`double-relation`'s outputs, so far, are `{2, 4, 6, -2, -4}` — every one of them even. If this function's *declared* codomain were "every integer," does it actually reach all of them?

### Introduce the concept in isolation

```
double-relation's actual outputs (its range): {2, 4, 6, -2, -4} — every one even.
Declared codomain: "every integer" — includes 1, 3, 5, -1, -3, and every other odd number.
```

No odd number is ever produced by doubling anything — `double-relation`'s range is a strict subset of its declared codomain, not the whole thing. This is the distinction between range and **codomain**: the codomain is what a function is *declared* to produce results within; the range is what it *actually* produces. When they match exactly — every declared possible output genuinely occurs for some input — the function is **surjective** (onto). Doubling, with codomain "every integer," is not: odd numbers are declared reachable but never actually reached.

A function that is both injective (Concept Unit 3: no two inputs collide) and surjective (every declared output is actually reached) is called **bijective**. A bijective function can be perfectly reversed: every output came from exactly one input (injective), and every value in the codomain has *some* input that reaches it (surjective) — nothing missing, nothing ambiguous.

### Discard the throwaway example

REPL-only — this unit works entirely from the relations already built in this lesson, reasoned about rather than run.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: None beyond what's already installed — this unit's content is definitional, not new code.

### Formal Definition, Walked Through

> A function *f: A → B* (from domain *A* to codomain *B*) is **surjective** if, for every *b* in *B*, there exists some *a* in *A* such that *f(a) = b*. A function that is both injective and surjective is **bijective**.

- *"for every b... there exists some a"* — a universal quantifier (Lesson 9) over the codomain, wrapping an existential quantifier over the domain: for *every* declared possible output, *some* input reaches it. Both halves of Lesson 9's vocabulary, nested inside a single definition.
- Surjectivity, unlike injectivity, depends on the *codomain*, not just the function's rule: doubling is surjective onto "every even integer" (its own actual range) but not onto "every integer" — the identical rule, judged surjective or not depending entirely on what was declared reachable.

### CS Lens

Bijections are exactly what a lossless, reversible encoding needs — Lesson 190 (*Text Encoding*) and Lesson 224 (*Logging and Recovery*) both depend on transformations that can be undone perfectly, which is only guaranteed when the transformation is bijective. Also recognized in: a coat-check system (bijective, when working correctly — each coat gets exactly one ticket, each ticket returns exactly one coat, and every ticket issued corresponds to some coat actually on a hook), and a phone book with no shared numbers and no unlisted numbers (each name maps to exactly one number, and no valid number is missing).

### SE Lens

Claiming a transformation is reversible without checking whether it's actually bijective is a real, recurring mistake: a "compress this data" function that isn't injective (two different inputs compress to the same output) can never be reliably decompressed, no matter how carefully the decompression code is written — the information needed to distinguish the two original inputs was destroyed at the compression step, not lost somewhere in the decompression logic. Knowing to ask "is this actually injective" *before* trusting a reversal is possible saves discovering the failure the hard way, after data is already gone.

### Connection to the previous unit

The previous unit defined injectivity, about the domain side of a function's behavior; this unit defines surjectivity, the matching question about the codomain side, and combines both into the single strongest guarantee a function can offer — that it's perfectly, unambiguously reversible.

---

## Connect the Pieces

Classify three relations from this lesson against every property covered, in one place:

| Relation | Single-valued? | Total (over its stated domain)? | Injective? | Surjective (onto "all integers")? |
|---|---|---|---|---|
| `has-account` (previous lesson) | No — alice has two pairs | N/A — not a function at all | N/A | N/A |
| `square-relation` | Yes | Yes, over `{1,2,3,-1,-2}` | No — `1` and `-1` both map to `1` | No — never produces a negative number |
| `double-relation` | Yes | Yes, over `{1,2,3,-1,-2}` | Yes — no two inputs share an output | No — never produces an odd number |

`has-account` fails the very first test — it was never a function to begin with, so none of the later questions even apply, the same way Concept Unit 1 defined single-valuedness as the entry requirement before anything else in this lesson makes sense to ask. `square-relation` and `double-relation` are both genuine functions, both total over the small domains shown, and both fail surjectivity onto "all integers" for different reasons — one because outputs collide (not injective), the other because half the codomain is unreachable by construction (never negative or never odd) even without any collision at all.

## What Breaks Without This

Suppose someone tried to build an "un-square" function — given an output, recover the input — by just picking whichever input happened to be listed first in `square-relation`:

```
square-relation: 1→1, 2→4, 3→9, -1→1, -2→4
"Un-square" 1, picking the first match found: 1
```

This looks reasonable until the missing case is checked directly: `square-relation` also contains `[-1 1]` — an equally valid input that produces the same output `1`. "Pick the first match" silently discards the fact that `-1` was an equally correct answer, producing *a* result without any way to know or signal that it wasn't the *only* possible one. This is Concept Unit 3's injectivity failure, made concrete: a reversal only has a single correct answer to return when the original function was actually injective — attempting to reverse a non-injective function doesn't fail loudly, it quietly picks one of several equally valid answers and presents it as if it were the only one.

## Exercises

1. **Trace.** Build a relation, as a set of pairs, for "absolute value" over the domain `{-2, -1, 0, 1, 2}`. Is it single-valued? Is it injective? Justify both answers from the pairs themselves.
2. **Predict.** Before checking, predict whether "absolute value" over that same domain is surjective onto "all non-negative integers up to 2." Then verify by listing its actual range.
3. **Classify.** Take `has-account` from the previous lesson and turn it into a genuine function by removing exactly one pair. Which pair did you remove, and is the result total over its new, smaller domain?
4. **Break it, on purpose.** Using `square-relation`, write down what a naive "un-square" function would return for an input it wasn't designed to handle correctly, and explain, using this lesson's vocabulary, exactly why it's unreliable.
5. **Generalize.** Is `reciprocal-relation` (`{[1 1] [2 1/2] [4 1/4] [-2 -1/2]}`) injective? Is it surjective onto "all positive and negative fractions"? Justify each answer.
6. **Reconstruct.** Close this lesson. From memory, state the four properties this lesson defined — single-valued, total/partial, injective, surjective — and, for each, one sentence on what real-world consequence it has if a function fails to have it.

## Definition of Done

- [ ] You can state, from memory, the exact rule that distinguishes a function from a general relation.
- [ ] You can classify a small, given relation as total or partial, injective or not, and surjective or not, over a stated codomain.
- [ ] You completed Exercise 3, turning a non-function relation into a genuine function by removing exactly the pairs needed.
- [ ] You can explain, precisely, why a non-injective function cannot be reliably reversed — not just that it "loses information," but which specific guarantee (Concept Unit 3's definition) fails.
- [ ] Commit your Exercise 1 and Exercise 2 relations (absolute value, classified) to your notes repository, with a commit message stating which of the four properties it has and lacks — for example, `"Classify abs-value relation over {-2..2}: single-valued and total, not injective (2 and -2 collide), not surjective onto negatives"` — not just `"lesson 12 exercise"`.

---

**Next lesson:** Lesson 13, *Algebraic Manipulation*, shifts from classifying relationships to actually reshaping expressions — rearrangement, factoring, substitution, and solving equations, treated as computational tools this series will use constantly from here forward, not as remembered school exercises.
