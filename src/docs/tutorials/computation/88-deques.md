# Lesson 88: Deques

**What you will build**: By the end of this lesson you'll be able to unify Lesson 86's stack and Lesson 87's queue into a single structure — a deque — supporting push and pop at *both* ends, by extending the two-stack trick symmetrically, and you'll surface a genuine, honest subtlety about immutability that peeking (rather than popping) introduces.

**What you need to know first**: Lesson 87's two-stack queue and amortized argument, and Lesson 86's stack operations.

**Terms introduced in this lesson**:

- **deque** (double-ended queue) — a collection supporting push and pop at *both* ends, cheaply. *Why it matters*: strictly more flexible than either a stack (one end only) or a queue (push one end, pop the other) — both are special cases of what a deque can do.

**Objects and methods used**: None new. This lesson combines vector literals, `get`, and `cons`/`first`/`rest`, each already covered.

---

## Concept Unit: Extending the Two-Stack Trick Symmetrically

### The Problem

Lesson 87's queue used one stack for the front, one for the back, refilling one *from* the other in a single direction (back into front, as needed). Can this same idea support pushing and popping at *either* end, symmetrically?

### Introduce the concept in isolation

```clojure
(defn transfer [from-stack to-stack]
  (if (empty? from-stack)
    to-stack
    (transfer (stack-pop from-stack) (stack-push to-stack (stack-peek from-stack)))))

(defn make-deque [] [(list) (list)])
(defn deque-front-stack [d] (get d 0))
(defn deque-back-stack [d] (get d 1))

(defn ensure-front [d]
  (if (empty? (deque-front-stack d))
    [(transfer (deque-back-stack d) (list)) (list)]
    d))

(defn ensure-back [d]
  (if (empty? (deque-back-stack d))
    [(list) (transfer (deque-front-stack d) (list))]
    d))

(defn push-front [d value] [(stack-push (deque-front-stack d) value) (deque-back-stack d)])
(defn push-back [d value] [(deque-front-stack d) (stack-push (deque-back-stack d) value)])

(defn pop-front-from-ready [ready-d] [(stack-pop (deque-front-stack ready-d)) (deque-back-stack ready-d)])
(defn pop-front [d] (pop-front-from-ready (ensure-front d)))

(defn pop-back-from-ready [ready-d] [(deque-front-stack ready-d) (stack-pop (deque-back-stack ready-d))])
(defn pop-back [d] (pop-back-from-ready (ensure-back d)))

(defn deque-peek-front [d] (stack-peek (deque-front-stack (ensure-front d))))
(defn deque-peek-back [d] (stack-peek (deque-back-stack (ensure-back d))))
```

```
user=> (def d1 (push-back (push-back (push-back (make-deque) 1) 2) 3))
user=> (deque-peek-front d1)
1
user=> (deque-peek-back d1)
3
user=> (def d2 (push-front d1 0))
user=> (deque-peek-front d2)
0
user=> (deque-peek-back d2)
3
```

`push-back`ing `1, 2, 3` produces the sequence `[1 2 3]`, front to back — `1` is the front (oldest), `3` the back (newest), exactly Lesson 87's queue semantics. `push-front`ing `0` onto that adds a *new* front, without disturbing the back at all: the sequence is now `[0 1 2 3]`.

### Discard the throwaway example

Not applicable — every function here is real, verified, and reused throughout the rest of this lesson.

### Project Change

- **Reference Source**: `transfer` renames Lesson 87's `refill-out` for its now-symmetric role; `ensure-front`/`ensure-back` generalize Lesson 87's `ensure-out` in both directions.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn ensure-front [d]
  (if (empty? (deque-front-stack d))
    [(transfer (deque-back-stack d) (list)) (list)]
    d))

(defn ensure-back [d]
  (if (empty? (deque-back-stack d))
    [(list) (transfer (deque-front-stack d) (list))]
    d))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`transfer`** — reappearing, renamed `refill-out` (Lesson 87): moves every element from one stack to another, reversing their order — used in *either* direction here, unlike Lesson 87's single-direction `refill-out`.
- **`ensure-front`** — mirrors Lesson 87's `ensure-out` exactly: if `front-stack` is empty, rebuild it by transferring (and reversing) everything currently on `back-stack`.
- **`ensure-back`** — the symmetric counterpart, never needed in Lesson 87 (which only ever popped from the front), now required because a deque must support popping from *either* end.
- **`push-front`/`push-back`** — each touches only its own stack directly, `O(1)`, identical to Lesson 86's `stack-push`.
- **`pop-front`/`pop-back`** — reappearing "ensure, then use the ready result once" pattern (Lesson 87's own `dequeue`/`dequeue-from-ready` shape), now applied in both directions.

### CS Lens

A **deque** genuinely subsumes both earlier structures: using only `push-back` and `pop-front` reproduces Lesson 87's queue exactly; using only `push-front` and `pop-front` (or only `push-back`/`pop-back`) reproduces Lesson 86's stack exactly — both special cases of the same, more general structure, not separate implementations.

### SE Lens

The amortized argument from Lesson 53 and Lesson 87 extends here without needing to be re-derived from scratch: each element still only ever gets "transferred" between the two stacks a bounded number of times over its lifetime, regardless of which end operations touch it, so `push-front`, `push-back`, `pop-front`, and `pop-back` are all amortized `O(1)`.

---

## Concept Unit: A Genuine Subtlety — Peeking and Immutability

### The Problem

`pop-front` and `pop-back` both correctly *return* the refilled deque state, so a refill's cost is never paid twice for the same elements. Does `deque-peek-front` have the same guarantee?

### Introduce the concept in isolation

Look again at `deque-peek-front`:

```clojure
(defn deque-peek-front [d] (stack-peek (deque-front-stack (ensure-front d))))
```

`ensure-front d` computes a *new*, possibly-refilled deque — but `deque-peek-front` only extracts a value from it and returns that value, discarding the refilled structure entirely. Since every value in this series has been immutable since Lesson 3, calling `(deque-peek-front d)` a second time, on the *same*, still-unrefilled `d`, pays the full `O(n)` transfer cost *again* — the refill from the first call was never actually kept.

### Discard the throwaway example

Not applicable — this is a genuine, real behavior of the code as written, not a contrived example.

### CS Lens

This is precisely why `pop-front` was written to *return* the refilled state (as the new deque), while `deque-peek-front` was written to only return a value: a function that discards useful work it already did — here, the refill — forces that work to be repeated by whoever calls it again, a real, avoidable cost hiding behind a seemingly harmless "just look, don't change anything" operation.

### SE Lens

A fully correct fix would have `deque-peek-front` return *both* the value and the possibly-refilled deque (an `[value new-deque]` pair, the same style `pop-front-from-ready` already uses for its own two-part result), so a caller who peeks repeatedly on an empty-front deque never pays for more than one refill — left as this lesson's Exercise 4, a genuine, worthwhile fix rather than a merely theoretical concern.

### Connection to the previous unit

The previous unit built a complete, working deque, symmetric in both directions; this unit looks closely at one specific function within it and finds a real, honest gap between "correct" (every peek returns the right value) and "efficient" (no work is wastefully repeated) — a distinction worth noticing rather than assuming away.

---

## Connect the Pieces

The complete deque, both ends exercised together:

```clojure
(println "push-back 1 2 3, front:" (deque-peek-front d1) "back:" (deque-peek-back d1))
(println "push-front 0, front:" (deque-peek-front d2) "back:" (deque-peek-back d2))
(def d3 (pop-back d2))
(println "after pop-back, back:" (deque-peek-back d3))
(def d4 (pop-front d3))
(println "after pop-front, front:" (deque-peek-front d4))
```

```
push-back 1 2 3, front: 1 back: 3
push-front 0, front: 0 back: 3
after pop-back, back: 2
after pop-front, front: 1
```

Starting from `[0 1 2 3]` (front to back), popping the back removes `3`, leaving `[0 1 2]`; popping the front then removes `0`, leaving `[1 2]` — `pop-front` on `d4` correctly reports `1` as the new front, confirming both ends operate independently and correctly, exactly as Concept Unit 1 predicted.

## What Breaks Without This

Suppose a program needed a structure supporting both "undo" (pop from one end, stack-like) and "process oldest first" (pop from the other end, queue-like) simultaneously — a real, common need (a browser's combined back/forward history, or a work-stealing task scheduler). Without a deque, this would require awkwardly maintaining two separate structures, or repeatedly reversing a single list to reach whichever end is needed (each reversal `O(n)`, paid *every single time*, not amortized like this lesson's refills). The deque this lesson built handles both needs directly, in the same structure, at the identical amortized cost this section has established throughout.

## Exercises

1. **Trace.** By hand, trace `(push-front (push-back (push-back (make-deque) 1) 2) 0)`, confirming the resulting front-to-back sequence is `[0 1 2]`.
2. **Predict.** Before checking, predict what `(deque-peek-back (make-deque))` — peeking the back of a genuinely empty deque — actually does. Run it and explain the real result.
3. **Verify.** Push `3` values onto the back, pop `1` from the front, push `1` more onto the front, then pop everything from the back, confirming the final order matches what the operations predict.
4. **Break it, on purpose (and then fix it).** Implement the corrected `deque-peek-front` this lesson's second unit described — returning an `[value new-deque]` pair — and confirm that peeking twice in a row on a refilled deque only pays the transfer cost once.
5. **Generalize.** Using only `push-back` and `pop-front`, confirm this deque reproduces Lesson 87's queue behavior exactly, on the same sequence of operations Lesson 87 used.
6. **Reconstruct.** Close this lesson. From memory, explain how a deque generalizes both a stack and a queue, and explain the peek-versus-pop immutability subtlety this lesson surfaced.

## Definition of Done

- [ ] You can implement push and pop at both ends of a deque using two stacks.
- [ ] You completed Exercise 3 and confirmed correct ordering across a mixed sequence of operations.
- [ ] You completed Exercise 4 and implemented a peek function that doesn't discard its own refill work.
- [ ] You completed Exercise 5 and confirmed the deque reproduces queue behavior as a special case.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you fixed and confirmed — for example, `"Fix deque-peek-front to return refilled state; confirm deque reproduces Lesson 87 queue behavior exactly"` — not just `"lesson 88 exercise"`.

---

**Next lesson:** Lesson 89, *Hash Tables*, builds a structure that trades this section's careful, ordered access for something new — near-constant-time lookup by an arbitrary key, not just by position — deriving hashing and collision-handling from first principles.
