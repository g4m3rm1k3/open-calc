# Lesson 43: Clojure Macros — `defmacro` and Code as Data

What you will build: The reader will write Clojure macros using `defmacro`, understand quoting and unquoting in macro bodies (`quote`, ```, `~`, `~@`), and implement `my-when`, `my-or`, and a `timing` macro that measures how long an expression takes to run. The transferable problems: (1) Clojure macros are the same idea as Scheme `define-syntax` but with a different mechanism — `defmacro` gives you the full power of Clojure to transform code; (2) syntax-quoting (backtick) and unquoting (`~`, `~@`) are the tools for constructing new code from pieces; (3) macros let you write domain-specific languages (DSLs) within Clojure — this is how Clojure's popular libraries (Ring, Compojure, Datomic) express their APIs.

What you need to know first: Lessons 0–42 (all prior concepts through Clojure functions/closures/threading, atoms, Scheme macros from Lesson 21, homoiconicity).

Terms used in this lesson:
- **Macro** — a function that takes code as data and returns new code to be evaluated in its place, allowing for structural code transformations and control flow abstractions.
- **Hygienic macro** — Scheme's macro system (`syntax-rules`) that automatically prevents name capture, enforcing safety.
- **Name capture** — when a macro generates code that accidentally overrides or uses a variable name from the caller's environment, causing unexpected behavior.
- **Syntax-quote (```)** — a variation of quote that allows parts of the quoted list to be evaluated (unquoted) and fully qualifies symbols to prevent accidental naming collisions.
- **Unquote (`~`)** — evaluates an expression inside a syntax-quoted list and inserts its value.
- **Unquote-splicing (`~@`)** — evaluates an expression that returns a list, and splices its elements sequentially into the surrounding syntax-quoted list instead of nesting them.
- **Gensym (`#`)** — a mechanism to generate unique, uncatchable variable names (like `v__1234__auto__`) within a macro to avoid name capture.

Objects and methods used:

- **`defmacro`**
  - *What it is:* A core Clojure form used to define a new macro.
  - *Implementation:* `(defmacro name [params*] body)`
  - *Its use:* To define transformations from raw code lists into evaluated forms.
  - *Type:* Special form.
  - *Responsibility:* Registers a macro that the Clojure compiler will expand before runtime execution.
  - *Depends on:* The structural parameters and the body containing the code transformation logic.
  - *Connects to:* Evaluator and Compiler.
  - *Shape:* A top-level definition declaration.

- **`macroexpand`**
  - *What it is:* A built-in function to debug and inspect macros.
  - *Implementation:* `(macroexpand form)`
  - *Its use:* Shows what code a macro produces without actually evaluating the resulting code.
  - *Type:* Function in `clojure.core`.
  - *Responsibility:* Expands a macro invocation form into its resulting underlying syntax.
  - *Depends on:* An unevaluated form (usually provided as a quoted list).
  - *Connects to:* Macro definitions and the REPL for debugging.
  - *Shape:* A utility function used interactively.

- **`do`**
  - *What it is:* A form that evaluates multiple expressions sequentially and returns the value of the last.
  - *Implementation:* `(do exprs*)`
  - *Its use:* To group multiple expressions where only one is syntactically expected (like inside an `if` branch).
  - *Type:* Special form.
  - *Responsibility:* Guarantees sequential evaluation of side-effecting expressions.
  - *Depends on:* The sequence of expressions it wraps.
  - *Connects to:* The evaluator.
  - *Shape:* Syntax wrapper form.

- **`System/currentTimeMillis`**
  - *What it is:* A Java method used to get the current system time.
  - *Implementation:* `(System/currentTimeMillis)`
  - *Its use:* To measure how long an expression takes to run by comparing before and after timestamps.
  - *Type:* Static method on Java's `System` class.
  - *Responsibility:* Returns the current time in milliseconds since the Unix epoch.
  - *Depends on:* The underlying operating system clock.
  - *Connects to:* Java Interop from Clojure.
  - *Shape:* A standard library static Java call.

- **`reduce`**
  - *What it is:* A function to fold a collection into a single cumulative value.
  - *Implementation:* `(reduce f coll)`
  - *Its use:* Used as a computationally intensive example expression to time.
  - *Type:* Function in `clojure.core`.
  - *Responsibility:* Applies a binary function across a collection iteratively.
  - *Depends on:* A combining function and a sequence.
  - *Connects to:* Clojure's sequence library.
  - *Shape:* Core library function.

- **`range`**
  - *What it is:* A function to generate a sequence of integers.
  - *Implementation:* `(range end)`
  - *Its use:* Generates the sequence of numbers to feed into `reduce`.
  - *Type:* Function in `clojure.core`.
  - *Responsibility:* Yields a lazy sequence of integers up to a bound.
  - *Depends on:* Numeric bounds.
  - *Connects to:* Clojure's sequence library.
  - *Shape:* Core library function.

- **`Thread/sleep`**
  - *What it is:* A Java method to pause thread execution.
  - *Implementation:* `(Thread/sleep ms)`
  - *Its use:* Pauses execution to artificially delay and demonstrate the `timing` macro.
  - *Type:* Static method on Java's `Thread` class.
  - *Responsibility:* Halts the current thread for a specified duration in milliseconds.
  - *Depends on:* The duration in milliseconds.
  - *Connects to:* Java Threading subsystem.
  - *Shape:* A standard library static Java call.

## Concept Unit: Scheme vs. Clojure Macros and `defmacro`

### The Problem
We need to conditionally execute a block of code, but only if a test evaluates to true. If it evaluates to false, we don't want to evaluate the body at all. Scheme uses hygienic macros (`syntax-rules`) that automatically prevent name capture, focusing purely on structural pattern matching. Clojure uses `defmacro` — a function that takes unevaluated code as data and returns transformed code, making it strictly more powerful but requiring manual care to avoid name capture. We want to build our own version of a conditional wrapper called `my-when`.

### Introduce the concept in isolation
We will define `my-when-lab` using `defmacro`. This demonstrates a **macro definition**.

```clojure
(defmacro my-when-lab [test & body]
  `(if ~test
     (do ~@body)
     nil))

(my-when-lab true
  (println "yes")
  42)
```
Output:
```clojure
yes
42
```
This proves that the macro intercepts the code before evaluation, transforms it into an `if` expression, and executes the body sequentially because the test expression is true.

### Discard the throwaway example
The `my-when-lab` is explicitly discarded and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart — this is a from-scratch addition because we are experimenting with language primitives directly.
- Files affected: `src/macros.clj` (created).
- Change type: add.
- Location: Brand new file.
- Dependencies: Clojure REPL.

### The New Code
```clojure
(defmacro my-when [test & body]
  `(if ~test
     (do ~@body)
     nil))
```

### The Updated Project
```clojure
;; src/macros.clj
(ns macros)

// ← new
(defmacro my-when [test & body]
  `(if ~test
     (do ~@body)
     nil))
```
The file now contains our custom `my-when` macro, structurally identical to Clojure's core `when`, enabling conditional block execution.

### Mechanical walkthrough
1. `defmacro` — A special form that defines a macro. Unlike functions, a macro takes its arguments as unevaluated raw syntax (lists and symbols).
2. `my-when` — The name of the macro being bound in the namespace.
3. `[test & body]` — The parameter vector. `test` binds to the first provided form, and `body` binds to all remaining forms packed into a list.
4. `` ` `` — The syntax-quote (backtick) character. It acts like a regular quote by preventing evaluation, but crucially allows internal unquoting and fully qualifies all symbols inside it to prevent accidental capture.
5. `(if ...)` — The raw conditional structure that the macro uses as the foundation for the transformed code.
6. `~test` — The unquote operator. This evaluates `test` at macro-expansion time, inserting the raw structure passed by the caller directly into the condition slot.
7. `(do ...)` — Clojure's block evaluator. It groups multiple expressions, evaluates them in sequence, and returns the result of the last one.
8. `~@body` — The unquote-splicing operator. This evaluates `body` (which is a list of forms), unpacks those forms, and splices them as flat sequential elements inside the `do` block.
9. `nil` — The fallback value returned if the `test` condition evaluates to false.


## Concept Unit: Inspecting Macros with `macroexpand`

### The Problem
When a macro behaves incorrectly, it is extremely difficult to debug because the failure happens in the invisible generated code. We need a diagnostic tool to inspect exactly what structure a macro produces before it gets evaluated.

### Introduce the concept in isolation
We will invoke `macroexpand` to look inside `my-when`. This is called **macro expansion**.

```clojure
(macroexpand '(my-when true (println "yes") 42))
```
Output:
```clojure
(if true (do (println "yes") 42) nil)
```
This proves that `macroexpand` takes a quoted list representing a macro invocation and returns the fully transformed output structure, allowing us to verify the generated code mechanically.

### Discard the throwaway example
The isolated `macroexpand` test is discarded from our persistent scripts.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: REPL only.
- Change type: N/A.
- Location: N/A.
- Dependencies: The `my-when` macro defined in the previous unit.

### The New Code
```clojure
(macroexpand '(my-when false (println "never")))
```

### The Updated Project
(No file change, this is a REPL-only verification step).

### Mechanical walkthrough
1. `macroexpand` — A core function that receives an unevaluated form and processes it through the compiler's macro expansion phase, returning the expanded code without executing it.
2. `'` — The standard literal quote. It is absolutely necessary here to prevent the list from being immediately evaluated as a macro call before `macroexpand` can look at it.
3. `(my-when ...)` — The literal structure we are asking Clojure to expand.
4. `false` — The test expression bound to the `test` parameter in the macro.
5. `(println "never")` — The body expression bound inside the `body` parameter list.


## Concept Unit: Quoting and Unquoting in Detail

### The Problem
Constructing nested Abstract Syntax Trees purely out of raw `(list 'if test (cons 'do body) nil)` is unreadable and error-prone. We need a templating syntax that lets us visually write what the final code should look like, leaving "holes" to inject variable data.

### Introduce the concept in isolation
We will use a let-binding to illustrate unquote-splicing. This is **templating code as data**.

```clojure
(let [forms '(2 3 4)]
  `(+ 1 ~forms))
```
Output:
```clojure
(clojure.core/+ 1 (2 3 4))
```
This proves that standard unquoting (`~`) injects the list directly as a nested structure. If we use unquote-splicing instead:
```clojure
(let [forms '(2 3 4)]
  `(+ 1 ~@forms))
```
Output:
```clojure
(clojure.core/+ 1 2 3 4)
```
This proves that `~@` unpacks the inner sequence and places its elements sequentially alongside the sibling elements in the list.

### Discard the throwaway example
The let-binding examples are discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: REPL only.
- Change type: N/A.
- Location: N/A.
- Dependencies: None.

### The New Code
(No project code changes; quoting mechanics apply universally to our macros.)

### The Updated Project
(No file change).

### Mechanical walkthrough
1. `let` — Binds local values for demonstration.
2. `[forms '(2 3 4)]` — Binds the symbol `forms` literally to the list `(2 3 4)`.
3. `` ` `` — The syntax-quote operator initializing the code template. It resolves the `+` symbol to `clojure.core/+`.
4. `(+ 1 ...)` — The literal structure of the function call we are building.
5. `~forms` — Evaluates to the list `(2 3 4)` and inserts it as a single element.
6. `~@forms` — Evaluates to the list `(2 3 4)`, strips the outer list structure, and inserts `2`, `3`, and `4` individually.


## Concept Unit: Short-Circuiting and Gensym with `my-or`

### The Problem
We need an `or` operation that evaluates arguments sequentially, returning the first truthy value and short-circuiting (ignoring) the rest. A function strictly evaluates all its arguments before running, so it cannot short-circuit. We must use a macro, but if the macro evaluates the target expression multiple times to check it and then return it, it introduces performance bugs or side-effect duplicates. We need guaranteed unique temporary variable names to cache the evaluation.

### Introduce the concept in isolation
We will define `my-or-lab` using a generated symbol. This introduces an **auto-gensym** variable.

```clojure
(defmacro my-or-lab [e1 e2]
  `(let [v# ~e1]
     (if v# v# ~e2)))

(my-or-lab 1 (/ 1 0))
```
Output:
```clojure
1
```
This proves that the first argument is bound to a safely unique name (`v#`), evaluated exactly once, and because it is truthy, the dangerous second argument (`(/ 1 0)`) is ignored, avoiding a divide-by-zero exception.

### Discard the throwaway example
The `my-or-lab` is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/macros.clj`.
- Change type: add.
- Location: End of file.
- Dependencies: None.

### The New Code
```clojure
(defmacro my-or
  ([] nil)
  ([e] e)
  ([e1 & rest]
   `(let [v# ~e1]
      (if v# v# (my-or ~@rest)))))
```

### The Updated Project
```clojure
;; src/macros.clj
(ns macros)

(defmacro my-when [test & body]
  `(if ~test
     (do ~@body)
     nil))

// ← new
(defmacro my-or
  ([] nil)
  ([e] e)
  ([e1 & rest]
   `(let [v# ~e1]
      (if v# v# (my-or ~@rest)))))
```
We now have a recursive macro that handles short-circuiting across any number of arguments, securely caching variables to prevent name collisions.

### Mechanical walkthrough
1. `defmacro my-or` — Defines a macro that leverages multi-arity dispatch to handle different argument counts.
2. `([] nil)` — The base case for zero arguments: returns `nil`.
3. `([e] e)` — The base case for exactly one argument: it evaluates and returns that argument.
4. `([e1 & rest] ...)` — The recursive case: takes the first argument `e1` and groups all remaining arguments into the sequence `rest`.
5. `` `(let ...) `` — Emits a `let` block into the expanded code to declare local bindings.
6. `v#` — The auto-gensym identifier. Appending `#` to a symbol inside a syntax-quote instructs Clojure to generate a randomized, strictly unique name (e.g., `v__1234__auto__`). This guarantees there is no name capture if the macro's caller already has their own variable named `v`.
7. `~e1` — Unquotes the first expression, binding it to the unique `v#` symbol so the work is done exactly once.
8. `(if v# v# ...)` — If `v#` contains a truthy value, it is immediately returned, safely skipping all remaining code.
9. `(my-or ~@rest)` — If `v#` is falsey, the macro recursively expands by calling itself with the remaining arguments. The unquote-splicing `~@rest` unpacks the list so they feed in as distinct arguments to `my-or`.

### Execution trace
Tracing the expansion of `(my-or false nil 42)`:
```
Iteration 1: macroexpand my-or, e1=false, rest=(nil 42). Emits (let [v__1# false] (if v__1# v__1# (my-or nil 42)))
Iteration 2: macroexpand recursive my-or, e1=nil, rest=(42). Emits (let [v__2# nil] (if v__2# v__2# (my-or 42)))
Iteration 3: macroexpand recursive my-or, e=42. Emits 42
```
This shows that the recursive macro systematically drills down until it finds a truthy value or exhausts the list.


## Concept Unit: Creating a Control Flow Abstraction — `timing`

### The Problem
We want a tool to measure how long an arbitrary block of code takes to evaluate. If we implement this as a standard function `(defn timing [expr] ...)`, Clojure will fully evaluate `expr` *before* the function even begins executing, making timing impossible. Delaying evaluation and wrapping execution in timestamps inherently demands a macro.

### Introduce the concept in isolation
We will use Java Interop to check the current system time before and after a delay. This is a **Java Interop** execution.

```clojure
(let [start (System/currentTimeMillis)]
  (Thread/sleep 100)
  (- (System/currentTimeMillis) start))
```
Output:
```clojure
100
```
This proves that calling `System/currentTimeMillis` provides integer timestamps that can be subtracted to accurately capture elapsed time.

### Discard the throwaway example
The timing let-block is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/macros.clj`.
- Change type: add.
- Location: End of file.
- Dependencies: None.

### The New Code
```clojure
(defmacro timing [expr]
  `(let [start# (System/currentTimeMillis)
         result# ~expr
         end#   (System/currentTimeMillis)]
     (println "Elapsed:" (- end# start#) "ms")
     result#))
```

### The Updated Project
```clojure
;; src/macros.clj
(ns macros)

(defmacro my-when [test & body]
  `(if ~test
     (do ~@body)
     nil))

(defmacro my-or
  ([] nil)
  ([e] e)
  ([e1 & rest]
   `(let [v# ~e1]
      (if v# v# (my-or ~@rest)))))

// ← new
(defmacro timing [expr]
  `(let [start# (System/currentTimeMillis)
         result# ~expr
         end#   (System/currentTimeMillis)]
     (println "Elapsed:" (- end# start#) "ms")
     result#))
```
The file now provides a powerful abstraction that augments arbitrary code with performance tracing while preserving the code's native return value.

### Mechanical walkthrough
1. `defmacro timing` — Declares the macro named `timing`.
2. `[expr]` — Accepts a single arbitrary structural form as `expr`.
3. `` `(let ...) `` — Emits a new binding block to securely store runtime values.
4. `start#` — A gensym symbol to hold the starting timestamp.
5. `(System/currentTimeMillis)` — A static method call to the Java `System` class returning the initial millisecond timestamp.
6. `result#` — A gensym symbol bound to hold the actual outcome of the target code block.
7. `~expr` — The unquote operator. The raw target expression is inserted here, meaning it will finally execute *between* the two timestamp operations.
8. `end#` — A gensym symbol storing the final timestamp.
9. `(println ...)` — Computes elapsed time by subtracting `start#` from `end#`, and prints the result as a side effect.
10. `result#` — The final statement of the `let` block, guaranteeing that the original evaluated value of `expr` is successfully returned back to the user.


## Concept Unit: When NOT to use macros

### The Problem
Because macros afford supreme control over code structure, it is tempting to use them for everything. However, Clojure enforces a strict engineering community standard: only write a macro if it is fundamentally impossible to achieve the same result with a function. Macros operate rigidly at compile time, meaning they cannot be mapped over sequences, passed as arguments, or easily composed.

### Introduce the concept in isolation
We will construct a macro that serves no valid purpose to demonstrate a severe anti-pattern. This is a **macro anti-pattern**.

```clojure
(defmacro bad-add [a b] 
  `(+ ~a ~b))

(bad-add 1 2)
```
Output:
```clojure
3
```
This proves that the macro effectively performs addition. However, because it forcibly evaluates both arguments normally and contains no conditional execution logic or structural binding wrappers, it provides zero capability over `(defn bad-add [a b] (+ a b))`. Worse, executing `(map bad-add [1 2] [3 4])` will instantly crash the compiler, because macros do not exist at runtime and cannot be treated as functional values.

### Discard the throwaway example
The `bad-add` macro is fully discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: None.
- Change type: N/A.
- Location: N/A.
- Dependencies: None.

### The New Code
(No code added, this unit establishes architectural boundaries).

### The Updated Project
(No file modifications).

### Mechanical walkthrough
1. `bad-add` — An improperly conceived macro that accepts arguments natively.
2. `~a` and `~b` — Because both terms are immediately unquoted and structurally evaluated with no branching or delayed logic, it exposes the fact that a standard function parameter would have natively sufficed.

Closing: macros are Clojure's primary mechanism for crafting Domain Specific Languages. Clojure's threading macros (`->`, `->>`), test assertions (`is`, `are`), and server routing APIs (Compojure's `defroutes`, `GET`) are all implemented fundamentally as macros. You now possess the tools to construct and deconstruct them securely.
