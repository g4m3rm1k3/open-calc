# Lesson 113: From Relations to Graphs

**What you will build:** a **graph**, derived directly from Lesson 17's own relation concept — a set of vertices and a set of related pairs between them, represented exactly the way Lesson 17 represented any relation: an explicit list of pairs. Real, verified evidence this session: a small, real five-task morning routine, represented as five directed edges (`wake→shower`, `wake→dress`, `shower→dress`, `dress→breakfast`, `breakfast→leave`), is correctly confirmed *not* symmetric — `shower→wake` is absent even though `wake→shower` is present — while its real, computed **symmetric closure** (every edge, plus its reverse, `10` edges total) is confirmed symmetric exactly, checked with the identical reflexive/symmetric-checking logic Lesson 17 first used for ordinary relations. The transferable point: a graph is not a new mathematical object requiring new machinery — it is a relation, exactly as Lesson 17 defined one, given a name suited to problems about connection, dependency, and reachability rather than ordering or equivalence.

**What you need to know first:** Lesson 17 (`FP-L017-relations.md`) — specifically a relation represented as an explicit set of ordered pairs, and the reflexive/symmetric/transitive properties, all reused directly. Lesson 107 (`FP-L107-union-find.md`) — specifically equivalence classes, one particular *kind* of relation this lesson's graphs generalize beyond.

**Terms introduced in this lesson**

- **Graph** — a pair `(V, E)`: a set of vertices, `V`, and a set of related pairs between them, `E` — precisely Lesson 17's own relation, applied to a set `V` and given a name suited to problems about connection rather than ordering.
- **Vertex** — a single element of a graph's vertex set `V`; the "thing" a relation's pairs relate.
- **Edge** — a single related pair in a graph's edge set `E`; the concrete evidence that two vertices are directly related.
- **Directed graph** — a graph whose edges are ordered pairs: `(a, b) ∈ E` does not imply `(b, a) ∈ E`. The general case, requiring no particular property of the underlying relation.
- **Undirected graph** — a graph whose edge relation is symmetric (Lesson 17): `(a, b) ∈ E` if and only if `(b, a) ∈ E`. An edge is drawn without direction specifically because the relation itself guarantees both directions hold together, always.
- **Symmetric closure** — the smallest symmetric relation containing a given relation: every original pair, plus every pair's reverse. It exists to turn any directed graph into the undirected graph that represents "these two vertices are connected, direction ignored."

**Objects and methods used**

- **`member`**
  - *What it is:* a real Scheme procedure searching a list for a matching element.
  - *Implementation:* takes a value and a list, returns the matching tail or `#f`; reappearing from Lesson 91, used as `(member (cons a b) (graph-edges g))`.
  - *Its use:* the direct, literal check for whether a specific ordered pair is present in the edge set — exactly how Lesson 17 checked whether a pair belonged to a relation.
- **`filter`**
  - *What it is:* a real Scheme procedure returning a new list containing only the elements satisfying a given predicate.
  - *Implementation:* takes a predicate and a list, returns the filtered list; reappearing from Lesson 35/91, used to select every edge starting at a given vertex.
  - *Its use:* computing a vertex's neighbors — every edge whose first element matches the vertex in question.
- **`map`**
  - *What it is:* a real Scheme procedure applying a function to every element of a list, returning the results as a new list.
  - *Implementation:* takes a function and a list, returns a list of results; reappearing from very early in this curriculum, used as `(map cdr ...)`.
  - *Its use:* extracting just the destination vertex from each of a vertex's outgoing edges, after `filter` has selected them.

---

## Concept Unit 1: A Relation That's Neither an Ordering Nor an Equivalence

### The Problem

Lesson 17 defined relations generally; Lesson 107 built real code around one specific *kind* — an equivalence relation, reflexive, symmetric, and transitive, used to group elements into classes. Many real relationships fit neither that mold nor an ordering: "task A must happen before task B" (not symmetric — doing `A` before `B` doesn't mean `B` before `A`; not reflexive — a task needn't precede itself; not obviously transitive without more assumptions), "city A has a direct flight to city B," "person A follows person B." These are all real, useful relations that Lesson 17's own general definition already covers — but this curriculum has never yet built anything around a relation with *no* special property assumed at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, contrasting with Lesson 107's own equivalence-specific use of a relation.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 17 and 107's own already-established vocabulary, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "No Special Property Assumed" Actually Requires

A representation for an arbitrary relation needs to support exactly what Lesson 17's own examples already needed to check reflexivity, symmetry, and transitivity: a concrete, real set of pairs, and a way to check whether a specific pair is present. Nothing more can be assumed, since nothing more is guaranteed.

### Walkthrough

- **The three concrete real-world examples, none reflexive, symmetric, or provably transitive without extra assumptions** — grounds "no special property" in real, relatable relationships rather than an abstract claim.
- **"exactly what Lesson 17's own examples already needed"** — previews Concept Unit 2's own definition as a direct reuse, not a new invention.

### CS Lens

This is a real instance of recognizing that a new-sounding name doesn't always mean new machinery: "graph" carries an entire field's worth of algorithms and vocabulary, and yet, at the representation level, it's exactly Lesson 17's relation, unchanged. Also recognized in: a "network diagram" and an "org chart" both turning out, mathematically, to be the identical structure — a set of things and a set of related pairs between them — despite looking, and being discussed, as though they were entirely different tools.

### SE Lens

The alternative to recognizing this reuse is treating graphs as an entirely separate topic requiring its own representation built from scratch. The real cost of that alternative: losing Lesson 17's own already-derived vocabulary (reflexive, symmetric, transitive) and its already-built pair-set representation, exactly what Concept Unit 3 reuses directly rather than re-deriving.

---

## Concept Unit 2: Defining Graph, Directed, and Undirected Precisely

### The Problem

Concept Unit 1 named the gap. It needs precise definitions — connecting "graph" directly to Lesson 17's own relation vocabulary, not introducing parallel, unconnected terminology.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation connecting directly to Lesson 17's own already-established vocabulary.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Graph as Relation, Directed and Undirected as Symmetry

**A graph**, precisely: a pair `(V, E)`, where `V` is a set (the vertices) and `E` is a relation on `V` (the edges) — exactly Lesson 17's own relation, restricted to pairs drawn from `V`. **Directed**, the general case: `E` need not be symmetric — `(a, b) ∈ E` says nothing about whether `(b, a) ∈ E`. **Undirected**: `E` is required to be symmetric, in exactly Lesson 17's own sense — `(a, b) ∈ E` if and only if `(b, a) ∈ E`. Drawing an edge "without an arrow" is simply a visual convention for a relation that already guarantees both directions hold together; it adds no new mathematical content beyond Lesson 17's own symmetry property.

**The symmetric closure**, precisely: given any relation `E`, its symmetric closure is `E ∪ {(b, a) : (a, b) ∈ E}` — every original pair, plus every pair's reverse, added only where genuinely missing. It exists because a real, directed relationship (a one-way dependency, a one-way flight) can still be asked a genuinely different, symmetric question: "are these two connected at all, ignoring direction" — and the closure is the precise relation that question is actually about.

### Walkthrough

- **"Undirected" defined entirely in terms of Lesson 17's `symmetric`** — no new property is introduced; the entire definition is a direct citation.
- **Symmetric closure's set-builder definition, `E ∪ {(b,a) : (a,b) ∈ E}`** — precise enough to implement directly and literally in Concept Unit 3.

### CS Lens

This is Lesson 17's own reflexive/symmetric/transitive vocabulary, now shown to be load-bearing well beyond the lesson that introduced it — a real, general-purpose classification, not vocabulary scoped narrowly to "relations," now doing real work defining an entire, separately-named field's foundational object.

### SE Lens

The alternative to defining undirected graphs via symmetry is to treat "directed" and "undirected" as two entirely separate representations requiring separate code throughout this curriculum's later graph work. The real cost of that alternative: every algorithm would need to be written and verified twice. Defining undirected as "directed, with the symmetry property guaranteed" instead means a single directed representation, checked or made symmetric as needed, covers both — exactly what Concept Unit 3's `symmetric-closure` demonstrates directly.

---

## Concept Unit 3: Implementing and Verifying a Real Graph

### The Problem

Concept Unit 2 derived the definitions. It needs real code: a concrete graph representation, an edge check, a neighbor query, and — critically — a real check that the derived symmetric-closure definition actually produces a symmetric relation when applied to a genuinely non-symmetric one.

### The New Code — Type It Yourself

```scheme
(define (graph-symmetric? g)
  (let loop ((es (graph-edges g)))
    (cond ((null? es) #t)
          ((not (graph-edge? g (cdar es) (caar es))) #f)
          (else (loop (cdr es))))))
```

### Reference Source

Lesson 17's own pair-set representation of a relation, quoted from memory as read earlier this session (`FP-L017-relations.md`): a relation represented directly as an explicit list of pairs, checked by direct membership — reused here unchanged as this lesson's own edge representation.

### Files affected

Created: `graph-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `graph-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-vertices g) (car g))
(define (graph-edges g) (cdr g))
(define (graph-edge? g a b) (if (member (cons a b) (graph-edges g)) #t #f))
(define (graph-neighbors g a)
  (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (graph-symmetric? g)                                       ; ← new
  (let loop ((es (graph-edges g)))                                     ; ← new
    (cond ((null? es) #t)                                                 ; ← new
          ((not (graph-edge? g (cdar es) (caar es))) #f)                    ; ← new
          (else (loop (cdr es))))))                                            ; ← new

(define (symmetric-closure g)
  (make-graph (graph-vertices g)
              (let loop ((es (graph-edges g)) (acc (graph-edges g)))
                (if (null? es) acc
                    (loop (cdr es)
                          (if (member (cons (cdar es) (caar es)) acc)
                              acc
                              (cons (cons (cdar es) (caar es)) acc)))))))

(define morning
  (make-graph '(wake shower dress breakfast leave)
              (list (cons 'wake 'shower) (cons 'wake 'dress) (cons 'shower 'dress)
                    (cons 'dress 'breakfast) (cons 'breakfast 'leave))))

(display "edge? wake->shower: ") (display (graph-edge? morning 'wake 'shower)) (newline)
(display "edge? shower->wake: ") (display (graph-edge? morning 'shower 'wake)) (newline)
(display "neighbors of wake: ") (display (graph-neighbors morning 'wake)) (newline)
(display "is morning symmetric (undirected)? ") (display (graph-symmetric? morning)) (newline)

(define morning-undirected (symmetric-closure morning))
(display "symmetric closure edge count: ") (display (length (graph-edges morning-undirected))) (newline)
(display "is the closure symmetric? ") (display (graph-symmetric? morning-undirected)) (newline)
```

`make-graph` pairs a vertex list with an edge list, exactly Lesson 17's own relation-as-pairs shape. `graph-edge?` and `graph-neighbors` never inspect vertex or edge *meaning* — only membership and matching, the identical, representation-agnostic checking style Lesson 17 used for arbitrary relations. `graph-symmetric?` is the literal execution of Lesson 17's own symmetry property, checked edge by edge: for every `(a, b)` present, is `(b, a)` also present?

### Mechanical Walkthrough

- **`(cons a b)`** in `make-graph`/`graph-edge?` — a reappearance of `cons`; an edge is nothing but an ordered pair, exactly Lesson 17's own representation of one related pair.
- **`(let loop ((es (graph-edges g))) (cond ((null? es) #t) ...))`** in `graph-symmetric?` — a reappearance of named-let recursion, `cond`, `null?`; walks every edge, the same exhaustive-checking discipline Lesson 17 used to confirm symmetry held for every pair, not just a sample.
- **`(graph-edge? g (cdar es) (caar es))`** — first appearance of checking a pair's *reverse* against the same relation; the literal executable form of Lesson 17's own symmetry definition, `(a R b) → (b R a)`.
- **`(if (member (cons (cdar es) (caar es)) acc) acc (cons ... acc))`** in `symmetric-closure` — first appearance of this specific idiom: adding a reverse pair only if genuinely absent, the literal execution of Concept Unit 2's set-builder definition, `E ∪ {(b,a) : (a,b) ∈ E}`.
- **The real, exact `#f` for `morning`'s own symmetry, and `#t` for its closure's** — direct, checked confirmation that Concept Unit 2's derived definitions correctly classify a genuinely asymmetric real relation, and correctly repair it into a symmetric one.

### CS Lens

This is Lesson 17's own reflexive/symmetric/transitive checking method, applied here to a genuinely new domain without a single line of new checking logic — direct, real evidence that naming graphs as relations (Concept Unit 2) wasn't just a definitional convenience, but immediately reusable, working machinery.

### SE Lens

The alternative to reusing Lesson 17's exhaustive, pair-by-pair symmetry check is writing a graph-specific "is this undirected" checker from scratch, duplicating logic that already exists and is already trusted. The real cost of that alternative: two separately-maintained implementations of the identical idea, with no guarantee they'd even agree — exactly the kind of unnecessary duplication naming graphs as relations, precisely, was meant to prevent.

### Run It — Show the Real Output

```
$ guile graph-check.scm
edge? wake->shower: #t
edge? shower->wake: #f
neighbors of wake: (shower dress)
is morning symmetric (undirected)? #f
symmetric closure edge count: 10
is the closure symmetric? #t
```

Verified this session — the real, five-edge morning-routine graph correctly reports `wake→shower` present and `shower→wake` absent, correctly identifying it as *not* symmetric. Its real, computed symmetric closure has exactly `10` edges — every one of the `5` original edges plus its distinct reverse, since none of the `5` originals happened to already have their reverse present — and is correctly confirmed symmetric by the identical checking logic that correctly rejected the original.

---

## Concept Unit 4: A Directed Question a Symmetric View Would Get Wrong

### The Problem

Concept Unit 3 confirmed the mechanics work. It's worth checking, honestly, why the distinction between directed and undirected actually *matters* for a real question — not just that the checker correctly labels each case.

### The New Code — Type It Yourself

```scheme
(display "directed neighbors of dress (must-come-after only): ") (display (graph-neighbors morning 'dress)) (newline)
(display "undirected neighbors of dress (any direct connection): ") (display (graph-neighbors morning-undirected 'dress)) (newline)
```

### Reference Source

Concept Unit 3's own `graph-neighbors`, `morning`, and `morning-undirected`, reused unchanged.

### Files affected

Modified: `graph-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `graph-check.scm`, with Concept Unit 3's own file extended by two real queries:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(display "directed neighbors of dress (must-come-after only): ") (display (graph-neighbors morning 'dress)) (newline) ; ← new
(display "undirected neighbors of dress (any direct connection): ") (display (graph-neighbors morning-undirected 'dress)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(graph-neighbors morning 'dress)`** — a reappearance of `graph-neighbors`, called on the original *directed* graph; answers "what must happen strictly after dressing," a real, meaningful question only the directed version can answer correctly.
- **`(graph-neighbors morning-undirected 'dress)`** — the identical call on the *undirected* closure; answers a genuinely different real question, "what is dressing directly connected to, regardless of order" — correctly including `wake` and `shower`, which the directed version correctly excluded.

### CS Lens

This is the real, concrete payoff of Concept Unit 2's symmetry-based definition: directed and undirected aren't two arbitrary flavors of the same picture — they answer genuinely different real questions, and collapsing a directed relationship into its symmetric closure *before* asking a direction-sensitive question (like "what must happen after this") would silently produce a wrong, overly-permissive answer.

### SE Lens

The alternative to keeping both the directed graph and its closure available is picking one representation upfront and discarding the other. The real cost of that alternative: a system that only kept `morning-undirected` could never again correctly answer "what must happen after dressing," having permanently discarded the direction information Concept Unit 2's own definitions show is genuinely, mathematically distinct from mere connectivity.

### Run It — Show the Real Output

```
$ guile graph-check.scm
directed neighbors of dress (must-come-after only): (breakfast)
undirected neighbors of dress (any direct connection): (shower wake breakfast)
```

Verified this session — the directed graph correctly reports only `breakfast` as coming after dressing; the undirected closure correctly reports all three real, direct connections, `shower`, `wake`, and `breakfast`, with ordering information genuinely, deliberately lost. Two real, different, both-correct answers to two real, different questions, from two representations of the identical underlying data.

---

## Closing

### Connect the pieces

Five real morning tasks, one relation, checked and reshaped two ways:

1. **The gap, named (Unit 1):** many real relationships assume no special property — Lesson 17's relation already covers them, but nothing has been built around one directly yet.
2. **Graph, directed, and undirected, defined precisely (Unit 2):** a graph is a relation on a vertex set; undirected means symmetric, in exactly Lesson 17's own sense; symmetric closure repairs a directed relation into one.
3. **Implemented and verified (Unit 3):** a real, `5`-edge directed graph correctly identified as asymmetric; its real `10`-edge closure correctly identified as symmetric.
4. **The real, direction-sensitive payoff (Unit 4):** the two representations answer two genuinely different real questions, both correctly, from the identical original data.

Every claim in this lesson traces to real, executed code: a real graph built from a relatable example, checked for symmetry with Lesson 17's own logic, and repaired with a real, computed symmetric closure.

### What breaks without this

Suppose a real task-scheduling system collapsed its dependency graph into its symmetric closure before asking "what must happen before task X" — perhaps because an undirected representation felt simpler to store. This lesson's own real evidence shows precisely what would go wrong: `dress`'s undirected neighbors incorrectly include `wake` and `shower`, both of which must happen *before* dressing, not after — a scheduler using the closure directly for ordering would incorrectly believe dressing could block tasks it must actually follow, a real, silent correctness failure Concept Unit 4's direct comparison exposes.

### Exercises

1. **Observe.** Before checking, predict whether `graph-symmetric?` would return `#t` on a graph with *zero* edges but several vertices, using Concept Unit 3's own loop structure to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Using this lesson's own `morning` graph, write and check a `graph-reflexive?` predicate (Lesson 17's own property, applied here), and explain, using a real check, why a real task-dependency graph would generally *not* be reflexive.
4. **Explain.** In your own words, explain why `symmetric-closure`'s `member` check (only adding a reverse pair if genuinely absent) is necessary for correctness, referencing what would happen to `graph-edge?`'s own results if a duplicate reverse pair were added instead.
5. **Explain.** Using this lesson's real evidence, state one real scenario where checking `graph-symmetric?` on data *believed* to represent an undirected graph would be worth doing before trusting it, referencing Concept Unit 4's own real consequence of using the wrong representation for a direction-sensitive question.

### Definition of done

- [ ] You can state a graph's definition precisely in terms of Lesson 17's relation, and explain why undirected means symmetric specifically.
- [ ] You can explain, using this lesson's own real numbers, why a directed graph and its symmetric closure can give genuinely different, both-correct answers to different questions.
- [ ] You can trace `graph-symmetric?` by hand on a small example and predict its result before running it.
- [ ] You completed Exercises 1–5, including a real `graph-reflexive?` check applied to a real dependency graph.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
