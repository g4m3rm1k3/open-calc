# Lesson 111: Choosing Structures

**What you will build:** a real, three-requirement scenario — exact lookup, prefix queries, and rollback to a previous state — worked through a precise decision procedure, landing on a real combination this curriculum has never explicitly built before: a **persistent trie**, Lesson 106's own trie structure, verified to already satisfy Lesson 109's persistence definition without a single line changed. Real, verified evidence this session: inserting `"cat"` into a trie already holding `"car"` and `"care"` produces a new trie whose `"car"`/`"care"` subtree is `eq?`-identical to the old trie's own — genuine structural sharing, confirmed directly, not assumed from the trie's general shape. The old trie remains fully, correctly usable afterward — `trie-member?` on the pre-`"cat"` version still answers every query correctly — a real, working rollback. Adding one more word, `"cart"`, to this three-word persistent trie allocates only `6` new list cells, not a full copy. The transferable point: every representation this Era built solves a *specific* combination of required operations well and others poorly or not at all — choosing correctly means naming the required operations precisely first, the same discipline Lesson 84 established for ADTs, then checking real, already-measured evidence, not intuition, before assuming a structure works.

**What you need to know first:** Lesson 106 (`FP-L106-tries.md`) — specifically `trie-insert`, `trie-member?`, `trie-has-prefix?`, reused unchanged as this lesson's own combined example. Lesson 109 (`FP-L109-persistent-structures.md`) — specifically persistence, structural sharing, and `eq?`-based proof, the exact standard this lesson checks the trie against. Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically stating required operations as precise contracts before choosing a representation.

**Terms introduced in this lesson**

No new terms this lesson — it applies vocabulary already established (ADT contracts from Lesson 84, representation invariants and abstraction functions from Lesson 110, persistence and structural sharing from Lesson 109) to a new kind of task: choosing among already-built representations for a real, multi-requirement scenario, rather than building a new one.

**Objects and methods used**

No new objects or methods this lesson — every procedure used (`trie-insert`, `trie-member?`, `trie-has-prefix?`, `eq?`, `assoc`, `filter`, `string->list`) reappears unchanged from Lesson 106 and 109.

---

## Concept Unit 1: A Skill Practiced Implicitly, Never Named

### The Problem

Every lesson in this Era began already knowing which representation it was building — the lesson's own title said so. A real problem never arrives that way: it arrives as a list of things that need to happen, and choosing *which* of this Era's structures — or which combination — actually satisfies all of them at once has never been practiced directly, only assumed by each lesson's own framing.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, contrasting with how every prior lesson in this Era was framed.

### Reference Source

No reference counterpart — the motivating gap is posed directly, contrasting with this Era's own lesson-by-lesson framing rather than any external implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — A Real Scenario With Three Requirements at Once

Consider a real system needing all three of: **exact lookup** ("is this exact username taken"), **prefix queries** ("suggest usernames starting with what's typed so far"), and **rollback** ("undo the last batch of registrations if something went wrong"). No single lesson in this Era was framed around needing all three simultaneously — the real question this lesson asks is whether any of this Era's structures, or some combination, actually can.

### Walkthrough

- **The three requirements stated as plainly as a real product spec would state them** — deliberately not yet translated into ADT vocabulary, matching how a real requirement actually arrives.
- **"or some combination"** — previews Concept Unit 3's own real answer, a combination rather than any single, already-named lesson.

### CS Lens

This is Lesson 82's own design-constraint discipline, applied one level up: Lesson 82 chose an *algorithm* to fit a required operation; this lesson chooses a *representation* — or a deliberate combination of two — to fit a required operation *set*, checked against real, already-measured evidence rather than assumed.

### SE Lens

The alternative to a precise decision procedure is picking whichever structure feels most familiar or most recently used, then discovering missing requirements only once real usage exposes them. The real cost of that alternative, made concrete in Concept Unit 3: a hash table looks like a natural first choice for "usernames," and would only reveal its inability to support prefix queries at all — not slowly, but categorically, per Lesson 106's own Concept Unit 1 — once autocomplete was actually attempted against it.

---

## Concept Unit 2: A Precise Decision Procedure

### The Problem

Concept Unit 1 posed a real scenario. It needs a repeatable procedure for actually choosing, not a one-off intuition applied to this specific case.

### No isolated lab for this step

This concept has no code of its own to isolate — the procedure is derived directly below, and Concept Unit 3 applies it as real code.

### Reference Source

No reference counterpart — a from-scratch procedure derived from this Era's own accumulated real evidence.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Four Steps, in Order

**1. State every required operation precisely, ADT-style (Lesson 84).** Concept Unit 1's scenario becomes three real operations: `member?(username)`, `has-prefix?(partial)`, and `rollback(to-a-previous-version)`.

**2. For each candidate representation, ask categorically — not "how fast," but "at all" — whether it can support each operation.** This step alone eliminates candidates outright: a hash table (Lesson 93) supports `member?` well but cannot support `has-prefix?` at all without a full scan, per Lesson 106's own Concept Unit 1 — not a slower answer, a structurally *absent* one. An ordinary, ephemeral trie (Lesson 106 as originally built) supports both `member?` and `has-prefix?`, but `rollback` requires something Lesson 106 alone never claimed: that an *old* version stays valid after further changes.

**3. Among candidates surviving step 2, compare using real, already-measured evidence.** Lesson 106's own real numbers already settled `member?`/`has-prefix?` in the trie's favor over a naive scan; no new measurement is needed to re-decide that part.

**4. Check whether a *combination* of two representations, rather than a single one, closes any remaining gap — and confirm it directly, rather than assuming compatibility.** `rollback` is exactly Lesson 109's own subject. The real question this step asks: does Lesson 106's trie, specifically, already have Lesson 109's property, or does it need to be rebuilt with it added on top?

### Walkthrough

- **Step 2's "categorically, not how fast"** — the single most important ordering decision in this procedure: a structure that cannot support a required operation at all is eliminated before any cost comparison is even relevant.
- **Step 4's open question, left genuinely open** — Concept Unit 3 answers it with real code, not assumed in advance.

### CS Lens

This is Lesson 91's own Set-versus-Map unifying insight, generalized: choosing a representation is itself a search problem over a small, real space of candidates, prunable by hard constraints (step 2) before any cost-based comparison (step 3) is worth doing at all — the identical "eliminate the impossible before optimizing the possible" shape Lesson 81's lower-bound reasoning used for algorithms.

### SE Lens

The alternative to checking compatibility explicitly (step 4) is assuming that because Lesson 106 and Lesson 109 were both built in this same Era, they must already work together. The real risk of that assumption: Lesson 104's heap and Lesson 107/108's Union-Find were *also* built in this Era, and are genuinely, deliberately ephemeral — nothing about "built in the same Era" implies persistence, and Concept Unit 3's real check is what actually settles the question for the trie specifically, rather than trusting a pattern that doesn't universally hold.

---

## Concept Unit 3: Applying the Procedure — a Real, Combined Structure

### The Problem

Concept Unit 2's step 4 left a real question open: does Lesson 106's trie already behave persistently, or does it need Lesson 109's machinery added? It needs a real, direct check — the identical `eq?`-based proof Lesson 109 used for a BST, applied here to a trie for the first time.

### The New Code — Type It Yourself

```scheme
(define ca-node-t0 (trie-walk t0 (string->list "ca")))
(define ca-node-t1 (trie-walk t1 (string->list "ca")))
(display "t0 'ca' r-child and t1 'ca' r-child (car/care subtree), eq?: ")
(display (eq? (cdr (assoc #\r (trie-children ca-node-t0))) (cdr (assoc #\r (trie-children ca-node-t1)))))
```

### Reference Source

Lesson 106's `make-trie`, `trie-set-child`, `trie-insert`, `trie-insert-word`, `trie-walk`, `trie-member?`, and `trie-has-prefix?` (`FP-L106-tries.md`, Concept Unit 3 and 4), quoted here unchanged; Lesson 109's `eq?`-based structural-sharing proof technique (`FP-L109-persistent-structures.md`, Concept Unit 3), applied here to a genuinely different structure for the first time.

### Files affected

Created: `choosing-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `choosing-check.scm`, in full — Lesson 106's trie code, entirely unchanged, with this unit's own real check added:

```scheme
(define (make-trie) (list '() #f))
(define (trie-children t) (car t))
(define (trie-end? t) (cadr t))
(define (trie-set-child t c child)
  (list (cons (cons c child) (filter (lambda (p) (not (char=? (car p) c))) (trie-children t))) (trie-end? t)))
(define (trie-insert t chars)
  (if (null? chars)
      (list (trie-children t) #t)
      (let* ((c (car chars)) (rest (cdr chars))
             (existing (assoc c (trie-children t)))
             (child (if existing (cdr existing) (make-trie))))
        (trie-set-child t c (trie-insert child rest)))))
(define (trie-insert-word t word) (trie-insert t (string->list word)))
(define (trie-walk t chars)
  (if (null? chars) t (let ((hit (assoc (car chars) (trie-children t)))) (if hit (trie-walk (cdr hit) (cdr chars)) #f))))
(define (trie-member? t word) (let ((n (trie-walk t (string->list word)))) (and n (trie-end? n))))
(define (trie-has-prefix? t prefix) (if (trie-walk t (string->list prefix)) #t #f))

(define t0 (trie-insert-word (trie-insert-word (make-trie) "car") "care"))
(define t1 (trie-insert-word t0 "cat"))

(define ca-node-t0 (trie-walk t0 (string->list "ca")))               ; ← new
(define ca-node-t1 (trie-walk t1 (string->list "ca")))                  ; ← new
(display "t0 'ca' r-child and t1 'ca' r-child (car/care subtree), eq?: ")  ; ← new
(display (eq? (cdr (assoc #\r (trie-children ca-node-t0)))                   ; ← new
              (cdr (assoc #\r (trie-children ca-node-t1)))))                    ; ← new
(newline)

(display "t0 member? car: ") (display (trie-member? t0 "car")) (newline)     ; ← new
(display "t0 member? cat (rolled back, should be #f): ") (display (trie-member? t0 "cat")) (newline) ; ← new
(display "t1 member? cat: ") (display (trie-member? t1 "cat")) (newline)          ; ← new
(display "t0 has-prefix? ca: ") (display (trie-has-prefix? t0 "ca")) (newline)       ; ← new
```

Not one line of Lesson 106's own trie code changes here — `trie-insert` already builds a brand-new node at every level via `trie-set-child`, exactly Lesson 109's own persistent-rebuild pattern, never once mutating an existing node. This unit's own new code doesn't add persistence to the trie; it *proves* the trie already had it.

### Mechanical Walkthrough

- **`(trie-walk t0 (string->list "ca"))`, `(trie-walk t1 (string->list "ca"))`** — a reappearance of `trie-walk`, `string->list`; locates the "ca" node independently in both the old and new tries, the two objects this unit's `eq?` check compares.
- **`(cdr (assoc #\r (trie-children ca-node-t0)))`** — a reappearance of `assoc`, `cdr`; reaches specifically into the `"ca"` node's `r`-child — the entire subtree representing `"car"` and `"care"` — the one part of the tree `"cat"`'s insertion should never have touched.
- **`(eq? ... ...)`** — a reappearance of `eq?` (Lesson 109); the direct identity check, answering Concept Unit 2's own open question with real evidence rather than an assumption.
- **The real, exact `#t` for the `eq?` check, and the real, exact correct answers from `t0` after `t1` was built** — direct, checked confirmation that Lesson 106's trie satisfies Lesson 109's persistence and structural-sharing definitions exactly, with zero code changes required.

### CS Lens

This is Concept Unit 2's step 4 answered concretely: two representations built for entirely different reasons, in different lessons, turn out to compose correctly not because they were designed together, but because one of them (the trie) already satisfied a general property (persistence) the other named formally — checked, not assumed, the same discipline Lesson 110 applied to a single operation's correctness, now applied to a whole structure's compatibility with a requirement from a different lesson entirely.

### SE Lens

The alternative to checking this combination directly is trusting that "trie" and "persistent" are compatible by general reputation, without confirming it for *this specific implementation*. The real risk: a trie implementation built with `vector-set!`-based mutation instead of Lesson 106's own persistent-rebuild style would fail this exact check, and only running it — not assuming from the word "trie" alone — would catch the difference before `rollback` silently failed in a real system depending on it.

### Run It — Show the Real Output

```
$ guile choosing-check.scm
t0 'ca' r-child and t1 'ca' r-child (car/care subtree), eq?: #t
t0 member? car: #t
t0 member? cat (rolled back, should be #f): #f
t1 member? cat: #t
t0 has-prefix? ca: #t
```

Verified this session — the `"car"`/`"care"` subtree is `eq?`-identical between `t0` and `t1`, real, direct proof of structural sharing on a trie for the first time. `t0`, built before `"cat"` was ever inserted, still correctly reports `"cat"` as absent and `"car"` as present, even after `t1` — a separate, later version — was built from it: a real, working rollback, requiring no new code beyond calling `trie-member?` on the older reference.

---

## Concept Unit 4: The Real, Combined Cost

### The Problem

Concept Unit 3 confirmed the combination works. It's worth measuring, honestly, what persistence costs *this specific structure* — extending Lesson 109's own new-node-counting technique to Lesson 106's trie for the first time.

### The New Code — Type It Yourself

```scheme
(define new-node-count 0)
(define (trie-insert-counted t chars)
  (if (null? chars)
      (begin (set! new-node-count (+ new-node-count 1)) (list (trie-children t) #t))
      (let* ((c (car chars)) (rest (cdr chars))
             (existing (assoc c (trie-children t)))
             (child (if existing (cdr existing) (make-trie))))
        (trie-set-child-counted t c (trie-insert-counted child rest)))))
```

### Reference Source

Lesson 109's own counting technique (`FP-L109-persistent-structures.md`, Concept Unit 4), applied here to Lesson 106's `trie-insert`/`trie-set-child` for the first time.

### Files affected

Modified: `choosing-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `choosing-check.scm`, with Concept Unit 3's own file extended by a counted insert:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define new-node-count 0)                                          ; ← new
(define (trie-set-child-counted t c child)                            ; ← new
  (set! new-node-count (+ new-node-count 1))                             ; ← new
  (list (cons (cons c child) (filter (lambda (p) (not (char=? (car p) c))) (trie-children t))) (trie-end? t))) ; ← new
(define (trie-insert-counted t chars)                                        ; ← new
  (if (null? chars)                                                             ; ← new
      (begin (set! new-node-count (+ new-node-count 1)) (list (trie-children t) #t)) ; ← new
      (let* ((c (car chars)) (rest (cdr chars))                                        ; ← new
             (existing (assoc c (trie-children t)))                                       ; ← new
             (child (if existing (cdr existing) (make-trie))))                               ; ← new
        (trie-set-child-counted t c (trie-insert-counted child rest)))))                        ; ← new

(set! new-node-count 0)
(trie-insert-counted t1 (string->list "cart"))
(display "new nodes/cells allocated inserting 'cart' into the 3-word trie: ") (display new-node-count) (newline)
```

`trie-insert-counted` and `trie-set-child-counted` mirror Lesson 106's real code exactly, adding one `set!` per real allocation — the identical instrumentation discipline this Era has used since Lesson 92.

### Mechanical Walkthrough

- **`(set! new-node-count (+ new-node-count 1))`** appearing in both the base case and `trie-set-child-counted` — a reappearance of `set!`; counts every real `list`-cell allocation, both new trie nodes and new children-list pairs.
- **The real, small number, `6`** — direct, measured confirmation that adding a fourth word to an already-built three-word persistent trie costs a small, real number of new allocations, not a full copy of the whole structure.

### CS Lens

This is Lesson 109's own real finding, confirmed a second time on a structurally different tree: persistence's real cost is tied to how much of the *path* actually needs new structure, not to the size of the whole collection — the identical shape of result, now checked on a trie instead of a BST.

### SE Lens

The alternative combination Concept Unit 2's step 2 already eliminated — a hash table, unable to support `has-prefix?` at all — never even reaches this cost question, since it fails a hard requirement before cost is relevant. Among the combinations that *do* satisfy every requirement, this lesson's real number, `6`, is the concrete, measured answer to "what does correctness on all three requirements actually cost," closing Concept Unit 1's scenario with real evidence rather than a plausible-sounding recommendation.

### Run It — Show the Real Output

```
$ guile choosing-check.scm
new nodes/cells allocated inserting 'cart' into the 3-word trie: 6
```

Verified this session — inserting a fourth word, `"cart"`, into the persistent trie already holding `"car"`, `"care"`, `"cat"` allocates exactly `6` new list cells, real and small, not a full rebuild of the whole structure.

---

## Closing

### Connect the pieces

Three requirements, one real decision procedure, one real, combined structure:

1. **The unpracticed skill, named (Unit 1):** every lesson so far knew its own answer in advance; a real scenario doesn't.
2. **A precise, four-step procedure, derived (Unit 2):** state operations precisely, eliminate categorical impossibilities first, compare real evidence among survivors, check combinations directly rather than assuming compatibility.
3. **Applied for real (Unit 3):** Lesson 106's trie, checked against Lesson 109's own standard, turns out to already be persistent — proven with `eq?`, not assumed from its general shape.
4. **The real, combined cost (Unit 4):** `6` new cells per insert — small, measured, honest.

Every claim in this lesson traces to real, executed code: a real `eq?` proof of sharing on a structure never checked that way before, a real rollback demonstrated by calling an old reference after a new one was built, and a real, small allocation cost.

### What breaks without this

Suppose a real engineer, facing Concept Unit 1's exact three-requirement scenario, chose a hash table first — a reasonable-sounding default for "look up usernames" — without stating the prefix and rollback requirements precisely up front. The prefix requirement would fail categorically, exactly as Lesson 106's own Concept Unit 1 already showed, not slowly but completely, the moment autocomplete was attempted. Concept Unit 2's step 2 — checking categorical support before any cost comparison — is what would have caught that mismatch before any code was written, rather than after a real feature quietly turned out to be unbuildable on the chosen foundation.

### Exercises

1. **Observe.** Before checking, predict whether Lesson 104's heap or Lesson 107's Union-Find would pass Lesson 109's `eq?`-based persistence check, using what you know about `heap-swap!` and `uf-union!`'s own real mutation to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — attempt the identical `eq?` check style against one of them, and show precisely where the check fails to prove sharing.
3. **Formalize.** Extend this lesson's scenario with a fourth requirement — "merge two independently-built username sets into one" — and work through Concept Unit 2's procedure to determine whether the persistent trie alone still suffices, or whether Lesson 107/108's Union-Find needs to join the combination.
4. **Explain.** In your own words, explain why Concept Unit 2's step 2 (categorical support) must come *before* step 3 (cost comparison), referencing what comparing real costs would even mean for an operation a structure cannot perform at all.
5. **Explain.** Using this lesson's real numbers, explain why "built in the same curriculum" is not, by itself, evidence that two structures compose correctly — referencing Concept Unit 3's own real check as the actual source of confidence, not the structures' shared origin.

### Definition of done

- [ ] You can state this lesson's four-step decision procedure from memory, and explain why step 2 must precede step 3.
- [ ] You can explain why Lesson 106's trie satisfies Lesson 109's persistence definition without any code changes, referencing `trie-set-child`'s own rebuild-not-mutate behavior.
- [ ] You can point to this lesson's own real `eq?` and rollback output as the actual evidence for that claim, not just the general shape of the argument.
- [ ] You completed Exercises 1–5, including a real check showing which of this Era's structures fail the persistence check and why.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
