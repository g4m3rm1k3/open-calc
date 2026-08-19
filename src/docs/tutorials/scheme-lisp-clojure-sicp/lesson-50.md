# Lesson 50: Capstone Part 2 — A Complete Clojure Tool (and Series Finale)

**What you will build**
The reader will complete the sales pipeline into a working command-line tool: reading from a real CSV file on disk, writing a report to a file, handling errors gracefully with `try`/`catch`, adding a `-main` entry point, and running it from the terminal. Then the lesson closes with a reflection on the entire journey. The transferable problems: (1) a real tool reads input, transforms it, and writes output — the pipeline pattern from Part 1 now touches the file system; (2) error handling at the boundary (IO) keeps the pure core clean; (3) the `-main` entry point with argument parsing makes the tool usable from the command line.

**What you need to know first**
- Lessons 0–49 (the complete curriculum).

**Terms used in this lesson**
- **`when-let`** — A conditional binding construct. Like `if-let`, it binds a value to a symbol, but it only has a "then" branch. If the bound value is truthy, it evaluates the body; if falsy (nil or false), it returns nil immediately. This prevents deeply nested if-statements when dealing with potentially absent values.
- **`:gen-class`** — A namespace directive that instructs the Clojure compiler to generate a compiled Java class file for the namespace. This is required to create a standard Java entry point (`public static void main`) so the tool can be invoked from the command line.
- **`with-out-str`** — A macro that captures all standard output (like `print` or `println` calls) within its body and returns it as a string, instead of writing it to the console. This solves the problem of transforming side-effecting print functions into pure-ish functions that return strings.
- **`spit`** — The counterpart to `slurp`. It opens a file, writes a string to it, and closes the file. It solves the problem of boilerplate-heavy Java file IO by providing a single, atomic write operation.
- **`slurp`** — A function that opens a file, reads its entire contents into a string, and closes it. It solves the problem of reading whole files without manual stream management.
- **`try`** / **`catch`** — The standard exception handling mechanism. It solves the problem of program crashes on predictable boundary failures (like missing files) by allowing the program to intercept specific exception types and execute fallback logic.
- **`case`** — A conditional branching construct similar to a switch statement. It matches an expression against constant values in constant time. It solves the problem of writing long `cond` or `if` chains when matching against exact known values (like the count of arguments).

**Objects and methods used**

- **`System/exit`**
  - *What it is:* A Java runtime method to terminate the current Java Virtual Machine.
  - *Implementation:* `public static void exit(int status)`
  - *Its use:* To return an error code (like `1`) to the operating system when the user provides invalid arguments or a file operation fails, signaling that the command-line tool did not complete successfully.
  - *Type:* `static` method on `java.lang.System`.
  - *Responsibility:* Immediately halts the entire JVM process and passes the provided integer status code back to the host OS.
  - *Depends on:* An integer status code (0 for success, non-zero for error).
  - *Connects to:* Called by the Clojure `-main` function; connects outward to the host OS.
  - *Shape:* A process-level boundary exit point.

- **`java.io.FileNotFoundException`**
  - *What it is:* An exception signaling that an attempt to open a file denoted by a specified pathname has failed.
  - *Implementation:* `public class FileNotFoundException extends IOException`
  - *Its use:* Caught in our `read-csv-file` function to gracefully handle the user providing a path to a non-existent file.
  - *Type:* Class extending `IOException`.
  - *Responsibility:* Represents the failure mode of a file read operation where the target path does not exist or is inaccessible.
  - *Depends on:* The underlying OS file system rejecting the file open request.
  - *Connects to:* Thrown by `slurp`'s internal Java file readers; caught by our `try`/`catch` block.
  - *Shape:* An error boundary representing an IO failure.

- **`java.io.IOException`**
  - *What it is:* The base exception class for general input/output failures.
  - *Implementation:* `public class IOException extends Exception`
  - *Its use:* Caught during our `write-report` function to handle issues like full disks or permission errors when attempting to save the file.
  - *Type:* Class extending `Exception`.
  - *Responsibility:* Represents broad failures in reading or writing data to an external resource.
  - *Depends on:* IO operations failing at the OS or hardware level.
  - *Connects to:* Thrown by `spit`; caught by our `write-report` error handler.
  - *Shape:* An error boundary for output failures.

## Concept Unit: Reading a CSV from disk

### The Problem

We have a pure data pipeline that expects CSV string input and returns structured maps. But a real command-line tool doesn't start with strings in memory; it starts with file paths. How do we safely bridge the physical file system (which can fail if the file is missing) to our pure logic?

> **Socratic prompt:** Given what you know about Clojure's `slurp` from earlier lessons, what happens if you call `(slurp "missing.csv")`? How would you catch that failure before it crashes the entire program, and what should the function return if the file isn't there?

### Concept Isolation: try/catch and when-let

Let's test handling a missing file and conditionally processing it using throwaway code.

```clojure
(defn throwaway-read [path]
  (try
    (slurp path)
    (catch java.io.FileNotFoundException e
      (println "File missing!")
      nil)))

(when-let [content (throwaway-read "fake.txt")]
  (println "I read:" content))
```

**Output:**
```
File missing!
nil
```

**What this proves:** The `try`/`catch` block successfully intercepted the `java.io.FileNotFoundException` thrown by `slurp`, printed a warning, and returned `nil`. The `when-let` binding saw that `content` was `nil` (falsy) and completely skipped its body, avoiding a crash.

### Discard Throwaway

The `throwaway-read` function is deleted. We will write the real implementation now.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are wiring our core logic to the host system.
- **Files affected:** `src/sales_pipeline/core.clj` (modified)
- **Change type:** Add
- **Location:** At the top of the file (namespace declaration) and below our pure data transformation functions.
- **Dependencies:** None.

### The New Code

```clojure
(ns sales-pipeline.core
  (:require [clojure.string :as str])
  (:gen-class))

(defn read-csv-file [path]
  (try
    (slurp path)
    (catch java.io.FileNotFoundException e
      (println "Error: File not found:" path)
      nil)))

(defn load-records [path]
  (when-let [csv (read-csv-file path)]
    (->> csv
         parse-csv
         (map parse-record))))
```

### The Updated Project

```clojure
(ns sales-pipeline.core
  (:require [clojure.string :as str])
  (:gen-class)) ; ← new

;; ... (previous data transformation functions parse-csv, parse-record)

;; ← new functions below
(defn read-csv-file [path]
  (try
    (slurp path)
    (catch java.io.FileNotFoundException e
      (println "Error: File not found:" path)
      nil)))

(defn load-records [path]
  (when-let [csv (read-csv-file path)]
    (->> csv
         parse-csv
         (map parse-record))))
```
The file now explicitly generates a Java class via `:gen-class` and provides functions that safely load and parse physical files into records.

### Mechanical Walkthrough

- **`(:gen-class)`**: A directive in the `ns` macro. It tells the Clojure compiler to emit a real `.class` file for this namespace on the JVM, which is necessary for the Java runtime to find a `public static void main` entry point when we run the tool.
- **`try`**: A special form that evaluates its body and sets up exception handlers.
- **`(slurp path)`**: Attempts to read the entire file at `path` into a string. If the file is missing, the underlying Java IO throws a `java.io.FileNotFoundException`.
- **`(catch java.io.FileNotFoundException e ...)`**: Intercepts that specific exception type, binding it to the symbol `e`.
- **`nil`**: The last expression in the `catch` block. If the catch executes, `read-csv-file` returns `nil`.
- **`(when-let [csv (read-csv-file path)] ...)`**: Evaluates `(read-csv-file path)`. If it returns a string (truthy), it binds that string to `csv` and evaluates the body (the threading macro). If it returns `nil` (falsy), it immediately returns `nil`.
- **`(->> csv ...)`**: The thread-last macro passes the CSV string into `parse-csv`, and then maps `parse-record` over the result.

### CS Lens

This implements the **Functional Core, Imperative Shell** pattern. The IO (reading the file, handling errors) is pushed to the outer boundary (`read-csv-file`, `load-records`), keeping the data transformation (`parse-csv`, `parse-record`) as pure functions that know nothing about the file system.
Also recognized in: Hexagonal Architecture, Ports and Adapters, clean architecture boundaries.

### SE Lens

By returning `nil` on failure and using `when-let`, we chose **nil-punning** over **exception propagation**. The alternative was letting the exception bubble up to the caller. Nil-punning keeps the code concise but loses error context (the caller doesn't know *why* it failed, only that it did). For a simple script, this is a reasonable tradeoff; in a large application, we would return explicit error types or monadic Results.

### Commands Needed

None yet, this is internal code.

### Execution Trace

1. `(load-records "sales.csv")` — caller requests records.
2. `(read-csv-file "sales.csv")` — file exists, `slurp` reads it. Returns a string.
3. `when-let` binds the string to `csv`.
4. `->>` passes the string to `parse-csv`, then to `map parse-record`.
5. Returns a list of maps.

## Concept Unit: Writing the report to a file

### The Problem

Our `print-report` function from Lesson 49 prints directly to standard output. If the user wants to save that report to a file, we need a way to capture that printed output into a string, and then write that string to disk.

> **Socratic prompt:** How do you capture side-effects? If a function calls `println`, it returns `nil`. What mechanism would you need to intercept those prints and gather them into a string?

### Concept Isolation: with-out-str and spit

Let's test capturing output and writing it.

```clojure
(def captured (with-out-str (println "Hello") (println "World")))
(spit "throwaway.txt" captured)
(println "Captured string was:" captured)
```

**Output:**
```
Captured string was: Hello
World
```

**What this proves:** `with-out-str` successfully intercepted the two `println` calls, preventing them from hitting the console, and instead returned their output as a single string. `spit` then wrote that string to a file.

### Discard Throwaway

The code and `throwaway.txt` are discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj` (modified)
- **Change type:** Add
- **Location:** Below `load-records`.
- **Dependencies:** `print-report` from Lesson 49.

### The New Code

```clojure
(defn format-report [records]
  (with-out-str
    (print-report records)))

(defn write-report [records output-path]
  (try
    (spit output-path (format-report records))
    (println "Report written to:" output-path)
    (catch java.io.IOException e
      (println "Error writing file:" (.getMessage e)))))
```

### The Updated Project

```clojure
(defn load-records [path]
  (when-let [csv (read-csv-file path)]
    (->> csv
         parse-csv
         (map parse-record))))

;; ← new functions below
(defn format-report [records]
  (with-out-str
    (print-report records)))

(defn write-report [records output-path]
  (try
    (spit output-path (format-report records))
    (println "Report written to:" output-path)
    (catch java.io.IOException e
      (println "Error writing file:" (.getMessage e)))))
```
The namespace now has the capability to format records into a string block and safely write that block out to disk.

### Mechanical Walkthrough

- **`(with-out-str ...)`**: A macro that temporarily rebinds the standard output stream (`*out*`) to a string writer, evaluates its body (`print-report`), and returns the accumulated string.
- **`(print-report records)`**: Called inside `with-out-str`. Its side-effects are captured.
- **`(spit output-path ...)`**: Opens the file at `output-path` for writing, writes the string, and closes it.
- **`(catch java.io.IOException e ...)`**: Intercepts generic IO failures (like permission denied).
- **`(.getMessage e)`**: A Java interop method call. It calls `getMessage()` on the exception object `e` to retrieve the underlying error string.

### CS Lens

`with-out-str` demonstrates **Dynamic Scoping** (rebinding a global variable like `*out*` for the duration of a call stack).
Also recognized in: Unix file redirection (`>`), thread-local variables.

### SE Lens

We chose to reuse `print-report` by capturing its output rather than rewriting a pure string-building function. The tradeoff is efficiency (capturing IO streams is slightly heavier than pure string concatenation) but it maximizes code reuse.

### Commands Needed

None yet.

### Execution Trace

1. `(write-report records "out.txt")`
2. `(format-report records)` calls `with-out-str`.
3. `print-report` prints to the captured stream.
4. `format-report` returns the final string.
5. `spit` writes the string to `"out.txt"`.
6. Output success message.

## Concept Unit: Argument parsing and `-main`

### The Problem

A Clojure file is just a library of functions. To run it from a terminal as a command-line tool, we need a standard entry point that the JVM recognizes, and we need to route the command-line arguments (the input CSV and optional output file) to our logic.

> **Socratic prompt:** If you receive an array of string arguments from the terminal, how do you cleanly branch based on whether the user provided 0, 1, or 2 arguments?

### Concept Isolation: case and System/exit

Let's test branching on argument count and exiting.

```clojure
(defn throwaway-main [& args]
  (case (count args)
    1 (println "One arg:" (first args))
    2 (println "Two args!")
    (do (println "Wrong number of args.")
        (System/exit 1))))

(throwaway-main "a")
```

**Output:**
```
One arg: a
```

**What this proves:** The `case` statement correctly branched based on `(count args)`. The varargs syntax `& args` collected the arguments into a list. `System/exit` terminates the process if the catch-all branch is hit (note: we don't run the exit in the REPL here to avoid killing our REPL session).

### Discard Throwaway

Discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj` (modified)
- **Change type:** Add
- **Location:** Bottom of the file.
- **Dependencies:** All previous functions.

### The New Code

```clojure
(defn -main [& args]
  (case (count args)
    0 (println "Usage: clj -M -m sales-pipeline.core <input.csv> [output.txt]")
    1 (let [records (load-records (first args))]
        (if records
          (print-report records)
          (System/exit 1)))
    2 (let [[input output] args
             records (load-records input)]
        (if records
          (write-report records output)
          (System/exit 1)))
    (println "Too many arguments.")))
```

### The Updated Project

```clojure
;; ... (write-report function)

;; ← new function below
(defn -main [& args]
  (case (count args)
    0 (println "Usage: clj -M -m sales-pipeline.core <input.csv> [output.txt]")
    1 (let [records (load-records (first args))]
        (if records
          (print-report records)
          (System/exit 1)))
    2 (let [[input output] args
             records (load-records input)]
        (if records
          (write-report records output)
          (System/exit 1)))
    (println "Too many arguments.")))
```
The file now has a definitive entry point that handles user input and routes to our pipeline.

### Mechanical Walkthrough

- **`(defn -main [& args] ...)`**: The hyphen in `-main` is a Clojure convention. Combined with `(:gen-class)`, this tells the compiler to map this function to the Java `public static void main(String[] args)` method. `& args` gathers all arguments into a sequence.
- **`(case (count args) ...)`**: Evaluates `(count args)`, then compares the result against the constant values `0`, `1`, `2`.
- **`0 (...)`**: If count is 0, print the usage instructions.
- **`1 (...)`**: If count is 1, bind `records` to the result of `load-records`. If `records` is truthy (not nil, meaning the file loaded successfully), print the report to the console. Otherwise, exit with status `1`.
- **`2 (let [[input output] args ...])`**: If count is 2, destruct the `args` sequence into `input` and `output` variables. Load records, and if successful, call `write-report`.
- **`(println "Too many arguments.")`**: The default fallback branch if no case matches.
- **`(System/exit 1)`**: A static method call to Java's `System` class, forcefully exiting the JVM with an error status.

### CS Lens

This is a **Command-Line Interface Boundary**. The arguments are untyped strings; the `-main` function acts as a router to parse intent, validate state, and invoke the pure core.

### SE Lens

We explicitly call `System/exit 1` on failure instead of just letting the function end. This is critical for shell scripting: other programs relying on this tool check the exit code to know if it succeeded (0) or failed (1).

### Commands Needed

To run the tool:
`clj -M -m sales-pipeline.core sales.csv` (1 argument)
`clj -M -m sales-pipeline.core sales.csv report.txt` (2 arguments)

### Execution Trace

1. User runs `clj -M -m sales-pipeline.core sales.csv report.txt`
2. `-main` receives `args = ("sales.csv" "report.txt")`
3. `(count args)` evaluates to 2.
4. `case` executes the `2` branch.
5. Destructuring assigns `input = "sales.csv"`, `output = "report.txt"`.
6. `load-records` parses the file.
7. `write-report` writes the file.

## Concept Unit: The complete project structure

### The Problem

We have a bunch of source code, test code, and configuration, but how does it all fit together in a real repository?

### Concept Isolation

No throwaway code for project structure.

### Discard Throwaway

N/A.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Entire project tree.
- **Change type:** Configuration
- **Location:** Root directory.
- **Dependencies:** None.

### The New Code

Show the full project as a directory tree:
```
sales-pipeline/
  deps.edn
  src/
    sales_pipeline/
      core.clj     <- main namespace with all functions
  test/
    sales_pipeline/
      core_test.clj  <- unit tests
  data/
    sales.csv      <- sample data
  README.md
```

Show the complete `deps.edn`:
```edn
{:paths ["src"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}}
 :aliases {:run {:main-opts ["-m" "sales-pipeline.core"]}
           :test {:extra-paths ["test"]
                  :extra-deps {io.github.cognitect-labs/test-runner
                               {:git/tag "v0.5.1"
                                :git/sha "dfb30dd"}}}}}
```

Show the complete test file (`test/sales_pipeline/core_test.clj`):
```clojure
(ns sales-pipeline.core-test
  (:require [clojure.test :refer [deftest is testing]]
            [sales-pipeline.core :as core]))

(def sample-records
  [{:date "2024-01-15" :region "North" :product "Widget-A"
    :quantity 100 :unit-price 9.99 :revenue 999.0}
   {:date "2024-01-15" :region "South" :product "Widget-B"
    :quantity 50 :unit-price 14.99 :revenue 749.5}])

(deftest test-revenue-by-region
  (let [result (core/revenue-by-region sample-records)]
    (testing "returns one entry per region"
      (is (= 2 (count result))))
    (testing "highest revenue region is first"
      (is (= "North" (:region (first result)))))
    (testing "computes correct total revenue"
      (is (= 999.0 (:total-revenue (first result)))))))
```

### The Updated Project

The code above represents the final, complete project.

### Mechanical Walkthrough

- **`deps.edn`**: The configuration file holding our library dependencies (Clojure itself) and command aliases.
- **`:run` alias**: Defines `clj -M:run` as a shortcut for running our main namespace.
- **`:test` alias**: Wires up the external test runner so `clj -M:test` executes the `core_test.clj` logic.
- **`src` vs `test` directories**: Standard JVM layout separating production code from verification code.

### CS Lens

This layout adheres to **Standard Package Conventions**. Predictability in layout allows tooling (build tools, test runners, IDEs) to operate with zero configuration.

### SE Lens

We externalized configuration into `deps.edn`. The alternative is having build scripts manually invoke the compiler with long classpaths. Using a standard tool (`clj`) means any other Clojure developer can instantly run and test this project.

### Commands Needed

Run tests: `clj -M:test`
Run app via alias: `clj -M:run data/sales.csv`

### Execution Trace

Not applicable for structural layout.

## Concept Unit: A reflection on the full curriculum — what was learned

### The Problem

We have reached the end. How do the 50 lessons of Scheme, logic programming, the metacircular evaluator, and Clojure connect?

### Concept Isolation

N/A.

### Discard Throwaway

N/A.

### Project Change

N/A.

### The New Code

The reader has traveled from:
- S-expressions and the REPL (Lesson 0)
- Cons cells and box-and-pointer diagrams (Lesson 1)
- Structural recursion and the Four Commandments (Lessons 5–8)
- Higher-order functions (Lessons 7, 13)
- Association lists as the origin of environments (Lesson 15)
- `let`, `letrec`, named let, tail calls (Lessons 16–18)
- Continuations and `call/cc` (Lessons 19–20)
- Macros (Lessons 21, 43)
- Streams (Lessons 22, 36, 44)
- Logic programming with miniKanren (Lessons 23–26)
- SICP: abstraction, processes, data abstraction, streams, assignment, the metacircular evaluator (Lessons 27–38)
- Clojure: persistent data, protocols, atoms, Java interop, namespaces, testing, this pipeline (Lessons 39–50)

### The Updated Project

The project is the developer's mind.

### Mechanical Walkthrough

The **IDEAS** that recur everywhere:
1. **Recursion as universal structure** — lists, numbers, trees, environments, programs are all recursive. The same structural recursion pattern solves all of them.
2. **Data is code, code is data** — the same cons cells that hold data hold programs. The metacircular evaluator proved this.
3. **Abstraction barriers** — separate what from how. Used in data abstraction (Lesson 30), protocols (Lesson 45), generic operations (Lesson 33), and test design (Lesson 48).
4. **Pure functions and controlled mutation** — pure functions for logic, controlled mutation (atoms) for state. The same tension SICP identified in Chapter 3.
5. **Laziness** — compute only what you need. Streams (Lesson 22), Clojure lazy seqs (Lesson 44), miniKanren's search (Lesson 25).

### CS Lens

This entire series has been a study in **Homoiconicity** and **Metalinguistic Abstraction** — a language whose primary capability is extending itself to become the language you wish you had.

### SE Lens

We chose Lisp not just for history, but for leverage. The structural simplicity of S-expressions removes syntactic noise, forcing the developer to focus directly on data structures, evaluation models, and system boundaries.

### Commands Needed

N/A.

### Execution Trace

N/A.

## Where to go next

Present a clear, opinionated reading list and project list:

**Next books:**
- *Structure and Interpretation of Computer Programs* (Abelson & Sussman) — reread it now. You will see everything differently.
- *Clojure for the Brave and True* (Daniel Higginbotham) — free online, practical Clojure
- *Programming Clojure* (Halloway & Bedra) — more depth on the JVM side
- *The Joy of Clojure* (Fogus & Houser) — advanced idioms
- *Purely Functional Data Structures* (Okasaki) — the theory behind Clojure's persistent collections

**Next projects:**
- Build a Clojure web service using Ring and Compojure
- Build a Datomic-backed data application
- Extend this pipeline: add a SQLite backend with `clojure.java.jdbc`
- Implement a tiny Prolog interpreter in Scheme (apply Lessons 23–26)
- Read a Scheme implementation in C (Chibi-Scheme) and trace the eval/apply cycle in a real C interpreter

**Core ideas to keep developing:**
- Functional architecture — keep pure functions at the core, push IO to the edges
- The relational mindset from miniKanren — when you design an API, ask: can this run backward?
- Continuations — read about async/await in JavaScript through the lens of CPS (continuation-passing style)

**Closing:** The series is complete. You started with DrRacket and `42`. You can now read SICP, write production Clojure, understand continuations and macros, and reason about recursion, state, and abstraction with precision. The parentheses are not noise — they are the most honest syntax ever invented for the structure of computation. Go build something with them.
