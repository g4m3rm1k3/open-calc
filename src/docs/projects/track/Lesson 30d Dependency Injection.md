# Lesson 30d: Dependency Injection

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 30c's Testability as a Design
Signal, Lesson 0q's interface.

**Terms introduced in this lesson:**

- **Dependency Injection** — a class accepts its dependencies as
  constructor parameters instead of constructing them internally —
  something external decides what real or fake implementation to hand
  it.

---

## Concept Unit: Dependency Injection — Accepting Collaborators Instead of Building Them

### The Problem

A class that constructs its own dependencies internally is permanently
locked to whatever it builds — there's no way to substitute a different
implementation, for testing or for any other reason, without editing the
class's own source. If that internally-built dependency is expensive, or
slow, or requires something not available in every context (a real
database connection, for instance), every single use of the class pays
that cost, with no way around it.

### Introduce the Concept in Isolation

```
mkdir lesson-30d
cd lesson-30d
```

Create `Main.java`:

```java
interface MessageSender {
    void send(String message);
}

class RealEmailSender implements MessageSender {
    public void send(String message) {
        System.out.println("Emailing: " + message);
    }
}

class Notifier {
    private MessageSender sender;

    Notifier(MessageSender sender) {
        this.sender = sender;
    }

    void notifyUser(String text) {
        sender.send("Notification: " + text);
    }
}

public class Main {
    public static void main(String[] args) {
        Notifier notifier = new Notifier(new RealEmailSender());
        notifier.notifyUser("Your order has shipped.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Emailing: Notification: Your order has shipped.
```

`Notifier`'s constructor accepts a `MessageSender`, rather than
constructing a `RealEmailSender` internally with `new`. This is
`Dependency Injection` — **first appearance**: a class accepts its
dependencies as constructor parameters instead of constructing them
internally — something external decides what real or fake implementation
to hand it. `Notifier` itself has no idea whether it's holding a real
email sender, or anything else that implements `MessageSender` — `main`
decided that, at the one point `Notifier` was constructed.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface MessageSender { void send(String message); }` — **(b)
   reappearing** interface shape from Lesson 0q.
2. `class RealEmailSender implements MessageSender { ... }` — **(b)
   reappearing** interface implementation.
3. `Notifier(MessageSender sender) { this.sender = sender; }` — **(a)
   first appearance** of the injection shape itself: the constructor
   accepts an already-built `MessageSender` as a parameter, storing it in
   a field, rather than the constructor itself calling `new
   RealEmailSender()` anywhere inside `Notifier`'s own code.
4. `new Notifier(new RealEmailSender())` — the decision of *which*
   `MessageSender` implementation to use is made here, entirely outside
   `Notifier`'s own class definition — programming to an interface
   (Lesson 0r) applied specifically to how an object's own dependencies
   get supplied.

### CS Lens

Dependency injection is programming-to-an-interface (Lesson 0r) applied
one level deeper: not just "code that *uses* a `MessageSender` shouldn't
care which one," but "code that *needs* a `MessageSender` shouldn't
decide which one for itself at all." The decision moves outward, to
whatever constructs the object, which is free to supply any real
implementation — or, as the next lesson shows, a fake one built
specifically for testing.

Also recognized in: dependency-injection frameworks generally (Spring in
Java, or Android's own Hilt/Dagger — both automate exactly this pattern
at larger scale), constructor injection in C#, any plugin architecture
where the host application decides which concrete implementation a
component receives.

### SE Lens

The alternative — `Notifier` constructing its own `RealEmailSender`
internally (`private MessageSender sender = new RealEmailSender();`) —
was not chosen because it permanently couples `Notifier` to one specific
implementation, with no way to substitute anything else without editing
`Notifier`'s own source code. Accepting the dependency as a constructor
parameter costs one extra argument at every construction site, in
exchange for `Notifier` never needing to change just because a different
`MessageSender` implementation is needed somewhere.

---

## Connect the Pieces

`Notifier`'s constructor accepting a `MessageSender` parameter, rather
than building one internally, is dependency injection — the decision of
which implementation to use moves outside the class entirely. The next
lesson shows the actual payoff: substituting a fake implementation for
testing.

## What Breaks Without This

A version of `Notifier` that builds its own sender internally:

```java
class Notifier {
    private MessageSender sender = new RealEmailSender();

    void notifyUser(String text) {
        sender.send("Notification: " + text);
    }
}
```

has no way to be tested without either sending a real email or editing
`Notifier`'s own source code specifically to swap in a fake — there is no
constructor parameter to substitute anything through.

## Exercises

1. Add a second real implementation, `RealSmsSender`, implementing the
   same `MessageSender` interface, and confirm `Notifier` works
   correctly with it too, with no changes to `Notifier`'s own code at
   all.
2. Rewrite `Notifier` to build its own `RealEmailSender` internally (as
   shown in "What Breaks Without This"), and try to substitute a fake —
   confirm, concretely, that there is no way to do it without editing
   `Notifier` itself.
3. Explain, in your own words, why dependency injection "costs one extra
   argument at every construction site" — what is being traded for that
   cost?

## Definition of Done

- [ ] You ran the dependency-injection example and saw the real output.
- [ ] You completed Exercise 2 and confirmed there's no way to substitute
      a fake without editing `Notifier` itself.
- [ ] You can state, without looking back at this lesson, why dependency
      injection is what makes substitution possible, for testing or any
      other reason.
