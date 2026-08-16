# Lesson 165: Counting Without Counting — Probabilistic Analysis

**What you will build.** A real answer to a genuinely strange question: scanning a randomly shuffled list of ten distinct numbers, left to right, keeping a running record of the biggest one seen so far — on average, across all possible shuffles, how many times does that running record actually change? Four real procedures: `record-at?`, which checks whether one specific position is a new record; `count-records`, which counts them all in one real shuffle; `harmonic`, which computes an exact sum with a surprising connection to the answer; and `average-records`, which measures the true average directly. The transferable technique: instead of counting something hard to count directly, break it into many small yes/no questions — **indicator random variables**, reused from Lesson 161 — find each one's own exact probability, and add them up. **Linearity of expectation**, from Lesson 153, guarantees that addition works even though the yes/no questions are not independent of each other at all.

**What you need to know first.** Lesson 153 (Expected Value) for expected value itself and linearity of expectation. Lesson 161 (Hashing Revisited) for indicator random variables — a random variable that's `1` if some specific event happens and `0` otherwise, turning a counting question into a sum of expectations. Lesson 162 (Sampling) for `sample-without-replacement`'s own partial Fisher-Yates shuffle, reused here in full to generate real random permutations, and for this curriculum's practice of proving a probabilistic claim two ways, exactly and empirically, rather than trusting either alone. Lesson 159 (Monte Carlo Algorithms) for running many real trials to check a claim by measured frequency.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **`let*`** — like `let`, but each binding can see the ones before it in the same block. This lesson reuses it, unchanged from Lesson 164, for computing a working copy of a vector first and then a value that depends on it.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. Every loop in this lesson uses it, unchanged from its use across Lessons 162 through 164.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's harmonic sum and average-records computation both stay exact fractions throughout, converted to decimals only for reading, never for computing.
- **Indicator random variable** — a random variable that equals exactly `1` if some specific event happens on a given random trial, and exactly `0` otherwise, so that counting how often an event happens is the same as summing a pile of indicator variables. First given full treatment in Lesson 161, for hash-table collisions; this lesson applies the same idea to a completely different question.
- **Linearity of expectation** — the expected value of a sum of random variables always equals the sum of their individual expected values, even when those variables are not independent of each other. This lesson's central technique: instead of directly reasoning about how many total records a shuffle has, add up each individual position's own, separately-computed probability of being one.
- **Left-to-right maximum (a "record")** — scanning a sequence from the start, a position holds a record if its own value is bigger than every value that came before it. The first position is always a record, by default, since nothing came before it to beat.
- **The records problem** — the specific question this lesson answers: for a random permutation of `n` distinct numbers, what is the expected number of left-to-right maxima?
- **Symmetry argument** — a proof technique that establishes a probability not by counting favorable outcomes directly, but by showing every relevant outcome is equally likely to play a specific role, so that role's own probability must be `1` divided by however many outcomes could have played it. This lesson uses one to show a specific position's own probability of holding a record, with no need to count permutations directly.
- **Harmonic number** — the sum `1 + 1/2 + 1/3 + ... + 1/n`, written `Hₙ`. It grows without bound as `n` grows, but very slowly — roughly in proportion to the natural logarithm of `n`, not to `n` itself.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`running-max-through`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — takes a vector and a position, and returns the largest value found anywhere from the start of the vector up through that position, inclusive.
  - *Implementation:* `(running-max-through v i)` → the maximum of `v[0]` through `v[i]`.
  - *Its use:* the raw material `record-at?` is built from — knowing the running maximum *through* a position is exactly what's needed to check whether *that* position is what pushed the maximum higher.
- **`record-at?`**
  - *What it is:* derived in Concept Unit 1 — an **indicator**, checking whether one specific position of a vector is a left-to-right maximum.
  - *Implementation:* `(record-at? v i)` → `#t` if `v[i]` equals the running maximum through position `i`, `#f` otherwise.
  - *Its use:* the single yes/no question this whole lesson's analysis is built from.
- **`count-records`**
  - *What it is:* derived in Concept Unit 1 — counts how many positions of a vector are records, by literally summing `record-at?`'s own yes/no answer at every position.
  - *Implementation:* `(count-records v)` → a non-negative exact integer, at least `1` (the first position is always a record).
  - *Its use:* the real, measurable quantity this lesson's whole analysis exists to predict the average of.
- **`harmonic`**
  - *What it is:* derived in Concept Unit 3 — computes the exact harmonic number `Hₙ`.
  - *Implementation:* `(harmonic n)` → an exact rational, `1 + 1/2 + ... + 1/n`.
  - *Its use:* the exact, closed-form prediction this lesson's whole derivation builds toward.
- **`average-records`**
  - *What it is:* derived in Concept Unit 3 — measures the real average number of records across many independent random shuffles.
  - *Implementation:* `(average-records trials)` → an exact rational, the mean of `trials` real measurements.
  - *Its use:* the empirical side of this lesson's central claim, checked against `harmonic`'s own exact prediction.

*Everything else in the file, not this lesson's subject but still explained:*

- **`shuffle`**
  - *What it is:* a reappearing construct from Lesson 162 — the same partial Fisher-Yates shuffle `sample-without-replacement` performed there, here always run to completion (every position gets a swap, not just the first `k`), producing a genuine random permutation of the whole input.
  - *Implementation:* `(shuffle items)` → a fresh vector, a uniformly random reordering of `items`; the original vector is untouched.
  - *Its use:* generates every real random permutation this lesson measures — nothing here would be possible without a genuinely uniform way to shuffle.
- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* every swap inside `shuffle` depends on one fresh call to `random`.
- **`vector`**
  - *What it is:* a constructor — builds a new vector from the arguments given to it.
  - *Implementation:* `(vector v0 v1 ... vn)` returns a fresh vector holding exactly those values, in that order.
  - *Its use:* builds `numbers`, the ten-element population every shuffle in this lesson is drawn from.
- **`vector-length`**
  - *What it is:* an accessor — reports how many slots a vector has.
  - *Implementation:* `(vector-length v)` returns an exact integer.
  - *Its use:* tells `shuffle` how many positions there are to swap through.
- **`vector-ref`**
  - *What it is:* an accessor — reads the value stored at a given index of a vector.
  - *Implementation:* `(vector-ref v i)` returns the value at index `i` (0-based).
  - *Its use:* reads a specific position's value while scanning for records, and while swapping inside `shuffle`.
- **`vector-set!`**
  - *What it is:* a mutator — overwrites a vector's value at a given index, in place.
  - *Implementation:* `(vector-set! v i x)` sets index `i` of `v` to `x`.
  - *Its use:* performs the swap inside `shuffle`, and records a tally count in this lesson's per-position verification.
- **`vector-copy`**
  - *What it is:* an accessor that returns a whole new vector rather than a single value — a defensive-copy tool, first given full treatment in Lesson 162.
  - *Implementation:* `(vector-copy v)` returns a fresh copy of the whole vector `v`; mutating the copy never touches `v`.
  - *Its use:* `shuffle` copies `items` before doing any swapping, so the caller's own vector is never touched — the same defensive-copy reasoning Lesson 162's `sample-without-replacement` used.
- **`make-vector`**
  - *What it is:* a constructor — builds a new vector of a given length.
  - *Implementation:* `(make-vector k)` returns a fresh vector of length `k` with an unspecified placeholder in every slot; `(make-vector k fill)` sets every slot to `fill` instead.
  - *Its use:* allocates the tally vector this lesson's per-position verification counts into.
- **`max`**
  - *What it is:* a procedure — returns the largest of any number of numeric arguments.
  - *Implementation:* `(max a b ...)` compares all its arguments and returns the greatest one.
  - *Its use:* `running-max-through` uses it to fold a new value into the running maximum seen so far; Concept Unit 1's own Isolated Lab uses it the same way.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* Concept Unit 1's own Isolated Lab reads a list's first element off the front with it; it never appears in the real project code, which works with vectors instead.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances the Isolated Lab's own walk through a list one element at a time, alongside `car`.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* detects the end of the list the Isolated Lab's own `running-maxes` walks.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* `running-maxes`, in the Isolated Lab, builds its own result list one running maximum at a time, exactly the accumulator-passing pattern this lesson's real procedures use with vectors instead.
- **`reverse`**
  - *What it is:* a converter — builds a new list holding the same elements as a given list, but in the opposite order.
  - *Implementation:* `(reverse lst)` returns a fresh list; `lst` itself is untouched.
  - *Its use:* `running-maxes` builds its result backwards, via `cons`, and `reverse`s it once at the end, exactly as Lesson 163's and Lesson 164's trajectory-builders did.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* bundles several related results together for a single `display` call.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest floating-point representation of `n`.
  - *Its use:* converts this lesson's exact fractions — harmonic sums, measured averages, position probabilities — into readable decimals, without ever computing with a rounded value.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.
- **`+`, `-`, `*`, `/`**
  - *What it is:* four of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* each takes any number of numeric arguments; `/` on two exact integers that don't divide evenly returns an exact rational.
  - *Its use:* `+` accumulates a record count and a running total of measurements; `-` computes a shrinking swap range inside `shuffle`; `*` and `/` compute the harmonic sum's own terms and every average in this lesson.
- **`>`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(> a b)` and `(= a b)` compare two numbers.
  - *Its use:* `>` decides whether a new value beats the running maximum, and bounds `harmonic`'s own loop; `=` recognizes every other loop's base case, and checks whether a position's value equals the running maximum in `record-at?`.

---

## Concept Unit: Indicator Variables for Records

### The Problem

Ten distinct numbers, shuffled into a genuinely random order, scanned left to right while keeping a running note of the biggest number seen so far. Every time a new number beats that running note, that's a **record** — a new left-to-right maximum. The very first number is always a record, trivially, since nothing came before it. After that, whether any given position is a record depends on everything that came before it — a real, entangled question, not an independent coin flip. Counting the total number of records in one real shuffle is easy enough: just scan and count. The much harder question this whole lesson exists to answer: *on average*, across all the different orders a shuffle could produce, how many records should be expected? Answering that by examining every possible shuffle directly is hopeless — even for just ten numbers, there are `3,628,800` different orderings. What's needed is a way to answer the average-case question *without* ever examining most of those orderings at all.

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives the records problem's analysis from first principles.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: one reused procedure (`shuffle`, adapted unmodified from Lesson 162's own logic) and three new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in vector procedures.

### The New Code

```scheme
(define (shuffle items)
  (let* ((n (vector-length items))
         (pool (vector-copy items)))
    (let loop ((i 0))
      (if (= i n)
          pool
          (let ((j (+ i (random (- n i)))))
            (let ((temp (vector-ref pool i)))
              (vector-set! pool i (vector-ref pool j))
              (vector-set! pool j temp))
            (loop (+ i 1)))))))

(define numbers (vector 0 1 2 3 4 5 6 7 8 9))

(define (running-max-through v i)
  (let loop ((j 0) (best (vector-ref v 0)))
    (if (> j i)
        best
        (loop (+ j 1) (max best (vector-ref v j))))))

(define (record-at? v i)
  (= (vector-ref v i) (running-max-through v i)))

(define (count-records v)
  (let ((n (vector-length v)))
    (let loop ((i 0) (count 0))
      (if (= i n)
          count
          (loop (+ i 1) (if (record-at? v i) (+ count 1) count))))))
```

### The Updated Project

Skipped — `shuffle`, `numbers`, `running-max-through`, `record-at?`, and `count-records` are brand-new top-level definitions with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: Folding a Running Maximum

The core new idea here isn't `max` itself, already fully treated above — it's *folding* a value across a whole sequence, keeping only the best-so-far at each step, discarding everything else. Isolated, on a small made-up list of numbers, tracking the running maximum by hand at each step:

```scheme
(define (running-maxes lst)
  (let loop ((remaining (cdr lst)) (best (car lst)) (result (list (car lst))))
    (if (null? remaining)
        (reverse result)
        (let ((new-best (max best (car remaining))))
          (loop (cdr remaining) new-best (cons new-best result))))))
```

Run for real:

```scheme
(running-maxes (list 3 1 4 1 5 9 2 6))
;=> (3 3 4 4 5 9 9 9)
```

Eight input numbers, eight running maxima — `3` (itself, first value), `3` (unchanged, `1 < 3`), `4` (a new high), `4` (unchanged), `5` (a new high), `9` (a new high), `9` (unchanged, `2 < 9`), `9` (unchanged, `6 < 9`). A record, in this lesson's own terms, is exactly a position where this running-maximum sequence *changed* from the position before it — `3`, `4`, `5`, and `9` each mark a change, so this eight-element sequence has four records, at positions `0`, `2`, `4`, and `5`. `running-max-through`, defined above, computes one single entry of this same sequence — the running maximum through one specific position — without needing to build the whole sequence first.

### Discarding the Lab

`running-maxes` is discarded now. It never appears in the project again — `running-max-through` computes the same underlying idea, one position at a time, exactly when `record-at?` needs it.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (shuffle items) ...)`** through the closing of its own definition — this procedure is unchanged in every real detail from Lesson 162's `sample-without-replacement`, run to full completion: `let*` binds `n` (the vector's length) and then `pool` (a defensive copy, made with `vector-copy`, since `n`'s own binding doesn't depend on `pool` but `pool`'s binding doesn't need `n` either — `let*` is used here purely so both bindings live in one block, matching Lesson 164's own justification for reaching for it); the named `let` swaps a uniformly random not-yet-decided element into each position in turn, from `i = 0` up to `n`, with no fixed `k` cutting it short the way Lesson 162's version could be asked to stop early.
- **`(define numbers (vector 0 1 2 3 4 5 6 7 8 9))`** — `define` binds `numbers` to a ten-element vector, the fixed population every real shuffle in this lesson draws from.
- **`(define (running-max-through v i) ...)`** — `define` binds `running-max-through` to a two-parameter procedure.
- **`(let loop ((j 0) (best (vector-ref v 0))) ...)`** — a named `let`: `j` scans forward from `0`, `best` accumulates the largest value seen so far, starting from `v`'s own first element.
- **`(if (> j i) best (loop (+ j 1) (max best (vector-ref v j))))`** — the base case, `(> j i)`, fires once `j` has scanned *past* position `i`, returning `best` — the maximum of everything from `v[0]` through `v[i]`, inclusive, since the scan only stops after `j` exceeds `i`, not when it reaches it. Otherwise, `(max best (vector-ref v j))` folds the current position's value into the running best, and the loop advances.
- **`(define (record-at? v i) (= (vector-ref v i) (running-max-through v i)))`** — `define` binds `record-at?` to a two-parameter procedure. `(running-max-through v i)` computes the biggest value anywhere from the start through position `i`; `(vector-ref v i)` reads position `i`'s own value; `=` checks whether they're the same number. Since every value in a real permutation is distinct, position `i`'s value can only equal the running maximum *through* position `i` if position `i` itself is what set that maximum — meaning it beat everything before it. This is an **indicator random variable**, made concrete: `record-at?` returns exactly `#t` or `#f`, standing in for the `1` or `0` a formal indicator would take.
- **`(define (count-records v) ...)`** — `define` binds `count-records` to a one-parameter procedure.
- **`(let ((n (vector-length v))) ...)`** — a plain `let`, one binding: `n`, the vector's own length, read once rather than recomputed on every iteration.
- **`(let loop ((i 0) (count 0)) ...)`** — a named `let`: `i` scans every position from `0` to `n`, `count` accumulates how many of them are records.
- **`(if (= i n) count (loop (+ i 1) (if (record-at? v i) (+ count 1) count)))`** — the base case returns the final `count` once every position has been checked; otherwise, `(record-at? v i)` asks the one yes/no question this whole lesson is built from, and `count` only advances when the answer is genuinely `#t` — `count-records` is nothing more than **summing an indicator variable** across every position, made completely literal in code.

### CS Lens

This is the **records problem**: counting **left-to-right maxima** in a random sequence, by summing an **indicator random variable** over every position rather than reasoning about the whole sequence at once.

Also recognized in: stock-price analysis tracking how many times a running all-time-high actually gets broken over a trading history; sports record-keeping, counting how many times a "fastest ever" or "highest ever" mark actually changed hands across a sequence of real attempts; Lesson 161's own hash-collision analysis, which put an indicator on every *pair* of items instead of every *position*, but relied on the exact same "sum of indicators equals the count" idea; and the "hiring problem" from classical algorithm analysis, which asks exactly this question about interviewing candidates in a random order and hiring every one who beats the best seen so far.

### SE Lens

The design principle here is **decomposing a hard global question into many easy local ones**. `count-records` never reasons about "the whole shuffle" as a single object with some aggregate property to compute directly — it only ever asks, one position at a time, "is *this specific* position a record," a question `record-at?` can answer using nothing but that one position and everything strictly before it.

An alternative that was *not* chosen: compute the record count in one single forward pass, tracking a running maximum and incrementing a counter directly, without ever calling a separate `record-at?` per position — genuinely more efficient, since `running-max-through` recomputes the maximum from scratch, from position `0`, every single time it's called, making `count-records` take time proportional to `n²` instead of a single-pass version's `n`. The real cost of the version this lesson actually built: on `numbers`' own ten elements, an `n²` algorithm costs nothing worth noticing, but the same approach on a list of a million elements would be genuinely, measurably slow, for no reason except how it counts. The benefit bought with that cost: `count-records` is *literally* "sum this indicator over every position," visible directly in the code, which is exactly the mathematical claim Concept Unit 3 needs to be true — a faster, single-pass version would compute the identical number, but the connection to "this is a sum of indicator variables" would live only in a comment, not in the shape of the code itself.

### Run It

```scheme
(shuffle numbers)
;=> #(3 5 0 8 9 4 2 1 7 6)

(shuffle numbers)
;=> #(2 7 9 5 4 8 3 1 0 6)
```

Two independent real shuffles of the same ten numbers, each one a genuinely different order — the second one kept, for the calls below, as `sample-shuffle`.

```scheme
(record-at? sample-shuffle 0)
;=> #t

(record-at? sample-shuffle 3)
;=> #f

(record-at? sample-shuffle 5)
;=> #f
```

`sample-shuffle` is `#(2 7 9 5 4 8 3 1 0 6)`. Position `0` (`2`) is always a record — nothing came before it. Position `3` (`5`) is not: the running maximum through position `3` is `9` (from position `2`), and `5 ≠ 9`. Position `5` (`8`) is not, for the same reason — `9` is still the running maximum.

```scheme
(count-records sample-shuffle)
;=> 3
```

Scanning `#(2 7 9 5 4 8 3 1 0 6)` by hand confirms it: `2` (record), `7` (record, `7 > 2`), `9` (record, `9 > 7`), and then `5, 4, 8, 3, 1, 0, 6` — none of them beat `9` — so exactly `3` records total, matching `count-records`'s own real output.

```scheme
(count-records (shuffle numbers))
;=> 4

(count-records (shuffle numbers))
;=> 4
```

Two more independent shuffles, `4` records each this time — genuinely different from `sample-shuffle`'s `3`, real evidence the record count itself varies from shuffle to shuffle, exactly the randomness this lesson's whole analysis has to account for.

### Connection

Counting records in one real shuffle is settled. The next problem is the real one: finding out, exactly, what that count looks like *on average*, starting with the smallest possible piece — one single position's own probability.

---

## Concept Unit: Each Position's Exact Probability

### The Problem

`count-records` sums an indicator variable over ten positions. By linearity of expectation — reused directly from Lesson 153, which proves it holds even when the underlying variables are *not* independent — the expected total is just the sum of each position's own individual probability of being a record. That reduces one hard question (the expected total) to ten easier ones (each position's own probability) — but "easier" still needs an actual answer. What's the real probability that, say, position `4` of a random ten-element shuffle holds a record?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new top-level definition (data, a tally vector) built up by a verification loop.
- **Location** — after `record-at?`; calls it directly, many times, across many independent shuffles.
- **Dependencies** — `shuffle` and `record-at?`, defined in Concept Unit 1.

### The New Code

```scheme
(define position-tally (make-vector 10 0))
(let loop ((t 0))
  (if (< t 100000)
      (let ((v (shuffle numbers)))
        (let loop2 ((i 0))
          (if (< i 10)
              (begin
                (if (record-at? v i) (vector-set! position-tally i (+ 1 (vector-ref position-tally i))))
                (loop2 (+ i 1)))))
        (loop (+ t 1)))))
```

### The Updated Project

Skipped — a brand-new top-level tally, built by a freestanding verification loop with nothing existing to place it inside.

### Isolated Lab: None — Justified Skip

Every construct this Concept Unit's own code uses — `make-vector`, a count-terminated named `let`, `begin`, `vector-set!`, `record-at?` itself — already has full, real treatment, either earlier in this lesson or in Lessons 162–164. What's new here isn't a construct; it's a mathematical claim, argued in prose below, and then checked against real, measured evidence. Per the Concept Isolation Rule, a lab is warranted for a genuinely new construct a Concept Unit is built around; this one is built around an argument, not a piece of syntax, so none is given.

### The Symmetry Argument

Consider only the first `i + 1` positions of a random shuffle — positions `0` through `i`. Whichever value ends up largest *among just those `i + 1` values* could, by pure symmetry, land in *any* of those `i + 1` positions with exactly equal likelihood: nothing about the shuffling process favors putting the biggest-of-the-first-`i+1` specifically at the end rather than the beginning or the middle — every one of the `i + 1` positions is exactly as likely to be where it ends up. Position `i` specifically holds a record if and only if the biggest value among the first `i + 1` happens to have landed *exactly there*, at the last of those `i + 1` positions — one specific outcome out of `i + 1` equally likely ones. So the exact probability that position `i` (counting from `1`, not `0`) is a record is precisely `1 / i`.

### Run It

```scheme
position-tally
;=> #(100000 50121 33454 24930 19902 16761 14311 12423 11054 9960)
```

Position `0` (the first, `1/1 = 1` predicted) was a record in every single one of `100,000` real trials — exactly as the symmetry argument demands, since the first position is *always* a record, with certainty.

```scheme
(exact->inexact (/ (vector-ref position-tally 1) 100000))
;=> 0.50121

(exact->inexact (/ (vector-ref position-tally 2) 100000))
;=> 0.33454

(exact->inexact (/ (vector-ref position-tally 3) 100000))
;=> 0.2493

(exact->inexact (/ (vector-ref position-tally 9) 100000))
;=> 0.0996
```

Position `1` (predicted `1/2 = 0.5`): measured `0.50121`. Position `2` (predicted `1/3 ≈ 0.3333`): measured `0.33454`. Position `3` (predicted `1/4 = 0.25`): measured `0.2493`. Position `9`, the very last (predicted `1/10 = 0.1`): measured `0.0996`. Every single one of the ten real measured fractions, checked across the full `position-tally` vector, sits within a fraction of a percent of `1` divided by that position's own one-indexed number — real, direct, measured confirmation of the symmetry argument's exact claim, at every position, not just a few convenient ones.

### Connection

Ten separate, verified probabilities — `1/1`, `1/2`, `1/3`, all the way to `1/10` — are sitting right here. What's left is the one step that turns them into a single answer: adding them up, and discovering what that sum actually is.

---

## Concept Unit: Linearity of Expectation and the Harmonic Sum

### The Problem

Ten positions, each with its own exact probability of being a record — `1/1`, `1/2`, `1/3`, ..., `1/10` — verified independently in Concept Unit 2. **Linearity of expectation** says the expected total number of records is exactly the sum of these ten probabilities, with no correction needed for the fact that these positions are *not* independent of each other (whether position `3` is a record genuinely does affect the odds for position `4`). What does that sum actually come out to, and does a real, measured average of real shuffles actually match it?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new, freestanding top-level procedures.
- **Location** — after `count-records`; `average-records` calls it directly.
- **Dependencies** — `count-records` and `shuffle`, defined in Concept Unit 1.

### The New Code

```scheme
(define (harmonic n)
  (let loop ((i 1) (total 0))
    (if (> i n)
        total
        (loop (+ i 1) (+ total (/ 1 i))))))

(define (average-records trials)
  (let loop ((t 0) (total 0))
    (if (= t trials)
        (/ total trials)
        (loop (+ t 1) (+ total (count-records (shuffle numbers)))))))
```

### The Updated Project

Skipped — both are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside.

### Isolated Lab: None — Justified Skip

`harmonic` and `average-records` are both count-terminated named-let loops, an accumulator, and arithmetic already-established procedures — the exact same shape as `average-return-time` from Lesson 164, and just as unremarkable there for the same reason: nothing here is a new construct, only a new use of ones already fully treated. No lab is given, per the same justification given in Concept Unit 2.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (harmonic n) ...)`** — `define` binds `harmonic` to a one-parameter procedure.
- **`(let loop ((i 1) (total 0)) ...)`** — a named `let`: `i` counts up from `1` (not `0` — the harmonic sum's own first term is `1/1`), `total` accumulates the running sum.
- **`(if (> i n) total (loop (+ i 1) (+ total (/ 1 i))))`** — the base case, `(> i n)`, fires once `i` has counted *past* `n`, returning the accumulated `total`; otherwise, `(/ 1 i)` computes this term's own exact fraction, `+` folds it into `total`, and the loop advances — this is the real, computed embodiment of Concept Unit 2's own ten separately-verified probabilities, added together exactly as linearity of expectation says they should be.
- **`(define (average-records trials) ...)`** — `define` binds `average-records` to a one-parameter procedure.
- **`(let loop ((t 0) (total 0)) ...)`** — a named `let`: `t` counts completed trials, `total` accumulates the sum of every trial's own real record count.
- **`(if (= t trials) (/ total trials) (loop (+ t 1) (+ total (count-records (shuffle numbers)))))`** — the base case divides the accumulated `total` by `trials`, the exact average; otherwise, `(shuffle numbers)` produces one fresh real permutation, `count-records` counts its real records, and that real count is folded into `total` before the loop advances.

### CS Lens

This is **linearity of expectation**: the expected value of a sum equals the sum of the expected values, whether or not the individual pieces being summed are independent of one another.

Also recognized in: Lesson 161's own hash-collision analysis, which summed an indicator over every *pair* of items instead of every *position*, relying on this exact same guarantee even though whether one pair collides is not independent of whether another pair does; expected total rainfall over a season computed by summing each day's own expected rainfall, with no need to account for the fact that a rainy day makes the next day's rain more or less likely; expected total dice-roll sum computed by summing each individual die's own expectation, true even for loaded, correlated dice; and, generalized beyond probability entirely, any accounting system that totals a budget by summing line items whose own amounts are not independent of each other — the total is still correct even when the line items interact.

### SE Lens

The design principle here is **trusting a proven mathematical guarantee over re-deriving it from scratch every time**. `average-records`'s own real measurement is checked directly against `harmonic`'s own exact prediction, with no code anywhere in this lesson actually proving linearity of expectation itself — that proof belongs to Lesson 153, cited and reused, not re-derived.

An alternative that was *not* chosen: attempt to compute the expected record count by reasoning about the joint behavior of all ten positions at once — accounting directly for how position `3` being a record changes the odds for position `4`, and so on, all the way through every real interaction. That alternative, if it could be made to work at all, would require tracking a probability distribution over every one of the `3,628,800` possible full shufflings, or some equivalently complex accounting for how each position's fate depends on every other — a combinatorial explosion this lesson's actual approach sidesteps completely, precisely because linearity of expectation never needed the positions to be independent in the first place. The real cost paid for trusting the theorem instead of re-deriving it here: this lesson's own confidence in the final formula rests on Lesson 153's proof being sound, not on anything checkable purely within this lesson's own code — exactly why the Run It section below checks the prediction against real, independent, measured evidence anyway, rather than trusting the formula on faith alone.

### Run It

```scheme
(harmonic 10)
;=> 7381/2520

(exact->inexact (harmonic 10))
;=> 2.9289682539682538
```

`H₁₀ = 7381/2520`, an exact fraction — computed from nothing but ten separate divisions and nine additions, no simulation anywhere — is approximately `2.929` as a decimal.

```scheme
(average-records 100000)
;=> 293247/100000

(exact->inexact (average-records 100000))
;=> 2.93247
```

`100,000` real, independent shuffles, each one really counted for real records, averaging to exactly `293247/100000`, or `2.93247` as a decimal — matching the exact prediction, `2.929`, to within about a tenth of a percent. Ten distinct numbers, shuffled at random, average fewer than three new record-highs while being scanned — a genuinely surprising result on its own, and one this lesson derived without ever generating anywhere close to all `3,628,800` possible shuffles, by breaking one hard question into ten easy, independently-verified ones and trusting a proven theorem to recombine them correctly.

### Connection

An exact formula, derived from a symmetry argument and a linearity-of-expectation sum, now agrees with real, independent, measured evidence — twice over, at the per-position level in Concept Unit 2 and at the aggregate level here. What's left is tracing one value through every piece this lesson built, and being honest about what the harmonic sum actually predicts as the input grows much larger.

---

## Closing

### Connect the Pieces

One real shuffle, moving through every piece built in this lesson, start to finish:

```scheme
(shuffle numbers)
;=> #(4 1 8 7 9 6 0 2 3 5)
```

A single, genuinely random permutation of the same ten numbers used throughout this lesson.

```scheme
(record-at? (vector 4 1 8 7 9 6 0 2 3 5) 2)
;=> #t
```

Position `2`, holding `8`, checked directly: the running maximum through position `2` is `max(4, 1, 8) = 8`, matching position `2`'s own value exactly — a real record, per Concept Unit 1's own indicator.

```scheme
(count-records (vector 4 1 8 7 9 6 0 2 3 5))
;=> 3
```

The same shuffle's *total* record count — `4` (record), `1` (no), `8` (record), `7` (no), `9` (record), and nothing after `9` beats it — three total, the sum of ten individual indicator checks, exactly like Concept Unit 1 built it.

```scheme
(harmonic 10)
;=> 7381/2520
```

And the exact, structure-only prediction this one real shuffle's own count should average out to, over enough trials — not because this *specific* shuffle has exactly `7381/2520` records (it can't; that's not even an integer), but because `Hₙ` describes the long-run average across every possible shuffle, the same relationship between one real measurement and one theoretical average this whole curriculum has built, again and again, since Lesson 159's first Monte Carlo check.

### What Breaks Without This

Concept Unit 2's own symmetry argument depends on every value in the shuffle being genuinely distinct — "position `i`'s value equals the running maximum through position `i`" only correctly identifies records when no two values can tie for that maximum. Breaking that on purpose, with a small, fixed, hand-picked example rather than leaving it to chance: `#(5 3 5)`, where the same value, `5`, appears twice.

```scheme
(define tie-example (vector 5 3 5))
(record-at? tie-example 0)
;=> #t

(record-at? tie-example 1)
;=> #f

(record-at? tie-example 2)
;=> #t

(count-records tie-example)
;=> 2
```

Position `0` (`5`) is genuinely a record — nothing came before it. Position `2` (also `5`) gets flagged as a record too, and *that's* the bug: the running maximum through position `2` is `max(5, 3, 5) = 5`, and position `2`'s own value is also `5`, so `record-at?`'s `=` check reports `#t` — but position `2` didn't actually beat the running maximum, it only *tied* it. `count-records` reports `2` total records for a sequence whose true high-water mark, `5`, was only ever reached, never genuinely exceeded a second time. This lesson's whole derivation, from the symmetry argument onward, implicitly assumed a genuine permutation of `n` *distinct* values, where "the biggest of the first `i + 1`" is always a single, unambiguous position with nothing else tied for it — an assumption `numbers`' own ten distinct digits always satisfied, silently, everywhere in this lesson, until this one deliberately broken, duplicate-valued example made it visible.

### Exercises

- Compute `harmonic 20` and `harmonic 100` for real, and measure `average-records` at matching sizes (a twenty- and hundred-element version of `numbers`). Confirm the match holds at these larger sizes too, not just at `n = 10`.
- `harmonic`'s own growth is famously slow — roughly proportional to the natural logarithm of `n`. Compute `harmonic 1000` and `harmonic 1000000` for real (as decimals, since the exact fractions get enormous), and compare how much smaller the second is than a thousand times the first.
- Modify `record-at?` into a `record-at?-from-right`, checking for right-to-left maxima instead — a position whose value beats everything *after* it, not before. Derive, and then verify empirically, whether this new indicator's own per-position probabilities are the same `1/i` sequence or something different.
- This lesson's `count-records` recomputes the running maximum from scratch at every position, an honest cost named in Concept Unit 1's own SE Lens. Write a single-pass version that tracks the running maximum in one accumulator instead, confirm it produces identical real counts to `count-records` on several real shuffles, and measure for real how much faster it is on a much larger vector.

### Definition of Done

- [ ] `shuffle`, `running-max-through`, `record-at?`, `count-records`, `harmonic`, and `average-records` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] Every one of the ten per-position probabilities, `1/1` through `1/10`, has been checked against a real, independent Monte Carlo measurement, not just the first few.
- [ ] `harmonic 10`'s exact value has been checked against a real, `100,000`-trial measured average of `average-records`.
- [ ] The duplicate-value failure has been caused on purpose, its real (non-crashing, silently wrong) behavior observed, not just anticipated.
- [ ] `git commit` — a message explaining *why* summing ten individually-verified probabilities is trustworthy even though the ten underlying events are not independent: it's not an approximation that happens to work, it's exactly what linearity of expectation guarantees, proven once in Lesson 153 and reused here without needing to be reproven.
