# Lesson 2: Lists All the Way Down

The reader will learn how Scheme builds proper lists out of cons cells and the empty list, how to construct and destructure them with `list`, `null?`, `length`, `append`, and `list?`, and how nested lists (lists of lists) work. The transferable problems: (1) a proper list is not a primitive — it is a recursive cons-cell chain ending in `'()`, a convention, not a special data type; (2) `null?` is the canonical base-case check in list recursion — it answers 'is this the empty list?', which is why every recursive list function needs it; (3) `append` stitches two lists together by rebuilding the left one cons-cell by cons-cell — understanding this prepares the reader for the cost model of list operations; (4) nested lists are just cons cells whose elements happen to themselves be lists — there is no special type for 'list of lists.'

**What you need to know first:**
- Lesson 0 (S-expressions, REPL, prefix notation, #lang racket)
- Lesson 1 (`cons`, `car`, `cdr`, `pair?`, `atom?`, box-and-pointer model, dotted-pair notation, the empty list `'()`).

### Terms used in this lesson

- **S-expression** — A symbolic expression, which is either an atom or a list of S-expressions enclosed in parentheses. S-expressions exist to provide a uniform, tree-structured syntax for both code and data, allowing Lisp programs to trivially parse and manipulate other Lisp programs.
- **Prefix notation** — A mathematical notation where the operator precedes its operands (e.g., `+ 1 2`). It exists to eliminate ambiguity in order of operations without needing precedence rules or parentheses for grouping, simplifying both the parser and the mental model of evaluation.
- **Box-and-pointer model** — A visual representation of memory where each cons cell is a box with two halves (pointers to the car and cdr). It exists to make the sharing of memory and the recursive structure of linked lists concrete and traceable.
- **Dotted-pair notation** — The printed representation of a cons cell that does not end in the empty list (e.g., `(1 . 2)`). It exists to distinguish raw pairs from proper lists, preventing the programmer from accidentally treating a single pair as a sequence.
- **Empty list (`'()`)** — The sentinel value used to mark the end of a proper list. It exists to provide a universal base case for list recursion, ensuring that functions can predictably stop traversing.
- **Proper list** — A chain of cons cells where the `cdr` of the very last cell is the empty list (`'()`). It exists as a convention to create predictable sequences that standard library functions can traverse without error.
- **Recursive list** — A list defined in terms of itself (a pair whose `cdr` is a list). It exists because it perfectly mirrors the inductive definitions used in mathematics and logic, allowing recursive algorithms to cleanly match the data structure.
- **Nested list** — A list whose elements happen to be other lists. It exists to represent hierarchical data (like trees or matrices) without needing a specialized new data type, reusing the exact same cons cells.
- **Quote / Literals** — A mechanism to prevent evaluation. It exists to allow programmers to treat symbols and lists as raw data structures instead of function calls or variables.

### Objects and methods used

- **REPL**
  - *What it is:* Read-Eval-Print Loop, the interactive programming environment.
  - *Implementation:* An executable loop that takes user input, runs it, and displays the result.
  - *Its use:* We use the REPL to instantly verify how list functions behave.
  - *Type:* Standalone program/environment.
  - *Responsibility:* Reads S-expressions, evaluates them according to Scheme rules, and prints the resulting values in a continuous loop.
  - *Depends on:* Standard input and standard output streams.
  - *Connects to:* The user (receives code), the evaluator (passes AST), and the printer (displays value).
  - *Shape:* The outermost interaction boundary of the language.

- **`#lang racket`**
  - *What it is:* The language declaration for Racket modules.
  - *Implementation:* A macro-level directive at the start of a file.
  - *Its use:* Required by DrRacket to know which specific dialect of Scheme/Racket to use for evaluating the file.
  - *Type:* Module directive.
  - *Responsibility:* Configures the reader and evaluator to use the standard Racket environment, loading its core bindings.
  - *Depends on:* The Racket base library being installed.
  - *Connects to:* The DrRacket evaluator.
  - *Shape:* The entry point constraint of a file.

- **`cons`**
  - *What it is:* The fundamental pair constructor.
  - *Implementation:* A function taking two arguments and returning a new pair in memory.
  - *Its use:* We use `cons` to manually build the links of a list to prove that lists are just pairs.
  - *Type:* Built-in function.
  - *Responsibility:* Allocates a new cons cell and sets its `car` and `cdr` pointers to the provided arguments.
  - *Depends on:* Two S-expressions (any type).
  - *Connects to:* The garbage collector (allocates memory).
  - *Shape:* The atomic building block of all list structures.

- **`car`**
  - *What it is:* The accessor for the first half of a pair.
  - *Implementation:* A function taking a pair and returning its first element.
  - *Its use:* We use `car` to extract the payload of a list node.
  - *Type:* Built-in function.
  - *Responsibility:* Dereferences the `car` pointer of a given cons cell.
  - *Depends on:* A valid pair (errors if given an atom or empty list).
  - *Connects to:* The memory manager (reads memory).
  - *Shape:* Data extraction boundary.

- **`cdr`**
  - *What it is:* The accessor for the second half of a pair.
  - *Implementation:* A function taking a pair and returning its second element.
  - *Its use:* We use `cdr` to access the rest of the list, continuing the chain.
  - *Type:* Built-in function.
  - *Responsibility:* Dereferences the `cdr` pointer of a given cons cell.
  - *Depends on:* A valid pair.
  - *Connects to:* The memory manager (reads memory).
  - *Shape:* Data traversal boundary.

- **`pair?`**
  - *What it is:* The predicate testing if a value is a cons cell.
  - *Implementation:* A function returning `#t` if the argument is a pair, `#f` otherwise.
  - *Its use:* Differentiating between actual nodes and atoms/empty lists.
  - *Type:* Built-in predicate function.
  - *Responsibility:* Inspects the runtime tag of a value to determine its type.
  - *Depends on:* Any single value.
  - *Connects to:* The type system.
  - *Shape:* Type-checking boundary.

- **`atom?`**
  - *What it is:* The predicate testing if a value is NOT a pair.
  - *Implementation:* A function returning `#t` for non-pairs.
  - *Its use:* Finding the leaves of a tree.
  - *Type:* Predicate function.
  - *Responsibility:* Returns the logical negation of `pair?`.
  - *Depends on:* Any single value.
  - *Connects to:* `pair?`.
  - *Shape:* Type-checking boundary.

- **`list`**
  - *What it is:* The convenience constructor for proper lists.
  - *Implementation:* A variadic function `(list arg ...)` returning a proper list of the arguments.
  - *Its use:* Creating lists without writing chained `cons` calls.
  - *Type:* Built-in variadic function.
  - *Responsibility:* Folds `cons` over the provided arguments from right to left, terminating with `'()`.
  - *Depends on:* Zero or more values.
  - *Connects to:* `cons` and `'()`.
  - *Shape:* Data structure construction API.

- **`null?`**
  - *What it is:* The predicate testing if a value is exactly the empty list.
  - *Implementation:* A function returning `#t` only for `'()`.
  - *Its use:* The canonical base case check for list recursion.
  - *Type:* Built-in predicate function.
  - *Responsibility:* Checks identity against the empty list singleton.
  - *Depends on:* Any single value.
  - *Connects to:* The runtime representation of `'()`.
  - *Shape:* Recursion base-case boundary.

- **`length`**
  - *What it is:* The function that counts top-level elements in a proper list.
  - *Implementation:* A function `(length lst)` returning an integer.
  - *Its use:* Measuring the size of a list sequence.
  - *Type:* Built-in function.
  - *Responsibility:* Traverses the `cdr` chain of a proper list until `'()` and returns the count of steps.
  - *Depends on:* A proper list (errors or loops infinitely on improper or cyclic lists).
  - *Connects to:* `cdr` and `null?`.
  - *Shape:* List metrics API.

- **`append`**
  - *What it is:* The function that joins two or more lists.
  - *Implementation:* A function `(append list1 list2)` returning a newly allocated list.
  - *Its use:* Stitching sequences together.
  - *Type:* Built-in function.
  - *Responsibility:* Traverses the first list, copying its cons cells, and sets the final `cdr` to point to the second list.
  - *Depends on:* Proper lists as arguments.
  - *Connects to:* `car`, `cdr`, `cons`, `null?`.
  - *Shape:* List mutation/concatenation API.

- **`list?`**
  - *What it is:* The predicate testing if a value is a proper list.
  - *Implementation:* A function returning `#t` if the value is a chain of pairs ending in `'()`.
  - *Its use:* Verifying that a structure is a valid sequence, unlike `pair?` which allows improper lists.
  - *Type:* Built-in predicate function.
  - *Responsibility:* Traverses the `cdr` chain to ensure it terminates at `'()`.
  - *Depends on:* Any single value.
  - *Connects to:* `pair?`, `cdr`, `null?`.
  - *Shape:* Deep type-checking boundary.

- **`quote`**
  - *What it is:* The special form that prevents evaluation.
  - *Implementation:* A primitive `(quote e)` or its shorthand `'e` returning `e` unevaluated.
  - *Its use:* Writing literal lists and symbols directly in code.
  - *Type:* Special form.
  - *Responsibility:* Instructs the evaluator to return the AST node exactly as it was parsed, rather than evaluating it.
  - *Depends on:* A single S-expression.
  - *Connects to:* The macro expander / evaluator core.
  - *Shape:* Meta-programming and literal data boundary.

## Concept Unit: `list`

### The Problem
Building proper lists manually with `cons` cells is tedious and error-prone because it requires counting parentheses and deeply nesting calls just to define a simple sequence.

### Project Change
Reference Source: "No reference counterpart — this is a from-scratch addition because we are exploring list operations in a new file."
Files affected: `src/lists.rkt`
Change type: add
Location: brand new file
Dependencies: `#lang racket`

### The New Code
This establishes the basic list creation function.
```racket
#lang racket
(define my-list (list 1 2 3))
```

### The Updated Project
We place this definition as our starting point in the new file.
```racket
#lang racket
// ← new
(define my-list (list 1 2 3))
```
This module now defines a single sequence of three integers.

### Concept Isolation
Here is a throwaway lab to demonstrate this variadic list constructor. This is called a **list constructor shorthand**.
```racket
> (list 1 2 3)
'(1 2 3)
> (cons 1 (cons 2 (cons 3 '())))
'(1 2 3)
```
This output proves that `list` is strictly identical in effect to a nested chain of `cons` cells ending in `'()`. The box-and-pointer model for `(list 1 2 3)` has three boxes. The first box holds `1` and points to the second. The second holds `2` and points to the third. The third holds `3` and points to `'()`.

### Discarding the throwaway example
The REPL examples above are discarded and will not remain in our project code.

### Mechanical Walkthrough
1. `#lang` — specifies the language dialect.
2. `racket` — the specific language loaded, which initializes the reader.
3. `define` — the built-in form that binds a name in the current scope.
4. `my-list` — the identifier we are binding.
5. `list` — the built-in variadic function that folds `cons` over its arguments.
6. `1` — an integer literal passed as the first argument.
7. `2` — an integer literal passed as the second argument.
8. `3` — an integer literal passed as the third argument.

### CS Lens
Abstract Data Types. Also recognized in: Python's `[]`, Java's `Arrays.asList`, C's initialized array literals, Rust's `vec![]` macro.

### SE Lens
Syntactic sugar. We could use `cons` explicitly for every element, but we chose `list` because it eliminates syntactic noise and parenthesis counting, reducing the cognitive load of reading static data.

### Commands Needed
None.

### Run It
We evaluate the file and print our list.
```racket
> my-list
'(1 2 3)
```

### Connecting the Pieces
Because `list` produces the same memory structure as `cons` terminating in `'()`, we now need a way to detect that terminal empty list when we traverse it.

## Concept Unit: `null?`

### The Problem
When traversing a sequence recursively with `cdr`, we must know when to stop to avoid a runtime error. We need to check if the current pointer is the empty list marker.

### Project Change
Reference Source: "No reference counterpart — this is a from-scratch addition because we are experimenting."
Files affected: `src/lists.rkt`
Change type: add
Location: after `my-list` definition
Dependencies: `#lang racket`

### The New Code
We add a predicate check.
```racket
(define is-empty (null? my-list))
```

### The Updated Project
The new definition checks the list we just made.
```racket
#lang racket
(define my-list (list 1 2 3))
// ← new
(define is-empty (null? my-list))
```
This code assigns `#f` to `is-empty` because `my-list` has elements.

### Concept Isolation
Here is a throwaway lab to demonstrate the empty-list predicate. This is called a **base case predicate**.
```racket
> (null? '())
#t
> (null? (list 1 2))
#f
> (null? 0)
#f
```
This output proves that `null?` tests specifically for the exact identity of `'()`, not for numerical zero or a generic false value.

### Discarding the throwaway example
The REPL evaluations above are discarded.

### Mechanical Walkthrough
1. `define` — binds a new identifier.
2. `is-empty` — the identifier to bind.
3. `null?` — a built-in predicate function that returns `#t` only when given the exact value `'()`.
4. `my-list` — the variable we are passing to the predicate.

### CS Lens
Sentinel Values. Also recognized in: C's null-terminated strings (`\0`), linked lists in Java checking `next == null`, POSIX file EOF markers.

### SE Lens
Identity checks vs length checks. We use `null?` rather than asking if the list's length is 0, because computing the length of a linked list is an O(N) operation, whereas `null?` is an O(1) pointer comparison.

### Commands Needed
None.

### Run It
We can observe the result of our definition.
```racket
> is-empty
#f
```

### Connecting the Pieces
Now that we can safely check for the end of a list, we can write functions that count how many steps it takes to reach it.

## Concept Unit: `length`

### The Problem
We often need to know the number of top-level elements inside a proper list, but a linked list does not store its own size in memory.

### Project Change
Reference Source: "No reference counterpart."
Files affected: `src/lists.rkt`
Change type: add
Location: bottom of the file
Dependencies: `#lang racket`

### The New Code
We define a variable capturing the size.
```racket
(define size (length my-list))
```

### The Updated Project
The file now measures the list.
```racket
#lang racket
(define my-list (list 1 2 3))
(define is-empty (null? my-list))
// ← new
(define size (length my-list))
```
The file now contains three bindings, the last of which measures the top-level nodes of the first.

### Concept Isolation
Here is a throwaway lab for measuring lists. This is called a **linear sequence measure**.
```racket
> (length '())
0
> (length (list 1 2 3))
3
> (length (list 'a (list 'b 'c) 'd))
3
```
This output proves that `length` traverses the outer `cdr` chain and counts exactly the top-level elements, intentionally ignoring the inner structure of nested lists.

### Discarding the throwaway example
The throwaway lab is discarded and won't appear in the final file.

### Mechanical Walkthrough
1. `define` — binds a name to the computed value.
2. `size` — the variable name.
3. `length` — the built-in function that walks the `cdr` chain until `null?` is `#t`, returning the count of steps.
4. `my-list` — the argument provided to `length`.

### CS Lens
O(N) Traversal. Also recognized in: C's `strlen`, Ruby's `Enumerable#count`, traversing a DOM tree's immediate children.

### SE Lens
Algorithmic complexity. We do not use `length` inside recursive loop conditions because it forces a full traversal of the list on every iteration, turning an O(N) task into an O(N^2) task.

### Commands Needed
None.

### Run It
We can check the computed size.
```racket
> size
3
```

### Connecting the Pieces
Because we know how long a list is by traversing its `cdr` chain, we can use the same traversal technique to build a copy of it when appending another list.

## Concept Unit: `append`

### The Problem
We have two separate lists, and we want to combine them into a single continuous sequence without mutating the original lists.

### Project Change
Reference Source: "No reference counterpart."
Files affected: `src/lists.rkt`
Change type: add
Location: bottom of the file
Dependencies: `#lang racket`

### The New Code
We combine two sequences.
```racket
(define bigger-list (append my-list (list 4 5)))
```

### The Updated Project
The file adds a combined list.
```racket
#lang racket
(define my-list (list 1 2 3))
(define is-empty (null? my-list))
(define size (length my-list))
// ← new
(define bigger-list (append my-list (list 4 5)))
```
This module now creates a new five-element list out of `my-list` and a new temporary list.

### Concept Isolation
Here is a throwaway lab to demonstrate joining sequences. This is called **list concatenation**.
```racket
> (append (list 1 2) (list 3 4))
'(1 2 3 4)
> (append '() (list 9 9))
'(9 9)
```
This output proves that `append` stitches the two sequences together. Internally, it allocates fresh cons cells for the first list, then sets the final `cdr` to point directly to the second list in memory. The cost is proportional only to the first list.

### Discarding the throwaway example
The lab is discarded and not used further.

### Mechanical Walkthrough
1. `define` — binds the result to a variable.
2. `bigger-list` — the new identifier.
3. `append` — a built-in function that rebuilds the left list cons-cell by cons-cell, setting the final pointer to the right list.
4. `my-list` — the first list, which `append` traverses and duplicates.
5. `list` — the constructor for the second argument.
6. `4` — an integer literal.
7. `5` — an integer literal.

### CS Lens
Persistent Data Structures. Also recognized in: Git commit histories, immutable strings in Java (`String.concat`), structural sharing in Clojure.

### SE Lens
Memory sharing vs Copying. We use `append` sparingly in tight loops because it creates a full copy of its first argument. If we append repeatedly in a loop, we create quadratic garbage collection pressure.

### Commands Needed
None.

### Run It
We inspect the larger list.
```racket
> bigger-list
'(1 2 3 4 5)
```

### Connecting the Pieces
Since `append` and `length` expect proper lists, we need a way to verify that a structure is indeed a proper list and not an improper dotted pair.

## Concept Unit: `list?`

### The Problem
We need to distinguish between a valid, proper sequence of pairs ending in `'()` and a malformed chain (like a dotted pair) before passing it to strict functions.

### Project Change
Reference Source: "No reference counterpart."
Files affected: `src/lists.rkt`
Change type: add
Location: bottom of the file
Dependencies: `#lang racket`

### The New Code
We add a check for proper list structure.
```racket
(define is-proper (list? bigger-list))
```

### The Updated Project
The module now verifies its data.
```racket
#lang racket
(define my-list (list 1 2 3))
(define is-empty (null? my-list))
(define size (length my-list))
(define bigger-list (append my-list (list 4 5)))
// ← new
(define is-proper (list? bigger-list))
```
This final binding ensures `bigger-list` is traversing-safe.

### Concept Isolation
Here is a throwaway lab to demonstrate proper list verification. This is called a **deep structural predicate**.
```racket
> (list? (list 1 2 3))
#t
> (list? '())
#t
> (list? (cons 1 2))
#f
> (list? 5)
#f
```
This output proves that `list?` is not the same as `pair?`. `pair?` returns `#t` for `(cons 1 2)`, but `list?` returns `#f` because the chain does not terminate with the empty list `'()`.

### Discarding the throwaway example
The REPL checks above are discarded.

### Mechanical Walkthrough
1. `define` — binds a new identifier.
2. `is-proper` — the variable name.
3. `list?` — a built-in predicate function that traverses the `cdr` chain to verify it ends in `'()`.
4. `bigger-list` — the list being checked.

### CS Lens
Structural Validation. Also recognized in: JSON Schema validation, checking a graph for cycles before a topological sort, validating well-formed XML.

### SE Lens
Fail-fast validation. We use `list?` to enforce preconditions at an API boundary. If a function requires a proper list, checking `list?` immediately prevents mysterious errors deep inside an infinite loop later.

### Commands Needed
None.

### Run It
We check the validation result.
```racket
> is-proper
#t
```

### Connecting the Pieces
Proper lists can contain atoms, but they can also contain other proper lists, creating complex hierarchies from a single primitive structure.

## Concept Unit: Nested lists

### The Problem
We need to represent hierarchical data, such as a grid, a tree, or a matrix, using only the cons cells we already understand.

### Project Change
Reference Source: "No reference counterpart."
Files affected: `src/lists.rkt`
Change type: add
Location: bottom of the file
Dependencies: `#lang racket`

### The New Code
We construct a matrix shape.
```racket
(define matrix (list (list 1 2) (list 3 4)))
```

### The Updated Project
Our module now contains hierarchical data.
```racket
#lang racket
(define my-list (list 1 2 3))
(define is-empty (null? my-list))
(define size (length my-list))
(define bigger-list (append my-list (list 4 5)))
(define is-proper (list? bigger-list))
// ← new
(define matrix (list (list 1 2) (list 3 4)))
```
This definition creates a list where each element is itself a list.

### Concept Isolation
Here is a throwaway lab to extract data from nested structures. This is called **tree traversal**.
```racket
> (list (list 1 2) (list 3 4))
'((1 2) (3 4))
> (car (list (list 1 2) (list 3 4)))
'(1 2)
> (car (car (list (list 1 2) (list 3 4))))
1
```
This output proves that nested lists are not a special new type. They are simply regular cons cells whose `car` happens to hold a pointer to another cons cell instead of holding an atom.

### Discarding the throwaway example
The nested extractions are discarded.

### Mechanical Walkthrough
1. `define` — binds the identifier.
2. `matrix` — the variable name.
3. `list` — the outer variadic constructor.
4. `list` — the inner constructor creating the first element.
5. `1` — an integer literal.
6. `2` — an integer literal.
7. `list` — the inner constructor creating the second element.
8. `3` — an integer literal.
9. `4` — an integer literal.

### CS Lens
Hierarchical Data Structures. Also recognized in: DOM trees in HTML, JSON objects containing JSON arrays, file system directories containing directories.

### SE Lens
Uniformity of representation. We represent trees this way because it allows the exact same standard library functions (`length`, `append`, `car`) to operate on every level of the hierarchy.

### Commands Needed
None.

### Run It
We inspect the nested shape.
```racket
> matrix
'((1 2) (3 4))
```

### Connecting the Pieces
While `list` constructs these structures cleanly, Lisp provides an even more powerful syntax for defining them purely as literal data.

## Concept Unit: `quote` and `'`

### The Problem
Calling `list` over and over for static data is verbose. We need a way to tell the language "treat this raw parenthesis structure as a literal data list, not as code to execute."

### Project Change
Reference Source: "No reference counterpart."
Files affected: `src/lists.rkt`
Change type: add
Location: bottom of the file
Dependencies: `#lang racket`

### The New Code
We define a list without using the `list` function.
```racket
(define literal-list '(a b c))
```

### The Updated Project
The final version of our file.
```racket
#lang racket
(define my-list (list 1 2 3))
(define is-empty (null? my-list))
(define size (length my-list))
(define bigger-list (append my-list (list 4 5)))
(define is-proper (list? bigger-list))
(define matrix (list (list 1 2) (list 3 4)))
// ← new
(define literal-list '(a b c))
```
This adds a final list made entirely of unevaluated symbols.

### Concept Isolation
Here is a throwaway lab to demonstrate preventing evaluation. This is called **quoting**.
```racket
> (list 'a 'b)
'(a b)
> '(a b)
'(a b)
```
This output proves that `'` (quote shorthand) applied to a parenthesized sequence constructs the exact same list as evaluating `list` on individually quoted symbols. The quote says "treat what follows exactly as data."

### Discarding the throwaway example
The REPL comparisons are discarded.

### Mechanical Walkthrough
1. `define` — binds a new identifier.
2. `literal-list` — the variable name.
3. `'` — the quote shorthand reader macro, converting the next S-expression into `(quote ...)`.
4. `(` — begins the list structure.
5. `a` — a symbol, left unevaluated because of the quote.
6. `b` — a symbol, left unevaluated.
7. `c` — a symbol, left unevaluated.
8. `)` — closes the list structure.

### CS Lens
Homoiconicity. Also recognized in: Lisp macros, WebAssembly text format, Prolog facts vs rules.

### SE Lens
Data as code. We use quote to treat source code text as raw structural data. This is the foundation of macros, allowing us to write programs that generate other programs by manipulating quoted lists.

### Commands Needed
None.

### Run It
We inspect the literal data list.
```racket
> literal-list
'(a b c)
```

### Connecting the Pieces
This final step completes our file, demonstrating how lists can be built procedurally or written literally.

---

## Connect the pieces
A sequence like `'(a b c)` is parsed as data by `quote`, validated as a proper sequence by `list?`, checked for elements by `null?`, and measured by `length`, all operating on the exact same underlying chain of `cons` memory boxes ending in `'()`.

## What breaks without this
If we pass an improper list to `length` by doing `(length (cons 1 2))`, the interpreter crashes with a contract violation because it traverses the `cdr` chain looking for `'()` and hits the atom `2` instead, breaking the proper list contract.

## Exercises
- Write `(list (list 'a 'b) (list 'c 'd))` using only `cons` and `'()`.
- Use `append` to join `'(1 2)` and `'()`. What is the result?

## Definition of done
- [x] Create `src/lists.rkt`.
- [x] Run `git commit -m "Introduce proper lists, constructors, and predicates for data sequences"`
