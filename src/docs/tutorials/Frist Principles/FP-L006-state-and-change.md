# Lesson 6: State and Change

**What you will build:** Still nothing runnable — this lesson breaks an assumption Lesson 5 quietly relied on: that once a name is bound, it stays bound to the same value for good. Some quantities genuinely change over time — a bank balance after a deposit, a score during a game — and this lesson names that kind of quantity *state*, and names the act of updating what a name currently means *reassignment*. The transferable problem this lesson is actually about: the moment a value is allowed to change, *when* you look at it starts to matter, and so does the *order* changes happen in — two things that never mattered anywhere in Lessons 1 through 5, because nothing in them was ever allowed to change after it was set.

**What you need to know first:** Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically Concept Unit 4's finding that evaluation order doesn't affect the final value of independent subexpressions; this lesson shows that finding does not extend to sequences of state changes. Lesson 5 (`FP-L005-names-and-bindings.md`) — specifically *name*, *binding*, *environment*, and *substitution*, all reused directly, and all challenged by this lesson's central question: what happens to a binding, and to substitution, once a name can be bound to a new value more than once?

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **State** — a quantity whose correct description always has an implicit "currently" attached to it, because it is expected to change over time. A bank balance is state: it is not "50," it is "currently 50," and that word "currently" is doing real work, because tomorrow the correct answer could be different. This is named separately from *value* (Lesson 3) because a value like 5 is simply 5, permanently — nothing about it needs the word "currently" at all.
- **Reassignment** — replacing an existing binding with a new one for the same name, so that the name now stands for a different value than it did before. Reassignment is distinct from creating a fresh binding for a new name (Lesson 5): it changes what an *already-bound* name currently means, rather than introducing a name that meant nothing before.
- **Snapshot** — the value a piece of state holds at one specific moment, considered on its own, apart from what it held before or will hold after. "The balance was 50 right before the deposit" describes a snapshot; "the balance" on its own, without a specified moment, does not.
- **Order-dependence** — the property of a sequence of changes where the final result depends on which order the changes are applied in, not merely on which changes occur. A sequence of state changes is typically order-dependent, in direct contrast to Lesson 4's independent subexpressions, whose evaluation order never affected the final value.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain arithmetic notation, using one running example — a bank account balance, changed by a deposit and a withdrawal.

---

## Concept Unit 1: Revisiting a Binding — Can It Change?

### The Problem

Lesson 5 bound `batches` to 3 and never touched that binding again for the rest of the lesson — every example assumed a name, once bound, simply kept its value for as long as it was needed. Now consider a bank account: `balance`, bound to 50, representing what's currently in the account. A customer deposits 100. Is `balance` still bound to 50? Clearly not — the account genuinely holds 150 now. But Lesson 5 never said what happens to a binding after the moment it's made; every one of its examples only ever asked "what is this name bound to," never "what happens when a name that's already bound needs to mean something new." That gap is exactly what this lesson exists to close.

### No isolated lab for this step

This concept has no code of its own to isolate — noticing the gap Lesson 5 left open is a matter of examining that lesson's own examples closely, not a construct with its own syntax.

### Applying It — a Bank Account

**The situation:** `balance` is bound to 50, representing the amount currently in the account.

**The event:** a deposit of 100 is made.

**The question Lesson 5 has no answer for:** does `balance` still mean 50? If Lesson 5's bindings really were permanent, the answer would have to be yes — and that answer is simply wrong. The account holds 150 now; anyone consulting `balance` and getting back 50 after the deposit would be looking at a number that no longer describes reality.

**What this demands, stated plainly:** something in this lesson has to let `balance` mean something different after the deposit than it did before — not a new name for "the balance after the deposit," but the *same* name, `balance`, now standing for a new value.

### Walkthrough

- **`balance`, bound to 50** — a reappearance of *binding* from Lesson 5, applied here to a quantity that (unlike `batches` in Lesson 5's recipe example) is about to change.
- **"a deposit of 100 is made"** — introduces, concretely, an event that should change what `balance` means, without yet saying how that change is represented.
- **"does `balance` still mean 50?"** — the question this whole unit exists to raise; not a new named concept yet, but the direct exposure of the gap Lesson 5 left unaddressed.

### CS Lens

This is the seam between a quantity that is fixed once decided and one that is expected to be revisited and updated — a distinction every system that models something changing in the real world eventually has to draw. Also recognized in: a variable in a program that gets reassigned as a loop runs; a thermostat's displayed "current temperature," meaningfully different at different times even though the same word refers to it each time; a stock ticker symbol, whose price the same symbol points to all day changes constantly; a scoreboard, where "the score" is the same named quantity throughout a game, meaning something different after every point.

### SE Lens

The alternative to allowing a binding to change is to keep Lesson 5's assumption that once bound, a name is finished — permanent, safe to substitute at any later point without a second thought. The real cost of that alternative is that it cannot represent an account balance, a running score, or anything else that genuinely changes over time at all; the model simply has no way to say what those things mean after the moment they were first bound. Allowing a binding to be replaced buys back the ability to represent change — at a real cost, worked out over the rest of this lesson, to the guarantee Lesson 5 quietly relied on: that a name always means the same thing no matter when you ask.

---

## Concept Unit 2: Reassignment — Replacing a Binding With a New One

### The Problem

Concept Unit 1 established that `balance` needs to mean something different after the deposit — but it did not yet say exactly what happens to make that so. One option would be to leave `balance` alone and introduce a second name, `balance_after_deposit`, for the new amount. That approach is workable, and this curriculum will return to it seriously later — but for an ordinary account balance, it is usually more natural, and more directly matches how people already talk about it ("check your balance"), to keep using the one name `balance` and simply update what it currently points to. That update — the same name, a new value replacing the old one — is reassignment.

### No isolated lab for this step

This concept has no code of its own to isolate — reassignment is demonstrated directly below as the mechanism resolving Concept Unit 1's open question, not through a construct with its own syntax.

### Applying It — a Bank Account

**Before the deposit:** `balance` is bound to 50.

**The deposit, expressed as a new binding for the same name:** `balance` is reassigned to `balance + 100`. Substituting (Lesson 5) the current binding of `balance`, 50, into this expression gives `50 + 100`, which reduces (Lesson 4) to 150. `balance` is now bound to 150.

**After the deposit:** `balance` is bound to 150 — the exact same name as before, now standing for a different value. Nothing about the *name* changed; what changed is which value it currently refers to.

**Distinguishing this from Lesson 5's binding, explicitly:** Lesson 5's binding was a name's first and only association with a value. Reassignment is different in kind — it requires the name to already be bound to something, and it replaces that existing association with a new one, rather than establishing one for the first time.

### Walkthrough

- **"`balance` is reassigned to `balance + 100`"** — first appearance of *reassignment*: an expression, evaluated using the name's own current binding, whose result becomes that same name's new binding.
- **Substituting 50 for `balance`, then reducing `50 + 100` to 150** — a reappearance of *substitution* (Lesson 5) and *reduction* (Lesson 4), applied here to an expression that happens to reference the very name being reassigned.
- **"`balance` is now bound to 150"** — confirms the outcome: the same name, now pointing to a new value, exactly resolving the open question from Concept Unit 1.
- **The explicit contrast with Lesson 5's binding** — not a new concept, but a direct clarification of how reassignment differs from the binding act Lesson 5 already defined.

### CS Lens

This is the idea of updating what a name currently refers to, in place, rather than establishing a brand-new, permanent association. Also recognized in: `x = x + 1`, reassigning a variable in terms of its own current value, in essentially every programming language with mutable variables; a librarian updating a checked-out-book count at the front desk rather than writing a fresh count on a new card each time; a whiteboard tally being erased and rewritten as a running total changes; a thermostat's setpoint being changed from 68 to 70, the same named setting now holding a different value.

### SE Lens

The alternative to reassigning `balance` in place is to give the post-deposit value its own new name — `balance_after_deposit` — and leave the original `balance` untouched, preserving it exactly as it was. The real cost of reassignment, paid for the convenience of always having one obvious name to ask "what does the account currently hold": the old value, 50, is gone the moment `balance` is reassigned — nothing in this lesson's model keeps it around unless something deliberately saves it first. The alternative — never overwriting, always naming a new value freshly — keeps every past value recoverable, at the real cost of needing a fresh name for every single change and needing to track which one is "the current one." This exact tradeoff, overwrite-in-place versus always-keep-the-old-one, returns later in this curriculum in far more depth, once persistent data structures are introduced.

---

## Concept Unit 3: State — a Value Defined by "Currently," Not by "Always"

### The Problem

Not every quantity in a calculation is like `balance`. The 10% tax rate from Lesson 3 is not expected to change moment to moment the way an account balance is — describing it as "the tax rate is currently 0.10" would be strange; it simply *is* 0.10, full stop, for as long as this lesson's example is being discussed. `balance`, on the other hand, genuinely needs that word "currently" — leaving it out and just saying "the balance is 50" quietly claims something that might already be false by the time anyone reads it. This lesson needs a name for quantities in the second category: ones whose correct description depends on when you ask.

### No isolated lab for this step

This concept has no code of its own to isolate — distinguishing a quantity that needs "currently" from one that doesn't is a distinction made in plain language, not a construct with its own syntax.

### Applying It — a Bank Account

**A quantity that does not need "currently":** the tax rate, 0.10, from Lesson 3. Saying "the tax rate is 0.10" is simply true, without any implied moment attached — it does not become a different statement tomorrow.

**A quantity that does:** `balance`. "The balance is 50" was true before the deposit in Concept Unit 2, and false immediately after it. The only way to make the sentence reliably true is to add the word this unit has been building toward: "the balance is *currently* 50."

**Naming the second kind of quantity directly:** `balance` is state — its correct value is always relative to a moment, and that moment is assumed to be "right now" unless something says otherwise.

### Walkthrough

- **The tax rate, 0.10, re-examined** — a reappearance of *value* (Lesson 3), specifically chosen to contrast with `balance`, since it needs no notion of "currently" attached to it at all.
- **"the balance is 50," true before the deposit, false immediately after** — establishes concretely why `balance` cannot be adequately described without referencing a moment in time.
- **"`balance` is state"** — first appearance of *state*, defined directly by contrast with the tax rate: a quantity whose correct description requires an implicit or explicit "currently."

### CS Lens

This is the distinction between a quantity that is fixed for the purposes of a computation and one that is expected to be read differently depending on when it's consulted. Also recognized in: an object's fields in object-oriented programming (state, expected to change) versus a mathematical constant like π (never state, no matter what language it's used in); a game's current score (state) versus the fixed rules that govern how scoring works (not state); a sensor's live temperature reading (state) versus the boiling point of water at sea level (not state); a web page's live view count (state) versus the page's fixed publication date (not state, once set).

### SE Lens

The alternative to distinguishing state from ordinary values is to treat every quantity in a calculation the same way — as if it were simply "a value," with no marked difference between the tax rate and the balance. The real cost of that alternative is a class of bug that shows up specifically when a quantity that actually is state gets treated as though it weren't: a `balance` read once and reused later, on the unstated assumption that it hasn't changed since, silently goes stale the moment a deposit or withdrawal happens in between. Explicitly marking which quantities are state costs the discipline of tracking the distinction as a calculation is designed, and is exactly what prevents that class of bug before it happens, by making "this can change out from under you" visible rather than assumed away.

---

## Concept Unit 4: Why Substitution Now Needs a "When"

### The Problem

Lesson 5's substitution step replaced a name with its bound value, and nothing in that lesson worried about exactly *when* the lookup happened, because every binding in Lesson 5 was made once and never touched again — looking up `batches` at the start of a calculation or partway through gave the same answer either way. Once a name can be reassigned, that stops being true. Substituting `balance` for 50 is correct only if the substitution happens before the deposit; substituted after the deposit, `balance` should be replaced with 150 instead. The exact same act — "substitute `balance` with its current value" — now gives two different, both individually correct, answers, depending on nothing but when it's performed.

### No isolated lab for this step

This concept has no code of its own to isolate — the timing-dependence of substitution is demonstrated directly below, not through a construct with its own syntax.

### Applying It — a Bank Account

**Substituting `balance` before the deposit (Concept Unit 2's starting point):** `balance` is bound to 50. An expression like `balance ÷ 2` (perhaps checking half the current balance for some purpose) substitutes to `50 ÷ 2`, reducing to 25.

**Substituting the same expression, `balance ÷ 2`, after the deposit:** `balance` is now bound to 150. The same expression substitutes to `150 ÷ 2`, reducing to 75.

**Neither answer is wrong — that is precisely the point:** 25 correctly answers "half the balance, before the deposit"; 75 correctly answers "half the balance, after the deposit." Both are correct substitutions of the exact same expression; what changed was not the expression, and not a mistake in substitution — only the moment the substitution happened relative to the reassignment.

**What this demands going forward:** any statement about `balance`'s value now has to be understood as implicitly attached to a moment — a snapshot — rather than as a timeless fact the way `batches` in Lesson 5 could be treated.

### Walkthrough

- **`balance ÷ 2`, substituted before the deposit, giving 25** — a reappearance of *substitution* (Lesson 5), explicitly anchored to a specific moment for the first time in this curriculum.
- **The identical expression, substituted after the deposit, giving 75** — demonstrates directly that the same substitution act can correctly produce two different results, purely as a function of timing.
- **"a snapshot"** — first appearance of *snapshot*: naming the value state holds at one specific moment, which is what a correct substitution of a stateful name actually depends on.

### CS Lens

This is the fact that reading a changing quantity is only meaningful relative to a specific moment — the same read, performed at two different times, can correctly return two different answers. Also recognized in: a race condition in a concurrent program, where two parts of a system reading and reasoning about the same changing value at slightly different, unsynchronized moments can reach conflicting conclusions; checking a bank balance in a mobile banking app that may already be stale by the time a purchase is attempted; a cached web page value that becomes outdated the instant the underlying data changes, even though the cache itself hasn't noticed; a live sports score, correctly reported at the moment it's checked, and potentially wrong one second later.

### SE Lens

The alternative to treating substitution as timing-dependent is to keep Lesson 5's assumption that a lookup can happen at any convenient moment without needing a second thought. The real cost of that alternative, once state is involved, is exactly the class of subtle bug this unit exists to name: a value looked up slightly too early or too late relative to a reassignment produces a different, silently wrong answer, and the code performing the lookup often has no way to tell, on its own, that it happened at the wrong moment. Treating every read of a stateful name as anchored to a specific snapshot costs the discipline of asking "as of when?" before trusting a substitution — a discipline this curriculum will return to in much greater depth once concurrent systems, where many different parts of a program can read the same state at unpredictable, overlapping moments, are introduced later on.

---

## Concept Unit 5: Order Matters for a Sequence of State Changes

### The Problem

Lesson 4, Concept Unit 4, found that evaluating `(3 + 5)` before `(10 − 4)`, or the other way around, made no difference to the final value of `(3 + 5) × (10 − 4)` — the two subexpressions were independent, neither depending on the other's result. It would be a natural mistake, fresh off that lesson, to expect the same thing here: that applying a deposit and a withdrawal to `balance`, in either order, should land on the same final balance. It does not. A deposit of 100 followed by a withdrawal of 150 is a genuinely different sequence of events from a withdrawal of 150 followed by a deposit of 100 — not because the arithmetic is different, but because each change now depends on the state the previous one left behind, which is exactly the dependency Lesson 4's independent subexpressions never had.

### No isolated lab for this step

This concept has no code of its own to isolate — the order-dependence of these two sequences is demonstrated directly below, not through a construct with its own syntax.

### Applying It — a Bank Account

**Starting state, both sequences:** `balance` bound to 50. One rule governs every change: a withdrawal is only valid if it does not take the balance below 0.

**Sequence 1 — deposit, then withdraw:**

1. Deposit 100: `balance` reassigned to `50 + 100 = 150`.
2. Withdraw 150: checked against the rule — `150 − 150 = 0`, not below zero, so this is valid. `balance` reassigned to `0`.

Final balance: 0. Both steps succeeded.

**Sequence 2 — withdraw, then deposit — the same two changes, reversed:**

1. Withdraw 150: checked against the rule — `50 − 150 = −100`, which is below zero. This withdrawal is invalid and does not happen at all; `balance` remains 50.
2. Deposit 100: `balance` reassigned to `50 + 100 = 150`.

Final balance: 150. Only the deposit succeeded; the withdrawal was rejected.

**The comparison, stated directly:** the same two changes — a deposit of 100 and a withdrawal of 150 — applied to the same starting balance, produce two entirely different outcomes (0 versus 150, one sequence fully succeeding and the other partially rejected) depending purely on the order they're applied in. This is order-dependence, and it is the direct opposite of what Lesson 4 found for independent subexpressions.

### Walkthrough

- **Sequence 1, ending at `balance = 0`, both steps valid** — establishes one legitimate order and its outcome, including the withdrawal rule (a reappearance of *constraint* from Lesson 1, applied here to a valid state rather than to a valid output) being checked and satisfied.
- **Sequence 2, the withdrawal rejected at step 1** — the same constraint, this time violated, producing a materially different outcome: not just a different number, but a different set of changes actually taking effect at all.
- **"the direct opposite of what Lesson 4 found"** — first appearance, explicitly named, of *order-dependence*, deliberately contrasted with Lesson 4 Concept Unit 4's finding that independent subexpressions' evaluation order didn't matter.

### CS Lens

This is the fact that a sequence of changes to shared, evolving state generally cannot be reordered without risking a different outcome — in sharp contrast to independent computations, which often can be. Also recognized in: real bank transaction processing, where the order pending transactions are applied in can determine whether an overdraft fee is charged; a video game applying a heal and a damage effect within the same turn, where the order changes whether a character survives; construction sequencing, where a foundation must be poured before walls are framed, not the reverse; a recipe where creaming butter and sugar before adding eggs produces a different texture than doing it in the opposite order.

### SE Lens

The alternative to explicitly reasoning about order for a sequence of state changes is to carry Lesson 4's finding forward by default, assuming that if each individual change is valid, the order they happen in shouldn't matter. The real cost of that assumption, made explicit by Sequence 1 versus Sequence 2 above, is that it is simply false for state: each change here depends on the balance left behind by whichever change came before it, which is exactly the kind of dependency Lesson 4's independent subexpressions never had. Deliberately checking a sequence of state changes as a whole — not just each change in isolation — costs the extra step of asking "what did the state look like right before this particular change," but it is the only way to predict, correctly, which of two orderings of the same changes will actually succeed.

---

## Closing

### Connect the pieces

One account, traced through every unit built in this lesson, start to finish:

1. **The gap in Lesson 5's model, exposed (Unit 1):** `balance`, bound to 50, has no way under a "bind once" model to become 150 after a deposit.
2. **Reassignment, resolving it (Unit 2):** `balance` reassigned to `balance + 100`, substituted and reduced to 150 — the same name, a new value.
3. **State, named directly (Unit 3):** `balance` needs the word "currently"; the tax rate from Lesson 3 does not — that difference is exactly what makes `balance` state.
4. **Substitution's new dependency on timing (Unit 4):** `balance ÷ 2` correctly substitutes to 25 before the deposit and 75 after it — the same expression, two correct answers, depending only on when the lookup happens.
5. **Order-dependence (Unit 5):** deposit-then-withdraw ends at 0, both changes valid; withdraw-then-deposit ends at 150, with the withdrawal rejected — the same two changes, reversed, producing genuinely different outcomes.

Unit 5's two sequences both start from exactly the balance Unit 2 produced conceptually — this lesson never introduced a second, unrelated account partway through.

### What breaks without this

Suppose Unit 5's order-dependence had been ignored, on the assumption (carried over uncritically from Lesson 4) that as long as both a deposit and a withdrawal are individually valid, the order a batch of transactions is processed in doesn't matter. A system built on that assumption receives both transactions — withdraw 150, deposit 100 — at nearly the same moment, and happens to process the withdrawal first, exactly as in Sequence 2. If that system does not check the withdrawal rule as strictly as Concept Unit 5's example did — if, say, it allows the balance to dip temporarily negative and assumes the incoming deposit will "cover" it — the balance briefly and silently drops to −100 before the deposit lands, comes back up to 150 a moment later, and every party downstream only ever sees the final 150, never noticing the account was ever actually overdrawn along the way. A separate system relying on `balance` never going negative — one charging an overdraft fee the instant it's detected, say — could act on that brief negative snapshot and charge a fee for an overdraft the account holder never intended to happen, purely because of processing order. Restoring Unit 5's discipline — checking each change against the actual state left behind by the one before it, and rejecting a change outright rather than letting it briefly violate the rule — removes this failure by making the order transactions are processed in something that is deliberately reasoned about, not silently assumed away.

### Exercises

1. **Observe.** Name a real-world quantity that is state (needs "currently" to describe correctly) and one that is not, the way Concept Unit 3 contrasted `balance` with the tax rate.
2. **Predict.** For your state quantity from Exercise 1, write a starting value and one change that reassigns it, the way Concept Unit 2 reassigned `balance` after a deposit. Predict its new value before working it out with substitution and reduction.
3. **Formalize.** Write two changes to your Exercise 1 quantity that could plausibly happen in either order (like the deposit and withdrawal). State one rule, the way Concept Unit 5 stated the no-negative-balance rule, that a valid state must satisfy.
4. **Explain.** Apply your two changes from Exercise 3 in both possible orders, the way Concept Unit 5 applied deposit-then-withdraw and withdraw-then-deposit. State the final result of each order, and whether either order caused a change to be rejected under your stated rule.
5. **Explain.** Using Concept Unit 4's vocabulary, describe a moment at which reading your Exercise 1 quantity would give one answer, and a different moment at which reading the exact same quantity, with no expression changed, would give a different, equally correct answer.

### Definition of done

- [ ] You can state, in your own words, the difference between a value (Lesson 3) and state, without describing one only as "the opposite of" the other.
- [ ] You can explain what reassignment changes and what it leaves unchanged about a name.
- [ ] You can give an example of an expression whose correct substitution depends on when it's performed, and explain why, using the word "snapshot."
- [ ] You can explain, using your own two-change example, why Lesson 4's "order doesn't matter for independent subexpressions" finding does not carry over to sequences of state changes.
- [ ] You completed Exercises 1–5 for a state quantity of your own choosing, not the bank balance example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which of your two orders in Exercise 4 you initially expected to behave the same as the other, and why it didn't.
