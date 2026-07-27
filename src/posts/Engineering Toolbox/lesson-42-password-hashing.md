# Lesson 42: A Password Hash Should Be Slow, Unique, and Boringly Compared

## What you will build

A `UserStore` that registers users and verifies their passwords without
ever storing the passwords themselves — built up through three real,
measured problems with the obvious naive approach, each fixed in turn:
identical passwords producing identical, comparable hashes; a hash
function fast enough that guessing millions of passwords is cheap; and a
comparison operation whose timing can itself leak information. The
transferable problem this lesson is actually about: "hash the password"
is not one decision, it's several, and getting any one of them wrong
quietly undermines the whole point even when the code runs without
error and looks correct.

## What you need to know first

- **Lesson 13 / Lesson 30** — `hashlib`, already used for file
  deduplication and the WebSocket handshake's `Sec-WebSocket-Accept`
  computation. Today reuses the same module for a security-critical
  purpose instead of an integrity-checking one — a distinction this
  lesson draws out directly.
- **Lesson 37** — measuring real elapsed time to compare two approaches
  (there, request timeouts; here, hashing speed) using
  `time.perf_counter()`.

---

## The Problem, in prose, no code yet

Storing a user's password as plain text is an obviously bad idea — if
the storage is ever read by anyone unauthorized, every password is
immediately exposed. "Hash the password before storing it" is the
standard fix, and `hashlib` already sits right there in the standard
library, already used twice in this curriculum. It would be easy to
assume the fix is just `hashlib.sha256(password.encode()).hexdigest()`
and move on. That assumption is wrong in three separate, independent
ways, each demonstrated directly below — and importantly, none of the
three failures would show up as a bug during ordinary testing: a naively
hashed password system logs users in correctly, rejects wrong passwords
correctly, and looks completely correct until specifically analyzed for
exactly the properties this lesson checks.

---

## Concept Unit: The Same Password Should Never Look the Same Twice

### The Problem

Two different users who happen to choose the same password — not
unlikely at real scale, since people reuse common passwords constantly —
would, under naive hashing, end up with identical stored hashes. Anyone
who can read the stored data at all (a database backup, a leaked table)
can then see directly which accounts share a password, without ever
cracking anything — and once one of those two passwords is guessed or
cracked by any means, the other account is compromised for free.

### Introduce the concept in isolation

```python
import hashlib

def naive_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

users = {
    "alice": naive_hash("sunshine123"),
    "bob": naive_hash("correct horse"),
    "carol": naive_hash("sunshine123"),  # happens to pick the same password as alice
}

for username, password_hash in users.items():
    print(f"{username}: {password_hash}")

print()
print("alice and carol have identical hashes:", users["alice"] == users["carol"])
```

Run it:

```
alice: 816a4092660e4e87b5b584c4a51e7b33db2fb1b8f972578ef90c5ed7608e0f19
bob: 4104d36f8da2c254349f85836793ebe029e0c957063a34c91c2e9203187b5631
carol: 816a4092660e4e87b5b584c4a51e7b33db2fb1b8f972578ef90c5ed7608e0f19
alice and carol have identical hashes: True
```

What this proves: `hashlib.sha256(...).hexdigest()`, already established
since Lesson 13, is **deterministic** — the same input always produces
the exact same output, with no randomness involved at all. That's
normally exactly the property that makes a hash function useful (Lesson
30's handshake depended on both sides computing the identical value) —
but here it's a direct information leak: `alice` and `carol`'s identical
hashes are visible proof they share a password, readable by anyone who
can see the stored table, without needing to crack anything.

This lab is deleted now; it never appears in the project. What survives
is the gap: a password hashing scheme needs to make identical inputs
produce *different* stored values.

### CS Lens

This is a direct consequence of hashing being a **pure function** — same
input, same output, forever, with no hidden state involved. That property
is exactly right for content-addressing (Lesson 30, Lesson 41) and
exactly wrong here, where the goal is deliberately *hiding* whether two
inputs matched.

### SE Lens

Nothing about `hashlib.sha256`'s own design is a mistake — it's doing
precisely what a general-purpose hash function is supposed to do.
The mistake is applying a general-purpose tool to a problem (password
storage) that has an extra requirement — hiding equality between inputs
— a general-purpose hash was never built to satisfy. The fix isn't a
different hash function; it's changing *what gets hashed*.

---

## Concept Unit: Salting

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `user_store.py`.
- **Change type:** add.
- **Dependencies:** `hashlib`, `os` — standard library only.

### Introduce the concept in isolation

```python
import hashlib
import os

def salted_hash(password, salt):
    return hashlib.sha256(salt + password.encode()).hexdigest()

alice_salt = os.urandom(16)
carol_salt = os.urandom(16)

alice_hash = salted_hash("sunshine123", alice_salt)
carol_hash = salted_hash("sunshine123", carol_salt)

print("alice salt:", alice_salt.hex())
print("carol salt:", carol_salt.hex())
print("alice hash:", alice_hash)
print("carol hash:", carol_hash)
print()
print("same password, but hashes now identical?:", alice_hash == carol_hash)
```

Run it:

```
alice salt: e0e3985660f321e2aeafe3eecd823fab
carol salt: 4fec4887ec8242eb5ac34632c76f5b54
alice hash: 9ebd155d765ce6729e6192ecd5ffd22ab98fe38d16b19a3cabad2c096e6eeca1
carol hash: 1cb480a7f97f96a3a7d05161bf31f7e8a15964a977f55fd4940304f012cd4a5b
same password, but hashes now identical?: False
```

What this proves: `os.urandom(16)` (**first appearance**) generates 16
genuinely random bytes from the operating system's own cryptographically
secure randomness source — distinct from Python's general-purpose
`random` module (not yet used in this curriculum), which is fast but
explicitly *not* safe for anything security-related, since its output
can, in principle, be predicted by an attacker who observes enough of
it. Prepending that random **salt** (**first appearance of this term**)
to the password before hashing means the actual input to `sha256` now
differs for alice and carol even though their passwords are identical —
and the output proves it: two completely different hashes, for the exact
same password.

This lab is deleted now; it never appears in the project. Salting
survives directly into the real `UserStore`, next — but plain
`sha256`, salted or not, still has one more real problem, shown next
before assembling the final version.

### CS Lens

A salt doesn't need to be secret — it's stored right alongside the hash,
in the open, and the code above prints it freely. Its entire job is
**uniqueness**, not secrecy: making the effective input different for
every user, so that identical passwords never produce identical outputs.
This is worth stating explicitly because it's a common point of
confusion: a salt is not a second password.

Also recognized in: cryptographic nonces (a "number used once," the same
uniqueness-not-secrecy role, in a different context — TLS handshakes use
them for a related reason), the random `Sec-WebSocket-Key` in Lesson 30
(also not secret, also there purely to make each handshake's computed
value unique).

### SE Lens

Salting also defeats **rainbow tables** — large, precomputed lookup
tables mapping common passwords to their hashes, built once and reused
against any leaked, unsalted hash database. A precomputed table is
built against *one specific* hash function with no salt; a random,
per-user salt means an attacker would need a separate precomputed table
for every possible salt value, which is exactly what makes precomputation
infeasible again.

---

## Concept Unit: Fast Is the Wrong Property for This Job

### The Problem

Salting fixes the identical-hash leak, but `sha256` remains, by design,
extremely *fast* — a property that's usually a virtue (Lesson 30's
handshake needed to compute quickly) and is a direct liability here: an
attacker who obtains a leaked, salted hash can still try guessing
candidate passwords against it, one at a time, and a fast hash function
lets them try an enormous number of guesses per second.

### Introduce the concept in isolation

```python
import hashlib
import os
import time

password = "sunshine123"
salt = os.urandom(16)

attempts = 100_000
start_time = time.perf_counter()
for _ in range(attempts):
    hashlib.sha256(salt + password.encode()).hexdigest()
sha256_elapsed = time.perf_counter() - start_time
print(f"{attempts:,} plain SHA-256 hashes: {sha256_elapsed:.3f}s "
      f"({attempts / sha256_elapsed:,.0f} guesses/sec if this were an attacker)")

pbkdf2_attempts = 100
start_time = time.perf_counter()
for _ in range(pbkdf2_attempts):
    hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
pbkdf2_elapsed = time.perf_counter() - start_time
print(f"{pbkdf2_attempts:,} PBKDF2 hashes (200,000 iterations each): {pbkdf2_elapsed:.3f}s "
      f"({pbkdf2_attempts / pbkdf2_elapsed:,.0f} guesses/sec if this were an attacker)")
```

Run it:

```
100,000 plain SHA-256 hashes: 0.098s (1,017,922 guesses/sec if this were an attacker)
100 PBKDF2 hashes (200,000 iterations each): 12.421s (8 guesses/sec if this were an attacker)
```

What this proves, with real measured numbers, not an estimate: plain
salted SHA-256 allows over **one million** guesses per second on this
machine alone (a real attacker would use far more powerful, specialized
hardware, making the real number vastly higher still). `hashlib.pbkdf2_hmac`
(**first appearance**) — PBKDF2, "Password-Based Key Derivation Function
2" — takes the same hash algorithm and *deliberately* runs it over and
over, here 200,000 times per password guess, collapsing the attack rate
to roughly **8 guesses per second** on the same machine: a reduction of
more than five orders of magnitude, for the one, singular guess a real
login attempt actually needs to make.

This lab is deleted now; it never appears in the project.

### CS Lens

This is a **key derivation function**, a category distinct from a plain
hash function: `pbkdf2_hmac` internally applies `hmac` (built on
`sha256`) repeatedly, feeding each round's output back in as the next
round's input — deliberately trading speed for **computational cost**,
the opposite design goal from every hash function this curriculum has
used so far.

Also recognized in: `bcrypt` and `scrypt` (older, still-common
alternatives to PBKDF2, adding memory-hardness — deliberately requiring
significant RAM per guess too, not just CPU time, to resist
specialized cracking hardware that has plenty of CPU power but limited
fast memory), `argon2` (the current recommended default for new systems,
combining both properties more thoroughly still) — all solving the exact
same problem this unit just measured, with different specific tradeoffs
this lesson doesn't need to resolve to make its core point.

### SE Lens

The cost this lesson's own `UserStore` will pay for this: every single
real login attempt now takes a small, deliberate, measurable fraction of
a second (part of the ~0.124 seconds per PBKDF2 call measured above,
scaled down since a real login checks exactly one password, not
thousands) rather than being effectively instantaneous. That's the
entire point, not a regrettable side effect: the cost is negligible for
one legitimate login and devastating, multiplied across billions of
guesses, for an attacker — a deliberate, asymmetric tradeoff, tuned by
the iteration count, which real systems increase over time as hardware
gets faster.

---

## Concept Unit: Comparing Hashes Without Leaking Timing

### The Problem

Verifying a login means comparing the freshly computed hash of an
attempted password against the stored hash. Python's ordinary `==`
operator on two byte strings, in principle, can return as soon as it
finds the first differing byte, rather than always checking every byte —
which means, in principle, a mismatch on the very first byte could be
distinguishable, by careful timing measurement, from a mismatch on the
last byte, potentially letting an attacker guess a hash one byte at a
time rather than needing to guess it all at once.

### Attempting to measure it directly

```python
import time

target = b"\xff" * 32
early_mismatch = b"\x00" + b"\xff" * 31
late_mismatch = b"\xff" * 31 + b"\x00"

trials = 3_000_000
for trial_round in range(3):
    start = time.perf_counter()
    for _ in range(trials):
        target == early_mismatch
    early_time = time.perf_counter() - start

    start = time.perf_counter()
    for _ in range(trials):
        target == late_mismatch
    late_time = time.perf_counter() - start

    print(f"round {trial_round}: early={early_time:.4f}s late={late_time:.4f}s")
```

Run it:

```
round 0: early=0.2371s late=0.2221s
round 1: early=0.2068s late=0.2245s
round 2: early=0.2046s late=0.2137s
```

Reported honestly rather than cleaned up to look more convincing than it
is: the results are **inconsistent** — round 0 and round 2 show the
early mismatch taking longer, round 1 shows the opposite. At 32 bytes,
Python's own loop and function-call overhead completely swamps whatever
true per-byte comparison time difference actually exists at the CPU
level, so a local, single-process Python loop like this one is not a
reliable way to detect the effect. This doesn't mean the underlying risk
is fake — it's well-documented and has been exploited for real against
network services, where the signal is extracted statistically, from
thousands of *network round trips*, specifically because a single
measurement is far too noisy to trust, exactly as demonstrated here even
in a much more controlled, all-local setting.

### The fix

```python
import hmac
hmac.compare_digest(stored_key, candidate_key)
```

`hmac.compare_digest` (**first appearance**) is specifically built to
take the same amount of time to run regardless of *where*, or whether,
the two inputs first differ — a **constant-time comparison**. Using it
removes the need to reason about whether this specific system's timing
characteristics happen to be exploitable at all — the same
"why guess when a purpose-built tool already solves it correctly"
argument this curriculum made for `smtplib` over hand-rolled SMTP in
Lesson 36.

### CS Lens

This is defending against a **side-channel attack** — extracting secret
information not from the comparison's *result* (which any correct
comparison must reveal — "match" or "no match" is the whole point) but
from an unintended side effect of *how* the result was computed, here,
timing. The same category includes attacks based on power consumption,
electromagnetic emissions, or cache access patterns — all cases where a
system is technically answering only the intended question but leaking
extra information anyway through its own physical implementation.

### SE Lens

Writing a correct constant-time comparison by hand is genuinely
difficult — compiler and interpreter optimizations can silently
reintroduce timing variation even in code that looks constant-time at
the source level, which is exactly the trap this unit's own inconclusive
measurement attempt sits next to: a demonstration that timing effects are
real but too subtle to verify casually is also a demonstration of why
hand-rolling this defense, and trusting your own testing to confirm it
worked, is a bad idea. `hmac.compare_digest` exists specifically so this
decision is made once, correctly, by people who specialize in exactly
this problem, rather than separately, and riskily, by every project that
needs it.

---

## Concept Unit: Assembling `UserStore`

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `user_store.py`.
- **Change type:** add.
- **Dependencies:** every concept unit above.

### The New Code

```python
PBKDF2_ITERATIONS = 200_000


def hash_password(password, salt=None):
    salt = salt or os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return salt, derived_key


class UserStore:
    def __init__(self):
        self.users = {}  # username -> (salt, derived_key)

    def register(self, username, password):
        if username in self.users:
            raise ValueError(f"user {username!r} already exists")
        salt, derived_key = hash_password(password)
        self.users[username] = (salt, derived_key)

    def verify(self, username, password):
        if username not in self.users:
            return False
        stored_salt, stored_key = self.users[username]
        _, candidate_key = hash_password(password, salt=stored_salt)
        return hmac.compare_digest(stored_key, candidate_key)
```

### Mechanical Walkthrough

- `hash_password(password, salt=None)` — every piece here is a **hard
  concept reappearing** from the units above, composed together:
  generate (or reuse, if provided) a salt, then run PBKDF2 over the
  password and that salt at the fixed iteration count.
- `salt = salt or os.urandom(16)` — reused default-value pattern;
  registering a *new* user generates a fresh salt (`salt` argument
  omitted, defaults to `None`, which is falsy, so a new one is made),
  while *verifying* an existing user reuses that same stored salt,
  passed in explicitly — the hash can only match if the same salt is
  used both times.
- `self.users = {}` and the `username in self.users` checks — reused
  dictionary patterns, structurally identical to Lesson 32's
  `client_buckets`.
- `verify`'s `if username not in self.users: return False` — deliberately
  returns the same `False` an actually-wrong password would produce,
  rather than raising a distinct "no such user" error, so that an
  attacker probing for valid usernames can't distinguish "wrong
  password" from "account doesn't exist" just from the response shape —
  a real, if easy-to-miss, information leak of its own, avoided here by
  simple consistency.
- `hmac.compare_digest(stored_key, candidate_key)` — the previous unit's
  fix, applied at the one place in this whole file where a secret value
  is actually compared against user-influenced input.

### Run it

```python
store = UserStore()
store.register("alice", "sunshine123")
store.register("carol", "sunshine123")

print("alice correct password:", store.verify("alice", "sunshine123"))
print("alice wrong password:", store.verify("alice", "wrong-guess"))
print("unknown user:", store.verify("mallory", "anything"))
```

```
alice correct password: True
alice wrong password: False
unknown user: False
```

And confirming, end to end, that every problem this lesson identified is
actually fixed in the assembled version — not just in isolated labs:

```python
print("alice stored hash:", store.users["alice"][1].hex())
print("carol stored hash:", store.users["carol"][1].hex())
print("alice and carol hashes identical despite same password:",
      store.users["alice"][1] == store.users["carol"][1])
```

```
alice and carol hashes identical despite same password: False
```

---

## Connect the pieces

One password, `"sunshine123"`, followed through the complete, assembled
system: `register` generates a fresh random salt, runs it through
200,000 rounds of PBKDF2 alongside the password, and stores only the
salt and the resulting derived key — never the password itself, at any
point. A later `verify` call re-derives a candidate key using the
*same stored salt* and the newly supplied password, then compares the
two derived keys using `hmac.compare_digest` rather than `==`. Every one
of this lesson's three real, separately-demonstrated problems —
identical passwords leaking through identical hashes, a hash function
fast enough to brute-force at scale, and a comparison whose timing could
itself leak information — is addressed by one specific, separate piece
of this small file.

## What breaks without this

Reverting `hash_password` to plain, unsalted, single-round
`hashlib.sha256` and re-registering `alice` and `carol` with the same
password reproduces this lesson's very first result exactly: identical
stored hashes, visible proof of a shared password to anyone who can read
the stored data, with the code otherwise running, and appearing to work,
without any error at all.

## Definition of done

- [ ] Two users registered with the same password produce different
      stored salts and different stored derived keys.
- [ ] `verify` returns `True` for the correct password and `False` for
      an incorrect one, using the *same* stored salt in both checks.
- [ ] `verify` returns `False`, not an exception, for a username that
      was never registered.
- [ ] You can state, from real measured numbers rather than a general
      claim, roughly how many orders of magnitude slower PBKDF2 at
      200,000 iterations is than plain SHA-256, on this machine.
- [ ] You can explain why this lesson's own timing-measurement attempt
      was inconclusive, and why that inconclusiveness is itself an
      argument for `hmac.compare_digest` rather than evidence the risk
      isn't real.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add user_store.py
  git commit -m "Add salted, deliberately-slow (PBKDF2) password hashing with constant-time verification — fixes identical-password leakage, brute-force speed, and comparison timing as three separate, independently-verified problems"
  ```

## What's next

Lesson 43's password generator is a natural companion — strong hashing
protects a password once it's stored, but does nothing about a user
choosing `"password123"` in the first place. Lesson 53's password vault
will reuse this exact `UserStore` shape (salt plus derived key, never
the plaintext) as its own master-password check, one layer before the
vault's *stored* passwords (Lesson 45's symmetric encryption territory,
a genuinely different problem: those need to be recoverable in full,
not just verified, which is exactly why hashing is the wrong tool for
them).
