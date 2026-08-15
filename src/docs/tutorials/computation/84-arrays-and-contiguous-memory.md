# Lesson 84: Arrays and Contiguous Memory

**What you will build**: By the end of this lesson you'll be able to derive *why* array access is constant-time — not as a fact to memorize, but from the actual mechanism, contiguous memory and address arithmetic — and use Clojure's vector as this section's array representation, confirming Lesson 83's prediction that this new representation must pay for its cheap access somewhere else.

**What you need to know first**: Lesson 83's representation/cost-profile distinction, and Lesson 51's Big-O.

**Terms introduced in this lesson**:

- **array** — a collection whose elements are stored so that any element's position can be computed directly, without walking from the start. *Why it matters*: this structural property is exactly what lists (Lesson 24) lack, and exactly what makes constant-time access possible.
- **contiguous memory** — elements stored back-to-back, each occupying the same fixed amount of space. *Why it matters*: this is the actual, physical mechanism behind constant-time array access — not a special trick, simple arithmetic on a memory address.
- **index** — an element's position within an array, counted from `0`. *Why it matters*: the `i` in "compute the address of element `i` directly," the quantity contiguous memory turns into cheap arithmetic instead of an `O(n)` walk.

**Objects and methods used**:

- **`[...]` (vector literal)**
  - *What it is:* Clojure's syntax for a vector — this section's array representation.
  - *Implementation:* `[10 20 30 40 50]` — a fixed sequence of values, written with square brackets instead of `list`'s parentheses.
  - *Its use:* Concept Unit 1, onward, as the representation this entire lesson is about.
- **`get`**
  - *What it is:* a function that retrieves the value at a given index of a vector.
  - *Implementation:* `(get a-vector i)` — returns the element at position `i`, directly, without inspecting any other position.
  - *Its use:* Concept Unit 1, to demonstrate constant-time access.
- **`assoc`**
  - *What it is:* a function that returns a *new* vector with one position changed, leaving the original vector completely unchanged.
  - *Implementation:* `(assoc a-vector i new-value)` — the original vector is never mutated; a new one, differing only at position `i`, is returned.
  - *Its use:* Concept Unit 2, to update a vector's contents.

---

## Concept Unit: Deriving Constant-Time Access

### The Problem

Lesson 83 showed `value-at`, walking a list position by position, costs `O(n)`. Is there a representation where accessing "the element at position `i`" doesn't require walking past everything before it?

### Introduce the concept in isolation

In **contiguous memory**, every element is stored back-to-back, each taking up the identical, fixed amount of space. This means the memory address of element `i` is computable directly, with simple arithmetic:

```
address of element i = base address + (i × element size)
```

No walking is needed at all — the address of, say, element `4` is computed exactly the same way as the address of element `0`, just with a different multiplication. This is the entire mechanism behind an **array**'s constant-time access; it isn't a special optimization, it's a direct structural consequence of how the elements are laid out.

```clojure
(def numbers [10 20 30 40 50])
```

```
user=> (get numbers 2)
30
user=> (get numbers 0)
10
```

Both calls do the identical amount of work — one address computation, one memory read — regardless of which index is requested, or how large the vector is. This is genuinely different from Lesson 81's `value-at`, which must recurse `i` times before it can even look at the target element.

### Discard the throwaway example

Not applicable — `numbers` and `get` demonstrate a real, general property of this representation.

### Project Change

- **Reference Source**: No reference counterpart — a direct introduction of Clojure's vector as this section's array representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def numbers [10 20 30 40 50])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[10 20 30 40 50]`** — first appearance of vector syntax (covered fully in Objects and methods used, above): visually distinct from `list`'s parentheses, signaling a genuinely different representation, not just different notation for the same thing.
- **`(get numbers 2)`** — first appearance of `get` (covered fully in Objects and methods used, above): retrieves position `2` directly — the concrete Clojure operation standing in for the address-arithmetic mechanism just derived.

### CS Lens

This lesson's derivation — address arithmetic, not magic — is exactly the kind of mechanism-first reasoning this series has insisted on throughout: Lesson 42's Horner's method and Lesson 55's GCD identity were both *derived*, not memorized, and "array access is `O(1)`" gets the identical treatment here, rather than being accepted as a fact to simply remember.

### SE Lens

Clojure's vector doesn't literally implement raw contiguous memory the way a low-level array in C does (its real implementation is a specific tree-shaped structure, a topic Lesson 104's persistent data structures returns to directly) — but it provides the identical *practical* guarantee this lesson derives: access by index costs the same, small amount of work regardless of position or size, which is the property this lesson is actually about.

---

## Concept Unit: The Cost Arrays Pay in Exchange

### The Problem

Lesson 83 already predicted no representation dominates every operation. If arrays make access cheap, what do they make *expensive* — mirroring `cons`'s cheap `O(1)` prepend on lists?

### Introduce the concept in isolation

```
user=> (assoc numbers 2 99)
[10 20 99 40 50]
user=> numbers
[10 20 30 40 50]
```

`assoc` never mutates `numbers` itself — it returns a *new* vector, differing at one position, leaving the original completely intact (Clojure's vectors, like every value this series has used since Lesson 3, are immutable). Now consider inserting a brand-new element at the *front* — every existing element's position shifts by one, meaning a genuinely new vector, built from scratch, is required:

```clojure
(vec (cons 0 numbers))
```

```
user=> (vec (cons 0 numbers))
[0 10 20 30 40 50]
```

Unlike `cons` alone (`O(1)` on a list, Lesson 83), `vec` must build an entirely new vector containing every element — `O(n)` work, precisely because contiguous memory's own defining property (fixed, back-to-back positions) means "insert something before everything else" cannot be done without touching everything that comes after it.

### Discard the throwaway example

Not applicable — this cost contrast is a genuine, general property of the vector representation.

### Mechanical walkthrough — how it works in isolation

- **`assoc`** — first appearance as a called function (covered fully in Objects and methods used, above): changes one position, returning a new vector — genuinely cheaper than rebuilding the whole thing from an inserted-at-front list, since only one position's value actually differs.
- **`(vec (cons 0 numbers))`** — `cons` itself is still `O(1)` (building a list with one new front element, Lesson 83's own reused fact); `vec`, converting that list back into a vector, is what actually costs `O(n)`, since every one of the original elements must be copied into the new vector's contiguous layout.

### CS Lens

This is Lesson 83's central claim, now demonstrated concretely on a second representation: arrays make position-based access `O(1)`, exactly the operation lists made `O(n)` — but front-insertion, `O(1)` on lists via `cons`, becomes `O(n)` on arrays. Neither representation is better; each makes a different, deliberate tradeoff.

### SE Lens

A real program that frequently inserts elements at the front of a growing collection, but rarely accesses by position, would be fighting against an array's actual cost profile — exactly the kind of representation mismatch Lesson 83's closing section warned about, now demonstrated with a second, concrete example instead of only a list-based one.

### Connection to the previous unit

The previous unit derived arrays' constant-time access from contiguous memory's own structure; this unit shows that identical structural property — fixed, back-to-back positions — is exactly what makes front-insertion expensive, the same underlying mechanism producing both the benefit and the cost.

---

## Connect the Pieces

Both representations' cost profiles, side by side:

```clojure
(println "Array access, O(1):" (get numbers 2))
(println "Array front-insert, O(n):" (vec (cons 0 numbers)))
(println "List access (Lesson 81), O(n):" (value-at (list 10 20 30 40 50) 2))
(println "List front-insert (Lesson 83), O(1):" (cons 0 (list 10 20 30 40 50)))
```

```
Array access, O(1): 30
Array front-insert, O(n): [0 10 20 30 40 50]
List access (Lesson 81), O(n): 30
List front-insert (Lesson 83), O(1): (0 10 20 30 40 50)
```

The identical logical data (`10, 20, 30, 40, 50`), the identical two operations, and two representations whose cost profiles are exact mirror images of each other — access and front-insertion swap which one is cheap and which one is expensive, precisely confirming Lesson 83's prediction that representation, not data, determines cost.

## What Breaks Without This

Suppose a program needed to repeatedly insert new elements at the front of a large, growing collection — a queue-like access pattern — and used a vector for it, having learned only "arrays are fast" without learning *which* operations that speed applies to. Every single insertion would cost `O(n)`, rebuilding the entire structure, and that cost would grow as the collection grows — a real, worsening problem, invisible until the collection becomes large enough to notice. Lesson 86's stacks and Lesson 87's queues, immediately ahead, exist precisely to formalize which representation actually suits which access pattern, avoiding exactly this mismatch.

## Exercises

1. **Trace.** By hand, explain why `(get numbers 4)` and `(get numbers 0)` cost the identical amount of work, using this lesson's address-arithmetic derivation.
2. **Predict.** Before checking, predict whether `(assoc numbers 0 99)` is cheaper, more expensive, or the same cost as `(assoc numbers 4 99)`. Justify using contiguous memory's own structure.
3. **Verify.** Confirm, using `def` and two separate `println` calls, that `assoc` genuinely leaves its original vector unchanged, the way this lesson's REPL trace showed.
4. **Break it, on purpose.** Attempt to write a version of `value-at` (Lesson 81) that works on a vector instead of a list, but keeps the identical recursive, walk-from-the-start structure. Explain why doing this would be a real mistake — throwing away the vector's actual advantage.
5. **Generalize.** Using `get` and recursion, write a function `vector-sum` that adds up every element of a vector, and determine whether its cost is `O(1)` or `O(n)`, and why.
6. **Reconstruct.** Close this lesson. From memory, derive why array access is constant-time from contiguous memory's structure, and state which operation becomes expensive in exchange.

## Definition of Done

- [ ] You can derive constant-time array access from contiguous memory's address arithmetic, from memory.
- [ ] You can state which operation becomes expensive on arrays, and why, using the same underlying structural property.
- [ ] You completed Exercise 3 and confirmed `assoc`'s immutability directly.
- [ ] You completed Exercise 5 and correctly classified `vector-sum`'s cost.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified — for example, `"Confirm assoc leaves original vector unchanged; classify vector-sum as O(n)"` — not just `"lesson 84 exercise"`.

---

**Next lesson:** Lesson 85, *Linked Structures*, derives lists' own actual mechanism — references connecting one node to the next — directly from recursive data, formalizing what Lesson 24's lists have secretly been built from this entire series.
