# Lesson 0: A Language That Thinks in Lists

**What you will build**
The reader will install DrRacket (already done), open the REPL, type their first S-expression, and evaluate a handful of primitive forms. The transferable problems this lesson is actually about: (1) what an S-expression is and why parentheses carry meaning rather than being decoration; (2) what a REPL is and why it is a fundamentally different way to interact with a computer than running compiled programs; (3) why Lisp/Scheme syntax is uniform — everything is either an atom or a list — and why that uniformity is a design decision with consequences.

**What you need to know first**
Nothing. This is the first lesson.

**Terms used in this lesson**
- **Lisp/Scheme** — a family of programming languages dating back to 1958, based on the lambda calculus, known for their uniform S-expression syntax where code is represented as lists. This exists to allow code to be treated as data and manipulated easily.
- **REPL (Read-Eval-Print Loop)** — an interactive programming environment that takes user inputs, evaluates them, and returns the result. It exists to provide immediate feedback and allow exploratory programming, unlike compiled languages where the entire program must be built before running.
- **S-expression (Symbolic Expression)** — the fundamental syntactic construct in Lisp/Scheme. An S-expression is either an atom (like a number or string) or a list of S-expressions enclosed in parentheses. It exists to provide a uniform, unambiguous way to represent both data and code without complex parsing rules.
- **Atom** — the indivisible unit of an S-expression, such as a number (`42`), a string (`"hello"`), a boolean (`#t`), or a symbol (`x`). It exists to serve as the basic building blocks of lists and expressions.
- **List** — a sequence of zero or more S-expressions enclosed in parentheses, such as `(1 2 3)`. It exists as the primary compound data structure and the structure used to represent function calls and operations.
- **Prefix notation** — a mathematical notation where operators are placed before their operands, such as `(+ 1 2)`. It exists to make the language syntax uniformly handle operations with any number of arguments without precedence rules.
- **Operator position** — the first element in a list being evaluated as a function call. It exists to define unambiguously which symbol represents the action to be performed on the rest of the list.

**Objects and methods used**

- **`+`**
  - *What it is:* an addition function.
  - *Implementation:* `(+ [number] ...)`
  - *Its use:* adds numbers together.
  - *Type:* function.
  - *Responsibility:* to calculate the mathematical sum of its arguments.
  - *Depends on:* one or more numbers provided as arguments.
  - *Connects to:* called by the REPL, returns a numeric sum.
  - *Shape:* a core arithmetic operator in the language environment.

- **`-`**
  - *What it is:* a subtraction function.
  - *Implementation:* `(- [number] ...)`
  - *Its use:* subtracts numbers.
  - *Type:* function.
  - *Responsibility:* to calculate the mathematical difference of its arguments.
  - *Depends on:* one or more numbers provided as arguments.
  - *Connects to:* called by the REPL, returns a numeric difference.
  - *Shape:* a core arithmetic operator.

- **`*`**
  - *What it is:* a multiplication function.
  - *Implementation:* `(* [number] ...)`
  - *Its use:* multiplies numbers.
  - *Type:* function.
  - *Responsibility:* to calculate the mathematical product of its arguments.
  - *Depends on:* one or more numbers.
  - *Connects to:* called by the REPL, returns a numeric product.
  - *Shape:* a core arithmetic operator.

- **`/`**
  - *What it is:* a division function.
  - *Implementation:* `(/ [number] ...)`
  - *Its use:* divides numbers.
  - *Type:* function.
  - *Responsibility:* to calculate the mathematical quotient of its arguments.
  - *Depends on:* numbers, where the divisor is not zero.
  - *Connects to:* called by the REPL, returns a numeric quotient (often a fraction).
  - *Shape:* a core arithmetic operator.

- **`#lang racket`**
  - *What it is:* a language declaration directive.
  - *Implementation:* `#lang racket` at the top of a file.
  - *Its use:* specifies which language dialect DrRacket should use to interpret the file.
  - *Type:* tooling directive.
  - *Responsibility:* to instruct the DrRacket environment on parsing and evaluation rules.
  - *Depends on:* the Racket environment being installed.
  - *Connects to:* read by the DrRacket parser before any code is evaluated.
  - *Shape:* an environmental boundary configuration.

## Concept Unit: What Lisp/Scheme Is

### The Problem
We need to understand what Lisp is before we start typing code. Lisp (invented by John McCarthy in 1958) is fundamentally different from languages like C, Python, or JavaScript. Instead of mimicking computer architecture with loops and statements, it is based on the lambda calculus—a mathematical system for expressing computation. We need a way to see this historical difference in action, proving that it survived because its uniform syntax treats code and data as interchangeable. 

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting our exploration of the environment.
- **Files affected**: The DrRacket Interactions pane.
- **Change type**: Conceptual exploration.
- **Location**: The interactive prompt.
- **Dependencies**: DrRacket environment.

### The New Code
```racket
#lang racket
> "McCarthy 1958"
"McCarthy 1958"
```

### The Updated Project
The REPL now contains our string. By evaluating `"McCarthy 1958"`, we see that in Lisp, an atom simply evaluates to itself. It proves the system is running and ready to accept input based on this ancient but durable language model.

### The Throwaway Lab
```racket
#lang racket
> "Lambda Calculus Connection"
"Lambda Calculus Connection"
```

### Discard the Throwaway Code
We discard this throwaway lab string; it will not appear in our future project code.

### Mechanical Walkthrough
1. `#lang racket` — specifies the language dialect to the tool.
2. `>` — the prompt indicating the system is ready for input.
3. `"McCarthy 1958"` — an S-expression consisting of a single string literal. In Lisp, everything is an S-expression, meaning it has a strict, uniform parsing rule unlike the ad-hoc syntax of C or JavaScript.
4. `"McCarthy 1958"` (output) — the evaluated result of the string, which evaluates to itself. This uniformity is why Lisp survived: evaluation rules are simple and consistent.

## Concept Unit: The REPL

### The Problem
We need a way to interact with the Scheme environment. In compiled languages like C++, you write an entire program, compile it into an executable, and run it. We need an interactive environment that allows us to type small pieces of code and see their results immediately, which is the primary way to work in Scheme.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are learning the environment.
- **Files affected**: The DrRacket Interactions pane.
- **Change type**: Executing code interactively.
- **Location**: The interactive prompt.
- **Dependencies**: DrRacket environment.

### The New Code
```racket
#lang racket
> 42
42
```

### The Updated Project
The Interactions pane evaluates the number. The REPL (Read-Eval-Print Loop) reads our input `42`, evaluates it to the integer value `42`, prints the result to the screen, and loops back to wait for more input.

### The Throwaway Lab
```racket
#lang racket
> 99
99
```

### Discard the Throwaway Code
We discard this throwaway evaluation of `99`; it was only to prove the REPL loop continues.

### Mechanical Walkthrough
1. `#lang racket` — specifies the language.
2. `> 42` — the input prompt followed by the number `42`. The REPL's "Read" phase parses this text into an internal numeric representation.
3. `42` (output) — the REPL's "Eval" phase determines the value of the number (which is just itself), and the "Print" phase outputs it before the "Loop" returns to the prompt. This read-eval-print-loop cycle is the foundation of exploratory programming in Lisp.

## Concept Unit: S-expressions

### The Problem
We need to understand the syntactic rule that governs all of Scheme. Unlike JavaScript which has statements, expressions, loops, and operators with varying syntax rules, Lisp relies on a single rule: everything is an **S-expression**. We need to demonstrate that an S-expression is either an atom (a fundamental indivisible value) or a list (parentheses containing zero or more S-expressions).

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating syntax rules.
- **Files affected**: The DrRacket Interactions pane.
- **Change type**: Executing code interactively.
- **Location**: The interactive prompt.
- **Dependencies**: DrRacket environment.

### The New Code
```racket
#lang racket
> 42
42
> "hello"
"hello"
> #t
#t
> '(1 2 3)
'(1 2 3)
> '(1 (2 3) 4)
'(1 (2 3) 4)
```

### The Updated Project
The REPL processes a sequence of different S-expressions. The first three are atoms (a number, a string, a boolean), and the last two are lists (a flat list and a nested list). This shows that parentheses carry structural meaning, defining boundaries explicitly rather than acting as mere decoration.

### The Throwaway Lab
```racket
#lang racket
> '#f
#f
> '(a b c)
'(a b c)
```

### Discard the Throwaway Code
We discard these throwaway boolean and list evaluations; they exist only to isolate the concept.

### Mechanical Walkthrough
1. `#lang racket` — language declaration.
2. `> 42` — evaluates an integer atom.
3. `> "hello"` — evaluates a string atom.
4. `> #t` — evaluates a boolean atom (true). 
5. `> '(1 2 3)` — the quote `'` tells the REPL to treat the list `(1 2 3)` as literal data rather than a function call. A list is defined by an opening parenthesis, a sequence of S-expressions, and a closing parenthesis.
6. `> '(1 (2 3) 4)` — demonstrates that lists can be nested. The S-expression `(2 3)` is an element within the outer list, showing the recursive nature of the language's single syntactic rule.

## Concept Unit: Prefix notation

### The Problem
We need a way to perform operations like addition and subtraction. In languages like Python, we use infix notation (`1 + 2`). We need to understand why Scheme uses **prefix notation** (`(+ 1 2)`), what operator position means, and how this design decision makes all function calls uniform.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are proving mathematical syntax.
- **Files affected**: The DrRacket Interactions pane.
- **Change type**: Executing code interactively.
- **Location**: The interactive prompt.
- **Dependencies**: DrRacket environment.

### The New Code
```racket
#lang racket
> (+ 1 2)
3
> (- 10 3)
7
> (* 4 5)
20
> (/ 10 2)
5
> (+ (* 2 3) (- 9 4))
11
```

### The Updated Project
The REPL calculates basic arithmetic and a nested expression. By placing the operator first, Lisp elegantly avoids operator precedence rules (like PEMDAS) entirely. The parentheses unambiguously define the exact boundaries of every operation.

### The Throwaway Lab
```racket
#lang racket
> (+ 100 200)
300
```

### Discard the Throwaway Code
We discard this throwaway arithmetic example; it served only to isolate prefix addition.

### Mechanical Walkthrough
1. `#lang racket` — language declaration.
2. `(+ 1 2)` — evaluates a list. Because there is no quote `'` here, the REPL evaluates it as a function call.
3. `+` — the symbol in the **operator position** (the very first element of the list). It resolves to the addition function.
4. `1` and `2` — the operands passed to the addition function.
5. `(- 10 3)`, `(* 4 5)`, `(/ 10 2)` — subtraction, multiplication, and division, uniformly using the exact same prefix structure.
6. `(+ (* 2 3) (- 9 4))` — evaluates a nested S-expression. The innermost lists `(* 2 3)` and `(- 9 4)` are evaluated first to `6` and `5`, and their results are passed to the outer `+` function to yield `11`. Prefix notation makes function calls uniform: every operation is just a list with a function at the front.

## Concept Unit: #lang racket

### The Problem
We need to tell the DrRacket environment exactly which set of rules to use when reading and evaluating our code. DrRacket supports many dialects of Scheme and Lisp, so we need a tooling directive at the top of our definitions to unambiguously select the Racket dialect.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are configuring the file environment.
- **Files affected**: The DrRacket Definitions pane.
- **Change type**: Configuration.
- **Location**: The very top of the file.
- **Dependencies**: DrRacket environment.

### The New Code
```racket
#lang racket
```

### The Updated Project
The file is now configured. When the user clicks "Run" in DrRacket, the environment reads this first line and configures its parser and evaluator to understand the specific standard of Racket, enabling all the primitive forms we used in the REPL.

### The Throwaway Lab
```racket
#lang base
```

### Discard the Throwaway Code
We discard this throwaway language line; we will strictly use `#lang racket`.

### Mechanical Walkthrough
1. `#lang` — a directive recognized by the DrRacket tooling, not by Scheme itself. It must be the very first thing in the file.
2. `racket` — the specific module or dialect name selected. This line acts as an environmental boundary configuration, establishing the precise meaning of every built-in function (like `+`) and syntax rule (like S-expressions) that follows it.
