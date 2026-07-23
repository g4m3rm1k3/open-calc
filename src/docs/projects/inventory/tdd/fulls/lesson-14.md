# Lesson 14: Logging In

**What you will build**
A `/login` endpoint that verifies a password and issues a signed token, plus a `Depends()`-based dependency that extracts and verifies the caller's identity on protected routes — replacing the client-supplied `author_id`/`editor_id`/`follower_id` pattern flagged as a known gap since Lesson 4. The problem we're solving: every mutating endpoint so far has trusted whatever identity the client claimed. Today, identity finally has to be *proven*, not just asserted.

**What you need to know first**
Lesson 13 (`bcrypt`, `credentials`). Lesson 1 (Inversion of Control — `Depends()` is the same pattern, applied to authentication).

---

## Concept Unit: Verifying a Password Without Leaking Information

### The Problem

Logging in means comparing a submitted password against the stored hash — but *how* we respond to a wrong username versus a right username with a wrong password matters. Responding differently to each ("no such user" vs. "wrong password") lets an attacker discover which usernames exist at all, one guess at a time.

### The failing test

```python
def test_login_with_correct_password():
    client.post("/accounts", json={"username": "carol", "password": "hunter2000"})
    response = client.post("/login", json={"username": "carol", "password": "hunter2000"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_with_wrong_password_is_generic():
    client.post("/accounts", json={"username": "dave", "password": "correcthorse"})
    wrong_password = client.post("/login", json={"username": "dave", "password": "nope"})
    wrong_username = client.post("/login", json={"username": "nosuchuser", "password": "nope"})
    assert wrong_password.status_code == wrong_username.status_code == 401
    assert wrong_password.json()["detail"] == wrong_username.json()["detail"]
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_login_with_correct_password
404 != 200
```

### Introduce the concept in isolation

Create `lab_verify.py`:

```python
import bcrypt

stored_hash = bcrypt.hashpw(b"correcthorse", bcrypt.gensalt())

def check_login(password_attempt: bytes, stored_hash: bytes) -> bool:
    return bcrypt.checkpw(password_attempt, stored_hash)

print(check_login(b"correcthorse", stored_hash))
print(check_login(b"wrongguess", stored_hash))
```

Run it:

```bash
python lab_verify.py
```

Output:

```text
True
False
```

*What this proves:* `bcrypt.checkpw` — already used briefly in Lesson 13's isolation lab — is the actual verification step: it re-derives the hash of the attempt using the salt embedded in `stored_hash`, and compares. Nothing about the real password is ever recovered or needed; only this yes/no comparison.

### Discard the throwaway example

Delete `lab_verify.py`. Build the real endpoint, being deliberate about response uniformity.

### Project Change

* **Files affected:** `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# schemas.py — add
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
```

```python
# main.py — add (token creation itself introduced in the next unit)
@app.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    conn = get_connection()
    row = conn.execute("""
        SELECT members.id, credentials.password_hash
        FROM members
        JOIN credentials ON members.id = credentials.member_id
        WHERE members.username = ?
    """, (credentials.username,)).fetchone()
    conn.close()

    if row is None or not bcrypt.checkpw(credentials.password.encode(), row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(row["id"])
    return {"access_token": token}
```

### Mechanical walkthrough

1. `if row is None or not bcrypt.checkpw(...)`: (first appearance of a deliberately unified failure path). A nonexistent username (`row is None`) and a wrong password for a real username both fall into this exact same branch, producing the identical `401` with the identical message — no way to distinguish the two cases from the response alone.
2. `SELECT members.id, credentials.password_hash FROM members JOIN credentials ...`: (already-established join pattern). Fetches both pieces needed — the id to eventually issue a token for, and the hash to check against — in one query.

### CS Lens

**Information leakage through response differences, not just response content.** This is a security property that has nothing to do with what data is *inside* the response — it's about whether the *shape or timing* of the response itself reveals something. (A subtler version of the same idea: even with an identical message, if checking a nonexistent username returned faster than checking a real one with a wrong password — because the real case had to run `bcrypt.checkpw` and the fake one didn't — an attacker could still distinguish the two by *how long* the response took. Real production systems address this with a dummy hash comparison on the "no such user" path specifically to equalize timing; naming it here is enough for now, but it's a real, non-obvious detail.)

### SE Lens

**Generic error messages are a deliberate security tradeoff against debuggability.** `"Invalid username or password"` is less immediately helpful to a legitimate user who mistyped their username than `"no such user"` would be — that's the cost, accepted on purpose, in exchange for not handing the same information to an attacker.

### Commands needed

```bash
pytest tests/
```

```text
Still failing — create_access_token doesn't exist yet.
```

---

## Concept Unit: Signed Tokens (JWT)

### The Problem

`login` needs to hand the client *something* that later requests can present to prove "I already logged in as member 7" — without the server having to remember every logged-in session in memory (which wouldn't survive a restart, and wouldn't scale across multiple server instances the way Phase 3's "stateless service" goal requires). We need something the client holds, that the server can verify cheaply, without storing anything server-side at all.

### Introduce the concept in isolation

Create `lab_jwt.py`:

```python
import jwt

SECRET = "dev-secret-change-me"

token = jwt.encode({"member_id": 7}, SECRET, algorithm="HS256")
print(token)

decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
print(decoded)

tampered = token[:-4] + "abcd"
try:
    jwt.decode(tampered, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError:
    print("Tampering detected")
```

Run it:

```bash
python lab_jwt.py
```

Output:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJfaWQiOjd9.4f9c...
{'member_id': 7}
Tampering detected
```

*What this proves — including something easy to misunderstand:* a JWT (JSON Web Token) is three dot-separated parts, and the middle part is just base64-encoded JSON — readable by *anyone*, not encrypted. Try decoding the middle segment of the printed token by hand (it's plain base64) and you'll see `{"member_id": 7}` directly. What makes it trustworthy isn't secrecy of the payload — it's the third part, a **signature**, computed from the first two parts plus `SECRET` using HMAC. Changing even one character of the payload (as the tampering attempt does) produces a token whose signature no longer matches, which `jwt.decode` detects and rejects. A JWT proves the payload hasn't been altered since the server signed it; it does not hide the payload from anyone who has the token.

### Explain the mechanism

This is signing, not encryption — a distinction worth being precise about, since the two are easy to conflate. Encryption would make the payload unreadable without a key. Signing leaves the payload fully readable, but makes it tamper-evident: any change invalidates the signature, and only someone holding `SECRET` can produce a valid one in the first place. This is why a JWT should never contain a password, a raw secret, or anything genuinely confidential in its payload — only claims about identity that are fine to be visible, just not fine to be forged.

### Discard the throwaway example

Delete `lab_jwt.py`. Build the real token issuance, with an expiration.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.
* **Dependencies:** `pyjwt`.

### The New Code

```python
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "dev-secret-change-me"  # Lesson 22 revisits how this should really be configured
ALGORITHM = "HS256"

def create_access_token(member_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"member_id": member_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

### Mechanical walkthrough

1. `"exp": expire`: (first appearance). `exp` is a JWT standard claim name — `jwt.decode` automatically checks it and raises if the token has expired, without any code of ours checking dates manually.
2. `timedelta(hours=24)`: (first appearance in this context, already-known Python). An issued token stops being valid 24 hours after issuance — after that, the member has to log in again. This bounds how long a stolen token remains useful, a real security property, not just a formality.

### CS Lens

**Stateless authentication.** Because the token is self-verifying (the signature *is* the proof), the server never has to store "who is currently logged in" anywhere — verifying a token requires only the token itself and `SECRET_KEY`, both already available on any server instance. This is the concrete mechanism behind the "stateless service" idea named back in the curriculum map's Phase 3 goals: any server replica can verify any valid token without needing to share session state with any other replica.

### SE Lens

**Stateless tokens trade revocability for scalability.** A traditional server-stored session can be instantly invalidated (delete the session record; the user is logged out everywhere, immediately). A JWT, once issued, remains valid until it expires — there's no built-in way to "unissue" one early without additional infrastructure (a blocklist, shortened expiries, etc.). Choosing JWTs here is a real tradeoff, made in favor of the stateless architecture this project is heading toward, not a strictly superior choice in every situation.

### Commands needed

```bash
pip install pyjwt
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 22 items

tests/test_api.py ......................                                 [100%]

============================== 22 passed in 0.22s ===============================
```

### Connecting sentence

Login now issues a real, verifiable token. But nothing yet reads that token back on a later request — every route still trusts whatever id the client puts directly in the request body, exactly the gap flagged since Lesson 4.

---

## Concept Unit: Verifying Identity With `Depends()`

### The Problem

Every mutating route needs the same check: read a token from the request, verify its signature and expiration, look up the member it identifies — before running any of that route's own logic. Writing this by hand at the top of every single route function would be exactly the kind of repeated logic Lessons 6, 9, and 11 already flagged as worth generalizing.

### Introduce the concept in isolation

Create `lab_depends.py`:

```python
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

def require_secret_header(x_secret: str = Header(...)):
    if x_secret != "letmein":
        raise HTTPException(status_code=401, detail="Bad secret")
    return "verified-caller"

@app.get("/protected")
def protected(caller: str = Depends(require_secret_header)):
    return {"caller_was": caller}

client = TestClient(app)
print(client.get("/protected", headers={"x-secret": "letmein"}).json())
print(client.get("/protected", headers={"x-secret": "wrong"}).status_code)
print(client.get("/protected").status_code)
```

Run it:

```bash
python lab_depends.py
```

Output:

```text
{'caller_was': 'verified-caller'}
401
422
```

*What this proves:* `Depends(require_secret_header)` runs `require_secret_header` *before* `protected()`'s own code, on every request to this route. If it raises (bad secret), `protected()` never runs at all. If it succeeds, whatever it `return`s (here, a string) is handed directly into `protected()` as the `caller` argument — this is Lesson 1's inversion-of-control idea again: you're not calling `require_secret_header` yourself, FastAPI is, and injecting its result into your function for you.

### Discard the throwaway example

Delete `lab_depends.py`. Build the real identity dependency.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify (add the dependency; migrate `create_post` as the first real usage).

### The New Code

```python
from fastapi import Header

def get_current_member(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed token")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_connection()
    row = conn.execute("SELECT id, username FROM members WHERE id = ?", (payload["member_id"],)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=401, detail="Member no longer exists")
    return dict(row)
```

```python
# main.py — migrate create_post as the first real, protected endpoint
class PostCreate(BaseModel):
    content: str = Field(min_length=1)  # author_id removed — no longer client-supplied

@app.post("/posts", response_model=PostRead, status_code=201)
def create_post(post: PostCreate, current_member: dict = Depends(get_current_member)):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO posts (author_id, content) VALUES (?, ?)",
        (current_member["id"], post.content),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "author_id": current_member["id"], "content": post.content}
```

### Mechanical walkthrough

1. `authorization: str = Header(...)`: (first appearance). Reads the `Authorization` HTTP header directly, the conventional place to carry a bearer token; `...` (Ellipsis) as the default means this header is required, missing it produces `422` automatically.
2. `jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])` inside `try`/`except jwt.PyJWTError`: (already-established `jwt.decode` from isolation, now handling failure explicitly). Both an invalid signature and an expired `exp` claim raise a subclass of `PyJWTError`, caught here uniformly.
3. `current_member: dict = Depends(get_current_member)`: (already-established `Depends()` pattern from isolation, real usage). `create_post` no longer has any `author_id` field to trust from the client at all — it's structurally impossible to post as someone else through this endpoint now, not just discouraged by a check.
4. `PostCreate` losing its `author_id` field entirely: (first appearance of a schema shrinking, not growing). This is worth noticing: the fix for the trust problem wasn't adding a check on top of the old shape, it was removing the field that made the vulnerability possible in the first place.

### CS Lens

**Dependency injection as the concrete mechanism behind decoupling.** `create_post` doesn't know or care *how* `current_member` was determined — whether from a JWT, a database session lookup, or (in tests) something else entirely swapped in via `dependency_overrides`, which Lesson 18 formalizes. The route only knows it receives a trustworthy `dict`. This is the same Dependency Inversion idea named back when `db.py` was split out in Lesson 2 — now applied to identity instead of storage.

### SE Lens

**A structural fix beats a check, whenever a structural fix is available.** Lesson 6 added a *check* (`if row["author_id"] != update.editor_id`) because the underlying design still let a client claim any identity. Today's fix is different in kind: removing `author_id` from `PostCreate` doesn't add a rule to violate correctly — it removes the possibility of violating it at all. Whenever you're choosing between "add a check" and "remove the thing that needs checking," the second is almost always the stronger fix.

### Commands needed

```bash
pytest tests/
```

*Note:* every existing test that calls `client.post("/posts", json={"author_id": ..., ...})` will now fail, needing an `Authorization` header and a dropped `author_id` field — expected, and part of this lesson's exercises.

### Run it. Show the real output (after updating the affected tests).

```text
============================= test session starts ==============================
collected 22 items

tests/test_api.py ......................                                 [100%]

============================== 22 passed in 0.23s ===============================
```

### Connecting sentence

`create_post` is now genuinely authenticated — but `update_post`, `delete_post`, `like_post`, and `follow_member` still trust a client-supplied id, the exact gap this lesson exists to close everywhere, not just in one place.

---

## Closing

**Connect the pieces**
`POST /login` verifies a password against its bcrypt hash without leaking which part was wrong, then issues a signed, expiring JWT via `create_access_token`. A later request to `POST /posts` includes that token in its `Authorization` header; `get_current_member`, injected via `Depends()`, verifies the signature, checks expiration, and looks up the real member — and only *that* verified identity, never anything the client claims directly, is used as the post's author.

**What breaks without this**
Every route still using a client-supplied id (`update_post`, `delete_post`, `like_post`, `follow_member`) remains exactly as spoofable as it's been since Lessons 4, 6, and 9 first flagged it — today's fix only closed the gap for post creation, deliberately, as the pattern to repeat rather than a change applied everywhere at once.

**Exercises**
1. Migrate `update_post`, `delete_post`, `like_post`, and `follow_member` to use `Depends(get_current_member)` in place of their client-supplied id fields, following `create_post`'s exact pattern. Update the affected tests to include a real `Authorization` header (log in first, then use the returned token).
2. Manually construct a JWT with a `member_id` that doesn't exist (using `jwt.encode` directly with your dev `SECRET_KEY`), send it as a Bearer token, and confirm `get_current_member` correctly rejects it with `401` rather than crashing.

**Definition of Done**
* [x] `/login` verifies credentials with a uniform, non-leaking failure response.
* [x] Tokens are signed JWTs with a 24-hour expiration.
* [x] `get_current_member` verifies identity via `Depends()`; `create_post` uses it, fully retiring client-supplied `author_id`.
* [x] Commit: `feat: JWT login and dependency-injected authentication, starting with post creation`

---

## Context Snapshot (End of Lesson 14)

**3. API Manifest (additions/changes):**
- `POST /login` → `TokenResponse {access_token}`; `401` on invalid credentials
- `POST /posts` now requires `Authorization: Bearer <token>`; `PostCreate` no longer accepts `author_id`
- `PUT /posts/{id}`, `DELETE /posts/{id}`, `POST /posts/{id}/likes`, `POST /members/{id}/follow` — **not yet migrated**, still client-supplied ids (flagged as this lesson's exercises)

**4. Dependencies (addition):** `pyjwt`.

**5. Test State:** 22 tests, 22 passing (after updating tests affected by `create_post`'s new auth requirement).

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Uniform failure response | L14 | Identical response for "no such user" and "wrong password," to avoid leaking which |
| JWT (JSON Web Token) | L14 | A signed, readable (not encrypted) token proving a payload hasn't been altered |
| Signing vs. encryption | L14 | Signing = tamper-evident and readable; encryption = unreadable without a key |
| `exp` claim | L14 | Standard JWT field for expiration, checked automatically by `jwt.decode` |
| Stateless authentication | L14 | Verifying identity from the token alone, with no server-side session storage |
| `Header(...)` | L14 | Reads a required HTTP header directly as a function parameter |
| `Depends()` for identity | L14 | Injecting a verified caller identity into a route, structurally preventing identity spoofing |

**7. Lesson Completion State:**
- Completed: Lessons 1-14, Interludes A, B, C
- Next: Lesson 15 — Protecting My Account (RBAC, authorization vs authentication, finishing the migration started here)

**8. Current Architecture State:**
- HTTP Layer: 20 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: unchanged from Lesson 13
- ORM: not introduced
- Authentication: real, for `create_post` only — the rest of Phase 5 finishes the rollout
