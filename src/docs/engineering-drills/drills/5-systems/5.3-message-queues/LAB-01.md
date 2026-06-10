# Drill 5.3 — Message Queues: Decoupling Work from the Request

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install redis rq` — requires Redis running locally (`docker run -d -p 6379:6379 redis`)
**What you will build:** A job queue system: a web endpoint that enqueues slow work (simulated email sending, image processing), a worker process that consumes jobs, and a monitoring view showing job status.
**What you will understand:** Why queues exist, how Redis acts as a broker, what happens when workers crash mid-job, and why "fire and forget" is different from "fire and wait."

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. A user submits a form that triggers an email send. The email service takes 3 seconds. Your web handler waits for it. What happens to user experience? What happens if 50 users submit at the same time?

2. A queue has three jobs: A, B, C. Worker 1 starts A. Worker 1 crashes. What should happen? Should B and C block waiting for A?

3. What is the difference between a message queue and a database? Why not just use a database table with `status = 'pending'`?

4. Your worker processes a payment job and crashes halfway through. The queue marks the job as failed and retries it. What problem could this cause, and what property prevents it?

*(Answers at the bottom.)*

---

## The Concept: Message Queues

### Concept: Why Queues Exist

**What it is:**
A message queue is a buffer between a producer (the part of your system that creates work) and a consumer (the part that does the work). The producer puts a job description on the queue and returns immediately. The consumer picks jobs off the queue and executes them independently.

**The problem before:**
Without a queue, work happens inline:
```python
@app.route("/register", methods=["POST"])
def register():
    user = create_user(request.json)
    send_welcome_email(user)   # blocks for 2 seconds
    resize_profile_photo(user) # blocks for 1 second
    return {"id": user.id}     # user waits 3 seconds
```
Three problems:
1. The HTTP request is held open while slow work runs — the user stares at a spinner
2. If the email service is down, the registration fails, even though the user WAS created
3. Under load, 100 simultaneous registrations = 100 threads blocked on email

**The mechanism:**
```
Producer (web process):        Queue (Redis):        Consumer (worker process):
  create_user()            →   [job1, job2, job3]  →   send_welcome_email()
  enqueue(send_email)                                    resize_photo()
  return {"id": user.id}   ← responds immediately        (runs independently)
```

The web process and the worker process are separate. The web process does not wait for work to finish — it hands the job description to the queue and moves on.

**Redis as a broker:**
Redis is an in-memory data store that supports lists with atomic push/pop operations. A queue is just a Redis list. `LPUSH queue job_data` adds a job to the left. `BRPOP queue 0` blocks until a job appears and pops it from the right (FIFO). This is the entire mechanism — RQ (Redis Queue) adds job serialization, retry logic, failure tracking, and worker management on top.

**Job lifecycle:**
```
enqueue() → status: queued
worker picks up → status: started
worker finishes → status: finished
worker crashes/raises → status: failed → moves to FailedJobRegistry
```

**Constraints:**
- Jobs must be serializable — the job function and its arguments are pickled and stored in Redis
- Functions must be importable by the worker process — you cannot enqueue lambdas or locally-defined functions
- Redis is in-memory — jobs can be lost if Redis crashes without persistence enabled (`appendonly yes` in redis.conf)
- Queue depth is bounded by Redis memory — large payloads should be stored elsewhere, with only an ID in the queue

**Tradeoffs:**
- Queue vs synchronous: queues add operational complexity (a broker, worker processes, monitoring). Use synchronous for anything under ~500ms that must be acknowledged before the response.
- RQ vs Celery: RQ is simpler (Redis only, straightforward API). Celery supports more brokers (RabbitMQ, SQS), has more routing options, and is harder to configure. For most applications, RQ is sufficient.
- At-least-once vs at-most-once: Most queues guarantee at-least-once delivery — a job may be retried if the worker crashes. This means jobs should be idempotent where possible.

**Failure modes:**
- Worker crashes mid-job: RQ marks the job failed, moves it to the failed registry. A watchdog process can re-enqueue failed jobs. Without this, failed jobs accumulate silently.
- Queue grows unbounded: producers enqueue faster than workers consume. Add more workers, or rate-limit producers.
- Job timeout not set: a stuck job holds a worker forever. Always set `job_timeout`.
- Forgetting that the worker runs in a separate process: jobs can't share in-memory state (like a Python dict) with the web process. Shared state must go in Redis, the database, or a cache.

**Operational reality:**
Redis + RQ is the standard stack for Python background jobs. Celery is more powerful but famously complex to configure. For small-to-medium projects: Redis + RQ. For complex routing, multiple brokers, or very high throughput: Celery + RabbitMQ. Cloud providers offer managed queues (AWS SQS, GCP Pub/Sub) that remove broker management.

**You will see this again in:**
User registration flows (send email async), payment processing, report generation, image/video transcoding, notification dispatch, any endpoint that would otherwise timeout under load.

**Watch for:**
Jobs must be defined at module level in an importable file — not inside a `main()` block, not as lambdas, not as nested functions. The worker process imports your module to find the function. If the function can't be imported, the job fails with `ImportError` before it even starts.

---

## Step 1 — Enqueue and Execute a Simple Job

Verify Redis is running first:
```bash
docker run -d -p 6379:6379 --name redis-drill redis
```

Create `jobs.py` — all job functions live here so workers can import them:

```python
# jobs.py — job functions must be importable at module level
import time

def send_welcome_email(user_id: int, email: str) -> dict:
    """Simulate sending a welcome email. Takes 2 seconds."""
    print(f"  [worker] Sending welcome email to {email}...")
    time.sleep(2)  # simulate network call to email service
    print(f"  [worker] Email sent to {email}")
    return {"sent_to": email, "user_id": user_id}

def resize_profile_photo(user_id: int, filename: str) -> dict:
    """Simulate image processing. Takes 1 second."""
    print(f"  [worker] Resizing photo {filename} for user {user_id}...")
    time.sleep(1)
    print(f"  [worker] Resize complete: {filename}")
    return {"resized": filename, "sizes": ["64x64", "128x128", "512x512"]}

def generate_report(report_type: str, params: dict) -> dict:
    """Simulate a slow report query. Takes 3 seconds."""
    print(f"  [worker] Generating {report_type} report...")
    time.sleep(3)
    return {"report_type": report_type, "rows": 1000, "params": params}
```

Create `enqueue_demo.py`:

```python
from redis import Redis
from rq import Queue
from jobs import send_welcome_email, resize_profile_photo, generate_report
import time

redis_conn = Redis()
q = Queue(connection=redis_conn)

print("=== Message Queue Demo ===\n")
print("Enqueuing jobs (producer side)...")

start = time.perf_counter()

# enqueue() returns a Job object immediately — does NOT wait for execution
job1 = q.enqueue(send_welcome_email, 42, "alice@example.com")
job2 = q.enqueue(resize_profile_photo, 42, "photo.jpg")
job3 = q.enqueue(generate_report, "monthly_sales", {"month": "2026-05"})

elapsed = time.perf_counter() - start

print(f"All 3 jobs enqueued in {elapsed*1000:.1f}ms (not executed yet)")
print(f"\nJob IDs:")
print(f"  send_email:   {job1.id}")
print(f"  resize_photo: {job2.id}")
print(f"  gen_report:   {job3.id}")

print(f"\nQueue depth: {len(q)} jobs waiting")
print(f"\nJob statuses (before worker runs):")
print(f"  email job:  {job1.get_status()}")
print(f"  photo job:  {job2.get_status()}")
print(f"  report job: {job3.get_status()}")

print("\nNow start a worker: python -m rq worker")
print("Watch the worker pick up and execute these jobs.")
```

### SAVE AND TRY

Terminal 1 (enqueue):
```
python enqueue_demo.py
```

Terminal 2 (start a worker):
```
python -m rq worker
```

Expected enqueue output:
```
=== Message Queue Demo ===

Enqueuing jobs (producer side)...
All 3 jobs enqueued in 2.3ms (not executed yet)

Job IDs:
  send_email:   <uuid>
  resize_photo: <uuid>
  gen_report:   <uuid>

Queue depth: 3 jobs waiting

Job statuses (before worker runs):
  email job:  queued
  photo job:  queued
  report job: queued

Now start a worker: python -m rq worker
Watch the worker pick up and execute these jobs.
```

Expected worker output (after starting it):
```
  [worker] Sending welcome email to alice@example.com...
  [worker] Email sent to alice@example.com
  [worker] Resizing photo photo.jpg for user 42...
  [worker] Resize complete: photo.jpg
  [worker] Generating monthly_sales report...
  [worker] Generating monthly_sales report... (done)
```

**Change something:** Run `python enqueue_demo.py` WITHOUT starting a worker. Check Redis with `docker exec -it redis-drill redis-cli LLEN rq:queue:default` — you'll see the job count. Jobs sit in the queue until a worker picks them up. Start the worker after 30 seconds. The jobs execute immediately.

---

## Step 2 — Check Job Status and Handle Failures

Add `check_jobs.py` to poll job status:

```python
from redis import Redis
from rq import Queue
from rq.job import Job
from jobs import send_welcome_email
import time
import sys

redis_conn = Redis()
q = Queue(connection=redis_conn)

# Enqueue a job and track it
job = q.enqueue(send_welcome_email, 99, "bob@example.com")
print(f"Job enqueued: {job.id}")
print(f"Status: {job.get_status()}")

# Poll until done (in real apps, use webhooks or polling endpoint instead)
while job.get_status() not in ("finished", "failed", "stopped"):
    print(f"  Status: {job.get_status()} — waiting...")
    time.sleep(0.5)
    job.refresh()  # reload from Redis

print(f"\nFinal status: {job.get_status()}")
if job.result:
    print(f"Result: {job.result}")
if job.exc_info:
    print(f"Error: {job.exc_info}")
```

Add a failing job to `jobs.py`:

```python
def always_fails(message: str) -> None:
    """This job always raises an exception."""
    raise ValueError(f"Intentional failure: {message}")
```

Add to `check_jobs.py`:

```python
from jobs import always_fails
from rq.registry import FailedJobRegistry

# Enqueue a job that will fail
fail_job = q.enqueue(always_fails, "testing failure handling")
print(f"\nFailing job enqueued: {fail_job.id}")

# Wait for it
while fail_job.get_status() not in ("finished", "failed"):
    time.sleep(0.3)
    fail_job.refresh()

print(f"Failing job status: {fail_job.get_status()}")

# Check the failed job registry
failed_registry = FailedJobRegistry(queue=q)
print(f"Failed jobs in registry: {failed_registry.count}")
for job_id in failed_registry.get_job_ids():
    j = Job.fetch(job_id, connection=redis_conn)
    print(f"  Failed: {j.func_name} — {j.exc_info.strip().splitlines()[-1]}")
```

### SAVE AND TRY

With the worker running in another terminal:
```
python check_jobs.py
```

Expected output:
```
Job enqueued: <uuid>
Status: queued
  Status: queued — waiting...
  Status: started — waiting...

Final status: finished
Result: {'sent_to': 'bob@example.com', 'user_id': 99}

Failing job enqueued: <uuid>
Failing job status: failed
Failed jobs in registry: 1
  Failed: jobs.always_fails — ValueError: Intentional failure: testing failure handling
```

**Change something:** Kill the worker (`Ctrl+C`) while a slow job is running (start a generate_report job then immediately kill). Restart the worker. Notice the job appears in the failed registry — the worker detected the incomplete job. This is RQ's crash recovery: jobs that were "started" when the worker died get moved to failed.

---

## Step 3 — Priority Queues and Job Configuration

Not all work is equal. An email to a paying customer is more urgent than a weekly analytics report. Create `priority_demo.py`:

```python
from redis import Redis
from rq import Queue
from jobs import send_welcome_email, generate_report
import time

redis_conn = Redis()

# Three separate queues with different priority names
high = Queue("high", connection=redis_conn)
default = Queue("default", connection=redis_conn)
low = Queue("low", connection=redis_conn)

print("Enqueuing jobs to priority queues...")

# Low priority: batch report
j1 = low.enqueue(generate_report, "weekly_batch", {"all": True})
print(f"  [low]     generate_report: {j1.id}")

# High priority: user-facing email
j2 = high.enqueue(send_welcome_email, 100, "vip@example.com")
print(f"  [high]    send_welcome_email: {j2.id}")

# Default priority: regular email
j3 = default.enqueue(send_welcome_email, 101, "regular@example.com")
print(f"  [default] send_welcome_email: {j3.id}")

print(f"\nQueue depths:")
print(f"  high:    {len(high)}")
print(f"  default: {len(default)}")
print(f"  low:     {len(low)}")

print("\nStart worker with priority order:")
print("  python -m rq worker high default low")
print("Worker processes HIGH queue first, then DEFAULT, then LOW.")
```

Also demonstrate job timeout — add to `jobs.py`:

```python
def very_slow_job() -> str:
    """Simulates a job that takes too long."""
    time.sleep(30)
    return "done (you won't see this if timeout hits first)"
```

Show timeout configuration in `priority_demo.py`:

```python
from jobs import very_slow_job

# Enqueue with a 5-second timeout — job fails if not done in 5s
timeout_job = default.enqueue(very_slow_job, job_timeout=5)
print(f"\nSlow job enqueued with 5s timeout: {timeout_job.id}")
print("If a worker picks this up, it will fail after 5 seconds.")
print("Without job_timeout, slow jobs can hold workers indefinitely.")
```

### SAVE AND TRY

```
python priority_demo.py
```

Then start a worker that respects priority order:
```
python -m rq worker high default low
```

Expected output from enqueue script:
```
Enqueuing jobs to priority queues...
  [low]     generate_report: <uuid>
  [high]    send_welcome_email: <uuid>
  [default] send_welcome_email: <uuid>

Queue depths:
  high:    1
  default: 2
  low:     1

Start worker with priority order:
  python -m rq worker high default low
Worker processes HIGH queue first, then DEFAULT, then LOW.

Slow job enqueued with 5s timeout: <uuid>
```

The worker will process the `high` queue job first (vip email), then `default` jobs, and only touch `low` when the others are empty. The very_slow_job appears in the failed registry after 5 seconds with `rq.timeouts.JobTimeoutException`.

**Change something:** Start the worker without priority ordering: `python -m rq worker` (uses `default` queue only). Watch that the `high` and `low` queue jobs never execute — they sit there. Only a worker that explicitly listens to a queue will process its jobs.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a job dashboard: a small Flask app that shows the current queue depth, running jobs, recent completions, and failed jobs — updating every 3 seconds via polling.

**Requirements checklist:**

- [ ] `GET /` returns an HTML page showing: queue depth (jobs waiting), running jobs (count + job IDs), finished jobs in the last 5 minutes (count), failed jobs (count + error messages)
- [ ] `GET /api/status` returns JSON with the same data — the HTML page fetches this endpoint every 3 seconds with `setInterval` and updates the page without reloading
- [ ] Data comes from: `Queue.count` (waiting), `StartedJobRegistry`, `FinishedJobRegistry`, `FailedJobRegistry` — all from the `rq` library
- [ ] `POST /enqueue` accepts JSON `{"type": "email", "to": "...", "user_id": ...}` and enqueues the appropriate job — returns `{"job_id": "...", "status": "queued"}`
- [ ] `POST /retry/<job_id>` re-enqueues a failed job — returns `{"job_id": "...", "status": "queued"}` or `{"error": "not found"}`
- [ ] Dashboard shows a table: job_id, function name, status, enqueued_at, duration (for finished jobs)
- [ ] Worker startup is NOT part of this challenge — the dashboard just observes; you start the worker separately

**Starter:**
```python
from flask import Flask, jsonify, request, render_template_string
from redis import Redis
from rq import Queue
from rq.registry import StartedJobRegistry, FinishedJobRegistry, FailedJobRegistry
from rq.job import Job

app = Flask(__name__)
redis_conn = Redis()
q = Queue(connection=redis_conn)

@app.route("/api/status")
def api_status():
    # TODO: gather queue stats from registries
    # TODO: return JSON
    pass

@app.route("/")
def dashboard():
    # TODO: return HTML that polls /api/status every 3 seconds
    pass

@app.route("/enqueue", methods=["POST"])
def enqueue_job():
    # TODO: validate request, enqueue job, return job_id
    pass

@app.route("/retry/<job_id>", methods=["POST"])
def retry_job(job_id):
    # TODO: fetch failed job, re-enqueue it
    pass

if __name__ == "__main__":
    app.run(debug=True, port=5001)
```

**When you're done:**
- `python dashboard.py` starts the Flask app
- `python -m rq worker` starts a worker in another terminal
- Visiting `http://localhost:5001` shows the live queue status
- POST to `/enqueue` with `{"type": "email", "to": "test@example.com", "user_id": 1}` creates a job
- The dashboard updates within 3 seconds to show the new job
- After the job completes, it moves from "running" to "finished" on the dashboard
- Re-enqueuing a failed job via `/retry/<id>` makes it appear in the queue again

**Stuck?** Ask AI: "How do I use rq's StartedJobRegistry, FinishedJobRegistry, and FailedJobRegistry in Python to get lists of jobs with their function names and timestamps? Show me how to fetch the Job objects from each registry."

---

## Quick Check Answers

**1. Waiting synchronously for email sends:**
The user waits 3 seconds before getting a response. At 50 simultaneous users, you need 50 concurrent request handlers all blocked waiting for the email service — most web frameworks would hit connection pool limits or thread exhaustion. If the email service goes down, every registration fails even though the user data was saved. The fix: enqueue and return immediately, process asynchronously.

**2. Worker crashes mid-job A — what happens to B and C?**
B and C should NOT block. In RQ (and most queues), jobs are independent. When worker 1 pops job A and crashes, A's status becomes `failed`. B and C remain `queued`. A different worker (or a restarted worker 1) picks up B and C normally. The failed job A sits in the FailedJobRegistry until manually inspected or re-enqueued. This is a core queue property: jobs are independent; one failure does not block others.

**3. Queue vs database table with `status = 'pending'`:**
You CAN use a database as a queue (it's called "outbox pattern" in some architectures). The problems: concurrent workers must use `SELECT FOR UPDATE SKIP LOCKED` to avoid picking the same job, polling the database is expensive at scale, there's no built-in blocking wait, and job serialization/deserialization is manual. Redis with BRPOP is purpose-built for this: it blocks efficiently, the pop is atomic (no two workers get the same job), and the data structure is optimized for queue operations.

**4. Idempotency and the retry problem:**
If a payment job charges a card and crashes before marking itself complete, retrying the job might charge the card twice. The property that prevents this is **idempotency**: a job can be executed multiple times with the same result. For payments: check if the charge already exists before creating it (use an idempotency key). For emails: check if the email was already sent. At-least-once delivery (the norm for most queues) requires that job logic is idempotent. At-most-once delivery (never retry) avoids duplicates but risks losing jobs entirely on crashes.
