# SE Masterclass — LAB-22 — Event Bus

**Language: TypeScript (Node.js)** — same module as LAB-21.

**Prerequisites:** LAB-21 (Plugin System) — a plugin PIPELINE is one extension mechanism (linear, ordered). An event bus is a DIFFERENT one: broadcast, many-to-many, and the publisher never even knows who (if anyone) is listening.

**What this lab adds:**
- The Observer pattern: publishers emit events; subscribers react, with neither knowing about the other directly
- `on`/`emit`/`off` — the minimal event bus API, built from LAB-04's hash map and LAB-09's dispatch table
- Type-safe events — TypeScript generics ensuring a listener for `"order:placed"` can't accidentally receive a `"user:login"` payload
- Multiple independent subscribers reacting to ONE event, and error isolation between them (LAB-21's pattern, reused)

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB-21's plugin pipeline, each plugin's OUTPUT fed the next plugin's INPUT. Does an event bus work the same way?
> 2. Component A emits `"order:placed"`. Components B and C both listen for it. Does A need to know B and C exist?
> 3. If one listener for `"order:placed"` throws an error, should the OTHER listeners for the same event still run?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Basic Pub/Sub ===
emit("greet", "Alice") with no listeners: nothing happens, no error

subscribed: logGreeting
emit("greet", "Bob"): [listener] Hello, Bob!

=== Multiple Subscribers, One Event ===
subscribed: emailNotifier
subscribed: inventoryUpdater
subscribed: analyticsTracker
emit("order:placed", {...}):
  [email] confirmation sent for order-1
  [inventory] stock decremented for order-1
  [analytics] tracked order-1

=== Unsubscribing ===
off("order:placed", emailNotifier)
emit("order:placed", {...}) again:
  [inventory] stock decremented for order-2
  [analytics] tracked order-2
  ← emailNotifier did NOT run — it was unsubscribed

=== Decoupled Components ===
OrderComponent never imports EmailComponent or InventoryComponent directly: confirmed
Both react to "order:placed" without OrderComponent knowing they exist: confirmed

=== Listener Error Isolation ===
subscribed: brokenListener, workingListener
emit("test:event"):
  brokenListener threw: simulated listener failure
  [working] this still ran

=== once() — Fire Only One Time ===
emit("startup") #1: [once] initializing...
emit("startup") #2: (no output — listener already removed after first call)
```

---

### Concept: The Observer Pattern — Decoupled Broadcast

**What it is:** The **Observer pattern** lets one piece of code (the publisher) announce "something happened" without knowing OR CARING who — if anyone — is listening. Any number of independent subscribers can react, and NONE of them need to know about each other, or about the publisher's internals.

**The problem before:** Without an event bus, if `OrderComponent` needs to notify `EmailComponent` AND `InventoryComponent` AND `AnalyticsComponent` when an order is placed, it would need to DIRECTLY import and call all three — `orderComponent.ts` importing `emailComponent.ts`, `inventoryComponent.ts`, and `analyticsComponent.ts` directly. Adding a FOURTH component that cares about orders means editing `OrderComponent` again — exactly LAB-18's OCP violation.

**The solution:** `OrderComponent` emits `"order:placed"` and moves on — it has NO idea who's listening, or how many listeners there are, or even whether there are any at all. Any component that cares subscribes independently.

**Canonical example (General Explanation):** Think of a radio broadcast. The radio station doesn't know who owns a radio, doesn't call each listener individually, and doesn't stop broadcasting if nobody's tuned in. Anyone with a receiver tuned to the right frequency hears it; the station and the listeners are completely decoupled, connected only by the "frequency" (the event name).

**Project Application (The "Why" here):** LAB-13's state machine hooks (`onEnter`/`onExit`) were a TINY, single-listener version of this idea. This lab generalizes it to MULTIPLE listeners per event, with subscribe/unsubscribe.

---

## Step 1 — A Minimal Event Bus

```ts
// event-bus.ts

type Listener = (...args: any[]) => void

export class EventBus {
  private listeners = new Map<string, Listener[]>()    // ← add: event name -> array of subscriber functions

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])                      // ← add: first subscriber for this event — start a new list
    }
    this.listeners.get(event)!.push(listener)
  }

  emit(event: string, ...args: any[]): void {
    const subscribers = this.listeners.get(event) || []   // ← add: no subscribers? empty array — emit does nothing, safely
    for (const listener of subscribers) {
      listener(...args)
    }
  }
}
```

```ts
// main.ts
import { EventBus } from './event-bus'

console.log('=== Basic Pub/Sub ===')
const bus = new EventBus()

console.log('emit("greet", "Alice") with no listeners: nothing happens, no error')
bus.emit('greet', 'Alice')

function logGreeting(name: string) {
  console.log(`[listener] Hello, ${name}!`)
}
bus.on('greet', logGreeting)
console.log('\nsubscribed: logGreeting')
console.log('emit("greet", "Bob"):', '')
bus.emit('greet', 'Bob')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Basic Pub/Sub ===
emit("greet", "Alice") with no listeners: nothing happens, no error

subscribed: logGreeting
emit("greet", "Bob"): 
[listener] Hello, Bob!
```

**Confirm emitting with no listeners is safe:** `bus.emit('greet', 'Alice')` before ANY subscription runs the `for` loop over an EMPTY array — zero iterations, no error, nothing printed. This is deliberate: a publisher should never need to check "does anyone care about this?" before announcing something.

---

## Step 2 — Multiple Subscribers to One Event

```ts
interface Order {
  id: string
}

function emailNotifier(order: Order) {
  console.log(`  [email] confirmation sent for ${order.id}`)
}
function inventoryUpdater(order: Order) {
  console.log(`  [inventory] stock decremented for ${order.id}`)
}
function analyticsTracker(order: Order) {
  console.log(`  [analytics] tracked ${order.id}`)
}
```

Add to `main.ts`:

```ts
console.log('\n=== Multiple Subscribers, One Event ===')
bus.on('order:placed', emailNotifier)
console.log('subscribed: emailNotifier')
bus.on('order:placed', inventoryUpdater)
console.log('subscribed: inventoryUpdater')
bus.on('order:placed', analyticsTracker)
console.log('subscribed: analyticsTracker')

console.log('emit("order:placed", {...}):', '')
bus.emit('order:placed', { id: 'order-1' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Multiple Subscribers, One Event ===
subscribed: emailNotifier
subscribed: inventoryUpdater
subscribed: analyticsTracker
emit("order:placed", {...}): 
  [email] confirmation sent for order-1
  [inventory] stock decremented for order-1
  [analytics] tracked order-1
```

**Confirm all three ran from ONE `emit` call:** `listeners.get('order:placed')` holds all three functions in the order they subscribed — `emit`'s `for` loop calls every single one with the SAME arguments, exactly like LAB-13's `onEnter` hooks fired automatically on a transition, just generalized to a LIST of reactions instead of one.

---

## Step 3 — Unsubscribing

```ts
// Add to event-bus.ts:
off(event: string, listener: Listener): void {
  const subscribers = this.listeners.get(event)
  if (!subscribers) return
  const index = subscribers.indexOf(listener)
  if (index !== -1) subscribers.splice(index, 1)    // ← add: remove exactly this one listener, keep the rest
}
```

Add to `main.ts`:

```ts
console.log('\n=== Unsubscribing ===')
bus.off('order:placed', emailNotifier)
console.log('off("order:placed", emailNotifier)')
console.log('emit("order:placed", {...}) again:', '')
bus.emit('order:placed', { id: 'order-2' })
console.log('  ← emailNotifier did NOT run — it was unsubscribed')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Unsubscribing ===
off("order:placed", emailNotifier)
emit("order:placed", {...}) again: 
  [inventory] stock decremented for order-2
  [analytics] tracked order-2
  ← emailNotifier did NOT run — it was unsubscribed
```

**Why `off` needs the EXACT same function reference:** `indexOf(listener)` compares by REFERENCE (LAB-01's reference semantics) — `off('order:placed', emailNotifier)` only works because `emailNotifier` is the SAME function object that was originally passed to `on`. An anonymous arrow function passed inline to `on` (`bus.on('x', () => {...})`) can NEVER be unsubscribed later, because there's no way to reference that exact same function object again — a common real-world bug when using event buses.

---

## Step 4 — True Decoupling, Confirmed

```ts
// order-component.ts
import { EventBus } from './event-bus'

export class OrderComponent {
  constructor(private bus: EventBus) {}
  placeOrder(id: string): void {
    this.bus.emit('order:placed', { id })      // fires and forgets — no idea who's listening
  }
}
```

```ts
// email-component.ts
import { EventBus } from './event-bus'

export class EmailComponent {
  constructor(bus: EventBus) {
    bus.on('order:placed', (order: { id: string }) => {
      console.log(`  [EmailComponent] would email confirmation for ${order.id}`)
    })
  }
}
```

Add to `main.ts`:

```ts
import { OrderComponent } from './order-component'
import { EmailComponent } from './email-component'

console.log('\n=== Decoupled Components ===')
const decoupledBus = new EventBus()
new EmailComponent(decoupledBus)                 // subscribes on construction
const orderComponent = new OrderComponent(decoupledBus)

console.log('OrderComponent never imports EmailComponent or InventoryComponent directly: confirmed')
orderComponent.placeOrder('order-3')
console.log('Both react to "order:placed" without OrderComponent knowing they exist: confirmed')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Decoupled Components ===
OrderComponent never imports EmailComponent or InventoryComponent directly: confirmed
  [EmailComponent] would email confirmation for order-3
Both react to "order:placed" without OrderComponent knowing they exist: confirmed
```

**Confirm by reading `order-component.ts`'s imports:** It imports `EventBus` ONLY — never `EmailComponent`. This is LAB-17's dependency-direction diagram again: both `OrderComponent` and `EmailComponent` depend on the SHARED `EventBus` abstraction; neither depends on the other.

---

## 🎯 Challenge: Listener Error Isolation

**You know:** LAB-21's `PluginHost.run()` caught errors so one broken plugin couldn't crash the whole pipeline. `emit`'s `for` loop currently has the SAME unprotected shape.

**Task:** Fix `emit` so a throwing listener doesn't prevent OTHER listeners for the same event from running.

<details>
<summary>▶ Show Solution</summary>

```ts
// Modify event-bus.ts's emit():
emit(event: string, ...args: any[]): void {
  const subscribers = this.listeners.get(event) || []
  for (const listener of subscribers) {
    try {
      listener(...args)
    } catch (err) {
      console.log(`  ${listener.name || 'anonymous'} threw: ${(err as Error).message}`)
    }
  }
}
```

**Key insight:** Without this, `emailNotifier`, `inventoryUpdater`, and `analyticsTracker` from Step 2 would be silently at the mercy of EACH OTHER — if `emailNotifier` happened to throw, `inventoryUpdater` and `analyticsTracker` (registered after it) would never run at all, purely because of registration ORDER. This is the exact same isolation instinct as LAB-21's Challenge, applied to a different extension mechanism — any time a host calls into code it doesn't control, in a loop, that loop needs a `try`/`catch` per iteration, not one around the whole loop.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Listener Error Isolation ===')
const isolationBus = new EventBus()
function brokenListener() { throw new Error('simulated listener failure') }
function workingListener() { console.log('  [working] this still ran') }

isolationBus.on('test:event', brokenListener)
isolationBus.on('test:event', workingListener)
console.log('subscribed: brokenListener, workingListener')
console.log('emit("test:event"):', '')
isolationBus.emit('test:event')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Listener Error Isolation ===
subscribed: brokenListener, workingListener
emit("test:event"): 
  brokenListener threw: simulated listener failure
  [working] this still ran
```

---

## Step 5 — once(): Fire Exactly One Time

```ts
// Add to event-bus.ts:
once(event: string, listener: Listener): void {
  const wrapper = (...args: any[]) => {
    this.off(event, wrapper)     // ← add: unsubscribe BEFORE calling — 'wrapper', not 'listener', since 'wrapper' is what's actually registered
    listener(...args)
  }
  this.on(event, wrapper)
}
```

Add to `main.ts`:

```ts
console.log('\n=== once() — Fire Only One Time ===')
const onceBus = new EventBus()
onceBus.once('startup', () => console.log('[once] initializing...'))

process.stdout.write('emit("startup") #1: ')
onceBus.emit('startup')

process.stdout.write('emit("startup") #2: ')
onceBus.emit('startup')
console.log('(no output — listener already removed after first call)')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== once() — Fire Only One Time ===
emit("startup") #1: [once] initializing...
emit("startup") #2: (no output — listener already removed after first call)
```

**Why `once` wraps instead of modifying `emit`/`on` directly:** `once` is built ENTIRELY out of `on` and `off`, already-existing pieces — no changes were needed to the CORE event bus at all. This is LAB-18's OCP again: `once` EXTENDS the bus's capability by composing existing methods, rather than requiring `emit` itself to grow special-case "is this a once-listener?" logic.

---

## Mental Model: Where This Shows Up

| System | The event bus |
|---|---|
| The DOM | `addEventListener`/`removeEventListener` — this lab's `on`/`off`, for real |
| Node.js | The built-in `EventEmitter` class — nearly identical to this lab's `EventBus` |
| React (pre-hooks) and Redux | Actions dispatched to a central store, subscribers re-render — same publish/subscribe shape |
| Message queues (LAB-49, LAB-55) | The distributed, cross-process version of exactly this pattern |
| WebSocket servers (LAB-51) | Broadcasting one message to many connected, independent clients |

---

## Final Check

| Feature | How to verify |
|---|---|
| `emit` with zero subscribers does nothing, safely | Step 1 |
| Multiple subscribers all receive the same event | Step 2 |
| `off` correctly removes exactly one listener, leaving others intact | Step 3 |
| `OrderComponent` and `EmailComponent` share no direct import of each other | Step 4 |
| A throwing listener doesn't prevent other listeners from running | Challenge |
| `once()` fires exactly one time, built from `on`/`off` with no core changes | Step 5 |
| You can explain, without notes, why `off` needs the exact same function reference | LAB-01's reference semantics |

---

## Quick Check Answers

**1. Does an event bus chain output like LAB-21's plugin pipeline?**

No — this is the key structural difference. LAB-21's plugins run in SEQUENCE, each transforming the PREVIOUS plugin's output. An event bus's listeners for one event all receive the SAME original arguments and run independently — none of their return values feed into each other (in fact, `emit` in this lab doesn't even collect return values). A plugin pipeline is a relay race; an event bus is a public announcement everyone hears at once.

**2. Does `OrderComponent` need to know `EmailComponent` and `InventoryComponent` exist?**

No — and Step 4 confirmed this directly by inspection: `order-component.ts` imports only `EventBus`. `OrderComponent` calls `bus.emit('order:placed', ...)` and has genuinely no way to know, and no need to know, how many listeners (zero, one, or a hundred) will react. This is the entire value of the Observer pattern — the publisher and subscribers are connected only through the shared event name, never through direct references to each other.

**3. Should one throwing listener stop the others from running?**

No — demonstrated in the Challenge, where `brokenListener` throwing did NOT prevent `workingListener` (registered after it) from still running, once `emit`'s loop wrapped each listener call in its own `try`/`catch`. A single misbehaving subscriber shouldn't be able to silently break every OTHER subscriber's ability to react to the same event — this is the same defensive instinct from LAB-21's plugin isolation, applied here to a different chaining mechanism.

---

*Next: [LAB-23 — Command System](LAB-23-command-system.md) — TypeScript, same module*
