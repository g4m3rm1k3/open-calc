# Lesson 16: Invariants

**What you will build**: By the end of this lesson you'll be able to name, precisely, the kind of reasoning the last two lessons were already doing without a formal name — a fact that stays true while a computation changes everything else around it — and use the standard three-part structure (initialization, maintenance, termination) to prove one holds for an entire process, not just check it at the end.

**What you need to know first**: The previous two lessons' base case and inductive step, and Lesson 1's original bank-account constraint — this lesson gives that constraint, and the argument that proved it, their formal names.

**Terms introduced in this lesson**:

- **invariant** — a condition that remains true throughout a process, even as the process changes other things. *Why it matters*: this is the precise name for what the previous two lessons' balance-never-negative argument actually was — a name this series can now use directly, instead of re-describing the idea informally every time it comes up.
- **loop invariant** — an invariant tied to a repeated process, established by three things: it holds before the process starts (**initialization**), each step preserves it (**maintenance**), and it yields a useful guarantee once the process stops (**termination**). *Why it matters*: this is the standard, precise structure for proving a repeated computation correct — the previous two lessons' base case and inductive step, plus one new piece this lesson adds: what the invariant actually tells you once there's nothing left to process.
- **state invariant** — a condition that must hold for a piece of data's current value, checked whenever that value might change, independent of any one specific repeated process. *Why it matters*: distinguishes an invariant tied to a running loop from an invariant tied to the data itself, wherever and however it gets touched — the forward-pointer to Lesson 106's representation invariants, much later in this series.

**Objects and methods used**: None new. This lesson names and formalizes reasoning already used in the previous two lessons.

---

## Concept Unit: What Is an Invariant?

### The Problem

The last two lessons repeatedly argued that a bank account's balance stays non-negative "no matter how many transactions occur." That argument had a very specific shape — something stayed true the whole time, even as the balance itself kept changing with every transaction. Is there a name for *that specific kind of fact* — true throughout, even while everything around it changes?

### Introduce the concept in isolation

An **invariant** is exactly this: a condition that remains true throughout a process, while the process changes other things freely. The balance itself is *not* invariant — it changes with every transaction, that's the whole point of processing one. "The balance is non-negative" *is* invariant — its specific numeric value changes constantly, but the property of not being negative never stops holding, transaction after transaction.

The distinction matters because most of what a computation does is change things — that's what makes it useful. An invariant is the deliberately chosen exception: the one thing (or few things) a computation's author decides must *never* change, no matter what else does, and that decision is what makes the rest of the changing behavior trustworthy rather than chaotic.

### Discard the throwaway example

Not applicable — this unit names something already established, rather than introducing new code.

### Formal Definition, Walked Through

> An **invariant** is a condition *I* such that, for every state a process passes through, *I* holds — regardless of what other values change between those states.

- *"for every state a process passes through"* — Lesson 9's universal quantifier, ranging over every point in a computation's execution, not just its start and end.
- *"regardless of what other values change"* — this is the part that makes an invariant worth naming at all: if *nothing* changed, there would be nothing to distinguish an invariant from any other fact. An invariant's entire value is holding steady *despite* surrounding change, not because nothing is happening.

### CS Lens

Naming a property invariant, specifically, and reasoning about it separately from everything that's allowed to change, is one of the single most load-bearing habits in software correctness — it's the exact idea behind a database transaction's consistency guarantee (Lesson 222), a physical system's conservation law (energy, momentum — quantities that stay fixed while a system evolves), and a building's structural load limit (a property that must hold at every moment the building is in use, regardless of how many people are inside or what they're doing).

### SE Lens

Without naming a computation's invariants explicitly, "is this still correct" has no fixed target to check against — every change to the code becomes a fresh, informal judgment call about whether *anything* important might have broken. Stating the invariant once, precisely, turns that judgment call into a specific, checkable question: does this change still preserve *this exact condition* — the same shift from vague confidence to checkable claim this series has made repeatedly since Lesson 1's original correctness criterion.

---

## Concept Unit: Loop Invariants — Proving a Property Holds at Every Iteration

### The Problem

The previous lesson's induction proved a formula true for every natural number using a base case and an inductive step — two parts. Processing a bank account's transactions isn't quite the same shape: it's a *finite* sequence that eventually *stops*, once every transaction has been handled. Does induction's two-part structure need anything extra to handle a process that actually ends, rather than continuing through every natural number forever?

### Introduce the concept in isolation

A **loop invariant** is proven with three parts, not two:

1. **Initialization** — the invariant holds *before the first step*. For the bank account: before any transaction is processed, the balance is the opening balance, which is non-negative by assumption. (This is exactly the previous lesson's base case, renamed for a process with a starting point rather than a smallest natural number.)
2. **Maintenance** — if the invariant holds before a step, it still holds after that step. For the bank account: this is exactly the previous lesson's inductive step, checked directly against `apply-withdrawal`'s two branches.
3. **Termination** — when the process stops (here, once every transaction in the day's list has been processed), the invariant, combined with the fact that the process has ended, yields the actual guarantee being sought.

The first two parts are the previous lesson's induction, under new names suited to a process with a beginning and an end rather than an unending sequence of natural numbers. **Termination** is genuinely new: it's the moment the invariant's usefulness cashes out. For the bank account: once the last transaction has been processed, the loop invariant ("balance is non-negative") still holds — and *because* the loop is now finished, that invariant *is* the final guarantee: the day's ending balance is non-negative. Without ever needing to re-examine any individual transaction, the invariant alone — carried faithfully from initialization through every step of maintenance to termination — delivers the answer.

### Discard the throwaway example

Not applicable — this formalizes an already-established argument rather than introducing new code.

### Mechanical walkthrough — how it works in isolation

- **Initialization** corresponds exactly to the base case already proven for the bank account: the opening balance is non-negative by assumption, checked once, directly.
- **Maintenance** corresponds exactly to the inductive step already proven: `apply-withdrawal`'s two branches, checked in the previous lesson, each preserve non-negativity.
- **Termination** is the new piece: because a real day's transactions are a *finite* list, the process actually stops — and the invariant, still holding at that stopping point, becomes the guarantee about the day's *final* balance, not just an abstract claim about "every possible number of transactions."

### CS Lens

This exact three-part structure — initialization, maintenance, termination — is the standard method for proving any loop-based algorithm correct, used identically whether the loop processes a bank account's transactions, sorts a list (Section VI), or searches a graph (also Section VI): state what must be true before the loop starts, prove each iteration preserves it, and read off the final guarantee once the loop has nothing left to process.

### SE Lens

Termination is often the part skipped in informal reasoning — it's tempting to check that a loop "does the right thing each time through" (maintenance) and stop there, without stating precisely what fact the *finished* computation is actually guaranteed to have. A loop invariant that's never connected back to what happens when the loop ends is only two-thirds of a real correctness argument — true at every step, but never actually cashed in for the specific guarantee the whole computation exists to provide.

### Connection to the previous unit

The previous unit named the general idea of a condition that survives change; this unit gives the precise, three-part recipe for proving one holds throughout an entire finite process, reusing the previous two lessons' base case and inductive step under their standard names, plus the one new piece — termination — that a finite process needs and an infinite induction over natural numbers doesn't.

---

## Concept Unit: State Invariants — Conditions a Value Must Always Satisfy

### The Problem

Lesson 1's bank-account specification had a *second* constraint beyond the balance staying non-negative: every transaction amount must be positive. This isn't a claim about a *sequence of steps* the way the balance invariant was — it's a claim about individual pieces of data, checked wherever they appear, regardless of any particular loop processing them. Is this the same kind of thing as a loop invariant, or something different?

### Introduce the concept in isolation

A **state invariant** is a condition that must hold for a piece of data's value, full stop — not tied to stepping through a specific process, but to the data itself, however it's created or touched. "Every transaction amount is positive" is exactly this: it's not about balance changing over a sequence of steps, it's a condition a single transaction record must satisfy the moment it's created, and continue to satisfy for as long as it exists.

The distinction matters in practice: a loop invariant is proven once, for one specific loop, using initialization/maintenance/termination. A state invariant has to be protected everywhere a value of that kind could possibly be created or modified — a much broader obligation, since there's no single "loop" to attach the proof to. A transaction amount could be created directly, read from a file, computed from user input, or produced by another function entirely — a state invariant has to hold regardless of which of those paths produced it.

### Discard the throwaway example

Not applicable — conceptual distinction, illustrated with Lesson 1's own already-stated constraint.

### Formal Definition, Walked Through

> A **state invariant** is a condition on a piece of data that must hold at every point where that data is observed, independent of which process created or modified it.

- *"independent of which process created or modified it"* — this is the key difference from a loop invariant, which is proven relative to one specific, named process (initialization, maintenance, termination, for *that* loop). A state invariant makes a broader claim: no matter *how* a transaction amount came to exist, it must be positive.

### CS Lens

State invariants are the exact idea behind a database column constraint (`amount > 0`, enforced by the database itself regardless of which application code inserted the row), a type system's refinement types (a type that only admits values satisfying some condition), and Lesson 106's *representation invariants*, which formalize this precisely for data structures: the contract a structure's internal representation must always satisfy, checked at every operation that could possibly change it, not just one loop.

### SE Lens

Enforcing a state invariant in exactly one place (say, only in the function that first creates a transaction record) is fragile the moment a second way to create one is added later, elsewhere in a system, without anyone remembering to re-check the same condition there too. This is a real, common source of bugs distinct from anything a loop invariant proof would catch — the loop invariant proof only ever reasoned about *one* specific process; a state invariant's true obligation is every process, including ones that don't exist yet.

### Connection to the previous unit

The previous unit proved an invariant tied to one specific, named loop; this unit names a different, broader kind of invariant — tied to a piece of data itself, wherever it appears — that this series will return to formally once real data structures exist to protect.

---

## Connect the Pieces

Both kinds of invariant, stated together for the bank account, in the vocabulary this lesson just built:

> **Loop invariant** (proven for the transaction-processing loop, using initialization, maintenance, and termination): the balance is non-negative before the loop starts, after every transaction, and — because the day's transaction list is finite and the loop eventually finishes — non-negative in the final, ending balance.
>
> **State invariant** (required of every transaction record, regardless of what process produces it): the transaction amount is positive, checked wherever a transaction is created — whether typed in directly, read from a file, or computed by some other part of the system.

Both are invariants in the sense Concept Unit 1 defined — conditions that hold despite surrounding change — but they answer to different obligations: the loop invariant is proven once, for one specific, finite process, using the three-part structure; the state invariant has to be defended everywhere a transaction could possibly come from, with no single loop's proof covering all of them.

## What Breaks Without This

Suppose a new code path were added later — a "bulk import" feature that loads transactions directly from an external file, bypassing whatever function previously enforced "amount must be positive." The loop invariant proof from Concept Unit 2 is entirely unaffected by this change — it was never about *where transactions come from*, only about how the loop processes whatever list it's given. But the state invariant is now silently violated: a negative "amount" from the imported file could enter the transaction list, and the loop invariant's own maintenance step — which trusted `apply-withdrawal`'s `if` check to keep the balance non-negative — was never proven against a transaction whose amount itself was invalid to begin with. A loop invariant proof this careful can still coexist with a real bug, if the state invariant it silently depended on (valid transaction amounts) was never separately guaranteed everywhere data enters the system.

## Exercises

1. **Trace.** State, in your own words, the initialization, maintenance, and termination parts of the loop invariant for a claim of your choosing: "the total number of transactions processed so far never decreases." (This one should feel almost too easy — the point is practicing naming all three parts cleanly.)
2. **Predict.** Before checking, predict whether "the account holder's name never changes" is more naturally a loop invariant or a state invariant, for a system that processes many transactions for the same account. Justify your answer using this lesson's distinction.
3. **Classify.** For each of these, decide whether it's a loop invariant, a state invariant, or both: (a) "the sum of all deposits equals the sum of all recorded deposit transactions," (b) "an account number is always a positive integer," (c) "the number of remaining transactions to process decreases by one each iteration."
4. **Break it, on purpose.** Using the bulk-import scenario from "What Breaks Without This," describe one concrete negative-amount transaction that would pass through the loop invariant's own maintenance check without being caught — and explain exactly why the loop invariant proof alone couldn't have prevented it.
5. **Generalize.** Write a loop invariant, with all three parts, for a claim about `apply-deposit` alone (no withdrawals): "the balance is always at least as large as the opening balance." State initialization, maintenance, and termination explicitly.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between a loop invariant and a state invariant, and explain why termination is a genuinely new part this lesson added, not just a renaming of something induction already had.

## Definition of Done

- [ ] You can state the three parts of a loop invariant proof — initialization, maintenance, termination — from memory, and explain what each one is actually claiming.
- [ ] You can distinguish a loop invariant from a state invariant using your own example, not just this lesson's.
- [ ] You completed Exercise 5, writing a complete three-part loop invariant proof for a claim this lesson didn't already prove.
- [ ] You can explain why a correct loop invariant proof can still coexist with a real bug, if a state invariant it depends on is violated elsewhere.
- [ ] Commit your Exercise 5 proof to your notes repository, with a commit message naming which of the three parts you found hardest to state precisely — for example, `"Prove deposit-only balance invariant — maintenance was straightforward, termination needed stating what 'no more transactions' actually guarantees"` — not just `"lesson 16 exercise"`.

---

**Next lesson:** Lesson 17, *Proof by Cases and Contradiction*, adds two more proof techniques to this series' growing toolkit — splitting a problem into every case it could possibly fall into, and deriving a contradiction from a false assumption — both of which have already appeared quietly inside this series' proofs (`apply-withdrawal`'s two branches, `implies`'s vacuous truth) without being named as techniques in their own right.
