# Lesson 83: Why Data Structures Exist

**What you will build**: By the end of this lesson you'll be able to state precisely why this new section exists at all — by measuring, using Lesson 51's Big-O directly, that operations on the *identical* logical collection of values cost wildly different amounts depending purely on how that collection is represented, not on the values themselves.

**What you need to know first**: Lesson 51's Big-O, Lesson 81's `value-at`, and ordinary list operations (`cons`, `first`, `rest`) from throughout this series.

**Terms introduced in this lesson**:

- **representation** — the concrete, specific way a collection of values is actually laid out and accessed in memory. *Why it matters*: this entire section exists because the same logical collection — "five numbers, in order" — can be represented in genuinely different ways, and the representation, not the data itself, determines what each operation costs.

**Objects and methods used**: None new. This lesson combines `cons`, `first`, `rest`, and `empty?`, each already covered.

---

## Concept Unit: One Logical Collection, Two Different Costs

### The Problem

Every collection of values in this series, since Lesson 24, has been a list. Is a list simply "a collection of values," with one single cost for working with it — or does that cost depend on *which* operation is actually performed?

### Introduce the concept in isolation

```clojure
(defn list-length [lst]
  (if (empty? lst)
    0
    (+ 1 (list-length (rest lst)))))
```

```
user=> (cons 0 (list 1 2 3 4 5))
(0 1 2 3 4 5)
user=> (list-length (list 1 2 3 4 5))
5
user=> (value-at (list 1 2 3 4 5) 4)
5
```

`cons`, adding one new value to the *front* of a list, does a fixed, constant amount of work — Big-O's `O(1)` (Lesson 51) — regardless of whether the list has `5` elements or `5` million. `list-length` and `value-at` (Lesson 81's own accessor, reused directly) are entirely different: each must walk the *entire* list up to the position in question, `O(n)` work, genuinely growing with the list's size. Three operations, on the identical kind of data, with two completely different growth-rate categories (Lesson 50).

### Discard the throwaway example

Not applicable — `list-length` is a real function, and this cost contrast is the entire point of the lesson.

### Project Change

- **Reference Source**: `value-at`, from Lesson 81, reused directly as a second `O(n)` example.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn list-length [lst]
  (if (empty? lst)
    0
    (+ 1 (list-length (rest lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons 0 (list 1 2 3 4 5))`** — reappearing `cons` (used informally since around Lesson 53): builds a new list by attaching one value in front of an existing list, without inspecting or copying any of that existing list's own elements — the reason this costs the identical, fixed amount of work no matter how long the list already is.
- **`list-length`** — reappearing counting-recursion shape (Lesson 20): must recurse all the way to the list's end before it can return anything at all, touching every single element exactly once.

### CS Lens

This is precisely why Big-O (Lesson 51) is stated *per operation*, never as a single number describing an entire data structure: "a list" has no one cost — `cons` onto the front is `O(1)`, while `list-length` and position-based access are `O(n)`, on the exact same structure holding the exact same values.

### SE Lens

A real, common design mistake is choosing a data structure based on how it's *usually* described ("a list is fast") rather than which specific operations the actual program performs most often — this lesson's own three examples already show that question has no single right answer independent of which operation is meant.

---

## Concept Unit: Choosing a Representation Is Choosing a Cost Profile

### The Problem

If lists make position-based access expensive, is there a different way to represent "five numbers, in order" where that specific operation is cheap instead?

### Introduce the concept in isolation

Yes — and this is precisely what the rest of this section builds, one representation at a time. An **array** (Lesson 84, next) represents the identical logical collection differently, making position-based access `O(1)` — but, as Lesson 84 will show concretely, at a real cost somewhere else in exchange. No representation this section builds will be strictly better than lists at *everything*; each one is a different, deliberate set of tradeoffs.

### Discard the throwaway example

Not applicable — this unit is a conceptual bridge to the rest of the section, not new code.

### CS Lens

This is the organizing idea behind Section V as a whole: "collection of values" is an abstract description with many possible concrete **representations**, each with its own cost profile across the operations that matter — insertion, deletion, access by position, search — and no single representation dominates every other one on every operation simultaneously (if one did, this section would need only one lesson, not twenty-six).

### SE Lens

"Choosing a data structure" is really "choosing which operations get to be cheap, and which get to be expensive" — a decision that should be made by looking at which operations a real program actually performs often, exactly the reasoning Lesson 107, *Choosing Data Structures*, returns to directly once this section has built enough representations to genuinely choose between.

### Connection to the previous unit

The previous unit measured a concrete cost difference on the one representation this series has used so far; this unit generalizes that observation into the reason an entire new section, building many different representations, is worth studying at all.

---

## Connect the Pieces

The complete cost contrast, stated together:

```clojure
(println "cons (prepend), O(1):" (cons 0 (list 1 2 3 4 5)))
(println "list-length, O(n):" (list-length (list 1 2 3 4 5)))
(println "value-at position 4, O(n):" (value-at (list 1 2 3 4 5) 4))
```

```
cons (prepend), O(1): (0 1 2 3 4 5)
list-length, O(n): 5
value-at position 4, O(n): 5
```

Three operations, one representation (the list), two different growth-rate categories — the concrete evidence behind this entire section's reason for existing: **representation determines cost**, and different representations make different operations cheap.

## What Breaks Without This

Suppose a program repeatedly accessed elements of a large list by position — the way `value-at` does — without ever questioning whether a list was the right representation for that access pattern, simply because "it's a list of values" sounded sufficient. As the list grows, every single access grows linearly slower (Lesson 50's own growth-rate table makes this concrete), a real, worsening cost that a different representation — Lesson 84's arrays, built specifically to make this operation `O(1)` — would have avoided entirely. This isn't a coding mistake in the usual sense; the code is completely correct. It's a representation mismatch: the operations the program actually needs cheap don't match the ones the chosen representation actually makes cheap.

## Exercises

1. **Trace.** By hand, count how many recursive calls `(value-at (list 10 20 30 40 50) 3)` makes before returning, confirming the `O(n)`-shaped cost directly.
2. **Predict.** Before checking, predict whether `(cons 0 (list 1 2 3))` and `(list-length (list 1 2 3))`, run on a list with a thousand elements instead of five, would both take noticeably longer, or only one of them would. Justify using this lesson's cost analysis.
3. **Verify.** Write a function `list-last` that returns a list's final element, and determine — by inspecting your own implementation's recursive structure — whether it's `O(1)` or `O(n)`.
4. **Break it, on purpose.** Attempt to write a version of `cons` that somehow makes `list-length` also `O(1)`, by having `cons` itself track a running count. Explain, concretely, what would have to change about how a "list" is represented for this to actually work — a preview of what a genuinely different representation requires.
5. **Generalize.** List every operation this series has performed on lists so far that you can recall (adding an element, searching for a value, computing a length, reversing, and so on), and classify each one as `O(1)` or `O(n)` based on its actual recursive structure.
6. **Reconstruct.** Close this lesson. From memory, explain why "a list" does not have a single cost, and state which specific operations are cheap versus expensive on this series' list representation.

## Definition of Done

- [ ] You can state, for any given list operation, whether it is `O(1)` or `O(n)`, and why.
- [ ] You completed Exercise 3 and correctly classified `list-last`'s cost.
- [ ] You completed Exercise 5 and produced a classified list of prior operations.
- [ ] You can explain why no single data structure can be strictly better than every other one at every operation simultaneously.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you classified — for example, `"Classify list-last as O(n); classify 8 prior list operations by cost"` — not just `"lesson 83 exercise"`.

---

**Next lesson:** Lesson 84, *Arrays and Contiguous Memory*, builds this section's first genuinely new representation — one that trades away lists' cheap `cons` for a different operation made cheap instead: constant-time access by position.
