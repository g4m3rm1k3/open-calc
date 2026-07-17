---
concept: 147-monolithic-architecture
name: Monolithic Architecture
---

## Definition

A monolithic architecture builds an entire application as a single,
unified codebase and deployable unit — every feature (users, orders,
payments) runs together in one process, sharing the same codebase,
database, and deployment pipeline.

## Problem

Choosing an architecture style up front matters — a monolith is simpler
to develop, test, and deploy when a team and system are small (one
codebase to run, one deployment to manage, function calls instead of
network calls between features), but that simplicity becomes a liability
at large scale (every change requires redeploying everything, every
feature shares the same failure domain). Recognizing which stage a
project is in is the actual engineering decision, not "monolith bad,
microservices good."

## Execution

Single codebase: a Users module, an Orders module, a Payments module —
all imported and called directly, in-process
↓
Deploy: ONE build, ONE deployment — the whole application ships together
as a unit
↓
Orders module needs user data — a direct, in-process function call (fast,
no network involved, can't "time out")
↓
A bug in the Payments module crashes the process — this takes down the
Users and Orders modules too, since they all share the same process
↓
Scaling: to handle more traffic, the WHOLE application gets more
instances — there's no way to scale just Orders independently

## Computer Science

A monolith trades away the independent-scaling and
independent-failure-domain benefits of microservices in exchange for
dramatically simpler development and operations — no network calls
between features (all calls are in-process function calls, faster and
can't fail due to network issues), one database (no cross-service data
consistency problem), one deployment pipeline (no service-discovery or
versioning-across-services complexity).

Tags: Single deployable unit, Shared failure domain, In-process calls, Operational simplicity

## Software Engineering

"Monolith-first" is a common, well-regarded strategy — start with a
well-organized monolith (with clear internal module boundaries), and only
split out a piece into its own microservice once there's a genuine,
demonstrated need (that specific piece needs independent scaling, a
separate team owns it, etc.) — splitting prematurely adds real
distributed-systems complexity without a corresponding benefit yet.

Tags: Monolith-first, Modular monolith, Premature distribution

## Common Mistakes

- Building a monolith with NO internal module boundaries (everything freely calling everything else, no clear separation) — this makes it much harder to eventually extract a piece into its own service if that becomes necessary, and makes the codebase itself harder to reason about even if it never needs to be split.
- Assuming a monolith can't scale at all — a monolith can still be scaled by running multiple identical copies of the ENTIRE application behind a load balancer; it just can't scale ONE PIECE independently of the others.

## Exercises

- Identify one thing a monolith makes simpler than microservices (deployment, cross-feature function calls, data consistency) and explain specifically why.
- Trace through what happens to ALL of a monolith's features if one unrelated feature's code has a crashing bug, versus what would happen in the equivalent microservices setup.

## javascript

```javascript
// Simulating the shared-failure-domain and in-process-call characteristics
// of a monolith directly.
class Monolith {
  #usersDown = false

  getUser(id) {
    if (this.#usersDown) throw new Error('crash in users module')
    return { id, name: 'Alice' }
  }

  // Orders calls Users directly, in-process -- no network involved
  getOrderWithUser(orderId, userId) {
    const user = this.getUser(userId)   // direct function call, not a network request
    return { orderId, user }
  }

  crashUsersModule() { this.#usersDown = true }
}

const app = new Monolith()
console.log(app.getOrderWithUser(1, 42))   // { orderId: 1, user: { id: 42, name: 'Alice' } } -- works fine

app.crashUsersModule()
try {
  app.getOrderWithUser(2, 42)   // Orders module ALSO fails now, even though its own code is fine
} catch (err) {
  console.log(err.message)   // 'crash in users module' -- the shared process brings Orders down too
}
```
Walkthrough: `getOrderWithUser` calls `getUser` as a plain, direct,
in-process function call — no network round-trip. Once `#usersDown` is
set, the SAME shared process fails for Orders too, even though Orders'
own logic never changed — demonstrating the shared-failure-domain
tradeoff a monolith accepts in exchange for simpler, faster in-process
calls.

## python

```python
class Monolith:
    def __init__(self):
        self._users_down = False

    def get_user(self, user_id):
        if self._users_down:
            raise RuntimeError('crash in users module')
        return {'id': user_id, 'name': 'Alice'}

    # Orders calls Users directly, in-process -- no network involved
    def get_order_with_user(self, order_id, user_id):
        user = self.get_user(user_id)   # direct function call, not a network request
        return {'order_id': order_id, 'user': user}

    def crash_users_module(self):
        self._users_down = True


app = Monolith()
print(app.get_order_with_user(1, 42))   # {'order_id': 1, 'user': {'id': 42, 'name': 'Alice'}} -- works fine

app.crash_users_module()
try:
    app.get_order_with_user(2, 42)   # Orders module ALSO fails now, even though its own code is fine
except RuntimeError as err:
    print(err)   # crash in users module -- the shared process brings Orders down too
```
Walkthrough: identical shared-process mechanics as the JavaScript version
— `get_order_with_user` calls `get_user` directly in-process, and once
the users module "crashes," Orders fails too despite its own logic being
unaffected.
