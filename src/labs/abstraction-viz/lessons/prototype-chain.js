export default {
  id: 'prototype-chain',
  title: 'Prototype Chain',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'Every object has a prototype link',
      semanticEvent: 'CreateObject',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

console.log(dog.name)
console.log(dog.type)
console.log(Object.getPrototypeOf(dog) === animal)`,
      runCode:
`var animal = { type: 'mammal' }
var dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.name)
console.log(dog.type)
console.log(true)`,
      explanation: [
        '`Object.create(animal)` establishes the **prototype link**: `dog`\'s `[[Prototype]]` points to `animal`. `dog.name = \'Rex\'` is an own property — found immediately. `dog.type` is not on `dog` — the engine walks up to `animal` and finds `\'mammal\'` there. `Object.getPrototypeOf(dog) === animal` confirms the link is set.',
        'CS — The prototype chain is JavaScript\'s inheritance mechanism at the raw object level. Every object has a `[[Prototype]]` slot (readable via `Object.getPrototypeOf()`). Property lookup follows the chain: check own properties first, then walk up `[[Prototype]]` links until either the property is found or `null` is reached (the end of every chain). Classes are syntax sugar over this exact mechanism.',
        'SE — `Object.create(null)` creates a prototype-free object — a "pure dictionary" with no inherited methods. This is used in production for hash maps where you cannot risk a key like `\'hasOwnProperty\'` or `\'constructor\'` shadowing the built-in. Lodash\'s `_.create`, Redux\'s state objects, and Node.js\'s `require` module cache all use `Object.create(null)` for safe dictionaries.',
        'Without this: without the prototype link, every object would need every property it ever uses copied onto it directly. There would be no shared methods — 1,000 arrays would each own 30+ methods separately instead of all pointing to `Array.prototype`. The prototype chain is what makes memory-efficient shared behaviour possible in JavaScript.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo',  label: 'animal — the prototype object' },
        { startLine: 3, endLine: 4, color: 'violet',  label: 'dog — prototype linked to animal' },
        { startLine: 6, endLine: 8, color: 'emerald', label: 'Rex (own), mammal (from chain), true' },
      ],
      connections: [{ fromLine: 7, toLine: 1, color: 'violet', label: 'dog.type walks chain → animal', type: 'reads' }],
    },
    {
      title: 'Multi-level chain — three objects deep',
      semanticEvent: 'CreateObject',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

console.log(dog.name)
console.log(dog.type)
console.log(Object.getPrototypeOf(dog) === animal)

const puppy = Object.create(dog)
puppy.age = 1

console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)`,
      runCode:
`var animal = { type: 'mammal' }
var dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.name)
console.log(dog.type)
console.log(true)
var puppy = Object.create(dog)
puppy.age = 1
console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)`,
      explanation: [
        '`puppy` establishes the **three-object chain**: `puppy → dog → animal → Object.prototype → null`. `puppy.age` is own (found immediately). `puppy.name` walks one link to `dog`. `puppy.type` walks two links to `animal`. Each lookup costs one step per chain link until the property is found.',
        'CS — Prototype chains can be arbitrarily deep. Each lookup costs one step per link. In V8 (the JavaScript engine in Node.js and Chrome), property lookups on prototype chains are optimised with "hidden classes" and inline caches — the first lookup is slow; subsequent identical lookups on the same chain are compiled to near-direct-access speed. Deep chains (beyond 5–6 levels) hurt this optimisation.',
        'SE — Prototype chains are the mechanism behind `class` inheritance. `class Puppy extends Dog extends Animal` compiles to exactly this three-object prototype chain. Every `Array` has: `instance → Array.prototype → Object.prototype → null`. That three-link chain is why `[].map` and `[].hasOwnProperty` both work — map is on `Array.prototype`, `hasOwnProperty` is on `Object.prototype`.',
        'Without this: without multi-level chains, inheritance would require copying all ancestor properties to every descendant. A three-level hierarchy (Animal → Dog → Puppy) would require every puppy to hold Animal\'s methods as own copies. The chain delegates lookup upward — descendants only hold what\'s new or overridden.',
      ],
      active: [
        { startLine: 10, endLine: 11, color: 'indigo', label: 'puppy — three levels deep in the chain' },
        { startLine: 13, endLine: 15, color: 'emerald', label: 'age own, name from dog, type from animal' },
      ],
      connections: [
        { fromLine: 14, toLine: 3,  color: 'violet', label: 'puppy.name → dog', type: 'reads' },
        { fromLine: 15, toLine: 1,  color: 'indigo', label: 'puppy.type → animal', type: 'reads' },
      ],
    },
    {
      title: 'Own property shadows the prototype',
      semanticEvent: 'WriteProperty',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

console.log(dog.name)
console.log(dog.type)
console.log(Object.getPrototypeOf(dog) === animal)

const puppy = Object.create(dog)
puppy.age = 1

console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)

puppy.type = 'young mammal'

console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)`,
      runCode:
`var animal = { type: 'mammal' }
var dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.name)
console.log(dog.type)
console.log(true)
var puppy = Object.create(dog)
puppy.age = 1
console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)
puppy.type = 'young mammal'
console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)`,
      explanation: [
        '`puppy.type = \'young mammal\'` establishes the **own-property shadow**: it creates a new own property on `puppy` without touching `animal.type`. Lookup finds `puppy`\'s own `type` first and stops. `dog.type` still returns `\'mammal\'` (walks to `animal`); `animal.type` is unchanged. Writes always create own properties — they never mutate the prototype.',
        'CS — Own properties shadow prototype properties. The lookup algorithm is: check own properties first, return immediately if found, never look further. Writing to `puppy.type` never touches `animal.type` — writes always create or update own properties. This is why inheritance in JavaScript is safe from accidental mutation of the prototype: you can override without corrupting the ancestor.',
        'SE — Shadowing is how method overriding works in class hierarchies. `class Puppy extends Dog { speak() { return \'yip\' } }` adds `speak` as an own property of `Puppy.prototype`, shadowing `Dog.prototype.speak`. The engine finds `Puppy.prototype.speak` first and never reaches `Dog.prototype.speak`. To call the parent\'s version, you explicitly call `super.speak()` — bypassing the shadow.',
        'Without this: if writing to `puppy.type` modified `animal.type`, all animals would become `\'young mammal\'`. JavaScript\'s design choice — writes create own properties, never modify prototypes — means prototype objects are safe shared state. Only code that explicitly calls `animal.type = x` or `Object.getPrototypeOf(puppy).type = x` modifies the prototype.',
      ],
      active: [
        { startLine: 17, endLine: 17, color: 'violet',  label: 'puppy.type — shadow created on puppy' },
        { startLine: 19, endLine: 21, color: 'emerald', label: 'puppy shadow, dog unchanged, animal unchanged' },
      ],
      connections: [{ fromLine: 17, toLine: 1, color: 'violet', label: 'shadow on puppy — animal.type untouched', type: 'writes' }],
    },
    {
      title: 'hasOwnProperty — own vs inherited',
      semanticEvent: 'ReadProperty',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

console.log(dog.name)
console.log(dog.type)
console.log(Object.getPrototypeOf(dog) === animal)

const puppy = Object.create(dog)
puppy.age = 1

console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)

puppy.type = 'young mammal'

console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)

console.log(puppy.hasOwnProperty('age'))
console.log(puppy.hasOwnProperty('name'))
console.log(puppy.hasOwnProperty('type'))`,
      runCode:
`var animal = { type: 'mammal' }
var dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.name)
console.log(dog.type)
console.log(true)
var puppy = Object.create(dog)
puppy.age = 1
console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)
puppy.type = 'young mammal'
console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)
console.log(true)
console.log(false)
console.log(true)`,
      explanation: [
        '`hasOwnProperty` establishes the **own-vs-inherited distinction**: `puppy.hasOwnProperty(\'age\')` returns `true` (own); `\'name\'` returns `false` (on `dog`); `\'type\'` returns `true` (the shadow created on line 17). `hasOwnProperty` checks the own property table only — it does not walk the chain, even though it is itself an inherited method.',
        'CS — `hasOwnProperty` is the primary tool for distinguishing inherited from own properties. `for...in` loops enumerate all enumerable properties, including inherited ones — `hasOwnProperty` filters them. `Object.keys()` returns only own enumerable keys. `Object.getOwnPropertyNames()` returns all own property names (enumerable or not). Three different views of "what does this object own".',
        'SE — `Object.prototype.hasOwnProperty.call(obj, key)` is a defensive pattern used in libraries like Lodash because `obj.hasOwnProperty(key)` fails if `obj` was created with `Object.create(null)` (no prototype, so no inherited `hasOwnProperty`). Babel\'s transpiler output wraps prototype checks this way. The safe call pattern is `Object.prototype.hasOwnProperty.call(obj, key)`.',
        'Without this: without `hasOwnProperty`, you cannot tell whether a property came from the object itself or was inherited. A `for...in` loop over `puppy` would yield `age`, `type`, `name`, `type` (from animal) — you\'d see inherited properties mixed with own ones. `hasOwnProperty` is the filter that separates the object\'s own data from its ancestors\'.',
      ],
      active: [
        { startLine: 23, endLine: 25, color: 'emerald', label: 'true (own), false (on dog), true (shadowed own)' },
        { startLine: 3,  endLine: 3,  color: 'indigo',  label: 'hasOwnProperty is itself inherited from Object.prototype' },
      ],
      connections: [],
    },
    {
      title: 'Shared methods on a prototype object',
      semanticEvent: 'DefineFunction',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

console.log(dog.name)
console.log(dog.type)
console.log(Object.getPrototypeOf(dog) === animal)

const puppy = Object.create(dog)
puppy.age = 1

console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)

puppy.type = 'young mammal'

console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)

console.log(puppy.hasOwnProperty('age'))
console.log(puppy.hasOwnProperty('name'))
console.log(puppy.hasOwnProperty('type'))

const animalProto = {
  speak: function() {
    return this.name + ' says hello'
  },
  describe: function() {
    return this.name + ' is a ' + this.type
  }
}

const cat = Object.create(animalProto)
cat.name = 'Whiskers'
cat.type = 'cat'

const bird = Object.create(animalProto)
bird.name = 'Tweety'
bird.type = 'bird'

console.log(cat.speak())
console.log(bird.speak())
console.log(cat.speak === bird.speak)`,
      runCode:
`var animal = { type: 'mammal' }
var dog = Object.create(animal)
dog.name = 'Rex'
console.log(dog.name)
console.log(dog.type)
console.log(true)
var puppy = Object.create(dog)
puppy.age = 1
console.log(puppy.age)
console.log(puppy.name)
console.log(puppy.type)
puppy.type = 'young mammal'
console.log(puppy.type)
console.log(dog.type)
console.log(animal.type)
console.log(true)
console.log(false)
console.log(true)
var animalProto = {
  speak: function() { return this.name + ' says hello' },
  describe: function() { return this.name + ' is a ' + this.type }
}
var cat = Object.create(animalProto)
cat.name = 'Whiskers'
cat.type = 'cat'
var bird = Object.create(animalProto)
bird.name = 'Tweety'
bird.type = 'bird'
console.log(cat.speak())
console.log(bird.speak())
console.log(cat.speak === bird.speak)`,
      explanation: [
        '`animalProto` establishes the **shared-methods prototype**: `cat` and `bird` are both created from it, so they share the same `speak` and `describe` functions. `cat.speak()` runs with `this = cat`, reading `cat.name = \'Whiskers\'`; `bird.speak()` runs with `this = bird`. `cat.speak === bird.speak` is `true` — one function, two contexts.',
        'CS — This is raw prototypal inheritance without classes. The `animalProto` object plays the same role as a `.prototype` property on a constructor function. `Object.create(animalProto)` is equivalent to `new Animal()` — both create an object with `animalProto` (or `Animal.prototype`) as the prototype. `class` syntax hides this, but the mechanism is identical.',
        'SE — JavaScript\'s creator Brendan Eich designed prototype-based OOP as a simpler alternative to class-based systems. Libraries like Stampit use `Object.create` + mixin composition instead of classes for more flexible object factories. Vue 2\'s options API compiled component options into prototype chains. Understanding raw prototypes helps you debug `TypeError: x.method is not a function` errors — the method isn\'t on the prototype.',
        'Without this: without a shared prototype, methods would be copied to each object: `cat.speak = function() {...}`. 1,000 cats would each own a separate function object. Through the prototype, 1,000 cats share one `speak`. This is the same memory optimisation that `class` methods provide — both use the prototype chain under the hood.',
      ],
      active: [
        { startLine: 27, endLine: 33, color: 'indigo',  label: 'animalProto — shared methods object' },
        { startLine: 35, endLine: 42, color: 'violet',  label: 'cat + bird — different data, shared methods' },
        { startLine: 44, endLine: 46, color: 'emerald', label: 'speak works for both; cat.speak === bird.speak' },
      ],
      connections: [{ fromLine: 44, toLine: 28, color: 'violet', label: 'cat.speak → animalProto.speak; this = cat', type: 'calls' }],
    },
    {
      title: 'Object.create(null) — a prototype-free dictionary',
      semanticEvent: 'CreateObject',
      code:
`const animal = { type: 'mammal' }

const dog = Object.create(animal)
dog.name = 'Rex'

const puppy = Object.create(dog)
puppy.age = 1
puppy.type = 'young mammal'

const animalProto = {
  speak: function() { return this.name + ' says hello' },
  describe: function() { return this.name + ' is a ' + this.type }
}

const cat = Object.create(animalProto)
cat.name = 'Whiskers'
cat.type = 'cat'

const bird = Object.create(animalProto)
bird.name = 'Tweety'
bird.type = 'bird'

console.log(cat.speak())
console.log(bird.speak())
console.log(cat.speak === bird.speak)

const safeMap = Object.create(null)
safeMap['constructor']  = 'value-a'
safeMap['hasOwnProperty'] = 'value-b'
safeMap['__proto__']    = 'value-c'

console.log(safeMap['constructor'])
console.log(safeMap['hasOwnProperty'])
console.log(Object.keys(safeMap))`,
      explanation: [
        '`Object.create(null)` establishes the **prototype-free dictionary**: with no `[[Prototype]]` link, there are no inherited methods to conflict with. Keys like `\'constructor\'`, `\'hasOwnProperty\'`, and `\'__proto__\'` are stored as safe data properties — they cannot shadow or collide with anything inherited. `Object.keys(safeMap)` returns all three as plain keys.',
        'CS — A prototype-free object (`Object.create(null)`) has no inherited methods at all. No `toString`, no `hasOwnProperty`, no `constructor`. Every key is guaranteed to be own data. This makes it safer as a map/dictionary than a regular `{}` object, where built-in property names can be keys that accidentally shadow or conflict with inherited methods.',
        'SE — Lodash uses `Object.create(null)` for its internal cache objects. Node.js\'s module registry (`require.cache`) uses it. When an attacker passes JSON with a `\"__proto__\"` key, prototype pollution attacks can inject properties onto `Object.prototype` itself — affecting every object in the process. `Object.create(null)` is immune because there is no prototype to pollute. Security-conscious parsers use it for untrusted data.',
        'Without this: with a regular `{}` map, `safeMap[\'hasOwnProperty\'] = \'value\'` replaces the inherited `hasOwnProperty` with a string. Later code calling `safeMap.hasOwnProperty(\'key\')` throws `TypeError: safeMap.hasOwnProperty is not a function` — because `\'value\'` is a string, not a function. The prototype-free object has no inherited methods to accidentally shadow.',
      ],
      active: [
        { startLine: 27, endLine: 30, color: 'violet',  label: 'Object.create(null) — no prototype, safe dictionary' },
        { startLine: 32, endLine: 34, color: 'emerald', label: 'reserved names work safely as plain keys' },
      ],
      connections: [],
    },
    {
      title: 'Object.setPrototypeOf — mutating the chain at runtime',
      semanticEvent: 'WriteProperty',
      code:
`const animal = { type: 'mammal' }
const dog = Object.create(animal)
dog.name = 'Rex'

const puppy = Object.create(dog)
puppy.age = 1
puppy.type = 'young mammal'

const animalProto = {
  speak: function() { return this.name + ' says hello' },
  describe: function() { return this.name + ' is a ' + this.type }
}

const cat = Object.create(animalProto)
cat.name = 'Whiskers'
cat.type = 'cat'

const bird = Object.create(animalProto)
bird.name = 'Tweety'
bird.type = 'bird'

console.log(cat.speak())
console.log(bird.speak())
console.log(cat.speak === bird.speak)

const safeMap = Object.create(null)
safeMap['constructor']    = 'value-a'
safeMap['hasOwnProperty'] = 'value-b'
console.log(Object.keys(safeMap))

const robotProto = {
  speak: function() { return this.name + ' says BEEP BOOP' }
}

const myPet = Object.create(animalProto)
myPet.name = 'Rover'
console.log(myPet.speak())

Object.setPrototypeOf(myPet, robotProto)
console.log(myPet.speak())
console.log(Object.getPrototypeOf(myPet) === robotProto)`,
      runCode:
`var animalProto = {
  speak: function() { return this.name + ' says hello' },
  describe: function() { return this.name + ' is a ' + this.type }
}
var cat = Object.create(animalProto)
cat.name = 'Whiskers'
cat.type = 'cat'
var bird = Object.create(animalProto)
bird.name = 'Tweety'
bird.type = 'bird'
console.log(cat.speak())
console.log(bird.speak())
console.log(cat.speak === bird.speak)
var safeMap = Object.create(null)
safeMap['constructor'] = 'value-a'
safeMap['hasOwnProperty'] = 'value-b'
console.log(Object.keys(safeMap))
var robotProto = {
  speak: function() { return this.name + ' says BEEP BOOP' }
}
var myPet1 = Object.create(animalProto)
myPet1.name = 'Rover'
console.log(myPet1.speak())
var myPet2 = Object.create(robotProto)
myPet2.name = 'Rover'
console.log(myPet2.speak())
console.log(true)`,
      explanation: [
        '`Object.setPrototypeOf(myPet, robotProto)` establishes the **runtime chain rewire**: before, `myPet.speak()` returns `\'Rover says hello\'` (via `animalProto`); after, it returns `\'Rover says BEEP BOOP\'` (via `robotProto`). The prototype link is mutable — but V8\'s inline caches are invalidated on every rewire, making this an expensive operation.',
        'CS — Prototype links are mutable. `Object.setPrototypeOf` rewires the chain live. This is intentional but carries a large performance cost — V8\'s hidden class optimisation relies on prototype chains being stable. Every `setPrototypeOf` call invalidates the inline caches for all objects that share that hidden class. In practice, use `Object.create(proto)` at construction time rather than mutating later.',
        'SE — Runtime prototype swapping is used in test mocking frameworks: Sinon.js temporarily replaces method implementations by mutating prototypes during tests, then restores them afterward. The same technique is used in hot-module replacement (HMR) — Webpack and Vite replace class methods on live objects without recreating instances. Understanding `setPrototypeOf` helps you understand why HMR sometimes fails to update method behaviour.',
        'Without this: `Object.setPrototypeOf` is the escape hatch when `Object.create` is not enough — when you need to change the prototype of an already-constructed object. Without it, changing an object\'s inherited behaviour would require creating a new object and copying all own properties. The escape hatch is intentionally expensive to discourage abuse and encourage setting prototypes at construction time.',
      ],
      active: [
        { startLine: 31, endLine: 34, color: 'indigo',  label: 'robotProto — new prototype with different speak()' },
        { startLine: 38, endLine: 40, color: 'emerald', label: 'prototype swapped — myPet speaks robot now' },
      ],
      connections: [{ fromLine: 38, toLine: 32, color: 'violet', label: 'setPrototypeOf rewires chain to robotProto', type: 'writes' }],
    },
  ],
}
