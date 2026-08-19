# Lesson 47: Clojure Namespaces and Project Structure

What you will build: The reader will learn Clojure's namespace system, how to structure a Clojure project with `deps.edn` (Clojure CLI), how to split code across multiple files, and how to use `require`. They will create a small multi-namespace project. The transferable problems: a namespace is a mapping from symbols to vars — it is the mechanism that prevents name collisions between libraries; `require` with `:as` aliasing is the idiomatic way to use another namespace's code; project structure is a convention that every Clojure developer follows.

What you need to know first: Lessons 0–46 (all prior concepts through Clojure functions, protocols, macros, Java interop, atoms).

Terms used in this lesson:
- **Namespace** — a structural container that maps symbols (names) to vars (values or functions), allowing developers to organize code and prevent name collisions across a large application.
- **Symbol** — an identifier used to name a variable or function in Clojure.
- **Var** — a stable reference to a value or function, always belonging to a specific namespace.
- **Alias** — a short, alternative name given to a namespace during a `require` declaration, allowing concise but explicit references to its vars.
- **Clojure CLI** — the command-line tooling used to configure, build, and run Clojure programs.
- **EDN (Extensible Data Notation)** — a data format (a superset of Clojure's data structures) used for configuration files.
- **Entry point** — the top-level function that is called when a program is executed from the command line.
- **Command-line arguments** — sequence of string inputs passed to the entry point function from the host operating system.

Objects and methods used:

- **`ns`**
  - *What it is:* A macro used to define or switch to a namespace.
  - *Implementation:* `(ns name & references)`
  - *Its use:* Used at the top of every Clojure file to declare the file's namespace and import its dependencies.
  - *Type:* Macro
  - *Responsibility:* Creates a new namespace if one does not exist, makes it the current namespace, and processes any `:require` or `:import` clauses.
  - *Depends on:* A namespace name symbol.
  - *Connects to:* Clojure's runtime, altering the `*ns*` dynamic var.
  - *Shape:* A declarative block at the very top of a source file.

- **`ns-name`**
  - *What it is:* A core function that returns the name symbol of a given namespace object.
  - *Implementation:* `(ns-name ns-obj)`
  - *Its use:* Used to inspect which namespace is currently active.
  - *Type:* Function
  - *Responsibility:* Extracts the symbolic name from a namespace object.
  - *Depends on:* A valid namespace object.
  - *Connects to:* A namespace instance.
  - *Shape:* A simple property-extraction call.

- **`*ns*`**
  - *What it is:* A dynamic var that always holds the current namespace object.
  - *Implementation:* `*ns*`
  - *Its use:* Used as a reference to the active namespace environment.
  - *Type:* Dynamic var
  - *Responsibility:* Tracks the context in which new `def` and `defn` evaluations will be interned.
  - *Depends on:* Clojure's dynamic binding environment.
  - *Connects to:* The REPL or runtime evaluator.
  - *Shape:* A globally available dynamic variable.

- **`defn`**
  - *What it is:* A macro that defines a named function and binds it to a var in the current namespace.
  - *Implementation:* `(defn name [params] body)`
  - *Its use:* Used to define public utility functions like `add` and `square`.
  - *Type:* Macro
  - *Responsibility:* Creates a function and registers it as a var in `*ns*`.
  - *Depends on:* A name, a parameter vector, and a body expression.
  - *Connects to:* The active namespace, adding a new symbol-to-var mapping.
  - *Shape:* A top-level declaration statement.

- **`require`**
  - *What it is:* A function (often used as a macro clause inside `ns`) that loads other namespaces.
  - *Implementation:* `(require '[namespace.name :as alias])`
  - *Its use:* Used to make functions from other namespaces available in the current one.
  - *Type:* Function / Macro clause
  - *Responsibility:* Locates the file for the requested namespace, evaluates it if not already loaded, and optionally creates an alias.
  - *Depends on:* A quoted vector describing the namespace to load.
  - *Connects to:* The classpath and the file system to find the requested code.
  - *Shape:* A dependency injection mechanism.

- **`clojure.string/upper-case`**
  - *What it is:* A standard library function that converts a string to uppercase.
  - *Implementation:* `(upper-case s)`
  - *Its use:* Used to demonstrate using a required standard library namespace.
  - *Type:* Function
  - *Responsibility:* Transforms a string into an entirely uppercase equivalent.
  - *Depends on:* A string input.
  - *Connects to:* Java's underlying `String.toUpperCase()` method.
  - *Shape:* A pure data-transformation function.

- **`clojure.string/join`**
  - *What it is:* A standard library function that concatenates a collection of strings.
  - *Implementation:* `(join separator coll)`
  - *Its use:* Used to demonstrate string manipulation capabilities.
  - *Type:* Function
  - *Responsibility:* Inserts a separator string between every element of a collection, returning a single string.
  - *Depends on:* A separator string and a collection of strings.
  - *Connects to:* Java's `StringBuilder` for efficient concatenation.
  - *Shape:* A pure collection-to-string transformation function.

- **`clojure.string/split`**
  - *What it is:* A standard library function that splits a string using a regular expression.
  - *Implementation:* `(split s re)`
  - *Its use:* Used to parse structured string data.
  - *Type:* Function
  - *Responsibility:* Breaks a single string down into a vector of substrings based on a pattern.
  - *Depends on:* A string and a regular expression pattern.
  - *Connects to:* Java's `Pattern` and `Matcher` classes.
  - *Shape:* A string-parsing function.

- **`+`**
  - *What it is:* The core addition function.
  - *Implementation:* `(+ x y)`
  - *Its use:* Used to compute sums in arithmetic examples.
  - *Type:* Function
  - *Responsibility:* Adds numbers together.
  - *Depends on:* Numeric inputs.
  - *Connects to:* The host's numeric operations.
  - *Shape:* A pure mathematical function.

- **`*`**
  - *What it is:* The core multiplication function.
  - *Implementation:* `(* x y)`
  - *Its use:* Used to compute products.
  - *Type:* Function
  - *Responsibility:* Multiplies numbers together.
  - *Depends on:* Numeric inputs.
  - *Connects to:* The host's numeric operations.
  - *Shape:* A pure mathematical function.

- **`/`**
  - *What it is:* The core division function.
  - *Implementation:* `(/ x y)`
  - *Its use:* Used to compute averages.
  - *Type:* Function
  - *Responsibility:* Divides numbers, yielding a fraction if not evenly divisible.
  - *Depends on:* Numeric inputs.
  - *Connects to:* The host's numeric operations.
  - *Shape:* A pure mathematical function.

- **`reduce`**
  - *What it is:* A core higher-order function that aggregates a collection to a single value.
  - *Implementation:* `(reduce f coll)`
  - *Its use:* Used to sum elements for an average calculation.
  - *Type:* Higher-order function
  - *Responsibility:* Applies a function cumulatively to the items of a collection.
  - *Depends on:* A reducing function and a collection.
  - *Connects to:* Iteration over the collection.
  - *Shape:* A functional accumulator.

- **`count`**
  - *What it is:* A core function returning the number of items in a collection.
  - *Implementation:* `(count coll)`
  - *Its use:* Used to find the denominator in an average calculation.
  - *Type:* Function
  - *Responsibility:* Determines the length of sequences and collections.
  - *Depends on:* A collection.
  - *Connects to:* The internal representation of the collection.
  - *Shape:* A pure property-extraction function.

- **`println`**
  - *What it is:* A core IO function for printing text to standard output.
  - *Implementation:* `(println & args)`
  - *Its use:* Used in the entry point to display results.
  - *Type:* Function
  - *Responsibility:* Formats arguments as strings and writes them to the console, followed by a newline.
  - *Depends on:* Any printable objects.
  - *Connects to:* Standard output stream (`*out*`).
  - *Shape:* A side-effecting output call.

- **`map`**
  - *What it is:* A core higher-order function that applies a function to every item in a collection.
  - *Implementation:* `(map f coll)`
  - *Its use:* Used to square a sequence of numbers.
  - *Type:* Higher-order function
  - *Responsibility:* Returns a lazy sequence consisting of the result of applying the function to the items.
  - *Depends on:* A mapping function and one or more collections.
  - *Connects to:* The lazy sequence machinery.
  - *Shape:* A functional sequence transformer.

- **`range`**
  - *What it is:* A core function generating a sequence of numbers.
  - *Implementation:* `(range start end)`
  - *Its use:* Used to generate inputs for the `map` example.
  - *Type:* Function
  - *Responsibility:* Creates a lazy sequence of numbers from start to end.
  - *Depends on:* Numeric boundary values.
  - *Connects to:* The lazy sequence machinery.
  - *Shape:* A sequence generator.

**Everything else in the file, not this lesson's subject but still explained:** None.

## Concept Unit: What a namespace is

### The Problem
When building a large application, naming things becomes difficult. If two different files both define a function named `parse`, they will collide, with the latter definition overwriting the first. We need a way to group functions into distinct, named boundaries.

### Introduce the concept in isolation
We will use the REPL to see how Clojure manages namespaces. A namespace is a mapping from symbols to vars.

```clojure
; Default namespace in the REPL:
(ns-name *ns*)
; => user

; Define a new namespace:
(ns my-project.utils)
; => nil

; Now all defs go into my-project.utils:
(defn add [a b] (+ a b))
; => #'my-project.utils/add
(defn square [x] (* x x))
; => #'my-project.utils/square

; Reference from another namespace:
(ns my-project.core)
; => nil
(require '[my-project.utils :as utils])
; => nil

(utils/add 3 4)
; => 7
(utils/square 5)
; => 25
```

This isolated experiment proves that `ns` switches the active context. The `add` and `square` functions are interned inside `my-project.utils`, so when we switch to `my-project.core`, they are no longer visible by their bare names. We must `require` them and use the `utils/` prefix to access them.

### Discard the throwaway example
This REPL session is discarded. Our real project will use files, not manual REPL switches.

### Project Change
No reference counterpart — this is a from-scratch addition because we are exploring the namespace concept before applying it to our project scaffolding.
Files affected: None yet.
Change type: Concept demonstration.
Location: N/A.
Dependencies: None.

### The New Code
```clojure
(ns my-project.core)
(require '[my-project.utils :as utils])
(utils/add 3 4)
```

### The Updated Project
Because this is an abstract concept unit, the "updated project" is the conceptual shift in the REPL environment:

```clojure
(ns my-project.core)
(require '[my-project.utils :as utils])
;; ← new: The REPL now knows `utils` refers to `my-project.utils`
(utils/add 3 4)
```
The REPL environment now resolves the symbol `utils/add` to the var `#'my-project.utils/add`.

### Mechanical walkthrough
1. `(ns my-project.core)`: `ns` is a macro that sets the active namespace, meaning any new definitions will belong to `my-project.core`.
2. `(require '[my-project.utils :as utils])`: `require` is a function that loads the `my-project.utils` namespace. The vector `[...]` contains the namespace name, and `:as utils` creates a short alias.
3. `(utils/add 3 4)`: `utils/add` calls the `add` function. The `utils/` prefix tells Clojure to look up the function in the `my-project.utils` namespace. `3` and `4` are arguments passed to `add`.

## Concept Unit: The `ns` form in full — the standard file header

### The Problem
Calling `require` and `import` as standalone functions in the middle of a file makes it hard to see what dependencies a file has. We need a standardized, declarative header that sets up the namespace and loads all its dependencies at once.

### Introduce the concept in isolation
We will use the `ns` macro's full capabilities to load Clojure namespaces and Java classes in one place.

```clojure
(ns temp-namespace.core
  (:require [clojure.string :as str])
  (:import [java.io File]))

(str/upper-case "hello")
; => "HELLO"
(str/join ", " ["a" "b" "c"])
; => "a, b, c"
(str/split "a,b,c" #",")
; => ["a" "b" "c"]
```

This isolated experiment proves that the `ns` macro can take optional clauses like `:require` to set up aliases and `:import` to bring Java classes into scope, all before any regular code runs. We use standard library functions from `clojure.string` to demonstrate.

### Discard the throwaway example
The `temp-namespace.core` definition is discarded and will not be used in our project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are demonstrating the declarative syntax of the `ns` macro.
Files affected: None.
Change type: Concept demonstration.
Location: N/A.
Dependencies: None.

### The New Code
```clojure
(ns my-project.core
  (:require [clojure.string :as str]
            [clojure.set :as set]
            [my-project.utils :as utils])
  (:import [java.io File]
           [java.util ArrayList]))
```

### The Updated Project
Because this is an abstract concept unit, the "updated project" is the new declarative header format:

```clojure
(ns my-project.core
  (:require [clojure.string :as str]
            [clojure.set :as set]
            [my-project.utils :as utils])
  (:import [java.io File]
           [java.util ArrayList]))
;; ← new: The namespace is now fully configured declaratively.
```
This is the standard file header convention used in every professional Clojure source file.

### Mechanical walkthrough
1. `(ns my-project.core ...)`: `ns` is the namespace definition macro.
2. `(:require ...)`: The `:require` clause tells the `ns` macro to load external Clojure namespaces.
3. `[clojure.string :as str]`: This vector loads the built-in `clojure.string` namespace and aliases it as `str`.
4. `[clojure.set :as set]`: This vector loads `clojure.set` and aliases it as `set`.
5. `[my-project.utils :as utils]`: This vector loads our custom namespace and aliases it as `utils`.
6. `(:import ...)`: The `:import` clause tells the `ns` macro to make Java classes available without their full package prefixes.
7. `[java.io File]`: Imports the `File` class from the `java.io` package.
8. `[java.util ArrayList]`: Imports the `ArrayList` class from the `java.util` package.

## Concept Unit: Project structure with Clojure CLI (`deps.edn`)

### The Problem
Namespaces alone do not tell the Clojure compiler where to find files on the hard drive, or how to download external libraries. We need a project configuration file to declare our source paths and dependencies.

### Introduce the concept in isolation
We will look at how a basic `deps.edn` file configures a project.

```edn
{:paths ["src" "resources"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}}
 :aliases
 {:test {:extra-paths ["test"]
         :extra-deps {io.github.cognitect-labs/test-runner {:git/tag "v0.5.1"
                                                             :git/sha "dfb30dd"}}}}}
```

This isolated snippet proves that Clojure configuration uses EDN (Extensible Data Notation), a data format similar to JSON but with Clojure's own syntax. It defines where the code lives (`"src"`), what libraries it needs (`org.clojure/clojure`), and optional test configurations.

### Discard the throwaway example
This specific abstract configuration is discarded; we will create our actual project files in a moment.

### Project Change
No reference counterpart — this is a from-scratch addition because we are setting up project scaffolding.
Files affected: `deps.edn` (created).
Change type: Add.
Location: Root directory.
Dependencies: Clojure CLI installed on the system.

### The New Code
```edn
{:paths ["src" "resources"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}}}
```

### The Updated Project
```edn
;; deps.edn
{:paths ["src" "resources"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}}}
;; ← new: The project root now contains a valid deps.edn file.
```
The project root now has a configuration file that the Clojure CLI can read to launch the application.

### Mechanical walkthrough
1. `{ ... }`: The curly braces define an EDN map, representing the top-level configuration.
2. `:paths`: A keyword key mapped to a vector of source directories.
3. `["src" "resources"]`: A vector of strings specifying that Clojure should look for source files in the `src` directory and non-code assets in `resources`.
4. `:deps`: A keyword key mapped to the dependencies map.
5. `{org.clojure/clojure {:mvn/version "1.11.1"}}`: A map declaring that this project requires the Clojure language library version `1.11.1` from Maven (`mvn`).

## Concept Unit: The hyphen-to-underscore convention

### The Problem
Clojure developers prefer to use hyphens in names (`my-project.data-pipeline`). However, Java class names and standard file paths historically forbid hyphens, using underscores instead. If we require `my-project.data-pipeline`, how does Clojure know which file to load?

### Introduce the concept in isolation
We will demonstrate the mapping rule.

```clojure
; Namespace requested:
(require 'my-project.data-pipeline)

; The file path Clojure attempts to load (internally):
; "my_project/data_pipeline.clj"
```

This isolated experiment proves that Clojure converts hyphens `-` to underscores `_` automatically when mapping a namespace symbol to a file path. The periods `.` become directory separators `/`.

### Discard the throwaway example
This abstract mapping is discarded.

### Project Change
No reference counterpart — this is an explanation of a fundamental convention.
Files affected: None.
Change type: Concept demonstration.
Location: N/A.
Dependencies: None.

### The New Code
```
Namespace: my-project.data.pipeline
File path: src/my_project/data/pipeline.clj
```

### The Updated Project
```
my-project/
  deps.edn
  src/
    my_project/
      data/
        pipeline.clj
;; ← new: The file hierarchy maps periods to directories and hyphens to underscores.
```
The file structure reflects the mapping. The `src` directory is the root.

### Mechanical walkthrough
1. `my-project`: The first segment of the namespace. Because it has a hyphen, the directory must be named `my_project` with an underscore.
2. `.data`: A period indicates a nested subdirectory, so we look inside `data/`.
3. `.pipeline`: The final segment corresponds to the filename `pipeline.clj`.

## Concept Unit: `require` variants and `refer`

### The Problem
Using `:as` aliases is clean, but sometimes you use a function so frequently (like `is` from `clojure.test`) that prefixing it every time becomes tedious. We need a way to import specific functions directly into our namespace.

### Introduce the concept in isolation
We will use different forms of the `:require` clause to pull in `clojure.string`.

```clojure
; :as alias (preferred):
(require '[clojure.string :as str])
(str/upper-case "hello")
; => "HELLO"

; :refer -- import specific names directly:
(require '[clojure.string :refer [upper-case join split]])
(upper-case "hello")
; => "HELLO"

; :refer :all -- import everything (AVOID in production):
(require '[clojure.string :refer :all])
(lower-case "HELLO")
; => "hello"

; :reload -- force reload of a namespace
(require '[my-project.utils :as utils] :reload)
; => nil
```

This isolated experiment proves that `:refer [names...]` makes functions available without their namespace prefix. It also shows `:refer :all` (which pollutes the current namespace and is avoided) and `:reload` (which is useful in the REPL when a file has changed on disk).

### Discard the throwaway example
This REPL session is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: None.
Change type: Concept demonstration.
Location: N/A.
Dependencies: None.

### The New Code
```clojure
(require '[clojure.string :refer [upper-case]])
(upper-case "hello")
```

### The Updated Project
```clojure
(require '[clojure.string :refer [upper-case]])
;; ← new: upper-case is now available without a prefix.
(upper-case "hello")
```
The current namespace now contains a direct reference to `upper-case`.

### Mechanical walkthrough
1. `(require ...)`: `require` is the function that loads the namespace.
2. `clojure.string`: The namespace being loaded.
3. `:refer`: A keyword instructing `require` to map specific vars directly into the current namespace.
4. `[upper-case]`: A vector of the specific function names to import.
5. `(upper-case "hello")`: The function can now be called directly.

## Concept Unit: A minimal working multi-file project

### The Problem
We have seen `deps.edn` and the `ns` macro in isolation. We now need to assemble them into a working project with an entry point that can be run from the command line.

### Introduce the concept in isolation
We will create a full, runnable pair of files using the concepts we have learned.

```clojure
;; src/my_project/utils.clj
(ns my-project.utils)

(defn square [x] (* x x))
(defn cube [x] (* x x x))
(defn average [coll] (/ (reduce + coll) (count coll)))
```

```clojure
;; src/my_project/core.clj
(ns my-project.core
  (:require [my-project.utils :as utils]))

(defn -main [& args]
  (println "Squares:" (map utils/square (range 1 6)))
  (println "Average:" (utils/average [1 2 3 4 5])))

;; Running in the shell:
;; $ clj -M -m my-project.core
;; Squares: (1 4 9 16 25)
;; Average: 3
```

This isolated experiment proves that an application can span multiple files, use `require` to share logic, and define a `-main` entry point that the Clojure CLI can execute.

### Discard the throwaway example
This specific implementation is discarded as a throwaway example, though the structure is what we will use moving forward.

### Project Change
No reference counterpart — this is a from-scratch addition because we are creating the actual source files for our project template.
Files affected: `src/my_project/utils.clj`, `src/my_project/core.clj` (created).
Change type: Add.
Location: `src` directory.
Dependencies: `deps.edn` file created earlier.

### The New Code
```clojure
;; src/my_project/utils.clj
(ns my-project.utils)
(defn square [x] (* x x))
(defn average [coll] (/ (reduce + coll) (count coll)))
```

```clojure
;; src/my_project/core.clj
(ns my-project.core
  (:require [my-project.utils :as utils]))

(defn -main [& args]
  (println "Squares:" (map utils/square (range 1 6)))
  (println "Average:" (utils/average [1 2 3 4 5])))
```

### The Updated Project
```clojure
;; src/my_project/core.clj
(ns my-project.core
  (:require [my-project.utils :as utils]))

(defn -main [& args]
;; ← new: The `-main` function acts as the entry point for the command-line tool.
  (println "Squares:" (map utils/square (range 1 6)))
  (println "Average:" (utils/average [1 2 3 4 5])))
```
The project now contains a working, multi-namespace application that can be run from the terminal.

### Mechanical walkthrough
1. `(ns my-project.utils)`: `ns` defines the utility namespace.
2. `(defn square [x] (* x x))`: `defn` creates a public function. `*` is the core multiplication function.
3. `(defn average [coll] ...)`: `defn` creates the average function.
4. `(/ ...)`: `/` is the core division function.
5. `(reduce + coll)`: `reduce` accumulates the values in `coll` using the `+` addition function, computing the sum.
6. `(count coll)`: `count` determines the number of elements in the collection.
7. `(ns my-project.core ...)`: `ns` defines the core namespace.
8. `(:require [my-project.utils :as utils])`: The core namespace explicitly depends on the utils namespace.
9. `(defn -main [& args])`: `defn` defines the `-main` function. The hyphen is a convention indicating it is a public Java-callable method (used by the CLI runner). `& args` collects any command-line arguments into a list.
10. `(println ...)`: `println` prints text and data to standard output.
11. `(map utils/square ...)`: `map` is a higher-order function that applies `utils/square` to each element.
12. `(range 1 6)`: `range` generates a sequence of numbers from 1 up to (but not including) 6, yielding `(1 2 3 4 5)`.

```
Execution Trace for `(map utils/square (range 1 6))`:
Iteration 1: item 1 passed to `square`, returns 1
Iteration 2: item 2 passed to `square`, returns 4
Iteration 3: item 3 passed to `square`, returns 9
Iteration 4: item 4 passed to `square`, returns 16
Iteration 5: item 5 passed to `square`, returns 25
```
Because `map` applies the function to each element successively, the sequence returned is `(1 4 9 16 25)`.

Namespaces and project structure are the scaffolding that turns REPL experiments into production code. Every Clojure library and application follows these conventions. Lesson 48 covers testing, and Lessons 49–50 build the capstone data pipeline as a real project. Exercises include creating a new `deps.edn` project and splitting the employee pipeline from Lesson 41 into a `data` namespace and a `core` namespace.
