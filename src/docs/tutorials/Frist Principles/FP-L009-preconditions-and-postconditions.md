# Lesson 9: Preconditions and Postconditions

**What you will build:** Still nothing runnable — this lesson takes Lesson 1's *assumption* and *desired behavior*, and attaches them precisely to a function (Lesson 7): what a function requires to be true of its arguments before it runs, its *precondition*, and what it guarantees to be true of its result afterward, its *postcondition* — together, a *contract*. The transferable problem this lesson is actually about: Lesson 7's application mechanism — binding, substitution, reduction — never checks anything about the arguments it's given; it will happily compute a confident, fully-evaluated, meaningless result from arguments nobody should have supplied in the first place, unless something states, explicitly, what a function actually requires.

**What you need to know first:** Lesson 1 (`FP-L001-what-is-a-problem.md`) — specifically *assumption*, *constraint*, and *desired behavior*, all directly formalized in this lesson as they apply to functions specifically. Lesson 2 (`FP-L002-turning-ambiguity-into-precision.md`) — specifically *literal execution*, reused directly in Concept Unit 5. Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, *argument*, and *application*, all reused directly throughout.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Precondition** — a condition that must be true of a function's arguments before it is applied, in order for the function to be guaranteed to behave correctly. A precondition is Lesson 1's *assumption*, made precise and attached to a specific function's specific parameters, rather than left as a general, informal understanding about a computational problem.
- **Postcondition** — a condition guaranteed to be true of a function's result, provided its precondition held for the arguments it was applied to. A postcondition is Lesson 1's *desired behavior*, likewise made precise and attached to a specific function, stating exactly what the function promises to produce.
- **Contract** — a precondition and a postcondition, stated together, as an explicit deal between a function and whoever applies it: *if* you supply arguments satisfying the precondition, *then* the function guarantees a result satisfying the postcondition. A contract names both sides of this deal explicitly, rather than leaving either the caller's obligation or the function's guarantee to be assumed.
- **Contract violation** — applying a function to arguments that do not satisfy its precondition. A contract violation does not mean the function necessarily crashes or visibly fails — it means the function's postcondition guarantee simply no longer applies, and whatever the function actually produces, however confident-looking, carries no promise of being correct.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, examining Lesson 7's `total_with_tax` function closely.

---

## Concept Unit 1: What a Function Promises, and What It Requires

### The Problem

Lesson 7 defined `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate` and applied it correctly to sensible numbers — a positive subtotal, a tax rate between 0 and 1. Nothing in Lesson 7's application mechanism, though, actually checks that the arguments supplied are sensible at all. Binding, substitution, and reduction proceed identically whether `subtotal` is 8.20 or −8.20, whether `tax_rate` is 0.10 or −5.00 — every one of these produces some number, fully evaluated, with nothing about the process itself distinguishing a meaningful result from a meaningless one. Lesson 1 already named the fix for exactly this shape of gap — stating assumptions and desired behavior explicitly — but never yet attached that fix to a function's actual parameters and actual result. That attachment is this lesson's job.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that Lesson 7's application mechanism performs no checking of its own is a matter of reviewing that mechanism closely, not a construct with its own syntax.

### Applying It — Total With Tax

**`total_with_tax`, applied to arguments nobody should reasonably supply, mechanically, with no complaint:**

> `total_with_tax(−8.20, −5.00)`

Binding `subtotal → −8.20` and `tax_rate → −5.00`, substituting into the body: `−8.20 + (−8.20) × (−5.00)`. Reducing: `(−8.20) × (−5.00)` becomes `41.00`; `−8.20 + 41.00` becomes `32.80`. The function reports a total of $32.80, computed from a negative subtotal and a negative tax rate — numbers that should never describe an actual receipt at all.

**What this demonstrates, stated plainly:** nothing malfunctioned. Every step Lesson 7 established — binding, substitution, reduction — ran exactly as designed, and produced a fully evaluated, confident-looking number. The problem is not that the mechanism broke; it's that the mechanism was never designed to check whether its inputs made sense in the first place.

### Walkthrough

- **`total_with_tax(−8.20, −5.00)`** — deliberately chosen arguments outside anything a real receipt could produce, to expose what Lesson 7's mechanism does and does not check.
- **The full binding/substitution/reduction sequence, reappearing unchanged from Lesson 7** — confirms that nothing about the mechanism itself distinguishes sensible arguments from nonsensical ones; it treats both identically.
- **"$32.80, computed from a negative subtotal and a negative tax rate"** — not a new concept, but the concrete demonstration this unit exists to provide: a fully mechanical, fully "correct by Lesson 7's own rules" result that is nonetheless meaningless.

### CS Lens

This is the gap between a mechanism working correctly, by its own internal rules, and that mechanism's output actually meaning anything — the same gap Lesson 4 found between a well-formed expression and one that evaluates to a sensible value. Also recognized in: a calculator that will happily compute with numbers a user mistyped, with no way to know they were mistyped; a mathematical formula that produces a numeric answer even when its inputs violate an assumption the formula's derivation depended on; a vending machine that dispenses a snack for an input it was never designed to receive, if that input happens to satisfy its mechanism by accident; a translation performed word-for-word, grammatically correct, that nonetheless means nothing like the original sentence.

### SE Lens

The alternative to stating what a function requires is to trust that it will only ever be applied to sensible arguments, because that's how its author pictured it being used. The real cost of that alternative is that "sensible" lives only in the author's head — nothing in the function itself communicates it to anyone else, and Concept Unit 1's demonstration shows exactly what happens when that unstated expectation is violated: a wrong answer, produced with just as much apparent confidence as a right one. Stating requirements explicitly, the subject of the rest of this lesson, costs the work of writing them down once; leaving them implicit defers the discovery of a violated expectation to whoever eventually notices the output doesn't make sense — if anyone does.

---

## Concept Unit 2: Precondition — What Must Be True Before

### The Problem

Concept Unit 1's nonsensical result came from a negative subtotal and a negative tax rate — but "nonsensical" was only ever stated informally, in prose. Lesson 1 already provided the right shape of tool for this: an assumption, a condition taken as given, not checked by the procedure itself. What's needed now is to state that assumption precisely, in terms of `total_with_tax`'s actual parameters, so that "sensible arguments" stops being a vague feeling and becomes something that can be checked against any specific pair of numbers.

### No isolated lab for this step

This concept has no code of its own to isolate — stating a precondition precisely is demonstrated directly below, applying Lesson 1's assumption to Lesson 7's specific parameters, not through a construct with its own syntax.

### Applying It — Total With Tax

**The precondition for `total_with_tax(subtotal, tax_rate)`, stated precisely:**

> - `subtotal ≥ 0`
> - `0 ≤ tax_rate < 1`

**Checking Lesson 7's original, sensible application against this precondition:** `total_with_tax(8.20, 0.10)` — `8.20 ≥ 0` holds; `0 ≤ 0.10 < 1` holds. Both conditions of the precondition are satisfied.

**Checking Concept Unit 1's problematic application against the same precondition:** `total_with_tax(−8.20, −5.00)` — `−8.20 ≥ 0` fails immediately. The precondition is not satisfied, and this can now be said precisely, rather than only informally: this specific application violates a specific, stated condition.

### Walkthrough

- **`subtotal ≥ 0`** — first appearance of a precondition's first clause, restating Lesson 1's *assumption* for this specific parameter: a subtotal is never negative in any real receipt.
- **`0 ≤ tax_rate < 1`** — a second precondition clause, restating the same idea for the other parameter: a tax rate is never negative, and (for the purposes of this lesson's example) never as large as or larger than the whole subtotal itself.
- **Checking `total_with_tax(8.20, 0.10)` against both clauses** — confirms the precondition is stated precisely enough to be checked, not merely asserted, against a specific application already known to be sensible.
- **Checking `total_with_tax(−8.20, −5.00)` and finding the first clause fails** — demonstrates the precondition doing its actual job: distinguishing, precisely, the application from Concept Unit 1 as one that should never have been trusted.

### CS Lens

This is the idea of stating, precisely and in advance, exactly what must already be true for a piece of reasoning or computation to be trusted — Lesson 1's *assumption*, now attached to a specific, checkable interface. Also recognized in: a function's documented precondition in any well-specified library, stating exactly what its parameters must satisfy; a mathematical theorem's stated hypotheses, without which its proof does not apply; a recipe's stated prerequisite ("oven preheated to 350°F") before its actual steps begin; a legal contract's stated conditions precedent, which must be satisfied before either party's obligations under the contract take effect.

### SE Lens

The alternative to stating a precondition precisely is to leave it as an informal sense of "reasonable input" that lives only in the function's author's head, exactly as Concept Unit 1 found. The real cost of that alternative is that a precise, checkable question — does this specific application satisfy what the function actually requires? — cannot even be asked, let alone answered, without a stated precondition to check against. Writing the precondition down costs the small effort of naming, explicitly, what was probably already assumed implicitly; it buys the ability to check any future application against a stated standard rather than a guess.

---

## Concept Unit 3: Postcondition — What Must Be True After

### The Problem

Stating what `total_with_tax` requires is only half the deal. The other half is stating what it promises in return, once its precondition is actually satisfied — not just "it computes `subtotal + subtotal × tax_rate`," which only restates the function body, but a guarantee stated independently of the body's exact mechanics, the kind a caller could check without re-deriving the whole calculation themselves. Lesson 1 already named this half too: desired behavior, the precise relationship a correct output must have to its input.

### No isolated lab for this step

This concept has no code of its own to isolate — stating a postcondition precisely is demonstrated directly below, applying Lesson 1's desired behavior to Lesson 7's specific result, not through a construct with its own syntax.

### Applying It — Total With Tax

**The postcondition for `total_with_tax(subtotal, tax_rate)`, given that its precondition holds:**

> The result equals `subtotal + subtotal × tax_rate`, and the result is never less than `subtotal`.

**Why the second clause is worth stating on its own, separately from restating the formula:** it is a consequence of the precondition and the formula together — if `tax_rate ≥ 0` and `subtotal ≥ 0`, then `subtotal × tax_rate ≥ 0`, so adding it to `subtotal` cannot make the result smaller. Stating this directly gives a caller an independent, easy way to sanity-check any result without re-deriving the whole calculation: if a computed total ever came back smaller than the subtotal that produced it, something has clearly gone wrong, whether or not the exact arithmetic is re-checked.

**Checking a sensible application against both postcondition clauses:** `total_with_tax(8.20, 0.10) = 9.02`. First clause: `9.02` does equal `8.20 + 8.20 × 0.10`. Second clause: `9.02 ≥ 8.20` holds. Both are satisfied.

### Walkthrough

- **"the result equals `subtotal + subtotal × tax_rate`"** — first appearance of a postcondition's first clause, restating the function body itself as the primary guarantee.
- **"the result is never less than `subtotal`"** — a second postcondition clause, not a restatement of the body but a derived consequence of it together with the precondition — first appearance of a postcondition stating something checkable *without* re-deriving the underlying arithmetic.
- **Checking `9.02` against both clauses** — confirms the postcondition is precise enough to verify against an actual result, the same way Concept Unit 2's precondition was checked against actual arguments.

### CS Lens

This is the idea of stating, precisely, what a computation guarantees about its result — Lesson 1's *desired behavior*, now attached to a specific function's actual output, and stated in a form that can be checked independently of re-deriving the computation itself. Also recognized in: a function's documented postcondition in a formal contract, checkable by a caller without re-implementing the function; a manufacturing quality check, verifying a finished part meets its specification without re-deriving the entire manufacturing process from scratch; a mathematical theorem's conclusion, checkable as a specific statement even by someone who has not followed every step of its proof; a receipt's printed total, checkable by a customer doing simple arithmetic without needing to know how the register computed it internally.

### SE Lens

The alternative to stating an independently checkable postcondition is to trust that a function's result is correct simply because the function ran and produced *some* number. The real cost of that alternative is exactly Concept Unit 1's demonstration: a fully mechanical, fully "successful" execution can still produce a result nobody should trust, and without a postcondition stating what a *correct* result must look like, there is no fast, independent way to catch that a specific result is suspicious. Stating a postcondition, including a derived consequence like "never less than `subtotal`," costs the effort of working out what should always be true of a correct result; it buys a quick, independent sanity check that doesn't require re-verifying the entire calculation every single time.

---

## Concept Unit 4: The Contract — Precondition and Postcondition Together

### The Problem

Concept Units 2 and 3 stated two separate things: what `total_with_tax` requires, and what it promises. Left as two separate statements, it would be easy to lose sight of how they actually relate — the promise is not unconditional; it depends entirely on the requirement having been met first. Stating both together, as a single deal with an explicit *if* and *then*, makes that dependency impossible to miss.

### No isolated lab for this step

This concept has no code of its own to isolate — stating a contract as a single combined statement is demonstrated directly below, assembling Concept Units 2 and 3, not through a new construct with its own syntax.

### Applying It — Total With Tax

**The full contract for `total_with_tax(subtotal, tax_rate)`, precondition and postcondition combined:**

> **If** `subtotal ≥ 0` and `0 ≤ tax_rate < 1` (precondition), **then** the result equals `subtotal + subtotal × tax_rate` and is never less than `subtotal` (postcondition).

**Reading this as a deal, with each side's obligation named explicitly:** the caller's obligation is to supply arguments satisfying the precondition; the function's guarantee, in return, is a result satisfying the postcondition — but only once the caller has held up their side.

**Confirming this matches every application already checked in this lesson:** `total_with_tax(8.20, 0.10)` satisfies the precondition, and its result, `9.02`, satisfies the postcondition — the contract held, on both sides. `total_with_tax(−8.20, −5.00)` fails the precondition from the very first clause — the caller never held up their side, so the contract makes no promise about the result at all, regardless of what number actually came out.

### Walkthrough

- **"If... then..." — the combined statement** — first appearance of *contract*: precondition and postcondition, stated together as a single conditional deal rather than as two independent facts.
- **"the caller's obligation... the function's guarantee, in return"** — not a new concept, but the explicit naming of each side of the deal a contract states, making clear that the postcondition's guarantee is conditional, not automatic.
- **Rechecking both of this lesson's applications against the full contract** — confirms the contract correctly accounts for both the sensible case (Concept Units 2 and 3) and the problematic one (Concept Unit 1), in a single unified statement.

### CS Lens

This is the idea of an explicit, two-sided deal governing an interaction — obligations on one side, guarantees on the other, with the guarantee only binding once the obligation is met. Also recognized in: a software interface's documented contract, stating exactly what a caller must provide and what the interface promises back; a warranty on a purchased product, valid only if the product was used according to its stated conditions; an insurance policy, paying out only if the policyholder met the stated conditions of coverage; a legal contract in the ordinary sense, binding each party to obligations only once the other party's own obligations have been satisfied.

### SE Lens

The alternative to stating a full contract is to state a precondition and a postcondition, if either is stated at all, as separate, disconnected facts, leaving their relationship implicit. The real cost of that alternative is that "the postcondition holds" can be misread as an unconditional promise, when it was only ever conditional on the precondition — exactly the kind of misunderstanding that leads someone to trust a result from an application that never actually satisfied what the function required. Stating the contract as one combined "if... then..." statement costs nothing beyond the two pieces already required by Concept Units 2 and 3, assembled together, and removes any ambiguity about whether the guarantee applies unconditionally or not.

---

## Concept Unit 5: What Happens When a Precondition Is Violated

### The Problem

Concept Unit 4's contract makes the postcondition's guarantee conditional — but it is worth confirming directly, with a concrete example, exactly what "the guarantee no longer applies" actually looks like in practice, rather than leaving it as an abstract statement. It does not mean the function refuses to run, or announces anything is wrong. Lesson 2's *literal execution* already established why: a function carries out exactly what its body says, with no awareness of its own stated precondition unless something is specifically built to check it. Left unchecked, a precondition violation produces a result exactly like Concept Unit 1's — fully computed, fully confident, and covered by no actual promise.

### No isolated lab for this step

This concept has no code of its own to isolate — the consequence of an unchecked precondition violation is demonstrated directly below, connecting Concept Unit 1's original example to this lesson's finished contract, not through a construct with its own syntax.

### Applying It — Total With Tax

**A milder contract violation than Concept Unit 1's, chosen to make the failure more subtle and more realistic:** a data-entry mistake enters a tax rate as `−0.10` instead of `0.10` (a misplaced minus sign). `total_with_tax(50.00, −0.10)`.

**Checking this against the precondition first, as Concept Unit 2 established:** `subtotal ≥ 0` holds (`50.00 ≥ 0`). `0 ≤ tax_rate < 1` fails — `−0.10` is less than `0`. The precondition is violated.

**What the function actually does anyway, since nothing in Lesson 7's mechanism checks this:** binding, substituting, and reducing exactly as always: `50.00 + 50.00 × (−0.10) = 50.00 − 5.00 = 45.00`.

**Checking this result against the postcondition, to see precisely how the broken promise shows up:** the first clause, "result equals `subtotal + subtotal × tax_rate`," technically still holds — `45.00` does equal `50.00 + 50.00 × (−0.10)`. But the second clause, "the result is never less than `subtotal`," fails outright: `45.00` is less than `50.00`. The very guarantee Concept Unit 3 derived specifically *because* the precondition would hold has silently broken, precisely because, this time, the precondition did not hold.

### Walkthrough

- **`total_with_tax(50.00, −0.10)`** — a more realistic contract violation than Concept Unit 1's, chosen deliberately to resemble an actual, easy-to-make data-entry mistake rather than an implausible extreme.
- **Checking the precondition and finding it violated** — a reappearance of Concept Unit 2's precondition, applied here to catch the violation before evaluation, exactly the discipline this unit argues for.
- **The mechanical computation proceeding anyway, to `45.00`** — a reappearance of *literal execution* (Lesson 2), restated briefly: the function has no awareness of its own contract unless something external checks it.
- **The postcondition's second clause failing, `45.00 < 50.00`** — not a new concept, but the concrete, checkable demonstration of exactly what "the guarantee no longer applies" means in practice: a specific, statable promise, now specifically broken.

### CS Lens

This is the fact that a contract violation does not announce itself — a function keeps running, keeps producing output, with nothing about its behavior automatically signaling that its own guarantee has quietly stopped applying. Also recognized in: undefined behavior in low-level programming languages, where code that violates a language's own stated rules may appear to run normally while no longer being covered by any correctness guarantee at all; a car driven with worn brakes, which continues to drive normally, right up until the moment the brakes are actually needed and the vehicle's implicit safety contract has already been broken; a bridge built to a rated load limit, structurally fine under any load up to that limit and silently past its guarantee the instant it's exceeded; a medical device used outside its approved conditions, which may continue to function and display readings while no longer being backed by its tested guarantees.

### SE Lens

The alternative to checking a precondition explicitly, before trusting a function's result, is to assume that a function running without crashing means its contract was upheld. The real cost of that alternative is precisely what Concept Unit 5's example demonstrates: a fully computed, fully ordinary-looking result — 45.00, nothing about it visibly wrong — silently violates the very guarantee Concept Unit 3 worked out, because the precondition it depended on was never checked. Explicitly checking a precondition before trusting a function's postcondition costs one additional check per application; skipping it means a broken guarantee looks, from the outside, exactly like an honored one, until something downstream that depended on the guarantee — a customer noticing their total went down after tax, in this case — eventually notices.

---

## Closing

### Connect the pieces

One function, `total_with_tax`, traced through every unit built in this lesson, start to finish:

1. **The gap exposed (Unit 1):** `total_with_tax(−8.20, −5.00)` computes a confident `32.80` from nonsensical arguments, because nothing in Lesson 7's mechanism checks anything.
2. **Precondition, stated precisely (Unit 2):** `subtotal ≥ 0` and `0 ≤ tax_rate < 1` — checkable against any specific application.
3. **Postcondition, stated precisely (Unit 3):** result equals `subtotal + subtotal × tax_rate`, and is never less than `subtotal` — a guarantee checkable without re-deriving the calculation.
4. **The contract, combining both (Unit 4):** if the precondition holds, then the postcondition is guaranteed — an explicit, two-sided deal.
5. **A violation, traced concretely (Unit 5):** `total_with_tax(50.00, −0.10)` violates the precondition, computes anyway to `45.00`, and silently breaks the postcondition's "never less than `subtotal`" guarantee.

Unit 5's violation is not a fresh, unrelated example — it directly reuses Unit 4's finished contract to check a new application, and directly reuses Unit 1's original finding (that the mechanism computes regardless) to explain why the violation went unnoticed by the function itself.

### What breaks without this

Suppose this lesson's contract had never been written down, and `total_with_tax` had simply been trusted, everywhere it was used, on the strength of "it's just addition and multiplication, what could go wrong." A downstream part of the store's system — a report totaling all transactions for the day — sums up every result `total_with_tax` produced, including the one from the misplaced-minus-sign data entry in Concept Unit 5. That report is now off by more than just the one mistaken transaction's error: it includes a total that is *smaller* than the subtotal it was computed from, silently pulling the day's grand total down in a way that looks, on the surface, like an ordinary rounding difference rather than a data-entry mistake. Nobody reviewing the day's numbers has any stated guarantee to check the suspicious total against — without Concept Unit 3's postcondition, "a computed total should never be less than its subtotal" is not a rule anyone thought to state, so there is nothing prompting a reviewer to flag `45.00` from a `50.00` subtotal as obviously wrong. Restoring this lesson's contract fixes this directly: checking every `total_with_tax` result against its postcondition (`result ≥ subtotal`) would flag the `45.00` result immediately, before it ever reaches the daily report, tracing the discrepancy back to the exact transaction where the precondition was violated.

### Exercises

1. **Observe.** For a function you defined in Lesson 7 or Lesson 8's exercises, write out what you were implicitly assuming about its parameters when you first defined it, the way Concept Unit 1 identified `total_with_tax`'s unstated assumptions.
2. **Formalize.** State your function's precondition precisely, in terms of its actual parameters, the way Concept Unit 2 stated `subtotal ≥ 0` and `0 ≤ tax_rate < 1`.
3. **Formalize.** State your function's postcondition precisely, including at least one derived guarantee (something checkable without re-deriving the whole calculation), the way Concept Unit 3 derived "the result is never less than `subtotal`."
4. **Explain.** Combine your Exercise 2 and Exercise 3 answers into a single "if... then..." contract statement, the way Concept Unit 4 combined both halves for `total_with_tax`.
5. **Formalize.** Choose a specific application of your function that violates your Exercise 2 precondition. Compute what your function would actually produce anyway (following its body mechanically), and check that result against your Exercise 3 postcondition, the way Concept Unit 5 checked `total_with_tax(50.00, −0.10)` against "never less than `subtotal`" and found it failed.

### Definition of done

- [ ] You can state, in your own words, the difference between a precondition and a postcondition, and explain why the postcondition's guarantee is conditional on the precondition, not automatic.
- [ ] You can write a full contract, in "if... then..." form, for a function of your own choosing.
- [ ] You can compute what your function would actually produce when applied to arguments that violate its precondition, and explain why the function itself does not stop this from happening.
- [ ] You can name at least one derived postcondition guarantee (not just a restatement of the function's body) that would let someone sanity-check a result without re-deriving the whole calculation.
- [ ] You completed Exercises 1–5 for a function of your own choosing, not `total_with_tax`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating what your Exercise 5 violated-precondition result actually looked like, and whether it would have looked suspicious to someone who hadn't checked it against the postcondition.
