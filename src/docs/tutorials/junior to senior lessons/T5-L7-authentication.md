# Junior to Senior — T5·L7 — Authentication: JWT and Password Hashing

**Prerequisites:** T5·L6 (Async Python). You understand the event loop. This
lesson adds real authentication to the task API — the minimum needed for a
multi-user application to be safe to deploy.

**What this lab adds:**
- Password hashing with `bcrypt` via `passlib` — one-way, salted, slow by design
- JWT (JSON Web Token): signed token the server issues; the client stores and sends
- JWT structure: `header.payload.signature` — the signature prevents tampering
- OAuth2 password flow: username + password → access token
- A real `get_current_user` dependency that verifies JWT tokens

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. An attacker steals your database. All passwords are stored as bcrypt hashes.
>    How long would it take to crack a strong 12-character password?
> 2. A user's account is deleted at minute 15. Their JWT token expires at minute 30.
>    For the next 15 minutes, what can they still do with that token?
> 3. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTEifQ.SflKxw` — a user
>    changes the middle part to put `u-2` as the user ID. Does the server accept it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A complete authentication flow that works end-to-end:

```bash
# Register:
POST /auth/register  {"email":"alice@e.com","password":"secret123"}
→ 201 {"id":"u-1","email":"alice@e.com"}

# Login:
POST /auth/token  username=alice@e.com&password=secret123
→ {"access_token":"eyJ...","token_type":"bearer"}

# Authenticated request:
GET /tasks/  Authorization: Bearer eyJ...
→ [{...tasks...}]

# Bad token:
GET /tasks/  Authorization: Bearer wrong-token
→ 401 {"detail":"Invalid or expired token"}
```

---

### Concept: Why You Must Never Store Plaintext Passwords

**What it is:** When a user registers, you must NEVER store their password as-is.
If your database is stolen, stolen passwords would compromise the user's other
accounts too (password reuse is common).

**The problem — storing plaintext:**

```python
user['password'] = 'secret123'   # ← if the DB is stolen, attacker has the password
```

**The solution — bcrypt:**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# On registration: hash and store
hashed = pwd_context.hash('secret123')
# → '$2b$12$LQv3c1yqBW[...long hash...]'
# Different hash every time (random salt built-in)

# On login: verify
pwd_context.verify('secret123', hashed)   # → True
pwd_context.verify('wrong',     hashed)   # → False
```

**Why bcrypt specifically:**
- It is intentionally SLOW (~100ms per verification). Brute-force attacks are impractical.
- It includes a random salt automatically — rainbow table attacks are impossible.
- The work factor is configurable — as hardware gets faster, you can increase it.

**What it hides:** The salt generation, key stretching, and hash encoding. `pwd_context.hash()`
handles all three. You only provide the plaintext; bcrypt does the rest.

**The invariant bcrypt protects:** No code path exists to recover the plaintext from
the hash — it is mathematically one-way. Even the developers cannot see passwords.

**Canonical example:** A message-in-a-bottle with a one-way lock. Anyone can put a
message in (hash a password). Nobody can take it out (cannot reverse the hash).
To verify the message, you put in a comparison message and check if the lock clicks.

**You will see this again in:**
- Every web framework has a built-in or recommended hashing library
- Django: `make_password()` and `check_password()` use PBKDF2 (same principle as bcrypt)
- Node.js: `bcrypt.hash()` and `bcrypt.compare()`
- Standard security requirement: any system storing passwords must use a proper KDF (Key Derivation Function)

**Watch for:**
1. Never use `md5` or `sha256` for passwords — they are fast hash functions, not KDFs.
   Attackers can try billions of candidates per second.
2. Never write your own hashing algorithm.
3. The `CryptContext(schemes=['bcrypt'])` — use `passlib`, not Python's built-in `hashlib`,
   for passwords.

---

## Step 1 — See the Problem First

```bash
python -c "
import hashlib

# Bad approach — MD5 is fast:
import time
password = 'secret123'
hashed   = hashlib.md5(password.encode()).hexdigest()
print('MD5 hash:', hashed)

# How fast can an attacker try candidates?
start = time.perf_counter()
for _ in range(1_000_000):
    hashlib.md5(b'guess').hexdigest()
elapsed = time.perf_counter() - start
print(f'1 million MD5 hashes in {elapsed:.2f}s — {int(1_000_000/elapsed):,}/second')
print('At this rate, a 6-char alphanumeric password cracks in seconds.')
"
```

**You should see:** MD5 computes millions of hashes per second — completely useless
for passwords.

---

### Concept: JWT — Stateless Authentication

**What it is:** A JSON Web Token is a Base64url-encoded JSON string with a cryptographic
signature. The server signs it with a secret key when the user logs in. The client stores
it and sends it with every request. The server verifies the signature to confirm it is genuine.

**JWT structure — three parts separated by dots:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9       ← Header: {"alg":"HS256","typ":"JWT"}
.eyJzdWIiOiJ1LTEiLCJleHAiOjE2OTkwfQ        ← Payload: {"sub":"u-1","exp":1699...}
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQ    ← Signature: HMAC(header.payload, secret_key)
```

**How the server verifies a token:**

```python
# Server recomputes: HMAC(header.payload, secret_key)
# If recomputed == signature → token is genuine and unmodified
# If different → someone tampered with the payload → reject
```

**The problem — stateful sessions (the alternative):**

```python
# Session-based: server stores session data in a database
# Every request: query the database to find the session
sessions_db['session-123'] = {'user_id': 'u-1', 'expires': ...}
```

With sessions, the server must query the database on every request. JWTs are stateless —
the server only needs the secret key, not a database lookup.

**What it hides:** The cryptographic verification. You call `decode_token(token)` and
get back the claims — or a `JWTError` if invalid. The HMAC computation is internal.

**The JWT trade-off:** Stateless (no DB lookup) but tokens cannot be invalidated before
expiry without building a token blacklist. Sessions can be invalidated instantly.

**You will see this again in:**
- Every modern web API uses JWT for authentication
- OAuth2 (GitHub login, Google login) uses JWTs as access tokens
- Microservices pass JWTs between services to prove identity
- Standard interview topic: "Explain JWT and its trade-offs"

**Watch for:** JWT payload is Base64-encoded, NOT encrypted. Anyone who has the token
can read the payload. Never put sensitive data (passwords, payment info) in the payload.
The signature only proves authenticity — not confidentiality.

---

## Step 2 — Build the Auth System

Install dependencies:

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

Create `src/auth/password.py`:

```python
# src/auth/password.py
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(plain: str) -> str:
    """Hashes a plaintext password with bcrypt. Returns the hash string."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Returns True if plain matches the bcrypt hash."""
    return _pwd_context.verify(plain, hashed)
```

### SAVE AND TRY

```bash
python -c "
from src.auth.password import hash_password, verify_password
import time

# Hash takes ~100ms by design:
start = time.perf_counter()
h = hash_password('secret123')
elapsed = (time.perf_counter() - start) * 1000
print(f'Hash computed in {elapsed:.0f}ms')
print('Hash starts with bcrypt marker:', h[:4])

# Verify:
print('Correct password:', verify_password('secret123', h))
print('Wrong password:',   verify_password('wrong',     h))

# Two hashes of the same password are DIFFERENT (different salts):
h2 = hash_password('secret123')
print('Different hashes:', h != h2)
print('But both verify:', verify_password('secret123', h2))
"
```

**You should see:**
```
Hash computed in ~100ms
Hash starts with bcrypt marker: $2b$
Correct password: True
Wrong password: False
Different hashes: True
But both verify: True
```

Now create `src/auth/tokens.py`:

```python
# src/auth/tokens.py
from __future__ import annotations
from datetime  import datetime, timedelta
from dataclasses import dataclass
from jose      import jwt, JWTError
from src.config import config

ALGORITHM = 'HS256'


@dataclass(frozen=True)
class TokenClaims:
    user_id: str
    email:   str


def create_access_token(user_id: str, email: str, expires_minutes: int = 30) -> str:
    """Creates a signed JWT with user_id and email claims."""
    payload = {
        'sub':   user_id,
        'email': email,
        'exp':   datetime.utcnow() + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, config.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> TokenClaims:
    """Decodes and verifies a JWT. Raises ValueError if invalid or expired."""
    try:
        data = jwt.decode(token, config.secret_key, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError(f'Invalid token: {e}') from e

    user_id = data.get('sub')
    email   = data.get('email')

    if not user_id or not email:
        raise ValueError('Token is missing required claims')

    return TokenClaims(user_id=user_id, email=email)
```

### SAVE AND TRY

```bash
python -c "
from src.auth.tokens import create_access_token, decode_access_token

# Create a valid token:
token  = create_access_token('u-1', 'alice@e.com')
claims = decode_access_token(token)
print('user_id:', claims.user_id)
print('email:',   claims.email)

# Tampered token:
tampered = token[:-5] + 'XXXXX'   # corrupt the signature
try:
    decode_access_token(tampered)
except ValueError as e:
    print('tampered token rejected:', e)

# Expired token:
expired = create_access_token('u-1', 'alice@e.com', expires_minutes=-1)
try:
    decode_access_token(expired)
except ValueError as e:
    print('expired token rejected:', e)
"
```

**You should see:**
```
user_id: u-1
email: alice@e.com
tampered token rejected: Invalid token: Signature verification failed.
expired token rejected: Invalid token: Signature has expired.
```

---

## Step 3 — Build the Auth Router

Create `src/api/auth_router.py`:

```python
# src/api/auth_router.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from src.auth.password import hash_password, verify_password
from src.auth.tokens   import create_access_token

router = APIRouter(prefix='/auth', tags=['auth'])

# In-memory user store — replaced with the database in a real app:
_users: dict[str, dict] = {}


class RegisterRequest(BaseModel):
    email:    str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id:    str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = 'bearer'


@router.post('/register', response_model=UserResponse, status_code=201)
def register(body: RegisterRequest) -> UserResponse:
    """Registers a new user. Stores only the bcrypt hash — never the plaintext."""
    if body.email in _users:
        raise HTTPException(status_code=409, detail='Email already registered')

    user_id = f'u-{len(_users) + 1}'
    _users[body.email] = {
        'id':       user_id,
        'email':    body.email,
        'password': hash_password(body.password),   # ← hash, NEVER store plaintext
    }
    return UserResponse(id=user_id, email=body.email)


@router.post('/token', response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """OAuth2 password flow: receives username+password, returns access token."""
    user = _users.get(form.username)

    if user is None or not verify_password(form.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    token = create_access_token(user_id=user['id'], email=user['email'])
    return TokenResponse(access_token=token)
```

Update `src/api/auth_dependency.py` to use real JWT verification:

```python
# src/api/auth_dependency.py
from __future__ import annotations
from dataclasses import dataclass
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from src.auth.tokens import decode_access_token, TokenClaims

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/token')


def get_current_user(token: str = Depends(_oauth2_scheme)) -> TokenClaims:
    """Decodes and validates the bearer token. Returns claims or raises 401."""
    try:
        return decode_access_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={'WWW-Authenticate': 'Bearer'},
        )
```

Update `src/main.py` to include the auth router:

```python
# src/main.py — add this line
from src.api.auth_router import router as auth_router
app.include_router(auth_router)
```

---

## Step 4 — Write the Tests

Create `tests/test_auth.py`:

```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
import src.api.auth_router as auth_module
from src.auth.password import hash_password, verify_password
from src.auth.tokens   import create_access_token, decode_access_token


@pytest.fixture(autouse=True)
def reset_users():
    auth_module._users.clear()
    yield


client = TestClient(app)


class TestPasswordHashing:

    def test_hashed_password_is_not_plaintext(self) -> None:
        hashed = hash_password('secret123')
        assert hashed != 'secret123'
        assert hashed.startswith('$2b$')    # bcrypt hash prefix

    def test_verify_correct_password_returns_true(self) -> None:
        hashed = hash_password('secret123')
        assert verify_password('secret123', hashed) is True

    def test_verify_wrong_password_returns_false(self) -> None:
        hashed = hash_password('secret123')
        assert verify_password('wrong', hashed) is False

    def test_two_hashes_of_same_password_are_different(self) -> None:
        h1 = hash_password('secret123')
        h2 = hash_password('secret123')
        assert h1 != h2               # different salts
        assert verify_password('secret123', h1) is True
        assert verify_password('secret123', h2) is True


class TestTokens:

    def test_creates_valid_token_and_decodes_claims(self) -> None:
        token  = create_access_token('u-1', 'alice@e.com')
        claims = decode_access_token(token)
        assert claims.user_id == 'u-1'
        assert claims.email   == 'alice@e.com'

    def test_tampered_signature_raises(self) -> None:
        token    = create_access_token('u-1', 'alice@e.com')
        tampered = token[:-5] + 'XXXXX'
        with pytest.raises(ValueError):
            decode_access_token(tampered)

    def test_expired_token_raises(self) -> None:
        token = create_access_token('u-1', 'alice@e.com', expires_minutes=-1)
        with pytest.raises(ValueError, match='expired'):
            decode_access_token(token)


class TestAuthEndpoints:

    def test_register_creates_user_without_exposing_password(self) -> None:
        response = client.post('/auth/register', json={
            'email': 'alice@e.com', 'password': 'secret123'
        })
        assert response.status_code == 201
        assert response.json()['email'] == 'alice@e.com'
        assert 'password' not in response.json()   # ← password never returned

    def test_register_rejects_duplicate_email(self) -> None:
        client.post('/auth/register', json={'email': 'alice@e.com', 'password': 'secret123'})
        response = client.post('/auth/register', json={'email': 'alice@e.com', 'password': 'other'})
        assert response.status_code == 409

    def test_login_returns_access_token(self) -> None:
        client.post('/auth/register', json={'email': 'alice@e.com', 'password': 'secret123'})
        response = client.post('/auth/token', data={
            'username': 'alice@e.com',
            'password': 'secret123',
        })
        assert response.status_code == 200
        assert 'access_token' in response.json()
        assert response.json()['token_type'] == 'bearer'

    def test_login_rejects_wrong_password(self) -> None:
        client.post('/auth/register', json={'email': 'alice@e.com', 'password': 'secret123'})
        response = client.post('/auth/token', data={
            'username': 'alice@e.com',
            'password': 'wrong-password',
        })
        assert response.status_code == 401
```

### SAVE AND TRY

```bash
pytest tests/test_auth.py -v
```

**You should see:**
```
tests/test_auth.py::TestPasswordHashing::test_hashed_password_is_not_plaintext PASSED
...
tests/test_auth.py::TestAuthEndpoints::test_login_rejects_wrong_password PASSED

12 passed
```

---

## 🎯 Challenge: Add Token Refresh

**You know:** JWT creation, `get_current_user`, route decorators.

**Task:** Add `POST /auth/refresh` that accepts a valid access token and returns
a new token with a fresh expiry (no password required):

```
POST /auth/refresh  Authorization: Bearer eyJ...  → 200 {"access_token":"eyJ...new..."}
```

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
@router.post('/refresh', response_model=TokenResponse)
def refresh_token(
    current_user: TokenClaims = Depends(get_current_user),
) -> TokenResponse:
    """Issues a new access token with a fresh expiry for the current user."""
    new_token = create_access_token(
        user_id=current_user.user_id,
        email=current_user.email,
    )
    return TokenResponse(access_token=new_token)
```

**Tests:**
```python
def test_refresh_returns_new_token() -> None:
    client.post('/auth/register', json={'email': 'a@e.com', 'password': 'secret123'})
    login    = client.post('/auth/token', data={'username': 'a@e.com', 'password': 'secret123'})
    token    = login.json()['access_token']
    response = client.post('/auth/refresh', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    new_token = response.json()['access_token']
    assert new_token != token   # genuinely new token

def test_refresh_without_token_returns_401() -> None:
    assert client.post('/auth/refresh').status_code == 401

def test_refresh_with_invalid_token_returns_401() -> None:
    assert client.post('/auth/refresh',
        headers={'Authorization': 'Bearer invalid.token.here'}
    ).status_code == 401
```

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| Bcrypt is one-way | `hash_password(p)` ≠ `p`; `verify_password(wrong, hash)` → False |
| Different salts | Two hashes of same password are different strings |
| JWT signature prevents tampering | Corrupt signature → `ValueError` |
| Expired JWT rejected | `expires_minutes=-1` → ValueError on decode |
| Password never in response | `/auth/register` response has no `password` key |
| Bad login rejected | Wrong password → 401 |

---

## Quick Check Answers

**1. Attacker steals bcrypt hashes. How long to crack a strong 12-char password?**

Bcrypt is designed to take ~100ms per attempt. A 12-character alphanumeric password
has ~62^12 ≈ 3.2 × 10^21 possible values. At 10 attempts/second (bcrypt is slow),
cracking would take ~10^19 years — longer than the age of the universe. In practice,
bcrypt makes brute-force infeasible for strong passwords. Weak passwords (common words,
keyboard patterns) can still be cracked via dictionary attacks.

**2. Account deleted at minute 15. JWT expires at minute 30. What can they still do?**

They can make any authenticated API request for 15 more minutes. JWTs are stateless —
the server only checks the signature and expiry, never queries the database to confirm
the user still exists. This is the known trade-off of JWTs: instant issuance with no
server state, but no instant revocation. Mitigations: short expiry times (15-30 minutes),
a token blacklist (adds database lookup — partially defeats statelessness), or refresh tokens.

**3. User modifies the payload to `u-2`. Does the server accept it?**

No. The JWT signature is `HMAC(base64(header).base64(payload), secret_key)`. Changing
the payload produces a different `base64(payload)`, making the stored signature incorrect.
The server recomputes the signature from the received header and (modified) payload —
it does not match the received signature. `JWTError: Signature verification failed.` The
tampered token is rejected.
