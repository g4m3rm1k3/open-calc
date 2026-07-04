export default   {
    id: 'ts-classes-mod',
    title: 'TS Classes',
    tag: 'TypeScript',
    lang: 'ts',
    steps: [
      {
        title: 'Typed class — annotations on every member',
        code:
`class Shape {
  name: string   // property declaration — tells TypeScript 'name' exists and is a string

  constructor(name: string) {
    this.name = name
  }

  describe(): string {
    return 'I am a ' + this.name
  }
}

const square = new Shape('square')
console.log(square.describe())  // → 'I am a square'
console.log(square.name)        // → 'square'`,
        explanation: [
          'TypeScript adds type annotations to every class member. name: string on line 2 is a property declaration — it tells the compiler that any Shape instance will have a name property of type string. Without it, TypeScript would not know name exists when the constructor tries to assign this.name.',
          'The constructor parameter name: string and the return type describe(): string are type annotations — both are erased in compiled JavaScript. The class compiled to plain JavaScript is identical to a class you would write without TypeScript. Types add zero runtime overhead.',
          'CS — TypeScript class property declarations are compile-time assertions about instance structure. They are checked against constructor assignments and method usage. If the constructor assigns this.name = 42 (a number, not a string), TypeScript reports a type error at that line. The class serves as a blueprint for both structure (what the object has) and behaviour (what it can do).',
          'SE — Typed classes provide three benefits over untyped ones: autocomplete (your editor knows square.name is a string and offers string methods), safety (you cannot pass a Shape to a function expecting a number without an error), and documentation (the class itself is a specification anyone can read). This is why TypeScript is the default for all large-scale JavaScript projects.',
        ],
        active: [
          { startLine: 2, endLine: 2, color: 'indigo', label: 'name: string — property declaration, erased at compile time' },
          { startLine: 4, endLine: 4, color: 'violet', label: 'name: string — typed parameter' },
          { startLine: 8, endLine: 8, color: 'pink', label: 'describe(): string — typed return, compiler verifies' },
        ],
        connections: [],
        runCode:
`class Shape {
  constructor(name) {
    this.name = name
  }
  describe() {
    return 'I am a ' + this.name
  }
}
const square = new Shape('square')
console.log(square.describe())
console.log(square.name)`,
      },
      {
        title: 'calculateArea() — template method pattern',
        code:
`class Shape {
  name: string

  constructor(name: string) {
    this.name = name
  }

  calculateArea(): number {
    // subclasses must override this — throw makes the expectation explicit
    throw new Error(this.name + '.calculateArea() is not implemented')
  }

  describe(): string {
    // calls calculateArea() — will dispatch to the correct subclass version
    return this.name + ' with area ' + this.calculateArea().toFixed(2)
  }
}
// new Shape('x').describe()  // would throw — base class cannot calculate area`,
        explanation: [
          'calculateArea() throws an Error if called on a plain Shape instance. subclasses are expected to override it. describe() calls this.calculateArea() — when called on a Circle, it dispatches to Circle.calculateArea(); when called on a Rectangle, it dispatches there. The base class defines the workflow (describe → format area), subclasses provide the variable part.',
          'toFixed(2) is a Number method that formats the value as a string with exactly two decimal places. calculateArea() returns a number, so toFixed(2) works. If calculateArea returned a string, the TypeScript compiler would catch it at compile time because : number declares the return type.',
          'CS — This is the Template Method pattern from Design Patterns (GoF, 1994): the base class defines an algorithm\'s skeleton, subclasses fill in the variable steps. describe() is the template method — it orchestrates the computation. calculateArea() is the abstract step — each subclass provides a concrete implementation. The pattern is used in frameworks everywhere.',
          'SE — The throw pattern achieves what abstract would in TypeScript (abstract class + abstract method). We use throw here because: it is JavaScript-compatible (abstract methods cannot be called), it is self-documenting (the error message tells the developer exactly what to implement), and it is runtime-safe (if a subclass somehow forgets to override, the error surfaces immediately rather than silently returning NaN or undefined).',
        ],
        active: [
          { startLine: 8, endLine: 11, color: 'pink', label: 'calculateArea — must be overridden or it throws' },
          { startLine: 13, endLine: 16, color: 'violet', label: 'describe — the template method, calls calculateArea()' },
          { startLine: 15, endLine: 15, color: 'indigo', label: 'dispatches to the correct subclass calculateArea via prototype chain' },
        ],
        connections: [{ fromLine: 15, toLine: 8, color: 'violet', label: 'template calls abstract step' }],
      },
      {
        title: 'private and protected — access modifiers',
        code:
`class Shape {
  protected name: string      // Shape + subclasses can read/write — outside code cannot
  private _callCount: number  // ONLY Shape methods can access this

  constructor(name: string) {
    this.name       = name
    this._callCount = 0
  }

  calculateArea(): number {
    throw new Error(this.name + '.calculateArea() is not implemented')
  }

  describe(): string {
    this._callCount++    // private — only allowed because we are inside Shape
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
// shape.name        // ✗ TypeScript error: 'name' is protected
// shape._callCount  // ✗ TypeScript error: '_callCount' is private`,
        explanation: [
          'protected name means Shape\'s own methods and all subclass methods can access name — but code outside the class hierarchy cannot. private _callCount means only code inside the Shape class body can access it — not even subclasses. These are compile-time enforcements only; compiled JavaScript has no runtime access control.',
          'The underscore prefix on _callCount is a convention (private-by-name), but protected/private enforce it at the type level. Line 15 increments _callCount inside describe() — allowed because we are inside Shape. A Circle subclass could read this.name (protected), but cannot read or write this._callCount (private to Shape).',
          'CS — Access modifiers are an OOP mechanism to formalise encapsulation at the class level. They define two surfaces: the public surface (anything not marked private/protected, accessible to all callers) and the private surface (internal details, accessible only to the class or its hierarchy). Changing the private surface is safe — it cannot break callers. Changing the public surface can.',
          'SE — This is the information hiding principle: expose the minimum necessary. _callCount is an implementation detail — it tracks how many times describe() was called, which is Shape\'s internal concern. Subclasses and callers do not need to know how describe() tracks its calls. Hiding it means Shape can change the tracking strategy (use a Map, reset periodically) without breaking anything.',
        ],
        active: [
          { startLine: 2, endLine: 2, color: 'violet', label: 'protected — Shape + subclasses only' },
          { startLine: 3, endLine: 3, color: 'pink', label: 'private — Shape\'s own methods only' },
          { startLine: 14, endLine: 16, color: 'emerald', label: 'inside Shape — both accesses are allowed' },
          { startLine: 18, endLine: 19, color: 'indigo', label: 'outside — both blocked by TypeScript' },
        ],
        connections: [],
      },
      {
        title: 'Circle extends Shape — override calculateArea()',
        code:
`class Shape {
  protected name: string
  private _callCount: number
  constructor(name: string) { this.name = name; this._callCount = 0 }
  calculateArea(): number { throw new Error(this.name + '.calculateArea() not implemented') }
  describe(): string {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}

class Circle extends Shape {
  private radius: number   // private to Circle — even Shape cannot read this

  constructor(radius: number) {
    super('Circle')        // Animal.constructor sets this.name = 'Circle', _callCount = 0
    this.radius = radius
  }

  calculateArea(): number {   // overrides Shape — provides the real formula
    return Math.PI * this.radius * this.radius
  }
}

const circle = new Circle(5)
console.log(circle.describe())   // → 'Circle area=78.54 [call #1]'
console.log(circle.describe())   // → 'Circle area=78.54 [call #2]'
// circle.radius       // ✗ private to Circle
// circle._callCount   // ✗ private to Shape`,
        explanation: [
          'Circle extends Shape and overrides calculateArea() with the real formula: π × r². When describe() runs on a circle instance, this.calculateArea() dispatches to Circle\'s version — not the one that throws. describe() also reads this.name (protected, Shape allows subclass access) and this._callCount (private to Shape, allowed because describe() IS a Shape method).',
          'Trace circle.describe(): _callCount++ → 1. this.calculateArea() dispatches to Circle.calculateArea → Math.PI × 5 × 5 = 78.54. Return \'Circle area=78.54 [call #1]\'. Second call: _callCount++ → 2. Same area calculation. Return \'Circle area=78.54 [call #2]\'. _callCount persists between calls because it is on the instance.',
          'CS — The dispatch of this.calculateArea() from describe() to Circle.calculateArea() is dynamic dispatch through the prototype chain: circle → Circle.prototype (calculateArea found here — used) → Shape.prototype (calculateArea exists here too, but never reached). This is the same polymorphism mechanism as in the Inheritance lesson, now applied through typed class hierarchies.',
          'SE — Each layer of privacy serves a purpose: radius is private to Circle because only Circle\'s formula needs it. _callCount is private to Shape because tracking calls is purely Shape\'s internal mechanism. name is protected because subclasses (like a hypothetical Circle that formats its own name) might need to read it. Access modifiers communicate design intent to every future reader.',
        ],
        active: [
          { startLine: 12, endLine: 21, color: 'violet', label: 'Circle — private radius, overrides calculateArea' },
          { startLine: 19, endLine: 21, color: 'indigo', label: 'the real formula — replaces the throw' },
          { startLine: 24, endLine: 25, color: 'emerald', label: 'describe() uses Circle.calculateArea — via dynamic dispatch' },
          { startLine: 26, endLine: 27, color: 'pink', label: 'access blocked — private to respective classes' },
        ],
        connections: [{ fromLine: 8, toLine: 20, color: 'violet', label: 'dynamic dispatch to Circle' }],
        runCode:
`class Shape {
  constructor(name) { this.name = name; this._callCount = 0 }
  calculateArea() { throw new Error(this.name + '.calculateArea() not implemented') }
  describe() {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
class Circle extends Shape {
  constructor(radius) {
    super('Circle')
    this.radius = radius
  }
  calculateArea() { return Math.PI * this.radius * this.radius }
}
const circle = new Circle(5)
console.log(circle.describe())
console.log(circle.describe())`,
      },
      {
        title: 'readonly — property set once, frozen after',
        code:
`class Shape {
  protected name: string
  private _callCount: number
  constructor(name: string) { this.name = name; this._callCount = 0 }
  calculateArea(): number { throw new Error(this.name + '.calculateArea() not implemented') }
  describe(): string {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}

class Circle extends Shape {
  private radius: number
  readonly id: string    // set in constructor, cannot be reassigned afterward

  constructor(radius: number) {
    super('Circle')
    this.radius = radius
    this.id     = 'circle-r' + radius   // only assignment allowed — inside constructor
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius
  }
}

const circle = new Circle(5)
console.log(circle.id)        // → 'circle-r5'
console.log(circle.describe())
// circle.id = 'other'        // ✗ compile error — readonly after constructor`,
        explanation: [
          'readonly id allows assignment only inside the constructor — that is the one window where the property can be set. After construction, any assignment is a TypeScript compile error. circle.id = \'other\' on line 27 would be caught before the code runs.',
          'readonly and const serve different purposes: const prevents a variable from being rebound (const x = 5; x = 6 is illegal). readonly prevents an object property from being reassigned (circle.id = \'x\' is illegal). A readonly property can hold a mutable value — if id were a readonly array, you could still push to it; you just could not replace the array reference.',
          'CS — Immutability invariants allow the compiler and runtime to make assumptions: a readonly property read at time T₁ has the same value at time T₂. This enables caching, structural sharing, and reference equality checks. React\'s reconciler uses object identity (===) to decide whether to re-render — this only works correctly if props are immutable.',
          'SE — readonly communicates permanence: the id is part of the Circle\'s identity, not a setting. IDs, timestamps, and configuration values that should not change after construction are good candidates for readonly. They make code easier to reason about: a reader knows that a readonly property value never changes, so they can understand a function without tracking mutation.',
        ],
        active: [
          { startLine: 14, endLine: 14, color: 'violet', label: 'readonly id — frozen after constructor finishes' },
          { startLine: 19, endLine: 19, color: 'emerald', label: 'only place id can be set — inside the constructor' },
          { startLine: 27, endLine: 27, color: 'indigo', label: 'readable by anyone — immutability ≠ private' },
          { startLine: 29, endLine: 29, color: 'pink', label: 'compile error — cannot reassign a readonly property' },
        ],
        connections: [],
        runCode:
`class Shape {
  constructor(name) { this.name = name; this._callCount = 0 }
  calculateArea() { throw new Error(this.name + '.calculateArea() not implemented') }
  describe() {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
class Circle extends Shape {
  constructor(radius) {
    super('Circle')
    this.radius = radius
    this.id = 'circle-r' + radius
  }
  calculateArea() { return Math.PI * this.radius * this.radius }
}
const circle = new Circle(5)
console.log(circle.id)
console.log(circle.describe())`,
      },
      {
        title: 'Rectangle — override with the keyword',
        code:
`class Shape {
  protected name: string
  private _callCount: number
  constructor(name: string) { this.name = name; this._callCount = 0 }
  calculateArea(): number { throw new Error(this.name + '.calculateArea() not implemented') }
  describe(): string {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}

class Circle extends Shape {
  private radius: number; readonly id: string
  constructor(radius: number) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  override calculateArea(): number { return Math.PI * this.radius * this.radius }
}

class Rectangle extends Shape {
  private width:  number
  private height: number

  constructor(width: number, height: number) {
    super('Rectangle')
    this.width  = width
    this.height = height
  }

  override calculateArea(): number { return this.width * this.height }
}

const c = new Circle(5)
const r = new Rectangle(3, 4)
console.log(c.describe())  // → 'Circle area=78.54 [call #1]'
console.log(r.describe())  // → 'Rectangle area=12.00 [call #1]'`,
        explanation: [
          'override before calculateArea() makes the overriding intent explicit and compiler-verified. If Shape renames calculateArea() to computeArea(), any method marked override that no longer matches a parent method becomes a compile error immediately — every override keyword in every subclass becomes an error. This prevents the silent \'ghost method\' bug: a method that was once an override but is now unrelated to the parent.',
          'Rectangle adds two private fields: width and height. Both are private — even Shape cannot access them. The constructor calls super(\'Rectangle\') to set up the base, then sets its own fields. Rectangle.calculateArea() returns width × height — the standard formula. No throw needed because this is a concrete class with a real formula.',
          'CS — override was added in TypeScript 4.3 specifically to prevent the ghost method bug: you rename a base method and all the subclass overrides become unrelated methods that are silently never called. The TypeScript compiler now validates that every override method exists on a parent. This is a feature Java, Kotlin, and Swift all have for the same reason.',
          'SE — Two different shapes, one describe() caller. The template method pattern means describe() does not need to know the area formula — it just calls this.calculateArea() and formats the result. If a Triangle subclass is added, it only needs to implement calculateArea() and it immediately works with describe(). Zero changes to Shape or existing subclasses.',
        ],
        active: [
          { startLine: 15, endLine: 15, color: 'violet', label: 'override — compiler verifies a matching parent method exists' },
          { startLine: 18, endLine: 27, color: 'pink', label: 'Rectangle — two private fields, override with formula' },
          { startLine: 31, endLine: 32, color: 'emerald', label: 'same describe() call — dispatches to each shape\'s formula' },
        ],
        connections: [],
        runCode:
`class Shape {
  constructor(name) { this.name = name; this._callCount = 0 }
  calculateArea() { throw new Error(this.name + '.calculateArea() not implemented') }
  describe() {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
class Circle extends Shape {
  constructor(radius) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  calculateArea() { return Math.PI * this.radius * this.radius }
}
class Rectangle extends Shape {
  constructor(width, height) {
    super('Rectangle')
    this.width = width
    this.height = height
  }
  calculateArea() { return this.width * this.height }
}
const c = new Circle(5)
const r = new Rectangle(3, 4)
console.log(c.describe())
console.log(r.describe())`,
      },
      {
        title: 'override describe() — super + own extension',
        code:
`class Shape {
  protected name: string
  private _callCount: number
  constructor(name: string) { this.name = name; this._callCount = 0 }
  calculateArea(): number { throw new Error(this.name + '.calculateArea() not implemented') }
  describe(): string {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}

class Circle extends Shape {
  private radius: number; readonly id: string
  constructor(radius: number) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  override calculateArea(): number { return Math.PI * this.radius * this.radius }

  override describe(): string {       // extends Shape's describe with radius info
    return super.describe() + ' [r=' + this.radius + ']'
  }
}

class Rectangle extends Shape {
  private width:  number
  private height: number

  constructor(width: number, height: number) {
    super('Rectangle')
    this.width  = width
    this.height = height
  }

  override calculateArea(): number { return this.width * this.height }
}

const c = new Circle(5)
const r = new Rectangle(3, 4)
console.log(c.describe())  // → 'Circle area=78.54 [call #1] [r=5]'
console.log(r.describe())  // → 'Rectangle area=12.00 [call #1]'`,
        explanation: [
          'Circle also overrides describe(). super.describe() calls Shape\'s describe() with this = circle — Shape increments _callCount (accessing its own private field via the method, which is legal) and computes the area string. Circle\'s describe then appends \' [r=5]\'. Rectangle uses Shape\'s describe unchanged.',
          'Trace c.describe(): dispatches to Circle.describe (override). super.describe(): dispatches to Shape.describe with this=circle. _callCount++ → 1. this.calculateArea() dispatches to Circle.calculateArea → 78.54. Returns \'Circle area=78.54 [call #1]\'. Back in Circle.describe: append \' [r=5]\'. Final: \'Circle area=78.54 [call #1] [r=5]\'.',
          'CS — super in an instance method walks to the parent\'s prototype: super.describe() is Shape.prototype.describe.call(this). The this is unchanged — it is still the Circle instance. This means Shape.describe can access private fields _callCount via its own methods, and Circle.calculateArea is still dispatched when Shape.describe calls this.calculateArea().',
          'SE — Extending parent behaviour with super is the correct way to specialise without duplication. Alternative: Circle.describe could copy Shape\'s entire formatting logic. But then if Shape\'s format changes, Circle breaks. With super, Circle reuses and Shape can evolve. This is the Template Method pattern in reverse — a subclass extending the template rather than just filling in a step.',
        ],
        active: [
          { startLine: 17, endLine: 19, color: 'violet', label: 'Circle.describe — calls super then appends its own info' },
          { startLine: 18, endLine: 18, color: 'pink', label: 'super.describe() — runs Shape\'s implementation with this=circle' },
          { startLine: 38, endLine: 39, color: 'emerald', label: 'Circle gets extra [r=5]; Rectangle uses plain Shape output' },
        ],
        connections: [{ fromLine: 18, toLine: 6, color: 'pink', label: 'super → Shape.describe' }],
        runCode:
`class Shape {
  constructor(name) { this.name = name; this._callCount = 0 }
  calculateArea() { throw new Error(this.name + '.calculateArea() not implemented') }
  describe() {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
class Circle extends Shape {
  constructor(radius) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  calculateArea() { return Math.PI * this.radius * this.radius }
  describe() { return super.describe() + ' [r=' + this.radius + ']' }
}
class Rectangle extends Shape {
  constructor(width, height) { super('Rectangle'); this.width = width; this.height = height }
  calculateArea() { return this.width * this.height }
}
const c = new Circle(5)
const r = new Rectangle(3, 4)
console.log(c.describe())
console.log(r.describe())`,
      },
      {
        title: 'Full program — typed polymorphism',
        code:
`class Shape {
  protected name: string
  private _callCount: number
  constructor(name: string) { this.name = name; this._callCount = 0 }
  calculateArea(): number { throw new Error(this.name + '.calculateArea() not implemented') }
  describe(): string {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}

class Circle extends Shape {
  private radius: number; readonly id: string
  constructor(radius: number) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  override calculateArea(): number { return Math.PI * this.radius * this.radius }

  override describe(): string {
    return super.describe() + ' [r=' + this.radius + ']'
  }
}

class Rectangle extends Shape {
  private width:  number
  private height: number

  constructor(width: number, height: number) {
    super('Rectangle')
    this.width  = width
    this.height = height
  }

  override calculateArea(): number { return this.width * this.height }
}

const c = new Circle(5)
const r = new Rectangle(3, 4)
console.log(c.describe())
console.log(r.describe())

const shapes: Shape[] = [
  new Circle(5), new Rectangle(3, 4), new Circle(2), new Rectangle(6, 7),
]
shapes.forEach(function(shape) { console.log(shape.describe()) })`,
        explanation: [
          'shapes: Shape[] is a typed array of Shape. TypeScript knows each element is at least a Shape — it has describe() and calculateArea(). The forEach calls shape.describe() without knowing whether each shape is a Circle or Rectangle. Dynamic dispatch through the prototype chain dispatches to the right class at runtime.',
          'Trace forEach: shape=Circle(5) → Circle.describe → \'Circle area=78.54 [call #1] [r=5]\'. shape=Rectangle(3,4) → Shape.describe → \'Rectangle area=12.00 [call #1]\'. shape=Circle(2) → Circle.describe → \'Circle area=12.57 [call #1] [r=2]\'. shape=Rectangle(6,7) → Shape.describe → \'Rectangle area=42.00 [call #1]\'. Each Circle tracks its own _callCount independently.',
          'CS — Shape[] is a polymorphic container. TypeScript allows this because Circle and Rectangle both satisfy Shape (via inheritance). The array can hold any Shape subtype. This is covariant container behaviour — a Circle[] can be assigned to Shape[] because every Circle is a Shape. TypeScript enforces this at compile time.',
          'SE — This is the complete OOP stack: interface (the public surface of describe()), encapsulation (private/protected fields), inheritance (extends + super), and polymorphism (dynamic dispatch through the array). Every framework you will use in production (React, Angular, Express, NestJS) is built on exactly these four mechanisms. You now understand the foundation.',
        ],
        active: [
          { startLine: 40, endLine: 42, color: 'violet', label: 'Shape[] — typed, holds any Shape subtype' },
          { startLine: 43, endLine: 43, color: 'emerald', label: 'one forEach — four different dispatch paths' },
          { startLine: 1, endLine: 9, color: 'indigo', label: 'Shape — defines the contract every subtype honours' },
        ],
        connections: [],
        runCode:
`class Shape {
  constructor(name) { this.name = name; this._callCount = 0 }
  calculateArea() { throw new Error(this.name + '.calculateArea() not implemented') }
  describe() {
    this._callCount++
    return this.name + ' area=' + this.calculateArea().toFixed(2) + ' [call #' + this._callCount + ']'
  }
}
class Circle extends Shape {
  constructor(radius) { super('Circle'); this.radius = radius; this.id = 'circle-r' + radius }
  calculateArea() { return Math.PI * this.radius * this.radius }
  describe() { return super.describe() + ' [r=' + this.radius + ']' }
}
class Rectangle extends Shape {
  constructor(width, height) { super('Rectangle'); this.width = width; this.height = height }
  calculateArea() { return this.width * this.height }
}
const shapes = [new Circle(5), new Rectangle(3, 4), new Circle(2), new Rectangle(6, 7)]
shapes.forEach(function(shape) { console.log(shape.describe()) })`,
      },
    ],
  }
