# OpenMAT — Lesson 06 — The Evaluator

## What You Will Build

Type `3 + 4 * 2` and see:

```
>> 3 + 4 * 2
11
```

Type `2 ^ 10`:
```
>> 2 ^ 10
1024
```

Type `(1 + 2) * (3 + 4)`:
```
>> (1 + 2) * (3 + 4)
21
```

The lexer and parser are already done. The evaluator is the third and final stage
that turns the AST into a numeric result. After this lesson, the three-stage
pipeline — `tokenize → parse → evaluate` — is complete and the console computes
real arithmetic. This lesson also adds the first integration test: a test that runs
all three stages as one chain and verifies the final answer.

---

## What You Need to Know First

Lessons 01–05 are complete. The console displays the AST tree structure when you
type an expression. The `ASTNode` discriminated union type and all its node
interfaces (`NumberNode`, `BinaryOpNode`, `UnaryOpNode`, `IdentifierNode`,
`AssignmentNode`, `FunctionCallNode`) are defined in `src/parser.ts`. The `Token`,
`TokenType`, and `ParseError` types are defined in `src/lexer.ts`.

Concepts already established — brief references only from here on: git, type
assertions, the DOM, the event loop, XSS, the module system, npm, Vite, tsconfig,
`interface`, `class extends Error`, `constructor`, `super`, `Set`, `Record<K,V>`,
`as const`, TDD, finite state machines, single responsibility, discriminated union
types, and recursive descent parsing.

---

## How the Three Stages Connect

In lesson 03 you built the lexer. In lessons 04 and 05 you built the parser. Each
stage was independently testable but not yet useful on its own — the pipeline had
two of its three stages but no way to produce a final answer.

The evaluator is the stage that closes the loop:

```
source string
    ↓  tokenize()     (lexer.ts)
token list
    ↓  parse()        (parser.ts)
AST
    ↓  evaluate()     (evaluator.ts)
result value
    ↓  printOutput()  (console.ts)
console display
```

Each arrow is a module boundary. Each stage takes one data structure and produces
another. No stage knows anything about how the others are implemented — only what
they produce. That interface contract is what makes each stage independently
replaceable and independently testable.

---

## Concept: Type Narrowing With `switch` on a Discriminated Union

The evaluator's central mechanism is a `switch` on `node.kind`. Before explaining
the code, it is worth understanding exactly what TypeScript does inside each branch
— because it is more powerful than it first appears.

Recall from lesson 05 that `ASTNode` is a discriminated union:

```typescript
type ASTNode =
  | NumberNode      // { kind: 'Number',      value: number, line: number }
  | StringNode      // { kind: 'String',      value: string, line: number }
  | BooleanNode     // { kind: 'Boolean',     value: boolean, line: number }
  | UnaryOpNode     // { kind: 'UnaryOp',     operator: string, operand: ASTNode, line: number }
  | BinaryOpNode    // { kind: 'BinaryOp',    operator: string, left: ASTNode, right: ASTNode, line: number }
  | IdentifierNode  // { kind: 'Identifier',  name: string, line: number }
  | AssignmentNode  // { kind: 'Assignment',  name: string, value: ASTNode, line: number }
  | FunctionCallNode// { kind: 'FunctionCall',name: string, args: ASTNode[], line: number }
```

Every member of the union has a `kind` field with a string literal type unique to
that member. That `kind` field is the *discriminant* — the property that identifies
which variant you have.

When you write `switch (node.kind)`, TypeScript tracks which values of `kind` have
been ruled out as execution enters each branch. After `case 'Number':`, TypeScript
knows that `node.kind === 'Number'` is true — and therefore that `node` must be a
`NumberNode`. It *narrows* the type of `node` from the full `ASTNode` union down to
`NumberNode` alone. Inside that branch, TypeScript knows that `node.value` is a
`number` and `node.line` is a `number`. It will reject any attempt to access a field
that `NumberNode` does not have.

Without the discriminated union, you would have to write a type assertion in every
branch:

```typescript
// Without discriminated union — every case needs a cast
case 'Number':
  return (node as NumberNode).value;   // type assertion: "trust me, this is a NumberNode"
```

With the discriminated union, no cast is needed:

```typescript
// With discriminated union — TypeScript narrows automatically
case 'Number':
  return node.value;   // TypeScript already knows node is a NumberNode here
```

The `switch` on the discriminant field is the standard pattern for exhaustive
dispatch on a union type. TypeScript can even detect if you forget a case —
a technique called *exhaustiveness checking* — which we will use in a later lesson
when the union grows to include matrix and vector nodes.

---

## Concept: Tree Traversal

The evaluator walks the AST by calling itself. This is *recursive tree traversal*
— one of the fundamental algorithms in computer science.

The structure is always the same: process the current node, recursively process its
children, combine the results. For a leaf node (`NumberNode`), there are no
children, so the function returns the node's value directly. For a branch node
(`BinaryOpNode`), the function evaluates the left child, evaluates the right child,
then combines them with the operator.

```
evaluate( BinaryOp('+') )
  → evaluate( Number(3) )           → 3
  → evaluate( BinaryOp('*') )
       → evaluate( Number(4) )      → 4
       → evaluate( Number(2) )      → 2
       → 4 * 2 = 8
  → 3 + 8 = 11
```

The recursion of `evaluate` mirrors the recursion of the tree. The tree was built
by the parser's recursive descent (lesson 05) — each recursive parser call produced
a subtree, and now each recursive evaluator call processes one. The evaluator is a
*tree traversal*: the structure of the recursion exactly matches the structure of
the data.

Recursive tree traversal appears at the foundation of production software
everywhere:

- Every compiler has an evaluator or code generator that traverses the AST.
  The evaluator built in this lesson is exactly what JavaScript engines did in
  their earliest versions.
- React's reconciler traverses the virtual DOM tree to determine which real DOM
  nodes need to change.
- File system operations — `find`, `rm -r`, `cp -r` — traverse directory trees
  where each directory is a branch node and each file is a leaf node.

The algorithm is always the same: process the current node, recurse into children,
combine results.

**Why recursion is the only correct approach:**

A non-recursive approach fails for nested expressions:

```typescript
// BROKEN — only handles one level of nesting
case 'BinaryOp': {
  const leftValue  = (node.left  as any).value;   // only works if left is a NumberNode
  const rightValue = (node.right as any).value;   // crashes if right is another BinaryOp
  return leftValue + rightValue;
}
```

This evaluates `3 + 4` correctly but crashes on `3 + 4 * 2` because the right
child is `BinaryOpNode`, not `NumberNode`. A `BinaryOpNode` has no `.value` field.
Recursion is not an optimisation — it is the only correct approach for a tree where
nodes can themselves contain trees.

---

## Concept: Evaluation Semantics

*Semantics* is the study of meaning. *Evaluation semantics* is the set of rules that
determine what each expression means — what value it produces, in what order, under
what conditions.

OpenMAT uses *eager evaluation*: every sub-expression is evaluated before its result
is used. When the evaluator sees `f(x + 1)`, it evaluates `x + 1` first, then calls
`f` with the result. This is the evaluation strategy used by JavaScript, Python,
Java, and C. The alternative, *lazy evaluation* (used by Haskell), only evaluates an
expression when its value is actually needed — which enables infinite data structures
but makes execution order harder to reason about.

The complete evaluation semantics of OpenMAT expressions:

- A number literal evaluates to its numeric value
- A unary minus evaluates its operand, then negates it
- A binary operation evaluates both operands first, then applies the operator
- An identifier evaluates to its value in the current environment
- A function call evaluates all arguments first, then runs the function body

These rules define the meaning of every expression in the language. When a student
asks "what does `f(x + 1)` do?", the answer comes from rules 4 and 5: look up `x`,
add `1`, then call `f` with the result.

---

## Concept: Integration Testing

Unit tests on the lexer verify tokenisation. Unit tests on the parser verify tree
structure. Neither catches a mismatch *between* stages.

An *integration test* runs `tokenize → parse → evaluate` as one chain and verifies
the final result. Both kinds are necessary: a unit test on the evaluator can pass
even if the parser and evaluator misunderstand each other's data contracts. The
integration test is the only test that exercises the pipeline as a whole.

---

## Concept: The Visitor Pattern

The `switch (node.kind)` structure in the evaluator is an implementation of the
*Visitor* pattern: a function that dispatches on the type of a data structure and
performs an operation on each variant. Each `case` is a separate, independently
testable branch. Adding a new node type (for example, `MatrixNode` in a later
lesson) means adding one new case — no existing cases need to change.

This is the *Open-Closed Principle* again — the same principle that shaped the
dispatch table in the parser. The evaluator is open for extension (add new node
types) and closed for modification (existing cases are not touched).

---

## Step 1 — Write the Tests First

Create `src/evaluator.test.ts`. This is a new file: its single responsibility is
testing the evaluator in isolation and testing the full pipeline end-to-end.

```typescript
import { tokenize }  from './lexer';
import { parse }     from './parser';
import { evaluate }  from './evaluator';

// Integration helper: full pipeline in one call
function run(source: string): number {
  return evaluate(parse(tokenize(source))) as number;
}

test('evaluates a single number', () => {
  expect(run('42')).toBe(42);
});

test('evaluates addition', () => {
  expect(run('3 + 4')).toBe(7);
});

test('evaluates operator precedence', () => {
  expect(run('3 + 4 * 2')).toBe(11);   // not 14
});

test('evaluates parentheses overriding precedence', () => {
  expect(run('(3 + 4) * 2')).toBe(14);
});

test('evaluates exponentiation', () => {
  expect(run('2 ^ 10')).toBe(1024);
});

test('evaluates unary minus', () => {
  expect(run('-3')).toBe(-3);
  expect(run('-(2 + 3)')).toBe(-5);
});

test('evaluates division', () => {
  expect(run('10 / 4')).toBe(2.5);
});

test('reports division by zero', () => {
  expect(() => run('1 / 0')).toThrow('Division by zero');
});

test('reports undefined variable', () => {
  expect(() => run('x + 1')).toThrow("Variable 'x' is not defined");
});
```

**The imports — what each module's responsibility is and what is being imported:**

- `lexer.ts` is the module responsible for converting raw source text into a flat
  list of tokens. It owns everything about characters, whitespace, and raw text.
  We import `tokenize`, the function that performs this conversion.
- `parser.ts` is the module responsible for converting a flat token list into a
  structured AST that represents the grammar of the expression. It owns operator
  precedence, parenthesis grouping, and tree shape. We import `parse`, the
  function that performs this conversion.
- `evaluator.ts` (which we are about to create) is the module responsible for
  walking an AST and computing its numeric result. We import `evaluate`, the
  function that does this.

Each import is a narrow dependency — we take exactly one function from each module,
nothing else. The modules do not import from each other (the evaluator does not call
the lexer; the parser does not call the evaluator). The only place all three meet is
here in the test file and later in `main.ts`.

**The `run` helper:**

`run` is the integration helper. It chains all three stages in a single call:
`tokenize` produces a token list, `parse` consumes it and produces an AST, and
`evaluate` consumes the AST and produces a value. The `as number` cast is a type
assertion: the evaluator's return type will expand to `number | string | boolean`
in later lessons, but in these arithmetic tests the result is always a number.
The cast is safe here because we only pass arithmetic expressions.

**Arrow functions — already established in lesson 02; used without re-explanation.**

Run the tests:

```
npx vitest run
```

`npx` runs the Vitest executable from `node_modules` without requiring a global
install. `vitest run` runs all tests once and exits — no watch mode. All nine tests
will fail. This is the *Red* step in TDD: the test suite defines the behaviour we
want, and the implementation does not exist yet.

---

## Step 2 — Implement the Evaluator

Create `src/evaluator.ts`. This file's single responsibility is: given an `ASTNode`,
return its value. It owns nothing about lexing, parsing, or display.

```typescript
import { ASTNode } from './parser';

export class RuntimeError extends Error {
  constructor(message: string) {
    super(`RuntimeError: ${message}`);
  }
}

export function evaluate(node: ASTNode): number | string | boolean {
  switch (node.kind) {

    case 'Number':
      return node.value;

    case 'String':
      return node.value;

    case 'Boolean':
      return node.value;

    case 'UnaryOp': {
      const operand = evaluate(node.operand);
      if (node.operator === '-') {
        if (typeof operand !== 'number') throw new RuntimeError('unary minus requires a number');
        return -operand;
      }
      if (node.operator === '~') {
        return !operand;
      }
      throw new RuntimeError(`unknown unary operator '${node.operator}'`);
    }

    case 'BinaryOp': {
      const left  = evaluate(node.left);
      const right = evaluate(node.right);

      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new RuntimeError(`operator '${node.operator}' requires numeric operands`);
      }

      switch (node.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': {
          if (right === 0) throw new RuntimeError('Division by zero');
          return left / right;
        }
        case '^': return Math.pow(left, right);

        // Comparison operators — evaluated in lesson 10 (control flow).
        // Parsing already handles these; evaluation follows later.
        case '>':  return left >  right;
        case '<':  return left <  right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return left === right;
        case '~=': return left !== right;
        case '&&': return (left !== 0) && (right !== 0);
        case '||': return (left !== 0) || (right !== 0);
      }

      throw new RuntimeError(`unknown operator '${node.operator}'`);
    }

    case 'Identifier':
      throw new RuntimeError(`Variable '${node.name}' is not defined`);

    case 'Assignment':
      throw new RuntimeError('Variables are not supported yet (see lesson 08)');

    case 'FunctionCall':
      throw new RuntimeError(`Function '${node.name}' is not defined (see lesson 08)`);
  }
}
```

**The import:**

`parser.ts` is the module responsible for producing ASTs. We import `ASTNode` —
the discriminated union type that describes every possible node shape. We need this
type because `evaluate` accepts any node the parser can produce. We import nothing
else from `parser.ts`: the evaluator does not call `parse` and does not need to know
how the parser works internally.

**`RuntimeError`:**

`RuntimeError extends Error` follows the same pattern as `ParseError` in lesson 05.
`class extends Error` creates a new error class that inherits the standard `Error`
behaviour (stack traces, `instanceof` checks, the `.message` field). The
`constructor` calls `super(...)` to pass the formatted message to `Error`'s own
constructor — `super` must be called before the constructor body can access `this`.
`RuntimeError` is exported so that `main.ts` can catch it by name instead of
catching all errors blindly.

**`Math.pow(base, exponent)`:**

`Math.pow` is a built-in JavaScript function. It accepts two numbers and returns
the first raised to the power of the second. `Math.pow(2, 10)` returns `1024`.
It does not throw — if passed `Infinity`, `NaN`, or `0`, it returns a number
according to standard mathematical rules (e.g., `Math.pow(0, 0)` returns `1`).

**The walkthrough — tracing `evaluate(parse(tokenize('3 + 4 * 2')))`:**

1. `tokenize('3 + 4 * 2')` produces `[NUMBER:3, PLUS, NUMBER:4, MULTIPLY, NUMBER:2, EOF]`.
   The lexer owns this step. The evaluator never sees the source string.

2. `parse(tokens)` applies the precedence rules built into the recursive descent
   parser (lesson 05). Multiplication binds tighter than addition, so the tree is:

   ```
   BinaryOp('+',
     NumberNode(3),
     BinaryOp('*', NumberNode(4), NumberNode(2))
   )
   ```

   The parser owns this step. The evaluator never sees the token list.

3. `evaluate(BinaryOp('+', ...))` enters `switch (node.kind)` and hits
   `case 'BinaryOp'`. At this point, TypeScript has narrowed `node` to
   `BinaryOpNode` — it knows `node.left`, `node.right`, and `node.operator` are
   the correct types.

   The case evaluates `node.left` first: `evaluate(NumberNode(3))` hits
   `case 'Number'` and returns `3`. TypeScript knows `node.value` is a `number`
   inside this branch because it has narrowed `node` to `NumberNode`.

   Then it evaluates `node.right`: `evaluate(BinaryOp('*', NumberNode(4), NumberNode(2)))`.
   This is the recursive call. It hits `case 'BinaryOp'` again. Now TypeScript
   narrows `node` to the inner `BinaryOpNode`. It evaluates the left child:
   `evaluate(NumberNode(4))` → `4`. It evaluates the right child:
   `evaluate(NumberNode(2))` → `2`. The operator is `'*'`, so it returns
   `4 * 2 = 8`.

   Back in the outer `BinaryOp` case: `left` is `3`, `right` is `8`, the operator
   is `'+'`, so the function returns `3 + 8 = 11`.

The recursion of `evaluate` mirrors the recursion of the tree. This is tree
traversal: the shape of the data determines the shape of the execution.

**Why `evaluate` returns `number | string | boolean` instead of just `number`:**

The evaluator is not finished — it will grow across the following lessons to handle
string variables, boolean results from comparisons, and eventually vectors and
matrices. Declaring the return type as a union now means future additions only need
to extend the union and add new `case` branches — not change function signatures
throughout the codebase. This is the Open-Closed Principle applied to the type
signature: the union is open for extension.

**Why division by zero throws instead of returning `Infinity`:**

JavaScript evaluates `1 / 0` as `Infinity` silently. In a mathematical calculator,
division by zero is an error. Throwing a `RuntimeError` with a specific message lets
the console display `RuntimeError: Division by zero` instead of `Infinity`, which
would be confusing output with no indication that something went wrong.

**Why comparison operators are already handled here:**

The parser (lesson 05) handles comparison tokens in the grammar because the grammar
defines what expressions are *syntactically valid*. The evaluator handles their
*meaning*. Including comparison evaluation here keeps the evaluator consistent with
the parser — lesson 10 will add `if/else` control flow that *uses* comparison
results, but the comparison evaluation itself is already in place.

Run the tests again:

```
npx vitest run
```

All nine tests should now pass. This is the *Green* step in TDD. The evaluator
implements the behaviour the tests specified, and the tests confirm it.

---

## Step 3 — Connect to the Console

Update the console callback in `src/main.ts`. The canvas and triangle code is
unchanged — this is a vertical slice that adds new behaviour to the existing
visible output without touching what is already working.

```typescript
import { tokenize }          from './lexer';
import { parse }             from './parser';
import { evaluate, RuntimeError } from './evaluator';

// ... canvas and triangle code unchanged ...

initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);
    const tree   = parse(tokens);
    const result = evaluate(tree);
    printOutput(String(result));
  } catch (error) {
    printOutput((error as Error).message);
  }
});
```

**The imports — what is being added and why:**

`main.ts` is the composition root: the one place where all three pipeline stages
are assembled. The previous version of `main.ts` imported from `lexer.ts` and
`parser.ts` to display the AST. Now it also imports `evaluate` (the function that
computes a result from an AST) and `RuntimeError` (the error class the evaluator
throws) from the evaluator module. We import `RuntimeError` by name so we could
later catch it separately from `ParseError` — for example, to display parse errors
and runtime errors with different styling.

**`String(value)`:**

`String(value)` converts any value to its string representation. `String(11)` returns
`'11'`. `String(true)` returns `'true'`. It does not throw. We use it here because
`evaluate` returns `number | string | boolean` — the console's `printOutput`
function expects a string, so we convert whatever came back.

**`(error as Error).message`:**

`catch (error)` gives us a value typed as `unknown` — TypeScript does not know what
was thrown. The type assertion `as Error` tells TypeScript to treat the thrown value
as an `Error` object so we can read its `.message` field. This is safe here because
both `ParseError` and `RuntimeError` extend `Error` and both set their `.message`
in their constructors. If something unexpected were thrown, `.message` might be
`undefined`, but that is an acceptable failure mode for a console display.

### SAVE AND TRY

Type `3 + 4 * 2`:
```
>> 3 + 4 * 2
11
```

Type `2 ^ 10`:
```
>> 2 ^ 10
1024
```

Type `1 / 0`:
```
>> 1 / 0
RuntimeError: Division by zero
```

Type `x + 1`:
```
>> x + 1
RuntimeError: Variable 'x' is not defined
```

**This is the first working end-to-end pipeline.** Three files — `lexer.ts`,
`parser.ts`, `evaluator.ts` — work together through clean interfaces. No stage
knows anything about the others' implementations. The console in `main.ts`
composes them.

---

## Real-World Connection

JavaScript engines — V8 in Chrome, SpiderMonkey in Firefox, JavaScriptCore in
Safari — all have an evaluator that traverses an AST. The evaluator you built in
this lesson is exactly what these engines did in their earliest versions.

In production engines, the simple evaluator is eventually replaced by a JIT
compiler — *Just-In-Time* compilation. Instead of interpreting the tree by
traversing it on every call, the JIT compiler traverses the tree once and emits
machine code. The next time the same function is called, the engine runs the machine
code directly, skipping the traversal entirely. This is why JavaScript is fast
despite being a dynamic interpreted language: hot code paths are compiled to machine
code after the first few executions.

The interpreter in this lesson is the first step of that progression. Understanding
tree traversal and evaluation semantics is the prerequisite for understanding how a
JIT compiler works — the compiler traverses the same tree and emits instructions
instead of returning values.

---

## Connect the Pieces

```
source string
    ↓  tokenize()     (lexer.ts)
token list
    ↓  parse()        (parser.ts)
AST
    ↓  evaluate()     (evaluator.ts)
result value
    ↓  printOutput()  (console.ts)
console display
```

Each arrow is a module boundary. Each stage takes one thing, produces another.
You can replace any stage — swap in a different parser, change the evaluator's
number representation — and as long as the interface contract is identical, the
rest of the pipeline is unaffected.

| Lesson | What it adds to the pipeline |
|--------|------------------------------|
| 07 | Floating point precision — why `0.1 + 0.2 ≠ 0.3` |
| 08 | Variable environment — `x = 10` stores, `x + 5` retrieves |
| 09 | Structured error reporting with line numbers |
| 10 | Control flow — `if/else` uses the comparison evaluation added here |
| 11 | For loops |
| 12 | While loops |
| 13 | Functions — user-defined function evaluation |
| 14 | Recursion — call stack depth limit |
| 15 | Standard library — `sqrt`, `sin`, `cos` built-ins |

---

## What Breaks Without This

Remove the recursive calls and replace them with direct field access:

```typescript
case 'BinaryOp': {
  // BROKEN: only handles leaf children
  const leftValue  = (node.left  as any).value;
  const rightValue = (node.right as any).value;
  // ...
}
```

`3 + 4` evaluates correctly. `3 + 4 * 2` throws `TypeError: Cannot read properties
of undefined (reading 'value')` because `node.right` is a `BinaryOpNode`, which
has no `.value` field. The fix is the recursive call — evaluate the children
as full nodes, not as raw fields.

---

## Definition of Done

- [ ] All tests in `evaluator.test.ts` pass
- [ ] `3 + 4 * 2` → `11` (not `14`) in the console
- [ ] `2 ^ 10` → `1024`
- [ ] `1 / 0` → `RuntimeError: Division by zero`
- [ ] `x + 1` → `RuntimeError: Variable 'x' is not defined`
- [ ] You can trace the evaluation of `3 + 4 * 2` step by step, naming which
      `case` handles each node and what value it returns
- [ ] You can explain what TypeScript type narrowing does inside `case 'Number':`
      and why no type assertion is needed there
- [ ] You can explain what tree traversal is and name two production systems
      that use it
- [ ] You can explain what the Visitor pattern is and point to where the
      evaluator implements it
- [ ] You can state OpenMAT's five evaluation semantics rules from memory
- [ ] `git add src/evaluator.ts src/evaluator.test.ts src/main.ts` then `git commit -m "Add evaluator: three-stage pipeline complete, console now computes arithmetic"`

---

*Next: Lesson 07 — Floating Point. Type `0.1 + 0.2` and see `0.30000000000000004`.
This is not a bug in OpenMAT — it is how all computers represent fractional
numbers, and understanding it is essential before adding variables and seeing
unexpected comparison results.*
