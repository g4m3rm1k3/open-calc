# Data Access and Composition: Repository, Cache, Aggregate

## What you will build

Three runnable programs — one per concept — in both Python and TypeScript,
showing how real systems hide storage details behind a clean interface,
avoid repeating expensive work, and treat a cluster of related objects as
one consistent unit. By the end you'll understand why a codebase has a
class named `OrderRepository` instead of scattering database queries
everywhere, why a `Cache` class exists at all instead of just calling the
expensive function directly, and why an `Order` object might "own" its
`LineItem` objects rather than letting them float around independently.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and benefits from, but doesn't strictly require, having read the
previous post on Entity and Value Object — the Aggregate section builds
directly on the Entity concept, and is briefly re-explained here so the
post still stands alone. No TypeScript knowledge is assumed.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; `node` runs the result. A type error stops
compilation before anything executes.

---

## Concept 1: Repository

A **Repository** hides the details of how data is stored and retrieved
behind a simple, collection-like interface — code that wants data calls
methods like `find_by_id` or `save`, with no knowledge of whether the data
actually lives in a database, a file, an external API, or just an in-memory
list (useful for tests).

### Python

First, without a repository — data access logic scattered directly into
business logic:

```python
class Order:
    def __init__(self, order_id, customer_name, total):
        self.order_id = order_id
        self.customer_name = customer_name
        self.total = total


_orders_storage = {}


def place_order(order_id, customer_name, total):
    order = Order(order_id, customer_name, total)
    _orders_storage[order_id] = order
    print(f"Order {order_id} saved directly to storage dict.")
    return order


def get_order_total(order_id):
    order = _orders_storage.get(order_id)
    if order:
        return order.total
    return None
```

**Walkthrough:** `_orders_storage` is a plain dictionary acting as
in-memory storage — but notice it's referenced directly, by name, in two
separate functions. If storage later moved to an actual database, both
`place_order` and `get_order_total` (and every other function that touches
`_orders_storage`) would need to be rewritten. This is the same coupling
problem from this series' post on Controller/Mediator/Dispatcher: any
function that reaches directly into the storage mechanism is tightly bound
to _how_ that storage currently works.

A Repository centralizes this:

```python
class OrderRepository:
    def __init__(self):
        self._orders = {}

    def save(self, order):
        self._orders[order.order_id] = order

    def find_by_id(self, order_id):
        return self._orders.get(order_id)

    def find_all(self):
        return list(self._orders.values())

    def delete(self, order_id):
        if order_id in self._orders:
            del self._orders[order_id]
```

**Walkthrough:** Every method here uses vocabulary borrowed from
collections, not from any specific storage technology — `save`,
`find_by_id`, `find_all`, `delete` — deliberately not `INSERT INTO`,
`SELECT`, or anything that reveals _how_ storage actually works
underneath. `list(self._orders.values())` converts the dictionary's
values (recall `.values()` returns all the values in a dict, without the
keys) into an actual list, so callers get back a normal list of `Order`
objects rather than a dictionary-specific view object.

```python
repository = OrderRepository()

repository.save(Order(1, "Alice", 49.99))
repository.save(Order(2, "Bob", 29.99))
repository.save(Order(3, "Carol", 99.99))

order = repository.find_by_id(2)
print(f"Found order: {order.customer_name}, ${order.total}")

all_orders = repository.find_all()
print(f"Total orders: {len(all_orders)}")

repository.delete(1)
print(f"Order 1 after delete: {repository.find_by_id(1)}")
```

```
Found order: Bob, $29.99
Total orders: 3
Order 1 after delete: None
```

**Walkthrough:** Business logic — anything that needs an order — only ever
talks to `OrderRepository`, never to the underlying dictionary directly.
If the underlying storage were swapped for a real database, only
`OrderRepository`'s internals would need to change; every caller using
`save`, `find_by_id`, `find_all`, and `delete` would continue working
completely unchanged.

**CS lens.** A Repository is an application of the same interface-hiding
idea as the Facade pattern from this series' first post — but specifically
scoped to data access. The "interface" it presents resembles a generic
collection (list-like or set-like operations: add, find, remove, list
all) regardless of what's actually behind it.

**SE lens.** This is one of the most consequential patterns for
**testability**. Because business logic depends only on the Repository's
interface, tests can swap in a fake, in-memory repository (exactly like
the one built here) instead of a real database — meaning tests run fast,
don't require a real database connection, and don't leave behind test data
that needs cleanup. This is a direct, practical payoff of the dependency
inversion principle named in the Abstract Factory section of this series:
business logic depends on the _abstraction_ "something that can save and
find orders," not on a concrete database technology.

**What breaks without this:** Without a repository boundary, every place
that touches order data directly embeds knowledge of the storage
mechanism — meaning a migration from one database technology to another
requires hunting down and rewriting every one of those places, and writing
a test for any business logic that touches orders requires either a real
database connection or careful, error-prone mocking of low-level storage
calls.

### TypeScript

```typescript
class Order {
  constructor(
    public orderId: number,
    public customerName: string,
    public total: number,
  ) {}
}

class OrderRepository {
  private orders: Record<number, Order> = {};

  save(order: Order): void {
    this.orders[order.orderId] = order;
  }

  findById(orderId: number): Order | null {
    return this.orders[orderId] ?? null;
  }

  findAll(): Order[] {
    return Object.values(this.orders);
  }

  delete(orderId: number): void {
    delete this.orders[orderId];
  }
}
```

**Walkthrough — new syntax.** `Object.values(this.orders)` is
JavaScript/TypeScript's equivalent of Python's `.values()` on a
dictionary, but as a standalone function applied to the object rather than
a method called on it — it returns an array of all the values in the
`Record`. `delete this.orders[orderId];` — this is a different `delete`
from Python's `del` statement: in JavaScript, `delete` is an _operator_
(it produces a value, `true` or `false`, indicating success, though that
return value is ignored here) that removes a property from an object,
applied directly to the property access expression, `this.orders[orderId]`.

```typescript
const repository = new OrderRepository();

repository.save(new Order(1, "Alice", 49.99));
repository.save(new Order(2, "Bob", 29.99));
repository.save(new Order(3, "Carol", 99.99));

const order = repository.findById(2);
console.log(`Found order: ${order?.customerName}, $${order?.total}`);

const allOrders = repository.findAll();
console.log(`Total orders: ${allOrders.length}`);

repository.delete(1);
console.log(`Order 1 after delete: ${repository.findById(1)}`);
```

```
Found order: Bob, $29.99
Total orders: 3
Order 1 after delete: null
```

**Walkthrough — new syntax.** `order?.customerName` introduces the
**optional chaining operator**, `?.`. Recall `findById` returns `Order |
null` — if `order` is `null`, attempting `order.customerName` directly
would crash with a runtime error (TypeScript's equivalent of Python's
`AttributeError: 'NoneType' object has no attribute`). `?.` short-circuits
safely: if the value to its left is `null` or `undefined`, the entire
expression evaluates to `undefined` instead of throwing — `order?.customerName`
reads as "get `customerName` if `order` exists, otherwise just give me
`undefined` without crashing." This is a more concise alternative to
writing a full `if (order) { ... }` check when you only need to safely
read one property.

---

## Concept 2: Cache

A **Cache** stores the results of expensive operations so that repeated
requests for the same result can be served instantly instead of redoing
the expensive work.

### Python

```python
import time


def expensive_calculation(n):
    print(f"  Computing expensive_calculation({n})...")
    time.sleep(0.3)
    return n * n
```

**Walkthrough — new syntax.** `import time` brings in Python's built-in
`time` module. `time.sleep(0.3)` pauses program execution for 0.3 seconds
— used here purely to simulate an operation that takes real, noticeable
time (a database query, a network call, a complex computation), so the
difference a cache makes is observable.

Without a cache, every call redoes the full work:

```python
print(expensive_calculation(5))
print(expensive_calculation(5))
print(expensive_calculation(5))
```

```
  Computing expensive_calculation(5)...
25
  Computing expensive_calculation(5)...
25
  Computing expensive_calculation(5)...
25
```

**Walkthrough:** Three identical calls, three identical results, but the
expensive computation re-runs every single time — wasted work, since the
input (and therefore the correct output) never changed.

```python
class Cache:
    def __init__(self):
        self._store = {}

    def get_or_compute(self, key, compute_fn):
        if key in self._store:
            print(f"  Cache hit for key: {key}")
            return self._store[key]

        print(f"  Cache miss for key: {key}")
        result = compute_fn()
        self._store[key] = result
        return result
```

**Walkthrough:** `self._store` is a dictionary mapping a key to a
previously computed result. `get_or_compute(key, compute_fn)` checks
whether `key` is already in `_store`. If so — a **cache hit** — it returns
the stored result immediately, skipping the expensive work entirely. If
not — a **cache miss** — it actually calls `compute_fn()` (a callback,
the same concept from this series' Communication post — a function passed
in to be called when needed), stores the result under `key` for next time,
and returns it.

```python
cache = Cache()

print(cache.get_or_compute(5, lambda: expensive_calculation(5)))
print(cache.get_or_compute(5, lambda: expensive_calculation(5)))
print(cache.get_or_compute(5, lambda: expensive_calculation(5)))
print(cache.get_or_compute(10, lambda: expensive_calculation(10)))
```

```
  Cache miss for key: 5
  Computing expensive_calculation(5)...
25
  Cache hit for key: 5
25
  Cache hit for key: 5
25
  Cache miss for key: 10
  Computing expensive_calculation(10)...
100
```

**Walkthrough:** The first call with key `5` is a miss — the expensive
computation actually runs. The second and third calls with the same key
are hits — `expensive_calculation` is never called again, and the result
returns instantly. A _different_ key, `10`, causes a fresh miss, since
`10` has never been seen before. `lambda: expensive_calculation(5)` wraps
the actual call in a small anonymous function (recall lambdas from the
Communication post) specifically so the cache controls _whether_ the
expensive call happens at all — if we'd written `cache.get_or_compute(5,
expensive_calculation(5))` instead, Python would evaluate
`expensive_calculation(5)` immediately, before even calling
`get_or_compute`, completely defeating the purpose of the cache.

**CS lens — what makes a value cacheable, and what can go wrong?** A
cache is only correct if the same key reliably means the same answer.
Caching only works safely when `compute_fn`'s result genuinely depends
only on the inputs captured by `key` — if the underlying data could change
between calls (today's weather, a stock price, a frequently-edited
document), a naive cache would return **stale data**: an answer that was
correct when computed but is no longer correct now. Real caching systems
address this with **expiration** (a cached value is only valid for some
time window, then must be recomputed) or **invalidation** (explicitly
clearing a cached entry the moment the underlying data changes) — neither
implemented here, but worth naming as the next concern once a cache moves
from prototype to production use.

**SE lens.** Caching appears at every layer of real systems: a web
browser caching images so they don't redownload on every page view, a
database caching query results, a CDN (covered later in this series)
caching entire web pages close to users geographically. The trade-off a
cache always makes is **memory for speed** — storing results costs memory
(or disk space) in exchange for avoiding repeated computation or I/O.
This trade-off is not free, and deciding what to cache, for how long, and
when to evict old entries is a real design problem in any system handling
meaningful scale.

**What breaks without this:** Without caching, any operation that's
expensive and frequently repeated with the same inputs wastes real time
and resources on every single call — in a high-traffic system, this can
be the difference between a responsive application and one that's
unusably slow or that overwhelms a backend database with redundant
identical queries.

### TypeScript

```typescript
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Walkthrough — new syntax, simplified for now.** TypeScript/JavaScript
has no direct built-in equivalent to Python's `time.sleep` because
JavaScript handles waiting asynchronously rather than by pausing the
entire program (this series' dedicated post on `async`/`await` covers
this fully). `Promise<void>` is a type representing "a value that will be
available later, eventually, with no meaningful result" — for now, treat
this `sleep` function as a black box that produces a pause, and don't
worry about exactly how `Promise` and `setTimeout` work internally; we'll
return to this properly in the async post.

```typescript
async function expensiveCalculation(n: number): Promise<number> {
  console.log(`  Computing expensiveCalculation(${n})...`);
  await sleep(300);
  return n * n;
}
```

**Walkthrough — new syntax, simplified for now.** `async function` marks
a function as asynchronous — it can use `await` inside it to pause at a
specific point until something finishes, without blocking the entire
program meanwhile. `await sleep(300)` pauses this specific function's
progress until the simulated 300ms delay completes. The return type
`Promise<number>` means "eventually produces a `number`." Again — full
treatment of this mechanism is in the dedicated async post; here, focus
on the caching behavior, which works the same way regardless of this
detail.

```typescript
class ResultCache {
  private store: Record<number, number> = {};

  async getOrCompute(
    key: number,
    computeFn: () => Promise<number>,
  ): Promise<number> {
    if (key in this.store) {
      console.log(`  Cache hit for key: ${key}`);
      return this.store[key];
    }

    console.log(`  Cache miss for key: ${key}`);
    const result = await computeFn();
    this.store[key] = result;
    return result;
  }
}
```

**Walkthrough — new syntax.** `key in this.store` — the `in` operator
here checks whether `key` exists as a property on the object `this.store`
— the TypeScript/JavaScript equivalent of Python's `key in dictionary`.
`computeFn: () => Promise<number>` types the callback parameter as "a
function taking no arguments that eventually produces a `number`" —
matching the shape of `expensiveCalculation` above. `async
getOrCompute(...)` and `await computeFn()` mirror the async pattern from
`expensiveCalculation` — because computing the value might itself be
asynchronous (as it is here), the cache method needs to be asynchronous
too, in order to correctly wait for it before storing and returning the
result.

```typescript
async function main() {
  const cache = new ResultCache();

  console.log(await cache.getOrCompute(5, () => expensiveCalculation(5)));
  console.log(await cache.getOrCompute(5, () => expensiveCalculation(5)));
  console.log(await cache.getOrCompute(5, () => expensiveCalculation(5)));
  console.log(await cache.getOrCompute(10, () => expensiveCalculation(10)));
}

main();
```

```
  Cache miss for key: 5
  Computing expensiveCalculation(5)...
25
  Cache hit for key: 5
25
  Cache hit for key: 5
25
  Cache miss for key: 10
  Computing expensiveCalculation(10)...
100
```

**Walkthrough — new syntax.** Because top-level code in a standard
TypeScript file can't directly use `await` (this restriction and its
exceptions are covered in the async post), the calls are wrapped in an
`async function main() { ... }`, and `main()` is called at the end to
actually run everything inside it. `() => expensiveCalculation(5)` is an
arrow function wrapping the call — exactly the same reason Python's
version used `lambda: expensive_calculation(5)`: to delay the actual
expensive call until the cache decides it's actually needed, rather than
evaluating it eagerly before `getOrCompute` is even called.

---

## Concept 3: Aggregate

An **Aggregate** is a cluster of related objects — typically one central
Entity (recall Entity from the previous post: identity-based, mutable over
time) plus other objects it owns — treated as a single unit for the
purposes of consistency and change. The central Entity is called the
**Aggregate Root**: the only object in the cluster that outside code is
allowed to interact with directly. Everything else inside the aggregate is
only reached _through_ the root.

### Python

```python
class LineItem:
    def __init__(self, product_name, quantity, unit_price):
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price

    @property
    def subtotal(self):
        return self.quantity * self.unit_price
```

**Walkthrough:** `LineItem` represents one product line within an order —
notice it has no ID of its own and no independent meaning outside the
context of an order it belongs to. This is intentional: a `LineItem`
floating around on its own, disconnected from any `Order`, doesn't really
mean anything in this domain.

```python
class Order:
    def __init__(self, order_id, customer_name):
        self.order_id = order_id
        self.customer_name = customer_name
        self._line_items = []

    def add_item(self, product_name, quantity, unit_price):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        item = LineItem(product_name, quantity, unit_price)
        self._line_items.append(item)

    @property
    def total(self):
        return sum(item.subtotal for item in self._line_items)

    @property
    def item_count(self):
        return len(self._line_items)

    def __repr__(self):
        return f"Order(id={self.order_id}, items={self.item_count}, total=${self.total:.2f})"
```

**Walkthrough — new syntax.** `sum(item.subtotal for item in
self._line_items)` introduces a **generator expression**: a compact way
of writing "compute `item.subtotal` for every `item` in `self._line_items`,
and feed each result into `sum()`" — this is closely related to the list
comprehensions covered in this series' functional programming post, just
without building an intermediate list first; `sum()` consumes each value
as it's produced. The important design detail is in `add_item`: outside
code never constructs a `LineItem` directly and appends it — it must go
through `Order.add_item`, which validates the quantity _before_ allowing
the item to be added. This is the Aggregate Root enforcing a consistency
rule (no negative or zero quantities) on every change to anything inside
the aggregate, because every change is forced to pass through it.

```python
order = Order(1, "Alice")

order.add_item("Widget", 3, 9.99)
order.add_item("Gadget", 1, 24.99)

print(order)
print(f"Total: ${order.total:.2f}")

try:
    order.add_item("Broken Item", -1, 5.00)
except ValueError as e:
    print(f"Rejected: {e}")
```

```
Order(id=1, items=2, total=$54.96)
Total: $54.96
Rejected: Quantity must be positive
```

**Walkthrough — new syntax.** `try`/`except` is Python's mechanism for
**catching** an error rather than letting it crash the program (this
series has a dedicated post on errors and exceptions; here's a brief,
sufficient introduction). Code inside `try:` runs normally; if it raises
an exception matching the type named in `except ValueError as e:`, control
jumps to that block instead of crashing, with `e` bound to the actual
exception object, whose message can be accessed (here, simply printed via
an f-string, which automatically calls its string representation).
`order.add_item("Broken Item", -1, 5.00)` attempts to add an item with a
negative quantity; `add_item`'s validation catches this and raises
`ValueError` before any `LineItem` is created or appended — the order's
internal list of line items remains exactly as it was, untouched by the
rejected operation. This is the aggregate protecting its own internal
consistency: it is _impossible_, by construction, for `order._line_items`
to ever contain an item with a non-positive quantity, because the only
path to adding one is through validated code.

**CS lens.** The aggregate boundary defines what must change together,
atomically, as one unit — `total` is always consistent with the current
contents of `_line_items` because it's computed fresh from them every
time (`@property` recalculates on each access, never stored separately
and risking falling out of sync). This is the same idea, at a small scale,
as a database **transaction**: a set of changes that either all succeed
together or none do, keeping the data in a valid state at every observable
point.

**SE lens.** The Aggregate Root pattern (also central to Domain-Driven
Design, mentioned in the previous post) answers a practical design
question: when several related objects must always change together
consistently, which one should the rest of the codebase be allowed to
hold a direct reference to? The answer: only the root. Other code should
never hold a `LineItem` independently and modify it outside the `Order`'s
own methods — doing so would let the line item's data drift out of sync
with the order's own validation rules and computed totals.

**What breaks without this:** If `LineItem`s could be created and appended
directly to `order._line_items` from outside the class (bypassing
`add_item`), nothing would stop a negative quantity, a zero quantity, or
any other invalid state from being inserted — the validation logic in
`add_item` would become merely optional convention rather than an
enforced guarantee, and bugs caused by invalid line items could appear
anywhere in the codebase that happened to touch the order's internals
directly.

### TypeScript

```typescript
class LineItem {
  constructor(
    public productName: string,
    public quantity: number,
    public unitPrice: number,
  ) {}

  get subtotal(): number {
    return this.quantity * this.unitPrice;
  }
}
```

**Walkthrough — new syntax.** `get subtotal(): number { ... }` is
TypeScript/JavaScript's **getter** syntax — the direct equivalent of
Python's `@property`. It defines a method that's accessed like a plain
property, without parentheses: `item.subtotal`, not `item.subtotal()`.

```typescript
class Order {
  private lineItems: LineItem[] = [];

  constructor(
    public orderId: number,
    public customerName: string,
  ) {}

  addItem(productName: string, quantity: number, unitPrice: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    this.lineItems.push(new LineItem(productName, quantity, unitPrice));
  }

  get total(): number {
    return this.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get itemCount(): number {
    return this.lineItems.length;
  }

  toString(): string {
    return `Order(id=${this.orderId}, items=${this.itemCount}, total=$${this.total.toFixed(2)})`;
  }
}
```

**Walkthrough — new syntax.** `this.lineItems.reduce((sum, item) => sum +
item.subtotal, 0)` introduces `.reduce()`, a built-in array method that's
the TypeScript/JavaScript equivalent of the accumulator pattern from this
series' loops post, expressed as a single method call instead of an
explicit `for` loop. `.reduce(callback, initialValue)` starts with
`initialValue` (here, `0`), then calls `callback` once per array item,
each time passing in the running accumulated value (`sum`) and the current
item; whatever the callback returns becomes the new `sum` for the next
item. Trace it: starts at `0`. First item: `sum + item.subtotal` → `0 +
item.subtotal`. Second item: previous result `+` this item's subtotal. The
final returned value, after every item has been processed, is the total.
This is mechanically identical to writing
`let sum = 0; for (const item of this.lineItems) { sum += item.subtotal;
} return sum;` — `.reduce()` is simply a more compact, common idiom for
exactly that accumulation shape.

```typescript
const order = new Order(1, "Alice");

order.addItem("Widget", 3, 9.99);
order.addItem("Gadget", 1, 24.99);

console.log(order.toString());
console.log(`Total: $${order.total.toFixed(2)}`);

try {
  order.addItem("Broken Item", -1, 5.0);
} catch (error) {
  if (error instanceof Error) {
    console.log(`Rejected: ${error.message}`);
  }
}
```

```
Order(id=1, items=2, total=$54.96)
Total: $54.96
Rejected: Quantity must be positive
```

**Walkthrough — new syntax.** `try`/`catch` is TypeScript/JavaScript's
equivalent of Python's `try`/`except`. `catch (error)` — unlike Python,
TypeScript doesn't let you specify which error type to catch directly in
the `catch` clause; instead, `error` is caught with a broad type
(`unknown`, by TypeScript's default safety rules) and must be checked
manually. `error instanceof Error` checks whether the caught value is
actually an instance of JavaScript's built-in `Error` type (recall `Error`
from the Factory post's `throw new Error(...)`) — necessary because
JavaScript technically allows throwing _any_ value, not just proper error
objects, so this check is the safe way to confirm `error.message` will
actually exist before accessing it.

---

## Connect the pieces

**Repository** and **Cache** both sit at a data-access boundary, but solve
different problems: a Repository hides _where and how_ data is stored,
presenting collection-like methods regardless of the underlying storage
technology; a Cache avoids _redoing_ expensive work by remembering
previous results, trading memory for speed. A system frequently combines
both — a Repository's `find_by_id` method might itself be backed by a
cache internally, so callers get the clean Repository interface while
still benefiting from caching, without needing to know caching is even
happening.

**Aggregate** is a different kind of concept entirely — not about data
access, but about _consistency boundaries_: which objects must always
change together, and which single object (the Aggregate Root) is the only
legitimate entry point for making those changes. The `Order`/`LineItem`
relationship here directly builds on the Entity concept from the previous
post — `Order` is the Entity with the ID; `LineItem` has no independent
identity of its own and exists only as part of an `Order`.

## What breaks without these patterns

Without a Repository, storage details leak into business logic
everywhere, making both technology migrations and testing significantly
harder. Without a Cache, systems waste real time and resources repeating
identical expensive operations. Without a clear Aggregate boundary,
validation rules become optional suggestions rather than guarantees,
because any code with direct access to an object's internals can bypass
the rules meant to protect its consistency.

## Definition of done

- [ ] You can explain what a Repository hides, and why business logic
      should never reach into the storage mechanism directly.
- [ ] You can explain the difference between a cache hit and a cache miss,
      and why the example uses lambdas/arrow functions instead of calling
      the expensive function directly as an argument.
- [ ] You can name at least one risk of caching (stale data) and one
      strategy for mitigating it (expiration or invalidation), even though
      this post's example doesn't implement either.
- [ ] You can explain what an Aggregate Root is and why `LineItem` objects
      in this post can only be created through `Order.add_item`, never
      directly.
- [ ] You've run all three examples in both Python and TypeScript and
      confirmed matching output, including the validation error in the
      Aggregate example.
- [ ] You can explain what `.reduce()` does in TypeScript and how it
      relates to the accumulator pattern from this series' loops post.
