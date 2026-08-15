# Lesson 27: Recursive Definitions

**What you will build:** Still nothing runnable — this lesson names a way of defining something precisely in terms of a smaller version of itself, rather than by writing out an explicit rule that works the same way for every size. The transferable problem this lesson is actually about: some quantities are far more natural to define by relating a case to a slightly smaller case of the exact same problem than by trying to describe every case uniformly from scratch — and this curriculum has not yet had a precise way to write a definition like that down.

**What you need to know first:** Lesson 21 (`FP-L021-finite-and-infinite-thinking.md`) — specifically the risk of a process that never terminates, revisited directly in Concept Unit 4. Lesson 23 (`FP-L023-direct-proof.md`) — specifically the technique of *unfolding* a definition, reused directly and by name in Concept Unit 3. Lesson 26 (`FP-L026-repetition-and-iteration.md`) — specifically *summation* and *stopping condition*, both reused directly.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Recursive definition** — a definition with two parts: a base case, defining the smallest or simplest instance directly, with no self-reference; and a recursive case, defining every other instance in terms of a strictly smaller instance of the exact same thing being defined. `n! = n × (n − 1)!` for `n > 0`, together with `0! = 1`, is a recursive definition of the factorial.
- **Base case** (of a recursive definition) — the part of a recursive definition that is defined directly, without reference to the thing being defined, providing the place unfolding a recursive definition eventually stops. `0! = 1` is factorial's base case.
- **Recursive case** — the part of a recursive definition that defines an instance in terms of a strictly smaller instance of the same thing, rather than directly. `n! = n × (n − 1)!` is factorial's recursive case.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using the factorial and a sum-of-the-first-`n`-numbers function.

---

## Concept Unit 1: Some Things Are Naturally Defined in Terms of Themselves

### The Problem

The factorial of `5`, written `5!`, is `5 × 4 × 3 × 2 × 1 = 120` — an explicit product, exactly Lesson 26's explicit repetition. But look closely at that product: `4 × 3 × 2 × 1` is exactly `4!`. So `5! = 5 × 4!`. This is not a coincidence specific to `5` — `4! = 4 × 3!`, `3! = 3 × 2!`, and so on. Each factorial can be described directly in terms of the factorial one smaller than it, rather than as a fresh product built from scratch every time.

### No isolated lab for this step

This concept has no code of its own to isolate — the self-referential pattern in factorial is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Noticing the Pattern in Factorial

**`5!`, written explicitly, per Lesson 26:** `5 × 4 × 3 × 2 × 1 = 120`.

**The same product, with its trailing four terms recognized as `4!`:** `5! = 5 × (4 × 3 × 2 × 1) = 5 × 4!`.

**Confirming the pattern continues:** `4! = 4 × 3!`; `3! = 3 × 2!`; `2! = 2 × 1!`; `1! = 1 × 0!` — with `0!` needing its own, separately stated value, since there's no smaller factorial left to refer to.

**Naming what's been noticed, precisely:** `n!` can be described as `n` multiplied by `(n − 1)!` — a smaller instance of the exact same thing being defined — for every `n` above some smallest starting point.

### Walkthrough

- **`5! = 5 × 4!`** — establishes the self-referential pattern concretely, using a number already familiar from Lesson 26's own explicit-repetition discussion.
- **The chain continuing down to `1! = 1 × 0!`** — confirms the pattern holds at every step, not just the first one noticed.
- **"`0!` needing its own, separately stated value"** — not a new concept yet, but a direct foreshadowing of Concept Unit 2's base case, arising naturally from following the pattern as far as it can go.

### CS Lens

This is the recognition that a problem's solution can sometimes be described directly in terms of the same problem, solved for a smaller instance — the seed idea behind everything this curriculum will call recursion from this lesson forward. Also recognized in: a Russian nesting doll, each one containing a slightly smaller copy of the exact same kind of doll; a family tree, where a person's full ancestry is described as themselves plus their parents' full ancestries, each a smaller instance of the same "ancestry" structure; a company's org chart, where a manager's team size is their direct reports plus the sum of each direct report's own team size; a set of instructions that says "do this step, then follow these same instructions again, but for a smaller version of the problem."

### SE Lens

The alternative to noticing this self-referential structure is to keep treating every factorial as an independent explicit product, computed from scratch, the way Lesson 26's explicit repetition originally described `5!`. The real cost of that alternative is exactly the same repetition Lesson 7 first identified: nothing connects the calculation of `5!` to the calculation of `4!`, even though the second is, quite literally, most of the work already done for the first. Noticing and naming the self-referential pattern, as this unit does, costs nothing beyond looking closely at an already-familiar example; it sets up a definition, in Concept Unit 2, that states this relationship once, rather than leaving it as an incidental observation.

---

## Concept Unit 2: Recursive Definition — Base Case and Recursive Case

### The Problem

Concept Unit 1 noticed a pattern; it hasn't yet stated a complete, precise definition built from it. A complete definition needs to say two things: what happens at the smallest case, where the pattern runs out of anything smaller to refer to, and what happens everywhere else, where the pattern applies.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete recursive definition is stated directly below, not through a construct with its own syntax.

### Applying It — the Complete Definition of Factorial

**The base case, defined directly, with no reference to factorial on its right-hand side:**

> `0! = 1`

**The recursive case, defined in terms of a smaller factorial:**

> `n! = n × (n − 1)!`, for every whole number `n > 0`

**Confirming these two parts, together, define `n!` for every whole number:** `0!` is answered directly by the base case. `1!` is answered by the recursive case, which needs `0!` — already answered directly. `2!` needs `1!` — already answered. Every whole number's factorial, checked this way, is eventually answered, either directly (only `0`) or by reference to a smaller whole number's factorial, which is itself eventually answered the same way.

**Naming the two parts precisely:** `0! = 1` is factorial's base case; `n! = n × (n − 1)!` is its recursive case. Together, they are a recursive definition.

### Walkthrough

- **`0! = 1`** — first appearance of *base case*, stated as a direct fact requiring no reference to factorial itself.
- **`n! = n × (n − 1)!`, for `n > 0`** — first appearance of *recursive case*, stated precisely, with the restriction `n > 0` doing real work: it's exactly what keeps this case from ever trying to apply to the base case's own domain.
- **The check that every whole number is eventually answered** — not a new concept, but a direct confirmation, following Lesson 14's exhaustive-checking spirit, that the two parts together actually cover every case, rather than merely looking complete.
- **"a recursive definition"** — first appearance of the lesson's central term, defined by exactly this two-part structure.

### CS Lens

This is the standard shape every recursive definition in this curriculum will follow from here forward: exactly one (or more) base cases, handled directly, and a recursive case, relating every other instance to a smaller one. Also recognized in: a mathematical definition of a sequence, stating its first term directly and every later term in relation to the one before it; a legal definition of "descendant," defining a person's children directly as descendants, and defining a descendant's own children as descendants too; a computer file system's directory structure, where an empty folder is the base case and a folder containing other folders is defined in terms of those (smaller) contained folders; a company's reporting structure, where an individual contributor with no reports is the base case, and a manager's team is defined in terms of their direct reports' own teams.

### SE Lens

The alternative to stating both parts explicitly is to state only the recursive case, on the assumption that "obviously" it stops somewhere, the same optimistic assumption Lesson 26, Concept Unit 4, already warned against for repeated application without a stopping condition. The real cost of that alternative, applied to a definition rather than a process, is explored directly in Concept Unit 4 — for now, it's enough to note that stating the base case explicitly, as this unit does, costs one additional, simple fact; it is what keeps the recursive case from being an open-ended, self-referential statement with no actual anchor.

---

## Concept Unit 3: Unfolding a Recursive Definition to Compute a Value

### The Problem

A recursive definition states a *relationship* — `n!` in terms of `(n − 1)!` — but doesn't, by itself, show what `5!` actually equals as a number. Getting an actual value out of a recursive definition means applying the recursive case repeatedly, each time reducing the problem to a smaller one, until the base case is finally reached — precisely the technique Lesson 23 already named, when it unfolded the definition of *even* to build a direct proof.

### No isolated lab for this step

This concept has no code of its own to isolate — unfolding the recursive definition of factorial is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Unfolding 5!

**Starting from `5!`, applying the recursive case repeatedly, each time replacing a factorial with the recursive case's right-hand side:**

> `5! = 5 × 4!`
> `= 5 × (4 × 3!)`
> `= 5 × (4 × (3 × 2!))`
> `= 5 × (4 × (3 × (2 × 1!)))`
> `= 5 × (4 × (3 × (2 × (1 × 0!))))`

**Reaching the base case, and substituting its known value directly:** `0! = 1`, so the innermost expression becomes `5 × (4 × (3 × (2 × (1 × 1))))`.

**Reducing outward, exactly as Lesson 4's evaluation process already established, innermost first:** `1 × 1 = 1`; `2 × 1 = 2`; `3 × 2 = 6`; `4 × 6 = 24`; `5 × 24 = 120`.

**Confirming this matches Lesson 26's original explicit product:** `5 × 4 × 3 × 2 × 1 = 120` — the same value, reached this time by unfolding the recursive definition rather than by writing the explicit product directly.

### Walkthrough

- **The five-line unfolding, each line replacing one factorial with the recursive case** — first demonstration of unfolding applied to a recursive definition, using the exact verb Lesson 23 already established for unfolding a definition during a proof.
- **Reaching `0!` and substituting `1`** — confirms the base case is what actually stops the unfolding, exactly the role Concept Unit 2 assigned it.
- **The innermost-first reduction, `1 × 1`, then `2 × 1`, and so on** — a direct reappearance of Lesson 4's evaluation order for nested expressions, applied here to the fully unfolded product.
- **The match with `120`** — not a new concept, but confirmation that unfolding a recursive definition and computing the explicit product directly produce the identical result.

### CS Lens

This is the mechanical process of tracing a recursive definition down to its base case and back — the exact process a computer will eventually need to carry out automatically, once this curriculum reaches actual running code, but performed here entirely by hand to make every step visible. Also recognized in: manually tracing through a legal definition's cross-references until reaching a term that's defined in plain, non-referential language; manually following a set of nested cooking instructions ("prepare the sauce as in step 3, which itself requires preparing the reduction as in step 1") down to the first step that requires no further reference; manually tracing a company's reporting structure upward until reaching the CEO, who reports to no one; manually resolving a spreadsheet's chain of cell references, one formula referring to another, until reaching a cell containing a plain, directly entered number.

### SE Lens

The alternative to unfolding a recursive definition fully, by hand, before trusting it, is to accept the definition as self-evidently correct simply because its two parts look reasonable individually. The real cost of that alternative is exactly the risk Lesson 22 already warned about for any unverified claim: a recursive definition that looks correct can still fail to actually produce the intended values if its recursive case or base case is subtly wrong, and unfolding a specific example, all the way down, is the concrete check that catches this. Actually unfolding `5!` by hand, as this unit does, costs the five extra lines of substitution; it confirms, directly, that the recursive definition produces the same, already-known-correct answer as the explicit product it's meant to describe.

---

## Concept Unit 4: Why the Base Case Is Non-Negotiable

### The Problem

Concept Unit 3's unfolding stopped because it eventually reached `0!`, which the base case answered directly. It's worth confirming, explicitly, what would happen if that base case had never been stated at all — connecting this directly to Lesson 21's warning about processes with no natural stopping point.

### No isolated lab for this step

This concept has no code of its own to isolate — the consequence of a missing base case is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Unfolding Without a Base Case

**A deliberately incomplete "definition," with only the recursive case stated:**

> `n! = n × (n − 1)!`

**Attempting to unfold `5!` using only this incomplete definition, exactly as in Concept Unit 3:**

> `5! = 5 × 4! = 5 × (4 × 3!) = 5 × (4 × (3 × 2!)) = 5 × (4 × (3 × (2 × 1!))) = 5 × (4 × (3 × (2 × (1 × 0!))))`

**Continuing past where Concept Unit 3 stopped, since nothing here says to stop at `0!`:** `0! = 0 × (−1)!`. Continuing further: `(−1)! = (−1) × (−2)!`. This continues indefinitely — every step produces a smaller number, with no smallest number ever reached, since the whole numbers extend downward through the negative integers with no natural floor the way Lesson 21's natural numbers had no ceiling.

**Naming the consequence precisely, connecting directly to Lesson 21 and Lesson 26:** without a base case, unfolding `5!` never actually finishes — it produces an ever-longer chain of multiplications with nothing to substitute a final numeric value in for, the exact same failure to terminate Lesson 21 demonstrated for counting the naturals, and Lesson 26, Concept Unit 4, demonstrated for repeated application with no stopping condition.

**Stating the fix, precisely:** the base case is not an optional convenience — it is the only thing that gives a recursive definition an actual floor to unfold down to. Without one, "define `n!` in terms of `(n-1)!`" is not a complete definition of anything; it's an endlessly regressing relationship with no anchor.

### Walkthrough

- **The incomplete "definition," with only the recursive case** — deliberately constructed to expose exactly what a base case actually contributes.
- **The unfolding continuing past `0!` into negative numbers, with no natural stopping point** — demonstrates concretely that nothing about the recursive case alone provides a place to stop.
- **The explicit connections to Lesson 21 and Lesson 26** — reappearances of *infinite set*'s never-finishing counting and *stopping condition*'s necessity, both restated briefly and applied here to a definition rather than a process or a count.
- **"the base case is not an optional convenience... it is the only thing that gives a recursive definition an actual floor"** — not a new concept, but the precise, final statement of this unit's point.

### CS Lens

This is the fact that self-reference, on its own, describes a relationship but not a value — something has to break the self-reference at some definite point, or the relationship never actually resolves to anything concrete. Also recognized in: a spreadsheet formula that references itself (a cell computing its own value in terms of itself), which most spreadsheet software explicitly detects and refuses to evaluate, precisely because it has no natural stopping point; a legal definition that circularly defines a term partly in terms of itself with no independent anchor, leaving its actual meaning unresolved; a dictionary definition that defines a word using the word itself, providing no way for someone who doesn't already know the word to learn its meaning; an infinite regress in philosophical argument, where each justification depends on a prior justification with no foundational starting point ever reached.

### SE Lens

The alternative to insisting on an explicit base case is to assume a recursive case will "naturally" bottom out, the same unfounded optimism Lesson 26 already warned against for repeated application. The real cost of that alternative, made fully concrete by this unit's attempted unfolding of `5!` without one, is a definition that looks reasonable on paper and never actually produces a value for anything — not a subtly wrong answer, but no answer at all, ever, no matter how long the unfolding continues. Insisting on an explicit, independently-defined base case, as Concept Unit 2 already did and this unit now justifies directly, costs one additional stated fact; it is the entire difference between a recursive definition that resolves to real values and one that is, despite its reasonable appearance, not actually a complete definition of anything.

---

## Concept Unit 5: A Second Recursive Definition — Connecting Back to Summation

### The Problem

One worked example, factorial, might suggest recursive definitions are specific to products of decreasing numbers. A second example, built around addition instead, and deliberately checked against Lesson 26's summation notation, confirms the technique generalizes — and reveals that recursive definitions and Lesson 26's compact notations are, once again, two ways of describing the same thing.

### No isolated lab for this step

This concept has no code of its own to isolate — the second recursive definition, and its connection to summation, is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Sum of the First n Numbers

**The function, defined informally first:** `sum(n)` is the total of every whole number from `1` up to `n`.

**Lesson 26's summation notation for the same function:** `sum(n) = Σᵢ₌₁ⁿ i`.

**A recursive definition of the exact same function, base case and recursive case:**

> `sum(0) = 0`
> `sum(n) = n + sum(n − 1)`, for `n > 0`

**Unfolding `sum(4)`, using Concept Unit 3's exact technique:** `sum(4) = 4 + sum(3) = 4 + (3 + sum(2)) = 4 + (3 + (2 + sum(1))) = 4 + (3 + (2 + (1 + sum(0)))) = 4 + (3 + (2 + (1 + 0)))`. Reducing innermost first: `1 + 0 = 1`; `2 + 1 = 3`; `3 + 3 = 6`; `4 + 6 = 10`.

**Confirming this matches the summation form:** `Σᵢ₌₁⁴ i = 1 + 2 + 3 + 4 = 10` — the identical value, reached this time by unfolding a recursive definition rather than by writing out Lesson 26's explicit sum directly.

### Walkthrough

- **`sum(n) = Σᵢ₌₁ⁿ i`** — a reappearance of *summation* (Lesson 26), stated here as the already-familiar description of the function this unit is about to redefine recursively.
- **`sum(0) = 0` and `sum(n) = n + sum(n − 1)`** — a second complete recursive definition, structurally identical to factorial's (a base case, a recursive case referring to a smaller instance) but built from addition rather than multiplication.
- **Unfolding `sum(4)` to `10`, matching `Σᵢ₌₁⁴ i`** — confirms, concretely, that a recursive definition and Lesson 26's summation notation can describe the exact same function, the same kind of two-notations-one-idea finding Lesson 26, Concept Unit 5, already established for explicit repetition and repeated application.

### CS Lens

This is the confirmation that recursive definition is a general technique, not one tied to any particular operation — applicable to addition just as readily as to multiplication, and, as this curriculum will show in later lessons, applicable well beyond numbers entirely. Also recognized in: a recursively defined sequence like the Fibonacci numbers, built from addition, structurally identical to factorial despite the different underlying operation; a recursively defined string-length function, counting characters one at a time down to an empty string's base case; a recursively defined "total value of a shopping cart," relating a cart's total to the total of a cart with one fewer item; a recursively defined "depth of a folder structure," relating a folder's depth to the depth of its deepest subfolder.

### SE Lens

The alternative to working through a second example is to let factorial stand as the only demonstration of recursive definition, risking the impression that the technique is somehow specific to factorial or to multiplication. The real cost of that alternative is a narrower, less transferable understanding — a learner who has only ever seen factorial defined recursively might not recognize the same structure the next time it appears in a genuinely different setting. Working through `sum(n)` with the identical structure, and explicitly checking it against Lesson 26's summation notation, as this unit does, costs one additional worked example; it confirms the technique itself, not merely one lucky instance of it, is what's actually being learned.

---

## Closing

### Connect the pieces

Two functions, factorial and `sum`, traced through every unit built in this lesson, start to finish:

1. **The self-referential pattern noticed (Unit 1):** `5! = 5 × 4!`, with the pattern continuing down to `0!`.
2. **The complete recursive definition (Unit 2):** `0! = 1` (base case), `n! = n × (n − 1)!` (recursive case).
3. **Unfolding to compute a real value (Unit 3):** `5!` unfolded step by step down to `0!`, then reduced back up to `120`, matching Lesson 26's explicit product.
4. **The base case shown non-negotiable (Unit 4):** the recursive case alone, unfolded without a base case, shown to regress endlessly with no value ever produced.
5. **A second recursive definition, connected to summation (Unit 5):** `sum(n)`, structurally identical to factorial, unfolded to confirm it matches Lesson 26's `Σᵢ₌₁ⁿ i` exactly.

Unit 5's `sum(n)` is not disconnected from the rest of the lesson — it uses the identical two-part structure Unit 2 defined for factorial, checked against Unit 3's identical unfolding technique, and its result checked against a notation from an entirely earlier lesson, tying this lesson's new idea back into the curriculum's existing fabric rather than leaving it isolated.

### What breaks without this

Suppose a recursive definition were proposed for some new function, with real, urgent motivation behind it, and the person proposing it, confident the recursive case was correct, never actually checked for a stated, independent base case — the same omission Concept Unit 4 examined directly. Anyone attempting to actually compute a value from this definition — unfolding it the way Concept Unit 3 unfolded `5!` — would find the unfolding simply never stops, producing an ever-longer, never-resolving chain of operations, with no error message or obvious signal pointing at what's actually wrong, only a process that keeps going. Diagnosing this would require recognizing, specifically, that the *definition itself* is incomplete, not that some later step in using it went wrong — exactly the diagnosis Concept Unit 4 walked through directly, tracing the endless regress back to its actual cause: a recursive case with no base case to eventually reach. Restoring the discipline this lesson insists on — never accepting a recursive definition as complete until its base case has been explicitly identified and checked — catches this before any time is spent trying to unfold a definition that was never actually going to produce a value.

### Exercises

1. **Observe.** Find a quantity of your own (a running total, a nested structure, anything defined "in terms of a smaller version of the same thing") and describe, in prose, how a smaller instance relates to a larger one, the way Concept Unit 1 noticed `5! = 5 × 4!`.
2. **Formalize.** Write a complete recursive definition for your Exercise 1 quantity, with an explicitly stated base case and recursive case, the way Concept Unit 2 defined factorial.
3. **Formalize.** Unfold your Exercise 2 definition by hand for one specific, moderately sized case, the way Concept Unit 3 unfolded `5!`, showing every step down to the base case and back.
4. **Explain.** Remove your Exercise 2 definition's base case, and explain, precisely, what would happen if you tried to unfold your Exercise 3 case using only the recursive part — the way Concept Unit 4 traced the unbounded regress for factorial without `0! = 1`.
5. **Explain.** If your Exercise 1 quantity has a natural connection to an explicit, non-recursive notation (a sum, a product, a direct formula), state that connection and confirm your Exercise 3 unfolding matches it, the way Concept Unit 5 checked `sum(4)` against `Σᵢ₌₁⁴ i`.

### Definition of done

- [ ] You can state, in your own words, the two parts every recursive definition needs, and explain what each one contributes.
- [ ] You can unfold a recursive definition of your own by hand, down to its base case, and back up to a final value.
- [ ] You can explain, precisely, what happens when a recursive definition's base case is missing, using Lesson 21's vocabulary about processes with no natural stopping point.
- [ ] You can define two structurally different quantities (like factorial and `sum`) recursively, using the identical base-case-and-recursive-case shape for both.
- [ ] You completed Exercises 1–5 using a quantity of your own choosing, not factorial or `sum`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating what your Exercise 4 unfolding-without-a-base-case actually looked like, and at what point, if any, it became clear it would never stop.
