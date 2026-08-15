# Lesson 54: Memoization

**What you will build:** `memo-fib`, a real, working version of `fib` that computes `fib(30)` in roughly a third of a millisecond instead of `fib`'s own measured `144` milliseconds — making `2,692,537` real calls drop to just `59`. The transferable problem this lesson is actually about: Lesson 53 diagnosed exactly why `fib`'s branches keep recomputing identical subproblems, and confirmed `let` can't fix it, because the two branches never share any memory of what the other has already computed. This lesson builds that shared memory directly.

**What you need to know first:** Lesson 6 (`FP-L006-state-and-change.md`) — specifically *state* and *reassignment*, applied here to a cache shared across every recursive call. Lesson 29 (`FP-L029-base-cases.md`) — specifically `fib.scm`, extended directly. Lesson 53 (`FP-L053-repeated-subproblems.md`) — specifically *overlapping subproblems* and the real `177`-calls-across-`11`-distinct-subproblems measurement, both directly resolved here.

**Terms introduced in this lesson**

- **Cache** — a stored record of results already computed, consulted before repeating a computation, so an already-answered question is answered by lookup rather than by recomputation.
- **Memoization** — the specific technique of caching a function's results, keyed by its arguments, so that calling it again with the same arguments returns the cached result immediately instead of recomputing it. Memoization is the direct fix for overlapping subproblems (Lesson 53): once one branch computes `fib(5)`, every other branch that also needs `fib(5)` can simply look it up.

## Objects and methods used

- **`assoc`**
  - *What it is:* a real Scheme procedure that searches a list of pairs for one whose first element matches a given key.
  - *Implementation:* takes a key and a list of pairs (an association list), returning the matching pair if found, `#f` otherwise; confirmed this session as `(assoc n memo)`.
  - *Its use:* `memo-fib`'s cache lookup, checking whether a given `n`'s result has already been stored before deciding whether to compute it.

---

## Concept Unit 1: What's Needed — a Shared Memory Across Separate Branches

### The Problem

Lesson 53 established precisely why `fib(n − 1)` and `fib(n − 2)`'s independent recursions can't share results with `let` alone — neither branch's local variables are visible to the other. What's actually needed is something both branches can consult and update, persisting across every call in the entire computation, not scoped to any one branch.

### No isolated lab for this step

This concept has no code of its own to isolate — the requirement is stated directly below, not through a construct with its own syntax.

### Applying It — Naming What's Required

**Confirming `let` genuinely can't provide this, restated from Lesson 53:** a `let` binding is scoped to the expression that follows it — it disappears once that expression finishes evaluating, and it was never visible to a sibling call happening in an entirely different branch to begin with.

**Naming what's actually needed:** a single, shared piece of state — in exactly Lesson 6's sense, a quantity whose correct description requires the word "currently" — that every single call to `fib`, no matter which branch it's in, can both read from and write to.

**Confirming this curriculum already has the tool for exactly this:** `define` and `set!` (Lesson 45), used to create a name that persists across every call, exactly the way `call-count` persisted across every call in Lesson 31 and Lesson 53's own instrumented versions.

### Walkthrough

- **The `let`-scoping limitation, restated from Lesson 53** — confirms precisely why this lesson needs a genuinely different kind of tool.
- **"a single, shared piece of state"** — a reappearance of *state* (Lesson 6), applied here to something that needs to persist and be visible across an entire computation, not just within one call.
- **The confirmation that `define`/`set!` already provide this** — not a new concept, but recognition that this lesson's fix uses tools already fully established, applied in a new combination.

### CS Lens

This is the recognition that fixing overlapping subproblems requires breaking out of each individual call's own local scope entirely — a shared, persistent structure that outlives any single call, exactly the way a shared reference document outlives any one person consulting it. Also recognized in: a shared whiteboard in an office, letting separate teams see what others have already worked out, rather than each team solving the same problem independently behind closed doors; a shared translation memory in professional translation software, letting a translator reuse a phrase already translated elsewhere in the same document; a shared cache in a web server, letting one request's expensive computation benefit every subsequent request needing the same result.

### SE Lens

The alternative to introducing shared state deliberately is to keep trying local, per-call fixes like `let`, which Lesson 53 already confirmed cannot solve this particular problem. The real cost of that alternative would be continuing to accept `fib`'s exponential cost as unavoidable, when in fact a specific, well-understood technique — shared, persistent state, already fully available in this curriculum's tools — directly addresses it. Naming the actual requirement precisely, as this unit does, costs nothing beyond the recognition itself; it sets up Concept Unit 2's concrete implementation.

---

## Concept Unit 2: A Cache — Remembering What's Already Been Computed

### The Problem

Concept Unit 1 named what's needed: shared, persistent state. It's worth stating the precise algorithm this state will support, in prose, before writing any code — following Lesson 46's design discipline.

### No isolated lab for this step

This concept has no code of its own to isolate — the algorithm is stated directly below, not through a construct with its own syntax.

### Applying It — Stating the Algorithm

**The cache itself:** a single, shared structure recording every `(argument, result)` pair already computed — for `fib`, every `n` whose `fib(n)` has already been worked out at least once.

**The algorithm, in prose, for computing `fib(n)` with a cache available:**

> 1. Check whether `n` is already in the cache.
> 2. If it is, return the cached result directly — no further computation needed.
> 3. If it isn't, compute `fib(n)` the ordinary way (using the base case or the recursive case, exactly as `fib.scm` already does).
> 4. Before returning that result, store it in the cache, associated with `n`.
> 5. Return the result.

**Confirming this directly resolves Concept Unit 1's requirement:** the very first time any branch computes `fib(5)`, Step 4 stores it. Every subsequent call to `fib(5)`, from *any* branch, anywhere in the computation, hits Step 2 instead, returning the stored result immediately rather than repeating the entire recursive computation.

### Walkthrough

- **The five-step algorithm, stated entirely in prose** — first appearance of the memoization algorithm, described precisely before any Scheme is written, following Lesson 46's exact design discipline.
- **"the very first time any branch computes `fib(5)`... every subsequent call... hits Step 2 instead"** — the precise mechanism by which this algorithm resolves Lesson 53's diagnosed problem, stated directly.

### CS Lens

This is the general shape of every caching system ever built: check first, compute only if necessary, remember for next time — applicable far beyond `fib` specifically, to any computation whose inputs repeat. Also recognized in: a reference librarian checking a card catalog before re-researching a question already answered previously; a pharmacist checking a patient's records before re-verifying information already on file; a customer service system checking a knowledge base before re-solving a problem already documented from an earlier customer's identical issue.

### SE Lens

The alternative to stating the algorithm in prose first is to jump directly to writing the caching code, the way Lesson 46 already warned against for any nontrivial recursive design. The real cost of that alternative is a higher risk of a subtle ordering mistake — storing the result before actually computing it, say, or checking the cache after already recursing unnecessarily. Stating the five steps precisely first, as this unit does, costs nothing beyond the same design discipline already established; it gives Concept Unit 3 an exact specification to translate directly into code.

---

## Concept Unit 3: Deriving memo-fib — Real Code

### The Problem

Concept Unit 2's five-step algorithm needs translating into real Scheme, using a concrete representation for the cache and `set!` (Lesson 45) to update it.

### The New Code — Type It Yourself

```scheme
(define memo '())

(define (memo-fib n)
  (let ((cached (assoc n memo)))
    (if cached
        (cdr cached)
        (let ((result (if (< n 2)
                           n
                           (+ (memo-fib (- n 1)) (memo-fib (- n 2))))))
          (set! memo (cons (cons n result) memo))
          result))))
```

### The Updated Project

This is `memo-fib.scm`, in full:

```scheme
(define memo '())

(define (memo-fib n)
  (let ((cached (assoc n memo)))
    (if cached
        (cdr cached)
        (let ((result (if (< n 2)
                           n
                           (+ (memo-fib (- n 1)) (memo-fib (- n 2))))))
          (set! memo (cons (cons n result) memo))
          result))))

(display (memo-fib 10))
(newline)
(display (memo-fib 50))
(newline)
```

### Reference Source

Concept Unit 2's five-step algorithm, translated directly: the cache is a list of `(n . result)` pairs; `assoc` (see Objects and methods used) implements Step 1's lookup; the existing `if (< n 2) n (+ ...))` from `fib.scm` implements Step 3 unchanged; `set!` implements Step 4.

### Files affected

Created: `memo-fib.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile memo-fib.scm
55
12586269025
```

Verified this session — `memo-fib(10) = 55`, matching `fib(10)`'s already-established value exactly; `memo-fib(50) = 12586269025`, computed instantly, for an input that would take the original `fib` an astronomically long time to complete, given its exponential growth (Lesson 53's own `F(n)` recurrence).

### Mechanical Walkthrough

- **`(define memo '())`** — the cache itself, starting empty, exactly Step (before Step 1) of Concept Unit 2's algorithm — nothing computed yet.
- **`(let ((cached (assoc n memo))) ...)`** — Step 1: looking up `n` in the cache using `assoc`, binding the result (a matching pair, or `#f`) to `cached`.
- **`(if cached (cdr cached) ...)`** — Steps 2 and 3 combined: if found, `(cdr cached)` extracts the stored result directly (Step 2); if not, the `else` branch proceeds to compute it.
- **`(let ((result (if (< n 2) n (+ (memo-fib (- n 1)) (memo-fib (- n 2)))))) ...)`** — Step 3: computing the result the ordinary way, using `let` (Lesson 51) so the computed value can be both stored and returned without recomputing it.
- **`(set! memo (cons (cons n result) memo))`** — Step 4: storing the new `(n . result)` pair by consing it onto the front of `memo`, updating the shared cache for every future call, from any branch, to find.
- **`result`** — Step 5: returning the value, whether it came from the cache or was just computed and stored.

### CS Lens

This is a complete, correct realization of Concept Unit 2's algorithm — every step of the prose design corresponds directly to one piece of the final code, exactly the disciplined translation Lesson 46 already modeled for `tree-height`. Also recognized in: a receptionist's check-in process, checking an appointment book before creating a new record, then updating that same book so the next check works from complete, current information; a librarian's checkout process, checking whether a book is already out before processing a new checkout, then updating the same shared catalog; a pharmacist's refill process, checking existing prescription records before creating a new one, then updating those same records.

### SE Lens

The alternative to this careful, step-by-step translation is to write the caching logic more casually, trusting intuition to get the check-compute-store order right. The real cost of that alternative is a real, easy-to-make bug: storing a result *before* it's fully computed, or checking the cache in a way that doesn't actually prevent redundant recursive calls, either of which would silently undermine the entire point of memoizing at all. Translating Concept Unit 2's five steps directly and explicitly, as this unit does, costs nothing beyond the careful mechanical walkthrough just given; it produces code whose correctness can be checked clause by clause against an already-verified design.

---

## Concept Unit 4: Measuring the Fix — Real Timing and Call Counts

### The Problem

`memo-fib`'s design should, in principle, eliminate the redundancy Lesson 53 measured. This needs to be confirmed directly, with real numbers, exactly the discipline this curriculum has demanded since Lesson 22.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Comparing fib and memo-fib Directly

**Both procedures, timed on the identical input, `n = 30`:**

```
$ guile timing-compare.scm
plain fib(30): 832040 in 144.195 ms
memo-fib(30): 832040 in 0.334 ms
```

Verified this session — identical, correct results, computed roughly `430` times faster with memoization.

**Both procedures, instrumented for total call count, on the identical input:**

```
$ guile call-compare.scm
plain fib(30) calls: 2692537
memo-fib(30) calls: 59
```

Verified this session — `2,692,537` calls collapsed to `59`, a reduction by a factor of over `45,000`.

**Connecting this directly to Lesson 53's own measurement, confirming the mechanism rather than just the outcome:** Lesson 53 found `fib(10)` touches only `11` distinct subproblems despite making `177` total calls. `memo-fib(30)`'s `59` calls is close to `2 × 30 − 1`, roughly matching "one call per distinct subproblem, plus a small constant" — exactly the linear growth expected once every subproblem is solved once and looked up thereafter, rather than the exponential growth `F(n)` (Lesson 53, Concept Unit 1) predicted for the unmemoized version.

### Walkthrough

- **The real timing numbers, `144.195` ms versus `0.334` ms** — first direct, measured confirmation that memoization actually delivers the improvement its design promised.
- **The real call-count numbers, `2,692,537` versus `59`** — a second, independent confirmation, checking the actual mechanism (fewer redundant calls) rather than only the visible symptom (faster running time).
- **The connection to Lesson 53's `11`-distinct-subproblems finding** — not a new concept, but direct confirmation that `memo-fib`'s call count now scales the way solving each distinct subproblem exactly once would predict, rather than the way `F(n)`'s exponential recurrence predicted for the original.

### CS Lens

This is a complete, measured before-and-after comparison, checked two independent ways (wall-clock time and call count), confirming a specific, diagnosed problem (Lesson 53's overlapping subproblems) was actually fixed by a specific, designed solution (this lesson's cache) — not merely believed to be fixed because the code looks reasonable. Also recognized in: a factory measuring both cycle time and defect rate before and after a process change, rather than trusting either measure alone; a hospital measuring both patient wait time and readmission rate before and after a new triage system; a software team measuring both response time and server load before and after a caching layer is added to a real production system.

### SE Lens

The alternative to measuring both timing and call count is to notice `memo-fib` "feels faster" without ever confirming why, or by how much. The real cost of that alternative is exactly the evidence-versus-proof gap this curriculum has warned about since Lesson 22 — a vague impression of improvement is not the same as a checked, quantified one, and without call-count confirmation specifically, there would be no way to be sure the speedup came from eliminating overlapping subproblems rather than from some unrelated, coincidental factor. Measuring both, as this unit does, costs two real, instrumented runs; it confirms the fix works for the actual, diagnosed reason, not merely that it happens to run faster.

---

## Concept Unit 5: The Cost of Memoization — Space Traded for Time

### The Problem

`memo-fib`'s dramatic speedup didn't come for free. It's worth stating honestly what was actually traded to get it, rather than presenting memoization as an unconditional improvement.

### No isolated lab for this step

This concept has no code of its own to isolate — the tradeoff is stated directly below, not through a construct with its own syntax.

### Applying It — Naming What Was Actually Spent

**What `fib`'s original version needed, in terms of stored data:** nothing beyond its own pending stack frames — no separate structure recording past results at all.

**What `memo-fib` needs instead:** the entire `memo` cache, growing by one entry for every distinct subproblem ever computed — for `memo-fib(30)`, thirty-one entries, one for each distinct value of `n` from `0` to `30`, all held in memory for as long as `memo` itself persists.

**Stating the tradeoff precisely:** memoization trades memory (every distinct subproblem's result, stored and kept) for time (each distinct subproblem computed only once, ever, rather than potentially many times). This is not a free improvement; it is a deliberate exchange of one resource for another.

**Confirming this tradeoff is usually a good one for `fib` specifically, while being honest that it isn't automatically good for everything:** for `fib`, the number of distinct subproblems grows only linearly with `n` (Lesson 53's own finding — only `11` distinct subproblems for `fib(10)`), while the *unmemoized* time cost grows exponentially — trading a small, linear amount of memory for an exponential amount of avoided time is an excellent exchange here. A problem whose number of distinct subproblems itself grows explosively, with no exponential time cost to justify caching them all, could make the identical technique a poor trade instead.

### Walkthrough

- **`fib`'s original memory needs, essentially none beyond ordinary recursion** — establishes the baseline this unit is about to compare against.
- **`memo-fib`'s cache, growing to thirty-one entries for `n = 30`** — the concrete cost being paid, stated precisely rather than left vague.
- **The explicit "memory traded for time" statement** — the precise, honest tradeoff this unit exists to name.
- **The qualified conclusion — good here, not automatically good everywhere** — not a new concept, but the same honest, non-overclaiming discipline this curriculum modeled in Lesson 36 for `fold` versus `map`, and Lesson 48 for mutual recursion versus a single flagged procedure.

### CS Lens

This is the fundamental space-time tradeoff underlying essentially every caching system ever built — trading storage for speed, worthwhile exactly when the number of things worth remembering stays manageable relative to how much repeated work they'd otherwise cause. Also recognized in: a library's card catalog, trading physical shelf space for the time saved not having to search every book individually; a web browser's cache, trading disk space for the time saved not re-downloading unchanged pages; a chess engine's transposition table, trading memory for the time saved not re-evaluating positions reachable by different move orders.

### SE Lens

The alternative to stating this tradeoff honestly is to present memoization as a technique that should be applied automatically, everywhere redundant computation is found, without weighing its actual cost. The real cost of that alternative, for a problem whose distinct subproblems don't stay small the way `fib`'s do, could be trading a manageable time cost for an unmanageable memory cost — genuinely making a program worse, not better. Stating the tradeoff explicitly, and confirming it's a good one specifically for `fib`'s particular shape of redundancy, as this unit does, costs one honest closing analysis; it is what keeps memoization a deliberately chosen tool, applied where it genuinely helps, rather than a reflexive habit applied everywhere redundancy is merely noticed.

---

## Closing

### Connect the pieces

One procedure, `fib`, and its memoized twin, traced through every unit built in this lesson, start to finish:

1. **The requirement named (Unit 1):** shared, persistent state, visible to every branch — something `let` was already confirmed unable to provide.
2. **The algorithm stated in prose (Unit 2):** check, return if cached, otherwise compute, store, then return — five precise steps, before any code.
3. **The real code, translated directly (Unit 3):** `memo-fib`, its cache, lookup, and update each corresponding exactly to one step of the prose algorithm.
4. **The fix measured, two independent ways (Unit 4):** `144.195` ms collapsing to `0.334` ms; `2,692,537` calls collapsing to `59` — both confirming Lesson 53's diagnosed overlapping subproblems are genuinely eliminated.
5. **The honest cost named (Unit 5):** memory traded for time, a good trade here specifically because `fib`'s distinct subproblems stay few even as its unmemoized cost grows exponentially.

Unit 4's real numbers are the direct, measured payoff of Unit 3's exact code, itself the direct translation of Unit 2's algorithm, itself the direct response to Unit 1's precisely named requirement — every unit in this lesson building on the one before it, with nothing introduced disconnected from what came before.

### What breaks without this

Suppose a real system needed to answer many related, overlapping questions — computing a shipping cost that depends on smaller, already-computed shipping costs for sub-regions, say — and its author, having built a correct but unmemoized recursive procedure the way `fib.scm` was originally built in Lesson 29, deployed it without ever checking for the kind of overlapping subproblems Lesson 53 taught how to detect. For a small number of regions, this might run acceptably; as the number of regions grew, the same exponential blowup this lesson measured directly for `fib` — `2,692,537` calls for an input of only `30` — could make the system unacceptably slow, or entirely impractical, at a scale reached in ordinary, expected use, not some unusual edge case. Restoring this lesson's discipline — detecting overlapping subproblems (Lesson 53), then applying memoization deliberately, with its actual memory cost weighed honestly against the time it saves (Concept Unit 5) — is what turns an exponentially slow but individually correct procedure into one that's both correct and practical at real scale.

### Exercises

1. **Observe.** Return to a procedure from Lesson 53's exercises that you confirmed has overlapping subproblems, and state Concept Unit 2's five-step algorithm for it, in prose, before writing any code.
2. **Formalize.** Implement a memoized version of your Exercise 1 procedure, following Concept Unit 3's exact translation from prose algorithm to real Scheme code.
3. **Explain.** Run your Exercise 2 procedure and check its output against your original, unmemoized version's already-verified results, confirming they agree.
4. **Formalize.** Measure your Exercise 2 procedure both for real timing and for total call count, compared against your original version, on an input large enough for the difference to be dramatic, the way Concept Unit 4 compared `fib(30)` against `memo-fib(30)`.
5. **Explain.** State, honestly, how large your Exercise 2 procedure's cache actually grew for your Exercise 4 input, and explain whether the memory-for-time tradeoff was a good one for your specific procedure, the way Concept Unit 5 evaluated it for `fib`.

### Definition of done

- [ ] You can explain, precisely, why memoization is the correct fix for overlapping subproblems specifically, in a way `let` alone is not.
- [ ] You can state a memoization algorithm in five precise prose steps before writing any code.
- [ ] You can implement a memoized version of a recursive procedure, using shared state and `set!` correctly.
- [ ] You can measure a memoized procedure's improvement two independent ways — real timing and total call count — and connect the improvement back to a specific, earlier-diagnosed cause.
- [ ] You completed Exercises 1–5 using a procedure of your own, not `fib`.
- [ ] Commit your Exercise 2 memoized procedure and your Exercise 4 measurements, with a commit message stating the actual measured speedup factor your Exercise 4 comparison found.
