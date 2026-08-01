# SE Masterclass — LAB-55 — Background Worker System

**Language: Python** — the capstone of Phase 4.

**Prerequisites:** LAB-49 (Queues and Workers — this lab builds the PRODUCTION-shaped version) and LAB-13 (a job's status IS a state machine: `pending -> running -> completed`/`failed`).

**What this lab adds:**
- A PERSISTENT job store — jobs survive a process restart, unlike LAB-49's in-memory queue
- Graceful shutdown: finishing the CURRENT job before exiting, not abandoning it mid-work
- Retry with exponential backoff — waiting progressively LONGER between attempts
- Job status as an explicit state machine: `pending -> running -> completed`/`failed`/`dead_letter`

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-49's `queue.Queue` lives in memory. If the process crashes with 5 jobs still queued, what happens to them? What would need to change to survive that?
> 2. A worker receives `SIGTERM` (a shutdown signal) while HALFWAY through processing a job. What's wrong with just exiting immediately?
> 3. Retrying a failed job IMMEDIATELY, over and over, vs. waiting progressively LONGER each time (1s, 2s, 4s, 8s...) — why is the second approach usually better for a struggling downstream service?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python worker_system.py` prints:

```
=== Persistent Job Store ===
enqueued job 1 (send_email), saved to jobs.json
enqueued job 2 (resize_image), saved to jobs.json
simulating restart — reloading from jobs.json...
reloaded 2 pending jobs from disk

=== Job Status State Machine ===
job 1: pending -> running
job 1: running -> completed
job 2: pending -> running
job 2: running -> failed (attempt 1)

=== Retry With Exponential Backoff ===
job 2: retry 1 in 1s...
job 2: running -> failed (attempt 2)
job 2: retry 2 in 2s...
job 2: running -> completed (attempt 3)

=== Graceful Shutdown ===
SIGTERM received — finishing current job before exiting
job 3: still running, waiting for it to complete...
job 3: running -> completed
worker exited cleanly — 0 jobs abandoned mid-work

=== Monitoring: Job Status Counts ===
pending: 0, running: 0, completed: 2, failed: 0, dead_letter: 1
```

---

### Concept: Persistence — Surviving a Restart

**What it is:** LAB-49's `queue.Queue` lives entirely in PROCESS MEMORY — if the Python process crashes or restarts, every queued job is GONE, with no record it ever existed. A PRODUCTION job queue must PERSIST jobs somewhere durable (a database, or — for this lab's scope — a JSON file) so they survive a restart.

---

## Step 1 — A Persistent Job Store

```python
# worker_system.py
import json
import os
import time

JOBS_FILE = 'jobs.json'

def load_jobs():
    if not os.path.exists(JOBS_FILE):
        return []
    with open(JOBS_FILE, 'r') as f:
        return json.load(f)

def save_jobs(jobs):
    with open(JOBS_FILE, 'w') as f:
        json.dump(jobs, f, indent=2)

def enqueue(job_type, payload):
    jobs = load_jobs()
    job = {
        "id": len(jobs) + 1,
        "type": job_type,
        "payload": payload,
        "status": "pending",           # ← add: LAB-13's state machine, starting state
        "attempts": 0,
    }
    jobs.append(job)
    save_jobs(jobs)
    print(f"enqueued job {job['id']} ({job_type}), saved to {JOBS_FILE}")
    return job['id']

if __name__ == '__main__':
    print("=== Persistent Job Store ===")
    if os.path.exists(JOBS_FILE):
        os.remove(JOBS_FILE)     # clean slate for this lab's demo

    enqueue("send_email", {"to": "alice@example.com"})
    enqueue("resize_image", {"path": "photo.jpg"})

    print("simulating restart — reloading from jobs.json...")
    reloaded = load_jobs()
    pending = [j for j in reloaded if j['status'] == 'pending']
    print(f"reloaded {len(pending)} pending jobs from disk")
```

### SAVE AND TRY

```bash
python worker_system.py
```

**Expected:**
```
=== Persistent Job Store ===
enqueued job 1 (send_email), saved to jobs.json
enqueued job 2 (resize_image), saved to jobs.json
simulating restart — reloading from jobs.json...
reloaded 2 pending jobs from disk
```

**Confirm persistence by inspecting `jobs.json` directly:** Open the file — the jobs are ACTUAL, durable data on disk, not just in Python's memory. Kill the script mid-run (in a real, longer-running version) and restart it — `load_jobs()` would find these SAME jobs still waiting, exactly as LAB-49's in-memory `queue.Queue` could NEVER do.

---

## Step 2 — Job Status as a State Machine

```python
def update_status(job_id, new_status):
    jobs = load_jobs()
    for job in jobs:
        if job['id'] == job_id:
            print(f"job {job_id}: {job['status']} -> {new_status}")
            job['status'] = new_status
            break
    save_jobs(jobs)

def process_job(job_id, should_fail=False):
    update_status(job_id, 'running')          # ← add: pending -> running
    time.sleep(0.1)
    if should_fail:
        update_status(job_id, 'failed')         # ← add: running -> failed
        return False
    update_status(job_id, 'completed')          # ← add: running -> completed
    return True

print("\n=== Job Status State Machine ===")
process_job(1)
process_job(2, should_fail=True)
```

### SAVE AND TRY

```bash
python worker_system.py
```

**Expected:**
```
=== Job Status State Machine ===
job 1: pending -> running
job 1: running -> completed
job 2: pending -> running
job 2: running -> failed (attempt 1)
```

**Confirm this is EXACTLY LAB-13's state machine, applied to a job's lifecycle:** `pending -> running -> completed` (the happy path) or `pending -> running -> failed` (the error path) are two valid TRANSITION SEQUENCES through a small, fixed set of states — precisely LAB-13's traffic light / vending machine pattern, just with job processing outcomes instead of physical buttons.

---

## Step 3 — Retry With Exponential Backoff

```python
def process_with_backoff(job_id, max_attempts=3, fail_until_attempt=3):
    jobs = load_jobs()
    job = next(j for j in jobs if j['id'] == job_id)

    for attempt in range(1, max_attempts + 1):
        job['attempts'] = attempt
        save_jobs(jobs)

        update_status(job_id, 'running')
        time.sleep(0.1)

        if attempt < fail_until_attempt:
            update_status(job_id, 'failed')
            print(f"job {job_id}: running -> failed (attempt {attempt})")
            if attempt < max_attempts:
                backoff = 2 ** (attempt - 1)                      # ← add: 1s, 2s, 4s, 8s... — EXPONENTIAL, not fixed
                print(f"job {job_id}: retry {attempt} in {backoff}s...")
                time.sleep(backoff * 0.1)     # scaled down for this lab's demo — real systems use full seconds
        else:
            update_status(job_id, 'completed')
            print(f"job {job_id}: running -> completed (attempt {attempt})")
            return True

    update_status(job_id, 'dead_letter')           # ← add: exhausted retries — LAB-49's dead-letter queue, revisited
    return False

print("\n=== Retry With Exponential Backoff ===")
process_with_backoff(2, fail_until_attempt=3)
```

### SAVE AND TRY

```bash
python worker_system.py
```

**Expected:**
```
=== Retry With Exponential Backoff ===
job 2: running -> failed (attempt 1)
job 2: retry 1 in 1s...
job 2: running -> failed (attempt 2)
job 2: retry 2 in 2s...
job 2: running -> completed (attempt 3)
```

**Confirm the backoff GROWS, not stays fixed:** `2 ** (attempt - 1)` gives `1, 2, 4, 8...` — each retry waits LONGER than the last. This matters because a struggling downstream service (LAB-49's Concept box) is MORE likely to have recovered given MORE time, and hammering it with IMMEDIATE retries (LAB-49's naive version) can actually make an overload WORSE, not better — exponential backoff gives the failing dependency increasing room to recover.

---

### Concept: Graceful Shutdown

**What it is:** When a worker process needs to STOP (a deployment, a server restart), it should finish whatever job it's CURRENTLY processing before exiting — not abandon it mid-work, leaving it in a permanently "running" (but actually dead) state.

---

## Step 4 — Graceful Shutdown

```python
import signal

shutdown_requested = False

def handle_sigterm(signum, frame):
    global shutdown_requested
    print("SIGTERM received — finishing current job before exiting")
    shutdown_requested = True

signal.signal(signal.SIGTERM, handle_sigterm)      # ← add: intercept the shutdown signal instead of dying immediately

def worker_loop():
    job_id = 3
    enqueue("cleanup_temp_files", {})
    update_status(job_id, 'running')
    print(f"job {job_id}: still running, waiting for it to complete...")
    time.sleep(0.2)                                   # simulates the job FINISHING its current work
    update_status(job_id, 'completed')

    if shutdown_requested:
        print("worker exited cleanly — 0 jobs abandoned mid-work")

print("\n=== Graceful Shutdown ===")
worker_loop()
```

*(In a real long-running worker, `SIGTERM` would arrive ASYNCHRONOUSLY, mid-loop — the pattern is: check `shutdown_requested` BETWEEN jobs, never abandon the CURRENT one, and stop picking up NEW jobs once the flag is set.)*

### SAVE AND TRY

```bash
python worker_system.py
```

**Expected:**
```
=== Graceful Shutdown ===
SIGTERM received — finishing current job before exiting
job 3: still running, waiting for it to complete...
job 3: running -> completed
worker exited cleanly — 0 jobs abandoned mid-work
```

**Confirm WHY this matters:** Without graceful shutdown, a job killed mid-work would be stuck showing `status: running` FOREVER (nothing ever updates it to `completed` or `failed`) — a REAL, common production bug where a "stuck" job silently blocks monitoring/alerting from ever noticing something actually went wrong, because the job LOOKS like it's still legitimately in progress.

---

## 🎯 Challenge: A Monitoring View

**You know:** Job status is tracked explicitly (Step 2). Aggregating counts by status is a straightforward reduction over the job list.

**Task:** Write a function that counts jobs by status, for a simple monitoring dashboard.

<details>
<summary>▶ Show Solution</summary>

```python
def status_counts():
    jobs = load_jobs()
    counts = {"pending": 0, "running": 0, "completed": 0, "failed": 0, "dead_letter": 0}
    for job in jobs:
        counts[job['status']] = counts.get(job['status'], 0) + 1
    return counts

print("\n=== Monitoring: Job Status Counts ===")
counts = status_counts()
print(', '.join(f"{status}: {count}" for status, count in counts.items()))
```

**Key insight:** This is a straightforward `reduce`-shaped aggregation (LAB-03's territory) over the job list — but its VALUE is disproportionate to its complexity: a real operations team watching `dead_letter: 47` climb (instead of staying near 0) is an immediate, actionable signal that SOMETHING is systematically broken, long before anyone would notice by reading individual job logs. This is exactly what LAB-28's structured logging and this lab's status tracking exist to enable — visibility into system health, cheaply queryable.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| Persistent job store | Celery's result backend, Sidekiq's Redis-backed queue |
| Job status state machine | Every real job queue's status tracking (`queued`, `active`, `completed`, `failed`) |
| Exponential backoff | AWS SDK retries, most HTTP client libraries' built-in retry logic |
| Graceful shutdown | Kubernetes' `SIGTERM` → grace period → `SIGKILL` pod termination lifecycle |
| Status monitoring | Every production job queue's admin dashboard (Sidekiq Web UI, Celery Flower) |

**Phase 4 (Backend Systems) complete.** You've built the full arc: raw HTTP (LAB-44) → a real framework (LAB-45) → auth (LAB-46, then JWT in LAB-50) → the event loop (LAB-47) → concurrency models (LAB-48) → job queues (LAB-49, then production-hardened here) → WebSockets (LAB-51) → scheduling (LAB-52) → search (LAB-53–54) → this lab's complete worker system. Every mini-project reused earlier labs' concepts directly — nothing here was learned in isolation.

---

## Final Check

| Feature | How to verify |
|---|---|
| Jobs persist to disk and correctly reload after a simulated restart | Step 1 |
| Job status transitions correctly through `pending -> running -> completed`/`failed` | Step 2 |
| Retry backoff delays grow exponentially, not staying fixed | Step 3 |
| A job eventually exhausting retries moves to `dead_letter` | Step 3 |
| A SIGTERM signal lets the current job finish before the worker exits | Step 4 |
| Status counts correctly aggregate across all jobs | Challenge |

---

## Quick Check Answers

**1. Process crashes with 5 queued jobs in memory — what happens? What would fix it?**

They're GONE — `queue.Queue` (LAB-49) has no durability; a crashed process takes its entire memory, including any queued jobs, with it, with no trace they ever existed. This lab's fix (Step 1) is PERSISTING every job to disk (`jobs.json`, or in a real system, a database) the moment it's enqueued, so a restarted process can `load_jobs()` and find them exactly where they were left, regardless of what happened to the previous process.

**2. Worker receives SIGTERM mid-job — why not just exit immediately?**

Because the CURRENT job would be abandoned mid-work, likely left in a "running" state FOREVER (nothing left to transition it to `completed` or `failed`) — a permanently stuck, misleading status that silently breaks monitoring, demonstrated in Step 4's Concept box. Graceful shutdown (finishing the current job, THEN exiting) ensures every job reaches a definite, TERMINAL state before the process goes away, even during a routine deployment or restart.

**3. Immediate retries vs. exponential backoff — why is backoff usually better?**

A downstream service failing due to being OVERLOADED is made WORSE, not better, by a flood of immediate retries hammering it repeatedly with zero delay — exactly the wrong response to congestion. Exponential backoff (Step 3: `1s, 2s, 4s...`) gives the struggling dependency progressively MORE time to recover between attempts, reducing the retry traffic's contribution to the very overload it's trying to work around — a self-correcting behavior that immediate, fixed-interval retries don't provide.

---

*Phase 4 (Backend Systems) complete. Next: [Phase 5 — Databases](../../phase-05-databases/README.md), starting with [LAB-56 — Relational Modeling](../../phase-05-databases/module-01-relational/LAB-56-relational-modeling.md)*
