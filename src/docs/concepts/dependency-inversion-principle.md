# Concept: The Dependency Inversion Principle

**What you'll understand by the end:** why a high-level piece of code
hardcoding a dependency on a specific, concrete low-level class locks
that low-level choice in permanently, and how depending on an
*abstraction* both sides can satisfy — instead of one depending on the
other directly — lets the concrete choice change freely later.

**Prerequisites:** `python-typing-protocol-structural-typing.md`,
`interface-segregation-principle.md`.

## Setup

Python 3.8+, no packages needed.

## The Problem

A "high-level" piece of code (the part expressing real business
logic — placing an order) naturally needs a "low-level" piece of code
(the part doing real, concrete work — actually sending a
notification) to get anything done. The naive way to wire that up is
for the high-level code to construct and call the low-level class
directly, by name. That works — right up until a second, genuinely
different low-level implementation needs to be used instead, and every
place that hardcoded the first one has to be found and changed.

## The Isolated Example

The high-level module depending directly on a concrete, low-level
class:

```python
class EmailSender:
    def send(self, message):
        print(f"EMAIL: {message}")


class OrderService:
    def __init__(self):
        self.sender = EmailSender()  # hardcoded, concrete dependency

    def place_order(self, item):
        print(f"order placed: {item}")
        self.sender.send(f"Your order for {item} was placed.")


service = OrderService()
service.place_order("widget")
```

**Real output, run this session:**
```
order placed: widget
EMAIL: Your order for widget was placed.
```

**What this proves:** `OrderService` genuinely works — but it can
*only* ever notify by email. `EmailSender` is baked directly into its
own `__init__`; sending by SMS instead means editing `OrderService`
itself, even though placing an order has nothing conceptually to do
with which channel a notification travels over.

The fixed version — both sides depend on a shared abstraction instead:

```python
from typing import Protocol, runtime_checkable


@runtime_checkable
class Notifier(Protocol):
    def send(self, message: str) -> None: ...


class EmailSender2:
    def send(self, message):
        print(f"EMAIL: {message}")


class SmsSender:
    def send(self, message):
        print(f"SMS: {message}")


class OrderService2:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier  # any Notifier -- injected, not hardcoded

    def place_order(self, item):
        print(f"order placed: {item}")
        self.notifier.send(f"Your order for {item} was placed.")


service_email = OrderService2(EmailSender2())
service_email.place_order("widget")

service_sms = OrderService2(SmsSender())
service_sms.place_order("widget")

print("EmailSender2 isinstance Notifier:", isinstance(EmailSender2(), Notifier))
print("SmsSender isinstance Notifier:", isinstance(SmsSender(), Notifier))
```

**Real output, run this session:**
```
order placed: widget
EMAIL: Your order for widget was placed.
order placed: widget
SMS: Your order for widget was placed.
EmailSender2 isinstance Notifier: True
SmsSender isinstance Notifier: True
```

**What this proves:** `OrderService2` never mentions `EmailSender2` or
`SmsSender` by name anywhere in its own code — it only knows about the
`Notifier` shape. Both real senders genuinely satisfy that shape
(`isinstance` confirms it for each), and swapping which one
`OrderService2` uses is a one-line change at the *call site*
(`OrderService2(SmsSender())` instead of `OrderService2(EmailSender2())`)
rather than an edit inside `OrderService2` itself.

## Mechanical Walkthrough

- **Before:** `OrderService` (high-level: the real business rule
  "placing an order sends a notification") imports and constructs
  `EmailSender` (low-level: the real mechanics of one specific
  notification channel) directly. The dependency arrow points from
  high-level code straight at one specific low-level implementation.
- **After:** neither `OrderService2` nor any sender imports the other.
  Both depend on `Notifier`, a shared abstraction neither one owns
  exclusively. The dependency arrow from `OrderService2` now points at
  the abstraction, and each sender's own dependency also points at
  that same abstraction (by satisfying its shape) — not at each other.
- **Inversion**, specifically: without this pattern, a low-level detail
  (which sender exists) would need to be known by the high-level
  module for it to hardcode a choice. With it, the *low-level* code is
  what has to conform to a contract the high-level code merely
  declares it needs — the usual direction of "who depends on whom" is
  reversed relative to the naive, hardcoded wiring.
- The injection happens at construction (`OrderService2(EmailSender2())`)
  — the caller supplies the concrete choice from outside, rather than
  `OrderService2` reaching out and choosing for itself.

## CS Lens

This is the **Dependency Inversion Principle**, the "D" in SOLID: high-
level modules shouldn't depend on low-level modules — both should
depend on abstractions; and abstractions shouldn't depend on details —
details should depend on abstractions. It's the structural principle
that makes **dependency injection** (supplying a collaborator from
outside rather than constructing it internally) actually pay off:
injection alone just moves *where* a concrete class gets named; DIP is
what says the injected parameter's own declared type should be an
abstraction, not still a concrete class, so the caller is free to
supply any real conformer.

Also recognized in: a database access layer coded against a
`Repository` interface rather than a specific SQL driver, so the
concrete database can be swapped without touching business logic;
plugin architectures generally (the host application depends on a
plugin *interface*, never a specific plugin).

## SE Lens

The real, practical payoff: `OrderService2` can be tested with a fake,
in-memory `Notifier` that just records calls, with zero changes to
`OrderService2` itself — the identical real benefit
`test-doubles-and-mocking.md` already names, made possible specifically
because the dependency being substituted was already expressed as an
abstraction, not a hardcoded concrete class. The real, honest cost:
an extra abstraction to define and keep in sync with its real
conformers — not worth it for a dependency that will only, genuinely,
ever have one real implementation (`avoid-premature-abstraction.md`'s
same judgment call, applied here to *which* dependencies are worth
inverting).

## Connection

Builds on `python-typing-protocol-structural-typing.md` (`Notifier`
is defined the identical way) and `interface-segregation-principle.md`
(a real, further reason to keep that shared abstraction narrow — only
the one method actually needed). A real, applied instance in this
project's own history: a 3D backplot view originally accepted only one
specific concrete document-editing widget by type; once it was
rewritten to accept anything satisfying the project's own shared
tab-content abstraction instead, adding a second, genuinely different
kind of document-editing widget required zero changes to the backplot
view itself — the exact real payoff this file's isolated example
demonstrates in miniature. A second, real instance from later in this
project's own history: a motion-parsing function originally accepted
only one concrete shape of input (a whole program's raw text, `str`);
widened into a thin wrapper around a more general form accepting
`Iterable[tuple[int, str]]` — a real, abstract shape both a plain
file's split lines *and* a macro interpreter's own resolved,
possibly-repeated lines satisfy equally — letting a second, genuinely
different real producer feed the identical downstream parsing logic
with zero changes to it.

## Try It Yourself

1. Add a third sender, `PushNotificationSender`, satisfying `Notifier`
   with no changes to `OrderService2` at all — confirm
   `OrderService2(PushNotificationSender())` works immediately.
2. Write a `RecordingNotifier` whose `send` just appends to a list
   instead of printing, use it in place of a real sender, and confirm
   `OrderService2` still works — reasoning about why this is exactly
   the shape a real unit test for `OrderService2` would want.
3. Revert `OrderService2` to hardcode `EmailSender2()` internally
   again (removing the constructor parameter) and count how many real
   call sites would need editing to add SMS support — comparing that
   number directly to the one-line change the abstraction-based
   version required.
