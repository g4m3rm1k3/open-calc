# The Calculator — Graphing, Tables, and Solvers

## What You Will Build

A graphing calculator inspired by the TI-84 and others. Not a clone — an MVP that
grows one vertical slice at a time. Every lesson ends with a calculator you can use.

By the end you will:
- Enter expressions and see results, with full operator precedence and parentheses
- Understand why `0.1 + 0.2` does not equal `0.3` and what to do about it
- Use built-in mathematical functions: sin, cos, tan, log, ln, sqrt
- Store variables and define your own functions
- Plot functions on a coordinate plane you built
- Handle discontinuities and undefined values without crashing
- Compute the area under a curve numerically
- Find roots, intersections, and extrema using bisection and Newton's method
- Understand the mathematics behind every feature you built

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## How the Lessons Are Ordered

The calculator display exists from lesson one. Every lesson after that adds a feature
to something already working. The coordinate plane is introduced the moment functions
exist. TypeScript is introduced the moment the first logic file is created.
Nothing is built speculatively.

## Lessons

| # | Title | You Can See | SE | CS | Maths |
|---|---|---|---|---|---|
| 01 | The Display | A calculator face with a hardcoded number, CSS variables from the first line | HTML before CSS, CSS custom properties, descriptive naming | DOM structure, separation of markup from style | None |
| 02 | Buttons and Types | A clickable button grid; button type logged on every click | TypeScript from the first logic file, enums for button types, build tooling | Static type systems, event-driven architecture, the event loop | None |
| 03 | Input | Clicking digit buttons builds a number on the display | State as a single source of truth, single responsibility | Finite state machine for input modes: idle, entering number, after operator | None |
| 04 | Arithmetic | Type `8 - 3 =` and see `5` — a working calculator | Separation of UI from logic, TDD red-green-refactor | Expression evaluation, operator as data | Arithmetic, the four operations |
| 05 | Floating Point | `0.1 + 0.2` shows `0.30000000000000004` — then display precision fixes it | Display formatting as a separate concern, epsilon comparison as a pattern | IEEE 754, binary floating point representation, precision vs accuracy | Binary fractions, why 0.1 cannot be represented exactly, significant figures |
| 06 | History | Every calculation stored and shown in a scrollable list | Immutable append-only log, UI component design | Arrays, the stack as a data structure | None |
| 07 | Full Expressions | `2 + 3 * 4` evaluates to `14` — parentheses work | Reusing the OpenMAT parser, adapting an existing module | Recursive descent parsing, operator precedence | Order of operations, why parentheses change the result |
| 08 | Variables | Store `A = 42`, recall `A` in any expression | Repository pattern, encapsulation, persistent state | Symbol tables, name resolution | Named constants, why π and e are stored not typed |
| 09 | Built-in Functions | `sin(30)` → `0.5`, `log(100)` → `2`, degree and radian mode toggle visible | Function dispatch table, application mode as state, API design | First-class functions, hash map dispatch | Trigonometric functions, logarithms, exponentials, radian vs degree |
| 10 | User Functions | Define `f(x) = x^2 + 1`, evaluate `f(3)` → `10` | First-class functions, separating user functions from built-ins | Closures, parameter binding, function objects | Mathematical functions, f(x) notation, evaluating at a point |
| 11 | The Coordinate Plane | A canvas with axes, grid lines, and scale labels | Canvas component, coordinate space mapping, CSS variables for theme | Screen space vs maths space, the viewport transform | Coordinate geometry, axes, origin, scale |
| 12 | Graphing | `f(x) = x^2` plotted as a curve across the canvas | Sampling strategy, rendering pipeline | Function sampling across a domain, path construction | Continuous functions, discrete sampling, domain and range |
| 13 | Discontinuities | Graph of `1/x` renders with a gap at the asymptote — no crash | Defensive evaluation, errors as data not exceptions, NaN as a signal | NaN and Infinity in IEEE 754, detecting undefined values | Asymptotes, continuity, undefined domain, limits approaching infinity |
| 14 | Tables | A table of `x` and `f(x)` values displayed beside the graph | Data display component, separating data from rendering | Iteration, parallel arrays | Reading a table, step size, significant figures |
| 15 | Multiple Functions | `f(x)` and `g(x)` plotted together in distinct colours | CSS variables for series colours, managing a collection | Array of function objects, iterating a render loop | Comparing two functions visually |
| 16 | Numerical Integration | `∫f(x)dx` computed and the area shaded on the canvas | Pure function algorithm, algorithm selection as a design decision | Summation algorithms, convergence, left/right/midpoint/trapezoid methods | Riemann sums, definite integrals, area under a curve, the trapezoidal rule |
| 17 | Zoom and Pan | Scroll to zoom, drag to pan — the graph responds | Viewport transform as a reusable abstraction, pointer event handling | Affine transformations, world space vs screen space | Scale and translation as coordinate transformations |
| 18 | Bisection Solver | Root of `f(x) = 0` found and marked on the graph | Pure function algorithm, TDD on numerical methods | Binary search, convergence, termination condition | Roots, the intermediate value theorem, the bisection algorithm |
| 19 | Intersection Finder | Where `f(x)` meets `g(x)` marked on the graph | Reusing existing modules, reducing a new problem to a solved one | Problem reduction: intersection as root of `f(x) - g(x) = 0` | Systems of equations, reformulating intersection as root-finding |
| 20 | Newton's Method | Same root found in fewer steps — convergence visible | Iterative algorithm, stopping conditions, comparing two approaches | Numerical stability, quadratic convergence | Derivatives, Newton's formula `x₁ = x₀ - f(x₀)/f′(x₀)`, quadratic convergence |
| 21 | Finding Extrema | Min and max of `f(x)` marked on the graph | Reusing the solver on a derived function, numerical differentiation as a utility | Numerical differentiation, applying root-finding to `f′(x) = 0` | Local minima and maxima, derivative equals zero at extrema, central difference formula |
| 22 | The Solver Panel | Enter `f(x)`, pick an operation, see the result and steps on the graph | Form input, validation, error messages, integrating all components | Bringing every component together through a single interface | Applying all numerical methods to real equations |

## Definition of Done

- Every lesson's tests pass
- The calculator evaluates expressions with correct operator precedence
- Floating point display precision is configurable
- Built-in trig, log, and sqrt functions work in both degree and radian mode
- Functions can be defined, graphed, tabulated, and integrated
- Discontinuities in a function render as gaps, not crashes
- The bisection and Newton solvers find roots, intersections, and extrema
- You can explain the difference between bisection and Newton's method and why one converges faster
- You can explain why `0.1 + 0.2 !== 0.3` and how to compare floats correctly
- You can explain how the coordinate plane maps maths space to screen space
