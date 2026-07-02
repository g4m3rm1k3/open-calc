# MikeLab — Complete Lesson Index
## A MATLAB-compatible math engine built in TypeScript, from scratch.

---

## What MikeLab Is

A TypeScript library with three independently publishable layers:

```
@mikelab/core      — the math engine (matrices, linear algebra, decompositions)
@mikelab/parser    — a MATLAB-language parser (lexer → AST → evaluator)
@mikelab/ui        — a browser workspace (editor, output panel, plots)
```

Users can install any layer independently. The parser depends on core.
The UI depends on both. Each is a real npm package.

---

## How to Read This Index

Each lesson entry shows:

- **Builds:** what working software the lesson produces (runnable at the end)
- **CS:** computer science concepts taught
- **SE:** software engineering principles taught
- **Math:** mathematics taught or applied
- **Lang:** TypeScript/JavaScript concepts taught
- **Tools:** tooling, terminal, configuration concepts taught

The contract (lesson-contract.md) governs how each lesson is written.
This index governs what each lesson covers.

---

## Phase 0 — Foundation (Lessons 00–03)
### Before any math engine, you can see and run MikeLab

The agile rule: build something visible first. Phase 0 produces a
working browser interface before a single matrix operation exists.
This means every subsequent lesson adds to something real.

---

### Lesson 00 — What We Are Building and Why

**Builds:** nothing yet — but you understand the full system and can
draw it on paper before writing a line of code.

**CS:**
- What a compiler pipeline is (source → tokens → AST → output)
- What a library vs an application is
- What an API is (the public surface a package exposes to callers)
- What a monorepo is and why it exists

**SE:**
- Separation of concerns: why core, parser, and ui are three packages
- The dependency rule: ui depends on parser, parser depends on core,
  core depends on nothing
- Why you build the visible thing first (agile delivery)
- What "publishable to npm" means and what it requires

**Math:** none yet

**Lang:** none yet

**Tools:**
- What Node.js is and what it does
- What npm is: the Node Package Manager
- What a package is, what package.json is, what node_modules is
- What version control is and why it exists
- Git: init, add, commit — the three commands that matter first
- What a .gitignore file is and why node_modules is in it

---

### Lesson 01 — The Project Structure

**Builds:** a monorepo with three empty packages, each compiling
TypeScript to JavaScript, each with a passing "hello world" test.
Nothing math yet — but the skeleton that every future lesson adds to.

**CS:**
- What a module system is (how code in one file uses code from another)
- What ES modules are vs CommonJS (import/export vs require/module.exports)
- What a build system does (why you cannot just run TypeScript directly)
- What compilation means for TypeScript specifically

**SE:**
- Monorepo structure: one repository, multiple publishable packages
- Why pnpm workspaces exist and what problem they solve over npm
- The public surface rule: package.json "exports" field as an API contract
- devDependencies vs dependencies: what ships to users vs what stays local
- Semantic versioning: what ^1.0.0 means and why it matters

**Math:** none

**Lang:**
- TypeScript: what it adds to JavaScript (types, compile-time checking)
- tsconfig.json: every field we touch, explained
- What "strict mode" means and why it is always on
- What .d.ts files are and why they exist

**Tools:**
- pnpm: what it is, why it is faster than npm, what a workspace is
- Turborepo: what it does, why build order matters for multiple packages
- tsup: what it does, what "bundling" a library means
- Vitest: what a test runner is, what "passing" and "failing" mean
- The terminal: pwd, ls/dir, cd, mkdir — used without assumption

---

### Lesson 02 — The UI Shell (See It Before You Build It)

**Builds:** a browser page that looks like a MATLAB workspace —
an editor panel on the left, an output panel on the right.
Nothing works yet: you type and nothing happens.
But you can open it in a browser and see the layout.

**CS:**
- What the DOM is (the browser's in-memory representation of HTML)
- What a single-page application is
- What the browser's rendering pipeline is (HTML → DOM → layout → paint)

**SE:**
- Why the UI is built before the math engine (agile: visible first)
- What a CSS custom property (variable) is and why it exists
- Separation of concerns in HTML/CSS/JS: structure, style, behaviour

**Math:** none

**Lang:**
- HTML: semantic elements, what each tag means
- CSS: flexbox layout, custom properties, what a selector is
- TypeScript in the browser: how it differs from TypeScript in Node.js
- What document.getElementById does, what it returns, what happens on null
- Event listeners: what addEventListener does, what an event is

**Tools:**
- Vite: what it does in development vs production
- localhost and ports: what localhost:5173 means, what a port is
- Browser developer tools: Elements tab, Console tab, Sources tab
- How to open the browser console and why you need it

---

### Lesson 03 — The Console (First Working Feature)

**Builds:** a UI where you can type text, press Enter, and see it
echoed in the output panel. The first end-to-end interaction.
Security: user input is handled safely (no XSS).

**CS:**
- What an event loop is (how the browser handles user input)
- What XSS is: the threat, the attack, the defence
- innerHTML vs textContent: why one is dangerous and one is safe
- What a call stack is (briefly — full explanation in later lessons)

**SE:**
- Vertical slice: this lesson delivers the first complete input→output path
- Why we build echo first before building any math (confidence + feedback)
- The REPL pattern: Read-Evaluate-Print Loop — what it is, where it appears

**Math:** none

**Lang:**
- keyboard events: keydown, key property, what Enter looks like
- String methods: trim(), split() — explained at first use
- Template literals: the backtick string with ${} — explained here
- What null and undefined are and why TypeScript forces you to handle them

**Tools:**
- Git commit for the first working feature: message format explained
- How to read a TypeScript compiler error: file, line, message, what to do

---

## Phase 1 — The Math Engine (Lessons 04–12)
### @mikelab/core: matrices from scratch, one operation at a time

Each lesson adds one capability to the math engine and immediately
wires it to the UI so you can see the result.

---

### Lesson 04 — What a Matrix Is in Memory

**Builds:** a Matrix class that stores numbers and can display itself
in the output panel. You can hardcode `new Matrix([[1,2],[3,4]])` and
see it printed in the UI.

**CS:**
- What a class is and what it encapsulates (data + behaviour together)
- Flat array storage: why a 2D matrix is stored as a 1D array
- Index arithmetic: how (row, column) maps to a flat array index
- Float64Array: what a typed array is, why it exists, how it differs
  from a plain JavaScript array
- What immutability means and why we choose it here
- What a constructor is and what it does

**SE:**
- Single responsibility: the Matrix class knows about storage and
  access — not about display, not about operations
- Why immutable data structures prevent a whole class of bugs
- Private vs public: what internal state the class protects
- Factory methods: why Matrix.identity() exists instead of
  new Matrix('identity', 3)

**Math:**
- What a matrix is: a rectangular array of numbers
- The notation for dimensions: m rows × n columns
- Row-major vs column-major order: how different languages store matrices
- What the identity matrix is and why it matters

**Lang:**
- TypeScript classes: class, constructor, readonly, private
- TypeScript types: number, number[][], Float64Array
- What "type annotation" means: the colon syntax
- Getter properties: the get keyword
- What throws means and what Error is

**Tools:**
- How to write a test with Vitest: describe, it, expect, toBe
- Test-driven development: write the failing test first, then the code
- How to run tests and read the output

---

### Lesson 05 — Displaying Matrices in the UI

**Builds:** the UI renders a Matrix as a formatted table with aligned
columns, not just a raw string. You hardcode a matrix and see it
beautifully formatted in the output panel.

**CS:**
- What string formatting is and why alignment matters for readability
- What padding is: how toFixed() and padStart() work
- The rendering pipeline for this specific output

**SE:**
- Why display logic lives in the UI package, not in @mikelab/core
- The dependency direction: UI imports core, core never imports UI
- What "separation of display from data" means concretely

**Math:**
- How MATLAB displays matrices (the format we are replicating)

**Lang:**
- toFixed(n): what it does, what precision means
- padStart(n): what it does, why it produces alignment
- Array.from(): what it does, when you need it
- Template literals for multi-line strings

**Tools:**
- How to import from one package into another in a pnpm workspace
- What a workspace: dependency is in package.json

---

### Lesson 06 — Matrix Arithmetic (Add, Subtract, Scale)

**Builds:** the UI accepts hardcoded matrix operations and shows results.
A + B, A - B, and 3 * A work and display correctly.

**CS:**
- What element-wise operations are
- Why we validate dimensions before computing
- What an early return is and why it is cleaner than nested ifs
- What a pure function is: no side effects, same input always gives same output

**SE:**
- Error messages as an API: what makes a good error message
- Why operations return new matrices (immutability enforced at the API level)
- Testing arithmetic: the pattern of "known inputs, known output"

**Math:**
- Matrix addition: definition, requirements (same dimensions), examples
- Matrix subtraction: definition
- Scalar multiplication: definition, examples
- Why matrix addition is commutative (A+B = B+A) but subtraction is not

**Lang:**
- for loops with index: the pattern we use and why
- What Float64Array arithmetic looks like
- How to throw an Error with a descriptive message

**Tools:**
- How to write parameterised tests (testing many cases efficiently)
- What test coverage means (briefly)

---

### Lesson 07 — Matrix Multiplication

**Builds:** A * B works in the UI and displays the result.
A deliberate wrong-dimension multiplication shows a clear error.

**CS:**
- The triple nested loop: what each loop variable represents
- Why matrix multiplication is O(m·n·p)
- What cache efficiency means for the inner loop
- Why matrix multiplication is NOT commutative (AB ≠ BA in general)

**SE:**
- Why this is a separate lesson from addition: multiplication is
  fundamentally different and more complex
- The guard clause pattern: check preconditions at the top, early return
- Testing non-commutativity explicitly

**Math:**
- Matrix multiplication: the row-dot-column rule, step by step
- The dimension requirement: (m×n)(n×p) = (m×p)
- Why the inner dimensions must match
- The identity matrix as the multiplicative identity: AI = IA = A
- What it means geometrically: composing two transformations

**Lang:**
- Nested for loops: reading them correctly
- What += means and why we use it in the inner loop
- How to access both this._data and other._data in one operation

**Tools:**
- How to test matrix multiplication: specific known results
- How to test that multiplication is not commutative

---

### Lesson 08 — Transpose and Dot Product

**Builds:** A' and dot(u, v) work in the UI.

**CS:**
- What index swapping means in a flat array
- What a dot product is computationally: a reduction operation
- The relationship between transpose and dot product: u·v = uᵀv

**SE:**
- Why the Vector class extends Matrix (inheritance vs composition tradeoff)
- What "is-a" vs "has-a" means: a Vector IS a Matrix
- When inheritance is appropriate and when it is not

**Math:**
- Transpose: definition, notation (Aᵀ), what (Aᵀ)ᵀ = A means
- Dot product: u·v = u₁v₁ + u₂v₂ + ... + uₙvₙ
- Geometric meaning of the dot product: |u||v|cos(θ)
- What orthogonality means: u·v = 0 ↔ perpendicular
- Norm (length) of a vector: ||v|| = √(v·v)

**Lang:**
- extends in TypeScript: what class inheritance is
- super(): why the child constructor calls the parent constructor
- Method overriding: what it means when a child redefines a parent method
- getter properties used to compute derived values

**Tools:**
- Testing floating-point results: why toBe(0.5) sometimes fails
- toBeCloseTo(): what it does and when to use it

---

### Lesson 09 — Row Reduction (RREF)

**Builds:** rref(A) works in the UI. You can type a matrix,
apply rref, and see the reduced form with pivot columns highlighted.

**CS:**
- What an algorithm is vs what a formula is
- The Gaussian elimination algorithm: the three row operations
- What a pivot is and how to find one
- Partial pivoting: why we swap rows to get the largest pivot
- Numerical stability: what it means and why it matters for floating point

**SE:**
- This is the most complex algorithm in @mikelab/core so far:
  how to break a complex algorithm into named steps
- Why each row operation is a separate private method
- How to test an algorithm: known matrices with known RREF forms

**Math:**
- The three elementary row operations: swap, scale, add multiple
- What RREF is: definition, the four conditions
- What pivot columns are
- The connection between RREF and solutions to Ax = b
- What it means when a row becomes all zeros

**Lang:**
- Mutating a Float64Array in place: when immutability is relaxed
  and why (RREF works on a copy — the original is not modified)
- What Math.abs() does
- Number.EPSILON: what the smallest float difference is

**Tools:**
- How to debug an algorithm: console.log at each step, then remove
- What a numerical tolerance is and how to choose one

---

### Lesson 10 — Solving Linear Systems (Ax = b)

**Builds:** solve(A, b) works in the UI. You enter a matrix and
a right-hand side and get the solution vector (or a clear error
if no solution exists or infinitely many exist).

**CS:**
- Back substitution: the algorithm that follows RREF
- What "no solution" and "infinitely many solutions" look like in RREF
- What a null space is computationally: free variables

**SE:**
- Result types: returning either a solution or a structured error,
  not throwing for expected cases
- The union type in TypeScript: what A | B means
- Why "no solution" is not an exception — it is a valid answer

**Math:**
- What Ax = b means
- Particular solution vs general solution
- The null space: what it is, how to find it from RREF
- Free variables: why they exist and what they mean
- The connection between null space and the number of solutions
- Rank of a matrix: definition, connection to RREF pivot count

**Lang:**
- TypeScript union types: type Result = Solution | NoSolution | InfiniteSolutions
- Type guards: how to check which case you have
- What discriminated unions are (briefly)

**Tools:**
- Testing all three cases: unique, none, infinite
- How to test error conditions without throwing

---

### Lesson 11 — Determinant and Inverse

**Builds:** det(A) and inv(A) work in the UI. Trying to invert
a singular matrix gives a clear, informative error.

**CS:**
- LU decomposition: the algorithm behind det() and inv()
- What cofactor expansion is (the naive approach we improve on)
- Why computing the inverse via RREF is more numerically stable
  than the cofactor formula

**SE:**
- Two algorithms for the same result: when to choose each
- Why we implement inv() using the augmented matrix approach
  rather than the formula A⁻¹ = adj(A)/det(A)

**Math:**
- Determinant: geometric meaning (area/volume scaling)
- The 2×2 formula: ad - bc
- What det = 0 means: the matrix is not invertible
- Matrix inverse: what A⁻¹ is, what AA⁻¹ = I means
- How to find the inverse using row reduction on [A | I]
- What a singular matrix is

**Lang:**
- What NaN is and when it appears
- Number.isFinite(): what it checks
- How to augment two matrices in TypeScript

**Tools:**
- Testing that inv(inv(A)) ≈ A (floating point round-trip)
- Testing that A * inv(A) ≈ I

---

### Lesson 12 — Eigenvalues and Eigenvectors

**Builds:** eig(A) works in the UI. The output shows eigenvalues
and eigenvectors formatted the way MATLAB formats them.

**CS:**
- The QR algorithm: what it does and why we use it
  (not the closed-form formula, which only works for 2×2)
- What iteration means in numerical computing: repeating until convergence
- What convergence means: when to stop iterating
- What tolerance means in a stopping condition

**SE:**
- Numerical vs symbolic computation: why we use iteration, not algebra
- The iteration pattern: while loop with convergence check
- How to test iterative algorithms: known eigenvalues from symmetric matrices

**Math:**
- Eigenvalues and eigenvectors: Av = λv
- The characteristic equation: det(A - λI) = 0
- Why symmetric matrices always have real eigenvalues (Spectral Theorem)
- What diagonalization is: A = PDP⁻¹
- Geometric meaning: eigenvectors are directions A does not rotate

**Lang:**
- What a while loop is in the context of convergence
- How to check floating-point convergence without exact equality
- Complex numbers in JavaScript: why we avoid them (symmetric matrices)

**Tools:**
- How to test eigenvalues: verify Av = λv directly
- What a regression test is: tests that guard against future breakage

---

## Phase 2 — The Parser (Lessons 13–22)
### @mikelab/parser: turning text into math, from scratch

---

### Lesson 13 — What a Parser Is and Why We Build One

**Builds:** nothing yet — but you understand the full pipeline and
can trace the path from "A = [1 2; 3 4]" to a matrix in memory,
on paper, before writing any code.

**CS:**
- The compiler pipeline: source text → tokens → AST → evaluation
- What a token is: the atoms of a language
- What an AST is: a tree that captures the structure of an expression
- Why we separate lexing from parsing from evaluation
- What a grammar is: the rules that define valid MATLAB syntax

**SE:**
- Why each stage is a separate module with a single responsibility
- How to design a pipeline: each stage consumes one format, produces another
- What "MATLAB compatibility" means as a specification

**Math:** none

**Lang:** none

**Tools:**
- How to read a language grammar (BNF notation — briefly)
- What a specification is vs what an implementation is

---

### Lesson 14 — The Lexer, Part 1: Characters and Tokens

**Builds:** a lexer that tokenises a simple expression like `1 + 2`
and prints the token list in the UI.

**CS:**
- What a finite state machine is: states, transitions, inputs
- What a lexer (tokeniser) is: the first stage of a compiler
- What a token is: type + value + position
- Lookahead: reading one character ahead to make decisions
- Why we scan character by character, not with regex

**SE:**
- Single responsibility: the lexer's only job is tokenisation
- Why position information is stored in every token (for error messages)
- The Token type as a discriminated union

**Math:** none

**Lang:**
- What a string is in JavaScript: a sequence of UTF-16 code units
- String indexing: what str[i] gives you
- What charCodeAt() does and why we use it for digit/letter detection
- switch statements: what they are, when to use them vs if/else

**Tools:**
- How to display an array of tokens in the UI (formatted output)
- Testing a lexer: input string → expected token array

---

### Lesson 15 — The Lexer, Part 2: Numbers, Strings, and Keywords

**Builds:** the lexer handles all MATLAB token types: numbers
(integer, float, scientific notation), strings, identifiers,
keywords (if, for, while, function, end), and operators.

**CS:**
- Multi-character tokens: consuming characters until a delimiter
- What a keyword is vs what an identifier is
- Why keywords and identifiers use the same character rules
  but must be distinguished
- Maximal munch: always consume the longest valid token

**SE:**
- Lookup tables: using a plain object as a keyword registry
  (dispatch table pattern — named here, used everywhere later)
- Why we hardcode MATLAB's keyword list rather than discover it

**Math:**
- Scientific notation: what 1.5e-3 means, how to parse it

**Lang:**
- What parseFloat() does and when it gives NaN
- Regular expressions: one brief use to check if a char is a digit —
  explained fully, including why we avoid regex for the main logic
- What Infinity is in JavaScript and when it appears

**Tools:**
- Testing numbers: integers, floats, scientific notation, negative
- Testing keywords vs identifiers

---

### Lesson 16 — The Lexer, Part 3: MATLAB-Specific Tokens

**Builds:** the lexer correctly handles MATLAB's unusual tokens:
the matrix literal syntax [1 2; 3 4], the transpose operator ',
the end-of-statement semicolon (suppress output), and comments.

**CS:**
- Context-sensitive lexing: why ' means string in one position
  and transpose in another, and how to resolve the ambiguity
- What context is in a lexer: the previous token tells you the meaning

**SE:**
- MATLAB-specific design decisions vs general parser design
- The previous-token tracking pattern

**Math:**
- Why MATLAB uses ' for transpose: historical context
- The difference between ' (conjugate transpose) and .' (transpose)
  in MATLAB — we implement both

**Lang:** none new

**Tools:**
- Edge case testing: the transpose vs string ambiguity
- How to write tests for context-sensitive behaviour

---

### Lesson 17 — The Parser, Part 1: What an AST Is

**Builds:** the parser turns `1 + 2` into an AST and you can
see the tree printed in the UI (as indented text, not a graphic yet).

**CS:**
- What a tree data structure is: nodes, children, leaves, root
- What an abstract syntax tree is: why it is abstract (no parentheses)
- Recursive descent parsing: what recursion means for a parser
- What a grammar rule is and how it maps to a function

**SE:**
- One function per grammar rule: the recursive descent pattern
- Why the AST is a separate data structure from the token stream
- Node types as a discriminated union

**Math:** none

**Lang:**
- Recursive functions in TypeScript: a function that calls itself
- What a union type with a kind discriminant looks like
- readonly arrays: why AST nodes should not be modified

**Tools:**
- How to print a tree as indented text (the prettyPrint pattern)
- Testing: AST structure is deeply nested — how to compare trees

---

### Lesson 18 — The Parser, Part 2: Operator Precedence

**Builds:** `1 + 2 * 3` parses correctly: multiplication binds
tighter than addition. The AST reflects the correct grouping.

**CS:**
- Operator precedence: why 1 + 2 * 3 is not parsed left-to-right
- Pratt parsing: a clean way to handle precedence in recursive descent
- Binding power: what left and right binding power mean
- Why precedence is encoded in the grammar, not in a lookup table

**SE:**
- Pratt parsing as a design pattern: the technique is named here
  because you will see it everywhere in real parsers
- Why precedence rules must be tested exhaustively

**Math:**
- MATLAB operator precedence table: the exact rules we implement
- Why ^ (power) is right-associative: 2^3^2 = 2^(3^2)

**Lang:**
- What right-associativity and left-associativity mean
- Recursive function design: how each precedence level calls the next

**Tools:**
- Precedence tests: a table of expressions and expected parse trees

---

### Lesson 19 — The Parser, Part 3: MATLAB Expressions

**Builds:** matrix literals [1 2 3; 4 5 6], function calls sin(x),
indexing A(1,2), and colon ranges 1:10 all parse correctly.

**CS:**
- Parsing 2D literals: the newline and semicolon as row separators
- Function call vs indexing: MATLAB uses identical syntax for both
  (sin(x) and A(x) look the same — resolved at evaluation time)
- What lookahead is used for here

**SE:**
- Deferred resolution: we store "call or index" as one node type
  and resolve it later in the evaluator — this is intentional design
- Why the parser does not need to know whether a name is a function

**Math:**
- The colon operator: start:step:end
- What a range expression produces

**Lang:** none new

**Tools:**
- Testing function calls vs indexing ambiguity
- Testing matrix literals with various shapes

---

### Lesson 20 — The Parser, Part 4: Statements and Control Flow

**Builds:** if/else, for, while, and function definitions parse
correctly. A complete small MATLAB program can be parsed into an AST.

**CS:**
- Statement vs expression: what distinguishes them
- What a block is: a sequence of statements with a shared scope
- What a scope is (introduced here, used in the evaluator)
- What function definition syntax produces in an AST

**SE:**
- Grammar completeness: how to know when the parser is "done"
- Parsing recursive structures: if inside if, function inside function

**Math:** none

**Lang:**
- What block scope means in TypeScript vs JavaScript (var vs let)

**Tools:**
- Integration testing: parse a full .m file, check the AST

---

### Lesson 21 — The Evaluator, Part 1: Numbers and Arithmetic

**Builds:** the full pipeline works for arithmetic:
`1 + 2 * 3` goes through lexer → parser → evaluator → display.
The answer appears in the UI.

**CS:**
- Tree walking: the visitor pattern for traversing an AST
- What evaluation order means: post-order traversal
- What an environment is: the data structure that stores variables
- What a symbol table is: the classic name for this data structure

**SE:**
- The visitor pattern: named here because it is the standard
  pattern for AST evaluation
- The environment as a dependency: every evaluator call receives one
- Why we pass the environment rather than making it a global

**Math:**
- How arithmetic evaluation follows the tree structure

**Lang:**
- What a Map is in JavaScript: why we use Map not a plain object
  for the environment (Map preserves insertion order, allows any key)
- Recursive function calls across different node types

**Tools:**
- End-to-end testing: the full string → result pipeline
- Testing that semicolons suppress output (MATLAB behaviour)

---

### Lesson 22 — The Evaluator, Part 2: Variables, Matrices, and Functions

**Builds:** variables, matrix literals, and built-in functions
all work in the UI. You can type real MATLAB code and get results.

```
A = [1 2; 3 4]
B = A * A
eig(B)
```

This is the first lesson where MikeLab feels like MATLAB.

**CS:**
- Scope chains: how inner scopes find variables in outer scopes
- What a built-in function registry is (dispatch table pattern again)
- Call stack: what happens when a function calls a function
- What "name resolution" is: finding a value for a name

**SE:**
- The dispatch table pattern (second major appearance):
  connecting function names to implementations without if/else chains
- Security: evaluating user-provided code safely (no eval())
- Why we never use JavaScript's eval() and what we do instead

**Math:**
- This is where @mikelab/core and @mikelab/parser connect:
  the evaluator calls core functions with real Matrix objects

**Lang:**
- What eval() is and why it is dangerous (XSS, injection)
- JavaScript's Map for the built-in function registry

**Tools:**
- Testing the full MATLAB-to-result pipeline
- How to add a new built-in function: the extension point

---

## Phase 3 — The Full UI (Lessons 23–28)
### @mikelab/ui: a real workspace, not just an echo panel

---

### Lesson 23 — Syntax Highlighting

**Builds:** the editor highlights MATLAB keywords, numbers, strings,
and operators with different colours as you type.

**CS:**
- What syntax highlighting is computationally: tokenise + style
- Why we reuse the lexer here (tokens carry position information)
- What a CodeMirror extension is (the editor library we use)

**SE:**
- Reusing @mikelab/parser from the UI: this is the dependency
  rule paying off — the lexer was built to be reusable
- Performance: the lexer runs on every keystroke — hot path rules apply

**Math:** none

**Lang:**
- What a CSS class is and how JavaScript adds/removes classes
- What requestAnimationFrame is and when to use it for highlighting

**Tools:**
- CodeMirror 6: what it is, how it is installed, what its API looks like
- Debouncing: what it is and why syntax highlighting needs it

---

### Lesson 24 — The Variable Workspace Panel

**Builds:** a panel that shows all current variables, their types,
and their values (dimensions for matrices, value for scalars).
Updates live as you run code.

**CS:**
- What a reactive UI is: UI that updates when data changes
- The observer pattern: how the evaluator notifies the UI

**SE:**
- The observer pattern: named here, used everywhere in UI programming
- Why the evaluator does not know about the UI (dependency direction)
- Events as a decoupling mechanism

**Math:** none

**Lang:**
- What a CustomEvent is in the browser
- EventTarget and dispatchEvent: how to emit and listen to events

**Tools:**
- How to test UI updates without a full browser (brief intro to jsdom)

---

### Lesson 25 — Error Display and Stack Traces

**Builds:** errors show in the UI with the line number and a
clear message. Runtime errors (divide by zero, dimension mismatch)
are caught and displayed, not thrown to the console.

**CS:**
- What a stack trace is and how to read one
- What error recovery means in a parser/evaluator
- The difference between parse errors and runtime errors

**SE:**
- Error as a value vs error as an exception: when to use each
- User-facing errors vs developer errors: different messages, different handling
- Why we never show JavaScript stack traces to users

**Math:** none

**Lang:**
- try/catch/finally: what each block does
- The Error class: what message and stack are
- How to create custom error classes in TypeScript

**Tools:**
- Browser console: how to read a JavaScript stack trace
- How to test error messages

---

### Lesson 26 — Plotting (2D Graphs)

**Builds:** plot(x, y) draws a line graph in the output panel.
plot(1:100, sin(1:100)) works end-to-end.

**CS:**
- What the Canvas 2D API is
- The coordinate system: canvas origin vs math origin
- What scaling means: mapping data coordinates to pixel coordinates
- What antialiasing is (briefly)

**SE:**
- Adding a new output type: how the evaluator signals "this is a plot"
- The output type discriminated union: extending it without breaking existing code
- Open/closed principle: adding plot support without modifying
  the existing text output code

**Math:**
- How to map a data range [min, max] to a pixel range [0, width]
- Linear interpolation: the formula and its application here

**Lang:**
- The Canvas API: getContext, beginPath, moveTo, lineTo, stroke
- requestAnimationFrame: when drawing is synchronous vs animated

**Tools:**
- How to test canvas output (snapshot testing — briefly)

---

### Lesson 27 — File Operations (.m files)

**Builds:** you can load and save .m files from the UI.
A file you save can be reloaded and re-executed.

**CS:**
- What the File API is and how the browser accesses local files
- What a Blob is
- What encoding is: why text files need an encoding

**SE:**
- Security: why the browser restricts file access and how to work within it
- Why we never send user files to a server (privacy)
- The user permission model for File API access

**Math:** none

**Lang:**
- FileReader API: what it does, what the events are
- URL.createObjectURL: what it does, why we revoke it
- TextDecoder: what encoding is, why UTF-8

**Tools:**
- How to test file operations: mocking the File API

---

### Lesson 28 — Publishing to npm

**Builds:** @mikelab/core and @mikelab/parser are published to npm
(or to a local registry for practice). Someone can install them.

**CS:** none new

**SE:**
- What npm publish does and what happens on the registry
- What a changelog is and why it exists
- Semantic versioning in practice: when to bump major/minor/patch
- What a BREAKING CHANGE is and why it matters

**Math:** none

**Lang:** none

**Tools:**
- npm publish: the command, the flags, what it reads from package.json
- .npmignore vs "files" field: which files get published
- npm login: what authentication is required
- What a local npm registry is (Verdaccio) for practice publishing
- README.md: what it must contain for a published package
- Changelog format: keep-a-changelog convention

---

## Appendix: Concept Map

Every CS concept and where it is first taught:

```
Finite state machine        → Lesson 14
Recursive descent parsing   → Lesson 17
Pratt parsing               → Lesson 18
Visitor pattern             → Lesson 21
Observer pattern            → Lesson 24
Dispatch table              → Lesson 15 (first), Lesson 22 (second)
Symbol table / environment  → Lesson 21
Immutability                → Lesson 04
Flat array storage          → Lesson 04
Numerical stability         → Lesson 09
Convergence / iteration     → Lesson 12
XSS / injection             → Lesson 03 (XSS), Lesson 22 (injection)
Open/closed principle       → Lesson 26
Single responsibility       → Lesson 01 (introduced), used throughout
Separation of concerns      → Lesson 00 (introduced), used throughout
```

Every Math concept and where it is first taught:

```
What a matrix is            → Lesson 04
Matrix addition             → Lesson 06
Matrix multiplication       → Lesson 07
Transpose                   → Lesson 08
Dot product                 → Lesson 08
Norm (vector length)        → Lesson 08
Orthogonality               → Lesson 08
RREF                        → Lesson 09
Null space                  → Lesson 10
Rank                        → Lesson 10
Determinant                 → Lesson 11
Matrix inverse              → Lesson 11
Eigenvalues/eigenvectors    → Lesson 12
Spectral theorem            → Lesson 12
Linear interpolation        → Lesson 26
```

Every TypeScript concept and where it is first taught:

```
Type annotations            → Lesson 01
Interfaces                  → Lesson 01
Classes                     → Lesson 04
Union types                 → Lesson 10
Discriminated unions        → Lesson 10
Generics                    → Lesson 15
Type guards                 → Lesson 10
readonly                    → Lesson 04
private                     → Lesson 04
extends (inheritance)       → Lesson 08
Custom error classes        → Lesson 25
```
