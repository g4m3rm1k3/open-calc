# Lesson 117: Greedy Algorithms

**What you will build**: By the end of this lesson you'll derive a **greedy** coin-change algorithm, verify it gives the genuinely optimal answer for one set of denominations, then run the *identical* algorithm on a different set of denominations and watch it confidently produce a wrong answer — establishing directly why a greedy strategy always needs its own proof, never just its own intuition, to be trusted.

**What you need to know first**: Lesson 110's specification-first discipline; Lesson 111's brute-force baseline, for contrast in how correctness is normally argued.

**Terms introduced in this lesson**:

- **greedy algorithm** — an algorithm that makes the choice that looks best *right now*, at every step, without ever reconsidering an earlier choice, hoping a sequence of locally best choices adds up to a globally best result. *Why it matters*: this lesson's whole point is that hope is not a proof — greedy composes local decisions into a global answer, and whether that composition is actually correct depends entirely on the specific problem, not on the strategy itself.

**Objects and methods used**: None new. This lesson reuses `get` (Lesson 84) and `<=` (Lesson 2), each already covered.

---

## Concept Unit: The Greedy Strategy — Coin Change

### The Problem

Given a target amount and a set of coin denominations, what's the fewest coins that sum to exactly that amount? One obvious-seeming strategy: always take the largest denomination that doesn't overshoot the remaining amount, repeat. Does "obviously reasonable" mean "provably correct"?

### Introduce the concept in isolation

```clojure
(defn greedy-coins-from [amount denominations i count]
  (if (= amount 0)
    count
    (if (<= (get denominations i) amount)
      (greedy-coins-from (- amount (get denominations i)) denominations i (+ count 1))
      (greedy-coins-from amount denominations (+ i 1) count))))

(defn greedy-coins [amount denominations]
  (greedy-coins-from amount denominations 0 0))
```

```
user=> (greedy-coins 41 [25 10 5 1])
4
```

`denominations` is sorted largest-first. At every step, `greedy-coins-from` takes the current-largest coin if it fits (`\leq` the remaining amount), reducing the amount and counting one more coin; once a denomination no longer fits, it moves to the next-smaller one. For `41` cents using standard U.S. coins: `25`, then `10` (remaining `16`), then `5` (remaining `6`), then `1` (remaining `1`), then `1` again — `4` coins, `25+10+5+1=41`, matching this lesson's own hand-traced path.

### Discard the throwaway example

Not applicable — `greedy-coins`/`greedy-coins-from` are real, reusable functions.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of the "always take the largest fitting denomination" strategy, using Lesson 91's own compute-once-pass-to-a-helper pattern for the running amount and coin index.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn greedy-coins [amount denominations]
  (greedy-coins-from amount denominations 0 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= amount 0)`** — the base case: nothing left to make change for; `count` at this point is the total number of coins used along this specific path.
- **`(<= (get denominations i) amount)`** — the **greedy** decision itself: take the current coin if it fits, without ever checking whether a *smaller* coin, taken now, might lead to a better total later.
- **`(greedy-coins-from (- amount (get denominations i)) denominations i (+ count 1))`** — reappearing structural recursion with an accumulator (Lesson 34): the chosen coin's value is subtracted immediately, and the *same* index `i` is tried again next, since the largest-fitting coin might fit more than once.

### CS Lens

This is Lesson 111's brute force's exact opposite in spirit: brute force examines every possibility before deciding anything; greedy decides immediately, once, at each step, and never looks back — a real, structural difference in how much of the problem each strategy actually considers before committing.

### SE Lens

Greedy's appeal is real: `greedy-coins` is short, fast (one pass, no recursion into alternatives), and easy to read — exactly the kind of algorithm that looks obviously correct on first inspection, which is precisely the trap this lesson's next unit exposes.

---

## Concept Unit: When Greedy Works — and When It Doesn't

### The Problem

`greedy-coins` gave the right answer for standard U.S. denominations. Is that because greedy is correct for coin change *in general*, or because standard U.S. denominations happen to have some special property that made it work?

### Introduce the concept in isolation

```
user=> (greedy-coins 6 [4 3 1])
3
```

For denominations `[4 3 1]`, targeting `6`: greedy takes `4` first (remaining `2`), then can't fit `3`, takes `1` twice — `4+1+1=6`, `3` coins. But `3+3=6` uses only **`2`** coins, and `3` is a valid denomination here. Greedy produced a *correct* total (it does sum to `6`) but a **suboptimal** one — more coins than necessary, confidently, with nothing in the algorithm itself signaling anything went wrong.

### Discard the throwaway example

Not applicable — `[4 3 1]` targeting `6` is a real, hand-traced input to already-existing code.

### CS Lens

The difference between these two cases isn't a bug in `greedy-coins` — the identical code ran both times. It's a property of the *denominations themselves*: standard U.S. coins happen to have a structure (each denomination is a multiple, or near-multiple, relevant to the ones below it) that makes greedy's local choice never cost anything globally; `[4 3 1]` doesn't share that structure, and greedy's blindness to alternatives — never reconsidering the choice of `4` once made — is exactly what produces the suboptimal result.

### SE Lens

This is the single most important fact about greedy algorithms, and the reason this lesson exists at all: **a greedy algorithm's correctness is never automatic from the strategy alone** — it has to be proven, for the *specific* problem, using a real argument about *that problem's* structure. Lesson 118 (*Exchange Arguments*), immediately next, builds the standard tool for constructing exactly that proof, rather than trusting a greedy algorithm because its first test case happened to work.

### Connection to the previous unit

The previous unit built greedy-coins and watched it succeed; this unit runs the *identical* code on different input and watches it fail — proof that "it worked on my example" is never sufficient justification for a greedy strategy, precisely the proof obligation this lesson's title names.

---

## Concept Unit: The Proof Obligation Greedy Always Carries

### The Problem

If greedy sometimes works and sometimes doesn't, and the difference isn't visible by reading the algorithm's own code, what actually has to be checked before trusting a greedy algorithm on a new problem?

### Introduce the concept in isolation

A greedy algorithm is only trustworthy once someone has shown, specifically for its problem, that a locally optimal choice can never be *worse* than some other choice would have been — not "seems reasonable," a real argument. Two shapes this argument commonly takes, both named here and developed later in this series: the **exchange argument** (Lesson 118, immediately next) — show that any optimal solution can be transformed into the greedy solution without making it worse — and the **greedy-choice property combined with optimal substructure** (a more general framing, connecting forward to Lesson 119's dynamic programming, which handles exactly the problems where greedy's shortcut *doesn't* hold).

### Discard the throwaway example

Not applicable — this unit names the proof obligation directly; Lesson 118 builds the actual technique.

### CS Lens

Lesson 109's own four-part definition of "algorithm" already required correctness relative to a stated specification — a greedy algorithm without a correctness proof hasn't actually satisfied that requirement yet, even if it happens to produce right answers on every example someone thought to try, exactly `[4 3 1]`'s own quiet failure here.

### SE Lens

The practical discipline this lesson leaves behind: never trust a greedy algorithm on a new problem because it "seems to work" on the cases already tried — `greedy-coins` seemed to work too, right up until `[4 3 1]`. Either find or construct a real correctness argument (Lesson 118's tool), or use a strategy — brute force (Lesson 111), or dynamic programming (Lesson 119) — whose correctness doesn't depend on the problem having a special structure greedy happens to need.

### Connection to the previous unit

The previous unit demonstrated failure without diagnosing it; this unit names exactly what's missing whenever greedy fails silently — a real proof, specific to the problem, that Lesson 118 shows how to actually construct.

---

## Connect the Pieces

Both cases, side by side, with the honest verdict for each:

```clojure
(println "Standard coins, 41 cents:" (greedy-coins 41 [25 10 5 1]) "coins (optimal)")
(println "Denominations [4 3 1], 6 cents:" (greedy-coins 6 [4 3 1]) "coins (NOT optimal -- true minimum is 2)")
```

```
Standard coins, 41 cents: 4 coins (optimal)
Denominations [4 3 1], 6 cents: 3 coins (NOT optimal -- true minimum is 2)
```

Identical code, identical strategy, one genuinely optimal result and one genuinely wrong one — the exact evidence this lesson needed to make "greedy needs its own proof" a demonstrated fact, not an abstract warning.

## What Breaks Without This

Suppose `greedy-coins` were deployed inside a real system — a vending machine's change-making logic, say — tested only against standard currency during development, where it always happens to be optimal. If that system were later reconfigured for a currency, a loyalty-points scheme, or a token system with a `[4 3 1]`-shaped denomination set, `greedy-coins` would keep running, keep producing *valid* change (the amounts always sum correctly), and keep silently overpaying in coins — a real cost, in a real system, with no error, no crash, and no test failure, because every test that ever ran only checked "does it sum to the right amount," never "is it actually the fewest coins possible."

## Exercises

1. **Trace.** By hand, trace `(greedy-coins 11 [10 5 1])`, confirming it produces `2` coins (`10+1`), and confirm that's genuinely optimal for these denominations.
2. **Predict.** Before checking, predict whether `[4 3 1]` targeting `8` (rather than `6`) also produces a suboptimal result. Trace to confirm.
3. **Verify.** Find the true minimum coin count for `[4 3 1]` targeting `6` by hand (checking every combination that sums to `6`), confirming it's genuinely `2`, not something greedy simply failed to find by coincidence.
4. **Break it, on purpose.** Construct a *different* three-denomination set (not `[4 3 1]`) where greedy also fails, and find a specific target amount that exposes it.
5. **Generalize.** State, in your own words, what property standard U.S. coin denominations (`[25 10 5 1]`, or including `[25 10 5 1]` plus `50`) seem to have that `[4 3 1]` lacks, without proving it formally — Lesson 118 provides the tool to prove it.
6. **Reconstruct.** Close this lesson. From memory, explain why `greedy-coins` succeeding on one denomination set says nothing about whether it will succeed on another, and name the two proof techniques this lesson pointed toward.

## Definition of Done

- [ ] You can implement a greedy algorithm and explain precisely what "locally optimal" means for it.
- [ ] You can explain why a greedy algorithm's success on one input says nothing about its correctness in general.
- [ ] You can state what a correctness proof for a greedy algorithm actually has to show.
- [ ] You completed Exercise 3 and confirmed `2` coins is genuinely optimal for `[4 3 1]` targeting `6`, by exhaustive check.
- [ ] You completed Exercise 4 and constructed a new denomination set where greedy fails.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm 2 coins is optimal for [4 3 1] target 6 via exhaustive check; construct a second denomination set where greedy fails"` — not just `"lesson 117 exercise"`.

---

**Next lesson:** Lesson 118, *Exchange Arguments*, builds the actual proof technique this lesson only named — showing precisely how to prove a greedy choice can always be exchanged into some optimal solution without making it worse, the real justification standard U.S. coin denominations satisfy and `[4 3 1]` does not.
