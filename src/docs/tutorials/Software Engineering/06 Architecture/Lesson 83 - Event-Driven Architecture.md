# Lesson 83: Event-Driven Architecture

**What you will build.** Lesson 82 stopped `notifications` and
`loyalty` from *failing* an order — but `place_order` still calls both
of them synchronously, in line, before it can return anything to the
customer. Measured for real: placing an order takes about 100
milliseconds, almost entirely spent waiting on two calls whose own
results the customer never sees and whose own failures no longer even
matter. This lesson publishes an `order_placed` event and returns
immediately — the measured customer-facing latency drops to a fraction
of a millisecond — with a separate, decoupled worker processing the
actual notification and loyalty work afterward, on its own timeline.
The transferable problem: Lesson 82 decoupled a non-critical service's
*failure* from the request's own success; this lesson decouples its
*latency* from the request's own timeline entirely — two different
costs, fixed by two different techniques, and fixing one doesn't
automatically fix the other.

**What you need to know first.** Microservices (Lesson 82) — the
critical-path shrinking this lesson's own fix goes one step further
than; Lesson 82 stopped `notifications` from failing the order, this
lesson stops it from being on the *timeline* of the order at all.
Dependency Inversion (Lesson 61) — `register_transition_listener`, the
exact Observer-pattern mechanism this lesson's event queue reuses, now
applied across a request's own timeline instead of within one function
call.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 82 shrank
which services could *fail* an order; this lesson shrinks which
services the customer has to *wait for* at all — the same underlying
goal, minimizing what a request genuinely depends on, attacking a
different cost.

**Terms introduced in this lesson.** One line each.

- **event-driven architecture** — an architecture where a service,
  instead of calling dependent work directly and waiting for it,
  publishes a named event describing what already happened and returns
  immediately; other code, running independently, subscribes to that
  event and reacts on its own timeline. It's distinguished from Lesson
  82's own fix by what it decouples: that lesson stopped a non-critical
  service's *failure* from blocking the order; this one stops its
  *latency* from blocking the response at all.
- **event** — a record of something that already happened, published
  once, with no expectation of a reply — as opposed to a request, which
  asks for something to happen and typically waits for an answer. It's
  named to make the distinction concrete: `order_placed` is a fact,
  already true by the time it's published; nothing about publishing it
  requires anyone to be listening yet, or to respond at all.

**Objects and methods used.** None new — an ordinary list used as a
queue, and a function iterating over it, both already established;
what's new is using them specifically to separate a request's own
response from work triggered by, but not required for, that response.

## Concept Unit: The Customer Shouldn't Wait for Work They'll Never See

### The Problem

`place_order` still calls `send_notification` and `update_loyalty_
points` directly, in sequence, before returning:

```python
import time


def send_notification(order_id):
    time.sleep(0.05)
    return f"notification sent for order {order_id}"


def update_loyalty_points(order_id):
    time.sleep(0.05)
    return f"loyalty points updated for order {order_id}"


def place_order(order_id):
    start = time.perf_counter()
    result = f"order {order_id} placed"
    send_notification(order_id)
    update_loyalty_points(order_id)
    elapsed = time.perf_counter() - start
    return result, elapsed
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
order 501 placed took 100.6ms total
```

Neither `send_notification` nor `update_loyalty_points` can fail the
order anymore, after Lesson 82's own fix — but the customer waiting on
`place_order`'s own response still waits for both to finish anyway,
100 milliseconds spent on work whose outcome they never see and whose
failure no longer even matters to them.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `place_order`, modified to publish an event
  instead of calling dependent work directly.
- **Change type:** refactor — replace two direct calls with one event
  publication.
- **Location:** `place_order`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the event queue and its publish function:

```python
_event_queue = []


def publish_event(event_name, payload):
    _event_queue.append((event_name, payload))
```

### The Updated Project

`place_order` publishes one event and returns immediately; the actual
notification and loyalty work moves to a separate function, run on its
own, later:

```python
_event_queue = []                                                # ← new


def publish_event(event_name, payload):                           # ← new
    _event_queue.append((event_name, payload))                      # ← new


def place_order_event_driven(order_id):                            # ← changed
    start = time.perf_counter()
    result = f"order {order_id} placed"
    publish_event("order_placed", {"order_id": order_id})            # ← changed, replaces two direct calls
    elapsed = time.perf_counter() - start
    return result, elapsed


def process_event_queue():                                          # ← new
    for event_name, payload in _event_queue:                          # ← new
        if event_name == "order_placed":                                # ← new
            send_notification(payload["order_id"])                        # ← new
            update_loyalty_points(payload["order_id"])                     # ← new
    _event_queue.clear()                                               # ← new
```

`place_order_event_driven` no longer calls `send_notification` or
`update_loyalty_points` itself at all — it only records that an order
was placed. `process_event_queue`, run independently, does the actual
work, on whatever schedule a real background worker would use.

### Isolating the Concept: Publish and Return, React Later

The mechanism doing the real work above — publishing a fact and
returning immediately, with the reaction to it happening on a completely
separate timeline — is shown directly through the real order-placement
scenario above, measured for real, rather than a separate, unrelated
example, since the latency measurement itself is this lesson's actual
evidence. Running the event-driven version and measuring both timelines
separately:

```python
result, elapsed = place_order_event_driven(501)
print(result, f"took {elapsed*1000:.4f}ms for the customer-facing response")
print("queued events waiting to be processed:", _event_queue)

worker_start = time.perf_counter()
process_event_queue()
worker_elapsed = time.perf_counter() - worker_start
print(f"background worker processed the event in {worker_elapsed*1000:.1f}ms, after the customer already got a response")
```

Running it produces:

```
order 501 placed took 0.0033ms for the customer-facing response
queued events waiting to be processed: [('order_placed', {'order_id': 501})]
background worker processed the event in 100.9ms, after the customer already got a response
```

The customer-facing response time dropped from roughly 100 milliseconds
to a few thousandths of one — the actual work didn't get any faster, it
just stopped being on the customer's own timeline at all. The 100
milliseconds of real work still happens, in full, in
`process_event_queue`, running independently, after the caller of
`place_order_event_driven` has already moved on.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`_event_queue = []`** — a module-level list, holding events that
  have been published but not yet processed.
- **`def publish_event(event_name, payload):`** — appends a
  `(event_name, payload)` tuple to the queue and returns immediately; it
  never calls anything that reacts to the event itself.
- **`def process_event_queue():`** — a separate function, iterating the
  queue and dispatching each event by name to whatever real work that
  event should trigger — the same `send_notification` and
  `update_loyalty_points` calls that used to live inside `place_order`
  itself, now living here instead.

### CS Lens

This is **event-driven architecture**, built on the identical
**publish-subscribe** mechanism Lesson 61 already established for a
single object's own transitions — `register_transition_listener` there,
a shared queue here — now applied across an entire request's timeline
rather than within one function call. The defining property is
**temporal decoupling**: the publisher of an event has no idea when, or
even whether, a subscriber will process it, and doesn't wait to find
out. This is the same underlying idea behind message queues (RabbitMQ,
Kafka, SQS) in real production systems, where a publishing service
returns the instant a message is enqueued, and any number of consumers
process it independently, on their own schedule, at their own pace.

Also recognized in: a UI button click handler that dispatches an action
and returns immediately, letting the actual state update happen on a
separate render cycle, webhook systems where a source service fires an
event and moves on without waiting for every subscriber to finish
handling it, and audit logging systems that record "this happened" as a
fact, independent of whatever downstream systems eventually read that
log.

### SE Lens

The principle is **separate what a caller needs to know now from what
can be reacted to later** — the alternative that was rejected here,
calling `send_notification` and `update_loyalty_points` directly inside
`place_order`, conflates two different questions: "did the order
succeed" (something the customer genuinely needs an answer to, quickly)
and "has every downstream effect of the order finished" (something the
customer was never actually asking about). The real cost of this fix:
`process_event_queue`, as written, runs synchronously whenever something
calls it — a real production system needs an actual background worker,
polling or triggered independently, to run it continuously, which is
real infrastructure this lesson's own simulation doesn't build. There's
also a new, honest risk: if nothing ever calls `process_event_queue`,
events sit in the queue forever, silently unprocessed — a real
operational concern a production event system has to solve with
monitoring and retry logic this lesson doesn't cover.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both versions back to back, at the identical simulated latency,
to see the real gap directly:

```python
def time_direct_calls():
    _, elapsed = place_order(502)
    return elapsed


def time_event_driven():
    _, elapsed = place_order_event_driven(503)
    return elapsed


direct = time_direct_calls()
event_driven = time_event_driven()
print(f"direct calls: {direct*1000:.1f}ms")
print(f"event-driven: {event_driven*1000:.4f}ms")
```

The real output:

```
direct calls: 100.6ms
event-driven: 0.0035ms
```

The gap is the entire 100 milliseconds `send_notification` and
`update_loyalty_points` used to cost the customer directly — now spent
entirely on a separate timeline, invisible to whoever is waiting on
`place_order_event_driven`'s own response.

### Connecting Back

Where Lesson 82 shrank which services could make an order *fail*, this
lesson shrinks which services the customer has to *wait for* — the same
underlying instinct, minimizing a request's real dependencies, now
applied to time instead of to reliability.

## Connect the Pieces

Placing order `501` was measured twice in this lesson, with the
identical notification and loyalty work required both times. First,
called directly, in sequence: roughly 100 milliseconds before the
customer got any response at all. Second, published as an event and
processed separately: a few thousandths of a millisecond for the
customer-facing response, with the identical 100 milliseconds of real
work still happening — just on `process_event_queue`'s own timeline,
after the response had already been returned.

## What Breaks Without This

Publishing an event only helps if something actually processes the
queue. Nothing about `publish_event` guarantees `process_event_queue`
ever runs:

```python
_event_queue.clear()
place_order_event_driven(504)
print("events waiting, with no worker ever called to process them:", _event_queue)
```

Run for real, this is what comes back:

```
events waiting, with no worker ever called to process them: [('order_placed', {'order_id': 504})]
```

The event sits there, unprocessed, indefinitely — no notification is
ever sent, no loyalty points are ever awarded, and nothing about
`place_order_event_driven`'s own success signals that this happened.
Decoupling the customer's response from the actual work also decoupled
the *visibility* into whether that work ever completes — a real
production system needs monitoring on queue depth and processing lag to
catch exactly this silently-stuck scenario, which this lesson's own
simulation has no way to detect on its own.

## Exercises

1. Write a `queue_depth()` function returning `len(_event_queue)`, and a
   simple check that raises an alert (even just a `print`) if it exceeds
   some threshold. Simulate a scenario where `process_event_queue` falls
   behind — publish five events, process none — and show the alert
   firing.
2. `process_event_queue` currently has no error handling — if
   `send_notification` raised an exception for one event, would
   processing continue to the next event in the queue, or stop entirely?
   Check by making one event's handler fail, and decide whether the
   current behavior is correct for a real system.
3. Using Lesson 82's own critical-path vocabulary alongside this
   lesson's event-driven one, write two or three sentences on which is
   the better fix for a specific non-critical dependency: making it
   best-effort but still synchronous (Lesson 82's own technique), or
   making it fully event-driven (this lesson's). What real factor should
   decide between them?

## Definition of Done

- [ ] `place_order_event_driven` publishes an `order_placed` event and
      returns without calling `send_notification` or
      `update_loyalty_points` directly.
- [ ] `process_event_queue` correctly dispatches the event to both real
      handlers.
- [ ] The Problem section's 100ms customer-facing delay has been
      reproduced for real, against the *original*, direct-call version,
      before applying the fix.
- [ ] The "Run It" comparison above runs against your own code and
      produces a real, large latency gap.
- [ ] The "What Breaks Without This" stuck-queue scenario has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `event-driven
      architecture: publish order_placed instead of calling notification
      and loyalty work directly, cutting customer-facing latency from
      ~100ms to under 1ms`, not `add event queue`.

Up next: Lesson 84, Message-Oriented Architecture — the real
infrastructure a production system needs to make this lesson's own
queue durable, so an event survives even if the process publishing it
crashes before anything processes it.
