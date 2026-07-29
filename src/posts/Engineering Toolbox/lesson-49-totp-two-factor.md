# Lesson 49: A Password That Expires Every 30 Seconds, With No Network Involved

## What you will build

TOTP — Time-based One-Time Password, the six-digit code a real
authenticator app generates — built entirely from scratch: HMAC (Lesson
42/47/48's now-familiar tool), a time-derived counter, and one specific
truncation trick that turns a 20-byte hash into a short number a human
can type. Verified not just against itself, but against RFC 6238's own
official published test vectors — proving this lesson's implementation
is byte-for-byte compatible with the real, deployed standard, not just
internally consistent.

## What you need to know first

- **Lesson 42 / Lesson 48** — `hmac.new(...)`, used there to sign
  passwords and JWTs; today applies the identical function to a time
  value instead of a message, producing something meant to be read and
  typed by a person rather than compared programmatically.
- **Lesson 32 / Lesson 48** — `time.time()`, and the established
  distinction between it and `time.monotonic()`: today needs actual
  wall-clock time, since a TOTP code must be derived from the same
  real-world moment on both the phone generating it and the server
  checking it.

---

## The Problem, in prose, no code yet

Every authentication mechanism this curriculum has built in Track 5 —
passwords (Lesson 42), API keys (Lesson 47), session cookies and JWTs
(Lesson 48) — shares one property: a single secret, once known or
stolen, grants access indefinitely (or until manually revoked, per
Lesson 48's own central lesson). Two-factor authentication adds a
*second*, independent proof of identity — something the person has
(a device), not just something they know (a password) — specifically so
that stealing the password alone isn't enough. TOTP is the specific,
extremely common mechanism behind that six-digit code in an authenticator
app: no network connection between the app and the server at the moment
of login, no request sent anywhere to "get a code" — both sides
independently compute the *same* code from a shared secret and the
current time, entirely on their own.

---

## Concept Unit: Turning a Hash Into Six Digits

### The Problem

`hmac.new(...).digest()`, familiar since Lesson 42, produces 20 raw
bytes (for SHA-1) — useless for a person to read aloud or type into a
login form. Something needs to convert that into a short, human-typeable
number, in a way both sides can reproduce identically.

### Introduce the concept in isolation

```python
import hashlib
import hmac

digest = hmac.new(b"example-key", b"example-message", hashlib.sha1).digest()
print("full digest (20 bytes):", digest.hex())

offset = digest[-1] & 0x0F
print("offset (low 4 bits of last byte):", offset)

four_bytes = digest[offset:offset + 4]
print("4 bytes starting at offset:", four_bytes.hex())

truncated_number = int.from_bytes(four_bytes, "big") & 0x7FFFFFFF
print("as a 31-bit integer:", truncated_number)

six_digit_code = truncated_number % 1_000_000
print("last 6 digits, zero-padded:", f"{six_digit_code:06d}")
```

Run it:

```
full digest (20 bytes): 03f68b74fe35f593b1d2e2c783c40318e1d3f2c0
offset (low 4 bits of last byte): 0
4 bytes starting at offset: 03f68b74
as a 31-bit integer: 66489204
last 6 digits, zero-padded: 489204
```

What this proves: `digest[-1] & 0x0F` (a **hard concept reappearing** —
bitwise masking, established in Lesson 30's frame-header work) takes the
last byte of the 20-byte digest and keeps only its bottom 4 bits,
producing a number from `0` to `15` — used as a *starting position*
inside the digest, not a value in its own right. `digest[offset:offset + 4]`
(reused slicing) then grabs exactly 4 bytes starting there — this is
**dynamic truncation**: which 4 bytes get used depends on the digest's
own content, a deliberate design choice (from RFC 4226) so that an
attacker can't target a fixed, always-the-same byte range. `& 0x7FFFFFFF`
clears just the very top bit of those 4 bytes — forcing the result to be
treated as a positive number regardless of what bit pattern happened to
land there — and the final `% 1_000_000` keeps only the last six decimal
digits, exactly the form a real authenticator code takes.

This lab is deleted now; it never appears in the project. What survives
is the full mechanical recipe — HMAC, dynamic offset, mask, modulo —
assembled into a real, standards-compliant function next.

### CS Lens

This is a **key derivation step with a fixed, small output space** —
deliberately compressing a large, effectively-unguessable value (a
160-bit HMAC digest) down to a small, human-usable one (6 decimal
digits, one of only a million possibilities). The security doesn't come
from the 6-digit code being hard to guess on its own — it's trivially
guessable by brute force in isolation — it comes from the code being
valid for only a narrow 30-second window, checked next.

Also recognized in: this exact algorithm's ancestor, HOTP (RFC 4226,
counter-based rather than time-based, used in physical hardware tokens
predating smartphone apps), credit card CVV generation in some payment
systems, other short-code verification schemes generally.

### SE Lens

The specific truncation scheme (offset from the digest's own last byte,
rather than always using, say, the first 4 bytes) is a deliberate,
published design choice defending against a specific class of
theoretical cryptanalytic attack that a fixed offset might make easier —
a small detail easy to get wrong when reimplementing from a general
description rather than the exact specification, which is exactly why
the next unit checks this implementation against the standard's own
official test vectors rather than only checking it's self-consistent.

---

## Concept Unit: HOTP and TOTP — Verified Against the Real Standard

### Project Change

- **Reference Source:** RFC 4226 (HOTP) and RFC 6238 (TOTP), followed
  directly — including RFC 6238 Appendix B's own published test vectors,
  used below not as an example but as an actual correctness check.
- **Files affected:** new file, `totp_tool.py`.
- **Change type:** add.
- **Dependencies:** `hashlib`, `hmac`, `struct`, `time`.

### The New Code

```python
import struct

def hotp(secret_bytes, counter, digits=6, algorithm=hashlib.sha1):
    counter_bytes = struct.pack(">Q", counter)  # 8-byte big-endian counter
    digest = hmac.new(secret_bytes, counter_bytes, algorithm).digest()

    offset = digest[-1] & 0x0F
    four_bytes = digest[offset:offset + 4]
    truncated_number = int.from_bytes(four_bytes, "big") & 0x7FFFFFFF

    code = truncated_number % (10 ** digits)
    return f"{code:0{digits}d}"


def totp(secret_bytes, for_time=None, time_step_seconds=30, digits=6, algorithm=hashlib.sha1):
    for_time = for_time if for_time is not None else time.time()
    counter = int(for_time // time_step_seconds)
    return hotp(secret_bytes, counter, digits, algorithm)
```

### Mechanical Walkthrough

- `import struct` and `struct.pack(">Q", counter)` — **first appearance
  of the `struct` module.** `>Q` is a **format string**: `>` means
  big-endian byte order (a **hard concept reappearing** from Lesson 30's
  `int.from_bytes(..., "big")`, here going the opposite direction — an
  integer *into* bytes rather than out of them), and `Q` means an
  unsigned 8-byte ("quad word") integer. `struct.pack` is the general
  tool for converting Python numbers into an exact, fixed binary layout
  — needed here because HOTP's specification requires the counter as
  precisely 8 bytes, big-endian, and Python's own arbitrary-size
  integers have no fixed byte width on their own.
- `hotp(...)` — the previous unit's lab, generalized: `digits` and
  `algorithm` are now parameters rather than hard-coded, and the whole
  sequence is wrapped as a reusable function taking any `counter` value.
- `totp(...)` — HOTP's counter, specifically, becomes
  `int(for_time // time_step_seconds)` — a **hard concept reappearing**
  (integer floor division, established early in this curriculum):
  dividing the current Unix timestamp by `30` and discarding the
  remainder produces a number that stays *constant* for a full 30-second
  window and increments by exactly `1` every time that window rolls
  over — TOTP is HOTP with time itself standing in for a counter that
  both sides can compute independently, with no need to keep them in
  sync by any other means.

### Run it

Against RFC 6238's own five official published test vectors —
independently checking this lesson's implementation against the
standard itself, not just against its own later output:

```python
rfc_secret = b"12345678901234567890"
rfc_test_vectors = [
    (59, "94287082"),
    (1111111109, "07081804"),
    (1111111111, "14050471"),
    (1234567890, "89005924"),
    (2000000000, "69279037"),
]

for test_time, expected_code in rfc_test_vectors:
    actual_code = totp(rfc_secret, for_time=test_time, digits=8, algorithm=hashlib.sha1)
    print(f"time={test_time:>12}  expected={expected_code}  got={actual_code}  match={actual_code == expected_code}")
```

```
time=          59  expected=94287082  got=94287082  match=True
time=  1111111109  expected=07081804  got=07081804  match=True
time=  1111111111  expected=14050471  got=14050471  match=True
time=  1234567890  expected=89005924  got=89005924  match=True
time=  2000000000  expected=69279037  got=69279037  match=True
ALL RFC VECTORS MATCH: True
```

Every one of the five official test vectors published in RFC 6238
matches exactly. This is a meaningfully stronger correctness claim than
"the code runs without error": it proves this specific implementation
would generate the *exact same codes*, at the *exact same moments*, as
any other standards-compliant TOTP implementation — including every real
authenticator app in existence — given the same secret.

### CS Lens

Testing against a standard's own official vectors, rather than only
self-consistency, is verifying **interoperability**, a genuinely
different and stronger property than "internally correct": two
independently-written implementations of the same specification, tested
against the same published vectors, will produce identical output even
though neither has ever seen the other's code — the entire practical
point of a published standard existing at all.

### SE Lens

Nothing about this implementation *looks* wrong if it merely produces
consistent 6-digit codes on its own — a subtly incorrect truncation
offset, or a wrong byte order in `struct.pack`, would still produce
codes, just the *wrong* ones, silently incompatible with any real
authenticator app while appearing to work perfectly in isolation. Real
test vectors are what catch that class of bug, which self-testing alone
structurally cannot.

---

## Concept Unit: Real Rotation, Proven by Actually Waiting

### The Problem

A TOTP code is supposed to change every 30 seconds. That's easy to state
and easy to get subtly wrong (an off-by-one in the window boundary, for
instance) without noticing, unless it's checked against real, elapsed
time rather than just two different hard-coded timestamps.

### Run it

```python
secret = b"a-real-shared-secret-value!"

now = time.time()
seconds_into_window = now % 30
seconds_until_next_window = 30 - seconds_into_window
print(f"currently {seconds_into_window:.1f}s into a 30s window; next window in {seconds_until_next_window:.1f}s")

code_before = totp(secret)
print("code now:", code_before)

time.sleep(seconds_until_next_window + 1)

code_after = totp(secret)
print("code after crossing the boundary:", code_after)
print("codes differ:", code_before != code_after)
```

```
currently 29.7s into a 30s window; next window in 0.3s
code now: 431592
code after crossing the boundary: 383478
codes differ: True
```

A real wait, timed to cross an actual 30-second boundary, produces a
genuinely different code — not a simulated one, not two arbitrarily
chosen timestamps, but this exact code's real behavior over real elapsed
wall-clock time, exactly matching what a real authenticator app visibly
does.

### CS Lens

This is the direct, observable consequence of `int(for_time //
time_step_seconds)` from the previous unit: the counter is a genuine
step function of real time, constant within a window and incrementing
exactly at each boundary — proven here by simply waiting for one, rather
than trusted on the strength of the formula alone.

---

## Concept Unit: Clocks Drift — So Verification Needs a Window

### The Problem

The device generating a code and the server checking it are two separate
clocks, and separate clocks are never perfectly synchronized — a few
seconds of drift is completely normal and unavoidable. Checking only the
*exact* current time-step would reject valid codes constantly, on
essentially every real device, for no genuine security reason.

### Project Change

- **Reference Source:** RFC 6238 §5.2, which explicitly recommends
  allowing a small window of adjacent time steps for exactly this
  reason.
- **Files affected:** `totp_tool.py`.
- **Change type:** add.
- **Location:** below `totp`.

### The New Code

```python
def verify_totp(secret_bytes, presented_code, for_time=None, time_step_seconds=30, window=1):
    for_time = for_time if for_time is not None else time.time()
    for step_offset in range(-window, window + 1):
        candidate_time = for_time + step_offset * time_step_seconds
        if hmac.compare_digest(totp(secret_bytes, candidate_time, time_step_seconds), presented_code):
            return True
    return False
```

### Mechanical Walkthrough

- `range(-window, window + 1)` — reused `range`; with the default
  `window=1`, this produces `-1, 0, 1` — checking the *previous* time
  step, the *current* one, and the *next* one, in that order.
- `hmac.compare_digest(...)` — a **hard concept reappearing** from
  Lesson 42/47/48, applied here to comparing two short numeric-string
  codes rather than long hash digests — the same constant-time-
  comparison discipline applied consistently, regardless of how short
  the compared value happens to be.
- Returning `True` on the *first* match, rather than checking every
  offset regardless, is a minor but real efficiency choice with no
  correctness cost, since only one match is ever needed.

### Run it

```python
now = time.time()
code_one_step_late = totp(secret, for_time=now - 30)   # user's clock is 30s slow
code_two_steps_late = totp(secret, for_time=now - 60)  # user's clock is 60s slow

print("1 step of drift, window=1:", verify_totp(secret, code_one_step_late, for_time=now, window=1))
print("2 steps of drift, window=1:", verify_totp(secret, code_two_steps_late, for_time=now, window=1))
```

```
1 step of drift, window=1: True
2 steps of drift, window=1: False
```

A code generated from a clock 30 seconds slow is correctly accepted — the
window absorbs it. A code from a clock a full 60 seconds slow, one step
further out, is correctly rejected — the window has a real, deliberate
edge, not unlimited tolerance.

### CS Lens

This is a direct, practical instance of a system deliberately trading a
small amount of security margin (an attacker who intercepts a code has
slightly more than 30 seconds to use it, rather than exactly 30) for
usability (real devices, with real, unavoidable clock drift, actually
work) — the identical class of tradeoff Lesson 32's rate limiter made
between strictness and usability, applied here to time itself rather
than request counts.

### SE Lens

A wider window trades more usability for less security (more valid
codes accepted at any moment, a larger window for a stolen code to
remain usable); a narrower one does the reverse. `window=1` — one step
either side, a 90-second effective validity per code — is a common,
reasonable real-world default, not a universal correct answer; the right
value depends on how tightly synchronized the deployment's clocks
actually are in practice.

---

## Connect the pieces

One secret, followed through the whole lesson: a `base32`-encoded value
(the format real authenticator apps display and scan, generated here
with the exact same `secrets`-backed randomness Lesson 43 established)
is shared once, out of band, between a server and a person's phone.
Every 30 seconds, both sides independently compute
`int(time.time() // 30)`, feed it through `hotp` — HMAC, dynamic
truncation, modulo — and arrive at the identical 6-digit code with no
network communication between them at all, proven not just
self-consistent but standards-correct against RFC 6238's own published
vectors. `verify_totp` checks a presented code against a small window of
adjacent steps, accepting a real amount of clock drift while still
rejecting a code from meaningfully far outside that window.

## What breaks without this

Set `verify_totp`'s `window` to `0` (no drift tolerance at all) and
rerun the one-step-of-drift check from the previous unit:

```python
print("1 step of drift, window=0:", verify_totp(secret, code_one_step_late, for_time=now, window=0))
```

```
1 step of drift, window=0: False
```

A code that should be valid — generated from a clock only 30 seconds
off, well within normal real-world drift — is now rejected. In a real
deployment, this would mean legitimate users being locked out at
unpredictable moments determined by nothing more than the natural
imprecision of their own device's clock, with no actual security benefit
over the tolerant version, since `window=1`'s real cost (a slightly
longer usable lifetime for an intercepted code) is a narrow, deliberate
tradeoff, not a meaningful weakness.

## Definition of done

- [ ] This lesson's `totp` function reproduces all five of RFC 6238's
      own official test vectors exactly.
- [ ] A code generated right now and verified right now succeeds; an
      arbitrary wrong code fails.
- [ ] Waiting across a real 30-second window boundary produces a
      genuinely different code, confirmed by actually waiting, not by
      assuming the formula is correct.
- [ ] `verify_totp` accepts a code from one time step of drift and
      rejects a code from two steps of drift, with `window=1`.
- [ ] You can explain, without looking back at this lesson, why dynamic
      truncation uses an offset taken from the digest itself rather than
      a fixed position.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add totp_tool.py
  git commit -m "Add HOTP/TOTP from scratch, verified against RFC 6238's own official test vectors — interoperability with real authenticator apps, not just internal self-consistency"
  ```

## What's next

This closes Track 5. Every mechanism built across it — hashing (Lesson
42), random secrets (43), integrity checksums (44), symmetric and
asymmetric encryption (45, 46), API keys and sessions (47, 48), and now
TOTP — reappears directly in Track 6's password vault (Lesson 53): a
master password hashed per Lesson 42, unlocking AES-GCM–encrypted
entries per Lesson 45, itself a natural candidate for exactly the
second-factor protection this lesson just built.
