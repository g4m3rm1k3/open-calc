# Lesson 107: Union-Find

**What you will build:** a `UnionFind` (Disjoint-Set) abstract data type, following Lesson 84's contract format, representing a collection of elements partitioned into equivalence classes that can be *merged* over time — implemented as a real parent-pointer forest over a fixed-size vector. Real, verified evidence this session: after `union(0,1)`, `union(2,3)`, `union(1,2)`, elements `0` through `3` all resolve to the identical real representative, `3`, while `4` and `5` remain their own separate groups — a real, checked partition, not an assumed one. Built naively — always attaching one group's root under the other's, with no rule governing which — a deliberately adversarial sequence of `n − 1` unions produces a real, measured chain: finding element `0`'s representative costs exactly `99`, `999`, and `9,999` real parent-pointer hops at `n = 100`, `1,000`, and `10,000`, matching `n − 1` exactly at every scale. The transferable point: this is Lesson 99's own degenerate-tree finding, encountered a second time in a structurally unrelated representation — a real invariant (correctly identifying which elements are equivalent) holding perfectly while the tree's actual shape degrades to a list, and Lesson 108 exists specifically to fix it.

**What you need to know first:** Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically the ADT contract format, reused directly for this lesson's four operations. Lesson 17 (`FP-L017-relations.md`) — specifically *reflexive*, *symmetric*, and *transitive*, the three properties this lesson's equivalence classes are built from. Lesson 99 (`FP-L099-degenerate-trees.md`) — specifically the real, measured finding that a correct invariant doesn't guarantee good shape, the direct structural parallel this lesson's own Concept Unit 4 reproduces in a new representation. Lesson 85 (`FP-L085-arrays.md`) — specifically array indexing, reused as this lesson's own storage.

**Terms introduced in this lesson**

- **Equivalence class** — a group of elements all related to each other under a relation that is reflexive, symmetric, and transitive (Lesson 17) — "in the same group as," precisely. It exists to name the specific kind of grouping this lesson's structure maintains: not an arbitrary relation, but one guaranteed to partition every element into non-overlapping groups with no other possible shape.
- **Union-Find (Disjoint-Set)** — an abstract data type maintaining a partition of elements into equivalence classes, supporting merging two classes into one and asking whether two elements are currently in the same class. It exists to make "merge these two groups" itself a cheap, direct operation, which Lesson 91's `Set`/`Map` were never built to support.
- **Representative** — the one element within an equivalence class chosen to stand for the whole class; two elements are in the same class exactly when they share the identical representative. It exists so "same group" can be checked by comparing two single values, rather than by comparing entire group memberships.
- **Parent-pointer forest** — a representation where every element stores a reference to one other element, its parent, and a chain of parents eventually reaches an element that is its own parent — that element is the group's representative. It exists because following a chain of parent pointers to its end is a direct, mechanical way to compute a representative from any starting element.

**Objects and methods used**

- **`make-vector`**
  - *What it is:* a real Scheme procedure creating a new vector of a given length.
  - *Implementation:* takes a length, returns a fresh vector; reappearing from Lesson 55, used here as `(make-vector n)`.
  - *Its use:* allocates the fixed-size parent-pointer array, one slot per element in the universe being partitioned.
- **`vector-ref`**
  - *What it is:* a real Scheme procedure reading a vector's stored value at a given index.
  - *Implementation:* takes a vector and an index, returns the value stored there; reappearing from Lesson 55/85, used as `(vector-ref parent x)`.
  - *Its use:* reading an element's current parent, the single step repeated by `uf-find`'s own walk.
- **`vector-set!`**
  - *What it is:* a real Scheme procedure that mutates a vector, writing a new value into a given index.
  - *Implementation:* takes a vector, an index, and a value, mutating the vector in place; reappearing from Lesson 55/85, used as `(vector-set! parent i i)` and `(vector-set! parent ra rb)`.
  - *Its use:* initializing every element as its own parent, and, in `uf-union!`, attaching one group's representative under another's.

---

## Concept Unit 1: A Question Sets and Maps Were Never Built For

### The Problem

Lesson 91's `Set` can answer "is `x` present." Its `Map` can answer "what value goes with key `k`." Neither was built to answer a question that changes *relationships between elements over time*: given a growing stream of "these two things are actually the same group" facts — two social media accounts turning out to belong to the same person, two labeled regions of an image turning out to be connected, two variables turning out to be constrained equal — how should "are `x` and `y` currently known to be in the same group" be answered efficiently, as new merge facts keep arriving?

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating question is posed directly here, contrasting with Lesson 91's own `Set`/`Map` operations.

### Reference Source

No reference counterpart — the motivating problem is posed directly, contrasting with Lesson 91's already-built ADTs rather than any external implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why Merging Is the Genuinely New Operation

A `Set`-based approach could tag every element with a group ID and answer "same group" by comparing tags — but *merging* two groups under that scheme means walking every element in one group and rewriting its tag, an operation whose real cost depends on how large the group being relabeled already is. What's needed is a representation where merging two groups costs something closer to a *constant* amount of work, regardless of how large either group has already grown.

### Walkthrough

- **The explicit "relationships changing over time" framing** — separates this lesson's real subject from Lesson 91's static membership questions.
- **The group-ID-and-relabel critique** — previews Concept Unit 2's actual representation by first showing why the obvious alternative doesn't cheaply support the one operation this lesson is built around.

### CS Lens

This is a real instance of choosing a representation specifically to make one dominant operation — here, *merging* — cheap, even at the cost of making another operation (finding a representative) walk a real chain rather than read a single stored tag directly. Also recognized in: a corporate reorg where whole departments get reassigned under a new division by changing one reporting line at the top, rather than updating every individual employee's own paperwork.

### SE Lens

The alternative to a dedicated structure is exactly the group-ID-and-relabel scheme Concept Unit 1 already ruled out: correct, but a single merge can cost real work proportional to the size of the group being relabeled — for a real system processing many merges over time, that cost compounds directly with how large groups have already grown by the time a merge happens.

---

## Concept Unit 2: Defining the ADT and Deriving Its Representation

### The Problem

Concept Unit 1 named the requirement. It needs a precise ADT, in Lesson 84's own contract format, plus a representation genuinely capable of making merging cheap.

### No isolated lab for this step

This concept has no code of its own to isolate — the contract and representation are derived directly below, and Concept Unit 3 implements and verifies them as real code.

### Reference Source

No reference counterpart — a from-scratch ADT and representation, derived from Concept Unit 1's own requirement.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Contract, Then the Structure That Satisfies It

**The Union-Find ADT, precisely:**

- **`make-uf(n)`** — *requires:* `n` is a non-negative integer. *guarantees:* returns a structure representing `n` elements, `0` through `n − 1`, each initially in its own, separate group of size one.
- **`uf-find(uf, x)`** — *requires:* `x` is one of the `n` elements. *guarantees:* returns `x`'s group's representative — the identical value for every element currently in the same group as `x`.
- **`uf-union!(uf, a, b)`** — *requires:* `a` and `b` are elements of `uf`. *guarantees:* merges `a`'s and `b`'s groups into one; every element formerly in either group now shares one common representative.
- **`uf-same-group?(uf, a, b)`** — *requires:* `a` and `b` are elements of `uf`. *guarantees:* returns true exactly when `a` and `b` currently share a representative.

**Deriving the parent-pointer forest:** represent the `n` elements as a single vector, `parent`, where `parent[i]` holds the index of `i`'s own parent. Initially, `parent[i] = i` for every `i` — every element is its own parent, meaning every element starts as its own group's representative. `uf-find(uf, x)` walks: read `parent[x]`; if it equals `x`, `x` is already a representative — return it; otherwise, continue from `parent[x]`. `uf-union!(uf, a, b)` finds each argument's current representative and makes one the other's parent directly — `parent[uf-find(a)] = uf-find(b)` — merging the two entire groups in exactly one write, regardless of either group's size.

**Why this satisfies Concept Unit 1's real requirement:** `uf-union!` costs one `uf-find` walk per argument plus one `vector-set!` — genuinely independent of how many elements belong to either group, unlike the group-ID-and-relabel scheme's real per-element cost.

### Walkthrough

- **Each operation as a *requires*/*guarantees* contract** — a direct reapplication of Lesson 84's own format.
- **`parent[i] = i` as the "no merges yet" starting state** — every element its own representative, mirroring Lesson 97's own use of an explicit base case before any structure has been built up.
- **The one-line `uf-union!` — `parent[uf-find(a)] = uf-find(b)`** — the literal mechanism that makes merging cost independent of group size, previewing Concept Unit 3's real code.

### CS Lens

This is Concept Unit 1's own design goal made concrete: the entire cost of merging two groups, however large, is pushed onto *finding* their representatives, an operation whose real cost this lesson's own Concept Unit 4 measures honestly rather than assumes is cheap. Also recognized in: a company merger completing legally the moment one holding company's ownership is reassigned to another, with every subsidiary's own real reporting chain updated implicitly, not by rewriting each subsidiary's paperwork individually.

### SE Lens

The alternative representation is a flat array of *group IDs* (Concept Unit 1's rejected scheme), where `uf-find` is a single array read — cheap — but `uf-union!` must relabel every element in one group — expensive, proportional to group size. The parent-pointer forest makes the opposite trade deliberately: `uf-union!` becomes cheap, uniformly, at the real cost of `uf-find` sometimes needing to walk a chain — a chain whose real length, this lesson's own Concept Unit 4 shows, depends entirely on the order unions happen to arrive in.

---

## Concept Unit 3: Implementing and Verifying Union-Find

### The Problem

Concept Unit 2 derived the contract and representation. It needs real code, and a real check that merging groups actually produces the correct partition — not just plausible-looking output.

### The New Code — Type It Yourself

```scheme
(define (uf-find parent x)
  (let loop ((x x))
    (if (= (vector-ref parent x) x) x (loop (vector-ref parent x)))))
```

### The Updated Project

This is `uf-check.scm`, in full:

```scheme
(define (make-uf n)
  (let ((parent (make-vector n)))
    (let loop ((i 0)) (if (< i n) (begin (vector-set! parent i i) (loop (+ i 1)))))
    parent))

(define (uf-find parent x)                                         ; ← new
  (let loop ((x x))                                                    ; ← new
    (if (= (vector-ref parent x) x) x (loop (vector-ref parent x)))))     ; ← new

(define (uf-union! parent a b)
  (let ((ra (uf-find parent a)) (rb (uf-find parent b)))
    (if (not (= ra rb)) (vector-set! parent ra rb))))

(define (uf-same-group? parent a b) (= (uf-find parent a) (uf-find parent b)))

(define p1 (make-uf 6))
(uf-union! p1 0 1)
(uf-union! p1 2 3)
(uf-union! p1 1 2)
(display "find 0..5 after union(0,1) union(2,3) union(1,2): ")
(display (list (uf-find p1 0) (uf-find p1 1) (uf-find p1 2) (uf-find p1 3) (uf-find p1 4) (uf-find p1 5)))
(newline)
(display "same group? 0 and 3: ") (display (uf-same-group? p1 0 3)) (newline)
(display "same group? 0 and 4: ") (display (uf-same-group? p1 0 4)) (newline)
```

`uf-find` is a tail-recursive walk: it starts at `x` and repeatedly follows `parent` references, stopping the moment it reaches an element whose parent is itself. `uf-union!` calls `uf-find` on both arguments first, then — only if they're not already the same representative — attaches one root directly under the other, merging the two groups in one write.

### Reference Source

No reference counterpart — `make-uf`, `uf-find`, `uf-union!`, and `uf-same-group?` are a from-scratch implementation of Concept Unit 2's derived contract and representation.

### Files affected

Created: `uf-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Mechanical Walkthrough

- **`(make-vector n)`** — a reappearance of `make-vector`; allocates one slot per element, with no fill value specified since every slot is about to be set explicitly.
- **`(let loop ((i 0)) (if (< i n) (begin (vector-set! parent i i) (loop (+ i 1)))))`** in `make-uf` — a reappearance of named-let recursion, `vector-set!`; the base-state initialization Concept Unit 2 derived, every element made its own parent.
- **`(let loop ((x x)) (if (= (vector-ref parent x) x) x (loop (vector-ref parent x))))`** in `uf-find` — first appearance of this specific stopping condition: the walk halts exactly when an element's parent equals itself, the literal test for "this is a representative."
- **`(let ((ra (uf-find parent a)) (rb (uf-find parent b))) ...)`** in `uf-union!` — a reappearance of `let`; computes both representatives once, before deciding whether a merge is even necessary.
- **`(if (not (= ra rb)) (vector-set! parent ra rb))`** — a reappearance of `not`, `=`, `vector-set!`; skips the write entirely when `a` and `b` are already in the same group, and otherwise performs Concept Unit 2's one-line merge.
- **`(= (uf-find parent a) (uf-find parent b))`** in `uf-same-group?` — a reappearance of `=`; the ADT's own membership question, answered by comparing two computed representatives directly.
- **The real, exact match between the predicted partition and the actual `uf-find` results** — direct, checked confirmation that three real unions on six elements produce exactly the four groups Concept Unit 2's contract predicts.

### CS Lens

This is Lesson 97's own invariant-checking discipline, applied to a structure with a genuinely different invariant: instead of BST's per-node ordering, Union-Find's real invariant is that `uf-find` always terminates at a true representative, and that every element sharing a group shares that identical representative — checked here directly against a real, hand-predictable partition rather than assumed correct because the code looks right.

### SE Lens

The alternative to computing both representatives before checking whether they're equal is to merge unconditionally, every time `uf-union!` is called. The real cost of that alternative: merging an element with itself, or re-merging two elements already in the same group, would create a self-referential or redundant parent pointer, silently corrupting the very invariant `uf-find`'s termination depends on — the `(not (= ra rb))` check exists specifically to keep that from happening.

### Run It — Show the Real Output

```
$ guile uf-check.scm
find 0..5 after union(0,1) union(2,3) union(1,2): (3 3 3 3 4 5)
same group? 0 and 3: #t
same group? 0 and 4: #f
```

Verified this session — after `union(0,1)`, `union(2,3)`, `union(1,2)`, elements `0` through `3` all resolve to the identical real representative, `3`, confirming they were correctly merged into one group across two separate `uf-union!` calls; `4` and `5`, never unioned with anything, correctly remain their own separate representatives. `uf-same-group?` confirms both real cases directly: `0` and `3` share a group, `0` and `4` do not.

---

## Concept Unit 4: A Real Degenerate Case — and What It Sets Up

### The Problem

Concept Unit 3 confirmed correctness. It's worth checking, honestly, what this lesson's deliberately naive `uf-union!` — always attaching one root under the other, with no rule governing *which* — does to `uf-find`'s real cost under an adversarial sequence of unions, the same honesty Lesson 99 already applied to a differently-shaped structure.

### The New Code — Type It Yourself

```scheme
(define hops 0)
(define (uf-find-counted parent x)
  (let loop ((x x))
    (if (= (vector-ref parent x) x)
        x
        (begin (set! hops (+ hops 1)) (loop (vector-ref parent x))))))
```

### The Updated Project

This is `uf-cost.scm`, in full — reusing `make-uf`/`uf-union!` from Concept Unit 3 unchanged, with a counted `uf-find` added:

```scheme
(define (make-uf n)
  (let ((parent (make-vector n)))
    (let loop ((i 0)) (if (< i n) (begin (vector-set! parent i i) (loop (+ i 1)))))
    parent))

(define (uf-find parent x)
  (let loop ((x x))
    (if (= (vector-ref parent x) x) x (loop (vector-ref parent x)))))

(define (uf-union! parent a b)
  (let ((ra (uf-find parent a)) (rb (uf-find parent b)))
    (if (not (= ra rb)) (vector-set! parent ra rb))))

(define hops 0)                                                     ; ← new
(define (uf-find-counted parent x)                                     ; ← new
  (let loop ((x x))                                                       ; ← new
    (if (= (vector-ref parent x) x)                                          ; ← new
        x                                                                       ; ← new
        (begin (set! hops (+ hops 1)) (loop (vector-ref parent x))))))            ; ← new

(for-each
 (lambda (n)
   (define parent (make-uf n))
   (let loop ((i 0)) (if (< i (- n 1)) (begin (uf-union! parent i (+ i 1)) (loop (+ i 1)))))
   (set! hops 0)
   (uf-find-counted parent 0)
   (display "n=") (display n) (display " chain-order unions, find(0) real hops=") (display hops) (newline))
 (list 100 1000 10000))
```

Building the chain calls `uf-union! parent i (+ i 1)` for `i` from `0` up to `n − 2`, in order — each call attaches the *current* chain's growing end under the newly-unioned element, since `uf-find` on an already-self-parented element returns immediately. `uf-find-counted` mirrors `uf-find` exactly, adding one `set!` per real hop taken, the identical instrumentation technique Lesson 92 and 104 both already used.

### Reference Source

No reference counterpart — `uf-find-counted` is Concept Unit 3's own `uf-find`, instrumented identically to Lesson 104's counted procedures.

### Files affected

Created: `uf-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Mechanical Walkthrough

- **`(set! hops (+ hops 1))`** — a reappearance of `set!`; counts only genuine parent-pointer hops, not the initial check against `x`'s own parent, the same "count the real work, not every call" discipline Lesson 92's `count-collisions` already established.
- **`(uf-union! parent i (+ i 1))`, called for `i` from `0` to `n − 2`** — first appearance of this specific adversarial pattern: unioning strictly increasing, adjacent pairs in order, the one union sequence guaranteed to build the longest possible chain under this lesson's naive attach rule.
- **The real, exact match between measured hops and `n − 1`** — direct, measured confirmation that the naive representation's worst case is genuinely linear, not merely "sometimes slow."

### CS Lens

This is Lesson 99's own real finding, encountered again in a structurally unrelated representation: a correct invariant (Union-Find's real partition is correct at every step, confirmed by Concept Unit 3) coexisting with a real, measured worst-case shape collapsing to a plain list — proof that "the invariant holds" and "the structure is efficient" are two separate claims, checked separately, exactly as Lesson 99 first established for BSTs.

### SE Lens

The alternative to this lesson's naive attach rule — always union `a`'s root under `b`'s, with no preference — is a rule that tracks each group's real size or height and always attaches the *smaller* one under the *larger* (a real, well-known technique this lesson deliberately doesn't build, to keep Concept Unit 4's degenerate case honestly reachable). The real cost being carried forward, on purpose, is exactly what Concept Unit 4 measured: a genuinely adversarial union order can force `n − 1` real hops on a single `uf-find` call — the concrete, measured problem Lesson 108 exists to solve, from the opposite direction than a smarter attach rule would: not by preventing long chains from forming, but by *shortening them permanently, during the very walk that discovers them*.

### Run It — Show the Real Output

```
$ guile uf-cost.scm
n=100 chain-order unions, find(0) real hops=99
n=1000 chain-order unions, find(0) real hops=999
n=10000 chain-order unions, find(0) real hops=9999
```

Verified this session — building a chain via `n − 1` sequential, adjacent-pair unions and then finding element `0`'s representative costs exactly `99`, `999`, and `9,999` real parent-pointer hops at `n = 100`, `1,000`, and `10,000` — matching `n − 1` exactly at every scale tested, the real, measured worst case this lesson's naive `uf-union!` makes reachable.

---

## Closing

### Connect the pieces

Six elements, three unions, then a real worst case, traced through every unit this lesson built:

1. **The gap, named (Unit 1):** merging groups cheaply is an operation Lesson 91's `Set`/`Map` were never built to support.
2. **The contract and representation, derived (Unit 2):** four operations following Lesson 84's format, satisfied by a parent-pointer forest whose `uf-union!` costs one write, independent of group size.
3. **Correctness, implemented and verified (Unit 3):** three real unions on six elements produce exactly the predicted four-group partition, checked directly rather than assumed.
4. **A real degenerate case, measured (Unit 4):** an adversarial union order produces a real chain, costing exactly `n − 1` hops to find its far end — Lesson 99's own finding, recurring in a new representation, and the exact problem Lesson 108 exists to fix.

Every claim in this lesson traces to real, executed code: a real, checked partition after real unions, and a real, exact hop count matching `n − 1` at three separate scales.

### What breaks without this

Suppose a real system processed a long stream of "these two accounts are the same person" merge facts using this lesson's naive Union-Find, and those facts happened to arrive in a genuinely adversarial order — exactly the chain-building pattern Concept Unit 4 constructed on purpose. Every later "are these two accounts linked" query touching the long end of that chain would cost real, linear work, indistinguishable in practice from Lesson 12's plain, unstructured list — despite the underlying partition being perfectly correct the entire time. Measuring this honestly, as Concept Unit 4 does, is what makes Lesson 108's fix a response to a real, demonstrated problem rather than a speculative optimization.

### Exercises

1. **Observe.** Before checking, predict whether a *random*, rather than adversarial, order of the identical `n − 1` unions from Concept Unit 4 would produce a shorter real chain to element `0`, and roughly how much shorter.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, measuring `uf-find-counted`'s real hop count for `0` after applying the same `n − 1` unions in a genuinely randomized order, at `n = 1,000`.
3. **Formalize.** Measure the real *maximum* hop count across *all* `n` elements, not just element `0`, after Concept Unit 4's adversarial chain-building — confirm whether it matches, exceeds, or falls short of the `n − 1` figure already measured.
4. **Explain.** In your own words, explain why `uf-union!`'s `(not (= ra rb))` check is necessary for correctness, not just an optimization — referencing what `uf-find`'s own stopping condition depends on.
5. **Explain.** Using this lesson's real numbers, state precisely what "shortening chains permanently, during the very walk that discovers them" (Concept Unit 4's own forward description of Lesson 108) would need to change about `uf-find`'s code, without yet writing that change.

### Definition of done

- [ ] You can state all four Union-Find ADT contracts and explain what a representative is and why comparing two representatives answers "same group."
- [ ] You can explain why `uf-union!` costs work independent of group size, while `uf-find` does not, referencing the parent-pointer forest's own shape.
- [ ] You traced the real partition produced by `union(0,1)`, `union(2,3)`, `union(1,2)` on six elements and confirmed it matches this lesson's own real output.
- [ ] You can explain, using Lesson 99's own vocabulary, why a correct invariant and an efficient shape are two separate claims — and point to this lesson's own real evidence of both being checked separately.
- [ ] You completed Exercises 1–5, including a real, measured comparison between adversarial and randomized union order.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
