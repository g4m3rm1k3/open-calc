# FOUNDATIONS — LAB-051 — SOLID: Interface Segregation Principle

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 40–55 minutes.

---

## What You Will Build

A fat `Worker` interface that forces implementing classes to provide no-op stubs, a split into focused role interfaces, and a demonstration that each implementing class only implements what it needs. After this lab you will understand why "fat interfaces" create coupling, and how role interfaces reduce that coupling.

---

## What You Need to Know First

**From LAB-017 (Interfaces as a Contract):** An interface defines what a client expects. ISP says each client should expect only what it actually uses.

**From LAB-049 (OCP):** Adding a new implementation of a fat interface requires implementing stubs for methods the class does not need — a sign the interface is too broad.

---

> **Quick Check — try to answer before reading:**
>
> 1. A class implements an interface but one method always throws `NotImplementedException`. What principle is violated?
> 2. What is a "role interface"?
> 3. Can a class implement multiple role interfaces?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Violation: A Fat Interface

```typescript
// A fat interface that tries to describe every possible worker:
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeCode(): void;
  testCode(): void;
}

// HumanWorker is fine — humans do all of these:
class HumanWorker implements Worker {
  work():           void { console.log('Human working'); }
  eat():            void { console.log('Human eating'); }
  sleep():          void { console.log('Human sleeping'); }
  attendMeeting():  void { console.log('Human attending meeting'); }
  writeCode():      void { console.log('Human writing code'); }
  testCode():       void { console.log('Human testing code'); }
}

// RobotWorker does not eat or sleep — but the interface forces it to implement them:
class RobotWorker implements Worker {
  work():           void { console.log('Robot working'); }
  eat():            void { throw new Error('Robots do not eat'); }  // stub!
  sleep():          void { throw new Error('Robots do not sleep'); }  // stub!
  attendMeeting():  void { console.log('Robot attending meeting'); }
  writeCode():      void { console.log('Robot writing code'); }
  testCode():       void { console.log('Robot testing code'); }
}
```

**The walkthrough — the problems:**

1. **Stub methods:** `RobotWorker.eat()` throws. Any code that calls `eat()` on a `Worker` that happens to be a `RobotWorker` will crash at runtime. The fat interface made the compiler think `eat()` is safe to call on any `Worker`.

2. **Coupling to irrelevant methods:** `RobotWorker` is coupled to `eat()` and `sleep()` even though it does not use them. If the signature of `eat()` changes, `RobotWorker` must be updated even though it was only providing a stub.

3. **LSP violation:** As shown in LAB-050, a throwing stub violates the contract. The fat interface creates LSP violations by forcing implementations that cannot fulfill the contract.

---

### Step 2 — Split into Role Interfaces

```typescript
// Each interface describes exactly one role:
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Restable {
  sleep(): void;
}

interface Meetable {
  attendMeeting(): void;
}

interface Codeable {
  writeCode(): void;
  testCode(): void;
}

// HumanWorker implements all relevant roles:
class HumanWorker implements Workable, Feedable, Restable, Meetable, Codeable {
  work():           void { console.log('Human working'); }
  eat():            void { console.log('Human eating'); }
  sleep():          void { console.log('Human sleeping'); }
  attendMeeting():  void { console.log('Human attending meeting'); }
  writeCode():      void { console.log('Human writing code'); }
  testCode():       void { console.log('Human testing code'); }
}

// RobotWorker implements only what it can do — no stubs:
class RobotWorker implements Workable, Meetable, Codeable {
  work():           void { console.log('Robot working'); }
  attendMeeting():  void { console.log('Robot attending meeting'); }
  writeCode():      void { console.log('Robot writing code'); }
  testCode():       void { console.log('Robot testing code'); }
}
```

**The walkthrough — correct usage:**

```typescript
// Functions depend only on the role they use:
function assignWork(worker: Workable): void {
  worker.work();  // any worker — human or robot
}

function scheduleLunch(worker: Feedable): void {
  worker.eat();   // only feedable workers — compiler prevents calling this on RobotWorker
}

function scheduleCodeReview(worker: Codeable): void {
  worker.writeCode();
  worker.testCode();
}

const human = new HumanWorker();
const robot = new RobotWorker();

assignWork(human);         // OK
assignWork(robot);         // OK
scheduleLunch(human);      // OK
scheduleLunch(robot);      // TypeScript error: RobotWorker is not assignable to Feedable ✓
scheduleCodeReview(human); // OK
scheduleCodeReview(robot); // OK
```

**The CS lens — interface as a dependency contract:** Each function declares its dependency precisely — only the methods it actually uses. A function that only needs `work()` depends on `Workable`, not on the entire `Worker` fat interface. This is the principle of least privilege applied to type dependencies: declare exactly what you need.

**The SE lens — role interfaces:** A role interface describes a capability that a client requires — not the full set of capabilities a class provides. A class can implement many role interfaces. Each caller depends on the role it needs. When a new role is needed, it can be added to the set of interfaces without changing existing interfaces or implementations.

---

### Step 3 — A Real-World Example: Data Access

```typescript
// Fat interface:
interface DataStore {
  findById(id: string): unknown;
  findAll(): unknown[];
  save(entity: unknown): void;
  delete(id: string): void;
  search(query: string): unknown[];   // not all stores support search
  backup(): void;                      // not all stores support backup
}

// After splitting:
interface Readable {
  findById(id: string): unknown;
  findAll(): unknown[];
}

interface Writable {
  save(entity: unknown): void;
  delete(id: string): void;
}

interface Searchable {
  search(query: string): unknown[];
}

interface Backupable {
  backup(): void;
}

// InMemoryStore only reads and writes — no search, no backup:
class InMemoryStore implements Readable, Writable {
  private data = new Map<string, unknown>();
  findById(id: string) { return this.data.get(id); }
  findAll() { return [...this.data.values()]; }
  save(entity: any) { this.data.set(entity.id, entity); }
  delete(id: string) { this.data.delete(id); }
}

// PostgresStore implements everything:
class PostgresStore implements Readable, Writable, Searchable, Backupable {
  findById(id: string) { return { id }; /* DB query */ }
  findAll() { return []; /* DB query */ }
  save(entity: unknown) { /* DB insert/update */ }
  delete(id: string) { /* DB delete */ }
  search(query: string) { return []; /* full-text search */ }
  backup() { /* pg_dump */ }
}

// Each consumer depends on only what it uses:
function readReport(store: Readable): void {
  const all = store.findAll();
  console.log(`Found ${all.length} records`);
}
```

---

## Connect the Pieces

- **React's hook interfaces** follow ISP: `useEffect` for effects, `useState` for state, `useRef` for refs. You only import the hooks you need — not a single fat `useEverything` hook.
- **TypeScript's `lib.dom.d.ts`** splits DOM interfaces into narrow roles: `EventTarget`, `Node`, `Element`, `HTMLElement` — each interface adds capabilities incrementally.
- **REST API design** follows ISP: each endpoint handles one operation (read, create, update, delete) rather than a fat endpoint that handles all of them via a type parameter.

---

## What Breaks Without This

**A change to `eat()` requires updating `RobotWorker`:**

If the signature of `Feedable.eat()` changes to `eat(food: string): void`, `RobotWorker` must be updated — despite `RobotWorker` never eating. This is shotgun surgery (LAB-058 preview): one change requires touching many files. ISP prevents this by never coupling `RobotWorker` to `Feedable`.

---

## Definition of Done

- [ ] `scheduleLunch(robot)` produces a TypeScript error — not an `instanceof` check at runtime
- [ ] `RobotWorker` has no stub methods
- [ ] `InMemoryStore` does not implement `search()` or `backup()` — no stubs
- [ ] `readReport(new InMemoryStore())` compiles; `readReport(robot)` fails (robot is not Readable)
- [ ] You can state ISP in one sentence and identify the two symptoms of a fat interface (stubs and forced coupling)

**Git commit:**

```
git add src/
git commit -m "LAB-051: ISP — fat Worker interface split into role interfaces; RobotWorker implements only what it can do; callers depend on only what they use"
```

---

## Quick Check Answers

1. **LSP (Liskov Substitution Principle) and ISP (Interface Segregation Principle) are both violated.** The throwing stub violates LSP (the method is not actually implemented as the interface promises). The need for the stub signals ISP violation — the class was forced to implement a method it does not support.
2. **A role interface is an interface that describes exactly one capability that a client needs.** It is named after the role the implementing class plays for that specific client — `Feedable`, `Readable`, `Codeable`. Role interfaces are narrow; fat interfaces are wide.
3. **Yes.** A class can implement as many role interfaces as its capabilities require. `HumanWorker implements Workable, Feedable, Restable, Meetable, Codeable`. Each client depends on the specific role interface it needs. The class provides all capabilities; each caller sees only its slice.
