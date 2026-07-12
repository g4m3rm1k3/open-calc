---
series: oop-design
level: 1
title: Inheritance and Composition
lang: javascript
---

# Inheritance and Composition

"Prefer composition over inheritance" is one of the most repeated principles in object-oriented design. But why? Inheritance seems elegant — you write a base class, extend it, and the subclass gets everything. What goes wrong?

The answer: inheritance creates a tight coupling between the subclass and the base class. The subclass depends on every detail of the base class — its internal fields, its method implementations, its invariants. When the base class changes, subclasses may break. When a new requirement doesn't fit the class hierarchy, the hierarchy must be restructured — which breaks everything that depends on it. Composition avoids this by building objects from smaller, independent parts that can be mixed and replaced. By the end of this lesson you will understand when inheritance is appropriate and how to use composition to model behaviour flexibility.

## When inheritance is appropriate

Inheritance models an "is-a" relationship: a `Dog` is an `Animal`. The relationship should be strict — the subclass really is a specialisation of the parent, not just similar to it.

```javascript
// GOOD: strict "is-a" relationship
class Shape {
  constructor(color) {
    this.color = color
  }

  describe() {
    return `A ${this.color} ${this.constructor.name}`
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color)
    this.radius = radius
  }

  area() {
    return Math.PI * this.radius ** 2
  }

  perimeter() {
    return 2 * Math.PI * this.radius
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color)
    this.width = width
    this.height = height
  }

  area() {
    return this.width * this.height
  }

  perimeter() {
    return 2 * (this.width + this.height)
  }
}
```

```text
WHEN INHERITANCE IS APPROPRIATE:
  ✓ A strict "is-a" relationship exists (Circle IS A Shape)
  ✓ The subclass shares most of the parent's behaviour
  ✓ The subclass never needs to REMOVE behaviour from the parent
  ✓ The hierarchy is shallow (at most 2–3 levels)
  ✓ You control both the base class and the subclasses

WHEN INHERITANCE IS INAPPROPRIATE:
  ✗ You are inheriting to get some methods "for free" without the semantic relationship
  ✗ The subclass needs to override most of the parent's methods
  ✗ The hierarchy is growing beyond 2–3 levels
  ✗ Different subclasses need different combinations of behaviours
    (you end up with: AdminUser, PremiumUser, AdminPremiumUser...)
```

## The composition pattern

Composition builds an object's behaviour from parts — smaller objects or functions that each do one thing.

```javascript
// PROBLEM: deep inheritance for different user capabilities
// class User { ... }
// class PremiumUser extends User { canDownload() }
// class AdminUser extends User { canDeletePosts() }
// class AdminPremiumUser extends ??? { canDownload() + canDeletePosts() }
// → Multiple inheritance is not possible in JavaScript!

// SOLUTION: compose capabilities
const downloadCapability = {
  canDownload: true,
  downloadFile(fileId) { return download(fileId) },
}

const adminCapability = {
  isAdmin: true,
  deletePost(postId) { return posts.delete(postId) },
  banUser(userId) { return users.ban(userId) },
}

const analyticsCapability = {
  viewAnalytics: true,
  getReport(period) { return analytics.report(period) },
}

function createUser(base, ...capabilities) {
  return Object.assign({}, base, ...capabilities)
}

const regularUser  = createUser({ name: 'Alice', email: 'alice@example.com' })
const premiumUser  = createUser({ name: 'Bob',   email: 'bob@example.com'   }, downloadCapability)
const adminUser    = createUser({ name: 'Carol',  email: 'carol@example.com' }, adminCapability)
const superUser    = createUser({ name: 'Dave',   email: 'dave@example.com'  }, downloadCapability, adminCapability, analyticsCapability)
```

```text
WHAT COMPOSITION ACHIEVES:
  → Any combination of capabilities without a class explosion
  → Adding a new capability doesn't touch existing users
  → Each capability is independently testable
  → No inheritance hierarchy to maintain
```

**CS lens:** Composition is the application of the **mixin pattern** — combining sets of behaviours by merging their property sets. JavaScript's prototype chain implements a form of single inheritance, but `Object.assign` (and the class mixin pattern) enables multiple composition. Functional languages use type classes and trait systems for the same purpose. The underlying mathematical structure is the same: a set of operations that can be combined independently of the types they operate on.

## The class mixin pattern (composition with classes)

For cases where you need class syntax (for type safety, `instanceof`, or prototype chain reasons), the mixin pattern composes base classes:

```javascript
// Mixin: a function that takes a Base class and returns an extended class
const withLogging = (Base) => class extends Base {
  log(message) {
    console.log(`[${new Date().toISOString()}] ${this.constructor.name}: ${message}`)
  }
}

const withCaching = (Base) => class extends Base {
  #cache = new Map()

  getCached(key, compute) {
    if (this.#cache.has(key)) return this.#cache.get(key)
    const value = compute()
    this.#cache.set(key, value)
    return value
  }
}

// Compose: UserService gets both logging and caching
class UserServiceBase {
  async getUser(id) {
    return db.users.findById(id)
  }
}

class UserService extends withCaching(withLogging(UserServiceBase)) {
  async getUser(id) {
    this.log(`Fetching user ${id}`)
    return this.getCached(`user:${id}`, () => super.getUser(id))
  }
}
```

## Inheritance vs composition decision guide

```text
USE INHERITANCE WHEN:
  → Clear "is-a" semantic relationship
  → Subclasses are specialisations: they do the same things but differently
  → Hierarchy stays shallow (2 levels max is a good rule of thumb)
  → You want polymorphism (subclass can be used wherever base class is expected)

USE COMPOSITION WHEN:
  → "Has-a" or "can-do" relationship (User HAS capabilities, not IS a type of capability)
  → You need to combine behaviours in different ways
  → Behaviours may change at runtime (swap the strategy, add a new mix-in)
  → The hierarchy would be more than 2 levels deep

A USEFUL TEST:
  "Is an AdminPremiumUser a type of User?" — Yes: inheritance might work
  "Does an AdminPremiumUser have admin capabilities AND premium capabilities?"
    → Composition is clearer
```

**SE lens:** The inheritance vs. composition decision is fundamentally a question of **coupling strategy**. Inheritance couples the subclass tightly to the base class — the subclass inherits the full internal implementation, including its field names, method signatures, and private invariants. Composition couples only through the interface of the composed object. Tight coupling is fine when the relationship is stable and the types are truly specialisations. But when requirements change (and they always do), loose coupling through composition is much easier to modify. The industry consensus: use inheritance for modeling stable taxonomies (shapes, HTTP response types); use composition for modeling flexible behaviour (logging, caching, access control).

**Common mistakes:**
- Inheriting to get "free" methods — `class EventEmitter extends Array` to get array methods is misusing inheritance. `EventEmitter` is not an array; it just wants some array-like operations. Use composition: `this.listeners = []`.
- Deep inheritance chains — a class that inherits from a class that inherits from a class creates a situation where understanding `C` requires reading `A`, `B`, and `C`. Every level of indirection adds cognitive load.
- Overriding methods to remove behaviour — if a subclass overrides a method with a no-op (`deletePost() {}`) to "disable" inherited behaviour, the subclass is not a true subclass (Liskov substitution violation). This is a sign inheritance was the wrong model.

**Debug tip:** If you find yourself wanting to override a parent method to do nothing (or throw "not supported"), stop. This is the "refused bequest" code smell. The subclass is not truly a specialisation of the parent — the relationship is not "is-a." Refactor to composition: the subclass should delegate to the parts it needs, rather than inheriting everything and disabling what it doesn't.

## Challenge: compose_user_roles

Implement a composition-based user role system.

```challenge
function createUserWithCapabilities(baseUser, capabilities) {
  // baseUser: { id, name, email }
  // capabilities: array of capability names from: 'download', 'admin', 'analytics'
  //
  // Returns an object with:
  //   All baseUser properties
  //   canDownload: boolean (true if 'download' in capabilities)
  //   isAdmin: boolean (true if 'admin' in capabilities)
  //   canViewAnalytics: boolean (true if 'analytics' in capabilities)
  //   getCapabilities(): returns array of capability names the user has
}
```

```test
const alice = createUserWithCapabilities(
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  ['download', 'analytics']
)

assert alice.name === 'Alice'
assert alice.canDownload === true
assert alice.isAdmin === false
assert alice.canViewAnalytics === true
assert alice.getCapabilities().includes('download')
assert alice.getCapabilities().includes('analytics')
assert !alice.getCapabilities().includes('admin')

const bob = createUserWithCapabilities(
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  ['admin', 'download', 'analytics']
)

assert bob.isAdmin === true
assert bob.canDownload === true
assert bob.getCapabilities().length === 3

const carol = createUserWithCapabilities(
  { id: 3, name: 'Carol', email: 'carol@example.com' },
  []
)

assert carol.canDownload === false
assert carol.isAdmin === false
assert carol.getCapabilities().length === 0
```
