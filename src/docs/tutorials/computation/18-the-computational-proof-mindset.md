# Lesson 18: The Computational Proof Mindset

**What you will build**: By the end of this lesson you'll have a single, named, repeatable process combining every technique Section I has built — specification, small examples, invariants, induction, deliberate counterexample hunting, and proof by cases or contradiction — and you'll have watched it applied, start to finish, to a brand-new claim this series hasn't already proven. This closes Section I; Section II starts putting the same mindset to work on recursion and recursive data.

**What you need to know first**: Everything from Lessons 1 through 17 — this lesson doesn't introduce new logical machinery, it assembles what's already there into one usable sequence.

**Terms introduced in this lesson**:

- **the computational proof mindset** — a repeatable sequence for investigating whether a claim about a computation is true: state it precisely, try small concrete examples, look for invariant or inductive structure, actively search for counterexamples before trusting the claim, choose and complete an appropriate proof technique, then verify the proof's conclusion against the original concrete examples. *Why it matters*: this is the process every earlier lesson in this series has been following implicitly since Lesson 1 — naming it turns "notice you're doing this" into "deliberately do this next," on a claim none of those lessons already solved.

**Objects and methods used**: None new. This lesson applies `apply-deposit` and `apply-withdrawal`, both already fully covered, to a new claim.

---

## Concept Unit: The Mindset, Named and Ordered

### The Problem

Every proof in the last four lessons followed a similar rhythm — state something precisely, check it against a few numbers, notice a repeated structure, look for a way it could fail, then prove it properly. Is that rhythm actually one repeatable method, or does each proof just happen to resemble the others by coincidence?

### Introduce the concept in isolation

State the method as an ordered sequence, naming which earlier lesson supplied each step:

1. **Specify the claim precisely.** What exactly is being claimed, for which inputs, under which conditions? (Lesson 1's whole discipline — a claim that isn't precisely specified can't be proven or disproven, only argued about informally.)
2. **Try small, concrete examples.** Not as a proof, but as a sanity check and a source of intuition — does the claim even look plausible on cases small enough to trace by hand? (Every worked example since Lesson 2's arithmetic traces.)
3. **Look for invariant or inductive structure.** Is this a claim about something that stays true across a sequence of steps (an invariant, Lesson 16), or about every natural number (induction, Lesson 15)? Recognizing the shape early points toward which proof technique will actually fit.
4. **Actively search for counterexamples, before committing to a proof.** Don't just check the examples that come easily to mind — deliberately try to break the claim (Lesson 8's counterexample technique). A claim that survives a genuine, adversarial search is worth proving; one that doesn't survive just saved a great deal of wasted effort.
5. **Choose and complete an appropriate proof technique.** Direct argument, cases (Lesson 17), contradiction (Lesson 17), or induction (Lesson 15) — whichever fits the claim's actual shape, identified in step 3.
6. **Verify the proof's conclusion against the original concrete examples.** A completed proof that contradicts one of step 2's own worked examples has a mistake somewhere — in the proof, or in the original claim — and this check is what catches it before the claim gets trusted.

### Discard the throwaway example

Not applicable — the next unit applies this exact sequence, in order, to a real, new claim.

### CS Lens

This ordered sequence is a smaller-scale version of the eleven-step problem-solving framework this series formalizes fully in Section XIV (*Integration and Advanced Problem Solving*) — specify, model, establish a baseline, search for structure, prove, analyze, and so on. Learning the six-step version here, on claims about correctness specifically, is what will make that later, larger framework feel like a continuation rather than something new to learn from scratch.

### SE Lens

Skipping step 4 — the deliberate counterexample search — is the single most common way an informally "obviously true" claim survives into real, trusted code unproven. It's tempting to move straight from "a few examples worked" (step 2) to "prove it" (step 5), and the next unit's worked example shows exactly why that skip is dangerous: a claim that looks true on the first examples anyone would naturally try can still be false in general, and only an adversarial search — not more of the same easy examples — reliably catches it.

---

## Concept Unit: Applying the Full Method to a New Claim

### The Problem

Put the method to work on a claim this series hasn't already settled: *does the order in which a sequence of transactions is processed ever change the final balance?*

### Introduce the concept in isolation

**Step 1 — Specify.** The claim, stated precisely: for a fixed opening balance and a fixed multiset of transactions (some deposits, some withdrawals), does processing them in a different order ever produce a different final balance?

**Step 2 — Small examples.** Try a first, easy case: opening balance `100`, transactions `withdraw 90` and `deposit 5`.

```
Order A: withdraw 90 first — 100 ≥ 90, so 100 - 90 = 10; then deposit 5 — 10 + 5 = 15.
Order B: deposit 5 first — 100 + 5 = 105; then withdraw 90 — 105 ≥ 90, so 105 - 90 = 15.
```

Both orders give `15`. On this evidence alone, the claim looks true.

**Step 3 — Look for structure.** This has the shape of a claim about a *sequence of steps* — exactly Lesson 16's territory. If it's true, it's likely provable by induction on the number of transactions, the way earlier lessons proved things about sequences of any length.

**Step 4 — Actively search for counterexamples.** Step 2's single example agreed — but that's exactly the trap this method's fourth step exists to catch: one convenient example isn't a search. Try harder, deliberately picking numbers where a withdrawal's rejection might actually matter: opening balance `50`, transactions `withdraw 60` and `deposit 20`.

```
Order A: withdraw 60 first — 50 ≥ 60 is false, so the withdrawal is rejected; balance stays 50.
          Then deposit 20 — 50 + 20 = 70.
Order B: deposit 20 first — 50 + 20 = 70.
          Then withdraw 60 — 70 ≥ 60 is true, so 70 - 60 = 10.
```

`70` versus `10` — a genuine disagreement. The claim, as originally stated, is **false**. Step 2's single example didn't reveal this because it happened to avoid the exact situation (a withdrawal that succeeds in one order and gets rejected in the other) where order actually matters — precisely the risk of trusting a small number of easy examples instead of a deliberate search.

**Step 3, revisited.** The counterexample reveals *why* the claim failed: a withdrawal's outcome depends on the balance at the moment it's processed, and rejection (Lesson 7's `if`) makes that outcome order-sensitive. A deposit has no such condition — it always succeeds, unconditionally. This suggests a *narrower*, possibly true claim: **for a sequence containing only deposits, does order ever change the final balance?**

**Step 2, revisited for the narrower claim.** Opening balance `100`, deposits `10`, `20`, `5`:

```
Forward order: 100 + 10 = 110, + 20 = 130, + 5 = 135.
Reversed order: 100 + 5 = 105, + 20 = 125, + 10 = 135.
```

Both give `135`. This narrower claim survives the check.

**Step 4, revisited.** Search deliberately for a counterexample to the narrower claim: try negative-looking edge cases, a single deposit, zero deposits — nothing breaks it, because addition, unlike `apply-withdrawal`'s conditional subtraction, has no branch whose outcome depends on when it runs.

**Step 5 — Prove it, by induction.** *Claim: for any opening balance and any sequence of deposit amounts, the final balance after applying them in any order is the same.* Since the final balance is always the opening balance plus the sum of all the deposit amounts, this reduces to: *the sum of a list of numbers doesn't depend on the order they're added in.*

- **Base case:** a single deposit, or none at all — with zero or one item, there's only one possible "order," so the claim holds trivially.
- **Inductive step:** assume reordering doesn't change the sum for any sequence of `k` deposits. For `k+1` deposits, any reordering can be reached from any other by a sequence of swaps of two *adjacent* deposits (a fact this series will return to properly once sorting is covered in Section VI). Swapping two adjacent deposits, `a` then `b`, versus `b` then `a`, changes nothing: `balance + a + b` and `balance + b + a` are equal, because addition is commutative (Lesson 6's equality, applied to `a + b = b + a` directly). Since every reordering is reachable by such swaps, and no single swap changes the running total, no reordering changes the final sum.

**Step 6 — Verify against the examples.** The proof concludes the sum is order-independent; Step 2's revisited example (`135` both ways) and the earlier base-case check (a single deposit, trivially one order) both agree with this conclusion. No contradiction between the proof and the concrete evidence — the narrower claim is genuinely proven, not just plausible.

### Discard the throwaway example

Not applicable — this proof, like Lesson 15's sum formula, is now an established fact this series can cite going forward: transaction order matters exactly when rejection is possible, and never matters for deposit-only sequences.

### CS Lens

The corrected claim — "the sum of a list doesn't depend on the order it's summed in" — is precisely the mathematical property (**commutativity**, applied across an entire sequence rather than just two terms) that lets Section II's `reduce` (Lesson 27) and many of Section VI's algorithms process a collection's elements in whatever order is most convenient or efficient, without changing the result — a freedom this proof shows is only available because addition specifically has this property, not because "processing order generally doesn't matter."

### SE Lens

The false original claim ("transaction order never matters") is exactly the kind of belief that feels true after a quick check and stays unquestioned until it causes a real, hard-to-trace bug — a batch-processing system that assumes transaction order is irrelevant, built on an untested version of exactly this claim, would work correctly on most inputs and fail unpredictably on the specific inputs (a withdrawal near the balance's edge) where order actually matters. The deliberate counterexample search in step 4 is what stands between "seems true" and "is true" — and this worked example is proof that skipping it can hide a real, consequential mistake behind a first example that happened not to expose it.

### Connection to the previous unit

The previous unit stated the six-step method in the abstract; this unit ran every single step against a real claim, including the moment — step 4 — where the method's own discipline caught a false claim that step 2 alone had made look true, then guided the correction to a claim that's actually provable.

---

## Connect the Pieces

The complete record of this lesson's investigation, showing every technique from Section I contributing to one outcome:

| Step | Technique used | What it contributed |
|---|---|---|
| Specify | Lesson 1 | Turned a vague question ("does order matter?") into a precise, checkable claim |
| Small examples | Lesson 2's tracing | First evidence — misleadingly favorable, on its own |
| Structure | Lesson 16's invariants | Recognized this as a sequence-shaped claim, pointing toward induction |
| Counterexample search | Lesson 8 | Found the claim false as originally stated, and revealed *why* |
| Narrowed claim | Lesson 1, again | Respecified precisely, once the counterexample showed what needed excluding |
| Proof | Lesson 15's induction, Lesson 6's substitution | Established the narrowed claim for sequences of any length |
| Verification | Lesson 6's equality | Confirmed the proof's conclusion matches the concrete examples already checked |

Every row uses a technique this series built separately, in a different lesson, for a different original purpose — the actual claim this lesson closes with was never provable by any single one of them alone.

## What Breaks Without This

Suppose the investigation had stopped after step 2's first, favorable example — `withdraw 90` then `deposit 5`, agreeing at `15` both ways — and the original, broader claim ("transaction order never matters") had been accepted on that basis alone, skipping the deliberate counterexample search entirely. The `50`/`withdraw 60`/`deposit 20` case — a genuine, real disagreement (`70` versus `10`) — would have gone completely undetected, not because it's obscure or rare, but because nobody deliberately looked for the specific situation (a withdrawal that only succeeds in one order) where the claim actually fails. This is the entire lesson's point, demonstrated rather than just asserted: a mindset that stops at "a couple of examples agreed" is a fundamentally weaker check than one that includes a deliberate, adversarial step before trusting any claim enough to build on it.

## Exercises

1. **Trace.** Apply steps 1–2 of the method to the claim "doubling every deposit amount in a sequence doubles the total increase in balance." Specify it precisely, then check it against one small example.
2. **Predict.** Before searching, predict whether Exercise 1's claim needs the same "deposits only" restriction this lesson's main claim did. Search for a counterexample involving a withdrawal and see if your prediction holds.
3. **Prove.** Complete steps 3–6 of the method for Exercise 1's claim (restricted to deposits only, if your Exercise 2 search showed that's necessary): identify its structure, prove it, and verify against your step-2 example.
4. **Break it, on purpose.** Take any claim from an earlier lesson in this series that you found intuitively obvious, and deliberately spend five minutes trying to break it with an adversarial example before rereading that lesson's actual proof. Did you find anything the lesson's proof already accounted for, or missed?
5. **Generalize.** State a claim of your own about `apply-withdrawal` or `apply-deposit` that this series hasn't already proven, and run it through all six steps of the method, including a genuine counterexample search before committing to a proof.
6. **Reconstruct.** Close this lesson — and Section I. From memory, list all six steps of the computational proof mindset, in order, and explain in one sentence why step 4 has to come *before* step 5, not after.

## Definition of Done

- [ ] You can list the six steps of the computational proof mindset from memory, in order.
- [ ] You completed Exercise 2 and found (or ruled out) a counterexample through genuine, deliberate effort, not just a first guess.
- [ ] You completed Exercise 5 — a claim of your own, carried through all six steps, including a real counterexample search.
- [ ] You can explain, using this lesson's worked example, why a claim that survives one or two convenient examples can still be false in general.
- [ ] Commit your Exercise 5 claim, search, and proof (or disproof) to your notes repository, with a commit message stating whether your counterexample search found anything — for example, `"Investigate whether reordering deposits changes total interest earned — search found no counterexample; proved by induction, same commutativity argument as lesson 18"` — not just `"lesson 18 exercise, section I complete"`.

---

**Next lesson:** Lesson 19, *Recursive Definitions*, opens Section II — the Little-Schemer-style heart of this series — where numbers, lists, and trees get defined recursively for the first time, and every proof technique Section I built (especially induction and invariants) gets applied to code that calls itself, not just to sequences of transactions traced by hand.
