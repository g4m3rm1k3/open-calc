# OpenMAT — Lesson 10 — Control Flow

## What You Will Build

After typing `x = 10` and then the block below:

```
>> if x > 5
     disp('big')
   end
big
```

After `x = 3`:

```
>> if x > 5
     disp('big')
   else
     disp('small')
   end
small
```

The console accumulates lines until `end` before sending the full program to the
evaluator. The lexer and evaluator already handle comparison operators
(`>`, `<`, `>=`, `<=`, `==`, `~=`) — this lesson adds the `if` block to the
parser and console, and makes the evaluator act on conditions.

---

## What You Need to Know First

Lessons 01–09 complete. The `tokenize`, `parse`, `evaluate`, `Environment`, and
`formatResult` pipeline from earlier lessons is the backbone this lesson extends.
The `OpenMATError` hierarchy — `LexerError`, `ParseError`, `RuntimeError` — is
established; new errors thrown here will inherit from those types. The lexer from
lesson 04 already produces `KEYWORD` tokens for `if`, `else`, `elseif`, and `end`,
and comparison tokens `GT`, `LT`, `GTE`, `LTE`, `EQEQ`, `NEQ`. The parser from
lesson 05 handles single expressions only; multi-statement programs are not yet
supported. The `Environment` symbol table from lesson 08 stores and looks up named
values — variables and functions the user has defined.

---

## Concept: Boolean Evaluation in a Numeric Language

**What it is:**

OpenMAT, like MATLAB, does not have a separate `boolean` type. Comparison operators
evaluate to JavaScript's `true` and `false`. The condition in an `if` statement
follows this truthiness rule:

- `false` is **falsy** — the then branch does not run
- `0` (the number zero) is **falsy** — the then branch does not run
- Everything else is **truthy** — the then branch runs

Notice carefully what this means for strings: `'0'` is a non-empty string, so it
is **truthy** in OpenMAT. This differs from JavaScript, where `0`, `''` (empty
string), `null`, `undefined`, `NaN`, and `false` are all falsy. OpenMAT follows
MATLAB's convention — only the boolean `false` and the number `0` are falsy.

This means both `if x > 5` (which produces a `boolean`) and `if x` (which
produces a `number`) are valid conditions. The evaluator uses a single helper
function for the truthiness check.

**Real-world connection — language design and truthiness:**

Boolean evaluation is a design decision every language makes differently, and it
is one of the most consequential choices a language designer makes — because it
affects every conditional in every program written in that language:

- **Python:** `0`, `[]`, `{}`, `None`, and `''` are falsy. Non-empty containers
  (even `[0]`) are truthy.
- **JavaScript:** `0`, `''`, `null`, `undefined`, `NaN`, and `false` are falsy.
  Empty arrays `[]` and empty objects `{}` are truthy, which surprises many beginners.
- **Ruby:** Only `false` and `nil` are falsy. Everything else — including `0` and
  `''` — is truthy.
- **MATLAB (which OpenMAT follows):** `0` is falsy. A non-empty string is truthy
  regardless of its contents.

A learner moving from JavaScript to Ruby for the first time will write `if count`
expecting it to be falsy when `count === 0`, and be confused when it runs. The
rule is baked into every conditional. Knowing which truthiness model a language
follows is not trivia — it is foundational to reading and writing that language
correctly.

**Maths connection — inequalities and boolean algebra:**

`x > 5` is a mathematical inequality: true or false depending on the value of
`x`. In mathematics, the solution set is `{x ∈ ℝ | x > 5}`. In code, it
evaluates to one specific truth value at a specific moment.

`x ≥ y` in maths is `x >= y` in code. `x ≠ y` is `x ~= y`. The translation is
direct — only the notation differs.

*Boolean algebra* (named after George Boole, 1847) has three fundamental operations:

| Name | OpenMAT | Rule |
|------|---------|------|
| AND  | `a && b` | true only if both `a` and `b` are true |
| OR   | `a \|\| b` | true if at least one is true |
| NOT  | `~a`    | true if `a` is false; false if `a` is true |

Any logical condition — no matter how complex — can be expressed using only
these three operations. When you write `if x > 0 && x < 10`, you are computing
the AND of two inequalities.

**CS concept — short-circuit evaluation:**

`&&` and `||` do not always evaluate both sides:

- `a && b`: if `a` is falsy, the result is false — `b` is never evaluated.
- `a || b`: if `a` is truthy, the result is true — `b` is never evaluated.

This is not just an optimisation — it prevents errors:

```
if count > 0 && total / count > 10
```

If `count` is `0`, evaluating `total / count` would throw `RuntimeError: Division
by zero`. Short-circuit evaluation means `total / count` is never reached when
`count > 0` fails. The `&&` acts as a guard. Order matters: put the cheaper or
safer check first.

**SE concept — boundary condition testing:**

A *boundary condition* is a value at the edge of an input range — right at the
dividing line between two behaviours. Boundary conditions are where conditional
logic bugs hide.

For `if x > 5`:
- `x = 6` → enters branch (above boundary)
- `x = 5` → does NOT enter (at the boundary, not above it)
- `x = 4` → does NOT enter (below boundary)

A test with only `x = 10` does not catch the case where `>=` was written instead
of `>` by mistake. The test that finds this bug checks `x = 5` — the boundary
value. Rule: always test the value at the boundary, one below, and one above.

---

## Step 1 — Extend the AST for Control Flow

**The problem:** The `ASTNode` union in lesson 05 covers expressions only —
numbers, identifiers, operators, function calls. An `if` block is a statement
that contains other statements. The parser has no type for this yet.

Open `src/parser.ts`. Add two new node types to the `ASTNode` union:

```typescript
export type ASTNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | IdentifierNode
  | BinaryOpNode
  | UnaryOpNode
  | AssignmentNode
  | FunctionCallNode
  | IfNode        // ← new
  | BlockNode;    // ← new

export interface IfNode {
  kind:       'If';
  condition:  ASTNode;
  thenBlock:  ASTNode[];
  elseBlock:  ASTNode[];
  line:       number;
}

export interface BlockNode {
  kind:       'Block';
  statements: ASTNode[];
  line:       number;
}
```

**Walkthrough — what these types describe:**

`IfNode` represents one `if` statement in the abstract syntax tree. Its
`condition` is any expression that can be evaluated to a truthy or falsy value —
`x > 5`, `x`, or even a nested function call. `thenBlock` is the list of
statements to run when the condition is truthy. `elseBlock` is the list to run
when it is falsy — an empty array when there is no `else` clause.

`BlockNode` represents a sequence of statements at the top level — the program
the user typed before pressing Enter. When the user submits two lines, the parser
wraps them in a `BlockNode` so the evaluator receives one root node.

**CS lens — discriminated union as a type-safe dispatch mechanism:**

`ASTNode` is a discriminated union — a type that was established in lesson 05.
The `kind` field is the discriminant: it uniquely identifies which variant of the
union is in use. When the evaluator calls `switch (node.kind)`, TypeScript
narrows the type inside each `case` to the specific interface. Inside `case 'If':`,
TypeScript knows `node` is an `IfNode` and allows access to `node.condition`,
`node.thenBlock`, and `node.elseBlock`. Inside any other case, those fields are
not accessible. The discriminant prevents a class of runtime error — accessing a
field that doesn't exist — at compile time.

**SE lens — why `ASTNode[]` for `thenBlock` and `elseBlock` instead of a single `ASTNode`:**

An `if` body contains multiple statements, not one expression. A single node
would force all statements into a synthetic container that the evaluator would
then unpack. An array is more natural: the evaluator iterates over the statements
in order. The array is the right type because it models the structure exactly —
a sequence of statements.

**SE lens — why `BlockNode` is separate from `IfNode`:**

`BlockNode` represents any sequence of statements. It appears when multi-line
input is submitted to the parser. `IfNode` owns two lists of statements directly
(not as `BlockNode`s) because the `if` structure is known at parse time.
`BlockNode` is for the top-level: when the user submits a multi-line program,
the parser wraps the list of statements in a `BlockNode`. The two types have
different semantic roles — one is a conditional branch, the other is a program
— and giving them different types makes that distinction explicit and checkable.

---

## Step 2 — Update the Parser for Multi-Statement Programs

**The problem:** The current `parse()` in lesson 05 handles exactly one
expression and errors on anything after it. Multi-line programs — `if ... end`
blocks — produce NEWLINE tokens between statements. The parser must skip those
and handle statement sequences.

The lexer from lesson 04 produces `{ type: 'KEYWORD', value: 'if' }` for the
keyword `if`. To check for a specific keyword: `peek().type === TokenType.KEYWORD
&& peek().value === 'if'`.

Replace the body of `parse()` in `src/parser.ts`:

```typescript
export function parse(tokens: Token[]): ASTNode {
  let position = 0;

  function peek():    Token { return tokens[position]; }
  function advance(): Token { return tokens[position++]; }

  function expect(type: TokenTypeName): Token {
    const token = peek();
    if (token.type !== type) {
      throw new ParseError(
        `expected '${type}' but found '${token.value ?? token.type}'`,
        token.line
      );
    }
    return advance();
  }

  function atEnd(): boolean { return peek().type === TokenType.EOF; }

  function skipNewlines(): void {
    while (peek().type === TokenType.NEWLINE) advance();
  }

  // ── Control flow helpers ──────────────────────────────────────────────────

  function isKeyword(word: string): boolean {
    return peek().type === TokenType.KEYWORD && peek().value === word;
  }

  // parseStatement: handles one statement — if-block or expression
  function parseStatement(): ASTNode {
    skipNewlines();

    if (isKeyword('if')) return parseIf();

    return parseAssignment();
  }

  // parseIf: parses  if COND \n STMTS \n [else \n STMTS \n] end
  function parseIf(): IfNode {
    const kw = advance();   // consume 'if'
    const condition = parseAssignment();
    skipNewlines();

    const thenBlock: ASTNode[] = [];
    const elseBlock: ASTNode[] = [];
    let inElse = false;

    while (!atEnd()) {
      skipNewlines();

      if (isKeyword('end')) {
        advance();   // consume 'end'
        return { kind: 'If', condition, thenBlock, elseBlock, line: kw.line };
      }

      if (isKeyword('else')) {
        advance();   // consume 'else'
        inElse = true;
        skipNewlines();
        continue;
      }

      if (isKeyword('elseif')) {
        advance();   // consume 'elseif'
        const elseifCond = parseAssignment();
        skipNewlines();
        // Desugar: 'elseif C then S end' → nested IfNode in the else branch
        const nested = parseIfBody(elseifCond);
        elseBlock.push(nested);
        // The nested parseIfBody consumed the final 'end' — return immediately
        return { kind: 'If', condition, thenBlock, elseBlock, line: kw.line };
      }

      const stmt = parseStatement();
      if (inElse) { elseBlock.push(stmt); } else { thenBlock.push(stmt); }
    }

    throw new ParseError("expected 'end' to close 'if' block", kw.line);
  }

  // parseIfBody: parses the body of an elseif — reuses parseIf's inner loop
  function parseIfBody(condition: ASTNode): IfNode {
    const thenBlock: ASTNode[] = [];
    const elseBlock: ASTNode[] = [];
    let inElse = false;
    const startLine = condition.line;

    while (!atEnd()) {
      skipNewlines();
      if (isKeyword('end'))    { advance(); return { kind: 'If', condition, thenBlock, elseBlock, line: startLine }; }
      if (isKeyword('else'))   { advance(); inElse = true; skipNewlines(); continue; }
      const stmt = parseStatement();
      if (inElse) { elseBlock.push(stmt); } else { thenBlock.push(stmt); }
    }
    throw new ParseError("expected 'end' to close 'if' block", startLine);
  }

  // ── Top-level: one or more statements ─────────────────────────────────────
  // parseAssignment and the grammar levels from lesson 05 go here unchanged

  const statements: ASTNode[] = [];
  skipNewlines();
  while (!atEnd()) {
    statements.push(parseStatement());
    skipNewlines();
  }

  if (statements.length === 0) {
    throw new ParseError('empty input', 1);
  }
  if (statements.length === 1) return statements[0];
  return { kind: 'Block', statements, line: statements[0].line };
}
```

The grammar functions from lesson 05 (`parseAssignment`, `parseOr`, `parseAnd`,
`parseComparison`, `parseAddSub`, `parseMulDiv`, `parsePower`, `parseUnary`,
`parseAtom`) stay exactly as written — do not change them.

**Walkthrough — tracing `if a elseif b else c end`:**

This is the `elseif` desugaring path. Follow what the parser does step by step:

1. `parseIf()` is called. `advance()` consumes the `if` keyword token.
2. `parseAssignment()` parses the condition `a` — the parser builds an
   `IdentifierNode` for `a` and returns it. This becomes `condition`.
3. `skipNewlines()` clears any trailing newline.
4. The `while` loop begins scanning the body.
5. `skipNewlines()` clears any leading whitespace.
6. The token is `elseif` — the `isKeyword('elseif')` branch is taken.
7. `advance()` consumes `elseif`. `parseAssignment()` parses `b` — another
   `IdentifierNode`. This becomes `elseifCond`.
8. `parseIfBody(elseifCond)` is called. This function runs its own inner loop:
   - It scans forward, collecting statements into `thenBlock` until it encounters
     `else`.
   - When `isKeyword('else')` is true, `advance()` consumes `else`, `inElse`
     flips to `true`, and the loop continues.
   - The `c` statement is collected into `elseBlock`.
   - When `isKeyword('end')` is true, `advance()` consumes `end`, and
     `parseIfBody` returns:
     `IfNode(b, [thenBlock2], [cBlock])`
9. Back in `parseIf()`, that returned `IfNode` is pushed into the outer `elseBlock`.
10. `parseIf()` returns the outer node immediately:
    `IfNode(a, [thenBlock], [IfNode(b, [thenBlock2], [cBlock])])`

The tree looks like this:

```
IfNode
├── condition:  a
├── thenBlock:  [ thenBlock statements ]
└── elseBlock:  [ IfNode
                  ├── condition:  b
                  ├── thenBlock:  [ thenBlock2 statements ]
                  └── elseBlock:  [ cBlock statements ]
                ]
```

**CS lens — desugaring:**

`elseif` is syntactic sugar — a convenient shorthand that means exactly the same
thing as `else if ... end end`. Rather than adding a third branch to `IfNode`
and teaching the evaluator to handle it, the parser *desugars* `elseif` into a
nested `IfNode` in the else block. The evaluator receives only plain `IfNode`s.
It handles one case, not two.

Desugaring converts a complex syntactic form into a simpler semantic construct
that the evaluator already handles. This pattern appears in every language
implementation:

- **Haskell's `do` notation** desugars to nested `>>=` (bind) calls — the
  interpreter only evaluates `>>=`, never `do`.
- **Python's `with` statement** desugars to `try/finally` — the interpreter only
  evaluates `try/finally`.
- **JavaScript's `async/await`** desugars to `Promise.then()` chains — the
  engine only evaluates promise callbacks.

The parser handles the transformation. The evaluator stays simple.

**SE lens — single responsibility of the evaluator:**

Without desugaring, the evaluator would need an `elseif` case. With desugaring,
the evaluator's `If` case handles every conditional — simple, else, and elseif.
The parser takes on the transformation responsibility so the evaluator does not
have to. Single responsibility: the parser's job is to build the AST; the
evaluator's job is to execute it. Transforming syntactic sugar is part of
building the AST — it belongs in the parser.

---

## Step 3 — Add Multi-Line Input to the Console

**The problem:** The console currently submits each line immediately on Enter.
But `if ... end` spans multiple lines. The console needs to detect that a block
is open and hold the lines until `end` closes it.

**The multi-line console design:**

When the user presses Enter on a line that starts with `if`, the program is not
complete — the `end` keyword has not arrived yet. The console needs to detect
open blocks and accumulate lines until the block is closed.

Two pieces of state manage this:

- `pendingLines` — an array of strings that accumulates each line the user types
  while a block is open. When the block closes, these lines are joined with
  newlines and submitted as a single program string to the evaluator.
- `blockDepth` — a counter that tracks how many blocks are currently open.
  Each block-opening keyword increments it; each `end` decrements it. When it
  reaches `0`, the program is complete.

`BLOCK_OPENERS` is a `Set` — a built-in JavaScript data structure that stores
unique values and supports fast membership testing via `.has()`. It holds the
keywords that open a multi-line block: `if`, `for`, `while`, and `function`.
A `Set` is used here rather than an array because `.has()` is a constant-time
hash lookup — the same speed whether the set has 4 entries or 40,000. An array
`.includes()` is a linear scan that grows slower with size. For a small fixed set
like this the difference is negligible, but using the semantically correct
structure communicates intent: this is a membership test, not a sequence.

Update `src/console.ts`:

```typescript
let pendingLines: string[] = [];
let blockDepth  = 0;

const BLOCK_OPENERS = new Set(['if', 'for', 'while', 'function']);

function firstWord(line: string): string {
  return line.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
}

export function initConsole(onSubmit: (input: string) => void): void {
  inputElement.addEventListener('keydown', function(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;

    const userInput = inputElement.value.trim();
    if (!userInput) return;

    appendLine('>> ' + userInput, 'input-echo');
    inputElement.value = '';

    const word = firstWord(userInput);
    if (BLOCK_OPENERS.has(word)) blockDepth += 1;
    if (word === 'end')          blockDepth -= 1;

    pendingLines.push(userInput);

    if (blockDepth <= 0) {
      onSubmit(pendingLines.join('\n'));
      pendingLines = [];
      blockDepth   = 0;
    }
  });
}
```

**Walkthrough — typing `if x > 5`, `disp('big')`, `end`:**

1. The user types `if x > 5` and presses Enter. `firstWord` extracts `'if'`.
   `BLOCK_OPENERS.has('if')` is `true`, so `blockDepth` increments from `0` to `1`.
   The line is pushed onto `pendingLines`. `blockDepth` is `1`, which is not `<= 0`,
   so nothing is submitted yet. The console shows the prompt again.

2. The user types `disp('big')` and presses Enter. `firstWord` extracts `'disp'`.
   `BLOCK_OPENERS.has('disp')` is `false`. `'disp' === 'end'` is `false`.
   `blockDepth` stays at `1`. The line is pushed onto `pendingLines`. Still not
   submitted.

3. The user types `end` and presses Enter. `firstWord` extracts `'end'`.
   `'end' === 'end'` is `true`, so `blockDepth` decrements from `1` to `0`.
   The line is pushed onto `pendingLines`. `blockDepth` is `0`, which is `<= 0`.
   `onSubmit` is called with `"if x > 5\ndisp('big')\nend"`. `pendingLines` is
   reset to `[]` and `blockDepth` is reset to `0`.

**CS lens — bracket matching:**

The `blockDepth` counter is a simplified bracket matcher. Every block-opening
keyword increments it; every `end` decrements it. When the counter reaches zero,
the block is complete. This is the same algorithm text editors use to highlight
matching brackets, and the same algorithm compilers use to verify balanced
delimiters. Nested blocks — `if ... for ... end ... end` — are handled correctly
because each level increments and decrements the same counter. A counter-based
bracket matcher is an application of a stack in numeric form: each increment
corresponds to a push, each decrement to a pop, and the counter represents the
stack's current depth.

**SE lens — separating accumulation from evaluation:**

The console is responsible for I/O — collecting input and displaying output. The
evaluator is responsible for executing programs. By making the console responsible
for accumulating a complete multi-line program before calling `onSubmit`, the
evaluator never receives a partial program. The evaluator's contract is simple:
receive a complete string, return a result. The console's contract is: collect
input until it is complete, then hand it off. The boundary between these two
responsibilities is `onSubmit` — a clean interface that keeps the two concerns
separate.

---

## Step 4 — Evaluate If Blocks

**The problem:** The evaluator has no cases for `IfNode` or `BlockNode`. Passing
either to `evaluate()` will fall through to the default case and throw a
`RuntimeError`. The evaluator needs to:
1. Evaluate the `if` condition to a value
2. Decide whether that value is truthy or falsy
3. Execute the appropriate block of statements

**The `isTruthy` helper:**

Add this function to `src/evaluator.ts` before the `evaluate` function:

```typescript
function isTruthy(value: EnvironmentValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number')  return value !== 0;
  return value.length > 0;   // non-empty string
}
```

**Walkthrough — what `isTruthy` does for each input type:**

- `isTruthy(false)`: `typeof false === 'boolean'` is `true`. Returns `false`.
  The then-branch does not run.
- `isTruthy(true)`: `typeof true === 'boolean'` is `true`. Returns `true`.
  The then-branch runs.
- `isTruthy(0)`: `typeof 0 === 'boolean'` is `false`. Falls through to
  `typeof 0 === 'number'`, which is `true`. Returns `0 !== 0`, which is `false`.
  The then-branch does not run.
- `isTruthy(1)`: `typeof 1 === 'boolean'` is `false`. Falls through to
  `typeof 1 === 'number'`, which is `true`. Returns `1 !== 0`, which is `true`.
  The then-branch runs.
- `isTruthy('')`: Neither `boolean` nor `number`. Falls through to
  `''.length > 0`, which is `false`. The then-branch does not run.
- `isTruthy('0')`: Neither `boolean` nor `number`. Falls through to
  `'0'.length > 0`, which is `true`. The then-branch runs. This is the key
  difference from JavaScript — the string `'0'` is truthy in OpenMAT because
  it is a non-empty string.
- `isTruthy('hello')`: Falls through to `'hello'.length > 0`, which is `true`.
  The then-branch runs.

**CS lens — why `isTruthy` is a separate function:**

The truthiness rule is applied in several places: `if` nodes, `while` loops
(lesson 12), and logical `&&`/`||` operators. Extracting it to one function
means the rule is defined once. This is the **DRY principle** — Don't Repeat
Yourself — one of the most consequential rules in software engineering. If the
rule were written inline in each case, a change to the truthiness model (for
example, also treating `NaN` as falsy) would require finding and updating every
copy. With `isTruthy`, the change happens in one place and propagates everywhere.

**SE lens — encapsulating a design decision:**

`isTruthy` is not just a utility function — it is the encapsulation of a language
design decision. OpenMAT's truthiness model is embodied entirely in this function.
When a new developer reads the evaluator, they can find the truthiness rule
immediately by reading `isTruthy`. If this rule were scattered across multiple
`switch` cases, the design decision would be invisible. A function boundary makes
the decision visible, nameable, and testable in isolation.

**The evaluator cases:**

Add these cases to the `switch` statement in `evaluate()` in `src/evaluator.ts`:

```typescript
// In the evaluate() switch:

case 'Block': {
  let last: EnvironmentValue = 0;
  for (const stmt of node.statements) {
    last = evaluate(stmt, env);
  }
  return last;
}

case 'If': {
  const cond = evaluate(node.condition, env);
  const branch = isTruthy(cond) ? node.thenBlock : node.elseBlock;
  let last: EnvironmentValue = 0;
  for (const stmt of branch) {
    last = evaluate(stmt, env);
  }
  return last;
}
```

**Walkthrough — tracing `if x > 5 \n disp('big') \n end` with `x = 7`:**

1. The parser produces an `IfNode` with:
   - `condition`: `BinaryOpNode('>', IdentifierNode('x'), NumberNode(5))`
   - `thenBlock`: `[FunctionCallNode('disp', [StringNode('big')])]`
   - `elseBlock`: `[]`

2. `evaluate(IfNode, env)` is called. The `'If'` case is entered.

3. `evaluate(node.condition, env)` is called. This evaluates
   `BinaryOpNode('>', IdentifierNode('x'), NumberNode(5))`:
   - The `'BinaryOp'` case looks up `'x'` in the environment. The symbol table
     (established in lesson 08) returns `7`.
   - The `>` operator compares `7 > 5`. The result is `true`.
   - `cond` is now `true`.

4. `isTruthy(true)` is called. `typeof true === 'boolean'` is `true`. Returns
   `true`. The ternary `isTruthy(cond) ? node.thenBlock : node.elseBlock`
   selects `node.thenBlock`.

5. The `for` loop iterates over `thenBlock`. There is one statement:
   `FunctionCallNode('disp', [StringNode('big')])`.

6. `evaluate(FunctionCallNode('disp', [StringNode('big')]), env)` is called.
   The `'FunctionCall'` case looks up `'disp'` in the built-in function table.
   `disp` evaluates its argument — `StringNode('big')` evaluates to `'big'` —
   and calls `appendLine('big', 'output')` to print it to the console.

7. `node.elseBlock` is not evaluated. It is an empty array — even if it were
   not, the condition was truthy so the else branch is skipped.

8. `last` is the return value of `evaluate(disp call)`, which is `0` (the
   default return for side-effect functions). The `'If'` case returns `0`.
   The console does not print `0` because `disp` already printed the output
   as a side effect.

**Walkthrough — tracing the same program with `x = 3`:**

Steps 1–2 are identical. Step 3 evaluates `3 > 5`, which is `false`. `cond` is
`false`. `isTruthy(false)` returns `false`. The ternary selects `node.elseBlock`,
which is `[]`. The `for` loop runs zero times. `last` remains `0`. The `'If'` case
returns `0`. Nothing is printed.

**Why `Block` evaluates all statements but only returns the last:**

The `Block` evaluator mimics a REPL session: each statement runs, side effects
(like `disp()`) happen, but only the last expression's value is returned to the
console. Returning all values would require a different output format. Returning
only the last is consistent with how the single-expression case works — the result
of the top-level expression is printed.

### SAVE AND TRY

```
>> x = 10
>> if x > 5
     disp('big')
   end
big
```

```
>> x = 3
>> if x > 5
     disp('big')
   else
     disp('small')
   end
small
```

```
>> if 0
     disp('yes')
   end
```
(No output — zero is falsy.)

```
>> if 0.001
     disp('almost zero is truthy')
   end
almost zero is truthy
```

---

## Connect the Pieces

```
lexer (lesson 04)      produces KEYWORD tokens for 'if', 'else', 'elseif', 'end'
                       produces GT, LT, GTE, LTE, EQEQ, NEQ tokens
parser (this lesson)   parseStatement() dispatches on KEYWORD
                       parseIf() builds IfNode; elseif desugars to nested IfNode
                       top-level builds BlockNode for multi-statement programs
console (this lesson)  blockDepth counter accumulates multi-line input until 'end'
evaluator (this lesson) isTruthy() encapsulates OpenMAT's truthiness model
                        'If' case evaluates condition, selects branch, evaluates stmts
                        'Block' case evaluates all statements, returns last result
environment (lesson 08) symbol table provides variable values during condition evaluation
```

The comparison operators (`>`, `<`, `>=`, `<=`, `==`, `~=`) and logical
operators (`&&`, `||`, `~`) were already parsed and evaluated in lessons 05
and 06. Lesson 10 adds only the branching structure (`if/else/end`) that uses
those boolean results. The `elseif` desugaring means the evaluator never sees an
`elseif` — the parser transforms it into a nested `IfNode` before the evaluator
runs.

---

## What Breaks Without This

Remove the `isTruthy` helper and compare directly to `true`:

```typescript
case 'If': {
  const cond = evaluate(node.condition, env);
  const branch = cond === true ? node.thenBlock : node.elseBlock;
  // ...
}
```

Now `if x > 5` works (produces `true`/`false`). But `if x` does not — `x` holds
a number (`10`), not `true`. The condition evaluates to `10`, which is not equal
to `true`, so the then branch never runs. `isTruthy` unifies both cases: boolean
results from comparisons and numeric truthiness from stored variables. Without it,
every numeric variable used as a condition silently does the wrong thing — no error
is thrown, the branch simply never executes, and the bug is invisible until a test
checks the specific case `if x` where `x` is a non-zero number.

---

## Definition of Done

- [ ] `if x > 5 ... end` executes the correct branch based on `x`
- [ ] `if x > 5 ... else ... end` executes the else branch when false
- [ ] `if 0 ... end` produces no output (zero is falsy)
- [ ] `if 0.001 ... end` executes the then branch (non-zero is truthy)
- [ ] `if '0' ... end` executes the then branch (non-empty string is truthy — differs from JavaScript)
- [ ] Multi-line input accumulates in the console until `end` is typed
- [ ] Tests for `IfNode` parsing: condition, thenBlock, elseBlock populated
- [ ] Tests for `isTruthy`: `false` → false, `0` → false, `1` → true, `'0'` → true, `''` → false
- [ ] You can explain why `elseif` desugars to a nested `IfNode`
- [ ] You can explain the desugared tree for `if a elseif b else c end`
- [ ] You can explain short-circuit evaluation with the division-by-zero guard example
- [ ] You can explain boundary condition testing and the three values to check
- [ ] You can explain how OpenMAT's truthiness rules differ from JavaScript's and Python's
- [ ] `git add src/parser.ts src/evaluator.ts src/main.ts` then `git commit -m "Add control flow: if/elseif/else branches evaluate correctly, console accumulates multi-line blocks"`

---

*Next: Lesson 11 — For Loops. `for i = 1:5` iterates five times. The canvas
draws five triangles at different positions — the first time OpenMAT code
changes the visualisation.*
