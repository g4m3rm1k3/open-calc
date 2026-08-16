# Lesson 108: Designing a Data Structure

**What you will build**: This lesson works differently from every other one in this section. There is no new concept to introduce — instead, you'll design a real structure yourself from a short list of required operations, using nothing but tools this section already gave you, before this lesson shows you anything at all. Afterward, you'll review a real candidate implementation that contains exactly one deliberately planted mistake, and find it yourself before it's revealed.

**What you need to know first**: Everything built in this section (Lessons 83–107) is fair game — this lesson scaffolds as little as possible on purpose.

---

## The Challenge

Design a structure supporting three operations, each expected to run often, on a large, changing collection of numbers:

1. **`insert(value)`** — add a value.
2. **`find-min()`** — return the smallest value currently present.
3. **`find-max()`** — return the largest value currently present.

All three need to be fast — specifically, faster than scanning every element (`O(n)`) for `find-min`/`find-max` after every insertion.

**Before reading any further, stop and design this yourself.** You have everything you need: Lesson 94 already built a structure answering "what's the current minimum" in `O(1)`, and its own Exercise 5 already had you build the mirror-image structure for "what's the current maximum." The only genuinely new question this challenge asks is how to combine the two into one structure supporting all three operations together, and what that combination actually costs.

---

## A Companion Implementation

Here is one real attempt, built entirely from Lesson 94's own tools. Read it as if it were handed to you by a collaborator, before checking whether it's actually correct.

```clojure
(declare max-sift-up)

(defn max-sift-up-at-parent [heap i parent]
  (if (> (get heap i) (get heap parent))
    (max-sift-up (heap-swap heap i parent) parent)
    heap))

(defn max-sift-up [heap i]
  (if (= i 0)
    heap
    (max-sift-up-at-parent heap i (heap-parent-index i))))

(defn max-heap-insert [heap value]
  (max-sift-up (assoc heap (count heap) value) (count heap)))
```

This is Lesson 94's own `sift-up`/`heap-insert`, with exactly one comparison flipped (`>` instead of `<`) — the mirror-image max-heap its own Exercise 5 already asked for. Now the structure combining both:

```clojure
(defn minmax-make [] [[] []])
(defn minmax-mins [s] (get s 0))
(defn minmax-maxes [s] (get s 1))

(defn minmax-insert [s value]
  [(heap-insert (minmax-mins s) value) (max-heap-insert (minmax-maxes s) value)])

(defn minmax-min [s] (heap-peek (minmax-mins s)))
(defn minmax-max [s] (heap-peek (minmax-mins s)))
```

`minmax-make` holds two heaps side by side — Lesson 85's vector-as-pair, applied to two whole structures rather than two values. `minmax-insert` inserts the new value into *both*, keeping them in sync. `insert` costs `O(\log n)` (two heap insertions); `find-min` and `find-max` are both meant to be `O(1)` — direct reuse of Lesson 94's own `heap-peek`.

---

## Find the Mistake

Before reading the next section, test this yourself. Insert the same seven values this series has used since Lesson 91 — `40, 20, 60, 10, 50, 30, 70` — and check both `minmax-min` and `minmax-max` against what you already know the real minimum and maximum are.

```clojure
(def s (minmax-insert (minmax-insert (minmax-insert (minmax-insert (minmax-insert (minmax-insert (minmax-insert (minmax-make) 40) 20) 60) 10) 50) 30) 70))
```

Run `(minmax-min s)` and `(minmax-max s)` yourself, and compare both results against the actual minimum (`10`) and maximum (`70`) of the seven inserted values, before continuing.

---

## Revealed: What's Wrong

```
user=> (minmax-min s)
10
user=> (minmax-max s)
10
```

`minmax-max` returns `10` — the *minimum*, not the maximum. The bug is in `minmax-max`'s own definition: `(heap-peek (minmax-mins s))` reads from `minmax-mins`, not `minmax-maxes` — a one-word mistake, easy to make and easy to miss, since `minmax-insert` itself is completely correct and genuinely does keep both heaps properly in sync. Nothing about `insert` is wrong at all; the entire failure is isolated to one function reading the wrong one of two very similarly-named, very similarly-shaped structures sitting right next to each other.

This is exactly the kind of mistake Lesson 106's abstraction barrier exists to make less likely, not impossible: `minmax-mins` and `minmax-maxes` are both real, named accessors — the mistake was calling the *right kind of thing* (a proper accessor, not a raw `get`) with the *wrong name*, which no representation invariant this section built can catch on its own. Only checking the actual answer against known ground truth — exactly what "Find the Mistake" asked you to do before this section revealed anything — catches it.

The fix:

```clojure
(defn minmax-max [s] (heap-peek (minmax-maxes s)))
```

```
user=> (minmax-max s)
70
```

---

## Why This Matters

Every structure in this section — the BST, the heap, the trie, union-find — was presented to you already correct, with its own derivation as proof. This lesson inverted that: a plausible-looking, mostly-correct implementation, and the responsibility of verifying it yourself before trusting it. That responsibility — not recognizing new syntax, not recalling a formula — is the actual skill this section has been building toward the entire time: the ability to look at someone else's (or your own) working code, ask "does this really do what it claims," and find out for certain rather than assume.

## Exercises

1. **Verify.** Confirm, by hand-tracing `max-heap-insert`'s own comparisons, that the max-heap inside `s` genuinely holds `70` at its root before the fix — the bug was entirely in `minmax-max`, never in construction.
2. **Generalize.** Extend this structure with `minmax-remove-min` and `minmax-remove-max`, using Lesson 96's `heap-extract-min` and its own max-heap mirror. Consider: does removing from one heap ever need to affect the other?
3. **Break it, on purpose, differently.** Introduce a *different* single-word mistake into this lesson's corrected version — one that breaks `insert` instead of `find-max` — and describe exactly what symptom would reveal it.
4. **Reflect.** Before this lesson revealed the bug, did you find it yourself? If not, what would have caught it faster — a different test value, a written invariant check, or something else?

## Definition of Done

- [ ] You designed a candidate solution to this lesson's challenge before reading the companion implementation.
- [ ] You tested the companion implementation against known ground truth and found the mistake yourself, or confirmed you understand exactly why you didn't.
- [ ] You completed Exercise 2 and reasoned through whether `minmax-remove-min` affects the max-heap.
- [ ] You completed Exercise 3 and correctly predicted the symptom of your own planted mistake.
- [ ] Commit your Exercise 2 and Exercise 3 work to your notes repository, with a commit message stating what you found — for example, `"Implement minmax-remove-min/max; plant and predict symptom of a second insert-side bug"` — not just `"lesson 108 exercise"`.

---

**Next lesson:** Lesson 109, *What Makes an Algorithm?*, opens Section VI — moving from this section's question, "how should data be shaped," to a new one: "what does it mean for a process acting on that data to be correct, and how is that different from the process merely happening to work today."
