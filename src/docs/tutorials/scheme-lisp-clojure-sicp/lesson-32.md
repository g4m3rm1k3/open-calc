# Lesson 32: SICP Chapter 2 — Symbolic Data

What you will build: The reader will work through SICP Section 2.3 — symbolic data. You will implement symbolic differentiation (computing the derivative of an algebraic expression represented as a list) and a simple set representation using ordered lists. The transferable problems: treating symbols and lists as data that represent mathematical objects is the foundation of computer algebra systems, compilers, and AI; symbolic differentiation transforms expressions by applying rules rather than evaluating them; this is your first encounter with a program that manipulates programs.

What you need to know first: Lessons 0–31 (all prior concepts through hierarchical data, closure property, sequence operations, fold-left/right, data abstraction).

Pipeline diagram: No named pipeline is extended in this lesson.

### Terms used in this lesson

- **Symbol** — An atomic, interned name in Lisp. It exists so we can treat names as data values rather than as variables to be evaluated, enabling symbolic computation.
- **Quote (`'`)** — A special form that suppresses evaluation. It exists to let us pass symbols and lists as literal data into our programs instead of treating them as variables and function calls.
- **`cond`** — A multi-branch conditional construct. It exists to replace deeply nested `if` statements with a flat, scannable list of cases.
- **`else`** — The fallback clause in a `cond`. It exists to provide a default path when all specific conditions fail.
- **`and`** — A short-circuiting logical AND operator. It exists to combine conditions and stop evaluating as soon as one is false.
- **`or`** — A short-circuiting logical OR operator. It exists to combine conditions and stop evaluating as soon as one is true.
- **`if`** — A conditional form. It exists to choose between two branches based on a boolean test.
- **`define`** — The form used to bind a value to a name in the global environment. It exists to give names to functions and data.
- **Metaprogramming** — Writing programs that manipulate other programs as data. It exists to build tools like compilers, linters, and algebraic systems.

### Objects and methods used

**`eq?`**
- *What it is:* The identity equality predicate.
- *Implementation:* A built-in procedure `(eq? obj1 obj2) -> boolean`.
- *Its use:* Used to check if two symbols are the exact same interned symbol.
- *Type:* Built-in procedure.
- *Responsibility:* Determines if two references point to the exact same object in memory.
- *Depends on:* Two arguments to compare.
- *Connects to:* Called by our code to compare symbols directly.
- *Shape:* Fundamental language primitive.

**`symbol?`**
- *What it is:* A type predicate for symbols.
- *Implementation:* A built-in procedure `(symbol? obj) -> boolean`.
- *Its use:* Used to check if an expression is a variable (a symbol).
- *Type:* Built-in procedure.
- *Responsibility:* Identifies whether a given value is of the symbol type.
- *Depends on:* One argument to inspect.
- *Connects to:* Called by `variable?` to check the type of an expression.
- *Shape:* Fundamental language primitive.

**`equal?`**
- *What it is:* The structural equality predicate.
- *Implementation:* A built-in procedure `(equal? obj1 obj2) -> boolean`.
- *Its use:* Used to compare lists and complex structures recursively, though `eq?` suffices for symbols.
- *Type:* Built-in procedure.
- *Responsibility:* Determines if two structures have the same contents.
- *Depends on:* Two arguments to compare.
- *Connects to:* Not explicitly used in our new code but contrasts with `eq?`.
- *Shape:* Fundamental language primitive.

**`pair?`**
- *What it is:* A type predicate for cons cells.
- *Implementation:* A built-in procedure `(pair? obj) -> boolean`.
- *Its use:* Used to verify an expression is a compound list (like a sum or product) before inspecting its `car`.
- *Type:* Built-in procedure.
- *Responsibility:* Identifies whether a given value is a cons cell.
- *Depends on:* One argument to inspect.
- *Connects to:* Called by `sum?` and `product?`.
- *Shape:* Fundamental language primitive.

**`car`**
- *What it is:* The head accessor of a cons cell.
- *Implementation:* A built-in procedure `(car pair) -> any`.
- *Its use:* Used to extract the operator (e.g., `+` or `*`) from an expression list.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the first element of a pair.
- *Depends on:* A valid pair.
- *Connects to:* Called by `sum?` and `product?`.
- *Shape:* Fundamental language primitive.

**`cdr`**
- *What it is:* The tail accessor of a cons cell.
- *Implementation:* A built-in procedure `(cdr pair) -> any`.
- *Its use:* Used to traverse lists, such as scanning elements in a set.
- *Type:* Built-in procedure.
- *Responsibility:* Returns the second element (usually the rest of the list) of a pair.
- *Depends on:* A valid pair.
- *Connects to:* Called by `element-of-set?` for recursion.
- *Shape:* Fundamental language primitive.

**`cadr`**
- *What it is:* A shorthand accessor for `(car (cdr pair))`.
- *Implementation:* A built-in procedure `(cadr pair) -> any`.
- *Its use:* Extracts the first operand (the second element of the list).
- *Type:* Built-in procedure.
- *Responsibility:* Retrieves the second item in a list.
- *Depends on:* A pair whose tail is also a pair.
- *Connects to:* Called by `addend` and `multiplier`.
- *Shape:* Standard library helper.

**`caddr`**
- *What it is:* A shorthand accessor for `(car (cdr (cdr pair)))`.
- *Implementation:* A built-in procedure `(caddr pair) -> any`.
- *Its use:* Extracts the second operand (the third element of the list).
- *Type:* Built-in procedure.
- *Responsibility:* Retrieves the third item in a list.
- *Depends on:* A list of at least three elements.
- *Connects to:* Called by `augend` and `multiplicand`.
- *Shape:* Standard library helper.

**`number?`**
- *What it is:* A type predicate for numeric values.
- *Implementation:* A built-in procedure `(number? obj) -> boolean`.
- *Its use:* Used to check if an expression is a constant number.
- *Type:* Built-in procedure.
- *Responsibility:* Identifies whether a given value is a number.
- *Depends on:* One argument to inspect.
- *Connects to:* Called by `deriv`, `make-sum`, and `make-product`.
- *Shape:* Fundamental language primitive.

**`list`**
- *What it is:* A variadic procedure that constructs a proper list.
- *Implementation:* A built-in procedure `(list arg ...) -> list`.
- *Its use:* Used to construct new algebraic expressions, like `(list '+ a b)`.
- *Type:* Built-in procedure.
- *Responsibility:* Allocates and links a chain of cons cells ending in empty list.
- *Depends on:* Any number of arguments to be placed in the list.
- *Connects to:* Called by constructors like `make-sum`.
- *Shape:* Standard library list builder.

**`error`**
- *What it is:* A procedure that halts execution and raises an exception.
- *Implementation:* A built-in procedure `(error symbol message arg ...) -> void`.
- *Its use:* Used to handle unknown expression types in `deriv`.
- *Type:* Built-in procedure.
- *Responsibility:* Terminates the program with a given error message.
- *Depends on:* A symbol, a message string, and optional context arguments.
- *Connects to:* Called in the `else` clause of `deriv`.
- *Shape:* Standard library error signaling.

**`null?`**
- *What it is:* A predicate that checks for the empty list.
- *Implementation:* A built-in procedure `(null? obj) -> boolean`.
- *Its use:* Used as the base case for list processing in sets.
- *Type:* Built-in procedure.
- *Responsibility:* Returns true only if the argument is the empty list `()`.
- *Depends on:* One argument to inspect.
- *Connects to:* Called by `element-of-set?`.
- *Shape:* Fundamental language primitive.

**`+`**
- *What it is:* The numeric addition procedure.
- *Implementation:* A built-in procedure `(+ n1 ...) -> number`.
- *Its use:* Evaluates addition of numbers when simplifying expressions.
- *Type:* Built-in procedure.
- *Responsibility:* Computes the arithmetic sum.
- *Depends on:* Numeric arguments.
- *Connects to:* Called by `make-sum`.
- *Shape:* Fundamental math primitive.

**`*`**
- *What it is:* The numeric multiplication procedure.
- *Implementation:* A built-in procedure `(* n1 ...) -> number`.
- *Its use:* Evaluates multiplication of numbers when simplifying.
- *Type:* Built-in procedure.
- *Responsibility:* Computes the arithmetic product.
- *Depends on:* Numeric arguments.
- *Connects to:* Called by `make-product`.
- *Shape:* Fundamental math primitive.

**`=`**
- *What it is:* The numeric equality predicate.
- *Implementation:* A built-in procedure `(= n1 n2) -> boolean`.
- *Its use:* Compares numbers during simplification (e.g., checking for 0 or 1).
- *Type:* Built-in procedure.
- *Responsibility:* Determines if numbers have the same mathematical value.
- *Depends on:* Numeric arguments.
- *Connects to:* Called by `make-sum`, `make-product`, `element-of-set?`.
- *Shape:* Fundamental math primitive.

**`<`**
- *What it is:* The numeric strictly-less-than predicate.
- *Implementation:* A built-in procedure `(< n1 n2) -> boolean`.
- *Its use:* Checks ordering of elements in an ordered set.
- *Type:* Built-in procedure.
- *Responsibility:* Determines if the first number is mathematically less than the second.
- *Depends on:* Numeric arguments.
- *Connects to:* Called by `element-of-set?`.
- *Shape:* Fundamental math primitive.

---

## Concept Unit: Symbols as data — quote revisited

### The Problem
Up to this point, whenever we typed a word like `x` or `hello` in our code, the language evaluator treated it as a variable and tried to look up its value. If we want to write a program that manipulates algebraic expressions (like $x + y$), we need a way to tell the evaluator: "Treat 'x' as the literal symbol x, not as a variable to evaluate."

### Introduce the concept in isolation
We use the **quote special form** (`'`) to suppress evaluation and create literal symbols.

```scheme
; Throwaway lab: Testing symbols
(define x 42)
(display 'x)    ; => x
(newline)
(display x)     ; => 42
(newline)
(display (eq? 'x 'x)) ; => #t
(newline)
(display (symbol? 'hello)) ; => #t
(newline)
```

The output proves that `'x` evaluates to the symbol `x` itself, whereas `x` evaluates to the number `42`. `eq?` confirms that two identical symbol names map to the exact same object in memory (they are interned). `symbol?` confirms the type is a symbol. This concept is called **Symbols as Data**.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our symbolic math module.
- **Files affected:** `symbolic-math.scm` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```scheme
(define x 'x)
(define y 'y)
```

### The Updated Project
```scheme
// ← new
(define x 'x)
(define y 'y)
```
These definitions create variables `x` and `y` that hold the literal symbols `x` and `y`, allowing us to use them as data.

### Mechanical walkthrough
- **`(define x 'x)`** is the form used to bind a value to a name in the global environment. It exists to give names to functions and data.
- **`x`** is the name being bound.
- **`'x`** is the quote special form (`'`) applied to `x`. Quote suppresses evaluation. It exists to let us pass symbols and lists as literal data into our programs. The result is the literal symbol `x`.
- **`(define y 'y)`** binds the symbol `y` to the name `y`.

---

## Concept Unit: Representing algebraic expressions as lists

### The Problem
We need a data structure to represent algebraic expressions like $x + 2y$. If we just type `(+ x (* 2 y))`, Scheme will try to evaluate it immediately by adding `x` to the product of `2` and `y`. We instead want to represent this expression as an Abstract Syntax Tree (AST) so our program can manipulate it algebraically.

### Introduce the concept in isolation
We can use quoted lists to build trees of symbols and numbers, representing operations.

```scheme
; Throwaway lab: Quoted lists as ASTs
(define expr '(+ x (* 2 y)))
(display (pair? expr)) ; => #t
(newline)
(display (car expr))   ; => +
(newline)
(display (cadr expr))  ; => x
(newline)
```

The output proves that `'(+ x (* 2 y))` evaluates to a list containing the symbol `+`, the symbol `x`, and the list `(* 2 y)`. We can use `car` and `cdr` functions to parse this structure. This concept is called an **Abstract Syntax Tree (AST)** represented via lists.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** SICP Section 2.3.2
- **Files affected:** `symbolic-math.scm` (modified)
- **Change type:** Add
- **Location:** Below the variable definitions.
- **Dependencies:** None.

### The New Code
```scheme
(define (variable? e) (symbol? e))
(define (same-variable? v1 v2) 
  (and (variable? v1) (variable? v2) (eq? v1 v2)))
(define (sum? e) 
  (and (pair? e) (eq? (car e) '+)))
(define (addend e) (cadr e))
(define (augend e) (caddr e))
(define (product? e) 
  (and (pair? e) (eq? (car e) '*)))
(define (multiplier e) (cadr e))
(define (multiplicand e) (caddr e))
```

### The Updated Project
```scheme
(define x 'x)
(define y 'y)

// ← new
(define (variable? e) (symbol? e))
(define (same-variable? v1 v2) 
  (and (variable? v1) (variable? v2) (eq? v1 v2)))
(define (sum? e) 
  (and (pair? e) (eq? (car e) '+)))
(define (addend e) (cadr e))
(define (augend e) (caddr e))
(define (product? e) 
  (and (pair? e) (eq? (car e) '*)))
(define (multiplier e) (cadr e))
(define (multiplicand e) (caddr e))
```
These functions form a tiny parser and data abstraction for our AST, letting us check expression types and extract operands.

### Mechanical walkthrough
- **`(define (variable? e) ...)`** is the form used to bind a value to a name in the global environment.
- **`(symbol? e)`** is a type predicate for symbols. It returns true if `e` is a symbol.
- **`(define (same-variable? v1 v2) ...)`** defines a function comparing two variables.
- **`and`** is a short-circuiting logical AND operator. It combines conditions and stops evaluating as soon as one is false.
- **`(eq? v1 v2)`** is the identity equality predicate. It checks if the two symbols are the exact same interned symbol.
- **`(define (sum? e) ...)`** defines a predicate identifying sum expressions.
- **`(pair? e)`** is a type predicate for cons cells. It ensures `e` is a list before we call `car` on it.
- **`(car e)`** is the head accessor of a cons cell. It extracts the operator from the list `e`.
- **`'+`** is the literal symbol `+`. Quote (`'`) suppresses evaluation, letting us compare the operator against the symbol `+`.
- **`(define (addend e) (cadr e))`** defines an accessor for the first operand.
- **`(cadr e)`** is a shorthand accessor for `(car (cdr e))`. It extracts the second element of the list, which is the left operand.
- **`(define (augend e) (caddr e))`** defines an accessor for the second operand.
- **`(caddr e)`** is a shorthand accessor for `(car (cdr (cdr e)))`. It extracts the third element of the list, which is the right operand.
- **`(define (product? e) ...)`** defines a predicate identifying product expressions, checking if the first element is the symbol `*`.
- **`(define (multiplier e) (cadr e))`** defines an accessor for the multiplier.
- **`(define (multiplicand e) (caddr e))`** defines an accessor for the multiplicand.

---

## Concept Unit: Symbolic differentiation

### The Problem
We want to write a program that can automatically take the derivative of any algebraic expression with respect to a variable. This requires a program that reads an expression (data), applies calculus rules, and constructs a new expression (data) as the result.

### Introduce the concept in isolation
We will use a recursive function that pattern-matches on the expression type and dispatches to the correct differentiation rule.

```scheme
; Throwaway lab: Naive recursive descent
(define (descend e)
  (cond
    [(number? e) 'num]
    [(symbol? e) 'sym]
    [(pair? e) (list 'list (descend (cadr e)))]
    [else 'unknown]))

(display (descend '(+ 5))) ; => (list num)
(newline)
```

The output proves that `cond` can be used to recursively traverse and transform lists based on their types. This concept is called **Metaprogramming**—writing programs that manipulate other programs (or expressions) as data.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** SICP Section 2.3.2
- **Files affected:** `symbolic-math.scm` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** The AST selectors defined above.

### The New Code
```scheme
(define (make-sum a b) (list '+ a b))
(define (make-product a b) (list '* a b))

(define (deriv expr var)
  (cond
    [(number? expr) 0]
    [(variable? expr) (if (same-variable? expr var) 1 0)]
    [(sum? expr)
     (make-sum (deriv (addend expr) var)
               (deriv (augend expr) var))]
    [(product? expr)
     (make-sum (make-product (multiplier expr)
                             (deriv (multiplicand expr) var))
               (make-product (deriv (multiplier expr) var)
                             (multiplicand expr)))]
    [else (error 'deriv "unknown expression type" expr)]))
```

### The Updated Project
```scheme
(define (product? e) 
  (and (pair? e) (eq? (car e) '*)))
(define (multiplier e) (cadr e))
(define (multiplicand e) (caddr e))

// ← new
(define (make-sum a b) (list '+ a b))
(define (make-product a b) (list '* a b))

(define (deriv expr var)
  (cond
    [(number? expr) 0]
    [(variable? expr) (if (same-variable? expr var) 1 0)]
    [(sum? expr)
     (make-sum (deriv (addend expr) var)
               (deriv (augend expr) var))]
    [(product? expr)
     (make-sum (make-product (multiplier expr)
                             (deriv (multiplicand expr) var))
               (make-product (deriv (multiplier expr) var)
                             (multiplicand expr)))]
    [else (error 'deriv "unknown expression type" expr)]))
```
The `deriv` function transforms mathematical expressions by applying the chain rules of calculus without ever calculating numeric results.

### Mechanical walkthrough
- **`(define (make-sum a b) ...)`** defines a constructor that takes two arguments.
- **`(list '+ a b)`** is a variadic procedure that constructs a proper list. It creates the list `(+ a b)`, acting as our naive AST node constructor.
- **`(define (deriv expr var) ...)`** defines the main differentiation function.
- **`cond`** is a multi-branch conditional construct. It replaces nested `if`s.
- **`[(number? expr) 0]`**: **`number?`** is a type predicate for numeric values. The derivative of a constant is 0.
- **`[(variable? expr) ...]`**: checks if the expression is a symbol.
- **`(if (same-variable? expr var) 1 0)`**: **`if`** is a conditional form. If the variable is the one we are differentiating with respect to, the derivative is 1; otherwise, 0.
- **`[(sum? expr) ...]`**: matches sum expressions. The derivative of a sum is the sum of the derivatives.
- **`(make-sum (deriv (addend expr) var) (deriv (augend expr) var))`** recursively computes the derivatives of the operands and wraps them in a new `+` list.
- **`[(product? expr) ...]`**: matches product expressions. Uses the product rule: $d(u*v) = u*dv + v*du$.
- **`make-product`** and **`make-sum`** construct the resulting AST tree.
- **`[else ...]`**: **`else`** is the fallback clause in a `cond`.
- **`(error 'deriv "unknown expression type" expr)`**: **`error`** halts execution and raises an exception if the expression matches none of our known types.

---

## Concept Unit: How make-sum and make-product simplify results

### The Problem
If we evaluate `(deriv '(+ x 3) 'x)`, our current naive `make-sum` will return `(+ 1 0)` instead of the simplified answer `1`. Similarly, `(deriv '(* x y) 'x)` would return `(+ (* x 0) (* 1 y))` instead of `y`. The algebraic expressions become massive and unreadable because we are not simplifying identical or zero terms.

### Introduce the concept in isolation
We can rewrite our constructors to evaluate expressions immediately when both arguments are numbers, or when one argument is 0 or 1.

```scheme
; Throwaway lab: Smart constructors
(define (smart-sum a b)
  (cond [(= a 0) b]
        [else (list '+ a b)]))

(display (smart-sum 0 'x)) ; => x
(display (smart-sum 'y 'x)) ; => (+ y x)
(newline)
```

The output proves that `smart-sum` checks the arguments and returns simplified results dynamically instead of always building a list. This concept is **Algebraic Rewriting**.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** SICP Section 2.3.2
- **Files affected:** `symbolic-math.scm` (modified)
- **Change type:** Replace
- **Location:** Replacing the previous naive `make-sum` and `make-product` definitions.
- **Dependencies:** None.

### The New Code
```scheme
(define (make-sum a b)
  (cond [(and (number? a) (number? b)) (+ a b)]
        [(and (number? a) (= a 0)) b]
        [(and (number? b) (= b 0)) a]
        [else (list '+ a b)]))

(define (make-product a b)
  (cond [(or (and (number? a) (= a 0))
             (and (number? b) (= b 0))) 0]
        [(and (number? a) (= a 1)) b]
        [(and (number? b) (= b 1)) a]
        [(and (number? a) (number? b)) (* a b)]
        [else (list '* a b)]))
```

### The Updated Project
```scheme
// ← modified (replaces previous definitions)
(define (make-sum a b)
  (cond [(and (number? a) (number? b)) (+ a b)]
        [(and (number? a) (= a 0)) b]
        [(and (number? b) (= b 0)) a]
        [else (list '+ a b)]))

(define (make-product a b)
  (cond [(or (and (number? a) (= a 0))
             (and (number? b) (= b 0))) 0]
        [(and (number? a) (= a 1)) b]
        [(and (number? b) (= b 1)) a]
        [(and (number? a) (number? b)) (* a b)]
        [else (list '* a b)]))

(define (deriv expr var)
// ... unchanged
```
These smart constructors rewrite expressions as they are being built, dramatically simplifying the final output.

### Mechanical walkthrough
- **`(define (make-sum a b) ...)`** redefines our sum constructor.
- **`cond`** is a multi-branch conditional construct.
- **`[(and (number? a) (number? b)) (+ a b)]`**: **`and`** is a short-circuiting logical AND operator. **`number?`** is a type predicate for numeric values. If both are numbers, we use **`+`**, the numeric addition procedure, to evaluate them directly.
- **`[(and (number? a) (= a 0)) b]`**: **`=`** is the numeric equality predicate. It determines if `a` is mathematically equal to `0`. If so, adding 0 to `b` is just `b`.
- **`[(and (number? b) (= b 0)) a]`**: Similar logic for `b`.
- **`[else (list '+ a b)]`**: **`else`** is the fallback clause. If no simplifications apply, we use **`list`** to construct the AST node.
- **`(define (make-product a b) ...)`** redefines our product constructor.
- **`or`** is a short-circuiting logical OR operator. It evaluates to true if either `a` or `b` is 0.
- **`0`**: If either operand is 0, the product is 0.
- **`(= a 1)`**: **`=`** checks if `a` is 1. Multiplying by 1 yields `b`.
- **`(* a b)`**: **`*`** is the numeric multiplication procedure. Evaluates the product if both are numbers.

---

## Concept Unit: Sets as ordered lists

### The Problem
When checking if an element exists in an unordered list, we have to scan every element until we find it or reach the end (an $O(n)$ worst-case operation). If we enforce that the list is always sorted, we can stop early: if we are looking for 3, and we encounter 4, we know 3 cannot be in the rest of the list.

### Introduce the concept in isolation
We rely on the `<` and `=` operators to navigate a pre-sorted list.

```scheme
; Throwaway lab: Early exit search
(define (find-ordered x lst)
  (cond [(null? lst) #f]
        [(= x (car lst)) #t]
        [(< x (car lst)) #f]
        [else (find-ordered x (cdr lst))]))

(display (find-ordered 3 '(1 2 4 5))) ; => #f
(newline)
```

The output proves that `find-ordered` correctly stops and returns `#f` when it sees `4`, since `3 < 4`. This concept is **Ordered Data Representation**, improving search average-case efficiency.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** SICP Section 2.3.3
- **Files affected:** `sets.scm` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```scheme
(define (element-of-set? x set)
  (cond
    [(null? set) #f]
    [(= x (car set)) #t]
    [(< x (car set)) #f]
    [else (element-of-set? x (cdr set))]))
```

### The Updated Project
```scheme
// ← new
(define (element-of-set? x set)
  (cond
    [(null? set) #f]
    [(= x (car set)) #t]
    [(< x (car set)) #f]
    [else (element-of-set? x (cdr set))]))
```
This function assumes the `set` list is already sorted ascending. It stops traversing the list the moment the element we are looking for is smaller than the current head of the list.

### Mechanical walkthrough
- **`(define (element-of-set? x set) ...)`** is the form used to bind our predicate to the global environment.
- **`cond`** is a multi-branch conditional construct.
- **`[(null? set) #f]`**: **`null?`** is a predicate that checks for the empty list. If the set is empty, `x` is not in it.
- **`[(= x (car set)) #t]`**: **`=`** is the numeric equality predicate. **`car`** is the head accessor of a cons cell. If `x` equals the head, we found it.
- **`[(< x (car set)) #f]`**: **`<`** is the numeric strictly-less-than predicate. Because the set is sorted, if `x` is less than the head, it cannot possibly be in the rest of the list. We return `#f` early.
- **`[else (element-of-set? x (cdr set))]`**: **`else`** is the fallback clause. **`cdr`** is the tail accessor of a cons cell. We recursively search the rest of the list.

---

Closing: Symbolic data completes SICP Chapter 2's progression: cons cells -> data abstraction -> hierarchical data -> symbolic data. The next step is Chapter 3, which introduces mutable state. Exercises: SICP 2.57 (extend `deriv` to handle sums and products of arbitrary numbers of terms, not just two) and 2.59 (implement union-set for unordered sets).
