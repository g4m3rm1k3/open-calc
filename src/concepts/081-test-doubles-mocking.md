---
concept: 081-test-doubles-mocking
name: Test Doubles / Mocking
---

## Definition

A test double is a fake stand-in for a real dependency — a database, a
network call, the current time — used in a test so the test can control
exactly what that dependency returns, without actually performing the real,
slow, or unpredictable operation.

## Problem

A unit test that calls a real database, makes a real network request, or
depends on the actual current time is slow, requires that external thing to
be available and in a known state, and can produce different results on
different runs — none of which is acceptable for a fast, reliable,
repeatable test (see the Unit Testing concept). A test double replaces that
dependency with something the test fully controls.

## Execution

Production code depends on a real EmailService.send(...)
↓
In the test, a FakeEmailService is passed in instead, via dependency injection
↓
The code under test calls send(...) exactly as if it were real — it has no
idea it's talking to a fake
↓
FakeEmailService just records "I was called with these arguments" instead
of actually sending an email
↓
The test then asserts: was send() called? With what arguments? — verifying
BEHAVIOR without any real email ever being sent

## Computer Science

Different kinds of test doubles serve different purposes: a **stub** returns
canned data when asked (but isn't checked for how it was called), a **mock**
additionally records and verifies *how* it was called (was this method
called, how many times, with what arguments), and a **fake** is a full,
simplified working implementation (like an in-memory database standing in
for a real one). Which one to reach for depends on whether the test cares
about the returned value, the interaction itself, or needs genuinely correct
(if simplified) behavior.

Tags: Stubs, Mocks, Fakes, Test isolation

## Software Engineering

Test doubles are only cleanly swappable when the code being tested actually
depends on an abstraction (an interface) rather than constructing its real
dependency internally — this is why Dependency Injection and test doubles
are so often discussed together: DI is what makes a dependency swappable in
the first place, and a test double is what actually gets swapped in.

Tags: Dependency Injection, Testability, Interface, Test isolation

## Common Mistakes

- Over-mocking — replacing so many real collaborators with fakes that the test ends up only checking that the mocks were called correctly, without exercising any real logic at all.
- Using a mock (which verifies how something was called) when a stub (which just returns canned data) was all that was actually needed — over-specifying the interaction makes the test brittle, failing on harmless implementation changes that didn't affect real behavior.

## Exercises

- Write a `FakeClock` that returns a fixed, predetermined time instead of the real current time, and use it to test a function whose behavior depends on "is it currently business hours?"
- Identify one real dependency in a function you've written (a database call, a network request) that would need a test double before that function could be unit tested quickly and reliably.

## javascript

```javascript
class FakeEmailService {
  sentEmails = []
  send(to, subject) {
    this.sentEmails.push({ to, subject })   // records the call instead of really sending
  }
}

function notifyUser(emailService, userEmail) {
  emailService.send(userEmail, 'Welcome!')
}

const fakeService = new FakeEmailService()
notifyUser(fakeService, 'alice@example.com')

console.log(fakeService.sentEmails.length)          // 1 — send() was called exactly once
console.log(fakeService.sentEmails[0].to)           // 'alice@example.com'
console.log(fakeService.sentEmails[0].subject)      // 'Welcome!'
```
Walkthrough: `notifyUser` has no idea `fakeService` isn't a real email
service — it just calls `.send(...)` on whatever it was given, exactly like
in production. `FakeEmailService` records every call into `sentEmails`
instead of actually sending anything, letting the test assert exactly what
would have been sent without any real email leaving the building.

## python

```python
class FakeEmailService:
    def __init__(self):
        self.sent_emails = []

    def send(self, to, subject):
        self.sent_emails.append({'to': to, 'subject': subject})   # records the call instead of really sending


def notify_user(email_service, user_email):
    email_service.send(user_email, 'Welcome!')


fake_service = FakeEmailService()
notify_user(fake_service, 'alice@example.com')

print(len(fake_service.sent_emails))            # 1 -- send() was called exactly once
print(fake_service.sent_emails[0]['to'])        # 'alice@example.com'
print(fake_service.sent_emails[0]['subject'])   # 'Welcome!'
```
Walkthrough: identical fake-dependency mechanics as the JavaScript version —
`notify_user` calls `.send(...)` on whatever it's given, and
`FakeEmailService` records the call instead of performing it for real,
letting the test verify the interaction directly.
