# Lesson 133: Exchange Arguments

**What you will build:** a real, executed **exchange argument** — the standard technique for proving the greedy-choice property (Lesson 132) holds for a specific problem — applied directly to Lesson 129 through 131's own minimum spanning tree work. Real, verified evidence this session: a real, valid spanning tree, `T`, deliberately built *without* the graph's globally cheapest edge, has real weight `9`. Adding the cheapest edge to `T` creates a real cycle; removing one real, more expensive edge from that cycle — the literal "exchange" — produces a new tree, `T'`, still a valid spanning tree, with real weight `6`, strictly less than `T`'s own `9`, and exactly matching the true minimum spanning tree Lesson 129 through 131 already found three separate ways. The transferable point: Lesson 125's own proof by contradiction and this lesson's exchange argument are two different real techniques for proving the identical kind of claim — that a greedy choice can always be incorporated into an optimal solution — and this lesson makes the *mechanism* directly visible: an exchange isn't just argued, it's a real, concrete edit to a real, concrete tree, checked step by step.

**What you need to know first:** Lesson 132 (`FP-L132-greedy-algorithms.md`) — specifically the greedy-choice property, the exact claim this lesson's technique proves. Lesson 129 (`FP-L129-minimum-spanning-trees.md`), Lesson 130, and Lesson 131 — specifically their own real graph and already-confirmed minimum spanning tree, reused directly as this lesson's own concrete example.

**Terms introduced in this lesson**

- **Exchange argument** — a proof technique showing a greedy choice can always be incorporated into an optimal solution: take any hypothetical optimal solution that doesn't include the greedy choice, show a specific, concrete swap (removing one element, adding the greedy choice instead) that produces a solution no worse than the original. It exists to prove the greedy-choice property directly and constructively, rather than only by contradiction.

**Objects and methods used**

No new objects or methods this lesson — `filter`, `member`, `apply`, `cons` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: A Different Kind of Proof, for the Identical Claim

### The Problem

Lesson 125 proved Dijkstra's greedy choice correct by contradiction: assume a shorter path exists, derive an impossible consequence. That technique works, but it doesn't directly show *how* to reconcile the greedy choice with any hypothetical better answer — it only shows no better answer could exist. A real, different, more *constructive* proof style exists: instead of deriving a contradiction, directly show how to *edit* any hypothetical optimal solution into one that includes the greedy choice, without making it worse.

### No isolated lab for this step

This concept has no code of its own to isolate — the alternative proof style is posed directly here, contrasting with Lesson 125's own proof by contradiction.

### Reference Source

No reference counterpart — the motivating contrast draws on Lesson 125's own already-established proof technique, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Constructive Proof Needs

A real exchange argument needs three things: a hypothetical optimal solution that doesn't include the greedy choice, a specific, concrete element to remove from it, and a real, checkable demonstration that swapping produces a solution that's still valid, and no worse.

### Walkthrough

- **"constructive," contrasted directly with "by contradiction"** — names the real, structural difference in proof style, not just a synonym for "another way to prove the same thing."
- **The three real requirements, stated before any code exists** — previews Concept Unit 2's own precise derivation.

### CS Lens

This is Lesson 24's own proof-by-cases-and-counterexample vocabulary, extended: contradiction and construction are two genuinely different logical strategies for the identical kind of claim, and recognizing which one a given argument uses is itself a real, transferable skill.

### SE Lens

The alternative to learning a second proof technique is relying on proof by contradiction for every future greedy algorithm. The real value of a second technique: some claims (this lesson's own MST exchange, in particular) are far more natural to state constructively — showing the exact edit — than by deriving an abstract impossibility.

---

## Concept Unit 2: Deriving the MST Exchange Argument

### The Problem

Concept Unit 1 named the general shape. It needs a precise, real argument for this specific problem: why can Kruskal's own cheapest-edge-first choice always be incorporated into an optimal spanning tree?

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is derived directly below, and Concept Unit 3 executes it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 129's own spanning-tree definitions.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Real, Step-by-Step Exchange

Let `e` be the graph's real, globally cheapest edge, and suppose some optimal spanning tree `T` does *not* include it. **Step one:** add `e` to `T`. Since `T` already connects `e`'s two endpoints through some other real path (it's a spanning tree), adding `e` creates exactly one real cycle. **Step two:** that cycle must contain at least one *other* real edge, `e'`, whose weight is at least `e`'s own — since `e` is the globally cheapest edge in the entire graph, nothing could be cheaper. **Step three:** remove `e'`. The result, `T'`, is still a real spanning tree — removing one edge from a cycle can't disconnect anything, since every vertex the cycle touched is still reachable via the rest of the cycle — and its real total weight is `T`'s own weight, minus `e'`'s weight, plus `e`'s weight, which is no more than `T`'s original weight, since `e ≤ e'`.

**Why this proves the greedy-choice property:** `T'` is a real, valid spanning tree, no more expensive than `T`. Since `T` was assumed optimal, `T'` can't be cheaper — so `T'` costs exactly the same as `T`, and is *also* optimal, and now includes `e`. The cheapest edge can always be exchanged into an optimal solution, without loss.

### Walkthrough

- **The three real steps, numbered and separated** — a concrete, followable procedure, not an abstract claim.
- **`e ≤ e'`, the single inequality the whole argument depends on** — traced directly back to `e`'s own status as the globally cheapest edge, Lesson 129's own quantity.

### CS Lens

This is Lesson 43's own case-based proof style, applied constructively: rather than deriving a contradiction from "suppose a cheaper answer exists," this argument directly *builds* an equally-good answer containing the greedy choice, from any hypothetical optimal one.

### SE Lens

The alternative to spelling out all three real steps is asserting "the exchange works" without showing the mechanism. The real value of the step-by-step derivation: Concept Unit 3's own real code is a direct, literal translation of these three steps, not a separate, re-derived implementation — the proof and the check share the identical structure.

---

## Concept Unit 3: Executing a Real Exchange, Step by Step

### The Problem

Concept Unit 2 derived the argument. It needs to be run as real code, on Lesson 129's own real graph, with every one of the three steps checked directly.

### The New Code — Type It Yourself

```scheme
(define T-plus (cons cheapest T))
(define witness (list 'A 'C 4))
(define T-exchanged (cons cheapest (filter (lambda (e) (not (equal? e witness))) T)))
```

### Reference Source

Lesson 129's own `uverts`, `connects-all?` (`FP-L129-minimum-spanning-trees.md`, Concept Unit 3), reused directly; Lesson 130/131's own already-confirmed true minimum spanning tree, real weight `6`, the direct target this lesson's real exchange is checked against.

### Files affected

Created: `exchange-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `exchange-check.scm`, in full:

```scheme
(define (connects-all? edges verts)
  (let ((visited (list (car verts))))
    (let loop ((changed #t))
      (if changed (let ((added #f))
                    (for-each (lambda (e) (cond ((and (member (car e) visited) (not (member (cadr e) visited))) (set! visited (cons (cadr e) visited)) (set! added #t))
                                                 ((and (member (cadr e) visited) (not (member (car e) visited))) (set! visited (cons (car e) visited)) (set! added #t))))
                              edges)
                    (loop added))))
    (= (length visited) (length verts))))
(define (is-tree? edges verts) (and (= (length edges) (- (length verts) 1)) (connects-all? edges verts)))

(define uverts '(A B C D))
(define cheapest (list 'A 'B 1))

(define T (list (list 'A 'C 4) (list 'B 'C 2) (list 'C 'D 3)))
(display "T is a valid spanning tree? ") (display (is-tree? T uverts)) (newline)
(display "T real weight: ") (display (apply + (map caddr T))) (newline)
(display "T includes the cheapest edge A-B? ") (display (if (member cheapest T) #t #f)) (newline)

(define T-plus (cons cheapest T))                                   ; ← new
(display "T + cheapest edge, real edge count: ") (display (length T-plus)) (newline)

(define witness (list 'A 'C 4))                                     ; ← new
(define T-exchanged (cons cheapest (filter (lambda (e) (not (equal? e witness))) T))) ; ← new
(display "T' (after the real exchange): ") (display T-exchanged) (newline)
(display "T' is a valid spanning tree? ") (display (is-tree? T-exchanged uverts)) (newline)
(display "T' real weight: ") (display (apply + (map caddr T-exchanged))) (newline)
```

`T` is deliberately constructed to be a real, valid spanning tree that omits the graph's own cheapest edge — Concept Unit 2's own starting assumption, made concrete. `T-plus` is step one of the real argument, literally. `witness` is `e'` — a real edge in the cycle `T-plus` creates, chosen with weight `4`, genuinely at least the cheapest edge's own weight, `1`. `T-exchanged` is step three, the real exchange itself.

### Mechanical Walkthrough

- **`(list (list 'A 'C 4) (list 'B 'C 2) (list 'C 'D 3))`** — first appearance of `T`, deliberately built to violate Concept Unit 2's own assumption (an optimal tree without the cheapest edge) — a real, concrete instance of the hypothetical the whole argument reasons about.
- **`(cons cheapest T)`** — a reappearance of `cons`; the literal, real execution of step one — adding the cheapest edge, creating a real, checkable cycle.
- **`(filter (lambda (e) (not (equal? e witness))) T)`** — a reappearance of `filter`, `equal?`; the literal execution of step three — removing exactly the one real, chosen cycle edge, `witness`.
- **The real, exact confirmation `T'` is a valid spanning tree, and its real weight, `6`, is strictly less than `T`'s own `9`** — direct, checked confirmation of Concept Unit 2's own derived inequality, `e ≤ e'`, translated into a real, measured improvement rather than merely a non-worsening.

### CS Lens

This is Lesson 117's own real-counterexample-and-confirmation discipline, applied constructively rather than adversarially: instead of building a case that breaks something (Lesson 117's own stack-based BFS), this unit builds a case that directly demonstrates a proof's own claimed mechanism, step by real step.

### SE Lens

The alternative to executing all three steps as separate, checkable real values is computing only the final `T'` and confirming its weight. The real value of exposing every intermediate step — `T`, `T-plus`, `witness`, `T-exchanged` — is that a reader can verify the *mechanism* the proof describes, not just trust that some correct-looking final answer eventually appeared.

### Run It — Show the Real Output

```
$ guile exchange-check.scm
T is a valid spanning tree? #t
T real weight: 9
T includes the cheapest edge A-B? #f
T + cheapest edge, real edge count: 4
T' (after the real exchange): ((A B 1) (B C 2) (C D 3))
T' is a valid spanning tree? #t
T' real weight: 6
```

Verified this session — `T`, a real, valid spanning tree deliberately omitting the graph's cheapest edge, has real weight `9`. After the real, three-step exchange — adding the cheapest edge, identifying the real cycle it creates, removing one genuinely more expensive cycle edge — the resulting `T'` is confirmed a valid spanning tree, real weight `6`.

---

## Concept Unit 4: The Exchange Converges to the True Optimum

### The Problem

Concept Unit 3 confirmed one real exchange improves `T`. It's worth confirming, directly, that this specific exchange doesn't just improve `T` — it reaches the *actual*, already-known true minimum, connecting this lesson's own real proof back to three independently-derived results.

### The New Code — Type It Yourself

```scheme
(display "T' matches the true MST from Lessons 129-131 (weight 6)? ")
(display (= (apply + (map caddr T-exchanged)) 6))
(newline)
```

### Reference Source

Lesson 129's own brute-force MST, Lesson 130's own Kruskal result, and Lesson 131's own Prim result — three independently-derived real weight-`6` answers, all reused here as the target this lesson's own exchange is checked against.

### Files affected

Modified: `exchange-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `exchange-check.scm`, with a final, direct check added:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(display "T' matches the true MST from Lessons 129-131 (weight 6)? ")   ; ← new
(display (= (apply + (map caddr T-exchanged)) 6))                          ; ← new
(newline)                                                                      ; ← new
```

### Mechanical Walkthrough

- **`(= (apply + (map caddr T-exchanged)) 6)`** — a reappearance of `=`, `apply`, `map`; a direct, real comparison against the literal number three separate, independently-derived lessons already confirmed.
- **The real, exact `#t`** — direct, checked confirmation that one concrete exchange, applied to one deliberately suboptimal tree, reaches the *actual* true minimum this Era has now confirmed four separate ways: brute force (Lesson 129), Kruskal (Lesson 130), Prim (Lesson 131), and this lesson's own constructive exchange.

### CS Lens

This is this Era's own recurring pattern, completed a final time for MST specifically: real evidence accumulated from genuinely independent directions — exhaustive search, two different greedy algorithms, and now a direct proof mechanism — all agreeing exactly is the strongest form of confidence this curriculum has repeatedly built toward since Lesson 22.

### SE Lens

The alternative to checking against the already-known true minimum is trusting the exchange argument's own internal logic alone. The real value of the final check: it confirms this lesson's own specific, chosen exchange (removing `A–C` specifically, among two possible witness edges) happened to reach the actual optimum in one step — a real, satisfying, checked closure, not merely a logically valid but unconfirmed argument.

### Run It — Show the Real Output

```
$ guile exchange-check.scm
T' matches the true MST from Lessons 129-131 (weight 6)? #t
```

Verified this session — the real tree produced by this lesson's own concrete exchange matches the true minimum spanning tree exactly, the identical weight `6` already confirmed three separate ways in Lesson 129 through 131.

---

## Closing

### Connect the pieces

One suboptimal tree, one real exchange, one confirmed optimum:

1. **A second proof style, motivated (Unit 1):** constructive, not by contradiction — directly showing the edit, not deriving an impossibility.
2. **The MST exchange argument, derived (Unit 2):** add the cheapest edge, find the cycle it creates, remove a real, at-least-as-expensive cycle edge.
3. **Executed as real code, step by step (Unit 3):** a real `9`-weight tree becomes a real `6`-weight tree, in one traceable exchange.
4. **Confirmed against three independent results (Unit 4):** the identical true minimum, reached a fourth way.

Every claim in this lesson traces to real, executed code: a real, deliberately suboptimal tree, a real, traced three-step exchange, and a real, direct match against three independently-derived optimal results.

### What breaks without this

Suppose an engineer needed to justify, to a skeptical colleague, *why* Kruskal's own greedy rule could be trusted — not just that it happened to work on test cases. Lesson 125's own proof by contradiction answers "why" for Dijkstra, but a contradiction-style proof doesn't show the actual mechanism by which a greedy choice fits into an optimal answer. This lesson's own real, step-by-step exchange is a concrete, followable answer: here is exactly how any non-greedy optimal tree can be edited, one swap at a time, into one containing the greedy choice, without ever getting worse.

### Exercises

1. **Observe.** Before checking, predict whether removing `B–C` (weight `2`) instead of `A–C` (weight `4`) as this lesson's own witness edge would still produce a valid, real spanning tree, using Concept Unit 2's own cycle-membership requirement to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, and compute the real resulting weight — is it still optimal?
3. **Formalize.** Construct a second, different real spanning tree `T`, also omitting the cheapest edge, and perform a real exchange on it, confirming the result is still a valid tree with weight `≤` the original.
4. **Explain.** In your own words, explain why the exchange argument specifically requires `e ≤ e'` (not just `e' `existing), referencing what would happen to `T'`'s own real weight if a cheaper witness edge were mistakenly chosen instead.
5. **Explain.** Using this lesson's real numbers, explain the difference between proof by contradiction (Lesson 125) and an exchange argument (this lesson), referencing what each one actually constructs versus what each one merely rules out.

### Definition of done

- [ ] You can state the MST exchange argument's three real steps and explain why each one is necessary.
- [ ] You can explain the real difference between proof by contradiction and a constructive exchange argument.
- [ ] You can point to this lesson's own real `9`-to-`6` numbers, and the final match against three independent results, as concrete, checked evidence.
- [ ] You completed Exercises 1–5, including a real, second exchange on a differently-constructed tree.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
