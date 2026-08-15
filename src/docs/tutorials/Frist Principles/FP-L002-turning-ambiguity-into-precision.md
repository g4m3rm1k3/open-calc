# Lesson 2: Turning Ambiguity Into Precision

**What you will build:** Still nothing runnable — this lesson builds the skill of taking a request that sounds perfectly clear out loud and finding the exact places it stops being clear once you try to make every case of it explicit. The transferable problem this lesson is actually about: a rule can look finished — precise, even mathematical — while still leaving specific inputs undefined, and those undefined inputs do not stay hypothetical. They eventually show up for real, and whatever handles them then was never actually decided by anyone; it was left to an accident.

**What you need to know first:** Lesson 1 (`FP-L001-what-is-a-problem.md`) — specifically *specification* (a precise, checkable statement of what counts as a correct answer) and *assumption* (a condition taken as already true, not checked or guaranteed). This lesson pushes on exactly where those two ideas meet: how do you decide whether an unusual case is something to explicitly assume away, versus something a rule has to actually handle?

**Pipeline diagram:** Not applicable. No multi-stage pipeline has been established yet in this curriculum.

## Terms introduced in this lesson

- **Vague request** — a statement of what's wanted that sounds complete in conversation but does not, on its own, settle what should happen for every possible input. "Give me the students who passed" is a vague request: everyone nods along, and yet it does not say what "passed" means precisely, or what to do about a student who never took the exam at all.
- **Explicit rule** — a statement precise enough that, for any specific input, it settles a definite outcome without requiring further judgment from whoever applies it. Turning a vague request into an explicit rule is the actual work this lesson teaches; it exists because "precise-sounding" and "actually settles every case" are not the same property, and only the second one is enough to hand to a machine.
- **Edge case** — a specific input, often unusual or extreme, that exposes a place where a general-sounding rule turns out not to say what should happen. Edge cases matter because a rule can be tested against ordinary inputs indefinitely and pass every time, while still being silently broken at the inputs nobody thought to try.
- **Boundary value** — an edge case that sits exactly on the line a rule draws — not clearly on one side or the other, but precisely at the threshold itself. A rule stated as a strict inequality treats its boundary value differently than the same rule stated as a non-strict one, and a request phrased in plain language rarely specifies which was meant.
- **Literal execution** — the fact that a machine carries out exactly what a rule states, with no access to what the person who wrote the rule was picturing in their head at the time. A rule that is silent about a case is not filled in by common sense when a machine runs it; it is filled in by whatever the machine's underlying tools happen to default to, which may have nothing to do with anyone's actual intent.
- **Exhaustive rule** — a rule that has an explicitly decided outcome for every input configuration that can actually occur, with no input left to fall through to an unstated default. Exhaustiveness is the property that separates a rule that has been checked against every case from one that merely has not yet failed.
- **Undefined case** — an input a rule has not assigned any outcome to at all, whether by oversight or because nobody considered it. An undefined case is different from an input a rule deliberately excludes by a stated assumption (Lesson 1): one was a decision that got written down; the other is a gap nobody decided anything about.

## Objects and methods used

None. This lesson introduces no code and calls no real class, library, or method. It continues Lesson 1's approach of working entirely in natural language and worked-by-hand examples, using one running scenario — deciding which students "passed" an exam from a list of recorded scores.

---

## Concept Unit 1: The Gap Inside a Vague Request

### The Problem

A teacher says: "Give me the students who passed the exam." Everyone in the room nods — this sounds like a completely reasonable, already-clear request. Nobody asks a follow-up question, because in conversation, "passed" feels obvious. But notice what the sentence has *not* said: what score counts as passing. 60? 65? 70? Different schools, different teachers, and different courses use different cutoffs, and the sentence "the students who passed" carries no information about which one this teacher means. It sounds complete because everyone mentally fills in *some* cutoff without noticing they did it — and different listeners might fill in different ones. This is what makes a request vague: not that it's meaningless, but that it silently depends on something it never actually states, and different people can supply that missing piece differently while each feeling completely sure they understood correctly.

### No isolated lab for this step

This concept has no code of its own to isolate — noticing a silently-assumed cutoff inside an ordinary sentence is an exercise in reading a request closely, not a language construct with its own syntax.

### Applying It — Grading the Exam

**The vague request, exactly as spoken:** "Give me the students who passed the exam."

**What it silently depends on, made visible by asking a follow-up question nobody asked out loud:** "Passed — meaning scored at least what?" There is no way to answer this from the sentence itself. Two teachers, both honestly interpreting "passed" from their own experience, could reasonably supply 60 and 70 respectively, and both would believe they understood the request correctly.

**Why this matters even though the fix looks trivial:** naming a specific cutoff is not hard — the actual danger is that the sentence *feels* finished without one, so nobody thinks to ask. The gap is invisible until someone deliberately looks for it, which is exactly the habit this lesson is building.

### Walkthrough

- **"Give me the students who passed the exam"** — first appearance of a *vague request*: sounds settled, is not, because it depends on an unstated cutoff.
- **"Passed — meaning scored at least what?"** — the follow-up question that exposes the gap; not a new named concept on its own, but the concrete technique this whole unit teaches: asking, of any request, "what does this depend on that it never actually states?"
- **The two-teachers scenario (60 vs. 70)** — demonstrates the actual danger of a vague request: not that it's wrong, but that two different, equally confident readings of it can diverge without either reader noticing.

### CS Lens

This is the seam where a natural-language request quietly relies on shared context that is never written down — the same seam every ambiguous requirement, at any scale, opens up along. Also recognized in: a product manager's user story that says "fast loading" without a stated time budget; a legal contract's phrase "reasonable effort" with no definition of what counts as reasonable; a recipe that says "bake until done" with no specific temperature or time; a manager's request for "the important customers" with no stated criterion for importance.

### SE Lens

The alternative to hunting for what a request silently depends on is to accept it as-is and start building immediately, trusting that "everyone knows what passed means." The real cost surfaces later, and asymmetrically: whichever cutoff got built in becomes invisible to the person who built it, while anyone holding a different unstated cutoff in their head will eventually notice their expected results don't match — often only after a report has already gone out. Asking the follow-up question costs one short, sometimes slightly awkward conversation up front; skipping it defers the exact same conversation to a moment when a wrong result has already been produced and someone has to explain it.

---

## Concept Unit 2: From Vague Request to a Rule That Still Isn't Finished

### The Problem

Suppose the teacher answers the follow-up question from Concept Unit 1: "60, obviously — that's always been the cutoff here." Now the request can be rewritten as something that looks genuinely precise: *a student passed if their score is at least 60.* This reads like real progress — it has a number in it, an inequality, the shape of a mathematical statement. It is tempting to stop here and call the rule finished. But "looks precise" and "is finished" are different properties. The rule as stated only says something about students who *have* a recorded score. It says nothing at all about a student who was excused from the exam, or missed it and has no score entered. The rule sounds complete because it correctly handles every score you can picture typing in — while quietly assuming every student has one.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing that a numerically precise-looking rule can still be incomplete is a way of reading the rule critically, not a construct with its own syntax.

### Applying It — Grading the Exam

**The rule, now with a stated cutoff:**

> A student passed if their recorded score is at least 60.

**Testing it against scores that clearly exist, to confirm it works for the ordinary case:**
A student who scored 82: `82 ≥ 60` — passed. A student who scored 45: `45 ≥ 60` is false — did not pass. For every student who has an ordinary recorded score, the rule gives a clear, defensible answer.

**The case this rule never mentions, made concrete:** a student named on the roster who was excused from the exam for a documented reason has no recorded score at all — not a 0, nothing. Applying "at least 60" to *nothing* is not a question the rule answers; the inequality has no left-hand side to evaluate. The rule is precise about every score it was given, and silent about students it wasn't given a score for at all.

### Walkthrough

- **"A student passed if their recorded score is at least 60"** — first appearance of an *explicit rule* in numeric form, an improvement over the vague request from Concept Unit 1, since it now specifies a cutoff — but explicit here only means "precisely stated for the cases it addresses," not yet "addresses every case."
- **The 82 and 45 checks** — demonstrate that the rule genuinely does work correctly for ordinary, present scores; this is deliberate, so that the gap found next isn't mistaken for the rule being wrong about everything.
- **The excused student with no recorded score** — first appearance of a case the rule was never actually written to cover; not a wrong answer, but an absence of any answer at all, because the inequality it relies on has nothing to compare on one side.

### CS Lens

This is the difference between a rule being locally precise — exact about the cases it was written with in mind — and being *complete*, addressing every case that can actually arise. Also recognized in: a mathematical formula that is exact for every value in its intended domain while being undefined outside it (division, at zero); a form field validated for "a number between 1 and 100" that was never tested against being left blank; a well-specified function signature that says nothing about what happens if a caller passes a null reference instead of a real value.

### SE Lens

The alternative to actively hunting for what a numerically precise rule still leaves out is to treat "it has a formula now" as proof that the work is done. The real cost is a false sense of confidence: a clean inequality *looks* rigorous, which makes it easy to stop scrutinizing, even though rigor about the cases it addresses says nothing about the cases it doesn't. Writing the inequality was real, necessary progress over the vague request; mistaking that progress for completeness is a separate, common, and costly step that this unit exists to interrupt.

---

## Concept Unit 3: Edge Cases — Where a Rule Meets an Awkward Input

### The Problem

Concept Unit 2 found one case the passing rule never addressed: a student with no recorded score at all. That is one example of a broader habit worth having on purpose: deliberately going looking for the specific inputs most likely to expose a gap, rather than waiting to stumble across them. Two kinds of input are especially likely to do this. The first is an input sitting exactly on a boundary the rule draws — here, a score of *exactly* 60. The second is an input that isn't really "a score" at all, in some way the rule's author didn't picture — a missing score, a negative score entered by a data-entry mistake, or a score above the maximum possible points. These unusual, boundary-hugging, or malformed inputs are called edge cases, and a rule that has only ever been checked against comfortable, typical inputs has not actually been checked at all against the inputs most likely to break it.

### No isolated lab for this step

This concept has no code of its own to isolate — deliberately searching for boundary and malformed inputs is a checking technique applied to a rule already stated in prose, not a construct with its own runnable syntax.

### Applying It — Grading the Exam

**The rule under test, again:** "A student passed if their recorded score is at least 60."

**Edge case 1 — the boundary value, a score of exactly 60:** `60 ≥ 60` is true, so this student passes under the rule exactly as written. This is not a gap — the rule does give an answer — but it is worth deliberately checking anyway, because "at least" versus "more than" is precisely the kind of distinction a vague request like "passed" never specifies, and a boundary value is where that distinction actually gets exercised. Had the teacher meant "more than 60," a student scoring exactly 60 would need the strict inequality `60 > 60`, which is false — the opposite answer. The boundary value is where two rules that agree everywhere else finally disagree.

**Edge case 2 — a score outside the possible range, say `–5` entered by a data-entry slip:** `–5 ≥ 60` is false, so the rule quietly reports "did not pass" — technically an answer, but one built on a value that should never have been possible in the first place (an exam presumably cannot be scored below zero). The rule doesn't fail loudly here; it fails quietly, producing a confident-looking answer for an input that should have been caught as invalid before the passing rule ever saw it.

**Edge case 3 — the missing score, already found in Concept Unit 2:** no left-hand side for the inequality to evaluate at all — not a wrong answer, but no answer.

**What deliberately hunting for these three found, that testing only ordinary scores like 82 and 45 never would have:** one confirmed boundary behavior worth double-checking against what was actually meant, one silently-accepted invalid input, and one case with no defined outcome whatsoever.

### Walkthrough

- **The boundary value, 60** — first appearance of *boundary value* as a specific, deliberately chosen test input, distinct from an ordinary interior value like 82; it is the exact input where a strict and a non-strict version of the same rule stop agreeing.
- **The out-of-range value, –5** — first appearance of a malformed edge case: an input the rule evaluates without complaint, producing an answer that is well-formed but built on data that should not have been possible to begin with.
- **The missing score, reappearing from Concept Unit 2** — a reappearance, not a new concept: the same *undefined case* found there, now framed explicitly as the third member of a deliberately assembled set of edge cases rather than something stumbled onto by accident.
- **"deliberately hunting" vs. testing 82 and 45** — not a new concept, but the point of the whole unit made explicit: ordinary-looking test inputs and edge cases are different categories of input, and only actively searching for the second category finds what the first category cannot.

### CS Lens

This is the discipline of testing at the boundaries and the extremes of an input space, on purpose, rather than only in its comfortable interior. Also recognized in: software testing's classic "boundary value analysis," which specifically tests the minimum, maximum, and just-outside-range values of every input; numerical computing's attention to what happens at zero, at the largest representable value, and at negative inputs; a mechanical part's engineering tolerance, tested specifically at its minimum and maximum allowed dimensions, not just at its nominal size; a legal statute's edge cases — precisely what happens at an age of exactly eighteen, argued far more often in court than the ordinary cases on either side of it.

### SE Lens

The alternative to deliberately searching for edge cases is to test a rule against a handful of typical, comfortable-looking inputs and call it verified once those pass. The real cost is that failures concentrate exactly where typical testing never visits — the boundary, the missing value, the malformed entry — precisely because "typical" was defined to exclude them. Deliberately hunting for atypical inputs takes real, sometimes tedious extra effort compared to testing a few ordinary examples, but it is the only way to find a rule's actual gaps before those gaps are found by a live, real occurrence of exactly the input nobody tried — often at the worst possible moment, such as in front of a parent disputing a grade.

---

## Concept Unit 4: What the User Means vs. What the Machine Executes

### The Problem

When the excused student with the missing score comes up in ordinary conversation, a person handling the grading by hand does the sensible thing without even noticing they made a decision: they skip that student, or set the record aside for the teacher to handle separately, because a person understands, without being told, that "no score" is not the same situation as "a low score." A machine carrying out the exact rule from Concept Unit 2 — "passed if score is at least 60" — has no such understanding available to it. It does not know that an excused absence is different in kind from a failing grade; it only has the rule it was given, executed exactly as written, on whatever value is actually present. If "no score" happens to be stored as the number 0 in whatever system is being used, the machine will evaluate `0 ≥ 60`, get false, and confidently report that student as having failed the exam — not because anyone decided that was correct, but because nothing in the stated rule ever said otherwise, and the underlying storage needed *some* value in that slot.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap between a person's tacit understanding and a machine's literal execution is a fact about how rules get carried out, not a construct with its own syntax to run.

### Applying It — Grading the Exam

**What a person does, without being told to, when they hit the excused student's row by hand:** pauses, recognizes "this isn't a score," and sets the record aside rather than comparing it to 60 at all.

**What the stated rule actually says to do, with nothing added:** compare the recorded value to 60. Nothing in the rule as written distinguishes "this slot holds no score" from "this slot holds a low score" — that distinction lived entirely in the person's head, and was never written into the rule at all.

**What happens once that comparison is carried out literally, if the missing score happens to be stored as 0 (a common default for an empty numeric field):** `0 ≥ 60` evaluates to false. The student is reported as failing. This did not happen because a machine "made a mistake" — every step it took followed the stated rule exactly. It happened because the rule never told it that this case was different, and the storage system needed to put *something* in an empty slot, so it silently chose 0 on nobody's actual instruction.

**The real lesson made explicit:** the person's correct, sensible handling of the excused student was never actually part of the rule — it was extra knowledge that person supplied silently, every time, without noticing they were supplying anything at all. A rule is only as good as what got written into it, not what its author was picturing while writing it.

### Walkthrough

- **The person pausing at the excused student's row** — establishes, concretely, the tacit understanding a human applies automatically and does not think of as a "decision" at all.
- **"Nothing in the rule as written distinguishes..."** — first appearance of *literal execution*: the observation that a rule is carried out exactly as stated, with no access to context the person who wrote it was silently relying on.
- **The missing score defaulting to 0, and `0 ≥ 60` evaluating to false** — the concrete demonstration of literal execution in action: not a machine error, but the predictable, correct-per-the-rule consequence of a rule that never addressed this case.
- **"extra knowledge that person supplied silently"** — not a new concept, but the direct statement of this unit's point: the gap between what was meant and what was executed is exactly the gap between what a person knows and what a rule actually says.

### CS Lens

This is the difference between a rule as intended and a rule as specified — a gap that exists precisely because a machine has access only to the second one. Also recognized in: a null-pointer exception, thrown because code assumed "there will always be a value here" without ever stating or checking it; a financial spreadsheet formula that silently treats a blank cell as zero, changing a total in a way nobody who wrote the formula meant to happen; a legal document interpreted "to the letter" in a way that technically satisfies its wording while violating what everyone involved actually intended; an autopilot system that follows its programmed rule exactly through a scenario its designers never pictured, because nothing told it that scenario was different.

### SE Lens

The alternative to writing out what should happen for an unaddressed case is to trust that a machine, or the tool underneath it, will "do the sensible thing" when that case actually occurs. The real cost is that there is no sensible thing a machine does automatically — for a case its rule never addressed, it falls through to whatever default its underlying tool happens to have (treating blank as zero, throwing an error, silently skipping a row), and that default was chosen by whoever built the underlying tool, for their own reasons, not by anyone who understood this specific grading problem. Writing the missing-score case out explicitly costs one additional sentence in the rule; skipping it hands the actual decision to an arbitrary, invisible default that may not match what anyone actually wanted.

---

## Concept Unit 5: Exhaustiveness — Deciding Every Case on Purpose

### The Problem

Three things are now known about the passing rule: it correctly handles ordinary scores (Concept Unit 2), it has at least one boundary worth double-checking and one malformed input it silently mishandles (Concept Unit 3), and it has one case — the missing score — with no defined outcome that instead falls through to an arbitrary default (Concept Unit 4). The fix for each of these is not mysterious on its own; the real skill this lesson has been building toward is checking, systematically, whether *every* input configuration that can actually occur has been assigned a deliberate outcome — not assuming the rule is finished just because the cases found so far have each been patched. A rule with this property, where nothing is left to fall through to an accidental default, is exhaustive.

### No isolated lab for this step

This concept has no code of its own to isolate — checking a rule for exhaustiveness is a way of systematically re-examining a rule already stated in prose, not a new construct with its own syntax.

### Applying It — Grading the Exam

**Enumerating every input configuration the passing rule can actually encounter, explicitly, rather than trusting that the cases found so far were all of them:**

> - A recorded numeric score between 0 and 100, inclusive → compare to the cutoff.
> - A recorded score outside 0–100 (like the –5 data-entry slip) → this is invalid data, not a passing/failing decision at all; it should be flagged for correction, not compared to 60.
> - No recorded score at all (an excused or not-yet-graded student) → this student should not appear on either the "passed" or "did not pass" list; they belong on a separate "no result yet" list.

**The rule, rewritten so every one of these has an explicit, decided outcome:**

> A student appears on the "passed" list if they have a recorded score between 0 and 100, and that score is at least 60. A student appears on the "did not pass" list if they have a recorded score between 0 and 100, and that score is below 60. A student with no recorded score, or a recorded score outside 0–100, appears on neither list — instead on a separate "needs review" list.

**Checking this final version against every case found across this lesson:** the excused student (Concept Unit 2 and 4) now lands explicitly on "needs review," not silently on "did not pass." The –5 data-entry slip (Concept Unit 3) now lands on "needs review" instead of being silently accepted as a failing score. The boundary value of exactly 60 (Concept Unit 3) is unambiguous: "at least 60" places it on "passed," settled the same way it was settled in Concept Unit 3, now stated as part of one rule instead of checked as an afterthought.

### Walkthrough

- **The three-item enumeration** — first appearance of *exhaustive* checking performed deliberately: rather than fixing whichever gap was found most recently, every input configuration that can actually occur is listed out, on purpose, before deciding whether the rule is finished.
- **"needs review," as a third list** — a new, explicit outcome invented specifically because Concept Units 3 and 4 showed that forcing every input into only "passed" or "did not pass" was itself the source of the silent failures — some inputs are not actually passing/failing decisions at all.
- **The rewritten rule's three sentences** — each one a reappearance of a case already found earlier in this lesson (ordinary score, invalid score, missing score), now assembled into a single rule where every case has a stated, deliberate outcome instead of being patched individually.
- **Rechecking the excused student, the –5 entry, and the boundary value of 60 against the final rule** — not a new concept, but confirmation that exhaustiveness was actually achieved: every case raised anywhere in this lesson now has a traceable, deliberate answer in the final rule.

### CS Lens

This is the discipline of case coverage — checking that every possible shape an input can take has been explicitly accounted for, rather than trusting that testing has simply not yet found the gap. Also recognized in: a `switch` statement's `default` branch, whose entire purpose is to force a decision about "anything not explicitly listed above" rather than let it pass through silently; a mathematical proof by cases, which must show that its listed cases are exhaustive — that no input escapes all of them — before the proof is considered complete; a state machine's transition table, incomplete and dangerous if any reachable state is missing an entry for some possible event; a legal code's residual clause, which exists specifically to state what happens for situations none of the enumerated provisions directly cover.

### SE Lens

The alternative to checking a rule for exhaustiveness is to handle whichever cases happen to get noticed, and treat "nothing has broken yet" as evidence the rule is finished. The real cost is that unaddressed cases do not announce themselves in advance — they surface later, as a live incident, often noticed first by the person most harmed by the accidental default (a student wrongly shown as failing because a blank was silently read as zero). Deliberately enumerating every input configuration a rule can encounter costs real, sometimes tedious effort up front; skipping that enumeration does not remove the work, it defers the exact same discovery to production, under worse conditions, in front of the person the wrong answer actually affects.

---

## Closing

### Connect the pieces

One request, traced through every unit built in this lesson, start to finish:

1. **Vague request (Unit 1):** "Give me the students who passed the exam" — sounds settled, silently depends on an unstated cutoff.
2. **A rule that looks finished but isn't (Unit 2):** "passed if score is at least 60" — precise about ordinary scores, silent about students with no recorded score at all.
3. **Edge cases, deliberately sought out (Unit 3):** the boundary value of exactly 60; the out-of-range value of –5; the missing score, reappearing from Unit 2.
4. **The gap between meaning and execution (Unit 4):** a person skips the excused student without thinking about it; a machine, given only the stated rule, compares a defaulted 0 to 60 and reports a false failure.
5. **Exhaustiveness (Unit 5):** every case found across Units 2–4 assigned a deliberate, stated outcome — including inventing a third outcome, "needs review," once it became clear that forcing every input into only two categories was itself the source of the problem.

The final rule in Unit 5 is not new material — every clause in it answers a specific case that was found and named earlier in this same lesson.

### What breaks without this

Suppose Units 3, 4, and 5 had been skipped, and the rule from Unit 2 — "passed if score is at least 60" — had been entered directly into a grading spreadsheet exactly as stated, using a formula that compares each student's score cell to 60. For every student with an actual recorded score, this works flawlessly. Now consider the one student excused from the exam, whose score cell was left blank. Many spreadsheet formulas, when asked to compare a blank cell numerically, silently treat that blank as 0 — a default nobody using the sheet chose or was even aware of. The formula evaluates `0 ≥ 60`, gets false, and the excused student's name appears, without anyone deciding it should, on the "did not pass" list that gets emailed to parents. Nothing crashed. Nothing looked wrong to whoever ran the report — the formula ran cleanly and produced a confident, ordinary-looking result. The error is invisible until the excused student's parent asks why their child is listed as failing an exam they were formally excused from. Restoring Unit 5's exhaustiveness check fixes this directly: a blank score is explicitly routed to "needs review" instead of being silently compared to 60 at all, and the case that caused the failure can no longer fall through to an accidental default, because it no longer falls through anywhere — it has its own stated outcome.

### Exercises

1. **Observe.** A manager says: "Send a reminder to everyone who hasn't finished the training." Write down what this vague request silently depends on, the way Concept Unit 1 found the unstated cutoff inside "passed."
2. **Predict.** Turn that request into a first-attempt explicit rule (pick a specific, stated way to decide "hasn't finished"). Before reading further, predict one edge case your rule doesn't address yet.
3. **Formalize.** For your rule from Exercise 2, deliberately construct three edge cases the way Concept Unit 3 did: one boundary value, one malformed or out-of-range input, and one case where the relevant data is simply missing.
4. **Explain.** For each of the three edge cases from Exercise 3, explain what a person handling the situation by hand would do without thinking about it (per Concept Unit 4), and what your literal rule, as currently stated, would actually do instead. Are they the same?
5. **Formalize.** Rewrite your rule so that all three edge cases from Exercise 3 have an explicit, deliberate outcome — inventing an additional outcome category if forcing every case into just two options (like "remind" / "don't remind") turns out to be part of the problem, the way "needs review" was in Concept Unit 5.

### Definition of done

- [ ] You can state, in your own words, the difference between a vague request and an explicit rule, without simply calling one "more detailed" than the other.
- [ ] You can explain why a numerically precise-looking rule (Concept Unit 2) is not automatically a finished one.
- [ ] You can name, for the final passing rule, at least one boundary value, one malformed input, and one missing-data case — and state the outcome each one gets under the final rule.
- [ ] You can explain, using the excused student, why a machine's literal execution of a rule can differ from what a person applying the same rule by hand would do, even though neither one is misbehaving.
- [ ] You completed Exercises 1–5 for a request of your own choosing, not the exam-grading example.
- [ ] Commit your written answers to Exercises 1–5 to your own notes, with a commit message stating which edge case in your own example was hardest to notice, and why.
