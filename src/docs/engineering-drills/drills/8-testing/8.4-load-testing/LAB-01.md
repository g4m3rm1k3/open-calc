# Drill 8.4 — Load Testing: Finding Where Your System Breaks

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install locust flask`
**What you will build:** A Flask API with three endpoints (fast, slow, and one that degrades under load), a Locust load test that ramps up users, and a demonstration of how to find the breaking point.
**What you will understand:** What load testing measures, what throughput/latency/error rate mean, how to identify bottlenecks, and why production load is different from single-request performance.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. A single request to your API takes 50ms. You expect 100 concurrent users. Will your API handle 2000 requests per second? Why or why not?

2. What is the difference between a "load test" and a "stress test"? What question does each answer?

3. Your API's average response time is 80ms at 100 users, 200ms at 500 users, 2000ms at 1000 users, then errors start appearing. What is this pattern called, and what does it tell you?

4. "P99 latency" is 2 seconds. "Average latency" is 200ms. Which number matters more to users and why?

*(Answers at the bottom.)*

---

## The Concept: Load Testing

### Concept: System Behavior Under Concurrent Load

**What it is:**
Load testing is the practice of simulating realistic user traffic against a system to measure performance characteristics: throughput (requests per second), latency (response time at various percentiles), error rates, and resource utilization. The goal is to find where the system degrades before users do.

**Why single-request performance doesn't predict load performance:**
A single request might take 10ms because: the function is fast, there's no contention, the database has no other queries competing, and there are no queue waits. Under load with 1000 concurrent users: the database connection pool is exhausted (waits start), CPU is saturated (requests queue), garbage collection pauses affect all requests simultaneously, and caches begin thrashing. The 10ms request becomes 500ms at load — a 50x degradation that only appears under simultaneous access.

**The key metrics:**

- **Throughput (RPS)**: Requests per second successfully processed. Measures capacity.
- **Latency percentiles**: P50 (median), P95, P99 response times. P99 = 99% of requests complete in this time. The P99 matters most — it's what 1 in 100 users experiences.
- **Error rate**: % of requests that fail (5xx, timeouts). Even 1% errors at 1000 RPS = 10 failures per second.
- **Concurrency**: Number of simultaneous users/requests active. High concurrency surfaces resource contention.

**The performance curve:**
```
Latency
^
|                                     /
|                                    / ← queue saturation
|                               ____/
|                          ____/       ← degradation begins
|_________________________/            ← linear region
+--------------------------------> Users
                          ^ breaking point
```

Up to the breaking point: latency increases linearly with users (healthy scaling). At the breaking point: a resource is saturated (thread pool, DB connections, CPU, memory). Past the breaking point: latency increases non-linearly, error rates climb, the system becomes unusable.

**Types of load tests:**

- **Load test**: simulate expected normal + peak traffic. Verifies the system handles it.
- **Stress test**: ramp up until failure. Finds the breaking point and failure mode.
- **Soak test**: sustained load for hours/days. Finds memory leaks, log accumulation, connection pool exhaustion over time.
- **Spike test**: sudden traffic burst. Simulates a product launch or news event.

**Locust:**
Locust defines user behavior in Python code. A `User` class with `@task` methods defines what each simulated user does. Locust manages concurrency, ramp-up, and statistics collection. It provides a web UI at `http://localhost:8089` during tests.

**Constraints:**
- Load tests must run against a realistic environment: local testing on a dev machine doesn't represent production server resources or network conditions
- Database state matters: an empty database performs differently than a production database with millions of rows
- Distributed load testing: one load generator machine may not generate enough load — Locust supports distributed mode with multiple worker nodes
- Don't load test production unless you have to — use a staging environment

**Tradeoffs:**
- Realistic traffic vs simplicity: real users perform complex sequences (login, browse, checkout). Simulating this is more valuable but harder to write than a simple repeated GET.
- Test duration: short tests (5 min) find throughput limits; long soak tests (8 hours) find resource leaks. Both are needed.

**Failure modes:**
- Load testing from the same machine as the service: your load generator competes for CPU/memory with the service under test — results are unreliable
- Not waiting for steady state: initial requests after startup may be slower (cold JVM, cold cache). Warm up first.
- Ignoring error rates: celebrating throughput numbers while errors are spiking
- No baseline: running a load test without a baseline means you don't know if performance improved or degraded

**Operational reality:**
Locust is used by Spotify and other companies for API load testing. Alternative tools: k6 (JavaScript), Apache JMeter, Gatling (Scala). Load test results feed into SLA definitions, autoscaling policies, and capacity planning. A common practice: run a load test on every major release; alert if P99 degrades by more than 20%.

**You will see this again in:**
Pre-launch capacity planning, Black Friday preparation, SLA setting for API endpoints, autoscaling threshold configuration, database connection pool sizing.

**Watch for:**
The difference between measuring the response time from the load generator vs from inside the service. Network latency adds to observed times. Latency measured inside the service (internal profiling) shows pure processing time; Locust measures end-to-end including network. Both matter.

---

## Step 1 — Build the API Under Test

Create `api_server.py`:

```python
# api_server.py — an API with different performance characteristics per endpoint
import time
import random
import threading
from flask import Flask, jsonify, request

app = Flask(__name__)

# Simulated "database" — a shared dict with a lock (intentional bottleneck)
_db_lock = threading.Lock()
_db_data = {i: {"id": i, "name": f"user_{i}", "score": random.randint(0, 100)}
            for i in range(1, 1001)}

# Track active requests for the "degradation" endpoint
_active_slow_requests = 0
_slow_lock = threading.Lock()


@app.route("/api/fast")
def fast_endpoint():
    """Fast endpoint: pure computation, no I/O. Should scale linearly."""
    n = int(request.args.get("n", 100))
    total = sum(i * i for i in range(n))
    return jsonify({"result": total, "n": n})


@app.route("/api/db-read")
def db_read():
    """Simulated database read with lock contention."""
    user_id = random.randint(1, 1000)
    with _db_lock:
        time.sleep(0.002)  # simulate 2ms DB query
        user = _db_data.get(user_id, {"error": "not found"})
    return jsonify(user)


@app.route("/api/slow")
def slow_endpoint():
    """
    Endpoint that degrades under load: each additional concurrent request adds delay.
    Models a shared resource (DB connection pool, external API) that queues.
    """
    global _active_slow_requests
    
    with _slow_lock:
        _active_slow_requests += 1
        current_active = _active_slow_requests
    
    try:
        # Delay increases with concurrency — models queue waiting
        base_delay = 0.05  # 50ms base
        contention_delay = current_active * 0.01  # +10ms per concurrent request
        total_delay = min(base_delay + contention_delay, 5.0)  # cap at 5s
        time.sleep(total_delay)
        
        return jsonify({
            "delay_ms": int(total_delay * 1000),
            "concurrent_at_time": current_active,
        })
    finally:
        with _slow_lock:
            _active_slow_requests -= 1


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "active_slow": _active_slow_requests})


@app.route("/api/stats")
def stats():
    return jsonify({
        "db_size": len(_db_data),
        "active_slow_requests": _active_slow_requests,
    })


if __name__ == "__main__":
    from waitress import serve
    print("Starting API server on http://localhost:5000")
    print("Endpoints:")
    print("  GET /api/fast?n=100    — fast pure computation")
    print("  GET /api/db-read       — simulated DB read with lock")
    print("  GET /api/slow          — degrades under concurrent load")
    print("  GET /api/health        — health check")
    # Use waitress for production-like WSGI serving (not Flask's dev server)
    serve(app, host="0.0.0.0", port=5000, threads=20)
```

Install waitress: `pip install waitress`

### SAVE AND TRY (baseline — single requests)

```
python api_server.py
```

In another terminal, measure single-request performance:
```bash
# Time a single request to each endpoint
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/fast
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/db-read
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/slow
```

Record these baseline numbers. They will look much better than what you'll see under load.

---

## Step 2 — Basic Load Test with Locust

Create `locustfile.py`:

```python
# locustfile.py — Locust load test
from locust import HttpUser, task, between, events
import json


class APIUser(HttpUser):
    """
    Simulates a user making API calls.
    wait_time: pause between requests (simulates real user think time).
    """
    wait_time = between(0.1, 0.5)  # 100-500ms between requests
    
    @task(3)
    def test_fast(self):
        """Test the fast endpoint — 3x weight (called 3x more often than others)."""
        response = self.client.get("/api/fast?n=100", name="/api/fast")
        if response.status_code != 200:
            response.failure(f"Unexpected status {response.status_code}")
    
    @task(2)
    def test_db_read(self):
        """Test the DB read endpoint — 2x weight."""
        with self.client.get("/api/db-read", name="/api/db-read", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if "id" not in data and "error" not in data:
                    response.failure("Response missing expected fields")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(1)
    def test_slow(self):
        """Test the slow endpoint — 1x weight. Will degrade under load."""
        with self.client.get("/api/slow", name="/api/slow", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                delay = data.get("delay_ms", 0)
                if delay > 3000:  # fail if taking more than 3 seconds
                    response.failure(f"Too slow: {delay}ms")
            else:
                response.failure(f"Status {response.status_code}")


class HealthCheckUser(HttpUser):
    """A separate user type that only checks health — for monitoring."""
    weight = 1  # one health check user for every 10 API users
    wait_time = between(5, 10)
    
    @task
    def check_health(self):
        self.client.get("/api/health", name="/api/health")
```

### SAVE AND TRY

Terminal 1 (API server):
```
python api_server.py
```

Terminal 2 (Locust):
```
locust -f locustfile.py --host http://localhost:5000
```

Open `http://localhost:8089` in a browser.

Start a load test:
- Number of users: 10
- Spawn rate: 2 (users per second)

Let it run for 2 minutes. Observe:
- RPS (requests per second) for each endpoint
- Average response time
- P95, P99 response times
- Error rate (should be 0% at 10 users)

Then increase to 50 users, then 100 users. Observe how `/api/slow` degrades — response time increases as more users hit it simultaneously.

Expected behavior:
- `/api/fast`: stays fast (< 20ms) even at 100 users
- `/api/db-read`: slight increase (lock contention)
- `/api/slow`: dramatic increase — at 50 concurrent requests, delay = 50ms + 50×10ms = 550ms

---

## Step 3 — Find the Breaking Point with a Stress Test

Create `stress_test.py` — a programmatic stress test without the Locust UI:

```python
# stress_test.py — headless stress test, prints results to terminal
import subprocess
import time
import json

def run_locust_stress(host: str, max_users: int, spawn_rate: int, duration: int):
    """
    Run a headless Locust stress test and return stats.
    Ramps up to max_users over time, runs for duration seconds.
    """
    cmd = [
        "locust",
        "-f", "locustfile.py",
        "--host", host,
        "--headless",
        f"--users={max_users}",
        f"--spawn-rate={spawn_rate}",
        f"--run-time={duration}s",
        "--csv=stress_results",
        "--only-summary",
    ]
    
    print(f"Running stress test: {max_users} users, {spawn_rate}/s ramp, {duration}s duration")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=duration + 60)
    return result.stdout, result.stderr


# Manual stress ramp — test at increasing user counts and observe
def manual_ramp_test():
    """
    Test the /api/slow endpoint at increasing concurrency levels.
    Shows the breaking point clearly.
    """
    import threading
    import requests
    import statistics
    
    HOST = "http://localhost:5000"
    
    print("=== Manual Ramp Test — /api/slow endpoint ===")
    print(f"{'Users':<10} {'Mean(ms)':<12} {'P95(ms)':<12} {'P99(ms)':<12} {'Errors':<8}")
    print("-" * 55)
    
    for user_count in [1, 5, 10, 25, 50, 100]:
        times = []
        errors = 0
        barrier = threading.Barrier(user_count)
        
        def make_request():
            nonlocal errors
            barrier.wait()  # all threads start simultaneously
            try:
                start = time.perf_counter()
                resp = requests.get(f"{HOST}/api/slow", timeout=10)
                elapsed_ms = (time.perf_counter() - start) * 1000
                if resp.status_code == 200:
                    times.append(elapsed_ms)
                else:
                    errors += 1
            except Exception:
                errors += 1
        
        threads = [threading.Thread(target=make_request) for _ in range(user_count)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        
        if times:
            mean = statistics.mean(times)
            p95 = sorted(times)[int(len(times) * 0.95)]
            p99 = sorted(times)[int(len(times) * 0.99)] if len(times) >= 100 else max(times)
            print(f"{user_count:<10} {mean:<12.0f} {p95:<12.0f} {p99:<12.0f} {errors:<8}")
        else:
            print(f"{user_count:<10} {'N/A':<12} {'N/A':<12} {'N/A':<12} {errors:<8}")
    
    print("\nObservation: response time increases as concurrency increases.")
    print("Find where P99 exceeds your SLA (e.g., 500ms) — that's your breaking point.")


if __name__ == "__main__":
    manual_ramp_test()
```

### SAVE AND TRY

With the API server running:
```
python stress_test.py
```

Expected output (showing degradation):
```
=== Manual Ramp Test — /api/slow endpoint ===
Users      Mean(ms)     P95(ms)      P99(ms)      Errors  
-------------------------------------------------------
1          52           53           53           0       
5          102          153          153          0       
10         153          203          203          0       
25         303          403          403          0       
50         553          703          703          0       
100        1053         1203         1203         0       

Observation: response time increases as concurrency increases.
Find where P99 exceeds your SLA (e.g., 500ms) — that's your breaking point.
```

Each additional concurrent user adds ~10ms (the `current_active * 0.01` contention delay in the server). This is the performance curve: linear degradation until you hit the resource limit.

**Change something:** Modify the API server to limit `/api/slow` to 20 concurrent requests using a semaphore:
```python
_slow_semaphore = threading.Semaphore(20)

@app.route("/api/slow")
def slow_endpoint():
    acquired = _slow_semaphore.acquire(timeout=2.0)
    if not acquired:
        return jsonify({"error": "server busy"}), 503
    try:
        time.sleep(0.05)
        return jsonify({"delay_ms": 50})
    finally:
        _slow_semaphore.release()
```

Re-run the stress test. Now requests above 20 concurrent get 503 errors instead of infinite delay. This is a design choice: fail fast vs queue forever. The load test makes both options visible.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a load test suite for a CRUD API with realistic user behavior patterns.

**Requirements checklist:**

- [ ] `crud_api.py` — a Flask API with `POST /items`, `GET /items`, `GET /items/{id}`, `PUT /items/{id}`, `DELETE /items/{id}`. Use an in-memory list. Supports 100 items initially seeded.
- [ ] `crud_locustfile.py` — three `HttpUser` types with different behavior patterns:
  - `BrowserUser` (weight 5): browses only — GET /items 80% of the time, GET /items/{id} 20%
  - `PowerUser` (weight 3): reads and writes — GET 50%, POST 20%, PUT 20%, DELETE 10%
  - `ApiUser` (weight 2): batch operations — POST 5 items in sequence, then GET all
- [ ] SLA validation: custom Locust event listener that fails the test if P95 > 200ms or error rate > 1% at the target load
- [ ] Baseline report: run at 1 user, capture P50/P95/P99 for each endpoint
- [ ] Load report: run at 100 users for 5 minutes, capture the same metrics
- [ ] A Markdown summary `LOAD_TEST_REPORT.md`: baseline vs load metrics, identified bottlenecks, recommendation (e.g., "add caching for GET /items", "use database instead of in-memory list")
- [ ] The test should identify: at what user count does `GET /items` latency exceed 100ms? (Hint: it degrades because the list grows as users POST items)

**Starter:**
```python
# crud_locustfile.py
from locust import HttpUser, task, between, events

class BrowserUser(HttpUser):
    weight = 5
    wait_time = between(1, 3)
    
    @task(8)
    def browse_all(self):
        self.client.get("/items")
    
    @task(2)
    def view_item(self):
        # TODO: GET a random item by ID
        pass

# TODO: PowerUser, ApiUser

# SLA validation
@events.quitting.add_listener
def check_sla(environment, **kwargs):
    stats = environment.runner.stats.total
    # TODO: check P95 and error rate, set exit code if violated
    pass
```

**When you're done:**
```
locust -f crud_locustfile.py --host http://localhost:5001 --headless \
       --users 100 --spawn-rate 10 --run-time 5m
```
Output ends with either:
```
SLA PASSED: P95=145ms, Error rate=0.2%
```
or:
```
SLA VIOLATED: P95=340ms (limit: 200ms)
```
Plus `LOAD_TEST_REPORT.md` with before/after metrics and recommendations.

**Stuck?** Ask AI: "In Locust Python, how do I add an event listener that runs when the test finishes and fails the test if the P95 latency exceeds 200ms or the error rate exceeds 1%? Show me how to access the stats object to get percentile latencies and error rates."

---

## Quick Check Answers

**1. Will 50ms requests support 2000 RPS at 100 users?**
No. 100 users × 1 request/50ms = 2000 requests per second is the math, but this ignores: (a) concurrency limits — your server must handle 100 simultaneous connections; (b) resource contention — at 100 concurrent requests, the database, CPU, and memory are all under load, increasing each request's time beyond 50ms; (c) overhead — thread/process switching, network stack, middleware all add latency under load. In practice, 100 concurrent users at 50ms/request might yield 500-1000 RPS in a well-tuned system, less in a naive one.

**2. Load test vs stress test:**
Load test answers: "Can my system handle expected traffic?" It simulates normal + peak traffic and verifies performance meets SLA. Stress test answers: "Where does my system break?" It deliberately exceeds expected load until failure to find the breaking point, the failure mode (crash? errors? deadlock?), and the recovery behavior. Both are needed: load tests for ongoing validation, stress tests for capacity planning.

**3. Non-linear latency degradation pattern:**
This is called the "knee of the curve" or "saturation point." Up to ~500 users: latency increases linearly (healthy), each user adds proportional load. At 1000 users: latency jumps non-linearly (saturation), a resource is exhausted (thread pool, DB connections, CPU). Beyond 1000 users: errors appear (requests can't be served at all). The saturation point is your system's capacity. Scaling horizontally (more servers) or fixing the bottleneck (bigger DB connection pool) moves the knee to the right.

**4. P99 vs average latency:**
P99 matters more to users. Average is 200ms means that 50% of users get faster responses and 50% get slower. P99 = 2 seconds means 1% of users — potentially thousands per day on a popular service — wait 2 seconds. Users who experience the P99 latency are disproportionately likely to abandon, churn, or complain. Many SLAs are defined in terms of P99: "99% of requests must complete in < 500ms." The average can look healthy while a significant minority of users have a terrible experience.
