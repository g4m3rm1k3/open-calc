---
series: design-patterns
level: 3
title: Behavioural Patterns — Observer, Strategy, Command, State
lang: javascript
---

# Behavioural Patterns — Observer, Strategy, Command, State

Behavioural patterns describe how objects communicate and distribute responsibility. The problem is coupling: if object A calls methods on object B directly, A must know about B. When there are many such relationships, the codebase becomes a tightly coupled web where changing one object breaks many others.

Behavioural patterns introduce indirection to decouple objects from each other.

## Observer

The Observer defines a one-to-many dependency: when one object (the subject) changes state, all its dependents (observers) are notified automatically.

```javascript
// MANUAL OBSERVER: the classic implementation
class EventEmitter {
  constructor() {
    this._listeners = {}   // { eventName: Set<callback> }
  }

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = new Set()
    this._listeners[event].add(callback)
    return () => this.off(event, callback)   // return unsubscribe function
  }

  off(event, callback) {
    this._listeners[event]?.delete(callback)
  }

  emit(event, ...args) {
    for (const cb of this._listeners[event] ?? []) {
      cb(...args)
    }
  }
}

// SUBJECT: the thing being observed
class UserStore extends EventEmitter {
  constructor() {
    super()
    this._users = new Map()
  }

  addUser(user) {
    this._users.set(user.id, user)
    this.emit('userAdded', user)        // notify all observers
  }

  deleteUser(id) {
    const user = this._users.get(id)
    if (user) {
      this._users.delete(id)
      this.emit('userDeleted', user)    // notify all observers
    }
  }
}

// OBSERVERS: react to changes without the store knowing about them
const store = new UserStore()

const unsubscribeA = store.on('userAdded', (user) => {
  sendWelcomeEmail(user.email)
})

const unsubscribeB = store.on('userAdded', (user) => {
  auditLog.write('user_created', { userId: user.id })
})

store.addUser({ id: 1, email: 'alice@example.com' })
// Both handlers run — store doesn't know they exist
```

```text
OBSERVER CHARACTERISTICS:
  → Subject knows observers exist but doesn't know what they do
  → Observers know what they do but don't know about each other
  → New observers can be added without modifying the subject
  → Observers can be added and removed at runtime

MEMORY LEAK: the most common Observer bug
  If you subscribe with .on('event', callback) but never call .off() or
  the returned unsubscribe function, the callback reference is held in
  the listener Set forever. The object the callback closes over cannot be
  garbage collected.
  
  Fix: always store the unsubscribe function and call it when the observer
  is destroyed. In React: return the cleanup from useEffect.
  useEffect(() => {
    const unsub = store.on('userAdded', handler)
    return unsub   // called when component unmounts
  }, [])
```

**CS lens:** Observer is an implementation of the **publish/subscribe** (pub/sub) model. The subject is the publisher; observers are subscribers. The key insight is that the publisher does not know who is subscribed — this is why adding a new observer requires no change to the publisher. This decoupling is why event-driven architectures scale: a new service can subscribe to `userCreated` events without requiring any change to the user service.

## Strategy

The Strategy defines a family of interchangeable algorithms and lets the caller choose which one to use at runtime.

```javascript
// PROBLEM: sorting by different criteria, formatting with different rules
// WITHOUT STRATEGY: giant switch statement in the function
function processOrder(order, mode) {
  if (mode === 'discount') {
    const discount = order.total * 0.1
    return { ...order, total: order.total - discount }
  } else if (mode === 'tax') {
    const tax = order.total * 0.08
    return { ...order, total: order.total + tax }
  } else if (mode === 'shipping') {
    const shipping = order.items.length * 2.99
    return { ...order, total: order.total + shipping }
  }
  // ...more modes added over time → function grows without bound
}

// WITH STRATEGY: each algorithm is a separate function (or object)
const ORDER_PROCESSORS = {
  discount: (order) => {
    const discount = order.total * 0.1
    return { ...order, total: order.total - discount, discount }
  },
  tax: (order) => {
    const tax = order.total * 0.08
    return { ...order, total: order.total + tax, tax }
  },
  shipping: (order) => {
    const shipping = order.items.length * 2.99
    return { ...order, total: order.total + shipping, shipping }
  },
}

function processOrder(order, mode) {
  const processor = ORDER_PROCESSORS[mode]
  if (!processor) throw new Error(`Unknown processor: ${mode}`)
  return processor(order)
}

// Adding a new strategy = adding one entry to the registry
// processOrder() never changes
ORDER_PROCESSORS.loyalty = (order) => {
  const points = Math.floor(order.total)
  return { ...order, loyaltyPoints: points }
}
```

```text
STRATEGY CHARACTERISTICS:
  → The algorithm is separated from the code that uses it
  → Strategies are interchangeable — they have the same signature
  → The caller chooses the strategy; the strategy is passed in (injected)
  → Adding a new strategy doesn't require modifying existing code

STRATEGY vs SWITCH:
  A switch statement that selects behaviour based on a type string is the
  "flag smell" — it suggests a missing Strategy.
  If you find yourself adding new cases to the same switch over time:
  that switch should be a strategy registry.

STRATEGY IN THE WILD:
  → Array.sort(compareFn): the compare function is the strategy
  → Array.filter(predicate): the predicate is the strategy
  → passport.js strategies: LocalStrategy, JWTStrategy, GoogleStrategy
  → Jest's expect matchers: each matcher is a strategy
```

## Command

The Command pattern encapsulates a request as an object, allowing you to parameterise, queue, log, or undo operations.

```javascript
// PROBLEM: implementing undo/redo for a text editor

// WITHOUT COMMAND: undo is impossible (we've lost what was done)
function formatBold(editor) {
  editor.insertBeforeCursor('**')
  editor.insertAfterCursor('**')
  // How do we undo this? We don't know where the cursor was or what was selected.
}

// WITH COMMAND: every operation is an object with execute() and undo()
class BoldCommand {
  constructor(editor, selection) {
    this.editor = editor
    this.selection = selection   // the text range to bold
  }

  execute() {
    this.editor.wrap(this.selection, '**', '**')
  }

  undo() {
    this.editor.unwrap(this.selection, '**', '**')
  }
}

// COMMAND HISTORY: enables undo/redo
class CommandHistory {
  constructor() {
    this._done = []
    this._undone = []
  }

  execute(command) {
    command.execute()
    this._done.push(command)
    this._undone = []   // redo stack is cleared when a new command is executed
  }

  undo() {
    const cmd = this._done.pop()
    if (cmd) { cmd.undo(); this._undone.push(cmd) }
  }

  redo() {
    const cmd = this._undone.pop()
    if (cmd) { cmd.execute(); this._done.push(cmd) }
  }
}
```

```javascript
// COMMAND AS FUNCTION (JavaScript idiom): for simple cases without undo
const commands = [
  () => sendEmail(user, 'Welcome!'),
  () => auditLog.write('user_created', user),
  () => notificationService.send(user, 'Your account is ready'),
]

// Execute all commands (a queue)
for (const cmd of commands) cmd()

// Execute asynchronously with retry logic
async function executeWithRetry(command, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await command() } catch (e) {
      if (i === maxRetries - 1) throw e
      await delay(1000 * 2 ** i)
    }
  }
}
```

```text
COMMAND CHARACTERISTICS:
  → The operation is encapsulated as an object (or function)
  → Commands can be: stored, queued, logged, undone, retried
  → The sender of a command doesn't need to know what it does
  
WHEN TO USE COMMAND:
  ✓ You need undo/redo
  ✓ You need to queue operations for later or async execution
  ✓ You need to log operations with their parameters (audit trail)
  ✓ You need to retry failed operations
  
COMMAND IN THE WILD:
  → Redux actions: every state change is a Command
  → Database transactions: a transaction is a queue of Commands + undo (rollback)
  → Job queues (Bull, BullMQ): each job is a Command object
  → Git commits: each commit is a snapshot + diff that can be reverted
```

## State

The State pattern allows an object to change its behaviour when its internal state changes. The object appears to change its class.

```javascript
// PROBLEM: a TCP connection with different valid operations per state
// WITHOUT STATE: nested conditionals everywhere
class TcpConnection {
  constructor() {
    this._state = 'closed'
  }

  open() {
    if (this._state === 'closed') {
      this._state = 'open'
      return 'Connected'
    }
    if (this._state === 'open') return 'Already open'
    if (this._state === 'closing') throw new Error('Cannot open while closing')
  }

  send(data) {
    if (this._state !== 'open') throw new Error('Cannot send on ' + this._state + ' connection')
    return `Sent: ${data}`
  }

  close() {
    if (this._state === 'open') { this._state = 'closed'; return 'Closed' }
    if (this._state === 'closed') return 'Already closed'
  }
  // This gets worse as more states and transitions are added
}

// WITH STATE: each state is an object with methods for valid transitions
const STATES = {
  closed: {
    open:  (ctx) => { ctx.state = 'open'; return 'Connected' },
    send:  ()    => { throw new Error('Cannot send — connection is closed') },
    close: ()    => 'Already closed',
  },
  open: {
    open:  ()    => 'Already open',
    send:  (ctx, data) => `Sent: ${data}`,
    close: (ctx) => { ctx.state = 'closed'; return 'Closed' },
  },
}

class TcpConnection {
  constructor() {
    this.state = 'closed'
  }

  open()       { return STATES[this.state].open(this) }
  send(data)   { return STATES[this.state].send(this, data) }
  close()      { return STATES[this.state].close(this) }
}
```

```text
STATE vs STRATEGY:
  Both delegate behaviour to a separate object.
  
  Strategy: the algorithm is set by the CALLER and doesn't change during use.
    "Sort with this comparator." The comparator doesn't change itself.

  State: the state transitions ITSELF based on what happens.
    "A closed connection opens itself when open() is called."
    The object changes which state it's in as operations are performed.

STATE IN THE WILD:
  → Traffic lights: each light state (red/yellow/green) defines the next transition
  → Order lifecycle: pending → confirmed → shipped → delivered → returned
  → Authentication flow: unauthenticated → authenticating → authenticated → expired
  → UI form: idle → validating → submitting → success/error
```

**SE lens:** The State pattern eliminates the conditional explosion problem: each time you add a new state to a switch statement, you must update every branch in every method. With the State pattern, adding a new state means adding a new entry to the STATES registry. Existing states are untouched. This is the Open/Closed Principle applied to state machines: open for extension (new states), closed for modification (existing states don't change). State machines are also easily visualised as diagrams, making them a communication tool as well as a code structure.

**Common mistakes:**
- Observer without cleanup — subscribing to events in component mount/constructor without unsubscribing in unmount/destructor causes memory leaks and "setState on unmounted component" warnings in React.
- Strategy without a default case — if the caller can pass any string as the strategy name, always validate against the registry and throw a clear error for unknown strategies. Silent fallbacks (returning undefined) hide configuration errors.
- Command with no undo for partial operations — if a Command's `execute()` performs multiple steps (write to DB, send email, update cache) and fails halfway, `undo()` must handle partial execution. Always track what was completed in `execute()` so `undo()` knows what to reverse.

**Debug tip:** For Observer memory leaks: browser DevTools → Memory → Heap Snapshot. Search for your subscriber function name. If it appears more times than expected (e.g., once per component render rather than once total), you have a leak. For State machines: add a `console.log('state transition:', this.state, '→', newState)` before each transition to trace the path through the state machine during debugging.

## Challenge: createEventEmitter

Implement a minimal, correct EventEmitter.

```challenge
function createEventEmitter() {
  // Returns an object with:
  //   .on(event, callback)  — subscribes; returns an unsubscribe function
  //   .off(event, callback) — unsubscribes
  //   .emit(event, ...args) — calls all callbacks for the event with args
  //
  // Constraints:
  //   - Calling off() for a callback that was never subscribed is a no-op
  //   - Calling emit() for an event with no subscribers is a no-op
  //   - Multiple subscriptions to the same callback for the same event:
  //     only subscribe once (use a Set, not an array)
  //   - The unsubscribe function returned by .on() must work correctly
}
```

```test
const ee = createEventEmitter()
const results = []

// on + emit
const unsub1 = ee.on('data', (v) => results.push(v))
ee.emit('data', 42)
assert results[0] === 42

// multiple listeners
const unsub2 = ee.on('data', (v) => results.push(v * 2))
ee.emit('data', 10)
assert results.includes(10)
assert results.includes(20)

// unsubscribe via returned function
unsub1()
const prevLen = results.length
ee.emit('data', 99)
assert results.length === prevLen + 1   // only unsub2 listener still active

// off() directly
ee.off('data', unsub2._cb ?? (() => {}))   // off on unknown — no-op

// no-op emit on unknown event
ee.emit('unknown', 'x')   // should not throw

// same callback subscribed twice → only called once
const counted = []
const cb = (v) => counted.push(v)
ee.on('click', cb)
ee.on('click', cb)   // duplicate
ee.emit('click', 1)
assert counted.length === 1   // not 2
```
