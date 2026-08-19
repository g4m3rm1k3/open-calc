# Lesson 40: Clojure Functions, Closures, and the Seq Abstraction

**What you will build:**
In this lesson, you will write Clojure functions, closures, and anonymous functions, and learn the seq abstraction — Clojure's unified interface for all sequential data. You will use `map`, `filter`, `reduce`, and the threading macros `->` and `->>`. The transferable problems this lesson solves are three-fold: (1) Clojure's `fn` and `#(...)` are the same as Scheme's `lambda` with different syntax; (2) the seq abstraction means `map`, `filter`, and `reduce` work identically on lists, vectors, maps, and sets — the collection type doesn't matter; (3) the `->` and `->>` threading macros make data pipelines readable left-to-right, fixing the nesting problem of Scheme.

**What you need to know first:**
- Lessons 0–39 (all prior concepts through Scheme/Racket fluency, Clojure installation, `def`/`defn`, and Clojure literals).

**Terms used in this lesson:**
- **Anonymous function** — A function defined without a name, typically used for short, one-off operations passed directly to higher-order functions like `map` or `filter`.
- **Closure** — A function that "closes over" and remembers the variables from the lexical scope in which it was created, allowing it to access those variables even when called elsewhere.
- **Seq abstraction** — Clojure's core interface for sequential data, allowing any collection (lists, vectors, maps, sets) to be traversed as if it were a lazy list using a common set of operations.
- **Lazy sequence** — A sequence whose elements are not computed immediately, but only when they are requested (realized). This allows for infinite sequences and avoids unnecessary work.
- **Reader macro** — Syntactic sugar (`#(...)`) that is transformed by the Clojure reader into standard forms (`(fn ...)`) before the code is even evaluated.
- **Threading macro** — A syntactic construct (`->` or `->>`) that rewrites deeply nested function calls into a flat, readable left-to-right pipeline.
- **Function application** — The process of unpacking a collection of values and passing them as individual positional arguments to a function.

**Objects and methods used:**

- **`fn`**
  - *What it is:* Clojure's core special form for creating functions (the equivalent of Scheme's `lambda`).
  - *Implementation:* `(fn [args] body)`
  - *Its use:* To define an anonymous function inline.
  - *Type:* Special form.
  - *Responsibility:* Constructs a new function object, optionally closing over lexical variables.
  - *Depends on:* An argument vector and a body expression.
  - *Connects to:* Passed as an argument to higher-order functions or bound to a name with `def`.
  - *Shape:* A core language construct evaluated at runtime.

- **`#(...)`**
  - *What it is:* Shorthand syntax for defining simple anonymous functions.
  - *Implementation:* `#(...)` with `%`, `%1`, `%2` as arguments.
  - *Its use:* To write extremely concise one-liner functions.
  - *Type:* Reader macro.
  - *Responsibility:* Expands into a `fn` form during the reading phase.
  - *Depends on:* Valid Clojure code inside the parentheses and `%` positional placeholders.
  - *Connects to:* The Clojure reader transforms it before evaluation.
  - *Shape:* Syntactic sugar over `fn`.

- **`def`**
  - *What it is:* A special form that creates a global binding.
  - *Implementation:* `(def symbol value)`
  - *Its use:* To bind a created function (or value) to a permanent name in the current namespace.
  - *Type:* Special form.
  - *Responsibility:* Inters a Var in the current namespace.
  - *Depends on:* A name symbol and an initial value expression.
  - *Connects to:* Modifies the namespace; callers then access the value by name.
  - *Shape:* Global state definition.

- **`defn`**
  - *What it is:* A macro that combines `def` and `fn`.
  - *Implementation:* `(defn name [args] body)`
  - *Its use:* The standard way to define named functions.
  - *Type:* Macro.
  - *Responsibility:* Defines a named function in the current namespace.
  - *Depends on:* A name, an argument vector, and a body.
  - *Connects to:* Expands to a `def` of a `fn`.
  - *Shape:* Standard function definition boundary.

- **`seq`**
  - *What it is:* A core function that returns a sequence view of a collection.
  - *Implementation:* `(seq coll)`
  - *Its use:* To explicitly convert a collection into a sequence, returning `nil` if it's empty.
  - *Type:* Function.
  - *Responsibility:* Adapts any Clojure collection to the `ISeq` interface.
  - *Depends on:* A collection (vector, map, list, set).
  - *Connects to:* Used internally by `first`, `rest`, and sequence operations.
  - *Shape:* An adapter function.

- **`first`**
  - *What it is:* A sequence operation that retrieves the first element.
  - *Implementation:* `(first coll)`
  - *Its use:* Equivalent to Scheme's `car`, getting the head of a sequence.
  - *Type:* Function.
  - *Responsibility:* Returns the first item of a collection, or `nil` if empty.
  - *Depends on:* A collection that can be seq'd.
  - *Connects to:* Often used with `rest` to recursively process a sequence.
  - *Shape:* Sequence read operation.

- **`rest`**
  - *What it is:* A sequence operation that retrieves everything after the first element.
  - *Implementation:* `(rest coll)`
  - *Its use:* Equivalent to Scheme's `cdr`, getting the tail of a sequence.
  - *Type:* Function.
  - *Responsibility:* Returns a sequence of all items except the first.
  - *Depends on:* A collection that can be seq'd.
  - *Connects to:* Often used with `first` in recursion.
  - *Shape:* Sequence traversal operation.

- **`map`**
  - *What it is:* A higher-order function that applies a function to every item in a collection.
  - *Implementation:* `(map f coll)`
  - *Its use:* To transform a collection element by element.
  - *Type:* Function.
  - *Responsibility:* Produces a new lazy sequence where each element is the result of applying `f` to the original element.
  - *Depends on:* A transforming function and one or more collections.
  - *Connects to:* Consumes a seq and returns a lazy seq.
  - *Shape:* Data transformation step.

- **`filter`**
  - *What it is:* A higher-order function that keeps only items matching a predicate.
  - *Implementation:* `(filter pred coll)`
  - *Its use:* To remove unwanted elements from a sequence.
  - *Type:* Function.
  - *Responsibility:* Produces a lazy sequence of items for which the predicate returns true.
  - *Depends on:* A predicate function and a collection.
  - *Connects to:* Consumes a seq and returns a filtered lazy seq.
  - *Shape:* Data filtering step.

- **`reduce`**
  - *What it is:* A higher-order function that accumulates a collection into a single value.
  - *Implementation:* `(reduce f [val] coll)`
  - *Its use:* To sum numbers, build a new map, or fold a sequence.
  - *Type:* Function.
  - *Responsibility:* Iteratively applies a function to an accumulator and each element, returning the final accumulator.
  - *Depends on:* A reducing function, an optional initial value, and a collection.
  - *Connects to:* Consumes a seq and produces a single output value (or new collection).
  - *Shape:* Data aggregation step.

- **`->`**
  - *What it is:* A threading macro for deeply nested calls.
  - *Implementation:* `(-> x (f a) (g b))`
  - *Its use:* To write object-oriented or sequential operations sequentially.
  - *Type:* Macro.
  - *Responsibility:* Inserts each previous form as the *first* argument of the next form.
  - *Depends on:* An initial value and a series of function calls.
  - *Connects to:* Rewrites the syntax tree at compile time.
  - *Shape:* Syntactic pipeline organizer.

- **`->>`**
  - *What it is:* A threading macro for sequences.
  - *Implementation:* `(->> x (f a) (g b))`
  - *Its use:* To write sequence pipelines (`map`, `filter`, `reduce`) sequentially.
  - *Type:* Macro.
  - *Responsibility:* Inserts each previous form as the *last* argument of the next form.
  - *Depends on:* An initial collection and sequence operations.
  - *Connects to:* Rewrites the syntax tree at compile time.
  - *Shape:* Sequence pipeline organizer.

- **`apply`**
  - *What it is:* A function that calls another function with elements of a sequence as its arguments.
  - *Implementation:* `(apply f coll)`
  - *Its use:* To spread a sequence into separate function arguments.
  - *Type:* Function.
  - *Responsibility:* Unpacks a sequence to supply positional arguments to `f`.
  - *Depends on:* A function and a sequence of arguments.
  - *Connects to:* Bridges the gap between collections and rest-arg functions like `+` or `str`.
  - *Shape:* Function invocation bridge.

---

## Concept Unit: `fn` and `#(...)` — Anonymous Functions

### The Problem
In functional programming, we often need to write a quick, one-off function to pass to another function (like a squaring function). Defining it globally with a name just to use it once pollutes the namespace. We need a way to create an anonymous function inline, identical to Scheme's `lambda`.

### Introduce the concept in isolation
We will use Clojure's `fn` to create an anonymous squaring function and call it immediately, then show its shorter syntax, the reader macro `#(...)`.

```clojure
; fn is Clojure's lambda:
(fn [x] (* x x))         ; anonymous squaring function
((fn [x] (* x x)) 5)     ; => 25

; Shorthand: #(...) with % for the argument:
#(* % %)                  ; same as (fn [x] (* x x))
(#(* % %) 5)             ; => 25

; Multiple args: %1, %2, etc.
#(+ %1 %2)               ; (fn [a b] (+ a b))
(#(+ %1 %2) 3 4)         ; => 7
```

This is called an **anonymous function**. The output `25` proves that `(fn [x] (* x x))` constructs a callable function object that evaluates exactly like a named function when passed `5`. The output `25` from `(#(* % %) 5)` proves that the reader macro `#(...)` behaves identically to `fn`, substituting `%` for the single argument.

### Discard the throwaway example
The throwaway REPL code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating core language concepts directly in a new file.
- **Files affected:** Created `src/math.clj`.
- **Change type:** Add.
- **Location:** Top of file.
- **Dependencies:** Clojure runtime.

### The New Code
```clojure
(def square (fn [x] (* x x)))
```

### The Updated Project
```clojure
(ns math)

// ← new
(def square (fn [x] (* x x)))

(println (square 6))
```
This structure defines a namespace `math` and binds the anonymous `fn` to the global name `square` using `def`, making it a callable named function.

### Mechanical walkthrough

- **`def`** is a special form that binds a value to a symbol in the global namespace.
- **`square`** is the symbol being defined.
- **`fn`** is a special form that creates an anonymous function. It is exactly Scheme's `lambda`.
- **`[x]`** is the argument vector. In Clojure, arguments are bound in square brackets `[]` instead of parentheses.
- **`(* x x)`** is the body of the function.

**Execution trace for `((fn [x] (* x x)) 5)`:**
```
Step 1: Parse `(fn [x] (* x x))` -> returns a function object.
Step 2: Apply the function to argument `5`.
Step 3: Inside the function, bind `x` to `5`.
Step 4: Evaluate body `(* x x)` -> `(* 5 5)` -> returns `25`.
```
The **reader macro** `#(...)` expands automatically at read time:
- `#(* % %)` is read as `(fn [%1] (* %1 %1))`.
- `%` is a positional placeholder for the first argument. If there are multiple arguments, `%1`, `%2`, etc., are used.

---

## Concept Unit: Closures in Clojure

### The Problem
We need a function that generates other functions, remembering the environment it was created in. This requires a function to capture arguments from an outer scope, a capability called a closure.

### Introduce the concept in isolation
We will define a function `make-adder` that takes a number `n` and returns a new function that adds `n` to its input.

```clojure
(defn make-adder [n]
  (fn [x] (+ x n)))

(def add10 (make-adder 10))
(def add100 (make-adder 100))

(add10 5)    ; => 15
(add100 5)   ; => 105
(add10 (add100 3))  ; => 113
```

This is called a **closure**. The output `15` proves that the inner `fn` remembered the value of `n` (which was `10`) long after `make-adder` finished executing.

### Discard the throwaway example
The throwaway example is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `src/math.clj`.
- **Change type:** Add.
- **Location:** Below `square`.
- **Dependencies:** None.

### The New Code
```clojure
(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))
```

### The Updated Project
```clojure
(ns math)

(def square (fn [x] (* x x)))

// ← new
(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))
```
This structure creates a closure that captures a mutable state (`atom`) and increments it every time the returned function is called.

### Mechanical walkthrough

- **`defn`** is a macro that expands to `(def name (fn ...))`.
- **`make-counter`** is the name of our function generator.
- **`start`** is the initial argument passed to the generator.
- **`let`** creates a local binding.
- **`count`** is a local symbol bound to an `atom`, Clojure's mutable reference type.
- **`(fn [])`** creates an anonymous function taking zero arguments. This inner function is the closure.
- **`swap!`** updates the atom's value safely by applying the `inc` function to it.

**Execution trace for `(add10 5)` from the isolated example:**
```
Step 1: `(make-adder 10)` is called. `n` is bound to `10`.
Step 2: `make-adder` returns the closure `(fn [x] (+ x 10))`.
Step 3: `def add10` binds this closure to the name `add10`.
Step 4: `(add10 5)` calls the closure. `x` is bound to `5`.
Step 5: Inside the closure, it evaluates `(+ 5 10)` (using the captured `n`).
Step 6: Returns `15`.
```
A **closure** is a function that "closes over" its lexical environment. Just like Scheme's `make-multiplier` from Lesson 13, the inner function retains a reference to `n` (or `count`) from the outer function's scope, even though the outer function has already returned.

---

## Concept Unit: The Seq Abstraction

### The Problem
In Scheme, a list is processed with `car` and `cdr`. But if you have a vector or a hash map, you need different functions. We want a unified interface so we can process *any* collection the exact same way.

### Introduce the concept in isolation
We will use `seq`, `first`, and `rest` on various data structures: vectors, maps, sets, and lists.

```clojure
; seq converts any collection to a lazy sequence:
(seq [1 2 3])           ; => (1 2 3)  [vector -> seq]
(seq {:a 1 :b 2})       ; => ([:a 1] [:b 2])  [map -> seq of pairs]
(seq #{1 2 3})          ; => (1 3 2)  [set -> seq, unordered]
(seq '(1 2 3))          ; => (1 2 3)  [list -> seq]

; first and rest work on any seq:
(first [1 2 3])         ; => 1
(rest [1 2 3])          ; => (2 3)
(first {:a 1 :b 2})     ; => [:a 1]
```

This is called the **seq abstraction**. The output `(1 2 3)` from calling `seq` on a vector `[1 2 3]` proves that Clojure coerces the vector into a standard sequence interface. Calling `first` on a map `{:a 1 :b 2}` yielding `[:a 1]` proves that maps are treated as sequences of key-value pairs (vectors).

### Discard the throwaway example
The throwaway REPL code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/math.clj`.
- **Change type:** Add.
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```clojure
(defn process-any [coll]
  (if-let [s (seq coll)]
    (println "First is:" (first s) "| Rest is:" (rest s))
    (println "Empty collection")))
```

### The Updated Project
```clojure
(ns math)

(def square (fn [x] (* x x)))

(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))

// ← new
(defn process-any [coll]
  (if-let [s (seq coll)]
    (println "First is:" (first s) "| Rest is:" (rest s))
    (println "Empty collection")))
```
This structure takes *any* collection, attempts to turn it into a sequence, and gracefully handles it whether it is a map, a vector, or a set.

### Mechanical walkthrough

- **`seq`** is a core function that adapts any Clojure collection to the `ISeq` interface. If the collection is empty, `seq` returns `nil`.
- **`if-let`** is a macro that binds a local variable (here `s`) to the result of `(seq coll)`. If the result is "truthy" (not `nil` or `false`), it evaluates the `println` branch; otherwise, it evaluates the "Empty collection" branch.
- **`first`** is a sequence operation that returns the first element of a sequence. It is Clojure's version of Scheme's `car`.
- **`rest`** is a sequence operation that returns a sequence of all elements except the first. It is Clojure's version of Scheme's `cdr`.

Because of the **seq abstraction**, `first` and `rest` do not care what the original data structure was. `seq` provides a unified sequential view over any data.

---

## Concept Unit: `map`, `filter`, `reduce`

### The Problem
We need to transform, filter, and aggregate collections without writing explicit recursion or loops. Since we now have the seq abstraction, we want higher-order functions that operate on *any* collection.

### Introduce the concept in isolation
We will use `map`, `filter`, and `reduce` on collections.

```clojure
; map:
(map #(* % %) [1 2 3 4 5])  ; => (1 4 9 16 25)
(map str [1 2 3])            ; => ("1" "2" "3")

; filter:
(filter even? [1 2 3 4 5 6])  ; => (2 4 6)
(filter #(> % 3) [1 2 3 4 5]) ; => (4 5)

; reduce:
(reduce + [1 2 3 4 5])    ; => 15
(reduce * 1 [1 2 3 4 5])  ; => 120  (with initial value)
(reduce conj [] [1 2 3])  ; => [1 2 3]  (rebuild as vector)
```

These are **sequence operations**. The output `(1 4 9 16 25)` from `map` proves that the anonymous function `#(* % %)` was applied to every element. The output `[1 2 3]` from `(reduce conj [] [1 2 3])` proves that we can build entirely new data structures (a vector) by accumulating values.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/math.clj`.
- **Change type:** Add.
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```clojure
(defn sum-even-squares [numbers]
  (reduce + (filter even? (map #(* % %) numbers))))
```

### The Updated Project
```clojure
(ns math)

(def square (fn [x] (* x x)))

(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))

(defn process-any [coll]
  (if-let [s (seq coll)]
    (println "First is:" (first s) "| Rest is:" (rest s))
    (println "Empty collection")))

// ← new
(defn sum-even-squares [numbers]
  (reduce + (filter even? (map #(* % %) numbers))))
```
This structure takes a collection of `numbers`, squares them all, keeps only the even ones, and sums them up.

### Mechanical walkthrough

- **`map`** is a higher-order function that applies the anonymous squaring function `#(* % %)` to every item in `numbers`. It returns a lazy sequence.
- **`filter`** is a higher-order function that takes the lazy sequence from `map`, applies the predicate `even?`, and yields a new lazy sequence of only the even squares.
- **`reduce`** is a higher-order function that takes the filtered sequence and aggregates it using the `+` function. It effectively executes `(+ 4 (+ 16 ...))`.

**Execution trace for `(map #(* % %) [1 2 3])`:**
```
Step 1: `map` requests the first element from `[1 2 3]`, gets `1`.
Step 2: Applies `#(* % %)` to `1` -> yields `1`.
Step 3: `map` requests the next element, gets `2`.
Step 4: Applies `#(* % %)` to `2` -> yields `4`.
Step 5: `map` requests the next element, gets `3`.
Step 6: Applies `#(* % %)` to `3` -> yields `9`.
Step 7: Returns the lazy sequence `(1 4 9)`.
```

A **lazy sequence** means that `map` and `filter` do not allocate memory for a new vector immediately. They return an object that knows *how* to compute the next element when asked. The sequence is only "realized" (computed) when `reduce` forces it to evaluate elements to calculate the sum.

---

## Concept Unit: The Threading Macros `->` and `->>`

### The Problem
Deeply nested function calls, like `(reduce + (filter even? (map #(* % %) (range 1 11))))`, are unreadable. They must be read right-to-left (inside-out): first `range`, then `map`, then `filter`, then `reduce`. We want a way to express data pipelines top-to-bottom, left-to-right.

### Introduce the concept in isolation
We will use the thread-last macro `->>` and the thread-first macro `->`.

```clojure
; Problem: deeply nested function calls are unreadable:
(reduce + (filter even? (map #(* % %) (range 1 11))))

; With ->> (thread-last: each result becomes LAST arg of next form):
(->> (range 1 11)
     (map #(* % %))
     (filter even?)
     (reduce +))
; => 220  (sum of squares of even numbers 1-10: 4+16+36+64+100=220)

; With -> (thread-first: each result becomes FIRST arg):
(-> {:name "Alice" :age 29}
    (assoc :age 30)
    (assoc :city "Boston")
    (:name))
; => "Alice"
```

These are **threading macros**. The output `220` proves that `->>` correctly passed the result of `(range 1 11)` into `map`, then `filter`, then `reduce`. It behaves exactly like Unix pipes. The output `"Alice"` proves that `->` correctly passed the map as the *first* argument to `assoc` and ultimately to the keyword `:name` (which acts as a function to look itself up).

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/math.clj`.
- **Change type:** Refactor.
- **Location:** Replacing the `sum-even-squares` function.
- **Dependencies:** None.

### The New Code
```clojure
(defn sum-even-squares [numbers]
  (->> numbers
       (map #(* % %))
       (filter even?)
       (reduce +)))
```

### The Updated Project
```clojure
(ns math)

(def square (fn [x] (* x x)))

(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))

(defn process-any [coll]
  (if-let [s (seq coll)]
    (println "First is:" (first s) "| Rest is:" (rest s))
    (println "Empty collection")))

// ← new (refactored)
(defn sum-even-squares [numbers]
  (->> numbers
       (map #(* % %))
       (filter even?)
       (reduce +)))
```
This structure is identically functional to the previous version but drastically improves readability by writing the pipeline sequentially.

### Mechanical walkthrough

- **`->>`** is the thread-last macro. It takes an initial value (`numbers`) and a series of forms. It inserts the initial value as the *last* argument of the first form, then inserts that entire expression as the *last* argument of the next form, and so on.
- **`numbers`** is the initial sequence.
- **`(map #(* % %))`** is rewritten at compile time to `(map #(* % %) numbers)`.
- **`(filter even?)`** is rewritten to receive the `map` result as its last argument.
- **`(reduce +)`** is rewritten to receive the `filter` result as its last argument.

**Execution trace for the `->>` compilation:**
```
Step 1: Start with `->> x (f a) (g b)`.
Step 2: Take `x` and insert as last arg of `(f a)` -> `(f a x)`.
Step 3: Take `(f a x)` and insert as last arg of `(g b)` -> `(g b (f a x))`.
```
A **threading macro** rewrites your code *before* it is evaluated. It doesn't actually execute sequentially; the compiler expands the `->>` block back into the deeply nested `(reduce + (filter even? (map ...)))` form that the runtime expects.

---

## Concept Unit: `apply` in Clojure

### The Problem
Sometimes you have a function that takes individual arguments (like `+` which takes `(+ 1 2 3)`), but your data is already inside a collection (like `[1 2 3]`). You need a way to "unpack" the collection and pass its items as arguments.

### Introduce the concept in isolation
We will use `apply` to pass a vector of arguments to functions.

```clojure
(apply + [1 2 3 4 5])   ; => 15  (same as (+ 1 2 3 4 5))
(apply str ["Hello" ", " "World"])  ; => "Hello, World"
(apply max [3 1 4 1 5 9 2 6])       ; => 9
```

This is called **function application**. The output `15` proves that `apply` took the vector `[1 2 3 4 5]` and unpacked it as individual arguments to `+`, making it evaluate precisely as `(+ 1 2 3 4 5)`.

### Discard the throwaway example
The throwaway code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/math.clj`.
- **Change type:** Add.
- **Location:** Bottom of file.
- **Dependencies:** None.

### The New Code
```clojure
(defn sum-all [nums-vector]
  (apply + nums-vector))
```

### The Updated Project
```clojure
(ns math)

(def square (fn [x] (* x x)))

(defn make-counter [start]
  (let [count (atom start)]
    (fn []
      (swap! count inc))))

(defn process-any [coll]
  (if-let [s (seq coll)]
    (println "First is:" (first s) "| Rest is:" (rest s))
    (println "Empty collection")))

(defn sum-even-squares [numbers]
  (->> numbers
       (map #(* % %))
       (filter even?)
       (reduce +)))

// ← new
(defn sum-all [nums-vector]
  (apply + nums-vector))
```
This structure takes a single argument, which is a collection of numbers, and correctly unpacks it to sum them, bridging the gap between sequences and variable-argument functions.

### Mechanical walkthrough

- **`apply`** is a core function that takes a function and a sequence, and invokes the function using the elements of the sequence as its arguments.
- **`+`** is the function to be called.
- **`nums-vector`** is the collection whose items will become the arguments.

If you just typed `(+ nums-vector)`, the compiler would try to add the vector object itself, crashing. `apply` unpacks the items, essentially acting as the spread operator `...` in JavaScript or `*args` in Python. It is identical to Racket's `apply` from Lesson 31.

---

## Next Steps
Clojure functions, closures, and the seq abstraction give you the same power as Scheme, but with cleaner syntax for collections and pipelines. The threading macros solve one of Scheme's real ergonomic weaknesses — deeply nested calls. For exercises, translate the employee data pipeline from Lesson 31 into Clojure using `->>` and practice using the `make-counter` closure.
