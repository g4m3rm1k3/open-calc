# OpenMAT — Lesson 05 — The Parser

## What You Will Build

Type `3 + 4 * 2` into the console and see:

```
>> 3 + 4 * 2
BinaryOp(+)
  left:  Number(3)
  right: BinaryOp(*)
  left:  Number(4)
  right: Number(2)
```

The tree shows that `4 * 2` is a subtree nested inside the `+`. Multiplication
happens before addition — not because any code checks `if * has higher priority`,
but because the grammar is structured so that `*` is parsed at a deeper level
than `+`. That is the key insight: **precedence is grammar structure**.

---

## What You Need to Know First

Lessons 01–04 complete. The lexer (`src/lexer.ts`) produces a flat list of tokens
from raw source text; typing an expression into the console already shows those
tokens. You understand `interface`, `class extends Error`, `constructor`, and
`super` from lesson 04. You understand TDD red-green-refactor, and the
single responsibility principle.

---

## Concept: The Abstract Syntax Tree

**Why a tree, not a flat list:**

A flat token list represents `3 + 4 * 2` as five tokens with no indication of
which operations belong together:

```
[NUMBER:"3"]  [PLUS:"+"]  [NUMBER:"4"]  [MULTIPLY:"*"]  [NUMBER:"2"]
```

A tree represents the *computation structure* directly:

```
          BinaryOp(+)
         /           \
    Number(3)      BinaryOp(*)
                   /           \
              Number(4)      Number(2)
```

The tree encodes the evaluation order: evaluate the right subtree (`4 * 2 = 8`),
then evaluate the root (`3 + 8 = 11`). The evaluator in lesson 06 simply traverses
the tree — it does not need any knowledge of operator precedence. Precedence was
resolved when the tree was built.

**CS concept — recursive structure:**

A tree is a recursive data structure: each node either has no children (a *leaf*,
like `Number(3)`) or has children that are themselves trees (like `BinaryOp(+)`
whose children are `Number(3)` and another tree). Because the structure is
recursive, the code that builds it is recursive: `parseMulDiv` calls `parsePower`,
which calls `parseUnary`, which calls `parseAtom`, which can call `parseAssignment`
when it encounters a `(`. Each call works on a smaller piece of the input.

**SE concept — immutable data:**

An AST node is created once, completely, and never modified. Every field is set
at construction:

```typescript
// Complete at construction — nothing is added later.
return {
  kind:     'BinaryOp',
  operator: '+',
  left:     leftNode,
  right:    rightNode,
  line:     operatorToken.line,
};
```

Compare to a mutable approach:

```typescript
// DANGEROUS — the node exists in an incomplete state between these two lines.
const node = { kind: 'BinaryOp', operator: '+' };
node.left  = parseLeft();     // half-built node exists here
node.right = parseRight();    // only complete here
```

Between those two assignments, `node` is broken. Any code that received a
reference to it during that window sees a malformed AST. Immutable construction
eliminates this window entirely: the node is either fully built or it does not
exist.

---

## Concept: Union Types and Discriminated Unions

The `ASTNode` type you are about to write is the first *discriminated union* in
this curriculum. This is a central TypeScript pattern — worth understanding precisely.

**What a union type is:**

A union type means a value can be one of several types. The `|` operator creates
the union:

```typescript
type ASTNode = NumberNode | StringNode | BooleanNode | IdentifierNode | BinaryOpNode;
```

This says: an `ASTNode` is *either* a `NumberNode`, *or* a `StringNode`, *or* a
`BooleanNode`, and so on. TypeScript will accept any of those shapes wherever an
`ASTNode` is expected. It will reject anything that does not match one of them.

**What makes it discriminated:**

Every member of the union has a `kind` field whose value is a string literal
specific to that member:

- `NumberNode` has `kind: 'Number'`
- `StringNode` has `kind: 'String'`
- `BinaryOpNode` has `kind: 'BinaryOp'`

No two members share the same `kind` value. That shared field — `kind` — is
called the *discriminant*. When you check it at runtime, TypeScript can use the
check to narrow the type:

```typescript
function formatTree(node: ASTNode): string {
  if (node.kind === 'Number') {
    // TypeScript knows node is NumberNode here.
    // Accessing node.value is safe — it is type number.
    return `Number(${node.value})`;
  }
  // Outside that branch, node could still be any other member.
}
```

Inside the `if (node.kind === 'Number')` branch, TypeScript narrows `node` from
`ASTNode` to `NumberNode`. You can access `node.value` as a `number` without a
type assertion. Outside that branch, `node` remains the full union. This is called
*type narrowing* — TypeScript uses the runtime check to reduce what types are
possible in each code path.

The `switch (node.kind)` statement in `formatTree` uses the same mechanism:
each `case` narrows `node` to the specific member type for that branch.

**Why string literals, not plain strings:**

If `kind` were typed as `string`, TypeScript could not narrow. There would be
infinitely many possible string values, so checking `node.kind === 'Number'` would
not tell TypeScript anything definite. String literal types — `'Number'`, `'BinaryOp'`,
etc. — are each a type with exactly one possible value, which is what makes
narrowing precise.

---

## Concept: Operator Precedence Through Grammar

**How precedence is usually taught (the wrong way):**

```typescript
function getPriority(op: string): number {
  if (op === '*' || op === '/') return 2;
  if (op === '+' || op === '-') return 1;
  return 0;
}
```

This works but leads to one large parsing function with complex branching — hard
to extend, easy to get wrong.

**How it is actually done — grammar levels:**

Operator precedence is expressed by writing the grammar in *levels*, with
higher-precedence operators appearing at deeper levels:

```
parseAddSub   handles  +  -             (lowest precedence)
  calls parseMulDiv
    parseMulDiv   handles  *  /
      calls parsePower
        parsePower    handles  ^         (right-associative)
          calls parseUnary
            parseUnary    handles  unary - and ~
              calls parseAtom
                parseAtom     handles  number, identifier, (expr)
```

When parsing `3 + 4 * 2`:
1. `parseAddSub` calls `parseMulDiv` to get its left operand
2. `parseMulDiv` greedily reads `4 * 2` and returns a subtree
3. `parseAddSub` now has: left=`Number(3)`, op=`+`, right=`BinaryOp(*,4,2)`

Precedence emerges from the grammar — no priority table needed.

**CS concept — recursive descent parsing:**

*Recursive descent* is a parsing strategy where each grammar rule becomes a
function. The functions call each other in sequence, each one consuming the tokens
that belong to its level. When a rule can contain itself (a parenthesised
expression contains an expression), the corresponding function calls itself
recursively. Every grammar rule maps directly to one function — the code and the
grammar stay in sync naturally.

---

## Concept: Recursive Functions

The parser functions call each other and call themselves. This deserves a precise
explanation before you see the code.

**What recursion is:**

A recursive function is one that calls itself (or is part of a cycle of calls
that eventually reaches itself). The recursion terminates when a *base case* is
reached — a condition where the function returns without making another recursive
call.

In this parser, `parseAtom` is the base case: it consumes a literal token (a
number, a string, an identifier) and returns a leaf node without any further
recursive calls. Every other parse function eventually calls `parseAtom` for
leaf nodes.

**Direct recursion:**

`parsePower` calls itself for the right operand:

```
parsePower → parsePower → parsePower → ... → parseUnary → parseAtom
```

Each call to `parsePower` consumes one `^` operator and one base. The recursion
terminates when there is no more `^` — control falls through to `parseUnary`.

**Mutual recursion:**

`parseAtom` handles parenthesised expressions by calling `parseAssignment`, which
calls `parseOr`, which calls `parseAnd`, which calls `parseComparison`, which calls
`parseAddSub`, which calls `parseMulDiv`... which eventually calls `parseAtom`
again for any nested parentheses. This is *mutual recursion* — a cycle of functions
that call each other.

**Why this is safe:**

Each recursive call is working on a *shorter* token list. Every call to `advance()`
moves the position forward. Because the token list is finite, the recursion must
eventually reach a terminal token (a literal, an identifier, or end-of-input) and
return. An infinite loop would require the input to be infinite.

**Grammar structure maps to call structure:**

The grammar levels (parseAddSub → parseMulDiv → parsePower → parseUnary →
parseAtom) directly reflect the operator precedence table of the language. Higher
in the call chain means lower precedence. This is not a coincidence — it is the
defining property of recursive descent parsing. The grammar *is* the call structure.

---

## Step 1 — Define AST Node Types and Error Class

Create `src/parser.ts`. This file has one responsibility: accept a token list and
return an AST. Everything the rest of the system needs to know about parsed
expressions is exported from here.

Start with the types and the error class:

```typescript
import { Token, TokenType, TokenTypeName } from './lexer';

// ── Errors ────────────────────────────────────────────────────────────────────

export class ParseError extends Error {
  constructor(message: string, line: number) {
    super(`ParseError on line ${line}: ${message}`);
  }
}

// ── AST node types ────────────────────────────────────────────────────────────
// Every node carries 'line' from the source — needed for error messages.

export type ASTNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | IdentifierNode
  | BinaryOpNode
  | UnaryOpNode
  | AssignmentNode
  | FunctionCallNode;

export interface NumberNode {
  kind:  'Number';
  value: number;
  line:  number;
}

export interface StringNode {
  kind:  'String';
  value: string;
  line:  number;
}

export interface BooleanNode {
  kind:  'Boolean';
  value: boolean;
  line:  number;
}

export interface IdentifierNode {
  kind: 'Identifier';
  name: string;
  line: number;
}

export interface BinaryOpNode {
  kind:     'BinaryOp';
  operator: string;   // '+' | '-' | '*' | '/' | '^' | '>' | '<' | '>=' | '<=' | '==' | '~=' | '&&' | '||'
  left:     ASTNode;
  right:    ASTNode;
  line:     number;
}

export interface UnaryOpNode {
  kind:     'UnaryOp';
  operator: '-' | '~';
  operand:  ASTNode;
  line:     number;
}

export interface AssignmentNode {
  kind:  'Assignment';
  name:  string;
  value: ASTNode;
  line:  number;
}

export interface FunctionCallNode {
  kind:      'FunctionCall';
  name:      string;
  args:      ASTNode[];
  line:      number;
}
```

**Walking through the imports:**

`lexer.ts` is the module responsible for converting raw source text into tokens.
We import three things from it:

- `Token` — the type describing a single token (its `type`, `value`, and `line`).
  The parser receives a `Token[]` array and needs this type to describe the function
  signatures that accept and return tokens.
- `TokenType` — the `as const` object of all valid token type names, established in
  lesson 03. We use it to compare token types: `token.type === TokenType.PLUS`.
- `TokenTypeName` — the union type derived from `TokenType`, also from lesson 03.
  We use it as the parameter type for `expect(expectedType: TokenTypeName)`, which
  enforces that only a valid token type name can be passed.

We import only what we need. The whole module is not imported — only the three
exports this file uses. This keeps dependencies explicit: anyone reading `parser.ts`
can see immediately that it depends on `Token`, `TokenType`, and `TokenTypeName`,
and nothing else from the lexer.

**Walking through the types:**

`ParseError` uses the `class extends Error` pattern from lesson 04. The
`constructor` accepts the raw message and a line number, then calls `super()`
to format them together. This is the same pattern — the `super()` call passes
the formatted message to the built-in `Error` class, which stores it in
`this.message` and captures the stack trace.

`ASTNode` is the discriminated union type explained above. The `|` operator
assembles eight member types into one. The parser functions all return `ASTNode`,
and `formatTree` in `main.ts` will accept `ASTNode` and switch on `kind`.

Each interface carries a `line` field. This is copied from the relevant token at
parse time. When the evaluator (lesson 06) or later the linter encounters an error
at runtime, it needs to report which line of source code is responsible. Carrying
`line` through every node ensures that information is never lost.

**Why `BinaryOpNode.operator` is typed `string` rather than a narrow union:**

Comparison operators (`>`, `<`, `>=`, `<=`, `==`, `~=`) are added to the parser
today, but the evaluator cannot handle them until lesson 10. Defining `operator`
as `string` means lesson 10 only adds evaluation logic — it does not need to
change the type. The evaluator will pattern-match on the operator string at
evaluation time. If `operator` were typed as a narrow union now, adding `&&` in
lesson 10 would require changing the type in this file, which would mean changing
the parser's public contract without changing any parser behaviour.

**Why `BooleanNode.value` is `boolean` not `string`:**

`true` and `false` are keyword tokens whose `value` field holds the string
`'true'` or `'false'`. Converting `token.value === 'true'` to an actual JavaScript
`boolean` is the parser's job — the parser is the boundary between the raw token
stream and the structured AST. The node type documents that a `BooleanNode` holds
a JavaScript boolean, and any code reading a `BooleanNode` can treat its `value`
as a real boolean rather than needing to re-parse the string.

---

## Step 2 — Write Tests First

The tests come before the implementation. This is the red-green-refactor cycle
from lesson 04: write tests that define the correct behaviour, watch them fail,
then implement until they pass.

Create `src/parser.test.ts`:

```typescript
import { tokenize } from './lexer';
import { parse, ParseError } from './parser';

// Helper: tokenize then parse
function p(source: string) { return parse(tokenize(source)); }

test('parses a number', () => {
  expect(p('42')).toMatchObject({ kind: 'Number', value: 42 });
});

test('parses an identifier', () => {
  expect(p('x')).toMatchObject({ kind: 'Identifier', name: 'x' });
});

test('parses unary minus', () => {
  expect(p('-x')).toMatchObject({ kind: 'UnaryOp', operator: '-' });
});

test('parses addition preserving precedence', () => {
  // 3 + 4 * 2 should have + at root, * as right child
  expect(p('3 + 4 * 2')).toMatchObject({
    kind: 'BinaryOp', operator: '+',
    left:  { kind: 'Number', value: 3 },
    right: { kind: 'BinaryOp', operator: '*',
             left: { kind: 'Number', value: 4 },
             right: { kind: 'Number', value: 2 } },
  });
});

test('parses parentheses overriding precedence', () => {
  // (3 + 4) * 2 should have * at root, + as left child
  expect(p('(3 + 4) * 2')).toMatchObject({
    kind: 'BinaryOp', operator: '*',
    left: { kind: 'BinaryOp', operator: '+',
            left: { kind: 'Number', value: 3 },
            right: { kind: 'Number', value: 4 } },
    right: { kind: 'Number', value: 2 },
  });
});

test('parses assignment', () => {
  expect(p('x = 10')).toMatchObject({ kind: 'Assignment', name: 'x',
                                      value: { kind: 'Number', value: 10 } });
});

test('parses function call with arguments', () => {
  expect(p('disp(x, y)')).toMatchObject({
    kind: 'FunctionCall', name: 'disp',
    args: [{ kind: 'Identifier', name: 'x' },
           { kind: 'Identifier', name: 'y' }],
  });
});

test('parses a string literal', () => {
  expect(p("'hello'")).toMatchObject({ kind: 'String', value: 'hello' });
});

test('throws ParseError on missing closing paren', () => {
  expect(() => p('(3 + 4')).toThrow(ParseError);
});

test('throws ParseError on trailing token', () => {
  expect(() => p('3 +')).toThrow(ParseError);
});
```

**Walking through the imports:**

`lexer.ts` exports `tokenize` — the function that converts a source string to a
`Token[]` array. We import only `tokenize` because that is all the test file needs
from the lexer. The lexer's other exports (`Token`, `TokenType`, `TokenTypeName`)
are used by `parser.ts` internally; the test file does not need them.

`parser.ts` exports `parse` — the function that converts a `Token[]` to an
`ASTNode` — and `ParseError`, the error class the parser throws. We import both
because the tests call `parse` and also test that `ParseError` is thrown on
invalid input. We do not import `ASTNode` because `toMatchObject` only checks that
the returned object has the specified fields; it does not need to know the full type.

The helper `p(source)` chains `tokenize` then `parse`. This keeps every test
one line. The pipeline is `source → tokenize → tokens → parse → ASTNode`.

Run `npx vitest run` — all tests fail. That is the Red step.

`npx vitest run` executes the Vitest test runner (introduced in lesson 04) without
entering watch mode. Vitest finds every file matching `*.test.ts`, runs the tests,
and prints a summary. Every test that fails shows the expected value and the
received value side by side. Right now, `parse` does not exist yet, so every test
will error with `parse is not a function` or a similar import failure. That is
expected — you are confirming the tests exist and that they fail before any
implementation is written.

---

## Step 3 — Implement the Parser (Green)

Add the `parse` function to `src/parser.ts`:

```typescript
export function parse(tokens: Token[]): ASTNode {
  let position = 0;

  function peek():    Token { return tokens[position]; }
  function advance(): Token { return tokens[position++]; }

  function expect(expectedType: TokenTypeName): Token {
    const token = peek();
    if (token.type !== expectedType) {
      throw new ParseError(
        `expected '${expectedType}' but found '${token.value ?? token.type}'`,
        token.line
      );
    }
    return advance();
  }

  function atEnd(): boolean {
    return peek().type === TokenType.EOF || peek().type === TokenType.NEWLINE;
  }

  // ── Grammar levels, lowest to highest precedence ──────────────────────────

  function parseAssignment(): ASTNode {
    // Look ahead: is this "IDENTIFIER EQUALS ..."?
    if (
      peek().type === TokenType.IDENTIFIER &&
      tokens[position + 1]?.type === TokenType.EQUALS
    ) {
      const nameToken = advance();   // consume identifier
      const eqToken   = advance();   // consume '='
      const value     = parseAssignment();   // right side is also an assignment level

      return { kind: 'Assignment', name: nameToken.value!, value, line: eqToken.line };
    }

    return parseOr();
  }

  // parseOr handles ||
  function parseOr(): ASTNode {
    let left = parseAnd();

    while (peek().type === TokenType.OR) {
      const op = advance();
      const right = parseAnd();
      left = { kind: 'BinaryOp', operator: '||', left, right, line: op.line };
    }

    return left;
  }

  // parseAnd handles &&
  function parseAnd(): ASTNode {
    let left = parseComparison();

    while (peek().type === TokenType.AND) {
      const op = advance();
      const right = parseComparison();
      left = { kind: 'BinaryOp', operator: '&&', left, right, line: op.line };
    }

    return left;
  }

  // parseComparison handles > < >= <= == ~=
  function parseComparison(): ASTNode {
    let left = parseAddSub();

    const comparisonTypes = new Set([
      TokenType.GT, TokenType.LT, TokenType.GTE,
      TokenType.LTE, TokenType.EQEQ, TokenType.NEQ,
    ]);

    while (comparisonTypes.has(peek().type as never)) {
      const op    = advance();
      const right = parseAddSub();
      left = { kind: 'BinaryOp', operator: op.value!, left, right, line: op.line };
    }

    return left;
  }

  // parseAddSub handles + and -
  function parseAddSub(): ASTNode {
    let left = parseMulDiv();

    while (peek().type === TokenType.PLUS || peek().type === TokenType.MINUS) {
      const op    = advance();
      const right = parseMulDiv();
      left = { kind: 'BinaryOp', operator: op.value!, left, right, line: op.line };
    }

    return left;
  }

  // parseMulDiv handles * and /
  function parseMulDiv(): ASTNode {
    let left = parsePower();

    while (peek().type === TokenType.MULTIPLY || peek().type === TokenType.DIVIDE) {
      const op    = advance();
      const right = parsePower();
      left = { kind: 'BinaryOp', operator: op.value!, left, right, line: op.line };
    }

    return left;
  }

  // parsePower handles ^ (right-associative: 2^3^2 = 2^(3^2) = 512)
  function parsePower(): ASTNode {
    const base = parseUnary();

    if (peek().type === TokenType.POWER) {
      const op       = advance();
      const exponent = parsePower();   // recursive call (not while) gives right-associativity
      return { kind: 'BinaryOp', operator: '^', left: base, right: exponent, line: op.line };
    }

    return base;
  }

  // parseUnary handles unary - and ~
  function parseUnary(): ASTNode {
    if (peek().type === TokenType.MINUS) {
      const op      = advance();
      const operand = parseUnary();
      return { kind: 'UnaryOp', operator: '-', operand, line: op.line };
    }

    if (peek().type === TokenType.NOT) {
      const op      = advance();
      const operand = parseUnary();
      return { kind: 'UnaryOp', operator: '~', operand, line: op.line };
    }

    return parseAtom();
  }

  // parseAtom — leaf nodes and grouped expressions
  function parseAtom(): ASTNode {
    const token = peek();

    if (token.type === TokenType.NUMBER) {
      advance();
      return { kind: 'Number', value: parseFloat(token.value!), line: token.line };
    }

    if (token.type === TokenType.STRING) {
      advance();
      return { kind: 'String', value: token.value!, line: token.line };
    }

    if (token.type === TokenType.KEYWORD && (token.value === 'true' || token.value === 'false')) {
      advance();
      return { kind: 'Boolean', value: token.value === 'true', line: token.line };
    }

    if (token.type === TokenType.IDENTIFIER) {
      advance();

      // Function call: identifier immediately followed by (
      if (peek().type === TokenType.LPAREN) {
        advance();   // consume (
        const args: ASTNode[] = [];

        if (peek().type !== TokenType.RPAREN) {
          args.push(parseAssignment());
          while (peek().type === TokenType.COMMA) {
            advance();   // consume ,
            args.push(parseAssignment());
          }
        }

        expect(TokenType.RPAREN);
        return { kind: 'FunctionCall', name: token.value!, args, line: token.line };
      }

      return { kind: 'Identifier', name: token.value!, line: token.line };
    }

    if (token.type === TokenType.LPAREN) {
      advance();   // consume (
      const inner = parseAssignment();
      expect(TokenType.RPAREN);
      return inner;
    }

    throw new ParseError(
      `unexpected '${token.value ?? token.type}'`,
      token.line
    );
  }

  const tree = parseAssignment();

  if (!atEnd()) {
    const remaining = peek();
    throw new ParseError(
      `unexpected '${remaining.value ?? remaining.type}' after expression`,
      remaining.line
    );
  }

  return tree;
}
```

### Walking through `expect`

`expect(expectedType)` is the parser's grammar enforcer. Here is what happens when
it runs:

1. `peek()` returns the current token without consuming it.
2. The check `token.type !== expectedType` asks: is the next token the one the
   grammar requires?
3. If the types do not match, a `ParseError` is thrown immediately with the line
   number. The parser does not try to recover or guess — if the grammar requires a
   `)` and the next token is `+`, parsing stops with a precise error pointing to
   the exact line.
4. If the types match, `advance()` consumes the token (moves `position` forward
   by one) and returns it.

`expect` embodies the parser's contract with the grammar: at this point in the
parse, only this token type is valid. Anything else is a syntax error.

### Walking through `parseAddSub` on `3 + 4 * 2`

When `parseAddSub` is called on the token stream `[3, +, 4, *, 2, EOF]`:

1. `parseMulDiv()` is called to get the left operand. `parseMulDiv` calls
   `parsePower`, which calls `parseUnary`, which calls `parseAtom`. `parseAtom`
   sees `3` (a number token), consumes it, and returns `NumberNode(3)`. Back in
   `parseMulDiv`, `peek()` returns `+` — not `*` or `/` — so the `while` loop
   does not execute. `parseMulDiv` returns `NumberNode(3)`.
2. Back in `parseAddSub`, `left` is now `NumberNode(3)`. `peek()` returns the `+`
   token. The condition `peek().type === TokenType.PLUS` is true, so the `while`
   loop body runs.
3. `advance()` consumes the `+` token and stores it in `op`. Position is now at
   `4`.
4. `parseMulDiv()` is called again for the right operand. This time, `parseMulDiv`
   calls down the chain to `parseAtom`, which consumes `4` and returns
   `NumberNode(4)`. Back in `parseMulDiv`, `peek()` returns `*` — a multiply
   token. The `while` loop runs: `advance()` consumes `*`, `parsePower` is called
   and eventually returns `NumberNode(2)`. `parseMulDiv` builds
   `BinaryOpNode('*', NumberNode(4), NumberNode(2))` and returns it.
5. Back in `parseAddSub`, `right` is `BinaryOpNode('*', 4, 2)`. A new node is
   built: `BinaryOpNode('+', NumberNode(3), BinaryOpNode('*', 4, 2))`.
6. `peek()` now returns `EOF`. The `while` condition is false. `parseAddSub`
   returns the `+` node.

The result is the tree where `+` is at the root and `*` is nested as the right
child — exactly the structure the precedence tests verify.

### Why `parseAddSub` uses `while` and `parsePower` uses recursion

The `while` loop in `parseAddSub` and `parseMulDiv` gives *left-associativity*:
`8 - 4 - 2` is `(8 - 4) - 2 = 2`, not `8 - (4 - 2) = 6`. Each iteration of the
loop takes the accumulated `left` node and wraps it as the left child of a new
`BinaryOpNode`. The new node becomes `left` for the next iteration.

The recursive call in `parsePower` gives *right-associativity*:
`2 ^ 3 ^ 2` is `2 ^ (3 ^ 2) = 2 ^ 9 = 512`, not `(2 ^ 3) ^ 2 = 8 ^ 2 = 64`.
This matches mathematical convention for exponentiation. The call `parsePower()`
for the exponent recurses — it builds the right subtree first, and the current
node wraps it. The associativity is a consequence of the control flow, not a
separate check.

**Why `parseOr` and `parseAnd` are already in the grammar:**

Comparison operators (`>`, `<`, `&&`, `||`) are fully parsed here even though
the evaluator cannot handle them until lesson 10. The parser's grammar is the
*language definition* — it defines what expressions are valid. The evaluator's
behaviour is *implementation* — it defines what those expressions mean. Adding
comparison operators to the evaluator in lesson 10 will not require changing
the parser at all. The grammar and the evaluator are separated by the AST;
neither depends on the other's internals.

**SE concept — single responsibility, applied twice:**

`parse` has one responsibility: consume tokens and produce an AST. It does not
evaluate, format, or display. `formatTree` (in the next step) has one
responsibility: convert an AST to a display string. The parser does not know
that output will be displayed; the formatter does not know how the AST was built.
If the display format changes — say, switching from indented text to JSON — only
`formatTree` changes. If the grammar changes — say, adding matrix literals — only
the parser changes. Responsibility boundaries are what makes isolated change
possible.

Run the tests again:

```
npx vitest run
```

All nine tests should pass. That is the Green step.

---

## Step 4 — Connect to the Console

Update the console callback in `src/main.ts`:

```typescript
import { tokenize, TokenType } from './lexer';
import { parse, ASTNode }      from './parser';

function formatTree(node: ASTNode, indent: string = ''): string {
  switch (node.kind) {
    case 'Number':
      return `${indent}Number(${node.value})`;
    case 'String':
      return `${indent}String('${node.value}')`;
    case 'Boolean':
      return `${indent}Boolean(${node.value})`;
    case 'Identifier':
      return `${indent}Identifier(${node.name})`;
    case 'UnaryOp':
      return `${indent}UnaryOp(${node.operator})\n` +
             formatTree(node.operand, indent + '  ');
    case 'BinaryOp':
      return `${indent}BinaryOp(${node.operator})\n` +
             `${indent}  left:  ` + formatTree(node.left,  '').trimStart() + '\n' +
             `${indent}  right: ` + formatTree(node.right, '').trimStart();
    case 'Assignment':
      return `${indent}Assign(${node.name})\n` + formatTree(node.value, indent + '  ');
    case 'FunctionCall':
      return `${indent}Call(${node.name})` +
             (node.args.length
               ? '\n' + node.args.map(arg => formatTree(arg, indent + '  ')).join('\n')
               : '()');
  }
}

initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);
    const tree   = parse(tokens);
    printOutput(formatTree(tree));
  } catch (error) {
    printOutput((error as Error).message);
  }
});
```

**Walking through the imports:**

`tokenize` is the lexer function from lesson 03 — it converts a source string to
a `Token[]`. `TokenType` is the token type constants object, also from lesson 03.
Both are imported from `./lexer`. We still need `TokenType` in `main.ts` if it is
used for any token comparisons in the console callback; it is imported here to
keep the pipeline explicit even if not used directly in `formatTree`.

`parse` is the new function we just built — it converts a `Token[]` to an
`ASTNode`. `ASTNode` is the discriminated union type. We import `ASTNode` because
`formatTree` needs it as its parameter type — without the import, TypeScript cannot
check that `formatTree` is being called with a valid AST node.

**Walking through `formatTree`:**

`formatTree` is a recursive function that uses a `switch` statement on `node.kind`.
This is the discriminated union pattern in action: each `case` narrows `node` to
the specific interface for that branch. TypeScript ensures that every member of the
union is handled — if a new node type is added to `ASTNode` without a corresponding
`case`, TypeScript will show a compiler error on the `switch`.

The `indent` parameter carries the current indentation string, which grows by two
spaces with each level of nesting. When `formatTree` calls itself recursively for
child nodes, it passes `indent + '  '`. The base cases (`Number`, `String`,
`Boolean`, `Identifier`) do not recurse — they return a single line.

**CS concept — tree traversal:**

`formatTree` is a *depth-first tree traversal* — a standard algorithm for walking
recursive data structures. For each node, it processes the node itself, then
recursively processes its children. The `switch (node.kind)` is the dispatch
mechanism: it routes to the correct branch based on the node's type. Depth-first
traversal is the same algorithm used by JavaScript's garbage collector to find live
objects, by React to render component trees, and by the evaluator you will write in
lesson 06.

### SAVE AND TRY

Type `3 + 4 * 2`:
```
>> 3 + 4 * 2
BinaryOp(+)
  left:  Number(3)
  right: BinaryOp(*)
  left:  Number(4)
  right: Number(2)
```

Type `(3 + 4) * 2` — the `*` should be at the root, `+` nested inside the left child.

Type `disp(x + 1)` — should show `Call(disp)` with a `BinaryOp(+)` argument.

Type `3 +` (incomplete):
```
>> 3 +
ParseError on line 1: unexpected 'EOF' after expression
```

---

## Connect the Pieces

```
source → tokenize() → tokens → parse() → AST → formatTree() → console output
         (lexer)               (parser)          (main.ts)
```

The pipeline now has three stages. The lexer and parser have separate
responsibilities — the lexer knows nothing about trees, the parser knows nothing
about raw characters. In lesson 06, `evaluate(tree, env)` replaces `formatTree(tree)`.
The parser does not change. The grammar levels added here — `parseOr`, `parseAnd`,
`parseComparison` — mean that lesson 10 (control flow) needs to implement only the
*evaluator* side for comparisons: the parser already handles them.

**Where you will see this in the real world:**

Every programming language has a recursive descent parser. JavaScript's parser
(used in V8, SpiderMonkey, and JavaScriptCore — the engines behind Chrome, Firefox,
and Safari respectively) uses recursive descent. TypeScript's own compiler uses
it. Babel's parser — which transforms modern JavaScript for older browsers — uses
it. Rust's compiler uses it.

The grammar levels you have written here (parseAddSub → parseMulDiv → parsePower →
parseUnary → parseAtom) directly reflect the operator precedence table of the
language. In every production parser, the call stack at any point in parsing tells
you exactly what precedence level you are at. The structure you built in this
lesson is not a teaching simplification — it is how real language parsers are built.

---

## What Breaks Without This

Replace `parseMulDiv` with a version that handles all four operators at the same
level as addition:

```typescript
// BROKEN — all operators at the same level
function parseBrokenAddMulDiv(): ASTNode {
  let left = parseUnary();
  while (['+', '-', '*', '/'].includes(peek().value ?? '')) {
    const op = advance();
    const right = parseUnary();
    left = { kind: 'BinaryOp', operator: op.value!, left, right, line: op.line };
  }
  return left;
}
```

Now `3 + 4 * 2` parses left-to-right as `(3 + 4) * 2`. The precedence test
fails. The evaluator — unchanged — produces `14` instead of `11`. The bug is
in the grammar structure, and fixing it requires only the parser. The evaluator
is untouched.

---

## Definition of Done

- [ ] All parser tests pass
- [ ] `3 + 4 * 2` shows `BinaryOp(+)` at root with `BinaryOp(*)` as the right child
- [ ] `(3 + 4) * 2` shows `BinaryOp(*)` at root with `BinaryOp(+)` as the left child
- [ ] `3 +` produces a `ParseError` with the line number
- [ ] `disp(x, y)` produces a `FunctionCall` node with two arguments
- [ ] You can explain what a discriminated union is and why the `kind` field makes type narrowing possible
- [ ] You can explain the difference between direct recursion (`parsePower`) and mutual recursion (`parseAtom` → `parseAssignment` → ... → `parseAtom`)
- [ ] You can explain why `parsePower` uses a recursive call instead of a `while` loop
- [ ] You can explain why `parseOr` and `parseAnd` are in the grammar even though the evaluator does not handle them yet
- [ ] You can explain what "immutable data" means for AST nodes and why it matters
- [ ] `git add src/parser.ts src/parser.test.ts` then `git commit -m "Add parser: AST now visible in the console, operator precedence encoded in grammar structure"`

---

*Next: Lesson 06 — The Evaluator. The AST becomes a number. Typing `3 + 4 * 2`
finally shows `11` — the first working end-to-end pipeline.*
