---
concept: 145-cryptographic-hashing
name: Cryptographic Hashing
---

## Definition

A cryptographic hash function takes input of any size and produces a
fixed-size output (a "digest") that's deterministic (same input always
gives the same output), one-way (infeasible to reverse the digest back
into the original input), and exhibits an avalanche effect (a tiny change
in input produces a wildly different digest).

## Problem

Storing passwords in plaintext means anyone who gains access to the
database (a breach, an insider) immediately has every user's actual
password. Hashing the password instead — storing only the digest — means
even a full database breach doesn't reveal the original passwords, since
the hash can't practically be reversed; login just re-hashes the
submitted password and compares digests.

## Execution

password = "hunter2"
↓
hash("hunter2") = some fixed-length digest
↓
Store ONLY the digest in the database, never the plaintext password
↓
Login attempt: user submits "hunter2" again → hash it again → compare the
NEW digest to the STORED digest
↓
If they match, the password was correct — without the server ever
needing to store (or compare) the actual plaintext password
↓
Changing even ONE character (password = "hunter3") produces a COMPLETELY
different digest, not a similar one — this avalanche effect means a
digest reveals nothing about how close a guess was

## Computer Science

Cryptographic hash functions are specifically designed to be one-way
(computationally infeasible to invert) and collision-resistant
(infeasible to find two different inputs producing the same digest) —
this distinguishes them sharply from the simple, fast, NON-cryptographic
hash functions used for hash tables (see Hashing), where collisions are
expected and speed matters more than resistance to deliberate
reverse-engineering.

Tags: One-way functions, Collision resistance, Avalanche effect, Digest

## Software Engineering

Never hash passwords with a single fast pass of a general-purpose hash
function alone (like plain SHA-256) — use a purpose-built, deliberately
SLOW password-hashing algorithm (bcrypt, scrypt, Argon2) that includes a
per-user random "salt," specifically to make brute-force guessing attacks
prohibitively slow, and to prevent identical passwords from producing
identical stored digests.

Tags: Salting, bcrypt, Password storage, Brute-force resistance

## Common Mistakes

- Storing passwords with a fast, general-purpose hash (plain MD5 or SHA-256) with no salt — identical passwords produce identical digests (revealing which users share a password) and fast hashes make brute-forcing feasible at scale.
- Confusing hashing (one-way, for verification) with encryption (two-way, meant to be reversed with a key) — a password should be hashed, never "encrypted," since there's never a legitimate need to recover the original plaintext password.

## Exercises

- Explain why comparing hash digests at login (rather than storing and comparing plaintext) still allows the server to verify a password is correct without ever storing it in reversible form.
- Look up what a "salt" is in password hashing, and explain what specific attack (matching precomputed hash tables, aka rainbow tables) it defends against.

## javascript

```javascript
// A tiny deterministic, illustrative hash function (NOT cryptographically
// secure) to demonstrate determinism + the avalanche effect. Real password
// storage must use a vetted algorithm like bcrypt/Argon2, never this.
function toyHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  // final avalanche-mixing step (murmur3-style finalizer) -- without this, a
  // 1-bit input change would only flip a couple of output bits, not "avalanche"
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0')
}

console.log(toyHash('hunter2'))   // same input -> same digest, every time (determinism)
console.log(toyHash('hunter2'))   // identical to the line above
console.log(toyHash('hunter3'))   // ONE character different -- but a wildly different digest (avalanche effect)
```
Walkthrough: the first two calls with the identical input `'hunter2'`
produce the exact same digest, demonstrating determinism. Changing just
the last character to `'hunter3'` produces a digest that looks nothing
like the original (`39321138` vs `3c187d6f`) — a small illustration of
the avalanche effect real cryptographic hash functions are specifically
designed to exhibit, so a digest never reveals how "close" a guess was.

## python

```python
import hashlib

# Python's real hashlib gives us an ACTUAL cryptographic hash function (SHA-256)
digest1 = hashlib.sha256('hunter2'.encode()).hexdigest()
digest2 = hashlib.sha256('hunter2'.encode()).hexdigest()
digest3 = hashlib.sha256('hunter3'.encode()).hexdigest()

print(digest1 == digest2)   # True -- same input always produces the same digest (determinism)
print(digest1 == digest3)   # False -- one character different produces a completely different digest (avalanche effect)
print(len(digest1))         # 64 -- SHA-256 always produces a fixed-length digest, regardless of input length
```
Walkthrough: unlike the JavaScript side's illustrative toy hash, this uses
Python's real `hashlib.sha256` — a genuine cryptographic hash function.
The same determinism and avalanche-effect properties hold, but here
backed by an actual, real-world algorithm: identical input always
produces an identical 64-character digest, and a single-character change
in the input produces a totally unrelated digest.
