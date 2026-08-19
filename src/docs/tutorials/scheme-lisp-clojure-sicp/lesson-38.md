# Lesson 38: SICP Chapter 4 — The Metacircular Evaluator, Part 2 (and Module 4 Capstone)

The reader will complete the metacircular evaluator by adding `define`, `set!`, `quote`, `cond` (as a derived expression), `let` (as a derived expression), and a driver loop (REPL). They will then step back and appreciate the full architecture. The transferable problems: (1) derived expressions — forms implemented by transforming them into more primitive forms — show that most of a language can be built on top of a tiny core; (2) a REPL is just a loop: read an expression, eval it, print the result, loop; (3) the metacircular evaluator is the clearest demonstration that language and program are the same thing in Lisp — the evaluator is a Scheme program that processes Scheme programs.

**What you need to know first:**
Lessons 0–37 (all prior concepts through my-eval, my-apply, the environment representation, eval-if, eval-sequence, the global environment, lambda evaluation).

**Terms used in this lesson:**
- **Derived expression** — a syntactic form in a language that is not evaluated directly by the core interpreter, but is instead rewritten (desugared) into more primitive forms before evaluation. This reduces the number of core forms the evaluator must understand.
- **Syntactic sugar** — language features that make code easier to write or read but do not add new expressive power, because they can be mechanically translated into existing core features.
- **REPL (Read-Eval-Print Loop)** — an interactive programming environment that takes user inputs, evaluates them, and returns the result to the user; it is the fundamental interface for interacting with a Lisp system.
- **Metacircular Evaluator** — an interpreter for a language written in the language itself.

**Objects and methods used:**
- **`define-variable!`**
  - *What it is:* A mutation operation on environments.
  - *Implementation:* A Scheme procedure `(define-variable! var val env)`
  - *Its use:* Used to add or update a binding in the current (first) frame of an environment when evaluating a `define`.
  - *Type:* Free procedure.
  - *Responsibility:* Modifies the first frame of an environment to associate a variable with a value.
  - *Depends on:* A variable name, a computed value, and an environment structure.
  - *Connects to:* Calls `set-car!` and `set-cdr!` to mutate the frame structure.
  - *Shape:* Internal evaluator mechanism.

- **`set-variable-value!`**
  - *What it is:* A mutation operation that searches environments.
  - *Implementation:* A Scheme procedure `(set-variable-value! var val env)`
  - *Its use:* Used to implement `set!`, finding an existing variable binding in the environment chain and modifying its value.
  - *Type:* Free procedure.
  - *Responsibility:* Traverses the environment chain to find a binding and mutates its value. Errors if unbound.
  - *Depends on:* A variable name, a computed value, and an environment structure.
  - *Connects to:* Calls itself recursively (via `env-loop`), and uses `set-cdr!` when the binding is found.
  - *Shape:* Internal evaluator mechanism.

- **`set-car!`**
  - *What it is:* The standard Scheme pair mutation primitive for the `car` field.
  - *Implementation:* Built-in procedure `(set-car! pair value)`
  - *Its use:* Used to prepend a new binding onto a frame's binding list.
  - *Type:* Primitive procedure.
  - *Responsibility:* Mutates the first element of a cons pair in memory.
  - *Depends on:* A pair and a new value.
  - *Connects to:* Low-level memory manipulation in Racket.
  - *Shape:* Language primitive.

- **`set-cdr!`**
  - *What it is:* The standard Scheme pair mutation primitive for the `cdr` field.
  - *Implementation:* Built-in procedure `(set-cdr! pair value)`
  - *Its use:* Used to update the value side of a variable binding pair.
  - *Type:* Primitive procedure.
  - *Responsibility:* Mutates the second element of a cons pair in memory.
  - *Depends on:* A pair and a new value.
  - *Connects to:* Low-level memory manipulation in Racket.
  - *Shape:* Language primitive.

- **`cond->if`**
  - *What it is:* A syntax transformer for `cond`.
  - *Implementation:* A Scheme procedure `(cond->if expr)`
  - *Its use:* Used in the evaluator to rewrite a `cond` expression into a nested series of `if` expressions.
  - *Type:* Free procedure.
  - *Responsibility:* Translates a list of `cond` clauses into an equivalent AST using only `if` and `begin`.
  - *Depends on:* A parsed `cond` expression.
  - *Connects to:* Calls `expand-clauses`.
  - *Shape:* Internal syntactic transformation pass.

- **`let->combination`**
  - *What it is:* A syntax transformer for `let`.
  - *Implementation:* A Scheme procedure `(let->combination expr)`
  - *Its use:* Used to rewrite a `let` block into an immediately invoked lambda expression.
  - *Type:* Free procedure.
  - *Responsibility:* Desugars local variable bindings into lambda application.
  - *Depends on:* A parsed `let` expression.
  - *Connects to:* Calls `make-lambda` and mapping procedures.
  - *Shape:* Internal syntactic transformation pass.

- **`read`**
  - *What it is:* The standard Lisp parser primitive.
  - *Implementation:* Built-in procedure `(read)`
  - *Its use:* Used in the REPL to parse a string of Scheme syntax into a Scheme data structure (AST).
  - *Type:* Primitive procedure.
  - *Responsibility:* Consumes input from standard input and returns the corresponding parsed list structure.
  - *Depends on:* The standard input stream.
  - *Connects to:* Called by `driver-loop`.
  - *Shape:* Language core primitive.

- **`driver-loop`**
  - *What it is:* The REPL implementation.
  - *Implementation:* A Scheme procedure `(driver-loop)`
  - *Its use:* Runs infinitely to prompt the user, evaluate code, and display the result.
  - *Type:* Free procedure.
  - *Responsibility:* Orchestrates the Read-Eval-Print cycle.
  - *Depends on:* `read`, `my-eval`, the global environment.
  - *Connects to:* Calls `read` for input, `my-eval` for execution, and `display` for output.
  - *Shape:* Application entry point.


## Concept Unit: Evaluating `define` and `set!`

### The Problem
We need to give our language the ability to modify environments. Without `define`, we cannot create new variables in the current scope. Without `set!`, we cannot mutate existing variables. Both of these rely on mutating the underlying environment structure.

### Introduce the concept in isolation
Before modifying our evaluator, let's look at `set-car!` and `set-cdr!` which mutate pairs directly:

```scheme
#lang r5rs
(define my-pair (cons 1 2))
(display my-pair)
(newline)

(set-car! my-pair 10)
(set-cdr! my-pair 20)
(display my-pair)
(newline)
```

Running this code produces:
```
(1 . 2)
(10 . 20)
```

This proves that `set-car!` and `set-cdr!` physically mutate the memory locations of the pair created by `cons`. This is how we will modify the environment frames.

### Discard the throwaway example
The isolated example above is discarded; we will now apply this concept to our evaluator's environment structure.

### Project Change
- **Reference Source**: None (this is a direct extension of our evaluator).
- **Files affected**: `evaluator.scm` (modified).
- **Change type**: Add definition and assignment evaluators.
- **Location**: Added at the bottom of the file.
- **Dependencies**: The environment structure from previous lessons.

### The New Code
```scheme
; Syntax predicates:
(define (definition? expr) (tagged-list? expr 'define))
(define (assignment? expr) (tagged-list? expr 'set!))
(define (tagged-list? expr tag) (and (pair? expr) (eq? (car expr) tag)))

; Definition selectors:
(define (definition-variable expr)
  (if (symbol? (cadr expr))
      (cadr expr)                    ; (define x 5)
      (caadr expr)))                 ; (define (f x) body) form

(define (definition-value expr)
  (if (symbol? (cadr expr))
      (caddr expr)                   ; (define x 5) -> 5
      (make-lambda (cdadr expr)      ; (define (f x) body) -> (lambda (x) body)
                   (cddr expr))))

(define (make-lambda parameters body) (cons 'lambda (cons parameters body)))

; Evaluation:
(define (eval-definition expr env)
  (define-variable! (definition-variable expr)
                    (my-eval (definition-value expr) env)
                    env))

(define (define-variable! var val env)
  (let ((frame (car env)))
    (let ((binding (assoc var (frame-bindings frame))))
      (if binding
          (set-cdr! binding val)           ; update existing
          (set-car! frame                  ; add new binding to frame
                    (cons (cons var val) (frame-bindings frame)))))))

(define (eval-assignment expr env)
  (set-variable-value! (cadr expr) (my-eval (caddr expr) env) env))

(define (set-variable-value! var val env)
  (define (env-loop env)
    (if (null? env)
        (error 'set! "unbound variable" var)
        (let ((binding (assoc var (frame-bindings (car env)))))
          (if binding
              (set-cdr! binding val)
              (env-loop (cdr env))))))
  (env-loop env))
```

### The Updated Project
```scheme
(define (my-eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (lookup-variable-value expr env))
        ((quoted? expr) (text-of-quotation expr))
        ((assignment? expr) (eval-assignment expr env)) ; ← new
        ((definition? expr) (eval-definition expr env)) ; ← new
        ((if? expr) (eval-if expr env))
        ((lambda? expr) (make-procedure (lambda-parameters expr)
                                        (lambda-body expr)
                                        env))
        ((begin? expr) (eval-sequence (begin-actions expr) env))
        ((application? expr) (my-apply (my-eval (operator expr) env)
                                       (list-of-values (operands expr) env)))
        (else (error "Unknown expression type -- EVAL" expr))))
```
We added clauses for assignments and definitions to our central `my-eval` loop.

### Mechanical walkthrough
- `definition?` and `assignment?` are **syntax predicates** checking if an expression is a list starting with `define` or `set!`.
- `define-variable!` retrieves the first frame in the environment (`car env`), and checks if the variable already exists using `assoc`.
- If the variable exists, `set-cdr!` mutates the pair to update its value.
- If it does not exist, `set-car!` modifies the frame itself, prepending a new `(var . val)` pair.
- `set-variable-value!` differs by searching up the environment chain using `env-loop`. It walks `(cdr env)` until it finds the binding, or errors if the variable is unbound. This mimics the real behavior of `set!`.


## Concept Unit: Derived Expressions — `cond`

### The Problem
Our language has `if`, but writing complex conditional logic with deeply nested `if` expressions is unreadable. Scheme provides `cond` for this. We could write a massive `eval-cond` procedure, but there's a better way: treat `cond` as syntactic sugar and rewrite it into nested `if`s.

### Introduce the concept in isolation
Let's manually rewrite a `cond` to nested `if`s as a demonstration:

```scheme
#lang racket
(define (make-if pred consq alt) (list 'if pred consq alt))
(display (make-if '(= x 1) ''one (make-if '(= x 2) ''two ''many)))
(newline)
```

Running this yields:
```
(if (= x 1) 'one (if (= x 2) 'two 'many))
```

This proves we can generate an `if` expression programmatically as a list of data, and then ask `my-eval` to evaluate the generated data instead of the original `cond`.

### Discard the throwaway example
The test script is discarded. We will now integrate this transformation directly.

### Project Change
- **Reference Source**: Metacircular Evaluator text.
- **Files affected**: `evaluator.scm` (modified).
- **Change type**: Add syntax transformation for `cond`.
- **Location**: Added at the bottom.

### The New Code
```scheme
; cond is just nested ifs:
(define (cond? expr) (tagged-list? expr 'cond))
(define (cond-clauses expr) (cdr expr))
(define (cond-predicate clause) (car clause))
(define (cond-actions clause) (cdr clause))

(define (cond->if expr)
  (expand-clauses (cond-clauses expr)))

(define (expand-clauses clauses)
  (if (null? clauses)
      'false
      (let ((first (car clauses))
            (rest (cdr clauses)))
        (if (eq? (cond-predicate first) 'else)
            (if (null? rest)
                (sequence->exp (cond-actions first))
                (error 'cond "else not last clause"))
            (make-if (cond-predicate first)
                     (sequence->exp (cond-actions first))
                     (expand-clauses rest))))))

(define (make-if pred consq alt) (list 'if pred consq alt))
(define (sequence->exp exprs)
  (if (null? (cdr exprs)) (car exprs) (cons 'begin exprs)))
```

### The Updated Project
```scheme
(define (my-eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (lookup-variable-value expr env))
        ; ...
        ((cond? expr) (my-eval (cond->if expr) env)) ; ← new
        (else (error "Unknown expression type -- EVAL" expr))))
```
We evaluate `(my-eval '(cond ((= 1 1) 'yes) (else 'no)) env)` => `yes`. `cond` is not built in; the evaluator rewrites it to `if` before evaluating. This is exactly what Scheme's macros do.

### Mechanical walkthrough
- `cond?` recognizes the `cond` keyword.
- `cond->if` is called during evaluation. It transforms the expression into deeply nested `if` statements.
- `expand-clauses` recursively walks through the clauses. For each clause, it generates an `if` via `make-if`, placing the expansion of the rest of the clauses as the alternative branch.
- Instead of adding `eval-cond` logic, `my-eval` just recursively evaluates the returned transformed expression.


## Concept Unit: `let` as a derived expression

### The Problem
We want local variables via `let`. We already know that `let` is just syntactic sugar for applying a `lambda` to a set of initial values. We can use the same technique we used for `cond`.

### Introduce the concept in isolation
Let's see the mechanical shape of a `let` block rewrite:

```scheme
#lang racket
(define bindings '((x 3) (y 4)))
(define body '(+ x y))

(define params (map car bindings))
(define args (map cadr bindings))

(display (cons (list 'lambda params body) args))
(newline)
```

Running this yields:
```
((lambda (x y) (+ x y)) 3 4)
```

This proves that `let` bindings can be mechanically split into parameters and arguments to construct a `lambda` application AST.

### Discard the throwaway example
We will discard this isolation test and build it into our AST logic.

### Project Change
- **Reference Source**: Metacircular Evaluator text.
- **Files affected**: `evaluator.scm` (modified).
- **Change type**: Add syntax transformation for `let`.
- **Location**: Added at the bottom.

### The New Code
```scheme
(define (let? expr) (tagged-list? expr 'let))
(define (let-bindings expr) (cadr expr))
(define (let-body expr) (cddr expr))

(define (let->combination expr)
  ; (let ((x 1) (y 2)) body) -> ((lambda (x y) body) 1 2)
  (cons (make-lambda
          (map car (let-bindings expr))
          (let-body expr))
        (map cadr (let-bindings expr))))
```

### The Updated Project
```scheme
(define (my-eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (lookup-variable-value expr env))
        ; ...
        ((let? expr) (my-eval (let->combination expr) env)) ; ← new
        (else (error "Unknown expression type -- EVAL" expr))))
```
We evaluate `(my-eval '(let ((x 3) (y 4)) (+ x y)) env)` => `7`.
The trace rewrites to `((lambda (x y) (+ x y)) 3 4)` before evaluation.

### Mechanical walkthrough
- `let?` identifies a `let` form.
- `let->combination` separates bindings into variables (`map car`) and values (`map cadr`).
- It uses `make-lambda` to construct a new lambda using the parameters and the `let-body`.
- It combines this lambda with the values as an application. This exactly mirrors the `let` desugaring we explored in Lesson 16.


## Concept Unit: The driver loop (REPL)

### The Problem
An interpreter is currently useless to users if they can only test it by hardcoding ASTs in the host language. We need an interactive prompt that takes user input as text, parses it, evaluates it, and displays the result.

### Introduce the concept in isolation
Let's see what the Scheme `read` primitive does:

```scheme
#lang racket
(display "Enter an expression: ")
(define input (read))
(display "You entered a: ")
(display (if (list? input) "list" "atom"))
(newline)
(display input)
(newline)
```

Inputting `(+ 1 2)` will output:
```
Enter an expression:
You entered a: list
(+ 1 2)
```

This proves `read` does the heavy lifting of lexical analysis and parsing, converting a string of text into Scheme pairs.

### Discard the throwaway example
The script is discarded, we will now build the loop.

### Project Change
- **Reference Source**: Metacircular Evaluator text.
- **Files affected**: `evaluator.scm` (modified).
- **Change type**: Add a REPL interface.
- **Location**: End of the file.

### The New Code
```scheme
(define input-prompt ";;; M-Eval input:")
(define output-prompt ";;; M-Eval value:")

(define (driver-loop)
  (display input-prompt)
  (newline)
  (let ((input (read)))
    (if (eq? input 'quit)
        (display "Goodbye!")
        (let ((output (my-eval input the-global-environment)))
          (display output-prompt)
          (newline)
          (display output)
          (newline)
          (driver-loop)))))
```

### The Updated Project
To use our complete evaluator, we start the loop:

```scheme
; Run it:
; (driver-loop)
```
The REPL loop is simple: display a prompt, read the expression, evaluate it, display the result, and recursively loop. In DrRacket's Interactions pane, this loop already exists — `driver-loop` makes our interpreter's own REPL.

### Mechanical walkthrough
- `display` and `newline` manage the console output.
- `(read)` pauses execution to parse an S-expression from standard input.
- We check for a `quit` symbol to break out of the recursion.
- Otherwise, we call `my-eval` with the parsed input and `the-global-environment`.
- The result is displayed, and `driver-loop` recurses into itself, forming an infinite interactive session.


## Concept Unit: The architecture: what we just built

### The Problem
We have built a lot of separate pieces. We need to step back and visualize how data flows through the complete metacircular evaluator.

### Introduce the concept in isolation
N/A — this is a high-level architectural review.

### Discard the throwaway example
N/A

### Project Change
N/A — architectural review.

### The New Code
N/A

### The Updated Project
```
[Source text: "(+ 1 2)"]
    |
    v
[read] -> Scheme data: (+ 1 2)  (a list!)
    |
    v
[my-eval with global env] -> dispatches to application? branch
    |
    v
[my-eval '+ env] -> looks up '+' -> primitive +
[list-of-values '(1 2) env] -> (1 2)
    |
    v
[my-apply primitive+ '(1 2)] -> (apply + '(1 2)) -> 3
    |
    v
[display 3]
```

### Mechanical walkthrough
Every line of Scheme you have ever typed in DrRacket goes through exactly this process — just in Racket's own implementation rather than ours. Our evaluator and Racket's evaluator are the same architecture; ours is just slower and incomplete.

- First, `read` converts text to data.
- Next, `my-eval` processes this data based on its shape (syntax).
- For procedure applications, `my-eval` delegates to `my-apply`.
- `my-apply` either executes primitive code directly, or binds arguments and calls `my-eval` on the procedure body.
- The REPL bridges this cycle indefinitely.

The metacircular evaluator is the capstone of the SICP arc. You have now seen every piece of what makes Scheme work: parsing (read), evaluation (eval), application (apply), environments, closures, and mutation.

Module 5 moves to Clojure — a modern Lisp on the JVM. Clojure uses these same ideas but adds persistent data structures, a concurrency model, and a practical ecosystem. 

Module 4 summary: you can now read any Scheme/Lisp implementation paper or codebase and understand its structure. 

**Exercises:**
- SICP 4.14 (why can't you just add `map` to the global environment using Racket's built-in map? Hint: the metacircular map would call our `my-apply`, but Racket's map calls Racket's `apply`).
- SICP 4.16 (implement `letrec` as a derived expression).
