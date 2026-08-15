# Lesson 7: Functions as Transformations

**What you will build:** Still nothing runnable — this lesson gives a name to something Lessons 1 through 6 have been building toward without ever quite assembling: a *function*, a rule you define yourself, taking named input and producing output, reusable across as many different inputs as you like — exactly like Lesson 3's built-in operations, except this time you get to write the rule instead of arithmetic supplying it for you. The transferable problem this lesson is actually about: a calculation worked out once, for one set of numbers, stays tied to those numbers forever unless it's given a name and a way to accept different numbers each time it's used — which is exactly what a function is for.

**What you need to know first:** Lesson 1 (`FP-L001-what-is-a-problem.md`) — specifically Concept Unit 3's move from a specific instance to a general computational problem, and the *input*/*output* vocabulary, both completed by this lesson. Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *operation*, *operand*, and *arity*, all directly generalized here. Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically *expression* and *reduction*, reused in Concept Unit 4. Lesson 5 (`FP-L005-names-and-bindings.md`) — specifically *name*, *binding*, *environment*, and *substitution*, all reused directly and extended in Concept Units 2 and 4.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Function** — a named, reusable rule that takes one or more named inputs and produces an output, defined once and usable for as many different inputs as needed. A function is to a calculation you write yourself what addition (Lesson 3) is to arithmetic's own built-in operations: a fixed rule, applicable uniformly across many different values, except this time the rule itself is something you get to define.
- **Parameter** — a name appearing in a function's definition that stands for "whatever value will be supplied when the function is used," not bound to anything specific at definition time. A parameter is a name (Lesson 5) of a distinct kind: an ordinary bound name already has a value the moment it's introduced; a parameter deliberately does not, until the function it belongs to is actually applied.
- **Argument** — the actual value supplied for a parameter on one specific use of a function. `total_with_tax(8.20, 0.10)` supplies the arguments 8.20 and 0.10; `subtotal` and `tax_rate` are the function's parameters, waiting to receive whichever arguments a given use provides. Keeping these two words distinct matters because "parameter" names a placeholder in the definition, while "argument" names a specific value on one occasion of using it — conflating them makes it impossible to say precisely which one an error report or a question is actually about.
- **Function body** — the expression, written in terms of a function's parameters, that defines what the function actually computes. In `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`, everything after the `=` is the function body.
- **Application** — the act of using a function on a specific set of arguments: binding each parameter to its corresponding argument, substituting those bindings into the function body, and evaluating the result. Applying `total_with_tax` to 8.20 and 0.10 is one application of the function; applying it to different arguments is a different application of the exact same function.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using one running example — a reusable rule for computing a total price including tax, built directly on Lesson 3's receipt calculation.

---

## Concept Unit 1: From a Fixed Operation to a Definable One

### The Problem

Lesson 3 named addition, multiplication, and negation as operations — fixed rules, already given by the definition of arithmetic itself, not something anyone had to write. But Lesson 3 and Lesson 4 also worked out a specific calculation by hand: subtotal plus subtotal times a tax rate, giving a final total. That calculation is not one of arithmetic's built-in operations — nothing in the definition of addition or multiplication already knows how to compute a total with tax. If a store needs this exact calculation done for many different subtotals and tax rates throughout the day, the only tools built so far are Lesson 5's binding (bind `subtotal` and `tax_rate` fresh, by hand, every single time) and Lesson 4's evaluation (reduce the resulting expression, by hand, every single time). What's missing is a way to name this whole calculation once, as its own reusable rule — the same way "addition" is a reusable rule — except this one gets to be defined, rather than supplied ready-made by arithmetic.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing the gap between a fixed, built-in operation and a calculation someone has worked out by hand is a matter of comparing what Lessons 3 through 5 already established, not a construct with its own syntax.

### Applying It — Total With Tax

**The calculation, as it currently has to be redone by hand each time (Lesson 3):** bind `subtotal` to 8.20, bind `tax_rate` to 0.10, evaluate `subtotal + subtotal × tax_rate`, getting 9.02.

**What has to happen, in full, for a different subtotal and rate:** rebind `subtotal` to some new value, rebind `tax_rate` to some new value, and evaluate the exact same expression again, from scratch, by hand.

**The gap, stated directly:** "addition" never has to be redefined to add two different numbers — it is simply applied to whichever two numbers are at hand. This calculation, as built so far, has no equivalent: there is no way to say "run the total-with-tax rule" on a new subtotal and rate without manually repeating every step that produced 9.02 in the first place.

### Walkthrough

- **The by-hand calculation for subtotal 8.20, tax rate 0.10** — a reappearance of Lesson 3's receipt total and Lesson 5's binding and substitution, assembled here specifically to expose what's still missing.
- **"rebind... and evaluate the exact same expression again, from scratch"** — establishes concretely what repeating this calculation for new numbers actually requires under the tools built so far.
- **The comparison to "addition," which never needs to be redefined** — not a new concept, but the direct contrast that motivates the rest of this lesson: a reusable rule that doesn't need re-deriving, versus a calculation that currently does.

### CS Lens

This is the gap between a calculation performed once and a calculation named as its own reusable procedure — the same gap between "I added 3 and 5 once" and "I can add any two numbers." Also recognized in: the difference between writing out one instance of a spreadsheet formula and defining a formula that can be copied down an entire column of different inputs; the difference between solving one instance of a word problem and deriving a general formula that solves every instance of that shape; a factory building one custom item by hand versus designing a repeatable manufacturing process for that item; the difference between measuring one triangle's area and knowing the general rule, "half base times height," that applies to every triangle.

### SE Lens

The alternative to naming a reusable rule is to keep repeating the underlying steps by hand, exactly as Lesson 3 and Lesson 5 have done so far, every single time the calculation is needed for new numbers. The real cost of that alternative grows with how often the calculation is needed: each repetition is an opportunity to make a small mistake — a mistyped rate, a step skipped — that a single, carefully defined and reused rule would not be at risk of, once it's been gotten right one time. Naming a reusable rule costs the upfront work of defining it precisely, once, in exchange for never having to re-derive or re-check the underlying steps again for any future use.

---

## Concept Unit 2: Parameters — Names That Aren't Bound Yet

### The Problem

Defining the total-with-tax rule once, for reuse, means writing it in terms of "whatever subtotal is supplied" and "whatever tax rate is supplied" — without committing, at the moment of definition, to any specific numbers at all. Lesson 5's binding cannot do this: "let `subtotal` be 8.20" ties `subtotal` to a specific value immediately, which is exactly wrong for a rule meant to work for many different subtotals. What's needed is a name that behaves differently from an ordinary bound name — one that stands for "a value that will be supplied later," and genuinely has no value of its own at the moment the rule is written down.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction between a parameter and an ordinary bound name is drawn directly below, not through a construct with its own syntax.

### Applying It — Total With Tax

**Two names, chosen for the total-with-tax rule, deliberately left unbound at definition time:** `subtotal` and `tax_rate`.

**Confirming they are not bound the way Lesson 5's names were:** asking "what is `subtotal`, right now, in this rule's definition?" has no answer — not because something went wrong, but because a parameter is defined specifically to have no fixed value until the rule is actually used. This is different from Lesson 5's `batches`, which was given an answer, 3, the very moment it was introduced.

**Why an ordinary binding would defeat the entire purpose:** if `subtotal` were bound to 8.20 as part of defining the rule, the rule would only ever work for a subtotal of exactly 8.20 — precisely the limitation Concept Unit 1 identified as the whole problem in the first place.

### Walkthrough

- **`subtotal` and `tax_rate`, introduced with no binding** — first appearance of *parameter*: a name standing for a future value, deliberately left unbound at the moment the rule is defined.
- **"asking 'what is `subtotal`, right now'... has no answer"** — distinguishes a parameter from an ordinary bound name by directly applying Lesson 5's own question, and getting a structurally different answer than Lesson 5 ever got.
- **The explicit contrast with `batches`** — not a new concept, but a direct comparison to Lesson 5's binding, showing exactly what a parameter deliberately avoids doing.

### CS Lens

This is the idea of a placeholder deliberately left open at definition time, to be filled in on each future use — a name whose entire purpose depends on not yet having an answer. Also recognized in: a function's parameter list in essentially every programming language, listing names with no assigned values until the function is called; a form letter's placeholder, `Dear [Name],`, left unfilled until a specific recipient's name is inserted; an algebraic formula like the quadratic formula, written in terms of `a`, `b`, and `c` without committing to specific numbers; a recipe card that says "servings: as needed," deliberately left open so the recipe can be scaled differently each time it's used.

### SE Lens

The alternative to using parameters is to write the total-with-tax rule using ordinary bound names, fixed to specific values from the start, the way Lesson 5 always did. The real cost of that alternative is exactly Concept Unit 1's finding: a rule built from names already bound to specific values only ever works for those specific values, and has to be entirely rewritten, not merely reused, for any others. Introducing parameters — names deliberately left unbound — costs the small conceptual step of accepting a name with no current answer to "what is it," in exchange for a rule that can be defined exactly once and correctly used for values that don't even exist yet at the moment it's written.

---

## Concept Unit 3: The Function Body — an Expression Written in Terms of Parameters

### The Problem

Naming two parameters, `subtotal` and `tax_rate`, is not yet a rule — it only says what the rule will eventually receive, not what it does with what it receives. The actual calculation — add the subtotal to the subtotal times the tax rate — still needs to be written down, exactly as it was in Lesson 3, except now written in terms of the parameters instead of specific numbers. That expression, together with the parameters it's written in terms of, is what makes this a complete, usable rule rather than just two unbound names sitting next to each other.

### No isolated lab for this step

This concept has no code of its own to isolate — writing an expression in terms of parameters is demonstrated directly below, reusing expression-writing already established in earlier lessons, not through a new construct with its own syntax.

### Applying It — Total With Tax

**The complete rule, parameters and calculation together:**

> `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`

**Naming the two halves of this definition:** `total_with_tax(subtotal, tax_rate)` names the rule and lists its parameters. Everything after the `=` — `subtotal + subtotal × tax_rate` — is an ordinary expression, built from exactly the values and operations Lesson 3 and Lesson 4 already defined, except that its operands here are parameters instead of plain values.

**Confirming this expression is not yet asking to be evaluated:** unlike Lesson 4's `(3 + 5) × (10 − 4)`, this expression cannot be reduced at all right now — `subtotal` and `tax_rate` are parameters, not plain values, and Lesson 4's reduction process only ever works on expressions made of plain values. The expression is complete as a description of the rule, while still waiting for actual numbers before it can be evaluated.

### Walkthrough

- **`total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`** — first appearance of *function* (the whole named rule) and *function body* (`subtotal + subtotal × tax_rate`, the expression defining what it computes) shown together, as a single complete definition.
- **"`subtotal + subtotal × tax_rate`... built from exactly the values and operations Lesson 3 and Lesson 4 already defined"** — a reappearance of *expression* (Lesson 4), now built from parameters rather than plain values or previously-bound names.
- **"this expression cannot be reduced at all right now"** — clarifies precisely how a function body differs from an ordinary expression: it is written and complete, but not yet ready for Lesson 4's evaluation process, because its operands are parameters, not values.

### CS Lens

This is the idea of writing a calculation's steps once, in terms of placeholders, separately from ever actually running those steps on real data. Also recognized in: a mathematical function's formula, `f(x) = x² + 1`, complete and meaningful as a definition long before any specific `x` is chosen; a spreadsheet formula written once in a template cell, referencing placeholder cell positions rather than specific numbers; a blueprint, which fully specifies how to build something without yet being the built thing itself; sheet music, which fully specifies what to play without yet being a performance of it.

### SE Lens

The alternative to writing a function body in terms of parameters is to write the calculation only ever in terms of specific numbers, and treat "generalizing it" as something to figure out later, case by case. The real cost of that alternative is that the calculation's actual logic — add the subtotal to the subtotal times the rate — never gets stated in one place, separately from any one set of numbers; every future use has to re-derive or re-copy the same reasoning. Writing the body once, in terms of parameters, costs nothing beyond stating the calculation the way it was always going to be stated anyway, and it is what makes the calculation's logic something that can be looked at, checked, and reused as a single, stable thing.

---

## Concept Unit 4: Application — Supplying Arguments and Substituting Them In

### The Problem

The rule from Concept Unit 3 is complete as a definition, but a definition alone produces no number. Getting an actual total requires supplying real values for `subtotal` and `tax_rate` and carrying out the calculation the rule describes — exactly the two steps this curriculum already has tools for: Lesson 5's substitution, to replace each parameter with a real value, and Lesson 4's reduction, to evaluate what's left. The only new part is that this substitution isn't happening in a body of free-floating text; it's happening because the function is being used on purpose, with specific arguments chosen for this one occasion.

### No isolated lab for this step

This concept has no code of its own to isolate — application is demonstrated directly below as a combination of substitution and reduction already established in earlier lessons, not through a new construct with its own syntax.

### Applying It — Total With Tax

**Using the rule on specific numbers — Lesson 3's exact receipt, subtotal 8.20 and tax rate 0.10:**

> `total_with_tax(8.20, 0.10)`

**What this use supplies, named precisely:** the arguments are 8.20 and 0.10 — the actual values offered on this specific occasion. They correspond, in order, to the parameters `subtotal` and `tax_rate` from the rule's definition.

**Binding each parameter to its corresponding argument, exactly as Lesson 5's binding works:**

> - `subtotal` → 8.20
> - `tax_rate` → 0.10

**Substituting these bindings into the function body, exactly as Lesson 5's substitution works:** `subtotal + subtotal × tax_rate` becomes `8.20 + 8.20 × 0.10`.

**Evaluating the result, exactly as Lesson 4's reduction works:** `8.20 × 0.10` reduces to `0.82`; then `8.20 + 0.82` reduces to `9.02`.

**The result, matching Lesson 3's original by-hand calculation exactly:** applying `total_with_tax` to 8.20 and 0.10 produces 9.02 — the same total Lesson 3 computed by hand, now produced by a single, reusable rule instead of five separate manual steps.

### Walkthrough

- **`total_with_tax(8.20, 0.10)`** — first appearance of *argument*, shown paired with *application*: 8.20 and 0.10 are the specific values supplied on this occasion, distinct from the parameters `subtotal` and `tax_rate` that name where they go.
- **Binding `subtotal → 8.20` and `tax_rate → 0.10`** — a direct reappearance of *binding* (Lesson 5), here created specifically because the function is being applied, rather than by an independent "let" statement.
- **Substituting into the function body, `8.20 + 8.20 × 0.10`** — a direct reappearance of *substitution* (Lesson 5), applied to the function body from Concept Unit 3.
- **Reducing to `0.82`, then to `9.02`** — a direct reappearance of *reduction* (Lesson 4), completing the evaluation with no new mechanism required.
- **The match with Lesson 3's original result, 9.02** — not a new concept, but confirmation that application, built entirely from tools already established, reproduces exactly the same answer Lesson 3 reached by hand.

### CS Lens

This is the idea of using a previously written rule on a specific occasion, by supplying the values it needs and letting already-established mechanisms — binding, substitution, evaluation — do the rest. Also recognized in: calling a function in any programming language, which binds arguments to parameters and evaluates the function's body; plugging specific numbers into an algebraic formula, like computing `f(3)` for `f(x) = x² + 1`; running a manufacturing process on one specific batch of raw materials; performing a piece of sheet music on one specific occasion, with specific musicians and a specific room.

### SE Lens

The alternative to defining `total_with_tax` as a function and applying it is to keep doing exactly what Lesson 3 did — rebinding `subtotal` and `tax_rate` by hand and re-evaluating the same expression from scratch, every single time. The real cost of that alternative, now made concrete, is duplicated effort with no guarantee of consistency: nothing stops two different by-hand repetitions of "add the subtotal to the subtotal times the rate" from being carried out slightly differently by accident. Defining the rule once as a function, and applying it via binding, substitution, and reduction exactly as already established, costs the work done in Concept Units 2 and 3, and buys a rule that behaves identically every single time it's applied, because the underlying mechanism producing its result never changes from one application to the next.

---

## Concept Unit 5: A Function Is a Reusable Rule — Not a Single Calculation

### The Problem

One application, `total_with_tax(8.20, 0.10)`, matching Lesson 3's original calculation, might look like nothing more than a fancier way of writing the same one-off computation. What actually makes this a function, rather than just an elaborate restatement of a single calculation, is that the exact same definition — written once in Concept Unit 3 — works, unmodified, for entirely different arguments, the same way Lesson 3's Concept Unit 2 found for addition itself: one fixed rule, applicable to endlessly many different values.

### No isolated lab for this step

This concept has no code of its own to isolate — demonstrating reuse across different arguments is shown directly below, not through a construct with its own syntax.

### Applying It — Total With Tax

**The same rule, applied to a different subtotal and a different tax rate — a $20.00 subtotal, 8% tax:**

> `total_with_tax(20.00, 0.08)`

**Binding, substituting, and reducing, exactly as in Concept Unit 4, with no change to the rule's definition:** `subtotal → 20.00`, `tax_rate → 0.08`. Substituting: `20.00 + 20.00 × 0.08`. Reducing: `20.00 × 0.08` becomes `1.60`; `20.00 + 1.60` becomes `21.60`.

**Confirming nothing about the rule itself was touched:** Concept Unit 3's definition, `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`, was not rewritten, edited, or re-derived to handle this new pair of numbers — the exact same body, applied to different arguments, produced a different, correct result on its own.

**Closing the loop back to Lesson 1:** Lesson 1, Concept Unit 3, described generalizing from one specific instance ("these 40 quiz scores") to a computational problem stated for any instance of that shape ("any finite sequence of numbers"). A function is the concrete mechanism that makes that generalization actually usable: `total_with_tax` is not "the calculation for 8.20 and 0.10" — it is the calculation for *any* subtotal and tax rate, defined once, exactly the way Lesson 1 said a computational problem should be.

### Walkthrough

- **`total_with_tax(20.00, 0.08)`** — a second, deliberately different application of the same function, chosen specifically to confirm reusability rather than to compute anything new for its own sake.
- **The full binding/substitution/reduction sequence, reappearing unchanged from Concept Unit 4** — demonstrates that application, once established, requires no per-argument adjustment to work correctly on new values.
- **"the exact same body... was not rewritten"** — not a new concept, but direct confirmation that Concept Unit 1's original goal has been met: a rule defined once, reused without modification.
- **The explicit connection back to Lesson 1's generalization** — a reappearance of Lesson 1 Concept Unit 3, restated briefly, tying this lesson's function directly to that lesson's computational problem as its concrete realization.

### CS Lens

This is the idea of one fixed definition serving arbitrarily many uses without being touched — the same reusability Lesson 3 already found in addition, now achieved for a rule someone actually wrote. Also recognized in: a single mathematical formula, correctly answering the question for every valid input without ever needing to be rewritten; a manufacturing process, designed once and run on batch after batch of raw material; a single recipe, cooked correctly regardless of which specific kitchen or day it's prepared in; a single piece of music notation, performable correctly by any competent musician on any occasion.

### SE Lens

The alternative to trusting a function's reusability is to re-verify the whole calculation by hand every time it's applied to new arguments, just to be sure — effectively undoing the entire point of defining it as a function in the first place. The real cost of that alternative is that it throws away exactly the benefit Concept Unit 1 set out to gain: if the rule has to be re-checked from scratch on every use anyway, defining it once bought nothing. Trusting a function once its definition has been verified — applying it to new arguments and expecting correct results without re-deriving the whole calculation each time — costs the discipline of getting the definition right once, carefully, in exchange for every future use being as simple as supplying arguments and letting binding, substitution, and reduction do the rest.

---

## Closing

### Connect the pieces

One rule, traced through every unit built in this lesson, start to finish:

1. **The gap exposed (Unit 1):** Lesson 3's total-with-tax calculation has to be redone by hand for every new subtotal and rate — no reusable rule exists for it yet, unlike addition.
2. **Parameters, standing for values not yet supplied (Unit 2):** `subtotal` and `tax_rate`, deliberately left unbound, unlike any name in Lesson 5.
3. **The function body, written in terms of those parameters (Unit 3):** `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate`.
4. **Application, on Lesson 3's original numbers (Unit 4):** `total_with_tax(8.20, 0.10)`, bound, substituted, and reduced to `9.02` — matching Lesson 3's by-hand result exactly.
5. **Reuse, on entirely different numbers (Unit 5):** `total_with_tax(20.00, 0.08)`, the same unmodified rule, reduced to `21.60` — and the direct connection back to Lesson 1's generalization from one instance to a computational problem for any instance.

Unit 4's application is not a fresh example dropped in from nowhere — it is a direct rerun of Lesson 3's own numbers, chosen specifically so the function's result could be checked against a calculation already known to be correct.

### What breaks without this

Suppose Concept Unit 1's gap had simply been accepted, and the total-with-tax calculation continued to be redone by hand for every customer, all day, the way Lesson 3 originally did it. A cashier, rushing during a busy stretch, correctly binds `subtotal` to 15.40 for one customer but, copying the previous customer's numbers out of habit, accidentally reuses the previous tax rate of 0.08 instead of typing the correct 0.10 for this transaction. Nothing catches this — there is no single, verified rule being consulted, only the same by-hand steps repeated under time pressure, and a repeated step is exactly as easy to get subtly wrong as to get right. The customer is undercharged, the error surfaces only when the register's totals for the day don't reconcile, and there is no way to tell, after the fact, which of dozens of by-hand calculations that day was the one where a stale rate got reused. Restoring Unit 3 and Unit 4 — one function, defined and verified once, applied fresh to each customer's actual `subtotal` and `tax_rate` rather than re-derived by hand — removes this failure by removing the repeated manual step where it occurred: the function's body cannot silently reuse a stale value the way a distracted cashier's memory can, because Unit 4's binding step requires an actual argument to be supplied on every single application.

### Exercises

1. **Observe.** Take a calculation you've repeated by hand more than once in this curriculum's exercises so far (a tip calculation, a unit conversion), and identify which parts of it changed between repetitions and which stayed the same, the way Concept Unit 1 identified `subtotal` and `tax_rate` as the parts of the receipt calculation that change.
2. **Formalize.** Write that calculation as a function definition, the way Concept Unit 3 wrote `total_with_tax(subtotal, tax_rate) = subtotal + subtotal × tax_rate` — name the function, name its parameters, and write its body as an expression in terms of those parameters.
3. **Predict.** Before working it out: predict the result of applying your function to one specific set of arguments, then apply it step by step — binding, substitution, reduction — the way Concept Unit 4 applied `total_with_tax(8.20, 0.10)`.
4. **Explain.** Apply your function to a second, different set of arguments, the way Concept Unit 5 applied `total_with_tax(20.00, 0.08)`. Confirm explicitly that you did not change your function's definition to make this work.
5. **Explain.** State, in one or two sentences, which specific words in your function's definition are parameters and which are part of the body's operations — and give one example of an argument that would be a valid substitution for one of your parameters, and one that would not (for instance, an argument outside a range your function's calculation assumes, connecting back to Lesson 1's *assumption*).

### Definition of done

- [ ] You can state, in your own words, the difference between a parameter and an argument, giving a concrete example of each for the same function.
- [ ] You can explain why a parameter cannot be treated the same way as one of Lesson 5's ordinary bound names.
- [ ] You can apply a function you've defined to a specific set of arguments, showing the binding, substitution, and reduction steps explicitly rather than jumping straight to the result.
- [ ] You can explain, using your own example, why applying the same function definition to two different sets of arguments demonstrates that it is a reusable rule rather than a disguised one-off calculation.
- [ ] You completed Exercises 1–5 for a calculation of your own choosing, not the total-with-tax example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating one calculation from an earlier lesson's exercises you now realize could have been written as a function from the start.
