# OpenMAT — Interpreter + Visualiser

## What You Will Build

A working language interpreter and a visualiser that renders the maths it computes.

By the end you will:
- Type OpenMAT code into a console you built
- Watch the output appear because of an evaluator you wrote
- See a triangle transform on screen because of matrix maths you understand
- Have applied good software engineering at every step — not patched it in at the end

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## How the Lessons Are Ordered

The visualiser and console exist from lesson one. Every lesson after that adds to
something already visible. No lesson builds invisible infrastructure that only makes
sense later. The interpreter pipeline is built in the order it can be seen — not the
order it executes.

## Lessons

| # | Title | You Can See | SE | CS | Maths |
|---|---|---|---|---|---|
| 01 | The Canvas | A triangle drawn on a canvas with CSS variables applied | HTML before CSS, CSS custom properties, descriptive naming | Coordinate systems, the canvas rendering pipeline | Cartesian coordinates, points as (x, y) pairs |
| 02 | The Console | A console panel that accepts input and echoes it back | Component boundaries, event-driven architecture | DOM events, the event loop | None |
| 03 | Type Safety | A compile error catching a bug JavaScript would silently miss | Build tooling, why TypeScript exists, enums as contracts | Compiled vs interpreted languages, static type systems | None |
| 04 | The Lexer | Type source code into the console, see its token list | TDD red-green-refactor, single responsibility principle | Finite state machines, character classification, keyword lookup | None |
| 05 | The Parser | Type an expression, see its abstract syntax tree printed | Recursive design, immutable data, Composite pattern | Formal grammar, operator precedence, tree data structures | None |
| 06 | The Evaluator | Type `3 + 4 * 2`, see `11` — the first working pipeline | Integration testing, the Visitor pattern | Tree traversal, evaluation semantics, recursive execution | Arithmetic, order of operations |
| 07 | Variables | `x = 10` then `disp(x)` outputs `10` in the console | Repository pattern, encapsulation | Symbol tables, hash maps, name resolution | None |
| 08 | Error Handling | `line 2: x is not defined` instead of a crash | Defensive programming, errors as a contract | Error propagation, the call stack as a diagnostic tool | None |
| 09 | Control Flow | `if x > 5` branches and the console shows the right path | Boundary condition testing | Boolean evaluation, short-circuit logic, branching | Inequalities, boolean algebra |
| 10 | Loops | A `for` loop draws five triangles on the canvas | TDD on boundary conditions | Iteration, loop invariants, off-by-one errors | Sigma notation, sequences |
| 11 | Functions | Define a function, call it, see the result | API design, regression testing | Stack frames, lexical scoping, closures | Functions as mathematical objects: f(x) |
| 12 | Vectors | `v = [3, 4]` is plotted as an arrow on the canvas | Type extension, backwards compatibility | Type systems, arrays as structured data | Vector addition, scalar multiplication, dot product, magnitude |
| 13 | Matrices | `A * B` is computed and displayed | Data structure design | 2D arrays, row-column index arithmetic | Matrix multiplication, the identity matrix, what multiplication means geometrically |
| 14 | Transformations | Write OpenMAT code that scales, rotates, and translates the triangle | Composability, pipeline architecture | Function composition | Rotation matrix, homogeneous coordinates, composing transformations |

## Definition of Done

- Every lesson's tests pass
- The console accepts OpenMAT code and displays output
- The visualiser renders a triangle and transforms it using code you wrote
- You can explain every function in the codebase without looking at comments
- You can open `src/utils/openmatEngine.js` and identify the lexer, parser, and evaluator
