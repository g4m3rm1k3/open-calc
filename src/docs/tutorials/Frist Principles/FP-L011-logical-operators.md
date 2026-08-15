# Lesson 11: Logical Operators

**What you will build:** Still nothing runnable — this lesson introduces operators that take Boolean values (Lesson 10) as operands and produce a new Boolean value: `NOT`, `AND`, `OR`, implication, and equivalence. The transferable problem this lesson is actually about: Lesson 9's contracts, Lesson 6's withdrawal rule, and Lesson 2's "needs review" category were all already combining more than one condition at once, in plain English — "if... then," "must not," "at least one of" — and none of that curriculum-so-far had a precise, checkable way to say exactly what those combinations mean.

**What you need to know first:** Lesson 2 (`FP-L002-turning-ambiguity-into-precision.md`) — specifically *exhaustive rule*, directly generalized into this lesson's truth tables. Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *operation* and *arity*, both extended to operators that take Boolean values as operands. Lesson 6 (`FP-L006-state-and-change.md`) and Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — both revisited directly, once their informal "not," "and," and "if... then" language can finally be stated precisely. Lesson 10 (`FP-L010-boolean-values.md`) — specifically *Boolean value*, *comparison operation*, and *Boolean expression*, all directly extended.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Truth table** — a table listing every possible combination of Boolean operand values, alongside the result an operator produces for each one. A truth table is Lesson 2's *exhaustive rule* applied specifically to Boolean operators: because a Boolean value only has two possibilities, every combination of operands can actually be listed in full, not merely gestured at.
- **NOT** — a logical operator of arity one (Lesson 3), producing `false` when its operand is `true`, and `true` when its operand is `false`. It reverses a single Boolean value.
- **AND** — a logical operator of arity two, producing `true` only when both of its operands are `true`, and `false` in every other case.
- **OR** — a logical operator of arity two, producing `true` when at least one of its operands is `true` (including when both are), and `false` only when both are `false`. This is called *inclusive* OR, to distinguish it from everyday speech's frequent use of "or" to mean exactly one of two options, never both.
- **Implication** — a logical operator of arity two, written `P → Q` and read "if P then Q," producing `false` only when `P` is `true` and `Q` is `false`, and `true` in every other case — including, perhaps surprisingly, whenever `P` itself is `false`. Implication is the precise formalization of Lesson 9's contract statement, "if the precondition holds, then the postcondition is guaranteed."
- **Equivalence** — a logical operator of arity two, written `P ↔ Q`, producing `true` exactly when `P` and `Q` have the same Boolean value, and `false` when they differ. Two Boolean expressions are called equivalent when they produce the same value for every possible binding of the names inside them, not merely for one binding checked by hand.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, revisiting Lesson 6's withdrawal rule and Lesson 9's contract to show exactly what they were informally relying on.

---

## Concept Unit 1: NOT — Flipping a Boolean Value

### The Problem

Lesson 6's withdrawal rule said a withdrawal is only valid "if it does not take the balance below 0." That sentence already contains the word "not," used correctly and informally, exactly the way Lesson 10 found "true" and "false" already being used informally before that lesson gave them a formal home. `balance − withdrawal_amount < 0` is a Boolean expression (Lesson 10), evaluating to `true` when the withdrawal would in fact take the balance below zero. What Lesson 6 actually needed was the reverse of that value — and nothing built so far can produce "the reverse of a Boolean value" precisely.

### No isolated lab for this step

This concept has no code of its own to isolate — reversing a Boolean value is demonstrated directly below as the simplest possible logical operator, not through a construct with its own syntax.

### Applying It — Lesson 6's Withdrawal Rule

**The Boolean expression at the heart of Lesson 6's rule:** `balance − withdrawal_amount < 0` — `true` exactly when a withdrawal would overdraw the account.

**What Lesson 6's rule actually needs, stated precisely:** a withdrawal is valid when this expression is `false` — that is, valid means "not (would overdraw)."

**The operator that does exactly this, and its complete truth table, listing every possibility (there are only two):**

| p | NOT p |
|---|---|
| true | false |
| false | true |

**Applying it to Lesson 6's exact numbers — a starting balance of 50, a withdrawal of 150:** `50 − 150 < 0` reduces to `−100 < 0`, which reduces to `true` (an overdraw would occur). Applying NOT: `NOT true` is `false`, per the table above — the withdrawal is not valid, matching exactly what Lesson 6 concluded by reasoning in prose.

### Walkthrough

- **`balance − withdrawal_amount < 0`** — a reappearance of *comparison operation* (Lesson 10), applied to Lesson 6's own numbers.
- **The two-row truth table** — first appearance of *truth table*, shown for the simplest possible operator, and first appearance of *NOT*, defined completely by this table rather than by prose alone.
- **`NOT true` reducing to `false`, matching Lesson 6's conclusion** — confirms that this lesson's precise machinery reproduces exactly what Lesson 6 already reasoned informally, now as a checkable computation rather than an argument in prose.

### CS Lens

This is the simplest possible transformation on a two-valued quantity: the only operator of arity one that actually changes anything, since "leave it unchanged" is the only alternative. Also recognized in: a toggle switch, flipping between on and off; a photographic negative, where light and dark are exactly reversed; the word "un-" as a prefix in English, reversing a word's meaning (undo, unlock); a digital logic inverter gate, one of the most basic components in electronic circuit design.

### SE Lens

The alternative to naming NOT explicitly is to keep expressing reversal only in prose, as Lesson 6 did — "does not take the balance below 0" — trusting that the reversal is obvious enough not to need its own precise notation. The real cost of that alternative grows once reversal needs to be combined with other conditions (which Concept Units 2 through 5 will require): prose reversal doesn't compose cleanly with prose "and" or prose "or," while `NOT`, `AND`, and `OR`, once each is precisely defined, can be nested and combined exactly like any other operator from Lesson 3. Naming NOT costs nothing beyond writing down its two-row table; it buys a piece that fits precisely into everything else this lesson builds.

---

## Concept Unit 2: AND — Both Must Hold

### The Problem

Lesson 9's precondition for `total_with_tax` had two separate clauses: `subtotal ≥ 0`, and `0 ≤ tax_rate < 1` (itself really two clauses joined by the word "and" already). Lesson 9 checked both clauses by eye and concluded, in prose, whether "the precondition" as a whole was satisfied — but never had a single Boolean expression combining both clauses into one value. Lesson 10's closing already flagged this exact gap: two Boolean values exist, and nothing yet combines them into one.

### No isolated lab for this step

This concept has no code of its own to isolate — combining two Boolean values with AND is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Total With Tax's Precondition, Combined

**The complete truth table for AND, listing every one of the four possible combinations of two Boolean operands:**

| p | q | p AND q |
|---|---|---|
| true | true | true |
| true | false | false |
| false | true | false |
| false | false | false |

**Combining Lesson 9's two precondition clauses into one Boolean expression:** `(subtotal ≥ 0) AND (tax_rate ≥ 0)` (taking the tax-rate range's lower bound as a representative second clause, to keep the example to two operands).

**Evaluating this for the sensible case, `subtotal = 8.20`, `tax_rate = 0.10`:** `8.20 ≥ 0` reduces to `true`; `0.10 ≥ 0` reduces to `true`. `true AND true`, per the table, reduces to `true` — the combined precondition holds.

**Evaluating this for Lesson 9's problematic case, `subtotal = −8.20`, `tax_rate = −5.00`:** `−8.20 ≥ 0` reduces to `false`; `−5.00 ≥ 0` reduces to `false`. `false AND false`, per the table, reduces to `false` — the combined precondition does not hold, matching Lesson 9's own conclusion exactly.

### Walkthrough

- **The four-row truth table** — first appearance of *AND*, defined completely by exhaustively listing all four combinations, exactly as a Boolean-valued *exhaustive rule* (Lesson 2) should.
- **`(subtotal ≥ 0) AND (tax_rate ≥ 0)`** — combines two comparison operations (Lesson 10) with the newly defined AND, into a single Boolean expression.
- **The sensible case reducing to `true`, and the problematic case reducing to `false`** — confirms this operator reproduces Lesson 9's own by-eye conclusions precisely, now as an actual evaluated expression rather than an informal judgment.

### CS Lens

This is the idea of requiring every one of several conditions to hold at once, with no exceptions — the same all-or-nothing requirement behind Lesson 1's constraints, now given a precise operator. Also recognized in: a login system requiring both a correct username and a correct password; a manufacturing quality check requiring a part to pass every one of several tests, not merely most of them; a legal requirement stating several conditions that must all be met for a permit to be granted; a recipe requiring both that the oven be preheated and the batter be mixed before baking can begin.

### SE Lens

The alternative to defining AND precisely is to keep checking multiple conditions informally, one at a time, and trusting a mental tally of "so far, everything I've checked has held." The real cost of that alternative, once more than a couple of conditions are involved, is that nothing forces every condition to actually be checked — it's easy to informally conclude "looks fine" after checking most of them, without ever combining all of them into one expression whose value can be checked directly. Defining AND, and combining every relevant clause into one expression, costs nothing beyond writing the clauses next to the operator; it buys a single Boolean value that is `true` only when every clause genuinely holds, with no informal tallying required.

---

## Concept Unit 3: OR — At Least One Must Hold

### The Problem

Not every combined condition requires everything to hold. A store might offer free shipping if a customer's subtotal exceeds $100, *or* if the customer is a loyalty member — either condition alone is enough; neither is required if the other already holds. AND, as just defined, cannot express this: `AND` requires both. A different operator is needed, one that holds whenever at least one of its operands does.

### No isolated lab for this step

This concept has no code of its own to isolate — OR's behavior is demonstrated directly below through its truth table and a fresh example, not through a construct with its own syntax.

### Applying It — Free Shipping Eligibility

**The complete truth table for OR:**

| p | q | p OR q |
|---|---|---|
| true | true | true |
| true | false | true |
| false | true | true |
| false | false | false |

**The free-shipping condition, written as a Boolean expression:** `(subtotal > 100) OR (loyalty_member)`, where `loyalty_member` is itself a Boolean value — `true` if the customer holds a membership, `false` otherwise.

**Evaluating for a customer with a $60 subtotal and a loyalty membership:** `60 > 100` reduces to `false`; `loyalty_member` is already `true`. `false OR true`, per the table, reduces to `true` — free shipping applies, even though the subtotal alone would not have qualified.

**A deliberate warning about the word "or" itself, connecting directly to Lesson 2's vague-request problem:** everyday speech often uses "or" to mean exactly one of two options — "paper or plastic" does not usually mean both. The table above is *inclusive*: the top row shows `p OR q` is `true` even when both operands are `true`. Using OR to mean "this or that, but never both" without stating so is exactly the kind of silent ambiguity Lesson 2 warned against; this lesson's OR, unless stated otherwise, always means the inclusive version shown above.

### Walkthrough

- **The four-row truth table for OR** — first appearance of *OR*, defined by its truth table, deliberately compared row by row against AND's table from Concept Unit 2.
- **`(subtotal > 100) OR (loyalty_member)`** — combines a comparison operation with a directly-given Boolean value, `loyalty_member`, demonstrating that an operand of a logical operator need not itself be a comparison — any Boolean value or expression works.
- **`false OR true` reducing to `true`** — confirms OR requires only one operand to hold, in direct contrast to Concept Unit 2's AND.
- **The inclusive-versus-exclusive warning** — a reappearance of Lesson 2's *vague request*, applied here to the word "or" itself, and resolved the same way Lesson 4 resolved arithmetic's precedence ambiguity: by stating, once, which reading is meant.

### CS Lens

This is the idea of requiring only one of several conditions to hold, with no penalty or exclusion for more than one holding at once — the complementary idea to AND's all-or-nothing requirement. Also recognized in: eligibility criteria that accept any one of several qualifications (a degree, or equivalent work experience); a search that returns results matching any one of several keywords; an alarm system that triggers if any one of several sensors detects something, not requiring all of them; an insurance policy that pays out if any one of several listed conditions is met.

### SE Lens

The alternative to precisely defining OR as inclusive is to leave "or" ambiguous between its inclusive and exclusive everyday meanings, the way natural language usually does. The real cost of that alternative is exactly Lesson 2's cost: two readers of "free shipping if subtotal exceeds $100 or the customer is a loyalty member" could reasonably disagree about whether a customer meeting both conditions should get some kind of extra treatment, or whether "or" here quietly meant "but not both." Stating explicitly that OR is inclusive, once, as this lesson does, costs one sentence and removes that entire category of disagreement for every future use of the operator.

---

## Concept Unit 4: Implication — Formalizing "If... Then..."

### The Problem

Lesson 9's entire contract was built on the words "if... then...": if the precondition holds, then the postcondition is guaranteed. That sentence has exactly the shape of a Boolean expression built from two other Boolean expressions — a precondition-expression and a postcondition-expression — connected by a relationship that hasn't yet been given a precise truth table the way AND and OR have. Doing so requires confronting a case that doesn't come up naturally with AND or OR: what should "if P then Q" evaluate to when P itself is false?

### No isolated lab for this step

This concept has no code of its own to isolate — implication's truth table, including its least intuitive row, is worked out directly below, not through a construct with its own syntax.

### Applying It — Lesson 9's Contract, Formalized

**The complete truth table for implication, `P → Q`, read "if P then Q":**

| P | Q | P → Q |
|---|---|---|
| true | true | true |
| true | false | false |
| false | true | true |
| false | false | true |

**Working out why each row is what it is, starting with the two that match intuition directly:** row one — the precondition holds, and the postcondition holds — the contract was upheld exactly as promised: `true`. Row two — the precondition holds, but the postcondition fails — this is exactly Lesson 9's *contract violation* by the function itself, the one case where the promise was broken: `false`.

**The two remaining rows, where P is false — the case Lesson 9's Concept Unit 5 already examined by example:** when the precondition does not hold, the contract never claimed anything about the outcome at all — Lesson 9 said exactly this: "the contract makes no promise about the result at all." A statement that promised nothing cannot have been broken, regardless of what Q turns out to be. This is why both remaining rows are `true`: not because anything good necessarily happened, but because the implication itself was never actually tested by a case where its condition didn't hold.

**Applying this directly to Lesson 9's contract violation example, `total_with_tax(50.00, −0.10)`:** the precondition `0 ≤ tax_rate < 1` is `false` (`−0.10` is not at least `0`). By the table's third row, the whole implication `P → Q` is `true`, regardless of whether the postcondition `Q` — "result is never less than `subtotal`" — happens to hold or not. Lesson 9 found `Q` was in fact `false` here (`45.00 < 50.00`); the implication is `true` anyway, precisely because it is only ever making a claim about what happens when `P` holds, and here it didn't.

### Walkthrough

- **The four-row truth table** — first appearance of *implication*, with rows one and two matching direct intuition and rows three and four requiring the explanation given immediately after.
- **Row one and row two, matched to Lesson 9's own contract language** — a reappearance of Lesson 9's *contract* and *contract violation*, now shown as exactly the two rows where `P` is `true`.
- **Rows three and four, both `true`, explained via "a statement that promised nothing cannot have been broken"** — the crux of this unit: not a new independent fact, but a direct consequence of what Lesson 9 already established about what a contract does and doesn't claim when its precondition fails.
- **Rechecking `total_with_tax(50.00, −0.10)` against the full implication** — confirms this lesson's formal operator agrees with Lesson 9's own conclusion about that exact example, reached independently, in an earlier lesson, using only prose.

### CS Lens

This is the idea that a conditional promise is only ever tested by the case its condition actually covers — a promise about what happens *if* something occurs says nothing at all about what happens if it doesn't. Also recognized in: a warranty that promises a refund if a product is defective, which is not broken by anything that happens to a product that was never actually defective; a scientific hypothesis of the form "if X, then Y," which is not disproven by an observation where X never occurred; a rule stating "if it rains, the game is cancelled," which is not violated on a sunny day regardless of whether the game happens to be cancelled for some unrelated reason; a mathematical theorem's conclusion, which makes no claim whatsoever about cases outside its own stated hypotheses.

### SE Lens

The alternative to precisely defining implication's behavior when `P` is false is to leave it unstated, or to assume, incorrectly, that "if P then Q" should somehow be `false` whenever `P` is false, on the mistaken intuition that an untested promise should count as broken. The real cost of that mistaken alternative is a subtle, serious one: it would make Lesson 9's own conclusion wrong — a contract violation would incorrectly count as breaking the contract's overall guarantee, when Lesson 9 was careful to say precisely the opposite, that a violated precondition means no promise was made at all, not that a promise was broken. Getting implication's truth table exactly right, including its two least intuitive rows, costs the extra care this unit took working through them; it is the only version of the operator that actually matches what "if... then..." has meant, precisely, throughout Lesson 9.

---

## Concept Unit 5: Equivalence — When Two Expressions Always Agree

### The Problem

Concept Unit 1 wrote Lesson 6's withdrawal rule as `NOT (balance − withdrawal_amount < 0)`. It could just as naturally have been written using a direct comparison instead: `balance − withdrawal_amount ≥ 0`. Both expressions seem to be saying the same thing — but "seem to be saying the same thing" is exactly the kind of informal judgment this whole lesson has been replacing with precise operators. What's needed is a way to state, precisely, that two Boolean expressions always produce the same value, no matter what their names are bound to.

### No isolated lab for this step

This concept has no code of its own to isolate — checking whether two expressions always agree is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Ways of Writing the Same Rule

**The complete truth table for equivalence, `P ↔ Q`:**

| P | Q | P ↔ Q |
|---|---|---|
| true | true | true |
| true | false | false |
| false | true | false |
| false | false | true |

**The two candidate expressions, checked side by side for a handful of representative values, since checking every real number by hand is not possible:**

| `balance − withdrawal_amount` | `NOT (... < 0)` | `... ≥ 0` | Agree? |
|---|---|---|---|
| 100 | `true` | `true` | yes |
| 0 | `true` | `true` | yes |
| −5 | `false` | `false` | yes |

**Stating precisely what "equivalent" means here, and being honest about what this table has and hasn't shown:** `NOT (x < 0)` and `x ≥ 0` are called equivalent because, for every real number `x`, both expressions produce the same Boolean value — a fact that follows from how the real numbers themselves are ordered (a number is either less than zero or at least zero, never neither and never both), not merely from having checked three representative examples above. Checking a few examples, as done here, can suggest this strongly; it cannot, by itself, establish it for every one of infinitely many possible numbers — actually proving a claim like this precisely, rather than only checking examples, is exactly what a later lesson on direct proof will teach.

### Walkthrough

- **The four-row truth table for `↔`** — first appearance of *equivalence* as an operator, defined the same way every other operator in this lesson was: exhaustively, by every combination of its two Boolean operands.
- **The three-row comparison table** — applies equivalence to two full Boolean *expressions* (Lesson 10) rather than to two already-fixed Boolean values, checking representative cases rather than the finitely-many-rows exhaustive check that was possible for the operators themselves.
- **"a fact that follows from how the real numbers themselves are ordered... not merely from having checked three examples"** — an honest, explicit distinction between what a few checked examples suggest and what a genuine proof would establish, deliberately not overclaiming certainty this lesson hasn't yet earned.

### CS Lens

This is the idea of two differently-written statements being interchangeable in every case that matters, even though they look different on the page — a recognition that will recur throughout this curriculum every time one expression is rewritten into another, equally correct form. Also recognized in: two different algebraic expressions that always evaluate to the same value, however differently they're written; two different algorithms that always produce the same output for the same input, however differently they're implemented; two different legal phrasings of a contract clause that a court would treat as imposing identical obligations; two different translations of the same sentence into different languages, judged equivalent if they always convey the same meaning.

### SE Lens

The alternative to precisely checking equivalence is to trust, on the strength of a quick glance, that two differently-written expressions "obviously" mean the same thing. The real cost of that alternative is that "obviously the same" is exactly the kind of unchecked assumption Lesson 1 warned about — two expressions can look equivalent, agree on every example anyone happens to try, and still differ on some case nobody thought to check, the same way Lesson 1's desired-behavior discussion warned that examples alone never generalize. Checking equivalence deliberately, and being honest about the difference between "checked several examples" and "proven for every case," costs the discipline this unit modeled explicitly; it is what keeps a strong suggestion from being mistaken for an actual guarantee.

---

## Closing

### Connect the pieces

One theme — combining Boolean values precisely — traced through every unit built in this lesson, start to finish:

1. **NOT, resolving Lesson 6's rule (Unit 1):** `NOT (balance − withdrawal_amount < 0)`, correctly reducing to `false` for a withdrawal that would overdraw.
2. **AND, resolving Lesson 9's precondition (Unit 2):** `(subtotal ≥ 0) AND (tax_rate ≥ 0)`, correctly reducing to `true` for a sensible application and `false` for a nonsensical one.
3. **OR, for a condition needing only one clause (Unit 3):** `(subtotal > 100) OR (loyalty_member)`, correctly reducing to `true` even when only one clause holds — and a warning about "or"'s ambiguity in everyday speech.
4. **Implication, formalizing Lesson 9's "if... then..." (Unit 4):** `P → Q`, its two least intuitive rows explained by exactly what Lesson 9 already established about an unmet precondition.
5. **Equivalence, comparing two ways of writing the same rule (Unit 5):** `NOT (x < 0)` and `x ≥ 0`, checked against several examples and honestly flagged as needing a real proof, not just examples, to be fully established.

Unit 1's expression is exactly the one Unit 5 returns to, checking it against a second, differently-written version of the same rule — nothing in this lesson's closing units introduced an unrelated example.

### What breaks without this

Suppose implication's two least intuitive rows (Concept Unit 4) had been gotten wrong — specifically, suppose someone reasonably but mistakenly assumed `P → Q` should be `false` whenever `P` is `false`, since that seems to match "an untested promise, treated cautiously, as broken." A system built on this mistaken definition, reviewing every contract violation across a day's transactions, would flag `total_with_tax(50.00, −0.10)` — where the precondition genuinely failed — as a *broken contract*, the same category as a real case where the precondition held but the postcondition failed. Both would look identical in the report: "contract violated." But these are not the same situation at all — one is a case where the function's own logic actually produced a wrong result despite correct input (a real bug in `total_with_tax` itself), and the other is a case of bad input reaching a function that was never designed to handle it (a data-entry problem upstream, exactly as Lesson 9 diagnosed). Conflating the two means whoever investigates the report has no way to tell, from the report alone, which of two very different problems they're actually looking at. Restoring implication's correct truth table — leaving `P → Q` as `true` whenever `P` is `false` — removes this conflation directly: only a genuine postcondition failure, with the precondition actually satisfied, would ever be flagged as a broken contract at all.

### Exercises

1. **Observe.** Find a sentence in your own answers to Lesson 6 or Lesson 9's exercises that uses the word "not," "and," "or," or "if... then" informally. Identify which of this lesson's five operators it corresponds to.
2. **Formalize.** Write the sentence you found in Exercise 1 as a precise Boolean expression using the correct operator, the way Concept Unit 1 rewrote Lesson 6's rule using `NOT`.
3. **Predict.** For your Exercise 2 expression, choose two different sets of bindings for any names it contains, predict what it evaluates to for each, and then evaluate it step by step to check.
4. **Explain.** Write a two-clause condition of your own that needs `AND` and a separate one that needs `OR`, the way Concept Units 2 and 3 did. For your `OR` example, state explicitly whether it should be read as inclusive or exclusive, and why.
5. **Explain.** Write an implication of your own, `P → Q`, using a real rule (not necessarily from this curriculum). State, in your own words, what it means for your rule when `P` turns out to be false, connecting your explanation to Concept Unit 4's "a statement that promised nothing cannot have been broken."

### Definition of done

- [ ] You can write the complete truth table for each of NOT, AND, OR, implication, and equivalence, from memory, without checking back.
- [ ] You can explain, using Lesson 9's contract, why `P → Q` is `true` when `P` is `false`, without simply restating the truth table's rows.
- [ ] You can state the difference between inclusive and exclusive "or," and give an example sentence where the two readings would actually produce different results.
- [ ] You can explain the difference between checking a few examples of two expressions agreeing and actually proving they always agree, using Concept Unit 5's honesty about its own three-row table.
- [ ] You completed Exercises 1–5 using your own earlier work and examples, not the withdrawal, precondition, or free-shipping examples from this lesson.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which operator's truth table was least intuitive to you before working through this lesson, and why.
