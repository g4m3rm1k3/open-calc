# Lesson 19: Recursive Definitions

**What you will build**: By the end of this lesson you'll be able to recognize and write a recursive definition — an object defined partly in terms of a smaller instance of the exact same kind of object — and you'll have seen the same underlying pattern used to define natural numbers, lists, and trees, the three data shapes this entire section is built around. No code runs in this lesson; the next one is where these definitions start producing real, callable Clojure functions.

**What you need to know first**: Mathematical induction's base case and inductive step — this lesson shows those two parts weren't just a proof technique; they're also a way to *define* things, not only to prove properties about them.

**A note on this lesson's format**: Like Lesson 1, this lesson stays entirely conceptual. Its job is establishing what a recursive definition *is*, precisely, before any of the three examples it covers (numbers, lists, trees) become real, runnable Clojure — Lesson 20 is where the first recursive function appears, and Lesson 24 is where lists specifically get built from first principles in code.

**Terms introduced in this lesson**:

- **recursive definition** — a definition that specifies every instance of some kind of object using one or more base cases (given directly, with no reference to the pattern being defined) and one or more recursive cases (built from a smaller instance of that exact same kind of object). *Why it matters*: this single pattern, substituted with three different "smaller instance" rules, is about to define natural numbers, lists, and trees — the three data shapes the rest of this section studies in depth.
- **recursive case** — the part of a recursive definition that builds a new, larger instance out of a smaller instance of the same kind. *Why it matters*: the generative counterpart to a proof's inductive step — where an inductive step *proves* a property propagates from a smaller case to a larger one, a recursive case *constructs* the larger object directly from the smaller one, using the identical smaller-to-larger shape.
- **successor** — the natural number one greater than a given natural number. *Why it matters*: this is the specific recursive case Peano's definition of the natural numbers uses — every natural number beyond `0` is defined as *the successor of* some other natural number, and nothing else.

**Objects and methods used**: None. This lesson introduces no code — see the note above.

---

## Concept Unit: What Is a Recursive Definition?

### The Problem

Lesson 15 proved things about *every* natural number using a base case and an inductive step — two finite facts covering infinitely many numbers. But where did "every natural number" itself come from? What actually specifies the complete, infinite collection of natural numbers in the first place, precisely enough to prove things about all of them?

### The Concept, Concretely

A **recursive definition** answers exactly this kind of question, for numbers and for many other things: define the very smallest instance directly (the **base case**), and define every other instance in terms of a smaller instance of the identical kind of thing (the **recursive case**). Nothing else is needed — every instance, however large, is reachable by starting at the base case and applying the recursive case some number of times.

This is precisely Lesson 15's base case and inductive step, reused for a different job: an inductive step *proves* a property survives from one case to the next; a recursive case *constructs* a new instance from a smaller one. Same two-part shape — base case, then a rule connecting a case to the next one — doing two different, closely related jobs: proving things, or building things.

### Generalizing

This pattern isn't specific to numbers. The next three units apply the identical shape — one base case, one recursive case — to numbers, to lists, and to trees, and each time, the same question gets asked and answered the same way: what's the smallest instance, and how does every larger instance get built from a smaller one of the same kind?

### Formal Definition, Walked Through

> A **recursive definition** of a class of objects specifies: (1) one or more **base cases** — specific objects that belong to the class, stated directly; and (2) one or more **recursive cases** — rules that produce a new object belonging to the class from one or more objects already known to belong to it (typically smaller, in some precise sense, than the object being produced).

- *"stated directly"* — a base case never refers to the class being defined; it's simply given, the same way Lesson 15's base case was checked directly rather than derived from anything.
- *"from one or more objects already known to belong to it"* — this is what makes the definition well-founded rather than circular: each recursive case's input is *already established* to belong to the class (by an earlier base case or recursive case application), never something the definition is still in the middle of trying to establish.

### CS Lens

Also recognized in: a family tree (every person either has no recorded ancestors listed — a base case — or is defined by *being the child of* people already in the tree — a recursive case), a company's organizational chart (a base case of individual contributors with no reports, and a recursive case of managers defined by *managing* people already in the chart), and a Matryoshka doll (the smallest doll is solid — a base case — and every larger doll is defined by *containing* a smaller doll — the recursive case).

### SE Lens

The alternative to a recursive definition — trying to describe "every natural number" or "every possible list" by listing examples, or by a vague description like "as many as you need" — doesn't actually specify anything precise enough to write a program against, or a proof about. A recursive definition, by contrast, is finite to *state* (one base case, one recursive case) while precisely specifying an infinite collection — exactly the same finite-proof-covers-infinite-cases payoff Lesson 15's induction already demonstrated, now doing the defining instead of the proving.

---

## Concept Unit: Natural Numbers, Defined Recursively

### The Problem

"The natural numbers are `0, 1, 2, 3, ...`" trails off with "..." — an appeal to the reader already knowing what comes next, not a real definition. What's the actual base case and recursive case that pin down the natural numbers precisely, the way Lesson 1 insisted every specification should be precise?

### The Concept, Concretely

**Base case:** `0` is a natural number.

**Recursive case:** if `n` is a natural number, then the **successor** of `n` — one greater than `n` — is also a natural number.

Every natural number, under this definition, is reachable by starting at `0` and applying the recursive case some number of times: `1` is the successor of `0`; `2` is the successor of `1` (which is the successor of `0`); `3` is the successor of `2`; and so on. Nothing is a natural number unless it's reachable this way — this definition doesn't just describe the natural numbers, it's precise enough to rule things *out*: there's no natural number that isn't either `0` or the successor of some other natural number.

### Generalizing

This is the exact reason Lesson 15's induction works at all: induction's base case (`P(0)`) and inductive step (`P(n)` implies `P(n+1)`) directly mirror this definition's base case (`0` is a natural number) and recursive case (the successor of a natural number is a natural number) — proving a property for every natural number *is* following the natural numbers' own recursive definition, one step at a time, exactly the way the numbers themselves are built.

### Formal Definition, Walked Through

> The natural numbers are defined recursively: `0` is a natural number (base case); if `n` is a natural number, `successor(n)` is a natural number (recursive case); and nothing is a natural number except by one of these two rules.

- *"nothing is a natural number except by one of these two rules"* — this closing clause matters as much as the first two: without it, the definition would only say "these things are included," not "these are the *only* things included" — the difference between a recursive definition and a mere recursive description.

### CS Lens

This precise style of definition — due to the mathematician Giuseppe Peano — is exactly what Lesson 254's *finite automata* and Lesson 259's *Turing machines* both build on: a small, finite set of rules (a base case, or "start state," plus rules for producing new states) that precisely characterizes a potentially infinite space of possibilities, with nothing left to intuition.

### SE Lens

Clojure represents natural numbers with ordinary numeric literals (`0`, `1`, `2`, ...) rather than literally building them out of nested "successor of successor of..." — a deliberate, practical choice every real language makes, trading the recursive definition's conceptual clarity for direct hardware-level representation (Section IX covers exactly how, much later). The recursive definition still matters even though it's not how numbers are physically stored: it's what justifies induction working on them at all, and it's the exact template the next two units reuse for data that *does* get represented recursively in real code.

### Connection to the previous unit

The previous unit stated the general two-part shape; this unit is the first concrete instance of it, and the one this series has already been leaning on implicitly, every time an induction proof relied on "every natural number is reachable from `0` by repeatedly adding `1`."

---

## Concept Unit: Lists, Defined Recursively

### The Problem

A list — an ordered sequence of values, like the transaction amounts Lesson 1 traced by hand — has no fixed length. "A list is some values in a row" is exactly as imprecise as "the natural numbers are `0, 1, 2, ...`" was. What's the actual base case and recursive case?

### The Concept, Concretely

**Base case:** the empty list — a list with no elements — is a list.

**Recursive case:** if `L` is a list, and `x` is any value, then the list formed by placing `x` in front of `L` is also a list.

Every list, under this definition, is reachable by starting at the empty list and applying the recursive case some number of times: a one-element list is some value placed in front of the empty list; a two-element list is some value placed in front of a one-element list; and so on. The list `[10, 20, 5]` (using ordinary notation, not yet Clojure's own) is, under this definition, `10` placed in front of (`20` placed in front of (`5` placed in front of the empty list)) — built entirely from the base case and one recursive case, applied three times.

### Generalizing

Notice the exact parallel with natural numbers: the empty list plays the role `0` played; "place a value in front of a smaller list" plays the role `successor` played. Same two-part shape, same "nothing belongs except by these rules" completeness — only the specific base case and recursive case changed.

### Formal Definition, Walked Through

> A **list** is defined recursively: the empty list is a list (base case); if `x` is a value and `L` is a list, the pair of `x` together with `L` — `x` at the front, `L` as everything after it — is a list (recursive case); and nothing is a list except by one of these two rules.

- *"nothing is a list except by one of these two rules"* — rules out, precisely, anything that isn't built by repeatedly placing a value in front of a smaller list, starting from empty — the same completeness clause natural numbers needed.
- The specific operation "place a value in front of a smaller list" has a real name in Clojure, and a full, hands-on treatment — including how to actually build and take apart a list this way in running code — waiting in Lesson 24. This lesson establishes only the definition's shape; Lesson 24 makes it real.

### CS Lens

This exact recursive shape — an empty case, plus "one thing in front of a smaller version of the same structure" — is the foundation Lesson 24's list operations, Lesson 25's `map`, Lesson 26's `filter`, and Lesson 27's `reduce` are all built directly on top of: every one of those tools works by handling the empty-list base case and the "one element plus a smaller list" recursive case, exactly as defined here.

### SE Lens

Defining a list recursively — rather than as, say, a fixed-size block of memory with a stored length — is what makes operations like Lesson 28's `append` naturally recursive themselves: appending to a list built this way only ever has to handle two cases, matching the definition's own two cases exactly, rather than needing to reason about indices, bounds, or a separately-tracked length at all.

### Connection to the previous unit

The previous unit defined natural numbers with a base case and a "one more than a smaller number" recursive case; this unit defines lists the identical way, substituting "one value in front of a smaller list" for "one more than a smaller number" — the same shape, doing a different job.

---

## Concept Unit: Trees, Defined Recursively

### The Problem

A list has one "next" element in a row. Some real data doesn't sit in a row — an organizational chart, a filesystem's folders, or Lesson 11's dependency relation, followed to arbitrary depth, all branch outward rather than continuing linearly. Does the same recursive shape from numbers and lists extend to something that branches?

### The Concept, Concretely

**Base case:** the empty tree — a tree with nothing in it — is a tree.

**Recursive case:** if `v` is a value, and `L` and `R` are trees, then the structure formed by `v` together with `L` as its left subtree and `R` as its right subtree is also a tree.

This is one specific, common shape of tree (a **binary tree**, where every value has at most two subtrees) — trees can be defined with any number of subtrees per value, but the two-subtree case is enough to show the pattern. Every binary tree, under this definition, is reachable from the empty tree by repeatedly applying the recursive case: a tree holding a single value `v`, with nothing below it, is `v` together with two empty trees as its left and right subtrees.

### Generalizing

The exact same shape as before: an empty (or smallest) case, plus a rule building a larger instance from smaller instances *of the same kind*. Trees differ from lists in exactly one place — the recursive case refers to *two* smaller instances (`L` and `R`) instead of one — everything else about the definition's structure (a base case, a rule for building larger from smaller, nothing else counts) is identical.

### Formal Definition, Walked Through

> A **binary tree** is defined recursively: the empty tree is a binary tree (base case); if `v` is a value and `L` and `R` are binary trees, the structure with `v` at its root, `L` as its left subtree, and `R` as its right subtree, is a binary tree (recursive case); and nothing is a binary tree except by one of these two rules.

- *"L and R are binary trees"* — both subtrees must themselves satisfy this exact same definition, recursively — a left subtree that's "almost" a tree but breaks the rule somewhere doesn't count, the same completeness this lesson has required of every definition so far.

### CS Lens

This recursive shape is exactly what Lesson 30 (*Trees as Recursive Data*) builds on directly, and it's the same underlying structure behind a filesystem's nested folders (each folder containing files and further folders, recursively), an HTML document's nested tags (each element potentially containing further elements), and a decision procedure's branching logic (each decision leading to two further decisions, recursively, until a final outcome).

### SE Lens

A tree's recursive definition is what makes Lesson 31's traversal algorithms (preorder, inorder, postorder) each expressible in a few lines: handle the empty-tree base case, then recursively handle the left subtree and the right subtree — the algorithm's shape follows the data's own recursive shape directly, the same connection Lesson 21 (*Structural Recursion*) names explicitly as a general principle, immediately after this section's first real recursive functions appear.

### Connection to the previous unit

The previous unit's list had exactly one smaller instance per recursive case (the rest of the list); this unit's tree has two (a left subtree and a right subtree) — proof that the recursive-definition pattern isn't limited to a single "next" step, and generalizes cleanly to structures that branch.

---

## Connect the Pieces

All three definitions, side by side, showing the one shared pattern underneath:

| | Base case | Recursive case |
|---|---|---|
| Natural numbers | `0` | successor of a smaller natural number |
| Lists | the empty list | a value in front of a smaller list |
| Binary trees | the empty tree | a value with two smaller trees (left and right) |

Every row answers the identical two questions — what's the smallest instance, and how is a larger instance built from smaller instances of the same kind — with a different concrete answer. This is the single pattern the rest of this section spends its next twenty-one lessons applying: Lesson 20 writes the first function that follows a recursive definition's own shape; Lesson 21 names why that's not a coincidence; and by Lesson 30, trees get exactly the same "recursive functions follow recursive data" treatment lists receive starting in Lesson 24.

## What Breaks Without This

Suppose the natural numbers' definition dropped its completeness clause — "nothing is a natural number except by these two rules" — and just stated the base case and recursive case, without ruling anything out. Nothing then prevents, say, "purple" from also being declared a natural number, arbitrarily, alongside `0, 1, 2, ...` — the definition never said it couldn't be. This isn't a pedantic technicality: it's exactly what makes Lesson 15's induction valid in the first place. Induction's conclusion — "true for every natural number" — is only trustworthy if "every natural number" is *exactly* `0` and its successors, nothing more, nothing arbitrary included. A recursive definition without its completeness clause defines a *superset* of what's intended, potentially including things no inductive proof ever accounted for.

## Exercises

1. **Trace.** Write out `4`'s full construction from `0`, using only "base case" and "successor of," the way this lesson built `3`.
2. **Predict.** Before writing it out, predict how many times the recursive case would need to apply to build a five-element list from the empty list. Write out the construction to check.
3. **Define.** Write a recursive definition, with an explicit base case and recursive case, for "a non-empty list" (a list with at least one element) — note that this can't use the empty list as its base case the way an ordinary list definition does; what's the smallest non-empty list?
4. **Break it, on purpose.** Write a "recursive definition" for lists that's missing its completeness clause, the way "What Breaks Without This" described for natural numbers, and describe one thing it would incorrectly allow to count as a list.
5. **Generalize.** Trees, as defined in this lesson, allow at most two subtrees per value. Write a recursive definition for a tree where each value can have *any number* of subtrees (not just two) — what changes, and what stays the same, compared to the binary tree definition?
6. **Reconstruct.** Close this lesson. From memory, state the two-part shape every recursive definition shares, and explain, using Peano's natural numbers, why this is the same shape as mathematical induction's base case and inductive step.

## Definition of Done

- [ ] You can state the base case and recursive case for natural numbers, lists, and binary trees, from memory.
- [ ] You can explain why a recursive definition needs a completeness clause ("nothing else counts"), not just a base case and a recursive case.
- [ ] You completed Exercise 3, correctly identifying that a non-empty list's base case can't be the empty list.
- [ ] You can explain, precisely, why induction's base case and inductive step are the same shape as a recursive definition's base case and recursive case, not merely similar-sounding.
- [ ] Commit your Exercise 5 general-tree definition to your notes repository, with a commit message stating what changed from the binary case — for example, `"Generalize tree definition to any number of subtrees — recursive case now takes a list of trees instead of exactly two"` — not just `"lesson 19 exercise"`.

---

**Next lesson:** Lesson 20, *Recursive Functions*, writes this series' first real recursive Clojure function — derived directly from a recursive definition's own base case and recursive case, rather than invented separately from it.
