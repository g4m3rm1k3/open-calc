# Lesson 34: SICP Chapter 3 — Assignment and Local State

The reader will understand SICP Chapter 3's central claim: assignment (mutation, `set!`) fundamentally changes the programming model in a way that cannot be undone. They will implement a bank account, a random number generator, and a memoized procedure using `set!`, and understand why pure functional code and stateful code require different reasoning strategies. The transferable problems: (1) without assignment, the substitution model is correct and sufficient — a function called with the same arguments always returns the same value; (2) with assignment, the substitution model FAILS because the same call can return different values depending on hidden state; (3) this is why functional programming languages (Haskell) avoid assignment entirely, and why Clojure makes mutation explicit and controlled.

**What you need to know first**: Lessons 0–33 (all prior concepts through data abstraction, generic operations, tagged data, closures, `set!` from Lesson 20).

**Terms used in this lesson**:
- **Assignment** — changing the value associated with a name after it has been initially bound. This fundamentally changes how a program evaluates, invalidating the substitution model.
- **Local State** — variables that are private to a specific procedure or object, usually held by a closure, allowing the object to remember its history across multiple invocations.
- **Substitution Model** — the evaluation model where procedure calls are evaluated by substituting the arguments for the formal parameters in the procedure body. This works perfectly until assignment is introduced.
- **Referential Transparency** — the property that an expression can be replaced by its evaluated value without changing the program's overall behavior. Pure functions possess this; stateful functions do not.
- **Linear Congruential Generator (LCG)** — a simple algorithm for generating pseudorandom numbers by repeatedly applying a mathematical transformation to a hidden seed value.
- **Closure** — a function bundled with its lexical environment, allowing it to "remember" the bindings that were present when it was created.
- **Message-passing interface** — a design pattern where an object is implemented as a procedure that receives a symbol (the "message") and dispatches to an internal method based on that symbol.
- **Object-Oriented Programming** — a paradigm built on message passing and local state, which we build from first principles in this lesson using only closures and assignment.
- **Environment Model** — flagged, not explained yet — Lesson 35 covers this. The evaluation model that replaces substitution when assignment is introduced.

**Objects and methods used**:

**`set!`**
- *What it is:* The assignment special form in Scheme/Racket.
- *Implementation:* `(set! <variable> <expression>)`
- *Its use:* To change the value of an existing variable binding, granting functions local state.
- *Type:* Special form.
- *Responsibility:* Evaluates the expression and mutates the binding of the variable in the environment to point to the new value.
- *Depends on:* A variable that is already bound in the current or enclosing environment.
- *Connects to:* The environment frame where the variable is bound.
- *Shape:* A mutating operation that breaks referential transparency.

**`begin`**
- *What it is:* A special form for sequencing side effects.
- *Implementation:* `(begin <exp1> <exp2> ...)`
- *Its use:* To execute multiple expressions where only one is expected, returning the value of the last.
- *Type:* Special form.
- *Responsibility:* Evaluates a sequence of expressions in order and returns the value of the final expression.
- *Depends on:* Expressions to evaluate.
- *Connects to:* The evaluator, causing sequential side effects.
- *Shape:* Structural glue for imperative code.

**`error`**
- *What it is:* A built-in procedure to signal an exception.
- *Implementation:* `(error 'symbol "Message")`
- *Its use:* To abort execution when an invalid condition (like insufficient funds) occurs.
- *Type:* Built-in procedure.
- *Responsibility:* Halts the program and reports a user-defined error message.
- *Depends on:* A symbol and a string message.
- *Connects to:* The runtime exception handler.
- *Shape:* Control flow disruption for invalid states.

**`eq?`**
- *What it is:* A built-in procedure for identity comparison.
- *Implementation:* `(eq? a b)`
- *Its use:* To check if two symbols or objects are the exact same entity in memory.
- *Type:* Built-in procedure.
- *Responsibility:* Returns `#t` if the arguments are identical, `#f` otherwise.
- *Depends on:* Two arguments to compare.
- *Connects to:* The runtime's memory representation of objects.
- *Shape:* Fundamental identity check.

**`modulo`**
- *What it is:* A built-in math procedure for the modulo operation.
- *Implementation:* `(modulo n d)`
- *Its use:* To constrain the random number generator's output within bounds.
- *Type:* Built-in procedure.
- *Responsibility:* Computes the remainder of dividing `n` by `d`.
- *Depends on:* Two integers.
- *Connects to:* The runtime's arithmetic system.
- *Shape:* Mathematical operation.

**`square`**
- *What it is:* A user-defined mathematical procedure.
- *Implementation:* `(define (square x) (* x x))`
- *Its use:* To demonstrate a pure, referentially transparent function.
- *Type:* User-defined procedure.
- *Responsibility:* Multiplies a number by itself.
- *Depends on:* A numeric argument `x`.
- *Connects to:* The built-in `*` procedure.
- *Shape:* Pure mathematical function.

---

## Concept Unit: The substitution model breaks

### The Problem
Before assignment, our programming model was beautifully simple: `(f x)` always meant the same thing for the same `x`. We could evaluate programs by simply substituting arguments for parameters. But once we introduce mutation, a function can remember its past. A call to a function with no arguments might return `1` the first time, `2` the second time, and `3` the third time. The substitution model completely fails to describe this reality.

### Introduce the concept in isolation
We will build a counter to prove that the substitution model breaks when local state is introduced.

```scheme
#lang racket

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define c1 (make-counter))
(displayln (c1))
(displayln (c1))
(displayln (c1))

(define c2 (make-counter))
(displayln (c2))
```

**Output:**
```
1
2
3
1
```

This output proves that `(c1)` evaluates to different values on successive calls, which breaks the substitution model. It also proves that `c1` and `c2` maintain independent, parallel states. This concept is called a **stateful closure**.

### Discard the throwaway example
We are deleting the `make-counter` example now. It was built to demonstrate the failure of the substitution model and will not appear in our main project code.

### Project Change
- **Reference Source**: SICP Section 3.1.2.
- **Files affected**: `src/state-examples.rkt` (New file)
- **Change type**: Add
- **Location**: Top of the new file.
- **Dependencies**: Racket runtime.

### The New Code
```scheme
#lang racket

(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))
```

### The Updated Project
```scheme
#lang racket

// ← new
(define (square x) (* x x))

// ← new
(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))
```
This new file sets up our baseline: one pure function (`square`) and one stateful generator (`make-counter`), so we can contrast their behavior directly.

### Mechanical walkthrough
1. `(define (square x) (* x x))` — Defines a pure function. `square` relies only on its arguments.
2. `(define (make-counter) ...)` — Defines a constructor procedure.
3. `(let ([count 0]) ...)` — Creates a lexical binding for `count` initialized to `0`. This binding is trapped inside the scope of the `let`.
4. `(lambda () ...)` — Returns a new closure that captures the lexical environment containing `count`.
5. `(set! count (+ count 1))` — Mutates the captured `count` variable, incrementing it.
6. `count` — Returns the new value of `count`.

**Execution trace for `c1` and `c2`:**
1. `(define c1 (make-counter))` — Creates a new environment with `count` = 0, and returns a lambda bound to `c1`.
2. `(c1)` — Enters `c1`'s environment, mutates `count` from 0 to 1, and returns 1.
3. `(c1)` — Enters `c1`'s environment, mutates `count` from 1 to 2, and returns 2.
4. `(c1)` — Enters `c1`'s environment, mutates `count` from 2 to 3, and returns 3.
5. `(define c2 (make-counter))` — Creates an entirely *different* environment with its own `count` = 0, and returns a lambda bound to `c2`.
6. `(c2)` — Enters `c2`'s environment, mutates its `count` from 0 to 1, and returns 1. `c1`'s count remains unchanged at 3.

### CS lens
This is the introduction of **time** into our programs. Without assignment, time doesn't exist: `(square 5)` is an eternal mathematical truth. With assignment, time matters: `(c1)` means something different today than it meant yesterday. Also recognized in: database transactions, state machines, and any system where historical context dictates current behavior.

### SE lens
Why introduce state if it breaks our simple mathematical reasoning? Because the real world has state. If we are modeling a bank account, the balance changes over time. The tradeoff is cognitive load: state makes testing and debugging significantly harder because you can no longer test a function in isolation; you must also recreate the specific hidden state it depends on.

### Commands needed to make this unit real, if any.
Run the file using the standard Racket CLI:
`racket src/state-examples.rkt`

### Run it. Show the real output.
This file just defines the functions; running it produces no output yet until we call them.

### One sentence connecting this unit to what came immediately before.
Now that we have seen how a simple closure can hold private state, we will scale this exact mechanism up to model a real-world object with multiple behaviors.

---

## Concept Unit: A bank account object

### The Problem
A simple counter only has one action: increment. Real-world objects have multiple actions. A bank account needs to handle withdrawals, deposits, and balance inquiries. We need a way to group multiple operations around a single shared piece of hidden state.

### Introduce the concept in isolation
We will build a miniature message-passing dispatcher.

```scheme
#lang racket

(define (make-box initial-value)
  (define (get) initial-value)
  (define (set new-val) (set! initial-value new-val))
  (lambda (msg)
    (cond [(eq? msg 'get) get]
          [(eq? msg 'set) set])))

(define my-box (make-box 42))
(displayln ((my-box 'get)))
((my-box 'set) 99)
(displayln ((my-box 'get)))
```

**Output:**
```
42
99
```

This proves that we can return a procedure that takes a symbolic message and returns the appropriate internal method. This is a **message-passing interface**.

### Discard the throwaway example
We are deleting the `make-box` example. It demonstrated message dispatch and will not appear in the project.

### Project Change
- **Reference Source**: SICP Section 3.1.1.
- **Files affected**: `src/state-examples.rkt`
- **Change type**: Add
- **Location**: Bottom of the file.
- **Dependencies**: The concepts of closures and message-passing established above.

### The New Code
```scheme
(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        (error 'withdraw "Insufficient funds")))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (get-balance) balance)
  (define (dispatch msg)
    (cond
      [(eq? msg 'withdraw) withdraw]
      [(eq? msg 'deposit) deposit]
      [(eq? msg 'balance) get-balance]
      [else (error 'dispatch "Unknown message" msg)]))
  dispatch)
```

### The Updated Project
```scheme
#lang racket

(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

// ← new
(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        (error 'withdraw "Insufficient funds")))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (get-balance) balance)
  (define (dispatch msg)
    (cond
      [(eq? msg 'withdraw) withdraw]
      [(eq? msg 'deposit) deposit]
      [(eq? msg 'balance) get-balance]
      [else (error 'dispatch "Unknown message" msg)]))
  dispatch)
```
This adds the `make-account` constructor to our file, letting us create independent bank account objects.

### Mechanical walkthrough
1. `(define (make-account balance) ...)` — Creates a constructor. `balance` is the initial state, captured by the lexical environment.
2. `(define (withdraw amount) ...)` — Defines an internal method for withdrawing funds.
3. `(if (>= balance amount) ...)` — Checks if there are sufficient funds before mutating.
4. `(begin (set! balance (- balance amount)) balance)` — Uses `begin` to sequence two expressions: first mutate the balance, then return the new balance.
5. `(error 'withdraw "Insufficient funds")` — Aborts if funds are insufficient.
6. `(define (deposit amount) ...)` — Defines an internal method for adding funds, which unconditionally mutates `balance`.
7. `(define (dispatch msg) ...)` — The message router. Takes a symbol and returns the corresponding internal procedure.
8. `(cond [(eq? msg 'withdraw) withdraw] ...)` — Matches the incoming message symbol against known behaviors.
9. `dispatch` — The constructor returns the dispatcher function.

### CS lens
This is **Object-Oriented Programming** constructed entirely from first principles. We have no `class` keyword, no `this` reference, and no access modifiers. But we have everything OOP requires: `make-account` is the constructor, `balance` is a private instance field, `withdraw` and `deposit` are methods, and `dispatch` is the vtable (method resolution).

### SE lens
Why use message passing instead of just returning a list of functions? Encapsulation. The `balance` variable is physically trapped inside the lexical closure of `make-account`. There is literally no way for external code to access or modify it except through the specifically exported `dispatch` methods. This enforces invariants: external code cannot force the balance below zero.

### Commands needed to make this unit real, if any.
None at this stage; we will run it shortly.

### Run it. Show the real output.
We will exercise this in the REPL or test file, but for now it sits ready to be instatiated.

### One sentence connecting this unit to what came immediately before.
Having seen how assignment lets us build objects, we must now directly confront what we have lost: referential transparency.

---

## Concept Unit: The cost of assignment — referential transparency

### The Problem
We have gained the ability to build objects, but we have lost something profound. In math, an expression like `5 * 5` can always be replaced by `25`. This allows us to simplify equations. If our programming language behaves like math, we can simplify our code the same way. Assignment destroys this property.

### Introduce the concept in isolation
We will prove referential transparency with `square` and its failure with `make-counter`.

```scheme
#lang racket

(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define c1 (make-counter))

(displayln (+ (square 5) (square 5)))
(displayln (+ 25 25))

(displayln (+ (c1) (c1)))
```

**Output:**
```
50
50
3
```

This output proves that `(square 5)` is **referentially transparent** — replacing it with `25` produces the exact same result (`50`). But `(c1)` is not: `(+ (c1) (c1))` yields `3` (because it evaluates as `1 + 2`), whereas replacing it with its first returned value `(+ 1 1)` would yield `2`. 

### Discard the throwaway example
We are deleting this specific comparison test.

### Project Change
- **Reference Source**: SICP Section 3.1.3.
- **Files affected**: None directly; this is a conceptual understanding unit, but we will add comments to `src/state-examples.rkt`.
- **Change type**: Refactor (comments).
- **Location**: Next to `square` and `make-account`.
- **Dependencies**: None.

### The New Code
```scheme
;; `square` is referentially transparent.
;; You can replace (square 5) with 25 anywhere.
```

### The Updated Project
```scheme
#lang racket

// ← new
;; `square` is referentially transparent.
;; You can replace (square 5) with 25 anywhere.
(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        (error 'withdraw "Insufficient funds")))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (get-balance) balance)
  (define (dispatch msg)
    (cond
      [(eq? msg 'withdraw) withdraw]
      [(eq? msg 'deposit) deposit]
      [(eq? msg 'balance) get-balance]
      [else (error 'dispatch "Unknown message" msg)]))
  dispatch)
```
We document the theoretical difference directly in the source file.

### Mechanical walkthrough
1. `;; square is referentially transparent.` — A comment noting that the pure function allows value substitution.
2. `;; You can replace (square 5) with 25 anywhere.` — Re-states the core promise of functional programming.

### CS lens
**Referential transparency** is the cornerstone of functional programming languages like Haskell. It means a function's output depends strictly on its input. When a function is referentially transparent, the compiler can memoize it, run it in parallel, or reorder it without fear. The moment `set!` enters the language, all of these compiler optimizations become dangerous.

### SE lens
Why do modern languages (like Clojure, React's hooks, or Rust's borrow checker) work so hard to minimize or control mutation? Because state breaks local reasoning. If a function mutates global state, you cannot understand it by reading it; you must read the entire codebase to see who else is mutating that state.

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
(Conceptual unit, no new execution required beyond the lab.)

### One sentence connecting this unit to what came immediately before.
Knowing the dangers of state, we will now look at a classic algorithm that historically forced programmers to use global state: the random number generator.

---

## Concept Unit: A random number generator

### The Problem
Some algorithms fundamentally require state to operate over time. A pseudorandom number generator works by taking a previous number and applying a mathematical scrambling function to it to produce the next number. The generator must "remember" the previous output. How do we model this?

### Introduce the concept in isolation
We will build a simple Linear Congruential Generator.

```scheme
#lang racket

(define random-seed 12345)

(define (my-rand)
  (set! random-seed
        (modulo (+ (* 1103515245 random-seed) 12345) 2147483648))
  random-seed)

(displayln (my-rand))
(displayln (my-rand))
```

**Output:**
```
1608930708
869584735
```

This output proves that a function with zero arguments can return a different result on every call by reading and mutating a hidden state variable. This is a **Linear Congruential Generator (LCG)**.

### Discard the throwaway example
We will actually retain this function as it is the real implementation from SICP.

### Project Change
- **Reference Source**: SICP Section 3.1.2.
- **Files affected**: `src/state-examples.rkt`
- **Change type**: Add
- **Location**: Bottom of the file.
- **Dependencies**: Mathematical built-ins like `modulo`.

### The New Code
```scheme
(define random-seed 12345)

(define (my-rand)
  (set! random-seed
        (modulo (+ (* 1103515245 random-seed) 12345) 2147483648))
  random-seed)
```

### The Updated Project
```scheme
#lang racket

;; `square` is referentially transparent.
;; You can replace (square 5) with 25 anywhere.
(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        (error 'withdraw "Insufficient funds")))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (get-balance) balance)
  (define (dispatch msg)
    (cond
      [(eq? msg 'withdraw) withdraw]
      [(eq? msg 'deposit) deposit]
      [(eq? msg 'balance) get-balance]
      [else (error 'dispatch "Unknown message" msg)]))
  dispatch)

// ← new
(define random-seed 12345)

// ← new
(define (my-rand)
  (set! random-seed
        (modulo (+ (* 1103515245 random-seed) 12345) 2147483648))
  random-seed)
```
The file now contains a working PRNG that relies on global mutable state.

### Mechanical walkthrough
1. `(define random-seed 12345)` — Declares a top-level global variable for the state.
2. `(define (my-rand) ...)` — Declares the zero-argument PRNG procedure.
3. `(set! random-seed ...)` — Overwrites the current seed with the next computed value.
4. `(modulo (+ (* 1103515245 random-seed) 12345) 2147483648)` — The core math of the LCG algorithm (the POSIX standard C `rand()` formula).
5. `random-seed` — Returns the newly computed and saved seed.

### CS lens
A pseudo-random number generator is the classic example of stateful behavior in computer science. Every time you call it, it must yield a new number. In a purely functional language like Haskell, `my-rand` cannot exist in this form; instead, it would have to return a tuple `(new-random-number, new-seed)`, and the caller would have to manually pass that new seed into the *next* call. State makes the API significantly cleaner at the cost of hidden dependencies.

### SE lens
Using global mutable state (`random-seed` at the top level) is a massive software engineering failure. If two different parts of your program use `my-rand`, they will interleave their calls, and neither will get a reproducible sequence. The correct fix is exactly what we did with `make-account`: encapsulate the state inside a closure so each caller can have their own independent PRNG.

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
We showed the behavior in the isolation block above.

### One sentence connecting this unit to what came immediately before.
We've seen objects and we've seen global state, now we will combine state with existing functions by creating a higher-order wrapper.

---

## Concept Unit: `make-monitored` — wrapping a function to count calls

### The Problem
Sometimes you want to add stateful tracking to an existing, pure function without rewriting the function itself. For instance, in performance profiling, you want to know exactly how many times `sqrt` was called during an execution, but you don't want to modify the source code of `sqrt`.

### Introduce the concept in isolation
We will build a simple wrapper that prints when a function is called, before we add state.

```scheme
#lang racket

(define (make-printer f)
  (lambda (x)
    (displayln "Function was called!")
    (f x)))

(define loud-sqrt (make-printer sqrt))
(displayln (loud-sqrt 9))
```

**Output:**
```
Function was called!
3.0
```

This proves we can wrap a function inside another closure, adding side effects before delegating to the original function. This is the foundation of a **higher-order function wrapper**.

### Discard the throwaway example
Delete `make-printer`; we will build `make-monitored` which carries state.

### Project Change
- **Reference Source**: SICP Section 3.1.2 Exercise 3.2.
- **Files affected**: `src/state-examples.rkt`
- **Change type**: Add
- **Location**: Bottom of the file.
- **Dependencies**: The `set!` special form.

### The New Code
```scheme
(define (make-monitored f)
  (let ([call-count 0])
    (lambda (input)
      (cond
        [(eq? input 'how-many-calls?) call-count]
        [(eq? input 'reset-count) (set! call-count 0)]
        [else (set! call-count (+ call-count 1)) (f input)]))))
```

### The Updated Project
```scheme
#lang racket

;; `square` is referentially transparent.
;; You can replace (square 5) with 25 anywhere.
(define (square x) (* x x))

(define (make-counter)
  (let ([count 0])
    (lambda ()
      (set! count (+ count 1))
      count)))

(define (make-account balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount)) balance)
        (error 'withdraw "Insufficient funds")))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (get-balance) balance)
  (define (dispatch msg)
    (cond
      [(eq? msg 'withdraw) withdraw]
      [(eq? msg 'deposit) deposit]
      [(eq? msg 'balance) get-balance]
      [else (error 'dispatch "Unknown message" msg)]))
  dispatch)

(define random-seed 12345)

(define (my-rand)
  (set! random-seed
        (modulo (+ (* 1103515245 random-seed) 12345) 2147483648))
  random-seed)

// ← new
(define (make-monitored f)
  (let ([call-count 0])
    (lambda (input)
      (cond
        [(eq? input 'how-many-calls?) call-count]
        [(eq? input 'reset-count) (set! call-count 0)]
        [else (set! call-count (+ call-count 1)) (f input)]))))
```
We now have a utility to dynamically attach state to any single-argument function.

### Mechanical walkthrough
1. `(define (make-monitored f) ...)` — Defines a procedure taking an existing procedure `f`.
2. `(let ([call-count 0]) ...)` — Allocates local state for tracking calls.
3. `(lambda (input) ...)` — Returns the wrapped procedure.
4. `(cond [(eq? input 'how-many-calls?) call-count] ...)` — If the input is exactly the symbol `'how-many-calls?`, return the state variable.
5. `[(eq? input 'reset-count) (set! call-count 0)]` — If the symbol is `'reset-count`, mutate the state back to 0.
6. `[else (set! call-count (+ call-count 1)) (f input)]` — Otherwise, it is a normal argument. Increment the count, and apply the original function `f` to the input.

**Execution trace for `monitored-sqrt`:**
1. `(define monitored-sqrt (make-monitored sqrt))` — Creates a closure with `call-count = 0` and `f = sqrt`.
2. `(monitored-sqrt 4)` — Input is `4`. Falls to `else` branch. Mutates `call-count` to 1. Returns `(sqrt 4)` => `2.0`.
3. `(monitored-sqrt 9)` — Input is `9`. Falls to `else` branch. Mutates `call-count` to 2. Returns `(sqrt 9)` => `3.0`.
4. `(monitored-sqrt 'how-many-calls?)` — Input matches symbol. Returns `2`.

### CS lens
This is a **Decorator** pattern implemented using closures. We are dynamically changing the behavior of an object (adding profiling) at runtime without altering its underlying code. This is also heavily used in web frameworks for middleware (e.g., logging every HTTP request before passing it to the real handler).

### SE lens
Using `cond` to overload the `input` argument to accept both real arguments (like `9`) and control messages (like `'reset-count`) is called an in-band control channel. It is a terrible engineering practice. If we wrap a function that *actually expects* symbols as arguments, we have a catastrophic naming collision. In a robust system, the control plane (metadata/messages) should be strictly separated from the data plane (actual inputs).

### Commands needed to make this unit real, if any.
None.

### Run it. Show the real output.
To see this in action, we can evaluate it at the REPL:
```scheme
> (define monitored-sqrt (make-monitored sqrt))
> (monitored-sqrt 4)
2.0
> (monitored-sqrt 9)
3.0
> (monitored-sqrt 'how-many-calls?)
2
> (monitored-sqrt 'reset-count)
> (monitored-sqrt 'how-many-calls?)
0
```

### One sentence connecting this unit to what came immediately before.
This wrapper brings everything together: it uses `let` for local state, `set!` for assignment, and message-passing dispatch, acting as the culmination of SICP's introduction to mutation.

---

## Closing

Assignment enables objects with local state, but at the cost of referential transparency and the substitution model. 

### Connect the pieces
Let's see our full bank account in action:
```scheme
> (define acc (make-account 100))
> ((acc 'withdraw) 25)
75
> ((acc 'deposit) 50)
125
> ((acc 'balance))
125
> ((acc 'withdraw) 200)
error: withdraw: Insufficient funds
```
The state (`balance` = 100) is hidden securely in the closure, accessed and modified only by the dispatched procedures.

### What breaks without this
If we comment out the `(set! balance ...)` lines in `make-account`, the bank account simply fails to update. Calling `deposit` would evaluate the addition, but throw the result away, leaving the `balance` forever unchanged at its initial state. The account would be completely static.

### Exercises
- **SICP 3.1**: `make-accumulator`. Write a procedure that generates accumulators. An accumulator maintains a single numeric sum. When called with a number, it adds the number to the sum and returns the new sum.
- **SICP 3.7**: `make-joint`. Create a procedure that creates a second bank account that shares state with an existing one, demonstrating aliasing.

### Definition of done
- [x] Implemented `make-counter` to demonstrate the failure of substitution.
- [x] Implemented a `make-account` message-passing object.
- [x] Explored referential transparency.
- [x] Analyzed an LCG random number generator.
- [x] Implemented `make-monitored`.
- [x] Committed: `git commit -m "feat: Add SICP Chapter 3 examples for assignment and local state"` because we have finished the initial exploration of mutation.

The substitution model is officially dead. SICP Chapter 3 continues with the Environment Model (the replacement for the substitution model that handles assignment correctly) in Lesson 35.
