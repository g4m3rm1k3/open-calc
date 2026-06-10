# OpenMAT — Lesson 13 — Functions

## What You Will Build

```
>> function result = square(n)
     result = n * n
   end
>> disp(square(5))
25
>> disp(square(3))
9
```

Define a function once, call it as many times as you like. Variables inside
the function (`result`, `n`) do not appear in the outer workspace. Variables
in the outer workspace do not bleed into the function. Each call is isolated.

---

## What You Need to Know First

Lessons 01–12 complete. `for` and `while` loops work. The `Environment` class
has a `parent` field and a constructor that accepts a parent environment (from
lesson 08). The BRD lexer from lesson 04 produces `{ type: KEYWORD, value:
'function' }` for the `function` keyword. The `evaluate`, `parse`, and
`tokenize` pipeline, the symbol table (`Environment`), scope chain, and
discriminated-union AST nodes are all established. This lesson adds user-defined
functions to all three stages: parser, evaluator, and environment.

---

## Concept: Functions as Mathematical Objects

**The mathematical definition:**

In mathematics, a function maps an input to an output: `f(x) = x²`. Given the
same input, a mathematical function always produces the same output. No side
effects, no hidden state.

A programming function can do more — print to the console, modify variables,
draw to the screen. But the core idea is the same: a named, reusable computation
that takes inputs (parameters) and produces an output (return value).

```
f(x) = x²        ← mathematical: input x, output x²
square(n)         ← OpenMAT: parameter n, returns n * n
```

`square` is a direct implementation of `f(x) = x²`. The name can be stored,
passed, and called — just as functions compose in mathematics: `f(g(x))` becomes
`square(square(n))`.

---

**CS concept — stack frames:**

Each function call creates a *stack frame* — a block of memory holding the
function's local variables and parameters. When `square(7)` is called:

1. A new frame is pushed onto the call stack
2. `n = 7` is stored in the new frame, `result = undefined` is reserved in the frame
3. The function body runs — it reads `n` from the new frame
4. `result` is set to `49` inside the frame
5. The return value is read from the frame
6. The frame is popped — `n` and `result` cease to exist

The function's variables do not exist before the call and do not exist after it.
This is not a simplification or a convention — it is how every language runtime
implements function calls. C, Java, Python, and JavaScript all use a call stack.
The operating system allocates a fixed region of memory called the stack; the
runtime pushes and pops frames as functions are called and return.

In OpenMAT, stack frames are `Environment` objects: each call creates a `new
Environment(parentEnv)`. The `parent` pointer links the frame to its caller,
giving the function read access to outer variables through the scope chain.

---

**CS concept — lexical scoping:**

*Lexical scoping* means a function can access variables from the scope where it
was **defined**. The alternative, *dynamic scoping*, would let a function access
variables from the scope where it was **called**.

Trace through what happens when a function calls another function. When
`callUserFunction` runs, it executes:

```
funcEnv = new Environment(callerEnv)
```

The new environment's parent is the caller's environment — the scope that was
active when the function was looked up and called. Inside the function body,
`env.get('n')` first searches `funcEnv.store` and finds `n` there. If the
function body references a variable defined outside the function — for example, a
top-level variable named `scale` — `env.get('scale')` does not find it in
`funcEnv.store`, so it climbs the parent pointer and searches `callerEnv.store`,
where it is found.

This parent-chain walk is lexical scoping working in practice. The scope chain is
determined by where the function is **defined** in the source text, not where it
is invoked at runtime. You can read the function's source code and know exactly
which variables it can access. With dynamic scoping, the set of accessible
variables would depend on the call chain at runtime — which is hard to reason
about and makes function behaviour unpredictable.

Nearly all modern languages (JavaScript, Python, Java, OpenMAT) use lexical
scoping. OpenMAT implements it by linking each function call's environment to the
caller's environment (which, for top-level functions, is the session environment
where the function was defined).

---

**CS concept — functions as values (first-class functions):**

Functions in OpenMAT are *values* — the same way `100` is a value stored under
the name `x`, a `FunctionDefNode` is stored under the name `square`. When the
evaluator processes a `FunctionDef` node, it executes:

```typescript
env.set(node.name, node)
```

This stores the entire AST node — the parsed description of the function's
parameters, body, and return variable — in the environment under the function's
name. Later, when `square(7)` is called, `env.get('square')` retrieves that node
and `callUserFunction` uses it to execute the body.

This is *first-class functions* — functions treated as values that can be stored,
retrieved, and passed around. Even though OpenMAT uses a simplified form (it
stores the AST node rather than a compiled closure object), the principle is
identical to what every language that supports callbacks, higher-order functions,
or closures does. In JavaScript, `const square = (n) => n * n` stores a function
object as a value in the variable `square`. OpenMAT stores the `FunctionDefNode`.
The mechanism is the same.

---

**SE lens — API design:**

A function's signature (name, parameters, return type) is its API. A
well-designed function API:
- Has a single, clear purpose
- Communicates intent through its name: `square` not `compute`
- Has as few parameters as necessary — each parameter is something the caller
  must know and provide

In lesson 18, the `rotate(angle)` function is a concrete example: one parameter,
one clear purpose, a name that is exactly what it does.

---

**SE concept — regression testing:**

*Regression testing* runs the existing test suite after a change to confirm that
nothing previously working has broken. After adding function support, the test
runner checks every previous test automatically. This is the test suite built
across lessons 04–12 paying for itself: adding functions changes the
`Environment` type, the evaluator's `FunctionCall` case, and introduces a new
AST node. Any of these could accidentally break variable lookup, arithmetic, or
error handling. The test suite catches that.

---

## Step 1 — Extend the Environment for Function Values

**The problem:** The `Environment` symbol table currently stores
`number | string | boolean`. A function definition is a different kind of value
— it must also be storable and retrievable by name, so that `square` can be
looked up the same way `x` is looked up.

Open `src/environment.ts`. The new import and the updated union type appear at
the top of the file:

```typescript
import type { FunctionDefNode } from './parser';

export type EnvironmentValue = number | string | boolean | FunctionDefNode;

export class Environment {
  private store: Map<string, EnvironmentValue> = new Map();
  parent: Environment | null = null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  set(name: string, value: EnvironmentValue): void {
    this.store.set(name, value);
  }

  get(name: string): EnvironmentValue | undefined {
    if (this.store.has(name)) return this.store.get(name);
    if (this.parent)          return this.parent.get(name);
    return undefined;
  }

  has(name: string): boolean {
    return this.store.has(name) || (this.parent?.has(name) ?? false);
  }

  names(): string[] {
    return [...this.store.keys()].sort();
  }
}
```

**Import explanation:**

`import type { FunctionDefNode } from './parser'` — `parser.ts` owns one
responsibility: turning a token stream into an AST. We import only the
`FunctionDefNode` type (not a value, so `import type` is used — this import
disappears entirely from the compiled JavaScript and has zero runtime cost). We
need it here because `EnvironmentValue` must be able to hold a function
definition. We do not import the whole parser module because `environment.ts`
does not need to parse anything; it only needs to know the shape of a
`FunctionDefNode` so TypeScript can type-check the `store`.

**Type decision — why extend the union rather than use `any` or `unknown`:**

`EnvironmentValue = number | string | boolean | FunctionDefNode` is a discriminated
union. TypeScript knows precisely what the environment can hold. If code attempts
to store an array or an object that is not a `FunctionDefNode`, TypeScript rejects
it at compile time. Using `any` would allow those mistakes through silently.
Using `unknown` would require a type assertion everywhere the value is used.
The union is the narrowest type that captures exactly what the environment is
allowed to hold — nothing more.

**Walkthrough of `get()` walking the parent chain:**

`get(name)` first checks `this.store` — the current scope. If the name is there,
it returns immediately. If not, and if `this.parent` exists, it calls
`this.parent.get(name)` recursively. The chain continues until either the name is
found or the root environment (whose `parent` is `null`) returns `undefined`.

When a function body references `pi` or calls `sqrt`, these names live in the
session environment (the root scope where built-ins are registered), not in the
function's local scope. The parent chain reaches them: the function's scope is
searched first; if the name is not found, the parent scope is searched. This is
lexical scoping working in practice — the same mechanism described in the concept
section above, now visible as a four-line method.

---

## Step 2 — Add the FunctionDefNode AST Type

**The problem:** The parser needs a node type to represent a function definition.
When it encounters `function result = square(n) ... end`, it must produce a node
that records the function's name, parameter names, return variable name, and body
statements.

Open `src/parser.ts`. Add `FunctionDefNode` to the `ASTNode` union and define
the interface:

```typescript
export type ASTNode =
  | NumberNode | StringNode | BooleanNode | IdentifierNode
  | BinaryOpNode | UnaryOpNode | AssignmentNode | FunctionCallNode
  | IfNode | BlockNode | ForNode | WhileNode
  | FunctionDefNode;   // ← new

export interface FunctionDefNode {
  kind:       'FunctionDef';
  name:       string;
  params:     string[];
  returnName: string | null;
  body:       ASTNode[];
  line:       number;
}
```

**Type decision — what each field holds and why:**

- `kind: 'FunctionDef'` is the discriminant. It allows the evaluator's `switch`
  to dispatch to the `FunctionDef` case without an `instanceof` check. This is
  the discriminated union pattern established in lesson 05 — every AST node
  carries a `kind` field that uniquely identifies its type.
- `params: string[]` holds the parameter names in order. At call time, the
  evaluator pairs each name with the corresponding argument value.
- `returnName: string | null` holds the name of the output variable, or `null`
  for functions that have no named return. This is `null` rather than
  `string | undefined` because `null` is an intentional absence — the parser
  explicitly sets it when no return variable is present.
- `body: ASTNode[]` holds the parsed statements that make up the function body.
  These are evaluated in order inside the function's scope each time the function
  is called.
- `line: number` records the source line where the `function` keyword appeared,
  used for error messages.

**Why `returnName` instead of a `return` statement:**

MATLAB-style functions return values by assigning to a named output variable:

```
function result = square(n)
  result = n * n      ← assigns to the return variable
end
```

When the function finishes, the evaluator reads `result` from the function's
local scope and returns it. This is different from a `return value;` statement.
Both designs work; OpenMAT uses the MATLAB convention.

---

## Step 3 — Parse Function Definitions

**The problem:** The parser's `parseStatement` function does not yet know how to
handle the `function` keyword. When it encounters one, it must parse the entire
function definition — including the signature and the body — and produce a
`FunctionDefNode`.

Add `parseFunctionDef` to `src/parser.ts`:

```typescript
function parseFunctionDef(): FunctionDefNode {
  const kw = advance();   // consume KEYWORD 'function'

  // Parse 'returnVar = name(params)' or 'name(params)' (no return variable)
  let returnName: string | null = null;
  let funcName: string;

  const first = advance();   // consume first identifier
  if (!first.value) throw new ParseError("expected identifier after 'function'", kw.line);

  if (peek().type === TokenType.EQUALS) {
    advance();   // consume '='
    returnName = first.value;
    const nameToken = advance();
    funcName = nameToken.value!;
  } else {
    funcName = first.value;
  }

  expect(TokenType.LPAREN);

  const params: string[] = [];
  if (peek().type !== TokenType.RPAREN) {
    const p = advance();
    params.push(p.value!);
    while (peek().type === TokenType.COMMA) {
      advance();   // consume ','
      params.push(advance().value!);
    }
  }
  expect(TokenType.RPAREN);
  skipNewlines();

  const body: ASTNode[] = [];
  while (!isKeyword('end') && !atEnd()) {
    body.push(parseStatement());
    skipNewlines();
  }

  if (!isKeyword('end')) {
    throw new ParseError("expected 'end' to close 'function' block", kw.line);
  }
  advance();   // consume 'end'

  return { kind: 'FunctionDef', name: funcName, params, returnName, body, line: kw.line };
}
```

**Walkthrough:**

`advance()` consumes the current token and returns it. `peek()` looks at the
current token without consuming it.

The parser reads the `function` keyword first. Then it reads the first
identifier. It then peeks at the next token: if it is `=`, this is a function
with a named return variable (`result = square`), so the parser records
`returnName = first.value`, consumes the `=`, and reads the function name as the
next identifier. If the next token is not `=`, the first identifier is the
function name and `returnName` stays `null`.

`expect(TokenType.LPAREN)` consumes the `(` and throws a `ParseError` if it is
not there — the same helper used in `parseFor` and `parseWhile`. Inside the
parentheses, the parser collects parameter names separated by commas until it
reaches `)`.

The body is collected by calling `parseStatement()` in a loop, which is the same
recursive-descent entry point used for `if`, `for`, and `while` bodies. The loop
stops when `isKeyword('end')` is true. If the source ends before `end` is found,
a `ParseError` is thrown with the line number of the opening `function` keyword
so the student knows where the unclosed block began.

Add `parseFunctionDef` to `parseStatement`:

```typescript
function parseStatement(): ASTNode {
  skipNewlines();
  if (isKeyword('if'))       return parseIf();
  if (isKeyword('for'))      return parseFor();
  if (isKeyword('while'))    return parseWhile();
  if (isKeyword('function')) return parseFunctionDef();
  return parseAssignment();
}
```

**SE lens — open/closed principle:**

This is the open/closed principle at work again — the same pattern used in
lesson 09's dispatch table. `parseStatement` is extended with a new `if` branch
without modifying any existing branch. The `if` / `for` / `while` handlers are
closed for modification; function support is added by appending a new case.

---

## Step 4 — Write the Tests First (Red)

**The problem:** Before writing evaluation logic, make the expected behaviour
concrete and machine-verifiable. Three distinct behaviours must be tested:
basic calling, scope isolation, and outer-variable access.

Add to `src/evaluator.test.ts`:

```typescript
test('defines and calls a function', () => {
  const env = new Environment();
  run('function result = square(n)\n  result = n * n\nend', env);
  expect(run('square(5)', env)).toBe(25);
  expect(run('square(3)', env)).toBe(9);
});

test('function scope is isolated from outer scope', () => {
  const env = new Environment();
  run('x = 100', env);
  run('function result = addTwo(x)\n  x = x + 2\n  result = x\nend', env);
  run('addTwo(3)', env);
  expect(env.get('x')).toBe(100);   // outer x unchanged
});

test('function can read outer variables', () => {
  const env = new Environment();
  run('scale = 3', env);
  run('function result = tripled(n)\n  result = n * scale\nend', env);
  expect(run('tripled(4)', env)).toBe(12);   // reads outer 'scale'
});
```

Run `npx vitest run` — these three tests fail. `npx` is the Node package
executor: it finds and runs the `vitest` binary installed in `node_modules`
without requiring a global install. `vitest run` runs all tests once and exits
(as opposed to `vitest` without `run`, which watches for file changes). The
failure output will name each failing test and show the expected value versus the
actual value received.

---

## Step 5 — Evaluate Function Definitions and Calls (Green)

**The problem:** The evaluator's `switch` has no `FunctionDef` case and
`evaluateBuiltin` does not know how to dispatch to user-defined functions. Both
gaps must be filled.

Update `src/evaluator.ts`. First, add the `FunctionDef` case:

```typescript
case 'FunctionDef': {
  // Storing a function is storing the AST node in the environment by name.
  // When called, the evaluator retrieves the node and creates a new scope.
  env.set(node.name, node);
  return 0;
}
```

**Walkthrough of the `FunctionDef` case:**

When `evaluate` is called with a `FunctionDefNode` and an environment, it does
exactly one thing: stores the node in the environment under `node.name`. The
function is not executed. It is registered. The return value `0` is a no-op
sentinel — the same convention used by `for` and `while` loops, which also
produce no meaningful value. After this line runs, `env.get('square')` returns
the `FunctionDefNode` that was just stored.

This is first-class functions: the function definition itself — a structured
object describing parameters, body, and return variable — is a value in the
symbol table, stored exactly like a number.

---

Next, update `evaluateBuiltin` to check for user-defined functions before the
built-in switch. Add the import at the top of the evaluator file:

```typescript
import type { FunctionDefNode } from './parser';
```

`parser.ts` is responsible for AST node types. We import `FunctionDefNode` here
— again as `import type` so it has no runtime cost — because `callUserFunction`
accepts a `FunctionDefNode` parameter and TypeScript needs the type definition to
check the call.

```typescript
function evaluateBuiltin(
  name:     string,
  argNodes: ASTNode[],
  env:      Environment,
  callLine: number
): EnvironmentValue {
  // Check for user-defined function first
  const maybe = env.get(name);
  if (maybe && typeof maybe === 'object' && 'kind' in maybe && maybe.kind === 'FunctionDef') {
    return callUserFunction(maybe, argNodes, env);
  }

  // Built-in functions (disp, sqrt, etc.) remain unchanged
  const args = argNodes.map(arg => evaluate(arg, env));
  switch (name) {
    // ... same as lesson 08 ...
  }
}
```

**Walkthrough of the user-function check:**

`env.get(name)` looks up the function name in the environment, walking the parent
chain if needed. If nothing is found, `maybe` is `undefined` and the condition is
false — execution falls through to the built-in switch. If something is found,
the condition checks that it is an object (`typeof maybe === 'object'`), that it
has a `kind` property (`'kind' in maybe`), and that the `kind` is `'FunctionDef'`.
This is a TypeScript type narrowing pattern: after all three checks, TypeScript
knows `maybe` is a `FunctionDefNode` and allows `callUserFunction(maybe, ...)`.
The specificity of this check ensures that a number or string stored under the
same name does not accidentally trigger function-call logic.

---

Now add `callUserFunction` to `src/evaluator.ts`:

```typescript
function callUserFunction(
  funcDef:   FunctionDefNode,
  argNodes:  ASTNode[],
  callerEnv: Environment
): EnvironmentValue {
  // Step 1: evaluate arguments in the CALLER's scope
  const argValues = argNodes.map(arg => evaluate(arg, callerEnv));

  // Step 2: create a new scope chained to the session environment
  // We chain to callerEnv so the function can read outer variables (lexical scope)
  const funcEnv = new Environment(callerEnv);

  // Step 3: bind parameters
  funcDef.params.forEach((paramName, i) => {
    funcEnv.set(paramName, argValues[i] ?? 0);
  });

  // Step 4: execute the body
  for (const stmt of funcDef.body) {
    evaluate(stmt, funcEnv);
  }

  // Step 5: return the named output variable
  if (funcDef.returnName) {
    const returnVal = funcEnv.get(funcDef.returnName);
    if (returnVal === undefined) {
      throw new RuntimeError(
        `function '${funcDef.name}' did not assign to return variable '${funcDef.returnName}'`,
        funcDef.line
      );
    }
    return returnVal;
  }
  return 0;
}
```

**Full walkthrough — tracing `function result = square(n) \n result = n * n \n end \n square(7)`:**

1. `evaluate(FunctionDefNode, env)`: the `FunctionDef` case runs `env.set('square', node)`.
   The `FunctionDefNode` is now stored in the session environment under the name
   `'square'`. Returns `0`.

2. `evaluate(FunctionCallNode { name: 'square', args: [NumberNode(7)] }, env)`:
   the evaluator reaches `evaluateBuiltin('square', [NumberNode(7)], env, ...)`.
   `env.get('square')` returns the `FunctionDefNode`. The type-narrowing checks
   pass. `callUserFunction(funcDef, [NumberNode(7)], env)` is called.

3. Inside `callUserFunction`:
   - **Evaluate args in callerEnv:** `evaluate(NumberNode(7), env)` → `7`. The
     argument list is `[7]`.
   - **Create funcEnv:** `funcEnv = new Environment(env)` — a new scope whose
     parent is the session environment. This is the stack frame being pushed.
     At this moment `funcEnv.store` is empty.
   - **Bind parameter:** `funcEnv.set('n', 7)`. Now `funcEnv.store` has
     `{ n: 7 }`.
   - **Execute body:** the body is one statement:
     `AssignmentNode('result', BinaryOpNode('*', IdentifierNode('n'), IdentifierNode('n')))`.
     `evaluate(AssignmentNode, funcEnv)` evaluates the right side:
     `evaluate(BinaryOpNode, funcEnv)` calls `evaluate(IdentifierNode('n'), funcEnv)`,
     which calls `funcEnv.get('n')` → `7`, twice. `7 * 7 = 49`. The assignment
     runs `funcEnv.set('result', 49)`. Now `funcEnv.store` has `{ n: 7, result: 49 }`.
   - **Return:** `funcEnv.get('result')` → `49`. The function returns `49`.
     `funcEnv` is no longer referenced — it is eligible for garbage collection.
     The stack frame has been popped. `n` and `result` no longer exist.

4. `callUserFunction` returns `49`. `evaluateBuiltin` returns `49`. The caller
   receives `49`.

**Why evaluate arguments in the caller's scope:**

`square(x + 1)` — the `x + 1` is evaluated before the function runs, using the
caller's `x`. If evaluated inside `funcEnv`, `x` might not be found there, or
might refer to a parameter named `x` rather than the outer variable. Arguments
are always evaluated in the caller's scope. This is *call-by-value* semantics:
the function receives computed values, not unevaluated expressions.

**Why link the function scope to callerEnv (lexical scoping):**

The `new Environment(callerEnv)` line is the mechanism behind lexical scoping.
`funcEnv.parent = callerEnv` means that when the function body calls `env.get()`
for a name not found locally, it walks up to `callerEnv` and searches there.
For top-level functions, `callerEnv` is the session environment — the same
environment where the function was defined. If a function is defined inside
another function, `callerEnv` is that outer function's environment. In both cases,
the scope chain follows where the function was defined, not where it was called.

**Real-world connection — JavaScript's V8 engine:**

JavaScript functions work exactly this way. Every call to a JavaScript function
creates a new activation record (frame) on the V8 call stack. The `new
Environment(callerEnv)` in OpenMAT is directly analogous to how V8 creates a new
scope object and chains it to the outer scope. Closures — JavaScript functions
that capture variables from their defining scope — use this same parent-chaining
mechanism. When you write:

```javascript
function makeAdder(base) {
  return function(n) { return base + n; };
}
const addFive = makeAdder(5);
addFive(3); // 8
```

The inner function captures a reference to the scope created when `makeAdder(5)`
ran. That scope held `base = 5`. When `addFive(3)` is called later, the inner
function's scope chain still reaches the captured `base`. OpenMAT's
`new Environment(callerEnv)` is the same mechanism, written out explicitly.

Run `npx vitest run` — all three new tests, plus every test from lessons 04–12,
should pass. If any lesson-04–12 test fails, something in the `Environment` type
change or the `evaluateBuiltin` check has introduced a regression. Read the
Vitest output: it shows the test name, expected value, received value, and the
line in the test file that failed.

### SAVE AND TRY

```
>> function result = square(n)
     result = n * n
   end
>> disp(square(5))
25
```

Test scope isolation:
```
>> x = 100
>> function result = addTwo(x)
     x = x + 2
     result = x
   end
>> addTwo(3)
>> x
100
```

The outer `x` is unchanged. The function's `x` was local to the call — it lived
in `funcEnv`, which was created fresh for that call and no longer exists.

---

## Connect the Pieces

Functions add a new kind of value to the environment. The session environment
after defining `square` and setting `x` and `scale` looks like this:

```
sessionEnvironment
  'square' → FunctionDefNode { name:'square', params:['n'], returnName:'result', body:... }
  'x'      → 100
  'scale'  → 3
```

`square` lives in exactly the same symbol table as `x` and `scale`. Retrieval
works by the same `env.get()` call. The only difference is what the value is.

When `square(5)` is called, the environment structure at the moment the body runs:

```
funcEnv { n: 5, result: undefined }
  parent → sessionEnvironment { square: FunctionDefNode, x: 100, scale: 3 }
```

`funcEnv.get('n')` finds `n` immediately in `funcEnv.store`. `funcEnv.get('scale')`
does not find `scale` in `funcEnv.store`, walks to `parent`, and finds it there.
`funcEnv.get('x')` finds `x` in `funcEnv.store` — the parameter shadows the outer
`x`. The outer `x` is not modified.

This two-level chain is the minimum needed for function calls. Nested functions
would add a third level. Closures in a full language add as many levels as there
are enclosing scopes. The `Environment` class supports all of these with no
changes — the parent chain extends arbitrarily.

The pipeline from source text to return value is now complete:

```
source text
  → tokenize() → token stream
  → parse()    → ASTNode (FunctionDefNode or FunctionCallNode)
  → evaluate() → FunctionDefNode stored in env
               → or callUserFunction returns EnvironmentValue
```

---

## What Breaks Without This

Change `callUserFunction` to use the caller's environment directly instead of
creating a new one:

```typescript
function callUserFunction(funcDef, argNodes, callerEnv) {
  const argValues = argNodes.map(arg => evaluate(arg, callerEnv));
  funcDef.params.forEach((p, i) => callerEnv.set(p, argValues[i] ?? 0));
  for (const stmt of funcDef.body) evaluate(stmt, callerEnv);
  return funcDef.returnName ? callerEnv.get(funcDef.returnName) ?? 0 : 0;
}
```

Test: set `x = 100`, define `addTwo(x)` which modifies its parameter `x`, call
`addTwo(3)`, then read `x`. The outer `x` is now `5`, not `100` — the function
wrote into the caller's variable. This is the scope isolation test failure:
`expect(env.get('x')).toBe(100)` receives `5`.

The bug is invisible until you check the outer scope after calling the function.
Without the test that examines `env.get('x')` after the call, this silently
corrupts caller state. Every function call with a parameter name that collides
with an outer variable destroys the outer variable. The scope isolation test
exists precisely to catch this class of bug.

---

## Definition of Done

- [ ] `function result = square(n); result = n*n; end` defines a function
- [ ] `square(5)` returns `25`, `square(3)` returns `9`
- [ ] Variables defined inside a function do not appear in the outer workspace
- [ ] A function can read outer variables through the scope chain
- [ ] All regression tests from lessons 04–12 still pass
- [ ] You can draw a stack diagram for `square(7)` showing two scopes: `funcEnv { n:7, result:49 }` with a parent arrow to `sessionEnvironment`
- [ ] You can explain what a stack frame is and name two other languages that use a call stack
- [ ] You can explain lexical scoping: the scope chain is fixed at function definition time, not call time
- [ ] You can explain why arguments are evaluated in the caller's scope
- [ ] You can explain why `env.set(node.name, node)` makes functions first-class values
- [ ] `git add src/parser.ts src/evaluator.ts src/environment.ts src/evaluator.test.ts` then `git commit -m "Add functions: define and call user functions, lexical scoping implemented via Environment parent chain"`

---

*Next: Lesson 14 — Recursion. A function calls itself. The evaluator gains a
call depth limit to catch infinite recursion. Factorial and Fibonacci demonstrate
the pattern.*
