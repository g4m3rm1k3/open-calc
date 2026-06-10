# OpenMAT — Lesson 08 — Variables

## What You Will Build

After this lesson:

```
>> x = 10
>> x + 5
15
>> disp(x)
10
>> y = x * 2
>> disp(y)
20
```

Variables persist across console entries — a value assigned in one line is
available in the next. The evaluator also gains a small set of built-in
functions (`disp`, `sqrt`, `abs`, `floor`, `ceil`, `round`, `sin`, `cos`, `tan`).

---

## What You Need to Know First

Lessons 01–07 complete. The full pipeline evaluates arithmetic; `formatResult`
formats numbers for display. `x + 1` currently throws `RuntimeError: Variable
'x' is not defined`. `RuntimeError`, the `switch`-with-type-narrowing pattern,
and `evaluate`/`parse`/`tokenize` are all established — this lesson adds the
missing piece: a place for the evaluator to store and retrieve values.

---

## Concept: The Symbol Table

A *symbol table* is the standard data structure every programming language
runtime uses for name-to-value binding. When JavaScript tells you
`ReferenceError: x is not defined`, it means the symbol table lookup for `'x'`
returned nothing. When Python raises `NameError`, same mechanism. The
`env.get(name)` call you will write in the evaluator below is exactly what
JavaScript's variable lookup does internally.

The symbol table maps names (strings) to values. When the evaluator encounters
an identifier like `x`, it looks up `'x'` in the symbol table and substitutes
the value. When it processes an assignment like `x = 10`, it writes `'x' → 10`
into the table.

**The `Map` data structure:**

The symbol table will be backed by a JavaScript `Map`. `Map` is a built-in data
structure that stores key-to-value pairs. It works like a plain object (`{}`),
but with two important differences:

1. Any value can be a key — not just strings. (For the symbol table, string keys
   are sufficient, but this generality matters in other uses.)
2. A `Map` does not have the *prototype pollution* risk of a plain object. A plain
   object inherits keys like `toString`, `constructor`, and `hasOwnProperty` from
   `Object.prototype`. If a user names a variable `constructor`, a plain-object
   symbol table would shadow that property, causing unpredictable bugs. A `Map`
   has no inherited keys — only what you explicitly set.

The `Map` API used here:
- `.set(key, value)` — stores the value under the key. Overwrites any previous
  value for that key. Returns the `Map` itself.
- `.get(key)` — returns the value stored under `key`, or `undefined` if the key
  has never been set.
- `.has(key)` — returns `true` if the key exists, `false` otherwise.
- `.keys()` — returns an iterator over all keys in insertion order.

**CS lens — hash map lookup:**

Internally, `Map` is a hash map. When you call `.get('x')`, JavaScript computes
a hash of the string `'x'`, uses that hash to locate the storage slot directly,
and returns the value — in O(1) average time regardless of how many variables
are defined. Compare this to searching an array of `{ name, value }` pairs,
which would take O(n) time as the number of variables grows: the runtime would
have to inspect each pair in turn until it found the matching name. For a
language runtime, O(1) lookup is not a micro-optimisation — it is the difference
between a language that feels instant and one that slows down as more variables
are defined.

**SE lens — encapsulation:**

The `Environment` class hides its `Map` behind a controlled interface. The
evaluator calls `env.get(name)` and `env.set(name, value)` — it never accesses
the `Map` directly. This is *encapsulation*: hiding implementation details behind
a boundary so that the implementation can change without affecting callers.

In lesson 13, `Environment` gains a parent chain for lexical scoping: `get()`
will walk up the chain if the name is not found locally. That change happens
entirely inside `Environment` — the evaluator still calls `env.get(name)` in
exactly the same way. Without encapsulation, the evaluator would access the
`Map` directly and need to be updated whenever the storage changes.

**CS concept — name resolution:**

*Name resolution* is the process of taking a name (`x`) and finding the value it
refers to. The resolution rules for OpenMAT at this stage:

1. Look up the name in the current environment.
2. If found, return the value.
3. If not found, throw a `RuntimeError` with the name.

In lesson 13, rule 2 becomes: "if found locally, return it; if not, look in the
parent environment." That is how lexical scoping works. Every language that has
variables has a name resolution algorithm — JavaScript's spans the prototype
chain, scope chain, and `this` binding, but the same core concept applies.

---

## Step 1 — Create the Environment

**The problem:** The evaluator has no place to store state between operations.
Each call to `evaluate` starts fresh.

Create `src/environment.ts`:

```typescript
export type EnvironmentValue = number | string | boolean;

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
    return this.store.get(name);
  }

  has(name: string): boolean {
    return this.store.has(name);
  }

  names(): string[] {
    return [...this.store.keys()].sort();
  }
}
```

**New file — `src/environment.ts`:**

This file has one responsibility: storing and retrieving named values. It does
not parse, evaluate, or display anything — those are other modules' jobs. The
name `environment.ts` is deliberate: in interpreter terminology, an *environment*
is the runtime store of name-to-value bindings. A file named `utils.ts` or
`store.ts` would communicate nothing about what the file does in the context of
a language runtime. `environment.ts` does.

**Instance methods — `get()`, `set()`, `has()`, `names()`:**

This is the first class in the curriculum with instance methods. An *instance
method* is a function defined inside a class that operates on one specific
object created by that class. When you call `env.set('x', 10)`, JavaScript
calls the `set` function with `this` bound to the specific `env` object — so
`this.store` refers to the `Map` belonging to that particular `Environment`
instance, not any other.

The key consequence: each `new Environment()` call creates a completely
separate object with its own `store`. If you create two environments,
`env1` and `env2`, and call `env1.set('x', 10)`, then `env2.get('x')` returns
`undefined` — the `Map`s are independent. This isolation is what makes test
isolation work in step 4: each test creates its own `Environment` so a variable
set in one test cannot bleed into another.

**`private store`:**

The `private` keyword tells TypeScript: this field can only be accessed by code
inside this class. Nothing outside `Environment` — not the evaluator, not
`main.ts`, not tests — can read or write `store` directly. The only way to
interact with the store is through `get()`, `set()`, `has()`, and `names()`.
This is the TypeScript enforcement of the encapsulation described above.

**`parent: Environment | null`:**

The `parent` field is the foundation of the *scope chain* — a linked list of
environments. This lesson creates a single flat environment with no parent
(`parent = null`). Lesson 13 will create nested environments for function calls.

When a function is called in lesson 13, the evaluator creates a new
`Environment` whose `parent` points to the session environment:
`new Environment(sessionEnvironment)`. When the function body evaluates
`env.get('x')`, the environment checks its own `store` first. If `'x'` is not
there and `parent` is not `null`, it asks the parent — which asks its parent —
until the variable is found or the top is reached. This recurse-to-parent
behaviour is how nested scopes work: a variable defined in an outer scope is
visible in an inner scope because the inner scope's parent chain eventually
reaches the outer scope. JavaScript closures work exactly this way.

The `parent` field is left public and set in the constructor so that lesson 13
can write `new Environment(sessionEnvironment)` in one step — no separate
`setParent()` call needed.

**Why `get()` returns `undefined` instead of throwing:**

The evaluator — not the environment — decides what an undefined lookup means.
In lesson 13, an undefined lookup in an inner scope should fall through to the
outer (parent) scope. If `get()` threw immediately, that fallthrough would be
impossible. Returning `undefined` hands control back to the caller, which can
decide: throw an error here, or look in the parent.

**Walkthrough — constructing an environment and storing a variable:**

```typescript
const env = new Environment();
// env.store is a new, empty Map: {}
// env.parent is null

env.set('x', 10);
// env.store is now: { 'x' → 10 }

env.get('x');
// returns 10

env.get('y');
// 'y' is not in the store → returns undefined

env.has('x');
// returns true

env.names();
// [...store.keys()] → ['x'], .sort() → ['x']
```

---

## Step 2 — Thread the Environment Through the Evaluator

**The problem:** `evaluate` currently has no access to the symbol table. It
cannot store assignment results or look up identifier values.

The current `evaluate` signature in `src/evaluator.ts`:

```typescript
export function evaluate(node: ASTNode): number | string | boolean
```

Add the environment as a second parameter and update all recursive calls. The
full updated `src/evaluator.ts`:

```typescript
import { ASTNode }                    from './parser';
import { Environment, EnvironmentValue } from './environment';
import { formatResult }               from './main';

export class RuntimeError extends Error {
  constructor(message: string) {
    super(`RuntimeError: ${message}`);
  }
}

export function evaluate(node: ASTNode, env: Environment): EnvironmentValue {
  switch (node.kind) {

    case 'Number':  return node.value;
    case 'String':  return node.value;
    case 'Boolean': return node.value;

    case 'UnaryOp': {
      const operand = evaluate(node.operand, env);
      if (node.operator === '-') {
        if (typeof operand !== 'number') throw new RuntimeError('unary minus requires a number');
        return -operand;
      }
      if (node.operator === '~') return !operand;
      throw new RuntimeError(`unknown unary operator '${node.operator}'`);
    }

    case 'BinaryOp': {
      const left  = evaluate(node.left,  env);
      const right = evaluate(node.right, env);

      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new RuntimeError(`operator '${node.operator}' requires numeric operands`);
      }

      switch (node.operator) {
        case '+':  return left + right;
        case '-':  return left - right;
        case '*':  return left * right;
        case '/':
          if (right === 0) throw new RuntimeError('Division by zero');
          return left / right;
        case '^':  return Math.pow(left, right);
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

    case 'Identifier': {
      const value = env.get(node.name);
      if (value === undefined) throw new RuntimeError(`Variable '${node.name}' is not defined`);
      return value;
    }

    case 'Assignment': {
      const value = evaluate(node.value, env);
      env.set(node.name, value);
      return value;
    }

    case 'FunctionCall':
      return evaluateBuiltin(node.name, node.args, env);
  }
}
```

**Import explanation:**

```typescript
import { Environment, EnvironmentValue } from './environment';
```

`environment.ts` is the module responsible for storing and retrieving named
values. The evaluator imports `Environment` (the class that holds the symbol
table) and `EnvironmentValue` (the union type `number | string | boolean` that
describes what values the table can hold). The evaluator does not own the
storage — that is `environment.ts`'s job. Separating storage from evaluation
means you can test each in isolation and change the storage mechanism without
touching the evaluation logic.

**Walkthrough — tracing `x = 10` then `x + 5`:**

To make the full pipeline concrete, follow both expressions from source text to
result.

*First expression: `x = 10`*

`tokenize('x = 10')` produces:
```
[IDENTIFIER:'x', EQUALS, NUMBER:'10', EOF]
```

`parse(...)` produces:
```
AssignmentNode { name: 'x', value: NumberNode(10) }
```

`evaluate(AssignmentNode, env)` hits `case 'Assignment'`:
- It calls `evaluate(NumberNode(10), env)`, which hits `case 'Number'` and
  returns `10`.
- It calls `env.set('x', 10)` — the `Map` inside `env` now holds `{ 'x' → 10 }`.
- It returns `10`.

The variable `'x'` is now in `env.store`. Because `main.ts` checks
`tree.kind !== 'Assignment'` before printing, no output appears in the console.

*Second expression: `x + 5`*

`tokenize('x + 5')` produces:
```
[IDENTIFIER:'x', PLUS, NUMBER:'5', EOF]
```

`parse(...)` produces:
```
BinaryOp('+', IdentifierNode('x'), NumberNode(5))
```

`evaluate(BinaryOp, env)` hits `case 'BinaryOp'`:
- Left branch: `evaluate(IdentifierNode('x'), env)` hits `case 'Identifier'`:
  calls `env.get('x')`, which looks up `'x'` in the `Map` and returns `10`.
- Right branch: `evaluate(NumberNode(5), env)` hits `case 'Number'` and
  returns `5`.
- `10 + 5 = 15`. Returns `15`.

`formatResult(15)` → `'15'`. `printOutput('15')` displays `15` in the console.

**Why the environment is passed through every recursive call:**

Each recursive call to `evaluate` processes a sub-expression inside the same
program. All sub-expressions share the same environment — looking up `x` inside
`x + y` must use the same store as looking up `y`. Passing `env` explicitly
through every call (rather than using a global variable) keeps the evaluator a
pure function of its inputs: given the same node and the same environment, it
always produces the same result. In lesson 13, function calls create *new*
environments — passing `env` explicitly makes that substitution natural, because
the call site can pass a different `env` without changing any of the internal
logic.

**`case 'Identifier'` — the symbol table lookup:**

```typescript
case 'Identifier': {
  const value = env.get(node.name);
  if (value === undefined) throw new RuntimeError(`Variable '${node.name}' is not defined`);
  return value;
}
```

This is the name resolution algorithm in code. `env.get(node.name)` is the
O(1) hash map lookup. If it returns `undefined`, no binding exists for this
name — the variable has never been assigned. The `RuntimeError` is thrown with
the variable's name so the console can display a useful message:
`RuntimeError: Variable 'z' is not defined`.

**`case 'Assignment'` — writing to the symbol table:**

```typescript
case 'Assignment': {
  const value = evaluate(node.value, env);
  env.set(node.name, value);
  return value;
}
```

The right-hand side is evaluated first — `evaluate(node.value, env)` — before
anything is stored. This means `x = x + 1` works correctly: the old value of
`x` is read from the environment, `1` is added, and the result is stored back
under `'x'`. Evaluating left-to-right before storing is the definition of eager
(strict) evaluation semantics, established in lesson 06.

---

## Step 3 — Add Built-in Functions

**The problem:** `disp`, `sqrt`, and the trigonometric functions are not yet
implemented. The parser already produces `FunctionCall` nodes for these; the
evaluator needs to handle them.

Add `evaluateBuiltin` to `src/evaluator.ts`:

```typescript
function evaluateBuiltin(
  name:    string,
  argNodes: ASTNode[],
  env:     Environment
): EnvironmentValue {
  // Evaluate all arguments before dispatching — standard eager evaluation order.
  const args = argNodes.map(arg => evaluate(arg, env));

  switch (name) {
    case 'disp': {
      const val = args[0] ?? 0;
      // disp prints and returns the displayed value
      console.log(formatResult(val));
      return val;
    }

    case 'sqrt': {
      const n = args[0] as number;
      if (n < 0) throw new RuntimeError('sqrt of a negative number is not real');
      return Math.sqrt(n);
    }

    case 'abs':   return Math.abs(args[0] as number);
    case 'floor': return Math.floor(args[0] as number);
    case 'ceil':  return Math.ceil(args[0] as number);
    case 'round': return Math.round(args[0] as number);
    case 'sin':   return Math.sin(args[0] as number);
    case 'cos':   return Math.cos(args[0] as number);
    case 'tan':   return Math.tan(args[0] as number);

    default:
      throw new RuntimeError(`Function '${name}' is not defined`);
  }
}
```

**Walkthrough — tracing `disp(x)` when `x = 10`:**

`tokenize('disp(x)')` → `[IDENTIFIER:'disp', LPAREN, IDENTIFIER:'x', RPAREN, EOF]`

`parse(...)` → `FunctionCall { name: 'disp', args: [IdentifierNode('x')] }`

`evaluate(FunctionCall, env)` → falls through to `evaluateBuiltin('disp', [IdentifierNode('x')], env)`:

- `argNodes.map(arg => evaluate(arg, env))` evaluates `IdentifierNode('x')` →
  `env.get('x')` → `10`. `args` is now `[10]`.
- `case 'disp'`: `val = args[0] ?? 0` → `10`. `console.log(formatResult(10))`
  prints `'10'` to the browser console. Returns `10`.

Back in `main.ts`, `tree.kind` is `'FunctionCall'`, not `'Assignment'`, so
`printOutput(formatResult(10))` displays `10` in the OpenMAT console as well.

**Why evaluate all arguments before the switch:**

Arguments are evaluated left-to-right before the function body runs. If one
argument is `x = 5` (an assignment), the assignment completes before the
function sees the value. This matches OpenMAT's eager evaluation semantics. The
`argNodes.map(...)` call evaluates every argument in order, producing a plain
array of values — the function implementation then receives simple values, not
AST nodes.

**CS concept — dispatch table:**

The `switch (name)` in `evaluateBuiltin` is a *dispatch table*: a mapping from
names to operations. Dispatch tables are an alternative to long `if/else if`
chains. Each entry handles one operation independently — adding a new built-in
function means adding one new `case`. The dispatch table pattern was first seen
in lesson 06 (`evaluate`'s `switch (node.kind)`). It appears here again in a
different context: instead of dispatching on AST node type, it dispatches on
function name.

**Library functions used here — first appearances:**

- `Math.sqrt(n)` — returns the square root of `n`. If `n` is negative, returns
  `NaN`. This implementation throws before reaching `Math.sqrt` to give the user
  a clear error message rather than a silent `NaN`.
- `Math.abs(n)` — returns the absolute value of `n`. `Math.abs(-3)` → `3`.
- `Math.floor(n)` — returns the largest integer ≤ `n`. `Math.floor(3.7)` → `3`.
- `Math.ceil(n)` — returns the smallest integer ≥ `n`. `Math.ceil(3.2)` → `4`.
- `Math.round(n)` — returns `n` rounded to the nearest integer.
- `Math.sin(radians)`, `Math.cos(radians)`, `Math.tan(radians)` — trigonometric
  functions. They accept angles in radians, not degrees. `cos(0)` returns `1`
  because the cosine of 0 radians is 1. None of these throw — passing `Infinity`
  or `NaN` returns `NaN`.

---

## Step 4 — Update the Tests

**The problem:** Every existing call to `evaluate` now requires a second
argument. Tests must be updated, and new tests are needed for variables and
built-ins.

Update `src/evaluator.test.ts`:

```typescript
import { tokenize }             from './lexer';
import { parse }                from './parser';
import { evaluate, RuntimeError } from './evaluator';
import { Environment }          from './environment';

function run(source: string, env = new Environment()): number {
  return evaluate(parse(tokenize(source)), env) as number;
}

// ── Arithmetic tests unchanged ───────────────────────────────────────────────

// ── Variable tests ────────────────────────────────────────────────────────────

test('stores and retrieves a variable', () => {
  const env = new Environment();
  run('x = 10', env);
  expect(run('x', env)).toBe(10);
});

test('uses a variable in an expression', () => {
  const env = new Environment();
  run('x = 5', env);
  expect(run('x + 3', env)).toBe(8);
});

test('overwrites a variable', () => {
  const env = new Environment();
  run('x = 10', env);
  run('x = 20', env);
  expect(run('x', env)).toBe(20);
});

test('throws RuntimeError for undefined variable', () => {
  expect(() => run('x + 1')).toThrow(RuntimeError);
});

test('evaluates sqrt', () => {
  expect(run('sqrt(16)')).toBe(4);
});

test('evaluates cos', () => {
  expect(run('cos(0)')).toBe(1);
});
```

**Walkthrough — what `run` does:**

`run('x = 10', env)` calls `tokenize('x = 10')`, passes the tokens to `parse`,
and passes the resulting AST and `env` to `evaluate`. The helper's default
parameter (`env = new Environment()`) means that tests which do not need to
persist variables across calls can omit the second argument — a fresh
environment is created automatically.

**Why each variable test creates its own `Environment`:**

If all tests shared one environment, a variable set in test 1 would be visible
in test 2. Test 2 would pass for the wrong reason — it would be reading a value
left over from test 1 rather than one it set itself. Each test creating its own
`Environment` ensures tests are isolated: running them in any order, or running
only one of them, produces the same result.

**Running the tests:**

```
npx vitest run
```

`npx` runs a package without installing it globally. `vitest` is the test
runner. `run` is the subcommand meaning "execute all tests once and exit" (as
opposed to watch mode). Expected output: a summary line showing all tests passed
with a green checkmark. If any test fails, Vitest prints the test name, the
expected value, and the received value.

---

## Step 5 — Thread the Environment Through main.ts

**The problem:** The session needs a single `Environment` that persists across
all console entries. Each entry processes one expression using the shared store.

Update `src/main.ts`:

```typescript
import { tokenize }                   from './lexer';
import { parse }                      from './parser';
import { evaluate, RuntimeError }     from './evaluator';
import { Environment }                from './environment';
import { initConsole, printOutput }   from './console';
import { formatResult }               from './main';

// ... canvas and triangle code unchanged ...

const sessionEnvironment = new Environment();

initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);
    const tree   = parse(tokens);
    const result = evaluate(tree, sessionEnvironment);

    if (tree.kind !== 'Assignment') {
      printOutput(formatResult(result));
    }
  } catch (error) {
    printOutput((error as Error).message);
  }
});
```

**Import explanation:**

```typescript
import { Environment } from './environment';
```

`environment.ts`'s single responsibility is storing and retrieving named values.
`main.ts` imports `Environment` because it is responsible for creating the one
environment that persists for the entire session. Every call to `evaluate` inside
the console callback passes `sessionEnvironment` — the same object, every time —
so that values assigned on one line are visible on subsequent lines.

**Why `sessionEnvironment` is declared outside the callback:**

The callback passed to `initConsole` runs every time the user presses Enter. If
`sessionEnvironment` were declared inside the callback:

```typescript
initConsole(function(userInput: string): void {
  const sessionEnvironment = new Environment(); // WRONG: new env every call
  // ...
});
```

A fresh, empty environment would be created on each call. `x = 10` would
succeed — the value would be stored in that call's environment. But when the
user types `x + 5` and presses Enter, a *new* environment is created with no
variables. `env.get('x')` returns `undefined` and the evaluator throws
`RuntimeError: Variable 'x' is not defined`. The value assigned in the first
call was stored in an object that JavaScript garbage-collected when the first
callback returned.

Declaring `sessionEnvironment` outside the callback places it in the outer
scope. The callback *closes over* it — it captures a reference to the same
`Environment` object and uses it on every invocation. This is a JavaScript
*closure* in action: the callback function carries a reference to a variable
from the scope where it was defined. The `sessionEnvironment` object lives as
long as the closure does — which is for the lifetime of the page.

**Real-world connection — JavaScript's own scope chain:**

The scope chain you are implementing is the same mechanism JavaScript itself
uses for variable lookup. When a function in JavaScript reads a variable from
an outer scope, it climbs the scope chain — a linked list of environments —
until it finds the binding or reaches the global scope. Node.js's `global`
object and the browser's `window` object are the top of that chain: the
environment whose parent is `null`. When a closure in JavaScript "captures" a
variable from an outer scope, it is holding a reference to the environment
object in which that variable lives — exactly as `sessionEnvironment` is held
by the callback above. Lexical scoping (where a function sees the variables of
the scope it was *defined* in, not the scope it was *called* from) is
implemented by threading the environment through every evaluation step, which
is exactly what this lesson's change to `evaluate`'s signature achieves.

**Why assignment is silent:**

`x = 10` stores a value — it is a storage operation. Printing the value every
time a variable is assigned creates noise. The user can always type `x` to see
the current value, or use `disp(x)`. MATLAB uses the semicolon convention
(`x = 10` echoes, `x = 10;` suppresses). OpenMAT always suppresses for
simplicity; the convention can be added later.

### SAVE AND TRY

```
>> x = 10
>> x + 5
15
>> disp(x)
10
>> y = x * 2
>> y
20
>> sqrt(16)
4
>> cos(0)
1
```

---

## Connect the Pieces

```
tokenize → parse → evaluate(tree, sessionEnvironment) → formatResult → printOutput
                                 ↕
                          Environment
                         (persists across calls)
```

The environment is the memory of the running program. It is:
- Created once per session in `main.ts`
- Passed to `evaluate()` on every console entry
- Written by `Assignment` nodes (`env.set`)
- Read by `Identifier` nodes (`env.get`)
- Shared across all lines in the session

The `Environment` class is a symbol table. The `Map` inside it is a hash map
giving O(1) name lookup. The `private store` field enforces encapsulation: only
the four public methods can touch the data. The `parent` field is the hook for
the scope chain that lesson 13 will build.

In lesson 13, function calls create new child environments that chain back to
the session environment. The `parent` field and the constructor signature added
in step 1 are already in place for this.

---

## What Breaks Without This

Declare `sessionEnvironment` inside the callback:

```typescript
initConsole(function(userInput: string): void {
  const sessionEnvironment = new Environment();   // WRONG: new env every call
  // ...
});
```

Type `x = 10`, then `x + 5`. The second line throws "Variable 'x' is not
defined" — the value was stored in an environment that was discarded when the
first callback returned. Where a variable is declared determines its lifetime.
This rule applies equally to JavaScript variables and to the symbol tables of
languages you build.

---

## Definition of Done

- [ ] `x = 10` followed by `x + 5` evaluates to `15`
- [ ] `disp(x)` prints the value to the console
- [ ] `sqrt(16)` → `4`, `cos(0)` → `1`
- [ ] Typing an undefined variable name shows a `RuntimeError` with the name
- [ ] All tests pass with each test using its own `Environment`
- [ ] You can explain what a symbol table is and name one real language runtime
      that uses the same concept
- [ ] You can explain what `Map` is, how it differs from a plain object, and
      why it was chosen here
- [ ] You can explain what an instance method is and what `this.store` refers to
      when `env.set('x', 10)` is called
- [ ] You can explain the scope chain: what `parent` is, how `env.get` will use
      it in lesson 13, and how JavaScript closures use the same mechanism
- [ ] You can explain the O(1) lookup advantage of a hash map over a linear search
- [ ] You can explain encapsulation: what is hidden behind `Environment`'s interface
      and why hiding it matters
- [ ] You can explain why `sessionEnvironment` must be declared outside the callback
- [ ] `git add src/environment.ts src/evaluator.ts src/evaluator.test.ts` then `git commit -m "Add variables: symbol table implemented, x = 10 then x + 5 produces 15"`

---

*Next: Lesson 09 — Error Handling. When something goes wrong, the console shows
"line 2: x is not defined" with the exact source location. Errors become a
contract, not a crash.*
