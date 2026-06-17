// DSA + Design Patterns — Lesson 38
// Functional Patterns

export const lesson = {
  id: 'dsa-patterns-38',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '38. Functional Patterns',
  checkpoints: [
    { id: 'cp-pure',       label: 'Pure Functions & Immutability' },
    { id: 'cp-functor',    label: 'Functor & Monad' },
    { id: 'cp-transducer', label: 'Transducers' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Your codebase has functions that read from a shared cache, write to a global log, and depend on the current date — they return different results for the same inputs and interact with the outside world invisibly. Testing them requires setting up the entire environment before each test. Parallelising them risks race conditions. Composing them produces unexpected side effects. You need a programming model where functions are predictable: same input always produces same output, nothing outside the function changes, and functions compose like mathematical functions. This lesson covers four practical techniques: pure functions, the Maybe and Result monads, and transducers.',
      code: null,
    },

    // ── Step 1: Pure functions and immutability ───────────────────────────────

    {
      type: 'narration',
      id: 'step1-pure',
      text: 'A pure function has two properties: (1) Referential transparency — given the same inputs, it always returns the same output. No hidden dependencies on global state, date/time, random numbers, or network. (2) No side effects — it does not modify anything outside itself: no mutation of arguments, no console.log, no writing to files or databases. The benefits: pure functions are trivially testable (no setup), cacheable (memoisation is always safe), and parallelisable (no shared state to race on). Immutability is the data corollary: instead of mutating an object, return a new object with the changed field. Spreads and Object.assign create shallow copies; structuredClone creates deep copies.',
      code: `// Impure functions — depend on external state or cause side effects
let tax = 0.15
function calculateTotal_IMPURE(price) {
  return price + price * tax   // depends on external variable — not pure
}

const cart = { items: [], total: 0 }
function addItem_IMPURE(item) {
  cart.items.push(item)        // mutates external object — side effect
  cart.total += item.price
  return cart
}

// Pure equivalents — no external dependencies, no mutation
function calculateTotal_PURE(price, taxRate) {   // ← NEW  taxRate is a parameter
  return price + price * taxRate                 // ← NEW  same inputs → same output always
}

function addItem_PURE(cart, item) {              // ← NEW  takes cart as input
  return {                                       // ← NEW  returns a NEW cart
    items: [...cart.items, item],                // ← NEW  spread creates new array
    total: cart.total + item.price               // ← NEW  new total computed
  }
}                                                // ← NEW  original cart unchanged

const cart1 = { items: [], total: 0 }
const cart2 = addItem_PURE(cart1, { name: 'book', price: 12 })
const cart3 = addItem_PURE(cart2, { name: 'pen',  price: 3 })

console.log('cart1 unchanged:', cart1.total)     // 0  — original not mutated
console.log('cart2:', cart2.total)               // 12
console.log('cart3:', cart3.total)               // 15`,
    },

    // ── Step 2: Higher-order functions ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-hof',
      text: 'A higher-order function (HOF) is a function that takes one or more functions as arguments or returns a function. map, filter, and reduce are the canonical HOFs. Currying transforms a function of multiple arguments into a chain of single-argument functions: add(2)(3) instead of add(2, 3). This enables partial application — supply some arguments now and the rest later — which is the foundation of function composition. Composition: compose(f, g)(x) = f(g(x)). Pipe is compose in reversed order: pipe(g, f)(x) = f(g(x)). These combinators let you build complex transformations from small, testable, reusable pieces.',
      code: `// Currying: convert f(a,b) to f(a)(b)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args)   // enough args: call immediately
    return (...more) => curried(...args, ...more)       // not enough: return partial
  }
}

const add  = curry((a, b) => a + b)
const mult = curry((a, b) => a * b)

const add10  = add(10)     // partial: add10(x) = x + 10
const double = mult(2)     // partial: double(x) = x * 2

console.log(add10(5))      // 15
console.log(double(7))     // 14

// Composition: pipe applies left to right
function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x)
}

const transform = pipe(
  double,        // x * 2
  add10,         // + 10
  x => x * x    // square
)

console.log(transform(3))   // double(3)=6, +10=16, 16*16=256`,
    },

    // ── Step 3: Maybe monad ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-maybe',
      text: 'A monad, practically speaking, is a container that wraps a value and provides two operations: of(value) to put a value in the container, and chain (also called flatMap or bind) to apply a function that itself returns a monad. The Maybe monad wraps a value that might be null or undefined. map applies a function to the value if it is present, otherwise propagates the null. chain is like map but the function returns a Maybe — it prevents double-wrapping. The benefit: a chain of five operations that might each fail with null never requires five separate null checks. If any step returns null, Nothing propagates through the rest of the chain silently.',
      code: `// Maybe monad: Just(value) or Nothing
class Maybe {
  constructor(value) { this._value = value }

  static of(value) {                            // ← NEW  wrap a value
    return value == null ? Maybe.nothing() : new Maybe(value)
  }

  static nothing() {                            // ← NEW  empty container
    return new Maybe(null)
  }

  isNothing() { return this._value == null }   // ← NEW

  // map: apply fn to value if present; propagate Nothing otherwise
  map(fn) {                                    // ← NEW
    if (this.isNothing()) return this          // ← NEW  Nothing stays Nothing
    return Maybe.of(fn(this._value))           // ← NEW  wrap result
  }

  // chain: fn returns a Maybe — avoid Maybe(Maybe(value)) double wrapping
  chain(fn) {                                  // ← NEW
    if (this.isNothing()) return this          // ← NEW
    return fn(this._value)                     // ← NEW  fn returns Maybe directly
  }

  getOrElse(def) {                             // ← NEW  unwrap with a fallback
    return this.isNothing() ? def : this._value
  }
}

// Usage: chain of operations, any of which might return null
const users = { 1: { name: 'Alice', addressId: 2 }, 3: { name: 'Bob', addressId: null } }
const addresses = { 2: { city: 'London' } }

function getCity(userId) {
  return Maybe.of(users[userId])                         // might be null
    .chain(user => Maybe.of(user.addressId))             // might be null
    .chain(id   => Maybe.of(addresses[id]))              // might be null
    .map(addr   => addr.city)                            // safe: only runs if address exists
    .getOrElse('Unknown')
}

console.log(getCity(1))    // 'London'
console.log(getCity(3))    // 'Unknown' — addressId is null, no crash
console.log(getCity(9))    // 'Unknown' — user 9 doesn't exist, no crash`,
    },

    // ── Challenge 1: Maybe monad ──────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-maybe',
      text: 'Implement the Maybe monad with of, nothing, isNothing, map, chain, and getOrElse. Then use it to safely look up a nested property: given config = { db: { host: "localhost", port: 5432 } }, use Maybe to safely get config.db.port (expect 5432). Also try config.cache.host (expect "default"). No null checks allowed — use Maybe to handle them.',
      expectedOutput: null,
      startCode: `class Maybe {
  constructor(value) { this._value = value }

  static of(value) {
    // YOUR CODE HERE: return Maybe.nothing() if null/undefined, else new Maybe(value)
  }

  static nothing() {
    return new Maybe(null)
  }

  isNothing() { return this._value == null }

  map(fn) {
    // YOUR CODE HERE: if nothing, return this; else return Maybe.of(fn(this._value))
  }

  chain(fn) {
    // YOUR CODE HERE: if nothing, return this; else return fn(this._value)
  }

  getOrElse(def) {
    return this.isNothing() ? def : this._value
  }
}

const config = { db: { host: 'localhost', port: 5432 } }

// YOUR CODE HERE:
// 1. Use Maybe to get config.db.port — expect 5432
// 2. Use Maybe to get config.cache.host — expect 'default'
// Log both results
`,
      hint: 'static of(v){return v==null?Maybe.nothing():new Maybe(v)} map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))} chain(fn){if(this.isNothing())return this;return fn(this._value)}\nThen: Maybe.of(config).chain(c=>Maybe.of(c.db)).map(d=>d.port).getOrElse(0)',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        const strs = logs.map(l => String(l).trim())
        return nums.includes(5432) && strs.some(s => s.includes('default'))
      },
    },

    { type: 'checkpoint', id: 'cp-pure' },

    // ── Step 4: Result monad ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-result',
      text: 'The Result monad (also called Either in Haskell and many functional libraries) wraps a computation that might fail with an error. Ok(value) represents success; Err(error) represents failure. Like Maybe, map and chain propagate errors without interrupting the chain. The caller never writes try/catch — errors are values that flow through the chain. At the end, match({ok, err}) handles both cases explicitly, making the error paths as visible as the success path. This pattern is prominent in Rust (Result<T,E>) and Elm.',
      code: `// Result monad: Ok(value) or Err(error)
class Result {
  static ok(value)  { const r = new Result(); r._ok = true;  r._value = value; return r }
  static err(error) { const r = new Result(); r._ok = false; r._error = error; return r }

  isOk()  { return this._ok }
  isErr() { return !this._ok }

  // map: apply fn to value if Ok; propagate Err unchanged
  map(fn) {                                             // ← NEW
    if (this.isErr()) return this                       // ← NEW  error propagates
    try { return Result.ok(fn(this._value)) }          // ← NEW  fn might throw
    catch (e) { return Result.err(e.message) }         // ← NEW  catch and wrap
  }

  // chain: fn returns a Result — avoid Result(Result(v))
  chain(fn) {                                          // ← NEW
    if (this.isErr()) return this                      // ← NEW
    try { return fn(this._value) }                     // ← NEW
    catch (e) { return Result.err(e.message) }         // ← NEW
  }

  // match: explicit handler for both cases — no silent failures
  match({ ok, err }) {                                 // ← NEW
    return this.isOk() ? ok(this._value) : err(this._error)  // ← NEW
  }
}

function parseJSON(str) {
  try { return Result.ok(JSON.parse(str)) }
  catch (e) { return Result.err('Invalid JSON: ' + e.message) }
}

function getField(obj, key) {
  const val = obj[key]
  return val !== undefined ? Result.ok(val) : Result.err('Missing field: ' + key)
}

// Pipeline that might fail at any step — no try/catch in the pipeline
const result = parseJSON('{"user":{"age":25}}')
  .chain(obj  => getField(obj, 'user'))
  .chain(user => getField(user, 'age'))
  .map(age    => age * 2)

result.match({
  ok:  v => console.log('success:', v),    // 50
  err: e => console.log('error:', e),
})

// Failure path
const bad = parseJSON('{invalid json}')
  .chain(obj => getField(obj, 'user'))

bad.match({
  ok:  v => console.log('success:', v),
  err: e => console.log('error:', e),      // error: Invalid JSON: ...
})`,
    },

    // ── Step 5: Functor ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-functor',
      text: 'A functor is any container that implements map in a way that preserves structure. Array is the canonical functor: [1,2,3].map(f) applies f to each element and returns a new array of the same length. Maybe is a functor: it maps over its value if present. Result is a functor: it maps over its Ok value. The formal rules (functor laws): (1) Identity — container.map(x => x) must equal container (mapping identity changes nothing). (2) Composition — container.map(f).map(g) must equal container.map(x => g(f(x))) (composing maps is equivalent to one map with composed function). These laws guarantee that map can be safely optimised and reasoned about.',
      code: `// Functor laws verified on Array and Maybe

// Identity law: map(x=>x) === identity
const arr = [1, 2, 3]
console.log(JSON.stringify(arr.map(x => x)))   // [1,2,3] — unchanged

// Composition law: map(f).map(g) === map(x => g(f(x)))
const double = x => x * 2
const addOne = x => x + 1

const way1 = arr.map(double).map(addOne)         // map twice
const way2 = arr.map(x => addOne(double(x)))     // map once with composed fn
console.log(JSON.stringify(way1))                // [3,5,7]
console.log(JSON.stringify(way2))                // [3,5,7] — same result

// Functor laws on Maybe
class Maybe {
  constructor(v){this._value=v}
  static of(v){return v==null?new Maybe(null):new Maybe(v)}
  isNothing(){return this._value==null}
  map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))}
  getOrElse(d){return this.isNothing()?d:this._value}
}

const m = Maybe.of(5)
console.log(m.map(x=>x).getOrElse(0))                      // 5 — identity law
console.log(m.map(double).map(addOne).getOrElse(0))         // 11
console.log(m.map(x=>addOne(double(x))).getOrElse(0))       // 11 — composition law`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting-point',
      text: 'The meeting point of pure functions, functors, and monads: data transformation pipelines — maps, filters, and reduces — are where all three concepts converge. Each stage of a pipeline is a pure function (same input → same output). The pipeline itself is a functor (map preserves structure). Chaining operations that might fail uses the monad pattern (chain propagates errors without explicit null checks). In a large codebase, these properties together mean that any function in the pipeline can be tested in isolation, any two adjacent stages can be swapped or composed, and failures are explicit values that flow visibly through the chain rather than invisible exceptions.',
      code: `// A realistic data pipeline: pure, functor-structured, monad-safe
class Maybe {
  constructor(v){this._value=v}
  static of(v){return v==null?new Maybe(null):new Maybe(v)}
  isNothing(){return this._value==null}
  map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))}
  chain(fn){if(this.isNothing())return this;return fn(this._value)}
  getOrElse(d){return this.isNothing()?d:this._value}
}

// Pure functions — each testable in isolation
const normalize    = str => str.trim().toLowerCase()
const words        = str => str.split(/\s+/).filter(Boolean)
const frequencies  = arr => arr.reduce((m, w) => { m[w] = (m[w]||0)+1; return m }, {})
const topN         = n => obj => Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n)

// Pipeline: compose pure functions via Maybe for null-safety
function wordCount(input, n) {
  return Maybe.of(input)
    .map(normalize)
    .map(words)
    .map(frequencies)
    .map(topN(n))
    .getOrElse([])
}

const text = '  The cat sat on the mat the cat sat  '
console.log(wordCount(text, 3))     // [['the',3],['cat',2],['sat',2]]
console.log(wordCount(null, 3))     // [] — null input handled gracefully`,
    },

    // ── Step 6: Transducers ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-transducers',
      text: 'A transducer (transformer + reducer) is a composable, reusable transformation that is independent of the data source. Normal chained array operations ([1,2,3,4,5].filter(even).map(double)) create intermediate arrays at each step — O(n) extra space per step. A transducer composes the filter and map into a single reducer that is applied in one pass with no intermediate arrays. A transducer takes a "next" reducer as an argument and returns a new reducer. Composing transducers (left to right with pipe, or right to left with compose) produces a single-pass reducer. This matters when processing large datasets or streams where intermediate allocation is expensive.',
      code: `// Transducer: a function that takes a reducer and returns a reducer
// reducer shape: (accumulator, value) => accumulator

// mapT: transducer version of map
function mapT(fn) {                             // ← NEW
  return nextReducer => (acc, val) =>           // ← NEW  takes nextReducer, returns reducer
    nextReducer(acc, fn(val))                   // ← NEW  transform val before passing on
}

// filterT: transducer version of filter
function filterT(pred) {                        // ← NEW
  return nextReducer => (acc, val) =>           // ← NEW
    pred(val) ? nextReducer(acc, val) : acc     // ← NEW  skip if predicate fails
}

// pipe for transducers (left to right)
function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x)
}

// transduce: apply a composed transducer to a collection
function transduce(xf, reducer, init, coll) {  // ← NEW
  const xReducer = xf(reducer)                 // ← NEW  apply transducer stack to reducer
  return coll.reduce(xReducer, init)            // ← NEW  single pass
}

// Example: filter evens and double, then sum — all in ONE pass, no intermediate arrays
const isEven  = x => x % 2 === 0
const double  = x => x * 2
const sumReducer = (acc, val) => acc + val      // final reducer: sum

const xf = pipe(
  filterT(isEven),    // ← keep only even numbers
  mapT(double)        // ← then double them
)

const result = transduce(xf, sumReducer, 0, [1, 2, 3, 4, 5, 6])
console.log('sum of doubled evens:', result)   // 2*2 + 4*2 + 6*2 = 24

// Compare: chained array operations (two passes, two intermediate arrays)
const naive = [1,2,3,4,5,6].filter(isEven).map(double).reduce(sumReducer, 0)
console.log('naive:', naive)   // 24 — same answer`,
    },

    // ── Challenge 2: transducer ───────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-transducer',
      text: 'Build a transducer pipeline that: (1) filters out odd numbers, (2) doubles the remaining even numbers, then (3) reduces to a sum. Apply it to [1,2,3,4,5,6,7,8,9,10]. Expected: 2+4+6+8+10 doubled = 4+8+12+16+20 = 60. Log the result. Also log the naive equivalent (filter + map + reduce) and verify they match.',
      expectedOutput: null,
      startCode: `function mapT(fn) {
  return nextReducer => (acc, val) => nextReducer(acc, fn(val))
}

function filterT(pred) {
  return nextReducer => (acc, val) => pred(val) ? nextReducer(acc, val) : acc
}

function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x)
}

function transduce(xf, reducer, init, coll) {
  const xReducer = xf(reducer)
  return coll.reduce(xReducer, init)
}

const isEven = x => x % 2 === 0
const double = x => x * 2
const sumReducer = (acc, val) => acc + val

// YOUR CODE HERE:
// 1. Build xf: filter even, then double
// 2. transduce over [1..10] with sumReducer starting at 0
// 3. Log transducer result
// 4. Log naive result (filter+map+reduce) and check equality
`,
      hint: 'const xf=pipe(filterT(isEven),mapT(double)); const r=transduce(xf,sumReducer,0,[1,2,3,4,5,6,7,8,9,10]); console.log(r); const naive=[1,2,3,4,5,6,7,8,9,10].filter(isEven).map(double).reduce(sumReducer,0); console.log(naive); console.log(r===naive);',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(60)
      },
    },

    { type: 'checkpoint', id: 'cp-functor' },

    // ── Step 7: Combined ─────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'All four concepts working together: a data pipeline that reads a stream of user events, filters by type, extracts a field, parses it safely with Maybe, and accumulates results with a transducer — all pure, all composable, all null-safe. This style of programming is sometimes called "railway-oriented programming": data flows along the track, and errors shunt off to the error track without derailing the whole train.',
      code: `// Combined: pure, Maybe, transducer on a stream of events
class Maybe {
  constructor(v){this._value=v}
  static of(v){return v==null?new Maybe(null):new Maybe(v)}
  isNothing(){return this._value==null}
  map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))}
  chain(fn){if(this.isNothing())return this;return fn(this._value)}
  getOrElse(d){return this.isNothing()?d:this._value}
}

function mapT(fn){return r=>(a,v)=>r(a,fn(v))}
function filterT(p){return r=>(a,v)=>p(v)?r(a,v):a}
function pipe(...fns){return x=>fns.reduce((v,f)=>f(v),x)}
function transduce(xf,reducer,init,coll){return coll.reduce(xf(reducer),init)}

// Raw event stream
const events = [
  { type: 'purchase', amount: '29.99' },
  { type: 'refund',   amount: '10.00' },
  { type: 'purchase', amount: 'bad_data' },
  { type: 'purchase', amount: '49.99' },
  { type: 'view',     amount: null },
]

// Pure extractors
const isPurchase = e => e.type === 'purchase'
const toAmount   = e => Maybe.of(e.amount).map(parseFloat).map(n => isNaN(n) ? null : n).getOrElse(null)

const xf = pipe(
  filterT(isPurchase),              // keep purchases only
  filterT(e => toAmount(e) !== null), // keep parseable amounts
  mapT(toAmount)                    // extract numeric amount
)

const total = transduce(xf, (acc, v) => acc + v, 0, events)
console.log('total purchase revenue:', total.toFixed(2))   // 79.98  (29.99 + 49.99)`,
    },

    // ── Challenge 3: combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Given orders = [{status:"shipped",price:100},{status:"pending",price:50},{status:"shipped",price:200},{status:"cancelled",price:75}], use a transducer pipeline to: filter shipped orders, extract price, sum all prices. Expected: 300 (100+200). Use Maybe to safely access price — treat missing price as 0. Log the result.',
      expectedOutput: null,
      startCode: `class Maybe {
  constructor(v){this._value=v}
  static of(v){return v==null?new Maybe(null):new Maybe(v)}
  isNothing(){return this._value==null}
  map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))}
  getOrElse(d){return this.isNothing()?d:this._value}
}

function mapT(fn){return r=>(a,v)=>r(a,fn(v))}
function filterT(p){return r=>(a,v)=>p(v)?r(a,v):a}
function pipe(...fns){return x=>fns.reduce((v,f)=>f(v),x)}
function transduce(xf,reducer,init,coll){return coll.reduce(xf(reducer),init)}

const orders = [
  {status:'shipped',  price:100},
  {status:'pending',  price:50},
  {status:'shipped',  price:200},
  {status:'cancelled',price:75},
]

// YOUR CODE HERE:
// 1. filter shipped orders
// 2. map to price (use Maybe for safety)
// 3. sum with transduce
// 4. log result (expect 300)
`,
      hint: 'const xf=pipe(filterT(o=>o.status==="shipped"),mapT(o=>Maybe.of(o.price).getOrElse(0))); const total=transduce(xf,(a,v)=>a+v,0,orders); console.log(total);',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(300)
      },
    },

    { type: 'checkpoint', id: 'cp-transducer' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the Maybe chain. Watch this._value at each map call: if it is null, the function is skipped and the same Nothing is returned. See how chain avoids double-wrapping by calling fn directly. Then step through the transducer: watch the xf(reducer) composition produce a new function. Trace one array element through the composed reducer: filterT checks the predicate, and if it passes, hands off to mapT, which transforms and passes to the final sumReducer.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-functional',
      text: 'Step through Maybe.map and see how Nothing propagates. Then trace a transducer composition: watch each element flow through filterT, then mapT, then the final reducer — all in a single reduce pass with no intermediate arrays.',
      code: `class Maybe{constructor(v){this._value=v}static of(v){return v==null?new Maybe(null):new Maybe(v)}isNothing(){return this._value==null}map(fn){if(this.isNothing())return this;return Maybe.of(fn(this._value))}chain(fn){if(this.isNothing())return this;return fn(this._value)}getOrElse(d){return this.isNothing()?d:this._value}}
function mapT(fn){return r=>(a,v)=>r(a,fn(v))}
function filterT(p){return r=>(a,v)=>p(v)?r(a,v):a}
function pipe(...fns){return x=>fns.reduce((v,f)=>f(v),x)}
function transduce(xf,reducer,init,coll){return coll.reduce(xf(reducer),init)}
console.log(Maybe.of(5).map(x=>x*2).map(x=>x+1).getOrElse(0))
console.log(Maybe.of(null).map(x=>x*2).map(x=>x+1).getOrElse(99))
const xf=pipe(filterT(x=>x%2===0),mapT(x=>x*3))
console.log(transduce(xf,(a,v)=>a+v,0,[1,2,3,4,5,6]))`,
      lang: 'js',
    },

  ],
}
