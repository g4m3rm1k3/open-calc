# Lesson 35: SICP Chapter 3 — The Environment Model

**What you will build:**
The reader will understand SICP's environment model of evaluation — the accurate replacement for the substitution model that correctly describes how Scheme handles closures, mutation, and local state. The transferable problems: (1) a frame is a table of variable bindings; an environment is a chain of frames; a closure is a procedure paired with its definition environment; (2) `set!` mutates a binding IN A SPECIFIC FRAME, which is why two closures over different frames are independent; (3) the environment model is how EVERY real language with lexical scope and closures actually works, not just Scheme.

**What you need to know first:**
Lessons 0–34 (all prior concepts through assignment, local state, make-account, referential transparency, closures, the substitution model).

**Terms used in this lesson:**
- **frame** — A table mapping variable names to their bound values at runtime. It exists to hold the local state for a specific scope or function call.
- **environment** — A sequence (or chain) of frames, where each frame points to the frame that encloses it. It exists to define the complete set of bindings visible at any given point in execution.
- **global environment** — The outermost frame in the environment chain, where top-level definitions reside. It exists to provide a fallback for bindings not found in local frames.
- **closure** — A procedure object that pairs its code (parameters and body) with the specific environment in which it was created. It exists to allow functions to "remember" and access the variables from their defining scope even when executed outside of it.
- **lexical scope** — The rule that a function's environment is determined by where it is written in the source code, not where it is called from. It exists to provide predictable, easily readable scoping for variables.
- **binding** — The association between a variable name and its value within a specific frame. It exists to give names to values so they can be retrieved later.
- **substitution model** — The simplified mental model used previously, where evaluating a function meant replacing its parameters with arguments in its body. It exists to explain simple functional programming but breaks down when mutation is introduced.
- **environment model** — The accurate execution model where variables are looked up in chains of frames. It exists to correctly account for closures, mutation, and independent state.

**Objects and methods used:**

**`define`**
- *What it is:* A special form that creates or updates a variable binding in the current frame.
- *Implementation:* `(define name value)`
- *Its use:* Used to create variables in the global frame or locally within a procedure's execution frame.
- *Type:* Special form.
- *Responsibility:* Creates a new binding for a name to a value in the innermost current frame.
- *Depends on:* A valid symbol name and an expression that evaluates to a value.
- *Connects to:* Modifies the current frame during evaluation.
- *Shape:* A language primitive for environment mutation.

**`set!`**
- *What it is:* A special form for mutating existing variable bindings.
- *Implementation:* `(set! name value)`
- *Its use:* Used to change the value of a variable that already exists somewhere in the environment chain.
- *Type:* Special form.
- *Responsibility:* Traverses the environment chain to find the first frame containing the specified name, then updates that exact binding in place.
- *Depends on:* An existing variable binding somewhere in the current environment chain, and a new value.
- *Connects to:* Updates the environment state, affecting any closures that share the modified frame.
- *Shape:* A language primitive for local state mutation.

**`lambda`**
- *What it is:* A special form that creates procedure objects.
- *Implementation:* `(lambda (params...) body...)`
- *Its use:* Used to create the closures that capture their defining environment.
- *Type:* Special form.
- *Responsibility:* Constructs a procedure object containing the specified parameters, body, and a pointer to the environment in which the `lambda` was evaluated.
- *Depends on:* A parameter list and a body of expressions.
- *Connects to:* Reads the current environment to capture it; returns a procedure object.
- *Shape:* A language primitive for function creation.

**`let`**
- *What it is:* A special form (syntactic sugar for `lambda`) that creates local bindings.
- *Implementation:* `(let ([name value]) body...)`
- *Its use:* Used to create a temporary frame with local variables.
- *Type:* Special form.
- *Responsibility:* Evaluates bindings and executes a body in an environment extended by those bindings.
- *Depends on:* A list of binding pairs and a body expression.
- *Connects to:* Expands into a `lambda` application, creating a new environment frame.
- *Shape:* A language primitive for local scope.

**Everything else in the file, not this lesson's subject but still explained.**

**`make-account`**
- *What it is:* A factory function that creates bank account objects with encapsulated local state.
- *Implementation:* `(define (make-account balance) ...)`
- *Its use:* Used to demonstrate how the environment model creates independent state for different account instances.
- *Type:* Procedure.
- *Responsibility:* Initializes a local state variable and returns a dispatch closure providing access to operations on that state.
- *Depends on:* An initial balance value.
- *Connects to:* Calls `lambda` to create inner closures, and relies on `set!` to mutate the balance.
- *Shape:* A user-defined constructor pattern.

**`make-counter`**
- *What it is:* A factory function that creates counter objects with encapsulated local state.
- *Implementation:* `(define (make-counter) ...)`
- *Its use:* Used to demonstrate simpler closures before introducing the bank account.
- *Type:* Procedure.
- *Responsibility:* Initializes a local counter state and returns a closure that increments and returns it.
- *Depends on:* Nothing (takes no arguments).
- *Connects to:* Relies on `let` to create a frame, and `set!` to mutate it.
- *Shape:* A user-defined constructor pattern.

---

## Concept Unit: Frames and environments

### The Problem
We need a mental model for how variable names map to values during the execution of a Scheme program. The substitution model, which relies on text replacement, breaks down when variables can change their values over time. We need a way to track the active definitions at any point in a program.

### Introduce the concept in isolation
Let's see how a simple environment evaluates in DrRacket.

```scheme
(define square
  (lambda (x) (* x x)))

(define x 5)

(square x)
```

**Output:**
```
25
```

This simple evaluation proves that Scheme must be looking up the names `square` and `x` somewhere. The place it looks them up is called a **frame**. A frame is a table mapping variable names to their current values.

### Discard the throwaway example
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the environment model abstractly.
- **Files affected:** `environment-demo.rkt` (created)
- **Change type:** add
- **Location:** at the top of the file
- **Dependencies:** DrRacket

### The New Code
```scheme
;; The global frame contains bindings for our top-level definitions
(define square (lambda (x) (* x x)))
(define x 5)
```

### The Updated Project
```scheme
// ← new
;; The global frame contains bindings for our top-level definitions
(define square (lambda (x) (* x x)))
(define x 5)
```
This file now sets up a global environment with two bindings, ready for evaluation.

### Mechanical walkthrough
- `define` is a special form that creates or updates a variable binding in the current frame. Here, it creates a new binding in the global frame.
- `square` is the specific variable name being bound.
- `lambda` is a special form that creates procedure objects. In the environment model, a procedure object contains its parameters (`(x)`), its body (`(* x x)`), and a pointer to the environment in which it was created (here, the global environment).
- `x` is the parameter name for the `lambda`, and later another variable name bound to the literal value `5` in the global frame.
- `5` is a literal number value assigned to `x`.

The global environment can be visualized as an outermost frame:
```
Global frame: { square: <proc>, x: 5, ... }
```
An **environment** is a sequence of these frames. Each frame points to its enclosing frame. The global frame has no enclosing frame.

---

## Concept Unit: Evaluating a procedure call under the environment model

### The Problem
Now that we have variables bound in a global frame, we need to understand exactly what happens when we call a procedure. How are the procedure's parameters bound to the arguments, and how does it find external variables?

### Introduce the concept in isolation
Let's trace a procedure call in isolation.

```scheme
(define (square x) (* x x))
(square 5)
```

**Output:**
```
25
```

This output proves that the body of the function correctly receives the value `5` for `x`, while looking up the primitive procedure `*` from the global environment. The binding of `x` to `5` is a new **frame** created specifically for this call.

### Discard the throwaway example
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `environment-demo.rkt`
- **Change type:** add
- **Location:** appended to the end of the file
- **Dependencies:** None

### The New Code
```scheme
(square 5)
```

### The Updated Project
```scheme
;; The global frame contains bindings for our top-level definitions
(define square (lambda (x) (* x x)))
(define x 5)

(square 5)  // ← new
```
We now call the procedure defined earlier.

### Mechanical walkthrough
- `(` begins a list, which Scheme evaluates as a procedure application.
- `square` is the variable name evaluated by looking it up in the current environment (the global frame), returning the procedure object.
- `5` evaluates to the literal number 5.
- `)` closes the procedure application list.

### Execution trace
Every variable lookup follows the chain — current frame, then its enclosure, then that frame's enclosure, until found or error.

```
Step 1: Create a new frame (E1). Bind parameters to arguments -> E1: {x: 5}
Step 2: Set E1's enclosing frame pointer to square's definition environment (Global).
Step 3: Evaluate body (* x x) in E1.
Step 4: Lookup x in E1. Found -> 5.
Step 5: Lookup * in E1. Not found. Look in enclosing frame (Global). Found -> primitive procedure.
Step 6: Execute primitive multiplication (* 5 5). Return 25.
```
This ensures local variables shadow global variables with the same name, because the lookup stops at the first frame that contains the binding.

---

## Concept Unit: How closures work under the environment model

### The Problem
When a procedure returns another procedure, the inner procedure can still access the local variables of the outer procedure, even after the outer procedure has finished executing. The substitution model cannot explain this. We need the environment model to explain how these "closures" remember their data.

### Introduce the concept in isolation
Let's see a closure returning independent state.

```scheme
(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define c1 (make-counter))
(c1)
```

**Output:**
```
1
```

This proves that `c1` remembered the `count` variable that was created inside `make-counter`. The `lambda` created a **closure** that held onto the frame where `count` was bound.

### Discard the throwaway example
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `environment-demo.rkt`
- **Change type:** add
- **Location:** appended to the end of the file
- **Dependencies:** None

### The New Code
```scheme
(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define c1 (make-counter))
(define c2 (make-counter))
```

### The Updated Project
```scheme
;; The global frame contains bindings for our top-level definitions
(define square (lambda (x) (* x x)))
(define x 5)

(square 5)

// ← new
(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define c1 (make-counter))
(define c2 (make-counter))
```
This adds a stateful counter factory and creates two distinct counter objects.

### Mechanical walkthrough
- `define` is a special form that creates a new binding in the global frame for `make-counter`, `c1`, and `c2`.
- `make-counter` is the factory procedure object.
- `let` is a special form that creates a new local frame binding `count` to `0`.
- `lambda` creates a procedure object. Its defining environment is the local frame created by `let`.
- `set!` is a special form for mutating existing variable bindings. It updates the `count` variable.
- `c1` and `c2` are variables bound to the procedure objects returned by two separate calls to `make-counter`.

### Execution trace
```
Step 1: (make-counter) evaluates. Creates a let-frame (E1) enclosed in Global. E1: {count: 0}.
Step 2: lambda inside creates a closure pointing to E1. c1 is bound to this closure.
Step 3: (make-counter) evaluates again. Creates a new let-frame (E2) enclosed in Global. E2: {count: 0}.
Step 4: lambda inside creates a closure pointing to E2. c2 is bound to this closure.
Step 5: Calling (c1) creates a frame enclosed in E1. set! mutates count inside E1. E1's count becomes 1.
Step 6: Calling (c2) creates a frame enclosed in E2. set! mutates count inside E2. E2's count becomes 1.
```
`c1` and `c2` are independent because they close over DIFFERENT frames. This is the environment model's explanation for why two counters don't interfere.

---

## Concept Unit: `set!` under the environment model

### The Problem
If we create local variables, how does mutation actually work? Does it create a new variable, or change an existing one? We need to define exactly what `set!` does to the frames in the environment chain.

### Introduce the concept in isolation
Let's see the difference between `define` and `set!` in isolation.

```scheme
(define x 10)
(define (f)
  (set! x 99))
(f)
x
```

**Output:**
```
99
```

This output proves that `set!` reaches OUT of the function's own local frame and mutates the `x` that lives in the global frame.

### Discard the throwaway example
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `environment-demo.rkt`
- **Change type:** add
- **Location:** appended to the end of the file
- **Dependencies:** None

### The New Code
```scheme
(define x 10)

(define (f-set)
  (set! x 99))

(define (f-def)
  (define x 42))
```

### The Updated Project
```scheme
(define c1 (make-counter))
(define c2 (make-counter))

// ← new
(define x 10)

(define (f-set)
  (set! x 99))

(define (f-def)
  (define x 42))
```
We define two functions to contrast the behavior of `set!` with `define`.

### Mechanical walkthrough
- `define` creates a new binding in the CURRENT frame. `(define x 10)` puts `{x: 10}` in the global frame. `(define x 42)` inside `f-def` creates a local binding in `f-def`'s frame.
- `f-set` is the procedure that uses `set!`.
- `f-def` is the procedure that uses an internal `define`.
- `set!` is a special form for mutating existing variable bindings. It modifies the binding of `x`. If `var` is not found anywhere in the chain, it is an error. `define` always acts on the local, current frame.

---

## Concept Unit: The environment model and the bank account

### The Problem
We need to apply the complete environment model to a full, realistic object with local state and multiple methods: the bank account from Lesson 34.

### Introduce the concept in isolation
Let's instantiate a simple bank account and use it.

```scheme
(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (dispatch m)
    (cond ((eq? m 'withdraw) withdraw)
          ((eq? m 'deposit) deposit)
          (else (error "Unknown request" m))))
  dispatch)

(define acc (make-account 100))
((acc 'withdraw) 25)
```

**Output:**
```
75
```

This output proves that the `withdraw` method correctly found the `balance` variable in the shared environment of the account, modified it, and returned the new value.

### Discard the throwaway example
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `environment-demo.rkt`
- **Change type:** add
- **Location:** appended to the end of the file
- **Dependencies:** None

### The New Code
```scheme
(define acc (make-account 100))
((acc 'withdraw) 25)
```

### The Updated Project
```scheme
(define (f-def)
  (define x 42))

// ← new
(define acc (make-account 100))
((acc 'withdraw) 25)
```
We create an account and perform a withdrawal.

### Mechanical walkthrough
- `define` is a special form that creates a new binding in the current frame. Here it binds `acc` in the global environment.
- `acc` is the variable bound to the bank account's `dispatch` closure.
- `(` begins procedure application for `make-account`.
- `make-account` is evaluated to the bank account factory procedure.
- `100` is the numeric literal passed as the balance.
- `(` begins procedure application for the withdrawal.
- `(` begins the inner procedure application to retrieve the method from the dispatch procedure.
- `acc` evaluates to the dispatch closure.
- `'withdraw` is a symbol passed to the dispatch procedure to select the method.
- `25` is the numeric literal passed as the withdrawal amount.

### Execution trace
```
Step 1: (make-account 100) creates E1: {balance: 100, withdraw: <proc>, deposit: <proc>, dispatch: <proc>}
Step 2: acc bound to dispatch closure (env: E1)
Step 3: (acc 'withdraw) calls dispatch, returning withdraw closure (env: E1)
Step 4: (... 25) calls withdraw closure. Creates E2: {amount: 25} enclosed in E1.
Step 5: set! walks up from E2 to E1. Finds balance. Mutates it to 75.
Step 6: Return 75.
```

Closing: the environment model correctly explains closures, mutation, and why two independent objects don't interfere. It is the actual implementation strategy used by Racket, JavaScript, Python, and every other language with lexical scope. SICP Chapter 3 continues with streams (Lesson 36), which use lazy evaluation to manage state differently. Exercises: SICP 3.9 (trace the environment frames for a recursive factorial call) and 3.10 (draw the environment structure created by make-account with the let-version).
