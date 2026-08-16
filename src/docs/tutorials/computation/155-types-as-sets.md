# Lesson 155: Types as Sets of Values

**What you will build**: By the end of this lesson you'll represent a type as a literal Clojure set — `\#\{\text{true}, \text{false}\}` for boolean — and show that "type checking" is nothing more than Lesson 10's `contains?`, "subtyping" is nothing more than Lesson 146's `\subseteq`, and Lesson 150's own sum/product possibility-counts are nothing more than Lesson 10's set operations, all three already fully built, now unified under one precise model: a type *is* the set of values it permits.

**What you need to know first**: Lesson 10's `#{}` sets, `contains?`, and `clojure.set/subset?`; Lesson 146's subtype-flavored partial order; Lesson 150's sum and product types and their possibility counts.

**Terms introduced in this lesson**: None new — this lesson unifies three already-taught ideas (sets, subsets, sum/product counting) as one precise model of "type," rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `#{}`, `contains?`, and `clojure.set/subset?` (Lesson 10), and `assoc`/`count`/`get` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: A Type, Represented as a Real Set

### The Problem

"Is `5` a boolean?" feels like an obviously "no" — but is there a precise, checkable operation underneath that intuition, the way every other property this section has named turned out to have one?

### Introduce the concept in isolation

```
user=> (def boolean-type #{true false})
user=> (contains? boolean-type true)
true
user=> (contains? boolean-type 5)
false
```

`boolean-type` is a real Clojure set (Lesson 10) containing exactly the two values a boolean can be. "Is `5` a boolean" is exactly `(contains? boolean-type 5)` — `false`, checked directly. **Type checking**, under this model, is nothing more than set membership: a value has a given type exactly when it's a member of that type's own set.

### Discard the throwaway example

Not applicable — real, verified `contains?` calls, not an assumption about what "boolean" obviously means.

### Project Change

- **Reference Source**: No reference counterpart — direct application of Lesson 10's own `#{}`/`contains?` to a new interpretation (types), unchanged in behavior.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies existing functions (`contains?`) to a new interpretation of an existing construct (`#{}`), rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`#{true false}`** — reappearing set literal (Lesson 10), given a new meaning here: not just "a collection," but the complete, exact list of one type's legal values.
- **`(contains? boolean-type true)`, `(contains? boolean-type 5)`** — reappearing `contains?` (Lesson 10), doing real type-checking work for the first time in this curriculum.

### CS Lens

Every type this curriculum has built — Lesson 7's boolean, Lesson 150's sum and product types — was always, precisely, a set of legal values; this lesson changes nothing about how any of them work, only makes that fact usable directly, with Lesson 10's own already-built set operations.

### SE Lens

A real type-checking compiler performs exactly this operation, vastly scaled up: confirming a given value belongs to the set a declared type permits, before allowing the program to run — the identical `contains?`-shaped question this unit just answered by hand, for real, on a two-element set.

---

## Concept Unit: Subtyping Is Subset

### The Problem

"Every positive integer is also a valid integer" is an obviously true statement about types. Is there a precise operation underneath *that* intuition too?

### Introduce the concept in isolation

```
user=> (def positive-ints #{1 2 3 4 5})
user=> (def all-ints #{-2 -1 0 1 2 3 4 5})
user=> (clojure.set/subset? positive-ints all-ints)
true
```

`positive-ints` is a genuine `\subseteq` of `all-ints` (Lesson 146) — every value legal for the smaller type is also legal for the larger one. This is **subtyping**: type `A` is a subtype of type `B` exactly when `A`'s own set of legal values is a subset of `B`'s.

### Discard the throwaway example

Not applicable — real, verified `subset?` result, not an assumption from the type names alone.

### Project Change

- **Reference Source**: No reference counterpart — direct application of Lesson 146's own `subset?` to a new interpretation (subtyping), unchanged in behavior.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies an existing function (`clojure.set/subset?`) to a new interpretation rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/subset? positive-ints all-ints)`** — reappearing `clojure.set/subset?` (Lesson 146), doing real subtyping work for the first time: confirms every legal `positive-ints` value is also a legal `all-ints` value.

### CS Lens

Lesson 146's own partial order — reflexive, transitive, antisymmetric, with real incomparable pairs — applies directly to subtyping: two types can genuinely be incomparable (neither a subtype of the other), the exact same structural fact `\subseteq`'s own partial order already proved for arbitrary sets.

### SE Lens

Any function accepting `all-ints` safely accepts `positive-ints` too — exactly the substitutability a real type system's subtyping relation is meant to guarantee, and exactly what `subset?` returning `true` here actually certifies, not merely suggests.

### Connection to the previous unit

The previous unit checked whether one value belongs to one type's set; this unit checks whether one entire type's set belongs inside another's — the identical set-based model, one level up.

---

## Concept Unit: Sum and Product Counts, Now Just Set Sizes

### The Problem

Lesson 150 proved a product type's possibility count multiplies and a sum type's adds. Does that fall out directly from treating both as sets, using nothing beyond `count`?

### Introduce the concept in isolation

```clojure
(defn all-pairs [xs-vec ys-vec i j acc]
  (if (>= i (count xs-vec))
    acc
    (if (>= j (count ys-vec))
      (all-pairs xs-vec ys-vec (+ i 1) 0 acc)
      (all-pairs xs-vec ys-vec i (+ j 1) (assoc acc (count acc) [(get xs-vec i) (get ys-vec j)])))))
```

```
user=> (def color-type ["red" "green" "blue"])
user=> (def flag-type [true false])
user=> (count (all-pairs color-type flag-type 0 0 []))
6
```

`all-pairs` is Lesson 150's own product-enumeration function, unchanged. Its result's `count` — `6` — is exactly `|color\text{-}type| \times |flag\text{-}type|`, `3 \times 2`. Nothing new was needed: a product type's own possibility-set is just the set of all pairs, and `count` on that set is the *cardinality* — the size — of the type itself, under this lesson's model.

### Discard the throwaway example

Not applicable — `all-pairs` is Lesson 150's own real, already-verified function, reused directly here.

### Project Change

- **Reference Source**: Lesson 150's own `all-pairs`, reused directly, unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit reuses Lesson 150's own existing function rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(count (all-pairs color-type flag-type 0 0 []))`** — reappearing `count` (Lesson 94) applied to a reappearing function (Lesson 150): the type's own cardinality, computed the identical way any other set's size would be.

### CS Lens

"Sum type" and "product type" were named for exactly this reason, made concrete across this whole lesson: a type, modeled as a set, has a size; a sum type's size is its alternatives' sizes added (set union-like); a product type's size is its components' sizes multiplied (set product-like) — Lesson 60's counting rules and Lesson 10's set operations were never two separate ideas.

### SE Lens

Knowing a type's exact cardinality in advance — rather than discovering it by trial — is what lets an exhaustive test suite (checking every possible value) be recognized as actually *exhaustive*, rather than merely thorough; a type with a known, small cardinality is precisely the kind Lesson 108's own "test the real behavior, don't assume" discipline can fully, not just partially, verify.

### Connection to the previous unit

The previous unit compared two types' sets directly; this unit shows a type's own size — not just its membership or its relationship to another type — is equally a direct consequence of the identical set model.

---

## Connect the Pieces

Membership, subtyping, and cardinality, all through the identical set-based model:

```clojure
(println "5 is a boolean?" (contains? boolean-type 5))
(println "positive-ints subtype of all-ints?" (clojure.set/subset? positive-ints all-ints))
(println "product type cardinality:" (count (all-pairs color-type flag-type 0 0 [])))
```

```
5 is a boolean? false
positive-ints subtype of all-ints? true
product type cardinality: 6
```

Three different-sounding type questions — "is this a legal value," "is this type narrower than that one," "how many values does this type even have" — all answered by the identical machinery Lesson 10 already built, none of it needing to be reinvented for types specifically.

## What Breaks Without This

Suppose a codebase's own type-checking logic were written as ad hoc, scattered `if`/`or` chains — `(or (= v true) (= v false))` for "is this a boolean," repeated slightly differently everywhere a similar check was needed — rather than a single, real set checked with `contains?`. Every one of those scattered checks would need to be found and updated together if the type's own legal values ever changed, with no structural guarantee they'd all been found, the identical maintenance risk Lesson 139's own abstraction-barrier argument already warned about, here specifically for the concept of a type itself rather than a single ADT's operations.

## Exercises

1. **Trace.** By hand, using `contains?`'s own definition, confirm `(contains? #{1 2 3} 2)` is `true` and `(contains? #{1 2 3} 4)` is `false`.
2. **Predict.** Before checking, predict whether `#{1 2}` and `#{2 3}` are subtypes of each other, in either direction. Then verify with `subset?` both ways, and explain the result using Lesson 146's own "incomparable" term.
3. **Verify.** Confirm the sum-type cardinality of `color-type` and `flag-type` together (as alternatives, not a bundle) is `5`, using Lesson 150's own `tagged-colors`/`tagged-flags`/`concat` approach.
4. **Break it, on purpose.** Construct two sets that are genuinely equal as types (identical legal values) but built from literals in a different order, and confirm `=` still reports them equal — explain why order never matters for a set-based type model.
5. **Generalize.** Describe, without coding it, why an *infinite* type (all integers, say) can still be reasoned about with this lesson's subset/membership model, even though `count` could never finish computing its size.
6. **Reconstruct.** Close this lesson. From memory, explain why "type checking," "subtyping," and "counting a type's possible values" are all the identical set-based idea, not three separate mechanisms that happen to resemble each other.

## Definition of Done

- [ ] You can represent a type as a real Clojure set and check membership with `contains?`.
- [ ] You can check subtyping between two types using `subset?` and explain what a `true` result actually certifies.
- [ ] You can explain why a product type's cardinality multiplies and a sum type's adds, using this lesson's own set-based model, not just Lesson 150's original combinatorial argument.
- [ ] You completed Exercise 2 and correctly identified an incomparable pair of types under subtyping.
- [ ] You completed Exercise 3 and confirmed the sum-type cardinality of `color-type`/`flag-type` is `5`.
- [ ] Commit your Exercise 2 and Exercise 3 work to your notes repository, with a commit message stating what you confirmed — for example, `"Confirm {1,2}/{2,3} are incomparable subtypes; confirm color-type/flag-type sum cardinality is 5"` — not just `"lesson 155 exercise"`.

---

**Next lesson:** Lesson 156, *Programs as Functions*, extends this lesson's own model one step further — not just a value's type as a set, but an entire *program* as a mathematical function from its inputs' set to its outputs' set, the denotational view of what a program actually means.
