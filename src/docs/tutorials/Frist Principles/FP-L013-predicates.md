# Lesson 13: Predicates

**What you will build:** Still nothing runnable — this lesson names the exact overlap between two ideas already fully established: a function (Lesson 7), whose body happens to evaluate to a Boolean value (Lesson 10). A function like this is called a predicate, and naming it turns every by-hand Boolean check this curriculum has written so far — `subtotal ≥ 0`, `0 ≤ tax_rate < 1` — into a reusable, named piece of logic instead of an expression rewritten by hand every time it's needed. The transferable problem this lesson is actually about: a yes/no check worth performing once is almost always a check worth performing again, on different data, and Lesson 7 already solved exactly this kind of repetition — it was just never pointed at a Boolean-valued body until now.

**What you need to know first:** Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, and *application*, reused completely unchanged. Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically the precondition for `total_with_tax`, rewritten here as a reusable predicate. Lesson 10 (`FP-L010-boolean-values.md`) — specifically *Boolean value* and *Boolean expression*, reused directly. Lesson 11 (`FP-L011-logical-operators.md`) — specifically *AND*, reused in Concept Unit 4. Lesson 12 (`FP-L012-conditions.md`) — specifically *guard*, reused in Concept Unit 3.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Predicate** — a function (Lesson 7) whose body always evaluates to a Boolean value (Lesson 10), rather than to a number or any other kind of value. A predicate answers a yes-or-no question about whatever arguments it's applied to; `is_valid_subtotal(subtotal) = subtotal ≥ 0` is a predicate, answering, for any subtotal supplied, whether it is valid.
- **Compound predicate** — a predicate whose body combines two or more simpler predicates using logical operators (Lesson 11), rather than checking a single condition directly. A compound predicate is built the same way any composed function (Lesson 8) is built — by connecting already-defined pieces — except here the pieces being connected are themselves Boolean-valued.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, revisiting Lesson 9's precondition for `total_with_tax` to show it can be named and reused directly.

---

## Concept Unit 1: A Function That Answers Yes or No

### The Problem

Lesson 9 wrote `subtotal ≥ 0` by hand, checking it against specific numbers, every time a precondition needed verifying. Lesson 7 already solved exactly this shape of repetition for arithmetic calculations — `total_with_tax` didn't need to be re-derived for every new subtotal and tax rate, because it was named as a reusable function. Nothing about Lesson 7's solution was ever limited to functions whose bodies produce numbers; it was only ever demonstrated that way, because Boolean values hadn't been introduced yet at that point in this curriculum. A Boolean-valued check deserves exactly the same treatment arithmetic calculations already received.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that Lesson 7's solution already applies here is a matter of reviewing that lesson's own scope, not a construct with its own syntax.

### Applying It — Checking Subtotal Validity

**The check, as it currently has to be redone by hand, per Lesson 9:** for a subtotal of 8.20, write and evaluate `8.20 ≥ 0`, getting `true`; for a subtotal of −8.20, write and evaluate `−8.20 ≥ 0`, getting `false`.

**Recognizing this as the same repetition problem Lesson 7, Concept Unit 1, already diagnosed for arithmetic:** the underlying question — "is this subtotal at least zero?" — is the same question every time; only the specific number being checked changes. Lesson 7 already named the fix for exactly this: define the check once, in terms of a parameter, rather than rewriting it for every new number.

### Walkthrough

- **`8.20 ≥ 0` and `−8.20 ≥ 0`, written and checked separately** — a reappearance of *comparison operation* (Lesson 10), performed by hand, exactly the repetition Lesson 7 already addressed for arithmetic.
- **The direct comparison to Lesson 7, Concept Unit 1** — not a new concept, but the explicit recognition that this lesson's problem is the same problem Lesson 7 already solved, applied here to a body that happens to produce a Boolean value.

### CS Lens

This is the recognition that a solution built for one category of problem (reusable arithmetic) applies without modification to a structurally identical problem in a different category (reusable yes/no checks) — the same generality Lesson 10, Concept Unit 4, already found in Lesson 4 and Lesson 5's evaluation machinery. Also recognized in: a spreadsheet's conditional formatting rule, checking the same yes/no condition against every row without being rewritten per row; a quality-control checklist item, applied identically to every unit inspected on a production line; a form's validation rule, checking the same requirement against every submission; a security checkpoint's screening criterion, applied identically to every person passing through.

### SE Lens

The alternative to recognizing this as Lesson 7's already-solved problem is to treat Boolean-valued checks as needing their own, separate reusability mechanism, invented from scratch. The real cost of that alternative is unnecessary duplicated effort: Lesson 7's function, Lesson 5's binding and substitution, and Lesson 4's reduction all already work correctly for a Boolean-valued body, exactly as Lesson 10, Concept Unit 4, already confirmed for Boolean expressions generally. Recognizing this costs nothing beyond noticing what's already true; it means this lesson can proceed directly to naming the pattern, rather than re-deriving machinery that already exists.

---

## Concept Unit 2: Predicate — Naming a Boolean-Valued Function

### The Problem

Concept Unit 1 established that Lesson 7's function mechanism already applies here — what remains is simply to do it: define a function, exactly as Lesson 7 taught, whose body happens to be a Boolean expression rather than an arithmetic one.

### No isolated lab for this step

This concept has no code of its own to isolate — defining and applying a Boolean-valued function is demonstrated directly below, using exactly Lesson 7's mechanism, not through a new construct with its own syntax.

### Applying It — is_valid_subtotal

**The predicate, defined exactly as Lesson 7 taught:**

> `is_valid_subtotal(subtotal) = subtotal ≥ 0`

**Applying it, following Lesson 7's full sequence — binding, substitution, reduction:** `is_valid_subtotal(8.20)` binds `subtotal → 8.20`, substitutes to `8.20 ≥ 0`, and reduces to `true`.

**Applying it again, to a different argument, confirming reusability exactly as Lesson 7, Concept Unit 5, demonstrated:** `is_valid_subtotal(−8.20)` binds `subtotal → −8.20`, substitutes to `−8.20 ≥ 0`, and reduces to `false`.

**Naming what this is:** `is_valid_subtotal` is a function whose result is always a Boolean value — this is exactly what a predicate is.

### Walkthrough

- **`is_valid_subtotal(subtotal) = subtotal ≥ 0`** — first appearance of *predicate*, defined by exactly Lesson 7's function-definition form, with a comparison operation (Lesson 10) as its body.
- **`is_valid_subtotal(8.20)` reducing to `true`** — a direct reappearance of Lesson 7's full application sequence, now producing a Boolean value instead of a number.
- **`is_valid_subtotal(−8.20)` reducing to `false`** — confirms the predicate is genuinely reusable, exactly the way Lesson 7's Concept Unit 5 confirmed `total_with_tax`'s reusability, by applying it to a second, different argument.

### CS Lens

This is the specific, common case of a function whose entire purpose is answering a yes-or-no question about its arguments, rather than computing some other kind of result. Also recognized in: a validation function in essentially any programming context, checking whether input meets a requirement; a mathematical predicate like "is prime," a function from numbers to true or false; a filter criterion in a search tool, checking each candidate item against a yes/no rule; an eligibility check in an application process, answering whether a specific applicant qualifies.

### SE Lens

The alternative to naming `is_valid_subtotal` as its own predicate is to keep writing `subtotal ≥ 0` inline, everywhere it's needed, exactly as Lesson 9 did throughout. The real cost of that alternative is exactly Lesson 7, Concept Unit 1's, original cost, now recurring for Boolean checks specifically: if the validity rule for a subtotal ever needs to change (say, a store starts allowing subtotals of exactly `0` to be rejected as likely errors), every inline repetition of `subtotal ≥ 0` has to be found and updated individually. Naming it once as `is_valid_subtotal` costs nothing beyond the definition already required by Lesson 7's mechanism, and means any future change to the validity rule has exactly one place to happen.

---

## Concept Unit 3: Predicates as Reusable Guards

### The Problem

Lesson 12 introduced the conditional expression's guard — a Boolean expression checked to decide which branch runs. Nothing in Lesson 12 required a guard to be written out inline; a guard is just a Boolean expression, and Concept Unit 2 has just shown that a predicate application is exactly that. A predicate, once defined, can be dropped directly into a conditional's guard position, exactly where an inline comparison could have gone.

### No isolated lab for this step

This concept has no code of its own to isolate — using a predicate as a guard is demonstrated directly below, combining Lesson 12's conditional with this lesson's predicate, not through a new construct with its own syntax.

### Applying It — Guarding With is_valid_subtotal

**A conditional expression, using an inline comparison as its guard, exactly as Lesson 12 originally demonstrated:**

> `if subtotal ≥ 0 then subtotal else 0`

(A simple rule: treat an invalid, negative subtotal as if it were zero, rather than letting it propagate.)

**The same conditional, with the inline comparison replaced by the predicate defined in Concept Unit 2:**

> `if is_valid_subtotal(subtotal) then subtotal else 0`

**Evaluating this for `subtotal = 8.20`:** the guard, `is_valid_subtotal(8.20)`, evaluates via Lesson 7's application sequence to `true` (Concept Unit 2). Per Lesson 12's evaluation rule, the then-branch is selected: `8.20`.

**Evaluating this for `subtotal = −8.20`:** the guard, `is_valid_subtotal(−8.20)`, evaluates to `false` (Concept Unit 2). The else-branch is selected: `0`.

**Confirming both versions behave identically:** every guard value produced by `is_valid_subtotal(subtotal)` matches exactly what the inline comparison `subtotal ≥ 0` would have produced for the same subtotal — the predicate is simply a named, reusable stand-in for the same check.

### Walkthrough

- **`if subtotal ≥ 0 then subtotal else 0`** — a reappearance of Lesson 12's conditional expression, with an inline comparison as its guard.
- **`if is_valid_subtotal(subtotal) then subtotal else 0`** — the same conditional, with the guard replaced by a predicate application — a reappearance of *guard* (Lesson 12), now shown filled by a predicate rather than an inline expression.
- **Both evaluations matching the inline version exactly** — confirms the substitution of predicate for inline comparison changes nothing about the conditional's actual behavior.

### CS Lens

This is the idea of a named check being usable anywhere an inline check could go, because both are, underneath, the exact same kind of thing — a Boolean expression. Also recognized in: a named validation rule referenced by a form-processing system, rather than that rule's logic being repeated inline at every point it's needed; a database's named `CHECK` constraint, reused across every insert or update rather than rewritten each time; a named eligibility rule referenced by multiple different application forms, rather than duplicated across each one; a traffic law's named provision, cited by reference in multiple other regulations rather than restated in full each time.

### SE Lens

The alternative to using a predicate as a guard is to keep writing the inline comparison directly in every conditional that needs it, even after the predicate has already been defined. The real cost of that alternative is that two things meant to represent the same check — the standalone predicate and each inline repetition — can drift apart over time if one is updated and the others are forgotten, reintroducing exactly the duplication problem Concept Unit 2 already solved. Using the predicate as the guard everywhere the check is needed costs nothing beyond calling it by name; it guarantees every guard using it stays in agreement, automatically, because they are all, literally, the same function.

---

## Concept Unit 4: Combining Simple Predicates Into Compound Ones

### The Problem

Lesson 9's full precondition for `total_with_tax` had two separate clauses: subtotal validity, and tax-rate validity. Concept Unit 2 named the first as its own predicate. A second predicate, `is_valid_tax_rate`, can be named the same way — and Lesson 11's logical operators already provide exactly the tool needed to combine two separate Boolean-valued checks into one: `AND`.

### No isolated lab for this step

This concept has no code of its own to isolate — combining two predicates with `AND` is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Combining Two Predicates

**A second predicate, defined exactly as Concept Unit 2 defined the first:**

> `is_valid_tax_rate(tax_rate) = (tax_rate ≥ 0) AND (tax_rate < 1)`

**A compound predicate, combining both simpler predicates with `AND`:**

> `is_valid_receipt(subtotal, tax_rate) = is_valid_subtotal(subtotal) AND is_valid_tax_rate(tax_rate)`

**Applying this to Lesson 9's sensible case, `subtotal = 8.20`, `tax_rate = 0.10`:** `is_valid_subtotal(8.20)` reduces to `true`; `is_valid_tax_rate(0.10)` reduces to `true` (`0.10 ≥ 0` is `true`, `0.10 < 1` is `true`, and `true AND true` is `true`). The compound predicate's body becomes `true AND true`, reducing to `true`.

**Applying this to Lesson 9's problematic case, `subtotal = −8.20`, `tax_rate = −5.00`:** `is_valid_subtotal(−8.20)` reduces to `false`. The compound predicate's body becomes `false AND [whatever is_valid_tax_rate(−5.00) evaluates to]`, which reduces to `false` regardless, exactly matching AND's truth table from Lesson 11.

### Walkthrough

- **`is_valid_tax_rate(tax_rate) = (tax_rate ≥ 0) AND (tax_rate < 1)`** — a second predicate, itself a *compound predicate* (its own body combines two comparisons with `AND`), defined the same way as the first.
- **`is_valid_receipt(subtotal, tax_rate) = is_valid_subtotal(subtotal) AND is_valid_tax_rate(tax_rate)`** — first appearance of a compound predicate built by combining two separately-named, simpler predicates, rather than combining raw comparisons directly.
- **Both evaluations, `true` and `false`, reappearing from Lesson 9's own original examples** — confirms `is_valid_receipt` reproduces Lesson 9's by-hand conclusions exactly, now as a single, reusable, named check.

### CS Lens

This is the same layered-building idea Lesson 8, Concept Unit 5, already named for arithmetic functions — simple predicates combined into compound ones, exactly the way simple functions were combined into composed ones — applied here to Boolean-valued functions specifically. Also recognized in: a search engine's combined filter, built from several simpler filters (price range, availability, category) joined by logical operators; a spam filter's overall decision, built from several simpler individual checks combined together; a security system's alarm condition, built from combining several individual sensor predicates; a loan approval decision, built from combining several individual eligibility predicates (credit score, income, existing debt).

### SE Lens

The alternative to naming `is_valid_receipt` as its own compound predicate is to keep writing `is_valid_subtotal(subtotal) AND is_valid_tax_rate(tax_rate)` inline, everywhere a full receipt check is needed. The real cost of that alternative is, once again, Lesson 7's original duplication cost, now recurring one layer up: every inline repetition of the combined check has to be kept consistent by hand if the definition of a valid receipt ever changes (a third clause added, say). Naming the compound predicate once costs nothing beyond combining two already-defined pieces with `AND`, and it means the definition of "a valid receipt" exists in exactly one reusable place.

---

## Concept Unit 5: A Predicate Is a Contract's Precondition, Made Reusable

### The Problem

Lesson 9 stated `total_with_tax`'s precondition entirely in prose and symbolic clauses, checked by hand for each specific application: "if `subtotal ≥ 0` and `0 ≤ tax_rate < 1`." Concept Unit 4's `is_valid_receipt` is exactly this precondition, now named as a single, callable, reusable function — closing the loop between this lesson and Lesson 9 directly.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing the exact match between `is_valid_receipt` and Lesson 9's precondition is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Naming Lesson 9's Precondition

**Lesson 9's precondition, restated exactly as originally written:** "`subtotal ≥ 0`" and "`0 ≤ tax_rate < 1`."

**Confirming `is_valid_receipt` states exactly the same thing:** `is_valid_subtotal(subtotal)` is `subtotal ≥ 0`; `is_valid_tax_rate(tax_rate)` is `(tax_rate ≥ 0) AND (tax_rate < 1)`, which is the same requirement as `0 ≤ tax_rate < 1` written differently. Combined with `AND`, `is_valid_receipt(subtotal, tax_rate)` is precisely Lesson 9's precondition, with nothing added or removed.

**Rewriting Lesson 9's full contract using this predicate:** "if `is_valid_receipt(subtotal, tax_rate)`, then `total_with_tax(subtotal, tax_rate)`'s result equals `subtotal + subtotal × tax_rate` and is never less than `subtotal`." This is Lesson 9's exact contract, now with its precondition stated as a single named check rather than as two separately written clauses.

**Why this matters beyond tidiness:** `is_valid_receipt` can now be applied directly, on its own, before ever calling `total_with_tax` at all — checked once, reused everywhere a receipt needs validating, exactly the same reusability Lesson 7 established for arithmetic, now extended to contract-checking itself.

### Walkthrough

- **Lesson 9's precondition, restated verbatim** — a direct reappearance, establishing precisely what this unit is confirming a match against.
- **`is_valid_receipt(subtotal, tax_rate)`, confirmed clause-by-clause to match** — not a new concept, but the explicit verification that Concept Unit 4's compound predicate is, in fact, exactly Lesson 9's precondition, not merely something similar to it.
- **The rewritten contract statement** — a reappearance of *contract* (Lesson 9), now stated using this lesson's predicate in place of Lesson 9's original two written-out clauses.

### CS Lens

This is the idea of a contract's precondition itself being expressed as ordinary, callable code — a check that can be run directly, independently of the function it protects, rather than existing only as documentation. Also recognized in: a software library exposing a validation function alongside the operation it protects, so callers can check validity themselves before attempting the operation; a form that runs its own validation logic before submission, using the same rule the backend will ultimately enforce; a legal eligibility requirement that exists as a standalone checklist a person can review before applying, not merely something a reviewer checks after the fact; a pre-flight checklist in aviation, run independently before takeoff, checking exactly the same conditions the flight depends on throughout.

### SE Lens

The alternative to expressing a precondition as a predicate is to leave it as documentation only — Lesson 9's prose statement, trusted to be followed but never actually checkable by running anything. The real cost of that alternative is exactly what Lesson 9, Concept Unit 1, originally demonstrated: nothing stops an application that violates the precondition from being attempted anyway, because there was never anything to actually run and check beforehand. Expressing the precondition as `is_valid_receipt`, a genuine predicate, costs the work already done in Concept Units 2 through 4; it buys a precondition that can be checked directly, by name, before ever risking a contract violation at all.

---

## Closing

### Connect the pieces

One precondition, traced through every unit built in this lesson, start to finish:

1. **The gap recognized (Unit 1):** Lesson 9's by-hand Boolean checks are exactly the repetition problem Lesson 7 already solved for arithmetic.
2. **A first predicate, defined (Unit 2):** `is_valid_subtotal(subtotal) = subtotal ≥ 0`, applied to `8.20` and `−8.20`, reducing to `true` and `false`.
3. **Used as a guard (Unit 3):** `if is_valid_subtotal(subtotal) then subtotal else 0`, behaving identically to an inline comparison.
4. **Combined into a compound predicate (Unit 4):** `is_valid_receipt(subtotal, tax_rate)`, combining `is_valid_subtotal` and a second predicate, `is_valid_tax_rate`, with `AND`.
5. **Recognized as Lesson 9's precondition, made reusable (Unit 5):** `is_valid_receipt` shown to state exactly what Lesson 9's contract required, now checkable on its own, directly, before `total_with_tax` is ever applied.

Unit 5's conclusion is not a new fact discovered separately — it is the direct result of tracing Unit 2 and Unit 4's predicates back to the exact prose Lesson 9 wrote, clause by clause, and finding they say precisely the same thing.

### What breaks without this

Suppose `is_valid_receipt` were never named, and every place in a store's system that needed to check a receipt's validity — before applying tax, before printing a report, before flagging a suspicious transaction — wrote its own inline version of the check, independently, the way Lesson 9 always did. One part of the system, checking subtotal validity, is written correctly as `subtotal ≥ 0`. A second part, added later by someone unfamiliar with the first, is written slightly differently as `subtotal > 0` — excluding a subtotal of exactly zero, which the first part would have accepted. Both checks look reasonable on their own; nothing about writing them independently flags that they now disagree. A receipt with a subtotal of exactly `0.00` — perhaps a fully store-credited purchase — passes the first check and fails the second, and which outcome a customer actually experiences now depends entirely on which part of the system happens to process their receipt first, a discrepancy nobody intended and nobody will notice until the two parts' results are compared directly. Restoring this lesson's approach — one named predicate, `is_valid_receipt`, called everywhere a receipt needs validating — removes this failure by removing the possibility of two independently-written versions disagreeing at all: there is only ever one definition to consult.

### Exercises

1. **Observe.** Find a Boolean expression from an earlier lesson's exercises (your own or from the lesson text) that was written inline rather than named. State the yes-or-no question it answers.
2. **Formalize.** Name that expression as its own predicate, with at least one parameter, the way Concept Unit 2 named `is_valid_subtotal`. Apply it to two different arguments, confirming it produces different, correct results for each.
3. **Formalize.** Use your Exercise 2 predicate as the guard of a conditional expression, the way Concept Unit 3 used `is_valid_subtotal` as a guard. Evaluate the conditional for both of your Exercise 2 arguments.
4. **Formalize.** Define a second, different predicate, and combine it with your Exercise 2 predicate into a compound predicate using `AND` or `OR`, the way Concept Unit 4 combined `is_valid_subtotal` and `is_valid_tax_rate` into `is_valid_receipt`.
5. **Explain.** If your Exercise 4 compound predicate corresponds to a precondition you stated informally in an earlier lesson's exercises (Lesson 9's exercises, for instance), confirm, clause by clause, that it says exactly the same thing, the way Concept Unit 5 confirmed `is_valid_receipt` against Lesson 9's original precondition.

### Definition of done

- [ ] You can state, in your own words, what makes a function a predicate specifically, rather than just any function.
- [ ] You can define a predicate with at least one parameter and apply it to two different arguments, showing both results.
- [ ] You can use a predicate as a conditional expression's guard and explain why this requires no new mechanism beyond what Lesson 12 already established.
- [ ] You can combine two simple predicates into a compound one using a logical operator from Lesson 11.
- [ ] You completed Exercises 1–5 using your own examples, not `is_valid_subtotal`, `is_valid_tax_rate`, or `is_valid_receipt`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating one place, in your own past exercises, where you now realize you were repeating an inline Boolean check that should have been a named predicate from the start.
