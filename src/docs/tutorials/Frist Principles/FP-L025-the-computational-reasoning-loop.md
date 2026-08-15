# Lesson 25: The Computational Reasoning Loop

**What you will build:** Still nothing runnable — this lesson names a cycle this curriculum has actually been running, in some form, since Lesson 1, and completes one full lap of it explicitly, using nothing but tools already built across this era. The transferable problem this lesson is actually about: the twenty-four lessons before this one can look, in hindsight, like twenty-four separate topics — situations, values, functions, sets, proofs — rather than what they actually are, which is one recurring workflow, applied over and over to progressively richer material. This lesson steps back and shows the workflow itself, then runs it once, start to finish, on a claim this curriculum has been quietly relying on since Lesson 9 without ever actually proving.

**What you need to know first:** This lesson deliberately draws on nearly everything in this era. Most directly: Lesson 1 (`FP-L001-what-is-a-problem.md`) for *specification*; Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) for the exact contract this lesson finally proves; Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) through Lesson 24 (`FP-L024-proof-by-cases-and-counterexample.md`) for *evidence*, *proof*, and *counterexample*.

**Pipeline diagram:** Not applicable yet in the sense Lesson 4 defined it — but this lesson introduces this curriculum's first real pipeline, named directly in Concept Unit 1, and every later lesson in this curriculum will be understood as passing through some portion of it.

## Terms introduced in this lesson

- **Computational reasoning loop** — the recurring cycle this curriculum follows for any nontrivial computational problem: state the problem and its specification precisely (Lesson 1), build a model precise enough to compute with (Lessons 3 through 20), check the model against examples (Lesson 22), prove the model actually does what the specification requires (Lessons 23 and 24), then implement and test it for real — with the final step, generalizing what was learned to the next problem, feeding directly back into the start of the loop for whatever comes next.
- **Model** — a precise, computable structure — typically a function together with its contract (Lesson 9) — built to represent a specification (Lesson 1) concretely enough to actually reason about and eventually compute with. A specification says what's wanted, in words and logic; a model is the actual mathematical object built to satisfy it.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using Lesson 9's `total_with_tax` as its single running example for a complete lap of the loop.

---

## Concept Unit 1: Naming the Loop — What This Curriculum Has Actually Been Doing

### The Problem

Read in sequence, Lessons 1 through 24 look like a tour through separate topics: problems, then values, then functions, then sets, then proof. But looked at from a distance, a pattern emerges that every single one of those lessons was actually an instance of: start with something vague, make it precise, build something computable from the precise version, check it, and only then trust it. This pattern deserves a name, and deserves to be shown explicitly, rather than left as something a learner might or might not notice on their own by the end of an era.

### No isolated lab for this step

This concept has no code of its own to isolate — naming a pattern already present across this era's own lessons is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Mapping the Loop Onto This Era

**Stage 1, naming the problem and its specification precisely:** Lesson 1's situation-question-specification-computational-problem chain, and Lesson 2's turning a vague request into an explicit rule.

**Stage 2, building a model precise enough to compute with:** Lessons 3 through 9's values, operations, expressions, names, functions, composition, and contracts — the machinery this curriculum built specifically to turn a specification into something with an actual, checkable structure. Lessons 10 through 20 extended this same modeling work into logic, sets, relations, and order.

**Stage 3, checking the model against examples:** something every one of this era's lessons has done informally throughout — checking `total_with_tax(8.20, 0.10) = 9.02` in Lesson 7, checking `is_valid_score` against several scores in Lesson 13 — made explicit and named precisely in Lesson 22.

**Stage 4, proving the model actually satisfies its specification:** Lesson 23's direct proof and Lesson 24's proof by cases, the tools for actually establishing, rather than merely suggesting, that a model does what it claims.

**Stage 5, implementing and testing for real, and generalizing to what comes next:** not yet built in this curriculum — named honestly here, and returned to directly in Concept Unit 5.

**Naming the whole cycle:** the computational reasoning loop.

### Walkthrough

- **The five stages, each mapped to specific earlier lessons by name** — not new concepts individually, but the explicit naming of a structure this era's lessons have already been instances of, all along.
- **"the computational reasoning loop"** — first appearance of this lesson's central term, defined by exactly the five-stage mapping just completed.

### CS Lens

This is the recognition that a body of specific techniques, learned one at a time, can be unified retroactively into one general process — the same kind of unification Lesson 18 performed for "function," and Lesson 24 performed for "counterexample," now applied at the scale of an entire era rather than a single concept. Also recognized in: an apprentice craftsperson who has learned many individual techniques gradually coming to see them as instances of one overall design process; a scientist recognizing that many specific experiments they've run all followed the same underlying scientific method; a musician recognizing that pieces they've learned to play by ear all followed the same underlying compositional structure; a new engineer recognizing, after several projects, that they've been unconsciously following the same design-review-build-test cycle each time.

### SE Lens

The alternative to naming this loop explicitly is to let a learner finish this era having absorbed twenty-four separate techniques without ever being shown they were all instances of one repeatable process. The real cost of that alternative is exactly what this curriculum's own stated philosophy warns against: a curriculum that feels like a list of topics rather than one continuous development, leaving a learner unable to recognize the same underlying process the next time it's needed, in an unfamiliar setting this specific era never covered. Naming the loop explicitly, as this unit does, costs one retrospective pass over material already learned; it is what turns twenty-four individual skills into one transferable habit of mind.

---

## Concept Unit 2: One Complete Lap, Stage 1 — Problem, Specification, and Model

### The Problem

Naming the loop in the abstract, as Concept Unit 1 did, is not the same as actually running it. The rest of this lesson runs one complete lap, on a claim this curriculum has genuinely never proven: Lesson 9 stated, as part of `total_with_tax`'s contract, that its result is never less than its subtotal — and checked this on exactly one example. It has been trusted and reused ever since (Lesson 13's contract-as-predicate, Lesson 22's own discussion of reuse) without ever actually being proven.

### No isolated lab for this step

This concept has no code of its own to isolate — running Stage 1 of the loop on a real, already-familiar claim is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Stage 1, on Lesson 9's Unproven Claim

**The problem, in Lesson 1's own vocabulary:** a store needs to know that computing a total with tax never produces a number smaller than the original subtotal — losing money on a receipt purely from adding tax would be an obvious defect.

**The specification, precisely, in Lesson 9's own words:** given `subtotal ≥ 0` and `0 ≤ tax_rate < 1` (the precondition), `total_with_tax(subtotal, tax_rate) ≥ subtotal` (the second clause of the postcondition).

**The model, already built, cited rather than rebuilt:** `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`, from Lesson 7, together with its full contract from Lesson 9.

**Confirming this really is Stage 2 of the loop, not merely a restatement:** the model is not the specification restated — it is a specific, computable function, already built, that Stage 3 and Stage 4 can now actually examine.

### Walkthrough

- **The problem statement, in Lesson 1's vocabulary** — a direct application of *situation* and *question* to this specific, already-familiar claim.
- **The specification, quoted from Lesson 9 precisely** — a reappearance of *precondition* and *postcondition*, examined here as the actual target this lesson's proof will need to establish.
- **`total_with_tax`, cited as the already-built model** — first appearance of *model* used precisely, distinguishing the specification (what's wanted) from the already-constructed function and contract (what was built to satisfy it).

### CS Lens

This is the recognition that Stage 1 and Stage 2 of the loop don't always have to be built from nothing — sometimes, as here, the specification and model already exist from earlier work, and what's missing is a later stage of the same loop, not the whole loop from scratch. Also recognized in: a code review that doesn't re-derive a function's purpose from scratch, but instead checks whether an already-built function actually satisfies its already-stated specification; an audit that takes an organization's stated policies as given and checks whether actual practice satisfies them; a building inspection that takes an already-approved blueprint as given and checks whether the actual construction matches it; a peer review in science that takes a hypothesis as already stated and examines whether the actual experiment supports it.

### SE Lens

The alternative to explicitly citing Lesson 9's already-existing specification and model is to restate them from scratch, as though this were an entirely new problem unrelated to earlier work. The real cost of that alternative is exactly the duplication this curriculum has repeatedly warned against — re-deriving something already correctly built, rather than reusing it directly. Citing Stage 1 and Stage 2 precisely, as already-completed work, costs nothing beyond pointing back to it accurately; it lets this lesson's actual new contribution — Stage 3 and Stage 4, which follow — start from solid, already-established ground.

---

## Concept Unit 3: One Complete Lap, Stage 2 — Checking Examples Before Committing to Proof

### The Problem

Lesson 24, Concept Unit 5, recommended hunting for a counterexample before investing in a full proof. Before constructing an actual proof of `total_with_tax(subtotal, tax_rate) ≥ subtotal`, that same discipline should be applied here — checking a few examples, and specifically trying to break the claim, before trusting it enough to spend real effort proving it.

### No isolated lab for this step

This concept has no code of its own to isolate — hunting for a counterexample against this specific claim is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Hunting Against `total_with_tax`

**A first check, using Lesson 9's original example:** `total_with_tax(8.20, 0.10) = 9.02`. Is `9.02 ≥ 8.20`? Yes.

**A second check, trying a tax rate near the precondition's boundary:** `total_with_tax(50.00, 0.99)`. `50.00 × 0.99 = 49.50`; `50.00 + 49.50 = 99.50`. Is `99.50 ≥ 50.00`? Yes, easily.

**A third check, trying a subtotal of exactly zero, a boundary of the precondition's other clause:** `total_with_tax(0, 0.10) = 0 + 0 × 0.10 = 0`. Is `0 ≥ 0`? Yes — the postcondition allows equality, not only strict increase.

**Confirming the hunt found nothing, and what that does and doesn't establish, per Lesson 22:** three checks, including two deliberately chosen near the precondition's edges, all satisfy the claim. This is evidence the claim is worth the effort of an actual proof — it is not, itself, that proof, exactly as Lesson 22's `n² + n + 41` warned.

### Walkthrough

- **`total_with_tax(8.20, 0.10)`, rechecked from Lesson 9** — confirms the loop's Stage 3 doesn't discard earlier checked examples, but builds on them.
- **`total_with_tax(50.00, 0.99)` and `total_with_tax(0, 0.10)`, deliberately chosen near the precondition's boundaries** — a reappearance of *boundary value* (Lesson 2), applied here specifically because a boundary is exactly where a claim like this is most likely to fail if it's going to fail at all.
- **"evidence the claim is worth the effort of an actual proof... not, itself, that proof"** — a direct reappearance of Lesson 22's central distinction, applied here to this lesson's own claim rather than to `n² + n + 41`.

### CS Lens

This is Stage 3 of the loop performed exactly as Lesson 22 and Lesson 24 both taught: deliberately, honestly, and specifically aimed at the boundaries where a claim is most likely to break, rather than at comfortable, central examples that would prove nothing even if they all passed. Also recognized in: a software tester specifically probing boundary values and edge cases rather than only typical inputs, exactly as Lesson 2's own edge-case discipline first recommended; a bridge engineer specifically stress-testing a design at its stated load limit rather than only under typical traffic; a new medication specifically tested at both its minimum and maximum intended doses; a legal argument specifically tested against its hardest, most extreme hypothetical cases before being presented as settled.

### SE Lens

The alternative to deliberately checking boundary cases is to check a few comfortable, typical examples and stop, exactly the failure mode Lesson 2, Concept Unit 3, already warned against. The real cost of that alternative here specifically would be a false sense of security heading into Stage 4: if this unit had only checked ordinary, mid-range values and skipped the boundaries, a genuine flaw sitting exactly at `subtotal = 0` or `tax_rate` near its upper limit could have gone unnoticed until the proof attempt itself, or worse, until after the claim had already been trusted. Deliberately hunting at the boundaries, as this unit does, costs the extra discipline of choosing harder examples rather than easy ones; it is what makes this lesson's decision to proceed to an actual proof genuinely well informed, not merely optimistic.

---

## Concept Unit 4: One Complete Lap, Stage 3 — Constructing the Proof

### The Problem

Concept Unit 3's hunt found no counterexample, including at both boundaries — enough evidence, per Lesson 22 and Lesson 24, to justify actually attempting a proof. Lesson 23's direct-proof technique is the right tool here: the claim doesn't split into distinct situations the way Lesson 24's `n² + n` did, so a single, unbroken chain should suffice.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete direct proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**Hypothesis:** `subtotal ≥ 0` and `0 ≤ tax_rate < 1`.

**Conclusion:** `subtotal + subtotal × tax_rate ≥ subtotal`.

**The chain:**

> 1. Since `subtotal ≥ 0` and `tax_rate ≥ 0` (both from the hypothesis), their product, `subtotal × tax_rate`, is non-negative — the product of two non-negative numbers is never negative, a fact about ordinary arithmetic taken as already established at this point in the curriculum.
> 2. `subtotal × tax_rate ≥ 0`.
> 3. Adding `subtotal` to both sides of this inequality, an operation that preserves the direction of the inequality (also taken as an already-established arithmetic fact): `subtotal + subtotal × tax_rate ≥ subtotal + 0`.
> 4. `subtotal + 0 = subtotal`, by ordinary arithmetic (Lesson 3).
> 5. Therefore, `subtotal + subtotal × tax_rate ≥ subtotal`.

**Confirming this matches the conclusion exactly:** Step 5 is precisely the conclusion stated at the start — not something close to it, or something that suggests it, but the exact statement, reached through a chain where every step is justified by the hypothesis or by an already-established fact, exactly as Lesson 22 and Lesson 23 both require.

**Stating what has actually been accomplished, precisely:** Lesson 9's postcondition — checked on exactly one example, back when this curriculum had no proof techniques at all — has now been genuinely established, for every `subtotal` and `tax_rate` satisfying the precondition, not merely for the ones checked in Concept Unit 3 or in Lesson 9 itself.

### Walkthrough

- **The hypothesis and conclusion, stated first, exactly per Lesson 23's shape** — a direct reappearance of *direct proof*'s standard structure.
- **Step 1, citing that a product of two non-negatives is non-negative** — an appeal to an already-established arithmetic fact, explicitly flagged as such rather than silently assumed, in keeping with Lesson 22's standard.
- **Steps 3 and 4, ordinary algebra** — a reappearance of Lesson 3's operations, applied without any new mechanism.
- **Step 5, matching the conclusion exactly** — confirms, precisely, that the chain actually reaches what it claimed to, rather than something merely similar.

### CS Lens

This is Stage 4 of the loop, performed in full: the exact technique Lesson 23 taught, applied not to a freshly invented example but to a real claim this curriculum has depended on since Lesson 9 — closing a gap that has been open, honestly, for sixteen lessons. Also recognized in: a company finally formally verifying a safety property its product has informally relied on for years; a mathematician finally proving a conjecture that had been checked against millions of examples without exception; a legal system finally codifying into explicit law a principle courts had informally relied on through precedent; an engineering team finally deriving, from first principles, a rule of thumb they had been using successfully without fully understanding why it worked.

### SE Lens

The alternative to actually constructing this proof is to continue trusting Lesson 9's postcondition indefinitely on the strength of one checked example and Concept Unit 3's three additional ones, the same unproven-but-unbroken status quo this curriculum has actually been in since Lesson 9. The real cost of that alternative, made concrete by everything Lesson 22 demonstrated, is that "checked and never yet found wrong" is never actually the same guarantee as "proven," no matter how many lessons have passed without incident. Constructing the actual proof, as this unit finally does, costs the real effort of Steps 1 through 5; it converts sixteen lessons of informally trusted behavior into a claim this curriculum can now cite with the same confidence as any other proven fact.

---

## Concept Unit 5: What the Loop Still Needs — Implementation and Testing, Honestly Named

### The Problem

Concept Unit 1's five-stage mapping named two stages this era has never actually built the tools for: implementing a model for real, and testing that implementation. It would be dishonest to let this era close without naming exactly what's missing, and exactly why it isn't here yet — the same honesty this curriculum modeled in Lesson 14's forward pointer to loops and search, and in Lesson 21's forward pointer to proof itself.

### No isolated lab for this step

This concept has no code of its own to isolate — this unit names what remains undone, rather than demonstrating a construct with its own syntax.

### Applying It — Naming What's Still Missing, Precisely

**What "implementation" would actually require, that this curriculum doesn't yet have:** a real programming language, with a real toolchain (the way this curriculum's own C++ sibling series builds one from Lesson 0), capable of actually running `total_with_tax` on real input and producing a real, observable result — not a value reasoned about on paper through binding, substitution, and reduction, but one a machine actually computes.

**What "testing" would actually require, that this curriculum doesn't yet have:** a way to run that real implementation against real inputs and automatically check its outputs against the postcondition just proven — turning Concept Unit 3's by-hand boundary checks into something a machine can repeat, quickly, as many times as needed, on every future change to the code.

**Why proof doesn't make testing unnecessary, stated directly, so the two aren't confused:** Concept Unit 4's proof establishes that the *mathematical model* — the function as written, `subtotal + subtotal × tax_rate` — satisfies its contract. It says nothing about whether a real implementation of that model, running on real hardware, actually computes what the model says, correctly, every time — a gap this curriculum will eventually need to address once real code exists to have that gap at all.

**Naming the loop's final stage, generalization, and closing this era honestly:** the computational reasoning loop's last stage feeds back into its first — what was learned here (a proof technique, a completed contract) becomes part of what the next problem's Stage 1 and Stage 2 can build on, exactly the way this lesson itself built on Lesson 9 rather than starting over. This era ends not because the loop is finished, but because this era's job — building the mathematical vocabulary the loop's early stages need — is finished, with the loop itself continuing across every era still to come.

### Walkthrough

- **The precise description of what implementation requires** — an honest naming of a genuine gap, in the same spirit as Lesson 14's forward pointer, rather than a vague gesture at "more to come."
- **The precise description of what testing requires, and why proof doesn't replace it** — directly forestalls a plausible misunderstanding (that a proven model needs no testing), stated explicitly rather than left for a learner to assume incorrectly.
- **The description of generalization as the loop's feedback into its own start** — closes the retrospective structure Concept Unit 1 opened, confirming the "loop" in this lesson's name is not a metaphor but a literal description of how this curriculum will continue to operate.

### CS Lens

This is the recognition that a mathematical proof of correctness and an empirical test of a running implementation answer two different questions, and neither one substitutes for the other — a proof says a model is correct; a test says a specific implementation of it actually behaves that way in practice. Also recognized in: aircraft design, where a mathematically verified aerodynamic model still requires physical wind-tunnel testing of the actual built aircraft; pharmaceutical development, where a theoretically sound biochemical model still requires actual clinical trials; a verified cryptographic algorithm that still requires testing its actual software implementation for bugs the mathematical proof never claimed to rule out; a proven architectural load calculation that still requires physically inspecting the actual completed building.

### SE Lens

The alternative to naming this gap honestly is to let a learner finish this era believing the proof in Concept Unit 4 has fully "solved" `total_with_tax`, with nothing left to do. The real cost of that alternative is a serious, specific misunderstanding this curriculum's later, code-based lessons will directly depend on not having taken root: that proof and testing are redundant with each other, rather than answering genuinely different questions about genuinely different things (a model, versus a real running implementation of it). Naming the gap precisely, as this unit does, costs one honest closing statement; it is what keeps this era's real, substantial achievement — building the vocabulary and the proof technique — from being mistaken for a job that's already entirely finished.

---

## Closing

### Connect the pieces

One claim, `total_with_tax(subtotal, tax_rate) ≥ subtotal`, traced through every unit built in this lesson, start to finish:

1. **The loop named (Unit 1):** five stages, mapped precisely onto twenty-four lessons already completed.
2. **Stage 1, cited rather than rebuilt (Unit 2):** Lesson 9's exact specification and model, reused directly.
3. **Stage 3, examples hunted at the boundaries (Unit 3):** three checks, including two deliberately chosen near the precondition's edges, finding no counterexample.
4. **Stage 4, the proof finally constructed (Unit 4):** a full direct proof, closing a gap left open since Lesson 9.
5. **The remaining stages named honestly (Unit 5):** implementation and testing, precisely described as not yet possible, with generalization named as the loop's own feedback into whatever comes next.

Unit 4's finished proof is the direct payoff of Unit 2's citation and Unit 3's hunt — nothing in this lesson's central claim was invented fresh; every stage builds on the exact claim named at the very start.

### What breaks without this

Suppose this era had ended at Lesson 24, with no lesson ever stepping back to show that Lessons 1 through 24 were instances of one repeatable process, and no lesson ever actually returning to close Lesson 9's long-open gap. A learner would finish this era having practiced proof technique on freed-standing textbook examples — evenness, `n² + n` — without ever seeing proof applied back onto this curriculum's own earlier, informally-trusted work. The habit of returning to check whether an earlier, merely-checked claim can now actually be proven, once the right tools exist, is exactly the habit this lesson exists to demonstrate — and without demonstrating it explicitly, on a claim the learner already recognizes from sixteen lessons earlier, there would be no guarantee that habit transfers to the learner's own future work, where the same situation — an early claim, checked but never proven, sitting quietly until the right tool finally arrives — will recur constantly. Restoring this lesson's approach — closing the loop, visibly, on this curriculum's own material — is what turns "here is a proof technique" into "here is what to actually do with it."

### Exercises

1. **Observe.** Choose one claim from an earlier lesson in this curriculum (not `total_with_tax`'s postcondition) that was checked against examples but never formally proven. State it precisely, in hypothesis/conclusion form.
2. **Formalize.** Following Concept Unit 2's structure, state the problem, specification, and model already built for your Exercise 1 claim, citing the specific earlier lesson each comes from.
3. **Explain.** Following Concept Unit 3's discipline, hunt for a counterexample to your Exercise 1 claim, deliberately checking at least one boundary case. Report what you found.
4. **Formalize.** If your hunt found no counterexample, construct a full direct proof (or proof by cases, if the claim requires it) of your Exercise 1 claim, following Lesson 23 or Lesson 24's exact structure.
5. **Explain.** Name, honestly, what implementation and testing would require for your Exercise 1 claim's model, the way Concept Unit 5 named them for `total_with_tax` — without attempting to actually build them yet.

### Definition of done

- [ ] You can name all five stages of the computational reasoning loop, from memory, and give one example of each from this curriculum's first twenty-four lessons.
- [ ] You can explain the difference between a specification and a model, using your own example.
- [ ] You can complete a full lap of the loop — problem through proof — on a claim of your own choosing, showing every stage explicitly.
- [ ] You can explain, in your own words, why a mathematical proof of a model does not eliminate the need to later test a real implementation of it.
- [ ] You completed Exercises 1–5 using a claim of your own choosing from earlier in this curriculum, not `total_with_tax`'s postcondition.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating how many lessons had passed, in this curriculum, between when your Exercise 1 claim was first checked and when you finally proved it.
