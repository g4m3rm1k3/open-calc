# SE Masterclass — LAB-50 — Auth Service

**Language: Python (FastAPI)** — Module 3 of Phase 4 begins: six complete backend systems.

**Prerequisites:** LAB-46 (Auth Basics — this lab replaces its server-side session dict with a STATELESS token) and LAB-26 (serialization — a JWT is itself a specific serialization format).

**What this lab adds:**
- JWT structure: header, payload, signature — built BY HAND first, before using a library
- Verifying a JWT: recomputing the signature and comparing — and what tampering looks like when caught
- A production-shaped login/register flow using `PyJWT`
- Stateless route protection: no server-side session memory needed at all, unlike LAB-46

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-46's session token was a random string with NO information encoded in it — the server had to look it up in a dict. A JWT's payload can contain real data (like a user ID). What does this let a server SKIP doing on every request?
> 2. If someone tampers with a JWT's payload (changes `"role": "user"` to `"role": "admin"`), what stops the server from accepting it?
> 3. Why can a JWT never contain something like a password or credit card number, even though its payload IS just text?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, testing with `curl` shows:

```
=== Building a JWT By Hand ===
header: {"alg":"HS256","typ":"JWT"}
payload: {"username":"alice","exp":1234567890}
signature (HMAC-SHA256): 4f2a8b...
JWT: eyJhbGc...header...payload...signature

=== Verifying: Untampered Token ===
recomputed signature matches: true
token is VALID

=== Verifying: Tampered Token ===
payload changed to: {"username":"alice","role":"admin","exp":1234567890}
recomputed signature matches: false
token is REJECTED — tampering detected

=== Real Login Flow (PyJWT) ===
$ curl -X POST /login -d '{"username":"alice","password":"hunter2"}'
{"access_token":"eyJhbGc..."}

=== Protected Route: Stateless Verification ===
$ curl /me -H "Authorization: Bearer eyJhbGc..."
{"username":"alice"}
  ← no session lookup anywhere — the token ITSELF proves identity

=== Refresh Tokens ===
access token expires after 15 minutes; refresh token after 7 days
$ curl -X POST /refresh -d '{"refresh_token":"eyJhbGc..."}'
{"access_token":"eyJhbGc... (new, extended)"}
```

---

### Concept: A JWT Is Three Parts, Base64-Encoded, Signed

**What it is:** A JSON Web Token (JWT) is `header.payload.signature` — three Base64URL-encoded parts joined by dots. The HEADER says which algorithm was used. The PAYLOAD holds actual DATA (like `username`, an expiry time). The SIGNATURE is an HMAC hash of `header + payload`, computed with a SECRET KEY only the server knows — proving the token wasn't tampered with, WITHOUT the server needing to remember anything about it.

**The problem before (LAB-46's session token):** A random session token has NO information in it — it's just a lookup KEY into a server-side dict. Every request needs that dict lookup to figure out who the token belongs to. If you have multiple servers (a real production setup), they'd ALL need access to the SAME session store.

**The solution:** Put the IDENTITY DATA directly in the token, SIGNED so it can't be forged. Any server holding the SAME secret key can verify the signature and TRUST the payload — no shared session database needed.

---

## Step 1 — Build a JWT By Hand

```python
# jwt_by_hand.py
import json
import base64
import hmac
import hashlib

SECRET = "my-secret-key"    # in production: a long, random, securely-stored value

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def build_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}

    header_b64 = base64url_encode(json.dumps(header).encode())
    payload_b64 = base64url_encode(json.dumps(payload).encode())

    signing_input = f"{header_b64}.{payload_b64}"
    signature = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()    # ← add: HMAC — a KEYED hash
    signature_b64 = base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"
```

```python
# main.py
from jwt_by_hand import build_jwt

print("=== Building a JWT By Hand ===")
payload = {"username": "alice", "exp": 1234567890}
print(f'header: {{"alg":"HS256","typ":"JWT"}}')
print(f"payload: {payload}")

token = build_jwt(payload)
print(f"JWT: {token[:20]}...{token[-20:]}")
```

### SAVE AND TRY

```bash
python main.py
```

**Expected (shape):**
```
=== Building a JWT By Hand ===
header: {"alg":"HS256","typ":"JWT"}
payload: {'username': 'alice', 'exp': 1234567890}
JWT: eyJhbGciOiJIUzI1Ni...ff29a1
```

**Confirm HMAC is a KEYED hash — different from LAB-46's password hashing:** `hmac.new(SECRET, ...)` requires the SECRET KEY to produce (or verify) a valid signature — unlike `bcrypt` (LAB-46), which needed NO secret, just the password itself. This is the crucial JWT property: ANYONE can READ a JWT's payload (Base64 is just ENCODING, not encryption — never put secrets in a JWT payload!), but only someone with the SECRET KEY can produce a VALID signature for it, which is exactly what lets the server trust a token it didn't just create itself.

---

## Step 2 — Verify: Tamper Detection

```python
# Add to jwt_by_hand.py:
def verify_jwt(token: str) -> dict | None:
    header_b64, payload_b64, signature_b64 = token.split('.')
    signing_input = f"{header_b64}.{payload_b64}"
    expected_signature = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    expected_signature_b64 = base64url_encode(expected_signature)

    if not hmac.compare_digest(signature_b64, expected_signature_b64):   # ← add: constant-time comparison — see "Watch for" below
        return None    # signature mismatch — REJECT

    padded = payload_b64 + '=' * (-len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))
```

Add to `main.py`:

```python
from jwt_by_hand import verify_jwt

print("\n=== Verifying: Untampered Token ===")
result = verify_jwt(token)
print(f"recomputed signature matches: {result is not None}")
print(f"token is {'VALID' if result else 'REJECTED'}")

print("\n=== Verifying: Tampered Token ===")
header_b64, payload_b64, signature_b64 = token.split('.')
tampered_payload = base64.urlsafe_b64encode(json.dumps({"username": "alice", "role": "admin", "exp": 1234567890}).encode()).rstrip(b'=').decode()
tampered_token = f"{header_b64}.{tampered_payload}.{signature_b64}"   # keeping the OLD signature — it won't match the NEW payload
print(f'payload changed to: {{"username":"alice","role":"admin","exp":1234567890}}')

tampered_result = verify_jwt(tampered_token)
print(f"recomputed signature matches: {tampered_result is not None}")
print(f"token is {'VALID' if tampered_result else 'REJECTED — tampering detected'}")
```

### SAVE AND TRY

```bash
python main.py
```

**Expected:**
```
=== Verifying: Untampered Token ===
recomputed signature matches: true
token is VALID

=== Verifying: Tampered Token ===
payload changed to: {"username":"alice","role":"admin","exp":1234567890}
recomputed signature matches: false
token is REJECTED — tampering detected
```

**Confirm WHY tampering is caught:** The tampered token keeps the OLD signature (computed over the ORIGINAL payload) but has a NEW payload — `verify_jwt` recomputes what the signature SHOULD be for the NEW payload, and it doesn't match the OLD signature that's still attached. Without knowing the SECRET KEY, an attacker CANNOT compute a valid new signature for their tampered payload — they can change the data, but they can't make the signature agree with the change.

**Watch for:** `hmac.compare_digest` (not `==`) is used deliberately — a plain `==` comparison can leak TIMING information (it returns `False` at the FIRST mismatched character, making it fractionally faster for "more wrong" guesses) that a sophisticated attacker could exploit to guess a valid signature byte-by-byte. `compare_digest` always takes the SAME amount of time regardless of how many characters match — a real, subtle security detail.

---

## Step 3 — A Real Login Flow With PyJWT

```bash
pip install fastapi uvicorn "passlib[bcrypt]" pyjwt
```

```python
# main.py
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
import time

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = "my-secret-key"

users_db = {"alice": {"username": "alice", "password_hash": pwd_context.hash("hunter2")}}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    user = users_db.get(req.username)
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid credentials")

    payload = {"username": req.username, "exp": time.time() + 900}    # ← add: 15-minute expiry, built INTO the token itself
    access_token = jwt.encode(payload, SECRET, algorithm="HS256")
    return {"access_token": access_token}
```

### SAVE AND TRY

```bash
uvicorn main:app --reload
curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}'
```

**Expected:**
```
=== Real Login Flow (PyJWT) ===
{"access_token":"eyJhbGc..."}
```

**Confirm `jwt.encode` did EXACTLY what Step 1's `build_jwt` did, by hand:** Header, payload, HMAC signature, Base64URL-joined with dots — `PyJWT` is a well-tested, production-hardened implementation of the SAME mechanism, not a different one. Building it by hand first (Step 1–2) means this line is no longer magic.

---

## Step 4 — Stateless Route Protection

```python
def get_current_user(authorization: str = Header(None)) -> str:      # ← add: LAB-20's DI, LAB-46's exact shape, now stateless
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="not authenticated")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])       # ← add: verifies signature AND checks expiry, in one call
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")
    return payload["username"]

@app.get("/me")
def me(username: str = Depends(get_current_user)):
    return {"username": username}
```

### SAVE AND TRY

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
curl http://localhost:8000/me -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```
=== Protected Route: Stateless Verification ===
{"username":"alice"}
  ← no session lookup anywhere — the token ITSELF proves identity
```

**Confirm the STATELESS claim directly:** Compare `get_current_user` here to LAB-46's version — LAB-46 did `sessions.get(token)`, a DICTIONARY LOOKUP requiring server-side memory of every issued token. THIS version does `jwt.decode(token, SECRET, ...)` — pure COMPUTATION, no lookup, no shared state, no database. ANY server holding the SAME `SECRET` could verify this exact token independently, which is precisely what makes JWTs attractive for systems with multiple servers behind a load balancer.

---

## 🎯 Challenge: Refresh Tokens

**You know:** A short-lived access token (15 min, Step 3) limits damage if it leaks — but forces the user to re-login every 15 minutes, which is bad UX. A LONGER-lived refresh token, used only to get NEW access tokens, balances security and convenience.

**Task:** Issue a refresh token (7-day expiry) alongside the access token at login. Add a `/refresh` endpoint that accepts a valid refresh token and issues a NEW access token, without requiring the password again.

<details>
<summary>▶ Show Solution</summary>

```python
@app.post("/login")
def login(req: LoginRequest):
    user = users_db.get(req.username)
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid credentials")

    access_payload = {"username": req.username, "type": "access", "exp": time.time() + 900}
    refresh_payload = {"username": req.username, "type": "refresh", "exp": time.time() + 604800}   # 7 days
    return {
        "access_token": jwt.encode(access_payload, SECRET, algorithm="HS256"),
        "refresh_token": jwt.encode(refresh_payload, SECRET, algorithm="HS256"),
    }

class RefreshRequest(BaseModel):
    refresh_token: str

@app.post("/refresh")
def refresh(req: RefreshRequest):
    try:
        payload = jwt.decode(req.refresh_token, SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid refresh token")

    if payload.get("type") != "refresh":                    # ← add: reject an ACCESS token being used where a REFRESH token is expected
        raise HTTPException(status_code=401, detail="wrong token type")

    new_access_payload = {"username": payload["username"], "type": "access", "exp": time.time() + 900}
    return {"access_token": jwt.encode(new_access_payload, SECRET, algorithm="HS256")}
```

**Key insight:** The `"type": "access"` vs. `"type": "refresh"` field is a small but critical detail — without it, a leaked ACCESS token (short-lived, but potentially exposed more often, e.g. in browser memory) could be used at `/refresh` to mint an INDEFINITE stream of new access tokens, defeating the whole point of a short expiry. Checking `type` ensures each token can only be used for its INTENDED purpose — this is LAB-18's Interface Segregation instinct, applied to token capabilities: a token should only be trusted to do exactly what it was issued for.

</details>

### SAVE AND TRY

```bash
curl -X POST http://localhost:8000/refresh -H "Content-Type: application/json" -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"
```

**Expected:**
```
=== Refresh Tokens ===
access token expires after 15 minutes; refresh token after 7 days
{"access_token":"eyJhbGc... (new, extended)"}
```

---

## Mental Model: JWT vs. Sessions, Side by Side

| LAB-46 (sessions) | This lab (JWT) |
|---|---|
| Server stores `token -> username` in memory | Server stores NOTHING — the token contains the data |
| Every request requires a lookup | Every request requires a SIGNATURE CHECK (pure computation) |
| Doesn't scale across multiple servers without a shared store | Scales naturally — any server with the secret can verify |
| Revoking a token is instant (delete from the dict) | Revoking BEFORE natural expiry requires extra machinery (a blocklist) — a genuine trade-off |

---

## Final Check

| Feature | How to verify |
|---|---|
| A hand-built JWT correctly encodes header, payload, and HMAC signature | Step 1 |
| An untampered token verifies successfully | Step 2 |
| A tampered token is correctly REJECTED | Step 2 |
| `PyJWT`'s real login flow issues a working access token | Step 3 |
| A protected route verifies identity with zero server-side session storage | Step 4 |
| Refresh tokens correctly issue new access tokens without re-entering a password | Challenge |
| Refresh tokens reject being used as access tokens, and vice versa | Challenge |

---

## Quick Check Answers

**1. A JWT payload can contain real data — what does this let a server SKIP?**

The server-side LOOKUP that LAB-46's session model required (`sessions.get(token)`) — since the JWT payload already CONTAINS the username (and any other claims), verifying the signature is enough to TRUST that data directly, with no database or in-memory dict needed at all. This is confirmed directly in Step 4, where `get_current_user` never touches any stored session data.

**2. Tampering with a JWT's payload — what stops the server from accepting it?**

The SIGNATURE won't match anymore. The signature is an HMAC computed over the ORIGINAL header+payload using a SECRET only the server knows — changing the payload without ALSO recomputing a matching signature (impossible without the secret) means the server's OWN recomputed signature (Step 2's `verify_jwt`) will disagree with the one attached to the tampered token, and the token is rejected.

**3. Why can a JWT never contain a password or credit card number?**

Because a JWT's payload is only Base64-ENCODED, not ENCRYPTED — Base64 is trivially reversible by ANYONE (it's not a secret transformation, just a different text representation), so ANY JWT's payload can be read by anyone who intercepts it, with no key needed at all. The SIGNATURE proves the data wasn't TAMPERED WITH; it does nothing to keep the data CONFIDENTIAL — those are two completely different guarantees, and JWTs by design only provide the first one.

---

*Next: [LAB-51 — WebSocket Server](LAB-51-websocket-server.md) — Python (FastAPI), same module*
