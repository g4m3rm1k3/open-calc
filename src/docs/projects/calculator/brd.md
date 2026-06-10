# The Calculator — Business Requirements Document
### Version 0.1 — MVP

---

## 1. What This Is

A graphing calculator built in TypeScript, running in the browser. It evaluates
expressions, stores variables, defines functions, plots graphs, computes integrals,
and finds roots — using numerical methods the student builds and understands.

---

## 2. What This Is Not

- Not a CAS (computer algebra system) — no symbolic manipulation, no exact fractions
- Not a statistics calculator — no regression, no distributions
- Not a matrix calculator — matrices are covered in OpenMAT
- Not a mobile app — browser only
- Not a multi-line editor — one expression at a time

---

## 3. Technical Decisions

### Architecture

```
Button/Keyboard Input
         ↓
    Input State Machine  →  display string
         ↓
    Expression Parser  →  AST
         ↓
    Evaluator  →  number | Error
         ↓
    Display  +  Graph Canvas  +  History
```

The parser and evaluator are separate modules. The canvas is a separate module.
No module imports from the module after it in the pipeline.

### Language

TypeScript with `strict: true`. No JavaScript files.

### CSS

CSS custom properties from lesson 1. No hardcoded values.

### Testing

Vitest. Tests written before implementation.

### Floating Point Display

All results are displayed using `toPrecision(10)` to suppress spurious floating
point digits, unless the user has set a precision override.

### Degree / Radian Mode

Application-level state. Default: degrees. Affects all trigonometric functions.
Stored as an enum: `AngleMode.DEGREES | AngleMode.RADIANS`.

### Error Representation

Errors in evaluation are values, not thrown exceptions, within the pipeline.
The evaluator returns `number | CalcError`. The display renders the error message.
JavaScript exceptions from unexpected states are caught at the top level.

---

## 4. User Stories

---

### Epic 1 — The Shell

---

**US-001 — The Display**

As a user, when I open the calculator I see a display showing a number.

Acceptance criteria:
- [ ] A calculator display is visible showing a hardcoded number on load
- [ ] The display background, text colour, and font size are CSS custom properties
- [ ] No hardcoded colour or size values exist in CSS or TypeScript
- [ ] The page title reads "Calculator"
- [ ] All layout spacing uses CSS custom properties

---

**US-002 — Buttons and Types**

As a user, I see a button grid and each button logs its type when clicked.

Acceptance criteria:
- [ ] A grid of buttons is visible: digits 0–9, operators `+ - * / ^`, `=`, `(`, `)`, `C`, `.`
- [ ] Each button has a TypeScript enum type: `DIGIT`, `OPERATOR`, `EQUALS`, `CLEAR`, `DECIMAL`, `PAREN`
- [ ] Clicking any button logs its type and value to the browser console
- [ ] Using a string instead of the enum type causes a TypeScript compile error
- [ ] `npm run build` compiles without errors
- [ ] `npm test` runs and passes

---

**US-003 — Input**

As a user, clicking digit and operator buttons builds an expression on the display.

Acceptance criteria:
- [ ] Clicking `1`, `+`, `2` displays `1+2`
- [ ] Clicking `C` clears the display to `0`
- [ ] Clicking `.` adds a decimal point; clicking it again in the same number has no effect
- [ ] The input state machine has three explicit states: `IDLE`, `ENTERING_NUMBER`, `AFTER_OPERATOR`
- [ ] Entering a new digit after `=` starts a fresh expression
- [ ] The display never shows an empty string — shows `0` when cleared

---

**US-004 — Arithmetic**

As a user, pressing `=` evaluates the expression on the display.

Acceptance criteria:
- [ ] `8 - 3 =` → `5`
- [ ] `6 * 7 =` → `42`
- [ ] `10 / 4 =` → `2.5`
- [ ] `2 ^ 8 =` → `256`
- [ ] `10 / 0 =` → displays `Error: division by zero`
- [ ] Pressing `=` on an empty or cleared display does nothing
- [ ] The evaluator logic has no knowledge of the DOM — it is a pure function: `evaluate(expression: string): number | CalcError`
- [ ] Unit tests cover all four operations and division by zero

---

**US-005 — Floating Point**

As a user, I can see floating point precision behaviour and control display precision.

Acceptance criteria:
- [ ] `0.1 + 0.2 =` displays `0.30000000000000004` before precision is applied
- [ ] With display precision set to 10 significant figures, `0.1 + 0.2` displays `0.3`
- [ ] `0.1 + 0.2 == 0.3` evaluates to `false`
- [ ] An epsilon comparison `abs(0.1 + 0.2 - 0.3) < 1e-10` evaluates to `true`
- [ ] A precision selector (dropdown or toggle) allows 2, 4, 6, 8, 10 significant figures
- [ ] Changing precision re-displays the current result immediately
- [ ] `1/3` displays as `0.3333333333` at 10 significant figures
- [ ] The precision setting persists across calculations in the session

---

**US-006 — History**

As a user, every calculation is stored and shown in a scrollable list.

Acceptance criteria:
- [ ] After `3 + 4 =`, the history shows `3 + 4 = 7`
- [ ] After 10 calculations, all 10 are visible by scrolling
- [ ] The most recent calculation is always visible without scrolling
- [ ] Clicking a history entry pastes its result into the display
- [ ] History is stored as an immutable array — each entry is never mutated
- [ ] `C` clears the display but does not clear the history
- [ ] A separate "Clear History" button clears the history list

---

**US-007 — Full Expressions**

As a user, I can type multi-operator expressions with correct precedence and parentheses.

Acceptance criteria:
- [ ] `2 + 3 * 4 =` → `14` (not `20`)
- [ ] `(2 + 3) * 4 =` → `20`
- [ ] `2 ^ 3 ^ 2 =` → `512` (right-associative: `2^(3^2)`)
- [ ] `-5 + 3 =` → `-2` (unary minus)
- [ ] `((2 + 3))` → `5` (nested parentheses)
- [ ] Mismatched parentheses → `Error: mismatched parentheses`
- [ ] The parser is a separate module: `parse(tokens): ASTNode`
- [ ] The parser has no knowledge of the display or DOM

---

**US-008 — Variables**

As a user, I can store a value under a name and use it in expressions.

Acceptance criteria:
- [ ] `A = 42` stores `42` under `A`, displays `42`
- [ ] After storing, typing `A` in an expression uses `42`
- [ ] `A + 8 =` → `50`
- [ ] `A = A + 1` updates `A` to `43`
- [ ] Referencing an undefined variable → `Error: 'B' is not defined`
- [ ] Variable names are case-sensitive: `A` and `a` are different
- [ ] `pi` is pre-defined as `3.141592653589793`
- [ ] `e` is pre-defined as `2.718281828459045`
- [ ] A stored variable list is visible in a panel showing name and current value
- [ ] Variables persist for the duration of the session

---

**US-009 — Built-in Functions**

As a user, I can use trigonometric, logarithmic, and utility functions.

Acceptance criteria:
- [ ] In degree mode: `sin(30)` → `0.5`, `cos(60)` → `0.5`, `tan(45)` → `1`
- [ ] In radian mode: `sin(pi/2)` → `1`, `cos(0)` → `1`
- [ ] `log(100)` → `2` (base 10)
- [ ] `log(1000)` → `3`
- [ ] `ln(e)` → `1`
- [ ] `ln(1)` → `0`
- [ ] `sqrt(9)` → `3`
- [ ] `sqrt(-1)` → `Error: domain error — sqrt requires x ≥ 0`
- [ ] `abs(-7)` → `7`
- [ ] `floor(3.9)` → `3`, `ceil(3.1)` → `4`, `round(3.5)` → `4`
- [ ] `mod(10, 3)` → `1`
- [ ] A DEG/RAD toggle is visible on the calculator face and shows the current mode
- [ ] Switching mode immediately affects all subsequent trig evaluations
- [ ] Built-in functions are stored in a dispatch table (a plain object mapping name → function)

---

**US-010 — User Functions**

As a user, I can define a function and evaluate it at any point.

Acceptance criteria:
- [ ] `f(x) = x^2 + 1` defines a function named `f`
- [ ] `f(3)` → `10`
- [ ] `f(0)` → `1`
- [ ] `g(x) = 2*x - 1` defines a second function
- [ ] `g(f(2))` → `9` (function composition)
- [ ] A user function is stored separately from built-in functions
- [ ] Redefining `f(x) = x^3` updates `f` — old definition is replaced
- [ ] Calling an undefined function → `Error: 'h' is not defined`
- [ ] A user function with a missing argument → `Error: 'f' expects 1 argument, got 0`
- [ ] Defined functions appear in the variable/function panel

---

**US-011 — The Coordinate Plane**

As a user, I see a canvas with coordinate axes, a grid, and labelled scale marks.

Acceptance criteria:
- [ ] X and Y axes are drawn with arrows at their positive ends
- [ ] Grid lines appear at regular intervals, styled with a CSS custom property
- [ ] Axis labels show the coordinate value at each major grid line
- [ ] The origin (0, 0) is visible and labelled
- [ ] The canvas occupies the available space beside the input area
- [ ] The coordinate plane maps maths coordinates to canvas pixels via a viewport transform
- [ ] The viewport transform is a separate pure module: `mathToScreen(point, viewport): CanvasPoint`
- [ ] CSS custom properties control axis colour, grid colour, and label colour

---

**US-012 — Graphing**

As a user, I can type `f(x) = x^2` and see the curve drawn on the canvas.

Acceptance criteria:
- [ ] After defining `f(x) = x^2`, the curve appears on the canvas
- [ ] The curve is drawn by sampling `f(x)` at regular x-intervals across the visible domain
- [ ] Sampling interval is fine enough that the curve appears smooth (at least 500 samples across the viewport)
- [ ] The graph updates when `f(x)` is redefined
- [ ] The graph colour is a CSS custom property
- [ ] `f(x) = sin(x)` plots correctly in the current angle mode
- [ ] `f(x) = 1/x` plots with a visible gap at `x = 0` (see US-013)
- [ ] Evaluating `f(x)` where the result is `NaN` or `Infinity` produces no plotted point

---

**US-013 — Discontinuities**

As a user, functions with asymptotes or undefined points render as gaps — the calculator does not crash.

Acceptance criteria:
- [ ] `f(x) = 1/x` graphs with a visible gap at `x = 0` — no line connects the two branches
- [ ] `f(x) = tan(x)` graphs with vertical gaps at `π/2 + nπ`
- [ ] `f(x) = sqrt(x)` only renders for `x ≥ 0` — left of origin is blank
- [ ] `f(x) = log(x)` only renders for `x > 0`
- [ ] `1/0` typed directly → `Error: division by zero` (not `Infinity`)
- [ ] `sqrt(-4)` typed directly → `Error: domain error`
- [ ] `NaN` and `Infinity` are never displayed as-is — they are caught and shown as named errors
- [ ] A gap is rendered when two consecutive sample points have opposite signs of `Infinity`

---

**US-014 — Tables**

As a user, I can see a table of `x` and `f(x)` values beside the graph.

Acceptance criteria:
- [ ] The table shows `x` values from a start to an end with a configurable step
- [ ] Default range: x from `-10` to `10`, step `1`
- [ ] Each row shows `x` and `f(x)` formatted to the current display precision
- [ ] Undefined values (NaN, Infinity) show `—` in the table, not a crash
- [ ] The table scrolls independently of the graph
- [ ] Changing `f(x)` updates the table immediately
- [ ] The table data is computed as a pure function: `buildTable(f, start, end, step): TableRow[]`

---

**US-015 — Multiple Functions**

As a user, I can plot two functions on the same graph in distinct colours.

Acceptance criteria:
- [ ] `f(x)` and `g(x)` are both drawn on the canvas simultaneously
- [ ] Each function has a distinct colour defined as a CSS custom property
- [ ] A legend shows which colour corresponds to which function
- [ ] Removing a function definition removes its curve from the graph
- [ ] Up to 4 functions can be plotted simultaneously
- [ ] Each function's colour can be changed by the user
- [ ] The table shows a column for each defined function

---

**US-016 — Numerical Integration**

As a user, I can compute the area under `f(x)` between two bounds and see it shaded on the canvas.

Acceptance criteria:
- [ ] `integrate(f, 0, 1)` where `f(x) = x^2` → approximately `0.3333`
- [ ] `integrate(f, 0, pi)` where `f(x) = sin(x)` → approximately `2.0`
- [ ] The area between the curve and the x-axis is shaded on the canvas
- [ ] Three methods are selectable: left Riemann, right Riemann, trapezoid
- [ ] All three methods converge toward the same value as step size decreases
- [ ] The computed area value is shown as a number below the graph
- [ ] The shading colour is a CSS custom property
- [ ] Negative area (below x-axis) is shaded in a distinct colour
- [ ] Integration bounds can be adjusted — shading updates immediately
- [ ] `integrate` is a pure function: `integrate(f: (x: number) => number, a: number, b: number, method: IntegrationMethod, steps: number): number`

---

**US-017 — Zoom and Pan**

As a user, I can scroll to zoom and drag to pan the coordinate plane.

Acceptance criteria:
- [ ] Scrolling over the canvas zooms in/out centred on the cursor position
- [ ] Clicking and dragging pans the coordinate plane
- [ ] Grid lines and axis labels update immediately during pan and zoom
- [ ] A "Reset View" button returns to the default viewport
- [ ] The viewport state is a single object: `{ originX, originY, scale }`
- [ ] Zoom does not distort the aspect ratio (x and y scale equally)
- [ ] All graph curves, shading, and markers rerender correctly after pan/zoom

---

**US-018 — Bisection Solver**

As a user, I can find the root of `f(x) = 0` using the bisection method, and see the steps on the graph.

Acceptance criteria:
- [ ] `bisect(f, -5, 5)` where `f(x) = x^2 - 4` → approximately `2.0` or `-2.0` depending on initial bracket
- [ ] The root is marked on the graph with a distinct point indicator
- [ ] Each bisection step is shown as a narrowing bracket on the graph during animated playback
- [ ] The solver terminates when `|f(x)| < 1e-10` or after 100 iterations, whichever comes first
- [ ] If `f(a)` and `f(b)` have the same sign → `Error: no sign change in interval — cannot guarantee a root`
- [ ] The number of iterations taken is shown
- [ ] `bisect` is a pure function: `bisect(f, a, b, tolerance): SolverResult`

---

**US-019 — Intersection Finder**

As a user, I can find where `f(x)` and `g(x)` intersect, with the intersection marked on the graph.

Acceptance criteria:
- [ ] `intersect(f, g, -5, 5)` where `f(x) = x^2` and `g(x) = x + 2` → approximately `x = 2` and `x = -1`
- [ ] The intersection point is marked on the graph
- [ ] The solver works by applying bisection to `h(x) = f(x) - g(x) = 0` — no new algorithm needed
- [ ] If no intersection exists in the interval → `Error: no intersection found in [-5, 5]`
- [ ] Multiple intersections: finds the one closest to the midpoint of the interval
- [ ] The `intersect` function calls `bisect` internally — it is not a reimplementation

---

**US-020 — Newton's Method**

As a user, I can find the root of `f(x) = 0` using Newton's method and compare it to bisection.

Acceptance criteria:
- [ ] `newton(f, 1)` where `f(x) = x^2 - 4` starting from `x = 1` → approximately `2.0`
- [ ] Newton's method converges in fewer iterations than bisection for the same function
- [ ] The number of iterations for each method is shown side by side
- [ ] `f′(x)` is approximated numerically: `(f(x + 1e-7) - f(x - 1e-7)) / (2e-7)`
- [ ] If `f′(x) = 0` at any iteration → `Error: derivative is zero — Newton's method cannot continue`
- [ ] If the method does not converge after 100 iterations → `Error: Newton's method did not converge`
- [ ] `newton` is a pure function: `newton(f, initialGuess, tolerance): SolverResult`

---

**US-021 — Finding Extrema**

As a user, I can find the minimum or maximum of `f(x)` in an interval, marked on the graph.

Acceptance criteria:
- [ ] `minimum(f, -5, 5)` where `f(x) = x^2 - 3` → approximately `x = 0`, `f(x) = -3`
- [ ] `maximum(f, -pi, pi)` where `f(x) = sin(x)` → approximately `x = π/2`, `f(x) = 1`
- [ ] The min/max point is marked on the graph with a distinct indicator
- [ ] The solver finds extrema by applying bisection to `f′(x) = 0`
- [ ] `f′(x)` uses the same numerical differentiation as Newton's method (central difference)
- [ ] If no extremum exists in the interval → `Error: no extremum found in [-5, 5]`
- [ ] Both the x-coordinate and the function value at the extremum are shown

---

**US-022 — The Solver Panel**

As a user, I can enter a function, choose an operation, and see the result with steps on the graph.

Acceptance criteria:
- [ ] A panel accepts: function definition, operation (root / intersect / integrate / minimum / maximum), bounds
- [ ] Submitting runs the selected operation and shows the result
- [ ] The result is annotated on the graph (root marked, area shaded, etc.)
- [ ] Steps are shown: iteration count, convergence path for solvers, method used
- [ ] Invalid input shows a specific error message, not a crash
- [ ] Switching operations clears the previous annotation from the graph
- [ ] All solver functions are called from the panel — no logic is duplicated in the panel component

---

## 5. Out of Scope for MVP

- Symbolic algebra (exact answers, simplification)
- Regression and statistics (mean, standard deviation, line of best fit)
- Matrix operations
- Polar and parametric graphing
- Piecewise function syntax
- 3D graphing
- Unit conversion
- Complex numbers
- Programmable scripts or loops inside the calculator
- File export of graphs or results

---

## 6. System Constraints

- Runs entirely in the browser — no backend
- TypeScript `strict: true`
- CSS custom properties only — no hardcoded values
- All tests pass before a lesson is considered complete
- Compatible with: Chrome latest, Firefox latest, Edge latest
- Floating point display uses `toPrecision(10)` as the default

---

## 7. Open Questions

1. **Angle mode persistence:** should DEG/RAD mode persist across page refresh
   (localStorage) or reset to degrees each time?

2. **Graph update trigger:** should the graph re-render on every keystroke as the
   function is typed, or only when the user presses Enter? (Keystroke rendering
   may evaluate partial/invalid expressions constantly.)

3. **Integration step count:** how many steps should the default integration use?
   More steps = more accurate but slower. Needs a default and a range.

4. **Multiple roots:** the bisection and Newton solvers find one root per call.
   Should the solver panel attempt to find all roots in the interval automatically,
   or is one root per call sufficient for MVP?

5. **Implicit multiplication:** should `2x` be parsed as `2 * x`, or must the user
   type `2*x`? This affects the parser significantly and must be decided before
   the full expression parser is built.

6. **Function syntax:** `f(x) = x^2` vs `def f(x) = x^2` vs `f = x -> x^2`.
   Must be decided before the user function parser is built.
