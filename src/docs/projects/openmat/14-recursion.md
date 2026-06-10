# OpenMAT — Lesson 14 — Recursion

## What You Will Build

By the end of this lesson, OpenMAT can evaluate recursive user-defined functions:

```
>> function result = factorial(n)
     if n <= 1
       result = 1
     else
       result = n * factorial(n - 1)
     end
   end
>> factorial(5)
120
```

And:

```
>> function result = fib(n)
     if n <= 1
       result = n
     else
       result = fib(n - 1) + fib(n - 2)
     end
   end
>> fib(10)
55
```

If recursion goes too deep (more than 1,000 levels), the evaluator throws a
`RuntimeError` with a clear message before the JavaScript stack overflows.

---

## What You Need to Know First

Lessons 01–13 complete. User-defined functions work: `FunctionDefNode` stores the
function's name, parameter list, return variable name, and body. `callUserFunction`
in `evaluator.ts` creates a fresh `Environment` for each call, binds the arguments
to the parameter names, executes the function body, and returns the value of the
return variable. The `Environment` chain (lexical scoping) and the `RuntimeError`
hierarchy are both established.

---

## Concept: Recursion

**What it is:**

A function is *recursive* when it calls itself as part of its own computation.
Every recursive function has two parts:

1. **Base case**: a condition under which the function returns a value directly,
   without calling itself again. This stops the recursion.
2. **Recursive case**: the function calls itself with a smaller or simpler input,
   making progress toward the base case.

For `factorial(n) = n × (n−1) × (n−2) × … × 1`:

```
factorial(0) = 1                     ← base case
factorial(n) = n × factorial(n − 1)  ← recursive case
```

In OpenMAT:
```
function result = factorial(n)
  if n <= 1
    result = 1                       ← base case
  else
    result = n * factorial(n - 1)    ← recursive case
  end
end
```

**CS lens — the call stack:**

Each recursive call creates a new stack frame — a region of memory holding the
local variables and return address for one call. (Stack frames were introduced in
lesson 13 when we first looked at `callUserFunction`.) For `factorial(5)`:

```
factorial(5)  → n=5, waits for factorial(4)
  factorial(4)  → n=4, waits for factorial(3)
    factorial(3)  → n=3, waits for factorial(2)
      factorial(2)  → n=2, waits for factorial(1)
        factorial(1)  → n=1, returns 1  ← base case
      ← 2 × 1 = 2
    ← 3 × 2 = 6
  ← 4 × 6 = 24
← 5 × 24 = 120
```

Each arrow is a return. The stack grows to depth 5, then collapses as each call
returns. The maximum stack depth for `factorial(n)` is `n` frames.

**Why infinite recursion is different from an infinite loop:**

An infinite loop (`while 1`) occupies the call stack at a fixed depth — the same
frame runs forever. An infinite recursion grows the call stack without bound, adding
a new frame on every call. JavaScript has a fixed maximum call stack size (typically
10,000–15,000 frames on V8, the JavaScript engine in Chrome and Node). When it is
exhausted, the engine throws:

```
RangeError: Maximum call stack size exceeded
```

This is an interpreter crash, not a clean error. It carries no line number, no
function name, and no indication that the problem was in OpenMAT code rather than
the interpreter itself. The 1,000-frame limit in OpenMAT catches the problem before
the crash and reports a meaningful `RuntimeError`.

---

## Concept: Mathematical Induction — The Proof Structure Matches the Code

Mathematical induction is a proof technique with two steps:

1. **Base step**: prove the statement is true for the smallest case (usually n = 0
   or n = 1).
2. **Inductive step**: prove that if the statement is true for n = k, it must also
   be true for n = k + 1.

These two steps together prove the statement for every natural number.

Recursion is computational induction: base case and inductive step expressed as
code. For `factorial`, the proof and the code are the same structure:

- **Base**: `factorial(0) = 1` — base case in code: `if n <= 1, result = 1`
- **Inductive**: if `factorial(k) = k!`, then `factorial(k+1) = (k+1) * factorial(k) = (k+1)!`
  — recursive case in code: `result = n * factorial(n-1)`

The code *is* the proof. This is not a coincidence. Recursive algorithms are
computational proofs by induction, and asking "does this recursion terminate?" is
exactly the same as asking "does this induction have a base case?" A recursive
function without a base case is a proof that never bottoms out — it has no starting
truth to build from, and the chain of calls never stops.

---

## Step 1 — Add a Call Depth Counter

**The problem:**

`callUserFunction` in `evaluator.ts` can call itself recursively. Without a depth
limit, deep recursion overflows JavaScript's call stack with no useful error message.

The simplest approach is a module-level counter that is incremented on every
function call and decremented when the call returns.

**Module-level state:**

`let callDepth = 0` declared at the top level of `evaluator.ts` (outside any
function) is module-level mutable state. In TypeScript/JavaScript, module-level
variables persist for the life of the module — which in a browser means the life of
the page. Every call to `callUserFunction` in the same page session uses the same
`callDepth` variable.

This is a deliberate design choice: we want to track total recursion depth across
all active function calls, not per-function depth. If `factorial` calls `fib` which
calls `fib` again, all three calls contribute to the same counter.

The trade-off: module-level state is harder to test in isolation because you must
reset it between tests, and it cannot be safely shared across concurrent requests.
In a browser this does not matter — only one piece of JavaScript runs at a time. In
a server-side evaluator handling multiple simultaneous users, module-level state
would be a correctness bug. Here, it is the right choice.

**`try/finally` — first appearance:**

`try { ... } finally { ... }` guarantees that the `finally` block runs whether the
`try` block succeeds or throws. This is a JavaScript/TypeScript language construct
for guaranteed cleanup.

When `callUserFunction` runs the function body, the body might throw a
`RuntimeError` (for example, if a variable inside the function is not defined). If
that happens, execution jumps out of the `try` block immediately — but before the
error propagates up the call stack, the `finally` block runs. `callDepth -= 1` in
`finally` ensures the counter is always decremented, even when the function fails.

Without `finally`, consider what happens during a call like `factorial(5)` that
triggers an error inside `factorial(3)`. The counter is at 3 when the error throws.
It never decrements back to 2 or 1. The next call starts with `callDepth` already
at 3, as though three other calls are still in progress. Eventually, legitimate
calls start failing at the wrong depth — the counter has drifted out of sync with
reality.

`finally` is the standard TypeScript/JavaScript mechanism for cleanup that must
happen regardless of success or failure. You will see it used for closing file
handles, releasing locks, and cleaning up resources throughout production code.

Update `src/evaluator.ts`:

```typescript
const MAX_CALL_DEPTH = 1000;
let callDepth = 0;

function callUserFunction(
  funcDef:   FunctionDefNode,
  argNodes:  ASTNode[],
  callerEnv: Environment
): EnvironmentValue {
  callDepth += 1;

  if (callDepth > MAX_CALL_DEPTH) {
    callDepth -= 1;   // restore before throwing
    throw new RuntimeError(
      `maximum call depth exceeded (${MAX_CALL_DEPTH}) — possible infinite recursion in '${funcDef.name}'`,
      funcDef.line
    );
  }

  try {
    // ... existing callUserFunction body from lesson 13 ...
    const argValues = argNodes.map(arg => evaluate(arg, callerEnv));
    const funcEnv   = new Environment(callerEnv);
    funcDef.params.forEach((p, i) => funcEnv.set(p, argValues[i] ?? 0));
    for (const stmt of funcDef.body) evaluate(stmt, funcEnv);

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
  } finally {
    callDepth -= 1;   // always decrement, even if an error is thrown
  }
}
```

**Walkthrough — what this code does when `factorial(3)` is called:**

- Call 1: `callDepth` increments from 0 to 1. `n = 3`. `3 > 1` — recursive case.
  The body evaluates `result = 3 * factorial(2)`, which calls `callUserFunction`
  again.
- Call 2: `callDepth` increments from 1 to 2. `n = 2`. `2 > 1` — recursive case.
  Calls `factorial(1)`.
- Call 3: `callDepth` increments from 2 to 3. `n = 1`. `1 <= 1` — base case.
  `result = 1`. The `try` block completes without error. `finally` runs:
  `callDepth` decrements from 3 to 2. Returns `1`.
- Back in call 2: `result = 2 * 1 = 2`. The `try` block completes. `finally` runs:
  `callDepth` decrements from 2 to 1. Returns `2`.
- Back in call 1: `result = 3 * 2 = 6`. The `try` block completes. `finally` runs:
  `callDepth` decrements from 1 to 0. Returns `6`.

Result: `6`. Maximum depth reached: 3 frames. After the call, `callDepth` is back
at 0, exactly as it was before.

**CS lens — recursion and the interpreter's own recursion:**

Recursion works here because the evaluator is itself recursive. `evaluate` calls
`callUserFunction`, which calls `evaluate` again on the function body. The same
mechanism that handles nested arithmetic (`3 + (4 * 2)`) handles nested function
calls. When `factorial(5)` evaluates its body and reaches `n * factorial(n - 1)`,
evaluating `factorial(n - 1)` is a `FunctionCall` node — the evaluator calls
`callUserFunction` again, with `n = 4`. That inner call has its own `funcEnv` with
its own `n = 4`. It is completely independent of the outer call's scope. The scope
chain is not required to make recursion work — it works because each call creates
a fresh `Environment` from lesson 05.

**SE lens — single responsibility of the depth counter:**

`callDepth` and `MAX_CALL_DEPTH` live at the module level rather than inside
`callUserFunction` because they must persist across calls. Their responsibility is
narrow: prevent JavaScript stack exhaustion. They do not participate in evaluation,
scoping, or error messages beyond the depth-exceeded case. This is separation of
concerns — the depth guard is one concern, the function execution is another.

---

## Step 2 — Write the Tests First (Red)

Add to `src/evaluator.test.ts`:

```typescript
test('factorial(5) = 120', () => {
  const env = new Environment();
  run(`
    function result = factorial(n)
      if n <= 1
        result = 1
      else
        result = n * factorial(n - 1)
      end
    end
  `, env);
  expect(run('factorial(5)', env)).toBe(120);
  expect(run('factorial(1)', env)).toBe(1);
  expect(run('factorial(0)', env)).toBe(1);
});

test('fib(10) = 55', () => {
  const env = new Environment();
  run(`
    function result = fib(n)
      if n <= 1
        result = n
      else
        result = fib(n-1) + fib(n-2)
      end
    end
  `, env);
  expect(run('fib(10)', env)).toBe(55);
  expect(run('fib(0)', env)).toBe(0);
  expect(run('fib(1)', env)).toBe(1);
});

test('infinite recursion throws RuntimeError within call limit', () => {
  const env = new Environment();
  run('function result = inf(n)\n  result = inf(n)\nend', env);
  expect(() => run('inf(1)', env)).toThrow('maximum call depth exceeded');
});
```

Run `npx vitest run`:

- `npx` runs the Vitest test runner without requiring a global install. `vitest run`
  executes all tests once and exits (as opposed to `vitest` alone, which watches for
  file changes).

All three tests should fail at this point — `callUserFunction` does not yet have
the depth counter, so infinite recursion crashes the test process rather than
throwing cleanly. That crash is the red state: the tests reveal a real defect.

---

## Step 3 — Enable Recursion (Green)

The implementation change in step 1 is all that is needed. `callUserFunction`
already supports recursive calls — when the function body evaluates
`factorial(n - 1)`, that triggers another `FunctionCall` evaluation, which
calls `callUserFunction` again with a new stack frame.

Add the call depth counter from step 1 to `evaluator.ts`.

Run `npx vitest run` — all three tests should now pass.

**Why `fib` is slower than `factorial`:**

`fib(10)` calls `fib(9)` and `fib(8)`. `fib(9)` calls `fib(8)` and `fib(7)`.
Notice that `fib(8)` is computed twice. For `fib(n)`, the number of calls grows
exponentially — O(2ⁿ). `fib(40)` would make over a billion calls. This is a
well-known property of naive recursive Fibonacci and is the standard motivation for
memoisation (caching previously computed values). The 1,000-frame depth limit is not
the binding constraint here — time is. For now this is fine: `fib(10)` is fast
enough to observe in the REPL.

---

## Step 4 — Trace Through a Recursive Call

Type this manually in the REPL:

```
>> factorial(3)
```

The call chain:
```
callUserFunction(factorial, [3])
  funcEnv: { n=3, result=? }
  evaluates: result = 3 * factorial(2)
    callUserFunction(factorial, [2])
      funcEnv: { n=2, result=? }
      evaluates: result = 2 * factorial(1)
        callUserFunction(factorial, [1])
          funcEnv: { n=1, result=? }
          evaluates: if n <= 1 → result = 1
          returns: 1
        ← factorial(1) = 1
      result = 2 * 1 = 2
      returns: 2
    ← factorial(2) = 2
  result = 3 * 2 = 6
  returns: 6
← factorial(3) = 6
```

Write this trace on paper. Then trace `factorial(4)` and `factorial(5)` using the
same structure. The depth of the call stack equals the value of `n`.

Notice: each `funcEnv` is independent. The `n = 3` in the outermost frame and the
`n = 2` in the next frame coexist at the same time because they live in separate
`Environment` objects. This is why the fresh-`Environment`-per-call design from
lesson 13 is the foundation that makes recursion possible.

---

## Connect the Pieces

The depth counter is the only new mechanism in this lesson. Recursion itself was
already possible — it was just unsafe. `callUserFunction` calls `evaluate`, and
`evaluate` can call `callUserFunction` again. The same mutual recursion that handles
nested expressions handles nested function calls. The counter converts a potential
JavaScript engine crash into a clean `RuntimeError` with the function name and line
number.

Module-level state (`callDepth`) was the right choice here because we need a single
counter shared across all active calls in the same page session. `try/finally`
ensures the counter stays accurate even when calls fail. Together, these two
mechanisms give the evaluator a well-defined invariant: `callDepth` equals the
number of currently executing `callUserFunction` invocations on the call stack, at
all times.

---

## Real-World Connection

Recursive algorithms are pervasive in production software:

- **File system traversal**: walking a directory tree means visiting a directory,
  then recursively visiting each subdirectory. The Unix `find` command and Node's
  `fs.readdir` are both implemented this way.
- **DOM traversal**: React's reconciler traverses the component tree recursively
  when computing what changed between renders. Each component is a node; its
  children are subnodes.
- **JSON parsing**: JSON objects can contain nested JSON objects to arbitrary depth.
  Every production JSON parser uses recursive descent — the same parsing strategy
  as OpenMAT's own parser.
- **Tree-based data structures**: binary search trees, tries (prefix trees), and
  heaps all define their operations (insert, search, delete) recursively. An
  in-order tree traversal is a three-line recursive function.

The call depth limit in production systems varies by language: Python's default
recursion limit is 1,000 (the same as OpenMAT). JavaScript enforces no explicit
limit, but the V8 engine's stack typically allows 10,000–15,000 frames before
crashing. Tail-call optimisation — which Scheme requires and some languages support
— converts a specific class of recursive calls (where the recursive call is the last
operation in the function) into loops, eliminating stack growth entirely. OpenMAT
does not implement tail-call optimisation; the 1,000-frame limit is the guard.

---

## What Breaks Without This

Remove the call depth limit:

```typescript
function callUserFunction(funcDef, argNodes, callerEnv) {
  // No depth check
  const argValues = ...
  // ...
}
```

Define `inf(n) = inf(n)` and call `inf(1)`. The JavaScript engine throws:
```
RangeError: Maximum call stack size exceeded
```

This error has no line number, no indication which function caused it, and no
mention of OpenMAT. The user sees a JavaScript internals error instead of a
meaningful message. The 1,000-frame limit converts this to:
```
RuntimeError on line 1: maximum call depth exceeded (1000) — possible infinite
recursion in 'inf'
```

A meaningful error with the function name and a line number.

Also consider what happens if `finally` is removed and an error is thrown inside a
recursive call. Suppose `factorial(5)` triggers a `RuntimeError` at depth 3.
`callDepth` is 3. The error propagates, but the three `callDepth -= 1` decrements
in the now-skipped `finally` blocks never run. The counter stays at 3. The next
call to any function starts with `callDepth = 3`, as though three phantom calls are
still active. Legitimate calls hit the depth limit 3 calls earlier than they should.
Eventually the depth counter is so far out of sync that all function calls fail.
`finally` is not optional.

---

## Definition of Done

- [ ] `factorial(5)` → `120`, `factorial(1)` → `1`, `factorial(0)` → `1`
- [ ] `fib(10)` → `55`
- [ ] Infinite recursion throws `RuntimeError` with the function name
- [ ] The call depth counter uses `try/finally` to always decrement
- [ ] All regression tests from lessons 04–13 still pass
- [ ] You can trace `factorial(4)` on paper, drawing the call stack at its
      maximum depth
- [ ] You can explain the base case and recursive case for both `factorial` and
      `fib`
- [ ] You can explain why `try/finally` is needed and what happens without it
- [ ] You can explain why `callDepth` is module-level state and what the trade-off is
- [ ] You can state the inductive proof for `factorial` and explain why the code
      structure and the proof structure are the same
- [ ] `git add src/evaluator.ts src/evaluator.test.ts` then `git commit -m "Add recursion: callDepth counter prevents stack overflow, factorial and fib produce correct results"`

---

*Next: Lesson 15 — Standard Library. `sin`, `cos`, `log`, `sqrt` and more
built-in functions, organised as a dispatch table. Degree and radian mode.*
