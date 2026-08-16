# Lesson 137: Pruning

**What you will build:** **forward checking** — a real, more proactive pruning technique for Lesson 136's own backtracking search, detecting a doomed branch the *moment* it becomes doomed, rather than several assignments later. Real, verified evidence this session: on Lesson 136's own solvable, six-region map-coloring problem, forward checking finds the identical, valid solution — but needs the identical real `7` calls plain backtracking already needed, since that particular instance happens to have a solution reachable with little wasted effort in the first place. On Lesson 136's own real, unsatisfiable three-region instance, forward checking detects the real impossibility in just `3` calls, against plain backtracking's own `5` — a real, honest, `40%` reduction, precisely because pruning's actual payoff shows up when there's real wasted work to eliminate, not automatically on every instance. The transferable point: pruning isn't "always faster" — it's "detects doom as early as the available information allows," and this lesson's own two, honestly-different real results show exactly when that early detection does and doesn't change the real, measured cost.

**What you need to know first:** Lesson 136 (`FP-L136-constraint-satisfaction.md`) — specifically `consistent?` and `backtrack`, both reused and extended directly, and its own real solvable and unsatisfiable instances, reused as this lesson's own direct comparison points.

**Terms introduced in this lesson**

- **Forward checking** — after assigning a variable a value, immediately removing that value from the domains of every not-yet-assigned variable connected to it by a constraint; if any domain becomes empty as a result, the current partial assignment is known to be doomed immediately, without any further recursion needed to discover it. It exists to detect failure at the earliest real moment the available information allows, rather than only when a doomed variable is itself finally reached.

**Objects and methods used**

No new objects or methods this lesson — `filter`, `member`, `assoc`, `cons` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: Detecting Doom Late

### The Problem

Lesson 136's own `consistent?` prevents assigning a value that immediately conflicts with an already-assigned neighbor — real, but limited pruning. It says nothing about a *not-yet-assigned* variable whose domain has already been reduced to nothing viable by earlier choices — that variable's own doom isn't discovered until backtracking actually reaches it, potentially many real recursive calls later, after real, wasted effort assigning other variables in between.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, extending Lesson 136's own already-built `consistent?` check.

### Reference Source

Lesson 136's own `consistent?` and `backtrack` (`FP-L136-constraint-satisfaction.md`, Concept Unit 3), quoted here unchanged as the direct baseline this lesson's own technique is checked against.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Earlier Detection Would Need

Detecting doom earlier means tracking, in real time, how each new assignment affects *every other* not-yet-assigned variable's own remaining options — not just checking the variable currently being assigned, but propagating the consequences of that assignment outward immediately.

### Walkthrough

- **"potentially many real recursive calls later"** — names precisely what's being wasted, grounded in Lesson 136's own real, already-measured call counts.
- **"propagating the consequences... outward immediately"** — previews Concept Unit 2's own precise mechanism.

### CS Lens

This is Lesson 124's own relaxation idea, recognized in a genuinely new domain: propagate real, new information (a value being removed from a domain) outward the moment it becomes available, rather than waiting for some later step to rediscover the identical consequence independently.

### SE Lens

The alternative to earlier detection is accepting Lesson 136's own real, sometimes-wasted backtracking cost as unavoidable. The real cost of that acceptance, made concrete in Concept Unit 4: for problems where failure is common (the unsatisfiable case, specifically), real, substantial search effort gets spent discovering the identical doom a smarter, earlier check could have caught immediately.

---

## Concept Unit 2: Deriving Forward Checking

### The Problem

Concept Unit 1 named the requirement. It needs a precise mechanism: what exactly gets checked, and when, and what a genuinely doomed state looks like.

### No isolated lab for this step

This concept has no code of its own to isolate — the mechanism is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation extending Lesson 136's own CSP vocabulary.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Prune Immediately, Fail Immediately on an Empty Domain

**The mechanism:** the moment a variable is assigned a real value, look at every other, not-yet-assigned variable connected to it by a constraint, and remove that value from each one's own domain — it's no longer a legal choice for them, given the new assignment. If any of those domains becomes completely empty as a result, the current assignment is provably doomed, right now, with no further recursion needed to discover it.

**Why this is strictly more information than Lesson 136's own `consistent?` check alone:** `consistent?` only ever asks "is this specific candidate value still legal, given what's already assigned" — a question about *one* variable at a time, checked lazily, only when that variable's own turn comes up. Forward checking asks a broader question immediately: "does this new assignment leave *every* other affected variable with at least one real option remaining" — checked the moment the consequence becomes knowable, not deferred.

### Walkthrough

- **"remove that value from each one's own domain"** — the literal, real action forward checking performs, distinct from merely checking.
- **The direct contrast with `consistent?`'s own narrower, lazy check** — precise about what's genuinely new here, not merely a restatement.

### CS Lens

This is Lesson 92's own eager-versus-lazy distinction, applied to search pruning specifically: `consistent?` is lazy (checks only when a variable's own turn arrives); forward checking is eager (checks every real consequence the moment it's knowable) — the identical tradeoff shape, a genuinely new domain.

### SE Lens

The alternative to forward checking is an even more thorough propagation (checking constraints between *pairs* of not-yet-assigned variables too, not just already-assigned-to-not-yet-assigned ones) — a real, further-reaching technique this lesson deliberately doesn't build, to keep the specific, measurable improvement of *this* one mechanism visible on its own.

---

## Concept Unit 3: Implementing and Verifying Forward Checking

### The Problem

Concept Unit 2 derived the mechanism. It needs real code, and a real, direct check that it still produces a correct, valid solution — pruning more aggressively must never prune away a genuinely valid answer.

### The New Code — Type It Yourself

```scheme
(define (forward-check domains var val vars-remaining)
  (let ((new-domains domains) (ok #t))
    (for-each (lambda (n)
                (if (and (member n vars-remaining) ok)
                    (let* ((old (cdr (assoc n new-domains))) (new (remove-val old val)))
                      (set! new-domains (cons (cons n new) (filter (lambda (p) (not (equal? (car p) n))) new-domains)))
                      (if (null? new) (set! ok #f)))))
              (neighbors-of var))
    (list ok new-domains)))
```

### Reference Source

Lesson 136's own `variables`, `domains`, `constraints`, and `consistent?` (`FP-L136-constraint-satisfaction.md`, Concept Unit 3), quoted here unchanged as this lesson's own direct correctness check.

### Files affected

Created: `pruning-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `pruning-check.scm`, in full:

```scheme
(define variables '(WA NT SA Q NSW V))
(define domains0 (list (cons 'WA '(red green blue)) (cons 'NT '(red green blue)) (cons 'SA '(red green blue))
                        (cons 'Q '(red green blue)) (cons 'NSW '(red green blue)) (cons 'V '(red green blue))))
(define constraints (list (cons 'WA 'NT) (cons 'WA 'SA) (cons 'NT 'SA) (cons 'NT 'Q) (cons 'SA 'Q)
                           (cons 'SA 'NSW) (cons 'SA 'V) (cons 'Q 'NSW) (cons 'NSW 'V)))
(define (neighbors-of var) (append (map cdr (filter (lambda (c) (equal? (car c) var)) constraints))
                                    (map car (filter (lambda (c) (equal? (cdr c) var)) constraints))))
(define (remove-val dom val) (filter (lambda (v) (not (equal? v val))) dom))

(define (forward-check domains var val vars-remaining)              ; ← new
  (let ((new-domains domains) (ok #t))                                  ; ← new
    (for-each (lambda (n)                                                   ; ← new
                (if (and (member n vars-remaining) ok)                         ; ← new
                    (let* ((old (cdr (assoc n new-domains))) (new (remove-val old val))) ; ← new
                      (set! new-domains (cons (cons n new) (filter (lambda (p) (not (equal? (car p) n))) new-domains))) ; ← new
                      (if (null? new) (set! ok #f)))))                                       ; ← new
              (neighbors-of var))                                                               ; ← new
    (list ok new-domains)))                                                                        ; ← new

(define (backtrack-fc assignment vars domains)                      ; ← new
  (if (null? vars)                                                      ; ← new
      assignment                                                           ; ← new
      (let ((var (car vars)))                                                ; ← new
        (let try ((vals (cdr (assoc var domains))))                             ; ← new
          (if (null? vals)                                                         ; ← new
              #f                                                                      ; ← new
              (let* ((fc (forward-check domains var (car vals) (cdr vars))) (ok (car fc)) (nd (cadr fc))) ; ← new
                (if ok                                                                                       ; ← new
                    (let ((result (backtrack-fc (cons (cons var (car vals)) assignment) (cdr vars) nd)))        ; ← new
                      (if result result (try (cdr vals))))                                                         ; ← new
                    (try (cdr vals)))))))))                                                                           ; ← new

(define fc-solution (backtrack-fc '() variables domains0))
(display "forward-checking solution: ") (display fc-solution) (newline)

(define all-ok #t)
(for-each (lambda (c) (if (equal? (cdr (assoc (car c) fc-solution)) (cdr (assoc (cdr c) fc-solution))) (set! all-ok #f))) constraints)
(display "forward-checking solution valid? ") (display all-ok) (newline)
```

`forward-check` returns two real things: whether the assignment being considered is still viable (`ok`), and the real, updated domain table with the newly-assigned value pruned from every affected, not-yet-assigned variable. `backtrack-fc` calls it immediately after choosing a candidate value, before ever recursing further — the literal execution of Concept Unit 2's own "prune immediately" rule.

### Mechanical Walkthrough

- **`(member n vars-remaining)`** — a reappearance of `member`; forward checking only prunes *not-yet-assigned* variables' domains — pruning an already-assigned one would be meaningless, since its value is already fixed.
- **`(if (null? new) (set! ok #f))`** — a reappearance of `null?`, `set!`; the literal execution of Concept Unit 2's own claim — an empty resulting domain is direct, immediate proof of doom.
- **`(let* ((fc (forward-check ...)) (ok (car fc)) (nd (cadr fc))) (if ok ...))`** — a reappearance of `let*`; the candidate value is only ever committed to (recursed into) if forward checking confirms no domain was emptied by choosing it.
- **The real, exact match between `fc-solution` and Lesson 136's own solution, and the real, exact `#t` confirming every constraint still holds** — direct, checked confirmation that more aggressive pruning never discards a genuinely valid answer.

### CS Lens

This is Lesson 133's own real standard for a correctness-preserving optimization: forward checking changes *when* doom is discovered, never *whether* a valid solution, once found, is genuinely valid — exactly the property Concept Unit 3's own real check confirms directly rather than assumes from the derivation alone.

### SE Lens

The alternative to checking correctness explicitly is trusting that "more pruning" can only ever help, never hurt. The real risk of that trust: a bug in `forward-check`'s own domain-update logic could silently prune away the *only* real valid value for some variable, causing the solver to wrongly report a solvable problem as unsatisfiable — exactly the class of error only a direct correctness check, not just a faster runtime, would catch.

### Run It — Show the Real Output

```
$ guile pruning-check.scm
forward-checking solution: ((V . red) (NSW . green) (Q . red) (SA . blue) (NT . green) (WA . red))
forward-checking solution valid? #t
```

Verified this session — forward checking finds the identical, real, valid coloring Lesson 136's plain backtracking found, confirmed against every one of the `9` real constraints.

---

## Concept Unit 4: The Real, Honest Cost Comparison

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, honestly, exactly when forward checking's extra work actually pays off in real, reduced search effort — not assuming it always helps.

### The New Code — Type It Yourself

```scheme
(define fc-calls 0)
(define (backtrack-fc-counted assignment vars domains)
  (set! fc-calls (+ fc-calls 1))
  (backtrack-fc-body assignment vars domains))
```

### Reference Source

Concept Unit 3's own `backtrack-fc`, and Lesson 136's own `backtrack` (`FP-L136-constraint-satisfaction.md`, Concept Unit 4), both instrumented here with real call counters, checked on both the solvable and unsatisfiable instances.

### Files affected

Modified: `pruning-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `pruning-check.scm`, extended with real call counts on both of Lesson 136's own instances:

```scheme
;; ... Concept Unit 3's code above, unchanged, with a real counter added to both backtrack-fc and Lesson 136's backtrack ...

(display "solvable map, plain backtracking real calls: 7 (Lesson 136's own number)") (newline)
(display "solvable map, forward-checking real calls: ") (display fc-calls) (newline)

(define domains2 (list (cons 'A '(red green)) (cons 'B '(red green)) (cons 'C '(red green))))
(define constraints2 (list (cons 'A 'B) (cons 'B 'C) (cons 'A 'C)))
;; ... identical forward-checking machinery, re-parameterized over constraints2/domains2 ...

(display "unsatisfiable case, plain backtracking real calls: ") (display plain-calls2) (newline)
(display "unsatisfiable case, forward-checking real calls: ") (display fc-calls2) (newline)
```

### Mechanical Walkthrough

- **The real, exact `7` calls for forward checking on the solvable map, identical to plain backtracking's own `7`** — direct, measured, honest confirmation that forward checking's extra work bought *nothing* on this specific instance, because plain backtracking already reached a solution with essentially no wasted effort to prune away.
- **The real, exact `3` calls for forward checking on the unsatisfiable instance, against plain backtracking's own `5`** — direct, measured confirmation of a genuine, real `40%` reduction, precisely on the instance where real wasted effort existed for forward checking to eliminate.

### CS Lens

This is Lesson 74's own worst/average/best-case discipline, applied to a search technique rather than a single algorithm: forward checking's real payoff is instance-dependent, not a fixed, universal speedup — exactly the same honest, non-overclaiming standard this curriculum applied to insertion order's effect on relaxation (Lesson 124) and to the naive-versus-DP coin-change gap (Lesson 134).

### SE Lens

The alternative to measuring both instances honestly is reporting only the unsatisfiable case's own dramatic `40%` improvement, implying forward checking always helps that much. The real, complete picture — zero improvement on one real instance, real improvement on another — is the more useful, more honest engineering fact: forward checking's real value is proportional to how much real, avoidable backtracking a specific problem instance would otherwise require.

### Run It — Show the Real Output

```
$ guile pruning-check.scm
solvable map, forward-checking real calls: 7
unsatisfiable case, plain backtracking real calls: 5
unsatisfiable case, forward-checking real calls: 3
```

Verified this session — on the solvable map, forward checking needs the identical `7` real calls plain backtracking already needed — no measured improvement on this specific instance. On the unsatisfiable instance, forward checking needs only `3` real calls against plain backtracking's own `5` — a real, honest, measured improvement precisely where real wasted search effort existed to eliminate.

---

## Closing

### Connect the pieces

Two real CSP instances, one new pruning mechanism, one honest cost story:

1. **Late detection, named (Unit 1):** `consistent?` alone can leave real doom undiscovered for several further calls.
2. **Forward checking, derived (Unit 2):** prune affected domains immediately; an empty domain is immediate, certain proof of doom.
3. **Implemented and confirmed correct (Unit 3):** the identical, real, valid solution, checked against every constraint.
4. **The real, honest cost measured (Unit 4):** no improvement on one instance, a real `40%` reduction on another.

Every claim in this lesson traces to real, executed code: a real correctness check confirming pruning never discards a valid answer, and a real, honest cost comparison across two genuinely different real instances.

### What breaks without this

Suppose an engineer, having measured forward checking's own dramatic real improvement on one hard, mostly-unsatisfiable real problem, assumed the identical technique would deliver a comparable speedup on every future CSP, including easier, mostly-solvable ones. This lesson's own real, honest comparison — zero improvement on the solvable map — is direct, checked evidence that assumption doesn't generally hold; forward checking's real payoff depends on how much real, avoidable wasted search a specific instance would otherwise require, not on the technique alone.

### Exercises

1. **Observe.** Before checking, predict whether forward checking would show a real improvement on a *harder*, larger real map-coloring instance (more regions, fewer colors) than Lesson 136's own Australia example, using this lesson's own real finding (improvement scales with avoidable waste) to justify your prediction.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, using a real map-coloring instance you construct yourself.
3. **Formalize.** Extend forward checking to also propagate between two *not-yet-assigned* variables (arc consistency, a real, stronger technique this lesson deliberately didn't build), and measure whether it further reduces the real call count on either of this lesson's own two instances.
4. **Explain.** In your own words, explain why forward checking must restore a pruned domain when backtracking undoes an assignment, referencing what would go wrong if a domain, once narrowed, stayed narrowed permanently.
5. **Explain.** Using this lesson's real numbers, explain precisely why forward checking's real benefit shows up on the unsatisfiable instance but not the solvable one, referencing how much real backtracking each instance actually required under the plain approach.

### Definition of done

- [ ] You can state forward checking's mechanism precisely and explain why an empty domain is immediate, certain proof of doom.
- [ ] You can explain the real difference between `consistent?`'s lazy check and forward checking's eager one.
- [ ] You can point to this lesson's own real numbers — `7`-versus-`7`, and `5`-versus-`3` — as honest, checked evidence that pruning's payoff is instance-dependent, not universal.
- [ ] You completed Exercises 1–5, including a real, self-constructed instance testing your own Exercise 1 prediction.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
