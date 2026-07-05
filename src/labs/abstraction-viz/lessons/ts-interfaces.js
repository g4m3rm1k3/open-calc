export default   {
    id: 'ts-interfaces',
    title: 'Interfaces',
    tag: 'TypeScript',
    lang: 'ts',
    steps: [
      {
        title: 'The problem — no contract on object shape',
        semanticEvent: 'DefineFunction',
        code:
`// Without a type contract, any object is accepted — correct or not
function describeUser(user) {
  return user.name + ' is ' + user.age + ' years old'
}

console.log(describeUser({ name: 'Alice', age: 25 }))  // → 'Alice is 25 years old'
// describeUser({ firstName: 'Bob' })   // → 'undefined is undefined years old'
// describeUser(42)                     // → 'undefined is undefined years old'`,
        explanation: [
          '`describeUser` establishes the **missing contract problem**: without a type annotation, the function accepts any shape — correct or wrong — and silently produces garbage output instead of signalling the mistake. Passing `{ firstName: \'Bob\' }` gives `\'undefined is undefined years old\'` with no error. The contract gap between caller intent and function expectation is invisible until production.',
          'This is the runtime type safety problem: JavaScript checks nothing about the shape of values you pass to functions. You discover mistakes only when the wrong output appears (best case) or when the application crashes in production with a user watching (worst case).',
          'CS — TypeScript solves this with static type analysis: before the code runs, the TypeScript compiler analyses every function call and verifies that the argument matches the expected shape. Type violations become compile errors — caught in your editor, in CI, before any user sees the result. The types are erased in the compiled JavaScript; there is zero runtime overhead.',
          'SE — The cost of a runtime bug found in production is orders of magnitude higher than a compile-time error caught in the editor: investigation time, incident response, user impact, deployment. TypeScript interfaces shift the detection point from runtime to edit time. This is why virtually every large JavaScript project (Angular, VS Code, Slack) is written in TypeScript.',
        ],
        active: [
          { startLine: 2, endLine: 4, color: 'indigo', label: 'no type info — any value accepted silently' },
          { startLine: 7, endLine: 8, color: 'pink', label: 'wrong shapes → silent garbage output, no error' },
        ],
        connections: [],
      },
      {
        title: 'interface — a named type contract',
        semanticEvent: 'InferType',
        code:
`interface User {
  name: string   // required: must be a string
  age:  number   // required: must be a number
}

function describeUser(user: User): string {
  return user.name + ' is ' + user.age + ' years old'
}

console.log(describeUser({ name: 'Alice', age: 25 }))  // ✓ matches contract
// describeUser({ firstName: 'Bob' })      // ✗ compile error: 'name' is missing
// describeUser({ name: 'Carol', age: '30' }) // ✗ compile error: age must be number`,
        runCode:
`function describeUser(user) {
  return user.name + ' is ' + user.age + ' years old'
}
console.log(describeUser({ name: 'Alice', age: 25 }))`,
        explanation: [
          '`interface User` establishes the **named shape → caller contract relationship**: every argument typed `User` must have exactly `name: string` and `age: number` — the compiler verifies this at every call site before the code runs. Passing `{ firstName: \'Bob\' }` is a compile error, not a silent runtime bug. Types are erased in the compiled output; the contract is purely compile-time.',
          'TypeScript checks the call site at compile time. It reads the argument\'s structure, compares it to User, finds that name is missing, and reports a clear error with the file name and line number. The compiled JavaScript has no User interface — types are completely erased. String output and runtime behaviour are identical to plain JavaScript.',
          'CS — An interface is a type expression, not a value. It exists only at compile time. In TypeScript\'s type system, interface User creates a named structural type: any object with at least name: string and age: number satisfies it, regardless of how it was created. This structural typing is different from Java/C# where you must explicitly implement an interface.',
          'SE — Interfaces are self-documenting contracts. Reading interface User tells you exactly what the function expects without reading the function body. IDEs use interfaces to provide autocomplete, hover documentation, and error highlighting as you type. Interface changes propagate as type errors through the entire codebase — refactoring becomes safe because the compiler finds every call site that breaks.',
        ],
        active: [
          { startLine: 1, endLine: 4, color: 'indigo', label: 'interface User — type contract, compiled away to nothing' },
          { startLine: 6, endLine: 8, color: 'violet', label: 'user: User — compiler verifies every call matches this shape' },
          { startLine: 11, endLine: 12, color: 'pink', label: 'compile errors — caught before the program ever runs' },
        ],
        connections: [],
      },
      {
        title: 'Optional property — ? marks what may be absent',
        semanticEvent: 'NarrowType',
        code:
`interface User {
  name:   string
  age:    number
  email?: string   // ? means optional — callers may omit this, value is string | undefined
}

function describeUser(user: User): string {
  // TypeScript knows email is string | undefined — forces you to handle both cases
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const alice: User = { name: 'Alice', age: 25 }                          // ✓ email omitted
const bob:   User = { name: 'Bob', age: 30, email: 'bob@example.com' }  // ✓ email present
console.log(describeUser(alice))  // → 'Alice is 25 years old'
console.log(describeUser(bob))    // → 'Bob is 30 years old <bob@example.com>'`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
const alice = { name: 'Alice', age: 25 }
const bob   = { name: 'Bob', age: 30, email: 'bob@example.com' }
console.log(describeUser(alice))
console.log(describeUser(bob))`,
        explanation: [
          '`email?` establishes the **optional → union type narrowing relationship**: the `?` widens the property type to `string | undefined`, and the compiler forces every usage to handle both cases. The truthy check on `user.email` narrows the type to `string` inside the true branch — before that check, accessing `.length` would be a compile error, protecting against a runtime crash.',
          'Line 9 checks user.email with a ternary: if truthy (a non-empty string), append it. If falsy (undefined or empty string), append nothing. TypeScript will give an error if you write user.email.length without first checking — it knows email might be undefined and you would be calling .length on undefined, which is a runtime crash.',
          'CS — Union types (string | undefined) are TypeScript\'s way of modelling values that can be one of several types. The ? shorthand is syntactic sugar: email?: string is equivalent to email?: string | undefined. The compiler tracks the union through the code and narrows it at each conditional check — after the if(user.email) check, TypeScript knows email is string inside the true branch.',
          'SE — Optional properties model the real world accurately: a user account might or might not have an email address on file. Making it required would break registration flows; making it untyped would hide access bugs. Optional with forced handling is the correct middle ground. This pattern appears in virtually every API response type in TypeScript codebases.',
        ],
        active: [
          { startLine: 4, endLine: 4, color: 'violet', label: '? — optional property, type becomes string | undefined' },
          { startLine: 9, endLine: 9, color: 'emerald', label: 'forced to check — TypeScript prevents undefined.length crash' },
          { startLine: 13, endLine: 14, color: 'indigo', label: 'both valid — alice without email, bob with email' },
        ],
        connections: [],
      },
      {
        title: 'Interface extends interface — building type hierarchies',
        semanticEvent: 'InferType',
        code:
`interface User {
  name:   string
  age:    number
  email?: string
}

interface AdminUser extends User {  // inherits name, age, email? and adds more
  role:        string
  permissions: string[]
}

function describeUser(user: User): string {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const alice: User      = { name: 'Alice', age: 25 }
const admin: AdminUser = { name: 'Bob', age: 30, role: 'admin', permissions: ['read', 'write'] }
console.log(describeUser(alice))   // ✓ alice satisfies User
console.log(describeUser(admin))   // ✓ admin satisfies User — structural typing`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
const alice = { name: 'Alice', age: 25 }
const admin = { name: 'Bob', age: 30, role: 'admin', permissions: ['read', 'write'] }
console.log(describeUser(alice))
console.log(describeUser(admin))`,
        explanation: [
          '`AdminUser extends User` establishes the **type hierarchy → structural superset relationship**: `AdminUser` inherits all of `User`\'s fields and adds more — making every `AdminUser` automatically a valid `User`. `describeUser(admin)` compiles because structural typing checks shape, not declaration: `admin` has everything `User` requires, and extra fields are allowed.',
          'This is structural typing: TypeScript checks the SHAPE, not the type name. admin was declared as AdminUser, not User — but it satisfies User because it has all of User\'s required fields. Extra fields (role, permissions) are allowed. This mirrors JavaScript\'s duck typing: "if it has the right properties, it works."',
          'CS — Structural typing is fundamentally different from nominal typing (Java, C#, Rust): in those languages, a type satisfies an interface only if it explicitly declares that it implements it. TypeScript\'s structural typing means any object with the right shape works — which is natural for JavaScript where object literals are ubiquitous.',
          'SE — Interface extension enables taxonomies: BaseUser → User → AdminUser → SuperAdminUser. Functions accepting User work with all subtypes. Functions accepting AdminUser require the extra fields. This hierarchy matches real-world access control models. Adding a new AdminUser field is caught everywhere the compiler can see — no hunting for usages.',
        ],
        active: [
          { startLine: 7, endLine: 10, color: 'violet', label: 'AdminUser extends User — inherits all fields, adds two more' },
          { startLine: 18, endLine: 18, color: 'pink', label: 'admin: AdminUser has all of User\'s required fields' },
          { startLine: 20, endLine: 20, color: 'emerald', label: 'structural match — AdminUser satisfies User, works as argument' },
        ],
        connections: [{ fromLine: 7, toLine: 1, color: 'violet', label: 'extends — inherits contract', type: 'inherits' }],
      },
      {
        title: 'class implements interface — compiler verifies the promise',
        semanticEvent: 'DefineClass',
        code:
`interface User {
  name:   string
  age:    number
  email?: string
}

interface AdminUser extends User {
  role:        string
  permissions: string[]
}

class UserRecord implements User {
  name:   string    // TypeScript property declaration — erased at runtime
  age:    number
  email?: string

  constructor(name: string, age: number, email?: string) {
    this.name  = name
    this.age   = age
    this.email = email
  }

  greet(): string { return 'Hello from ' + this.name }
}

function describeUser(user: User): string {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))   // ✓ UserRecord satisfies User
console.log(record.greet())         // → 'Hello from Carol'`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
class UserRecord {
  constructor(name, age, email) {
    this.name  = name
    this.age   = age
    this.email = email
  }
  greet() { return 'Hello from ' + this.name }
}
const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))
console.log(record.greet())`,
        explanation: [
          '`implements User` establishes the **class → interface obligation relationship**: the compiler verifies at the class definition that every required member is present. If `name` were missing, the error appears at the class, not scattered across call sites. The obligation is declared once and enforced centrally — adding a new required field to `User` immediately surfaces as a compile error on `UserRecord`.',
          'Class property declarations (name: string, age: number) tell TypeScript what fields the class will have. They are type-level only — erased in compiled JavaScript. The constructor then assigns values to these fields. describeUser(record) compiles because UserRecord implements User and therefore satisfies the shape.',
          'CS — implements is a compile-time assertion. At runtime, there is no User interface — the JavaScript class has no knowledge of it. implements differs from extends: extends sets up a prototype chain (runtime mechanism); implements only checks types at compile time. A class can implements multiple interfaces but can only extends one class.',
          'SE — implements makes the relationship explicit and compiler-verified. If User gains a new required field (say, region: string), the class immediately gets a compile error at its declaration — not hidden somewhere at a call site. This is the value of being explicit: the mistake is found at the definition, not in a runtime exception reported by a user.',
        ],
        active: [
          { startLine: 12, endLine: 12, color: 'violet', label: 'implements User — compiler verifies at the class definition' },
          { startLine: 13, endLine: 15, color: 'indigo', label: 'must have all User\'s required fields — promise kept here' },
          { startLine: 30, endLine: 30, color: 'emerald', label: 'record satisfies User — compiler approved this call' },
        ],
        connections: [{ fromLine: 12, toLine: 1, color: 'violet', label: 'must satisfy', type: 'depends' }],
      },
      {
        title: 'Implementing multiple interfaces',
        semanticEvent: 'DefineClass',
        code:
`interface User {
  name:   string
  age:    number
  email?: string
}

interface AdminUser extends User {
  role:        string
  permissions: string[]
}

interface Printable {
  print(): void   // any class implementing Printable must provide this method
}

class UserRecord implements User, Printable {
  name:   string
  age:    number
  email?: string

  constructor(name: string, age: number, email?: string) {
    this.name  = name
    this.age   = age
    this.email = email
  }

  greet(): string { return 'Hello from ' + this.name }
  print(): void   { console.log(this.name + ' | age=' + this.age) }
}

function describeUser(user: User): string {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))   // ✓ satisfies User
console.log(record.greet())         // → 'Hello from Carol'
record.print()                      // ✓ satisfies Printable`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
class UserRecord {
  constructor(name, age, email) {
    this.name  = name
    this.age   = age
    this.email = email
  }
  greet() { return 'Hello from ' + this.name }
  print() { console.log(this.name + ' | age=' + this.age) }
}
const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))
console.log(record.greet())
record.print()`,
        explanation: [
          '`implements User, Printable` establishes the **multi-role obligation relationship**: one class simultaneously satisfies two independent contracts. The compiler verifies both at the definition. A function expecting `User` and a function expecting `Printable` can each accept a `UserRecord` — the same object plays different structural roles depending on the caller\'s required shape.',
          'The Printable interface defines a method signature: any class implementing Printable must provide print(): void. void means the method returns nothing (or undefined). The print() implementation on UserRecord logs to the console. A different class implementing Printable might print to a file, a PDF, or a network stream.',
          'CS — Multiple interface implementation models role composition without inheritance. UserRecord is both a User and Printable without inheriting from any class. This is the key advantage of interfaces over abstract classes: a class can only extend one parent, but it can implement any number of interfaces. Java, Go (implicitly), and TypeScript all support this.',
          'SE — Role-based design: UserRecord plays the User role in data functions and the Printable role in output functions. Callers depend only on the role they need. A function that serialises objects to CSV only needs Printable — it does not care about name or age. This decoupling is the Interface Segregation Principle (the I in SOLID).',
        ],
        active: [
          { startLine: 12, endLine: 14, color: 'pink', label: 'Printable — a second contract' },
          { startLine: 16, endLine: 16, color: 'violet', label: 'implements two — compiler verifies both promises' },
          { startLine: 38, endLine: 40, color: 'emerald', label: 'one object, two roles, two verified contracts' },
        ],
        connections: [],
      },
      {
        title: 'Structural typing — shape over name',
        semanticEvent: 'InferType',
        code:
`interface User {
  name:   string
  age:    number
  email?: string
}

interface AdminUser extends User {
  role:        string
  permissions: string[]
}

interface Printable {
  print(): void
}

class UserRecord implements User, Printable {
  name:   string
  age:    number
  email?: string

  constructor(name: string, age: number, email?: string) {
    this.name  = name
    this.age   = age
    this.email = email
  }

  greet(): string { return 'Hello from ' + this.name }
  print(): void   { console.log(this.name + ' | age=' + this.age) }
}

function describeUser(user: User): string {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))   // ✓ UserRecord implements User
console.log(record.greet())
record.print()

// A plain object literal — no class, no 'implements':
const guest = { name: 'Guest', age: 16, joinedAt: '2024-01-01' }
console.log(describeUser(guest))    // ✓ plain object also satisfies User — structural match`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
class UserRecord {
  constructor(name, age, email) {
    this.name  = name
    this.age   = age
    this.email = email
  }
  greet() { return 'Hello from ' + this.name }
  print() { console.log(this.name + ' | age=' + this.age) }
}
const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))
console.log(record.greet())
record.print()
const guest = { name: 'Guest', age: 16, joinedAt: '2024-01-01' }
console.log(describeUser(guest))`,
        explanation: [
          '`guest` establishes the **structural match → implicit satisfaction relationship**: a plain object literal with no class and no `implements` keyword satisfies `User` because TypeScript checks shape, not declaration. `name: string` ✓, `age: number` ✓, `email?` absent (allowed), `joinedAt` extra (allowed). No wrapping, no retrofitting — if the shape fits, the type fits.',
          'Structural typing mirrors JavaScript\'s duck typing: if an object has the required properties, it works. TypeScript preserves this flexibility while adding compile-time checking. You do not need to retrofit implements onto every object in your codebase — any object with the right shape works.',
          'CS — Structural typing (also called duck typing at the type level) contrasts with nominal typing. In Go, an interface is satisfied implicitly by any type that has the required method set — this is structural. In Java, you must explicitly write implements Serializable — this is nominal. TypeScript chose structural because JavaScript object literals would otherwise be unusable as typed values.',
          'SE — This makes TypeScript integrate seamlessly with existing JavaScript. API responses (JSON parsed to plain objects), third-party library return values, and data from localStorage all work as typed values if they match the interface shape. You can write interfaces for external data shapes without wrapping everything in classes.',
        ],
        active: [
          { startLine: 40, endLine: 40, color: 'violet', label: 'plain object — no class, no implements keyword' },
          { startLine: 37, endLine: 41, color: 'emerald', label: 'both work — structural match is sufficient' },
          { startLine: 16, endLine: 16, color: 'indigo', label: 'explicit implements — one way to satisfy User' },
        ],
        connections: [],
      },
      {
        title: 'readonly — immutable after construction',
        semanticEvent: 'WriteProperty',
        code:
`interface User {
  readonly name: string    // readonly in the interface — cannot be reassigned after creation
  age:           number
  email?:        string
}

interface AdminUser extends User {
  role:        string
  permissions: string[]
}

interface Printable {
  print(): void
}

class UserRecord implements User, Printable {
  readonly name: string    // readonly on the class matches the interface
  age:           number
  email?:        string

  constructor(name: string, age: number, email?: string) {
    this.name  = name   // ✓ assignment in constructor is allowed
    this.age   = age
    this.email = email
  }

  greet(): string { return 'Hello from ' + this.name }
  print(): void   { console.log(this.name + ' | age=' + this.age) }
}

function describeUser(user: User): string {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}

const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))    // → 'Carol is 22 years old'
console.log(record.greet())
record.print()

const guest = { name: 'Guest', age: 16, joinedAt: '2024-01-01' }
console.log(describeUser(guest))
// record.name = 'Eve'               // ✗ compile error: cannot assign to 'name' (readonly)
record.age = 23                      // ✓ age is not readonly — can be updated`,
        runCode:
`function describeUser(user) {
  const contactPart = user.email ? ' <' + user.email + '>' : ''
  return user.name + ' is ' + user.age + ' years old' + contactPart
}
class UserRecord {
  constructor(name, age, email) {
    this.name  = name
    this.age   = age
    this.email = email
  }
  greet() { return 'Hello from ' + this.name }
  print() { console.log(this.name + ' | age=' + this.age) }
}
const record = new UserRecord('Carol', 22, 'carol@example.com')
console.log(describeUser(record))
console.log(record.greet())
record.print()
const guest = { name: 'Guest', age: 16, joinedAt: '2024-01-01' }
console.log(describeUser(guest))
record.age = 23`,
        explanation: [
          '`readonly name` establishes the **construction-only write contract**: the property can be assigned once in the constructor and is permanently frozen after that. `record.name = \'Eve\'` is a compile error — the bad assignment is caught before the code runs and never reaches the user. `age` remains mutable because identity fields (name) are different from state fields (age).',
          'readonly differs from const: const is for variable bindings (the variable cannot be rebound to a new value). readonly is for object properties (the property cannot be reassigned on an existing object). A readonly property can still hold a mutable object — record.name cannot be replaced, but if name were an array, its contents could still be pushed to.',
          'CS — Immutability is a correctness tool. A name that cannot change after construction is a contract: every consumer of this record can cache record.name knowing it will never become stale. This is the basis of many optimisations: React\'s PureComponent compares props by reference because props are immutable; if the reference is unchanged, no re-render is needed.',
          'SE — readonly at the interface level communicates intent to all consumers: this property is part of the identity, not a setting to be changed. Name changes are handled by creating a new UserRecord, not by mutating an existing one. This functional immutability pattern (create new, don\'t mutate) is central to Redux, immutable.js, and Elm\'s architecture.',
        ],
        active: [
          { startLine: 2, endLine: 2, color: 'violet', label: 'readonly in interface — contract for all implementors' },
          { startLine: 16, endLine: 16, color: 'indigo', label: 'readonly on class — matches interface, enforced here' },
          { startLine: 21, endLine: 21, color: 'emerald', label: 'constructor assignment allowed — only place it can be set' },
          { startLine: 42, endLine: 42, color: 'pink', label: 'compile error — readonly after construction' },
        ],
        connections: [],
      },
    ],
  }
