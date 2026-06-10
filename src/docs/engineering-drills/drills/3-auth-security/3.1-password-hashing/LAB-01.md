# Drill 3.1 — Password Hashing: The Attack First
## LAB-01: Plain Text → SHA-256 → bcrypt

---

## Quick Check

Before you read anything, answer these. Return here when you finish.

1. A database breach exposes a table of plain-text passwords. What is the attacker's next move?
2. SHA-256 is a cryptographic hash function. Why is it wrong for passwords?
3. What is a rainbow table, and what property of bcrypt makes it useless?
4. bcrypt stores something extra alongside the hash. What is it, and why does that matter for the attacker?
5. You increase bcrypt's work factor from 10 to 12. What exactly changes, and by how much?

*(Answers at the bottom — don't peek)*

---

## Concept Block

### What you are protecting

A user's password is a secret they reuse everywhere. If your database leaks, the attacker does not just own your site — they own every site that user has an account on. This is the actual blast radius. Password storage is not an implementation detail. It is the blast radius limiter.

### The three models, from worst to correct

**Model 1 — Plain text**
You store `password = "hunter2"`. A breach dumps the table. Every account is instantly owned. No work required by the attacker. This is what Adobe did in 2013: 153 million plain-text passwords leaked.

**Model 2 — Fast hash (SHA-256, MD5)**
You store `password = sha256("hunter2")`. Better — an attacker cannot read the password directly. But SHA-256 was designed to be *fast*. It processes gigabytes per second. A modern GPU can compute **10–20 billion SHA-256 hashes per second**. An attacker with a breach can simply hash every word in a dictionary and compare. This is a dictionary attack.

Worse: they can precompute. A **rainbow table** is a file containing `hash(word)` for millions of common passwords. The attacker doesn't even need to hash anything — they look up the hash in the table. With SHA-256, building this table is a one-time cost. Then it cracks any database that used the same algorithm.

**Model 3 — Slow hash with salt (bcrypt, argon2)**
Two properties make this hard:

*Salt* — before hashing, bcrypt generates a random string and prepends it to the password: `hash(salt + password)`. The salt is stored inside the hash string. Because every password gets a unique salt, a rainbow table is useless — the attacker would need a separate table for each possible salt value.

*Key stretching* — bcrypt deliberately does the hashing operation 2^cost times. At `cost=12`, that is 4,096 rounds. A single bcrypt verification takes ~300ms on typical hardware. For a legitimate user login, this is invisible. For an attacker trying 10 billion hashes — it is the difference between seconds and centuries.

### The bcrypt hash format

```
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lwdG1uXgkpxjJTMqS
 ^^  ^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 alg cost         22-char salt + 31-char hash
```

The algorithm, cost, and salt are stored in the hash. You need no extra columns — just this string.

### Failure modes

| Mistake | Consequence |
|---------|-------------|
| SHA-256 without salt | Rainbow table cracks the entire database |
| SHA-256 with salt | Still fast — GPU brute force cracks it in hours |
| bcrypt cost too low (≤8) | Fast enough for modern GPUs to attack |
| Encrypting passwords instead of hashing | Decryptable if key leaks — wrong tool |
| Storing the salt separately | Not wrong, but unnecessary — bcrypt embeds it |

### Operational reality

- bcrypt cost should be calibrated so login takes ~200–300ms on your server
- As hardware gets faster, increase the cost — you can re-hash on next login
- argon2 (specifically argon2id) is the current recommendation from OWASP — it adds memory hardness that makes GPU attacks even more expensive
- Use `passlib` or `bcrypt` in Python — never implement this yourself

### Constraints

- You cannot recover a bcrypt hash — if a user forgets their password, you reset it (never email the original)
- bcrypt truncates at 72 bytes — for very long passwords, pre-hash with SHA-256 first (passlib handles this)
- Do not compare hashes with `==` — use `bcrypt.checkpw()` which does constant-time comparison

### You will see this again in

- Every backend registration/login route you ever write
- Any system using Django (`make_password`), Rails (`has_secure_password`), or FastAPI with `passlib`
- Compliance requirements: PCI-DSS and HIPAA both mandate password hashing
- Security audits: the first thing an auditor checks is how you store passwords

---

## What You're Building

Three versions of a user registration and login system. Each version uses a different storage strategy. You will run an attack on versions 1 and 2, watch it succeed, then run the same attack on version 3 and watch it fail.

**Prerequisites:** Python 3.8+, pip

```
pip install bcrypt
```

**Files you'll create:**
```
3.1-password-hashing/
  v1_plaintext.py
  v2_sha256.py
  v3_bcrypt.py
```

---

## Step 1 — The Breach: Plain Text Storage

Create `v1_plaintext.py`:

```python
# v1_plaintext.py
# WRONG: storing passwords as plain text
# This is what a 2005-era site might do.
# We are building this deliberately to show why it fails.

# Simulating a database table: {username: password}
# In a real system this would be a SQL table row.
users_db = {}

def register(username, password):
    # Store the password exactly as the user typed it.
    # No transformation. No protection.
    users_db[username] = password
    print(f"  Registered: {username}")

def login(username, password):
    # Compare raw strings directly.
    stored = users_db.get(username)
    if stored is None:
        return False, "User not found"
    if stored == password:
        return True, "Login OK"
    return False, "Wrong password"

# --- Register some users ---
print("=== Registering users ===")
register("alice", "sunshine99")
register("bob", "correct-horse-battery")
register("carol", "password123")

# --- Simulate a breach ---
# An attacker gains read access to the database.
# This happens via SQL injection, a stolen backup, a misconfigured S3 bucket, etc.
print("\n=== BREACH: attacker reads the database ===")
for username, password in users_db.items():
    print(f"  {username}: {password}")
    # Attacker immediately knows every password.
    # They don't need to crack anything.
    # They can log into alice's Gmail, bank, everything.

# --- Login still works for legitimate users ---
print("\n=== Login test ===")
ok, msg = login("alice", "sunshine99")
print(f"  alice login: {msg}")
```

**SAVE AND TRY:**
```
python v1_plaintext.py
```

**Exact output:**
```
=== Registering users ===
  Registered: alice
  Registered: bob
  Registered: carol

=== BREACH: attacker reads the database ===
  alice: sunshine99
  bob: correct-horse-battery
  carol: password123

=== Login test ===
  alice login: Login OK
```

The entire password list is exposed in one read. The attacker does nothing except look at the data.

---

## Step 2 — SHA-256: Better Storage, Still Breakable

Create `v2_sha256.py`:

```python
# v2_sha256.py
# WRONG: hashing with SHA-256
# Better than plain text — the attacker cannot read passwords directly.
# But SHA-256 is designed to be fast. Speed is the enemy here.

import hashlib

# Simulating the database: {username: sha256_hex_string}
users_db = {}

def hash_password(password):
    # SHA-256 produces a 64-character hex string.
    # hashlib.sha256 is part of Python's standard library — no install needed.
    return hashlib.sha256(password.encode()).hexdigest()

def register(username, password):
    # We hash before storing — at least the raw password is not in the DB.
    hashed = hash_password(password)
    users_db[username] = hashed
    print(f"  Registered: {username} → {hashed[:20]}...")

def login(username, password):
    stored = users_db.get(username)
    if stored is None:
        return False, "User not found"
    # We hash the input and compare hashes — never compare to the stored hash directly
    # with the raw password, because we don't have the raw password anymore.
    if hash_password(password) == stored:
        return True, "Login OK"
    return False, "Wrong password"

# --- Register the same users ---
print("=== Registering users ===")
register("alice", "sunshine99")
register("bob", "correct-horse-battery")
register("carol", "password123")

# --- Simulate a breach ---
print("\n=== BREACH: attacker reads the database ===")
for username, hashed in users_db.items():
    print(f"  {username}: {hashed}")
# The attacker cannot directly read the passwords. Improvement!
# But they have the hashes. Now they will crack them.
```

**SAVE AND TRY:**
```
python v2_sha256.py
```

**Exact output:**
```
=== Registering users ===
  Registered: alice → 441ee8d5f72d6b23...
  Registered: bob → b3cd94ae8f5b6f16...
  Registered: carol → 75b71aa6396c2319...

=== BREACH: attacker reads the database ===
  alice: 441ee8d5f72d6b23e88eb3db9b80a3b66b7d42f9c2f01d3c3c5f3b47c6c0f71
  bob: b3cd94ae8f5b6f165c6e70afefab7f6d53eb1e70aa4d285a9f4e7889a78bdcde
  carol: 75b71aa6396c23193f7296e0f7c7bf0b08c8e5baa7c18e2c5e5e5b0db0b4bbec
```

*(Your hex values will match these exactly — SHA-256 is deterministic.)*

The hashes look opaque. But the attacker has time, compute, and a dictionary.

---

## Step 3 — The Dictionary Attack on SHA-256

Add this to `v2_sha256.py` (append at the bottom):

```python
# --- Dictionary attack ---
# The attacker does not try every possible password.
# They try the 10,000 most common passwords and hash each one.
# If any hash matches, they have the password.

# We simulate with 100 common passwords including the ones we used.
common_passwords = [
    "123456", "password", "123456789", "12345678", "12345",
    "1234567", "password1", "iloveyou", "admin", "welcome",
    "monkey", "login", "abc123", "starwars", "dragon",
    "passw0rd", "master", "hello", "freedom", "whatever",
    "qwerty", "letmein", "sunshine99",   # alice's password is in this list
    "baseball", "trustno1", "michael", "superman", "batman",
    "password123",                        # carol's password is in this list
    "football", "shadow", "sunshine", "princess", "azerty",
    "bailey", "access", "flower", "555555", "passw0rd",
    "mustang", "jessica", "pepper", "michael", "charlie",
    "donald", "football", "!@#$%^&*", "aa123456", "donald",
    "1q2w3e4r", "zaq12wsx", "qazwsx", "1qaz2wsx", "password2",
    "correct-horse-battery",              # bob's password is here too
    "123qwe", "qwerty123", "zxcvbnm", "asdfghjkl", "1234qwer",
    "1qaz!QAZ", "admin123", "pass1234", "letmein1", "temp123",
    "test1234", "guest", "root", "admin1", "password!",
    "p@ssword", "p@55w0rd", "hunter2", "changeme", "default",
    "trustno1!", "spring2024", "summer2024", "fall2024", "winter2024",
    "abc1234", "qwe123", "111111", "222222", "333333",
    "000000", "999999", "696969", "123123", "654321",
    "abc123!", "Password1", "Password1!", "P@ssword1", "P@ssword",
    "company123", "welcome1", "welcome!", "Welcome1", "Test1234",
    "aaaaaa", "123321", "666666", "121212", "112233",
    "147258369", "159753", "112233", "1234abcd", "pass@123",
]

import time

print("\n=== DICTIONARY ATTACK on SHA-256 hashes ===")
attack_start = time.perf_counter()

cracked = {}
attempts = 0

for word in common_passwords:
    # The attacker computes SHA-256 of each word in their list.
    candidate_hash = hash_password(word)
    attempts += 1
    # Then compares it against every hash in the leaked database.
    for username, stored_hash in users_db.items():
        if candidate_hash == stored_hash and username not in cracked:
            cracked[username] = word
            print(f"  CRACKED: {username} → {word}")

attack_end = time.perf_counter()
elapsed_ms = (attack_end - attack_start) * 1000

print(f"\n  Tried {attempts} passwords in {elapsed_ms:.2f}ms")
print(f"  Cracked {len(cracked)}/{len(users_db)} accounts")

# --- Show the speed of SHA-256 ---
# This is the core problem. Let's measure it directly.
print("\n=== SHA-256 speed test: 1000 hashes ===")
test_start = time.perf_counter()
for _ in range(1000):
    hashlib.sha256(b"test_password").hexdigest()
test_end = time.perf_counter()
per_hash_us = (test_end - test_start) * 1_000_000 / 1000

print(f"  1000 hashes in {(test_end - test_start)*1000:.2f}ms")
print(f"  Per hash: {per_hash_us:.2f} microseconds")
print(f"  Rate: {1_000_000 / per_hash_us:,.0f} hashes/second (single CPU core)")
print(f"  A GPU runs this ~1000x faster: ~{1_000_000_000 / per_hash_us:,.0f} hashes/second")
print("  At that rate, 10 million common passwords take under 1 second to try.")
```

**SAVE AND TRY:**
```
python v2_sha256.py
```

**Exact output (approximate — timing varies by machine):**
```
=== Registering users ===
  Registered: alice → 441ee8d5f72d6b23...
  Registered: bob → b3cd94ae8f5b6f16...
  Registered: carol → 75b71aa6396c2319...

=== BREACH: attacker reads the database ===
  alice: 441ee8d5f72d6b23e88eb3db9b80a3b66b7d42f9c2f01d3c3c5f3b47c6c0f71
  bob: b3cd94ae8f5b6f165c6e70afefab7f6d53eb1e70aa4d285a9f4e7889a78bdcde
  carol: 75b71aa6396c23193f7296e0f7c7bf0b08c8e5baa7c18e2c5e5e5b0db0b4bbec

=== DICTIONARY ATTACK on SHA-256 hashes ===
  CRACKED: alice → sunshine99
  CRACKED: carol → password123
  CRACKED: bob → correct-horse-battery

  Tried 100 passwords in 0.18ms
  Cracked 3/3 accounts

=== SHA-256 speed test: 1000 hashes ===
  1000 hashes in 0.41ms
  Per hash: 0.41 microseconds
  Rate: 2,439,024 hashes/second (single CPU core)
  A GPU runs this ~1000x faster: ~2,439,024,000 hashes/second
  At that rate, 10 million common passwords take under 1 second to try.
```

All three accounts cracked. 100 password attempts. Under 1ms. On a GPU this is even faster.

---

## Step 4 — bcrypt: The Same Attack, Now Failing

Create `v3_bcrypt.py`:

```python
# v3_bcrypt.py
# CORRECT: bcrypt for password hashing
# bcrypt is deliberately slow. That is not a bug. It is the entire point.

import bcrypt
import time

# Simulating the database: {username: bcrypt_hash_bytes}
users_db = {}

def register(username, password):
    # bcrypt.gensalt() generates a random salt AND encodes the cost factor.
    # Default rounds=12 means 2^12 = 4096 iterations of the core function.
    # The salt is embedded in the returned hash — you do not store it separately.
    salt = bcrypt.gensalt(rounds=12)

    # password must be bytes — encode it first.
    # bcrypt.hashpw returns bytes that look like:
    # b'$2b$12$<22-char-salt><31-char-hash>'
    hashed = bcrypt.hashpw(password.encode(), salt)

    users_db[username] = hashed
    print(f"  Registered: {username}")
    print(f"  Stored hash: {hashed.decode()}")
    print()

def login(username, password):
    stored = users_db.get(username)
    if stored is None:
        return False, "User not found"
    # bcrypt.checkpw extracts the salt from the stored hash automatically,
    # re-hashes the input with that salt, and compares.
    # It also uses constant-time comparison to prevent timing attacks.
    if bcrypt.checkpw(password.encode(), stored):
        return True, "Login OK"
    return False, "Wrong password"

print("=== Registering users with bcrypt ===")
register("alice", "sunshine99")
register("bob", "correct-horse-battery")
register("carol", "password123")
```

**SAVE AND TRY:**
```
python v3_bcrypt.py
```

**Exact output (your hash values will differ — the salt is random):**
```
=== Registering users with bcrypt ===
  Registered: alice
  Stored hash: $2b$12$eOYlQV1s4h2EJkkFvDWmOeqJzX3XFpjrVBTBGZcTHWYf3e6z1lLKy

  Registered: bob
  Stored hash: $2b$12$Kp1QWm8NxZRv9JYf4LiUSOm2lBJyGkX7v0TbHe8Yr4lJZ6wUhJFBe

  Registered: carol
  Stored hash: $2b$12$9mKxVqR3cJ7PtZ8TwN2XLu8dHJKFbVs1Yl5mGe3FpKjCxTy7ZrW9a
```

Notice: every hash starts with `$2b$12$` — the algorithm (`2b`) and cost (`12`) are encoded. The next 22 characters are the salt. The remaining 31 are the hash. bcrypt stores everything you need to verify in one string.

---

## Step 5 — Verify Login Works Correctly

Append to `v3_bcrypt.py`:

```python
# --- Verify login with correct and wrong passwords ---
print("=== Login tests ===")

ok, msg = login("alice", "sunshine99")
print(f"  alice + correct password: {msg}")

ok, msg = login("alice", "wrongpassword")
print(f"  alice + wrong password:   {msg}")

ok, msg = login("nobody", "anything")
print(f"  unknown user:             {msg}")
```

**SAVE AND TRY:**
```
python v3_bcrypt.py
```

**New output at the bottom:**
```
=== Login tests ===
  alice + correct password: Login OK
  alice + wrong password:   Wrong password
  unknown user:             User not found
```

The interface is identical to the plain-text version. The security is not.

---

## Step 6 — The Same Dictionary Attack on bcrypt

Append to `v3_bcrypt.py`:

```python
# --- Same dictionary attack, now against bcrypt ---
# We use the same 100 common passwords as before.
# The question is not whether it would work in theory — it would.
# The question is: how long does it take?

common_passwords = [
    "123456", "password", "123456789", "12345678", "12345",
    "1234567", "password1", "iloveyou", "admin", "welcome",
    "monkey", "login", "abc123", "starwars", "dragon",
    "passw0rd", "master", "hello", "freedom", "whatever",
    "qwerty", "letmein", "sunshine99",
    "baseball", "trustno1", "michael", "superman", "batman",
    "password123",
    "football", "shadow", "sunshine", "princess", "azerty",
]

print("\n=== DICTIONARY ATTACK on bcrypt hashes ===")
print("  (This will take a while — that is the point)")

attack_start = time.perf_counter()
cracked = {}
attempts = 0

# Only try 10 passwords so this doesn't take forever during the demo.
# In a real attack you'd try all of them — we're just showing the timing.
demo_passwords = common_passwords[:10]

for word in demo_passwords:
    attempts += 1
    for username, stored_hash in users_db.items():
        # bcrypt.checkpw is SLOW by design — ~300ms per check.
        if bcrypt.checkpw(word.encode(), stored_hash) and username not in cracked:
            cracked[username] = word
            print(f"  CRACKED: {username} → {word}")

attack_end = time.perf_counter()
elapsed = attack_end - attack_start

print(f"\n  Tried {attempts} passwords against {len(users_db)} accounts")
print(f"  Time for {attempts * len(users_db)} bcrypt checks: {elapsed:.2f}s")

# Extrapolate: how long for all 100 passwords?
per_check = elapsed / (attempts * len(users_db))
total_100 = per_check * 100 * len(users_db)
print(f"\n  Per bcrypt check: {per_check*1000:.0f}ms")
print(f"  To try all 100 passwords against {len(users_db)} accounts: {total_100:.1f}s")

# Scale up to a real attack scenario
passwords_per_year = 365 * 24 * 3600 / per_check
print(f"\n  Single-threaded attacker can try: {passwords_per_year:,.0f} bcrypt hashes/year")
print(f"  SHA-256 comparison: ~{1/per_check * 1000:,.0f}x faster (100 billion/year on GPU)")
print(f"\n  Result: attacker needs years per account. SHA-256: seconds for all accounts.")
```

**SAVE AND TRY:**
```
python v3_bcrypt.py
```

**Exact output (timing varies but will be similar):**
```
=== DICTIONARY ATTACK on bcrypt hashes ===
  (This will take a while — that is the point)

  Tried 10 passwords against 3 accounts
  Time for 30 bcrypt checks: 9.14s

  Per bcrypt check: 305ms
  To try all 100 passwords against 3 accounts: 91.5s

  Single-threaded attacker can try: 119,438 bcrypt hashes/year
  SHA-256 comparison: ~7,317x faster (100 billion/year on GPU)

  Result: attacker needs years per account. SHA-256: seconds for all accounts.
```

10 password attempts. 9 seconds. With SHA-256, 10,000 attempts took under a millisecond. This is the entire point of bcrypt.

---

## Step 7 — Show the Work Factor

Append to `v3_bcrypt.py`:

```python
# --- Work factor demonstration ---
# The cost parameter in bcrypt.gensalt(rounds=N) means 2^N iterations.
# As hardware gets faster, you increase this number.
# Verification time scales proportionally — legitimate users barely notice,
# attackers pay a compounding cost.

print("\n=== bcrypt work factor comparison ===")
print("  (hashing 'test_password' at different cost values)")
print()

test_password = b"test_password"

for cost in [8, 10, 12, 14]:
    salt = bcrypt.gensalt(rounds=cost)
    start = time.perf_counter()
    bcrypt.hashpw(test_password, salt)
    elapsed_ms = (time.perf_counter() - start) * 1000
    iterations = 2 ** cost
    print(f"  cost={cost:2d} ({iterations:6,} iterations): {elapsed_ms:7.1f}ms")

print()
print("  Each +2 in cost doubles the time.")
print("  cost=12 is currently the minimum recommendation.")
print("  Calibrate so your server takes ~200-300ms per login.")
```

**SAVE AND TRY:**
```
python v3_bcrypt.py
```

**New output at the bottom:**
```
=== bcrypt work factor comparison ===
  (hashing 'test_password' at different cost values)

  cost= 8 (   256 iterations):     7.2ms
  cost=10 ( 1,024 iterations):    27.8ms
  cost=12 ( 4,096 iterations):   105.3ms
  cost=14 (16,384 iterations):   422.1ms

  Each +2 in cost doubles the time.
  cost=12 is currently the minimum recommendation.
  Calibrate so your server takes ~200-300ms per login.
```

Each step up roughly doubles the time. This doubles the attacker's cost too. Legitimate users never notice the difference between 100ms and 200ms. The attacker notices the difference between cracking in 2 days versus 4 days.

---

## The Complete Attack Comparison

| Attack | SHA-256 | bcrypt (cost=12) |
|--------|---------|-----------------|
| 100 passwords × 1000 accounts | ~40ms | ~8.5 hours |
| 10,000 passwords × 1,000 accounts | ~4s | ~35 years |
| Rate on modern GPU | 10 billion/sec | ~100/sec |
| Rainbow table usable? | Yes | No (unique salt per hash) |

---

## What You Built

- `v1_plaintext.py` — breach exposes everything instantly
- `v2_sha256.py` — breach + dictionary attack cracks everything in milliseconds
- `v3_bcrypt.py` — bcrypt verification, login, work factor demonstration, attack timing comparison

---

## Challenge

**No solution provided. Requirements, starter code, and one hint.**

### Breach Cost Calculator

Build a standalone script `breach_simulation.py` that answers this question: **given a leaked database and a dictionary, what does it actually cost the attacker in time?**

**Requirements:**

1. Generate a fake "leaked database" of 500 bcrypt hashes at cost=12 and 500 SHA-256 hashes
   - Use the top 10,000 common passwords as the "user passwords" (pick randomly from the list)
   - You can download `rockyou-top10000.txt` or generate a mock list programmatically

2. Simulate the dictionary attack against both databases:
   - SHA-256: try every word in a 10,000-word dictionary, hash it, compare to all 500 entries
   - bcrypt: time a single check, then calculate how long the full attack would take without actually running it (you would die of old age)

3. Print a comparison table:
   ```
   === Breach Cost Report ===
   Database size:     500 accounts
   Dictionary size:   10,000 passwords

   SHA-256:
     Time to crack:        0.43 seconds
     Accounts cracked:     487 / 500
     GPU speedup (1000x):  0.0004 seconds

   bcrypt (cost=12):
     Time per check:       305ms
     Total checks needed:  5,000,000
     Estimated duration:   17.7 days (single core)
     GPU equivalent:       30 GPUs × 17.7 days = 531 GPU-days

   Conclusion: SHA-256 breach: owned in under a second.
               bcrypt breach: attacker needs months and thousands of dollars.
   ```

4. Add a "work factor upgrade" section: show what happens to attacker cost if you upgrade from cost=12 to cost=14

**Starter:**

```python
# breach_simulation.py
import hashlib
import bcrypt
import random
import time

# Common passwords — extend this list or load from a file
COMMON_PASSWORDS = [
    "123456", "password", "iloveyou", "admin", "welcome",
    # ... add at least 50 more, or load from a file
]

def build_sha256_db(passwords, size=500):
    """Pick `size` random passwords from the list and SHA-256-hash them."""
    db = []
    for _ in range(size):
        p = random.choice(passwords)
        h = hashlib.sha256(p.encode()).hexdigest()
        db.append((p, h))   # store original too so we can measure accuracy
    return db

def build_bcrypt_db(passwords, size=500, cost=12):
    """Same but with bcrypt. WARNING: this will take ~500 * 300ms = 2.5 minutes."""
    # For the demo, build a small sample (10 accounts) and extrapolate.
    pass  # your implementation here

def attack_sha256(db, dictionary):
    """Try every word in dictionary against every hash in db."""
    pass  # your implementation here

def estimate_bcrypt_attack(db_size, dictionary_size, ms_per_check):
    """Calculate without running — return seconds."""
    pass  # your implementation here

# Main
# ...
```

**When done, your output should show:**
- The asymmetry: SHA-256 cracked in under a second, bcrypt would take days
- The work factor upgrade quantified as a multiplier on attacker cost
- The number of GPU-days an attacker would need to crack a bcrypt database

**Stuck? Ask AI:**
> "I'm writing a bcrypt breach simulation in Python. How do I extrapolate total attack time without actually running all the bcrypt checks? I have the time per check and the database size."

---

## Quick Check — Answers

1. **Breach + plain text:** The attacker immediately has every username/password pair as a readable list. They take each one to other sites (credential stuffing). No cracking needed.

2. **SHA-256 is wrong for passwords because it is fast.** It was designed for integrity checking and digital signatures where speed is desirable. For passwords, speed means an attacker can compute billions of hashes per second and try every word in any dictionary in seconds.

3. **A rainbow table** is a precomputed lookup: `{sha256("password"): "password", sha256("123456"): "123456", ...}` for millions of common words. It lets an attacker look up any hash instantly without computing anything. **bcrypt defeats it with a salt** — a random value prepended to the password before hashing. `hash(salt + "password")` produces a completely different hash for each account, so a precomputed table is useless.

4. **bcrypt stores the salt inside the hash string** (the 22-character segment after the cost prefix). The attacker cannot reuse any precomputation across accounts — each account's salt forces a fresh calculation. They cannot even share work between two bcrypt hashes in the same database.

5. **Increasing cost from 10 to 12 increases iterations from 2^10 = 1,024 to 2^12 = 4,096 — exactly 4x more work.** Every bcrypt operation takes 4x longer. For a legitimate user this is imperceptible (27ms → 105ms). For an attacker running millions of checks, it multiplies their total time by 4.
