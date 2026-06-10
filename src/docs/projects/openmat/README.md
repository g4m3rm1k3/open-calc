# OpenMAT — Interpreter + Visualiser

## What You Will Build

A working language interpreter and a visualiser that renders the maths it computes.

By the end you will:
- Type OpenMAT code into a console you built
- Watch the output appear because of an evaluator you wrote
- Understand why `0.1 + 0.2` does not equal `0.3` and what to do about it
- Use built-in functions — sin, cos, log, sqrt — and understand how the language provides them
- See a triangle transform on screen because of matrix maths you understand
- Have applied good software engineering at every step — not patched it in at the end

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## How the Lessons Are Ordered

The visualiser and console exist from lesson one. Every lesson after that adds to
something already visible. The interpreter pipeline is built in the order it can be
seen — not the order it executes. The standard library is introduced before vectors
and matrices because the transformation lesson uses `sin` and `cos` — students must
know where those come from before they use them.

## Lessons

| # | Title | You Can See | SE | CS | Maths |
|---|---|---|---|---|---|
| 01 | The Canvas | A triangle drawn on a canvas with CSS variables applied | HTML before CSS, CSS custom properties, descriptive naming | Coordinate systems, the canvas rendering pipeline | Cartesian coordinates, points as (x, y) pairs |
| 02 | The Console | A console panel that accepts input and echoes it back | Component boundaries, event-driven architecture | DOM events, the event loop | None |
| 03 | Type Safety | A compile error catching a bug JavaScript would silently miss | Build tooling, why TypeScript exists, enums as contracts | Compiled vs interpreted languages, static type systems | None |
| 04 | The Lexer | Type source code into the console, see its token list | TDD red-green-refactor, single responsibility principle | Finite state machines, character classification, keyword lookup | None |
| 05 | The Parser | Type an expression, see its abstract syntax tree printed | Recursive design, immutable data, Composite pattern | Formal grammar, operator precedence, tree data structures | None |
| 06 | The Evaluator | Type `3 + 4 * 2`, see `11` — the first working pipeline | Integration testing, the Visitor pattern | Tree traversal, evaluation semantics, recursive execution | Arithmetic, order of operations |
| 07 | Floating Point | `0.1 + 0.2` shows `0.30000000000000004` — then display precision fixes it | Display formatting as a separate concern, epsilon comparison as a pattern | IEEE 754, binary floating point, precision vs accuracy | Binary fractions, why 0.1 cannot be represented exactly |
| 08 | Variables | `x = 10` then `disp(x)` outputs `10` | Repository pattern, encapsulation | Symbol tables, hash maps, name resolution | None |
| 09 | Error Handling | `line 2: x is not defined` instead of a crash | Defensive programming, errors as a contract | Error propagation, the call stack as a diagnostic tool | None |
| 10 | Control Flow | `if x > 5` branches and the console shows the right path | Boundary condition testing | Boolean evaluation, short-circuit logic, branching | Inequalities, boolean algebra |
| 11 | For Loops | A `for` loop draws five triangles on the canvas | TDD on boundary conditions | Iteration, loop invariants, off-by-one errors | Sigma notation, sequences |
| 12 | While Loops | A `while` loop draws triangles until a condition stops it | Termination conditions as a design requirement, loop invariants revisited | Condition-driven vs count-driven iteration, infinite loop detection | Convergence conditions, when a sequence stops |
| 13 | Functions | Define a function, call it, see the result | API design, regression testing | Stack frames, lexical scoping, closures | Functions as mathematical objects: f(x) |
| 14 | Recursion | `factorial(5)` returns `120` — the call stack visible in the console | When to choose recursion over iteration, guarding the base case | The call stack growing and unwinding, stack overflow as a real error | Mathematical induction, recursive definitions: n! = n × (n-1)! |
| 15 | Standard Library | `sin(45)` → `0.707`, `log(100)` → `2`, `sqrt(9)` → `3` in the console | Stdlib as an API contract, function dispatch table, stdlib is not the language | First-class functions, hash map dispatch, the open/closed principle | Trigonometric functions, logarithms, why sin and cos appear in rotation matrices |
| 16 | Vectors | `v = [3, 4]` is plotted as an arrow on the canvas | Type extension, backwards compatibility | Type systems, arrays as structured data | Vector addition, scalar multiplication, dot product, magnitude |
| 17 | Matrices | `A * B` is computed and displayed | Data structure design | 2D arrays, row-column index arithmetic | Matrix multiplication, the identity matrix, what multiplication means geometrically |
| 18 | Transformations | Write OpenMAT code that scales, rotates, and translates the triangle | Composability, pipeline architecture | Function composition | Rotation matrix (built from sin and cos), homogeneous coordinates, composing transformations |

## Definition of Done

- Every lesson's tests pass
- The console accepts OpenMAT code and displays output
- Floating point display precision is configurable
- Built-in trig, log, and sqrt functions evaluate correctly
- The visualiser renders a triangle and transforms it using code you wrote
- You can explain why `0.1 + 0.2 !== 0.3` and how to compare floats correctly
- You can explain the difference between `for` and `while` and when to use each
- You can explain why recursion has a base case and what happens without one
- You can explain where `sin` and `cos` come from in the rotation matrix
- You can explain every function in the codebase without looking at comments
