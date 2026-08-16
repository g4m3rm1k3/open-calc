# Lesson 118: Exchange Arguments

**What you will build**: By the end of this lesson you'll build a greedy algorithm for a genuinely different problem — activity selection — and prove it optimal using an **exchange argument**, the standard technique Lesson 117 only named, then apply that same technique backward to explain precisely, structurally, why it succeeds for standard coin denominations and fails for `[4 3 1]`.

**What you need to know first**: Lesson 117's greedy strategy and its coin-change counterexample; Lesson 15's induction; Lesson 93's structural induction, for this lesson's inductive proof shape.

**Terms introduced in this lesson**:

- **exchange argument** — a proof technique showing a greedy algorithm is optimal by taking an arbitrary optimal solution and showing it can be transformed, one step at a time, into the greedy solution without ever making it worse. *Why it matters*: this is how "greedy seems to work" becomes "greedy is provably optimal" — the exact proof obligation Lesson 117 left unfulfilled.

**Objects and methods used**: None new. This lesson reuses `get` and `>=` (Lesson 84, Lesson 2), each already covered.

---

## Concept Unit: Greedy Activity Selection

### The Problem

Given a set of activities, each with a start and end time, select the *maximum number* of non-overlapping activities — a scheduling problem, not a counting problem. Does "always pick whichever compatible activity finishes earliest" — greedy by finish time — actually maximize the count?

### Introduce the concept in isolation

```clojure
(defn activities-compatible? [prev-end activity]
  (>= (get activity 0) prev-end))

(defn select-activities-from [activities i prev-end selected]
  (if (>= i (count activities))
    selected
    (if (activities-compatible? prev-end (get activities i))
      (select-activities-from activities (+ i 1) (get (get activities i) 1) (+ selected 1))
      (select-activities-from activities (+ i 1) prev-end selected))))

(defn select-activities [activities]
  (select-activities-from activities 1 (get (get activities 0) 1) 1))
```

```
user=> (select-activities [[1 3] [2 5] [4 6] [6 8] [5 9]])
3
```

Activities are given sorted by finish time already. The first, `[1 3]`, is always taken (nothing to conflict with yet). `[2 5]` starts before `[1 3]` ends (`2 < 3`) — incompatible, skipped. `[4 6]` starts after (`4 \geq 3`) — taken, `prev-end` becomes `6`. `[6 8]` starts exactly when the previous ends (`6 \geq 6`, compatible) — taken. `[5 9]` starts before `8` — skipped. Three activities selected: `[1 3]`, `[4 6]`, `[6 8]`.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of "always take the earliest-finishing compatible activity," using Lesson 91's compute-once-pass-to-a-helper pattern.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn select-activities [activities]
  (select-activities-from activities 1 (get (get activities 0) 1) 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get activity 0)`, `(get activity 1)`** — reappearing `get` (Lesson 84): each activity is Lesson 85's vector-as-pair, `[start end]`.
- **`(>= (get activity 0) prev-end)`** — first appearance of this specific compatibility test: an activity is compatible with everything already chosen exactly when it starts no earlier than the last chosen activity ends.
- **`(select-activities-from activities 1 (get (get activities 0) 1) 1)`** — first appearance: the *first* activity in finish-time order is always taken unconditionally, seeding both `prev-end` and `selected`.

### CS Lens

Unlike Lesson 117's `greedy-coins`, this greedy strategy's "locally best" choice — earliest finish time — leaves the *most possible room* for everything scheduled afterward, a structural property this lesson's next unit turns into an actual proof rather than only an intuition.

### SE Lens

`select-activities` never reconsiders a skipped activity, exactly Lesson 117's own greedy discipline — the entire question this lesson answers is whether that discipline is safe *here*, the way it wasn't for `[4 3 1]`.

---

## Concept Unit: The Exchange Argument, Proven

### The Problem

Can "greedy by earliest finish time is optimal for activity selection" be proven, not just observed on one example?

### Introduce the concept in isolation

**Claim**: greedy's selection has the maximum possible size, for any set of activities.

**Proof**, by induction (Lesson 15) on the number of activities remaining to schedule:

Let `OPT = \{a_1, a_2, \ldots, a_k\}` be *any* optimal solution, sorted by finish time, and let `g_1` be greedy's own first pick. Since `g_1` is defined as the activity with the *earliest* finish time among *all* activities, `\text{finish}(g_1) \leq \text{finish}(a_1)`.

**The exchange**: replace `a_1` with `g_1` in `OPT`, forming `OPT' = \{g_1, a_2, \ldots, a_k\}`. Every activity `a_2, \ldots, a_k` was compatible with `a_1` (started at or after `\text{finish}(a_1)`); since `\text{finish}(g_1) \leq \text{finish}(a_1)`, every one of them is still compatible with `g_1` too. `OPT'` is a valid solution, and it has the *identical size* `k` as `OPT` — the exchange cost nothing.

**Inductive step**: `OPT'` now starts with greedy's own first choice. The *remaining* problem — activities compatible with `g_1$, needing `k-1` more selections — is a smaller instance of the identical problem, and greedy's *second* choice is, by the identical argument, exchangeable into `OPT'` without cost. Repeating this `k` times transforms `OPT` entirely into greedy's own solution, still size `k`.

**Conclusion**: greedy's solution has size `k`, exactly `OPT`'s size — and since `OPT` was *defined* as optimal, greedy is optimal too. ∎

### Discard the throwaway example

Not applicable — this is a formal proof, using already-established code as its subject rather than introducing new code.

### Mechanical walkthrough — how the proof works, step by step

1. **`\text{finish}(g_1) \leq \text{finish}(a_1)`** — the one fact licensing the entire exchange: true by `g_1`'s own definition, not assumed.
2. **The exchange preserves compatibility** — a hard concept reappearing: this is exactly Lesson 6's substitution, applied to a scheduling constraint rather than an algebraic equality — replacing `a_1` with something that finishes no later only ever *loosens* constraints on what comes after, never tightens them.
3. **The exchange preserves size** — `OPT'` has `k` elements, same as `OPT` — nothing was added or removed, only swapped.
4. **Induction on the remaining problem** — reappearing (Lesson 15, Lesson 93's structural induction): the identical argument, applied to a strictly smaller remaining problem, repeated until greedy's entire solution has replaced `OPT`'s.

### CS Lens

This proof shape — exchange the first element for free, then induct on what remains — is the template every exchange argument in this series (and beyond it) follows: find one fact that makes the very first greedy choice provably harmless, then let induction carry that harmlessness through every later choice.

### SE Lens

This proof never mentioned `select-activities`'s actual code at all — it reasoned entirely about *what any optimal solution must look like*, then showed greedy's choices are always exchangeable into one. This is precisely Lesson 109's own correctness-relative-to-a-specification discipline, applied at its most rigorous: the algorithm's implementation was never the subject of the proof, its *behavior relative to the problem's own structure* was.

### Connection to the previous unit

The previous unit built and ran a greedy algorithm; this unit proves it optimal using the technique Lesson 117 only named — not by testing more examples, but by showing every possible optimal solution can be reshaped into greedy's own answer without loss.

---

## Concept Unit: Why the Argument Succeeds for Coins and Fails for `[4 3 1]`

### The Problem

Lesson 117's `greedy-coins` worked for standard denominations and failed for `[4 3 1]`. Can this lesson's exchange-argument technique explain *why*, structurally, rather than only observing the difference?

### Introduce the concept in isolation

The exchange argument for coin change would need: *some* optimal solution for the target amount can always be transformed to include greedy's first choice (the largest fitting denomination) without using more coins. For standard U.S. denominations, this holds — a mathematical property of how each denomination relates to smaller ones makes taking the largest coin never cost an extra coin later, though proving that fully is beyond this lesson's own scope.

For `[4 3 1]$ targeting `6`: greedy's first choice is `4`. The exchange argument would need *some* optimal solution using `2` coins that includes a `4`. But the only `2$-coin solution is `\{3, 3\}$ — it doesn't contain a `4` at all, and no `2`-coin solution can, since `4 + 4 = 8 > 6` and `4 + 1 = 5 \neq 6`. **There is no optimal solution to exchange greedy's first choice into** — the exchange argument's very first step, which succeeded unconditionally for activity selection, simply has nothing to work with here.

### Discard the throwaway example

Not applicable — a direct structural explanation of Lesson 117's already-demonstrated failure, not new code.

### CS Lens

This is the precise, structural reason greedy fails for `[4 3 1]$: it isn't that greedy "got unlucky" — it's that the very first exchange step this lesson's proof technique requires is *false* for this problem. The exchange argument doesn't just prove greedy correct when it succeeds; failing to construct one is itself real evidence — not proof, but a strong signal — that greedy might not be optimal at all.

### SE Lens

This is the practical payoff of Lesson 117's warning made concrete: rather than testing a greedy algorithm against more and more examples hoping none of them fail, *attempting* to build its exchange argument directly surfaces the exact reason `[4 3 1]$ breaks it — no optimal solution contains greedy's first pick — often before ever needing to find a failing test case by trial and error.

### Connection to the previous unit

The previous unit built a complete exchange-argument proof where it succeeds; this unit applies the identical technique to Lesson 117's earlier failure, showing the *same* proof attempt breaks down at its very first step, exactly where the actual problem lies.

---

## Connect the Pieces

Both problems, and what the exchange argument says about each:

```
Activity selection, greedy by earliest finish:
  Exchange argument: succeeds -- proven optimal (this lesson).

Coin change, [25 10 5 1], greedy by largest denomination:
  Exchange argument: succeeds for standard denominations (asserted, not fully derived here).

Coin change, [4 3 1], greedy by largest denomination:
  Exchange argument: fails at its first step -- no optimal solution contains a 4.
```

One proof technique, applied honestly to three cases — two where it succeeds, one where its own failure is the exact, structural reason greedy itself fails.

## What Breaks Without This

Suppose someone accepted `select-activities` as correct purely because it agreed with hand-checked intuition on a few examples, the same trap Lesson 117's `greedy-coins` fell into with standard coins before `[4 3 1]$ exposed it. Without this lesson's actual exchange-argument proof, there would be no way to distinguish "this greedy algorithm is provably optimal" from "this greedy algorithm hasn't been tested on the input that breaks it yet" — exactly the gap between Lesson 117's two demonstrated cases, now closed for activity selection specifically, by an argument that covers *every* possible input, not just the ones already tried.

## Exercises

1. **Trace.** By hand, apply this lesson's exchange argument to `select-activities`'s own second choice (`[4 6]`), showing it can be exchanged into whatever remains of an optimal solution after the first exchange.
2. **Predict.** Before checking, predict whether an exchange argument for "greedy by *shortest duration*" (rather than earliest finish) would succeed for activity selection. Construct a small counterexample if you believe it fails.
3. **Verify.** Confirm, directly, that no `2`-coin combination of `\{4, 3, 1\}$ other than `\{3, 3\}` sums to `6`, completing this lesson's own claim that no optimal solution contains a `4`.
4. **Break it, on purpose.** Find a *third* denomination set where greedy's first choice *can* be exchanged into an optimal solution but a *later* greedy choice cannot — showing the exchange argument's inductive step, not just its first step, can be where it actually fails.
5. **Generalize.** State, in your own words, the general shape every exchange argument in this lesson followed: what has to be true about greedy's first choice, and what induction does with the rest.
6. **Reconstruct.** Close this lesson. From memory, reconstruct the activity-selection exchange argument's four steps, and explain precisely why the identical technique fails for `[4 3 1]$.

## Definition of Done

- [ ] You can implement `select-activities` and explain why sorting by finish time, specifically, is what greedy uses.
- [ ] You can reconstruct the exchange argument proving `select-activities` optimal, from memory.
- [ ] You can explain, structurally, why the exchange argument fails for `[4 3 1]$ — not just that it fails, but where.
- [ ] You completed Exercise 3 and verified no valid `4`-containing `2$-coin solution exists for target `6`.
- [ ] You completed Exercise 4 and found a denomination set where the argument's inductive step, not its first step, fails.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you verified and found — for example, `"Verify no 4-containing 2-coin solution exists for [4 3 1] target 6; find a denomination set where the exchange argument's inductive step fails"` — not just `"lesson 118 exercise"`.

---

**Next lesson:** Lesson 119, *Dynamic Programming*, takes on exactly the problems this lesson's exchange argument cannot rescue — where no single greedy choice is ever provably safe — deriving a strategy that considers every relevant choice's consequences directly, rather than committing to one irrevocably.
