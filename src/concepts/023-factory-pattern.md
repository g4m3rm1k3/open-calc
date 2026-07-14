---
concept: 023-factory-pattern
name: Factory Pattern
---

## Definition

A factory is a function or method whose job is to construct and return an object,
centralizing the construction logic instead of repeating it (or a raw `new` call)
everywhere an instance is needed.

## Problem

When creating an object involves more than a plain constructor call — filling in
defaults, picking which of several related classes to instantiate based on some
input, validating inputs first — repeating that logic at every call site means
every one of those call sites has to be updated if the construction logic ever
changes.

## Computer Science

A factory is really just a function that returns an object — there's no special
language mechanism involved. What makes it a recognizable pattern is *where*
construction logic lives: centralized in one place, rather than scattered across
every `new` call, so callers depend on the factory's interface, not on the
concrete class's constructor signature.

Tags: Encapsulated construction, Object creation, Indirection

## Software Engineering

A factory is the natural place to put validation, default values, and "which
concrete class do I actually need here" decisions — moving all of that out of
every call site and into one place that's easy to find and change later.

Tags: Centralized construction, Defaults, Extensibility

## Common Mistakes

- Adding a factory for a class with one trivial constructor and no real construction logic — this adds indirection with no actual benefit; a plain constructor call is clearer.
- Scattering construction logic (default values, validation) across multiple call sites instead of putting it in the factory once it exists, defeating the entire point of having one.

## Exercises

- In the JavaScript example, add a new `role` value (e.g. `'moderator'`) and a corresponding default permission set.
- In Python, remove the factory function and construct a user directly at each call site instead — compare how many places would need updating if the default `role` value ever changed.

## javascript

```javascript
function createUser(name, role = 'member') {
  const permissions = role === 'admin' ? ['read', 'write', 'delete'] : ['read']
  return { name, role, permissions }
}

const alice = createUser('Alice', 'admin')
const bob = createUser('Bob')
console.log(alice)   // { name: 'Alice', role: 'admin', permissions: [...] }
console.log(bob)     // { name: 'Bob', role: 'member', permissions: ['read'] }
```
Walkthrough: `createUser` centralizes the decision of what permissions a role
gets — every caller just says what role they want, without repeating the
`role === 'admin' ? ... : ...` logic themselves. Changing the permission rule
later means editing this one function, not every call site.

## python

```python
def create_user(name, role='member'):
    permissions = ['read', 'write', 'delete'] if role == 'admin' else ['read']
    return {'name': name, 'role': role, 'permissions': permissions}

alice = create_user('Alice', 'admin')
bob = create_user('Bob')
print(alice)
print(bob)
```
Walkthrough: identical shape and identical reasoning to the JavaScript version —
a plain function serving as the factory, with the default `role='member'`
parameter matching JavaScript's default parameter syntax closely.

## java

```java
class User {
    String name, role;
    java.util.List<String> permissions;
    User(String name, String role, java.util.List<String> permissions) {
        this.name = name; this.role = role; this.permissions = permissions;
    }
}

class UserFactory {
    static User createUser(String name, String role) {
        var permissions = role.equals("admin")
            ? java.util.List.of("read", "write", "delete")
            : java.util.List.of("read");
        return new User(name, role, permissions);
    }
}

User alice = UserFactory.createUser("Alice", "admin");
```
Walkthrough: Java conventionally expresses this as a dedicated factory class with
a `static` method, rather than a bare function (Java has no top-level functions
outside a class) — `UserFactory.createUser(...)` plays the exact same centralizing
role as the JavaScript and Python functions above.
