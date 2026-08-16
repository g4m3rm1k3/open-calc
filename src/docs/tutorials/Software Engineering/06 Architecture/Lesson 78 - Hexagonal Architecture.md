# Lesson 78: Hexagonal Architecture

**What you will build.** `OrderConfirmationService` constructs its own
`SmtpMailer` directly, inside `__init__`. It works — until a test needs
to verify a confirmation email was requested correctly, without an
actual SMTP connection being attempted, and there's no way to make that
happen without editing `OrderConfirmationService`'s own source. This
lesson fixes it by having the service accept a `mailer` from outside
instead of constructing one — the same composition technique Lesson 62
already established — so a real `SmtpMailer` and a `FakeMailer` can both
be handed to the identical, unmodified core class. The transferable
problem: a business-logic class that constructs its own infrastructure
directly is welded to that one specific infrastructure choice forever;
**hexagonal architecture** is the discipline of keeping a system's core
logic depending on nothing but an abstract shape, with every concrete,
swappable piece of infrastructure supplied from outside it.

**What you need to know first.** Composition (Lesson 62) — holding a
reference to a collaborator instead of constructing or inheriting it
directly, the exact mechanism this lesson's fix reuses. Dependency
Inversion (Lesson 61) — a stable core reacting to something outside it
without depending on it directly; this lesson applies the identical
idea to an entire class's own infrastructure needs.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 77 organized a
system into ordered layers; this lesson organizes it around a different
shape entirely — one core, depending on nothing but shapes it defines
itself, with every real infrastructure choice pushed outward, supplied
rather than constructed.

**Terms introduced in this lesson.** One line each.

- **hexagonal architecture** — an architectural style, also called
  **Ports and Adapters**, where a system's core business logic depends
  on nothing outside itself except abstract shapes it defines, called
  **ports**, with every real, concrete piece of infrastructure —
  supplied from outside as an **adapter** satisfying that shape. It's
  named because the core is drawn, conventionally, as a hexagon with
  ports on its edges, though the actual number of sides has never
  mattered — only that nothing inside it constructs anything outside
  it.
- **infrastructure dependency** — a dependency on a specific, concrete
  external system: a database driver, an SMTP library, a cloud SDK.
  Naming it precisely is what makes visible that business logic
  shouldn't have one directly — it should depend on an abstract shape,
  and let something outside supply the concrete implementation, the
  exact substitution this lesson's fix makes possible.

**Objects and methods used.** None new — ordinary constructor parameters
and attribute assignment, already established since Lesson 62; what's
new is applying them specifically to keep infrastructure choices outside
a system's core.

## Concept Unit: A Core That Constructs Its Own Infrastructure Can't Be Tested Cheaply

### The Problem

`OrderConfirmationService` builds its own mailer, directly, inside its
own constructor:

```python
class SmtpMailer:
    def send(self, to, subject, body):
        return f"SMTP: sent to {to}: {subject}"


class OrderConfirmationService:
    def __init__(self):
        self.mailer = SmtpMailer()

    def confirm(self, order_id, customer_email):
        return self.mailer.send(customer_email, f"Order {order_id} confirmed", "Thank you!")


service = OrderConfirmationService()
print(service.confirm(501, "dana@example.com"))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
SMTP: sent to dana@example.com: Order 501 confirmed
```

That works, in production. Testing `confirm`'s own logic — did it build
the right subject line, the right message — has no way to run without
also exercising a real `SmtpMailer`, because `OrderConfirmationService`
constructs one itself, every time, with no way for a test to intervene.
In a real system, `SmtpMailer.send` would attempt a real network
connection to a real mail server — something a test suite should never
need to succeed at just to check that `confirm` built the right message.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `OrderConfirmationService`, modified to accept its
  mailer instead of constructing one.
- **Change type:** refactor.
- **Location:** `OrderConfirmationService.__init__`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the constructor parameter itself:

```python
def __init__(self, mailer):
    self.mailer = mailer
```

### The Updated Project

`OrderConfirmationService` no longer names `SmtpMailer` anywhere in its
own body at all — it accepts whatever satisfies the one shape it
actually needs, a `.send(to, subject, body)` method:

```python
class OrderConfirmationService:
    def __init__(self, mailer):                                  # ← changed
        self.mailer = mailer                                        # ← changed, no longer constructs SmtpMailer

    def confirm(self, order_id, customer_email):
        return self.mailer.send(customer_email, f"Order {order_id} confirmed", "Thank you!")
```

The class's own core logic — building the right subject line, calling
`.send` with the right arguments — is completely unchanged. What
changed is that `OrderConfirmationService` no longer has an opinion
about *which* mailer it's given, only that whatever it receives can be
called the way it needs.

### Isolating the Concept: A Fake That Satisfies the Same Shape

The mechanism doing the real work above — a class accepting a
collaborator from outside instead of constructing one, so any object
satisfying the same shape can be substituted — deserves to be seen
proving its own real payoff directly: a `FakeMailer`, built purely for
testing, handed to the identical, unmodified `OrderConfirmationService`:

```python
class FakeMailer:
    def __init__(self):
        self.sent_messages = []

    def send(self, to, subject, body):
        self.sent_messages.append((to, subject, body))
        return f"FAKE: recorded message to {to}"


fake_mailer = FakeMailer()
test_service = OrderConfirmationService(mailer=fake_mailer)
test_service.confirm(502, "test@example.com")
print("fake mailer recorded:", fake_mailer.sent_messages)
```

Running it produces:

```
fake mailer recorded: [('test@example.com', 'Order 502 confirmed', 'Thank you!')]
```

`OrderConfirmationService`'s own source was never touched to make this
possible — `FakeMailer` satisfies the exact same `.send(to, subject,
body)` shape `SmtpMailer` does, the identical polymorphism Lesson 64
already proved works with no shared parent class required. A test can
now check `fake_mailer.sent_messages` directly, with zero network
activity, zero external dependency, and zero risk of actually emailing
anyone during a test run.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`def __init__(self, mailer): self.mailer = mailer`** — an ordinary
  constructor parameter, stored directly on `self`. Nothing about this
  line names `SmtpMailer`, `FakeMailer`, or any other concrete type at
  all — `OrderConfirmationService` has no way to know, and no reason to
  care, which one it was actually given.

### CS Lens

This is **hexagonal architecture**, also called **Ports and Adapters**:
`OrderConfirmationService` is the core, and its own expectation — an
object with a `.send(to, subject, body)` method — is a **port**;
`SmtpMailer` and `FakeMailer` are two different **adapters** satisfying
the identical port. The core never imports either adapter; it only
knows the port's shape. This is the same underlying discipline as
dependency inversion (Lesson 61), applied specifically to a class's own
infrastructure needs rather than to a notification mechanism — the core
depends on an abstraction it owns, and every concrete implementation
depends on satisfying that abstraction, never the other way around.

Also recognized in: a database repository interface that a real SQL
implementation and an in-memory test implementation both satisfy,
without the business logic that uses either one ever importing a
database driver, a payment-processing core that accepts any object
satisfying a `charge(amount)` shape (the identical polymorphism Lesson
64 already built), and dependency-injection frameworks in general,
which exist almost entirely to automate handing the right adapter to the
right core at startup.

### SE Lens

The principle is **keep business logic testable by construction, not by
mocking framework trickery after the fact** — the alternative that was
rejected, `OrderConfirmationService` constructing its own `SmtpMailer`
directly, isn't wrong because it fails to work; it's wrong because
testing it correctly now requires monkey-patching, network mocking, or
some other tool reaching *into* the class to override behavior it was
never designed to let anyone override. The real cost of this fix: every
caller that constructs an `OrderConfirmationService` for real use now
has to supply a mailer explicitly — `OrderConfirmationService()` alone
no longer works, a real, if small, migration cost paid once, in exchange
for a core class that can be tested with a plain, five-line fake object
instead of any mocking machinery at all.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both a real and a fake adapter against the identical,
unmodified core:

```python
real_service = OrderConfirmationService(mailer=SmtpMailer())
print(real_service.confirm(501, "dana@example.com"))

fake_mailer = FakeMailer()
test_service = OrderConfirmationService(mailer=fake_mailer)
test_service.confirm(502, "test@example.com")
print("fake mailer recorded:", fake_mailer.sent_messages)
```

The real output:

```
SMTP: sent to dana@example.com: Order 501 confirmed
fake mailer recorded: [('test@example.com', 'Order 502 confirmed', 'Thank you!')]
```

Both adapters produce the correct behavior for their own purpose — a
real SMTP send in production, a recorded, inspectable message in a
test — through the identical `OrderConfirmationService` class,
unmodified between the two runs.

### Connecting Back

Where Lesson 77 fixed which layers were allowed to call which others,
this lesson removes a dependency on any specific infrastructure from the
core layer entirely — the core no longer needs to know a data or
infrastructure layer's concrete details exist at all, only the shape it
requires from whatever it's given.

## Connect the Pieces

Confirming an order was attempted twice in this lesson, with the
identical `OrderConfirmationService.confirm` method both times. First,
with the service constructing its own `SmtpMailer`: real emails, correct
behavior, and no way to test the logic without a real send attempt.
Second, with the service accepting any mailer from outside: the
identical real behavior with `SmtpMailer`, plus a fully inspectable,
network-free test using `FakeMailer` — the same class, same logic, two
completely different adapters plugged into the same one port.

## What Breaks Without This

Accepting a mailer as a parameter only helps if every caller actually
supplies one deliberately. A caller that constructs a fresh
`SmtpMailer()` inline, every time, out of habit, gets none of the real
benefit:

```python
def send_confirmation_carelessly(order_id, email):
    service = OrderConfirmationService(mailer=SmtpMailer())
    return service.confirm(order_id, email)
```

This still works correctly in production — but it's now impossible to
test `send_confirmation_carelessly` itself without a real `SmtpMailer`
being constructed inside it, the identical problem this lesson just
fixed one level up, recreated the moment a caller hardcodes which
adapter to use instead of accepting one from further outside too. Ports
and Adapters only protects the parts of a system that were actually
built to accept a port; a caller that reaches for a concrete adapter
directly reintroduces the exact coupling the pattern exists to remove.

## Exercises

1. Fix `send_confirmation_carelessly` the same way this lesson fixed
   `OrderConfirmationService` — accept a `mailer` parameter instead of
   constructing one — and prove, using `FakeMailer`, that it's now
   testable without a real send.
2. Write a third adapter, `SesMailer`, simulating a different email
   provider with the identical `.send(to, subject, body)` shape. Prove,
   with real output, that `OrderConfirmationService` works with it
   without a single line of its own source changing.
3. `OrderConfirmationService`'s port — a `.send(to, subject, body)`
   method — was never written down as a formal interface anywhere; it's
   just an assumption every adapter happens to satisfy. Using Lesson 70's
   own `ABC`/`@abstractmethod` mechanics, write a formal `MailerPort`
   abstract base class, and argue in two or three sentences whether
   making it formal is worth the ceremony for this specific system.

## Definition of Done

- [ ] `OrderConfirmationService.__init__` accepts `mailer` as a
      parameter; it never constructs `SmtpMailer` or any other concrete
      mailer itself.
- [ ] `FakeMailer` exists and satisfies the identical shape `SmtpMailer`
      does.
- [ ] The Problem section's untestable version has been run for real,
      demonstrating the real send attempt, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, for both adapters.
- [ ] The "What Breaks Without This" `send_confirmation_carelessly` gap
      has been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `hexagonal
      architecture: accept a mailer port instead of constructing
      SmtpMailer directly, so OrderConfirmationService can be tested
      without a real send`, not `add dependency injection`.

Up next: Lesson 79, Ports and Adapters — naming this lesson's own
`mailer` parameter formally, and building the vocabulary for designing a
whole system's worth of ports deliberately, not just one at a time.
