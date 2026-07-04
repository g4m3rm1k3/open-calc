export default {
  id: 'closures',
  title: 'Closures',
  tag: 'Scope',
  steps: [
    {
      title: 'The factory skeleton — a function that builds counters',
      code:
`function makeCounter() {
}`,
      explanation: [
        'makeCounter is a factory function — calling it will eventually produce a counter object. Right now the body is empty. Calling makeCounter() returns undefined because there is no return statement. Nothing is logged yet.',
        'The critical idea: makeCounter is not the counter. Calling makeCounter() creates a new counter. If you call it twice you get two independent counters. This is the factory pattern — one function, many independent instances.',
        'CS — A factory function is a function whose job is to construct and return other functions or objects. It contrasts with classes, which use the new keyword. Both produce instances. Factory functions are simpler and more flexible; you will see why in the next steps.',
        'SE — makeCounter will become a privacy mechanism: the state will live inside makeCounter\'s scope where nothing external can touch it. This is closure-based encapsulation — the same pattern used in React\'s useState, in Node.js event emitters, and in module systems.',
      ],
      active: [
        { startLine: 1, endLine: 2, color: 'indigo', label: 'factory skeleton — returns nothing yet' },
      ],
      connections: [],
    },
    {
      title: 'Private state — let count lives inside the factory',
      code:
`function makeCounter() {
  let count = 0
  // count is private — no code outside makeCounter can read or overwrite it
}`,
      explanation: [
        'let count = 0 is declared inside makeCounter. It is a local variable — it lives in makeCounter\'s lexical scope and is invisible everywhere else. No external code can read it, write to it, or even know it exists.',
        'Calling makeCounter() runs the body: allocates a scope, creates count = 0 in that scope, then returns (undefined still — no return statement). The scope is destroyed. If you call makeCounter() again, a fresh scope is created with a new, independent count = 0.',
        'CS — This is the core of closure-based encapsulation. Function scope provides structural privacy: count is not just "conventionally private" — it is physically inaccessible from outside the function. This is the same guarantee that a Java private field provides, achieved with no class, no keyword, just lexical scoping.',
        'SE — Global variables are the most common source of subtle bugs in JavaScript: any file, any module, any third-party library can overwrite them. Moving count inside makeCounter makes corruption structurally impossible. The closures lesson is really about trading fragile global state for safe local state.',
      ],
      active: [
        { startLine: 2, endLine: 2, color: 'violet', label: 'count = 0 — private, only visible inside makeCounter' },
        { startLine: 3, endLine: 3, color: 'indigo', label: 'comment: external code has no path to count' },
      ],
      connections: [],
    },
    {
      title: 'increment — a function that closes over count',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }
  // increment sees count via the scope chain — this is the closure forming
}`,
      explanation: [
        'increment is defined inside makeCounter. It references count, which is NOT in increment\'s own scope — but it IS in makeCounter\'s scope, one level up. The scope chain lookup finds count there. increment can both read and mutate count.',
        'This is a closure forming: increment is a function paired with a reference to the count variable in makeCounter\'s scope. When makeCounter returns and its stack frame is gone, count will stay alive in the heap as long as anything holds a reference to increment.',
        'CS — Formally: a closure = function + environment. The environment is the set of outer variable bindings the function references. JavaScript closures capture by reference (not by value) — the closure holds a pointer to the binding slot itself, so any mutation is visible across calls.',
        'SE — React\'s useState setter is a closure: const [count, setCount] = useState(0). setCount closes over the internal state slot. Event handlers are closures: a button\'s onClick handler closes over the component\'s props and state. Every async callback you write is a closure over the variables in its enclosing scope.',
      ],
      active: [
        { startLine: 4, endLine: 7, color: 'emerald', label: 'increment — closes over the count binding' },
        { startLine: 5, endLine: 5, color: 'pink', label: 'count++ — reads and writes the outer binding' },
      ],
      connections: [
        { fromLine: 5, toLine: 2, color: 'violet', label: 'closure — captured binding' },
      ],
    },
    {
      title: 'decrement — the same binding, shared by both functions',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }
  // Both functions close over the SAME count binding
}`,
      explanation: [
        'decrement is the same as increment but subtracts. Both functions close over the same count variable — not copies, the same binding. If increment mutates count, decrement sees the updated value on its next call, and vice versa.',
        'This shared binding is what makes the counter useful: increment and decrement coordinate through a single source of truth. No synchronisation needed, no passing count as an argument — both see the same live count because they captured the same variable slot.',
        'CS — Shared closure over a mutable binding is captured-by-reference semantics. This is different from captured-by-value (which would give each function its own copy). C++ closure syntax [&] captures by reference, [=] captures by value. JavaScript always captures by reference for mutable let/var bindings.',
        'SE — The shared binding models ownership: count belongs to makeCounter. increment and decrement are granted access because they are defined in the same scope. This is the same principle as a class owning private state: its methods share access to that state because they are bound to the same instance.',
      ],
      active: [
        { startLine: 9, endLine: 12, color: 'pink', label: 'decrement — closes over the same count as increment' },
        { startLine: 10, endLine: 10, color: 'indigo', label: 'count-- — same binding, shared mutation' },
        { startLine: 4, endLine: 6, color: 'emerald', label: 'increment — same count binding' },
      ],
      connections: [
        { fromLine: 5, toLine: 2, color: 'emerald', label: 'increment → count' },
        { fromLine: 10, toLine: 2, color: 'pink', label: 'decrement → count' },
      ],
    },
    {
      title: 'Return the methods — completing the closure',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }

  return { increment, decrement }  // expose the methods — count stays private
}`,
      explanation: [
        'return { increment, decrement } returns an object containing both functions. The caller gets the methods without getting count — count stays trapped inside makeCounter\'s scope, accessible only through the two functions.',
        'Critically: the returned functions still close over count. Even though makeCounter has finished executing and its stack frame is gone, count is kept alive on the heap because the returned functions hold live references to it. This is the closure: the functions carry their birthplace environment with them.',
        'CS — The return value is a plain JavaScript object. Its properties happen to be functions that close over count. There is no class, no prototype, no new keyword. This is the module pattern — one of the oldest JavaScript design patterns, predating ES modules by a decade. It is still widely used in utility libraries.',
        'SE — The interface is clear: the caller can increment and decrement, nothing else. No direct access to count, no way to set it to an arbitrary value. This is the Principle of Least Privilege: give callers exactly the operations they need and no more. Classes implement the same principle with private fields.',
      ],
      active: [
        { startLine: 14, endLine: 14, color: 'emerald', label: 'return — expose methods, keep count private' },
        { startLine: 2, endLine: 2, color: 'pink', label: 'count — private, not in the returned object' },
      ],
      connections: [],
    },
    {
      title: 'Using the counter — closure holds state across calls',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }

  return { increment, decrement }
}

const c = makeCounter()     // makeCounter runs — creates scope, count=0, returns methods
console.log(c.increment())  // 1  (count: 0→1, remembered between calls)
console.log(c.increment())  // 2  (count: 1→2)
console.log(c.decrement())  // 1  (count: 2→1)`,
      explanation: [
        'makeCounter() is called, creating a scope with count = 0. The methods are returned and assigned to c. makeCounter\'s stack frame is gone — but count lives on because c.increment and c.decrement hold references to it.',
        'Trace: c.increment() → count is 0 → count++ → 1 → return 1. c.increment() again → count is 1 (not reset!) → count++ → 2 → return 2. c.decrement() → count is 2 → count-- → 1 → return 1. The count binding persists in the heap between calls.',
        'CS — This is the closure in action: the function remembers its birthplace environment. The V8 engine stores closure variables in a heap-allocated "context" object rather than the stack frame. The stack frame for makeCounter is long gone, but the context with count is still referenced by the closures and therefore not garbage collected.',
        'SE — Every call to c.increment() is actually calling the increment function with this = c (implicit binding). But count is not on c — it is in the captured scope. This means count is genuinely private: Object.keys(c) returns [\'increment\', \'decrement\']. There is no property to access or modify.',
      ],
      active: [
        { startLine: 17, endLine: 17, color: 'indigo', label: 'makeCounter() — creates scope, count=0, returns methods' },
        { startLine: 18, endLine: 20, color: 'emerald', label: 'same count binding — mutates 0→1→2→1 across three calls' },
      ],
      connections: [],
    },
    {
      title: 'Two counters — each call creates an independent closure',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }

  return { increment, decrement }
}

const c = makeCounter()
console.log(c.increment())  // 1
console.log(c.increment())  // 2
console.log(c.decrement())  // 1

const c1 = makeCounter()    // new call — new scope — new count binding
const c2 = makeCounter()    // another new call — another independent scope

c1.increment(); c1.increment()
c2.increment()

console.log(c1.increment()) // 3 — c1's count (0→1→2→3)
console.log(c2.increment()) // 2 — c2's count (0→1→2) — completely independent`,
      explanation: [
        'c1 and c2 are created by two separate calls to makeCounter. Each call allocates a brand-new scope with its own fresh count = 0. c1 and c2 do not share a count — they each close over their own, independent binding.',
        'Trace: c1.increment() × 3 → c1\'s count goes 0→1→2→3 → logs 3. c2.increment() × 2 → c2\'s count goes 0→1→2 → logs 2. Neither counter is aware of the other. This independence is the factory pattern\'s most powerful property.',
        'CS — Each call to a function allocates a new lexical environment object. When makeCounter is called twice, two separate environment objects are created, each holding an independent count binding. The closures returned from each call reference their own environment. This is why the counters are independent.',
        'SE — This is how React\'s useState works under the hood. Each component instance has its own state slot — calling useState(0) in two different components gives two independent count bindings. The factory function (makeCounter) is analogous to the component function; each invocation creates an independent closure over its state.',
      ],
      active: [
        { startLine: 22, endLine: 23, color: 'violet', label: 'c1, c2 — two separate scopes, two independent counts' },
        { startLine: 28, endLine: 29, color: 'emerald', label: '3 and 2 — counters tracked independently' },
      ],
      connections: [],
    },
    {
      title: 'Parameterised factory — closures capture parameters too',
      code:
`function makeCounter() {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }

  return { increment, decrement }
}

const c = makeCounter()
console.log(c.increment())  // 1
console.log(c.increment())  // 2
console.log(c.decrement())  // 1

const c1 = makeCounter()
const c2 = makeCounter()
c1.increment(); c1.increment()
c2.increment()
console.log(c1.increment()) // 3
console.log(c2.increment()) // 2

function makeCounterFrom(startValue) {
  let count = startValue      // parameter is also a local binding — also captured

  function increment() { count++; return count }
  function decrement() { count--; return count }
  return { increment, decrement }
}

const hi = makeCounterFrom(10)
console.log(hi.increment())   // 11  (count starts at 10)
console.log(hi.increment())   // 12`,
      explanation: [
        'makeCounterFrom(startValue) is a second factory that accepts a starting value. startValue is a parameter — inside the function body it behaves exactly like a local variable. The closure over count captures startValue\'s initial value through the assignment let count = startValue.',
        'hi = makeCounterFrom(10) creates a scope where startValue = 10 and count = 10. hi.increment() → count++ → 11. hi.increment() → 12. The starting point was 10 because the closure captured the parameter binding at the moment of the call.',
        'CS — Parameters are syntactic sugar for local variables in the function\'s scope. When a closure captures a parameter, it captures the binding exactly as it would a let declaration. The closure remembers the value of that parameter from the specific call that created the closure — this is the definition of "closes over."',
        'SE — This parameterised factory pattern appears in middleware: express().use(authenticate({ secret: \'key\' })) — the authenticate factory captures the config at setup time. In React: const debounced = useCallback(debounce(handler, 200), [handler]) — debounce captures the delay parameter in the closure. Closures over parameters enable configuration at factory time, use at call time.',
      ],
      active: [
        { startLine: 29, endLine: 35, color: 'violet', label: 'makeCounterFrom — captures startValue parameter' },
        { startLine: 30, endLine: 30, color: 'pink', label: 'count = startValue — parameter becomes the initial state' },
        { startLine: 37, endLine: 38, color: 'emerald', label: 'starts at 10, increments to 11, 12' },
      ],
      connections: [
        { fromLine: 30, toLine: 29, color: 'violet', label: 'parameter captured as local binding' },
      ],
    },
  ],
}
