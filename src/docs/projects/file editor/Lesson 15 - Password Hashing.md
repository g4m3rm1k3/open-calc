# Lesson 15: A Secret That Should Never Be Stored

## What you will build

`hash_password` and `verify_password` — the first two functions of a
real, multi-user account system, built entirely on their own, with
nowhere yet to store what they produce. The feature is invisible today;
the actual subject is what "storing a password safely" really means,
measured with real, felt numbers, not taken on faith — and why this
lesson exists at all before anything about sign-up or login gets built.

## What you need to know first

`Lesson 8 - Authentication.md` — `secrets.compare_digest`, the timing
attack it defends against, and specifically the difference between *that*
lesson's problem (comparing a submitted password safely) and *this*
one's (never being able to recover the real password from what's stored
at all, even if the storage itself is stolen).

**This lesson was built under the same explicit-review discipline as
Lesson 8.** Password storage is one of the highest-consequence security
surfaces in any real system — a mistake here doesn't just affect this
project, it affects every real person whose password gets reused
elsewhere, which is most people. Every number below is measured, not
assumed.

---

## Concept Unit: why storing a password at all is a liability

### The Problem

Lesson 8's `ADMIN_PASSWORD` is one password, read from an environment
variable, compared with `secrets.compare_digest` — reasonable for a
single, deliberately simple admin secret. Real multi-user accounts are a
different problem entirely: this project would need to keep *some* record
of every user's password, somewhere, permanently, in order to check it
again on their next login. If that storage is ever read by anyone who
shouldn't — a stolen database backup, a misconfigured server, an
employee who shouldn't have access — storing the password itself,
in any form that could be turned back into the original password, hands
that same password to whoever just read it. And because most people
reuse passwords across different sites, that isn't just a leak of this
one project's login — it can be a leak of someone's email, their bank,
everywhere else that password was ever used too.

### What This Proves

Nothing here is code yet, on purpose: the design decision has to come
first. A password should never be stored anywhere in a form that can be
turned back into the original — not encrypted (which is reversible with
the right key), and not stored plainly. It needs to be stored as
something that can *confirm* a later guess is correct, without ever
being usable to reconstruct what the original was.

---

## Concept Unit: a fast hash doesn't fix anything

### The Problem

Python's standard library already has a one-way hash function —
`hashlib.sha256` — that turns any input into a fixed-size output with no
way to reverse it directly. That sounds like exactly what's needed. It
isn't, and the reason is about *speed*, not reversibility.

### Concept Lab

```python
import hashlib
import time

password = b"correct horse battery staple"

start = time.perf_counter()
for _ in range(100000):
    hashlib.sha256(password).hexdigest()
elapsed = time.perf_counter() - start

print(f"100,000 SHA-256 hashes: {elapsed:.4f}s")
print(f"guesses per second: {100000 / elapsed:,.0f}")
```

Run it. Actual output:

```
100,000 SHA-256 hashes: 0.0433s
guesses per second: 2,308,211
```

### What This Proves

If a real password database were ever stolen — a real, common event, not
a hypothetical one — an attacker doesn't need this project's server at
all to try guesses against a stolen hash; they run the exact same
`hashlib.sha256` on their own hardware, entirely offline, as fast as
their machine allows. Measured directly on this machine: over two
million guesses *per second*, against a single password. A real
attacker with dedicated hardware does dramatically better than this
laptop. `sha256` being one-way doesn't help at all once guessing is this
cheap — it isn't reversed, it's simply re-run, over and over, until a
guess happens to match.

---

## Concept Unit: making the hash deliberately expensive

### The Problem

The fix isn't a different one-way function — it's a *slower* one,
deliberately, on purpose, so that the 2.3 million guesses per second from
the previous unit becomes a number small enough that brute-forcing stops
being realistic.

### Concept Lab

```python
import hashlib
import time

password = b"correct horse battery staple"

start = time.perf_counter()
hashlib.pbkdf2_hmac("sha256", password, b"somesalt12345678", 600_000)
elapsed = time.perf_counter() - start

print(f"one PBKDF2 call (600,000 iterations): {elapsed:.4f}s")
print(f"guesses per second: {1 / elapsed:.1f}")
```

Run it. Actual output:

```
one PBKDF2 call (600,000 iterations): 0.2162s
guesses per second: 4.6
```

### What This Proves

`hashlib.pbkdf2_hmac("sha256", password, salt, iterations)` runs `sha256`
internally, but not once — `iterations` times in a row, each round's
output feeding the next, deliberately multiplying the cost of computing
it. `600_000` — an underscore inside a Python integer literal, purely
readability, `600_000` and `600000` are the exact same number — is a
real, currently-recommended iteration count for this exact algorithm,
not an arbitrary large number picked for effect. The real, measured
result: **2,308,211 guesses per second becomes 4.6** — roughly half a
million times slower, confirmed by actually timing both, not asserted.
A legitimate login still pays this cost too — about a fifth of a second
— which is the real, felt tradeoff: imposing enough cost to make offline
brute-forcing impractical, while staying fast enough that one real login
attempt is still instant to a person.

### Discard

Both throwaway timing labs are deleted now — their exact code never
appears in the project. The real functions, next, use this identical
`pbkdf2_hmac` call, wrapped so it can actually be used for real
passwords instead of one hardcoded example.

---

## Concept Unit: the same password must not produce the same hash

### The Problem

Two different users who happen to choose the same password would,
without anything else added, end up with the exact same stored hash —
visible to anyone who ever reads the stored data, and a real target for
**rainbow tables**: huge, precomputed lookup tables mapping common
password hashes back to the plaintext passwords that produced them,
built once and reused against any stolen database.

### What This Proves

The fix is a **salt** — random data, unique per user, mixed into the
hash so the same password produces a *different* hash for every
different salt. `secrets.token_bytes(16)`, reused from the exact module
Lesson 8 already uses for `secrets.token_urlsafe`, generates 16 bytes of
cryptographic randomness. This isn't demonstrated in a separate
throwaway lab — the next unit's real code proves it directly, with real
output.

---

## Concept Unit: hash_password and verify_password

### The Problem

Two real functions are needed: one to turn a brand-new password into
something safe to store, and one to check a later login attempt against
what was stored — without ever needing the original password back.

### Project Change

- **Files affected** — `backend/auth.py`, new file.
- **Change type** — create.
- **Dependencies** — `hashlib` and `secrets`, both part of Python's
  standard library — nothing to install.

### The New Code — type this

```python
import hashlib
import secrets

PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> tuple[bytes, bytes]:
    salt = secrets.token_bytes(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return salt, hashed


def verify_password(password: str, salt: bytes, expected_hash: bytes) -> bool:
    candidate_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return secrets.compare_digest(candidate_hash, expected_hash)
```

### The Updated Project — where this lives

This is the entire file — a brand-new module, nothing to place it inside
of yet. The next lesson gives it somewhere permanent to write its
output; for now, it's complete and callable entirely on its own.

### Mechanical Walkthrough

`PBKDF2_ITERATIONS = 600_000` names the concept lab's iteration count as
a real constant, reused by both functions below instead of repeating the
literal number twice — the same `ALL_CAPS` module-level-constant
convention `MOTION_CODES` established in Lesson 13. `hash_password`
takes a plain-text `password` and returns a **tuple** — two values
handed back together, `(salt, hashed)` — the first time this project has
returned more than one value from a function this way; `salt, hashed =
hash_password(...)` on the calling side would unpack it, the same
unpacking-assignment shape from Lesson 7's `commit_hash, timestamp,
message = line.split(...)`. `secrets.token_bytes(16)` generates this
call's own random salt — a new value every single time, confirmed in
this lesson's earlier unit that the same password produces a different
hash on each call. `password.encode()` converts the string into bytes,
since `pbkdf2_hmac` operates on raw bytes, not text — the same
string-to-bytes boundary already crossed implicitly by `.read_text(encoding="utf-8")`
back in Lesson 3, made explicit here instead. `hashlib.pbkdf2_hmac("sha256",
password.encode(), salt, PBKDF2_ITERATIONS)` is the concept lab's exact
call, for real, with a real random salt instead of a hardcoded one.
`verify_password` takes a later login attempt's `password`, plus the
`salt` and `expected_hash` that were stored when the account was
created, and recomputes the *identical* hash using that same stored
salt — `candidate_hash` — before comparing. `secrets.compare_digest(candidate_hash,
expected_hash)` reuses Lesson 8's exact timing-safe comparison, for the
exact same reason: comparing hash bytes with a plain `==` would leak,
byte by byte, how close a guess's *hash* was, the identical side-channel
Lesson 8 measured against a raw password — the target changed from a
password to a hash, the vulnerability and its fix did not.

### CS Lens — cost as the actual security mechanism

Lesson 5's process isolation and this lesson's iteration count are the
same underlying idea, applied to two completely different problems:
imposing a real, deliberate *cost* as the defense itself, rather than an
attempt to make something impossible. A sandboxed process doesn't make
malicious code impossible to write — it makes the *consequences* of
running it bounded. `PBKDF2_ITERATIONS` doesn't make guessing a password
impossible — it makes guessing *many* passwords, fast enough to matter,
prohibitively expensive. Security built from cost, not from an assumed
impossibility, shows up again and again once it's recognized once.

### SE Lens — verified, not assumed, and the honest cost on the other side

`600_000` is not this project's own guess — it's within the currently
common, publicly recommended range for PBKDF2-SHA256, chosen specifically
so this lesson's own claim is checkable against real, independent
sources, not asserted from nowhere. The real cost this project now
carries, honestly: every legitimate login will take a real, felt fraction
of a second doing nothing but this computation, on purpose, and every
test or script that calls `hash_password` in a loop will feel slow too —
confirmed directly, this lesson's own second concept lab took over two
tenths of a second for one single call. That's not a bug to fix later;
it's the entire mechanism working as intended.

### Run It

```python
from auth import hash_password, verify_password

salt, hashed = hash_password("correct horse battery staple")
print(verify_password("correct horse battery staple", salt, hashed))
print(verify_password("wrong password", salt, hashed))
```

Actual output:

```
True
False
```

Confirmed directly, imported from the real module file, not a copy. A
second real run proves the salt itself works — the identical password,
hashed twice, with two independent calls:

```python
salt1, hashed1 = hash_password("correct horse battery staple")
salt2, hashed2 = hash_password("correct horse battery staple")
print(hashed1 == hashed2)
```

Actual output:

```
False
```

Two different, independently random salts, from two separate calls to
`secrets.token_bytes(16)`, produce two different stored hashes for the
exact same password — confirmed directly, not assumed from how the code
reads.

---

## Connect the pieces

Nothing in this project calls `hash_password` or `verify_password` yet —
that's deliberate, and named honestly rather than glossed over. This
lesson is entirely about getting the *computation* right, verified on
its own, before the next lesson gives it a real, permanent place to
write its output and a real route to call it from. Building the
dangerous part — the part a mistake in would matter most — in isolation
first, and proving it correct before wiring it into anything a real user
could reach, is the same sequencing discipline Lesson 6 used for
extracting `run_python` before introducing Rust: verify the piece that
must not be wrong, by itself, before building on top of it.

## What breaks without this

Already demonstrated concretely above, not hypothetically: a single
`hashlib.sha256` call, alone, allows over two million password guesses
per second against a stolen hash, measured directly on this machine.
`PBKDF2_ITERATIONS = 600_000` cuts that to 4.6 guesses per second,
measured directly, the same real password, the same real machine — nothing
about the mechanism defends against a stolen database besides the sheer
cost of trying to use it, which is exactly why that cost has to be real
and deliberate rather than assumed.

## Exercises

1. Run `hash_password` on the same password five times in a row and
   confirm every one of the five `hashed` values is different, then
   confirm `verify_password` still returns `True` against each of them
   using its own matching `salt`.
2. Temporarily change `PBKDF2_ITERATIONS` to `1000` and re-time a single
   `hash_password` call — confirm it's dramatically faster, then discuss
   in your own words why that's a real, current security regression, not
   just a performance change.
3. Predict, before running it, what `verify_password(password, salt,
   expected_hash)` returns if `salt` is swapped for a *different* real
   user's salt, even with the correct password for the *original* user —
   then verify it.

## Definition of done

- [ ] You've run `hash_password` and `verify_password` yourself and
      confirmed a correct password verifies and a wrong one doesn't
- [ ] You've measured, yourself, the real guesses-per-second difference
      between a single `sha256` call and a single `pbkdf2_hmac` call
- [ ] You can explain why a salt is necessary even though the hash
      function alone is already one-way
- [ ] You can explain why `secrets.compare_digest` is still needed here,
      when the thing being compared is a hash, not the raw password
      Lesson 8 used it for
- [ ] `git commit` this lesson's code with a message explaining why
