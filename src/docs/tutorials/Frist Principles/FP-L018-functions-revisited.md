# Lesson 18: Functions Revisited

**What you will build:** Still nothing runnable — this lesson goes back to Lesson 7's function and shows it was a relation (Lesson 17) all along, one satisfying a single extra requirement: every input relates to exactly one output. Once that connection is made, four precise distinctions become available that Lesson 7 never needed: a function's *domain*, its *codomain*, its actual *range*, and whether it is *injective*, *surjective*, or *bijective*. The transferable problem this lesson is actually about: Lesson 17's `WorksIn` related Cid to both IT and HR at once, which is perfectly sensible for "who works where," but would make no sense at all for something claiming to compute a single answer — and this curriculum has never yet stated precisely what separates the two.

**What you need to know first:** Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, and *application*, all reused and now reframed as a special case of a relation. Lesson 15 (`FP-L015-sets.md`) — specifically *set*. Lesson 17 (`FP-L017-relations.md`) — specifically *relation* and the `WorksIn` example, revisited directly in Concept Unit 1 as the relation that is *not* a function.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Domain** (of a function) — the set of every legal input a function can be applied to. This is the same word Lesson 14 used for a quantifier's domain, and Lesson 17 used for a relation's first set — here it names specifically the set a function's parameter draws its values from.
- **Codomain** — the set a function's outputs are declared to belong to, stated as part of the function's definition, whether or not every member of it actually gets produced by some input. A codomain is a *claim* about where outputs will land, not a report of where they actually did.
- **Range** — the set of outputs a function's inputs actually produce, drawn from evaluating the function's body over every element of its domain. The range is always a subset of the codomain, and can be a proper subset — smaller than the codomain — without anything being wrong.
- **Injective** — a property a function may have: no two different inputs ever produce the same output, `∀a₁, a₂ ∈ domain, f(a₁) = f(a₂) → a₁ = a₂`. An injective function never collapses two distinct inputs down to one shared result.
- **Surjective** — a property a function may have: every member of the codomain is actually produced by some input — that is, the range equals the entire codomain, not merely a subset of it.
- **Bijective** — a property a function may have: both injective and surjective at once. A bijective function pairs every element of its domain with a distinct element of its codomain, with no codomain element left unpaired and no two domain elements sharing a partner.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, revisiting Lesson 17's `WorksIn` relation and using a small doubling function on `{1, 2, 3}` throughout.

---

## Concept Unit 1: Which Relations Are Functions?

### The Problem

Lesson 17's `WorksIn` related `Cid` to both `IT` and `HR` — two different outputs for the same input, and nothing about that was wrong; some employees really do work in more than one department. Lesson 7's `total_with_tax`, by contrast, was never meant to produce two different totals for the same subtotal and tax rate — applying it always produces exactly one number. Both `WorksIn` and `total_with_tax` are relations, in Lesson 17's sense — sets of ordered pairs. What separates them is a property `WorksIn` lacks and `total_with_tax` has: every input relates to exactly one output.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing these two relations directly is demonstrated below, not through a construct with its own syntax.

### Applying It — Comparing WorksIn and Doubling

**`WorksIn`, exactly as defined in Lesson 17:**

> `WorksIn = {(Ana, Sales), (Ben, IT), (Cid, IT), (Cid, HR)}`

**Checking whether every input has exactly one output:** `Ana` relates to exactly one department, `Sales`. `Ben` relates to exactly one, `IT`. `Cid` relates to two, `IT` and `HR` — this fails the single-output requirement.

**A doubling rule, written as a relation over `{1, 2, 3}`, in Lesson 17's exact style:**

> `Double = {(1, 2), (2, 4), (3, 6)}`

**Checking the same requirement for `Double`:** `1` relates to exactly one output, `2`. `2` relates to exactly one, `4`. `3` relates to exactly one, `6`. Every input in `Double`'s domain has exactly one output — no exceptions.

### Walkthrough

- **`WorksIn`, rechecked against the single-output requirement, and failing at `Cid`** — a reappearance of Lesson 17's exact relation, examined here for a property never checked in that lesson.
- **`Double = {(1, 2), (2, 4), (3, 6)}`** — a numeric relation, written in the same set-of-pairs form as `WorksIn`, chosen specifically because it will pass the same check `WorksIn` failed.
- **Checking `Double`'s three inputs, each with exactly one output** — establishes concretely what "every input relates to exactly one output" actually requires, checked item by item rather than merely asserted.

### CS Lens

This is the recognition that a computational rule, in the sense Lesson 7 already built, is really just a relation with one extra guarantee — determinism, the assurance that applying it to the same input always yields the same, single result. Also recognized in: a pure mathematical function, distinguished from a general binary relation exactly by this single-valuedness; a deterministic algorithm, distinguished from a nondeterministic one by producing exactly one output for a given input; a vending machine, expected to dispense exactly one item for a given selection, versus a raffle, which may legitimately connect one ticket number to any of several possible outcomes; a lookup table in a database, expected to return exactly one row per key, versus a one-to-many relationship, which may legitimately return several.

### SE Lens

The alternative to distinguishing functions from general relations is to treat every "input goes in, output comes out" description the same way, regardless of whether multiple outputs are ever legitimately possible. The real cost of that alternative is exactly the ambiguity Lesson 2 warned about applied to a new setting: a caller applying something they assume is a function, expecting exactly one result, could be badly surprised by something that's secretly `WorksIn`-shaped, silently able to produce more than one answer for the same input. Naming the distinction precisely, the subject of the rest of this lesson, costs nothing beyond checking the single-output requirement; it lets a caller trust, from the definition alone, exactly how many results to expect.

---

## Concept Unit 2: Function — a Relation Where Each Input Has Exactly One Output

### The Problem

Concept Unit 1 checked the single-output requirement informally, by eye, for two small examples. Stating it precisely, as a formal addition to Lesson 17's definition of a relation, is what actually makes "function" a checkable property rather than a felt impression.

### No isolated lab for this step

This concept has no code of its own to isolate — the formal definition is stated and applied directly below, not through a new construct with its own syntax.

### Applying It — the Formal Requirement

**The definition, stated precisely, building directly on Lesson 17's relation:** a relation `f ⊆ A × B` is a function if, for every `a ∈ A`, there is exactly one `b ∈ B` such that `(a, b) ∈ f`.

**Confirming `Double` satisfies this, using Lesson 14's quantifier vocabulary directly:** `∀a ∈ {1, 2, 3}`, there is exactly one `b` with `(a, b) ∈ Double` — checked individually for `1`, `2`, and `3` in Concept Unit 1, and holding for all three.

**Confirming `WorksIn` fails this, precisely:** `∃a ∈ Employees` (specifically, `Cid`) for which there is *not* exactly one `b` — there are two, `IT` and `HR`. A single counterexample, exactly as Lesson 14's Concept Unit 4 already established, is enough to settle a universal requirement as unmet.

**Connecting this back to Lesson 7 directly:** every function Lesson 7 ever defined — `total_with_tax`, `price_after_discount`, `discounted_total` — satisfies this exact requirement; applying any of them to a fixed set of arguments was always understood to produce one specific result, via binding, substitution, and reduction. This lesson has not changed what a function is; it has stated precisely, for the first time, the one property that was always silently assumed.

### Walkthrough

- **"for every `a ∈ A`, there is exactly one `b ∈ B` such that `(a, b) ∈ f`"** — first appearance of *function*, formally defined as a relation satisfying this single-output requirement.
- **Confirming `Double` satisfies it, and `WorksIn` doesn't, using quantifier language** — a reappearance of *universal quantifier* (Lesson 14), applied to state precisely what Concept Unit 1 checked informally.
- **The explicit connection back to Lesson 7's `total_with_tax`** — not a new concept, but the Repetition Rule's required brief restatement: Lesson 7 already gave full treatment to what a function is and does; this unit confirms that everything from Lesson 7 was, and still is, correct, now stated with one additional layer of formal precision.

### CS Lens

This is the recognition that a familiar, already-used idea (function) can be given a precise, checkable definition after the fact, in terms of more basic ideas (relation, quantifier) that didn't exist yet when the familiar idea was first introduced. Also recognized in: Newtonian mechanics being given a more precise mathematical foundation by later physicists, without changing what it had already correctly predicted; a legal principle used correctly in court for generations before being codified into a precise statute; a programming language feature used correctly by programmers for years before a formal specification of its exact behavior was written; arithmetic being used correctly for millennia before the Peano axioms gave it a precise logical foundation.

### SE Lens

The alternative to formalizing "function" this precisely is to keep relying on the informal, intuitive sense Lesson 7 built — "you give it input, it gives you output" — without ever stating the single-output requirement as a checkable fact. The real cost of that alternative is exactly what Concept Unit 1 demonstrated: without a precise definition, there is no way to say, with certainty, whether some new relation someone hands you is safe to treat as a function or not — "it looks like it should only give one answer" is a guess, not a check. Stating the formal definition costs nothing beyond writing it down; it turns "does this behave like a function" from an intuition into a fact checkable exactly the way Concept Unit 1 checked it for `WorksIn` and `Double`.

---

## Concept Unit 3: Domain, Codomain, and Range — Three Different Sets

### The Problem

Lesson 7 used the word "parameter" for a function's input and never named the set that input is drawn from, or the set its output is declared to land in, precisely. `Double`'s inputs came from `{1, 2, 3}` — but its outputs, `2`, `4`, and `6`, could just as easily have been *declared* to live in a much larger set of numbers, one that includes plenty of values `Double` never actually produces. Distinguishing "the set outputs are declared to come from" and "the set of outputs actually produced" turns out to matter a great deal, and conflating them is a common, easy mistake.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction between codomain and range is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Doubling, With an Explicit Codomain

**`Double`, restated with its domain and a deliberately generous codomain declared explicitly:**

> `Double : {1, 2, 3} → {1, 2, 3, 4, 5, 6}`, with `Double(x) = 2x`.

**The domain, named directly:** `{1, 2, 3}` — every legal input.

**The codomain, named directly:** `{1, 2, 3, 4, 5, 6}` — the set every output is declared to belong to, chosen here deliberately larger than what's strictly needed.

**Working out the range — the outputs actually produced:** `Double(1) = 2`, `Double(2) = 4`, `Double(3) = 6`. The range is `{2, 4, 6}`.

**Confirming the range is a proper subset of the codomain, and that this is completely fine:** `{2, 4, 6} ⊆ {1, 2, 3, 4, 5, 6}`, but `1`, `3`, and `5` are members of the codomain that no input ever actually produces. Nothing about `Double`'s definition is broken by this — the codomain was simply declared more generously than the function's actual behavior turned out to need.

### Walkthrough

- **`Double : {1, 2, 3} → {1, 2, 3, 4, 5, 6}`** — first appearance of *domain* and *codomain* named explicitly as part of a function's declaration, using the domain-arrow-codomain notation.
- **Working out `Double(1)`, `Double(2)`, `Double(3)`, giving `{2, 4, 6}`** — first appearance of *range*, derived by actually applying the function to every domain element, exactly the way Lesson 15's set-builder notation derived a set's actual members from a predicate.
- **`{2, 4, 6} ⊆ {1, 2, 3, 4, 5, 6}`, with three codomain members unused** — confirms, concretely, that range and codomain are genuinely different sets here, and that the difference is not an error.

### CS Lens

This is the distinction between a declared possibility and an actual outcome — the codomain states what's allowed to happen, the range states what actually did. Also recognized in: a function's declared return type in a typed programming language (the codomain, every possible value of that type) versus the specific values it actually returns across every call ever made to it (the range); a survey's possible answer choices (codomain) versus the answers respondents actually gave (range); a lottery's possible winning numbers (codomain) versus the numbers that have actually been drawn across its history (range, which may never equal the full codomain even after many drawings); a store's full catalog of orderable sizes (codomain) versus the sizes it has actually sold this year (range).

### SE Lens

The alternative to distinguishing codomain from range is to declare a function's output type generously and never check how much of it actually gets used. The real cost of that alternative shows up specifically when someone downstream assumes every declared possibility is actually reachable — code written to handle a codomain value that the range never actually produces is effort spent on a case that, for this particular function, simply cannot occur, while code that fails to handle every value the range *does* produce is a real gap. Explicitly working out the range, as this unit did, costs the effort of applying the function to its whole domain and collecting the results; it buys an honest picture of what a function actually does, distinct from what its declaration merely permits.

---

## Concept Unit 4: Injective — No Two Inputs Share an Output

### The Problem

`Double` never produced the same output for two different inputs — `2`, `4`, and `6` are all distinct. This is worth checking directly, and worth contrasting against a function where it fails, because it is not a property every function automatically has, even though every function (by Concept Unit 2's definition) always has exactly one output per input.

### No isolated lab for this step

This concept has no code of its own to isolate — checking injectivity for two contrasting functions is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Doubling vs. Validity Checking

**Checking `Double` for injectivity, directly against its definition:** `∀a₁, a₂ ∈ {1, 2, 3}`, does `Double(a₁) = Double(a₂)` imply `a₁ = a₂`? Checking every pair: `Double(1) = 2` and `Double(2) = 4` are different, so this pair poses no problem. `Double(1)` and `Double(3)` are `2` and `6`, different. `Double(2)` and `Double(3)` are `4` and `6`, different. No two different inputs ever share an output — `Double` is injective.

**A contrasting function, reusing Lesson 13's predicate directly:** `is_valid_score : {−5, 45, 72, 85, 91, 100} → {true, false}`, with `is_valid_score(s) = s ≥ 0`.

**Checking this for injectivity:** `is_valid_score(45) = true` and `is_valid_score(72) = true` — two different inputs, `45` and `72`, producing the exact same output, `true`. This single pair is enough to disprove injectivity, exactly the way one counterexample disproved a universal claim in Lesson 14. `is_valid_score` is not injective.

**Naming why this happened, precisely:** `is_valid_score`'s codomain has only two members, `true` and `false`, while its domain has six — by nothing more than counting, some output has to be shared by more than one input, since there aren't enough distinct outputs to go around.

### Walkthrough

- **Checking every pair of `Double`'s three inputs for shared outputs, finding none** — first appearance of *injective*, confirmed here by exhaustive pairwise checking on a small domain, exactly the way Lesson 17's properties were confirmed for `LE`, `EQ`, and `LT`.
- **`is_valid_score(45) = is_valid_score(72) = true`** — a direct counterexample, disproving injectivity for a reappearance of Lesson 13's predicate, now examined through this lesson's new vocabulary.
- **"some output has to be shared... by nothing more than counting"** — not a new concept, but an informal preview of a counting-based argument this curriculum will develop rigorously much later, offered honestly as intuition rather than as a completed proof.

### CS Lens

This is the property of a mapping never collapsing two distinct things into one — every distinct input keeps its own distinct identity on the output side. Also recognized in: a hash function's collision-free ideal (never fully achievable in practice, but the goal every hash function is measured against); a serial number system, designed so that no two distinct products ever receive the same number; an encryption scheme, required to be injective so that a decrypted message can be recovered uniquely rather than ambiguously; a seating chart assigning each guest a distinct seat, never doubling two guests up in one seat.

### SE Lens

The alternative to checking injectivity is to assume, without verifying, that a function's outputs are as distinct as its inputs. The real cost of that alternative is significant specifically when a function's output is later used to try to recover the original input — if `is_valid_score`'s output, `true`, were mistakenly treated as if it uniquely identified which score produced it, that assumption would be silently, badly wrong, since many different scores share that same output. Checking injectivity explicitly, as this unit did, costs one systematic pairwise check; it tells you, in advance, whether a function's output can ever be safely used to work backward to a unique input.

---

## Concept Unit 5: Surjective and Bijective — Hitting Every Element of the Codomain

### The Problem

Concept Unit 3 found that `Double`'s range, `{2, 4, 6}`, was a proper subset of its declared codomain, `{1, 2, 3, 4, 5, 6}` — three codomain members were never actually produced. It's worth asking directly whether this was forced by `Double`'s underlying rule, or purely a consequence of how generously the codomain happened to be declared — and worth naming the property that holds when nothing is left over.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing two declarations of the same underlying rule is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Changing Only the Codomain

**`Double`, exactly as declared in Concept Unit 3, checked for surjectivity:** is the range, `{2, 4, 6}`, equal to the full codomain, `{1, 2, 3, 4, 5, 6}`? No — `1`, `3`, and `5` are in the codomain but not the range. `Double`, declared this way, is not surjective.

**The exact same underlying rule, `f(x) = 2x`, redeclared with a smaller, more precise codomain:**

> `Double' : {1, 2, 3} → {2, 4, 6}`

**Checking this version for surjectivity:** the range is still `{2, 4, 6}` (the rule didn't change), and now the codomain is also `{2, 4, 6}` — they're equal. `Double'` is surjective.

**Confirming `Double'` is also injective, reusing Concept Unit 4's exact check, since the underlying rule is unchanged:** every pair of distinct inputs still produces distinct outputs, exactly as already checked.

**Naming what `Double'` is, having confirmed both properties:** injective and surjective together — bijective. Every one of `Double'`'s three domain elements is paired with a distinct codomain element, and every codomain element is paired with exactly one domain element, with nothing left over on either side.

**The lesson this comparison teaches, stated directly:** `Double` and `Double'` compute the exact same values from the exact same inputs — surjectivity was never about the underlying rule at all, only about how generously the codomain was declared alongside it.

### Walkthrough

- **`Double`, rechecked for surjectivity and found lacking** — first appearance of *surjective*, checked and shown to fail for the original, generously-declared codomain.
- **`Double'`, redeclared with codomain `{2, 4, 6}`** — the identical underlying rule, with only its declared codomain changed.
- **Confirming `Double'` is surjective** — demonstrates that surjectivity depends on the specific codomain chosen, not merely on the function's underlying behavior.
- **Confirming `Double'` is also injective, and naming it *bijective*** — first appearance of *bijective*, arrived at directly by confirming both prior properties hold simultaneously for the same function.
- **"surjectivity was never about the underlying rule at all"** — not a new concept, but the explicit statement of this unit's central point, tying Concept Unit 3's codomain-versus-range distinction directly to this unit's finding.

### CS Lens

This is the recognition that whether a mapping "covers" its declared possibilities depends on how those possibilities were declared in the first place, not solely on the mapping's own internal logic — the same distinction Concept Unit 3 already drew between range and codomain, now shown to directly determine surjectivity. Also recognized in: an API's documented set of possible response codes (codomain) versus the response codes it has actually ever returned (range), where declaring the codomain more narrowly, to match reality, would make the API "surjective" in exactly this lesson's sense; a bijective mapping between two equally sized finite sets being exactly what makes a perfect one-to-one pairing possible, as in assigning each of several tasks to exactly one of an equal number of workers; an encoding scheme designed to be bijective specifically so that any encoded message can be decoded back to exactly one original message, with nothing lost and nothing ambiguous; a musical chair game with exactly as many chairs as players, a bijection the moment every chair and every player is paired off with none left over.

### SE Lens

The alternative to checking surjectivity, and to recognizing its dependence on the declared codomain, is to declare a codomain generously "just in case," without ever confirming how much of it is actually used. The real cost of that alternative is exactly what Concept Unit 3 already identified: code written to handle codomain values the function can never actually produce is wasted effort on a case that cannot occur. The distinct additional cost specific to this unit is subtler: mistaking "not surjective" for a flaw in the function's own logic, when the real issue is an overly generous codomain declaration, can lead to fixing the wrong thing entirely — rewriting a perfectly correct rule instead of simply tightening its declared codomain, exactly as this unit did by comparing `Double` against `Double'`.

---

## Closing

### Connect the pieces

One doubling function, traced through every unit built in this lesson, start to finish:

1. **The distinguishing property found (Unit 1):** `WorksIn` relates `Cid` to two outputs; `Double = {(1,2), (2,4), (3,6)}` relates every input to exactly one.
2. **Function, formally defined (Unit 2):** a relation satisfying the single-output requirement, stated precisely using Lesson 14's quantifier notation, confirming everything Lesson 7 already established.
3. **Domain, codomain, and range distinguished (Unit 3):** `Double : {1,2,3} → {1,...,6}`, with range `{2,4,6}` a proper subset of the declared codomain.
4. **Injectivity checked (Unit 4):** `Double` shown injective by exhaustive pairwise checking; `is_valid_score` shown not injective, with `45` and `72` sharing an output.
5. **Surjectivity and bijectivity, via a redeclared codomain (Unit 5):** `Double'`, the identical rule with codomain tightened to `{2,4,6}`, shown to be both surjective and injective — bijective — while `Double` itself, with its original codomain, was not.

Unit 5's `Double'` is not a new function — it is Unit 3's exact `Double`, with nothing changed but its declared codomain, chosen specifically to make the codomain-versus-range distinction from Unit 3 concrete and consequential rather than abstract.

### What breaks without this

Suppose a system needed to reverse `is_valid_score`'s output — given a Boolean result, recover which specific score produced it — on the mistaken assumption that this should always be possible, the way it would be for an injective function like `Double`. Given the output `true`, there is no way to recover a unique original score: `45`, `72`, `85`, `91`, and `100` all produce exactly this same output, and nothing about the value `true` itself carries any information about which one it came from. A system built without checking injectivity first — assuming, incorrectly, that every function can be "run backward" — would either crash attempting this reversal, or worse, silently pick one of the five possible original scores arbitrarily and report it as though it were certain, producing a specific, wrong, confident-sounding answer to a question that, per Concept Unit 4's finding, simply doesn't have a unique answer to give. Restoring this lesson's discipline — checking injectivity explicitly before ever assuming a function can be reversed — catches this before any such system is built at all: `is_valid_score` was never invertible, and no amount of clever engineering changes that, because the information needed to invert it was never there in the first place.

### Exercises

1. **Observe.** Take a relation from Lesson 17's exercises (your own, or `WorksIn`) and check whether it satisfies the single-output requirement from Concept Unit 2. If it doesn't, name a specific input with more than one output, the way Concept Unit 1 named `Cid`.
2. **Formalize.** Define a small function of your own (three or four domain elements are enough), stating its domain and a codomain explicitly, the way Concept Unit 3 stated `Double : {1, 2, 3} → {1, ..., 6}`.
3. **Formalize.** Work out your Exercise 2 function's actual range by applying it to every domain element, and compare it against your declared codomain, the way Concept Unit 3 compared `{2, 4, 6}` against `{1, ..., 6}`.
4. **Explain.** Check your Exercise 2 function for injectivity, by exhaustively comparing every pair of domain elements, the way Concept Unit 4 checked `Double`. If it's not injective, name the specific pair of inputs that disproves it.
5. **Formalize.** If your Exercise 2 function is not surjective, redeclare its codomain to exactly match its actual range, the way Concept Unit 5 redeclared `Double` as `Double'`. Confirm the redeclared version is surjective, and check whether it is also injective — and if both hold, confirm it is bijective.

### Definition of done

- [ ] You can state, in your own words, the single extra requirement that turns a relation into a function, and check a specific relation against it.
- [ ] You can name the domain, codomain, and actual range of a function of your own choosing, and explain a case where the range is a proper subset of the codomain.
- [ ] You can check a function for injectivity by exhaustive pairwise comparison, and produce a specific counterexample pair when it fails.
- [ ] You can explain, using your own example, why surjectivity depends on how a codomain is declared, not only on a function's underlying rule.
- [ ] You completed Exercises 1–5 using your own relation and function, not `WorksIn`, `Double`, or `is_valid_score`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating whether your Exercise 2 function turned out to be injective, surjective, both, or neither, and whether that result matched your expectation before checking.
