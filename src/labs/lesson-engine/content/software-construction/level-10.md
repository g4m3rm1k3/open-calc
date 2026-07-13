---
series: software-construction
level: 10
title: Organising Larger Projects
lang: javascript
---

# Organising Larger Projects

A single-file program becomes a multi-file project when it grows too large to hold in one head. How you organise that project is not a matter of taste — it is a structural decision that determines how quickly developers can find what they are looking for, how much code must be understood to change one feature, and how the codebase scales as the team grows.

The fundamental question of project organisation is: what belongs together? The answer reveals the architecture. Two competing principles guide the answer: organise by **technical role** (group all controllers, all models, all services) or organise by **feature** (group everything related to users, everything related to orders, everything related to payments). The choice has consequences that become visible at scale.

By the end of this lesson you will understand how to structure a project by feature, design clear boundaries between modules, define what is public and private about each feature, and avoid the structures that look reasonable at small scale but collapse at large scale.

## Technical role vs feature organisation

```text
TECHNICAL ROLE (common in small projects, problematic at scale):

  src/
    controllers/
      user-controller.js
      order-controller.js
      payment-controller.js
    models/
      user-model.js
      order-model.js
      payment-model.js
    services/
      user-service.js
      order-service.js
      payment-service.js
    utils/
      email.js
      validation.js

  Adding a new "invoice" feature touches 4 directories (controller, model, service, utils).
  Deleting a feature requires hunting across 4 directories.
  Understanding "how does payment work?" requires reading across 4 directories.

FEATURE-ORGANISED (cohesive, scales well):

  src/
    users/
      users-controller.js
      users-service.js
      users-model.js
      users.test.js
    orders/
      orders-controller.js
      orders-service.js
      orders-model.js
      orders.test.js
    payments/
      payments-controller.js
      payments-service.js
      payments-model.js
      payments.test.js
    shared/
      email.js
      validation.js

  Adding a new "invoice" feature: create an invoices/ directory.
  Deleting payments: delete the payments/ directory.
  Understanding how payments work: read the payments/ directory.
```

```text
When technical-role organisation wins:
  Small projects (< ~5 features) where the overhead of feature directories is not yet justified.
  Projects with very few file types (e.g. only services, no controllers).

When feature organisation wins:
  Everything else. The day the project grows beyond a handful of features,
  feature organisation saves more time than it costs.
```

## Module boundaries: public vs private

Each feature is a module. Each module has a public API (what other modules may use) and a private implementation (what other modules may not depend on).

```javascript
// users/index.js — the public interface of the users feature
// Everything exported here is the "public API" of the users feature.
// Other features may only import from users/index.js, never from users/users-service.js directly.

export { getUser, createUser, updateUser } from './users-service.js'
export { UserNotFoundError }              from './users-errors.js'
// users-model.js, users-db.js, users-validator.js are private — not exported here
```

```javascript
// orders/orders-service.js — uses users via its public API only
import { getUser } from '../users/index.js'   // CORRECT: uses the public API

// import { findUserInDatabase } from '../users/users-db.js'   // WRONG: bypasses the boundary
```

```text
Why boundaries matter:

  If orders/ imports from users/users-db.js directly, then:
    Renaming a private function in users-db.js breaks orders/.
    Moving the users database table breaks orders/.
    The users team cannot change their internals without checking if orders/ will break.

  If orders/ imports only from users/index.js, then:
    The users team can freely change any internal file — the public API is stable.
    orders/ depends on: "I can get a user by id." Nothing more.

Barrel file (index.js) as boundary: one file defines the contract.
Everything else is an implementation detail.
```

**CS lens:** The pattern of `index.js` as the public interface is an implementation of the **information hiding** principle that David Parnas articulated in 1972: "Every module must hide from all other modules the design decision it is most likely to have to change." The decision to use PostgreSQL for users, or to cache users in Redis, or to validate users with Zod — all of these are hidden behind the users module's public API. Other modules are insulated from those decisions.

## Shared code: the shared/ directory

Some utilities are used by multiple features and belong to neither. These live in `shared/`.

```text
shared/ contains: code with no business logic, used by two or more features.
  email.js       — sends emails (used by users/ and orders/)
  validation.js  — validates inputs (used everywhere)
  logger.js      — logging utility (used everywhere)
  http-client.js — makes HTTP requests (used by payments/ and inventory/)

shared/ does NOT contain:
  Business logic that happens to be used twice — find its actual home.
  Things added to shared/ "just in case" they're needed elsewhere.
  The entire codebase, refactored into shared/ to avoid duplication.

The rule: code moves to shared/ when two separate features actually need it.
Not when you predict they might.
```

**SE lens:** The entropy of a codebase is measured partly by how much of it lives in "shared" vs "owned" locations. Code in `shared/` has no clear owner — any team can add to it, any team can break it. In large organisations, a bloated `shared/` or `utils/` directory is often the first place that slows down all teams simultaneously, because every change requires checking whether it breaks everyone else. The discipline of keeping `shared/` small — adding only code that is genuinely utility, not business logic — is what keeps the shared layer from becoming a bottleneck.

**Common mistakes:**
- Using `shared/` as `utils/` — shared business logic has a home (the feature it belongs to). If it feels homeless, the feature boundary is drawn wrong, not that it belongs in shared.
- Importing across feature boundaries without going through `index.js` — this is the most common violation. Add a linting rule to enforce it: no imports that go deeper than another feature's `index.js`.
- Circular dependencies between features — `users/` imports from `orders/`, `orders/` imports from `users/`. If this happens, one of the features needs to be split or a shared concept needs to be extracted.

**Debug tip:** When "changing one thing broke something unexpected," find the import that crossed a module boundary without going through the public API. That import is where the coupling is. The broken test reveals the hidden dependency.

## Challenge: reorganise_project

Given this flat project, describe the correct feature-organised structure by filling in which file belongs in which directory.

```challenge
// Current flat structure:
// user-controller.js, user-service.js, user-model.js
// order-controller.js, order-service.js, order-model.js
// email-utils.js, date-utils.js

const reorganised = {
  // List the files that belong in each directory (use the original filename, e.g. 'user-service.js')
  'users/': [],
  'orders/': [],
  'shared/': [],
}

// Which file is the public API (index.js equivalent) barrel file for users/?
const usersPublicApiFile = ''   // e.g. 'users/index.js'

// What should users/index.js export from users-service.js?
const usersExports = []   // array of function name strings, e.g. ['getUser', 'createUser']
```

```test
assert reorganised['users/'].includes('user-controller.js') && reorganised['users/'].includes('user-service.js') && reorganised['users/'].includes('user-model.js')
assert reorganised['orders/'].includes('order-controller.js') && reorganised['orders/'].includes('order-service.js') && reorganised['orders/'].includes('order-model.js')
assert reorganised['shared/'].includes('email-utils.js') && reorganised['shared/'].includes('date-utils.js')
assert usersPublicApiFile.includes('users') && usersPublicApiFile.includes('index')
assert Array.isArray(usersExports) && usersExports.length > 0
```
