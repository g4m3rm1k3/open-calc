---
concept: 022-dependency-injection
name: Dependency Injection
---

## Definition

Dependency Injection is a way of supplying an object with the things it needs (its
dependencies), instead of letting that object create those things itself.

## Problem

A class that creates its own dependencies internally (`new Database()` right
inside a constructor) is locked to that exact dependency — there's no way to swap
in a test double, or a different implementation, without editing the class
itself. Injecting the dependency from outside removes that lock.

## Execution

Program starts
↓
Container/caller creates a Logger instance
↓
Container/caller creates a Database instance
↓
Container/caller creates UserService, passing in the Logger and Database
↓
UserService's constructor stores both as its own fields — never creates them itself
↓
Object graph complete — UserService is ready to use, and either dependency could
have been a different implementation with no change to UserService's own code

## Computer Science

This is best understood through **object graphs**: the network of objects
referencing each other that a running program builds up. Dependency Injection is
about *who constructs that graph* — the object itself, or something external to it
— and injection always means "external."

Tags: Object graphs, Composition, Inversion of control

## Software Engineering

The direct payoff is testability: a `UserService` that receives its `Database`
from outside can be given a fake, in-memory database in a test, and a real one in
production, with zero changes to `UserService` itself. This is also called
**dependency inversion** — the class depends on an abstraction (an interface), not
a concrete implementation it constructed itself.

Tags: Testability, Loose coupling, Composition root, Inversion of control

## Common Mistakes

- Constructing a dependency inside a class and calling it "injection" because the dependency is stored in a field — if the class creates it with `new`, nothing has actually been injected; it's still tightly coupled to that exact concrete type.
- Injecting so many dependencies into one class that its constructor becomes a long list of parameters — often a sign the class is doing too much and should be split (see the Function concept's Single Responsibility idea, which applies to classes too).

## Exercises

- In the TypeScript example, write a `FakeDatabase` class implementing the same interface and pass it into `UserService` instead of the real one, with no changes to `UserService`.
- In Python, remove the type hint from `__init__` and confirm the code still runs the same — Python doesn't enforce the interface at all, unlike TypeScript.

## typescript

```typescript
interface Database {
  save(data: string): void
}

class UserService {
  constructor(private db: Database) {}   // injected, not constructed internally
  createUser(name: string) {
    this.db.save(name)
  }
}

class RealDatabase implements Database {
  save(data: string) { console.log('Saved:', data) }
}

const service = new UserService(new RealDatabase())
service.createUser('Alice')
```
Walkthrough: `UserService`'s constructor receives a `Database`, it never creates
one itself. `new UserService(new RealDatabase())` is where the injection actually
happens — the caller decides which concrete `Database` implementation to hand
over, and `UserService` never needed to know which one it would get.

## python

```python
class UserService:
    def __init__(self, db):   # injected — the dependency is passed in, not created here
        self.db = db

    def create_user(self, name):
        self.db.save(name)

class RealDatabase:
    def save(self, data):
        print('Saved:', data)

service = UserService(RealDatabase())
service.create_user('Alice')
```
Walkthrough: identical shape to the TypeScript version — `__init__` receives `db`
as a parameter rather than constructing it, and the caller supplies the concrete
implementation. Python has no interface to formally declare here (see the
Interface concept) — any object with a `.save()` method works, checked only at
the moment it's actually called.

## java

```java
interface Database {
    void save(String data);
}

class UserService {
    private final Database db;
    UserService(Database db) { this.db = db; }   // injected via constructor
    void createUser(String name) { db.save(name); }
}

class RealDatabase implements Database {
    public void save(String data) { System.out.println("Saved: " + data); }
}

UserService service = new UserService(new RealDatabase());
service.createUser("Alice");
```
Walkthrough: same constructor-injection pattern, with Java's interface providing a
compile-time guarantee (see the Interface concept) that whatever is passed to
`UserService`'s constructor really does have a `save(String)` method — checked
before the program runs, unlike Python's version.
