# Lesson 38: Memoization

**What you will build**: By the end of this lesson you'll be able to eliminate the exact redundant work Lesson 23's `fib` evaluation tree first revealed, using Clojure's `memoize` — and you'll uncover a genuinely important subtlety: wrapping a recursive function with `memoize` the obvious way does *not* automatically speed up its own internal recursive calls, and you'll derive the real fix.

**What you need to know first**: Lesson 23's `fib` and its evaluation tree, specifically the fact that `fib(2)` was computed twice, independently, while computing `fib(4)`.

**Terms introduced in this lesson**:

- **memoization** — caching a function's results so that a repeated call with the same input can be looked up instead of recomputed. *Why it matters*: the direct, general fix for the overlapping-subproblems waste Lesson 23's evaluation tree first made visible, named and made reusable rather than solved by hand each time.
- **cache hit** / **cache miss** — a lookup that finds a previously stored answer (a hit) versus one that doesn't and triggers a real computation (a miss). *Why it matters*: precise vocabulary for what a memoized function decides at every single call — this lesson's traces count exactly how many of each occur.

**Objects and methods used**:

- **`memoize`**
  - *What it is:* a function in Clojure's core library that wraps another function, caching its results by argument.
  - *Implementation:* `(memoize f)` returns a new function that, when called with arguments it has already seen, returns the stored result directly (a cache hit) instead of calling `f` again; when called with new arguments, it calls `f` (a cache miss), stores the result, and returns it.
  - *Its use:* Concept Unit 2, wrapping a recursive function to eliminate its own repeated subproblems — with one important correction, derived in Concept Unit 3.

---

## Concept Unit: Recognizing Repeated Work — Revisiting `fib`'s Evaluation Tree

### The Problem

Lesson 23 drew `(fib 4)`'s complete evaluation tree by hand and found `fib(2)` computed twice, independently, and `fib(1)` computed three times — nine total calls for a tree covering only five genuinely distinct Fibonacci values (`fib(0)` through `fib(4)`). Nothing in this series has fixed that waste yet.

### Introduce the concept in isolation

Recall the exact count from Lesson 23: `(fib 4)`'s tree has `9` total calls, but only `5` distinct ones — `fib(0)`, `fib(1)` (needed three separate times), `fib(2)` (needed twice), `fib(3)`, and `fib(4)`. If every one of those `5` distinct values were computed exactly once, and every repeat use simply looked up the already-known answer instead of recomputing it from scratch, the total work would shrink from `9` calls down to `5` — the redundant `4` calls eliminated entirely.

### Discard the throwaway example

Not applicable — this is a precise recollection of a cost already established, not new content.

### Generalizing

This same shape recurs constantly, well beyond `fib`: any recursive function whose recursive calls can reach the identical input by more than one path has this exact kind of waste, exploitable the identical way. Naming the fix once, generally, is this lesson's task.

### CS Lens

The technique this lesson derives — remembering an answer once computed, and looking it up rather than recomputing it — is called **memoization**, and it's one of the single most impactful, broadly applicable optimizations in all of computer science, precisely because overlapping subproblems (Lesson 23's own term) show up in an enormous range of real recursive computations, not just `fib`.

### SE Lens

Nothing about `fib`'s *code* needs to change to benefit from this — the function is already correct, and the waste is entirely about *how many times* an already-known answer gets recomputed, not about anything wrong with the computation itself. This is exactly the shape of optimization Lesson 284 (*Performance Engineering*) will insist on later: fix a measured, specific cost, without needing to rewrite correct logic from scratch.

---

## Concept Unit: `memoize` — Caching a Function's Results

### The Problem

Is there a general-purpose tool that remembers a function's previous results automatically, without hand-writing a lookup table for every function that needs one?

### Introduce the concept in isolation

Add a `println` to `fib`, so every *actual* computation (not a cache lookup) announces itself:

```clojure
(defn fib-traced [n]
  (println "Computing fib for" n)
  (if (<= n 1)
    n
    (+ (fib-traced (- n 1)) (fib-traced (- n 2)))))
```

```
user=> (fib-traced 4)
Computing fib for 4
Computing fib for 3
Computing fib for 2
Computing fib for 1
Computing fib for 0
Computing fib for 1
Computing fib for 1
Computing fib for 2
Computing fib for 1
Computing fib for 0
3
```

Nine prints — matching Lesson 23's own count of nine total calls exactly, with `"Computing fib for 1"` appearing three times and `"Computing fib for 2"` twice, the identical redundancy the evaluation tree already showed, now made directly visible through output rather than a hand-drawn diagram.

Now wrap it with `memoize`:

```clojure
(def fib-memoized-naive (memoize fib-traced))
```

```
user=> (fib-memoized-naive 4)
Computing fib for 4
Computing fib for 3
Computing fib for 2
Computing fib for 1
Computing fib for 0
Computing fib for 1
Computing fib for 1
Computing fib for 2
Computing fib for 1
Computing fib for 0
3
user=> (fib-memoized-naive 4)
3
```

The *second* call to `fib-memoized-naive 4` produces no prints at all — a genuine **cache hit**, the whole computation skipped entirely because `4` was already seen. But the *first* call still printed all nine lines, completely unchanged. `memoize` only caches the *outermost* call — `fib-traced`'s own internal recursive calls still call `fib-traced` directly, not the memoized wrapper, so none of the internal repeated work (`fib(2)` computed twice, `fib(1)` three times, all *within* the first call) was eliminated at all.

### Discard the throwaway example

Not applicable — `fib-memoized-naive` is a real function, and its incomplete benefit is the direct motivation for the next unit's fix.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def fib-memoized-naive (memoize fib-traced))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`memoize`** — first appearance as a called function (covered fully in Objects and methods used, above): wraps `fib-traced`, returning a new function that checks a cache before calling `fib-traced` at all.
- **`fib-traced`** — reappearing symbol lookup (Lesson 3), retrieving the *original*, un-memoized function to wrap — critically, `fib-traced`'s own body still refers to `fib-traced` by name for its recursive calls, not to the new wrapper being built around it.

### CS Lens

This exact gap — memoizing a function's outer call without its inner recursive calls benefiting — is a well-known, real pitfall, not a mistake specific to this lesson's example: wrapping a recursive function after the fact, without changing what its own body calls, only ever caches the top-level invocation.

### SE Lens

`fib-memoized-naive`'s *second* call being instant is a real, genuine benefit — repeated calls with the same top-level argument are now free. But the *first* call to any new argument still pays the full, unreduced cost every time, which is precisely the cost that matters most for a single large computation, as opposed to many repeated small ones.

### Connection to the previous unit

The previous unit identified the waste `fib`'s evaluation tree contains; this unit shows the obvious fix — wrap the function with `memoize` — genuinely helps, but only partially, setting up the real, complete fix in the next unit.

---

## Concept Unit: Memoizing Recursion Correctly — Calling the Cache From Inside

### The Problem

`fib-traced`'s own recursive calls need to reach the *memoized* version of itself, not the original — otherwise the cache the wrapper builds is never consulted by the function's own internal recursion at all. How does a function call "its own memoized version" when the memoized version doesn't exist until *after* the original function is already defined?

### Introduce the concept in isolation

This is exactly Lesson 36's forward-reference problem, applied to a function referencing its *own* eventual wrapper:

```clojure
(declare fib-memo)

(defn fib-memo-helper [n]
  (println "Computing fib for" n)
  (if (<= n 1)
    n
    (+ (fib-memo (- n 1)) (fib-memo (- n 2)))))

(def fib-memo (memoize fib-memo-helper))
```

```
user=> (fib-memo 4)
Computing fib for 4
Computing fib for 3
Computing fib for 2
Computing fib for 1
Computing fib for 0
3
```

Five prints — not nine — exactly matching Lesson 23's own count of `5` genuinely distinct Fibonacci values needed for `fib(4)`. `fib-memo-helper`'s own recursive calls go through `fib-memo` (the memoized wrapper, made reachable early via `declare`), so when the computation reaches `fib-memo(1)` or `fib-memo(2)` for a *second* time, the cache is checked *before* `fib-memo-helper` ever runs again — every redundant call Lesson 23 identified is now a cache hit instead of a real computation.

### Discard the throwaway example

Not applicable — `fib-memo` is the correct, complete version of this lesson's technique, and a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — combines `memoize` with Lesson 36's forward-declaration pattern, applied to a function referencing its own eventual wrapper.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(declare fib-memo)

(defn fib-memo-helper [n]
  (println "Computing fib for" n)
  (if (<= n 1)
    n
    (+ (fib-memo (- n 1)) (fib-memo (- n 2)))))

(def fib-memo (memoize fib-memo-helper))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(declare fib-memo)`** — reappearing `declare` (Lesson 36): makes the name `fib-memo` referenceable inside `fib-memo-helper`'s body before it's actually given a value.
- **`(+ (fib-memo (- n 1)) (fib-memo (- n 2)))`** — the key change from `fib-traced`: both recursive calls go through `fib-memo` — the eventual memoized wrapper — rather than calling `fib-memo-helper` directly, ensuring every recursive call, at every depth, checks the cache first.
- **`(def fib-memo (memoize fib-memo-helper))`** — reappearing `def` and `memoize`; this is what `fib-memo-helper`'s own body was already, correctly, referring to by name, thanks to the earlier `declare`.

### CS Lens

This pattern — a helper function that calls its *own eventual memoized wrapper* for its recursive calls, tied together with a forward declaration — is the standard, correct way to memoize genuinely recursive computations, used identically whichever specific function is being sped up. The trace above (`5` prints instead of `9`) is a direct count of exactly the redundant work Lesson 23's evaluation tree diagram made visible, now eliminated and verified numerically rather than only inspected visually.

### SE Lens

The difference between `fib-memoized-naive` (Concept Unit 2, only caches the outer call) and `fib-memo` (this unit, caches every call including internal ones) is invisible from the outside — both are called the same way, both return the correct answer, both are "memoized" in some sense. Only tracing the actual number of underlying computations, the way this lesson's `println` did, reveals which one actually eliminated the redundant work `fib`'s own recursive structure creates.

### Connection to the previous unit

The previous unit showed `memoize`'s naive application catching only the outermost call; this unit is the complete fix, redirecting the function's *own* recursive calls through the memoized wrapper so every level of recursion benefits, not just the first.

---

## Connect the Pieces

The full progression, from Lesson 23's diagram to this lesson's verified, working fix:

```clojure
(println "Unmemoized, fib(4):" (fib-traced 4))
(println "---")
(println "Correctly memoized, fib-memo(4):" (fib-memo 4))
(println "---")
(println "Second call to fib-memo(4), fully cached:" (fib-memo 4))
```

```
Computing fib for 4
Computing fib for 3
Computing fib for 2
Computing fib for 1
Computing fib for 0
Computing fib for 1
Computing fib for 1
Computing fib for 2
Computing fib for 1
Computing fib for 0
Unmemoized, fib(4): 3
---
Correctly memoized, fib-memo(4): 3
Second call to fib-memo(4), fully cached: 3
```

(`fib-memo(4)`'s own five internal prints, already shown in Concept Unit 3, aren't repeated here — the point is that the *second* call to `fib-memo 4` produces none at all.) Nine computations, unmemoized; five, correctly memoized (exactly the number of genuinely distinct subproblems); zero, on a repeat call — three numbers, each one a direct, countable confirmation of a specific claim this lesson made, not merely an assertion that memoization "helps."

## What Breaks Without This

Suppose the forward-declaration step were skipped, and `fib-memo-helper`'s recursive calls were left referring to `fib-memo-helper` itself — exactly `fib-memoized-naive`'s original mistake, reintroduced:

```clojure
(defn fib-memo-helper-broken [n]
  (println "Computing fib for" n)
  (if (<= n 1)
    n
    (+ (fib-memo-helper-broken (- n 1)) (fib-memo-helper-broken (- n 2)))))

(def fib-memo-broken (memoize fib-memo-helper-broken))
```

```
user=> (fib-memo-broken 4)
```

This produces the identical nine prints `fib-traced 4` did — `memoize` wraps `fib-memo-helper-broken`'s outer call correctly, but every internal recursive call still bypasses the cache entirely, calling `fib-memo-helper-broken` directly, exactly the way `fib-memoized-naive` did in Concept Unit 2. This isn't a new mistake — it's the exact same one, reappearing the moment the forward-declaration step is treated as optional rather than the actual mechanism that makes internal calls cache-aware at all.

## Exercises

1. **Trace.** By hand, predict how many prints `(fib-memo 5)` produces — using this lesson's pattern, not Lesson 23's unmemoized count — before running it to check. (Hint: how many genuinely distinct Fibonacci values does computing `fib(5)` require?)
2. **Predict.** Before running it, predict whether calling `(fib-memo 3)` *after* `(fib-memo 4)` has already run produces any new prints at all. Justify your prediction using the cache `fib-memo 4` would have already built.
3. **Diagnose.** Explain, in your own words, exactly why `fib-memoized-naive`'s second call to `(fib-memoized-naive 4)` was instant, even though its *first* call did no better than the unmemoized version.
4. **Break it, on purpose.** Reproduce "What Breaks Without This" yourself — write `fib-memo-helper-broken`, confirm it produces nine prints on first call, and explain precisely which line differs from the correct `fib-memo-helper`.
5. **Generalize.** Apply this lesson's correct memoization pattern (`declare`, a helper referencing the eventual wrapper, `memoize`) to `factorial` (Lesson 20). Does `factorial` actually have any overlapping subproblems to eliminate — trace a call by hand to check — and if not, what does memoizing it actually buy you?
6. **Reconstruct.** Close this lesson. From memory, explain why `(memoize some-recursive-fn)` alone doesn't fully memoize a recursive function, and state the exact fix, using the word "declare."

## Definition of Done

- [ ] You can correctly memoize a recursive function so that its own internal recursive calls benefit, not just its outermost call.
- [ ] You completed Exercise 1 and correctly predicted the number of distinct computations `fib(5)` requires.
- [ ] You completed Exercise 5 and can state, honestly, whether memoizing `factorial` actually eliminates any redundant work.
- [ ] You can explain, precisely, why `fib-memoized-naive`'s first call showed no improvement at all.
- [ ] Commit `fib-memo` and your Exercise 5 `factorial` analysis to your notes repository, with a commit message stating your finding — for example, `"Add correctly-memoized fib-memo (5 computations for fib(4), verified via println count); factorial has no overlapping subproblems, so memoizing it only helps repeat calls with the same n, not a single call"` — not just `"lesson 38 exercise"`.

---

**Next lesson:** Lesson 39, *Dynamic Programming from Recursion*, takes memoization's "remember, don't recompute" idea one step further — restructuring a recursive computation to build its answers from the smallest subproblem upward, in order, rather than recursing downward and caching along the way.
