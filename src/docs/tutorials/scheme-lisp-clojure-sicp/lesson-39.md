# Lesson 39: Welcome to Clojure — A Lisp for the JVM

**What you will build**
You will install Clojure (using either the Clojure CLI or Leiningen), open a REPL, and evaluate your first Clojure expressions. The transferable problems you are solving are understanding how Clojure differs from Scheme, why it runs on the JVM, and how its core design decisions — immutability by default, persistent data structures, and explicit concurrency — address the state management problems that Scheme leaves to the programmer.

**What you need to know first**
Lessons 0–38 (all prior concepts through Scheme, SICP, miniKanren). You need to know Scheme/Racket well, as this lesson bridges from Scheme to Clojure.

## Terms used in this lesson

- **JVM (Java Virtual Machine)** — An engine that provides a runtime environment to drive Java Code or applications. It solves the problem of platform independence, allowing Clojure to run anywhere Java runs and interoperate seamlessly with the entire Java ecosystem.
- **Persistent data structure** — A data structure that always preserves its previous version when it is modified. It solves the problem of accidental mutation and concurrency issues by ensuring that updates return a new structure with structural sharing, leaving the original unchanged.
- **Immutability** — The principle that state cannot be modified after it is created. It solves the problem of side-effects making programs difficult to reason about.
- **Structural sharing** — A technique used by persistent data structures where the new version shares unchanged parts of the structure with the old version. It solves the performance and memory overhead of copying entire large structures upon every modification.
- **Prefix notation** — A mathematical notation where operators precede their operands. It exists to unify function calls and operators into a single, unambiguous syntactical form (e.g., S-expressions).
- **S-expression (Symbolic Expression)** — A convention for representing nested list data. It solves the problem of code-as-data (homoiconicity) by representing both source code and data structures uniformly.
- **Falsy** — A value that evaluates to false in a boolean context. In Clojure, only `nil` and `false` are falsy. This solves the need for a standardized conditional check across different types.
- **Truthy** — A value that evaluates to true in a boolean context. In Clojure, everything other than `nil` and `false` is truthy, including empty collections.
- **Side effect** — A change in state or an observable interaction with the outside world that occurs during the calculation of a result. It solves the need to actually do things (like print to a screen or write to a database) beyond pure computation.
- **Referential transparency** — The property that an expression can be replaced by its value without changing the program's behavior. It solves the problem of unpredictable state and makes equational reasoning possible.

## Objects and methods used

**clj**
- *What it is:* The Clojure command-line tool.
- *Implementation:* An executable script that invokes Java with the Clojure jar.
- *Its use:* To launch the Clojure REPL or run Clojure scripts.
- *Type:* Command-line executable.
- *Responsibility:* Bootstraps the Clojure environment and handles dependency resolution via `deps.edn`.
- *Depends on:* Java Virtual Machine (JDK/JRE).
- *Connects to:* Calls the Java process.
- *Shape:* Entry point.

**lein repl**
- *What it is:* The Leiningen command to start a REPL.
- *Implementation:* A shell command provided by the Leiningen build tool.
- *Its use:* To start an interactive Clojure session within a Leiningen project context.
- *Type:* Command-line argument.
- *Responsibility:* Starts an interactive read-eval-print loop with all project dependencies loaded.
- *Depends on:* Leiningen, JVM.
- *Connects to:* Calls nREPL or the default Clojure REPL.
- *Shape:* Entry point.

**println**
- *What it is:* Clojure's standard output printing function.
- *Implementation:* `(println & more) -> nil`
- *Its use:* To display strings and variables to the console with a trailing newline.
- *Type:* Function.
- *Responsibility:* Formats arguments with spaces and prints them to `*out*`, followed by a newline.
- *Depends on:* Standard output stream.
- *Connects to:* Calls Java's `System.out.println` under the hood.
- *Shape:* I/O boundary.

**nil**
- *What it is:* Clojure's null value.
- *Implementation:* Equivalent to Java's `null`.
- *Its use:* Represents the absence of a value.
- *Type:* Literal value.
- *Responsibility:* Acts as a falsy sentinel value to indicate missing data or a lack of return value.
- *Depends on:* Nothing.
- *Connects to:* Interoperates natively with Java's `null`.
- *Shape:* Primitive data type.

**defn**
- *What it is:* A macro used to define functions.
- *Implementation:* `(defn name [params*] body*) -> Var`
- *Its use:* To bind a named function to the global namespace.
- *Type:* Macro.
- *Responsibility:* Creates a function object and binds it to a Var in the current namespace.
- *Depends on:* The Clojure compiler to expand the macro.
- *Connects to:* Expands into `def` and `fn`.
- *Shape:* Top-level declaration.

**fn**
- *What it is:* A special form to create an anonymous function.
- *Implementation:* `(fn [params*] body*) -> IFn`
- *Its use:* To create a closure or function inline without naming it.
- *Type:* Special form.
- *Responsibility:* Compiles a list of expressions into a callable Java class implementing the `IFn` interface.
- *Depends on:* The Clojure compiler.
- *Connects to:* Passed as arguments to higher-order functions.
- *Shape:* Expression.

**let**
- *What it is:* A special form to create lexical bindings.
- *Implementation:* `(let [bindings*] body*) -> Any`
- *Its use:* To bind names to values locally within a scope.
- *Type:* Special form.
- *Responsibility:* Evaluates bindings in order and executes the body with those names bound to their corresponding values.
- *Depends on:* A vector of binding pairs.
- *Connects to:* Provides local scope for enclosed expressions.
- *Shape:* Expression.

**if**
- *What it is:* The fundamental conditional branching construct.
- *Implementation:* `(if test then else?) -> Any`
- *Its use:* To execute one of two branches based on a truthy/falsy check.
- *Type:* Special form.
- *Responsibility:* Evaluates the test; if truthy, evaluates the `then` branch; otherwise, evaluates the `else` branch.
- *Depends on:* A condition expression.
- *Connects to:* Controls execution flow.
- *Shape:* Control flow expression.

**cond**
- *What it is:* A macro for multi-way branching.
- *Implementation:* `(cond & clauses) -> Any`
- *Its use:* To evaluate multiple conditions sequentially without nesting `if` statements.
- *Type:* Macro.
- *Responsibility:* Evaluates tests in order until one is truthy, then evaluates and returns its associated expression.
- *Depends on:* The Clojure compiler.
- *Connects to:* Expands into nested `if` forms.
- *Shape:* Control flow expression.

**list**
- *What it is:* A function that creates a linked list.
- *Implementation:* `(list & items) -> IPersistentList`
- *Its use:* To construct a list containing the provided arguments.
- *Type:* Function.
- *Responsibility:* Allocates and links cons cells to form a persistent list.
- *Depends on:* The arguments provided.
- *Connects to:* Returns a sequence interface.
- *Shape:* Constructor.

**first**
- *What it is:* A sequence function returning the first element.
- *Implementation:* `(first coll) -> Any`
- *Its use:* Equivalent to Scheme's `car`.
- *Type:* Function.
- *Responsibility:* Calls `seq` on the collection and returns the item at the head.
- *Depends on:* A collection.
- *Connects to:* N/A.
- *Shape:* Accessor.

**rest**
- *What it is:* A sequence function returning a sequence of all elements after the first.
- *Implementation:* `(rest coll) -> ISeq`
- *Its use:* Equivalent to Scheme's `cdr`.
- *Type:* Function.
- *Responsibility:* Returns a possibly empty sequence of the elements logically following the first.
- *Depends on:* A collection.
- *Connects to:* N/A.
- *Shape:* Accessor.

**nth**
- *What it is:* A function to get an element by index.
- *Implementation:* `(nth coll index) -> Any`
- *Its use:* To retrieve an item from an indexed collection (like a vector) in O(1) or O(log N) time.
- *Type:* Function.
- *Responsibility:* Returns the value at the given index, throwing an exception if out of bounds (unless a fallback is provided).
- *Depends on:* An indexed collection and an integer index.
- *Connects to:* Collection abstractions.
- *Shape:* Accessor.

**contains?**
- *What it is:* A predicate checking for the presence of a key or index.
- *Implementation:* `(contains? coll key) -> Boolean`
- *Its use:* To check if a set has a specific element, or a map has a specific key.
- *Type:* Function.
- *Responsibility:* Returns true if the key is present in the given collection.
- *Depends on:* A collection and a key.
- *Connects to:* Collection abstractions.
- *Shape:* Predicate.

**conj**
- *What it is:* A function to conjoin an item onto a collection.
- *Implementation:* `(conj coll x & xs) -> IPersistentCollection`
- *Its use:* To add elements to a collection in the most natural (efficient) way for that collection type.
- *Type:* Function.
- *Responsibility:* Returns a new persistent collection with the item(s) added. (For lists, it adds to the front; for vectors, to the back).
- *Depends on:* A collection and an item.
- *Connects to:* Persistent data structures.
- *Shape:* Modifier.

**assoc**
- *What it is:* A function to associate a key with a value in a dictionary-like structure.
- *Implementation:* `(assoc map key val & kvs) -> IPersistentMap`
- *Its use:* To update maps or vectors.
- *Type:* Function.
- *Responsibility:* Returns a new persistent collection that contains the mapping from key to val.
- *Depends on:* An associative collection, a key, and a value.
- *Connects to:* Persistent data structures.
- *Shape:* Modifier.

**def**
- *What it is:* A special form to create a global Var.
- *Implementation:* `(def symbol init?) -> Var`
- *Its use:* To bind a value to a symbol in the current namespace, analogous to Scheme's `define`.
- *Type:* Special form.
- *Responsibility:* Interns a Var in the current namespace and sets its root binding to the value of the init expression.
- *Depends on:* A symbol.
- *Connects to:* The namespace system.
- *Shape:* Top-level declaration.

**str**
- *What it is:* A string concatenation function.
- *Implementation:* `(str & args) -> String`
- *Its use:* To concatenate strings or convert objects to strings.
- *Type:* Function.
- *Responsibility:* Calls `.toString` on all arguments and concatenates the results into a single String.
- *Depends on:* Objects to be converted/concatenated.
- *Connects to:* Java `StringBuilder`.
- *Shape:* Utility.


## Concept Unit: What Clojure is and why it exists

### The Problem
You know Scheme, a minimalist educational Lisp where everything is built from cons cells and mutation is a tool the programmer must manage carefully. You want to build production systems that handle massive data, parallel execution, and integrate with massive library ecosystems. Scheme leaves problems like concurrency and platform integration largely as an exercise for the reader. How do we keep the power of Lisp — macros, functional core, REPL-driven development — but make it inherently robust for production?

### Introduce the concept in isolation
We will look at how Clojure handles immutable data vs Scheme.

```clojure
; This is a throwaway example to demonstrate immutability by default.
(def original-list (list 1 2 3))
(def new-list (conj original-list 0))

(println original-list)
; Output: (1 2 3)

(println new-list)
; Output: (0 1 2 3)
```
This proves that `conj` returns a new collection without destroying or mutating the original. The underlying concept is called **persistent data structures**.

### Discard the throwaway example
We are deleting the `original-list` throwaway code. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are installing the Clojure runtime and starting the interactive REPL shell.

- **Reference Source:** None.
- **Files affected:** Terminal / shell session.
- **Change type:** Configuration and execution.
- **Location:** System terminal.
- **Dependencies:** Java 11+ (Temurin JDK 21 recommended) must be installed.

### The New Code
```shell
# 1. Install Java 11+ from https://adoptium.net (Temurin JDK 21 recommended)
# 2. Install the Clojure CLI tools (https://clojure.org/guides/install_clojure#_windows) or Leiningen.
# 3. Open a PowerShell or Command Prompt terminal.
# 4. Run the Clojure REPL:
clj
```

### The Updated Project
When you run the command, your terminal will transform into an interactive Clojure session:
```
// ← new
Clojure 1.11.1
user=>
```
The terminal now hosts a running Java process with the Clojure compiler loaded, waiting to evaluate your S-expressions.

### Mechanical walkthrough
- `clj`: The command-line tool that bootstraps a JVM process and starts the Clojure interactive REPL.
- `user=>`: The prompt indicating that you are currently in the `user` namespace, ready to type expressions.

## Concept Unit: The Clojure REPL — first expressions

### The Problem
Now that you have a running Clojure REPL, you need to verify that it functions identically to the Scheme REPL you are familiar with, and understand the slight syntactic differences, such as how it handles side-effects.

### Introduce the concept in isolation
Let's see what happens when we print something, which is a side-effect.

```clojure
user=> (println "Test side effect")
Test side effect
nil
```
This proves that evaluating an expression for its side-effects produces an output to the console ("Test side effect"), but the expression evaluates to the value **nil**.

### Discard the throwaway example
The "Test side effect" code is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are typing expressions directly into the REPL.

- **Reference Source:** None.
- **Files affected:** Terminal.
- **Change type:** Evaluation.
- **Location:** At the `user=>` prompt.
- **Dependencies:** A running Clojure REPL.

### The New Code
```clojure
42
"hello"
(+ 1 2)
(* 3 (+ 1 2))
(println "Hello, Clojure!")
```

### The Updated Project
```clojure
user=> 42
42
user=> "hello"
"hello"
user=> (+ 1 2)
3
user=> (* 3 (+ 1 2))
9
user=> (println "Hello, Clojure!")
Hello, Clojure!
nil
```
The REPL processes each expression identically to Scheme. Prefix notation evaluation works the same way. The side-effecting function prints text and returns `nil`.

### Mechanical walkthrough
- `42`: A literal integer evaluates to itself.
- `"hello"`: A literal string evaluates to itself.
- `(+ 1 2)`: Evaluates the function `+` with arguments `1` and `2`, returning `3`. The **Prefix notation** is structurally identical to Scheme.
- `(* 3 (+ 1 2))`: The REPL recursively evaluates the inner expression `(+ 1 2)` to `3`, then evaluates `(* 3 3)` to `9`.
- `(println "Hello, Clojure!")`: `println` is Clojure's equivalent to `display` plus a newline.
- `nil`: Clojure's representation of null or "no value". It is returned by `println` because printing is executed for its **side effect**, not to compute a mathematical value.

## Concept Unit: Scheme vs Clojure — the side-by-side comparison

### The Problem
You already know how to define functions, bind variables, and branch logic in Scheme. You need the direct, equivalent vocabulary in Clojure so you can translate your existing mental models without getting stuck on syntax changes.

### Introduce the concept in isolation
Let's define a simple function using both forms.
```clojure
; Scheme: (define (add1 x) (+ x 1))
; Clojure:
(defn add1 [x] (+ x 1))

(add1 5)
; => 6
```
This proves that Clojure uses a vector `[x]` to denote function parameters, whereas Scheme used a list `(x)`. This is a syntactic choice to make parameters visually distinct from function calls.

### Discard the throwaway example
The `add1` throwaway function is deleted.

### Project Change
No reference counterpart — this is a from-scratch addition because we are reviewing language equivalents directly.

- **Reference Source:** None.
- **Files affected:** Terminal.
- **Change type:** Evaluation.
- **Location:** At the `user=>` prompt.
- **Dependencies:** A running Clojure REPL.

### The New Code
```clojure
; 1. Local binding
(let [x 1] x)

; 2. Anonymous function
((fn [x] (* x 2)) 5)

; 3. Conditionals
(if true "yes" "no")

; 4. Multi-clause
(cond
  false "skip"
  true "match")

; 5. List operations
(first (list 1 2 3))
(rest (list 1 2 3))
```

### The Updated Project
```clojure
user=> (let [x 1] x)
1
user=> ((fn [x] (* x 2)) 5)
10
user=> (if true "yes" "no")
"yes"
user=> (cond false "skip" true "match")
"match"
user=> (first (list 1 2 3))
1
user=> (rest (list 1 2 3))
(2 3)
```
You can now see the exact Clojure equivalents of `let`, `lambda`, `if`, `cond`, `car`, and `cdr`. The logic remains exactly the same as Scheme, but with different names and the use of brackets for binding vectors.

### Mechanical walkthrough
- `let`: Creates a local binding. In Clojure, the bindings are defined inside a vector `[x 1]` rather than a nested list `([x 1])` as in Scheme.
- `fn`: The equivalent of Scheme's `lambda`. Creates an anonymous function. Parameters are enclosed in a vector `[x]`.
- `if`: The basic conditional. It works exactly like Scheme: `(if test truthy-branch falsy-branch)`.
- `true` and `false`: Clojure's boolean literals, replacing Scheme's `#t` and `#f`.
- `cond`: Works similarly to Scheme, but pairs are written flat in sequence rather than wrapped in parentheses `(test expr)`.
- `list`: Constructs a linked list, identical to Scheme.
- `first`: Returns the head of the sequence. It is the Clojure equivalent of `car`.
- `rest`: Returns the tail of the sequence. It is the Clojure equivalent of `cdr`.

## Concept Unit: Clojure's rich literal syntax — what Scheme doesn't have

### The Problem
In Scheme, your primary tool to group data is the list (cons cells). If you need an array, hash map, or set, you must call a specific function to instantiate them. Clojure elevates these essential data structures to first-class syntax, making them as easy to write as lists.

### Introduce the concept in isolation
Let's inspect a map literal.
```clojure
{:name "Alice" :age 30}
```
This proves that Clojure can natively represent an associative key-value map directly in syntax, without needing a function call like `(hash-map :name "Alice")`.

### Discard the throwaway example
The map literal throwaway is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition because we are interacting with data structure literals in the REPL.

- **Reference Source:** None.
- **Files affected:** Terminal.
- **Change type:** Evaluation.
- **Location:** At the `user=>` prompt.
- **Dependencies:** A running Clojure REPL.

### The New Code
```clojure
'(1 2 3)
[1 2 3]
(nth [1 2 3] 1)
{:name "Alice" :age 30}
(:name {:name "Alice"})
#{1 2 3}
(contains? #{1 2 3} 2)
```

### The Updated Project
```clojure
user=> '(1 2 3)
(1 2 3)
user=> [1 2 3]
[1 2 3]
user=> (nth [1 2 3] 1)
2
user=> {:name "Alice" :age 30}
{:name "Alice", :age 30}
user=> (:name {:name "Alice"})
"Alice"
user=> #{1 2 3}
#{1 3 2}
user=> (contains? #{1 2 3} 2)
true
```
The REPL successfully evaluated lists, vectors, maps, and sets. These are the four core data structures in Clojure. They evaluate to themselves and are fundamentally integrated into the language.

### Mechanical walkthrough
- `'(1 2 3)`: A quoted list, identical to Scheme.
- `[1 2 3]`: A literal **vector**. Vectors provide fast O(log n) indexed access, unlike lists which require O(n) traversal.
- `nth`: Retrieves an element by its index from a collection.
- `{:name "Alice" :age 30}`: A literal **map**. This acts as a hash table for key-value pairs.
- `:name`: A keyword. Keywords evaluate to themselves and are typically used as fast keys in maps. They can also act as functions to look themselves up in a map.
- `#{1 2 3}`: A literal **set**. Sets guarantee unique, unordered elements.
- `contains?`: A predicate function that returns `true` if the key or element exists in the associative collection.

## Concept Unit: Persistent data structures — Clojure's core innovation

### The Problem
In Scheme, if you want to add an element to a data structure in place, you must use mutating operators like `set!` or `vector-set!`. This introduces the potential for bugs where other parts of the program that hold a reference to that data structure suddenly see it change. How does Clojure avoid this while remaining highly performant?

### Introduce the concept in isolation
Let's see what happens when we "modify" a vector.
```clojure
(def a [1 2])
(def b (conj a 3))

(println a)
; Output: [1 2]
```
This proves that modifying a vector returns an entirely new vector. The original vector `a` is never mutated. This is what we mean by **Persistent data structure**.

### Discard the throwaway example
The throwaway bindings for `a` and `b` are discarded.

### Project Change
No reference counterpart — this is a from-scratch addition because we are proving immutability in the REPL.

- **Reference Source:** None.
- **Files affected:** Terminal.
- **Change type:** Evaluation.
- **Location:** At the `user=>` prompt.
- **Dependencies:** A running Clojure REPL.

### The New Code
```clojure
(def v1 [1 2 3])
(def v2 (conj v1 4))

v1
v2

(def m1 {:a 1 :b 2})
(def m2 (assoc m1 :c 3))

m1
m2
```

### The Updated Project
```clojure
user=> (def v1 [1 2 3])
#'user/v1
user=> (def v2 (conj v1 4))
#'user/v2
user=> v1
[1 2 3]
user=> v2
[1 2 3 4]
user=> (def m1 {:a 1 :b 2})
#'user/m1
user=> (def m2 (assoc m1 :c 3))
#'user/m2
user=> m1
{:a 1, :b 2}
user=> m2
{:a 1, :b 2, :c 3}
```
The REPL output explicitly proves that `v1` and `m1` remain entirely unmodified after `v2` and `m2` are created from them. Clojure gives you the illusion of mutable code (like `conj` and `assoc`) but preserves referential transparency.

### Mechanical walkthrough
- `def`: Binds a global variable.
- `v1` and `m1`: References to a vector and a map, respectively.
- `conj`: "Conjoin." Adds an element to the collection in the most efficient manner (to the end of a vector, to the start of a list). Returns a new persistent collection utilizing **structural sharing**.
- `assoc`: "Associate." Updates or adds a key-value pair to a map, returning a new persistent map. The original map is unaltered.

## Concept Unit: `def` and `defn` — Clojure's `define`

### The Problem
You need to write reusable logic that persists beyond a single expression, and you need to bind values to global identifiers. You must translate Scheme's `(define (name x) ...)` into Clojure.

### Introduce the concept in isolation
Let's define a simple greeting function.
```clojure
(defn say-hi [name]
  (str "Hi " name))

(say-hi "Bob")
; => "Hi Bob"
```
This proves that `defn` encapsulates defining a function, specifying arguments in a vector, and providing a body, cleanly binding the name `say-hi` to the function object globally.

### Discard the throwaway example
The `say-hi` throwaway function is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition because we are defining functions in the REPL.

- **Reference Source:** None.
- **Files affected:** Terminal.
- **Change type:** Evaluation.
- **Location:** At the `user=>` prompt.
- **Dependencies:** A running Clojure REPL.

### The New Code
```clojure
(def x 42)
(def pi 3.14159)

(defn square [x]
  (* x x))

(square 5)

(defn greet [name]
  (str "Hello, " name "!"))

(greet "World")
```

### The Updated Project
```clojure
user=> (def x 42)
#'user/x
user=> (def pi 3.14159)
#'user/pi
user=> (defn square [x]
  (* x x))
#'user/square
user=> (square 5)
25
user=> (defn greet [name]
  (str "Hello, " name "!"))
#'user/greet
user=> (greet "World")
"Hello, World!"
```
The environment now holds named variables and functions that you can repeatedly invoke. `defn` behaves just like Scheme's shorthand `define` for functions.

### Mechanical walkthrough
- `def`: Binds the global vars `x` and `pi` to static values. It is exactly like `(define x 42)` in Scheme.
- `defn`: The macro used to define named functions. Like Scheme's `(define (f x) ...)`, it wraps the name and the parameters, with the parameters explicitly inside a vector `[x]`.
- `str`: Clojure's standard string concatenation function. It coerces any given objects to their string representations and joins them into a single string.

---

Clojure takes Scheme's ideas and makes them production-ready. You still have the same eval/apply cycle, the same closures, and the same structural syntax, but reinforced with persistent data structures, seamless JVM interop, and a rich, practical library ecosystem. 

In the next lessons, we will build out a real data pipeline utilizing these concepts.
