# Lesson 21: `define-syntax` and Macros — Extending the Language

The reader will write their first macros using `define-syntax` and `syntax-rules`. They will implement `my-when`, `my-unless`, `my-and`, `my-or`, and `my-swap!`. The transferable problems: (1) a macro transforms code before it is evaluated — it is a function from syntax to syntax, operating at compile time, not run time; (2) hygienic macros (Scheme's approach via `syntax-rules`) guarantee that names introduced by the macro do not accidentally capture names from the macro's call site; (3) macros are what make it possible to add new control structures to a language without changing the language itself.

**What you need to know first:**
- Lessons 0–20 (all prior concepts through call/cc, let, letrec, named let, higher-order functions, closures).

**Terms used in this lesson:**
- **Macro** — A rule that transforms code into other code before it is evaluated. It solves the problem of needing to control evaluation order (like short-circuiting) or adding new language constructs.
- **Evaluation Order** — The sequence in which expressions are reduced to values. In Scheme (strict evaluation), function arguments are always evaluated before the function is called.
- **Hygiene** — A property of a macro system that guarantees names introduced by the macro do not accidentally capture or clash with names at the macro's call site. It solves the problem of unpredictable behavior when a macro introduces a temporary variable like `v` or `tmp`.
- **Short-circuit Evaluation** — An evaluation strategy where the second argument to an operator is only evaluated if the first argument does not suffice to determine the final value. It solves the problem of doing unnecessary or error-prone work (like calling a function if a precondition is false).
- **Expansion** — The process of applying macro rules to transform a macro call into its underlying core forms. It solves the problem of separating code generation from code execution.
- **Strict Evaluation** — An evaluation strategy where arguments are evaluated before being passed to a function.

**Objects and methods used:**
- **`define-syntax`**
  - *What it is:* A special form that binds a keyword to a macro definition.
  - *Implementation:* `(define-syntax name transformer)`
  - *Its use:* We use it to create new syntactic constructs like `my-when` and `my-and`.
  - *Type:* Core syntax form.
  - *Responsibility:* Registers a new macro keyword in the environment so the expander knows to transform calls to it.
  - *Depends on:* A transformer expression, typically created by `syntax-rules`.
  - *Connects to:* The macro expander, which looks up bindings created by `define-syntax`.
  - *Shape:* A top-level or block-level declaration.
- **`syntax-rules`**
  - *What it is:* A pattern-matching system for defining hygienic macros.
  - *Implementation:* `(syntax-rules (literal ...) [pattern template] ...)`
  - *Its use:* We use it to define the patterns our macros match and the code they expand into.
  - *Type:* Macro transformer constructor.
  - *Responsibility:* Creates a transformer that matches syntax against patterns and substitutes variables into a template, while automatically preserving hygiene.
  - *Depends on:* A list of literal keywords and a sequence of pattern-template pairs.
  - *Connects to:* `define-syntax`, which binds the resulting transformer to a name.
  - *Shape:* The body of a `define-syntax` declaration.
- **`void`**
  - *What it is:* A function that returns the unspecified "void" value.
  - *Implementation:* `(void)`
  - *Its use:* We use it to provide a branch that does nothing and returns no useful value, such as the alternate branch of `my-when`.
  - *Type:* Procedure.
  - *Responsibility:* Returns a specific value that indicates "no useful result" and is typically not printed by the REPL.
  - *Depends on:* Nothing.
  - *Connects to:* Control flow constructs that require an expression but shouldn't do anything.
  - *Shape:* A function call.
- **`begin`**
  - *What it is:* A special form that evaluates multiple expressions sequentially and returns the value of the last one.
  - *Implementation:* `(begin expr1 expr2 ...)`
  - *Its use:* We use it to group multiple expressions into a single expression context, like the body of an `if` branch.
  - *Type:* Core syntax form.
  - *Responsibility:* Sequences side effects and returns a single final value.
  - *Depends on:* One or more sub-expressions.
  - *Connects to:* Forms that only accept a single expression, allowing them to wrap multiple expressions.
  - *Shape:* A syntactic wrapper around a sequence of expressions.
- **`let`**
  - *What it is:* A form that binds variables to values in a local scope.
  - *Implementation:* `(let ([var expr] ...) body ...)`
  - *Its use:* We use it inside macros like `my-or` to evaluate an expression exactly once and bind it to a hygienic temporary variable.
  - *Type:* Syntax form (often itself a macro).
  - *Responsibility:* Creates a new lexical environment with local bindings.
  - *Depends on:* Binding pairs and a body.
  - *Connects to:* Any code needing local variables.
  - *Shape:* A block-level scoping construct.
- **`set!`**
  - *What it is:* A form that mutates an existing variable binding.
  - *Implementation:* `(set! var expr)`
  - *Its use:* We use it in `my-swap!` to change the values of variables in place.
  - *Type:* Core syntax form.
  - *Responsibility:* Changes the value bound to an identifier.
  - *Depends on:* An existing variable and a new value expression.
  - *Connects to:* State-modifying operations.
  - *Shape:* An assignment expression.
- **`if`**
  - *What it is:* The fundamental conditional form.
  - *Implementation:* `(if test consequent alternate)`
  - *Its use:* We use it as the primitive conditional that our macros expand into.
  - *Type:* Core syntax form.
  - *Responsibility:* Evaluates one branch or another based on a test.
  - *Depends on:* A test expression, a consequent expression, and an optional alternate expression.
  - *Connects to:* Control flow.
  - *Shape:* A branching expression.

## Concept Unit: Why macros? What functions cannot do

### The Problem

We want to write a control structure like `if`, but as our own abstraction. Let's call it `my-if-fn`. It takes a test, a then-branch, and an else-branch. The problem is that standard functions evaluate all their arguments before the function is even entered. If we want conditional execution, we cannot use a function, because both branches will execute before the function has a chance to choose between them.

### Isolate the Concept

Let's try to implement a conditional as a normal function.

```scheme
(define (my-if-fn test then else)
  (if test then else))

(my-if-fn #t (display "yes") (display "no"))
```

Output:
```
yesno
```

What this output proves: Both `(display "yes")` and `(display "no")` were evaluated. In Scheme (and all strict languages), function arguments are evaluated at the call site. `(display "no")` is evaluated before `my-if-fn` ever sees it. The function receives the results of `display` (which is `#<void>`), not the expressions themselves. Therefore, a function cannot control whether an argument evaluates or not.

### Discard the Lab

We are discarding `my-if-fn`. It will not appear in the project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the limitations of function evaluation.
- **Files affected:** None.
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code

No new project code in this unit; we just proved why we need a new mechanism.

### The Updated Project

N/A

### Mechanical Walkthrough

- **`my-if-fn`**: A standard function defined with `define`.
- **`#t`**: A literal true value passed as the first argument.
- **`(display "yes")`**: An expression passed as the second argument. It evaluates and prints "yes" before `my-if-fn` runs.
- **`(display "no")`**: An expression passed as the third argument. It evaluates and prints "no" before `my-if-fn` runs.

## Concept Unit: `define-syntax` and `syntax-rules` — the mechanism

### The Problem

Since functions evaluate their arguments eagerly, we need a way to define a construct that receives its arguments as raw, unevaluated code — syntax. A macro operates on unevaluated syntax. It intercepts code before it is compiled or run, transforming it into different code. We need a way to introduce these transformations.

### Isolate the Concept

Let's define a macro called `my-when` that executes its body only if a test is true.

```scheme
(define-syntax my-when
  (syntax-rules ()
    [(_ test body ...)
     (if test (begin body ...) (void))]))

(my-when #t
  (display "yes")
  (newline))

(my-when #f
  (display "never"))
```

Output:
```
yes
```

What this output proves: The `(display "never")` expression was never evaluated when the test was `#f`. This proves that `my-when` is a macro, acting on syntax before evaluation, and expanding to an `if` form where the alternate branch is taken and the consequent is ignored.

### Discard the Lab

We are discarding this isolated version, but we will add it to the project next.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own macro library.
- **Files affected:** `macros.rkt` (created).
- **Change type:** Add.
- **Location:** Top of the file.
- **Dependencies:** None.

### The New Code

```scheme
(define-syntax my-when
  (syntax-rules ()
    [(_ test body ...)
     (if test (begin body ...) (void))]))
```

### The Updated Project

```scheme
// ← new
(define-syntax my-when
  (syntax-rules ()
    [(_ test body ...)
     (if test (begin body ...) (void))]))
```
This is a brand new file `macros.rkt` containing our first macro.

### Mechanical Walkthrough

- **`define-syntax`**: Introduces a macro binding (not a function binding) for `my-when`.
- **`syntax-rules`**: The pattern-matching system for defining macro transformations.
- **`()`**: The list of "literals" — keywords that are matched by identity, not as patterns. It is empty here.
- **`[(_ test body ...) ...]`**: The macro rule. It has two parts: the pattern and the template.
- **`(_ test body ...)`**: The pattern. `_` matches the macro name itself (`my-when`) and discards it. `test` matches the first argument. `body ...` matches zero or more remaining expressions.
- **`(if test (begin body ...) (void))`**: The template. This is the code that replaces the macro call. Variables matched in the pattern (`test`, `body`) are substituted here. `body ...` expands to all the matched body expressions.
- **`begin`**: Sequences multiple expressions. `(begin expr1 expr2)` evaluates both and returns the last. This is how we put multiple body expressions where `if` expects a single expression for its consequent.
- **`void`**: Racket's "no useful value" sentinel. We use it for the alternate branch of the `if` because `when` has no else branch.
- **Expansion**: `(my-when #t (display "yes") (newline))` BECOMES `(if #t (begin (display "yes") (newline)) (void))` before it is ever evaluated.

## Concept Unit: `my-unless` — macro for "do this if NOT true"

### The Problem

We want a control structure that does the opposite of `my-when`: it evaluates its body only if the condition is false.

### Isolate the Concept

Let's write `my-unless`.

```scheme
(define-syntax my-unless
  (syntax-rules ()
    [(_ test body ...)
     (if test (void) (begin body ...))]))

(my-unless #f
  (display "condition was false")
  (newline))

(my-unless #t
  (display "never"))
```

Output:
```
condition was false
```

What this output proves: The body evaluates when the test is `#f` and is skipped when the test is `#t`. The `my-unless` macro expands to an `if` expression where the consequent is `(void)` and the alternate is the body sequence.

### Discard the Lab

We discard this lab and add it to our macro file.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macros.rkt`.
- **Change type:** Add.
- **Location:** After `my-when`.
- **Dependencies:** None.

### The New Code

```scheme
(define-syntax my-unless
  (syntax-rules ()
    [(_ test body ...)
     (if test (void) (begin body ...))]))
```

### The Updated Project

```scheme
(define-syntax my-when
  (syntax-rules ()
    [(_ test body ...)
     (if test (begin body ...) (void))]))

// ← new
(define-syntax my-unless
  (syntax-rules ()
    [(_ test body ...)
     (if test (void) (begin body ...))]))
```
We now have two custom control flow structures.

### Mechanical Walkthrough

- **`define-syntax`**: Binds the `my-unless` macro.
- **`syntax-rules`**: The transformer.
- **`()`**: Empty literals list.
- **`[(_ test body ...) ...]`**: The pattern matching the macro name, a test expression, and a sequence of body expressions.
- **`(if test (void) (begin body ...))`**: The template. If the test is true, it does nothing `(void)`. If the test is false, it evaluates the `body` expressions sequenced by `begin`.
- **Expansion**: `(my-unless #f (display "no"))` BECOMES `(if #f (void) (begin (display "no")))`.

## Concept Unit: `my-and` — short-circuit AND as a macro

### The Problem

The logical `and` operator needs short-circuit evaluation: if the first argument is false, it should immediately return false without evaluating the rest. A function cannot do this, so it must be a macro. Furthermore, it takes an arbitrary number of arguments, requiring the macro to be recursive.

### Isolate the Concept

Let's write `my-and` using multiple pattern rules.

```scheme
(define-syntax my-and
  (syntax-rules ()
    [(_) #t]                          
    [(_ e) e]                         
    [(_ e1 e2 ...)
     (if e1 (my-and e2 ...) #f)]))

(display (my-and))
(newline)
(display (my-and 1 2 3))
(newline)
(display (my-and 1 #f (error "never evaluated")))
(newline)
```

Output:
```
#t
3
#f
```

What this output proves: The error is never triggered because the macro stops evaluating as soon as it sees `#f`. It recursively expands until it handles all arguments.

### Discard the Lab

Discard the lab version.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macros.rkt`.
- **Change type:** Add.
- **Location:** After `my-unless`.
- **Dependencies:** None.

### The New Code

```scheme
(define-syntax my-and
  (syntax-rules ()
    [(_) #t]                          
    [(_ e) e]                         
    [(_ e1 e2 ...)
     (if e1 (my-and e2 ...) #f)]))
```

### The Updated Project

```scheme
(define-syntax my-unless
  (syntax-rules ()
    [(_ test body ...)
     (if test (void) (begin body ...))]))

// ← new
(define-syntax my-and
  (syntax-rules ()
    [(_) #t]                          
    [(_ e) e]                         
    [(_ e1 e2 ...)
     (if e1 (my-and e2 ...) #f)]))
```
We added a recursive macro for logical AND.

### Mechanical Walkthrough

- **`define-syntax`**: Binds `my-and`.
- **`syntax-rules`**: The transformer, this time with multiple rules.
- **`[(_) #t]`**: First rule. If `my-and` is called with no arguments, it expands to the literal `#t`.
- **`[(_ e) e]`**: Second rule. If called with exactly one argument, it expands to that argument.
- **`[(_ e1 e2 ...)`**: Third rule. If called with two or more arguments. `e1` matches the first, `e2 ...` matches the rest.
- **`(if e1 (my-and e2 ...) #f)`**: The recursive template. It evaluates `e1`. If true, it recursively expands into a call to `my-and` with the remaining arguments. If false, it returns `#f`.
- **Recursive Expansion**: `(my-and 1 2 3)` expands to `(if 1 (my-and 2 3) #f)`. This triggers the macro again, expanding to `(if 1 (if 2 (my-and 3) #f) #f)`. This triggers the second rule, expanding to `(if 1 (if 2 3 #f) #f)`. The recursive macro expansion is what makes short-circuit evaluation possible. `3` is never evaluated if `1` or `2` is false.

## Concept Unit: `my-or` — short-circuit OR as a macro

### The Problem

We want a short-circuiting `or`. It should return the first truthy value it encounters. If we just implemented it like `(if e1 e1 (my-or e2 ...))`, `e1` would be evaluated twice: once for the test, and once for the return value. If `e1` has side effects, doing it twice is a bug. We need to evaluate it once, store it in a variable, and use the variable.

### Isolate the Concept

Let's use a `let` binding inside the macro.

```scheme
(define-syntax my-or
  (syntax-rules ()
    [(_) #f]
    [(_ e) e]
    [(_ e1 e2 ...)
     (let ([v e1])
       (if v v (my-or e2 ...)))]))

(display (my-or #f #f 42))
(newline)
(display (my-or #f #f #f))
(newline)
(display (my-or 1 (error "never")))
(newline)
```

Output:
```
42
#f
1
```

What this output proves: The first truthy value (`42`, `1`) is returned, and short-circuiting prevents the error. The macro binds the evaluated result to `v` and checks it. 

### Discard the Lab

Discard the lab version.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macros.rkt`.
- **Change type:** Add.
- **Location:** After `my-and`.
- **Dependencies:** None.

### The New Code

```scheme
(define-syntax my-or
  (syntax-rules ()
    [(_) #f]
    [(_ e) e]
    [(_ e1 e2 ...)
     (let ([v e1])
       (if v v (my-or e2 ...)))]))
```

### The Updated Project

```scheme
(define-syntax my-and
  (syntax-rules ()
    [(_) #t]                          
    [(_ e) e]                         
    [(_ e1 e2 ...)
     (if e1 (my-and e2 ...) #f)]))

// ← new
(define-syntax my-or
  (syntax-rules ()
    [(_) #f]
    [(_ e) e]
    [(_ e1 e2 ...)
     (let ([v e1])
       (if v v (my-or e2 ...)))]))
```
We added our hygienic `or` macro.

### Mechanical Walkthrough

- **`define-syntax`**: Binds `my-or`.
- **`syntax-rules`**: The transformer.
- **`[(_) #f]`**: Zero arguments return `#f`.
- **`[(_ e) e]`**: One argument returns itself.
- **`[(_ e1 e2 ...)`**: Two or more arguments.
- **`let`**: Binds variables in a local scope.
- **`([v e1])`**: We bind the result of evaluating `e1` to a new variable named `v`. This ensures `e1` is evaluated exactly once.
- **`(if v v (my-or e2 ...))`**: If `v` is truthy, return `v`. Otherwise, recursively expand the rest.
- **Hygiene**: The `let` binding `v` is introduced by the macro. Scheme's macro system is "hygienic," meaning names introduced by the macro are guaranteed not to clash with any `v` in the caller's code. Even if the caller passed a variable named `v` into the macro, Scheme renames the macro's internal `v` behind the scenes to avoid capture.

## Concept Unit: `my-swap!` — swapping two variables in place

### The Problem

We want to swap the values of two variables in place. To do this, we need a temporary variable to hold one of the values while we overwrite it. And we need to mutate the actual variables provided to us — a function cannot do this because it receives copies of values (or references to values), not the bindings themselves. A macro, however, can insert `set!` operations directly into the caller's code.

### Isolate the Concept

Let's implement `my-swap!`.

```scheme
(define-syntax my-swap!
  (syntax-rules ()
    [(_ a b)
     (let ([tmp a])
       (set! a b)
       (set! b tmp))]))

(define x 1)
(define y 2)
(my-swap! x y)
(display x)
(newline)
(display y)
(newline)
```

Output:
```
2
1
```

What this output proves: The macro successfully mutated the variables `x` and `y` in the caller's scope, swapping their values. The `tmp` variable didn't interfere with anything.

### Discard the Lab

Discard the lab version.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macros.rkt`.
- **Change type:** Add.
- **Location:** After `my-or`.
- **Dependencies:** None.

### The New Code

```scheme
(define-syntax my-swap!
  (syntax-rules ()
    [(_ a b)
     (let ([tmp a])
       (set! a b)
       (set! b tmp))]))
```

### The Updated Project

```scheme
(define-syntax my-or
  (syntax-rules ()
    [(_) #f]
    [(_ e) e]
    [(_ e1 e2 ...)
     (let ([v e1])
       (if v v (my-or e2 ...)))]))

// ← new
(define-syntax my-swap!
  (syntax-rules ()
    [(_ a b)
     (let ([tmp a])
       (set! a b)
       (set! b tmp))]))
```
We have built a variable-mutating macro.

### Mechanical Walkthrough

- **`define-syntax`**: Binds `my-swap!`.
- **`syntax-rules`**: The transformer.
- **`[(_ a b)]`**: Matches the macro name and exactly two variables, `a` and `b`.
- **`let`**: Binds local variables.
- **`([tmp a])`**: Binds the value of `a` to `tmp`. `tmp` is introduced by the macro and is hygienically fresh — even if the caller has a variable named `tmp`, there is no clash.
- **`set!`**: Mutates an existing variable binding.
- **`(set! a b)`**: Replaces the value of `a` with the value of `b`.
- **`(set! b tmp)`**: Replaces the value of `b` with the original value of `a` stored in `tmp`.
- **Expansion**: `(my-swap! x y)` BECOMES `(let ([tmp x]) (set! x y) (set! y tmp))`. The caller's variables `x` and `y` are directly manipulated.

---

Macros let you extend the language. Every built-in form you have used that is NOT a function (`cond`, `when`, `let`, `and`, `or`, `define`) was implemented as a macro in terms of simpler forms. The language is not fixed — you can grow it. Exercises including writing `my-cond` (implementing cond from scratch using if and my-and) and a `dotimes` macro that runs a body N times.
