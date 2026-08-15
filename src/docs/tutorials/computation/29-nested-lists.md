# Lesson 29: Nested Lists

**What you will build**: By the end of this lesson you'll be able to write recursive functions over lists whose elements are themselves lists, to any depth — generalizing every structural-recursion technique this section has built so far past a single flat sequence. You'll derive a function that sums every number regardless of how deeply it's nested, and a function that flattens arbitrarily nested lists into one flat list.

**What you need to know first**: This section's structural recursion (Lesson 21) and `my-append` (Lesson 28) — this lesson's functions check one more thing per element than earlier ones did, but recurse using nothing new.

**Terms introduced in this lesson**:

- **nested list** — a list whose elements may themselves be lists, to any depth. *Why it matters*: generalizes Lesson 19's flat-list definition by allowing the recursive case's "value" to itself be another list, rather than requiring every element to be a plain, non-list value.

**Objects and methods used**:

- **`sequential?`**
  - *What it is:* a predicate in Clojure's core library testing whether a value is a sequential collection (a list, a vector, or anything else built the same ordered way).
  - *Implementation:* `(sequential? x)` — established behavior: `(sequential? (list 1 2))` → `true`; `(sequential? 5)` → `false`.
  - *Its use:* Concept Unit 1, to distinguish a plain element from a nested list.

---

## Concept Unit: Nested Lists — Elements That Are Themselves Lists

### The Problem

`(1 2 3)` is a flat list — every element is a plain number. `(1 (2 3) 4)` has a *list* as its second element — a **nested list**. Lesson 19's recursive list definition never said an element couldn't itself be a list; it only ever said "a value together with a smaller list." Does everything this section has built already handle this, or does something new need to be checked?

### Introduce the concept in isolation

```
user=> (sequential? (list 1 2))
true
user=> (sequential? 5)
false
user=> (first (list 1 (list 2 3) 4))
1
user=> (first (rest (list 1 (list 2 3) 4)))
(2 3)
```

`first` and `rest` already work exactly the same way on a nested list as on a flat one — `(first (rest (list 1 (list 2 3) 4)))` correctly retrieves the *whole nested list* `(2 3)` as one element, not its individual pieces. What's new is that a function processing this list now needs to *ask*, for each element, whether it's a plain value or another list — `sequential?` is exactly this check, returning `true` for anything built the same ordered way a list is (lists, and, as later lessons will use, vectors too), `false` for a plain number, string, or other non-collection value.

### Discard the throwaway example

REPL-only, same as most of this series' code examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(sequential? (first (rest (list 1 (list 2 3) 4))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`sequential?`** — first appearance as a called function (covered fully in Objects and methods used, above): tests whether its argument is itself a sequential collection.
- **`(first (rest (list 1 (list 2 3) 4)))`** — reappearing `first`/`rest`/`list` (Lesson 24); retrieves the second element, `(2 3)`, as one complete unit — proof that a nested list's inner list is just an ordinary value sitting in a position, exactly the way `1` or `4` sit in their positions.

### CS Lens

`sequential?`, rather than a narrower check for "is this specifically a list," is the deliberately safer choice here: several different Clojure operations (including some this series hasn't covered yet) produce sequential collections that aren't literally built with the `list` function, and `sequential?` recognizes all of them uniformly — a small, real instance of Lesson 12's broader lesson that a predicate's exact boundary (what it does and doesn't classify as "yes") has to be chosen deliberately, not assumed.

### SE Lens

Nothing about `first` or `rest` needed to change to work correctly on nested lists — they already treated every element as an opaque value, never assuming anything about its internal shape. The only genuinely new requirement is a recursive function's own decision logic: *before* treating an element as a plain value to combine directly, check whether it's actually another list requiring its own recursive handling first — exactly what the next unit derives.

---

## Concept Unit: Deriving a Function That Handles Nesting — `deep-sum`

### The Problem

`list-sum` (Lesson 27) correctly sums a flat list of numbers. Given `(1 (2 3) 4)`, it would try to add `(2 3)` — a list, not a number — directly, which doesn't mean anything as arithmetic. How does a sum function need to change to handle nesting correctly?

### Introduce the concept in isolation

```clojure
(defn deep-sum [lst]
  (if (empty? lst)
    0
    (+ (if (sequential? (first lst))
         (deep-sum (first lst))
         (first lst))
       (deep-sum (rest lst)))))
```

```
user=> (deep-sum (list 1 (list 2 3) 4))
10
```

Trace it: the base case is unchanged from `list-sum` — the empty list sums to `0`. The recursive case now branches on `(sequential? (first lst))`: if the current element is itself a list, recurse *into* it with `deep-sum` (treating it exactly like any other list this function knows how to sum) instead of trying to add it directly; if it's a plain value, use it directly, exactly as `list-sum` always did. Either way, the *outer* recursion — moving on to `(rest lst)` — continues unchanged, added to whichever of the two branches applied.

### Discard the throwaway example

Not applicable — `deep-sum` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct generalization of Lesson 27's `list-sum`, adding one new check.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn deep-sum [lst]
  (if (empty? lst)
    0
    (+ (if (sequential? (first lst))
         (deep-sum (first lst))
         (first lst))
       (deep-sum (rest lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (sequential? (first lst)) (deep-sum (first lst)) (first lst))`** — first appearance of a recursive function with *two* recursive-call sites for the same conceptual step: one recursing into a nested element (`(deep-sum (first lst))`), one falling back to the plain-value case (`(first lst)`, used directly, no recursion needed). Both are structurally recursive in Lesson 21's sense — each one operates on a genuinely smaller instance (a nested list is smaller in depth-and-length combined than the whole structure containing it; a plain value has no further list structure to recurse into at all).
- **`(deep-sum (rest lst))`** — reappearing outer recursion (Lesson 24's shape), continuing across the list exactly as `list-sum` always did, entirely unaffected by whatever branch the current element took.

### CS Lens

A function that recurses along *two* different dimensions at once — across a list's elements (`rest`), and *into* an element's own nested structure when present — is exactly the shape Lesson 30's trees will need, generalized one step further: a tree's recursive case, from Lesson 19's own definition, has this identical two-directions-at-once character (across siblings, and down into children).

### SE Lens

Checking `sequential?` before assuming an element is a plain value is a real, necessary guard — without it, `deep-sum` would attempt `(+ (list 2 3) ...)`, an operation with no sensible meaning, on the very first nested list it encountered, the same category of mistake as Lesson 12's partial functions: an operation applied outside the domain it actually makes sense for.

### Connection to the previous unit

The previous unit established `sequential?` as the tool for distinguishing plain elements from nested lists; this unit is the first real recursive function built on that distinction, handling both cases explicitly rather than assuming every element has the same shape.

---

## Concept Unit: Flatten — Turning Nested Lists Into a Flat List

### The Problem

`deep-sum` handles nesting by summing through it, but produces a single number, discarding the original structure entirely. Is there a way to turn a nested list into a *flat* list — the same elements, in the same order, with all the nesting removed — rather than combining them into one value?

### Introduce the concept in isolation

```clojure
(defn my-flatten [lst]
  (if (empty? lst)
    (list)
    (if (sequential? (first lst))
      (my-append (my-flatten (first lst)) (my-flatten (rest lst)))
      (cons (first lst) (my-flatten (rest lst))))))
```

```
user=> (my-flatten (list 1 (list 2 3) 4))
(1 2 3 4)
user=> (flatten (list 1 (list 2 3) 4))
(1 2 3 4)
```

The same two-branch shape `deep-sum` used, adapted to build a list instead of a sum: if the current element is a nested list, flatten it recursively (`(my-flatten (first lst))`), then append that flattened piece onto the flattened rest of the outer list (`my-append`, from Lesson 28, doing real, necessary work here rather than being merely illustrative). If the current element is a plain value, `cons` it directly onto the flattened rest, exactly the way every flat-list function in this section has consed a plain element all along.

### Discard the throwaway example

Not applicable — `my-flatten` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`, from Lesson 28.

### The New Code — type it yourself

```clojure
(defn my-flatten [lst]
  (if (empty? lst)
    (list)
    (if (sequential? (first lst))
      (my-append (my-flatten (first lst)) (my-flatten (rest lst)))
      (cons (first lst) (my-flatten (rest lst))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(my-append (my-flatten (first lst)) (my-flatten (rest lst)))`** — reappearing `my-append` (Lesson 28), here combining two genuinely different flattened pieces: the current element's own flattened contents, and everything flattened from the rest of the outer list — both potentially containing further nested structure of their own, handled by the identical recursive call each time.
- **`(cons (first lst) (my-flatten (rest lst)))`** — reappearing plain-element case, unchanged from every flat-list-building function this section has already written.

### CS Lens

`my-flatten`'s use of `my-append` — where `deep-sum` only ever used plain `+` — is a direct, concrete instance of Lesson 27's realization that many different-looking functions share an underlying combining shape: here, the *combining operation itself* changes (`+` becomes `my-append`) while the overall two-branch, nesting-aware recursive structure stays identical between `deep-sum` and `my-flatten`.

### SE Lens

Recognizing `deep-sum` and `my-flatten` as the same shape, with only the base case's value and the combining operation varying, is Lesson 25 and Lesson 27's own lesson, applied one more time — and a strong hint that a nesting-aware `reduce`, generalizing both, is a natural next tool to reach for once a third or fourth nested-list function is needed, rather than hand-writing the two-branch shape again from scratch.

### Connection to the previous unit

The previous unit summed through nested structure, discarding it; this unit preserves every element while discarding only the nesting itself, using the identical branching decision — proof the two-branch shape generalizes to more than one kind of combining operation.

---

## Connect the Pieces

Both nested-list functions, applied to a genuinely deep structure — three levels, not just two:

```clojure
(def deep-transactions (list 10 (list 20 (list 30 5)) 15))

(println "Deeply nested structure:" deep-transactions)
(println "Sum, regardless of depth:" (deep-sum deep-transactions))
(println "Flattened:" (my-flatten deep-transactions))
(println "Sum of flattened equals deep-sum:" (= (deep-sum deep-transactions) (reduce + 0 (my-flatten deep-transactions))))
```

```
Deeply nested structure: (10 (20 (30 5) 15))
Sum, regardless of depth: 80
Flattened: (10 20 30 5 15)
Sum of flattened equals deep-sum: true
```

Both `deep-sum` and `my-flatten` handle three levels of nesting correctly, using the identical two-branch check at every level, no matter how deep — neither function needed to know in advance how deeply anything was nested, because each recursive call re-asks the identical question (`sequential?`) fresh, at whatever depth it currently finds itself. The final line connects this lesson back to Lesson 27 directly: summing the flattened list with `reduce` produces the same answer `deep-sum` computed directly, two different routes to the identical, verifiable result.

## What Breaks Without This

Suppose `deep-sum` were written without the `sequential?` check, assuming every element is always a plain number:

```clojure
(defn broken-deep-sum [lst]
  (if (empty? lst)
    0
    (+ (first lst) (broken-deep-sum (rest lst)))))
```

```
user=> (broken-deep-sum (list 1 (list 2 3) 4))
```

This is exactly `list-sum` from Lesson 27, applied to a list it was never designed to handle — `(+ (list 2 3) ...)` attempts to add a list to a number, and Clojure raises a real error rather than silently producing a wrong number. This is Lesson 12's partial-function warning made concrete: `list-sum`'s rule (`+` the current element) is only valid over a *narrower* domain (flat lists of numbers) than the input it was actually given, and the gap between the two shows up exactly where the input first violates the assumption the function's author never checked for.

## Exercises

1. **Trace.** By hand, trace `(deep-sum (list 1 (list 2 (list 3 4))))`, showing which additions happen at which level of nesting.
2. **Predict.** Before running it, predict `(my-flatten (list (list 1 2) (list 3 4)))` — a list with *no* plain top-level elements, only nested lists. Check your prediction.
3. **Derive.** Write `deep-count`, a function that counts every plain (non-list) value in a nested list, regardless of depth — the nesting-aware generalization of Lesson 24's `my-length`.
4. **Break it, on purpose.** Predict, then verify, what `broken-deep-sum` (from "What Breaks Without This") does on a list with *no* nesting at all, like `(list 1 2 3)`. Does the missing check matter when there's nothing nested to trigger it?
5. **Generalize.** Write `deep-map`, a function that applies a given transformation to every plain value in a nested list, regardless of depth, preserving the original nesting structure exactly (unlike `my-flatten`, which discards it).
6. **Reconstruct.** Close this lesson. From memory, explain the two-branch shape `deep-sum` and `my-flatten` share, and explain precisely what `broken-deep-sum` is missing.

## Definition of Done

- [ ] You can write a recursive function that correctly distinguishes plain elements from nested lists using `sequential?`.
- [ ] You completed Exercise 3 (`deep-count`) and verified it against a nested list of your own choosing.
- [ ] You completed Exercise 5 (`deep-map`) and confirmed it preserves nesting structure, unlike `my-flatten`.
- [ ] You can explain why `broken-deep-sum` fails only on genuinely nested input, not on flat lists — connecting this to Lesson 12's partial functions.
- [ ] Commit `deep-count` and `deep-map` to your notes repository, with a commit message stating what each preserves and what each discards — for example, `"Add deep-count (discards structure, returns a number) and deep-map (preserves nesting exactly, transforms only leaf values)"` — not just `"lesson 29 exercise"`.

---

**Next lesson:** Lesson 30, *Trees as Recursive Data*, takes this lesson's "an element can itself be a smaller version of the same structure" idea and gives it its own dedicated shape — not nested inside lists, but a genuinely new recursive data structure built from exactly the definition Lesson 19 already gave it.
