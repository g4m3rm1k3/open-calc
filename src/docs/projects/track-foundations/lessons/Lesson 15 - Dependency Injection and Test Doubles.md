# Lesson 15: Dependency Injection and Test Doubles

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: letting something external decide
what real or fake implementation a class receives, and why that choice
is what makes testing possible at all.

**What you need to know first:** Lesson 06's `interface`.

**Terms introduced in this lesson:**

- **Dependency injection** — a class accepts its dependencies as
  constructor parameters instead of constructing them internally —
  something external decides what real or fake implementation to hand
  it.
- **Test double / mocking** — substituting a fake, controlled
  implementation of a dependency in place of the real one during a test —
  a mock additionally records how it was called, enabling verification.

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
mkdir lesson-15
cd lesson-15
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
`dependency injection` — **first appearance**: a class accepts its
dependencies as constructor parameters instead of constructing them
internally — something external decides what real or fake implementation
to hand it. `Notifier` itself has no idea whether it's holding a real
email sender, or anything else that implements `MessageSender` — `main`
decided that, at the one point `Notifier` was constructed.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface MessageSender { void send(String message); }` — **(b)
   reappearing** interface shape from Lesson 06.
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
   (Lesson 06) applied specifically to how an object's own dependencies
   get supplied.

### CS Lens

Dependency injection is programming-to-an-interface (Lesson 06) applied
one level deeper: not just "code that *uses* a `MessageSender` shouldn't
care which one," but "code that *needs* a `MessageSender` shouldn't
decide which one for itself at all." The decision moves outward, to
whatever constructs the object, which is free to supply any real
implementation — or, as the next unit shows, a fake one built
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

## Concept Unit: Test Doubles and Mocking

### The Problem

Testing `Notifier.notifyUser(...)` with a `RealEmailSender` would
actually send a real email every time the test runs — slow, dependent on
a real network connection, and a genuinely bad idea to run automatically,
repeatedly, in a test suite. The previous unit's dependency injection
already opened a door: since `Notifier` accepts *any* `MessageSender`, a
test can hand it something other than the real one.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
interface MessageSender {
    void send(String message);
}

class FakeMessageSender implements MessageSender {
    String lastMessageSent;

    public void send(String message) {
        lastMessageSent = message;
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
        FakeMessageSender fake = new FakeMessageSender();
        Notifier notifier = new Notifier(fake);

        notifier.notifyUser("Your order has shipped.");

        System.out.println("Fake recorded: " + fake.lastMessageSent);
    }
}
```

Compile and run it. Here is the real output:

```
Fake recorded: Notification: Your order has shipped.
```

`FakeMessageSender` is a `test double` — **first appearance**:
substituting a fake, controlled implementation of a dependency in place
of the real one during a test — a mock additionally records how it was
called, enabling verification. No real email was sent — `send(...)`
simply stored the text in a field, `lastMessageSent`, which the test can
then check to confirm `Notifier` called `send` with the exact message it
was supposed to.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class FakeMessageSender implements MessageSender { String
   lastMessageSent; public void send(String message) { lastMessageSent =
   message; } }` — **(a) first appearance** of a test double's real
   shape: it fulfills the exact same interface as the real
   implementation, but its behavior is entirely different — recording,
   not actually sending.
2. `new Notifier(fake)` — the exact same constructor as before, `new
   Notifier(new RealEmailSender())`, now supplied a fake instead — proof
   `Notifier` itself required no change at all to be tested this way;
   only what gets passed to its constructor changed.
3. `fake.lastMessageSent` — reading the fake's own recorded state after
   calling `notifyUser`, to confirm what `Notifier` actually did — this
   is the "mocking" half of the term: not just substituting a fake, but
   using it afterward to verify the real class's behavior.

### CS Lens

A test double is any object standing in for a real dependency during a
test; a **mock** specifically is a test double that also records how it
was called, so a test can assert on that recorded interaction afterward.
`FakeMessageSender` here is doing both jobs in one small class:
standing in for the real sender, and recording what was sent for later
verification.

Also recognized in: mocking libraries in virtually every language
(Mockito for Java, `unittest.mock` in Python, Moq in C#) — all
automating the construction of exactly this kind of fake object, rather
than hand-writing one per test as this lesson did.

### SE Lens

This is the entire payoff of the previous unit's dependency injection:
`Notifier`, written without ever anticipating testing specifically, is
fully testable anyway, because it never assumed *which* `MessageSender`
it would receive. A class that instead built its own `RealEmailSender`
internally would have no way to avoid sending a real email during every
single test run — dependency injection is what makes this test possible
at all, not an unrelated testing trick layered on top.

---

## Connect the Pieces

`Notifier`'s constructor accepting a `MessageSender` parameter, rather
than building one internally, is dependency injection — the decision of
which implementation to use moves outside the class entirely.
`FakeMessageSender`, substituted in place of `RealEmailSender` with zero
changes to `Notifier` itself, is a test double — and reading back
`fake.lastMessageSent` afterward is mocking: using the fake not just to
avoid a real side effect, but to verify what the real class actually did.

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
constructor parameter to substitute anything through. This is concrete
proof dependency injection isn't a testing-specific technique bolted on
separately; it's what makes substitution possible at all, for testing or
any other reason.

## Exercises

1. Add a second fake implementation, `CountingMessageSender`, that
   counts how many times `send` was called instead of recording the last
   message, and use it to confirm `notifyUser` calls `send` exactly once
   per call.
2. Add a second real implementation, `RealSmsSender`, implementing the
   same `MessageSender` interface, and confirm `Notifier` works
   correctly with it too, with no changes to `Notifier`'s own code at
   all.
3. Rewrite `Notifier` to build its own `RealEmailSender` internally (as
   shown in "What Breaks Without This"), and try to substitute a fake —
   confirm, concretely, that there is no way to do it without editing
   `Notifier` itself.

## Definition of Done

- [ ] You ran the dependency-injection example with a real
      implementation and saw the real output.
- [ ] You ran the test-double example and saw the real recorded message
      printed back.
- [ ] You completed Exercise 1 and used your own fake to verify a call
      count.
- [ ] You can state, without looking back at this lesson, why dependency
      injection is what makes mocking possible, not a separate concept
      layered on top of it.
