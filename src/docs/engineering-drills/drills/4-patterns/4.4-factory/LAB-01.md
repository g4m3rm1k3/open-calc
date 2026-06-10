# DRILL 4.4 — Factory Pattern: Creating Without Specifying

**Series:** Design Patterns | **Difficulty:** Intermediate | **Time:** 75–100 min  
**Project:** Notification System — a small app that starts with brittle if/else instantiation and ends with a pluggable factory

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. A function contains `if channel == "email": return EmailNotifier()`. What is wrong with this, architecturally?
2. You call `factory.create("sms")`. Which file imports `SMSNotifier` — your calling code, or the factory?
3. What is the difference between Factory Method and Abstract Factory?
4. Why does adding a new notifier type require zero changes to existing code when you use `factory.register()`?

---

## What It Is

The Factory pattern separates **deciding which class to create** from **using the created object**.

Without a factory, callers contain the instantiation decision:

```
caller code → if/else → EmailNotifier()
                      → SMSNotifier()
                      → PushNotifier()
```

With a factory, callers are isolated from that decision:

```
caller code → factory.create("email") → EmailNotifier()
```

The caller never imports `EmailNotifier`. The caller never knows the concrete type exists. If you swap `EmailNotifier` for `BetterEmailNotifier`, the caller's code doesn't change.

---

## Pattern Category, Official Name, Tradeoff

| Field | Value |
|---|---|
| **Pattern category** | GoF Creational |
| **Official name** | Factory Method (single type), Abstract Factory (families of types) |
| **Tradeoff** | Indirection — you gain swappability but lose the ability to `Ctrl+Click` to a constructor. Debugging "which class did this actually create?" requires understanding the factory's configuration, not reading the caller's code. |

---

## The Problem Before

You are building a notification system. Three channels: email, SMS, push. The obvious first implementation puts the instantiation decision directly in the caller:

### What It Is

Each place in your codebase that needs a notifier contains its own if/else over the channel name. Add a fourth channel and you must find and update every one of those if/else blocks. Miss one and it silently falls through to a default, or raises a `KeyError`, or does nothing.

---

## Constraints

- Python 3.10+
- No third-party packages
- Standard library only (`abc`, `dataclasses`)

---

## Failure Modes

| Symptom | Root Cause |
|---|---|
| `KeyError: 'slack'` from the factory | You called `create("slack")` before registering `SlackNotifier` |
| New notifier never gets used | You registered it but still have a hardcoded if/else in the caller |
| Abstract method not implemented | Subclass doesn't implement every method the ABC declares |
| Factory creates wrong type | Two registrations with the same key — second overwrites first silently |

---

## Operational Reality

In production codebases:

- Driver frameworks use factories: database drivers, logging handlers, authentication backends all register themselves under a string key
- Django uses `EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"` — a string that tells a factory which class to instantiate
- SQLAlchemy's `create_engine("sqlite:///...")` is a factory — the URL prefix selects the dialect
- Plugin systems live entirely on this pattern: the core app defines the interface, plugins register themselves

---

## You Will See This Again In

- Django's `AUTHENTICATION_BACKENDS`, `EMAIL_BACKEND`, `DEFAULT_FILE_STORAGE`
- SQLAlchemy's `create_engine()` and dialect registry
- pytest's fixture system (factories that produce test objects)
- FastAPI's dependency injection (a factory for dependency instances)
- Click's command registry (commands register themselves under a name)

---

## Step 1 — The Problem: Direct Instantiation With if/else

Build the notification system the naive way. Watch where the coupling appears.

Create this directory:

```
notifier/
    notifiers.py
    main.py
```

Create `notifiers.py`:

```python
# notifiers.py
# The three concrete notifier classes.
# Each does one job: send a message through one channel.
# These classes are fine. The problem is in how they get created.

class EmailNotifier:
    def send(self, recipient: str, message: str) -> None:
        # Simulate sending an email — in real code this calls smtplib
        print(f"[EMAIL] To: {recipient} | {message}")

class SMSNotifier:
    def send(self, recipient: str, message: str) -> None:
        # Simulate sending an SMS — in real code this calls Twilio API
        print(f"[SMS]   To: {recipient} | {message}")

class PushNotifier:
    def send(self, recipient: str, message: str) -> None:
        # Simulate a push notification — in real code this calls Firebase
        print(f"[PUSH]  To: {recipient} | {message}")
```

Create `main.py`:

```python
# main.py
# The caller decides which concrete class to instantiate.
# This is the PROBLEM we are about to solve.

from notifiers import EmailNotifier, SMSNotifier, PushNotifier
# ^^^ The caller imports every concrete class it might ever need.
# When you add SlackNotifier, this import list grows.


def get_notifier(channel: str):
    # Every caller that needs a notifier writes this if/else.
    # This is the instantiation decision living in the wrong place.
    if channel == "email":
        return EmailNotifier()
    elif channel == "sms":
        return SMSNotifier()
    elif channel == "push":
        return PushNotifier()
    else:
        raise ValueError(f"Unknown channel: {channel}")


def notify_user(user_email: str, channel: str, message: str) -> None:
    notifier = get_notifier(channel)  # ask for a notifier
    notifier.send(user_email, message)


if __name__ == "__main__":
    notify_user("alice@example.com", "email", "Your order shipped")
    notify_user("alice@example.com", "sms",   "Your order shipped")
    notify_user("alice@example.com", "push",  "Your order shipped")
```

### SAVE AND TRY

```
cd notifier
python main.py
```

**Expected output:**
```
[EMAIL] To: alice@example.com | Your order shipped
[SMS]   To: alice@example.com | Your order shipped
[PUSH]  To: alice@example.com | Your order shipped
```

**Change something:** Try to call `notify_user("alice@example.com", "slack", "hello")`. Watch it raise `ValueError: Unknown channel: slack`. Now count how many places you would need to edit to add Slack support: the import line at the top of `main.py`, the `get_notifier` if/else, and — in a real app — every other file that has its own copy of `get_notifier`. That count is the problem.

---

## Step 2 — Show the Edit-Multiple-Points Problem

Before fixing it, make the coupling visible by adding a second caller. This shows why the if/else placement is architecturally wrong.

Add a second function to `main.py` that also needs to create notifiers:

```python
# main.py — add this function after notify_user

def send_batch(recipients: list[str], channel: str, message: str) -> None:
    # A second caller — a batch sender.
    # It needs the SAME if/else logic to get the right notifier type.
    # Duplication is already happening.
    if channel == "email":
        notifier = EmailNotifier()
    elif channel == "sms":
        notifier = SMSNotifier()
    elif channel == "push":
        notifier = PushNotifier()
    else:
        raise ValueError(f"Unknown channel: {channel}")

    for recipient in recipients:
        notifier.send(recipient, message)


if __name__ == "__main__":
    notify_user("alice@example.com", "email", "Your order shipped")

    send_batch(
        ["bob@example.com", "carol@example.com"],
        "sms",
        "Flash sale ends in 1 hour"
    )
```

### SAVE AND TRY

```
python main.py
```

**Expected output:**
```
[EMAIL] To: alice@example.com | Your order shipped
[SMS]   To: bob@example.com | Flash sale ends in 1 hour
[SMS]   To: carol@example.com | Flash sale ends in 1 hour
```

**The visible problem:** To add Slack, you edit `get_notifier`'s if/else AND `send_batch`'s if/else AND the import line — and in a real codebase, every other file with its own copy. This is what "Open/Closed Principle violation" means in practice: adding a feature requires modifying existing, working code.

---

## Step 3 — Factory Method: One Place That Knows the Types

Create the factory. Move all instantiation decisions into it. Callers stop importing concrete classes.

Create `factory.py`:

```python
# factory.py
# The Factory Method pattern: one class owns ALL instantiation decisions.
# Everything outside this file is insulated from which concrete types exist.

from notifiers import EmailNotifier, SMSNotifier, PushNotifier
# Only the factory imports the concrete types.
# main.py will stop importing them entirely.


class NotifierFactory:
    def create(self, channel: str):
        # The if/else lives here now — one place, one source of truth.
        # When you add a new channel, you edit this one method.
        if channel == "email":
            return EmailNotifier()
        elif channel == "sms":
            return SMSNotifier()
        elif channel == "push":
            return PushNotifier()
        else:
            raise ValueError(f"Unknown channel: {channel!r}")
```

Update `main.py` to use the factory:

```python
# main.py (updated)
# The caller no longer imports EmailNotifier, SMSNotifier, or PushNotifier.
# It only knows about the factory and the Notifier interface (send method).

from factory import NotifierFactory

factory = NotifierFactory()


def notify_user(user_email: str, channel: str, message: str) -> None:
    # Caller asks for "a notifier for this channel".
    # It does not know or care what class it gets back.
    notifier = factory.create(channel)
    notifier.send(user_email, message)


def send_batch(recipients: list[str], channel: str, message: str) -> None:
    # Same call. No if/else. No concrete imports.
    notifier = factory.create(channel)
    for recipient in recipients:
        notifier.send(recipient, message)


if __name__ == "__main__":
    notify_user("alice@example.com", "email", "Your order shipped")
    send_batch(
        ["bob@example.com", "carol@example.com"],
        "sms",
        "Flash sale ends in 1 hour"
    )
```

### SAVE AND TRY

```
python main.py
```

**Expected output:**
```
[EMAIL] To: alice@example.com | Your order shipped
[SMS]   To: bob@example.com | Flash sale ends in 1 hour
[SMS]   To: carol@example.com | Flash sale ends in 1 hour
```

**Change something:** Add a new channel directly to `main.py` — try `notify_user("alice@example.com", "fax", "Hello from 1992")`. It raises `ValueError`. Now notice: you cannot add "fax" support by editing `main.py` alone. The knowledge of which classes exist lives entirely in `factory.py`. That is the structural guarantee the factory creates.

---

## Step 4 — Formalize the Interface With an ABC

Right now, the factory returns untyped objects. If `EmailNotifier.send()` is misnamed `send_email()`, you get an `AttributeError` at runtime. Define the contract with an Abstract Base Class.

Add an `abc` to `notifiers.py`:

```python
# notifiers.py (updated with interface)

from abc import ABC, abstractmethod
# ABC: Abstract Base Class — a class that cannot be instantiated directly.
# abstractmethod: a method that MUST be overridden — forgetting to implement
# it raises TypeError at class definition time, not at call time.


class Notifier(ABC):
    # This is the interface. It declares the contract:
    # every Notifier must implement send().
    # No code outside notifiers.py should care which subclass it has.

    @abstractmethod
    def send(self, recipient: str, message: str) -> None:
        # The method signature is the contract.
        # The docstring is the explanation of what implementors must do.
        """Send a message to a recipient via this channel."""
        ...


class EmailNotifier(Notifier):
    def send(self, recipient: str, message: str) -> None:
        print(f"[EMAIL] To: {recipient} | {message}")


class SMSNotifier(Notifier):
    def send(self, recipient: str, message: str) -> None:
        print(f"[SMS]   To: {recipient} | {message}")


class PushNotifier(Notifier):
    def send(self, recipient: str, message: str) -> None:
        print(f"[PUSH]  To: {recipient} | {message}")
```

Update `factory.py` to use the interface as the return type hint:

```python
# factory.py (updated with type hint)

from notifiers import Notifier, EmailNotifier, SMSNotifier, PushNotifier


class NotifierFactory:
    def create(self, channel: str) -> Notifier:
        # The return type is the ABSTRACT class, not the concrete class.
        # This is Dependency Inversion: callers depend on the abstraction.
        if channel == "email":
            return EmailNotifier()
        elif channel == "sms":
            return SMSNotifier()
        elif channel == "push":
            return PushNotifier()
        else:
            raise ValueError(f"Unknown channel: {channel!r}")
```

### SAVE AND TRY

```
python main.py
```

**Expected output:** Same as before — nothing visible changed externally. The change is in the contract.

**Change something:** Try creating `Notifier()` directly — add `n = Notifier()` to `main.py`. It raises `TypeError: Can't instantiate abstract class Notifier with abstract method send`. The ABC enforces the contract at instantiation time.

Remove the test line before continuing.

---

## Step 5 — Register New Notifiers: Zero if/else Changes

Replace the if/else inside the factory with a registry (a dict). New notifier types are added by calling `register()` — the if/else never grows.

Update `factory.py`:

```python
# factory.py (registry-based — no if/else)

from notifiers import Notifier


class NotifierFactory:
    def __init__(self):
        # The registry maps channel name → class (not instance — the class itself).
        # We store the class so we can call it: registry["email"]() creates EmailNotifier().
        self._registry: dict[str, type[Notifier]] = {}

    def register(self, channel: str, notifier_class: type[Notifier]) -> None:
        # Register a channel name → class mapping.
        # Called once at startup, before any create() calls.
        # No if/else required anywhere in this method.
        self._registry[channel] = notifier_class

    def create(self, channel: str) -> Notifier:
        # Look up the class, instantiate it, return it.
        # If the channel isn't registered, fail early with a clear message.
        if channel not in self._registry:
            available = ", ".join(sorted(self._registry.keys()))
            raise ValueError(
                f"Unknown channel: {channel!r}. Available: {available}"
            )
        # Call the class like a function to create an instance.
        # registry["email"] is the EmailNotifier class.
        # registry["email"]() is calling EmailNotifier() — creating an instance.
        return self._registry[channel]()
```

Update `main.py` to register channels at startup:

```python
# main.py (using registry-based factory)

from factory import NotifierFactory
from notifiers import EmailNotifier, SMSNotifier, PushNotifier
# Note: main.py still imports the concrete classes — but ONLY to register them.
# The factory owns creation. main.py hands the classes to the factory,
# then never references them again. Callers like notify_user and send_batch
# don't import the concrete classes at all.

factory = NotifierFactory()
factory.register("email", EmailNotifier)  # hand the class, not an instance
factory.register("sms",   SMSNotifier)
factory.register("push",  PushNotifier)


def notify_user(user_email: str, channel: str, message: str) -> None:
    notifier = factory.create(channel)
    notifier.send(user_email, message)


def send_batch(recipients: list[str], channel: str, message: str) -> None:
    notifier = factory.create(channel)
    for recipient in recipients:
        notifier.send(recipient, message)


if __name__ == "__main__":
    notify_user("alice@example.com", "email", "Your order shipped")
    send_batch(
        ["bob@example.com", "carol@example.com"],
        "sms",
        "Flash sale ends in 1 hour"
    )
```

### SAVE AND TRY

```
python main.py
```

**Expected output:**
```
[EMAIL] To: alice@example.com | Your order shipped
[SMS]   To: bob@example.com | Flash sale ends in 1 hour
[SMS]   To: carol@example.com | Flash sale ends in 1 hour
```

**Change something:** Add a Slack notifier without touching `factory.py` at all.

Add to `notifiers.py`:

```python
class SlackNotifier(Notifier):
    def send(self, recipient: str, message: str) -> None:
        print(f"[SLACK] To: {recipient} | {message}")
```

Add to the registration block in `main.py`:

```python
from notifiers import EmailNotifier, SMSNotifier, PushNotifier, SlackNotifier
factory.register("slack", SlackNotifier)
```

Add to the `if __name__` block:

```python
notify_user("alice@example.com", "slack", "Your order shipped")
```

Run it. Slack works. `factory.py` was not touched. `notify_user` was not touched. `send_batch` was not touched. That is the guarantee.

---

## Step 6 — Abstract Factory: Families of Objects

A single factory creates one type. An Abstract Factory creates a **coordinated family** of types. Use case: you have "platform profiles" where each platform needs a matching set of notifiers.

Create `platform_factory.py`:

```python
# platform_factory.py
# Abstract Factory pattern: creates FAMILIES of related objects.
# Problem this solves: you need sets of notifiers that belong together.
# Example: "enterprise" platform uses email + SMS (no push, too informal).
#          "mobile" platform uses push + SMS (no email, too slow).
# The caller asks for a platform factory — never specifies individual types.

from abc import ABC, abstractmethod
from notifiers import Notifier, EmailNotifier, SMSNotifier, PushNotifier


class PlatformNotifierFactory(ABC):
    # The abstract factory declares what a platform can provide.
    # Concrete factories implement each method for their platform.

    @abstractmethod
    def create_primary(self) -> Notifier:
        """The main notification channel for this platform."""
        ...

    @abstractmethod
    def create_fallback(self) -> Notifier:
        """The backup channel if the primary fails."""
        ...


class EnterpriseNotifierFactory(PlatformNotifierFactory):
    # Enterprise platform: email is primary (formal), SMS is fallback.
    # Never uses push — enterprise users don't have the mobile app.

    def create_primary(self) -> Notifier:
        return EmailNotifier()

    def create_fallback(self) -> Notifier:
        return SMSNotifier()


class MobileNotifierFactory(PlatformNotifierFactory):
    # Mobile platform: push is primary (instant), SMS is fallback.
    # Email is too slow for mobile users who expect instant notifications.

    def create_primary(self) -> Notifier:
        return PushNotifier()

    def create_fallback(self) -> Notifier:
        return SMSNotifier()


def notify_with_fallback(
    factory: PlatformNotifierFactory,
    recipient: str,
    message: str
) -> None:
    # This function works with ANY platform factory.
    # It never mentions EmailNotifier, PushNotifier, or any concrete type.
    # Swap the factory — the behavior changes. The function doesn't.
    primary = factory.create_primary()
    fallback = factory.create_fallback()

    print(f"  Sending via primary channel...")
    primary.send(recipient, message)
    print(f"  Sending via fallback channel...")
    fallback.send(recipient, message)


if __name__ == "__main__":
    print("=== Enterprise Platform ===")
    notify_with_fallback(
        EnterpriseNotifierFactory(),
        "cto@bigcorp.com",
        "System alert: CPU at 98%"
    )

    print("\n=== Mobile Platform ===")
    notify_with_fallback(
        MobileNotifierFactory(),
        "user@example.com",
        "Your ride is arriving"
    )
```

### SAVE AND TRY

```
python platform_factory.py
```

**Expected output:**
```
=== Enterprise Platform ===
  Sending via primary channel...
[EMAIL] To: cto@bigcorp.com | System alert: CPU at 98%
  Sending via fallback channel...
[SMS]   To: cto@bigcorp.com | System alert: CPU at 98%

=== Mobile Platform ===
  Sending via primary channel...
[PUSH]  To: user@example.com | Your ride is arriving
  Sending via fallback channel...
[SMS]   To: user@example.com | Your ride is arriving
```

**Change something:** Add a `ConsumerNotifierFactory` where primary is push and fallback is email. Pass it to `notify_with_fallback`. The function does not change — only the factory changes. Swap the factory, swap the behavior. That is the Abstract Factory guarantee.

---

## Final State

Your project should look like this:

```
notifier/
    notifiers.py          (Notifier ABC + EmailNotifier, SMSNotifier, PushNotifier, SlackNotifier)
    factory.py            (NotifierFactory with register/create)
    platform_factory.py   (PlatformNotifierFactory ABC + Enterprise, Mobile implementations)
    main.py               (caller — never imports concrete notifier classes directly)
```

### SAVE AND TRY (Full Verification)

```
python main.py
```

Expected: email, SMS, SMS, Slack lines

```
python platform_factory.py
```

Expected: enterprise (email + SMS), mobile (push + SMS)

```
python -c "from factory import NotifierFactory; f = NotifierFactory(); f.create('bad')"
```

Expected: `ValueError: Unknown channel: 'bad'. Available: ` (empty because nothing is registered in this one-liner)

---

## Challenge

No solution provided. Requirements checklist only.

Build a **parser factory**. Each parser has the same interface: `parse(text: str) -> list[dict]`. The factory returns the correct parser for the given format name.

**Starter — create these files:**

`parsers.py`:
```python
from abc import ABC, abstractmethod

class Parser(ABC):
    @abstractmethod
    def parse(self, text: str) -> list[dict]:
        ...

# Add: JsonParser, XmlParser, CsvParser
# JsonParser: use json.loads — parse a JSON array of objects
# CsvParser: use csv.DictReader — parse CSV text into list of dicts
# XmlParser: use xml.etree.ElementTree — parse simple XML into list of dicts
```

`parser_factory.py`:
```python
# Build this using the registry pattern from Step 5.
# factory.register("json", JsonParser)
# factory.register("csv", CsvParser)
# factory.register("xml", XmlParser)
```

`main.py`:
```python
# Test your factory with these inputs:

JSON_TEXT = '[{"name": "Alice", "age": "30"}, {"name": "Bob", "age": "25"}]'
CSV_TEXT  = "name,age\nAlice,30\nBob,25"
XML_TEXT  = "<records><record><name>Alice</name><age>30</age></record></records>"

# factory.create("json").parse(JSON_TEXT) should return list of dicts
# factory.create("csv").parse(CSV_TEXT)  should return list of dicts
# factory.create("xml").parse(XML_TEXT)  should return list of dicts
```

**Requirements checklist:**

- [ ] `Parser` is an ABC with an `@abstractmethod parse()` method
- [ ] All three parsers inherit from `Parser` and implement `parse()`
- [ ] `factory.create("json")` returns a `JsonParser` without the caller importing `JsonParser`
- [ ] `factory.create("csv")` and `factory.create("xml")` work the same way
- [ ] Adding a YAML parser requires only: adding `YamlParser` to `parsers.py` and calling `factory.register("yaml", YamlParser)` — zero changes to `parser_factory.py`, zero changes to any existing parsers
- [ ] `factory.create("toml")` raises `ValueError` with a clear message listing available formats
- [ ] Each parser's `parse()` returns a `list[dict]` with consistent keys

**When done:** Run `python main.py` and verify all three parsers produce `[{'name': 'Alice', 'age': '30'}, {'name': 'Bob', 'age': '25'}]` (or similar — XML structure may differ). Then add YAML support using `import yaml` (install with `pip install pyyaml`) by calling `factory.register("yaml", YamlParser)` — verify that `parser_factory.py` has no new lines.

**Stuck? Ask AI:** "I'm building a parser factory in Python using the registry pattern. My factory stores a dict of format_name → class and calls the class to create instances. My XmlParser needs to parse `<records><record><name>Alice</name></record></records>` into `[{'name': 'Alice'}]` using xml.etree.ElementTree. How do I walk the XML tree to produce a list of dicts?"

---

## Quick Check Answers

1. **The if/else lives in the wrong place.** Every caller that needs a notifier must contain or duplicate this decision. Adding a new channel requires finding and editing every copy. The instantiation decision should live in one place — the factory.

2. **The factory imports `SMSNotifier`.** The calling code only imports the factory. This is the point: callers are insulated from knowing which concrete classes exist.

3. **Factory Method creates one type** — you call `factory.create("email")` and get back one notifier. **Abstract Factory creates a family of related types** — you call `enterprise_factory.create_primary()` and `enterprise_factory.create_fallback()` and get back a coordinated set of objects that belong together.

4. **Because the registry is a dict.** `factory.register("slack", SlackNotifier)` adds an entry to the dict. `factory.create("slack")` looks up that entry and calls it. No if/else was ever written for "slack" — so no if/else needs updating. The registry grows; the lookup code never changes.
