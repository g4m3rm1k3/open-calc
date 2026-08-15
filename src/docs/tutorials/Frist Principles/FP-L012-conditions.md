# Lesson 12: Conditions

**What you will build:** Still nothing runnable — this lesson introduces a way for a Boolean value to do more than just be a value: to actually choose which of two different computations happens next. Lesson 11's implication, `P → Q`, evaluates to a single Boolean value, `true` or `false` — it never causes anything else to happen. This lesson's conditional expression is different in kind: it uses a Boolean value to select, and evaluate, exactly one of two other expressions, throwing the other away unevaluated. The transferable problem this lesson is actually about: some computations genuinely need to do one thing or another depending on circumstances, and nothing built so far in this curriculum can express "do this, or else do that" as a single expression with one value.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically the division-by-zero failure this lesson finally resolves properly. Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically *expression* and *reduction*, both extended here. Lesson 10 (`FP-L010-boolean-values.md`) and Lesson 11 (`FP-L011-logical-operators.md`) — specifically *Boolean value*, *Boolean expression*, and implication, all reused, with implication deliberately contrasted against this lesson's new construct in Concept Unit 1.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Conditional expression** — an expression of the form "if `P` then `E1` else `E2`," where `P` is a Boolean expression and `E1` and `E2` are ordinary expressions. It evaluates by first reducing `P`; if `P` reduces to `true`, the whole conditional evaluates to whatever `E1` evaluates to; if `P` reduces to `false`, it evaluates to whatever `E2` evaluates to. Unlike implication (Lesson 11), which is itself a Boolean value, a conditional expression's value can be anything at all — a number, another Boolean value, or, later in this curriculum, any other kind of value.
- **Guard** — the Boolean expression, `P`, that a conditional expression checks to decide which branch to evaluate. It's called a guard because it stands between the conditional and each of its two branches, admitting exactly one of them to actually run.
- **Branch** — one of the two expressions, `E1` or `E2`, that a conditional expression might evaluate, depending on its guard. The branch matching the guard's actual value is called the taken branch; the other is the untaken branch.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using a shipping-cost calculation and, in Concept Unit 3, Lesson 3's original division-by-zero example.

---

## Concept Unit 1: A Question That Isn't "Is This True"

### The Problem

A store charges $5.99 for shipping, unless a customer's subtotal exceeds $100, in which case shipping is free. This is not a question with a Boolean answer — "is shipping free?" has a yes-or-no answer, but the actual thing being computed, the shipping *cost*, is a number: either 0 or 5.99, depending on circumstances. Lesson 11's implication produces a Boolean value; it cannot produce "0 or 5.99" — nothing about `P → Q`'s truth table has any notion of selecting between two different outcomes at all. A genuinely different kind of expression is needed: one that uses a Boolean value not as a final answer, but as a switch, choosing which of two other expressions actually gets evaluated.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction between a Boolean-valued question and a value-selecting choice is drawn directly below, not through a construct with its own syntax.

### Applying It — Shipping Cost

**The Boolean question, answerable with Lesson 10 and 11's tools already:** `subtotal > 100` — `true` or `false`, nothing more.

**What's actually wanted, which is not a Boolean value at all:** the shipping cost itself — 0 if the Boolean question is `true`, 5.99 if it's `false`.

**Confirming implication cannot do this:** `(subtotal > 100) → (shipping_cost = 0)` is a Boolean expression, evaluating to `true` or `false` depending on whether the *relationship* between the subtotal and a hypothetical shipping cost holds — it does not, and was never built to, actually produce a number for the shipping cost itself.

### Walkthrough

- **`subtotal > 100`** — a reappearance of *comparison operation* (Lesson 10), confirmed to answer a genuinely different question than the one this unit is building toward.
- **"0 if... true, 5.99 if... false"** — establishes precisely what kind of thing is actually wanted: a value selected by a condition, not a statement about whether a condition holds.
- **The implication attempt, and why it doesn't do the job** — not a new concept, but a direct, deliberate demonstration that Lesson 11's most powerful Boolean-combining operator still isn't the right tool for this particular problem.

### CS Lens

This is the difference between asking whether something is true and asking which of several outcomes should actually happen — a distinction between a question and a decision. Also recognized in: the difference between a yes/no survey question and a multiple-choice one that determines which of several forms gets filled out next; a thermostat's question "is it too cold?" versus its actual decision, "turn the heat on or leave it off"; a traffic light's sensor detecting whether a car is waiting versus the light's actual decision of which signal to display next; a doctor's diagnostic test result (positive or negative) versus the actual treatment decision that result leads to.

### SE Lens

The alternative to introducing a dedicated conditional expression is to try to force this kind of decision through Boolean operators alone — for instance, attempting to encode "0 or 5.99" using arithmetic on the Boolean result of `subtotal > 100` (multiplying 5.99 by something derived from a Boolean value, treating `true` and `false` as if they were secretly numbers). The real cost of that alternative is exactly what Lesson 10, Concept Unit 2, already warned against: Boolean values are not numbers, and building arithmetic tricks around pretending they are trades one clear, purpose-built construct for a fragile workaround that has to be re-derived and re-verified every time it's used. Introducing a dedicated conditional expression, the rest of this lesson's subject, costs the small overhead of one new construct; it buys a direct, honest way to say "choose between these two outcomes" without disguising the choice as arithmetic.

---

## Concept Unit 2: The Conditional Expression — if/then/else

### The Problem

Concept Unit 1 established what's needed: something that checks a Boolean expression and, based on its value, produces one of two other expressions' results. Stating this precisely means saying exactly how such a thing evaluates — which piece gets checked, and which piece gets used, in what order — the same precision Lesson 4 demanded of ordinary expression evaluation.

### No isolated lab for this step

This concept has no code of its own to isolate — the conditional expression's evaluation rule is stated and demonstrated directly below, not through a construct with its own syntax.

### Applying It — Shipping Cost

**The shipping-cost calculation, written as a conditional expression:**

> `if subtotal > 100 then 0 else 5.99`

**The evaluation rule, stated precisely:** first, reduce the guard, `subtotal > 100`, to a Boolean value (exactly as Lesson 10 and Lesson 4 already established). If it reduces to `true`, the whole conditional evaluates to whatever the then-branch, `0`, evaluates to. If it reduces to `false`, the whole conditional evaluates to whatever the else-branch, `5.99`, evaluates to.

**Applying this to a subtotal of 45.00:** the guard, `45.00 > 100`, reduces to `false`. Per the evaluation rule, the whole conditional evaluates to the else-branch: `5.99`.

**Applying this to a subtotal of 150.00:** the guard, `150.00 > 100`, reduces to `true`. Per the evaluation rule, the whole conditional evaluates to the then-branch: `0`.

### Walkthrough

- **`if subtotal > 100 then 0 else 5.99`** — first appearance of *conditional expression*, with `subtotal > 100` shown as its *guard*, and `0` and `5.99` shown as its two *branches*.
- **The evaluation rule, stated precisely** — establishes the exact mechanism, deliberately as precise as Lesson 4's reduction rule for ordinary expressions.
- **Applying to `subtotal = 45.00`, reducing to `5.99`** — one concrete evaluation, taking the else-branch.
- **Applying to `subtotal = 150.00`, reducing to `0`** — a second concrete evaluation, taking the then-branch, confirming both branches are genuinely reachable depending on the guard.

### CS Lens

This is the fundamental mechanism of branching computation: checking a condition once, and letting that single check determine which of two different courses of action is actually taken. Also recognized in: an `if` statement in essentially every programming language ever designed; a flowchart's diamond-shaped decision box, splitting a single path into two based on one question; a choose-your-own-adventure book's "turn to page 42 if you chose the left door, page 57 if you chose the right"; a factory sorting machine that routes an item down one of two conveyor belts based on a single sensor reading.

### SE Lens

The alternative to a single conditional expression is to somehow compute both branches every time, always, and only decide afterward which result to actually use. The real cost of that alternative — computing 0 free-shipping calculations and 5.99 standard-shipping calculations for every single order, regardless of which is actually needed — is wasted work in the ordinary case, and, as Concept Unit 3 will show, something considerably worse than wasted work whenever one of the branches is undefined for the situation at hand. Defining the conditional to check its guard once and evaluate only the matching branch costs the small conceptual overhead of a guard-and-branches structure; it buys both efficiency and, more importantly, safety.

---

## Concept Unit 3: Only the Selected Branch Is Evaluated

### The Problem

Concept Unit 2's evaluation rule said the conditional evaluates to "whatever the then-branch evaluates to" or "whatever the else-branch evaluates to" — implying, deliberately, that only one branch is ever actually reduced. This is worth confirming directly, because it resolves something this curriculum has been carrying, unresolved, since Lesson 3: division by zero. Lesson 3, Concept Unit 5, found that `total ÷ group_size` has no value at all when `group_size` is `0`, and Lesson 3's closing showed a real, damaging failure that resulted from applying it anyway. A conditional expression, if only the selected branch is truly evaluated, offers a direct fix: put the risky division in a branch that a guard prevents from ever being reached when it would fail.

### No isolated lab for this step

This concept has no code of its own to isolate — confirming that the untaken branch is never evaluated is demonstrated directly below, resolving Lesson 3's original failure, not through a construct with its own syntax.

### Applying It — Safely Dividing a Receipt Total

**Lesson 3's original, unguarded calculation, which had no defined value when `group_size` is `0`:** `total ÷ group_size`.

**The same calculation, protected by a conditional expression:**

> `if group_size = 0 then 0 else total ÷ group_size`

**Applying this to `total = 9.02`, `group_size = 3` — the ordinary case:** the guard, `3 = 0`, reduces to `false`. The else-branch is selected: `9.02 ÷ 3`, reducing to `3.006...`, exactly Lesson 3's original result for this case.

**Applying this to `total = 9.02`, `group_size = 0` — Lesson 3's original failure case:** the guard, `0 = 0`, reduces to `true`. The then-branch is selected: `0`. Critically, the else-branch, `total ÷ group_size`, is never reduced at all — not reduced and discarded, but never even attempted. The division by zero that broke Lesson 3's original calculation simply never happens, because the guard prevented that branch from ever being reached.

**Stating the principle directly:** a conditional expression does not compute both branches and pick one afterward; it uses the guard to decide, in advance, which single branch will be evaluated at all. This is what makes it safe to write an expression containing a branch that would be undefined for some inputs, as long as the guard correctly ensures that branch is never selected for those inputs.

### Walkthrough

- **`total ÷ group_size`** — a direct reappearance of Lesson 3's original, unguarded division, restated here specifically to be fixed.
- **`if group_size = 0 then 0 else total ÷ group_size`** — the guarded version, with `group_size = 0` as the guard, deliberately checking for the exact condition that made the unguarded version undefined.
- **Applying to `group_size = 3`, taking the else-branch** — confirms the guarded version still behaves exactly like the original for ordinary, safe inputs.
- **Applying to `group_size = 0`, taking the then-branch, and the division never being reduced at all** — the central demonstration of this unit: the untaken branch is not merely unused, it is never evaluated, which is precisely what prevents Lesson 3's original failure from recurring.

### CS Lens

This is the property of short-circuiting: a branching construct that commits to one path and never even attempts the other, rather than evaluating both and discarding one. Also recognized in: a lazy evaluation strategy in programming language design, where an unneeded computation is never actually performed at all; a smoke detector's alarm circuit, which never draws power through its siren circuitry unless smoke is actually detected; a bank's fraud-check system, which skips an expensive manual review entirely for transactions a cheap automated check already clears; a chess player considering a move who stops calculating a losing line the moment it's clearly losing, rather than working out every consequence in full.

### SE Lens

The alternative to trusting that only the selected branch is evaluated is to write defensive code around *both* branches, just in case, on the assumption that an unselected branch might somehow still run. The real cost of that alternative is needless extra complexity, defending against something that Concept Unit 3's own demonstration shows cannot actually happen, given a correctly written guard. The real cost on the other side — trusting this property without a correctly written guard — is Lesson 3's original failure recurring exactly: if the guard had instead checked the wrong condition, or been left out, the risky branch could still be reached. This unit's guarantee (only the selected branch runs) is only as good as Concept Unit 2's guard being correct; getting the guard right is where the real responsibility lies.

---

## Concept Unit 4: Both Branches Should Produce the Same Kind of Result

### The Problem

Concept Unit 2's shipping-cost conditional produced a number from both branches: `0` or `5.99`. Concept Unit 3's safe-division conditional likewise produced a number from both branches: `0` or `total ÷ group_size`. Nothing so far has actually required this — nothing in the evaluation rule stated in Concept Unit 2 says the two branches have to produce the same kind of thing. Consider what would happen if they didn't: `if subtotal > 100 then 0 else true` — a number from one branch, a Boolean value from the other. This evaluates without any error under the rule as stated; the real problem shows up one level out, in whatever uses the conditional's result.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem with mismatched branches is demonstrated directly below, not through a construct with its own syntax.

### Applying It — a Mismatched Conditional

**The mismatched conditional:** `if subtotal > 100 then 0 else true`.

**Evaluating it for `subtotal = 45.00`:** the guard reduces to `false`; the else-branch is selected, giving `true` — a Boolean value.

**Evaluating it for `subtotal = 150.00`:** the guard reduces to `true`; the then-branch is selected, giving `0` — a number.

**Where this actually breaks something, one level out:** suppose this expression's result is meant to be added to a shipping surcharge later, the way Concept Unit 2's result was meant to be used directly as a shipping cost. `0 + 5.00` (from the `subtotal = 150.00` case) works fine, per Lesson 3's arithmetic. `true + 5.00` (from the `subtotal = 45.00` case) does not describe a meaningful calculation at all — exactly the same problem Lesson 10, Concept Unit 2, already identified for `true + false`. The conditional itself evaluated without complaint in both cases; the failure only appears once something downstream tries to use a result that could, depending on which branch ran, secretly be a completely different kind of thing.

**The principle, stated directly:** both branches of a conditional should produce the same kind of result, so that whatever uses the conditional's value never has to know, or guess, which branch actually ran.

### Walkthrough

- **`if subtotal > 100 then 0 else true`** — deliberately mismatched, to expose a problem the evaluation rule from Concept Unit 2 does not, by itself, prevent.
- **Both evaluations proceeding without any error at the level of the conditional itself** — confirms the mismatch is not caught here, at the point where it's introduced.
- **`true + 5.00`, reappearing from Lesson 10's `true + false`** — a direct reappearance of Lesson 10 Concept Unit 2's finding, now shown arising indirectly, through a conditional expression's result, rather than by writing a mismatched arithmetic expression directly.

### CS Lens

This is the requirement that a branching construct's two possible outcomes be interchangeable from the outside — usable identically by whatever consumes the result, regardless of which branch actually produced it. Also recognized in: a vending machine that must dispense a snack (of some kind) down either of two possible chutes, never a snack from one and a refund receipt from the other, without the customer being warned which to expect; a form's dropdown menu that must return the same kind of value (a selected option's text) regardless of which specific option was chosen; a function in strongly typed programming languages, required to return the same declared kind of value from every one of its possible branches; a relay race, where the baton passed by either possible runner must be the same baton, usable identically by whoever receives it next.

### SE Lens

The alternative to requiring matching branches is to allow them to differ freely, and rely on careful, case-by-case reasoning downstream to handle whichever kind of result actually shows up. The real cost of that alternative is exactly what Concept Unit 4's example demonstrates: the mismatch doesn't fail where it's introduced — it fails somewhere else entirely, in code that has every reason to assume it's working with an ordinary number, the same class of surprise Lesson 6 already found for stateful timing errors. Requiring both branches to produce the same kind of result costs the discipline of checking this when a conditional is written, in exchange for a guarantee that holds everywhere the conditional's result is later used, without that code needing to re-check anything.

---

## Concept Unit 5: Conditionals Inside Function Bodies

### The Problem

Lesson 7 defined a function's body as an expression written in terms of its parameters. A conditional expression is an expression, exactly in Lesson 4's sense — nothing so far has said a function's body can't be one. Writing the safe-division logic from Concept Unit 3 as its own reusable function, rather than as a one-off expression, is exactly the improvement Lesson 7 already argued for: define it once, apply it to as many different totals and group sizes as needed.

### No isolated lab for this step

This concept has no code of its own to isolate — writing a conditional as a function body is demonstrated directly below, combining Lesson 7's function definition with this lesson's conditional expression, not through a new construct with its own syntax.

### Applying It — a Reusable Safe-Division Function

**The function, its body built entirely from Concept Unit 3's guarded expression:**

> `safe_average(total, group_size) = if group_size = 0 then 0 else total ÷ group_size`

**Applying it exactly as Lesson 7 taught — binding, substituting, evaluating — to `safe_average(9.02, 3)`:** `total → 9.02`, `group_size → 3`. Substituting into the body: `if 3 = 0 then 0 else 9.02 ÷ 3`. The guard, `3 = 0`, reduces to `false`; the else-branch is selected and reduces to `3.006...`.

**Applying it again, to `safe_average(9.02, 0)` — the case that broke Lesson 3's original calculation:** `total → 9.02`, `group_size → 0`. Substituting into the body: `if 0 = 0 then 0 else 9.02 ÷ 0`. The guard, `0 = 0`, reduces to `true`; the then-branch is selected and reduces to `0` — and, exactly as Concept Unit 3 established, the else-branch is never evaluated at all, so the division by zero never occurs.

**Confirming this reproduces Lesson 3's own closing example, this time without the failure:** Lesson 3's closing described exactly this scenario — a rewards-program group size of `0` reaching a register's division logic — as a real, damaging failure. `safe_average`, applied to that exact same situation, produces a defined, sensible result, `0`, instead.

### Walkthrough

- **`safe_average(total, group_size) = if group_size = 0 then 0 else total ÷ group_size`** — a reappearance of Lesson 7's function definition form, with this lesson's conditional expression as its entire body, introducing no new construct beyond combining the two.
- **`safe_average(9.02, 3)`, following Lesson 7's full application sequence, reducing to `3.006...`** — confirms the function behaves correctly for the ordinary case, matching Lesson 3's original unguarded result exactly.
- **`safe_average(9.02, 0)`, reducing to `0` with the division never evaluated** — the central resolution of this unit: Lesson 3's original failure case, now handled safely, by a function whose body was written with exactly this case in mind.
- **The explicit callback to Lesson 3's closing example** — not a new concept, but confirmation that this lesson has actually fixed the specific, concrete failure that lesson described, not merely a similar-looking one.

### CS Lens

This is the idea of building a guard directly into a reusable piece of logic, so that every future use of it is protected automatically, rather than requiring every caller to remember to check for a dangerous case on their own. Also recognized in: a safety interlock built directly into a piece of machinery, rather than relying on every operator to remember to check a condition manually before use; a library function that validates its own input internally, rather than requiring every one of its many callers to validate identically and separately; a bridge's load limit enforced by a built-in sensor and barrier, rather than relying on every driver to check the posted weight limit themselves; a electrical outlet's built-in ground-fault protection, rather than relying on every appliance plugged into it to protect itself.

### SE Lens

The alternative to building the guard into `safe_average` itself is what Lesson 9 already discussed: stating a precondition (`group_size ≠ 0`) and requiring every caller to check it themselves before applying an unguarded division function. The real cost of that alternative, now made concrete, is that every one of potentially many callers has to remember to perform the same check, correctly, every single time — exactly the repeated-effort problem Lesson 1, Concept Unit 3, already identified for un-generalized calculations. Building the guard into the function itself, as `safe_average` does, costs the one-time effort of writing the conditional correctly; it buys a function that is safe to call with any group size at all, including zero, without requiring any caller to remember anything extra.

---

## Closing

### Connect the pieces

One idea — using a Boolean value to choose, not just to answer — traced through every unit built in this lesson, start to finish:

1. **The gap exposed (Unit 1):** implication can answer "is shipping free," but cannot produce the shipping cost itself, 0 or 5.99.
2. **The conditional expression, defined (Unit 2):** `if subtotal > 100 then 0 else 5.99`, evaluating to `5.99` for a 45.00 subtotal and `0` for a 150.00 subtotal.
3. **Only the selected branch evaluated (Unit 3):** `if group_size = 0 then 0 else total ÷ group_size`, resolving Lesson 3's original division-by-zero failure by never reducing the dangerous branch when the guard catches it.
4. **Branches kept consistent (Unit 4):** `if subtotal > 100 then 0 else true`, shown to evaluate without complaint and still fail one level out, exactly like Lesson 10's `true + false`.
5. **Wrapped into a reusable function (Unit 5):** `safe_average(total, group_size)`, applying Unit 3's guarded expression through Lesson 7's full application mechanism, fixing Lesson 3's original closing failure for good.

Unit 5's `safe_average` is not a new example — it is Unit 3's exact guarded expression, given the name and parameters Lesson 7 already taught how to add, specifically so it can be trusted and reused everywhere a safe division is needed, rather than rewritten by hand each time.

### What breaks without this

Suppose Unit 3's core guarantee — that the untaken branch is never evaluated — were false, and a conditional expression actually evaluated both branches before selecting one, contrary to what this lesson has established. `safe_average(9.02, 0)` would then attempt `9.02 ÷ 0` regardless of which branch was ultimately selected, and Lesson 3's original failure would recur exactly as before, guard or no guard — the whole point of writing the guard would be defeated by the evaluation rule itself. This is precisely why Concept Unit 3 took the trouble to state and demonstrate this property explicitly, rather than assuming it: a conditional expression is only a genuine fix for Lesson 3's problem if its untaken branch is truly never reduced, not merely unused after being computed. Every guarantee this lesson makes about safety — Concept Unit 3's division fix, Concept Unit 5's reusable function — depends on this one property holding exactly as stated.

### Exercises

1. **Observe.** Write a real-world "do this, or else do that" decision (not a yes/no question) as a conditional expression, the way Concept Unit 2 wrote the shipping-cost calculation, naming its guard and both branches explicitly.
2. **Predict.** For your Exercise 1 conditional, choose one input that takes the then-branch and one that takes the else-branch. Predict each result before evaluating, then evaluate both by hand.
3. **Formalize.** Find an operation from an earlier lesson's exercises that has an input it cannot handle (a division, a square root, or similar). Write a guarded conditional expression around it, the way Concept Unit 3 guarded `total ÷ group_size`, so the dangerous case is caught before it's ever reached.
4. **Explain.** Write a deliberately mismatched conditional (branches producing different kinds of results), the way Concept Unit 4 wrote `if subtotal > 100 then 0 else true`. Describe a specific downstream use of its result that would break, and why.
5. **Formalize.** Name your Exercise 3 guarded conditional as its own function, with parameters, the way Concept Unit 5 named `safe_average`. Apply it to one input that takes each branch, following Lesson 7's full binding/substitution/reduction sequence.

### Definition of done

- [ ] You can state, in your own words, the difference between implication (`P → Q`, a Boolean value) and a conditional expression (`if P then E1 else E2`, a value of any kind).
- [ ] You can evaluate a conditional expression step by step — reducing the guard first, then evaluating only the selected branch.
- [ ] You can explain, using your own guarded example, why only the selected branch is evaluated, and why this matters for an expression that would otherwise be undefined.
- [ ] You can give an example of mismatched branches and explain, concretely, where the resulting problem would actually surface.
- [ ] You completed Exercises 1–5 using your own examples, not the shipping-cost or safe-average examples from this lesson.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which earlier lesson's exercise you found the most natural guard for, and why.
