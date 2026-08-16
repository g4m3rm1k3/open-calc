# Lesson 110: Specifications Before Algorithms

**What you will build**: By the end of this lesson you'll turn an ambiguous natural-language problem — "find the largest number in a list" — into a precise, runnable precondition and postcondition, exactly the shape Lesson 109's `satisfies-search-spec?` already demonstrated, and use that specification to catch two different wrong answers *before* designing a correct algorithm at all.

**What you need to know first**: Lesson 109's specification-as-code idea and its "present" versus "absent" two-part shape; Lesson 84's `get`/`count`; Lesson 17's proof by cases.

**Terms introduced in this lesson**:

- **precondition** — a condition the input must satisfy for a specification to make any promise at all. *Why it matters*: Lesson 109's `bst-search` implicitly assumed `is-bst?` held; this lesson makes that kind of assumption explicit and checkable, before any output is even discussed.
- **postcondition** — a condition the output must satisfy, given a precondition-satisfying input, for an algorithm to be considered correct. *Why it matters*: Lesson 109's two-part specification (present-case, absent-case) was a postcondition; this lesson generalizes the pattern to a genuinely new problem.

**Objects and methods used**: None new. This lesson reuses `get`, `count`, and `>` (Lesson 84, Lesson 2), each already covered.

---

## Concept Unit: Preconditions — What "Valid Input" Actually Means

### The Problem

"Find the largest number in a list" sounds unambiguous. Does it stay unambiguous for *every* possible input — an empty list, a list of one element, a list with the same value repeated — or does the natural-language statement quietly assume something it never actually says?

### Introduce the concept in isolation

```clojure
(defn valid-input? [values]
  (> (count values) 0))
```

```
user=> (valid-input? [3 7 2 9 4])
true
user=> (valid-input? [])
false
```

"Find the largest" has no answer at all for an empty list — there's no number to return, and no natural-language phrasing fixes that; the problem itself only makes sense for a non-empty collection. `valid-input?` states this **precondition** directly, as a checkable function, rather than leaving it as an unstated assumption the way "find the largest number in a list" alone does.

### Discard the throwaway example

Not applicable — `valid-input?` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of the natural-language problem's own implicit assumption into a checkable condition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn valid-input? [values]
  (> (count values) 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(count values)`** — reappearing `count` (Lesson 84), applied here to check size rather than to index a search.
- **`(> ... 0)`** — reappearing comparison (Lesson 2): non-empty, precisely, rather than "has some values" left as an informal description.

### CS Lens

A precondition is Lesson 109's own correctness definition, narrowed to apply *before* output is even considered: `bst-search`'s own implicit precondition, `is-bst?`, was exactly this same kind of unstated assumption, made explicit and checkable back in Lesson 93 — this lesson applies the identical discipline to a brand-new problem.

### SE Lens

Stating `valid-input?` explicitly means "what happens on an empty list" is answered *once*, deliberately, rather than discovered as a crash or a wrong answer the first time a real caller happens to pass one in — exactly Lesson 16's own argument for naming an invariant rather than reasoning about it informally each time.

---

## Concept Unit: Postconditions — What "The Largest" Actually Requires

### The Problem

Given a valid, non-empty input, what precisely must be true of a *candidate answer* for it to count as "the largest"? Two separate claims are hiding inside that one English phrase — can both be stated and checked directly, the way Lesson 109's own two-part specification checked "present" and "absent" separately?

### Introduce the concept in isolation

```clojure
(defn is-member? [values result i]
  (if (>= i (count values))
    false
    (if (= (get values i) result)
      true
      (is-member? values result (+ i 1)))))

(defn all-at-most? [values result i]
  (if (>= i (count values))
    true
    (if (> (get values i) result)
      false
      (all-at-most? values result (+ i 1)))))

(defn is-largest? [values result]
  (and (is-member? values result 0) (all-at-most? values result 0)))
```

```
user=> (is-largest? [3 7 2 9 4] 9)
true
user=> (is-largest? [3 7 2 9 4] 7)
false
user=> (is-largest? [3 7 2 9 4] 100)
false
```

`is-largest?` requires *two* things, exactly like Lesson 109's own postcondition: `is-member?` (the candidate actually appears in the input) and `all-at-most?` (nothing in the input exceeds it). `9` satisfies both. `7` is a member but not the maximum (`9` exceeds it) — `false`. `100` satisfies `all-at-most?` trivially (nothing exceeds a number that was never there) but fails `is-member?` — the identical one-sided-specification trap Lesson 109's `incomplete-spec?` demonstrated, caught here by requiring both halves together.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `is-largest?` reuses Lesson 109's two-conjunct `and`-of-two-checks shape directly, applied to a genuinely different problem's postcondition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn is-largest? [values result]
  (and (is-member? values result 0) (all-at-most? values result 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`is-member?`** — first appearance: reappearing linear-scan shape (Lesson 24), returning `true` the moment a match is found, `false` only once the entire input is exhausted without one.
- **`all-at-most?`** — first appearance: the mirror scan, returning `false` the moment *any* element exceeds the candidate, `true` only once every element has been checked without exception.
- **`and`** — reappearing (Lesson 7): both conjuncts must hold; `100`'s own trace shows exactly why one alone is insufficient.

### CS Lens

`100` failing `is-largest?` despite satisfying `all-at-most?` is Lesson 109's `incomplete-spec?` bug, reproduced deliberately on a new problem — proof that the one-sided-specification trap isn't specific to searching a BST, it's a general risk any postcondition checking only "nothing bigger exists" without also checking "this is actually present" will fall into.

### SE Lens

Writing `is-largest?` *before* writing any function that claims to compute the largest value means every candidate answer — correct, wrong, or absurd — can be checked immediately, mechanically, without first trusting whatever produced it; this is the entire discipline this lesson's title names, made concrete.

### Connection to the previous unit

The previous unit stated what a valid *input* must satisfy; this unit states what a valid *output* must satisfy, relative to that input — together, the full specification this lesson's third unit puts to work.

---

## Concept Unit: Catching a Wrong Algorithm Before Trusting It

### The Problem

A specification that only ever checks *hypothetical* candidate answers, chosen by hand, is a limited kind of proof. Can it be pointed at a real candidate *algorithm* — including a wrong one — and catch the mistake automatically, before any correctness argument is attempted?

### Introduce the concept in isolation

```clojure
(defn buggy-find-largest [values]
  (get values 0))

(defn find-largest [values i best]
  (if (>= i (count values))
    best
    (if (> (get values i) best)
      (find-largest values (+ i 1) (get values i))
      (find-largest values (+ i 1) best))))

(defn find-largest-from [values]
  (find-largest values 1 (get values 0)))
```

```
user=> (is-largest? [3 7 2 9 4] (buggy-find-largest [3 7 2 9 4]))
false
user=> (is-largest? [3 7 2 9 4] (find-largest-from [3 7 2 9 4]))
true
```

`buggy-find-largest` — a plausible, easy mistake, always returning the *first* element — fails `is-largest?` immediately: `3` is a member, but `9` exceeds it, so `all-at-most?` reports `false`. No trace, no proof, no hand-inspection was needed to catch this; the specification built in this lesson's first two units caught it mechanically, on the first real candidate algorithm tested against it. `find-largest-from`, which actually compares every element, passes.

### Discard the throwaway example

Not applicable — every function here is real and reusable, and both checks are genuine, verified results.

### Project Change

- **Reference Source**: No reference counterpart — `find-largest`/`find-largest-from` are a direct, structurally recursive derivation (Lesson 20, Lesson 91's compute-once-pass-to-a-helper pattern) matching this lesson's own postcondition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn find-largest-from [values]
  (find-largest values 1 (get values 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get values 0)`** — `buggy-find-largest`'s entire (wrong) body: a plausible-looking one-liner, exactly the kind of mistake that reads as reasonable until checked against a real specification.
- **`(find-largest values 1 (get values 0))`** — reappearing compute-once-pass-to-a-helper shape (Lesson 91): the first element seeds `best`, and the scan starts from index `1`, never re-examining it.
- **`(if (> (get values i) best) (find-largest values (+ i 1) (get values i)) (find-largest values (+ i 1) best))`** — reappearing structural recursion (Lesson 20) with an accumulator (Lesson 34): `best` only ever updates to a value proven larger than every one already seen.

### CS Lens

This is Lesson 109's own definition of correctness, run as an actual procedure rather than only argued in prose: `is-largest?` is the specification; `buggy-find-largest` and `find-largest-from` are two candidate algorithms; checking each against the specification is precisely what "correct relative to a specification" means, made mechanical.

### SE Lens

Nothing about `is-largest?` needed to know *how* `find-largest-from` or `buggy-find-largest` worked internally — it only ever examined their output against the input, exactly Lesson 106's abstraction barrier applied to *testing* rather than to calling: a specification checks behavior, never implementation, which is precisely why it can catch a bug in code it never had to understand.

### Connection to the previous unit

The previous unit built a postcondition checkable against any candidate *answer*; this unit points that same postcondition at real candidate *algorithms*, catching a genuine mistake before any correctness proof was ever attempted — specification first, exactly this lesson's title.

---

## Connect the Pieces

The full specification, both algorithms, and the precondition, together:

```clojure
(println "Precondition holds?" (valid-input? [3 7 2 9 4]))
(println "buggy-find-largest passes spec?" (is-largest? [3 7 2 9 4] (buggy-find-largest [3 7 2 9 4])))
(println "find-largest-from passes spec?" (is-largest? [3 7 2 9 4] (find-largest-from [3 7 2 9 4])))
```

```
Precondition holds? true
buggy-find-largest passes spec? false
find-largest-from passes spec? true
```

A precondition, a two-part postcondition, and two candidate algorithms — the specification alone, built before either algorithm's correctness was argued, separates the wrong one from the right one automatically.

## What Breaks Without This

Suppose `find-largest` had been trusted purely because it "looked right" — a five-line function, a plausible accumulator pattern, no visible red flags — without ever being checked against `is-largest?` at all. `buggy-find-largest` is *equally* plausible-looking, five words shorter, and completely wrong for any input where the maximum isn't the first element. Without a specification to check candidates against, "looks right" and "is right" are indistinguishable until a wrong answer actually surfaces somewhere downstream — exactly the gap Lesson 109's `incomplete-spec?` demonstration warned about, now shown deciding between two real candidate algorithms rather than two hypothetical answers.

## Exercises

1. **Trace.** By hand, trace `(find-largest-from [4 4 4])` (all values tied), confirming `is-largest?` still reports `true` for its result.
2. **Predict.** Before checking, predict whether `(is-largest? [] 0)` — an empty input — returns `true` or `false`, and explain why this lesson's `valid-input?` precondition matters here specifically.
3. **Verify.** Write a *second* buggy candidate, `buggy-find-largest-2`, that returns the *last* element instead of the first, and confirm `is-largest?` also catches it on an input where the last element isn't the maximum.
4. **Break it, on purpose.** Write a one-sided version of `is-largest?` that checks only `all-at-most?`, and find a specific wrong candidate answer it incorrectly accepts.
5. **Generalize.** Write a full precondition-and-postcondition specification for "find the *smallest* number in a list," reusing this lesson's own shape.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between a precondition and a postcondition, and explain why checking a candidate algorithm against a specification doesn't require understanding how that algorithm works internally.

## Definition of Done

- [ ] You can state a precondition and a two-part postcondition for a problem, as runnable code.
- [ ] You can use a specification to catch a wrong candidate algorithm without tracing its internals.
- [ ] You can explain why a one-sided postcondition (checking only one of two conditions) is a real, catchable risk.
- [ ] You completed Exercise 3 and caught a second, different buggy candidate.
- [ ] You completed Exercise 5 and wrote a complete specification for a new problem.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Catch buggy-find-largest-2 (returns last element) via is-largest?; write full find-smallest specification"` — not just `"lesson 110 exercise"`.

---

**Next lesson:** Lesson 111, *Brute Force*, uses this lesson's specification-first discipline to build the simplest possible algorithm that's *guaranteed* correct against a stated postcondition — checking every possibility exhaustively — establishing a baseline every later, cleverer algorithm in this section will be measured against.
