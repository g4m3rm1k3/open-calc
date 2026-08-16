# Lesson 103: Path Compression

**What you will build**: By the end of this lesson you'll fix the exact weakness Lesson 102 named twice and demonstrated once — a long parent-pointer chain — with a change to `uf-find` itself: flattening every element it passes through to point straight at the root it just found, so no later call ever has to re-walk the same long path again.

**What you need to know first**: Lesson 102's `uf-find`, `uf-union`, and its degenerate-chain example; Lesson 53's amortized analysis; Lesson 85's vector-as-pair, for this lesson's changed return shape.

**Terms introduced in this lesson**: None new — this lesson names an optimization technique (path compression, defined directly by what it does) rather than a new abstract concept.

**Objects and methods used**: None new. This lesson reuses `get` and `assoc` (Lesson 84), each already covered.

---

## Concept Unit: The Waste in Re-Walking the Same Chain

### The Problem

Lesson 102's `chained` example needed `3` steps to find `0`'s root. If `uf-find` is called on `0` *again* — nothing having changed in between — it walks the identical `0 \to 1 \to 2 \to 3$ path a second time, recomputing an answer it already, briefly, knew. Is repeating that walk necessary, or can the first walk leave something behind that makes the second one cheaper?

### Introduce the concept in isolation

Once `uf-find` has walked all the way from `0` to the root `3`, every element on that path — `0`, `1`, `2` — is now known, with certainty, to belong to `3`'s group. Nothing requires them to keep pointing at their *original* parent; pointing directly at `3` instead would still be correct, and would make every future `uf-find` on any of them a single step.

### Discard the throwaway example

Not applicable — this unit states the idea; the next unit builds it.

### CS Lens

This is Lesson 38's memoization, applied to a chain of references instead of a chain of function calls: both cache the result of expensive, repeatable work — memoization stores a computed value keyed by its input; **path compression** stores a computed *root* by simply rewriting the reference structure itself to point straight at it.

### SE Lens

Nothing about this changes what `uf-find` computes — the root reached is identical before and after; what changes is the *cost of asking the same question again*, exactly the distinction Lesson 38's memoization drew between a function's result and how expensive producing it is the next time.

---

## Concept Unit: `uf-compress` — Flattening a Path to Its Root

### The Problem

Once a root is found, can every element on the path leading to it be rewritten to point directly at that root, in the same pass, without walking the path a third time?

### Introduce the concept in isolation

```clojure
(defn uf-find-root [parents x]
  (if (= (get parents x) x)
    x
    (uf-find-root parents (get parents x))))

(defn uf-compress [parents x root]
  (if (= (get parents x) root)
    parents
    (uf-compress (assoc parents x root) (get parents x) root)))
```

```
user=> (def chained [1 2 3 3])
user=> (def compressed (uf-compress chained 0 (uf-find-root chained 0)))
user=> compressed
[3 3 3 3]
```

Lesson 102's `chained` had `0 \to 1 \to 2 \to 3$. `uf-compress`, called on `0` with root `3` already found, rewrites `0`'s own entry to `3` directly — then, using `(get parents x)`, reads `0`'s *original* parent (`1`, from the unmodified argument `parents` still in scope) to know where to continue, and repeats: `1`'s entry becomes `3`, then `2`'s entry becomes `3`. The result, `compressed`, has *every* element pointing directly at the root — a single `uf-find` call flattened the entire chain in one pass.

### Discard the throwaway example

Not applicable — `uf-find-root` and `uf-compress` are real, reusable functions.

### Project Change

- **Reference Source**: `uf-compress` reuses Lesson 92's rebuild-with-one-change discipline, applied repeatedly along a path rather than once — each `assoc` changes exactly one position, the rest of the vector carried forward unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn uf-compress [parents x root]
  (if (= (get parents x) root)
    parents
    (uf-compress (assoc parents x root) (get parents x) root)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get parents x) root)`** — the base case: `x` already points directly at the root — nothing left to compress on this element.
- **`(assoc parents x root)`** — first appearance of compression itself: `x`'s entry is overwritten to point straight at `root`, discarding its old, possibly-long, indirect path.
- **`(get parents x)`** — read here *before* being overwritten in the very same expression — this reads the *original* `parents` parameter, unaffected by the `assoc` computed alongside it, giving the next step the correct "old" parent to continue toward, the identical read-the-original-before-building-something-new discipline Lesson 96's `heap-place-last` and Lesson 92's `bst-insert` both already relied on.

### CS Lens

`uf-compress`'s own cost is `O(\text{chain length})` — the same as the `uf-find-root` walk that found the root in the first place — but it's paid *once*, and every future `uf-find` on any compressed element afterward costs `O(1)`, a direct, concrete instance of Lesson 53's amortized analysis: one expensive pass buys many cheap ones.

### SE Lens

Because this series has no mutation, `uf-compress` cannot rewrite the array in place the way the same idea would in a language with mutable arrays — it must return a genuinely *new* `parents` vector, which means every caller of a compressing `uf-find` now has to carry that new vector forward to whatever it does next, rather than the compression happening invisibly. This is a real, honest cost of staying functional, not a detail to gloss over.

### Connection to the previous unit

The previous unit named the idea; this unit is the real mechanism, verified directly on Lesson 102's own worst-case example — a `3`-step chain flattened to `4` direct root pointers in one pass.

---

## Concept Unit: Why This Makes Union-Find Almost Constant Time

### The Problem

One compression flattens one chain, once. Does repeated use, across many `uf-find` calls on many different elements, actually keep the *whole structure* fast over time, or could new long chains keep re-forming just as fast as old ones get flattened?

### Introduce the concept in isolation

Combine path compression with `uf-union` always attaching the *smaller* group's root under the *larger* group's root (a second, standard optimization, not derived in full here) and a remarkable, well-known result holds: a sequence of `n` `uf-make` calls and `m` `uf-find`/`uf-union` operations costs `O(m \cdot \alpha(n))$ total, where `\alpha$ is the **inverse Ackermann function** — a function that grows so slowly it is, for every practical value of `n` (up to numbers vastly larger than the number of atoms in the observable universe), never more than `4` or `5`. In practice, this means each operation is, for any input size anyone will ever actually run, effectively constant time — "almost constant" is not an exaggeration, though the fully rigorous proof of this exact bound is genuinely advanced and outside this lesson's own scope.

### Discard the throwaway example

Not applicable — a survey of a known result, not a full derivation.

### CS Lens

This is Lesson 53's own point taken to its most extreme form: a single operation's cost, examined in isolation, still looks like it could be `O(n)` (a fresh, long chain is always structurally possible) — but *amortized* across a realistic sequence of operations, repeated flattening keeps the true average cost almost fixed, the same shape of argument Lesson 53 made for a growing array's occasional expensive resize, pushed here to a far more dramatic result.

### SE Lens

Choosing path compression (and its usual companion, union by size or rank) over Lesson 102's plain version is a real, concrete engineering decision with almost no downside: the extra work is small, paid incrementally, and the payoff — an operation count close enough to constant time to treat as one in practice — is why union-find, built this way, is the standard choice anywhere "are these connected" needs answering repeatedly, at scale (Lesson 128, *Connected Components*, and Lesson 133, *Kruskal and Prim*, both later in this series, build directly on it).

### Connection to the previous unit

The previous unit compressed one chain, once; this unit is why doing that consistently, across every `uf-find` call a real system makes, adds up to a structure that behaves almost as if every operation were free.

---

## Connect the Pieces

The full effect, compared directly against Lesson 102's plain version:

```clojure
(println "Plain uf-find-root steps to root, from 0:" 3)
(def compressed (uf-compress chained 0 (uf-find-root chained 0)))
(println "After one compressing find, parents array:" compressed)
(println "A second find on 0 now takes how many steps? 0 (direct pointer)")
```

```
Plain uf-find-root steps to root, from 0: 3
After one compressing find, parents array: [3 3 3 3]
A second find on 0 now takes how many steps? 0 (direct pointer)
```

The very worst case Lesson 102 demonstrated — every element chained behind the last — becomes, after a single compressing find starting from the deepest element, a structure where every element is one direct step from its root.

## What Breaks Without This

Suppose `uf-compress` updated only the *first* element on the path, not every one:

```clojure
(defn broken-compress [parents x root]
  (assoc parents x root))
```

```
user=> (broken-compress chained 0 (uf-find-root chained 0))
[3 2 3 3]
```

`0` now points directly at `3` — but `1` still points at `2`, unchanged. The very next call to `(uf-find-root ... 1)` still walks `1 \to 2 \to 3$, the identical two-step cost as before this "fix" — only the one element actually searched benefits, and every other element on the same path silently keeps its old, uncompressed chain, gaining nothing from the walk that just passed directly through it.

## Exercises

1. **Trace.** By hand, trace `(uf-compress chained 0 3)`, showing each `assoc` and each read of the original `parents`.
2. **Predict.** Before checking, predict what `(uf-find-root compressed 1)` costs, in steps, after this lesson's full compression. Verify.
3. **Verify.** Build a `5`-element fully-chained union-find (`0 \to 1 \to 2 \to 3 \to 4$), compress starting from `0`, and confirm every element now points directly at `4`.
4. **Break it, on purpose.** Using `broken-compress`, run it on `chained` starting from `0`, then check `(uf-find-root ... 1)`'s cost — confirm it's unchanged from before "compression."
5. **Generalize.** Write a full `uf-find` combining `uf-find-root` and `uf-compress`, returning `[root, new-parents]` (Lesson 85's vector-as-pair), and explain in one sentence why callers now have to thread the second element forward.
6. **Reconstruct.** Close this lesson. From memory, explain why `uf-compress` reads `(get parents x)` before that same position gets overwritten, and why that ordering matters.

## Definition of Done

- [ ] You can implement `uf-compress` and explain why it must read each element's original parent before overwriting it.
- [ ] You can explain, at a high level, why amortized cost approaches constant time with repeated compression (Lesson 53's own framing).
- [ ] You can explain why a functional, no-mutation `uf-find` must return the updated structure, not just the answer.
- [ ] You completed Exercise 3 and confirmed full compression on a `5`-element chain.
- [ ] You completed Exercise 5 and implemented a correct combined `uf-find`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Confirm full path compression on a 5-element chain; implement uf-find returning [root new-parents]"` — not just `"lesson 103 exercise"`.

---

**Next lesson:** Lesson 104, *Persistent Data Structures*, names directly what several structures this series has already been doing quietly since Lesson 92's `bst-insert` — building something new while leaving the original completely untouched — and studies that idea as a subject in its own right.
