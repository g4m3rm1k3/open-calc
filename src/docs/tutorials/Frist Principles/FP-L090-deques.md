# Lesson 90: Deques

**What you will build:** a real **deque** (double-ended queue) — `push-front!`, `push-back!`, `pop-front!`, `pop-back!`, all four genuinely independent, all four real, measured `O(1)` — built by giving Lesson 87's doubly linked node structure a mutable container tracking both its current head and its current tail. Real, verified evidence this session: on a `1,000,000`-element deque, all four operations measure `0.0`–`0.001` ms, regardless of which end is touched. The transferable point: Lesson 88's stack made one end cheap; Lesson 89's queue made one end cheap for adding and the *other* cheap for removing, using a clever trick specific to that one FIFO pairing. Neither generalizes to "push and pop *either* end, in any combination, whenever needed" — this lesson derives the representation that actually does, and shows both Lesson 88 and Lesson 89's ADTs fall out of it as special cases.

**What you need to know first:** Lesson 87 (`FP-L087-linked-structures.md`) — specifically the doubly linked node (`make-node`, `node-next`, `node-prev`, and mutation via `set-car!`/`set-cdr!`), extended directly here. Lesson 88 (`FP-L088-stacks.md`) and Lesson 89 (`FP-L089-queues.md`) — specifically their two ADTs, both shown here to be special cases of this lesson's more general one.

**Terms introduced in this lesson**

- **Deque** (double-ended queue) — an abstract data type supporting `push` and `pop` at *both* ends, independently, each guaranteed `O(1)`: `push-front`, `pop-front`, `push-back`, `pop-back`. It exists to unify Lesson 88's stack (which only ever needed one end) and Lesson 89's queue (which needed one end for adding and the other for removing, in one fixed pairing) into a single structure supporting every combination of end and direction at once.

---

## Concept Unit 1: Neither Stack Nor Queue Generalizes

### The Problem

Lesson 88's stack made one end cheap because it only ever needed one end. Lesson 89's queue made both ends *usable*, but only in one fixed pairing — add at one specific end, remove from the other — using a mechanism (two stacks, amortized by moving each element once) built specifically for that pairing. Neither structure supports, say, pushing onto the front *and* the back *and* popping from either, all on the identical structure, as needed. It's worth asking whether a single representation could support all four operations independently.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using Lesson 88 and 89's own structures as the thing being generalized beyond.

### Applying It — Why the Two-Stack Trick Doesn't Generalize

Lesson 89's two-stack queue works because it only ever needs `in`'s cheap end (front, for pushing) and, after a one-time reversal, `out`'s cheap end (front, for popping) — never `in`'s *other* end or `out`'s *other* end. A genuine deque would need `push-back` to be cheap on whichever list currently represents "the back," at any moment, regardless of how many pops from either end came before — a guarantee the two-stack structure's asymmetric `in`/`out` roles were never built to offer.

### Walkthrough

- **The precise reason the two-stack trick doesn't generalize** — it depends on a fixed division of labor between `in` and `out`, incompatible with symmetric, order-independent access to both ends.
- **"a single representation could support all four operations independently"** — states, precisely, what Concept Unit 2 and 3 need to deliver.

### CS Lens

This is a genuine generalization, not just "a bigger stack" or "a fancier queue": a data structure whose guarantee (cheap at both ends, always, regardless of history) is strictly stronger than either of the two structures it subsumes. Also recognized in: a two-door subway car, boardable and exitable from either end at any stop, generalizing a one-door car (usable from only one side) and a car with a dedicated "boarding-only" door and a separate "exit-only" door (usable at both ends, but only in one fixed direction each).

### SE Lens

The alternative to deriving a genuine deque is to keep reaching for a stack or a queue and awkwardly working around whichever one doesn't quite fit — for instance, combining two queues, or two stacks used inconsistently, to fake both-ends access. The real cost of that alternative is exactly the kind of ad hoc, unverified complexity this curriculum has avoided since Lesson 3's Concept Isolation Rule — deriving the real structure once, correctly, is what Concept Unit 3 does instead.

---

## Concept Unit 2: Defining the Deque ADT

### The Problem

Concept Unit 1's goal needs a precise ADT — four operations this time, not two — and an explicit statement of how Lesson 88 and 89's ADTs sit inside it.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — The Deque ADT, and Its Two Special Cases

- **`push-front(d, x)`** / **`push-back(d, x)`** — *requires:* nothing. *guarantees:* returns a new deque with `x` added at the named end, every other element unchanged and in the identical relative order.
- **`pop-front(d)`** / **`pop-back(d)`** — *requires:* `d` is non-empty. *guarantees:* returns a deque with the element at the named end removed.
- **`empty?(d)`** — *requires:* nothing. *guarantees:* returns true exactly when `d` contains no elements.

**Recovering Lesson 88's Stack:** using only `push-front` and `pop-front` (ignoring the back entirely) is exactly a stack — LIFO at the front.

**Recovering Lesson 89's Queue:** using only `push-back` and `pop-front` is exactly a queue — FIFO, oldest-first removal.

### Walkthrough

- **Four contracts instead of two** — the genuinely larger interface this lesson's structure needs to satisfy, compared to either of its special cases.
- **The explicit recovery of both prior ADTs** — turns "generalizes stack and queue" from a claim into a checkable fact: naming exactly which two operations, used exclusively, reproduce each one.

### CS Lens

This is a textbook example of a more general abstraction subsuming two more specific ones, each recoverable by restricting which operations are actually used — the deque doesn't need a separate implementation for "acting like a stack" or "acting like a queue," those behaviors emerge automatically from which subset of its four operations a caller happens to use. Also recognized in: a multi-tool's pliers function and its screwdriver function both being fully available from the identical device, rather than needing two separate, specialized tools.

### SE Lens

The alternative to defining all four operations together is to keep Lesson 88 and 89's ADTs as entirely separate interfaces, each with its own implementation, even when a single, more general structure could serve both needs. The real cost of that alternative is duplicated implementation effort for behaviors that, as Concept Unit 2 shows, are really just restricted uses of one general capability.

---

## Concept Unit 3: Building a Real Deque

### The Problem

Concept Unit 2's four operations need a real representation — Lesson 87's doubly linked node, extended with a container that tracks *both* the current head and the current tail, since both can now change from either end.

### The New Code — Type It Yourself

```scheme
(define (push-front! dq x)
  (let ((n (make-node x)))
    (if (deque-empty? dq)
        (begin (set-deque-head! dq n) (set-deque-tail! dq n))
        (begin (set-node-next! n (deque-head dq))
               (set-node-prev! (deque-head dq) n)
               (set-deque-head! dq n)))))
```

### The Updated Project

This is `deque-check.scm`, in full:

```scheme
(define (make-node value) (cons value (cons '() '())))
(define (node-value n) (car n))
(define (node-next n) (cadr n))
(define (node-prev n) (cddr n))
(define (set-node-next! n next) (set-car! (cdr n) next))
(define (set-node-prev! n prev) (set-cdr! (cdr n) prev))

(define (make-deque) (cons '() '()))
(define (deque-head dq) (car dq))
(define (deque-tail dq) (cdr dq))
(define (set-deque-head! dq h) (set-car! dq h))
(define (set-deque-tail! dq t) (set-cdr! dq t))
(define (deque-empty? dq) (null? (deque-head dq)))

(define (push-front! dq x)                                     ; ← new
  (let ((n (make-node x)))                                        ; ← new
    (if (deque-empty? dq)                                           ; ← new
        (begin (set-deque-head! dq n) (set-deque-tail! dq n))         ; ← new
        (begin (set-node-next! n (deque-head dq))                       ; ← new
               (set-node-prev! (deque-head dq) n)                         ; ← new
               (set-deque-head! dq n)))))                                   ; ← new

(define (push-back! dq x)                                                     ; ← new
  (let ((n (make-node x)))                                                      ; ← new
    (if (deque-empty? dq)                                                         ; ← new
        (begin (set-deque-head! dq n) (set-deque-tail! dq n))                       ; ← new
        (begin (set-node-prev! n (deque-tail dq))                                     ; ← new
               (set-node-next! (deque-tail dq) n)                                       ; ← new
               (set-deque-tail! dq n)))))                                                 ; ← new

(define (pop-front! dq)                                                                     ; ← new
  (let* ((n (deque-head dq)) (val (node-value n)) (next (node-next n)))                        ; ← new
    (if (null? next)                                                                             ; ← new
        (begin (set-deque-head! dq '()) (set-deque-tail! dq '()))                                  ; ← new
        (begin (set-node-prev! next '()) (set-deque-head! dq next)))                                 ; ← new
    val))                                                                                               ; ← new

(define (pop-back! dq)                                                                                    ; ← new
  (let* ((n (deque-tail dq)) (val (node-value n)) (prev (node-prev n)))                                      ; ← new
    (if (null? prev)                                                                                           ; ← new
        (begin (set-deque-head! dq '()) (set-deque-tail! dq '()))                                                ; ← new
        (begin (set-node-next! prev '()) (set-deque-tail! dq prev)))                                               ; ← new
    val))                                                                                                             ; ← new

(define (deque->list dq)
  (let loop ((n (deque-head dq)) (acc '()))
    (if (null? n) (reverse acc) (loop (node-next n) (cons (node-value n) acc)))))

(define dq (make-deque))
(push-back! dq 2)
(push-back! dq 3)
(push-front! dq 1)
(push-back! dq 4)
(push-front! dq 0)
(display "deque contents: ") (display (deque->list dq)) (newline)

(display "pop-front!: ") (display (pop-front! dq)) (newline)
(display "pop-back!: ") (display (pop-back! dq)) (newline)
(display "deque contents now: ") (display (deque->list dq)) (newline)
```

The deque itself is a mutable `(head . tail)` pair — a second, outer layer of mutation on top of Lesson 87's already-mutable nodes, needed because *which* node currently counts as the head or tail changes as elements are pushed and popped from either side.

### Reference Source

Lesson 87's node structure (`FP-L087-linked-structures.md`, Concept Unit 3), reused unchanged; the `(head . tail)` container and all four push/pop operations are new, extending it with independent both-ends access.

### Files affected

Created: `deque-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile deque-check.scm
deque contents: (0 1 2 3 4)
pop-front!: 0
pop-back!: 4
deque contents now: (1 2 3)
```

Verified this session — pushing `2`, `3` at the back, `1` at the front, `4` at the back, then `0` at the front produces `(0 1 2 3 4)`, exactly the order each push should have produced; popping the front returns `0` (correct), popping the back returns `4` (correct), leaving `(1 2 3)` — real, checked confirmation that mixed, both-ends operations maintain a single, correctly ordered sequence throughout.

### Mechanical Walkthrough

- **`(cons '() '())`** in `make-deque` — a reappearance of `cons`; the container starts with no head and no tail, both empty.
- **`(set-node-next! n (deque-head dq))` / `(set-node-prev! (deque-head dq) n)`** in `push-front!` — a reappearance of Lesson 87's mutators; wires the new node in front of the current head, in both directions, before the container's own head reference is updated.
- **`(set-deque-head! dq n)`** — a reappearance of `set-car!` (via `set-deque-head!`); the deque's own notion of "the front" changes to the newly pushed node.
- **`(if (null? next) (begin (set-deque-head! dq '()) (set-deque-tail! dq '())) ...)`** in `pop-front!` — a reappearance of `if`, `null?`; handles the edge case where removing the only remaining node must empty *both* head and tail, not just head.
- **The real, correctly-ordered output across mixed pushes and pops** — direct, checked confirmation the container's head/tail bookkeeping stays correct through both-ends activity, not just single-ended use.

### CS Lens

This is Lesson 87's mutation and aliasing lesson applied at a second level: not just nodes referencing each other, but a container whose own notion of "current head" and "current tail" must be kept correctly in sync with the nodes themselves, entirely through mutation — no part of this structure could be built with only fresh, unchangeable `cons` cells. Also recognized in: a train's front and rear indicator being updated by an operator whenever cars are added or removed at either end, so any two people boarding at either end can reliably ask "which end is the front" without seeing the train's original locomotive.

### SE Lens

The alternative to tracking both a head and a tail reference explicitly is to track only the head, the way Lesson 87's original doubly linked list did, and find the tail by walking from the head every time it's needed. The real cost of that alternative is reintroducing exactly the `O(n)` cost Lesson 87 built the whole structure to avoid — tracking both ends explicitly, as this unit's container does, is what keeps every one of the four operations genuinely `O(1)`.

---

## Concept Unit 4: Confirming O(1) at Every End, at Real Scale

### The Problem

Concept Unit 3 confirmed correctness on a small, five-element deque. It's worth confirming, directly, that all four operations really do stay `O(1)` regardless of size — the claim this lesson's entire design exists to deliver.

### The New Code — Type It Yourself

```scheme
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label) (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms") (newline))))
```

### The Updated Project

This is `deque-timing.scm`, extending Concept Unit 3's file with:

```scheme
(define (time-it label thunk)                                  ; ← new
  (let ((start (get-internal-real-time)))                          ; ← new
    (thunk)                                                          ; ← new
    (let ((end (get-internal-real-time)))                              ; ← new
      (display label) (display ": ")                                    ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                   ; ← new
                                   internal-time-units-per-second)))          ; ← new
      (display " ms") (newline))))                                             ; ← new

(define big (make-deque))
(let loop ((i 0)) (if (< i 1000000) (begin (push-back! big i) (loop (+ i 1)))))

(time-it "push-front on 1M-deque" (lambda () (push-front! big -1)))
(time-it "push-back on 1M-deque" (lambda () (push-back! big -2)))
(time-it "pop-front on 1M-deque" (lambda () (pop-front! big)))
(time-it "pop-back on 1M-deque" (lambda () (pop-back! big)))
```

### Reference Source

No reference counterpart — reuses Lesson 83's own `time-it` timing helper, applied here to all four of this lesson's new operations at once.

### Files affected

Created: `deque-timing.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile deque-timing.scm
push-front on 1M-deque: 0.001 ms
push-back on 1M-deque: 0.001 ms
pop-front on 1M-deque: 0.0 ms
pop-back on 1M-deque: 0.0 ms
```

Verified this session (Lesson 83's own honest note on timing variance applies identically here — real values stayed in this same sub-millisecond range across repeated runs) — all four operations, on a `1,000,000`-element deque, measure effectively identical, flat cost. None of the four depends on the deque's size, and none depends on which end is touched — the complete, both-ends-and-both-directions `O(1)` guarantee Concept Unit 1 sought.

### Mechanical Walkthrough

- **`(let loop ((i 0)) (if (< i 1000000) (begin (push-back! big i) (loop (+ i 1)))))`** — a reappearance of the named-`let` looping idiom; builds a genuinely large, `1,000,000`-element deque before any timing measurement begins.
- **The real, flat timing across all four operations** — direct, measured confirmation of Concept Unit 3's structural claim: tracking both head and tail explicitly, and mutating exactly the nodes adjacent to whichever end is touched, means no operation ever depends on the other `999,999` elements sitting untouched in the middle.

### CS Lens

This is the complete payoff of this lesson's design: four operations, each genuinely `O(1)`, independent of both the deque's size and which end and direction are used — a strictly stronger, real, measured guarantee than either Lesson 88's one-ended stack or Lesson 89's fixed-pairing queue could offer alone. Also recognized in: a well-designed two-way street with dedicated lanes and turn signals at both ends, where entering or exiting at either end takes the identical, fixed amount of time regardless of how much traffic currently occupies the middle of the street.

### SE Lens

The alternative to measuring all four operations is to measure only one or two and assume symmetry. The real cost of that alternative is exactly the kind of incomplete verification Lesson 79 warned against for `merge-sort`'s worst case — a structure's design might *look* symmetric while a subtle bug (an incorrectly updated tail reference on `pop-front!`, for instance) makes one specific operation quietly `O(n)` in some edge case never tested. Measuring all four independently, as this unit does, is what confirms the *actual* guarantee, not the intended one.

---

## Closing

### Connect the pieces

One generalization, four operations, one representation, confirmed at real scale:

1. **The gap, named (Unit 1):** neither Lesson 88's stack nor Lesson 89's queue supports independent, both-ends access.
2. **The ADT, defined (Unit 2):** four operations, with Lesson 88 and 89's own ADTs shown to be specific, restricted uses of this one.
3. **A real structure, built (Unit 3):** Lesson 87's doubly linked nodes, wrapped in a mutable head/tail-tracking container.
4. **Real `O(1)` at every end, confirmed (Unit 4):** all four operations, flat cost, on a `1,000,000`-element deque.

Every claim in this lesson traces to real, checked code: correctness confirmed through mixed, both-ends operations, and cost confirmed through direct, real timing of all four operations independently — completing Era IV's linked-structure arc (Lesson 87's mutation, Lesson 88's one end, Lesson 89's fixed pairing, this lesson's full generality) with a structure that subsumes everything built since Lesson 87.

### What breaks without this

Suppose a real system needed to support both "undo" (removing the most recent action, a stack-shaped need) and "process oldest pending item first" (a queue-shaped need) against the *identical* underlying collection of pending items — a genuinely common real pattern (a task scheduler that both processes tasks in arrival order and allows cancelling the most recently added one). Built on only a stack or only a queue, one of those two needs would require an expensive workaround or a second, separately-maintained structure kept in sync by hand. This lesson's deque supports both needs directly, on one structure, because both are simply restricted uses of the identical four operations.

### Exercises

1. **Observe.** Before checking, predict whether this lesson's deque could be used to implement Lesson 89's two-stack queue's *identical* amortized-cost guarantee using only `push-back!` and `pop-front!`, or whether it does even better.
2. **Formalize.** Confirm your Exercise 1 prediction by measuring real cost using only `push-back!`/`pop-front!` across a sequence of `10,000` operations, comparing against Lesson 89's own real numbers.
3. **Formalize.** Implement `deque-peek-front`/`deque-peek-back`, reading without removing, and verify both against `deque->list`'s first and last elements across several real test cases.
4. **Explain.** In your own words, explain why `pop-front!`'s edge case (`(if (null? next) ...)`, emptying both head and tail) is necessary specifically when the deque has exactly one element, using the real structure of a one-node deque to justify your answer.
5. **Explain.** Using this lesson's real, measured evidence, explain why a deque, despite being strictly more general than a stack or a queue, doesn't make either of those two simpler ADTs (Lessons 88 and 89) unnecessary to define separately — referencing Lesson 84's own reasons for naming a precise, minimal interface.

### Definition of done

- [ ] You can state the Deque ADT's four operations and show which two, used exclusively, recover Lesson 88's stack and Lesson 89's queue respectively.
- [ ] You can explain why the two-stack queue technique doesn't generalize to arbitrary both-ends access.
- [ ] You can explain why the deque's container needs to track both a head and a tail reference explicitly, rather than deriving one from the other by walking.
- [ ] You verified all four operations' real, flat cost at a scale of at least `100,000` elements.
- [ ] You completed Exercises 1–5, including a real measurement comparing this lesson's deque to Lesson 89's queue on an equivalent operation sequence.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating which operations you measured or implemented and their real results.
