# Lesson 256: Regular Expressions

**What you will build** — A small, real pattern-matching engine, built from nothing but recursion: first a matcher for exact symbol sequences, then extended to support Kleene star (zero-or-more repetition) via genuine backtracking search, and finally used to measure — not just assert — a real, honest performance cost naive backtracking can incur. The transferable problem: a regular expression is not a mysterious, separate kind of magic string — it is a compact *notation* for exactly the same class of languages Lessons 254 and 255 already built automata for, and that compactness has a real, measurable price when matched the naive way.

**What you need to know first** — Lesson 253's unbounded search and its own honest failure mode. Lesson 254's and 255's own vocabulary — **regular language**, **language (of an automaton)**. Lesson 20's recursion, Lesson 22's base-case-and-progress, Lesson 84's `get`, Lesson 94/96's append-by-`assoc`. Lesson 91's mutual-recursion-via-`declare` convention, needed here because this lesson's `match-at` and `try-star-consumption` call each other.

**Terms used in this lesson**

- **regular expression** — a compact, symbolic notation describing a set of allowed input sequences, built from individual symbols combined by a small number of operations — most importantly here, placing symbols one after another (**concatenation**) and repeating a symbol zero or more times (**Kleene star**). Kleene's theorem, named for mathematician Stephen Kleene, states that the languages describable this way are exactly the regular languages Lessons 254 and 255 already built automata for — two different notations for the identical class of languages, not two different classes.
- **concatenation** — placing pattern pieces one after another, so a match must satisfy the first piece, then immediately continue satisfying the next, with nothing skipped and nothing left over.
- **Kleene star** — a pattern operation meaning "zero or more repetitions of whatever this applies to." Unlike a fixed literal, a starred pattern element can match a sequence of many different lengths — none, one, or any larger number of repetitions — which is exactly what makes matching it require search rather than a single direct comparison.
- **backtracking** — a search strategy that tries one choice, and if it later leads to failure, undoes that choice and tries a different one instead, rather than committing permanently to the first option tried. This lesson's star-matching is a small, real instance of backtracking: try consuming as many repetitions as possible first, and if that choice cannot lead to an overall match, try one fewer, and so on.
- **naive backtracking** — a backtracking implementation that, when several available choices could each independently lead to failure, re-explores overlapping work across those choices rather than reusing anything already discovered. This lesson's own matcher is naive in exactly this sense, and its third Concept Unit measures the real cost that naivety produces.

**Objects and methods used**

- **`System/nanoTime`**
  - *What it is:* A real static method in Java's standard library (`java.lang.System`), reachable directly from Clojure via the same Java-interop syntax Lesson 231 first used for `Math/sqrt`.
  - *Implementation:* Takes no arguments and returns a `long` — a count of nanoseconds from some fixed, arbitrary reference point. The absolute number means nothing on its own; only the *difference* between two calls, measuring elapsed time between them, is meaningful.
  - *Its use:* This lesson's third Concept Unit calls it once immediately before running the matcher and once immediately after, to measure real, honest elapsed time rather than asserting a cost without evidence.
- **`get`, `count`, `assoc`, `=`, `+`, `-`, `<`, `if`, `defn`, `println`**
  - *What they are:* All reappear in full from Lessons 253–255: `get` reads a value out of a vector by index; `count` reports a collection's length; `assoc` returns an updated copy of a vector with one position changed (or grown by one, when given exactly the vector's own current length); `=` tests equality; `+`/`-` are Clojure's arithmetic functions; `<` is numeric less-than; `if` branches on a test; `defn` names a function; `println` prints its arguments' readable form.
  - *Their use here:* Identical roles to every prior lesson in this section — indexing into pattern and input vectors, counting lengths for base cases, growing an accumulator vector, comparing symbols and positions for equality, advancing and retreating search indices, branching on every base case, naming every function below, and printing every real result shown.

---

## Concept Unit: Patterns as Executable Data

### The Problem

Lessons 254 and 255 both wrote out transition *tables* by hand, one triple at a time, to describe a language. That works, but it does not match how regular expressions actually look in practice — compact, symbol-by-symbol notation, not an explicit state diagram. Before this lesson can build anything resembling real Kleene star or backtracking, it needs the simplest possible version of that idea: a pattern that is just a straight sequence of exact symbols to match, one after another, with nothing extra.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing Section XII's build from Lesson 255.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn match-at [pattern pattern-index input input-index]
  (if (= pattern-index (count pattern))
    (= input-index (count input))
    (if (= input-index (count input))
      false
      (if (= (get pattern pattern-index) (get input input-index))
        (match-at pattern (+ pattern-index 1) input (+ input-index 1))
        false))))

(defn matches-pattern? [pattern input]
  (match-at pattern 0 input 0))
```

### The Updated Project

Skipped — two freestanding new functions, nothing surrounding them yet.

### Naming the Concept

Per the Section VI+ convention already used throughout this section, this code is both the isolated demonstration and the real artifact directly. A **pattern**, at this stage, is nothing more than an ordinary vector of symbols — `["a" "b"]` means "an `a`, then immediately a `b`, then nothing else." `match-at` walks the pattern and the input in lockstep, one position at a time, via **concatenation** — each symbol must match in order, with no gaps and no leftovers on either side.

```
matches-pattern? [a b] vs [a b] => true
matches-pattern? [a b] vs [a] => false
matches-pattern? [a b] vs [a b c] => false
matches-pattern? [a b] vs [a c] => false
```

`["a" "b"]` against `["a" "b"]` matches exactly, symbol for symbol. `["a" "b"]` against `["a"]` fails — the pattern still has a symbol left to match once the input has run out. `["a" "b"]` against `["a" "b" "c"]` also fails — this is the detail worth stating plainly: a pattern only matches an input that is *exactly* the described sequence, not merely one that *starts with* it; a leftover `"c"` after the pattern is fully satisfied is still a failure, not a partial success. `["a" "b"]` against `["a" "c"]` fails at the second position directly — the symbols themselves disagree.

### Mechanical Walkthrough

Every distinct syntactic element in `match-at` and `matches-pattern?`, in order:

- **`pattern`, `pattern-index`, `input`, `input-index`** — four parameters, ordinary name bindings (Lesson 3): the pattern vector, how far into it this call has reached, the input vector, and how far into it this call has reached — reappearing in role from Lesson 254's own `run-from`, which tracked an `index` into an input the same way.
- **`(if (= pattern-index (count pattern)) (= input-index (count input)) ...)`** — the outer base case: `count`, already explained in the Header, reports each vector's length; once the pattern has been fully walked (`pattern-index` has reached its length), the match succeeds only if the input has *also* been fully walked at exactly the same moment — via `=`, already explained in the Header, comparing `input-index` to `(count input)`. This single line is what enforces "exact match, no leftovers" rather than "starts with."
- **`(if (= input-index (count input)) false ...)`** — a second base case, reached only when the pattern still has symbols left: if the input has already run out first, there is nothing left to match the pattern's remaining symbol against, so the match fails, `false`, directly.
- **`(= (get pattern pattern-index) (get input input-index))`** — two calls to `get`, already explained in the Header, reading the symbol currently expected by the pattern and the symbol currently present in the input, compared with `=`.
- **`(match-at pattern (+ pattern-index 1) input (+ input-index 1))`** — the recursive case: if the two symbols matched, advance *both* indices by `1` via `+`, already explained in the Header, and continue. Advancing both together, always by exactly one, is what makes this a check for a **concatenation** of individual symbol-matches rather than something more flexible.
- **`false`** (the final else branch) — returned directly the moment two compared symbols disagree; there is no recovery from a mismatched literal symbol in this unit's version of matching.
- **`(defn matches-pattern? [pattern input] (match-at pattern 0 input 0))`** — a small wrapper function, giving callers a way to start a match without needing to know or supply the two internal index parameters themselves; both start at `0`, the beginning of each vector.

### CS Lens

**Regular expression**, **concatenation**, and their real relationship to finite automata, are hard concepts.

```
Also recognized in: a file-glob pattern like *.txt, matched against filenames
one character-class at a time; a URL path template (/users/:id/posts)
matched segment by segment against a real incoming request path; a simple
protocol handshake requiring an exact sequence of messages in a fixed order,
with no substitutions and no messages skipped; Lesson 255's own identifier
automaton, which — read as a pattern instead of a state diagram — says
exactly "one letter, then any mix of letters and digits," the same idea
this lesson is now describing with a different notation.
```

### SE Lens

The design principle: separate the *notation* for describing a language (a pattern, read left to right, compact and close to how a person would describe the rule in words) from the *machinery* that decides whether something satisfies it (`match-at`, a small recursive search). The alternative not chosen: reuse Lesson 254's own transition-table-and-`accepts?` machinery directly, translating this pattern into an equivalent automaton by hand before running anything. That alternative is exactly what Kleene's theorem guarantees is always *possible* — patterns and automata describe the same class of languages — but it is not always the most *direct* way to check one specific input, and building the translation machinery in full (systematically converting an arbitrary pattern into an equivalent automaton) is real, substantial work this lesson deliberately does not attempt, the same honest scope-limiting this curriculum already applied in Lessons 99, 100, and 134. The real tradeoff paid for that omission: this lesson's matcher works directly and simply for the patterns it supports, at the cost of not being provably identical in structure to an automaton — a real, acknowledged gap, not a hidden one.

### Commands Needed

`bb <path-to-file>.clj`, unchanged from the two lessons before this one.

### Run It

```
matches-pattern? [a b] vs [a b] => true
matches-pattern? [a b] vs [a] => false
matches-pattern? [a b] vs [a b c] => false
matches-pattern? [a b] vs [a c] => false
```

Run for real, this session, via `bb`. All four match this unit's own stated concatenation rule by direct inspection.

### Connection

Exact concatenation alone cannot express "any number of `a`s" — the next unit adds exactly that, and with it, the first genuine search this lesson's matcher has to perform.

---

## Concept Unit: Kleene Star and Backtracking

### The Problem

A real regular expression needs more than "match these exact symbols in order" — it needs to express "zero or more of this symbol," the operation that gives Kleene's theorem its name. Adding that means a single pattern element can now match input of *different possible lengths* depending on how many repetitions it consumes — which immediately raises a question exact concatenation never had to answer: if trying one number of repetitions leads to failure later on, how does the matcher try a different number instead, rather than giving up?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, extending this lesson's own Concept Unit above.
- **Files affected**: None (standalone lesson code, per the Section VI+ convention).
- **Change type**: Refactor — `match-at` is modified in place to distinguish two kinds of pattern elements instead of assuming every element is a literal.
- **Location**: Replacing the previous unit's own `match-at` body.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(declare match-at)

(defn count-repeats-possible [symbol input input-index]
  (if (= input-index (count input))
    0
    (if (= (get input input-index) symbol)
      (+ 1 (count-repeats-possible symbol input (+ input-index 1)))
      0)))

(defn try-star-consumption [pattern pattern-index input input-index attempt]
  (if (< attempt 0)
    false
    (if (match-at pattern (+ pattern-index 1) input (+ input-index attempt))
      true
      (try-star-consumption pattern pattern-index input input-index (- attempt 1)))))
```

### The Updated Project

`match-at` itself, from the previous unit, with the new star-handling branch marked (`; <- new`), and every previously-shown line repeated in full rather than elided:

```clojure
(defn match-at [pattern pattern-index input input-index]
  (if (= pattern-index (count pattern))
    (= input-index (count input))
    (if (= (get (get pattern pattern-index) 0) "lit")            ; <- new
      (if (= input-index (count input))
        false
        (if (= (get (get pattern pattern-index) 1) (get input input-index)) ; <- new
          (match-at pattern (+ pattern-index 1) input (+ input-index 1))
          false))
      (try-star-consumption pattern pattern-index input input-index          ; <- new
                             (count-repeats-possible                          ; <- new
                               (get (get pattern pattern-index) 1)            ; <- new
                               input input-index)))))                         ; <- new
```

`match-at` as a whole now does more than before: it still handles the outer base case exactly as the previous unit left it (fully consumed pattern requires fully consumed input), but the recursive case now first checks *which kind* of element the pattern currently holds — `"lit"` (an exact symbol, matched the same way as before, just now reading the symbol from index `1` of a tagged pair instead of directly from the pattern) or anything else, meaning `"star"` (a repeatable symbol, handled by the two new functions above).

### Naming the Concept

Because a pattern can now hold two different *kinds* of elements, each element itself needs to say which kind it is — a plain symbol is no longer enough on its own. This lesson tags every element as a two-slot vector: `["lit" "a"]` for an exact symbol, or `["star" "a"]` for zero-or-more repetitions of a symbol — the same vector-as-pair convention Lessons 85, 87, and 88 established, now marking *what kind of thing* a value is, not just holding two related values side by side.

`count-repeats-possible` finds the largest number of consecutive repetitions of a given symbol available starting at the current input position — a real, honest upper bound, not a guess. `try-star-consumption` then does the actual **backtracking**: starting from that largest possible count (`attempt`), it asks "if the star consumes exactly this many repetitions, does the *rest* of the pattern match the *rest* of the input?" — via a call back into `match-at` itself, continuing from the pattern position right after the star. If that fails, it does not give up; it tries one fewer repetition instead (`(- attempt 1)`), all the way down to `0` repetitions (the star matching nothing at all), only reporting real failure once every possible count has been tried and none worked.

```
star a*b vs [b] => true
star a*b vs [a b] => true
star a*b vs [a a a b] => true
star a*b vs [a a] => false
star a*b vs [] => false
star a*b vs [b b] => false
```

`[["star" "a"] ["lit" "b"]]` — read as "any number of `a`s, then exactly one `b`" — accepts `["b"]` (zero `a`s), `["a" "b"]` (one), and `["a" "a" "a" "b"]` (three), and correctly rejects `["a" "a"]` (no `b"` at all), `[]` (nothing to satisfy either piece), and `["b" "b"]` (the required `b` is there, but an extra, unmatched second `b"` remains once the pattern is fully consumed — the same "no leftovers" rule the previous unit's own base case already enforced, still holding exactly the same way here).

### Mechanical Walkthrough

New elements not already covered in the previous unit:

- **`(declare match-at)`** — reappearing from Lesson 91's own mutual-recursion convention: `match-at` and `try-star-consumption` now call each other (`match-at`'s star branch calls `try-star-consumption`, which itself calls `match-at`), so `match-at`'s name has to be declared before `try-star-consumption` is defined, even though `match-at`'s own full definition comes later in the file.
- **`symbol`** (in `count-repeats-possible`) — a parameter bound to the one specific symbol being counted, read from the star element's own second slot at the call site.
- **`(if (= input-index (count input)) 0 ...)`** (in `count-repeats-possible`) — a base case: if the input has already run out, there are zero further repetitions available, full stop.
- **`(if (= (get input input-index) symbol) (+ 1 (count-repeats-possible symbol input (+ input-index 1))) 0)`** — if the symbol at the current input position matches, count this one repetition (`+ 1`) plus however many more are available starting one position later (the recursive call); if it does not match, the run of repetitions has ended, and `0` further repetitions are added from here.
- **`attempt`** (in `try-star-consumption`) — a parameter holding how many repetitions this particular call is currently trying, starting from `count-repeats-possible`'s own greedy maximum and shrinking by `1` on every recursive call that fails.
- **`(if (< attempt 0) false ...)`** — `try-star-consumption`'s own base case: `<`, already explained in the Header, checks whether every possible attempt count, all the way down to and including `0`, has already been tried and failed; once `attempt` has gone negative, there is genuinely nothing left to try, and the honest answer is `false`.
- **`(match-at pattern (+ pattern-index 1) input (+ input-index attempt))`** — the actual backtracking check: does the rest of the pattern (`+ pattern-index 1`, skipping past the star element entirely) match the rest of the input, *assuming* the star consumed exactly `attempt` repetitions (`+ input-index attempt`, skipping that many symbols forward)?
- **`(try-star-consumption pattern pattern-index input input-index (- attempt 1))`** — if that specific attempt failed, try one fewer repetition, via `-`, already explained in the Header, without moving `pattern-index` or `input-index` at all — only `attempt` changes, because the star element itself has not been resolved yet.
- **`(= (get (get pattern pattern-index) 0) "lit")`** — the new dispatch check inside `match-at`: read the current pattern element's own tag (index `0`) and compare it to the string `"lit"` to decide which branch applies.
- **`(get (get pattern pattern-index) 1)`** (both occurrences) — reading a tagged element's actual payload from index `1`: the literal symbol to compare against, in the `"lit"` branch; the symbol to repeat, passed to `count-repeats-possible`, in the star branch.

**Execution trace** — `(matches-pattern? [["star" "a"] ["lit" "b"]] ["a" "a" "a" "b"])`, matching this unit's own third `Run It` line above:

```
match-at pattern-index=0 input-index=0: element ["star" "a"] -> count-repeats-possible "a" from index 0
  count-repeats-possible: input[0]=a matches -> 1 + count from index 1
  count-repeats-possible: input[1]=a matches -> 1 + count from index 2
  count-repeats-possible: input[2]=a matches -> 1 + count from index 3
  count-repeats-possible: input[3]=b does not match "a" -> 0
  total: 3 -> try-star-consumption starts at attempt=3
try-star-consumption attempt=3: match-at pattern-index=1 input-index=3 (skip 3 a's)
  match-at: element ["lit" "b"], input[3]=b matches -> match-at pattern-index=2 input-index=4
  match-at: pattern-index=2=(count pattern) -> (= input-index 4 (count input) 4) -> true
  -> try-star-consumption attempt=3 succeeds immediately, returns true
```

The greedy maximum of `3` repetitions happened to be exactly right on the very first attempt — no backtracking to a smaller count was actually needed for this particular input, since the input's own trailing `"b"` lines up perfectly with consuming all three `a`s. The next unit's own execution shows what happens when the first attempt is *not* right, and every smaller one has to be tried in turn.

### CS Lens

**Kleene star** and **backtracking** are hard concepts.

```
Also recognized in: undo/redo functionality in an editor, trying an edit and
reverting it if it turns out wrong; a Sudoku solver placing a digit, trying
to continue, and reverting that placement if it leads to a dead end; a
maze-solving algorithm reversing out of a dead-end corridor to try a
different branch; dependency-resolver tools (package managers) trying one
version of a library, and backtracking to an earlier choice if a later
requirement turns out to be unsatisfiable with it.
```

### SE Lens

The design principle: `try-star-consumption`'s greedy-then-backtrack order — try the most repetitions first, then progressively fewer — is a deliberate strategy choice, not the only correct one. The alternative not chosen: try the *fewest* repetitions first (starting at `0`, counting up) instead of the most. Both orders are equally *correct* — either one, given enough attempts, eventually finds a working repetition count if one exists — but they are not equally *fast* on every input: greedy-first tends to succeed quickly on patterns like this lesson's own `a*b`, where the star is usually meant to consume as much as it reasonably can, while fewest-first would instead have to climb all the way up from `0` on exactly those same inputs. The real, honest cost of this choice: on a pattern where the star should *not* greedily consume everything, greedy-first pays for trying (and failing) every larger count before finally backtracking down to the one that actually works — real, wasted computation this lesson's next unit measures directly rather than leaving as an abstract warning.

### Commands Needed

`bb <path-to-file>.clj`, unchanged.

### Run It

```
star a*b vs [b] => true
star a*b vs [a b] => true
star a*b vs [a a a b] => true
star a*b vs [a a] => false
star a*b vs [] => false
star a*b vs [b b] => false
```

Run for real, this session, via `bb`. All six match this unit's own stated rule for `a*b`, and the third matches the execution trace above exactly.

### Connection

Backtracking works correctly here, and for this simple example, costs almost nothing extra — the greedy guess was right immediately. The final unit builds a case where the greedy guess is *never* right, forcing real, measurable backtracking work, and asks how expensive that work can actually get.

---

## Concept Unit: Practical Limitations — Measuring the Cost of Naive Backtracking

### The Problem

`try-star-consumption` only had to try one attempt count in the previous unit's own trace — the greedy maximum happened to work immediately. What happens when a pattern makes that guess *always wrong*, forcing the matcher to genuinely explore many attempt counts before concluding there is no match at all — and worse, when more than one star in the same pattern can each independently need this kind of exploration? Is that cost small and forgettable, or something a real system would need to actually worry about?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, using this lesson's own `matches-pattern?` from the two Concept Units above completely unmodified.
- **Files affected**: None.
- **Change type**: N/A — this unit adds new code but changes nothing about the matcher itself.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Depends on `matches-pattern?` from the units above, unchanged.

### The New Code

```clojure
(defn make-all-a [n]
  (if (= n 0)
    []
    (assoc (make-all-a (- n 1)) (- n 1) "a")))

(defn elapsed-ms-running [pattern input start-nanos]
  (matches-pattern? pattern input)
  (/ (- (System/nanoTime) start-nanos) 1000000.0))
```

### The Updated Project

Skipped — two freestanding new functions, nothing surrounding them yet.

### Naming the Concept

`make-all-a` builds a vector of `n` copies of the string `"a"` — a growing accumulator built with `assoc`, already explained in the Header, exactly the append-by-`assoc` technique established since Lesson 94, applied here to generate deliberately worst-case test input rather than to build a heap. `elapsed-ms-running` measures **wall-clock time**: it calls `System/nanoTime`, already explained in the Header, once just before it was invoked (captured as its own `start-nanos` argument at the call site, guaranteed to be evaluated before the function body runs) and once again after `matches-pattern?` has actually finished running inside the function body, then reports the difference converted from nanoseconds to milliseconds.

Against a pattern of three adjacent, redundant stars over the same symbol, followed by a literal that the input never actually contains — `[["star" "a"] ["star" "a"] ["star" "a"] ["lit" "b"]]` matched against a run of nothing but `"a"`s — every possible way of splitting the run of `a`s across the three stars has to be tried and rejected before the matcher can honestly report failure, because no split ever produces the required trailing `"b"`. Measured for real, this session, against growing input sizes:

```
n=30  elapsed-ms => 2.4385
n=60  elapsed-ms => 14.9693
n=90  elapsed-ms => 48.5545
n=120 elapsed-ms => 111.9551
```

Doubling the input length from `30` to `60` did not double the time — it roughly *sextupled* it, from about `2.4` ms to about `15.0` ms. Doubling again, from `60` to `120`, again far more than doubled it, to roughly `112` ms — a total of about `46`× slower than the `30`-length case for an input only `4`× longer. This is not a rounding artifact or measurement noise dressed up as a trend — a second, independent run at smaller input sizes (`5`, `10`, `15`, `20`, `25`, `30`) showed the identical shape, growing distinctly faster than input length itself the whole way. This is real, measured, honest evidence of **naive backtracking**'s actual cost: three redundant stars, each individually cheap, combine to force the matcher to re-explore an amount of overlapping work that grows much faster than the input does — the concrete, run-verified version of the "catastrophic backtracking" real regular-expression engines are well known to suffer from on certain pattern shapes.

### Mechanical Walkthrough

New elements not already covered above:

- **`n`** (in `make-all-a`) — a parameter for how many `"a"` symbols to generate.
- **`(if (= n 0) [] ...)`** — the base case: zero symbols requested returns an empty vector directly, `[]`, a literal already familiar from every prior lesson's use of empty vectors.
- **`(assoc (make-all-a (- n 1)) (- n 1) "a")`** — the recursive case: first, recursively build a vector of `n - 1` copies of `"a"` (via `-`, already explained in the Header); then `assoc` that smaller vector at position `(- n 1)` — exactly its own last valid index once one more element is added — with the string `"a"`, growing it by one.
- **`start-nanos`** (in `elapsed-ms-running`) — a parameter, not a `let`-bound local: the caller supplies `(System/nanoTime)` directly as this argument, which Clojure evaluates *before* calling `elapsed-ms-running` at all — meaning the "start" reading genuinely happens before anything inside the function body runs.
- **`(matches-pattern? pattern input)`** (the function body's first expression) — this lesson's own matcher from the two units above, called purely for the work it does; its own true/false result is not used here at all, only the time spent computing it. A function body that contains more than one expression runs each one in order and returns only the value of the last — ordinary function-body sequencing, the same basic fact about what a function's body is that already applies to every multi-step procedure described in plain language, restated here explicitly because this is the first time this curriculum's own code has relied on it directly.
- **`(/ (- (System/nanoTime) start-nanos) 1000000.0)`** (the function body's second, final expression, and its return value) — a fresh call to `System/nanoTime`, taken only now, after the matching work above has actually finished; `-` computes the raw elapsed nanoseconds; `/` divides by `1000000.0` to convert to milliseconds, a more readable unit for a span this short.

### CS Lens

**Naive backtracking** and its real performance cost are a hard concept, and this unit's own measured numbers are the strongest form of evidence this curriculum uses anywhere for a claim like this.

```
Also recognized in: a real regular-expression engine hanging on a
maliciously (or accidentally) crafted input containing nested or adjacent
repetition operators — a well-documented, real denial-of-service category
in production software, usually called ReDoS; a naive recursive Fibonacci
implementation re-computing the same overlapping subproblem exponentially
many times, the exact failure Lesson 38's own memoization exists to fix;
a chess engine re-analyzing an identical board position reached by two
different move orders, without any memory of having already evaluated it.
```

### SE Lens

The design principle: measure a real, suspected performance problem before either dismissing it or over-engineering around it — the same discipline this curriculum's own Lesson 242 already applied to floating-point error and Lesson 249 applied to gradient-descent divergence. The alternative not chosen here: leave "backtracking might be slow in some cases" as an unverified warning in prose, the way many informal explanations of regular expressions do, without ever actually running anything. The real tradeoff the measured numbers above expose honestly: this lesson's own matcher is correct on every input tested across all three units, and simple to read and reason about — and it is also demonstrably, measurably capable of costing far more time than its own input size would suggest, on patterns containing redundant ambiguity like adjacent stars over the same symbol. A production-grade regular-expression engine avoids exactly this cost with substantially more sophisticated techniques (compiling to an actual finite automaton first, the same connection Lesson 255 and this lesson's own first unit already named, sidesteps backtracking's cost entirely) — real, additional engineering this lesson does not attempt to build, the same honest scope-limiting already applied throughout this section.

### Commands Needed

`bb <path-to-file>.clj`, unchanged. No new tooling — `System/nanoTime` needs nothing beyond what `bb` already provides, since it runs on the JVM.

### Run It

```
n=30  elapsed-ms => 2.4385
n=60  elapsed-ms => 14.9693
n=90  elapsed-ms => 48.5545
n=120 elapsed-ms => 111.9551
```

Run for real, this session, via `bb`. Exact millisecond values will vary run to run and machine to machine — real wall-clock timing always carries some noise — but the *shape* of the growth (each roughly tripling input length producing far more than a tripled cost) reproduces reliably; a second, independent measurement at smaller input sizes (`5` through `30`) during this same session showed the identical growing-faster-than-linear pattern.

### Connection

This unit closes the lesson by turning a claim this lesson could easily have only asserted — "naive backtracking can be slow" — into something actually measured, on this lesson's own real, working code. Lesson 257 moves to a genuinely different formal model, context-free grammars, needed the moment a language requires more structure than any regular expression or finite automaton — Kleene star and concatenation alone — can express at all.

---

## Connect the Pieces

Follow one pattern element's own journey from data to a real timing measurement. `[["star" "a"] ["star" "a"] ["star" "a"] ["lit" "b"]]` begins as a plain, inert vector — four tagged elements, three `"star"` and one `"lit"`, built the same vector-as-pair way as every transition triple in Lessons 254 and 255. `elapsed-ms-running` hands this pattern, together with `make-all-a`'s freshly generated run of `n` `"a"`s, to `matches-pattern?`, which immediately calls `match-at` at position `0`. `match-at` reads the first element's own tag, `"star"`, and hands off to `count-repeats-possible`, which walks forward counting consecutive `"a"`s — a number that, for this deliberately worst-case input, is always the *entire* remaining input, since it is nothing but `"a"`s. `try-star-consumption` then tries that maximum count, calls back into `match-at` for the *second* star with whatever remains, which repeats the identical process, and again for the *third* star — and only once all three stars have committed to some three-way split of the input does `match-at` finally check the trailing `"lit" "b"` element, which the input never contains, forcing failure and a backtrack all the way back through every star's own choice, one attempt count at a time. `elapsed-ms-running` wraps this entire multi-level search in two `System/nanoTime` readings, and the real, measured gap between them — growing far faster than `n` itself, as this lesson's own numbers showed — is the concrete, run-verified cost of exactly that repeated, overlapping exploration.

## What Breaks Without This

Reduce the backtracking pattern from three adjacent stars to just one, keeping everything else — the same `make-all-a` input generator, the same `elapsed-ms-running` timer — completely unchanged:

```clojure
(println "single star, n=120 elapsed-ms =>"
  (elapsed-ms-running [["star" "a"] ["lit" "b"]] (make-all-a 120) (System/nanoTime)))
```

Run this for real, this session, via `bb`:

```
single star, n=120 elapsed-ms => 0.0569
```

`0.057` milliseconds — nearly two thousand times faster than the three-star pattern's own `112` ms measurement on the identical input length, `n=120`, from this lesson's third unit above. Nothing about `match-at`, `try-star-consumption`, or `count-repeats-possible` changed at all between these two measurements; only the *pattern data* did — one star instead of three. This is the concrete lesson this comparison teaches: the expensive part was never the matching *algorithm* misbehaving — the exact same, unmodified code ran both cases — it was specifically the *redundant ambiguity* of having more than one star independently free to claim the same input symbols. Removing that redundancy, without touching a single line of the matcher itself, removes essentially the entire cost.

## Exercises

1. Trace `(matches-pattern? [["star" "a"] ["lit" "a"]] ["a" "a" "a"])` by hand — note that the greedy maximum attempt for the star will initially consume *all three* `a`s, leaving nothing for the required trailing literal `"a"`, forcing at least one real backtrack. Predict the final result before running it via `bb`, then confirm.
2. Modify `count-repeats-possible` so it also works correctly when the symbol it is counting appears zero times at the very start of the input (verify this already works, by inspection and by a real test case, before assuming it needs a fix).
3. Build a four-star version of this lesson's own worst-case pattern (`[["star" "a"] ["star" "a"] ["star" "a"] ["star" "a"] ["lit" "b"]]`) and measure it via `elapsed-ms-running` at `n=60` and `n=90`. Compare the growth against the three-star pattern's own measurements at the same input sizes from this lesson's third unit.
4. In writing, explain why changing `try-star-consumption` to try the *smallest* attempt count first instead of the greedy maximum would not, by itself, fix the three-star pattern's own measured slowdown — what about the pattern itself, not the search order, is the actual source of the cost.
5. Design a pattern using this lesson's own `"lit"` and `"star"` elements that matches every binary sequence with an even number of `1`s — the exact language Lesson 254's own parity automaton recognized. Confirm it against at least four inputs from that lesson's own examples.

## Definition of Done

- [ ] `matches-pattern?` run on at least four literal-only inputs via `bb`, all matching the "exact sequence, no leftovers" rule by direct inspection.
- [ ] `matches-pattern?` run on at least four star-containing inputs via `bb`, all matching the `a*b` rule by direct inspection, including at least one requiring real backtracking (verified by hand-tracing it first).
- [ ] `elapsed-ms-running` run on the three-star worst-case pattern across at least three growing input sizes via `bb`, showing real, measured, faster-than-linear growth.
- [ ] The three-star pattern deliberately reduced to a single star on the identical input size, the resulting dramatic real speedup measured and recorded.
- [ ] A git commit made, with a message explaining *why*: for example, "Add Lesson 256: implement regular-expression matching via real recursive backtracking, and measure — not just assert — the genuine performance cost redundant stars impose on a naive matcher."
