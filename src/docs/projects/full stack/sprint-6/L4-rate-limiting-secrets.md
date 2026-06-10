# Sprint 6 · Lesson 4 — Rate limiting and secrets management

## What you will build

By the end of this lesson, the login endpoint is rate-limited (5 attempts per minute per IP, then 429). All secrets (`SECRET_KEY`, `DATABASE_URL`) are loaded from environment variables — never hardcoded. `.env` is in `.gitignore`. The GitHub Actions workflow provides secrets through environment variables. You understand brute force attacks, secret scanning, and why `.env` files do not belong in git history.

---

## What you need to know first

- Sprint 4 L2: `SECRET_KEY`, why it must be secret.
- Sprint 4 L1: bcrypt, why brute force matters for authentication.
- Sprint 5 L4: GitHub Actions environment variables.

---

## The lesson

---

### 1. The brute force threat and rate limiting

**The problem:** Your login endpoint accepts unlimited authentication attempts. An attacker can try `POST /auth/login` with every possible password until one works. bcrypt's cost factor slows each attempt to ~300ms. Without rate limiting, an attacker with many servers can try thousands of passwords per second across concurrent connections. Rate limiting is the second line of defence: cap the number of attempts per IP per time window.

Install `slowapi`:

```
pip install slowapi
pip freeze > requirements.txt
```

Update `backend/main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == user_data.username).first()
    if user is None or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer")
```

**Walkthrough:**

`Limiter(key_func=get_remote_address)` — creates the rate limiter. `get_remote_address` extracts the client's IP address from the request. Rate limits are tracked per IP — each IP has its own counter.

`app.state.limiter = limiter` — attaches the limiter to the FastAPI application state. `slowapi` reads from `app.state.limiter` on each request.

`app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)` — registers an exception handler. When the rate limit is exceeded, `slowapi` raises `RateLimitExceeded`. The registered handler converts it to an HTTP 429 response.

`@limiter.limit("5/minute")` — the rate limit decorator. `"5/minute"` means: allow 5 requests per minute from each unique IP. The 6th request within the same minute receives 429 Too Many Requests.

`request: Request` — the limit decorator requires the `Request` object to extract the IP address. It must appear as the first parameter in the route handler.

Test by sending 6 rapid login requests. The first 5 respond (401 or 200 depending on credentials). The 6th responds 429.

**CS lens — token bucket and sliding window algorithms.** Rate limiters use one of two algorithms:

**Token bucket:** Each IP has a bucket that fills at a fixed rate (e.g., 5 tokens/minute). Each request consumes a token. If the bucket is empty, the request is rejected. Slowapi uses this approach.

**Sliding window:** Counts requests in the most recent N seconds. "5 requests in the last 60 seconds" — as time advances, old requests fall out of the window.

Token bucket allows brief bursts (a user who hasn't made requests in a while has a full bucket). Sliding window is stricter. For login rate limiting, either is effective.

**SE lens — rate limiting at the wrong layer.** Adding `@limiter.limit("5/minute")` to the login endpoint is correct. Adding it to every endpoint is often wrong — it limits legitimate high-frequency API clients. Rate limiting belongs at authentication boundaries (login, registration) and expensive operations (report generation, email sending). For general API rate limiting (protecting against DDoS), apply limits at the infrastructure layer: Nginx, a CDN, or an API gateway — not in application code. Application-level rate limiting can be bypassed by sending requests to a different server instance.

**What breaks without this:** A motivated attacker with bcrypt taking 300ms per hash can try ~200 passwords per minute per connection. With 100 concurrent connections, they can try ~20,000 passwords per minute. A rate limit of 5/minute/IP reduces this to 500 passwords per minute across 100 IPs — still possible, but much slower and requires more infrastructure, increasing the attacker's cost.

---

### 2. Move secrets to environment variables

**The problem:** Your `backend/auth.py` contains:

```python
SECRET_KEY = "dev-secret-key-change-this-in-production"
DATABASE_URL = "postgresql://devuser:devpassword@localhost:5432/workorders"
```

If this code is ever pushed to a public repository — even once, even accidentally — the secrets are exposed permanently. Git history is immutable: removing a file in a later commit does not remove it from history. Once in git history, it is in every clone, every fork, every backup.

**Secret scanning** is automated. GitHub scans every push for patterns matching known credential formats (AWS keys, private keys, connection strings). Third-party tools scan public repositories continuously. If you commit a secret, assume it is compromised immediately.

The fix: read secrets from environment variables. Environment variables are set outside the code — in the shell, a `.env` file, or CI secrets. They are never committed.

Create `backend/.env`:

```
SECRET_KEY=dev-secret-key-change-this-in-production
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/workorders
TEST_DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/workorders_test
```

Add `backend/.env` to `.gitignore`:

```
# .gitignore
backend/.env
backend/venv/
__pycache__/
*.pyc
```

Install `python-dotenv`:

```
pip install python-dotenv
pip freeze > requirements.txt
```

Update `backend/database.py`:

```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Update `backend/auth.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**Walkthrough:**

`load_dotenv()` — reads the `.env` file in the current directory (or parent directories) and loads its contents as environment variables. If the variable is already set in the shell environment, `load_dotenv` does not override it — shell environment takes precedence. This allows CI to set `SECRET_KEY` via repository secrets without a `.env` file.

`os.environ["SECRET_KEY"]` — reads the environment variable. Raises `KeyError` if the variable is not set. This is intentional: if the application starts without the required secret, it crashes immediately at startup with a clear error — rather than silently using an empty string or a default value that looks valid.

`os.environ.get("SECRET_KEY", "default")` would be wrong: if the variable is not set, it uses the default value silently. An accidentally-deployed instance without the secret would use the default value, undermining security with no warning.

**The required `.env.example` file:**

Create `backend/.env.example` (this IS committed):

```
SECRET_KEY=replace-with-a-random-256-bit-key
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/workorders
TEST_DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/workorders_test
```

`.env.example` tells developers what variables are needed without exposing actual values. When a new developer joins, they copy `.env.example` to `.env` and fill in the real values.

**Generate a production-quality secret key:**

```python
import secrets
print(secrets.token_hex(32))
```

`secrets.token_hex(32)` generates 32 random bytes as a hex string (64 characters). This is 256 bits of entropy — cryptographically secure. The default `"dev-secret-key-change-this-in-production"` string has about 50 bits of effective entropy. A production key should be generated fresh, never reused between environments, and never shared.

**CS lens — Kerckhoffs's principle and secret key security.** Kerckhoffs's principle: a cryptographic system should be secure even if everything about the system except the key is public knowledge. Applied here: the algorithm (HS256), the token format (JWT), the verification logic — all of this can be public. The `SECRET_KEY` is the only secret. This is why the key must be: random (not guessable), long (256 bits), and kept secret. If you harden everything but leave the key hardcoded in source code, the entire security model collapses.

**SE lens — the 12-factor app methodology.** The 12-Factor App (12factor.net) is an influential methodology for building cloud-native services. Factor III (Config) states: "Store config in the environment." Config includes anything that varies between deployments (dev, staging, production): database URLs, secret keys, external service credentials. Code that reads from environment variables can be deployed to any environment without modification. Code that hardcodes config values cannot.

---

### 3. Add secrets to GitHub Actions

GitHub Actions workflows need the same secrets, provided differently (no `.env` file on the CI server).

1. GitHub repository → Settings → Secrets and variables → Actions → New repository secret
2. Add: `SECRET_KEY` with a value (generate with `secrets.token_hex(32)`)

Update `.github/workflows/tests.yml` to provide the secret:

```yaml
- name: Run backend tests
  env:
    TEST_DATABASE_URL: postgresql://devuser:devpassword@localhost:5432/workorders_test
    SECRET_KEY: ${{ secrets.SECRET_KEY }}
    DATABASE_URL: postgresql://devuser:devpassword@localhost:5432/workorders_test
  run: |
    cd fullstack-project/backend
    pytest tests/ -v
```

**Walkthrough:**

`${{ secrets.SECRET_KEY }}` — GitHub Actions' syntax for reading a repository secret. Secrets are injected as environment variables into the step. GitHub masks the secret value in logs — it appears as `***` in any output.

`DATABASE_URL` is provided directly in the YAML (pointing to the CI Postgres service). `SECRET_KEY` comes from the encrypted repository secret. No secrets are in the YAML file itself.

**What secrets must not do:**
- Never print secrets to stdout (they appear in CI logs)
- Never log secrets
- Never echo them in shell scripts: `echo $SECRET_KEY` — GitHub masks it, but still avoid the pattern
- Never store them in environment variables that get copied to log files

**CS lens — secret rotation.** Secrets should be rotated periodically: a new secret is generated, all running servers are updated to use the new secret, and the old secret is invalidated. For JWT secret keys, rotation requires: deploying the new key, invalidating all existing tokens (or running with two valid keys during transition), forcing users to log in again. Rotation reduces the blast radius of a key leak: a leaked key from six months ago is no longer valid. The shorter the rotation interval, the smaller the exposure window.

**SE lens — secret scanning as a team safeguard.** Even with `.env` in `.gitignore`, accidents happen: a developer creates a new file with secrets, or copies config inline. GitHub's secret scanning (enabled by default on public repos) scans every push and alerts the account if a known credential pattern is detected. For additional protection, install pre-commit hooks that scan for secrets before commits: `pip install detect-secrets && detect-secrets scan > .secrets.baseline && pre-commit install`. This catches secrets before they reach the remote.

---

### 4. Verify the `.gitignore` protects `.env`

```
git status
```

The `backend/.env` file should not appear in the output — `.gitignore` is suppressing it.

```
git check-ignore -v backend/.env
```

Expected output:
```
.gitignore:1:backend/.env      backend/.env
```

This confirms the rule in `.gitignore` that matches `.env`.

If `.env` was already committed before adding it to `.gitignore`:

```
git rm --cached backend/.env
git commit -m "Remove .env from tracking; add to .gitignore"
```

`git rm --cached` removes the file from git's index (stops tracking it) without deleting it from disk. After this commit, `.env` is no longer tracked and will not appear in future `git add` operations. But it is still in the git history before that commit. If the repository is public and the secret was committed: generate a new secret immediately. Assume the old secret is compromised.

**CS lens — git history immutability.** Git is a content-addressed storage system. Commits are hashed; each commit's hash includes the parent commit's hash. This makes history tamper-evident but also immutable: removing a file in a later commit does not change earlier commits. Tools like `git filter-repo` can rewrite history, but all collaborators must re-clone and all existing forks retain the old history. History rewriting is expensive and incomplete — the only safe response to a committed secret is to rotate it immediately.

---

## Connect the pieces

Security Sprint complete. Your application now has:
- SQL injection prevention: SQLAlchemy parameterisation + Pydantic validators (L1)
- IDOR prevention: ownership checks, 403 for cross-user access (L2)
- XSS prevention: React default escaping, avoid `dangerouslySetInnerHTML` (L3)
- HTTP security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` (L3)
- CORS: properly configured allowlist (L3)
- Brute force mitigation: rate limiting on login (L4)
- Secrets management: environment variables, `.env` in `.gitignore`, CI secrets (L4)

Sprint 7 covers architecture: why the current code structure will hurt at scale and how to fix it with the repository pattern, service layer, and SOLID principles.

---

## What breaks without this

**`os.environ["SECRET_KEY"]` raises `KeyError` at startup:** If a deployment environment doesn't set `SECRET_KEY`, the application crashes with `KeyError: 'SECRET_KEY'`. This is intentional — failing loudly at startup is safer than silently using no key. Fix: set the environment variable. Provide a clear error message in deployment documentation.

**Rate limiting stores state in-process:** `slowapi` stores rate limit counters in memory. If the API runs as multiple processes (gunicorn with 4 workers), each process has its own counter — the effective limit is `5 * num_workers` per minute. For production multi-process deployments, use a Redis-backed limiter: `slowapi` supports `redis://` as the storage backend.

---

## Definition of done

- [ ] `POST /auth/login` returns 429 on the 6th attempt within one minute
- [ ] `backend/.env` exists and is in `.gitignore` (`git status` does not show it)
- [ ] `backend/.env.example` is committed (shows what variables are needed)
- [ ] `SECRET_KEY` and `DATABASE_URL` are loaded from `os.environ` (not hardcoded)
- [ ] GitHub Actions provides `SECRET_KEY` via repository secrets
- [ ] You can explain what `git rm --cached` does and when to use it
- [ ] You generated a production `SECRET_KEY` with `secrets.token_hex(32)`
- [ ] You can explain why `os.environ["KEY"]` is better than `os.environ.get("KEY", "default")` for secrets

**Git commit:**

```
git add backend/auth.py backend/database.py backend/.env.example backend/main.py .gitignore .github/workflows/tests.yml
git commit -m "Add rate limiting on login (5/min), move secrets to env vars, add .env.example"
```
