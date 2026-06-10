# Junior to Senior — T2·L6 — Internal Event Bus Implementation

**Prerequisites:** T2·L5 (Monolith vs Microservices). You understand when
and why to use events. This lesson builds a production-quality typed event bus
in TypeScript — the mechanism the CAD/CAM application will use to connect
geometry changes to toolpath regeneration.

**What this lab adds:**
- A fully typed event bus with compile-time event name and payload checking
- Synchronous vs asynchronous dispatch strategies
- Unsubscription to prevent memory leaks
- Re-entrancy: handling events emitted from within an event handler
- The difference between an in-process event bus and an external message broker

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Handler A is subscribed to `geometry.changed`. Handler A emits `geometry.changed`
>    inside its own body. What happens with a naive synchronous bus?
> 2. You subscribe a handler in a React component's `useEffect`. The component
>    unmounts. What happens to the subscription if you do not unsubscribe?
> 3. TypeScript string template literals like `` `geometry.${string}` `` — what
>    does this type represent?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A typed event bus that will be used as the communication backbone between the
CAD/CAM application's modules:

```
$ npx ts-node event-bus.ts

--- Basic emit ---
[Handler 1] geometry.line_added: Line from (0,0) to (50,25)
[Handler 2] geometry.line_added: Also received line

--- Unsubscription ---
Emitted geometry.circle_added
[Handler] geometry.circle_added: Circle at (10,10) r=5
Unsubscribed...
Emitted geometry.circle_added again
(no output — handler was removed)

--- Re-entrancy guard ---
Processing geometry.batch_start
  Processing item 1
  Processing item 2
Batch complete — no infinite loop

--- Async dispatch ---
Emitted event
[Async handler 1] running...
[Async handler 2] running...
(Both run concurrently, not sequentially)
```

---

### Concept: Typed Event Buses — Why Compile-Time Safety Matters

**The problem with untyped event buses:**

```ts
// Untyped — emitting typos go undetected until runtime:
bus.emit('geomety.changed', { x: 0, y: 0 });  // typo in 'geometry'
bus.on('geometry.changed', handler);            // never fires — wrong event name
```

**The solution — map event names to their payload types:**

```ts
// EventMap constrains both the event name and the payload:
type EventMap = {
  'geometry.line_added':   { startX: number; startY: number; endX: number; endY: number };
  'geometry.circle_added': { centerX: number; centerY: number; radius: number };
  'toolpath.completed':    { toolpathId: string; duration: number };
};

// TypeScript enforces:
bus.emit('geomety.changed', ...);              // compile error — not in EventMap
bus.emit('geometry.line_added', { x: 0 });    // compile error — wrong payload shape
bus.on('geometry.line_added', event => {
  event.startX;  // TypeScript knows the payload shape — IDE autocomplete works
});
```

**What it hides:** The typed bus hides the possibility of event name typos and
payload mismatches. The entire event contract is expressed once in `EventMap`.
TypeScript enforces it at every call site.

The invariant: emitting an event that is not in `EventMap` is a compile error.
Subscribing with a handler that expects the wrong payload shape is a compile error.
Runtime errors from event name mismatches are impossible.

---

## Step 1 — Build the Typed Event Bus

Create `event-bus.ts`:

```ts
// ── EventMap — the contract for this application ──────────────────────

type EventMap = {
  'geometry.line_added': {
    startX: number; startY: number;
    endX:   number; endY:   number;
  };
  'geometry.circle_added': {
    centerX: number; centerY: number; radius: number;
  };
  'geometry.arc_added': {
    centerX: number; centerY: number;
    radius:  number; startAngle: number; endAngle: number;
  };
  'geometry.item_deleted': { itemId: string };
  'toolpath.generation_started': { toolpathId: string; geometryIds: string[] };
  'toolpath.generation_completed': { toolpathId: string; durationMs: number };
  'toolpath.generation_failed': { toolpathId: string; reason: string };
};

// ── Subscription handle — returned by on(), used for off() ────────────

interface Subscription {
  unsubscribe(): void;
}

// ── The typed event bus ────────────────────────────────────────────────

class TypedEventBus {
  // Map from event name → array of handlers:
  private readonly handlers = new Map<string, Array<(payload: unknown) => void>>();

  // Subscribe to an event — returns a Subscription for cleanup:
  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): Subscription {
    const key     = event as string;
    const existing = this.handlers.get(key) ?? [];
    const typed    = handler as (payload: unknown) => void;
    this.handlers.set(key, [...existing, typed]);

    // Return a handle that can remove this specific handler:
    return {
      unsubscribe: () => {
        const current = this.handlers.get(key) ?? [];
        this.handlers.set(key, current.filter(h => h !== typed));
      },
    };
  }

  // Emit an event to all subscribers:
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.handlers.get(event as string) ?? [];
    handlers.forEach(handler => handler(payload));
  }

  // Count subscribers for a specific event (useful for debugging):
  subscriberCount(event: keyof EventMap): number {
    return this.handlers.get(event as string)?.length ?? 0;
  }
}

// Create the shared bus:
export const applicationBus = new TypedEventBus();
```

### SAVE AND TRY

```bash
npx ts-node event-bus.ts
```

Expected: no output. Add a test:

```ts
applicationBus.on('geometry.line_added', e => console.log('Line:', e.startX, e.startY));
applicationBus.emit('geometry.line_added', { startX: 0, startY: 0, endX: 50, endY: 25 });
```

Expected: `Line: 0 0`

**Change something:** Try `applicationBus.emit('geometry.line_added', { x: 0 })`.
Expected: TypeScript compile error — the payload does not match `EventMap['geometry.line_added']`.

---

## Step 2 — Multiple Handlers and Unsubscription

```ts
console.log('--- Basic emit ---');

const sub1 = applicationBus.on('geometry.line_added', event => {
  console.log(
    `[Handler 1] geometry.line_added: Line from (${event.startX},${event.startY}) to (${event.endX},${event.endY})`
  );
});

const sub2 = applicationBus.on('geometry.line_added', event => {
  console.log('[Handler 2] geometry.line_added: Also received line');
});

applicationBus.emit('geometry.line_added', { startX: 0, startY: 0, endX: 50, endY: 25 });

console.log('\n--- Unsubscription ---');

const circleHandler = applicationBus.on('geometry.circle_added', event => {
  console.log(`[Handler] geometry.circle_added: Circle at (${event.centerX},${event.centerY}) r=${event.radius}`);
});

console.log('Emitted geometry.circle_added');
applicationBus.emit('geometry.circle_added', { centerX: 10, centerY: 10, radius: 5 });

console.log('Unsubscribed...');
circleHandler.unsubscribe();

console.log('Emitted geometry.circle_added again');
applicationBus.emit('geometry.circle_added', { centerX: 20, centerY: 20, radius: 10 });
console.log(`Subscribers: ${applicationBus.subscriberCount('geometry.circle_added')}`);
```

### SAVE AND TRY

```bash
npx ts-node event-bus.ts
```

Expected:
```
--- Basic emit ---
[Handler 1] geometry.line_added: Line from (0,0) to (50,25)
[Handler 2] geometry.line_added: Also received line

--- Unsubscription ---
Emitted geometry.circle_added
[Handler] geometry.circle_added: Circle at (10,10) r=5
Unsubscribed...
Emitted geometry.circle_added again
Subscribers: 0
```

---

### Concept: Re-entrancy — Events Emitted From Handlers

**What it is:** Re-entrancy occurs when a handler emits an event that the same
handler (or another handler) subscribes to, potentially causing infinite loops
or unexpected behavior.

**The problem:**

```ts
// Handler emits an event it also subscribes to:
bus.on('geometry.changed', (event) => {
  // Some processing...
  bus.emit('geometry.changed', event);  // INFINITE LOOP with naive dispatch!
});
```

With a naive synchronous bus, this creates a stack overflow.

**Two strategies:**

**Strategy 1 — Queue-based dispatch (defers re-entrant emits):**

```ts
emit(event, payload) {
  if (this.isDispatching) {
    this.queue.push({ event, payload });  // defer until current dispatch ends
    return;
  }
  this.isDispatching = true;
  try {
    this.dispatch(event, payload);
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.dispatch(next.event, next.payload);
    }
  } finally {
    this.isDispatching = false;
  }
}
```

**Strategy 2 — Copy-on-dispatch (handlers array is snapshotted before calling):**

```ts
emit(event, payload) {
  // Snapshot the handlers — new subscriptions during dispatch don't get this event
  const snapshot = [...(this.handlers.get(event) ?? [])];
  snapshot.forEach(h => h(payload));
}
```

Strategy 2 is simpler and safe for most cases. Strategy 1 is needed when
re-entrant events must also be delivered.

---

## Step 3 — Re-entrancy Protection

```ts
class SafeEventBus extends TypedEventBus {
  private isDispatching = false;
  private readonly pendingEvents: Array<{ event: keyof EventMap; payload: EventMap[keyof EventMap] }> = [];

  override emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    if (this.isDispatching) {
      // Queue instead of dispatching immediately — prevents stack overflow:
      this.pendingEvents.push({ event, payload: payload as EventMap[keyof EventMap] });
      return;
    }

    this.isDispatching = true;
    try {
      super.emit(event, payload);

      // Process any events that were emitted during this dispatch:
      while (this.pendingEvents.length > 0) {
        const next = this.pendingEvents.shift()!;
        super.emit(next.event, next.payload as EventMap[typeof next.event]);
      }
    } finally {
      this.isDispatching = false;
    }
  }
}

const safeBus = new SafeEventBus();

console.log('\n--- Re-entrancy guard ---');

// Handler emits another event while processing — safe with queue:
safeBus.on('toolpath.generation_started', event => {
  console.log(`Processing toolpath.generation_started`);
  event.geometryIds.forEach((id, i) => {
    console.log(`  Processing item ${i + 1}`);
    // In a real scenario this might emit a progress event:
  });
  // Emit completion — this would re-enter without the guard:
  safeBus.emit('toolpath.generation_completed', {
    toolpathId: event.toolpathId,
    durationMs: 150,
  });
});

safeBus.on('toolpath.generation_completed', event => {
  console.log(`Batch complete — durationMs: ${event.durationMs}`);
});

safeBus.emit('toolpath.generation_started', {
  toolpathId: 'tp-001',
  geometryIds: ['geo-001', 'geo-002'],
});
```

### SAVE AND TRY

```bash
npx ts-node event-bus.ts
```

Expected:
```
--- Re-entrancy guard ---
Processing toolpath.generation_started
  Processing item 1
  Processing item 2
Batch complete — durationMs: 150
```

Without the re-entrancy guard, `emit('toolpath.generation_completed', ...)` inside
the `generation_started` handler would be called while the bus is still dispatching
`generation_started`. With the queue, it is deferred and runs after the first
dispatch completes.

---

## 🎯 Challenge: One-Time Subscription

**You know:** The typed event bus, subscriptions, unsubscription.

**Task:** Add an `once<K>(event: K, handler: Function): Subscription` method
to `TypedEventBus` that calls the handler exactly once and then automatically
unsubscribes.

```ts
const sub = bus.once('toolpath.generation_completed', event => {
  console.log(`First completion: toolpath ${event.toolpathId}`);
  // This should fire for the FIRST event only
});

bus.emit('toolpath.generation_completed', { toolpathId: 'tp-001', durationMs: 100 });
bus.emit('toolpath.generation_completed', { toolpathId: 'tp-002', durationMs: 200 });
// Expected output: only 'First completion: toolpath tp-001'
```

**Requirements:**
- `once` wraps the handler in a self-unsubscribing wrapper
- The returned `Subscription` can also be used to unsubscribe before the event fires
- The handler receives the correctly typed payload

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
class TypedEventBusWithOnce extends TypedEventBus {
  once<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): Subscription {
    // Create a wrapper that unsubscribes itself after the first call:
    let subscription: Subscription;

    const wrapper = (payload: EventMap[K]): void => {
      handler(payload);            // call the original handler
      subscription.unsubscribe(); // remove this wrapper from the bus
    };

    // Subscribe the wrapper (not the original handler):
    subscription = this.on(event, wrapper);

    return subscription; // caller can also unsubscribe before first fire
  }
}

const busWithOnce = new TypedEventBusWithOnce();

const sub = busWithOnce.once('toolpath.generation_completed', event => {
  console.log(`First completion: toolpath ${event.toolpathId}`);
});

busWithOnce.emit('toolpath.generation_completed', { toolpathId: 'tp-001', durationMs: 100 });
busWithOnce.emit('toolpath.generation_completed', { toolpathId: 'tp-002', durationMs: 200 });
// Only 'First completion: toolpath tp-001' printed
```

**Key insight:** `once` is implemented entirely in terms of `on` and `unsubscribe`.
The wrapper function holds a reference to `subscription` through a closure —
even though `subscription` is assigned after `wrapper` is defined, JavaScript
closures capture the variable binding (not the value), so when `wrapper` runs
and calls `subscription.unsubscribe()`, `subscription` has already been assigned.
This is the closure behaviour from Lesson T1-L0c applied practically.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Typed emit prevents typos | Emit non-existent event name | Compile error |
| Typed payload enforced | Emit with wrong payload shape | Compile error |
| Multiple handlers fire | Subscribe 2, emit 1 | Both handlers called |
| Unsubscribe removes handler | Sub, emit, unsub, emit | First fires, second doesn't |
| `subscriberCount` accurate | Sub 3, unsub 1, count | `2` |
| Re-entrancy safe | Handler emits same-type event | No stack overflow |

---

## Quick Check Answers

**1. Handler A subscribes to `geometry.changed` and emits `geometry.changed` in its body — what happens?**

With a naive synchronous event bus: `emit('geometry.changed')` calls Handler A,
which emits `geometry.changed`, which calls Handler A again, which emits again —
infinite recursion until the call stack overflows (stack overflow error). The
re-entrancy guard prevents this by checking `isDispatching` — if a handler
tries to emit while another dispatch is running, the new event is queued and
dispatched after the current handlers finish.

**2. Component unmounts without unsubscribing — what happens?**

The event bus still holds a reference to the handler function. The handler
function may hold a reference to the component's state (through a closure).
The component's memory is not freed (memory leak). If the event fires,
the handler runs and may call `setState` on an unmounted component — in React,
this produces a warning ("Warning: Can't perform a React state update on an
unmounted component") and potentially causes errors. The fix: always return
a cleanup function from `useEffect` that calls `subscription.unsubscribe()`.

**3. TypeScript template literal type `` `geometry.${string}` `` — what does it represent?**

It represents the type of any string that starts with `'geometry.'` followed by
any string. `'geometry.changed'` satisfies it. `'geometry.x'` satisfies it.
`'toolpath.changed'` does not. This is a TypeScript template literal type —
a type-level pattern for string values. In the typed event bus, the `EventMap`
keys are specific literal types (`'geometry.line_added'`). A constraint like
`event: keyof EventMap` is more restrictive — only the exact strings in `EventMap`
are allowed, not any string starting with `geometry.`.
