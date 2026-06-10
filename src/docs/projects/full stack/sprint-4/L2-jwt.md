# Sprint 4 · Lesson 2 — JWT: stateless authentication

## What you will build

By the end of this lesson, a `POST /auth/login` endpoint issues a JWT when given valid credentials. You will decode a real JWT by hand, understand every byte of its structure, and understand what the signature prevents. A protected test endpoint returns 401 for requests without a valid token. The token is issued with an expiry time; expired tokens are rejected.

---

## What you need to know first

- Sprint 4 L1: `verify_password`, `UserModel`, `UserPublic`, password hashing, bcrypt.
- Sprint 3 L3: `Depends(get_db)`, SQLAlchemy sessions.
- Sprint 1 L4: HTTP headers, browser Network tab.

---

## The lesson

---

### 1. The authentication problem: what a token solves

**The problem:** A user provides a username and password. The server verifies them. The user then makes a second request — get their work orders. The server has no memory of the first request. HTTP is stateless (Lesson 3, Sprint 1). The user must prove they authenticated on every request. They cannot send their password every time — transmitting passwords repeatedly increases the exposure window. The solution is a **token**: a proof-of-authentication that is separate from the credential.

**Two approaches:**

**Sessions (stateful):** After login, the server creates a session record in the database or memory: `session_id → user_id`. The server sends `session_id` to the client (as a cookie). On subsequent requests, the client sends the cookie; the server looks up the `session_id` in the database to find the user. This requires a database round-trip on every request. If the server runs as multiple processes (for scaling), they must share a session store.

**JWT (stateless):** After login, the server creates a cryptographically signed token that contains the user's ID and an expiry timestamp. The server sends the token to the client. On subsequent requests, the client sends the token; the server verifies the cryptographic signature — no database lookup required. The server can run as 100 processes simultaneously; each one can independently verify any token.

You will implement JWT because it is the dominant approach for modern APIs and because understanding it requires understanding cryptography that is genuinely important.

**JWT stands for JSON Web Token.** It is a standard (RFC 7519) for encoding a JSON payload as a signed, compact string. "Signed" means the server can verify the token has not been tampered with. "Compact" means it is small enough to send in an HTTP header.

---

### 2. Install python-jose

From `backend/` with the virtual environment active:

```
pip install python-jose[cryptography]
pip freeze > requirements.txt
```

**Walkthrough:** `python-jose` is a Python implementation of JOSE (JSON Object Signing and Encryption) standards, which includes JWT. The `[cryptography]` extra installs the `cryptography` Python package — a binding to OpenSSL — which provides the actual cryptographic primitives (HMAC, RSA, elliptic curve) that JWT signing uses.

---

### 3. Understand JWT structure: three parts

**The problem:** Before writing code, decode a real JWT by hand. Understanding the structure is the prerequisite to understanding the security properties.

A JWT is three base64url-encoded JSON objects separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiZXhwIjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Split on `.`: `header.payload.signature`

**The header** (first part): decode the first segment in a Python REPL:

```python
import base64
import json
header_b64 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
# base64url padding
padding = 4 - len(header_b64) % 4
header_json = base64.urlsafe_b64decode(header_b64 + "=" * padding)
print(json.loads(header_json))
```

Output: `{'alg': 'HS256', 'typ': 'JWT'}`

- `alg: "HS256"` — the signing algorithm. `HS256` is HMAC with SHA-256. HMAC (Hash-based Message Authentication Code) uses a secret key to produce a signature that can only be verified by someone who has the same key.
- `typ: "JWT"` — the type of token. Always `JWT` for JSON Web Tokens.

**The payload** (second part): decode the second segment:

```python
payload_b64 = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiZXhwIjoxNzAwMDAwMDAwfQ"
padding = 4 - len(payload_b64) % 4
payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * padding)
print(json.loads(payload_json))
```

Output: `{'sub': '1234567890', 'name': 'Alice', 'exp': 1700000000}`

The payload contains **claims** — statements about the user:
- `sub` (subject) — identifies the principal. Standard convention: the user's ID.
- `exp` (expiry) — a Unix timestamp (seconds since 1970-01-01 00:00 UTC) after which the token is invalid. `1700000000` is November 4, 2023. Any server receiving this token after that date rejects it.
- Any other key-value pairs you want to include.

**Important:** The payload is not encrypted — it is base64url-encoded, which is trivially reversible. Anyone who intercepts the token can read the payload. Never put sensitive data (passwords, secrets, credit card numbers) in a JWT payload.

**The signature** (third part): this is not a JSON object — it is the HMAC-SHA256 of `base64url(header) + "." + base64url(payload)` computed with your secret key, then base64url-encoded.

To verify a JWT, the server:
1. Splits the token on `.` to get header, payload, and signature
2. Recomputes the expected signature: `HMAC-SHA256(header + "." + payload, secret_key)`
3. Compares the recomputed signature to the signature in the token (constant-time comparison)
4. If they match, the token is authentic — the payload has not been modified since the server created it

**The critical security property:** An attacker cannot modify the payload and produce a valid signature without knowing the secret key. If they change `sub: "1"` to `sub: "999"` (trying to impersonate user 999), the signature becomes invalid. The server rejects the token.

**What does NOT protect you:** If an attacker steals a valid token, they can use it until it expires. JWT does not prevent token theft — it only proves authenticity. Token theft is mitigated by: short expiry times (the token is useless after N minutes), HTTPS (prevents interception in transit), and secure storage on the client (Lesson 4).

**CS lens — HMAC as a keyed hash.** HMAC (Hash-based Message Authentication Code) is a construction that uses a hash function and a secret key to produce a message authentication code. `HMAC(key, message)` produces a fixed-length code. Anyone who knows `key` can verify that `HMAC(key, message') == code` — which tells them the message has not changed. Without `key`, producing a valid code for any message is computationally infeasible. This is the signature property: the server uses its secret key to sign the token; only the server can verify or produce valid signatures.

**SE lens — stateless authentication scales horizontally.** Sessions require a shared store — a database or Redis that all server processes read from. This creates a bottleneck: every request requires a session lookup. JWT requires no shared state — each server process independently verifies the cryptographic signature. Add 100 more server processes and they all handle authentication immediately, without needing access to a shared session store. This is why JWTs dominate API authentication in cloud-native architectures.

**Real-world connection:** JWT is used by Auth0, Firebase Authentication, AWS Cognito, GitHub's OAuth tokens, and essentially every modern identity provider. The standard is maintained by the IETF. When you integrate with a third-party auth provider, the token they give you is almost always a JWT.

---

### 4. Add JWT configuration and creation

Add to `backend/auth.py`:

```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

SECRET_KEY = "dev-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid or expired token")
```

**Walkthrough:**

`SECRET_KEY = "dev-secret-key-change-this-in-production"` — the HMAC secret key. This string must be kept secret. Anyone with this key can generate valid tokens for any user. In production (Sprint 6), this value will come from an environment variable, never from source code. The comment in the name itself is a reminder.

`ALGORITHM = "HS256"` — the signing algorithm. `HS256` is HMAC-SHA256. The alternative is RS256 (RSA signatures), where the server has a private key for signing and a public key for verification. RS256 allows third parties to verify tokens without the signing key — used by OAuth providers. HS256 is simpler and correct for a self-contained API.

`ACCESS_TOKEN_EXPIRE_MINUTES = 30` — tokens expire after 30 minutes. After expiry, the server rejects the token and the user must log in again. Short expiry limits the damage from token theft: a stolen token is useless after 30 minutes. Longer expiry is more convenient for users but reduces security. 30 minutes is a common production default; adjust based on your threat model.

`data.copy()` — creates a copy of the incoming dict before modifying it. This is defensive: if you modified `data` directly, the caller's dict would be mutated — a side effect the caller does not expect. Copy first, modify the copy.

`datetime.now(timezone.utc)` — the current time in UTC. UTC (Coordinated Universal Time) is the standard for timestamps in web applications. Never use local time — your server may run in one timezone, your users in another, and comparing local timestamps between them produces wrong results. `timezone.utc` makes the datetime timezone-aware; `timedelta(minutes=30)` adds 30 minutes.

`to_encode["exp"] = expire` — adds the expiry claim. `python-jose` reads the `exp` claim when verifying tokens and raises `JWTError` if the current time is past the expiry.

`jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)` — produces the JWT string: `header.payload.signature`, all base64url-encoded.

`jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])` — verifies the signature and expiry, then returns the payload as a dict. Raises `JWTError` if the signature is invalid, if the token is expired, or if the token is malformed.

Test in the Python REPL:

```python
from auth import create_access_token, decode_access_token

token = create_access_token({"sub": "1"})
print(token)
print(decode_access_token(token))
```

Copy the printed token and paste it at [https://jwt.io](https://jwt.io). The website decodes and displays the header and payload without knowing the secret key. Notice: you can read the payload without the secret. This confirms: JWTs are not secret — they are authenticated (signed). The signature proves authenticity; it does not hide content.

**CS lens — the `sub` claim as an identity reference.** The `sub` claim is a string identifying the subject — the entity the token represents. By convention, `sub` is the user's ID as a string. When the server receives a token and decodes it, `payload["sub"]` is the user ID. The server queries the database with this ID to get the user's current details. The token itself is an unforgeable reference; the current user data comes from the database.

**SE lens — `algorithms=[ALGORITHM]` as a security requirement.** The `algorithms` parameter is a list, not a single value. `jwt.decode` verifies that the token's header specifies one of the allowed algorithms. If you pass `algorithms=["HS256", "none"]`, an attacker can send a token with `"alg": "none"` in the header — which disables signature verification entirely. This is a real vulnerability known as the **"alg: none" attack**. Always pass an explicit list of strong algorithms; never include `"none"`.

---

### 5. Add the login endpoint

Add to `backend/main.py`:

```python
from auth import hash_password, verify_password, create_access_token
from models import WorkOrder, WorkOrderCreate, UserCreate, UserPublic, TokenResponse

# Add to models.py first:
# class TokenResponse(BaseModel):
#     access_token: str
#     token_type: str = "bearer"

@app.post("/auth/login", response_model=TokenResponse)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
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

Add `TokenResponse` to `backend/models.py`:

```python
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

**Walkthrough:**

`db.query(UserModel).filter(UserModel.username == user_data.username).first()` — looks up the user by username. Returns `None` if no user with that username exists.

`if user is None or not verify_password(...)` — the two failure conditions are combined into one condition with the same error message. This is intentional.

`raise HTTPException(status_code=401, ...)` — the same error response for wrong username AND wrong password. The client learns "login failed" but not whether the username exists. If wrong username returned `"User not found"` and wrong password returned `"Wrong password"`, an attacker could enumerate valid usernames (same issue as the registration endpoint, but more severe: the attacker then knows a valid username and can focus their password attack). A single ambiguous error message prevents username enumeration.

`headers={"WWW-Authenticate": "Bearer"}` — the HTTP standard `WWW-Authenticate` header, required by the OAuth2 specification when returning 401 from an authentication endpoint. It tells the client the authentication scheme is `Bearer` — the client should provide a `Authorization: Bearer <token>` header.

`TokenResponse(access_token=token, token_type="bearer")` — the response body contains the JWT token and the token type (`bearer` — the standard name for tokens sent in the `Authorization` header).

Test: `POST /auth/login` with `{"username": "alice", "password": "secret123"}`. Expected response:
```json
{"access_token": "eyJ...", "token_type": "bearer"}
```

Test with wrong password: `{"username": "alice", "password": "wrong"}`. Expected: 401, `"Incorrect username or password"`.

**CS lens — constant-time password verification and the boolean short-circuit.** `user is None or not verify_password(...)` — the `or` operator short-circuits: if `user is None` is `True`, `verify_password` is never called. This is correct because you cannot call `verify_password` with a null user. The timing implication: a non-existent username returns slightly faster (no `verify_password` call) than an existing username with a wrong password. A timing attack could theoretically distinguish these cases. For most applications, this timing difference (milliseconds vs. ~300ms) is not exploitable. For extremely high-security systems, you call `verify_password` with a dummy hash regardless.

**SE lens — 401 Unauthorized, not 403 Forbidden.** `401 Unauthorized` means: "you are not authenticated — I do not know who you are." `403 Forbidden` means: "I know who you are, but you are not allowed to do this." Login failures are `401`: we do not know who the person is (their credentials are invalid). If a valid user tries to access another user's data, that is `403`.

---

## Connect the pieces

The authentication chain is now: register → login → receive JWT. In Lesson 3, every work order endpoint will require a valid JWT. The token flow is:

1. Client POSTs credentials to `POST /auth/login`
2. Server verifies password with bcrypt
3. Server creates JWT containing the user's ID with 30-minute expiry
4. Client receives JWT, stores it
5. Client sends JWT in `Authorization: Bearer <token>` header on every subsequent request
6. Server verifies JWT signature and expiry, extracts user ID, proceeds

The secret key is the only thing that cannot be compromised. Every other component of this system can be exposed: the algorithm is public, the payload is base64-encoded (readable), the user IDs are sequential integers. The secret key's secrecy is the security foundation.

---

## What breaks without this

**Hardcoded secret key in production:** If `SECRET_KEY` is committed to a public git repository, anyone who reads the repository can generate valid tokens for any user — bypassing all authentication. Fix: move to an environment variable in Sprint 6 and add it to `.gitignore`.

**`algorithms=["HS256", "none"]`:** The `"alg": "none"` attack allows unsigned tokens. Fix: never include `"none"` in the algorithms list. Use `algorithms=[ALGORITHM]` always.

---

## Definition of done

- [ ] `POST /auth/login` with valid credentials returns a JWT
- [ ] `POST /auth/login` with wrong credentials returns 401 with "Incorrect username or password"
- [ ] You decoded the JWT manually in the REPL and read the `sub` and `exp` claims
- [ ] You pasted the token at jwt.io and confirmed the payload is readable without the secret
- [ ] You can explain the three parts of a JWT
- [ ] You can explain what the signature prevents (tampered payload)
- [ ] You can explain what the signature does NOT prevent (stolen token used by attacker)
- [ ] You can explain why wrong username and wrong password return the same error

**Git commit:**

```
git add backend/auth.py backend/models.py backend/main.py
git commit -m "Add JWT login endpoint: HMAC-HS256 tokens with 30-minute expiry, unified 401 for failed auth"
```
