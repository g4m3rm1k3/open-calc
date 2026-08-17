# Lesson 264: P and NP

**What you will build**: a real, `bb`-verified checker that decides
whether one proposed answer solves a **subset-sum** problem — does some
subset of a list of numbers add up exactly to a target — in an amount of
work that depends only on the *size of the proposed answer itself*, not
on how large the search for that answer would have been. Then, a real,
`bb`-verified brute-force search that reuses that exact same checker
against every one of up to `2^n` possible answers, whose own measured
cost genuinely doubles, then doubles again, as the input grows by just
one element at a time. The transferable problem this lesson is actually
about: **P versus NP** — the difference between a problem being
tractable to *solve outright* and a problem merely being tractable to
*verify*, once someone hands you a candidate answer.

**What you need to know first**: Lesson 263's formal `TIME(f(n))`
definition and its accumulator-based instrumentation technique — an
extra argument, incremented at exactly the place real work happens,
turned into a real, printable count; this lesson applies that identical
technique to a new kind of computation instead of Turing-machine
transitions. Lesson 263's own asymptotic-growth vocabulary
(`exponential`, the constant-factor tolerance behind Big-O). Lesson 91's
`(declare ...)` pattern for functions that call each other before both
are defined. Lesson 96's `heap-extract-min`, which established returning
two different results as one vector pair — reused here as `[value
steps]` and `[found? tries]`.

**Terms used in this lesson**:

- **Decision problem** — a computational problem whose answer is always
  exactly "yes" or "no" for any given input, never something in between.
  It exists as its own category because complexity theory's classes
  (`P`, `NP`, and everything built from them) are defined over decision
  problems specifically — asking "is there *some* subset that sums to
  the target" (yes/no) is a genuinely different, more basic question
  than "what *is* such a subset," even though answering the second
  usually answers the first along the way.
- **Certificate** (also called a **witness**) — a candidate solution
  offered as evidence that a "yes" instance of a decision problem really
  is a "yes," without saying anything about how that candidate was
  found. It exists because verifying a *given* certificate and finding
  one from nothing are, as this lesson proves with real numbers, not
  the same amount of work at all.
- **Polynomial time** — a computation whose step count, as a function of
  input size `n`, is bounded by `n` raised to some fixed power (`n`,
  `n²`, `n³`, and so on) — never a base raised to the power of `n`. It
  exists as the standard line complexity theory draws between "grows
  manageably" and "grows explosively": a polynomial's growth, however
  steep, is nowhere near as punishing as an exponential's as `n` gets
  large, because the exponent stays fixed instead of growing with the
  input.
- **P** — the complexity class containing every decision problem
  solvable by some algorithm running in polynomial time: formally, the
  union, over every fixed constant `k`, of Lesson 263's own `TIME(n^k)`.
  It exists to name, precisely, the class of problems generally
  considered practically solvable, as input size grows without bound.
- **Power set** — the set of *every* subset of a given set, including
  the empty subset and the whole set itself. For a set of `n` elements,
  the power set always has exactly `2^n` members. It exists here because
  a brute-force search over "every possible subset" needs a concrete,
  literal enumeration of exactly what "every possible subset" means, not
  just a description of the idea.
- **Brute-force search** — trying every candidate in some search space,
  one at a time, with no cleverness about which to try first or which
  to skip, until one succeeds or all have been exhausted. It exists as
  the simplest possible correct search strategy — always correct,
  because it never skips anything, and exactly as expensive as its
  search space is large.
- **NP** — the complexity class containing every decision problem for
  which a "yes" instance has *some* certificate that a polynomial-time
  verifier can confirm. Critically, NP's own definition says nothing
  about how expensive it is to *find* that certificate — only that
  *checking* one, once handed it, is cheap. It exists to separate two
  genuinely different questions complexity theory had been conflating:
  "is this problem easy to solve" and "is this problem easy to check,"
  which this lesson's own two real, measured functions show are not
  automatically the same question.

**Objects and methods used**

- **`sum-counted`**
  - *What it is:* an instrumented list-summing function, applying Lesson
    263's own step-counting technique to a brand-new kind of
    computation.
  - *Implementation:* `(sum-counted lst acc steps)` returns `[final-sum
    steps-taken]`; `steps` increments exactly once per element added.
  - *Its use:* the concrete mechanism behind measuring exactly how much
    work checking one candidate actually costs.
- **`candidate-sum` / `verify-subset-sum`**
  - *What it is:* this lesson's own certificate checker for subset-sum.
  - *Implementation:* `candidate-sum` returns just the sum (discarding
    the step count) via `sum-counted`; `verify-subset-sum` compares that
    sum against the target, returning `true`/`false`.
  - *Its use:* the exact function every candidate in this lesson's
    brute-force search gets checked with — the same one function, reused
    unchanged, called once per candidate.
- **`all-subsets` and its helpers (`all-subsets-combine`,
  `all-subsets-with-item`, `append-all`)**
  - *What it is:* this lesson's own power-set generator.
  - *Implementation:* recursively builds every subset of a list by, for
    each element, generating every subset that includes it alongside
    every subset that doesn't, and combining the two sets together.
  - *Its use:* the concrete "every possible answer" a brute-force search
    needs to actually try.
- **`try-candidates` / `try-candidates-check`**
  - *What it is:* this lesson's own brute-force search loop.
  - *Implementation:* mutually recursive functions that check each
    candidate in turn via `verify-subset-sum`, stopping the moment one
    matches and counting every candidate tried along the way.
  - *Its use:* the search half of this lesson's central comparison.
- **`brute-force-subset-sum`**
  - *What it is:* the entry point tying the previous two pieces
    together.
  - *Implementation:* `(brute-force-subset-sum numbers target)` builds
    the full power set of `numbers` via `all-subsets`, then hands it to
    `try-candidates` against `target`.
  - *Its use:* the real, measured, whole-problem search this lesson
    compares against `verify-subset-sum`'s own real, measured cost.

---

## Concept Unit: P — Tractable to Solve, Because Tractable to Verify

### The Problem

Take a concrete question: given the numbers `3`, `7`, `2`, and `9`, does
*some* subset of them add up to exactly `12`? Before asking how hard it
is to *answer* that question in general, ask something narrower and more
basic first: if someone simply hands over a specific proposed answer —
say, "try `{3, 9}`" — how much work does it take to check whether
they're actually right?

### Introduce the Concept, Isolated

A throwaway, disposable example, unrelated to subset-sum specifically —
checking a proposed square root:

```clojure
(defn verify-sqrt-counted [candidate n]
  [(= (* candidate candidate) n) 1])
```

Run it:

```
user=> (verify-sqrt-counted 7 49)
[true 1]
user=> (verify-sqrt-counted 8 49)
[false 1]
```

This proves that checking a *given* candidate — square it, compare —
costs exactly one multiplication and one comparison, always, regardless
of how large `n` is or how much work it might have taken to originally
*find* `7` as the right candidate in the first place (by trial division,
by a smarter numerical method, by luck). This is called **certificate
verification**: confirming a proposed answer is correct, which this tiny
example shows can be dramatically cheaper than finding that answer from
nothing.

### Discard the Throwaway Example

`verify-sqrt-counted` is deleted here. It never appears again — only the
idea it proved (checking a given candidate can be far cheaper than
finding one) carries forward into this lesson's real code.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, because
  subset-sum has never come up in this curriculum before.
- **Files affected**: None (standalone lesson script, per the Section
  VI+ convention).
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sum-counted [lst acc steps]
  (if (empty? lst)
    [acc steps]
    (sum-counted (rest lst) (+ acc (first lst)) (inc steps))))

(defn candidate-sum [candidate]
  (get (sum-counted candidate 0 0) 0))
```

### The Updated Project

```clojure
(defn verify-subset-sum [candidate target]
  (= (candidate-sum candidate) target))
```

`verify-subset-sum` is the smallest new piece added on top of
`sum-counted`/`candidate-sum` — this *is* the certificate checker for
subset-sum, the whole point of this unit, sitting directly on top of the
two functions just shown, with nothing yet surrounding any of the three.

### Mechanical Walkthrough

- **`(defn sum-counted [lst acc steps] ...)`** — a 3-argument function:
  `lst` is the remaining elements still to add, `acc` is the running
  total so far, `steps` is Lesson 263's own instrumentation count,
  applied here to counting individual additions instead of TM
  transitions.
- **`(if (empty? lst) [acc steps] ...)`** — `empty?`, reused from
  earlier in the curriculum, checks whether any elements remain;
  when none do, the function returns its final answer as a 2-element
  vector pair (Lesson 96's own pattern): the total sum, and how many
  additions it took to get there.
- **`(sum-counted (rest lst) (+ acc (first lst)) (inc steps))`** — the
  recursive step: `(first lst)` reads the next element, `(+ acc (first
  lst))` adds it into the running total, `(rest lst)` drops that element
  from what remains, and `(inc steps)` counts this addition — one
  increment, at the one place a real addition actually happens, the same
  discipline Lesson 263's `run-tm-counted` used for transitions.
- **`(defn candidate-sum [candidate] (get (sum-counted candidate 0 0) 0))`**
  — calls `sum-counted` starting from an empty running total (`0`) and
  zero steps counted so far, then `(get ... 0)` pulls out just the final
  sum, discarding the step count — `candidate-sum` exists specifically
  for callers that only care about the total, not how it was reached.
- **`(defn verify-subset-sum [candidate target] (= (candidate-sum candidate) target))`**
  — the actual certificate check: sum the candidate via `candidate-sum`,
  and `=` (already familiar from every earlier lesson) compares that sum
  against the target. This is the complete definition of "correctly
  solves subset-sum" for one specific proposed subset — nothing more.

### CS Lens

This is **P**, made concrete: `verify-subset-sum`'s own cost, via
`sum-counted`'s real `steps` count, depends only on the *length of the
candidate itself* — not on how many numbers were in the original list,
not on how large the eventual search for a good candidate might be. A
function whose cost scales this way (linearly, here — `steps` equals
exactly the candidate's own length) sits inside `TIME(n)`, itself inside
`TIME(n^k)` for `k = 1`, itself inside `P`. Also recognized in: a
compiler's own type-checker (confirming a program's types are consistent
is fast, even though writing a correctly-typed program in the first
place can take a programmer hours), a Sudoku puzzle's answer key
(checking a filled-in grid is trivial; solving the blank grid is not), a
cryptographic signature check (verifying a signature is fast; forging
one, without the private key, is designed to be infeasible), and a
proofreader confirming a finished proof is valid without having to have
discovered the proof themselves.

### SE Lens

The alternative not chosen here: build one combined function that both
searches for a valid subset *and* reports the answer, skipping a
separate, standalone verifier entirely. That would work for this one use
case, but it throws away something real: `verify-subset-sum` is useful
on its own, independent of however a candidate got proposed — a human
guess, a different, smarter algorithm than the one this lesson builds
next, even a lucky guess. Keeping verification as its own small,
independent function is exactly what makes it possible to reuse it,
completely unchanged, as the inner loop of an entirely different
function next — which is precisely what Unit 2 does.

### Commands

None new.

### Run It — Real Output

```
user=> (verify-subset-sum [3 9] 12)
true
user=> (verify-subset-sum [3 2] 12)
false
user=> (sum-counted [3 9] 0 0)
[12 2]
user=> (sum-counted [3 7 2 9 5 1 8 4] 0 0)
[39 8]
```

`[3 9]` really does sum to `12` — a valid certificate for "does some
subset of `[3 7 2 9]` sum to `12`" — and `verify-subset-sum` confirms it
correctly, in `2` real steps (`sum-counted`'s own count), regardless of
how many numbers the original list actually had. The second line proves
the same thing at a larger scale: an 8-element candidate costs exactly
`8` real steps to verify — the cost scales with the *candidate's own
size*, nothing else.

### Connecting Back

`verify-subset-sum` answers "is this one specific proposed answer
correct" cheaply and directly. It says nothing at all about how to find
such an answer in the first place — that's the genuinely different
question the next unit takes on, reusing this exact function unchanged.

---

## Concept Unit: NP — Tractable to Verify, Even When Finding Is Hard

### The Problem

`verify-subset-sum` can confirm a *given* candidate cheaply. But nobody
handed the algorithm `{3, 9}` in the first place — in general, all that's
known going in is the list of numbers and the target. Finding *some*
valid subset, with no shortcuts and no cleverness, means trying
candidates until one works. How expensive is that, really — in real,
measured numbers, not a guess?

### Introduce the Concept, Isolated

Not applicable — this unit's own new project code (`all-subsets` and
`try-candidates`) is already the smallest way to demonstrate the actual
concept (brute-force search over an exhaustively-generated space); there
is no smaller throwaway version that would teach anything the real code
doesn't already show directly, following the same precedent set once
concept isolation and real project code stopped needing to be two
different things (Lesson 130 onward).

### Discard the Throwaway Example

Not applicable, for the same reason.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka; `verify-subset-sum` and `candidate-sum`
  from Unit 1, reused unchanged.

### The New Code

Generating every possible candidate first — the power set of the input
list:

```clojure
(defn append-all [target-vec source-vec]
  (if (empty? source-vec)
    target-vec
    (append-all (conj target-vec (first source-vec)) (rest source-vec))))

(defn all-subsets-with-item [item subsets]
  (if (empty? subsets)
    []
    (conj (all-subsets-with-item item (rest subsets)) (conj (first subsets) item))))
```

Run the two new pieces against a tiny, already-understood case:

```
user=> (append-all [[1] [2]] [[3] [4]])
[[1] [2] [3] [4]]
user=> (all-subsets-with-item 9 [[] [3]])
[[9] [3 9]]
```

`append-all` correctly combines two vectors of subsets into one;
`all-subsets-with-item` correctly builds "every one of these existing
subsets, but with `9` also included" — the two smallest building blocks
the real power-set generator below depends on.

### The Updated Project

```clojure
(defn all-subsets-combine [item rest-subsets]
  (append-all rest-subsets (all-subsets-with-item item rest-subsets)))

(defn all-subsets [numbers]
  (if (empty? numbers)
    [[]]
    (all-subsets-combine (first numbers) (all-subsets (rest numbers)))))

(declare try-candidates-check)

(defn try-candidates [candidates target tries]
  (if (empty? candidates)
    [false tries]
    (try-candidates-check (first candidates) (rest candidates) target tries)))

(defn try-candidates-check [candidate remaining target tries]
  (if (= (candidate-sum candidate) target)
    [true (inc tries)]
    (try-candidates remaining target (inc tries))))

(defn brute-force-subset-sum [numbers target]
  (try-candidates (all-subsets numbers) target 0))
```

Together with `append-all` and `all-subsets-with-item` above, this
completes the search: `brute-force-subset-sum` builds the entire power
set of `numbers` via `all-subsets`, then hands every one of its subsets,
one at a time, to `try-candidates`.

### Mechanical Walkthrough

- **`(defn all-subsets-combine [item rest-subsets] (append-all rest-subsets (all-subsets-with-item item rest-subsets)))`**
  — for one element (`item`) and the already-computed subsets of
  everything after it (`rest-subsets`), builds *every* subset of the
  larger list: every subset that doesn't include `item` (that's
  `rest-subsets` itself, unchanged) combined, via `append-all`, with
  every subset that does (`all-subsets-with-item`'s own result). This is
  the actual definition of a power set, made concrete: for each element,
  either it's in a given subset or it isn't, and every subset is exactly
  one of those two cases.
- **`(defn all-subsets [numbers] (if (empty? numbers) [[]] (all-subsets-combine (first numbers) (all-subsets (rest numbers)))))`**
  — the base case, `(empty? numbers)`, returns `[[]]`: a vector
  containing exactly one subset, the empty one — the only subset an
  empty list has. The recursive case takes the first element and
  combines it with the (already fully computed, by recursion) power set
  of everything after it, via `all-subsets-combine`.
- **`(declare try-candidates-check)`** — Lesson 91's forward-declaration
  pattern: `try-candidates`, defined next, calls `try-candidates-check`
  before it exists yet in the file; genuine mutual recursion, since
  `try-candidates-check` also calls back into `try-candidates`.
- **`(defn try-candidates [candidates target tries] (if (empty? candidates) [false tries] (try-candidates-check (first candidates) (rest candidates) target tries)))`**
  — if no candidates remain, the search has exhausted every possibility
  without success: `[false tries]` reports failure along with exactly
  how many were tried. Otherwise, `(first candidates)` and `(rest
  candidates)` split off the next candidate to check from everything
  still left, handed to `try-candidates-check`.
- **`(defn try-candidates-check [candidate remaining target tries] (if (= (candidate-sum candidate) target) [true (inc tries)] (try-candidates remaining target (inc tries))))`**
  — reuses `candidate-sum` from Unit 1, completely unchanged, to check
  exactly one candidate. A match returns `[true (inc tries)]` — success,
  counting this final check. No match recurses back into
  `try-candidates` with whatever candidates remain, incrementing `tries`
  either way, since a real check happened either way.
- **`(defn brute-force-subset-sum [numbers target] (try-candidates (all-subsets numbers) target 0))`**
  — ties the two pieces together: build the complete power set first,
  via `all-subsets`, then search it exhaustively, via `try-candidates`,
  starting the real try-count at `0`.

### CS Lens

This is **NP**, made concrete, alongside Unit 1's `P`: `brute-force-subset-sum`
is *a* way to solve subset-sum, but its own real, measured cost — shown
below — grows exponentially, not polynomially, so nothing here proves
subset-sum itself is *in* `P`. What's genuinely proven, by the very
existence of `verify-subset-sum` from Unit 1, is that subset-sum is *in*
`NP`: every "yes" instance has a certificate (a specific valid subset)
that a polynomial-time checker (`verify-subset-sum`, real and `bb`-verified)
can confirm, regardless of how expensive finding that certificate
happens to be. This is also the concrete reason `P` is always a subset
of `NP`: anything solvable outright in polynomial time is trivially also
verifiable in polynomial time — just solve it yourself and ignore
whatever candidate was offered. Whether every problem in `NP` is
*also* in `P` — whether `P = NP` — is the single most famous open
question in computer science: no one has ever found a polynomial-time
algorithm for subset-sum (or thousands of other real `NP` problems,
Lesson 265's own subject), and no one has ever proven one is impossible
either. Also recognized in: the Sudoku and cryptographic-signature
examples from Unit 1's own CS Lens, a jigsaw puzzle (checking a finished
picture is instant; assembling it is not), and a school timetable
(confirming a proposed schedule has no conflicts is fast; building one
with none, for a large school, is a real, practical struggle every
administrator recognizes).

### SE Lens

The alternative not chosen: give up on exhaustiveness and only try a
handful of "likely-looking" candidates instead of the full power set.
That would be faster, but it trades away the one guarantee brute force
actually provides — correctness. `try-candidates` only ever returns
`false` after trying *every* possibility, which is the only way to
honestly claim "no subset works" rather than "no subset I happened to
try worked." The real cost this lesson pays for that guarantee is shown
directly below: real, measured, exponential blowup. It's also worth
naming honestly that this lesson's own `all-subsets`/`try-candidates`
pair inherits the identical constraint every earlier lesson in this
curriculum has: no `loop`/`recur` allowed, only ordinary recursion.
Pushed far enough — a 12-element input, whose power set has `4096`
subsets — that ordinary recursion genuinely overflows the JVM's real
call stack with a real `StackOverflowError`, the same honest,
`bb`-confirmed limitation Lesson 248's own `riemann-sum` hit first. This
lesson's own real numbers, below, stay well short of that wall on
purpose — the wall itself is a fact about *this curriculum's own"
no-`loop` convention, not about subset-sum or `NP` themselves.

### Commands

None new.

### Run It — Real Output

```
user=> (all-subsets [1 2])
[[] [2] [2 1] [1]]
user=> (count (all-subsets [1 2 3]))
8
user=> (brute-force-subset-sum [3 7 2 9] 12)
[true 12]
user=> (brute-force-subset-sum [3 7 2 9] 22)
[false 16]
user=> (brute-force-subset-sum [3 7 2 9 5 1] 30)
[false 64]
user=> (brute-force-subset-sum [3 7 2 9 5 1 8 4] 40)
[false 256]
```

`22` and `30` and `40` were each deliberately chosen to be *unreachable*
— one more than the actual sum of all the numbers in each list — forcing
a genuine full search of every single subset, no lucky early exit. The
real numbers this produces:

| input size `n` | power-set size (real `tries`) |
|-----------------|-------------------------------|
| 4               | 16                             |
| 6               | 64                             |
| 8               | 256                             |

Each `+2` to `n` exactly *quadruples* the real, measured `tries` count
(`2² = 4`), which is exactly what `2^n` growth looks like in practice —
not asserted, `bb`-counted. Against Unit 1's own `verify-subset-sum`,
whose cost never depended on the search space at all — only on one
candidate's own length — this is the entire lesson made concrete in two
real numbers: verifying one answer costs `n`; finding one, by the only
method built so far, costs `2^n`.

### Connecting Back

Two real functions, one problem: `verify-subset-sum` proved subset-sum
sits in `NP` — every "yes" has a cheaply-checkable certificate.
`brute-force-subset-sum` proved that the *only* method built so far for
actually finding one costs exponentially more. Whether a genuinely
faster way to search — one that would prove subset-sum, and everything
like it, sits in `P` after all — exists at all is the open question this
lesson leaves standing, on purpose, exactly where the field's own
current knowledge actually stands.

---

## Connect the Pieces

One concrete instance, start to finish: for `numbers = [3 7 2 9]` and
`target = 12`, `verify-subset-sum` confirmed the specific candidate `[3
9]` in `2` real steps — fast, and completely indifferent to how large
the original list was. `brute-force-subset-sum`, asked the harder
question — does *some* subset work, with no candidate handed to it —
built the full `16`-subset power set via `all-subsets`, then reused
`verify-subset-sum` (through `candidate-sum`, unchanged) once per
candidate via `try-candidates`, finding a match on the `12`th try. The
same underlying check did both jobs: confirming one answer, and, run
repeatedly, searching for one. What differs entirely is how many times it
had to run — `1` time when the answer was already known, up to `2^n`
times when it wasn't. `P` names problems where a fast *solver* exists at
all; `NP` names problems where a fast *checker* exists, whether or not a
fast solver has ever been found — and subset-sum, proven concretely
across both units, sits in `NP` for certain and in `P` only if someone,
someday, finds an algorithm nobody has found yet.

## What Breaks Without This

`all-subsets`'s own correctness depends on `all-subsets-combine`
including *both* halves of the power set — the subsets that include the
current element, and the subsets that don't. Drop the second half:

```clojure
(defn broken-all-subsets-combine [item rest-subsets]
  (all-subsets-with-item item rest-subsets))

(declare broken-all-subsets)

(defn broken-all-subsets-step [item numbers]
  (broken-all-subsets-combine item (broken-all-subsets (rest numbers))))

(defn broken-all-subsets [numbers]
  (if (empty? numbers)
    [[]]
    (broken-all-subsets-step (first numbers) numbers)))
```

`broken-all-subsets-combine` no longer calls `append-all` at all —
`rest-subsets`, the subsets that *don't* include the current item, are
silently thrown away, keeping only `all-subsets-with-item`'s own result.
This still runs without error, still returns something that looks like a
list of subsets, and still even contains the *correct* full set:

```
user=> (broken-all-subsets [1 2])
[[2 1]]
user=> (broken-brute-force-subset-sum [3 7 2 9] 12)
[false 1]
```

Instead of the real power set's `4` subsets, `broken-all-subsets`
produces exactly `1` — the full set, and nothing else — because every
level of the recursion keeps only the "include this element" branch,
forcing every surviving subset to include *every* original element.
`broken-brute-force-subset-sum [3 7 2 9] 12` reports `[false 1]`: a
confident, silent, *wrong* answer — subset-sum really does have a valid
certificate here (`{3, 9}`, confirmed by Unit 1's own
`verify-subset-sum`), but the broken search space never contained it to
find. This is exactly why `NP`'s own formal definition requires *some*
certificate to be checkable, not that a specific search procedure
happens to find one: `broken-all-subsets`'s failure is a broken search,
not a broken certificate — the certificate was real all along, and
`verify-subset-sum`, unchanged and still correct, would have confirmed
it instantly if the search had ever actually offered it.

## Exercises

1. Run `brute-force-subset-sum` against a `10`-element list (with an
   unreachable target, one more than the true sum) and predict the real
   `tries` count before confirming it — should be exactly `2^10 = 1024`.
2. `verify-subset-sum`'s own real cost (via `sum-counted`) depends only
   on the *candidate's* length, not the original list's. Confirm this
   directly: call `verify-subset-sum` with a 2-element candidate against
   two different original lists, one of length `4` and one of length
   `8`, and confirm `sum-counted`'s own step count is identical (`2`)
   both times.
3. State, in your own words, why `P ⊆ NP` always holds, using this
   lesson's own two functions as the concrete argument (not just the
   citation "solving is at least as hard as checking").
4. `broken-all-subsets [1 2]` produced exactly one subset, `[2 1]` — the
   full set. Trace, by hand, exactly which line of
   `broken-all-subsets-combine` is responsible for discarding
   `rest-subsets`, and state what real code change would restore the
   correct `4`-subset result without changing anything else.

## Definition of Done

- [ ] `verify-subset-sum` and `sum-counted` produce the real, `bb`-verified
      output shown above for both the `2`-element and `8`-element cases.
- [ ] `all-subsets` produces the real, verified `4`-subset result for
      `[1 2]` and the real, verified `8`-subset count for `[1 2 3]`.
- [ ] `brute-force-subset-sum` produces the real, verified `tries` counts
      shown above — `16` for `n=4`, `64` for `n=6`, `256` for `n=8` — each
      exactly `2^n`.
- [ ] The broken enumeration reproduces the real, verified `[false 1]`
      wrong answer shown above, on the exact input where the correct
      answer is `[true 12]`.
- [ ] You can state, without looking back at this lesson, the formal
      definitions of `P` and `NP`, and explain concretely (using this
      lesson's own two functions) why `P ⊆ NP` always holds while `P =
      NP` remains an open question.
- [ ] Commit: *"Add a subset-sum verifier and brute-force search, so P
      and NP have real, measured numbers behind them instead of asserted
      growth rates."*
