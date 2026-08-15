# Lesson 32: Generators and Search

**What you will build**: By the end of this lesson you'll be able to search an existing recursive structure for a value, using a binary search tree's own ordering to search dramatically faster than checking every node — and you'll be able to generate an entire space of possibilities from scratch, recursively, rather than searching through data that already exists. Both are the same underlying idea, applied in two directions: one explores a structure that's already there; the other builds the structure of possibilities as it goes.

**What you need to know first**: The previous two lessons' trees and traversals, Lesson 9's existential quantifier, and Lesson 25's `map`.

**Terms introduced in this lesson**:

- **search space** — the complete collection of possibilities a search or enumeration considers, often represented, explicitly or implicitly, as a tree of choices. *Why it matters*: names what `tree-contains?` searches *through* and what `power-set` explicitly *builds* — the same underlying idea, whether the space already exists as data or has to be constructed as part of the process.
- **generator** — a function that produces every member of some collection of possibilities, often recursively, rather than searching through an already-existing structure. *Why it matters*: distinguishes the second half of this lesson's work (build the space) from the first half's (search an existing space) — two related but genuinely different tasks.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `<`, `or`, `cons`, `map`, and `my-append`, each already fully covered.

---

## Concept Unit: Searching a Tree — Does a Value Exist?

### The Problem

Lesson 26's `filter`, combined with `empty?`, finally let this series check Lesson 9's existential quantifier over a real, arbitrary-length *list*. Trees haven't had the same treatment yet — does a given value appear anywhere in a tree?

### Introduce the concept in isolation

```clojure
(defn tree-contains? [tree value]
  (if (empty? tree)
    false
    (if (= (tree-value tree) value)
      true
      (or (tree-contains? (tree-left tree) value) (tree-contains? (tree-right tree) value)))))
```

```
user=> (tree-contains? small-tree 3)
true
user=> (tree-contains? small-tree 99)
false
```

The base case (`false` — an empty tree contains nothing) and the current-node check (`true`, if this node's own value matches) are direct. The recursive case is Lesson 9's existential quantifier, realized exactly: "does the value exist in the left subtree, *or* does it exist in the right subtree" — `or`'s short-circuiting (Lesson 7) even means the moment a match is found in the left subtree, the right subtree is never examined at all.

### Discard the throwaway example

Not applicable — `tree-contains?` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — direct structural recursion on the tree definition, combined with Lesson 9's existential quantifier.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn tree-contains? [tree value]
  (if (empty? tree)
    false
    (if (= (tree-value tree) value)
      true
      (or (tree-contains? (tree-left tree) value) (tree-contains? (tree-right tree) value)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(or (tree-contains? (tree-left tree) value) (tree-contains? (tree-right tree) value))`** — reappearing `or` (Lesson 7), applied here across two recursive calls rather than two plain booleans — the identical existential-quantifier realization Lesson 26's `filter`-based search already achieved for lists, now extended to a tree's two-subtree branching.

### CS Lens

`tree-contains?` examines *every* node in the worst case (searching for a value that isn't present, or one buried in the last-checked branch) — this is precisely a **search space**: the tree itself, considered as the complete collection of places the value could be, explored exhaustively when no shortcut is available.

### SE Lens

Nothing about `tree-contains?`'s tree needed any special structure — it works correctly on *any* binary tree, ordered or not, because it genuinely has to check every node to be sure. The next unit shows what becomes possible once the tree *does* have a known structure to exploit.

---

## Concept Unit: Searching a Binary Search Tree — Using the Structure to Search Faster

### The Problem

`tree-contains?` always makes two recursive calls (unless it finds a match early) — checking both subtrees, every time, on any tree. Lesson 31 established that a binary search tree's structure guarantees something extra: every value in the left subtree is smaller than the current node, every value in the right subtree is larger. Does that guarantee mean *both* subtrees still need checking?

### Introduce the concept in isolation

```clojure
(defn bst-contains? [tree value]
  (if (empty? tree)
    false
    (if (= (tree-value tree) value)
      true
      (if (< value (tree-value tree))
        (bst-contains? (tree-left tree) value)
        (bst-contains? (tree-right tree) value)))))
```

```
user=> (bst-contains? account-tree 70)
true
user=> (bst-contains? account-tree 65)
false
```

Trace `(bst-contains? account-tree 65)`: `65 < 50`? No — so only the *right* subtree is checked, the left subtree (containing `30`, which the binary-search-tree property already guarantees is too small to matter) is never even looked at. Continuing into the right subtree (rooted at `80`): `65 < 80`? Yes — only the *left* subtree of `80` (containing `70`) is checked, and `80`'s own right subtree is skipped entirely. `65 < 70`? Yes — check `70`'s left subtree, which is empty — base case, `false`.

Only three nodes were ever examined (`50`, `80`, `70`) out of the tree's four total — and for a much larger binary search tree, this pattern discards roughly *half* the remaining tree at every single step, rather than examining every node the way `tree-contains?` always does.

### Discard the throwaway example

Not applicable — `bst-contains?` is a real, reusable function, and a meaningfully better one for binary search trees specifically.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `account-tree`, from Lesson 30.

### The New Code — type it yourself

```clojure
(defn bst-contains? [tree value]
  (if (empty? tree)
    false
    (if (= (tree-value tree) value)
      true
      (if (< value (tree-value tree))
        (bst-contains? (tree-left tree) value)
        (bst-contains? (tree-right tree) value)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (< value (tree-value tree)) (bst-contains? (tree-left tree) value) (bst-contains? (tree-right tree) value))`** — first appearance of a tree search making *exactly one* recursive call instead of two, chosen by comparing `value` against the current node — this is only correct because the binary-search-tree property (Lesson 31) guarantees the *other* subtree cannot possibly contain `value`, making it safe to skip without checking.

### CS Lens

This is Lesson 1's own opening example (binary search), realized directly on a tree instead of a sorted list: "we have an ordered domain; ordering lets us eliminate roughly half the remaining possibilities with one comparison; repeated halving produces logarithmic depth" — precisely the derivation Lesson 1 sketched in the abstract, now shown concretely, and formalized fully once Lesson 91 (*Binary Search*) and Lesson 92 (*Binary Search Trees*) arrive.

### SE Lens

`bst-contains?`'s speed advantage over `tree-contains?` depends entirely on the tree actually *being* a valid binary search tree — run on a tree that violates the ordering property (Lesson 31's Exercise 4 built exactly such a tree), `bst-contains?` would silently follow the wrong branch and report a wrong answer, trusting a structural guarantee that doesn't actually hold. A faster algorithm that depends on an assumption is only as trustworthy as that assumption is verified.

### Connection to the previous unit

The previous unit searched a tree with no assumptions about its structure, examining everything in the worst case; this unit uses one additional, verified fact about the tree's structure to eliminate roughly half the search space at every step — the same underlying question, answered dramatically faster once the right structural guarantee is available to exploit.

---

## Concept Unit: Generating a Search Space — Every Subset of a Set

### The Problem

Both search functions explored a tree that already existed. Some problems need the opposite: there's no tree to search yet, only a collection of choices, and every possible *combination* of those choices needs to be produced. Given a list of items, what does generating every possible subset — the complete space of "include or exclude each item" decisions — actually look like?

### Introduce the concept in isolation

```clojure
(defn power-set [lst]
  (if (empty? lst)
    (list (list))
    (my-append
      (map (fn [subset] (cons (first lst) subset)) (power-set (rest lst)))
      (power-set (rest lst)))))
```

```
user=> (power-set (list 1 2))
((1 2) (1) (2) ())
```

**Base case:** the power set of the empty list is a list containing exactly one thing — the empty list itself (there's exactly one way to choose nothing from nothing). **Recursive case:** every subset either includes the first element or it doesn't — `(map (fn [subset] (cons (first lst) subset)) (power-set (rest lst)))` takes every subset of the *rest* of the list and adds the first element to each one (the "include it" choice); `(power-set (rest lst))`, used again unchanged, supplies every subset that leaves the first element out (the "exclude it" choice); `my-append` combines both halves into the complete set of possibilities.

### Discard the throwaway example

Not applicable — `power-set` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of "every element is either included or excluded," recursively applied to each remaining element.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`, `map`.

### The New Code — type it yourself

```clojure
(defn power-set [lst]
  (if (empty? lst)
    (list (list))
    (my-append
      (map (fn [subset] (cons (first lst) subset)) (power-set (rest lst)))
      (power-set (rest lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(list (list))`** — the base case's answer: not the empty list itself, but a list *containing* the empty list — the crucial distinction being that the power set of nothing is one possibility (choose nothing), not zero possibilities.
- **`(map (fn [subset] (cons (first lst) subset)) (power-set (rest lst)))`** — reappearing `map` (Lesson 25), here transforming an entire generated collection of subsets rather than a collection of plain values — proof `map` works identically regardless of what kind of values fill the list it's given.
- **`(my-append ... (power-set (rest lst)))`** — reappearing `my-append` (Lesson 28), combining the "included" and "excluded" halves of the search space into one complete list of possibilities.

### CS Lens

`power-set` is a **generator** in exactly this lesson's sense: it produces an entire search space from scratch — every combination of "include or exclude," for every element — rather than searching through data that already exists. This exact space (every subset of a set) is the search space Lesson 33's backtracking explores directly, and the same "each choice branches into include/exclude" structure recurs throughout Section VI's combinatorial algorithms.

### SE Lens

`power-set`'s output grows extremely fast — doubling with every additional element in the input list (a list of `n` elements produces `2ⁿ` subsets), a direct, concrete preview of the exponential growth Section IV formalizes properly. Generating every possibility is only practical for small inputs; Lesson 33's backtracking exists specifically to explore a space shaped like this one *without* generating every single possibility outright, whenever most of them can be ruled out early.

### Connection to the previous unit

The previous two units searched a tree that already existed, using its structure to search faster or more thoroughly; this unit builds an entirely new structure — the complete space of subset choices — from nothing but a list and the recursive "include or exclude" decision applied to each of its elements.

---

## Connect the Pieces

Search and generation, side by side, on data drawn from this series' own theme:

```clojure
(def watched-amounts (power-set (list 10 20 30)))

(println "Every possible combination of these three amounts:" watched-amounts)
(println "Does any combination sum to exactly 30?"
         (or (tree-contains? small-tree 30)
             (not (empty? (filter (fn [combo] (= (reduce + 0 combo) 30)) watched-amounts)))))
```

```
Every possible combination of these three amounts: ((10 20 30) (10 20) (10 30) (10) (20 30) (20) (30) (30) ())
Does any combination sum to exactly 30? true
```

`power-set` generates every combination of the three amounts — eight of them, `2³`, exactly as Concept Unit 3's SE Lens predicted. The final check combines this lesson's search vocabulary with Lesson 26's `filter` and Lesson 27's `reduce`: checking whether *any* generated subset sums to a target value is an existential claim (Lesson 9) over a *generated* search space, rather than an *already-existing* one — the same underlying question this whole lesson has been asking, now over data built specifically to be searched.

## What Breaks Without This

Suppose `bst-contains?` were used on a tree that looked like a binary search tree at a glance but actually violated the ordering property somewhere deep inside it (the way Lesson 31's Exercise 4 constructed one deliberately):

```
Tree (violates BST property: 60 appears in a left subtree of 50, but 60 > 50):
      50
     /  \
   60    80
```

```
user=> (bst-contains? {tree above} 60)
```

Following `bst-contains?`'s own logic: `60 < 50`? No — so it searches the *right* subtree (`80`), never checking the left subtree where `60` actually sits, because the algorithm trusts the binary-search-tree property to guarantee the left subtree only contains values less than `50`. Since that guarantee doesn't actually hold here, `bst-contains?` reports `false` for a value that's really present — a wrong answer produced with complete internal consistency, exactly Lesson 1's original warning about a technically-executed procedure trusting an assumption nothing verified.

## Exercises

1. **Trace.** By hand, trace `(bst-contains? account-tree 30)`, showing which comparisons are made and which subtrees are skipped.
2. **Predict.** Before running it, predict how many total subsets `(power-set (list 1 2 3 4))` produces, using the doubling pattern from Concept Unit 3. Verify by running it and counting.
3. **Compare.** Run both `tree-contains?` and `bst-contains?` on `account-tree` searching for a value that isn't present (like `99`), and count how many nodes each one actually examines. Are the counts the same or different, and why?
4. **Break it, on purpose.** Build a tree that superficially looks like a binary search tree but violates the property somewhere, the way "What Breaks Without This" described. Confirm `bst-contains?` gives a wrong answer for a value hidden by the violation.
5. **Generalize.** Using `power-set` and `filter`, write a one-line expression that finds every subset of `(list 10 20 30 40)` summing to at least `50`.
6. **Reconstruct.** Close this lesson. From memory, explain why `bst-contains?` only needs one recursive call while `tree-contains?` needs two, and explain the difference between "searching a space" and "generating a space."

## Definition of Done

- [ ] You can write both `tree-contains?` and `bst-contains?`, and explain precisely why the second one is faster, using the binary-search-tree property directly.
- [ ] You completed Exercise 3 and can state, concretely, the difference in nodes examined between the two search functions on the same tree.
- [ ] You can write `power-set` from scratch, correctly handling the base case (one subset, not zero).
- [ ] You completed Exercise 5, combining `power-set` and `filter` to answer a real question about generated combinations.
- [ ] Commit your Exercise 3 comparison and Exercise 5 solution to your notes repository, with a commit message stating the concrete node counts you found — for example, `"Compare tree-contains? (4 nodes examined) vs bst-contains? (2 nodes examined) searching for absent value 99 in account-tree"` — not just `"lesson 32 exercise"`.

---

**Next lesson:** Lesson 33, *Backtracking*, takes this lesson's `power-set` generator and shows how to explore the identical search space *without* generating every possibility outright — abandoning a branch the moment it's known to be hopeless, rather than following it all the way to the end first.
