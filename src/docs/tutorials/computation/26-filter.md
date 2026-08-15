# Lesson 26: Filter

**What you will build**: By the end of this lesson you'll have derived `filter` the same way the previous lesson derived `map` — by noticing a repeated shape across separately-written functions and extracting what varies into a parameter. `filter`'s shape is genuinely different from `map`'s, though: it has to decide, per element, whether to keep it at all, not just how to transform it. You'll also see this lesson pay off a promise Lesson 9 made and couldn't yet keep: checking "there exists" over a list of any length, for real.

**What you need to know first**: The previous lesson's `map` and its derivation process, and Lesson 7's predicates.

**Terms introduced in this lesson**:

- **filter** — a function that builds a new list containing only the elements of an existing list that satisfy a given predicate, in their original order. *Why it matters*: the second most common shape a recursive list function takes — test each element, keep only some — made reusable the same way `map` made "transform every element" reusable.

**Objects and methods used**:

- **`filter`**
  - *What it is:* a function in Clojure's core library that keeps only the elements of a list satisfying a given predicate.
  - *Implementation:* `(filter pred a-list)` — returns a new list containing exactly the elements `x` of `a-list` for which `(pred x)` is truthy, in their original order, with everything else removed.
  - *Its use:* Concept Unit 2, replacing the hand-written pattern Concept Unit 1 establishes and repeats.

---

## Concept Unit: The Same Shape, Keeping Only Some Elements

### The Problem

Write a function that keeps only the positive numbers in a list, discarding the rest. Then write a function that keeps only the deposit amounts over `100` in a list of transaction amounts. Two different conditions for what to keep — do they need two structurally different functions?

### Introduce the concept in isolation

```clojure
(defn keep-positive [lst]
  (if (empty? lst)
    (list)
    (if (> (first lst) 0)
      (cons (first lst) (keep-positive (rest lst)))
      (keep-positive (rest lst)))))

(defn keep-large [lst]
  (if (empty? lst)
    (list)
    (if (> (first lst) 100)
      (cons (first lst) (keep-large (rest lst)))
      (keep-large (rest lst)))))
```

```
user=> (keep-positive (list -5 10 -3 20))
(10 20)
user=> (keep-large (list 50 150 75 200))
(150 200)
```

Both functions share an identical base case (the empty list, unchanged). Both share an identical *shape* for the recursive case: check a condition on `(first lst)`; if it holds, `cons` that element onto the recursive result; if it doesn't, skip it entirely — recurse on `(rest lst)` without consing anything. The only thing that varies between the two functions is which condition gets checked: `(> (first lst) 0)` versus `(> (first lst) 100)`.

Notice this is a genuinely different shape than the previous lesson's `map`: `map`'s recursive case *always* conses something onto the result; this shape conses *conditionally*, sometimes skipping an element entirely and shrinking the result relative to the input.

### Discard the throwaway example

Not applicable — both functions directly motivate this lesson's real content.

### Generalizing

The varying piece in both functions is a **predicate** (Lesson 7) — a function returning `true` or `false` — applied to each element to decide whether it survives. `> 0`-ness and `> 100`-ness are both just specific predicates; the shape that decides "keep or discard, based on some predicate" doesn't care which one is supplied, the identical realization the previous lesson had about `map`'s varying transformation.

### CS Lens

This shape is precisely Lesson 9's universal and existential quantifiers made concrete and collection-shaped: filtering a list down to the elements satisfying a predicate is the actual mechanism behind checking "does there exist an element satisfying this condition" (the filtered result is non-empty) over a list of *any* length — not the small, hand-enumerated domains Lesson 9 was restricted to before real lists existed.

### SE Lens

Hand-writing this shape separately for every new "keep only..." condition carries the identical risk Lesson 25 already named for `map`: the base case and recursive structure — the part that's easy to get right once and easy to silently break when retyped — get rewritten, and re-risked, with every new predicate.

---

## Concept Unit: `filter` — the Shape, Made Reusable

### The Problem

Can the varying predicate be taken as a parameter, the same way `map` took its varying transformation as one?

### Introduce the concept in isolation

```clojure
(defn positive? [n] (> n 0))
(defn large-deposit? [amount] (> amount 100))
```

```
user=> (filter positive? (list -5 10 -3 20))
(10 20)
user=> (filter large-deposit? (list 50 150 75 200))
(150 200)
```

`filter` reproduces exactly what `keep-positive` and `keep-large` computed by hand, taking the predicate as its first argument instead of hardcoding a specific one.

### Discard the throwaway example

Not applicable — `filter` is a standard, permanent tool.

### Project Change

- **Reference Source**: No reference counterpart — `filter`'s behavior is derived directly from the previous unit's two hand-written functions.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(filter positive? (list -5 10 -3 20))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`filter`** — first appearance as a called function (covered fully in Objects and methods used, above): a higher-order function, like `map` and `comp` before it — its first argument is a predicate.
- **`positive?`** — reappearing symbol lookup, retrieving a function value to hand to `filter`, the same role `double-it` played for `map` in the previous lesson.

### CS Lens

`filter`'s own internal behavior, written out, is exactly the previous unit's shared shape with the predicate taken as a parameter:

```clojure
(defn my-filter [pred lst]
  (if (empty? lst)
    (list)
    (if (pred (first lst))
      (cons (first lst) (my-filter pred (rest lst)))
      (my-filter pred (rest lst)))))
```

`(my-filter positive? (list -5 10 -3 20))` reproduces `(10 20)` exactly — the identical relationship Lesson 25 established between `my-map` and the real `map`.

### SE Lens

`filter` combined with `empty?` finally delivers, over a real list of any length, what Lesson 9 could only approximate by hand over three or four written-out values: "does there exist an element satisfying some predicate" is now `(not (empty? (filter pred lst)))` — checkable for a list of three elements or three million, using the identical one-line check, something Lesson 9's own exhaustive `or`-chaining approach explicitly could never scale to.

### Connection to the previous unit

The previous unit wrote the shared conditional-keep shape twice, varying one condition each time; this unit extracts that condition into a parameter, producing one tool that replaces both — and the same tool `filter` becomes the mechanism realizing Lesson 9's existential quantifier for real, unbounded-length data.

---

## Connect the Pieces

`filter` and `map` combined, and Lesson 9's existential quantifier finally checked over a real list:

```clojure
(defn valid-amount? [amount] (> amount 0))
(defn double-it [n] (* 2 n))

(def transactions (list 40 -15 25 -5 60))

(println "Valid amounts only:" (filter valid-amount? transactions))
(println "Doubled valid amounts:" (map double-it (filter valid-amount? transactions)))
(println "Does an invalid amount exist?" (not (empty? (filter (fn [x] (not (valid-amount? x))) transactions))))
```

```
Valid amounts only: (40 25 60)
Doubled valid amounts: (80 50 120)
Does an invalid amount exist? true
```

`filter` and `map` compose directly — the filtered list, containing only the valid amounts, becomes `map`'s own input, exactly the kind of pipeline Lesson 5's function composition already established was natural and expected. The final line is Lesson 9's existential quantifier, stated and checked in one line, over a list this series never had a real way to build or search before this section.

## What Breaks Without This

Suppose `keep-positive`, hand-written separately in two different places in a larger codebase, drifted slightly out of sync — one copy checking `(> (first lst) 0)`, a second, older copy checking `(>= (first lst) 0)` (a boundary difference, the exact `>=` versus `>` distinction Lesson 7's exercises already flagged as easy to get subtly wrong). Both copies "work," and both silently disagree on whether `0` itself counts as positive — a real, hard-to-notice inconsistency that only using `filter` with one shared, named predicate (`positive?`, defined once) removes entirely: with one definition, in one place, every use of `(filter positive? ...)` anywhere in a system is guaranteed to apply the exact same boundary condition, every time.

## Exercises

1. **Trace.** By hand, trace `(filter positive? (list 3 -1 -2 4))`, showing which elements survive and which are skipped, before running it to check.
2. **Predict.** Before running it, predict whether `(filter positive? (list))` — filtering the empty list — errors, returns the empty list, or does something else. Check your prediction.
3. **Derive.** Write `my-filter` yourself, from scratch, and verify it against the real `filter` on at least two different predicates and lists.
4. **Break it, on purpose.** Write two versions of a "keep valid" predicate that disagree at exactly one boundary value (the way the hypothetical `>` versus `>=` drift did above), and show a concrete list where filtering with each produces a different result.
5. **Generalize.** Using `filter` and `empty?`, check Lesson 9's *universal* claim — "every amount in this list is positive" — for a list of your choosing. (Hint: what does filtering for the *opposite* condition, and checking whether the result is empty, tell you?)
6. **Reconstruct.** Close this lesson. From memory, explain the one structural difference between `map`'s recursive case and `filter`'s, and explain how `filter` alone answers Lesson 9's existential quantifier over a real list.

## Definition of Done

- [ ] You can use `filter` with a predicate of your own choosing, and correctly predict which elements survive before running it.
- [ ] You completed Exercise 3 (`my-filter`, written from scratch) and verified it matches the real `filter`.
- [ ] You completed Exercise 5, using `filter` to check a universal claim, not just an existential one.
- [ ] You can explain, precisely, the structural difference between `map`'s recursive case and `filter`'s — not just that they "do different things."
- [ ] Commit your Exercise 3 `my-filter` and Exercise 5 universal-claim check to your notes repository, with a commit message stating which quantifier each part of your code corresponds to — for example, `"Add my-filter; check for-all-positive via filter on negation, empty? confirms none found"` — not just `"lesson 26 exercise"`.

---

**Next lesson:** Lesson 27, *Fold / Reduce*, derives the third and most general of this section's core tools — one that subsumes both `map` and `filter`, and reveals that `sum-to`, `factorial`, and `my-length` were all, underneath, doing the identical thing.
