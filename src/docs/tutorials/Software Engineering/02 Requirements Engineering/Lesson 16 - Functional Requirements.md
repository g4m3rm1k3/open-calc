# Lesson 16: Functional Requirements

**What you will build.** Two implementations of Lesson 1's `cart_total` —
the original, and a second version that recomputes the same arithmetic
thousands of times more than it needs to before returning an answer —
both checked against the exact same precise statement of what the
function must do, and both passing it completely. The transferable
problem: a functional requirement, stated precisely, is a powerful,
checkable tool for confirming *what* a system does — and by its own
nature, has nothing at all to say about *how well* it does it, which
turns out to be exactly as real a gap as any this curriculum has
demonstrated so far.

**What you need to know first.** Lesson 1's `cart_total`, reused directly
as this lesson's own example, and Lesson 15's task-versus-goal
distinction — a functional requirement, this lesson shows, describes the
task precisely and says nothing about the goal behind it.

**Terms introduced in this lesson**

- **functional requirement** — a precise, checkable statement of what a
  system must *do*: given a specific input or action, what output or
  effect must result. "Given a list of prices, `cart_total` must return
  their sum" is a functional requirement — specific enough that any real
  implementation can be checked against it directly, by giving it an
  input and confirming the output. The word is defined this precisely
  here because the rest of this domain depends on being able to tell a
  real functional requirement apart from a vague statement that only
  sounds like one.

**Objects and methods used.** `time.perf_counter()`, already given full
treatment in Lesson 7, reused here silently per the Repetition Rule.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: A Statement Precise Enough to Check

### The Problem

"The cart should calculate the total correctly" sounds like a
requirement. Is it one, in any sense that could actually be checked
against a real implementation?

### The Concept

That sentence can't be checked against anything — "correctly" doesn't say
what correct output looks like for any specific input, so there's no way
to point at a real implementation and say, definitively, whether it
satisfies the sentence or not. Compare it to a **functional requirement**,
stated precisely: *given a list of prices, `cart_total` must return their
sum.* This version names an input (a list of prices), and a required
output (their sum) — precise enough that Lesson 1's original
`cart_total`, run against `[12.50, 4.00, 7.25]`, can be checked directly:
does it return `23.75`? It does. The requirement is satisfied, in a way
that's actually demonstrable, not just asserted.

### CS Lens

This is the identical shape as Lesson 1's very first unit — a program
graded once, against a fixed, checkable question — with the vocabulary
this domain has been building since Lesson 13 layered on top: a
functional requirement is what turns "does this code work" from a vague
feeling into a specific, answerable question.

### SE Lens

The realistic risk here isn't writing a requirement this vague on
purpose — it's writing one that merely *sounds* precise while still
leaving the actual behavior unconstrained, which is exactly what this
lesson's next unit demonstrates from the opposite direction: a
requirement precise enough to check, that still leaves far more
unconstrained than it looks like it does.

---

## Concept Unit: Precisely Satisfied, Wildly Different Underneath

### The Problem

Take the functional requirement from the previous unit exactly as
written — given a list of prices, return their sum — and build a second,
real implementation that also satisfies it.

### The Code, Run for Real

```python
def cart_total(prices):
    return sum(prices)

def cart_total_wasteful(prices):
    total = 0
    for price in prices:
        recomputed = 0
        for _ in range(20000):
            recomputed += price
            recomputed -= price
        total += price
    return total
```

Check both against the identical requirement — same input, same required
output:

```python
prices = [12.50, 4.00, 7.25]
print("fast:", cart_total(prices))
print("wasteful:", cart_total_wasteful(prices))
print("same result:", cart_total(prices) == cart_total_wasteful(prices))
```

Running it:

```text
$ python cart_total.py
fast: 23.75
wasteful: 23.75
same result: True
```

Both return exactly `23.75`. By the functional requirement — the only
requirement either implementation has been given so far — they are
equally, completely correct. Now time them:

```python
import time

start = time.perf_counter()
cart_total(prices)
fast_time = time.perf_counter() - start

start = time.perf_counter()
cart_total_wasteful(prices)
wasteful_time = time.perf_counter() - start

print("fast time:", round(fast_time, 5))
print("wasteful time:", round(wasteful_time, 5))
```

Running it:

```text
$ python cart_total.py
fast time: 0.0
wasteful time: 0.00452
```

`cart_total_wasteful` runs a pointless twenty-thousand-iteration loop for
every single price, adding and immediately subtracting the same value,
before ever touching the running total — real, wasted work that produces
no different answer, measurably slower every time it's called.

### Mechanical Walkthrough

- `for _ in range(20000): recomputed += price; recomputed -= price` — an
  inner loop whose net effect on `recomputed` is always zero;
  already-assumed `for`/`range` syntax, deliberately doing nothing useful
  twenty thousand times before the outer loop's real work,
  `total += price`, ever runs.
- `cart_total(prices) == cart_total_wasteful(prices)` — already-assumed
  equality comparison; confirms both functions agree on every input this
  lesson checks, which is the entire content of "satisfies the functional
  requirement" as this lesson defined it.

### The Concept

Nothing in "given a list of prices, return their sum" says anything
about *how* that sum has to be computed, or how long it's allowed to
take. Both functions satisfy it, fully and identically — the requirement,
exactly as stated, cannot distinguish between them at all, because it was
never asked to. That's not a flaw in the requirement — it's the actual,
deliberate scope of what a **functional requirement** covers: observable
behavior, input to output, nothing about the qualities of *how* that
behavior is delivered. `cart_total_wasteful` is a real, working
demonstration that "correct" and "acceptable" are not the same claim, and
that a functional requirement, by itself, only ever promises the first
one.

### CS Lens

This is the same relationship as Lesson 9's cohesion and coupling
applied to requirements instead of code structure: two implementations
can be behaviorally identical — indistinguishable by any test of their
outputs — while differing enormously in a dimension neither the
requirement nor a black-box test was ever designed to see.

### SE Lens

It would be tempting to conclude the functional requirement should have
included a speed limit — and for some systems, at some scale, it
genuinely should. But notice what that conclusion actually is: a
different *kind* of requirement, about a quality of the behavior rather
than the behavior itself, which is a real, separate category this lesson
deliberately hasn't covered yet. Bundling speed, security, and every
other quality into the same requirement as the behavior itself makes both
harder to state precisely and harder to check independently — which is
exactly why this curriculum keeps them apart.

---

## Concept Unit: What a Functional Requirement Deliberately Leaves Unsaid

### The Problem

If functional requirements don't cover speed, what covers it — and why
keep the two apart on purpose, rather than writing one longer, more
complete requirement per feature?

### The Concept

Keeping them apart is deliberate, and it mirrors Lesson 8's separation of
concerns applied one stage earlier in the pipeline: a functional
requirement answers *what must this system do*, checkable by giving it an
input and inspecting the output, exactly the way this lesson's two
`cart_total` versions were checked. A separate category — covering speed,
security, reliability, and the other qualities Lesson 11 already named —
answers a genuinely different question, *how well must it do it*, checked
by a different kind of measurement entirely, the way this lesson's timing
comparison had to reach for `time.perf_counter()` rather than a simple
equality check. Conflating the two into one requirement produces exactly
what `cart_total_wasteful` demonstrates the risk of: a system judged
"requirements met" by a check that was only ever capable of seeing half
the actual requirement.

### CS Lens

The same functional/non-functional split shows up in formal specification
work generally: a function's type signature or contract states what
inputs produce what outputs, while its complexity bound or resource usage
is stated, checked, and reasoned about entirely separately, using
different tools, even though both are real, binding facts about the same
function.

### SE Lens

This lesson deliberately stops short of building the non-functional side
of `cart_total`'s requirements — stating that boundary honestly is the
point. A functional requirement, done well, is a genuinely powerful,
checkable tool, exactly as this lesson's first unit demonstrated. It is
also, by design, only half the picture, and mistaking a fully satisfied
functional requirement for a fully specified system is the exact gap
`cart_total_wasteful` was built to make impossible to miss.

---

## Connect the Pieces

One functional requirement, two implementations, one gap:

1. **Precise enough to check** — "given a list of prices, return their
   sum" turns "does the cart work" from a feeling into an answerable
   question.
2. **Satisfied identically by two very different implementations** —
   `cart_total` and `cart_total_wasteful` both return `23.75`, verified
   directly.
3. **The gap the requirement never covered** — `0.0` seconds versus
   `0.00452` seconds, a real, measured difference the functional
   requirement, exactly as stated, has no way to see or object to.

## What Breaks Without This

Treat "passes its functional requirement" as the entire definition of
done for a system, the way a checklist with only functional items would.
`cart_total_wasteful`, wired into a real checkout page handling many
carts at once instead of one lesson's worth of `print` statements, adds
real, compounding delay to every single request — and every functional
test still passes, every time, because none of them were ever asked to
notice.

## Exercises

1. Increase `cart_total_wasteful`'s inner loop from `20000` to `200000`
   iterations, re-run the timing comparison, and confirm the wasteful
   version's time grows roughly proportionally while `cart_total`'s stays
   effectively unchanged.
2. Write a functional requirement, in the same precise style as this
   lesson's own example, for Lesson 2's `is_username_available`. Then
   write one implementation that satisfies it correctly and, if you can,
   a second one that also satisfies it while being needlessly wasteful —
   the same exercise this lesson performed, on a different function.
3. Look back at Lesson 15's `search_files`. Was its ordering — the actual
   gap that lesson found — a functional requirement violation, or
   something else? Justify your answer using this lesson's own
   definition of "functional requirement."

## Definition of Done

- [ ] You can define a functional requirement in your own words, and
      explain why "the cart should work correctly" doesn't qualify as
      one.
- [ ] You've run both `cart_total` implementations and reproduced the
      timing gap yourself.
- [ ] You've completed all three exercises.
- [ ] Commit `cart_total_wasteful` alongside the original, not to keep it
      in production use, but as a record of this lesson's demonstration.
      Commit message should explain *why*: for example, `Lesson 16 —
      wasteful cart_total variant kept as a worked example of a
      functional requirement satisfied with nothing said about
      performance.`
