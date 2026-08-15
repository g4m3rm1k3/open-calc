# Lesson 33: Backtracking

**What you will build**: By the end of this lesson you'll be able to search the exact same space of possibilities the previous lesson's `power-set` generates — but without ever generating most of it, by abandoning a branch the instant it's known to be hopeless. You'll trace a concrete case where this cuts off an entire subtree of possibilities with a single check, instead of exploring it fully only to discard the results afterward.

**What you need to know first**: The previous lesson's `power-set` and search-space vocabulary, and Lesson 22's termination measures.

**Terms introduced in this lesson**:

- **backtracking** — exploring a search space by making a choice, recursing into it, and abandoning that choice's branch the moment it's known to be hopeless, rather than exploring it to completion. *Why it matters*: the previous lesson's `power-set` explored every branch fully before any filtering happened; backtracking cuts a branch off the moment continuing would be pointless, often long before reaching what would have been its own base case.
- **pruning** — the act of abandoning a branch of a search space early, before it's fully explored, because nothing useful can come from it. *Why it matters*: the specific, named mechanism that makes backtracking faster than generate-then-filter — a precise action, checkable in code, not just "stopping early" left vague.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `>`, `or`, `empty?`, `cons`, and `my-append`, each already fully covered.

---

## Concept Unit: Exploring Without Generating Everything First

### The Problem

The previous lesson found subsets summing to a target value by generating *every* subset with `power-set`, then filtering. For a list of `10` positive numbers, that means generating and checking all `1024` subsets — even ones that were obviously hopeless from the very first element added, because their running sum already exceeded the target before the subset was even half-built. Is there a way to notice "this can't possibly work" partway through building a subset, and stop right there?

### Introduce the concept in isolation

Consider building a subset of `(10 5 3 2)` targeting a sum of `8`, one decision at a time: include `10`, or don't. The moment `10` is included, the running sum is already `10` — more than the target `8` — and every remaining number in the list is positive, meaning *nothing* added afterward can ever bring the sum back down. The entire branch that starts "include `10`" is hopeless, discoverable after examining exactly one number, long before any of the `2³ = 8` different ways to continue that branch (with `5`, `3`, and `2` each included or not) are ever built.

### Generalizing

This is the general shape of every backtracking problem: a sequence of choices, where a *partial* sequence of choices can sometimes already be known to be hopeless, well before every remaining choice has been made. Recognizing this — and stopping immediately, rather than finishing the branch first — is the entire idea the next unit turns into working code.

### CS Lens

This is the identical realization Lesson 32's `bst-contains?` already had about search, generalized: `bst-contains?` used the binary-search-tree property to skip an entire subtree without examining it; backtracking uses a problem's own structure (here, "positive numbers only ever increase a running sum") to skip an entire branch of a search space the same way.

### SE Lens

Generating every possibility and filtering afterward (the previous lesson's approach) is simple to write and easy to trust, but does genuinely wasted work whenever a branch's fate is decided early — work that grows exponentially with the input, per Lesson 32's own doubling observation. Skipping that wasted work, without changing what gets found, is exactly what the rest of this lesson derives.

---

## Concept Unit: Pruning — Abandoning a Branch Early

### The Problem

Translate the previous unit's observation directly into code: at every recursive call, check whether the current partial subset is already hopeless, and stop immediately if so — before making either of the two further choices (include or exclude the next number).

### Introduce the concept in isolation

```clojure
(defn find-subset-sum [lst target current-subset current-sum]
  (if (= current-sum target)
    (list current-subset)
    (if (or (empty? lst) (> current-sum target))
      (list)
      (my-append
        (find-subset-sum (rest lst) target (cons (first lst) current-subset) (+ current-sum (first lst)))
        (find-subset-sum (rest lst) target current-subset current-sum)))))
```

```
user=> (find-subset-sum (list 10 5 3 2) 8 (list) 0)
((3 5))
```

Three cases, checked in order: if the current sum already equals the target, this subset is a complete answer — return it. Otherwise, if there's nothing left to add *or* the current sum has already exceeded the target, this branch is hopeless — **prune** it, returning no answers from here at all, without making any further recursive calls. Otherwise, make the two choices Lesson 32's `power-set` always made — include the next number, or don't — and combine whatever answers each branch finds.

Trace the `(> current-sum target)` check doing real work: calling `find-subset-sum` with `10` included first produces a current sum of `10`, immediately triggering the prune condition — the function returns `(list)` at that point, *without* ever considering whether to include or exclude `5`, `3`, or `2`. Contrast this with `power-set`, which would have generated and later discarded all eight combinations of `(5 3 2)` under `10`, only recognizing the whole branch was hopeless after fully building every one of them.

### Discard the throwaway example

Not applicable — `find-subset-sum` is a real, working backtracking search.

### Project Change

- **Reference Source**: No reference counterpart — `power-set`'s own recursive structure, modified with one new pruning check inserted before the two-way branch.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`.

### The New Code — type it yourself

```clojure
(defn find-subset-sum [lst target current-subset current-sum]
  (if (= current-sum target)
    (list current-subset)
    (if (or (empty? lst) (> current-sum target))
      (list)
      (my-append
        (find-subset-sum (rest lst) target (cons (first lst) current-subset) (+ current-sum (first lst)))
        (find-subset-sum (rest lst) target current-subset current-sum)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= current-sum target) (list current-subset) ...)`** — a success check, distinct from an ordinary base case: this fires the moment a *solution* is found, which can happen at any depth, not only when the input list runs out.
- **`(or (empty? lst) (> current-sum target))`** — first appearance of a genuine **pruning** condition: `(empty? lst)` is the ordinary "nothing left to try" base case (Lesson 24's shape, reused); `(> current-sum target)` is the new, problem-specific reason to stop early, checked *before* either recursive call, not after.
- **`current-subset`, `current-sum`** — reappearing accumulator-style parameters (Lesson 27's shape): both carry forward the choices made so far, exactly the way `my-reduce`'s accumulator carried a running result forward, here carrying a running *partial solution* instead of a single combined value.

### CS Lens

Pruning based on "every remaining choice can only make things worse" is the exact reasoning behind Lesson 137 (*Search, Pruning, and Heuristics*), which studies this technique formally across much larger search spaces — chess move exploration, route planning, constraint satisfaction — all of which use the identical idea: recognize a partial solution is hopeless as early as possible, and never explore beneath it.

### SE Lens

`find-subset-sum`'s termination measure (Lesson 22) is the length of `lst`, exactly as it was for every list-consuming function in this section — pruning doesn't change *whether* the function terminates, only how much work happens *before* it does. A backtracking function without a correct pruning condition still terminates (it degrades gracefully into `power-set`'s full exploration); a backtracking function with an *incorrect* pruning condition can terminate quickly while silently missing valid answers — a risk this lesson's closing sections examine directly.

### Connection to the previous unit

The previous unit identified, informally, that a partial choice sequence can sometimes be known to be hopeless early; this unit turns that observation into a precise, checkable condition, inserted directly into the previous lesson's own recursive structure.

---

## Concept Unit: Backtracking as Controlled Search-Space Exploration

### The Problem

`find-subset-sum` prunes based on one specific fact about this one problem (positive numbers only increase a sum). Is "backtracking" a name for this one trick, or a general pattern that applies whenever *some* problem-specific fact can rule out a branch early?

### Introduce the concept in isolation

State the general shape, stripped of `find-subset-sum`'s specific numbers:

> **Backtracking** explores a search space (Lesson 32) by making one choice at a time, recursing into the consequences of that choice, and checking, at every step, whether the partial sequence of choices made so far is already known to be invalid or hopeless. If so, the branch is **pruned** — abandoned immediately, without exploring any of its own further choices. If a complete, valid sequence of choices is reached, it's recorded as a solution. Otherwise, the next choice is made, and the process repeats.

`find-subset-sum`'s pruning condition (`current-sum > target`) is one specific instance of "known to be hopeless" — a different backtracking problem (placing chess pieces so none attack each other, filling in a Sudoku grid, Lesson 136's constraint satisfaction generally) would use a completely different check, tailored to that problem's own rules, but the surrounding shape — choose, recurse, prune if hopeless, backtrack if not — stays the same.

### Discard the throwaway example

Not applicable — this is the formal statement of a pattern this lesson has already demonstrated concretely.

### Formal Definition, Walked Through

- *"making one choice at a time"* — exactly `power-set`'s own two-way branch (include or exclude), reused unchanged; backtracking doesn't require a different way of generating choices, only a different discipline about which branches get followed all the way through.
- *"checking... whether the partial sequence... is already known to be invalid or hopeless"* — this check is always problem-specific; recognizing *what* makes a partial solution hopeless for a given problem is the actual design work backtracking requires, not something a general-purpose tool can supply automatically.

### CS Lens

Also recognized in: exiting a maze by trying a path, retreating the moment it dead-ends, and trying the next unexplored branch instead of continuing to wander down a path already known to fail (the word "backtracking" comes directly from this image — literally stepping back to the last decision point when a path proves hopeless), and a word-search puzzle solver abandoning a candidate word the moment a needed letter isn't adjacent to the last one placed, rather than continuing to check the rest of the word first.

### SE Lens

Writing a *correct* pruning condition is the entire craft of backtracking, and getting it wrong in either direction has a real cost: a pruning condition that's too aggressive (cutting off a branch that could actually still succeed) silently produces incomplete or wrong results — the search reports failure, or a smaller answer set, without any indication a valid solution was skipped; one that's too conservative (rarely or never pruning) degrades back into `power-set`'s full, expensive exploration, correct but no faster. `find-subset-sum`'s condition is safe specifically *because* every number in the list is assumed positive — verifying that assumption actually holds for real input is exactly the kind of check Lesson 1's specification discipline would have flagged from the very first lesson of this series.

### Connection to the previous unit

The previous unit derived one specific, working pruning condition; this unit names the general pattern that condition is an instance of, and states plainly that the pattern's real difficulty — and its real value — lies entirely in correctly identifying what "hopeless" means for a specific problem.

---

## Connect the Pieces

`find-subset-sum` against `power-set` plus `filter`, confirming both approaches agree, on the same data:

```clojure
(def amounts (list 10 5 3 2))

(println "Via backtracking:" (find-subset-sum amounts 8 (list) 0))
(println "Via generate-then-filter:"
         (filter (fn [subset] (= (reduce + 0 subset) 8)) (power-set amounts)))
```

```
Via backtracking: ((3 5))
Via generate-then-filter: ((3 5))
```

Both approaches find the identical answer — proof that pruning changes *how much work* is done, not *what answer* is found, provided the pruning condition is actually correct (Concept Unit 3's warning). `find-subset-sum` reached this answer by abandoning the entire "include `10`" branch after a single check; `power-set` plus `filter` reached the same answer only after generating and checking all sixteen subsets of a four-element list, most of them already doomed from their very first included element.

## What Breaks Without This

Suppose `find-subset-sum` were used on a list containing a *negative* number — violating the "every remaining choice can only make the sum bigger" assumption the pruning condition depends on entirely:

```clojure
(find-subset-sum (list 10 -5 3) 8 (list) 0)
```

Once `10` is included, the running sum is `10`, already exceeding the target `8` — and the pruning condition fires, abandoning this branch immediately, exactly as designed. But a valid solution — `10` plus `-5` plus `3` equals `8` — actually existed *inside* the very branch that got pruned; the negative number could have brought the sum back down below the target, something the pruning condition never accounted for. This is Concept Unit 3's SE Lens warning made concrete: the pruning condition wasn't wrong in general, it was wrong for *this* input, because the assumption it silently depended on (every number is positive) was never actually checked, and violating it doesn't produce an error — it produces a search that confidently, silently misses a real answer.

## Exercises

1. **Trace.** By hand, trace `(find-subset-sum (list 4 3 2) 5 (list) 0)`, showing every recursive call and noting exactly where (if anywhere) pruning fires.
2. **Predict.** Before running it, predict whether `(find-subset-sum (list 1 1 1) 2 (list) 0)` finds one answer or more than one. Trace it to check — does the search explore more than one way to reach the target?
3. **Count.** For `(find-subset-sum (list 10 5 3 2) 8 (list) 0)`, count how many total recursive calls are made (including pruned branches, but not what would have happened inside them). Compare this count to `power-set`'s total work (sixteen full subsets generated and checked) on the same list.
4. **Break it, on purpose.** Confirm, by running it yourself, that `(find-subset-sum (list 10 -5 3) 8 (list) 0)` misses the valid solution described in "What Breaks Without This." Then explain, in one sentence, exactly which line of code depends on the positive-numbers assumption.
5. **Generalize.** Modify `find-subset-sum`'s pruning condition so it correctly handles lists that may contain zero (but still only non-negative numbers) — does the existing condition already handle this correctly, or does it need to change? Justify your answer by tracing a concrete case with a zero in it.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between backtracking and generate-then-filter, using the words "prune" and "hopeless," and explain what specifically makes a pruning condition unsafe.

## Definition of Done

- [ ] You can write a backtracking search with a correct pruning condition, given a clearly stated problem.
- [ ] You completed Exercise 3 and can state, concretely, how many fewer recursive calls backtracking made compared to `power-set`'s full generation.
- [ ] You completed Exercise 4 and can explain exactly why the pruning condition fails silently on input containing a negative number.
- [ ] You can explain, from memory, why a too-aggressive pruning condition is a correctness bug, not just a performance issue.
- [ ] Commit `find-subset-sum` and your Exercise 5 zero-handling analysis to your notes repository, with a commit message stating whether the original condition needed to change — for example, `"Verify find-subset-sum's pruning condition already handles zero correctly — (> current-sum target) never fires incorrectly when a zero is included, since it never increases the sum"` — not just `"lesson 33 exercise"`.

---

**Next lesson:** Lesson 34, *Accumulators*, steps back from search specifically and studies the accumulator-passing pattern this lesson's `current-subset` and `current-sum` already used, and Lesson 27's `reduce` used before that, as a general technique in its own right — converting recursive state into explicit parameters, deliberately, for any recursive function that needs it.
