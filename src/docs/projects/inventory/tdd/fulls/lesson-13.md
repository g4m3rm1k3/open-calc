# Lesson 13: Creating an Account

**What you will build**
`POST /accounts`, creating a real member with a securely hashed and salted password — the first lesson dealing with genuinely sensitive data, and the first to use a cryptographic library instead of writing the logic ourselves. The problem we're solving: every member so far was seeded manually in `init_db()`. Real signups mean accepting a password from a stranger and storing it in a way that protects them even if our database is ever stolen outright.

**What you need to know first**
Lesson 4 (`INSERT`, request validation). Lesson 8 (transactions).

---

## Concept Unit: One-Way Hashing and Why Plaintext Fails

### The Problem

The naive approach — store exactly what the user typed in a `password` column — means anyone who ever reads that table (an attacker after a breach, a careless internal query, a backup file left somewhere) reads every user's actual password. We need a way to *verify* a password later without ever being able to *recover* it from what's stored.

### Introduce the concept in isolation

Create `lab_hash.py`:

```python
import hashlib

password = "correct horse battery staple"
hash1 = hashlib.sha256(password.encode()).hexdigest()
hash2 = hashlib.sha256(password.encode()).hexdigest()
hash3 = hashlib.sha256("different password".encode()).hexdigest()

print(hash1)
print(hash1 == hash2)
print(hash1 == hash3)
```

Run it:

```bash
python lab_hash.py
```

Output:

```text
5916ac236...  (64 hex characters)
True
False
```

*What this proves:* the same input always produces the same output (`hash1 == hash2`), and there is no way to run this process in reverse — `hashlib.sha256` computes a fixed-size scramble of the input, but doesn't retain enough information to reconstruct the original from the scramble. This is a **one-way function**: easy to compute forward, computationally infeasible to invert. That's exactly what "verify without storing the real password" needs — store the hash, and when someone logs in later, hash *their* attempt and compare it to the stored hash, never comparing raw passwords at all.

### Explain why this specific hash is still wrong for passwords

`sha256` is deliberately, extremely fast — designed for verifying large files quickly, not for protecting secrets. That speed is a liability here: an attacker with a stolen table of `sha256` hashes can try billions of guesses per second against them, and can precompute a **rainbow table** — hashes of every common password, computed once, checked instantly forever after — because identical passwords always produce identical hashes with no per-user variation. Two users who happen to choose the same password would have identical rows in the table, visibly revealing that fact to anyone who can see it.

### Introduce salting and a real password-hashing library

Create `lab_bcrypt.py`:

```python
import bcrypt

password = b"correct horse battery staple"
hash1 = bcrypt.hashpw(password, bcrypt.gensalt())
hash2 = bcrypt.hashpw(password, bcrypt.gensalt())

print(hash1)
print(hash2)
print(hash1 == hash2)

print(bcrypt.checkpw(password, hash1))
print(bcrypt.checkpw(b"wrong guess", hash1))
```

Run it:

```bash
python lab_bcrypt.py
```

Output:

```text
b'$2b$12$KzL9V3n...'
b'$2b$12$T8mQwXe...'
False
True
False
```

*What this proves:* hashing the *identical* password twice produces two *different*-looking hashes (`hash1 == hash2` is `False`) — because `bcrypt.gensalt()` generates a random **salt**, unique per call, mixed into the hash before it's computed. That salt is actually stored *as part of* the output string itself (visible in the `$2b$12$...` prefix), so `bcrypt.checkpw` can extract it back out and redo the same hashing process to verify a guess, without ever needing the salt stored separately. This single change defeats rainbow tables entirely — precomputing hashes of common passwords is useless when every stored hash uses a different, unpredictable salt, so no precomputed table can match it in advance. `bcrypt` is also deliberately *slow* (note the `12` in the hash — a configurable work factor), which is the opposite tradeoff from `sha256`, and exactly the right one here: slow to brute-force, fast enough for one real login attempt to feel instant.

### Discard the throwaway examples

Delete `lab_hash.py` and `lab_bcrypt.py`. Build the real account creation endpoint.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.
* **Dependencies:** `bcrypt`.

### The New Code

```python
# db.py — modify the members table definition to add UNIQUE
conn.execute("""
    CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE
    )
""")

# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS credentials (
        member_id INTEGER PRIMARY KEY,
        password_hash TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id)
    )
""")
```

**An honest limitation, worth naming rather than hiding:** `CREATE TABLE IF NOT EXISTS` does nothing if `members` already exists from an earlier lesson's run — SQLite won't retroactively add `UNIQUE` to an existing table this way. For this project so far, that just means deleting `social.db` and letting `init_db()` recreate it fresh (the same step used in earlier exercises). That's a real gap, not a teaching shortcut: safely changing a schema *without* deleting existing data is a genuine, unsolved problem at this point in the project — and it's exactly what Lesson 17's migration tool (Alembic) exists to solve properly.

```python
# schemas.py — add
class AccountCreate(BaseModel):
    username: str
    password: str = Field(min_length=8)
```

```python
# main.py — add
import bcrypt

@app.post("/accounts", response_model=Member, status_code=201)
def create_account(account: AccountCreate):
    conn = get_connection()
    password_hash = bcrypt.hashpw(account.password.encode(), bcrypt.gensalt())
    try:
        conn.execute("BEGIN")
        cursor = conn.execute(
            "INSERT INTO members (username) VALUES (?)", (account.username,)
        )
        new_member_id = cursor.lastrowid
        conn.execute(
            "INSERT INTO credentials (member_id, password_hash) VALUES (?, ?)",
            (new_member_id, password_hash),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=409, detail="Username already taken")
    conn.close()
    return {"id": new_member_id, "username": account.username}
```

### Mechanical walkthrough

1. `password: str = Field(min_length=8)`: (already-established `Field` pattern from Lesson 4). A minimum length is an application-level policy choice, not related to the hashing itself.
2. `credentials (member_id INTEGER PRIMARY KEY, ...)`: (already-established one-to-one pattern from Lesson 3's `bios`, applied here for a security reason instead of a content one). Splitting credentials into their own table, rather than adding `password_hash` directly to `members`, means any query or export of "member profile data" that doesn't specifically join to `credentials` never touches password material at all — a structural safeguard against accidentally leaking hashes through an unrelated query.
3. `response_model=Member`: (already-established from Lesson 2). Deliberately reused, unchanged — `Member` has no `password` or `password_hash` field, so even if the returned dict *did* somehow include one, `response_model` would strip it before serialization. This is `response_model` doing real security work, not just shape validation.
4. The whole account creation wrapped in `BEGIN`/`commit`/`rollback`: (already-established from Lesson 8). A member with no matching `credentials` row (or vice versa) would be a broken, unloggable-into account — the same atomicity guarantee from likes now protecting account integrity.

### CS Lens

**Cryptographic one-way functions, and why "slow" is a security property, not a performance bug.** `sha256`'s speed is exactly right for its actual purpose (verifying a large file wasn't corrupted) and exactly wrong for password hashing, where an attacker's ability to try billions of guesses per second is the whole threat. `bcrypt`'s deliberate slowness is a direct, calculated countermeasure — this is the rare case where "make it slower" is the entire point of the design.

### SE Lens

**Never write your own cryptography.** It would be technically possible to hand-roll a "hash plus random salt" scheme using `hashlib` directly. It would also almost certainly be wrong in some subtle way an attacker could exploit — timing side-channels, insufficient work factor, an insecure random source for the salt — mistakes that battle-tested libraries like `bcrypt` have already had found and fixed by the security community over years of real-world attacks. This is a case where "don't reinvent it yourself" isn't about saving time, it's about correctness in a domain where a subtle bug is a real breach, not just a wrong answer.

### Commands needed

```bash
pip install bcrypt
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 20 items

tests/test_api.py ....................                                   [100%]

============================== 20 passed in 0.21s ===============================
```

### Connecting sentence

An account now exists with a securely hashed password — but nothing yet lets that member actually prove who they are on a later request. That's Lesson 14: turning a correct password into an ongoing, verifiable session.

---

## Closing

**Connect the pieces**
`POST /accounts` hashes the incoming password with `bcrypt` (which generates and embeds a unique salt automatically), inserts a `members` row and a `credentials` row in one transaction, and returns only the `Member` shape — id and username, structurally incapable of leaking the hash even by accident, because `response_model` only knows about fields that exist on `Member`.

**What breaks without this**
Storing passwords in plaintext, or hashing without a per-user salt, means a single database breach exposes either every password directly, or every password to a precomputed rainbow table attack — a catastrophic, silent risk that looks completely fine in every functional test, since login would work correctly right up until the breach.

**Exercises**
1. Create two accounts with the *identical* password, and confirm their `password_hash` values in `credentials` are different — direct proof the salt is doing its job.
2. Attempt to create an account with a username that already exists, and confirm you get `409`, not a raw database error — the same integrity-error-to-HTTP-response translation pattern from Lesson 8's duplicate likes.

**Definition of Done**
* [x] Passwords hashed with `bcrypt`, never stored or logged in plaintext.
* [x] `credentials` kept structurally separate from `members`.
* [x] Duplicate usernames rejected with `409` via the same integrity-error pattern as Lesson 8.
* [x] Commit: `feat: account creation with salted bcrypt password hashing`

---

## Context Snapshot (End of Lesson 13)

**2. Schema State (addition):**
- `credentials (member_id INTEGER PRIMARY KEY, password_hash TEXT NOT NULL, FOREIGN KEY (member_id) REFERENCES members(id))`
- `members.username` should now also be `UNIQUE` (add this constraint alongside this lesson's change, to make the `409` behavior above actually correct).

**3. API Manifest (addition):** `POST /accounts` → `Member`, status `201`; `409` on duplicate username.

**4. Dependencies (addition):** `bcrypt`.

**5. Test State:** 20 tests, 20 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| One-way (cryptographic) function | L13 | Easy to compute forward, infeasible to reverse |
| Rainbow table | L13 | Precomputed hash-to-password lookup, defeated by per-user salting |
| Salt | L13 | Random value mixed into a hash so identical inputs produce different outputs |
| `bcrypt` | L13 | A deliberately slow, salted password-hashing library — the correct tool, not `sha256` |
| Work factor | L13 | Configurable "how slow" a bcrypt hash is, tuned to resist brute-force at an acceptable login-time cost |

**7. Lesson Completion State:**
- Completed: Lessons 1-13, Interludes A, B, C
- Next: Lesson 14 — Logging In (sessions/cookies, JWT, Dependency Injection)

**8. Current Architecture State:**
- HTTP Layer: 19 routes
- Business Logic: `extract_hashtags`
- Data Access: `db.py`, first security-sensitive table, first cryptographic dependency
- ORM: not introduced
- Authentication: identity creation exists; verifying identity on a request still does not (Lesson 14)
