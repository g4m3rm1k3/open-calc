---
concept: 021-interface
name: Interface
---

## Definition

An interface declares a set of methods a class promises to implement, without
providing any implementation itself — it's a contract about *what* a class can
do, not *how* it does it.

## Problem

Code that needs to work with "anything that can be saved to storage" shouldn't
have to know or care whether that's a database, a file, or a network service —
it just needs a guarantee that whatever it's given has a `save()` method it can
call. An interface is exactly that guarantee, with nothing else attached.

## Computer Science

An interface has no state and (in most languages) no method bodies — it's purely
a type describing a set of method signatures. Any class that implements it can be
used anywhere the interface type is expected (see Polymorphism), regardless of
what other class hierarchy that implementing class belongs to.

Tags: Contracts, Type signatures, Structural vs nominal typing, Dynamic dispatch

## Software Engineering

Depending on an interface instead of a concrete class is what makes code testable
and swappable — a function that accepts "anything implementing `Logger`" can be
given a real file logger in production and a fake, silent one in tests, without
changing the function itself at all.

Tags: Dependency inversion, Testability, Mocking

## Common Mistakes

- Creating an interface with only one implementation and no real plan for a second one — sometimes justified for testability alone, but often just unnecessary indirection with no actual benefit yet.
- Putting fields (stored data) on an interface where the language allows it, defeating the point of an interface being a pure contract with no state of its own.

## Exercises

- In the Java example, add a second class implementing `Logger` (e.g. `SilentLogger`, whose `log` does nothing) and swap it into `run` without changing `run` itself.
- In Python, remove the `log` method from `FileLogger` and observe what actually happens when `run` calls it — compare that to what the TypeScript version does in the same situation.

## typescript

```typescript
interface Logger {
  log(message: string): void
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message) }
}

function run(logger: Logger) {
  logger.log('Task started')
}

run(new ConsoleLogger())
```
Walkthrough: `interface Logger` declares the contract — anything passed to `run`
must have a `log(message: string)` method. `ConsoleLogger implements Logger` is
checked by the compiler at compile time — if `ConsoleLogger` were missing `log`
entirely, or had the wrong signature, this would fail to compile, before `run`
ever executes.

## python

```python
class Logger:
    def log(self, message):
        raise NotImplementedError

class ConsoleLogger(Logger):
    def log(self, message):
        print(message)

def run(logger):
    logger.log('Task started')

run(ConsoleLogger())
```
Walkthrough: Python has no formal interface keyword — this pattern (a base class
whose methods raise `NotImplementedError`) is a common convention, but nothing
stops `run` from being called with an object that has no `log` method at all;
that would only fail at the moment `logger.log(...)` actually runs, not before,
unlike TypeScript's compile-time check.

## java

```java
interface Logger {
    void log(String message);
}

class ConsoleLogger implements Logger {
    public void log(String message) { System.out.println(message); }
}

static void run(Logger logger) {
    logger.log("Task started");
}

run(new ConsoleLogger());
```
Walkthrough: same compile-time guarantee as TypeScript's version — `implements Logger`
is checked before the program runs at all, and `run`'s parameter type `Logger`
means only objects that formally implement that interface can be passed in,
enforced by the compiler, not just by convention the way Python's version is.
