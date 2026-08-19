# Lesson 30: SICP Chapter 2 — Data Abstraction

**What you will build:** The reader will work through SICP Chapter 2's opening idea — data abstraction — by implementing rational numbers (fractions) as an abstract data type. The transferable problems: (1) data abstraction means separating WHAT a data object represents from HOW it is represented — callers use the interface, not the implementation; (2) an abstraction barrier is the set of procedures that cross the boundary between one level of abstraction and the next — changing the representation only requires changing what is below the barrier; (3) this is the origin of every API, interface, and encapsulation pattern in modern software.

**What you need to know first:** Lessons 0–29 (all prior concepts through SICP Ch1, recursive/iterative processes, higher-order procedures, `cons`/`car`/`cdr`, structural recursion, closures).

**Terms used in this lesson:**
- **Rational number** — a number that can be expressed as the quotient or fraction of two integers. The problem it solves here is providing a concrete domain to model compound data operations.
- **Data abstraction** — the methodology of structuring programs so that they operate on abstract data. It solves the problem of coupling by separating how data is represented from how it is used.
- **Abstraction barrier** — a conceptual layer that isolates different levels of a system. It solves the problem of brittle code by ensuring that changes to a data structure's representation do not propagate to the procedures that use the structure.
- **Constructor** — a procedure that builds a data object from its primitive parts. It solves the problem of initializing structured data in a consistent way.
- **Selector** — a procedure that extracts a specific part of a compound data object. It solves the problem of retrieving internal state without exposing the underlying memory layout.
- **Closure / lambda** — an anonymous function that captures its lexical environment. Used here to prove that data can be represented entirely as behavior.

**Objects and methods used:**

- **`cons`**
  - *What it is:* A core Scheme primitive for creating pairs.
  - *Implementation:* A native function taking two arguments and returning a pair.
  - *Its use:* Used to glue a numerator and denominator together.
  - *Type:* Core language function.
  - *Responsibility:* Allocates memory for a pair and stores two references.
  - *Depends on:* Two arguments of any type.
  - *Connects to:* Called by constructors; its results are read by `car` and `cdr`.
  - *Shape:* Internal implementation detail at the lowest level of our barrier.

- **`car`**
  - *What it is:* A core Scheme primitive.
  - *Implementation:* A native function taking a pair and returning its first element.
  - *Its use:* Extracts the numerator from our rational number pair.
  - *Type:* Core language function.
  - *Responsibility:* Retrieves the first half of a pair.
  - *Depends on:* A valid pair object.
  - *Connects to:* Called by selectors.
  - *Shape:* Internal implementation detail at the lowest level.

- **`cdr`**
  - *What it is:* A core Scheme primitive.
  - *Implementation:* A native function taking a pair and returning its second element.
  - *Its use:* Extracts the denominator from our rational number pair.
  - *Type:* Core language function.
  - *Responsibility:* Retrieves the second half of a pair.
  - *Depends on:* A valid pair object.
  - *Connects to:* Called by selectors.
  - *Shape:* Internal implementation detail at the lowest level.

- **`gcd`**
  - *What it is:* Greatest Common Divisor.
  - *Implementation:* A built-in Scheme math function based on Euclid's algorithm.
  - *Its use:* Reduces fractions to their lowest terms inside the constructor.
  - *Type:* Core library math function.
  - *Responsibility:* Computes the largest integer that divides both inputs without a remainder.
  - *Depends on:* Two integer arguments.
  - *Connects to:* Called by `make-rat`.
  - *Shape:* Utility function used during construction.

- **`make-rat`**
  - *What it is:* The constructor for rational numbers.
  - *Implementation:* A custom procedure `(define (make-rat n d) ...)`.
  - *Its use:* Builds a valid rational number from an `n` and `d`.
  - *Type:* Custom constructor procedure.
  - *Responsibility:* Normalizes and encapsulates the numerator and denominator into a pair.
  - *Depends on:* Two integers (numerator, denominator).
  - *Connects to:* Returns a pair to the caller; calls `cons` and `gcd`.
  - *Shape:* The abstraction barrier constructor.

- **`numer`** and **`denom`**
  - *What they are:* The selectors for rational numbers.
  - *Implementation:* Custom procedures `(define (numer rat) (car rat))` and `(define (denom rat) (cdr rat))`.
  - *Their use:* Provide read access to the rational number's components.
  - *Type:* Custom selector procedures.
  - *Responsibility:* Retrieve the numerator/denominator without exposing the pair structure.
  - *Depends on:* A rational number object.
  - *Connects to:* Called by arithmetic operations; calls `car`/`cdr`.
  - *Shape:* The abstraction barrier selectors.

- **`print-rat`**
  - *What it is:* A helper procedure to display rational numbers.
  - *Implementation:* A custom procedure using `display` and `newline`.
  - *Its use:* Outputs the fraction in a human-readable "n/d" format.
  - *Type:* Custom utility procedure.
  - *Responsibility:* Formats and prints the rational number to stdout.
  - *Depends on:* A rational number object.
  - *Connects to:* Calls `numer`, `denom`, `display`, and `newline`.
  - *Shape:* Top-level consumer of the abstraction.

- **`add-rat`, `mul-rat`, `sub-rat`, `equal-rat?`**
  - *What they are:* Arithmetic operations for rational numbers.
  - *Implementation:* Custom procedures that apply standard mathematical formulas for fractions.
  - *Their use:* Perform math on our custom data type.
  - *Type:* Custom domain logic procedures.
  - *Responsibility:* Compute new rational numbers based on the mathematical rules of fractions.
  - *Depends on:* Rational number objects passed as arguments.
  - *Connects to:* Calls `numer`, `denom`, and `make-rat`.
  - *Shape:* Level 3 operations that sit above the abstraction barrier.

- **`make-rat-list`, `numer-list`, `denom-list`, `add-rat-list`**
  - *What they are:* Alternative implementations using lists instead of pairs.
  - *Implementation:* Custom procedures leveraging `list` and `cadr`.
  - *Their use:* Proves that changing the underlying data structure does not break the arithmetic logic.
  - *Type:* Custom constructor/selector/operation procedures.
  - *Responsibility:* Same as their pair counterparts, but operating on lists.
  - *Depends on:* Integers and lists.
  - *Connects to:* Calls `list`, `car`, `cadr`.
  - *Shape:* An alternate implementation at the bottom of the abstraction barrier.

- **`my-cons`, `my-car`, `my-cdr`**
  - *What they are:* Procedural representations of data.
  - *Implementation:* Custom procedures defined entirely using `lambda`.
  - *Their use:* Proves that data structures can be built out of pure functions.
  - *Type:* Custom higher-order procedures.
  - *Responsibility:* Store and retrieve two values without allocating native memory structures.
  - *Depends on:* Values to store; functions as dispatchers.
  - *Connects to:* Calls `lambda`, `if`.
  - *Shape:* The theoretical limit of functional data abstraction.

## Concept Unit: The Problem — Arithmetic on Rational Numbers

### The Problem
We need to write a system that performs arithmetic on rational numbers (fractions) like 1/2 and 1/3. We want to be able to add, subtract, multiply, and compare them. However, Scheme does not have a built-in "rational number" data type that we can just use off the shelf for this lesson's purpose. We have to build it ourselves from primitive parts.

### Introduce the concept in isolation
Before we build the full system, let's look at `gcd` (Greatest Common Divisor), a built-in Scheme math function based on Euclid's algorithm. It solves the problem of reducing fractions to their lowest terms.

```scheme
(display (gcd 12 8))
(newline)
```

**Real output:**
```
4
```
This output proves that `gcd` correctly identifies 4 as the largest integer that divides both 12 and 8 without a remainder. This is called a **math primitive**, and it will be essential for ensuring our fractions like 6/4 are automatically reduced to 3/2.

### Discard the throwaway example
The isolated `gcd` test above is deleted and will not appear in our final code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring a fundamental computer science concept.
- **Files affected:** `rational.rkt` (created).
- **Change type:** Add.
- **Location:** Top of the file.
- **Dependencies:** None.

### The New Code
```scheme
; Constructor:
(define (make-rat n d)
  (let ([g (gcd n d)])
    (cons (/ n g) (/ d g))))  ; reduce to lowest terms using gcd

; Selectors:
(define (numer rat) (car rat))
(define (denom rat) (cdr rat))

; Display:
(define (print-rat rat)
  (display (numer rat))
  (display "/")
  (display (denom rat))
  (newline))

(print-rat (make-rat 1 2))
(print-rat (make-rat 6 4))
(print-rat (make-rat 2 4))
```

### The Updated Project
```scheme
// ← new
; Constructor:
(define (make-rat n d)
  (let ([g (gcd n d)])
    (cons (/ n g) (/ d g))))

; Selectors:
(define (numer rat) (car rat))
(define (denom rat) (cdr rat))

; Display:
(define (print-rat rat)
  (display (numer rat))
  (display "/")
  (display (denom rat))
  (newline))

(print-rat (make-rat 1 2))   ; 1/2
(print-rat (make-rat 6 4))   ; 3/2  (reduced!)
(print-rat (make-rat 2 4))   ; 1/2  (reduced!)
```
This new structure defines the foundational layer for rational numbers: a constructor to build them, selectors to read them, and a utility to display them.

### Mechanical walkthrough
- `define (make-rat n d)` declares a new custom constructor procedure taking a numerator `n` and denominator `d`.
- `let ([g (gcd n d)])` binds the greatest common divisor of `n` and `d` to the local variable `g`. This ensures we always work with reduced fractions.
- `cons` is a core Scheme primitive that allocates a pair.
- `(/ n g)` and `(/ d g)` divide the inputs by their common divisor before passing them to `cons`.
- `define (numer rat)` declares a selector procedure.
- `car rat` uses the core Scheme primitive `car` to extract the first element (the numerator) of the pair.
- `define (denom rat)` declares a selector procedure.
- `cdr rat` uses the core Scheme primitive `cdr` to extract the second element (the denominator) of the pair.
- `define (print-rat rat)` creates a helper function to format the output.
- `display` and `newline` are standard I/O procedures that write text to the console.

## Concept Unit: Arithmetic Operations

### The Problem
Now that we can construct and select parts of a rational number, we need to actually perform math on them: addition, subtraction, multiplication, and equality testing, using the standard mathematical formulas for fractions.

### Introduce the concept in isolation
Let's verify that we can combine standard math operations with our new selectors.

```scheme
(define temp-rat1 (make-rat 1 2))
(define temp-rat2 (make-rat 1 3))
(display (+ (* (numer temp-rat1) (denom temp-rat2))
            (* (numer temp-rat2) (denom temp-rat1))))
(newline)
```

**Real output:**
```
5
```
This output proves that we can extract the components of our custom data structure and use them in a complex mathematical formula to compute the numerator of a sum (`1*3 + 1*2 = 5`). This is exactly what our generic arithmetic functions will do.

### Discard the throwaway example
The isolated `temp-rat` test above is deleted and will not appear in our final code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `rational.rkt` (modified).
- **Change type:** Add.
- **Location:** Below the constructor and selectors.
- **Dependencies:** Requires `make-rat`, `numer`, and `denom`.

### The New Code
```scheme
(define (add-rat x y)
  (make-rat (+ (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))

(define (mul-rat x y)
  (make-rat (* (numer x) (numer y))
            (* (denom x) (denom y))))

(define (sub-rat x y)
  (make-rat (- (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))

(define (equal-rat? x y)
  (= (* (numer x) (denom y))
     (* (numer y) (denom x))))
```

### The Updated Project
```scheme
; Constructor and Selectors...
(define (make-rat n d) ...)
(define (numer rat) ...)
(define (denom rat) ...)

// ← new
(define (add-rat x y)
  (make-rat (+ (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))

(define (mul-rat x y)
  (make-rat (* (numer x) (numer y))
            (* (denom x) (denom y))))

(define (sub-rat x y)
  (make-rat (- (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))

(define (equal-rat? x y)
  (= (* (numer x) (denom y))
     (* (numer y) (denom x))))

(print-rat (add-rat (make-rat 1 2) (make-rat 1 3)))  ; 5/6
(print-rat (mul-rat (make-rat 2 3) (make-rat 3 4)))  ; 1/2
(display (equal-rat? (make-rat 1 2) (make-rat 2 4))) ; #t
(newline)
```
This structure adds the higher-level domain operations. Crucially, NONE of `add-rat`, `mul-rat`, `sub-rat`, or `equal-rat?` use `car` or `cdr`. They only use `numer`, `denom`, and `make-rat`.

### Mechanical walkthrough
- `define (add-rat x y)` declares a function taking two rational numbers.
- `make-rat` is called to construct the final result.
- `(+ (* (numer x) (denom y)) (* (numer y) (denom x)))` computes the new numerator using the mathematical rule `(n1*d2 + n2*d1)`.
- `(* (denom x) (denom y))` computes the new denominator using `(d1*d2)`.
- `define (mul-rat x y)` multiplies two rationals.
- `define (sub-rat x y)` subtracts two rationals.
- `define (equal-rat? x y)` uses cross-multiplication `n1*d2 = n2*d1` to test equality without floating-point inaccuracies.

**Execution trace for `(add-rat (make-rat 1 2) (make-rat 1 3))`:**
```
Step 1: (make-rat 1 2) creates pair (1 . 2)
Step 2: (make-rat 1 3) creates pair (1 . 3)
Step 3: add-rat extracts components: numer x = 1, denom y = 3, numer y = 1, denom x = 2
Step 4: Computes numerator: (+ (* 1 3) (* 1 2)) -> (+ 3 2) -> 5
Step 5: Computes denominator: (* 2 3) -> 6
Step 6: (make-rat 5 6) is called, returning (5 . 6)
```
Notice how data abstraction is in action: `add-rat` does not know or care that the rationals are stored as pairs.

## Concept Unit: The Abstraction Barrier

### The Problem
If our code mixes low-level details (like `car` and `cdr`) with high-level logic (like cross-multiplication), changing how we store a rational number would force us to rewrite every single math function. We need to formalize the boundary between use and implementation.

### Introduce the concept in isolation
Consider a simple architectural diagram rather than code. An abstraction barrier is the set of procedures that cross the boundary between one level of abstraction and the next.

```text
Level 3 (programs that use rational numbers):
  add-rat, mul-rat, sub-rat, equal-rat?
  ---- ABSTRACTION BARRIER ----
Level 2 (rational number representation):
  make-rat, numer, denom
  ---- ABSTRACTION BARRIER ----
Level 1 (pair data structure):
  cons, car, cdr
```
This diagram proves the architectural principle: code above a barrier does not and should not know what is below it. If we change the representation at Level 1, we only need to change the bridge functions at Level 2. Level 3 is entirely unaffected.

### Discard the throwaway example
The diagram is a mental model, not code, but the principle applies permanently.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None explicitly, this is a conceptual framing of the existing code.
- **Change type:** Conceptual.

### The New Code
(No new code, this unit defines the barrier based on the code from the previous unit.)

### The Updated Project
(Our `rational.rkt` file already perfectly embodies this barrier.)

### Mechanical walkthrough
- **Level 3** operations (`add-rat`, `mul-rat`) strictly depend on **Level 2** (`make-rat`, `numer`, `denom`).
- **Level 2** procedures strictly depend on **Level 1** (`cons`, `car`, `cdr`).
- By adhering to this rule, the internal memory layout of a rational number is completely encapsulated.

## Concept Unit: Alternative Representations

### The Problem
To prove that the abstraction barrier actually provides value, we need to completely change the underlying data structure (from a pair to a list) and verify that our high-level arithmetic functions continue to work without a single modification.

### Introduce the concept in isolation
Let's see how a list differs from a pair.

```scheme
(define my-list (list 1 2))
(display (car my-list))
(display " ")
(display (cadr my-list))
(newline)
```

**Real output:**
```
1 2
```
This output proves that a list can store two items just like a pair, but we must use `list` to create it and `cadr` (car of cdr) to retrieve the second element, rather than a simple `cdr`.

### Discard the throwaway example
The isolated list test above is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `rational.rkt` (modified).
- **Change type:** Add.
- **Location:** Bottom of the file.
- **Dependencies:** The math logic from earlier.

### The New Code
```scheme
; Alternative: store as a list instead of a pair:
(define (make-rat-list n d)
  (let ([g (gcd n d)])
    (list (/ n g) (/ d g))))  ; note: list not cons

(define (numer-list rat) (car rat))
(define (denom-list rat) (cadr rat))  ; car of cdr

; Test that add-rat still works with the new representation:
; (only make-rat/numer/denom change; add-rat body is IDENTICAL)
(define (add-rat-list x y)
  (make-rat-list (+ (* (numer-list x) (denom-list y))
                    (* (numer-list y) (denom-list x)))
                 (* (denom-list x) (denom-list y))))
```

### The Updated Project
```scheme
// ← new
; Alternative: store as a list instead of a pair:
(define (make-rat-list n d)
  (let ([g (gcd n d)])
    (list (/ n g) (/ d g))))

(define (numer-list rat) (car rat))
(define (denom-list rat) (cadr rat))

(define (add-rat-list x y)
  (make-rat-list (+ (* (numer-list x) (denom-list y))
                    (* (numer-list y) (denom-list x)))
                 (* (denom-list x) (denom-list y))))

(display (add-rat-list (make-rat-list 1 2) (make-rat-list 1 3)))
(newline)
; => (5 6)
```
This structure introduces an alternative Level 2 representation. The arithmetic logic in `add-rat-list` is character-for-character identical to `add-rat`, proving the payoff of the abstraction barrier.

### Mechanical walkthrough
- `define (make-rat-list n d)` declares a new constructor using a list.
- `list` is a core primitive that creates a linked list instead of a single pair.
- `define (numer-list rat)` extracts the numerator using `car`.
- `define (denom-list rat)` extracts the denominator using `cadr` (because in a list, the second element is the `car` of the `cdr`).
- `define (add-rat-list x y)` is the exact same mathematical logic, just calling the `-list` suffixed Level 2 procedures.

## Concept Unit: Data as Procedures

### The Problem
If we don't use pairs, and we don't use lists, how can we store two pieces of data together? SICP makes a profound claim: the distinction between "data" and "procedure" is not fundamental. We can implement a data structure using ONLY functions (`lambda`), with no actual memory allocation for a data structure at all.

### Introduce the concept in isolation
Let's build a function that returns another function.

```scheme
(define (test-closure x)
  (lambda () x))
(define my-func (test-closure 42))
(display (my-func))
(newline)
```

**Real output:**
```
42
```
This output proves that a **closure / lambda** can capture and remember the value of `x` (42) from its enclosing scope, acting exactly like a piece of stored data.

### Discard the throwaway example
The closure test above is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `rational.rkt` (modified).
- **Change type:** Add.
- **Location:** Bottom of the file.
- **Dependencies:** `lambda`.

### The New Code
```scheme
(define (my-cons x y)
  (lambda (m) (if (= m 0) x y)))

(define (my-car p) (p 0))
(define (my-cdr p) (p 1))
```

### The Updated Project
```scheme
// ← new
(define (my-cons x y)
  (lambda (m) (if (= m 0) x y)))

(define (my-car p) (p 0))
(define (my-cdr p) (p 1))

(display (my-car (my-cons 1 2)))  ; => 1
(newline)
(display (my-cdr (my-cons 1 2)))  ; => 2
(newline)
```
This structure implements `cons`, `car`, and `cdr` from scratch using only behavior. The rational number arithmetic written earlier would work identically if we replaced the native `cons`/`car`/`cdr` with `my-cons`/`my-car`/`my-cdr`.

### Mechanical walkthrough
- `define (my-cons x y)` takes two arguments and returns a `lambda` (a procedure).
- `lambda (m) (if (= m 0) x y)` is a closure that remembers `x` and `y`. When called with an argument `m`, it uses an `if` statement to dispatch: returning `x` if `m` is 0, and `y` otherwise.
- `define (my-car p)` takes a pair (which is actually the lambda returned by `my-cons`) and calls it with `0`.
- `define (my-cdr p)` takes that same lambda and calls it with `1`.

**Execution trace for `(my-car (my-cons 1 2))`:**
```
Step 1: (my-cons 1 2) is evaluated.
Step 2: It returns the procedure: (lambda (m) (if (= m 0) 1 2))
Step 3: (my-car ...) applies that returned procedure to the argument 0.
Step 4: The procedure evaluates (if (= 0 0) 1 2).
Step 5: Since 0 = 0 is true, it returns 1.
```
This is one of the most mind-expanding ideas in SICP. We have created data out of pure behavior.

---

**Closing:** Data abstraction is the origin of encapsulation (OOP), interfaces (Java), protocols (Clojure), and abstract types (Haskell). SICP Chapter 2 continues with hierarchical data (trees) and symbolic data (quoting) in the next lesson.

**Exercises:**
- SICP Exercise 2.2 (line segments as abstract data using midpoint and endpoints)
- SICP Exercise 2.6 (Church numerals — representing numbers as lambdas, the natural extension of the data-as-procedures idea)
