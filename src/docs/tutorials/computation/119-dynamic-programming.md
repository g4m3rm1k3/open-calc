# Lesson 119: Dynamic Programming

**What you will build**: By the end of this lesson you'll formalize Lesson 39's early, informal introduction to dynamic programming into a repeatable four-part recipe — state, transition, base case, order — and use it to finally solve Lesson 117's own `[4 3 1]` coin-change problem *correctly*, fixing greedy's wrong answer of `3` coins with a provably optimal `2`.

**What you need to know first**: Lesson 39's dynamic programming and bottom-up vocabulary; Lesson 117's `greedy-coins` and its `[4 3 1]` failure; Lesson 118's exchange argument, for direct contrast in proof style.

**Terms introduced in this lesson**:

- **state** — the specific, minimal information needed to describe one subproblem, precisely enough that its answer never has to be recomputed once found. *Why it matters*: Lesson 39's `fib-dp` had state "which Fibonacci index" — this lesson names the concept generally, since every dynamic-programming problem needs its own answer to "what, exactly, is a subproblem here?"
- **transition** — the rule computing a state's answer from the answers of smaller, already-solved states. *Why it matters*: Lesson 39's `fib(i) = fib(i-1) + fib(i-2)` was a transition; this lesson names the general shape every dynamic-programming problem's own transition must take.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94) and `<`/`<=` (Lesson 2), each already covered.

---

## Concept Unit: The Four-Part Recipe

### The Problem

Lesson 39 built `fib-dp` — a specific bottom-up solution to a specific problem. Does building a *different* dynamic-programming solution to a *different* problem require reinventing the approach from scratch each time, or is there a repeatable set of questions that apply to any problem this technique fits?

### Introduce the concept in isolation

Every dynamic-programming solution answers four questions, in this order:

1. **State** — what, precisely, does a subproblem need to specify? (Lesson 39's `fib-dp`: a single number, "which index.")
2. **Transition** — how is a state's answer computed from smaller, already-solved states' answers? (`fib-dp`'s: the sum of the two immediately smaller states.)
3. **Base case** — which states are known directly, without needing any transition? (`fib-dp`'s: index `0` and `1`.)
4. **Order** — in what sequence must states be computed so every transition only ever refers to already-solved states? (`fib-dp`'s: strictly increasing index.)

This is precisely Lesson 39's **dynamic programming** and **bottom-up** vocabulary, generalized: any problem where these four questions have clean answers can be solved this way.

### Discard the throwaway example

Not applicable — this unit organizes already-built vocabulary (Lesson 39) into a general recipe, introducing no new code.

### CS Lens

This four-part recipe is Lesson 16's loop invariant (initialization, maintenance, termination) wearing new names for a different purpose: base case is initialization, transition is maintenance (each new state trusts only already-proven-correct smaller ones), and order is what guarantees maintenance is even possible — a state's transition can never run before the smaller states it depends on.

### SE Lens

Naming these four parts explicitly, before writing any code, is Lesson 110's specification-first discipline applied to dynamic programming specifically: state and transition together *are* the specification of what each subproblem's answer must satisfy, checkable before an implementation exists at all.

---

## Concept Unit: Applying the Recipe to Coin Change

### The Problem

Lesson 117's `greedy-coins` gave the wrong answer for `[4 3 1]` targeting `6` — `3` coins instead of the true minimum, `2`. Can this lesson's four-part recipe solve the identical problem correctly, by considering every denomination's consequences rather than committing to one greedily?

### Introduce the concept in isolation

**State**: `dp[a]` — the minimum number of coins needed to make amount `a`, for every `a` from `0` to the target. **Base case**: `dp[0] = 0`. **Transition**: `dp[a] = 1 + \min(dp[a-d])`, over every denomination `d \leq a`. **Order**: increasing `a`, since `dp[a]` only ever depends on `dp` at *smaller* amounts.

```clojure
(defn min-of-two [a b] (if (< a b) a b))

(defn dp-best-for-amount [dp denominations a i best]
  (if (>= i (count denominations))
    best
    (if (<= (get denominations i) a)
      (dp-best-for-amount dp denominations a (+ i 1) (min-of-two best (+ 1 (get dp (- a (get denominations i))))))
      (dp-best-for-amount dp denominations a (+ i 1) best))))

(defn dp-fill-from [dp denominations a target]
  (if (> a target)
    dp
    (dp-fill-from (assoc dp a (dp-best-for-amount dp denominations a 0 (+ a 1))) denominations (+ a 1) target)))

(defn dp-coins [target denominations]
  (get (dp-fill-from [0] denominations 1 target) target))
```

```
user=> (dp-coins 6 [4 3 1])
2
```

`dp` fills in order — `dp[0]=0`, then `dp[1]=1`, `dp[2]=2`, `dp[3]=1$ (a single `3`-coin beats three `1`s), `dp[4]=1$ (a single `4`), `dp[5]=2` (`4+1`), and finally `dp[6]$: trying `4$ gives `1+dp[2]=1+2=3`; trying `3` gives `1+dp[3]=1+1=2`; trying `1` gives `1+dp[5]=1+2=3` — the minimum, `2`, correctly found by considering *every* denomination's consequence, not just the largest one that fits.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified step by step against the trace above.

### Project Change

- **Reference Source**: This lesson deliberately does *not* reuse Lesson 39's own `loop`/`recur` implementation — `loop`'s binding vector is structurally a `let`, which this series' own no-`let` convention rules out. `dp-fill-from` achieves the identical bottom-up ordering using recursion with an accumulator instead, this series' own established workaround throughout.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dp-coins [target denominations]
  (get (dp-fill-from [0] denominations 1 target) target))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(+ a 1)`, as `best`'s starting value** — first appearance of this specific sentinel choice: no valid solution ever needs more than `a` coins (using only `1`s, if `1` is a denomination), so `a+1` safely represents "no solution found yet" without needing a separate "infinity" value.
- **`(<= (get denominations i) a)`** — reappearing comparison (Lesson 117): unlike greedy, this check doesn't *commit* to taking the denomination — it only decides whether trying it is even possible.
- **`(min-of-two best (+ 1 (get dp (- a (get denominations i)))))`** — first appearance: every fitting denomination's own consequence — one more coin than whatever `dp` already proved optimal for the *remaining* amount — is compared, and only the smallest survives.
- **`(assoc dp a (dp-best-for-amount ...))`** — reappearing `assoc`-as-append (Lesson 94): each new state is added to `dp` only after being fully computed, immediately available to every larger state's own transition.

### CS Lens

This is Lesson 118's exchange argument's own diagnosis, turned into a fix: the exchange argument failed for `[4 3 1]` because no optimal solution contains greedy's first choice — dynamic programming never *makes* a first choice to be wrong about; it computes every denomination's true consequence via already-solved smaller states and picks the best one, directly.

### SE Lens

`dp-coins`'s cost is `O(\text{target} \times \text{number of denominations})` — genuinely more work than `greedy-coins`'s single pass, and worth it specifically because greedy's answer can be *wrong*, not merely slower; Lesson 117's own SE lens already named this exact tradeoff as the reason to prefer a provably correct approach over an unproven shortcut.

### Connection to the previous unit

The previous unit stated the four-part recipe abstractly; this unit is a complete, verified instance of it, solving the exact problem Lesson 117 left broken.

---

## Concept Unit: Why Dynamic Programming Succeeds Where Greedy Fails

### The Problem

Greedy commits to one choice per step, never reconsidering it. Dynamic programming, this lesson's second unit showed, tries every choice's consequence. Is that difference the entire reason DP succeeds on `[4 3 1]`, or is something deeper going on?

### Introduce the concept in isolation

Greedy's fatal assumption, exposed precisely by Lesson 118's exchange argument, is that the *locally* best choice (the largest fitting denomination) is always *safe* — never part of a strictly worse overall solution than some alternative. Dynamic programming makes no such assumption at all: `dp-best-for-amount` computes `1 + dp[a-d]` for *every* denomination `d`, using `dp`'s own already-proven-optimal answers for every smaller amount, and takes the genuine minimum. Correctness here doesn't rest on any structural property of the denominations the way greedy's would have to — it rests only on **every smaller state already being correct**, guaranteed by this lesson's own **order** requirement.

### Discard the throwaway example

Not applicable — a direct comparison of already-built code (Lesson 117's `greedy-coins`, this lesson's `dp-coins`), not new code.

### CS Lens

This is the general resolution to Lesson 117's own cliffhanger: a greedy algorithm is correct exactly when its local choice is provably exchangeable into every optimal solution (Lesson 118); dynamic programming sidesteps needing that proof entirely, at the cost of considering every choice instead of committing to one — a direct, general tradeoff between proof effort and computational effort.

### SE Lens

Choosing between greedy and dynamic programming for a new problem is now a real, answerable question: does an exchange argument (Lesson 118) actually go through for this problem's structure? If yes, greedy is both correct *and* cheaper — worth using. If the exchange argument's first step already fails, the way it did for `[4 3 1]`, dynamic programming is the honest fallback, more expensive but correct by construction rather than by hope.

### Connection to the previous unit

The previous unit built a correct solution; this unit is why it's correct in general, not just on this one example — the same structural reasoning Lesson 118 used to explain greedy's *failure* now explains dynamic programming's *success*, from the opposite direction.

---

## Connect the Pieces

All three approaches to coin change, side by side, on the exact problem that started this arc:

```clojure
(println "Greedy, [4 3 1], target 6:" (greedy-coins 6 [4 3 1]) "coins (WRONG -- not optimal)")
(println "Dynamic programming, [4 3 1], target 6:" (dp-coins 6 [4 3 1]) "coins (correct)")
(println "Dynamic programming, standard coins, target 41:" (dp-coins 41 [25 10 5 1]) "coins")
```

```
Greedy, [4 3 1], target 6: 3 coins (WRONG -- not optimal)
Dynamic programming, [4 3 1], target 6: 2 coins (correct)
Dynamic programming, standard coins, target 41: 4 coins
```

Dynamic programming matches greedy's already-correct answer on standard denominations and *fixes* greedy's wrong answer on `[4 3 1]` — the exact resolution Lesson 117 promised and Lesson 118 explained the reason for.

## What Breaks Without This

Suppose `dp-best-for-amount` only tried the *largest* fitting denomination, the way greedy does, instead of every one:

```clojure
(defn broken-dp-best [dp denominations a]
  (+ 1 (get dp (- a (get denominations 0)))))
```

This would reproduce greedy's own exact mistake — always trusting the first (largest) denomination's consequence without comparing it to any alternative — losing the entire property that makes dynamic programming correct: considering *every* choice via already-solved smaller states, not just the one that looks best without checking further. `dp[6]` would come out to `1 + dp[2] = 1 + 2 = 3`, the identical wrong answer greedy already gave, because "try only the biggest option" is greedy, regardless of which lesson's code happens to compute it.

## Exercises

1. **Trace.** By hand, continue this lesson's own `dp` trace one step further: compute `dp[7]` for `[4 3 1]`, showing every denomination's candidate value.
2. **Predict.** Before checking, predict `(dp-coins 6 [4 3])` (denomination `1` removed entirely). Does a solution exist? Trace `dp-best-for-amount` at `a=1` to check what happens when no denomination fits.
3. **Verify.** Confirm `(dp-coins 41 [25 10 5 1])` equals `4`, matching Lesson 117's own greedy result, by tracing at least the final few states.
4. **Break it, on purpose.** Run `broken-dp-best` (assuming denominations sorted largest-first, matching Lesson 117's own convention) on `[4 3 1]` targeting `6`, and confirm it reproduces greedy's wrong answer of `3`.
5. **Generalize.** State this lesson's four-part recipe (state, transition, base case, order) for Lesson 111's own "find the largest" problem, even though a full DP solution isn't the natural fit there — which part, if any, breaks down?
6. **Reconstruct.** Close this lesson. From memory, explain why dynamic programming doesn't need an exchange-argument-style proof the way greedy does, and state the four-part recipe without looking back.

## Definition of Done

- [ ] You can state the four-part dynamic-programming recipe from memory.
- [ ] You can implement `dp-coins` and explain why its order (increasing amount) is required, not incidental.
- [ ] You can explain why dynamic programming's correctness doesn't depend on the problem's structure the way greedy's does.
- [ ] You completed Exercise 3 and confirmed dynamic programming matches greedy on standard denominations.
- [ ] You completed Exercise 4 and reproduced greedy's exact failure using a deliberately-weakened DP transition.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and reproduced — for example, `"Confirm dp-coins matches greedy on standard denominations (4 coins for 41); reproduce greedy's [4 3 1] failure via broken-dp-best"` — not just `"lesson 119 exercise"`.

---

**Next lesson:** Lesson 120, *Longest Common Subsequence*, works through a complete, classic dynamic-programming derivation on a genuinely two-dimensional state — comparing two entire sequences against each other — applying this lesson's identical four-part recipe to a state shape more complex than a single number.
