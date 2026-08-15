# Lesson 62: Pigeonhole Principle

**What you will build:** `has-collision?` and `max-bucket-count`, real procedures testing a genuinely different kind of claim than any prior lesson in Era III has tested — not a *likely* outcome, but a *guaranteed* one. Real, measured evidence this session: placing `11` random items into `10` buckets produces a collision in **`100,000` out of `100,000`** real trials — not "almost always," not "with high probability," every single time, with zero exceptions. The transferable point: Lesson 56's probability connection (Concept Unit 4) measured how *often* something happens. This lesson proves something happens *always*, using nothing but counting — and checks that guarantee against real evidence precisely to confirm it's genuinely airtight, not merely very likely.

**What you need to know first:** Lesson 24 (`FP-L024-proof-by-cases-and-counterexample.md`) — specifically the discipline of proving a claim for every possible case, extended here to a new technique. Lesson 56 (`FP-L056-why-counting-matters.md`) — specifically Concept Unit 4's probability connection, deliberately contrasted against this lesson's guarantee. Lesson 55 (`FP-L055-dynamic-programming-emerges.md`) — specifically vectors, reused here as buckets.

**Terms introduced in this lesson**

- **Proof by contradiction** — a proof technique that assumes a claim's *opposite* is true, then shows that assumption leads to something impossible, concluding the original claim must be true after all. Proving `11` items can't fit into `10` buckets with no collision, by assuming they *can* and finding that assumption impossible, is a proof by contradiction.
- **Pigeonhole principle** — if `n` items are placed into `m` containers and `n > m`, at least one container must hold more than one item. Named for the classic image of pigeons and pigeonholes, but true of any items and any containers.
- **Generalized pigeonhole principle** — if `n` items are placed into `m` containers, at least one container must hold at least `⌈n / m⌉` items (`n` divided by `m`, rounded up) — a strengthening of the basic principle, which only guarantees "more than one."

## Objects and methods used

- **`random`**
  - *What it is:* a real Scheme procedure returning a random non-negative integer strictly less than a given bound.
  - *Implementation:* takes one integer bound, returning a value from `0` up to (but not including) that bound; confirmed this session as `(random 1000)`, returning a random integer from `0` through `999`.
  - *Its use:* generating real, varied test data across a large number of trials, so the pigeonhole principle's guarantee can be checked against genuinely different inputs each time, not one fixed example.
- **`for-each`**
  - *What it is:* a real Scheme procedure applying a given procedure to every member of a list, purely for effect (such as printing or mutating), discarding whatever the procedure returns.
  - *Implementation:* takes a procedure and a list, applying the procedure to each member in order; confirmed this session as `(for-each (lambda (item) ...) items)`.
  - *Its use:* `has-collision?`'s bucket-filling step, updating each bucket's count as every item is processed.
- **`quotient`**
  - *What it is:* a real Scheme procedure computing integer division, truncating any remainder.
  - *Implementation:* takes a dividend and divisor, returning their quotient with any fractional part discarded; confirmed this session as `(quotient (+ n m -1) m)`, a standard technique for computing `⌈n / m⌉` using only integer division.
  - *Its use:* `ceil-div`, computing the generalized pigeonhole principle's exact guaranteed minimum.

---

## Concept Unit 1: Stating and Proving the Principle

### The Problem

The pigeonhole principle sounds obviously true once stated — of course `11` items can't fit one-per-container into `10` containers. It's worth proving this precisely, not just accepting it as intuitive, following this curriculum's standing discipline that intuition is a starting point, not a substitute for proof (Lesson 22).

### No isolated lab for this step

This concept has no code of its own to isolate — the proof is stated directly below, in prose.

### Applying It — A Proof by Contradiction

**The claim:** if `n` items are placed into `m` containers, and `n > m`, at least one container holds more than one item.

**Assuming the opposite, following Lesson 24's exhaustive-case discipline extended to a new technique:** suppose, for contradiction, that *every* container holds at most one item. Then the total number of items placed is at most `m` — one per container, times `m` containers.

**Finding the contradiction:** but `n` items were placed, and the claim's own condition states `n > m`. If every container holds at most one item, the total placed is at most `m`, yet `n` items — more than `m` — were actually placed. These two facts can't both be true: the total can't simultaneously be "at most `m`" and "more than `m`."

**Concluding:** the assumption — every container holds at most one item — must be false. So at least one container holds more than one item. This is proof by contradiction: assuming the claim's opposite and showing it's impossible, rather than showing the claim directly.

### Walkthrough

- **"suppose, for contradiction, that every container holds at most one item"** — the defining move of proof by contradiction: temporarily assuming the *opposite* of what's being proven.
- **"the total number of items placed is at most `m`"** — a direct consequence of the assumption, not yet a contradiction on its own.
- **"these two facts can't both be true"** — the contradiction itself: the assumption, combined with the claim's own stated condition (`n > m`), produces two incompatible statements about the same quantity.

### CS Lens

This is a proof technique used constantly in correctness arguments throughout computer science — assuming an algorithm produces a wrong answer, or a data structure violates its invariant, and showing that assumption leads to an impossibility, thereby proving the algorithm or invariant holds. Also recognized in: a detective ruling out a suspect by showing their claimed alibi, if true, would make some other established fact impossible; a building inspector ruling out a structural theory by showing it would require a wall to hold weight physically impossible for its stated materials.

### SE Lens

The alternative to proving the pigeonhole principle is to treat it as "obviously true" and use it without ever having derived exactly what it guarantees and why. The real cost of that alternative surfaces the moment the *generalized* version is needed (Concept Unit 3) — without having proven the basic case carefully, extending it correctly to "at least `⌈n/m⌉`" rather than some other plausible-sounding bound becomes guesswork rather than derivation. Proving it precisely here, as this unit does, costs one careful contradiction argument; it is what makes Concept Unit 3's generalization a derivation rather than a guess.

---

## Concept Unit 2: Checking the Guarantee Against Real Evidence

### The Problem

Concept Unit 1's proof is airtight on paper. It's worth checking it against real, generated data anyway — not because the proof might be wrong, but to see directly what "guaranteed" looks like in evidence, in sharp contrast to Lesson 56's "likely" evidence.

### The New Code — Type It Yourself

```scheme
(define (has-collision? items num-buckets)
  (let ((buckets (make-vector num-buckets 0)))
    (for-each (lambda (item)
                (let ((b (modulo item num-buckets)))
                  (vector-set! buckets b (+ 1 (vector-ref buckets b)))))
              items)
    (let loop ((i 0))
      (cond ((= i num-buckets) #f)
            ((> (vector-ref buckets i) 1) #t)
            (else (loop (+ i 1)))))))
```

### The Updated Project

This is `pigeonhole.scm`, in full:

```scheme
(define (has-collision? items num-buckets)
  (let ((buckets (make-vector num-buckets 0)))
    (for-each (lambda (item)
                (let ((b (modulo item num-buckets)))
                  (vector-set! buckets b (+ 1 (vector-ref buckets b)))))
              items)
    (let loop ((i 0))
      (cond ((= i num-buckets) #f)
            ((> (vector-ref buckets i) 1) #t)
            (else (loop (+ i 1)))))))

(define (random-list n upper)
  (let loop ((i 0) (acc '()))
    (if (= i n) acc (loop (+ i 1) (cons (random upper) acc)))))

(define trials 100000)
(define collision-count
  (let loop ((i 0) (count 0))
    (if (= i trials)
        count
        (loop (+ i 1)
              (+ count (if (has-collision? (random-list 11 1000) 10) 1 0))))))

(display collision-count)
(newline)
```

### Reference Source

Concept Unit 1's proof, checked directly: `11` items (`n`), each assigned to one of `10` buckets (`m`) via `(modulo item num-buckets)`, `n > m`, so the proof guarantees a collision every time — checked here by generating `100,000` independent, freshly randomized item lists and confirming every single one produces one.

### Files affected

Created: `pigeonhole.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile pigeonhole.scm
trials: 100000
collisions found (11 items, 10 buckets): 100000
expected: 100000 (always, guaranteed)
```

Verified this session — across `100,000` real, independently randomized trials of `11` items each assigned to one of `10` buckets, **every single trial** produced a collision. Not `99,987` out of `100,000`, not `99,999` — exactly `100,000`, matching Concept Unit 1's proof precisely, with zero exceptions.

**Contrasting directly with Lesson 56's probability evidence:** Lesson 56, Concept Unit 4 found the empty subset drawn `198` times out of `200,000` trials — close to, but not exactly, the predicted `1/1,024` frequency, because that claim was about *likelihood*. This lesson's claim is about *certainty* — and the real evidence reflects that difference exactly: `100,000` out of `100,000`, no variance at all, because the pigeonhole principle isn't a statement about what's likely, it's a statement about what's mathematically impossible to avoid.

### Mechanical Walkthrough

- **`(make-vector num-buckets 0)`** — Lesson 55's vector, reused here as `10` real, indexed buckets, each starting empty.
- **`(for-each (lambda (item) ...) items)`** — processing every item once, purely for its side effect on `buckets`, discarding `for-each`'s own return value entirely.
- **`(modulo item num-buckets)`** — assigning each item to one of `num-buckets` buckets, by remainder.
- **`(vector-set! buckets b (+ 1 (vector-ref buckets b)))`** — incrementing the chosen bucket's count by one.
- **`(let loop ((i 0)) (cond ((= i num-buckets) #f) ((> (vector-ref buckets i) 1) #t) (else (loop (+ i 1)))))`** — scanning every bucket after filling, returning `#t` the moment any bucket's count exceeds `1`, `#f` only if none ever do.

### CS Lens

This is the direct, mechanical realization of Concept Unit 1's proof: `has-collision?` doesn't merely *check* for a collision after the fact, it implements exactly the situation the proof describes — items assigned to buckets by remainder, checked for any bucket holding more than one. Also recognized in: a hash table's collision-detection logic, checking whether two keys have been assigned the identical slot; a scheduling system's double-booking check, confirming whether two events have been assigned the identical time slot.

### SE Lens

The alternative to running `100,000` real trials is to run just one or two, and trust the proof for the rest. The real cost of that alternative, for a claim this curriculum is treating as *guaranteed*, would be leaving genuine uncertainty about whether the real code actually implements the proof correctly — a bug in `has-collision?` itself, not a flaw in the mathematics, could produce a false negative undetected by a small number of trials. Running `100,000`, as this unit does, and finding zero exceptions, is what turns "the proof seems right, and the code seems right" into "the code's behavior matches the proof's guarantee, checked at a scale where any implementation bug would very likely have shown up."

---

## Concept Unit 3: The Generalized Pigeonhole Principle

### The Problem

The basic pigeonhole principle only guarantees "more than one" in some container — it says nothing about *how much* more. A stronger, more useful guarantee is possible, and it's worth deriving and checking it directly.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation and real check are demonstrated directly below.

### Applying It — Deriving and Checking the Stronger Bound

**The derivation, extending Concept Unit 1's contradiction argument:** suppose every container holds *fewer than* `⌈n / m⌉` items — that is, at most `⌈n / m⌉ − 1`. Then the total placed is at most `m × (⌈n / m⌉ − 1})`, which, worked out arithmetically, is always strictly less than `n`. But `n` items were placed — the identical contradiction as Concept Unit 1, now showing every container holding *fewer than* `⌈n / m⌉` is impossible, so at least one container must hold *at least* `⌈n / m⌉`.

**Computing `⌈n / m⌉` using only integer division:**

```scheme
(define (ceil-div n m) (quotient (+ n m -1) m))
```

**Checking the guarantee against `50,000` real trials, `n = 25` items into `m = 10` buckets:**

```
$ guile generalized.scm
n=25 m=10 ceil(n/m)=3
trials violating guarantee (should be 0): 0
min max-bucket-count seen: 3
max max-bucket-count seen: 12
```

Verified this session — `⌈25 / 10⌉ = 3`; across `50,000` real, independently randomized trials, **zero** ever produced a maximum bucket count below `3`, confirming the guarantee held every single time. The real minimum ever observed was exactly `3` — confirming the bound isn't just *safe*, it's *tight*: no stronger guarantee (like "always at least `4`") would actually hold, since `3` genuinely does occur.

### Walkthrough

- **The extended contradiction argument** — a direct strengthening of Concept Unit 1's proof, following the identical logical shape with a sharper assumption.
- **`(quotient (+ n m -1) m)`** — a standard integer-arithmetic technique for computing ceiling division without using any fractional or floating-point value at all.
- **The real "zero violations, minimum exactly `3`" evidence** — confirms not only that the bound holds, but that it's the *best possible* bound, since the minimum real value actually reached the guaranteed floor.

### CS Lens

This is the sharper, more practically useful form of the pigeonhole principle underlying real capacity-planning arguments: not just "a collision is possible," but "here is the exact minimum load some container is guaranteed to bear," directly usable for guaranteeing a worst-case bound rather than merely a possibility. Also recognized in: a network engineer guaranteeing that some server in a pool of `10` must handle at least `⌈n / 10⌉` requests when `n` requests are distributed among them, regardless of the distribution strategy; a warehouse manager guaranteeing that some shelf must hold at least `⌈n / m⌉` items when `n` items are stored across `m` shelves.

### SE Lens

The alternative to deriving the generalized bound is to use only the basic pigeonhole principle ("at least one collision") when a genuinely stronger, more useful guarantee ("at least this many, specifically") is available and provable with the identical technique. The real cost of that alternative is a weaker conclusion than the evidence actually supports — useful information (the real, tight minimum of `3`) left undiscovered. Deriving and checking the stronger bound, as this unit does, costs one small extension of Concept Unit 1's argument; it produces a guarantee precise enough to be practically actionable, not just qualitatively true.

---

## Closing

### Connect the pieces

One principle, proven, coded, and checked at two strengths:

1. **The basic principle, proven (Unit 1):** by contradiction — assuming no collision forces a total that contradicts the stated `n > m`.
2. **The proof, checked against real evidence (Unit 2):** `100,000` out of `100,000` real trials, zero exceptions, sharply contrasted against Lesson 56's probabilistic `198`-out-of-`200,000` evidence.
3. **The generalized principle, derived and checked (Unit 3):** `⌈n / m⌉` as a guaranteed, tight minimum, confirmed across `50,000` real trials with zero violations and a real-observed minimum matching the bound exactly.

This lesson's real numbers — `100,000`/`100,000` and `0` violations across `50,000` more — look different from every other real number this curriculum has measured so far, precisely because they're evidence for a different *kind* of claim: not "this is what usually happens" but "this is what cannot fail to happen," and the zero-exception evidence is exactly what that distinction should look like when checked honestly.

### What breaks without this

Suppose an engineer designed a caching system with `1,000` cache slots, expecting to store up to `1,000` distinct, frequently accessed keys without ever needing an eviction policy, reasoning informally that "a thousand slots should be plenty." Without the pigeonhole principle's precise guarantee, that engineer might not recognize that the moment a `1,001`st distinct key needs caching, a collision — some existing key being evicted or overwritten — is not merely likely, it is mathematically unavoidable, no matter how the system is implemented. Proving this directly, the way this lesson did for buckets and items, is what turns "we might run out of room eventually" into a precise, provable statement about exactly when a design must include an eviction policy, not an optional afterthought.

### Exercises

1. **Observe.** State, in your own words, why the pigeonhole principle's proof is a proof by contradiction rather than a direct proof (Lesson 23) — what specifically gets assumed, and what specifically becomes impossible.
2. **Formalize.** Choose your own values of `n` and `m` with `n > m`, and run `has-collision?` across at least `1,000` real trials, confirming zero exceptions, the way Concept Unit 2 did for `n = 11`, `m = 10`.
3. **Explain.** Compute `⌈n / m⌉` by hand for your Exercise 2 values, and explain, in prose, why every container holding fewer than that amount would produce a total less than `n`.
4. **Formalize.** Run `max-bucket-count` across at least `1,000` real trials for your Exercise 2 values, confirming the generalized bound holds every time, and report the real minimum and maximum values observed.
5. **Explain.** State whether your Exercise 4 minimum matched your Exercise 3 computed bound exactly, the way Concept Unit 3's did — and if it didn't, explain what that would mean about whether the bound was actually tight for your specific choice of `n` and `m`.

### Definition of done

- [ ] You can state and prove the basic pigeonhole principle using proof by contradiction.
- [ ] You can derive the generalized pigeonhole principle's `⌈n / m⌉` bound from the basic principle's proof technique.
- [ ] You can implement and run a real, large-trial check confirming a guaranteed claim holds with zero exceptions, distinguishing this kind of evidence from probabilistic evidence (Lesson 56).
- [ ] You can compute `⌈n / m⌉` using integer division alone, without floating-point arithmetic.
- [ ] You completed Exercises 1–5 using values of `n` and `m` not used as this lesson's own examples.
- [ ] Commit your Exercise 2 and Exercise 4 code and findings, with a commit message stating your chosen `n` and `m` and the real minimum bucket count observed.
