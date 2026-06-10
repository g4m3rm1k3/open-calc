# Drill 4.2 — Observer / Pub-Sub: Reactive Events

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Pattern category:** GoF Behavioral
**Official name:** Observer (also called Pub-Sub in its decoupled form)
**What you will build:** A tiny event system from scratch — a Store that notifies subscribers when data changes. Two "UI components" (print functions) subscribe and both update when the store changes.
**What you will understand:** Why the Observer pattern exists, how it decouples producers from consumers, and where it appears in every framework you use

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Your `DataStore` calls `dashboard.update()` and `sidebar.update()` directly when data changes. You need to add a third listener. How many files do you have to change?

2. With the Observer pattern, the store emits an event. Neither the store nor the subscribers know about each other's implementation. What is the only thing they must agree on?

3. React's `useState` hook re-renders your component when state changes. What does this have to do with the Observer pattern?

4. A subscriber that never unsubscribes holds a reference to the event bus, and the event bus holds a reference back to the subscriber. The subscriber goes "out of scope" but is never garbage collected. What is this called?

*(Answers at the bottom.)*

---

## The Concept: Observer Pattern

### Concept: Observer / Pub-Sub

**What it is:**
The Observer pattern defines a one-to-many dependency: when one object (the subject) changes state, all dependent objects (observers) are notified automatically. The subject does not know the concrete types of its observers — only that they implement a `notify()` method (or equivalent interface).

**The problem before — tight coupling:**

```python
class DataStore:
    def __init__(self):
        self.data = {}
        self.dashboard = Dashboard()   # DataStore CREATES and OWNS Dashboard
        self.sidebar    = Sidebar()    # DataStore CREATES and OWNS Sidebar

    def update(self, key, value):
        self.data[key] = value
        self.dashboard.refresh(self.data)  # DataStore KNOWS about Dashboard's API
        self.sidebar.refresh(self.data)    # DataStore KNOWS about Sidebar's API
        # Problem: to add a third listener, you must edit DataStore
        # DataStore must know about everything that might care about its data
```

Every new subscriber requires editing the store. The store accumulates knowledge of every downstream system. Tests of the store must also set up the dashboard and sidebar. Any import cycle between store and UI breaks the build.

**The solution:**

```python
class DataStore:
    def __init__(self):
        self.data = {}
        self._subscribers = []         # list of callables — knows nothing concrete

    def subscribe(self, callback):
        self._subscribers.append(callback)   # add any callable

    def update(self, key, value):
        self.data[key] = value
        for callback in self._subscribers:
            callback(self.data)        # call each subscriber with the new data
            # DataStore does NOT know Dashboard or Sidebar exist
            # It only knows it has subscribers that want to be called

# Consumers connect themselves — DataStore never mentions them
store = DataStore()
store.subscribe(lambda data: print(f"Dashboard: {data}"))
store.subscribe(lambda data: print(f"Sidebar: total={len(data)}"))
# Adding a third subscriber: zero changes to DataStore
store.subscribe(lambda data: log_to_file(data))
```

**Pattern category:** GoF Behavioral — about how objects communicate. Behavioral patterns define the communication protocols between objects.

**Tradeoff:** Observers can be hard to trace. When you see `store.emit("data_changed")`, there is no code path to follow to find which observers react. Debugging requires knowing the full subscriber list at runtime. Large systems with many events become difficult to reason about — this is sometimes called "event spaghetti."

**Pub-Sub variant:**
In the Observer pattern, subjects and observers know about each other (the subject holds references to observers). In Pub-Sub, they communicate through a message broker (the EventBus or EventEmitter) — neither side holds a reference to the other. This makes them even more decoupled but even harder to trace.

**What it hides:**
The mechanism of notification — the publisher does not know how many subscribers exist, whether any exist at all, or what they do when notified. The invariant it protects: publishers never import subscriber code. Subscribers never import publisher code. They both import only the event bus.

**Canonical example:**
A newspaper subscription service. The newspaper publisher (subject) doesn't know who is subscribed. When a new edition is published, all subscribers automatically receive it. A subscriber can cancel their subscription at any time. The publisher doesn't need to be told — they just stop sending.

**Constraints:**
- Subscribers must be unsubscribed when they are no longer needed — forgetting this causes memory leaks (the event bus holds a reference, preventing garbage collection)
- Notification order is not guaranteed unless explicitly sorted
- Exception in one subscriber should not prevent others from being notified — wrap subscriber calls in try/except in production systems
- Synchronous vs asynchronous: by default, notifications block the publisher until all subscribers complete

**Failure modes:**
- Memory leak: subscriber object kept alive by event bus reference — never garbage collected even after going "out of scope"
- Infinite loop: subscriber A notifies subject, subject notifies subscriber A again — stack overflow
- Race condition: multiple threads subscribing/unsubscribing while notifications are in progress — requires locking

**Operational reality:**
The Observer pattern underlies: DOM event listeners (`addEventListener`), React state updates (each component subscribes to the state it needs), Redux (store.subscribe), Vue.js reactivity, WebSocket message handlers, database triggers, and message queues like Kafka (consumers subscribe to topics). Understanding it explains why `useEffect` with a dependency array re-runs when a subscribed value changes.

**You will see this again in:**
Every frontend framework (React, Vue, Angular), every event-driven backend (Node.js EventEmitter, Python's asyncio), every message queue (Kafka, RabbitMQ), every GUI framework. It is one of the highest-frequency patterns in professional code.

**Watch for:**
Always provide an `unsubscribe` mechanism. A subscriber that lives forever while its data source goes stale is a common source of bugs. In React, `useEffect`'s cleanup function is exactly this: it unsubscribes from whatever the effect subscribed to.

---

## Step 1 — The Coupled Version (Showing the Problem)

Create `coupled_store.py`:

```python
# coupled_store.py — the wrong way: store knows about its subscribers
# This is the PROBLEM. Read it carefully — feel the coupling.

class Dashboard:
    def refresh(self, data: dict) -> None:
        # The Dashboard knows exactly what format DataStore sends
        total = sum(data.values())
        print(f"  [Dashboard] Total: {total} | Items: {len(data)}")

class Sidebar:
    def refresh(self, data: dict) -> None:
        # The Sidebar also knows DataStore's format
        items = ", ".join(f"{k}={v}" for k, v in data.items())
        print(f"  [Sidebar] Contents: {items}")

class DataStore:
    def __init__(self):
        self.data = {}
        # DataStore creates its own subscribers — owns them, knows their types
        self.dashboard = Dashboard()
        self.sidebar   = Sidebar()

    def set(self, key: str, value: int) -> None:
        self.data[key] = value
        # DataStore must manually notify each subscriber — and must know their API
        self.dashboard.refresh(self.data)
        self.sidebar.refresh(self.data)
        # To add a logger: edit this method, import Logger, create self.logger = Logger()
        # DataStore grows every time a new subscriber is added


# --- try to use it ---
print("=== Coupled Store ===")
store = DataStore()
store.set("apples", 5)
store.set("oranges", 3)
store.set("apples", 8)   # update
print()
print("Problem: to add a third subscriber, we must edit DataStore.set()")
print("Problem: we cannot test DataStore without also creating Dashboard and Sidebar")
print("Problem: DataStore imports Dashboard and Sidebar — circular imports possible")
```

### SAVE AND TRY

```bash
python coupled_store.py
```

**Expected output:**
```
=== Coupled Store ===
  [Dashboard] Total: 5 | Items: 1
  [Sidebar] Contents: apples=5
  [Dashboard] Total: 8 | Items: 2
  [Sidebar] Contents: apples=5, oranges=3
  [Dashboard] Total: 11 | Items: 2
  [Sidebar] Contents: apples=8, oranges=3

Problem: to add a third subscriber, we must edit DataStore.set()
Problem: we cannot test DataStore without also creating Dashboard and Sidebar
Problem: DataStore imports Dashboard and Sidebar — circular imports possible
```

**Change something:** Try adding a `Logger` that records every change to a list. Count how many places you have to touch in `DataStore` to add it. That count is the coupling cost.

---

## Step 2 — The Observer Pattern

Create `event_bus.py`:

```python
# event_bus.py — a simple event bus implementing the Pub-Sub variant of Observer

from typing import Callable, Any

class EventBus:
    """
    A Pub-Sub event bus. Publishers emit events by name.
    Subscribers register callbacks for specific event names.
    Neither publisher nor subscriber knows about the other.
    """

    def __init__(self):
        # dict mapping event_name -> list of callbacks
        # Using a dict of lists so unrelated events don't notify each other
        self._subscribers: dict[str, list[Callable]] = {}

    def subscribe(self, event: str, callback: Callable) -> Callable:
        """
        Register a callback for an event.
        Returns the callback — allows: unsub = bus.subscribe("x", fn)
        """
        if event not in self._subscribers:
            self._subscribers[event] = []
        self._subscribers[event].append(callback)
        return callback   # return it so caller can hold a reference for unsubscription

    def unsubscribe(self, event: str, callback: Callable) -> None:
        """
        Remove a callback from an event.
        If the callback is not subscribed, silently does nothing.
        """
        if event in self._subscribers:
            try:
                self._subscribers[event].remove(callback)
                # list.remove() removes the first matching item
                # raises ValueError if not found — we catch that below
            except ValueError:
                pass   # already unsubscribed — not an error

    def emit(self, event: str, data: Any = None) -> None:
        """
        Notify all subscribers of an event, passing data to each.
        Continues notifying remaining subscribers even if one raises an exception.
        """
        for callback in list(self._subscribers.get(event, [])):
            # list(...): iterate a copy — a subscriber might unsubscribe during notification
            try:
                callback(data)
            except Exception as e:
                print(f"  [EventBus] Subscriber error on '{event}': {e}")
                # Log and continue — one bad subscriber should not silence the others

    def subscriber_count(self, event: str) -> int:
        """How many subscribers are listening to this event? (useful for debugging)"""
        return len(self._subscribers.get(event, []))
```

### SAVE AND TRY

```bash
python -c "
from event_bus import EventBus
bus = EventBus()
unsub = bus.subscribe('test', lambda d: print(f'  received: {d}'))
bus.emit('test', 'hello')
bus.emit('test', 'world')
bus.unsubscribe('test', unsub)
bus.emit('test', 'this should not print')
print('subscriber count after unsub:', bus.subscriber_count('test'))
"
```

**Expected output:**
```
  received: hello
  received: world
subscriber count after unsub: 0
```

---

## Step 3 — Refactor to Observer

Create `observer_store.py`:

```python
# observer_store.py — the same app refactored with the Observer pattern

from event_bus import EventBus

# A single shared event bus — all parts of the app use this
# In larger apps this might be injected as a dependency instead of a global
bus = EventBus()


class DataStore:
    """
    DataStore owns data and emits events when it changes.
    It has ZERO knowledge of Dashboard, Sidebar, or any subscriber.
    """

    def __init__(self):
        self.data: dict[str, int] = {}

    def set(self, key: str, value: int) -> None:
        self.data[key] = value
        bus.emit("data_changed", self.data)
        # That's it. DataStore's job is done.
        # It does not know how many subscribers exist.
        # It does not know what they do with the data.
        # Adding a new subscriber requires ZERO changes to DataStore.


class Dashboard:
    """Dashboard subscribes to data changes and displays totals."""

    def __init__(self):
        bus.subscribe("data_changed", self._on_data_changed)
        # Dashboard connects ITSELF to the bus — DataStore doesn't set this up

    def _on_data_changed(self, data: dict) -> None:
        total = sum(data.values())
        print(f"  [Dashboard] Total: {total} | Items: {len(data)}")


class Sidebar:
    """Sidebar subscribes to data changes and displays contents."""

    def __init__(self):
        bus.subscribe("data_changed", self._on_data_changed)

    def _on_data_changed(self, data: dict) -> None:
        items = ", ".join(f"{k}={v}" for k, v in data.items())
        print(f"  [Sidebar] Contents: {items}")


class ChangeLogger:
    """
    A new subscriber — added without touching DataStore at all.
    This is the Open/Closed principle: open for extension (add ChangeLogger),
    closed for modification (DataStore.set() is unchanged).
    """

    def __init__(self):
        self._log: list[dict] = []
        bus.subscribe("data_changed", self._on_data_changed)

    def _on_data_changed(self, data: dict) -> None:
        import copy
        self._log.append(copy.deepcopy(data))  # snapshot — not a reference
        print(f"  [Logger] Snapshot #{len(self._log)} recorded")

    def history(self) -> list:
        return self._log


# --- use it ---
print("=== Observer Store ===")
store = DataStore()    # store knows NOTHING about who subscribes
dash  = Dashboard()    # dashboard subscribes itself
side  = Sidebar()      # sidebar subscribes itself
log   = ChangeLogger() # third subscriber — zero changes to DataStore

print("\nstore.set('apples', 5):")
store.set("apples", 5)

print("\nstore.set('oranges', 3):")
store.set("oranges", 3)

print("\nstore.set('apples', 8):")
store.set("apples", 8)

print(f"\nHistory: {log.history()}")
print(f"Subscribers on 'data_changed': {bus.subscriber_count('data_changed')}")
```

### SAVE AND TRY

```bash
python observer_store.py
```

**Expected output:**
```
=== Observer Store ===

store.set('apples', 5):
  [Dashboard] Total: 5 | Items: 1
  [Sidebar] Contents: apples=5
  [Logger] Snapshot #1 recorded

store.set('oranges', 3):
  [Dashboard] Total: 8 | Items: 2
  [Sidebar] Contents: apples=5, oranges=3
  [Logger] Snapshot #2 recorded

store.set('apples', 8):
  [Dashboard] Total: 11 | Items: 2
  [Sidebar] Contents: apples=8, oranges=3
  [Logger] Snapshot #3 recorded

History: [{'apples': 5}, {'apples': 5, 'oranges': 3}, {'apples': 8, 'oranges': 3}]
Subscribers on 'data_changed': 3
```

**Compare with the coupled version:** The output is identical. But `DataStore.set()` did not change when `ChangeLogger` was added. That is the pattern working.

**In the terminal — test unsubscription:**
```python
python -c "
from observer_store import bus, store, dash, side
print('Subscribers before:', bus.subscriber_count('data_changed'))
bus.unsubscribe('data_changed', dash._on_data_changed)
print('Subscribers after unsubscribing Dashboard:', bus.subscriber_count('data_changed'))
store.set('test', 1)
# Dashboard should NOT print — Sidebar should
"
```

**Change something:** Delete `dash = Dashboard()` — the dashboard is never created and never subscribes. `store.set(...)` calls still work. The other subscribers still receive notifications. This is the decoupling in action.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a stock ticker simulation using the Observer pattern.

**Requirements checklist:**

- [ ] `StockMarket` class emits `"price_changed"` events when a stock price updates — `{"symbol": "AAPL", "price": 182.50, "previous": 180.00}`
- [ ] `PriceAlert` subscriber: prints an alert when a stock crosses a threshold you set at construction (`PriceAlert("AAPL", threshold=185.0)`)
- [ ] `PortfolioTracker` subscriber: tracks owned shares and calculates total portfolio value on every price change
- [ ] `AuditLogger` subscriber: writes every price change to a list with a timestamp
- [ ] `StockMarket` has zero imports of any subscriber class
- [ ] All three subscribers can be added in any order without changing `StockMarket`
- [ ] Unsubscribing `PriceAlert` stops its alerts — other subscribers continue receiving events
- [ ] Simulate 10 random price changes and verify all three subscribers received all 10

**Starter:**
```python
from event_bus import EventBus

bus = EventBus()

class StockMarket:
    def __init__(self):
        self._prices: dict[str, float] = {}

    def set_price(self, symbol: str, price: float) -> None:
        previous = self._prices.get(symbol, price)
        self._prices[symbol] = price
        # TODO: emit "price_changed" with the right data
```

**When you're done:** Running your simulation prints price alerts only when thresholds are crossed, portfolio value updates on every change, and the audit log has exactly 10 entries. Unsubscribing `PriceAlert` and running 5 more price changes results in no alerts but 15 total audit log entries.

**Stuck?** Ask AI: "I'm building a stock ticker with the Observer pattern. My `PriceAlert` subscriber needs to store the threshold at construction time and access it when `_on_price_changed` is called. How does the instance method `_on_price_changed(self, data)` access `self.threshold` if I register it as a callback with `bus.subscribe('price_changed', self._on_price_changed)`?"

---

## Quick Check Answers

**1. How many files change when you add a third listener to the coupled store?**
At minimum two: the file defining `DataStore` (to add the new subscriber call) and the new subscriber's file. With circular imports, possibly more. With the Observer pattern, only the new subscriber's file changes — `DataStore` is never touched. This is the Open/Closed Principle: the store is closed for modification but open for extension through the subscription mechanism.

**2. What must publishers and subscribers agree on?**
Only the event name (a string) and the shape of the data payload. The publisher says "I will emit `'data_changed'` with a dict of `{str: int}`." The subscriber says "I will handle `'data_changed'` and expect a dict." Neither side knows anything about the other's implementation. This minimal shared contract is why pub-sub systems are so composable.

**3. What does React's `useState` have to do with Observer?**
React's state system is built on Observer. When you call `useState`, React registers your component as an observer of that state value. When `setState` is called (the publisher), React notifies all components (observers) that subscribed to that state — which triggers a re-render. `useEffect`'s dependency array is literally a list of observables to subscribe to: the effect re-runs when any subscribed value changes. The cleanup function returned from `useEffect` is the `unsubscribe` call.

**4. What is the memory leak from forgetting to unsubscribe?**
This is called a **memory leak through retained references**. The event bus holds a reference to each subscriber callback. The callback is typically a bound method (`self._on_data_changed`), which holds a reference to the subscriber object (`self`). Even if the subscriber object goes "out of scope" in the caller's code, the event bus's list prevents the garbage collector from freeing it. The object stays alive, consuming memory, receiving notifications for data it no longer needs to process. The fix is always to call `bus.unsubscribe(...)` in the subscriber's cleanup/destructor — or use `weakref.WeakSet` for the subscriber list so subscribers can be garbage collected without explicit unsubscription.
