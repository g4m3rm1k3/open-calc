# Lesson 10: Boolean Values

**What you will build:** Still nothing runnable — this lesson names what a statement like `subtotal ≥ 0` actually evaluates to. Lesson 9 wrote statements exactly like it, over and over, saying a precondition "holds" or "fails" — without ever naming what kind of thing "holds" or "fails" actually are, or how they fit into evaluation as already established. This lesson names them directly: `true` and `false`, a second kind of value, produced by a new kind of operation. The transferable problem this lesson is actually about: every check this curriculum has performed so far by eye — is this precondition satisfied, does this edge case apply, does this constraint hold — has secretly been a small computation the whole time, one this lesson finally makes explicit.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *value* and *operation*, both directly extended here to a new kind of value and a new category of operation. Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically *expression* and *reduction*, reused unchanged. Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically the precondition and postcondition checks performed by hand throughout, which this lesson reveals were Boolean computations the entire time.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Boolean value** — one of exactly two values, `true` or `false`, representing whether a statement holds. A Boolean value is a value in exactly Lesson 3's sense — self-contained, complete, indifferent to whatever produced it — but it is not a number, and none of Lesson 3's arithmetic operations (addition, multiplication) apply to it; `true + false` is as meaningless as trying to add a color to a sound.
- **Comparison operation** — an operation, in Lesson 3's sense, that takes values (often numbers) as operands and produces a Boolean value as its result, rather than another number. `≥`, `<`, `=`, and `≠` are comparison operations: each takes two operands and reduces to either `true` or `false`, never to a number.
- **Boolean expression** — an expression, in Lesson 4's sense, that evaluates to a Boolean value rather than to a number. `subtotal ≥ 0` is a Boolean expression once `subtotal` is bound to something; it evaluates through exactly the same reduction process as any other expression, ending at `true` or `false` instead of at a number.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, re-examining Lesson 9's precondition checks on `total_with_tax` closely.

---

## Concept Unit 1: What Kind of Thing Is "subtotal ≥ 0"?

### The Problem

Lesson 9 wrote "`subtotal ≥ 0` holds" and "`0 ≤ tax_rate < 1` fails" repeatedly, checking each one by eye against specific numbers, without ever asking what `subtotal ≥ 0` actually *is*. It looks like an expression — it has operands (`subtotal` and `0`) and something connecting them (`≥`) — exactly the shape Lesson 4 already described. But Lesson 4's expressions all evaluated to numbers: `(3 + 5) × (10 − 4)` reduces to `48`. `subtotal ≥ 0`, once `subtotal` is bound to an actual number, clearly does not reduce to a number at all — it reduces to whatever "holds" or "fails" actually refers to, and neither of those words has been given a formal home in this curriculum yet.

### No isolated lab for this step

This concept has no code of its own to isolate — noticing the gap in Lesson 9's informal language is a matter of examining that lesson's own wording closely, not a construct with its own syntax.

### Applying It — Total With Tax's Precondition, Re-examined

**A specific instance from Lesson 9, re-read closely:** "`subtotal ≥ 0` holds," checked for `subtotal = 8.20`.

**What this sentence is actually doing, made explicit:** it is evaluating `8.20 ≥ 0` — a combination of two operands and a symbol between them, in every visible respect shaped exactly like `3 + 5` — and reporting the result using the word "holds," rather than reporting a number.

**The gap, stated directly:** Lesson 4 built a whole reduction process for expressions like `3 + 5`, ending at a number. `8.20 ≥ 0` has the same shape, follows what should be the same kind of process, and yet Lesson 9 only ever described its result in prose — "holds," "fails" — never as an actual value the way `8` is the actual value `3 + 5` reduces to.

### Walkthrough

- **"`subtotal ≥ 0` holds," checked for `subtotal = 8.20`** — a reappearance of Lesson 9's precondition-checking language, examined here for the first time as a candidate expression rather than as an informal statement.
- **"in every visible respect shaped exactly like `3 + 5`"** — establishes the direct parallel to Lesson 4's expressions: two operands, one operation, arranged the same way.
- **"never as an actual value"** — not a new concept, but the precise statement of the gap this whole lesson exists to close.

### CS Lens

This is the observation that a check performed by eye — does this condition hold? — has exactly the same shape as an ordinary calculation, and can be treated as one rather than left as an informal judgment call. Also recognized in: any verification step in mathematics or engineering that gets described in prose ("this satisfies the requirement") without ever being written as the actual expression it's shorthand for; a yes-or-no answer given verbally, which could just as easily be written down as a specific, nameable value; a pass/fail grade on a test, which is a judgment stated in words but is really the output of checking a condition against a cutoff, exactly the way Lesson 2's passing rule worked.

### SE Lens

The alternative to naming what a condition check actually evaluates to is to keep describing such checks only in prose — "holds," "fails," "is satisfied" — treating them as judgment calls rather than as computations with an actual result. The real cost of that alternative is that nothing built so far in this curriculum — binding, substitution, reduction, functions, composition — can be applied to a condition check, because none of it has anywhere to plug in; a "holds" or "fails" that isn't an actual value can't be passed as an argument, combined with another check, or reasoned about the way an ordinary value can. Naming what these checks actually produce, the subject of the rest of this lesson, costs nothing beyond recognizing what condition-checking already was, and immediately makes every tool already built in this curriculum available to work with it.

---

## Concept Unit 2: Boolean Values — a New Kind of Value

### The Problem

Concept Unit 1 established that `8.20 ≥ 0` should reduce to something, the way `3 + 5` reduces to `8`. That something is not a number — there is no sensible number that "8.20 is at least 0" could mean. What's needed is a name for exactly two possible results: one meaning the statement holds, one meaning it does not. These two, and nothing else, are what a condition check like this can ever produce.

### No isolated lab for this step

This concept has no code of its own to isolate — naming these two values is done directly below, not through a construct with its own syntax.

### Applying It — the Two Values

**The two values, named directly:** `true`, meaning a statement holds, and `false`, meaning it does not. Together, these are called Boolean values.

**Confirming they are values in exactly Lesson 3's sense:** each is self-contained, complete on its own, and indifferent to whatever produced it — `true` produced by checking `8.20 ≥ 0` is the same `true` that would be produced by checking any other statement that happens to hold, exactly the way Lesson 3's `3.50` was the same value whether it came from a price tag or from `7.00 ÷ 2`.

**Confirming they are not numbers:** nothing in Lesson 3 defined what `true + false` should mean, because addition was defined for numbers, and a Boolean value is not one. Asking "what is `true` plus `false`?" is not a hard arithmetic problem with an answer waiting to be found; it is a question that doesn't apply at all, the same way asking "what is the sum of the colors red and blue?" doesn't describe an arithmetic problem either.

### Walkthrough

- **`true` and `false`, named directly** — first appearance of *Boolean value*: two values, and only two, representing whether a statement holds.
- **The comparison to Lesson 3's `3.50`, produced two different ways** — a reappearance of *value* from Lesson 3, applied here to confirm that a Boolean value behaves like any other value: self-contained, indifferent to its origin.
- **"`true + false`... doesn't describe an arithmetic problem at all"** — establishes explicitly that Boolean values are not numbers, and that Lesson 3's arithmetic operations simply don't apply to them.

### CS Lens

This is the idea of a value type with exactly two members, used specifically to represent whether something holds — the smallest possible set of distinct values still capable of representing a genuine yes-or-no distinction. Also recognized in: a light switch, on or off, with no third position; a coin's two faces, heads or tails; a checkbox on a form, checked or unchecked; a simple yes/no question on a survey, deliberately designed to permit only two possible answers.

### SE Lens

The alternative to introducing a distinct kind of value for "holds" or "doesn't" is to reuse numbers for the purpose — for instance, letting `0` mean false and any other number mean true, a convention some systems actually use. The real cost of that alternative is a loss of precision about intent: a `0` used this way could mean "false," or it could mean "the number zero, meant as an ordinary quantity," and nothing about the number itself distinguishes which is meant, inviting exactly the kind of silent misreading Lesson 2 already warned about. Introducing Boolean values as their own distinct kind of value costs the small overhead of a second kind of value to keep track of, and buys a value that can only ever mean "this holds" or "this does not," with no risk of being confused for an ordinary quantity.

---

## Concept Unit 3: Comparison Operations — Operations That Produce Boolean Values

### The Problem

`8.20 ≥ 0` needs to actually reduce to `true`, not just be described, informally, as something that "should" produce it. Lesson 3 already defined what an operation is: a rule taking operands and producing a value. Nothing in that definition required the value produced to be a number — it only required a value. `≥` fits Lesson 3's definition of an operation exactly; it simply happens to be one whose result is always a Boolean value rather than a number.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing `≥` as an ordinary operation under Lesson 3's own definition is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Total With Tax's Precondition, Evaluated for Real

**`≥`, checked against Lesson 3's definition of operation:** it takes operands (two values) and produces a value (a Boolean value) — every requirement Lesson 3 stated is met. Its arity (Lesson 3) is two, exactly like addition's.

**Evaluating `8.20 ≥ 0` as an ordinary operation applied to its operands:** `8.20` and `0` are the operands; `≥` compares them and produces `true`, because 8.20 is indeed at least 0.

**Evaluating `−8.20 ≥ 0` the same way:** `−8.20` and `0` are the operands; `≥` compares them and produces `false`, because −8.20 is not at least 0.

**A second comparison operation, to confirm this isn't specific to `≥`:** `0.10 < 1` — the operands are `0.10` and `1`; `<` compares them and produces `true`, since 0.10 is indeed less than 1.

### Walkthrough

- **`≥`, checked against Lesson 3's operation definition** — a reappearance of *operation*, *operand*, and *arity* from Lesson 3, applied here to confirm a comparison fits that same definition exactly, differing only in what kind of value it produces.
- **`8.20 ≥ 0` reducing to `true`** — first appearance of *comparison operation* shown producing an actual Boolean value, resolving Concept Unit 1's original gap directly.
- **`−8.20 ≥ 0` reducing to `false`** — the same operation, different operands, confirming both possible Boolean values are genuinely reachable outcomes of the same operation.
- **`0.10 < 1` reducing to `true`** — a second comparison operation, chosen specifically to confirm this behavior is general, not a coincidence specific to `≥`.

### CS Lens

This is the recognition that an operation's definition — take operands, produce a value — never actually required the result to be the same kind of thing as the operands, once that's looked at closely. Also recognized in: a thermometer, which takes a physical temperature as input and produces a number as output, two entirely different kinds of thing; a scale's pass/fail quality check on a manufactured part, taking a physical measurement and producing a yes-or-no judgment rather than another measurement; a judge in a competition, taking a performance as input and producing a score or a verdict, not another performance; a smoke detector, taking particles in the air as input and producing an alarm state, on or off, as output.

### SE Lens

The alternative to recognizing comparisons as ordinary operations is to treat them as a fundamentally different, special kind of thing, disconnected from Lesson 3's operations and requiring their own separate rules. The real cost of that alternative is duplicated machinery: a whole new theory of "how comparisons work" would be needed, when in fact Lesson 3's operand/arity framework already covers them completely. Recognizing comparison operations as ordinary operations that happen to produce Boolean values costs nothing — it is simply noticing what was already true — and it means every tool built for operations in general applies to comparisons without modification.

---

## Concept Unit 4: Boolean Expressions Evaluate Exactly Like Any Other

### The Problem

Concept Unit 3 evaluated `8.20 ≥ 0` directly, with the number already in place. Lesson 9's actual precondition was written in terms of a parameter, `subtotal ≥ 0`, not a specific number — meaning it needs Lesson 5's substitution and Lesson 4's reduction, exactly the way any other name-containing expression does, before it can be evaluated at all. Nothing new is required here; this unit exists specifically to confirm that a Boolean expression is not a special case needing its own evaluation rules — it goes through the exact same process as `batches × cups_per_batch` did in Lesson 5, ending at a Boolean value instead of a number purely because of which operation is at its root.

### No isolated lab for this step

This concept has no code of its own to isolate — evaluating a name-containing Boolean expression is demonstrated directly below, reusing Lesson 5's substitution and Lesson 4's reduction unchanged, not through a new construct with its own syntax.

### Applying It — Total With Tax's Precondition, in Full

**The precondition clause, as actually written in Lesson 9, containing a name rather than a fixed number:** `subtotal ≥ 0`.

**The environment (Lesson 5), for an application where `subtotal` is bound to 8.20:** `subtotal → 8.20`.

**Substituting (Lesson 5), exactly as any other name-containing expression:** `subtotal ≥ 0` becomes `8.20 ≥ 0`.

**Reducing (Lesson 4), exactly as any other expression made only of values:** `8.20 ≥ 0` is a subexpression made only of plain values, ready to reduce — applying the comparison operation, it becomes `true`.

**Confirming this is the entire process, with nothing added:** substitution did not need to know it was substituting into a Boolean expression rather than an arithmetic one; reduction did not need special-case logic for comparisons. Both mechanisms, exactly as already defined, handled this correctly without modification.

### Walkthrough

- **`subtotal ≥ 0`** — a reappearance of Lesson 9's actual precondition clause, now traced through evaluation for the first time rather than checked informally by eye.
- **`subtotal → 8.20`, and substitution producing `8.20 ≥ 0`** — a direct reappearance of *binding* and *substitution* from Lesson 5, applied without modification to a Boolean expression.
- **Reduction producing `true`** — a direct reappearance of *reduction* from Lesson 4, likewise applied without modification, differing only in that a comparison operation, rather than an arithmetic one, sits at the root of the expression.
- **"neither mechanism needed to know"** — not a new concept, but the explicit confirmation that this unit's point holds: Boolean expressions are not a special case requiring new evaluation machinery.

### CS Lens

This is the fact that a general-purpose evaluation process, built without assuming anything about what kind of value an expression produces, keeps working correctly even when a genuinely new kind of value is introduced into the system. Also recognized in: a general sorting procedure that works correctly on any kind of comparable data, not just numbers, because it was built around comparison rather than around numbers specifically; a shipping system that handles a new category of product correctly because it was built around "items with a weight and dimensions," not around any one specific product type; a general-purpose calculator app whose display and input logic work identically whether the calculation involves whole numbers or fractions, because neither was hard-coded in; a translation process that handles a newly added language correctly because it was built around "text in, text out," not around any one specific language's grammar.

### SE Lens

The alternative to reusing Lesson 4 and Lesson 5's existing mechanisms is to build separate substitution and reduction logic specifically for Boolean expressions, on the assumption that a new kind of value needs its own new machinery. The real cost of that alternative would be exactly the duplicated-complexity cost Lesson 5, Concept Unit 4, already warned about: two parallel evaluation systems to maintain, test, and keep consistent with each other, when in fact nothing about substitution or reduction, as originally defined, ever assumed the values involved had to be numbers. Confirming that the existing mechanisms already handle Boolean expressions correctly, as this unit does, costs nothing beyond checking — and is exactly why Lesson 4 and Lesson 5 were worth defining generally in the first place, rather than narrowly around arithmetic alone.

---

## Concept Unit 5: Where Boolean Values Have Been Hiding All Along

### The Problem

Now that Boolean values, comparison operations, and Boolean expression evaluation are all named precisely, it's worth looking back across this curriculum and recognizing how often this exact machinery was already being used, informally, without a name. Lesson 1's constraints, Lesson 2's edge-case checks, and Lesson 9's entire precondition-and-postcondition framework all involved asking, over and over, whether some condition held — every one of those was quietly a Boolean computation the whole time.

### No isolated lab for this step

This concept has no code of its own to isolate — this unit is a retrospective review of earlier lessons' language, not a construct with its own syntax.

### Applying It — Retracing Earlier Lessons

**Lesson 1's constraint, re-read with this lesson's vocabulary:** "the output must be a permutation of the input" is a condition that, for any specific candidate output, either holds or doesn't — exactly a Boolean expression, even though Lesson 1 had no name yet for what checking it actually produces.

**Lesson 2's edge case check, re-read the same way:** "`60 ≥ 60` is true" — Lesson 2 used the very word "true" already, in Concept Unit 3, without yet having defined what it formally meant as a value in its own right. This lesson is where that word finally gets its proper definition.

**Lesson 9's contract, re-read the same way:** "if `subtotal ≥ 0` and `0 ≤ tax_rate < 1`" is a statement built entirely out of Boolean expressions — this lesson's Concept Unit 4 already showed exactly how one of its two clauses evaluates; the other evaluates by the identical process.

### Walkthrough

- **Lesson 1's permutation constraint, re-examined** — not a new concept, but a demonstration that Boolean values were implicitly present from this curriculum's very first lesson, long before they had a name.
- **Lesson 2's "`60 ≥ 60` is true," re-examined** — points out directly that the word "true" was already used, informally, in Lesson 2, and is only now given a formal definition as an actual value.
- **Lesson 9's full contract, re-examined** — confirms that an entire earlier lesson's central idea (contracts) rests on Boolean expressions throughout, even though Lesson 9 itself never needed to name them to be correct.

### CS Lens

This is the pattern of a concept being used correctly, informally, well before it is ever named or formalized — a common shape in how ideas actually get discovered and refined. Also recognized in: arithmetic being used correctly by merchants for millennia before formal number theory named and organized the properties behind it; native speakers using grammatically correct sentences their entire lives before ever learning formal grammar's names for what they were already doing; engineers building working bridges using implicit force-balancing reasoning long before Newtonian mechanics formally named the laws behind it; programmers writing working code using informal trial and error long before formal methods named and systematized the reasoning behind why it worked.

### SE Lens

The alternative to going back and naming what was already happening informally is to treat Lessons 1, 2, and 9 as finished, and this lesson as introducing something entirely unrelated to them. The real cost of that alternative is a curriculum that feels like a collection of separate topics rather than one continuous development — exactly what this curriculum's own stated philosophy warns against. Explicitly tracing Boolean values back through earlier lessons costs a short retrospective pass, and it is what turns "here's a new topic, Boolean values" into "here's the name for something you were already doing correctly, several lessons ago."

---

## Closing

### Connect the pieces

One precondition, traced through every unit built in this lesson, start to finish:

1. **The gap exposed (Unit 1):** Lesson 9's "`subtotal ≥ 0` holds" is shaped exactly like an expression, with no named value for what it evaluates to.
2. **Boolean values, named (Unit 2):** `true` and `false` — a second kind of value, distinct from numbers, produced specifically to fill that gap.
3. **Comparison operations, named (Unit 3):** `≥`, `<`, and others, shown to be ordinary Lesson 3 operations that happen to produce Boolean values — `8.20 ≥ 0` reducing to `true`, `−8.20 ≥ 0` reducing to `false`.
4. **Full evaluation, with a name in the expression (Unit 4):** `subtotal ≥ 0`, bound, substituted, and reduced to `true`, using Lesson 4 and Lesson 5's mechanisms completely unmodified.
5. **The retrospective (Unit 5):** Lessons 1, 2, and 9 all shown to have relied on Boolean computation informally, well before this lesson gave it a name.

Unit 4's fully traced evaluation is the exact clause Unit 5 goes on to point back at inside Lesson 9's contract — the same expression, examined in full here, recognized as already present there.

### What breaks without this

Suppose Boolean values were never named, and every condition check in this curriculum had to keep being described only in prose, the way Lesson 9 originally did — "holds," "fails," "is satisfied." A precondition combining two separate clauses, like Lesson 9's "`subtotal ≥ 0` and `0 ≤ tax_rate < 1`," has no way to be *combined* at all without a named value for each clause's result — "holds and holds" is not itself an expression that any mechanism in this curriculum can evaluate, because nothing has ever been defined about combining two prose descriptions. Checking a combined precondition would have to fall back to eyeballing both clauses separately and informally deciding whether "both hold," with no way to write that combination down as its own checkable expression, and no way to reuse it, name it, or pass it to another function the way any other value can be. Naming Boolean values fixes this directly, and sets up exactly what the next lesson needs: a way to combine two Boolean values — like the results of `subtotal ≥ 0` and `0 ≤ tax_rate < 1` — into one, using operators built for that exact purpose.

### Exercises

1. **Observe.** Find a sentence in one of your own answers to an earlier lesson's exercises that describes something as "holding," "being true," "failing," or "being satisfied." Rewrite it as an explicit comparison expression, the way Concept Unit 1 rewrote "`subtotal ≥ 0` holds."
2. **Predict.** For the expression you wrote in Exercise 1, predict whether it evaluates to `true` or `false` for a specific case from your own earlier work, before actually reducing it.
3. **Formalize.** Write two different comparison expressions (using at least two different comparison operations, such as `<`, `>`, `=`, or `≠`) involving a name that needs to be bound to a value first, the way `subtotal ≥ 0` needed `subtotal` bound.
4. **Explain.** For each expression in Exercise 3, write out the full binding, substitution, and reduction sequence, the way Concept Unit 4 did for `subtotal ≥ 0`, ending at an actual Boolean value.
5. **Explain.** Choose one operation from Lesson 3 (like addition) and explain, in your own words, why applying it to a Boolean value (`true + 1`, for instance) does not describe a meaningful calculation, the way Concept Unit 2 explained `true + false`.

### Definition of done

- [ ] You can state, in your own words, why a Boolean value is a value in Lesson 3's sense, while also not being a number.
- [ ] You can identify a comparison operation's operands and confirm its arity, the way Concept Unit 3 confirmed `≥`'s arity is two.
- [ ] You can evaluate a name-containing Boolean expression step by step — binding, substitution, reduction — ending at `true` or `false`.
- [ ] You can point to at least one place in an earlier lesson (your own exercises or the lesson text) where a Boolean computation was happening informally, before this lesson gave it a name.
- [ ] You completed Exercises 1–5 using expressions of your own choosing, not `subtotal ≥ 0`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which earlier lesson's exercise, in hindsight, was most clearly doing Boolean computation without naming it.
