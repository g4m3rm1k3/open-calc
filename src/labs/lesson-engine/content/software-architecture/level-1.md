---
series: software-architecture
level: 1
title: Architectural Styles
lang: javascript
---

# Architectural Styles

An architectural style is a named, repeatable solution to a recurring structural problem — the same concept as a design pattern, but at the system level. Layered architecture was formalised by Dijkstra in 1968 (THE operating system). Event-driven architecture emerged in the 1980s in GUI frameworks. Microservices as a term was coined at a 2011 workshop at Venice. Each style has well-understood quality attribute trade-offs. Choosing a style is not a question of which is best — it is a question of which trade-offs match the actual requirements. By the end of this lesson you will understand four foundational styles and the conditions under which each is appropriate.

## Layered Architecture — Horizontal Tiers

Components are organised into horizontal layers. Dependencies flow strictly downward — presentation calls business, business calls data access, never the reverse.

```javascript
// Simulating a layered architecture in JavaScript:
// Each layer is a module that only calls the layer below it.

// DATA ACCESS LAYER — talks to persistence
function createUserRepository() {
  const store = new Map([
    [1, { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' }],
    [2, { id: 2, name: 'Bob',   email: 'bob@example.com',   role: 'user'  }],
  ])
  return {
    findById(id) { return store.get(id) || null },
    findAll()    { return [...store.values()] },
    save(user)   { store.set(user.id, user); return user },
  }
}

// BUSINESS LAYER — domain rules, no knowledge of HTTP or database
function createUserService(userRepository) {
  return {
    getUser(id) {
      const user = userRepository.findById(id)
      if (!user) throw new Error(`User ${id} not found`)
      return user
    },
    promoteToAdmin(id, requesterId) {
      const requester = userRepository.findById(requesterId)
      if (!requester || requester.role !== 'admin') throw new Error('Only admins can promote users')
      const user = userRepository.findById(id)
      if (!user) throw new Error(`User ${id} not found`)
      return userRepository.save({ ...user, role: 'admin' })
    },
    listUsers() { return userRepository.findAll() },
  }
}

// PRESENTATION LAYER — HTTP concerns, no domain logic
function createUserController(userService) {
  return {
    handleGet(req) {
      try {
        const user = userService.getUser(Number(req.params.id))
        return { status: 200, body: user }
      } catch (e) {
        return { status: 404, body: { error: e.message } }
      }
    },
    handlePromote(req) {
      try {
        const user = userService.promoteToAdmin(Number(req.params.id), req.userId)
        return { status: 200, body: user }
      } catch (e) {
        return { status: 403, body: { error: e.message } }
      }
    },
  }
}

// Wire the layers together:
const repo       = createUserRepository()
const service    = createUserService(repo)
const controller = createUserController(service)

console.log('GET /users/1:')
console.log(controller.handleGet({ params: { id: '1' } }))

console.log('\nGET /users/99:')
console.log(controller.handleGet({ params: { id: '99' } }))

console.log('\nPROMOTE /users/2 (by admin 1):')
console.log(controller.handlePromote({ params: { id: '2' }, userId: 1 }))

console.log('\nPROMOTE /users/2 (by non-admin 2):')
console.log(controller.handlePromote({ params: { id: '2' }, userId: 2 }))
```

```text
GET /users/1:
{ status: 200, body: { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' } }

GET /users/99:
{ status: 404, body: { error: 'User 99 not found' } }

PROMOTE /users/2 (by admin 1):
{ status: 200, body: { id: 2, name: 'Bob', email: 'bob@example.com', role: 'admin' } }

PROMOTE /users/2 (by non-admin 2):
{ status: 403, body: { error: 'Only admins can promote users' } }
```

**CS lens:** Layered architecture enforces the **Dependency Inversion Principle**: high-level modules (business logic) do not depend on low-level modules (database). The business layer depends on the `userRepository` interface, not on PostgreSQL specifically. You can swap the data access layer for a different database — or an in-memory mock in tests — without touching business logic. This is why each layer can be tested in isolation.

**SE lens:** The key discipline is that **dependencies only flow down**. When you find yourself importing from a lower layer into the presentation layer, bypassing the business layer, that is an architecture violation. Dependency violations are how layered architectures decay into big balls of mud.

## Event-Driven Architecture — Decoupled Publishers and Consumers

Components communicate by emitting events. The publisher does not know who consumes the event, or whether anyone does.

```javascript
// Simulating an event bus and event-driven system:
function createEventBus() {
  const handlers = new Map()
  return {
    publish(eventType, payload) {
      const subscribers = handlers.get(eventType) || []
      console.log(`[EventBus] published: ${eventType}`, JSON.stringify(payload))
      subscribers.forEach(handler => {
        try { handler(payload) }
        catch (e) { console.log(`[EventBus] handler error: ${e.message}`) }
      })
    },
    subscribe(eventType, handler) {
      const existing = handlers.get(eventType) || []
      handlers.set(eventType, [...existing, handler])
    },
  }
}

const bus = createEventBus()

// Services subscribe to events independently — order service doesn't know about these:
bus.subscribe('order.placed', ({ orderId, userId, total }) => {
  console.log(`[PaymentService] charging ${total} for order ${orderId}`)
})

bus.subscribe('order.placed', ({ orderId, items }) => {
  console.log(`[InventoryService] reserving ${items.length} items for order ${orderId}`)
})

bus.subscribe('order.placed', ({ orderId, userId }) => {
  console.log(`[NotificationService] emailing user ${userId} about order ${orderId}`)
})

// The order service only knows about placing orders — not who cares:
function placeOrder(bus) {
  return function(userId, items) {
    const orderId = Math.random().toString(36).slice(2, 8)
    const total = items.reduce((sum, i) => sum + i.price, 0)
    // Single publish triggers all subscribers:
    bus.publish('order.placed', { orderId, userId, items, total })
    return orderId
  }
}

const order = placeOrder(bus)
console.log('\n--- Placing order ---')
const id = order(42, [{ name: 'Widget', price: 19.99 }, { name: 'Gadget', price: 49.99 }])
console.log(`order id: ${id}`)
```

```text
--- Placing order ---
[EventBus] published: order.placed {"orderId":"abc123","userId":42,"items":[...],"total":69.98}
[PaymentService] charging 69.98 for order abc123
[InventoryService] reserving 2 items for order abc123
[NotificationService] emailing user 42 about order abc123
order id: abc123
```

Execution trace — adding a new consumer requires zero changes to OrderService:
```text
1. New requirement: audit log for all orders
2. Add: bus.subscribe('order.placed', ({ orderId }) => audit.log(orderId))
3. OrderService code: unchanged
4. This is the extensibility win of event-driven architecture
```

**CS lens:** Event-driven architecture implements the **Observer pattern** at the system level. Each subscriber is a concrete observer; the event bus is the subject. The key invariant: the publisher cannot make assertions about downstream state — it fires an event and moves on. This creates **temporal decoupling**: consumers can be added, removed, or unavailable without affecting the publisher.

**SE lens:** The challenge is **eventual consistency**. After `order.placed`, the payment may not be charged for 200ms (the PaymentService processes it asynchronously). During that window, the order is placed but not paid. The system must be designed to handle this: idempotent handlers, compensation events (`payment.failed` → `order.cancelled`), and visibility into the event pipeline.

## Microservices — Independent Deployable Services

Each service owns its data, its deployment, and its runtime. Services communicate through defined APIs.

```javascript
// Simulating two services communicating over an HTTP-like interface:
function createUserServiceApp() {
  const users = new Map([
    [1, { id: 1, name: 'Alice', email: 'alice@example.com' }]
  ])
  // This service owns /users/* — no other service touches its database
  return {
    async GET(path) {
      const match = path.match(/^\/users\/(\d+)$/)
      if (match) {
        const user = users.get(Number(match[1]))
        if (!user) return { status: 404, body: { error: 'not found' } }
        return { status: 200, body: user }
      }
      return { status: 404, body: { error: 'not found' } }
    }
  }
}

function createOrderServiceApp(userServiceClient) {
  const orders = new Map()
  return {
    async POST(path, body) {
      if (path === '/orders') {
        // Order service calls User service to validate user — cross-service call
        const resp = await userServiceClient.GET(`/users/${body.userId}`)
        if (resp.status !== 200) {
          return { status: 400, body: { error: `invalid user: ${resp.body.error}` } }
        }
        const orderId = Date.now()
        orders.set(orderId, { id: orderId, userId: body.userId, items: body.items })
        return { status: 201, body: orders.get(orderId) }
      }
      return { status: 404, body: { error: 'not found' } }
    }
  }
}

async function demonstrateMicroservices() {
  const userService  = createUserServiceApp()
  const orderService = createOrderServiceApp(userService)  // inject as HTTP client

  console.log('--- Valid order ---')
  const r1 = await orderService.POST('/orders', { userId: 1, items: ['widget'] })
  console.log(`status: ${r1.status}`, r1.body)

  console.log('\n--- Invalid user ---')
  const r2 = await orderService.POST('/orders', { userId: 99, items: ['gadget'] })
  console.log(`status: ${r2.status}`, r2.body)
}

demonstrateMicroservices()
```

```text
--- Valid order ---
status: 201 { id: 1234567890, userId: 1, items: [ 'widget' ] }

--- Invalid user ---
status: 400 { error: 'invalid user: not found' }
```

**CS lens:** Every cross-service call introduces a **network failure mode** that doesn't exist in a monolith. The User service may be slow, overloaded, or down. The Order service must handle all of these: timeouts, retries with backoff, circuit breakers. The fallacies of distributed computing (Peter Deutsch, 1994): "the network is reliable," "latency is zero," "bandwidth is infinite," "the network is secure" — all false, all biting microservice teams.

## Non-Usage

- **Do not use microservices** when team size < 10, domain boundaries are unclear, or operational maturity (monitoring, CI/CD, on-call) is low — "distributed monolith" is worse than a simple monolith
- **Do not use event-driven** when strong consistency is required (financial transactions) — events give eventual consistency
- **Do not use layered** when the performance overhead of multiple layers is unacceptable in the hot path

## Challenge: style_selector

Implement an architecture style recommender based on system requirements.

`createStyleSelector()` — returns an object with:
- `.recommend(requirements)` — `requirements` is `{ teamSize: number, needsIndependentScaling: boolean, manyDownstreamEffects: boolean, prioritiseMaintainability: boolean, clearDomainBoundaries: boolean }`; returns `{ style: string, reason: string }`

Rules (apply in order, first match wins):
1. `teamSize < 5` → `'modular-monolith'`
2. `needsIndependentScaling && clearDomainBoundaries && teamSize >= 10` → `'microservices'`
3. `manyDownstreamEffects && !needsIndependentScaling` → `'event-driven'`
4. `prioritiseMaintainability` → `'layered'`
5. default → `'modular-monolith'`

```challenge
function createStyleSelector() {
  return {
    recommend(requirements) {
      return { style: 'modular-monolith', reason: '' }
    },
  }
}
```

```test
const sel = createStyleSelector()
const r1 = sel.recommend({ teamSize: 3, needsIndependentScaling: true, manyDownstreamEffects: false, prioritiseMaintainability: true, clearDomainBoundaries: true })
assert r1.style === 'modular-monolith'
const r2 = sel.recommend({ teamSize: 15, needsIndependentScaling: true, manyDownstreamEffects: false, prioritiseMaintainability: false, clearDomainBoundaries: true })
assert r2.style === 'microservices'
const r3 = sel.recommend({ teamSize: 8, needsIndependentScaling: false, manyDownstreamEffects: true, prioritiseMaintainability: false, clearDomainBoundaries: false })
assert r3.style === 'event-driven'
const r4 = sel.recommend({ teamSize: 6, needsIndependentScaling: false, manyDownstreamEffects: false, prioritiseMaintainability: true, clearDomainBoundaries: false })
assert r4.style === 'layered'
assert typeof r1.reason === 'string' && r1.reason.length > 0
```
