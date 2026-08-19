# Lesson 33: SICP Chapter 2 — Generic Operations and Tagged Data

**What you will build:** You will implement SICP Section 2.4's generic arithmetic system: a system where `add`, `sub`, and `mul` work seamlessly on ordinary numbers, rational numbers, AND complex numbers, dispatching to the right implementation based on a type tag. The transferable problems you will master here are type tags (discriminated unions) which allow a single function to handle multiple data representations, and data-directed programming (SICP's term for using a dispatch table instead of a chain of conditionals), which forms the theoretical foundation of polymorphism, method dispatch in Object-Oriented Programming, and Clojure protocols.

**What you need to know first:** Lessons 0–32 (all prior concepts through data abstraction, hierarchical data, symbolic data, rational numbers, sequence operations).

**Terms used in this lesson:**
- **type tag** — A symbolic label attached to raw data that identifies what kind of data it represents. It solves the problem of runtime type identification in dynamically typed languages where primitive data structures (like pairs) do not inherently declare their semantics.
- **data-directed programming** — An architectural pattern where operations are dispatched to specific implementations via a central lookup table, keyed by operation name and data type, rather than by hardcoding `cond` or `if` chains. It allows a system to be open for extension without modification.
- **Open/Closed Principle (OCP)** — A software engineering principle stating that a module should be open for extension (you can add new types) but closed for modification (you do not have to edit existing generic functions to support them).
- **polymorphism** — The provision of a single interface to entities of different types. Data-directed programming is a manual implementation of this idea, letting the caller use `add` without knowing whether it is adding integers or complex numbers.
- **variadic arguments (dot notation)** — In Scheme, putting a dot before the final parameter in a lambda list binds all remaining arguments passed into a list, allowing functions to accept a variable number of arguments.

**Objects and methods used:**

**`attach-tag`**
- *What it is:* A constructor that wraps data with a type tag.
- *Implementation:* `(define (attach-tag type-tag contents) (cons type-tag contents))`
- *Its use:* Used to produce tagged data instances like `(rational 1 . 2)`.
- *Type:* A standard function taking a symbol and arbitrary data.
- *Responsibility:* Combines a type label and a payload into a single standard pair so that generic operations can inspect the label.
- *Depends on:* The built-in `cons` procedure to form the pair.
- *Connects to:* Called by specific constructors like `make-rational`; its results are read by `type-tag` and `contents`.
- *Shape:* A foundational data abstraction helper in the generic arithmetic system.

**`type-tag`**
- *What it is:* A selector that retrieves the type label from tagged data.
- *Implementation:* `(define (type-tag datum) (if (pair? datum) (car datum) (error ...)))`
- *Its use:* Extracts the type so that `apply-generic` can look up the right operation in the dispatch table.
- *Type:* A standard function taking tagged data.
- *Responsibility:* Safely extracting the tag, ensuring the data is properly formatted.
- *Depends on:* The built-in `pair?` and `car` procedures.
- *Connects to:* Called by `apply-generic` or naive `cond` implementations to identify data.
- *Shape:* A foundational data abstraction helper.

**`contents`**
- *What it is:* A selector that retrieves the raw payload from tagged data.
- *Implementation:* `(define (contents datum) (if (pair? datum) (cdr datum) (error ...)))`
- *Its use:* Strips the tag off before passing the data to the type-specific implementation.
- *Type:* A standard function taking tagged data.
- *Responsibility:* Safely extracting the payload.
- *Depends on:* The built-in `pair?` and `cdr` procedures.
- *Connects to:* Called by `apply-generic`.
- *Shape:* A foundational data abstraction helper.

**`put`**
- *What it is:* A mutator function that installs a specific implementation into the global dispatch table.
- *Implementation:* `(define (put op type proc) (hash-set! dispatch-table (list op type) proc))`
- *Its use:* Used by type-specific packages to register their operations (e.g., `(put 'add 'rational add-rat)`).
- *Type:* A function that mutates shared state.
- *Responsibility:* Maps an (operation, type) composite key to a procedure.
- *Depends on:* `hash-set!` and the `dispatch-table` global variable.
- *Connects to:* Called by package installation functions; data is later retrieved by `get`.
- *Shape:* The write-side of the data-directed dispatch registry.

**`get`**
- *What it is:* An accessor function that retrieves an implementation from the global dispatch table.
- *Implementation:* `(define (get op type) (hash-ref dispatch-table (list op type) #f))`
- *Its use:* Used by `apply-generic` to find the correct procedure for the given operation and type.
- *Type:* A pure accessor function (though it reads mutable state).
- *Responsibility:* Looks up a registered procedure, returning `#f` if none exists.
- *Depends on:* `hash-ref` and the `dispatch-table`.
- *Connects to:* Called by `apply-generic`; reads what `put` wrote.
- *Shape:* The read-side of the data-directed dispatch registry.

**`apply-generic`**
- *What it is:* The central generic routing function.
- *Implementation:* `(define (apply-generic op . args) ...)`
- *Its use:* The backbone of all generic operations (like `add`, `sub`).
- *Type:* A variadic function.
- *Responsibility:* Extracts tags from all arguments, looks up the corresponding procedure using `get`, and applies it to the stripped payloads.
- *Depends on:* `type-tag`, `contents`, `get`, `map`, and `apply`.
- *Connects to:* Called by generic interface functions (like `add`); calls type-specific implementations.
- *Shape:* The orchestrator in the data-directed system.

**Everything else in the file, not this lesson's subject but still explained:**

**`pair?`**
- *What it is:* A standard Scheme predicate.
- *Implementation:* Built-in procedure.
- *Its use:* Used to verify that a datum is actually a `cons` cell before trying to extract a tag.
- *Type:* Predicate function.
- *Responsibility:* Returns `#t` if the argument is a pair, `#f` otherwise.
- *Depends on:* Nothing.
- *Connects to:* Used inside `type-tag` and `contents` conditionals.
- *Shape:* Primitive runtime type checking.

**`error`**
- *What it is:* A standard Scheme procedure to raise an exception.
- *Implementation:* Built-in procedure.
- *Its use:* Used to halt execution when bad data or unsupported types are encountered.
- *Type:* Effectful procedure.
- *Responsibility:* Halts the program and prints an error message.
- *Depends on:* Nothing.
- *Connects to:* Used in `type-tag`, `contents`, and `apply-generic`.
- *Shape:* Error handling terminal.

**`eq?`**
- *What it is:* A built-in Scheme predicate for exact identity equality.
- *Implementation:* Built-in procedure.
- *Its use:* Used in the naive `cond` approach to compare symbols like `'rational`.
- *Type:* Predicate function.
- *Responsibility:* Checks if two symbols are identically the same object in memory.
- *Depends on:* Nothing.
- *Connects to:* Used in conditionals.
- *Shape:* Primitive equality check.

**`hash-set!`**
- *What it is:* A Racket standard library mutator for hash tables.
- *Implementation:* Built-in procedure `(hash-set! hash key value)`.
- *Its use:* Underpins `put`.
- *Type:* Effectful procedure.
- *Responsibility:* Inserts or updates a key-value pair in a mutable hash table.
- *Depends on:* A mutable hash table.
- *Connects to:* Modifies `dispatch-table`.
- *Shape:* State mutation.

**`hash-ref`**
- *What it is:* A Racket standard library accessor for hash tables.
- *Implementation:* Built-in procedure `(hash-ref hash key default)`.
- *Its use:* Underpins `get`.
- *Type:* Accessor procedure.
- *Responsibility:* Retrieves the value for a key, or returns the default if missing.
- *Depends on:* A hash table.
- *Connects to:* Reads from `dispatch-table`.
- *Shape:* State access.

**`make-hash`**
- *What it is:* A Racket standard library constructor for mutable hash tables.
- *Implementation:* Built-in procedure.
- *Its use:* Creates the empty `dispatch-table`.
- *Type:* Constructor procedure.
- *Responsibility:* Allocates and returns a new empty mutable hash table.
- *Depends on:* Nothing.
- *Connects to:* Binds to `dispatch-table`.
- *Shape:* Initialization.

**`apply`**
- *What it is:* A built-in Scheme procedure that calls a function with a list of arguments.
- *Implementation:* `(apply proc list-of-args)`
- *Its use:* Used in `apply-generic` to invoke the looked-up procedure with the extracted payloads.
- *Type:* Higher-order built-in procedure.
- *Responsibility:* Expands a list into individual argument positions for the given procedure.
- *Depends on:* A valid procedure and a list of arguments.
- *Connects to:* Executes the type-specific function.
- *Shape:* Dynamic execution helper.

**`map`**
- *What it is:* A built-in Scheme higher-order function for sequences.
- *Implementation:* `(map proc list)`
- *Its use:* Used to apply `type-tag` or `contents` over the entire list of arguments in `apply-generic`.
- *Type:* Higher-order built-in procedure.
- *Responsibility:* Transforms a list by applying a function to each element.
- *Depends on:* A valid procedure and a list.
- *Connects to:* Maps tags and contents.
- *Shape:* Sequence processing helper.

---

## Concept Unit: The Problem — Adding a Type Tag

### The Problem

We want a single `add` operation `(add x y)` that can work transparently whether `x` and `y` are ordinary numbers or rational numbers. But in a language where numbers and pairs do not carry complex class definitions, how does our generic `add` know whether it is looking at an ordinary integer or a rational number pair? We must explicitly attach a label to our data to tell the runtime what type it is dealing with.

### Isolate the Concept

Let's test creating explicit tags in a quick throwaway scratchpad. We will use a standard `cons` cell where the first element is a symbol (the tag) and the second element is the actual data. 

```scheme
(define (attach-tag type-tag contents)
  (cons type-tag contents))

(define (type-tag datum)
  (if (pair? datum)
      (car datum)
      (error 'type-tag "bad tagged datum" datum)))

(define (contents datum)
  (if (pair? datum)
      (cdr datum)
      (error 'contents "bad tagged datum" datum)))

(define (make-rational n d)
  (attach-tag 'rational (cons n d)))

(displayln (type-tag (make-rational 1 2)))
(displayln (contents (make-rational 1 2)))
```

When we run this, it prints:

```text
rational
(1 . 2)
```

This proves that by wrapping our data, we can successfully identify and unwrap it later. This pattern is called a **type tag** (or discriminated union). It lets us safely extract the type label when we need to decide how to process the data, and extract the raw payload when we are ready to do the math.

### Discard the Throwaway

We will discard this minimal isolated example now.

### Project Change

- **Reference Source**: SICP Section 2.4.2
- **Files affected**: `src/generic-arithmetic.rkt` (created)
- **Change type**: add
- **Location**: Top of the new file
- **Dependencies**: Racket standard environment

### The New Code

```scheme
#lang racket

(define (attach-tag type-tag contents)
  (cons type-tag contents))

(define (type-tag datum)
  (if (pair? datum)
      (car datum)
      (error 'type-tag "bad tagged datum" datum)))

(define (contents datum)
  (if (pair? datum)
      (cdr datum)
      (error 'contents "bad tagged datum" datum)))
```

### The Updated Project

Because this is a brand-new file, the code just shown is the entire enclosing structure. It provides the foundation for our generic arithmetic system: any data type we wish to participate in generic operations must be tagged using these helpers.

### Mechanical Walkthrough

- **`#lang racket`**: This declaration is standard, setting the language module.
- **`attach-tag`**: This constructor takes a symbol representing the type (e.g., `'rational`) and arbitrary data, passing both to `cons`. It returns a standard pair where the `car` is the symbol and the `cdr` is the payload.
- **`type-tag`**: This selector checks if its argument is a pair using the standard Scheme predicate `pair?`. If it is, it retrieves the first element using the built-in `car` procedure. If it is not a pair, it halts execution by calling `error`, a standard built-in procedure to raise an exception.
- **`contents`**: This selector performs the exact same structural check using `pair?`, but retrieves the remainder of the cell using the built-in `cdr` procedure. It also calls `error` if the data does not conform.

## Concept Unit: Type dispatch with cond — the naive approach

### The Problem

Now that we have tagged data, how do we implement the generic `add`? The most obvious approach is to write a single massive function that checks the tags of its arguments and branches to the correct type-specific addition function.

### Isolate the Concept

Let's see what this looks like in a throwaway script using a standard `cond` expression:

```scheme
(define (add-rational x y)
  'pretend-we-added-rationals)

(define (add x y)
  (cond
    [(and (number? x) (number? y)) (+ x y)]
    [(and (eq? (type-tag x) 'rational)
          (eq? (type-tag y) 'rational))
     (add-rational x y)]
    [else (error 'add "unknown types" x y)]))

(displayln (add 1 2))
(displayln (add (attach-tag 'rational '(1 . 2)) (attach-tag 'rational '(1 . 3))))
```

Running this yields:

```text
3
pretend-we-added-rationals
```

This output proves the dispatch logic technically works: integers are routed to the primitive `+` operator, and tagged rational numbers are routed to `add-rational`. But this reveals a fatal flaw called an **Open/Closed Principle (OCP)** violation. Every time we invent a new type (like complex numbers or polynomials), we must open up the `add` function, modify the `cond` chain, and recompile. The system is not open for extension without modification. 

### Discard the Throwaway

We will delete this naive `cond` example; our project will not use it.

### Project Change

- **Reference Source**: SICP Section 2.4.3
- **Files affected**: None (this was a conceptual demonstration; we move directly to the real solution in the next unit).
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: N/A

### The New Code

No new production code is added for this anti-pattern. We proceed immediately to data-directed programming.

### The Updated Project

The project remains unchanged, still holding only our tagging functions.

### Mechanical Walkthrough

- **`add`**: The generic function takes two arguments.
- **`cond`**: The built-in Scheme conditional operator evaluates branches in order.
- **`and`**: A built-in logical operator that ensures both arguments have the same type.
- **`eq?`**: A built-in predicate for exact identity equality, used here to compare the symbols returned by `type-tag` to the literal symbol `'rational`.
- **`number?`**: A built-in predicate that checks if the input is an ordinary Scheme number.
- **`+`**: The primitive addition operator used for ordinary numbers.
- **`else`**: The fallback clause in the `cond` chain that calls `error` if no known types match.

## Concept Unit: The operation-and-type dispatch table — data-directed programming

### The Problem

We need a way to look up the correct function without a hardcoded `cond` chain. We want `add` to remain unchanged no matter how many new types we introduce. We can achieve this by maintaining a central registry (a table) mapping the combination of an operation name and data type to the appropriate specific procedure.

### Isolate the Concept

Let's demonstrate storing and retrieving functions from a table. 

```scheme
(define dispatch-table (make-hash))

(define (put op type proc)
  (hash-set! dispatch-table (list op type) proc))

(define (get op type)
  (hash-ref dispatch-table (list op type) #f))

(put 'add 'scheme-number +)

(displayln (get 'add 'scheme-number))
(displayln (get 'add 'complex))
```

Running this yields:

```text
#<procedure:+>
#f
```

This proves we can save a function (the primitive `+` operator) into a table under a specific key (`'(add scheme-number)`), and later retrieve that exact function dynamically. If we ask for a combination that isn't registered, it safely returns `#f`. This lookup mechanism is called **data-directed programming**.

### Discard the Throwaway

We will discard this isolation script, though the core `put` and `get` functions will be adapted directly into our project next.

### Project Change

- **Reference Source**: SICP Section 2.4.3
- **Files affected**: `src/generic-arithmetic.rkt`
- **Change type**: add
- **Location**: Below the `contents` function.
- **Dependencies**: Racket standard environment.

### The New Code

```scheme
(define dispatch-table (make-hash))

(define (put op type proc)
  (hash-set! dispatch-table (list op type) proc))

(define (get op type)
  (hash-ref dispatch-table (list op type) #f))

(put 'add 'scheme-number +)
(put 'sub 'scheme-number -)
(put 'mul 'scheme-number *)

(define (make-scheme-number n) (attach-tag 'scheme-number n))

(define (install-rational-package)
  (define (numer x) (car x))
  (define (denom x) (cdr x))
  (define (add-rat x y)
    (make-rat (+ (* (numer x) (denom y)) (* (numer y) (denom x)))
              (* (denom x) (denom y))))
  (define (make-rat n d)
    (let ([g (gcd n d)]) (cons (/ n g) (/ d g))))
  (put 'add 'rational add-rat)
  (put 'make 'rational (lambda (n d) (attach-tag 'rational (make-rat n d)))))

(install-rational-package)

(define (apply-generic op . args)
  (let* ([type-tags (map type-tag args)]
         [proc (get op (car type-tags))])
    (if proc
        (apply proc (map contents args))
        (error 'apply-generic "no method for types" op type-tags))))

(define (add x y) (apply-generic 'add x y))
```

### The Updated Project

```scheme
#lang racket

(define (attach-tag type-tag contents)
  (cons type-tag contents))

(define (type-tag datum)
  (if (pair? datum)
      (car datum)
      (error 'type-tag "bad tagged datum" datum)))

(define (contents datum)
  (if (pair? datum)
      (cdr datum)
      (error 'contents "bad tagged datum" datum)))

// ← new
(define dispatch-table (make-hash))

(define (put op type proc)
  (hash-set! dispatch-table (list op type) proc))

(define (get op type)
  (hash-ref dispatch-table (list op type) #f))

(put 'add 'scheme-number +)
(put 'sub 'scheme-number -)
(put 'mul 'scheme-number *)

(define (make-scheme-number n) (attach-tag 'scheme-number n))

(define (install-rational-package)
  (define (numer x) (car x))
  (define (denom x) (cdr x))
  (define (add-rat x y)
    (make-rat (+ (* (numer x) (denom y)) (* (numer y) (denom x)))
              (* (denom x) (denom y))))
  (define (make-rat n d)
    (let ([g (gcd n d)]) (cons (/ n g) (/ d g))))
  (put 'add 'rational add-rat)
  (put 'make 'rational (lambda (n d) (attach-tag 'rational (make-rat n d)))))

(install-rational-package)

(define (apply-generic op . args)
  (let* ([type-tags (map type-tag args)]
         [proc (get op (car type-tags))])
    (if proc
        (apply proc (map contents args))
        (error 'apply-generic "no method for types" op type-tags))))

(define (add x y) (apply-generic 'add x y))
```

Our file now contains a complete, functioning generic arithmetic system. Ordinary numbers and rational numbers are both registered independently into a single dispatch table, and `apply-generic` dynamically routes calls to the correct internal function based on the tags.

### Mechanical Walkthrough

- **`make-hash`**: A Racket standard library constructor that creates the mutable hash table assigned to `dispatch-table`.
- **`put`**: A mutator function. It combines the operation (e.g., `'add`) and type into a list to serve as the key, then calls `hash-set!`, a built-in procedure, to store the procedure in the `dispatch-table`.
- **`get`**: An accessor function. It calls `hash-ref`, a built-in procedure, to look up the key in the `dispatch-table`, returning `#f` as the default if it is missing.
- **`install-rational-package`**: A function that encapsulates the logic for rational numbers. By grouping internal definitions (like `numer`, `denom`, `add-rat`, and `make-rat`), we prevent them from polluting the global namespace.
- **`numer`** and **`denom`**: Simple accessors calling `car` and `cdr` on the un-tagged payload.
- **`let`**: Standard Scheme binding construct used to temporarily hold the Greatest Common Divisor returned by the built-in `gcd` function.
- **`lambda`**: Standard Scheme function creation, used here to construct the final tag-attaching function stored for `'make`.
- **`apply-generic`**: The core router. Notice the parameter list `(op . args)`. The dot notation is the syntax for **variadic arguments** in Scheme; it binds `op` to the first argument (the symbol `'add`), and gathers all subsequent arguments into a list named `args`.
- **`map`**: A built-in Scheme higher-order function that applies `type-tag` to every argument in the `args` list to build a list of type symbols.
- **`car`**: Extracts the first tag from the `type-tags` list (this naive version assumes all arguments have the same type, taking the first tag as representative).
- **`apply`**: A built-in Scheme procedure that invokes the retrieved `proc`, expanding the list produced by `(map contents args)` into individual parameters for that procedure.
- **`add`**: The public-facing generic function, which simply delegates to `apply-generic`.

### Execution trace

Let's trace adding two tagged rational numbers:

```scheme
(define r1 (attach-tag 'rational (cons 1 2)))  ; 1/2
(define r2 (attach-tag 'rational (cons 1 3)))  ; 1/3
(add r1 r2)
```

```text
Call: (apply-generic 'add r1 r2)
Step 1: args = [r1, r2], type-tags = ['rational, 'rational] — map calls type-tag on both.
Step 2: proc = #<procedure:add-rat> — get looks up '(add rational).
Step 3: contents = [(1 . 2), (1 . 3)] — map calls contents on both, stripping tags.
Step 4: apply calls add-rat with (1 . 2) and (1 . 3).
Return: (rational 5 . 6) — add-rat executes, make-rat simplifies it, and the package's make wrapper attaches the tag.
```

## Concept Unit: Adding a new type without changing existing code

### The Problem

To prove that we have truly solved the Open/Closed Principle problem, we need to add an entirely new data type — complex numbers — to our arithmetic system without modifying any of the code we just wrote.

### Isolate the Concept

Let's isolate how a new package is structured independently.

```scheme
(define (install-complex-package)
  (define (make-from-real-imag x y) (cons x y))
  (define (real-part z) (car z))
  (define (imag-part z) (cdr z))
  (define (add-complex z1 z2)
    (make-from-real-imag (+ (real-part z1) (real-part z2))
                         (+ (imag-part z1) (imag-part z2))))
  (put 'add 'complex add-complex)
  (put 'make 'complex make-from-real-imag))
```

This module encapsulates all its own rules for complex numbers. By calling `put`, it registers its own `add-complex` function directly into the global table. It proves that new types can integrate themselves from the outside.

### Discard the Throwaway

This was not a throwaway; we will adapt it directly as our project code.

### Project Change

- **Reference Source**: SICP Section 2.4.3
- **Files affected**: `src/generic-arithmetic.rkt`
- **Change type**: add
- **Location**: Bottom of the file
- **Dependencies**: The `put` and `apply-generic` system already established.

### The New Code

```scheme
(define (install-complex-package)
  (define (make-from-real-imag x y) (cons x y))
  (define (real-part z) (car z))
  (define (imag-part z) (cdr z))
  (define (add-complex z1 z2)
    (make-from-real-imag (+ (real-part z1) (real-part z2))
                         (+ (imag-part z1) (imag-part z2))))
  (put 'add 'complex add-complex)
  (put 'make 'complex (lambda (x y) (attach-tag 'complex (make-from-real-imag x y)))))

(install-complex-package)
```

### The Updated Project

```scheme
;; ... unchanged previous code ...
(define (add x y) (apply-generic 'add x y))

// ← new
(define (install-complex-package)
  (define (make-from-real-imag x y) (cons x y))
  (define (real-part z) (car z))
  (define (imag-part z) (cdr z))
  (define (add-complex z1 z2)
    (make-from-real-imag (+ (real-part z1) (real-part z2))
                         (+ (imag-part z1) (imag-part z2))))
  (put 'add 'complex add-complex)
  (put 'make 'complex (lambda (x y) (attach-tag 'complex (make-from-real-imag x y)))))

(install-complex-package)
```

We have added full complex number addition support. We did not touch `add`, `apply-generic`, or `dispatch-table` directly. 

### Mechanical Walkthrough

- **`install-complex-package`**: A wrapper function establishing a private scope.
- **`make-from-real-imag`**: An internal constructor grouping two raw numbers into a standard `cons` pair representing the rectangular form.
- **`real-part`** and **`imag-part`**: Accessors calling `car` and `cdr` on the un-tagged pair.
- **`add-complex`**: Uses the primitive `+` operator to independently add the real and imaginary parts, constructing a new un-tagged pair.
- **`put`**: Modifies the global dispatch table, mapping `'add` and `'complex` to `add-complex`.
- **`lambda`**: Creates the public constructor that calls the internal `make-from-real-imag` and passes the result to `attach-tag` with the symbol `'complex`.

## Concept Unit: Connecting to Clojure protocols and Java interfaces

### The Problem

If data-directed programming is so powerful, why don't we manually build hash tables of functions in Java, Python, or Clojure? Because those languages have absorbed this exact architectural pattern into their very syntax and runtimes.

### Isolate the Concept

Look at how different languages perform exactly the same dispatch lookup we just built by hand:

```text
SICP's dispatch table:  (get 'add 'rational)
Java interfaces:        object.add()  -- dispatch by object type
Clojure protocols:      (add obj)     -- dispatch by type tag
Python dunder methods:  obj.__add__() -- dispatch by class
```

This proves that **polymorphism** is universally implemented via a lookup table. SICP forces us to construct the dispatch table explicitly so we understand the mechanics. In Object-Oriented languages like Java, the language runtime maintains invisible dispatch tables (v-tables) for every class, and the dot operator (`.`) performs the `get` automatically based on the object's hidden type tag. In Clojure, Protocols do exactly what our `apply-generic` does: they define a generic function name and a dispatch mechanism based on the first argument's type.

### Discard the Throwaway

This comparison requires no code to discard.

### Project Change

- **Reference Source**: None — this is a conceptual connection.
- **Files affected**: None.
- **Change type**: N/A
- **Location**: N/A
- **Dependencies**: N/A

### The New Code

No new code. 

### The Updated Project

Project unchanged.

### Mechanical Walkthrough

- **SICP's dispatch table**: Explicit manual lookups using the `get` procedure.
- **Java interfaces**: The Java Virtual Machine automatically follows a pointer inside the object to find the correct `add` method implementation.
- **Clojure protocols**: The idiomatic Lisp way to provide high-performance, polymorphic dispatch on types, working identically to `apply-generic` but optimized by the compiler.
- **Python dunder methods**: Python looks up the `__add__` attribute on the class dictionary (which is a literal hash table, just like our `dispatch-table`).

---

Closing: generic operations and tagged data complete SICP Chapter 2. The reader now understands data abstraction from primitive pairs all the way to a full generic arithmetic system. SICP Chapter 3 introduces assignment and mutable state — a fundamental change in the programming model. Exercises: SICP 2.73 (extend the symbolic differentiation system from Lesson 32 to use data-directed dispatch instead of cond) and 2.75 (make-from-mag-ang — implement complex numbers in polar form using message passing).
