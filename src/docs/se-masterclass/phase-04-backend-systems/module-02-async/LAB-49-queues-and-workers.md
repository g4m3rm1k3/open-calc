# SE Masterclass — LAB-49 — Queues and Workers

**Language: Python** — same module as LAB-47–48, closing out Module 2.

**Prerequisites:** LAB-48 (threading for I/O-bound work — workers pulling jobs and waiting on them fits this exactly), LAB-22 (the producer/consumer shape is LAB-22's publish/subscribe, with a durable QUEUE in between instead of direct notification), LAB-15 (priority — job queues often need it too).

**What this lab adds:**
- The producer/consumer pattern: decoupling WHO CREATES work from WHO DOES it
- A job queue as the durable buffer between them — LAB-05's queue, at the center of a real system
- A pool of WORKERS pulling from the SAME queue — concurrent job processing
- Retry logic for failed jobs, and a dead-letter queue for jobs that fail too many times

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A web request handler needs to send a welcome email, but sending email is slow (seconds). Why is "just send it directly in the request handler" often the wrong choice?
> 2. If a producer creates jobs FASTER than workers can process them, what happens without a queue in between? What happens WITH one?
> 3. A job fails because of a TEMPORARY problem (the email service was down for 2 seconds). Should it be retried automatically, or given up on immediately?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python job_queue.py` prints:

```
=== Producer/Consumer: Decoupled ===
producer: enqueued job 1 (send_email to alice@example.com)
producer: enqueued job 2 (send_email to bob@example.com)
producer: returned immediately — did NOT wait for emails to send

worker: processing job 1... done (took 0.5s)
worker: processing job 2... done (took 0.5s)

=== Worker Pool: Multiple Workers, One Queue ===
enqueued 6 jobs
worker-1: processing job 3... done
worker-2: processing job 4... done
worker-1: processing job 5... done
worker-2: processing job 6... done
worker-1: processing job 7... done
worker-2: processing job 8... done
all 6 jobs processed by 2 workers

=== Retry Logic ===
job 9: attempt 1 failed (simulated transient error)
job 9: attempt 2 failed (simulated transient error)
job 9: attempt 3 succeeded
job 9: completed after 3 attempts

=== Dead-Letter Queue ===
job 10: attempt 1 failed (permanent error)
job 10: attempt 2 failed (permanent error)
job 10: attempt 3 failed (permanent error)
job 10: moved to dead-letter queue after 3 failed attempts
dead-letter queue: [10]
```

---

### Concept: Producer/Consumer — Decoupling Creation From Execution

**What it is:** A **producer** creates units of work (jobs). A **consumer** (worker) processes them. A **queue** sits between them — the producer PUSHES jobs in and moves on immediately; the worker PULLS jobs out whenever it's ready. Neither needs to wait on the other directly.

**The problem before:** If a web request handler sends an email SYNCHRONOUSLY (LAB-47's blocking sense), the user's request hangs for however long the email takes to send — seconds, potentially, for something the USER doesn't actually need to wait for.

**The solution:** The request handler just ENQUEUES a job ("send this email") and returns IMMEDIATELY — LAB-47's non-blocking pattern, but for WORK, not just I/O. A SEPARATE worker process picks up the job whenever it can and actually sends the email, on its own schedule.

**Project Application (The "Why" here):** This is LAB-22's event bus (a producer "emits," consumers "listen"), but with a DURABLE, ORDERED queue (LAB-05) in between instead of direct, immediate notification — a job can wait in the queue even if no worker happens to be free RIGHT NOW.

---

## Step 1 — Producer/Consumer With a Simple Queue

```python
# job_queue.py
import queue
import threading
import time

job_queue = queue.Queue()             # ← add: Python's built-in thread-safe queue — LAB-05's structure, ready-made
next_job_id = 1

def enqueue(job_type, payload):
    global next_job_id
    job = {"id": next_job_id, "type": job_type, "payload": payload}
    job_queue.put(job)
    print(f"producer: enqueued job {job['id']} ({job_type} to {payload})")
    next_job_id += 1
    return job['id']

def worker():
    while True:
        job = job_queue.get()                          # ← add: BLOCKS until a job is available — no busy-waiting
        print(f"worker: processing job {job['id']}...", end=' ')
        time.sleep(0.5)                                   # simulate the actual work (sending an email, etc.)
        print("done (took 0.5s)")
        job_queue.task_done()

if __name__ == '__main__':
    print("=== Producer/Consumer: Decoupled ===")
    worker_thread = threading.Thread(target=worker, daemon=True)
    worker_thread.start()

    enqueue("send_email", "alice@example.com")
    enqueue("send_email", "bob@example.com")
    print("producer: returned immediately — did NOT wait for emails to send")
    print()

    job_queue.join()          # wait here (in the DEMO script) until all jobs are actually processed, so output is deterministic
```

### SAVE AND TRY

```bash
python job_queue.py
```

**Expected:**
```
=== Producer/Consumer: Decoupled ===
producer: enqueued job 1 (send_email to alice@example.com)
producer: enqueued job 2 (send_email to bob@example.com)
producer: returned immediately — did NOT wait for emails to send

worker: processing job 1... done (took 0.5s)
worker: processing job 2... done (took 0.5s)
```

**Confirm the decoupling, precisely:** "producer: returned immediately" prints BEFORE either job finishes processing — `enqueue()` never waits for the ACTUAL work to happen, only for the job to be PLACED in the queue. This is exactly LAB-47's non-blocking pattern: `job_queue.put(job)` is a fast, synchronous operation (adding to a queue), completely decoupled from the SLOW operation (`time.sleep(0.5)`, standing in for "send an email") that happens later, on the WORKER's own schedule.

---

## Step 2 — A Worker Pool: Multiple Workers, One Queue

```python
def worker(name):
    while True:
        job = job_queue.get()
        print(f"{name}: processing job {job['id']}...", end=' ')
        time.sleep(0.3)
        print("done")
        job_queue.task_done()
```

Add to `job_queue.py`'s `__main__` block:

```python
    print("\n=== Worker Pool: Multiple Workers, One Queue ===")
    for name in ['worker-1', 'worker-2']:                       # ← add: TWO workers, pulling from the SAME queue
        threading.Thread(target=worker, args=(name,), daemon=True).start()

    for _ in range(6):
        enqueue("send_email", "someone@example.com")
    print("enqueued 6 jobs")

    job_queue.join()
    print("all 6 jobs processed by 2 workers")
```

### SAVE AND TRY

```bash
python job_queue.py
```

**Expected (worker interleaving may vary, but ALL 6 jobs are processed by BOTH workers):**
```
=== Worker Pool: Multiple Workers, One Queue ===
enqueued 6 jobs
worker-1: processing job 3... done
worker-2: processing job 4... done
worker-1: processing job 5... done
worker-2: processing job 6... done
worker-1: processing job 7... done
worker-2: processing job 8... done
all 6 jobs processed by 2 workers
```

**Confirm `queue.Queue` is doing real coordination work, safely:** Two threads calling `job_queue.get()` CONCURRENTLY never both receive the SAME job — Python's `queue.Queue` is internally thread-safe (it handles the coordination LAB-6.1's race-condition lesson would otherwise require manual locks for), guaranteeing each job goes to EXACTLY one worker, no duplicates, no dropped jobs. This is I/O-bound work (waiting/simulated work), so LAB-48's lesson applies directly: THREADING is the right tool here, not multiprocessing.

---

### Concept: Retry Logic — Not Every Failure Is Permanent

**What it is:** Some job failures are TRANSIENT (a network blip, a service that was briefly overloaded) — retrying shortly after often SUCCEEDS. Others are PERMANENT (malformed data, a job that will NEVER succeed no matter how many times you try) — retrying is pointless and wastes resources.

**The solution:** Retry a LIMITED number of times, then give up and route the job somewhere for manual/separate handling — a **dead-letter queue**.

---

## Step 3 — Retry Logic

```python
import random

def process_with_retry(job, max_attempts=3, always_fail=False):
    for attempt in range(1, max_attempts + 1):
        try:
            if always_fail or (not always_fail and attempt < 3 and random.random() < 0.7):
                raise Exception("simulated transient error")
            print(f"job {job['id']}: attempt {attempt} succeeded")
            return True
        except Exception:
            print(f"job {job['id']}: attempt {attempt} failed (simulated transient error)")
    return False
```

Add to `__main__`:

```python
    print("\n=== Retry Logic ===")
    random.seed(1)   # deterministic output for this lab
    retry_job = {"id": 9}
    success = process_with_retry(retry_job)
    if success:
        print(f"job {retry_job['id']}: completed after retries")
```

### SAVE AND TRY

```bash
python job_queue.py
```

**Expected (shape — exact attempt count may vary with the random seed):**
```
=== Retry Logic ===
job 9: attempt 1 failed (simulated transient error)
job 9: attempt 2 failed (simulated transient error)
job 9: attempt 3 succeeded
job 9: completed after 3 attempts
```

**Confirm the retry loop's shape:** This is LAB-09's boundary-error handling, extended with a LOOP and a COUNTER — instead of failing immediately on the first error, the job gets `max_attempts` chances, with the loop only giving up entirely once EVERY attempt has failed. Real systems typically add "exponential backoff" (waiting progressively LONGER between retries — 1s, then 2s, then 4s) to avoid hammering an already-struggling service, an extension of this exact loop.

---

## 🎯 Challenge: Dead-Letter Queue for Permanent Failures

**You know:** A job that fails `max_attempts` times in a row, with no success, should stop being retried and go SOMEWHERE for separate handling — not vanish silently, and not retry forever.

**Task:** Modify `process_with_retry` to move a permanently-failing job into a `dead_letter_queue` list after exhausting all attempts.

<details>
<summary>▶ Show Solution</summary>

```python
dead_letter_queue = []

def process_with_retry_dlq(job, max_attempts=3, always_fail=False):
    for attempt in range(1, max_attempts + 1):
        try:
            if always_fail:
                raise Exception("permanent error")
            print(f"job {job['id']}: attempt {attempt} succeeded")
            return True
        except Exception:
            print(f"job {job['id']}: attempt {attempt} failed (permanent error)")

    dead_letter_queue.append(job['id'])                                          # ← add: exhausted retries — route it aside
    print(f"job {job['id']}: moved to dead-letter queue after {max_attempts} failed attempts")
    return False
```

**Key insight:** A dead-letter queue is the SAME "boundary validation, fail loudly and clearly" instinct from LAB-09 and LAB-25, applied to background jobs instead of user input — a permanently-broken job doesn't just vanish (which would hide a real problem) and doesn't retry FOREVER (which would waste resources pointlessly) — it's set ASIDE, visibly, where a human (or a separate, slower automated process) can investigate later. Real message queue systems (SQS, RabbitMQ) have this exact concept built in natively.

</details>

Add to `__main__`:

```python
    print("\n=== Dead-Letter Queue ===")
    dead_job = {"id": 10}
    process_with_retry_dlq(dead_job, always_fail=True)
    print(f"dead-letter queue: {dead_letter_queue}")
```

### SAVE AND TRY

```bash
python job_queue.py
```

**Expected:**
```
=== Dead-Letter Queue ===
job 10: attempt 1 failed (permanent error)
job 10: attempt 2 failed (permanent error)
job 10: attempt 3 failed (permanent error)
job 10: moved to dead-letter queue after 3 failed attempts
dead-letter queue: [10]
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `queue.Queue` | Redis lists/streams, RabbitMQ, AWS SQS — the DURABLE, production version of this in-memory queue |
| Worker pool | Celery workers, Sidekiq, Bull (Node.js) — all built on this exact producer/consumer/worker-pool shape |
| Retry with attempt limits | Every real job queue system's built-in retry configuration |
| Dead-letter queue | AWS SQS's actual "Dead-Letter Queue" feature — same name, same concept |

**Where you will see this again:** LAB-55 (Background Worker System) builds the FULL production-shaped version of this exact lab — persistent storage (surviving a restart, unlike this lab's in-memory queue), proper retry backoff, and a real dead-letter handling flow.

---

## Final Check

| Feature | How to verify |
|---|---|
| The producer returns immediately without waiting for job completion | Step 1 |
| A worker correctly pulls and processes jobs from the shared queue | Step 1 |
| Multiple workers correctly split work from ONE queue with no duplicates | Step 2 |
| A job that eventually succeeds after transient failures completes correctly | Step 3 |
| A permanently-failing job is routed to the dead-letter queue after exhausting retries | Challenge |
| You can explain, without notes, why "just send the email directly" is often the wrong choice | Concept box |

---

## Quick Check Answers

**1. Why is "just send it directly in the request handler" often wrong?**

Because it makes the USER wait for something they don't need to wait for — the HTTP response is held up until the slow operation (sending an email, here taking 0.5s+ in this lab's simulation) completes, directly hurting perceived performance for no real benefit to the user, who almost never needs the email to have ALREADY been sent by the time their page loads. Enqueueing the job and returning immediately (Step 1) decouples "the user gets a fast response" from "the slow work eventually happens," which is exactly what a job queue is for.

**2. Producer faster than consumers — what happens without a queue? With one?**

WITHOUT a queue: jobs would need to be handled SYNCHRONOUSLY as they're created, meaning the producer itself gets BLOCKED waiting for a worker to be free — exactly the blocking problem this lab exists to avoid. WITH a queue (Step 1–2): jobs simply ACCUMULATE in the queue faster than they're consumed — the producer never blocks, and the BACKLOG (queue length) grows, which is itself useful, visible information (a real system would monitor queue length and add more workers, or investigate why consumption is lagging, if it grows too large).

**3. A job fails due to a temporary problem — retry automatically or give up?**

Retry automatically, up to a REASONABLE limit (Step 3's `max_attempts`) — a transient failure (a brief network blip, a momentarily overloaded downstream service) often SUCCEEDS on a subsequent attempt with no code changes needed at all. The Challenge's dead-letter queue exists for the OTHER case — a failure that keeps happening even after multiple retries is more likely PERMANENT (bad data, a genuine bug), and continuing to retry it indefinitely would waste resources without ever succeeding — which is exactly why the retry loop has a LIMIT, not infinite attempts.

---

*Module 2 (Async Systems) complete. Next: [LAB-50 — Auth Service](../module-03-mini-projects/LAB-50-auth-service.md) — Python (FastAPI), Module 3 begins*
