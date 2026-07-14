---
concept: 026-exceptions
name: Exceptions
---

## Definition

An exception is the specific mechanism most languages use to signal a runtime
error — an object representing what went wrong, thrown at the point of failure
and propagated up the call stack until something catches it or the program
terminates.

## Problem

Without a dedicated exception mechanism, every function that could fail would
have to communicate failure through its return value (a sentinel, an error code,
a null) — every caller, all the way up, would then have to manually check for and
re-propagate that failure, cluttering ordinary logic with error-plumbing at every
step.

## Execution

An exception is thrown at the point of failure
↓
The current function's execution stops immediately — nothing after the throw in
that function runs
↓
The runtime unwinds the call stack one frame at a time, looking for a matching catch
↓
If a catch is found, execution resumes there with the exception object
↓
If the stack unwinds all the way to the top with no catch, the program terminates
and the exception (with its stack trace) is reported

## Computer Science

Exceptions are a form of non-local control flow — a jump that can cross many
function-call boundaries at once, unlike a normal `return` which only exits one
frame. That's what makes them powerful (no need to manually thread an error code
through every intermediate function) and also easy to misuse as a general-purpose
goto.

Tags: Non-local control flow, Call stack unwinding, Structured error handling

## Software Engineering

Exceptions separate happy-path code from error-handling code, keeping ordinary
logic readable — but stack unwinding isn't free, and there's a real design
tension: throwing for genuinely unexpected situations (a corrupt file) is good
practice, while throwing for expected, common outcomes (a user typed an invalid
age) is often better modeled with a plain return value.

Tags: Control flow separation, Performance cost, Exceptional vs expected failures

## Common Mistakes

- Using exceptions for ordinary control flow (throwing just to break out of a loop) instead of reserving them for genuinely unexpected failures.
- Assuming an exception's message alone explains the failure without checking what type of exception was actually thrown — the type is often more informative than the message.

## Exercises

- In the Java example, change the age passed in to a valid value and observe that no exception is thrown at all — the call stack unwinding only happens on the invalid path.
- In the JavaScript example, add a third function between `createUser` and the top level, calling through it, and predict how the propagation changes.

## javascript

```javascript
function assertValidAge(age) {
  if (age < 0) throw new RangeError('Age cannot be negative: ' + age)
  return age
}
function createUser(name, age) {
  return { name, age: assertValidAge(age) }
}
console.log(createUser('Alex', -5))
```
Walkthrough: `assertValidAge` throws inside `createUser`'s call — `createUser`
never gets to build its object, and the `RangeError` propagates straight past
`createUser` and out to the uncaught top level, without either function writing
any error-handling code of its own.

## python

```python
def assert_valid_age(age):
    if age < 0:
        raise ValueError(f'Age cannot be negative: {age}')
    return age

def create_user(name, age):
    return {'name': name, 'age': assert_valid_age(age)}

print(create_user('Alex', -5))
```
Walkthrough: same two-level propagation — `raise` inside `assert_valid_age`
immediately stops that call, and Python unwinds through `create_user` without
`create_user` ever checking for the failure itself.

## java

```java
static int assertValidAge(int age) {
    if (age < 0) throw new IllegalArgumentException("Age cannot be negative: " + age);
    return age;
}

static String createUser(String name, int age) {
    return name + ", age " + assertValidAge(age);
}

System.out.println(createUser("Alex", -5));
```
Walkthrough: `IllegalArgumentException` is a built-in unchecked exception —
throwing it inside `assertValidAge` immediately stops that call, and the JVM
unwinds through `createUser` without `createUser` containing a single line of
error-handling code itself. The uncaught trace shows both frames, in order.
