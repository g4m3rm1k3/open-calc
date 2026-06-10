# Drill 7.4 — Event Sourcing: State as a Log of Events

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — standard library only (`json`, `datetime`, `dataclasses`)
**What you will build:** A bank account that stores every transaction as an immutable event log instead of a current balance, with time-travel to any past state and an audit trail that can never be modified.
**What you will understand:** What event sourcing is, why it gives you audit trails for free, the difference between an event store and a state store, and when event sourcing is the wrong choice.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. A traditional database stores the current state: `balance = 1000`. If you want to know why the balance is 1000, what information is missing? What problem does this cause for an auditor?

2. An event log stores `[Deposited(500), Withdrawn(200), Deposited(700)]`. The current balance is the sum: 1000. If you need to add a new report feature that shows "average deposit size," what do you do with the event log? What would you do with a state-only database?

3. Event sourcing stores events forever. What problem does this cause at scale?

4. "Eventual consistency" is a property of event-sourced read models (projections). Why? What must happen between an event being stored and the read model reflecting that event?

*(Answers at the bottom.)*

---

## The Concept: Event Sourcing

### Concept: State Is Derived from Events

**What it is:**
Event sourcing is a pattern where the state of an entity is not stored directly. Instead, every change to the entity is stored as an immutable event in an append-only log. The current state is computed by replaying all events from the beginning (or from a snapshot + subsequent events).

**The traditional approach and what it loses:**
```
Traditional (state store):
  Table: accounts
  id | balance | updated_at
  1  | 1000    | 2026-05-15 10:00:00

Question: What happened between opening and now?
Answer: Unknown. The history is gone.
```

**The event sourcing approach:**
```
Event store:
  id | account_id | event_type      | amount | timestamp
  1  | 1          | AccountOpened   | 0      | 2026-01-01
  2  | 1          | MoneyDeposited  | 500    | 2026-01-15
  3  | 1          | MoneyWithdrawn  | 200    | 2026-02-01
  4  | 1          | MoneyDeposited  | 700    | 2026-03-10

Current state = replay all events:
  Start: 0
  After event 1: 0 (opened)
  After event 2: 500 (deposited)
  After event 3: 300 (withdrawn)
  After event 4: 1000 (deposited)
  
Current balance: 1000
History: complete, immutable, auditable
```

**What events are:**
Events are facts about things that happened. They are named in past tense (`AccountOpened`, `MoneyDeposited`, not `OpenAccount`, `DepositMoney`). They are immutable — you never update or delete an event. They carry the data needed to reconstruct state: amount, timestamp, who caused the event, any relevant metadata.

**Projections (read models):**
The event log is the source of truth, but querying it directly is slow. A projection listens to the event stream and builds a query-optimized view: a table with current balance, a table with transaction history, a table with monthly summaries. When a new event arrives, the projection updates. The projection can be rebuilt from scratch at any time by replaying the full event log — this is the "time-travel" capability.

**Snapshots:**
For an account with 10 years of transactions, replaying from event 1 is slow. A snapshot captures the state at a point in time: `{balance: 1000, as_of_event: 5000}`. To compute current state: load the snapshot, replay only events 5001+. Snapshots are an optimization, not required for correctness.

**Constraints:**
- Events are immutable — you cannot "fix" a wrong event. You compensate: add a correcting event (`DepositReversed`).
- Event schema evolution is hard — old events must remain readable with new code. Never change what event fields mean; only add new optional fields.
- The event store grows forever — old events are never deleted. Storage is cheap; this is usually acceptable. For truly ephemeral data, use state storage.
- Querying current state requires projection — you can't do `SELECT balance WHERE account_id = 1` against the event log directly (well, you can with aggregation, but it's slow).

**Tradeoffs:**
- Event sourcing vs state storage: event sourcing gives you audit trails, time-travel, and projection flexibility at the cost of complexity, eventual consistency in projections, and storage growth. State storage is simpler, faster for point queries, but loses history.
- When to use event sourcing: entities with important audit requirements (financial, medical, legal), systems where "what happened" is as valuable as "what is the current state," systems that need to rebuild projections from scratch when business requirements change.
- When NOT to use event sourcing: high-frequency state changes that don't need history (mouse cursor position), simple CRUD where history doesn't matter, small projects where the complexity isn't justified.

**Failure modes:**
- Event log without versioning: event schema changes break replay of old events
- Missing compensation events: "undo" implemented as event deletion instead of a compensating event corrupts the audit trail
- Projection drift: projection falls behind the event stream and serves stale data without indicating it's stale
- Treating projections as authoritative: querying a projection that's seconds behind and making decisions that require up-to-date state

**Operational reality:**
Event sourcing is used in financial systems (every transaction is an event), e-commerce (order lifecycle events), and audit-heavy domains (medical records, legal case management). EventStoreDB is a purpose-built event store. Apache Kafka is used as an event log for streaming event-sourced systems. CQRS (Drill 4.8) and event sourcing are frequently combined: commands produce events, projections are the read model.

**You will see this again in:**
Domain-Driven Design (aggregates emit events), CQRS implementations, distributed systems with event-driven architecture, audit log requirements, time-series databases (each data point is an event).

**Watch for:**
The difference between a domain event and a change-data-capture (CDC) log. CDC captures database row changes. Domain events capture business facts. `UserUpdated (old: {name: "bob"}, new: {name: "alice"})` is a CDC record. `UserNameChanged (user_id: 1, old_name: "bob", new_name: "alice", changed_by: "admin", reason: "legal name change")` is a domain event. Domain events carry business meaning; CDC records carry technical change data.

---

## Step 1 — The Event Store and Aggregate

Create `bank_events.py`:

```python
# bank_events.py — event-sourced bank account
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any
import json
import time

# ── Events ──────────────────────────────────────────────────────────────────
# Events are immutable facts. Past tense names. No methods.

@dataclass(frozen=True)
class AccountOpened:
    account_id: str
    owner: str
    timestamp: float = field(default_factory=time.time)

@dataclass(frozen=True)
class MoneyDeposited:
    account_id: str
    amount: float
    description: str
    timestamp: float = field(default_factory=time.time)

@dataclass(frozen=True)
class MoneyWithdrawn:
    account_id: str
    amount: float
    description: str
    timestamp: float = field(default_factory=time.time)

@dataclass(frozen=True)
class TransferInitiated:
    account_id: str
    to_account: str
    amount: float
    timestamp: float = field(default_factory=time.time)

Event = AccountOpened | MoneyDeposited | MoneyWithdrawn | TransferInitiated


# ── Event Store ──────────────────────────────────────────────────────────────
# In production: EventStoreDB, Kafka, PostgreSQL with append-only table.
# Here: in-memory list.

class EventStore:
    def __init__(self):
        self._events: list[Event] = []
    
    def append(self, event: Event) -> None:
        self._events.append(event)
        print(f"  [store] {type(event).__name__} for {event.account_id}")
    
    def load(self, account_id: str) -> list[Event]:
        return [e for e in self._events if e.account_id == account_id]
    
    def all_events(self) -> list[Event]:
        return list(self._events)


# ── Aggregate ────────────────────────────────────────────────────────────────
# The aggregate replays events to reconstruct current state.

@dataclass
class AccountState:
    account_id: str
    owner: str = ""
    balance: float = 0.0
    is_open: bool = False
    version: int = 0  # event count — used for optimistic locking

class BankAccount:
    def __init__(self, account_id: str, store: EventStore):
        self.account_id = account_id
        self._store = store
        self._state = self._replay()
    
    def _replay(self) -> AccountState:
        """Reconstruct state from event log."""
        state = AccountState(account_id=self.account_id)
        for event in self._store.load(self.account_id):
            self._apply(state, event)
        return state
    
    def _apply(self, state: AccountState, event: Event) -> None:
        """Apply one event to state. Pure function: same event always produces same state change."""
        if isinstance(event, AccountOpened):
            state.owner = event.owner
            state.is_open = True
        elif isinstance(event, MoneyDeposited):
            state.balance += event.amount
        elif isinstance(event, MoneyWithdrawn):
            state.balance -= event.amount
        elif isinstance(event, TransferInitiated):
            state.balance -= event.amount
        state.version += 1
    
    # ── Commands (business logic + event emission) ──────────────────────────
    
    def open(self, owner: str) -> None:
        if self._state.is_open:
            raise ValueError("Account already open")
        self._emit(AccountOpened(account_id=self.account_id, owner=owner))
    
    def deposit(self, amount: float, description: str = "") -> None:
        if not self._state.is_open:
            raise ValueError("Account not open")
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._emit(MoneyDeposited(account_id=self.account_id, 
                                   amount=amount, description=description))
    
    def withdraw(self, amount: float, description: str = "") -> None:
        if not self._state.is_open:
            raise ValueError("Account not open")
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if self._state.balance < amount:
            raise ValueError(f"Insufficient funds: balance={self._state.balance}, requested={amount}")
        self._emit(MoneyWithdrawn(account_id=self.account_id,
                                   amount=amount, description=description))
    
    def _emit(self, event: Event) -> None:
        """Record event to store and apply to local state."""
        self._store.append(event)
        self._apply(self._state, event)
    
    @property
    def balance(self) -> float:
        return self._state.balance
    
    @property
    def version(self) -> int:
        return self._state.version
```

Create `demo_events.py`:

```python
from bank_events import BankAccount, EventStore

store = EventStore()

print("=== Event-Sourced Bank Account ===\n")

# Open account and perform transactions
acc = BankAccount("ACC-001", store)
acc.open("Alice")
acc.deposit(500.00, "Initial deposit")
acc.deposit(200.00, "Paycheck")
acc.withdraw(50.00, "Coffee")
acc.withdraw(150.00, "Groceries")
acc.deposit(1000.00, "Bonus")

print(f"\nCurrent balance: ${acc.balance:.2f}")
print(f"Total events:    {acc.version}")

# Show the full event log
print(f"\n=== Full Event Log ===")
for i, event in enumerate(store.load("ACC-001"), 1):
    ts = __import__("datetime").datetime.fromtimestamp(event.timestamp).strftime("%Y-%m-%d %H:%M:%S")
    event_type = type(event).__name__
    amount = getattr(event, "amount", "N/A")
    desc = getattr(event, "description", "")
    print(f"  {i:2d}. [{ts}] {event_type:<20} amount={amount!s:<8} {desc}")
```

### SAVE AND TRY

```
python demo_events.py
```

Expected output:
```
=== Event-Sourced Bank Account ===

  [store] AccountOpened for ACC-001
  [store] MoneyDeposited for ACC-001
  [store] MoneyDeposited for ACC-001
  [store] MoneyWithdrawn for ACC-001
  [store] MoneyWithdrawn for ACC-001
  [store] MoneyDeposited for ACC-001

Current balance: $1500.00
Total events:    6

=== Full Event Log ===
   1. [2026-05-15 ...] AccountOpened        amount=N/A    
   2. [2026-05-15 ...] MoneyDeposited       amount=500.0   Initial deposit
   3. [2026-05-15 ...] MoneyDeposited       amount=200.0   Paycheck
   4. [2026-05-15 ...] MoneyWithdrawn       amount=50.0    Coffee
   5. [2026-05-15 ...] MoneyWithdrawn       amount=150.0   Groceries
   6. [2026-05-15 ...] MoneyDeposited       amount=1000.0  Bonus
```

**Change something:** Try to withdraw more than the balance:
```python
acc.withdraw(10000.00, "Attempted overdraft")
```
Expected: `ValueError: Insufficient funds: balance=1500.0, requested=10000.0`. The business rule is enforced during command processing, before any event is emitted. No "failed withdrawal" event is written — the attempt simply fails.

---

## Step 2 — Time Travel: Replay to Any Past State

Add to `demo_events.py`:

```python
from bank_events import AccountState

def replay_at_version(store, account_id: str, target_version: int) -> AccountState:
    """Reconstruct state as it was after exactly target_version events."""
    events = store.load(account_id)
    state = AccountState(account_id=account_id)
    
    for event in events[:target_version]:
        # Apply events manually (same logic as BankAccount._apply)
        from bank_events import AccountOpened, MoneyDeposited, MoneyWithdrawn
        if isinstance(event, AccountOpened):
            state.owner = event.owner
            state.is_open = True
        elif isinstance(event, MoneyDeposited):
            state.balance += event.amount
        elif isinstance(event, MoneyWithdrawn):
            state.balance -= event.amount
        state.version += 1
    
    return state

print("\n=== Time Travel ===")
for v in range(7):
    state = replay_at_version(store, "ACC-001", v)
    print(f"  After event {v}: balance=${state.balance:.2f}")
```

### SAVE AND TRY

Add the time travel section and run again. Expected output:
```
=== Time Travel ===
  After event 0: balance=$0.00
  After event 1: balance=$0.00  (AccountOpened)
  After event 2: balance=$500.00
  After event 3: balance=$700.00
  After event 4: balance=$650.00
  After event 5: balance=$500.00
  After event 6: balance=$1500.00
```

No special storage needed — just replay fewer events. This is the "time travel" capability of event sourcing. An auditor can reconstruct the account state at any historical moment.

---

## Step 3 — Projections: Query-Optimized Read Models

The event log is authoritative but slow to query. Projections listen to events and build fast read views:

```python
# projections.py
from bank_events import (
    EventStore, AccountOpened, MoneyDeposited, MoneyWithdrawn, Event
)
from dataclasses import dataclass, field
from collections import defaultdict

@dataclass
class AccountSummary:
    account_id: str
    owner: str = ""
    balance: float = 0.0
    total_deposits: float = 0.0
    total_withdrawals: float = 0.0
    transaction_count: int = 0

class AccountSummaryProjection:
    """
    Builds a query-optimized view from the event stream.
    Rebuilding from scratch by replaying all events gives the same result.
    """
    def __init__(self):
        self._summaries: dict[str, AccountSummary] = {}
    
    def handle(self, event: Event) -> None:
        """Apply one event to the projection."""
        account_id = event.account_id
        if account_id not in self._summaries:
            self._summaries[account_id] = AccountSummary(account_id=account_id)
        
        s = self._summaries[account_id]
        
        if isinstance(event, AccountOpened):
            s.owner = event.owner
        elif isinstance(event, MoneyDeposited):
            s.balance += event.amount
            s.total_deposits += event.amount
            s.transaction_count += 1
        elif isinstance(event, MoneyWithdrawn):
            s.balance -= event.amount
            s.total_withdrawals += event.amount
            s.transaction_count += 1
    
    def rebuild(self, store: EventStore) -> None:
        """Replay entire event log to rebuild projection from scratch."""
        self._summaries.clear()
        for event in store.all_events():
            self.handle(event)
    
    def get(self, account_id: str) -> AccountSummary | None:
        return self._summaries.get(account_id)
    
    def all(self) -> list[AccountSummary]:
        return list(self._summaries.values())


class MonthlyTransactionProjection:
    """Builds a monthly summary per account."""
    def __init__(self):
        self._monthly: dict[str, dict[str, dict]] = defaultdict(
            lambda: defaultdict(lambda: {"deposits": 0.0, "withdrawals": 0.0, "count": 0})
        )
    
    def handle(self, event: Event) -> None:
        import datetime
        if isinstance(event, (MoneyDeposited, MoneyWithdrawn)):
            month = datetime.datetime.fromtimestamp(event.timestamp).strftime("%Y-%m")
            entry = self._monthly[event.account_id][month]
            if isinstance(event, MoneyDeposited):
                entry["deposits"] += event.amount
            else:
                entry["withdrawals"] += event.amount
            entry["count"] += 1
    
    def rebuild(self, store: EventStore) -> None:
        self._monthly.clear()
        for event in store.all_events():
            self.handle(event)
    
    def get_monthly(self, account_id: str) -> dict:
        return dict(self._monthly.get(account_id, {}))


if __name__ == "__main__":
    from bank_events import BankAccount
    import time
    
    store = EventStore()
    
    # Create multiple accounts
    for acc_id, owner, ops in [
        ("ACC-001", "Alice", [(500, "D"), (200, "D"), (50, "W")]),
        ("ACC-002", "Bob",   [(1000, "D"), (300, "W"), (200, "W")]),
    ]:
        acc = BankAccount(acc_id, store)
        acc.open(owner)
        for amount, op in ops:
            if op == "D":
                acc.deposit(amount)
            else:
                acc.withdraw(amount)
    
    # Build projections
    summary_proj = AccountSummaryProjection()
    monthly_proj = MonthlyTransactionProjection()
    
    # Rebuild from event log
    summary_proj.rebuild(store)
    monthly_proj.rebuild(store)
    
    print("=== Account Summary Projection ===")
    for s in summary_proj.all():
        print(f"\n  {s.account_id} ({s.owner}):")
        print(f"    Balance:     ${s.balance:.2f}")
        print(f"    Deposits:    ${s.total_deposits:.2f}")
        print(f"    Withdrawals: ${s.total_withdrawals:.2f}")
        print(f"    Tx count:    {s.transaction_count}")
    
    print("\n=== Monthly Summary ===")
    monthly = monthly_proj.get_monthly("ACC-001")
    for month, data in sorted(monthly.items()):
        print(f"  {month}: deposits=${data['deposits']:.0f} withdrawals=${data['withdrawals']:.0f}")
    
    print("\n=== Projection Rebuild Demo ===")
    # Projections can be rebuilt at any time — even if you add new fields
    print("Adding new projection field 'average_deposit'...")
    # Just rebuild — no migration needed
    summary_proj.rebuild(store)
    for s in summary_proj.all():
        avg = s.total_deposits / max(1, s.transaction_count)
        print(f"  {s.account_id}: avg_deposit=${avg:.2f}")
    print("Projection rebuilt from events — no data migration needed")
```

### SAVE AND TRY

```
python projections.py
```

Expected output:
```
=== Account Summary Projection ===

  ACC-001 (Alice):
    Balance:     $650.00
    Deposits:    $700.00
    Withdrawals: $50.00
    Tx count:    3

  ACC-002 (Bob):
    Balance:     $500.00
    Deposits:    $1000.00
    Withdrawals: $500.00
    Tx count:    3

=== Monthly Summary ===
  2026-05: deposits=$700 withdrawals=$50

=== Projection Rebuild Demo ===
Adding new projection field 'average_deposit'...
  ACC-001: avg_deposit=$233.33
  ACC-002: avg_deposit=$500.00
Projection rebuilt from events — no data migration needed
```

The projection rebuild shows the key event sourcing advantage: adding a new "average deposit" field requires no data migration — just replay the events and compute it. With state storage, you'd need to run a migration query on every existing row.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a complete event-sourced task manager with snapshots.

**Requirements checklist:**

- [ ] Events: `TaskCreated`, `TaskAssigned`, `TaskStarted`, `TaskCompleted`, `TaskReopened`, `CommentAdded`, `PriorityChanged`
- [ ] `TaskAggregate` replays events to get current state. Commands emit events if business rules pass:
  - `assign(user)` — only if task is not completed
  - `start()` — only if assigned
  - `complete()` — only if started
  - `reopen()` — only if completed (creates a new cycle)
- [ ] `EventStore` with `append(stream_id, event)` and `load(stream_id)` — supports multiple streams (one per task)
- [ ] Snapshot support: `save_snapshot(task_id, state, version)` and `load_snapshot(task_id) → (state, version)`. `TaskAggregate._replay()` uses snapshot if present, then applies only newer events.
- [ ] Three projections:
  - `TaskStatusProjection` — `{task_id: current_status}` for all tasks
  - `UserWorkloadProjection` — `{user: [task_ids assigned to user]}`
  - `ActivityFeedProjection` — last 10 events across all tasks (any type, any task)
- [ ] `rebuild_all_projections(store)` replays entire store and returns all three projections populated
- [ ] A snapshot is automatically saved every 5 events per task

**Starter:**
```python
from dataclasses import dataclass, field
from typing import Literal
import time

@dataclass(frozen=True)
class TaskCreated:
    task_id: str
    title: str
    description: str
    timestamp: float = field(default_factory=time.time)

# TODO: define remaining event types

@dataclass
class TaskState:
    task_id: str
    title: str = ""
    status: Literal["created", "assigned", "started", "completed"] = "created"
    assignee: str = ""
    priority: str = "medium"
    comments: list = field(default_factory=list)
    version: int = 0

class TaskAggregate:
    SNAPSHOT_EVERY = 5
    
    def __init__(self, task_id: str, store: "EventStore"):
        self.task_id = task_id
        self._store = store
        self._state = self._replay()
    
    def _replay(self) -> TaskState:
        # TODO: check for snapshot, load it if present, then apply newer events
        pass
```

**When you're done:**
```
python test_task_events.py
```
Output:
```
Created 5 tasks, performed 20+ operations
Snapshot saved at version 5 for task-1

=== Status Projection ===
  task-1: completed
  task-2: started
  ...

=== Workload Projection ===
  alice: [task-1, task-3]
  bob:   [task-2]

=== Activity Feed (last 10) ===
  TaskCompleted: task-1 by alice
  CommentAdded: task-2 "looks good"
  ...

=== Time Travel ===
  task-1 at version 3: status=started
  task-1 at version 5: status=completed
```

**Stuck?** Ask AI: "In Python, how do I implement snapshots for event sourcing? I have an EventStore that loads events by stream_id. I want to save a snapshot of the aggregate state every N events so that replay doesn't have to go all the way back to event 1. Show me the snapshot save/load pattern and how replay uses it."

---

## Quick Check Answers

**1. What's missing in `balance = 1000`:**
The history that produced that balance. You don't know: when each deposit or withdrawal happened, who authorized them, what descriptions were given, or whether any corrections were made. An auditor cannot verify compliance — they can only see the current state, not how it got there. For regulated industries (banking, healthcare, legal), this is a compliance failure. Event sourcing solves this by making the history the primary record.

**2. New report from event log vs state store:**
From the event log: iterate all `MoneyDeposited` events, compute average. No schema change, no data migration. The event log already contains all historical deposits. From a state store: you must have stored individual transaction records (a separate table), or you cannot compute it — the current balance contains no information about how many deposits were made. This is the "new projection from old events" advantage: event logs are the source of truth from which any read model can be derived.

**3. Scale problem with event sourcing:**
The event log grows without bound. A high-volume system (thousands of events per second) accumulates millions of events per day. Storage costs grow linearly with time. Replaying from the beginning becomes slower. Two mitigations: (a) Snapshots — periodically capture current state and only replay newer events. (b) Archival — move old events to cold storage (S3 Glacier), keep recent events in hot storage. You trade some time-travel capability for storage cost.

**4. Why projections are eventually consistent:**
After an event is written to the event store, the projection must receive that event (via pub/sub, polling, or an explicit `handle()` call) and update its internal state before the new data is visible to queries. This processing takes time — even milliseconds. During that window, a read from the projection returns the pre-event state. In distributed systems with async projection updates, this window can be seconds or longer if the projection processor is backlogged. This is why you should not query projections when you need the absolute latest state for a decision — query the aggregate (replay events) instead.
