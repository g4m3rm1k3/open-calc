# Lesson 1: What Is a Computational Problem?

**What you will build**: By the end of this lesson you will be able to take a vague, everyday question and turn it into a *precise computational specification* — a written statement of exactly what information a solution is given (its input), exactly what it must produce (its output), the rule connecting the two (the transformation), any extra conditions that must always hold (constraints), any information that must be tracked and carries forward while the work happens (state), and a test for whether a candidate answer is actually right (correctness). This lesson builds no software — Lesson 2 is where the first real code appears — but it builds the vocabulary and the specification-writing skill that every lesson from here forward assumes you already have.

**What you need to know first**: Nothing. This is the first lesson in the series. (If you've written a Python function before — even something as small as a loop that adds up numbers — you already have informal experience with several of these ideas; this lesson makes them precise and gives them names.)

**A note on this lesson's format**: Later lessons in this series follow a strict pattern — introduce a programming-language construct, isolate it in throwaway code, run it, see real output, then use it for real. That pattern exists specifically to teach *language constructs*: pieces of Python, Clojure, or another language's syntax. This lesson doesn't teach any language construct; it teaches ideas (input, output, constraint, and so on) that exist independently of any programming language and that you need before the first line of real code in Lesson 2 makes sense. So each idea below gets a fully worked, concrete example instead of a code lab, and this schema's code-specific steps — files changed, commands run, program output — are simply absent below rather than repeated as "not applicable" in every one of the eight units that follow. Lesson 2 is where those steps start appearing for real, and every lesson after it assumes real code throughout.

**Terms introduced in this lesson**:

- **computational problem** — a task with well-defined inputs and required outputs, precise enough that a fixed procedure could, in principle, produce the output from the input every time. *Why it matters*: this is the line between "something we can write an algorithm for" and "something too vague to even attempt yet" — every later lesson on algorithms, proofs, and data structures assumes the problem it's solving has already crossed this line.
- **input** — the information a computational problem is given before any work begins; everything the transformation is allowed to depend on, and nothing more. *Why it matters*: an answer that secretly depends on something not listed as input (today's date, a global counter, "whatever was in memory") can't be reproduced or tested by anyone else — the seed of Lesson 167's *state* vs. *hidden state* distinction and Lesson 277's *testing as specification*.
- **output** — the information a computational problem is required to produce, and only that. *Why it matters*: without a fixed output, two different people can "solve" the same problem and produce answers that are both defensible and incompatible.
- **transformation** — the rule that connects a given input to its required output. *Why it matters*: input and output describe *what*; the transformation is left open on purpose, because many different transformations can satisfy the same input/output description — that gap is exactly what "algorithm design" (Sections V and VI of this series) fills.
- **constraint** — a condition the input, the output, or the transformation itself must always satisfy, beyond just "produce some output." *Why it matters*: most real problems have more requirements than "produce an answer" — legality, safety, resource limits — and a solution that ignores them can be technically an answer and practically wrong.
- **state** — information that persists and can change across the steps of a computation, where its current value affects what happens at the next step. *Why it matters*: many real transformations aren't one memoryless step; they process a sequence where each step depends on what already happened, and treating that dependency as invisible is a recurring source of real bugs (Section X's race conditions are this same idea, later, with more than one process touching the same state at once).
- **correctness** — a precise statement of what "the right answer" means for a problem, written independently of any particular attempt to produce it. *Why it matters*: without stating this up front, "does it work?" can only be answered by whoever wrote the solution — no one else has anything to check it against.
- **specification** — the complete, precise write-up of a computational problem's input, output, constraints, and correctness criterion, produced *before* attempting a solution. *Why it matters*: this is the actual artifact this lesson trains you to produce; every "derive the algorithm" exercise later in this series starts from one.
- **well-defined problem** / **ill-posed problem** — a problem is well-defined once its specification is precise enough that two people implementing it independently would agree on whether any given output is correct; until then, it's ill-posed. *Why it matters*: this is the concrete test used at the end of this lesson to know when you're actually done specifying.

**Objects and methods used**: None. This lesson introduces no programming-language code, class, or method — Lesson 2 begins real Clojure syntax (this series' first language, chosen to match its Little-Schemer-style approach to recursion), and nothing about Clojure or any other language is assumed here. The only prior knowledge this series assumes anywhere is basic Python — variables, loops, and functions — and even that isn't needed until later; this lesson needs none of it.

---

## Concept Unit: What Is a Computational Problem?

### The Problem

Suppose a friend who runs a small coffee shop says: *"I want to know how my shop is doing."*

That sentence is completely reasonable as a thing to want to know, and completely useless as something to hand to a programmer, a mathematician, or even a very literal-minded employee. "How is the shop doing" could mean: today's revenue, this month's profit compared to last month, whether the busiest hour needs a second cashier, whether a particular drink should be discontinued, or a dozen other things — and worse, two different people could each build something that truly answers *a* version of the question and still built completely different things.

This lesson is about the gap between a sentence like that and something precise enough to actually work on. That gap has a name in computer science, and closing it is a skill, not a guess.

### The Concept, Concretely

Take one thread out of "how is the shop doing": *did the shop's cash drawer end the day with the right amount of money in it?*

That's still not quite computational yet, but it's close. Here's what has to happen to make it computational:

- Someone has to say exactly what information is available to answer it — the drawer's starting cash, and the list of every sale and refund that happened that day. That's the **input**.
- Someone has to say exactly what answer is wanted — a single number, the drawer's expected ending cash. That's the **output**.
- Someone has to say what rule turns the input into that output — start with the opening cash, add every sale, subtract every refund. That's the **transformation**.
- Someone has to say what must always hold along the way — no sale can have a negative amount, refunds can't exceed that item's original sale. Those are **constraints**.
- Someone has to track the running total as each sale and refund is processed in order, because the answer after transaction 10 depends on the running total after transaction 9, not just on the raw list. That's **state**.
- Someone has to say how you'd know if a proposed answer were wrong — recompute the running total from opening cash through every listed transaction in order, and compare. That's **correctness**.

Once all six of those are written down, "did the drawer end with the right amount of cash" has stopped being a vague question and become a **computational problem**: a task with well-defined inputs and required outputs, precise enough that a fixed procedure could produce the output from the input every time, regardless of who runs the procedure.

Notice what did *not* have to happen yet: nobody wrote any code, chose a programming language, or decided *how* the running total gets computed (by hand, in a spreadsheet, in Python, in Clojure). That's deliberate — "is this a computational problem yet" is a question you can answer before any of that, and this series will spend the rest of this lesson treating each of the six ingredients above as its own concept, precisely, before Lesson 2 introduces the first real code.

### Generalizing

The coffee shop's cash drawer is one instance of this idea; the definition itself has nothing to do with coffee, cash, or shops. The same six-part shape — input, output, transformation, constraints, state, correctness — applies equally to "sort this list of numbers," "find the shortest route between two cities," "decide whether this password is acceptable," or "compute my final grade for a class." From here on, this lesson keeps returning to a single running example — a bank account processing a day's worth of deposits and withdrawals — because it's small enough to hold in your head in full, but exercises all six ingredients honestly, including the one (state) that's easiest to skip past unnoticed.

### Formal Definition, Walked Through

> A **computational problem** is a pair *(specification, correctness criterion)* where the specification fixes the problem's input and output, and the correctness criterion determines, for any given input and any candidate output, whether that output is an acceptable answer.

Walking through each clause:

- *"fixes the problem's input and output"* — until both sides are fixed, there's nothing to check a candidate solution against; this is why input and output get their own Concept Units next, immediately.
- *"for any given input"* — the criterion has to work for every valid input, not just the one example you happened to think of; a criterion that only makes sense for one specific input isn't a definition, it's an anecdote.
- *"any candidate output"* — critically, the correctness criterion doesn't describe *how* to produce the right answer, only how to recognize one. This is the same input/transformation gap from the worked example above: knowing what a right answer looks like is a weaker, easier requirement than knowing how to produce one, and it's the requirement this lesson is actually about. Producing one is Sections V and VI's job.

### CS Lens

This "describe what counts as correct, separately from how you'd produce it" split has a name that recurs constantly in computer science and mathematics, under different words each time: the *what* is sometimes called a **specification** or a **contract**, and the *how* is sometimes called an **implementation** or a **procedure**. You'll meet this same split again explicitly in Lesson 273 (*Requirements as Specifications*) and Lesson 274 (*Interfaces*), and implicitly in almost everything between here and there.

Also recognized in: a restaurant order ticket (specifies the dish, not the recipe), a legal contract (specifies obligations, not the day-to-day actions that satisfy them), a math textbook's problem statement versus its solution, a job posting's "requirements" section versus the person eventually hired.

### SE Lens

The alternative to writing a specification first is to start writing a solution first and let the "problem" be whatever that solution happens to do. That alternative is genuinely faster in the first five minutes and is the single most common source of the failure mode this lesson opened with: two people (or one person, twice, six months apart) each produce something that runs without errors and solves two different problems. The cost isn't paid at the start — it's paid the first time someone needs to change the solution, test it, or hand it to someone else, and discovers that "correct" was never actually written down anywhere. This series will ask you to write a specification before a solution often enough that it stops feeling like paperwork and starts feeling like the obvious first move — that's Lesson 110 (*Specifications Before Algorithms*) made into a habit early.

---

## Concept Unit: Inputs

### The Problem

Go back to the running total from the coffee shop drawer. Suppose someone points out: *"Wait, don't we also need to know if the store had a sale event that day? Prices were different."* Are sale-event prices part of the input, or not?

This is a genuinely common way specifications go wrong: not by getting the transformation wrong, but by silently leaving something out of — or silently sneaking something into — the list of things the answer is allowed to depend on.

### The Concept, Concretely

Define input precisely for the bank-account version of this running example, since that's the one this lesson carries forward: *A bank account starts a day with some opening balance, and receives an ordered list of transactions, where each transaction is either a deposit of some positive amount or a withdrawal request for some positive amount.*

Notice everything that sentence had to make explicit:

- **What kind of thing** each piece of input is (a number; an ordered list; each list entry is one of two kinds of thing).
- **The order matters** — "an ordered list," not "a list" — because (as the State unit below will show) processing transactions in a different order can produce a different result.
- **What each transaction is allowed to be** — a deposit or a withdrawal *request*, not a withdrawal — because whether a withdrawal actually succeeds depends on the balance at the time, which isn't decided yet at the input stage.

Anything not named in that sentence — today's date, whether the branch was open, the account holder's name — is, by definition, *not* part of this problem's input. A solution isn't allowed to depend on it, and a specification doesn't need to account for it.

### Generalizing

"Input" is not "whatever data happens to be lying around when you start solving the problem" — it's a *deliberate, closed list* of exactly what the transformation may read. The coffee-shop and bank-account examples both needed this same discipline: write down the complete list, including the shape of each piece (a number, an ordered list, one of two kinds of entry), not just a name for it.

### Formal Definition, Walked Through

> The **input** to a computational problem is the complete set of information supplied before the transformation runs, together with a description of the form each piece of information takes.

- *"complete set"* — nothing the transformation depends on may be missing from this set; if it's not listed, it isn't allowed to matter.
- *"supplied before the transformation runs"* — this is what separates input from state (two units from now): input arrives once, up front; state is produced and changed *during* the run.
- *"description of the form"* — "a list of transactions" is not yet a full input description until "transaction" itself is defined (a deposit or a withdrawal, each carrying an amount). An input description with an undefined shape inside it isn't finished.

### CS Lens

This is the same idea as a function's **parameters** in every programming language you'll ever use — a function's parameter list is a promise about exactly what it's allowed to depend on, and nothing outside that list. Also recognized in: a database query's WHERE-clause inputs, an API endpoint's request body, and a science experiment's controlled variables — in every case, precisely bounding "what am I allowed to use" is what makes the result reproducible and checkable by someone else.

### SE Lens

The tempting shortcut is to let a solution quietly read something convenient that was never declared as input — a global variable, a file that happens to exist, "whatever was left over from last time." It works, once, on your machine. The real cost shows up the first time the same code runs somewhere that convenient thing isn't there, or has a different value than you assumed — and by then the bug is far from the line that caused it. Section IX and X's discussions of state, memory, and processes are full of the fallout from this exact shortcut taken at a larger scale.

### Connection to the previous unit

The previous unit's definition needed input to already be "fixed" before correctness could be checked against it — this unit is what "fixed" actually requires.

---

## Concept Unit: Outputs

### The Problem

Suppose the coffee shop's cash-drawer check returns "everything looks fine." Is that a valid output? What about "the drawer is $4.50 over"? What about "$4.50"? Which of these actually resolves the question, and which just sounds like it does?

### The Concept, Concretely

For the bank-account running example, fix the output precisely: *the account's ending balance after every transaction in the list has been processed, as a single number.*

Contrast with weaker phrasings that feel similar but aren't equivalent problems:

- "Tell me if the account is okay" — not a computational problem yet, because "okay" isn't defined; is a balance of $0.01 okay? $-5?
- "Tell me the transactions that happened" — that's just echoing part of the input back; it doesn't answer "what's the balance."
- "Tell me the ending balance, and which withdrawals were rejected" — this is a genuinely different, larger problem than the first one (two outputs instead of one), even though it reuses the same input and much of the same transformation. Precisely fixing the output is what makes it possible to notice that these are different problems in the first place.

### Generalizing

An output description needs the same two things an input description needs: exactly what is produced, and the shape it takes (a single number, here — not "some information about the balance"). A problem's output can be small (a yes/no, a single number) or structured (a list, a pair of values) — size isn't what makes it well-defined; precision is.

### Formal Definition, Walked Through

> The **output** of a computational problem is the complete, exact information a solution is required to produce for a given input — no more, no less — together with the form it takes.

- *"complete... no more, no less"* — a solution that produces the required output plus extra, undocumented information (a debug log with sensitive data in it, an extra field nobody asked for) hasn't necessarily satisfied the spec better; the extra output is unaccounted for and, in real systems, is often exactly where accidental information leaks happen (a preview of Lesson 283, *Observability*, and Section X's security-adjacent material).
- *"for a given input"* — output is always output *for* some specific input; "the output" in isolation, without naming which input produced it, is not a complete statement.
- *"the form it takes"* — same discipline as input: "a number" is a form; "the balance" alone is a description, not yet a form, until you also say it's a single signed number, not a list, not a rounded string, and so on.

### CS Lens

This is the same idea as a function's **return type** in a typed programming language, an API response's **schema**, and a math function's **codomain**. Also recognized in: a form's required fields (what must come back from a submission, and nothing else assumed), a factory's spec sheet for a manufactured part. In every case, fixing exactly what comes back — not just roughly what it means — is what lets a caller depend on it without reading the implementation.

### SE Lens

The alternative — leaving the output loosely described ("returns some info about the result") — pushes the actual precision decision onto whoever calls the code, later, by trial and error, instead of onto whoever specified it, once, up front. That trade rarely pays off: the caller has less context than the original author, and now has to reverse-engineer a decision that should have been a sentence in a spec. Lesson 281 (*API Design*) is this exact tradeoff, at the scale of a whole library instead of one problem statement.

### Connection to the previous unit

Input fixed what a solution may read; this unit fixes what it must produce — together they're the two halves of *what*, with *how* (the transformation) still completely open, which is exactly where the next unit picks up.

---

## Concept Unit: Transformation

### The Problem

Suppose two people are each handed the exact same input/output description for the bank-account problem: given an opening balance and an ordered list of transactions, produce the ending balance. One of them processes the transactions in the order given. The other — thinking they're being clever — processes all the deposits first, then all the withdrawals, reasoning that "addition and subtraction commute, so order shouldn't matter." Do they get the same answer?

### The Concept, Concretely

Trace a small concrete case to find out.

```
opening balance = 100
transactions, in order: deposit 50, withdraw 200, withdraw 30
```

**Processing in the given order:**

```
Start:  balance = 100
Step 1: deposit 50   → balance = 150
Step 2: withdraw 200 → 150 - 200 = -50, which is < 0: REJECTED, balance stays 150
Step 3: withdraw 30  → 150 - 30 = 120, which is ≥ 0: balance = 120
Ending balance: 120
```

**Processing deposits first, then withdrawals (the "clever" reordering):**

```
Start:  balance = 100
Step 1: deposit 50   → balance = 150
Step 2: withdraw 200 → 150 - 200 = -50, which is < 0: REJECTED, balance stays 150
Step 3: withdraw 30  → 150 - 30 = 120, which is ≥ 0: balance = 120
Ending balance: 120
```

These happen to agree here — but only because there was one deposit and it came first either way. Change the transaction list slightly:

```
opening balance = 100
transactions, in order: withdraw 80, deposit 50, withdraw 60
```

**In the given order:**

```
Start:  balance = 100
Step 1: withdraw 80 → 100 - 80 = 20, which is ≥ 0: balance = 20
Step 2: deposit 50  → balance = 70
Step 3: withdraw 60 → 70 - 60 = 10, which is ≥ 0: balance = 10
Ending balance: 10
```

**Deposits first, then withdrawals:**

```
Start:  balance = 100
Step 1: deposit 50   → balance = 150
Step 2: withdraw 80  → 150 - 80 = 70, which is ≥ 0: balance = 70
Step 3: withdraw 60  → 70 - 60 = 10, which is ≥ 0: balance = 10
Ending balance: 10
```

Still 10, in this case — but notice *why* it's fragile: the only reason the first withdrawal in the true order (withdraw 80 against a balance of 100) didn't get rejected is that the balance happened to be high enough at that moment. Push the numbers slightly further and reordering changes which withdrawal gets rejected, which changes the ending balance. The transformation "process transactions in the order given, rejecting any withdrawal that would take the balance below zero" and the transformation "apply all deposits, then all withdrawals" are two *different* transformations that happen to agree on easy inputs and would disagree on harder ones — and the input/output description alone doesn't say which one is required. That's exactly the gap this unit is about.

### Generalizing

Input and output describe *what* a solution must accomplish; they deliberately leave open *how*. That gap can be filled by more than one transformation — sometimes many correct ones (Lesson 5, *Function Composition*, and Section VI's whole survey of algorithm design strategies are about that variety) — but a specification isn't finished until it says enough about *which* transformation (or family of transformations) actually counts, especially when, as just shown, two seemingly-equivalent reorderings can silently produce different answers on harder inputs.

### Formal Definition, Walked Through

> A **transformation** is a specific rule that produces the required output from a given input, defined precisely enough that following it step by step always produces the same output for the same input.

- *"specific rule"* — not a goal ("get the right balance") but an actual procedure ("process transactions in the given order, applying each one to the current balance").
- *"defined precisely enough that following it step by step always produces the same output"* — this is what separates a transformation from a description of a transformation; "roughly apply the transactions" isn't precise enough to guarantee the two orderings above agree, and the trace above is exactly the kind of check that catches that.

### CS Lens

This gap — one input/output pair, satisfiable by more than one transformation — is the entire reason "algorithm" is a separate idea from "problem." Also recognized in: a recipe versus "the dish" (many different recipes can produce dishes that satisfy the same description), a route versus "get from A to B" (many routes satisfy the same start/end pair), a proof versus "the theorem" (many different proofs establish the same true statement).

### SE Lens

Leaving the transformation under-specified — "process the transactions somehow" — looks like flexibility but is actually just deferred disagreement: the reordering example above shows two implementers can both read the same input/output description, both write reasonable-looking code, and quietly produce different answers on some inputs. The fix isn't to over-specify every internal detail (that would remove the legitimate flexibility Lesson 5 and Section VI depend on) — it's to specify exactly the parts where two reasonable transformations could actually disagree, which the trace above is a concrete method for finding: pick a case, try two plausible approaches, and see if they diverge.

### Connection to the previous unit

Output said what must come out; this unit is the first ingredient that says how — and the trace above shows why "how" can't be skipped even once "what" is already precise.

---

## Concept Unit: Constraints

### The Problem

The transformation traced above already contains a rule that isn't really about *producing* the output at all: "rejecting any withdrawal that would take the balance below zero." Where does a rule like that belong in a specification — is it part of the transformation, part of the output, or something else?

### The Concept, Concretely

Separate it out explicitly for the bank-account problem:

- The balance may never go negative at any point during processing — not just at the end.
- Every transaction amount must be a positive number (a "withdrawal of -10" or "deposit of 0" isn't a valid transaction at all, not even one that gets rejected).

Neither of these is part of *what the output is* (a number) or *how it's computed* (process transactions in order, adjusting the balance) — they're extra conditions the whole computation must respect throughout, and violating either one doesn't mean "produce a different output," it means "this isn't a valid run of the problem at all." That distinction matters: "the balance may never go negative" isn't satisfied by computing a negative balance and reporting it — the constraint forces the transformation itself to behave differently (reject the withdrawal) the moment it would otherwise be violated. This is why the reordering trace in the previous unit mattered: without this constraint written down, "reject transactions that would go negative" wouldn't even be part of the problem, and the two orderings might never have had anything to disagree about.

### Generalizing

A constraint is not a fourth optional add-on next to input, output, and transformation — real problems frequently have constraints that make the difference between a technically-produced answer and a usable one. "Sort this list" versus "sort this list without reordering equal elements relative to each other" (a preview of *stability*, which recurs when sorting algorithms are covered in Section VI) are the same input/output pair with different constraints, and satisfying one doesn't mean you've satisfied the other.

### Formal Definition, Walked Through

> A **constraint** is a condition that the input, the output, or the transformation's behavior at every intermediate step must satisfy, in addition to producing a correctly-shaped output.

- *"input, the output, or the transformation's... intermediate step"* — constraints can live at any of three places: on what counts as valid input at all (a negative transaction amount isn't valid input), on the final output (rarely used alone), or — the case that's easy to miss — on every step along the way, not just the beginning and end. The bank-account balance-never-negative rule is exactly this third kind, which is why it needed calling out separately from output.
- *"in addition to producing a correctly-shaped output"* — a run that produces a correctly-typed number but violated a constraint somewhere along the way (let the balance dip negative mid-processing, then reported the eventual recovery) has still failed the problem, even though the final output "looks" fine in isolation.

### CS Lens

This is the same idea as a database's **integrity constraint** (a column that must never be null, a balance that must never go negative — literally the same example, in real banking software), a type system's **invariant**, and a physical system's **conservation law** (energy, mass — something that must hold at every instant, not just at the start and end of an experiment). You'll meet this idea again, formally, in Lesson 16 (*Invariants*) and Lesson 106 (*Representation Invariants*) — this is the first, concrete appearance of an idea that recurs for the rest of this series.

### SE Lens

The tempting shortcut is to check a constraint only at the end ("compute everything, then check if the final balance is sane") instead of enforcing it at every step. That shortcut is usually wrong for exactly the reason the transformation trace showed: a mid-computation violation can get silently "fixed" by a later transaction and never show up in the final answer, while still representing a moment where a withdrawal should have been rejected and wasn't. Real financial software enforces exactly this constraint at every transaction, not at end-of-day reconciliation, for exactly this reason.

### Connection to the previous unit

The transformation unit traced a rule ("reject withdrawals that would go negative") without yet having a name for what kind of rule it was; this unit gives it one, and shows it belongs to the specification, not buried inside one particular implementation's logic.

---

## Concept Unit: State

### The Problem

Look back at the transformation trace two units ago. Every single step referred to "the current balance" — not the opening balance, not any one transaction's amount, but a running value that the *previous* step had already updated. Where does "the current balance" live in a specification that only lists input and output?

### The Concept, Concretely

Trace the same transaction list again, but this time track explicitly what's known *at each point in time*, not just the final answer:

```
opening balance = 100
transactions, in order: withdraw 80, deposit 50, withdraw 60
```

```
Before any transaction:      current balance = 100  (this is the opening balance — input, not yet state)
After transaction 1 (w 80):  current balance = 20    — depends on the balance before this step
After transaction 2 (d 50):  current balance = 70    — depends on the balance after transaction 1
After transaction 3 (w 60):  current balance = 10    — depends on the balance after transaction 2
```

The value labeled "current balance" is not part of the input (the input is the *opening* balance, a single fixed number, plus the list of transactions) and it's not the output either (the output is only the *final* value, after all three steps). It's a third thing: a value that exists only *during* the computation, gets read and overwritten repeatedly, and whose value at step 3 can only be explained by referring to what happened at step 2 — which is exactly what a formal definition needs to capture.

### Generalizing

Not every computational problem needs state — a problem like "given two numbers, return their sum" has an input and an output and nothing that persists or changes in between. State becomes unavoidable exactly when a problem processes a *sequence* where later steps depend on the accumulated effect of earlier ones, which is common enough (a day's transactions, a game's score over many moves, a compiler reading a file line by line) that it earns its own name rather than being folded into "part of the transformation."

### Formal Definition, Walked Through

> **State** is information that is created or updated during a computation, persists across multiple steps, and whose value at any given step can depend on — and affect — what happens at later steps.

- *"created or updated during a computation"* — this is the line that separates state from input: input exists before the computation starts and doesn't change; state comes into being, or changes, *while* the computation runs.
- *"persists across multiple steps"* — a value used and discarded within a single step isn't state; "current balance," reused at every subsequent step, is.
- *"whose value... can depend on — and affect — what happens at later steps"* — this is the practical consequence that makes state worth naming: get the current balance wrong at step 2 (an off-by-one, an update applied in the wrong order) and every step after it inherits the error, exactly like the trace above shows a running total inheriting each prior step's result.

### CS Lens

This is the same idea, at different scales, as: a variable in a running program that gets reassigned inside a loop; a database's stored data, which persists and changes across many separate requests; a game's save file; a thermostat's current temperature reading, which the next control decision depends on. Also recognized in: an odometer (state that accumulates across a whole trip, not reset per mile), a version-control repository's current commit (depends on the entire history of prior commits, not just the latest one in isolation), a spreadsheet cell containing a formula referencing other cells (its value depends on their current state, and changes when they do).

### SE Lens

The alternative to naming state explicitly is to let it hide inside a loop's local variables with no separate acknowledgment that it exists as a *concept* the specification needs to account for. That's harmless for something as small as this lesson's example — but the exact same shape, at a larger scale, is the root cause of two ideas covered much later in this series: Lesson 212's *race conditions* (two processes updating the same state without coordinating who goes first) and Lesson 167's *mutable state* (the general problem of reasoning about a value that keeps changing underneath you). Naming state as its own concept now, in the smallest possible example, is meant to make it recognizable later at those larger, more dangerous scales.

### Connection to the previous unit

The constraint unit required checking "the balance may never go negative" *at every step*, not just at the end — that requirement only makes sense because there's a "current balance" to check at every step in the first place, which is precisely the state this unit just named.

---

## Concept Unit: Correctness

### The Problem

Five ingredients are now on the table for the bank-account problem: input, output, transformation, constraints, and state. Suppose someone hands you a program (in any language — its internals don't matter yet) and claims it solves this problem. How would you actually check whether they're right, for an input you didn't try yourself?

### The Concept, Concretely

Fix a correctness criterion for the bank-account problem — a rule for checking any candidate output against any input, without needing to know how that output was produced:

> Given an opening balance and an ordered list of transactions, a candidate ending balance is **correct** if and only if it equals the result of: starting at the opening balance, then for each transaction in order — adding the amount if it's a deposit, subtracting the amount if it's a withdrawal *and* the balance stays ≥ 0 after subtracting, otherwise leaving the balance unchanged and skipping that transaction.

Now use it to check three different candidate solutions against the same input (opening balance 100; transactions in order: withdraw 80, deposit 50, withdraw 60):

- **Candidate A** claims the ending balance is `10`. Recompute using the criterion above — this is exactly the trace from the State unit: 100 → 20 → 70 → 10. Candidate A's answer matches. **Correct.**
- **Candidate B** claims the ending balance is `-10` (it summed all transactions arithmetically — `100 - 80 + 50 - 60` — treating every withdrawal as if it always succeeds, without checking whether the balance stayed non-negative at each step). Recomputing with the real criterion still gives `10`, not `-10`. **Incorrect** — and notice this candidate's answer *looks* like a reasonable number, not an obvious error; only checking it against the actual criterion catches the mistake.
- **Candidate C** claims the ending balance is `10`, matching Candidate A — but arrived at it by summing deposits first, then withdrawals (the reordering the Transformation unit tried earlier). For *this specific input*, that earlier trace already showed both orderings happen to land on `10`. Does that mean Candidate C is correct? **Only for this input.** The correctness criterion doesn't ask "did this candidate's method look reasonable" — it asks "does the number match, for this input, according to the criterion" — and separately, whether that method would keep matching on every other input is exactly the kind of question a *proof* (Lesson 300, *Prove the Algorithm*) is for, not something one matching input can settle.

### Generalizing

A correctness criterion is not "check whether the answer looks plausible" — it's a rule precise enough that recomputing it from scratch and comparing is always possible, for any input, without knowing anything about how the candidate answer was produced. That's what let three very differently-produced candidate answers all get checked the same way above.

### Formal Definition, Walked Through

> **Correctness** is a criterion that, given any valid input and any candidate output, determines whether that output satisfies the problem's specification — independent of the method used to produce it.

- *"given any valid input and any candidate output"* — the criterion has to accept arbitrary candidates, including wrong ones (Candidate B above), not just the output of one particular trusted method.
- *"independent of the method used to produce it"* — this is what let Candidate A, B, and C all get checked by the exact same rule even though they were produced three different ways; a correctness criterion that secretly assumes a particular method isn't really independent, and isn't finished.

### CS Lens

This is the same idea as a math proof's **verification** (checking a proof is often far easier than finding one — the same asymmetry Lesson 264, *P and NP*, spends an entire lesson on, much later, in exactly this form), an **automated test** that checks a function's output against an expected result without caring how the function is implemented internally, and a **checksum** (recomputing a small value from data to detect whether the data was corrupted, without needing to know the data's history).

### SE Lens

Skipping this step — building a solution without ever writing down how to check it — is the single most common reason "it works on my machine" and "it's correct" quietly become the same sentence when they aren't. Candidate B's wrong answer above looked exactly as plausible as Candidate A's correct one until it was actually checked against the criterion; without a written correctness criterion, that check has nothing to happen against, and a plausible-looking wrong answer can survive undetected for a long time. This is the seed of Lesson 277 (*Testing as Specification*): a test is, precisely, a correctness criterion applied to one specific input.

### Connection to the previous unit

State gave "current balance" a name and a definition; correctness is what finally uses that full trace — input, transformation, constraints, and every intermediate state — to settle, for any candidate answer, whether it's actually right.

---

## Concept Unit: From Vague Question to Precise Specification

### The Problem

All six ingredients now have names and definitions, tried separately against the bank-account example. This unit does the thing the very first paragraph of this lesson promised: start from a sentence as vague as "how is the shop doing," end at something a specification actually contains, and show the whole path, together, on one input.

### The Concept, Concretely

**The vague question:** *"Can you tell me if the account is in good shape after today's activity?"*

That sentence alone doesn't specify a computational problem — "good shape" isn't defined, and it's not even clear whether "today's activity" means every attempted transaction or only the ones that succeeded. Turning it into a specification means answering, in order, the same six questions this lesson just built:

1. **Input** — what information is this problem allowed to depend on? *An opening balance for the day (a single non-negative number), and an ordered list of that day's transactions, where each transaction is either `deposit(amount)` or `withdraw(amount)` for some positive `amount`.*
2. **Output** — what must the answer be? *The account's ending balance, as a single number, after every transaction has been processed.* (Not "good shape" — a specific number a caller can act on.)
3. **Transformation** — what rule connects them? *Process the transactions in the given order, applying each one to the current balance in turn.*
4. **Constraints** — what must hold throughout, not just at the end? *The balance must never go negative at any point; a withdrawal that would make it negative is rejected instead of applied; every transaction amount must be a positive number.*
5. **State** — what has to be tracked and updated as the work proceeds? *The current balance, which starts at the opening balance and is updated after each transaction, in order — each update depends on the previous one.*
6. **Correctness** — how would you check any candidate answer? *Recompute the ending balance from the opening balance and the full transaction list, in order, applying the same transformation and constraint above; a candidate answer is correct exactly when it matches.*

**A full trace against one concrete input**, connecting all six:

```
Input:  opening balance = 200
        transactions, in order:
          1. withdraw 250
          2. deposit 100
          3. withdraw 40
          4. withdraw 30

Before any transaction: balance = 200
Step 1: withdraw 250 → 200 - 250 = -50, which is < 0: REJECTED, balance stays 200
Step 2: deposit 100   → 200 + 100 = 300: balance = 300
Step 3: withdraw 40   → 300 - 40 = 260, which is ≥ 0: balance = 260
Step 4: withdraw 30   → 260 - 30 = 230, which is ≥ 0: balance = 230

Output: 230
```

**Checking a candidate against correctness:** if someone claimed the ending balance was `-120` (having summed `200 - 250 + 100 - 40 - 30` arithmetically, ignoring the constraint entirely), recomputing via the criterion above — the exact trace just shown — gives `230`, not `-120`. The candidate is incorrect, and now there's a written reason why, not just a disagreement.

Every one of the six ingredients did real work in that trace: input fixed what the numbers meant, output fixed what a single number would mean, the transformation fixed the order of operations, the constraint changed step 1's outcome, state carried the running balance from step to step, and correctness gave a way to check the final `230` that doesn't depend on trusting whoever computed it.

### Generalizing

This six-question process — input, output, transformation, constraints, state, correctness — is not specific to bank accounts, and it's not even specific to this lesson. It's the first, smallest version of the eleven-step problem-solving framework this entire series returns to, over and over, starting in Section XIV (*Specify → Model → Baseline → ...*). Learning to run through these six questions on a small, self-contained example now is what makes that eleven-step framework recognizable, rather than new, when it's introduced formally much later.

### Formal Definition, Walked Through

> A **specification** is complete when input, output, transformation, constraints, state (if any), and a correctness criterion have each been stated precisely enough that two people working independently from it would agree, for any valid input, on the required output and on whether a given candidate transformation satisfies it. A problem is **well-defined** exactly when its specification is complete in this sense; it's **ill-posed** until then.

- *"two people working independently... would agree"* — this is a genuine, usable test, not just a rhetorical flourish: hand your written specification to someone else (or come back to your own, a week later, having forgotten your original mental context) and ask whether it settles every case, including edge cases like "what if the transaction list is empty" or "what if a withdrawal amount is exactly zero." If the answer is "it depends who you ask," the specification isn't finished yet.
- *"for any valid input"* — a specification that only handles the transactions you happened to write down as an example, and leaves genuinely different cases (an empty list, a withdrawal that exactly zeroes the balance) unaddressed, is incomplete in exactly the same way an input description with an undefined shape was incomplete, three units ago.

### CS Lens

Also recognized in: a legal contract that both parties would interpret the same way without needing a lawyer to arbitrate; a scientific experiment's methods section, precise enough that another lab can replicate it and get a comparable result; a recipe precise enough that two different cooks produce recognizably the same dish. In every case, "precise enough that independent parties agree" — not "precise enough that the original author understands it" — is the actual bar.

### SE Lens

The realistic alternative to this six-question process isn't "no specification" — it's an *implicit* one, existing only in whoever wrote the first version's head, discovered piece by piece as bugs surface (an empty transaction list crashes something; a zero-amount withdrawal behaves strangely; nobody agreed in advance what should happen). That's not free — it's the same cost, paid later, in a more expensive currency (a production incident instead of a sentence in a design doc), and by someone who may not be the person who could have answered the question cheaply at the start. This series will keep asking for this six-question pass at the start of new problems specifically to make paying that cost early the default, not the exception.

### Connection to the previous unit

Correctness gave a way to check one candidate answer against one input; this unit is what happens when all six ingredients — including correctness — are written down together, deliberately, before any solution exists yet, which is the actual skill this lesson set out to build.

---

## Connect the Pieces

Trace one more concrete case, end to end, through the finished specification above — one that exercises every ingredient at once, including a rejected transaction in the middle rather than at the start:

```
Input:  opening balance = 60
        transactions, in order:
          1. deposit 40
          2. withdraw 90
          3. withdraw 10
          4. deposit 5

Step 1: deposit 40   → 60 + 40 = 100: balance = 100
Step 2: withdraw 90  → 100 - 90 = 10, which is ≥ 0: balance = 10
Step 3: withdraw 10  → 10 - 10 = 0, which is ≥ 0: balance = 0
Step 4: deposit 5    → 0 + 5 = 5: balance = 5

Output: 5
```

Every ingredient from this lesson is present in that one trace: the opening balance and transaction list are the **input**; `5` is the **output**; "process each transaction against the current balance, in order" is the **transformation**; "reject a withdrawal that would take the balance below zero" is the **constraint** — checked, and satisfied, even at the boundary case of exactly zero, in step 3; the running "balance" value carried from step to step is the **state**; and re-deriving `5` from scratch by the same rule, independent of whoever ran it first, is what makes `5` **correct** rather than merely claimed.

## What Breaks Without This

Remove just the constraint ("the balance must never go negative; reject a withdrawal that would violate this") and rerun the same trace:

```
Step 1: deposit 40   → balance 60 → 100
Step 2: withdraw 90  → 100 - 90 = 10 → balance 10
Step 3: withdraw 10  → 10 - 10 = 0 → balance 0
Step 4: deposit 5    → balance 0 → 5
```

This particular trace happens to come out the same, because none of these four transactions actually needed the constraint to avoid going negative. Try a different trace, without the constraint, where it matters:

```
Input:  opening balance = 20
        transactions, in order: withdraw 50, deposit 10

Without the constraint:
Step 1: withdraw 50 → 20 - 50 = -30 → balance -30   (nothing stops this)
Step 2: deposit 10  → -30 + 10 = -20 → balance -20

Output: -20
```

An account balance of `-20`, produced without ever checking whether that should be allowed, is exactly the "technically an answer, practically wrong" failure this lesson's first Concept Unit warned about — the number is a valid number, arrived at by a well-defined arithmetic rule, and still not something a real bank account should ever report, because nothing in the transformation was told it wasn't allowed to happen. Restoring the constraint (reject step 1, since `20 - 50 < 0`) brings the trace back to the intended behavior: balance stays `20`, then the deposit brings it to `30`.

## Exercises

1. **Trace.** Using the finished bank-account specification above, trace this input by hand, step by step, the same way the worked examples did: opening balance `500`; transactions in order: `withdraw 200`, `withdraw 200`, `withdraw 200`, `deposit 50`. What's the final balance, and which (if any) transaction gets rejected?
2. **Predict.** Before tracing it, predict whether reordering that same transaction list to `deposit 50` first, then the three withdrawals, changes the final answer. Then trace it and check your prediction. (This is the same reordering question the Transformation unit raised — try to say *why* your prediction was right or wrong, not just whether it was.)
3. **Specify.** Pick one of these vague questions and write a full six-part specification for it, the same way the capstone unit did for "is the account in good shape": *"Did I get a good grade this semester?"* or *"Is this a strong password?"* Name the input, output, transformation, constraints, state (if any — one of these two examples genuinely has none; figure out which), and correctness criterion.
4. **Break it.** For the specification you just wrote, remove one of the six ingredients (your choice) and construct a concrete input where the missing ingredient actually changes the outcome — the same way removing the constraint above only mattered once withdraw-50-then-deposit-10 was tried, not on the first trace.
5. **Generalize.** The bank-account problem in this lesson only ever has one account. Without changing anything about the six-question process, write a specification for the same kind of problem where the input is a *set* of accounts and a list of transactions, each naming which account it applies to. Which of the six ingredients had to change, and which stayed exactly the same shape?
6. **Reconstruct.** Close this lesson. From memory, write down the six questions a specification needs to answer, and, for the bank-account problem specifically, one sentence each for the answers — no rereading until you've tried.

## Definition of Done

- [ ] You can state, from memory, what distinguishes input from state (when each is "fixed," and when each is created/updated).
- [ ] You can state, from memory, why "correct" needs to be checkable independently of whichever method produced a candidate answer.
- [ ] You completed Exercise 3 (a full six-part specification for a problem you didn't just copy from this lesson) and Exercise 4 (a concrete input where removing one ingredient changes the outcome).
- [ ] You can explain, in one sentence, the difference between a well-defined problem and an ill-posed one, without using the word "vague."
- [ ] Commit your written answers to Exercises 3–6 (a short markdown or text file is enough) to whatever notes repository you're keeping alongside this series, with a commit message that says *why* this specification is complete — for example, `"Specify password-strength problem: state is absent because each character check is independent of prior ones"` — not just `"lesson 1 exercises"`.

---

**Next lesson:** Lesson 2, *Expressions, Values, and Evaluation*, starts turning the "transformation" ingredient from this lesson into something you actually run — tracing arithmetic expressions by hand first, then seeing the same trace happen for real in Clojure, this series' first language.
