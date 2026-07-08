# Dependency Injection: DI, IoC Container, Composition Root

## What you will build

Three runnable programs — one per concept — in both Python and TypeScript,
showing how to make dependencies explicit and swappable rather than
hard-coded and hidden, how a container can manage the wiring of those
dependencies automatically, and where in a program that wiring should
happen. By the end you'll understand why Dependency Injection is one of
the most important ideas in software design, and exactly why the Singleton
pattern from Glossary 11 is so often cited as something DI replaces.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. That said, DI is closely related to the Singleton (Glossary 11),
the Repository (Glossary 06), and the Factory (Glossary 02) — those
connections are named below where they appear.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Dependency Injection

A **dependency** is anything an object needs in order to do its job — a
database connection, a logger, an email service, a configuration object.
**Dependency Injection** (DI) means providing those dependencies from
outside the object rather than letting the object create or find them
itself.

### Problem first — the hard-coded dependency

```python
class EmailService:
    def send(self, recipient, message):
        print(f"  [Email] Sending to {recipient}: '{message}'")


class UserService:
    def __init__(self):
        self._email_service = EmailService()

    def register_user(self, username, email):
        print(f"  [User] Registering {username}...")
        self._email_service.send(email, f"Welcome, {username}!")
        print(f"  [User] {username} registered.")
```

**Walkthrough:** `UserService.__init__` creates its own `EmailService` —
this is the problem. `UserService` is tightly coupled to `EmailService`
specifically. You cannot test `UserService` without also running
`EmailService`. You cannot swap `EmailService` for an `SmsService` or a
`MockEmailService` without editing `UserService` itself. The dependency
is hidden inside the constructor — callers of `UserService` have no idea
it uses email at all.

```python
service = UserService()
service.register_user("alice", "alice@example.com")
```

```
  [User] Registering alice...
  [Email] Sending to alice@example.com: 'Welcome, alice!'
  [User] alice registered.
```

This works but is inflexible. Now compare with DI:

### Python — injecting the dependency

```python
class SmsService:
    def send(self, recipient, message):
        print(f"  [SMS] Sending to {recipient}: '{message}'")


class MockNotificationService:
    def __init__(self):
        self.sent_messages = []

    def send(self, recipient, message):
        self.sent_messages.append((recipient, message))
        print(f"  [Mock] Recorded message to {recipient}: '{message}'")


class UserServiceWithDI:
    def __init__(self, notification_service):
        self._notification_service = notification_service

    def register_user(self, username, email):
        print(f"  [User] Registering {username}...")
        self._notification_service.send(email, f"Welcome, {username}!")
        print(f"  [User] {username} registered.")
```

**Walkthrough:** `UserServiceWithDI.__init__` receives its dependency as
a parameter rather than creating it. This single change — passing in the
dependency instead of constructing it internally — is the entire Dependency
Injection pattern. `UserServiceWithDI` now knows nothing about which
specific notification service it's using; it only knows it has something
with a `.send(recipient, message)` method. Any object with that method
will work — `EmailService`, `SmsService`, `MockNotificationService`, or
any future service you haven't written yet.

```python
print("=== Production: Email ===")
email_service = EmailService()
user_service  = UserServiceWithDI(email_service)
user_service.register_user("alice", "alice@example.com")

print("\n=== Production: SMS ===")
sms_service  = SmsService()
user_service = UserServiceWithDI(sms_service)
user_service.register_user("bob", "bob@example.com")

print("\n=== Test: Mock ===")
mock_service = MockNotificationService()
user_service = UserServiceWithDI(mock_service)
user_service.register_user("carol", "carol@example.com")
print(f"  Recorded: {mock_service.sent_messages}")
```

```
=== Production: Email ===
  [User] Registering alice...
  [Email] Sending to alice@example.com: 'Welcome, alice!'
  [User] alice registered.

=== Production: SMS ===
  [User] Registering bob...
  [SMS] Sending to bob@example.com: 'Welcome, bob!'
  [User] bob registered.

=== Test: Mock ===
  [User] Registering carol...
  [Mock] Recorded message to carol@example.com: 'Welcome, carol!'
  [User] carol registered.
  Recorded: [('carol@example.com', "Welcome, carol!")]
```

**Walkthrough:** Three different services, zero changes to
`UserServiceWithDI`. The mock lets a test verify exactly what was sent
without sending real emails. Swapping from email to SMS happens at the
call site, not inside the service itself.

**CS lens — inversion of control.** DI is a specific form of **Inversion
of Control** (IoC) — a broader principle that says high-level code should
not depend on or control low-level details. In the hard-coded version,
`UserService` controls what notification mechanism is used by creating
it. With DI, that control is *inverted*: the caller decides what
notification mechanism to use and provides it. This is the same inversion
seen in the Observer pattern (Glossary 03) — instead of the event source
reaching out to observers, observers register themselves. The mechanism
is different, but the structural principle ("control flows from the
outside in, not from the inside out") is the same.

**SE lens — testability as the killer argument.** The most immediately
practical benefit of DI is testability. A class with hard-coded
dependencies requires its entire dependency tree to be running before it
can be tested. A class with injected dependencies can be tested with mock
or fake versions of its dependencies — fast, deterministic, no network
or database required. In real systems with hundreds of classes, the
difference between "can be tested in isolation with mocks" and "requires
the real database" is often the difference between a test suite that runs
in 3 seconds and one that takes 20 minutes.

The connection to Singleton (Glossary 11): Singleton is often used to
make a single shared instance (of a database connection, a config object)
accessible throughout a program. DI replaces this need — instead of
every class reaching out to `Configuration.getInstance()`, the
configuration is injected into whatever needs it, making the dependency
visible in the function signature and replaceable in tests. This is why
modern software design increasingly prefers DI over Singleton.

**What breaks without this:** With hard-coded dependencies, any test for
`UserService` actually sends emails (or fails if the email server is
unreachable). Any change to which notification mechanism is used requires
finding and editing every class that hard-codes it. Any new environment
(staging vs production, one customer vs another) that needs different
behavior requires a different class rather than a different configuration.

### TypeScript

```typescript
interface NotificationService {
  send(recipient: string, message: string): void;
}

class EmailService implements NotificationService {
  send(recipient: string, message: string): void {
    console.log(`  [Email] Sending to ${recipient}: '${message}'`);
  }
}

class SmsService implements NotificationService {
  send(recipient: string, message: string): void {
    console.log(`  [SMS] Sending to ${recipient}: '${message}'`);
  }
}

class MockNotificationService implements NotificationService {
  sentMessages: Array<[string, string]> = [];

  send(recipient: string, message: string): void {
    this.sentMessages.push([recipient, message]);
    console.log(`  [Mock] Recorded message to ${recipient}: '${message}'`);
  }
}

class UserService {
  constructor(private notificationService: NotificationService) {}

  registerUser(username: string, email: string): void {
    console.log(`  [User] Registering ${username}...`);
    this.notificationService.send(email, `Welcome, ${username}!`);
    console.log(`  [User] ${username} registered.`);
  }
}
```

**Walkthrough — new syntax.** `interface NotificationService` makes
TypeScript's version of duck typing explicit: any class that satisfies
this interface (has a `send` method with these parameter types and return
type) can be used as a `NotificationService`. `Array<[string, string]>`
— an array where each element is a tuple of exactly two strings. This is
the typed equivalent of Python's list of `(str, str)` pairs. The
`private notificationService: NotificationService` constructor parameter
uses the constructor shorthand to declare and initialize the dependency
in one line — the entire DI pattern expressed in a single constructor
parameter.

```typescript
console.log("=== Production: Email ===");
const emailService = new EmailService();
let userService    = new UserService(emailService);
userService.registerUser("alice", "alice@example.com");

console.log("\n=== Production: SMS ===");
const smsService = new SmsService();
userService      = new UserService(smsService);
userService.registerUser("bob", "bob@example.com");

console.log("\n=== Test: Mock ===");
const mockService = new MockNotificationService();
userService       = new UserService(mockService);
userService.registerUser("carol", "carol@example.com");
console.log(`  Recorded: ${JSON.stringify(mockService.sentMessages)}`);
```

```
=== Production: Email ===
  [User] Registering alice...
  [Email] Sending to alice@example.com: 'Welcome, alice!'
  [User] alice registered.

=== Production: SMS ===
  [User] Registering bob...
  [SMS] Sending to bob@example.com: 'Welcome, bob!'
  [User] bob registered.

=== Test: Mock ===
  [User] Registering carol...
  [Mock] Recorded message to carol@example.com: 'Welcome, carol!'
  [User] carol registered.
  Recorded: [["carol@example.com","Welcome, carol!"]]
```

---

## Concept 2: IoC Container

In a real system, you might have dozens of classes each with multiple
dependencies. Manually wiring them all at program startup becomes
repetitive:

```python
database      = Database(config.connection_string)
email_service = EmailService(config.smtp_host)
user_repo     = UserRepository(database)
order_repo    = OrderRepository(database)
user_service  = UserService(user_repo, email_service)
order_service = OrderService(order_repo, user_service)
```

An **IoC Container** (Inversion of Control Container, sometimes called
a DI Container) automates this wiring. You register types and their
dependencies with the container; when you ask the container for an
instance, it figures out the construction order, creates each dependency,
and assembles the full object graph for you.

### Python

```python
class SimpleContainer:
    def __init__(self):
        self._factories = {}
        self._singletons = {}

    def register(self, name, factory, singleton=False):
        self._factories[name] = (factory, singleton)

    def resolve(self, name):
        if name not in self._factories:
            raise KeyError(f"No registration found for '{name}'")

        factory, is_singleton = self._factories[name]

        if is_singleton:
            if name not in self._singletons:
                self._singletons[name] = factory(self)
            return self._singletons[name]

        return factory(self)
```

**Walkthrough:** `self._factories` maps a name to a `(factory, singleton)`
pair. `factory` is a function that takes the container itself and returns
a new instance — the container is passed in so the factory can resolve
its own dependencies from the same container. `is_singleton` controls
whether the container caches and reuses the instance (singleton lifetime)
or creates a fresh one every time (transient lifetime — covered more fully
in Glossary 16). `resolve` looks up the registration, checks whether a
cached singleton exists, and either returns the cached instance or calls
the factory to create a new one.

```python
class LogService:
    def log(self, message):
        print(f"  [Log] {message}")


class ProductRepository:
    def __init__(self, logger):
        self._logger = logger

    def find(self, product_id):
        self._logger.log(f"Finding product {product_id}")
        return {"id": product_id, "name": f"Product-{product_id}", "price": 9.99}


class OrderProcessor:
    def __init__(self, product_repo, logger):
        self._product_repo = product_repo
        self._logger       = logger

    def process(self, product_id, quantity):
        product = self._product_repo.find(product_id)
        total   = product["price"] * quantity
        self._logger.log(f"Processing order: {quantity}x {product['name']} = ${total:.2f}")
        return total


container = SimpleContainer()

container.register("logger",
    lambda c: LogService(),
    singleton=True)

container.register("product_repo",
    lambda c: ProductRepository(c.resolve("logger")),
    singleton=True)

container.register("order_processor",
    lambda c: OrderProcessor(
        c.resolve("product_repo"),
        c.resolve("logger")
    ))

print("Resolving order processor:")
processor = container.resolve("order_processor")
total = processor.process(42, 3)
print(f"  Order total: ${total:.2f}")

print("\nVerifying logger singleton:")
logger1 = container.resolve("logger")
logger2 = container.resolve("logger")
print(f"  Same logger instance? {logger1 is logger2}")
```

```
Resolving order processor:
  [Log] Finding product 42
  [Log] Processing order: 3x Product-42 = $29.97
  Order total: $29.97

Verifying logger singleton:
  Same logger instance? True
```

**Walkthrough:** `lambda c: LogService()` is an anonymous function (a
lambda) that takes the container `c` and creates a `LogService` — the
container calls this whenever it needs a logger. `lambda c:
ProductRepository(c.resolve("logger"))` creates a `ProductRepository`,
asking the container for the logger it needs. When `resolve("logger")` is
called for the first time, the factory runs and the result is cached in
`_singletons`. On the second call (from `verify logger singleton`),
the cached instance is returned — `logger1 is logger2` confirms they're
the same object. `OrderProcessor` is registered without `singleton=True`,
so each `resolve("order_processor")` call creates a fresh instance.

**CS lens — the object graph.** The container is managing an **object
graph** — a network of objects connected by their dependencies. Each
node is an object; each edge is a dependency. The container performs a
**topological sort** of this graph implicitly: it must create a `LogService`
before a `ProductRepository` (because `ProductRepository` needs one), and
both before an `OrderProcessor`. In small programs, you do this manually.
In large programs with hundreds of services, the container handles the
ordering automatically.

**SE lens.** Real IoC containers — Python's `dependency-injector`, Java's
Spring, C#'s ASP.NET Core's built-in DI, TypeScript's InversifyJS —
do much more than this minimal example: they support constructor injection
automatically (reading constructor parameters to determine what to inject),
multiple lifetime scopes, decorators for registration, and integration
with web framework request lifecycles. The core idea, however, is exactly
what this example shows: register types and their dependencies; ask for
what you need; the container figures out the wiring.

**What breaks without this:** In large systems, the manual wiring of
dozens of services (creating each in the right order, passing the right
instances to the right constructors) becomes a significant maintenance
burden — every new dependency added to any class requires finding the
manual wiring code and updating it. The container centralizes and
automates this, so adding a new dependency to a class doesn't require
touching any code outside that class.

### TypeScript

```typescript
type Factory<T> = (container: Container) => T;

class Container {
  private factories: Map<string, { factory: Factory<unknown>; singleton: boolean }> = new Map();
  private singletonCache: Map<string, unknown> = new Map();

  register<T>(name: string, factory: Factory<T>, singleton = false): void {
    this.factories.set(name, { factory: factory as Factory<unknown>, singleton });
  }

  resolve<T>(name: string): T {
    const registration = this.factories.get(name);
    if (!registration) {
      throw new Error(`No registration found for '${name}'`);
    }

    const { factory, singleton } = registration;

    if (singleton) {
      if (!this.singletonCache.has(name)) {
        this.singletonCache.set(name, factory(this));
      }
      return this.singletonCache.get(name) as T;
    }

    return factory(this) as T;
  }
}
```

**Walkthrough — new syntax.** `type Factory<T> = (container: Container)
=> T` — a generic type alias for a factory function: takes a `Container`
and returns a value of type `T`. `Map<string, { factory: Factory<unknown>;
singleton: boolean }>` — a `Map` where each value is an object literal
with two properties. `unknown` is used here because the container stores
factories for any type — we don't know at registration time what type
each factory produces. `factory as Factory<unknown>` is a **type
assertion** (`as` from Glossary 14's Interpreter section): widening the
specific `Factory<T>` to the less specific `Factory<unknown>` for
storage. `return this.singletonCache.get(name) as T` — another `as`
assertion: the cache stores `unknown`, and we assert it's actually `T`
when retrieving it, trusting that the caller asked for the correct type.

```typescript
class LogService {
  log(message: string): void {
    console.log(`  [Log] ${message}`);
  }
}

class ProductRepository {
  constructor(private logger: LogService) {}

  find(productId: number): { id: number; name: string; price: number } {
    this.logger.log(`Finding product ${productId}`);
    return { id: productId, name: `Product-${productId}`, price: 9.99 };
  }
}

class OrderProcessor {
  constructor(
    private productRepo: ProductRepository,
    private logger: LogService
  ) {}

  process(productId: number, quantity: number): number {
    const product = this.productRepo.find(productId);
    const total   = product.price * quantity;
    this.logger.log(`Processing order: ${quantity}x ${product.name} = $${total.toFixed(2)}`);
    return total;
  }
}

const container = new Container();

container.register<LogService>("logger",
  () => new LogService(),
  true
);

container.register<ProductRepository>("productRepo",
  (c) => new ProductRepository(c.resolve<LogService>("logger")),
  true
);

container.register<OrderProcessor>("orderProcessor",
  (c) => new OrderProcessor(
    c.resolve<ProductRepository>("productRepo"),
    c.resolve<LogService>("logger")
  )
);

console.log("Resolving order processor:");
const processor = container.resolve<OrderProcessor>("orderProcessor");
const total     = processor.process(42, 3);
console.log(`  Order total: $${total.toFixed(2)}`);

console.log("\nVerifying logger singleton:");
const logger1 = container.resolve<LogService>("logger");
const logger2 = container.resolve<LogService>("logger");
console.log(`  Same logger instance? ${logger1 === logger2}`);
```

```
Resolving order processor:
  [Log] Finding product 42
  [Log] Processing order: 3x Product-42 = $29.97
  Order total: $29.97

Verifying logger singleton:
  Same logger instance? true
```

---

## Concept 3: Composition Root

The **Composition Root** is the single place in an application where all
dependencies are wired together. It's where you create the container,
register everything, and resolve the top-level object that kicks off the
program. Everything outside the Composition Root uses Dependency Injection
— it receives its dependencies, never creating or locating them itself.

The Composition Root is important because it answers "where does the
wiring happen?" The answer should be: in one place, at program startup,
and nowhere else.

### Python

```python
class AppConfig:
    def __init__(self, environment):
        self.environment = environment
        self.log_level   = "DEBUG" if environment == "development" else "INFO"
        self.smtp_host   = "localhost" if environment == "development" else "smtp.example.com"

    def __repr__(self):
        return f"AppConfig(env={self.environment}, log_level={self.log_level})"


class ProductionLogger:
    def __init__(self, log_level):
        self._log_level = log_level

    def log(self, message):
        print(f"  [{self._log_level}] {message}")


class NotificationSender:
    def __init__(self, smtp_host):
        self._smtp_host = smtp_host

    def notify(self, user, message):
        print(f"  [SMTP:{self._smtp_host}] Notifying {user}: '{message}'")


class ApplicationService:
    def __init__(self, logger, notifier):
        self._logger   = logger
        self._notifier = notifier

    def run(self, user):
        self._logger.log(f"Application starting for {user}")
        self._notifier.notify(user, "Your session has started")
        self._logger.log(f"Application ready")


def compose_application(environment):
    print(f"[Composition Root] Building {environment} application...")

    config = AppConfig(environment)
    print(f"  Config: {config}")

    logger   = ProductionLogger(config.log_level)
    notifier = NotificationSender(config.smtp_host)
    app      = ApplicationService(logger, notifier)

    print(f"[Composition Root] Application ready.\n")
    return app


print("=== Development ===")
dev_app = compose_application("development")
dev_app.run("alice")

print("\n=== Production ===")
prod_app = compose_application("production")
prod_app.run("alice")
```

```
=== Development ===
[Composition Root] Building development application...
  Config: AppConfig(env=development, log_level=DEBUG)
[Composition Root] Application ready.

  [DEBUG] Application starting for alice
  [SMTP:localhost] Notifying alice: 'Your session has started'
  [DEBUG] Application ready

=== Production ===
[Composition Root] Building production application...
  Config: AppConfig(env=production, log_level=INFO)
[Composition Root] Application ready.

  [INFO] Application starting for alice
  [SMTP:smtp.example.com] Notifying alice: 'Your session has started'
  [INFO] Application ready
```

**Walkthrough:** `compose_application` is the Composition Root — it reads
configuration, creates every concrete dependency, and assembles the final
`ApplicationService`. `ApplicationService` itself knows nothing about
`AppConfig`, nothing about `smtp.example.com`, nothing about log levels —
it only knows it has a logger and a notifier. Switching from development
to production wiring requires changing only the Composition Root, not any
business logic class. The same `ApplicationService` code runs correctly
in both environments because its dependencies are injected, not hard-coded.

**CS lens — the only place `new` should appear.** A useful rule of thumb
for DI: `new SomeConcreteThing()` should appear only in the Composition
Root (or in factories registered with a container). Everywhere else in
the codebase — in services, repositories, handlers — dependencies should
arrive via constructor parameters. If you see `new EmailService()` inside
a business logic class, that's a sign a dependency is being created where
it should be injected. This rule, applied consistently, is what gives DI
its power: every dependency is visible, every dependency is swappable,
and the Composition Root is the single authoritative map of what the
application is actually made of.

**SE lens.** In a web application, the Composition Root is typically
the application's entry point (`app.py`, `main.ts`, `Program.cs`) — the
file that runs when the server starts. Frameworks like ASP.NET Core,
Spring Boot, and NestJS make the Composition Root explicit and structured,
providing conventions for where registrations go and how the container
is built. In a command-line application, it's the `main()` function. The
principle: one place, at startup, before any request is processed.

**What breaks without this:** Without a clear Composition Root, wiring
logic scatters throughout the application — services create their own
dependencies, some classes use the container directly (the Service
Locator anti-pattern, covered in Glossary 16), and the application's
structure becomes implicit rather than explicit. Finding out exactly what
an application is made of requires reading dozens of files rather than
one Composition Root.

### TypeScript

```typescript
interface Logger {
  log(message: string): void;
}

interface Notifier {
  notify(user: string, message: string): void;
}

class AppConfig {
  logLevel: string;
  smtpHost: string;

  constructor(public environment: string) {
    this.logLevel = environment === "development" ? "DEBUG" : "INFO";
    this.smtpHost = environment === "development" ? "localhost" : "smtp.example.com";
  }

  toString(): string {
    return `AppConfig(env=${this.environment}, log_level=${this.logLevel})`;
  }
}

class ProductionLogger implements Logger {
  constructor(private logLevel: string) {}
  log(message: string): void {
    console.log(`  [${this.logLevel}] ${message}`);
  }
}

class NotificationSender implements Notifier {
  constructor(private smtpHost: string) {}
  notify(user: string, message: string): void {
    console.log(`  [SMTP:${this.smtpHost}] Notifying ${user}: '${message}'`);
  }
}

class ApplicationService {
  constructor(
    private logger: Logger,
    private notifier: Notifier
  ) {}

  run(user: string): void {
    this.logger.log(`Application starting for ${user}`);
    this.notifier.notify(user, "Your session has started");
    this.logger.log("Application ready");
  }
}

function composeApplication(environment: string): ApplicationService {
  console.log(`[Composition Root] Building ${environment} application...`);

  const config   = new AppConfig(environment);
  console.log(`  Config: ${config}`);

  const logger   = new ProductionLogger(config.logLevel);
  const notifier = new NotificationSender(config.smtpHost);
  const app      = new ApplicationService(logger, notifier);

  console.log(`[Composition Root] Application ready.\n`);
  return app;
}

console.log("=== Development ===");
const devApp = composeApplication("development");
devApp.run("alice");

console.log("\n=== Production ===");
const prodApp = composeApplication("production");
prodApp.run("alice");
```

```
=== Development ===
[Composition Root] Building development application...
  Config: AppConfig(env=development, log_level=DEBUG)
[Composition Root] Application ready.

  [DEBUG] Application starting for alice
  [SMTP:localhost] Notifying alice: 'Your session has started'
  [DEBUG] Application ready

=== Production ===
[Composition Root] Building production application...
  Config: AppConfig(env=production, log_level=INFO)
[Composition Root] Application ready.

  [INFO] Application starting for alice
  [SMTP:smtp.example.com] Notifying alice: 'Your session has started'
  [INFO] Application ready
```

**Walkthrough:** `Logger` and `Notifier` interfaces (rather than concrete
classes) appear in `ApplicationService`'s constructor — this is the key
TypeScript idiom for DI. `ApplicationService` depends on abstractions, not
concretions (recall this principle from Glossary 04's Abstract Factory
section: **dependency inversion** — high-level code should depend on
interfaces, not on specific implementations). The compiler enforces that
`ProductionLogger` actually satisfies `Logger` and `NotificationSender`
satisfies `Notifier`, before the program runs.

---

## Connect the pieces

**Dependency Injection**, **IoC Container**, and **Composition Root** are
three layers of the same idea, each building on the previous.

DI is the foundational practice: pass dependencies in rather than creating
them internally. This makes dependencies visible, testable, and swappable.

An IoC Container is an automation tool that manages the creation and
wiring of many dependencies, so you don't have to manually orchestrate
the construction order and dependency resolution for dozens of classes.

The Composition Root is the answer to "where does the wiring happen?" —
one place, at startup, using the container (or manual wiring for small
programs), producing the fully assembled application. Everything outside
the Composition Root is ignorant of concrete implementations.

Together, these three concepts are the foundation of how large, maintainable
applications are structured. The Singleton pattern from Glossary 11 is
a simpler answer to the same underlying need ("I need this shared resource
accessible everywhere") — DI is the more powerful, more testable, and more
explicit replacement. The Repository pattern from Glossary 06 is a natural
DI target: instead of a service creating `UserRepository()` internally, the
repository is injected, and tests can inject a fake repository that returns
controlled data without touching a database.

In TypeScript, interfaces made the injectable contracts explicit and
compiler-checked. The container's generic `resolve<T>()` method let callers
request a specific type and get it back correctly typed, without type
assertions at every call site.

## What breaks without these patterns

Without DI, testing any class requires the real versions of all its
dependencies — databases, email servers, external APIs — making tests
slow, unreliable, and environment-dependent. Without a clear Composition
Root, wiring logic scatters through the codebase, making it impossible
to read the application's structure in one place. Without an IoC
Container (in large systems), manual wiring becomes a sprawling,
error-prone maintenance burden that must be updated every time any class's
dependencies change.

## Definition of done

- [ ] You can explain the difference between the hard-coded dependency
      version and the DI version in your own words — specifically what
      changed and what became possible as a result.
- [ ] You can explain why the mock notification service makes testing
      `UserService` independent of real email sending.
- [ ] You can explain what an IoC Container does — specifically what
      "register" and "resolve" mean in your own words.
- [ ] You can explain what the Composition Root is, why there should be
      only one, and what the rule of thumb about `new` tells you about
      whether code is following DI correctly.
- [ ] You've run all three examples in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain how DI makes the Singleton pattern from Glossary 11
      largely unnecessary in a well-designed system.
