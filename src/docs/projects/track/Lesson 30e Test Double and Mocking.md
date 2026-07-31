# Lesson 30e: Test Double / Mocking

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 30d's Dependency Injection.

**Terms introduced in this lesson:**

- **Test Double / Mocking** — substituting a fake, controlled
  implementation of a dependency in place of the real one during a test
  — a mock additionally records how it was called, enabling
  verification.

---

## Concept Unit: Test Doubles and Mocking

### The Problem

Testing `Notifier.notifyUser(...)` with a `RealEmailSender` would
actually send a real email every time the test runs — slow, dependent on
a real network connection, and a genuinely bad idea to run automatically,
repeatedly, in a test suite. Lesson 30d's own dependency injection
already opened a door: since `Notifier` accepts *any* `MessageSender`, a
test can hand it something other than the real one.

### Introduce the Concept in Isolation

```
mkdir lesson-30e
cd lesson-30e
```

Create `Main.java`:

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

`FakeMessageSender` is a `Test Double` — **first appearance**:
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

This is the entire payoff of Lesson 30d's own dependency injection:
`Notifier`, written without ever anticipating testing specifically, is
fully testable anyway, because it never assumed *which* `MessageSender`
it would receive. A class that instead built its own `RealEmailSender`
internally would have no way to avoid sending a real email during every
single test run — dependency injection is what makes this test possible
at all, not an unrelated testing trick layered on top.

---

## Connect the Pieces

`FakeMessageSender`, substituted in place of `RealEmailSender` with zero
changes to `Notifier` itself, is a test double — and reading back
`fake.lastMessageSent` afterward is mocking: using the fake not just to
avoid a real side effect, but to verify what the real class actually
did.

## What Breaks Without This

Testing `Notifier` with a `RealEmailSender` would send a real email
every time the test runs — slow, dependent on a real network connection,
and unsuitable to run automatically, repeatedly, in a test suite.

## Exercises

1. Add a second fake implementation, `CountingMessageSender`, that
   counts how many times `send` was called instead of recording the last
   message, and use it to confirm `notifyUser` calls `send` exactly once
   per call.
2. Explain, in your own words, the difference between a plain test
   double and a mock.
3. Explain, in your own words, why `FakeMessageSender` implementing the
   same `MessageSender` interface as `RealEmailSender` is essential to
   this pattern working at all.

## Definition of Done

- [ ] You ran the test-double example and saw the real recorded message
      printed back.
- [ ] You completed Exercise 1 and used your own fake to verify a call
      count.
- [ ] You can state, without looking back at this lesson, why dependency
      injection is what makes mocking possible, not a separate concept
      layered on top of it.
