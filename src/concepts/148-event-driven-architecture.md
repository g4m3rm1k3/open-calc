---
concept: 148-event-driven-architecture
name: Event-Driven Architecture
---

## Definition

In an event-driven architecture, components communicate by emitting and
reacting to events (something happened) rather than by calling each other
directly — a producer emits an event without knowing or caring who (if
anyone) is listening, and any number of independent consumers react to
it.

## Problem

Direct, synchronous calls between components (an Order service directly
calling an Email service, an Inventory service, an Analytics service, one
by one) tightly couples the Order service to knowing about every single
consumer, and adding a new consumer requires modifying the Order
service's code. Event-driven design decouples this: the Order service
just emits an "OrderPlaced" event; any number of consumers (including ones
added LATER) can subscribe to it, with zero changes needed to the Order
service itself.

## Execution

Direct calls (tightly coupled): placing an order directly calls sendEmail(),
updateInventory(), and logAnalytics() — one by one, and must know about
all three
↓
Event-driven: placing an order just emits an "OrderPlaced" event with the
order data — and does NOT know or care who's listening
↓
An Email service, an Inventory service, and an Analytics service each
independently SUBSCRIBE to "OrderPlaced"
↓
When the event fires, all three react independently — the order-placing
code never mentions any of them
↓
Adding a FOURTH consumer later requires ZERO changes to the order-placing
code — it just subscribes to the same existing event

## Computer Science

This inverts the direction of dependency — in direct calls, the producer
depends on (must know about) every consumer; in event-driven design,
consumers depend on the event's existence, and the producer depends on
NOTHING about them. This is the same underlying idea as the Observer
pattern, applied at a system/service level instead of within a single
process.

Tags: Decoupling, Observer pattern, Publish-subscribe, Inversion of dependency

## Software Engineering

Event-driven systems make it easy to ADD new reactions to something
happening without touching existing code (a real, valuable form of
open/closed-principle extensibility), but they make the overall flow of
"what happens when an order is placed" harder to trace by just reading
one service's code — the reactions are scattered across every service
that happens to subscribe, which is a real debugging and readability
tradeoff.

Tags: Extensibility, Traceability tradeoff, Open/closed principle

## Common Mistakes

- Assuming an event's producer knows or should know who's consuming it — this defeats the entire point of decoupling; a producer should never need to change because a NEW consumer was added elsewhere.
- Using events for something that genuinely needs an immediate, guaranteed response (e.g., "did the payment succeed, right now") — events are naturally asynchronous and don't guarantee any particular consumer even ran yet by the time the producer's own code continues, which is wrong for something the caller needs an immediate answer to.

## Exercises

- Trace through what changes in the order-placing code when a new "SendSMSNotification" consumer is added to the "OrderPlaced" event — is it zero, or does that code need to be touched?
- Identify one piece of logic in an app you've used that would be a good fit for direct, synchronous calls (needs an immediate answer) versus one that would fit an event (a side effect that doesn't need to block the main action).

## javascript

```javascript
// Simulating a simple event bus (publish-subscribe) directly, demonstrating
// the producer never needing to know about its consumers.
class EventBus {
  #subscribers = {}
  subscribe(eventName, handler) {
    (this.#subscribers[eventName] ??= []).push(handler)
  }
  emit(eventName, payload) {
    (this.#subscribers[eventName] ?? []).forEach(handler => handler(payload))
  }
}

const bus = new EventBus()
const sideEffects = []

// Consumers subscribe independently -- the order-placing code never lists them
bus.subscribe('OrderPlaced', order => sideEffects.push(`email sent for order ${order.id}`))
bus.subscribe('OrderPlaced', order => sideEffects.push(`inventory updated for order ${order.id}`))

// placeOrder only emits -- it has NO reference to email or inventory logic at all
function placeOrder(id) {
  bus.emit('OrderPlaced', { id })
  return { id, placed: true }
}

console.log(placeOrder(101))   // { id: 101, placed: true } -- placeOrder's own return value, unrelated to its consumers
console.log(sideEffects)       // [ 'email sent for order 101', 'inventory updated for order 101' ] -- both consumers reacted independently
```
Walkthrough: `placeOrder` calls `bus.emit(...)` and has zero direct
reference to the email or inventory logic — both consumers were
registered separately via `subscribe`, entirely decoupled from
`placeOrder`'s own code. Adding a THIRD consumer later would require only
one more `bus.subscribe(...)` call, with no change to `placeOrder`
itself.

## python

```python
class EventBus:
    def __init__(self):
        self._subscribers = {}

    def subscribe(self, event_name, handler):
        self._subscribers.setdefault(event_name, []).append(handler)

    def emit(self, event_name, payload):
        for handler in self._subscribers.get(event_name, []):
            handler(payload)


bus = EventBus()
side_effects = []

# Consumers subscribe independently -- the order-placing code never lists them
bus.subscribe('OrderPlaced', lambda order: side_effects.append(f"email sent for order {order['id']}"))
bus.subscribe('OrderPlaced', lambda order: side_effects.append(f"inventory updated for order {order['id']}"))


# place_order only emits -- it has NO reference to email or inventory logic at all
def place_order(order_id):
    bus.emit('OrderPlaced', {'id': order_id})
    return {'id': order_id, 'placed': True}


print(place_order(101))   # {'id': 101, 'placed': True} -- place_order's own return value, unrelated to its consumers
print(side_effects)       # ['email sent for order 101', 'inventory updated for order 101'] -- both consumers reacted independently
```
Walkthrough: identical publish-subscribe mechanics as the JavaScript
version — `place_order` never references its consumers directly; both
react independently through the shared event bus.
