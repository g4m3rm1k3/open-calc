# Lesson 132: Greedy Algorithms

**What you will build:** an explicit, real, abstract `greedy-build` procedure — the shared shape underneath Kruskal, Prim, and Dijkstra, extracted and proven faithful to Lesson 130's own real result — plus real, direct proof that the *shape* alone guarantees nothing at all without the right comparison quantity. Real, verified evidence this session: driving `greedy-build` with Kruskal's own real comparison (standalone edge weight) reproduces Lesson 130's own exact real result, weight `6`, the identical three edges. Driving the *identical* abstract shape with a different, plausible-looking comparison — a distance-like quantity, not a standalone edge weight — produces a real, checked, wrong answer: weight `8`, not the true minimum. The transferable point: "greedy" isn't a guarantee, it's a *shape* — commit to a locally-best choice, never reconsider it — and this lesson names precisely the one real property (the **greedy-choice property**) that decides whether a given comparison, poured into that shape, actually produces a correct answer.

**What you need to know first:** Lesson 125 (`FP-L125-dijkstras-algorithm.md`), Lesson 130 (`FP-L130-kruskals-algorithm.md`), and Lesson 131 (`FP-L131-prims-algorithm.md`) — specifically their own real algorithms, all reused directly as concrete instances of this lesson's own abstraction.

**Terms introduced in this lesson**

- **Greedy algorithm** — an algorithm that builds a solution incrementally, at every step choosing whatever looks locally best right now, and never reconsidering that choice afterward. It exists to name, precisely, the shared shape Dijkstra, Kruskal, and Prim all already used, without ever naming it directly.
- **Greedy-choice property** — the specific condition a problem must satisfy for a greedy algorithm to be correct: a locally-optimal first choice must always be extendable into *some* globally-optimal solution, never ruling one out. It exists to separate "this shape feels reasonable" from "this shape is provably correct for this specific problem."

**Objects and methods used**

No new objects or methods this lesson — `sort`, `filter`, `cons` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: A Shape Used Three Times, Never Named

### The Problem

Dijkstra, Kruskal, and Prim all share an identical real shape: build a solution one piece at a time, always taking whatever looks cheapest right now, and never revisit that decision. None of the three lessons that derived them ever named this shape directly — each proof stood on its own. A real risk, left unaddressed: "greedy" sounds like a generically reasonable strategy, and Lesson 129 already showed that applying the *wrong* greedy comparison to a real problem (Dijkstra's own distance-based rule, misapplied to MST) produces a real, wrong answer.

### No isolated lab for this step

This concept has no code of its own to isolate — the shared shape is posed directly here, connecting Lesson 125, 130, and 131's own already-built algorithms.

### Reference Source

No reference counterpart — the motivating pattern draws on Lesson 125, 130, and 131's own already-built code, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Naming the Shape Precisely Would Buy

A precise name for the shared shape, separated cleanly from any one specific comparison rule, would let this curriculum ask a single, general question — "does the greedy-choice property hold here" — once per new problem, rather than re-deriving an entire new proof from first principles every time, the way Lesson 125, 130, and 131 each did independently.

### Walkthrough

- **The direct citation of all three algorithms by name** — grounds the pattern in real, already-verified code, not a new, abstract claim.
- **The direct citation of Lesson 129's own real counterexample** — a concrete warning that the shape alone (as Concept Unit 3 will prove directly) does not guarantee correctness.

### CS Lens

This is Lesson 2's own "turning ambiguity into precision" move, applied retroactively across three lessons at once: a pattern used correctly, three separate times, without ever being named, made nameable now that enough real instances exist to generalize from safely.

### SE Lens

The alternative to naming the shared shape is treating each new greedy-shaped algorithm as an unrelated, from-scratch derivation. The real cost of that separation: Lesson 133's upcoming proof technique (exchange arguments) would have to be re-explained for every future greedy algorithm individually, rather than taught once, generally, and applied.

---

## Concept Unit 2: Defining the Pattern and Its One Real Requirement

### The Problem

Concept Unit 1 named the shared shape informally. It needs a precise definition, and a precise statement of the one property that actually decides whether a given instance of the shape is correct.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation abstracting Lesson 125, 130, and 131's own already-established algorithms.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Shape, and the Property That Justifies It

**Greedy algorithm, precisely:** repeatedly select the locally-best remaining candidate, according to some comparison rule, commit to it irrevocably, and continue — Dijkstra's settled vertices, Kruskal's accepted edges, and Prim's grown tree are all real instances of exactly this shape.

**Greedy-choice property, precisely:** a problem admits a *correct* greedy solution using a given comparison rule only if committing to the locally-best candidate, at every step, never rules out reaching some globally-optimal final answer. Lesson 125's own proof by contradiction and Lesson 130's own correctness (checked against a trusted brute-force reference) were both, implicitly, proofs that this property holds — for their own specific problem and their own specific comparison rule, never claimed more generally than that.

**Why the shape alone proves nothing:** the identical greedy shape, driven by *any* comparison rule at all — including one that doesn't satisfy the greedy-choice property for the problem at hand — will still run to completion and produce *some* answer. Nothing about the shape itself checks whether that answer is actually optimal.

### Walkthrough

- **Three real instances named directly in the definition itself** — the definition is built from already-verified examples, not stated abstractly first.
- **"nothing about the shape itself checks"** — the precise warning Concept Unit 3's own real code demonstrates directly.

### CS Lens

This is Lesson 66's own "confirmed, not merely plausible" standard, applied to a whole category of algorithms rather than one: "greedy" is a real, useful pattern name, but naming a pattern is not the same as proving every instance of it correct — exactly the gap Lesson 133's upcoming exchange-argument technique exists to close, problem by problem.

### SE Lens

The alternative to stating the greedy-choice property precisely is trusting that "greedy" algorithms are generally reliable because several real ones (Dijkstra, Kruskal, Prim) already worked. The real risk of that generalization: Lesson 134's own upcoming subject is real, concrete cases where the *identical* greedy shape, applied to a *different* problem, produces a confidently wrong answer — precisely because the greedy-choice property fails to hold there.

---

## Concept Unit 3: Extracting and Verifying the Real Abstraction

### The Problem

Concept Unit 2 defined the pattern. It's worth building it as real, working code — a genuine abstraction, not just a description — and checking it against Lesson 130's own already-trusted result.

### The New Code — Type It Yourself

```scheme
(define (greedy-build candidates weight-fn valid? combine initial)
  (let loop ((cs (sort candidates (lambda (a b) (< (weight-fn a) (weight-fn b))))) (state initial))
    (if (null? cs)
        state
        (if (valid? state (car cs))
            (loop (cdr cs) (combine state (car cs)))
            (loop (cdr cs) state)))))
```

### Reference Source

Lesson 130's own `kruskal` and its own real graph, `uedges`/`uverts` (`FP-L130-kruskals-algorithm.md`, Concept Unit 3), reused here as this lesson's own direct correctness check.

### Files affected

Created: `greedy-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `greedy-check.scm`, in full:

```scheme
(define (greedy-build candidates weight-fn valid? combine initial)             ; ← new
  (let loop ((cs (sort candidates (lambda (a b) (< (weight-fn a) (weight-fn b))))) (state initial)) ; ← new
    (if (null? cs)                                                                ; ← new
        state                                                                        ; ← new
        (if (valid? state (car cs))                                                    ; ← new
            (loop (cdr cs) (combine state (car cs)))                                       ; ← new
            (loop (cdr cs) state)))))                                                         ; ← new

(define (make-uf n) (let ((p (make-vector n))) (let loop ((i 0)) (if (< i n) (begin (vector-set! p i i) (loop (+ i 1))))) p))
(define (uf-find p x) (let loop ((x x)) (if (= (vector-ref p x) x) x (loop (vector-ref p x)))))

(define uedges (list (list 'A 'B 1) (list 'A 'C 4) (list 'B 'C 2) (list 'B 'D 5) (list 'C 'D 3)))
(define uverts '(A B C D))
(define (vidx v) (- (length uverts) (length (member v uverts))))

(define kruskal-via-abstract
  (greedy-build uedges
                caddr
                (lambda (state e)
                  (let* ((uf (car state)) (ra (uf-find uf (vidx (car e)))) (rb (uf-find uf (vidx (cadr e)))))
                    (if (= ra rb) #f (begin (vector-set! uf ra rb) #t))))
                (lambda (state e) (cons (car state) (cons e (cdr state))))
                (cons (make-uf 4) '())))

(display "Kruskal via the abstract greedy-build: ") (display (cdr kruskal-via-abstract)) (newline)
(display "total real weight: ") (display (apply + (map caddr (cdr kruskal-via-abstract)))) (newline)
```

`greedy-build` is Concept Unit 2's own definition, executed exactly: sort candidates by the given weight function once, then walk them in order, keeping a real, running `state` — accepting a candidate via `combine` when `valid?` allows it, skipping it otherwise. Instantiating it for Kruskal means supplying `caddr` (real edge weight) as the comparison, and Lesson 130's own Union-Find check as `valid?`.

### Mechanical Walkthrough

- **`weight-fn`, `valid?`, `combine`, `initial`** — first appearance of a procedure parameterized entirely by *other procedures*, the literal mechanism that makes `greedy-build` genuinely reusable rather than specific to any one problem.
- **`(sort candidates (lambda (a b) (< (weight-fn a) (weight-fn b))))`** — a reappearance of `sort`; the one, shared step every real instance of this shape performs identically — order candidates by whatever "locally best" means for this specific problem.
- **`(if (valid? state (car cs)) (loop (cdr cs) (combine state (car cs))) (loop (cdr cs) state))`** — a reappearance of `if`; the entire greedy commitment, made generic: accept and combine, or reject and move on, with no way to reconsider a rejected candidate later.
- **The real, exact match between `kruskal-via-abstract`'s own result and Lesson 130's own direct `kruskal` result, weight `6`, the identical three edges** — direct, checked confirmation that this lesson's abstraction is faithful to the already-verified algorithm it's extracted from, not merely similar to it.

### CS Lens

This is Lesson 78's own divide-and-conquer template made concrete a second time in this curriculum: `greedy-build` is a genuine, real *template*, parameterized by the pieces that differ between problems (comparison, validity, combination) while keeping the piece that's genuinely shared (the loop itself) written exactly once.

### SE Lens

The alternative to extracting a real, working abstraction is describing the shared shape only in prose, as Concept Unit 1 and 2 do. The real value of Concept Unit 3's own code: it's a genuine, checkable claim — "these three algorithms are literally the same template, differently parameterized" — not merely an analogy, confirmed by matching Lesson 130's own real result exactly.

### Run It — Show the Real Output

```
$ guile greedy-check.scm
Kruskal via the abstract greedy-build: ((C D 3) (B C 2) (A B 1))
total real weight: 6
```

Verified this session — `greedy-build`, driven by Kruskal's own real comparison and validity rule, reproduces Lesson 130's exact real result, the identical three edges and total weight `6` — real, checked confirmation that this lesson's abstraction genuinely captures the shared shape, not merely resembles it.

---

## Concept Unit 4: The Shape Alone Guarantees Nothing

### The Problem

Concept Unit 3 confirmed the abstraction is faithful. It's worth proving, directly and concretely, Concept Unit 2's own warning: the identical shape, driven by a different comparison rule, can produce a real, wrong answer.

### The New Code — Type It Yourself

```scheme
(define (mock-dijkstra-quantity e) (+ (if (equal? (car e) 'A) 0 100) (caddr e)))
```

### Reference Source

No reference counterpart — a deliberately constructed comparison rule, built specifically to violate the greedy-choice property for MST, contrasted directly against Concept Unit 3's own correct `caddr` comparison.

### Files affected

Modified: `greedy-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `greedy-check.scm`, extended with a real, deliberately wrong comparison:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (mock-dijkstra-quantity e) (+ (if (equal? (car e) 'A) 0 100) (caddr e)))    ; ← new
(define wrong-via-abstract                                                             ; ← new
  (greedy-build uedges                                                                    ; ← new
                mock-dijkstra-quantity                                                       ; ← new
                (lambda (state e)                                                               ; ← new
                  (let* ((uf (car state)) (ra (uf-find uf (vidx (car e)))) (rb (uf-find uf (vidx (cadr e))))) ; ← new
                    (if (= ra rb) #f (begin (vector-set! uf ra rb) #t))))                                        ; ← new
                (lambda (state e) (cons (car state) (cons e (cdr state))))                                          ; ← new
                (cons (make-uf 4) '())))                                                                               ; ← new
(display "same shape, wrong comparison quantity -- real weight: ")
(display (apply + (map caddr (cdr wrong-via-abstract)))) (newline)
```

`mock-dijkstra-quantity` is a real, deliberately different comparison — favoring edges starting at `A` regardless of their own real weight — a plausible-*looking* rule that isn't standalone edge weight, run through the *identical* `greedy-build`, `valid?`, and `combine` as Concept Unit 3's own correct Kruskal instance.

### Mechanical Walkthrough

- **`(+ (if (equal? (car e) 'A) 0 100) (caddr e))`** — a reappearance of `+`, `if`, `equal?`; a real, computable quantity, but not the one Lesson 129's own Concept Unit 4 identified as the correct comparison for MST.
- **Every other argument to `greedy-build` left completely unchanged** — isolates the comparison rule as the *only* real variable, exactly Lesson 124's own single-changed-line discipline.
- **The real, exact `8`, not the true minimum `6`** — direct, checked proof that `greedy-build`'s own shape ran to completion, produced a real, well-formed spanning tree, and still got the real answer wrong — because this specific comparison doesn't satisfy the greedy-choice property for this specific problem.

### CS Lens

This is Lesson 126's own counterexample discipline, applied to an entire pattern rather than one algorithm: proving that a *shape* alone is insufficient requires a real, executed case where the shape runs correctly and the answer is still wrong — precisely what this unit constructs and checks.

### SE Lens

The alternative to constructing a real, wrong-comparison instance is trusting Concept Unit 2's own stated warning without demonstrating it. The real value of the constructed failure: it turns "the greedy-choice property matters" from an assertion into a directly observed, `8`-versus-`6` real discrepancy — the same standard this curriculum has held every other claim to since Lesson 22.

### Run It — Show the Real Output

```
$ guile greedy-check.scm
same shape, wrong comparison quantity -- real weight: 8
```

Verified this session — the identical `greedy-build` template, run with a plausible-looking but incorrect comparison rule, produces a real spanning tree of weight `8`, not the true minimum, `6` — direct, checked proof that the greedy *shape* alone guarantees nothing; only a comparison rule that genuinely satisfies the greedy-choice property does.

---

## Closing

### Connect the pieces

One template, one correct instance, one deliberately wrong one:

1. **The shared shape, named (Unit 1):** Dijkstra, Kruskal, and Prim all already used it, unnamed.
2. **The pattern and its real requirement, defined (Unit 2):** the greedy-choice property, precisely — not a property of the shape, a property of the *comparison rule* for a *specific* problem.
3. **The real abstraction, extracted and verified (Unit 3):** `greedy-build`, checked to exactly reproduce Lesson 130's own trusted Kruskal result.
4. **The shape's own insufficiency, proven directly (Unit 4):** the identical template, wrong comparison, real weight `8` instead of the true `6`.

Every claim in this lesson traces to real, executed code: a real abstraction checked against an already-trusted algorithm, and a real, constructed counterexample proving the abstraction's shape alone cannot guarantee correctness.

### What breaks without this

Suppose an engineer, having successfully built one greedy algorithm for one real problem, assumed the *pattern itself* — sort candidates, greedily accept the locally best, never reconsider — would transfer safely to a new, different optimization problem, without checking whether the greedy-choice property actually holds there. This lesson's own real evidence, Concept Unit 4's constructed `8`-versus-`6` gap, is direct, checked proof that assumption can fail — the algorithm runs, produces a well-formed answer, and that answer is simply wrong, with nothing about the *process* itself signaling the error.

### Exercises

1. **Observe.** Before checking, predict whether `greedy-build`, instantiated with Prim's own logic instead of Kruskal's (candidates recomputed at each step rather than pre-sorted once), would fit this lesson's own template as written, or would need real changes to `greedy-build` itself.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — either fit Prim into the existing template, or explain precisely what about `greedy-build`'s own structure would need to change.
3. **Formalize.** Construct a second, different wrong comparison rule (not `mock-dijkstra-quantity`) for this lesson's own graph, and confirm whether it also produces a suboptimal real result.
4. **Explain.** In your own words, explain why `greedy-build`'s own `sort` step happens exactly once, at the very start, rather than being recomputed at every iteration, referencing which of this lesson's three real algorithms this specific detail matches, and which it doesn't.
5. **Explain.** Using this lesson's real numbers, state the greedy-choice property in your own words, and explain precisely why `caddr` (standalone edge weight) satisfies it for MST while `mock-dijkstra-quantity` does not.

### Definition of done

- [ ] You can state the definition of a greedy algorithm and the greedy-choice property, and explain why they're two separate claims.
- [ ] You can explain why `greedy-build` running to completion and producing a well-formed answer is not, by itself, evidence that answer is optimal.
- [ ] You can point to this lesson's own real `6`-versus-`8` numbers as concrete, checked evidence for both halves of this lesson's claim.
- [ ] You completed Exercises 1–5, including a real, second wrong-comparison construction.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
