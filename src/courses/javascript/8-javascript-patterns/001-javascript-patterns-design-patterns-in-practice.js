// J14 — Lesson 7-1: JavaScript Patterns — Design Patterns in Practice

const LESSON_JS_CORE_7_1 = {
  title: 'JavaScript Patterns — Design Patterns in Practice',
  subtitle: 'Observer, pub/sub, singleton, factory, and state machine — the patterns behind every major library.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Why Patterns Matter

Design patterns are not abstract academic ideas — they are named solutions to recurring problems that every programmer eventually rediscovers. Learning their names gives you:

1. **Shared vocabulary** — say "use an observer here" instead of explaining 20 lines of code
2. **A template** — proven structure you can adapt, not reinvent
3. **Better reading** — React's state, Redux's store, EventEmitter — all named patterns under the hood

The patterns in this lesson come from the "Gang of Four" book (1994) and their JavaScript evolutions. We will implement each one from scratch, then show where you already see it in the ecosystem.

**The patterns covered:**
| Pattern | Family | Core Idea |
|---------|--------|-----------|
| **Observer** | Behavioral | Objects subscribe to another object's events |
| **Pub/Sub** | Behavioral | Decoupled messaging via a central event bus |
| **Singleton** | Creational | Ensure a class has exactly one instance |
| **Factory** | Creational | Create objects without specifying the exact class |
| **State Machine** | Behavioral | Model state transitions explicitly |`,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — The Observer Pattern

**Problem**: You have one object whose state changes, and multiple other objects need to react to those changes — but you don't want the source to know who is listening.

**Solution**: The subject maintains a list of observers. When state changes, it notifies all of them.

\`\`\`js
class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn);   // returns unsubscribe function
  }

  off(event, fn) {
    const fns = this.#listeners.get(event) || [];
    this.#listeners.set(event, fns.filter(f => f !== fn));
  }

  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach(fn => fn(...args));
  }
}
\`\`\`

**You already know this pattern**: \`element.addEventListener\` is the DOM's Observer. Node.js \`EventEmitter\` is the server-side version. React's \`useState\` notifies the component (observer) when state (subject) changes.

**In C#**: this is the \`event\` keyword and delegates. **In Java**: \`java.util.Observer\` / \`Observable\` (deprecated in Java 9, but the pattern lives on in libraries). **In Rust**: the \`tokio::sync::broadcast\` channel.`,
    },

    {
      type: 'js',
      instruction: `### Observer — Build an EventEmitter from Scratch

Every event system in JavaScript is built on this pattern.`,
      startCode: `class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn);  // unsubscribe function
  }

  off(event, fn) {
    const fns = this.#listeners.get(event) || [];
    this.#listeners.set(event, fns.filter(f => f !== fn));
  }

  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach(fn => fn(...args));
  }

  once(event, fn) {
    const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
    this.on(event, wrapper);
  }
}

// --- Usage ---
class Store extends EventEmitter {
  #state;

  constructor(initialState) {
    super();
    this.#state = initialState;
  }

  get state() { return { ...this.#state }; }

  setState(patch) {
    const prev = this.#state;
    this.#state = { ...this.#state, ...patch };
    this.emit('change', this.#state, prev);
  }
}

const store = new Store({ count: 0, user: 'alice' });

const unsub = store.on('change', (next, prev) => {
  console.log('changed: count', prev.count, '→', next.count);
});

store.once('change', () => console.log('first change only'));

store.setState({ count: 1 });
store.setState({ count: 2 });
unsub();
store.setState({ count: 3 });  // no log — unsubscribed

console.log('Final state:', store.state.count);`,
      outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Pub/Sub (Event Bus)

**Problem**: Observer requires the subject to know about the observer at subscribe time. In large apps, you want components that have never met to communicate.

**Solution**: A central **event bus** that nobody owns. Publishers fire events into the bus; subscribers listen from the bus. Neither knows the other exists.

\`\`\`js
// Publisher (a form component):
eventBus.publish('user:login', { id: 42, name: 'Alice' });

// Subscriber (an analytics component — completely decoupled):
eventBus.subscribe('user:login', ({ name }) => {
  analytics.track('login', { user: name });
});
\`\`\`

Observer = subject holds the list. Pub/Sub = a third-party bus holds the list.

**Real-world**: Redux's action → reducer flow is pub/sub. The store is the bus, actions are events, reducers are subscribers. Browser's \`CustomEvent\` + \`document.dispatchEvent\` is the DOM's pub/sub bus.`,
    },

    {
      type: 'js',
      instruction: `### Pub/Sub — Mini App with an Event Bus

Three completely independent components communicating through a shared bus — no direct references between them.`,
      startCode: `// The bus — owned by nobody
class EventBus {
  #channels = new Map();

  subscribe(topic, fn) {
    if (!this.#channels.has(topic)) this.#channels.set(topic, new Set());
    this.#channels.get(topic).add(fn);
    return () => this.#channels.get(topic)?.delete(fn);
  }

  publish(topic, data) {
    this.#channels.get(topic)?.forEach(fn => fn(data));
  }
}

const bus = new EventBus();
const log = [];

// Component A — Auth system
// Publishes events, does not know who listens
function authSystem() {
  function login(username) {
    console.log('[Auth] logging in:', username);
    bus.publish('user:login', { username, ts: Date.now() });
  }
  function logout() {
    bus.publish('user:logout', {});
  }
  return { login, logout };
}

// Component B — Analytics
// Subscribes, does not know who publishes
function analytics() {
  bus.subscribe('user:login', ({ username }) => {
    console.log('[Analytics] tracked login for:', username);
  });
  bus.subscribe('user:logout', () => {
    console.log('[Analytics] tracked logout');
  });
}

// Component C — Notification system
function notifications() {
  bus.subscribe('user:login', ({ username }) => {
    console.log('[Notifications] welcome back,', username + '!');
  });
}

// Wire up components — none of them reference each other
analytics();
notifications();
const auth = authSystem();

auth.login('alice');
auth.logout();
auth.login('bob');`,
      outputHeight: 260,
    },

    {
      type: 'js',
      instruction: `### Singleton — One Instance, Everywhere

The Singleton pattern ensures a class has exactly one instance, shared across the entire application. Used for config, logging, connection pools, and caches.`,
      startCode: `class Logger {
  static #instance = null;
  #logs = [];
  #level;

  constructor(level = 'info') {
    if (Logger.#instance) return Logger.#instance;  // return existing
    this.#level = level;
    Logger.#instance = this;
  }

  log(level, msg) {
    const entry = { level, msg, ts: new Date().toISOString() };
    this.#logs.push(entry);
    console.log('[' + level.toUpperCase() + ']', msg);
  }

  info(msg)  { this.log('info', msg); }
  warn(msg)  { this.log('warn', msg); }
  error(msg) { this.log('error', msg); }

  get history() { return [...this.#logs]; }

  static reset() { Logger.#instance = null; }  // for testing
}

// Multiple 'new Logger()' calls — same instance returned
const logger1 = new Logger('debug');
const logger2 = new Logger('warn');  // ignored — returns logger1

console.log('Same instance?', logger1 === logger2);  // true

logger1.info('App started');
logger2.warn('Low memory');    // uses logger1's state
logger1.error('Something failed');

console.log('Log count:', logger2.history.length);  // 3 — shared history`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `### Factory Pattern — Create Objects Without Knowing the Class

A factory function or method decides *which* class to instantiate based on input. The caller asks for a product and gets back the right type without caring about the constructor.`,
      startCode: `// Shape factory — returns the right shape based on type string
class Circle {
  constructor(r) { this.r = r; }
  area()      { return Math.PI * this.r ** 2; }
  perimeter() { return 2 * Math.PI * this.r; }
  toString()  { return 'Circle(r=' + this.r + ')'; }
}

class Rectangle {
  constructor(w, h) { this.w = w; this.h = h; }
  area()      { return this.w * this.h; }
  perimeter() { return 2 * (this.w + this.h); }
  toString()  { return 'Rect(' + this.w + 'x' + this.h + ')'; }
}

class Triangle {
  constructor(a, b, c) { this.sides = [a, b, c]; }
  area() {
    const s = this.sides.reduce((a, b) => a + b, 0) / 2;
    return Math.sqrt(s * this.sides.reduce((p, x) => p * (s - x), 1));
  }
  perimeter() { return this.sides.reduce((a, b) => a + b, 0); }
  toString()  { return 'Triangle(' + this.sides.join(',') + ')'; }
}

// The factory — caller never uses new Circle/Rectangle/Triangle directly
function createShape(type, ...args) {
  const shapes = { circle: Circle, rectangle: Rectangle, triangle: Triangle };
  const ShapeClass = shapes[type];
  if (!ShapeClass) throw new Error('Unknown shape: ' + type);
  return new ShapeClass(...args);
}

const shapes = [
  createShape('circle', 5),
  createShape('rectangle', 4, 6),
  createShape('triangle', 3, 4, 5),
];

shapes.forEach(s => {
  console.log(String(s) + ' — area: ' + s.area().toFixed(2) + ', perimeter: ' + s.perimeter().toFixed(2));
});`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `### State Machine — Model Transitions Explicitly

A state machine defines a fixed set of states and the valid transitions between them. Invalid transitions are rejected. Used for UIs, workflows, network connections, game logic.

This is the architecture behind XState, React Query's status field, and network socket lifecycle.`,
      startCode: `class StateMachine {
  #state;
  #transitions;
  #actions;

  constructor({ initial, transitions, actions = {} }) {
    this.#state = initial;
    this.#transitions = transitions;
    this.#actions = actions;
  }

  get state() { return this.#state; }

  send(event) {
    const key = this.#state + ':' + event;
    const next = this.#transitions[key];
    if (!next) {
      console.log('  [invalid]', event, 'in state', this.#state);
      return false;
    }
    const prev = this.#state;
    this.#state = next;
    this.#actions[key]?.({ from: prev, to: next, event });
    return true;
  }

  can(event) { return !!(this.#transitions[this.#state + ':' + event]); }
}

// Traffic light state machine
const light = new StateMachine({
  initial: 'red',
  transitions: {
    'red:advance':    'green',
    'green:advance':  'yellow',
    'yellow:advance': 'red',
    'red:emergency':  'flashing',
    'green:emergency':'flashing',
    'yellow:emergency':'flashing',
    'flashing:reset': 'red',
  },
  actions: {
    'red:advance':    ({ to }) => console.log('  → GO — light is now', to),
    'green:advance':  ({ to }) => console.log('  → SLOW — light is now', to),
    'yellow:advance': ({ to }) => console.log('  → STOP — light is now', to),
    'red:emergency':  ({ to }) => console.log('  → EMERGENCY MODE:', to),
    'flashing:reset': ({ to }) => console.log('  → Returning to normal:', to),
  },
});

console.log('Initial:', light.state);
light.send('advance');   // red → green
light.send('advance');   // green → yellow
light.send('advance');   // yellow → red
light.send('emergency'); // red → flashing
light.send('advance');   // invalid in flashing
light.send('reset');     // flashing → red
console.log('Final:', light.state);`,
      outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: EventEmitter with Wildcards

Extend the EventEmitter so that subscribing to \`'*'\` receives ALL events.

\`\`\`js
emitter.on('*', (event, data) => console.log('any:', event, data));
emitter.emit('login', 'alice');   // logs: any: login alice
emitter.emit('logout', 'bob');    // logs: any: logout bob
\`\`\`

Log exactly:
\`\`\`
any: login alice
any: logout bob
\`\`\``,
      startCode: `class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
  }

  emit(event, ...args) {
    // Call specific listeners AND wildcard '*' listeners
    // Wildcard callback signature: fn(event, ...args)
  }
}

const emitter = new EventEmitter();
emitter.on('*', (event, data) => console.log('any:', event, data));
emitter.emit('login', 'alice');
emitter.emit('logout', 'bob');`,
      solutionCode: `class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
  }

  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach(fn => fn(...args));
    (this.#listeners.get('*') || []).forEach(fn => fn(event, ...args));
  }
}

const emitter = new EventEmitter();
emitter.on('*', (event, data) => console.log('any:', event, data));
emitter.emit('login', 'alice');
emitter.emit('logout', 'bob');`,
      check: (code, logs) =>
        logs[0] === 'any: login alice' &&
        logs[1] === 'any: logout bob',
      successMessage: 'Correct! Wildcard listeners are how debug loggers in event systems work — subscribe once, see everything.',
      failMessage: 'In emit(), after calling specific listeners, also call any functions stored under the \'*\' key, passing (event, ...args).',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Traffic Light State Machine

Build a state machine for a \`Promise\` lifecycle with three states: \`pending\`, \`fulfilled\`, \`rejected\`.

Valid transitions:
- \`pending\` + \`resolve\` → \`fulfilled\`
- \`pending\` + \`reject\` → \`rejected\`
- No transitions from \`fulfilled\` or \`rejected\` (terminal states)

Log:
\`\`\`
pending
fulfilled
invalid: resolve in fulfilled
\`\`\``,
      startCode: `// Build a state machine for a Promise lifecycle
// States: 'pending', 'fulfilled', 'rejected'
// Transitions: pending+resolve→fulfilled, pending+reject→rejected
// Log state after construction, after resolve, and 'invalid: ...' if resolve called again`,
      solutionCode: `const transitions = {
  'pending:resolve':  'fulfilled',
  'pending:reject':   'rejected',
};

function createPromiseMachine() {
  let state = 'pending';
  return {
    get state() { return state; },
    send(event) {
      const next = transitions[state + ':' + event];
      if (!next) { console.log('invalid: ' + event + ' in ' + state); return; }
      state = next;
    }
  };
}

const p = createPromiseMachine();
console.log(p.state);
p.send('resolve');
console.log(p.state);
p.send('resolve');`,
      check: (code, logs) =>
        logs[0] === 'pending' &&
        logs[1] === 'fulfilled' &&
        logs[2] === 'invalid: resolve in fulfilled',
      successMessage: 'Correct! This is exactly how Promise internals work — once settled, a Promise ignores all further resolve/reject calls.',
      failMessage: 'Build transitions for pending→fulfilled and pending→rejected only. Log the invalid message when a transition does not exist.',
      outputHeight: 200,
    },

  ],
};

export default {
  id: 'js-core-7-1-patterns',
  slug: 'javascript-patterns-design-patterns-in-practice',
  chapter: 'js7.1',
  order: 0,
  title: 'JavaScript Patterns — Design Patterns in Practice',
  subtitle: 'Observer, pub/sub, singleton, factory, and state machine — the architecture behind React, Redux, and Node.js.',
  tags: ['javascript', 'patterns', 'observer', 'pubsub', 'singleton', 'factory', 'state-machine', 'architecture'],

  hook: {
    question: 'What does React\'s state system, Redux, and Node\'s EventEmitter all have in common?',
    realWorldContext: 'Every major JavaScript library is built on a handful of named patterns. Learning to recognize and implement them makes you dramatically faster at reading library source code, designing systems, and communicating with other engineers.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Observer: a subject notifies a list of subscribers when it changes. addEventListener is Observer.',
      'Pub/Sub: a central bus decouples publishers and subscribers entirely. Redux is Pub/Sub.',
      'Singleton: a class guarantees exactly one shared instance. Config objects, loggers, caches.',
      'Factory: a function picks which class to instantiate. The caller never writes new Foo().',
      'State Machine: a fixed set of states with explicit transitions. Invalid moves are rejected.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Patterns Are Constraints',
        body: 'Patterns add constraints on purpose. A state machine that rejects invalid transitions is more robust than an if-else chain. A singleton that refuses to create a second instance prevents whole categories of bugs. Use patterns when you want to prevent invalid states, not just describe valid ones.',
      },
      {
        type: 'tip',
        title: 'You Already Use These',
        body: 'EventEmitter = Observer. Redux = Pub/Sub (actions are events, reducers are subscribers). React.useState = Observer (component observes the state cell). XState = State Machine. module.exports of a cached object = Singleton. createElement(type, props) = Factory.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'JavaScript Patterns — Design Patterns in Practice',
        props: { lesson: LESSON_JS_CORE_7_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Observer: subject.on(event, fn). subject.emit() → all fns called.',
    'Pub/Sub: bus.subscribe(topic, fn). bus.publish(topic, data). Publisher and subscriber never meet.',
    'Singleton: if (#instance) return #instance. Else create, store, return.',
    'Factory: createThing(type, ...args) → picks and constructs the right subclass.',
    'State Machine: current state + event → next state. Invalid = no transition = rejected.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What is the key difference between the Observer and Pub/Sub patterns?',
      options: [
        'Observer is for UI events; Pub/Sub is for server events',
        'In Observer, subjects and observers know about each other; in Pub/Sub a message bus decouples publishers and subscribers completely',
        'They are identical — "Pub/Sub" is just a newer name for Observer',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why would you use the Singleton pattern?',
      options: [
        'To make a class faster by caching its prototype',
        'To ensure only one instance of a class ever exists — useful for shared resources like a config store or event bus',
        'To prevent subclasses from overriding methods',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You call createThing("circle", ...) and get a Circle instance back. What pattern does createThing implement?',
      options: [
        'Singleton — createThing returns the same object each time',
        'Factory — a function that picks and constructs the right object based on a type argument',
        'Observer — createThing subscribes to shape events',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A state machine receives an event that has no transition defined for the current state. What should happen?',
      options: [
        'The machine transitions to its initial state',
        'The event is rejected and the machine stays in its current state — invalid transitions are simply ignored',
        'The machine throws an error and resets',
      ],
      correct: 1,
    },
  ],
};
