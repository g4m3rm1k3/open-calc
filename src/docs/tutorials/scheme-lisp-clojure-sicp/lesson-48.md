# Lesson 48: Testing in Clojure — `clojure.test` and Property-Based Testing

What you will build
In this lesson, you will write unit tests using `clojure.test` (including `deftest`, `is`, `are`, and `testing`), learn the basics of property-based testing with `clojure.spec`, and set up a test runner. You will build a suite of automated tests. The transferable problems you will solve are: (1) understanding how macros make test output readable, since `deftest` and `is` are macros; (2) shifting from example-based testing to property-based testing by generating random inputs to uncover edge cases; and (3) leveraging Clojure's functional design (pure functions, immutable data, and local state via atoms) to make writing and composing tests remarkably straightforward.

What you need to know first
- Lessons 0–47 (all prior concepts through Clojure namespaces, project structure, functions, protocols, atoms).

Terms used in this lesson
- **Macro** — A macro is a function that takes code as input and returns code as output, executing at compile-time rather than run-time. It exists to extend the language and implement domain-specific syntax (like `deftest` or `is`) without evaluating its arguments beforehand, solving the problem of needing boilerplate-free, expressive test definitions.
- **Unit Testing** — The practice of testing individual, isolated components of a program (like a single function) to verify they behave as expected. It exists to catch bugs early, prove that a specific piece of logic works in isolation, and provide a safety net for future refactoring.
- **Example-Based Testing** — A testing approach where the programmer provides specific, hard-coded inputs and expected outputs (e.g., asserting that 2 + 2 = 4). It exists to verify known scenarios and specific requirements, though it can miss unanticipated edge cases.
- **Property-Based Testing** — A testing approach where the programmer defines general rules or properties that must always hold true, and a framework generates random inputs to try and falsify those properties. It exists to automatically discover edge cases (like empty collections, negative numbers, or extremely large values) that manual example-based tests often overlook.
- **Pure Function** — A function that always produces the same output for the same input and has no side effects (it does not modify external state, read from files, or interact with the network). It exists to make code predictable, composable, and trivial to test, as you only need to pass arguments and check the return value.
- **Atom** — A Clojure reference type that manages shared, synchronous, independent state. It provides a way to hold a mutable reference to an immutable value. It exists to safely manage state changes over time using atomic operations (like `swap!`), avoiding the pitfalls of unchecked mutable state.
- **Namespace** — A mechanism in Clojure to group related functions, macros, and data, avoiding name collisions. It exists to organize code structurally, much like packages or modules in other languages.
- **Side Effect** — Any observable change in the system state outside a function's scope (e.g., printing to the console, writing to a database, updating a global variable). It exists because programs must eventually interact with the world, but isolating side effects makes the core logic easier to test.

Objects and methods used
- **`clojure.test/deftest`**
  - *What it is:* A macro that defines a test function.
  - *Implementation:* `(deftest name & body)`
  - *Its use:* Used to group a set of related assertions into a named test suite that a test runner can discover and execute.
  - *Type:* Macro
  - *Responsibility:* Registers a test function in the current namespace so that it can be invoked automatically during a test run, while providing a human-readable name for reporting.
  - *Depends on:* A symbol for the test name, and one or more expressions (usually `is` or `are` assertions) that form the body of the test.
  - *Connects to:* Called by the programmer to define a test; its result is invoked by `run-tests` to execute the assertions.
  - *Shape:* A declarative API boundary in test files, defining the top-level structure of a test suite.
- **`clojure.test/is`**
  - *What it is:* A macro that evaluates an expression and asserts that it is truthy.
  - *Implementation:* `(is form)` or `(is form msg)`
  - *Its use:* Used to make a single assertion within a test; if the assertion fails, it intercepts the code form to provide detailed failure messages showing expected vs. actual values.
  - *Type:* Macro
  - *Responsibility:* Evaluates a test condition, reports a pass if truthy, and generates a formatted failure report if falsy or if an exception is thrown.
  - *Depends on:* A test expression (like `(= 4 (+ 2 2))`), and an optional failure message string.
  - *Connects to:* Used inside the body of `deftest` or `testing`; integrates with the `clojure.test` reporting system to log results.
  - *Shape:* An internal assertion primitive, forming the leaves of the test execution tree.
- **`clojure.test/run-tests`**
  - *What it is:* A function that executes tests in specified namespaces.
  - *Implementation:* `(run-tests & namespaces)`
  - *Its use:* Used to manually trigger the execution of all `deftest` definitions in the current namespace from the REPL.
  - *Type:* Function
  - *Responsibility:* Discovers, executes, and summarizes the results of all tests defined in the given namespaces, reporting counts of passes, failures, and errors.
  - *Depends on:* Optional namespace symbols; defaults to the current namespace if none are provided.
  - *Connects to:* Called by the user or build tool; iterates over vars defined by `deftest` and invokes them.
  - *Shape:* An entry-point function for triggering test execution and generating a summary report.
- **`clojure.test/testing`**
  - *What it is:* A macro that adds a string context to a group of assertions.
  - *Implementation:* `(testing string & body)`
  - *Its use:* Used to group related assertions inside a `deftest` and provide a descriptive label that appears in failure messages, making it easier to pinpoint what broke.
  - *Type:* Macro
  - *Responsibility:* Manages a stack of context strings, appending its provided string to the stack before executing its body, and removing it afterward.
  - *Depends on:* A descriptive string and one or more assertion expressions.
  - *Connects to:* Used inside `deftest`; influences the failure reporting of `is` macros executed within its body.
  - *Shape:* An organizational boundary within a test definition, providing hierarchical context.
- **`clojure.test/are`**
  - *What it is:* A macro for template-driven testing, applying a single assertion pattern to multiple sets of inputs.
  - *Implementation:* `(are [args] expr & args-for-expr)`
  - *Its use:* Used to concisely write multiple similar assertions (like a table of inputs and expected outputs) without duplicating the `is` boilerplate.
  - *Type:* Macro
  - *Responsibility:* Expands into multiple `is` assertions based on a provided template expression and a sequence of values, mapping the values to the template arguments.
  - *Depends on:* A binding vector (the variables in the template), the template expression itself, and a flat sequence of values to substitute into the template.
  - *Connects to:* Used inside `deftest`; expands into multiple `is` calls, effectively generating repetitive test code at compile time.
  - *Shape:* A code-generation macro used to compress repetitive test cases into a tabular format.
- **`clojure.spec.alpha/def`**
  - *What it is:* A macro that registers a specification under a qualified keyword.
  - *Implementation:* `(s/def k spec-form)`
  - *Its use:* Used to define a reusable data shape or validation rule and associate it with a globally unique identifier in the spec registry.
  - *Type:* Macro
  - *Responsibility:* Evaluates a spec definition and stores it in a global registry, keyed by a namespaced keyword, so it can be referenced elsewhere by name.
  - *Depends on:* A namespaced keyword (like `::name`) and a spec expression (like `string?` or another spec composition).
  - *Connects to:* Called to set up specifications; its registered keys are later passed to `s/valid?`, `s/explain`, or generators.
  - *Shape:* A global configuration boundary for defining the system's data contracts.
- **`clojure.spec.alpha/valid?`**
  - *What it is:* A function that checks if a value conforms to a specification.
  - *Implementation:* `(s/valid? spec x)`
  - *Its use:* Used to perform a boolean check on whether a given piece of data strictly satisfies the rules of a specified shape.
  - *Type:* Function
  - *Responsibility:* Evaluates a value against a specification and returns `true` if it conforms, or `false` otherwise, without throwing exceptions or providing detailed errors.
  - *Depends on:* A spec (either a registered keyword or an inline spec definition) and a value to test.
  - *Connects to:* Uses the spec registry to look up definitions; commonly used in assertions or conditional logic to validate data at runtime.
  - *Shape:* A query function providing a boolean answer about data validity.
- **`clojure.spec.alpha/explain`**
  - *What it is:* A function that prints a human-readable explanation of why a value fails a specification.
  - *Implementation:* `(s/explain spec x)`
  - *Its use:* Used during debugging or testing to understand exactly which part of a complex data structure violated a spec, and what the violation was.
  - *Type:* Function
  - *Responsibility:* Analyzes a value against a specification, identifies all failing paths, and prints a formatted report detailing the expected predicates and actual values that failed.
  - *Depends on:* A spec (usually a registered keyword) and a value to validate.
  - *Connects to:* Uses the spec registry and internal explanation engine; outputs text to standard out (`*out*`).
  - *Shape:* A diagnostic utility invoked when a validation fails, to provide actionable feedback.
- **`clojure.spec.alpha/exercise`**
  - *What it is:* A function that generates random valid examples for a given specification.
  - *Implementation:* `(s/exercise spec n)`
  - *Its use:* Used to visually inspect the kinds of data a spec describes, ensuring the spec isn't too broad or too narrow, and serving as the foundation for property-based testing.
  - *Type:* Function
  - *Responsibility:* Invokes the data generator associated with a spec to produce a sequence of random values that conform to it, returning pairs of `[generated-value conformed-value]`.
  - *Depends on:* A spec and an optional integer `n` specifying how many examples to generate (defaults to 10).
  - *Connects to:* Calls into `clojure.spec.gen.alpha` to utilize test.check generators; used interactively or to seed property tests.
  - *Shape:* A data-generation entry point bridging static specifications and dynamic testing.

Everything else in the file, not this lesson's subject but still explained:
- **`clojure.string/upper-case`**
  - *What it is:* A function that converts a string to uppercase.
  - *Implementation:* `(clojure.string/upper-case s)`
  - *Its use:* Used here as a simple, predictable standard library function to test our assertions against.
  - *Type:* Function
  - *Responsibility:* Takes a string and returns a new string with all characters converted to their uppercase variants, using the host platform's locale rules.
  - *Depends on:* A single string argument.
  - *Connects to:* Delegates to Java's `String.toUpperCase()` under the hood in Clojure on the JVM.
  - *Shape:* A utility function demonstrating simple, pure transformations.
- **`filter`**
  - *What it is:* A core function that returns a sequence of items that satisfy a predicate.
  - *Implementation:* `(filter pred coll)`
  - *Its use:* Used to build a data pipeline demonstrating pure function testing.
  - *Type:* Function
  - *Responsibility:* Iterates over a collection, applying a predicate to each item, and lazily returns a new sequence containing only the items for which the predicate returned truthy.
  - *Depends on:* A predicate function and a collection.
  - *Connects to:* Used within thread-last macros (`->>`) to process sequences.
  - *Shape:* A sequence transformation step.
- **`map`**
  - *What it is:* A core function that applies a function to every item in a collection.
  - *Implementation:* `(map f coll)`
  - *Its use:* Used to transform data in a pure function pipeline.
  - *Type:* Function
  - *Responsibility:* Iterates over a collection, applying a transformation function to each item, and lazily returns a new sequence of the transformed results.
  - *Depends on:* A function and one or more collections.
  - *Connects to:* Often follows `filter` in data processing pipelines.
  - *Shape:* A sequence transformation step.
- **`sort-by`**
  - *What it is:* A core function that sorts a collection based on a key function.
  - *Implementation:* `(sort-by keyfn comp coll)`
  - *Its use:* Used to order data in a pure function pipeline.
  - *Type:* Function
  - *Responsibility:* Sorts a collection by applying a key function to each element to determine its sort value, optionally using a custom comparator.
  - *Depends on:* A key function, an optional comparator (like `>`), and a collection.
  - *Connects to:* Used at the end of a pipeline to ensure predictable ordering.
  - *Shape:* A sequence transformation step.
- **`update`**
  - *What it is:* A function that updates a value in an associative structure.
  - *Implementation:* `(update m k f & args)`
  - *Its use:* Used to modify a specific field in a map (like applying a raise to a salary).
  - *Type:* Function
  - *Responsibility:* Looks up a value at a given key in a map, applies a function to that value, and returns a new map with the result at that key.
  - *Depends on:* A map, a key, an update function, and optional additional arguments.
  - *Connects to:* Used inside the anonymous function passed to `map`.
  - *Shape:* A map transformation utility.

---

## Concept Unit: `clojure.test` basics — `deftest` and `is`

### The Problem

You have written functions that work when you test them manually in the REPL. However, manually running functions and visually inspecting the output is slow, error-prone, and temporary. Once you clear the REPL, the proof that your code works is gone. If you change a function later, you have to remember all the edge cases to test again. We need a way to encode our expectations permanently, so they can be executed automatically and report exactly what fails.

> What happens if you just write a script with `(= 4 (+ 2 2))` and run it? It returns `true`, but what if it returns `false`? How would you know *which* check failed, or what the actual result was instead of the expected one?

### Introduce the concept in isolation

Let's test this in a temporary namespace. In Clojure, we use the `clojure.test` namespace to define tests. The fundamental building blocks are `deftest` (which defines a named test) and `is` (which asserts a condition).

```clojure
(require '[clojure.test :refer [deftest is run-tests]])

(deftest my-throwaway-test
  (is (= 4 (+ 2 2)))
  (is (= 5 (+ 2 2))))

(run-tests)
```

**Output:**
```
Testing user

FAIL in (my-throwaway-test) (NO_SOURCE_FILE:5)
expected: (= 5 (+ 2 2))
  actual: (not (= 5 4))

Ran 1 tests containing 2 assertions.
1 failures, 0 errors.
{:test 1, :pass 1, :fail 1, :error 0, :type :summary}
```

This output proves two things about `deftest` and `is`. First, `deftest` groups assertions into a runnable unit named `my-throwaway-test`. Second, `is` is a **Macro**, not a regular function. If `is` were a regular function, it would only receive the boolean result `false` from `(= 5 (+ 2 2))`. Because it is a macro, it receives the actual code structure at compile time. When the assertion fails, the macro generates an error report that prints the exact expression `(= 5 (+ 2 2))` alongside the actual evaluated result `4`. It unpacks the form to show you exactly why it failed.

### Discard the throwaway example

We will not keep `my-throwaway-test` in our project. The concept of using `deftest` and `is` to define and run tests is what we carry forward.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are setting up tests for the first time.
- **Files affected**: Create `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Top of the new file.
- **Dependencies**: Depends on the `clojure.test` built-in library.

### The New Code

```clojure
(ns my-project.core-test
  (:require [clojure.test :refer [deftest is run-tests]]
            [clojure.string :as string]))

(deftest test-addition
  (is (= 4 (+ 2 2)))
  (is (= 0 (+ 0 0)))
  (is (not= 5 (+ 2 2))))

(deftest test-string-ops
  (is (= "HELLO" (string/upper-case "hello")))
  (is (= 5 (count "hello"))))

(run-tests)
```

### The Updated Project

```clojure
// ← new file: src/my_project/core_test.clj
(ns my-project.core-test
  (:require [clojure.test :refer [deftest is run-tests]]
            [clojure.string :as string]))

(deftest test-addition
  (is (= 4 (+ 2 2)))
  (is (= 0 (+ 0 0)))
  (is (not= 5 (+ 2 2))))

(deftest test-string-ops
  (is (= "HELLO" (string/upper-case "hello")))
  (is (= 5 (count "hello"))))

(run-tests)
```

The new file establishes a dedicated test namespace. It defines two test suites (`test-addition` and `test-string-ops`), each containing multiple assertions. Calling `run-tests` at the end executes both suites and prints a summary. A passing run looks like this:

```
Testing my-project.core-test

Ran 2 tests containing 5 assertions.
0 failures, 0 errors.
```

### Mechanical Walkthrough

- `(ns my-project.core-test ...)`: Declares a **Namespace**, defining the boundary for our tests. It requires `clojure.test` and aliases `clojure.string`.
- `deftest`: A **Macro** that defines a test function. `test-addition` becomes a callable function in the namespace, but it is also registered in the background so test runners can find it.
- `is`: A **Macro** that performs **Unit Testing** assertions. It takes an expression `(= 4 (+ 2 2))`. If the expression evaluates to truthy, the test passes silently. If it evaluates to falsy, the macro's internal reporting logic prints the expected form and actual evaluated values.
- `not=`: A core function that returns true if its arguments are not equal. Used here in an `is` macro to assert inequality.
- `run-tests`: A function that discovers all vars defined by `deftest` in the current namespace, invokes them one by one, tallies the passes and failures, and prints a final summary map.

---

## Concept Unit: `testing` blocks and `are` for multiple cases

### The Problem

When a `deftest` contains a dozen `is` assertions, and one fails, the failure message tells you the exact expression that failed, but not the broader context. "Why were we testing this specific case?" Furthermore, writing `is` over and over for the exact same function with different inputs is tedious. We need a way to label groups of tests, and a way to concisely define tables of inputs and expected outputs.

> Look at a sequence of ten `is` checks for an `even?` function. What is the repeating pattern? If you wanted to remove the boilerplate, what information would you need to parameterize?

### Introduce the concept in isolation

Let's look at `testing` and `are` in a throwaway snippet.

```clojure
(require '[clojure.test :refer [deftest is are testing run-tests]])

(deftest my-context-test
  (testing "Testing bad math"
    (is (= 5 (+ 2 2)))))

(deftest my-table-test
  (are [input expected] (= expected (* 2 input))
    3 6
    4 9))

(run-tests)
```

**Output:**
```
Testing user

FAIL in (my-context-test) (NO_SOURCE_FILE:5)
Testing bad math
expected: (= 5 (+ 2 2))
  actual: (not (= 5 4))

FAIL in (my-table-test) (NO_SOURCE_FILE:8)
expected: (= 9 (* 2 4))
  actual: (not (= 9 8))

Ran 2 tests containing 2 assertions.
2 failures, 0 errors.
```

This output proves two things. First, the `testing` macro prepends the string "Testing bad math" to the failure report for any `is` macro that fails inside its body. Second, the `are` macro takes a template `(= expected (* 2 input))` and pairs of values `(3 6)` and `(4 9)`. It automatically generates multiple `is` assertions. When the second one fails, it prints `(= 9 (* 2 4))`, showing that the macro successfully substituted `input` with `4` and `expected` with `9` before running the assertion.

### Discard the throwaway example

We will discard `my-context-test` and `my-table-test`. The concepts of string contexts and tabular generation are what we will use.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Append to the existing file.
- **Dependencies**: Requires `are` and `testing` from `clojure.test`.

### The New Code

```clojure
(deftest test-arithmetic
  (testing "addition"
    (is (= 5 (+ 2 3)))
    (is (= 0 (+ -1 1))))
  (testing "multiplication"
    (is (= 6 (* 2 3)))
    (is (= 0 (* 5 0)))))

(deftest test-even?
  (are [n expected] (= expected (even? n))
    0 true
    1 false
    2 true
    100 true
    101 false))
```

### The Updated Project

```clojure
(ns my-project.core-test
  (:require [clojure.test :refer [deftest is are testing run-tests]]
            [clojure.string :as string]))

// ... test-addition and test-string-ops ...

// ← new
(deftest test-arithmetic
  (testing "addition"
    (is (= 5 (+ 2 3)))
    (is (= 0 (+ -1 1))))
  (testing "multiplication"
    (is (= 6 (* 2 3)))
    (is (= 0 (* 5 0)))))

(deftest test-even?
  (are [n expected] (= expected (even? n))
    0 true
    1 false
    2 true
    100 true
    101 false))

(run-tests)
```

The updated file adds hierarchical labels to arithmetic tests and defines a concise table-driven test for the `even?` function using **Example-Based Testing**.

### Mechanical Walkthrough

- `testing`: A **Macro** that establishes a string context ("addition", "multiplication"). It pushes this string onto a dynamic stack maintained by `clojure.test`. If any `is` macro inside its body fails, the failure reporter reads the stack and prints the context, helping diagnose the failure.
- `are`: A **Macro** for data-driven testing. It takes three parts:
  - `[n expected]`: A binding vector declaring the variables that will change.
  - `(= expected (even? n))`: The template assertion expression.
  - `0 true 1 false ...`: A flat sequence of values.
  The macro groups the values by the size of the binding vector (pairs, in this case). At compile time, it expands into multiple independent `is` assertions. This eliminates boilerplate while maintaining precise error reporting for each specific case.

---

## Concept Unit: Testing pure functions

### The Problem

Testing code that interacts with databases, global variables, or network calls requires complex setup: mocking dependencies, resetting global state between tests, and handling unreliable IO. How do we test complex logic without bringing in mocking frameworks?

> If a function's behavior relies solely on its inputs to compute an output, what setup is required to test it? If it makes no changes to the outside world, what tear-down is required?

### Introduce the concept in isolation

Let's write a small **Pure Function** pipeline and test it directly. A pure function has no **Side Effect**.

```clojure
(defn process-employees [employees]
  (->> employees
       (filter #(> (:salary %) 70000))
       (map #(update % :salary * 1.1))
       (sort-by :salary >)))

(def test-data [{:name "Alice" :salary 95000}
                {:name "Bob"   :salary 62000}
                {:name "Carol" :salary 88000}])

(process-employees test-data)
```

**Output:**
```
({:name "Alice", :salary 104500.0} {:name "Carol", :salary 96800.0})
```

This proves that `process-employees` evaluates its input and returns a new list without modifying `test-data`. Because the function is pure, testing it requires zero mocking, zero environment setup, and zero teardown. We simply pass a literal map and check the literal output map.

### Discard the throwaway example

The `process-employees` snippet above is isolated. We will now add a slightly modified version directly into our test file as a demonstration of the pattern.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Append to the existing file.
- **Dependencies**: None.

### The New Code

```clojure
(defn process-employees [employees]
  (->> employees
       (filter #(> (:salary %) 70000))
       (map #(update % :salary * 1.1))
       (sort-by :salary >)))

(deftest test-process-employees
  (let [employees [{:name "Alice" :salary 95000}
                   {:name "Bob"   :salary 62000}
                   {:name "Carol" :salary 88000}]
        result (process-employees employees)]
    (testing "filters out low earners"
      (is (= 2 (count result))))
    (testing "applies 10% raise"
      (is (= 104500.0 (:salary (first result)))))
    (testing "sorts by salary descending"
      (is (= "Alice" (:name (first result)))))))
```

### The Updated Project

```clojure
// ... existing tests ...

// ← new
(defn process-employees [employees]
  (->> employees
       (filter #(> (:salary %) 70000))
       (map #(update % :salary * 1.1))
       (sort-by :salary >)))

(deftest test-process-employees
  (let [employees [{:name "Alice" :salary 95000}
                   {:name "Bob"   :salary 62000}
                   {:name "Carol" :salary 88000}]
        result (process-employees employees)]
    (testing "filters out low earners"
      (is (= 2 (count result))))
    (testing "applies 10% raise"
      (is (= 104500.0 (:salary (first result)))))
    (testing "sorts by salary descending"
      (is (= "Alice" (:name (first result)))))))

(run-tests)
```

The updated file defines a pure function and its test suite. The test defines local data, executes the function once, and makes multiple assertions against the immutable result.

### Mechanical Walkthrough

- `defn process-employees`: Defines a **Pure Function**. It takes data and returns data.
- `->>`: The thread-last macro, used to pipe the collection through a series of transformations.
- `filter`: Iterates over `employees`, applying the anonymous predicate function `#(> (:salary %) 70000)`. It returns a sequence excluding Bob.
- `map`: Applies the anonymous update function `#(update % :salary * 1.1)` to each remaining employee.
- `update`: Takes a map (the employee), the key `:salary`, and the function `*` with argument `1.1`. It calculates the new salary and returns a new employee map.
- `sort-by`: Sorts the final sequence by the `:salary` key in descending order using the `>` comparator.
- `let`: In the test, `let` defines `employees` as a literal list of maps. It then calls `process-employees` and binds the return value to `result`. Because data in Clojure is immutable, `result` is a stable snapshot of the output. We can safely assert against `result` multiple times in successive `testing` blocks without worrying about **Side Effect**s altering the state mid-test.

---

## Concept Unit: Testing with atoms (stateful code)

### The Problem

Sometimes functions *do* have to manage state — like an in-memory counter or connection pool. If state is global, test A might increment a counter, causing test B to fail because it expected the counter to be zero. How do we test stateful code without tests interfering with one another?

> If a function updates an external variable, how do you ensure the variable is fresh for every test run? What if the state isn't global, but is instantiated per-test?

### Introduce the concept in isolation

Let's create a counter using a local **Atom**.

```clojure
(defn make-counter []
  (let [n (atom 0)]
    {:inc! #(swap! n inc)
     :dec! #(swap! n dec)
     :value #(deref n)}))

(def my-counter (make-counter))
((my-counter :inc!))
((my-counter :value))
```

**Output:**
```
1
```

This proves that `make-counter` returns a map of functions that all close over a local **Atom** `n`. The state is encapsulated. Calling `make-counter` again creates a brand-new, independent atom.

### Discard the throwaway example

The manual execution is discarded. We will codify this in a test.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Append to the existing file.
- **Dependencies**: None.

### The New Code

```clojure
(defn make-counter []
  (let [n (atom 0)]
    {:inc! #(swap! n inc)
     :dec! #(swap! n dec)
     :value #(deref n)}))

(deftest test-counter
  (let [c (make-counter)]
    (is (= 0 ((c :value))))
    ((c :inc!))
    ((c :inc!))
    (is (= 2 ((c :value))))
    ((c :dec!))
    (is (= 1 ((c :value))))))
```

### The Updated Project

```clojure
// ... test-process-employees ...

// ← new
(defn make-counter []
  (let [n (atom 0)]
    {:inc! #(swap! n inc)
     :dec! #(swap! n dec)
     :value #(deref n)}))

(deftest test-counter
  (let [c (make-counter)]
    (is (= 0 ((c :value))))
    ((c :inc!))
    ((c :inc!))
    (is (= 2 ((c :value))))
    ((c :dec!))
    (is (= 1 ((c :value))))))

(run-tests)
```

The updated project defines a stateful object generator and a test that exercises it sequentially.

### Mechanical Walkthrough

- `make-counter`: A function returning a map of closures.
- `atom`: Creates a new **Atom** initialized to 0. Because it is created inside the `let` of `make-counter`, it is local state, not a global variable.
- `swap!`: Atomically updates the atom's state using the `inc` or `dec` functions.
- `deref`: Reads the current value of the atom.
- `let [c (make-counter)]`: In the test, we call `make-counter`. This generates a *fresh* atom specifically for this test run. The test can freely execute side-effecting functions `((c :inc!))` because the state is isolated. Test parallelization is completely safe because no two tests share the same atom. Clojure's pattern of "local atoms in closures" avoids the test-contamination problems inherent in global mutable state.

---

## Concept Unit: `clojure.spec` — specifying data shapes

### The Problem

We tested `process-employees` with a hardcoded list of maps. But how do we guarantee that an employee map always has a `:name` string and a `:salary` positive number? **Example-Based Testing** only tests the exact maps we type. We need a way to formally define the shape of valid data and validate it.

> How do you ensure that a map conforms to a rigid schema? If you write a custom function to check every key, how do you report exactly which key failed?

### Introduce the concept in isolation

Let's use `clojure.spec.alpha` to define a schema.

```clojure
(require '[clojure.spec.alpha :as s])

(s/def ::salary (s/and number? pos?))

(s/valid? ::salary 95000)
(s/valid? ::salary -100)
(s/explain ::salary -100)
```

**Output:**
```
true
false
val: -100 fails spec: :user/salary predicate: pos?
nil
```

This proves that `s/def` registers a rule under the keyword `::salary`. `s/valid?` returns a boolean indicating if the data conforms. When we pass invalid data, `s/explain` prints exactly why it failed: the value `-100` failed the `pos?` predicate.

### Discard the throwaway example

The throwaway namespace validation is discarded. We will define full specs in our file.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Top of file (require) and bottom of file (specs).
- **Dependencies**: Requires `clojure.spec.alpha`.

### The New Code

```clojure
(require '[clojure.spec.alpha :as s])

(s/def ::name string?)
(s/def ::salary (s/and number? pos?))
(s/def ::dept keyword?)
(s/def ::employee (s/keys :req [::name ::salary ::dept]))
```

### The Updated Project

```clojure
(ns my-project.core-test
  (:require [clojure.test :refer [deftest is are testing run-tests]]
            [clojure.string :as string]
            [clojure.spec.alpha :as s])) // ← new require

// ... existing tests ...

// ← new
(s/def ::name string?)
(s/def ::salary (s/and number? pos?))
(s/def ::dept keyword?)
(s/def ::employee (s/keys :req [::name ::salary ::dept]))
```

The updated file registers specifications for the employee data model. Note that because `::keyword` syntax creates namespace-qualified keywords, the keys for a valid map must match the namespace where the spec is defined (e.g., `:my-project.core-test/name`).

### Mechanical Walkthrough

- `s/def`: A **Macro** that adds a spec to the global registry.
- `::name string?`: Maps the namespaced keyword `::name` to the predicate function `string?`.
- `s/and`: A spec combinator. `(s/and number? pos?)` means a value must satisfy both predicates: it must be a number, and it must be positive.
- `s/keys`: A spec for maps. `:req [::name ::salary ::dept]` dictates that any map validated against `::employee` must contain exactly those fully-qualified keys, and the values at those keys must pass their respective registered specs.

---

## Concept Unit: Property-based testing with `spec/exercise`

### The Problem

Even with specs, writing test cases manually means you only test the inputs you think of. You might forget to test empty strings, negative numbers, or extremely large values. We want the computer to generate random valid inputs based on our specs and throw them at our functions to find edge cases we missed.

> If you define a rule that "addition is commutative" (`a + b == b + a`), how many pairs of numbers do you need to test to be sure? How can you automate generating those pairs?

### Introduce the concept in isolation

We can use `s/exercise` to ask Spec to generate random valid data for us.

```clojure
(require '[clojure.spec.alpha :as s])
(s/def ::salary (s/and number? pos?))
(s/exercise ::salary 5)
```

**Output:**
```
([1 1] [1.5 1.5] [2 2] [0.5 0.5] [3.125 3.125])
```

This proves that `s/exercise` reads the registered spec for `::salary` and automatically generates a list of 5 valid examples. The return value is a list of pairs `[generated-value conformed-value]`. This capability shifts us from **Example-Based Testing** to **Property-Based Testing**, where we use these generators to bombard our functions with hundreds of random inputs.

### Discard the throwaway example

The manual exercise call is discarded. We will write a property-based test.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `src/my_project/core_test.clj`.
- **Change type**: Add.
- **Location**: Append to the existing file.
- **Dependencies**: None.

### The New Code

```clojure
(defn prop-commutative [a b]
  (= (+ a b) (+ b a)))

(deftest test-addition-property
  (let [results (for [_ (range 100)]
                  (let [a (rand-int 1000)
                        b (rand-int 1000)]
                    (prop-commutative a b)))]
    (is (every? true? results))))
```

### The Updated Project

```clojure
// ... existing specs ...

// ← new
(defn prop-commutative [a b]
  (= (+ a b) (+ b a)))

(deftest test-addition-property
  (let [results (for [_ (range 100)]
                  (let [a (rand-int 1000)
                        b (rand-int 1000)]
                    (prop-commutative a b)))]
    (is (every? true? results))))

(run-tests)
```

The updated project defines a property (that addition order doesn't matter) and a test that randomly generates 100 integer pairs to verify the property holds true in all tested cases.

### Mechanical Walkthrough

- `prop-commutative`: A predicate function defining the core invariant: `a + b` must equal `b + a`. This is the "property" in **Property-Based Testing**.
- `for`: A list comprehension macro. `(for [_ (range 100)] ...)` loops 100 times, collecting the result of the inner expression into a sequence.
- `rand-int`: Generates a random integer between 0 and 999. In a full testing setup, we would use `clojure.spec.test.alpha/check` to automatically use Spec generators, but generating random data manually illustrates the exact same concept.
- `every? true?`: A core function call that asserts every item in the `results` sequence is exactly `true`. If even one random combination of `a` and `b` failed the commutative property, this would return `false` and the `is` macro would report the failure.

---

Closing: Testing in Clojure is straightforward because of immutable data and pure functions. The same functional thinking that makes code easy to write makes it easy to test. Lesson 49 starts the capstone data pipeline project. Exercises including writing a test suite for the set operations from Lesson 14 (translated to Clojure) and adding spec validation to the employee data pipeline.
