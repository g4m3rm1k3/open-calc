export default {
  id: 'generator',
  title: 'Generator',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'function* — a function that can pause',
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

const gen = counter()
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())`,
      runCode:
`function makeCounter() {
  var vals = [1, 2, 3]
  var idx  = 0
  return {
    next: function() {
      if (idx < vals.length) return { value: vals[idx++], done: false }
      return { value: undefined, done: true }
    }
  }
}
var gen = makeCounter()
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())`,
      explanation: [
        '`function*` declares a generator function. Calling `counter()` does not run the body — it returns a generator object (`gen`). Each call to `gen.next()` runs the body until the next `yield`, then pauses. Line 8 prints `{ value: 1, done: false }`. Line 9 prints `{ value: 2, done: false }`. Line 10 prints `{ value: 3, done: false }`. Line 11 prints `{ value: undefined, done: true }` — the function body has finished.',
        'CS — A generator is a resumable function. `yield` is a pause point: execution stops, a value is sent out, and the function\'s stack frame (all local variables) is preserved. The next `next()` call resumes from exactly where it left off. This is cooperative multitasking: the generator yields control to the caller, the caller calls `next()` to resume. The generator controls when it pauses; the caller controls when it resumes.',
        'SE — Generators are the basis of `async/await`. Babel\'s early async transpiler compiled `async function` to a generator + a Promise runner. Redux-Saga uses generators to describe async workflows as sequences of `yield`-ed effects — each `yield` is a step the saga runner interprets. Koa.js (the web framework) originally used generators for middleware before async/await existed.',
        'Without this: without generators, producing a sequence lazily requires an object with a `next()` method built manually — tracking state with closure variables. Generators automate this: the function body IS the state machine, and `yield` IS the state transition. The engine manages the saved stack frame; you write linear code.',
      ],
      active: [
        { startLine: 1,  endLine: 5,  color: 'indigo',  label: 'function* — generator declaration' },
        { startLine: 2,  endLine: 4,  color: 'violet',  label: 'yield — pause points that emit values' },
        { startLine: 7,  endLine: 11, color: 'emerald', label: 'four next() calls: 1, 2, 3, done' },
      ],
      connections: [{ fromLine: 8, toLine: 2, color: 'emerald', label: 'first next() → runs to yield 1' }],
    },
    {
      title: 'Infinite generator — values on demand',
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

const gen = counter()
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())

function* naturals(start) {
  var n = start || 0
  while (true) {
    yield n
    n++
  }
}

const nums = naturals(1)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)`,
      runCode:
`function makeCounter() {
  var vals=[1,2,3],idx=0
  return { next: function() { return idx<vals.length ? {value:vals[idx++],done:false} : {value:undefined,done:true} } }
}
var gen = makeCounter()
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())

function naturalsIter(start) {
  var n = start || 0
  return {
    next: function() { return { value: n++, done: false } }
  }
}
var nums = naturalsIter(1)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)
console.log(nums.next().value)`,
      explanation: [
        '`naturals(1)` creates a generator that yields `1, 2, 3, ...` indefinitely. The `while (true)` loop never terminates — but it never runs all at once. Each `next()` call runs until `yield n`, pauses, and increments `n` in the next resume. Lines 22–26 print `1`, `2`, `3`, `4`, `5` — five values pulled from an infinite sequence. The sequence exists only as needed.',
        'CS — An infinite generator produces values lazily: only when requested. No array is created. No memory is allocated upfront. This is the Iterator pattern with infinite range. Computer science calls this "lazy evaluation" — computation is deferred until the value is consumed. Haskell\'s lists and Clojure\'s lazy sequences are the same concept in functional languages.',
        'SE — Infinite generators appear in: ID generators (`function* uuid() { while(true) yield crypto.randomUUID() }`), event stream producers, paginated API consumers (`function* pages(url) { while(url) { const {data, next} = await fetch(url); yield data; url = next } }`). Node.js streams are pull-based infinite generators. Observables in RxJS model infinite event sequences the same way.',
        'Without this: to produce the first 5 natural numbers without a generator, you call a function 5 times and track state externally. To produce an unknown number (all numbers until some condition), you need a loop with a counter variable living outside the function. The generator moves the counter into the function, where it belongs — the function owns its own state.',
      ],
      active: [
        { startLine: 13, endLine: 18, color: 'violet',  label: 'naturals — infinite sequence, pauses at each yield' },
        { startLine: 21, endLine: 26, color: 'emerald', label: 'pull 5 values from infinite sequence' },
      ],
      connections: [{ fromLine: 22, toLine: 16, color: 'violet', label: 'next() resumes from after yield' }],
    },
    {
      title: 'yield* — delegating to another generator',
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

function* naturals(start) {
  var n = start || 0
  while (true) { yield n; n++ }
}

function* range(from, to) {
  var i = from
  while (i <= to) {
    yield i
    i++
  }
}

function* alphabet() {
  yield* range(65, 67)
  yield* range(97, 99)
}

const gen = counter()
console.log(gen.next().value)
console.log(gen.next().value)
console.log(gen.next().value)

const alpha = alphabet()
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)`,
      runCode:
`function makeIter(vals) {
  var i=0
  return { next: function() { return i<vals.length ? {value:vals[i++],done:false} : {value:undefined,done:true} } }
}
var gen = makeIter([1,2,3])
console.log(gen.next().value)
console.log(gen.next().value)
console.log(gen.next().value)

var alpha = makeIter([65,66,67,97,98,99])
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)
console.log(alpha.next().value)`,
      explanation: [
        '`yield*` delegates iteration to another iterable or generator. `alphabet()` first delegates to `range(65, 67)` — yielding ASCII codes 65, 66, 67 (`A`, `B`, `C`). When `range(65, 67)` is exhausted, `alphabet` moves to `yield* range(97, 99)` — yielding 97, 98, 99 (`a`, `b`, `c`). Lines 30–35 print `65`, `66`, `67`, `97`, `98`, `99`. (`alpha.next().value` gives the raw numbers since these are char codes.)',
        'CS — `yield*` is the generator equivalent of function composition. It transfers control to the delegated generator for the duration of its sequence, then returns control. This enables building complex sequences by composing simple ones — the same principle as Unix pipes. The delegation is transparent to the consumer: they call `next()` and get values regardless of which sub-generator produced them.',
        'SE — Redux-Saga uses `yield*` to compose saga sequences: a complex saga can `yield* simpleAuthSaga()` then `yield* simpleFetchSaga()`. Koa-router composes middleware generators. The TC39 proposal for generators in streaming data processing (`ReadableStream` as iterable) relies on `yield*` to pipe through processing stages.',
        'Without this: without `yield*`, you\'d have to loop over the inner generator manually: `for (const v of range(65, 67)) { yield v }`. `yield*` is syntactic sugar for exactly that loop — it expresses delegation in one line instead of three.',
      ],
      active: [
        { startLine: 12, endLine: 18, color: 'indigo',  label: 'range — reusable bounded sequence' },
        { startLine: 20, endLine: 23, color: 'violet',  label: 'yield* — compose sequences from sub-generators' },
        { startLine: 29, endLine: 35, color: 'emerald', label: '65,66,67 then 97,98,99 from composed generators' },
      ],
      connections: [{ fromLine: 21, toLine: 12, color: 'violet', label: 'yield* delegates to range()' }],
    },
    {
      title: 'Two-way communication — next(value) sends data in',
      runCode:
`var total = 0
total += 10; console.log(total)
total += 20; console.log(total)
total += 5;  console.log(total)
console.log(total)`,
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

function* naturals(start) {
  var n = start || 0
  while (true) { yield n; n++ }
}

function* range(from, to) {
  var i = from
  while (i <= to) { yield i; i++ }
}

function* accumulator() {
  var total = 0
  while (true) {
    var n = yield total
    if (n === null) break
    total += n
  }
  return total
}

const acc = accumulator()
acc.next()
console.log(acc.next(10).value)
console.log(acc.next(20).value)
console.log(acc.next(5).value)
console.log(acc.next(null).value)`,
      explanation: [
        'Generators support two-way communication. `acc.next()` on line 27 starts the generator — runs to the first `yield total` (total = 0). The yielded value is discarded. `acc.next(10)` sends `10` into the generator — `n` receives `10`, `total` becomes `10`, loop continues to the next `yield total`. Line 28 prints `10`. Line 29 prints `30`. Line 30 prints `35`. `acc.next(null)` — `n` is `null`, the `if` breaks the loop, returns `total = 35`. Line 31 prints `35` with `done: true`.',
        'CS — `next(value)` passes a value to the generator at the `yield` site. The value becomes the result of the `yield` expression — `var n = yield total` means: send `total` out, wait, receive the next `next(value)` as `n`. The first `next()` cannot pass a value (there is no `yield` to receive it yet) — this is why line 27 discards its return value and seeds the generator.',
        'SE — Two-way generators are how Redux-Saga receives action dispatches. `const action = yield take(\'LOGIN_REQUEST\')` — the saga yields a `take` effect descriptor; the Saga middleware runs it, waits for the action, then calls `next(action)` to deliver it back into the generator. The generator writes linear imperative code; the middleware handles the async orchestration around it.',
        'Without this: without `next(value)`, generators are output-only — they produce a stream of values but cannot receive inputs mid-sequence. With two-way communication, generators become coroutines: symmetric conversations between caller and function. Coroutines are the foundation of cooperative multitasking, green threads, and async workflows.',
      ],
      active: [
        { startLine: 17, endLine: 25, color: 'violet',  label: 'accumulator — receives values via next(value)' },
        { startLine: 20, endLine: 20, color: 'indigo',  label: 'var n = yield — receives incoming next() value' },
        { startLine: 27, endLine: 31, color: 'emerald', label: '10 → 30 → 35 → 35 (done)' },
      ],
      connections: [{ fromLine: 29, toLine: 20, color: 'violet', label: 'next(20) → n receives 20' }],
    },
    {
      title: 'for...of — consume a generator as an iterable',
      runCode:
`function rangeArr(from, to) {
  var r=[]; for(var i=from;i<=to;i++) r.push(i); return r
}

function fibArr(n) {
  var r=[],a=0,b=1
  for(var i=0;i<n;i++) { r.push(a); var t=a; a=b; b=t+b }
  return r
}

console.log([1,2,3])
console.log(rangeArr(1,5))
console.log(fibArr(8))`,
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

function* naturals(start) {
  var n = start || 0
  while (true) { yield n; n++ }
}

function* range(from, to) {
  var i = from
  while (i <= to) { yield i; i++ }
}

function* accumulator() {
  var total = 0
  while (true) {
    var n = yield total
    if (n === null) break
    total += n
  }
  return total
}

function* fibonacci() {
  var a = 0
  var b = 1
  while (true) {
    yield a
    var temp = a
    a = b
    b = temp + b
  }
}

function take(gen, n) {
  var result = []
  var i = 0
  for (var item of gen) {
    result.push(item)
    i++
    if (i >= n) break
  }
  return result
}

console.log(take(counter(), 3))
console.log(take(range(1, 5), 5))
console.log(take(fibonacci(), 8))`,
      explanation: [
        '`for...of` iterates a generator until `done: true` or a `break`. The `take` helper uses `for...of` to collect up to `n` values into an array. Line 48 prints `[1, 2, 3]` from the finite `counter` generator. Line 49 prints `[1, 2, 3, 4, 5]` from `range(1, 5)`. Line 50 prints `[0, 1, 1, 2, 3, 5, 8, 13]` — the first 8 Fibonacci numbers from an infinite generator, stopped after 8 by the `break`.',
        'CS — Generators implement the JavaScript iteration protocol: they have a `[Symbol.iterator]()` method that returns `this`, and a `next()` method that returns `{ value, done }`. Any object with these two properties is iterable — `for...of`, spread (`...gen`), destructuring (`const [a, b] = gen`), and `Array.from(gen)` all work with generators because they use this protocol.',
        'SE — The iteration protocol is the abstraction behind every collection in JavaScript. `Array`, `Map`, `Set`, `String`, `NodeList`, generators — all are iterable because they implement `[Symbol.iterator]()`. `for...of` is type-agnostic: it works on any iterable. This is why you can write `for (const line of readFileAsLines())` where `readFileAsLines` is a generator — same loop syntax, different source.',
        'Without this: without generators implementing the iteration protocol, custom sequences need custom loop syntax. The `take` helper would need a `while (i < n) { result.push(gen.next().value); i++ }` loop that mixes index management with value extraction. `for...of` with generators expresses "give me values until done or break" in the cleanest possible form.',
      ],
      active: [
        { startLine: 27, endLine: 35, color: 'indigo',  label: 'fibonacci — infinite sequence in 8 lines' },
        { startLine: 37, endLine: 45, color: 'violet',  label: 'take — for...of with early break' },
        { startLine: 47, endLine: 50, color: 'emerald', label: '[1,2,3], [1-5], [0,1,1,2,3,5,8,13]' },
      ],
      connections: [{ fromLine: 40, toLine: 30, color: 'violet', label: 'for...of calls next() on each iteration' }],
    },
    {
      title: 'return() and throw() — control from outside',
      runCode:
`function rangeArr(from,to) { var r=[]; for(var i=from;i<=to;i++) r.push(i); return r }
function fibArr(n) { var r=[],a=0,b=1; for(var i=0;i<n;i++){r.push(a);var t=a;a=b;b=t+b} return r }
console.log([1,2,3])
console.log(rangeArr(1,5))
console.log(fibArr(8))

console.log('a')
console.log('b')
console.log('generator cleaned up')
console.log('done')
console.log(undefined)`,
      code:
`function* counter() {
  yield 1
  yield 2
  yield 3
}

function* naturals(start) {
  var n = start || 0
  while (true) { yield n; n++ }
}

function* range(from, to) {
  var i = from
  while (i <= to) { yield i; i++ }
}

function* accumulator() {
  var total = 0
  while (true) {
    var n = yield total
    if (n === null) break
    total += n
  }
  return total
}

function* fibonacci() {
  var a = 0; var b = 1
  while (true) { yield a; var t = a; a = b; b = t + b }
}

function take(gen, n) {
  var result = []
  var i = 0
  for (var item of gen) { result.push(item); i++; if (i >= n) break }
  return result
}

function* safeCounter() {
  try {
    yield 'a'
    yield 'b'
    yield 'c'
  } finally {
    console.log('generator cleaned up')
  }
}

console.log(take(counter(), 3))
console.log(take(range(1, 5), 5))
console.log(take(fibonacci(), 8))

const sc = safeCounter()
console.log(sc.next().value)
console.log(sc.next().value)
console.log(sc.return('done').value)
console.log(sc.next().value)`,
      explanation: [
        '`sc.return(\'done\')` terminates the generator early, triggering any `finally` blocks first. Line 53 prints `\'a\'`. Line 54 prints `\'b\'`. `sc.return(\'done\')` on line 55: runs the `finally` block (prints `\'generator cleaned up\'`), then returns `{ value: \'done\', done: true }` — line 55 prints `\'done\'`. Line 56 prints `undefined` — the generator is done, further `next()` calls return `{ value: undefined, done: true }`.',
        'CS — `return(value)` injects a return statement at the current `yield` site. `throw(error)` injects a `throw` at the current `yield` site. Both allow the caller to take control of a generator\'s execution path from the outside. `finally` blocks still run — the generator cleanup protocol is respected. This is the generator\'s resource-management guarantee.',
        'SE — `for...of` with `break` calls `return()` on the generator automatically — this is how infinite generators are safely terminated. A database cursor generator (`function* queryRows()`) can `yield` rows in a `try` block with a `finally` that closes the database connection. Even if the caller breaks early, the connection closes. This replaces the need for explicit resource management in consuming code.',
        'Without this: without `return()` and `finally` support, early termination of a generator would leave resources open — file handles, database cursors, network connections. The caller would need to call a `cleanup()` method manually. The `try/finally` + `return()` combination makes cleanup automatic and safe even under early termination.',
      ],
      active: [
        { startLine: 38, endLine: 46, color: 'violet',  label: 'safeCounter — finally runs even on early return' },
        { startLine: 52, endLine: 56, color: 'emerald', label: 'a, b, then return() → cleanup runs → done' },
      ],
      connections: [{ fromLine: 55, toLine: 43, color: 'violet', label: 'return() triggers finally block' }],
    },
  ],
}
