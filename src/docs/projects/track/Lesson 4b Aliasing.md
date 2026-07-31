# Lesson 4b: Aliasing — Two Names, One Object

**What you will build:** No new code — this lesson names a situation
Lesson 4a's own real, executed code already demonstrated.

**What you need to know first:** Lesson 4a's reference.

**Terms introduced in this lesson:**

- **Aliasing** — two or more variables referencing the exact same
  underlying object, so a change made through one is visible through
  the other.

---

## Concept Unit: Aliasing — Two Names, One Object

### The Problem

Lesson 4a's `first`/`second` example demonstrated a real consequence
without naming it: two variables can refer to the exact same object,
and a change made through either one is visible through both. This
specific situation — not the general fact that variables hold
references, but two variables sharing one reference at the same time —
deserves its own name, since it's the actual, specific source of the
common "why did changing X also change Y" confusion.

### Introduce the Concept in Isolation

This concept doesn't need new code beyond what Lesson 4a already built
and ran — it names the specific situation that code already
demonstrated. `first` and `second`, both pointing at the one real
`Box` object, are `aliasing` — **first appearance**: two or more
variables referencing the exact same underlying object, so a change
made through one is visible through the other. `first` and `second`
are **aliases** of each other — two different names for the exact same
thing, not two different things that happen to currently hold equal
values.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a situation Lesson
4a's own real, executed code already demonstrated.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already run and proven in Lesson 4a.

### CS Lens

Aliasing is the specific, real-world consequence of reference
semantics: whenever two variables end up holding the same reference —
through direct assignment, as in Lesson 4a, or by both being passed the
same object as an argument — they become aliases, and neither variable
"owns" the object more than the other. Modifying an object through any
one of its aliases is visible through every other alias, because there
was only ever one real object all along.

Also recognized in: two variables in Python both bound to the same
list (`b = a` aliases exactly like Java's `second = first`), any
language with reference semantics generally, shared mutable state in
concurrent programming (a much higher-stakes version of the exact same
underlying fact — two threads holding aliases to the same object).

### SE Lens

Aliasing is not a mistake to avoid outright — it's a real, load-bearing
mechanism (a method receiving an object as a parameter is handed an
alias to the caller's own object, on purpose, so the method can act on
it). The risk is specifically *unintentional* aliasing: code that
assumes it's working with its own independent copy of an object, when
it's actually sharing one with other code that can change it
unexpectedly.

---

## Connect the Pieces

`Box first = new Box();` (Lesson 4a) built one real object; `Box
second = first;` made `second` an alias of it, not an independent
copy. Every change made through either variable was visible through
both, because that's what a reference genuinely is: a pointer to
shared storage, not a private copy.

## What Breaks Without This

A common mistake this exact confusion causes: assuming `second =
first;` created an independent copy, then being surprised that
modifying `first` later also changes `second`:

```java
Box first = new Box();
first.value = 10;

Box second = first;
first.value = 500;

System.out.println("second.value: " + second.value);
```

Run it yourself and see the real output: `second.value: 500`.
`second.value` changed even though `second` itself was never directly
touched after its creation — because `second` was never an independent
copy in the first place.

## Exercises

1. Add a method `void resetValue()` to `Box`, setting `value` back to
   `0`, and confirm calling `second.resetValue()` also changes what
   `first.value` reads as — the same aliasing consequence, now through
   a method call instead of direct field assignment.
2. Predict, before running it, what `first.value` and `second.value`
   would each print after Exercise 1's `resetValue()` call, then check
   your prediction against the real output.
3. Explain, in your own words, why aliasing itself isn't a bug — only
   *unintentional* aliasing is.

## Definition of Done

- [ ] You ran the example in "What Breaks Without This" and saw the
      real, shared `500` output.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, what makes
      two variables aliases of each other.
