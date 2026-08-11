# Lesson 36: Comparisons That Leak, and Hashes Built to Be Slow
### (Phase 7 — Authentication, Python)

**What you will build.** A real `PasswordHasher` — salted, deliberately
slow, verified with a comparison that doesn't leak information through
timing — and a real, signed `SessionTokens` system that detects
tampering and expiration correctly. The transferable problem this
lesson is actually about: security code has failure modes invisible to
every kind of testing this curriculum has used so far — a wrong answer
doesn't crash or print incorrectly, it just quietly stays exploitable,
and the only way to see that is to measure the exact thing an attacker
would measure.

**What you need to know first.** The phase-transition note's own
preview — unsalted hashes producing identical output for identical
input — which this lesson takes to its real, production-grade fix.
Project 1, Lesson 4 — `pytest`, real measured proof over asserted
correctness, the same standard this lesson applies to a security
property instead of a functional one.

---

## Concept Unit: A Timing Attack, Measured

### The Problem

Comparing two strings for equality — a password, a token, a secret key
— seems like it should be safe with Python's ordinary `==`. It isn't,
and the reason is invisible to every kind of testing used so far in
this curriculum: `==` is *correct* (it always returns the right `True`
or `False`), but *how long it takes* to return that answer leaks
information a security-sensitive comparison should never leak.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — none; this unit runs directly at the Python
  interpreter, no project file yet.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — `time`, part of the standard library.

### The New Code

```python
import time

secret = "x" * 5000

def time_compare(guess, iterations=50000):
    times = []
    for _ in range(7):
        start = time.perf_counter()
        for _ in range(iterations):
            secret == guess
        times.append(time.perf_counter() - start)
    return min(times)
```

### The Updated Project

No file yet — this unit's entire content is a measurement.

### Introduce the concept in isolation

```python
wrong_early = "y" + "x" * 4999   # wrong at the very first character
wrong_late = "x" * 4999 + "y"    # wrong only at the very last character

t1 = time_compare(wrong_early)
t2 = time_compare(wrong_late)
```

Real output:

```
Wrong at position 0:    0.00344s
Wrong at position 4999: 0.00890s
Ratio: 2.59x
```

Two guesses, both wrong, both correctly rejected by `==` — but the
guess that's wrong *only at the very last character* took **2.6 times
longer** to compare than the guess that's wrong at the *first*
character. Python's `==` compares strings left to right and stops the
instant it finds a mismatch — `wrong_early` fails on character 1;
`wrong_late` has to check all 4,999 correct characters before finally
failing on the last one. That timing difference is real, measured, and
— critically — **detectable from outside the program**, by an attacker
who can send guesses and measure how long each one takes to be
rejected, one character position at a time.

### Discard the throwaway example

Not applicable — no file was created; the measurement itself is the
unit's content, and the fix, in the next section, uses the identical
methodology to prove it actually closes the gap.

### Project Change (the fix)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — none; a second, identical measurement.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — `hmac`, part of the standard library.

### The New Code

```python
import hmac

def time_compare(guess, iterations=50000):
    times = []
    for _ in range(7):
        start = time.perf_counter()
        for _ in range(iterations):
            hmac.compare_digest(secret, guess)
        times.append(time.perf_counter() - start)
    return min(times)
```

### The Updated Project

The identical measurement, with `hmac.compare_digest(secret, guess)`
replacing `secret == guess` — nothing else changed, specifically so the
comparison between the two results is a fair, direct proof.

### Mechanical walkthrough

- `hmac.compare_digest(secret, guess)` — **(a) first appearance.** A
  function specifically designed to compare two values in
  **constant time** — meaning the time it takes does not depend on
  *where* the first difference occurs, only on the total length being
  compared, which is itself fixed and known in advance for this use
  case.

### CS lens

This is a **timing side-channel attack**: extracting information not
from a program's *output*, but from *how long it takes to produce that
output* — a real, exploitable channel completely orthogonal to whether
the program's logic is correct. Also recognized in: cryptographic key
comparison (the exact reason `hmac.compare_digest` exists in Python's
own standard library), CPU cache-timing attacks (Spectre and Meltdown,
famous real vulnerabilities exploiting timing differences in hardware
itself), any system where "how long did that take" is observable by
someone who shouldn't be able to infer anything from it.

### SE lens

Proven directly, same methodology, same string, only the comparison
function changed:

```
Wrong at position 0:    0.18761s
Wrong at position 4999: 0.18779s
Ratio: 1.00x
```

The 2.6x gap is gone — both timings are, within measurement noise,
identical. The real cost: `hmac.compare_digest` is measurably slower
overall for a *single* comparison (compare the raw magnitudes above)
than `==`, because it deliberately does the same fixed amount of work
regardless of where a mismatch occurs — a real, deliberate tradeoff of
raw speed for a security guarantee `==` was never designed to provide.
Worth stating precisely: `==` isn't a bad tool in general — it's the
*correct* tool for nearly everything in this curriculum so far;
`compare_digest` is specifically for the narrow, security-sensitive
case of comparing secrets against untrusted input.

### Commands needed

`python3 <file>.py` or `python3 -c "..."` — this unit's own
measurements were run directly at the interpreter, the same pattern
used for quick checks throughout Project 3, Lesson 8.

### Run it

Both shown above.

### Connecting sentence

A comparison can leak information through timing alone — the next unit
builds real password storage on top of a comparison that doesn't.

---

## Concept Unit: Password Hashing, Built to Be Slow

### The Problem

The phase-transition preview already proved plain SHA-256 produces
identical output for identical input — a real vulnerability to
precomputed rainbow tables. A salt fixes that specific gap, but a
second, separate problem remains: SHA-256 is *fast* — deliberately,
since it's designed for things like verifying file integrity, where
speed is a feature. For password storage, speed is a liability: a fast
hash lets an attacker who steals a password database try billions of
guesses per second against it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `password_hasher.py`.
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `hashlib`, `os`, `hmac` — all standard library, no
  installation needed.

### The New Code

```python
import hashlib
import os
import hmac


class PasswordHasher:
    ITERATIONS = 600_000

    @staticmethod
    def hash(password: str) -> str:
        salt = os.urandom(16)
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), salt, PasswordHasher.ITERATIONS
        )
        return f"{PasswordHasher.ITERATIONS}${salt.hex()}${digest.hex()}"

    @staticmethod
    def verify(password: str, stored: str) -> bool:
        iterations_str, salt_hex, digest_hex = stored.split("$")
        salt = bytes.fromhex(salt_hex)
        expected_digest = bytes.fromhex(digest_hex)

        actual_digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), salt, int(iterations_str)
        )

        return hmac.compare_digest(actual_digest, expected_digest)
```

### The Updated Project

Brand-new file, shown whole above.

### Mechanical walkthrough

- `salt = os.urandom(16)` — **(a) first appearance** of `os.urandom`:
  generates genuinely random bytes suitable for cryptographic use —
  distinct from Python's ordinary `random` module, which is fast but
  *predictable* given its internal state, and never appropriate for
  anything security-sensitive.
- `hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PasswordHasher.ITERATIONS)`
  — **(a) first appearance** of **PBKDF2** (Password-Based Key
  Derivation Function 2): repeatedly applies SHA-256, internally,
  `ITERATIONS` times in a row — proven, in the next section, to be
  hundreds of thousands of times slower than a single SHA-256 call, on
  purpose.
- `f"{PasswordHasher.ITERATIONS}${salt.hex()}${digest.hex()}"` — **(a)
  first appearance,** as a design decision: the iteration count and
  salt are stored *alongside* the digest, in the same string — critical
  because `verify` later needs the *exact* salt used originally (a
  fresh random salt wouldn't reproduce the same digest) and the exact
  iteration count, in case that number is ever increased for new
  passwords while old ones still need to verify correctly against
  their original count.
- `hmac.compare_digest(actual_digest, expected_digest)` — **(b) hard
  concept reappearing**: this lesson's own previous unit, applied
  directly — verifying a password uses the exact same timing-safe
  comparison already proven necessary.

### CS lens

This is **key stretching**: deliberately making a cryptographic
operation slow, specifically to make brute-force guessing
proportionally slower too — a real, named technique, not an accidental
side effect. Also recognized in: bcrypt and scrypt (two other, widely
used real password-hashing algorithms, both built on the identical
"deliberately slow" principle, with different internal designs),
Argon2 (the current, most recommended standard, designed to also resist
GPU-accelerated cracking specifically), any real login system's
password storage — this is not an advanced, rarely-used technique, it's
the baseline expectation for any system storing passwords at all.

### SE lens

Proven directly — the actual, measured cost of this design choice:

```
SHA-256 time:   0.0020ms
PBKDF2 time:    426.0097ms (600,000 iterations)
PBKDF2 is 217020x slower, deliberately
```

**217,000 times slower** — and that's precisely the point: a legitimate
login, checking one password once, barely notices 426 milliseconds. An
attacker trying to brute-force a stolen password database now has to
spend that same 426 milliseconds *per guess, per password*, turning a
plausible attack (billions of fast SHA-256 guesses per second) into an
impractical one. And the salt genuinely works as intended:

```python
stored2 = PasswordHasher.hash("correct horse battery staple")
```

```
Two hashes of the same password are identical? False
But both verify correctly? True
```

The exact same password produces a genuinely different stored value
every time it's hashed — because each call generates a fresh random
salt — and both still verify correctly, because `verify` reads the salt
back out of the stored value itself rather than needing to guess it.

### Commands needed

Same `python3` pattern.

### Run it

Shown above, in full.

### Connecting sentence

A password can now be stored and verified safely — the final unit uses
these same tools, timing-safe comparison included, to keep a user
authenticated *after* login, without ever asking for their password
again on every single request.

---

## Concept Unit: Signed Session Tokens

### The Problem

Re-checking a full password on every single request would be
impractical and, worse, would mean transmitting the password itself
repeatedly. Something needs to represent "this specific user has
already proven who they are, recently" — issued once at login, checked
cheaply on every later request — without that something being trivially
forgeable by anyone who simply guesses or edits it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `session_token.py`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `hmac`, `hashlib`, `time`, `json`, `base64` — all
  standard library.

### The New Code

```python
class SessionTokens:
    def __init__(self, secret_key: bytes):
        self.secret_key = secret_key

    def issue(self, user_id: str, ttl_seconds: int = 3600) -> str:
        payload = {"user_id": user_id, "expires": time.time() + ttl_seconds}
        payload_bytes = json.dumps(payload).encode()
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode()

        signature = hmac.new(self.secret_key, payload_b64.encode(), hashlib.sha256).hexdigest()

        return f"{payload_b64}.{signature}"

    def verify(self, token: str):
        try:
            payload_b64, signature = token.split(".")
        except ValueError:
            return None, "malformed token"

        expected_signature = hmac.new(self.secret_key, payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            return None, "signature does not match -- token was tampered with or forged"

        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        if time.time() > payload["expires"]:
            return None, "token expired"

        return payload["user_id"], None
```

### The Updated Project

Brand-new file, shown whole above.

### Mechanical walkthrough

- `payload = {"user_id": user_id, "expires": time.time() + ttl_seconds}`
  — **(b) hard concept reappearing**: a plain dict, holding exactly the
  claims this token makes: who it's for, and when it stops being valid.
- `base64.urlsafe_b64encode(payload_bytes).decode()` — **(a) first
  appearance** of **base64 encoding**: converts arbitrary bytes (here,
  JSON text) into a safe, printable string using only URL-safe
  characters — necessary because the payload will travel inside a
  string token, and raw JSON could contain characters unsafe for that
  context.
- `signature = hmac.new(self.secret_key, payload_b64.encode(), hashlib.sha256).hexdigest()`
  — **(a) first appearance** of `hmac.new`: computes a cryptographic
  signature *combining* the payload with a secret key only the server
  knows — critically, this is not just a hash of the payload alone;
  without knowing `secret_key`, it's computationally infeasible to
  produce a signature that will match a *tampered* payload.
- `if not hmac.compare_digest(signature, expected_signature):` — **(b)
  hard concept reappearing**: this lesson's own timing-safe comparison,
  applied a third time — checking a signature is exactly as
  security-sensitive as checking a password, and deserves the identical
  protection.
- `if time.time() > payload["expires"]:` — **(b) hard concept
  reappearing**: a plain comparison against a stored timestamp — no
  special protection needed here, since expiration isn't a secret being
  guessed, just a fact being checked.

### CS lens

This is a **signed token**, and the specific shape here — payload plus
an HMAC signature over it — is the same core idea behind **JWTs** (JSON
Web Tokens), one of the most widely used real authentication token
formats on the web today, simplified here to its essential mechanism.
Also recognized in: any tamper-evident data format (a code-signing
certificate, a software update's signature, a blockchain transaction's
own signature), cookies signed by a web framework to prevent a client
from editing their own session data undetected.

### SE lens

Proven directly, three real cases:

```python
token = tokens.issue("user-42", ttl_seconds=3600)
user_id, error = tokens.verify(token)
```

```
Verify real token -> user_id: user-42 error: None
```

A genuine, valid token verifies correctly. Now, real tampering — an
attacker who intercepts a token and tries to alter its signature (the
same attack would apply to altering the payload itself, since the
signature is computed over it):

```python
payload_part, sig_part = token.split(".")
tampered = payload_part + "." + ("0" * len(sig_part))
user_id, error = tokens.verify(tampered)
```

```
Verify tampered token -> user_id: None error: signature does not match -- token was tampered with or forged
```

Correctly rejected, with a precise, specific reason — the same standard
of diagnostic precision Project 10, Lessons 29–31 held dependency and
version resolution to. And a genuinely expired token:

```python
expired_token = tokens.issue("user-42", ttl_seconds=-10)
user_id, error = tokens.verify(expired_token)
```

```
Verify expired token -> user_id: None error: token expired
```

Also correctly rejected, with its own distinct reason — a caller can
tell the difference between "this token is fake" and "this token was
real but has simply expired," a real, useful distinction a production
system needs to handle differently (a forged token might mean an
active attack worth logging; an expired token just means "please log
in again").

### Commands needed

Same pattern.

### Run it

Shown above, all three cases.

### Connecting sentence

Every idea in this lesson closes into one working authentication flow:
a password is stored using a hash deliberately slow enough to resist
brute force, checked with a comparison that leaks nothing through
timing, and — once verified — a signed, expiring token stands in for
repeated password checks, itself protected by the identical timing-safe
comparison this lesson opened with.

---

## Closing

**Connect the pieces.** One login, through the whole lesson: a user
submits a password; `PasswordHasher.verify` recomputes its PBKDF2
digest using the stored salt and iteration count, then compares it to
the stored digest with `hmac.compare_digest` — timing-safe, proven
necessary in this lesson's first unit. On success, `SessionTokens.issue`
builds a signed token, itself protected the same way on every future
`verify` call — the exact same constant-time comparison, reused for a
second, equally sensitive purpose. Every piece of this lesson rests on
one repeated tool, applied wherever secret-dependent comparison happens
to occur.

**What breaks without this.** Already shown, precisely, three separate
times: the real 2.6x timing leak from naive `==`, the real 217,000x
speed difference between a fast hash and a real password hash, and the
real, correctly distinguished tampered-versus-expired token failures —
deliberately not restaged, since each landed exactly where it mattered.

**Exercises.**
1. Add a `refresh(token)` method to `SessionTokens` that issues a new
   token with a fresh expiration, but only if the current token is
   still valid — deciding, and justifying, what should happen if it's
   already expired.
2. This lesson's tampering demo replaced the *signature* with zeros.
   Try tampering with the *payload* instead (change `"user_id":
   "user-42"` to `"user_id": "user-1"` inside the decoded, re-encoded
   payload) and confirm — with real output — that `verify` still
   correctly rejects it.
3. `PasswordHasher.ITERATIONS` is a fixed class constant. Research why
   real systems periodically *increase* this number as hardware gets
   faster, and describe, in a few sentences, how `verify` could detect
   a password hashed with an old, lower iteration count and
   transparently re-hash it with the new one on next successful login.

**Definition of done.**
- [ ] You've measured a real timing difference from naive `==`
      comparison, and confirmed `hmac.compare_digest` closes it,
      against the same methodology both times.
- [ ] `PasswordHasher` correctly hashes and verifies passwords, with
      two hashes of the identical password confirmed different, and
      both confirmed to verify correctly.
- [ ] `SessionTokens` correctly issues, verifies, and — distinctly —
      rejects both a tampered and an expired token, each with its own
      precise, real error message.
- [ ] Commit with a message explaining why — e.g. `"Hash passwords with
      salted, deliberately slow PBKDF2, and issue HMAC-signed session
      tokens, using timing-safe comparison everywhere secrets are
      checked"` — not `"add authentication"`.

**Next lesson** stays in Phase 7: authorization — the real difference
between "this token proves who you are" (this lesson's whole subject)
and "this action is something you're actually allowed to do" — and
structured logging, once a system needs to be debugged by a machine
parsing thousands of log lines a second, not a human reading one at a
time.
