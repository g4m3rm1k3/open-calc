export default   {
    id: 'callback',
    title: 'Callback',
    tag: 'Functional',
    steps: [
      {
        title: 'Define greet',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}`,
        explanation: [
          '`greet` takes a `name` argument on line 1 and immediately executes line 2: the template literal `` `Hello, ${name}!` `` evaluates `name` and returns the completed string. The function is defined here but not called — no execution happens at definition time.',
          'CS — `greet` is a first-class value. In JavaScript, functions are objects stored in memory like any other value. They can be assigned to variables, stored in arrays, and most importantly, passed as arguments to other functions. This is the property that makes callbacks possible.',
          'SE — The browser\'s `addEventListener("click", handler)` takes a function as its second argument — `handler` is a callback. Node\'s `fs.readFile(path, callback)` does the same. React\'s `onClick={handleClick}` wires a callback to a DOM event. Every one of these APIs relies on functions being passable as values, just like `greet` here.',
          'Without this: if functions could not be passed as arguments, every caller would need to embed the behaviour directly. You could not separate "when to do something" from "what to do." There would be no way to write `addEventListener` — the browser would have to enumerate every possible action in advance.',
        ],
        active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'greet — a passable function value' }],
        connections: [],
      },
      {
        title: 'Call greet — trace execution',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('Alice'))`,
        explanation: [
          'Line 5 calls `greet(\'Alice\')`. Execution jumps to line 1 — `name` receives `\'Alice\'`. Line 2 evaluates the template literal with `name = \'Alice\'` and returns `\'Hello, Alice!\'`. The return value travels back to line 5 where `console.log` prints it.',
          'CS — This is the call stack in action. Line 5 pushes a frame for `greet` onto the stack. The return on line 2 pops the frame and yields the value. The call site (`console.log`) then receives the result. Function calls are synchronous by default — execution is fully deterministic and single-threaded.',
          'SE — In production, you trace this exact pattern when debugging: follow the call site, find where execution enters the function, identify what the return value is, trace it back. This mental model — call → enter → compute → return — is the foundation for reading any stack trace in any language.',
          'Without this: without calling the function, `greet` sits unused in memory. A function definition is a declaration of capability, not an action. Only the call (`greet(\'Alice\')`) triggers execution. Confusing definition with invocation is a common beginner bug — defining `greet` without calling it and wondering why nothing prints.',
        ],
        active: [
          { startLine: 5, endLine: 5, color: 'emerald', label: 'call site' },
          { startLine: 1, endLine: 3, color: 'indigo',  label: 'greet runs' },
        ],
        connections: [
          { fromLine: 5, toLine: 1, color: 'emerald', label: 'enters' },
        ],
      },
      {
        title: 'Define shout — same shape',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}`,
        explanation: [
          '`shout` on line 5 has the exact same signature as `greet`: one string argument in, one string out. Line 6 calls `name.toUpperCase()` and embeds the result in a template literal. The body is louder; the contract — one string in, one string out — is identical.',
          'CS — Same signature means the same slot in a higher-order function can accept both. This is the structural typing principle: if two functions have the same input/output shape, they are interchangeable in any position that expects that shape. Languages like TypeScript formalise this with function type annotations, but JavaScript uses it implicitly.',
          'SE — This is the Strategy pattern. `greet` and `shout` are two concrete strategies with a shared interface. Redux reducers, Express middleware, and React event handlers all follow this pattern — the framework defines a slot with a required signature, and you provide any function that matches it.',
          'Without this: if `shout` had a different signature — say, `shout(firstName, lastName)` — it could not be dropped into the same callback slot as `greet`. Consistent signatures are what make callbacks swappable. This is why production APIs document their callback signatures precisely: `(error, result) =>` in Node, `(event) =>` in DOM, `(state, action) =>` in Redux.',
        ],
        active: [
          { startLine: 5, endLine: 7, color: 'pink', label: 'shout — same shape, louder' },
        ],
        connections: [],
      },
      {
        title: 'Call both — same input, different behaviour',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

console.log(greet('Alice'))
console.log(shout('Alice'))`,
        explanation: [
          'Line 9 calls `greet(\'Alice\')` — execution enters at line 1, returns `\'Hello, Alice!\'`. Line 10 calls `shout(\'Alice\')` — execution enters at line 5, calls `\'Alice\'.toUpperCase()` which returns `\'ALICE\'`, then returns `\'HEY ALICE!\'`. Same input `\'Alice\'`, two completely different outputs.',
          'CS — This demonstrates polymorphism without inheritance. Both functions respond to the same calling convention but produce different output. This is the essence of the callback pattern: the caller decides when to invoke the behaviour; the callback decides what the behaviour is. The two concerns are fully decoupled.',
          'SE — In production, this separation is everywhere. `Array.prototype.sort` takes a comparator callback — you provide ascending or descending logic; sort handles the algorithm. `Promise.then` takes a transform callback — you provide the mapping; the Promise handles sequencing. The framework owns the when, the callback owns the what.',
          'Without this: without separate functions for each behaviour, you would need an if/else inside one monolithic function — checking a "mode" flag and branching. That approach forces the caller to know about all possible behaviours and couples them together. Adding a third behaviour (`whisper`) would require modifying the existing function rather than just defining a new one.',
        ],
        active: [
          { startLine: 9,  endLine: 9,  color: 'emerald', label: 'greet call' },
          { startLine: 10, endLine: 10, color: 'pink',    label: 'shout call' },
        ],
        connections: [
          { fromLine: 9,  toLine: 1, color: 'emerald', label: 'enters greet' },
          { fromLine: 10, toLine: 5, color: 'pink',    label: 'enters shout' },
        ],
      },
      {
        title: 'Define runWith — the function slot',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

function runWith(fn, value) {
  return fn(value)
}`,
        explanation: [
          '`runWith` on line 9 takes two arguments: `fn` — a function — and `value` — any value. Line 10 calls `fn(value)` and returns the result. `runWith` does not know or inspect `fn`. It holds a slot — `fn` is whatever function you choose to put there. The dispatch on line 10 calls through the slot.',
          'CS — `fn` is a higher-order function parameter. Functions that accept other functions as arguments are called higher-order functions. `runWith` is the simplest possible higher-order function: take a function, take a value, apply the function to the value. This is function application made explicit.',
          'SE — Every async pattern in JavaScript is built on this. `setTimeout(fn, 0)` holds your function and calls it later. `Promise.then(fn)` holds your function and calls it when resolved. `Array.prototype.map(fn)` holds your function and calls it once per element. `runWith` is the minimal implementation of that same idea.',
          'Without this: without `fn` as a parameter, `runWith` would have to call a specific hardcoded function — `greet(value)`. You would need `runWithGreet` and `runWithShout` as separate functions. Every new callback would require a new wrapper. The whole point of the pattern is that one generic slot can accept any function.',
        ],
        active: [
          { startLine: 9,  endLine: 11, color: 'violet', label: 'runWith — fn is the slot' },
        ],
        connections: [],
      },
      {
        title: 'runWith(greet, \'Alice\') — enters runWith',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

function runWith(fn, value) {
  return fn(value)
}

console.log(runWith(greet, 'Alice'))`,
        explanation: [
          'Line 13 calls `runWith(greet, \'Alice\')`. `fn` receives the `greet` function object; `value` receives `\'Alice\'`. Execution enters `runWith` at line 9. Line 10 runs `fn(\'Alice\')` — which dispatches to `greet`. `greet` returns `\'Hello, Alice!\'`, which `runWith` returns, which `console.log` prints.',
          'CS — The call stack at line 10 has three frames: `console.log` → `runWith` → `greet`. `greet` returns to `runWith`, which returns to `console.log`. The key insight: `fn` is just a reference to the `greet` function object. `fn(value)` is identical to `greet(value)` — `fn` is just another name for the same function in memory.',
          'SE — This is exactly how `[1,2,3].map(double)` works: `map` receives the `double` function as `fn`, iterates internally, and calls `fn(element)` once per element. `runWith` is `map` for a single value. The mechanism is identical — passing a function by reference and calling it through the parameter name.',
          'Without this: if you could only call functions by their literal names — `greet()` or `shout()` — then `runWith` would be impossible to write generically. The ability to call through a variable (`fn(value)`) is what enables every callback-based API: event listeners, promise chains, array methods, middleware pipelines.',
        ],
        active: [
          { startLine: 13, endLine: 13, color: 'emerald', label: 'call site' },
          { startLine: 9,  endLine: 11, color: 'violet',  label: 'runWith body — fn = greet' },
        ],
        connections: [
          { fromLine: 13, toLine: 9, color: 'emerald', label: 'enters' },
        ],
      },
      {
        title: 'fn(value) dispatches to greet',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

function runWith(fn, value) {
  return fn(value)
}

console.log(runWith(greet, 'Alice'))`,
        explanation: [
          'Line 10 evaluates `fn(\'Alice\')`. At this point `fn` holds a reference to `greet`. JavaScript resolves the call: enters `greet` at line 1 with `name = \'Alice\'`. Line 2 builds and returns `\'Hello, Alice!\'`. That return travels back to line 10, then line 13, and `console.log` prints it. Three stack frames collapsed in sequence.',
          'CS — The dispatch mechanism is dynamic: `fn` is resolved at call time, not at definition time. `runWith` was defined without knowing what `fn` would be. This is late binding — the concrete function is bound when the call is made, not when the code is written. This is the same mechanism dynamic dispatch uses in object-oriented languages.',
          'SE — In Lodash, `_.map(collection, iteratee)` does exactly this: `iteratee` is a callback, and Lodash calls `iteratee(element, index, collection)` for each element. The library code does not know what `iteratee` does — only that it is callable. This is the contract: the caller supplies the what, the library handles the how.',
          'Without this: if `runWith` called `greet` directly on line 10 (`return greet(value)`), it would be permanently coupled to `greet`. The next step — swapping in `shout` — would be impossible without rewriting `runWith`. The whole utility of the pattern is that the dispatch target is not known at write time.',
        ],
        active: [
          { startLine: 13, endLine: 13, color: 'emerald', label: 'result arrives' },
          { startLine: 10, endLine: 10, color: 'violet',  label: 'fn("Alice") — dispatches' },
          { startLine: 1,  endLine: 3,  color: 'indigo',  label: 'greet runs inside runWith' },
        ],
        connections: [
          { fromLine: 13, toLine: 9,  color: 'emerald', label: 'enters runWith' },
          { fromLine: 10, toLine: 1,  color: 'indigo',  label: 'fn is greet' },
        ],
      },
      {
        title: 'Swap the callback — fn is now shout',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

function runWith(fn, value) {
  return fn(value)
}

console.log(runWith(greet, 'Alice'))
console.log(runWith(shout, 'Alice'))`,
        explanation: [
          'Line 14 passes `shout` as `fn` instead of `greet`. `runWith` is byte-for-byte identical — same body, same line 10. But `fn` now holds a reference to `shout`. `fn(\'Alice\')` dispatches to line 5 this time. `\'Alice\'.toUpperCase()` returns `\'ALICE\'`, the template returns `\'HEY ALICE!\'`, `console.log` prints it. Same `runWith`, two completely different execution paths.',
          'CS — This is the entire callback pattern in one step: the higher-order function (`runWith`) is fixed; the injected behaviour (`fn`) is variable. Open/Closed Principle — `runWith` is closed for modification but open for extension via the callback parameter. Adding `whisper` as a third option requires no changes to `runWith`.',
          'SE — Every framework\'s customisation points work this way. Express `app.use(middleware)` swaps in your function at the `fn` slot. React `<Component onClick={handler}>` swaps in your handler. Vitest `test(\'name\', fn)` swaps in your test function. The framework provides the harness; you provide the injected function. The mechanism is always the same.',
          'Without this: without the ability to swap the callback, you would need `runWithGreet(value)` and `runWithShout(value)` — separate wrappers for every behaviour. Every new behaviour multiplies the wrapper count. This is why event-driven code without callbacks degrades into unmaintainable combinatorial branching.',
        ],
        active: [
          { startLine: 14, endLine: 14, color: 'pink',   label: 'swap — fn = shout' },
          { startLine: 9,  endLine: 11, color: 'violet', label: 'runWith — unchanged' },
          { startLine: 5,  endLine: 7,  color: 'pink',   label: 'shout runs this time' },
        ],
        connections: [
          { fromLine: 14, toLine: 9,  color: 'pink', label: 'enters runWith' },
          { fromLine: 10, toLine: 5,  color: 'pink', label: 'fn is shout' },
        ],
      },
    ],
  }
