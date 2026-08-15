# Lesson 07: What Authentication Actually Means

**What you will build:** this project's own first, real user record —
and a real, deliberately naive first attempt at checking a password,
proven directly to be a genuine, serious danger before Lesson 08 fixes
it for real.

**What you need to know first:** [Lesson 05](lesson-05-schema-migrations.md)
— the real `users` table this lesson's own first, real row lives in.

**Terms introduced in this lesson:**
- **Identity** — a real, unverified *claim* about who someone is — a
  real username typed into a real login form, on its own, is nothing
  more than this.
- **Authentication** — the real, active process of *verifying* an
  identity claim is genuinely true — proving the real person behind a
  claimed username actually knows what only the real account holder
  should know.
- **Authorization** — a real, separate question, asked only *after*
  authentication succeeds: given this real, now-verified identity,
  what is it actually allowed to do? (Lesson 11's own full, dedicated
  subject — named here, not yet built.)

**Objects and methods used:** none new — this lesson's own real code is
deliberately simple, small enough to need no new library at all, so its
own real danger is easy to see clearly before Lesson 08 introduces the
real fix.

---

## Concept Unit: Three Real, Different Questions

### The Problem

"Is this user logged in" sounds like one real question. It is
genuinely three, and confusing them is a real, common, serious mistake
this project's own real, existing app cannot afford to repeat.

### Introduce the Concept in Isolation

A real username, typed into a real, imagined login form: `"alice"`.
On its own, this is **identity** — a real, bare claim, nothing more;
anyone could type it, whether or not they are genuinely Alice.
**Authentication** is the real, separate step of proving that claim —
checking a real password only the genuine Alice should know.
**Authorization**, a real, third, separate question, only reachable
once authentication has genuinely succeeded: is *this*, now-verified
Alice allowed to create a new admin account, or only view files?

Three real, genuinely different failure modes, each naming exactly
which of the three questions went wrong:

- A real request with no username at all → no real identity claim
  exists → rejected before authentication is even attempted.
- A real username that exists, paired with the wrong real password →
  a real identity claim, genuinely *failing* authentication.
- A real username and correct real password, for a real user whose own
  real role is `'user'`, attempting to create an admin → authentication
  *succeeds*; authorization is what correctly refuses it.

Collapsing any two of these into one real check is a real, common
source of security bugs — checking only "does this username exist,"
for instance, would silently skip authentication's own real job
entirely.

### Discard

Not applicable — this unit is real, direct reasoning about three real,
already-named terms, not disposable example code.

### Mechanical Walkthrough

Not applicable — no code was introduced in this unit.

### CS Lens

This is a real, direct instance of the classic **AAA** framework
(Authentication, Authorization, Accounting) used throughout real
security engineering — Forge's own real, later audit log (Phase 5)
supplies the third, real "Accounting" piece: a permanent, real record
of what an authenticated, authorized identity actually did.

### SE Lens

The real, honest reason this project draws this distinction explicitly,
in its own dedicated lesson, before any real code exists: Vault's own
real BRD names role-based access control as *explicitly out of scope*
for its own v1.0. Forge does not have that real luxury — the actual,
existing application already has a real super-admin/admin hierarchy —
meaning authorization cannot be an afterthought bolted onto
authentication later; it has to be understood as its own, real,
separate concern from this project's very first identity-related
lesson.

## Concept Unit: A Real, Deliberately Naive First Attempt

### The Problem

This project's own real, first user needs to exist somewhere, checked
against some real password. What does the most obvious, real, first
attempt actually look like — and what is genuinely wrong with it?

### Introduce the Concept in Isolation

```python
# src/data/users_repository.py — a real, deliberately naive first version
def create_user(conn, username: str, password: str, display_name: str) -> int:
    cursor = conn.execute(
        "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
        (username, password, display_name),
    )
    conn.commit()
    return cursor.lastrowid
```

```python
# src/domain/auth.py — a real, deliberately naive first version
def verify_password(stored_password: str, provided_password: str) -> bool:
    return stored_password == provided_password
```

```
$ python -c "
import sqlite3
from src.data.users_repository import create_user
conn = sqlite3.connect('forge.db')
create_user(conn, 'alice', 'hunter2', 'Alice')
"
```

This real code works — a real user, `alice`, with a real, checkable
password, now exists. The real, genuine danger is not in whether it
works; it's in what that real password looks like at rest:

```
$ sqlite3 forge.db "SELECT username, password_hash FROM users;"
alice|hunter2
```

Alice's own real, actual password — `hunter2` — sits in the real
database file, in genuinely plain, readable text, under a column
literally named `password_hash` despite holding nothing hashed at all.
Anyone with real, read access to `forge.db` — a real database browser,
a real backup file, a real, accidental commit of this file into
version control — reads every real user's real password directly, with
no real effort at all.

### Discard

`verify_password`'s own real, plaintext-comparison body, and
`create_user`'s own real, plaintext-storing `INSERT`, are both
disposable — Lesson 08 replaces both with a real, correct, hashed
version; neither one becomes a real, permanent part of this project.

### Mechanical Walkthrough

- `def verify_password(stored_password, provided_password): return
  stored_password == provided_password` — **(c) already basic**,
  ordinary Python string equality; its real, deliberate *use* here —
  as the entire real authentication check — is this unit's own point.
- `INSERT INTO users (username, password_hash, display_name) VALUES
  (?, ?, ?)` — **(b) hard concept reappearing**, `sqlite-mastery`
  Lesson 18's own parameterized `INSERT`; the real, plaintext value
  passed for `password_hash` is this unit's own real, deliberate
  mistake, not a syntax problem.

### CS Lens

Storing a real, reversible copy of a real secret — rather than a real,
one-way, unforgeable proof that the correct secret was once supplied
— is the exact, real failure a **cryptographic hash function** (Lesson
08's own real, dedicated subject) is specifically designed to prevent:
a real function computable in one real direction only, so that even
someone with full, real, direct access to the stored value cannot
recover the real, original secret from it.

### SE Lens

The real, honest reason this lesson builds the naive version at all,
rather than jumping straight to Lesson 08's own real fix: the concrete,
provable cost — a real password, read directly out of the database in
plain text — is far more convincing, and far more memorable, than an
abstract warning that "storing plaintext passwords is bad practice."
This project's own real, existing app may already have exactly this
real mistake somewhere in it; proving the cost directly, once, here, is
the real, honest reason Lesson 08's own fix is worth the real,
additional work it requires.

## Connect the pieces

Three real, distinct questions — identity, authentication, authorization
— were named and distinguished before any real code existed, because
this project's own real authorization needs (a super-admin hierarchy)
cannot be deferred the way Vault's own real v1.0 deferred them. A real,
deliberately naive password check then proved, directly, exactly what
plaintext storage costs: Alice's own real password, read straight out
of `forge.db` with one ordinary `SELECT`, by anyone with real, direct
access to the file at all.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — the real, plaintext `hunter2`,
read directly from `forge.db`, *is* this lesson's own "what breaks"
demonstration.

## Exercises

1. Query `forge.db` directly and confirm, yourself, that Alice's real
   password is genuinely readable in plain text — do not proceed to
   Lesson 08 until you've seen this real result with your own eyes.
2. Write two or three real sentences distinguishing this project's own
   real authentication step (Lesson 08–09) from its own real
   authorization step (Lesson 11), using this project's own real
   super-admin/admin/user hierarchy as your concrete example.

## Definition of Done

- [ ] You can state, from memory, the real, distinct question each of
      identity, authentication, and authorization answers.
- [ ] You created a real, first user with this lesson's own
      deliberately naive, plaintext password check.
- [ ] You confirmed directly, by querying `forge.db`, that the real
      password is genuinely readable in plain text.
- [ ] You completed both exercises.

## Next

[Lesson 08 — Password Hashing](lesson-08-password-hashing.md) replaces
this lesson's own real, dangerous plaintext check with a real, correct,
one-way hash — closing the exact, real danger just proven directly.
