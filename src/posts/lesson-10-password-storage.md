# Lesson 10: Password Storage

Today we close the gap Lesson 7 deliberately left open. Hashing gave you a one-way
fingerprint — but a fingerprint of what, computed how fast, is still a live question, and
the wrong answer to either half has ended in real, large-scale password breaches. Our case
study is two users who happen to pick the same password, and the number 1,392,599 —
roughly how many guesses a second an attacker can try against the hash you built in
Lesson 7, unmodified.

## What you will learn

You'll see plain hashing leak information it was never supposed to leak, fix that with a
random per-user salt, then discover that salting alone still isn't enough — because the
hash function you've been using is *fast*, and fast is the wrong property for a password
hash. You'll finish using `bcrypt`, a hash function deliberately built to be slow, with a
dial you can turn as computers get faster.

## What you need to know first

Lesson 7 (Hashing vs. Encryption) directly — today assumes you already know why passwords
are hashed rather than encrypted, and picks up the two problems that lesson named but
didn't yet solve: rainbow tables and brute force.

---

## The problem

Lesson 7 established that passwords should be hashed, not encrypted, so the original
password is never recoverable — only comparable. That's necessary, but on its own it's not
sufficient. Two more properties matter, and plain `hashlib.sha256` has neither of them:

1. **Two identical passwords should not produce identical hashes.** If they do, an
   attacker who cracks one password has, for free, also cracked every other account using
   that same password — including accounts on completely unrelated systems, since the same
   password hashed the same way always produces the same result.
2. **Computing the hash should be slow.** Fast is a virtue for almost every other use of
   hashing — file checksums, cache keys — and precisely the opposite of a virtue here,
   because "fast to compute" means "fast for an attacker to try billions of guesses,"
   too.

## The lab: from a leaky fingerprint to a slow one

**Disposable host.** `Vault` — a tiny password-hashing module, rebuilt three times.

### Step 1 — plain hashing leaks who shares a password

```python
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

ada_hash = hash_password("sunshine1")
grace_hash = hash_password("sunshine1")

print("Ada's stored hash:  ", ada_hash)
print("Grace's stored hash:", grace_hash)
print("Same hash?", ada_hash == grace_hash)
```

Run it:

```
Ada's stored hash:   284fff3bd254b48cca05a8bfc4fad69e05cad0d086513a034a66a118829e6fa
Grace's stored hash: 284fff3bd254b48cca05a8bfc4fad69e05cad0d086513a034a66a118829e6fa
Same hash? True
```

**Walkthrough.** Ada and Grace happened to choose the same password. Because
`hash_password` is Lesson 7's deterministic hash with no other input, their stored hashes
are byte-for-byte identical — visible to anyone who can see the database, including
whoever eventually steals it.

**Security lens.** This is exactly what makes **rainbow tables** effective, the attack
Lesson 7 named but deferred: an attacker doesn't need to crack *your* database's hashes
one at a time. They precompute hashes for millions of common passwords once, store the
mapping, and from then on cracking any leaked hash of a common password is an instant
lookup — and because identical passwords produce identical hashes, that one precomputed
table works against every account on every system that hashes the same way, forever.

### Step 2 — salting: a random value per user, mixed in before hashing

```python
import hashlib
import os

def hash_password(password, salt):
    return hashlib.sha256(salt + password.encode("utf-8")).hexdigest()

ada_salt = os.urandom(16)
grace_salt = os.urandom(16)

ada_hash = hash_password("sunshine1", ada_salt)
grace_hash = hash_password("sunshine1", grace_salt)

print("Ada's hash:  ", ada_hash)
print("Grace's hash:", grace_hash)
print("Same hash?", ada_hash == grace_hash)

def check_password(password_attempt, stored_salt, stored_hash):
    return hash_password(password_attempt, stored_salt) == stored_hash

print("Correct password check:", check_password("sunshine1", ada_salt, ada_hash))
print("Wrong password check:  ", check_password("wrongpass", ada_salt, ada_hash))
```

**New construct: `os.urandom(16)`.** `os.urandom(n)` returns `n` bytes of
cryptographically secure randomness — suitable for security purposes, unlike Python's
general-purpose `random` module, which is predictable enough (given enough output) to be
unsuitable here. This is the **salt**: a random value generated fresh for every user,
stored alongside their hash (not secret — its whole job is to be different per user, not
hidden), and mixed into the input before hashing.

Run it:

```
Ada's hash:   4a9582ab3e514ca63135479e36d8093e401d12ae28e9037b3fe7fd436edf9cf
Grace's hash: 378aaf17eeb05aca58ae2038b0d7dddc9eae6dec50b348b51f5a4bc05d1b02b
Same hash? False
Correct password check: True
Wrong password check:   False
```

**Walkthrough.** `hash_password` now takes two inputs, and concatenates `salt` in front of
the password before hashing — because of the avalanche effect from Lesson 7, even one
differing byte at the start of the input produces a completely unrelated-looking output.
Ada and Grace's identical passwords now produce completely different hashes, because their
salts differ. Verifying a login attempt (`check_password`) works exactly as before —
recompute the hash using the *stored* salt for that user, compare to the stored hash — the
salt doesn't need to be secret to do its job; it only needs to be different for every user
and never reused.

**CS lens.** The salt doesn't make each individual guess any harder to check — it defeats
*precomputation*. A rainbow table built for unsalted SHA-256 is a table of
`password → hash`. Add a random salt per user, and the attacker would need a separate
precomputed table *for every possible salt value* — with a 16-byte random salt, that's
astronomically more tables than could ever be built or stored, which is the whole point:
salting doesn't make one guess more expensive, it makes bulk precomputation worthless.

**Security lens.** Salting is now standard practice, universally — but notice what it
does *not* fix. Look back at Step 1's execution time: nothing about adding a salt made
`hashlib.sha256` any slower to compute. An attacker who already knows a specific user's
salt (which they will, since it's stored right next to the hash) can still try billions of
guesses per second against that one specific hash. Salting stopped the *shortcut*. It did
nothing about the *speed*.

### Step 3 — the speed problem, measured

```python
import hashlib
import time
import os

salt = os.urandom(16)
start_time = time.time()
guesses_tried = 0
while time.time() - start_time < 1.0:
    hashlib.sha256(salt + b"guess").hexdigest()
    guesses_tried += 1
elapsed_seconds = time.time() - start_time

print(f"SHA-256: {guesses_tried:,} hashes in {elapsed_seconds:.2f} seconds "
      f"(~{int(guesses_tried / elapsed_seconds):,} guesses/sec)")
```

**New construct: an f-string with formatting.** `f"{guesses_tried:,}"` inserts
`guesses_tried` formatted with comma separators for readability (`1392601` becomes
`1,392,601`). `{elapsed_seconds:.2f}` formats a number to exactly two decimal places.

Run it (your exact number will vary by machine, but the order of magnitude will not):

```
SHA-256: 1,392,601 hashes in 1.00 seconds (~1,392,599 guesses/sec)
```

**Walkthrough.** On an ordinary machine — no special hardware, no optimization — this
single, un-parallelized Python process alone tries almost 1.4 million password guesses per
second. A dedicated attacker using specialized hardware (GPUs, built specifically for
exactly this kind of massively parallel repeated computation) can push that number into
the billions per second. Salting stopped precomputed lookup tables; it did nothing to stop
this — an attacker who has stolen a database of salted-but-fast hashes can still brute-force
any password short enough or common enough to be guessed within a feasible number of
attempts, once they know the salt (which, again, they always do).

**CS lens.** SHA-256 was designed to be fast, on purpose — for its intended uses (file
integrity, digital signatures over large data, Lesson 9's certificate signatures), speed is
a feature, not a bug. A password hash needs the *opposite* design goal: deliberately slow,
specifically to make brute-forcing infeasible even when the attacker has full knowledge of
the salt and unlimited computing budget within reason.

### Step 4 — bcrypt: a hash function designed to be slow, on a dial

```python
import bcrypt

password = b"sunshine1"

hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))
print("bcrypt hash:", hashed)

print("Correct password check:", bcrypt.checkpw(b"sunshine1", hashed))
print("Wrong password check:  ", bcrypt.checkpw(b"wrongpass", hashed))
```

**New constructs.** `bcrypt` is a password-hashing algorithm designed specifically for
this problem — not a general-purpose hash repurposed for passwords. `bcrypt.gensalt(rounds=12)`
generates a random salt (Step 2's idea, now built into the library itself rather than
handled by hand) and encodes a **cost factor** — here, `12` — directly alongside it.
`bcrypt.hashpw(password, salt)` computes the hash. `bcrypt.checkpw(password_attempt, stored_hash)`
verifies an attempt against a stored hash — notice this single function replaces Step 2's
hand-written `check_password`, because the salt is embedded inside `stored_hash` itself and
doesn't need to be passed separately.

Run it:

```
bcrypt hash: b'$2b$12$nQu3g7cpiT0G6dhvRX11V.7IKQcXZ5SfkBU5mqzWdLNe9WM7yJMu6'
Correct password check: True
Wrong password check:   False
```

**Walkthrough.** The printed hash's format, `$2b$12$...`, isn't arbitrary: `$2b$` names
the bcrypt algorithm variant in use, `$12$` is the cost factor that was used (readable
back out of the hash itself, which is why `checkpw` doesn't need it passed separately),
and the remainder encodes the salt followed by the actual hash output — everything needed
to verify a future attempt is self-contained in this one stored string.

### Step 5 — the cost factor, measured

```python
import bcrypt
import time

password = b"sunshine1"

for cost_factor in [10, 12, 14]:
    start_time = time.time()
    bcrypt.hashpw(password, bcrypt.gensalt(rounds=cost_factor))
    elapsed_seconds = time.time() - start_time
    print(f"cost factor {cost_factor}: {elapsed_seconds:.3f} seconds")
```

Run it:

```
cost factor 10: 0.078 seconds
cost factor 12: 0.324 seconds
cost factor 14: 1.486 seconds
```

**Execution trace**, since this is a loop with a clear pattern worth naming explicitly:

```
cost_factor 10: 0.078 seconds
cost_factor 12: 0.324 seconds  → roughly 4x slower than cost_factor 10
cost_factor 14: 1.486 seconds  → roughly 4-5x slower than cost_factor 12
```

**Walkthrough.** Each increment of the cost factor by 2 roughly quadruples the time
required — bcrypt's cost factor controls the number of internal rounds as a *power of
two*, so raising it by 1 doubles the work, and by 2, quadruples it. Compare this single
number, 0.324 seconds for one hash at a typical production cost factor, against Step 3's
1,392,599 *hashes per second* with plain SHA-256. That's not a small difference — it's the
difference between an attacker trying roughly a million passwords a second and an attacker
trying roughly three passwords a second, against the exact same hardware.

**SE lens.** The cost factor is a dial, not a fixed constant, precisely because hardware
gets faster over time — a cost factor considered safely slow today needs to be raised in
a few years as attackers' available computing power grows, which is exactly why bcrypt
stores the cost factor used inside the hash itself: a system can support old hashes at
their original cost factor while hashing every *new* password at a higher one, and can
detect on login which accounts are still using an outdated cost factor and re-hash them
transparently once the correct password is confirmed.

**Security lens.** This deliberate slowness is called **key stretching**, and bcrypt isn't
the only algorithm built this way — PBKDF2 and Argon2 solve the same problem with
different internal designs; Argon2 additionally makes the computation memory-intensive as
well as slow, specifically to blunt the advantage of GPU and custom-hardware attacks,
which are extremely fast at simple repeated computation but much less efficient when large
amounts of memory are required per attempt. The principle uniting all three: a password
hash function should be exactly as slow as your system can tolerate for a single legitimate
login, and not one bit faster — because every bit of spare speed is speed an attacker gets
to use too.

---

## Connect the pieces

Lesson 7 established *that* passwords must be hashed, not encrypted. Today filled in *how*:
a per-user salt (defeating rainbow tables, Step 2) combined with a deliberately slow,
tunable algorithm (defeating brute force at scale, Steps 4–5). Both pieces are necessary —
a salted-but-fast hash stops precomputation but not brute force; a slow-but-unsalted hash
(which doesn't actually exist among modern password hashers, but is worth reasoning through)
would still let identical passwords leak identical hashes. bcrypt's design bakes in both
fixes at once, which is why it — or Argon2, or PBKDF2 — is universally used for password
storage today, and plain `hashlib.sha256` is universally the wrong tool for this one
specific job, despite being the exact right tool for Lesson 9's certificate signatures just
one lesson ago. The same primitive, hashing, is correct or incorrect entirely depending on
what property the situation actually needs.

## What breaks without this

In 2012, a major professional networking platform suffered a breach that later analysis
attributed to exactly Step 1's mistake — passwords hashed with a fast, unsalted algorithm.
Attackers cracked a very large share of the leaked hashes within days, largely because
identical and common passwords collapsed to identical, rainbow-table-lookupable hashes, and
the fast algorithm made brute-forcing the rest entirely practical at scale. Nothing about
that breach required breaking cryptography in the mathematical sense — SHA-1, the algorithm
in question, was not "cracked" to make this possible. The failure was a design choice: the
wrong hash function for this specific job, the same mistake Step 1 of this lesson
reproduces on purpose.

## Recognition

```
Today: Password Storage — Salting and Key Stretching

Also recognized in: every modern web framework's built-in authentication system
(Django, Rails, and similar frameworks default to bcrypt, Argon2, or PBKDF2 for
exactly this reason), password manager master-password verification, disk
encryption passphrases (deriving an encryption key from a human-memorable
passphrase uses the same slow, salted derivation, often literally PBKDF2 or
Argon2), and HaveIBeenPwned-style breach checks, which work specifically because
breached databases so often turn out to have used exactly Step 1's mistake.
```

## Definition of done

- [ ] You ran Steps 1 through 5 and reproduced the outputs shown, including the
      identical hashes in Step 1, the differing hashes in Step 2, and the timing
      contrast between Step 3 and Step 5
- [ ] You can explain, in one sentence each, what salting fixes and what it does not fix
- [ ] You can explain why a password hash function should be slow while a certificate
      signature's hash function (Lesson 9) should be fast — the same underlying tool,
      opposite desired property
- [ ] You can explain why bcrypt's cost factor needs to be periodically increased over
      time, and how bcrypt stores the information needed to know which cost factor an
      existing hash used
- [ ] `git add .` and `git commit -m "Lesson 10: password storage — salting and key
      stretching with bcrypt"` in your `security-labs/` folder

**Next:** Lesson 11 opens Module D — Network Security — with TCP/IP for Security, where
you'll look underneath every `https://` connection you've used so far and see exactly what
a packet is, what a port actually does mechanically, and where an attacker positioned
between two machines can and cannot see.
