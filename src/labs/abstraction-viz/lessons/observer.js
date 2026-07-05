export default   {
    id: 'observer',
    title: 'Observer',
    tag: 'Design Pattern',
    steps: [
      {
        title: 'The listener map',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }
}`,
        explanation: [
          '`EventEmitter` on line 1 stores one field: `this.listeners` — a plain object used as a map. Each key will be an event name (a string like `\'login\'` or `\'click\'`). Each value will be an array of callback functions. Subscribers push into these arrays; emitters loop through them. The map starts empty.',
          'CS — This is the Observer pattern (also called Publish/Subscribe). `EventEmitter` is the subject — it holds a registry of observers (subscribers). When the subject changes state, it notifies all registered observers by calling their callbacks. Subscribers and the emitter are decoupled — neither knows about the other\'s implementation.',
          'SE — Node.js\'s `EventEmitter` class is the most-used implementation: every readable stream, HTTP server, and child process extends it. The browser\'s `EventTarget` (`addEventListener`/`dispatchEvent`) is the DOM equivalent. React\'s synthetic event system wraps `EventTarget`. All three use the same structure: a map from event name to array of handlers.',
          'Without this: without `listeners`, there is no way to register or retrieve callbacks. A plain array would only support one event type. Using a `Map` instead of a plain object would be slightly more correct (no prototype collision risk for keys like `\'constructor\'`), but a plain object works here because event names are user-controlled strings.',
        ],
        active: [{ startLine: 3, endLine: 3, color: 'indigo', label: 'listeners — event → [callbacks]' }],
        connections: [],
      },
      {
        title: 'new EventEmitter() — constructor runs',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }
}

const emitter = new EventEmitter()`,
        explanation: [
          'Line 7 calls `new EventEmitter()`. Execution enters the constructor at line 2. Line 3 sets `this.listeners = {}` — a fresh empty object. The instance is stored in `emitter`. `emitter.listeners` is now `{}`. No event keys exist yet. No subscriber arrays exist yet.',
          'CS — `this.listeners = {}` uses `Object.create(Object.prototype)` internally — a plain object with the standard prototype chain. Every access to `this.listeners[\'login\']` when no `\'login\'` key exists returns `undefined` (not an error). This is used in `on()` to detect the first subscriber for an event: `if (!this.listeners[event])` catches `undefined`.',
          'SE — In production, EventEmitter instances are typically module-level singletons or per-connection objects. A chat server might create one `EventEmitter` per WebSocket connection, each with its own `listeners` map. The constructor initialises the state — every instance starts clean with its own independent map.',
          'Without this: if `this.listeners` were set to `null` instead of `{}`, every access like `this.listeners[event]` would throw `TypeError: Cannot read properties of null`. The empty object is the correct starting state — it is not "nothing", it is a valid empty map ready to accept keys.',
        ],
        active: [
          { startLine: 7, endLine: 7, color: 'emerald', label: 'create instance' },
          { startLine: 2, endLine: 4, color: 'indigo',  label: 'constructor runs' },
        ],
        connections: [{ fromLine: 7, toLine: 2, color: 'emerald', label: 'new' }],
      },
      {
        title: 'on() — register a callback',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
}

const emitter = new EventEmitter()`,
        explanation: [
          '`on(event, callback)` on line 6 registers a subscriber. Line 7: if no array exists for `event` yet, line 8 creates one. Line 10 pushes `callback` into the array. Any number of callbacks can be registered for the same event — they accumulate in the array. Multiple calls to `on(\'login\', fn)` all push into the same `listeners[\'login\']` array.',
          'CS — The guard `if (!this.listeners[event])` is a lazy initialisation: the array is created on the first subscriber for that event. `!this.listeners[event]` is `true` when `this.listeners[event]` is `undefined` (key never seen) or any other falsy value. An empty array `[]` is truthy, so subsequent subscribers skip the creation.',
          'SE — Node\'s `EventEmitter.on(event, listener)` is the canonical API. `emitter.on(\'data\', chunk => process(chunk))` registers a listener on a readable stream. `emitter.on(\'error\', err => handleError(err))` registers an error handler. Both use the same mechanism — push into an array under the event name key.',
          'Without this: if line 8 were missing — if `on` just called `this.listeners[event].push(callback)` without the guard — the first subscriber for any event would throw `TypeError: Cannot read properties of undefined (reading \'push\')`. The guard is mandatory: you cannot push into a non-existent array.',
        ],
        active: [{ startLine: 6, endLine: 11, color: 'violet', label: 'on() — push callback into array' }],
        connections: [],
      },
      {
        title: 'First subscriber registers',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))`,
        explanation: [
          'Line 16 calls `on(\'login\', handler)`. Execution enters `on()` at line 6. `this.listeners[\'login\']` is `undefined` — `!undefined` is `true`. Line 8 creates `this.listeners[\'login\'] = []`. Line 10 pushes the handler in. `this.listeners` is now `{ login: [handler1] }`. One callback stored, waiting for the `\'login\'` event to be emitted.',
          'CS — The handler `user => console.log(...)` is stored as a function reference — not called. It sits in the array until `emit(\'login\', data)` is called. This is deferred execution: the function is registered now, but runs later, when an event fires. This is the fundamental difference between passing a function (callback) and calling it.',
          'SE — `emitter.on(\'login\', handler)` is pull-based for the handler: the handler does not poll — it waits to be called. The emitter does not know what `handler` does; the handler does not know when it will be called. This decoupling is why the Observer pattern scales: add any number of subscribers without modifying the emitter.',
          'Without this: if `on` were called with `handler()` (called) instead of `handler` (reference), the handler would run immediately at registration time with no arguments — `user` would be `undefined`, and `user.name` would throw. Always pass callback references, never call them at registration.',
        ],
        active: [
          { startLine: 16, endLine: 16, color: 'emerald', label: 'subscribe' },
          { startLine: 6,  endLine: 10, color: 'violet',  label: 'on() runs — array created, handler pushed' },
        ],
        connections: [{ fromLine: 16, toLine: 6, color: 'emerald', label: 'enters on()' }],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
console.log(Object.keys(emitter.listeners))`,
      },
      {
        title: 'Second subscriber — array grows',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))`,
        explanation: [
          'Line 17 calls `on(\'login\')` a second time. This time `this.listeners[\'login\']` already exists (it is an array with one element) — `!array` is `false`. Line 8 is skipped. Line 10 pushes the second handler. `this.listeners` is now `{ login: [handler1, handler2] }`. Both will fire when `\'login\'` is emitted.',
          'CS — The array grows by one on every `on()` call for the same event. There is no limit — ten subscribers for the same event is ten functions in the array. Node\'s `EventEmitter` warns when a single event accumulates more than 10 listeners (configurable via `setMaxListeners`) — not an error, just a signal of a likely memory leak from forgotten registrations.',
          'SE — Multiple subscribers for the same event is the core value of the Observer pattern. A single `\'login\'` event can trigger: update the session store, write an audit log, send a welcome email, update last-login timestamp — each handler is independent. Adding a new behaviour is a new `on()` call, not a change to any existing handler.',
          'Without this: if `on` used assignment (`this.listeners[event] = [callback]`) instead of push, each `on()` call would overwrite the previous subscriber. Only the last registered handler would fire. The array accumulation — the push — is what makes multiple subscribers possible.',
        ],
        active: [
          { startLine: 17, endLine: 17, color: 'pink',   label: 'second subscriber' },
          { startLine: 10, endLine: 10, color: 'violet', label: 'push — array now has two' },
        ],
        connections: [{ fromLine: 17, toLine: 6, color: 'pink', label: 'enters on() again' }],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
emitter.on('login', function(user) { console.log('Audit: ' + user.id) })
console.log(emitter.listeners['login'].length)`,
      },
      {
        title: 'emit() — fire all subscribers',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(fn => fn(data))
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))`,
        explanation: [
          '`emit(event, data)` on line 13 retrieves the subscriber array and calls every function in it. Line 14: `this.listeners[event] || []` — if no subscribers exist for this event, default to an empty array (no error). Line 15: `fns.forEach(fn => fn(data))` calls each registered callback with `data`. Every subscriber fires in registration order.',
          'CS — `|| []` is the safe-emit guard. If `emit(\'logout\', user)` is called but nobody called `on(\'logout\', ...)`, `this.listeners[\'logout\']` is `undefined`. `undefined || []` returns `[]`. `[].forEach(...)` runs zero iterations. No error, no crash. This is defensive programming — `emit` should never throw because a subscriber forgot to register.',
          'SE — `fns.forEach` iterates a snapshot-at-call-time. If a subscriber calls `emitter.removeListener(\'login\', handler)` during emission (modifying `fns` while iterating), Node\'s implementation iterates a copy of the array made before emission starts. Here, `forEach` takes the current `fns` reference — removing mid-iteration could cause skipped handlers. Production implementations copy first: `[...fns].forEach(...)`.',
          'Without this: without the `|| []` default, calling `emit` for an event with no subscribers would throw `TypeError: Cannot read properties of undefined (reading \'forEach\')`. The emitter should never need to know whether anyone is listening — emitting to zero subscribers is a valid operation.',
        ],
        active: [{ startLine: 13, endLine: 16, color: 'emerald', label: 'emit() — call all stored fns' }],
        connections: [],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(function(fn) { fn(data) })
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
emitter.on('login', function(user) { console.log('Audit: ' + user.id) })
emitter.emit('login', { name: 'Alice', id: 42 })`,
      },
      {
        title: 'emit fires — enters emit()',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(fn => fn(data))
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))

emitter.emit('login', { name: 'Alice', id: 42 })`,
        explanation: [
          'Line 24 calls `emit(\'login\', { name: \'Alice\', id: 42 })`. Execution enters `emit()` at line 13. `event = \'login\'`, `data = { name: \'Alice\', id: 42 }`. Line 14 reads `this.listeners[\'login\']` — the array with two handlers. Line 15 starts `forEach`. Two handlers are about to fire in sequence.',
          'CS — The call stack at this moment: the outer call frame (line 24) → `emit()` frame. Inside `emit`, `fns` holds a reference to the handler array. `forEach` is about to create a new frame for each callback. The data object `{ name: \'Alice\', id: 42 }` is passed by reference — both handlers receive the same object in memory.',
          'SE — `emit` is synchronous: it blocks until all handlers have finished executing. This is the same as Node\'s `EventEmitter` — `emit` calls handlers synchronously in registration order and returns only after all handlers complete. Async handlers (returning Promises) are not awaited — the Promise floats unobserved. Production code that needs async handlers uses `AsyncEventEmitter` patterns.',
          'Without this: if `emit` were called with an object reference and a handler mutated `data` (e.g., `data.name = \'Bob\'`), subsequent handlers would see the mutated `data`. The emitter passes the original reference to every handler — handlers share the same data object. Defensive emitters call `Object.freeze(data)` before distribution.',
        ],
        active: [
          { startLine: 24, endLine: 24, color: 'emerald', label: 'emit fires' },
          { startLine: 13, endLine: 15, color: 'pink',    label: 'emit() body runs' },
        ],
        connections: [{ fromLine: 24, toLine: 13, color: 'emerald', label: 'enters emit()' }],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(function(fn) { fn(data) })
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
emitter.on('login', function(user) { console.log('Audit: ' + user.id) })
emitter.emit('login', { name: 'Alice', id: 42 })`,
      },
      {
        title: 'forEach calls handler 1',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(fn => fn(data))
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))

emitter.emit('login', { name: 'Alice', id: 42 })`,
        explanation: [
          '`forEach` first iteration: `fn` is the handler registered on line 21. `fn(data)` calls it with `{ name: \'Alice\', id: 42 }`. Inside the handler, `user.name` is `\'Alice\'`. The template literal evaluates to `\'Welcome, Alice!\'` and `console.log` prints it. The handler returns. `forEach` moves to the second element.',
          'CS — The emitter does not know what handler 1 does. It only knows handler 1 is callable and that it accepts one argument. `fn(data)` is an untyped dispatch — any function with any body can be in `fns`. This is the same late-binding mechanism as the callback and strategy patterns: the concrete behaviour is injected, not hardcoded.',
          'SE — In production, handler 1 might be: a welcome email sender, a session initialiser, a metrics counter increment, a push notification trigger. All registered with the same `emitter.on(\'login\', ...)` call. The emitter fires each in registration order. If handler 1 throws, `forEach` stops — handler 2 does not fire. Production emitters wrap each call in try/catch to isolate failures.',
          'Without this: if `fn(data)` were `fn.call(null, data)` instead, `this` inside the handler would be `null`. That matters when handlers are class methods that use `this.someProperty`. Node\'s `EventEmitter` preserves `this` binding by default — if you register `emitter.on(\'x\', this.handler)` you typically need `.bind(this)` to preserve the class context.',
        ],
        active: [
          { startLine: 24, endLine: 24, color: 'emerald', label: 'emit running' },
          { startLine: 15, endLine: 15, color: 'pink',    label: 'forEach — first fn call' },
          { startLine: 21, endLine: 21, color: 'indigo',  label: 'handler 1 fires' },
        ],
        connections: [
          { fromLine: 24, toLine: 13, color: 'emerald', label: 'emit()' },
          { fromLine: 15, toLine: 21, color: 'indigo',  label: 'fn(data)' },
        ],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(function(fn) { fn(data) })
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
emitter.on('login', function(user) { console.log('Audit: ' + user.id) })
emitter.emit('login', { name: 'Alice', id: 42 })`,
      },
      {
        title: 'forEach calls handler 2',
        code:
`class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(fn => fn(data))
  }
}

const emitter = new EventEmitter()

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))

emitter.emit('login', { name: 'Alice', id: 42 })`,
        explanation: [
          '`forEach` second iteration: `fn` is the handler registered on line 22. `fn(data)` calls it with the same `{ name: \'Alice\', id: 42 }` object. `user.id` is `42`. `console.log` prints `\'Audit: 42\'`. `forEach` has no more elements — `emit()` returns. One `emit` call, two handlers, two console lines printed in sequence.',
          'CS — Both handlers received the same reference to `data`. Neither mutated it — if one had set `data.id = 99`, the second handler would have seen `99`. Registration order is the execution order. This is deterministic and synchronous — `emit` is a sequential loop, not concurrent dispatch.',
          'SE — This dual-handler pattern mirrors production architectures: the `\'login\'` event drives an audit log handler and a welcome message handler simultaneously. Neither handler knows the other exists. Adding a third handler (e.g., update last-login timestamp) is one new `emitter.on(\'login\', updateTimestamp)` call — no changes to the emitter, no changes to existing handlers.',
          'Without this: if `fns.forEach` called each `fn` asynchronously (`setTimeout(fn, 0)` or `Promise.resolve().then(() => fn(data))`), handlers would run after `emit()` returned. Callers who called `emit()` expecting handlers to have run synchronously would see stale state. Synchronous `emit` is the simpler, more predictable contract — async dispatch requires explicit opt-in.',
        ],
        active: [
          { startLine: 24, endLine: 24, color: 'emerald', label: 'emit complete' },
          { startLine: 15, endLine: 15, color: 'pink',    label: 'forEach — second fn call' },
          { startLine: 22, endLine: 22, color: 'violet',  label: 'handler 2 fires' },
        ],
        connections: [
          { fromLine: 24, toLine: 13, color: 'emerald', label: 'emit()' },
          { fromLine: 15, toLine: 21, color: 'indigo',  label: 'fn(data)' },
          { fromLine: 15, toLine: 22, color: 'violet',  label: 'fn(data)' },
        ],
        runCode:
`class EventEmitter {
  constructor() { this.listeners = {} }
  on(event, callback) {
    if (!this.listeners[event]) { this.listeners[event] = [] }
    this.listeners[event].push(callback)
  }
  emit(event, data) {
    const fns = this.listeners[event] || []
    fns.forEach(function(fn) { fn(data) })
  }
}
const emitter = new EventEmitter()
emitter.on('login', function(user) { console.log('Welcome, ' + user.name + '!') })
emitter.on('login', function(user) { console.log('Audit: ' + user.id) })
emitter.emit('login', { name: 'Alice', id: 42 })`,
      },
    ],
  }
