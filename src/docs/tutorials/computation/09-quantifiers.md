# Lesson 9: Quantifiers

**What you will build**: By the end of this lesson you'll be able to state precisely what it means for a condition to hold for *every* member of a group, or for *at least one* member of a group — and prove or disprove either kind of claim over a small, known set of values. You'll also see that negating either kind of claim follows the exact same pattern as Lesson 8's De Morgan's laws, generalized from two conditions to any number of them.

**What you need to know first**: Lesson 7's `and`, `or`, and `not`, and Lesson 8's truth tables and logical equivalence — this lesson gives a name to a pattern those lessons have already been using without naming it.

**A note on this lesson's format**: Section II, starting at Lesson 19, introduces lists and recursion — the tools needed to check a quantified claim over a collection whose size isn't known in advance. Until then, this lesson checks quantified claims the same way Lesson 8 checked truth tables: over a small, explicitly written-out, fixed set of values. Everything here is real and correct — just scoped to domains small enough to write out by hand, with the general-purpose version deferred to where this series actually builds the tools for it.

**Terms introduced in this lesson**:

- **quantifier** — a word stating how many elements of a domain a condition must hold for ("for all," "there exists"). *Why it matters*: gives a name to the category this whole lesson is about, before splitting it into its two members.
- **universal quantification** ("for all," symbol ∀) — a claim that a condition holds for *every* element of some domain. *Why it matters*: this is the precise meaning behind claims like "every transaction amount must be positive" (Lesson 1's own constraint, stated formally for the first time).
- **existential quantification** ("there exists," symbol ∃) — a claim that *at least one* element of some domain satisfies a condition. *Why it matters*: this is the precise meaning behind claims like "at least one of these amounts is invalid" — and, later, the exact shape of what a search (Lesson 32) is looking for.
- **domain** — the specific set of values a quantified claim ranges over. *Why it matters*: "for all x" says nothing on its own without specifying for all x *in what* — the same claim can be true over one domain and false over another, so the domain is part of the claim, never incidental to it.

**Objects and methods used**: None new. This lesson reuses `and`, `or`, `not` (Lesson 7) and the comparison predicates (Lesson 7) — the new content is a precise name and a general pattern for something those lessons already did case by case.

---

## Concept Unit: Universal Quantification — "For All"

### The Problem

Lesson 1's bank-account constraint said "every transaction amount must be a positive number." Lesson 7 checked *one* amount at a time with `valid-withdrawal-amount?`. What does it actually mean, precisely, for a claim to hold for *every* member of a whole group — and how would you check it, using only what this series has built so far?

### Introduce the concept in isolation

Take a specific, small domain — three transaction amounts: `10`, `20`, `30` — and the claim "every one of these is positive":

```
user=> (and (> 10 0) (> 20 0) (> 30 0))
true
```

Each `(> x 0)` checks one member of the domain individually; `and` (Lesson 7) combines them so the whole expression is `true` only if *every single one* is. This is exactly **universal quantification** — "for all x in {10, 20, 30}, x is positive" — with `and` doing the actual combining. Change one member of the domain to a value that breaks the claim:

```
user=> (and (> 10 0) (> -5 0) (> 30 0))
false
```

One failing member is enough to make the whole "for all" claim false — `and`'s short-circuiting (Lesson 7) even stops checking further members the instant one fails, which matches the logic exactly: once a single counterexample exists, "true for all" is already settled as false, regardless of what the remaining members turn out to be.

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
(and (> 10 0) (> 20 0) (> 30 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(and (> 10 0) (> 20 0) (> 30 0))`** — built entirely from reappearing forms (Lesson 7's `and` and `>`); no new syntax. What's new is recognizing this specific pattern — one `and` per member of a small, explicit domain — as a general-purpose way to state and check a "for all" claim.

### CS Lens

"For all" as repeated `and` over an explicit domain is a direct preview of what Lesson 25's `map` and this series' loops will eventually automate for domains too large to write out by hand — the underlying logical claim doesn't change; only the mechanism for checking it does. Also recognized in: a form's validation ("every required field must be filled in" — checked field by field), and a factory's quality control ("every unit in this batch must pass inspection" — one failure fails the batch, the same short-circuit shape `and` already has).

### SE Lens

Writing out one `and` clause per domain member works cleanly for three values and becomes unworkable for three thousand — the same limitation Lesson 8's truth tables ran into with combinations that double per added variable. This is exactly the gap Section II's recursion and lists close: the *logical claim* ("for all elements, this condition holds") stays identical; what changes is having a mechanism that scales to a domain whose size isn't known until the code runs.

---

## Concept Unit: Existential Quantification — "There Exists"

### The Problem

The opposite kind of claim: not "every amount is valid," but "at least one amount in this batch is invalid, and the whole batch should be flagged for review." How does a claim that only needs *one* member to satisfy a condition get checked, using what's already available?

### Introduce the concept in isolation

```
user=> (defn valid-withdrawal-amount? [amount] (> amount 0))
#'user/valid-withdrawal-amount?
user=> (or (not (valid-withdrawal-amount? 10)) (not (valid-withdrawal-amount? -5)) (not (valid-withdrawal-amount? 20)))
true
```

Each `(not (valid-withdrawal-amount? x))` checks one member for *invalidity*; `or` (Lesson 7) combines them so the whole expression is `true` if *at least one* member is invalid. This is **existential quantification** — "there exists an x in {10, -5, 20} such that x is invalid" — with `or` doing the combining this time, instead of `and`. Change the domain to one where every member is actually valid:

```
user=> (or (not (valid-withdrawal-amount? 10)) (not (valid-withdrawal-amount? 20)) (not (valid-withdrawal-amount? 30)))
false
```

No member fails, so no invalid one exists, so the existential claim is `false` — `or`'s short-circuiting (Lesson 7) again matches the logic exactly: the instant one satisfying member is found, "there exists" is already settled as true, with no need to check the rest.

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
(or (not (valid-withdrawal-amount? 10)) (not (valid-withdrawal-amount? -5)) (not (valid-withdrawal-amount? 20)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(or (not (valid-withdrawal-amount? 10)) ...)`** — built from reappearing `or`, `not`, and a reappearing predicate (Lesson 7); the pattern — one `or` clause per domain member, each testing the condition being searched for — is what's new, the same way Concept Unit 1's repeated `and` was.

### CS Lens

"There exists" as repeated `or` over an explicit domain is exactly what a search (Lesson 32) does: check members one at a time, stop the instant one satisfies the condition. Also recognized in: airport security's question "does any bag in this batch contain a prohibited item" (one match is enough to stop and investigate), and a database query's `EXISTS` clause, which is named after precisely this quantifier.

### SE Lens

The same scaling limitation from Concept Unit 1 applies here in reverse: one `or` clause per domain member is fine for three values, unworkable for a domain whose size isn't fixed in advance. Section II's recursive search functions are where "there exists an element satisfying this condition" becomes something you can check without knowing, when you write the code, how many elements there will eventually be.

### Connection to the previous unit

The previous unit combined domain members with `and` to state "every one must hold"; this unit combines them with `or` to state "at least one must hold" — the same shape, the opposite connective, the opposite claim.

---

## Concept Unit: Negating a Quantified Claim

### The Problem

"Not every amount in this batch is valid" and "there exists an invalid amount in this batch" sound like they should mean the same thing. Lesson 8 proved De Morgan's laws for exactly two conditions — `not (p and q)` equals `(not p) or (not q)`. Does the same relationship hold when there are more than two conditions, combined through the quantifier pattern this lesson just built?

### Introduce the concept in isolation

Take the domain `{10, -5, 30}` and check both sides of the claim directly:

```
user=> (defn valid-withdrawal-amount? [amount] (> amount 0))
#'user/valid-withdrawal-amount?
user=> (defn for-all-valid [] (and (valid-withdrawal-amount? 10) (valid-withdrawal-amount? -5) (valid-withdrawal-amount? 30)))
#'user/for-all-valid
user=> (defn exists-invalid [] (or (not (valid-withdrawal-amount? 10)) (not (valid-withdrawal-amount? -5)) (not (valid-withdrawal-amount? 30))))
#'user/exists-invalid
user=> (not (for-all-valid))
true
user=> (exists-invalid)
true
```

Both `true` — "not (for all x, valid(x))" and "there exists x such that not valid(x)" agree, on this domain. This is De Morgan's laws (Lesson 8), generalized from two named conditions (`p`, `q`) to any number of domain members combined the same way: negating a universal claim ("for all") produces an existential claim about the negated condition ("there exists... not"), the exact same "flip the connective, negate each term" transformation Lesson 8's Concept Unit 4 already applied to real code — just with an unbounded number of terms instead of exactly two.

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
(not (for-all-valid))
```

(against `for-all-valid` and `exists-invalid` from the isolated example above, to compare directly.)

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(not (for-all-valid))`** — reappearing `not` (Lesson 7) applied to a reappearing zero-argument function call (Lesson 4's calling convention, with an empty parameter list — nothing new syntactically, just a function that happens to need no input because its domain is fixed inside its own body for this example).

### CS Lens

"Not for all" equals "there exists a counterexample" is the precise logical shape behind Lesson 8's own counterexample technique (Concept Unit 3): disproving a universal claim ("and" is equivalent to "or") only ever required finding *one* disagreeing case — which is exactly existential quantification over the claim's own domain of possible inputs. Also recognized in: a scientific claim ("all swans are white") disproven by a single counterexample (one non-white swan) rather than needing to re-examine every swan — precisely this lesson's negation law, applied outside mathematics.

### SE Lens

Knowing this equivalence in advance changes how a validation function gets written: code that needs to check "is there a problem anywhere in this batch" can be written directly as an existential search for the *first* bad element (stopping as soon as one is found, per this lesson's `or`-based short-circuiting) rather than checking a universal claim to completion and then separately figuring out what failed — the same result, reached with less wasted work, justified by this lesson's negation law rather than by coincidence.

### Connection to the previous unit

The previous two units defined "for all" and "there exists" as separate, opposite patterns; this unit shows they aren't just opposites in meaning — negating one mechanically produces the other, the exact relationship Lesson 8 already proved for two-term conditions, now shown holding for quantified claims as well.

---

## Connect the Pieces

Lesson 1's own bank-account trace, checked against a real quantified claim for the first time. Recall the "Connect the Pieces" trace from Lesson 1: opening balance `60`, transactions `deposit 40`, `withdraw 90`, `withdraw 10`, `deposit 5`, producing balances `100`, `10`, `0`, `5` after each step. Lesson 1's constraint — "the balance may never go negative at any point" — is a universal claim over those four balances:

```
user=> (and (>= 100 0) (>= 10 0) (>= 0 0) (>= 5 0))
true
```

Every balance from that trace satisfies "≥ 0" — the universal claim holds, confirming Lesson 1's constraint was actually respected throughout that specific trace, not just at the end. This is the first time this series has *checked* Lesson 1's constraint as a standalone claim, separately from computing the balances that satisfy it — exactly the kind of check Lesson 16 (*Invariants*) will formalize as something to verify at every step of a running computation, not just after the fact.

## What Breaks Without This

Suppose someone claimed a batch of amounts was "all valid" by checking only the *first* one and stopping:

```clojure
(defn hastily-checked-valid? [] (valid-withdrawal-amount? 10))
```

```
user=> (hastily-checked-valid?)
true
```

`true` — but this says nothing about the other members of the actual batch, `{10, -5, 30}`. The real universal claim, checked properly:

```
user=> (and (valid-withdrawal-amount? 10) (valid-withdrawal-amount? -5) (valid-withdrawal-amount? 30))
false
```

`false` — the batch is not, in fact, all valid. `hastily-checked-valid?`'s mistake is a category error this lesson's vocabulary makes precise: checking one member of a domain and reporting it as if it answered a *universal* claim is silently answering an *existential* one instead ("does at least one valid amount exist" — trivially true here) while presenting it as the much stronger claim ("do all of them"). The two questions have different domains of concern and, as shown, genuinely different answers on the same data.

## Exercises

1. **Trace.** State, in your own words, the domain and the condition for the claim "for all transactions in a day's log, the amount is nonzero." Then check it by hand against the domain `{10, 20, 0, 5}`.
2. **Predict.** Predict whether `(or (> 10 5) (> 20 5) (> 3 5))` (an existential claim over `{10, 20, 3}` with condition "greater than 5") is `true` or `false` before running it. Then predict `(and (> 10 5) (> 20 5) (> 3 5))` (the universal version of the same claim, same domain) — are they the same?
3. **Negate.** Take Exercise 2's universal claim and write its negation two ways: literally, with `not` wrapped around the whole `and`; and via this lesson's law, as an existential claim about the negated condition. Confirm both give the same answer.
4. **Break it, on purpose.** Write a function like `hastily-checked-valid?` that checks only one member of a domain and claims to answer a universal question about the whole thing. Find a concrete domain where it gives the wrong answer.
5. **Generalize.** Lesson 1's other constraint was "every transaction amount must be a positive number" (distinct from "the balance must never go negative," which Connect the Pieces already checked). State this second constraint as a universal claim over the domain `{40, -90, 10, 5}` (the raw transaction amounts, not the resulting balances, from Lesson 1's trace — note some are naturally "negative" as withdrawals; decide how you're representing that before writing the claim) and check it.
6. **Reconstruct.** Close this lesson. From memory, state the relationship between negating a "for all" claim and an "there exists" claim, and explain why it's the same law as Lesson 8's De Morgan's laws, not a coincidentally similar one.

## Definition of Done

- [ ] You can state, in your own words, the difference between a universal and an existential claim, including why the domain matters to both.
- [ ] You can check either kind of claim by hand over a small, explicit domain, using `and` or `or` correctly.
- [ ] You completed Exercise 3 and confirmed both ways of negating a universal claim agree.
- [ ] You can explain why `hastily-checked-valid?`-style reasoning (checking one element, claiming it answers a universal question) is a real, nameable mistake, not just "obviously wrong."
- [ ] Commit your Exercise 5 claim and check to your notes repository, with a commit message stating which quantifier you used and why — for example, `"Check Lesson 1's positive-amount constraint as a for-all claim over the raw transaction amounts"` — not just `"lesson 9 exercise"`.

---

**Next lesson:** Lesson 10, *Sets as Computational Collections*, is where this lesson's "domain" — so far just an informally written-out handful of values — becomes a precise mathematical object in its own right, with membership, union, intersection, and difference: the last piece of vocabulary Section I needs before Section II starts building real collections and the loops and recursion that check quantified claims over them for real.
