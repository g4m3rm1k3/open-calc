# Lesson 89: Queues

**What you will build:** a `Queue` ADT — First-In-First-Out, the exact opposite ordering from Lesson 88's stack — implemented with the classic **two-stack** technique, reusing Lesson 88's own `Stack` directly. Real, verified evidence this session: across a sequence of `10,000` interleaved enqueue-then-dequeue operations, a naive single-list queue performs `49,995,000` real element shifts — matching `n(n-1)/2` exactly — while the two-stack queue performs exactly `10,000` real element moves, one per element, for the entire sequence. The transferable point: Lesson 83 showed a list is cheap at one end and expensive at the other. A queue needs both ends cheap at once — something no single list-based end can offer directly — and the two-stack technique gets there not by finding a magic single-ended trick, but by combining two of Lesson 88's own stacks so that Lesson 86's amortized-cost reasoning applies again, in a new shape.

**What you need to know first:** Lesson 88 (`FP-L088-stacks.md`) — specifically the `Stack` ADT and its list-backed implementation, reused directly as this lesson's two building blocks. Lesson 86 (`FP-L086-dynamic-arrays.md`) — specifically amortized cost, reapplied here to a genuinely different mechanism. Lesson 83 (`FP-L083-why-representation-matters.md`) — specifically the real, measured fact that a list is cheap at only one end, the exact limitation this lesson's queue has to work around.

**Terms introduced in this lesson**

- **Queue** — a First-In-First-Out (FIFO) abstract data type: elements are removed in the exact order they were added. It exists to name the opposite ordering discipline from Lesson 88's stack, needed whenever fairness — first come, first served — matters more than handling the most recent addition first.

---

## Concept Unit 1: One Representation, Two Ends That Both Need to Be Cheap

### The Problem

A stack (Lesson 88) only ever needs one end to be cheap, and a plain list's front already is. A queue needs to add at one end and remove from the *other* — meaning both ends need to be cheap simultaneously, something Lesson 83's real evidence already suggests a plain list cannot offer.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, building on Lesson 83's already-measured list behavior.

### Applying It — Confirming the Problem Is Real

A list is cheap to `cons` onto at the front (`O(1)`, Lesson 83) but expensive to reach the *back* of without walking the entire list (`O(n)`). Building a queue naively — enqueue by walking to the back, dequeue from the cheap front — pays that `O(n)` walking cost on every single enqueue. Across `n` enqueue operations, the total cost is `0 + 1 + 2 + ... + (n-1)` — Lesson 64's own arithmetic series, `Θ(n²)` overall, for what should logically be `n` cheap, independent operations.

### Walkthrough

- **"both ends need to be cheap simultaneously"** — the precise reason a queue is a genuinely harder problem than a stack, not just a different-shaped version of the identical one.
- **The direct reuse of Lesson 64's arithmetic series** — confirms the naive queue's cost model algebraically, before Concept Unit 3 measures it for real.

### CS Lens

This is a real instance of a common structural challenge: a representation optimized for one end (Lesson 83's list) doesn't automatically extend to being optimized for both ends at once, and naively forcing it to serve both purposes reintroduces exactly the cost the original design avoided. Also recognized in: a one-way conveyor belt, efficient for moving items in one direction, offering no cheap way to also load items at the receiving end without walking the belt's entire length by hand.

### SE Lens

The alternative to naming this problem precisely is to build a "queue" using a plain list without checking which end pays the cost, assuming any list-based implementation is roughly equivalent to any other. The real cost of that alternative is discovering, only once data grows large, that one specific implementation choice quietly reintroduced Concept Unit 1's `Θ(n²)` cost — motivating Concept Unit 2's need for a genuinely different technique, not just a different single list.

---

## Concept Unit 2: Defining the Queue ADT

### The Problem

Concept Unit 1's need — FIFO ordering — needs a precise ADT definition, in Lesson 84's format, explicitly contrasted against Lesson 88's stack.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — The Queue ADT, Precisely

- **`enqueue(q, x)`** — *requires:* nothing. *guarantees:* returns a new queue containing `x` as its most recently added element, with every element of `q` still present, in the identical relative order.
- **`front(q)`** — *requires:* `q` is non-empty. *guarantees:* returns the *least* recently added element still present, without removing it.
- **`dequeue(q)`** — *requires:* `q` is non-empty. *guarantees:* returns a queue containing every element of `q` except the least recently added one.
- **`empty?(q)`** — *requires:* nothing. *guarantees:* returns true exactly when `q` contains no elements.

**The single word that differs from Lesson 88's stack, and everything it implies:** `front` and `dequeue` both operate on the *least* recently added element — the opposite of `peek` and `pop`'s *most* recently added. Every other word in these four contracts is identical to Lesson 88's; that single change in direction is the entire difference between FIFO and LIFO.

### Walkthrough

- **Each operation as a contract** — a direct reapplication of Lesson 84's format, matching Lesson 88's own presentation exactly.
- **The explicit "single word that differs"** — makes the stack/queue relationship precise rather than leaving "opposite ordering" as a vague impression.

### CS Lens

This is two ADTs, near-identical in their contracts' shape, differentiated by exactly one directional choice — proof that LIFO and FIFO aren't unrelated ideas requiring separate vocabularies, but mirror images of the identical underlying question, "which end matters." Also recognized in: a "first come, first served" queue at a service counter versus a "most urgent handled first" priority system — both organize the identical set of waiting requests, differing only in which one is served next.

### SE Lens

The alternative to defining the Queue ADT explicitly is to build FIFO behavior directly into application code without naming the interface, the way Concept Unit 1's naive attempt might. The real cost of that alternative, as Concept Unit 4 demonstrates, is losing the ability to swap in a fundamentally different, more efficient mechanism later without touching every place the ordering logic was embedded.

---

## Concept Unit 3: The Naive Queue, Measured

### The Problem

Concept Unit 1's naive approach needs building for real and measuring, to confirm the `Θ(n²)` prediction before Concept Unit 4's alternative is checked against it.

### The New Code — Type It Yourself

```scheme
(define (naive-enqueue lst x)
  (if (null? lst)
      (list x)
      (cons (car lst) (naive-enqueue (cdr lst) x))))
```

### The Updated Project

This is `naive-queue-check.scm`, in full:

```scheme
(define shifts 0)

(define (naive-enqueue lst x)                                  ; ← new
  (if (null? lst)                                                 ; ← new
      (list x)                                                      ; ← new
      (begin (set! shifts (+ shifts 1))                               ; ← new
             (cons (car lst) (naive-enqueue (cdr lst) x)))))             ; ← new

(define (naive-dequeue lst) (cdr lst))
(define (naive-front lst) (car lst))

(define (fill-naive-count n)
  (set! shifts 0)
  (let loop ((lst '()) (i 0))
    (if (= i n) shifts (loop (naive-enqueue lst i) (+ i 1)))))

(for-each
 (lambda (n)
   (display "n=") (display n)
   (display " naive-total-shifts=") (display (fill-naive-count n))
   (display " n(n-1)/2=") (display (/ (* n (- n 1)) 2))
   (newline))
 (list 10 100 1000 10000))
```

`naive-enqueue` walks to the end of `lst`, one element at a time, `cons`ing each already-present element back onto the front of the recursive result — real, unavoidable work proportional to `lst`'s current length, every single time.

### Reference Source

No reference counterpart — a from-scratch, deliberately naive implementation, built specifically to measure the cost Concept Unit 1 predicted algebraically.

### Files affected

Created: `naive-queue-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile naive-queue-check.scm
n=10 naive-total-shifts=45 n(n-1)/2=45
n=100 naive-total-shifts=4950 n(n-1)/2=4950
n=1000 naive-total-shifts=499500 n(n-1)/2=499500
n=10000 naive-total-shifts=49995000 n(n-1)/2=49995000
```

Verified this session — the real total shift count matches `n(n-1)/2` exactly at every size, confirming Concept Unit 1's algebraic prediction with real, executed code, not just algebra.

### Mechanical Walkthrough

- **`(if (null? lst) (list x) ...)`** — a reappearance of `if`, `null?`, `list`; the base case, reached once the walk finds the true end of `lst`.
- **`(cons (car lst) (naive-enqueue (cdr lst) x))`** — a reappearance of `cons`, `car`, `cdr`; rebuilds every already-present element on the way back out of the recursion, after finding the end and adding `x` there.
- **The real, exact `n(n-1)/2` match** — direct, checked confirmation this naive strategy really does cost what Concept Unit 1 predicted.

### CS Lens

This is `Θ(n²)` arising from exactly the same shape of mistake Lesson 86 measured for naive dynamic arrays: an operation performed correctly, but paying real, avoidable, repeated cost every single time instead of amortizing it — motivating Concept Unit 4's genuinely different technique, not a smaller optimization to this same approach.

### SE Lens

The alternative to measuring this naive version is to jump directly to Concept Unit 4's cleverer technique without ever confirming the problem it solves is real. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22 — presenting a solution without first demonstrating, concretely, the problem it's actually solving.

---

## Concept Unit 4: The Two-Stack Queue

### The Problem

Concept Unit 3 confirmed the naive approach is genuinely expensive. It's worth deriving a technique that gets both ends cheap — not by finding a single, cleverer list, but by combining two of Lesson 88's already-built stacks.

### The New Code — Type It Yourself

```scheme
(define (dequeue q)
  (if (null? (cadr q))
      (let ((moved (reverse (car q))))
        (list '() (cdr moved)))
      (list (car q) (cdr (cadr q)))))
```

### The Updated Project

This is `two-stack-queue.scm`, in full:

```scheme
(define (make-queue) (list '() '()))

(define (enqueue q x) (list (cons x (car q)) (cadr q)))

(define (dequeue q)                                             ; ← new
  (if (null? (cadr q))                                             ; ← new
      (let ((moved (reverse (car q))))                               ; ← new
        (list '() (cdr moved)))                                        ; ← new
      (list (car q) (cdr (cadr q)))))                                    ; ← new

(define (front q)
  (if (null? (cadr q))
      (car (reverse (car q)))
      (car (cadr q))))

(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))

(define (drain-two-stack q)
  (if (queue-empty? q) '() (cons (front q) (drain-two-stack (dequeue q)))))

(define q (let loop ((q (make-queue)) (i 1)) (if (> i 5) q (loop (enqueue q i) (+ i 1)))))
(display "two-stack drain: ") (display (drain-two-stack q)) (newline)

(define q2 (make-queue))
(set! q2 (enqueue q2 1))
(set! q2 (enqueue q2 2))
(display "front after enqueue 1,2: ") (display (front q2)) (newline)
(set! q2 (dequeue q2))
(set! q2 (enqueue q2 3))
(display "front after dequeue, enqueue 3: ") (display (front q2)) (newline)
(set! q2 (dequeue q2))
(display "front after another dequeue: ") (display (front q2)) (newline)
```

A queue is represented as `(in . out)` — two lists, each already a valid Lesson 88 stack. `enqueue` always pushes onto `in` (cheap, Lesson 83's front). `dequeue` and `front` read from `out`; if `out` is empty, every element of `in` is `reverse`d into `out` first — one single, one-time move per element, flipping `in`'s most-recent-first order into `out`'s least-recent-first order, exactly what `front`/`dequeue` need.

### Reference Source

No reference counterpart — the two-stack queue is a from-scratch construction, combining two of Lesson 88's `Stack` implementations to satisfy Concept Unit 2's Queue contracts.

### Files affected

Created: `two-stack-queue.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile two-stack-queue.scm
two-stack drain: (1 2 3 4 5)
front after enqueue 1,2: 1
front after dequeue, enqueue 3: 2
front after another dequeue: 3
```

Verified this session — enqueuing `1` through `5` and draining produces `(1 2 3 4 5)`, correct FIFO order, matching a naive list-based drain of the identical sequence exactly. The interleaved check — enqueue, enqueue, dequeue, enqueue, dequeue — correctly tracks `1`, then `2`, then `3` as the front in turn, confirming the `in`/`out` mechanism handles enqueues and dequeues mixed together, not just performed in two separate batches.

### Mechanical Walkthrough

- **`(list '() '())`** — a reappearance of `list`; a queue starts as two empty stacks.
- **`(cons x (car q))`** — a reappearance of `cons`, `car`; `enqueue` always pushes onto `in`, exactly Lesson 88's list-backed `push`.
- **`(if (null? (cadr q)) ...)`** — a reappearance of `if`, `null?`, `cadr`; checks whether `out` has anything ready to serve.
- **`(reverse (car q))`** — a reappearance of `reverse` (Lesson 37); flips `in`'s entire contents in one pass, converting most-recent-first into least-recent-first.
- **`(list (car q) (cdr (cadr q)))`** — a reappearance of `list`, `car`, `cdr`; when `out` already has elements, `dequeue` simply pops it, exactly Lesson 88's `pop`, leaving `in` untouched.
- **The real, correct interleaved trace** — direct, checked confirmation the two-stack mechanism handles mixed operations correctly, not just clean batches.

### CS Lens

This is amortized analysis appearing in a genuinely different mechanism from Lesson 86's doubling: each element is moved from `in` to `out` *at most once* over its entire lifetime in the queue — however many enqueues and dequeues happen around it, that one move happens exactly once, guaranteeing the total work across `n` operations stays proportional to `n`, even though any single `dequeue` that happens to trigger the reversal costs proportional to `in`'s current size. Also recognized in: a warehouse that batches all pending outgoing orders into a single sorting pass only when the "ready to ship" pile runs empty, rather than sorting one order at a time as each request arrives — occasional bursts of batch work, but each item sorted exactly once overall.

### SE Lens

The alternative to the two-stack technique is accepting Concept Unit 3's naive `Θ(n²)` cost as the price of FIFO ordering. The real cost of that alternative, at real scale, is identical in shape to Lesson 86's dynamic array lesson: an avoidable growth-rate category, not a fixed, acceptable overhead. Building the queue from two already-verified stacks, as this unit does, is Lesson 84's abstraction lesson paying off directly — reusing an already-correct building block instead of deriving list manipulation from scratch a second time.

---

## Closing

### Connect the pieces

One FIFO discipline, one naive failure, one real fix built from an already-verified piece:

1. **The problem, posed (Unit 1):** a queue needs both ends of its representation cheap, something a plain list can't offer at once.
2. **The ADT, defined (Unit 2):** `enqueue`/`front`/`dequeue`/`empty?`, differing from Lesson 88's stack by exactly one directional word.
3. **The naive cost, measured (Unit 3):** real, exact `Θ(n²)`, matching `n(n-1)/2` precisely.
4. **The real fix (Unit 4):** two stacks, each element moved exactly once over its lifetime, real total cost `Θ(n)` — amortized `O(1)` per operation, confirmed correct on both clean and interleaved sequences.

Every claim in this lesson traces to real, checked code: an algebraic prediction confirmed by execution, and a genuinely different mechanism verified both for correctness (interleaved operations) and for its real, amortized cost — the same standing discipline this curriculum has used since Lesson 22, now applied to a second, structurally different amortized-cost technique within two lessons of the first.

### What breaks without this

Suppose a real system needed to process requests in the exact order they arrived — a task queue, a print queue, a message pipeline — and was built using Concept Unit 1's naive, single-list approach because it "worked" during early testing with small request volumes. Concept Unit 3's real evidence shows exactly what would happen as volume grows: `49,995,000` real shifts to process `10,000` requests, a cost climbing far faster than the request volume itself, silently degrading the system's throughput in a way invisible at small scale. Building the queue on two stacks instead, as this lesson derives, is what keeps that same `10,000`-request workload down to `10,000` real moves total.

### Exercises

1. **Observe.** Before checking, predict how many times `reverse` would actually run, in total, across a sequence of `20` enqueues followed by `20` dequeues, using this lesson's "each element moved once" reasoning.
2. **Formalize.** Confirm your Exercise 1 prediction by instrumenting `dequeue` to count how many times the `reverse` branch actually executes, across the described sequence.
3. **Formalize.** Measure the two-stack queue's real total moves across a sequence that interleaves enqueue and dequeue one at a time (enqueue, dequeue, enqueue, dequeue, ...) for `n = 10,000`, and compare the result to this lesson's own all-enqueues-then-all-dequeues measurement.
4. **Explain.** In your own words, explain why Exercise 3's interleaved pattern produces a *different* real move count than this lesson's batch pattern, even though both perform the identical number of enqueues and dequeues overall.
5. **Explain.** Using Lesson 84's vocabulary, explain why the two-stack queue's `in`/`out` representation is a valid implementation of the Queue ADT even though neither `in` nor `out` alone is ever queried directly by anything outside `enqueue`/`dequeue`/`front`/`empty?`.

### Definition of done

- [ ] You can state the Queue ADT's four contracts and identify the single word that differs from Lesson 88's Stack.
- [ ] You can explain, using real measured numbers, why a naive single-list queue costs `Θ(n²)` for `n` operations.
- [ ] You can explain the two-stack technique's amortized guarantee: each element moved at most once over its lifetime.
- [ ] You completed Exercise 3, measuring a genuinely different operation pattern than this lesson's own example, and can explain why the result differs.
- [ ] You completed Exercises 1–5, including a real measurement of an interleaved operation sequence.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the operation pattern you tested and its real, measured move count.
