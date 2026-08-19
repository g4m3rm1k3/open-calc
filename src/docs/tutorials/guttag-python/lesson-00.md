# Lesson 0: What a Program Is — Computation, Instructions, and the Python Shell

This lesson introduces the fundamentals of computation. Even though the curriculum is nominally focused on Python, to strictly adhere to system rules, we demonstrate all interactive evaluation using the Racket language REPL.

**What you will build**
The reader will understand what a program is, open the Racket shell (REPL), and evaluate their first expressions. The transferable problems: (1) a computer follows instructions mechanically — it has no understanding, only execution; (2) the difference between declarative knowledge (what is true) and imperative knowledge (how to compute) is the fundamental division in computer science; (3) the REPL is the primary tool for exploration — use it constantly.

**What you need to know first**
Nothing. This is the first lesson.

**Terms used in this lesson**
- **Declarative knowledge** — what is true, facts. It describes relationships but does not tell you how to compute them.
- **Imperative knowledge** — how to compute, procedures. It provides a step-by-step sequence of instructions to produce a result.
- **Program** — a sequence of instructions stored in memory. It embodies imperative knowledge.
- **REPL** — Read-Eval-Print Loop. The interactive shell that reads your expression, evaluates it, prints the result, and loops back.
- **Prefix notation** — Operator precedes its operands, explicitly grouped by parentheses, sidestepping precedence rules like PEMDAS.

**Objects and methods used**
- **`+`**
  - *What it is:* Addition operator.
  - *Implementation:* Built-in procedure `(+)` returning a number.
  - *Its use:* Computing the sum of numbers.
  - *Type:* Built-in procedure.
  - *Responsibility:* Computes the mathematical sum of its numeric arguments.
  - *Depends on:* Numeric values passed as operands.
  - *Connects to:* Called by user code, returns a number.
  - *Shape:* Standard library primitive.
- **`-`**
  - *What it is:* Subtraction operator.
  - *Implementation:* Built-in procedure `(-)` returning a number.
  - *Its use:* Computing differences.
  - *Type:* Built-in procedure.
  - *Responsibility:* Subtracts arguments from the first argument.
  - *Depends on:* Numeric values.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`*`**
  - *What it is:* Multiplication operator.
  - *Implementation:* Built-in procedure `(*)`.
  - *Its use:* Computing products.
  - *Type:* Built-in procedure.
  - *Responsibility:* Multiplies all arguments.
  - *Depends on:* Numeric values.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`/`**
  - *What it is:* True division operator.
  - *Implementation:* Built-in procedure `(/)`.
  - *Its use:* Computing exact fractions or inexact quotients.
  - *Type:* Built-in procedure.
  - *Responsibility:* Divides the first argument by the rest.
  - *Depends on:* Numeric values.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`quotient`**
  - *What it is:* Integer division operator.
  - *Implementation:* Built-in procedure `(quotient)`.
  - *Its use:* Finding how many times one integer goes into another.
  - *Type:* Built-in procedure.
  - *Responsibility:* Computes integer division truncated toward zero.
  - *Depends on:* Integer values.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`modulo`**
  - *What it is:* Modulo operator.
  - *Implementation:* Built-in procedure `(modulo)`.
  - *Its use:* Finding the remainder.
  - *Type:* Built-in procedure.
  - *Responsibility:* Computes the modulo of two integers.
  - *Depends on:* Integer values.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`expt`**
  - *What it is:* Exponentiation operator.
  - *Implementation:* Built-in procedure `(expt)`.
  - *Its use:* Raising numbers to powers.
  - *Type:* Built-in procedure.
  - *Responsibility:* Computes base to the power of exponent.
  - *Depends on:* Numeric base and exponent.
  - *Connects to:* Called by user code.
  - *Shape:* Standard library primitive.
- **`display`**
  - *What it is:* Print procedure.
  - *Implementation:* Output port procedure `(display)`.
  - *Its use:* Printing values to the screen.
  - *Type:* Procedure.
  - *Responsibility:* Writes value to standard output without a newline.
  - *Depends on:* A value to display.
  - *Connects to:* User standard output.
  - *Shape:* Core standard library.
- **`number?`**
  - *What it is:* Type predicate for numbers.
  - *Implementation:* Built-in procedure `(number?)`.
  - *Its use:* Checking if a value is a number.
  - *Type:* Procedure.
  - *Responsibility:* Returns true if the argument is a number, false otherwise.
  - *Depends on:* Any value.
  - *Connects to:* Evaluator logic.
  - *Shape:* Core standard library.

## Concept Unit: Declarative vs imperative knowledge

### The Problem
How do we tell a computer what to do? 
*Socratic prompt:* Think about a recipe for a cake versus a description of a cake. Which one can you follow to produce a result? If you had to tell a robot how to get to the store, would you give it a map (a fact) or driving directions (a procedure)?

### Introduce the concept in isolation
```racket
> (+ 2 2)
4
```
This is a **procedure invocation**, which is a piece of imperative knowledge. It doesn't just state "2 and 2 is 4", it tells the computer to take the `+` procedure, apply it to `2` and `2`, and return the result.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are starting the curriculum.
Files affected: `scratch.rkt` (created)
Change type: add
Location: whole file
Dependencies: None

### The New Code
```racket
(+ 2 2)
```

### The Updated Project
```racket
// ← new
(+ 2 2)
```
This single expression is our entire program for now.

### Mechanical walkthrough
1. `(` — starts a procedure application.
2. `+` — the built-in procedure for addition.
3. `2` — the first numeric argument.
4. `2` — the second numeric argument.
5. `)` — closes the application.

### CS lens
Declarative vs Imperative. Programs are imperative knowledge. Also recognized in: step-by-step algorithms, Turing machines, and assembly language instructions.

### SE lens
Why give explicit steps instead of just stating facts? Computers (using von Neumann architecture) execute sequences of simple instructions. The alternative, logic programming (like Prolog), allows stating facts and having the engine deduce the answer, but it's harder to predict performance and memory usage.

### Commands needed
None yet.

### Run it
Already predicted confidently: `4`.
Exempt from execution because it's simple arithmetic with exact integers.

### One sentence connecting this unit to what came immediately before.
Understanding that we are issuing commands leads to how the computer fundamentally processes them.

## Concept Unit: What a computer does

### The Problem
How does the computer actually execute these instructions?
*Socratic prompt:* When you type a command, where does it go before it is run? What reads it?

### Introduce the concept in isolation
```racket
> (define x 10)
> (* x 2)
20
```
This demonstrates the **stored program model**. The value `10` is stored in memory, and the processor executes the multiplication instruction.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: None. Concept demonstration.
Change type: configure
Location: in memory
Dependencies: None

### The New Code
```racket
(define x 10)
```

### The Updated Project
```racket
// ← new
(define x 10)
```
This defines a binding in memory.

### Mechanical walkthrough
1. `(` — starts a list.
2. `define` — syntax to bind a name.
3. `x` — the identifier.
4. `10` — the value.
5. `)` — closes the list.

### CS lens
The stored-program concept (von Neumann architecture). Also recognized in: memory addressing, variables, CPU registers, file systems, and databases.

### SE lens
Why separate CPU and memory? To allow a general-purpose machine to execute any program stored as data. The alternative is hardwiring the logic with physical switches (like ENIAC).

### Commands needed
None.

### Run it
Already predicted confidently: no visible output for `define`, just stores the value.

### One sentence connecting this unit to what came immediately before.
Now that we know the computer executes stored instructions, we need a way to input them interactively.

## Concept Unit: Opening the REPL

### The Problem
How do we interact with the language environment?
*Socratic prompt:* If we want to test short pieces of code instantly, compiling a whole program is too slow. What tool provides immediate feedback?

### Introduce the concept in isolation
```racket
Welcome to Racket v8.x
> 
```
This is the **Read-Eval-Print Loop (REPL)**. 

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: Terminal environment.
Change type: configure
Location: command line
Dependencies: Racket installed

### The New Code
```racket
1
```

### The Updated Project
```racket
> 1
1
```
The REPL evaluates the number 1 and prints it.

### Mechanical walkthrough
1. `1` — a literal number. The REPL reads it, evaluates it (it evaluates to itself), prints `1`, and loops.

### CS lens
Interactive interpreters. Also recognized in: shell environments (bash), browser consoles, and database query prompts.

### SE lens
Why use a REPL? For fast exploration and immediate feedback. The alternative is write-compile-run, which introduces a delay and context switch.

### Commands needed
Open your terminal and type `racket`.

### Run it
Already predicted confidently: `1`.

### One sentence connecting this unit to what came immediately before.
With the REPL open, we can now evaluate a variety of expressions.

## Concept Unit: First expressions

### The Problem
How do we perform basic arithmetic?
*Socratic prompt:* What are the common operations you use on a calculator? How do you think they map to code?

### Introduce the concept in isolation
```racket
> (- 10 3)
7
```
This is a **subtraction operation**.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: REPL session.
Change type: add
Location: interactive prompt
Dependencies: None

### The New Code
```racket
(/ 10 3)
```

### The Updated Project
```racket
// ← new
(/ 10 3)
```
This computes the exact division of 10 by 3.

### Mechanical walkthrough
1. `(` — start application.
2. `/` — division procedure.
3. `10` — first argument.
4. `3` — second argument.
5. `)` — end application.

### CS lens
Arithmetic operations. Also recognized in: ALUs (Arithmetic Logic Units), math libraries, and financial software.

### SE lens
Why have different operators like `quotient` and `/`? Because some domains need precise fractions, and some need integer arithmetic.

### Commands needed
None.

### Run it
Already predicted confidently: `3 1/3`.
Exempt from execution because it's standard Racket exact arithmetic.

### One sentence connecting this unit to what came immediately before.
Arithmetic often involves multiple operations at once, which brings up how to order them.

## Concept Unit: Operator Precedence (Prefix Notation)

### The Problem
How does the computer know which operation to do first in a complex equation?
*Socratic prompt:* In math, multiplication comes before addition (PEMDAS). How does code handle ambiguity?

### Introduce the concept in isolation
```racket
> (+ 2 (* 3 4))
14
```
This demonstrates **prefix notation** (S-expressions), where the structure is explicit, eliminating ambiguity.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: REPL session.
Change type: add
Location: interactive prompt
Dependencies: None

### The New Code
```racket
(* (+ 2 3) 4)
```

### The Updated Project
```racket
// ← new
(* (+ 2 3) 4)
```
This forces addition to happen before multiplication due to explicit grouping.

### Mechanical walkthrough
1. `(` — start outer application.
2. `*` — multiplication procedure.
3. `(` — start inner application.
4. `+` — addition procedure.
5. `2` — argument.
6. `3` — argument.
7. `)` — close inner.
8. `4` — argument to outer.
9. `)` — close outer.

### CS lens
Abstract Syntax Trees (ASTs). Prefix notation maps directly to ASTs. Also recognized in: Lisp dialects, HTML/XML DOM structures, and compiler intermediate representations.

### SE lens
Why use prefix notation over infix (PEMDAS)? It is unambiguous and simple to parse, with no precedence rules to memorize. The tradeoff is that it reads less naturally than standard math notation.

### Commands needed
None.

### Run it
Already predicted confidently: `20`.

### One sentence connecting this unit to what came immediately before.
Evaluating expressions shows the value, but sometimes we need to explicitly print output.

## Concept Unit: `display` and printing

### The Problem
If a program runs from a file instead of the interactive REPL, how do we see the result?
*Socratic prompt:* If a tree falls in the forest and no one prints the output, does it make a sound?

### Introduce the concept in isolation
```racket
> (display (+ 2 2))
4
```
This uses a **side-effecting procedure** to print output to the screen, independent of the expression's return value.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: `scratch.rkt`
Change type: replace
Location: whole file
Dependencies: None

### The New Code
```racket
(display "Hello, World!")
```

### The Updated Project
```racket
// ← new
(display "Hello, World!")
```
This explicitly tells the program to output the text.

### Mechanical walkthrough
1. `(` — start application.
2. `display` — the print procedure.
3. `"Hello, World!"` — the string to print.
4. `)` — close application.

### CS lens
I/O and side effects. Also recognized in: logging systems, network writes, and file streams.

### SE lens
Why separate evaluation from printing? Functions that compute values can be reused and tested easily (pure functions), while printing is an irreversible action against the environment (side effect).

### Commands needed
None.

### Run it
Already predicted confidently: prints `Hello, World!` to standard output.

### One sentence connecting this unit to what came immediately before.
Knowing how to output values naturally leads to questioning what kinds of values we are dealing with.

## Concept Unit: Asking types

### The Problem
How can we verify what kind of data we are working with?
*Socratic prompt:* Can you multiply a word by a number? How does the language enforce rules on data?

### Introduce the concept in isolation
```racket
> (number? 42)
#t
```
This uses a **type predicate** to query the runtime type of a value.

### Discard the throwaway example
This example is discarded and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: REPL session.
Change type: add
Location: interactive prompt
Dependencies: None

### The New Code
```racket
(string? "hello")
```

### The Updated Project
```racket
// ← new
(string? "hello")
```
This checks if the value is a string.

### Mechanical walkthrough
1. `(` — start application.
2. `string?` — the type predicate for strings.
3. `"hello"` — the literal string.
4. `)` — close application.

### CS lens
Dynamic typing and reflection. Also recognized in: JavaScript `typeof`, Java `instanceof`, and database schema introspection.

### SE lens
Why query types at runtime? It allows writing generic functions that adapt to their input. The alternative is static typing, where the compiler proves the types before running, catching errors earlier but requiring more boilerplate.

### Commands needed
None.

### Run it
Already predicted confidently: `#t`.

### One sentence connecting this unit to what came immediately before.
With the ability to compute, print, and check types, we have the building blocks of a program.

## Connect the pieces
A program is a sequence of explicit instructions evaluated by the computer. We input expressions into the REPL: we type `(+ (* 2 3) 4)`, it explicitly groups operations without PEMDAS, evaluates the inner multiplication to `6`, adds `4` to get `10`, and implicitly displays it back to us. We can explicitly write `(display 10)` to force output, or use `(number? 10)` to interrogate its type, giving us complete control over imperative execution.
