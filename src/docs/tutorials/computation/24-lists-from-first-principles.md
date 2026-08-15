# Lesson 24: Lists from First Principles

**What you will build**: By the end of this lesson you'll be able to build a real Clojure list from nothing but the empty list and one operation that adds one element at a time, take a list apart into its first element and everything else, and write your first recursive function that consumes a list rather than a plain number. Every list-processing tool the rest of this section builds — `map`, `filter`, `reduce` — is built from exactly the four operations this lesson introduces.

**What you need to know first**: Lesson 19's recursive definition of a list (the empty list as base case; a value in front of a smaller list as the recursive case) and Lesson 21's structural recursion — this lesson is where that definition stops being notation and becomes real, runnable code.

**Terms introduced in this lesson**:

- **empty list** — the list containing no elements, the base case every other list is ultimately built from. *Why it matters*: gives Lesson 19's base case, previously only described in prose, a real, checkable Clojure value.
- **cons** — the operation that builds a new list by placing a value in front of an existing list. *Why it matters*: this is Lesson 19's recursive case for lists, made real — "a value together with a smaller list" now has an actual name and an actual, callable function.
- **deconstruction** — taking a compound value apart into its component pieces, the reverse of the operation that built it. *Why it matters*: names the general operation `first` and `rest` perform together, distinct from `cons`'s constructive direction — Concept Unit 4 shows the two directions are genuine inverses of each other.

**Objects and methods used**:

- **`list`**
  - *What it is:* a function in Clojure's core library that builds a list from its arguments.
  - *Implementation:* `(list a b c ...)` — verified this session's established behavior: `(list 1 2 3)` produces the list `(1 2 3)`; `(list)`, with no arguments, produces the empty list.
  - *Its use:* Concept Unit 1, to produce the empty list directly, and every later unit, to build concrete example lists.
- **`empty?`**
  - *What it is:* a predicate in Clojure's core library testing whether a collection has no elements.
  - *Implementation:* `(empty? a-list)` returns `true` for the empty list, `false` for any list with at least one element.
  - *Its use:* Concept Unit 1, to check for the base case directly, and Concept Unit 3, as the base-case condition for this lesson's first list-consuming recursive function.
- **`cons`**
  - *What it is:* a function in Clojure's core library that builds a new list by placing one value in front of an existing list.
  - *Implementation:* `(cons x a-list)` — returns a new list whose first element is `x` and whose remaining elements are exactly `a-list`'s.
  - *Its use:* Concept Unit 2, the direct, callable version of Lesson 19's recursive case for lists.
- **`first`**
  - *What it is:* a function in Clojure's core library that returns a list's first element.
  - *Implementation:* `(first a-list)` returns the element at the front of `a-list`.
  - *Its use:* Concept Unit 3, to read the element a recursive function is currently handling.
- **`rest`**
  - *What it is:* a function in Clojure's core library that returns everything in a list except its first element.
  - *Implementation:* `(rest a-list)` returns a list of every element except the first; `(rest (list x))`, a one-element list, returns the empty list.
  - *Its use:* Concept Unit 3, to obtain the smaller list a recursive function calls itself on.

---

## Concept Unit: The Empty List — the Base Case, Made Real

### The Problem

Lesson 19 defined a list's base case as "the empty list," described in prose, with nothing to actually point to in running code. Is there a real Clojure value that *is* the empty list, checkable the way any other value can be checked?

### Introduce the concept in isolation

```
user=> (list)
()
user=> (empty? (list))
true
user=> (empty? (list 1 2 3))
false
```

`(list)`, called with no arguments, produces the **empty list** — printed as `()`, a real, checkable Clojure value, the same way `0` was a real value for the base case of natural numbers. `empty?` tests for it directly, exactly the way `(= n 0)` tested for the natural-number base case in every recursive function this series has written so far.

### Discard the throwaway example

REPL-only, same as most of this series' code examples.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of Lesson 19's own recursive list definition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(empty? (list))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`list`** — first appearance as a called function (covered fully in Objects and methods used, above): with no arguments, produces the empty list.
- **`empty?`** — first appearance as a called function: tests whether its argument has no elements.

### CS Lens

The empty list playing the role of a recursive definition's base case is the identical idea as `0` playing that role for natural numbers (Lesson 19) — both are the one instance of their kind that's given directly, with nothing smaller to build it from, and both are what every recursive function's base-case check ultimately tests for.

### SE Lens

Having a real, distinguishable empty-list value — rather than, say, using some other value like `nil` to mean "no more elements" informally — is what lets `empty?` answer the base-case question unambiguously. A representation that couldn't cleanly distinguish "an empty list" from "not a list at all" would make every recursive function's base case check a source of ambiguity, the same category of problem Lesson 12's partial functions raised about an undefined input being silently confused with a valid one.

---

## Concept Unit: `cons` — the Recursive Case, Made Real

### The Problem

The empty list is the base case. Lesson 19's recursive case for lists was "a value together with a smaller list." Is there a real, callable Clojure operation that performs exactly this construction?

### Introduce the concept in isolation

```
user=> (cons 1 (list 2 3))
(1 2 3)
user=> (cons 10 (list))
(10)
user=> (cons 1 (cons 2 (cons 3 (list))))
(1 2 3)
```

`cons` places a value in front of an existing list, producing a new, larger list. The last example proves something worth stating precisely: *every* list can be built this way, starting from the empty list and applying `cons` repeatedly — `(1 2 3)` is exactly `1` consed onto (`2` consed onto (`3` consed onto the empty list)), which is Lesson 19's recursive list definition, applied three times, written out explicitly rather than left as notation.

### Discard the throwaway example

REPL-only — though the insight (every list is built from `cons` and the empty list) carries forward directly.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(cons 1 (cons 2 (cons 3 (list))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`cons`** — first appearance as a called function (covered fully in Objects and methods used, above): builds a new list, one value at a time.
- **`(cons 3 (list))`** — the innermost call, evaluated first per Lesson 2's sub-expression rule: places `3` in front of the empty list, producing the one-element list `(3)`.
- **`(cons 2 (cons 3 (list)))`** — places `2` in front of the result of the inner call, producing `(2 3)`.
- **`(cons 1 (cons 2 (cons 3 (list))))`** — places `1` in front of that, producing `(1 2 3)` — the same nested-evaluation pattern Lesson 2 first traced for arithmetic, now building a list instead of a number.

### CS Lens

`cons`'s name comes from "construct," and this exact operation — one element, plus a smaller structure of the same kind — is what every recursive list-processing function in this series will use to build a *new* list as its result, starting with Lesson 25's `map`. Also recognized in: adding one link to the front of a chain, and Lesson 24's own recursive definition, made real rather than merely described.

### SE Lens

Building a list by repeatedly consing a value onto an existing one — from the inside out, smallest first — is the mirror image of how this section's recursive functions will *read* a list back apart, one element at a time, from the outside in (the next unit). Recognizing `cons` as the exact operational counterpart to Lesson 19's recursive case, rather than an unrelated new tool, is what makes the connection between "recursive data definition" and "real code" concrete instead of merely asserted.

### Connection to the previous unit

The previous unit established the empty list as the base case, made real; this unit shows the recursive case, made equally real — together, the two units supply working code for both halves of Lesson 19's recursive list definition.

---

## Concept Unit: `first` and `rest` — Taking a List Apart

### The Problem

`cons` builds a list from a value and a smaller list. Writing a recursive function that *processes* an existing list — the way `sum-to` processed a natural number by working with `n - 1` — needs the opposite operation: given a list, extract the value and the smaller list it was built from.

### Introduce the concept in isolation

```
user=> (first (list 1 2 3))
1
user=> (rest (list 1 2 3))
(2 3)
user=> (rest (list 1))
()
```

`first` returns a list's leading element; `rest` returns everything after it — a genuine, smaller list, itself built from the same recursive definition (proven by the last example: `rest` of a one-element list is the empty list, the base case itself).

Use both together to write this lesson's first recursive function operating on a list — computing its length, the identical shape as `sum-to`, with a list's own base case and recursive case in place of a natural number's:

```clojure
(defn my-length [lst]
  (if (empty? lst)
    0
    (+ 1 (my-length (rest lst)))))
```

```
user=> (my-length (list 1 2 3))
3
user=> (my-length (list))
0
```

### Discard the throwaway example

Not applicable — `my-length` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of Lesson 19's list definition (empty list → `0`; a value in front of a smaller list → `1` plus that smaller list's length).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn my-length [lst]
  (if (empty? lst)
    0
    (+ 1 (my-length (rest lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (empty? lst) 0 ...)`** — reappearing `if`/predicate shape (Lesson 20's `sum-to`), with the empty-list check in place of `(= n 0)` — exactly Lesson 21's structural recursion, now on a list's own base case instead of a natural number's.
- **`(+ 1 (my-length (rest lst)))`** — the recursive case: `1` (for the current element, whatever it is — notice `first` was never even needed here, since `my-length` only cares *how many* elements remain, not their values) plus the length of everything after it, obtained via `rest` — the identical "smaller instance" role `(- n 1)` played for natural numbers, now played by `rest`.

### CS Lens

`my-length` is structurally recursive on the list definition from Lesson 19, in precisely the sense Lesson 21 defined: its recursive call operates on exactly the "smaller instance" (`rest lst`) the list's own recursive case specifies — the identical relationship `sum-to` had to the natural numbers, now demonstrated on a genuinely different recursive data shape.

### SE Lens

`my-length`'s termination follows the identical measure-based argument Lesson 22 formalized: the list's length itself strictly decreases by one with every recursive call (each `rest` removes exactly one element), is bounded below by zero elements, and the empty-list base case catches it exactly there — the whole termination checklist, verified against a list-consuming function using the same reasoning already trusted for number-consuming ones.

### Connection to the previous unit

The previous unit built lists up from nothing, one `cons` at a time; this unit takes them apart, one `first`/`rest` pair at a time — the reverse direction, and the one every recursive list-consuming function in the rest of this section will actually use.

---

## Concept Unit: Building and Tearing Down Are Inverses

### The Problem

`cons` builds; `first` and `rest` take apart. Are these actually opposite operations — precisely undoing each other — or only loosely related?

### Introduce the concept in isolation

```
user=> (def original (list 1 2 3))
user=> (cons (first original) (rest original))
(1 2 3)
```

Taking `original` apart with `first` and `rest`, then immediately putting it back together with `cons`, reproduces the exact original list. This is Lesson 12's bijective function vocabulary, applied directly: `cons` and the pair `(first, rest)` are genuine inverses of each other, for any non-empty list — `cons` is injective in the strongest possible sense (there's only ever one value and one smaller list that could have produced any given non-empty list via `cons`), and `first`/`rest` together recover exactly that value and that smaller list, every time.

### Discard the throwaway example

REPL-only — though the guarantee this establishes (deconstruction perfectly reverses construction) underlies every recursive list function this section builds from here forward.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(cons (first original) (rest original))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### CS Lens

`cons` and `(first, rest)` being exact inverses is what makes Lesson 19's recursive list definition genuinely well-founded as a way of both building *and* processing lists — not just a description of what a list looks like, but a guarantee that any non-empty list can be uniquely, reliably decomposed into the one value and one smaller list that a `cons` call would have needed to produce it, with no ambiguity, the same certainty Lesson 12's bijective functions provide in general.

### SE Lens

Every recursive list function this section writes from here — `map` (Lesson 25), `filter` (Lesson 26), `reduce` (Lesson 27) — follows the identical two-step choreography this unit just verified is trustworthy: take the list apart with `first` and `rest`, do something with the pieces, and (for functions that build a new list, unlike `my-length`) put a new list back together with `cons`. Knowing that taking apart and building up are genuinely, provably inverse operations is what makes trusting that choreography, on any list of any length, a settled question rather than something to reverify with every new function.

### Connection to the previous unit

The previous unit introduced `first` and `rest` as the tools for taking a list apart; this unit proves they're not merely *a* way to inspect a list, but the exact reverse of `cons` — closing the loop between this lesson's constructive and deconstructive halves.

---

## Connect the Pieces

One file, using every operation from this lesson together, on a list built from this series' own running example — deposit amounts, rather than plain numbers:

```clojure
(defn my-length [lst]
  (if (empty? lst)
    0
    (+ 1 (my-length (rest lst)))))

(def deposit-amounts (cons 40 (cons 15 (cons 25 (list)))))

(println "Deposit list:" deposit-amounts)
(println "Number of deposits:" (my-length deposit-amounts))
(println "First deposit:" (first deposit-amounts))
(println "Remaining deposits:" (rest deposit-amounts))
(println "Rebuilt list matches original:" (= deposit-amounts (cons (first deposit-amounts) (rest deposit-amounts))))
```

```
Deposit list: (40 15 25)
Number of deposits: 3
First deposit: 40
Remaining deposits: (15 25)
Rebuilt list matches original: true
```

`deposit-amounts` was built entirely from the empty list and `cons` (Concept Units 1 and 2); `my-length` consumed it structurally, exactly mirroring the list's own recursive definition (Concept Unit 3); and the final check — tearing it apart and immediately rebuilding it — confirms, concretely, that `first`/`rest` and `cons` really are inverses for this specific list, not just in the abstract (Concept Unit 4).

## What Breaks Without This

Suppose `my-length` were written using `first` where `rest` belonged — a genuinely easy mistake, since both are called on the same argument shape:

```clojure
(defn broken-length [lst]
  (if (empty? lst)
    0
    (+ 1 (broken-length (first lst)))))
```

```
user=> (broken-length (list 1 2 3))
```

`(first lst)` returns a single *element* (`1`, a plain number), not a smaller *list* — the very next recursive call, `(broken-length 1)`, immediately fails: `(empty? 1)` isn't a meaningful question to ask of a plain number, and Clojure raises a real error rather than silently producing a wrong count. This is Lesson 21's structural recursion requirement, violated concretely: the recursive call is supposed to operate on a smaller instance of the *same kind* of thing (a smaller list) — calling it on `first`'s result instead passes something of a completely different kind, and the recursion breaks immediately rather than merely computing something wrong.

## Exercises

1. **Trace.** By hand, trace `(my-length (list 10 20 30 40))`, showing each recursive call and what `rest` returns at each step, the way Lesson 23 traced `sum-to`.
2. **Predict.** Before running it, predict what `(cons (first (list 5)) (rest (list 5)))` produces, using this lesson's inverse relationship directly rather than evaluating each piece separately.
3. **Build.** Using only `cons` and `(list)`, construct the list `(100 200 300)` from scratch, the way this lesson built `(1 2 3)`.
4. **Break it, on purpose.** Predict what happens if `(rest (list))` — `rest` on the *empty* list — is called. Run it and compare the actual behavior to your prediction; if it differs, explain what you missed.
5. **Generalize.** Write a recursive function `list-sum` that adds up every number in a list, using `first`, `rest`, and `empty?` — the same shape as `my-length`, but combining with `+` and an actual value instead of just counting.
6. **Reconstruct.** Close this lesson. From memory, explain why `cons` and the pair `(first, rest)` are inverses, and explain what specifically breaks in `broken-length` — not just that it errors, but which structural-recursion requirement it actually violates.

## Definition of Done

- [ ] You can build a list from scratch using only `cons` and the empty list.
- [ ] You can write a recursive function that consumes a list using `first`, `rest`, and `empty?`, without additional guidance.
- [ ] You completed Exercise 5 (`list-sum`) and verified it against at least two lists by hand.
- [ ] You can explain why `cons` and `(first, rest)` are genuine inverses, not just "related" operations.
- [ ] Commit `my-length` and your Exercise 5 `list-sum` to your notes repository, with a commit message noting which one uses `first` and which doesn't, and why — for example, `"Add my-length and list-sum — my-length never calls first since it only counts elements, list-sum needs first to actually use each value"` — not just `"lesson 24 exercise"`.

---

**Next lesson:** Lesson 25, *Map*, derives this series' first genuinely reusable list-transformation tool directly from the choreography this lesson just established — take a list apart, transform each piece, build a new list back up — generalized so it never has to be written by hand again.
