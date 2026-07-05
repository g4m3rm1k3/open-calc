export default   {
    id: 'inheritance',
    title: 'Inheritance',
    tag: 'OOP',
    steps: [
      {
        title: 'Animal — the base class all others inherit from',
        semanticEvent: 'DefineClass',
        code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }

  speak() {
    return this.name + ' says: ' + this.sound + '!'
  }

  toString() { return 'Animal(' + this.name + ')' }
}

const bird = new Animal('Bird', 'tweet')
console.log(bird.speak())    // → 'Bird says: tweet!'
console.log(String(bird))    // → 'Animal(Bird)'`,
        explanation: [
          '`Animal` establishes the **base class contract**: every animal has a `name`, a `sound`, a `speak()` method, and a `toString()`. Any code that works with an `Animal` will work with any future subclass — this shared contract is what makes polymorphism possible.',
          'This is the base from which Dog, Cat, and Fish will be derived. It currently works on its own — bird is a valid Animal instance. Each subclass will extend this, inheriting everything here and adding or overriding specific behaviour.',
          'CS — In an inheritance hierarchy, the base class contains shared behaviour (speak, toString) and shared structure (name, sound). Subclasses inherit this through the prototype chain: Dog.prototype.__proto__ === Animal.prototype. Method resolution walks this chain automatically.',
          'SE — A well-designed base class captures the contract that all subclasses must honour. Liskov Substitution Principle: any subclass instance must be usable wherever an Animal instance is expected. The rest of this lesson builds that hierarchy. Every code that accepts Animal will work with Dog, Cat, or any new subclass you create.',
        ],
        active: [
          { startLine: 1, endLine: 12, color: 'indigo', label: 'Animal — base class, shared contract for all subtypes' },
          { startLine: 7, endLine: 9, color: 'violet', label: 'speak — behaviour all animals share' },
        ],
        connections: [],
      },
      {
        title: 'extends — Dog inherits everything from Animal',
        semanticEvent: 'DefineClass',
        code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  // No constructor — JavaScript uses Animal's automatically
}

const dog  = new Dog('Rex', 'woof')     // Animal's constructor runs
const bird = new Animal('Bird', 'tweet')
console.log(dog.speak())               // → 'Rex says: woof!'  (inherited)
console.log(dog instanceof Animal)     // → true  (Dog IS-A Animal)
console.log(dog instanceof Dog)        // → true`,
        explanation: [
          '`extends Animal` establishes the **IS-A relationship**: Dog.prototype is linked to Animal.prototype, so `dog.speak()` finds Animal\'s `speak` on the prototype chain without Dog defining it. `dog instanceof Animal` returns `true`. Dog gets everything Animal offers for free — its constructor runs, its methods are available.',
          'Dog has no constructor, so JavaScript automatically provides one that calls super(...args) — passing all arguments to Animal\'s constructor. new Dog(\'Rex\', \'woof\') runs Animal\'s constructor with name=\'Rex\', sound=\'woof\'. The instance has name and sound properties just like any Animal.',
          'CS — extends wires the prototype chain: Dog.prototype.__proto__ = Animal.prototype. instanceof checks this chain: dog instanceof Animal traverses dog\'s chain and finds Animal.prototype — returns true. instanceof Dog also returns true. Both are simultaneously true because Dog IS a subtype of Animal.',
          'SE — Inheritance models the IS-A relationship: a Dog IS-A Animal. Any function accepting Animal can accept a Dog. This is what makes polymorphism work — you can write processAnimal(animal) and pass Dogs, Cats, or Birds. The Liskov Substitution Principle (the L in SOLID) formalises this: subtypes must be substitutable for their base types.',
        ],
        active: [
          { startLine: 10, endLine: 12, color: 'violet', label: 'Dog extends Animal — prototype chain wired' },
          { startLine: 14, endLine: 14, color: 'emerald', label: 'Animal\'s constructor runs for new Dog()' },
          { startLine: 17, endLine: 18, color: 'indigo', label: 'instanceof checks the prototype chain — both true' },
        ],
        connections: [{ fromLine: 10, toLine: 1, color: 'violet', label: 'extends — chain linked', type: 'inherits' }],
      },
      {
        title: 'super() — calling the parent constructor',
        semanticEvent: 'CallFunction',
        code:
`class Animal {
  constructor(name, sound) {
    this.name  = name
    this.sound = sound
  }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')   // MUST be called before 'this' — delegates to Animal's constructor
    this.tricks = []      // Dog-specific property — added after super() sets up the base
  }
}

const dog  = new Dog('Rex')
const bird = new Animal('Bird', 'tweet')
console.log(dog.speak())   // → 'Rex says: woof!'
console.log(dog.tricks)    // → []
console.log(dog.name)      // → 'Rex'  (set by Animal's constructor via super)`,
        explanation: [
          '`super(name, \'woof\')` establishes the **two-phase construction contract**: the parent constructor runs first, setting `this.name` and `this.sound`; then Dog adds `this.tricks = []` after. `super()` must come before any use of `this` — the object does not exist until Animal\'s constructor initialises it.',
          'After super(), Dog adds its own property: this.tricks = []. The resulting dog instance has name (set by Animal), sound (set by Animal), and tricks (set by Dog). Callers only need to pass name — sound is always \'woof\' for all dogs, so Dog\'s constructor encapsulates that default.',
          'CS — super() is not just syntactic convenience. In ES2015, the new.target mechanism and the way TDZ (Temporal Dead Zone) works for this in derived classes make it structurally mandatory. The base class constructor is the one that actually creates the object. The subclass constructor receives it and may augment it. This is the standard in most OOP languages.',
          'SE — Calling super() first, then augmenting, enforces a clear two-phase construction: parent sets up the shared foundation, child adds specialisation. This prevents bugs where a subclass sets properties before the base class initialises shared fields. In frameworks like React (pre-hooks), constructor() { super(props); this.state = {} } was mandatory for this reason.',
        ],
        active: [
          { startLine: 10, endLine: 14, color: 'violet', label: 'Dog constructor — super first, own setup after' },
          { startLine: 12, endLine: 12, color: 'pink', label: 'super() — must come before \'this\' access' },
          { startLine: 13, endLine: 13, color: 'emerald', label: 'this.tricks — Dog-specific, added after base is ready' },
        ],
        connections: [{ fromLine: 12, toLine: 2, color: 'pink', label: 'super → Animal constructor', type: 'calls' }],
      },
      {
        title: 'Subclass method — Dog.learn() that Animal doesn\'t have',
        semanticEvent: 'DefineFunction',
        code:
`class Animal {
  constructor(name, sound) { this.name = name; this.sound = sound }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')
    this.tricks = []
  }

  learn(trick) {                     // Dog-only — Animal and Cat do not have this
    this.tricks.push(trick)
    return this.name + ' learned: ' + trick
  }
}

const dog  = new Dog('Rex')
const bird = new Animal('Bird', 'tweet')
dog.learn('sit')
dog.learn('roll over')
console.log(dog.tricks)    // → ['sit', 'roll over']
console.log(dog.speak())   // → 'Rex says: woof!'  (still inherited from Animal)
// bird.learn              // → undefined — Animal has no learn method`,
        explanation: [
          '`learn()` establishes the **subclass-only extension**: placed on `Dog.prototype`, it is not on `Animal.prototype`. `dog.learn(\'sit\')` finds it immediately; `bird.learn` is `undefined` because Animal\'s chain has no `learn`. Extending Dog\'s interface does not touch Animal — only Dog instances can learn tricks.',
          'Trace dog.learn(\'sit\'): push \'sit\' into this.tricks (dog\'s own tricks array). Return \'Rex learned: sit\'. dog.tricks is now [\'sit\']. dog.speak() still works — it walks dog → Dog.prototype (no speak) → Animal.prototype (found!) and calls it with this = dog.',
          'CS — This is interface segregation: Dog extends Animal\'s interface with learn() without modifying Animal. The prototype chain supports this naturally — adding to Dog.prototype does not touch Animal.prototype. Any existing code using Animal instances is completely unaffected by Dog gaining new methods.',
          'SE — Extending through subclasses is the open/closed principle: open for extension (add Dog.learn), closed for modification (do not change Animal). If Animal were changed to add learn, it would affect ALL animal types — cats, birds, fish — which is wrong. Subclass-level extension puts new behaviour exactly where it belongs.',
        ],
        active: [
          { startLine: 13, endLine: 16, color: 'violet', label: 'learn — Dog.prototype only' },
          { startLine: 19, endLine: 20, color: 'indigo', label: 'two separate types — dog can learn, bird cannot' },
          { startLine: 24, endLine: 24, color: 'emerald', label: 'inherited speak still works on Dog' },
        ],
        connections: [],
      },
      {
        title: 'Override speak() — same name, different body',
        semanticEvent: 'DefineFunction',
        code:
`class Animal {
  constructor(name, sound) { this.name = name; this.sound = sound }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')
    this.tricks = []
  }

  learn(trick) {
    this.tricks.push(trick)
    return this.name + ' learned: ' + trick
  }

  speak() {    // overrides Animal.speak — lookup stops here for Dog instances
    return this.name + ' BARKS: ' + this.sound.toUpperCase() + '!!!'
  }
}

const dog  = new Dog('Rex')
const bird = new Animal('Bird', 'tweet')
dog.learn('sit')
dog.learn('roll over')
console.log(dog.tricks)    // → ['sit', 'roll over']
console.log(bird.speak())  // → 'Bird says: tweet!'   (Animal.speak — found on Animal.prototype)
console.log(dog.speak())   // → 'Rex BARKS: WOOF!!!'  (Dog.speak — found on Dog.prototype first)
// bird.learn              // → undefined — Animal has no learn method`,
        explanation: [
          'Dog\'s `speak()` on `Dog.prototype` establishes the **method shadow**: the lookup finds Dog\'s version first and never reaches Animal\'s. `dog.speak()` returns `\'Rex BARKS: WOOF!!!\'`; `bird.speak()` reaches Animal\'s `speak` unchanged. Same method name, two different implementations, dispatched by instance type.',
          'Trace dog.speak(): look on dog (not found). Look on Dog.prototype (found Dog\'s speak). Call it with this = dog. Return \'Rex BARKS: WOOF!!!\'. Trace bird.speak(): look on bird (not found). Look on Animal.prototype (found Animal\'s speak). Call it with this = bird. Return \'Bird says: tweet!\'.',
          'CS — Method overriding: a child prototype shadows the parent prototype\'s method of the same name. The shadow is complete — Dog\'s speak completely replaces Animal\'s speak for Dog instances. This is different from shadowing in scope chains (where both bindings exist). Here, the child prototype\'s method is found first in the lookup walk.',
          'SE — Override when the subtype\'s behaviour should be fundamentally different from the base\'s. Dog barking is dog-specific, not animal-generic. The power: code that calls animal.speak() will get the right implementation for each subtype automatically. This is runtime polymorphism — the method dispatched depends on the runtime type, not the declared type.',
        ],
        active: [
          { startLine: 18, endLine: 20, color: 'violet', label: 'Dog.speak — shadows Animal.speak for Dog instances' },
          { startLine: 3, endLine: 3, color: 'indigo', label: 'Animal.speak — still used by non-Dog instances' },
          { startLine: 27, endLine: 29, color: 'emerald', label: 'same method name → two different implementations' },
        ],
        connections: [],
      },
      {
        title: 'super.speak() — extend the parent rather than replace',
        semanticEvent: 'CallFunction',
        code:
`class Animal {
  constructor(name, sound) { this.name = name; this.sound = sound }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')
    this.tricks = []
  }

  learn(trick) {
    this.tricks.push(trick)
    return this.name + ' learned: ' + trick
  }

  speak() {
    const baseOutput = super.speak()   // calls Animal.speak with this = dog
    return baseOutput + ' *wags tail*'
  }
}

const dog  = new Dog('Rex')
const bird = new Animal('Bird', 'tweet')
dog.learn('sit')
dog.learn('roll over')
console.log(dog.tricks)    // → ['sit', 'roll over']
console.log(dog.speak())   // → 'Rex says: woof! *wags tail*'
console.log(bird.speak())  // → 'Bird says: tweet!'
// super.speak() returned 'Rex says: woof!' — Dog appended its own ending`,
        explanation: [
          '`super.speak()` establishes the **parent-reuse relationship**: it explicitly calls Animal\'s `speak` with `this` still bound to the Dog instance, returning `\'Rex says: woof!\'`, then Dog appends `\' *wags tail*\'`. Without `super`, Dog would have to copy Animal\'s format logic — and diverge silently when Animal\'s format changes.',
          'Without super, Dog would need to copy Animal.speak\'s logic: this.name + \' says: \' + this.sound + \'!\'. If Animal\'s format changes later, Dog would also need updating — tight coupling. With super, Dog reuses Animal\'s work and Animal can evolve independently. Dog automatically benefits from any change to Animal.speak\'s output.',
          'CS — super in a method body is resolved at definition time to the parent class (Animal). It is not the same as calling this.speak() (which would cause infinite recursion — Dog.speak calling Dog.speak). super.speak() specifically traverses to Animal.prototype.speak. This works even in deeply nested hierarchies: super always means one level up.',
          'SE — super is how inheritance enables extension without duplication. The Template Method pattern uses this: base class defines the skeleton, subclasses override steps. React\'s componentDidMount() calls are dispatched through super in class components. Angular lifecycle hooks work the same way. The pattern appears whenever a subclass needs to do what the parent does, plus something extra.',
        ],
        active: [
          { startLine: 18, endLine: 21, color: 'violet', label: 'Dog.speak — calls super then adds its own ending' },
          { startLine: 19, endLine: 19, color: 'pink', label: 'super.speak() — dispatches to Animal.speak specifically' },
          { startLine: 3, endLine: 3, color: 'indigo', label: 'Animal.speak — called via super, runs with this = dog' },
          { startLine: 29, endLine: 29, color: 'emerald', label: 'result = Animal\'s format + Dog\'s addition' },
        ],
        connections: [{ fromLine: 19, toLine: 3, color: 'pink', label: 'super → Animal.speak', type: 'calls' }],
      },
      {
        title: 'Cat — a second independent subclass',
        semanticEvent: 'DefineClass',
        code:
`class Animal {
  constructor(name, sound) { this.name = name; this.sound = sound }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')
    this.tricks = []
  }

  learn(trick) {
    this.tricks.push(trick)
    return this.name + ' learned: ' + trick
  }

  speak() {
    const baseOutput = super.speak()
    return baseOutput + ' *wags tail*'
  }
}

class Cat extends Animal {       // independent subclass — sibling of Dog in the hierarchy
  constructor(name) { super(name, 'meow') }

  speak() {                      // Cat's own override — different from Dog's
    return this.name + ' purrs: ' + this.sound + '...'
  }
}

const dog  = new Dog('Rex')
const cat  = new Cat('Whiskers')
const bird = new Animal('Bird', 'tweet')
dog.learn('sit')
dog.learn('roll over')
console.log(dog.tricks)
console.log(dog.speak())   // → 'Rex says: woof! *wags tail*'
console.log(cat.speak())   // → 'Whiskers purrs: meow...'
console.log(bird.speak())  // → 'Bird says: tweet!'`,
        explanation: [
          '`Cat extends Animal` establishes the **sibling subclass relationship**: Dog and Cat are independent leaf classes that both inherit from Animal, neither from each other. Cat always passes `\'meow\'` to `super`, and its `speak()` formats differently from both Animal\'s and Dog\'s — three distinct implementations, one shared base.',
          'The prototype chain for a Cat instance: cat → Cat.prototype → Animal.prototype → Object.prototype → null. For a Dog instance: dog → Dog.prototype → Animal.prototype → Object.prototype → null. Both chains include Animal.prototype, which is why both satisfy instanceof Animal. Neither chain includes the other\'s prototype.',
          'CS — A class hierarchy is a tree, not a chain. Animal is the root. Dog and Cat are leaves (no further subclasses here). The tree can be as deep or wide as needed. Java\'s Object, Python\'s object, and JavaScript\'s Object.prototype are all the implicit roots of their respective hierarchies — every class ultimately inherits from them.',
          'SE — Adding Cat did not require changing Animal or Dog. This is the open/closed principle at the class level: Animal is closed for modification, open for extension by new subclasses. If a new Animal.swim() method is added later, Dog, Cat, and all future subclasses automatically inherit it without any changes to them.',
        ],
        active: [
          { startLine: 24, endLine: 30, color: 'pink', label: 'Cat — independent subclass of Animal' },
          { startLine: 7, endLine: 22, color: 'violet', label: 'Dog — sibling of Cat, different behaviour' },
          { startLine: 38, endLine: 40, color: 'emerald', label: 'three speak() implementations, dispatched by type' },
        ],
        connections: [],
      },
      {
        title: 'Polymorphism — one loop, the right method for each type',
        semanticEvent: 'CallFunction',
        code:
`class Animal {
  constructor(name, sound) { this.name = name; this.sound = sound }
  speak()    { return this.name + ' says: ' + this.sound + '!' }
  toString() { return 'Animal(' + this.name + ')' }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'woof')
    this.tricks = []
  }

  learn(trick) {
    this.tricks.push(trick)
    return this.name + ' learned: ' + trick
  }

  speak() {
    const baseOutput = super.speak()
    return baseOutput + ' *wags tail*'
  }
}

class Cat extends Animal {
  constructor(name) { super(name, 'meow') }

  speak() {
    return this.name + ' purrs: ' + this.sound + '...'
  }
}

const dog  = new Dog('Rex')
const cat  = new Cat('Whiskers')
const bird = new Animal('Bird', 'tweet')
dog.learn('sit')
dog.learn('roll over')
console.log(dog.tricks)
console.log(dog.speak())
console.log(cat.speak())
console.log(bird.speak())

const animals = [dog, cat, bird]
animals.forEach(function(animal) { console.log(animal.speak()) })
// → 'Rex says: woof! *wags tail*'
// → 'Whiskers purrs: meow...'
// → 'Bird says: tweet!'`,
        explanation: [
          'The `forEach` loop establishes the **polymorphism contract**: `animal.speak()` dispatches to the correct implementation for each runtime type — Dog.speak, Cat.speak, or Animal.speak — without the loop knowing which is which. One call site, three dispatch paths through the prototype chain.',
          'Trace forEach: animal = dog → Dog.prototype has speak → \'Rex says: woof! *wags tail*\'. animal = cat → Cat.prototype has speak → \'Whiskers purrs: meow...\'. animal = bird (plain Animal) → Dog.prototype/Cat.prototype not in chain → Animal.prototype has speak → \'Bird says: tweet!\'.',
          'CS — Runtime (dynamic) dispatch: the method called is determined at runtime by the actual type of the object, not by the declared type of the variable. This is in contrast to static dispatch (C function pointers, Go interface tables) where the function is resolved at compile time. V8 uses hidden classes and inline caches to make dynamic dispatch nearly as fast as static dispatch.',
          'SE — This is the power that makes frameworks like Express, React, and Vue possible. Express middleware calls next() without knowing what next is — it could be a route handler, another middleware, or an error handler. React calls render() on components without knowing if they are class components, function components, or forwardRef components. Polymorphism decouples the caller from the implementation.',
        ],
        active: [
          { startLine: 42, endLine: 42, color: 'violet', label: 'mixed array — Dog, Cat, Animal stored as Animals' },
          { startLine: 43, endLine: 43, color: 'emerald', label: 'one call site, three dispatch paths via prototype chain' },
          { startLine: 3, endLine: 3, color: 'indigo', label: 'Animal.speak — used only for plain Animal instances' },
          { startLine: 18, endLine: 20, color: 'pink', label: 'Dog.speak — used only when this is a Dog instance' },
        ],
        connections: [],
      },
    ],
  }
