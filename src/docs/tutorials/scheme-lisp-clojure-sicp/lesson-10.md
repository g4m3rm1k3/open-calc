# Lesson 10: Numbers as Lists — Peano Arithmetic

**What you will build**
You will build arithmetic operations (`o+`, `o*`, `o-expt`, `o-`) from scratch using only recursion and two primitive operations: `add1` (increment by 1) and `sub1` (decrement by 1). You will never use Scheme's built-in `+`, `*`, or `expt` in these functions. The transferable problems are: (1) numbers can be treated as a recursive data structure — just like a list, a positive integer `n` has a 'base case' (0) and a 'recursive case' (`n-1` plus something); (2) this is Peano arithmetic — the formal foundation of natural number arithmetic from Giuseppe Peano's 1889 axioms; (3) writing arithmetic recursively proves that recursion is not a technique specific to lists — it is a universal problem-solving strategy whenever a problem has a natural inductive structure.

**What you need to know first**
Lessons 0–9 (all prior concepts through structural recursion, nested list recursion, cons-building, functions as arguments).

**Terms used in this lesson**
- **recursion** — a universal problem-solving strategy where a function calls itself to solve a smaller instance of the same problem until it reaches a base case.
- **base case** — the simplest possible instance of a problem, which can be solved immediately without further recursion (e.g., 0 for numbers, empty list for lists).
- **recursive case** — the part of a recursive function that reduces the problem into a smaller version and calls itself to process it.
- **Peano arithmetic** — the formal foundation of natural number arithmetic, stating that every natural number is either 0 (base) or the successor of another natural number (recursive case).
- **inductive structure** — a shape of data or problem that naturally breaks down into a base case and a step that builds upon the next smaller case.

**Objects and methods used**
- **`define`**
  - *What it is:* the language keyword used to bind a name to a value or a function.
  - *Implementation:* `(define (name args) body)`
  - *Its use:* to give names to our custom arithmetic functions.
  - *Type:* keyword syntax.
  - *Responsibility:* registers a name in the current environment.
  - *Depends on:* a name and a value/expression.
  - *Connects to:* the runtime environment, providing the binding for future evaluations.
  - *Shape:* a fundamental top-level binding form.
- **`if`**
  - *What it is:* the language keyword for conditional branching.
  - *Implementation:* `(if condition true-branch false-branch)`
  - *Its use:* to branch between the base case and the recursive case.
  - *Type:* keyword syntax.
  - *Responsibility:* evaluates the condition and executes exactly one of the branches based on the result.
  - *Depends on:* a boolean-yielding condition expression.
  - *Connects to:* control flow evaluation.
  - *Shape:* core branching primitive.
- **`+`**
  - *What it is:* Scheme's built-in addition procedure.
  - *Implementation:* `(+ n 1)`
  - *Its use:* wrapped in `add1` to provide a named increment primitive.
  - *Type:* built-in procedure.
  - *Responsibility:* returns the sum of its arguments.
  - *Depends on:* numeric arguments.
  - *Connects to:* the language's math library.
  - *Shape:* a primitive operator.
- **`-`**
  - *What it is:* Scheme's built-in subtraction procedure.
  - *Implementation:* `(- n 1)`
  - *Its use:* wrapped in `sub1` to provide a named decrement primitive.
  - *Type:* built-in procedure.
  - *Responsibility:* returns the difference of its arguments.
  - *Depends on:* numeric arguments.
  - *Connects to:* the language's math library.
  - *Shape:* a primitive operator.
- **`add1`**
  - *What it is:* a primitive increment function.
  - *Implementation:* `(define (add1 n) (+ n 1))`
  - *Its use:* to build up numbers during recursive return paths.
  - *Type:* custom procedure.
  - *Responsibility:* adds 1 to its single argument.
  - *Depends on:* a numeric argument `n`.
  - *Connects to:* `+`.
  - *Shape:* custom foundational primitive.
- **`sub1`**
  - *What it is:* a primitive decrement function.
  - *Implementation:* `(define (sub1 n) (- n 1))`
  - *Its use:* to shrink numbers during recursive descent towards the base case.
  - *Type:* custom procedure.
  - *Responsibility:* subtracts 1 from its single argument.
  - *Depends on:* a numeric argument `n`.
  - *Connects to:* `-`.
  - *Shape:* custom foundational primitive.
- **`zero?`**
  - *What it is:* Scheme's built-in check for zero.
  - *Implementation:* `(zero? n)`
  - *Its use:* to test if a number has reached the base case of 0.
  - *Type:* built-in procedure.
  - *Responsibility:* returns `#t` if its argument is 0, otherwise `#f`.
  - *Depends on:* a numeric argument.
  - *Connects to:* boolean logic for conditional branches.
  - *Shape:* a primitive predicate.
- **`o+`**
  - *What it is:* custom addition from scratch.
  - *Implementation:* `(define (o+ m n) ...)`
  - *Its use:* to add two numbers using only recursion, `add1`, and `sub1`.
  - *Type:* custom procedure.
  - *Responsibility:* computes `m + n` structurally.
  - *Depends on:* two natural numbers.
  - *Connects to:* `zero?`, `add1`, `sub1`.
  - *Shape:* recursive arithmetic function.
- **`o*`**
  - *What it is:* custom multiplication from scratch.
  - *Implementation:* `(define (o* m n) ...)`
  - *Its use:* to multiply two numbers using repeated addition.
  - *Type:* custom procedure.
  - *Responsibility:* computes `m * n` structurally.
  - *Depends on:* two natural numbers.
  - *Connects to:* `zero?`, `o+`, `sub1`.
  - *Shape:* recursive arithmetic function.
- **`o-`**
  - *What it is:* custom subtraction from scratch.
  - *Implementation:* `(define (o- m n) ...)`
  - *Its use:* to subtract `n` from `m` using repeated decrement.
  - *Type:* custom procedure.
  - *Responsibility:* computes `m - n` structurally.
  - *Depends on:* two natural numbers.
  - *Connects to:* `zero?`, `sub1`.
  - *Shape:* recursive arithmetic function.
- **`o-expt`**
  - *What it is:* custom exponentiation from scratch.
  - *Implementation:* `(define (o-expt m n) ...)`
  - *Its use:* to compute `m` to the power of `n` using repeated multiplication.
  - *Type:* custom procedure.
  - *Responsibility:* computes `m ^ n` structurally.
  - *Depends on:* two natural numbers.
  - *Connects to:* `zero?`, `o*`, `sub1`.
  - *Shape:* recursive arithmetic function.

## Concept Unit: `add1` and `sub1`

### The Problem
We need named primitives to increment and decrement numbers by exactly 1, so we can treat numbers structurally. 

### Introduce the concept in isolation
We write thin wrappers around Scheme's `+` and `-`:
```scheme
(define (add1 n) (+ n 1))
(define (sub1 n) (- n 1))

(add1 5)
(sub1 5)
```
Output:
```
6
4
```
This proves that we can increment and decrement values using these new primitives. We call these **thin wrappers**.

### Discard the throwaway example
The test invocations `(add1 5)` and `(sub1 5)` are discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are building our own mathematical primitives.
- **Files affected:** `peano.scm` (created).
- **Change type:** add.
- **Location:** at the top of the file.
- **Dependencies:** None.

### The New Code
```scheme
(define (add1 n) (+ n 1))
(define (sub1 n) (- n 1))
```

### The Updated Project
```scheme
// ← new
(define (add1 n) (+ n 1))
(define (sub1 n) (- n 1))
```
These are the only primitive math functions we will allow ourselves to use. From this point forward, ALL arithmetic is built from `add1`, `sub1`, and `zero?`.

### Mechanical walkthrough
- `define` binds the names `add1` and `sub1` to procedures.
- `+` computes the sum of `n` and 1.
- `-` computes the difference of `n` and 1.

## Concept Unit: `zero?`

### The Problem
We need a way to detect the base case of a number when recursively processing it. Just as `null?` detects an empty list, we need to know when a number has been shrunk to nothing.

### Introduce the concept in isolation
```scheme
(zero? 0)
(zero? 5)
```
Output:
```
#t
#f
```
This proves that `zero?` accurately identifies when a number is 0. This is the **base case test**.

### Discard the throwaway example
The test invocations are discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None.
- **Files affected:** `peano.scm` (modified).
- **Change type:** add.
- **Location:** after `sub1`.
- **Dependencies:** `peano.scm`.

### The New Code
No new definitions, we just use the built-in `zero?`.

### The Updated Project
We will use `zero?` in the upcoming operations.

### Mechanical walkthrough
- `zero?` is a primitive predicate that checks if its argument is 0.

## Concept Unit: `o+`

### The Problem
We need to add two numbers together without using the `+` operator, using only `add1` and `sub1`.

### Introduce the concept in isolation
```scheme
(define (o+ m n)
  (if (zero? n)
      m
      (add1 (o+ m (sub1 n)))))

(o+ 3 4)
(o+ 0 5)
```
Output:
```
7
5
```
This proves that adding `n` to `m` can be done by incrementing `m` exactly `n` times.

### Discard the throwaway example
The test invocations are discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** `peano.scm` (modified).
- **Change type:** add.
- **Location:** after `sub1`.
- **Dependencies:** `add1`, `sub1`.

### The New Code
```scheme
(define (o+ m n)
  (if (zero? n)
      m
      (add1 (o+ m (sub1 n)))))
```

### The Updated Project
```scheme
(define (add1 n) (+ n 1))
(define (sub1 n) (- n 1))

// ← new
(define (o+ m n)
  (if (zero? n)
      m
      (add1 (o+ m (sub1 n)))))
```
This adds two numbers by recursing down on `n` and building back up with `add1`.

### Mechanical walkthrough
- `define` names the function `o+` taking arguments `m` and `n`.
- `if` checks the condition `(zero? n)`.
- `zero?` checks if `n` is 0. If it is, it returns `m` (base case).
- `add1` adds 1 to the result of the recursive call.
- `sub1` subtracts 1 from `n` to progress towards the base case.

**Execution trace for (o+ 3 4):**
- `(o+ 3 4)`: `n=4`, not zero, => `(add1 (o+ 3 3))`
- `(o+ 3 3)`: `n=3`, not zero, => `(add1 (o+ 3 2))`
- `(o+ 3 2)`: `n=2`, not zero, => `(add1 (o+ 3 1))`
- `(o+ 3 1)`: `n=1`, not zero, => `(add1 (o+ 3 0))`
- `(o+ 3 0)`: `n=0`, zero! => `3`
- Unwind: `3` -> `add1(3)=4` -> `add1(4)=5` -> `add1(5)=6` -> `add1(6)=7`

## Concept Unit: `o*`

### The Problem
We need to multiply two numbers without using `*`, leveraging our new `o+` function.

### Introduce the concept in isolation
```scheme
(define (o* m n)
  (if (zero? n)
      0
      (o+ m (o* m (sub1 n)))))

(o* 3 4)
(o* 5 0)
```
Output:
```
12
0
```
This proves that multiplication is just repeated addition.

### Discard the throwaway example
The test invocations are discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** `peano.scm` (modified).
- **Change type:** add.
- **Location:** after `o+`.
- **Dependencies:** `o+`, `sub1`.

### The New Code
```scheme
(define (o* m n)
  (if (zero? n)
      0
      (o+ m (o* m (sub1 n)))))
```

### The Updated Project
```scheme
(define (o+ m n)
  (if (zero? n)
      m
      (add1 (o+ m (sub1 n)))))

// ← new
(define (o* m n)
  (if (zero? n)
      0
      (o+ m (o* m (sub1 n)))))
```
This multiplies two numbers using structural recursion.

### Mechanical walkthrough
- `define` creates `o*`.
- `if` checks `(zero? n)`.
- `zero?` base case is 0, the identity for addition-based multiplication.
- `o+` adds `m` to the recursive result.
- `sub1` decrements `n`.

**Execution trace for (o* 3 4):**
- `(o* 3 4)`: `n=4`, not zero, => `(o+ 3 (o* 3 3))`
- `(o* 3 3)`: `n=3`, not zero, => `(o+ 3 (o* 3 2))`
- `(o* 3 2)`: `n=2`, not zero, => `(o+ 3 (o* 3 1))`
- `(o* 3 1)`: `n=1`, not zero, => `(o+ 3 (o* 3 0))`
- `(o* 3 0)`: `n=0`, zero! => `0`
- Unwind: `0` -> `(o+ 3 0)=3` -> `(o+ 3 3)=6` -> `(o+ 3 6)=9` -> `(o+ 3 9)=12`

## Concept Unit: `o-`

### The Problem
We need subtraction, which is the mirror of addition, using `sub1` instead of `add1`.

### Introduce the concept in isolation
```scheme
(define (o- m n)
  (if (zero? n)
      m
      (sub1 (o- m (sub1 n)))))

(o- 10 3)
(o- 5 5)
```
Output:
```
7
0
```
This proves subtraction can be modeled by decrementing on the way back up.

### Discard the throwaway example
The test invocations are discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** `peano.scm` (modified).
- **Change type:** add.
- **Location:** after `o*`.
- **Dependencies:** `sub1`.

### The New Code
```scheme
(define (o- m n)
  (if (zero? n)
      m
      (sub1 (o- m (sub1 n)))))
```

### The Updated Project
```scheme
(define (o* m n)
  (if (zero? n)
      0
      (o+ m (o* m (sub1 n)))))

// ← new
(define (o- m n)
  (if (zero? n)
      m
      (sub1 (o- m (sub1 n)))))
```
Subtraction mirrors addition.

### Mechanical walkthrough
- `define` creates `o-`.
- `if` checks `(zero? n)`.
- `zero?` returns `m`.
- `sub1` decrements the recursive result.
- `sub1` decrements `n`.

**Execution trace for (o- 10 3):**
- `(o- 10 3)`: `n=3`, not zero, => `(sub1 (o- 10 2))`
- `(o- 10 2)`: `n=2`, not zero, => `(sub1 (o- 10 1))`
- `(o- 10 1)`: `n=1`, not zero, => `(sub1 (o- 10 0))`
- `(o- 10 0)`: `n=0`, zero! => `10`
- Unwind: `10` -> `sub1(10)=9` -> `sub1(9)=8` -> `sub1(8)=7`

## Concept Unit: `o-expt`

### The Problem
We need to perform exponentiation without `expt`.

### Introduce the concept in isolation
```scheme
(define (o-expt m n)
  (if (zero? n)
      1
      (o* m (o-expt m (sub1 n)))))

(o-expt 2 10)
(o-expt 3 3)
(o-expt 5 0)
```
Output:
```
1024
27
1
```
This proves that exponentiation is repeated multiplication.

### Discard the throwaway example
The test invocations are discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** `peano.scm` (modified).
- **Change type:** add.
- **Location:** after `o-`.
- **Dependencies:** `o*`, `sub1`.

### The New Code
```scheme
(define (o-expt m n)
  (if (zero? n)
      1
      (o* m (o-expt m (sub1 n)))))
```

### The Updated Project
```scheme
(define (o- m n)
  (if (zero? n)
      m
      (sub1 (o- m (sub1 n)))))

// ← new
(define (o-expt m n)
  (if (zero? n)
      1
      (o* m (o-expt m (sub1 n)))))
```
Exponentiation shares the exact same shape as addition and multiplication.

### Mechanical walkthrough
- `define` creates `o-expt`.
- `if` checks `(zero? n)`.
- `zero?` returns 1, the multiplicative identity.
- `o*` multiplies `m` with the recursive result.
- `sub1` decrements `n`.

**Execution trace for (o-expt 2 3):**
- `(o-expt 2 3)`: `n=3`, not zero, => `(o* 2 (o-expt 2 2))`
- `(o-expt 2 2)`: `n=2`, not zero, => `(o* 2 (o-expt 2 1))`
- `(o-expt 2 1)`: `n=1`, not zero, => `(o* 2 (o-expt 2 0))`
- `(o-expt 2 0)`: `n=0`, zero! => `1`
- Unwind: `1` -> `(o* 2 1)=2` -> `(o* 2 2)=4` -> `(o* 2 4)=8`

## Concept Unit: The Peano parallel

### The Problem
We need to understand why structural recursion works on numbers just like it does on lists.

### Introduce the concept in isolation
Let's look at the analogy explicitly:

| Lists | Numbers |
|-------|---------|
| `null?` test | `zero?` test |
| `'()` base | `0` base |
| `cdr` shrinks | `sub1` shrinks |
| `cons` builds | `add1` builds |
| `(null? (cdr lst))` terminates | `(zero? (sub1 n))` terminates |

This proves the structural recursion pattern is identical. The data structure (list vs. natural number) is different, but the shape of the recursion — base case check, recursive call on something smaller, build result on the way back up — is the same. This makes recursion a universal tool.

### Discard the throwaway example
The table remains as a conceptual model.

### Project Change
- **Reference Source:** None.
- **Files affected:** None.
- **Change type:** conceptual.
- **Location:** end of lesson.
- **Dependencies:** None.

### The New Code
No code to add.

### The Updated Project
Concept complete.

### Mechanical walkthrough
- `null?` / `zero?`: testing the base case.
- `'()` / `0`: the empty state.
- `cdr` / `sub1`: moving closer to empty.
- `cons` / `add1`: constructing the larger result from the smaller one.

## Closing
All of these arithmetic functions rest on the exact same recursive foundation. We have implemented `o+` in terms of Peano axioms directly. As an exercise, try writing `o-quotient` (integer division) and `o-remainder` using similar recursive descent!
