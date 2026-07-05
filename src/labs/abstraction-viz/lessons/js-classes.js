export default {
  id: 'js-classes',
  title: 'JS Classes',
  tag: 'OOP',
  steps: [
    {
      title: 'The blueprint — class and constructor',
      semanticEvent: 'DefineClass',
      code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }
}

const cat = new Animal('Cat', 'meow')
console.log(cat.name)
console.log(cat.sound)`,
      explanation: [
        '`Animal` establishes the **blueprint → instance dependency**: the constructor takes `name` and `sound` from the caller and assigns them to `this`, so each `new Animal()` call produces an independent object that owns its own data. The class holds no data — it describes the shape; instances hold the state.',
        'CS — This is the class pattern: a constructor function paired with a prototype object. The `class` keyword (introduced in ES2015) is syntactic sugar over JavaScript\'s existing prototype system. `typeof Animal` returns `\'function\'`, not `\'class\'` — under the hood `Animal` is still a constructor function and `Animal.prototype` is a plain object. The class syntax makes the intent readable; the mechanism is unchanged from 1995.',
        'SE — The separation of blueprint from instance is the core insight of object-oriented design: one `Animal` class describes the shape; unlimited independently-stateful instances hold the data. This pattern appears everywhere in production software: React components (class describes UI, instances are rendered nodes), Express Router (Router describes routes, `app` is the instance), and PostgreSQL client connections (Client describes the config, each connection is an instance).',
        'Without this: if you stored data in the class itself — `Animal.name = \'Cat\'` — every instance would share one value. The second `new Animal(\'Dog\', ...)` would overwrite the first. The constructor\'s job is to move data from arguments onto `this` so each instance owns its own copy.',
      ],
      active: [
        { startLine: 1, endLine: 6,  color: 'indigo',  label: 'Animal — the blueprint, not an object' },
        { startLine: 2, endLine: 5,  color: 'violet',  label: 'constructor — runs once when new Animal() is called' },
        { startLine: 8, endLine: 8,  color: 'emerald', label: 'new Animal() — creates an instance, runs the constructor' },
      ],
      connections: [{ fromLine: 8, toLine: 2, color: 'emerald', label: 'new → constructor', type: 'calls' }],
    },
    {
      title: 'speak() — one function shared by every instance',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }

  speak() {
    return this.name + ' says: ' + this.sound + '!'
  }
}

const cat = new Animal('Cat', 'meow')
const dog = new Animal('Dog', 'woof')
console.log(cat.speak())
console.log(dog.speak())`,
      explanation: [
        '`speak()` establishes the **shared-method → dynamic-this contract**: stored once on `Animal.prototype`, it runs with `this` bound to whichever instance called it. `cat.speak()` reads `cat.name` and `cat.sound`; `dog.speak()` reads `dog.name` and `dog.sound`. One function, two different outputs — because `this` changes per call.',
        'CS — This is prototypal inheritance. Every instance has a hidden internal prototype link (`[[Prototype]]`) pointing to `Animal.prototype`. Property and method lookups follow this chain: instance → Animal.prototype → Object.prototype → null. The chain stops at the first match. Methods are just properties whose values are functions — the lookup mechanism is identical.',
        'SE — Storing methods on the prototype rather than on each instance is a memory optimisation. If `speak` were defined in the constructor as `this.speak = function() {...}`, every instance would hold its own separate function object. Via the prototype, 10,000 Animal instances share one `speak` function. This is why Backbone.js, Ember, and prototype-based frameworks scaled to large UIs without memory issues.',
        'Without this: if you called `cat.speak()` before defining `speak` on the class, JavaScript would walk the entire prototype chain, reach `Object.prototype`, find nothing, and throw `TypeError: cat.speak is not a function`. The chain must contain the method before the call.',
      ],
      active: [
        { startLine: 7,  endLine: 9,  color: 'violet',  label: 'speak() — stored on Animal.prototype, one copy' },
        { startLine: 12, endLine: 13, color: 'emerald', label: 'two instances — same speak(), different this each time' },
        { startLine: 8,  endLine: 8,  color: 'indigo',  label: 'this.name — reads from whichever instance called speak()' },
      ],
      connections: [
        { fromLine: 14, toLine: 7, color: 'violet', label: 'cat.speak → this = cat', type: 'calls' },
        { fromLine: 15, toLine: 7, color: 'violet', label: 'dog.speak → this = dog', type: 'calls' },
      ],
    },
    {
      title: 'Prototype proof — one function, three instances',
      semanticEvent: 'CreateObject',
      code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }

  speak() {
    return this.name + ' says: ' + this.sound + '!'
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)`,
      explanation: [
        '`cat.speak === dog.speak` evaluates to `true` — proving the **prototype sharing relationship**: both instances resolve `speak` through the same `Animal.prototype` reference. Three animals share one function in memory; no copy is made per instance. The `===` identity check confirms it is the exact same object, not just equivalent code.',
        'CS — This is the prototype chain at work. Each instance has a `[[Prototype]]` slot pointing to `Animal.prototype`. When you access `cat.speak`, the engine reads: "is `speak` an own property of `cat`? No. Is it on `cat.[[Prototype]]` (Animal.prototype)? Yes — return it." All three instances share the same prototype object, so they all return the same function reference.',
        'SE — Shared methods are why class-based systems are efficient. The prototype chain is also the basis for every `instanceof` check, every framework inheritance (`class Button extends Component`), and every mixin pattern. When you call `Array.prototype.map.call(nodeList, fn)` in the browser — the classic trick for using array methods on DOM node lists — you are manually exploiting this exact mechanism.',
        'Without this: if `speak` were not on `Animal.prototype`, the prototype chain walk would find nothing, and `cat.speak` would be `undefined`. Calling `cat.speak()` would throw `TypeError: cat.speak is not a function`. Every method call depends on the prototype chain completing successfully.',
      ],
      active: [
        { startLine: 12, endLine: 14, color: 'emerald', label: 'three separate instances, each with its own name/sound' },
        { startLine: 18, endLine: 18, color: 'indigo',  label: 'true — the exact same function object in memory' },
        { startLine: 7,  endLine: 9,  color: 'violet',  label: 'speak lives here — shared, not copied per instance' },
      ],
      connections: [],
    },
    {
      title: 'Instance state — each object tracks its own data',
      semanticEvent: 'WriteProperty',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)`,
      explanation: [
        '`this.callCount = 0` establishes the **per-instance state relationship**: each of cat, dog, and bird gets its own `callCount` starting at zero. `this.callCount++` inside `speak()` always mutates the calling instance only. After three `cat.speak()` calls and one each for dog and bird, the values are 3, 1, 1 — three independent counters that never interfere.',
        'CS — This is the instance variable pattern, also called per-object state. The `++` operator is shorthand for `this.callCount = this.callCount + 1`. Because `this` is bound to the calling instance at runtime, the mutation is always isolated. The prototype chain handles behaviour (methods); instance properties handle state (data). These two layers are intentionally separate.',
        'SE — Isolated mutable state per instance is what makes independent objects possible. React component instances hold their own `state` and `props` for exactly this reason — updating one component\'s state does not touch another\'s. The `this` reference is what makes the isolation work: the same `setState` method on `React.Component.prototype` mutates whichever instance called it.',
        'Without this: without per-instance state, all animals would share one counter. The third `cat.speak()` call would also change `dog` and `bird`\'s count. This is the classic mistake of storing mutable data on the class itself (`Animal.callCount = 0`) instead of the instance.',
      ],
      active: [
        { startLine: 5,  endLine: 5,  color: 'indigo',  label: 'callCount = 0 — each instance gets its own copy' },
        { startLine: 9,  endLine: 9,  color: 'violet',  label: 'this.callCount++ — increments THIS instance\'s counter only' },
        { startLine: 23, endLine: 25, color: 'emerald', label: '3, 1, 1 — three independent counters' },
      ],
      connections: [],
    },
    {
      title: 'describe() — a method that reads state written by speak()',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())`,
      explanation: [
        '`describe()` establishes the **method cooperation relationship**: it reads `this.callCount` that `speak()` increments — both methods communicate through the shared `this` reference. After three speak calls from cat, `cat.describe()` returns `\'Cat has spoken 3 time(s)\'`. One method writes state; another reads it; `this` is the shared channel.',
        'CS — This is method cooperation through shared instance state. The object\'s properties act as a communication channel between methods: `speak()` writes `callCount`, `describe()` reads it. This is the fundamental mechanism of encapsulation: the data and the operations on that data are bundled together and communicate through `this`. Neither method needs to know how the other is implemented — they share state through the instance.',
        'SE — Single-responsibility methods are easier to test and maintain. `speak()` has one job: increment the counter and produce speech. `describe()` has one job: read state and produce a description. If the describe format needs to change, only `describe()` changes. If the counter logic changes, only `speak()` changes. This is the Single Responsibility Principle — each method owns one behaviour, making the blast radius of any change small.',
        'Without this: if `describe()` tried to maintain its own separate counter, the two counts would diverge. The moment speak() and describe() share state through `this`, they stay automatically synchronised — no manual coordination needed.',
      ],
      active: [
        { startLine: 13, endLine: 15, color: 'violet',  label: 'describe() — reads name and callCount from this' },
        { startLine: 9,  endLine: 9,  color: 'indigo',  label: 'speak() writes callCount here…' },
        { startLine: 14, endLine: 14, color: 'emerald', label: '…describe() reads it here — same this, same data' },
      ],
      connections: [{ fromLine: 14, toLine: 5, color: 'violet', label: 'reads callCount incremented by speak()', type: 'reads' }],
    },
    {
      title: 'get — a computed property that runs code on read',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }

  get label() {
    return this.name + ' (' + this.callCount + ' calls)'
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)`,
      explanation: [
        '`get label()` establishes the **computed-property contract**: it runs automatically when `cat.label` is read — no parentheses needed. At the moment of the read, `cat.callCount` is 3, so the getter returns `\'Cat (3 calls)\'`. The derived value is never stored; it is computed fresh from existing instance state each time it is accessed.',
        'CS — The getter is a form of computed property. The value is not stored anywhere — it is derived on demand from existing state. This is a special case of the Proxy pattern: reads are intercepted and routed through a function. JavaScript also supports `set propertyName(value)` for write interception, which we\'ll add next. Together they are called accessor properties, distinct from data properties which store a fixed value.',
        'SE — Getters make derived state feel like stored state to the caller. This is a clean API boundary: the caller reads `cat.label` and gets a string, without needing to know whether that string was pre-computed, calculated on demand, or fetched from somewhere else. In frameworks like Vue.js, computed properties are getters on the component instance — the template reads `this.fullName` as though it were data, while the getter computes `firstName + \' \' + lastName` each time.',
        'Without this: without a getter, callers would have to call `cat.getLabel()` (a method) or manually concatenate name and callCount every time they needed the label. The getter hides that computation behind a property-shaped API — callers see data, not implementation.',
      ],
      active: [
        { startLine: 17, endLine: 19, color: 'violet',  label: 'get label — runs when you read cat.label' },
        { startLine: 36, endLine: 37, color: 'emerald', label: 'cat.label — no (), getter fires automatically' },
      ],
      connections: [],
    },
    {
      title: 'set — a setter that validates writes',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
    this.nickname  = name
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }

  get label() {
    return this.name + ' (' + this.callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)`,
      explanation: [
        'The `nickname` setter establishes the **write-validation contract**: any assignment to `cat.nickname` passes through the setter, which throws if the value is not a non-empty string. Valid values are stored on `this._nickname`; the getter reads it back. The `_` prefix signals "backing store — access only via the getter/setter interface."',
        'CS — The getter/setter pair is the Accessor Property pattern. The property name `nickname` is the public interface; `_nickname` is the backing store. `typeof value !== \'string\'` is a type guard — at runtime, JavaScript has no compile-time types, so validation that TypeScript would catch at compile time must be checked at runtime here. Throwing inside a setter is standard: it rejects the write and leaves state unchanged, the same way a database transaction rolls back on a constraint violation.',
        'SE — Setters enforce invariants — rules about what values are valid. Without a setter, any code anywhere can write `cat.nickname = 42` and leave the object in an inconsistent state. With a setter, the class controls its own data. This is encapsulation: the object\'s internal representation (`_nickname`) is hidden behind a public interface (`nickname`). If the storage ever changes — say to a Map — the callers are unaffected. They still read and write `cat.nickname`.',
        'Without this: without validation, `cat.nickname = \'\'` or `cat.nickname = null` would be silently accepted. Later code reading `cat.nickname` would get an empty string or null where it expected a name, causing a bug far from where the bad value was written — the worst kind of bug to trace. The setter catches the error at the point of writing, with a message that names the rule that was broken.',
      ],
      active: [
        { startLine: 22, endLine: 24, color: 'indigo',  label: 'get nickname — reads the internal _nickname' },
        { startLine: 26, endLine: 30, color: 'violet',  label: 'set nickname — validates, then writes _nickname' },
        { startLine: 51, endLine: 53, color: 'emerald', label: 'cat.nickname = \'Kitty\' — triggers the setter' },
      ],
      connections: [{ fromLine: 51, toLine: 26, color: 'violet', label: 'assignment → setter', type: 'calls' }],
    },
    {
      title: 'toString() — how the object coerces to a string',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
    this.nickname  = name
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }

  get label() {
    return this.name + ' (' + this.callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }

  toString() {
    return 'Animal(' + this.name + ')'
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)
console.log(String(cat))
console.log(String(dog))`,
      explanation: [
        '`toString()` establishes the **string coercion contract**: by overriding the inherited `Object.prototype.toString`, it intercepts every `String(cat)` call, template literal interpolation, and `+` concatenation. `String(cat)` returns `\'Animal(Cat)\'` instead of the useless `\'[object Object]\'`. The prototype chain walk stops at `Animal.prototype.toString` before reaching the default.',
        'CS — This is method overriding in prototypal inheritance. A method on a derived object (Animal.prototype) shadows a method of the same name on a parent object (Object.prototype). The lookup stops at the first match. The parent version is still reachable by explicitly calling `Object.prototype.toString.call(cat)` — useful when you need the original behaviour from inside an override.',
        'SE — `toString()`, `valueOf()`, and `Symbol.iterator` are the standard extension points — methods the JavaScript runtime calls automatically in specific contexts. Implementing `toString()` integrates your object with the string world: template literals, `+` concatenation, `console.log`, `JSON.stringify` (for keys). Implementing `valueOf()` integrates with arithmetic. Implementing `Symbol.iterator` makes the object usable in `for...of` loops and spread syntax. Libraries like Moment.js define `valueOf()` so that dates can be compared with `<` and `>`.',
        'Without this: without a custom `toString()`, `String(cat)` returns `\'[object Object]\'` — the same string for every object in your entire program. Logging, debugging, and any code that coerces objects to strings becomes useless. Implementing `toString()` costs one method; the benefit is readable output in every context that touches strings.',
      ],
      active: [
        { startLine: 33, endLine: 35, color: 'violet',  label: 'toString() — shadows Object.prototype.toString' },
        { startLine: 58, endLine: 59, color: 'emerald', label: 'String() triggers your toString automatically' },
      ],
      connections: [],
    },
    {
      title: 'static — a method on the class itself, not instances',
      semanticEvent: 'DefineFunction',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
    this.nickname  = name
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }

  get label() {
    return this.name + ' (' + this.callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }

  toString() {
    return 'Animal(' + this.name + ')'
  }

  static create(name, sound) {
    return new Animal(name, sound)
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)
console.log(String(cat))
console.log(String(dog))
const parrot = Animal.create('Parrot', 'squawk')
parrot.speak()
console.log(parrot.describe())
console.log(String(parrot))`,
      explanation: [
        '`static create()` establishes the **Factory Method contract**: stored on the `Animal` function object (not on `Animal.prototype`), it is callable as `Animal.create()` — not on instances. It delegates to `new Animal()` internally, centralising construction logic. `Animal.create(\'Parrot\', \'squawk\')` calls `new Animal()` and returns the result.',
        'CS — Static methods implement the Factory Method design pattern. A factory is a function that creates and returns an object, hiding the construction details from the caller. Here `Animal.create()` delegates to `new Animal()`, but it could do more: validate arguments before constructing, return a cached instance if one already exists, or choose a different class to instantiate based on the arguments. The caller only sees a clean creation API.',
        'SE — Factory methods are a common production pattern. `Promise.resolve()`, `Array.from()`, `Object.keys()`, and `Buffer.from()` are all static factory methods in the JavaScript standard library. In React, `React.createElement()` is a factory method. In Express, `express()` is a factory that creates an application instance. They all share the same purpose: give construction a name that describes intent, and give the class control over how instances come into existence.',
        'Without this: without a factory, every caller must call `new Animal()` directly. If the construction logic ever needs to change — add validation, add logging, change the default values — every call site must be updated. The factory centralises construction in one place, so one change fixes all callers.',
      ],
      active: [
        { startLine: 37, endLine: 39, color: 'violet',  label: 'static create() — on Animal itself, not on prototype' },
        { startLine: 63, endLine: 63, color: 'emerald', label: 'Animal.create() — Factory Method pattern' },
      ],
      connections: [{ fromLine: 38, toLine: 2, color: 'violet', label: 'create() calls new Animal() internally', type: 'calls' }],
    },
    {
      title: 'instanceof — confirming type at runtime',
      semanticEvent: 'ReadProperty',
      code:
`class Animal {
  constructor(name, sound) {
    this.name      = name
    this.sound     = sound
    this.callCount = 0
    this.nickname  = name
  }

  speak() {
    this.callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.callCount + ' time(s)'
  }

  get label() {
    return this.name + ' (' + this.callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }

  toString() {
    return 'Animal(' + this.name + ')'
  }

  static create(name, sound) {
    return new Animal(name, sound)
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)
console.log(String(cat))
console.log(String(dog))
const parrot = Animal.create('Parrot', 'squawk')
parrot.speak()
console.log(parrot.describe())
console.log(String(parrot))
console.log(cat instanceof Animal)
// typeof Animal → 'function' — class is syntactic sugar over a constructor function`,
      explanation: [
        '`cat instanceof Animal` establishes the **prototype-chain membership check**: it walks `cat`\'s chain looking for `Animal.prototype` and finds it immediately — `true`. The comment confirms that `typeof Animal === \'function\'` — the `class` keyword is syntactic sugar over a constructor function. The `Animal.prototype` link is the only thing `instanceof` actually inspects.',
        'CS — `instanceof` is a prototype chain search. It checks: does `Animal.prototype` appear anywhere in the prototype chain from `cat` upward? Because the chain is `cat → Animal.prototype → Object.prototype → null`, and `Animal.prototype` is the first link, the answer is yes. This means `cat instanceof Object` is also `true` — every object is an instance of Object, because every chain eventually reaches `Object.prototype`.',
        'SE — `instanceof` is used in production for type-narrowing at runtime: `if (error instanceof ValidationError)` routes to validation handling; `if (event instanceof MouseEvent)` accesses mouse-specific properties. It is also the mechanism behind TypeScript\'s type narrowing — when you write `if (x instanceof Date)`, TypeScript understands that inside the block `x` is a `Date` and gives you access to `.getTime()`. The runtime check and the compile-time narrowing work together.',
        'Without this: without `instanceof`, runtime type checking requires storing a type tag manually — `this.type = \'Animal\'` — and checking `cat.type === \'Animal\'`. This is fragile: anyone can write `dog.type = \'Animal\'` and fake it. `instanceof` checks the actual prototype chain, which cannot be faked without deliberately tampering with `Object.setPrototypeOf`.',
      ],
      active: [
        { startLine: 67, endLine: 67, color: 'emerald', label: 'instanceof — true: Animal.prototype is on cat\'s chain' },
        { startLine: 68, endLine: 68, color: 'indigo',  label: 'typeof Animal → \'function\' — classes are functions' },
      ],
      connections: [],
    },
    {
      title: 'Private fields — encapsulating internal state',
      semanticEvent: 'DefineClass',
      code:
`class Animal {
  #callCount = 0     // private field — inaccessible outside this class

  constructor(name, sound) {
    this.name     = name
    this.sound    = sound
    this.nickname = name
  }

  speak() {
    this.#callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.#callCount + ' time(s)'
  }

  get callCount() {
    return this.#callCount    // expose read-only — no setter means no writes
  }

  get label() {
    return this.name + ' (' + this.#callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }

  toString() {
    return 'Animal(' + this.name + ')'
  }

  static create(name, sound) {
    return new Animal(name, sound)
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)
console.log(String(cat))
console.log(String(dog))
const parrot = Animal.create('Parrot', 'squawk')
parrot.speak()
console.log(parrot.describe())
console.log(String(parrot))
console.log(cat instanceof Animal)
// cat.#callCount  ← SyntaxError — private fields cannot be read outside the class`,
      explanation: [
        '`#callCount` establishes the **true encapsulation contract**: declared with `#`, it is invisible and inaccessible outside the class — not just conventionally private. The `get callCount()` getter is the only read path; there is no setter, so callers cannot write to it. `speak()` is the only way to increment it, making the class the sole enforcer of its own invariant.',
        'CS — Private class fields (the `#` prefix) were added to JavaScript in ES2022. Before that, "private by convention" used an underscore prefix (`_callCount`), which was a social contract — other code could still read and write it. The `#` syntax is enforced by the engine: the property is stored in a private slot, not in the normal property table, and the engine rejects any attempt to access it from outside the class. This is true encapsulation, not convention.',
        'SE — Encapsulation is the principle that an object controls access to its own internal state. Without it, any code anywhere in the codebase can write `cat.callCount = 0` and silently corrupt the counter. With `#callCount`, the only way to change it is through `speak()` — the class controls the invariant. This is why database models in ORMs like Sequelize and TypeORM mark internal fields private: the model\'s methods (save, validate, increment) are the only paths in.',
        'Without this: with public `callCount`, any caller can write `cat.callCount = 999` and `cat.describe()` will report wrong data. The bug is silent — no error, just a wrong value. The class can no longer guarantee that `callCount` equals the number of times `speak()` was called. Private fields make that guarantee enforceable by the engine, not just by team discipline.',
      ],
      active: [
        { startLine: 2,  endLine: 2,  color: 'indigo',  label: '#callCount — private field, invisible outside this class' },
        { startLine: 11, endLine: 11, color: 'violet',  label: 'this.#callCount++ — valid inside, SyntaxError outside' },
        { startLine: 19, endLine: 21, color: 'emerald', label: 'get callCount() — the only read path, no setter = read-only' },
      ],
      connections: [],
    },
    {
      title: 'Polymorphism — one loop, every instance responds its own way',
      semanticEvent: 'CallFunction',
      code:
`class Animal {
  #callCount = 0

  constructor(name, sound) {
    this.name     = name
    this.sound    = sound
    this.nickname = name
  }

  speak() {
    this.#callCount++
    return this.name + ' says: ' + this.sound + '!'
  }

  describe() {
    return this.name + ' has spoken ' + this.#callCount + ' time(s)'
  }

  get callCount() {
    return this.#callCount
  }

  get label() {
    return this.name + ' (' + this.#callCount + ' calls)'
  }

  get nickname() {
    return this._nickname
  }

  set nickname(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('nickname must be a non-empty string')
    }
    this._nickname = value
  }

  toString() {
    return 'Animal(' + this.name + ')'
  }

  static create(name, sound) {
    return new Animal(name, sound)
  }
}

const cat  = new Animal('Cat',  'meow')
const dog  = new Animal('Dog',  'woof')
const bird = new Animal('Bird', 'tweet')
console.log(cat.speak())
console.log(dog.speak())
console.log(bird.speak())
console.log(cat.speak === dog.speak)
cat.speak()
cat.speak()
console.log(cat.callCount)
console.log(dog.callCount)
console.log(bird.callCount)
console.log(cat.describe())
console.log(dog.describe())
console.log(cat.label)
console.log(dog.label)
cat.nickname = 'Kitty'
console.log(cat.nickname)
console.log(dog.nickname)
console.log(String(cat))
console.log(String(dog))
const parrot = Animal.create('Parrot', 'squawk')
parrot.speak()
console.log(parrot.describe())
console.log(String(parrot))
console.log(cat instanceof Animal)
// cat.#callCount  ← SyntaxError

const animals = [cat, dog, bird, parrot]
animals.forEach(function(animal) {
  console.log(animal.speak())
})`,
      explanation: [
        'Four instances in one `forEach` loop establish the **polymorphism relationship**: the loop calls `animal.speak()` on each element without knowing which specific name or sound each holds. `this` is rebound per call — cat, dog, bird, parrot in sequence. One `speak` function produces four different outputs because `this.name` and `this.sound` differ per instance.',
        'CS — This is runtime polymorphism: a single operation (`speak()`) behaves differently depending on the receiver. JavaScript achieves this through dynamic `this` binding and the prototype chain, without requiring static type declarations. In Java and C++, polymorphism requires class hierarchies and virtual function tables. In JavaScript, it happens naturally whenever you call a method on different objects through a shared interface — here, the shared interface is the `speak` method name.',
        'SE — The forEach loop is the core of every collection-processing pattern in production software: `orders.forEach(order => order.process())`, `users.forEach(user => user.notify())`, `validators.forEach(v => v.validate(input))`. The loop does not care what type each element is — it only requires that the element has the expected method. This is why TypeScript interfaces and duck typing work: type safety is about the shape of the interface, not the implementation behind it. The Inheritance lesson builds on this exact foundation — subclasses override `speak()` to produce type-specific behaviour through the same loop.',
        'Without this: without a shared method name, the loop would need a conditional: `if (animal.type === \'cat\') cat.meow(); else if (animal.type === \'dog\') dog.bark()...`. Every new animal type requires a new branch in every loop. With polymorphism, adding a new animal type adds one class — the loops never change. This is the Open/Closed Principle: open for extension (new types), closed for modification (existing loops).',
      ],
      active: [
        { startLine: 75, endLine: 75, color: 'indigo',  label: 'four instances — all sharing Animal.prototype' },
        { startLine: 76, endLine: 78, color: 'emerald', label: 'one loop — speak() dispatches with the right this each time' },
        { startLine: 10, endLine: 12, color: 'violet',  label: 'speak() — one function, four different outputs' },
      ],
      connections: [],
    },
  ],
}
