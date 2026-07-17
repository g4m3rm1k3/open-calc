# Lesson 7: Hashing vs. Encryption

Today we study two operations that both turn readable data into unreadable-looking bytes,
and are constantly confused with each other despite having almost nothing in common. Our
case study is a fingerprint you can never reverse, and an envelope you can always open —
if you have the key.

## What you will learn

You'll build a real cryptographic hash and a toy (but genuinely reversible) cipher side by
side, and come away able to answer, without hesitating, the question that trips up a huge
number of real security decisions: *should this specific piece of data be hashed, or
encrypted?* Getting that answer wrong is how "we store your password securely" turns out
to mean something dangerous.

## What you need to know first

No specific prior lesson is required, though Lesson 2's CIA triad is worth having in mind
— today is fundamentally about which tool protects confidentiality (encryption) versus
which tool protects integrity and verifies identity without ever needing to protect
confidentiality of the original value at all (hashing).

---

## The problem

**Hashing** takes data of any size and produces a fixed-size, seemingly-random output
called a **hash** or **digest**. The same input always produces the same hash. There is no
operation that takes a hash and recovers the original input — not because it's illegal or
hard, but because the transformation deliberately throws information away. A hash answers
one question: *does this data match some other data I've already seen*, without either
party ever needing to reveal what the data actually is.

**Encryption** takes data and a **key**, and produces **ciphertext** — and, critically,
there *is* an operation, **decryption**, that takes the ciphertext and the same key and
recovers the exact original data. Encryption is designed to be reversed. Its entire
purpose is that someone holding the right key can get the original back.

These are not two strengths of the same tool. They solve different problems, and using one
where the other belongs is a genuine, common, and serious security mistake — the clearest
example being password storage, which this lesson ends with and Lesson 10 covers in full.

## The lab: a fingerprint and an envelope

**Disposable hosts.** `Fingerprint` (hashing) and `Envelope` (a toy encryption scheme —
explicitly not one you should ever use for real secrets, which the lesson says outright
before you write a line of it).

### Step 1 — a real cryptographic hash

```python
import hashlib

def fingerprint(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

print(fingerprint("hello world"))
print(fingerprint("hello world"))
print(fingerprint("hello worle"))
```

**New constructs.** `hashlib` is Python's standard library module for cryptographic
hashing. `text.encode("utf-8")` converts a Python string into raw bytes using the UTF-8
encoding — hash functions operate on bytes, not on Python's internal string
representation, so this conversion is always the first step. `hashlib.sha256(bytes_value)`
runs those bytes through **SHA-256** (Secure Hash Algorithm, 256-bit output), one of the
most widely used cryptographic hash functions, and returns a hash object.
`.hexdigest()` renders that object's output as a string of hexadecimal characters (`0-9`
and `a-f`) so it can be printed and compared as ordinary text.

Run it:

```
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
0fc30e735a0228a31cbbb969988b4f50e02e737f979f091d7d224b765443f5d
```

**Walkthrough.** The same input, `"hello world"`, produced the exact same 64-character
hash both times — hashing is **deterministic**: no randomness, no state, the same bytes in
always produce the same bytes out. Changing a single character — `"hello world"` to
`"hello worle"`, the final `d` swapped for an `e` — produced a hash that shares no visible
pattern with the original. This is called the **avalanche effect**: a tiny change to the
input causes a large, unpredictable change in the output, specifically so that hashes
can't be used to guess anything about how similar two inputs were just by looking at how
similar their hashes are.

**CS lens.** SHA-256 is a **one-way function**: computing the hash from the input is fast
and easy; computing the input from the hash is, by design, not feasible with any known
method faster than trying inputs one at a time (**brute force**, the same concept from
Lesson 2's `Doorbell` lab) or precomputing a huge table of input/hash pairs in advance (a
**rainbow table** — a lookup table trading storage space for the ability to skip brute
force at lookup time, which Lesson 10's salting technique specifically defeats).

**SE lens.** A hash function's contract with its caller is narrow and precise: same input
→ same output, different input → (almost certainly) different output, fixed-size output
regardless of input size, and no way back. Anything built on top of hashing — password
verification, file integrity checks, data deduplication — relies on exactly those four
guarantees and nothing more. Notice what's *not* in that contract: confidentiality of the
input is never promised, because a hash doesn't need to hide anything to do its job — it
only needs to let you *compare* without storing the original.

### Step 2 — the fixed-size guarantee

```python
print(len(fingerprint("a")))
print(len(fingerprint("a" * 10000)))
```

Run it:

```
64
64
```

**Walkthrough.** A one-character input and a ten-thousand-character input produce hashes
of the exact same length: 64 hexadecimal characters, representing SHA-256's fixed 256-bit
(32-byte) output, regardless of how much data went in. This is what makes hashing
practical for comparing enormous files or datasets — you're always comparing two 64-
character strings, never the original multi-gigabyte inputs themselves.

### Step 3 — a toy encryption scheme

```python
def xor_encrypt(plaintext, key):
    plaintext_bytes = plaintext.encode("utf-8")
    key_bytes = key.encode("utf-8")
    encrypted_bytes = bytes(
        plaintext_bytes[i] ^ key_bytes[i % len(key_bytes)]
        for i in range(len(plaintext_bytes))
    )
    return encrypted_bytes

def xor_decrypt(encrypted_bytes, key):
    key_bytes = key.encode("utf-8")
    decrypted_bytes = bytes(
        encrypted_bytes[i] ^ key_bytes[i % len(key_bytes)]
        for i in range(len(encrypted_bytes))
    )
    return decrypted_bytes.decode("utf-8", errors="replace")

secret = "meet at dawn"
key = "raven"

ciphertext = xor_encrypt(secret, key)
print("ciphertext bytes:", ciphertext)
print("recovered with correct key:", xor_decrypt(ciphertext, key))
print("recovered with wrong key:", xor_decrypt(ciphertext, "wrong"))
```

**New constructs.** `^` is Python's **XOR** (exclusive or) operator, applied here to
individual bytes: for each pair of bits, the result is `1` if exactly one of the two bits
is `1`, and `0` otherwise. XOR has a property that makes it useful here: applying the same
XOR operation twice with the same key returns the original value — `(value ^ key) ^ key ==
value`, always. `key_bytes[i % len(key_bytes)]` reuses the key's bytes in a repeating
cycle if the message is longer than the key, using the **modulo operator** `%` (remainder
after division) to wrap the index back to `0` once it reaches the key's length. The
generator expression inside `bytes(...)` builds one new byte at a time by XOR-ing each
plaintext byte with the corresponding (cyclically repeated) key byte.

**Important, stated outright:** this XOR scheme is a **teaching toy**, not a real cipher.
It has serious, well-known weaknesses (repeating a short key leaks patterns an attacker
can exploit) that make it unsafe for anything you actually want to protect. It's used here
purely because it's short enough to read in full and genuinely demonstrates the property
that matters: *reversibility with a key.* Lesson 8 introduces AES, the real standard, and
explains specifically why XOR-with-a-repeating-key fails where AES doesn't.

Run it:

```
ciphertext bytes: b'\x1f\x04\x13\x11N\x13\x15V\x01\x0f\x05\x0f'
recovered with correct key: meet at dawn
recovered with wrong key: hv|)dg9ohr}
```

**Walkthrough.** `xor_encrypt` produced unreadable bytes — so far, this looks similar to
hashing's output. The difference shows up in the next two lines: `xor_decrypt` with the
*same* key, `"raven"`, perfectly recovers `"meet at dawn"` — the exact original string,
character for character. `xor_decrypt` with the *wrong* key, `"wrong"`, produces
different-looking garbage, `"hv|)dg9ohr}"` — not an error, not a refusal, just an
incorrect result, because XOR-decrypting with the wrong key is a well-defined operation
that simply doesn't undo the original encryption.

**CS lens.** This is the fundamental structural difference from Step 1: hashing has no
decrypt operation *at all* — there is no `hash_decrypt(hash_value)` function that could
even theoretically exist, correct key or not, because the hash function discarded
information the original input contained (specifically: it compressed data of any size
down to a fixed 256 bits, and that compression is lossy — for very long inputs, there are
literally more possible inputs than possible hash outputs, so the mapping cannot be
inverted even in principle). Encryption discards nothing; it *transforms* the data
reversibly, and the key is the only extra piece of information required to run that
transformation backward.

**SE lens.** A system built on encryption has to solve **key management**: something,
somewhere, has to store the key securely, because anyone who obtains the key can decrypt
everything encrypted with it. A system built on hashing has no equivalent problem for the
original data, because there is no key that reverses a hash — but it has a different
concern instead, which the next section makes concrete.

**Security lens.** This is the central design decision in cryptography: **use hashing when
you need to verify or compare without ever needing the original value back. Use encryption
when you need to recover the original value later, and are willing to take on the
responsibility of protecting the key that makes that possible.**

---

## Why "the password is encrypted" is the wrong sentence

Passwords should be **hashed**, never merely encrypted, and the reasoning follows directly
from everything above:

- A login system never needs to recover your original password. It only ever needs to
  answer one question: does the password you just typed match the one you set before? That's
  exactly what hashing was built for — compare a new hash of your typed password to the
  stored hash, with the original password never stored anywhere, ever, by anyone,
  including the system's own administrators.
- If passwords were encrypted instead, then somewhere in that system, a key exists that can
  decrypt every user's password back to plaintext. That key is now the single most
  valuable target in the entire system — anyone who obtains it (an attacker, a malicious
  insider, a careless backup left in the wrong place) can recover every password the
  system has ever stored, not just guess at whether a login attempt was correct.

"We encrypt your password" should make you more suspicious, not less — it means a
reversal path to your actual, original password exists somewhere in that company's
systems, protected by nothing but a key someone else controls. "We hash your password"
means that even the company that runs the login system cannot recover what you originally
typed — which is exactly the guarantee you want from someone storing your credentials.
Lesson 10 builds on this hash directly, adding the piece this lesson deliberately left out
(**salting**) to close the rainbow-table gap mentioned above.

---

## Connect the pieces

Lesson 2 named confidentiality, integrity, and availability as the three properties an
attack can break. Today gives you the first two purpose-built defensive tools for
confidentiality specifically: hashing (protects by making the original *unrecoverable*,
useful when you never need it back) and encryption (protects by making the original
recoverable *only* with a key, useful when you do). Lesson 9 (TLS) is encryption solving a
transport problem — protecting data in transit between two parties who both need the
plaintext at their end. Lesson 10 (Password Storage) is hashing solving a storage problem
— protecting data that only ever needs to be *compared*, never recovered.

## What breaks without this

Imagine a system that, misunderstanding this distinction, encrypts passwords with a fixed
key baked into its source code — a mistake real systems have genuinely made:

```python
STORAGE_KEY = "a1b2c3d4"  # hardcoded, checked into source control

def store_password(password):
    return xor_encrypt(password, STORAGE_KEY)
```

Every password this system has ever stored can be recovered by anyone who reads the source
code — no database breach even required, since the key that unlocks every user's actual
password is sitting in the codebase itself. Compare this to a hash-based system: even a
full database leak, source code and all, gives an attacker only hashes, not passwords —
which is precisely why hashing, not encryption, is the correct tool here, and why the
distinction in this lesson isn't academic.

## Recognition

```
Today: Hashing vs. Encryption

Also recognized in: `git commit` hashes (SHA-1 historically, identifying a
snapshot by its content, never meant to be reversed), file-integrity checksums
(verifying a download wasn't corrupted or tampered with by comparing hashes),
deduplication systems (cloud storage identifying identical files by their hash
without reading their contents), disk and database encryption at rest (recoverable
by design, for the legitimate owner holding the key), TLS/HTTPS (Lesson 9,
encryption protecting data in transit), and blockchain systems, which are, at
their core, chains of data linked together by hashes precisely because a hash
changing detectably signals that something upstream was altered.
```

## Definition of done

- [ ] You ran Steps 1 through 3 and reproduced the outputs shown, including the wrong-key
      decryption producing garbage rather than an error
- [ ] You can state, in one sentence, why a hash cannot be reversed even in principle —
      not "it's hard," but why
- [ ] You can explain why encryption necessarily introduces a key-management problem that
      hashing does not have
- [ ] You can explain, to someone who has never taken this course, why "your password is
      encrypted" should make you more suspicious of a company, not less
- [ ] `git add .` and `git commit -m "Lesson 7: hashing vs encryption — reversibility and
      why passwords are hashed, not encrypted"` in your `security-labs/` folder

**Next:** Lesson 8 — Symmetric vs. Asymmetric Encryption, where you'll see exactly why the
XOR toy above is unsafe, meet AES as the real standard, and solve the problem this lesson
quietly left open: if decrypting requires the same key used to encrypt, how do two people
who've never met agree on a key without an eavesdropper obtaining it too?
