# Lesson 22: Proof as Reliable Reasoning

**What you will build:** Still nothing runnable — this lesson names the tool Lesson 21 promised was coming: *proof*, a chain of reasoning that establishes a claim for an entire domain at once, rather than by checking examples one at a time. The transferable problem this lesson is actually about: a claim can hold for every example anyone thinks to check — not three examples, not a dozen, but forty — and still be false, which means "I checked a lot of cases" can never, by itself, be the reason to trust a general claim.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically division's undefined case at zero, reused directly as the hidden flaw in Concept Unit 3's false proof. Lesson 14 (`FP-L014-quantifiers.md`) — specifically the universal quantifier, which every proof in this lesson ultimately establishes. Lesson 21 (`FP-L021-finite-and-infinite-thinking.md`) — specifically its `N + 1` argument and its honest, unresolved hedge, both directly resolved here.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Proof** — a chain of logically valid steps, each following necessarily from established facts, definitions, or earlier steps in the same chain, that establishes a claim for every case in its domain at once, rather than by checking cases individually. A proof does not get more convincing by adding more examples; it is either a genuinely valid chain of reasoning or it isn't, independent of how many people find it persuasive.
- **Conjecture** — a claim believed likely true, based on evidence like a strong pattern across many checked examples, that has not yet been established by proof. A conjecture is a legitimate, valuable thing to have — it is simply not the same thing as a proven fact, and treating the two identically is exactly the mistake this lesson exists to prevent.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation.

---

## Concept Unit 1: Examples Can Mislead — Euler's Prime Polynomial

### The Problem

Suppose a claim is checked against forty separate examples, and every single one confirms it. It would be entirely reasonable to feel confident the claim is true. And yet a genuine, historically famous example shows this confidence can be completely wrong — not because forty examples is too few to be thorough, but because "held for every example checked so far" and "holds for every case" are simply different claims, no matter how large the first number gets.

### No isolated lab for this step

This concept has no code of its own to isolate — the historical example is worked through directly below, not through a construct with its own syntax.

### Applying It — n² + n + 41

**The claim, stated precisely:** for every natural number `n`, the expression `n² + n + 41` is a prime number (a number with no divisors other than 1 and itself).

**Checking it for several small values of `n`:** `n = 0`: `0 + 0 + 41 = 41`, prime. `n = 1`: `1 + 1 + 41 = 43`, prime. `n = 2`: `4 + 2 + 41 = 47`, prime. Continuing this check for every natural number from `0` through `39` — forty consecutive values — every single result is prime.

**Checking `n = 40`:** `40² + 40 + 41 = 1600 + 40 + 41 = 1681`. Is `1681` prime? `41 × 41 = 1681`. It is not prime — it has a divisor, `41`, other than 1 and itself.

**The conclusion, stated directly:** a claim held for forty consecutive checked examples, without a single exception, and was still false. Whatever confidence forty successful checks in a row might inspire, that confidence was not, and could never have been, a substitute for an actual proof that the pattern continues forever.

### Walkthrough

- **`n² + n + 41`, checked for `n = 0, 1, 2`** — establishes the claim's plausibility directly, exactly the way a learner encountering it for the first time would build confidence.
- **The claim holding for all forty values from `n = 0` through `n = 39`** — extends that plausibility much further than a typical spot-check, deliberately, so the eventual failure lands with its full weight.
- **`n = 40`, producing `1681 = 41 × 41`, not prime** — the concrete failure, checkable by hand, that disproves the claim outright.
- **"forty successful checks in a row... could never have been a substitute for an actual proof"** — not a new concept, but the precise statement of this unit's point, stated without hedging.

### CS Lens

This is the fact that a pattern's persistence across many observed cases carries no logical guarantee about unobserved cases — a fact with consequences far beyond this one polynomial. Also recognized in: a piece of software that passes every test written for it and still contains a bug in a case nobody thought to test; a machine-learning model that performs correctly on every example in its training data and fails on new, unseen data it was never checked against; a scientific law that held in every experiment conducted for centuries before a new observation, at a scale nobody had previously tested, revealed its limits; a security system that has never been breached in ten years of operation, which is evidence of its strength but never a proof that it cannot be breached.

### SE Lens

The alternative to demanding proof is to treat a sufficiently long streak of successful examples as good enough, especially once the streak feels long enough to be "obviously" going to continue. The real cost of that alternative is exactly what `n² + n + 41` demonstrates: there is no number of successful examples that logically guarantees the next one will also succeed, and a streak that feels overwhelming — forty in a row — can still be exactly one example away from failing. Insisting on actual proof, rather than a persuasive streak, costs the real effort the rest of this lesson is about to describe; it is the only thing that can rule out an `n = 40`-style failure waiting just past wherever the checking happened to stop.

---

## Concept Unit 2: Proof — Covering Every Case at Once, Not Checking Them One by One

### The Problem

Concept Unit 1 showed what checking examples cannot do. It's worth showing directly what actually can settle a claim for an entire infinite domain — and, remarkably, this curriculum has already produced one genuine example of exactly that, in Lesson 21, without using the word "proof" at the time.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing Lesson 21's earlier argument as a genuine proof is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Recognizing an Earlier Proof

**Lesson 21's argument, quoted directly:** "whatever `N` was chosen, `N + 1` is also a natural number, and it was not included in the list that stopped at `N`."

**Checking this against what a proof actually requires:** does it establish the claim ("counting the naturals never finishes") for every possible stopping point `N` at once, rather than checking specific values of `N` one at a time? Yes — the argument names an arbitrary `N`, not a specific one like `5` or `1000`, and shows that whatever value `N` happens to be, `N + 1` breaks the attempt. It never once resorts to checking `N = 1`, then `N = 2`, and so on.

**Naming what this argument actually is:** a proof. Lesson 21 gave a genuine proof, using the exact structure this lesson is now formalizing, three lessons before this lesson existed to name it.

**Contrasting this directly with Concept Unit 1's failed pattern:** checking `n² + n + 41` for `n = 0` through `39` only ever examined specific, individual values — no matter how many, it was still example-checking. Lesson 21's argument never checked any specific `N` at all; it reasoned about *every* `N` simultaneously, by name, using nothing but `N`'s own definition as an arbitrary natural number.

### Walkthrough

- **Lesson 21's `N + 1` argument, quoted verbatim** — a direct reappearance of that lesson's own reasoning, examined here specifically for its logical structure rather than its conclusion.
- **Checking it against "does it cover every case at once"** — first appearance of *proof*, defined precisely by this exact property, and confirmed, rather than merely asserted, against a real prior example.
- **The explicit contrast with Concept Unit 1's checked-example approach** — not a new concept, but a direct, side-by-side comparison making the structural difference between the two approaches unmistakable.

### CS Lens

This is the recognition that reasoning about an arbitrary, unspecified representative of a domain — rather than about any one specific member of it — is what allows a single argument to cover infinitely many cases at once. Also recognized in: a mathematical proof by induction, reasoning about "an arbitrary `n`" and what happens at "an arbitrary next step," never checking every `n` individually; a general-purpose sorting algorithm's correctness proof, reasoning about an arbitrary input list rather than testing specific lists; a legal argument based on a general principle ("no contract can bind a party who never consented") rather than case-by-case precedent; an engineering safety margin derived from general physical laws, applicable to every bridge of a given design rather than verified individually for each one built.

### SE Lens

The alternative to reasoning about an arbitrary representative is to keep testing more and more specific cases, hoping the pattern holds, exactly what Concept Unit 1 already showed can fail no matter how far the testing goes. The real cost of that alternative, for an infinite domain, is that it can literally never finish — no number of specific cases checked is "enough," in the strict logical sense, the way a single valid argument about an arbitrary case can be. Reasoning about an arbitrary case, the way Lesson 21 already did, costs real conceptual effort to construct correctly; it buys a conclusion that holds with certainty, for the entire domain, the moment the argument is confirmed valid — not merely "very likely," the way Concept Unit 1's forty examples felt.

---

## Concept Unit 3: Every Step Must Actually Be Valid — a False "Proof" That 1 = 2

### The Problem

Concept Unit 2 defined a proof as a chain of steps that each follow necessarily from what came before. This requirement — *every* step, with no exceptions — deserves to be tested directly, because an argument that looks like a valid chain of algebra, with each line seeming to follow reasonably from the last, can still smuggle in exactly one illegitimate step and arrive at a conclusion that is definitely, provably false.

### No isolated lab for this step

This concept has no code of its own to isolate — the flawed argument is worked through directly below, with its hidden error located precisely, not through a construct with its own syntax.

### Applying It — Finding the Broken Step

**An argument, presented as though it were a valid proof, starting from an assumption:** let `a` and `b` be numbers with `a = b`.

**Step 1:** multiply both sides by `a`: `a² = ab`.

**Step 2:** subtract `b²` from both sides: `a² − b² = ab − b²`.

**Step 3:** factor both sides: `(a − b)(a + b) = b(a − b)`.

**Step 4:** divide both sides by `(a − b)`: `a + b = b`.

**Step 5:** since `a = b` (the original assumption), substitute: `b + b = b`, so `2b = b`, so `2 = 1`.

**Checking every single step against Concept Unit 2's requirement, rather than accepting the argument because its conclusion feels absurd:** Steps 1 through 3 are ordinary, valid algebra — nothing to object to. Step 4 divides both sides by `(a − b)`. Since the argument began by assuming `a = b`, `(a − b)` is exactly `0`. Step 4 divides by zero — precisely the operation Lesson 3, Concept Unit 5, established has no defined value at all.

**Naming the flaw precisely:** the argument is not a proof, despite having the surface shape of one — a sequence of algebra-looking lines — because Step 4 is not a valid step. It performs an operation (division by zero) that Lesson 3 already showed produces no value whatsoever, which means Step 4 does not follow necessarily from Step 3 at all; it doesn't follow from anything, because the operation it relies on is undefined.

### Walkthrough

- **Steps 1 through 3, ordinary and valid** — deliberately shown to be unobjectionable, so the actual flaw isn't confused with the whole argument being sloppy throughout.
- **Step 4, dividing by `(a − b)`** — the specific step this unit exists to examine.
- **"since the argument began by assuming `a = b`, `(a − b)` is exactly `0`"** — the precise identification of the flaw: a reappearance of Lesson 3's division-by-zero, hidden inside an algebraic step that looks, superficially, like any other.
- **"the argument is not a proof, despite having the surface shape of one"** — not a new concept, but the exact point this unit exists to make: proof status depends on every single step actually being valid, never on how convincing or algebra-shaped the overall argument looks.

### CS Lens

This is the fact that a chain of reasoning is only as strong as its single weakest step — one invalid link breaks the entire chain, regardless of how many valid links surround it. Also recognized in: a security system with every layer properly configured except one misconfigured firewall rule, which alone can compromise the entire system; a mathematical proof with a subtle off-by-one error in one line, which invalidates the conclusion no matter how rigorous the surrounding lines are; a supply chain with every link reliable except one, which alone can cause the entire chain to fail; a legal argument resting on one unstated, false premise, which undermines every correctly reasoned step built on top of it.

### SE Lens

The alternative to checking every single step is to accept an argument because its overall shape looks rigorous, or because most of its steps are individually correct. The real cost of that alternative is exactly this unit's demonstration: an argument can be built almost entirely out of valid steps and still reach a false conclusion, if even one step is illegitimate — and a reader skimming for "does this look like real math" rather than checking each step against what's actually allowed (Lesson 3's undefined division, in this case) would have no way to catch it. Checking every step explicitly, the way this unit did, costs real, careful attention to each individual line; it is the only way to distinguish a genuine proof from something that merely resembles one.

---

## Concept Unit 4: Proof vs. Evidence — Different Jobs for Different Purposes

### The Problem

Concept Unit 1's forty checked examples were not worthless, even though they didn't prove anything — they were exactly what made `n² + n + 41` worth investigating as a possible pattern in the first place. It's worth stating precisely what checking examples is actually good for, since dismissing it entirely, after Concept Unit 1's demonstration, would be an overcorrection in the opposite direction.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction between the two jobs is stated and demonstrated directly below, not through a construct with its own syntax.

### Applying It — What Forty Examples Actually Accomplished

**What checking `n² + n + 41` for `n = 0` through `39` genuinely established:** that the claim is worth taking seriously — a pattern that strong, across that many consecutive cases, is not an accident to be dismissed, even though it eventually failed. This is exactly the kind of evidence that turns a random guess into a conjecture worth investigating further, by actually trying to prove or disprove it.

**What that same checking never established, no matter how it's framed:** that the claim is true for every natural number. Concept Unit 1 already showed this directly, by producing the exact case, `n = 40`, where it fails.

**Stating the two roles precisely, side by side:** evidence (checked examples) is for discovering what might be true and deciding what's worth the effort of trying to prove. Proof (Concept Unit 2's arbitrary-case reasoning) is for actually establishing that something is true, for certain, across an entire domain.

**Connecting this to a distinction already made in this curriculum, without using this lesson's vocabulary at the time:** Lesson 22 itself is not the first time this curriculum has drawn something like this line — Lesson 15, Concept Unit 5, said exactly this when it distinguished "checking a few examples" from "a fact that follows from how the real numbers themselves are ordered."

### Walkthrough

- **"a pattern that strong... is not an accident to be dismissed"** — establishes, directly, that examples retain real value even after Concept Unit 1's cautionary tale, rather than being dismissed as worthless.
- **The precise restatement of what checking never established** — a reappearance of Concept Unit 1's own conclusion, restated here specifically to be paired against evidence's legitimate role.
- **"evidence... is for discovering... proof... is for actually establishing"** — first appearance of *conjecture*, implicit in "what might be true," paired directly with the formal definition of proof from Concept Unit 2.
- **The explicit callback to Lesson 15** — not a new concept, but confirmation that this curriculum has been building toward this exact distinction gradually, since well before this lesson existed to name it precisely.

### CS Lens

This is the recognition that generating a hypothesis and confirming a hypothesis are two different tasks, each requiring a different kind of tool, and that treating the tool for one as sufficient for the other is the actual mistake, not using either tool at all. Also recognized in: the scientific method's own explicit separation of hypothesis generation (often from observed patterns) and hypothesis testing (through controlled, repeatable experiment); a software team's exploratory testing, which surfaces suspected bugs, versus a formal correctness proof of a critical algorithm, which actually rules bugs out; a detective's initial suspicion based on circumstantial evidence versus the higher standard of proof a courtroom actually requires; a doctor's working diagnosis based on symptoms versus the confirming diagnostic test that actually establishes it.

### SE Lens

The alternative to distinguishing these two roles is to treat strong evidence as though it already were proof, skipping the second step entirely once a pattern feels sufficiently convincing. The real cost of that alternative is precisely Concept Unit 1's own lesson, generalized: any claim resting only on "we checked a lot of cases and it always worked" carries a hidden, unquantified risk that the untested case is exactly the one that breaks it. Keeping the two roles explicitly distinct — using evidence to decide what's worth investigating, and reserving actual trust for what's been proven — costs the discipline of not stopping at "convincing enough"; it is what separates a claim this curriculum can safely build later lessons on from one that merely hasn't failed yet.

---

## Concept Unit 5: Why This Curriculum Insists on Proof When It Can

### The Problem

This curriculum has, since Lesson 2, treated a reappearing concept as something to build on without re-deriving it from scratch — Lesson 5 reused Lesson 3's *value*; Lesson 13 reused Lesson 7's *function*; Lesson 20 reused Lesson 17's *reflexive* and *transitive*. That habit of trusting earlier results and building directly on top of them is only actually safe if those earlier results were genuinely established, not merely "checked and never yet found wrong." Naming exactly why proof matters, for a curriculum built this way, closes this era's discussion honestly.

### No isolated lab for this step

This concept has no code of its own to isolate — this unit states directly why the rest of this curriculum depends on the distinction just drawn, not through a construct with its own syntax.

### Applying It — What Reuse Actually Requires

**A pattern this curriculum has relied on repeatedly, named directly:** Lesson 20 built directly on Lesson 17's already-established properties of `≤`, without re-checking reflexivity, antisymmetry, and transitivity from scratch. Lesson 19 built directly on Lesson 17's already-established relation definition. Every one of these reuses assumed the earlier result could simply be trusted.

**What would happen if "established" only ever meant "checked on the examples used so far," the way Concept Unit 1's forty examples felt established:** every later lesson reusing an earlier one would be inheriting, silently, whatever untested case might eventually break it — exactly Concept Unit 1's `n = 40`, except hidden inside a foundation the whole rest of the curriculum was quietly standing on.

**What proof actually buys, stated as directly as possible:** once a claim is genuinely proven — reasoned about for an arbitrary case, with every step checked, the way Lesson 21's `N + 1` argument was and Concept Unit 3's flawed algebra wasn't — it can be reused with total confidence, forever, with no risk of a later `n = 40` ever surfacing, because the argument never depended on which specific case was being considered in the first place.

**The honest state of this curriculum going forward:** not every claim used so far has actually been proven in this strict sense — several have been justified informally, or checked against representative examples, exactly as Lesson 11 and Lesson 15 admitted directly. This lesson does not retroactively fix those; it names, precisely, what a genuine fix would require, and the next two lessons begin actually supplying it.

### Walkthrough

- **The three named reuses (Lessons 19 and 20 building on Lesson 17)** — reappearances of this curriculum's own established habit of trusting earlier results, examined here specifically for what that trust actually requires to be safe.
- **The hypothetical where "established" only meant "checked so far"** — connects directly back to Concept Unit 1's `n² + n + 41`, applied here to this curriculum's own structure rather than to an isolated example.
- **"once a claim is genuinely proven... it can be reused with total confidence, forever"** — not a new concept, but the precise statement of proof's actual payoff, tied directly to the habit of reuse this curriculum's own Repetition practice depends on.
- **The honest acknowledgment that not every earlier claim has met this bar yet** — a direct, transparent admission, consistent with Lesson 11 and Lesson 15's own hedges, rather than a claim that this lesson has silently fixed everything before it.

### CS Lens

This is the recognition that a system built by composing smaller, trusted pieces (Lesson 8's composition, extended here to composing trusted *facts* rather than trusted functions) is only as reliable as the weakest piece it depends on — exactly Concept Unit 3's "weakest link" point, now applied to an entire curriculum's structure rather than to one argument. Also recognized in: a large software system built from libraries, each trusted without being re-verified by every team that uses it, which is only safe because those libraries were actually tested and proven correct, not merely used without failure so far; a legal system built on precedent, safe to build on only if the precedent itself was soundly reasoned; an engineering discipline that lets one bridge design be reused across many actual bridges, safe only because the underlying physics was actually proven, not merely observed to work on bridges built so far; a scientific theory used as a foundation for further research, trustworthy in proportion to how rigorously it was actually established.

### SE Lens

The alternative to insisting on real proof, wherever this curriculum can actually supply it, is to let every reused concept carry forward an unstated, unquantified risk — trusting Lesson 17's relation properties, or Lesson 3's operation definitions, simply because nothing has gone wrong with them yet, the same false comfort Concept Unit 1's forty examples offered right up until `n = 40`. The real cost of that alternative compounds over time, exactly the way Lesson 7's un-generalized repetition compounded: the more later lessons build on an unproven earlier claim, the more of the curriculum would be silently at risk if that claim ever turned out to have its own hidden `n = 40`. Demanding genuine proof, and being honest, as this unit is, about which claims have and haven't met that bar yet, costs the real work the next two lessons are about to do; it is what allows every future lesson in this curriculum to build on earlier results the way Lesson 20 built on Lesson 17 — not because nothing has broken yet, but because it genuinely cannot.

---

## Closing

### Connect the pieces

One idea — that examples suggest but proof establishes — traced through every unit built in this lesson, start to finish:

1. **A convincing pattern that failed (Unit 1):** `n² + n + 41`, prime for forty consecutive values, composite at `n = 40`.
2. **A genuine proof, recognized retroactively (Unit 2):** Lesson 21's `N + 1` argument, confirmed to reason about an arbitrary case rather than checking specific ones.
3. **A convincing-looking argument that wasn't actually valid (Unit 3):** the `1 = 2` "proof," broken by a hidden division by zero at Step 4.
4. **The two roles, named precisely (Unit 4):** evidence for discovering what's worth investigating, proof for actually establishing it — with Lesson 15's own earlier hedge recognized as already drawing this line.
5. **Why this curriculum specifically needs proof (Unit 5):** every act of reuse since Lesson 2 has depended on earlier results being genuinely trustworthy, not merely unbroken so far.

Unit 5's concern — what happens if "established" only ever meant "checked so far" — is answered directly by pointing back to Unit 1's own `n = 40`, the exact shape of failure a curriculum built on unproven claims would be quietly exposed to.

### What breaks without this

Suppose this curriculum had never drawn the distinction this lesson draws, and every "hard concept" reused across later lessons — Lesson 17's relation properties, Lesson 18's function definition, Lesson 20's ordering properties — had been accepted purely because checking a handful of examples in each case felt convincing, the way `n² + n + 41` felt convincing through thirty-nine values. A learner building genuinely new reasoning on top of one of these, much later in this curriculum, would have no way to know whether they were standing on solid ground or on a claim with its own undiscovered `n = 40` waiting somewhere in a case nobody happened to check. Worse, if that hidden flaw were eventually discovered, it would call into question not just the one claim, but every later result that had been built on top of it, exactly the way Concept Unit 3's Step 4 invalidated every step that followed it, however individually reasonable those later steps looked. Restoring this lesson's distinction — checking, honestly, whether each foundational claim is genuinely proven or only ever checked against examples, and treating the two differently — is what prevents an entire structure of later results from silently inheriting a flaw none of them could see.

### Exercises

1. **Observe.** Find a claim — in mathematics, in your own field, or in everyday life — that you've heard stated as though it were certain, and ask honestly whether it's actually been proven, or only observed to hold in every case encountered so far.
2. **Formalize.** State a numeric claim of your own, check it against five or six examples, and honestly report whether your checking suggests the claim is likely true, using Concept Unit 1's own honesty about what checking examples can and can't establish.
3. **Explain.** Find, or construct, one step in your own past reasoning (in this curriculum's exercises or elsewhere) where you accepted a conclusion because the argument "felt" rigorous, without checking every individual step. Identify, as precisely as you can, which step you skipped checking.
4. **Explain.** For your Exercise 2 claim, describe, honestly, what kind of general argument — reasoning about an arbitrary case, the way Lesson 21's `N + 1` argument did — would actually be needed to prove it, without necessarily constructing the full argument yet.
5. **Explain.** Name one claim used earlier in this curriculum (your own work or the lesson text) that was justified by checking examples rather than by an actual proof, the way Lesson 11 and Lesson 15 both admitted directly. State what would need to happen for that claim to become a genuine proof.

### Definition of done

- [ ] You can state, in your own words, the difference between evidence and proof, and explain why forty successful examples in a row is still only evidence.
- [ ] You can identify the specific, illegitimate step in the `1 = 2` argument and explain precisely why it isn't valid, using Lesson 3's vocabulary.
- [ ] You can explain why Lesson 21's `N + 1` argument counts as a genuine proof, using this lesson's precise definition rather than an intuitive sense of rigor.
- [ ] You can name at least one claim, from your own earlier work in this curriculum, that has only ever been supported by evidence rather than genuine proof.
- [ ] You completed Exercises 1–5 using your own claims and examples, not `n² + n + 41` or the `1 = 2` argument.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating one claim you personally believed was proven, before this lesson, that you now recognize was only ever supported by evidence.
