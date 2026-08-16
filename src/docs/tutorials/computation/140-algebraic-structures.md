# Lesson 140: Algebraic Structures

**What you will build**: By the end of this lesson you'll write real checkers for four properties a binary operation on a set can have — closure, identity, inverses, and associativity — and run them against two genuinely different operations on the same small set, `{0, 1, 2, 3}` under clock-style addition, to see concretely which properties each one actually satisfies. These four properties, checked precisely rather than assumed, are the exact vocabulary the rest of Section VII names combinations of — a monoid, a group, a ring — as specific, named bundles of them.

**What you need to know first**: Lesson 139's abstraction, applied here to operations instead of data structures; Lesson 54's `mod`; Lesson 10's `#{}` sets and `contains?`.

**Terms introduced in this lesson**:

- **binary operation** — a function taking two elements of a set and producing a result, written here as a two-argument function like any other (Lesson 4). *Why it matters*: addition, multiplication, string concatenation, and Lesson 86's `stack-push` are all binary operations in this precise sense — the same shape underlying wildly different-looking things.
- **closure** — a set is closed under an operation when applying that operation to any two elements of the set always produces a result that is *also* in the set. *Why it matters*: without closure, an operation can hand back something outside the very set it's supposed to operate on — not an error, but a real structural break, checked directly in this lesson's first unit.
- **identity element** — an element `e` such that combining it with any other element `a`, in either order, leaves `a` unchanged. *Why it matters*: a genuinely different idea from Lesson 6's `identical?` (same underlying value) and Lesson 56's Bézout's identity (a specific equation) — this lesson's "identity" names a special *element* of a set with respect to one specific operation, not a comparison or an equation.
- **inverse** — for an element `a`, another element `a'` such that combining them, in either order, produces the identity element. *Why it matters*: a broader idea than Lesson 56's modular inverse (one specific case, under multiplication mod `n`) — this lesson's version applies to any operation with an identity element at all.
- **associativity** — an operation is associative when grouping three combined elements differently never changes the result: `(a \, \text{op} \, b) \, \text{op} \, c` always equals `a \, \text{op} \, (b \, \text{op} \, c)`. *Why it matters*: this is the exact, usually-unstated property that let Lesson 27's `reduce` combine a whole collection without ever specifying an evaluation order — reduce was always secretly relying on this.

**Objects and methods used**: None new. This lesson reuses `mod` (Lesson 54), `#{}` and `contains?` (Lesson 10), and `=` (Lesson 6), each already covered.

---

## Concept Unit: Closure — Does the Result Stay In the Set?

### The Problem

`{0, 1, 2, 3}` under clock-style addition (`mod4-add a b`, defined as `(a + b) \bmod 4`) and the same set under ordinary subtraction are both "a set plus an operation." Is there a precise, checkable difference between them, or is that just two operations that happen to look different?

### Introduce the concept in isolation

```clojure
(defn mod4-add [a b] (mod (+ a b) 4))
(def elements #{0 1 2 3})

(defn closed-at? [op elements a b] (contains? elements (op a b)))

(defn closed-row? [op elements a b n]
  (if (>= b n)
    true
    (if (closed-at? op elements a b)
      (closed-row? op elements a (+ b 1) n)
      false)))

(defn all-closed? [op elements a n]
  (if (>= a n)
    true
    (if (closed-row? op elements a 0 n)
      (all-closed? op elements (+ a 1) n)
      false)))
```

```
user=> (all-closed? mod4-add elements 0 4)
true
user=> (all-closed? - elements 0 4)
false
```

`all-closed?` checks every pair `(a, b)` with both drawn from `0` through `3`: `mod4-add` passes every one, since `mod` (Lesson 54) always returns a value in `0`..`3` by definition. Subtraction fails immediately — `closed-at?` on `a=0, b=1` computes `(- 0 1)`, `-1`, which `elements` doesn't contain, so `all-closed?` short-circuits `false` at the very first pair checked.

### Discard the throwaway example

Not applicable — `all-closed?` is real, reusable, and verified this session against two genuinely different operations.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch checker for this lesson's own defined property.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn closed-at? [op elements a b] (contains? elements (op a b)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod (+ a b) 4)`**, in `mod4-add` — reappearing `mod` (Lesson 54): forces every result back into `0`..`3`, which is exactly why closure holds by construction here.
- **`(contains? elements (op a b))`**, in `closed-at?` — reappearing `contains?` on a real set (Lesson 10): tests set membership directly, the precise operation closure is defined in terms of.
- **`(closed-row? op elements a b n)` / `(all-closed? op elements a n)`** — first appearance of a *triple*-purpose nested scan (row index `b`, resetting per outer index `a`, matching the shape Lesson 134's `all-capacity-ok?` already used for a different check): every pair in the `n \times n` grid gets tested, short-circuiting `false` the moment one fails.

### CS Lens

Closure is the property that makes "keep applying this operation" a meaningful thing to do at all *within* a set — without it, repeated addition could eventually hand back something that isn't even a number in the original sense (exactly what happens dividing integers: `1 / 2` isn't an integer, so integers aren't closed under division).

### SE Lens

Checking closure exhaustively over a small, finite set — rather than trusting an informal argument — is Lesson 108's own verify-before-trusting discipline, applied to a mathematical property instead of a data structure: `mod4-add`'s closure is *provable* from `mod`'s own definition without running anything, but running `all-closed?` anyway turns that proof into a checked fact rather than an assumption.

---

## Concept Unit: Identity and Inverses — Undoing, and Doing Nothing

### The Problem

Is there a value in `{0, 1, 2, 3}` that `mod4-add` can combine with anything else without changing it — and, separately, can every element be "undone" by combining it with some other element to get back to that special value?

### Introduce the concept in isolation

```clojure
(defn identity-check [op e a n]
  (if (>= a n)
    true
    (if (= (op e a) a)
      (identity-check op e (+ a 1) n)
      false)))

(defn is-inverse? [op ident a a-prime] (= (op a a-prime) ident))
```

```
user=> (identity-check mod4-add 0 0 4)
true
user=> (identity-check mod4-add 1 0 4)
false
user=> (is-inverse? mod4-add 0 1 3)
true
user=> (is-inverse? mod4-add 0 1 2)
false
```

`0` is `mod4-add`'s **identity element**: `identity-check` confirms `(mod4-add 0 a)` equals `a` for every `a` in `0`..`3`. `1` fails the same check — `(mod4-add 1 0)` is `1`, not `0`, so `identity-check` returns `false` at the very first element tested. Given `0` as the identity, `3` is `1`'s **inverse**: `(mod4-add 1 3)` is `4 \bmod 4 = 0`, the identity — confirmed by `is-inverse?`. `2` is not `1`'s inverse: `(mod4-add 1 2)` is `3`, not `0`.

### Discard the throwaway example

Not applicable — both functions are real, verified against both a true and a false case each.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch checkers for this lesson's own defined properties.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn is-inverse? [op ident a a-prime] (= (op a a-prime) ident))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= (op e a) a) ...)`**, in `identity-check` — first appearance of this specific test: checks the *defining* property of an identity element directly, one candidate element at a time, rather than asserting `0` "looks like" the identity.
- **`(= (op a a-prime) ident)`**, in `is-inverse?` — same defining-property-as-a-direct-check pattern, applied to inverses instead: an inverse isn't "the opposite-looking number," it's specifically whatever combines with `a` to reach the identity, checked exactly.

### CS Lens

Integers have an additive identity (`0`) and every integer has an additive inverse (`-a`) — but integers do *not* have a multiplicative inverse for every element: `2`'s multiplicative inverse would need to satisfy `2 \times x = 1`, and no integer `x` does. This is the previous unit's closure failure again, one level removed: constructing `2`'s multiplicative inverse requires division, and integers were already shown not to be closed under that.

### SE Lens

Real inverses matter operationally, not just theoretically: Lesson 33's backtracking needed a way to *undo* a choice on failure — an inverse operation, informally, for "try a value." Naming the property precisely, as this unit does, is what makes it possible to ask "does this operation actually support undoing at all" as a real, checkable question instead of assuming every operation can be reversed.

### Connection to the previous unit

The previous unit asked whether an operation's results stay inside the set; this unit asks a sharper question about the *same* set and operation — whether one special element exists, and whether every element can be reversed relative to it.

---

## Concept Unit: Associativity — Does Grouping Matter?

### The Problem

`mod4-add`'s closure and identity were both confirmed. Does the *order* three values get combined in change the result — or can parentheses be dropped entirely, the way ordinary arithmetic allows?

### Introduce the concept in isolation

```clojure
(defn associative-at? [op a b c] (= (op (op a b) c) (op a (op b c))))

(defn assoc-row? [op a b c n]
  (if (>= c n)
    true
    (if (associative-at? op a b c)
      (assoc-row? op a b (+ c 1) n)
      false)))

(defn assoc-plane? [op a b n]
  (if (>= b n)
    true
    (if (assoc-row? op a b 0 n)
      (assoc-plane? op a (+ b 1) n)
      false)))

(defn all-associative? [op a n]
  (if (>= a n)
    true
    (if (assoc-plane? op a 0 n)
      (all-associative? op (+ a 1) n)
      false)))
```

```
user=> (associative-at? mod4-add 1 2 3)
true
user=> (all-associative? mod4-add 0 4)
true
user=> (- (- 5 3) 1)
1
user=> (- 5 (- 3 1))
3
user=> (associative-at? - 5 3 1)
false
```

`(mod4-add (mod4-add 1 2) 3)` and `(mod4-add 1 (mod4-add 2 3))` agree — grouping doesn't matter for this one triple. `all-associative?` extends the check to *every* triple in `0`..`3` at once, one more nested level than Concept Unit 1's `all-closed?` (`a`, then `b`, then `c`, each resetting the level below it) — still `true` across all `64` triples. Subtraction disagrees sharply on just one triple: `(5 - 3) - 1` is `1`, but `5 - (3 - 1)` is `3` — two different real numbers from the identical three inputs, depending only on which pair gets combined first. `associative-at?` catches exactly this disagreement directly, not by assuming subtraction "should" behave like addition.

### Discard the throwaway example

Not applicable — `associative-at?` is real, verified against both an associative and a non-associative operation.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch checker for this lesson's own defined property.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn associative-at? [op a b c] (= (op (op a b) c) (op a (op b c))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(op (op a b) c)`** — first appearance of this specific shape: the *left*-grouped combination, `a` and `b` combined first, then `c`.
- **`(op a (op b c))`** — the *right*-grouped combination, `b` and `c` combined first, then `a` — compared directly against the left-grouped result by `=`.
- **`assoc-row?`/`assoc-plane?`/`all-associative?`** — reappearing nested-scan shape (this lesson's own first unit, `closed-row?`/`all-closed?`), extended one level deeper: `c` scans innermost and resets per `b`, `b` scans next and resets per `a`, `a` scans outermost — every one of the `4^3 = 64` triples in `0`..`3` gets checked, short-circuiting `false` at the first failure exactly as the two-level version does.

### CS Lens

Associativity is exactly what makes Lesson 27's `reduce` well-defined at all without specifying an evaluation order: `reduce` never promises *which* pairs it combines first, and for a non-associative operation like subtraction, that unspecified order would make `reduce`'s own result ambiguous — a fact this curriculum's own `reduce` examples always quietly depended on, never stated until now. Also recognized in: matrix multiplication (associative, letting a chain of multiplications be grouped for efficiency without changing the answer); function composition (Lesson 5's `comp`, associative for exactly this same reason).

### SE Lens

A parallel or distributed system that splits work across multiple machines and combines partial results — a real, common architecture — depends on associativity to be correct at all: if the combining operation isn't associative, the *order* partial results happen to arrive back in changes the final answer, turning a performance optimization into a correctness bug.

### Connection to the previous unit

The previous unit examined a single special element and its inverses; this unit examines a structural property of the operation itself, independent of any particular element — the last of this lesson's four properties, together forming the exact vocabulary the next several lessons name specific combinations of.

---

## Connect the Pieces

All four properties, checked against the identical operation and set:

```clojure
(println "Closed?" (all-closed? mod4-add elements 0 4))
(println "0 is identity?" (identity-check mod4-add 0 0 4))
(println "Every element has an inverse?" (and (is-inverse? mod4-add 0 0 0) (is-inverse? mod4-add 0 1 3) (is-inverse? mod4-add 0 2 2) (is-inverse? mod4-add 0 3 1)))
(println "Associative?" (all-associative? mod4-add 0 4))
```

```
Closed? true
0 is identity? true
Every element has an inverse? true
Associative? true
```

`{0, 1, 2, 3}` under `mod4-add` satisfies all four properties this lesson defined — closure, an identity element, an inverse for every element, and associativity. That exact combination has a name, the very next lesson's own subject.

## What Breaks Without This

Suppose a later lesson simply asserted "this operation behaves like ordinary addition" without ever checking these four properties directly. Section VII's next several lessons build real proofs on top of exactly these properties — a monoid's own algorithms (Lesson 141) rely on associativity to justify combining elements in any order; a group's own algorithms (Lesson 143) rely on every element actually having a real inverse. An operation that merely *looks* similar to addition but silently fails one of these — the way plain subtraction fails both closure and associativity over this lesson's own set — would make any proof built on top of the missing property simply wrong, discovered only when something built on that assumption breaks in a way this lesson's own direct checks would have caught immediately.

## Exercises

1. **Trace.** By hand, using `mod`'s own definition, explain why `mod4-add` is closed over `{0, 1, 2, 3}` for *any* two inputs, not just the ones this lesson happened to check.
2. **Predict.** Before checking, predict whether ordinary multiplication is associative over `{0, 1, 2, 3}` (using real multiplication, not `mod4-add`). Then verify with `associative-at?`.
3. **Verify.** Confirm every element of `{0, 1, 2, 3}` has an inverse under `mod4-add` by checking `is-inverse?` for all four elements, not just the two shown in this lesson.
4. **Break it, on purpose.** Define `mod4-mult` (multiplication mod `4`) and check whether `3` has a multiplicative inverse within `{0, 1, 2, 3}` — report which candidate, if any, actually works, and which don't.
5. **Generalize.** Describe, without coding it, how `all-closed?` and `all-associative?` would need to change for a set that isn't a simple range `0` through `n-1` — say, `{2, 4, 6, 8}`.
6. **Reconstruct.** Close this lesson. From memory, explain why subtraction fails both closure and associativity over `{0, 1, 2, 3}`, using this lesson's own two real counterexamples, not a general statement about subtraction.

## Definition of Done

- [ ] You can define closure, identity, inverse, and associativity precisely, each as a checkable property of an operation on a set.
- [ ] You can explain why `mod4-add` satisfies all four properties over `{0, 1, 2, 3}` and why plain subtraction fails two of them.
- [ ] You can explain why `reduce` (Lesson 27) silently depends on associativity.
- [ ] You completed Exercise 3 and confirmed every element of `{0, 1, 2, 3}` has an inverse under `mod4-add`.
- [ ] You completed Exercise 4 and reported which elements of `{0, 1, 2, 3}`, if any, have a multiplicative inverse mod `4`.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm all four elements have mod4-add inverses; find 1 and 3 have mod4-mult inverses, 0 and 2 do not"` — not just `"lesson 140 exercise"`.

---

**Next lesson:** Lesson 141, *Monoids*, names the specific combination this lesson's own `mod4-add` already satisfies — closure, associativity, and an identity element, without requiring inverses — and shows why string concatenation, addition, and Lesson 27's `reduce` all share that identical underlying structure.
