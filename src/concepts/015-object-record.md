---
concept: 015-object-record
name: Object / Record
---

## Definition

An object (or record) groups several named fields together under one value —
unlike an array, each piece of data is accessed by a name (key), not a numeric
position.

## Problem

An array of a person's name, age, and email only works if everyone remembers that
position 0 is always the name — fragile, and unreadable at the call site. A
record gives each field a name, so `person.email` is self-explanatory in a way
`person[2]` never is.

## Computer Science

A record is a **product type** in type theory — a single value that combines
several independently-typed fields, all present at once (as opposed to a **sum
type**, which holds exactly one of several possible shapes — see Enumeration).
Accessing a field by name is typically implemented as a lookup into the object's
internal field layout, not a linear search through the fields.

Tags: Product types, Structured data, Field access

## Software Engineering

Records make function signatures self-documenting — `createUser({ name, email, age })`
tells a reader what's needed without them checking documentation, in a way three
unnamed positional parameters never could, especially once there are more than two
or three of them.

Tags: Named parameters, Self-documenting APIs, Readability

## Common Mistakes

- Accessing a field that doesn't exist and expecting an error — JavaScript and Python both return `undefined`/raise depending on access method, but object literal access (`obj.missingField`) in JavaScript silently gives `undefined`, not an error.
- Confusing a record (fixed, named fields) with a Map/Dictionary (see that concept) — a record's fields are typically known ahead of time; a map's keys are usually dynamic.

## Exercises

- In the JavaScript example, try reading a field that was never set (e.g. `person.phone`) and observe what comes back.
- In Java, add a second field to the record and update the constructor call to match.

## javascript

```javascript
const person = { name: 'Alice', age: 30, email: 'alice@example.com' }
console.log(person.name)     // 'Alice'
console.log(person['age'])   // 30 — bracket syntax also works
person.age = 31
console.log(person.age)      // 31
```
Walkthrough: `person.name` and `person['age']` are two ways to read the same
field — dot syntax when the key is a fixed, known name, bracket syntax when the
key itself is computed or stored in a variable. `person.age = 31` mutates the
field directly; plain object literals in JavaScript are mutable by default.

## python

```python
person = {'name': 'Alice', 'age': 30, 'email': 'alice@example.com'}
print(person['name'])   # 'Alice'
person['age'] = 31
print(person['age'])    # 31
```
Walkthrough: Python's dict literal looks similar to JavaScript's object literal
but only supports bracket-style access (`person['name']`) — there's no dot-syntax
equivalent for plain dicts the way JavaScript has both. Python's `dataclass` or
plain classes are closer to what a "record with dot access" looks like.

## java

```java
record Person(String name, int age, String email) {}

Person person = new Person("Alice", 30, "alice@example.com");
System.out.println(person.name());   // 'Alice'
// person.age() returns 30 — there is no person.age = 31; records are immutable
```
Walkthrough: Java's `record` (introduced in Java 16) declares an immutable data
carrier in one line — fields become accessor *methods* (`person.name()`, with
parentheses, not a plain field read), and there is no way to mutate a record's
fields at all once constructed — a real, deliberate difference from JavaScript's
mutable object literals and Python's mutable dicts.
