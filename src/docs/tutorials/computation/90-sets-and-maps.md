# Lesson 90: Sets and Maps

**What you will build**: By the end of this lesson you'll be able to define a Set and a Map by their *behavior* alone — what calling their operations must return — and confirm two genuinely different implementations of each satisfy the identical definition, revealing that Lesson 89's hash table was really two ideas (hashing, plus a simpler structure this lesson names directly) combined into one.

**What you need to know first**: Lesson 89's hash table, and Lesson 83's representation/cost-profile distinction.

**Terms introduced in this lesson**:

- **abstract data type** (ADT) — a collection defined by its operations and what they guarantee, independent of any specific representation. *Why it matters*: this is the precise vocabulary for something this series has been doing informally since Lesson 83 — separating *what* a structure does from *how* it's built.
- **Set** — an ADT holding unique values, supporting membership testing and adding, with no duplicates ever observable. *Why it matters*: a genuinely common need (Lesson 66's pigeonhole reasoning already assumed "no duplicates" informally) now given a precise, implementation-independent definition.
- **Map** — an ADT associating keys with values, supporting lookup, insertion, and (implicitly) the guarantee that looking up a key returns whatever was most recently associated with it. *Why it matters*: exactly what Lesson 89's hash table provided — now named as a contract any number of different representations could satisfy.

**Objects and methods used**: None new. This lesson combines `cons`, `first`, `rest`, `empty?`, and Lesson 89's hash table functions, each already covered.

---

## Concept Unit: A Set as an Abstract Data Type

### The Problem

Is "a collection of unique values" tied to any one specific implementation, or could two completely different representations both correctly behave as a Set?

### Introduce the concept in isolation

Define a Set purely by what its operations must do: `set-contains?` returns whether a value is present; `set-add` returns a Set containing that value, with no duplicate created if it was already present. Two genuinely different representations, both satisfying this exact contract:

```clojure
(defn set-contains? [s value] (= (hash-lookup s value) true))
(defn set-add [s value] (if (set-contains? s value) s (hash-insert s value true)))

(defn list-set-contains? [s value]
  (if (empty? s)
    false
    (if (= (first s) value)
      true
      (list-set-contains? (rest s) value))))

(defn list-set-add [s value] (if (list-set-contains? s value) s (cons value s)))
```

```
user=> (def s1 (set-add (set-add (set-add (make-hash-table 5) 3) 7) 3))
user=> (set-contains? s1 3)
true
user=> (set-contains? s1 7)
true
user=> (set-contains? s1 99)
false
user=> (def ls1 (list-set-add (list-set-add (list-set-add (list) 3) 7) 3))
user=> (list-set-contains? ls1 3)
true
user=> (list-set-contains? ls1 99)
false
```

Adding `3` twice, on *either* implementation, produces a Set indistinguishable from having added it once — `hash-insert`-backed and plain-list-backed, with completely different internal structures and cost profiles, yet identical, correct answers to every query. This is exactly what "abstract data type" means: the contract, not the representation, is what defines a Set.

### Discard the throwaway example

Not applicable — both implementations are real, complete, and satisfy the identical contract.

### Project Change

- **Reference Source**: `set-contains?`/`set-add` reuse Lesson 89's `hash-lookup`/`hash-insert` directly; `list-set-contains?`/`list-set-add` reuse Lesson 24's linear-search shape.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn set-add [s value] (if (set-contains? s value) s (hash-insert s value true)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`set-contains?`** — reuses `hash-lookup` (Lesson 89) directly, treating the stored dummy value `true` purely as a presence marker — the actual value stored is irrelevant; only *whether a lookup succeeds* matters for a Set.
- **`set-add`** — checks `set-contains?` *first*, making the operation idempotent (adding an already-present value changes nothing observable) — a real requirement of the Set contract that Lesson 89's raw `hash-insert`, used alone, would not have enforced (it would happily chain a duplicate entry).
- **`list-set-add`** — the identical idempotence check, applied to a completely different representation (a plain list), confirming the *contract*, not the mechanism, is what's actually being satisfied.

### CS Lens

This is precisely the distinction Lesson 83 first drew between an abstract collection and its representation, now given its formal name: an **abstract data type** is defined entirely by its interface's observable behavior, and Lesson 89's hash table is only *one* possible way — a fast, average-case-efficient one — to implement the Set contract, not the definition of a Set itself.

### SE Lens

Programming against a Set's *contract* (`set-contains?`, `set-add`) rather than against `hash-lookup`/`hash-insert` directly means the underlying representation could later be swapped — for a sorted-array-backed Set, say, with a different cost profile — without changing any code that only ever used the contract's own operations, a real, practical benefit of designing to an ADT rather than to one specific implementation.

---

## Concept Unit: A Map as an Abstract Data Type — and What Lesson 89 Actually Was

### The Problem

Lesson 89's hash table associated keys with values. Was hashing *essential* to that idea, or was it one added ingredient layered on top of something simpler?

### Introduce the concept in isolation

```clojure
(defn alist-put [m key value] (cons [key value] m))
(defn alist-get [m key]
  (if (empty? m)
    nil
    (if (= (get (first m) 0) key)
      (get (first m) 1)
      (alist-get (rest m) key))))
```

```
user=> (def m1 (alist-put (alist-put (list) 'name 'alice) 'age 30))
user=> (alist-get m1 'name)
alice
user=> (alist-get m1 'age)
30
user=> (alist-get m1 'missing)
nil
```

Look closely at `alist-get`: it is *exactly* Lesson 89's `bucket-lookup`, unchanged. A single bucket, on its own, already was a complete, correct, if `O(n)`, Map implementation — an **association list**. Lesson 89's hash table is precisely this idea, with one addition: hashing first picks *which* one of many smaller association lists to search, rather than searching one single, potentially long one — hashing turns one `O(n)` association list into `m` much shorter ones, each expected to hold only `n/m` entries (Lesson 89's own derivation).

### Discard the throwaway example

Not applicable — `alist-put`/`alist-get` are real, and this observation is a genuine structural fact about Lesson 89's own implementation.

### CS Lens

The **Map** ADT is defined purely by `get`/`put` behavior — lookup returns whatever was most recently associated with a key. Both the association list (simple, `O(n)`) and the hash table (more complex, expected `O(1)`) satisfy this identical contract; the hash table's added complexity buys a better *expected* cost profile, not different *correctness*.

### SE Lens

Recognizing a hash table as "hashing plus association lists" rather than as one indivisible technique is genuinely useful: it explains directly *why* Lesson 89's expected-complexity derivation worked the way it did — each bucket already behaves exactly like this lesson's simple, `O(n)` association list, and hashing's entire contribution is keeping each individual bucket small.

### Connection to the previous unit

The previous unit showed two structurally different implementations satisfying an identical Set contract; this unit goes further, showing one of Lesson 89's own building blocks — the bucket — *was already* a complete, independent Map implementation on its own, with hashing added purely to improve its expected cost.

---

## Connect the Pieces

Both ADTs, both kinds of implementation, confirmed side by side:

```clojure
(println "Hash-backed set, contains 3:" (set-contains? s1 3))
(println "List-backed set, contains 3:" (list-set-contains? ls1 3))
(println "Association-list map, get 'name:" (alist-get m1 'name))
(println "Bucket-lookup (Lesson 89) IS alist-get:" (= (alist-get m1 'name) (bucket-lookup m1 'name)))
```

```
Hash-backed set, contains 3: true
List-backed set, contains 3: true
Association-list map, get 'name: alice
Bucket-lookup (Lesson 89) IS alist-get: true
```

The final line confirms directly: `bucket-lookup`, Lesson 89's own internal helper, and `alist-get`, this lesson's standalone Map implementation, are the identical function under two names — the clearest possible evidence that a hash table's bucket *already is* a Map, on a smaller scale, all along.

## What Breaks Without This

Suppose code throughout a real program called `hash-lookup`/`hash-insert` directly everywhere a key-value association was needed, rather than programming against a Map-shaped contract. If a later requirement demanded ordered iteration (visiting keys in sorted order, something a hash table's bucket layout doesn't naturally provide), every single call site would need to be found and rewritten to use a different, ordered representation instead. Defining and programming against the Map contract *first*, the way this lesson did, means only the underlying implementation — not every caller — needs to change when the representation's requirements change.

## Exercises

1. **Trace.** By hand, confirm `list-set-add` is idempotent: trace `(list-set-add (list-set-add (list) 5) 5)` and confirm the result has `5` appearing only once.
2. **Predict.** Before checking, predict whether `alist-put` allows a key to be associated with a value *twice* (overwriting), given its definition always `cons`es a new pair. Verify by calling `alist-get` after two `alist-put` calls on the same key with different values.
3. **Verify.** Implement `set-remove` for the list-backed Set (removing a value if present, doing nothing if absent), and confirm it satisfies the same idempotence-style contract as `set-add`.
4. **Break it, on purpose.** Attempt to use `hash-insert` directly (not `set-add`) to "add" the same value to a Set twice. Call `set-contains?` afterward — does it still report correctly? Then inspect the underlying bucket directly and explain what actually changed, even though `set-contains?`'s answer didn't.
5. **Generalize.** Implement `map-keys`, returning every key currently present in an association-list-backed Map, using recursion over the list of pairs.
6. **Reconstruct.** Close this lesson. From memory, define the Set and Map ADTs by their contracts alone, and explain why Lesson 89's hash table bucket already was a complete Map implementation.

## Definition of Done

- [ ] You can define a Set and a Map by their observable behavior, independent of any one implementation.
- [ ] You completed Exercise 3 and implemented a correct `set-remove`.
- [ ] You completed Exercise 4 and can explain the gap between "still answers correctly" and "the representation is actually clean."
- [ ] You completed Exercise 5 and implemented a correct `map-keys`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Implement set-remove maintaining idempotent contract; implement map-keys over association-list map"` — not just `"lesson 90 exercise"`.

---

**Next lesson:** Lesson 91, *Binary Search*, derives a search technique that beats Lesson 24's linear search outright — not by hashing, but by exploiting *order* directly, the first time this series has used a sorted structure's own structure to search faster than checking every element.
