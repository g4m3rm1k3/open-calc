# Lesson 26: Repetition and Iteration

**What you will build:** Still nothing runnable — this lesson names two different ways of doing the same kind of thing many times: writing out every repetition explicitly, and applying one fixed rule repeatedly to its own previous result. The transferable problem this lesson is actually about: Lesson 3's receipt calculation worked fine for two items, and would become completely unmanageable, written by hand, for twenty — the same repetition problem Lesson 7 solved for reusing a calculation across different inputs shows up again here, in a different shape, for repeating a calculation many times within a single computation.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically the receipt calculation's sequence of additions, revisited directly as this lesson's motivating example. Lesson 12 (`FP-L012-conditions.md`) — specifically *guard*, reused directly for the stopping condition in Concept Unit 4. Lesson 21 (`FP-L021-finite-and-infinite-thinking.md`) — specifically the `N + 1` argument, revisited directly as this lesson's central example of repeated rule application.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Explicit repetition** — writing out every individual repetition of a step by hand, one after another, rather than describing the repetition as a single rule. Lesson 3's `2 × 3.50 + 1 × 1.20` is explicit repetition of addition, written out for exactly two items.
- **Summation** — a compact notation, written `Σ`, for explicit repetition specifically of addition — stating "add up this expression for every value of a variable across some range" without writing out every individual term by hand. Summation is to Lesson 14's universal quantifier what addition is to `AND`: the same unpacking relationship, for a sum instead of a Boolean claim.
- **Repeated application** — applying one fixed rule again and again, each time to the result the rule itself produced the previous time, rather than performing several individually written steps. Counting up from `0` by repeatedly adding `1` is repeated application: the same rule, "add one," applied to its own output, over and over.
- **Stopping condition** — a check, performed before or during each repetition, that decides whether repeated application should continue or stop. Without one, repeated application has no way to know it's finished — a problem directly connected to Lesson 21's infinite natural numbers, where no stopping point exists at all unless one is deliberately imposed.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain mathematical notation, using a longer version of Lesson 3's receipt and Lesson 21's counting argument.

---

## Concept Unit 1: Doing Something Many Times, By Hand

### The Problem

Lesson 3's receipt had two items, and writing `2 × 3.50 + 1 × 1.20` by hand was perfectly manageable. A real receipt might have twenty items. Writing `q₁ × p₁ + q₂ × p₂ + q₃ × p₃ + ... + q₂₀ × p₂₀` by hand, one term at a time, is exactly the kind of unmanageable, error-inviting repetition Lesson 1 warned about for un-generalized calculations — except this time the repetition is happening *inside* a single computation, not across separate uses of a function the way Lesson 7 addressed.

### No isolated lab for this step

This concept has no code of its own to isolate — the scaling problem is demonstrated directly below, not through a construct with its own syntax.

### Applying It — a Twenty-Item Receipt

**Lesson 3's original, two-item version, for comparison:** `2 × 3.50 + 1 × 1.20`.

**The same kind of calculation, imagined for twenty items, written out as far as patience allows:** `q₁ × p₁ + q₂ × p₂ + q₃ × p₃ + q₄ × p₄ + q₅ × p₅ + ...` — seventeen more terms to go, each one exactly the same shape as the last, differing only in which specific quantity and price it names.

**The problem, stated directly:** nothing about this calculation's *logic* changed between two items and twenty — only the number of times the same shape of term needs to be written down. Writing all twenty by hand risks exactly the same error-prone repetition Lesson 7 already identified for reusing a whole calculation, now happening at the level of individual terms within one calculation.

### Walkthrough

- **The two-item version, reappearing from Lesson 3** — establishes the baseline this unit is about to strain.
- **The twenty-item version, trailing off after five terms** — makes the scaling problem viscerally clear without requiring all twenty to actually be written out.
- **"nothing about this calculation's logic changed... only the number of times"** — not a new concept, but the precise diagnosis of what's actually needed: a way to state a repeated shape once, rather than write it out however many times it's needed.

### CS Lens

This is the same shape of problem Lesson 7 solved for repeating a whole function call across different uses, now appearing one level down, inside a single calculation, where the same small step needs repeating many times rather than the same whole calculation. Also recognized in: a spreadsheet formula copied down a column of a hundred rows, each one doing the identical shape of calculation on different data; a factory process repeating the same assembly step for every unit on a production line; a mail merge repeating the same letter template for every recipient; a payroll system repeating the same pay calculation for every employee.

### SE Lens

The alternative to naming this repetition precisely is to keep writing out every term by hand, scaling the tedium and the error risk directly with however many items happen to be involved. The real cost of that alternative, for twenty items, is twenty separate opportunities to mistype a quantity or a price, with no systematic way to catch a mistake buried in the middle of a long, hand-written expression. Naming the repeated shape precisely, the subject of the rest of this lesson, costs nothing beyond recognizing what's actually varying (which specific quantity and price) versus what's staying the same (the multiply-then-add shape); it is the first step toward writing this calculation once, correctly, regardless of how many items are involved.

---

## Concept Unit 2: Explicit Repetition — Writing Out Every Step

### The Problem

Concept Unit 1's twenty-term sum was still explicit repetition — every term written by hand. Before finding a way to avoid writing every term, it's worth naming this style precisely, since a compact notation for exactly this kind of repeated addition already exists and is worth introducing directly.

### No isolated lab for this step

This concept has no code of its own to isolate — summation notation is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Summation Notation

**The twenty-term sum, written explicitly one more time, to have something concrete to compress:** `q₁p₁ + q₂p₂ + q₃p₃ + ... + q₂₀p₂₀`.

**The same sum, written using summation notation:**

> `Σᵢ₌₁²⁰ qᵢpᵢ`

read "the sum, as `i` ranges from `1` to `20`, of `qᵢ` times `pᵢ`."

**Confirming this names exactly the same calculation, not a new one:** the `Σ` notation is not computing anything different from the explicit twenty-term version — it is a compact way of *stating* the same explicit repetition, exactly the way Lesson 14's `∀x ∈ D, P(x)` was a compact way of stating a chain of `AND`s rather than a different kind of claim.

**Confirming this scales without becoming any harder to write:** the same notation, for two thousand items, is `Σᵢ₌₁²⁰⁰⁰ qᵢpᵢ` — no longer or more error-prone to write than the twenty-item version, unlike the fully explicit form, which would require two thousand individual terms.

### Walkthrough

- **`q₁p₁ + q₂p₂ + ... + q₂₀p₂₀`** — first appearance of *explicit repetition* named directly, using the twenty-item sum already introduced in Concept Unit 1.
- **`Σᵢ₌₁²⁰ qᵢpᵢ`** — first appearance of *summation*, introduced specifically as a compact restatement of the explicit form, not as a new kind of calculation.
- **The two-thousand-item comparison** — confirms directly what summation actually buys: a notation whose size doesn't grow with the number of repetitions, unlike explicit repetition's.

### CS Lens

This is the exact same unpacking relationship Lesson 14 already established between a quantifier and a chain of `AND`s or `OR`s, now applied to addition instead of a Boolean combination — a compact notation standing in for a fully explicit, potentially very long, expansion. Also recognized in: a spreadsheet's `SUM` function, standing in for adding every cell in a range individually; mathematical product notation, `Π`, the equivalent compact form for repeated multiplication; a "select all and total" button in accounting software, standing in for manually adding every line item; a batch-processing instruction like "apply this discount to every item in the cart," standing in for repeating the discount calculation once per item.

### SE Lens

The alternative to summation notation is to keep writing every term explicitly, no matter how many there are. The real cost of that alternative was already established in Concept Unit 1: the calculation itself doesn't change, but the effort and error-risk of writing it out scale directly with the number of items. Summation notation costs the small overhead of learning to read and write `Σ` correctly; it buys a way to state a calculation of any size — twenty items or two thousand — in the same, fixed amount of writing.

---

## Concept Unit 3: Repeated Application of a Rule — the Same Step, Applied Again to Its Own Result

### The Problem

Summation compresses many *separate* terms — `q₁p₁`, `q₂p₂`, and so on — into one notation, but each term still stands on its own, computed independently of the others and then added together. A genuinely different kind of repetition exists, one where each step doesn't stand independently at all: it takes the *previous* step's result and does something to it, producing a new result that the *next* step will, in turn, take as its own starting point. Lesson 21's argument that no natural number finishes counting relied on exactly this, informally, without naming it.

### No isolated lab for this step

This concept has no code of its own to isolate — repeated application is demonstrated directly below, revisiting Lesson 21's own argument, not through a construct with its own syntax.

### Applying It — Counting Up From Zero

**The rule, stated once:** take the current number, and add `1` to it.

**Applying the rule to `0`:** `0 + 1 = 1`.

**Applying the exact same rule again, this time to `1` — the result of the previous application, not to `0` again:** `1 + 1 = 2`.

**Applying it again, to `2`:** `2 + 1 = 3`.

**Naming what's actually happening, precisely:** unlike summation's independent terms, each application here depends directly on the one before it — the rule "add one" was applied to its own previous output, three times in a row, producing `0`, then `1`, then `2`, then `3`, each one feeding directly into the next.

**Connecting this directly to Lesson 21:** this is exactly the mechanism behind Lesson 21's `N + 1` argument — counting the natural numbers is nothing more than repeated application of "add one," starting from `0`, with Lesson 21's whole point being that this particular repeated application never has a reason to stop.

### Walkthrough

- **"take the current number, and add `1` to it"** — first appearance of a rule meant to be applied repeatedly, stated once, independent of any specific number it will be applied to.
- **`0 → 1 → 2 → 3`, each arrow one application of the same rule to the previous result** — first appearance of *repeated application*, demonstrated concretely as a chain where each step's input is the previous step's output.
- **The explicit connection to Lesson 21's `N + 1` argument** — not a new concept, but the direct naming of a mechanism that lesson already used without a name for it.

### CS Lens

This is the fundamental shape of an iterative process: a fixed rule, a starting value, and a chain of applications where each one's input is the last one's output — the same shape, examined here in its simplest possible form, that will recur throughout the rest of this curriculum in far more elaborate settings. Also recognized in: compound interest, where each period's balance is computed by applying the same interest rule to the previous period's balance; a thermostat's control loop, repeatedly applying the same "check temperature, adjust" rule to whatever state the room was left in by the last application; a video game's physics engine, repeatedly applying the same "update position based on velocity" rule, frame after frame, to the position the last frame left the object in; a population growth model, repeatedly applying the same growth rule to whatever population size the previous generation left behind.

### SE Lens

The alternative to recognizing repeated application as its own distinct kind of repetition is to treat every repeated process as though it were summation's independent terms, computable in any order or all at once. The real cost of that alternative is a serious category error: `0 + 1 = 1`, then `1 + 1 = 2`, genuinely cannot be reordered or computed independently the way `q₁p₁` and `q₂p₂` can — the second application requires the first one's result to have already been produced, exactly the order-dependence Lesson 6 already established for state. Recognizing repeated application as fundamentally different from summation, as this unit does, costs the effort of noticing the dependency between steps; it is essential for correctly reasoning about anything built from it later in this curriculum.

---

## Concept Unit 4: When Does It Stop? — the Need for a Stopping Condition

### The Problem

Concept Unit 3's counting example was stopped, informally, after three applications, purely because that was enough to demonstrate the pattern. Lesson 21 already established that this particular repeated application — adding one, starting from zero — genuinely never has a reason to stop on its own. Most real uses of repeated application need to stop at some specific, meaningful point, and nothing about "apply this rule repeatedly" states, on its own, when that point has been reached.

### No isolated lab for this step

This concept has no code of its own to isolate — the need for an explicit stopping condition is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Counting Up to a Specific Limit

**A version of Concept Unit 3's counting with an actual purpose:** count up from `0`, one application at a time, until reaching `5` — perhaps counting a stack of items as they're placed down, needing to know when exactly five have been placed.

**Applying the rule repeatedly, checking after each application whether to continue:** `0`. Check: is this `5`? No — continue. Apply the rule: `1`. Check: is this `5`? No — continue. Apply the rule: `2`. Check: no — continue. `3`. Check: no — continue. `4`. Check: no — continue. `5`. Check: is this `5`? Yes — stop.

**Naming the check performed after every application, precisely:** a guard (Lesson 12), checked repeatedly rather than once, deciding after each application whether repeated application should continue or halt.

**Confirming what would happen without this check, connecting directly to Lesson 21:** without a stopping condition, this process is indistinguishable from Lesson 21's counting of the natural numbers — it would continue applying "add one," forever, with nothing to ever cause it to halt, exactly the infinite process that lesson demonstrated never finishes.

### Walkthrough

- **Counting up to `5`, with an explicit check after every application** — demonstrates a stopping condition concretely, applied to the exact rule from Concept Unit 3.
- **"is this `5`?" checked six separate times, once per number produced** — first appearance of *stopping condition*, shown as a guard checked repeatedly, not just once.
- **The explicit connection to what happens without one** — a direct reappearance of Lesson 21's infinite natural numbers, applied here to show precisely what an omitted stopping condition would actually mean: not an error exactly, but an unintended, unending repetition.

### CS Lens

This is the recognition that repeated application, on its own, describes only how to take one more step — it says nothing about when to take the last one, which has to be supplied separately and explicitly. Also recognized in: a countdown timer, which repeatedly decrements but must be told explicitly what value to stop at; a manufacturing line's batch-production run, which repeats its process but must be told explicitly how many units constitute a completed batch; a search process, which repeatedly examines candidates but must be told explicitly what condition (found the target, or exhausted every candidate) ends the search; a workout routine's repetition count, which repeats an exercise but requires an explicitly stated number of repetitions to know when a set is complete.

### SE Lens

The alternative to an explicit stopping condition is to assume repeated application will "naturally" know when to stop, the way it might feel intuitive that counting to five should obviously stop at five. The real cost of that alternative is exactly Lesson 21's warning made concrete and operational: without an explicit, checked condition, a repeated process has no mechanism to halt at all, and "obviously stops at five" was never actually built into the rule "add one" — it was supplied, silently, by the person running through the example by hand. Making the stopping condition explicit and checked, as this unit does, costs one additional check per repetition; it is the only thing that actually distinguishes a repeated process meant to finish from Lesson 21's genuinely unending one.

---

## Concept Unit 5: Explicit Repetition and Repeated Application Are the Same Idea, Two Ways

### The Problem

Concept Unit 2's summation and Concept Unit 3's repeated application have been presented as two different kinds of repetition — but it's worth checking directly whether they're actually as different as they've seemed, or whether one can be understood as a specific case of the other.

### No isolated lab for this step

This concept has no code of its own to isolate — the equivalence is demonstrated directly below by unrolling one into the other, not through a construct with its own syntax.

### Applying It — Unrolling Repeated Application Into Explicit Terms

**Concept Unit 4's stopped counting process, listing every intermediate result it actually produced:** `0`, `1`, `2`, `3`, `4`, `5`.

**Rewriting this sequence as a chain of explicit additions, the way Concept Unit 2's explicit repetition was written:** `0 + 1 + 1 + 1 + 1 + 1 = 5` — five separate `+1` terms, added explicitly, producing the exact same final value the repeated-application process reached.

**Confirming the connection precisely:** repeated application of "add one," stopped after five applications, and the explicit sum `0 + 1 + 1 + 1 + 1 + 1`, are two different ways of describing the identical calculation — one describes it as a chain of dependent steps, each needing the last one's result; the other describes it as a single, already-known-length sum, computable the moment it's written down.

**Stating the general relationship, honestly, without over-claiming:** any repeated application that runs for a definite, known number of steps can be unrolled into an explicit sum (or more general explicit repetition) of that same length. This does not mean the two are always equally convenient to use — Concept Unit 4's version needed to check a condition after each step, something the fully unrolled explicit sum no longer shows at all — but it confirms they are, underneath, expressing the same idea.

### Walkthrough

- **`0, 1, 2, 3, 4, 5`, the sequence of results from Concept Unit 4's stopped process** — a direct reappearance of that unit's own worked example, examined here from a new angle.
- **`0 + 1 + 1 + 1 + 1 + 1 = 5`** — the same sequence, rewritten as explicit repetition (Concept Unit 2), demonstrating that the repeated-application process and an explicit sum can describe the same underlying calculation.
- **"two different ways of describing the identical calculation"** — not a new concept, but the precise statement of this unit's central point, connecting Concept Units 2 and 3 rather than leaving them as two unrelated ideas.
- **The honest qualification about convenience and the stopping check** — an explicit acknowledgment that the two forms are equivalent in result, without overstating that they are equivalent in every practical respect.

### CS Lens

This is the recognition that two notations describing repetition — one emphasizing "here are all the separate pieces" and one emphasizing "here is a process, and when it stops" — can express the exact same underlying computation, chosen based on which aspect is more useful to make visible in a given context. Also recognized in: a "for" loop with a known, fixed number of repetitions and a fully unrolled sequence of identical statements being functionally interchangeable, with compilers sometimes literally performing this unrolling automatically; a mathematical recurrence relation and its closed-form solution describing the same sequence of values through two different representations; a musical repeat sign and the fully written-out repeated passage representing the same performed music; an assembly instruction's loop and its fully expanded sequence of individual instructions being two representations of the same executed program.

### SE Lens

The alternative to checking this equivalence directly is to treat Concept Unit 2 and Concept Unit 3 as two unrelated topics that happened to appear in the same lesson. The real cost of that alternative is a missed connection this curriculum's own stated philosophy explicitly warns against — leaving two closely related ideas feeling isolated from each other, rather than recognized as two views of one underlying pattern. Confirming the connection explicitly, as this unit does by actually unrolling one into the other, costs one worked comparison; it is what allows the rest of this curriculum to move fluidly between "here's a repeated process" and "here's what it computes, laid out explicitly," recognizing both as legitimate, connected ways of describing the same repetition.

---

## Closing

### Connect the pieces

Two forms of repetition, both applied to counting from `0` to `5`, traced through every unit built in this lesson, start to finish:

1. **The scaling problem named (Unit 1):** a twenty-item receipt, unmanageable to write out by hand, term by term.
2. **Explicit repetition, compressed (Unit 2):** `Σᵢ₌₁²⁰ qᵢpᵢ`, standing in for twenty individually written terms.
3. **Repeated application, a genuinely different shape (Unit 3):** counting up by repeatedly applying "add one" to its own previous result, connected directly to Lesson 21's `N + 1` argument.
4. **A stopping condition, made explicit (Unit 4):** checking "is this `5`?" after every application, without which the process would never halt at all.
5. **The two forms reconciled (Unit 5):** the stopped counting process's own results, `0` through `5`, rewritten as the explicit sum `0 + 1 + 1 + 1 + 1 + 1`, confirming both describe the identical calculation.

Unit 5's unrolled sum is not a fresh example — it is Unit 4's exact stopped process, with every intermediate result it actually produced along the way, rewritten in Unit 2's explicit notation.

### What breaks without this

Suppose Concept Unit 4's stopping condition had been treated as optional, on the assumption that "repeated application obviously stops when it's done" the way it might feel intuitive when counting to five by hand. A process built to repeatedly apply some rule — adding items to a running total, say, as they arrive — with no explicit, checked condition for when to stop, would behave exactly like Lesson 21's natural numbers: it would simply never have a reason to halt, continuing to apply its rule indefinitely, long after whatever real-world event (a shift ending, a batch completing) should have caused it to stop. Nobody would have decided this on purpose — the omission would look, from a distance, like a completed, working process, right up until it becomes clear it never actually finished, because "finishing" was never actually built into it. Restoring Concept Unit 4's explicit, checked stopping condition — deciding, and stating, precisely when repeated application should halt — is what turns an open-ended, Lesson-21-style unending process into one that reliably does a specific, bounded job.

### Exercises

1. **Observe.** Find a calculation in your own past exercises (from any earlier lesson) that repeats the same shape of step more than twice. Write it first as explicit repetition, the way Concept Unit 1 wrote the twenty-item receipt.
2. **Formalize.** Rewrite your Exercise 1 calculation using summation notation, the way Concept Unit 2 rewrote the receipt as `Σᵢ₌₁²⁰ qᵢpᵢ`.
3. **Formalize.** Choose a rule of your own (other than "add one") and apply it repeatedly to a starting value, by hand, for four or five steps, the way Concept Unit 3 counted `0 → 1 → 2 → 3`. State the rule once, separately from any specific application of it.
4. **Explain.** Add an explicit stopping condition to your Exercise 3 process, the way Concept Unit 4 checked "is this `5`?" State exactly what would happen if the stopping condition were left out.
5. **Formalize.** Unroll your Exercise 3 and 4 process into an explicit sum or explicit repetition, the way Concept Unit 5 rewrote the counting process as `0 + 1 + 1 + 1 + 1 + 1`. Confirm both forms produce the same final result.

### Definition of done

- [ ] You can state, in your own words, the difference between explicit repetition and repeated application of a rule, without describing one only as "the opposite of" the other.
- [ ] You can write a repeated calculation of your own using summation notation, and confirm it names the same calculation as writing every term out by hand.
- [ ] You can apply a rule of your own choosing repeatedly to its own previous result, by hand, for several steps, correctly tracking which result feeds into which application.
- [ ] You can explain why a stopping condition must be explicit, using Lesson 21's infinite natural numbers to explain what happens without one.
- [ ] You completed Exercises 1–5 using your own calculation and rule, not the receipt or the counting-to-five examples.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating whether your Exercise 3 rule's repeated application felt more natural to think about as a chain of dependent steps or as an unrolled explicit sum, and why.
