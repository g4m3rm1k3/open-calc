# Lesson 102: Disjoint Sets

**What you will build**: By the end of this lesson you'll derive a structure answering a question none of Section V's earlier structures were built for — not "is this value here," but "are these two values in the same group" — generalizing Lesson 54's equivalence classes from numbers congruent mod `n` to arbitrary elements grouped by any relation at all, and merging groups together as new connections are discovered.

**What you need to know first**: Lesson 54's equivalence classes, generalized here beyond modular arithmetic specifically; Lesson 84's arrays, `get`, and `assoc`; Lesson 92's BST, for contrast in what question each structure answers.

**Terms introduced in this lesson**:

- **disjoint sets** — a collection of groups (sets) where no element belongs to more than one group at once, together with two operations: merge two groups, and ask whether two elements are currently in the same group. *Why it matters*: this is a genuinely different question from every structure since Lesson 92 — those all answer "is `x` present" or "what's the minimum"; this one answers "are `x` and `y` related," a question about *relationships between elements*, not about any one element alone.
- **representative** — one designated element standing in for an entire group, used to answer "same group?" by comparing representatives instead of comparing every element pairwise. *Why it matters*: Lesson 54's own `mod` reduced a number to a canonical member of its equivalence class; a representative plays the identical role here, for an arbitrary group instead of a numeric one.

**Objects and methods used**: None new. This lesson reuses `get` and `assoc` (Lesson 84), each already covered.

---

## Concept Unit: Representing Groups as Parent Pointers

### The Problem

Lesson 54 built equivalence classes for numbers, using `mod` to reduce any number to a canonical representative of its class. If the "elements" are no longer numbers-mod-`n`, but arbitrary things — network nodes, image pixels, people in a social graph — grouped by *some* relation discovered incrementally, one connection at a time, is there still a cheap way to find each element's own group representative?

### Introduce the concept in isolation

```clojure
(defn uf-make-at [parents i n]
  (if (>= i n)
    parents
    (uf-make-at (assoc parents i i) (+ i 1) n)))

(defn uf-make [n] (uf-make-at [] 0 n))
```

```
user=> (uf-make 7)
[0 1 2 3 4 5 6]
```

Elements are just integers `0` through `n-1` here (Lesson 84's own array-position-as-identity idea), and `uf-make`'s result is a vector where position `i` holds `i`'s current **parent** — every element starts as *its own* parent, meaning every element begins in its own singleton group, its own **representative**.

### Discard the throwaway example

Not applicable — `uf-make` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct array-based representation (Lesson 84), building on Lesson 94's already-established convention that `assoc` at exactly `(count v)` appends.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn uf-make [n] (uf-make-at [] 0 n))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc parents i i)`** — reappearing `assoc`-as-append (Lesson 94); position `i` is given value `i` — its own index — meaning "my parent is myself," the starting condition for every element.
- **`(>= i n)`** — reappearing counting-up base case (the mirror of `sum-to`'s counting-down shape, Lesson 20): stop once every position from `0` to `n-1` has been filled.

### CS Lens

A vector where position `i` points to `i`'s parent is a **tree**, in Lesson 30's own recursive sense — but a tree represented backward from every other structure in this section: every child knows its *one* parent, rather than a parent knowing its (possibly many) children, exactly the opposite direction of every reference this series has followed since Lesson 85.

### SE Lens

Starting every element as its own root costs `O(n)` up front, once — a real, honest cost, paid so that every later question this lesson builds can be answered by following parent pointers alone, no separate bookkeeping about which elements are already grouped together.

---

## Concept Unit: `uf-find` — Locating a Group's Representative

### The Problem

Given this lesson's parent-pointer array, how does one element discover *which* group it currently belongs to — specifically, the one canonical representative Concept Unit 1 named, that every other member of the same group would also eventually reach?

### Introduce the concept in isolation

```clojure
(defn uf-find [parents x]
  (if (= (get parents x) x)
    x
    (uf-find parents (get parents x))))
```

```
user=> (uf-find (uf-make 7) 3)
3
```

An element whose parent is *itself* is a group's representative — its own root. `uf-find` walks from any element toward that root, following one parent pointer at a time, until it reaches one. On a freshly-made `uf-make 7`, every element is already its own root, so `(uf-find ... 3)` returns `3` immediately — the next unit's `uf-union` is what actually links elements into shared groups.

### Discard the throwaway example

Not applicable — `uf-find` is a real, reusable function.

### Project Change

- **Reference Source**: `uf-find` reuses Lesson 85's reference-chasing recursion directly — the same "follow one link at a time until reaching a stopping point" shape `node-length` used, here stopping at a self-referencing root instead of a `nil`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn uf-find [parents x]
  (if (= (get parents x) x)
    x
    (uf-find parents (get parents x))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get parents x) x)`** — the base case: `x`'s own parent entry equals `x` itself, meaning `x` is a root — every group has exactly one, by construction (Concept Unit 1's own starting condition, preserved by the next unit's `uf-union`).
- **`(uf-find parents (get parents x))`** — reappearing reference-chasing recursion (Lesson 85); each step moves one level up the parent chain, exactly the way `node-next` walked one linked-list step at a time.

### CS Lens

`uf-find`'s cost is `O(\text{chain length from } x \text{ to its root})` — structurally identical to Lesson 85's `node-length` cost, for the identical underlying reason: nothing about a chain of one-way references lets a later element be reached without walking through everything before it.

### SE Lens

This cost is exactly where this lesson's naive version can degrade the same way Lesson 92's plain BST could: nothing yet prevents a long chain of parent pointers from forming, the direct analogue of Lesson 97's degenerate BST. Lesson 103 (*Path Compression*) fixes this directly — flagged here, not solved yet, matching this lesson's own honestly narrower scope.

### Connection to the previous unit

The previous unit gave every element a parent pointer; this unit is the operation that actually uses those pointers to answer "which group am I in," by walking toward the one self-referencing root each chain eventually reaches.

---

## Concept Unit: `uf-union` and `uf-connected?` — Merging Groups

### The Problem

Two elements' groups need to become *one* group, once a new connection between them is discovered. Given `uf-find`, can two entire groups be merged with a single, cheap change — without visiting or modifying every element either group contains?

### Introduce the concept in isolation

```clojure
(defn uf-union-roots [parents root-x root-y]
  (if (= root-x root-y)
    parents
    (assoc parents root-x root-y)))

(defn uf-union [parents x y]
  (uf-union-roots parents (uf-find parents x) (uf-find parents y)))

(defn uf-connected? [parents x y]
  (= (uf-find parents x) (uf-find parents y)))
```

```
user=> (def groups (uf-union (uf-union (uf-make 7) 0 1) 2 1))
user=> (uf-connected? groups 0 2)
true
user=> (uf-connected? groups 0 3)
false
```

`(uf-union (uf-make 7) 0 1)` finds `0`'s root (`0`) and `1`'s root (`1`), then a *single* `assoc` makes `0`'s root point to `1`'s root — one array position changed, not every element in `0`'s group individually. The second `uf-union` links `2`'s root (`2`) to `1`'s root the same way. `(uf-connected? groups 0 2)` walks both to the shared root `1` and confirms they match — `true` — even though `0` and `2` were never directly linked to each other, only both linked, separately, to `1`.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `uf-union-roots` reuses Lesson 92's rebuild-with-one-change discipline (a single `assoc`, everything else untouched) directly, applied here to a flat array rather than a nested tree structure.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn uf-connected? [parents x y]
  (= (uf-find parents x) (uf-find parents y)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= root-x root-y)`** — first appearance: if `x` and `y` are already in the same group, nothing needs to change — union is a genuine no-op here, not an error.
- **`(assoc parents root-x root-y)`** — first appearance: exactly *one* position changes — `root-x`'s own parent entry — regardless of how many elements were already grouped under `root-x`; every one of them reaches the new shared root the next time `uf-find` walks through `root-x`.
- **`(= (uf-find parents x) (uf-find parents y))`** — reappearing `uf-find` (Concept Unit 2), called twice and compared — "same group" reduced entirely to "same representative," Lesson 54's own well-definedness idea, generalized.

### CS Lens

`uf-union`'s `O(1)` merge — one `assoc`, regardless of either group's size — is the entire reason union-find outperforms re-scanning or re-labeling every element on every merge: attaching one *root* to another is cheap precisely because every other element's group membership is defined *indirectly*, through the chain `uf-find` walks, never stored redundantly per element.

### SE Lens

This lesson's `uf-union` always attaches `root-x` under `root-y`, with no regard for which group is larger — a real, honest simplification: repeatedly attaching a large group under a small one's root can build exactly the long chains Concept Unit 2's SE lens already flagged as this lesson's open weakness, which Lesson 103 resolves.

### Connection to the previous unit

The previous unit found a single element's representative; this unit uses that operation twice to merge two entire groups with one cheap change, and to answer "same group?" by comparing what that change ultimately produces.

---

## Connect the Pieces

A larger example, connecting several elements into two separate groups:

```clojure
(def merged (uf-union (uf-union (uf-union (uf-make 7) 0 1) 2 1) 4 5))
(println "0 and 2 connected?" (uf-connected? merged 0 2))
(println "0 and 4 connected?" (uf-connected? merged 0 4))
(println "4 and 5 connected?" (uf-connected? merged 4 5))
(println "6 and anything connected?" (uf-connected? merged 6 0))
```

```
0 and 2 connected? true
0 and 4 connected? false
4 and 5 connected? true
6 and anything connected? false
```

`0`, `1`, and `2` form one group; `4` and `5` form a separate one; `3` and `6` remain alone, exactly as `uf-make` started them — three unions produced exactly two real merges and correctly left every unconnected pair reporting `false`.

## What Breaks Without This

Suppose `uf-union` always attached the *first* argument's root under the *second*'s, called repeatedly in a loop like `(uf-union groups i (+ i 1))` for `i` from `0` up to `n-2` — chaining every element to the next:

```
user=> (def chained (uf-union (uf-union (uf-union (uf-make 4) 0 1) 1 2) 2 3))
user=> chained
[1 2 3 3]
```

`uf-find` on `0` now walks `0 \to 1 \to 2 \to 3$ — three steps for `n = 4$ elements, exactly Lesson 92's degenerate-chain shape, reached here through union order rather than insertion order. Every operation remains fully correct — `uf-connected?` never gives a wrong answer — but `uf-find`'s cost has quietly grown to `O(n)`, the identical honest weakness Concept Unit 2 flagged directly, now shown concretely rather than only asserted.

## Exercises

1. **Trace.** By hand, trace `(uf-find merged 5)` from "Connect the Pieces," showing every parent-pointer step.
2. **Predict.** Before checking, predict `(uf-connected? merged 3 6)`. Verify by tracing both `uf-find` calls.
3. **Verify.** Build `chained` yourself, confirm `(uf-find chained 0)` takes `3` steps, and compare that to `(uf-find chained 3)`, which should take `0`.
4. **Break it, on purpose.** Construct a `6`-element union-find where a single `uf-find` call takes all `5` possible steps — the worst case for `6` elements.
5. **Generalize.** Write `uf-group-size`, returning how many elements currently share a given element's representative, by scanning every position and counting matches.
6. **Reconstruct.** Close this lesson. From memory, explain why `uf-union` only ever needs to change one array position, and why that alone doesn't prevent long chains from forming.

## Definition of Done

- [ ] You can build a union-find structure and explain what each array position represents.
- [ ] You can implement `uf-find`, `uf-union`, and `uf-connected?` without looking back at this lesson.
- [ ] You can explain why `uf-union` costs `O(1)` regardless of either group's size.
- [ ] You completed Exercise 3 and confirmed a real, degenerate worst-case chain.
- [ ] You completed Exercise 5 and implemented a correct `uf-group-size`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Confirm chained unions produce O(n) uf-find; implement uf-group-size via full scan"` — not just `"lesson 102 exercise"`.

---

**Next lesson:** Lesson 103, *Path Compression*, fixes exactly the weakness this lesson named twice and demonstrated once — a long parent chain — with a small change to `uf-find` itself, deriving why the result becomes almost constant time in practice.
