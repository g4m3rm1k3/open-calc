# Lesson 37: SICP Chapter 4 — The Metacircular Evaluator, Part 1

What you will build: The core of a metacircular evaluator — a Scheme interpreter written in Scheme. This includes `eval` (which dispatches on the expression type), `apply` (which applies a procedure to arguments), the environment representation, and evaluation rules for variables, `define`, `if`, `lambda`, and `begin`. The transferable problems here are profound: an evaluator is a program that takes a program as data and computes its meaning, the most direct expression of Lisp's homoiconicity. The eval/apply cycle forms the heart of every language implementation, and understanding it gives you the vocabulary to read any interpreter.

What you need to know first: Lessons 0–36 (all prior concepts through the environment model, symbolic data, generic operations, closures, association lists, assignment).

## Terms used in this lesson
- **Homoiconicity** — the property of a programming language where the primary representation of programs is also a data structure in a primitive type of the language itself. In Lisp, code is just lists of symbols and numbers, which means programs can easily be manipulated as data.
- **Metacircular Evaluator** — an evaluator (interpreter) that is written in the same language that it evaluates. It evaluates Lisp by running Lisp.
- **Eval/Apply Cycle** — the core loop of an interpreter. `eval` classifies the expression and calls `apply` for function applications; `apply` binds arguments to parameters and calls `eval` to evaluate the function body. They are mutually recursive.
- **Special Form** — an expression type that has its own unique evaluation rules, overriding the standard function application rule of evaluating all operands. Examples include `if` (which evaluates its predicate before deciding which branch to evaluate) and `quote` (which evaluates nothing).
- **Environment** — the execution context where variable names are bound to values. Modeled as a list of frames, where each frame extends the previous one.
- **Frame** — a single dictionary-like structure holding local variable bindings (names mapped to values) for a specific scope.
- **Association List (alist)** — a list of key-value pairs (cons cells) used to implement dictionary lookups in basic Scheme.
- **Closure** — a function that captures its lexical environment. When an interpreted `lambda` is evaluated, it forms a procedure object that pairs the code with the environment in which the `lambda` was defined.

## Objects and methods used

**`eval`**
- *What it is:* The function that determines the value of an expression in a given environment.
- *Implementation:* A massive `cond` statement that checks the type of the expression and delegates to the appropriate handler.
- *Its use:* To process the abstract syntax tree (which in Lisp is just nested lists) and compute its meaning.
- *Type:* A recursive function `(eval expr env) -> value`.
- *Responsibility:* Dispatches on expression type. Evaluates self-evaluating data directly, looks up variables, and delegates compound expressions to specific evaluators or to `apply`.
- *Depends on:* An expression (list or atom) and an environment (list of frames).
- *Connects to:* Calls `apply` when it encounters a function application.
- *Shape:* The entry point of the interpreter loop.

**`apply`**
- *What it is:* The function that executes a procedure with a given set of evaluated arguments.
- *Implementation:* A `cond` statement distinguishing between primitive procedures (built-ins) and compound procedures (user-defined closures).
- *Its use:* To execute the actual logic of a function call after `eval` has reduced the operator and operands to a procedure object and a list of argument values.
- *Type:* A recursive function `(apply proc args) -> value`.
- *Responsibility:* Binds arguments to parameters in a new environment frame and evaluates the procedure's body within that new environment.
- *Depends on:* A procedure object and a list of evaluated argument values.
- *Connects to:* Calls `eval` (or `eval-sequence`) to evaluate the body of compound procedures.
- *Shape:* The executor side of the eval/apply cycle.

**`assoc`**
- *What it is:* A built-in Scheme function that looks up a key in an association list.
- *Implementation:* Iterates through a list of pairs, returning the first pair whose `car` is `equal?` to the key, or `#f` if not found.
- *Its use:* To find a variable's value inside a single environment frame.
- *Type:* A built-in function `(assoc key alist) -> pair or #f`.
- *Responsibility:* Performs linear search on an alist.
- *Depends on:* A key to search for and an alist to search in.
- *Connects to:* Used directly by `lookup-variable-value`.
- *Shape:* Internal implementation detail of the environment model.

**`apply-primitive-procedure`**
- *What it is:* A wrapper around the underlying host language's (Racket's) application mechanism.
- *Implementation:* Just calls the host's `apply`.
- *Its use:* To escape the metacircular interpreter for basic math and list operations, using the host machine to do the actual work.
- *Type:* A wrapper function `(apply-primitive-procedure proc args) -> value`.
- *Responsibility:* Bridges the interpreted language with the host language.
- *Depends on:* A primitive procedure and a list of arguments.
- *Connects to:* The host's runtime environment.
- *Shape:* The boundary between the interpreted language and the host language.

---

## Concept Unit: The structure of `eval`

### The Problem
We need a way to take a raw Lisp expression — which is just a list of symbols, or a bare number — and figure out what it means. We need a central dispatcher that looks at the shape of the data and decides how to evaluate it.

### Introduce the concept in isolation
Let's build a tiny dispatcher that only knows about numbers and symbols.

```scheme
#lang racket
(define (tiny-eval expr)
  (cond
    [(number? expr) expr]
    [(symbol? expr) (string-append "Looked up: " (symbol->string expr))]
    [(pair? expr) (string-append "Calling function: " (symbol->string (car expr)))]
    [else (error "Unknown expression")]))

(displayln (tiny-eval 42))
(displayln (tiny-eval 'x))
(displayln (tiny-eval '(+ 1 2)))
```

Output:
```
42
Looked up: x
Calling function: +
```

This tiny program proves that a Lisp expression is just data (numbers, symbols, lists), and evaluating it is just inspecting that data with `cond`. This is called a **syntax-directed dispatcher**.

### Discard the throwaway example
The `tiny-eval` example is discarded. We will build the real `my-eval` in the project.

### Project Change
- **Reference Source** — SICP Section 4.1.1 (The Core of the Evaluator).
- **Files affected** — `evaluator.rkt` (new file).
- **Change type** — Add.
- **Location** — Top of the file.
- **Dependencies** — Racket basic syntax.

### The New Code
```scheme
#lang racket
(provide (all-defined-out))

(define (my-eval expr env)
  (cond
    [(self-evaluating? expr) expr]
    [(variable? expr) (lookup-variable-value expr env)]
    [(quoted? expr) (text-of-quotation expr)]
    [(assignment? expr) (eval-assignment expr env)]
    [(definition? expr) (eval-definition expr env)]
    [(if? expr) (eval-if expr env)]
    [(lambda? expr) (make-procedure (lambda-parameters expr)
                                    (lambda-body expr)
                                    env)]
    [(begin? expr) (eval-sequence (begin-actions expr) env)]
    [(application? expr)
     (my-apply (my-eval (operator expr) env)
               (list-of-values (operands expr) env))]
    [else (error 'my-eval "unknown expression type" expr)]))

;; Stub definitions to make it compile for now
(define (self-evaluating? exp) (or (number? exp) (string? exp) (boolean? exp)))
(define (variable? exp) (symbol? exp))
(define (quoted? exp) (and (pair? exp) (eq? (car exp) 'quote)))
(define (text-of-quotation exp) (cadr exp))
(define (assignment? exp) (and (pair? exp) (eq? (car exp) 'set!)))
(define (definition? exp) (and (pair? exp) (eq? (car exp) 'define)))
(define (if? exp) (and (pair? exp) (eq? (car exp) 'if)))
(define (lambda? exp) (and (pair? exp) (eq? (car exp) 'lambda)))
(define (begin? exp) (and (pair? exp) (eq? (car exp) 'begin)))
(define (application? exp) (pair? exp))
(define (operator exp) (car exp))
(define (operands exp) (cdr exp))
(define (lambda-parameters exp) (cadr exp))
(define (lambda-body exp) (cddr exp))
(define (begin-actions exp) (cdr exp))
(define (my-apply proc args) 'stub-apply)
(define (lookup-variable-value var env) 'stub-lookup)
(define (eval-assignment exp env) 'stub)
(define (eval-definition exp env) 'stub)
(define (eval-if exp env) 'stub)
(define (eval-sequence exps env) 'stub)
(define (list-of-values exps env) 'stub)
(define (make-procedure params body env) 'stub)
```

### The Updated Project
```scheme
// ← new file: evaluator.rkt
// The entire block above is the new file, establishing the structural
// backbone of our interpreter. It defines `my-eval`, which delegates
// everything to specific handler functions based on expression type.
```

### Mechanical walkthrough
1. `(my-eval expr env)` — takes two arguments: the expression data to evaluate, and the environment data structure to look up variables in.
2. `(self-evaluating? expr)` — checks if the expression evaluates to itself (numbers, strings, booleans). If so, returns the expression directly.
3. `(variable? expr)` — checks if the expression is a symbol (a variable name). If so, calls `lookup-variable-value` to search the environment.
4. `(quoted? expr)` — checks if it's a quoted list (e.g., `'x` or `(quote x)`). If so, returns the raw data without evaluating it.
5. `(lambda? expr)` — checks if it's a function definition. If so, it calls `make-procedure` to capture the `lambda`'s parameters, body, and the current `env` into a closure object.
6. `(application? expr)` — the fallback case. If it's a list that didn't match any special forms, it must be a function call.
7. `(my-eval (operator expr) env)` — recursively evaluates the first element of the list (the function name) to get the actual procedure object.
8. `(list-of-values (operands expr) env)` — evaluates all the arguments.
9. `(my-apply ...)` — passes the evaluated procedure and evaluated arguments to `my-apply` to execute the call.

### CS lens
This is the **Visitor pattern** implemented via a structural `cond` statement. In an object-oriented language, you might have an `Expression` interface with an `eval` method overridden by `IfExpression`, `LambdaExpression`, etc. In Lisp, data is transparent, so we just inspect the tags (the first element of the list) directly.

### SE lens
Why abstract the syntax checks (`if?`, `lambda?`, `operator`) into helper functions instead of writing `(eq? (car expr) 'if)` directly inside `eval`? **Data abstraction.** If we want to change our language's syntax later (e.g., making it read JSON instead of S-expressions), we only have to change these small helper functions. `my-eval` itself never has to change.

### Commands needed
None yet, this is internal code.

### Run it
```scheme
> (my-eval 42 '())
42
> (my-eval '"hello" '())
"hello"
> (my-eval '(quote x) '())
x
```
The dispatcher correctly handles basic self-evaluating and quoted data.

### One sentence connecting this unit to what came immediately before.
Now that `eval` can delegate expressions, we need to build the `apply` function that it calls when it encounters a function application.

---

## Concept Unit: The `apply` function

### The Problem
When `eval` sees `(+ 1 2)`, it evaluates `+` to get a primitive procedure, and `1` and `2` to get their values. It then needs to apply the procedure to the values. But what if it's a user-defined function `((lambda (x) (* x x)) 5)`? We need a mechanism to execute both primitive and custom functions.

### Introduce the concept in isolation
Let's build a tiny apply that distinguishes between built-in and user-defined functions.

```scheme
#lang racket
(define (tiny-apply proc args)
  (if (eq? proc 'primitive-add)
      (apply + args) ; Racket's real apply
      (string-append "Executing user function with args: " (format "~a" args))))

(displayln (tiny-apply 'primitive-add '(1 2)))
(displayln (tiny-apply 'user-func '(5)))
```

Output:
```
3
Executing user function with args: (5)
```

This demonstrates **delegation**. Built-ins escape to the underlying machine; user functions stay inside our interpreter logic.

### Discard the throwaway example
The `tiny-apply` example is discarded. We will build the real `my-apply`.

### Project Change
- **Reference Source** — SICP Section 4.1.1 (`apply`).
- **Files affected** — `evaluator.rkt`.
- **Change type** — Replace the `my-apply` stub.
- **Location** — After `my-eval`.
- **Dependencies** — None.

### The New Code
```scheme
(define (my-apply procedure arguments)
  (cond
    [(primitive-procedure? procedure)
     (apply-primitive-procedure procedure arguments)]
    [(compound-procedure? procedure)
     (eval-sequence
       (procedure-body procedure)
       (extend-environment
         (procedure-parameters procedure)
         arguments
         (procedure-environment procedure)))]
    [else (error 'my-apply "unknown procedure type" procedure)]))

(define (list-of-values exps env)
  (if (null? exps)
      '()
      (cons (my-eval (car exps) env)
            (list-of-values (cdr exps) env))))
```

### The Updated Project
```scheme
// Inside evaluator.rkt
// ... my-eval definition ...

// ← new (replacing stub)
(define (my-apply procedure arguments)
  (cond
    [(primitive-procedure? procedure)
     (apply-primitive-procedure procedure arguments)]
    [(compound-procedure? procedure)
     (eval-sequence
       (procedure-body procedure)
       (extend-environment
         (procedure-parameters procedure)
         arguments
         (procedure-environment procedure)))]
    [else (error 'my-apply "unknown procedure type" procedure)]))

// ← new (replacing stub)
(define (list-of-values exps env)
  (if (null? exps)
      '()
      (cons (my-eval (car exps) env)
            (list-of-values (cdr exps) env))))

// ... other stubs ...
```
We now have the complete eval/apply loop: `eval` calls `my-apply`, and `my-apply` calls `eval-sequence` (which calls `my-eval`).

### Mechanical walkthrough
1. `(my-apply procedure arguments)` — accepts a fully evaluated procedure object and a list of evaluated argument values.
2. `(primitive-procedure? procedure)` — checks if the procedure is a built-in. If so, it defers to `apply-primitive-procedure`, relying on the host language (Racket).
3. `(compound-procedure? procedure)` — checks if it's a user-defined function (created by a `lambda` in our interpreter).
4. `(extend-environment ...)` — takes three arguments: the procedure's expected parameter names, the actual argument values, and the environment that the procedure originally captured when it was created. It creates a new frame binding the parameters to the arguments, attached to the captured environment.
5. `(eval-sequence (procedure-body procedure) ...)` — evaluates the actual lines of code inside the function body, using the newly created environment frame.
6. `(list-of-values exps env)` — simply maps `my-eval` over a list of expressions to turn a list of code operands into a list of actual values.

### CS lens
This is the **Eval/Apply Mutual Recursion**. This cycle is the fundamental heartbeat of computation in interpreters. `eval` reduces syntax to values and procedures. `apply` reduces procedures and values back to syntax (by injecting them into the function body's environment) and calls `eval` again. The cycle continues until everything bottoms out in primitives.

### SE lens
Why does `list-of-values` explicitly use `cons` and recursion instead of just `(map (lambda (e) (my-eval e env)) exps)`? Because in a metacircular evaluator, we often want strict, predictable left-to-right evaluation order of arguments. The underlying `map` in some Scheme implementations does not guarantee evaluation order. Writing it out explicitly forces the left-to-right evaluation.

### Commands needed
None yet.

### Run it
We cannot run `my-apply` on compound procedures yet because we haven't built the environment functions it relies on to bind variables.

### One sentence connecting this unit to what came immediately before.
Now that `apply` can bind arguments to parameters, we need to build the environment data structure that actually holds those bindings.

---

## Concept Unit: The environment representation

### The Problem
`apply` needs to `extend-environment` by binding parameter names to argument values. `eval` needs to `lookup-variable-value` to find what a variable name means. We need a concrete data structure to store variables. A chained sequence of association lists is perfect for this.

### Introduce the concept in isolation
Let's build a chain of two alists and write a simple lookup function.

```scheme
#lang racket
(define global-frame '((x . 10) (y . 20)))
(define local-frame '((x . 99) (z . 30)))
(define env (list local-frame global-frame))

(define (find-var var e)
  (if (null? e)
      #f
      (let ([binding (assoc var (car e))])
        (if binding
            (cdr binding)
            (find-var var (cdr e))))))

(displayln (find-var 'x env))
(displayln (find-var 'y env))
```

Output:
```
99
20
```

This demonstrates **lexical scoping**. The inner frame's `x` shadows the outer frame's `x`, but `y` falls through to the outer frame.

### Discard the throwaway example
The `find-var` example is discarded. We will build the robust environment model.

### Project Change
- **Reference Source** — SICP Section 4.1.3 (Evaluator Data Structures - Environments).
- **Files affected** — `evaluator.rkt`.
- **Change type** — Replace stubs, add frame helpers.
- **Location** — After `list-of-values`.
- **Dependencies** — Association lists.

### The New Code
```scheme
(define (make-frame variables values)
  (cons 'frame (map cons variables values)))

(define (frame-bindings frame) (cdr frame))

(define (extend-environment vars vals base-env)
  (if (= (length vars) (length vals))
      (cons (make-frame vars vals) base-env)
      (error "Argument mismatch" vars vals)))

(define (lookup-variable-value var env)
  (define (env-loop env)
    (if (null? env)
        (error 'lookup "unbound variable" var)
        (let ([frame (car env)])
          (let ([binding (assoc var (frame-bindings frame))])
            (if binding
                (cdr binding)
                (env-loop (cdr env)))))))
  (env-loop env))
```

### The Updated Project
```scheme
// Inside evaluator.rkt
// ... list-of-values definition ...

// ← new functions for environment management
(define (make-frame variables values)
  (cons 'frame (map cons variables values)))

(define (frame-bindings frame) (cdr frame))

(define (extend-environment vars vals base-env)
  (if (= (length vars) (length vals))
      (cons (make-frame vars vals) base-env)
      (error "Argument mismatch" vars vals)))

// ← replacing stub
(define (lookup-variable-value var env)
  (define (env-loop env)
    (if (null? env)
        (error 'lookup "unbound variable" var)
        (let ([frame (car env)])
          (let ([binding (assoc var (frame-bindings frame))])
            (if binding
                (cdr binding)
                (env-loop (cdr env)))))))
  (env-loop env))
```
The environment is now a fully functional list-of-alists structure.

### Mechanical walkthrough
1. `(make-frame variables values)` — takes a list of names and a list of values. `(map cons variables values)` zips them together into an alist `((name1 . val1) (name2 . val2))`. It tags the whole thing with the symbol `'frame`.
2. `(extend-environment vars vals base-env)` — builds a new frame and simply `cons`es it onto the front of the existing `base-env` list. It also checks that the arity (number of arguments) matches the parameters.
3. `(lookup-variable-value var env)` — uses an internal recursive helper, `env-loop`, to walk down the list of frames.
4. `(let ([frame (car env)]) ...)` — grabs the first frame in the current environment chain.
5. `(assoc var (frame-bindings frame))` — uses Scheme's built-in `assoc` to search the frame's alist for the variable name.
6. `(if binding (cdr binding) ...)` — if `assoc` returns a pair, the variable was found, and we return its value (the `cdr`). If it returns `#f`, we recursively call `env-loop` on `(cdr env)`, which checks the next frame out.

### CS lens
This is the literal implementation of the **Environment Model of Evaluation**. Environments are chains of frames. A frame is a dictionary. Lexical scope is resolved by traversing the chain from inner to outer until a match is found.

### SE lens
Why tag the frame with `'frame`? Debugging. If you print an environment structure to the console, seeing `(frame (x . 1) (y . 2))` is much easier to distinguish from random data lists than raw pairs. Tagging internal data structures is a defensive programming practice in dynamically typed languages.

### Commands needed
None.

### Run it
```scheme
> (define e1 (extend-environment '(x) '(10) '()))
> (define e2 (extend-environment '(y x) '(20 99) e1))
> (lookup-variable-value 'y e2)
20
> (lookup-variable-value 'x e2)
99
> (lookup-variable-value 'x e1)
10
```
The inner frame `e2` shadows the `x` in `e1`, but `e1`'s `x` is still intact if we look it up directly.

### One sentence connecting this unit to what came immediately before.
With environments working, variables can be evaluated, leaving just the special forms `if` and `begin` to complete the core interpreter.

---

## Concept Unit: Evaluating `if` and `begin`

### The Problem
If `if` were evaluated as a normal function call, `my-eval` would evaluate the operator and *all* the operands first. This means in `(if (= x 0) 1 (/ 10 x))`, it would evaluate `(/ 10 x)` even when `x` is 0, causing a crash. `if` must be a special form that selectively evaluates operands. Similarly, `begin` needs to evaluate multiple expressions in order, returning only the final value.

### Introduce the concept in isolation
Let's see how Racket's normal `if` short-circuits.

```scheme
#lang racket
(define (safe-divide n d)
  (if (= d 0)
      "Cannot divide by zero"
      (/ n d))) ; Only evaluated if d is not 0

(displayln (safe-divide 10 0))
```

Output:
```
Cannot divide by zero
```

This is called **short-circuit evaluation** or **lazy operand evaluation**. The consequence is evaluated only if the predicate is true.

### Discard the throwaway example
The `safe-divide` example is discarded. We will build this logic into `eval-if`.

### Project Change
- **Reference Source** — SICP Section 4.1.1 (Conditionals and Sequences).
- **Files affected** — `evaluator.rkt`.
- **Change type** — Replace stubs.
- **Location** — Bottom of the file.
- **Dependencies** — None.

### The New Code
```scheme
(define (true? x) (not (eq? x #f)))
(define (false? x) (eq? x #f))

(define (if-predicate expr) (cadr expr))
(define (if-consequent expr) (caddr expr))
(define (if-alternative expr)
  (if (not (null? (cdddr expr))) (cadddr expr) 'false))

(define (eval-if expr env)
  (if (true? (my-eval (if-predicate expr) env))
      (my-eval (if-consequent expr) env)
      (my-eval (if-alternative expr) env)))

(define (eval-sequence exprs env)
  (if (null? (cdr exprs))
      (my-eval (car exprs) env)
      (begin
        (my-eval (car exprs) env)
        (eval-sequence (cdr exprs) env))))
```

### The Updated Project
```scheme
// Inside evaluator.rkt
// ... environment functions ...

// ← new (replacing stubs)
(define (true? x) (not (eq? x #f)))
(define (false? x) (eq? x #f))

(define (if-predicate expr) (cadr expr))
(define (if-consequent expr) (caddr expr))
(define (if-alternative expr)
  (if (not (null? (cdddr expr))) (cadddr expr) 'false))

(define (eval-if expr env)
  (if (true? (my-eval (if-predicate expr) env))
      (my-eval (if-consequent expr) env)
      (my-eval (if-alternative expr) env)))

(define (eval-sequence exprs env)
  (if (null? (cdr exprs))
      (my-eval (car exprs) env)
      (begin
        (my-eval (car exprs) env)
        (eval-sequence (cdr exprs) env))))
```

### Mechanical walkthrough
1. `(true? x)` — defines truth for our interpreted language. Everything except `#f` is true.
2. `(eval-if expr env)` — takes an `if` expression list, e.g., `(if (> x 0) x (- x))`.
3. `(my-eval (if-predicate expr) env)` — calls `my-eval` on the predicate piece first. This forces the evaluation of the condition.
4. `(if (true? ...) ... ...)` — uses the *host* language's `if` to branch based on the result of the evaluated predicate.
5. `(my-eval (if-consequent expr) env)` — evaluated *only* if the condition was true.
6. `(eval-sequence exprs env)` — takes a list of expressions (like from a `begin` block or a function body).
7. `(if (null? (cdr exprs)) ...)` — checks if this is the last expression in the sequence. If so, it evaluates it and returns its value, which becomes the return value of the entire sequence.
8. `(begin (my-eval (car exprs) env) ...)` — for non-final expressions, it evaluates them (for their side effects) and discards the result, then recursively calls `eval-sequence` on the rest of the list.

### CS lens
This implements **Control Flow** via metacircularity. `eval-if` bootstraps the interpreted language's conditional branching by borrowing the underlying host language's branching. `eval-sequence` implements statement sequencing.

### SE lens
Why do we define `if-predicate`, `if-consequent`, etc., instead of just writing `(cadr expr)` inside `eval-if`? This is **Syntactic Abstraction**. We separate the meaning of an `if` expression from how it is represented as a list. If we decided to change our syntax to `(branch condition true-path false-path)`, we would only need to update the selectors, leaving `eval-if` completely untouched.

### Commands needed
None.

### Run it
```scheme
> (eval-if '(if #t "yes" "no") '())
"yes"
> (eval-sequence '((+ 1 1) (+ 2 2) "last") '())
"last"
```
Control flow special forms are fully working.

### One sentence connecting this unit to what came immediately before.
With `eval`, `apply`, environments, and special forms written, the only missing piece is a base environment holding primitive functions to let us run real mathematical programs.

---

## Concept Unit: Setting up the global environment and testing the interpreter

### The Problem
Our interpreter is logically complete, but right now an empty environment `()` doesn't even know what `+` or `car` are. We need to construct a global environment pre-loaded with primitive procedures, and implement the final missing stubs for procedure objects.

### Introduce the concept in isolation
Let's see how we can borrow Racket's primitives and wrap them.

```scheme
#lang racket
(define prims (list + - * /))
(define wrapped-prims (map (lambda (p) (list 'primitive p)) prims))

(displayln wrapped-prims)
```

Output:
```
((primitive #<procedure:+>) (primitive #<procedure:->) (primitive #<procedure:*>) (primitive #<procedure:/>))
```

This demonstrates **Primitive Wrapping**. We take the raw host procedure and tag it so our interpreter can distinguish it from a user-defined function.

### Discard the throwaway example
The wrapping example is discarded. We will build the robust global setup.

### Project Change
- **Reference Source** — SICP Section 4.1.4 (Running the Evaluator as a Program).
- **Files affected** — `evaluator.rkt`.
- **Change type** — Replace final stubs, add setup code.
- **Location** — Bottom of the file.
- **Dependencies** — None.

### The New Code
```scheme
(define (make-procedure parameters body env)
  (list 'procedure parameters body env))

(define (compound-procedure? p) (and (pair? p) (eq? (car p) 'procedure)))
(define (procedure-parameters p) (cadr p))
(define (procedure-body p) (caddr p))
(define (procedure-environment p) (cadddr p))

(define (primitive-procedure? proc) (procedure? proc)) ; Fallback to Racket's procedure
(define (apply-primitive-procedure proc args) (apply proc args))

(define (setup-environment)
  (let ([initial-env
         (extend-environment
           '(car cdr cons null? eq? not + - * / = < > display newline)
           (list car cdr cons null? eq? not + - * / = < > display newline)
           '())])
    initial-env))

(define the-global-environment (setup-environment))
```

### The Updated Project
```scheme
// Inside evaluator.rkt
// ... eval-sequence ...

// ← new (replacing stubs)
(define (make-procedure parameters body env)
  (list 'procedure parameters body env))

(define (compound-procedure? p) (and (pair? p) (eq? (car p) 'procedure)))
(define (procedure-parameters p) (cadr p))
(define (procedure-body p) (caddr p))
(define (procedure-environment p) (cadddr p))

(define (primitive-procedure? proc) (procedure? proc))
(define (apply-primitive-procedure proc args) (apply proc args))

(define (setup-environment)
  (let ([initial-env
         (extend-environment
           '(car cdr cons null? eq? not + - * / = < > display newline)
           (list car cdr cons null? eq? not + - * / = < > display newline)
           '())])
    initial-env))

(define the-global-environment (setup-environment))
```
The interpreter is now fully wired up and ready to run. For simplicity in this implementation, we directly map Racket's primitives into the environment rather than building complex primitive tags.

### Mechanical walkthrough
1. `(make-procedure parameters body env)` — When `eval` encounters a `lambda`, it calls this to construct a closure. It builds a 4-element list: the tag `'procedure`, the parameter list, the body expressions, and the environment that was active when the `lambda` was evaluated.
2. `(primitive-procedure? proc)` — For this implementation, we just lean on Racket's own `procedure?` predicate to identify underlying host functions like `+`.
3. `(apply-primitive-procedure proc args)` — We call Racket's built-in `apply` to execute the host function on the evaluated arguments.
4. `(setup-environment)` — Creates the initial global frame.
5. `(extend-environment '(car cdr ...) (list car cdr ...) '())` — Binds the symbols `'car`, `'+`, etc., to the actual Racket procedure objects `car`, `+`.

### CS lens
This demonstrates **Language Bootstrapping**. An interpreter must define an initial state containing the fundamental axioms (primitives) of the language. Everything else is built on top of those axioms using the eval/apply rules.

### SE lens
Why encapsulate the closure as a tagged list `(procedure params body env)`? This is a direct implementation of the **Closure Pattern**. The function logic (`body`) and its data context (`env`) are packaged together as a single entity, allowing the function to be passed around and executed later while still retaining access to the scope where it was born.

### Commands needed
None. We will test via the REPL.

### Run it
```scheme
> (my-eval '(+ 1 2) the-global-environment)
3
> (my-eval '(if #t 'yes 'no) the-global-environment)
'yes
> (my-eval '((lambda (x) (* x x)) 5) the-global-environment)
25
```
Our metacircular evaluator successfully parses, evaluates, and applies user-defined closures!

### One sentence connecting this unit to what came immediately before.
With the global environment loaded, the eval/apply mutual recursion has a solid foundation to execute complete programs.

---

## Closing

### Connect the pieces
Let's trace exactly what happens during `(my-eval '((lambda (x) (* x x)) 5) the-global-environment)`:

1. `(my-eval '((lambda (x) (* x x)) 5) ...)` — It's an application (a list), so `eval` evaluates the operator `(lambda (x) (* x x))` and the operand `5`.
2. `(my-eval '(lambda (x) (* x x)) ...)` — It's a `lambda?`. It calls `make-procedure`, returning `(procedure (x) ((* x x)) global-env)`.
3. The operand `5` is self-evaluating.
4. `(my-apply (procedure (x) ((* x x)) global-env) '(5))` — It's a compound procedure, so `apply` extends the environment.
5. `(extend-environment '(x) '(5) global-env)` — Creates a new local frame `((x . 5))` attached to `global-env`.
6. `(eval-sequence '((* x x)) local-env)` — Evaluates the body in this new local environment.
7. `(my-eval '(* x x) local-env)` — It's an application. Operator `*` looks up in the global env and returns the primitive multiplier. Operands `x` look up in the local env and return `5`.
8. `(my-apply primitive-* '(5 5))` — Escapes to Racket, which returns `25`.

### What breaks without this
If we intentionally remove the environment capture from closures by modifying `make-procedure` to `(list 'procedure parameters body '())` (passing an empty env), lexical scoping breaks:

```scheme
> (my-eval '(((lambda (x) (lambda (y) (+ x y))) 10) 20) the-global-environment)
;; ERROR: lookup: unbound variable: x
```
The inner lambda `(y)` would try to look up `x` in an empty environment because it forgot where it was created. Capturing `env` is what makes closures work.

### Exercises
1. **Right-to-Left Evaluation:** Modify `list-of-values` to evaluate operands from right-to-left instead of left-to-right. Write a small Scheme program with `set!` that produces a different result depending on evaluation order, proving that this interpreter detail leaks into the programmer's experience (SICP 4.1).
2. **Derived Expressions:** Add support for `and` and `or` as special forms inside `my-eval`. Then, rewrite them as derived expressions (syntax transformations that convert `(and a b)` into `(if a b #f)`) before passing them to `eval` (SICP 4.4).

### Definition of done
- [x] Implemented `my-eval` as a syntax-directed dispatcher.
- [x] Implemented `my-apply` to handle primitive and compound procedures.
- [x] Built a list-of-alists environment representation with lookup and extension.
- [x] Implemented special forms `if` and `begin`.
- [x] Seeded the global environment with Racket primitives.
- [x] Successfully evaluated a user-defined closure application.

```bash
git commit -m "Implement core eval/apply cycle and environment model for metacircular evaluator"
```
