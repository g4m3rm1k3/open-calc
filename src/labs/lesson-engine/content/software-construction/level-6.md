---
series: software-construction
level: 6
title: Data Modeling
lang: javascript
---

# Data Modeling

Every program manipulates data. The shape of that data — which fields exist, how they relate, what values are valid — is not an implementation detail. It is a fundamental design decision that every other part of the program depends on. Get the data model wrong and every function that touches it is built on a bad foundation.

Data modeling is the discipline of deciding how to represent the information your program works with, before writing the logic that processes it. The right model makes the logic simple and obvious. The wrong model makes logic convoluted, defensive, and full of special cases.

By the end of this lesson you will be able to choose data shapes that match the problem domain, validate data at the boundary where it enters your program, and avoid the common traps that make data models a source of bugs rather than a source of clarity.

## Choosing the right shape

The shape of data should reflect the structure of the problem, not the structure of the storage system or the API that provided it.

```javascript
// Raw data from an external API (what you receive):
const apiResponse = {
  usr_id: 'u_123',
  usr_nm: 'jane_doe',
  usr_email: 'jane@example.com',
  usr_created_ts: 1704067200,
  usr_roles: 'admin,editor',    // comma-separated string
  usr_active: 1,                // 0 or 1, not boolean
}

// Domain model (what your program works with):
const user = {
  id: 'u_123',
  username: 'jane_doe',
  email: 'jane@example.com',
  createdAt: new Date(1704067200 * 1000),
  roles: ['admin', 'editor'],   // array, not string
  isActive: true,               // boolean, not number
}
```

```text
The domain model does not leak the API's quirks into the rest of the program.

Functions that work with users receive: user.roles (an array).
They write: user.roles.includes('admin').

If they received the raw API shape, they would write:
  user.usr_roles.split(',').includes('admin')

That is API knowledge spread throughout the codebase. If the API changes
its format, every function that parses roles must change.

Map at the boundary. Work with the domain model everywhere else.
```

## Validating data at the boundary

Data enters a program from the outside — from users, from APIs, from files, from databases. At every entry point, data should be validated and normalised before it moves deeper into the system.

```javascript
// The boundary function: validates and transforms external data
function parseUserFromAPI(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('parseUserFromAPI: expected an object')
  }
  if (typeof raw.usr_id !== 'string' || !raw.usr_id) {
    throw new Error('parseUserFromAPI: usr_id is required')
  }
  if (typeof raw.usr_email !== 'string' || !raw.usr_email.includes('@')) {
    throw new Error('parseUserFromAPI: valid usr_email is required')
  }

  return {
    id: raw.usr_id,
    username: raw.usr_nm || '',
    email: raw.usr_email,
    createdAt: new Date((raw.usr_created_ts || 0) * 1000),
    roles: typeof raw.usr_roles === 'string' ? raw.usr_roles.split(',') : [],
    isActive: raw.usr_active === 1,
  }
}
```

```text
Running parseUserFromAPI(apiResponse):
  raw.usr_id    = 'u_123'     → id: 'u_123'
  raw.usr_nm    = 'jane_doe'  → username: 'jane_doe'
  raw.usr_email = 'jane@...'  → email: 'jane@...' (passes @ check)
  raw.usr_created_ts = 1704067200 → createdAt: new Date(1704067200000)
  raw.usr_roles = 'admin,editor'  → roles: ['admin', 'editor']
  raw.usr_active = 1              → isActive: true

Running parseUserFromAPI({}):
  raw.usr_id is undefined → throws: "usr_id is required"

After parseUserFromAPI() succeeds, the rest of the program trusts the shape.
No defensive checks scattered throughout the codebase. The boundary does the work.
```

**CS lens:** Validating at the boundary and trusting inside is the **parse, don't validate** principle: instead of passing raw data through the program and validating it at every use site, parse raw data at the entry point into a type-safe domain model, then rely on that model being correct everywhere else. This converts a validation problem (repeated everywhere) into a parsing problem (solved once). The concept is formalised in typed systems as **making illegal states unrepresentable** — if the type system cannot represent `isActive = 1`, then functions receiving a valid User object can never encounter that case.

## Choosing between data structures

The shape of the data — object, array, Map, Set — is a choice with consequences for every piece of code that uses it.

```javascript
// Scenario: you have 10,000 users and need to look them up by ID frequently.

// Array of users (wrong choice for frequent lookup by ID):
const users = [
  { id: 'u_001', name: 'Alice' },
  { id: 'u_002', name: 'Bob' },
  // ...
]
// Looking up user u_5000: scan from the beginning → O(n). Slow.
const user = users.find(u => u.id === 'u_5000')

// Map indexed by ID (right choice):
const userMap = new Map([
  ['u_001', { id: 'u_001', name: 'Alice' }],
  ['u_002', { id: 'u_002', name: 'Bob' }],
])
// Looking up u_5000: direct key access → O(1). Instant.
const user = userMap.get('u_5000')
```

```text
Choosing a data structure:

Use an ARRAY when:
  Order matters and you iterate through all items
  Items are accessed by position (first, last, index N)
  You frequently add to the end or remove from the end

Use a MAP when:
  Items are accessed by a unique key (id, username, email)
  You need to check existence frequently: map.has(key)
  Order does not matter

Use a SET when:
  You need a collection of unique values
  You frequently check membership: set.has(value)
  You need to deduplicate: new Set(array)

Use an OBJECT when:
  You have a fixed set of named fields (not a dynamic collection)
  { name: 'Alice', email: '...' } — not Map or Array
```

**SE lens:** The choice between Array and Map for a lookup-heavy collection is not a micro-optimisation. With 10,000 items, finding a user by ID in an Array requires up to 10,000 comparisons on each lookup. With a Map, it requires one. In a request handler that runs 100 times per second and performs 5 user lookups per request, this difference is 5 million comparisons per second vs 500. The data structure choice is the architecture decision that determines whether the system can handle load.

**Common mistakes:**
- Nesting data that should be flat — `{ user: { address: { street: { name: ... } } } }` makes every access a chain of property lookups. If street name is accessed frequently, it should be at a flatter level.
- Arrays of objects where Maps are appropriate — when the primary access pattern is "find item with this id," an array is the wrong structure. Transform to a Map at load time.
- Null in unexpected positions — `{ email: null }` when email is required forces every caller to check for null. An absent email should be represented as an absent field or the absence of the entire object, not as null where a value is expected.

**Debug tip:** When a function has many `if (data.foo && data.foo.bar && ...)` chains, the data model is the wrong shape for the problem. Either the nesting is too deep, or optional fields are not optional in practice. The defensive checks are symptoms of a data model that does not match the logic's assumptions.

## Challenge: model_product

Model a product in an e-commerce system and write the boundary parser.

A raw product from an API looks like: `{ prod_id, prod_title, prod_price_cents, prod_tags, prod_in_stock }` where `prod_price_cents` is an integer (e.g. 1999 for $19.99), `prod_tags` is a comma-separated string, and `prod_in_stock` is 0 or 1.

```challenge
function parseProduct(raw) {
  // Returns: { id, title, priceUsd, tags (array), inStock (boolean) }
  // Throws if prod_id or prod_title is missing
}
```

```test
const p = parseProduct({ prod_id: 'p1', prod_title: 'Hat', prod_price_cents: 1999, prod_tags: 'clothing,sale', prod_in_stock: 1 })
assert p.id === 'p1'
assert p.title === 'Hat'
assert Math.abs(p.priceUsd - 19.99) < 0.001
assert Array.isArray(p.tags) && p.tags.includes('clothing') && p.tags.includes('sale')
assert p.inStock === true
let threw = false; try { parseProduct({ prod_title: 'Hat' }) } catch { threw = true }
assert threw
```
