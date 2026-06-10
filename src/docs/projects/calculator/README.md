# The Calculator — Graphing, Tables, and Solvers

## What You Will Build

A graphing calculator inspired by the TI-84 and others. Not a clone — an MVP that
grows one vertical slice at a time. Every lesson ends with a calculator you can use.

By the end you will:
- Enter expressions and see results, with full operator precedence and parentheses
- Store variables and define your own functions
- Plot functions on a coordinate plane you built
- Find roots numerically using bisection and Newton's method
- Understand the mathematics behind every feature you built

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## How the Lessons Are Ordered

The calculator display exists from lesson one. Every lesson after that adds a feature
to something already working. The coordinate plane is introduced the moment functions
exist — not before, not after. TypeScript is introduced the moment the first logic file
is created. Nothing is built speculatively.

This project builds on OpenMAT. The expression parser from that project is reused here
— not re-taught, but extended. OpenMAT taught you how a parser works. This project
teaches you how to use that knowledge to solve a different class of problem.

## Lessons

| # | Title | You Can See | SE | CS | Maths |
|---|---|---|---|---|---|
| 01 | The Display | A calculator face with a hardcoded number, CSS variables applied from the first line | HTML before CSS, CSS custom properties, descriptive naming | DOM structure, separation of markup from style | None |
| 02 | Buttons and Types | A clickable button grid; button type logged on every click | TypeScript from the first logic file, enums for button types, build tooling | Static type systems, event-driven architecture, the event loop | None |
| 03 | Input | Clicking digit buttons builds a number on the display | State as a single source of truth, single responsibility | Finite state machine for input modes: idle, entering number, after operator | None |
| 04 | Arithmetic | Type `8 - 3 =` and see `5` — a working calculator | Separation of UI from logic, TDD red-green-refactor | Expression evaluation, operator as data | Arithmetic, the four operations |
| 05 | History | Every calculation stored and shown in a scrollable list | Immutable append-only log, UI component design | Arrays, the stack as a data structure | None |
| 06 | Full Expressions | `2 + 3 * 4` evaluates to `14` — parentheses work | Reusing the OpenMAT parser, adapting an existing module | Recursive descent parsing, operator precedence | Order of operations, why parentheses change the result |
| 07 | Variables | Store `A = 42`, recall `A` in any expression | Repository pattern, encapsulation, persistent state | Symbol tables, name resolution | Named constants, why π and e are stored not typed |
| 08 | Functions | Define `f(x) = x^2 + 1`, evaluate `f(3)` → `10` | First-class functions, API design | Function objects, closures, parameter binding | Mathematical functions, f(x) notation, evaluating at a point |
| 09 | The Coordinate Plane | A canvas with axes, grid lines, and scale labels | Canvas component, coordinate space mapping, CSS variables for theme | Screen space vs maths space, the viewport transform | Coordinate geometry, axes, origin, scale |
| 10 | Graphing | `f(x) = x^2` plotted as a curve across the canvas | Sampling strategy, rendering pipeline, connecting the parser to the canvas | Function sampling across a domain, path construction | Continuous functions, discrete sampling, domain and range |
| 11 | Tables | A table of `x` and `f(x)` values displayed beside the graph | Data display component, separating data from rendering | Iteration, parallel arrays | Reading a table of values, step size, significant figures |
| 12 | Multiple Functions | `f(x)` and `g(x)` plotted together in distinct colours | CSS variables for series colours, managing a collection of functions | Array of function objects, iterating a render loop | Comparing two functions visually, where they are equal |
| 13 | Zoom and Pan | Scroll to zoom, drag to pan — the graph responds | Viewport transform as a reusable abstraction, pointer event handling | Affine transformations, world space vs screen space | Scale and translation as coordinate transformations |
| 14 | Bisection Solver | Root of `f(x) = 0` found and marked on the graph with steps shown | Pure function algorithm, TDD on numerical methods | Binary search, convergence, termination condition | Roots, the intermediate value theorem, the bisection algorithm |
| 15 | Newton's Method | Same root found in fewer steps — convergence visible on the graph | Iterative algorithm, stopping conditions, comparing two approaches | Numerical stability, iteration vs recursion | Derivatives, Newton's formula `x₁ = x₀ - f(x₀)/f'(x₀)`, quadratic convergence |
| 16 | The Solver Panel | Enter `f(x)`, pick a method, see the root and the steps it took | Form input, validation, error messages, integrating all components | Bringing every component together through a single interface | Applying solvers to real equations, interpreting the result |

## Definition of Done

- Every lesson's tests pass
- The calculator evaluates expressions with correct operator precedence
- Functions can be defined, plotted, and tabulated
- The bisection and Newton solvers find roots and show their work on the graph
- You can explain the difference between bisection and Newton's method and why one converges faster
- You can explain how the coordinate plane maps maths space to screen space
