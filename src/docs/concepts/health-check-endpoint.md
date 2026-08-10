# Concept: Health Check Endpoints

**What you'll understand by the end:** why a real backend service exposes a route whose only job is answering "are you alive," and what such a route should — and shouldn't — check.

**Prerequisites:** `http-routing-dispatch-table.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

Once a service is running unattended (behind a load balancer, managed by an orchestrator, monitored by an ops team), something external needs a fast, reliable, automatable way to answer "is this specific instance of the service currently working?" — without a human reading logs or manually poking at real business functionality, and without that check itself being slow or risky to run constantly.

## The Isolated Example

```python
from flask import Flask

app = Flask(__name__)

@app.route("/health")
def health():
    return {"status": "ok"}

with app.test_client() as client:
    print(client.get("/health").get_json())
    print(client.get("/health").status_code)
```

**Real output:**
```
{'status': 'ok'}
200
```

**What this proves:** a request to `/health` returns a fast, unambiguous, machine-checkable answer — a `200` status and a real, minimal JSON body — with no dependency on any of the application's actual business logic, meaning this exact check could run every few seconds, forever, with negligible cost.

## Mechanical Walkthrough

- A health check is an ordinary route (see `http-routing-dispatch-table.md`) with one deliberately narrow job: report whether the process is running and able to respond at all — not whether every feature works correctly.
- A **liveness** check (as shown) answers only "is the process alive and responsive" — it should almost never fail unless the process itself is genuinely broken or hung.
- A **readiness** check is a related, slightly different question — "is this instance ready to accept real traffic right now" — and commonly does check real, critical dependencies (can it reach its database, for instance) — a real, deliberate distinction: a process can be alive (liveness: yes) while not yet ready (readiness: no, still starting up, or its database is temporarily unreachable).
- The response is deliberately minimal and fast — a health check that itself performs slow or expensive work (a full data validation pass, a large query) defeats its own purpose, since it may be called very frequently by automated infrastructure.

## CS Lens

A health check is a small, real instance of **self-reporting system state** — a system exposing a narrow, deliberately-scoped signal about its own condition for something else (an orchestrator, a load balancer, a monitoring system) to act on automatically, without that external system needing any deeper knowledge of the service's actual internals. This is the same underlying need `http-status-codes.md`'s status codes serve at a smaller scale (a machine-readable outcome, not a message meant primarily for a human) — a health check is effectively a status code for an entire running process, not just one request.

Also recognized in: Kubernetes' own liveness/readiness probe model (a container orchestrator restarting a container that fails its liveness check, and withholding traffic from one that fails readiness — the direct, real-world consumer of exactly this kind of endpoint), and load balancers generally, which routinely poll a health endpoint to decide whether to keep sending traffic to a given backend instance.

## SE Lens

A real, common mistake is making a health check *too* deep — checking every downstream dependency (a database, a third-party API) on every single health check call can make the check itself slow, expensive, and prone to reporting "unhealthy" for a real but unrelated, transient downstream hiccup, potentially causing an orchestrator to needlessly restart a perfectly healthy process. A narrow liveness check, kept separate from a more thorough (and more occasionally-run) readiness check, is what keeps this signal both fast and meaningful.

## Connection

Builds on `http-routing-dispatch-table.md`. A natural pairing with `logging-and-observability.md` — a health check's own pass/fail history over time is itself a valuable structured log stream, and a failing health check is exactly the kind of event worth a real, explicit log line.

## Try It Yourself

1. Extend `/health` into a real readiness check that also attempts a trivial database query, returning `503 Service Unavailable` (look up this status code) if it fails — then reason about the tradeoff: this version is more informative but slower and has a new way to fail that a pure liveness check never would.
2. Time how long your `/health` route takes to respond versus a route that does real, substantial work — reasoning about why a monitoring system polling every few seconds needs the health check to stay fast regardless of how busy the rest of the service is.
3. Look up what a real load balancer or container orchestrator's configuration for a health check typically includes (an interval, a timeout, a failure threshold before taking action) and reason about why each of those settings exists — what real problem does a "failure threshold greater than one" solve, versus reacting to the very first failed check?
