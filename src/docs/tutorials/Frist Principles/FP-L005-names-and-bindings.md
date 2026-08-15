# Lesson 5: Names and Bindings

**What you will build:** Still nothing runnable — this lesson introduces a way to refer to a value by what it means rather than by writing the value itself: a *name*, made to stand for a value through a *binding*, tracked in a mental model called an *environment*. The transferable problem this lesson is actually about: every expression built so far has used values written directly into it (`3 + 5`), which only works if the value is already known and never needs to change from one use of the expression to the next — real calculations, like a recipe scaled for however many batches are being made today, need a way to plug in a quantity without rewriting the expression itself.

**What you need to know first:** Lesson 3 (`FP-L003-values-and-operations.md`) — specifically *value*, reused directly throughout. Lesson 4 (`FP-L004-expressions-and-evaluation.md`) — specifically *expression*, *reduction step*, and *evaluation*, all reused directly in Concept Unit 4, which extends Lesson 4's reduction process to handle names.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Name** — a symbol used to stand for a value, distinct from the value itself. `batches` is a name; it is not a number, and has no numeric value of its own until something says what value it stands for. Naming this separately from *value* matters because a name can stand for different values on different occasions, while a value like 5 is always just 5.
- **Binding** — an association between a name and a specific value, made deliberately — "let `batches` be 3" binds the name `batches` to the value 3. A binding is what gives a name meaning at all; before a name is bound, it refers to nothing.
- **Environment** — the current collection of every active binding, all at once — a record of exactly which value each currently-meaningful name stands for. An environment is the mental model this lesson uses for "what does each name currently mean," the same way a table listing every name alongside its bound value would.
- **Substitution** — replacing a name in an expression with the value it is bound to in the current environment, as a step that happens before ordinary evaluation (Lesson 4) can proceed. An expression containing a name is not yet made only of values and operations — substitution is what turns it into one.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues working entirely in plain arithmetic notation, using one running example — scaling a recipe by a chosen number of batches.

---

## Concept Unit 1: What a Name Is

### The Problem

Every expression built in Lessons 3 and 4 used values written directly into it: `3 + 5`, `(2 × 3.50 + 1.20)`. This works perfectly well as long as the actual numbers are already known and fixed. But consider a recipe that calls for 2 cups of flour per batch, and a cook who might make 1 batch today, 3 tomorrow, or 5 for a weekend event. Writing a fresh expression each time — `1 × 2`, then `3 × 2`, then `5 × 2` — treats what is really the same calculation, "flour needed equals batches times 2," as if it were a different calculation every time the batch count changes. What's actually wanted is a way to write "batches times 2" once, leaving the specific number of batches to be supplied separately, whatever it happens to be on a given day. That requires something to stand in for "however many batches, whatever that turns out to be" inside the expression itself — a name.

### No isolated lab for this step

This concept has no code of its own to isolate — distinguishing a name from the value it might eventually stand for is a distinction made in plain language, not a construct with its own syntax.

### Applying It — Scaling a Recipe

**The recurring calculation, written with the batch count left unspecified:** "flour needed equals `batches` times 2 cups."

**Confirming `batches` is not itself a value:** unlike `3` or `5`, `batches` has no fixed numeric meaning sitting inside it. Asked "what is `batches`?" outside of any particular day's baking, there is no answer — it is a placeholder for whichever quantity turns out to be relevant, not a quantity itself.

**Why this earns a name of its own, distinct from "value":** Lesson 3 was careful to say a value is self-contained and complete on its own. `batches` is deliberately the opposite of that — it is incomplete until something says what it stands for. Confusing the two would make it impossible to say precisely what's still missing from an expression like `batches × 2`.

### Walkthrough

- **`batches`, used inside "flour needed equals `batches` times 2 cups"** — first appearance of *name*: a symbol standing for a value, without yet being one.
- **"asked 'what is `batches`?'... there is no answer"** — demonstrates directly that a name, on its own, carries no numeric meaning; it depends entirely on something outside itself to become meaningful.
- **The contrast with Lesson 3's *value*** — not a new concept, but a deliberate, direct comparison: a value is complete and self-contained; a name is exactly the opposite, incomplete until it is given a value to stand for.

### CS Lens

This is the idea of a placeholder that refers to something without being that something itself — a symbol whose entire purpose is to be filled in later. Also recognized in: a variable in an algebraic equation, standing for an unknown or as-yet-unspecified number; a blank on a printed form, labeled "Name," waiting for whichever specific name gets written into it; a cell reference in a spreadsheet formula, like `A1`, which means nothing on its own until a value has been entered into the cell it points to; a parameter in a recipe card that says "servings: ___," left blank until a specific number is chosen.

### SE Lens

The alternative to using a name is to write a fresh expression, with actual numbers plugged in directly, every single time the underlying calculation is needed with a different quantity. The real cost of that alternative is duplicated work with no way to see, from the expressions alone, that `1 × 2`, `3 × 2`, and `5 × 2` are all really the same calculation — "batches times 2" — applied three different times. Writing the calculation once, using a name for the part that varies, costs the small overhead of introducing a symbol that itself has no fixed meaning, in exchange for being able to state a calculation exactly once and reuse it for however many different quantities come up.

---

## Concept Unit 2: Binding a Name to a Value

### The Problem

A name like `batches` is only useful once it actually stands for something specific, on a given occasion. Today, the cook has decided to make 3 batches. Saying so — deciding, deliberately, that `batches` means 3 for the purposes of today's baking — is a distinct act from simply having the name `batches` available to use. Concept Unit 1 established what a name is; this unit is about the moment a name actually acquires a meaning.

### No isolated lab for this step

This concept has no code of its own to isolate — the act of deciding a name's value is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Scaling a Recipe

**The decision, stated plainly:** "let `batches` be 3" — from this point forward, in today's baking, `batches` stands for the value 3.

**Confirming this is a deliberate act, not a fact discovered:** nothing about the name `batches` itself determined that it should mean 3 today; a different day, with a different decision, could just as easily bind it to 1 or to 5. The value 3 was chosen, for today, and attached to the name on purpose.

**What changes about `batches` now that it's bound:** before this binding, asking "what is `batches`?" had no answer (Concept Unit 1). After it, the answer is 3 — specifically, for as long as this binding remains in effect.

### Walkthrough

- **"let `batches` be 3"** — first appearance of *binding*: the deliberate act of associating a name with a specific value.
- **"a different day... could just as easily bind it to 1 or to 5"** — establishes that a binding is a choice, made on a particular occasion, not a fixed fact about the name.
- **"before this binding, asking 'what is `batches`?' had no answer... after it, the answer is 3"** — not a new concept, but a direct before/after comparison confirming what a binding actually changes: whether the name has an answer to that question at all.

### CS Lens

This is the moment a placeholder acquires an actual referent — the act, not just the possibility, of a symbol coming to stand for something specific. Also recognized in: assigning a value to a variable in any programming language; filling in the blank on a form with an actual name; a contract's defined-terms section, where a capitalized term like "the Property" is explicitly bound, in one clause, to mean a specific address for the rest of the document; a mathematical proof's opening line, "let `n` be an arbitrary positive integer," which binds `n` for the remainder of the argument.

### SE Lens

The alternative to explicitly binding a name is to let its meaning be inferred from context, or left ambiguous, trusting that whoever reads the expression will supply the right value themselves. The real cost of that alternative is exactly Lesson 2's cost, applied to names instead of requests: two readers of "flour needed equals `batches` times 2," with no stated binding, might each silently assume a different number of batches, and never notice they assumed differently until their two answers disagree. Stating a binding explicitly — `batches` is 3, today — costs one short, precise sentence, and removes any question about what the name means for the rest of the calculation.

---

## Concept Unit 3: The Environment

### The Problem

Today's baking needs more than one name: `batches` (3), and also `cups_per_batch`, the amount of flour one batch requires (2). Once more than one binding is active at the same time, keeping track of "what does each name currently mean" needs more than remembering a single fact — it needs a way to hold several bindings at once and look any of them up when needed. That collection of all currently active bindings, considered together, is what this lesson calls an environment.

### No isolated lab for this step

This concept has no code of its own to isolate — an environment is a mental model for a collection of bindings already introduced above, shown directly as a table, not a construct with its own syntax.

### Applying It — Scaling a Recipe

**Today's two bindings, both active at once:**

> - `batches` → 3
> - `cups_per_batch` → 2

**The environment, named as the collection of both bindings together:** asked "what does `batches` mean right now?", the answer comes from looking it up in this collection: 3. Asked the same about `cups_per_batch`: 2. Neither answer requires knowing anything about the other binding — the environment simply holds both, available to be looked up independently.

**Why a single environment, rather than two separate, disconnected facts:** an expression like `batches × cups_per_batch` needs both names' values at once to be evaluated at all (this is worked out fully in Concept Unit 4). Having one place that holds every currently active binding is what makes looking up whichever names an expression actually uses straightforward, no matter how many bindings happen to be active.

### Walkthrough

- **The two-row table, `batches → 3` and `cups_per_batch → 2`** — first appearance of *environment*: a collection of every currently active binding, held together so any of them can be looked up.
- **"asked 'what does `batches` mean right now?'... look it up"** — establishes the environment's actual job: answering exactly the question Concept Unit 1 showed a bare name cannot answer on its own.
- **"neither answer requires knowing anything about the other binding"** — not a new concept, but a clarification that an environment is a collection of independent facts, not itself a calculation or a relationship between the bindings it holds.

### CS Lens

This is the idea of a lookup table holding every currently meaningful name-to-value association at once, consulted whenever a name's current meaning is needed. Also recognized in: a spreadsheet's full set of named cells, any of which a formula can reference; a phone's contacts list, mapping each saved name to a phone number, looked up whenever that name is dialed; a dictionary, mapping each word to its definition, consulted whenever that word is encountered; a company directory, mapping each employee's name to their extension, consulted by anyone needing to reach them.

### SE Lens

The alternative to keeping every active binding in one place is to track each one separately, remembered individually rather than held together as a single collection. The real cost of that alternative grows with the number of bindings in play: with only `batches`, it's manageable to just remember "3"; with `batches` and `cups_per_batch` both active, and more names likely to join them as calculations grow, tracking each one as an independent, disconnected fact becomes error-prone in a way that a single consulted collection is not. Maintaining one environment costs nothing beyond organizing what would have to be tracked anyway, and it is what makes "look up whatever this name currently means" a single, uniform operation rather than a different lookup process for every name.

---

## Concept Unit 4: Substitution During Evaluation

### The Problem

Lesson 4 defined evaluation as repeatedly reducing a subexpression made only of plain values, applying its operation, until a single value remains. `batches × cups_per_batch` is not made only of plain values — it contains two names, and Lesson 4's reduction process, as stated, has nothing to say about a name; it only knows how to reduce an operation applied to values it already has. Before Lesson 4's evaluation process can do anything with this expression at all, each name inside it has to be replaced by whatever it's currently bound to, according to the environment. That replacement step is what makes the rest of evaluation possible exactly as already defined.

### No isolated lab for this step

This concept has no code of its own to isolate — substitution is demonstrated directly as a first step added in front of Lesson 4's already-established reduction process, not through a new construct with its own syntax.

### Applying It — Scaling a Recipe

**The expression, containing two names:** `batches × cups_per_batch`.

**The environment from Concept Unit 3, consulted for each name:**

> - `batches` → 3
> - `cups_per_batch` → 2

**Substitution, performed once for each name, before any reduction is attempted:** replace `batches` with 3, and `cups_per_batch` with 2. The expression becomes `3 × 2` — made entirely of plain values, exactly the form Lesson 4's reduction process already knows how to handle.

**Evaluation, continuing exactly as Lesson 4 already described, with nothing new required:** `3 × 2` is a subexpression made only of plain values — ready to reduce. Applying multiplication: `3 × 2` becomes `6`. Today's recipe needs 6 cups of flour.

### Walkthrough

- **`batches × cups_per_batch`** — reappears from Concept Unit 1, now shown as something that cannot yet be evaluated by Lesson 4's process, because it contains names rather than only values.
- **Substituting `batches` with 3, then `cups_per_batch` with 2** — first appearance of *substitution*: consulting the environment (Concept Unit 3) for each name's current binding, and replacing the name with that value directly in the expression.
- **`3 × 2`, now made entirely of plain values** — the direct result of substitution: an expression in exactly the form Lesson 4's reduction process was already built to handle.
- **`3 × 2` reducing to `6`** — a reappearance of ordinary reduction from Lesson 4, applied without any modification, now that substitution has already removed every name from the expression.

### CS Lens

This is the idea of a lookup-and-replace step performed before an already-established process can run, rather than building an entirely new process to handle the new case. Also recognized in: a spreadsheet resolving every cell reference in a formula to its current value before computing the formula's result; a mail-merge tool replacing every `{{name}}` placeholder in a template with an actual recipient's name before the letter is finalized; a template engine rendering a web page by substituting each variable placeholder with real data before the page is sent to a browser; algebra's own substitution step, replacing a variable with a given value before simplifying an expression by hand.

### SE Lens

The alternative to substitution as a separate step is to try to extend Lesson 4's reduction process itself to somehow understand names directly, teaching every operation how to look things up in an environment on its own. The real cost of that alternative is duplicated complexity: every operation — addition, multiplication, all the others — would need its own logic for handling a name as an operand, when in fact none of them actually need to; they only ever need plain values, exactly as Lesson 4 already defined. Performing substitution as one clean step before evaluation begins costs nothing extra in the operations themselves, and keeps Lesson 4's reduction process completely unchanged — it only ever sees expressions made of plain values, by the time it's asked to do anything.

---

## Concept Unit 5: Unbound Names

### The Problem

Suppose the recipe calculation is written slightly differently: `batches × cups_per_batch × servings_per_person`, intended to also account for how many people each batch serves. If `servings_per_person` was never actually bound — nobody decided, today, what value it should have — then Concept Unit 4's substitution step has nothing to replace it with. This is not a small oversight to shrug off; it is the exact same shape of gap Lessons 1 through 3 already named repeatedly: an input, here a name, for which no outcome — here, no bound value — has been defined at all.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that substitution has nothing to do with an unbound name is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Scaling a Recipe

**The expression, containing a name with no binding in today's environment:** `batches × cups_per_batch × servings_per_person`.

**Today's environment, exactly as it was in Concept Unit 3, with nothing added for the third name:**

> - `batches` → 3
> - `cups_per_batch` → 2

**Attempting substitution:** `batches` is replaced with 3; `cups_per_batch` is replaced with 2. `servings_per_person` has no entry in the environment to look up at all — there is no value to substitute it with. The expression cannot be reduced to `3 × 2 × [something]`, because there is no "something" the environment can supply.

**Connecting this directly to earlier lessons:** Lesson 1 named an assumption as a condition taken as already true and never checked; using `servings_per_person` in this expression silently assumes it has already been bound. Lesson 2 named an undefined case as an input nobody decided an outcome for; an unbound name, encountered during substitution, is exactly that. Lesson 3 and Lesson 4 both found the same shape of gap inside a single operation (division by zero) and inside a whole expression (a subexpression with no value); an unbound name is the same gap again, this time arising before evaluation even begins, at the substitution step itself.

### Walkthrough

- **`batches × cups_per_batch × servings_per_person`** — introduces a third name into the running expression, deliberately without adding a corresponding binding to the environment.
- **"there is no 'something' the environment can supply"** — first appearance, in this lesson, of an unbound name's actual consequence: not a wrong substitution, but no substitution possible at all.
- **The connections to Lessons 1 through 4** — not new concepts, but explicit, brief restatements of *assumption*, *undefined case*, and the earlier undefined-operation and undefined-subexpression findings, each reused per the Repetition Rule rather than re-derived from scratch.

### CS Lens

This is the fact that a lookup performed against an incomplete collection can fail to find anything at all — the same shape of gap as an operation with no defined result, now arising one step earlier, during substitution itself. Also recognized in: a spreadsheet formula referencing a cell that was deleted, displaying a reference error instead of a number; a broken hyperlink pointing to a web page that no longer exists; a mail-merge template with a placeholder for a field that was left blank in the underlying data; a phone contact list being asked for a name that was never actually saved.

### SE Lens

The alternative to treating an unbound name as a real, checkable failure is to let substitution silently supply some default (0, perhaps, or an empty value) whenever a name has no binding, rather than stopping to say the name is missing. The real cost of that alternative is identical to Lesson 2's blank-spreadsheet-cell story: a silent default hides the fact that nobody ever actually decided what `servings_per_person` should be, and the calculation proceeds anyway, producing a confident-looking number that answers a question nobody actually specified. Treating an unbound name as its own distinct, reportable case — rather than quietly defaulting it — costs nothing beyond checking the environment before substituting, and is what makes it possible to say plainly "this calculation is missing a value it needs," instead of silently guessing one.

---

## Closing

### Connect the pieces

One calculation, traced through every unit built in this lesson, start to finish:

1. **A name, standing for an as-yet-unspecified quantity (Unit 1):** `batches`, distinct from any specific value.
2. **A binding, deciding what it means today (Unit 2):** "let `batches` be 3."
3. **An environment, holding every active binding at once (Unit 3):** `batches → 3`, `cups_per_batch → 2`.
4. **Substitution, turning a name-containing expression into a plain-value expression (Unit 4):** `batches × cups_per_batch` becomes `3 × 2`, which Lesson 4's reduction process then evaluates to `6`.
5. **An unbound name, the gap substitution cannot cross (Unit 5):** `servings_per_person`, absent from the environment, leaving `batches × cups_per_batch × servings_per_person` with no possible substitution and therefore no value.

Unit 4's finished evaluation, `6`, is the same expression Unit 5 goes on to extend by one more name — the failure in Unit 5 is not a fresh example, it is Unit 4's working calculation, deliberately pushed one name further than today's environment actually supports.

### What breaks without this

Suppose Unit 5's check were skipped entirely, and instead of stopping to report a missing binding, an unbound name was silently treated as though it were bound to 0 whenever it lacked a real binding — a common default in many real calculation tools when a cell or variable is empty. `servings_per_person`, never actually bound, silently becomes 0. The expression now substitutes cleanly: `3 × 2 × 0`, which reduces, following Lesson 4's process exactly, to `0`. The calculation reports that today's recipe needs zero cups of flour — a confident, fully-evaluated, entirely wrong answer, produced not because any operation malfunctioned, but because a missing binding was papered over with a default nobody chose on purpose. Nothing about this looks broken from the outside; a number came out, and the process that produced it followed every rule correctly, given the silently substituted 0. Restoring Unit 5's check — reporting an unbound name as its own distinct case rather than defaulting it — replaces this wrong, confident answer with an honest one: the calculation cannot proceed until `servings_per_person` is actually given a value by someone who knows what it should be.

### Exercises

1. **Observe.** Write an everyday calculation that would benefit from a name instead of a fixed number — something you'd calculate differently depending on a quantity that varies (trip cost depending on the number of travelers, for instance). Name that varying quantity, the way Concept Unit 1 named `batches`.
2. **Predict.** For the name you chose in Exercise 1, write a binding for it — a specific value, chosen the way Concept Unit 2 chose `batches` = 3 — and predict what your calculation's expression will reduce to before actually working it out.
3. **Formalize.** Write out the environment holding your Exercise 2 binding, alongside at least one other binding your calculation needs, the way Concept Unit 3 held both `batches` and `cups_per_batch` together.
4. **Explain.** Substitute both bindings from Exercise 3 into your calculation's expression, the way Concept Unit 4 did, and then evaluate the resulting plain-value expression step by step, per Lesson 4.
5. **Formalize.** Add one more name to your calculation that your Exercise 3 environment does not have a binding for. Attempt substitution and explain exactly where and why it fails, the way Concept Unit 5 did for `servings_per_person`.

### Definition of done

- [ ] You can state, in your own words, the difference between a name and a binding, without describing one in terms of the other.
- [ ] You can explain why an environment is needed once more than one binding is active at the same time.
- [ ] You can substitute a set of bindings into a name-containing expression and finish evaluating it using Lesson 4's reduction process, showing every step.
- [ ] You can explain, using Lesson 1 and Lesson 2's vocabulary, why an unbound name is the same shape of gap as an undefined case or an unchecked assumption, not a different kind of problem.
- [ ] You completed Exercises 1–5 for a calculation of your own choosing, not the recipe-scaling example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating what silently defaulting your Exercise 5 unbound name to 0 would have produced, and why that answer would have been wrong.
