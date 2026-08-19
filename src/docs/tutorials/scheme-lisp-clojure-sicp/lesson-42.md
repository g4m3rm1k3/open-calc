# Lesson 42: Clojure State — Atoms, `swap!`, and `reset!`

**What you will build**
The reader will learn Clojure's atom — the primary mechanism for controlled, safe mutation. They will implement a counter, a simple cache, and a state machine using atoms. The transferable problems: (1) an atom wraps a single value and provides atomic (thread-safe) compare-and-swap updates — this is Clojure's answer to the question "when you genuinely need mutation, how do you do it safely?"; (2) `swap!` applies a pure function to the current value — it never directly assigns; the function may be called more than once if there is contention; (3) atoms separate the IDENTITY (the atom reference, stable over time) from the VALUE (the current state, which changes) — this is Hickey's solution to the problem SICP identified in Chapter 3.

**What you need to know first**
- Lessons 0–41 (all prior concepts through Clojure functions, closures, persistent maps, destructuring, Scheme's set! from Lesson 20, SICP's discussion of assignment from Lesson 34).

**Terms used in this lesson**
- **Atom** — Clojure's primary mechanism for managing shared, synchronous, independent state. It solves the problem of needing controlled mutation in an otherwise immutable language by providing thread-safe compare-and-swap updates.
- **State** — The value of an identity at a particular moment in time. It exists to represent information that changes over the course of a program's execution.
- **Identity** — A stable, named entity that refers to a succession of values over time. It solves the problem of needing a consistent way to refer to something that changes, without conflating the reference with the current value.
- **Value** — An immutable snapshot (e.g., the number 3, the map `{:a 1}`, the vector `[1 2 3]`). It exists to represent data that can never change, making it safe to share across threads and functions without coordination.
- **Destructuring** — A feature allowing you to bind names to values within a collection by mirroring the collection's structure. It solves the problem of verbose nested element access.
- **Closure** — A function that captures the lexical environment (the variables) in which it was defined. It solves the problem of maintaining private state or configuration for a function without using global variables.
- **Persistent Map** — An immutable key-value data structure that shares structure with its previous versions upon "modification." It solves the problem of safe, efficient functional updates to associative data.
- **Variadic Arguments (`&`)** — A syntax that allows a function to accept an arbitrary number of arguments, bundling them into a sequence. It solves the problem of writing flexible functions without requiring the caller to manually wrap arguments in a collection.

**Objects and methods used**

**`atom`**
- *What it is:* A core Clojure function that creates a new atom.
- *Implementation:* `(atom initial-state)`
- *Its use:* To create a stable reference wrapping an initial immutable value, providing a safe way to manage state changes over time.
- *Type:* A Clojure core function.
- *Responsibility:* Instantiates an atom container holding the provided initial state.
- *Depends on:* An initial immutable value.
- *Connects to:* Called by application code; returns an `clojure.lang.Atom` instance.
- *Shape:* A fundamental state-creation boundary in Clojure.

**`deref` (and `@`)**
- *What it is:* A core function and reader macro used to obtain the current state of an atom (or other reference type).
- *Implementation:* `(deref reference)` or `@reference`
- *Its use:* To read the current immutable value wrapped by an atom without changing it.
- *Type:* A core Clojure function and reader macro.
- *Responsibility:* Returns the current state of a reference type at the exact moment it is called.
- *Depends on:* An atom or other dereferenceable object.
- *Connects to:* Called by application code; extracts data from an atom container.
- *Shape:* A read boundary from the state container to the application.

**`reset!`**
- *What it is:* A core function to set the value of an atom to a specific new value, disregarding the current value.
- *Implementation:* `(reset! atom newval)`
- *Its use:* To explicitly overwrite the state of an atom, typically used during initialization or hard resets.
- *Type:* A core Clojure function.
- *Responsibility:* Replaces the current state of an atom with a newly provided state, synchronously and safely.
- *Depends on:* The atom to mutate, and the new value to set.
- *Connects to:* Called by application code; mutates the atom's internal reference.
- *Shape:* A direct mutation boundary.

**`swap!`**
- *What it is:* A core function to atomically update the value of an atom by applying a function to its current value.
- *Implementation:* `(swap! atom f & args)`
- *Its use:* To safely compute a new state based on the current state, even in the presence of concurrent updates.
- *Type:* A core Clojure function.
- *Responsibility:* Applies a pure function `f` to the atom's current value (plus any `args`), and uses compare-and-swap to set the new value. It retries automatically if another thread modified the atom in the meantime.
- *Depends on:* The atom, a pure function `f`, and any additional arguments for `f`.
- *Connects to:* Called by application code; invokes `f` and mutates the atom.
- *Shape:* An atomic state-transition boundary.

**`if-let`**
- *What it is:* A core macro that combines `if` with a `let` binding.
- *Implementation:* `(if-let [binding test-expr] then-expr else-expr)`
- *Its use:* To concisely check if a cached value exists and bind it to a variable if it does.
- *Type:* A Clojure macro.
- *Responsibility:* Evaluates `test-expr`; if truthy, evaluates `then-expr` with `binding` bound to the result; else evaluates `else-expr`.
- *Depends on:* A binding vector, a then-expression, and an optional else-expression.
- *Connects to:* Expanded by the compiler into a `let` and `if` block.
- *Shape:* A control-flow boundary.

**Everything else in the file, not this lesson's subject but still explained**

**`inc`**
- *What it is:* A core function that returns a number one greater than its argument.
- *Implementation:* `(inc x)`
- *Its use:* Used with `swap!` to demonstrate incrementing a counter.
- *Type:* A core Clojure math function.
- *Responsibility:* Calculates and returns `x + 1`.
- *Depends on:* A numeric argument `x`.
- *Connects to:* Called by `swap!` or application code.
- *Shape:* A pure arithmetic computation.

**`dec`**
- *What it is:* A core function that returns a number one less than its argument.
- *Implementation:* `(dec x)`
- *Its use:* Used with `swap!` to demonstrate decrementing a counter.
- *Type:* A core Clojure math function.
- *Responsibility:* Calculates and returns `x - 1`.
- *Depends on:* A numeric argument `x`.
- *Connects to:* Called by `swap!` or application code.
- *Shape:* A pure arithmetic computation.

**`assoc`**
- *What it is:* A core function that returns a new map (or vector) with a new key/value pair added or updated.
- *Implementation:* `(assoc map key val)`
- *Its use:* Used with `swap!` to add computed results to the memoization cache.
- *Type:* A core Clojure collection function.
- *Responsibility:* Computes a new persistent collection containing the newly associated key and value.
- *Depends on:* A collection, a key, and a value.
- *Connects to:* Called by `swap!` or application code; builds a new map.
- *Shape:* A pure data-transformation boundary.

**`get`**
- *What it is:* A core function that returns the value mapped to a key in a map.
- *Implementation:* `(get map key)`
- *Its use:* To retrieve a cached value from the memoization map.
- *Type:* A core Clojure collection function.
- *Responsibility:* Looks up a key in a data structure and returns its associated value, or `nil` if not found.
- *Depends on:* A map and a key.
- *Connects to:* Called by application code; reads from a map.
- *Shape:* A pure data-access boundary.

**`apply`**
- *What it is:* A core function that calls another function with arguments provided as a sequence.
- *Implementation:* `(apply f args)`
- *Its use:* To call the original function with the variadic arguments collected in the memoized function.
- *Type:* A core Clojure function.
- *Responsibility:* "Unpacks" a sequence of arguments and passes them to a function.
- *Depends on:* A function `f` and a sequence of arguments.
- *Connects to:* Called by application code; invokes `f`.
- *Shape:* A higher-order function boundary.

**`set!`**
- *What it is:* A Scheme special form for assignment.
- *Implementation:* `(set! variable value)`
- *Its use:* Discussed conceptually to contrast Scheme's unconstrained assignment with Clojure's controlled `atom` updates.
- *Type:* A Scheme special form.
- *Responsibility:* Modifies the binding of an existing variable to point to a new value.
- *Depends on:* An existing variable and a new value.
- *Connects to:* Modifies the current environment.
- *Shape:* An unrestricted mutation boundary.

---

## Concept Unit: The Problem `atom` Solves — Controlled Mutation

### The Problem
In Scheme, as we saw in Lesson 34 with SICP's discussion of assignment, `set!` mutates any binding directly. It replaces the value entirely. In Clojure, almost nothing is mutable by default. Variables are immutable, collections are persistent, and `set!` only works on mutable Java fields. When you genuinely need mutable state—such as a counter, a cache, or application state that updates over time—Clojure provides a controlled abstraction for it instead of unconstrained assignment.

### Introduce the concept in isolation
Let's see the core difference conceptually before writing real code. In Scheme, you mutate by pointing a name at a new thing: `(set! counter (+ counter 1))`. This directly replaces the value in the binding. If two threads do this simultaneously, one update might be lost.

In Clojure, we use an **Atom**. An atom provides controlled mutation: `swap!` applies a *function* to the current value to get the next value, rather than assigning it directly. If two threads call `swap!` simultaneously, both functions run, but the result is always consistent because the system coordinates the update atomically. 

### Discard the throwaway example
The conceptual distinction between `set!` and an atom is fundamental; we will discard the hypothetical Scheme code and move strictly to real Clojure tools.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating core state management techniques in Clojure.
- **Files affected:** `src/core/state.clj` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```clojure
(def state-explanation "In Clojure, almost nothing is mutable. When you need state, you use an atom.")
```

### The Updated Project
```clojure
// ← new
(def state-explanation "In Clojure, almost nothing is mutable. When you need state, you use an atom.")
```
The project now establishes the fundamental constraint: mutation requires a dedicated tool, not just assignment.

### Mechanical walkthrough
- **`def`** creates a global, immutable binding for the name `state-explanation`.
- **`"In Clojure..."`** is a literal string value that will never change.

---

## Concept Unit: Creating and reading atoms

### The Problem
We need to create a mutable reference to hold a value that changes, and we need to be able to read its current state without accidentally modifying it.

### Introduce the concept in isolation
Let's create an atom and read it.
```clojure
(def isolated-counter (atom 0))
@isolated-counter
```
*Output:*
```
0
```
This proves that `@` retrieves the value inside the atom without changing it.

### Discard the throwaway example
We will delete `isolated-counter` and create a real counter for the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/core/state.clj` (modified)
- **Change type:** add
- **Location:** Below the `state-explanation`.
- **Dependencies:** None.

### The New Code
```clojure
(def counter (atom 0))

(deref counter)
@counter
```

### The Updated Project
```clojure
(def state-explanation "In Clojure, almost nothing is mutable. When you need state, you use an atom.")

// ← new
(def counter (atom 0))

(deref counter)
@counter
```
We now have an actual atom in our project and two ways to read its value.

### Mechanical walkthrough
- **`def`** creates an immutable global binding named `counter`. The binding itself will always point to the exact same atom reference; the atom reference will never be swapped for another atom.
- **`atom`** is a core Clojure function that creates an atom container.
- **`0`** is the initial immutable value placed inside the atom container.
- **`deref`** is a core function that returns the current state of a reference type at the exact moment it is called.
- **`counter`** is passed to `deref`, which looks inside the atom and returns `0`.
- **`@`** is a reader macro that the compiler expands exactly into `(deref ...)`. It is the idiomatic shorthand for reading an atom.
- **`counter`** follows the `@`, expanding to `(deref counter)`.

---

## Concept Unit: `reset!` and `swap!`

### The Problem
We have an atom, but we need to change the value it holds. We need both a way to blindly overwrite the value, and a way to safely update the value based on what it currently is.

### Introduce the concept in isolation
Let's use a throwaway atom to see both mutation forms.
```clojure
(def temp-atom (atom 100))
(reset! temp-atom 200)
(swap! temp-atom + 50)
```
*Output:*
```
250
```
This proves that `reset!` overwrote `100` with `200`, and then `swap!` applied `+ 50` to the current value of `200` to yield `250`.

### Discard the throwaway example
We delete `temp-atom` and apply these functions to our real project counter.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/core/state.clj` (modified)
- **Change type:** add
- **Location:** Below the `counter` definition.
- **Dependencies:** None.

### The New Code
```clojure
(reset! counter 10)
(swap! counter inc)
(swap! counter + 5)
(swap! counter * 2)
```

### The Updated Project
```clojure
(def counter (atom 0))

(deref counter)
@counter

// ← new
(reset! counter 10)
(swap! counter inc)
(swap! counter + 5)
(swap! counter * 2)
```
Our project now actively mutates the counter using both absolute and relative changes.

### Mechanical walkthrough
- **`reset!`** is a core function that explicitly overwrites the state of an atom, disregarding its current value.
- **`counter`** is the atom being mutated.
- **`10`** is the new value provided. The atom now contains `10`.
- **`swap!`** is a core function that atomically updates the value of an atom by applying a function to its current value.
- **`counter`** is passed to `swap!`.
- **`inc`** is a core Clojure math function that returns a number one greater than its argument. `swap!` calls `(inc 10)`, which returns `11`. The atom now contains `11`.
- **`swap!`** is called again on `counter`.
- **`+`** is the core addition function. `swap!` applies it to the current value `11` and the provided argument `5`, computing `(+ 11 5)`. The result is `16`. The atom now contains `16`.
- **`swap!`** is called a third time on `counter`.
- **`*`** is the core multiplication function. `swap!` computes `(* 16 2)`. The atom now contains `32`.

**Execution trace for the `swap!` sequence:**
```
Initial state: value = 0
Step 1 (reset!): value is overwritten with 10
Step 2 (swap! inc): f=inc, args=[], (inc 10) → 11. value = 11
Step 3 (swap! + 5): f=+, args=[5], (+ 11 5) → 16. value = 16
Step 4 (swap! * 2): f=*, args=[2], (* 16 2) → 32. value = 32
```

---

## Concept Unit: A counter object using an atom

### The Problem
In Lesson 34 (SICP's bank account), we built an object by returning a function that mutated private variables using `set!`. Clojure does not have `set!` for normal variables, nor does it have traditional OOP objects. We need to build an encapsulated counter that maintains its own private state safely.

### Introduce the concept in isolation
Let's build a throwaway map of functions closing over a local atom.
```clojure
(let [n (atom 0)]
  (def isolated-inc #(swap! n inc))
  (def isolated-val #(deref n)))
(isolated-inc)
(isolated-val)
```
*Output:*
```
1
```
This proves that closures in Clojure capture local atoms just as they capture any variable, and the atom provides safe internal mutation without exposing the atom itself.

### Discard the throwaway example
We delete `isolated-inc` and `isolated-val` and build the real counter object.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/core/state.clj` (modified)
- **Change type:** add
- **Location:** Below the previous global counter code.
- **Dependencies:** None.

### The New Code
```clojure
(defn make-counter []
  (let [n (atom 0)]
    {:increment! #(swap! n inc)
     :decrement! #(swap! n dec)
     :reset!     #(reset! n 0)
     :value      #(deref n)}))
```

### The Updated Project
```clojure
(reset! counter 10)
(swap! counter inc)
(swap! counter + 5)
(swap! counter * 2)

// ← new
(defn make-counter []
  (let [n (atom 0)]
    {:increment! #(swap! n inc)
     :decrement! #(swap! n dec)
     :reset!     #(reset! n 0)
     :value      #(deref n)}))

(def c (make-counter))
((:increment! c))
((:increment! c))
((:increment! c))
((:value c))
((:decrement! c))
((:value c))
((:reset! c))
((:value c))
```
We now have an encapsulated counter "object." The map of functions is Clojure's idiomatic alternative to OOP objects. Each function in the map closes over the same atom `n`.

### Mechanical walkthrough
- **`defn`** defines a new global function `make-counter`.
- **`let`** creates a new lexical scope.
- **`n`** is a local binding inside the `let`.
- **`atom`** is a core Clojure function that creates an atom container.
- **`0`** is the initial value placed inside `n`.
- **`{...}`** creates a literal persistent map containing four keys (`:increment!`, `:decrement!`, `:reset!`, `:value`).
- **`#(...)`** is reader macro syntax for a short, anonymous function. These functions are **closures**: they capture the lexical environment in which they were defined, specifically the local binding `n`.
- **`swap!`** is a core function that atomically updates the value of the atom `n`.
- **`inc`** is a core Clojure math function that returns a number one greater than its argument. `#(swap! n inc)` applies this to `n`.
- **`dec`** is a core Clojure math function that returns a number one less than its argument. `#(swap! n dec)` applies this to `n`.
- **`reset!`** is a core function to explicitly overwrite the state of `n` to `0`.
- **`deref`** is a core function that returns the current state of `n`.
- **`def`** creates a global binding `c` pointing to the map returned by `make-counter`.
- **`(:increment! c)`** looks up the increment function in the map `c` and returns it. The outer parentheses `( ... )` call that returned function.

**Execution trace for `c`:**
```
Step 1: (def c (make-counter)) → A new atom n=0 is created. Map is returned.
Step 2: ((:increment! c)) → calls #(swap! n inc), n=1
Step 3: ((:increment! c)) → calls #(swap! n inc), n=2
Step 4: ((:increment! c)) → calls #(swap! n inc), n=3
Step 5: ((:value c)) → calls #(deref n), returns 3
Step 6: ((:decrement! c)) → calls #(swap! n dec), n=2
Step 7: ((:value c)) → calls #(deref n), returns 2
Step 8: ((:reset! c)) → calls #(reset! n 0), n=0
Step 9: ((:value c)) → calls #(deref n), returns 0
```

---

## Concept Unit: A simple memoization cache using an atom

### The Problem
Some pure functions are extremely slow to compute (like naive Fibonacci). Because they are pure, calling them with the same arguments always yields the same result. We want to wrap a function so that it remembers past results and returns them immediately, storing them in a mutable cache.

### Introduce the concept in isolation
Let's see `if-let` and variadic arguments `&` in a tiny, isolated example.
```clojure
(defn var-args-fn [& args]
  (if-let [first-arg (first args)]
    (str "Got: " first-arg)
    "Got nothing"))

(var-args-fn 1 2)
```
*Output:*
```
"Got: 1"
```
This proves that `& args` bundles arguments into a sequence, and `if-let` concisely checks if a value is truthy, binding it to a name if it is.

### Discard the throwaway example
We delete `var-args-fn` and build our real memoizer.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/core/state.clj` (modified)
- **Change type:** add
- **Location:** Below the counter code.
- **Dependencies:** None.

### The New Code
```clojure
(defn memoize-fn [f]
  (let [cache (atom {})]
    (fn [& args]
      (if-let [cached (get @cache args)]
        cached
        (let [result (apply f args)]
          (swap! cache assoc args result)
          result)))))
```

### The Updated Project
```clojure
(def c (make-counter))
((:value c))

// ← new
(defn memoize-fn [f]
  (let [cache (atom {})]
    (fn [& args]
      (if-let [cached (get @cache args)]
        cached
        (let [result (apply f args)]
          (swap! cache assoc args result)
          result)))))

(def memo-fib
  (memoize-fn
    (fn fib [n]
      (if (< n 2)
          n
          (+ (memo-fib (- n 1)) (memo-fib (- n 2)))))))

(memo-fib 30)
(memo-fib 40)
```
We now have a higher-order function that caches results in a private atom, wrapped around a naive recursive Fibonacci calculation.

### Mechanical walkthrough
- **`defn`** defines a new global function `memoize-fn`.
- **`f`** is the function passed in to be memoized.
- **`let`** creates a new lexical scope.
- **`cache`** is a local binding.
- **`atom`** creates an atom container.
- **`{}`** is an empty persistent map, the initial immutable value placed inside the `cache` atom.
- **`fn`** defines an anonymous closure that captures `cache` and `f`.
- **`&`** is syntax for variadic arguments, allowing a function to accept an arbitrary number of arguments, bundling them into a sequence.
- **`args`** is the sequence containing all arguments passed to the returned function.
- **`if-let`** is a core macro that evaluates a test expression; if truthy, it evaluates its "then" branch with a new binding; otherwise, its "else" branch.
- **`cached`** is the binding name used if the lookup succeeds.
- **`get`** is a core function that looks up a key in a map.
- **`@`** is the reader macro for `deref`, reading the current state of the `cache` atom (which is a map).
- **`args`** is the sequence of arguments, which we use directly as the key in the map.
- If `cached` is found, the `if-let` returns it directly.
- **`let`** creates a new scope for the "else" branch (cache miss).
- **`result`** is the binding name for the newly computed value.
- **`apply`** is a core function that unpacks a sequence of arguments and passes them to a function.
- **`f`** is the original function being called with `args`.
- **`swap!`** is the core function that atomically updates the value of an atom.
- **`cache`** is passed to `swap!`.
- **`assoc`** is a core collection function that returns a new map with a new key/value pair added. `swap!` applies it to the current map in `cache`, passing `args` as the key and `result` as the value.
- **`result`** is returned to the caller.

**Execution trace for `(memo-fib 3)`:**
```
Call: (memo-fib 3)
Step 1: args=(3). @cache is {}. (get {} (3)) is nil. Cache miss.
Step 2: (apply fib (3)) evaluates (+ (memo-fib 2) (memo-fib 1))
Step 3: Call (memo-fib 2). args=(2). @cache is {}. Miss.
Step 4: (apply fib (2)) evaluates (+ (memo-fib 1) (memo-fib 0))
Step 5: Call (memo-fib 1). args=(1). @cache is {}. Miss. Returns 1. swap! updates cache: {(1) 1}
Step 6: Call (memo-fib 0). args=(0). @cache is {(1) 1}. Miss. Returns 0. swap! updates cache: {(1) 1, (0) 0}
Step 7: (+ 1 0) returns 1. swap! updates cache for (2): {(1) 1, (0) 0, (2) 1}
Step 8: We need the right side of (+ (memo-fib 2) (memo-fib 1)). Call (memo-fib 1).
Step 9: args=(1). @cache is {(1) 1, (0) 0, (2) 1}. (get cache (1)) returns 1. Cache HIT! No swap!.
Step 10: (+ 1 1) returns 2. swap! updates cache for (3): {(1) 1, (0) 0, (2) 1, (3) 2}. Returns 2.
```

---

## Concept Unit: The Identity/Value distinction — Hickey's model

### The Problem
We need to formalize the vocabulary for what we just built. In Scheme, `set!` replaces the value in a binding, leaving no philosophical distinction between "the variable" and "what it holds right now." Rich Hickey designed Clojure specifically to fix the problems this causes in concurrent systems.

### Introduce the concept in isolation
There is no code for a purely philosophical definition, but we can look at a throwaway assertion to prove it.
```clojure
(def temp (atom [1 2 3]))
(def old-val @temp)
(swap! temp conj 4)
(println old-val)
```
*Output:*
```
[1 2 3]
```
This proves that the previous value still exists, completely intact, even after the atom has been updated. The "mutation" advanced the atom, but did not destroy the old data.

### Discard the throwaway example
We discard `temp` and `old-val` and add documentation to the project explaining this architecture.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/core/state.clj` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(def hickey-model
  "An Atom is an IDENTITY. @atom is its STATE (a VALUE). swap! advances the identity to a new state.")
```

### The Updated Project
```clojure
(memo-fib 30)
(memo-fib 40)

// ← new
(def hickey-model
  "An Atom is an IDENTITY. @atom is its STATE (a VALUE). swap! advances the identity to a new state.")
```

### Mechanical walkthrough
- **`def`** creates an immutable global binding.
- **`hickey-model`** is the name of the string explaining the theory.
- Rich Hickey's 2009 talk "Are We There Yet?" articulates: identity and value are different things.
- **Value**: An immutable snapshot (e.g., the number 3, the map `{:a 1}`, the vector `[1 2 3]`). It exists to represent data that can never change, making it safe to share across threads and functions without coordination.
- **Identity**: A stable, named entity that refers to a succession of values over time. It solves the problem of needing a consistent way to refer to something that changes, without conflating the reference with the current value.
- **State**: The value of an identity at a particular moment in time.
- An atom *is* an identity.
- `@atom` gives you its current state (a value).
- `swap!` advances the identity to a new state. The previous state is not destroyed — it is simply no longer the current state, as proven by the isolation lab above.
- Contrast with Scheme's `set!`: there is no distinction — mutation replaces the value in the binding. Clojure makes the distinction explicit in the type system.

Atoms are Clojure's primary tool for local, uncoordinated mutable state. For coordinated state changes across multiple atoms simultaneously, Clojure provides refs and software transactional memory (STM) — beyond the scope of this series but worth knowing exists. Exercises including writing a `memoize` version that also tracks cache hit/miss rates, and implementing a simple event log (append-only list of events) using an atom.
