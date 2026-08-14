# Concept: Dependency Injection

**What you'll understand by the end:** the difference between a piece of code creating what it depends on versus receiving it from outside, and why the second option is more flexible and more testable.

**Prerequisites:** `python-default-parameter-values.md`.

## Setup

No install needed — any language works. The isolated example uses Python.

## The Problem

Code that creates its own dependencies internally — instantiating a database connection, a specific configuration, another class it needs — hardcodes exactly *which* concrete implementation it uses, at the exact point it's used. That coupling makes the dependency impossible to swap (for a test double, for a different real implementation, for different configuration) without editing the code that creates it.

## The Isolated Example

Without injection — the dependency is created internally:
```python
class RealMailer:
    def send(self, to, message):
        print(f"[REAL EMAIL] to={to}: {message}")
        return True

class Notifier:
    def __init__(self):
        self.mailer = RealMailer()  # hardcoded — always this one concrete class

    def notify(self, user_email):
        return self.mailer.send(user_email, "Your order shipped!")

Notifier().notify("alice@example.com")
```

With injection — the dependency is received, not created:
```python
class FakeMailer:
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))
        return True

class InjectedNotifier:
    def __init__(self, mailer):
        self.mailer = mailer  # supplied from outside — any object with .send(...)

    def notify(self, user_email):
        return self.mailer.send(user_email, "Your order shipped!")

fake = FakeMailer()
InjectedNotifier(fake).notify("alice@example.com")
print(fake.sent)
```

**Real output:**
```
[REAL EMAIL] to=alice@example.com: Your order shipped!
[('alice@example.com', 'Your order shipped!')]
```

**What this proves:** `Notifier` can only ever send real email — there is no way to test it without either sending a real message or editing its source code. `InjectedNotifier`, given exactly the same logic, was tested completely — confirming it called `.send()` with the right arguments — with zero real email sent, purely by supplying a different, real object satisfying the same shape (`.send(to, message)`) at construction time.

## Mechanical Walkthrough

- **Dependency injection** means a piece of code receives (is "injected with") the things it depends on — usually as constructor or function parameters — rather than constructing them internally.
- This is called **constructor injection** when the dependency is passed to `__init__` (as `mailer` is above) — the most common form; **parameter injection** (passing a dependency directly to the one method that needs it, rather than storing it on the object) is a related, narrower variant.
- The dependency is expressed as an **interface** — whatever shape the consuming code actually needs (here, "anything with a `.send(to, message)` method") — not a specific concrete class; `RealMailer` and `FakeMailer` both satisfy that same shape, so either can be injected interchangeably, a real, direct application of the same duck-typing/structural-typing idea `typescript-interfaces.md` names for TypeScript.
- No special framework or "DI container" is required for this — the examples above are called **manual** dependency injection, just passing an object as a constructor argument; larger applications sometimes use a dedicated DI framework to automate *wiring* many dependencies together, but the underlying principle (receive, don't construct) is identical either way.

## CS Lens

This is an application of the **Dependency Inversion Principle** (the "D" in SOLID): high-level code should depend on an abstraction (an interface/shape), not a concrete, low-level implementation — and that concrete implementation should be supplied from outside, not chosen internally by the code that uses it. Inverting the direction of construction — from "I create what I need" to "I declare what I need, and trust something else to supply it" — is what creates a real seam a test (or a different real implementation) can be inserted into later.

Also recognized in: nearly every real application framework's own DI container (Spring in Java, Angular's own injector, .NET's built-in DI system) automating this exact wiring at scale, and the broader Inversion of Control idea generally, where a framework — not application code — controls when and how a piece of code is invoked and what it's given to work with.

## SE Lens

The real, concrete payoff is testability, demonstrated directly above: `InjectedNotifier` could be fully tested with zero real side effects, while `Notifier` genuinely could not be tested at all without either sending real email or editing its source. The real cost: passing dependencies explicitly is more verbose than letting a class quietly construct what it needs internally — a real, worthwhile tradeoff specifically for dependencies that are expensive, slow, unreliable, or meaningfully different between testing and production (a mailer, a database connection, the current time), and much less valuable for genuinely stable, cheap, pure internal helpers that will never plausibly need swapping.

## Connection

Builds on `python-default-parameter-values.md` (a dependency can be given a sensible real default while still being overridable — `def __init__(self, mailer=None): self.mailer = mailer or RealMailer()` is a common, real hybrid). Directly what `test-doubles-and-mocking.md`'s stubs, fakes, and mocks require a real seam to be substituted into — dependency injection is what creates that seam in the first place.

## Try It Yourself

1. Give `InjectedNotifier`'s constructor a real default (`def __init__(self, mailer=None): self.mailer = mailer or RealMailer()`), confirming callers who don't care can still write `InjectedNotifier()` and get real behavior, while a test can still override it explicitly.
2. Identify a real class in a codebase you have access to that constructs one of its own dependencies internally (`self.thing = SomeClass()` inside `__init__`), and sketch — without necessarily making the change — what that class's constructor would look like with the dependency injected instead.
3. Write a second `FakeMailer` variant that raises an exception on `.send()` (simulating a real failure), and use it to test how `InjectedNotifier` behaves when its dependency fails — a real, controlled failure scenario that would be far harder to reliably trigger against a real mail server.
