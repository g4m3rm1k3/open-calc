# Lesson 28: Preconditions

**What you will build.** Lesson 6's `average` function, given back its
original one-line body — no `safe_average` wrapper, no silent handling of
an empty list — but with the one fact that function always depended on
finally written into the code itself, checked, and reported clearly the
moment it's broken. The transferable problem: Lesson 6 called an empty
list "outside the specification" and left it at that. This lesson gives
that boundary a name, a place to live in the code, and a voice — so that
violating it produces a clear, immediate statement of whose fault it was,
instead of a cryptic error pointing at the wrong place entirely.

**What you need to know first.** Lesson 6's `average` and its
`ZeroDivisionError` on an empty list, and Lesson 20's `assert` — this
lesson gives that specific crash a real name and turns the ad hoc
`assert` calls from Lesson 20 into a formal part of how a function states
its own contract.

**Terms introduced in this lesson**

- **precondition** — a condition that must be true at the moment a
  function is called, in order for that function to be obligated to
  behave correctly. A precondition is the caller's responsibility, not
  the function's: if a precondition is violated, the fault lies with
  whoever called the function with input that broke it, not with the
  function itself, which was never promising anything for that case in
  the first place. This is the same relative-correctness idea Lesson 6
  used informally — "correct against a stated question" — given a real
  name and a real place in the code to live, rather than staying an
  unwritten fact about what a function's specification did or didn't
  cover.

**Objects and methods used.** `assert`, already given full treatment in
Lesson 20, reused here for a new, specific purpose: not checking a
finished system against acceptance criteria, but checking a single
function's own precondition at the exact moment it's called.

No pipeline diagram change — this lesson opens work in the
*Specification* stage Lesson 12 named; restated here for the first time
this domain touches it:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: The Boundary That Was Always There, Unwritten

### The Problem

Lesson 6 established that `average([])` crashing wasn't a bug — the
function's specification, "for a non-empty list, return the arithmetic
mean," never covered the empty case at all. Where, in the actual code,
does that boundary — non-empty only — actually live?

### The Concept

Nowhere. Read `average`'s original body again:

```python
def average(readings):
    return sum(readings) / len(readings)
```

The fact that `readings` must be non-empty exists only in Lesson 6's own
prose, and in whatever a careful reader manages to infer from the
division. It is not a **precondition** yet, in the sense this lesson
means the word — a precondition is a condition *stated*, as part of a
function's own contract, precisely enough that violating it produces a
clear signal naming what went wrong, rather than an incidental crash from
whatever line happens to break first. `average`'s current
`ZeroDivisionError` is exactly that kind of incidental crash: real,
correctly triggered, and completely silent about the actual, real reason
— that the caller passed something the function was never willing to
accept in the first place.

### CS Lens

This is the identical gap between Lesson 19's unstated assumption and a
requirement actually written down: the fact "readings must be
non-empty" has been true, load-bearing, and completely invisible in the
code since Lesson 6 — precisely an assumption, just one this lesson is
about to turn into something explicit and checkable instead.

### SE Lens

Distinguish this precisely from two lessons this curriculum has already
built: it isn't a constraint, in Lesson 18's sense — nothing outside the
problem is imposing it; it's intrinsic to what "average" even means
mathematically. It isn't merely an assumption either, in Lesson 19's
sense, once this lesson is done with it — the whole point of a
precondition is that it stops being silent.

---

## Concept Unit: Writing the Boundary Into the Function Itself

### The Problem

Turn the unwritten boundary into a real, checked precondition, without
changing what `average` does for any input it was always meant to
handle.

### The New Code

```python
def average(readings):
    assert len(readings) > 0, "precondition violated: readings must be non-empty"
    return sum(readings) / len(readings)
```

Run it against the same two cases Lesson 6 used:

```python
print(average([68.0, 70.5, 71.0]))
print(average([]))
```

Here's what actually happens:

```text
$ python average.py
69.83333333333333
Traceback (most recent call last):
  File "average.py", line 6, in <module>
    print(average([]))
  File "average.py", line 2, in average
    assert len(readings) > 0, "precondition violated: readings must be non-empty"
AssertionError: precondition violated: readings must be non-empty
```

The valid case behaves exactly as it always did — `69.83333333333333`,
unchanged. The empty case still crashes — this precondition doesn't make
`average([])` succeed, and it was never meant to. What changed is
*what the crash says*: not `ZeroDivisionError: division by zero`, a real
but incidental fact about how the violation happened to manifest one line
later, but `AssertionError: precondition violated: readings must be
non-empty`, naming the actual boundary that was actually crossed, at the
exact point it was crossed.

### Mechanical Walkthrough

- `assert len(readings) > 0, "..."` — already-assumed `assert` mechanics
  from Lesson 20, used here for a new purpose: not verifying a finished
  system against external acceptance criteria, but verifying, at the top
  of a function, that the specific condition its own contract depends on
  is actually true before doing any real work.
- Placement matters, worth tracing precisely: the `assert` runs *before*
  `sum(readings) / len(readings)`, so the failure happens at the true
  point of violation — the call itself — rather than one line later, deep
  inside an operation that was never the actual problem.

### CS Lens

This is a direct, small-scale instance of what formal contract systems
call a precondition check: many languages and tools support declaring
this kind of boundary as a first-class part of a function's signature,
checked automatically on every call — `assert` at the top of a function
body is the same idea, expressed with tools this curriculum has already
built rather than specialized language support.

### SE Lens

Writing this precondition cost one line and changed nothing about
`average`'s valid behavior — the entire benefit is concentrated in the
failure case, which is exactly where Lesson 1's regression and Lesson 6's
own crash both showed the real cost of software lives. A precondition
doesn't prevent every mistake; it makes the mistakes that do happen say
what they actually are.

---

## Concept Unit: Whose Job Is It to Satisfy the Precondition

### The Problem

Lesson 6 also built `safe_average`, which handles the empty case
internally instead of crashing. Does adding a precondition to `average`
make `safe_average` unnecessary, or redundant?

### The Concept

Neither — they're two legitimately different designs, and a precondition
is what makes the difference between them a decision stated on purpose,
rather than an accident of which function happened to get called.
`average`, with its precondition, is making a real claim: *"I promise
correct behavior only if you guarantee non-empty input — that guarantee
is your job, not mine."* `safe_average` makes a different, equally valid
claim: *"I handle the empty case myself, so you don't have to guarantee
anything."* Both are legitimate contracts. What a precondition prevents
is the worst of both worlds — a function that neither guarantees safety
for bad input nor tells you, clearly, that it doesn't. Once `average`'s
precondition is written down, a caller who can't guarantee non-empty
input has a real, informed choice: call `safe_average` instead, or
guarantee it themselves before calling `average` at all. Without the
precondition stated, that choice was never actually available — only a
crash, discovered the hard way.

### CS Lens

This is Design by Contract's own foundational split, previewed here
before this domain names it formally: a function's precondition marks
the exact line between what the *caller* must guarantee and what the
*function* must guarantee in return — a boundary of responsibility, in
exactly the sense Lesson 8's separation of concerns already argued
responsibilities need to be explicit to be trusted.

### SE Lens

The realistic risk of never stating this kind of boundary isn't that
`average([])` crashes — it was always going to, one way or another. It's
that every caller has to independently rediscover, usually the hard way,
exactly which inputs are safe, instead of being told, once, in the one
place that actually knows.

---

## Connect the Pieces

One function, one boundary, given a name and a voice:

1. **The unwritten boundary** — `average` always required a non-empty
   list; nothing in its code, before this lesson, said so.
2. **The boundary, made explicit and checked** — one `assert`, run
   before any real work, turning an incidental `ZeroDivisionError` into
   a precise `AssertionError` naming the actual violation.
3. **Responsibility, made a real choice** — `average`'s precondition and
   `safe_average`'s internal handling are both legitimate; stating the
   precondition is what lets a caller actually choose between them,
   instead of discovering the difference by crashing.

## What Breaks Without This

Leave `average`'s boundary unwritten, the way Lesson 6 left it, and let a
caller three files away pass it a list that's empty under a real,
legitimate condition — a sensor that hasn't reported anything yet this
hour, say. The crash they see is `ZeroDivisionError: division by zero`,
a true fact about *how* the failure happened, and a genuinely misleading
one about *why* — nothing points them toward "you needed to guarantee a
non-empty list," and they're left debugging arithmetic in a function
that was never actually broken.

## Exercises

1. Add a second precondition to `average`: every element of `readings`
   must be a real number, not, say, `None`. Write the `assert`, run it
   against a list containing one `None`, and confirm the error message
   names the actual problem.
2. Write a precondition for Lesson 2's `is_username_available` — think
   about what it silently requires to be true of `existing_usernames` for
   its answer to be trustworthy (Lesson 19's own normalization assumption
   is a strong candidate).
3. Explain, in a few sentences, why a precondition failing should
   generally *not* be handled by quietly returning a default value
   instead of raising an error — think back to Lesson 1's closing section
   on silent, wrong-answer bugs.

## Definition of Done

- [ ] You can define "precondition" in your own words, and explain why
      violating one is the caller's fault, not the function's.
- [ ] You've run the precondition-checked `average` yourself and
      reproduced both the valid and the failing case.
- [ ] You've completed all three exercises.
- [ ] Commit the precondition-checked `average`. Commit message should
      explain *why*: for example, `Lesson 28 — average's non-empty
      requirement is now a checked precondition, so violating it reports
      the real problem instead of an incidental ZeroDivisionError.`
