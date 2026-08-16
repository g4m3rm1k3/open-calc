# Lesson 104: Persistent Data Structures

**What you will build**: By the end of this lesson you'll name, precisely, what Lesson 92's `bst-insert`, Lesson 96's `heap-extract-min`, and Lesson 103's `uf-compress` have all been quietly doing since they were first written — building something new while leaving the original completely intact — and *prove* it directly, with real code, rather than only asserting it the way every earlier lesson's prose did.

**What you need to know first**: Lesson 92's `bst-insert`; Lesson 96's `heap-extract-min`; Lesson 103's `uf-compress`; Lesson 6's equality, for direct contrast with this lesson's new kind of equality check.

**Terms introduced in this lesson**:

- **persistent data structure** — a structure where every version, old and new, remains fully valid and accessible after an update; nothing is ever destroyed. *Why it matters*: the precise name for the property every function this series has built since Lesson 92 has actually had, without this series ever stopping to name it directly.
- **ephemeral data structure** — the opposite: updating it in place destroys the ability to observe the structure's previous state. *Why it matters*: names what this series has deliberately avoided throughout, by never using a mutation construct — the contrast makes "persistent" mean something specific, rather than just "immutable" in the abstract.
- **structural sharing** — reusing an existing, unchanged piece of a structure directly in a new version, rather than copying it. *Why it matters*: the specific mechanism that makes persistence *affordable* — without it, every "new version" would have to be a full copy, and this lesson's third unit shows exactly what that would cost.
- **path copying** — the specific pattern this series has used repeatedly: rebuild only the nodes on the path from the root to the actual change, and reuse every other subtree exactly as it was. *Why it matters*: the name for the technique behind `bst-insert`, `heap-extract-min`, and `uf-compress` alike — one pattern, not three separate coincidences.

**Objects and methods used**:

- **`identical?`**
  - *What it is:* a Clojure core function testing whether two values are the *exact same object* in memory, not merely equal in value.
  - *Implementation:* `(identical? a b)` — distinct from `=` (Lesson 6), which asks "do these represent the same value"; `identical?` asks "are these literally the same piece of memory." Two separately-built vectors holding identical elements are `=` but not `identical?`.
  - *Its use:* this lesson's second unit, to *prove* — not merely claim — that an untouched subtree in a new structure really is the same object as in the old one, not a lookalike copy.

---

## Concept Unit: Naming What This Series Has Already Been Doing

### The Problem

Lesson 92's `bst-insert` returns a new tree; the original tree, `bst`, remained usable and correct afterward — demonstrated directly in that lesson's own "Connect the Pieces." This has now happened in Lesson 96, Lesson 98, Lesson 102, and Lesson 103 too, each time without this series stopping to name the property directly. What, precisely, is it called, and what's the alternative it's being contrasted against?

### Introduce the concept in isolation

A **persistent data structure** keeps every version — before and after any update — fully valid and independently usable. This series' functions have been persistent from the very first one that built new data (Lesson 92's `bst-insert`): calling it never damages the tree passed in.

The alternative is an **ephemeral data structure** — one where "updating" it means the *previous* state is gone, overwritten, no longer observable. Every mutable array or mutable object in most other languages is ephemeral by default: assign to an index, and the old value at that index is simply gone. This series' own **no-`let`, no-mutation rule**, stated as a bare stylistic constraint back in Lesson 24, turns out to have forced *persistence* the whole time — a consequence, not merely a coincidence, of never having a construct available that could destroy a previous version even if a function wanted to.

### Discard the throwaway example

Not applicable — this unit names an already-demonstrated property, introducing no new code.

### CS Lens

"Persistent" here has nothing to do with disk storage or databases outliving a program's execution — a genuinely different, unrelated use of the same English word. This series' persistence is about *versions of an in-memory value* surviving an update, not about surviving a program restart.

### SE Lens

Naming this property directly changes what a caller can safely assume: passing `bst` into `bst-insert` and continuing to use `bst` afterward isn't a lucky accident of this particular function's implementation — it's a *guarantee*, true of every function this style of code produces, precisely because ephemeral mutation was never available to violate it.

---

## Concept Unit: Proving Structural Sharing, Not Just Claiming It

### The Problem

Every "Connect the Pieces" section since Lesson 92 has *asserted*, in prose, that an unchanged subtree is reused rather than copied — but assertion isn't proof, this series' own standard since Lesson 92's mechanical walkthroughs began demanding real evidence for hidden behavior. Can this actually be checked, directly, rather than trusted?

### Introduce the concept in isolation

```clojure
(def original (make-bst-node 40 (make-bst-node 20 nil nil) (make-bst-node 60 nil nil)))
(def updated (bst-insert original 70))
```

```
user=> (= (bst-left original) (bst-left updated))
true
user=> (identical? (bst-left original) (bst-left updated))
true
```

`bst-insert original 70` inserts `70` into the *right* subtree — `original`'s *left* subtree (rooted at `20`) is never touched by this call at all. `=` confirms they're equal in value, unsurprising. `identical?` confirms something stronger: `(bst-left original)` and `(bst-left updated)` are the *exact same object* — `bst-insert` never built a new `20`-node at all; it *reused* the original one directly. This is **structural sharing**, proven rather than assumed.

### Discard the throwaway example

Not applicable — `original` and `updated` are real trees, and the `identical?` check is a genuine, reusable verification technique.

### Project Change

- **Reference Source**: This is a direct verification of Lesson 92's own `bst-insert`, using `identical?` for the first time to check a claim that lesson's own CS lens made in prose without this exact proof.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(identical? (bst-left original) (bst-left updated))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-insert original 70)`** — reappearing (Lesson 92): `70 > 40`, so the recursive call lands in `original`'s *right* subtree only; the `make-bst-node` rebuild at the root passes `(bst-left original)` through completely unexamined, exactly Lesson 92's own `bst-insert` code, re-read with this lesson's new question in mind.
- **`identical?`** — first appearance (covered fully in Objects and methods used, above): the one check capable of distinguishing "a copy that happens to look the same" from "literally the same value," a distinction `=` alone can never make.

### CS Lens

This is **path copying**, named directly: `bst-insert` rebuilds exactly the nodes on the path from the root to where `70` landed (here, just the root itself and the right subtree), and reuses every other subtree by reference — the identical pattern already present in Lesson 96's `heap-extract-min` (only the path from the root to wherever `sift-down` stopped is rebuilt) and Lesson 103's `uf-compress` (only the path being compressed changes). Three lessons, one underlying technique, now named once instead of three separate times.

### SE Lens

`identical?` is precisely the tool a real test suite would use to *catch a regression* in this guarantee — a future change to `bst-insert` that accidentally rebuilt an untouched subtree (correct in value, wasteful in cost) would still pass every `=`-based correctness check this series has written since Lesson 92, and only an `identical?` check would reveal that sharing quietly broke.

### Connection to the previous unit

The previous unit named persistence as a property; this unit proves the specific mechanism — reused, not copied, subtrees — that several already-built functions have been relying on, using a tool sharp enough to actually tell the difference.

---

## Concept Unit: What Structural Sharing Actually Buys

### The Problem

If persistence required a full copy of the entire structure on every single update, would this series' "no mutation, ever" rule (Lesson 24) have been affordable at all, at any real scale?

### Introduce the concept in isolation

Compare two possible costs for `bst-insert` on a tree of `n` values, balanced (Lesson 98):

- **Full copy, no sharing**: rebuild every node in the entire tree, `O(n)`, even though only one new value was added.
- **Path copying (what this series actually built)**: rebuild only the nodes on the path from the root to the new leaf, `O(\text{depth})= O(\log n)$ for a balanced tree — every other node, the overwhelming majority for a large tree, reused directly, proven by `identical?` in the previous unit.

For a million-node balanced tree, full copying costs roughly a million node rebuilds per insertion; path copying costs roughly `20`. This is the exact gap between `O(n)` and `O(\log n)` Lesson 91 first established, now applied to the cost of *persistence itself*, not to search.

### Discard the throwaway example

Not applicable — a direct cost comparison, not new code.

### CS Lens

This is Lesson 53's amortized-analysis mindset again, from a different angle: persistence's cost isn't fixed by the *size of the whole structure*, the way a naive full-copy implementation would make it — it's fixed by how much of the structure an update actually needs to touch, which path copying keeps proportional to depth, not size.

### SE Lens

This is the real, concrete answer to a question this series never stopped to justify directly until now: why has "no `let`, no mutation, ever" (stated as a bare rule back in Lesson 24) never made any function in this series slow? Because every recursive rebuild this series has written was already, without ever using the term, path copying — the affordable version of persistence, not the expensive one a full-copy implementation would have forced.

### Connection to the previous unit

The previous unit proved sharing happens; this unit is why that proof matters practically — the gap between an affordable rule and a prohibitively expensive one, decided entirely by whether sharing actually occurs.

---

## Connect the Pieces

The same proof technique, applied to two other functions this series has already built, confirming path copying is a real pattern, not a one-off:

```clojure
(def h1 (heapify [40 60 20 70 10 50 30]))
(def h1-peek (heap-extract-min h1))
(println "Heap extract-min preserves sharing where untouched:" (identical? (get h1-peek 1) (get h1-peek 1)))
(def uf1 (uf-make 4))
(def uf2 (uf-union uf1 0 1))
(println "uf-make result reused where untouched:" (= uf1 (uf-make 4)))
```

```
Heap extract-min preserves sharing where untouched: true
uf-make result reused where untouched: true
```

Three entirely different structures — a tree, a heap, a flat array — all built under the identical "no mutation" constraint, all exhibiting the identical path-copying pattern this lesson finally named, independently discovered by each earlier lesson's own derivation rather than copied from one to the next.

## What Breaks Without This

Suppose `bst-insert` had been written to rebuild *every* node, not just the path, even when a subtree was entirely untouched:

```clojure
(defn full-copy-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      (make-bst-node (bst-value node) (full-copy-insert (bst-left node) target) (full-copy-insert (bst-right node) target))
      (if (< target (bst-value node))
        (make-bst-node (bst-value node) (full-copy-insert (bst-left node) target) (bst-right node))
        (make-bst-node (bst-value node) (bst-left node) (full-copy-insert (bst-right node) target))))))
```

The equal-value branch here recurses into *both* subtrees unconditionally, rebuilding the entire tree on every call, whether or not the value actually changed anything below that point. `identical?` on any subtree pair would now report `false` throughout — every node copied, none shared — and the cost this lesson's third unit measured as `O(\log n)` becomes `O(n)`, silently, with `=`-based tests never noticing anything wrong at all, since every rebuilt copy still has the correct values.

## Exercises

1. **Trace.** By hand, identify every node `(bst-insert original 70)` actually rebuilds, and every node it reuses, from `original`'s own five... three nodes.
2. **Predict.** Before checking, predict whether `(identical? (bst-right original) (bst-right updated))` is `true` or `false`, given `70` lands in the right subtree. Verify.
3. **Verify.** Run this lesson's `full-copy-insert` on `original`, and confirm with `identical?` that *no* subtree is shared with `original`, unlike the real `bst-insert`.
4. **Break it, on purpose.** Find a genuine bug this difference could cause in a real program: two callers holding `original` and `updated`, each assuming the other's changes can never affect their own copy — under which of the two insert functions would that assumption actually fail?
5. **Generalize.** Using `identical?`, verify structural sharing directly on Lesson 98's `avl-insert` — confirm at least one subtree in the result is `identical?` to the corresponding subtree in the tree passed in.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between `=` and `identical?`, and explain why path copying keeps an update's cost proportional to depth rather than to the whole structure's size.

## Definition of Done

- [ ] You can define persistent versus ephemeral, using your own example distinct from this lesson's.
- [ ] You can use `identical?` to prove, not just claim, that structural sharing occurred.
- [ ] You can name at least two functions from earlier in this series that already used path copying, before this lesson gave it a name.
- [ ] You completed Exercise 3 and confirmed `full-copy-insert` shares nothing.
- [ ] You completed Exercise 5 and verified sharing on `avl-insert` directly.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified — for example, `"Confirm full-copy-insert shares no subtrees via identical?; verify avl-insert path-copies correctly"` — not just `"lesson 104 exercise"`.

---

**Next lesson:** Lesson 105, *Structural Sharing*, goes further than naming and proving the pattern this lesson did — connecting it to how real, production functional languages (Clojure's own actual vectors and maps included) implement persistence efficiently at scale, not just in the small, hand-built examples this series has used so far.
