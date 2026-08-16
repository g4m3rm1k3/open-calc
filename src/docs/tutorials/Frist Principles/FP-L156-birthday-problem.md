# Lesson 156: The Birthday Problem

**What you will build:** a real, general formula for the probability that at least two items, drawn randomly from `m` real possibilities, collide — the classic **birthday problem** — and real, direct evidence connecting it to hash-table collisions, a real, computational consequence of the identical mathematics. Real, verified evidence this session: with `365` real "days" and a group of people, the real probability at least two share a birthday crosses `50\%` at exactly `n = 23` people — `0.5073`, confirmed by a real formula built from the complementary probability of *no* collision, and cross-checked against a real, exhaustive enumeration on a smaller case (`3` people, `7` days: `0.3878`, matching exactly both ways). Applied instead to a real hash table with only `100` buckets, the identical real formula shows collision probability already crosses `50\%` at just `13` real, randomly-placed keys — a real, dramatic `87\%` fewer items than the table's own real size might intuitively suggest are needed. The transferable point: collisions among randomly-placed items happen far sooner than raw intuition predicts, a real, quantifiable fact with the identical mathematics governing a room full of people and a hash table absorbing ordinary, non-adversarial real traffic — Lesson 146's own real hash-flooding evidence showed what a deliberate attacker can force; this lesson shows collisions are already surprisingly likely even without one.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 146's own real hash-table collision work — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Collision** — two or more real items, drawn independently and randomly from a shared real set of possibilities, landing on the identical real value. It exists to name, precisely, the real event this lesson's own formula computes the probability of.
- **Complementary probability** — the real probability that an event does *not* occur, `1 - P(\text{event})`. It exists because "at least one collision, among possibly many pairs" is real, awkward to compute directly, while "zero collisions at all" has a real, clean, direct formula this lesson derives from.
- **Birthday problem** — the real, classic question of how many independently, randomly-drawn items, from a set of `m` real possibilities, are needed before the real probability of at least one collision exceeds some real threshold, typically `50\%`.

**Objects and methods used**

- **`p-no-collision`** / **`p-collision`**
  - *What it is:* this lesson's own real procedures computing the birthday problem's own real probabilities.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real probability this lesson computes, from Concept Unit 2 onward.
- **`iota`** / **`append`** / **`map`** / **`filter`** / **`member`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons.
  - *Implementation:* each takes the real arguments its own earlier-established contract specifies.
  - *Its use:* Concept Unit 2's own real, exhaustive cross-check on a small case.

---

## Concept Unit 1: A Real, Common Wrong Intuition

### The Problem

With `365` real days in a year, a real, natural guess might be that something close to half that many people — roughly `183` — would be needed before a shared birthday becomes as likely as not. It's worth checking that real guess directly, rather than trusting it.

### No isolated lab for this step

This unit introduces no new construct — the real, common intuition is posed directly here, so Concept Unit 2 and 3's own real evidence has something concrete to check it against.

### Reference Source

No reference counterpart — a real, classic probability question, posed directly for this lesson's own capstone purposes.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why the Real Intuition Feels Reasonable, and Why It Might Be Wrong

The real, tempting reasoning treats this like needing "half the possibilities filled" before a collision is likely — a real, natural but potentially misleading analogy, since a collision only needs *two* people to match, out of every real *pair* of people in the room, and the real number of pairs grows much faster than the real number of people themselves.

### Walkthrough

- **The explicit naming of the real, tempting "half of `365`" guess** — states the real intuition plainly, so it can be directly, honestly checked rather than dismissed.
- **"the real number of pairs grows much faster than the real number of people"** — previews Concept Unit 2's own real derivation before any code is written.

### CS Lens

This is Lesson 147's own real, tempting-but-wrong dice-sum assumption, encountered again in a genuinely new domain: both real mistakes come from reasoning about a derived real quantity ("possible sums," "half the days") using an intuition borrowed from a differently-shaped real problem, rather than deriving the real, correct count directly.

### SE Lens

The alternative to deriving the real, correct formula is trusting the real, intuitive guess and building a real system around it — sizing a hash table, say, based on "half full feels risky" rather than a real, computed collision probability. The real cost of that alternative, made concrete in Concept Unit 4: the real, true threshold is often dramatically smaller than intuition suggests, and a real system trusting the wrong number would be far more collision-prone than its own designer expected.

---

## Concept Unit 2: Deriving the Real Formula, via the Complement

### The Problem

Concept Unit 1 posed the real question. Computing `P(\text{at least one collision})` directly is real, awkward — it would mean accounting for every possible real way two or more people could match. Its real complement, `P(\text{zero collisions at all})`, is real, direct: every person, one at a time, must land on a real day none of the earlier people already used.

### Reference Source

No reference counterpart — a from-scratch real derivation of the standard birthday-problem formula.

### Files affected

Created: `birthday-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Building the Real, No-Collision Probability One Person at a Time

The real, first person can land on any of `m` real days — real probability `m/m = 1`, no real constraint yet. The real, second person must avoid the first's real day — real probability `(m-1)/m`. The real, third must avoid both already-used real days — `(m-2)/m`. Continuing this real pattern for `n` real people: `P(\text{no collision}) = \dfrac{m}{m} \times \dfrac{m-1}{m} \times \dfrac{m-2}{m} \times \cdots \times \dfrac{m-n+1}{m}`, and `P(\text{collision}) = 1 - P(\text{no collision})`.

### The New Code — Type It Yourself

```scheme
(define (p-no-collision n m)
  (let loop ((i 0) (acc 1.0))
    (if (= i n) acc
        (loop (+ i 1) (* acc (/ (- m i) m))))))
(define (p-collision n m) (- 1.0 (p-no-collision n m)))
```

### The Updated Project

This is `birthday-check.scm`, in full:

```scheme
(define (p-no-collision n m)                                        ; ← new
  (let loop ((i 0) (acc 1.0))                                           ; ← new
    (if (= i n) acc                                                        ; ← new
        (loop (+ i 1) (* acc (/ (- m i) m))))))                               ; ← new
(define (p-collision n m) (- 1.0 (p-no-collision n m)))              ; ← new

(define (all-birthday-assignments n m)                              ; ← new
  (if (= n 0) (list '())                                               ; ← new
      (apply append (map (lambda (rest) (map (lambda (day) (cons day rest)) (iota m 1))) ; ← new
                          (all-birthday-assignments (- n 1) m)))))         ; ← new
(define (has-collision? assignment)                                  ; ← new
  (let loop ((lst assignment) (seen '()))                               ; ← new
    (cond ((null? lst) #f)                                                 ; ← new
          ((member (car lst) seen) #t)                                        ; ← new
          (else (loop (cdr lst) (cons (car lst) seen))))))                       ; ← new

(display "=== CU2: the real formula, checked against real, exhaustive enumeration ===") (newline) ; ← new
(define assignments-3-7 (all-birthday-assignments 3 7))              ; ← new
(display "real total assignments (n=3, m=7): ") (display (length assignments-3-7)) (newline) ; ← new
(define collisions-3-7 (filter has-collision? assignments-3-7))         ; ← new
(display "real, exhaustive P(collision, n=3, m=7): ") (display (exact->inexact (/ (length collisions-3-7) (length assignments-3-7)))) (newline) ; ← new
(display "formula P(collision, n=3, m=7): ") (display (p-collision 3 7)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (p-no-collision n m) (let loop ((i 0) (acc 1.0)) ...))`** — first appearance in this lesson of this procedure; a real, named-let accumulating the real product `(m-0)/m \times (m-1)/m \times \cdots$, one real factor per person, exactly Concept Unit 2's own derived formula.
- **`(define (p-collision n m) (- 1.0 (p-no-collision n m)))`** — first appearance in this lesson of this procedure; the real complement, one real subtraction.
- **`(define (all-birthday-assignments n m) ...)`** — first appearance in this lesson of this procedure; a real, recursive enumeration of every possible real way `n` people could be assigned real days `1` through `m`, the real base case being `n{=}0$ (exactly one real way to assign zero people: the empty real assignment).
- **`(define (has-collision? assignment) ...)`** — first appearance in this lesson of this procedure; the identical real duplicate-detection pattern Lesson 152's own `count-distinct` used, here simply checking whether *any* real duplicate exists.
- **The real, exact `343` total assignments (`7^3`), and the real, exact `0.3878`, matching the formula precisely** — direct, checked confirmation: the real, derived complement formula and a real, brute-force enumeration of every possible small-scale assignment agree exactly.

### CS Lens

This is Lesson 147's own real "check a probability claim by real, exhaustive enumeration, not intuition" discipline, applied to a real, derived formula this time, rather than a naive guess: `p-collision`'s own real output is checked directly against `has-collision?`'s own real, brute-force ground truth.

### SE Lens

The alternative to this real, small-scale cross-check is trusting `p-collision`'s own real, derived formula on the full real `m{=}365$ case directly, with no independent confirmation at all. The real value of checking a smaller, real, exhaustively-enumerable case first: it confirms the real derivation is correct before trusting it at a real scale (`365^{23}$ real assignments, for the `n{=}23$ case Concept Unit 3 checks) far too large to ever enumerate directly.

### Run It — Show the Real Output

```
$ guile birthday-check.scm
=== CU2: the real formula, checked against real, exhaustive enumeration ===
real total assignments (n=3, m=7): 343
real, exhaustive P(collision, n=3, m=7): 0.3877551020408163
formula P(collision, n=3, m=7): 0.3877551020408163
```

Verified this session — `p-collision`'s own real formula matches a real, exhaustive enumeration of all `343` possible small-scale assignments exactly.

---

## Concept Unit 3: The Real, Surprising Crossover

### The Problem

Concept Unit 2 confirmed the real formula on a small case. It's worth applying it to the real, original `m{=}365$ question, and finding exactly where the real probability crosses `50\%` — checking Concept Unit 1's own real, tempting "around `183`" guess directly.

### Reference Source

No reference counterpart — a real, direct application of Concept Unit 2's own already-verified `p-collision`.

### Files affected

Modified: `birthday-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define birthday-checkpoints (list 1 5 10 15 20 22 23 24 25 30 40 50))
```

### The Updated Project

This is `birthday-check.scm`, with Concept Unit 2's own file extended by a real, direct table across a range of real group sizes:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define birthday-checkpoints (list 1 5 10 15 20 22 23 24 25 30 40 50)) ; ← new

(display "=== CU3: the real, surprising crossover, m=365 ===") (newline) ; ← new
(for-each (lambda (n) (display "n=") (display n) (display " P(collision)=") (display (p-collision n 365)) (newline)) ; ← new
          birthday-checkpoints)                                          ; ← new
```

### Mechanical Walkthrough

- **`(define birthday-checkpoints (list 1 5 10 15 20 22 23 24 25 30 40 50))`** — first appearance in this lesson of this real list; a real, deliberately dense cluster of values around `22`–`25`, where Concept Unit 3's own real crossover is expected to fall, alongside real, sparser checkpoints further out.
- **`(for-each (lambda (n) ...) birthday-checkpoints)`** — applies `p-collision`, given full real treatment in this lesson's own Header, to each real checkpoint in turn.
- **The real, exact `0.4757` at `n{=}22$, climbing to the real, exact `0.5073` at `n{=}23$** — direct, measured confirmation: the real crossover happens at exactly `23` people, not `183` — a real, roughly `8\times$ smaller number than Concept Unit 1's own tempting intuition suggested.

### CS Lens

This is Lesson 20's own real combination-counting insight, made concrete: the real reason `23`, not `183`, is enough is that `23` real people produce `\binom{23}{2} = 253` real *pairs*, each an independent real chance at a collision — the relevant real quantity was never "how many people," but "how many real pairs of people," a real quantity that grows quadratically, not linearly.

### SE Lens

The alternative to computing this real, exact crossover is designing around Concept Unit 1's own real, intuitive guess. The real cost of that alternative: a real system assuming collisions become likely only once a real collection is "about half full" would be caught badly off guard by how much sooner real collisions actually start becoming likely — exactly the real, quantified gap this unit's own evidence reveals.

### Run It — Show the Real Output

```
$ guile birthday-check.scm
=== CU3: the real, surprising crossover, m=365 ===
n=1 P(collision)=0.0
n=5 P(collision)=0.02713557369979347
n=10 P(collision)=0.11694817771107768
n=15 P(collision)=0.25290131976368646
n=20 P(collision)=0.41143838358058027
n=22 P(collision)=0.4756953076625503
n=23 P(collision)=0.5072972343239857
n=24 P(collision)=0.538344257914529
n=25 P(collision)=0.568699703969464
n=30 P(collision)=0.7063162427192688
n=40 P(collision)=0.891231809817949
n=50 P(collision)=0.9703735795779884
```

Verified this session — the real probability of a shared birthday crosses `50\%` at exactly `n{=}23` people, real, direct confirmation that the true crossover is far smaller than a real, naive "half of `365`" intuition would suggest.

---

## Concept Unit 4: The Real Connection to Hash Tables

### The Problem

Concept Unit 3's own real evidence was about birthdays specifically. The identical real mathematics applies directly to a real hash table absorbing random keys — and it's worth checking, honestly, how few real keys a real, modestly-sized table can hold before a collision becomes more likely than not, with no adversary involved at all.

### Reference Source

No reference counterpart for this specific real application — a direct real reuse of Concept Unit 2's own already-verified `p-collision`, applied to a hash table's own real bucket count instead of a real calendar's own day count.

### Files affected

Modified: `birthday-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define hash-checkpoints (list 5 8 10 11 12 13 15 20))
```

### The Updated Project

This is `birthday-check.scm`, with Concept Unit 3's own file extended by a real, hash-table-scale check:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define hash-checkpoints (list 5 8 10 11 12 13 15 20))               ; ← new

(display "=== CU4: the real connection — a hash table, m=100 buckets ===") (newline) ; ← new
(for-each (lambda (n) (display "n=") (display n) (display " P(collision)=") (display (p-collision n 100)) (newline)) ; ← new
          hash-checkpoints)                                              ; ← new
```

### Mechanical Walkthrough

- **`(define hash-checkpoints (list 5 8 10 11 12 13 15 20))`** — first appearance in this lesson of this real list; `m` is now `100`, a real, modest hash-table size, rather than `365` real calendar days — the identical real `p-collision` procedure needs no change at all to answer the identical real *kind* of question over a genuinely different real domain.
- **`(p-collision n 100)`** — the identical real call shape Concept Unit 3 used, with `100` in place of `365`.
- **The real, exact `0.4968` at `n{=}12$, climbing to the real, exact `0.5572` at `n{=}13$** — direct, measured confirmation: with only `100` real buckets, just `13` real, randomly-placed keys — barely `13\%` of the table's own real capacity — already push the real probability of at least one collision past `50\%`.

### CS Lens

This is Lesson 146's own real hash-flooding evidence, recognized from the opposite real direction: Lesson 146 showed a real, *deliberate* adversary could force a guaranteed collision by choosing keys with foreknowledge of the real hash rule; this unit shows collisions are already surprisingly likely from purely *honest*, random key placement, with no adversary involved anywhere — two genuinely different real reasons a hash table needs real collision-handling machinery, neither one optional.

### SE Lens

The alternative to computing this real number directly is assuming a hash table "mostly empty" (only `13\%$ full, in this unit's own real numbers) is safely collision-free. The real, measured cost of that assumption: a real system relying on that intuition would be surprised by real collisions far earlier, and far more often, than "mostly empty" would suggest — exactly the reason Lesson 92 through 95's own real hash-table work, this curriculum's own earlier machinery, was built to handle collisions as a real, expected, routine occurrence, not a rare edge case.

### Run It — Show the Real Output

```
$ guile birthday-check.scm
=== CU4: the real connection — a hash table, m=100 buckets ===
n=5 P(collision)=0.09654976000000015
n=8 P(collision)=0.24969361018240022
n=10 P(collision)=0.37184349044470544
n=11 P(collision)=0.43465914140023487
n=12 P(collision)=0.49684663584620903
n=13 P(collision)=0.557225039544664
n=15 P(collision)=0.6687157745873176
n=20 P(collision)=0.8696004981795289
```

Verified this session — a hash table with `100` real buckets crosses `50\%` collision probability at just `13` real, randomly-placed keys, direct, real confirmation that the identical birthday-problem mathematics governs ordinary, non-adversarial hash-table behavior.

---

## Closing

### Connect the pieces

One real formula, one real surprising crossover, one real, direct application:

1. **A real, tempting wrong intuition, named (Unit 1):** "around `183`" feels reasonable; it isn't checked yet.
2. **The real formula, derived via the complement, and cross-checked (Unit 2):** `0.3878`, matching real, exhaustive enumeration exactly on a small case.
3. **The real, surprising crossover, found (Unit 3):** `50\%` at `n{=}23`, not `183`.
4. **The real, direct connection to hash tables (Unit 4):** `50\%` collision probability at just `13` keys in a `100`-bucket table.

Every claim in this lesson traces to real, executed code: a formula derived from a complementary probability, checked against real, exhaustive enumeration on a tractable case, then applied at real scale to both a classic real scenario and a real, computationally relevant one.

### What breaks without this

Suppose a real system's own designer sized a hash table assuming collisions would stay rare until the table was "mostly full," the identical real intuition Concept Unit 1 named for birthdays. Concept Unit 4's own real evidence shows precisely what that assumption misses: at just `13\%` real capacity, collisions are already more likely than not — a real system built without real, adequate collision handling, trusting that intuition, would begin misbehaving far earlier and far more often than its own designer ever expected.

### Exercises

1. **Observe.** Before checking, predict the real `n` at which `P(\text{collision})$ first exceeds `50\%$ for `m{=}1000$ (ten times Concept Unit 4's own table size), using this lesson's own real Concept Unit 3 evidence (that the crossover scales roughly with `\sqrt{m}$, not `m$) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Extend Concept Unit 2's own real, exhaustive `all-birthday-assignments` to check `n{=}4$, `m{=}7$, and confirm it still matches `p-collision`'s own real formula exactly.
4. **Explain.** In your own words, explain why `p-no-collision`'s own real loop multiplies `(m-i)/m` rather than `(m-n)/m` repeated `n` times, referencing what changes about the real number of remaining "safe" days as each new person is added.
5. **Explain.** Using this lesson's own real Concept Unit 3 and 4 numbers together, explain why the real crossover point depends on `m` in a way that makes `100`-bucket and `365`-day tables have such different real crossover counts (`13` versus `23`) despite both starting from the identical real formula.

### Definition of done

- [ ] You can state the real birthday-problem formula and explain why it's derived from the complement rather than computed directly.
- [ ] You can point to this lesson's own real `n{=}23$ crossover as direct evidence collisions become likely far sooner than naive intuition suggests.
- [ ] You can explain, using this lesson's own real Concept Unit 4 numbers, why a hash table needs real collision-handling machinery even with no adversary present.
- [ ] You completed Exercises 1–5, including a real, checked `n=4` exhaustive verification.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
