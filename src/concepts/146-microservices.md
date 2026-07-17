---
concept: 146-microservices
name: Microservices
---

## Definition

A microservices architecture splits an application into multiple small,
independently deployable services, each responsible for one specific
piece of functionality, communicating with each other over a network
(typically HTTP/REST or messaging) rather than through in-process
function calls.

## Problem

A single large application (monolith) handling everything (users,
orders, payments, inventory) in one codebase and one deployable unit
means EVERY change requires redeploying the entire application, and a bug
or crash in one feature can take down the whole system. Microservices let
each piece scale, deploy, and fail independently — a bug in the
"recommendations" service doesn't take down "checkout."

## Execution

Monolith: one process handles users, orders, and payments — all in one
codebase, one deployment
↓
Split into microservices: a Users service, an Orders service, a Payments
service — each its own separate process/deployment
↓
Orders service needs user data — it makes a NETWORK request to the Users
service (not a direct function call, since they're separate processes)
↓
Users service crashes — Orders and Payments keep running independently,
only features actually depending on Users are affected
↓
Scaling: if Orders gets 10x the traffic, ONLY the Orders service needs
more instances — Users and Payments stay as they are

## Computer Science

This trades in-process function calls (fast, reliable, same failure
domain) for network calls between independent services (slower, can fail
independently, requires handling partial failure) — a genuinely different
reliability model where the network itself becomes a real, must-be-
handled source of failure, in ways an in-process function call never
could.

Tags: Distributed systems, Network reliability, Service boundaries, Independent deployability

## Software Engineering

Microservices introduce real operational complexity — service discovery
(how does Orders find where Users currently lives), distributed tracing
(following one user's request across many services), and data consistency
across services (see Transactions/ACID, which get much harder once data
lives in separate databases) — this complexity is a genuine cost, not
free, and a monolith is often the better starting point until a
team/system actually needs the independent-scaling and
independent-deployment benefits.

Tags: Service discovery, Distributed tracing, Operational complexity, Monolith-first

## Common Mistakes

- Adopting microservices before an application actually needs the independent scaling/deployment benefits — the added network, deployment, and consistency complexity is a real cost that isn't justified for a small team or early-stage product.
- Splitting services along the wrong boundaries (e.g., by technical layer instead of business capability), resulting in services that constantly need to call each other for basic operations — defeating the goal of independent deployability.

## Exercises

- Trace through what happens to the OTHER services if the Payments service in the example above goes down — which parts of the system keep working, and which break?
- Identify one specific new failure mode (a network timeout, a version mismatch between services) that a monolith simply doesn't have to worry about, since everything runs in one process.

## javascript

```javascript
// Simulating the independent-failure-domain contrast: a monolith where one
// crashing feature takes everything down, vs. microservices where it doesn't.
function monolithHandleRequest(path, servicesUp) {
  // in a monolith, ALL features live in ONE process -- if the process is down, EVERYTHING is down
  if (!servicesUp.monolith) return { status: 503, path }
  return { status: 200, path }
}

function microserviceHandleRequest(path, serviceName, servicesUp) {
  // in microservices, each service can be down INDEPENDENTLY of the others
  if (!servicesUp[serviceName]) return { status: 503, path }
  return { status: 200, path }
}

// Payments service crashes
const monolithDown = { monolith: false }
const microservicesPartialDown = { users: true, orders: true, payments: false }

console.log(monolithHandleRequest('/users', monolithDown))     // { status: 503, ... } -- EVERYTHING down, even unrelated features
console.log(monolithHandleRequest('/orders', monolithDown))    // { status: 503, ... } -- same crash takes this down too

console.log(microserviceHandleRequest('/users', 'users', microservicesPartialDown))      // { status: 200, ... } -- unaffected
console.log(microserviceHandleRequest('/orders', 'orders', microservicesPartialDown))     // { status: 200, ... } -- unaffected
console.log(microserviceHandleRequest('/payments', 'payments', microservicesPartialDown)) // { status: 503, ... } -- only THIS one is down
```
Walkthrough: in the monolith simulation, a single `monolith: false` flag
takes down BOTH `/users` and `/orders`, since everything shares one
process. In the microservices simulation, only the `payments` service is
down — `/users` and `/orders` continue returning `200` normally,
demonstrating the independent-failure-domain benefit microservices are
specifically designed to provide.

## python

```python
def monolith_handle_request(path, services_up):
    # in a monolith, ALL features live in ONE process -- if the process is down, EVERYTHING is down
    if not services_up['monolith']:
        return {'status': 503, 'path': path}
    return {'status': 200, 'path': path}


def microservice_handle_request(path, service_name, services_up):
    # in microservices, each service can be down INDEPENDENTLY of the others
    if not services_up[service_name]:
        return {'status': 503, 'path': path}
    return {'status': 200, 'path': path}


# Payments service crashes
monolith_down = {'monolith': False}
microservices_partial_down = {'users': True, 'orders': True, 'payments': False}

print(monolith_handle_request('/users', monolith_down))     # {'status': 503, ...} -- EVERYTHING down, even unrelated features
print(monolith_handle_request('/orders', monolith_down))    # {'status': 503, ...} -- same crash takes this down too

print(microservice_handle_request('/users', 'users', microservices_partial_down))      # {'status': 200, ...} -- unaffected
print(microservice_handle_request('/orders', 'orders', microservices_partial_down))    # {'status': 200, ...} -- unaffected
print(microservice_handle_request('/payments', 'payments', microservices_partial_down)) # {'status': 503, ...} -- only THIS one is down
```
Walkthrough: identical independent-failure-domain contrast as the
JavaScript version — the monolith's single "down" flag takes out every
feature, while the microservices simulation shows only the
actually-crashed service failing.
