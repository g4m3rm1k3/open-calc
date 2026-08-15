# Lesson 55: Dynamic Programming Emerges

**What you will build:** `table-fib`, a second, independently correct fix for the exact problem Lesson 54 already solved — but built by filling in a table from the bottom up instead of caching a recursion from the top down. Real, measured, steady-state timing this session: `table-fib(100000)` averages **≈ 53 ms**, `memo-fib(100000)` averages **≈ 79 ms**, both computing the identical, correct 20,899-digit result. The transferable point this lesson is actually about: Lessons 53 and 54 together diagnosed a problem and built one fix for it; this lesson builds a second, different-shaped fix for the identical problem, and then names the general pattern both fixes belong to.

**What you need to know first:** Lesson 39 (`FP-L039-termination.md`) — specifically tail recursion and the named-`let` looping idiom it established. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically `let`, reused here for the named-loop form. Lesson 54 (`FP-L054-memoization.md`) — specifically `memo-fib`, extended and directly compared against here.

**Terms introduced in this lesson**

- **Vector** — a fixed-size, indexed collection of values, where any position can be read or written directly by its numeric index, without walking through the elements before it — unlike a list (Lesson 12), whose elements can only be reached by walking from the front.
- **Table** — an indexed structure, here a vector, used to store the solution to every subproblem, indexed by the argument that produces it — this lesson's concrete realization of Lesson 54's more abstract "cache."
- **Bottom-up** — computing a table's entries starting from the smallest, base-case subproblems and working upward toward the one actually asked for, so that every entry a computation needs already exists by the time it's needed.
- **Top-down** — computing by starting from the actual question asked, recursing toward base cases as needed, exactly `memo-fib`'s own approach (Lesson 54) — named here for the first time, now that a bottom-up alternative exists to contrast it with.
- **Dynamic programming** — the general technique of solving a problem with overlapping subproblems (Lesson 53) by systematically recording each subproblem's solution so it is computed only once, whether that recording happens top-down (Lesson 54's `memo-fib`) or bottom-up (this lesson's `table-fib`). Both are dynamic programming; they differ only in direction.

## Objects and methods used

- **`make-vector`**
  - *What it is:* a real Scheme procedure that creates a new vector of a given length, with every position initialized to a given value.
  - *Implementation:* takes a length and a fill value, returning a fresh vector; confirmed this session as `(make-vector (+ n 1) 0)`, creating a vector of `n + 1` positions, all initially `0`.
  - *Its use:* `table-fib`'s table itself, sized to hold one entry for every `fib` value from `0` to `n`.
- **`vector-set!`**
  - *What it is:* a real Scheme procedure that mutates a vector, writing a new value into a given index.
  - *Implementation:* takes a vector, an index, and a value, and mutates the vector in place; confirmed this session as `(vector-set! table i (+ (vector-ref table (- i 1)) (vector-ref table (- i 2))))`.
  - *Its use:* filling in each new entry of `table-fib`'s table, one index at a time, as the table is built bottom-up.
- **`vector-ref`**
  - *What it is:* a real Scheme procedure that reads a vector's value at a given index, directly, in one step.
  - *Implementation:* takes a vector and an index, returning the value stored there; confirmed this session as `(vector-ref table (- i 1))`.
  - *Its use:* reading already-computed table entries, both while building the table and when returning the final answer.

---

## Concept Unit 1: The Cost Hidden Inside memo-fib's Cache

### The Problem

`memo-fib` (Lesson 54) genuinely fixed the overlapping-subproblems problem — its call count dropped from `2,692,537` to `59` for `n = 30`. But its cache, `memo`, is a plain list of pairs, searched with `assoc` (Lesson 54) — and `assoc` has to walk the list from the front, checking each pair in turn, until it finds a match or runs out. It's worth asking directly whether that lookup itself has a hidden cost.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is answered directly below, using code already fully built in Lesson 54.

### Applying It — Measuring memo-fib at Larger Scale

Real, steady-state timing (first "cold JIT/GC" trial discarded, following the discipline this curriculum has used since Lesson 22 of trusting repeated, steady measurements over a single noisy one):

```
$ guile trials.scm
memo-fib(100000) trial 1: 80.25 ms
memo-fib(100000) trial 2: 77.556 ms
```

Verified this session — `memo-fib(100000)` consistently costs around `78`–`80` ms. This is small in absolute terms, but the question isn't whether it's fast enough — it's *why* it costs what it costs. Every one of `memo-fib`'s cache lookups, `(assoc n memo)`, has to walk however many pairs are currently in `memo` before it finds `n` or exhausts the list — a cost that grows as the cache grows, not a fixed, constant cost per lookup.

### Walkthrough

- **The real `78`–`80` ms steady-state timing** — first genuine measurement of `memo-fib` at a scale large enough for per-lookup cost to matter, rather than n = 30's near-instant `0.33` ms where any such cost is invisible.
- **"a cost that grows as the cache grows"** — the specific mechanism being questioned: `assoc`'s linear scan through however many pairs currently exist in `memo`, restated from Lesson 54's own description of `assoc`.

### CS Lens

This is the recognition that fixing one performance problem (overlapping subproblems, Lesson 53) doesn't automatically mean every remaining cost has been eliminated — the *data structure* holding the cache has its own cost profile, independent of the algorithm using it. Also recognized in: a paper card catalog versus a database index, both "storing records for lookup," but with very different search costs as the collection grows; a phone book searched by flipping pages versus one searched by a direct page-number formula; a company's shared drive organized as one enormous folder searched by scrolling versus one organized by a direct filing scheme.

### SE Lens

The alternative to questioning `memo-fib`'s cache structure is to treat Lesson 54's fix as finished, since it already delivered a dramatic, measured improvement. The real cost of that alternative is leaving a second, smaller inefficiency unexamined — not incorrect, just avoidably slower than it needs to be, exactly the kind of gap this curriculum's SE Lens has flagged before (Lesson 36, `fold` versus manual recursion). Questioning it directly, as this unit does, costs one honest re-measurement at a larger scale; it motivates Concept Unit 2's alternative structure.

---

## Concept Unit 2: Vectors — Isolated Lab

### The Problem

`assoc`'s cost comes specifically from lists only being reachable by walking from the front. What's needed instead is a structure where any position can be read or written directly, by its index, in one step — regardless of how many entries exist. This is a genuinely new kind of structure, and per this curriculum's Concept Isolation Rule, it gets its own throwaway lab before any real use.

### Concept Isolation Rule — Throwaway Lab

```scheme
(define v (make-vector 5 0))
(display v) (newline)
(vector-set! v 0 10)
(vector-set! v 2 99)
(display v) (newline)
(display (vector-ref v 2)) (newline)
(display (vector-length v)) (newline)
```

```
$ guile vector-lab.scm
#(0 0 0 0 0)
#(10 0 99 0 0)
99
5
```

Verified this session — `(make-vector 5 0)` creates five positions, all `0`; `vector-set!` writes directly into position `0` and position `2` without touching any other position or needing to walk toward them; `(vector-ref v 2)` reads position `2` directly, returning `99`; `vector-length` (mentioned here for completeness, not used in this lesson's real code) confirms the vector's fixed size, `5`.

**Discarding this lab:** `v` was created purely to see `make-vector`, `vector-set!`, and `vector-ref` in isolation. It is discarded now — `table-fib`'s real table, built next, is a separate, real vector serving a real purpose.

### Walkthrough

- **`(make-vector 5 0)`** — first real use: creating a five-position vector, every position starting at `0`.
- **`(vector-set! v 0 10)`** — writing directly into position `0`, in one step, regardless of the vector's size.
- **`(vector-set! v 2 99)`** — writing directly into position `2`, confirming this isn't limited to the first position — any index is reachable identically.
- **`(vector-ref v 2)`** — reading position `2` back, in one step, confirming the write succeeded.
- **`#(10 0 99 0 0)`** — Scheme's own printed notation for a vector, `#(...)`, distinct from a list's `(...)`, confirming this is genuinely a different kind of structure, not merely a list in disguise.

### CS Lens

This is the fundamental difference between indexed, direct-access storage and sequential, walk-from-the-front storage — the same distinction between an array and a linked list found in essentially every programming language. Also recognized in: a hotel's room numbering, letting a guest go directly to room `214` without passing through every room before it; a parking garage's numbered spaces, letting a driver go directly to space `47`; a spreadsheet's cell references, letting a formula reference `C12` directly rather than counting cells from `A1`.

### SE Lens

The alternative to isolating vectors in their own throwaway lab is to introduce `make-vector`, `vector-set!`, and `vector-ref` for the first time inside `table-fib` itself, where their behavior would be tangled up with `fib`'s own logic. The real cost of that alternative is exactly what this curriculum's Concept Isolation Rule has guarded against since Lesson 3: a bug in `table-fib` becomes ambiguous between "the vector operations were misunderstood" and "the algorithm was designed wrong." Isolating it first, as this unit does, costs five small lines and one real run; it means Concept Unit 3's real code can be trusted to reveal only algorithmic issues, not syntax confusion.

---

## Concept Unit 3: Building Bottom-Up — table-fib, Real Code

### The Problem

With vectors isolated and understood, `table-fib` can be built directly: instead of starting from the question asked and recursing toward base cases (`memo-fib`'s top-down approach), start from the base cases themselves and work upward, filling in the table in order, so every entry a later step needs already exists.

### The New Code — Type It Yourself

```scheme
(define (table-fib n)
  (let ((table (make-vector (+ n 1) 0)))
    (vector-set! table 0 0)
    (if (> n 0) (vector-set! table 1 1))
    (let loop ((i 2))
      (if (<= i n)
          (begin
            (vector-set! table i (+ (vector-ref table (- i 1)) (vector-ref table (- i 2))))
            (loop (+ i 1)))))
    (vector-ref table n)))
```

### The Updated Project

This is `table-fib.scm`, in full:

```scheme
(define (table-fib n)
  (let ((table (make-vector (+ n 1) 0)))
    (vector-set! table 0 0)
    (if (> n 0) (vector-set! table 1 1))
    (let loop ((i 2))
      (if (<= i n)
          (begin
            (vector-set! table i (+ (vector-ref table (- i 1)) (vector-ref table (- i 2))))
            (loop (+ i 1)))))
    (vector-ref table n)))

(display (table-fib 10))
(newline)
(display (table-fib 50))
(newline)
```

### Reference Source

Concept Unit 2's isolated vector operations, applied to the bottom-up algorithm this unit describes: a table sized for every value from `0` to `n`, the two base cases (Lesson 29) filled in directly, then every remaining position filled in order from `2` up to `n`, each one computed from the two positions immediately before it — exactly `fib`'s own recurrence (Lesson 29), applied in the opposite direction from `memo-fib`'s.

### Files affected

Created: `table-fib.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile table-fib.scm
55
12586269025
```

Verified this session — `table-fib(10) = 55` and `table-fib(50) = 12586269025`, matching `fib` and `memo-fib`'s already-established values exactly.

### Mechanical Walkthrough

- **`(let ((table (make-vector (+ n 1) 0))) ...)`** — creating the table itself, sized `n + 1` so every index from `0` to `n` has a position, each starting at `0`.
- **`(vector-set! table 0 0)`** and **`(if (> n 0) (vector-set! table 1 1))`** — filling in the two base cases directly, exactly `fib`'s own base cases (Lesson 29), guarded so `table-fib(0)` doesn't attempt to write a nonexistent position `1`.
- **`(let loop ((i 2)) ...)`** — the named-`let` looping idiom (Lesson 39, Lesson 51), starting the fill-in process at index `2`, the first position not already handled by the base cases.
- **`(if (<= i n) (begin ... (loop (+ i 1))))`** — the loop's condition: keep filling positions while `i` hasn't yet passed `n`; when it has, the `let loop` simply returns, having no `else` branch, exactly the way Lesson 39's terminating loops were structured.
- **`(vector-set! table i (+ (vector-ref table (- i 1)) (vector-ref table (- i 2))))`** — the heart of the bottom-up fill: position `i` is computed directly from positions `i - 1` and `i - 2`, both already filled in by the time this line runs, since the loop proceeds in increasing order.
- **`(loop (+ i 1))`** — advancing to the next position, continuing the fill.
- **`(vector-ref table n)`** — after the loop completes, every position up to `n` is filled; the final line simply reads the answer directly out of the table.

### CS Lens

This is the bottom-up realization of dynamic programming: instead of a recursive call tree pruned by a cache (Lesson 54's top-down approach), a single, straightforward pass filling in a table in an order guaranteeing every dependency is already available when needed. Also recognized in: filling in a household budget spreadsheet starting from known fixed costs and working toward a final total, rather than starting from the total and working backward; assembling a piece of furniture by building the base first, then each subsequent layer, rather than starting from the finished top; a runner's training log, where each week's target pace is set from the previous weeks already logged, not computed by reasoning backward from race day.

### SE Lens

The alternative to `table-fib`'s explicit, ordered fill is to keep using `memo-fib`'s recursive, cache-checked approach exclusively, since it already works correctly. The real cost of that alternative, as Concept Unit 1 measured, is `assoc`'s linear-scan lookup cost on every single call, plus the ordinary overhead of a real recursive call for every distinct subproblem, neither of which `table-fib`'s straight-line loop incurs. The real cost of *this* unit's alternative — `table-fib` itself — is that it must be told, or must derive, the correct fill order in advance, which is trivial for `fib`'s simple linear dependency but can be genuinely harder to determine for problems whose subproblems depend on each other in more complex patterns. Building both forms directly, as this lesson does, is what makes that tradeoff visible rather than assumed.

---

## Concept Unit 4: Measuring the Two Forms Against Each Other

### The Problem

Both `memo-fib` (Lesson 54) and `table-fib` (this lesson) are now real, correct, independently verified solutions to the identical problem. It's worth measuring them against each other directly, rather than assuming which is faster.

### No isolated lab for this step

This concept has no code of its own to isolate — the direct comparison is demonstrated below, using code already fully built.

### Applying It — Steady-State Timing, Both Forms, Same Input

```
$ guile trials.scm
table-fib(100000) trial 1: 54.519 ms
table-fib(100000) trial 2: 52.784 ms
memo-fib(100000) trial 0: 80.96 ms
memo-fib(100000) trial 1: 80.25 ms
memo-fib(100000) trial 2: 77.556 ms
```

Verified this session, discarding each function's first "cold" trial (JIT/GC warmup noise, consistent with this curriculum's standing measurement discipline) — `table-fib(100000)` settles at roughly `53`–`55` ms; `memo-fib(100000)` settles at roughly `78`–`81` ms. `table-fib` is consistently faster, by close to a third, at this scale.

**Naming why, directly connecting to Concept Unit 1's diagnosis:** every one of `table-fib`'s table accesses is `vector-ref`/`vector-set!` — a single, direct step, regardless of the table's size. Every one of `memo-fib`'s cache accesses is `assoc` — a scan through however many pairs currently exist. At `n = 100,000`, that difference, repeated once per subproblem, is exactly what separates `53` ms from `79` ms.

### Walkthrough

- **The real, repeated-trial timing numbers** — first direct, side-by-side measurement of both fixes built across Lessons 54–55, on identical input, using this curriculum's established discipline of discarding a noisy first trial.
- **The explicit connection back to Concept Unit 1's `assoc`-versus-`vector-ref` diagnosis** — not a new concept, but confirmation that the measured difference has a specific, understood mechanical cause, not merely an observed correlation.

### CS Lens

This is a genuine, controlled comparison between two independently correct solutions to the same problem, distinguished not by whether they're correct — both are — but by the cost profile of the data structure each relies on. Also recognized in: two correct routes to the same destination, one along direct highway access, one requiring a stop at every intersection along the way, both arriving, one consistently faster; two correct filing systems, one with direct-access drawers, one requiring a search through a shared folder, both eventually finding the right document.

### SE Lens

The alternative to measuring both forms directly is to assume the more "clever"-seeming one — `memo-fib`'s cache-checked recursion — must also be the faster one, since it was built first and already delivered a dramatic improvement over plain `fib`. The real cost of that alternative is a real, avoidable performance gap left unnoticed: roughly a third slower, at this scale, for no reason beyond an unexamined assumption. Measuring both directly, as this unit does, costs one more real, repeated-trial comparison; it settles the question with evidence rather than intuition, exactly this curriculum's standing discipline since Lesson 22.

---

## Concept Unit 5: Naming the Pattern — Dynamic Programming

### The Problem

Two lessons have now built two different-shaped, independently correct fixes for one identical, precisely diagnosed problem (Lesson 53's overlapping subproblems). It's worth naming the general pattern both fixes belong to, now that both exist to compare.

### No isolated lab for this step

This concept has no code of its own to isolate — the naming is stated directly below, drawing together everything already built.

### Applying It — Stating the General Pattern

**What both `memo-fib` and `table-fib` actually share:** both solve a problem with overlapping subproblems (Lesson 53) by ensuring each distinct subproblem is computed exactly once, its result recorded somewhere every future need for it can find directly, rather than recomputed.

**How they differ, precisely:** `memo-fib` (Lesson 54) works **top-down** — starting from the actual question asked, `fib(n)`, and recursing toward base cases, checking the cache at each step. `table-fib` (this lesson) works **bottom-up** — starting from the base cases themselves, and filling upward toward `n`, needing no recursion and no cache-checking at all, only a fill order guaranteeing every dependency exists before it's needed.

**The general name for this entire technique, in both its forms:** **dynamic programming** — recording the solution to every distinct subproblem of a problem exhibiting overlapping subproblems, so each is computed only once, whether that recording happens by caching a top-down recursion (Lesson 54) or by filling a bottom-up table (this lesson).

**Stating honestly when each form tends to be preferred, without overclaiming either is always better:** top-down memoization (Lesson 54) is often simpler to derive directly from an already-correct recursive solution, and it only computes subproblems actually needed for the specific question asked. Bottom-up tabulation (this lesson) tends to have lower per-access cost, as Concept Unit 4 measured directly, and avoids recursive call overhead entirely, but it requires knowing (or deriving) a valid fill order in advance, and it computes every subproblem up to `n`, even ones the original question might not have actually needed.

### Walkthrough

- **"solve a problem with overlapping subproblems... computed exactly once"** — the precise, shared definition covering both `memo-fib` and `table-fib`, restated from Lesson 53's own diagnosis.
- **The precise top-down/bottom-up distinction** — not a new concept in mechanism (both mechanisms were already fully built), but the first explicit naming of the direction each already-built solution takes.
- **"dynamic programming"** — the first appearance of the term naming this curriculum has been building toward since Lesson 53's diagnosis, now introduced only after both of its canonical forms have been built, measured, and understood firsthand.
- **The honest, non-overclaiming comparison of when each form tends to be preferred** — the same disciplined, no-single-winner analysis this curriculum modeled in Lesson 36 (`fold` versus `map`) and Lesson 54 (memory traded for time).

### CS Lens

This is the moment a general technique gets named only after it has already been built, twice, in two genuinely different shapes — exactly this curriculum's spiraling design (BRD), where a name is earned through direct construction rather than handed down as vocabulary to memorize first. Also recognized in: a carpenter who has built several joints by hand before learning that "mortise and tenon" is the name for what they've been doing; a cook who has made stock from scratch several times before learning "mise en place" names the preparation discipline already being practiced; a musician who has been voicing chords a particular way before learning "drop-2 voicing" names that specific choice.

### SE Lens

The alternative to naming dynamic programming only now is to have introduced the term back in Lesson 53, as soon as overlapping subproblems were diagnosed, before either fix existed. The real cost of that alternative would have been asking the term to carry meaning before any concrete referent existed for it — exactly the kind of premature vocabulary this curriculum has avoided since Lesson 1. Naming it now, after both `memo-fib` and `table-fib` are real, working, measured code, as this unit does, costs nothing beyond the lessons already built to earn it; it means the term "dynamic programming," from this point forward in the curriculum, refers to two specific, firsthand-built techniques, not an abstract label taken on faith.

---

## Closing

### Connect the pieces

Three lessons, one diagnosed problem, two independently built fixes, and finally a name — traced start to finish:

1. **The diagnosis (Lesson 53):** overlapping subproblems, precisely distinguished from Lesson 51's "same expression written twice," confirmed by real call-count instrumentation.
2. **The first fix, top-down (Lesson 54):** `memo-fib`, caching a recursion with an association list, `144.195` ms collapsing to `0.334` ms at `n = 30`.
3. **A hidden remaining cost, found (this lesson, Unit 1):** `assoc`'s linear-scan lookup, invisible at `n = 30`, measurable at `n = 100,000`.
4. **A new structure, isolated (this lesson, Unit 2):** vectors, offering direct, indexed access, in contrast to a list's walk-from-the-front access.
5. **The second fix, bottom-up (this lesson, Unit 3):** `table-fib`, filling a vector table in dependency order, needing no recursion and no cache-checking.
6. **Both fixes measured against each other (this lesson, Unit 4):** `table-fib` consistently about a third faster at `n = 100,000`, the difference traced directly to `vector-ref`'s constant-time access versus `assoc`'s linear scan.
7. **The general pattern, finally named (this lesson, Unit 5):** dynamic programming — one technique, two directions, both now built firsthand.

Nothing in Unit 5's naming was asserted without Units 1 through 4 having already built and measured the concrete thing being named — exactly the spiraling discipline this entire curriculum has followed since Era I.

### What breaks without this

Suppose a real system needed to solve a problem with genuinely overlapping subproblems — computing optimal routes through a shared road network for many related trips, say — and its author, having read about "dynamic programming" as a term without ever having built both of its forms firsthand, reached for a memoized recursive solution by habit, without ever considering whether a bottom-up table would better fit the problem's actual access pattern. For a small road network, either choice might perform acceptably; at the scale of a real city's network, an unnecessary linear-scan cache lookup repeated across millions of subproblems — exactly Concept Unit 1's diagnosed cost, just larger — could be the difference between a system that responds in an acceptable time and one that doesn't. Having built both forms directly, and measured them against each other honestly the way Concept Unit 4 did, is what makes that choice a deliberate, evidence-based one rather than a reflex.

### Exercises

1. **Observe.** Return to your Lesson 54 exercises' memoized procedure, and state, in prose, what a bottom-up fill order for the identical problem would need to look like — which subproblems would need to be filled in before which others.
2. **Formalize.** Implement a bottom-up, vector-based version of your Exercise 1 procedure, following Concept Unit 3's exact pattern: a sized table, base cases filled directly, then a fill loop proceeding in dependency order.
3. **Explain.** Run your Exercise 2 procedure and confirm its output matches your Lesson 54 memoized version's already-verified results exactly.
4. **Formalize.** Measure your Exercise 2 procedure against your Lesson 54 version, using repeated, steady-state trials on an input large enough for a real difference to appear, the way Concept Unit 4 compared both `fib` forms at `n = 100,000`.
5. **Explain.** State, honestly, which form — top-down or bottom-up — was actually faster for your specific procedure, and explain why, in terms of the actual data structures each relies on, the way Concept Unit 4 explained `table-fib`'s advantage through `vector-ref` versus `assoc` specifically, not through vague intuition.

### Definition of done

- [ ] You can state, precisely, the difference between top-down and bottom-up dynamic programming, using `memo-fib` and `table-fib` as concrete referents for each.
- [ ] You can create, read, and write a vector using `make-vector`, `vector-ref`, and `vector-set!`.
- [ ] You can build a bottom-up, table-based solution to a problem with overlapping subproblems, given a correct fill order.
- [ ] You can measure two independently correct solutions to the same problem against each other, using repeated, steady-state trials, and explain a measured difference in terms of the specific data structures involved.
- [ ] You completed Exercises 1–5 using a procedure of your own, not `fib`.
- [ ] Commit your Exercise 2 bottom-up procedure and your Exercise 4 measurements, with a commit message stating which form was faster for your specific procedure and why.
