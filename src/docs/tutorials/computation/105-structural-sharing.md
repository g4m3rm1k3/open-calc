# Lesson 105: Structural Sharing

**What you will build**: By the end of this lesson you'll derive why a *real* production persistent vector — including the one every `get`/`assoc` call in this entire series has secretly been using since Lesson 84 — is built as a wide, shallow tree rather than a simple chain, directly reusing Lesson 101's digit-by-digit indexing idea and Lesson 100's wide-branching motivation, applied to numbers instead of characters.

**What you need to know first**: Lesson 104's structural sharing and path copying; Lesson 101's trie, indexed by characters; Lesson 100's B-tree, and why wider nodes mean fewer levels; Lesson 54's `mod` and `quot`.

**Terms introduced in this lesson**: None new — this lesson connects and applies structural sharing (Lesson 104) to a new, wider-branching shape, rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `get`, `quot`, and `mod` (Lesson 84, Lesson 54), each already covered.

---

## Concept Unit: The Cost Problem a Simple Chain Would Have

### The Problem

Lesson 104 proved path copying keeps an update's cost proportional to depth, not size — but only *if* depth stays small. A persistent vector built as a simple chain (Lesson 85's node-and-reference shape, one element per node) would have depth `n` for `n` elements — `get` and `assoc` would both cost `O(n)`, the exact structure Lesson 85 already showed is slow to index into. Does persistence *require* accepting that cost, or can a vector's own shape avoid it?

### Introduce the concept in isolation

Lesson 100's B-tree already answered a version of this question for search: wider nodes mean fewer levels, `O(\log_m n)` instead of `O(\log_2 n)`, dramatically fewer for large `m`. The identical idea applies to indexing a vector by *position*: rather than one child per node (a chain, depth `n`) or two children per node (a binary tree, depth `\log_2 n`), a tree with many children per node — say, `32` — indexed by *position* rather than by comparison, could have depth `\log_{32} n`, small even for enormous `n`.

### Discard the throwaway example

Not applicable — this unit states the motivating comparison; the next unit builds a small concrete version.

### CS Lens

This is Lesson 100's own B-tree motivation, transplanted from "minimize disk reads" to "minimize levels of an in-memory persistent structure to rebuild on every `assoc`" — a different reason, the identical shape of solution.

### SE Lens

A plain array (Lesson 84) already gives `O(1)` `get`/`assoc` — but only because it can be *mutated* in place. The moment persistence is required (Lesson 104), a plain array's `assoc` would have to copy the *entire* array, `O(n)`, to avoid disturbing the original — this unit's whole question is whether a smarter shape can approach array-like speed without paying that full-copy cost.

---

## Concept Unit: Indexing by Digits — a Small Concrete Version

### The Problem

Lesson 101's trie indexed a node's children by a string's *characters*, one position at a time. A vector's index is a *number*, not a string — can the identical idea apply, indexing by a number's own *digits* instead?

### Introduce the concept in isolation

Build a depth-`3`, branching-factor-`2` structure, holding `8` values (indices `0` through `7`, `2^3 = 8`):

```clojure
(def digit-vec [[[:v0 :v1] [:v2 :v3]] [[:v4 :v5] [:v6 :v7]]])

(defn digit-vec-get [tree i]
  (get (get (get tree (quot i 4)) (mod (quot i 2) 2)) (mod i 2)))
```

```
user=> (digit-vec-get digit-vec 5)
:v5
user=> (digit-vec-get digit-vec 0)
:v0
user=> (digit-vec-get digit-vec 7)
:v7
```

`5` in binary is `101` — exactly the three digits `digit-vec-get` extracts: `(quot 5 4) = 1` (the top bit), `(mod (quot 5 2) 2) = 0` (the middle bit), `(mod 5 2) = 1` (the bottom bit) — and descending by those three bits, in order, reaches `:v5` directly. This is Lesson 101's trie walk, unchanged in spirit: instead of matching a character at each level, this walks a *bit* of the index at each level — the exact digit-by-digit indexing idea, applied to base `2` instead of an alphabet.

### Discard the throwaway example

Not applicable — `digit-vec-get` is real, verified code, though this lesson's own small-scale model, not a fetched, session-verified read of Clojure's actual implementation source (see this unit's SE lens).

### Project Change

- **Reference Source**: No reference source read this session. This models the well-documented public *design* of Clojure's real `PersistentVector` (bit-partitioned indexing by a fixed branching factor) at a small, hand-traceable scale — branching factor `2` here, rather than Clojure's real `32` — for teaching purposes. Treat the specific claim "Clojure uses branching factor `32`" as established public knowledge, not verified from source this session.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn digit-vec-get [tree i]
  (get (get (get tree (quot i 4)) (mod (quot i 2) 2)) (mod i 2)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(quot i 4)`** — reappearing `quot` (Lesson 54); for `i` in `0..7`, this is exactly `i`'s most-significant bit, since `4 = 2^2` is half the total range.
- **`(mod (quot i 2) 2)`** — reappearing `quot`/`mod` combined: halves `i` once (discarding the bit already consumed), then extracts the *next* bit.
- **`(mod i 2)`** — reappearing `mod`; the least-significant bit, the final digit.
- **`(get (get (get tree ...) ...) ...)`** — reappearing indexed `get` (Lesson 84), applied three times in a row — one per digit, descending one tree level per bit, exactly Lesson 101's own one-character-per-level walk.

### CS Lens

Every keyword value here (`:v0` through `:v7`) sits at exactly the tree position its own index's binary representation names — the structure's *shape* encodes the indexing scheme directly, the same "position alone determines meaning" idea Lesson 94's heap array-indices already relied on, now built from an explicit tree instead of a flat array.

### SE Lens

This lesson's honest scope: `digit-vec-get` demonstrates the *principle* correctly and is fully verified by hand-tracing above — but it is a small teaching model, not a claim to have reproduced Clojure's actual, real `PersistentVector` source, which this session never fetched or read. The next unit's claim about branching factor `32` specifically should be read the same way: well-known, publicly documented, but not verified from source in this session.

### Connection to the previous unit

The previous unit motivated wider branching by analogy to Lesson 100's B-tree; this unit shows the *mechanism* concretely — digit extraction via `quot`/`mod`, exactly Lesson 101's character-matching idea, applied to numbers.

---

## Concept Unit: Why Real Persistent Vectors Use 32, Not 2

### The Problem

This lesson's own example used branching factor `2`, giving depth `3` for `8` elements — for a vector with a billion elements, branching factor `2` would still need about `30` levels (`\log_2(10^9) \approx 30`). Is there a better choice, and what does "better" actually trade off?

### Introduce the concept in isolation

Real, widely-used persistent vector implementations (Clojure's included, per this lesson's honestly-scoped public-knowledge citation) use branching factor `32`. For a billion elements: `\log_{32}(10^9) \approx 6$ — six levels, not thirty. Lesson 104's path-copying cost is proportional to depth: an `assoc` on a billion-element persistent vector rebuilds roughly `6` nodes, each holding up to `32` children — not `30` nodes of `2` children each, and nowhere near a full `10^9`-element copy.

The tradeoff, honestly: wider nodes mean *more* work rebuilt *per level* (copying up to `32` child references instead of `2`) in exchange for *far fewer levels* to rebuild at all. `32` is a widely-used, well-tuned real-world balance point between those two costs — not a value this lesson derives from first principles, but a genuine, documented engineering choice.

### Discard the throwaway example

Not applicable — a cost comparison using this lesson's already-established digit-indexing model, not new code.

### CS Lens

This is Lesson 100's own B-tree tradeoff, restated in a new setting: order `4`'s B-tree traded a few extra per-node comparisons for far fewer node visits; branching-`32` persistent vectors trade a slightly larger per-level rebuild for far fewer levels rebuilt — the identical shape of engineering tradeoff, arrived at independently in two entirely different problems (disk-backed search trees, in-memory persistent vectors) because the underlying math (wide nodes shrink `\log_m n$) is the same regardless of what's motivating the choice.

### SE Lens

This is the real, concrete answer to a question implicit in every `get` and `assoc` call this series has made since Lesson 84: those operations have always been *effectively* `O(1)` in practice, not because Clojure's vectors are a plain mutable array under the hood, but because a `\log_{32} n$ tree is so shallow for any realistic `n` that the difference from true `O(1)` is unmeasurable — the exact "almost constant time" shape Lesson 103's inverse Ackermann result already demonstrated is possible, arrived at here by a completely different mechanism.

### Connection to the previous unit

The previous unit built a small, correct, hand-verified model of the indexing scheme; this unit is why the *specific* branching factor real systems choose is `32` rather than `2` — a genuine engineering tradeoff this lesson names honestly rather than derives exhaustively.

---

## Connect the Pieces

This lesson's own small model, and the real-world comparison it stands in for:

```clojure
(println "Get index 5:" (digit-vec-get digit-vec 5))
(println "Levels for 8 elements, branch 2:" 3)
(println "Levels for 1 billion elements, branch 2 (est.):" 30)
(println "Levels for 1 billion elements, branch 32 (est.):" 6)
```

```
Get index 5: :v5
Levels for 8 elements, branch 2: 3
Levels for 1 billion elements, branch 2 (est.): 30
Levels for 1 billion elements, branch 32 (est.): 6
```

The same digit-indexing principle, verified concretely at branching factor `2`, scales to the real-world branching factor `32` by nothing more than widening each level's own child count — the mechanism this lesson derived and verified doesn't change, only the constant does.

## What Breaks Without This

Suppose a persistent vector were built with branching factor `1` — every node holding exactly one child, no actual branching at all:

```
Levels for 8 elements, branch 1: 8 (a plain chain, Lesson 85's own linked structure)
```

Branching factor `1` degenerates exactly to Lesson 85's node-and-reference chain — depth equals element count, `get` and `assoc` both cost `O(n)`, and every one of Lesson 104's structural-sharing benefits still technically holds (unchanged nodes really are reused) while delivering none of the *speed* this lesson's whole argument depends on. Persistence alone (Lesson 104) guarantees correctness and reuse; it takes a wide-enough branching factor, this lesson's own actual subject, to also guarantee speed.

## Exercises

1. **Trace.** By hand, trace `(digit-vec-get digit-vec 3)`, showing all three digit extractions.
2. **Predict.** Before checking, predict `(digit-vec-get digit-vec 6)`'s three digits and result. Verify.
3. **Verify.** Extend `digit-vec` to depth `4` (`16` elements, branching factor `2` still), and write the corresponding four-`get` version of `digit-vec-get`.
4. **Break it, on purpose.** Compute `\log_{32}(10^{12})$ (a trillion elements) by hand or calculator, and compare it to `\log_2(10^{12})$, confirming the gap this lesson claims only widens for larger `n`.
5. **Generalize.** State, in one sentence, why branching factor `32` specifically (rather than, say, `1{,}000{,}000`) still keeps per-level rebuild cost reasonable, using this lesson's own tradeoff framing.
6. **Reconstruct.** Close this lesson. From memory, explain why a persistent vector's real-world branching factor is chosen much larger than `2`, and what specifically is traded away by choosing it larger still.

## Definition of Done

- [ ] You can implement digit-based indexing for a small, fixed branching factor and depth.
- [ ] You can explain why branching factor `1` degenerates to Lesson 85's linked structure.
- [ ] You can state the tradeoff a larger branching factor makes, honestly, without overclaiming a specific "best" value.
- [ ] You completed Exercise 3 and extended the indexing scheme to a fourth level.
- [ ] You completed Exercise 4 and confirmed the `\log_{32}$ versus `\log_2$ gap numerically for a trillion elements.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and confirmed — for example, `"Extend digit-vec-get to depth 4 (16 elements); confirm log_32 vs log_2 gap at n=10^12"` — not just `"lesson 105 exercise"`.

---

**Next lesson:** Lesson 106, *Representation Invariants*, formalizes a distinction this series has used informally since Lesson 92's `is-bst?` and this lesson's own digit-indexing scheme both depended on — the difference between what a data type's *interface* promises and what its *internal representation* must always satisfy for that promise to hold.
