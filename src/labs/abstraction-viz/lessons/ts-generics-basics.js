export default   {
    id: 'ts-generics-basics',
    title: 'Generics',
    tag: 'TypeScript',
    lang: 'ts',
    steps: [
      {
        title: 'The problem — one function per type, same logic',
        semanticEvent: 'DefineFunction',
        code:
`function getFirstNumber(arr: number[]): number | undefined {
  return arr[0]
}
function getFirstString(arr: string[]): string | undefined {
  return arr[0]   // identical body
}
function getFirstBoolean(arr: boolean[]): boolean | undefined {
  return arr[0]   // still identical
}

console.log(getFirstNumber([10, 20, 30]))     // → 10
console.log(getFirstString(['a', 'b', 'c']))  // → 'a'`,
        explanation: [
          'Three functions with identical bodies establish the **type duplication problem**: the logic (`arr[0]`) is type-agnostic, but the annotations are type-specific — adding a `Date` or `User` variant requires a fourth copy. Using `any[]` eliminates the copies but erases the return type, losing all downstream type safety. The solution is abstraction over types, not values.',
          'The core problem: the function\'s logic does not depend on the specific type — arr[0] works for any array. But the type annotations DO depend on the specific type: a number[] returns number | undefined, a string[] returns string | undefined. We need a way to write the function once while keeping the return type accurate per call.',
          'CS — This is the motivation for parametric polymorphism: one function, many types. In mathematics, a parametric function is one where a type is a parameter. In programming, this appears as generics (TypeScript, Java, C#), templates (C++), type parameters (Haskell, Rust), or type variables (OCaml). All solve the same problem: abstracting over types the same way functions abstract over values.',
          'SE — Parametric polymorphism is what makes reusable library code type-safe. Array.prototype.map, Promise.then, Object.keys — all are generic. If they were not generic, the standard library would need a separate mapNumber, mapString, mapUser for every type, which is obviously impossible. Generics are the mechanism that makes typed utility functions scale.',
        ],
        active: [
          { startLine: 1, endLine: 3, color: 'indigo', label: 'for number — same logic' },
          { startLine: 4, endLine: 6, color: 'violet', label: 'for string — identical logic, different types' },
          { startLine: 7, endLine: 9, color: 'pink', label: 'for boolean — three copies of one idea' },
        ],
        connections: [],
        runCode:
`function getFirstNumber(arr) { return arr[0] }
function getFirstString(arr) { return arr[0] }
function getFirstBoolean(arr) { return arr[0] }
console.log(getFirstNumber([10, 20, 30]))
console.log(getFirstString(['a', 'b', 'c']))`,
      },
      {
        title: '<T> — the type parameter placeholder',
        semanticEvent: 'ResolveGeneric',
        code:
`function getFirstNumber(arr: number[]): number | undefined { return arr[0] }
function getFirstString(arr: string[]): string | undefined { return arr[0] }
function getFirstBoolean(arr: boolean[]): boolean | undefined { return arr[0] }

// T is a placeholder — filled in at each call site by TypeScript's type inference
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

// TypeScript infers T from the argument — one function replaces all three above:
console.log(getFirst([10, 20, 30]))     // T = number → returns number | undefined → 10
console.log(getFirst(['a', 'b', 'c']))  // T = string → returns string | undefined → 'a'
console.log(getFirst([true, false]))    // T = boolean → returns boolean | undefined → true
console.log(getFirst([]))               // T = never  → returns never | undefined → undefined`,
        explanation: [
          '`<T>` establishes the **type parameter → per-call resolution relationship**: `T` is a variable over types that the compiler fills in independently at each call site. `getFirst([10, 20, 30])` resolves `T = number` — return type becomes `number | undefined`. `getFirst([\'a\', \'b\', \'c\'])` resolves `T = string`. One function, accurate return types for every caller.',
          'TypeScript infers T from the argument. Call getFirst([10, 20, 30]): the array is number[], so T = number. The return type becomes number | undefined. Call getFirst([\'a\', \'b\', \'c\']): the array is string[], so T = string. Return type: string | undefined. The compiler resolves T independently at each call site, and the inferred return type is accurate for each one.',
          'CS — Type inference is the process of deducing types from context without explicit annotation. TypeScript\'s Hindley-Milner-derived inference can resolve complex generic chains automatically. Explicit annotation (getFirst<number>([10, 20, 30])) is allowed but usually unnecessary. The compiler\'s inference is complete for most cases.',
          'SE — One function replaces three (or thirty). The return type is precise — callers know exactly what type they get back, enabling autocomplete and type-checked usage downstream. This is how all standard library generics work: Array<T>.map<U>, Promise<T>.then<U>, Map<K,V>.get(key: K): V | undefined. Generic functions compose: you can pass the result of getFirst into another generic function.',
        ],
        active: [
          { startLine: 6, endLine: 8, color: 'indigo', label: '<T> — one function replaces all three typed versions' },
          { startLine: 11, endLine: 14, color: 'emerald', label: 'T inferred independently at each call site' },
          { startLine: 1, endLine: 3, color: 'pink', label: 'old approach — three copies of the same logic' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
console.log(getFirst([10, 20, 30]))
console.log(getFirst(['a', 'b', 'c']))
console.log(getFirst([true, false]))
console.log(getFirst([]))`,
      },
      {
        title: 'getLast<T> — composing generic functions',
        semanticEvent: 'ResolveGeneric',
        code:
`function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

function getLast<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

const numbers = [10, 20, 30, 40]
const words   = ['alpha', 'beta', 'gamma']

console.log(getFirst(numbers))  // → 10  (T = number)
console.log(getLast(numbers))   // → 40  (T = number)
console.log(getFirst(words))    // → 'alpha'   (T = string)
console.log(getLast(words))     // → 'gamma'   (T = string)`,
        explanation: [
          '`getLast<T>` establishes the **independent T resolution relationship**: each generic function resolves its own `T` per call with no coupling between functions. `getFirst(numbers)` and `getLast(numbers)` both resolve `T = number` independently; `getFirst(words)` and `getLast(words)` both resolve `T = string` independently. Adding a `User` type to the codebase instantly works — zero changes to either function.',
          'The return type of getFirst(numbers) is number | undefined. If you write const first = getFirst(numbers) and then pass first to another function expecting a number, TypeScript knows it might be undefined and requires you to handle that case. The type safety flows from the generic through every variable assignment.',
          'CS — Parametric polymorphism composes: getFirst and getLast can be passed to higher-order functions that accept (arr: T[]) => T | undefined. The type parameter T flows through the composition. This is the basis of functional programming in typed languages: generic functions compose without losing type information.',
          'SE — Both functions work for any element type: numbers, strings, objects, custom classes, other arrays. If you add a User type to your codebase, getFirst<User> works instantly — zero code changes to getFirst. This is the open/closed principle at the function level: open to new types, closed for modification. The standard library\'s Array.prototype.find, .filter, and .reduce are all generics for the same reason.',
        ],
        active: [
          { startLine: 5, endLine: 7, color: 'violet', label: 'getLast<T> — same pattern, different logic' },
          { startLine: 11, endLine: 15, color: 'emerald', label: 'T resolved independently per function per call' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
const numbers = [10, 20, 30, 40]
const words   = ['alpha', 'beta', 'gamma']
console.log(getFirst(numbers))
console.log(getLast(numbers))
console.log(getFirst(words))
console.log(getLast(words))`,
      },
      {
        title: 'Box<T> — generic class',
        semanticEvent: 'DefineClass',
        code:
`function getFirst<T>(arr: T[]): T | undefined { return arr[0] }
function getLast<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }

class Box<T> {
  private contents: T   // T resolved when the Box is instantiated

  constructor(initial: T) {
    this.contents = initial
  }

  get(): T       { return this.contents }
  set(val: T): void { this.contents = val }
}

const numberBox = new Box(42)        // T = number — inferred from 42
const stringBox = new Box('hello')   // T = string — inferred from 'hello'

numberBox.set(100)
// numberBox.set('oops')   // ✗ compile error: 'oops' is string, Box is number

console.log(numberBox.get())  // → 100
console.log(stringBox.get())  // → 'hello'`,
        explanation: [
          '`Box<T>` establishes the **construction-locked type relationship**: `T` is resolved once at instantiation and frozen for that instance — `new Box(42)` locks `T = number`, making `get()` return `number` and `set()` accept only `number`. `new Box(\'hello\')` is a completely independent `Box<string>`. Passing a string to `numberBox.set()` is a compile error because T was locked at construction.',
          'new Box(\'hello\') creates an entirely separate stringBox with T = string. stringBox.get() returns string. stringBox.set() requires string. The two instances have different type parameters — they are effectively different types at compile time (Box<number> vs Box<string>), even though they share the same Box implementation.',
          'CS — Generic classes are instantiated with concrete types. Each instantiation creates a new concrete type: Box<number> is a different type from Box<string>, even though the implementation is one class. TypeScript handles this through structural typing — Box<number> is compatible with Box<number> but not Box<string> because their get() return types differ. C++ templates generate separate machine code per instantiation; TypeScript erases types and uses one implementation.',
          'SE — Generic containers appear in every production codebase: Promise<T>, Observable<T>, Map<K,V>, React.RefObject<T>. The Box pattern is the simplest generic container. More complex versions: a typed event emitter where EventEmitter<{click: MouseEvent}> only accepts click events of the right shape, or a typed API client where Client<Routes> only allows calls to defined routes.',
        ],
        active: [
          { startLine: 4, endLine: 13, color: 'indigo', label: 'Box<T> — T resolved per instance at construction' },
          { startLine: 15, endLine: 16, color: 'violet', label: 'two instances — T=number and T=string, independent' },
          { startLine: 18, endLine: 18, color: 'pink', label: 'compile error: numberBox\'s T is locked to number' },
          { startLine: 20, endLine: 21, color: 'emerald', label: 'each get() returns the correct locked type' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
class Box {
  constructor(initial) { this.contents = initial }
  get() { return this.contents }
  set(val) { this.contents = val }
}
const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())`,
      },
      {
        title: 'T extends Constraint — requiring a minimum shape',
        semanticEvent: 'ResolveGeneric',
        code:
`function getFirst<T>(arr: T[]): T | undefined { return arr[0] }
function getLast<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }

class Box<T> {
  private contents: T
  constructor(initial: T) { this.contents = initial }
  get(): T          { return this.contents }
  set(val: T): void { this.contents = val }
}

const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())  // → 100
console.log(stringBox.get())  // → 'hello'

interface HasName {
  name: string
}

// T extends HasName: T must have AT LEAST name: string
// T is still the full type — getFirst still returns the full object
function greetFirst<T extends HasName>(items: T[]): string {
  const firstItem = getFirst(items)
  return firstItem ? 'Hello, ' + firstItem.name + '!' : 'empty list'
}

const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))    // → 'Hello, Alice!'
// greetFirst([1, 2, 3])          // ✗ compile error: number has no .name`,
        explanation: [
          '`T extends HasName` establishes the **bounded generic → capability unlock relationship**: without the constraint `T` could be any type, so `firstItem.name` would be a compile error. The bound proves `T` has at least `name: string`, unlocking `.name` access. `T` is still the full element type — `greetFirst(users)` resolves `T = {name, age}`, not just `HasName`.',
          'Critically, T is still the FULL type of the array elements, not just HasName. When greetFirst(users) runs, T = {name: string, age: number} — the complete object type. getFirst returns {name: string, age: number} | undefined, not HasName | undefined. The constraint says "T must include HasName" — it does not reduce T to only HasName.',
          'CS — Bounded polymorphism (T extends Constraint) is parametric polymorphism with a lower bound on what T can be. Haskell calls this typeclass constraints (T where T is Show), Rust calls them trait bounds (T: Display), Java calls them bounded wildcards (<T extends Comparable>). All solve the same problem: allow any type that satisfies the minimum required capability.',
          'SE — Constraints let you write generic functions that need to access specific properties or methods. greetFirst works with Users, Products (if they have name), Documents (if they have name) — any object with at least a name string. The function is reusable across many types while remaining type-safe. This is how utility libraries write generic sort-by-field or group-by-key functions.',
        ],
        active: [
          { startLine: 17, endLine: 19, color: 'indigo', label: 'HasName — the minimum contract for T' },
          { startLine: 22, endLine: 25, color: 'violet', label: 'T extends HasName — .name access is now safe' },
          { startLine: 27, endLine: 29, color: 'emerald', label: 'full object type used — T is {name, age}, not just HasName' },
        ],
        connections: [{ fromLine: 22, toLine: 17, color: 'violet', label: 'T must satisfy', type: 'depends' }],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
class Box {
  constructor(initial) { this.contents = initial }
  get() { return this.contents }
  set(val) { this.contents = val }
}
const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())
function greetFirst(items) {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}
const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))`,
      },
      {
        title: 'keyof — type-safe property access',
        semanticEvent: 'ResolveGeneric',
        code:
`function getFirst<T>(arr: T[]): T | undefined { return arr[0] }
function getLast<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }

class Box<T> {
  private contents: T
  constructor(initial: T) { this.contents = initial }
  get(): T          { return this.contents }
  set(val: T): void { this.contents = val }
}

const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())

interface HasName { name: string }
function greetFirst<T extends HasName>(items: T[]): string {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}

const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))

// K extends keyof T: K must be a key that actually exists on T
// T[K] is the value type for that specific key — different per key
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))    // T[K] = string → 'Alice'
console.log(getProperty(user, 'age'))     // T[K] = number → 25
// getProperty(user, 'email')             // ✗ 'email' is not keyof typeof user`,
        explanation: [
          '`K extends keyof T` establishes the **key-to-value type mapping relationship**: `K` is constrained to be a real key of `T`, and the return type `T[K]` resolves to whatever type that key holds. `getProperty(user, \'name\')` resolves `T[K] = string`; `getProperty(user, \'age\')` resolves `T[K] = number`. Passing `\'email\'` is a compile error — `\'email\'` is not in `keyof typeof user`.',
          'keyof T produces a union of all key names as string literals: for our user object, keyof typeof user = \'name\' | \'age\' | \'active\'. K must be one of those — passing \'email\' is a compile error because \'email\' is not in that union. The runtime simply accesses obj[key], but TypeScript adds compile-time proof that the access is valid and returns the correct type.',
          'CS — T[K] is an indexed access type (also called a lookup type). It is how TypeScript models property access at the type level: if you access an object of type T at key K, the result type is T[K]. This is the type-level equivalent of JavaScript\'s obj[key]. keyof T is the type-level equivalent of Object.keys(obj). Together they enable fully type-safe property access.',
          'SE — getProperty appears in typed object mappers, React\'s useSelector(state => state.propertyName), Redux toolkit\'s createSlice selectors, and form libraries like react-hook-form (where register(\'fieldName\') is typed against your form schema). Everywhere you need to access an object property dynamically but still want type safety, this pattern applies.',
        ],
        active: [
          { startLine: 27, endLine: 30, color: 'violet', label: 'K extends keyof T — K must be a real key of T' },
          { startLine: 32, endLine: 34, color: 'emerald', label: 'return type T[K] differs per key: string vs number' },
          { startLine: 35, endLine: 35, color: 'pink', label: 'compile error — \'email\' not in keyof user' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
class Box {
  constructor(initial) { this.contents = initial }
  get() { return this.contents }
  set(val) { this.contents = val }
}
const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())
function greetFirst(items) {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}
const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))
function getProperty(obj, key) { return obj[key] }
const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))
console.log(getProperty(user, 'age'))`,
      },
      {
        title: 'Utility types — Partial, Readonly, Pick',
        semanticEvent: 'InferType',
        code:
`function getFirst<T>(arr: T[]): T | undefined { return arr[0] }
function getLast<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }

class Box<T> {
  private contents: T
  constructor(initial: T) { this.contents = initial }
  get(): T          { return this.contents }
  set(val: T): void { this.contents = val }
}

const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())

interface HasName { name: string }
function greetFirst<T extends HasName>(items: T[]): string {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}

const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))
console.log(getProperty(user, 'age'))

interface User { name: string; age: number; email: string }

// Utility types — built into TypeScript's standard library as generic mapped types:
type PartialUser  = Partial<User>              // { name?: string; age?: number; email?: string }
type FrozenUser   = Readonly<User>             // { readonly name: string; ... all readonly }
type PublicUser   = Pick<User, 'name' | 'age'> // { name: string; age: number }  — no email`,
        explanation: [
          '`Partial<User>`, `Readonly<User>`, and `Pick<User, K>` establish the **type transformation relationship**: each utility type takes `User` as input and derives a new type by applying a transformation over its keys. `Partial` makes all properties optional (PATCH endpoints), `Readonly` freezes all properties (React props), `Pick` selects a safe subset (public API responses). All zero runtime cost.',
          'These types are implemented entirely in TypeScript\'s type system using mapped types: type Partial<T> = { [K in keyof T]?: T[K] }. You can read it as: "for each key K in T, make it optional and preserve its type T[K]." No runtime code. No library import. One line of type-level code that works for any T.',
          'CS — Mapped types transform one type into another by iterating over its keys. This is type-level programming: computation that happens entirely at compile time, producing types rather than values. TypeScript\'s type system is Turing-complete — you can express complex transformations, conditional types, and recursive types. This power underlies libraries like Zod, tRPC, and Prisma.',
          'SE — Utility types prevent entire categories of bugs. Using Partial<User> for update functions means the compiler catches "you passed a full User where only a partial is needed" and vice versa. Pick prevents accidentally exposing sensitive fields: a function returning Pick<User, \'name\'|\'age\'> structurally cannot return the email field. These guarantees exist at compile time with zero runtime overhead.',
        ],
        active: [
          { startLine: 13, endLine: 13, color: 'indigo', label: 'User — the source type' },
          { startLine: 16, endLine: 18, color: 'violet', label: 'three utility types — derived from User using generics' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
class Box {
  constructor(initial) { this.contents = initial }
  get() { return this.contents }
  set(val) { this.contents = val }
}
const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())
function greetFirst(items) {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}
const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))
function getProperty(obj, key) { return obj[key] }
const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))
console.log(getProperty(user, 'age'))`,
      },
      {
        title: 'Full program — generics compose end to end',
        semanticEvent: 'ResolveGeneric',
        code:
`function getFirst<T>(arr: T[]): T | undefined { return arr[0] }
function getLast<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }

class Box<T> {
  private contents: T
  constructor(initial: T) { this.contents = initial }
  get(): T          { return this.contents }
  set(val: T): void { this.contents = val }
}

const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())

interface HasName { name: string }
function greetFirst<T extends HasName>(items: T[]): string {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}

const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))
console.log(getProperty(user, 'age'))

interface User { name: string; age: number; email: string }

type PartialUser  = Partial<User>
type FrozenUser   = Readonly<User>
type PublicUser   = Pick<User, 'name' | 'age'>

// Everything composed — all generic features in one program:
const strBox = new Box('TypeScript')
console.log(getFirst(users))               // → { name: 'Alice', age: 25 }
console.log(getLast(users))                // → { name: 'Bob', age: 30 }
console.log(strBox.get())                  // → 'TypeScript'
console.log(getProperty(users[0], 'name')) // → 'Alice'
console.log(getProperty(users[1], 'age'))  // → 30`,
        explanation: [
          'The complete program establishes the **compositional generic inference relationship**: every `T` is inferred from arguments with no explicit annotations at call sites. Return types flow from generic functions into variables and into downstream calls — `getFirst(users)?.name` works because TypeScript inferred `T = {name, age}` and knows `.name` is `string`. Zero `any`; zero casts; full type safety throughout.',
          'Trace: greetFirst(users) → T={name:string,age:number}, getFirst returns the first user, first.name is \'Alice\'. getProperty(users[0], \'name\') → T={name,age}, K=\'name\', T[K]=string, returns \'Alice\'. getProperty(users[1], \'age\') → K=\'age\', T[K]=number, returns 30. numBox.get() → T=number, returns 100.',
          'CS — Type inference flows compositionally: the T resolved in getFirst flows into the return type, which flows into the variable that receives it, which flows into the next function call that uses it. TypeScript\'s inference engine traces these flows through the entire program. This is bidirectional type inference — types flow both forward (from arguments to return types) and backward (from context to inferred types).',
          'SE — Everything you built in this lesson exists in production at massive scale. TypeScript\'s standard library Array<T>, Map<K,V>, Promise<T> are generic. React\'s useState<S>, useRef<T>, useContext<T> are generic. Express\'s Request<Params, Body> is generic. GraphQL\'s type system is built on these ideas. You now understand the foundation that underpins modern typed JavaScript.',
        ],
        active: [
          { startLine: 40, endLine: 41, color: 'violet', label: 'Box<string>, getFirst, getLast — T resolved per call' },
          { startLine: 42, endLine: 45, color: 'emerald', label: 'types flow through every call — all precise, all inferred' },
        ],
        connections: [],
        runCode:
`function getFirst(arr) { return arr[0] }
function getLast(arr)  { return arr[arr.length - 1] }
class Box {
  constructor(initial) { this.contents = initial }
  get() { return this.contents }
  set(val) { this.contents = val }
}
const numberBox = new Box(42)
const stringBox = new Box('hello')
numberBox.set(100)
console.log(numberBox.get())
console.log(stringBox.get())
function greetFirst(items) {
  const first = getFirst(items)
  return first ? 'Hello, ' + first.name + '!' : 'empty list'
}
const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
console.log(greetFirst(users))
function getProperty(obj, key) { return obj[key] }
const user = { name: 'Alice', age: 25, active: true }
console.log(getProperty(user, 'name'))
console.log(getProperty(user, 'age'))
const strBox = new Box('TypeScript')
console.log(getFirst(users)?.name)
console.log(getLast(users)?.name)
console.log(strBox.get())
console.log(getProperty(users[0], 'name'))
console.log(getProperty(users[1], 'age'))`,
      },
    ],
  }
