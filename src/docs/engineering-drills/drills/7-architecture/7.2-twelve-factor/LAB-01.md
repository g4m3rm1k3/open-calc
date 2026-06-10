# Drill 7.2 — The Twelve-Factor App: Configuration That Travels

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install flask python-dotenv`
**What you will build:** A Flask app that demonstrates all twelve factors: config from environment, proper logging, stateless processes, port binding, and a dev/staging/prod environment swap in under 5 seconds.
**What you will understand:** Why twelve-factor exists, which factors matter most, and how to violate each one so you recognize the anti-pattern.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Your app hardcodes `DATABASE_URL = "postgres://alice:s3cr3t@db.prod.example.com/app"`. You push this to GitHub. What are three separate problems this causes?

2. Your app stores session state in a local Python dict. You deploy two copies of your app behind a load balancer. User authenticates against server 1. Next request hits server 2. What happens?

3. `print("user logged in")` vs a proper logger with structured output. What is one concrete operational advantage of the logger?

4. Factor 11 says "Logs are event streams." What does it mean for an app to "treat logs as event streams" vs writing to a log file?

*(Answers at the bottom.)*

---

## The Concept: The Twelve-Factor App

### Concept: Why Twelve-Factor Exists

**What it is:**
The Twelve-Factor App is a methodology for building software-as-a-service applications that are: deployable to any cloud, easy to scale, and maintainable by different people over time. Published by Heroku engineers in 2011, it codifies hard-won lessons from running thousands of apps in production.

**The problem it solves:**
Software deployment historically worked like this: ssh into a server, manually edit config files, restart the app, hope nothing breaks. Moving from "works on my machine" to "works in production" required a ceremony of manual steps that only one person understood. Twelve-factor turns deployment into a repeatable, automatable procedure.

**The twelve factors — grouped by what they protect:**

**Codebase and dependencies (factors 1-2):**
- Factor 1 — Codebase: One codebase in version control, many deploys. Not one codebase per environment.
- Factor 2 — Dependencies: Explicitly declare and isolate dependencies. No system-level packages that "just exist."

**Configuration (factor 3):**
- Factor 3 — Config: Store config in environment variables, not in code. Anything that changes between environments (dev, staging, prod) is config: database URLs, API keys, feature flags.

**Backing services (factor 4):**
- Factor 4 — Backing services: Treat databases, queues, email services as attached resources. Swap a local database for a remote one by changing an env var — no code change.

**Build and process (factors 5-6):**
- Factor 5 — Build, Release, Run: Strictly separate build stage (compile/assemble), release stage (config + build), and run stage (execute). A release is immutable — don't modify a running release.
- Factor 6 — Processes: Execute the app as one or more stateless processes. State lives in backing services (database, Redis), not in the process.

**Scalability (factors 7-8):**
- Factor 7 — Port Binding: Export services via port binding. The app listens on a port and serves HTTP directly — no Apache/IIS wrapper required.
- Factor 8 — Concurrency: Scale out via the process model. Add more processes, not bigger servers.

**Reliability (factors 9-10):**
- Factor 9 — Disposability: Fast startup and graceful shutdown. Processes can be killed and restarted at any time without data loss.
- Factor 10 — Dev/Prod Parity: Keep development, staging, and production as similar as possible. Same database engine, same backing services, same config mechanism.

**Observability (factors 11-12):**
- Factor 11 — Logs: Treat logs as event streams. Write to stdout, let the infrastructure collect and route them.
- Factor 12 — Admin Processes: Run admin/management tasks as one-off processes in the same environment as the app.

**Constraints:**
- Config in environment variables means you need a way to manage env vars in production (secrets managers, vault systems)
- Stateless processes require moving ALL session state to Redis or a database — can't use in-process caches for user data
- Some legacy frameworks assume file-based logging — you may need to adapt

**Tradeoffs:**
- Strictness vs convenience: storing config in a `.env` file is more convenient than managing env vars, but the file can be accidentally committed to git. Proper secret management requires more tooling.
- Stateless vs performance: stateless processes can't cache data in memory between requests. Moving to Redis adds network overhead per cache hit.

**Failure modes:**
- Config in code: a password committed to git cannot be truly deleted (git history). Rotate credentials immediately.
- Stateful processes: user sessions tied to a specific server instance break when the instance restarts or scales.
- Logs written to files: log files grow without bound on a long-running server, eventually filling the disk. Files on ephemeral instances (containers, auto-scaling) are lost on restart.
- Dev/prod parity violation: "it works in dev" failures that only appear in production because dev uses SQLite and prod uses PostgreSQL.

**Operational reality:**
Every major PaaS (Heroku, Railway, Render, Fly.io) and container platform (Kubernetes, ECS) is built around twelve-factor principles. `docker run -e DATABASE_URL=...` IS factor 3. `docker logs <container>` IS factor 11. Kubernetes `ConfigMap` and `Secret` IS factor 3 implemented at scale. Understanding twelve-factor means understanding how cloud deployment works.

**You will see this again in:**
FastAPI + uvicorn deployment, Gunicorn configuration, Docker Compose environments, Kubernetes deployments, GitHub Actions deployment pipelines.

**Watch for:**
Factor 3 violations are the most common and most dangerous: hardcoded API keys, database passwords in source code, or different code branches per environment (`if env == "prod": use_real_db()`). These make the app impossible to audit and impossible to safely move between environments.

---

## Step 1 — Factor 3: Config Lives in Environment Variables

The most critical factor. First, see the anti-pattern:

```python
# config_bad.py — ANTI-PATTERN: config hardcoded in source
# Never do this

DATABASE_URL = "postgres://alice:password123@db.internal.com/myapp"
SECRET_KEY = "super-secret-key-that-everyone-now-knows"
DEBUG = True  # accidentally left on in production
API_KEY = "sk-real-openai-key-oops"
ADMIN_EMAIL = "ops@example.com"

print("Problems with this approach:")
print("1. This file is in git — passwords and keys are now part of git history forever")
print("2. Dev and prod share the same config — no way to use different databases")
print("3. To change anything, you edit code and redeploy")
print("4. Anyone with repo access sees all secrets")
```

Now the correct approach. Create `.env` (this file is in `.gitignore`):

```
# .env — local development config
# This file is NEVER committed to git
DATABASE_URL=sqlite:///local.db
SECRET_KEY=dev-only-key-not-secret
DEBUG=true
LOG_LEVEL=DEBUG
PORT=5000
```

Create `.env.example` (this IS committed to git — shows required variables without values):

```
# .env.example — copy to .env and fill in real values
DATABASE_URL=
SECRET_KEY=
DEBUG=false
LOG_LEVEL=INFO
PORT=5000
```

Create `config.py`:

```python
# config.py — all config comes from environment
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env file if present (dev convenience)

class Config:
    DATABASE_URL: str = os.environ["DATABASE_URL"]        # required — fails fast if missing
    SECRET_KEY: str = os.environ["DATABASE_URL"]
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    PORT: int = int(os.getenv("PORT", "5000"))
    
    @classmethod
    def validate(cls) -> None:
        """Fail at startup if required config is missing."""
        required = ["DATABASE_URL", "SECRET_KEY"]
        missing = [k for k in required if not os.getenv(k)]
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                f"Copy .env.example to .env and fill in values."
            )

def show_config(cfg: Config) -> None:
    print("=== Active Configuration ===")
    print(f"  DATABASE_URL: {cfg.DATABASE_URL}")
    print(f"  DEBUG:        {cfg.DEBUG}")
    print(f"  LOG_LEVEL:    {cfg.LOG_LEVEL}")
    print(f"  PORT:         {cfg.PORT}")
    print(f"  SECRET_KEY:   {'[set]' if cfg.SECRET_KEY else '[MISSING]'}")

if __name__ == "__main__":
    try:
        Config.validate()
        show_config(Config)
        print("\nAll required config is present.")
    except RuntimeError as e:
        print(f"Config error: {e}")
```

### SAVE AND TRY

```
python config.py
```

Expected output (with `.env` file present):
```
=== Active Configuration ===
  DATABASE_URL: sqlite:///local.db
  DEBUG:        True
  LOG_LEVEL:    DEBUG
  PORT:         5000
  SECRET_KEY:   [set]

All required config is present.
```

**Change something — simulate a deployment environment:**
```bash
DATABASE_URL=postgres://prod-user:prodpass@prod.db.internal/app \
SECRET_KEY=real-prod-secret-from-vault \
DEBUG=false \
LOG_LEVEL=WARNING \
python config.py
```

Same code, completely different config. No code change needed to deploy to production.

**Change something — simulate missing config:**
Delete `DATABASE_URL` from your `.env` and run. The app fails immediately with a clear error. This is "fail fast" — better than starting up and crashing on the first database operation 10 minutes later.

---

## Step 2 — Factors 6, 11: Stateless Processes and Log Streams

Create `app.py` — a Flask app demonstrating factors 6 (stateless) and 11 (logs as streams):

```python
# app.py
import os
import logging
import json
from datetime import datetime
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Factor 11: Logs as event streams — structured JSON to stdout
# Let the infrastructure (docker logs, CloudWatch, Datadog) collect and route
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-key")

# Factor 6: STATELESS — no in-process session storage
# BAD: sessions = {}  <- this breaks when you run multiple processes
# GOOD: use Redis, a database, or signed cookies (Flask's default)
# For this demo, we use Flask's default signed cookies (stateless, client-side)

@app.route("/")
def index():
    logger.info("GET / from %s", request.remote_addr)
    return jsonify({
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "debug": app.debug,
    })

@app.route("/health")
def health():
    # Factor 9: Disposability — health endpoint lets load balancers verify the app is ready
    return jsonify({"healthy": True}), 200

@app.route("/env")
def show_env():
    # Show which environment we're running in (never show secrets!)
    return jsonify({
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "debug": os.getenv("DEBUG", "false"),
        "port": os.getenv("PORT", "5000"),
        "database": "configured" if os.getenv("DATABASE_URL") else "missing",
    })

@app.route("/log-test")
def log_test():
    logger.debug("DEBUG: detailed trace information")
    logger.info("INFO: normal operation event")
    logger.warning("WARNING: something unexpected")
    logger.error("ERROR: something failed")
    return jsonify({"message": "Check your terminal for log output"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info("Starting app on port %d (debug=%s)", port, debug)
    
    # Factor 7: Port binding — app binds directly to a port
    app.run(host="0.0.0.0", port=port, debug=debug)
```

### SAVE AND TRY

Terminal 1:
```
python app.py
```

Terminal 2:
```
curl http://localhost:5000/
curl http://localhost:5000/env
curl http://localhost:5000/log-test
```

Expected output from the app terminal:
```
2026-05-15 10:00:00 INFO __main__ Starting app on port 5000 (debug=True)
2026-05-15 10:00:01 INFO __main__ GET / from 127.0.0.1
2026-05-15 10:00:02 INFO __main__ DEBUG: detailed trace information
2026-05-15 10:00:02 INFO __main__ INFO: normal operation event
2026-05-15 10:00:02 WARNING __main__ WARNING: something unexpected
2026-05-15 10:00:02 ERROR __main__ ERROR: something failed
```

**Change something — simulate a different environment:**
```bash
PORT=8080 DEBUG=false LOG_LEVEL=WARNING python app.py
```

The app starts on port 8080, no debug mode, and only WARNING and ERROR log messages appear. Same binary, different behavior. This is factor 3 + factor 7 + factor 11 working together.

---

## Step 3 — Factor 10: Dev/Prod Parity

Create `dev_prod_parity.py` — demonstrating what breaks when dev differs from prod:

```python
# dev_prod_parity.py
"""
Factor 10 violation examples and fixes.
Run this to see what happens when dev uses SQLite and prod uses PostgreSQL.
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///dev.db")

print(f"=== Dev/Prod Parity Check ===")
print(f"DATABASE_URL: {DATABASE_URL}")
print()

# Detect parity violations
violations = []

if DATABASE_URL.startswith("sqlite"):
    violations.append({
        "factor": "Factor 10",
        "violation": "SQLite in development, likely PostgreSQL in production",
        "problem": (
            "SQLite and PostgreSQL handle things differently:\n"
            "  - SQLite is case-insensitive by default; PostgreSQL is case-sensitive\n"
            "  - SQLite allows implicit type coercion; PostgreSQL is strict\n"
            "  - SQLite ignores foreign key constraints by default\n"
            "  - RETURNING clause behavior differs\n"
            "Result: tests pass in dev, fail in prod"
        ),
        "fix": "Use PostgreSQL in dev: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres"
    })

debug_mode = os.getenv("DEBUG", "false").lower() == "true"
if debug_mode and os.getenv("ENVIRONMENT", "development") == "production":
    violations.append({
        "factor": "Factor 3",
        "violation": "DEBUG=true in production",
        "problem": "Debug mode exposes stack traces, internal variables, and interactive debugger to users",
        "fix": "Set DEBUG=false in production config"
    })

log_level = os.getenv("LOG_LEVEL", "INFO")
if log_level == "DEBUG" and os.getenv("ENVIRONMENT") == "production":
    violations.append({
        "factor": "Factor 11",
        "violation": "DEBUG log level in production",
        "problem": "Debug logs contain sensitive data, degrade performance, and overwhelm log aggregation",
        "fix": "Use INFO or WARNING in production"
    })

if not violations:
    print("No parity violations detected.")
else:
    for v in violations:
        print(f"[{v['factor']}] VIOLATION: {v['violation']}")
        print(f"  Problem: {v['problem']}")
        print(f"  Fix:     {v['fix']}")
        print()

print("=== Twelve Factor Checklist ===")
checklist = [
    ("1. Codebase",      True,  "Using git"),
    ("2. Dependencies",  bool(os.path.exists("requirements.txt")), "requirements.txt present"),
    ("3. Config",        bool(os.getenv("DATABASE_URL")), "DATABASE_URL from environment"),
    ("7. Port binding",  bool(os.getenv("PORT")), "PORT from environment"),
    ("11. Logs",         True,  "Using Python logging to stdout"),
]

for name, ok, reason in checklist:
    status = "✓" if ok else "✗"
    print(f"  {status} {name}: {reason}")
```

### SAVE AND TRY

```
python dev_prod_parity.py
```

Expected output (with default `.env`):
```
=== Dev/Prod Parity Check ===
DATABASE_URL: sqlite:///local.db

[Factor 10] VIOLATION: SQLite in development, likely PostgreSQL in production
  Problem: SQLite and PostgreSQL handle things differently:
    - SQLite is case-insensitive by default; PostgreSQL is case-sensitive
    ...
  Fix: Use PostgreSQL in dev: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres

=== Twelve Factor Checklist ===
  ✓ 1. Codebase: Using git
  ✓ 2. Dependencies: requirements.txt present
  ✓ 3. Config: DATABASE_URL from environment
  ✓ 7. Port binding: PORT from environment
  ✓ 11. Logs: Using Python logging to stdout
```

**Change something:** Set `DATABASE_URL=postgresql://dev:dev@localhost:5432/devdb` in your `.env`. Run again — the SQLite violation disappears. The checklist is green for factor 10.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a deployment-ready Flask API that passes all twelve factor checks for the factors that apply to a single-service web app.

**Requirements checklist:**

- [ ] Factor 1 — `.gitignore` excludes `.env`, `*.pyc`, `__pycache__`, `venv/`
- [ ] Factor 2 — `requirements.txt` with pinned versions (`flask==3.0.0`, not `flask`)
- [ ] Factor 3 — All config from environment: `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `PORT`. App raises `RuntimeError` at startup if any required var is missing.
- [ ] Factor 5 — A `Makefile` with `build`, `run`, `test` targets: `make build` installs deps, `make run` starts with env from `.env`, `make test` runs tests
- [ ] Factor 6 — No in-process mutable state shared between requests. Demonstrate by running two copies on different ports, both serving correctly.
- [ ] Factor 7 — `PORT` env var controls the port. `make run` and `PORT=8080 make run` both work.
- [ ] Factor 9 — `GET /health` returns `{"healthy": true, "version": "<git-sha>"}`. Version comes from `GIT_SHA` env var (or `git rev-parse --short HEAD` fallback).
- [ ] Factor 10 — `make dev` starts the app with dev config (SQLite, DEBUG=true, LOG_LEVEL=DEBUG); `make prod-sim` starts with prod-like config (no SQLite, DEBUG=false, LOG_LEVEL=INFO).
- [ ] Factor 11 — All logs use `logging.getLogger`, write to stdout with timestamp/level/message. No `print()` calls in application code.
- [ ] Factor 12 — A `manage.py` script with a `seed-db` command that populates initial data. `python manage.py seed-db` runs the same code path in any environment.

**Starter:**
```
project/
  app.py          # Flask application
  config.py       # Config class reading from environment
  manage.py       # Admin/management commands (Factor 12)
  requirements.txt
  .env.example
  .gitignore
  Makefile
```

**When you're done:**
```bash
cp .env.example .env
# fill in .env with dev values

make build   # installs dependencies
make dev     # starts with dev config, port 5000
```
In another terminal:
```bash
curl http://localhost:5000/health
# {"healthy": true, "version": "abc1234"}

PORT=8080 make dev  # second instance, different port
curl http://localhost:8080/health
# same response — stateless, two instances work identically

python manage.py seed-db
# populates database, same code works against SQLite or PostgreSQL
```

**Stuck?** Ask AI: "In Python Flask, what is the pattern for reading all configuration from environment variables at startup and raising a clear error if required variables are missing? Show me a Config class that reads os.environ with explicit required vs optional fields and a validate() method."

---

## Quick Check Answers

**1. Three problems with a hardcoded database URL:**
(a) It's in git history forever — even if you delete the line, `git log` shows it. Credentials must be rotated immediately. (b) Dev and prod use the same database — a dev mistake (dropping a table) hits the production database. (c) Every developer who clones the repo has the production credentials and can access the production database. There's no way to grant different access to different team members.

**2. Session state in a local dict with a load balancer:**
The second server has no copy of the session. The user's authentication is lost — they appear unauthenticated to server 2 and must log in again. Or worse, they get a 500 error. Factor 6 (stateless processes) exists precisely because horizontal scaling (multiple instances) is the standard deployment model. Session state must live in a shared backing service: Redis, the database, or a signed cookie (where the client stores the state).

**3. Logger vs print — one concrete advantage:**
A logger with `logging.WARNING` level suppresses DEBUG and INFO messages in production — you only see the events that matter. With `print()`, every statement always runs, creating noise and performance overhead. Additionally, loggers include timestamps, severity levels, and module names automatically, making it possible to filter and search logs ("show me all ERRORs from the payment module in the last hour"). `print()` strings are unsearchable noise.

**4. "Logs as event streams" meaning:**
The app writes log events to stdout in real time — it does not manage files, rotate logs, or decide where logs go. The infrastructure (Docker, Kubernetes, systemd) captures stdout and routes it to wherever logs should go: CloudWatch, Datadog, Elasticsearch, a file. The app has no file handles, no log rotation config, no log directories. If the app is killed, the infrastructure has already collected all prior logs — nothing is lost. If the app writes to a file and the container is killed, the file is gone.
