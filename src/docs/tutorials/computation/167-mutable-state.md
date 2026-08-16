# Lesson 167: Mutable State

**What you will build**: By the end of this lesson you'll split Lesson 164's single environment into two separate pieces — an **environment** mapping names to **locations**, and a **store** mapping locations to real values — and prove, with real code, that mutating a value through `set-var` never touches the environment at all: the same name, the same location, two different stores, two different values, `100` then `200`.

**What you need to know first**: Lesson 164's environment and `lookup`; Lesson 165's closures, revisited here as the reason this separation matters.

**Terms introduced in this lesson**:

- **store** — a mapping from locations to the real, current values held there, kept separate from the environment. *Why it matters*: every environment this curriculum built through Lesson 166 mapped a name directly to a value; this lesson adds one level of indirection specifically so that value can change without the environment itself changing at all.
- **location** — an address a store can be indexed by — here, a plain integer position, the same way Lesson 84's array indices already work. *Why it matters*: the thing an environment actually maps a name to, once environment and store are separated — not a value itself, but where a value currently lives.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc` (Lesson 84) and `lookup` (Lesson 154), each already covered.

---

## Concept Unit: Environment Maps to Locations, Store Maps to Values

### The Problem

Every environment this curriculum has built maps a name straight to its current value. If that value needs to change later — a real assignment, `x = 200` after `x` already meant `100` — does the environment itself have to change, or can something else absorb that change instead?

### Introduce the concept in isolation

```clojure
(defn store-get [store loc] (get store loc))
(defn store-set [store loc value] (assoc store loc value))

(defn get-var [env store name] (store-get store (lookup env name)))
(defn set-var [env store name value] (store-set store (lookup env name) value))
```

```
user=> (def env [["x" 0]])
user=> (def store [100])
user=> (get-var env store "x")
100
user=> (def store2 (set-var env store "x" 200))
user=> (get-var env store2 "x")
200
user=> (= env [["x" 0]])
true
```

`env` no longer maps `"x"` to `100` directly — it maps `"x"` to `0`, a **location**. `store`, a plain vector indexed by location (Lesson 84's own array indexing), holds the real value at that location. `get-var` looks up the location first, then reads the store at that location. `set-var` does the identical lookup, then produces a *new* store with that one location updated — and `env` itself, checked directly on the last line, never changed at all. The name-to-location mapping is permanent; only what's stored at a location can change.

### Discard the throwaway example

Not applicable — `get-var`/`set-var` are real, reusable, and verified to show a real value change with the environment itself provably unchanged.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch split of Lesson 164's own single environment into two cooperating pieces.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn get-var [env store name] (store-get store (lookup env name)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(lookup env name)`** — reappearing `lookup` (Lesson 154), now returning a *location* — a plain integer — instead of a real value directly.
- **`(get store loc)`, `(assoc store loc value)`**, in `store-get`/`store-set` — reappearing `get`/`assoc` (Lesson 84): the store itself is just a vector, read and updated by ordinary indexing, exactly the way any array-backed structure this curriculum has built already works.
- **`(store-set store (lookup env name) value)`**, in `set-var` — first appearance of this specific idea: mutation is entirely a store operation — `env` is read from, via `lookup`, but never written to at all.

### CS Lens

This is exactly the environment/store split real language semantics uses to define assignment precisely: without it, "what does mutation actually change" has no crisp answer — with it, the answer is exact: mutation always changes the store, never the environment.

### SE Lens

Keeping locations stable while values change is what makes two different pieces of code that both hold the *same* location — Lesson 165's own closures, capturing an environment — agree about a variable's current value even after one of them mutates it, without either one needing to be told the other exists.

---

## Concept Unit: Mutation Is Visible Wherever the Location Is Shared

### The Problem

If two different pieces of code both know the same location — not the same environment object necessarily, just the same location number — does a mutation made through one show up when the other reads it?

### Introduce the concept in isolation

```clojure
(defn read-x-twice [env store1 store2]
  [(get-var env store1 "x") (get-var env store2 "x")])
```

```
user=> (read-x-twice env store store2)
[100 200]
```

`read-x-twice` reads `"x"` twice, through the identical `env` — meaning the identical location, `0` — but against two different stores: `store`, from before the mutation, and `store2`, from after. It reports both real values, `100` and `200`, side by side, from the *same* location. Nothing about `env` had to change, and nothing about `get-var` had to know a mutation happened elsewhere — reading the current store at a shared location is automatically enough.

### Discard the throwaway example

Not applicable — real, verified proof that the same location genuinely reflects a mutation made through a different store snapshot.

### Project Change

- **Reference Source**: No reference counterpart — a direct demonstration using this lesson's own already-built `get-var`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit demonstrates existing functions on two different store snapshots rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get-var env store1 "x")`, `(get-var env store2 "x")`** — reappearing `get-var` (this lesson's first unit), called twice with the identical `env` and `name`, differing only in which store snapshot each call reads from — the entire proof that a location, not an environment object, is what mutation actually targets.

### CS Lens

This is precisely why Lesson 165's closures work correctly with later mutation: a closure captures `env` (name-to-location), not a frozen copy of values — a variable mutated *after* a closure is created still shows its new value the next time that closure runs, because the closure was never holding the value directly, only the location to look it up at, one more level of indirection than Lesson 165's own examples needed to show explicitly.

### SE Lens

The real cost of this indirection is that every variable read now takes two steps — environment lookup, then store lookup — instead of one; the real benefit is that mutation becomes possible at all without invalidating every existing reference to a variable's location, the identical tradeoff Lesson 166's own thunk-forcing cost was made for a different reason.

### Connection to the previous unit

The previous unit built the environment/store split and proved the environment itself doesn't change; this unit proves the *practical* consequence — a mutation is visible through any code sharing the same location, without any of that code needing to coordinate directly.

---

## Connect the Pieces

Environment, store, and a real mutation, checked at every step:

```clojure
(println "Before mutation:" (get-var env store "x"))
(println "After mutation:" (get-var env store2 "x"))
(println "env still unchanged:" (= env [["x" 0]]))
```

```
Before mutation: 100
After mutation: 200
env still unchanged: true
```

The value changed; the environment — the name-to-location mapping — never did.

## What Breaks Without This

Suppose environment and store had never been separated — mutation simply replaced a name's value directly inside the environment itself, the way Lesson 164's own single-mapping model worked. A closure (Lesson 165) capturing that environment *before* a mutation would have captured the *old* value baked directly in, with no way to see a later change at all — exactly the opposite of how real mutable variables are expected to behave (a closure over a loop variable, in most real languages, sees that variable's *current* value at call time, not its value when the closure was created). The environment/store split is precisely what makes "capture now, see later changes" possible — collapsing the two back into one loses that capability entirely, silently, until code that assumed it broke.

## Exercises

1. **Trace.** By hand, trace `(get-var env store2 "x")` through `get-var`/`store-get`/`lookup`, confirming exactly which location and which store value it reaches.
2. **Predict.** Before checking, predict `(get-var env store "y")` — a variable `env` doesn't contain at all. Then verify it returns `nil`, and explain using Lesson 154's own `lookup` behavior.
3. **Verify.** Add a second variable, `"z"`, at location `1`, with its own store entry, and confirm mutating `"x"` via `set-var` leaves `"z"`'s own value completely unaffected.
4. **Break it, on purpose.** Write a broken `set-var` that mutates `env` directly instead of `store` (mimicking Lesson 164's own single-mapping model), and describe the real problem this reintroduces for a closure created before the mutation.
5. **Generalize.** Describe, without coding it, how `extend-env` (Lesson 165) would need to change to also extend the store with a new location, when a new variable is introduced rather than an existing one mutated.
6. **Reconstruct.** Close this lesson. From memory, explain why `100` and `200`, read through the identical `env`, prove mutation is a store operation, not an environment operation.

## Definition of Done

- [ ] You can explain why an environment maps names to locations, and a separate store maps locations to values.
- [ ] You can mutate a variable's value with `set-var` and prove the environment itself is unchanged.
- [ ] You can explain why this separation is what makes a closure see a variable's value *at call time*, not frozen at definition time.
- [ ] You completed Exercise 3 and confirmed mutating one variable leaves a second, unrelated variable's value untouched.
- [ ] You completed Exercise 4 and described the real problem with mutating the environment directly instead of the store.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm mutating x leaves z's store value untouched; show env-direct mutation breaks a closure captured before the mutation"` — not just `"lesson 167 exercise"`.

---

**Next lesson:** Lesson 168, *References*, extends this lesson's own store model to a real, practical consequence — two different variable *names* both pointing to the identical location, so that mutating through either one is visible through the other, the real mechanism behind aliasing.
