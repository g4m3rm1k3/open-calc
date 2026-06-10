# OpenMAT — Lesson 09 — Error Handling

## What You Will Build

Before this lesson, an undefined variable shows a bare, hard-to-locate message:

```
>> z + 1
RuntimeError: Variable 'z' is not defined
```

After this lesson:

```
>> z + 1
Error on line 1: Variable 'z' is not defined
```

For a multi-line program (once loops arrive in lesson 11):

```
for i = 1:3
  disp(zz)
end
Error on line 2: Variable 'zz' is not defined
```

The line number tells you exactly where to look. Python, JavaScript, and MATLAB
all include line numbers in error messages for the same reason: without them, a
programmer must manually correlate the error message with the source code — a
process that becomes tedious as programs grow longer.

By the end of this lesson, the interpreter catches all three kinds of error
(lexer errors, parse errors, runtime errors), formats them with a line number,
and prevents raw JavaScript internal errors from ever reaching the user.

---

## What You Need to Know First

Lessons 01–08 are complete. Variables work. Three error classes already exist:
`LexerError` (in `lexer.ts`), `ParseError` (in `parser.ts`), and `RuntimeError`
(in `evaluator.ts`). All three extend `Error` directly. They were introduced
in earlier lessons; this lesson upgrades their shared structure rather than
introducing them fresh. The `Environment` class, scope chain, `Map`, and the
`evaluate`/`parse`/`tokenize` pipeline are all established — brief references
only below.

---

## Concept: Why Embedding Information in the Message String Fails

The current `LexerError` stores the line number inside the message text:

```typescript
// In lexer.ts (from lesson 04):
super(`LexerError on line ${line}: ${message}`);
```

The line number and the message are concatenated into one string. The catch
block in `main.ts` receives a single opaque piece of text. It cannot:

- Extract the line number to format it differently in the UI
- Display the error category (`LexerError` vs `RuntimeError`) separately
- Route lexer errors and evaluator errors to different handlers
- Show a MATLAB-style error panel with the source line highlighted

The fix is to store the line number as a separate, typed field alongside the
message — not embedded within it. That means creating a shared base class that
all three error types inherit from.

---

## Concept: The Error Inheritance Hierarchy

This lesson introduces the first multi-level inheritance hierarchy in this
codebase. The pattern is:

```
Error                   ← built into JavaScript
  └── OpenMATError      ← new: carries .line for all interpreter errors
        ├── LexerError  ← already exists; promoted from Error to OpenMATError
        ├── ParseError  ← same
        └── RuntimeError ← same
```

**CS lens — inheritance:** *Inheritance* is a relationship between classes.
When a class uses `extends`, it inherits all fields and methods of its parent.
`LexerError extends OpenMATError` means every `LexerError` object automatically
has the `line` field and `message` field defined on `OpenMATError` — without
repeating those definitions in `LexerError`. The relationship reads as
"is-a": a `LexerError` is-a `OpenMATError`, which is-a `Error`.

Prior lessons introduced `class extends Error` for a single class. This lesson
extends that pattern into a hierarchy of three subclasses under a single parent.
The new concept here is that inheritance is transitive: a `LexerError` inherits
from `OpenMATError` which inherits from `Error`, so a `LexerError` object has
all the fields of all three classes.

**The instanceof operator — first use:** `error instanceof OpenMATError` is a
runtime check. It asks: "Was this value created by calling `new OpenMATError()`
or by calling `new` on any class that extends it?" Because `LexerError`,
`ParseError`, and `RuntimeError` all extend `OpenMATError`, the check returns
`true` for all of them. This means a single `catch` branch can handle all three
error types uniformly:

```typescript
catch (error) {
  if (error instanceof OpenMATError) {
    // Works for LexerError, ParseError, AND RuntimeError
    printOutput(`Error on line ${error.line}: ${error.message}`);
  }
}
```

`error instanceof LexerError` checks only whether the specific subclass is
`LexerError` — useful if you need to handle lexer errors differently. In this
project the catch block treats all three the same way, so `instanceof
OpenMATError` is the right check.

**The TypeScript / runtime asymmetry:** TypeScript type annotations exist only
at compile time. When TypeScript compiles your code to JavaScript, every type
annotation is erased — there is no `string`, no `number`, no interface left in
the compiled output. A `try/catch` block receives an `unknown` value at runtime
because by then TypeScript has no type information available. `instanceof` is
how you recover type information at runtime. Think of it as the runtime
counterpart to TypeScript's `is` type guard: TypeScript knows the type at
compile time; `instanceof` knows it at runtime.

**SE lens — single catch, open to extension:** The `OpenMATError` base class
is the same pattern as Java's `RuntimeException` hierarchy, Python's
`ValueError`/`TypeError`/`KeyError` hierarchy, and Rust's custom error enums.
Every language that manages errors across module boundaries uses this structure.
The `catch (error instanceof OpenMATError)` branch in `main.ts` is closed to
modification — you will never need to change it when a new error type is added
to the interpreter. Adding a new `MatrixError` in a future lesson requires only
`class MatrixError extends OpenMATError` — the catch block handles it
automatically. This is the open/closed principle: open to extension (new error
types), closed to modification (catch block unchanged).

---

## Concept: Error Propagation Through the Call Stack

JavaScript's `throw`/`catch` unwinds the call stack automatically. An error
thrown deep inside `evaluate(IdentifierNode)` propagates up through every active
call frame without any intermediate code needing to handle it. Execution jumps to
the nearest enclosing `catch` block — in this project, the one in `main.ts`.

```
evaluate(IdentifierNode)    ← detects: name not in environment
    ↓  throw new RuntimeError(message, node.line)
evaluate(BinaryOpNode)      ← call stack unwinds; no code here runs
    ↓
evaluate(AssignmentNode)    ← call stack continues unwinding
    ↓
main.ts callback            ← catch block — handled here
    ↓
printOutput('Error on line N: ...')
```

The alternative — returning error values and checking at each level — requires
every function in the chain to explicitly propagate the error. That is how Go
and Rust handle errors: the advantage is that errors are explicit in the type
system; the disadvantage is that every caller must handle them or the error is
silently dropped. `throw`/`catch` propagates automatically and is the standard
JavaScript/TypeScript pattern for interpreter pipelines.

**Walkthrough for the specific case `x` (undefined variable):**

1. `tokenize('x')` produces `[IDENTIFIER:'x', EOF]` — no error. Tokenising
   reads characters, not the symbol table.
2. `parse(tokens)` produces `IdentifierNode('x')` — no error. The parser checks
   syntax, not whether variables exist.
3. `evaluate(IdentifierNode('x'), env)` reaches the `'Identifier'` case:
   `env.get('x')` returns `undefined` because no one has assigned `x`. The
   evaluator throws `new RuntimeError("Variable 'x' is not defined", node.line)`.
4. The error propagates up the call stack, bypassing every intermediate frame,
   until it reaches the `try/catch` in `main.ts`.
5. The catch block: `if (error instanceof OpenMATError)` — true. It calls
   `printOutput('Error on line ' + error.line + ': ' + error.message)`. The
   message appears in the console with the CSS error colour you defined earlier.
6. If `error` is not an `OpenMATError` — for example, a bug in the interpreter
   itself that throws a plain JavaScript `TypeError` — the `instanceof` check
   is false, and the catch falls through to a generic handler that labels it
   "Internal error". This prevents raw JavaScript implementation details from
   surfacing to the user.

**SE lens — defensive programming:** *Defensive programming* means checking for
invalid conditions at the point where they are detectable, and reporting them
with enough information to diagnose the cause. The evaluator detects "variable
not defined" when it looks up an identifier — that is the right place to throw,
and the AST node's `line` field is the information that makes the error useful.
If the error propagated silently as `NaN`, the crash would appear downstream in
an arithmetic operation, far from where the lookup failed. Early detection,
precise location, clear message: these are the three properties of a good error.

**Error UX — errors are communication:** A good error message answers three
questions: what went wrong, where it went wrong, and what the user can do about
it. `Error on line 1: Variable 'x' is not defined` answers all three: what
(variable not defined), where (line 1), implicit what to do (define x first). A
bad error message: `Cannot read properties of undefined (reading 'value')` — this
is a JavaScript internal error. It exposes implementation details and tells the
user nothing actionable. The two-branch catch block in this lesson is how you
prevent implementation details from leaking to users.

---

## Step 1 — Create `src/errors.ts`: The OpenMATError Base Class

**The problem:** The three error classes have no common type to check against,
and no shared structure for the line number field. Creating `src/errors.ts`
gives them a common parent.

**Why a new file:** `errors.ts` owns one responsibility — defining the shared
error base class. It does not own the lexer, the parser, or the evaluator. All
three of those modules will import from `errors.ts`, not from each other.
Placing the base class in its own file prevents circular imports: if `LexerError`
were defined inside `lexer.ts` and `ParseError` inside `parser.ts`, there would
be no natural home for a type that spans both. `errors.ts` is that home.

Create `src/errors.ts`:

```typescript
export class OpenMATError extends Error {
  readonly line: number;

  constructor(message: string, line: number) {
    super(message);
    this.line = line;
    // Set .name to the actual class name so stack traces say
    // 'LexerError: ...' instead of 'Error: ...'
    this.name = this.constructor.name;
  }
}
```

**Walkthrough:** When `new LexerError('Unexpected character', 3)` is called,
JavaScript first calls the `LexerError` constructor, which immediately calls
`super(message, line)` — the `OpenMATError` constructor. `OpenMATError` calls
`super(message)` — the built-in `Error` constructor — which sets `this.message`
and `this.stack`. Then `this.line = line` stores `3` in the `line` field. Then
`this.name = this.constructor.name`. At this point, `this` refers to the
`LexerError` instance, so `this.constructor` is the `LexerError` class, and
`this.constructor.name` is the string `'LexerError'`. Without this line, all
three error types would display as `Error` in the browser console regardless
of their actual class.

**Why `readonly`:** `readonly` is a TypeScript compile-time modifier that
prevents reassignment after construction. `error.line = 5` after the object
is created would be a TypeScript error. An error's detection point is fixed —
it should never be updated by the catch block or by any code that inspects it.
Immutable error data is easier to reason about: the line number you see is
always the original detection site, never overwritten by something downstream.

**Why `this.constructor.name` instead of a hardcoded string:** A hardcoded
`this.name = 'OpenMATError'` in the base class would be wrong for every
subclass — they would all display as `OpenMATError`. `this.constructor.name`
dynamically returns the name of the class that was actually instantiated. For a
`LexerError`, it returns `'LexerError'`. For a `ParseError`, `'ParseError'`.
The pattern distributes correctly through the hierarchy without any subclass
needing to override it.

**Import contract:** `errors.ts` exports only `OpenMATError`. It imports
nothing — it has no dependencies. This is intentional. If `errors.ts` imported
from `lexer.ts` or `evaluator.ts`, a circular import would occur the moment
those files imported from `errors.ts`. A base class with no dependencies is the
correct design: dependencies flow upward toward the base, never downward.

---

## Step 2 — Update LexerError, ParseError, and RuntimeError

**The problem:** All three error classes currently extend `Error` directly and
embed line numbers in the message string. They need to extend `OpenMATError`
and let the base class store the line number as a typed field.

**Update `src/lexer.ts`:**

```typescript
import { OpenMATError } from './errors';

// Before:
// export class LexerError extends Error {
//   constructor(message: string, line: number) {
//     super(`LexerError on line ${line}: ${message}`);
//   }
// }

// After:
export class LexerError extends OpenMATError {
  constructor(message: string, line: number) {
    super(message, line);   // message only — no line number embedded in the string
  }
}
```

**Walkthrough:** `import { OpenMATError } from './errors'` declares that
`lexer.ts` depends on `errors.ts` for the base class. `errors.ts` is the module
responsible for the shared error base. We import only `OpenMATError` because
that is the only thing `lexer.ts` needs from it. The `LexerError` constructor
now delegates entirely to `OpenMATError` — it does not call the `Error`
constructor directly, and it does not construct a message string. `message` and
`line` travel up to `OpenMATError`, which stores them in the right fields.

**Update `src/parser.ts`** — the same pattern:

```typescript
import { OpenMATError } from './errors';

export class ParseError extends OpenMATError {
  constructor(message: string, line: number) {
    super(message, line);
  }
}
```

**Update `src/evaluator.ts`** — same again:

```typescript
import { OpenMATError } from './errors';

export class RuntimeError extends OpenMATError {
  constructor(message: string, line: number) {
    super(message, line);
  }
}
```

Now update every `new RuntimeError(...)` call in the evaluator to include the
line number from the relevant AST node. The AST node's `line` field was
introduced in the parser in lesson 05; it records which source line the node
came from. This is the moment that field becomes load-bearing: without it, the
error would have no line number to report.

```typescript
case 'Identifier': {
  const value = env.get(node.name);
  if (value === undefined) {
    throw new RuntimeError(`Variable '${node.name}' is not defined`, node.line);
  }
  return value;
}

case 'FunctionCall':
  return evaluateBuiltin(node.name, node.args, env, node.line);
```

**Walkthrough:** When the evaluator reaches the `'Identifier'` case, it calls
`env.get(node.name)`. The `Environment` class from lesson 08 looks up the name
in its `Map`. If the name is absent, `get` returns `undefined`. The evaluator
detects this and throws `new RuntimeError(...)` with `node.line` — the line
number the parser recorded when it created this AST node. The error carries the
detection site's line number all the way to the catch block in `main.ts`.

Update `evaluateBuiltin` to accept and forward the call site's line number:

```typescript
function evaluateBuiltin(
  name:     string,
  argNodes: ASTNode[],
  env:      Environment,
  callLine: number
): EnvironmentValue {
  const args = argNodes.map(arg => evaluate(arg, env));

  switch (name) {
    case 'disp': {
      const val = args[0] ?? 0;
      console.log(formatResult(val));
      return val;
    }
    case 'sqrt': {
      const n = args[0] as number;
      if (n < 0) throw new RuntimeError('sqrt of a negative number is not real', callLine);
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
      throw new RuntimeError(`Function '${name}' is not defined`, callLine);
  }
}
```

**Walkthrough:** `evaluateBuiltin` now receives `callLine` — the line number of
the `FunctionCall` AST node in the source. Every error thrown inside
`evaluateBuiltin` passes `callLine` to `RuntimeError`. This means `sqrt(-1)`
on line 1 reports `Error on line 1: sqrt of a negative number is not real`,
and `foo()` on line 3 (where `foo` does not exist) reports
`Error on line 3: Function 'foo' is not defined`. The line number is always
the call site — the line the user typed — not an internal line in the evaluator.

**CS lens — dispatch table still present:** The `switch (name)` over built-in
functions is the dispatch table introduced in lesson 07. Naming it again: a
dispatch table maps a string key to a behaviour. Each `case` is one entry.
Adding a new built-in means adding one `case` — no other code changes. The
open/closed principle holds.

---

## Step 3 — Update the Catch Block in main.ts

**The problem:** The current catch block in `main.ts` does not know about
`OpenMATError` and cannot extract the `line` field.

Update the `catch` block in `src/main.ts`:

```typescript
import { OpenMATError } from './errors';

initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);
    const tree   = parse(tokens);
    const result = evaluate(tree, sessionEnvironment);

    if (tree.kind !== 'Assignment') {
      printOutput(formatResult(result));
    }
  } catch (error) {
    if (error instanceof OpenMATError) {
      printOutput(`Error on line ${error.line}: ${error.message}`);
    } else {
      // Unexpected interpreter bug — label it clearly so the author knows
      // to fix the interpreter, not the input
      printOutput('Internal error: ' + (error as Error).message);
    }
  }
});
```

**Walkthrough:** The `try` block runs the three pipeline stages: `tokenize`,
`parse`, `evaluate`. If any of them throws, execution jumps immediately to the
`catch` block. `catch (error)` receives the thrown value as `unknown` —
TypeScript gives it no type because by the time the catch executes, any
TypeScript annotation is gone. The `instanceof OpenMATError` check is a runtime
question: "is this object an instance of `OpenMATError` or any subclass?" If
yes, TypeScript narrows `error` to `OpenMATError` inside the `if` branch, and
`error.line` and `error.message` are accessible without a type assertion. If no
— meaning the error is a plain JavaScript `TypeError`, `RangeError`, or some
other built-in — the `else` branch labels it "Internal error" and shows the
message without a line number.

**Why `(error as Error).message` in the else branch:** TypeScript types `error`
as `unknown` in a catch block. In the `else` branch, `instanceof OpenMATError`
was false, but we still want to access `.message`. `as Error` is a type
assertion — it tells TypeScript "I know this is an `Error`." Type assertions
were introduced in lesson 03. This is a legitimate use: in the `else` branch we
know it is some kind of Error (JavaScript only throws Error objects in practice),
and we need its `.message` field.

**Why the two-branch catch:** `OpenMATError` covers all errors caused by the
user's code: syntax errors, undefined variables, type mismatches. These should
show line numbers. Any other error is a bug in the interpreter itself — a null
dereference inside the parser, an unexpected token type reaching the evaluator.
These should be labelled "Internal error" so the author (you) knows to fix the
interpreter, not the input. Mixing the two categories produces confusing output:
`Error on line 1: Cannot read properties of undefined` looks like a user error
when it is actually an interpreter bug.

### SAVE AND TRY

Type `z + 1`:
```
>> z + 1
Error on line 1: Variable 'z' is not defined
```

Type `sqrt(-1)`:
```
>> sqrt(-1)
Error on line 1: sqrt of a negative number is not real
```

Type `3 @ 4`:
```
>> 3 @ 4
Error on line 1: Unexpected character '@'
```

All three error types — `RuntimeError`, `LexerError`, and `ParseError` — now
format the same way through the same catch branch. Adding a new error type in
any pipeline stage requires only extending `OpenMATError` — the catch block in
`main.ts` never needs to change.

---

## Step 4 — Update the Tests

**The problem:** The existing tests check whether errors are thrown, but they do
not verify the hierarchy relationship or the `line` field.

Update `src/evaluator.test.ts`:

```typescript
import { OpenMATError, RuntimeError } from './errors';
import { LexerError }  from './lexer';
import { ParseError }  from './parser';

test('RuntimeError is an OpenMATError', () => {
  const err = new RuntimeError('test', 5);
  expect(err).toBeInstanceOf(OpenMATError);
  expect(err.line).toBe(5);
  expect(err.message).toBe('test');
});

test('throws RuntimeError with line number for undefined variable', () => {
  let caught: unknown;
  try { run('x + 1'); } catch (e) { caught = e; }
  expect(caught).toBeInstanceOf(RuntimeError);
  expect((caught as RuntimeError).line).toBe(1);
  expect((caught as RuntimeError).message).toContain('x');
});

test('LexerError is an OpenMATError', () => {
  const err = new LexerError('test', 3);
  expect(err).toBeInstanceOf(OpenMATError);
  expect(err.line).toBe(3);
});
```

**Walkthrough:** `expect(err).toBeInstanceOf(OpenMATError)` uses Vitest's
`toBeInstanceOf` matcher — it runs `err instanceof OpenMATError` and passes if
the result is `true`. The second test calls `run('x + 1')` (the helper function
that runs the full pipeline) in a `try/catch`. It captures whatever was thrown
in `caught`, then checks that it is a `RuntimeError` with a `line` of `1` and a
message mentioning `'x'`. The `(caught as RuntimeError)` type assertion is
needed because `caught` is `unknown`.

**Why test `instanceof` explicitly:** The hierarchy relationship is a design
guarantee — the catch block in `main.ts` depends on it. If someone accidentally
changes `RuntimeError extends OpenMATError` back to `RuntimeError extends Error`,
the catch block silently stops working: `instanceof OpenMATError` returns false,
and all runtime errors fall into the "Internal error" branch. The test pins this
guarantee in place.

Run `npx vitest run`:
- `npx` runs a locally installed package without installing it globally.
  `vitest` is the test runner installed in this project's `node_modules`.
  `run` is the Vitest subcommand that runs all tests once and exits (as opposed
  to `npx vitest` with no subcommand, which watches for file changes).
- All tests should pass and no test should print "Internal error".

---

## Connect the Pieces

```
src/errors.ts        OpenMATError (base class: .line + .message + .name)
src/lexer.ts         LexerError extends OpenMATError
src/parser.ts        ParseError extends OpenMATError
src/evaluator.ts     RuntimeError extends OpenMATError
src/main.ts          catch (error): instanceof OpenMATError → format with line number
                                    else → "Internal error"
```

All three pipeline stages throw errors that carry `line`. The single catch block
in `main.ts` handles all of them uniformly. Adding a new error type in any stage
requires only extending `OpenMATError` — the catch block needs no changes.

The inheritance hierarchy is a design boundary: errors that originate in the
interpreter pipeline are `OpenMATError` descendants; errors that originate in
the JavaScript runtime are not. The `instanceof` check is the enforcer of that
boundary at runtime.

**Real-world connection:** Java's checked exception hierarchy (`IOException`,
`RuntimeException`, `NullPointerException`) follows exactly this pattern.
Python's built-in exception tree (`BaseException` → `Exception` →
`ValueError`/`TypeError`/`KeyError`) is the same. Rust takes a different
approach — `Result<T, E>` — but custom error enums that implement the `Error`
trait serve the same purpose: a common type that callers can match on. Every
language that manages errors across module boundaries uses a hierarchy or a
sum type for the same reason: the caller needs a single type to check against,
and the type needs to carry enough information to produce a useful message.

---

## What Breaks Without This

Keep `RuntimeError` without the `line` field, extending `Error` directly:

```typescript
export class RuntimeError extends Error {
  constructor(message: string) {
    super(`RuntimeError: ${message}`);
  }
}
```

Type `z + 1`. The output is `RuntimeError: Variable 'z' is not defined`. No
line number. For a 50-line program with a deeply nested loop, you must manually
scan every line to find where `z` is used. The information was available — the
AST node has a `line` field — but it was discarded at the throw site. Structured
error classes exist to carry information from the detection point to the handling
point. Discarding it at the throw site means it is gone forever; no amount of
clever catch-block code can recover it.

Beyond the missing line number: without the `OpenMATError` base class, the catch
block in `main.ts` cannot distinguish user errors from interpreter bugs. A null
dereference inside the parser — an interpreter bug — would display with a line
number as if it were the user's fault. Worse, the raw JavaScript message
`Cannot read properties of undefined (reading 'value')` would appear in the
console, exposing implementation details that mean nothing to a user.

---

## Definition of Done

- [ ] `z + 1` shows `Error on line 1: Variable 'z' is not defined`
- [ ] `3 @ 4` shows `Error on line 1: Unexpected character '@'`
- [ ] `sqrt(-1)` shows the correct error with line 1
- [ ] `OpenMATError` is defined in `src/errors.ts` with `readonly line: number`
- [ ] `LexerError`, `ParseError`, `RuntimeError` all extend `OpenMATError`
- [ ] The catch block in `main.ts` distinguishes `OpenMATError` from unexpected
      interpreter errors and labels the latter "Internal error"
- [ ] Tests verify `instanceof OpenMATError` and the `line` field
- [ ] You can trace the full call stack from `tokenize('x')` through `evaluate`
      to the catch block in `main.ts`, naming which stage throws and why
- [ ] You can explain what `instanceof` checks at runtime and why TypeScript's
      type system cannot do the same job in a `catch` block
- [ ] You can explain why `this.constructor.name` gives each subclass the right
      `.name` automatically, and what would go wrong with a hardcoded string
- [ ] You can explain why embedding the line number in the message string is
      worse than storing it as a `readonly` field
- [ ] `git add src/errors.ts src/lexer.ts src/parser.ts src/evaluator.ts` then
      `git commit -m "Add error hierarchy: LexerError, ParseError, RuntimeError all report line numbers, JavaScript internals never shown to user"`

---

*Next: Lesson 10 — Control Flow. `if x > 5 then disp('big') end` branches on
a condition. The evaluator handles boolean values for the first time.*
