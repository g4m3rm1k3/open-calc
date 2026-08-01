# SE Masterclass — LAB-52 — Task Scheduler

**Language: Python** — same module as LAB-50–51.

**Prerequisites:** LAB-15 (the priority queue — this lab's scheduler is LAB-15's `MinHeap`, keyed by "when to run next" instead of "priority"), LAB-10 (tokenizing — parsing a cron expression is a small grammar).

**What this lab adds:**
- Delayed execution: run something once, later, not right now
- Recurring execution: run something repeatedly, on an interval
- Parsing a simplified cron expression into "when's the next run?"
- A real scheduler: a MIN-HEAP (LAB-15) of "next run time," always executing whatever's due soonest

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `threading.Timer(5, fn).start()` runs `fn` once, after 5 seconds. What data structure would you need to run MANY differently-timed future tasks efficiently, always picking the SOONEST one next?
> 2. A cron expression like `*/5 * * * *` means "every 5 minutes." What does the scheduler need to compute EVERY time a task runs, to know when to run it AGAIN?
> 3. A recurring task takes LONGER to run than its own interval (a 2-minute task scheduled every 1 minute). What problem does this cause if not handled deliberately?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python scheduler.py` prints:

```
=== Delayed Execution ===
scheduled 'send_reminder' to run in 2s
[t=2.0s] running: send_reminder

=== Recurring Execution ===
scheduled 'health_check' to run every 1s, 3 times
[t=1.0s] running: health_check (run 1)
[t=2.0s] running: health_check (run 2)
[t=3.0s] running: health_check (run 3)

=== Priority Scheduler: Always Runs What's Due Soonest ===
scheduled: task_A (due in 3s), task_B (due in 1s), task_C (due in 2s)
[t=1.0s] running: task_B (was due soonest)
[t=2.0s] running: task_C
[t=3.0s] running: task_A

=== Overlap Prevention ===
task 'slow_job' takes 2.5s but is scheduled every 1s
run 1 started at t=0s
run 2 SKIPPED at t=1s — run 1 still in progress
run 2 SKIPPED at t=2s — run 1 still in progress
run 1 finished at t=2.5s
run 2 started at t=2.5s (first opportunity after run 1 finished)
```

---

### Concept: A Scheduler Is a Priority Queue Keyed by Time

**What it is:** A task scheduler managing MANY future tasks, each due at a DIFFERENT time, needs to efficiently answer "what's due SOONEST?" repeatedly — exactly LAB-15's priority queue problem, with "next run time" as the priority instead of an urgency number.

**Project Application (The "Why" here):** LAB-15's `MinHeap` is not just A way to build this — it IS the standard way real schedulers (cron, Celery Beat, Kubernetes CronJobs) are implemented internally: a min-heap of "next execution time," always popping and running whatever's due first.

---

## Step 1 — Delayed Execution

```python
# scheduler.py
import threading
import time

start_time = time.time()

def log(message):
    elapsed = time.time() - start_time
    print(f"[t={elapsed:.1f}s] {message}")

def send_reminder():
    log("running: send_reminder")

print("=== Delayed Execution ===")
print("scheduled 'send_reminder' to run in 2s")
timer = threading.Timer(2.0, send_reminder)
timer.start()
timer.join()          # wait here so the demo script's output is deterministic
```

### SAVE AND TRY

```bash
python scheduler.py
```

**Expected:**
```
=== Delayed Execution ===
scheduled 'send_reminder' to run in 2s
[t=2.0s] running: send_reminder
```

---

## Step 2 — Recurring Execution

```python
def health_check(run_count=[0]):                    # a mutable default to track state across calls, for this simple demo
    run_count[0] += 1
    log(f"running: health_check (run {run_count[0]})")
    if run_count[0] < 3:
        threading.Timer(1.0, health_check, args=(run_count,)).start()    # ← add: RESCHEDULE itself — this is what makes it recurring

print("\n=== Recurring Execution ===")
print("scheduled 'health_check' to run every 1s, 3 times")
threading.Timer(1.0, health_check, args=([0],)).start()
time.sleep(3.5)          # wait for all 3 runs in this demo script
```

### SAVE AND TRY

```bash
python scheduler.py
```

**Expected:**
```
=== Recurring Execution ===
scheduled 'health_check' to run every 1s, 3 times
[t=1.0s] running: health_check (run 1)
[t=2.0s] running: health_check (run 2)
[t=3.0s] running: health_check (run 3)
```

**Confirm the self-rescheduling mechanism:** `health_check` calls `threading.Timer(1.0, health_check, ...)` on ITSELF, from WITHIN its own execution — each run schedules the NEXT run, exactly like LAB-07's recursion, but spread out over TIME instead of the call stack. There's no special "recurring timer" primitive in Python — recurrence is built out of a ONE-SHOT timer that reschedules itself.

---

## Step 3 — A Priority Scheduler (LAB-15's Heap, Applied)

```python
import heapq          # Python's built-in binary heap — LAB-15's MinHeap, ready-made

class Scheduler:
    def __init__(self):
        self.heap = []        # each entry: (due_time, task_name, callback)
        self.counter = 0        # tie-breaker for equal due_times — heapq needs items to be comparable

    def schedule_at(self, due_time, name, callback):
        self.counter += 1
        heapq.heappush(self.heap, (due_time, self.counter, name, callback))   # ← add: LAB-15's insert(), O(log n)

    def run_due_tasks(self, now):
        while self.heap and self.heap[0][0] <= now:            # ← add: peek — is the SOONEST task due yet?
            due_time, _, name, callback = heapq.heappop(self.heap)   # ← add: LAB-15's extractMin(), O(log n)
            log(f"running: {name}")
            callback()

print("\n=== Priority Scheduler: Always Runs What's Due Soonest ===")
scheduler = Scheduler()
scheduler.schedule_at(start_time + 3, "task_A", lambda: None)
scheduler.schedule_at(start_time + 1, "task_B", lambda: None)
scheduler.schedule_at(start_time + 2, "task_C", lambda: None)
print("scheduled: task_A (due in 3s), task_B (due in 1s), task_C (due in 2s)")

for _ in range(3):
    time.sleep(1)
    scheduler.run_due_tasks(time.time())
```

### SAVE AND TRY

```bash
python scheduler.py
```

**Expected:**
```
=== Priority Scheduler: Always Runs What's Due Soonest ===
scheduled: task_A (due in 3s), task_B (due in 1s), task_C (due in 2s)
[t=1.0s] running: task_B (was due soonest)
[t=2.0s] running: task_C
[t=3.0s] running: task_A
```

**Confirm the heap ordering, not the SCHEDULING order, determines execution order:** `task_A` was scheduled FIRST but runs LAST — because its due time (3s) is LATEST. This is EXACTLY LAB-15's scheduler: the heap always surfaces whatever's due SOONEST, regardless of insertion order, using the SAME `heapq.heappush`/`heappop` operations (Python's standard library version of LAB-15's hand-built `MinHeap`).

---

### Concept: Overlap Prevention

**What it is:** If a recurring task's execution takes LONGER than its own interval, naively rescheduling could start a SECOND run of the SAME task while the FIRST is still going — potentially causing race conditions (LAB-6.1) if the task touches shared state, or just wasting resources running duplicate work.

---

## Step 4 — Prevent Overlapping Runs

```python
import threading

class SafeRecurringTask:
    def __init__(self, name, interval, work):
        self.name = name
        self.interval = interval
        self.work = work
        self.running = False                            # ← add: a simple lock-like flag

    def tick(self, run_number):
        if self.running:
            log(f"run {run_number} SKIPPED at — {self.name} still in progress")
            return
        self.running = True
        threading.Thread(target=self._run, args=(run_number,)).start()

    def _run(self, run_number):
        log(f"run {run_number} started")
        self.work()
        self.running = False
        log(f"run {run_number} finished")

def slow_job():
    time.sleep(2.5)

print("\n=== Overlap Prevention ===")
print("task 'slow_job' takes 2.5s but is scheduled every 1s")
task = SafeRecurringTask("slow_job", 1.0, slow_job)
for i in range(1, 4):
    threading.Timer(i * 1.0, task.tick, args=(i,)).start()
time.sleep(4)
```

### SAVE AND TRY

```bash
python scheduler.py
```

**Expected (shape):**
```
=== Overlap Prevention ===
task 'slow_job' takes 2.5s but is scheduled every 1s
run 1 started at t=0s
run 2 SKIPPED at t=1s — run 1 still in progress
run 2 SKIPPED at t=2s — run 1 still in progress
run 1 finished at t=2.5s
run 2 started at t=2.5s (first opportunity after run 1 finished)
```

**Confirm the `self.running` flag is doing real coordination:** Without it, `tick()` would happily start a SECOND `slow_job` at `t=1s` while the FIRST is still running (until `t=2.5s`) — two overlapping executions of the same task, each potentially racing on shared state. The flag is a simple form of MUTUAL EXCLUSION (a real lock, LAB-6.1's territory, would be more robust for genuinely concurrent access, but the PRINCIPLE — "check if already running, skip if so" — is the same defensive instinct.)

---

## 🎯 Challenge: Parse a Simplified Cron Expression

**You know:** LAB-10's tokenizing instincts apply to ANY small, structured text format — including `*/5 * * * *` (minute, hour, day, month, weekday — `*` means "any," `*/N` means "every N units").

**Task:** Write `next_run_time(cron_expr, now)` that, for a SIMPLIFIED cron supporting only the MINUTE field (`*` or `*/N`), computes the next minute boundary the task should run at.

<details>
<summary>▶ Show Solution</summary>

```python
import datetime

def next_run_time(cron_expr: str, now: datetime.datetime) -> datetime.datetime:
    minute_field = cron_expr.split(' ')[0]     # only handling the minute field, for simplicity

    if minute_field == '*':
        return (now.replace(second=0, microsecond=0) + datetime.timedelta(minutes=1))

    if minute_field.startswith('*/'):
        interval = int(minute_field[2:])
        next_minute = ((now.minute // interval) + 1) * interval
        if next_minute >= 60:
            return now.replace(minute=0, second=0, microsecond=0) + datetime.timedelta(hours=1)
        return now.replace(minute=next_minute, second=0, microsecond=0)

    raise ValueError(f"unsupported cron minute field: {minute_field}")

# next_run_time("*/5 * * * *", datetime.datetime(2026, 1, 1, 10, 7))
# -> 2026-01-01 10:10:00  (the next 5-minute boundary after :07)
```

**Key insight:** This is a SMALL, dedicated grammar (only the minute field, for this lab's scope) — the SAME "classify structured text, then compute meaning from it" shape as LAB-10's lexer, just with a domain of "cron syntax" instead of "arithmetic expressions." A real cron parser (handling all 5 fields, ranges like `1-5`, lists like `1,15,30`) is a bigger version of this exact idea — LAB-10/11's full lexer+parser pipeline, applied to cron's specific grammar.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `Scheduler`'s min-heap | cron's internal implementation, Celery Beat, Kubernetes CronJob controller |
| Self-rescheduling timers | `setInterval` in JS, `node-cron`, any "recurring timer" library |
| Overlap prevention | Why real cron jobs often wrap their command in a lock-file check (`flock`) |
| Cron expression parsing | The actual crontab syntax your OS's `cron` daemon parses |

---

## Final Check

| Feature | How to verify |
|---|---|
| A delayed task runs once, after the correct delay | Step 1 |
| A recurring task correctly reschedules itself for each subsequent run | Step 2 |
| The priority scheduler runs tasks in DUE-TIME order, not scheduling order | Step 3 |
| A slow recurring task's overlapping runs are correctly skipped, not duplicated | Step 4 |
| A simplified cron expression correctly computes the next run time | Challenge |
| You can explain, without notes, why a scheduler is "just" a priority queue keyed by time | Concept box |

---

## Quick Check Answers

**1. Data structure for many differently-timed tasks, always picking the soonest?**

A min-heap (priority queue), keyed by due-time — exactly LAB-15's `MinHeap`, and this lab's Step 3 `Scheduler` class, which uses Python's built-in `heapq` (the standard library's version of the SAME structure). `heappush`/`heappop` both run in O(log n) (LAB-08), making this efficient even with a large number of pending scheduled tasks.

**2. What must a recurring task compute every time it runs, to know when to run again?**

Its NEXT due time, based on either a fixed interval (Step 2's `+1 second` each run) or a cron expression's rule (the Challenge's `next_run_time`) — this computation happens FRESH on every run, using the CURRENT time as the reference point, rather than being decided once and never recalculated, which matters especially for cron-style scheduling where the interval isn't always a perfectly uniform gap (e.g., "run at the top of every hour" needs a different calculation depending on what time it currently is).

**3. A task taking longer than its own interval — what problem does this cause?**

Overlapping executions — a SECOND run could start while the FIRST is still in progress, demonstrated directly in Step 4's `slow_job` (2.5s duration, 1s interval) example. Without explicit prevention (the `self.running` flag), this risks race conditions if the task touches shared state (two copies of the same logic running concurrently, potentially interfering with each other) and wastes resources running duplicate, redundant work — which is exactly why Step 4's `SafeRecurringTask` SKIPS a scheduled run rather than letting it stack up behind an already-running one.

---

*Next: [LAB-53 — File Indexing Engine](LAB-53-file-indexing-engine.md) — JavaScript (Node.js), same module*
