# Lesson 97: Balanced Trees

**What you will build**: By the end of this lesson you'll formally characterize the gap Lesson 92's closing section only demonstrated by one example — how far a BST's actual depth can drift from Lesson 91's theoretical minimum — connect that gap directly to insertion order using Lesson 78's randomized algorithms and Lesson 75's expected value, and see precisely why relying on "insertion order is usually fine" isn't good enough to build on.

**What you need to know first**: Lesson 92's BST and its degenerate-tree example; Lesson 91's `\lceil \log_2(n+1) \rceil` minimum-depth bound; Lesson 75's expected value; Lesson 78's randomized algorithms and `shuffle`.

**Terms introduced in this lesson**: None new — this lesson connects and applies vocabulary already built (depth, expected value, worst case) rather than naming anything new.

**Objects and methods used**: None new. This lesson reuses `shuffle` (Lesson 78), and Lesson 92's `bst-insert`/`bst-depth` (the latter via Lesson 93's `bst-depth`-style helper), each already covered.

---

## Concept Unit: How Far Depth Can Drift From the Minimum

### The Problem

Lesson 91 established that `n` sorted values need at least `\lceil \log_2(n+1) \rceil` comparisons to search — the minimum possible depth for a tree holding `n` values. Lesson 92's closing section showed one concrete case where a BST's *actual* depth was far worse: `5` values, inserted in sorted order, produced depth `5`, not `3`. Was that example a rare fluke, or the actual worst case a BST can reach?

### Introduce the concept in isolation

For `n` values, a BST's depth ranges between two extremes:

- **Minimum**: `\lceil \log_2(n+1) \rceil` — Lesson 91's own bound, reached when every insertion lands as close to the middle of the remaining range as possible, keeping both subtrees close to equal size at every level.
- **Maximum**: `n` — reached exactly when every new value is either larger than everything already present, or smaller than everything already present, so each insertion can only ever extend one single chain, never branch it. Lesson 92's sorted-order example (`10, 20, 30, 40, 50`, each one larger than the last) is exactly this case, and it's not special to sorted order specifically — strictly *decreasing* insertion order produces the identical depth-`n` chain, leaning the other direction.

Every value between those two extremes is reachable by *some* insertion order — depth isn't fixed by *which* `n` values are stored, only by the *order* they arrived in.

### Discard the throwaway example

Not applicable — this is a direct generalization of Lesson 92's own already-run example, not new code.

### CS Lens

This minimum-to-maximum range is the same shape Lesson 53's amortized analysis warned about trusting a single worst-case number without checking how it actually arises: `O(n)` and `O(\log n)` are both *true* facts about a BST's depth, for different insertion orders — quoting either one alone, without saying which order it assumes, is an incomplete claim.

### SE Lens

Nothing in `bst-insert` (Lesson 92) or `bst-search` (Lesson 92, proven in Lesson 93) ever checks or cares which end of this range the tree currently sits at — both remain fully correct at every depth from `\lceil \log_2(n+1) \rceil` to `n`. Correctness and speed are two entirely separate guarantees for a BST; Lesson 93 proved the first unconditionally, and this lesson is about the second, which isn't unconditional at all.

---

## Concept Unit: Why Random Insertion Order Tends to Stay Shallow

### The Problem

Lesson 92's degenerate example needed a very specific insertion order — fully sorted — to reach the worst case. Most real insertion orders aren't perfectly sorted. Does a *typical*, unremarkable insertion order tend to land near the minimum depth, near the maximum, or somewhere unpredictable?

### Introduce the concept in isolation

Build a BST from the same seven values Lessons 91–96 have used throughout, in one shuffled order:

```clojure
(def shuffled-order [40 10 60 30 70 20 50])
(def random-bst (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 40) 10) 60) 30) 70) 20) 50))
```

```
user=> (bst-depth random-bst)
4
```

Minimum possible for `7` values: `\lceil \log_2 8 \rceil = 3`. Maximum possible: `7`. This particular order landed at `4` — noticeably closer to the minimum than the maximum, without hitting the minimum exactly. This isn't a coincidence specific to this one order: Lesson 78's randomized algorithms already established that a randomly chosen input's *expected* behavior can be analyzed directly, using Lesson 75's expected value — and the same analysis, applied to BST insertion order, is a well-established result: a BST built from a uniformly random insertion order (produced by Lesson 78's own `shuffle`) has **expected depth `O(\log n)`**, not `O(n)` — the degenerate case exists, but it's one specific order out of an enormous number of possible orders, not a typical one.

### Discard the throwaway example

Not applicable — `random-bst` is a real tree, and its depth is a genuine, checkable fact.

### CS Lens

This is Lesson 78's own central idea, reapplied: a randomized algorithm's *worst case* can remain bad while its *expected case*, averaged over every possible random choice, stays good — Lesson 81's Monte Carlo algorithms accepted exactly this tradeoff deliberately, and an unbalanced BST's depth is the identical shape of claim, just arising from insertion order instead of a randomized algorithm's own internal coin flips.

### SE Lens

"Expected depth `O(\log n)`" is a genuinely weaker guarantee than Lesson 93's unconditional correctness proof — it's a statement about *most* insertion orders, not *every* insertion order, the same distinction Lesson 15's induction drew between "checked for many cases" and "proven for every case." Trusting it requires trusting that insertion order really is random, or at least unpredictable — a real assumption, not a guarantee, and precisely the assumption the next unit shows is often false in practice.

### Connection to the previous unit

The previous unit showed depth can range all the way from the minimum to `n`; this unit shows *most* points in that range, reached by *most* insertion orders, actually cluster close to the minimum end — the maximum is reachable, but not typical.

---

## Concept Unit: Why "Usually Fine" Isn't Good Enough

### The Problem

If random insertion order usually stays shallow, why would this series ever need anything more elaborate than Lesson 92's plain BST?

### Introduce the concept in isolation

Real insertion sequences are frequently *not* random, in ways that are easy to miss:

- **Already-sorted input** — loading a BST from a file that happens to already be sorted (a common, unremarkable data format), or a user entering values in increasing order by habit, reproduces Lesson 92's exact worst case, not a random one.
- **Timestamped data** — inserting events, log entries, or transactions as they occur means inserting them in time order — nearly sorted, by the very nature of when the data is produced, not by any unusual or adversarial intent.
- **An adversary who knows the insertion algorithm** — in a system where insertion order is influenced by untrusted input (a public API accepting values to store), someone who wants to degrade performance can simply submit sorted or reverse-sorted data on purpose, reliably forcing the worst case every time.

None of these require bad luck or malicious sophistication — the second one, especially, is an entirely ordinary way real data arrives.

### Discard the throwaway example

Not applicable — a survey of realistic scenarios, not new code.

### CS Lens

This is the same gap between "usually" and "always" that made Lesson 93's formal proof worth doing in the first place, rather than trusting Lesson 92's one successful example: an expected-case argument, however well-founded, is not a substitute for a guarantee that holds under every possible input, especially once an adversary — or just ordinary, structured real-world data — is allowed to choose that input.

### SE Lens

A structure whose performance depends on trusting the *order* data happens to arrive in is a real, specific risk to carry into a production system — not a hypothetical one, since sorted or near-sorted input is common, not rare. Lesson 98 (*AVL Trees*) and Lesson 99 (*Red-Black Trees*) exist specifically to remove this dependency: both add a mechanism that actively restores balance after every insertion, guaranteeing `O(\log n)` depth for *every* insertion order, not just the typical ones this lesson's second unit showed are common.

### Connection to the previous unit

The previous unit showed random order tends to behave well; this unit shows real-world insertion order frequently isn't random in the specific way that matters — motivating the next two lessons' actual solution, rather than resting on this lesson's own, weaker, expected-case argument.

---

## Connect the Pieces

The full range this lesson established, on the same seven values used throughout:

```clojure
(println "Minimum possible depth:" 3)
(println "Random order depth:" (bst-depth random-bst))
(println "Sorted-order (worst case) depth:" 7)
```

```
Minimum possible depth: 3
Random order depth: 4
Sorted-order (worst case) depth: 7
```

The same seven values, three different insertion orders, three different depths — nothing about the *values themselves* determines a BST's speed; only the order they arrived in does, which is exactly why a structure that doesn't depend on that order at all is worth building.

## What Breaks Without This

Suppose a system stored user accounts in a BST keyed by account-creation timestamp, trusting Lesson 92's plain BST because "insertion order is basically random." It isn't — accounts are created in time order, by definition, meaning every single insertion adds the current largest timestamp. This reproduces Lesson 92's exact sorted-order degenerate case, permanently and by construction, not occasionally: the tree's depth grows to equal the number of accounts, and every lookup degrades to Lesson 85's `O(n)` linked-list cost, silently, with nothing in `bst-insert` or `bst-search` ever signaling that anything is wrong — both remain fully correct, exactly as Lesson 93 proved, while being far slower than anyone relying on Lesson 91's `O(\log n)` expectation would have assumed.

## Exercises

1. **Trace.** By hand, trace `bst-depth` on `random-bst`'s own five internal nodes, confirming the depth-`4` result this lesson computed.
2. **Predict.** Before checking, predict whether the insertion order `20, 40, 10, 60, 30, 70, 50` (a different shuffle of the same seven values) produces a shallower, deeper, or equal depth compared to this lesson's `4`. Build it and check.
3. **Verify.** Using `(shuffle [10 20 30 40 50 60 70])` in your own REPL, build five different random BSTs and record each one's depth. How many landed at the minimum, `3`?
4. **Break it, on purpose.** Construct an insertion order for these same seven values that is *not* fully sorted, but still produces the worst-case depth of `7`. (Hint: Concept Unit 1 named a second way to reach it.)
5. **Generalize.** For `n = 15` values (four full levels if balanced), state the minimum depth (Lesson 91's formula) and the maximum depth, without building the tree.
6. **Reconstruct.** Close this lesson. From memory, explain why "expected depth `O(\log n)`" is a weaker guarantee than Lesson 93's correctness proof, and name two realistic ways insertion order ends up non-random.

## Definition of Done

- [ ] You can state a BST's minimum and maximum possible depth for `n` values, and what insertion pattern reaches each.
- [ ] You can explain why random insertion order tends toward shallow trees, citing Lesson 75's expected value.
- [ ] You can name at least two realistic scenarios where insertion order is not random in practice.
- [ ] You completed Exercise 3 and recorded real depths from several random insertion orders.
- [ ] You completed Exercise 4 and found a non-sorted worst-case insertion order.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Record BST depths across 5 random shuffles of the same 7 values; construct a non-sorted worst-case insertion order"` — not just `"lesson 97 exercise"`.

---

**Next lesson:** Lesson 98, *AVL Trees*, introduces this series' first structure that actively restores balance after every insertion, guaranteeing this lesson's minimum-depth end of the range for every insertion order — not just the typical ones.
