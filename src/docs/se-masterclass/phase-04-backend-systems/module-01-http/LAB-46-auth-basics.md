# SE Masterclass — LAB-46 — Authentication Basics

**Language: Python (FastAPI)** — same module as LAB-44–45.

**Prerequisites:** LAB-45 (REST API) and LAB-20 (Dependency Injection — FastAPI's `Depends` IS LAB-20's IoC container, built into the framework).

**What this lab adds:**
- Why plain-text passwords are never acceptable, even "just for now"
- Password hashing with `bcrypt` — one-way, salted, slow-by-design
- Session tokens: a random string mapped server-side to "who this is"
- Protecting routes with a dependency — LAB-20's injection pattern, as FastAPI's actual mechanism

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If a database is breached and passwords were stored in PLAIN TEXT, what's exposed? What if they were hashed with `bcrypt` instead?
> 2. Hashing is supposed to be ONE-WAY — you can't reverse a hash back into the password. So how does LOGIN ever verify a password is correct?
> 3. A session token is a random string the server hands to a client after login. What does the SERVER need to remember for that token to be useful later?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, testing with `curl` shows:

```
=== Register: Password Is Hashed, Never Stored Plain ===
$ curl -X POST http://localhost:8000/register -d '{"username":"alice","password":"hunter2"}'
{"username":"alice","message":"registered"}
stored hash: $2b$12$KIXQ...   ← NOT "hunter2" — a one-way hash

=== Login: Correct Password ===
$ curl -X POST http://localhost:8000/login -d '{"username":"alice","password":"hunter2"}'
{"token":"a1b2c3d4-...","message":"logged in"}

=== Login: Wrong Password ===
$ curl -i -X POST http://localhost:8000/login -d '{"username":"alice","password":"wrongpass"}'
HTTP/1.1 401 Unauthorized
{"detail":"invalid username or password"}

=== Protected Route: No Token ===
$ curl -i http://localhost:8000/me
HTTP/1.1 401 Unauthorized
{"detail":"not authenticated"}

=== Protected Route: Valid Token ===
$ curl -i http://localhost:8000/me -H "Authorization: Bearer a1b2c3d4-..."
HTTP/1.1 200 OK
{"username":"alice"}
```

---

### Concept: Never Store Plain-Text Passwords

**What it is:** A password should NEVER be stored in a form that could be directly read or reversed — not even by the people running the server. Instead, store a **hash**: the output of a one-way function that transforms the password into a fixed-length string, where reversing it (getting the password back FROM the hash) is computationally infeasible.

**The problem before:** If passwords are stored in plain text and the database is ever breached (a real, common occurrence), EVERY user's password is immediately exposed — and since people reuse passwords across sites, this exposes their accounts elsewhere too.

**The solution:** `bcrypt` (and similar algorithms like `argon2`) hash the password with a random **salt** (so identical passwords produce DIFFERENT hashes) and are DELIBERATELY SLOW (making large-scale guessing attacks — "brute force" — impractically expensive), unlike a fast hash like plain SHA-256.

**Watch for:** `hashlib.sha256(password)` is NOT acceptable for passwords — it's FAST, which is exactly wrong for this use case; fast hashing makes trying billions of guesses per second (a real attack technique against stolen hash databases) cheap. `bcrypt` is deliberately, tunably slow.

---

## Step 1 — Register With Hashed Passwords

```bash
pip install fastapi uvicorn "passlib[bcrypt]"
```

```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

users_db = {}      # username -> {"username": ..., "password_hash": ...}

class RegisterRequest(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(req: RegisterRequest):
    if req.username in users_db:
        raise HTTPException(status_code=400, detail="username already taken")
    password_hash = pwd_context.hash(req.password)         # ← add: one-way — the PLAIN password is never stored, anywhere
    users_db[req.username] = {"username": req.username, "password_hash": password_hash}
    return {"username": req.username, "message": "registered"}
```

### SAVE AND TRY

```bash
uvicorn main:app --reload
curl -X POST http://localhost:8000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}'
```

**Expected:**
```
=== Register: Password Is Hashed, Never Stored Plain ===
{"username":"alice","message":"registered"}
```

Add a temporary debug line to confirm the stored value, then remove it:
```python
print(f"stored hash: {users_db['alice']['password_hash']}")
```

**Expected (a bcrypt hash, not "hunter2"):**
```
stored hash: $2b$12$KIXQ...
```

**Confirm the hash is genuinely NOT reversible:** The string `$2b$12$KIXQ...` bears NO resemblance to `hunter2` — bcrypt's design guarantees this is COMPUTATIONALLY INFEASIBLE to reverse, unlike, say, Base64 encoding (which LOOKS scrambled but is trivially reversible — never confuse encoding with hashing).

---

## Step 2 — Login: Verify Without Ever Decrypting

**How verification works without reversing the hash:** Hash the FRESHLY SUBMITTED password using the SAME algorithm and salt, and compare the two HASHES — if they match, the passwords must have matched too, without either ever being reversed.

```python
import uuid

sessions = {}       # token -> username

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    user = users_db.get(req.username)
    if not user or not pwd_context.verify(req.password, user["password_hash"]):   # ← add: hash-and-compare, never reverse
        raise HTTPException(status_code=401, detail="invalid username or password")

    token = str(uuid.uuid4())              # ← add: a random, unguessable session token
    sessions[token] = req.username
    return {"token": token, "message": "logged in"}
```

### SAVE AND TRY

```bash
curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}'
curl -i -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"wrongpass"}'
```

**Expected:**
```
=== Login: Correct Password ===
{"token":"a1b2c3d4-...","message":"logged in"}

=== Login: Wrong Password ===
HTTP/1.1 401 Unauthorized
{"detail":"invalid username or password"}
```

**Confirm `pwd_context.verify` is doing the hash-and-compare, not a decrypt:** `verify(plain_password, stored_hash)` internally re-hashes `plain_password` USING THE SAME SALT embedded in `stored_hash`, and compares the two resulting hash strings — the ORIGINAL password submitted at registration is never recovered or needed again; only whether TWO HASHES MATCH is ever checked.

---

### Concept: Session Tokens — Server-Side Memory of "Who This Is"

**What it is:** A **session token** is a random, unguessable string handed to the client after successful login. The SERVER remembers (in `sessions`, here) which username each token belongs to. On every SUBSEQUENT request, the client sends the token back (typically in an `Authorization` header), and the server looks it up to know WHO is making the request — without needing the password again.

**Where you will see this:** This lab's `sessions` dict is a SIMPLE, server-memory-based session store. LAB-50 (Auth Service) builds a more production-shaped version using JWT (JSON Web Tokens) — a DIFFERENT approach where the token itself CONTAINS verifiable identity information, avoiding server-side session storage entirely. This lab's simpler model is the right place to understand the CONCEPT before LAB-50 adds that complexity.

---

## Step 3 — Protect a Route With a Dependency

```python
from fastapi import Depends, Header

def get_current_user(authorization: str = Header(None)) -> str:    # ← add: LAB-20's DI, as FastAPI's actual mechanism
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="not authenticated")
    token = authorization.removeprefix("Bearer ")
    username = sessions.get(token)
    if not username:
        raise HTTPException(status_code=401, detail="not authenticated")
    return username

@app.get("/me")
def me(username: str = Depends(get_current_user)):    # ← add: INJECTED — 'me' never parses headers itself
    return {"username": username}
```

### SAVE AND TRY

```bash
curl -i http://localhost:8000/me
```

**Expected:**
```
=== Protected Route: No Token ===
HTTP/1.1 401 Unauthorized
{"detail":"not authenticated"}
```

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -i http://localhost:8000/me -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```
=== Protected Route: Valid Token ===
HTTP/1.1 200 OK
{"username":"alice"}
```

**Confirm this is LITERALLY LAB-20's Dependency Injection:** `Depends(get_current_user)` means FastAPI CALLS `get_current_user` for you, and INJECTS its return value as the `username` parameter — `me`'s function body never touches `Authorization` headers directly, exactly like LAB-20's `OrderProcessor` never constructed its own `EmailSender`. Any OTHER route needing authentication just adds the SAME `Depends(get_current_user)` — the dependency is written ONCE, reused everywhere, exactly LAB-20's entire point.

---

## 🎯 Challenge: Token Expiry

**You know:** `sessions[token] = username` currently never expires — a token is valid FOREVER, which is a real security concern (a leaked token grants permanent access).

**Task:** Store a timestamp alongside each token, and reject tokens older than some limit (say, 1 hour) inside `get_current_user`.

<details>
<summary>▶ Show Solution</summary>

```python
import time

sessions = {}   # token -> {"username": ..., "created_at": ...}
SESSION_LIFETIME_SECONDS = 3600

@app.post("/login")
def login(req: LoginRequest):
    user = users_db.get(req.username)
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid username or password")
    token = str(uuid.uuid4())
    sessions[token] = {"username": req.username, "created_at": time.time()}
    return {"token": token, "message": "logged in"}

def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="not authenticated")
    token = authorization.removeprefix("Bearer ")
    session = sessions.get(token)
    if not session:
        raise HTTPException(status_code=401, detail="not authenticated")
    if time.time() - session["created_at"] > SESSION_LIFETIME_SECONDS:
        del sessions[token]                                          # ← expired — clean it up
        raise HTTPException(status_code=401, detail="session expired")
    return session["username"]
```

**Key insight:** This is LAB-13's state machine idea applied to a session's LIFECYCLE — a token isn't just "valid" or "invalid" forever; it moves through states over TIME (`active` → `expired`), and `get_current_user` is where that state transition gets CHECKED, on every single protected request. A leaked token from months ago is now harmless after `SESSION_LIFETIME_SECONDS` passes, dramatically limiting the damage a single leaked token can do.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `bcrypt` password hashing | Every serious authentication system — never roll your own with SHA-256 |
| `sessions` dict | A simplified version of Redis-backed session stores in production systems |
| `Depends(get_current_user)` | Every FastAPI app's real authentication dependency |
| Token expiry | Why you get logged out of websites after being inactive |

**Where you will see this again:** LAB-50 (Auth Service) builds the full production version — JWT tokens (self-contained, no server-side session lookup needed), refresh tokens, and proper password reset flows.

---

## Final Check

| Feature | How to verify |
|---|---|
| A registered password is NEVER stored or visible in plain text | Step 1 |
| Login correctly verifies passwords via hash comparison, not reversal | Step 2 |
| Wrong passwords are rejected with 401, without revealing WHICH field was wrong | Step 2 |
| A protected route rejects requests with no/invalid token | Step 3 |
| A protected route succeeds with a valid token, injecting the correct username | Step 3 |
| Tokens correctly expire after their configured lifetime | Challenge |

---

## Quick Check Answers

**1. Plain-text vs. bcrypt-hashed passwords — what's exposed in a breach?**

Plain text: EVERY user's actual password, immediately usable to log in as them (here or, since people reuse passwords, on OTHER sites too). Bcrypt-hashed: only the HASH strings, which are computationally infeasible to reverse back into the original passwords — an attacker would need to brute-force guess each password individually (deliberately made SLOW and expensive by bcrypt's design), rather than simply reading them off directly.

**2. Hashing is one-way — how does login ever verify a password?**

By hashing the FRESHLY SUBMITTED password (using the same salt) and comparing the resulting HASH to the STORED hash (Step 2) — never by reversing the stored hash back into a password. If the two hashes match, the two original passwords must have matched too (this is the mathematical guarantee a hash function provides), without either password ever needing to be "read back."

**3. What must the server remember for a session token to be useful?**

The MAPPING from token to identity — `sessions[token] = username` (Step 2), so that a later request presenting that SAME token can be resolved back to "who this is" without requiring the password again. Without this server-side memory (or, in JWT's alternative approach previewed for LAB-50, without the token itself encoding that information verifiably), the token is just a meaningless random string with no way to answer "whose session is this."

---

*Module 1 (HTTP Fundamentals) complete. Next: [LAB-47 — Async and Promises](../module-02-async/LAB-47-async-promises.md) — JavaScript (Node.js), Module 2 begins*
