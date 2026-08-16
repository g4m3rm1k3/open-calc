# Lesson 151: Pattern Matching

**What you will build**: By the end of this lesson you'll extend Lesson 150's tagged sum type to a third alternative and confront what nested `if` does to that many branches — then learn `cond`, Clojure's own multi-branch conditional, and use it to dispatch cleanly on which alternative a sum-type value actually is. This is **pattern matching**: deciding which alternative a value represents, and acting on it, as one direct operation instead of a chain of ad hoc checks.

**What you need to know first**: Lesson 150's sum type and tagged values; Lesson 7's `if`, `<`, `=`; Lesson 6's `=`.

**Terms introduced in this lesson**:

- **pattern matching** — checking which of several known alternatives a value matches, and acting accordingly, as one direct construct rather than a manually nested sequence of conditionals. *Why it matters*: a sum type (Lesson 150) is defined by its alternatives; pattern matching is the corresponding way to *consume* one, symmetric with how the type itself was defined.

**Objects and methods used**:

- **`cond`**
  - *What it is:* a Clojure core macro for chaining multiple test/result pairs, evaluated top to bottom, stopping at the first test that's truthy.
  - *Implementation:* `(cond test1 result1 test2 result2 ... testN resultN)` — checks each test in order; the first one that's truthy (Lesson 7) has its paired result returned, and nothing after it is evaluated at all. A final `true` test, written last, always matches if nothing before it did — a genuine fallback, using Lesson 7's own truthiness rather than special syntax. Verified this session: `(cond (< -5 0) "negative" (= -5 0) "zero" true "positive")` → `"negative"`.
  - *Its use:* every dispatch in this lesson, replacing what would otherwise be a nested `if`-inside-`if`-inside-`if` chain, one level deeper per additional alternative.

This lesson also reuses `get` (Lesson 84), `<`/`=` (Lesson 7, Lesson 6), and `if` (Lesson 7), each already covered.

---

## Concept Unit: `cond` — Many Branches, One Flat Shape

### The Problem

Lesson 150's sum type had two alternatives, and Lesson 7's `if` handled that cleanly enough. What happens once a third alternative joins, and is `if`, nested inside itself, still the right tool?

### Introduce the concept in isolation

```clojure
(defn describe-number [n]
  (cond
    (< n 0) "negative"
    (= n 0) "zero"
    true "positive"))
```

```
user=> (describe-number -5)
"negative"
user=> (describe-number 0)
"zero"
user=> (describe-number 5)
"positive"
```

Three real alternatives, three flat test/result pairs — no nesting at all, unlike the equivalent `(if (< n 0) "negative" (if (= n 0) "zero" "positive"))`, which grows one level of indentation deeper for every additional case. `cond` checks `(< n 0)` first; if that's falsy, it checks `(= n 0)` next; if that's also falsy, the final `true` always matches, acting as the fallback. This is called `cond`.

### Discard the throwaway example

Not applicable — `describe-number` is real, reusable, and verified against all three cases.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch demonstration of a new Clojure core construct.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn describe-number [n]
  (cond
    (< n 0) "negative"
    (= n 0) "zero"
    true "positive"))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(< n 0)`, `(= n 0)`** — reappearing comparisons (Lesson 7, Lesson 6), now used as `cond`'s own tests rather than an `if`'s single condition.
- **`true`, as the final test** — first appearance of this specific fallback idiom: a bare `true` always matches, since `true` is always truthy (Lesson 7) — a genuine catch-all, without needing any special "else" syntax.
- **`cond` itself** — first appearance: evaluates its test/result pairs top to bottom, stopping and returning immediately at the first truthy test, never evaluating any test or result after it.

### CS Lens

`cond` is a direct generalization of `if` — `(if test a b)` is exactly `(cond test a true b)`, the two-alternative special case of `cond`'s own general many-alternative shape.

### SE Lens

Nested `if` for three or more alternatives forces a reader to track increasing indentation just to find which branch corresponds to which condition; `cond`'s flat test/result pairs, all at the same indentation level, make every branch equally easy to scan regardless of how many alternatives exist — a real readability cost `if`-nesting pays that `cond` doesn't.

---

## Concept Unit: Pattern Matching a Real Sum Type

### The Problem

Lesson 150's tagged values — `["color" "red"]`, `["flag" true]` — needed their tag checked to know which alternative they were. With a third alternative (`"size"`) added, does `cond` make that dispatch as clean as the previous unit's number example?

### Introduce the concept in isolation

```clojure
(defn category [v]
  (cond
    (= (get v 0) "color") "a color"
    (= (get v 0) "flag") "a boolean flag"
    (= (get v 0) "size") "a numeric size"
    true "an unknown tag"))
```

```
user=> (category ["color" "red"])
"a color"
user=> (category ["flag" true])
"a boolean flag"
user=> (category ["size" 42])
"a numeric size"
```

Three tags, three branches, each `cond` test checking `(get v 0)` — the tag — against one known alternative. This is **pattern matching**: given a sum-type value, decide which alternative it actually is, and respond accordingly, in one direct, flat construct — the exact operation Lesson 150's own sum type was defined to need, now handled by name instead of ad hoc `if`s.

### Discard the throwaway example

Not applicable — `category` is real, reusable, and verified against all three tagged alternatives.

### Project Change

- **Reference Source**: Lesson 150's own tagged sum-type values (`["color" v]`, `["flag" v]`, `["size" v]`), reused directly, with a third alternative added.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn category [v]
  (cond
    (= (get v 0) "color") "a color"
    (= (get v 0) "flag") "a boolean flag"
    (= (get v 0) "size") "a numeric size"
    true "an unknown tag"))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get v 0)`** — reappearing `get` (Lesson 84): reads the tag, the first element of every tagged value, regardless of which alternative it actually is.
- **`(= (get v 0) "color")`**, and the two tests after it — reappearing `=` (Lesson 6), each testing the tag against exactly one known alternative — the pattern-matching test itself, made of ordinary already-taught pieces.
- **`true`, as the final fallback** — reappearing (this lesson's first unit): handles any tag that isn't one of the three known alternatives, rather than leaving that case unhandled.

### CS Lens

Pattern matching and sum types are symmetric by design: a sum type's own definition lists its alternatives; a pattern match against that type should check exactly those alternatives, in the same count — `category`'s three tests correspond one-to-one with the three tags Lesson 150's sum type actually has.

### SE Lens

The fallback branch (`true \to$ `"an unknown tag"`) matters for a real reason: without it, a tag `category` didn't anticipate — a typo, or a genuinely new alternative added later without updating this function — would fall through `cond` entirely and return `nil`, silently, rather than signaling that something unexpected arrived. A pattern match without a real fallback is an incomplete one, even when every alternative the author remembered is covered.

### Connection to the previous unit

The previous unit introduced `cond`'s own shape on a simple numeric example; this unit applies the identical construct to a real sum type, the exact use case `cond` was reached for in the first place.

---

## Connect the Pieces

Both dispatches, side by side, sharing the identical `cond` shape:

```clojure
(println "describe-number -5:" (describe-number -5))
(println "category of a size value:" (category ["size" 42]))
```

```
describe-number -5: negative
category of a size value: a numeric size
```

One numeric comparison, one sum-type tag check — both handled by the identical flat, many-branch construct, `cond`, rather than two different ad hoc solutions.

## What Breaks Without This

Suppose `category` had been written as three separate top-level `if` statements instead — `(if (= (get v 0) "color") "a color" (if (= (get v 0) "flag") ...))` — and a fourth alternative needed adding later. Every nested `if` from that point inward would need touching just to insert one more branch, and the resulting deeply nested structure would be genuinely harder to verify by eye than `cond`'s flat list, where adding a fourth test/result pair changes nothing about the branches already there. The real cost isn't correctness — nested `if` and `cond` compute the identical result — it's that `cond`'s shape scales to more alternatives without the reader's cognitive load growing the same way nested `if`'s does.

## Exercises

1. **Trace.** By hand, trace `(category ["flag" true])` through `cond`'s own three tests in order, confirming exactly which one matches and why the first two don't.
2. **Predict.** Before checking, predict `(category ["weight" 10])` — a tag `category` doesn't know about. Then verify it hits the fallback branch.
3. **Verify.** Extend `category` with a fourth alternative, `"length"`, and confirm all four tags — plus an unknown one — still dispatch correctly.
4. **Break it, on purpose.** Remove `category`'s final `true` fallback branch entirely, and confirm `(category ["weight" 10])` now returns `nil` instead of a real fallback message — explain why that's worse, not just different.
5. **Generalize.** Describe, without coding it, how `cond` could replace the `if`-based `pair-consistent?` from Lesson 136, which had exactly two nested conditions.
6. **Reconstruct.** Close this lesson. From memory, explain why `cond`'s branches correspond one-to-one with a sum type's own alternatives, using this lesson's own `category` as the example.

## Definition of Done

- [ ] You can write a `cond` expression with multiple test/result pairs and a `true` fallback.
- [ ] You can explain why `cond` is a direct generalization of `if`, not an unrelated construct.
- [ ] You can pattern-match a tagged sum type by dispatching on its tag with `cond`.
- [ ] You completed Exercise 3 and extended `category` with a fourth working alternative.
- [ ] You completed Exercise 4 and explained why a missing fallback silently returning `nil` is worse than an explicit "unknown" result.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and found — for example, `"Add length alternative to category; confirm removing the true fallback silently returns nil on unknown tags"` — not just `"lesson 151 exercise"`.

---

**Next lesson:** Lesson 152, *Folds as Algebra*, connects this lesson's own pattern matching directly back to Lesson 149's `fold-tree` — showing that a fold's own recursive case is itself a pattern match against a sum type's alternatives, one branch per constructor, the same shape both lessons have now built separately.
