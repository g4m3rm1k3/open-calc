# Sprint 4 · Lesson 1 — Passwords: hashing and why encryption is wrong

## What you will build

By the end of this lesson, a `User` model exists in the database. You can register a user by providing a username and password. The password is never stored — only a bcrypt hash is stored. You can verify a password against its hash. You will understand why hashing is not the same as encryption, what a salt is, what the cost factor controls, and what a rainbow table attack is. You will be able to explain this to a non-technical person and to a security auditor.

---

## What you need to know first

- Sprint 3: Postgres running in Docker, SQLAlchemy ORM models, Alembic migrations, Pydantic models.
- Sprint 2 L3: FastAPI route handlers, `HTTPException`, `Depends`.

**Why this lesson comes before JWT:** The login endpoint (Lesson 2) cannot exist until there are users. Users cannot exist without password storage. Password storage is the foundation; authentication tokens are built on top.

---

## The lesson

---

### 1. The threat model: what you are defending against

**The problem:** Before writing a single line of code, understand exactly what you are protecting against. Code written without a threat model protects against nothing in particular and often protects against nothing at all.

**The threat:** Your database will be breached. This is not pessimism — it is engineering realism. Every major technology company has had a database breach: Adobe (2013, 153 million records), LinkedIn (2012, 117 million), Dropbox (2012, 68 million), RockYou (2009, 32 million). The question is not whether your database will be exposed. The question is: when it is exposed, what does the attacker get?

**If you store plaintext passwords:** The attacker gets every user's password. Because 85% of users reuse passwords across sites, a breach of your app is also a breach of the user's email, their bank, their other accounts. This is the worst possible outcome. Companies that store plaintext passwords are negligent.

**If you store encrypted passwords:** Encryption is reversible — with the key, you can recover the original password. The key must live somewhere on your server. If the database is breached, the server is likely compromised too. An attacker with the database and the key decrypts every password in seconds. Encryption for passwords is wrong because it is designed to be reversed.

**If you store hashed passwords correctly:** A hash function is one-way — given the hash, you cannot recover the original password without guessing it. The attacker has a list of hashes. To crack one, they must guess the password, hash the guess, and compare. With a strong hash function and a salt, this is computationally expensive — weeks or years per password. Most attackers move on.

**What "hashing" means:** A hash function takes an input of any length and produces a fixed-length output. The same input always produces the same output. Different inputs produce different outputs (with overwhelming probability). The function is **one-way**: you cannot reverse it. Given `f(password) = hash`, there is no function `g` such that `g(hash) = password`. You can only check: does `f(candidate) == hash`?

This is the model bcrypt implements. You will implement it now.

---

### 2. Install passlib and bcrypt

From `backend/` with the virtual environment active:

```
pip install passlib[bcrypt]
pip freeze > requirements.txt
```

**Walkthrough:** `passlib` is a Python password hashing library. The `[bcrypt]` extra tells pip to also install the `bcrypt` C extension that passlib uses. Passlib supports many hashing algorithms — bcrypt, argon2, scrypt. You are using bcrypt because it is the most widely supported and battle-tested choice for web applications.

`pip install passlib[bcrypt]` installs two packages: `passlib` (the Python library with the hashing API) and `bcrypt` (the C extension with the actual hashing implementation). The `[bcrypt]` syntax in pip is called **extras** — optional additional dependencies that the package supports but does not require by default.

**Why not `hashlib`?** Python's built-in `hashlib` provides SHA-256, MD5, and similar general-purpose hash functions. These are fast — designed for checksums, signatures, and data integrity. Password hashing requires the opposite: a function that is deliberately, tuneably slow. bcrypt was designed specifically for passwords. SHA-256 hashes a password in microseconds; an attacker can try billions of guesses per second. bcrypt, with a cost factor of 12, takes ~300ms — limiting an attacker to ~3 guesses per second per machine.

**CS lens — the key property: slowness.** A password hash function must be slow by design. This is not a performance bug — it is the security feature. The cost factor (explained below) controls how slow. The attacker and the legitimate user both pay the same cost: ~300ms to hash a password. For the legitimate user (one login), 300ms is imperceptible. For the attacker (billions of attempts), 300ms per attempt × billions of attempts = years of computation.

**Real-world connection:** bcrypt was published in 1999 and is used by OpenBSD, PHP's `password_hash`, Django's `BCryptPasswordHasher`, Spring Security, and essentially every serious web application built in the last 15 years. Its design has withstood 25 years of cryptanalysis.

---

### 3. Create the hashing utilities

Create `backend/auth.py`:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

Test it from the Python REPL (from `backend/` with the virtual environment active):

```
python3
```

```python
from auth import hash_password, verify_password

hashed = hash_password("my_secret_password")
print(hashed)
print(verify_password("my_secret_password", hashed))
print(verify_password("wrong_password", hashed))
```

Expected output:
```
$2b$12$K7BnzI.eG9qH8LpNkW3N6OvLxWq7eC9ZJ2j1t5VFX1RYcHkOmSeXi
True
False
```

Your hash will be different every time — that is the salt at work.

**Walkthrough:**

`CryptContext(schemes=["bcrypt"], deprecated="auto")` — creates a hashing context. A **context** is a configured hashing system. `schemes=["bcrypt"]` says: use bcrypt as the hashing algorithm. `deprecated="auto"` says: automatically identify and flag hashes created with older, weaker algorithms — allowing you to upgrade password hashes when users next log in.

`pwd_context.hash(plain_password)` — hashes the password. Internally:
1. Generates a random 128-bit **salt** — unique random bytes for this specific hash
2. Concatenates the salt and the password
3. Applies bcrypt's algorithm with the **cost factor** (default: 12) — runs the algorithm 2^12 = 4096 rounds
4. Returns a string encoding the algorithm identifier, cost factor, salt, and hash

The returned string — `$2b$12$K7BnzI.eG9qH8LpNkW3N6O...` — encodes everything needed to verify the password later:
- `$2b$` — algorithm identifier: bcrypt version 2b
- `$12$` — cost factor: 12
- The next 22 characters: the base64-encoded salt
- The remaining characters: the base64-encoded hash

`pwd_context.verify(plain_password, hashed_password)` — verifies a password. Internally:
1. Extracts the algorithm, cost factor, and salt from `hashed_password`
2. Hashes `plain_password` using the same algorithm, cost factor, and salt
3. Compares the result to the stored hash using a constant-time comparison (more on this below)
4. Returns `True` if they match, `False` otherwise

**What a salt is:** The salt is random bytes prepended to the password before hashing. Without a salt, `hash("password")` produces the same hash every time. An attacker can precompute hashes for common passwords and store them in a table — called a **rainbow table**. When they get your database, they look up each hash and instantly find the password if it is in their table.

With a unique random salt per password, `hash(salt + "password")` produces a different hash every time — even for the same password. Two users with the password "password" have different hashes. The rainbow table is useless because the attacker would need to precompute a separate table for every possible salt. bcrypt makes this infeasible.

**What a constant-time comparison is:** `verify` compares two strings. A naive comparison (`a == b`) returns `False` as soon as it finds the first differing byte. An attacker who can measure timing precisely can discover bytes of the hash one at a time — a **timing attack**. A constant-time comparison always takes the same time regardless of where the strings differ, eliminating the timing signal. `passlib` uses constant-time comparison internally.

**CS lens — the preimage resistance property.** A hash function has **preimage resistance**: given `h = f(x)`, it is computationally infeasible to find any `x'` such that `f(x') = h`. This is what makes hashing one-way. Breaking preimage resistance for bcrypt would require advances in mathematics that have not occurred in 25 years. You are not inventing cryptography — you are applying a primitive whose security properties are mathematically specified and empirically verified.

**SE lens — one responsibility per module.** `auth.py` has one job: password hashing. It does not import FastAPI, SQLAlchemy, or Pydantic. It is a pure function module. This makes it testable in isolation (you tested it in the REPL), replaceable (if you switch from bcrypt to argon2, only `auth.py` changes), and readable (two functions, one purpose).

**What breaks without this:** Using a single global `hash_password("password")` for multiple users produces the same hash for each. The salt is the mechanism that makes identical passwords produce different hashes. If passlib's default salt generation is bypassed (possible if you use the `bcrypt` library directly and pass a fixed salt), all security properties are lost.

---

### 4. Create the User model and migration

**The problem:** Users need to be stored in the database. A user has a username (unique) and a hashed password.

Add to `backend/orm_models.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, Text, func
from database import Base

class WorkOrderModel(Base):
    __tablename__ = "work_orders"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    status      = Column(String, nullable=False, default="open")
    priority    = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class UserModel(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
```

Add the Pydantic schemas to `backend/models.py`:

```python
class UserCreate(BaseModel):
    username: str
    password: str

class UserPublic(BaseModel):
    id: int
    username: str
```

**Walkthrough:**

`unique=True` on `username` — tells SQLAlchemy to generate a `UNIQUE` constraint on the `username` column. Postgres enforces this: if you try to insert a row with a username that already exists, the database raises an `IntegrityError`. Uniqueness is enforced by the database, not just by your application logic.

`index=True` on `username` — creates an index on `username`. Lookups by username (to find a user during login) become O(log n) instead of O(n). Every login query uses this index.

`hashed_password: Column(String)` — stores the bcrypt hash string. The string is always ~60 characters long for bcrypt. It is never the original password.

`UserCreate` contains `password: str` — the plaintext password sent by the client. This is an input model only: it is never stored, never logged, never returned. It exists only to receive the password so you can hash it before persisting.

`UserPublic` contains `id` and `username` — no password field, not even the hash. This is the safe representation to return to clients. Returning the hash would allow an attacker with API access to run offline dictionary attacks.

Generate and apply the migration:

```
alembic revision --autogenerate -m "add users table"
alembic upgrade head
```

Verify in TablePlus: the `users` table exists with `id`, `username`, `hashed_password`, `created_at`.

**CS lens — the unique constraint as a database invariant.** A `UNIQUE` constraint is a **database invariant** — a condition the database guarantees to be true at all times. Application code can be buggy, bypassed, or concurrent (two requests arrive simultaneously). The database constraint holds regardless. If your application logic checks uniqueness with `SELECT ... WHERE username = ?` before `INSERT`, two simultaneous registrations might both pass the check and both proceed to insert — a **race condition**. The `UNIQUE` constraint prevents the second insert from succeeding at the database level, no race condition possible.

**SE lens — never return the hash.** The `UserPublic` model is the only model returned from API endpoints. `UserCreate` enters the system and is immediately discarded after the hash is extracted. The hash is never in a response. This is the principle of **minimal exposure**: expose only what the client needs. A client needs `id` and `username` to identify the user; it never needs the hash.

**What breaks without this:** If you store plaintext passwords in `hashed_password` by accident — calling `UserModel(hashed_password=user_data.password)` instead of `UserModel(hashed_password=hash_password(user_data.password))` — the column name implies a hash but contains plaintext. The naming contract is violated. This is a common mistake. The solution is to make the hashing mandatory in the route handler and to test it (Sprint 5).

---

### 5. Add the registration endpoint

**The problem:** Users need a way to create accounts.

Add to `backend/main.py`:

```python
from auth import hash_password, verify_password
from orm_models import WorkOrderModel, UserModel
from models import WorkOrder, WorkOrderCreate, UserCreate, UserPublic
from sqlalchemy.exc import IntegrityError

@app.post("/auth/register", response_model=UserPublic, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(user_data.password)
    new_user = UserModel(username=user_data.username, hashed_password=hashed)
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username already taken")
    db.refresh(new_user)
    return new_user
```

Test it: `POST /auth/register` with `{"username": "alice", "password": "secret123"}`. Expected: `{"id": 1, "username": "alice"}`.

Test registration with the same username a second time. Expected: `409 Conflict, "Username already taken"`.

Check in TablePlus: `SELECT * FROM users`. The `hashed_password` column contains a bcrypt hash string starting with `$2b$`. The plaintext `"secret123"` is nowhere in the database.

**Walkthrough:**

`hash_password(user_data.password)` — immediately hashes the incoming password. The plaintext password (`user_data.password`) is discarded after this line. It is never assigned to a variable that outlives this line, never passed to another function, never logged.

`except IntegrityError:` — catches the PostgreSQL `IntegrityError` that the `UNIQUE` constraint raises when a duplicate username is inserted. `db.rollback()` is required: if you catch an `IntegrityError` without rolling back, the SQLAlchemy session is in an invalid state — subsequent operations on the same session will fail. After rolling back, you raise `HTTPException(409)` — **Conflict** — the HTTP standard for "the request conflicts with the current state of the resource" (in this case, the username already exists).

`return new_user` — returns the `UserModel` instance. FastAPI serialises it using `response_model=UserPublic` — only `id` and `username` appear in the response. The `hashed_password` field is present on `new_user` but `UserPublic` does not include it, so FastAPI excludes it.

**CS lens — the try/except as an optimistic concurrency strategy.** The `try` approach — attempt the insert, handle the uniqueness error — is called **optimistic concurrency**: assume the operation will succeed (most registrations use new usernames) and handle the failure if it occurs. The alternative — check first (`SELECT ... WHERE username = ?`), then insert — is **pessimistic** and has a race condition (between the check and the insert, another request could claim the username). The `UNIQUE` constraint makes the optimistic approach safe.

**SE lens — `409 Conflict` is not `400 Bad Request`.** `400 Bad Request` means the request is malformed or missing required fields — the client sent wrong data. `409 Conflict` means the request is valid but conflicts with the current server state — the username exists. Using `409` instead of `400` gives the client precise information: the request was well-formed; the specific problem is a naming conflict. A client can react to `409` by asking the user to choose a different username.

**Security lens — the registration endpoint as an enumeration vector.** Returning `"Username already taken"` tells an attacker which usernames exist in the system. This is a **user enumeration** vulnerability — an attacker can probe the registration endpoint to discover valid usernames, then use them in targeted password attacks. A privacy-preserving API returns the same response regardless of whether the conflict is a username collision or another error. For this curriculum, the readable error is fine; be aware of the tradeoff in production.

**What breaks without this:** Forgetting `db.rollback()` after catching `IntegrityError` leaves the session in an errored state. Subsequent calls to `db.commit()` in the same request raise `InvalidRequestError: Can't reconnect until invalid transaction is rolled back`. FastAPI returns 500. Always rollback after catching a database integrity error.

---

## Connect the pieces

`auth.py` provides the password utilities. `UserModel` and its migration persist users. `POST /auth/register` is the public registration endpoint. In Lesson 2, `POST /auth/login` will use `verify_password` to check a submitted password against the stored hash, then issue a JWT if they match. In Lesson 3, the JWT will be required on every work order endpoint. The chain: register → login → receive token → use token.

The security properties established here carry through the entire auth system: plaintext passwords never persist, hashes are bcrypt with per-user salts, the cost factor makes brute force computationally expensive. Sprint 6 will add rate limiting to the login endpoint to further slow brute-force attempts.

---

## What breaks without this

**Returning the hash in the response:** If you accidentally use `response_model=WorkOrder` or `response_model=UserCreate` instead of `UserPublic`, the hashed password appears in the API response. The hash is not a password, but it can be used for offline dictionary attacks — an attacker hashes common passwords with the same cost factor and compares. Always use `UserPublic` for user responses.

**Cost factor too low:** `CryptContext(schemes=["bcrypt"])` uses a default cost factor of 12, which takes ~300ms. If you explicitly set a lower cost factor (e.g., 4, which takes <1ms), bcrypt is effectively bypassed — an attacker can try millions of guesses per second. Never lower the cost factor below 10 in production.

---

## Definition of done

- [ ] `POST /auth/register` with a new username returns `{"id": ..., "username": ...}` (no password field)
- [ ] The `hashed_password` in TablePlus starts with `$2b$12$` (bcrypt, cost factor 12)
- [ ] Registering the same username twice returns 409
- [ ] `verify_password("right_password", hashed)` returns `True`; `verify_password("wrong", hashed)` returns `False`
- [ ] You can explain the difference between hashing and encryption
- [ ] You can explain what a salt is and what rainbow tables are
- [ ] You can explain why `db.rollback()` is required after catching `IntegrityError`

**Git commit:**

```
git add backend/auth.py backend/orm_models.py backend/models.py backend/main.py backend/alembic/
git commit -m "Add user model and registration: bcrypt password hashing, UNIQUE constraint, safe UserPublic response"
```
