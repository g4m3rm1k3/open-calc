# FOUNDATIONS — LAB-016 — Abstraction

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

An abstract `DataStore` class that defines the operations a storage system must support (save, find, delete, list), with two concrete implementations: `InMemoryStore` (for tests) and `LocalStorageStore` (for the browser). A function that performs business logic operates through the abstract type — it cannot tell which implementation it is using, and does not need to. After this lab, you will understand what abstraction means in OOP, why it differs from inheritance, and why coding to an abstraction is the key to testable, changeable systems.

---

## What You Need to Know First

**From LAB-015 (Polymorphism):** Multiple concrete types can satisfy the same interface. A function that works through an interface works with any concrete type automatically.

**From LAB-014 (Inheritance):** A subclass is-a superclass. An abstract class is a superclass that cannot be instantiated directly — it exists only to define the interface for its subclasses.

---

> **Quick Check — try to answer before reading:**
>
> 1. You are building a system that saves items to a database. You write the business logic to call `database.save(item)`. Later, you need to swap the database for a different one. What needs to change if the business logic calls a concrete `PostgresDatabase` class directly? What if it calls through an abstract `DataStore` interface?
> 2. What is the difference between "what it does" and "how it does it"? Which one should the caller know?
> 3. Can you create an instance of an abstract class? Why or why not?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Abstract Classes: Defining What, Not How

**The problem this step solves:** Establish the concept of an abstract class — one that defines a contract but provides no implementation.

**The code:**

```js
class DataStore {
  // Abstract method: subclasses MUST implement this
  save(key, value) {
    throw new Error(`${this.constructor.name} must implement save(key, value)`);
  }

  find(key) {
    throw new Error(`${this.constructor.name} must implement find(key)`);
  }

  delete(key) {
    throw new Error(`${this.constructor.name} must implement delete(key)`);
  }

  listKeys() {
    throw new Error(`${this.constructor.name} must implement listKeys()`);
  }

  // Concrete method: implemented here, uses the abstract methods
  exists(key) {
    return this.find(key) !== undefined;
  }

  count() {
    return this.listKeys().length;
  }
}

// Attempting to instantiate DataStore and call an abstract method:
const store = new DataStore();
try {
  store.save("key", "value");
} catch (error) {
  console.log(error.message);   // → "DataStore must implement save(key, value)"
}
```

**The walkthrough:**

`DataStore` defines four abstract methods that throw errors, and two concrete methods (`exists`, `count`) that delegate to the abstract methods. The concrete methods work correctly for any subclass that implements the abstract ones — they do not care whether data is stored in memory, localStorage, a database, or a file. The abstract class defines the **what** (what operations exist); the subclass provides the **how** (how they are implemented).

**`this.constructor.name`** — used to name the specific subclass in the error message. If `InMemoryStore extends DataStore` and `InMemoryStore` forgets to implement `save`, the error says "InMemoryStore must implement save" — not "DataStore must implement save." This is more useful for debugging.

**CS lens — abstract classes define contracts:**

An **abstract class** is a class that is intended to be subclassed, not instantiated. In JavaScript, abstract classes are simulated by throwing in methods that must be overridden (since JavaScript has no `abstract` keyword). TypeScript and Java/C# have native `abstract` keywords that prevent instantiation at the language level. The JavaScript pattern is equivalent in behavior: calling an unimplemented method throws immediately.

The contract the abstract class defines: "any concrete implementation must support `save`, `find`, `delete`, and `listKeys`." The concrete methods `exists` and `count` can be written once in the abstract class because they work correctly for any implementation that honors the contract — they do not need to be overridden.

**SE lens — separating interface from implementation:**

`DataStore` is purely an interface. It describes what operations a storage system supports, without committing to any storage mechanism. The caller that uses a `DataStore` knows exactly what it can do (the contract) but knows nothing about how it does it (the implementation). This separation is abstraction: hiding the implementation details behind a stable interface.

**What breaks when you skip abstraction:**

If business logic calls `new PostgresDatabase()` directly:
- Testing requires a real PostgreSQL server
- Switching to MySQL requires editing the business logic
- Running the same logic with different configurations (test database vs production database) requires conditional logic in the business code

If business logic calls through `DataStore`:
- Tests use `InMemoryStore` — no database required
- Switching databases requires writing a new `MySQLStore` — zero changes to business logic
- The abstraction pays for itself the first time you write a test

---

### SAVE AND TRY

```js
class DataStore {
  save(key, value) { throw new Error(`${this.constructor.name} must implement save`); }
  find(key)        { throw new Error(`${this.constructor.name} must implement find`); }
  delete(key)      { throw new Error(`${this.constructor.name} must implement delete`); }
  listKeys()       { throw new Error(`${this.constructor.name} must implement listKeys`); }

  exists(key) { return this.find(key) !== undefined; }
  count()     { return this.listKeys().length; }
}

const store = new DataStore();
console.log(store.exists("anything"));  // → error thrown
```

Expected: "DataStore must implement find" error. `exists` calls `find`, which throws.

**Change something:** Add a concrete `testStore` by creating a subclass that implements `find` as always returning `undefined`. Call `store.count()`. Expected: "DataStore must implement listKeys" — `count` calls `listKeys`, which is not implemented either. The concrete methods can chain through to unimplemented abstract ones.

---

### Step 2 — First Concrete Implementation: InMemoryStore

**The problem this step solves:** Provide a real, working implementation of the `DataStore` contract.

**The code:**

```js
class InMemoryStore extends DataStore {
  #data = new Map();   // private: implementation detail hidden from callers

  save(key, value) {
    this.#data.set(key, value);
    return this;   // chaining
  }

  find(key) {
    return this.#data.get(key);   // undefined if not found
  }

  delete(key) {
    this.#data.delete(key);
    return this;
  }

  listKeys() {
    return [...this.#data.keys()];
  }
}
```

`new Map()` — a built-in JavaScript data structure. Unlike plain objects (`{}`), a `Map` can use any value as a key (not just strings), maintains insertion order, and has a clean API: `set(key, value)`, `get(key)`, `delete(key)`, `has(key)`, `keys()`. `this.#data.get(key)` returns `undefined` if the key is not present — which is why `exists` (which calls `find`) checks for `!== undefined`.

`[...this.#data.keys()]` — the spread operator (`...`) inside array brackets creates an array from any iterable. `this.#data.keys()` returns a `MapIterator` — an object that produces values one at a time. Spreading it into `[...]` collects all the values into an array. This is necessary because `listKeys()` is defined to return an array (not an iterator).

**The walkthrough — `store.save("name", "Alice")`:**

1. `save` is called with key `"name"`, value `"Alice"`.
2. `this.#data.set("name", "Alice")` — adds or updates the key in the private Map.
3. `return this` — returns the store for chaining.

**The concrete methods from `DataStore` work immediately:**

```js
const store = new InMemoryStore();
store.save("name", "Alice").save("age", 30).save("city", "New York");

console.log(store.find("name"));   // → "Alice"
console.log(store.exists("age"));  // → true     (from DataStore, calls find)
console.log(store.count());        // → 3         (from DataStore, calls listKeys)
console.log(store.listKeys());     // → ["name", "age", "city"]
```

`count()` and `exists()` are inherited from `DataStore` and work without being reimplemented in `InMemoryStore`. They delegate to `find()` and `listKeys()` — which `InMemoryStore` provides. This is the payoff of abstraction: concrete methods in the abstract class work for free in every implementation.

**CS lens — the Map as the hidden implementation:**

The private `#data` field hides the `Map` completely. Callers see `save`/`find`/`delete`/`listKeys`. They do not know a `Map` is used. If you later change to an array-based implementation (for some reason), callers would never know. The interface is stable; the implementation can evolve.

**SE lens — tests use InMemoryStore:**

Every test that exercises business logic using a `DataStore` can use `InMemoryStore`. No database. No network. No setup. Fast. Deterministic. In-memory stores are the standard testing substitute for databases, file systems, and external services. The abstract class is what makes this substitution seamless — the business logic calls `DataStore` methods; the test supplies an `InMemoryStore`.

**What breaks if #data is public:**

If `#data` were public, a test could do `store._data.set("injected", "value")` — bypassing the `save` method, skipping any validation the store provides. The invariant that "all data comes in through `save`" would be broken. Private fields enforce the contract.

---

### SAVE AND TRY

```js
// InMemoryStore definition from above...

const userStore = new InMemoryStore();
userStore.save("alice", { name: "Alice", age: 30 });
userStore.save("bob",   { name: "Bob",   age: 25 });
userStore.save("carol", { name: "Carol", age: 35 });

console.log("Count:", userStore.count());          // → 3
console.log("Exists alice:", userStore.exists("alice")); // → true
console.log("Exists dave:", userStore.exists("dave"));   // → false

userStore.delete("bob");
console.log("After delete:", userStore.listKeys()); // → ["alice", "carol"]
console.log("Count:", userStore.count());          // → 2
```

Expected: `3`, `true`, `false`, `["alice", "carol"]`, `2`.

**Change something:** Save an object, retrieve it, and modify the retrieved copy. Does the stored version change? `const user = userStore.find("alice"); user.age = 99; console.log(userStore.find("alice").age)`. Expected: `99` — the store holds a reference to the object, not a copy. If you need the store to be immutable, the `save` method should store a deep copy. This is a real design decision stores make.

---

### Step 3 — Second Concrete Implementation: LocalStorageStore

**The problem this step solves:** Provide a second concrete implementation of the same `DataStore` contract, backed by the browser's `localStorage`.

**`localStorage`** — a browser API (not available in Node.js) that stores string key-value pairs persistently. Data survives page refreshes and browser restarts. It is limited to strings — storing objects requires serialization to JSON. The API: `localStorage.setItem(key, value)`, `localStorage.getItem(key)` (returns `null` if not found, not `undefined`), `localStorage.removeItem(key)`, `Object.keys(localStorage)` lists all keys.

**JSON serialization:** `JSON.stringify(value)` converts a JavaScript value to a JSON string. `JSON.parse(string)` converts a JSON string back to a JavaScript value. This is necessary because `localStorage` only stores strings.

```js
class LocalStorageStore extends DataStore {
  #prefix;  // namespace prefix to avoid collisions with other localStorage keys

  constructor(prefix) {
    super();   // DataStore has no constructor args — but super() is still required
    this.#prefix = prefix;
  }

  #makeKey(key) {
    return `${this.#prefix}:${key}`;
  }

  save(key, value) {
    localStorage.setItem(this.#makeKey(key), JSON.stringify(value));
    return this;
  }

  find(key) {
    const raw = localStorage.getItem(this.#makeKey(key));
    if (raw === null) return undefined;   // normalize: localStorage uses null, our contract uses undefined
    return JSON.parse(raw);
  }

  delete(key) {
    localStorage.removeItem(this.#makeKey(key));
    return this;
  }

  listKeys() {
    const prefixWithColon = this.#prefix + ":";
    return Object.keys(localStorage)
      .filter(storageKey => storageKey.startsWith(prefixWithColon))
      .map(storageKey => storageKey.slice(prefixWithColon.length));
  }
}
```

`Object.keys(localStorage)` — `Object.keys(obj)` returns an array of all own enumerable property names of `obj`. For `localStorage`, this lists every key currently stored. Because `localStorage` is shared across the whole page, we prefix every key (`${prefix}:${key}`) so this store's data does not collide with keys stored by other code.

`String.prototype.startsWith(prefix)` — returns `true` if the string starts with `prefix`. Used to filter localStorage keys to only those belonging to this store.

`String.prototype.slice(start)` — returns the substring starting at index `start`. Used to strip the prefix from the key names, returning the original key names as passed to `save`.

**The walkthrough — `store.save("user", { name: "Alice" })`:**

1. `this.#makeKey("user")` returns `"users:user"` (if prefix is `"users"`).
2. `JSON.stringify({ name: "Alice" })` returns `'{"name":"Alice"}'`.
3. `localStorage.setItem("users:user", '{"name":"Alice"}')` — stored persistently.

The caller cannot tell whether they are using `InMemoryStore` or `LocalStorageStore`. Both honor the `DataStore` contract.

**CS lens — serialization as an implementation detail:**

`LocalStorageStore` serializes values to JSON strings and deserializes on read. This is an implementation detail of `LocalStorageStore` — callers using the `DataStore` interface never see strings. They `save` an object and `find` an object. The serialization is abstracted away. This is the general principle: implementation details (how the data is stored) are hidden; the interface (what operations are available) is exposed.

**SE lens — same business logic, two storage backends:**

```js
function recordVisit(store, userId) {
  const existing = store.find(userId) ?? { visits: 0 };
  existing.visits += 1;
  store.save(userId, existing);
  return existing.visits;
}

// In tests:
const testStore = new InMemoryStore();
console.log(recordVisit(testStore, "user123"));   // → 1  (fast, no browser storage)

// In production:
const persistentStore = new LocalStorageStore("visits");
console.log(recordVisit(persistentStore, "user123"));  // → persists across refreshes
```

`?? { visits: 0 }` — the **nullish coalescing operator**. `a ?? b` returns `b` if `a` is `null` or `undefined`, otherwise returns `a`. Different from `||`: `0 || default` would incorrectly return `default` because `0` is falsy, but `0 ?? default` correctly returns `0`. Used here to default to `{ visits: 0 }` if the user has no record.

`recordVisit` is identical regardless of which store is used. Swapping the implementation is a one-line change at the call site.

**What breaks if business logic directly instantiates `LocalStorageStore`:**

Tests must run in a browser (or jsdom). Tests that previously ran in 2ms now take 20ms because localStorage has I/O overhead. Tests become order-dependent if localStorage is not cleared between runs. The test environment must precisely match the browser environment. Abstraction makes tests fast and isolated by making `InMemoryStore` a valid substitute.

---

### SAVE AND TRY

```js
// Using LocalStorageStore in the browser console:
const productStore = new LocalStorageStore("products");

productStore.save("widget",  { name: "Widget",  price: 9.99 });
productStore.save("gadget",  { name: "Gadget",  price: 24.99 });
productStore.save("donut",   { name: "Donut",   price: 1.99 });

console.log("Count:", productStore.count());
console.log("Widget:", productStore.find("widget"));
console.log("Keys:", productStore.listKeys());

// Refresh the page in the browser and run:
const reloadedStore = new LocalStorageStore("products");
console.log("After reload, count:", reloadedStore.count());
// → 3  (data persisted across page refresh)
```

Expected: after reload, the data is still there.

**Change something:** Run `productStore.delete("gadget")` and verify `productStore.count()` is now `2`. Reload the page. Expected: count is still `2` after reload — the delete was also persisted. Try `productStore.find("gadget")` after reload. Expected: `undefined`.

---

## Connect the Pieces

**What you built:** `DataStore` as an abstract class defining a contract, `InMemoryStore` as a test-friendly implementation, `LocalStorageStore` as a production browser implementation — and business logic that uses either through the same interface.

**How it connects to LAB-015 (Polymorphism):** `recordVisit` is polymorphic — it works with any `DataStore` subclass. Adding a `IndexedDbStore` or `ServerStore` requires zero changes to `recordVisit`. Abstraction is what enables polymorphism: the caller depends on the abstract interface, not on any concrete class.

**How it connects to LAB-013 (Encapsulation):** Both concrete stores use private fields (`#data`, `#prefix`). The implementation details are hidden. Callers cannot bypass the interface.

**How it connects forward:**

- **LAB-017 (Interfaces as a Contract):** TypeScript interfaces formalize what the abstract class establishes informally. `interface DataStore { save(key: string, value: unknown): void; ... }` — a purely structural contract with no implementation at all. In TypeScript, the abstract class and interface approaches produce the same external behavior; the language provides compile-time enforcement.
- **LAB-052 (Dependency Inversion Principle):** `recordVisit(store: DataStore, ...)` — high-level code depends on the abstraction, not the concrete. Low-level code (InMemoryStore, LocalStorageStore) also depends on the abstraction (they implement it). Neither depends on the other directly. This is DIP.
- **LAB-089 (Hexagonal Architecture):** `DataStore` is a **port** — an interface the domain defines. `InMemoryStore` and `LocalStorageStore` are **adapters** — concrete implementations that plug into the port from outside. Hexagonal architecture is this pattern applied at the system level.
- **LAB-090 (Repository Pattern):** `DataStore` is a simplified version of the Repository pattern — an interface for data access that hides persistence details from the domain.

**The real-world connection:**

Every production system uses this pattern. Node.js's stream classes are abstract: `Readable`, `Writable`, `Duplex` define interfaces; concrete implementations include file streams, HTTP request/response streams, crypto streams, and zip streams. React's `useState` is abstract over component state storage — the browser and Node.js (for server-side rendering) use different mechanisms, but the component code calls `useState` the same way everywhere. The ORM pattern (LAB-117) abstracts over different databases behind a common query interface.

---

## What Breaks Without This

**Concrete failure — testing requires a real database:**

```js
// Business logic directly instantiates a concrete store
class UserService {
  #store = new LocalStorageStore("users");   // hardcoded — cannot be changed

  register(id, name) {
    if (this.#store.exists(id)) throw new Error("User exists");
    this.#store.save(id, { id, name });
  }
}

// To test UserService.register, you MUST:
// 1. Run in a browser (localStorage only exists there)
// 2. Clear localStorage before each test
// 3. Run tests sequentially (order-dependent side effects)
// 4. Have no other localStorage data that might interfere
```

Compare to:

```js
class UserService {
  #store;   // injected — any DataStore works

  constructor(store) {
    this.#store = store;
  }

  register(id, name) {
    if (this.#store.exists(id)) throw new Error("User exists");
    this.#store.save(id, { id, name });
  }
}

// To test: one line
const service = new UserService(new InMemoryStore());
```

Fast, isolated, no browser required. Abstraction is what makes dependency injection possible, and dependency injection is what makes testing fast.

---

## Definition of Done

Verify each item before moving to LAB-017.

- [ ] `new DataStore()` can be instantiated but calling `save` throws immediately
- [ ] `InMemoryStore` implements all four abstract methods
- [ ] `InMemoryStore.exists("key")` works without implementing `exists` — inherited from `DataStore`
- [ ] `InMemoryStore.count()` returns the correct count without implementing `count`
- [ ] `LocalStorageStore` persists data across a page refresh
- [ ] `recordVisit(testStore, userId)` and `recordVisit(persistentStore, userId)` produce the same result — same business logic, different storage

**Git commit:**

```
git add .
git commit -m "LAB-016: DataStore abstract class with InMemoryStore (tests) and LocalStorageStore (production) — abstraction separates interface from implementation"
```

---

## Quick Check Answers

**1. What needs to change if business logic calls `PostgresDatabase` directly vs `DataStore`?**

With direct `PostgresDatabase`: the business logic must be edited to change the database. Every test requires a real PostgreSQL connection. Every developer needs PostgreSQL installed. Changing to MySQL requires editing business logic. The business logic is tightly coupled to the storage mechanism.

With `DataStore`: the business logic is unchanged. Tests use `InMemoryStore`. Production uses `PostgresStore`. Adding `MySQLStore` requires writing one new class and changing the wiring (which database to inject) — the business logic is untouched. The abstraction isolates the decision of what database to use from the logic of what to do with it.

**2. What is the difference between "what it does" and "how it does it"? Which should callers know?**

"What it does" is the interface: `save(key, value)`, `find(key)`. The contract. What the caller can ask for and what it gets back. "How it does it" is the implementation: uses a `Map`, serializes to JSON, stores in localStorage. The mechanism. Callers should know only the "what" — the interface. The "how" is an implementation detail that can change without affecting callers. Abstraction is the practice of hiding "how" behind "what."

**3. Can you create an instance of an abstract class? Why or why not?**

In JavaScript, technically yes — JavaScript has no language-level `abstract` keyword. `new DataStore()` succeeds. But calling any abstract method immediately throws, making the instance useless for anything beyond the concrete methods (`exists`, `count`). In TypeScript, Java, and C#, the language prevents instantiation of abstract classes at compile time. The JavaScript pattern (throwing in abstract methods) enforces the contract at runtime rather than compile time. In practice: never instantiate an abstract class — use it only as a base for concrete subclasses.

---

*Next: LAB-017 — Interfaces as a Contract*
