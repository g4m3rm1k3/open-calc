// Code grows one piece at a time.
// Execution steps highlight the call site + the function body it enters.
// Connections are arrows: fromLine = caller, toLine = callee entry.
// Results appear as comments at the call site.

export const LESSONS = [

  // ── CALLBACK ───────────────────────────────────────────────────────────────
  {
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
        explanation: 'greet takes a name and returns a greeting. It is a plain function — nothing special yet. It takes input on line 1 and produces output on line 2. This is the function we will later pass as a callback.',
        active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'greet' }],
        connections: [],
      },
      {
        title: 'Call greet — trace execution',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

greet('Alice')  // → 'Hello, Alice!'`,
        explanation: 'Line 5 calls greet. Execution jumps to line 1 — name receives "Alice". Line 2 evaluates the template literal and returns the string. Control returns to line 5 and the result is the comment you see.',
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
        explanation: 'shout has the exact same signature as greet: one string in, one string out. The body is different — it uppercases and shouts. But the shape matches. That shared shape is what makes both functions valid as callbacks.',
        active: [
          { startLine: 5, endLine: 7, color: 'pink', label: 'shout — same shape, louder' },
        ],
        connections: [],
      },
      {
        title: 'Call shout — same trace, different body',
        code:
`function greet(name) {
  return \`Hello, \${name}!\`
}

function shout(name) {
  return \`HEY \${name.toUpperCase()}!\`
}

greet('Alice')  // → 'Hello, Alice!'
shout('Alice')  // → 'HEY ALICE!'`,
        explanation: 'Both functions called independently. Line 9 enters greet, line 10 enters shout. Same input "Alice", completely different output. The only difference is which function body runs.',
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
        explanation: 'runWith takes fn — any function — and value. Line 10 calls fn(value). runWith does not know or care what fn does. It just calls it. fn is the slot: whatever function you pass in will be called with value.',
        active: [
          { startLine: 9,  endLine: 11, color: 'violet', label: 'runWith — fn is the slot' },
        ],
        connections: [],
      },
      {
        title: 'runWith(greet) — enters runWith',
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

runWith(greet, 'Alice')`,
        explanation: 'Line 13 calls runWith with greet as fn and "Alice" as value. Execution jumps into runWith at line 9. Inside, fn is now greet and value is "Alice". Line 10 is about to dispatch fn("Alice").',
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

runWith(greet, 'Alice')  // → 'Hello, Alice!'`,
        explanation: 'Line 10 runs fn("Alice"). fn is greet, so JavaScript jumps to line 1. greet evaluates the template literal and returns "Hello, Alice!". That value travels back through runWith and out to line 13.',
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

runWith(greet, 'Alice')  // → 'Hello, Alice!'
runWith(shout, 'Alice')  // → 'HEY ALICE!'`,
        explanation: 'Line 14 passes shout instead of greet. runWith is identical — same body, same line 10. But fn is now shout, so fn("Alice") dispatches to line 5. Same runWith. Two completely different execution paths. That is the callback pattern.',
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
  },

  // ── OBSERVER ───────────────────────────────────────────────────────────────
  {
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
        explanation: 'EventEmitter holds a map called listeners. Each key is an event name like "login" or "click". Each value is an array of functions. Subscribers push into these arrays. Emitters loop through them. The map starts empty.',
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
        explanation: 'Line 7 creates an instance. Execution enters the constructor at line 2. Line 3 sets this.listeners to an empty object. emitter.listeners is now {}. No subscribers yet.',
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
        explanation: 'on() registers a callback under an event name. If no array exists for that event yet, lines 7-9 create one. Then line 10 pushes the callback in. Multiple subscribers can share the same event name.',
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

emitter.on('login', user => console.log(\`Welcome, \${user.name}!\`))
// listeners['login'] = [handler1]`,
        explanation: 'Line 16 calls on("login", handler). Execution enters on() at line 6. listeners["login"] does not exist, so line 8 creates an empty array. Line 10 pushes the handler in. One callback is now stored.',
        active: [
          { startLine: 16, endLine: 17, color: 'emerald', label: 'subscribe' },
          { startLine: 6,  endLine: 10, color: 'violet',  label: 'on() runs — array created, handler pushed' },
        ],
        connections: [{ fromLine: 16, toLine: 6, color: 'emerald', label: 'enters on()' }],
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
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))
// listeners['login'] = [handler1, handler2]`,
        explanation: 'Line 17 calls on("login") again. This time listeners["login"] already exists — line 7-9 is skipped. Line 10 pushes the second handler. The same array now holds two functions. Both will fire when "login" is emitted.',
        active: [
          { startLine: 17, endLine: 18, color: 'pink',   label: 'second subscriber' },
          { startLine: 10, endLine: 10, color: 'violet', label: 'push — array now has two' },
        ],
        connections: [{ fromLine: 17, toLine: 6, color: 'pink', label: 'enters on() again' }],
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
emitter.on('login', user => console.log(\`Audit: \${user.id}\`))
// listeners['login'] = [handler1, handler2]`,
        explanation: 'emit() reads the array for the event and calls every function in it. Line 14 fetches the array (or empty if nobody subscribed). Line 15 loops through with forEach. Each fn(data) call is one subscriber firing.',
        active: [{ startLine: 13, endLine: 16, color: 'emerald', label: 'emit() — call all stored fns' }],
        connections: [],
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
        explanation: 'Line 24 calls emit("login", { name, id }). Execution enters emit() at line 13. Line 14 reads listeners["login"] — the array with two handlers. Line 15 begins the forEach loop.',
        active: [
          { startLine: 24, endLine: 24, color: 'emerald', label: 'emit fires' },
          { startLine: 13, endLine: 15, color: 'pink',    label: 'emit() body runs' },
        ],
        connections: [{ fromLine: 24, toLine: 13, color: 'emerald', label: 'enters emit()' }],
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

emitter.emit('login', { name: 'Alice', id: 42 })
// → Welcome, Alice!`,
        explanation: 'forEach calls fn(data) for each handler. First iteration: fn is the handler on line 21. It fires and logs "Welcome, Alice!". The emitter does not know what this function does — it just calls it.',
        active: [
          { startLine: 24, endLine: 25, color: 'emerald', label: 'emit running' },
          { startLine: 15, endLine: 15, color: 'pink',    label: 'forEach — first fn call' },
          { startLine: 21, endLine: 21, color: 'indigo',  label: 'handler 1 fires' },
        ],
        connections: [
          { fromLine: 24, toLine: 13, color: 'emerald', label: 'emit()' },
          { fromLine: 15, toLine: 21, color: 'indigo',  label: 'fn(data)' },
        ],
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

emitter.emit('login', { name: 'Alice', id: 42 })
// → Welcome, Alice!
// → Audit: 42`,
        explanation: 'Second iteration: fn is the handler on line 22. It fires and logs "Audit: 42". Both handlers received the same data object and did completely different things with it. The emitter fired once and both subscribers responded.',
        active: [
          { startLine: 24, endLine: 26, color: 'emerald', label: 'emit complete' },
          { startLine: 15, endLine: 15, color: 'pink',    label: 'forEach — second fn call' },
          { startLine: 22, endLine: 22, color: 'violet',  label: 'handler 2 fires' },
        ],
        connections: [
          { fromLine: 24, toLine: 13, color: 'emerald', label: 'emit()' },
          { fromLine: 15, toLine: 21, color: 'indigo',  label: 'fn(data)' },
          { fromLine: 15, toLine: 22, color: 'violet',  label: 'fn(data)' },
        ],
      },
    ],
  },

  // ── STRATEGY ───────────────────────────────────────────────────────────────
  {
    id: 'strategy',
    title: 'Strategy',
    tag: 'Design Pattern',
    steps: [
      {
        title: 'sortUsers — context, not logic',
        code:
`function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
        explanation: 'sortUsers does not decide how to sort. It delegates: [...users] copies the array, then sort(strategy) calls your function for every comparison pair. strategy is a slot — pass in anything with the right shape.',
        active: [{ startLine: 1, endLine: 3, color: 'violet', label: 'sortUsers — slot for strategy' }],
        connections: [],
      },
      {
        title: 'sortByName — the first strategy',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
        explanation: 'sortByName is a comparator. sort() calls it with two items. A negative return means a goes first, positive means b goes first, zero means equal. localeCompare handles all of that for strings.',
        active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'sortByName — comparator function' }],
        connections: [],
      },
      {
        title: 'The data',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]`,
        explanation: 'Three users in unsorted order: Charlie, Alice, Bob. We want to sort this array three different ways without changing sortUsers. The strategy parameter is what makes that possible.',
        active: [{ startLine: 9, endLine: 13, color: 'emerald', label: 'data — unsorted' }],
        connections: [],
      },
      {
        title: 'sortUsers(users, sortByName) — enters sortUsers',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

sortUsers(users, sortByName)`,
        explanation: 'Line 15 calls sortUsers. Execution enters at line 5. strategy is now sortByName. sort() will call strategy(a, b) repeatedly, jumping into sortByName for each comparison.',
        active: [
          { startLine: 15, endLine: 15, color: 'emerald', label: 'call site' },
          { startLine: 5,  endLine: 7,  color: 'violet',  label: 'sortUsers — strategy = sortByName' },
        ],
        connections: [{ fromLine: 15, toLine: 5, color: 'emerald', label: 'enters' }],
      },
      {
        title: 'strategy(a, b) dispatches to sortByName',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

sortUsers(users, sortByName)
// → [Alice, Bob, Charlie]`,
        explanation: 'sort() calls strategy(a, b) for each pair. Execution jumps to sortByName at line 1. localeCompare returns the ordering. sort uses these results to arrange the array. Result: alphabetical order.',
        active: [
          { startLine: 15, endLine: 16, color: 'emerald', label: '→ alphabetical' },
          { startLine: 6,  endLine: 6,  color: 'violet',  label: 'sort dispatches strategy(a,b)' },
          { startLine: 1,  endLine: 3,  color: 'indigo',  label: 'sortByName fires per comparison' },
        ],
        connections: [
          { fromLine: 15, toLine: 5, color: 'emerald', label: 'enters sortUsers' },
          { fromLine: 6,  toLine: 1, color: 'indigo',  label: 'strategy(a,b)' },
        ],
      },
      {
        title: 'sortByAge — a second strategy',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortByAge(a, b) {
  return a.age - b.age
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

sortUsers(users, sortByName)  // → [Alice, Bob, Charlie]
sortUsers(users, sortByAge)   // → [Alice, Bob, Charlie]`,
        explanation: 'sortByAge subtracts ages — negative means younger first. Line 20 passes it to sortUsers. The sort body on line 10 is identical. sort() now calls sortByAge instead. Same context, different strategy, different result.',
        active: [
          { startLine: 5,  endLine: 7,  color: 'pink',    label: 'sortByAge — second strategy' },
          { startLine: 20, endLine: 20, color: 'emerald', label: 'swap strategy' },
          { startLine: 9,  endLine: 11, color: 'violet',  label: 'sortUsers — unchanged' },
        ],
        connections: [
          { fromLine: 20, toLine: 9, color: 'emerald', label: 'enters' },
          { fromLine: 10, toLine: 5, color: 'pink',    label: 'strategy = sortByAge' },
        ],
      },
    ],
  },

  // ── SINGLETON ──────────────────────────────────────────────────────────────
  {
    id: 'singleton',
    title: 'Singleton',
    tag: 'Design Pattern',
    steps: [
      {
        title: 'Config class',
        code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}`,
        explanation: 'Config stores application settings. If you called new Config() freely, every call would produce a separate object with separate settings — changes in one would not appear in another. The Singleton pattern prevents that.',
        active: [{ startLine: 1, endLine: 8, color: 'indigo', label: 'Config — needs exactly one instance' }],
        connections: [],
      },
      {
        title: 'The guard variable',
        code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}`,
        explanation: '_instance is the guard. It starts null. getConfig() checks it first: if null, create Config and store it. If not null, skip creation and return what is already there. new Config() can only run once.',
        active: [
          { startLine: 10, endLine: 10, color: 'emerald', label: '_instance — the guard' },
          { startLine: 12, endLine: 16, color: 'violet',  label: 'getConfig — check before creating' },
        ],
        connections: [],
      },
      {
        title: 'First call — guard passes',
        code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()`,
        explanation: 'Line 18 calls getConfig(). Execution enters at line 12. Line 13: !_instance is true. Line 14 runs new Config() — the constructor fires at line 2, settings are created. _instance now holds the Config.',
        active: [
          { startLine: 18, endLine: 18, color: 'emerald', label: 'first call' },
          { startLine: 13, endLine: 14, color: 'violet',  label: 'guard passes — creates Config' },
          { startLine: 2,  endLine: 7,  color: 'indigo',  label: 'constructor runs' },
        ],
        connections: [
          { fromLine: 18, toLine: 12, color: 'emerald', label: 'enters' },
          { fromLine: 14, toLine: 2,  color: 'indigo',  label: 'new Config()' },
        ],
      },
      {
        title: 'Second call — guard blocks',
        code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()
const b = getConfig()`,
        explanation: 'Line 19 calls getConfig() again. Execution enters at line 12. _instance is no longer null — the condition is false. Line 14 is skipped entirely. Line 16 returns the same instance that was created before. No new Config is built.',
        active: [
          { startLine: 19, endLine: 19, color: 'emerald', label: 'second call' },
          { startLine: 13, endLine: 13, color: 'violet',  label: 'guard blocks — _instance exists' },
          { startLine: 16, endLine: 16, color: 'violet',  label: 'returns existing instance' },
        ],
        connections: [{ fromLine: 19, toLine: 12, color: 'emerald', label: 'enters' }],
      },
      {
        title: 'Same object — mutation proves it',
        code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()
const b = getConfig()

a.settings.theme = 'light'

console.log(b.settings.theme) // → 'light'
console.log(a === b)          // → true`,
        explanation: 'Line 22 mutates a.settings.theme. Line 24 reads b.settings.theme and gets "light". a and b are the same reference — not copies. Line 25 confirms: a === b is true. One object, two names. The singleton held.',
        active: [
          { startLine: 22, endLine: 22, color: 'pink',    label: 'mutate via a' },
          { startLine: 24, endLine: 25, color: 'emerald', label: 'b sees same change — same object' },
        ],
        connections: [],
      },
    ],
  },

  // ── MAP · FILTER · REDUCE ─────────────────────────────────────────────────
  {
    id: 'hof',
    title: 'map · filter · reduce',
    tag: 'Functional',
    steps: [
      {
        title: 'numbers — the source',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]`,
        explanation: 'Eight numbers. We will transform this array three different ways without writing a loop — using three higher-order functions that accept a callback to decide what to do with each element.',
        active: [{ startLine: 1, endLine: 1, color: 'indigo', label: 'source array' }],
        connections: [],
      },
      {
        title: 'map — transform every element',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

const doubled = numbers.map(n => n * 2)`,
        explanation: 'map calls n => n * 2 once for every element. Each return value is collected into a new array in the same position. The original array is untouched. map is a one-to-one transformation.',
        active: [
          { startLine: 1, endLine: 1, color: 'indigo',  label: 'source' },
          { startLine: 3, endLine: 3, color: 'emerald', label: 'map — callback runs 8 times' },
        ],
        connections: [],
      },
      {
        title: 'map result',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

const doubled = numbers.map(n => n * 2)
// → [2, 4, 6, 8, 10, 12, 14, 16]`,
        explanation: 'Every element doubled. 1→2, 2→4 ... 8→16. Eight inputs, eight outputs, same order. map is pure transformation — shape preserved, values changed.',
        active: [
          { startLine: 3, endLine: 4, color: 'emerald', label: '8 in → 8 out' },
        ],
        connections: [],
      },
      {
        title: 'filter — keep matching elements',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

const doubled = numbers.map(n => n * 2)
// → [2, 4, 6, 8, 10, 12, 14, 16]

const evens = numbers.filter(n => n % 2 === 0)
// → [2, 4, 6, 8]`,
        explanation: 'filter calls n => n % 2 === 0 for every element. Return true: element survives into the new array. Return false: element is dropped. filter shrinks the array — fewer outputs than inputs.',
        active: [
          { startLine: 6, endLine: 7, color: 'violet', label: 'filter — true keeps, false drops' },
        ],
        connections: [],
      },
      {
        title: 'reduce — fold to one value',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

const doubled = numbers.map(n => n * 2)
// → [2, 4, 6, 8, 10, 12, 14, 16]

const evens = numbers.filter(n => n % 2 === 0)
// → [2, 4, 6, 8]

const sum = numbers.reduce((acc, n) => acc + n, 0)
// → 36`,
        explanation: 'reduce calls (acc, n) => acc + n for every element. acc starts at 0. Round 1: acc=0+1=1. Round 2: acc=1+2=3. Round 3: acc=3+3=6 ... Round 8: acc=28+8=36. Many inputs collapse to one output.',
        active: [
          { startLine: 9,  endLine: 10, color: 'pink', label: 'reduce — acc accumulates' },
        ],
        connections: [],
      },
      {
        title: 'Chain — pipeline of three stages',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

const doubled = numbers.map(n => n * 2)
// → [2, 4, 6, 8, 10, 12, 14, 16]

const evens = numbers.filter(n => n % 2 === 0)
// → [2, 4, 6, 8]

const sum = numbers.reduce((acc, n) => acc + n, 0)
// → 36

const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 3)
  .reduce((acc, n) => acc + n, 0)
// → 60`,
        explanation: 'Chain them. filter runs first → [2,4,6,8]. That array flows into map → [6,12,18,24]. That flows into reduce → 6+12+18+24=60. Each method\'s output is the next method\'s input. No variables, no loops, one clean pipeline.',
        active: [
          { startLine: 12, endLine: 13, color: 'violet',  label: 'filter → [2,4,6,8]' },
          { startLine: 14, endLine: 14, color: 'pink',    label: 'map → [6,12,18,24]' },
          { startLine: 15, endLine: 16, color: 'emerald', label: 'reduce → 60' },
        ],
        connections: [
          { fromLine: 13, toLine: 14, color: 'violet', label: '[2,4,6,8]' },
          { fromLine: 14, toLine: 15, color: 'pink',   label: '[6,12,18,24]' },
        ],
      },
    ],
  },

  // ── CURRYING ───────────────────────────────────────────────────────────────
  {
    id: 'currying',
    title: 'Currying',
    tag: 'Functional',
    steps: [
      {
        title: 'add — two calls, one addition',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}`,
        explanation: 'add takes a and immediately returns another function. It does not add yet. The inner function will capture b later and perform a + b. Two separate calls. Two separate argument slots. One sum.',
        active: [{ startLine: 1, endLine: 5, color: 'indigo', label: 'add — takes a, returns fn' }],
        connections: [],
      },
      {
        title: 'add(5) — enters add, a=5, returns inner fn',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)`,
        explanation: 'Line 7 calls add(5). Execution enters line 1 — a is 5. Line 2 returns the inner function. add5 stores it. The inner function has permanently closed over a=5. add5 is a specialised function waiting for b.',
        active: [
          { startLine: 7, endLine: 7, color: 'emerald', label: 'add5 = add(5)' },
          { startLine: 1, endLine: 4, color: 'violet',  label: 'add runs — a=5, returns inner fn' },
        ],
        connections: [{ fromLine: 7, toLine: 1, color: 'emerald', label: 'enters add' }],
      },
      {
        title: 'add5(3) — inner fn runs, a from closure',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)

add5(3)  // → 8`,
        explanation: 'Line 9 calls add5(3). That calls the inner function with b=3. Line 3 runs: a + b. a is 5 from the closure. 5 + 3 = 8. The result travels to line 9.',
        active: [
          { startLine: 9, endLine: 9, color: 'emerald', label: 'add5(3) → 8' },
          { startLine: 2, endLine: 4, color: 'violet',  label: 'inner fn — a=5 from closure' },
        ],
        connections: [{ fromLine: 9, toLine: 2, color: 'emerald', label: 'calls inner fn' }],
      },
      {
        title: 'add5 called with different values',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5 = add(5)

add5(3)   // → 8
add5(10)  // → 15
add5(0)   // → 5`,
        explanation: 'add5 is reusable. b changes every call, a is always 5. add5(3)=8, add5(10)=15, add5(0)=5. The closure keeps a alive between calls. This is partial application — one argument baked in, the rest supplied later.',
        active: [
          { startLine: 9,  endLine: 11, color: 'emerald', label: 'same a, different b' },
          { startLine: 2,  endLine: 4,  color: 'violet',  label: 'inner fn — a=5 always' },
        ],
        connections: [{ fromLine: 9, toLine: 2, color: 'emerald', label: 'calls inner fn' }],
      },
      {
        title: 'add10 — a second specialised function',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5  = add(5)
const add10 = add(10)

add5(3)   // → 8
add10(3)  // → 13`,
        explanation: 'add(10) runs the same way. a is 10 this time. add10 closes over a=10. add5(3)=8 and add10(3)=13 — same b, different a from each closure. Two independent specialised functions from one definition.',
        active: [
          { startLine: 8,  endLine: 8,  color: 'pink',    label: 'add10 — a=10 baked in' },
          { startLine: 10, endLine: 11, color: 'emerald', label: 'same b=3, different results' },
        ],
        connections: [
          { fromLine: 8,  toLine: 1, color: 'pink',    label: 'a=10' },
          { fromLine: 11, toLine: 2, color: 'pink',    label: 'inner fn — a=10' },
        ],
      },
      {
        title: 'Compose — output of one feeds the next',
        code:
`function add(a) {
  return function(b) {
    return a + b
  }
}

const add5  = add(5)
const add10 = add(10)

add5(3)          // → 8
add10(3)         // → 13
add5(add10(2))   // → 17`,
        explanation: 'Line 12: add10(2) runs first — a=10, b=2, returns 12. That result feeds into add5(12) — a=5, b=12, returns 17. Curried functions compose naturally. No glue code. The output of one is the argument to the next.',
        active: [
          { startLine: 12, endLine: 12, color: 'emerald', label: 'add5(add10(2)) = 17' },
          { startLine: 2,  endLine: 4,  color: 'violet',  label: 'add10 inner fn: a=10, b=2 → 12' },
          { startLine: 2,  endLine: 4,  color: 'indigo',  label: 'add5 inner fn: a=5, b=12 → 17' },
        ],
        connections: [
          { fromLine: 12, toLine: 2, color: 'violet', label: 'add10(2)=12' },
        ],
      },
    ],
  },

  // ── MEMOIZATION ────────────────────────────────────────────────────────────
  {
    id: 'memoization',
    title: 'Memoization',
    tag: 'Functional',
    steps: [
      {
        title: 'fibonacci — recursive but slow',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}`,
        explanation: 'fibonacci works. fibonacci(5) = fibonacci(4) + fibonacci(3). fibonacci(4) = fibonacci(3) + fibonacci(2). But fibonacci(3) is computed twice. fibonacci(35) makes over 29 million calls. Most of them duplicate previous work.',
        active: [{ startLine: 1, endLine: 4, color: 'indigo', label: 'fibonacci — correct, exponentially slow' }],
        connections: [{ fromLine: 3, toLine: 1, color: 'indigo', label: 'recursive' }],
      },
      {
        title: 'fibonacci(10) runs',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

fibonacci(10)  // → 55`,
        explanation: 'fibonacci(10) returns 55. It works. But to get there it called itself 177 times. fibonacci(35) would call itself 29 million times. fibonacci(50) would take minutes. The answer is always the same for the same input — yet it is recomputed every time.',
        active: [
          { startLine: 6, endLine: 6, color: 'emerald', label: 'fibonacci(10) → 55' },
          { startLine: 3, endLine: 3, color: 'indigo',  label: 'recursive — called 177 times for n=10' },
        ],
        connections: [{ fromLine: 6, toLine: 1, color: 'emerald', label: 'enters' }],
      },
      {
        title: 'memoize — cache + wrapper',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}`,
        explanation: 'memoize creates a Map and returns a wrapper around fn. The wrapper checks the cache before calling fn. Cache hit: return instantly. Cache miss: call fn, store result, return result. The original function is untouched.',
        active: [
          { startLine: 6,  endLine: 7,  color: 'violet', label: 'memoize — creates cache' },
          { startLine: 8,  endLine: 14, color: 'violet', label: 'wrapper — check before calling fn' },
        ],
        connections: [],
      },
      {
        title: 'Wrap fibonacci',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const fastFib = memoize(fibonacci)`,
        explanation: 'Line 16 calls memoize(fibonacci). memoize runs at line 6 — cache is created, wrapper is returned and stored as fastFib. fastFib looks like fibonacci but routes every call through the cache first. fibonacci itself is unchanged.',
        active: [
          { startLine: 16, endLine: 16, color: 'emerald', label: 'fastFib = memoize(fibonacci)' },
          { startLine: 6,  endLine: 14, color: 'violet',  label: 'memoize — creates and returns wrapper' },
        ],
        connections: [{ fromLine: 16, toLine: 6, color: 'emerald', label: 'enters memoize' }],
      },
      {
        title: 'fastFib(10) — cache miss',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const fastFib = memoize(fibonacci)

fastFib(10)  // → 55  (computed)`,
        explanation: 'Line 18 calls fastFib(10). Wrapper runs. key = "[10]". Line 10: cache has no "[10]" — miss. Line 11: fn(10) calls fibonacci. Fibonacci computes 55. Line 12: cache.set("[10]", 55). Line 13: returns 55.',
        active: [
          { startLine: 18, endLine: 18, color: 'emerald', label: 'first call — cache miss' },
          { startLine: 9,  endLine: 13, color: 'violet',  label: 'miss path — compute + store' },
          { startLine: 1,  endLine: 4,  color: 'indigo',  label: 'fibonacci(10) runs' },
        ],
        connections: [
          { fromLine: 18, toLine: 8,  color: 'emerald', label: 'enters wrapper' },
          { fromLine: 11, toLine: 1,  color: 'indigo',  label: 'cache miss: fn(10)' },
        ],
      },
      {
        title: 'fastFib(10) again — cache hit, instant',
        code:
`function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const fastFib = memoize(fibonacci)

fastFib(10)  // → 55  (computed)
fastFib(10)  // → 55  (cache hit — instant)
fastFib(35)  // → 9227465  (fast!)`,
        explanation: 'Line 19: fastFib(10) again. Wrapper runs. key = "[10]". Line 10: cache HAS "[10]" — hit! Return 55 instantly. Lines 11-13 never run. fibonacci is never called. Line 20: fastFib(35) — all sub-results also get cached as it computes down.',
        active: [
          { startLine: 19, endLine: 19, color: 'violet',  label: 'cache hit — fibonacci never called' },
          { startLine: 10, endLine: 10, color: 'emerald', label: 'cache.has → true, return instantly' },
          { startLine: 20, endLine: 20, color: 'pink',    label: 'fastFib(35) — sub-results cached too' },
        ],
        connections: [
          { fromLine: 19, toLine: 8,  color: 'violet',  label: 'enters wrapper' },
          { fromLine: 20, toLine: 8,  color: 'pink',    label: 'enters wrapper' },
        ],
      },
    ],
  },

  // ── LINKED LIST ────────────────────────────────────────────────────────────
  {
    id: 'linked-list',
    title: 'Linked List',
    tag: 'Data Structure',
    steps: [
      {
        title: 'Node — value and pointer',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}`,
        explanation: 'A Node holds two things: a value and a next pointer. next starts as null — pointing nowhere. The linked list is built by chaining nodes together: one node\'s next points to the next node. No arrays.',
        active: [
          { startLine: 3, endLine: 3, color: 'indigo', label: 'value — the data' },
          { startLine: 4, endLine: 4, color: 'violet', label: 'next — points to next node' },
        ],
        connections: [],
      },
      {
        title: 'Create a node and run it',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

const a = new Node(10)
// a.value = 10, a.next = null`,
        explanation: 'Line 8 creates a Node with value 10. Constructor runs at line 2. this.value = 10, this.next = null. a exists alone — it does not point to anything yet. This is one node, one link of the chain.',
        active: [
          { startLine: 8, endLine: 9, color: 'emerald', label: 'node created' },
          { startLine: 2, endLine: 5, color: 'indigo',  label: 'constructor runs' },
        ],
        connections: [{ fromLine: 8, toLine: 2, color: 'emerald', label: 'new Node(10)' }],
      },
      {
        title: 'Link two nodes',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

const a = new Node(10)
const b = new Node(20)

a.next = b
// a → b  (a.next points at b)`,
        explanation: 'Line 9 creates a second node. Line 11 links them: a.next = b. Now a.next is not null — it holds a reference to b. Following the chain: a.value=10, a.next.value=20, a.next.next=null. This is a two-node linked list.',
        active: [
          { startLine: 9,  endLine: 9,  color: 'violet',  label: 'second node' },
          { startLine: 11, endLine: 12, color: 'emerald', label: 'a.next = b — linked!' },
        ],
        connections: [{ fromLine: 11, toLine: 4, color: 'emerald', label: 'next → b' }],
      },
      {
        title: 'LinkedList — head and size',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }
}

const list = new LinkedList()
// head = null, size = 0`,
        explanation: 'LinkedList wraps the chain. head is the entry point — the first node. size tracks the count. Both start empty. Every traversal starts at head and follows next pointers. head is the only handle we have on the whole chain.',
        active: [
          { startLine: 8,  endLine: 12, color: 'violet',  label: 'LinkedList — head is the door' },
          { startLine: 15, endLine: 16, color: 'emerald', label: 'empty list created' },
        ],
        connections: [{ fromLine: 15, toLine: 9, color: 'emerald', label: 'new LinkedList()' }],
      },
      {
        title: 'append() — head is null branch',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const list = new LinkedList()

list.append(10)
// head → Node(10) → null`,
        explanation: 'Line 25 calls append(10). Line 15: new Node(10). Line 16: !this.head is true — list is empty. head = node, size=1, return. The first append always takes the head branch. The list is now [10].',
        active: [
          { startLine: 25, endLine: 26, color: 'emerald', label: 'first append — head was null' },
          { startLine: 15, endLine: 16, color: 'violet',  label: 'head = node — empty list branch' },
          { startLine: 2,  endLine: 5,  color: 'indigo',  label: 'Node(10) created' },
        ],
        connections: [
          { fromLine: 25, toLine: 14, color: 'emerald', label: 'enters append' },
          { fromLine: 15, toLine: 2,  color: 'indigo',  label: 'new Node()' },
        ],
      },
      {
        title: 'append(20) — walk to tail and link',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const list = new LinkedList()

list.append(10)
list.append(20)
// Node(10) → Node(20) → null`,
        explanation: 'Line 26 appends 20. new Node(20). Line 16: head exists — skip. Line 17: cur = head = Node(10). Line 18: cur.next is null — loop exits without iterating. Line 19: cur.next = Node(20). Chain: [10 → 20].',
        active: [
          { startLine: 26, endLine: 27, color: 'emerald', label: 'second append' },
          { startLine: 17, endLine: 20, color: 'violet',  label: 'walk to tail, link Node(20)' },
        ],
        connections: [
          { fromLine: 26, toLine: 14, color: 'emerald', label: 'enters append' },
          { fromLine: 19, toLine: 4,  color: 'violet',  label: 'cur.next = Node(20)' },
        ],
      },
      {
        title: 'append(30) — walks two hops',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const list = new LinkedList()

list.append(10)
list.append(20)
list.append(30)
// Node(10) → Node(20) → Node(30) → null`,
        explanation: 'Line 27 appends 30. cur starts at Node(10). cur.next is Node(20) — loop continues. cur = Node(20). cur.next is null — loop exits. cur.next = Node(30). The while loop walks as many hops as needed to reach the tail.',
        active: [
          { startLine: 27, endLine: 28, color: 'emerald', label: 'third append — two hops' },
          { startLine: 18, endLine: 18, color: 'violet',  label: 'while: walks 10→20→stop' },
          { startLine: 19, endLine: 19, color: 'violet',  label: 'links Node(30) to tail' },
        ],
        connections: [{ fromLine: 27, toLine: 14, color: 'emerald', label: 'enters append' }],
      },
      {
        title: 'toArray — follow the chain',
        code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }

  toArray() {
    const out = []; let cur = this.head
    while (cur) { out.push(cur.value); cur = cur.next }
    return out
  }
}

const list = new LinkedList()
list.append(10)
list.append(20)
list.append(30)

list.toArray()  // → [10, 20, 30]
list.size       // → 3`,
        explanation: 'toArray() starts at head and follows next until null. cur=Node(10): push 10, cur=Node(20). Push 20, cur=Node(30). Push 30, cur=null — loop exits. Returns [10, 20, 30]. Every linked list traversal follows this same pattern.',
        active: [
          { startLine: 23, endLine: 26, color: 'violet',  label: 'toArray — follow next pointers' },
          { startLine: 35, endLine: 36, color: 'emerald', label: 'result: [10, 20, 30]' },
        ],
        connections: [{ fromLine: 35, toLine: 23, color: 'emerald', label: 'enters toArray' }],
      },
    ],
  },

  // ── STACK ─────────────────────────────────────────────────────────────────
  {
    id: 'stack',
    title: 'Stack',
    tag: 'Data Structure',
    steps: [
      {
        title: 'Stack — items array',
        code:
`class Stack {
  constructor() {
    this.items = []
  }
}`,
        explanation: 'Stack wraps an array. All operations happen at one end — the top. The last element added is always the first one out. This is LIFO: Last In, First Out. Think of a stack of plates.',
        active: [{ startLine: 1, endLine: 5, color: 'indigo', label: 'Stack — LIFO via array' }],
        connections: [],
      },
      {
        title: 'push() — add to the top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }
}`,
        explanation: 'push() adds item to the end of the array — the top of the stack. Returning this from line 8 enables method chaining: stack.push("a").push("b").push("c"). Each push grows the stack.',
        active: [{ startLine: 6, endLine: 9, color: 'violet', label: 'push — add to top' }],
        connections: [],
      },
      {
        title: 'Push three items — stack builds up',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }
}

const stack = new Stack()

stack.push('a')
stack.push('b')
stack.push('c')
// items = ['a', 'b', 'c']  ← 'c' is the top`,
        explanation: 'Three pushes. items grows: ["a"], then ["a","b"], then ["a","b","c"]. "c" was added last, so "c" is at the top. This is where peek and pop will look first.',
        active: [
          { startLine: 14, endLine: 17, color: 'emerald', label: 'three pushes — c on top' },
          { startLine: 6,  endLine: 8,  color: 'violet',  label: 'push runs three times' },
        ],
        connections: [{ fromLine: 14, toLine: 6, color: 'emerald', label: 'push()' }],
      },
      {
        title: 'peek() — read the top without removing',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.peek()  // → 'c'`,
        explanation: 'peek() reads items[length - 1] — the last element, the top. Length is 3, so items[2] is "c". peek does not remove it. Call peek ten times and the stack is unchanged. It just looks.',
        active: [
          { startLine: 11, endLine: 13, color: 'violet',  label: 'peek — read top, do not remove' },
          { startLine: 19, endLine: 19, color: 'emerald', label: 'peek → "c"' },
        ],
        connections: [{ fromLine: 19, toLine: 11, color: 'emerald', label: 'enters peek' }],
      },
      {
        title: 'pop() — remove and return the top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  pop() {
    return this.items.pop()
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.peek()  // → 'c'    (top, not removed)
stack.pop()   // → 'c'    (removed — items now ['a','b'])`,
        explanation: 'pop() calls items.pop() which removes and returns the last element. "c" is removed. items is now ["a","b"]. LIFO: the last one in is the first one out.',
        active: [
          { startLine: 15, endLine: 16, color: 'pink',    label: 'pop — remove top' },
          { startLine: 23, endLine: 24, color: 'emerald', label: 'pop → "c", items shrinks' },
        ],
        connections: [{ fromLine: 24, toLine: 15, color: 'pink', label: 'enters pop' }],
      },
      {
        title: 'After pop — b is the new top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  pop() {
    return this.items.pop()
  }

  isEmpty() {
    return this.items.length === 0
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.pop()   // → 'c'   (removed)
stack.peek()  // → 'b'   (new top)
stack.pop()   // → 'b'
stack.pop()   // → 'a'
stack.isEmpty() // → true`,
        explanation: 'After popping "c", peek returns "b" — the new top. Pop again gets "b", then "a". isEmpty() returns true. The stack is exhausted. LIFO reversed the insertion order: pushed a,b,c — popped c,b,a.',
        active: [
          { startLine: 19, endLine: 21, color: 'violet',  label: 'isEmpty added' },
          { startLine: 27, endLine: 31, color: 'emerald', label: 'pop reverses insertion order' },
        ],
        connections: [
          { fromLine: 27, toLine: 15, color: 'pink',   label: 'pop()' },
          { fromLine: 28, toLine: 11, color: 'violet', label: 'peek()' },
        ],
      },
    ],
  },
]
