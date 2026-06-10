# OpenMAT Interpreter + Visualiser — Business Requirements Document
### Version 0.1 — MVP

---

## 1. What This Is

A MATLAB-inspired language interpreter and canvas visualiser built entirely in
TypeScript, running in the browser. The interpreter parses and evaluates source
code entered in a console. The visualiser renders geometric output on an HTML canvas.

The language implements a subset of MATLAB syntax sufficient to define vectors,
matrices, and transformation operations that drive the visualiser.

---

## 2. What This Is Not

- Not a full MATLAB implementation
- Not a general-purpose language (no file I/O, no modules, no classes)
- Not a server-side application — everything runs in the browser
- Not a plotting library — the canvas is purpose-built for this project
- Not a REPL that persists state across page refresh (session state only)

---

## 3. Technical Decisions

### Architecture

```
Console UI (HTML / CSS / TypeScript)
         ↓  source string
      Lexer  →  token list
         ↓
      Parser  →  AST
         ↓
    Evaluator  →  values
         ↓
Console output  +  Canvas renderer
```

Each stage is a separate module with a single exported function or class.
No stage imports from the stage after it. The lexer does not know about the parser.
The parser does not know about the evaluator. The evaluator does not know about
the canvas.

### Language

TypeScript with `strict: true`. No JavaScript files.

### CSS

CSS custom properties from lesson 1. No hardcoded colours, sizes, or spacing
anywhere in CSS or TypeScript.

### Testing

Every module has a test file. Tests are written before implementation (TDD).
Test runner: Vitest.

### Token Types

```typescript
const TokenType = {
  NUMBER: 'NUMBER', STRING: 'STRING', IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD', EQUALS: 'EQUALS', PLUS: 'PLUS', MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY', DIVIDE: 'DIVIDE', POWER: 'POWER',
  LPAREN: 'LPAREN', RPAREN: 'RPAREN', LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  SEMICOLON: 'SEMICOLON', COMMA: 'COMMA', COLON: 'COLON',
  GT: 'GT', LT: 'LT', GTE: 'GTE', LTE: 'LTE', EQEQ: 'EQEQ', NEQ: 'NEQ',
  AND: 'AND', OR: 'OR', NOT: 'NOT',
  NEWLINE: 'NEWLINE', EOF: 'EOF',
} as const
```

### Keywords

```typescript
const KEYWORDS = new Set([
  'if', 'elseif', 'else', 'end',
  'for', 'while', 'break', 'continue',
  'function', 'return',
  'true', 'false',
])
```

---

## 4. User Stories

---

### Epic 1 — The Shell

---

**US-001 — The Canvas**

As a user, when I open the application I see an HTML canvas with a triangle drawn on it.

Acceptance criteria:
- [ ] Canvas renders at a minimum size of 600×400px
- [ ] A triangle is drawn with three visible vertices
- [ ] The triangle stroke colour is defined as a CSS custom property
- [ ] The canvas background colour is defined as a CSS custom property
- [ ] No hardcoded colour values exist anywhere in CSS or TypeScript
- [ ] The page title in the browser tab reads "OpenMAT"
- [ ] All layout spacing and sizing uses CSS custom properties

---

**US-002 — The Console**

As a user, I can type text into an input field and see it echoed in an output area.

Acceptance criteria:
- [ ] An input field is visible alongside the canvas
- [ ] Pressing Enter submits the input
- [ ] Submitted text appears in the output area with a `>` prefix
- [ ] The output area scrolls to the most recent entry automatically
- [ ] The input field clears after each submission
- [ ] Pressing the up arrow key recalls the previous input
- [ ] The console and canvas share the available space using CSS custom properties for layout
- [ ] The console output area has a visible scroll bar when output overflows

---

### Epic 2 — The Interpreter

---

**US-003 — Type Safety and Tooling**

As a developer, the project compiles cleanly with strict TypeScript, has a working
test runner, and demonstrates type safety catching a real error at compile time.

Acceptance criteria:
- [ ] `tsconfig.json` has `strict: true`
- [ ] `npm run build` compiles without errors or warnings
- [ ] `npm test` runs the test suite and reports results
- [ ] `npm run dev` starts a dev server with hot reload
- [ ] The `TokenType` const object is defined and typed so that an invalid string
      assigned to a `TokenType` value is a compile-time error — not a runtime error
- [ ] At least one test file exists and passes

---

**US-004 — The Lexer**

As a user, when I type source code into the console, a token list appears in the output.

Acceptance criteria:
- [ ] `tokenize('42')` → `[{ type: 'NUMBER', value: 42, line: 1 }, { type: 'EOF', ... }]`
- [ ] `tokenize('3.14')` → NUMBER token with `value: 3.14`
- [ ] `tokenize('myVar')` → `{ type: 'IDENTIFIER', value: 'myVar', line: 1 }`
- [ ] `tokenize('for')` → `{ type: 'KEYWORD', value: 'for', line: 1 }`
- [ ] All keywords tokenise as KEYWORD, not IDENTIFIER: `if elseif else end for while function return true false`
- [ ] `tokenize('+ - * / ^ =')` → PLUS, MINUS, MULTIPLY, DIVIDE, POWER, EQUALS
- [ ] `tokenize('( ) [ ] , ; :')` → LPAREN, RPAREN, LBRACKET, RBRACKET, COMMA, SEMICOLON, COLON
- [ ] `tokenize('> < >= <= == ~=')` → GT, LT, GTE, LTE, EQEQ, NEQ
- [ ] Whitespace (spaces, tabs) produces no tokens
- [ ] `tokenize('x = 1 % comment\ny = 2')` — comment is skipped, NEWLINE token exists between lines
- [ ] The token for `y` in `'x\ny'` has `line: 2`
- [ ] `tokenize("disp('hello')")` — `'hello'` → `{ type: 'STRING', value: 'hello', line: 1 }`
- [ ] `tokenize("'unterminated")` throws a `LexerError` whose message contains the line number
- [ ] `tokenize('')` → `[{ type: 'EOF', value: null, line: 1 }]`
- [ ] The token list is shown in the console output when source is submitted

---

**US-005 — The Parser**

As a user, when I type an expression into the console, its abstract syntax tree
appears in the output.

Acceptance criteria:
- [ ] `'42'` parses to a `NumberLiteral` node with `value: 42`
- [ ] `'3 + 4'` parses to `BinaryOp('+', NumberLiteral(3), NumberLiteral(4))`
- [ ] `'3 + 4 * 2'` — multiplication binds tighter than addition: right child of `+` is `BinaryOp('*', 4, 2)`
- [ ] `'(3 + 4) * 2'` — parentheses override precedence: left child of `*` is `BinaryOp('+', 3, 4)`
- [ ] `'x'` parses to `Identifier('x')`
- [ ] `'-x'` parses to `UnaryOp('-', Identifier('x'))`
- [ ] `'x = 10'` parses to `Assignment('x', NumberLiteral(10))`
- [ ] `'disp(x)'` parses to `FunctionCall('disp', [Identifier('x')])`
- [ ] `'disp(x, y)'` parses to `FunctionCall('disp', [Identifier('x'), Identifier('y')])`
- [ ] The AST is printed in the console in a readable indented format
- [ ] `'3 +'` (incomplete expression) throws a `ParseError` with the line number

---

**US-006 — The Evaluator**

As a user, when I type `3 + 4 * 2` into the console, I see `11` in the output.

Acceptance criteria:
- [ ] `'42'` → `42`
- [ ] `'3 + 4'` → `7`
- [ ] `'3 + 4 * 2'` → `11` (not `14`)
- [ ] `'(3 + 4) * 2'` → `14`
- [ ] `'10 / 4'` → `2.5`
- [ ] `'2 ^ 3'` → `8`
- [ ] `'-5'` → `-5`
- [ ] `'true'` → `true`
- [ ] `'false'` → `false`
- [ ] `'3 > 2'` → `true`
- [ ] `'3 < 2'` → `false`
- [ ] `'3 == 3'` → `true`
- [ ] `'3 ~= 4'` → `true`
- [ ] `'10 / 0'` → `Inf` (MATLAB behaviour — not a crash)
- [ ] The result appears in the console output on the line below the source

---

### Epic 3 — Language Features

---

**US-007 — Variables**

As a user, I can assign a value to a variable and use it in later expressions.

Acceptance criteria:
- [ ] `x = 10` then `x` → `10`
- [ ] `x = 10` then `x + 5` → `15`
- [ ] `x = 5` then `x = x + 1` then `x` → `6`
- [ ] `disp(x)` prints the value of `x` to the console
- [ ] Referencing an undefined variable produces: `RuntimeError on line N: 'x' is not defined`
- [ ] Variable names are case-sensitive: `x` and `X` are different
- [ ] `a = 1`, `b = 2`, `a + b` → `3` (multiple variables persist in the same session)
- [ ] `pi` is pre-defined as `3.141592653589793`
- [ ] `e` is pre-defined as `2.718281828459045`

---

**US-008 — Error Handling**

As a user, when my code has an error I see a specific message with the line number —
no JavaScript stack trace is ever shown.

Acceptance criteria:
- [ ] Undefined variable → `RuntimeError on line N: 'x' is not defined`
- [ ] Wrong argument count → `RuntimeError on line N: 'disp' expects 1 argument, got 0`
- [ ] Type mismatch → `RuntimeError on line N: cannot add String and Number`
- [ ] Unterminated string → `LexerError on line N: unterminated string literal`
- [ ] Unexpected token → `ParseError on line N: unexpected '+', expected expression`
- [ ] Missing `end` → `ParseError on line N: 'if' block has no matching 'end'`
- [ ] Error messages appear in a visually distinct colour defined as a CSS custom property
- [ ] No `TypeError`, `ReferenceError`, or stack trace from JavaScript is ever visible in the console output

---

**US-009 — Control Flow**

As a user, I can write if / elseif / else / end blocks and see the correct branch execute.

Acceptance criteria:
- [ ] `if true \n disp(1) \n end` → outputs `1`
- [ ] `if false \n disp(1) \n end` → outputs nothing
- [ ] `if false \n disp(1) \n else \n disp(2) \n end` → outputs `2`
- [ ] `x = 7 \n if x > 5 \n disp('big') \n else \n disp('small') \n end` → `big`
- [ ] `elseif` branch executes when previous conditions are false and its condition is true
- [ ] Nested `if` blocks evaluate correctly
- [ ] An `if` without a matching `end` → `ParseError`
- [ ] `&&` (and), `||` (or), `!` (not) evaluate correctly
- [ ] `>`, `<`, `>=`, `<=`, `==`, `~=` all evaluate correctly as boolean expressions

---

**US-010 — Loops**

As a user, I can write for loops that execute a body a defined number of times,
and a loop that draws triangles on the canvas.

Acceptance criteria:
- [ ] `for i = 1:3 \n disp(i) \n end` → outputs `1`, `2`, `3`
- [ ] `for i = 1:1 \n disp(i) \n end` → outputs `1` exactly once
- [ ] `for i = 1:0 \n disp(i) \n end` → outputs nothing
- [ ] The loop variable is accessible inside the body
- [ ] `sum = 0 \n for i = 1:5 \n sum = sum + i \n end \n disp(sum)` → `15`
- [ ] A loop with 5 iterations draws 5 triangles on the canvas at horizontally offset positions
- [ ] A `for` without a matching `end` → `ParseError`
- [ ] Nested loops evaluate correctly
- [ ] `break` exits the innermost loop

---

**US-011 — Functions**

As a user, I can define a function and call it, including recursively.

Acceptance criteria:
- [ ] `function result = square(n) \n result = n * n \n end \n disp(square(7))` → `49`
- [ ] `function result = factorial(n) \n if n <= 1 \n result = 1 \n else \n result = n * factorial(n-1) \n end \n end \n disp(factorial(5))` → `120`
- [ ] A function that never assigns to its result variable → `RuntimeError`: function returned no value
- [ ] Calling an undefined function → `RuntimeError on line N: 'foo' is not defined`
- [ ] Variables defined inside a function are not visible outside it
- [ ] Functions must be defined before they are called (no hoisting)
- [ ] Built-in functions work: `disp(x)`, `sqrt(x)`, `abs(x)`, `mod(x, y)`

---

### Epic 4 — Maths and Visualisation

---

**US-012 — Vectors**

As a user, I can define a vector and see it plotted as an arrow on the canvas.

Acceptance criteria:
- [ ] `v = [3, 4]` stores a 2-element vector
- [ ] `v = [1, 2, 3]` stores a 3-element vector
- [ ] `v(1)` returns the first element — 1-indexed (MATLAB convention)
- [ ] `[1, 2] + [3, 4]` → `[4, 6]`
- [ ] `2 * [1, 2]` → `[2, 4]`
- [ ] `dot([3, 4], [3, 4])` → `25`
- [ ] `norm([3, 4])` → `5`
- [ ] A 2-element vector is plotted as an arrow from the origin to (x, y) on the canvas
- [ ] The arrow updates when the vector value changes
- [ ] Adding a vector to a number → `RuntimeError`: type mismatch
- [ ] A vector displays in the console as `[3, 4]`, not `[object Object]`
- [ ] Adding vectors of different lengths → `RuntimeError`: dimension mismatch

---

**US-013 — Matrices**

As a user, I can define a matrix and multiply two matrices together, and see the
result displayed correctly.

Acceptance criteria:
- [ ] `A = [1, 2; 3, 4]` stores a 2×2 matrix (semicolon separates rows)
- [ ] `A(1, 1)` → `1` (row 1, col 1 — 1-indexed)
- [ ] `A(2, 1)` → `3`
- [ ] `[1, 2; 3, 4] * [5, 6; 7, 8]` → `[19, 22; 43, 50]`
- [ ] `[1, 0; 0, 1] * [3, 4; 5, 6]` → `[3, 4; 5, 6]` (identity matrix property)
- [ ] Multiplying incompatible matrices → `RuntimeError`: `cannot multiply 2×3 by 2×3 matrix`
- [ ] A matrix displays in the console in a readable grid format, not as `[object Object]`
- [ ] `size(A)` → `[2, 2]`
- [ ] `transpose(A)` returns the transposed matrix

---

**US-014 — Transformations**

As a user, I can write OpenMAT code that transforms the triangle on the canvas using
matrix operations, and see it update immediately.

Acceptance criteria:
- [ ] Multiplying a 2×2 rotation matrix by the triangle's vertex vectors produces a visibly rotated triangle
- [ ] `rotate(45)` rotates the triangle 45 degrees (degrees, not radians)
- [ ] `scale(2)` scales the triangle to twice its size from the origin
- [ ] `translate(50, 30)` moves the triangle 50 units right and 30 units down
- [ ] Composing transforms — `translate(rotate(scale(triangle, 2), 45), 50, 30)` — applies in correct order
- [ ] The canvas updates immediately after each evaluation
- [ ] The original triangle is drawn in one colour and the transformed triangle in another — both CSS custom properties
- [ ] The transformation matrix is printed in the console output
- [ ] `rotate(360)` returns the triangle to within floating-point tolerance of its original position

---

## 5. Out of Scope for MVP

- Complex numbers
- Cell arrays (`{1, 'hello', [1,2]}`)
- Structs (`s.field = value`)
- While loops (may be added post-MVP)
- File I/O
- Matrix operations beyond multiply and transpose (determinant, inverse, eigenvalues)
- String manipulation beyond `disp`
- Regular expressions
- `try / catch` error handling inside the language itself
- Plotting multiple functions (the canvas renders geometry only, not function graphs)

---

## 6. System Constraints

- Runs entirely in the browser — no backend, no Node.js at runtime
- TypeScript `strict: true` — no `any`, no implicit types
- CSS custom properties only — no hardcoded values
- All tests pass before a lesson is considered complete
- Compatible with: Chrome latest, Firefox latest, Edge latest

---

## 7. Open Questions

1. **Range syntax as a value:** should `1:5` produce a vector `[1, 2, 3, 4, 5]` that can
   be assigned and passed to functions, or is `:` only valid inside a `for` loop header?

2. **Canvas coordinate system:** Y-axis pointing up (maths convention) or down (screen
   convention)? Decision affects how all vectors and transformations are displayed.

3. **Multi-line input:** should the console accept multi-line programs (pasted or
   entered with Shift+Enter), or is each line evaluated independently?

4. **Function hoisting:** must functions be defined before they are called, or can a
   function call appear before its definition in the source? (US-011 currently requires
   definition before use — confirm this is the right choice.)

5. **Matrix row separator:** semicolon (`[1, 2; 3, 4]`) vs newline (`[1, 2\n3, 4]`)?
   Both are valid MATLAB. Decide before the matrix tokeniser is built.
