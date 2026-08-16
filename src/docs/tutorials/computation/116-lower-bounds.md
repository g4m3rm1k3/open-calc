# Lesson 116: Lower Bounds

**What you will build**: By the end of this lesson you'll prove — not merely observe — that no comparison-based sorting algorithm can ever beat `O(n \log n)` in the worst case, establishing that Lesson 113's merge sort isn't just *fast*, it's *asymptotically optimal*, and precisely what "changing assumptions" would have to mean for any algorithm to do better.

**What you need to know first**: Lesson 113's merge sort and its `O(n \log n)` cost; Lesson 61's permutations; Lesson 66's pigeonhole principle; Lesson 43's logarithms.

**Terms introduced in this lesson**:

- **lower bound** — a proven limit on how fast *any* correct algorithm for a problem could possibly be, regardless of how cleverly it's written. *Why it matters*: every algorithm this series has built so far was measured by its own cost; a lower bound measures the *problem itself*, answering "could some other algorithm do better" without having to imagine or rule out every possible algorithm one at a time.
- **decision tree** (for this lesson's purpose) — a binary tree modeling every possible sequence of comparisons a comparison-based algorithm could make, where each leaf corresponds to one possible final answer. *Why it matters*: turns "how many comparisons does sorting need" into a question about tree depth, exactly the vocabulary Lesson 94 and Lesson 30 already built.

**Objects and methods used**: None new. This lesson is a formal proof, connecting already-established combinatorics and tree vocabulary rather than introducing new code.

---

## Concept Unit: Modeling Every Possible Algorithm at Once

### The Problem

Lesson 113's merge sort and Lesson 114's quick sort both cost `O(n \log n)` in their typical or guaranteed cases. Is there some entirely different comparison-based sorting algorithm, not yet imagined, that could do fundamentally better — and how could that question ever be answered without checking every possible algorithm one at a time?

### Introduce the concept in isolation

Any **comparison-based** sorting algorithm — one that only ever learns about its input by comparing pairs of elements, exactly what `merge-sort` and `quick-sort` both do — can be modeled as a **decision tree**: each internal node is one comparison; the branch taken depends on its outcome; each leaf is the final sorted order the algorithm outputs along that path. For the algorithm to be *correct* on every possible input of `n` distinct values, this tree must have at least one leaf for every one of the `n!` possible orderings (Lesson 61's own permutations) those values could start in — if two genuinely different starting orders led to the *same* leaf, the algorithm couldn't distinguish them, and would sort at least one of them wrong.

### Discard the throwaway example

Not applicable — this unit builds a formal model, not runnable code.

### CS Lens

This is Lesson 66's pigeonhole principle, applied in reverse: rather than showing two things *must* collide because there are too few destinations, this argument requires *enough* destinations (leaves) that no two distinct starting permutations are forced to collide — the tree must be large enough to keep every permutation distinguishable.

### SE Lens

Reasoning about *every possible comparison-based algorithm at once*, via one shared model, is what makes a lower bound provable at all — checking merge sort, quick sort, and every sort not yet invented individually would be an endless task; modeling the *shape* every one of them must share turns it into one finite argument.

---

## Concept Unit: Deriving the Bound — Tree Depth Versus Leaf Count

### The Problem

A decision tree needs at least `n!` leaves. What does that requirement say about the tree's *depth* — and since depth corresponds directly to the *number of comparisons* an algorithm makes along its longest path, what does it say about worst-case cost?

### Introduce the concept in isolation

A binary tree of depth `d` has at most `2^d` leaves (Lesson 94's own complete-tree counting, generalized) — each level at most doubles the leaf count of the one before it. For a tree with at least `n!` leaves: `2^d \geq n!`, so `d \geq \log_2(n!)`.

Bound `\log_2(n!)` from below directly: the top half of `n!$'s own factors — `n \times (n-1) \times \cdots \times (n/2 + 1)$ — is `n/2` factors, each one at least `n/2`. So `n! \geq (n/2)^{n/2}`, and:

```
log2(n!) >= log2((n/2)^(n/2)) = (n/2) * log2(n/2)
```

`(n/2) \cdot \log_2(n/2)` is `\Omega(n \log n)` — grows at least proportionally to `n \log n`, for large `n`. Every comparison-based sorting algorithm's decision tree, therefore, has depth at least `\Omega(n \log n)`, meaning its **worst-case comparison count** is at least `\Omega(n \log n)`, unconditionally — this is this lesson's **lower bound**.

### Discard the throwaway example

Not applicable — a direct, formal derivation, not new code.

### Mechanical walkthrough — how the proof works, step by step

1. **`n!` leaves required** — reappearing (this lesson's first unit): correctness on every input demands a distinguishable leaf per permutation.
2. **`2^d \geq n!`** — reappearing tree-counting (Lesson 94): a depth-`d` binary tree cannot have more than `2^d` leaves, so enough leaves forces enough depth.
3. **`n! \geq (n/2)^{n/2}`** — first appearance of this specific bounding technique: discarding the *smaller* half of `n!`'s factors only makes the inequality easier to prove, since every discarded factor is at least `1`.
4. **`\log_2((n/2)^{n/2}) = (n/2)\log_2(n/2)`** — reappearing logarithm rules (Lesson 43): the exponent moves out front directly.
5. **Conclude `d = \Omega(n \log n)`** — reappearing growth-rate vocabulary (Lesson 50): the derived lower bound on depth translates directly into a lower bound on worst-case comparisons, since depth *is* the longest possible comparison sequence.

### CS Lens

This is precisely the same "count what's forced, not what's possible" discipline Lesson 91's own `O(\log n)` search bound used, run in the opposite direction: Lesson 91 counted how few comparisons a *specific* algorithm needs; this lesson counts how many comparisons *any* algorithm, even one not yet invented, is provably forced to need.

### SE Lens

A lower bound is a fundamentally different kind of engineering fact than an upper bound: `merge-sort`'s `O(n \log n)` upper bound says "this algorithm never does worse"; this lesson's `\Omega(n \log n)` lower bound says "no comparison-based algorithm, however clever, could ever do asymptotically better" — the second claim is what turns "merge sort seems pretty fast" into "merge sort is provably optimal," a categorically stronger statement.

### Connection to the previous unit

The previous unit modeled every comparison-based algorithm as sharing one shape; this unit measures that shared shape directly, proving a bound that applies to all of them at once, including ones this series never wrote.

---

## Concept Unit: Optimality, and What "Changing Assumptions" Means

### The Problem

Lesson 113's merge sort costs `O(n \log n)` in the worst case. This lesson just proved `\Omega(n \log n)` is unavoidable for *any* comparison-based sort. What does it mean for these two facts to meet exactly — and is `O(n \log n)` really the fastest sorting can ever be, for every kind of input?

### Introduce the concept in isolation

`O(n \log n)` (merge sort's proven upper bound) meeting `\Omega(n \log n)` (this lesson's proven lower bound) means merge sort is **asymptotically optimal** among comparison-based algorithms — no comparison-based sort can ever beat it by more than a constant factor, proven, not merely observed across the sorts this series happened to build. But this lesson's entire argument rested on one assumption stated explicitly at the very start: *comparison-based*. An algorithm that learns about its input some *other* way — inspecting the actual bits of small integers directly, for instance, rather than only comparing pairs — is not bound by this lesson's decision-tree argument at all, since its correctness never depended on having enough leaves for `n!` comparison outcomes.

### Discard the throwaway example

Not applicable — this unit names the boundary of the proof just given, introducing no new code.

### CS Lens

"Changing assumptions" here means genuinely stepping outside the model this lesson's proof was built on — a counting sort or radix sort (Lesson 206, much later in this series) achieves `O(n)` for restricted input (small integers, fixed-width keys) precisely by never comparing two elements against each other at all, sidestepping this lesson's `n!`-leaves requirement entirely rather than disproving it.

### SE Lens

Knowing a lower bound exists changes how an engineer spends effort: attempting to write a faster *comparison-based* sort than `O(n \log n)` is provably wasted effort, no matter how clever the attempt; the only genuine path to a faster sort is relaxing the comparison-only assumption itself, for input where that's actually possible — a lower bound doesn't just describe current algorithms, it directs where future effort could or couldn't possibly pay off.

### Connection to the previous unit

The previous unit proved the bound; this unit is what the bound is actually worth — confirming Lesson 113's merge sort is not merely fast, but optimal within its stated model, and naming precisely what escaping that model would require.

---

## Connect the Pieces

The bound, and where merge sort sits relative to it:

```
Proven lower bound, any comparison-based sort:  Omega(n log n)
Merge sort's proven worst-case cost (Lesson 113): O(n log n)
Quick sort's typical cost (Lesson 114):           O(n log n)
Conclusion: merge sort is asymptotically optimal among comparison-based sorts.
```

Two proofs, built in entirely separate lessons — one an upper bound on one specific algorithm, one a lower bound on every possible algorithm sharing its assumptions — meeting exactly, which is precisely what "provably as good as it gets" looks like.

## What Breaks Without This

Suppose someone claimed to have invented a comparison-based sorting algorithm that always sorts any `n` distinct values correctly using only `O(n)` comparisons — better than this lesson's own proven bound. This lesson's argument shows the claim cannot be true, without needing to read a single line of the claimed algorithm's code: any correct comparison-based sort needs a decision tree with at least `n!` leaves, and a tree with `O(n)` depth has at most `2^{O(n)}` leaves — while `n!` grows strictly faster than `2^{cn}` for any constant `c`, for large enough `n`. The claimed algorithm would have to be wrong somewhere — either it isn't purely comparison-based, or it isn't actually correct on every input — a conclusion reached entirely from this lesson's proof, before ever inspecting the algorithm itself.

## Exercises

1. **Trace.** For `n=4`, compute `4!` directly, and confirm `2^d \geq 4!` requires `d \geq 5` (since `2^4=16 < 24` but `2^5=32 \geq 24`).
2. **Predict.** Before checking, predict whether this lesson's lower bound applies to Lesson 111's brute-force sort. Does brute force violate it, meet it, or exceed it?
3. **Verify.** Confirm `n! \geq (n/2)^{n/2}` directly for `n=6`, computing both sides.
4. **Break it, on purpose.** Explain, in one sentence, why a decision tree with fewer than `n!` leaves *cannot* correctly sort every possible input of `n` distinct values, using Lesson 66's pigeonhole principle directly.
5. **Generalize.** Counting sort (mentioned in this lesson's third unit) achieves `O(n)` for integers in a bounded range. Explain, using this lesson's own "changing assumptions" framing, why this doesn't contradict the `\Omega(n \log n)$ bound proven here.
6. **Reconstruct.** Close this lesson. From memory, derive the `\Omega(n \log n)$ lower bound from the `n!`-leaves requirement, without looking back at this lesson's own steps.

## Definition of Done

- [ ] You can explain why a comparison-based sort's decision tree needs at least `n!` leaves.
- [ ] You can derive the `\Omega(n \log n)$ lower bound from tree-depth-versus-leaf-count reasoning.
- [ ] You can explain what "asymptotically optimal" means for merge sort specifically.
- [ ] You completed Exercise 3 and verified the `n! \geq (n/2)^{n/2}$ inequality for a concrete `n`.
- [ ] You completed Exercise 5 and explained why counting sort doesn't contradict this lesson's bound.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified and explained — for example, `"Verify n! >= (n/2)^(n/2) for n=6; explain why counting sort's O(n) doesn't violate the comparison-based lower bound"` — not just `"lesson 116 exercise"`.

---

**Next lesson:** Lesson 117, *Greedy Algorithms*, returns to designing new algorithms directly — a strategy that makes the locally best choice at every step, and studies precisely when that shortcut is provably correct, and when it silently isn't.
