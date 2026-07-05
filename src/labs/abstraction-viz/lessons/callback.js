export default {
  id: 'callback',
  title: 'Callback',
  tag: 'Functional',
  steps: [
    {
      title: 'Define greet',
      semanticEvent: 'DefineFunction',
      code:
`function greet(name) {
  return \`Hello, \${name}!\`
}`,
      explanation: [
        'Defining `greet` establishes it as a **first-class value stored at a name**. At this moment no computation happens — instead, a function object is created in memory and bound to the identifier `greet`. That binding is the abstraction: `greet` now refers to a reusable capability that any code in scope can invoke or pass around.',
        'CS — `greet` is a first-class value. In JavaScript, functions are objects stored in memory like any other value. They can be assigned to variables, stored in arrays, and most importantly, passed as arguments to other functions. This is the property that makes callbacks possible.',
        'SE — The browser\'s `addEventListener("click", handler)` takes a function as its second argument — `handler` is a callback. Node\'s `fs.readFile(path, callback)` does the same. React\'s `onClick={handleClick}` wires a callback to a DOM event. Every one of these APIs relies on functions being passable as values, just like `greet` here.',
        'Without this: if functions could not be passed as arguments, every caller would need to embed the behaviour directly. You could not separate "when to do something" from "what to do." There would be no way to write `addEventListener` — the browser would have to enumerate every possible action in advance.',
      ],
      active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'greet — a passable function value' }],
      connections: [],
    },
    {
      title: 'Call greet — call site produces a value',
      semanticEvent: 'CallFunction',
      code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('Alice'))`,
      explanation: [
        'This step establishes the **call → produce relationship**: the call site on line 5 reaches into `greet`\'s body and creates a value (`\'Hello, Alice!\'`) that did not exist before. The connection being formed is directional — line 5 is the origin of control, line 1 is where the computation lives, and the produced value flows back.',
        'CS — This is the call stack in action. Line 5 pushes a frame for `greet` onto the stack. The return on line 2 pops the frame and yields the value. The call site (`console.log`) then receives the result. Function calls are synchronous by default — execution is fully deterministic and single-threaded.',
        'SE — In production, you trace this exact pattern when debugging: follow the call site, find where execution enters the function, identify what the return value is, trace it back. This mental model — call → enter → compute → return — is the foundation for reading any stack trace in any language.',
        'Without this: without calling the function, `greet` sits unused in memory. A function definition is a declaration of capability, not an action. Only the call (`greet(\'Alice\')`) triggers execution. Confusing definition with invocation is a common beginner bug — defining `greet` without calling it and wondering why nothing prints.',
      ],
      active: [
        { startLine: 5, endLine: 5, color: 'emerald', label: 'call site' },
        { startLine: 1, endLine: 3, color: 'indigo',  label: 'greet runs' },
      ],
      connections: [
        { fromLine: 5, toLine: 1, color: 'emerald', label: 'greet call', type: 'calls' },
      ],
    },
    {
      title: 'Define shout — same interface, different behaviour',
      semanticEvent: 'DefineFunction',
      code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}`,
      explanation: [
        'Defining `shout` establishes a **second value with the identical interface** as `greet`: one string in, one string out. This is the abstraction the callback pattern depends on — two completely different behaviours made interchangeable by sharing a signature. At this point, any code that accepts `greet` can accept `shout` in its place.',
        'CS — Same signature means the same slot in a higher-order function can accept both. This is the structural typing principle: if two functions have the same input/output shape, they are interchangeable in any position that expects that shape. Languages like TypeScript formalise this with function type annotations, but JavaScript uses it implicitly.',
        'SE — This is the Strategy pattern. `greet` and `shout` are two concrete strategies with a shared interface. Redux reducers, Express middleware, and React event handlers all follow this pattern — the framework defines a slot with a required signature, and you provide any function that matches it.',
        'Without this: if `shout` had a different signature — say, `shout(firstName, lastName)` — it could not be dropped into the same callback slot as `greet`. Consistent signatures are what make callbacks swappable. This is why production APIs document their callback signatures precisely: `(error, result) =>` in Node, `(event) =>` in DOM, `(state, action) =>` in Redux.',
      ],
      active: [
        { startLine: 1, endLine: 3, color: 'indigo', label: 'greet — interface: (name) → string' },
        { startLine: 5, endLine: 7, color: 'pink',   label: 'shout — same interface, louder body' },
      ],
      connections: [],
    },
    {
      title: 'Call both — one interface, two execution paths',
      semanticEvent: 'CallFunction',
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
        'Two calls, same input `\'Alice\'`, two separate execution paths and two different outputs. This reveals what the shared interface **enables**: the same call convention routes to completely different computation depending on which function object occupies the slot. The caller does not need to know what either function does internally.',
        'CS — This demonstrates polymorphism without inheritance. Both functions respond to the same calling convention but produce different output. This is the essence of the callback pattern: the caller decides when to invoke the behaviour; the callback decides what the behaviour is. The two concerns are fully decoupled.',
        'SE — In production, this separation is everywhere. `Array.prototype.sort` takes a comparator callback — you provide ascending or descending logic; sort handles the algorithm. `Promise.then` takes a transform callback — you provide the mapping; the Promise handles sequencing. The framework owns the when, the callback owns the what.',
        'Without this: without separate functions for each behaviour, you would need an if/else inside one monolithic function — checking a "mode" flag and branching. That approach forces the caller to know about all possible behaviours and couples them together. Adding a third behaviour (`whisper`) would require modifying the existing function rather than just defining a new one.',
      ],
      active: [
        { startLine: 9,  endLine: 9,  color: 'emerald', label: 'greet call' },
        { startLine: 10, endLine: 10, color: 'pink',    label: 'shout call' },
      ],
      connections: [
        { fromLine: 9,  toLine: 1, color: 'emerald', label: 'greet call', type: 'calls' },
        { fromLine: 10, toLine: 5, color: 'pink',    label: 'shout call', type: 'calls' },
      ],
    },
    {
      title: 'Define runWith — the function slot',
      semanticEvent: 'DefineFunction',
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
        '`runWith` establishes the **higher-order abstraction**: a function that owns the when (the call on line 10) but not the what (`fn` is unknown at definition time). The `fn` parameter is a slot — a placeholder that will be filled at call time with whatever function the caller provides. This separates the mechanism of dispatch from the choice of behaviour.',
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
      title: 'runWith(greet, \'Alice\') — greet fills the slot',
      semanticEvent: 'CallFunction',
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
        'The call on line 13 establishes the first **slot → concrete function binding**: `fn` inside `runWith` becomes an alias for `greet`. The abstraction is now visible in its full form — the call site passes `greet` as a value, `runWith` holds it at `fn`, and the dispatch on line 10 is deferred until `runWith` decides to call it. The caller owns the what; `runWith` owns the when.',
        'CS — The call stack at line 10 has three frames: `console.log` → `runWith` → `greet`. `greet` returns to `runWith`, which returns to `console.log`. The key insight: `fn` is just a reference to the `greet` function object. `fn(value)` is identical to `greet(value)` — `fn` is just another name for the same function in memory.',
        'SE — This is exactly how `[1,2,3].map(double)` works: `map` receives the `double` function as `fn`, iterates internally, and calls `fn(element)` once per element. The library code does not know what `iteratee` does — only that it is callable. This is the contract: the caller supplies the what, the library handles the how.',
        'Without this: if you could only call functions by their literal names — `greet()` or `shout()` — then `runWith` would be impossible to write generically. The ability to call through a variable (`fn(value)`) is what enables every callback-based API: event listeners, promise chains, array methods, middleware pipelines.',
      ],
      active: [
        { startLine: 13, endLine: 13, color: 'emerald', label: 'call site — greet passed as value' },
        { startLine: 9,  endLine: 11, color: 'violet',  label: 'runWith body — fn = greet' },
      ],
      connections: [
        { fromLine: 13, toLine: 9, color: 'emerald', label: 'runWith call', type: 'calls' },
        { fromLine: 13, toLine: 1, color: 'indigo',  label: 'greet passed as fn', type: 'stores' },
      ],
    },
    {
      title: 'fn(value) dispatches through the slot to greet',
      semanticEvent: 'CallFunction',
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
        '`fn(\'Alice\')` on line 10 reveals the full three-node relationship: the call site **produces** a value through `runWith`, which **dispatches** through the `fn` slot to `greet`, which **produces** `\'Hello, Alice!\'` back up the chain. Each arrow in the conceptual map corresponds to a concrete dependency — nothing in this chain could be reordered without breaking the result.',
        'CS — The dispatch mechanism is dynamic: `fn` is resolved at call time, not at definition time. `runWith` was defined without knowing what `fn` would be. This is late binding — the concrete function is bound when the call is made, not when the code is written. This is the same mechanism dynamic dispatch uses in object-oriented languages.',
        'SE — In Lodash, `_.map(collection, iteratee)` does exactly this: `iteratee` is a callback, and Lodash calls `iteratee(element, index, collection)` for each element. The library code does not know what `iteratee` does — only that it is callable. This is the contract: the caller supplies the what, the library handles the how.',
        'Without this: if `runWith` called `greet` directly on line 10 (`return greet(value)`), it would be permanently coupled to `greet`. The next step — swapping in `shout` — would be impossible without rewriting `runWith`. The whole utility of the pattern is that the dispatch target is not known at write time.',
      ],
      active: [
        { startLine: 13, endLine: 13, color: 'emerald', label: 'result arrives at call site' },
        { startLine: 10, endLine: 10, color: 'violet',  label: 'fn("Alice") — dispatches through slot' },
        { startLine: 1,  endLine: 3,  color: 'indigo',  label: 'greet produces the result' },
      ],
      connections: [
        { fromLine: 13, toLine: 9,  color: 'emerald', label: 'runWith call', type: 'calls' },
        { fromLine: 10, toLine: 1,  color: 'indigo',  label: 'fn dispatches to greet', type: 'calls' },
        { fromLine: 2,  toLine: 13, color: 'indigo',  label: 'return value flows to call site', type: 'produces' },
      ],
    },
    {
      title: 'Swap the callback — same slot, new behaviour',
      semanticEvent: 'CallFunction',
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
        'Line 14 passes `shout` into the same `fn` slot. `runWith` is unchanged — the abstraction it established (a generic dispatch mechanism) is now being **reused with a different concrete function**. This step reveals the payoff: decoupling the slot definition from the function that fills it means `runWith` is closed for modification but open for extension. You extend the system by adding new callbacks, not by changing existing code.',
        'CS — This is the entire callback pattern in one step: the higher-order function (`runWith`) is fixed; the injected behaviour (`fn`) is variable. Open/Closed Principle — `runWith` is closed for modification but open for extension via the callback parameter. Adding `whisper` as a third option requires no changes to `runWith`.',
        'SE — Every framework\'s customisation points work this way. Express `app.use(middleware)` swaps in your function at the `fn` slot. React `<Component onClick={handler}>` swaps in your handler. Vitest `test(\'name\', fn)` swaps in your test function. The framework provides the harness; you provide the injected function. The mechanism is always the same.',
        'Without this: without the ability to swap the callback, you would need `runWithGreet(value)` and `runWithShout(value)` — separate wrappers for every behaviour. Every new behaviour multiplies the wrapper count. This is why event-driven code without callbacks degrades into unmaintainable combinatorial branching.',
      ],
      active: [
        { startLine: 14, endLine: 14, color: 'pink',   label: 'fn = shout — slot filled differently' },
        { startLine: 9,  endLine: 11, color: 'violet', label: 'runWith — byte-for-byte unchanged' },
        { startLine: 5,  endLine: 7,  color: 'pink',   label: 'shout — dispatched through same slot' },
      ],
      connections: [
        { fromLine: 14, toLine: 9,  color: 'pink', label: 'runWith call', type: 'calls' },
        { fromLine: 10, toLine: 5,  color: 'pink', label: 'fn dispatches to shout', type: 'calls' },
      ],
    },
  ],
}
