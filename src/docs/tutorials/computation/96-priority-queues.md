# Lesson 96: Priority Queues

**What you will build**: By the end of this lesson you'll fill in the one operation Lessons 94 and 95 never built — actually removing the minimum, not just reading it — and assemble `heap-insert`, `heap-peek`, `heap-extract-min`, and `heapify` into the named abstraction they were building toward all along: a **priority queue**, a queue that serves by urgency rather than arrival order, the structure behind scheduling, several of Section VI's graph algorithms, and simulating events over time.

**What you need to know first**: Lesson 94's `heap-peek`, `heap-insert`, `heap-swap`, and `sift-up`; Lesson 95's `sift-down` and `heapify`; Lesson 87's queue (for direct contrast); Lesson 85's vector-as-pair pattern, for this lesson's own return-two-things problem.

**Terms introduced in this lesson**:

- **priority queue** — an abstraction supporting three operations: insert a value, peek at the highest-priority (here, smallest) value, and remove and return the highest-priority value. *Why it matters*: Lesson 87's queue serves whoever arrived first, regardless of urgency; a priority queue serves whoever is most urgent, regardless of arrival order — a genuinely different contract, not just a queue with extra features.

**Objects and methods used**:

- **`pop`**
  - *What it is:* a Clojure core function returning a vector with its last element removed.
  - *Implementation:* `(pop v)` — `O(1)` for a vector, the mirror of `assoc` appending at `(count v)`; verified behavior: `(pop [1 2 3])` returns `[1 2]`. Calling `pop` on an empty vector is a genuine error, not a value it can meaningfully return.
  - *Its use:* this lesson's `heap-extract-min`, which assumes a non-empty heap — extracting from an empty priority queue is a real precondition violation, not a case this lesson silently handles.

This lesson also reuses `get`, `assoc`, and `count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: `heap-extract-min` — Removing, Not Just Reading

### The Problem

`heap-peek` (Lesson 94) reads the minimum without disturbing the heap at all. A real priority queue has to actually *remove* the value it just served, so the next `heap-peek` returns the *next* most urgent one — and it has to do that while preserving both the completeness and heap-property guarantees Lessons 94 and 95 spent two lessons establishing. Simply deleting position `0` would leave a hole — no position `0` at all — breaking every index formula Lesson 94 derived. What has to happen instead?

### Introduce the concept in isolation

```clojure
(defn heap-place-last [shrunk last-value]
  (if (= (count shrunk) 0)
    shrunk
    (sift-down (assoc shrunk 0 last-value) 0)))

(defn heap-extract-min [heap]
  [(get heap 0) (heap-place-last (pop heap) (get heap (- (count heap) 1)))])
```

```
user=> (heap-extract-min [10 40 20 70 60 50 30])
[10 [20 40 30 70 60 50]]
```

The old *last* position's value moves into position `0` — preserving completeness, since removing the last position and filling the now-empty root leaves no gap anywhere — and `sift-down` (Lesson 95) restores the heap property from there, since the value that landed at the root was never checked against anything on the way there. The result is a **vector-as-pair** (Lesson 85's own pattern): the removed minimum, and the new, still-valid heap.

### Discard the throwaway example

Not applicable — `heap-place-last` and `heap-extract-min` are real, reusable functions.

### Project Change

- **Reference Source**: `heap-extract-min` reuses Lesson 85's vector-as-pair return convention directly — a function needing to hand back two genuinely different results (the removed value, and the new heap) rather than choosing one.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn heap-extract-min [heap]
  [(get heap 0) (heap-place-last (pop heap) (get heap (- (count heap) 1)))])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get heap 0)`** — reappearing (Lesson 94): the value being removed and returned, read *before* anything else changes.
- **`(pop heap)`** — first appearance (covered fully in Objects and methods used, above): shrinks the array by exactly one position, from the end — the one shrink that never disturbs any other position's index.
- **`(get heap (- (count heap) 1))`** — reads the *original* heap's last value, before `pop` removes it — this has to be captured from `heap` directly, since after `pop` that position no longer exists to read from.
- **`(if (= (count shrunk) 0) shrunk ...)`** — first appearance: if removing the one remaining element leaves the heap empty, there's nothing left to place or sift — a real edge case a naive version (always `assoc`-ing position `0`) would get wrong, silently re-adding a value to an array that should have ended up empty.
- **`(sift-down (assoc shrunk 0 last-value) 0)`** — reappearing `sift-down` (Lesson 95), applied here for the first time to a value placed at the root *directly*, rather than reached by walking down from an insertion.

### CS Lens

`heap-extract-min` costs `O(\log n)` — one `pop` (`O(1)`) plus one `sift-down` from the root (`O(\text{height of the whole tree})`, which Lesson 94 already established is `O(\log n)` for a complete tree) — the same cost class as `heap-insert`, for the mirror-image reason: both touch exactly one root-to-leaf path, never a whole subtree.

### SE Lens

Moving the *last* element into the vacated root, rather than, say, the root's own left child, is what keeps the array complete without any extra bookkeeping — any other choice would leave a hole somewhere in the middle of the array, breaking `heap-left-index`/`heap-right-index`'s assumption that every position up to `(count heap)` is genuinely occupied.

---

## Concept Unit: Assembling the Priority Queue

### The Problem

Three separate functions — `heap-insert`, `heap-peek`, `heap-extract-min` — each individually derived and proven to preserve the heap property. Lesson 87 already named a structure with exactly three matching operations (`enqueue`, `peek`, `dequeue`) a **queue**. Is a heap, used this way, the same kind of thing?

### Introduce the concept in isolation

```
user=> (def pq (heapify [40 60 20 70 10 50 30]))
user=> (heap-peek pq)
10
user=> (def result (heap-extract-min pq))
user=> (get result 0)
10
user=> (heap-peek (get result 1))
20
```

Compare this directly to Lesson 87's queue: `enqueue` there always adds to the *back*, and `dequeue` always removes from the *front* — whichever value arrived first leaves first, full stop, regardless of what it represents. Here, `heap-insert` adds `70` before `10` — but `heap-peek` and `heap-extract-min` always surface `10` first anyway, because arrival order was never part of the contract at all. This is a **priority queue**: the same three-operation shape as Lesson 87's queue (add something; look at what's next; remove and return what's next), but "what's next" means *smallest*, not *earliest*.

### Discard the throwaway example

Not applicable — this unit names an assembly of already-real functions, introducing no new code.

### CS Lens

A priority queue is Lesson 87's queue with FIFO order (Lesson 86's stack's own LIFO counterpart) replaced by a different rule entirely — this is the same move Lesson 92 made against Lesson 85's plain node-and-reference structure, imposing a specific discipline on top of a general shape to get a specific, useful guarantee. Also recognized in: an emergency room's triage order (most critical patient next, not first-arrived), and an operating system's process scheduler choosing which task runs next by priority rather than by submission time.

### SE Lens

Choosing a priority queue over a plain queue is a decision about what "correct order" even means for a given problem — not a performance tradeoff the way choosing between a BST and a heap (Lesson 94's own SE lens) was. A task scheduler that used Lesson 87's FIFO queue when urgency actually varies wouldn't just be slower, it would be answering a *different question* than the one that actually needed answering.

### Connection to the previous unit

The previous unit completed the third operation a priority queue needs; this unit names the completed set of three, and pins down exactly how its contract differs from the queue this series already built.

---

## Concept Unit: Where Priority Queues Show Up

### The Problem

"Serve the most urgent thing next" sounds narrow — is it actually a common problem, or a rare special case this lesson built machinery for unnecessarily?

### Introduce the concept in isolation

Four places this exact shape recurs, each explored briefly here and built in full detail later in this series:

- **Scheduling** — an operating system deciding which waiting process to run next by priority, not by how long it's been waiting; a task queue processing the most urgent job first.
- **Graph algorithms** — Lesson 130 (*Dijkstra's Algorithm*), much later, repeatedly needs "which unvisited location is currently closest?" — exactly a priority queue's `heap-extract-min`, called once per step. Lesson 133 (*Kruskal and Prim*) uses the identical operation to always grow a minimum spanning tree by its cheapest available edge next.
- **Event simulation** — a simulated system where events happen at different times needs to process them in time order, not the order they were scheduled *in* — a priority queue ordered by event time, not arrival time.
- **Optimization** — repeatedly combining the two currently-cheapest options (a classic move in several later algorithms) needs "find the two smallest, fast, repeatedly" — precisely what `heap-extract-min`, called twice, provides.

### Discard the throwaway example

Not applicable — a survey of applications, not new code.

### CS Lens

All four of these share one shape: repeatedly ask "what's most urgent right now," where "urgent" is redefined per problem (soonest deadline, closest distance, earliest timestamp, cheapest cost) — the priority queue doesn't care what the numbers *mean*, only that they can be compared, the same generality Lesson 27's `reduce` had over its combining operation.

### SE Lens

None of these four applications needed a new data structure of their own — each one is this lesson's exact three operations, with a different meaning attached to "priority." Recognizing an unfamiliar problem as "this is just a priority queue, ordered by X" is a genuine transfer of everything this lesson and the previous two already built, not a reason to design something new.

### Connection to the previous unit

The previous unit named the completed abstraction; this unit is evidence the abstraction was worth building — the same three operations, reused verbatim across problems that don't otherwise resemble each other at all.

---

## Connect the Pieces

All four operations, on one running priority queue:

```clojure
(def pq (heapify [40 60 20 70 10 50 30]))
(println "Peek:" (heap-peek pq))
(def step1 (heap-extract-min pq))
(println "Extracted:" (get step1 0) "-- remaining peek:" (heap-peek (get step1 1)))
(def step2 (heap-extract-min (get step1 1)))
(println "Extracted:" (get step2 0) "-- remaining peek:" (heap-peek (get step2 1)))
```

```
Peek: 10
Extracted: 10 -- remaining peek: 20
Extracted: 20 -- remaining peek: 30
```

Repeated `heap-extract-min` calls surface every value in increasing order, one at a time — not because anything was sorted in advance, but because the heap property alone guarantees the root is always the current minimum, every single time it's asked.

## What Breaks Without This

Suppose `heap-extract-min` skipped `heap-place-last`'s empty-check, always calling `sift-down`:

```clojure
(defn broken-extract-min [heap]
  [(get heap 0) (sift-down (assoc (pop heap) 0 (get heap (- (count heap) 1))) 0)])
```

```
user=> (broken-extract-min [5])
[5 [5]]
```

Extracting the only element from a one-element queue should leave it empty — instead, `5` reappears, duplicated, because `(assoc (pop [5]) 0 5)` — `pop [5]` is `[]`, and `assoc`ing position `0` on an empty vector is a valid *append* (Lesson 94's own append rule), not an error, silently re-inserting the value this call was supposed to remove. A priority queue that never actually empties, no matter how many times its last element is extracted, is exactly the kind of quietly-wrong behavior this lesson's real `heap-place-last` exists to rule out.

## Exercises

1. **Trace.** By hand, trace `(heap-extract-min [20 40 30 70 60 50])` from this lesson's first example, showing the `sift-down` call in full.
2. **Predict.** Before running it, predict what `broken-extract-min` does to a *two*-element heap, `[5 10]`. Verify by tracing.
3. **Verify.** Call `heap-extract-min` repeatedly on `(heapify [40 60 20 70 10 50 30])` until the heap is empty, and confirm the values come out in fully sorted order.
4. **Break it, on purpose.** Call `pop` directly on `[]` in your REPL and record the actual error Clojure produces, confirming this lesson's claim that it's a genuine error, not a silently-returned value.
5. **Generalize.** Using Exercise 3's observation, write `heap-sort`, taking an unsorted vector and returning a fully sorted one, using only `heapify` and repeated `heap-extract-min` calls.
6. **Reconstruct.** Close this lesson. From memory, explain the contract difference between Lesson 87's queue and this lesson's priority queue, and name two of this lesson's four application areas without looking back.

## Definition of Done

- [ ] You can implement `heap-extract-min` and explain why it moves the *last* element into the root rather than any other position.
- [ ] You can explain the contract difference between a priority queue and Lesson 87's plain queue.
- [ ] You completed Exercise 3 and confirmed repeated extraction yields fully sorted output.
- [ ] You completed Exercise 5 and implemented a correct `heap-sort`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Confirm repeated heap-extract-min yields sorted order; implement heap-sort using heapify + extraction"` — not just `"lesson 96 exercise"`.

---

**Next lesson:** Lesson 97, *Balanced Trees*, returns to Lesson 92's BST, now armed with Lesson 94's completeness idea and this lesson's own extraction discipline, to study directly why an *unbalanced* BST can collapse toward Lesson 85's linked list — the exact degenerate case Lesson 92's own closing section first demonstrated — and what it takes to prevent that from ever happening.
