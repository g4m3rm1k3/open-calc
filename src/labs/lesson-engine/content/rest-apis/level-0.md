---
series: rest-apis
level: 0
title: What REST Is
lang: javascript
---

# What REST Is

REST (Representational State Transfer) is an architectural style for building distributed systems over HTTP. It is not a standard or a protocol — it is a set of constraints that, when followed, produce APIs that are predictable, scalable, and easy to use.

REST was defined by Roy Fielding in his 2000 PhD dissertation. The constraints he described emerged from the design principles behind the web itself: the same reasons a web page is cacheable, addressable by URL, and stateless are the reasons a well-designed REST API behaves the same way. By the end of this lesson you will understand the six REST constraints, how HTTP maps onto them, and how to recognise a well-designed REST API.

## The six REST constraints

```text
REST CONSTRAINT         WHAT IT MEANS                          WHY IT MATTERS
──────────────────────────────────────────────────────────────────────────────
1. Client-Server        Client and server are separate.         Each can evolve independently.
                        Client handles UI; server handles data.  Browser talks to any server.

2. Stateless            Every request contains all the          Servers don't keep session memory.
                        information needed to complete it.       Any server can handle any request.
                        Server holds no session state.           Load balancers can route freely.

3. Cacheable            Responses must declare whether they     Clients and proxies can cache.
                        can be cached. GET /users is cacheable.  Reduces server load, improves speed.
                        POST /users is not.

4. Uniform Interface    All interactions use the same           API surface is predictable.
                        interface: URLs, HTTP methods,           Any client can use any REST API
                        status codes, headers.                   with the same mental model.

5. Layered System       The client cannot tell if it is         Intermediaries (load balancers,
                        talking to the real server or a          CDNs, API gateways) are invisible.
                        proxy/cache/load balancer.

6. Code on Demand       (Optional) Server can send executable   Used for: JS scripts delivered by
                        code to the client.                      a web server. Rarely used in APIs.
```

The most important constraints for API design are **Stateless** and **Uniform Interface**. These two together are what make REST APIs universally understandable and horizontally scalable.

**CS lens:** The stateless constraint is an example of **shared-nothing architecture** — each request is self-contained and carries its full context. This is the same principle behind functional programming (pure functions with no side effects on external state), DNS (each query is independent), and UDP (each packet is independent). Shared-nothing systems are easier to reason about, test, and scale horizontally because there are no hidden state dependencies between requests.

## HTTP as the transport

REST is most commonly implemented over HTTP. HTTP provides the building blocks that REST's uniform interface needs:

```text
HTTP ELEMENT        REST USAGE
──────────────────────────────────────────────────────────────
Methods (verbs)     GET, POST, PUT, PATCH, DELETE → the action
URLs (resources)    /users/42, /orders/99/items → what is being acted on
Status codes        200, 201, 404, 422 → the outcome
Headers             Content-Type, Authorization, Cache-Control → metadata
Body                JSON payload → the data (in POST, PUT, PATCH responses)
```

```text
HTTP METHODS — SAFE AND IDEMPOTENT:

  SAFE:       Does not change server state. Can be called freely.
    → GET, HEAD, OPTIONS

  IDEMPOTENT: Calling it N times produces the same result as calling it once.
    → GET, PUT, DELETE (also safe: GET)
    → POST is NOT idempotent: POST /orders creates a new order each time
    → PATCH is NOT guaranteed idempotent: depends on the operation

  WHY IDEMPOTENCE MATTERS:
    If a client sends a DELETE /users/42 and doesn't get a response (network timeout),
    it can safely retry. The second DELETE is a no-op — the user is already deleted.
    If a client sends POST /orders and doesn't get a response, retrying creates a
    duplicate order. POST requires deduplication logic (idempotency keys).
```

## Resources and URLs

In REST, everything is a **resource**. A resource is a noun — a thing that can be named and addressed. The URL is the resource's address.

```text
RESOURCE DESIGN RULES:

  NOUNS, not verbs:
    ✓ /users           (a collection)
    ✓ /users/42        (a specific user)
    ✓ /users/42/orders (the orders that belong to user 42)
    ✗ /getUser         (verb — not REST)
    ✗ /createOrder     (verb — not REST)
    ✗ /deleteUser?id=42 (verb in URL — not REST)

  PLURAL nouns for collections:
    ✓ /users, /orders, /products
    ✗ /user, /order, /product

  HIERARCHICAL for nested resources:
    ✓ /users/42/orders     (orders belonging to user 42)
    ✓ /orders/99/items     (items in order 99)
    ✗ /getUserOrders?userId=42  (not REST)

  FILTERS as query parameters:
    ✓ GET /users?role=admin&status=active
    ✓ GET /orders?from=2026-01-01&to=2026-06-30
    ✓ GET /products?category=electronics&sort=price&order=asc
```

## CRUD mapped to HTTP

The four basic data operations (Create, Read, Update, Delete) map directly to HTTP methods:

```text
OPERATION   METHOD   URL                BODY            RESPONSE
──────────────────────────────────────────────────────────────────────
Create      POST     /users             { name, email } 201 Created + { id, name, email }
Read all    GET      /users             —               200 OK + [{ id, name, email }, ...]
Read one    GET      /users/42          —               200 OK + { id, name, email }
Update full PUT      /users/42          { name, email } 200 OK + { id, name, email }
Update part PATCH    /users/42          { name }        200 OK + { id, name, email }
Delete      DELETE   /users/42          —               204 No Content

PUT vs PATCH:
  PUT:   Replace the entire resource. Requires the full representation.
         If you omit email in PUT /users/42, email is cleared.
  PATCH: Modify specific fields. Omitted fields are unchanged.
         PATCH /users/42 { name: 'Alice' } only changes the name.

  Use PUT when replacing the whole resource.
  Use PATCH when updating specific fields.
```

**SE lens:** The URL-to-resource mapping is an application of **uniform naming** — a single addressing scheme that applies everywhere. Just as a file system uses `/path/to/file` to address any file, REST uses `/resource/id/sub-resource` to address any data. This uniformity is what makes REST discoverable: a developer who has never seen your API before can guess that `/users/42/orders` returns the orders for user 42, because the pattern is consistent.

**Common mistakes:**
- Verbs in URLs — `/api/getUser`, `/api/createOrder`, `/api/deleteProduct?id=42`. These indicate the developer is thinking about functions, not resources. The HTTP method already carries the verb; the URL carries only the noun (the resource address).
- Inconsistent pluralisation — mixing `/user` and `/products`. Stick to plural nouns throughout.
- Using POST for everything — some APIs use POST for all operations to avoid dealing with the HTTP method. This loses idempotence, cacheability, and the semantic clarity that makes HTTP useful.

**Debug tip:** To inspect what HTTP method and URL an API call is making, open browser DevTools → Network tab → click the request → look at "Method" and "Request URL". For backend development, `curl -v https://api.example.com/users/42` shows the full HTTP conversation including method, headers, response headers, and body. The `-v` flag makes curl verbose.

## Challenge: restDesign

Design REST endpoints for a given scenario.

```challenge
function designEndpoints(scenario) {
  // Returns an array of endpoint descriptions for the given scenario.
  // Each endpoint: { method, path, statusCode, description }
  //
  // Scenarios and their expected endpoints:
  //
  // 'user-crud':
  //   The four standard CRUD operations for a User resource.
  //   Users are at /users. Individual users at /users/:id.
  //   Create → POST 201, Read all → GET 200, Read one → GET 200, Delete → DELETE 204
  //
  // 'order-with-items':
  //   Get all orders: GET /orders → 200
  //   Get a specific order: GET /orders/:id → 200
  //   Get items in an order: GET /orders/:id/items → 200
  //   Add an item to an order: POST /orders/:id/items → 201
}
```

```test
const userEndpoints = designEndpoints('user-crud')
assert Array.isArray(userEndpoints)
assert userEndpoints.length >= 4

const methods = userEndpoints.map(e => e.method)
assert methods.includes('POST')
assert methods.includes('GET')
assert methods.includes('DELETE')

const paths = userEndpoints.map(e => e.path)
assert paths.some(p => p === '/users' || p === '/users/')
assert paths.some(p => p.includes('/users/') && p.includes(':id'))

const statuses = userEndpoints.map(e => e.statusCode)
assert statuses.includes(201)
assert statuses.includes(200)
assert statuses.includes(204)

const orderEndpoints = designEndpoints('order-with-items')
assert orderEndpoints.length >= 4
assert orderEndpoints.some(e => e.path.includes('/orders/') && e.path.includes('/items'))
assert orderEndpoints.some(e => e.method === 'POST' && e.path.includes('/items'))
```
