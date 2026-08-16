# Lesson 136: Constraint Satisfaction

**What you will build:** a real **constraint satisfaction problem (CSP)** — variables, domains, and constraints, formalized precisely — solved with Lesson 50's own backtracking search, applied to a genuinely new representation for the first time. Real, verified evidence this session: a real, six-region map-coloring problem (Australia's own states and territories, a classic real CSP instance), with three real colors and nine real adjacency constraints, is solved in `7` real backtrack calls, producing a coloring where every one of the `9` constraints is confirmed genuinely satisfied. A second, deliberately unsatisfiable CSP — three mutually adjacent regions, only two colors — is correctly reported as having no solution at all, `#f`, not a wrong answer. The transferable point: Lesson 135 generalized BFS's own notion of "state" beyond literal graphs; this lesson does the identical thing for Lesson 50's own backtracking search — the real, general shape underneath "try a value, recurse, undo if it doesn't work out" applies directly to any problem precisely describable as variables, their possible values, and the rules relating them.

**What you need to know first:** Lesson 50 (`FP-L050-backtracking.md`) — specifically the try-recurse-undo backtracking shape, reused directly and applied to a CSP for the first time. Lesson 135 (`FP-L135-state-space-search.md`) — specifically the real generalization move (a known algorithm, applied to a new, precisely-defined kind of problem), the identical move this lesson makes for backtracking instead of BFS.

**Terms introduced in this lesson**

- **Constraint satisfaction problem (CSP)** — a problem defined by a set of variables, each with a domain of possible values, and a set of constraints restricting which combinations of values are jointly allowed. It exists to give "assign values so every rule holds" a precise, general shape, applicable across many real, differently-described problems.
- **Consistent (assignment)** — a partial assignment of values to variables that violates none of the problem's real constraints, checked only against variables already assigned. It exists to name, precisely, the real check backtracking performs before committing to any candidate value.

**Objects and methods used**

No new objects or methods this lesson — `assoc`, `for-each`, `cons` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: Backtracking, Generalized a Second Time

### The Problem

Lesson 50 derived backtracking directly from a specific problem's own shape. Lesson 135 already showed that a known search algorithm's real correctness doesn't depend on the specific domain it was first derived for — only on satisfying the algorithm's own real requirements. A real, open question: does backtracking generalize the identical way, to *any* problem describable precisely enough as "variables, values, and rules"?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, extending Lesson 135's own generalization move to Lesson 50's own algorithm.

### Reference Source

No reference counterpart — the motivating question draws on Lesson 50 and 135's own already-established work, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Precise CSP Description Needs

A real, checkable CSP description needs three real pieces, stated with the identical precision Lesson 113 demanded of a graph: the full list of variables needing values, each variable's own domain of legal candidate values, and every real constraint restricting which combinations are jointly allowed.

### Walkthrough

- **The direct citation of Lesson 135's own generalization move** — frames this lesson as continuing an already-established pattern, not starting a new one.
- **The three real, named pieces** — previews Concept Unit 2's own precise definitions exactly.

### CS Lens

This is Lesson 84's own abstraction discipline, applied to a search *algorithm* for the second time in two lessons: Lesson 50's `backtrack`-shaped recursion was written against the behavior "try a candidate, recurse, undo on failure," never against any one problem's specific representation of "candidate."

### SE Lens

The alternative to recognizing this generalization is treating every new "assign values under constraints" problem — scheduling, puzzle-solving, resource allocation — as needing its own from-scratch search algorithm. The real cost of that alternative: re-deriving and re-testing the identical try-recurse-undo logic repeatedly, instead of reusing Lesson 50's own already-correct shape.

---

## Concept Unit 2: Defining Variables, Domains, and Constraints Precisely

### The Problem

Concept Unit 1 named the three real pieces informally. It needs precise definitions, and a precise, checkable notion of when a partial assignment is still viable.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation applying Lesson 50's own backtracking shape to a newly, precisely defined problem class.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Three Definitions, and One Real Check

**Variables:** the real, finite set of things needing a value — regions on a map, in this lesson's own real example.

**Domain:** for each variable, the real, finite set of values it could possibly take — the available colors, here.

**Constraint:** a real, checkable rule restricting which combinations of two (or more) variables' values are jointly allowed — "these two adjacent regions must not share a color," in this lesson's own example.

**Consistent, precisely:** a partial assignment (some variables already given values, others not yet) is consistent exactly when none of the constraints *involving only already-assigned variables* are violated. Checking consistency only against what's already assigned — never demanding the whole assignment be complete first — is precisely what lets backtracking abandon a doomed partial assignment early, before wasting further real work extending it.

### Walkthrough

- **All three definitions grounded in the concrete map-coloring example, before any code exists** — matches Lesson 113's own "graph as a relation" derivation style.
- **"checking consistency only against what's already assigned"** — the precise detail Concept Unit 3's own real code implements, and the reason backtracking can prune early.

### CS Lens

This is Lesson 50's own pruning idea, restated with a precise, general vocabulary: "abandon a branch the moment it's provably doomed" only works if "provably doomed" has a real, checkable test — exactly what `consistent?`'s own partial-assignment check provides.

### SE Lens

The alternative to checking consistency incrementally, as each variable is assigned, is waiting until every variable has a value and checking all constraints only then. The real cost of that alternative: real, wasted search effort exploring branches already doomed by an early, already-assigned variable, before ever discovering the problem.

---

## Concept Unit 3: Implementing and Verifying a Real CSP Solver

### The Problem

Concept Unit 2 defined the pieces. It needs real code, and a real, checkable solution to a genuine CSP instance, verified against every one of its own real constraints.

### The New Code — Type It Yourself

```scheme
(define (backtrack assignment vars)
  (if (null? vars)
      assignment
      (let ((var (car vars)))
        (let try ((vals (cdr (assoc var domains))))
          (if (null? vals)
              #f
              (if (consistent? assignment var (car vals))
                  (let ((result (backtrack (cons (cons var (car vals)) assignment) (cdr vars))))
                    (if result result (try (cdr vals))))
                  (try (cdr vals))))))))
```

### Reference Source

No reference counterpart — a from-scratch CSP formulation of a real, well-known problem (map coloring), using Lesson 50's own try-recurse-undo backtracking shape, quoted from memory as read earlier in this curriculum, not verbatim reused.

### Files affected

Created: `csp-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `csp-check.scm`, in full:

```scheme
(define variables '(WA NT SA Q NSW V))
(define domains (list (cons 'WA '(red green blue)) (cons 'NT '(red green blue)) (cons 'SA '(red green blue))
                       (cons 'Q '(red green blue)) (cons 'NSW '(red green blue)) (cons 'V '(red green blue))))
(define constraints (list (cons 'WA 'NT) (cons 'WA 'SA) (cons 'NT 'SA) (cons 'NT 'Q) (cons 'SA 'Q)
                           (cons 'SA 'NSW) (cons 'SA 'V) (cons 'Q 'NSW) (cons 'NSW 'V)))

(define (consistent? assignment var val)                            ; ← new
  (let ((ok #t))                                                        ; ← new
    (for-each (lambda (c)                                                  ; ← new
                (cond ((equal? (car c) var)                                   ; ← new
                       (let ((other (assoc (cdr c) assignment)))                 ; ← new
                         (if (and other (equal? (cdr other) val)) (set! ok #f)))) ; ← new
                      ((equal? (cdr c) var)                                          ; ← new
                       (let ((other (assoc (car c) assignment)))                        ; ← new
                         (if (and other (equal? (cdr other) val)) (set! ok #f))))))         ; ← new
              constraints)                                                                     ; ← new
    ok))                                                                                          ; ← new

(define (backtrack assignment vars)                                 ; ← new
  (if (null? vars)                                                      ; ← new
      assignment                                                           ; ← new
      (let ((var (car vars)))                                                ; ← new
        (let try ((vals (cdr (assoc var domains))))                             ; ← new
          (if (null? vals)                                                         ; ← new
              #f                                                                      ; ← new
              (if (consistent? assignment var (car vals))                               ; ← new
                  (let ((result (backtrack (cons (cons var (car vals)) assignment) (cdr vars)))) ; ← new
                    (if result result (try (cdr vals))))                                            ; ← new
                  (try (cdr vals))))))))                                                               ; ← new

(define solution (backtrack '() variables))
(display "a real, valid coloring: ") (display solution) (newline)

(define all-ok #t)
(for-each (lambda (c) (if (equal? (cdr (assoc (car c) solution)) (cdr (assoc (cdr c) solution))) (set! all-ok #f))) constraints)
(display "every real constraint satisfied? ") (display all-ok) (newline)
```

`consistent?` checks a candidate value against every real constraint touching the variable being assigned, but only against *other* variables already present in `assignment` — exactly Concept Unit 2's own precise rule. `backtrack` tries each of a variable's domain values in turn; on a genuine dead end (every value fails, or every remaining variable's own attempt fails), it returns `#f` and the caller tries its own next value — the literal try-recurse-undo shape.

### Mechanical Walkthrough

- **`(assoc (cdr c) assignment)`** — a reappearance of `assoc`; checks whether the *other* variable in a constraint already has a value, exactly Concept Unit 2's own "only against what's already assigned" rule.
- **`(let try ((vals ...)) (if (null? vals) #f ...))`** — a reappearance of named-let recursion; walks a variable's own domain, one candidate at a time, returning `#f` only once every real candidate has been exhausted.
- **`(let ((result (backtrack ...))) (if result result (try (cdr vals))))`** — a reappearance of `let`, `if`; the literal "undo" step — a failed deeper attempt (`result` is `#f`) causes the *current* variable to try its own next candidate value, not give up entirely.
- **The real, exact valid coloring, and the real, exact `#t` confirming all `9` constraints hold** — direct, checked confirmation the solver produces a genuinely correct answer, not merely one that terminates.

### CS Lens

This is Lesson 50's own recursive shape, confirmed to transfer completely intact: nothing about `backtrack`'s own structure changed from a generic "try, recurse, undo" description to this specific CSP solver — only what counts as a "candidate" and a "valid choice" changed.

### SE Lens

The alternative to checking all `9` real constraints is trusting that `backtrack`'s own successful termination implies correctness. The real value of the explicit check: a subtle bug in `consistent?` — checking the wrong direction of a constraint pair, for instance — could produce a real, terminating, but genuinely invalid coloring that only a direct, per-constraint check would catch.

### Run It — Show the Real Output

```
$ guile csp-check.scm
a real, valid coloring: ((V . red) (NSW . green) (Q . red) (SA . blue) (NT . green) (WA . red))
every real constraint satisfied? #t
```

Verified this session — a real, valid coloring for all six regions, and a real, direct check confirming every one of the `9` real adjacency constraints genuinely holds, not merely that the search terminated with *some* answer.

---

## Concept Unit 4: A Real Unsatisfiable Case, and the Real Cost of Search

### The Problem

Concept Unit 3 confirmed a real, solvable CSP works correctly. It's worth checking the other real, important case directly: does the solver correctly recognize when *no* solution exists at all, rather than returning a wrong one or failing to terminate?

### The New Code — Type It Yourself

```scheme
(define domains2 (list (cons 'A '(red green)) (cons 'B '(red green)) (cons 'C '(red green))))
(define constraints2 (list (cons 'A 'B) (cons 'B 'C) (cons 'A 'C)))
```

### Reference Source

No reference counterpart — a deliberately constructed, real, unsatisfiable CSP: three mutually adjacent regions, forced to pairwise differ, with only two real colors available.

### Files affected

Modified: `csp-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `csp-check.scm`, extended with a real, unsatisfiable instance and a real call-count:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define calls 0)                                                     ; ← new
(define (backtrack-counted assignment vars)                             ; ← new
  (set! calls (+ calls 1))                                                 ; ← new
  (if (null? vars) assignment
      (let ((var (car vars)))
        (let try ((vals (cdr (assoc var domains))))
          (if (null? vals) #f
              (if (consistent? assignment var (car vals))
                  (let ((result (backtrack-counted (cons (cons var (car vals)) assignment) (cdr vars))))
                    (if result result (try (cdr vals))))
                  (try (cdr vals))))))))
(set! calls 0)
(backtrack-counted '() variables)
(display "real backtrack calls for the solvable map: ") (display calls) (newline)

(define domains2 (list (cons 'A '(red green)) (cons 'B '(red green)) (cons 'C '(red green)))) ; ← new
(define constraints2 (list (cons 'A 'B) (cons 'B 'C) (cons 'A 'C)))                               ; ← new
(define (consistent2? assignment var val)
  (let ((ok #t))
    (for-each (lambda (c)
                (cond ((equal? (car c) var) (let ((other (assoc (cdr c) assignment))) (if (and other (equal? (cdr other) val)) (set! ok #f))))
                      ((equal? (cdr c) var) (let ((other (assoc (car c) assignment))) (if (and other (equal? (cdr other) val)) (set! ok #f))))))
              constraints2)
    ok))
(define (backtrack2 assignment vars)
  (if (null? vars) assignment
      (let ((var (car vars)))
        (let try ((vals (cdr (assoc var domains2))))
          (if (null? vals) #f
              (if (consistent2? assignment var (car vals))
                  (let ((result (backtrack2 (cons (cons var (car vals)) assignment) (cdr vars))))
                    (if result result (try (cdr vals))))
                  (try (cdr vals))))))))
(display "unsatisfiable CSP (3 mutual neighbors, 2 colors), real result: ") (display (backtrack2 '() '(A B C))) (newline)
```

### Mechanical Walkthrough

- **`(set! calls (+ calls 1))`** — a reappearance of `set!`; counts every real recursive invocation, the identical instrumentation discipline this Era has used since Lesson 92.
- **`'(A B C)` with domains of only two real colors each, and all three pairwise constrained** — a real, minimal unsatisfiable instance: any two of the three can be colored differently, but the third necessarily clashes with one of the other two, regardless of order tried.
- **The real, exact `7` backtrack calls for the solvable map, and the real, exact `#f` for the unsatisfiable one** — direct, checked confirmation of two separate, real claims: the solver finds a genuine answer efficiently when one exists, and correctly reports none when none does, rather than either returning a wrong coloring or failing to terminate.

### CS Lens

This is Lesson 50's own base-case discipline, checked directly for a genuinely different problem: "no candidate works" propagating cleanly back up through every level of recursion, eventually reaching the very first variable and correctly reporting total failure, is the identical mechanism that made backtracking terminate correctly for its original problem.

### SE Lens

The alternative to testing an unsatisfiable instance is only ever testing solvable ones. The real risk of that gap: a solver that happens to work whenever a solution exists could still loop forever, or crash, or silently return a wrong answer, on the equally real, equally common case where no solution exists at all — exactly the case this unit's own real, direct check confirms is handled correctly.

### Run It — Show the Real Output

```
$ guile csp-check.scm
real backtrack calls for the solvable map: 7
unsatisfiable CSP (3 mutual neighbors, 2 colors), real result: #f
```

Verified this session — the real, solvable six-region map is solved in `7` real backtrack calls. The real, deliberately unsatisfiable three-region instance correctly returns `#f`, confirming the solver distinguishes "no solution exists" from any wrong answer.

---

## Closing

### Connect the pieces

Six regions, three colors, one real solver, one real impossible case:

1. **The generalization, motivated (Unit 1):** backtracking's own real shape, extended to any precisely-describable CSP.
2. **Variables, domains, constraints, and consistency, defined precisely (Unit 2):** a real, checkable rule for pruning doomed partial assignments early.
3. **Implemented and directly checked (Unit 3):** a real, valid coloring, every one of `9` constraints confirmed genuinely satisfied.
4. **The unsatisfiable case, checked directly (Unit 4):** `7` real calls for a solvable instance; a correct `#f` for an impossible one.

Every claim in this lesson traces to real, executed code: a real CSP solved and exhaustively checked against its own constraints, and a real, deliberately unsatisfiable instance confirming the solver reports failure correctly rather than looping or guessing.

### What breaks without this

Suppose a real scheduling system needed to assign time slots to a set of meetings under real conflict-of-interest constraints, and an engineer, unfamiliar with the CSP vocabulary, wrote ad hoc, problem-specific search code rather than recognizing the problem as a real instance of Lesson 50's own already-trusted backtracking shape. The real risk: reinventing consistency-checking and undo logic from scratch, with no guarantee it correctly distinguishes a genuinely impossible schedule from a bug in the search itself — exactly the two real, separately-checked cases this lesson's own Concept Unit 3 and 4 confirm are handled correctly.

### Exercises

1. **Observe.** Before checking, predict whether reordering `variables` (coloring `V` first instead of `WA`) would change the real number of backtrack calls needed, using this lesson's own real call count, `7`, to justify your prediction.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Reduce the map-coloring problem to only `2` real colors, and confirm, with real code, whether it remains solvable — Australia's own real map is a well-known case worth checking directly rather than assuming.
4. **Explain.** In your own words, explain why `consistent?` only ever checks constraints against *already-assigned* variables, referencing what would go wrong — or simply be impossible to check — if it tried to check against every variable regardless of whether it had a value yet.
5. **Explain.** Using this lesson's real numbers, explain the real difference between "the search terminated" and "the search found a correct answer," referencing why Concept Unit 3's own explicit constraint check was necessary in addition to Concept Unit 3's own successful `backtrack` call.

### Definition of done

- [ ] You can state the precise definitions of variable, domain, constraint, and consistent assignment.
- [ ] You can explain why Lesson 50's own backtracking shape needed no structural changes to solve a CSP.
- [ ] You can point to this lesson's own real numbers — `7` calls, `9` confirmed constraints, a correct `#f` — as concrete, checked evidence of correctness on both the solvable and unsatisfiable cases.
- [ ] You completed Exercises 1–5, including a real, checked reduction to two colors.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
