# SE Masterclass — LAB-17 — Modules and Interfaces

**Language: TypeScript (Node.js)** — the language for all of Phase 2.
*Why TypeScript now:* Phase 1 was about how computation WORKS. Phase 2 is about how to STRUCTURE it so it survives growth — and "structure" is exactly what a type system makes checkable instead of just hoped-for. An `interface` in TypeScript is a CONTRACT the compiler enforces; in plain JavaScript it would only be a comment.

**Prerequisites:** All of Phase 1. This lab's `Repository` interface reuses LAB-14's "swap the implementation without touching the caller" idea, made structurally enforceable for the first time.

**What this lab adds:**
- Splitting code into modules (files) and why that boundary matters
- Interfaces as contracts — TypeScript checks that an implementation actually satisfies one
- Information hiding: `private` fields and exporting only what callers need
- Dependency direction: which pieces are allowed to know about which other pieces

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If a `Stack` class exposes its internal array as a public field, what can go wrong that couldn't happen if the array were private?
> 2. Two classes, `InMemoryLog` and `FileLog`, both have a `write(msg: string): void` method. Do they need to share a common PARENT CLASS to be used interchangeably in TypeScript?
> 3. Module A imports from Module B. Module B imports from Module A. What's this called, and why is it a problem?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Encapsulated Stack (information hiding) ===
push 1, 2, 3
peek: 3
pop: 3
size after pop: 2
direct access to internals: blocked at compile time (see comment in source)

=== Interface as a Contract ===
InMemoryRepository satisfies Repository<User>: true
FileRepository satisfies Repository<User>: true
save then findById (in-memory): { id: '1', name: 'Alice' }
save then findById (file-backed): { id: '1', name: 'Alice' }

=== Swapping Implementations Behind One Interface ===
runReport(inMemoryRepo): report generated from 2 users
runReport(fileRepo): report generated from 2 users
  ← runReport() never changed — only the injected repository did

=== Dependency Direction ===
high-level module imports the interface, not the concrete class: confirmed
concrete classes import the interface too: confirmed
  ← both point INWARD at the shared interface — neither concrete class imports the other

=== Circular Import Problem (simulated) ===
orderModule needs userModule.getUser
userModule needs orderModule.getOrder
Error: this shape compiles but breaks at runtime in real bundlers — see explanation below
```

---

### Concept: Modules and Why Splitting Matters

**What it is:** A **module** is a file with its own private scope — variables and functions declared inside it are invisible outside unless explicitly `export`ed. This is the file-level version of LAB-12's environment/scoping idea.

**The problem before:** Without modules, every variable and function in a program shares ONE global namespace — two files both declaring `let count` would silently collide. There's also no way to say "this helper function is an internal detail; nobody outside this file should touch it."

**The solution:** `export` marks what's part of the PUBLIC surface; everything else stays private to the file by default.

```ts
// counter.ts
let count = 0                    // private — invisible outside this file
export function increment() {    // public — the only way outside code can affect 'count'
  count++
  return count
}
```

**Project Application (The "Why" here):** This is LAB-12's `env` object idea, generalized from "one function's local scope" to "one file's scope" — and it's the mechanism behind EVERY `require`/`import` you've written since LAB-09.

**Watch for:** A module with 20 exports and no unexported internals has hidden NOTHING — it's just a flat namespace with extra syntax. The value of a module boundary comes from what it does NOT export.

---

## Step 1 — Encapsulation With a Class

```ts
// stack.ts

export class Stack<T> {
  private items: T[] = []          // ← add: 'private' — TypeScript refuses to compile code outside this class that touches 'items'

  push(value: T): void {
    this.items.push(value)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  get size(): number {
    return this.items.length
  }
}
```

```ts
// main.ts
import { Stack } from './stack'

console.log('=== Encapsulated Stack (information hiding) ===')
const stack = new Stack<number>()
console.log('push 1, 2, 3')
stack.push(1)
stack.push(2)
stack.push(3)
console.log(`peek: ${stack.peek()}`)
console.log(`pop: ${stack.pop()}`)
console.log(`size after pop: ${stack.size}`)

// stack.items.push(999)   // ← uncomment this line: TypeScript refuses to compile —
                            //   "Property 'items' is private and only accessible within class 'Stack<T>'."
console.log('direct access to internals: blocked at compile time (see comment in source)')
```

### SAVE AND TRY

```bash
npx tsc --init --strict true
npx ts-node main.ts
```

**Expected:**
```
=== Encapsulated Stack (information hiding) ===
push 1, 2, 3
peek: 3
pop: 3
size after pop: 2
direct access to internals: blocked at compile time (see comment in source)
```

**Confirm the compile-time guarantee:** Uncomment the `stack.items.push(999)` line and run `npx tsc --noEmit`. Expected error: `Property 'items' is private and only accessible within class 'Stack<T>'.` — this is a guarantee LAB-09's plain JavaScript objects never had; nothing there stopped external code from directly mutating internals.

**Change something:** Add a `clear(): void` method that resets `items` to `[]`. Since it's defined INSIDE the class, it can freely touch `this.items` — only OUTSIDE code is restricted.

---

### Concept: Interfaces as Contracts

**What it is:** A TypeScript `interface` describes a SHAPE — what methods/properties something must have — without saying anything about HOW it's implemented. Any class (or object) with a matching shape satisfies the interface, with no inheritance required (this is structural typing — the same idea any TypeScript work relies on).

**The problem before:** Without an interface, "does this object have a `save` method that takes a `User` and returns nothing?" is something you'd have to verify by reading code, or find out at runtime when it crashes.

**The solution:** Declare the shape once. Let the compiler verify every implementation matches it — and let callers depend on the SHAPE, not any specific implementation.

```ts
interface Repository<T> {
  save(item: T): void
  findById(id: string): T | undefined
}
```

**Canonical example (General Explanation):**

Think of a power outlet's shape (two vertical slots, one round). ANY appliance with a matching plug works, regardless of who manufactured it — the outlet's SHAPE is the contract; it doesn't care about the appliance's brand or internals. An `interface` is that same contract, enforced by the compiler instead of by physical plastic.

**Project Application (The "Why" here):** LAB-14's dependency graph and LAB-15's scheduler both operated on plain `{name: string, needs: string[]}` objects with NO enforced shape — a typo in a property name would silently produce `undefined` instead of an error. An interface makes that typo a COMPILE-TIME error instead.

**Watch for:** Unlike some languages, you never write `class InMemoryRepository implements Repository<User>` for it to COUNT as a `Repository` — TypeScript checks the shape either way (structural typing). Writing `implements` is still worth doing, though: it makes the compiler check IMMEDIATELY when the class is declared, rather than only when it's later used somewhere expecting a `Repository`.

---

## Step 2 — Two Implementations, One Interface

```ts
// repository.ts

export interface Repository<T> {
  save(item: T): void
  findById(id: string): T | undefined
}

export interface User {
  id: string
  name: string
}
```

```ts
// in-memory-repository.ts
import { Repository, User } from './repository'

export class InMemoryRepository implements Repository<User> {
  private items = new Map<string, User>()      // ← add: reused directly from LAB-04's hash map concept

  save(item: User): void {
    this.items.set(item.id, item)
  }

  findById(id: string): User | undefined {
    return this.items.get(id)
  }
}
```

```ts
// file-repository.ts
import * as fs from 'fs'
import { Repository, User } from './repository'

export class FileRepository implements Repository<User> {
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}')   // start with an empty store
  }

  private readAll(): Record<string, User> {
    return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
  }

  save(item: User): void {
    const all = this.readAll()
    all[item.id] = item
    fs.writeFileSync(this.filePath, JSON.stringify(all))    // reused directly from LAB-26's territory, previewed here
  }

  findById(id: string): User | undefined {
    return this.readAll()[id]
  }
}
```

Add to `main.ts`:

```ts
import { Repository, User } from './repository'
import { InMemoryRepository } from './in-memory-repository'
import { FileRepository } from './file-repository'

console.log('\n=== Interface as a Contract ===')

const inMemoryRepo: Repository<User> = new InMemoryRepository()   // ← add: typed as the INTERFACE, not the class
console.log(`InMemoryRepository satisfies Repository<User>: true`)   // if it didn't, the line above wouldn't compile

const fileRepo: Repository<User> = new FileRepository('./users.json')
console.log(`FileRepository satisfies Repository<User>: true`)

inMemoryRepo.save({ id: '1', name: 'Alice' })
console.log(`save then findById (in-memory): ${JSON.stringify(inMemoryRepo.findById('1'))}`)

fileRepo.save({ id: '1', name: 'Alice' })
console.log(`save then findById (file-backed): ${JSON.stringify(fileRepo.findById('1'))}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Interface as a Contract ===
InMemoryRepository satisfies Repository<User> true
FileRepository satisfies Repository<User> true
save then findById (in-memory): {"id":"1","name":"Alice"}
save then findback (file-backed): {"id":"1","name":"Alice"}
```

**Confirm the enforcement is real:** Temporarily rename `FileRepository`'s `findById` to `findByID` (capital `D`). Run `npx tsc --noEmit`. Expected error: `Class 'FileRepository' incorrectly implements interface 'Repository<User>'. Property 'findById' is missing...` — TypeScript caught the typo at COMPILE time, before the code ever ran. Rename it back.

**Change something:** `const inMemoryRepo: InMemoryRepository = new InMemoryRepository()` — typing the variable as the CONCRETE class instead of the interface. This still compiles, but now anything relying on `inMemoryRepo`'s type can see EVERY public member of `InMemoryRepository` specifically, not just what `Repository<User>` promises — a subtle but important difference the next section makes concrete.

---

### Concept: Depend on the Interface, Not the Implementation

**What it is:** Code that needs "something that can save and find users" should declare its dependency as `Repository<User>`, NOT as `InMemoryRepository` or `FileRepository` specifically. This is the practical payoff of Step 2's contract: the CALLER never needs to change when the implementation does.

**The problem before:**

```ts
function runReport(repo: InMemoryRepository) {   // tied to ONE specific implementation
  // ...
}
```

If you later need `runReport` to work with a `FileRepository` too, this signature FORCES a change — even though nothing about the report logic actually cares which storage is used.

**The solution:**

```ts
function runReport(repo: Repository<User>) {     // depends on the SHAPE, not the specific class
  // ...
}
```

Now `runReport` works with `InMemoryRepository`, `FileRepository`, or any FUTURE implementation (a database-backed one, say) — with ZERO changes to `runReport` itself.

**Where you will see this again:** LAB-20 (Dependency Injection) makes this exact pattern the centerpiece of an entire lab — "depend on the interface" IS dependency inversion, just not yet given that name.

---

## Step 3 — One Function, Two Swappable Implementations

```ts
// report.ts
import { Repository, User } from './repository'

export function runReport(repo: Repository<User>, ids: string[]): string {   // ← add: parameter typed as the INTERFACE
  const users = ids.map(id => repo.findById(id)).filter((u): u is User => u !== undefined)
  return `report generated from ${users.length} users`
}
```

Add to `main.ts`:

```ts
import { runReport } from './report'

console.log('\n=== Swapping Implementations Behind One Interface ===')

inMemoryRepo.save({ id: '2', name: 'Bob' })
fileRepo.save({ id: '2', name: 'Bob' })

console.log(`runReport(inMemoryRepo): ${runReport(inMemoryRepo, ['1', '2'])}`)
console.log(`runReport(fileRepo): ${runReport(fileRepo, ['1', '2'])}`)
console.log('  ← runReport() never changed — only the injected repository did')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Swapping Implementations Behind One Interface ===
runReport(inMemoryRepo): report generated from 2 users
runReport(fileRepo): report generated from 2 users
  ← runReport() never changed — only the injected repository did
```

**Confirm `runReport` genuinely doesn't know or care which one it got:** Nothing inside `runReport`'s body mentions `InMemoryRepository` or `FileRepository` — it only calls `repo.findById(id)`, which BOTH classes provide, guaranteed by the shared `Repository<User>` interface.

---

## 🎯 Challenge: Confirm Dependency Direction

**You know:** `runReport` imports `Repository` (the interface) from `report.ts` — it never imports `InMemoryRepository` or `FileRepository` directly.

**Task:** Draw (in a comment, or on paper) the import graph for `stack.ts`, `repository.ts`, `in-memory-repository.ts`, `file-repository.ts`, and `report.ts`. Confirm the two concrete classes both import the INTERFACE, and neither concrete class imports the OTHER concrete class.

<details>
<summary>▶ Show Solution</summary>

```
repository.ts  (defines: Repository interface, User type)
    ▲                  ▲                    ▲
    │                  │                    │
in-memory-repository.ts   file-repository.ts   report.ts
    (implements Repository)  (implements Repository)  (depends on Repository)
```

Every arrow points INTO `repository.ts` — nothing points OUT of it toward a concrete class, and `in-memory-repository.ts` never imports `file-repository.ts` or vice versa. **Key insight:** This shape — everything depending on a shared, stable interface at the "center," with concrete implementations and consumers both pointing INWARD toward it — is what "depend on abstractions, not concretions" (the D in SOLID, arriving properly in LAB-18) looks like as an actual file graph, not just a slogan.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Dependency Direction ===')
console.log('high-level module imports the interface, not the concrete class: confirmed')
console.log('concrete classes import the interface too: confirmed')
console.log('  ← both point INWARD at the shared interface — neither concrete class imports the other')
```

---

### Concept: Circular Imports

**What it is:** A **circular import** happens when Module A imports from Module B, and Module B (directly or through a chain) imports back from Module A. This is EXACTLY LAB-14's graph cycle — `A -> B -> A` — applied to files instead of packages, and it causes the exact problem LAB-14's `detectCycle` was built to catch.

**The problem before:**

```ts
// user-module.ts
import { getOrder } from './order-module'
export function getUser(id: string) { /* ... sometimes calls getOrder ... */ }

// order-module.ts
import { getUser } from './user-module'
export function getOrder(id: string) { /* ... sometimes calls getUser ... */ }
```

At MODULE LOAD time (before any function even runs), each file needs the other to already be fully loaded — but neither can finish loading first, since each is waiting on the other. Depending on the bundler/runtime, this either throws directly, or silently gives you `undefined` for one of the imports (a value that hasn't been assigned yet, because that module's code hasn't finished running) — a bug that only shows up when that specific code path executes.

**The solution:** Same fix as LAB-14 — restructure so both depend on a shared THIRD module instead of on each other directly. If `user-module.ts` and `order-module.ts` both need something from each other, extract that shared piece into its own file that BOTH import from, breaking the cycle — exactly the `repository.ts` pattern from Step 2, generalized.

---

## Step 4 — Recognize the Circular Import Shape

```ts
console.log('\n=== Circular Import Problem (simulated) ===')
console.log('orderModule needs userModule.getUser')
console.log('userModule needs orderModule.getOrder')
console.log('Error: this shape compiles but breaks at runtime in real bundlers — see explanation below')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Circular Import Problem (simulated) ===
orderModule needs userModule.getUser
userModule needs orderModule.getOrder
Error: this shape compiles but breaks at runtime in real bundlers — see explanation below
```

**Why this lab doesn't make you actually TRIGGER the crash:** Circular import behavior is famously inconsistent across tools — CommonJS (Node's default), ES modules, and bundlers like webpack each handle the "partially loaded module" case slightly differently, and reproducing a RELIABLE crash is more about bundler trivia than about the underlying lesson. The lesson that transfers everywhere: if you ever catch yourself writing `import` statements that form a cycle, stop and ask whether a shared, lower-level module (like `repository.ts` in this lab) should be extracted — the exact same "add a shared node instead of a direct edge" fix as LAB-14.

---

## Mental Model: Where This Shows Up

| Lab | The interface | The swappable implementations |
|---|---|---|
| This lab | `Repository<T>` | In-memory, file-backed |
| LAB-21 (Plugin System) | A `Plugin` interface | Any third-party plugin implementing it |
| LAB-25 (Configuration System) | A `ConfigSource` interface | Environment variables, a JSON file, defaults |
| LAB-46/50 (Auth) | A `UserStore` interface | In-memory (tests), a real database (production) |
| LAB-62 (ORM) | A `QueryExecutor` interface | SQLite, PostgreSQL |

**Where you will see this again:** LAB-18 (SOLID Principles) names this pattern formally (Dependency Inversion). LAB-20 (Dependency Injection) builds the mechanism for HANDING implementations to code that depends only on the interface, instead of that code constructing its own dependency directly.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Stack`'s `items` field cannot be accessed from outside the class | `npx tsc --noEmit` errors on the uncommented line |
| Both `InMemoryRepository` and `FileRepository` compile as valid `Repository<User>` implementations | Step 2 |
| A typo'd method name in one implementation is caught at compile time | Step 2's "change something" |
| `runReport` accepts either implementation with zero changes to its own code | Step 3 |
| You can draw the import graph and confirm no concrete class imports another | Challenge |
| You can explain why a circular import is the same problem as LAB-14's dependency cycle | Concept box |

---

## Quick Check Answers

**1. Public array field on `Stack` — what can go wrong?**

Outside code could bypass `push`/`pop` entirely — directly setting `stack.items = []`, inserting at arbitrary positions, or removing from the middle — none of which respects LIFO ordering (LAB-05). Any INVARIANT the class is supposed to guarantee (like "the only way in or out is through `push`/`pop`") becomes unenforceable the moment the underlying storage is public. `private` (Step 1) makes violating that invariant a COMPILE error, not just a documented rule someone has to remember to follow.

**2. Do `InMemoryLog` and `FileLog` need a shared parent class?**

No — TypeScript uses structural typing (this lab's Concept box, and the pattern echoed from the engineering-drills TypeScript drill): any object with a matching `write(msg: string): void` shape satisfies an interface requiring that shape, regardless of inheritance. This is exactly why `InMemoryRepository` and `FileRepository` in this lab work interchangeably as `Repository<User>` without extending any common base class — only their PUBLIC SHAPE needs to match.

**3. Module A imports B, B imports A — what's this called, and why is it a problem?**

A circular import (or circular dependency) — the same cycle LAB-14's `detectCycle` was built to catch, just at the file/module level instead of the package level. It's a problem because neither module can be FULLY loaded before the other needs it, leading to inconsistent behavior across different bundlers/runtimes (sometimes a crash, sometimes a silently `undefined` value) — the fix, demonstrated in this lab's Repository example, is extracting the shared piece both sides actually need into its own module that both import from, breaking the direct A↔B edge.

---

*Next: [LAB-18 — SOLID Principles](LAB-18-solid-principles.md) — TypeScript, same phase*
