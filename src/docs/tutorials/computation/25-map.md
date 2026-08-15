# Lesson 25: Map

**What you will build**: By the end of this lesson you'll have derived `map` — one of the most heavily used tools in this series from here forward — not as a memorized built-in, but as the direct, inevitable generalization of writing the same "transform every element" recursive function over and over. You'll see the exact repeated shape across three separately-written functions, then the one reusable tool that replaces all three.

**What you need to know first**: The previous lesson's `cons`, `first`, `rest`, and `empty?`, and its closing choreography — take a list apart, do something with the pieces, build a new list back up.

**Terms introduced in this lesson**:

- **map** — a function that builds a new list by applying a given transformation to every element of an existing list, in order, without changing the list's length. *Why it matters*: this is the single most common shape a recursive list function takes — apply the same one-argument function to each element — made reusable instead of rewritten by hand every time it's needed.

**Objects and methods used**:

- **`map`**
  - *What it is:* a function in Clojure's core library that applies a given function to every element of a list, producing a new list of the results.
  - *Implementation:* `(map f a-list)` — returns a new list where each element is `(f x)` for the corresponding `x` in `a-list`, in the same order, and the same length.
  - *Its use:* Concept Unit 2, replacing the hand-written pattern Concept Unit 1 establishes and repeats.

---

## Concept Unit: The Same Shape, Three Times

### The Problem

Write a function that doubles every number in a list. Then write a function that adds `10` to every number in a list — a real, useful operation for this series' bank-account theme (applying a flat bonus to every deposit in a batch). Then write a function that squares every number in a list. Three genuinely different transformations — do they actually require three genuinely different functions?

### Introduce the concept in isolation

```clojure
(defn double-all [lst]
  (if (empty? lst)
    (list)
    (cons (* 2 (first lst)) (double-all (rest lst)))))

(defn add-ten-to-all [lst]
  (if (empty? lst)
    (list)
    (cons (+ 10 (first lst)) (add-ten-to-all (rest lst)))))

(defn square-all [lst]
  (if (empty? lst)
    (list)
    (cons (* (first lst) (first lst)) (square-all (rest lst)))))
```

```
user=> (double-all (list 5 10 15))
(10 20 30)
user=> (add-ten-to-all (list 5 10 15))
(15 20 25)
user=> (square-all (list 5 10 15))
(25 100 225)
```

All three work correctly. Look at what's actually different between them: the base case is identical in all three (`(list)`, when the input is empty). The recursive structure is identical in all three (`cons` something onto a recursive call on `(rest lst)`). The *only* thing that changes, function to function, is the one expression computed from `(first lst)` — `(* 2 (first lst))`, `(+ 10 (first lst))`, or `(* (first lst) (first lst))`.

### Discard the throwaway example

Not applicable — these three functions are the direct motivation for this lesson's real content, not throwaway code.

### Generalizing

Three functions, one genuinely different line each, everything else identical. This is exactly the situation Lesson 20's SE Lens flagged about `sum-to` and `factorial` sharing a shape — except here, the shared shape is common enough, and specific enough, to deserve its own reusable name rather than being rewritten by hand a fourth time.

### CS Lens

Noticing that three separately-written functions differ in exactly one place — the operation applied to each element — is the same recognition Lesson 5's function composition and Lesson 21's structural recursion both already relied on: once a shape recurs this reliably, the shape itself becomes worth naming and reusing, rather than the specific instances of it.

### SE Lens

Every one of these three functions requires separately writing, reading, and trusting the identical base case and identical recursive structure — three places the exact same small mistake (Lesson 24's `first`-instead-of-`rest` bug, say) could independently occur, purely because the shared shape was retyped three times instead of written once. This is precisely the cost Lesson 4 first named for unnamed repeated arithmetic, now showing up again at the scale of a whole recursive pattern instead of one expression.

---

## Concept Unit: `map` — the Shape, Made Reusable

### The Problem

If the only thing that changes across `double-all`, `add-ten-to-all`, and `square-all` is one function applied to each element, can that one function be handed in as an *argument*, the way Lesson 5's `comp` took functions as arguments to build a new function?

### Introduce the concept in isolation

```clojure
(defn double-it [n] (* 2 n))
(defn add-ten [n] (+ 10 n))
(defn square [n] (* n n))
```

```
user=> (map double-it (list 5 10 15))
(10 20 30)
user=> (map add-ten (list 5 10 15))
(15 20 25)
user=> (map square (list 5 10 15))
(25 100 225)
```

One function, `map`, replacing all three hand-written ones — every result matches exactly what the previous unit's separately-written functions produced. `map` takes the *transformation itself* as its first argument, the specific piece that varied between `double-all`, `add-ten-to-all`, and `square-all`, and supplies the shared base case and recursive structure — the part that never varied — internally, once, rather than needing it rewritten every time.

### Discard the throwaway example

Not applicable — `map` is a standard, permanent tool this series uses constantly from here forward.

### Project Change

- **Reference Source**: No reference counterpart — `map`'s behavior is being derived directly from the previous unit's three hand-written functions, which serve as `map`'s own reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(map double-it (list 5 10 15))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`map`** — first appearance as a called function (covered fully in Objects and methods used, above): a **higher-order function** (Lesson 5 already introduced this category, with `comp`) — its first argument is itself a function.
- **`double-it`** — reappearing symbol lookup (Lesson 3), here retrieving a *function* value (Lesson 5) to hand to `map`, rather than being called directly the way `(double-it 5)` would.
- **`(list 5 10 15)`** — reappearing list construction (previous lesson); the collection `map` applies `double-it` to, element by element.

### CS Lens

`map`'s own internal behavior, if written out, would be exactly Concept Unit 1's shared shape, with the varying piece taken as a parameter instead of hardcoded:

```clojure
(defn my-map [f lst]
  (if (empty? lst)
    (list)
    (cons (f (first lst)) (my-map f (rest lst)))))
```

This is worth verifying directly: `(my-map double-it (list 5 10 15))` produces the identical `(10 20 30)` — proof that `map` isn't a mysterious built-in performing some different, unrelated magic, but exactly the pattern this lesson already derived by hand, wrapped once and reused.

### SE Lens

`map` doesn't just save typing — it moves the base case and recursive structure into one place, trusted once, instead of three (or three hundred) separately-written copies each capable of independently going wrong. This is the same reuse argument Lesson 4 made for a single arithmetic rule, Lesson 5 made for composed functions, and now this lesson makes for an entire recursive *pattern*, one level more general than either earlier case.

### Connection to the previous unit

The previous unit wrote the shared shape three times, varying one line each time; this unit extracts that one varying line into a parameter, producing a single tool that replaces all three — and, by extension, every other function that would otherwise repeat the identical shape.

---

## Connect the Pieces

Apply `map` to this series' own bank-account theme — a batch operation on a list of transaction amounts:

```clojure
(defn apply-interest [amount] (+ amount (/ amount 20)))

(def deposits (list 100 200 300))

(println "Original deposits:" deposits)
(println "After 5% interest:" (map apply-interest deposits))
(println "Doubled for a matching promotion:" (map double-it deposits))
```

```
Original deposits: (100 200 300)
After 5% interest: (105 210 315)
Doubled for a matching promotion: (200 400 600)
```

`apply-interest` and `double-it` are each ordinary, independently-defined, single-argument functions (Lesson 4) — neither one needed to know anything about lists, recursion, `cons`, or base cases; `map` supplied all of that once, leaving each function free to describe only the one transformation it's actually responsible for.

## What Breaks Without This

Suppose a second, subtly different `add-ten-to-all` were hand-written elsewhere in a larger codebase — this time with a typo, using `rest` where `first` belonged, or checking the wrong base case, the same category of mistake Lesson 24's "What Breaks Without This" demonstrated:

```clojure
(defn broken-add-ten-to-all [lst]
  (if (empty? lst)
    (list)
    (cons (+ 10 (first lst)) (broken-add-ten-to-all lst))))   ; forgot (rest lst)!
```

This is `broken-sum-to`'s exact mistake (Lesson 20), reappearing in a list-processing function instead of a number-processing one: the recursive call never shrinks its input, so it never terminates. Using `map` instead of hand-writing this pattern makes this specific class of bug structurally impossible to reintroduce a second time — `map`'s own base case and recursive structure were verified once, in Concept Unit 2, and every later use, no matter how many different transformations are handed to it, inherits that same correctness automatically, rather than needing the identical checking repeated for every new hand-written variant.

## Exercises

1. **Trace.** By hand, trace `(map square (list 2 3 4))`, showing each element transformed in order, before running it to check.
2. **Predict.** Before running it, predict the length of `(map double-it (list 1 2 3 4 5))` without computing any of its actual values. What general fact about `map` does your prediction rely on?
3. **Derive.** Write `my-map` yourself, from scratch, the way Concept Unit 2's CS Lens sketched it, and verify it against the real `map` on at least two different functions and lists.
4. **Break it, on purpose.** Take `my-map` from Exercise 3 and reintroduce the exact bug this lesson's "What Breaks Without This" described (a recursive call that doesn't shrink its input). Confirm it fails to terminate on a small list.
5. **Generalize.** Using `map`, apply a `10%` fee reduction (multiply each amount by `9/10`, Lesson 13's factored form) to a list of withdrawal amounts of your choosing. Verify at least one result by hand.
6. **Reconstruct.** Close this lesson. From memory, explain what stays exactly the same and what changes between any two different uses of `map`, using `double-it` and `apply-interest` as your two examples.

## Definition of Done

- [ ] You can use `map` with a function of your own choosing on a list of your own choosing, and correctly predict the result's length before running it.
- [ ] You completed Exercise 3 (`my-map`, written from scratch) and verified it matches the real `map`.
- [ ] You can explain, from memory, exactly what varies and what stays fixed across different uses of `map`.
- [ ] You can explain why using `map` instead of hand-writing the pattern reduces a specific, real category of bug, not just "less typing."
- [ ] Commit your Exercise 3 `my-map` and Exercise 5 fee-reduction example to your notes repository, with a commit message stating what you verified it against — for example, `"Add my-map, verified against real map on double-it and square across three lists; apply 10% fee reduction to withdrawal list"` — not just `"lesson 25 exercise"`.

---

**Next lesson:** Lesson 26, *Filter*, derives a second reusable list tool the identical way — noticing a repeated shape across separately-written functions, this time ones that keep some elements and discard others, using a predicate (Lesson 7) instead of a transformation.
