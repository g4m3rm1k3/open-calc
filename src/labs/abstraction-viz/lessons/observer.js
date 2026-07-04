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
        runCode: `class EventEmitter {
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
emitter.emit('login', { name: 'Alice', id: 42 })`,
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
        runCode: `class EventEmitter {
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
        runCode: `class EventEmitter {
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
  }
