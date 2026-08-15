# Lesson 13: Algebraic Manipulation

**What you will build**: By the end of this lesson you'll be able to take an equation describing a transformation and rearrange it to solve for a different variable, simplify a compound expression by cancellation and factoring, and — combining all three — invert a real transformation to recover an unknown input from a known output. These aren't school exercises; they're the exact tools this series will keep reaching for whenever "given the result, what produced it?" needs a precise answer instead of a guess.

**What you need to know first**: Substitution from Lesson 6 (this lesson leans on it constantly without re-explaining it), and injective functions from the previous lesson — this lesson's final unit shows exactly why injectivity is what makes "solving backward" possible at all.

**Terms introduced in this lesson**:

- **rearrangement** — solving an equation for a different variable than the one it was originally stated in terms of. *Why it matters*: this is the algebraic move behind turning "compute the output from the input" into "compute the input that would have produced a given output" — function inversion, made mechanical.
- **cancellation** — removing a term or factor that appears identically on both sides of an equation, since it contributes nothing to the difference between them. *Why it matters*: a precise, justified simplification (not just "crossing things out") — valid specifically because subtracting or dividing both sides of an equal pair by the same amount preserves the equality, per Lesson 6's substitution.
- **factoring** — rewriting a sum as a product by extracting a common term shared by every part of the sum. *Why it matters*: turns a repeated sub-expression into a single, reusable structure — both a genuine algebraic move and a real code-simplification technique, the numeric analogue of what Lesson 5's composition did for functions.

**Objects and methods used**: None new. This lesson reuses `+`, `-`, `*`, and `/`, applied to a reasoning technique rather than new syntax.

---

## Concept Unit: Rearrangement — Isolating a Different Variable

### The Problem

The deposit transformation from earlier lessons states `new-balance = balance + amount` — given a balance and a deposit amount, it computes the new balance. A different, equally real question: given a balance *before* and *after* a deposit, what was the deposit amount? Nothing about `new-balance = balance + amount`, read left to right, answers that directly.

### Introduce the concept in isolation

Start from the equation and isolate `amount` by applying the same operation to both sides:

```
new-balance = balance + amount
new-balance - balance = balance + amount - balance      (subtract "balance" from both sides)
new-balance - balance = amount                            ("balance" cancels on the right — Concept Unit 2)
amount = new-balance - balance                             (the same equation, sides swapped for readability)
```

Check it against concrete numbers: balance `100`, amount `50`, so `new-balance` is `150`. Using the rearranged form: `amount = 150 - 100 = 50` — matches exactly. This is **rearrangement**: the same equation, restated to solve for a different variable, justified at every step by doing the identical operation to both sides (which, per Lesson 6's substitution, preserves equality — if two things are equal, subtracting the same value from both keeps them equal).

### Discard the throwaway example

This isn't code to run — it's an algebraic derivation, checked against concrete arithmetic instead of a REPL session. The next unit shows exactly why one step of it ("cancels") is valid, not just plausible-looking.

### CS Lens

Rearrangement is the exact algebraic tool behind Lesson 12's classification: a function can only be usefully "solved backward" for a specific output if that kind of rearrangement is actually possible — Concept Unit 4 returns to this connection directly. Also recognized in: a thermostat converting a target Fahrenheit reading into the Celsius value its internal sensor actually compares against (the same conversion formula, used in whichever direction is needed), and a recipe scaled from "serves 4" to "serves 6" by rearranging the ratio between ingredients and servings.

### SE Lens

Code that only ever computes a transformation in one fixed direction — never needing to invert it — can get away with never rearranging anything. The moment a real requirement needs the reverse question answered ("given this output, what input produced it?"), the choice is between deriving the rearranged form once, carefully, and getting it right for every future use, or re-deriving it under pressure at the moment it's first needed — Lesson 4's "write the rule once" argument, applied to algebra instead of code.

---

## Concept Unit: Cancellation — Removing What Appears on Both Sides

### The Problem

The previous unit's derivation had one step that just asserted `balance` "cancels" — `new-balance - balance = balance + amount - balance` became `new-balance - balance = amount`. Why is it actually valid to just remove `balance` from the right side like that?

### Introduce the concept in isolation

Consider applying a deposit and then immediately withdrawing the exact same amount:

```
final-balance = (balance + amount) - amount
```

Check with concrete numbers: balance `100`, amount `50` — `(100 + 50) - 50 = 150 - 50 = 100`, exactly the starting balance, regardless of what `amount` was. Algebraically:

```
(balance + amount) - amount
= balance + (amount - amount)     (regroup — the two "amount" terms are adjacent once regrouped)
= balance + 0                     (amount - amount is always 0, whatever amount is)
= balance
```

`amount` appears once being added, once being subtracted — the two occurrences don't need to be evaluated first and compared; they cancel algebraically, for *any* value of `amount`, because adding and then subtracting the identical value nets to adding zero. This is **cancellation**: removing a term that appears on both a positive and negative footing (or, for multiplication, in both a numerator and denominator) because its net contribution is nothing.

This directly justifies the previous unit's step: `balance + amount - balance` has `balance` added once and subtracted once — by the identical reasoning just shown, it cancels, leaving `amount`.

### Discard the throwaway example

Algebraic derivation, not code — checked against concrete arithmetic (`100`, `50`) above.

### CS Lens

Cancellation is the mathematical justification behind an optimizer recognizing that two adjacent, opposite operations do nothing and can be removed entirely (Lesson 204, *Compilers and Optimization*) — a compiler that sees code adding then immediately subtracting the same value is performing exactly this cancellation, automatically. Also recognized in: a delivery route that visits a location and immediately leaves without doing anything there (removable from the route entirely, with no change to the outcome), and an accounting ledger where a charge and an identical, immediate refund net to zero.

### SE Lens

Recognizing when cancellation genuinely applies — versus when two things merely *look* like they should cancel — matters: `(balance + amount) - amount` cancels perfectly because both terms are the literal same value; `(balance + amount) - fee`, where `fee` happens to equal `amount` on one specific occasion, does *not* algebraically cancel in general, even though it might compute the identical number for that one case. Lesson 6's equality-versus-coincidence distinction is exactly the check to apply before trusting a cancellation: are these two terms *the same expression*, or merely *equal on this particular input*?

### Connection to the previous unit

The previous unit performed a cancellation without justifying it; this unit supplies the justification — and shows the exact same reasoning applies just as well to a case built specifically to demonstrate it (deposit-then-withdraw) as to the abstract rearrangement step it was borrowed to explain.

---

## Concept Unit: Factoring — Extracting Common Structure

### The Problem

Suppose a deposit is charged a processing fee equal to one-tenth of the deposit amount, and only the remainder is actually added to the balance: `net-addition = amount - (amount * 1/10)`. Both terms involve `amount` separately — is there a simpler way to express the same computation?

### Introduce the concept in isolation

```
net-addition = amount - (amount * 1/10)
             = amount * 1 - amount * 1/10        (amount alone is the same as amount * 1)
             = amount * (1 - 1/10)               (factor "amount" out of both terms)
             = amount * 9/10
```

Check with a concrete number: `amount = 100`. Original form: `100 - (100 * 1/10) = 100 - 10 = 90`. Factored form: `100 * 9/10 = 90` — the same result, reached with one multiplication instead of a multiplication, then a subtraction. This is **factoring**: rewriting a sum (`amount - amount * 1/10`, a subtraction is addition of a negative) as a product (`amount * 9/10`) by extracting the term, `amount`, common to both parts.

### Discard the throwaway example

Algebraic derivation, checked against concrete arithmetic (`100 → 90`) above.

### CS Lens

Factoring is the numeric version of exactly what Lesson 5's composition did for functions — finding a shared piece across separate computations and expressing it once instead of repeating it. Also recognized in: a store applying one combined discount rate instead of separately computing and summing several smaller discounts that all reduce to the same total percentage, and a spreadsheet formula rewritten to multiply a whole column by one shared rate rather than repeating the subtraction in every row.

### SE Lens

The factored form, `amount * 9/10`, is not just shorter — it's also less code doing the equivalent work: one multiplication instead of a multiplication and a subtraction, which matters more once this computation runs for every transaction in a large system rather than once, by hand. Lesson 284 (*Performance Engineering*) returns to exactly this kind of algebraic simplification as a legitimate optimization technique — one justified by a real proof of equivalence (this unit's derivation), not a guess that the rewritten version "should" behave the same.

### Connection to the previous unit

The previous unit removed a term that contributed nothing; this unit reorganizes terms that all contribute the same underlying factor — a different move, but the same spirit: rewrite an expression into a form that's provably equal but structurally simpler.

---

## Concept Unit: Solving Equations — Inverting a Transformation

### The Problem

With the fee rule from the previous unit in place — `net-addition = amount * 9/10`, and `final-balance = balance + net-addition` — suppose a specific final balance is known, along with the balance beforehand, but the actual deposit `amount` that produced it isn't recorded anywhere. Can it be recovered?

### Introduce the concept in isolation

Combine both equations by substitution (Lesson 6):

```
final-balance = balance + (amount * 9/10)
```

Rearrange (Concept Unit 1) to solve for `amount`:

```
final-balance - balance = amount * 9/10            (subtract "balance" from both sides — cancellation removes it on the right)
(final-balance - balance) / (9/10) = amount        (divide both sides by 9/10)
amount = (final-balance - balance) * 10/9          (dividing by a fraction is multiplying by its reciprocal)
```

Check with concrete numbers: `balance = 100`, `final-balance = 190`.

```
amount = (190 - 100) * 10/9
       = 90 * 10/9
       = 900/9
       = 100
```

Verify by running the *original* direction with `amount = 100`: fee-adjusted addition is `100 * 9/10 = 90`; final balance is `100 + 90 = 190` — matches the number this derivation started from. The unknown deposit, `100`, was recovered exactly from nothing but the before-and-after balances and the known fee rate.

This only worked because the transformation from `amount` to `final-balance` (for a fixed `balance` and fee rate) is **injective**: every distinct deposit amount produces a distinct final balance (multiplying by the fixed, nonzero `9/10` and adding a fixed `balance` never maps two different amounts to the same result), so there was exactly one `amount` that could have produced `190` — not a guess among several equally valid candidates, the way the previous lesson's un-`square` attempt was forced to guess between `1` and `-1`.

### Discard the throwaway example

Algebraic derivation, verified against concrete arithmetic (`100 → 190`, then reversed back to `100`) above.

### Formal Definition, Walked Through

> Solving an equation for an unknown means applying a sequence of operations — identical on both sides, each justified by substitution — until the unknown stands alone on one side.

- *"identical on both sides"* — every step in this unit's derivation (subtract `balance`, divide by `9/10`) was applied to the whole equation, not just to one side — the exact discipline Concept Unit 1 first established.
- *"each justified by substitution"* — Lesson 6's substitution is what makes "do the same thing to both sides" valid at all: if two expressions are equal, applying the same operation to both produces two new expressions that are still equal — this is the entire license this unit's every step relies on, stated once here instead of re-justified at each line.

### CS Lens

Solving for an unknown given a known output and a known rule is exactly what a calibration process does (find the setting that produces a target result), what a thermostat's control loop computes in reverse (given the desired room temperature and a known heating rate, how long to run the heater), and what Lesson 249 (*Optimization*) generalizes far beyond simple algebra — searching for an input that produces a desired (or best possible) output, when direct rearrangement like this unit's isn't available.

### SE Lens

This entire technique depends on the transformation actually being invertible — precisely the injectivity question the previous lesson raised. A fee structure that rounds to the nearest dollar, for instance, is *not* injective (many different exact amounts round to the same charged fee), and no amount of correct algebra can recover the original exact amount from a rounded result — the information needed to distinguish them was destroyed at the rounding step, the same un-invertible-because-not-injective failure the previous lesson's "un-square" example already demonstrated. Knowing which transformations in a real system are actually invertible, before trying to invert one, avoids attempting an algebraic derivation that no amount of correct technique could ever complete.

### Connection to the previous unit

The previous unit simplified an expression into a form with a common factor pulled out; this unit uses that exact factored form as the starting point for rearrangement — the three techniques in this lesson aren't independent tricks, they compose directly, factoring making the subsequent rearrangement (divide by `9/10`, not by a two-term sum) meaningfully simpler.

---

## Connect the Pieces

The full chain, start to finish, using every technique from this lesson:

```
Rule: final-balance = balance + (amount * 9/10)          [built from a deposit rule and a factored fee rule]

Given: balance = 200, final-balance = 380
Solve for amount:

380 = 200 + (amount * 9/10)
380 - 200 = amount * 9/10        [rearrangement: subtract 200 from both sides]
180 = amount * 9/10
180 / (9/10) = amount             [rearrangement: divide both sides by 9/10]
amount = 180 * 10/9 = 1800/9 = 200

Verify, running the original direction: fee-adjusted addition = 200 * 9/10 = 180; final balance = 200 + 180 = 380. Matches.
```

Rearrangement (Concept Unit 1) moved `amount` to one side; cancellation (Concept Unit 2) is what justified `200` disappearing from the right-hand side cleanly; the factored form `amount * 9/10` (Concept Unit 3) — rather than the original two-term `amount - amount * 1/10` — is what made dividing to isolate `amount` a single clean step instead of a more complex rearrangement; and the whole recovery was only trustworthy in the first place because Concept Unit 4 established the transformation is injective, guaranteeing `200` is the *only* deposit that could have produced a final balance of `380` given a starting balance of `200`.

## What Breaks Without This

Suppose the fee rule were changed to round the fee to the nearest whole number instead of keeping it exact — `net-addition = amount - round(amount * 1/10)`. Attempt the same reversal for `final-balance = 190`, `balance = 100`, using the (now invalid) exact-fraction rearrangement from Concept Unit 4:

```
amount = (190 - 100) * 10/9 = 100     [the old, exact derivation, applied unchanged]
```

Checking this "recovered" amount against the *new*, rounding rule: fee for amount `100` is `round(100 * 1/10) = round(10) = 10` (no rounding actually needed here, coincidentally) — but try `amount = 103`: fee is `round(103 * 1/10) = round(10.3) = 10`, net addition `93`, final balance `193`. And `amount = 107`: fee is `round(107*1/10) = round(10.7) = 11`, net addition `96`, final balance `196`. Multiple different exact amounts can round to fees that are close enough to make several different final balances plausible outcomes of "roughly the same" deposit — the rounding step breaks the clean injectivity Concept Unit 4 relied on, and the exact algebraic reversal derived for the unrounded rule silently gives a wrong or merely approximate answer once applied to a rule that no longer has the property (injectivity) the whole derivation assumed.

## Exercises

1. **Trace.** Rearrange `total = price * quantity` to solve for `price`, then check it against `price = 20`, `quantity = 3`, `total = 60`.
2. **Predict.** Before deriving it, predict whether `final = (balance - fee) + fee` simplifies by cancellation to just `balance`, the way `(balance + amount) - amount` did in this lesson. Derive it and check.
3. **Factor.** Simplify `charge = amount * 1/20 + amount * 1/20` (two separate 5% fees) into a single factored term. Check it against `amount = 200`.
4. **Break it, on purpose.** Using this lesson's exact fee-rate transformation (`amount * 9/10`), derive the reversal formula, then apply it to a `final-balance` that couldn't actually have come from any valid nonnegative `amount` (choose `final-balance` smaller than `balance`). What does the "recovered" amount look like, and what does that tell you about checking a solved-for value against the original problem's constraints?
5. **Generalize.** A transformation charges a flat fee of `5` plus one-twentieth of the deposit: `final-balance = balance + amount - (5 + amount * 1/20)`. Factor this into `balance` plus a simplified expression in `amount`, then solve it for `amount` given `balance = 100` and `final-balance = 214.05`. (If a fraction with a decimal shows up, decide whether to keep it exact or note where it would need rounding — and if rounding, connect back to "What Breaks Without This.")
6. **Reconstruct.** Close this lesson. From memory, explain why solving Concept Unit 4's equation for `amount` was guaranteed to have exactly one answer, using the word "injective" — and explain what specifically would go wrong with the same technique if the transformation involved rounding.

## Definition of Done

- [ ] You can rearrange a simple two-term equation to solve for a different variable, and verify the result against concrete numbers.
- [ ] You can explain why cancellation is valid, rather than just asserting that terms "cancel."
- [ ] You completed Exercise 5's factor-then-solve derivation and verified it numerically.
- [ ] You can explain, from memory, the connection between a transformation's injectivity and whether it can be reliably solved backward.
- [ ] Commit your Exercise 5 derivation to your notes repository, with a commit message stating what you solved for and how you verified it — for example, `"Derive amount from final-balance for flat-fee-plus-percentage rule, verified against balance=100, final=214.05"` — not just `"lesson 13 exercise"`.

---

**Next lesson:** Lesson 14, *Inductive Thinking*, is where this series' proof techniques properly begin — establishing a property for a starting case, then showing it propagates, the reasoning pattern that will justify every recursive function Section II builds.
