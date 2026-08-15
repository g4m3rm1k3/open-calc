# Lesson 87: Queues

**What you will build**: By the end of this lesson you'll be able to derive a queue's FIFO discipline, discover that the obvious single-list implementation forces one of its two core operations to be expensive, and fix that with a genuinely clever two-stack construction whose cost, following Lesson 53's amortized analysis directly, turns out to be `O(1)` per operation after all.

**What you need to know first**: Lesson 86's stacks, Lesson 85's node structure, and Lesson 53's amortized analysis.

**Terms introduced in this lesson**:

- **queue** — a collection restricted to one access pattern: add at one end, remove from the *other*. *Why it matters*: the direct structural opposite of a stack's same-end discipline.
- **FIFO** (First-In-First-Out) — the ordering a queue enforces: the earliest-added element is always the first one removed. *Why it matters*: exactly the opposite guarantee from Lesson 86's LIFO, needed whenever fairness or arrival order matters — task scheduling, message processing, and more.

**Objects and methods used**: None new. This lesson combines `cons`, `first`, `rest`, `empty?`, vector literals, and `get` (Lesson 84), each already covered.

---

## Concept Unit: The Naive Queue and Its Cost Problem

### The Problem

A stack (Lesson 86) added and removed from the identical end, matching lists' own cheap end perfectly. A queue needs the *opposite* end for removal. Does a single list still work — and at what cost?

### Introduce the concept in isolation

```clojure
(defn enqueue-naive [q value]
  (if (empty? q)
    (list value)
    (cons (first q) (enqueue-naive (rest q) value))))

(defn dequeue-naive [q] (rest q))
```

```
user=> (enqueue-naive (enqueue-naive (enqueue-naive (list) 1) 2) 3)
(1 2 3)
```

`enqueue-naive` correctly places each new value at the *end*, preserving arrival order — `1`, then `2`, then `3` — and `dequeue-naive` correctly removes from the *front*, the earliest-arrived element, exactly FIFO's promise. But `enqueue-naive` must walk the entire existing list to find its end before attaching the new value: `O(n)`, unlike Lesson 86's stack, whose single-end discipline kept every operation at `O(1)`.

### Discard the throwaway example

Not applicable — `enqueue-naive` and `dequeue-naive` are real, if imperfect, functions, motivating the next unit's fix.

### CS Lens

This is the direct structural consequence of Lesson 85's node mechanism: reaching the *far* end of a chain of one-directional references (each node only knows the next one, never the previous one) requires walking the entire chain — there's no way around it using this representation alone.

### SE Lens

An `O(n)` `enqueue` might be perfectly acceptable for a small, rarely-used queue — but for a queue handling a continuous, high-volume stream (a real, common use case), this cost genuinely compounds, exactly the kind of representation mismatch Lesson 83 first warned about, now appearing on a structure this series just finished deriving.

---

## Concept Unit: The Two-Stack Trick — Amortized O(1)

### The Problem

Is there a way to get *both* operations back down to something closer to `O(1)`, reusing Lesson 86's stacks — which are already known to be cheap — rather than a single list?

### Introduce the concept in isolation

Maintain **two** stacks: an `in`-stack, receiving every new `enqueue`, and an `out`-stack, supplying every `dequeue`. When `out` runs dry, refill it by popping everything off `in` and pushing it onto `out` — which *reverses* the order, turning the oldest-still-present element (buried at the bottom of `in`) into the one now on *top* of `out`.

```clojure
(defn make-queue [] [(list) (list)])
(defn queue-in [q] (get q 0))
(defn queue-out [q] (get q 1))

(defn enqueue [q value]
  [(stack-push (queue-in q) value) (queue-out q)])

(defn refill-out [in-stack out-stack]
  (if (empty? in-stack)
    out-stack
    (refill-out (stack-pop in-stack) (stack-push out-stack (stack-peek in-stack)))))

(defn ensure-out [q]
  (if (empty? (queue-out q))
    [(list) (refill-out (queue-in q) (queue-out q))]
    q))

(defn queue-peek [q] (stack-peek (queue-out (ensure-out q))))

(defn dequeue-from-ready [ready-q]
  [(queue-in ready-q) (stack-pop (queue-out ready-q))])

(defn dequeue [q] (dequeue-from-ready (ensure-out q)))
```

```
user=> (def q1 (enqueue (enqueue (enqueue (make-queue) 1) 2) 3))
user=> (queue-peek q1)
1
user=> (def q2 (dequeue q1))
user=> (queue-peek q2)
2
user=> (queue-peek (dequeue q2))
3
```

Enqueued in order `1, 2, 3`; dequeued in the identical order, `1, 2, 3` — FIFO, correctly preserved through two stacks working together.

### Discard the throwaway example

Not applicable — every function here is real and reused directly in the derivation below.

### Project Change

- **Reference Source**: `stack-push`, `stack-pop`, `stack-peek`, from Lesson 86, reused directly as this lesson's two internal stacks.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn refill-out [in-stack out-stack]
  (if (empty? in-stack)
    out-stack
    (refill-out (stack-pop in-stack) (stack-push out-stack (stack-peek in-stack)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[(list) (list)]`** — reappearing vector-as-pair (Lesson 85), holding the two stacks together as one queue value.
- **`refill-out`** — reappearing counting-down-style recursion, popping `in-stack` one element at a time and pushing each one onto `out-stack` — since each `pop`-then-`push` reverses relative order, the element originally at the *bottom* of `in-stack` (the oldest, first-enqueued value) ends up on *top* of `out-stack`, exactly where `dequeue` needs it.
- **`ensure-out`** — checks whether `out` needs refilling *before* either `queue-peek` or `dequeue` touches it, computed once and passed as a single argument to a helper (`dequeue-from-ready`), the identical no-`let` pattern Lesson 56's `combine-egcd` used to avoid recomputing an expensive result twice.

### Deriving the Amortized Cost

`refill-out` costs `O(n)` when it actually runs — but each individual element is only ever moved from `in` to `out` **once** over its entire lifetime in the queue (once on `out`, it stays there until popped, never moving back). Using Lesson 53's aggregate method directly: across any sequence of `k` enqueue and dequeue operations, the *total* work spent on refilling, summed over the entire sequence, is bounded by `k` (each element contributes at most one move) — so the *average* cost per operation, `\text{total work} / k`, is `O(1)`, even though any single `dequeue` call might occasionally trigger an expensive `O(n)` refill.

### Discard the throwaway example

Not applicable — this amortized bound is a genuine, general property of the two-stack construction.

### CS Lens

This is Lesson 53's exact amortized-analysis technique, applied to a second, genuinely different data structure: the binary counter's occasional expensive carry and this queue's occasional expensive refill are structurally the same story — a rare costly operation, paid for by many preceding cheap ones, averaging out to a small constant cost overall.

### SE Lens

A queue with amortized `O(1)` operations behaves, in practice, almost identically to one with strict `O(1)` operations for any long sequence of uses — the occasional expensive refill is a real, individual cost, but not one that compounds the way `enqueue-naive`'s *guaranteed*, *every-single-time* `O(n)` cost does, a meaningfully different and better guarantee for sustained use.

### Connection to the previous unit

The previous unit found a real cost problem in the obvious representation; this unit fixes it by combining two already-trusted structures (Lesson 86's stacks) cleverly, and shows — using a technique this series already possesses (Lesson 53) — that the fix genuinely works, not merely in typical cases but in a precise, provable, amortized sense.

---

## Connect the Pieces

The complete two-stack queue, enqueue and dequeue interleaved, confirming FIFO end to end:

```clojure
(def q (enqueue (enqueue (enqueue (make-queue) 1) 2) 3))
(println "Peek:" (queue-peek q))
(def q (dequeue q))
(println "Peek after 1 dequeue:" (queue-peek q))
(def q (enqueue q 4))
(println "Peek after enqueueing 4:" (queue-peek q))
```

```
Peek: 1
Peek after 1 dequeue: 2
Peek after enqueueing 4: 2
```

Enqueueing `4` in the middle of this sequence doesn't disturb `2`'s position at the front — `4` goes onto `in`, untouched until `out` runs dry again — exactly the two-stack design's own separation of concerns, verified directly.

## What Breaks Without This

Suppose a high-volume message queue were built using `enqueue-naive`'s single-list approach, under the belief that "a queue is just a list used differently," without ever measuring which operation actually costs what. Every single message arrival would cost `O(n)` — proportional to how many messages are already waiting — meaning the queue gets *slower to add to* precisely as it gets busier, the exact opposite of what a real, high-throughput queue needs. The two-stack construction this lesson derived isn't a cosmetic improvement; it's the difference between a system that degrades under load and one that doesn't.

## Exercises

1. **Trace.** By hand, trace `refill-out` completely on `in-stack = (3 2 1)`, `out-stack = ()`, confirming the final `out-stack` is `(1 2 3)`.
2. **Predict.** Before checking, predict how many total element-moves occur if `10` values are enqueued, then all `10` are dequeued, using the two-stack queue. Justify using this lesson's amortized argument.
3. **Verify.** Enqueue `5` values, dequeue `2`, enqueue `2` more, then dequeue the rest, confirming the final dequeue order matches the original enqueue order exactly.
4. **Break it, on purpose.** Modify `ensure-out` to refill `out` on *every* `dequeue` call, regardless of whether `out` is already non-empty. Explain why this breaks the amortized `O(1)` bound, using Lesson 53's aggregate method.
5. **Generalize.** Write `queue-empty?`, correctly returning `true` only when *both* internal stacks are empty.
6. **Reconstruct.** Close this lesson. From memory, explain why the two-stack queue's `enqueue` and `dequeue` are amortized `O(1)`, using Lesson 53's aggregate method directly.

## Definition of Done

- [ ] You can explain why a single list forces one of `enqueue`/`dequeue` to be `O(n)`.
- [ ] You can build the two-stack queue and explain how refilling preserves FIFO order.
- [ ] You completed Exercise 3 and confirmed FIFO order across a mixed sequence of operations.
- [ ] You completed Exercise 5 and correctly implemented `queue-empty?`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified — for example, `"Confirm FIFO order across mixed enqueue/dequeue sequence; implement queue-empty?"` — not just `"lesson 87 exercise"`.

---

**Next lesson:** Lesson 88, *Deques*, unifies Lesson 86's stack and this lesson's queue into a single structure supporting cheap operations at *both* ends at once.
