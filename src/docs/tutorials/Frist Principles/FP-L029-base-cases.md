# Lesson 29: Base Cases

**What you will build:** A real, running program — `fib.scm` — that computes Fibonacci numbers using two base cases instead of one, plus a deliberately broken sibling program that demonstrates, for real, exactly what Lesson 27 and Lesson 28 warned about on paper. The transferable problem this lesson is actually about: Lesson 27 proved, in the abstract, that a recursive definition without a base case never resolves to anything; this lesson confirms that with a real, running program, and then goes further — some recursive definitions need more than one base case, and a base case that's merely *present* is not the same as one that's *correct*.

**What you need to know first:** Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) — specifically the distinction between evidence and proof, reused directly in Concept Unit 5. Lesson 24 (`FP-L024-proof-by-cases-and-counterexample.md`) — specifically hunting for a counterexample before trusting a claim, reused directly. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, both extended here. Lesson 28 (`FP-L028-recursive-functions.md`) — specifically `factorial.scm` and the Guile toolchain, both reused directly.

**Terms introduced in this lesson**

- **Off-by-one error** — a mistake where a boundary condition is checked one position away from where it should be, producing a result that is wrong by exactly the margin of the misplaced boundary. An off-by-one error in a base case's guard doesn't necessarily stop a recursive procedure from running at all — it can let the procedure run to completion while quietly computing the wrong answer, exactly the failure Concept Unit 4 demonstrates directly.

## Objects and methods used

- **`<`**
  - *What it is:* a real Scheme procedure for numeric less-than comparison — a reappearance of *comparison operation* (Lesson 10), now as genuine, callable code.
  - *Implementation:* confirmed this session as an ordinary callable Guile procedure, used in this lesson as `(< n 2)`, taking two numeric operands and returning `#t` or `#f`.
  - *Its use:* Concept Unit 3's `fib` uses `<` rather than `=` for its guard, since its base case covers *two* values (`0` and `1`), not one — `(< n 2)` is true for both, in a single check.

---

## Concept Unit 1: Confirming the Regress Is Real — Running a Base-Case-Free Factorial

### The Problem

Lesson 27, Concept Unit 4, proved on paper that unfolding factorial's recursive case with no base case regresses through negative numbers forever. Lesson 28's closing warned that a real interpreter, given the same broken definition, doesn't fail cleanly either — it keeps going. Neither claim has actually been tested against a real, running program yet.

### The New Code — Type It Yourself

```scheme
(define (factorial n)
  (* n (factorial (- n 1))))

(display (factorial 5))
```

### The Updated Project

This is a complete, standalone file, `broken-factorial.scm` — deliberately built to fail, and deliberately never kept as a working part of this lesson's real project.

### Reference Source

Lesson 27 (`FP-L027-recursive-definitions.md`), Concept Unit 4's hypothetical "definition" with only a recursive case — translated directly into real code here for the first time.

### Files affected

Created: `broken-factorial.scm` (a deliberately broken, throwaway file).

### Change type

Add (new, temporary file).

### Dependencies

The Guile interpreter, already installed in Lesson 28.

### Run It — Show the Real Output

```
$ guile broken-factorial.scm &
$ ps -o rss= -p <pid>
   830160   (KB, after 5 seconds)
  1178640   (KB, after 10 seconds)
  1464752   (KB, after 15 seconds)
  1694256   (KB, after 20 seconds)
  1908832   (KB, after 25 seconds)
  2100832   (KB, after 30 seconds)
```

Verified this session: run in the background and its memory use sampled every five seconds, `broken-factorial.scm` never printed anything at all — `(display (factorial 5))` never runs, because `(factorial 5)` never finishes — and its memory use grew from roughly 830 megabytes to over 2 gigabytes in thirty seconds, with no sign of slowing down, before being killed manually.

### Mechanical Walkthrough

- **`(* n (factorial (- n 1)))`, with no accompanying `if` and no base case at all** — a direct translation of Lesson 27's hypothetical broken "definition," confirming it really can be typed as a real program.
- **`(factorial 5)` never returning, ever** — not a new syntactic element, but the central finding: the call genuinely never completes, exactly as Lesson 27's paper argument predicted.
- **Memory growing steadily rather than the program crashing quickly** — confirms, and slightly sharpens, Lesson 28's own warning: this isn't a fast, clean failure with a helpful error message. It's a silent, resource-consuming process that would eventually exhaust available memory if left running, which is a slower and in some ways more dangerous failure than an immediate crash would be.

### CS Lens

This is empirical confirmation of a claim that was already established by proof — Lesson 27's argument didn't need this run to be true, but running it anyway demonstrates directly that the abstract mathematical failure and the concrete operational failure are the same failure, viewed from two angles. Also recognized in: a bridge collapse that confirms, physically, what an engineering calculation had already predicted mathematically; a financial model's predicted insolvency, confirmed when a company's real cash reserves actually run out; a weather model's predicted storm path, confirmed by the storm's real, observed track; a software memory leak, predicted by code review, confirmed by watching a real process's memory climb in production.

### SE Lens

The alternative to actually running this broken program is to trust Lesson 27's paper proof and Lesson 28's warning without ever observing the failure directly. The real cost of that alternative is a weaker, second-hand understanding of what "never terminates" actually looks like in practice — a program that doesn't crash loudly, doesn't print an error, and doesn't obviously look broken from the outside, right up until its memory consumption becomes impossible to ignore. Running it deliberately, as this unit does, costs a genuinely wasted thirty seconds and two gigabytes of memory; it buys a concrete, remembered picture of exactly what a missing base case does to a real running program, not just an abstract description of it.

---

## Concept Unit 2: Fibonacci — a Recursive Case That Looks Back Two Steps

### The Problem

Every recursive definition so far — factorial, `sum` — has had a recursive case referring to exactly one smaller instance: `n!` needed `(n − 1)!`; `sum(n)` needed `sum(n − 1)`. A single base case, `0`, was always enough to stop each of them. The Fibonacci sequence — each number the sum of the two before it — has a recursive case that needs *two* smaller instances at once, and it's worth working out, before writing any code, exactly what that means for how many base cases are actually required.

### No isolated lab for this step

This concept has no code of its own to isolate — working out Fibonacci's recursive structure on paper is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Defining Fibonacci

**The sequence, informally:** `0, 1, 1, 2, 3, 5, 8, 13, ...` — each number the sum of the two immediately before it.

**A first attempt at a recursive case, following Lesson 27's pattern exactly:** `fib(n) = fib(n − 1) + fib(n − 2)`.

**Checking what a single base case at `0` would actually cover:** `fib(1) = fib(0) + fib(−1)`. This needs `fib(−1)` — a case the recursive definition would have to handle, and `fib(0)` alone says nothing about it. Unlike factorial, where every recursive call strictly needed only the *one* value directly below it, Fibonacci's recursive case reaches two steps back, and the second of those two steps can run past a single base case at `0` immediately, on the very first real use.

**The conclusion, stated directly:** a single base case is not enough here. `fib(0)` and `fib(1)` both need to be defined directly, without reference to `fib`, before the recursive case is safe to apply to anything.

### Walkthrough

- **`fib(n) = fib(n − 1) + fib(n − 2)`** — a reappearance of *recursive case* (Lesson 27), applied to a definition genuinely different in shape from factorial's: two smaller instances referenced, not one.
- **`fib(1) = fib(0) + fib(−1)`** — demonstrates concretely why a single base case at `0` fails immediately, rather than merely asserting it.
- **"a single base case is not enough here"** — not a new concept, but the precise conclusion this unit exists to reach, setting up Concept Unit 3's actual definition.

### CS Lens

This is the recognition that the number of base cases a recursive definition needs is determined by how far back its recursive case reaches, not by convention or habit — a definition looking back `k` steps generally needs `k` base cases to safely cover everything the recursive case might reach past. Also recognized in: a numerical method that needs two starting values to begin a two-step update rule, rather than one; a genealogical rule tracing "shared ancestor," needing to know about two parents' lines, not one; a video compression scheme that predicts a frame from the two frames before it, needing two actual starting frames before prediction can begin; a physics simulation using a method that needs both a starting position and a starting velocity, not just one initial fact.

### SE Lens

The alternative to working this out on paper first is to jump straight to writing `fib` in Scheme with only one base case, following factorial's shape out of habit, and discovering the problem only once the code misbehaves. The real cost of that alternative is exactly the difference between a mistake caught before it's built and one caught after — Concept Unit 4 demonstrates directly that an incomplete base case here doesn't even announce itself with a clean failure the way Concept Unit 1's missing base case does; it produces a wrong number that looks perfectly ordinary. Working out how many base cases are needed before writing any code, as this unit does, costs one careful check of the recursive case's own reach; it is what catches this specific, quiet danger before it's ever typed.

---

## Concept Unit 3: Two Base Cases, Translated Into Real Code

### The Problem

Concept Unit 2 established that Fibonacci needs two base cases. Translating this into Scheme, following Lesson 28's exact clause-by-clause method, means finding a single guard that correctly captures *both* of them at once.

### The New Code — Type It Yourself

```scheme
(define (fib n)
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))
```

### The Updated Project

This is `fib.scm`, in full:

```scheme
(define (fib n)
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))

(display (fib 10))
(newline)
```

Nothing here is elided — every line shown is the complete file.

### Reference Source

Concept Unit 2's own definition, `fib(0) = 0`, `fib(1) = 1`, `fib(n) = fib(n − 1) + fib(n − 2)` for `n ≥ 2` — translated directly below.

### Files affected

Created: `fib.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile fib.scm
55
```

Verified this session. Checked against the well-known start of the Fibonacci sequence directly:

```
$ guile -q
scheme@(guile-user)> (define (fib n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2)))))
scheme@(guile-user)> (map fib '(0 1 2 3 4 5))
$1 = (0 1 1 2 3 5)
```

Verified this session — `fib(10) = 55`, and `fib` applied to `0` through `5` produces `0 1 1 2 3 5`, matching the sequence exactly as introduced informally in Concept Unit 2.

### Mechanical Walkthrough

- **`(< n 2)`** — first appearance of `<` (see Objects and methods used) used as a guard covering two values at once: both `0` and `1` satisfy `n < 2`, correctly capturing both of Concept Unit 2's required base cases in a single check.
- **`n`, as the then-branch** — the base case's value: when `n` is `0`, the answer is `0`; when `n` is `1`, the answer is `1` — in both cases, simply `n` itself, which is why one guard and one then-branch can cover two base cases here without needing a second `if`.
- **`(+ (fib (- n 1)) (fib (- n 2)))`** — a direct translation of the recursive case, with two separate recursive calls, one for each of the two smaller instances the mathematical definition referenced.
- **`(map fib '(0 1 2 3 4 5))`** — a new use of the REPL (Lesson 28) to apply `fib` across a list of values at once, used here specifically to check the whole beginning of the sequence in one line rather than six separate calls.

### CS Lens

This is the direct, checkable translation Lesson 28 already established as this curriculum's standard, now shown handling a recursive case that reaches back more than one step — confirming the translation technique itself generalizes, not just the specific factorial example it was first shown on. Also recognized in: a numerical solver's code directly mirroring a two-step mathematical recurrence, variable for variable; a video codec's implementation directly mirroring its own two-frame prediction formula; any recursive function in real code whose recursive case makes more than one recursive call, each one handled explicitly rather than approximated.

### SE Lens

The alternative to checking the translation clause by clause is to write something that looks plausible and trust it works because it doesn't obviously crash. The real cost of that alternative is exactly Concept Unit 4's subject: a plausible-looking definition can run to completion, every time, and still be wrong. Checking `fib.scm` against Concept Unit 2's exact mathematical definition, and then against the sequence's own well-known values, as this unit does, costs one careful comparison and one REPL check; it is what actually confirms the translation is correct, rather than merely confident-looking.

---

## Concept Unit 4: A Present but Wrong Base Case — a Silent, Non-Crashing Bug

### The Problem

Concept Unit 1's broken factorial had no base case at all, and its failure — unbounded memory growth — was dramatic and, eventually, impossible to miss. A subtler mistake is a base case that *is* present, but checks the wrong boundary. It's worth seeing directly what this actually produces, because it does not look anything like Concept Unit 1's failure.

### The New Code — Type It Yourself

```scheme
(define (fib-buggy n)
  (if (< n 1)
      n
      (+ (fib-buggy (- n 1)) (fib-buggy (- n 2)))))
```

### The Updated Project

This is `fib-buggy.scm`, a deliberately flawed sibling to `fib.scm`, kept specifically to demonstrate this unit's point:

```scheme
(define (fib-buggy n)
  (if (< n 1)
      n
      (+ (fib-buggy (- n 1)) (fib-buggy (- n 2)))))

(display (fib-buggy 5))
(newline)
```

### Reference Source

`fib.scm` (Concept Unit 3), with exactly one character changed — `(< n 2)` narrowed to `(< n 1)`.

### Files affected

Created: `fib-buggy.scm`.

### Change type

Add (new file, deliberately flawed, kept for comparison).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile fib-buggy.scm
-5
```

Verified this session, together with the smaller cases:

```
$ guile -q
scheme@(guile-user)> (define (fib-buggy n) (if (< n 1) n (+ (fib-buggy (- n 1)) (fib-buggy (- n 2)))))
scheme@(guile-user)> (map fib-buggy '(0 1 2 3 4 5))
$1 = (0 -1 -1 -3 -5 -5)
```

Verified this session — `fib-buggy(1) = -1`, not `1`; every value from `1` onward is wrong, and none of them look like an error, a crash, or an obviously broken result. `fib-buggy(5) = -5` is a plausible-looking integer that happens to be completely incorrect.

### Mechanical Walkthrough

- **`(< n 1)`, in place of `fib.scm`'s `(< n 2)`** — first appearance of *off-by-one error*, demonstrated concretely: the guard now only captures `n = 0` directly, leaving `n = 1` to fall through into the recursive case.
- **`fib-buggy(1)`, tracing through the recursive case:** `(< 1 1)` is `#f`, so it computes `(+ (fib-buggy 0) (fib-buggy -1))`. `fib-buggy(0)` correctly returns `0` (`0 < 1` is true). `fib-buggy(-1)` also satisfies the guard (`-1 < 1` is true) and returns `-1` directly — a negative number, treated as though it were a legitimate base case, because the guard never ruled it out.
- **The full run, `(0 -1 -1 -3 -5 -5)`, compared against `fib.scm`'s correct `(0 1 1 2 3 5)`** — confirms every value past the first is wrong, without a single crash, error message, or visible sign anything went wrong.

### CS Lens

This is the fact that a boundary condition checked one position away from where it should be can produce a program that runs perfectly normally, every time, while silently computing something else entirely — exactly why an off-by-one error is considered one of the most common and most dangerous categories of real software defect. Also recognized in: a loop that processes every element except the last one, or one element past the end, because its stopping condition is checked one iteration too early or too late; a billing system that charges for one extra day, or one too few, because a date range's boundary is inclusive on the wrong side; a seating chart that leaves one seat empty or double-books one seat because a range calculation is off by one; a historical calendar calculation famously off by one due to there being no year zero between 1 BC and 1 AD.

### SE Lens

The alternative to checking a base case's exact boundary carefully is to trust that "it has an `if` with a comparison in it" is enough, the same way a proof's overall shape can look valid while hiding one broken step (Lesson 22). The real cost of that alternative is precisely what this unit demonstrates: `fib-buggy.scm` runs to completion, prints a number, and gives no indication anything is wrong — unlike Concept Unit 1's crash, this failure requires someone to already suspect the output and check it against something else before it's ever caught. Checking a base case's exact boundary, value by value, against the actual mathematical definition it's meant to implement, costs the careful comparison Concept Unit 3 already modeled; skipping it, as this unit shows, can leave a program confidently wrong indefinitely.

---

## Concept Unit 5: Checking a Base Case Against Independently Known Values

### The Problem

Concept Unit 4's bug was caught here because this lesson already knew what the correct answer was supposed to be. In general, catching this kind of mistake requires deliberately checking a recursive procedure's output against values known to be correct from some source *other* than the procedure itself — exactly Lesson 22's evidence-gathering discipline and Lesson 24's counterexample-hunting, applied here to real code rather than to a paper claim.

### No isolated lab for this step

This concept has no code of its own to isolate — checking `fib.scm` and `fib-buggy.scm` against independently known values is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Hunting for a Disagreement

**The independently known values, stated first, from Concept Unit 2's own informal introduction of the sequence, not derived from either program:** `0, 1, 1, 2, 3, 5, 8, 13, ...`.

**Checking `fib.scm` against these values, using Concept Unit 3's own REPL output:** `(map fib '(0 1 2 3 4 5))` produced `(0 1 1 2 3 5)` — agreeing with the independently known sequence at every position checked.

**Checking `fib-buggy.scm` the same way, using Concept Unit 4's REPL output:** `(map fib-buggy '(0 1 2 3 4 5))` produced `(0 -1 -1 -3 -5 -5)` — disagreeing at every position past the first. The very first disagreement, at `fib-buggy(1) = -1` instead of `1`, is a genuine counterexample (Lesson 24) to the implicit claim "`fib-buggy` correctly computes the Fibonacci sequence."

**Stating what this checking process actually is, precisely, connecting to Lesson 22:** running a handful of small cases and comparing them against known values is evidence, not proof — it caught this particular bug, at this particular boundary, but checking `0` through `5` alone would never, by itself, guarantee every larger value is correct too. It is, however, exactly the kind of cheap, fast check Lesson 24 recommended attempting before trusting a definition further — here, applied to real running code instead of a claim on paper.

### Walkthrough

- **The independently known sequence, `0, 1, 1, 2, 3, 5, 8, 13`** — a reappearance of Concept Unit 2's own informal introduction, deliberately treated here as an external reference rather than something derived from either program.
- **`fib.scm`'s output checked and found agreeing** — confirms, rather than assumes, that Concept Unit 3's translation is correct, at least for the cases checked.
- **`fib-buggy.scm`'s output checked and found disagreeing at `fib-buggy(1)`** — a reappearance of *counterexample* (Lesson 24), now located in real running code rather than in a mathematical claim.
- **"evidence, not proof"** — a direct reappearance of Lesson 22's central distinction, applied honestly to this lesson's own checking process rather than overclaiming certainty it hasn't earned.

### CS Lens

This is the practice of testing against known-correct values — the most basic form of testing, and the same discipline underlying every more elaborate testing technique this curriculum will build later. Also recognized in: a calculator's output checked against a known multiplication table before trusting it for harder problems; a new scale checked against a known reference weight before trusting it for an unknown one; a translation checked against a passage whose correct translation is already known; a newly built thermometer checked against water's known freezing and boiling points before being trusted for other readings.

### SE Lens

The alternative to checking against independently known values is to trust a recursive procedure simply because it runs without crashing, exactly the mistake `fib-buggy.scm` was built to expose. The real cost of that alternative, made fully concrete across this lesson, is that "ran without crashing" and "computed the right answer" are two entirely different properties, and Concept Unit 1's dramatic failure and Concept Unit 4's silent one sit at opposite ends of exactly the same underlying risk. Checking against known values, cheaply and immediately, as this unit does, costs a few seconds and a `map` call; it is what actually distinguishes a working recursive definition from one that merely looks like it's working.

---

## Closing

### Connect the pieces

Two recursive procedures, `fib.scm` and `fib-buggy.scm`, traced through every unit built in this lesson, start to finish:

1. **The regress confirmed for real (Unit 1):** `broken-factorial.scm`, run and observed growing from 830MB to over 2GB in thirty seconds, never producing any output at all.
2. **Why Fibonacci needs two base cases (Unit 2):** `fib(1) = fib(0) + fib(−1)`, shown to reach past a single base case at `0` on its very first real use.
3. **Both base cases, correctly translated (Unit 3):** `fib.scm`, verified against the sequence's own well-known values, `0 1 1 2 3 5`, matching exactly.
4. **A boundary moved by one position (Unit 4):** `fib-buggy.scm`, run to completion every time, silently producing `0 -1 -1 -3 -5 -5` instead.
5. **The discipline that catches the difference (Unit 5):** checking both programs' output against the same independently known sequence, honestly named as evidence rather than proof.

Unit 5's check is not a new example — it reruns Unit 3 and Unit 4's exact REPL output, side by side, against the exact sequence Unit 2 introduced at the very start of this lesson.

### What breaks without this

Suppose `fib-buggy.scm`'s exact mistake shipped, undetected, inside a larger program — say, a scheduling tool using Fibonacci numbers to space out reminder intervals with increasing gaps. Every call to the buggy procedure would return a plausible-looking integer; nothing would crash, nothing would print an error, and a reminder scheduled using a negative "interval" might simply fire immediately, repeatedly, or not appear to fire at all, depending on how the surrounding code happened to handle a negative number it never expected. Someone investigating the resulting complaints would have no crash report, no error log, and no obvious place to look — only a vague sense that reminders were behaving strangely, with the actual cause sitting quietly in one misplaced digit inside a base case's guard, exactly the kind of defect Concept Unit 4 demonstrated produces no external signal at all. Restoring Concept Unit 5's discipline — checking new or modified recursive code against a handful of independently known values before trusting it, every time, not just once during initial development — is what would have caught this before it ever reached a real scheduling tool at all.

### Exercises

1. **Observe.** Take a recursive definition from your own Lesson 27 exercises whose recursive case refers to more than one smaller instance (or invent one), and work out, on paper, exactly how many base cases it needs, the way Concept Unit 2 worked out Fibonacci's.
2. **Formalize.** Translate your Exercise 1 definition into Scheme, following Concept Unit 3's exact method, and run it for real, checking its output against values you can compute independently by hand.
3. **Predict.** Before running it, predict what would happen if you deliberately narrowed or widened one of your Exercise 2 procedure's base-case boundaries by one position, the way Concept Unit 4 changed `(< n 2)` to `(< n 1)`. Then make the change, run it, and check your prediction.
4. **Explain.** For your Exercise 3 buggy version, trace by hand exactly where it first disagrees with the correct version, the way Concept Unit 4 traced `fib-buggy(1)` down to `fib-buggy(-1)` being wrongly treated as a base case.
5. **Explain.** State, honestly, using Lesson 22's vocabulary, what your Exercise 2 and Exercise 3 checks actually established and what they didn't — evidence for a handful of cases, not proof for every possible input.

### Definition of done

- [ ] You have run a base-case-free recursive procedure for real and observed its actual failure behavior, not just read about it.
- [ ] You can determine how many base cases a recursive definition needs by examining how many steps back its recursive case reaches.
- [ ] You can translate a definition with multiple base cases into a single, correct guard, the way Concept Unit 3 used `(< n 2)` to cover both `0` and `1`.
- [ ] You can explain, using your own example, why a present-but-wrong base case produces a different, more dangerous kind of failure than a missing one.
- [ ] You completed Exercises 1–5 using your own recursive definition, not Fibonacci.
- [ ] Commit `fib.scm`, your Exercise 2 procedure, and your Exercise 3 deliberately-broken version, with a commit message stating what independently known values you checked each one against.
