# Lesson 45: Clojure Protocols and Records

**What you will build:** You will model a simple geometry system: shapes (circles, rectangles, triangles) implementing an `IShape` protocol with `area`, `perimeter`, and `describe` functions. Along the way, you will solve three transferable problems: (1) using a **protocol** (a named set of functions that different types can implement) as Clojure's answer to Java interfaces, Haskell typeclasses, and SICP's generic operations; (2) using `defrecord` to create named types that are still Clojure maps; and (3) using `extend-protocol` to teach existing types new behaviors without modifying the original type—a clean solution to the expression problem.

**What you need to know first:**
- Lessons 0–44 (all prior concepts through Clojure functions, atoms, macros, lazy sequences).
- SICP's generic operations from Lesson 33 (dispatch tables and the Open-Closed Principle).

**Terms used in this lesson:**
- **Open polymorphism** — the ability to add new types to an existing polymorphic operation without modifying the original code that defined the operation. This prevents the code from becoming a fragile bottleneck.
- **The expression problem** — the fundamental design challenge of being able to define new types and new operations on those types, without modifying existing code and while retaining type safety.
- **Dispatch value** — the object or value whose type determines which specific implementation of a polymorphic function is executed. In Clojure protocols, this is always the first argument.
- **Positional constructor** — a function that creates a new instance of a record by passing arguments in the exact order the fields were declared, rather than using named keys.
- **Java static field/method** — a value or function that belongs to a Java class itself rather than to any specific instance of that class, accessed directly via the class name.

**Objects and methods used:**
- **`defprotocol`**
  - *What it is:* A Clojure macro that defines a named set of polymorphic functions.
  - *Implementation:* `(defprotocol Name (method-1 [this ...]) ...)`
  - *Its use:* Defines the `IShape` contract without providing implementations.
  - *Type:* Macro
  - *Responsibility:* Establishes a named interface with function signatures that dynamically dispatch based on the type of their first argument.
  - *Depends on:* A name for the protocol and one or more function signatures.
  - *Connects to:* Implemented by types using `extend-protocol`, `extend-type`, or directly in `defrecord`.
  - *Shape:* A public API definition boundary.

- **`defrecord`**
  - *What it is:* A Clojure macro that generates a named, map-like type with predefined fields.
  - *Implementation:* `(defrecord Name [field1 field2 ...])`
  - *Its use:* Creates specific shape types like `Circle` and `Rectangle` with fixed data fields.
  - *Type:* Macro
  - *Responsibility:* Generates a host-platform class that implements Clojure's map interfaces, providing fast access to known fields while allowing arbitrary key-value extensions.
  - *Depends on:* A name and a vector of field names.
  - *Connects to:* Instantiated via generated factory functions (`->Name` or `map->Name`).
  - *Shape:* A data structure definition.

- **`extend-protocol`**
  - *What it is:* A Clojure macro that provides concrete implementations of a protocol for one or more types.
  - *Implementation:* `(extend-protocol ProtocolName Type1 (method1 [this] ...) ... Type2 ...)`
  - *Its use:* Teaches `Circle`, `Rectangle`, and standard maps how to satisfy `IShape`.
  - *Type:* Macro
  - *Responsibility:* Wires up the dynamic dispatch table mapping specific types to their concrete implementations of the protocol's functions.
  - *Depends on:* A protocol name, a target type, and function bodies matching the protocol's signatures.
  - *Connects to:* The protocol definition and the types being extended.
  - *Shape:* The glue layer connecting independent types to an independent interface.

- **`Math/PI`**
  - *What it is:* A static field from the underlying Java standard library.
  - *Implementation:* `public static final double PI = 3.141592653589793;`
  - *Its use:* Provides the constant for calculating circle area and perimeter.
  - *Type:* Java `double` constant
  - *Responsibility:* Provides an accurate mathematical representation of pi.
  - *Depends on:* The Java `java.lang.Math` class.
  - *Connects to:* Used in arithmetic expressions within the Clojure code.
  - *Shape:* An external primitive constant.

- **`Math/sqrt`**
  - *What it is:* A static method from the underlying Java standard library.
  - *Implementation:* `public static double sqrt(double a)`
  - *Its use:* Calculates the square root in Heron's formula for triangle area.
  - *Type:* Java `static` method
  - *Responsibility:* Returns the correctly rounded positive square root of a double value.
  - *Depends on:* A single numeric argument passed in.
  - *Connects to:* Used in arithmetic expressions.
  - *Shape:* An external utility function.

---

## Concept Unit: The Problem Protocols Solve — Open Polymorphism

### The Problem

In SICP Lesson 33, we learned about the Open-Closed Principle using dispatch tables to make an `add` function work on different types. We want our functions to behave differently based on the type of data they receive, without modifying the function every time we invent a new type. Without a built-in mechanism, we are forced to write large conditional statements.

### Introduce the concept in isolation

Let's look at the naive, non-polymorphic way to handle different shapes using standard maps and a conditional.

```clojure
(defn naive-area [shape]
  (cond
    (= (:type shape) :circle)    (* Math/PI (:radius shape) (:radius shape))
    (= (:type shape) :rectangle) (* (:width shape) (:height shape))
    :else (throw (Exception. "Unknown shape"))))

(naive-area {:type :circle :radius 5})
;; => 78.53981633974483

(naive-area {:type :triangle :base 10 :height 5})
;; => Execution error (ExceptionInfo) ... Unknown shape
```

This output proves that a closed `cond` cannot handle new types gracefully: when handed a `:triangle`, the function fails entirely. This violation of **open polymorphism** means every time we add a new shape, we must open up the `naive-area` function and modify it. 

### Discard the throwaway example

Delete `naive-area`. It is a closed system that does not scale, and we will not use it in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our geometry module.
- **Files affected:** `src/geometry/core.clj` (Created)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```clojure
(defprotocol IShape
  (area [shape] "Returns the area of the shape")
  (perimeter [shape] "Returns the perimeter")
  (describe [shape] "Returns a description string"))
```

### The Updated Project

```clojure
(ns geometry.core)

;; ← new
(defprotocol IShape
  (area [shape] "Returns the area of the shape")
  (perimeter [shape] "Returns the perimeter")
  (describe [shape] "Returns a description string"))
```

We have established a new namespace and defined the interface for our shape system.

### Mechanical walkthrough

- **`defprotocol`** is a macro that defines a named interface consisting of function signatures. It does not provide any implementation logic; it only declares what operations a type must support to satisfy the protocol.
- **`IShape`** is the name of the protocol we are defining. By convention, protocol names often start with `I` to denote an interface, though this is not strictly required.
- **`(area [shape] "Returns the area of the shape")`** is a method signature. `area` is the name of the polymorphic function. `[shape]` is the parameter list. The first parameter in any protocol function (here, `shape`) is special: it acts as the **dispatch value**. When `area` is called, Clojure checks the type of the argument passed to this position to determine which concrete implementation to run.
- **`"Returns the area of the shape"`** is a docstring describing the method's purpose.

---

## Concept Unit: `defrecord` — Creating Typed Map-Like Values

### The Problem

We need specific concrete types (like circles and rectangles) that can carry data (like radius or width). Plain maps are flexible, but they don't have a distinct nominal "type" that a protocol can dispatch against efficiently. We want a fast, structured data container that is recognized as a specific type by the system.

### Introduce the concept in isolation

We can create a new record type and instantiate it:

```clojure
(defrecord User [username id])

(def u (->User "alice" 101))

(:username u)
;; => "alice"

(map? u)
;; => false

(instance? User u)
;; => true

(assoc u :role "admin")
;; => #user.User{:username "alice", :id 101, :role "admin"}
```

This output proves that a record behaves like a map (we can use keyword lookups and `assoc`), but it has its own distinct type (`User`), allowing for fast field access and type-based dispatch. It is called a **record**.

### Discard the throwaway example

Delete the `User` record and its instantiation. We only needed it to understand how records work.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/geometry/core.clj`
- **Change type:** Add
- **Location:** Below the `IShape` definition.
- **Dependencies:** None.

### The New Code

```clojure
(defrecord Circle [radius])
(defrecord Rectangle [width height])
(defrecord Triangle [a b c])
```

### The Updated Project

```clojure
(defprotocol IShape
  (area [shape] "Returns the area of the shape")
  (perimeter [shape] "Returns the perimeter")
  (describe [shape] "Returns a description string"))

;; ← new
(defrecord Circle [radius])
(defrecord Rectangle [width height])
(defrecord Triangle [a b c])
```

We now have three distinct types representing our geometry data.

### Mechanical walkthrough

- **`defrecord`** is a macro that generates a host-platform class (in this case, a Java class) with the specified fields. It implements Clojure's map interfaces, making it look and act like a map, but optimized for the predefined fields.
- **`Circle`**, **`Rectangle`**, and **`Triangle`** are the type names being created.
- **`[radius]`**, **`[width height]`**, and **`[a b c]`** are vectors defining the fixed fields for each record. 
- Creating a record automatically generates positional constructors, such as **`->Circle`**. `->Circle` accepts a single argument and places it in the `radius` field. `->Rectangle` takes two arguments in the exact order `width` then `height`.

---

## Concept Unit: Implementing a Protocol on a Record

### The Problem

We have an interface (`IShape`) and we have concrete types (`Circle`, `Rectangle`, `Triangle`), but they don't know about each other. We need to wire them together so that calling `area` on a `Circle` executes the math for a circle.

### Introduce the concept in isolation

We can extend a dummy protocol to a simple type:

```clojure
(defprotocol IGreet
  (greet [this]))

(defrecord Robot [model])

(extend-protocol IGreet
  Robot
  (greet [this] (str "Beep boop. I am model " (:model this))))

(greet (->Robot "T-800"))
;; => "Beep boop. I am model T-800"
```

This output proves that `extend-protocol` successfully maps the `greet` function to the `Robot` type. When `greet` is called with a `Robot` instance, the specific implementation provided for `Robot` runs.

### Discard the throwaway example

Delete `IGreet`, `Robot`, and the `extend-protocol` block. We will now apply this to our geometry system.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/geometry/core.clj`
- **Change type:** Add
- **Location:** Below the `defrecord` declarations.
- **Dependencies:** The `IShape` protocol and the `Circle`, `Rectangle`, `Triangle` records.

### The New Code

```clojure
(extend-protocol IShape
  Circle
  (area [{:keys [radius]}]
    (* Math/PI radius radius))
  (perimeter [{:keys [radius]}]
    (* 2 Math/PI radius))
  (describe [{:keys [radius]}]
    (str "Circle with radius " radius))

  Rectangle
  (area [{:keys [width height]}]
    (* width height))
  (perimeter [{:keys [width height]}]
    (* 2 (+ width height)))
  (describe [{:keys [width height]}]
    (str "Rectangle " width "x" height))

  Triangle
  (area [{:keys [a b c]}]
    (let [s (/ (+ a b c) 2.0)]
      (Math/sqrt (* s (- s a) (- s b) (- s c)))))
  (perimeter [{:keys [a b c]}]
    (+ a b c))
  (describe [{:keys [a b c]}]
    (str "Triangle with sides " a ", " b ", " c)))
```

### The Updated Project

```clojure
(defrecord Circle [radius])
(defrecord Rectangle [width height])
(defrecord Triangle [a b c])

;; ← new
(extend-protocol IShape
  Circle
  (area [{:keys [radius]}]
    (* Math/PI radius radius))
  (perimeter [{:keys [radius]}]
    (* 2 Math/PI radius))
  (describe [{:keys [radius]}]
    (str "Circle with radius " radius))
  ;; ... Rectangle and Triangle implementations continue as shown ...
```

Our shape types now fully satisfy the `IShape` protocol, and we can call polymorphic functions on them.

### Mechanical walkthrough

- **`extend-protocol`** is the macro that wires types to protocols. It takes a protocol name (`IShape`), followed by alternating types and blocks of method implementations.
- **`Circle`** is the type being extended. Because it is a record, it maps to a specific generated Java class under the hood.
- **`(area [{:keys [radius]}] ...)`** defines the concrete implementation of the `area` method for a `Circle`. 
- **`{:keys [radius]}`** is map destructuring. Because records behave as maps, we can destructure the first argument (the `this` dispatch value) to pull out the `radius` field directly, instead of writing `(:radius this)`.
- **`Math/PI`** is a static Java field providing the double-precision constant `3.141592653589793`.
- **`Math/sqrt`** is a static Java method that computes the square root. We use it here to apply Heron's formula for the triangle's area.

**Execution trace for `(area (->Circle 5))`:**
```
Step 1: ->Circle 5 evaluates to #geometry.core.Circle{:radius 5}.
Step 2: area is called with this Circle instance as the first argument.
Step 3: Protocol dispatch looks up IShape's area method for the Circle type.
Step 4: The {:keys [radius]} destructures the Circle, binding radius to 5.
Step 5: (* Math/PI 5 5) evaluates to (* 3.141592653589793 25).
Step 6: Returns 78.53981633974483.
```
This is dynamic dispatch happening instantly based on the type of the argument.

---

## Concept Unit: Extending Existing Types — The Expression Problem Solved

### The Problem

We created our own protocol and our own types. But what if we want `IShape` functions to work on plain, standard Clojure maps that someone else created? In object-oriented languages like Java, we cannot make an existing class like `HashMap` implement a new interface without modifying its source code or writing a wrapper. This is **the expression problem**.

### Introduce the concept in isolation

We can extend our `IShape` protocol directly to Clojure's built-in map type:

```clojure
(extend-protocol IShape
  clojure.lang.PersistentArrayMap
  (describe [m] (str "Map shape: " (:type m)))
  (area [m] 0)
  (perimeter [m] 0))

(describe {:type :polygon})
;; => "Map shape: :polygon"
```

This output proves that we just taught the `IShape` protocol to work with plain maps—without modifying the protocol definition, without wrapping the map, and without modifying Clojure's standard library. Clojure solves the expression problem cleanly.

### Discard the throwaway example

Delete the simple map extension. We will write a more comprehensive version for our project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/geometry/core.clj`
- **Change type:** Add
- **Location:** Below the previous `extend-protocol` block.
- **Dependencies:** The `IShape` protocol.

### The New Code

```clojure
(extend-protocol IShape
  clojure.lang.PersistentArrayMap
  (area [m]
    (case (:type m)
      :circle (* Math/PI (:radius m) (:radius m))
      :rect   (* (:width m) (:height m))
      (throw (Exception. "unknown type"))))
  (perimeter [m] nil)
  (describe [m] (str "Map shape: " (:type m))))
```

### The Updated Project

```clojure
  ;; ... previous Triangle implementations ...
  (describe [{:keys [a b c]}]
    (str "Triangle with sides " a ", " b ", " c)))

;; ← new
(extend-protocol IShape
  clojure.lang.PersistentArrayMap
  (area [m]
    (case (:type m)
      :circle (* Math/PI (:radius m) (:radius m))
      :rect   (* (:width m) (:height m))
      (throw (Exception. "unknown type"))))
  (perimeter [m] nil)
  (describe [m] (str "Map shape: " (:type m))))
```

We can now handle plain maps alongside our optimized records.

### Mechanical walkthrough

- **`clojure.lang.PersistentArrayMap`** is the concrete Java class that backs small, literal Clojure maps (like `{:type :circle :radius 3}`).
- **`extend-protocol`** is called again. It adds an entry to `IShape`'s internal dispatch table, mapping `PersistentArrayMap` to the functions provided.
- **`case`** is a macro that checks the value of `(:type m)` and executes the matching branch. If it's `:circle`, it computes the area using the map's `:radius` key. If no branch matches, it falls through to the exception.
- Because a map has no fixed type enforcing what fields exist, we have to rely on keys like `:type`, reverting slightly to the naive approach internally, but it fully satisfies the polymorphic interface from the caller's perspective.

---

## Concept Unit: A Polymorphic Shape Pipeline

### The Problem

We've built a fully polymorphic system, but we haven't seen the payoff: the ability to process a mixed collection of data types without ever checking their type.

### Introduce the concept in isolation

We can map a polymorphic function over a heterogeneous list:

```clojure
(def shapes
  [(->Circle 5)
   (->Rectangle 4 6)
   (->Triangle 3 4 5)
   (->Circle 1)])

(map area shapes)
;; => (78.53981633974483 24 6.0 3.141592653589793)
```

This output proves that `map` walks the list and calls `area` on each item. The `area` function independently decides which calculation to run based on the specific shape it is handed. The calling code (`map`) does not know or care what types are in the list.

### Discard the throwaway example

Delete the simple `map` call. We will write a more involved data transformation pipeline.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/geometry/core.clj`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** The records, the `IShape` protocol, and `extend-protocol`.

### The New Code

```clojure
(def shapes
  [(->Circle 5)
   (->Rectangle 4 6)
   (->Triangle 3 4 5)
   (->Circle 1)])

(def shape-areas
  (->> shapes
       (map area)
       (map #(format "%.2f" %))))

(def sorted-descriptions
  (->> shapes
       (sort-by area)
       (map describe)))
```

### The Updated Project

```clojure
  ;; ... previous PersistentArrayMap extension ...
  (describe [m] (str "Map shape: " (:type m))))

;; ← new
(def shapes
  [(->Circle 5)
   (->Rectangle 4 6)
   (->Triangle 3 4 5)
   (->Circle 1)])

(def shape-areas
  (->> shapes
       (map area)
       (map #(format "%.2f" %))))

(def sorted-descriptions
  (->> shapes
       (sort-by area)
       (map describe)))
```

We have defined a collection of shapes and created two analytical pipelines that operate on them generically.

### Mechanical walkthrough

- **`shapes`** is a vector containing instances of different record types.
- **`->>`** is the thread-last macro, which pipes data through a sequence of functions as their last argument.
- **`(map area)`** applies the polymorphic `area` function to every item in the `shapes` vector. For a circle, it computes pi * r * r. For a rectangle, it computes w * h.
- **`#(format "%.2f" %)`** is an anonymous function literal that formats each resulting double-precision number as a string with two decimal places.
- **`(sort-by area)`** is a higher-order sequence function. It takes a collection (`shapes`) and a function (`area`). It calls `area` on each shape to determine its sort order, then returns a sequence of the actual shape instances, sorted smallest to largest by area.
- **`(map describe)`** takes the sorted shape instances and calls the polymorphic `describe` function on each, generating human-readable strings.

**Execution trace for `sorted-descriptions`:**
```
Step 1: sort-by receives the vector of shapes.
Step 2: It calls (area (->Circle 5)) => 78.5398...
Step 3: It calls (area (->Rectangle 4 6)) => 24.0
Step 4: It calls (area (->Triangle 3 4 5)) => 6.0
Step 5: It calls (area (->Circle 1)) => 3.1415...
Step 6: It sorts the sequence based on those computed numeric values.
Step 7: The sorted sequence is (Circle1, Triangle, Rectangle, Circle5).
Step 8: map calls describe on Circle1 => "Circle with radius 1"
Step 9: map calls describe on Triangle => "Triangle with sides 3, 4, 5"
Step 10: map calls describe on Rectangle => "Rectangle 4x6"
Step 11: map calls describe on Circle5 => "Circle with radius 5"
Step 12: Evaluates to ("Circle with radius 1" "Triangle with sides 3, 4, 5" "Rectangle 4x6" "Circle with radius 5").
```

We now have open, composable polymorphism without the heavyweight machinery of OOP class hierarchies. The same ideas power Clojure's own core abstractions: `ISeq`, `IPersistentMap`, and `IFn` are all protocols that Clojure's built-in types implement.
