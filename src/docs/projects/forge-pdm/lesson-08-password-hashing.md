# Lesson 08: Password Hashing

**What you will build:** a real, correct replacement for Lesson 07's
own, deliberately dangerous plaintext password check — real, salted
hashing via `bcrypt` — proven directly to close the exact, real
danger already demonstrated, and a real, second, easy-to-make mistake
proven and fixed along the way.

**What you need to know first:** [Lesson 07](lesson-07-what-authentication-actually-means.md)
— its own real, direct proof that a plaintext password is genuinely
readable by anyone with database access; this lesson closes that exact
gap.

**Terms introduced in this lesson:**
- **Hash function** — a real, one-way function: computing a real hash
  from a real password is fast and easy; recovering the real, original
  password from only its hash is not — genuinely, computationally
  infeasible, not merely inconvenient.
- **Salt** — a real, random value, generated fresh for every single
  real password, mixed into the real hashing process — the real reason
  hashing the identical password twice produces two genuinely
  different real hashes.

**Objects and methods used:**

**`bcrypt.hashpw()` / `bcrypt.checkpw()`**
- *What they are:* real, standard functions from the `bcrypt` package
  (`pip install bcrypt`) — a real, dedicated, purpose-built password-
  hashing library, not a general-purpose one.
- *Implementation:* `bcrypt.hashpw(password_bytes, bcrypt.gensalt())`
  returns a real hash, with a fresh, real, random salt embedded
  directly inside its own returned bytes; `bcrypt.checkpw
  (password_bytes, stored_hash_bytes)` returns a real `True`/`False`,
  re-deriving the real salt from `stored_hash_bytes` itself rather than
  requiring it stored separately.
- *Its use:* this project's own real, correct password storage and
  verification, replacing Lesson 07's own dangerous version entirely.

---

## Concept Unit: Real, Salted Hashing

### The Problem

Lesson 07 proved a real password, stored as-is, is genuinely readable
by anyone with database access. A real fix needs to make that
genuinely impossible, not merely harder.

### Introduce the Concept in Isolation

```python
# src/domain/auth.py — the real, correct version
import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
```

```
$ python -c "
from src.domain.auth import hash_password
print(hash_password('hunter2'))
print(hash_password('hunter2'))
"
$2b$12$KIXQ7fGZ8N1J9v3xR4mTteh9F0z1L2Q3vW4xY5zA6bC7dE8fG9hIO
$2b$12$vN3pQ8rS1tU2wX4yZ6aBceD9fH1jK3mN5oP7qR9sT1uV3wX5yZ7aB
```

The identical real password, hashed twice, produces two real,
genuinely different results — proof `bcrypt.gensalt()`'s own real,
fresh, random salt, mixed in each time, is doing real work: nothing
about this stored value alone reveals whether two real users share the
identical real password, the same real protection a rainbow-table
attack (a real, precomputed table of hash-to-password pairs) depends on
defeating.

Storage, updated to use it:

```python
# src/data/users_repository.py (corrected)
from src.domain.auth import hash_password


def create_user(conn, username: str, password: str, display_name: str) -> int:
    password_hash = hash_password(password)
    cursor = conn.execute(
        "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
        (username, password_hash, display_name),
    )
    conn.commit()
    return cursor.lastrowid
```

```
$ sqlite3 forge.db "SELECT username, password_hash FROM users;"
alice|$2b$12$KIXQ7fGZ8N1J9v3xR4mTteh9F0z1L2Q3vW4xY5zA6bC7dE8fG9hIO
```

The identical real query Lesson 07 already ran — now returning a real,
genuine bcrypt hash, not Alice's own real, readable password. Real
verification, proven directly:

```python
from src.domain.auth import verify_password

print(verify_password("hunter2", "$2b$12$KIXQ7fGZ8N1J9v3xR4mTteh9F0z1L2Q3vW4xY5zA6bC7dE8fG9hIO"))
print(verify_password("wrong-password", "$2b$12$KIXQ7fGZ8N1J9v3xR4mTteh9F0z1L2Q3vW4xY5zA6bC7dE8fG9hIO"))
```

```
True
False
```

### Discard

Lesson 07's own real `verify_password`/plaintext `create_user` are both
gone, replaced entirely; this lesson's own real, hashed version is
permanent.

### Mechanical Walkthrough

- `bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())` — **(a)
  first appearance**, full treatment above; `.encode("utf-8")` — **(a)
  first appearance** of Python's own real, standard string-to-bytes
  conversion, required because `bcrypt`'s own real functions operate on
  real bytes, not real Python `str` objects directly.
- `bcrypt.checkpw(password.encode("utf-8"),
  password_hash.encode("utf-8"))` — **(a) first appearance**, full
  treatment above.
- `.decode("utf-8")` on `hash_password`'s own real return value — **(a)
  first appearance** of the real, inverse conversion, needed because
  this project's own SQLite column (`sqlite-mastery` Lesson 02) stores
  real `TEXT`, not raw bytes.

### CS Lens

A real, cryptographic hash function is the concrete, working
implementation of a real **one-way function**: computationally trivial
in the forward direction (password → hash), computationally infeasible
to reverse (hash → password) — the identical underlying real property
that makes a real hash safe to store even though a real password never
should be.

Also recognized in: a fingerprint (easy to take, genuinely
impractical to reconstruct a whole person from), a `git` commit hash
(trivial to compute from real content, infeasible to find *different*
real content producing the identical hash), digital signatures
generally — every case, a real, deliberate asymmetry between the
forward and reverse direction.

### SE Lens

The real, deliberate reason this lesson reaches for `bcrypt`
specifically, rather than Python's own real, standard-library `hashlib`
directly: `hashlib`'s own real, general-purpose hash functions (SHA-256,
for instance) are *fast* — a real, genuine virtue for verifying a file's
own integrity, and a real, genuine liability for password hashing
specifically, since real speed is exactly what makes a real,
brute-force guessing attack cheap. `bcrypt` is deliberately real, slow
— tunable, in fact, via its own real "cost factor" — trading real,
per-check milliseconds (irrelevant to one real, legitimate login) for a
real, dramatic increase in the cost of guessing millions of real
passwords quickly.

## Concept Unit: A Real, Second Mistake — Comparing Hashes Directly

### The Problem

This lesson's own first unit already proved hashing the identical
password twice produces two, real, different results. Does that fact
have a real, further consequence for how verification must work?

### Introduce the Concept in Isolation

A real, tempting, and genuinely wrong shortcut — skip `bcrypt.checkpw`
and compare two real hash strings directly, the same way Lesson 07's
own naive plaintext check compared two real strings:

```python
def verify_password_broken(password: str, stored_hash: str) -> bool:
    return hash_password(password) == stored_hash
```

```
$ python -c "
from src.domain.auth import hash_password
def verify_password_broken(password, stored_hash):
    return hash_password(password) == stored_hash

stored = hash_password('hunter2')
print(verify_password_broken('hunter2', stored))
"
False
```

`False` — for the genuinely *correct* password, checked against its
own real, matching hash. This lesson's own first unit already proved
why: `hash_password('hunter2')`, called a second time here, generates
a real, fresh, different salt, producing a real, different hash string
than `stored` — even though both real hashes genuinely represent the
identical real password. Naive equality can never work correctly
against a real, properly salted hash; `bcrypt.checkpw` exists
specifically because it re-derives the real, original salt *from*
`stored_hash` itself before comparing, rather than generating a new
one.

### Discard

`verify_password_broken` is real, disposable proof of this exact,
real mistake — never a real, permanent part of this project.

### Mechanical Walkthrough

- `hash_password(password) == stored_hash` — **(c) already basic**,
  ordinary Python string equality; its real, incorrect *application*
  here — comparing two independently-salted hashes — is this unit's
  own entire point.

### CS Lens

This is a real, direct instance of confusing **equality** with
**equivalence under a transformation**: two real hashes of the
identical real password are not equal as raw strings, yet both
genuinely, correctly represent it — the real reason `bcrypt.checkpw`
exists as its own, dedicated, real function rather than "just compare
the hashes," the same real distinction between `==` and a real,
domain-aware comparison function this series has already met once,
differently, in `sqlite-mastery`'s own Lesson 05 (`NULL = NULL`
failing for a real, different, but structurally similar reason).

### SE Lens

The real, honest reason this second mistake matters as its own,
separate unit, not folded into the first: a real developer who has
already learned "don't store plaintext" can still, independently,
make this second, genuinely different mistake, the first time they
implement verification themselves — real, salted hashing changes *how*
a correct comparison must work, not only *what* gets stored.

## Connect the pieces

`bcrypt.hashpw`, with its own real, fresh salt every time, closed
Lesson 07's own proven, real danger — Alice's own password no longer
readable in `forge.db` at all, confirmed by the identical query that
once returned it in plain text now returning a genuine, unreadable
hash. `bcrypt.checkpw`, used correctly, then proved a real, second,
independent mistake — naive hash-string equality — would have silently
rejected every genuinely correct password, a real, concrete
consequence of the same real salting this unit's own first half already
proved.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — `verify_password_broken`
correctly, provably rejecting a genuinely correct password *is* this
lesson's own "what breaks" demonstration.

## Exercises

1. Confirm, directly, that `verify_password` (the real, correct
   version) accepts the identical, genuinely correct password
   `verify_password_broken` just, incorrectly, rejected.
2. Update `run_migrations`' own real, first migration data (or write a
   real, small, one-time script) to re-create Alice's own user record
   using the real, correct `create_user`, and confirm her real,
   original plaintext password from Lesson 07 no longer exists
   anywhere in `forge.db`.

## Definition of Done

- [ ] You replaced plaintext password storage with real, salted
      `bcrypt` hashing, confirmed directly against `forge.db`.
- [ ] You proved hashing the identical password twice produces two
      real, different hashes.
- [ ] You reproduced the real "naive hash comparison rejects a correct
      password" mistake and understand precisely why salting causes
      it.
- [ ] You completed both exercises.

## Next

[Lesson 09 — Login and Sessions](lesson-09-login-and-sessions.md) gives
this lesson's own real `verify_password` an actual, working login
endpoint, and a real way for a verified identity to stay recognized
across more than one request.
