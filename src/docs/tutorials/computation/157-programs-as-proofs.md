# Lesson 157: Programs as Proofs

**What you will build**: By the end of this lesson you'll reread three pieces of code this curriculum already built — a plain function, Lesson 150's product type, Lesson 147's empty intersection — through a second, completely different lens: a type as a logical proposition, and a value of that type as a **proof** of it. This is the **Curry-Howard correspondence**: writing a function that type-checks and writing a valid logical proof turn out to be, underneath, the identical activity.

**What you need to know first**: Lesson 150's sum and product types; Lesson 147's join and meet, and its own empty-set result; Lesson 8's logical connectives (`and`, `or`, implication); Lesson 155's types-as-sets.

**Terms introduced in this lesson**:

- **Curry-Howard correspondence** — the precise pairing between logic and types: a proposition corresponds to a type, and a proof of that proposition corresponds to a value of that type. *Why it matters*: turns "does a proof of this exist" into "does this type have any values at all" — the identical question, in two different vocabularies, connecting Lesson 8's logic directly to every type this curriculum has built since.
- **uninhabited type** — a type with no possible values at all. *Why it matters*: under Curry-Howard, an uninhabited type corresponds exactly to a false proposition — nothing can prove it, because nothing of that type exists to serve as the proof.

**Objects and methods used**: None new. This lesson reuses `clojure.set/intersection` (Lesson 10) and Lesson 150's `all-products`, each already covered.

---

## Concept Unit: A Function Is a Proof of an Implication

### The Problem

Lesson 8 formalized implication — "if `A` then `B`." Is there a real, already-familiar piece of code that corresponds to constructing a proof of exactly that?

### Introduce the concept in isolation

`double-it` (Lesson 153), `[n] \to (* n 2)`, has the type "number `\to` number." Under Curry-Howard, that type *is* the proposition "if a number is given, a number can be produced" — and `double-it` itself, the actual function, *is* the proof: calling it with any real number genuinely produces one, every time (Lesson 156's own referential transparency, restated as "the proof works for every case, not just some"). Writing a function whose types check is, under this correspondence, exactly writing a valid proof of the implication those types state.

### Discard the throwaway example

Not applicable — this unit reinterprets an already-built, already-verified function rather than introducing new code.

### CS Lens

Under Curry-Howard, "this function type-checks" and "this proof is valid" are the identical claim, checked the identical way: a type checker verifying `double-it`'s types line up is, structurally, verifying a proof's logical steps line up — the same reason real proof-assistant software (Lean, Coq, Agda) is built directly on programming-language type systems rather than on a separate logic engine.

### SE Lens

This is why a function that *doesn't* type-check is described as having an error, not merely a stylistic issue: under Curry-Howard, a type error is a broken proof step — the code is claiming to prove something its own pieces don't actually establish.

---

## Concept Unit: Products Are AND, Sums Are OR

### The Problem

Lesson 150 already showed a product type bundles two components, and a sum type offers two alternatives. Does that map onto Lesson 8's own `and`/`or` directly?

### Introduce the concept in isolation

Lesson 150's own `all-products` builds every `[color flag]` pair — and constructing *one* such pair requires *both* a real color *and* a real flag, simultaneously. That's exactly `and`: a product type is the Curry-Howard reading of "`A` and `B`" — proving it requires a proof of `A` *and* a proof of `B`, together, the same way building `["red" true]` requires a real color *and* a real flag. Lesson 150's tagged sum values, by contrast — `["color" "red"]` *or* `["flag" true]`, never both in the same value — are exactly `or`: proving "`A` or `B`" requires only *one* proof, of either side, the same way one tagged value only ever commits to one alternative.

### Discard the throwaway example

Not applicable — this unit reinterprets Lesson 150's own already-verified `all-products`/tagged-value functions rather than introducing new code.

### Project Change

- **Reference Source**: Lesson 150's own `all-products`, `tagged-colors`, `tagged-flags`, reused directly, unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit reinterprets already-built code through a new lens rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`["red" true]`**, one product-type value (Lesson 150) — reread here as a proof of "color `\land$ flag": both halves are genuinely present, the way `and`'s own truth table requires both sides true.
- **`["color" "red"]`**, one sum-type value (Lesson 150) — reread as a proof of "color `\lor$ flag": exactly one side is present, the way `or`'s own truth table only requires one side true.

### CS Lens

Lesson 8's own truth table for `and` — true only when *both* inputs are true — is structurally the identical shape as "a product type has a value only when *both* components have one"; `or`'s truth table — true when *either* input is true — is structurally identical to "a sum type has a value when *either* alternative has one." Not an analogy: the identical mathematical structure, read twice.

### SE Lens

Recognizing this correspondence pays off directly when designing a type: choosing a product type for data that logically requires "this and that" together, and a sum type for data that's genuinely "this or that," isn't just a modeling convention — it's choosing the type whose own logical shape actually matches the real-world constraint being represented, the exact distinction Lesson 150's own "What Breaks Without This" already illustrated concretely.

### Connection to the previous unit

The previous unit read one function as a proof of an implication; this unit reads two already-built type shapes as proofs of `and` and `or` — the same correspondence, applied to two more of Lesson 8's own connectives.

---

## Concept Unit: An Empty Type Is a False Proposition

### The Problem

Lesson 147's `\#\{1,2\} \cap \#\{3,4\}` was the empty set — a type, under Lesson 155's model, with no possible values at all. What does Curry-Howard say a type like that corresponds to?

### Introduce the concept in isolation

```
user=> (clojure.set/intersection #{1 2} #{3 4})
#{}
```

`\#\{1,2\} \cap \#\{3,4\}` has no members — Lesson 147's own real, verified result. Under Curry-Howard, a type with no values is an **uninhabited type**, and it corresponds exactly to a *false* proposition: there is no proof of it, because there's nothing of that type to serve as one. "A value both in `\#\{1,2\}` and in `\#\{3,4\}`" is false — checked, not assumed — precisely because that type is empty.

### Discard the throwaway example

Not applicable — this unit reinterprets Lesson 147's own already-verified empty-intersection result rather than introducing new code.

### CS Lens

A real type checker rejecting code that claims to produce a value of an uninhabited type is, under this correspondence, rejecting an invalid proof — refusing to accept "and here is a proof of something false," structurally identical to Lesson 17's own proof-by-contradiction refusing an argument that derives a false conclusion.

### SE Lens

Some real production type systems deliberately include a genuinely uninhabited type (often called `Never` or `Void`) specifically to mark a function that provably never returns — a function whose *return type* is uninhabited is, under Curry-Howard, a function whose own type signature proves it never actually reaches a return statement at all, a real, checkable guarantee rather than a comment claiming the same thing.

### Connection to the previous unit

The previous unit read two inhabited types as proofs of `and`/`or`; this unit reads one deliberately empty type as the correspondence's own edge case — no values, no proof, a false proposition, made concrete with a result Lesson 147 already verified.

---

## Connect the Pieces

Three already-built pieces of code, reread through the identical correspondence:

```clojure
(println "double-it as implication proof: any number in, a number out - always.")
(println "Product [color flag] count (AND):" (count (all-products color-type flag-type 0 0 [])))
(println "Empty intersection (FALSE, uninhabited):" (clojure.set/intersection #{1 2} #{3 4}))
```

```
double-it as implication proof: any number in, a number out - always.
Product [color flag] count (AND): 6
Empty intersection (FALSE, uninhabited): #{}
```

Nothing in this lesson required writing new code — every one of this section's own already-verified results was already, quietly, a fact about proofs the entire time.

## What Breaks Without This

Suppose a function's type signature promised a value of some type, but that type turned out to be uninhabited under the actual constraints the function operates within — the code would be structurally incapable of ever legitimately returning, forcing either an infinite loop, a crash, or a dishonest workaround (returning some unrelated placeholder value) to avoid the type checker catching a proof that can't actually be constructed. Recognizing "this type is uninhabited under these constraints" *before* writing the function — the identical check Lesson 147's own empty-intersection result already performed — catches an impossible design before real code is built around it.

## Exercises

1. **Trace.** By hand, using Lesson 8's own `and` truth table, confirm `["red" true]` corresponds to a true `and` proposition — both components genuinely present.
2. **Predict.** Before checking, predict whether `\#\{1,2,3\} \cap \#\{2,3,4\}` (Lesson 147's own overlapping-sets exercise) is inhabited or uninhabited. Then verify with `clojure.set/intersection`.
3. **Verify.** Confirm a sum type built from two genuinely disjoint alternatives (Lesson 150's own `color`/`flag` tags) is always inhabited — that is, always has at least the values each alternative independently contributes.
4. **Break it, on purpose.** Describe a function whose declared return type is uninhabited under its actual logic (for example, a function claiming to return "a value both in `\#\{1,2\}` and in `\#\{3,4\}`"), and explain why no real implementation could ever satisfy it.
5. **Generalize.** Describe, without coding it, what the Curry-Howard reading of Lesson 8's `not` (logical negation) might correspond to for a type — hint: consider what "a function from `A` to an uninhabited type" would mean.
6. **Reconstruct.** Close this lesson. From memory, explain why Lesson 150's product and sum types were always, quietly, `and` and `or` — not a new coincidence this lesson introduced, but a fact about code already fully built and verified.

## Definition of Done

- [ ] You can explain the Curry-Howard correspondence: types as propositions, values as proofs.
- [ ] You can explain why a product type corresponds to `and` and a sum type corresponds to `or`.
- [ ] You can explain why an uninhabited type corresponds to a false proposition, using Lesson 147's own empty intersection as a real example.
- [ ] You completed Exercise 2 and determined whether `\#\{1,2,3\} \cap \#\{2,3,4\}$ is inhabited.
- [ ] You completed Exercise 4 and described a function whose declared type is genuinely uninhabited.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm {1,2,3} intersect {2,3,4} is inhabited ({2,3}); describe an uninhabited-return-type function and why it's unimplementable"` — not just `"lesson 157 exercise"`.

---

**Next lesson:** Lesson 158, *Abstraction as a Problem-Solving Tool*, closes Section VII with this section's own checkpoint — applying its full run of algebraic and logical vocabulary to a genuinely new problem with minimal scaffolding, plus a deliberately planted mistake in a companion abstraction for you to find before it's revealed, the same format Lessons 108 and 138 established.
