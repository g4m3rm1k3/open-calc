---
series: software-construction
level: 3
title: Modules and Public APIs
lang: javascript
---

# Modules and Public APIs

Every piece of software that grows beyond a single file faces the same question: what can code outside this file see, and what is private to it? The answer to that question is the module's public API — the contract it exposes to the rest of the world.

A module with no concept of public and private is not a module. It is a pile of functions. Any code anywhere can reach into it, depend on any internal detail, and make it impossible to change anything without checking every caller. The discipline of making some things public and everything else private is what turns a collection of functions into a reusable, maintainable component.

By the end of this lesson you will understand what a module is and what its boundary enforces, be able to design a public API that hides implementation details, and know what makes an API stable versus fragile.

## What a module is

A module is a file (or group of files) that groups related code behind a public boundary. Code inside the module can see everything. Code outside the module can only see what the module chooses to expose.

```javascript
// math-utils.js — a module

// PRIVATE: only usable within this file
function isWholeNumber(n) {
  return Number.isInteger(n)
}

// PRIVATE: implementation detail of clamp()
function boundedBy(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// PUBLIC: exported — callers can use these
export function clamp(value, min, max) {
  return boundedBy(value, min, max)
}

export function average(numbers) {
  if (!numbers.length) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}
```

```javascript
// In another file, using the module:
import { clamp, average } from './math-utils.js'

clamp(150, 0, 100)    // → 100 (clamped to max)
average([1, 2, 3])    // → 2

// This would fail — boundedBy is not exported:
boundedBy(5, 0, 10)   // ReferenceError: boundedBy is not defined
```

```text
The module has:
  PUBLIC API:   clamp(), average()
  PRIVATE:      isWholeNumber(), boundedBy()

Callers depend on clamp() and average().
They do NOT depend on boundedBy() or isWholeNumber().

Consequence: if you need to change how boundedBy() works internally —
perhaps using a more efficient algorithm — you change it freely.
No caller is affected. No callers even know it exists.

If boundedBy() were public, every caller could depend on it.
Changing it would require checking and potentially updating every caller.
Privacy is not secrecy. It is a promise to callers that these details will not change.
```

## What a public API exposes

A public API is the set of names, signatures, and behaviours that callers depend on. Everything in the public API is a commitment: once callers exist, changing the API breaks them.

```javascript
// user-store.js — manages a collection of users

const users = new Map()   // PRIVATE: implementation detail. Could be an array, a Set,
                           // a database — callers don't know and shouldn't care.

export function addUser(id, name, email) {
  if (users.has(id)) throw new Error(`User ${id} already exists`)
  users.set(id, { id, name, email })
}

export function getUser(id) {
  return users.get(id) ?? null   // returns null if not found, never undefined
}

export function hasUser(id) {
  return users.has(id)
}

export function removeUser(id) {
  return users.delete(id)   // returns true if deleted, false if not found
}
```

```text
Public API of user-store.js:
  addUser(id, name, email)  → undefined (throws if id exists)
  getUser(id)               → user object or null
  hasUser(id)               → boolean
  removeUser(id)            → boolean

Private implementation:
  users (Map)               → could change to a database query tomorrow

The public API answers: what can callers do with this module?
The private implementation answers: how does it work internally?

Callers write code like:
  if (!hasUser(userId)) addUser(userId, name, email)

They do not write:
  if (!users.has(userId)) users.set(userId, ...)
  — because users is private. They cannot.
```

**CS lens:** The concept of a public API with private implementation is an application of **information hiding** — the principle formulated by David Parnas in 1972, which states that each module should hide a design decision that is likely to change. The Map in user-store.js is a design decision that could change (to a database, to a different data structure). Hiding it means that change is localised to the module. Information hiding is the theoretical foundation of encapsulation in object-oriented programming, interfaces in typed systems, and abstract data types in computer science.

## Designing a stable API

An API is stable when its callers can predict its behaviour completely from the function name and parameters, without reading the implementation.

```javascript
// FRAGILE API: callers must know implementation details

export function getUsers() {
  return users   // returns the internal Map
  // Callers write: store.getUsers().get(id)
  // If you change from Map to Array, every caller breaks.
}

// STABLE API: callers work with what they need

export function getUserById(id) {
  return users.get(id) ?? null
  // Callers write: store.getUserById(id)
  // The internal structure can change without affecting callers.
}

export function getAllUsers() {
  return Array.from(users.values())
  // Callers get a plain array — no Map knowledge required.
  // The internal Map could become a database query. Same return value.
}
```

```text
Properties of a stable API:

  MINIMAL      — expose only what callers genuinely need.
                 Every public export is a commitment.

  CONSISTENT   — similar operations look similar.
                 getUser(id) and removeUser(id), not getUser(id) and deleteById(id).

  PREDICTABLE  — the return value is the same type in every case.
                 getUser() returns null when not found — not undefined, not false,
                 not an error. Callers have one thing to check.

  HONEST       — the function name matches what the function does.
                 A function named getUser() should not modify users as a side effect.

  MINIMAL SURFACE — fewer exports = fewer things that can break when internals change.
```

**SE lens:** The public API of a module is the interface between its author and its callers. In a team, this interface is a social contract — other developers depend on it, and changing it without notice breaks their code. In open-source, breaking the public API between versions is called a "breaking change" and requires a major version bump (semantic versioning). The discipline of distinguishing public from private before you write the implementation is the discipline of thinking about your callers before thinking about your own convenience.

**Common mistakes:**
- Exporting everything "just in case" — this creates a wide API surface where every internal detail is a commitment. Callers will use whatever you export. Export only what callers actually need.
- Leaking internal types — returning a Map when callers only need to iterate values, returning a database model object when callers only need three fields. Convert to the simplest type the caller needs at the module boundary.
- Mutable public state — `export const config = { ... }` exposes an object that any caller can mutate. Use getter functions instead, or freeze the object.

**Debug tip:** When changing a private function requires updating multiple callers, that function was not actually private — something depended on it directly. Grep the codebase for the function name to find all callers. If they exist outside the module, it was implicitly public. Make it explicitly public with a stable signature, or make callers stop depending on it.

## Challenge: design_module_api

Design the public API for a shopping cart module. The cart stores items (each with a name, price, and quantity) and calculates totals.

```challenge
// Define what the public API should look like.
// Each value should be a function signature as a string.
// Example: "addItem(name, price, quantity)"
const cartAPI = {
  // Add an item to the cart (or increase quantity if it already exists):
  add: '',

  // Remove an item from the cart entirely by name:
  remove: '',

  // Get the current quantity of a specific item (0 if not in cart):
  getQuantity: '',

  // Get the total price of everything in the cart:
  getTotal: '',

  // Get all items as a plain array (not the internal data structure):
  getItems: '',
}
```

```test
assert cartAPI.add !== '' && cartAPI.remove !== '' && cartAPI.getQuantity !== '' && cartAPI.getTotal !== '' && cartAPI.getItems !== ''
assert cartAPI.add.includes('(') && cartAPI.add.includes('name') && (cartAPI.add.includes('price') || cartAPI.add.includes('cost'))
assert cartAPI.remove.includes('(') && cartAPI.remove.includes('name')
assert cartAPI.getQuantity.includes('(') && cartAPI.getQuantity.includes('name')
assert cartAPI.getTotal.includes('(') && cartAPI.getTotal.includes(')')
assert cartAPI.getItems.includes('(') && cartAPI.getItems.includes(')')
```
