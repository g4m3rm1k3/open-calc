# Lesson 8: Composition

**What you will build:** Still nothing runnable — this lesson names a connection that Lesson 3 already used informally, back when the receipt calculation fed one operation's result into the next: taking one function's output and using it directly as another function's input, called *composition*. The transferable problem this lesson is actually about: complicated transformations are rarely written from scratch as one giant expression — almost always, they are built by connecting simpler transformations that already exist, each one doing its own clearly defined job.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically the receipt calculation's step-by-step sequence, where one operation's result explicitly became the next operation's operand, without yet having a name for that connection. Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically *function*, *parameter*, *argument*, and *application*, all reused directly; this lesson's composed functions are ordinary functions in every respect Lesson 7 already established.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Composition** — using one function's output directly as another function's input, connecting two separately defined functions into a single combined transformation. Composition is the formal name for exactly what Lesson 3's receipt calculation was already doing when it carried a line total into a sum, and a subtotal into a tax calculation — this lesson gives that connection a name and applies it deliberately, to functions defined on purpose (Lesson 7), rather than to a one-off sequence of by-hand steps.
- **Composed function** — a new function built entirely by connecting two or more existing functions through composition, itself usable exactly like any other function from Lesson 7 — it can be named, applied to arguments, and reused, even though its body is really just a description of how its component functions connect.
- **Commutative** — a property two operations or functions may or may not have: applying them in either order produces the same result. Addition and multiplication are each commutative with themselves (`3 + 5` equals `5 + 3`); this lesson shows that composing two *different* functions in one order versus the other is generally not commutative at all, and that assuming otherwise, without checking, is a real source of error.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, building on Lesson 7's `total_with_tax` function and introducing one new function, `price_after_discount`, to demonstrate composing them.

---

## Concept Unit 1: Feeding One Function's Output Into Another's Input

### The Problem

A store is running a promotion: a discount applied to an item's price, before tax is calculated on whatever remains. Lesson 7 already defined `total_with_tax(subtotal, tax_rate)`, which correctly adds tax to whatever subtotal it's given — but it has no idea about discounts; it only ever sees the number handed to it as `subtotal`. A separate function, computing a price after a discount, is easy enough to define using exactly Lesson 7's tools — but defining it on its own does not yet connect it to `total_with_tax` at all. What's needed is a way to say, precisely: take the discounted price, and *use it as* the subtotal that `total_with_tax` operates on — not recompute the whole calculation from scratch as one new, unrelated function, but connect two functions that already do their own jobs correctly.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap between two functions that each work correctly on their own and having them work together is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Discount, Then Tax

**A new function, defined exactly as Lesson 7 taught, computing a price after a discount:**

> `price_after_discount(price, discount_rate) = price − price × discount_rate`

**Confirming it works correctly on its own, the way Lesson 7 verified `total_with_tax`:** applying it to a $50.00 price and a 20% discount rate: `price_after_discount(50.00, 0.20)` binds `price → 50.00` and `discount_rate → 0.20`, substitutes to `50.00 − 50.00 × 0.20`, and reduces to `50.00 − 10.00 = 40.00`. The discounted price is $40.00.

**The gap, stated directly:** `total_with_tax(subtotal, tax_rate)` needs a `subtotal` to work on. Nothing so far connects the 40.00 just computed to that parameter — the two functions exist, each independently correct, with no stated relationship between them at all.

### Walkthrough

- **`price_after_discount(price, discount_rate) = price − price × discount_rate`** — a new function, defined using exactly Lesson 7's mechanism (parameters, function body), introducing no new construct on its own.
- **`price_after_discount(50.00, 0.20)`, reducing to `40.00`** — a reappearance of Lesson 7's application (binding, substitution, reduction), confirming the new function works correctly in isolation.
- **"nothing so far connects the 40.00 just computed to that parameter"** — not a new concept, but the direct statement of this unit's problem: two independently correct functions, with no established way to use one's result as the other's input.

### CS Lens

This is the gap between having two working, independent pieces and actually connecting them into a single working whole — a gap every system with more than one part eventually has to close. Also recognized in: two correctly working machines on a factory floor that are simply not yet connected by a conveyor belt between them; two correctly written functions in a program that are never actually called from within each other; two people, each an expert at one part of a task, who have not yet been told to hand their work to one another; two correctly tuned musical instruments that have not yet been given a shared piece of music to play together.

### SE Lens

The alternative to composing `price_after_discount` and `total_with_tax` is to write an entirely new, third function from scratch — `discounted_total_with_tax(price, discount_rate, tax_rate) = price − price × discount_rate + (price − price × discount_rate) × tax_rate` — duplicating the discount logic inside it rather than reusing the already-defined, already-verified `price_after_discount`. The real cost of that alternative is that the discount calculation now exists in two places: if it's ever found to be wrong, or the store's discount policy changes, both the standalone `price_after_discount` and the duplicated logic inside the new function have to be found and fixed, and it's easy to fix one while forgetting the other exists. Connecting the two already-defined functions instead costs nothing beyond stating the connection, and means the discount logic exists in exactly one place, trusted and reused wherever it's needed.

---

## Concept Unit 2: Composition — Naming the Connection Directly

### The Problem

Concept Unit 1 identified exactly what's missing: a way to say "use this function's output as that function's input." Stating this precisely, rather than describing it only in prose, means writing an expression where one function's application appears directly where an argument is expected by another. This is not a new kind of expression — Lesson 4 already established that an operand can itself be an unevaluated expression, and Lesson 7's application already produces a value once fully evaluated. Composition is simply using one function application, in full, as the argument to another.

### No isolated lab for this step

This concept has no code of its own to isolate — composition is demonstrated directly below as a direct application of Lesson 4's nested-expression evaluation to Lesson 7's function application, not through a new construct with its own syntax.

### Applying It — Discount, Then Tax

**Writing the connection directly, as a nested expression:**

> `total_with_tax(price_after_discount(50.00, 0.20), 0.10)`

**Evaluating this, using nothing but tools already established:** `price_after_discount(50.00, 0.20)` is itself a complete function application (Lesson 7), so it is evaluated first, exactly as Concept Unit 1 already worked out: it reduces to `40.00`. The outer expression is now `total_with_tax(40.00, 0.10)` — an ordinary application of `total_with_tax`, with 40.00 supplied as its `subtotal` argument. Binding `subtotal → 40.00` and `tax_rate → 0.10`, substituting into the body, and reducing: `40.00 + 40.00 × 0.10` becomes `40.00 + 4.00 = 44.00`.

**Naming what just happened:** `price_after_discount`'s output, 40.00, was used directly as `total_with_tax`'s input, with nothing in between but the nesting of the two applications. This connection — one function's output becoming another's input — is composition.

### Walkthrough

- **`total_with_tax(price_after_discount(50.00, 0.20), 0.10)`** — first appearance of *composition*, shown as a single nested expression: an inner function application supplying the argument for an outer one.
- **`price_after_discount(50.00, 0.20)` reducing to `40.00` first** — a reappearance of Lesson 4's evaluation order for nested expressions: an operand that is itself an expression must be reduced before the operation surrounding it can proceed, exactly as `(3 + 5)` had to be reduced before the multiplication in Lesson 4's own example.
- **`total_with_tax(40.00, 0.10)` reducing to `44.00`** — a reappearance of Lesson 7's full application sequence (binding, substitution, reduction), completing the composed calculation.

### CS Lens

This is the idea of connecting two transformations by feeding one's output directly into the other, forming a single combined transformation out of two separately defined ones. Also recognized in: a Unix command pipeline, `sort file.txt | uniq`, where `sort`'s output becomes `uniq`'s input directly; mathematical function composition, written `g(f(x))`, meaning apply `f` first and feed its result into `g`; an assembly line where one station's finished part becomes the very next station's raw material; a translator relaying a sentence from one language to a second translator, who relays it into a third language.

### SE Lens

The alternative to composing `price_after_discount` and `total_with_tax` directly, as shown here, is what Concept Unit 1 already identified as costly: writing one larger, duplicated function instead of connecting the two smaller, already-correct ones. Composition's real cost is a small one of its own: reading a composed expression correctly requires recognizing that the innermost function application has to be evaluated first, which can be less immediately obvious than a flat sequence of separately labeled steps, especially as more functions get nested together. That readability cost is traded for the much larger benefit already established in Concept Unit 1 — each piece of logic exists, and is correct, in exactly one place.

---

## Concept Unit 3: Composition Order Is Not Guaranteed Not to Matter

### The Problem

Concept Unit 2 composed `price_after_discount` inside `total_with_tax` — discount first, then tax. It would be reasonable to wonder whether the reverse order, tax first and then discount, gives the same final result; after all, both are just arithmetic on the same starting price. It does not, in general — and confirming this with a clean, unambiguous example matters more than debating it about discounts and tax specifically, because the specific numbers involved in that example could accidentally make the two orders agree, hiding the real, general lesson underneath a coincidence.

### No isolated lab for this step

This concept has no code of its own to isolate — the order-dependence of composition is demonstrated directly below with two clean example functions, not through a construct with its own syntax.

### Applying It — Two Clean Functions

**Two simple functions, chosen specifically so the arithmetic is easy to check by hand:**

> `add_one(x) = x + 1`
> `double(x) = x × 2`

**Composing them one way — double, then add one:**

> `add_one(double(3))`

`double(3)` reduces to `6`. `add_one(6)` reduces to `7`.

**Composing them the other way — add one, then double:**

> `double(add_one(3))`

`add_one(3)` reduces to `4`. `double(4)` reduces to `8`.

**The comparison, stated directly:** `add_one(double(3)) = 7`, while `double(add_one(3)) = 8`. Same two functions, same starting value, two different orders of composition, two different results. These two functions do not commute.

**Returning to discount and tax, now that the general point is established without doubt:** checking `price_after_discount(50.00, 0.20)` then `total_with_tax(..., 0.10)`, against `total_with_tax(50.00, 0.10)` then `price_after_discount(..., 0.20)`, both orders actually do produce the same final total here — but only because both functions happen to be pure scaling by a fixed factor (multiplying by `1 − discount_rate` and by `1 + tax_rate`, respectively), and scaling by one fixed factor and then another always gives the same result regardless of order. This is a special case, not something composition guarantees — exactly the kind of special case `add_one` and `double` just proved cannot be assumed in general.

### Walkthrough

- **`add_one(double(3))` reducing to `7`** — first appearance of composition order being deliberately compared, using two functions chosen specifically to make the comparison unambiguous.
- **`double(add_one(3))` reducing to `8`** — the same two functions, same starting value, composed in the reverse order, producing a genuinely different result.
- **"these two functions do not commute"** — first appearance of *commutative*, defined by direct contrast: a property this pair of functions demonstrably lacks.
- **The discount/tax recheck, both orders agreeing** — a reappearance of `price_after_discount` and `total_with_tax` from Concept Units 1 and 2, specifically re-examined to show that their apparent order-independence is a special case of both being scaling operations, not a general property of composition.

### CS Lens

This is the fact that combining two transformations is not automatically symmetric — which one runs first is part of what's being specified, not an incidental detail. Also recognized in: putting on socks and then shoes versus shoes and then socks, a physically impossible reversal that makes the point vividly; image processing, where cropping an image and then rotating it can produce a different result than rotating first and then cropping; a series of financial transactions, where applying a discount before or after a fee can change the final amount owed unless the two happen to be mathematically compatible; matrix multiplication in linear algebra, formally proven, much later in this curriculum, to not generally commute.

### SE Lens

The alternative to checking whether two composed functions commute is to assume, by default, that "the math works out the same either way" — a reasonable-sounding assumption that `add_one` and `double` just disproved directly. The real cost of that assumption is a class of bug that is easy to introduce and hard to notice: two transformations get composed in whichever order happens to occur to the person writing the code, and the result is silently wrong whenever that order happens to matter, with nothing about the code itself flagging that a choice was even made. Explicitly checking, or explicitly stating, which order a composition requires costs one deliberate verification — as done above for discount and tax — and is the only way to know, rather than assume, whether a particular pair of functions is safe to compose in either order.

---

## Concept Unit 4: A Composed Function Is Still Just a Function

### The Problem

Concept Unit 2's composed expression, `total_with_tax(price_after_discount(50.00, 0.20), 0.10)`, works — but it only computes the discounted total for one specific price, discount rate, and tax rate, written directly into the expression. Lesson 7's entire point was that a calculation worth reusing should be named as its own function, with parameters standing for whatever values will be supplied later. Nothing about composition changes that — a composed expression can be wrapped in exactly the same way, becoming a new, independently reusable function whose body just happens to describe how two other functions connect.

### No isolated lab for this step

This concept has no code of its own to isolate — naming a composed expression as its own function is demonstrated directly below, using exactly Lesson 7's mechanism, not through a new construct with its own syntax.

### Applying It — Discount, Then Tax

**Naming the composition from Concept Unit 2 as its own function, with parameters standing for whatever price, discount rate, and tax rate are eventually supplied:**

> `discounted_total(price, discount_rate, tax_rate) = total_with_tax(price_after_discount(price, discount_rate), tax_rate)`

**Confirming this is an ordinary function, in every sense Lesson 7 already established:** it has a name (`discounted_total`), parameters (`price`, `discount_rate`, `tax_rate`), and a body — the only thing unusual about the body is that it's built from two other functions' applications rather than from a bare arithmetic expression.

**Applying it, exactly as Lesson 7 taught, on the same numbers used throughout this lesson:** `discounted_total(50.00, 0.20, 0.10)` binds all three parameters, substitutes them into the body, and reduces — following the same inner-first evaluation order established in Concept Unit 2 — to `44.00`, matching Concept Unit 2's result exactly.

**Applying it again, on entirely different numbers, exactly as Lesson 7, Concept Unit 5, demonstrated reuse:** `discounted_total(120.00, 0.25, 0.08)` reduces `price_after_discount(120.00, 0.25)` to `90.00` first, then `total_with_tax(90.00, 0.08)` to `97.20`.

### Walkthrough

- **`discounted_total(price, discount_rate, tax_rate) = total_with_tax(price_after_discount(price, discount_rate), tax_rate)`** — first appearance of *composed function*: an ordinary function definition, following Lesson 7's exact form, whose body is a composition of two other named functions rather than a bare expression.
- **`discounted_total(50.00, 0.20, 0.10)` reducing to `44.00`** — a reappearance of Lesson 7's full application sequence, confirming the composed function reproduces Concept Unit 2's result exactly, now via a single, reusable name.
- **`discounted_total(120.00, 0.25, 0.08)` reducing to `97.20`** — a reappearance of Lesson 7 Concept Unit 5's reuse demonstration, applied here to a composed function specifically, to confirm it is reusable in exactly the same way as any other function.

### CS Lens

This is the idea that a combination of transformations can itself be treated as a single transformation, with no visible difference, from the outside, between something built from one step and something built from several connected ones. Also recognized in: a subroutine in a program that itself calls several other subroutines, while still being called by other code exactly like any simpler function; an assembled subassembly on a factory floor, itself built from several parts, that gets installed into a larger product exactly like any single part would; a compound machine, like a pulley system built from several simple pulleys, that still behaves, from a user's perspective, like one machine; a paragraph made of several sentences, itself usable as one unit of a larger essay.

### SE Lens

The alternative to naming a composition as its own function is to keep writing out the full nested expression, `total_with_tax(price_after_discount(price, discount_rate), tax_rate)`, every single place a discounted total is needed. The real cost of that alternative is exactly Lesson 7 Concept Unit 1's original cost, now recurring one level up: if the composition itself needs to change — say, a second discount is later added on top of the first — every place that repeated the full nested expression by hand has to be found and updated individually. Naming the composition once, as `discounted_total`, costs nothing beyond the definition already required by Concept Unit 2's expression, and means any future change to how discount and tax combine has exactly one place to happen.

---

## Concept Unit 5: Building Complexity From Simplicity

### The Problem

Looking back across this lesson and Lesson 7 together: `price_after_discount` and `total_with_tax` are each built from nothing more than Lesson 3's values and operations. `discounted_total` is built from nothing more than those two functions, connected by composition. Nothing stops this from continuing — `discounted_total` could itself be composed with some other function (say, one converting the final total into a different currency), producing a new function built from an already-composed one, and so on. This is the actual mechanism the BRD's larger goal for this curriculum depends on: complicated transformations are not typically written from scratch, all at once — they are built, layer by layer, out of simpler transformations that already exist and are already trusted.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing the layered structure already built across this lesson is a matter of reviewing what's already been shown, not a construct with its own syntax.

### Applying It — the Layers, Named Explicitly

**Layer 1 — values and operations (Lesson 3):** the plain numbers and the built-in operations `+`, `−`, `×` that everything else in this lesson is ultimately built from.

**Layer 2 — functions (Lesson 7):** `price_after_discount` and `total_with_tax`, each a named, reusable rule built directly from Layer 1's values and operations.

**Layer 3 — composition (this lesson):** `discounted_total`, built by connecting two Layer 2 functions, with no new arithmetic of its own — its entire body is just a statement of how `price_after_discount` and `total_with_tax` connect.

**One more layer, sketched to show the pattern continues:** a function `to_euros(amount)`, converting a dollar amount to euros, could be composed with `discounted_total` exactly the way `price_after_discount` was composed with `total_with_tax`: `to_euros(discounted_total(price, discount_rate, tax_rate))` — a Layer 4 transformation, built from a Layer 3 one, with nothing about the process changing as the layers accumulate.

### Walkthrough

- **The three named layers, values/operations, functions, composition** — not new concepts individually, but each one a reappearance, assembled here specifically to show how each layer of this lesson and Lesson 7 was built entirely out of the layer before it.
- **The sketched fourth layer, `to_euros(discounted_total(...))`** — demonstrates, without fully working out the arithmetic, that nothing about composing a function with an already-composed function requires any new mechanism beyond what Concept Unit 2 already established.

### CS Lens

This is the idea of building complexity by stacking layers, each one a combination of the layer below it, with no layer needing to know how the layers beneath it are internally built. Also recognized in: a computer's own layered design, where a program calls library functions, which call operating-system functions, which ultimately execute individual machine instructions, each layer built from the one below; a large mathematical proof, built from smaller established lemmas, each of which is built from more basic, already-proven facts; a company's organizational structure, where a completed product is the combined output of many teams, each depending on work from teams beneath them; a city's infrastructure, where a running household appliance depends on wiring, which depends on a substation, which depends on a power plant.

### SE Lens

The alternative to building complexity in layers is to write each complicated transformation as one single, undifferentiated block of logic, with no reused pieces and no visible structure connecting it to anything simpler underneath. The real cost of that alternative compounds with the size of the transformation being built: a single flat block has to be understood, tested, and fixed all at once, with no smaller, already-verified piece to trust and build on top of. Building in layers — trusting `price_after_discount` and `total_with_tax` once each is verified, then trusting `discounted_total` once it's verified in terms of them — costs the discipline of actually defining and checking each layer before building the next one on top of it, and is the only way complexity can keep growing without the whole structure becoming impossible to reason about at once.

---

## Closing

### Connect the pieces

One calculation, traced through every unit built in this lesson, start to finish:

1. **The gap between two working, unconnected functions (Unit 1):** `price_after_discount` and `total_with_tax`, each correct on its own, with nothing yet linking them.
2. **Composition, naming the connection (Unit 2):** `total_with_tax(price_after_discount(50.00, 0.20), 0.10)`, evaluated inner-first, reducing to `44.00`.
3. **Order checked, not assumed (Unit 3):** `add_one`/`double` shown to give different results in different orders (`7` versus `8`); discount and tax rechecked and found to agree only because both are scaling operations, a special case.
4. **The composition named as its own function (Unit 4):** `discounted_total(price, discount_rate, tax_rate)`, applied to `(50.00, 0.20, 0.10)` reproducing `44.00`, and reused unmodified on `(120.00, 0.25, 0.08)` to get `97.20`.
5. **The layered structure made explicit (Unit 5):** values and operations, built into functions, built into composed functions, built into further compositions — the mechanism this entire lesson exists to name.

Unit 4's `discounted_total` is not a new function invented separately from the rest of the lesson — it is Unit 2's exact composed expression, given a name and parameters exactly the way Lesson 7 named `total_with_tax` in the first place.

### What breaks without this

Suppose Concept Unit 3's order check had been skipped, and `discounted_total` had instead been defined the other way around, tax before discount — `total_with_tax(price, tax_rate)` composed first, with the discount applied to that result — on the unchecked assumption that "it's all just percentages, so the order shouldn't matter." For pure percentage scaling, as this lesson's own recheck in Concept Unit 3 found, that particular assumption happens to hold — but suppose the store's actual discount policy is not a percentage at all, but a flat five-dollar coupon, `price_after_flat_discount(price) = price − 5`. Composed as discount-then-tax on a $50.00 item at 10% tax: `total_with_tax(45.00, 0.10) = 49.50`. Composed the other order, tax-then-discount: `price_after_flat_discount(55.00) = 50.00`. These do not agree — $49.50 versus $50.00 — because a flat discount and a percentage tax do not commute, unlike the two pure-scaling functions this lesson's recheck happened to find agreement between. A store that assumed order never matters, based on one coincidentally order-independent case, would silently overcharge or undercharge every customer receiving this flat coupon, with nothing about the code itself signaling that an unchecked assumption was ever made. Restoring Concept Unit 3's discipline — explicitly checking, for the actual functions involved, whether composition order changes the result, rather than assuming from one earlier example that it never does — catches this before it reaches a single customer.

### Exercises

1. **Observe.** Take two functions you defined in Lesson 7's exercises (or define two simple new ones), and write a composed expression using one's output as the other's input, the way Concept Unit 2 wrote `total_with_tax(price_after_discount(50.00, 0.20), 0.10)`.
2. **Predict.** Before evaluating: predict whether composing your two functions in the reverse order will give the same result. Then check both orders by hand, the way Concept Unit 3 checked `add_one(double(3))` against `double(add_one(3))`.
3. **Formalize.** Name your composed expression from Exercise 1 as its own function, with parameters, the way Concept Unit 4 named `discounted_total`. Apply it to one set of arguments and confirm it matches your Exercise 1 result.
4. **Explain.** Apply your named composed function from Exercise 3 to a second, different set of arguments, the way Concept Unit 4 applied `discounted_total(120.00, 0.25, 0.08)`, and confirm you changed no part of the function's definition to do so.
5. **Explain.** Using your Exercise 2 finding, state in your own words why "the math should work out the same either way" is not a safe assumption to make about a new pair of functions without checking, and describe one real situation (outside this lesson's examples) where getting the order wrong would matter.

### Definition of done

- [ ] You can state, in your own words, what composition connects and what it produces.
- [ ] You can explain why a composed expression should be evaluated inner-function-first, connecting this to Lesson 4's evaluation order.
- [ ] You can give an example, of your own, of two functions that do not commute, and show both orders' results side by side.
- [ ] You can name a composition as its own function and apply it to two different sets of arguments, confirming its definition didn't need to change between them.
- [ ] You completed Exercises 1–5 for functions of your own choosing, not `price_after_discount` and `total_with_tax`.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating whether your Exercise 2 functions turned out to commute, and whether that result surprised you.
