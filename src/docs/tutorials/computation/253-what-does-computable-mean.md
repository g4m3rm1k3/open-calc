# Lesson 253: What Does "Computable" Mean?

**What you will build** — Three small, real Clojure functions — `sum-upto`, `find-least`, and `find-least-bounded` — that together make one abstract question concrete: given a well-defined mathematical description of a function, is there always a mechanical procedure that actually computes it? You will run a function that always finishes, then run one that provably does not (and watch it crash for real, on purpose), then build the practical compromise real systems use when they cannot know in advance which case they are in. The transferable problem this lesson is actually about: "well-defined" and "computable" are not the same property, and the gap between them — not any single algorithm — is the subject of everything Section XII builds from here.

**What you need to know first** — Lesson 4's definition of a function as an input/output transformation; Lesson 20's recursive functions, where a function is defined partly by calling itself; Lesson 22's base-case-and-progress argument for why a recursive function terminates at all; Lesson 7's boolean predicates (`true`/`false`-returning functions); ordinary arithmetic (`+`, `-`, `=`, `<`) and `if`, used since Section I. From this curriculum's own build history: the two-slot `[a b]` vector-as-pair convention (Lessons 85, 87, 88), and a real, uncaught `StackOverflowError` from unbounded recursion, first produced honestly by this curriculum in Lesson 248 (`riemann-sum`, which converged cleanly at `n=1000` and crashed for real at `n=2000`). Nothing from Section XI (points, vectors, matrices, derivatives) is needed — this section is a genuine, complete topic break.

**Terms used in this lesson**

- **computable function** — a function for which some effective procedure exists that produces the correct output, for every input in its stated domain, after finitely many steps. This is the term the rest of Section XII exists to make precise; without it, "algorithm" has no actual boundary, and "can this be programmed" has no honest answer beyond "let's try and see."
- **effective procedure** — a finite, completely unambiguous, mechanically followable sequence of steps: no step requires creativity, guessing, or an infinite amount of information to carry out, and a sufficiently literal-minded machine (or person with unlimited paper and patience) could execute it exactly as written. This is what separates "I can describe a solution in English" from "I can actually hand someone (or something) a procedure that carries it out."
- **halt** — a running computation reaching a definite stopping point after finitely many steps and producing an actual result, as opposed to continuing to take steps forever. "Halts" is a yes/no fact about one specific run, not a probability or an estimate.
- **total function** — a function that halts and produces a correct answer for *every* input in its declared domain, with no exceptions. Totality is a guarantee, not a description of typical behavior.
- **partial function** — a function that is only guaranteed to halt for *some* inputs in its declared domain; for the rest, no procedure implementing it is known to terminate, or it is provably impossible for one to. Most of mathematics assumes every function is "just defined" everywhere its formula makes sense; computability theory is the discovery that this assumption fails once "compute it" is taken literally.
- **unbounded search (minimization)** — a search procedure that tries candidate values one at a time, in order, with no upper limit fixed in advance, stopping only when a candidate satisfies some condition. It is the single most common way an otherwise well-defined mathematical description turns out to name a partial, not total, function: the search might have to try every candidate forever.
- **base case** — the specific input(s) for which a recursive function returns a value directly, without making a further recursive call. Reappearing from Lesson 22: a recursive function terminates only if every recursive call is guaranteed to eventually reach one.
- **recursion** — a function whose definition includes calling itself, on a version of the problem that has made measurable progress toward a base case. Reappearing from Lesson 20.
- **fuel-limited (budget-bounded) computation** — a computation given an explicit, finite resource limit as an ordinary parameter — here, a maximum number of search steps — after which it is required to stop and report that it did not find an answer, rather than continuing indefinitely. The word "fuel" is standard informal terminology for this pattern: the computation runs until it runs out.
- **sentinel value** — a specially tagged result used to represent "there is no real answer here" or "this outcome is different in kind from an ordinary result," rather than smuggling that information into a value that could also be mistaken for real data. This lesson's sentinel is a plain string ("found" or "exhausted") paired with a number in a two-slot vector, distinguishing "I found it" from "I ran out of budget looking."
- **semi-decidable** — describes a yes/no question where a "yes" answer can always eventually be confirmed by running some procedure long enough, but a "no" answer can never be fully confirmed this way — only suspected, after a search that has gone on for a long time without success. This lesson only names the idea informally, from a concrete example; Section XII gives it a formal definition later.

**Objects and methods used**

- **`=`**
  - *What it is:* A Clojure function that tests whether its arguments are equal in value.
  - *Implementation:* Takes two or more arguments and returns the single boolean `true` if all of them are equal, `false` otherwise; ordinary numeric equality for the integers this lesson uses.
  - *Its use:* Every base-case check in this lesson (`(= n 0)`, `(= n 1000)`, `(= budget 0)`) is a call to `=`.
- **`+`** and **`-`**
  - *What it is:* Clojure functions for addition and subtraction, callable exactly like any other function (in prefix position, before their arguments), not built-in syntax the way `+`/`-` are in most other languages.
  - *Implementation:* Each takes any number of numeric arguments and returns their sum or running difference; `(- budget 1)` returns `budget` minus one.
  - *Its use:* `+` accumulates `sum-upto`'s running total and advances a search index by one candidate at a time; `-` counts a search's remaining budget down toward zero.
- **`<`**
  - *What it is:* A Clojure function for numeric less-than comparison.
  - *Implementation:* Takes two or more numbers and returns `true` only if each is strictly less than the next.
  - *Its use:* `never-satisfied?`'s `(< n 0)` defines a predicate that a naturally-growing, non-negative search index can never make true — the deliberate engine behind this lesson's real crash.
- **`println`**
  - *What it is:* A Clojure function that prints its arguments to standard output, converted to their human-readable string form, separated by spaces, followed by a newline.
  - *Implementation:* Accepts any number of arguments of any type; returns `nil`; its effect (printed text) happens as a side effect, not through its return value.
  - *Its use:* Every "Run It" section below shows what `println` actually printed when `bb` executed this lesson's code.
- **`java.lang.StackOverflowError`**
  - *What it is:* A real class in the Java standard library (Clojure and `bb` both run on the JVM), representing a specific kind of unrecoverable runtime error.
  - *Implementation:* A subclass of `java.lang.VirtualMachineError`, itself a subclass of `java.lang.Error` — meaning the JVM itself judged the situation unrecoverable, not this lesson's own code raising an ordinary exception on purpose. It carries no data beyond an ordinary error message; it exists purely as a signal.
  - *Its use:* The JVM throws this, on its own, the moment a thread's call stack — a fixed, finite block of memory reserved for tracking in-progress function calls — has no room left for one more frame. Concept Unit 2 triggers this for real and shows the JVM's own report of it, not a description of what "should" happen.

---

## Concept Unit: Computable Functions and Effective Procedures

### The Problem

Sections I through XI of this curriculum have written hundreds of real functions — sorting, searching, graph traversal, Gaussian elimination, gradient descent, physical simulation. Every one of them shared a property this curriculum never stopped to name: given valid input, each one was guaranteed to actually finish and hand back an answer, in a finite, predictable number of steps. That guarantee feels automatic. It is not. A mathematical description can specify a function completely — "the smallest number satisfying property P" is a perfectly precise definition — without there being any procedure that is guaranteed to find it in finite time. Before this curriculum can talk about the *limits* of computation (automata, Turing machines, the halting problem — Section XII's whole reason for existing), it needs a precise, checkable meaning for "computable" in the first place. What exactly has to be true of a procedure for the claim "this function is computable" to be justified, rather than just assumed?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII opens a genuinely new topic (formal computability) with no prior implementation in this curriculum to port from.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sum-upto [n]
  (if (= n 0)
    0
    (+ n (sum-upto (- n 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet; this is a freestanding new function with nothing surrounding it.

### Naming the Concept

This is not a throwaway lab followed by separate "real" code — since roughly Lesson 130, this curriculum's algorithm-derivation lessons have used the function shown above directly as the real, verified artifact, with no separate persistent project file to insert it into. What it proves: run it on several different inputs and every single run halts, immediately, with a correct answer — never a hang, never an approximation, never a "still working."

```
sum-upto 0 => 0
sum-upto 5 => 15
sum-upto 100 => 5050
```

That is what it means, concretely, for `sum-upto` to be a **computable function**: there exists an **effective procedure** — the exact sequence of steps written above — that produces the correct output for every natural number input, in finitely many steps. Because that guarantee holds for *every* input in its domain (every natural number), `sum-upto` is specifically a **total function**. The guarantee is not a vague impression from testing three inputs; it follows from the same reasoning Lesson 22 already gave a name to — base case and progress. Every recursive call passes `(- n 1)`, a strictly smaller natural number than the one before it; natural numbers cannot decrease forever without hitting `0`; and `0` is exactly the input for which the function **halts** by its base case, with no further recursive call. That argument, not the three sample runs above, is what actually justifies calling `sum-upto` computable — the runs are evidence consistent with the argument, not a substitute for it.

The throwaway/real-project distinction from earlier sections of this curriculum does not apply here in the usual sense: there was nothing to discard, because there is no persistent project file this code is threading through. What is being discarded, in effect, is the temptation to treat "I ran it a few times and it returned answers" as the reason to trust `sum-upto` — the real reason is the base-case-and-progress argument above, and that argument is what the next two Concept Units are going to break.

### Mechanical Walkthrough

Every distinct syntactic element in `sum-upto`, in the order it appears:

- **`(defn sum-upto [n] ...)`** — `defn` is Clojure's construct for binding a name (`sum-upto`) to a function with a declared parameter list (`[n]`) and a body. It is not a value expression itself; it is a definition, evaluated once, that makes `sum-upto` callable by name from that point forward. This reappears from Lesson 4's original treatment of functions as named transformations, restated here in full per the Repetition Rule.
- **`n`** — the single parameter. Inside the function body, `n` is a name bound, for the duration of one call, to whatever value that call was invoked with; this is ordinary name binding, the same mechanism Lesson 3 introduced as "names, bindings, and environments" — a name that refers to a value, not a box that stores and can be reassigned.
- **`(if (= n 0) 0 (+ n (sum-upto (- n 1))))`** — `if` is Clojure's conditional special form: it evaluates its first argument (the test), and evaluates and returns *only* the second argument if the test is truthy, or *only* the third if it is not — never both branches. This is the mechanism, reappearing throughout this curriculum since Section I, that makes a base case and a recursive case mutually exclusive within a single call.
- **`(= n 0)`** — a call to `=`, described above in Objects and methods: it compares `n` to the literal `0` and returns the boolean `true` exactly when they are equal. This is the test that identifies the base case.
- **`0`** (the second branch) — a literal value, returned directly with no further computation, exactly when `n` is `0`. This is the base case itself: the one input for which `sum-upto` does not call itself.
- **`(+ n (sum-upto (- n 1)))`** (the third branch) — this is the recursive case, and it contains three separate elements worth tracing individually rather than reading as one lump:
  - **`(- n 1)`** — a call to `-`, computing one less than the current `n`. This is the "progress" half of Lesson 22's base-case-and-progress argument: every recursive call is invoked on a strictly smaller value than the call that made it.
  - **`(sum-upto (- n 1))`** — the recursive call itself: `sum-upto` calling itself, by name, on that smaller value. This is recursion, reappearing from Lesson 20: the function's own definition refers to itself, and that is legal and well-defined precisely because the argument keeps shrinking toward the base case rather than repeating or growing.
  - **`(+ n ...)`** — a call to `+`, adding the current call's own `n` to whatever the recursive call eventually returns. This is where the "unwinding" work happens — nothing is added until the recursive call underneath has itself finished and produced a real number.

**Execution trace** — `(sum-upto 5)`, showing the descent to the base case and the unwind back up, with the condition that drove each step:

```
Call n=5: (= 5 0) is false -> recurse into sum-upto(4)
Call n=4: (= 4 0) is false -> recurse into sum-upto(3)
Call n=3: (= 3 0) is false -> recurse into sum-upto(2)
Call n=2: (= 2 0) is false -> recurse into sum-upto(1)
Call n=1: (= 1 0) is false -> recurse into sum-upto(0)
Call n=0: (= 0 0) is true  -> base case, returns 0 directly
Unwind into n=1: 1 + 0  = 1
Unwind into n=2: 2 + 1  = 3
Unwind into n=3: 3 + 3  = 6
Unwind into n=4: 4 + 6  = 10
Unwind into n=5: 5 + 10 = 15
```

Six calls deep, then five additions unwinding back out — every one of the eleven steps is a direct consequence of the `if` test and the arithmetic shown above, not a coincidence of this particular input; the same shape happens for `(sum-upto 100)`, just a hundred calls deep instead of five, which is exactly why `sum-upto 100 => 5050` above required no separate explanation to trust.

### CS Lens

This unit's real subject is the pair of ideas **computable function** and **effective procedure** — a hard concept, in the Repetition Rule's sense: a formal, named idea from the foundations of computer science, not an isolated syntax fact.

```
Also recognized in: a factory assembly line with a fixed, finite sequence of
stations every unit passes through exactly once; a recipe followed literally,
step by step, with no ingredient substitutions left to judgment; a mechanical
adding machine's crank-turning procedure; a spreadsheet formula recalculated
the same way on every keystroke; a vending machine's fixed coin-return logic.
```

What unifies all of these: each is a *finite*, *fully specified*, *mechanically followable* procedure — no step requires creativity, no step requires information not already available, and each is guaranteed to reach a definite end. That is the entire content of "effective procedure," independent of whether the procedure runs on silicon, in a factory, or on paper.

### SE Lens

The design principle here is naming a property precisely instead of leaving "does this actually work" as an informal impression. Every recursive function this curriculum has written since Lesson 20 relied, implicitly, on Lesson 22's base-case-and-progress argument to justify that it terminates — but no lesson before this one stopped to name that guarantee as *totality*, or to ask what happens when the guarantee doesn't hold. The alternative not chosen here is the one almost every working programmer actually takes by default: write the recursive case, write a plausible-looking base case, run it on a few examples, and move on if the examples come back correct. The real tradeoff: naming and checking the termination argument explicitly costs real thinking time up front, every time; skipping it costs nothing when the function happens to be well-behaved, and costs a production incident — silently, unpredictably, on whichever input first breaks the unstated assumption — when it is not. Concept Unit 2 makes that unstated assumption fail on purpose, so the cost is visible here instead of in a system nobody is watching closely enough to catch it.

### Commands Needed

Run any of this lesson's code with `bb <path-to-file>.clj` — Babashka's own command-line invocation, already established since Section VI: `bb` starts a fast native Clojure runtime, loads the given file top to bottom, evaluates every top-level form in order, and exits. Success output is whatever the file's own `println` calls produced, in the order they ran, with no separate "success" message — the absence of an error report *is* the success signal.

### Run It

```
sum-upto 0 => 0
sum-upto 5 => 15
sum-upto 100 => 5050
```

Run for real, this session, via `bb`. All three match the hand-derived values above exactly.

### Connection

`sum-upto` is this lesson's baseline: a function that is unambiguously computable, with a termination argument that actually holds. The next unit asks what happens the moment that argument's key ingredient — guaranteed progress toward a base case — is no longer available by construction, only by luck.

---

## Concept Unit: Partial Functions and Unbounded Search

### The Problem

Not every function this curriculum could plausibly want to define has the shape `sum-upto` has, where the recursive argument obviously shrinks toward a base case every single call. Consider a different, extremely common shape: "the smallest number that satisfies some condition." Nothing about that description guarantees termination the way `sum-upto`'s did — it depends entirely on whether such a number actually exists. Is a function defined this way still computable, in the same sense `sum-upto` is? And if it sometimes is and sometimes is not, depending on facts about the *condition* rather than facts about the *procedure* — what does that do to the guarantee this lesson's first unit just established?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing the same fresh, dependency-free start as Concept Unit 1.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn four? [n] (= n 4))
(defn thousand? [n] (= n 1000))
(defn never-satisfied? [n] (< n 0))

(defn find-least [candidate-satisfies? n]
  (if (candidate-satisfies? n)
    n
    (find-least candidate-satisfies? (+ n 1))))
```

### The Updated Project

Skipped — `find-least` and its three predicate functions are freestanding, with nothing surrounding them yet.

### Naming the Concept

Per the established Section VI+ convention, this code is both the isolated demonstration and the real, reusable artifact — there is no separate throwaway version. `find-least` takes a predicate function (any function returning `true` or `false`) and a starting number, and searches upward, one candidate at a time, until it finds a number the predicate accepts. This is called **unbounded search**, or **minimization** in computability theory — "unbounded" because nothing in `find-least`'s own code places any limit on how far it is willing to search.

Run against `four?`, starting from `0`:

```
find-least four? from 0 => 4
find-least four? from 4 => 4
find-least thousand? from 0 => 1000
```

The first two calls prove `find-least` genuinely searches — starting at `0` takes four real recursive steps to reach `4`, while starting already at `4` returns immediately with zero additional steps, because `four?` is satisfied on the very first candidate it's given. The third result is the important one: `find-least thousand? 0` takes a thousand and one recursive calls, not four, and still returns a definite, correct answer — `1000` — with no crash, no timeout, nothing distinguishing it from the fast case except how long the JVM spent computing it. **A search taking a long time is not the same fact as a search never finishing** — that distinction is the entire point of this unit, and it is easy to blur the two informally without ever running a case where the difference actually matters.

Now the case where the difference does matter. `never-satisfied?` checks `(< n 0)` — is the candidate less than zero. `find-least` always starts its search at a number and only ever increases it by `+1`; a search that starts at `0` and only grows can never produce a value less than `0`. There is no number `find-least never-satisfied? 0` will ever find, because none exists that satisfies the condition, given how the search itself is built. Running it anyway — for real, this session, via `bb` — produces this, exactly as printed by `bb`'s own error reporter, not summarized or paraphrased:

```
before call
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
Location: ...253-crash.clj:6:5

----- Context ------------------------------------------------------------------
2:
3: (defn find-least [candidate-satisfies? n]
4:   (if (candidate-satisfies? n)
5:     n
6:     (find-least candidate-satisfies? (+ n 1))))
       ^---

----- Stack trace --------------------------------------------------------------
clojure.core/ex-info - <built-in>
user/find-least      - ...253-crash.clj:6:5
user/find-least      - ...253-crash.clj:3:1
user                 - ...253-crash.clj:9:10
```

`"before call"` printed. `"after call"` — the next line in the file that ran this — never printed at all. The program did not return an error value; it did not return anything; the JVM itself terminated the attempt from underneath the running code, because the call stack — a real, finite block of memory reserved for tracking in-progress calls, reappearing from Lesson 248's own `riemann-sum` crash at `n=2000` — ran out of room for one more frame. `find-least` on `never-satisfied?` is exactly what computability theory calls a **partial function**: defined, in the ordinary mathematical sense (its formula makes sense for every input), but not computable at that input, because no procedure implementing it actually halts there. `find-least` overall — considered as one function across every predicate it might be given — is a partial function precisely because it is total on some predicates (`four?`, `thousand?`) and undefined-by-non-termination on others (`never-satisfied?`), and nothing about `find-least`'s own code can tell in advance which case a given predicate falls into.

### Mechanical Walkthrough

New elements not already covered in Concept Unit 1's walkthrough:

- **`four?`, `thousand?`, `never-satisfied?`** — three ordinary named functions (via `defn`, already explained above), each taking one number and returning a boolean via `=` or `<`. They exist purely to give `find-least` different conditions to search for; nothing about their own definitions is new syntactically, but their *role* here is new: each is a predicate function passed as a value to another function, not called directly by name at the top level.
- **`candidate-satisfies?`** — `find-least`'s first parameter. Its value, for any given call, is *itself a function* — `four?`, `thousand?`, or `never-satisfied?`, depending on how `find-least` was called. This is possible because Clojure functions are ordinary values, the same status `=`/`+`/`-` already have as described in the Header — they can be passed as arguments exactly like a number or a string.
- **`(candidate-satisfies? n)`** — calling whatever function `candidate-satisfies?` is currently bound to, with the current search candidate `n`. This is the same function-call mechanism used everywhere else in this lesson (`(= n 0)`, `(sum-upto ...)`), just applied to a parameter instead of a name written directly in the source.
- **`(find-least candidate-satisfies? (+ n 1))`** — the recursive case: `find-least` calls itself, passing the *same* predicate function forward unchanged, and `n + 1` as the next candidate. This is recursion, reappearing from Lesson 20 and from Concept Unit 1 above, with one structural difference from `sum-upto`: `n` here *increases* toward an unknown, possibly nonexistent target, rather than *decreasing* toward a known, always-present base case of `0`. That difference is exactly why Lesson 22's base-case-and-progress argument, which justified `sum-upto`'s termination outright, cannot justify `find-least`'s termination at all — there is no base case here in the structural sense Lesson 22 meant; there is only "stop searching if you happen to find one."

**Execution trace** — `(find-least four? 0)`:

```
Call n=0: (four? 0) -> (= 0 4) is false -> recurse to n=1
Call n=1: (four? 1) -> (= 1 4) is false -> recurse to n=2
Call n=2: (four? 2) -> (= 2 4) is false -> recurse to n=3
Call n=3: (four? 3) -> (= 3 4) is false -> recurse to n=4
Call n=4: (four? 4) -> (= 4 4) is true  -> returns 4
```

`(find-least thousand? 0)` follows the identical shape — the same `if`, the same `(candidate-satisfies? n)` test, the same `(+ n 1)` step — for `1001` calls instead of `5`, matching Lesson 99/100/134's own established honesty pattern for this curriculum: the mechanism shown fully above is exactly the mechanism running a thousand times over, not a different, unverified process at larger scale.

`(find-least never-satisfied? 0)` begins identically — `Call n=0: (never-satisfied? 0) -> (< 0 0) is false -> recurse to n=1`, `Call n=1: (< 1 0) is false -> recurse to n=2`, and so on — and never stops beginning identically, because `n` only ever grows from a starting point of `0`, and `(< n 0)` requires a negative value no growing-from-zero search can ever reach. The crash output above is not a different kind of event from these ordinary steps; it is what happens when this exact, unremarkable step repeats past the point the JVM has memory to keep tracking.

### CS Lens

**Partial function** and **unbounded search (minimization)** are hard concepts, and reappear directly into Section XII's later formal machinery (Turing machines, Lesson 259; the halting problem, Lesson 261).

```
Also recognized in: a locksmith trying keys on a full ring one at a time with
no guarantee the right one is on it; a web crawler searching for a broken
link with no known bound on how far to follow it; an automated theorem
prover trying longer and longer candidate proofs for an open conjecture; a
brute-force password cracker; a "SELECT ... WHERE" query with no index and
no LIMIT, scanning rows until one matches or the table runs out.
```

Every one of these shares the same shape: a search with no upper bound fixed in advance, whose termination depends entirely on a fact about the world (does a satisfying candidate exist, and how far away is it) that the search procedure itself has no way to know ahead of time.

### SE Lens

The design principle: recognizing, before writing a search, whether what you are about to build is structurally a partial function — and if so, designing around that fact rather than being surprised by it later. The alternative not chosen here is the one real code actually takes by default, constantly: write the unbounded search, because the input "should" satisfy it quickly, and move on. That is a completely reasonable choice when the assumption is actually safe — but `find-least`'s own code has no way to express or check that assumption; it just trusts it. The real tradeoff, made concrete by the crash above: the unbounded version is simpler to write and read, and it works flawlessly for `four?` and `thousand?`; the same code, given a predicate someone got subtly wrong (a typo'd comparison, an off-by-one that makes a condition permanently false), fails not with a clear error describing the mistake but with a JVM-level crash from a completely different layer of the system, far from where the actual mistake was made. This is the identical honest debt Lesson 248 already logged for `riemann-sum` at `n=2000` — not smoothed over there, and not smoothed over here either. The next unit is the standard engineering answer to exactly this tradeoff.

### Commands Needed

Same as Concept Unit 1: `bb <path-to-file>.clj`. No new tooling — the crash output above is `bb`'s own built-in error reporter, triggered automatically the moment the JVM throws, with no special flag or configuration needed to see it.

### Run It

```
find-least four? from 0 => 4
find-least four? from 4 => 4
find-least thousand? from 0 => 1000
```

...and, run separately this session, the real crash transcript shown above for `find-least never-satisfied? 0` — `"before call"` printed, then the genuine `StackOverflowError` report, then nothing further; `"after call"` never printed.

### Connection

Concept Unit 1 established that a procedure's termination has to be *argued*, not assumed from a few successful runs. This unit shows a real, common procedure shape — unbounded search — for which that argument can genuinely fail, depending on facts no amount of staring at the code alone reveals. The next unit builds the practical compromise: a version of this same search that can no longer crash unpredictably, at the cost of sometimes having to honestly admit it does not know the answer.

---

## Concept Unit: Bounded Search and the Limits of Knowing

### The Problem

`find-least` will crash, unpredictably and unrecoverably, given a predicate that happens to never be satisfied — and nothing in its own code can tell in advance whether a given predicate has that property, short of running the search and watching whether it stops. Real systems cannot afford to hand a caller a function that might simply vanish, mid-computation, with no result and no clean error. Is there a version of this same search that is guaranteed, structurally, to always return *something* — even when it cannot honestly say "yes, I found it"?

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition, continuing the same fresh start as the two units above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn find-least-bounded [candidate-satisfies? n budget]
  (if (candidate-satisfies? n)
    ["found" n]
    (if (= budget 0)
      ["exhausted" n]
      (find-least-bounded candidate-satisfies? (+ n 1) (- budget 1)))))
```

### The Updated Project

Skipped — `find-least-bounded` is a freestanding new function, with nothing surrounding it yet.

### Naming the Concept

Again, this code is both the isolated demonstration and the real artifact, per the same Section VI+ convention already used in the two units above. `find-least-bounded` takes the same predicate and starting candidate `find-least` did, plus one new parameter: `budget`, the maximum number of additional candidates it is allowed to try before it must give up. This is **fuel-limited (budget-bounded) computation** — a computation that is handed an explicit, finite resource up front and is structurally required to respect it, rather than running until something external (the JVM's own stack) forcibly stops it.

```
find-least-bounded thousand? from 0 budget 2000 => [found 1000]
find-least-bounded thousand? from 0 budget 10 => [exhausted 10]
find-least-bounded never-satisfied? from 0 budget 50 => [exhausted 50]
```

The first call has plenty of budget (`2000`, more than the `1000` steps actually needed) and returns `["found" 1000]` — the same correct answer `find-least thousand? 0` found in Concept Unit 2, just wrapped in a two-slot vector tagging *how* it was found. The second call has too little budget (`10`, far short of the `1000` steps needed) and returns `["exhausted" 10]` instead of crashing, wrongly claiming success, or hanging — it tried ten candidates, none worked, and it said so honestly. The third call is the case that crashed `find-least` outright in Concept Unit 2: `never-satisfied?`, which is never true for any candidate this search will ever try. Given a budget, `find-least-bounded` does not crash on it at all — it returns `["exhausted" 50]`, a completely ordinary value, exactly as if it had simply run out of budget on any other predicate.

That last result is the genuinely important one, and it deserves to be stated precisely rather than glossed over: `["exhausted" 50]` does **not** mean "no number satisfies `never-satisfied?`" — `find-least-bounded` has no way to know that, and does not claim to. It means, exactly and only, "no number among the first `51` candidates tried (`0` through `50`) satisfied it." A caller who ran the identical search again with `budget 5000` would get `["exhausted" 5000]` — a different, larger number, still not proof that no answer exists, just proof that a larger search also failed. This is what **semi-decidable** names, informally, for now: `find-least-bounded` can always eventually confirm a "yes" (`["found" n]`, for real, checkable `n`), but it can never fully confirm a "no" — only report "not within this particular budget," which is a strictly weaker claim than "never." Section XII names and proves this distinction formally, later, once finite automata (Lesson 254) and Turing machines (Lesson 259) give it a precise machine to talk about.

### Mechanical Walkthrough

Elements not already covered by the two units above:

- **`budget`** — `find-least-bounded`'s third parameter, an ordinary name binding (Lesson 3) for however many additional candidates the current call is still permitted to try.
- **`(if (candidate-satisfies? n) ["found" n] ...)`** — the outer `if`, structurally identical to `find-least`'s own `if`: if the current candidate satisfies the predicate, stop immediately and report success — the search-succeeds case is checked *before* the budget is ever consulted, so a search that would have succeeded on its very first try still succeeds even with `budget 0`.
- **`["found" n]`** — a vector literal holding exactly two elements: the plain string `"found"`, and the number `n` that satisfied the predicate. This is the vector-as-pair convention, reappearing from Lessons 85, 87, and 88: a two-slot structure built with nothing more than square brackets, requiring no new construct to hold two related values together. `"found"` here is a **sentinel value** — its job is not to be read as ordinary text but to mark, unambiguously, which of two structurally different outcomes this particular vector represents.
- **`(if (= budget 0) ["exhausted" n] ...)`** — the inner `if`, reached only once the predicate has already failed on the current candidate: it checks whether the budget has been fully spent, using the same `=` already explained in the Header.
- **`["exhausted" n]`** — the second sentinel-tagged result, returned when the budget has run out with no success. Structurally identical to `["found" n]` — same vector-as-pair shape, same string-plus-number layout — but the string distinguishes what kind of result the caller is actually holding.
- **`(find-least-bounded candidate-satisfies? (+ n 1) (- budget 1))`** — the recursive case, reached only when the predicate has failed *and* budget remains: it calls itself with the next candidate (`+ n 1`, identical to `find-least`'s own advance) and one less budget (`- budget 1`, using the same `-` already explained in the Header). This is the one genuinely new structural fact worth naming directly: **this recursive call is guaranteed to terminate, and `find-least`'s was not**, even though both search forever-growing candidates with no guarantee any of them will ever satisfy the predicate. The reason is Lesson 22's base-case-and-progress argument, applied to a completely different quantity than `sum-upto` used it on: it is not `n` that has to shrink toward a base case here — `n` still only grows, exactly as it did in `find-least` — it is `budget`, decreasing by exactly `1` on every recursive call, starting from a fixed, finite, caller-supplied number, and guaranteed to hit `0` (the inner `if`'s own base case) in exactly that many steps if the predicate never succeeds first. `find-least-bounded` is a **total function** — the exact property Concept Unit 1 defined and Concept Unit 2's `find-least` provably lacked — precisely because this one variable was deliberately given the shrinking-toward-a-base-case shape `find-least`'s own `n` never had.

**Execution trace** — `(find-least-bounded thousand? 0 10)`, showing enough steps to establish the pattern, then the terminating step:

```
Call n=0 budget=10: (thousand? 0) false, budget<>0 -> recurse n=1 budget=9
Call n=1 budget=9:  (thousand? 1) false, budget<>0 -> recurse n=2 budget=8
Call n=2 budget=8:  (thousand? 2) false, budget<>0 -> recurse n=3 budget=7
... (the same shape repeats: n up by 1, budget down by 1, thousand? still false)
Call n=9 budget=1:  (thousand? 9) false, budget<>0 -> recurse n=10 budget=0
Call n=10 budget=0: (thousand? 10) false, budget=0  -> returns ["exhausted" 10]
```

`n` and `budget` move in exact lockstep — `n` starts at `0` and rises by `1` every call, `budget` starts at `10` and falls by `1` every call, so they always sum to `10`; the moment `budget` reaches `0`, `n` has necessarily reached exactly `10`, which is precisely the `10` printed in `["exhausted" 10]` above. `(find-least-bounded never-satisfied? 0 50)` follows the identical shape for `50` steps instead of `10`, landing on `["exhausted" 50]` for the same structural reason — not because `50` is special, but because `budget` started at `50`.

### CS Lens

**Fuel-limited computation** and **semi-decidability**, both hard concepts:

```
Also recognized in: an HTTP client's request timeout; a chess engine's fixed
search-depth cutoff before it must move; a spell-checker giving up after a
fixed number of candidate corrections; a spam filter's score threshold after
a bounded number of checks; airport security's "reasonable inspection time"
before a bag is waved through rather than searched forever.
```

Every one of these accepts the same tradeoff `find-least-bounded` accepts: a "no" answer within the deadline is not a proof that a longer search would also have failed — it is only the honest limit of what was actually checked.

### SE Lens

The design principle: bound uncertain work with an explicit, structural resource limit, rather than trusting it will finish and catching the failure after the fact. The alternative not chosen here is wrapping `find-least` in a `try`/`catch` and reacting to the crash after it happens — that approach still lets the crash occur; it only cleans up the mess afterward, and it has no way to distinguish "this predicate can genuinely never be satisfied" from "this predicate would have succeeded one step later, if the stack had held out." `find-least-bounded`'s approach prevents the crash from ever happening in the first place, at the real cost of one extra parameter and one extra `if` in every call — and it converts an unpredictable, unrecoverable event into an ordinary value a caller can inspect, branch on, and log. The honest debt this project is still carrying, stated plainly rather than smoothed over: `["exhausted" n]` genuinely cannot distinguish "no answer exists" from "an answer exists, just past where this budget stopped looking." Choosing a bigger budget narrows that uncertainty; no finite budget, chosen in advance, can ever eliminate it completely for every possible predicate. That specific, irreducible gap is not a flaw in this lesson's design — it is the real, technical seed of the Halting Problem, which Lesson 261 names and proves is not just hard to close, but provably impossible to close in general.

### Commands Needed

Same as the two units above: `bb <path-to-file>.clj`. No new tooling.

### Run It

```
find-least-bounded thousand? from 0 budget 2000 => [found 1000]
find-least-bounded thousand? from 0 budget 10 => [exhausted 10]
find-least-bounded never-satisfied? from 0 budget 50 => [exhausted 50]
```

Run for real, this session, via `bb`. Note that `println` prints the vector's own string element as bare text (`found`, not `"found"`) — this is `println`'s ordinary human-readable formatting, already described in the Header, not a different value than the `"found"` string literal actually written in the code.

### Connection

`find-least-bounded` closes the arc this lesson opened: Concept Unit 1 defined what it means for a procedure to be trustworthy in the first place (totality, via an effective procedure); Concept Unit 2 showed a real, common procedure shape that can fail that guarantee, and let it actually crash; this unit builds the standard engineering answer — bound the uncertainty explicitly — while being honest that the answer narrows the gap between "known" and "unknown" without eliminating it. That remaining, irreducible gap is exactly what the rest of Section XII exists to formalize.

---

## Connect the Pieces

Follow one predicate, `thousand?`, through all three units. `sum-upto` never enters this trace directly — it exists to establish the baseline `thousand?` and the searches below are measured against — so the real thread starts at Concept Unit 2. `find-least thousand? 0` searches candidates `0, 1, 2, ..., 1000`, one at a time, and halts at `1000` after exactly `1001` calls — a real, verified, total-in-this-instance result, even though `find-least` as a whole is not a total function, because nothing in its own code guarantees this outcome for every predicate it might be given (`never-satisfied?` is the counterexample, and it genuinely crashed). `find-least-bounded thousand? 0 2000` performs the identical search — same predicate, same starting candidate, same one-at-a-time advance — with a budget of `2000`, more than the `1000` steps actually needed, and returns `["found" 1000]`: the same answer, now wrapped in a sentinel that lets a caller tell, without guessing, that this was a genuine success rather than a budget running out. `find-least-bounded thousand? 0 10`, given far too little budget for this same search, does not find `1000` and does not crash either — it returns `["exhausted" 10]`, an honest, inspectable admission that ten candidates were not enough. And `find-least-bounded never-satisfied? 0 50` takes the exact predicate that turned `find-least` into an uncaught `StackOverflowError` in Concept Unit 2, runs the identical search shape against it, and returns `["exhausted" 50]` instead of crashing — the single concrete difference, end to end, between a computation that can vanish unpredictably and one that is guaranteed to always answer, even when the honest answer is "not within what I was allowed to check."

## What Breaks Without This

Delete the budget check from `find-least-bounded` — keep the `budget` parameter in the signature so the call sites still look identical, but stop actually consulting it:

```clojure
(defn find-least-bounded-broken [candidate-satisfies? n budget]
  (if (candidate-satisfies? n)
    ["found" n]
    (find-least-bounded-broken candidate-satisfies? (+ n 1) (- budget 1))))
```

Run it against the exact predicate that was safe a moment ago — `never-satisfied?`, with a generous-looking `budget 50`:

```
before call
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
Location: ...253-break.clj:6:5
```

`"after call"` — again — never prints. Removing one `if` branch, without touching anything else about the function's shape or its parameter list, silently turns `find-least-bounded` back into `find-least` in every way that actually matters: `budget` is still computed, still decremented, still passed along on every call — it has simply stopped being *checked*, which is the only thing that ever made it a real bound rather than an unused number along for the ride. The fix is to restore the deleted `(if (= budget 0) ["exhausted" n] ...)` branch exactly as it appeared in Concept Unit 3's own code above — the lesson this failure teaches is that a resource limit only does anything the moment something actually reads and acts on it; declaring the parameter is not the same fact as enforcing it.

## Exercises

1. Trace `(find-least-bounded four? 0 2)` by hand, step by step, the same way this lesson traced `(find-least-bounded thousand? 0 10)` above — predict the exact returned vector before running it, then run it via `bb` and confirm.
2. Write a new predicate of your own, in the same style as `never-satisfied?`, that is also never true for any candidate `find-least-bounded` would ever try starting from `0`. Confirm `find-least-bounded` still returns a normal `["exhausted" n]` result against it, for a budget of your choosing, rather than crashing.
3. Before running it, predict how many recursive calls `(find-least-bounded thousand? 0 500)` will make, and what it will return. Then run it and check your prediction against the real output.
4. In writing, explain precisely why `find-least-bounded` is a total function — for *every* possible predicate, every starting `n`, and every non-negative `budget` — even though `find-least` is not, using the same base-case-and-progress reasoning Lesson 22 established and this lesson applied to `budget` instead of to `n`.
5. Modify `find-least-bounded` so that, in the `"exhausted"` case, it returns the number of candidates actually tried (not just the final `n` reached) as a third slot in the vector. Decide, and justify in writing, whether this changes anything about what the function can honestly claim to know.

## Definition of Done

- [ ] `sum-upto` run for at least three different inputs via `bb`, all matching the hand-derived values in this lesson's own execution trace.
- [ ] `find-least` run to a real, halting result on two different predicates — one satisfied on the very first candidate tried, one requiring many steps — both matching this lesson's shown output.
- [ ] `find-least` run on `never-satisfied?` and its real, uncaught `StackOverflowError` reproduced via `bb`, not just described secondhand.
- [ ] `find-least-bounded` run to both a `["found" ...]` result and an `["exhausted" ...]` result, including the specific case (`never-satisfied?`) that crashed the unbounded version.
- [ ] The budget check deliberately deleted from a copy of `find-least-bounded`, the resulting crash reproduced for real, and the check restored.
- [ ] A git commit made, with a message explaining *why* this lesson exists rather than merely what it adds — for example: "Add Lesson 253: distinguish total, partial, and budget-bounded computation, so Section XII's later formal results (decidability, the halting problem) land on ground this curriculum has already built and run for real, not just defined."
