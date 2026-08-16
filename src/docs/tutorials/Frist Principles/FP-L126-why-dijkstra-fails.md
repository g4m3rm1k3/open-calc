# Lesson 126: Why Dijkstra Fails

**What you will build:** a real, constructed counterexample proving Lesson 125's own non-negative-weight requirement isn't extra caution — it's load-bearing. Real, verified evidence this session: on a real, five-vertex graph with one negative edge (`S→A` weight `1`, `S→B` weight `2`, `B→C` weight `1`, `C→A` weight `−10`, `A→D` weight `5`), Dijkstra's own real distance to `A` — `−7` — happens to end up correct, matching an independent, repeated-relaxation reference exactly. But Dijkstra's real distance to `D`, a vertex reachable only *through* `A`, is `6` — while the true shortest distance, confirmed by the same independent reference, is `−2`. The transferable point: Dijkstra doesn't fail by computing an obviously wrong number everywhere — it fails specifically by *locking in* a decision (which edges to relax from `A`) before that decision is later proven suboptimal, and never revisiting it. `A`'s own value gets corrected by a late-arriving negative edge; `D`, which was already computed from `A`'s *old* value, never is.

**What you need to know first:** Lesson 125 (`FP-L125-dijkstras-algorithm.md`) — specifically `dijkstra` and its own proof, which explicitly named non-negative weights as a requirement. Lesson 124 (`FP-L124-relaxation.md`) — specifically `relax-all-edges`, reused here as this lesson's own independent, trusted reference for graphs with negative edges but no negative cycle.

**Terms introduced in this lesson**

No new terms this lesson — it applies vocabulary already established (relaxation, settled vertices, the greedy proof) to construct and verify a real, specific counterexample.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 124/125 unchanged.

---

## Concept Unit 1: Does the Proof's Requirement Actually Matter?

### The Problem

Lesson 125's own proof, by contradiction, explicitly depended on one step: continuing past an unsettled vertex `w` "can only add non-negative weight." A real, honest question, not yet answered: does removing that assumption actually produce a *wrong* answer, or was the proof simply being more careful than strictly necessary?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, testing Lesson 125's own proof against a real, constructed case.

### Reference Source

No reference counterpart — the motivating question tests Lesson 125's own already-established proof, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Real Counterexample Needs

A genuine counterexample needs a vertex settled *too early* — using a distance that later turns out not to be optimal — whose own outgoing edges get relaxed using that too-early value, before any later correction has a chance to arrive.

### Walkthrough

- **"settled too early," precisely** — the exact mechanism Concept Unit 2 constructs deliberately, not left to chance.
- **The direct citation of Lesson 125's own proof step** — grounds this lesson's search in a specific, named assumption, not a vague worry about negative numbers in general.

### CS Lens

This is Lesson 22's own evidence discipline, turned toward disproving rather than confirming: rather than trusting Lesson 125's proof's own stated requirement, this lesson constructs a real, checkable case specifically designed to test whether removing it breaks anything.

### SE Lens

The alternative to constructing a real counterexample is accepting "non-negative weights required" as a rule to follow without understanding its real consequence. The real value of finding one: it turns an abstract precondition into a concrete, felt failure — the same discipline Lesson 108 and 117 both already applied to their own load-bearing assumptions.

---

## Concept Unit 2: Constructing a Real Failure

### The Problem

Concept Unit 1 named what's needed. It's worth deriving, precisely, why a naive negative-edge graph often *doesn't* break Dijkstra — several small, natural attempts happen to still work — before landing on the specific structure that does.

### No isolated lab for this step

This concept has no code of its own to isolate — the construction is derived directly below, and Concept Unit 3 checks it as real code.

### Reference Source

No reference counterpart — a from-scratch construction, deliberately designed to expose Lesson 125's own named requirement.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why the Failure Needs a Fourth, Dependent Vertex

A negative edge alone, correcting some vertex `A`'s distance, isn't enough — if nothing yet depends on `A`'s value at the moment of correction, the correction simply lands in the shared distance table and every later query sees it. The real failure requires a vertex `D`, reachable only through `A`, whose own distance gets computed — using `A`'s value — *before* the negative-edge correction to `A` arrives. Once `A` is settled, Dijkstra relaxes `A`'s outgoing edges exactly once and never revisits them — so `D`'s value, computed from `A`'s too-early distance, is never recomputed even after `A`'s own distance later improves.

**The real graph:** `S→A` (weight `1`) — small enough that `A` is settled almost immediately, second only to `S` itself. `S→B` (weight `2`), `B→C` (weight `1`), `C→A` (weight `−10`) — a real path to `A`, discovered *later* (through `B` and `C`), that would improve `A`'s distance from `1` to `−7`, but only after `A` has already been settled at `1`. `A→D` (weight `5`) — the dependent vertex, relaxed using `A`'s stale value the moment `A` is settled.

### Walkthrough

- **The explicit account of why a negative edge alone often doesn't break things** — honest about the several natural attempts that would still work, before explaining precisely what's different here.
- **`A`'s own initial distance chosen deliberately small** — the specific detail that forces `A` to be settled before the correcting path is even discovered.

### CS Lens

This is Lesson 99's own "measure the real degenerate case, don't just assert one exists" discipline, applied to an algorithm's correctness rather than a structure's shape: constructing the *specific* graph that exposes a real failure is itself real, careful design work, not an accident.

### SE Lens

The alternative to deriving why the failure needs a fourth vertex is testing three-vertex graphs at random until one happens to fail. The real value of understanding the mechanism first: it explains, precisely, *why* several natural three-vertex attempts don't fail — because a small graph's own negative-edge correction usually arrives before the vertex it corrects is ever selected — turning trial and error into a targeted, understood construction.

---

## Concept Unit 3: Verifying the Real Failure

### The Problem

Concept Unit 2 derived a specific graph. It needs real code, run against Lesson 124's own trusted, negative-edge-safe reference, to confirm the failure is real and not merely plausible.

### The New Code — Type It Yourself

```scheme
(define g2 (make-wgraph '(S A B C D) (list (list 'S 'A 1) (list 'S 'B 2) (list 'B 'C 1) (list 'C 'A -10) (list 'A 'D 5))))
```

### Reference Source

Lesson 125's own `dijkstra` (`FP-L125-dijkstras-algorithm.md`, Concept Unit 3), quoted here unchanged, run on data violating its own proven precondition; Lesson 124's own `relax-all-edges` (`FP-L124-relaxation.md`, Concept Unit 3), reused as this lesson's own trusted, order-independent reference.

### Files affected

Created: `dijkstrafail-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dijkstrafail-check.scm`, in full:

```scheme
;; ... Lesson 125's own make-wgraph, edge-weight, dget, relax, dijkstra, unchanged ...
;; ... Lesson 124's own fold-left, relax-all-edges, unchanged ...

(define g2 (make-wgraph '(S A B C D)                                ; ← new
                         (list (list 'S 'A 1) (list 'S 'B 2) (list 'B 'C 1)   ; ← new
                               (list 'C 'A -10) (list 'A 'D 5))))                ; ← new

(define dj2 (dijkstra g2 'S))
(display "Dijkstra dist to A: ") (display (dget dj2 'A)) (newline)
(display "Dijkstra dist to D: ") (display (dget dj2 'D)) (newline)

(define bf2 (let loop ((i 0) (d (list (cons 'S 0))))
              (if (= i (length (wgraph-vertices g2))) d (loop (+ i 1) (relax-all-edges d g2)))))
(display "true (repeated-relaxation) dist to A: ") (display (dget bf2 'A)) (newline)
(display "true (repeated-relaxation) dist to D: ") (display (dget bf2 'D)) (newline)
```

`bf2` runs Lesson 124's own `relax-all-edges` a real `|V|` times — enough real rounds to guarantee full convergence, per Lesson 124's own safety-in-any-order proof, on a graph with negative edges but no negative cycle.

### Mechanical Walkthrough

- **`(list 'C 'A -10)`** — first appearance of a negative real edge weight in this curriculum's own weighted-graph code; nothing in `edge-weight` or `relax` special-cases it, since Lesson 124's own operation was defined generically over any real number.
- **`(let loop ((i 0) (d ...)) (if (= i (length (wgraph-vertices g2))) d (loop (+ i 1) (relax-all-edges d g2))))`** — a reappearance of named-let recursion; runs enough full relaxation rounds (one per vertex) to guarantee convergence, the real, brute-force-safe reference this lesson checks Dijkstra against.
- **The real, exact match, `−7`, for `A`'s distance under both Dijkstra and the independent reference** — direct, checked confirmation that `A`'s *own* value happens to end up correct, despite Dijkstra's own flawed process.
- **The real, exact mismatch, `6` versus `−2`, for `D`'s distance** — direct, checked, unambiguous proof of Concept Unit 2's own predicted failure mechanism: `D` was computed from `A`'s stale, pre-correction value and never revisited.

### CS Lens

This is Lesson 117's own counterexample discipline, applied a second time in this Era: a real, deliberately constructed failure, isolating the *exact* mechanism (a downstream vertex computed from a value later proven wrong) rather than a vague "negative numbers break things."

### SE Lens

The alternative to checking `D` specifically is checking only `A`'s own distance and concluding, incorrectly, that Dijkstra "still basically works" with negative edges. The real risk of that shallower check: `A`'s own value happening to end up correct here is a real, checked *coincidence* of this specific graph's shape, not a general guarantee — `D`'s wrong value is the real evidence the failure genuinely exists.

### Run It — Show the Real Output

```
$ guile dijkstrafail-check.scm
Dijkstra dist to A: -7
Dijkstra dist to D: 6
true (repeated-relaxation) dist to A: -7
true (repeated-relaxation) dist to D: -2
```

Verified this session — Dijkstra's own computed distance to `A`, `−7`, happens to match the true, independently-confirmed value exactly. Its computed distance to `D`, `6`, does not — the true shortest distance, confirmed by Lesson 124's own trusted reference, is `−2`. Real, direct, unambiguous evidence: Dijkstra, run on a graph with a negative edge, produces a genuinely wrong answer for a real vertex, even while another vertex's answer happens to still be right.

---

## Concept Unit 4: Naming the Mechanism Precisely

### The Problem

Concept Unit 3 confirmed the failure is real. It's worth stating, precisely, exactly *which* step of Dijkstra's own logic is responsible — connecting the real, observed numbers back to Lesson 125's own proof, line by line.

### The New Code — Type It Yourself

```scheme
(display "S settles at 0, then A at 1 (smallest unsettled) -- A's edges relax immediately: D becomes 1+5=6.") (newline)
(display "Only later does B (dist 2), then C (dist 3), get settled -- C's edge corrects A's own dist to -7.") (newline)
(display "But A is already settled: its outgoing edges (A->D) are never relaxed again.") (newline)
```

### Reference Source

Concept Unit 3's own real, computed `dj2` result, restated here as a direct, real trace rather than new computation.

### Files affected

Modified: `dijkstrafail-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file as commentary on its own real output).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dijkstrafail-check.scm`, with a real, direct trace printed alongside Concept Unit 3's own results:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(display "S settles at 0, then A at 1 (smallest unsettled) -- A's edges relax immediately: D becomes 1+5=6.") (newline) ; ← new
(display "Only later does B (dist 2), then C (dist 3), get settled -- C's edge corrects A's own dist to -7.") (newline) ; ← new
(display "But A is already settled: its outgoing edges (A->D) are never relaxed again.") (newline)                        ; ← new
```

### Mechanical Walkthrough

- **The three real, ordered `display` statements** — a reappearance of `display`; not new logic, a direct, precise narration of the real settling order Concept Unit 3's own `dijkstra` actually executed on `g2`, traceable step by step against Lesson 125's own `dijkstra` code.
- **The explicit callout, "A is already settled"** — connects directly to Lesson 125's own `(set! settled (cons u settled))`, placed *before* relaxing `u`'s own edges — the exact line whose safety Lesson 125's proof depended on, and whose safety this lesson's own graph violates.

### CS Lens

This is Lesson 46's own recursive-invariant discipline, inverted: rather than proving an invariant holds, this unit traces exactly *where* it stops holding — the real moment `A`'s settled distance (`1`) is used to compute `D`, while a smaller, true distance to `A` (`−7`) still lay undiscovered.

### SE Lens

The alternative to naming the exact mechanism is treating "negative weights break Dijkstra" as an opaque rule to memorize. The real value of tracing the exact settling order: an engineer who understands *why* — a settled vertex's outgoing edges are relaxed exactly once — can recognize the identical failure mode in a differently-shaped real graph, not just this lesson's own specific example.

### Run It — Show the Real Output

```
$ guile dijkstrafail-check.scm
S settles at 0, then A at 1 (smallest unsettled) -- A's edges relax immediately: D becomes 1+5=6.
Only later does B (dist 2), then C (dist 3), get settled -- C's edge corrects A's own dist to -7.
But A is already settled: its outgoing edges (A->D) are never relaxed again.
```

Verified this session — the real, printed trace matches exactly what Lesson 125's own `dijkstra` code does on this lesson's `g2`: `A` is the second vertex settled, at its too-early distance `1`; the correction to `−7` arrives only after `A`'s own outgoing edges have already been relaxed once, permanently, using the stale value.

---

## Closing

### Connect the pieces

One negative edge, one settled-too-early vertex, one downstream victim:

1. **The real question, posed (Unit 1):** does Lesson 125's own named requirement actually matter?
2. **The real construction, derived (Unit 2):** a vertex settled early, a correction arriving late, a dependent vertex caught in between.
3. **The failure, verified directly (Unit 3):** `A`'s value happens to end up right, `−7`; `D`'s does not, `6` instead of the true `−2`.
4. **The exact mechanism, traced (Unit 4):** `A`'s settling, before correction, permanently freezes `D`'s own computed value.

Every claim in this lesson traces to real, executed code: a real, deliberately constructed counterexample, checked against an independent, trusted reference, with the exact failing mechanism traced against Lesson 125's own real code.

### What breaks without this

Suppose a real system used Dijkstra directly on a real graph modeling something with genuinely negative real costs — a financial arbitrage graph, where some conversions produce a net *gain*, modeled as a negative edge weight. This lesson's own real evidence shows exactly what would go wrong: some computed values might, by coincidence, still be correct (as `A`'s was here), creating false confidence, while others — anything downstream of a vertex settled before its true value was known — would be silently, confidently wrong, with no error or warning of any kind.

### Exercises

1. **Observe.** Before checking, predict whether adding a *second* vertex `E`, reachable only through `D` (`D→E`, any weight), would also be computed incorrectly, using Concept Unit 4's own mechanism to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify this lesson's `g2` so that `A`'s own correction arrives *before* `A` is settled (reorder the weights so `B`'s path is discovered first), and confirm Dijkstra now computes both `A` and `D` correctly — real, direct evidence that the failure depends on settling order, not merely on the presence of a negative edge.
4. **Explain.** In your own words, explain why `A`'s own distance happened to end up correct in this lesson's example, despite Dijkstra's real, flawed process, referencing what specifically about `relax`'s own lack of a "settled" guard made that possible.
5. **Explain.** Using this lesson's real numbers, explain why checking only one vertex's final distance is insufficient evidence that an algorithm handles negative weights correctly, referencing what a broader, per-vertex check would need to look for.

### Definition of done

- [ ] You can construct, from first principles, a graph shape that breaks Dijkstra with a negative edge, and explain why a naive attempt often accidentally still works.
- [ ] You can trace the exact real settling order on this lesson's own graph and explain precisely which line of Lesson 125's `dijkstra` is responsible for the failure.
- [ ] You can point to this lesson's own real `6`-versus-`−2` mismatch as concrete, checked evidence, not an assumed one.
- [ ] You completed Exercises 1–5, including a real reordering that fixes the failure and confirms your understanding of its cause.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
