# DI Vocabulary: Lifetimes, Service Locator

## What you will build

Two runnable programs — one per concept — in both Python and TypeScript,
showing the three standard lifetimes an IoC Container uses to decide when
to create new objects versus reuse existing ones (Singleton, Scoped,
Transient), and then the Service Locator pattern — both as a useful tool
and as an anti-pattern, so you can recognize when it's being misused.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. It builds directly on Glossary 15 (Dependency Injection, IoC
Container, Composition Root) — the container mechanics here use the same
`register`/`resolve` structure introduced there. Reading Glossary 15 first
is recommended but not required; the relevant container mechanics are
briefly re-introduced here so the post stands alone.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Lifetimes

When an IoC Container creates an object, it must decide: should it create
a brand new instance every time someone asks for this type, or should it
reuse an existing one? The answer depends on the object's purpose, and
the three standard answers are called **lifetimes** (or scopes):

- **Singleton** — one instance ever, shared by everyone, for the entire
  program's life.
- **Scoped** — one instance per logical unit of work (typically one per
  HTTP request in a web application).
- **Transient** — a brand new instance every time, no sharing.

### Python

```python
import uuid


def make_id():
    return str(uuid.uuid4())[:8]
```

**Walkthrough — new syntax.** `import uuid` brings in Python's built-in
`uuid` module. `uuid.uuid4()` generates a random **UUID** (Universally
Unique Identifier) — a 128-bit random value, typically displayed as a
string of hexadecimal digits separated by hyphens, like
`"3f2a1b4c-8d9e-4f5a-b6c7-d8e9f0a1b2c3"`. UUIDs are used throughout
real software anywhere a unique identifier is needed without central
coordination — user IDs, request IDs, transaction IDs. `[:8]` takes only
the first 8 characters for readability in this example.

```python
class AppContainer:
    def __init__(self):
        self._singletons  = {}
        self._factories   = {}
        self._lifetimes   = {}
        self._scoped_cache = {}

    def register(self, name, factory, lifetime="transient"):
        self._factories[name]  = factory
        self._lifetimes[name]  = lifetime

    def begin_scope(self):
        self._scoped_cache = {}
        print(f"  [Container] New scope started")

    def resolve(self, name):
        lifetime = self._lifetimes.get(name, "transient")

        if lifetime == "singleton":
            if name not in self._singletons:
                self._singletons[name] = self._factories[name](self)
                print(f"  [Container] Created singleton '{name}'")
            return self._singletons[name]

        if lifetime == "scoped":
            if name not in self._scoped_cache:
                self._scoped_cache[name] = self._factories[name](self)
                print(f"  [Container] Created scoped '{name}'")
            return self._scoped_cache[name]

        instance = self._factories[name](self)
        print(f"  [Container] Created transient '{name}'")
        return instance
```

**Walkthrough:** The container now tracks three dictionaries:
`_singletons` (one entry per singleton-registered name, kept forever),
`_scoped_cache` (one entry per scoped name, cleared when `begin_scope()`
is called), and the usual `_factories`. `begin_scope()` simulates what a
web framework does at the start of each HTTP request — it clears the
scoped cache so the next request gets fresh scoped instances while still
sharing singletons with all other requests. `lifetime="transient"` as a
default means objects are created fresh every time unless explicitly
registered differently.

```python
class DatabaseConnection:
    def __init__(self):
        self.id = make_id()
    def query(self, sql):
        return f"[DB:{self.id}] Result of: {sql}"

class RequestLogger:
    def __init__(self):
        self.id = make_id()
    def log(self, message):
        print(f"  [Logger:{self.id}] {message}")

class RequestContext:
    def __init__(self):
        self.id = make_id()
    def get_user(self):
        return f"user-{self.id}"

class BusinessService:
    def __init__(self, db, logger, context):
        self._db      = db
        self._logger  = logger
        self._context = context

    def do_work(self, action):
        user   = self._context.get_user()
        result = self._db.query(f"SELECT * FROM {action} WHERE user='{user}'")
        self._logger.log(f"{user} performed {action}: {result}")
        return result
```

```python
container = AppContainer()

container.register("database",
    lambda c: DatabaseConnection(),
    lifetime="singleton")

container.register("logger",
    lambda c: RequestLogger(),
    lifetime="scoped")

container.register("context",
    lambda c: RequestContext(),
    lifetime="scoped")

container.register("service",
    lambda c: BusinessService(
        c.resolve("database"),
        c.resolve("logger"),
        c.resolve("context")
    ),
    lifetime="transient")
```

```python
print("=== Request 1 ===")
container.begin_scope()
service1a = container.resolve("service")
service1b = container.resolve("service")
service1a.do_work("orders")
service1b.do_work("products")

db_id     = container.resolve("database").id
log_id    = service1a._logger.id
log_id_b  = service1b._logger.id
print(f"\n  DB instance:      same across both services? {db_id == db_id}")
print(f"  Logger instance:  same within request? {log_id == log_id_b}")

print("\n=== Request 2 ===")
container.begin_scope()
service2 = container.resolve("service")
service2.do_work("inventory")

log_id_r2 = service2._logger.id
print(f"\n  Logger same as request 1? {log_id == log_id_r2}")
print(f"  DB same as request 1?     {container.resolve('database').id == db_id}")
```

```
=== Request 1 ===
  [Container] New scope started
  [Container] Created singleton 'database'
  [Container] Created scoped 'logger'
  [Container] Created scoped 'context'
  [Container] Created transient 'service'
  [Container] Created transient 'service'
  [Logger:...] user-... performed orders: [DB:...] Result of: SELECT * FROM orders WHERE user='user-...'
  [Logger:...] user-... performed products: [DB:...] Result of: SELECT * FROM products WHERE user='user-...'

  DB instance:      same across both services? True
  Logger instance:  same within request? True

=== Request 2 ===
  [Container] New scope started
  [Container] Created scoped 'logger'
  [Container] Created scoped 'context'
  [Container] Created transient 'service'
  [Logger:...] user-... performed inventory: [DB:...] Result of: SELECT * FROM inventory WHERE user='user-...'

  Logger same as request 1? False
  DB same as request 1?     True
```

**Walkthrough — reading the output.** The UUIDs will be different each
run, so `...` stands in for their actual values in the expected output
shown. The important structural facts are: `database` (singleton) is
created once in Request 1 and reused silently in Request 2 — no
"Created singleton" message appears in Request 2's output. `logger`
and `context` (scoped) are created fresh at the start of each request
scope. `service` (transient) is created twice in Request 1 (`service1a`
and `service1b`) but both share the same `logger` and `context` instances
within that scope. The logger IDs confirm: same within Request 1, different
between Request 1 and Request 2.

**CS lens — why three lifetimes?** The three lifetimes map directly onto
three different answers to "how much state does this object carry, and
who needs to share it?"

- **Singleton:** stateless infrastructure (a database connection pool,
  a configuration reader) that is safe to share across everything because
  it carries no per-request state. Or: expensive to create, so you create
  it once.
- **Scoped:** per-request state (the current logged-in user, a
  database transaction, a request's accumulated log entries) that must
  be consistent within one request but isolated between requests. If two
  concurrent requests shared a scoped instance, they'd corrupt each
  other's state.
- **Transient:** objects with no shared state and cheap to create, where
  you actively want each consumer to have its own copy.

**SE lens.** Getting lifetimes wrong produces real bugs: a scoped object
registered as singleton will have its request-specific state leaked to
other requests (a classic concurrency bug — Request B sees Request A's
user). A singleton registered as transient is wasteful and potentially
broken if the object relies on accumulated state. In ASP.NET Core,
injecting a scoped service into a singleton is a compile-time or startup
warning, because the framework knows that pattern is almost certainly a
bug.

**What breaks without explicit lifetimes:** Without lifetime management,
every object is either manually created (and you decide arbitrarily,
probably inconsistently, when to reuse vs recreate) or always singleton
(sharing state across requests, causing concurrency bugs) or always
transient (wasting resources creating database connections on every call).
Explicit lifetimes make these decisions deliberate, centralized, and
verifiable.

### TypeScript

```typescript
import { randomBytes } from "crypto";

function makeId(): string {
  return randomBytes(4).toString("hex");
}
```

**Walkthrough — new syntax.** `import { randomBytes } from "crypto"` —
Node.js's built-in `crypto` module provides cryptographic utilities.
`randomBytes(4)` generates 4 random bytes; `.toString("hex")` converts
them to an 8-character hexadecimal string — the TypeScript equivalent of
Python's `str(uuid.uuid4())[:8]`. This is a **named import** from a
module: `{ randomBytes }` extracts just that one function from the module,
rather than importing the whole module.

```typescript
type Lifetime = "singleton" | "scoped" | "transient";
type FactoryFn<T> = (container: LifetimeContainer) => T;

class LifetimeContainer {
  private singletons:  Map<string, unknown> = new Map();
  private scopedCache: Map<string, unknown> = new Map();
  private factories:   Map<string, { factory: FactoryFn<unknown>; lifetime: Lifetime }> = new Map();

  register<T>(name: string, factory: FactoryFn<T>, lifetime: Lifetime = "transient"): void {
    this.factories.set(name, { factory: factory as FactoryFn<unknown>, lifetime });
  }

  beginScope(): void {
    this.scopedCache = new Map();
    console.log("  [Container] New scope started");
  }

  resolve<T>(name: string): T {
    const entry = this.factories.get(name);
    if (!entry) throw new Error(`No registration for '${name}'`);
    const { factory, lifetime } = entry;

    if (lifetime === "singleton") {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, factory(this));
        console.log(`  [Container] Created singleton '${name}'`);
      }
      return this.singletons.get(name) as T;
    }

    if (lifetime === "scoped") {
      if (!this.scopedCache.has(name)) {
        this.scopedCache.set(name, factory(this));
        console.log(`  [Container] Created scoped '${name}'`);
      }
      return this.scopedCache.get(name) as T;
    }

    const instance = factory(this);
    console.log(`  [Container] Created transient '${name}'`);
    return instance as T;
  }
}
```

**Walkthrough:** `type Lifetime = "singleton" | "scoped" | "transient"` —
a string literal union type (from TypeScript Prereq 02) that restricts
the `lifetime` parameter to exactly those three strings. Any other string
is a compile error. This is stricter than Python's approach of accepting
any string and only discovering a typo at runtime when the `if` chain
falls through to the wrong behavior.

```typescript
class DatabaseConnection {
  id = makeId();
  query(sql: string): string { return `[DB:${this.id}] Result of: ${sql}`; }
}

class RequestLogger {
  id = makeId();
  log(message: string): void { console.log(`  [Logger:${this.id}] ${message}`); }
}

class RequestContext {
  id = makeId();
  getUser(): string { return `user-${this.id}`; }
}

class BusinessService {
  constructor(
    private db:      DatabaseConnection,
    private logger:  RequestLogger,
    private context: RequestContext
  ) {}

  doWork(action: string): string {
    const user   = this.context.getUser();
    const result = this.db.query(`SELECT * FROM ${action} WHERE user='${user}'`);
    this.logger.log(`${user} performed ${action}: ${result}`);
    return result;
  }
}

const container = new LifetimeContainer();

container.register("database",
  () => new DatabaseConnection(),
  "singleton"
);
container.register("logger",
  () => new RequestLogger(),
  "scoped"
);
container.register("context",
  () => new RequestContext(),
  "scoped"
);
container.register("service",
  (c) => new BusinessService(
    c.resolve<DatabaseConnection>("database"),
    c.resolve<RequestLogger>("logger"),
    c.resolve<RequestContext>("context")
  ),
  "transient"
);

console.log("=== Request 1 ===");
container.beginScope();
const service1a = container.resolve<BusinessService>("service");
const service1b = container.resolve<BusinessService>("service");
service1a.doWork("orders");
service1b.doWork("products");

const dbId    = container.resolve<DatabaseConnection>("database").id;
const logId   = (service1a as any)["logger"].id;
const logIdB  = (service1b as any)["logger"].id;
console.log(`\n  DB instance:      same across both services? ${dbId === dbId}`);
console.log(`  Logger instance:  same within request? ${logId === logIdB}`);

console.log("\n=== Request 2 ===");
container.beginScope();
const service2 = container.resolve<BusinessService>("service");
service2.doWork("inventory");

const logIdR2 = (service2 as any)["logger"].id;
console.log(`\n  Logger same as request 1? ${logId === logIdR2}`);
console.log(`  DB same as request 1?     ${container.resolve<DatabaseConnection>("database").id === dbId}`);
```

```
=== Request 1 ===
  [Container] New scope started
  [Container] Created singleton 'database'
  [Container] Created scoped 'logger'
  [Container] Created scoped 'context'
  [Container] Created transient 'service'
  [Container] Created transient 'service'
  [Logger:...] user-... performed orders: [DB:...] Result of: SELECT * FROM orders WHERE user='user-...'
  [Logger:...] user-... performed products: [DB:...] Result of: SELECT * FROM products WHERE user='user-...'

  DB instance:      same across both services? true
  Logger instance:  same within request? true

=== Request 2 ===
  [Container] New scope started
  [Container] Created scoped 'logger'
  [Container] Created scoped 'context'
  [Container] Created transient 'service'
  [Logger:...] user-... performed inventory: [DB:...] Result of: SELECT * FROM inventory WHERE user='user-...'

  Logger same as request 1? false
  DB same as request 1?     true
```

---

## Concept 2: Service Locator

A **Service Locator** is an object that acts as a central registry: code
asks it for a service by name or type, and it returns the instance. On
the surface this looks similar to an IoC Container — but the difference
in *how* it's used makes it either a useful tool or a damaging
anti-pattern.

### Python — the useful form

A Service Locator used only at the application's outer boundary (close to
the Composition Root) is fine:

```python
class ServiceLocator:
    def __init__(self):
        self._services = {}

    def register(self, name, instance):
        self._services[name] = instance

    def get(self, name):
        if name not in self._services:
            raise KeyError(f"Service '{name}' not registered")
        return self._services[name]


class ReportService:
    def generate(self, report_type):
        return f"Report: {report_type}"


class ExportService:
    def export(self, data, fmt):
        return f"Exported '{data}' as {fmt}"


locator = ServiceLocator()
locator.register("reports", ReportService())
locator.register("exports", ExportService())

reports = locator.get("reports")
exports = locator.get("exports")

print(reports.generate("Q4 Summary"))
print(exports.export("Q4 Summary", "PDF"))
```

```
Report: Q4 Summary
Exported 'Q4 Summary' as PDF
```

**Walkthrough:** This is the Service Locator used at the boundary —
the locator is built and used close to where the program starts, and the
resolved services are then passed as injected dependencies into whatever
needs them. Used this way, it's essentially a simple IoC Container
without lifetime management — a useful shorthand for small programs that
don't need the full container machinery.

### Python — the anti-pattern form

The Service Locator becomes an anti-pattern when it's injected into
business logic classes, which then call `locator.get(...)` themselves:

```python
class OrderService:
    def __init__(self, locator):
        self._locator = locator

    def process_order(self, order_id):
        reports = self._locator.get("reports")
        exports = self._locator.get("exports")
        report  = reports.generate(f"Order {order_id}")
        result  = exports.export(report, "PDF")
        print(f"  Processed: {result}")
        return result


locator = ServiceLocator()
locator.register("reports", ReportService())
locator.register("exports", ExportService())

order_service = OrderService(locator)
order_service.process_order("ORD-001")
```

```
  Processed: Exported 'Report: Order ORD-001' as PDF
```

**Walkthrough — why this is the anti-pattern.** `OrderService` looks like
it takes one dependency: a `locator`. But actually it depends on
`ReportService` and `ExportService` — dependencies that are hidden inside
the locator call. You can't discover what `OrderService` truly depends on
without reading its implementation. Testing `OrderService` in isolation
means constructing a locator with mock services — which is more complex
than simply passing mock services as constructor arguments. The Service
Locator is acting as a hidden dependency bag. Compare: if `OrderService`
were written with proper DI:

```python
class OrderServiceDI:
    def __init__(self, reports, exports):
        self._reports = reports
        self._exports = exports

    def process_order(self, order_id):
        report = self._reports.generate(f"Order {order_id}")
        result = self._exports.export(report, "PDF")
        print(f"  Processed: {result}")
        return result


order_service_di = OrderServiceDI(ReportService(), ExportService())
order_service_di.process_order("ORD-002")
```

```
  Processed: Exported 'Report: Order ORD-002' as PDF
```

**Walkthrough:** Same output, but now `OrderServiceDI.__init__` signature
tells you *exactly* what it needs — `reports` and `exports` — with no
implementation reading required. Testing means passing mock objects
directly. This is the DI version; the locator version hides the same
information.

**CS lens — why "anti-pattern" specifically.** The term anti-pattern names
a solution that *seems* reasonable and *does* work, but consistently causes
more problems than it solves. Service Locator works — the code runs. The
problem is structural: it violates the **explicit dependencies principle**
(a class's dependencies should be visible in its constructor or method
signatures) and makes the code harder to test, refactor, and understand.
The pattern was identified as harmful specifically in the context of
dependency injection — the locator provides the same service resolution
but hides what's actually being resolved.

**SE lens — when is it acceptable?** Framework code and plugin systems
sometimes genuinely need a Service Locator — when the exact services
needed aren't known until runtime, or when a plugin must ask the host
application for services by name. In those specific cases, a Service
Locator is the right tool. The anti-pattern version is using it in
ordinary business logic to avoid the discipline of declaring dependencies
explicitly.

**What breaks without understanding this distinction:** Teams that start
with a Service Locator "for convenience" often end up with it everywhere
— every class takes a locator, hides its real dependencies behind locator
calls, and the codebase becomes progressively harder to test and refactor
because nothing is explicit. This is one of the most common ways a
nominally "DI-based" system ends up with all the downsides of global
state and none of the benefits of DI.

### TypeScript

```typescript
class ServiceLocator {
  private services: Map<string, unknown> = new Map();

  register<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  get<T>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not registered`);
    }
    return this.services.get(name) as T;
  }
}

class ReportService {
  generate(reportType: string): string {
    return `Report: ${reportType}`;
  }
}

class ExportService {
  export(data: string, fmt: string): string {
    return `Exported '${data}' as ${fmt}`;
  }
}

const locator = new ServiceLocator();
locator.register("reports", new ReportService());
locator.register("exports", new ExportService());

const reports = locator.get<ReportService>("reports");
const exportsService = locator.get<ExportService>("exports");

console.log(reports.generate("Q4 Summary"));
console.log(exportsService.export("Q4 Summary", "PDF"));

console.log("\n--- Anti-pattern form ---");

class OrderService {
  constructor(private locator: ServiceLocator) {}

  processOrder(orderId: string): string {
    const rpts = this.locator.get<ReportService>("reports");
    const exps = this.locator.get<ExportService>("exports");
    const report = rpts.generate(`Order ${orderId}`);
    const result = exps.export(report, "PDF");
    console.log(`  Processed: ${result}`);
    return result;
  }
}

const orderService = new OrderService(locator);
orderService.processOrder("ORD-001");

console.log("\n--- DI form (preferred) ---");

class OrderServiceDI {
  constructor(
    private reportService: ReportService,
    private exportService: ExportService
  ) {}

  processOrder(orderId: string): string {
    const report = this.reportService.generate(`Order ${orderId}`);
    const result = this.exportService.export(report, "PDF");
    console.log(`  Processed: ${result}`);
    return result;
  }
}

const orderServiceDI = new OrderServiceDI(new ReportService(), new ExportService());
orderServiceDI.processOrder("ORD-002");
```

```
Report: Q4 Summary
Exported 'Q4 Summary' as PDF

--- Anti-pattern form ---
  Processed: Exported 'Report: Order ORD-001' as PDF

--- DI form (preferred) ---
  Processed: Exported 'Report: Order ORD-002' as PDF
```

---

## Connect the pieces

**Lifetimes** and **Service Locator** are both vocabulary from the DI
ecosystem — both covered in the same glossary source as Glossary 15's
Dependency Injection and IoC Container, and both make most sense in
that context.

Lifetimes answer "how long does an instance live, and who shares it?" —
Singleton (forever, everyone), Scoped (one request, that request's
consumers), Transient (not shared, new every time). Getting lifetimes
right is what separates a DI container used correctly from one that
introduces subtle concurrency bugs (sharing scoped state across requests)
or wastes resources (creating expensive objects over and over as
transients).

Service Locator is the pattern that looks like DI's cousin but is really
its shadow: it resolves services the same way a container does, but when
injected into business logic, it hides dependencies rather than making
them explicit. The useful form (at the composition boundary) is just a
simple container. The anti-pattern form (inside business logic) is global
state with extra steps — all the problems of global variables, none of the
benefits of DI.

## What breaks without understanding lifetimes

Registering a database transaction or a per-request user context as a
singleton shares that state across all concurrent requests — two requests
running simultaneously see each other's data, a classic and serious
concurrency bug. Registering a connection pool as transient creates a new
pool for every object that needs one, defeating the purpose of pooling
entirely and potentially exhausting database connections.

## Definition of done

- [ ] You can explain the three lifetimes in your own words and give a
      real-world example of an object that belongs to each.
- [ ] You can explain why sharing a scoped instance across requests is a
      concurrency bug.
- [ ] You can explain the difference between Service Locator used at the
      composition boundary (acceptable) and Service Locator injected into
      business logic (anti-pattern) — specifically what information is
      hidden in the anti-pattern case.
- [ ] You've run both examples in Python and TypeScript and confirmed
      matching structural output (exact UUIDs will differ).
- [ ] You can read `type Lifetime = "singleton" | "scoped" | "transient"`
      and explain why this is stronger than Python's equivalent `lifetime`
      string parameter.
