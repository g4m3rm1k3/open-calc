# Lesson 23: Direct Proof

**What you will build:** Still nothing runnable — this lesson teaches the most basic technique for actually constructing a proof (Lesson 22): starting from a precise definition, and an arbitrary case satisfying it, and following a chain of justified steps straight to the desired conclusion. The transferable problem this lesson is actually about: Lesson 22 explained what makes an argument a genuine proof and showed what happens when a step isn't justified, but it never showed, concretely, how to actually build a valid chain of steps in the first place — this lesson does exactly that, twice, and then shows a specific, common way the technique goes wrong.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *operation*, reused directly in the algebra of both worked proofs. Lesson 5 (`FP-L005-names-and-bindings.md`) — specifically *name* and *binding*, reused directly in Concept Unit 5 to diagnose a common proof mistake. Lesson 14 (`FP-L014-quantifiers.md`) — specifically *witness*, reused throughout as the concrete number each proof produces. Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) — specifically *proof*, and its requirement that every step be individually valid, both directly applied here.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Direct proof** — a proof (Lesson 22) that starts from a hypothesis, taken as given, and reaches its conclusion through a straight chain of steps, each justified by a definition or an already-established fact, with no step reasoning about what it's trying to prove until after everything leading up to it has already been established. "Direct" distinguishes this style from other proof strategies this curriculum will introduce later, which reach a conclusion by a less direct route.
- **Hypothesis** — the condition a direct proof is allowed to assume as already true, stated at the very start, before any reasoning begins. A proof's hypothesis plays exactly the role Lesson 9's precondition played for a function: the starting ground the rest of the argument is built on.
- **Conclusion** (of a proof) — the statement a direct proof is trying to establish, reached only at the very end, once every step of the chain from the hypothesis has been justified. Writing down the conclusion early, and reasoning as though it were already true partway through the proof, is exactly the mistake Lesson 22 warned against.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation.

---

## Concept Unit 1: What "Following From Definitions" Actually Means — Defining Even Precisely

### The Problem

"An even number" feels perfectly clear informally — a number divisible by 2. But Lesson 22's proof standard requires every step to follow necessarily from something already established, and "divisible by 2" is itself an informal phrase until it's pinned down precisely enough to actually reason with. Before any proof about even numbers can be built, "even" needs the same precise treatment Lesson 1 demanded of every computational problem.

### No isolated lab for this step

This concept has no code of its own to isolate — pinning down a precise definition is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Defining Even Precisely

**The informal notion:** a number is even if it's divisible by 2.

**The precise definition, stated using Lesson 14's existential quantifier directly:** a number `n` is even if `∃k, n = 2k`, where `k` is a whole number — that is, `n` is even exactly when some whole number `k` exists such that doubling `k` gives back `n`.

**Confirming this matches the informal notion, on a specific case:** is `6` even? `6 = 2 × 3`, so `k = 3` works — `3` is a witness (Lesson 14) to `6`'s evenness. Is `7` even? There is no whole number `k` with `2k = 7` — no witness exists, so `7` is not even.

**Why this precise form is what a proof actually needs:** "some whole number `k` exists such that `n = 2k`" is a statement this curriculum already has exact tools for — Lesson 14's existential quantifier, and ordinary algebra. "Divisible by 2," left as an unanalyzed phrase, is not something a chain of justified steps can be built from directly.

### Walkthrough

- **`∃k, n = 2k`** — first appearance of evenness stated with full precision, using *existential quantifier* (Lesson 14) rather than the informal phrase "divisible by 2."
- **`6 = 2 × 3`, with `3` identified as a witness** — a direct reappearance of *witness* (Lesson 14), applied here to confirm the precise definition matches intuition on a concrete case.
- **`7`, shown to have no such witness** — confirms the definition correctly excludes a number that shouldn't count as even.

### CS Lens

This is the same move Lesson 1 made for "what is a problem" and Lesson 2 made for "passed" — replacing an intuitively clear but informally stated idea with a precise, checkable definition before building anything further on top of it. Also recognized in: a legal statute defining "vehicle" precisely, rather than relying on everyone's informal sense of the word, before any law referencing it can be enforced consistently; a scientific field defining "species" precisely enough to classify edge cases, rather than relying on an intuitive notion; a standards body defining exactly what counts as a valid email address before software can be built to check for one reliably; a sport's rulebook defining exactly what counts as "out of bounds," down to the exact boundary line, rather than relying on players' shared intuition.

### SE Lens

The alternative to pinning down "even" precisely is to reason about it using only the informal notion, trusting that everyone agrees on what it means closely enough for a proof to work. The real cost of that alternative is exactly what Lesson 22, Concept Unit 3, demonstrated for the flawed `1 = 2` argument: a step that seems to follow from an informal understanding of a concept can hide an assumption nobody actually stated or checked. Pinning down a precise definition before proving anything about it, as this unit does, costs the work of stating it exactly; it is what makes every later step in this lesson's worked proofs actually checkable against something concrete, rather than against a shared feeling.

---

## Concept Unit 2: Direct Proof — the Standard Shape

### The Problem

Concept Unit 1 established a precise definition to reason with, but not yet how to actually build a chain of steps from a starting assumption to a desired conclusion. Every direct proof this lesson builds will follow the same basic shape, and it's worth naming that shape explicitly before working through an actual example, so the structure is recognizable rather than incidental.

### No isolated lab for this step

This concept has no code of its own to isolate — the shape of a direct proof is stated directly below, to be filled in with a real example in the next unit, not through a construct with its own syntax.

### Applying It — the Shape, Named Before It's Filled In

**The three parts, named directly:**

> - **Hypothesis:** what the proof is allowed to assume as already true, stated first.
> - **Conclusion:** what the proof is trying to establish, stated clearly, but not treated as already true until it's actually been reached.
> - **The chain:** a sequence of steps, starting from the hypothesis, each justified by a definition or an already-established fact, ending exactly at the conclusion.

**Connecting this directly to Lesson 22's requirement:** "each justified by a definition or an already-established fact" is precisely Lesson 22's own standard for a valid step — this shape doesn't relax that standard at all; it simply organizes the argument so the standard is easy to check, step by step, in order.

**Connecting this directly to Lesson 9's contract:** a proof's hypothesis and conclusion play exactly the roles a function's precondition and postcondition played — "if the hypothesis holds, then the chain of steps guarantees the conclusion holds too," the same "if... then..." structure Lesson 11's implication formalized.

### Walkthrough

- **The three-part shape (hypothesis, conclusion, chain)** — first appearance of *direct proof*'s standard structure, stated before any concrete example fills it in, so the structure itself is what's being learned first.
- **The explicit link to Lesson 22's step-validity requirement** — not a new concept, but confirmation that this shape doesn't introduce any new standard; it only organizes an already-established one.
- **The explicit link to Lesson 9's contract** — a reappearance of *contract*, *precondition*, and *postcondition*, drawing a direct structural parallel between a function's guarantee and a proof's own hypothesis-to-conclusion guarantee.

### CS Lens

This is the recognition that a proof has a standard, checkable shape — much the way a computational problem, per Lesson 1, always has an input, an output, and a desired relationship between them — rather than being an unstructured, ad hoc piece of clever reasoning. Also recognized in: a legal argument's standard structure, moving from stipulated facts through applicable law to a stated conclusion; a scientific paper's structure, moving from stated assumptions through methodology to a stated result; a geometric proof's classic two-column format, explicitly separating each statement from its justification; an engineering design review's structure, moving from stated requirements through a chain of justified decisions to a final design.

### SE Lens

The alternative to following a standard shape is to write a proof as a freeform argument, wherever intuition happens to lead, without a consistent structure separating what's assumed from what's being shown. The real cost of that alternative is exactly what makes Lesson 22's flawed `1 = 2` argument hard to critique at a glance — an unstructured argument makes it easy to lose track of which statement is the hypothesis, which is the conclusion, and whether a given line is actually a justified step or a restatement of what's being proven. Following the standard shape, hypothesis first, conclusion stated but not assumed, a clearly justified chain between them, costs nothing beyond organizing the argument this way; it makes every step's validity checkable in isolation, exactly the discipline Lesson 22 demanded.

---

## Concept Unit 3: A Worked Proof — the Sum of Two Even Numbers Is Even

### The Problem

Concept Unit 2 named the shape; it's time to actually fill it in, with a real claim, checked against Lesson 22's full standard rather than merely asserted.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete worked proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**Hypothesis:** `a` and `b` are even numbers.

**Conclusion:** `a + b` is even.

**The chain:**

> 1. Since `a` is even, by Concept Unit 1's definition, there exists a whole number `k` such that `a = 2k`.
> 2. Since `b` is even, by the same definition, there exists a whole number `j` such that `b = 2j`.
> 3. Adding: `a + b = 2k + 2j`.
> 4. Factoring, using ordinary arithmetic (Lesson 3): `a + b = 2(k + j)`.
> 5. `k + j` is a whole number, since `k` and `j` are both whole numbers.
> 6. `a + b = 2(k + j)`, with `(k + j)` a whole number, is exactly the form Concept Unit 1's definition requires for `a + b` to be even — the witness is `(k + j)`.
> 7. Therefore, `a + b` is even.

**Checking this chain against Lesson 22's step-by-step standard:** Step 1 and Step 2 apply Concept Unit 1's definition directly, using two separately named witnesses, `k` and `j`, not the same one — a deliberate choice examined closely in Concept Unit 5. Step 3 is ordinary substitution (Lesson 5). Step 4 is ordinary factoring (Lesson 3's operations, run in reverse). Step 5 and Step 6 confirm the result actually matches the definition's required form, rather than merely looking similar to it. Every step follows from either Concept Unit 1's definition or already-established arithmetic — nothing is assumed beyond the stated hypothesis.

### Walkthrough

- **The hypothesis and conclusion, stated first and separately** — a direct application of Concept Unit 2's shape.
- **Steps 1 and 2, introducing `k` and `j`** — a reappearance of *witness* (Lesson 14), one per number, chosen deliberately as two independent names rather than one shared name.
- **Steps 3 through 6, pure algebra and a direct check against the definition** — demonstrates the actual mechanics of "following from definitions": each step is either substitution, arithmetic, or a direct comparison to Concept Unit 1's stated requirement.
- **Step 7, the conclusion, reached only now** — confirms the conclusion was never assumed partway through; it is reached exactly at the point the chain actually establishes it.

### CS Lens

This is the concrete mechanics of unfolding a definition — replacing an abstract property ("is even") with its precise defining condition ("equals twice some whole number"), doing ordinary manipulation on that condition, and then checking the result against the definition of whatever's being concluded. Also recognized in: unfolding a function's definition to trace exactly what it computes for a specific case, rather than trusting its name alone; unfolding a legal definition's precise wording to determine whether a specific situation actually satisfies it; unfolding a chemical compound's molecular structure to predict how it will react, rather than reasoning from its common name; unfolding an architectural blueprint's precise specifications to verify a building actually meets code, rather than trusting its general description.

### SE Lens

The alternative to this careful, step-by-step unfolding is to reason about "even numbers" using only intuition about how they behave, without ever grounding each step in the actual definition. The real cost of that alternative is exactly the risk Lesson 22 named: an intuitive argument can feel completely convincing while resting on an assumption nobody checked, in a way this fully unfolded proof cannot, because every single step here traces back to either Concept Unit 1's exact definition or previously established arithmetic. Writing out the full chain, as this unit does, costs more space and more explicit care than an intuitive sketch would; it buys an argument that can be checked, line by line, against Lesson 22's exact standard, with nowhere for a hidden gap to hide.

---

## Concept Unit 4: A Second Worked Proof — the Product of Two Odd Numbers Is Odd

### The Problem

One worked proof might look like a special case, tailored to a claim that happens to work out cleanly. A second proof, using a related but different definition and a different operation, confirms the technique itself generalizes, rather than being a trick specific to evenness and addition.

### No isolated lab for this step

This concept has no code of its own to isolate — the second complete worked proof is given directly below, not through a construct with its own syntax.

### Applying It — Odd Numbers and Multiplication

**A precise definition of odd, built the same way Concept Unit 1 built evenness:** a number `n` is odd if `∃k, n = 2k + 1`, for some whole number `k`.

**Hypothesis:** `a` and `b` are odd numbers.

**Conclusion:** `a × b` is odd.

**The chain:**

> 1. Since `a` is odd, there exists a whole number `k` such that `a = 2k + 1`.
> 2. Since `b` is odd, there exists a whole number `j` such that `b = 2j + 1`.
> 3. Multiplying: `a × b = (2k + 1)(2j + 1)`.
> 4. Expanding, using ordinary algebra: `a × b = 4kj + 2k + 2j + 1`.
> 5. Factoring out `2` from the first three terms: `a × b = 2(2kj + k + j) + 1`.
> 6. `2kj + k + j` is a whole number, since `k` and `j` are whole numbers and whole numbers are closed under multiplication and addition.
> 7. `a × b = 2(2kj + k + j) + 1`, with `(2kj + k + j)` a whole number, is exactly the form odd requires — the witness is `(2kj + k + j)`.
> 8. Therefore, `a × b` is odd.

**Confirming the technique is the same, even though the algebra looks different:** exactly as in Concept Unit 3, two independent witnesses were introduced (Steps 1 and 2), ordinary algebra was applied (Steps 3 through 5), and the result was checked directly against the target definition (Steps 6 and 7) before the conclusion was finally stated (Step 8).

### Walkthrough

- **`∃k, n = 2k + 1`** — a definition built the same way as *even* (Concept Unit 1), but for odd numbers, chosen specifically to require genuinely different algebra than the first proof.
- **Steps 1–2, introducing two independent witnesses again** — a direct reappearance of Concept Unit 3's same discipline, confirming it wasn't specific to that one proof.
- **Steps 3–5, expanding and refactoring `(2k+1)(2j+1)`** — new algebraic content, distinct from Concept Unit 3's simple factoring, demonstrating the technique adapts to whatever manipulation the specific claim actually requires.
- **Steps 6–8, checking against the definition and only then concluding** — the same closing discipline as Concept Unit 3, confirming the overall shape (Concept Unit 2) is what's actually reusable, not any one specific piece of algebra.

### CS Lens

This is the recognition that "unfold the definitions, manipulate, check against the target form" is a reusable strategy, not a one-off trick — the same kind of generalization Lesson 7 made for a specific calculation, here applied to a proof technique instead of an arithmetic one. Also recognized in: a general debugging strategy (isolate, unfold what each piece actually does, compare against expected behavior) applied successfully to bugs of very different kinds; a general negotiation strategy applied successfully across very different specific disputes; a general research methodology applied successfully across different scientific questions; a general troubleshooting checklist applied successfully to different kinds of mechanical failures, precisely because the checklist's structure, not its specific content, is what generalizes.

### SE Lens

The alternative to confirming the technique generalizes is to treat Concept Unit 3's proof as a special trick, applicable only to that one claim, and to reach for a different, unrelated approach for every new claim encountered. The real cost of that alternative is exactly Lesson 7's original repetition cost, transplanted to proof: without recognizing "unfold, manipulate, check, conclude" as one reusable strategy, every new proof would have to be approached as though from scratch, with no transferable lesson carried forward from the last one. Working through a second, algebraically different proof using the identical structure, as this unit does, costs the extra effort of a second full worked example; it confirms, concretely, that the strategy itself — not just the specific steps of one proof — is what's actually being learned.

---

## Concept Unit 5: A Common Mistake — Reusing the Same Witness for Two Different Numbers

### The Problem

Concept Units 3 and 4 both deliberately introduced two separately named witnesses, `k` and `j`, rather than reusing the same name for both numbers' witnesses. It's worth showing directly why this matters, because reusing a single name is an easy, common mistake that can slip past a reader who isn't checking carefully — exactly the kind of single-step failure Lesson 22, Concept Unit 3, warned a whole proof can hinge on.

### No isolated lab for this step

This concept has no code of its own to isolate — the flawed attempt is worked through directly below, with its error located precisely, not through a construct with its own syntax.

### Applying It — the Flawed Attempt

**A flawed attempt at Concept Unit 3's exact proof, differing in exactly one place:**

> 1. Since `a` is even, there exists a whole number `k` such that `a = 2k`.
> 2. Since `b` is even, there exists a whole number `k` such that `b = 2k`.
> 3. Adding: `a + b = 2k + 2k = 4k`.
> 4. `4k = 2(2k)`, and `2k` is a whole number, so `a + b` is even.

**Checking this against Concept Unit 1's definition, and against Lesson 5's own vocabulary directly:** Step 2 introduces a witness for `b` using the exact same name, `k`, already bound (Lesson 5) to `a`'s witness in Step 1. But Lesson 5 established that a name, once bound, stands for one specific value — reusing `k` for `b`'s witness silently claims `b`'s witness is the *same* whole number as `a`'s witness, which forces `a = 2k` and `b = 2k` to be equal to each other.

**What this flawed argument actually establishes, precisely, rather than what it claims to establish:** not "the sum of any two even numbers is even," but only "the sum of an even number and itself is even" — a much narrower, less useful claim, smuggled in by an unjustified reuse of a bound name.

**Confirming the flaw is real, using a concrete counterexample the flawed proof cannot actually handle:** `a = 6` and `b = 10` are both even, but genuinely different, so they cannot both be `2k` for the same `k` — `6 = 2 × 3` and `10 = 2 × 5` require two different witnesses, `3` and `5`, exactly as Concept Unit 3's correct proof used two independent names.

### Walkthrough

- **Step 2, reusing `k` instead of introducing a fresh name** — the single altered step, deliberately isolated so the rest of the flawed argument can be seen to be otherwise identical to Concept Unit 3's correct one.
- **"a name, once bound, stands for one specific value"** — a direct reappearance of *binding* (Lesson 5), applied here to diagnose exactly why reusing `k` is illegitimate, not merely stylistically sloppy.
- **"the sum of an even number and itself is even"** — states precisely what the flawed argument actually proves, distinguishing it sharply from what it was claimed to prove.
- **`a = 6`, `b = 10`, needing witnesses `3` and `5`** — a concrete case the flawed proof's hidden assumption (`a = b`) cannot accommodate, confirming the flaw is real and not merely a stylistic objection.

### CS Lens

This is a specific instance of a general failure: silently narrowing a claim's actual scope by introducing an unstated constraint, then presenting the narrower result as though it answered the original, broader question. Also recognized in: a function tested only with two identical input values, whose passing test says nothing about its behavior on two different inputs; a scientific study whose participants secretly share a hidden characteristic, whose conclusion is then wrongly generalized to a broader population; a search algorithm verified only on already-sorted input, whose correctness on that narrow case says nothing about unsorted input; a legal argument that quietly assumes two parties are identical in some relevant way, reaching a conclusion that doesn't actually hold once that hidden assumption is removed.

### SE Lens

The alternative to checking every witness introduction for accidental reuse is to trust that using a short, convenient variable name like `k` twice is harmless shorthand. The real cost of that alternative is exactly what this unit demonstrates: two uses of the same bound name silently claim those two things are equal, which is a substantive, easily overlooked mathematical claim disguised as a notational convenience — precisely the kind of single flawed step Lesson 22 warned can invalidate an otherwise well-constructed argument. Deliberately checking that every witness gets its own independent name, unless there's a specific reason to require them equal, costs nothing beyond the discipline Concept Units 3 and 4 already modeled; it is exactly what distinguishes a proof of the actual, general claim from a proof of a narrower, silently substituted one.

---

## Closing

### Connect the pieces

Two direct proofs, traced through every unit built in this lesson, start to finish:

1. **A precise definition, built first (Unit 1):** even, defined as `∃k, n = 2k`, confirmed against concrete cases `6` and `7`.
2. **The standard shape, named before being used (Unit 2):** hypothesis, conclusion, and a justified chain between them, tied directly to Lesson 22's step-validity standard and Lesson 9's contract structure.
3. **A full worked proof (Unit 3):** the sum of two even numbers is even, using two independent witnesses, `k` and `j`.
4. **A second full worked proof, confirming generalization (Unit 4):** the product of two odd numbers is odd, using the identical technique on different algebra.
5. **A common mistake, precisely diagnosed (Unit 5):** reusing `k` for both witnesses in Unit 3's proof, shown to silently narrow the claim to only `a = b`, using Lesson 5's binding vocabulary to explain exactly why.

Unit 5's flawed argument is not a new example — it is Unit 3's exact proof, with exactly one word changed, chosen specifically so the consequence of that one change could be isolated and understood precisely.

### What breaks without this

Suppose Unit 5's flawed argument had been accepted as a genuine proof that the sum of any two even numbers is even, and a later piece of reasoning — checking, say, that a scheduling system correctly handles combining two independently computed even-numbered batch sizes — relied on it. The scheduling system would work flawlessly whenever the two batch sizes happened to be equal, exactly the narrow case the flawed proof actually covers, and could fail in a genuinely untested way the moment two different even batch sizes needed to be combined — say, `6` and `10` — because nothing about the flawed argument ever actually established that case, despite claiming to. The failure would be invisible until that specific combination of unequal batch sizes actually occurred, at which point whoever investigates would have no reason to suspect the "already proven" claim about even numbers, since it was never flagged as narrower than it appeared. Restoring Unit 5's discipline — checking every witness for accidental, unjustified reuse — catches this before the flawed proof is ever trusted, by requiring `a` and `b`'s witnesses to be independent from the very first step, exactly as Unit 3 originally, correctly, did it.

### Exercises

1. **Observe.** Write a precise definition, in the style of Concept Unit 1's `∃k, n = 2k`, for a property of your own choosing (a number being a multiple of 3, a number being a perfect square).
2. **Formalize.** State a claim involving your Exercise 1 definition, in the hypothesis/conclusion form Concept Unit 2 established (for instance, "if `a` and `b` are multiples of 3, then `a + b` is a multiple of 3").
3. **Formalize.** Write a full direct proof of your Exercise 2 claim, following Concept Unit 3 and 4's exact structure: unfold the definition for each hypothesis, do the necessary algebra, check the result against the target definition, and only then state the conclusion.
4. **Explain.** Check your Exercise 3 proof against Lesson 22's step-validity standard, explicitly justifying each individual step, the way Concept Unit 3 and 4's walkthroughs did.
5. **Explain.** Deliberately introduce Concept Unit 5's exact mistake into your Exercise 3 proof — reuse one witness name for both numbers — and explain, precisely, what narrower claim the resulting flawed argument actually establishes, and why.

### Definition of done

- [ ] You can state a definition precisely enough to reason from, using an existential quantifier rather than an informal phrase.
- [ ] You can write a complete direct proof with an explicitly stated hypothesis, conclusion, and a fully justified chain of steps between them.
- [ ] You can explain, using Lesson 5's vocabulary, exactly why reusing a witness name across two supposedly independent numbers narrows a proof's actual claim.
- [ ] You can identify, in a proof someone else wrote (or one you wrote earlier), whether every witness introduced is genuinely independent or accidentally reused.
- [ ] You completed Exercises 1–5 using your own definition and claim, not evenness or oddness.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating what your Exercise 3 proof's witness actually represented, in plain language, once you unfolded your own definition.
