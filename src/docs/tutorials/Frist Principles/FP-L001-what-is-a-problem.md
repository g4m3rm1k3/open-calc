# Lesson 1: What Is a Problem?

**What you will build:** Nothing runnable yet — this lesson builds a set of precise distinctions instead: between a *situation*, a *question*, a *specification*, and a *computational problem*, and between the parts every computational problem is made of — *input*, *output*, *assumption*, *constraint*, and *desired behavior*. The transferable problem this lesson is actually about is bigger than any one example: almost every computational failure that isn't a typo traces back to one of these distinctions being skipped, not to a mistake in an algorithm. Before deriving a single algorithm, this curriculum needs a vocabulary for saying, precisely, what a computation is even being asked to do.

**What you need to know first:** Nothing. This is the first lesson in the curriculum.

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum — this lesson is where the curriculum itself begins.

## Terms introduced in this lesson

- **Situation** — a state of affairs in the world, existing whether or not anyone asks anything about it. A stack of ungraded quizzes sitting on a desk is a situation; it does not, by itself, ask or answer anything. Naming this separately from *question* matters because "the world as it is" and "what someone wants to know about the world" are two different things, and conflating them is the first place computational thinking goes wrong — people often start solving before they have said, even to themselves, what they are trying to find out.
- **Question** — an inquiry raised about a situation, seeking a specific piece of information or a specific outcome. The same situation can host many different questions. Naming the question is what narrows an open-ended state of affairs down to something that could, in principle, have an answer at all.
- **Specification** — a precise, checkable statement of what counts as a correct answer to a question, with the ambiguity that ordinary language carries removed. It exists because a question asked in natural language is almost always satisfiable by many different literal readings, and a computer (or a person building one) needs to know which reading is actually meant, before starting, not after.
- **Computational problem** — a specification stated precisely enough to name exactly what is given (its input), what is wanted back (its output), and what must hold between them (its desired behavior) — precise enough that a mechanical, step-by-step procedure could, in principle, produce the output from the input without any further judgment calls. It is the object every algorithm in this curriculum will eventually be built to solve.
- **Input** — the information a computational problem is handed before it is solved: the part of the situation a procedure is allowed to look at, and the only part it is allowed to look at.
- **Output** — the information a computational problem is required to produce: what a procedure hands back once it has finished.
- **Assumption** — a condition about the input that is taken as already true, and is neither checked nor guaranteed by the procedure itself. It exists to separate "situations this problem is even meant to cover" from "situations it explicitly promises to handle correctly" — a problem does not have to defend against every conceivable input, only the ones its assumptions admit.
- **Constraint** — a condition an output (or the relationship between an output and its input) must satisfy to count as correct at all, regardless of whether it is the specific answer wanted. It exists to rule out results that are well-formed on the surface but invalid — an output that "looks done" while silently violating what was actually asked.
- **Desired behavior** — the exact relationship, stated precisely, that must hold between a given input and a correct output. It is the actual test a produced output is checked against; input, output, assumptions, and constraints all exist to make this one relationship statable without ambiguity.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. Every idea here is illustrated in natural language and worked by hand, using one running example — a stack of quiz scores that needs sorting — that is never actually executed on a machine in this lesson. The first code in this curriculum appears once a computational problem defined in the way this lesson teaches needs to actually be carried out, not merely stated precisely; that is still several lessons away.

---

## Concept Unit 1: Situation vs. Question

### The Problem

Ms. Alvarez has just finished grading 40 quizzes. The scores are handwritten on the front page of each quiz, and the quizzes are in whatever order she happened to grab them off her desk while grading — not sorted, not grouped, no particular order at all. That is the entire situation: 40 pieces of paper, each with a number on it, in an arbitrary physical order. Nothing about that description asks for anything to be done. A situation, by itself, never does — it just describes a state of affairs. The moment someone says "I want these in order from lowest to highest before I start typing them into the gradebook," something new has entered: a question has been raised about the situation. Confusing the two — treating "here is a pile of quizzes" and "how do I sort a pile of quizzes" as if they were the same statement — is where a surprising number of computational misunderstandings begin, because a situation admits many different questions, and starting to solve one before deciding which one is actually being asked means the solving effort might land on the wrong target entirely.

### No isolated lab for this step

This concept has no code of its own to isolate — it is a distinction about how to talk about a problem, not a language construct with its own syntax to run. The worked example below plays the role the isolated lab would otherwise play.

### Applying It — the Quiz Scores

**The situation, stated with nothing added:** 40 quizzes, each with a handwritten numeric score on its front page, currently stacked in the order Ms. Alvarez happened to pick them up in while grading.

**Three different questions that same situation could raise**, to show that the situation alone does not determine which one is meant:

1. "What is the average score?" — a question about a single summary number.
2. "Which quiz has the highest score?" — a question about one specific quiz.
3. "Can I get these in order from lowest score to highest score?" — a question about rearranging all 40.

Only the third of these is the question this curriculum's lesson will actually pursue for the rest of this lesson. Notice that nothing in the situation itself picked that question out — Ms. Alvarez picked it, for a reason (she wants to type scores in and notice by eye if a typo produces a wildly out-of-place number). The situation stayed exactly the same across all three questions; only the question changed.

### Walkthrough

Enumerating the pieces introduced in this unit, in the order they appeared above:

- **The stack of 40 quizzes, as described** — first appearance of *situation*: a state of affairs, named without yet asking anything about it. Nothing here is a request; it is a fact about the world at this moment.
- **"What is the average score?" / "Which quiz has the highest score?" / "Can I get these in order...?"** — first appearance of *question*, shown three times deliberately, to demonstrate that a single situation supports more than one. Each is a specific inquiry that could, at least loosely, be answered — which a bare situation cannot be, since a situation makes no claim and asks nothing.
- **The fact that only one of the three questions is pursued further** — this is not a new concept, just the consequence of the distinction: picking a question is a decision someone makes, not a fact the situation hands you.

### CS Lens

This is the seam between *state* and *query* — a distinction that recurs constantly once you know to look for it. Also recognized in: a database, where the rows on disk are a situation and a `SELECT` statement is one of many possible questions about them; a REST API, where a resource's current state is the situation and a specific `GET` or `POST` request is one question among many that could be asked of it; the scientific method, where an observed phenomenon is the situation and a testable hypothesis is one specific question raised about it; a customer-support ticket queue, where the state of a customer's account is the situation and the specific complaint in the ticket is the question actually being asked about it.

### SE Lens

The alternative to naming the question explicitly is to skip straight from "here is a messy situation" to "let me start building something," trusting that the right target will become obvious along the way. The real cost of that shortcut is not visible immediately — the code runs, something gets produced — it shows up later, when the thing built turns out to answer a question nobody actually had (sorted by highest-first when lowest-first was wanted; summarized when a full listing was wanted). Naming the question first costs a small amount of upfront discipline; skipping it risks the much larger cost of correctly executed effort spent on the wrong target, which no amount of good code afterward can fix.

---

## Concept Unit 2: From Question to Specification

### The Problem

"Can I get these in order from lowest to highest?" is a real question, and it is still not precise enough to hand to anyone — or anything — expecting a single, checkable answer back. "In order" could mean strictly increasing (no two scores ever equal) or it could allow ties. If two quizzes share the same score, "in order" says nothing about which of the two comes first. Ordinary language is satisfied by many different literal arrangements at once; a person asked to sort the quizzes might make a reasonable choice and never notice they made one. A computer cannot make an unstated reasonable choice — it needs the choice made *for* it, in advance, in words precise enough that any two people (or any two implementations) reading them would agree on exactly which arrangements count as correct and which do not. That precise statement is a specification.

### No isolated lab for this step

This concept has no code of its own to isolate — sharpening a question into checkable language is exactly the concept, and the worked example below is that sharpening happening directly.

### Applying It — the Quiz Scores

**The question, again:** "Can I get these in order from lowest to highest?"

**A first attempt at a specification**, and why it still is not enough:

> "Given the 40 scores, produce them arranged from lowest to highest."

This sounds precise but is not, yet — it does not say what happens to ties, and it does not say whether the 40 scores in the result have to be exactly the 40 scores that came in (no score dropped, none duplicated, none invented). A specification that leaves those open is not wrong so much as incomplete: two different people could both honestly believe they satisfied it while producing different outputs.

**A specification precise enough to check against**, incorporating what the first attempt left out:

> "Given a sequence of 40 numeric scores, produce a sequence containing exactly those same 40 scores — no score added, removed, or changed — arranged so that no score in the result is greater than the score immediately after it."

This version settles the tie question implicitly (allowing equal adjacent scores, since it only forbids a score being *greater* than the next one, not merely different from it) and explicitly requires the result to be built from the same 40 scores. Two different people reading this version would now agree, for any candidate result, whether it satisfies the specification or not — which is the actual test of whether something counts as a specification at all.

### Walkthrough

- **"Given the 40 scores, produce them arranged from lowest to highest"** — a first appearance of an *attempted* specification, shown specifically to fail the "would two people agree" test, so the failure itself is visible rather than asserted.
- **The tie-handling gap** — first appearance of the idea that a specification's job is to close every gap ordinary language leaves open, not just the obvious ones; ties are a gap that "lowest to highest" does not address at all.
- **"No score added, removed, or changed"** — first appearance of the idea that a specification must say what must stay *true* of the output relative to the input, not only how the output should look on its own. A result could be perfectly sorted and still be wrong, if it silently dropped a quiz.
- **The final specification sentence** — this is the concept *specification* itself, now shown in finished form: checkable, because for any candidate answer, the sentence gives an unambiguous yes-or-no test.

### CS Lens

This is the move from an ambiguous request to a checkable statement — the same move that recurs anywhere a request has to survive being handed to someone (or something) that cannot ask a clarifying question mid-task. Also recognized in: a software requirements document being rewritten as acceptance criteria; a verbal agreement being written into an exact clause in a contract; a word problem in mathematics being rewritten as an equation; a vague scientific hunch being rewritten as a specific, falsifiable, precisely stated prediction; a restaurant order of "the usual" being rewritten as an exact ticket with every modification listed.

### SE Lens

The alternative to writing a specification is to leave the request in its original, natural-language form and let it be interpreted independently, each time it is acted on. The real cost of that alternative is not that anyone acts in bad faith — it is that two honest, careful people (or two honest, careful pieces of code) can read the same sentence and reasonably disagree about what it requires, and neither one will notice the disagreement until their outputs are compared and turn out to differ. A specification costs real time to write precisely; skipping it does not remove that cost, it defers it — to a moment later, when two different, independently "correct" answers exist and someone has to work out why.

---

## Concept Unit 3: The Computational Problem

### The Problem

The specification from the previous unit is precise, but it is still tied to one particular situation: these 40 specific scores, on these 40 specific pieces of paper, on this specific day. If Ms. Alvarez grades a different quiz next week with 35 students instead of 40, the specification as written does not directly apply — it says "the 40 scores," naming a specific count. What is actually wanted is not a statement about this one stack of paper; it is a statement about *any* stack of scores, of any size, that could ever come up. Lifting a specification from "this particular instance" to "any instance of this shape" is what turns it into a computational problem — the thing an algorithm, once derived, will be built to solve not just once, but every time this shape of problem recurs.

### No isolated lab for this step

This concept has no code of its own to isolate — generalizing from one instance to the class of all instances is a way of thinking about a specification, not a construct with its own syntax.

### Applying It — the Quiz Scores

**The instance-specific specification, from the previous unit:**

> "Given a sequence of 40 numeric scores, produce a sequence containing exactly those same 40 scores... arranged so that no score in the result is greater than the score immediately after it."

**The same idea, lifted to a computational problem — no longer tied to 40, or to quizzes at all:**

> **Sorting.**
> Given: a finite sequence of numbers, of any length.
> Produce: a sequence containing exactly the same numbers, rearranged so that no element is greater than the element immediately after it.

Nothing about the reasoning changed between these two versions — only the commitment to a specific count (40) and a specific subject (quiz scores) was removed. The second version is now a computational problem in the fullest sense used in this curriculum: it names, in general terms, what will be given and what must come back, precisely enough that — once this curriculum reaches the lesson on deriving algorithms — a single procedure could be built to solve every instance of it at once, not just Ms. Alvarez's 40 quizzes.

### Walkthrough

- **"Given: a finite sequence of numbers, of any length"** — first appearance of stating an input as a *shape* (any finite sequence of numbers) rather than a specific value (these particular 40 scores). This is the generalizing move itself, made visible.
- **"Produce: a sequence containing exactly the same numbers, rearranged so that..."** — the output side of the same generalizing move: the earlier "40 scores" language is gone, replaced by a description that holds for any sequence at all.
- **The label "Sorting"** — first appearance of naming a computational problem, once it has been stated in general form. Naming it is what makes it reusable in conversation later in this curriculum, without restating the whole specification each time.

### CS Lens

This is the move from a specific instance to a general class of instances — the same move that separates "a" problem from "the" problem it is one example of. Also recognized in: a mathematical function, defined for every value in its domain rather than for one input; a factory assembly line, engineered for any unit of a product rather than rebuilt per unit; a database schema, which defines the shape every row must satisfy rather than describing one row; a physics problem set's "given / find" framing, which states variables symbolically rather than as one measured instance.

### SE Lens

The alternative to formalizing a general computational problem is to solve each situation ad hoc, reasoning freshly about "these particular 40 quizzes" every time a similar need comes up. The real cost of staying ad hoc is that nothing built to solve one instance transfers to the next — Ms. Alvarez's 35-student quiz next week gets solved from scratch, with none of the earlier reasoning reusable, because the earlier reasoning was never separated from the number 40 in the first place. Formalizing a computational problem costs extra effort at the moment it is written, in exchange for a solution, once derived, that applies to every instance of that shape from then on — not just the one that prompted writing it.

---

## Concept Unit 4: Input and Output

### The Problem

The computational problem stated in the previous unit already uses the words "given" and "produce" — but it is worth pulling those two apart and naming them directly, because most of the mistakes that happen later in this curriculum trace back to being unclear about exactly one of these two things: what a procedure is allowed to look at before it starts, and what it is required to hand back when it finishes. Everything else about a computational problem — its assumptions, its constraints, its desired behavior — is stated *in terms of* these two things. Getting them fuzzy makes everything built on top of them fuzzy too.

### No isolated lab for this step

This concept has no code of its own to isolate — input and output are roles a computational problem's language plays, not constructs with their own syntax to run in isolation.

### Applying It — the Quiz Scores

**Naming the input directly, from the Sorting problem above:**

> **Input:** a finite sequence of numbers — for Ms. Alvarez's situation, the 40 handwritten scores, read off the quizzes in whatever order they happen to be stacked in.

**Naming the output directly:**

> **Output:** a sequence containing the same numbers, rearranged so that no element is greater than the one immediately after it — for Ms. Alvarez's situation, the same 40 scores, now in an order she can safely start typing from.

**Making the boundary concrete — what is *not* input, even though it is nearby in the situation:**
The color of ink each score is written in is not input; the sorting problem never looks at it. The students' names on the quizzes are not input to *this* problem, even though they are sitting right there on the same pages — a different question ("which student scored highest?") would need them, but "put these scores in order" does not. Naming the input precisely means naming what is *excluded* just as much as what is included.

### Walkthrough

- **"Input: a finite sequence of numbers"** — first appearance of *input* as a formally named role, distinct from the informal "given" used earlier; it is exactly the part of the situation the problem is allowed to depend on.
- **"Output: a sequence containing the same numbers, rearranged..."** — first appearance of *output* as a formally named role, distinct from the informal "produce" used earlier; it is exactly what must be handed back, nothing more and nothing less implied.
- **The ink color and the students' names, named as things that are *not* input** — not a new concept on its own, but a necessary consequence of naming input precisely: anything not named is, by omission, excluded, and that exclusion has to be checked deliberately rather than assumed.

### CS Lens

This is the boundary a black box draws around itself — everything crossing in is input, everything crossing out is output, and nothing else is supposed to matter. Also recognized in: a mathematical function's domain and range; a factory's raw materials in and finished product out; a Unix pipe, where each filter reads a stream in and writes a stream out and is not supposed to know or care what produced or will consume those streams; a vending machine, which only reacts to the coins and the button pressed, nothing else; black-box testing, which deliberately tests a system only by its declared inputs and outputs, ignoring how it works inside.

### SE Lens

The alternative to naming input and output precisely is to let a procedure quietly depend on, or quietly produce, things that were never declared — reading some piece of surrounding state because it happened to be available, or producing a side effect nobody asked for because it was convenient at the time. The real cost shows up as hidden coupling: a "sort the scores" procedure that also happens to email Ms. Alvarez a summary now silently depends on network access, and fails somewhere none of its callers expected, for a reason none of them can see from its declared input and output. Naming input and output exactly is more restrictive up front, but it is what makes a procedure's behavior predictable from its declared input alone — which is the entire point of formalizing a computational problem in the first place.

---

## Concept Unit 5: Assumptions

### The Problem

"Input: a finite sequence of numbers" sounds like it covers every possible case, but it quietly does not — and it is not supposed to. What if the sequence has zero numbers in it? What if one of the 40 "scores" was left blank because a student didn't take the quiz? What if a score somehow got corrupted into a non-numeric value? The Sorting problem, as stated, has nothing to say about these — not because they were forgotten, but because the problem is only being built to handle situations where certain things are already true, and it is relying on those things being true without checking them itself. Naming those reliances out loud is what an assumption is for.

### No isolated lab for this step

This concept has no code of its own to isolate — an assumption is a boundary drawn around what a problem promises to handle, stated in prose, not a construct with its own runnable syntax.

### Applying It — the Quiz Scores

**Assumptions the Sorting problem is quietly relying on, made explicit:**

> - The sequence is finite — grading never produces an unbounded, ongoing stream of scores.
> - Every element is an actual number — no blank scores, no non-numeric entries have made it into the sequence by the time this problem starts.
> - Any two scores can be compared — for any two elements, one is less than, greater than, or equal to the other; nothing in the sequence is a value comparison doesn't apply to.

**What naming these buys, made concrete:** if a blank score sneaks into the sequence, the Sorting problem as specified is not wrong when it produces a nonsensical result or fails outright — that situation was never claimed to be handled. The failure belongs to whatever *supplied* the input without checking the assumption, not to the sorting reasoning itself. Without naming the assumption, that distinction cannot even be stated; the sorting logic would look "broken" for a case it never promised to cover.

### Walkthrough

- **"The sequence is finite"** — first appearance of an assumption about the *shape* of the input, stated separately from what the input *is*; it is a condition assumed true, not derived or checked.
- **"Every element is an actual number"** — first appearance of an assumption about the *content* of individual input elements, distinct from the shape assumption above — a sequence can be finite while still containing something that isn't a number.
- **"Any two scores can be compared"** — first appearance of an assumption about a *relationship* the input elements must support (comparability), which the very definition of "sorted" silently depends on — you cannot say one score is not greater than another if the two cannot be compared at all.
- **The blank-score scenario** — not a new concept, but the consequence made concrete: an assumption's real purpose is visible only once you ask what happens when it is violated, and whose responsibility that violation is.

### CS Lens

This is the line between what a piece of reasoning promises to handle and what it is allowed to take for granted — a line every nontrivial procedure draws somewhere, whether or not it says so out loud. Also recognized in: a function's documented preconditions in an API; a mathematical theorem's stated hypotheses, without which its conclusion does not hold; an engineering safety margin that assumes normal operating temperature, not an arbitrary one; a statistical model that assumes its samples are independent; a unit test's setup step, which establishes exactly the starting conditions the test is willing to reason about.

### SE Lens

The alternative to stating assumptions is to try to defend against every conceivable input, with no exceptions, all the time. The real cost of that alternative is enormous unnecessary complexity: defending against inputs that can never actually occur in a given context wastes effort and usually makes the common, expected case harder to read, because the code is now cluttered with handling for situations nobody has to worry about. Stating an assumption narrows what must be handled — cheaper and simpler — at the real cost that correctness guarantees evaporate silently the moment someone violates the assumption without realizing it, which is exactly why naming assumptions out loud, rather than leaving them implicit, matters.

---

## Concept Unit 6: Constraints

### The Problem

Imagine a result that comes back for the Sorting problem containing only 39 numbers instead of 40 — one score got dropped somewhere along the way. The 39 remaining numbers might be flawlessly arranged, no element greater than the one after it. Judged only by "is it in order," this result looks correct. It is not correct — a score is missing, and missing a student's quiz score is a serious problem for a gradebook, arranged or not. "In order" was never the *only* requirement; it was one requirement sitting alongside another one that was easy to state but easy to forget to check: the output has to actually contain what the input contained, nothing lost, nothing invented. A condition like that — one an output must satisfy to count as legitimate at all, separate from whether it's the specific answer wanted — is a constraint.

### No isolated lab for this step

This concept has no code of its own to isolate — a constraint is a condition stated in prose about what a valid output must satisfy, not a construct with its own runnable syntax.

### Applying It — the Quiz Scores

**The constraint the 39-number example was quietly violating, stated directly:**

> The output must be a *permutation* of the input — the same multiset of scores, rearranged, with none added, removed, or changed.

**A second constraint, easy to miss because it seems too obvious to state:**

> The output must have exactly one element for every element of the input — implied by "permutation" above, but worth naming on its own, because a subtly wrong procedure could satisfy "same set of values" while still returning the wrong count, if duplicate scores are involved (say, two students who both scored 87).

**Distinguishing a constraint from desired behavior, using both together:** "no element greater than the one after it" and "is a permutation of the input" are both required for a result to count as correct — but they are checking different things. One checks the arrangement; the other checks that nothing about the underlying collection of values was corrupted while arranging it. A result can satisfy either one alone and still be wrong overall — a permutation could remain unsorted, and a sorted-looking sequence could have lost a score. Correctness requires both constraints holding at once.

### Walkthrough

- **The 39-number scenario** — first appearance of the general idea that "looks done" and "is correct" are not the same test; this scenario exists specifically to make a constraint violation visible without yet naming the constraint that catches it.
- **"The output must be a permutation of the input"** — first appearance of *constraint*, stated formally: a condition the output must satisfy regardless of whether it's the exact answer someone wanted, ruling out results that are malformed rather than merely "not what was asked for."
- **The duplicate-score count constraint** — a second, distinct constraint, shown specifically to demonstrate that a computational problem can have more than one constraint, and that they can look redundant with each other ("permutation" already implies matching count) while still being worth stating separately, because a flawed procedure could satisfy one without the other in an unexpected edge case like tied scores.
- **The "both constraints must hold at once" observation** — not a new concept, but the necessary consequence of having more than one: constraints combine with *and*, not *or* — every one of them must hold for a result to count as correct.

### CS Lens

This is the difference between an output being *plausible* and an output being *valid* — a check applied independently of whether the output is also the specifically desired one. Also recognized in: a type system, which rejects a value of the wrong shape before ever asking whether it's the *right* value; a database `CHECK` constraint or foreign key, which rejects a row that violates a rule regardless of whether the row's other data looks reasonable; a constraint-satisfaction formulation of a scheduling problem, where "no two classes share a room at the same time" must hold regardless of which specific schedule is chosen; a building code, which a design must satisfy independent of whether it is also the design the architect actually wanted.

### SE Lens

The alternative to stating constraints is to check only "did a result come back" and not "is this result even a legitimate one" — accepting a 39-score result because *some* output was produced, without a rule in place that catches the missing score. The real cost of that alternative is that technically-looks-done answers that are actually wrong — silently dropped, duplicated, or corrupted data — pass through unnoticed, because nothing was ever checking for that specific failure shape. Stating constraints requires thinking, in advance, about what could go wrong that would still superficially resemble success; that upfront thinking is the entire cost, traded against the alternative cost of a downstream, hard-to-trace error discovered only once someone notices a grade is missing.

---

## Concept Unit 7: Desired Behavior

### The Problem

Input, output, assumptions, and constraints have now all been named for the Sorting problem — but something is still missing, and it is the piece all of the others exist to support: the single, precise statement of the relationship a correct output must have to its input. "No element greater than the one after it" plus "is a permutation of the input" are two separate conditions; put together, they *are* the answer to the question "what makes an output correct here?" — but that combined answer has not yet been stated as one thing. Desired behavior is that combined statement: the actual test a produced output gets checked against, expressed as a relationship between input and output rather than as a scattered list of separate conditions.

### No isolated lab for this step

This concept has no code of its own to isolate — desired behavior is the assembled statement of everything the previous units named, not a new construct with its own syntax.

### Applying It — the Quiz Scores

**Desired behavior for Sorting, stated as one relationship between input and output:**

> For input sequence `I` and output sequence `O`: `O` is correct if and only if `O` is a permutation of `I`, and for every pair of adjacent elements in `O`, the earlier one is not greater than the later one.

**Checking a candidate output against this relationship, directly:**
Take `I = [87, 91, 76, 91, 88]` (five scores, two students tied at 91). A candidate `O = [76, 87, 88, 91, 91]` is checked against the statement above two ways at once: is it a permutation of `I`? Yes — same five values, none added or removed. Is every adjacent pair non-decreasing? `76 ≤ 87 ≤ 88 ≤ 91 ≤ 91` — yes. Both hold, so `O` is correct. A different candidate, `O' = [76, 87, 88, 91]`, fails the permutation half immediately — only four elements for an input of five — regardless of how well-ordered those four elements are.

**Why this had to wait until now:** stating desired behavior earlier, before input, output, assumptions, and constraints were each named on their own, would have meant writing one dense, unstructured sentence trying to do everything at once — which is exactly the kind of imprecise, hard-to-check statement Concept Unit 2 identified as the problem with staying at the level of a plain-language question. Desired behavior is precise here specifically because it is built out of pieces that were each already made precise on their own.

### Walkthrough

- **"`O` is correct if and only if..."** — first appearance of *desired behavior* stated as a formal biconditional relationship between a general input `I` and a general output `O`, rather than as a description of one specific pair of sequences.
- **The permutation half of the relationship** — a reappearance of the constraint named in Concept Unit 6, now folded into the single desired-behavior statement rather than stated as a separate, free-floating rule.
- **The adjacency/ordering half of the relationship** — a reappearance of the ordering condition from Concept Unit 2's finished specification, likewise folded in here.
- **The worked check against `I = [87, 91, 76, 91, 88]`** — not a new concept, but the first demonstration in this lesson of actually applying a desired-behavior statement to a concrete pair of sequences and getting a definite yes-or-no answer, which is the entire reason for writing desired behavior this precisely in the first place.

### CS Lens

This is the precise relationship a system's actual result is checked against — the single thing every other part of a computational problem exists in service of. Also recognized in: a function's postcondition in a formal contract, checked against its precondition-satisfying input; a unit test's assertion, checking a specific relationship between arranged inputs and an observed result; a formal correctness proof, which shows a procedure's output satisfies exactly this kind of relationship for every input satisfying the stated assumptions; an acceptance test in software delivery, checking delivered behavior against a written acceptance criterion; a control system's setpoint, defining the exact relationship an output measurement must maintain relative to a commanded input.

### SE Lens

The alternative to stating desired behavior as a general relationship is to define correctness only by example — "here is what a right answer looked like, once" — and trust that future cases will resemble it closely enough. The real cost of that alternative is that examples do not generalize: a procedure can match every example anyone thought to write down and still be wrong on a case nobody imagined, like an input with every score identical, or an input of length one. Stating desired behavior as a precise relationship between arbitrary `I` and `O` is harder to write than picking a few worked examples, but it is the only form of correctness statement that can be checked against inputs nobody has tried yet — which is exactly the situation any procedure will eventually face once it is used for real.

---

## Closing

### Connect the pieces

One value, traced through every unit built in this lesson, start to finish:

1. **Situation:** 40 quizzes, handwritten scores, arbitrary stack order.
2. **Question, chosen from several the situation could raise:** "Can I get these in order from lowest to highest?"
3. **Specification:** "Given a sequence of 40 numeric scores, produce a sequence containing exactly those same 40 scores... arranged so that no score in the result is greater than the score immediately after it."
4. **Computational problem, generalized beyond 40 and beyond quizzes:** Sorting — given any finite sequence of numbers, produce a rearrangement satisfying the ordering condition above.
5. **Input and output, named directly:** input is the finite sequence of numbers; output is the rearranged sequence.
6. **Assumptions, made explicit:** the sequence is finite, every element is an actual number, and any two elements can be compared.
7. **Constraints:** the output must be a permutation of the input, with exactly as many elements.
8. **Desired behavior, assembling constraints and ordering into one relationship:** for input `I` and output `O`, `O` is correct if and only if `O` is a permutation of `I` and every adjacent pair in `O` is non-decreasing.

Every later unit in this lesson used something the earlier ones had already named — the desired-behavior statement in Concept Unit 7 is not new material invented from scratch; it is the permutation constraint from Concept Unit 6 and the ordering condition from Concept Unit 2, combined into one checkable relationship stated over the input and output named in Concept Unit 4.

### What breaks without this

Suppose the specification step (Concept Unit 2) had been skipped, and Ms. Alvarez's request had been handed off exactly as first spoken — "get these in order from lowest to highest" — with no further precision, straight to the constraint-writing step. A reasonable person, told only that, might write down a single constraint: **"no two scores in the output may be equal."** This looks like a faithful reading of "in order" — after all, a strictly increasing sequence is certainly "in order." Apply it to Ms. Alvarez's real 40 scores, though, and it fails outright: with 40 students, ties are common — two students scoring 91 is completely ordinary. A constraint requiring every score to differ from its neighbor cannot be satisfied by data that legitimately contains a tie, no matter how carefully an output is arranged. The output does not merely come out wrong; no output can ever satisfy the constraint at all, because the constraint was built on a guess about "in order" that skipping the specification step never checked. Restoring the specification step from Concept Unit 2 fixes this immediately: "no score in the result is greater than the score immediately after it" permits equal adjacent scores by construction, because it only forbids strictly *greater*, and the ambiguity that produced the broken constraint never gets a chance to occur.

### Exercises

1. **Observe.** A friend says: "I want my photo library organized." Write down the situation, stated with nothing added, exactly as Concept Unit 1 did for the quiz scores.
2. **Observe.** For that same sentence, write down three different questions the situation could raise, the way Concept Unit 1 wrote three different questions about the quiz stack. Circle the one you think is most likely meant, and say why.
3. **Predict.** Before reading further: for the question "can I find all the duplicate photos in my library," write a first-attempt specification, then find one gap in it the way Concept Unit 2 found the tie-handling gap in "arranged from lowest to highest." (Hint: what counts as a "duplicate" — pixel-identical only, or also a resized copy of the same photo?)
4. **Formalize.** Turn your corrected specification from Exercise 3 into a general computational problem, the way Concept Unit 3 turned "these 40 scores" into "Sorting." Name its input and its output directly, the way Concept Unit 4 did.
5. **Formalize.** For your computational problem from Exercise 4, write at least two assumptions and at least one constraint, following the pattern of Concept Units 5 and 6. For the constraint, specifically try to describe a candidate output that would be superficially plausible — "looks done" — while still violating it, the way the 39-score example did for Sorting.
6. **Explain.** Assemble your assumptions and constraint from Exercise 5 into a single desired-behavior statement in the style of Concept Unit 7 — a relationship between a general input and a general output, not a description of one specific example. Then check it against one made-up concrete example by hand, the way `I = [87, 91, 76, 91, 88]` was checked in Concept Unit 7.

### Definition of done

- [ ] You can state, in your own words, the difference between a situation and a question, without using the word "problem" in either definition.
- [ ] You can point to a place in the quiz-scores example where the specification closed a gap that the plain-language question left open.
- [ ] You can explain why "Sorting" is stated in terms of "any finite sequence" rather than "these 40 scores," and what would be lost if it weren't.
- [ ] You can name, for the Sorting problem, its input, its output, at least two assumptions, at least one constraint, and its desired-behavior statement — separately, without collapsing them back into one vague sentence.
- [ ] You completed Exercises 1–6 for a situation of your own choosing, not the quiz-scores example.
- [ ] Commit your written answers to Exercises 1–6 to your own notes, with a commit message stating *why* you chose the question you circled in Exercise 2 — not merely that you completed the exercise.
