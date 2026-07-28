# Lesson 45: A Secret Number You Must Never Reuse

## What you will build

Text and file encryption built on AES-GCM: reversible, unlike every hash
this curriculum has used since Lesson 13 — the same key that encrypts a
message decrypts it back to the original, which is exactly the new
property this lesson needs and none of the prior hashing lessons had.
Along the way, three real, directly demonstrated proofs: that tampering
with encrypted data is detected rather than silently corrupting the
result, that decrypting with the wrong key fails cleanly, and — the
lesson's real center of gravity — that reusing a single supposedly
"random" number in the wrong place can catastrophically destroy the
encryption's guarantees even though the key itself was never exposed at
all.

## What you need to know first

- **Lesson 42** — hashing is one-way: no key recovers a password from
  its hash. Today's encryption is the direct opposite: two-way, by
  design, which is why it needs a secret key at all — reversibility is
  the whole point here, not a flaw the way it would be for a password
  hash.
- **Lesson 44** — checksums prove a file wasn't altered but do nothing
  to hide its contents. Today's lesson is explicitly the other half of
  that same lesson's closing note: keeping content secret, not just
  verifying it's unchanged — though, as this lesson shows directly, a
  well-chosen encryption mode can provide *both* properties at once.
- **Lesson 35** — `pip` and virtual environments, reused directly:
  today's real AES implementation comes from the `cryptography` package,
  installed the same way Pillow was.

---

## The Problem, in prose, no code yet

Hashing (Lessons 13, 30, 41, 42, 44) is deliberately one-way: there's no
way to recover the original input from a hash, and that's the entire
point every time it's been used so far. Sometimes the actual goal is the
opposite: hide a message's content from anyone without the right key,
while still being able to get the original content *back* later, given
that key. That's **encryption**, and it needs machinery hashing simply
doesn't have — a secret key, and a cipher built to be reversed correctly
with it, and only it.

Python's standard library, despite containing `hashlib` and `hmac`,
deliberately does not include a symmetric cipher implementation at all —
a real, meaningful gap this lesson doesn't work around casually. Rolling
custom cryptography, even something as seemingly simple as "encrypt these
bytes," is exactly the kind of task where subtle mistakes are invisible
until catastrophic, which is precisely what this lesson's own nonce-reuse
demonstration proves directly, later on, using nothing but correct,
well-vetted primitives used one specific way. This lesson uses a real,
professionally maintained library — `cryptography` — for the actual
cipher, and spends its effort on the surrounding decisions that remain
the programmer's responsibility even with a correct library in hand.

---

## Concept Unit: AES-GCM, End to End

### The Problem

Encrypting a message needs, at minimum, three things: a secret key,
an algorithm that uses it to transform plaintext into ciphertext and
back, and — as the next unit shows is not optional — something that
guarantees the ciphertext hasn't been tampered with in transit.

### Commands needed

```
$ python3 -m venv .venv
$ .venv/bin/pip install --quiet cryptography
```

`cryptography` (**first appearance**) is the standard, widely-trusted
Python library for real cryptographic primitives — installed here into a
virtual environment, exactly per Lesson 35's established pattern.

### Introduce the concept in isolation

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
nonce = os.urandom(12)

cipher = AESGCM(key)

plaintext = b"the launch codes are 4-8-15-16-23-42"
ciphertext = cipher.encrypt(nonce, plaintext, associated_data=None)

print("key (32 bytes):", key.hex())
print("nonce (12 bytes):", nonce.hex())
print("plaintext:", plaintext)
print("ciphertext:", ciphertext.hex())
print("ciphertext is longer than plaintext by:", len(ciphertext) - len(plaintext), "bytes")

recovered = cipher.decrypt(nonce, ciphertext, associated_data=None)
print("decrypted:", recovered)
print("round-trip correct:", recovered == plaintext)
```

Run it:

```
key (32 bytes): d0431054b48ae78aa061ca5facd05420315ae3b5fdf1db9d93c9b0886536e630
nonce (12 bytes): a168e3792db73afc1117378c
plaintext: b'the launch codes are 4-8-15-16-23-42'
ciphertext: 240fec67ee85c226ccad8313003883e82b2f341ecc52999c4d1b78eed4d9ab5b9f7b2314732f506fdc08144fb703c43af252ed35
decrypted: b'the launch codes are 4-8-15-16-23-42'
round-trip correct: True
```

What this proves: `AESGCM.generate_key(bit_length=256)` (**first
appearance**) produces a genuinely random 256-bit (32-byte) key, built on
the same operating-system randomness source as Lesson 43's `secrets`
module — encryption keys need exactly the same unpredictability
guarantee password generation did, for the same underlying reason.
**AES** (**first appearance**, "Advanced Encryption Standard") is the
actual cipher algorithm — the current, well-studied, government- and
industry-standard choice for symmetric encryption (the same key both
encrypts and decrypts, unlike the asymmetric public/private key schemes
a later lesson covers). **GCM** (**first appearance**, "Galois/Counter
Mode") is the *mode* AES runs in — a mode that, notably, provides both
confidentiality (the message is hidden) and, via the extra `16` bytes
visible in the output, built-in tamper detection, demonstrated directly
in the next unit. `nonce` (**first appearance**, "number used once") is
a value that must be unique for every single encryption performed with a
given key — never secret, generated fresh with `os.urandom` (Lesson 42)
every time, and required by `decrypt()` to be the *exact* value used
during encryption.

This lab is deleted now; it never appears in the project. What survives
is the full mechanical shape — generate a key, generate a nonce, encrypt,
decrypt — assembled into the real tool two units below, after two
critical properties of this exact scheme are demonstrated directly
first.

### CS Lens

This is **symmetric-key authenticated encryption** — "symmetric" because
one key does both directions (as opposed to the public/private key pairs
of asymmetric schemes), "authenticated" because the scheme itself
detects tampering as a first-class guarantee, not an afterthought bolted
on separately.

Also recognized in: TLS (the encryption underneath HTTPS, which this
curriculum's own networking lessons deliberately ran *without*, in plain
`http://`, specifically to keep those lessons readable — this is the
missing piece those lessons named but didn't build), full-disk
encryption, encrypted messaging apps' message-level encryption.

### SE Lens

Choosing GCM specifically, rather than an older mode like plain CBC,
is a direct application of Lesson 44's integrity lesson folded into the
encryption itself: a scheme providing secrecy *without* also providing
authentication would need a completely separate mechanism (an HMAC, à la
Lesson 30's use of SHA-1 in a different context) layered on top by hand
to detect tampering — an extra step genuinely easy to forget or get
subtly wrong, and a well-documented source of real vulnerabilities in
deployed systems historically. GCM's design folds both properties into
one correctly-composed primitive instead of trusting every caller to
remember to add the second one themselves.

---

## Concept Unit: Tampering Is Rejected, Not Silently Wrong

### The Problem

An encrypted message travels over some channel — a network, a saved
file — that isn't necessarily trustworthy. Encryption alone would hide
the *content* from an eavesdropper, but says nothing about what happens
if someone *modifies* the ciphertext in transit — the previous unit's
extra `16` bytes are the answer, demonstrated directly here rather than
just asserted.

### Introduce the concept in isolation

```python
from cryptography.exceptions import InvalidTag

key = AESGCM.generate_key(bit_length=256)
nonce = os.urandom(12)
cipher = AESGCM(key)

plaintext = b"transfer $10 to alice"
ciphertext = cipher.encrypt(nonce, plaintext, associated_data=None)

tampered = bytearray(ciphertext)
tampered[0] ^= 0xFF  # flip every bit in the first byte
tampered = bytes(tampered)

try:
    cipher.decrypt(nonce, tampered, associated_data=None)
    print("decryption succeeded (this should not happen)")
except InvalidTag as error:
    print(f"decryption correctly rejected: {type(error).__name__}")
```

Run it:

```
decryption correctly rejected: InvalidTag
```

What this proves: `bytearray(ciphertext)` (**first appearance**) creates
a *mutable* copy of the immutable `bytes` object — `bytes` objects
cannot be modified in place (every earlier lesson's byte manipulation
built a *new* `bytes` object instead), so this is the first genuine need
in this curriculum for byte data that can be changed directly, one
element at a time, via `tampered[0] ^= 0xFF`. `^= 0xFF` (a **hard concept
reappearing** from Lesson 30's masking XOR, applied here to guarantee a
changed value rather than to unmask one) flips every bit of the first
byte — the smallest possible tampering. `InvalidTag` (**first
appearance**) is the specific exception `cryptography` raises when
GCM's built-in authentication check fails — the mechanism behind the
extra `16` bytes noted in the previous unit: they're a cryptographic
**authentication tag**, computed during encryption from the *entire*
ciphertext and the key, and re-verified during decryption before any
plaintext is returned at all. Even a single flipped bit anywhere causes
this check to fail, and — critically — `decrypt()` raises an exception
rather than returning corrupted-but-plausible-looking plaintext, which
is exactly the property that makes tampering *detectable* rather than
silently, dangerously wrong.

This lab is deleted now; it never appears in the project.

### CS Lens

This is the encryption-layer instance of the exact same **avalanche
effect** Lesson 44 demonstrated for hashing — a tiny input change
producing a large, unpredictable, and here specifically *rejecting*
output change — applied to an authentication tag rather than a checksum,
serving the identical purpose: making any tampering, however small,
reliably detectable.

### SE Lens

A cipher mode that decrypted tampered ciphertext into *some* plaintext
without any error at all — plausible-looking garbage, or worse, an
attacker-influenced value — would be far more dangerous than one that
fails loudly, the same "fail fast, fail visibly" principle Lesson 34's
crontab validation and Lesson 40's `systemd-analyze verify` both already
established in different contexts.

---

## Concept Unit: Never Reuse a Nonce — Proven, Not Just Warned

### The Problem

The first unit stated that a nonce must never be reused with the same
key. Stated as a rule, that's easy to treat as a minor best practice
rather than a hard requirement. It's worth proving directly just how bad
the consequence actually is.

### Introduce the concept in isolation

```python
key = AESGCM.generate_key(bit_length=256)
reused_nonce = os.urandom(12)  # the mistake: generated once, used twice below
cipher = AESGCM(key)

message_one = b"ATTACK AT DAWN TOMORROW MORNING"
message_two = b"HOLD POSITION UNTIL FURTHER NOTE"[:len(message_one)]

ciphertext_one = cipher.encrypt(reused_nonce, message_one, associated_data=None)
ciphertext_two = cipher.encrypt(reused_nonce, message_two, associated_data=None)

# an eavesdropper has no key, but can still XOR the two ciphertexts' bodies together
# (excluding the trailing 16-byte authentication tag on each)
body_one = ciphertext_one[:-16]
body_two = ciphertext_two[:-16]
xor_of_ciphertexts = bytes(a ^ b for a, b in zip(body_one, body_two))
xor_of_plaintexts = bytes(a ^ b for a, b in zip(message_one, message_two))

print("XOR of ciphertext bodies == XOR of real plaintexts:", xor_of_ciphertexts == xor_of_plaintexts)

# with one plaintext known (e.g. a guessed common header), the other is fully recovered
recovered_message_two = bytes(a ^ b for a, b in zip(xor_of_ciphertexts, message_one))
print("message_two recovered using only message_one, no key needed:", recovered_message_two)
print("matches real message_two:", recovered_message_two == message_two)
```

Run it:

```
XOR of ciphertext bodies == XOR of real plaintexts: True
message_two recovered using only message_one, no key needed: b'HOLD POSITION UNTIL FURTHER NOT'
matches real message_two: True
```

What this proves, concretely rather than abstractly: GCM (and every
mode built on a **stream cipher** construction internally, which AES-GCM
is) works by generating a pseudorandom **keystream** from the key and
nonce together, then XOR-ing it against the plaintext — structurally the
same XOR-based masking Lesson 30's WebSocket frames used, just with a
cryptographically-generated keystream instead of a short repeating key.
If the *same* key and nonce are used twice, the *same* keystream is
generated both times — and XOR-ing the two resulting ciphertexts
together cancels that shared keystream out completely, leaving exactly
the XOR of the two original plaintexts, recoverable by anyone
intercepting both messages, **with no knowledge of the key at all**. Once
one plaintext is known or guessed (a common message header, a predictable
greeting), the other is fully recovered by one more XOR — exactly as the
final two lines just demonstrated, byte-for-byte correct.

This lab is deleted now; it never appears in the project. What survives
is the strongest possible argument for the rule stated in the very first
unit: nonce reuse doesn't weaken this encryption scheme — for GCM
specifically, it can defeat it entirely, without the key ever being
touched.

### CS Lens

This is a modern instance of the classical **two-time pad** attack —
historically named for its most famous failure mode, one-time pads (a
theoretically perfect cipher *only* if the key is truly random and never
reused) reused a second time, breaking their guarantee completely. GCM's
internal keystream generation inherits exactly this same fragility with
respect to nonce reuse, dressed in modern cryptographic machinery.

Also recognized in: real, historical, documented cryptographic failures
— reused WEP initialization vectors (WiFi's early, now-deprecated
encryption, broken in large part through exactly this mechanism), several
real-world VPN and disk-encryption implementation bugs traced directly
to nonce or IV reuse.

### SE Lens

This is the single strongest argument in this entire lesson for why
`encrypt_bytes`, built in the next unit, generates a fresh
`os.urandom(12)` nonce on *every single call*, with no parameter allowing
a caller to supply or reuse one — removing the possibility of this exact
mistake at the API design level, rather than trusting every future
caller to remember a rule whose violation, as just proven, doesn't fail
loudly at all: nothing about the nonce-reuse attack demonstrated above
raised an exception or produced an error anywhere — it succeeded
silently, which is precisely why the fix belongs in the function's
design, not in a comment warning future readers to be careful.

---

## Concept Unit: Assembling the Tool

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `crypto_tool.py`.
- **Change type:** add.
- **Dependencies:** every concept unit above.

### The New Code

```python
NONCE_SIZE_BYTES = 12


def generate_key():
    return AESGCM.generate_key(bit_length=256)


def encrypt_bytes(key, plaintext_bytes):
    nonce = os.urandom(NONCE_SIZE_BYTES)
    cipher = AESGCM(key)
    ciphertext = cipher.encrypt(nonce, plaintext_bytes, associated_data=None)
    return nonce + ciphertext  # nonce prepended so decryption knows where to find it


def decrypt_bytes(key, nonce_and_ciphertext):
    nonce = nonce_and_ciphertext[:NONCE_SIZE_BYTES]
    ciphertext = nonce_and_ciphertext[NONCE_SIZE_BYTES:]
    cipher = AESGCM(key)
    return cipher.decrypt(nonce, ciphertext, associated_data=None)


def encrypt_text(key, plaintext_str):
    return encrypt_bytes(key, plaintext_str.encode("utf-8"))


def decrypt_text(key, nonce_and_ciphertext):
    return decrypt_bytes(key, nonce_and_ciphertext).decode("utf-8")


def encrypt_file(key, source_path, destination_path):
    with open(source_path, "rb") as source_file:
        plaintext_bytes = source_file.read()
    encrypted = encrypt_bytes(key, plaintext_bytes)
    with open(destination_path, "wb") as destination_file:
        destination_file.write(encrypted)


def decrypt_file(key, source_path, destination_path):
    with open(source_path, "rb") as source_file:
        encrypted = source_file.read()
    plaintext_bytes = decrypt_bytes(key, encrypted)
    with open(destination_path, "wb") as destination_file:
        destination_file.write(plaintext_bytes)
```

### Mechanical Walkthrough

- `nonce + ciphertext` — `bytes` concatenation (a **hard concept
  reappearing** from Lesson 30's frame assembly), storing the nonce
  *with* the ciphertext rather than separately — solving a real problem
  the earlier units left open: `decrypt()` needs the exact original
  nonce, and prepending it to the output is the simplest way to ensure
  it always travels alongside the data it belongs to, rather than
  needing to be tracked and matched up separately by whatever stores the
  result.
- `nonce_and_ciphertext[:NONCE_SIZE_BYTES]` /
  `nonce_and_ciphertext[NONCE_SIZE_BYTES:]` — reused slicing, the exact
  inverse of the concatenation above: split the combined value back into
  its two original parts at the fixed, known boundary.
- `encrypt_text` / `decrypt_text` — thin wrappers converting between
  `str` and `bytes` (reused `.encode()`/`.decode()`), so the underlying
  `encrypt_bytes`/`decrypt_bytes` functions need to know nothing about
  text encoding at all — the same encoding-agnostic-core design Lesson
  30's frame encoder used.
- `encrypt_file` / `decrypt_file` — read (or write) the entire file's
  raw bytes in one call, deliberately *not* using Lesson 44's chunked
  approach: GCM's authentication tag is computed over the *entire*
  message as one unit, so — unlike hashing, which can process data
  incrementally with identical results — encrypting a file in
  independent chunks would need each chunk to carry its own separate
  nonce and tag, a real, different design this lesson doesn't build,
  named honestly as a limitation rather than silently ignored: this
  version holds the whole file in memory, exactly the tradeoff Lesson 44
  measured and moved away from for hashing, reappearing here because
  authenticated encryption's correctness requirements are genuinely
  different from a hash's.

### Run it

```python
key = generate_key()

encrypted_text = encrypt_text(key, "the vault combination is 12-34-56")
print("decrypted text:", decrypt_text(key, encrypted_text))
```

```
decrypted text: the vault combination is 12-34-56
```

```python
with open("secret_plans.txt", "w") as f:
    f.write("Meet at the old bridge at midnight.\n")

encrypt_file(key, "secret_plans.txt", "secret_plans.txt.enc")
print("encrypted file is unreadable text:", open("secret_plans.txt.enc", "rb").read()[:20])

decrypt_file(key, "secret_plans.txt.enc", "secret_plans.decrypted.txt")
print("decrypted file contents:", open("secret_plans.decrypted.txt").read().strip())
```

```
encrypted file is unreadable text: b'A\xdaY\xec|\x1d\x0b\xa6\xcd\xfc\x8ep>Zv\x1f\x17Zfd'
decrypted file contents: Meet at the old bridge at midnight.
```

And, closing the loop with the second unit's own guarantee, applied
through the real assembled API rather than the raw library call:

```python
wrong_key = generate_key()
try:
    decrypt_text(wrong_key, encrypted_text)
except InvalidTag:
    print("correctly rejected: wrong key cannot decrypt")
```

```
correctly rejected: wrong key cannot decrypt
```

### CS Lens and SE Lens

Both already covered by the individual units above — this unit is
composition, not new concepts, per the Repetition Rule; the one design
choice worth naming again briefly is the nonce-prepending scheme, which
exists entirely because of the danger the third concept unit proved
directly: making it structurally impossible for a caller to mismatch a
ciphertext with the wrong nonce is a direct, design-level answer to a
failure mode that produces no error message at all when it goes wrong.

---

## Connect the pieces

One secret, `"the vault combination is 12-34-56"`, followed through the
whole lesson: `generate_key` produces a real, unpredictable 256-bit key
using the same OS randomness source Lesson 43 relied on for passwords.
`encrypt_text` encodes it to bytes and hands it to `encrypt_bytes`,
which generates a *fresh* nonce — never reused, per the third unit's
direct proof of what happens when that rule is broken — and produces
ciphertext carrying its own built-in tamper-detection tag, per the
second unit's direct proof that any modification is rejected outright
rather than silently corrupting the result. `decrypt_text` reverses
every step, and only succeeds at all given both the exact right key and
an unmodified ciphertext — both properties demonstrated as real
failures, not just described, earlier in this lesson.

## What breaks without this

Already demonstrated three separate times, directly, with real code and
real output, rather than needing a fourth staged failure: reusing a
nonce leaks the XOR of two plaintexts with no key required at all
(third unit); tampering with even one bit of ciphertext is rejected with
`InvalidTag` rather than silently corrupting the result (second unit);
and decrypting with the wrong key fails the identical way (final run in
the assembly unit).

## Definition of done

- [ ] `encrypt_text` followed by `decrypt_text`, with the same key,
      recovers the exact original string.
- [ ] `encrypt_file` followed by `decrypt_file` recovers the exact
      original file content, and the encrypted file's raw bytes are not
      readable as text.
- [ ] Tampering with a single byte of ciphertext causes `decrypt_bytes`
      to raise `InvalidTag`, not to return corrupted plaintext.
- [ ] Decrypting with a different key raises `InvalidTag` in the same
      way.
- [ ] You can reproduce the nonce-reuse plaintext-recovery attack
      yourself and explain, in your own words, why it requires no
      knowledge of the key at all.
- [ ] You can explain why `encrypt_bytes` has no parameter that would
      let a caller supply their own nonce.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add crypto_tool.py
  git commit -m "Add AES-GCM text/file encryption with per-call random nonces — nonce reuse is proven, not just documented, to leak plaintext XOR with no key needed, which is why the API never accepts a caller-supplied nonce"
  ```

## What's next

Lesson 46's asymmetric encryption solves a problem this lesson's design
leaves completely open: `encrypt_bytes` and `decrypt_bytes` both need
the *same* key, which means getting that key to a second party securely,
in the first place, is a problem this lesson doesn't touch at all — the
exact gap public-key cryptography exists to close. Lesson 53's password
vault will use this exact `encrypt_bytes`/`decrypt_bytes` pair directly,
with the vault's own master password (put through Lesson 42's PBKDF2,
not used as a raw AES key) deriving the encryption key that protects
every stored password inside it.
