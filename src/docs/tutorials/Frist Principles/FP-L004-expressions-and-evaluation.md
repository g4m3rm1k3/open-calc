# Lesson 4: Expressions and Evaluation

**What you will build:** Still nothing runnable — this lesson names something that has been happening since Lesson 3 without a name for it: a combination of values and operations, considered as a whole, is an *expression*, and reducing it down to a single value is *evaluation*. The transferable problem this lesson is actually about: an expression can be ambiguous about the order it should be reduced in, in exactly the same way a plain-language request can be ambiguous about what it's actually asking — and the fix is the same kind of fix, an explicit rule, just applied to arithmetic notation instead of to English.

**What you need to know first:** Lesson 2 (`FP-L002-turning-ambiguity-into-precision.md`) — specifically *vague request* and *explicit rule*, both reused directly in Concept Unit 4. Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *value*, *operation*, *operand*, *arity*, and the receipt calculation's step-by-step sequence, which this lesson reveals was one expression the entire time.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Expression** — a combination of values and operations, considered as one whole, before it has been reduced to a single value. `(3 + 5) × (10 − 4)` is an expression; so was Lesson 3's entire five-step receipt calculation, even though it was never written as a single line. Naming "expression" matters because it lets a whole nested calculation be talked about as one thing, rather than only as a sequence of separate steps.
- **Subexpression** — an expression nested inside a larger one. In `(3 + 5) × (10 − 4)`, both `3 + 5` and `10 − 4` are subexpressions of the whole. Naming subexpressions explicitly is what makes it possible to say precisely which part of a larger expression is being worked on at any point during evaluation.
- **Evaluation** — the process of reducing an expression to a single value, by repeatedly replacing a subexpression with the value it stands for, until nothing is left but that one value. Evaluation is what Lesson 3's five numbered steps were doing all along, one reduction at a time, without yet having a name for the overall process.
- **Reduction step** — one single replacement of a subexpression with the value it evaluates to, during evaluation. Turning `3 + 5` into `8` inside a larger expression is one reduction step; a full evaluation is a sequence of these, one after another, until one value remains.
- **Precedence** — a stated rule for which operation in an expression gets evaluated first, when the expression's own written form doesn't settle the question on its own. Precedence exists for the same reason an explicit rule exists in Lesson 2: without one, an expression like `3 + 5 × 2` can be read more than one reasonable way, and different readers (or different machines) could disagree about its value while each feeling certain they read it correctly.
- **Well-formed expression** — an expression built so that every operation inside it has exactly the number of operands its arity requires, with no operand left dangling and none supplied in excess. A well-formed expression is not automatically one that can be fully evaluated (an operation inside it might still have no defined result for its actual operands) — it is only one built correctly enough to be evaluated at all.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain arithmetic notation, using a fresh expression, `(3 + 5) × (10 − 4)`, to examine evaluation closely, and briefly revisiting Lesson 3's receipt calculation to show it was an expression the whole time.

---

## Concept Unit 1: What an Expression Is

### The Problem

Lesson 3 computed a receipt total in five separate, numbered steps: multiply, multiply, add, multiply, add. Each step was shown on its own line, with its own result. But nothing about the underlying calculation actually required those five steps to be five separate events — they could just as well be written as one single, nested combination of values and operations: `(2 × 3.50 + 1 × 1.20) + (2 × 3.50 + 1 × 1.20) × 0.10`. Looked at this way, Lesson 3's whole calculation was one thing the entire time — a single combination of values and operations — and the five numbered steps were just one particular way of working through it, not a fact about the calculation itself. Something that has been treated only as "a sequence of steps" up to now deserves its own name, once it's recognized as a single object in its own right.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing a sequence of steps as one nested combination is a way of looking at arithmetic already shown in Lesson 3, not a construct with its own syntax.

### Applying It — A Clean Example

**A fresh expression, simpler than the receipt, to examine closely for the rest of this lesson:**

> `(3 + 5) × (10 − 4)`

**Confirming this is one combination, not yet reduced to a single value:** as written, this is not a value — it names two operations (addition, subtraction) and one operation combining their results (multiplication), all at once, with no single number yet produced.

**The receipt calculation, recognized the same way:** Lesson 3's total, `(2 × 3.50 + 1 × 1.20) + (2 × 3.50 + 1 × 1.20) × 0.10`, is exactly the same kind of thing — one large expression — even though Lesson 3 worked through it one numbered step at a time rather than writing it as a single line.

### Walkthrough

- **`(3 + 5) × (10 − 4)`** — first appearance of *expression*: a combination of values and operations, considered as one whole rather than as a sequence of separate steps.
- **"as written, this is not a value"** — establishes the key distinction this unit exists to draw: an expression, before evaluation, is not yet the value it will eventually reduce to.
- **The receipt calculation, rewritten as one line** — a reappearance, not a new concept: Lesson 3's step-by-step sequence, now recognized as the same kind of object just introduced, seen from a different angle.

### CS Lens

This is the idea of treating a nested combination of operations as one object, rather than only as a sequence of individually performed actions. Also recognized in: a mathematical formula written on one line, understood as a single object even though computing it by hand takes several steps; a spreadsheet cell's formula, `=(A1+A2)*B1`, treated as one thing even though the spreadsheet software performs several internal steps to compute it; an arithmetic expression typed into any calculator, entered as one line even though the calculator itself works through it piece by piece; a sentence in a natural language, understood as one unit of meaning even though it is built from smaller phrases nested inside it.

### SE Lens

The alternative to recognizing a sequence of steps as a single expression is to keep thinking of a calculation only as "whatever steps I happened to write down," with no single object to refer to as a whole. The real cost of that alternative showed up already in Lesson 3: nothing was said about whether performing the steps in a different order would still give the correct total, because there was no single object — an expression — whose value could be asked about independently of any one particular order of steps. Naming the whole nested combination as one expression costs nothing beyond recognizing what was already true, and it is exactly what makes the next unit's question — does the order of steps matter? — possible to ask precisely.

---

## Concept Unit 2: Subexpressions and Nesting

### The Problem

`(3 + 5) × (10 − 4)` is not one flat combination of three values and two operations all at the same level — it has structure. `3 + 5` is itself a complete little combination of a value, an operation, and another value; so is `10 − 4`. The multiplication is not combining four separate numbers at once; it is combining the *results* of those two smaller combinations. Seeing this nested structure clearly — which parts are expressions in their own right, sitting inside a larger expression — is necessary before evaluation can be discussed precisely, because evaluation is going to work by handling these smaller pieces first.

### No isolated lab for this step

This concept has no code of its own to isolate — identifying nested structure inside an already-written expression is an act of close reading, not a construct with its own syntax.

### Applying It — A Clean Example

**The same expression, its nested structure named explicitly:**

> `(3 + 5) × (10 − 4)`
> — the whole expression is a multiplication, whose two operands are themselves expressions: `3 + 5` and `10 − 4`.

**Each of those, confirmed to be complete expressions on their own:** `3 + 5` names two values (3 and 5) and one operation (addition) — nothing about it depends on anything outside itself. The same is true of `10 − 4`. Each could be written down and evaluated entirely on its own, with no reference to the multiplication surrounding it.

**Why this nesting matters for what comes next:** multiplication's arity is two (Lesson 3), and here its two operands are not bare values like 3 or 5 — they are themselves unevaluated expressions. Evaluating the whole thing will require dealing with those two subexpressions before the multiplication itself can be carried out at all.

### Walkthrough

- **"the whole expression is a multiplication, whose two operands are themselves expressions"** — first appearance of *subexpression*: naming `3 + 5` and `10 − 4` as expressions in their own right, nested inside the larger multiplication expression.
- **"each could be written down and evaluated entirely on its own"** — establishes that a subexpression is not merely a fragment of the larger expression, but a complete, self-sufficient expression by the same definition given in Concept Unit 1.
- **"multiplication's arity is two... here its two operands are not bare values"** — a reappearance of *arity* from Lesson 3, restated briefly rather than re-derived, now applied to an operation whose operands happen to be subexpressions rather than values read directly from the world.

### CS Lens

This is the idea of a structure containing smaller instances of the same kind of structure inside itself — an expression made of expressions. Also recognized in: a folder on a computer that can contain other folders, each one itself capable of containing folders; a sentence containing a clause that is itself a complete sentence, as in "she said [that he left]"; a company's organizational chart, where a division contains departments that are themselves organized the same way as the company overall; a family tree, where each person's ancestry is itself a smaller family tree.

### SE Lens

The alternative to recognizing nested subexpressions is to treat an expression like `(3 + 5) × (10 − 4)` as one flat list of four numbers and two operators, with no explicit structure connecting them. The real cost of that alternative is that "which numbers does the multiplication actually combine?" stops having a clear answer — without nesting, there is no principled way to say the multiplication combines the *results* of the addition and the subtraction, rather than, say, the 5 and the 10 directly. Naming the nested structure explicitly costs nothing beyond stating what the parentheses already show, and it is the only thing that makes "evaluate the addition, then use its result" a statement that means anything precise.

---

## Concept Unit 3: Evaluation as Repeated Reduction

### The Problem

An expression like `(3 + 5) × (10 − 4)` is not, by itself, a value — Concept Unit 1 established that directly. Getting from the expression to the single value it represents means doing something to it, repeatedly, until nothing is left but one number. That something is: find a subexpression made only of plain values (not further subexpressions), apply its operation, and replace the subexpression with the resulting value. Doing this once shrinks the expression a little. Doing it repeatedly, each time finding a subexpression that's now ready to be reduced, eventually leaves exactly one value and nothing else to reduce.

### No isolated lab for this step

This concept has no code of its own to isolate — evaluation is demonstrated directly, as a sequence of concrete reductions on the worked example below, rather than through a construct with its own syntax.

### Applying It — A Clean Example

**Evaluating `(3 + 5) × (10 − 4)`, one reduction step at a time:**

1. `3 + 5` is a subexpression made only of plain values (3 and 5) — ready to reduce. Applying addition: `3 + 5` becomes `8`. The expression is now `8 × (10 − 4)`.
2. `10 − 4` is now the only remaining subexpression made only of plain values — ready to reduce. Applying subtraction: `10 − 4` becomes `6`. The expression is now `8 × 6`.
3. `8 × 6` is itself a subexpression made only of plain values — ready to reduce. Applying multiplication: `8 × 6` becomes `48`.

**What's left after step 3:** just `48` — a single value, with no operations and no subexpressions remaining. Nothing further can be reduced, so evaluation is finished: the expression `(3 + 5) × (10 − 4)` evaluates to `48`.

**Connecting this directly to Lesson 3:** each of the three steps above is exactly one *reduction step*. Lesson 3's five numbered steps for the receipt total were doing precisely this — repeatedly replacing a ready subexpression with its value — without this lesson's vocabulary yet available to say so.

### Walkthrough

- **Step 1, `3 + 5` becomes `8`** — first appearance of *reduction step* shown concretely: one subexpression, made only of plain values, replaced by the single value it evaluates to.
- **Step 2, `10 − 4` becomes `6`** — a second reduction step, chosen because it was the only remaining subexpression made only of plain values at that point — not because of any rule about left-to-right order, which has not yet been discussed.
- **Step 3, `8 × 6` becomes `48`** — the final reduction step, applied once both of multiplication's operands were plain values rather than further subexpressions; this is a reappearance of *operand* from Lesson 3, now shown as something that starts out as a subexpression and becomes a plain value partway through evaluation.
- **"a single value, with no operations and no subexpressions remaining"** — first appearance of *evaluation* stated as a completed process: repeated reduction, stopping exactly when nothing further can be reduced.

### CS Lens

This is the idea of repeatedly simplifying a structure by replacing its smallest ready pieces, continuing until nothing more can be simplified — a process this curriculum will later call reduction to normal form. Also recognized in: simplifying a fraction by repeatedly dividing numerator and denominator by common factors until none remain; a calculator's internal evaluation of a typed-in formula, one operation at a time, until a single number is displayed; peeling back nested parentheses in an algebra problem, working from the innermost pair outward; a compiler evaluating a constant arithmetic expression in source code down to a single literal value before the program even runs.

### SE Lens

The alternative to evaluating by repeated, well-defined reduction steps is to try to compute a nested expression's value in one uncontrolled mental leap, the way Lesson 3 warned against for the receipt total. The real cost of that alternative, specifically for a nested expression like this one, is that there is no way to check partial progress — a wrong final answer gives no indication of which part of the nested structure the mistake happened in. Evaluating step by step, each reduction shown explicitly, costs a small amount of extra writing and buys the ability to check, or redo, any single step without having to recompute the whole expression from scratch.

---

## Concept Unit 4: Evaluation Order — Which Subexpression Goes First

### The Problem

In Concept Unit 3's evaluation, `3 + 5` happened to be reduced before `10 − 4` — but nothing forced that particular order. Both subexpressions were equally ready to be reduced from the very first step; the addition was simply worked on first because it was written first. Does the final answer depend on that choice? And a more serious version of the same question: some expressions don't even have parentheses marking their structure clearly at all — `3 + 5 × 2`, for instance. Read one way, "add 3 and 5, then multiply by 2," it comes to 16. Read the other way, "multiply 5 and 2, then add 3," it comes to 13. This is not a hypothetical concern; it is exactly Lesson 2's vague request, transplanted into arithmetic notation — the same symbols, admitting more than one reasonable reading, with no rule stated inside the expression itself to settle which one is meant.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing two different evaluation orders, and comparing two different readings of an unparenthesized expression, are demonstrated directly below rather than through a construct with its own syntax.

### Applying It — A Clean Example

**Re-evaluating `(3 + 5) × (10 − 4)`, this time reducing `10 − 4` first instead of `3 + 5`:**

1. `10 − 4` reduces to `6`. The expression is now `(3 + 5) × 6`.
2. `3 + 5` reduces to `8`. The expression is now `8 × 6`.
3. `8 × 6` reduces to `48`.

**Comparing the two orders directly:** Concept Unit 3 reduced the addition first and reached 48. This time the subtraction was reduced first, and the result is still 48. For this expression, the choice of which ready subexpression to reduce first did not affect the final value at all — only the order the intermediate steps were written down in.

**The genuinely ambiguous case, where order is not merely a choice but an actual disagreement about meaning:** `3 + 5 × 2`, with no parentheses at all. Reading it as "(3 + 5) × 2" gives 16. Reading it as "3 + (5 × 2)" gives 13. Unlike the two orders just compared above, these two readings do not agree — they are not the same expression evaluated in two different orders, they are two different expressions, because the parentheses that would pin down the nesting were never written.

**Resolving the ambiguity with an explicit rule, exactly as Lesson 2 resolved "the students who passed":** standard arithmetic notation states, in advance, that multiplication and division are always carried out before addition and subtraction, unless parentheses say otherwise. This rule — precedence — is what turns `3 + 5 × 2` from an ambiguous phrase into a single, settled expression: multiplication first, so `5 × 2` reduces to `10`, then `3 + 10` reduces to `13`.

### Walkthrough

- **Re-evaluating with `10 − 4` reduced first** — demonstrates that, for an expression whose nesting is already fully pinned down by parentheses, the order two *independent*, unrelated subexpressions are reduced in does not change the final value.
- **`3 + 5 × 2`, read two conflicting ways** — first appearance of a genuinely ambiguous expression, deliberately parallel to Lesson 2's "give me the students who passed": two equally reasonable readings, silently disagreeing.
- **"standard arithmetic notation states, in advance, that multiplication and division are always carried out before addition"** — first appearance of *precedence*, stated as an explicit rule resolving the ambiguity, in the same role Lesson 2's explicit rule played for the vague request about passing grades.
- **The resolved evaluation, `5 × 2` then `3 + 10`** — a reappearance of ordinary reduction (Concept Unit 3), now applied to the one specific reading precedence selects, rather than to whichever reading a reader happened to guess.

### CS Lens

This is the difference between an order of operations that is a free choice with no effect on the outcome, and one that must be pinned down by an explicit rule because the outcome genuinely depends on it. Also recognized in: a programming language's own operator precedence table, resolving exactly this kind of ambiguity for source code the same way standard notation resolves it for arithmetic; a legal contract's stated order for resolving conflicting clauses, needed precisely because different orderings would produce different obligations; a recipe specifying "add the eggs, then the flour," when doing it the other way around would genuinely change the result; a database query's join order, which can affect performance and, in some cases, even the result, unless the query engine's own rules pin it down.

### SE Lens

The alternative to stating a precedence rule is to leave an unparenthesized expression's meaning to whoever — or whatever — happens to be reading it, trusting shared convention to resolve it silently. The real cost of that alternative is exactly Lesson 2's cost, applied to arithmetic: two readers, or two different pieces of software, can each apply a locally reasonable rule (strict left-to-right, say, versus standard precedence) and arrive at genuinely different values for the same written expression, each confident they read it correctly. Stating precedence explicitly, once, as part of how expressions are written and read at all, costs nothing per expression and removes this entire disagreement before it can occur.

---

## Concept Unit 5: A Well-Formed Expression Evaluates to Exactly One Value

### The Problem

Concept Unit 4 showed that once an expression's structure is fully pinned down — by parentheses, or by precedence filling in for missing parentheses — the order in which independent, unrelated subexpressions happen to be reduced does not change the final value. But that guarantee has a quiet assumption riding on it, the same kind Lesson 3 named for a single operation: every operation actually encountered during evaluation has to have a defined result for the operands it receives. If some subexpression, anywhere inside a larger one, turns out to be a division by zero, there is no order of reduction that rescues the overall expression — it simply has no value, no matter which ready subexpression gets reduced first.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that a single undefined subexpression breaks the whole expression's evaluation is demonstrated directly below, not through a construct with its own syntax.

### Applying It — A Clean Example

**A well-formed expression, checked against Lesson 3's arity requirement before anything else:**

> `(3 + 5) × (10 − 4)` — addition, subtraction, and multiplication each have exactly two operands here. This expression is well-formed.

**The same expression, with one operand deliberately changed to introduce an undefined subexpression:**

> `(3 + 5) × (4 ÷ 0)`

**Trying every possible reduction order, to show none of them helps:** reduce `3 + 5` first — it becomes `8`, leaving `8 × (4 ÷ 0)`; the division by zero is still sitting there, unavoidable. Reduce `4 ÷ 0` first instead — Lesson 3, Concept Unit 5, already established this has no value to produce at all; there is no number to replace it with, so this reduction cannot even be completed, in either order.

**The conclusion, stated directly:** a well-formed expression (correct arity everywhere) is not automatically a fully evaluable one. `(3 + 5) × (4 ÷ 0)` is well-formed — every operation has the right number of operands — and still has no value, because one specific operand combination, `4 ÷ 0`, is outside what division is defined for.

### Walkthrough

- **"addition, subtraction, and multiplication each have exactly two operands here"** — a reappearance of *well-formed expression*, checking the original clean example against the arity requirement first named in Lesson 3.
- **`(3 + 5) × (4 ÷ 0)`** — introduces a single undefined subexpression into an otherwise well-formed expression, to isolate exactly what breaks.
- **Trying both reduction orders and finding the division unavoidable either way** — not a new concept, but the direct demonstration that Concept Unit 4's "order doesn't matter" guarantee assumed every subexpression actually has a value to reduce to; when one doesn't, no choice of order changes that.
- **"a well-formed expression... is not automatically a fully evaluable one"** — a reappearance of Lesson 3's undefined-operation idea, now stated at the level of a whole expression rather than a single operation.

### CS Lens

This is the distinction between an expression being syntactically correct — built with the right shapes in the right places — and being semantically defined — actually reducible to a value. Also recognized in: a grammatically correct sentence that is nonetheless meaningless, like "colorless green ideas sleep furiously"; a well-formed mathematical formula that is undefined at a specific point, like `1 / (x − 3)` at `x = 3`; a syntactically valid line of program code that compiles cleanly and still crashes the moment it actually runs; a well-structured legal clause that is nonetheless unenforceable because it asks for something impossible.

### SE Lens

The alternative to distinguishing "well-formed" from "evaluates to a value" is to assume that anything which looks structurally correct must also be safe to evaluate. The real cost of that assumption is that it hides exactly the failure this unit demonstrates: an expression can pass every check on its shape — correct arity throughout, properly nested, unambiguous precedence — and still fail the moment evaluation actually reaches the one subexpression whose operands it was never defined for. Checking for this separately, rather than trusting shape alone, costs one more pass over the expression, and is the only way to catch a division-by-zero or similarly undefined subexpression before evaluation is attempted for real rather than after it fails partway through.

---

## Closing

### Connect the pieces

One expression, traced through every unit built in this lesson, start to finish:

1. **Recognized as one expression (Unit 1):** `(3 + 5) × (10 − 4)`, and Lesson 3's receipt total, both named as single combinations of values and operations rather than only as sequences of steps.
2. **Its nested structure named (Unit 2):** the whole expression is a multiplication whose two operands are themselves the subexpressions `3 + 5` and `10 − 4`.
3. **Evaluated by repeated reduction (Unit 3):** `3 + 5 → 8`, then `10 − 4 → 6`, then `8 × 6 → 48`.
4. **Re-evaluated in the other order, and an ambiguous case resolved by precedence (Unit 4):** `10 − 4 → 6` first, then `3 + 5 → 8`, then `8 × 6 → 48` — same final value; separately, `3 + 5 × 2` shown to require precedence to mean only one thing, `13`, rather than two disagreeing things.
5. **Checked for a hidden undefined subexpression (Unit 5):** `(3 + 5) × (4 ÷ 0)` — well-formed by arity, but unevaluable in either reduction order, because `4 ÷ 0` has no value to contribute regardless of when it's reached.

Unit 5's undefined case is not a new example invented from nothing — it is Unit 1's clean expression, deliberately modified in exactly one place, to show precisely what a single undefined subexpression does to an otherwise ordinary evaluation.

### What breaks without this

Suppose Unit 4's precedence rule were never established, and two different simple calculators were built, each evaluating typed-in expressions strictly left to right with no concept of precedence at all versus each correctly applying multiplication before addition. Both are handed the exact same input: `3 + 5 × 2`. The left-to-right calculator reduces `3 + 5` first (reading left to right, encountering `+` before `×`), getting `8`, then `8 × 2`, getting `16`. The precedence-aware calculator reduces `5 × 2` first regardless of reading order, getting `10`, then `3 + 10`, getting `13`. Both calculators are functioning exactly as built — neither has a bug — and yet they disagree about the value of an expression that looks identical on both screens. Nobody typing `3 + 5 × 2` into either device would necessarily notice anything wrong; each calculator confidently displays an answer. The failure is invisible until the same expression is checked on both devices side by side, or until a result computed on one disagrees with a result expected from standard mathematical convention. Restoring Unit 4's stated precedence rule — multiplication and division before addition and subtraction, universally, unless parentheses override it — removes the disagreement by removing the second, nonstandard reading entirely; there is no longer a legitimate alternative interpretation left for either calculator to (correctly, by its own rules) arrive at.

### Exercises

1. **Observe.** Write `4 + 2 × 3 − 1` as fully parenthesized, showing exactly which operation groups with which, according to standard precedence (multiplication and division before addition and subtraction).
2. **Predict.** Before evaluating: does `(6 − 2) × (1 + 4)` give the same value regardless of whether the subtraction or the addition is reduced first? Predict yes or no, then evaluate both orders to check, the way Concept Unit 4 checked `(3 + 5) × (10 − 4)`.
3. **Formalize.** Take any three-operation expression of your own choosing that uses at least one pair of parentheses. Identify every subexpression in it, the way Concept Unit 2 identified `3 + 5` and `10 − 4` inside the larger multiplication.
4. **Explain.** For the expression you wrote in Exercise 3, evaluate it step by step, writing out every reduction step explicitly, the way Concept Unit 3 did — do not skip to the final answer.
5. **Formalize.** Modify your Exercise 3 expression so that exactly one subexpression becomes undefined (introduce a division by zero somewhere inside it). Try evaluating in two different reduction orders, the way Concept Unit 5 did for `(3 + 5) × (4 ÷ 0)`, and confirm that neither order produces a value.

### Definition of done

- [ ] You can state, in your own words, the difference between an expression and the value it evaluates to.
- [ ] You can identify every subexpression in a three-operation expression, including the whole expression itself as the outermost one.
- [ ] You can evaluate an expression step by step, writing out each reduction explicitly, rather than jumping straight to a final answer.
- [ ] You can explain, using Lesson 2's vocabulary, why `3 + 5 × 2` is ambiguous without a stated precedence rule, and what precedence does to resolve it.
- [ ] You can explain why a well-formed expression (correct arity throughout) is not automatically guaranteed to evaluate to a value, using a division-by-zero example of your own.
- [ ] You completed Exercises 1–5 for an expression of your own choosing, not `(3 + 5) × (10 − 4)`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which of your two reduction orders in Exercise 5 you expected to "get further" before hitting the undefined subexpression, and whether that expectation was right.
