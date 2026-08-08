# Backend Lesson 2 — Login and JWT Authentication, Test-First

**Track:** Developer Social Network — Slice 2 (Backend)
**Depth:** Heavy — JWTs are one of those things people use correctly for years without knowing what's actually inside one; this lesson opens that up
**Goal:** A `/login` endpoint that verifies credentials and issues a JWT, plus a reusable FastAPI dependency that protects any future endpoint behind "must be logged in" — all built test-first.

---

## 0. The problem login actually solves

HTTP is stateless — the server doesn't inherently remember who you are between requests. After `/login` verifies a password once, something has to let *every subsequent request* prove "this is still the same logged-in user," without re-sending the password every single time. A JWT is one standard way to solve that: a signed, tamper-evident piece of data the client stores and re-sends with each request, that the server can verify without needing to look anything up in a database on every single check.

---

## 1. What a JWT actually is — opened up, not just used

A JWT (JSON Web Token) is a string with three parts, separated by dots: `header.payload.signature`. Each part is base64-encoded (a text-safe encoding, not encryption — anyone can decode and read it):

```python
import base64
import json

# What's actually inside a JWT, decoded manually - just to see it once
sample_jwt = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaWNlIn0.signature_part"

header_part, payload_part, signature_part = sample_jwt.split(".")

def decode_base64_part(part):
    padded = part + "=" * (-len(part) % 4)   # base64 needs padding to a multiple of 4
    return json.loads(base64.urlsafe_b64decode(padded))

print(decode_base64_part(header_part))    # {'alg': 'HS256'} - which signing algorithm was used
print(decode_base64_part(payload_part))    # {'user_id': 1, 'username': 'alice'} - the actual claims
```

**The critical, easy-to-misunderstand fact:** the payload is *readable by anyone* who has the token — it's encoded, not encrypted. **Never put secrets (passwords, sensitive data) in a JWT payload.** What makes a JWT trustworthy isn't secrecy of its contents — it's the **signature**: the server generates the signature using a secret key only the server knows, and can verify, on any later request, that the signature still matches the payload. If anyone tampers with the payload (e.g., changing `user_id`), the signature no longer matches, and the server rejects the token. The JWT's security guarantee is "this data hasn't been tampered with," not "this data is hidden."

---

## 2. Setup

```
pip install python-jose[cryptography]
```

```python
# app/security.py (extending Backend Lesson 1's file)
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

SECRET_KEY = "change-this-to-a-real-secret-loaded-from-an-environment-variable"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire   # "exp" is a JWT-standard claim - other tools recognize it automatically
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
```

**`SECRET_KEY` as a hardcoded string is only acceptable here because it's a lesson** — in Section 6, this moves to an environment variable, which is the actually-correct approach for real code. Worth flagging explicitly rather than letting a "temporary" shortcut look like the final recommendation.

**Why the expiration (`exp`) matters:** a JWT with no expiration is valid forever once issued — if it's ever stolen, an attacker has permanent access. A short expiration limits the damage window; this is a genuine, real security tradeoff between convenience (not re-logging-in constantly) and safety (limiting how long a stolen token stays useful).

---

## 3. Test-first — the login endpoint

```python
# tests/test_auth.py (new file, same test-database setup pattern as test_users.py)
from fastapi.testclient import TestClient
from app.main import app
# ... (same TestSessionLocal/override_get_db/fixture setup as tests/test_users.py)

client = TestClient(app)


def test_login_with_correct_credentials_returns_token():
    client.post("/users", json={"username": "dana", "email": "dana@example.com", "password": "correct-password"})

    response = client.post("/login", json={"username": "dana", "password": "correct-password"})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password_returns_401():
    client.post("/users", json={"username": "erin", "email": "erin@example.com", "password": "correct-password"})

    response = client.post("/login", json={"username": "erin", "password": "wrong-password"})

    assert response.status_code == 401


def test_protected_endpoint_requires_valid_token():
    response = client.get("/me")   # no Authorization header at all
    assert response.status_code == 401


def test_protected_endpoint_returns_current_user_with_valid_token():
    client.post("/users", json={"username": "frank", "email": "frank@example.com", "password": "correct-password"})
    login_response = client.post("/login", json={"username": "frank", "password": "correct-password"})
    token = login_response.json()["access_token"]

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["username"] == "frank"
```

Run this now — it fails, since `/login` and `/me` don't exist yet. Red.

**`headers={"Authorization": f"Bearer {token}"}`** — this is the standard convention for sending a token: the `Authorization` header, with the value prefixed by `Bearer ` (a space-separated scheme name), followed by the actual token. "Bearer" means "whoever holds (bears) this token is treated as authenticated" — worth knowing the term since you'll see it constantly in API documentation elsewhere.

---

## 4. Green — the login endpoint and the protected-route dependency

```python
# app/schemas.py (add)
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
```

```python
# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, security

router = APIRouter()


@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()

    if user is None or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = security.create_access_token(data={"user_id": user.id, "username": user.username})
    return {"access_token": token, "token_type": "bearer"}


def get_current_user(authorization: str = Header(default=None), db: Session = Depends(get_db)) -> models.User:
    """
    A reusable FastAPI dependency - any route that needs 'must be logged in' just
    adds `current_user: models.User = Depends(get_current_user)` to its parameters.
    """
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ")
    payload = security.decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == payload["user_id"]).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return user


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
```

Reading the key new piece: **`get_current_user` as a *dependency*, not a helper function called manually.** Because it's declared with `Depends(get_current_user)` in `/me`'s parameters, FastAPI runs it automatically before `get_me`'s body ever executes — if it raises `HTTPException`, `get_me`'s body never runs at all, and the error response goes straight back to the client. This is the same dependency-injection mechanism Backend Lesson 1 used for `get_db`, applied here to authentication instead of database sessions — one mechanism, two different real uses, worth noticing as the same pattern rather than two unrelated things.

**This is also exactly how *any future* protected endpoint gets secured** — adding `current_user: models.User = Depends(get_current_user)` to a route's parameters is the entire mechanism; no route needs to duplicate token-checking logic itself.

Register the new router in `app/main.py`:

```python
from app.routes import auth
app.include_router(auth.router)
```

Run the tests again — green.

---

## 5. Refactor consideration

`get_current_user` currently queries the database on *every single request* to confirm the user still exists — a deliberate, reasonable choice: it means a deleted or banned user's existing tokens stop working immediately, rather than remaining valid until they naturally expire. The tradeoff is an extra database query per authenticated request. Worth naming as a real design decision rather than an oversight — a system with much higher traffic might choose differently (e.g., trusting the token's claims without a fresh database check, accepting the "still valid until expiration" tradeoff for better performance). Left as-is here since correctness matters more than performance at this stage, and this exact tradeoff is worth revisiting explicitly once Slice 6's architecture lessons introduce more formal ways to reason about this kind of decision.

---

## 6. Moving the secret key to an environment variable — a real, necessary fix

```python
# app/security.py - the actual correct version
import os

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
if SECRET_KEY is None:
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set")
```

**Why this matters, concretely, not just as a best practice:** a hardcoded secret key checked into source control (Section 2's placeholder) means anyone with access to the code — including, eventually, a public GitHub repo if this project is ever pushed there — can forge valid tokens for any user. Loading it from an environment variable keeps the actual secret out of the codebase entirely. `raise RuntimeError(...)` if it's missing is deliberate too: failing loudly and immediately on startup is far better than silently running with `None` as a secret key, which would be a serious, quiet vulnerability.

---

## 7. Challenges before the frontend lesson

1. Write a failing test first for token expiration: manually create a token with `ACCESS_TOKEN_EXPIRE_MINUTES` set to a negative number (already expired), and verify `/me` returns `401` with that token. Then confirm the existing `decode_access_token` already handles this correctly, or fix it if not.
2. Decode a real JWT your `create_access_token` produces, by hand, using Section 1's `decode_base64_part` pattern, and confirm the payload contains exactly what you expect — no more, no less.
3. In your own words, explain why storing a plaintext password would make Section 3's `verify_password` step unnecessary, but would be catastrophic if the database were ever breached — tie this back to Backend Lesson 1, Section 5's hashing discussion.
4. `get_current_user` raises three different `401` errors for three different reasons (no header, invalid token, deleted user) but all return the same generic status code. Is returning identical error details for all three cases a deliberate security choice, or a gap? Research (or reason through) why an authentication system might *deliberately* avoid being more specific here.

---

## What's next

The frontend lesson builds the login form, token storage, and a protected-route pattern that redirects unauthenticated users away from pages requiring login — introducing `useContext` for sharing auth state across the whole app without passing it down through every component manually. Say the word when you're ready.
