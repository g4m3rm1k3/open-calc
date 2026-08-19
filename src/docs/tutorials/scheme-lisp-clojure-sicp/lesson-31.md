# Lesson 31: SICP Chapter 2 — Hierarchical Data and the Closure Property

What you will build: The reader will understand SICP's formal treatment of hierarchical data: the "closure property" of cons (that the result of cons can itself be consed), sequences as interfaces, and the use of map/filter/reduce as sequence operations. They will implement a data-processing pipeline using only sequence operations. The transferable problems: (1) SICP's "closure property" of cons means that cons can be used to build arbitrarily complex hierarchical data — this is the same "closure property" as mathematical closure (the result of the operation is in the same domain); (2) treating sequences as a uniform interface — "sequence operations" — allows composing complex data transformations from simple parts; (3) this is the origin of the functional pipeline pattern that appears in Clojure's `->>` macro, Haskell's `$`, and Unix pipes.

What you need to know first: Lessons 0–30 (all prior concepts through data abstraction, rational numbers, abstraction barriers, cons/car/cdr, nested list recursion from Lesson 9, map/filter/reduce).

## Terms used in this lesson

- **Closure property** — The mathematical property where an operation on elements of a set yields an element of that same set. In SICP, the fact that `cons` creates a pair whose elements can themselves be pairs, allowing arbitrary nesting.
- **Hierarchical data** — Data structures built by combining simpler data structures in a nested way, enabled by the closure property of `cons`.
- **Sequence operations** — The abstraction of treating data structures as uniform sequences (lists) that can be transformed via standard functional interfaces like map, filter, and fold.
- **Data pipeline** — The architectural pattern of chaining operations where the output of one transformation becomes the input of the next.
- **Signal-flow model** — SICP's conceptual model of sequence processing, viewing data as a signal flowing through a sequence of processing boxes (filters, maps, accumulators).
- **Threading macro** — A syntactic construct (like Clojure's `->>`) that reshapes nested function calls into a linear, top-to-bottom pipeline.

## Objects and methods used

**cons**
- *What it is:* A fundamental constructor for pairs in Scheme.
- *Implementation:* `(cons a b)`
- *Its use:* To build both simple pairs and arbitrarily deep hierarchical trees.
- *Type:* Core language function.
- *Responsibility:* Allocates and returns a new pair (cons-cell) containing two pointers.
- *Depends on:* Two arguments (atoms or other pairs) to store.
- *Connects to:* Forms structures traversed by `car` and `cdr`.
- *Shape:* A fundamental language primitive.

**car**
- *What it is:* An accessor for the first element of a pair.
- *Implementation:* `(car pair)`
- *Its use:* To retrieve the left side of a cons-cell.
- *Type:* Core language function.
- *Responsibility:* Extracts the value or pointer stored in the first half of a pair.
- *Depends on:* A pair created by `cons`.
- *Connects to:* Reads data constructed by `cons`.
- *Shape:* A fundamental language primitive.

**cdr**
- *What it is:* An accessor for the second element of a pair.
- *Implementation:* `(cdr pair)`
- *Its use:* To retrieve the right side of a cons-cell, which is often the rest of a list.
- *Type:* Core language function.
- *Responsibility:* Extracts the value or pointer stored in the second half of a pair.
- *Depends on:* A pair created by `cons`.
- *Connects to:* Reads data constructed by `cons`.
- *Shape:* A fundamental language primitive.

**map**
- *What it is:* A higher-order sequence operation.
- *Implementation:* `(map proc list)`
- *Its use:* To apply a transformation function to every element of a list, returning a new list.
- *Type:* Standard library function.
- *Responsibility:* Maps elements one-to-one to a new sequence.
- *Depends on:* A single-argument procedure and a list.
- *Connects to:* Feeds elements to `proc` and constructs the output sequence.
- *Shape:* A pipeline transformer.

**filter**
- *What it is:* A higher-order sequence operation.
- *Implementation:* `(filter predicate list)`
- *Its use:* To extract only the elements of a list that satisfy a condition.
- *Type:* Standard library function.
- *Responsibility:* Evaluates each element against a predicate and retains only the true cases.
- *Depends on:* A single-argument predicate function returning boolean, and a list.
- *Connects to:* Evaluates elements via `predicate`.
- *Shape:* A pipeline filter.

**fold-right (accumulate)**
- *What it is:* A higher-order sequence operation that combines elements from right to left.
- *Implementation:* `(fold-right op initial list)`
- *Its use:* To recursively combine a sequence into a single value or structure.
- *Type:* Standard library function (often called `accumulate` in SICP).
- *Responsibility:* Folds a list from the end backwards to the front.
- *Depends on:* A two-argument combining function, an initial base value, and a list.
- *Connects to:* Combines elements via `op`.
- *Shape:* A pipeline sink or reducer.

**fold-left**
- *What it is:* A higher-order sequence operation that combines elements from left to right.
- *Implementation:* `(fold-left op initial list)`
- *Its use:* To iteratively combine a sequence from start to finish.
- *Type:* Standard library function.
- *Responsibility:* Folds a list sequentially from the first element to the last.
- *Depends on:* A two-argument combining function, an initial accumulator, and a list.
- *Connects to:* Combines elements via `op`.
- *Shape:* A pipeline sink or reducer.

**flatmap**
- *What it is:* A compound sequence operation.
- *Implementation:* `(define (flatmap f lst) (apply append (map f lst)))`
- *Its use:* To map a function that returns a list over a sequence, then flatten the result by one level.
- *Type:* Custom or library function.
- *Responsibility:* Prevents nested lists when mapping a list-returning function.
- *Depends on:* `map`, `apply`, `append`, and a list-returning function.
- *Connects to:* Uses `map` to transform and `apply append` to flatten.
- *Shape:* A pipeline transformer.

**apply**
- *What it is:* A function applicator.
- *Implementation:* `(apply proc args-list)`
- *Its use:* To call a function where the arguments are provided as a list rather than individually.
- *Type:* Core language function.
- *Responsibility:* Spreads a list of values as discrete arguments to a function.
- *Depends on:* A procedure and a list of arguments.
- *Connects to:* Invokes `proc`.
- *Shape:* Utility function.

**append**
- *What it is:* A list concatenator.
- *Implementation:* `(append list1 list2 ...)`
- *Its use:* To join multiple lists end-to-end.
- *Type:* Standard library function.
- *Responsibility:* Creates a new list containing the elements of all provided lists.
- *Depends on:* One or more lists.
- *Connects to:* Copies cons-cells to form a continuous sequence.
- *Shape:* Utility function.

## Concept Unit: The closure property of `cons`

### The Problem

We need a way to represent complex structures like trees, where elements can contain other elements. If a constructor can only group simple values (atoms), we are limited to flat structures. We need a property that allows indefinite nesting.

### Introduce the concept in isolation

The mathematical idea of closure means an operation returns a value of the same type as its arguments. For `cons`, this is the **closure property**: the result of `cons` is a pair, and `cons` can accept pairs as its arguments.

```scheme
; A throwaway lab demonstrating cons closure
(define tree
  (cons (cons 1 2)
        (cons 3 4)))

(display (car (car tree))) (newline)
(display (cdr (car tree))) (newline)
(display (car (cdr tree))) (newline)
(display (cdr (cdr tree))) (newline)
```
Output:
```
1
2
3
4
```
This proves that because `cons` can nest inside `cons`, we can construct a hierarchical tree of arbitrary depth, and traverse it with nested `car` and `cdr`.

### Discard the throwaway example

The isolated lab is now deleted and will not appear in the project code.

### Project Change

No reference counterpart — this is a from-scratch addition because we are demonstrating the SICP closure property in a fresh context.
Files affected: `src/hierarchy.scm` (created)
Change type: Add
Location: Top of the file.

### The New Code

```scheme
(define data-tree
  (cons (cons 1 2)
        (cons 3 4)))
```

### The Updated Project

```scheme
// ← new
(define data-tree
  (cons (cons 1 2)
        (cons 3 4)))
```
This new file creates a hierarchical data structure.

### Mechanical walkthrough

- `define`: Core language keyword. Binds a name to a value.
- `data-tree`: The name we are assigning to the structure.
- `cons`: The constructor function. Called first to create the root of the tree.
- `(cons 1 2)`: Evaluates to a pair `(1 . 2)`. This becomes the `car` of the root pair.
- `(cons 3 4)`: Evaluates to a pair `(3 . 4)`. This becomes the `cdr` of the root pair.
Because of the **closure property**, `cons` seamlessly accepts the output of other `cons` calls. The box-and-pointer diagram for this structure has a root pair pointing to two child pairs, forming a perfect binary tree.

## Concept Unit: Sequence operations as a uniform interface

### The Problem

When working with lists, writing custom recursive loops for every transformation is error-prone and verbose. We need a uniform interface that treats lists as a standard sequence abstraction, allowing us to compose common operations.

### Introduce the concept in isolation

We can use standard **sequence operations** like `map` and `filter` to transform data in steps.

```scheme
; Throwaway lab for sequence operations
(define raw-data '(1 2 3 4 5))
(define filtered (filter odd? raw-data))
(define mapped (map (lambda (x) (* x 10)) filtered))

(display mapped) (newline)
```
Output:
```
(10 30 50)
```
This proves we can separate the filtering logic from the transformation logic, chaining them together.

### Discard the throwaway example

The isolated lab is now deleted and will not appear in the project code.

### Project Change

No reference counterpart — building a data processing pipeline.
Files affected: `src/pipeline.scm` (created)
Change type: Add
Location: Top of the file.

### The New Code

```scheme
(define employees
  '((Alice 75000)
    (Bob 52000)
    (Carol 91000)
    (Dave 48000)))

(define high-earners
  (filter (lambda (e) (> (cadr e) 60000)) employees))

(define names (map car high-earners))
```

### The Updated Project

```scheme
// ← new
(define employees
  '((Alice 75000)
    (Bob 52000)
    (Carol 91000)
    (Dave 48000)))

(define high-earners
  (filter (lambda (e) (> (cadr e) 60000)) employees))

(define names (map car high-earners))
```
This structure creates a dataset and defines a multi-step transformation pipeline over it.

### Mechanical walkthrough

- `define employees`: Sets up the raw data as a list of lists.
- `filter`: Takes a predicate and a sequence.
- `lambda (e)`: An anonymous function taking one employee record `e`.
- `cadr`: A shorthand for `(car (cdr e))`, extracting the second element (salary).
- `> ... 60000`: Checks if the salary is over 60,000.
- `high-earners`: Stores the intermediate list `((Alice 75000) (Carol 91000))`.
- `map`: Takes a transformation function and a sequence.
- `car`: Extracts the first element (name) from each record.
- `names`: Stores the final output `(Alice Carol)`.

Execution trace:
```
Step 1: filter evaluates Alice: (> 75000 60000) is true -> Keep Alice
Step 2: filter evaluates Bob: (> 52000 60000) is false -> Discard Bob
Step 3: filter evaluates Carol: (> 91000 60000) is true -> Keep Carol
Step 4: filter evaluates Dave: (> 48000 60000) is false -> Discard Dave
high-earners = ((Alice 75000) (Carol 91000))
Step 5: map applies car to (Alice 75000) -> Alice
Step 6: map applies car to (Carol 91000) -> Carol
names = (Alice Carol)
```

## Concept Unit: `flatmap` — map then flatten

### The Problem

Sometimes a mapping operation returns a list for each element, producing a list of lists. We need a way to map over elements and flatten the results into a single, continuous list.

### Introduce the concept in isolation

We build `flatmap` using `apply` and `append`.

```scheme
; Throwaway lab for flatmap
(define (flatmap f lst)
  (apply append (map f lst)))

(display (flatmap (lambda (x) (list x (* x -1))) '(1 2 3)))
(newline)
```
Output:
```
(1 -1 2 -2 3 -3)
```
This proves that mapping a list-returning function and then applying `append` flattens the nested structures back into a linear sequence.

### Discard the throwaway example

The isolated lab is now deleted and will not appear in the project code.

### Project Change

No reference counterpart.
Files affected: `src/pairs.scm` (created)
Change type: Add
Location: Top of the file.

### The New Code

```scheme
(define (flatmap f lst)
  (apply append (map f lst)))

(define (enumerate-range low high)
  (if (> low high)
      '()
      (cons low (enumerate-range (+ low 1) high))))

(define (enumerate-pairs n)
  (flatmap
    (lambda (i)
      (map (lambda (j) (list i j))
           (filter (lambda (j) (< j i))
                   (enumerate-range 1 (- i 1)))))
    (enumerate-range 1 n)))
```

### The Updated Project

```scheme
// ← new
(define (flatmap f lst)
  (apply append (map f lst)))

(define (enumerate-range low high)
  (if (> low high)
      '()
      (cons low (enumerate-range (+ low 1) high))))

(define (enumerate-pairs n)
  (flatmap
    (lambda (i)
      (map (lambda (j) (list i j))
           (filter (lambda (j) (< j i))
                   (enumerate-range 1 (- i 1)))))
    (enumerate-range 1 n)))
```
This implements a nested sequence operation to generate coordinate pairs.

### Mechanical walkthrough

- `flatmap`: Maps function `f` over `lst`, yielding a list of lists, then uses `apply` to pass those lists as individual arguments to `append`.
- `apply`: Takes a function (`append`) and a list of arguments, invoking the function as if the list elements were supplied separately.
- `append`: Concatenates all provided lists.
- `enumerate-range`: Generates a list of integers from `low` to `high` using recursive `cons`.
- `enumerate-pairs`: Uses `flatmap` to iterate outer variable `i` from `1` to `n`.
- Inside `flatmap`, `map` iterates inner variable `j` from `1` to `i - 1`.
- `list i j`: Creates a pair for each valid combination.

Trace for `(enumerate-pairs 3)`:
```
i = 1: j range is empty. map returns ().
i = 2: j range is (1). map returns ((2 1)).
i = 3: j range is (1 2). map returns ((3 1) (3 2)).
flatmap result = (apply append '(() ((2 1)) ((3 1) (3 2))))
Output = ((2 1) (3 1) (3 2))
```

## Concept Unit: Accumulating results with `fold-left` and `fold-right`

### The Problem

We need to compress or combine a sequence into a single value, such as a sum or a new data structure. We must decide the order (associativity) in which elements are combined.

### Introduce the concept in isolation

`fold-right` and `fold-left` process lists in opposite directions.

```scheme
; Throwaway lab for folds
(define (fold-right op initial lst)
  (if (null? lst)
      initial
      (op (car lst) (fold-right op initial (cdr lst)))))

(define (fold-left op initial lst)
  (if (null? lst)
      initial
      (fold-left op (op initial (car lst)) (cdr lst))))

(display (fold-right cons '() '(1 2 3))) (newline)
(display (fold-left  cons '() '(1 2 3))) (newline)
```
Output:
```
(1 2 3)
(((() . 1) . 2) . 3)
```
This proves that direction matters. `fold-right` builds a standard list structure by consing right-to-left, whereas `fold-left` nests left-to-right, creating a reversed tree structure when used with a non-associative operator like `cons`.

### Discard the throwaway example

The isolated lab is now deleted and will not appear in the project code.

### Project Change

No reference counterpart.
Files affected: `src/accumulators.scm` (created)
Change type: Add
Location: Top of the file.

### The New Code

```scheme
(define (fold-right op initial lst)
  (if (null? lst)
      initial
      (op (car lst) (fold-right op initial (cdr lst)))))

(define (fold-left op initial lst)
  (if (null? lst)
      initial
      (fold-left op (op initial (car lst)) (cdr lst))))
```

### The Updated Project

```scheme
// ← new
(define (fold-right op initial lst)
  (if (null? lst)
      initial
      (op (car lst) (fold-right op initial (cdr lst)))))

(define (fold-left op initial lst)
  (if (null? lst)
      initial
      (fold-left op (op initial (car lst)) (cdr lst))))
```
These provide the core accumulation strategies for sequence processing.

### Mechanical walkthrough

- `fold-right`: Often called `accumulate` in SICP.
- `if (null? lst)`: Base case returns the `initial` value.
- `(op (car lst) (fold-right ...))`: Combines the current element with the result of folding the rest of the list. Associates to the right.
- `fold-left`: An iterative approach.
- `(fold-left op (op initial (car lst)) (cdr lst))`: Accumulates the result immediately and passes it forward as the new `initial` value. Associates to the left.

Trace for `fold-right cons '() '(1 2 3)`:
```
(cons 1 (fold-right cons '() '(2 3)))
(cons 1 (cons 2 (fold-right cons '() '(3))))
(cons 1 (cons 2 (cons 3 '())))
Result: (1 2 3)
```

Trace for `fold-left cons '() '(1 2 3)`:
```
(fold-left cons (cons '() 1) '(2 3))
(fold-left cons (cons (cons '() 1) 2) '(3))
(fold-left cons (cons (cons (cons '() 1) 2) 3) '())
Result: (((() . 1) . 2) . 3)
```

## Concept Unit: The signal-flow model (SICP 2.2.3) — data pipelines

### The Problem

When transformations are written from the inside out, the order of execution is visually backward from how a human reads text. We need a way to conceptualize this as a data pipeline.

### Introduce the concept in isolation

SICP calls sequence operations a **signal-flow model**. Data flows through transformers.

```scheme
; Throwaway lab for nested pipelines
(define employees '((Alice 75000) (Bob 52000) (Carol 91000) (Dave 48000)))

(define result
  (map car
    (filter (lambda (e) (> (cadr e) 60000))
      employees)))

(display result) (newline)
```
Output:
```
(Alice Carol)
```
This proves that operations apply inner-to-outer: `employees` feeds into `filter`, which feeds into `map`. 

### Discard the throwaway example

The isolated lab is now deleted and will not appear in the project code.

### Project Change

No reference counterpart.
Files affected: `src/pipeline.scm` (modified)
Change type: Refactor
Location: Replacing the two-step definition at the end.

### The New Code

```scheme
(define names
  (map car
    (filter (lambda (e) (> (cadr e) 60000))
      employees)))
```

### The Updated Project

```scheme
(define employees
  '((Alice 75000)
    (Bob 52000)
    (Carol 91000)
    (Dave 48000)))

// + replaced intermediate variables
(define names
  (map car
    (filter (lambda (e) (> (cadr e) 60000))
      employees)))
```
This code restructures the pipeline into a single expression.

### Mechanical walkthrough

- `names`: The final output binding.
- `map`: The final stage of the pipeline (outermost call).
- `filter`: The first transformation stage (innermost call).
- `employees`: The initial data source.

In Scheme, pipelines are nested inside-out. In modern languages (like Clojure), this same signal-flow model is written linearly using a threading macro (`->>`), passing the output of each line into the next. The underlying architecture is identical.

Closing: The closure property, sequence operations, and flatmap are SICP's tools for building data pipelines. These ideas show up directly in Clojure's `->>` macro, in Haskell's `do` notation, in Spark's RDD transformations, and in Java 8 streams. 
Exercises: SICP 2.33 (implementing map, append, length using fold-right) and 2.36 (accumulate-n: like fold-right but on a list of lists, combining element-by-element).
