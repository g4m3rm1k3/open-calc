# Lesson 24: Proof by Cases and Counterexample

**What you will build:** Still nothing runnable — this lesson adds a second proof technique to Lesson 23's direct proof, for claims that behave differently depending on a condition too important to paper over, and formally names something this curriculum has already used three separate times without a name for it: a *counterexample*, the single case that disproves a universal claim outright. The transferable problem this lesson is actually about: not every claim can be established by one uninterrupted chain of algebra — some genuinely split into different situations that each need their own argument — and not every claim needs a full proof at all, if a single, well-chosen case is enough to show it's false.

**What you need to know first:** Lesson 2 (`FP-L002-turning-ambiguity-into-precision.md`) — specifically *exhaustive rule*, directly generalized here to proof cases. Lesson 14 (`FP-L014-quantifiers.md`) — specifically Concept Unit 4's finding that one item disproves a universal claim, revisited directly as the origin of this lesson's formal *counterexample*. Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) — specifically the `n² + n + 41` example, whose `n = 40` is named formally in this lesson. Lesson 23 (`FP-L023-direct-proof.md`) — specifically its two worked proofs and Concept Unit 5's flawed argument, both revisited directly.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Proof by cases** — a proof that splits its hypothesis into two or more separate situations, called cases, and proves the conclusion separately within each one, rather than through a single uninterrupted chain. A proof by cases is only valid if its cases are exhaustive (Lesson 2) — covering every possibility the hypothesis allows, with none left unaddressed.
- **Case** (in a proof) — one of the separate situations a proof by cases splits its hypothesis into, each proven independently, using whatever reasoning that specific situation actually requires.
- **Counterexample** — a single case that disproves a universal claim (Lesson 14) by satisfying the claim's hypothesis while failing its conclusion. This curriculum has already used counterexamples three times without the word: Lesson 14's `−5` disproving a validity claim, Lesson 22's `n = 40` disproving `n² + n + 41`'s primality, and Lesson 23's `a = 6, b = 10` exposing a flawed proof's hidden narrowness. This lesson gathers all three under the name they've earned.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation.

---

## Concept Unit 1: When One Direct Chain Isn't Enough — Splitting Into Cases

### The Problem

Consider the claim: for any integer `n`, `n² + n` is even. Lesson 23's direct-proof technique starts by unfolding a definition — but `n` itself isn't given as even or odd; it's simply "any integer," and no single unfolding of "even" or "odd" applies to it directly, because it might be either. Attempting a single, uninterrupted chain of algebra, the way Lesson 23's two worked proofs each did, runs into a wall immediately: there's nothing yet to unfold, because the hypothesis doesn't say which kind of integer `n` is.

### No isolated lab for this step

This concept has no code of its own to isolate — the obstacle is demonstrated directly below, not through a construct with its own syntax.

### Applying It — n² + n

**The claim:** for any integer `n`, `n² + n` is even.

**A useful rewriting, using ordinary algebra (Lesson 3):** `n² + n = n(n + 1)` — the product of `n` and the integer right after it.

**Why a single direct chain doesn't obviously work:** `n(n + 1)` is a product of two consecutive integers, and nothing about "consecutive integers" alone unfolds into Lesson 23's evenness definition the way a bare `a` or `b` already known to be even did. Something about `n`'s own evenness or oddness needs to enter the argument, and `n` could genuinely be either one.

**What actually resolves this:** every integer is either even or odd (a fact this curriculum takes as already established, appropriate for this level — genuinely deriving it from first principles is a task for a much later lesson). This suggests handling the two possibilities separately, each with its own direct-proof-style chain.

### Walkthrough

- **`n(n + 1)`, the rewritten claim** — a reappearance of ordinary factoring (Lesson 3), setting up the actual obstacle this unit exists to expose.
- **"nothing about 'consecutive integers' alone unfolds..."** — establishes precisely why Lesson 23's single-chain technique, as it stands, cannot proceed directly here.
- **"every integer is either even or odd"** — introduces the resolving idea, honestly flagged as a fact taken as given rather than independently proven at this point in the curriculum.

### CS Lens

This is the recognition that some claims are not uniform across their entire hypothesis — they genuinely behave differently depending on which situation actually holds, and forcing a single argument to cover every situation at once can be more awkward, or outright impossible, than handling each situation on its own terms. Also recognized in: a function's behavior differing meaningfully depending on whether an input is positive or negative, requiring separate reasoning for each; a legal rule applying differently depending on which of several defined categories a situation falls into; a physical system behaving according to different equations depending on whether it's above or below some threshold; a recipe's instructions branching depending on which of two ingredients happened to be available.

### SE Lens

The alternative to splitting into cases is to keep forcing a single chain of reasoning to cover a hypothesis that genuinely admits more than one distinct situation. The real cost of that alternative, when it's even possible at all, is often a much more convoluted, harder-to-verify argument than simply handling each situation separately would be — and sometimes, as with `n² + n`, no single chain works at all without secretly picking up an assumption about which situation actually holds. Recognizing when a claim needs splitting, as this unit does, costs the moment of noticing the obstacle directly, rather than forcing an ill-fitting single chain; it sets up exactly the technique the next unit builds.

---

## Concept Unit 2: Proof by Cases — Covering Every Possibility Exhaustively

### The Problem

Concept Unit 1 identified that `n` is either even or odd, and that each situation might need its own argument. Actually carrying this out means doing Lesson 23's direct-proof work twice — once assuming `n` is even, once assuming `n` is odd — and confirming both together actually establish the original claim for *any* integer `n`, not just the ones covered by whichever case happens to be checked first.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete worked proof by cases is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**Hypothesis:** `n` is an integer.

**Conclusion:** `n² + n` is even.

**Case 1: n is even.**

> 1. By Lesson 23's definition, there exists a whole number `k` such that `n = 2k`.
> 2. `n² + n = n(n + 1) = 2k(n + 1)`.
> 3. `2k(n + 1) = 2(k(n + 1))`, and `k(n + 1)` is a whole number.
> 4. `n² + n` is even, with witness `k(n + 1)`.

**Case 2: n is odd.**

> 1. By Lesson 23's definition, there exists a whole number `k` such that `n = 2k + 1`.
> 2. `n + 1 = 2k + 2 = 2(k + 1)` — `n + 1` is even.
> 3. `n² + n = n(n + 1) = n × 2(k + 1) = 2(n(k + 1))`, and `n(k + 1)` is a whole number.
> 4. `n² + n` is even, with witness `n(k + 1)`.

**Combining both cases into the final conclusion:** since `n` is an integer, and every integer is either even or odd (Concept Unit 1), one of these two cases must actually hold for any specific `n`. Case 1 establishes the conclusion whenever the first possibility holds; Case 2 establishes it whenever the second does. Since together they cover every possible integer `n`, the conclusion — `n² + n` is even — holds for any integer `n` at all.

### Walkthrough

- **Case 1, a direct proof assuming `n` even** — a reappearance of Lesson 23's exact direct-proof structure, applied here to only one of the two situations the hypothesis admits.
- **Case 2, a direct proof assuming `n` odd** — the same structure again, requiring genuinely different algebra (`n + 1` shown even, rather than `n` itself), demonstrating the two cases aren't interchangeable copies of each other.
- **"one of these two cases must actually hold for any specific `n`"** — first appearance of *proof by cases* as a complete technique: two direct proofs, each covering one situation, combined into a conclusion covering every situation the hypothesis allows.

### CS Lens

This is the same structure Lesson 12's conditional expression used computationally — checking a guard and following exactly one of two branches — now applied to a proof rather than a computation: each case is like a branch, and the proof's overall validity depends on the two branches, together, covering every possibility. Also recognized in: a legal ruling addressing "if the defendant knew" and "if the defendant did not know" as two separate branches of argument, together covering every possible state of the defendant's knowledge; an engineering analysis considering both "if the load is within tolerance" and "if it exceeds tolerance" separately; a game-theoretic analysis considering "if the opponent cooperates" and "if the opponent defects" as the two branches a strategy must handle; a troubleshooting guide branching on "if the device is powered on" and "if it is not," with both branches together covering every actual state the device could be in.

### SE Lens

The alternative to proof by cases is to keep trying to force a single, unbranched argument for a claim that genuinely doesn't have one, the exact obstacle Concept Unit 1 ran into. The real cost of forcing a single chain, when the underlying claim doesn't support one, is either an invalid proof (secretly assuming one case without saying so) or simply failing to find any argument at all, even though the claim is true. Splitting deliberately into cases, as this unit does, costs writing two separate arguments instead of one; it buys a technique that can actually complete a proof for claims a single chain genuinely cannot handle.

---

## Concept Unit 3: Why the Cases Must Be Exhaustive

### The Problem

Concept Unit 2's proof by cases only actually established its conclusion because "every integer is either even or odd" — every possibility the hypothesis allows was genuinely covered by one of the two cases. It's worth confirming, directly, what happens if a case is silently missing, connecting this requirement precisely to a rule already established much earlier in this curriculum.

### No isolated lab for this step

This concept has no code of its own to isolate — the consequence of a missing case is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What a Missing Case Would Break

**Connecting directly to an already-established rule:** Lesson 2 named an *exhaustive rule* as one with an explicitly decided outcome for every input configuration that can actually occur, with nothing left to fall through to an unstated default. Proof by cases requires exactly this: its cases, taken together, must be exhaustive over the hypothesis, in precisely Lesson 2's sense.

**A hypothetical proof by cases that omits a case, to show what goes wrong:** suppose Concept Unit 2's proof had included only Case 1 (`n` even), and stopped there, concluding "`n² + n` is even" without ever addressing odd `n` at all.

**Checking whether this establishes the original claim:** the original claim was "for *any* integer `n`." An odd integer, like `n = 3`, is a perfectly legal instance of "any integer," and nothing in a Case-1-only argument says anything about it at all. The claim, as originally stated, would remain entirely unestablished for every odd `n` — not merely under-supported, but genuinely unaddressed, the same gap Lesson 2 called an undefined case.

**Confirming Concept Unit 2's actual cases really are exhaustive, rather than merely assuming it:** "every integer is either even or odd" is precisely the exhaustiveness claim this proof by cases depends on — flagged honestly, again, as a fact taken as already established at this point in the curriculum, not proven fresh here.

### Walkthrough

- **The explicit connection to Lesson 2's *exhaustive rule*** — a direct reappearance, applied here to proof cases rather than to a specification's handling of input, confirming the same underlying requirement governs both.
- **The hypothetical Case-1-only proof** — deliberately constructed to expose the consequence of an incomplete case split, mirroring Lesson 2's own "what breaks without this" demonstration.
- **`n = 3`, shown entirely unaddressed by the incomplete proof** — a concrete instance of exactly what "unaddressed," rather than merely "unproven," looks like.

### CS Lens

This is the same requirement Lesson 14's universal quantifier and Lesson 2's exhaustive rule both already demanded, now applied specifically to the cases of a proof: nothing is actually established for a possibility that was never actually examined, no matter how the omission is phrased. Also recognized in: a `switch` statement missing a `default` case, silently leaving certain inputs unhandled; a risk assessment that considers only some of the ways a system could fail, leaving the unconsidered failure modes completely unaddressed rather than merely under-analyzed; a legal contract that specifies obligations for some circumstances but is silent on others, leaving those circumstances genuinely undecided; a medical diagnosis process that only considers some possible causes of a symptom, leaving the unconsidered causes entirely unruled-out.

### SE Lens

The alternative to explicitly checking that a proof's cases are exhaustive is to split a hypothesis into whichever cases come naturally to mind and trust that they cover everything without checking. The real cost of that alternative is exactly what the hypothetical Case-1-only proof demonstrated: an omitted case isn't a small gap in an otherwise-solid argument — it's a complete absence of any argument at all for every instance falling into that gap, indistinguishable, from the outside, from a case that was actually handled, unless someone checks specifically for completeness. Confirming exhaustiveness explicitly, as this unit does by naming precisely what "every integer is either even or odd" is doing for the proof, costs one deliberate check; it is what separates a genuine proof by cases from an argument that merely resembles one, in exactly the spirit of Lesson 22's warning about arguments that look valid without actually being so.

---

## Concept Unit 4: Counterexample — Disproving a Universal Claim With One Case

### The Problem

Concept Units 1 through 3 built up toward proving a universal claim true. The opposite task — showing a universal claim is false — turns out to need far less machinery, and this curriculum has already done it three separate times without ever naming the technique directly.

### No isolated lab for this step

This concept has no code of its own to isolate — gathering three earlier instances under one formal name is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Three Earlier Instances, Named at Last

**The first instance, from Lesson 14:** the universal claim "every score in this stack is between 0 and 100" was disproven by a single modified stack containing `−5` — one item, satisfying the claim's domain (it's a score in the stack) while failing the claim's predicate (it's not between 0 and 100).

**The second instance, from Lesson 22:** the universal claim "`n² + n + 41` is prime for every natural number `n`" was disproven by `n = 40` — one specific natural number, satisfying the hypothesis (it's a natural number) while failing the conclusion (`1681` is not prime).

**The third instance, from Lesson 23:** the general claim "the sum of two even numbers is even, for any two even numbers `a` and `b`" was shown to be only narrowly established by a flawed proof, exposed by `a = 6, b = 10` — two genuinely different even numbers the flawed proof's hidden assumption (`a = b`) could not accommodate.

**Naming the common structure across all three, precisely:** each one is a single case satisfying a claim's hypothesis while failing its conclusion — exactly enough, on its own, to establish that the universal claim, as stated, is false. No further checking, and no proof by cases, was ever needed in any of the three; one case did the entire job.

**Formally defining the term this pattern has earned:** a counterexample to `∀x, P(x)` is any specific `x` for which `P(x)` is false. Finding one is both necessary and sufficient to disprove the universal claim — nothing less establishes it's false, and nothing more is needed once one is found.

### Walkthrough

- **The three instances, quoted and re-examined from Lessons 14, 22, and 23** — direct reappearances of earlier findings, gathered here specifically to be recognized as the same underlying technique.
- **"exactly enough, on its own, to establish that the universal claim... is false"** — not a new concept, but the precise statement of what all three instances already demonstrated independently.
- **The formal definition, `∀x, P(x)` disproven by any `x` with `P(x)` false** — first appearance of *counterexample* as a formally named term, retroactively unifying three separate earlier uses.

### CS Lens

This is the asymmetry Lesson 14, Concept Unit 4, already identified precisely: proving a universal claim generally requires covering every case (directly, or by exhaustive cases, as this lesson's Concept Unit 2 did), while disproving one requires only a single, well-chosen failure. Also recognized in: a single bug report sufficing to disprove "this software has no bugs," regardless of how many other cases work correctly; a single black swan sufficing to disprove "all swans are white," a classic example of exactly this pattern; a single exception sufficing to disprove "this rule has no exceptions"; a single failed inspection sufficing to disprove "every unit in this batch meets specification," without needing to inspect the rest of the batch to know the universal claim is false.

### SE Lens

The alternative to formally naming counterexamples is to keep treating each disproving case as a one-off observation, the way this curriculum did across Lessons 14, 22, and 23 before this lesson connected them. The real cost of that alternative is a missed opportunity for transfer: without a name gathering these three instances together, a learner encountering a fourth situation calling for the exact same technique might not recognize it as the same tool already used successfully three times. Naming the pattern explicitly, as this unit does, costs nothing beyond the act of connecting what was already there; it turns three separate, disconnected observations into one reusable, recognizable technique.

---

## Concept Unit 5: Counterexamples as a Debugging Tool — Hunt Before You Prove

### The Problem

Concept Unit 4 named counterexamples as a way to disprove a claim already suspected false. It's worth stating a genuinely practical habit this enables: before investing the real effort a direct proof or proof by cases requires (Lesson 23; Concept Unit 2), it is often much faster to actively hunt for a counterexample first — and if the hunt succeeds, the effort of a full proof attempt is saved entirely.

### No isolated lab for this step

This concept has no code of its own to isolate — the practical value of hunting first is demonstrated directly below, not through a construct with its own syntax.

### Applying It — A Claim Worth Checking Before Proving

**A plausible-sounding claim:** the sum of any two prime numbers is prime.

**Resisting the urge to immediately attempt a full proof, and hunting for a counterexample first, using small, easy-to-check primes:** `2 + 3 = 5` — prime. This example doesn't disprove the claim; it's worth trying another.

**Trying a second pair:** `3 + 5 = 8` — not prime (`8 = 2 × 4`). A counterexample, found in seconds, with none of the machinery Lesson 23's direct proof or this lesson's Concept Unit 2 would have required.

**What was actually saved by hunting first:** attempting a direct proof of a false claim never succeeds — Lesson 23's technique would eventually run into a step that simply can't be justified, but discovering that could take considerably longer than the two quick checks that found `3 + 5 = 8` directly. Hunting for a counterexample first is often the fastest way to find out a claim isn't even worth the effort of a full proof attempt.

**What hunting and failing to find one actually establishes, and what it doesn't, connecting directly to Lesson 22's distinction:** if a reasonable amount of hunting turns up no counterexample, this is evidence the claim might be true, worth the effort of attempting a real proof — but it is not, itself, a proof, for exactly the reason Lesson 22's `n² + n + 41` demonstrated. Failing to find a counterexample after checking is the same kind of evidence checking examples always provides; only an actual proof, or an actual counterexample, settles the question.

### Walkthrough

- **"the sum of any two prime numbers is prime"** — a fresh claim, deliberately chosen to be quickly checkable, to demonstrate the hunting habit concretely.
- **`2 + 3 = 5`, not yet a counterexample** — shows that hunting doesn't always succeed on the first try, and that a non-disproving example doesn't establish the claim either, exactly Lesson 22's point.
- **`3 + 5 = 8`, a genuine counterexample found quickly** — the payoff of the hunting strategy: the claim disproven in two short checks.
- **The explicit connection to Lesson 22's evidence-versus-proof distinction** — not a new concept, but a direct application of that lesson's framework to this specific practical habit.

### CS Lens

This is the practice of attempting the cheaper, faster disproof before investing in the more expensive, slower proof — a specific instance of a general strategy of checking the easy way out before committing to the hard way. Also recognized in: a debugger checking simple, common causes of a bug before investigating rare, complex ones; a scientist attempting to falsify a hypothesis with a quick, cheap experiment before committing to an expensive, lengthy one; a chess player checking for an opponent's immediate tactical threat before investing time in a long-term strategic plan; a code reviewer scanning for obvious errors before undertaking a detailed line-by-line correctness review.

### SE Lens

The alternative to hunting for a counterexample first is to immediately attempt a full proof of every claim encountered, regardless of how likely it is to be true. The real cost of that alternative, for a claim that turns out to be false, is exactly what the sum-of-two-primes example avoided: real, potentially substantial effort spent constructing an argument for something that was never true, effort a few seconds of counterexample-hunting could have avoided entirely. Making counterexample-hunting a habitual first step, as this unit recommends, costs almost nothing when it succeeds and costs only a small amount of wasted effort when it doesn't; it is a cheap, practical filter that this curriculum recommends applying before undertaking Lesson 23's more expensive proof techniques.

---

## Closing

### Connect the pieces

Two ideas — splitting into cases, and disproving with one case — traced through every unit built in this lesson, start to finish:

1. **The obstacle to a single chain (Unit 1):** `n² + n = n(n + 1)`, with no single unfolding of even or odd applying to "any integer `n`" directly.
2. **Proof by cases, worked in full (Unit 2):** `n` even and `n` odd, each proven separately, combined into a conclusion covering every integer.
3. **Exhaustiveness, confirmed necessary (Unit 3):** a hypothetical Case-1-only version shown to leave every odd `n` entirely unaddressed, connected directly to Lesson 2's exhaustive rule.
4. **Counterexample, formally named (Unit 4):** three earlier, previously unnamed instances — Lesson 14's `−5`, Lesson 22's `n = 40`, Lesson 23's `a = 6, b = 10` — gathered under one precise definition.
5. **Hunting as a practical habit (Unit 5):** the sum-of-two-primes claim, disproven in two quick checks, saving the cost of a doomed full proof attempt.

Unit 4's formal definition is not new machinery — it is a name finally given to something Units 1 through 3 never needed (since they were proving a true claim), but that three entirely separate earlier lessons had already used correctly, on their own, well before this lesson existed to unify them.

### What breaks without this

Suppose a claim like "every integer greater than 2 can be written as the sum of two primes" (a genuine, famous open conjecture, unproven to this day) were casually asserted as an established fact in some later reasoning, without either a genuine proof or an honest acknowledgment that it remains only a conjecture (Lesson 22) despite an enormous amount of checked evidence. Anyone building further reasoning on top of it would be inheriting exactly the risk Lesson 22's `n² + n + 41` demonstrated: a claim checked against staggeringly many examples, with no counterexample ever found, is still not the same as a claim actually proven, and treating the two as interchangeable is precisely the mistake this era has spent several lessons warning against. This lesson's contribution is the other side of that same coin: knowing that a single counterexample, the moment one is found, ends the discussion completely, with no need for further checking — and knowing to hunt for one, cheaply, before investing in the expensive alternative. Losing either half of this lesson — forgetting that one case suffices to disprove, or forgetting that a proof by cases needs every case covered to actually establish anything — leaves a gap exactly where Lesson 22 already showed gaps do the most damage: silently, in a claim later reasoning quietly assumes is settled.

### Exercises

1. **Observe.** Find a claim of your own that plausibly splits into two or more distinct situations, the way `n² + n`'s claim split into even and odd `n`. State the situations you think the hypothesis naturally divides into.
2. **Formalize.** Write a full proof by cases for your Exercise 1 claim, following Concept Unit 2's structure: a separate direct-proof-style chain for each case, combined into one conclusion.
3. **Explain.** Confirm your Exercise 2 cases are exhaustive — that every possibility your hypothesis allows is covered by at least one case — the way Concept Unit 3 confirmed "every integer is either even or odd" for the worked example.
4. **Formalize.** State a universal claim you suspect is false, and hunt for a counterexample the way Concept Unit 5 hunted for one to "the sum of any two prime numbers is prime." Report how many attempts it took.
5. **Explain.** Look back at one of your own proofs from Lesson 23's exercises. Attempt to find a counterexample to the general claim it was supposed to establish — not to the specific proof's logic, but to the claim itself — the way Concept Unit 4 gathered `a = 6, b = 10` against Lesson 23's flawed argument. State whether you found one, and what that result tells you about your earlier proof.

### Definition of done

- [ ] You can explain why some claims require splitting into cases rather than a single direct-proof chain, using your own example.
- [ ] You can state, precisely, what makes a set of proof cases exhaustive, and explain what a missing case actually leaves unestablished, rather than merely under-supported.
- [ ] You can define counterexample precisely, and name at least two of this lesson's three gathered earlier instances from memory.
- [ ] You can explain why hunting for a counterexample before attempting a full proof is a practically useful habit, using Lesson 22's evidence-versus-proof distinction to explain what a failed hunt does and doesn't establish.
- [ ] You completed Exercises 1–5 using your own claims, not `n² + n` or the sum-of-two-primes example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating whether your Exercise 4 hunt succeeded quickly, took real effort, or never found a counterexample at all — and what that outcome suggests about whether the claim is worth actually trying to prove.
