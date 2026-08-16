# Lesson 17: Non-Functional Requirements

**What you will build.** A second, precise requirement for Lesson 16's
`cart_total` — not about what it returns, but about how quickly it has to
return it — checked against both implementations from that lesson on a
realistic, hundred-item cart. One passes easily. The other, still
completely correct by Lesson 16's functional requirement, fails by more
than three hundred times over. The transferable problem: a functional
requirement and a non-functional requirement aren't a main requirement
and an optional extra — they're two separate, both-binding contracts, and
a system that satisfies only one of them has failed exactly half of what
it was actually asked to do.

**What you need to know first.** Lesson 16's functional requirement for
`cart_total`, and its two implementations, `cart_total` and
`cart_total_wasteful` — both satisfied that requirement identically; this
lesson writes the second requirement that was always missing.

**Terms introduced in this lesson**

- **non-functional requirement** — a precise, checkable statement about a
  *quality* of how a system performs its behavior, rather than about the
  behavior itself: how fast, how reliably, how securely, under how much
  load. "`cart_total` must return a hundred-item cart's total in under 1
  millisecond" is a non-functional requirement — it says nothing about
  what the correct total *is*, only about a real constraint on how the
  correct answer must be delivered. The term is defined this precisely,
  paired directly against Lesson 16's functional requirement, because the
  two are meant to be read together as one complete requirement, never
  one standing in for the other.

**Objects and methods used.** `time.perf_counter()`, already given full
treatment in Lesson 7, reused here silently per the Repetition Rule.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: The Requirement Lesson 16 Never Wrote

### The Problem

Lesson 16 proved that "given a list of prices, return their sum" cannot
tell `cart_total` and `cart_total_wasteful` apart — both satisfy it
completely. What requirement, stated with the same precision, actually
can?

### The Concept

A **non-functional requirement**, stated exactly as precisely as Lesson
16's functional one: *`cart_total` must compute the total of a
hundred-item cart in under 1 millisecond.* Notice what this sentence does
and doesn't say — it says nothing about what the correct total for any
particular cart actually is; it says something entirely different, and
just as checkable: a real limit on how long computing that correct answer
is allowed to take. A system can violate this requirement while returning
a perfectly correct number, the same way it could violate Lesson 16's
functional requirement while returning instantly — the two requirements
are independent, checkable separately, and neither one implies the other.

### CS Lens

This is Lesson 8's separation of concerns, applied to requirements
themselves rather than to code: functional and non-functional
requirements are two genuinely different concerns — what happens, versus
how well — and stating them as one blended sentence would make both
harder to check precisely, the identical cost Lesson 8 already
demonstrated for tangled code.

### SE Lens

Writing this requirement costs something real that writing "the cart
should be fast" wouldn't have: a specific number, `1` millisecond,
defensible or debatable, but actually checkable. "Fast" can't be
violated in any provable way; `1` millisecond can be, precisely, which is
the entire reason this lesson bothers to write it as a real number rather
than an adjective.

---

## Concept Unit: Checking It For Real

### The Problem

Take both of Lesson 16's implementations — identical on the functional
requirement — and check them against this lesson's new, non-functional
one, using a cart large enough for the difference to actually show up.

### The Code, Run for Real

```python
big_cart = [9.99] * 100
```

Time both implementations against it:

```python
import time

start = time.perf_counter()
cart_total(big_cart)
fast_ms = (time.perf_counter() - start) * 1000

start = time.perf_counter()
cart_total_wasteful(big_cart)
wasteful_ms = (time.perf_counter() - start) * 1000

print("cart_total:", round(fast_ms, 4), "ms")
print("cart_total_wasteful:", round(wasteful_ms, 4), "ms")
print("cart_total meets 1ms NFR:", fast_ms < 1)
print("cart_total_wasteful meets 1ms NFR:", wasteful_ms < 1)
```

Running it:

```text
$ python cart_total_nfr.py
cart_total: 0.0069 ms
cart_total_wasteful: 362.6641 ms
cart_total meets 1ms NFR: True
cart_total_wasteful meets 1ms NFR: False
```

`cart_total` finishes in about seven microseconds — comfortably under the
one-millisecond budget. `cart_total_wasteful` takes over three hundred
and sixty milliseconds — more than three hundred and sixty times over
budget, for a hundred-item cart that isn't even unusually large. The
functional requirement from Lesson 16 could not distinguish these two
functions. This one does, immediately and decisively.

### Mechanical Walkthrough

- `[9.99] * 100` — already-assumed list repetition; produces a
  hundred-element list, all `9.99`, standing in for a realistic cart size
  rather than Lesson 16's three-item example.
- `(time.perf_counter() - start) * 1000` — converting a duration already
  measured in seconds (per `perf_counter`'s own unit, established in
  Lesson 7) into milliseconds, to match the units this lesson's
  requirement was actually stated in.
- `fast_ms < 1` — already-assumed comparison; this is the entire
  mechanism of "checking" a non-functional requirement: not equality
  against an expected value, the way Lesson 16's functional check worked,
  but a real measurement compared against a real, stated limit.

### The Concept

`cart_total_wasteful` is not disqualified by anything this lesson has
found wrong with its output — its output was, and remains, perfectly
correct. It's disqualified by a completely separate, equally real
requirement that Lesson 16 deliberately never wrote, and that no amount
of checking correct outputs would ever have caught. A system that passes
every functional check and fails a stated non-functional one hasn't
half-succeeded — it has failed a real, binding requirement, exactly as
much as if it had returned the wrong total.

### CS Lens

This mirrors Lesson 6's reliability distinction exactly, one level up:
correctness (Lesson 6) and this lesson's functional requirements answer
the same underlying question — does the output match what was asked —
while non-functional requirements, like Lesson 6's reliability, ask
whether the system keeps behaving acceptably under real, measured
conditions rather than only in a single, idealized check.

### SE Lens

`1` millisecond as the actual number is a real engineering decision, not
a fact handed down from nowhere — it would come, in a real system, from
knowing how `cart_total` is actually used: how many times per second, as
part of what larger operation, with what other work competing for the
same time budget. This lesson doesn't derive that number from anything
deeper because deriving it is this curriculum's later work; what matters
here is that the number exists, is stated precisely, and is checked the
same rigorous way the functional requirement was.

---

## Concept Unit: Neither One Is Optional

### The Problem

Is a non-functional requirement less important than a functional one,
since it's checked separately and often written later?

### The Concept

No — and `cart_total_wasteful` is the proof: it is not "functionally
correct with a performance issue," treated as some secondary blemish on
an otherwise-finished feature. It is a function that fails a real,
binding requirement, in exactly the same sense that a function returning
the wrong total would fail one. Both kinds of requirement are equally
part of "what was actually asked for" — Lesson 16 supplied one half,
this lesson supplies the other, and a complete requirement for
`cart_total` was never either one alone, only both together. This also
means the two can genuinely conflict with each other — a faster
implementation might use more memory, or a more secure one might be
slower — which is Lesson 11's tradeoff vocabulary again, now applied
specifically to balancing multiple non-functional requirements against
each other, a question this curriculum's later domain on conflicting
requirements takes on directly.

### CS Lens

Formal specification traditions draw the identical line: a function's
type signature and logical contract describe *what* it computes, while
separate, differently-checked claims — a complexity bound, a resource
limit — describe *how well*. Neither is treated as the "real"
specification with the other as commentary; both are binding, checked by
different means.

### SE Lens

The realistic failure mode this lesson is built to prevent isn't writing
non-functional requirements incorrectly — it's never writing them at
all, and mistaking a fully green functional test suite for a fully
specified system, the exact trap `cart_total_wasteful` would have
sailed through undetected if this lesson's `1`-millisecond check had
never been written down.

---

## Connect the Pieces

One function, two requirements, both checked, both binding:

1. **The functional requirement (Lesson 16)** — given a list of prices,
   return their sum; both `cart_total` and `cart_total_wasteful` pass it
   identically.
2. **The non-functional requirement (this lesson)** — compute a
   hundred-item cart's total in under 1 millisecond; `cart_total` passes
   at `0.0069` ms, `cart_total_wasteful` fails at `362.6641` ms.
3. **Both required, neither optional** — `cart_total_wasteful` is a real
   requirements failure, not a minor caveat on an otherwise-complete
   feature.

## What Breaks Without This

Ship `cart_total_wasteful` because every functional test — Lesson 16's
own equality checks — passes, and nobody ever wrote down a real number
for how fast it needed to be. In a real checkout flow processing carts
back to back, each one paying `cart_total_wasteful`'s roughly
three-hundred-and-sixty-millisecond tax on top of everything else the
page has to do, the system is slow enough that real users notice, and the
root cause is a fully "correct," fully tested function that nobody ever
checked against a requirement covering the actual thing that was wrong
with it.

## Exercises

1. Write a second non-functional requirement, in this lesson's precise
   style, for how much *memory* `cart_total` may reasonably use — think
   about whether a hundred-item cart versus a hundred-thousand-item cart
   changes your answer.
2. Go back to Lesson 15's `search_files_ranked`. Write one real
   non-functional requirement for it (response time, or how large a file
   list it should handle without becoming noticeably slow), separate from
   the ranking-quality concern that lesson already addressed.
3. `cart_total_wasteful`'s inner loop was deliberately contrived for this
   lesson's demonstration. Describe, in a sentence or two, one *realistic*
   way a function could end up failing a non-functional requirement
   without anyone writing obviously wasteful code on purpose — think back
   to Lesson 7's leaky abstraction.

## Definition of Done

- [ ] You can define a non-functional requirement in your own words, and
      give an example distinct from response time.
- [ ] You've run this lesson's timing comparison yourself and reproduced
      both numbers.
- [ ] You can explain why `cart_total_wasteful` counts as a real
      requirements failure, not a minor issue.
- [ ] You've completed all three exercises.
- [ ] Commit the timing check alongside `cart_total` and
      `cart_total_wasteful`. Commit message should explain *why*: for
      example, `Lesson 17 — added a 1ms non-functional requirement check;
      cart_total_wasteful fails it despite passing every functional
      check from Lesson 16.`
