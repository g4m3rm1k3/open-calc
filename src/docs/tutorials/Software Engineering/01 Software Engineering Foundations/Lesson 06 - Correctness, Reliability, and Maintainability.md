# Lesson 6: Correctness, Reliability, and Maintainability

**What you will build.** One small function, `average`, computing the mean
of a list of sensor readings, taken through three separate, real changes —
none of which make it "more correct" in the sense Lesson 1 or Lesson 2
used that word. Each version is exactly as correct as the last, on the
inputs correctness was ever claimed for. What changes is whether it
survives contact with input it wasn't specifically built for, and whether
a future change to its rules is cheap or expensive to make. Those turn out
to be three genuinely separate properties, and this lesson exists to give
each one its own name so they stop getting silently treated as one thing.

**What you need to know first.** Lesson 2's programming question versus
engineering question (this lesson names one specific way a fully "correct"
program can still fail the engineering question), and Lesson 5's
cost-of-change curve (this lesson's third property, maintainability, is
essentially that curve's slope, made controllable).

**Terms introduced in this lesson**

- **correctness** — a system's behavior matching its actual specification,
  for every input that specification covers — not just "it ran without
  crashing," and not just "it produced a plausible-looking number" on the
  cases someone happened to try. The word is given this precise,
  spec-relative meaning here because Lesson 2 already showed that code can
  be correct by this definition and still be the wrong thing to have
  built — correctness answers "does it match what it was told to do," not
  "was it told the right thing."
- **reliability** — a system continuing to behave correctly across real
  operating conditions over time: unexpected inputs, timing, partial
  failures, and repetition — not only the one clean condition a single
  correctness check exercises. The word exists because "correct once, on
  a known input" and "correct across everything that actually happens to
  this code while it's running for real" are different claims, and only
  one of them is what actually matters once code is running unattended.
- **maintainability** — how cheaply and safely a system can be correctly
  changed later, by someone who may not be the person who originally
  wrote it. The word exists because two versions of the same code can be
  equally correct and equally reliable today while differing enormously
  in what the *next* change to either of them will cost — maintainability
  is a claim about the future, not about current behavior at all.

**Objects and methods used.** None new — `sum()`, `len()`, `any()`, and
ordinary conditionals are already-assumed syntax under this curriculum's
established convention.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: Correctness — and the Edge of What It Was Ever Claiming

### The Problem

A sensor reports a batch of temperature readings; write a function
returning their average. The specification, stated precisely: *for a
non-empty list of numbers, return their arithmetic mean.*

### The Code, Run for Real

```python
def average(readings):
    return sum(readings) / len(readings)
```

Check it against the specification's own terms — a real, non-empty batch:

```python
print(average([68.0, 70.5, 71.0]))
```

Running it:

```text
$ python sensors.py
69.83333333333333
```

$(68.0 + 70.5 + 71.0) / 3 = 69.8\overline{3}$, matching by hand. Against
the specification it was actually given — a non-empty list — this
function is correct.

### The Edge the Specification Never Covered

Now call it with an empty list, which the specification above never made
a claim about one way or the other:

```python
print(average([]))
```

Here's what actually happens:

```text
$ python sensors.py
Traceback (most recent call last):
  File "sensors.py", line 5, in <module>
    print(average([]))
  File "sensors.py", line 2, in average
    return sum(readings) / len(readings)
ZeroDivisionError: division by zero
```

This is not a correctness failure the way Lesson 1's `KeyError: None` was.
Lesson 1's crash broke a case the function's own earlier behavior had
already promised to handle. This crash happens on a case the
specification never made a promise about at all — "for a non-empty list"
was the whole claim, and an empty list is simply outside it. **Correctness**
is always relative to what was actually specified; asking whether this
function is "correct" on empty input is a bit like asking whether a stated
rule about odd numbers is "wrong" about even ones. It isn't wrong. It
never spoke to that case.

### Mechanical Walkthrough

- `sum(readings) / len(readings)` — already-assumed syntax (division,
  `sum`, `len`); the only new idea in this unit isn't in the code at all,
  it's in how to talk about what the code's crash does and doesn't prove.

### CS Lens

This is the same relative-correctness idea Lesson 2 introduced — a
program is only ever correct *against a stated question* — applied here
to a function's domain (which inputs it claims to handle) rather than to
whether the stated question was the right one to ask in the first place.

### SE Lens

It would be possible to "fix" this by making `average([])` return `0` or
`None` right now, and that might well be the right call eventually — but
notice that doing so silently, inside this unit, would be answering a
requirements question (what should happen on an empty batch?) by
guessing, exactly the trap Lesson 2's closing unit warned about. This
lesson leaves that specific decision for the next unit, on purpose, and
asks a narrower question first: regardless of what the "right" behavior
for an empty batch eventually turns out to be, is a hard crash, right
now, actually an acceptable way for this function to behave inside a
larger, real system? That's not a correctness question. It's the next
one.

---

## Concept Unit: Reliable Under Cases the Spec Never Ruled Out

### The Problem

`average` doesn't run by itself in a vacuum — picture it running inside a
real batch job, processing one sensor's readings after another,
unattended, for as long as the sensors keep reporting.

### Run It Inside a Real Batch

```python
def average(readings):
    return sum(readings) / len(readings)

batches = [[68.0, 70.5, 71.0], [], [72.0, 72.5]]

for batch in batches:
    print(average(batch))
```

One of these three batches — the middle one — is empty, the way a real
sensor's occasional dropped reading might produce. Here's what actually
happens:

```text
$ python batch_job.py
69.83333333333333
Traceback (most recent call last):
  File "batch_job.py", line 7, in <module>
    print(average(batch))
  File "batch_job.py", line 2, in average
    return sum(readings) / len(readings)
ZeroDivisionError: division by zero
```

The first batch processes correctly. The second batch's crash doesn't
just fail the second batch — it stops the whole loop. The third batch,
`[72.0, 72.5]`, perfectly valid, never gets processed at all, not because
anything was wrong with it, but because something unrelated, earlier in
the same run, was.

### The Fix

```python
def safe_average(readings):
    if not readings:
        return None
    return average(readings)
```

Run the identical batch job against `safe_average` instead:

```python
for batch in batches:
    result = safe_average(batch)
    if result is None:
        print("skipped empty batch")
    else:
        print(result)
```

Running it:

```text
$ python batch_job.py
69.83333333333333
skipped empty batch
72.25
```

All three batches now get processed. The empty one is skipped, cleanly,
with a real signal saying so — and critically, the third batch's correct
answer, `72.25`, is now actually produced, which the crashing version
never even reached.

### The Concept

Compare `average` and `safe_average` on **correctness**, precisely: for
every non-empty batch, they compute the identical answer, by the identical
arithmetic. Neither is more correct than the other on the cases
correctness was ever claiming to cover. What changed is what happens on
the case correctness was silent about, once that case is no longer a
one-off experiment but a routine event inside a long-running system. A
single unhandled crash on one bad input taking an entire, otherwise-healthy
batch down with it is a **reliability** failure — a system failing to keep
behaving correctly across the real conditions it actually runs under, even
though every individual piece of it, examined alone, was doing exactly
what its own code said it would do.

### CS Lens

The same shape recurs constantly at larger scale: one malformed request
crashing an entire web server process instead of just failing that one
request; one corrupt record in a data pipeline halting the processing of
every record after it instead of just flagging that one; one slow
dependency call blocking an entire application instead of just that one
operation. In each case, correctness on the individual failing piece was
never actually the problem — the problem is that one failure's blast
radius reached far past the one thing that actually failed.

### SE Lens

The realistic alternative to `safe_average`'s explicit `if not readings:`
check isn't "never let anything fail" — some failures genuinely should
stop everything (this curriculum returns to exactly that judgment call at
real depth later). The choice being made here is narrower and more
concrete: deciding, deliberately, that one sensor's dropped batch
shouldn't be allowed to silently cost every other sensor's valid data in
the same run — a decision that costs two lines of code and buys back the
third batch's result, which the crashing version was throwing away for
free.

---

## Concept Unit: Maintainable — Cheap to Change, Independent of Today

### The Problem

`safe_average` is correct and reliable. A second, real implementation
reaches the identical behavior a different way:

```python
def safe_average_tangled(readings, batch_id=None, verbose=False):
    result = None
    if readings is not None:
        if len(readings) > 0:
            total = 0
            count = 0
            for r in readings:
                total = total + r
                count = count + 1
            if count > 0:
                result = total / count
    return result
```

Run it against the same three batches from the previous unit:

```text
$ python batch_job.py
69.83333333333333
None
72.25
```

Identical results — `69.83333333333333`, a skip on the empty batch (here
signaled by `None` directly, rather than the earlier `"skipped empty
batch"` message), and `72.25` for the third. On both correctness and
reliability, `safe_average` and `safe_average_tangled` are indistinguishable.

### The Same Required Change, Applied to Both

A new, real requirement arrives: a negative reading means the sensor
malfunctioned, and a batch containing one should be skipped the same way
an empty batch is. Apply it to `safe_average` first:

```python
def safe_average(readings):
    if not readings:
        return None
    if any(r < 0 for r in readings):
        return None
    return average(readings)
```

One new, self-contained line, sitting directly next to the check it
parallels. Now the identical requirement, applied to
`safe_average_tangled`:

```python
def safe_average_tangled(readings, batch_id=None, verbose=False):
    result = None
    if readings is not None:
        if len(readings) > 0:
            total = 0
            count = 0
            has_negative = False
            for r in readings:
                if r < 0:
                    has_negative = True
                total = total + r
                count = count + 1
            if count > 0 and not has_negative:
                result = total / count
    return result
```

Making the same change here required a new variable threaded through the
loop, a new branch inside the loop body, and a change to the condition
guarding the existing result — three separate edits, in three separate
places, inside code that was already three levels of nesting deep before
this change even started. Run both updated versions against the same
three batches plus one new one containing a negative reading:

```text
$ python batch_job.py
69.83333333333333
None
72.25
None
```

Both versions — checked independently — produce this identical output.
The two functions are, once again, exactly as correct and exactly as
reliable as each other, on every case tried.

### The Concept

Nothing about this unit measured correctness or reliability differently
between the two versions — by both of those standards, `safe_average` and
`safe_average_tangled` remain tied, before the change and after it. What
differed was the cost of making the *same real change* to each: one clean
line added next to its nearest relative, versus three edits spread across
already-nested logic, each one requiring the reader to first understand
the surrounding tangle well enough to know where a fourth condition even
belongs. That cost — not today's behavior, but tomorrow's price for
changing it — is **maintainability**, and it's exactly the cost-of-change
curve from Lesson 5, made into a property of the code itself rather than
of when a mistake happens to get caught: a more maintainable version keeps
that curve flatter, for every future change, not just the one this unit
happened to demonstrate.

### CS Lens

Two programs computing identical outputs on every input while differing
in internal structure is the same underlying fact program equivalence
proofs rely on — behavioral identity says nothing about structural
identity. Maintainability lives entirely in the second category, which is
exactly why no test suite checking only inputs and outputs can ever
measure it directly; it has to be judged by looking at the code itself,
and specifically by asking what a plausible next change would cost to
make.

### SE Lens

It would be tempting to conclude "always write the clean version, never
the tangled one" as though it costs nothing — but the tangled version
above wasn't written maliciously; code drifts toward that shape
gradually, one small addition at a time, each individual addition looking
locally reasonable, with the nesting and the mixed concerns only becoming
visible in hindsight, the way this unit's side-by-side comparison makes
visible on purpose. The real, ongoing engineering discipline maintainability
asks for isn't writing perfectly clean code the first time — it's
noticing, at each individual change, whether it's making the *next* change
easier or harder, and treating that as a real cost worth weighing, the
same way Lesson 5 argued a change's cost is worth weighing before the
change ships, not after.

---

## Connect the Pieces

One function, `average`, carried through three separate, genuinely
independent properties:

1. **Correctness** — `average([68.0, 70.5, 71.0])` → `69.83333333333333`,
   matching its stated specification exactly; `average([])` crashing is
   not a correctness failure, because the specification never covered
   empty input at all.
2. **Reliability** — the same crash, running inside a real batch job,
   destroys an unrelated, valid third batch's result along with it;
   `safe_average` fixes this without changing a single answer on any
   in-spec input — correctness held constant, reliability improved.
3. **Maintainability** — `safe_average` and `safe_average_tangled`,
   behaviorally identical before and after an identical new requirement,
   differ enormously in how many places that requirement's implementation
   had to touch — correctness and reliability held constant, cost of the
   next change not constant at all.

## What Breaks Without This

Take `safe_average_tangled` and hand it, with no further explanation, to
someone who didn't write it, along with one more real requirement: also
skip any batch where a reading exceeds 130 (an impossible temperature,
indicating sensor failure). Nothing crashes while they work — this is a
silent cost, not a loud one. They have to read past `result = None`, into
two levels of nested `if`, track what `has_negative` is doing and why,
and decide where a third guard condition belongs inside an already-crowded
`if count > 0 and not has_negative:` line, before writing a single new
line. The identical requirement, given for `safe_average` instead, is one
more `if` sitting next to two others exactly like it. The tangled
version isn't incorrect and isn't unreliable — it simply costs more, every
single time it has to change again, and that cost compounds with every
change that gets bolted on the same way the negative-reading check just
was.

## Exercises

1. Implement the "skip readings over 130" rule from this lesson's closing
   section on both `safe_average` and `safe_average_tangled`. Run both
   against a batch containing one out-of-range reading and confirm they
   agree.
2. Write, in a sentence each, one real scenario where a piece of code
   could be correct but not reliable, and a separate one where code could
   be reliable but not maintainable. Use examples other than this
   lesson's own.
3. Look back at Lesson 1's final `cart_total` (the `.get`-based fix).
   Classify it against all three properties from this lesson: is it
   correct, on what's actually specified? Is it reliable? Is it
   maintainable? Justify each answer in one line.

## Definition of Done

- [ ] You've run all three versions of the sensor-average code yourself
      and reproduced every output shown in this lesson, including the two
      crashes.
- [ ] You can state correctness, reliability, and maintainability as three
      separate definitions, from memory, without collapsing any two of
      them into one.
- [ ] You've completed all three exercises.
- [ ] Commit `safe_average`, `safe_average_tangled`, and the batch job
      that runs them. Commit message should explain *why* both
      implementations are kept side by side: for example, `Lesson 6 —
      two behaviorally identical implementations, kept together to show
      maintainability as a property test output alone can't reveal.`
