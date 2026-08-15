# Lesson 3: Values and Operations

**What you will build:** Still nothing runnable — this lesson builds the basic vocabulary computation is made of: a _value_, a specific piece of data on its own, and an _operation_, a rule that takes one or more values and produces a new one. The transferable problem this lesson is actually about: every computation this curriculum will ever build, no matter how large, is assembled out of nothing but these two ingredients, applied over and over — so it is worth being precise about what each one actually is before combining them into anything bigger.

**What you need to know first:** Lesson 1 (`FP-L001-what-is-a-problem.md`) — specifically _assumption_ and _undefined case_, reused directly in Concept Unit 5. Lesson 2 (`FP-L002-turning-ambiguity-into-precision.md`) — specifically _undefined case_ and _literal execution_, both reused directly in Concept Unit 5.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Value** — a specific, self-contained piece of data, complete on its own — the number 7, for instance. A value is not a process and does not "do" anything; it is what a process produces or works with. Separating a value from whatever produced it matters because two completely different calculations, `3 + 4` and `2 + 5`, produce the exact same value, 7 — and without a name for "the thing they both produced," there would be no way to say they're interchangeable.
- **Operation** — a rule that takes one or more values and produces a new value from them — addition, multiplication, and negation are all operations. Naming "operation" separately from any one specific calculation is what makes it possible to recognize the _same_ rule being applied to different values, rather than treating every calculation as its own unrelated event.
- **Operand** — one of the values an operation actually takes as input. In `3 + 4`, both 3 and 4 are operands of the addition operation. Naming operands explicitly matters because an operation's entire behavior is defined in terms of them — "addition" means nothing on its own without something to add.
- **Arity** — the number of operands a specific operation requires. Addition and multiplication each take two operands (their arity is two); negation takes exactly one (its arity is one). Arity exists as its own idea because it lets a use of an operation be checked for basic well-formedness — the right number of operands supplied — before ever asking whether the values themselves make sense.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain arithmetic notation and a single running example — computing the total for a small store receipt.

---

## Concept Unit 1: What a Value Is

### The Problem

Picture a cashier ringing up a notebook priced at 3.50. The number 3.50 sitting on the receipt is just that — a specific amount, fully determined, not in the middle of being computed. It does not matter whether that 3.50 came from a price tag being read directly, or from some earlier calculation (say, a $7.00 two-for-one deal, halved) — once it is 3.50, it is 3.50, indistinguishable from any other 3.50 that shows up anywhere else on the receipt. This is worth stating plainly because it is easy to blur "a value" together with "the specific calculation that happened to produce it," and that blurring makes it hard to say two different calculations arrived at _the same_ thing.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing a value as a self-contained piece of data, apart from whatever produced it, is a distinction made in plain language and arithmetic, not a construct with its own syntax.

### Applying It — the Store Receipt

**A value taken directly from the world, with nothing computed yet:** the price tag on a notebook reads $3.50. The number 3.50 is a value.

**Two different origins for the exact same value, to show the value itself doesn't remember how it arose:** a second notebook's price could have been computed as half of a $7.00 bulk-pack price, `7.00 ÷ 2`, which also comes out to 3.50. Whether a 3.50 on the receipt came from a price tag or from a division, the resulting value is identical in every way that matters to whatever uses it next — the receipt cannot tell, and does not need to.

**Why this distinction earns its own unit:** the rest of this lesson is about _operations_ that take values and produce new ones. None of that makes sense unless "a value" is already understood as something stable enough to be handed from one operation to the next, unaffected by its own history.

### Walkthrough

- **"$3.50" read directly off a price tag** — first appearance of _value_: a specific, self-contained piece of data, with no computation attached to it at the moment it's used.
- **"7.00 ÷ 2" also producing 3.50** — demonstrates, concretely, that a value's identity does not include how it was produced; two different origins can and do produce the identical value.
- **"the receipt cannot tell, and does not need to"** — not a new concept, but the point of the unit made explicit: treating a value as separate from its origin is what allows it to be used interchangeably with any other occurrence of the same value.

### CS Lens

This is the idea of a value as data at rest — determined, inert, and indifferent to its own history. Also recognized in: a single cell's contents in a spreadsheet, once a formula in it has been evaluated to a number; a constant like π, which is the same value no matter which formula produced an approximation of it; a variable's contents at one specific moment, viewed in a debugger, with no record attached of the expression that last assigned it; a database column holding a stored number, indifferent to whether it was typed in directly or computed by an earlier query.

### SE Lens

The alternative to treating a value as separate from whatever produced it is to think of every number as permanently tied to the specific calculation that generated it — this 3.50 is "the halved bulk price," that 3.50 is "the tag price," and the two are never quite interchangeable in your reasoning even though they're numerically identical. The real cost of that alternative is that it becomes impossible to freely substitute one calculation's result for another's, which is exactly what later reasoning about equivalent computations depends on — two different ways of arriving at the same total have to be recognized as producing the same value before it's possible to say one is simpler, or faster, or otherwise preferable to the other. Separating a value from its origin costs nothing to state and pays for itself the moment two different computations need to be compared.

---

## Concept Unit 2: What an Operation Is

### The Problem

The cashier needs the combined cost of the notebook (3.50) and a pen (1.20). Getting 4.70 from those two numbers is not a one-off event invented fresh for this particular receipt — it is the same rule, addition, that would apply to any two prices at all: 3.50 and 1.20 today, 2.00 and 6.75 tomorrow. What makes addition worth naming, rather than just quietly doing it each time, is exactly this reusability: it is one fixed rule, applicable to endlessly many different pairs of values, always combining them the same way.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing addition as one reusable rule rather than a fresh event each time is a distinction made in plain arithmetic, not a construct with its own syntax.

### Applying It — the Store Receipt

**One operation, applied to two different pairs of values:** `3.50 + 1.20 = 4.70` (notebook and pen). The same addition rule, applied to a completely different pair: `2.00 + 6.75 = 8.75` (a different day's items). Nothing about _how_ addition combines its two values changed between these; only the specific values did.

**Naming the operation apart from any one use of it:** "addition" refers to the rule itself — take two values, combine them by the familiar carrying/summing procedure — independent of which two values it's ever actually applied to.

### Walkthrough

- **"3.50 + 1.20 = 4.70"** — first appearance of _operation_ shown concretely: addition, applied to two specific values, producing a new one.
- **"2.00 + 6.75 = 8.75"** — the same operation, addition, applied to a different pair of operands, demonstrating that the rule itself did not change — only the values it was applied to did.
- **"naming the operation apart from any one use of it"** — not a new concept, but the direct statement of the unit's point: an operation is the reusable rule, distinct from any particular calculation that applies it.

### CS Lens

This is the idea of a reusable rule applied uniformly across many different inputs — the seam that separates "one specific calculation" from "a general procedure." Also recognized in: an arithmetic operator in any programming language, applied identically regardless of which specific numbers appear on either side of it; a mathematical operation like multiplication, whose definition does not change no matter which two numbers are multiplied; a factory machine configured to perform one fixed step, applied identically to every unit that passes through it; a stamping tool that imprints the same mark regardless of which specific piece of material is placed under it.

### SE Lens

The alternative to recognizing addition as one reusable operation is to treat every instance of combining two numbers as its own fresh, unrelated event — reasoning about "the notebook-plus-pen calculation" and "tomorrow's calculation" as if they had nothing in common. The real cost of that alternative is that nothing learned or verified about one calculation ever transfers to the next; every new pair of values needs its own reasoning from scratch. Naming addition as a single operation, applicable to any pair of values, is what will eventually make it possible to build one general procedure — an algorithm — that correctly handles every possible pair at once, rather than solving each receipt's arithmetic as an unrelated puzzle.

---

## Concept Unit 3: Operands and Arity

### The Problem

"Addition combines two values" and "negation flips the sign of one value" are both true, and both incomplete without saying, precisely, which values each operation is actually working on and how many of them it expects. In `3.50 + 1.20`, the 3.50 and the 1.20 are not incidental — they are exactly what the plus sign is defined in terms of. And addition always needs exactly two of them; it would not make sense to "add" a single lone value, or to feed it three at once without saying how the third one participates. Naming both of these precisely — which values an operation is applied to, and how many it requires — turns "addition" from a vague idea into something whose use can actually be checked as well-formed or not.

### No isolated lab for this step

This concept has no code of its own to isolate — naming the operands and counting how many an operation requires is a way of describing an operation already shown above, not a new construct with its own syntax.

### Applying It — the Store Receipt

**Naming the operands of a specific addition, directly:** in `3.50 + 1.20`, the operands are 3.50 and 1.20 — the two values addition is actually combining.

**Counting how many operands each operation on this receipt requires:**

> - Addition (combining a notebook's price and a pen's price): two operands. Its arity is two.
> - Negation (reversing a charge, for a refunded item): one operand — just the amount being refunded. Its arity is one.

**A use that is not well-formed at all, because it violates arity — not because any value is wrong:** "negate 3.50 and 1.20" does not make sense as written, because negation's arity is one, and two values have been offered to it. This is not a question of whether 3.50 or 1.20 is a bad price; it is that negation, by definition, only ever operates on a single value, so handing it two is malformed before any actual arithmetic is even attempted.

### Walkthrough

- **"the operands are 3.50 and 1.20"** — first appearance of _operand_ named explicitly for a specific use of an operation, distinct from the operation itself.
- **"two operands... its arity is two" / "one operand... its arity is one"** — first appearance of _arity_, shown for two different operations (addition and negation) specifically to demonstrate that different operations can require different numbers of operands.
- **"negate 3.50 and 1.20" as malformed** — demonstrates the actual usefulness of naming arity: a use of an operation can be checked for basic well-formedness (right number of operands) independently of, and prior to, checking whether the operands' actual values make sense.

### CS Lens

This is the idea of an operation's required "shape" — how many things it needs to do its job — checkable before anything about the values themselves is examined. Also recognized in: a function's parameter list in any programming language, which fixes how many arguments a call must supply; a mathematical operator's fixed number of arguments (unary minus versus binary subtraction, which look identical but take a different number of operands); a machine's input slots, engineered to accept exactly the number of parts a given step requires, rejecting a mis-fed batch before assembly even begins; a recipe step that calls for "two eggs," where supplying one or three is a malformed instruction regardless of how good either egg is.

### SE Lens

The alternative to naming an operation's arity explicitly is to leave the expected number of operands implicit, and just try applying the operation with whatever happens to be on hand. The real cost of that alternative is a class of avoidable error: calling an operation with the wrong number of operands (negating a pair of values, as if negation worked like addition) produces confusion that has nothing to do with whether the underlying values are sensible — the mistake is in the _shape_ of the call, not the content, and without a name for arity there is no clean way to even describe what went wrong. Stating arity explicitly costs one small fact per operation and buys the ability to catch this entire category of mistake before ever getting to the actual arithmetic.

---

## Concept Unit 4: Getting a Complex Result From Simple Operations, in Sequence

### The Problem

The cashier does not actually want just "3.50 + 1.20" — that is only the cost of the items before tax. The real result wanted is the full amount the customer owes: item costs summed, then tax applied to that sum, then the tax added on top. No single operation does all of that at once. What actually happens is a sequence: one operation's output becomes the next operation's operand, several times in a row, until the final value wanted has been produced. Seeing this sequence clearly — which value feeds into which operation next — is what makes it possible to compute something as involved as "total amount owed, including tax" out of nothing but the same handful of simple two-operand operations already named in this lesson.

### No isolated lab for this step

This concept has no code of its own to isolate — following a sequence of operations, each one's result feeding the next, is demonstrated directly in the worked example below rather than through a construct with its own syntax.

### Applying It — the Store Receipt

**The full situation:** 2 notebooks at $3.50 each, 1 pen at $1.20, a 10% tax rate (0.10).

**The sequence of operations, one step at a time, each result explicitly carried into the next:**

1. Multiply notebook quantity by notebook price: `2 × 3.50 = 7.00`. This value, 7.00, is the notebooks' line total.
2. The pen's line total needs no multiplication beyond quantity 1, so it stays `1.20`.
3. Add the two line totals: `7.00 + 1.20 = 8.20`. This value, 8.20, is the subtotal — and it is exactly the _operand_ the next operation needs.
4. Multiply the subtotal by the tax rate: `8.20 × 0.10 = 0.82`. This value, 0.82, is the tax amount.
5. Add the subtotal and the tax amount: `8.20 + 0.82 = 9.02`. This final value, 9.02, is the total amount owed.

**What made this possible, stated plainly:** every one of these five steps is either the addition or the multiplication operation already named in this lesson, each taking exactly two operands, exactly as arity requires. Nothing new was needed — only a sequence in which step 3's result became step 4's operand, and step 4's result became step 5's operand.

### Walkthrough

- **Step 1, `2 × 3.50 = 7.00`** — a reappearance of the multiplication operation (introduced structurally alongside addition in Concept Unit 2), here producing the first intermediate value of the sequence.
- **Step 3, `7.00 + 1.20 = 8.20`** — a reappearance of addition; notably, its two operands (7.00 and 1.20) are themselves values produced by earlier steps, not values read directly off a price tag — the first time in this lesson an operand has come from a prior operation rather than directly from the world.
- **Step 4, `8.20 × 0.10 = 0.82`** — multiplication again, with the subtotal from Step 3 as one of its operands — the concrete demonstration that one operation's output can serve as the next operation's operand.
- **Step 5, `8.20 + 0.82 = 9.02`** — addition again, producing the value the entire sequence exists to compute; the final output of the whole receipt calculation.

### CS Lens

This is the idea of feeding one operation's result into the next as an operand — building a larger result out of a sequence of small, individually simple steps. Also recognized in: a factory assembly line, where each station's output becomes the next station's input; a Unix command pipeline, where each program's output stream feeds directly into the next program's input stream; a spreadsheet, where one cell's formula references the already-computed value of another cell; a recipe's steps, where "fold in the mixture from step 2" treats an earlier step's result as an ingredient for the next.

### SE Lens

The alternative to breaking this calculation into a visible sequence of named intermediate values is to try to compute the final total in one single, unbroken mental leap — "2 notebooks and a pen with 10% tax comes to $9.02" — without ever writing down the subtotal or the tax amount on their own. The real cost of that alternative is that nothing along the way is independently checkable: if the final 9.02 turns out to be wrong, there is no subtotal or tax-amount value to inspect and compare against expectations, only one large, opaque leap to redo entirely. Naming and keeping each intermediate value (the line totals, the subtotal, the tax amount) costs a small amount of extra writing, in exchange for a calculation where any single step can be checked, and a wrong result can be traced back to exactly the step that produced it.

---

## Concept Unit 5: An Operation Must Give Exactly One Result

### The Problem

Suppose the $9.02 total needs to be split evenly among the members of a rewards-program group tied to this purchase — division, `9.02 ÷ group size`, is one more operation, taking the total and the group size as its two operands. If the group has 3 members, `9.02 ÷ 3` gives a perfectly good value. But what if a data problem means the group size on file is 0 — a group with no members recorded at all? `9.02 ÷ 0` is not simply "a large number" or "an error the cashier can shrug off" — division has, by its own definition, no value to give back when its second operand is 0. This is not a new problem this lesson has never seen: it is the exact same shape of gap Lesson 2 found in the passing-grade rule, and Lesson 1 named directly — an input for which no outcome has been, or can be, defined.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that an operation can have no defined result for certain operands is a fact about the operation's own definition, examined in plain arithmetic, not a construct with its own syntax.

### Applying It — the Store Receipt

**An ordinary use of division, producing a genuine value:** total $9.02 split among 3 group members: `9.02 ÷ 3 = 3.006...` — an exact, if inconveniently long, value.

**The same operation, applied to a group size of 0:** `9.02 ÷ 0` — there is no number that, multiplied by 0, gives back 9.02, because any number multiplied by 0 is 0. Division simply has nothing to hand back here; this is not a very large value, and not a mistake in the 9.02 — it is division itself having no answer for this particular pair of operands.

**Connecting this directly to what Lesson 1 and Lesson 2 already established:** Lesson 1 named an _assumption_ as a condition taken as already true and never checked; division silently assumes its second operand is never 0. Lesson 2 named an _undefined case_ as an input nobody decided an outcome for; a group size of 0 is exactly that, for the division operation. And Lesson 2's _literal execution_ applies here without any change: a machine handed `9.02 ÷ 0` does not know to "do the sensible thing" — it does whatever its underlying arithmetic tool defaults to for this case (commonly, halting with an error), a decision made by whoever built that tool, not by anyone reasoning about this specific receipt.

### Walkthrough

- **`9.02 ÷ 3 = 3.006...`** — establishes division as an ordinary two-operand operation, working as expected, before its failure case is examined.
- **`9.02 ÷ 0`** — the case with no defined result; not a new named concept, but a direct application of _undefined case_, reappearing here from Lesson 2, to an operation rather than to a rule about exam scores.
- **"division silently assumes its second operand is never 0"** — a reappearance of _assumption_ from Lesson 1, restated in a clause exactly as the Repetition Rule requires: not re-derived from scratch, just named and applied to this new setting.
- **"a machine handed `9.02 ÷ 0` does not know to do the sensible thing"** — a reappearance of _literal execution_ from Lesson 2, likewise restated briefly rather than re-explained in full.

### CS Lens

This is the fact that an operation is only defined over some of the possible operand combinations, not necessarily all of them — the same fact that will later be called a function's domain. Also recognized in: division by zero, flagged as an error in essentially every calculator and programming language in existence; the square root of a negative number, undefined within ordinary real-number arithmetic; a lookup operation on an empty collection, with nothing to return; an inverse operation (like "undo") applied to a state that was never actually reachable in the first place.

### SE Lens

The alternative to checking whether an operation is defined for the operands it is about to receive is to apply it anyway and accept whatever the underlying tool happens to do with an invalid case. The real cost is identical to the one Lesson 2 already found for an unaddressed grading case: there is no "sensible" behavior a machine falls back on for `9.02 ÷ 0` — it does whatever its arithmetic hardware or software was built to do for that case, chosen by that tool's designers for their own reasons, not by anyone thinking about this receipt or this rewards group. Checking an operand against an operation's known gaps (division's refusal of a zero second operand, for instance) before applying it costs one small check; skipping it hands the outcome to a default nobody watching this calculation actually chose.

---

## Closing

### Connect the pieces

One receipt, traced through every unit built in this lesson, start to finish:

1. **Values (Unit 1):** 3.50 and 1.20, taken directly from price tags — self-contained, with no memory of where they came from.
2. **An operation (Unit 2):** addition, one reusable rule, shown combining both this receipt's prices and a different day's prices identically.
3. **Operands and arity (Unit 3):** naming 3.50 and 1.20 as addition's two operands, and confirming addition's arity is two — while negation's is one, making "negate 3.50 and 1.20" malformed on its face.
4. **A sequence of operations (Unit 4):** quantity times price, then a sum of line totals, then subtotal times tax rate, then subtotal plus tax — each result becoming the next step's operand, ending at the total, 9.02.
5. **An operation with no defined result (Unit 5):** that same 9.02, divided by a group size of 3, works fine; divided by a group size of 0, division has nothing to give back — the same shape of gap Lessons 1 and 2 already named, now found inside an operation itself rather than inside a stated rule.

The final total in Unit 4, 9.02, is exactly the value Unit 5 goes on to divide — nothing in this lesson introduced a second, unrelated example partway through.

### What breaks without this

Suppose Unit 5 had been skipped, and the group-splitting step had simply been coded into the register's software as "total divided by group size," with no check for a group size of 0 at all. For every ordinary group — 2 members, 3, 10 — this works exactly as expected. Now a rewards-program record with a group size of 0 (perhaps a group that was created and then had every member removed) reaches this exact register. The underlying arithmetic tool, asked to compute `9.02 ÷ 0`, does whatever it was built to do for that case — commonly, halting the entire transaction with an error, in the middle of a real customer's checkout, with a line of people waiting behind them. Nobody decided the checkout should behave this way; the decision was made, invisibly, by whichever default the underlying arithmetic tool happened to have for division by zero, because Unit 5's check — confirming an operand doesn't fall into an operation's known gap before applying it — was never put in place. Restoring that check fixes this directly: a group size of 0 is caught and handled explicitly (skip the split, flag the record for review) before division is ever asked to run on it at all.

### Exercises

1. **Observe.** For the sentence "a recipe calls for 2 cups of flour and 1 egg, combined into batter," identify at least two values and name one operation being applied to them, the way Concept Unit 2 named addition applied to 3.50 and 1.20.
2. **Predict.** For an operation of your choosing (other than addition, multiplication, negation, or division), state its arity before checking a reference — is it one operand, two, or could it reasonably be either depending on how it's used?
3. **Formalize.** Pick a small real-world calculation with at least three steps (a tip calculation, a unit conversion, a recipe scaled up for more servings). Write it out as a sequence of operations the way Concept Unit 4 wrote out the receipt total — one operation per step, each result explicitly carried forward as the next step's operand.
4. **Explain.** For the calculation you wrote in Exercise 3, identify one operation in it that has operand values it cannot handle (a division that could receive a zero, a square root that could receive a negative number). State exactly what operand value would break it, the way Concept Unit 5 identified a group size of 0 for division.
5. **Explain.** Using Lesson 1 and Lesson 2's vocabulary, state which of your Exercise 4 operation's assumption is being silently relied on, and what a machine given that operation and the breaking operand would actually do — not what a sensible person would do by hand.

### Definition of done

- [ ] You can state, in your own words, the difference between a value and an operation, without describing one in terms of the other.
- [ ] You can explain why "addition" is worth naming as one reusable rule rather than treating every sum as its own unrelated event.
- [ ] You can name the arity of at least three different operations (not only the ones in this lesson) and give one example of a malformed use — the wrong number of operands — for one of them.
- [ ] You can trace the receipt calculation from Concept Unit 4 step by step, stating, for each step, which value is newly introduced and which values are operands carried forward from an earlier step.
- [ ] You can explain, using Lesson 1's _assumption_ and Lesson 2's _undefined case_ and _literal execution_, exactly why division by zero has no defined result and what a machine actually does when asked to compute it anyway.
- [ ] You completed Exercises 1–5 for a calculation of your own choosing, not the store-receipt example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which operation in your own example turned out to have a gap you hadn't noticed before deliberately checking for one.
