# Lesson 46: Two Keys Solve a Problem One Key Can't

## What you will build

RSA public/private key encryption, used two different ways: to solve
Lesson 45's own unfinished problem (how do two parties share a secret
AES key in the first place?) by building **hybrid encryption** —
RSA wraps a fresh AES key, AES-GCM does the actual heavy lifting on the
real message — and separately, **digital signatures**, which use the
same key pair in the *opposite* direction to prove a message genuinely
came from whoever holds the private key, unforgeable by anyone else.

## What you need to know first

- **Lesson 45** — AES-GCM, and its one unstated assumption: both sides
  already somehow share the same secret key. Today's hybrid encryption
  is built directly on that lesson's `AESGCM` usage, solving exactly the
  gap its own "what's next" named.
- **Lesson 42** — hashing, reused here as a genuine building block:
  RSA signatures, as this lesson builds them, sign a *hash* of a
  message, not the message's raw bytes directly.

---

## The Problem, in prose, no code yet

Lesson 45's AES-GCM works perfectly once both parties already have the
same secret key — but it never addressed how they get it in the first
place. Sending the key itself over the same channel as the encrypted
message defeats the purpose entirely: anyone who can intercept the
message can intercept the key alongside it. This is the **key
distribution problem**, and it's not a minor gap — it's the central
limitation of every symmetric cipher, including the one built last
lesson. Asymmetric ("public-key") cryptography solves it with a genuinely
different idea: two mathematically related keys, one that can be shared
completely openly and one that must never be shared at all, where each
can undo what the other does — but not undo its own work.

---

## Concept Unit: Two Keys, One Relationship

### The Problem

Symmetric encryption's one key must be kept equally secret by everyone
who uses it — there's no way to give someone the ability to encrypt a
message to you without also giving them the ability to decrypt anything
else encrypted with that same key. What's needed is a way to hand out an
"encrypt to me" capability freely, without that capability including a
"decrypt what others sent me" capability at all.

### Commands needed

Reusing Lesson 45's exact virtual environment and package.

### The New Code

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

message = b"meet at noon"

ciphertext = public_key.encrypt(
    message,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
)
print("ciphertext length:", len(ciphertext), "bytes")

recovered = private_key.decrypt(
    ciphertext,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
)
print("decrypted:", recovered)
print("round-trip correct:", recovered == message)
```

Run it:

```
ciphertext length: 256 bytes
decrypted: b'meet at noon'
round-trip correct: True
```

What this proves: `rsa.generate_private_key(...)` (**first appearance**)
generates a **key pair** — a `private_key` object and, derived from it
via `.public_key()` (**first appearance**), a mathematically related
`public_key`. `public_exponent=65537` (**first appearance**) is a fixed,
standard technical parameter of the RSA algorithm itself — not a secret,
not something this lesson needs to reason about further, always this
same value in virtually every real system. `key_size=2048` (**first
appearance**) sets the key's bit length — larger means stronger and
slower, `2048` being a common, currently-secure real-world default. The
critical, structural fact the code demonstrates: `public_key.encrypt(...)`
and `private_key.decrypt(...)` are genuinely different operations, using
genuinely different key objects — unlike AES-GCM, where the *same* `key`
value from Lesson 45 appeared on both the `encrypt` and `decrypt` calls.
`padding.OAEP(...)` (**first appearance**, "Optimal Asymmetric Encryption
Padding") is a required, standardized padding scheme wrapped around the
raw RSA mathematics — RSA's underlying math alone is not safe to use
directly on real messages, and OAEP is the modern, correct choice,
mentioned here by name because it will matter directly in the very next
unit.

### CS Lens

This is **asymmetric (public-key) cryptography**: two keys where each
undoes the other's operation, but neither can be feasibly derived from
the other in practical time, even though they're mathematically related
by construction. The security rests on a genuine, hard mathematical
problem — for RSA specifically, the difficulty of factoring the product
of two large prime numbers back into those primes.

Also recognized in: HTTPS's own certificate system (a server's public
key, shared with every visitor, versus its private key, kept on the
server alone), SSH key-based authentication (the `~/.ssh/id_rsa` /
`id_rsa.pub` pair many developers already have on their own machine),
PGP/GPG encrypted email.

### SE Lens

Asymmetric encryption is dramatically slower than symmetric encryption
for the same amount of data — a direct, real cost of the harder
mathematical problem it's built on — which is exactly why it's used the
way the rest of this lesson uses it: to solve the *key exchange*
problem specifically, not to replace AES-GCM for bulk data. Using the
right tool for the right *part* of the problem, rather than one tool for
everything, is the actual design lesson underneath the two techniques
this lesson builds.

---

## Concept Unit: RSA Has a Real Size Limit — Measured, Not Assumed

### The Problem

If RSA can encrypt a message and decrypt it back correctly, it might
seem like AES-GCM was unnecessary — why not just use RSA for everything?
This unit measures directly why not.

### Introduce the concept in isolation

```python
key_size_bytes = 2048 // 8
hash_size_bytes = hashes.SHA256().digest_size
max_message_bytes = key_size_bytes - 2 * hash_size_bytes - 2
print(f"key size: {key_size_bytes} bytes, hash size: {hash_size_bytes} bytes")
print(f"maximum OAEP message size for this key: {max_message_bytes} bytes")

fits_message = b"x" * max_message_bytes
too_big_message = b"x" * (max_message_bytes + 1)

try:
    public_key.encrypt(fits_message, oaep_padding)
    print(f"encrypting {len(fits_message)} bytes: succeeded")
except Exception as error:
    print(f"encrypting {len(fits_message)} bytes: {type(error).__name__}: {error}")

try:
    public_key.encrypt(too_big_message, oaep_padding)
except ValueError as error:
    print(f"encrypting {len(too_big_message)} bytes: ValueError: {error}")
```

Run it:

```
key size: 256 bytes, hash size: 32 bytes
maximum OAEP message size for this key: 190 bytes
encrypting 190 bytes: succeeded
encrypting 191 bytes: ValueError: Encryption failed
```

What this proves, exactly rather than approximately: this specific
2048-bit key can encrypt **at most 190 bytes** in one call — one byte
over that limit fails immediately, with a real, real `ValueError`. RSA
doesn't encrypt a message the way AES does, as an arbitrary-length
stream — the underlying mathematics operates on a single number no
larger than the key itself, and OAEP's own padding overhead (built from
the hash size, per the formula computed above:
`key_size − 2×hash_size − 2`) further shrinks how much of that number's
size is available for actual message content. This is a hard,
structural limit, not a configuration option — RSA, by its fundamental
design, cannot directly encrypt anything larger than roughly its own key
size, which rules it out for encrypting real files, images, or any
message of meaningful length.

This lab is deleted now; it never appears in the project. What survives
is the concrete, measured reason `AESGCM`, not `RSA` directly, has to do
the actual work of encrypting real message content — set up next.

### CS Lens

This size ceiling follows directly from RSA's underlying mathematics
operating on integers modulo the key size — a message must fit within
one modular-arithmetic value the key size can represent, with padding
overhead subtracted, unlike a block or stream cipher (AES) built
specifically to process input of any length through repeated,
chained operations.

### SE Lens

This measured limitation is the entire justification for the next unit's
design, not a workaround for a flaw: **hybrid encryption** is the
standard, universal real-world pattern — TLS, PGP, and virtually every
other real public-key system all use exactly this combination — because
it uses each algorithm for the part it's actually good at: RSA for
securely exchanging a small, fixed-size secret, AES for efficiently
encrypting a message of any real size.

---

## Concept Unit: Hybrid Encryption

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `asymmetric_tool.py`.
- **Change type:** add.
- **Dependencies:** Lesson 45's `AESGCM` usage pattern, reused directly
  alongside RSA.

### The New Code

```python
OAEP_PADDING = padding.OAEP(
    mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None
)
NONCE_SIZE_BYTES = 12


def hybrid_encrypt(public_key, plaintext_bytes):
    aes_key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(NONCE_SIZE_BYTES)
    aes_ciphertext = AESGCM(aes_key).encrypt(nonce, plaintext_bytes, associated_data=None)
    wrapped_key = public_key.encrypt(aes_key, OAEP_PADDING)
    return wrapped_key, nonce + aes_ciphertext


def hybrid_decrypt(private_key, wrapped_key, nonce_and_ciphertext):
    aes_key = private_key.decrypt(wrapped_key, OAEP_PADDING)
    nonce = nonce_and_ciphertext[:NONCE_SIZE_BYTES]
    ciphertext = nonce_and_ciphertext[NONCE_SIZE_BYTES:]
    return AESGCM(aes_key).decrypt(nonce, ciphertext, associated_data=None)
```

### Mechanical Walkthrough

- `AESGCM.generate_key(bit_length=256)` and the `nonce`/`.encrypt(...)`
  call — a **hard concept reappearing**, identical to Lesson 45's own
  `encrypt_bytes`: a brand-new, random AES key is generated **fresh for
  every single call**, never reused across messages — directly avoiding
  Lesson 45's own proven nonce-reuse catastrophe by construction, since a
  fresh key each time means there's never an opportunity to reuse a
  nonce against a repeated key at all.
- `public_key.encrypt(aes_key, OAEP_PADDING)` — this is the entire
  hybrid idea, stated in one line: the only thing RSA ever encrypts is
  the small, fixed-size AES key (32 bytes — comfortably under the
  190-byte limit just measured, regardless of how large the actual
  message is), never the message itself.
- `wrapped_key, nonce + aes_ciphertext` — a **hard concept reappearing**
  from Lesson 45's own nonce-prepending scheme, returning two separate
  pieces here (the RSA-wrapped key, and the nonce-plus-AES-ciphertext)
  rather than one combined value, since the wrapped key has a fixed,
  key-size-dependent length while the AES portion's length depends on
  the message.
- `hybrid_decrypt` — the exact reverse, in order: unwrap the AES key
  using the private key first, then use that recovered key to decrypt
  the actual message with AES-GCM, exactly as Lesson 45 already
  established.

### Run it

```python
private_key, public_key = generate_rsa_keypair()

large_message = b"This is a much longer message than RSA-OAEP could ever encrypt directly. " * 20
print("message length:", len(large_message), "bytes (larger than the 190-byte RSA-OAEP limit)")

wrapped_key, encrypted_body = hybrid_encrypt(public_key, large_message)
print("wrapped AES key length:", len(wrapped_key), "bytes")
print("encrypted body length:", len(encrypted_body), "bytes")

recovered = hybrid_decrypt(private_key, wrapped_key, encrypted_body)
print("hybrid round-trip correct:", recovered == large_message)
```

```
message length: 1460 bytes (larger than the 190-byte RSA-OAEP limit)
wrapped AES key length: 256 bytes
encrypted body length: 1488 bytes
hybrid round-trip correct: True
```

A 1,460-byte message — nearly 8 times over the direct RSA-OAEP limit
just measured — encrypted and correctly recovered, because RSA never
touched the message itself at all; it only ever wrapped a 32-byte AES
key, which fits easily within its 190-byte ceiling regardless of how
large the real payload grows.

### CS Lens and SE Lens

Both fully covered by the previous unit's SE lens, which this unit
directly implements — no new lens content owed here beyond naming the
connection, per the Repetition Rule: this is the standard real-world
pattern, built and proven working end to end, not just described.

---

## Concept Unit: Digital Signatures — The Same Keys, Reversed

### The Problem

Encryption (with either scheme in this lesson) answers "can only the
intended recipient read this?" A genuinely different question —
"did this message really come from who it claims to be from, and is it
exactly what they sent?" — needs a different mechanism, even though it
turns out to reuse the exact same RSA key pair.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `asymmetric_tool.py`.
- **Change type:** add.
- **Location:** below `hybrid_decrypt`.

### The New Code

```python
def sign_message(private_key, message_bytes):
    return private_key.sign(
        message_bytes,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256(),
    )


def verify_signature(public_key, message_bytes, signature):
    try:
        public_key.verify(
            signature,
            message_bytes,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
        return True
    except InvalidSignature:
        return False
```

### Mechanical Walkthrough

- `private_key.sign(...)` — **first appearance, and the key structural
  reversal this unit is built around**: signing uses the *private* key,
  the exact opposite of `hybrid_encrypt`'s use of the *public* key.
  Since only the holder of the private key can produce a valid
  signature, and *anyone* holding the public key can check one, a valid
  signature is proof the message passed through someone who possesses
  the private key — without that private key ever leaving their
  possession.
- `hashes.SHA256()` as the third argument — a **hard concept
  reappearing**: internally, `sign` doesn't run RSA's math over the
  entire message directly (the same size ceiling from the earlier unit
  would apply); it first hashes the message down to a fixed size, then
  signs *that* hash — meaning the signature actually certifies "this
  exact hash," and by the avalanche-effect property Lesson 44 already
  established, that's equivalent to certifying the exact original
  message, since any change at all produces a completely different
  hash.
- `padding.PSS(...)` (**first appearance**, "Probabilistic Signature
  Scheme") — the modern, correct padding scheme for RSA signatures,
  playing the equivalent structural role OAEP played for encryption:
  required, standardized, not something to substitute or omit.
- `public_key.verify(...)` — takes the signature, the original message,
  and recomputes/checks the match using only public information; raises
  `InvalidSignature` (**first appearance**) rather than returning
  `False` directly, which is why `verify_signature` wraps it in a
  `try`/`except` to convert it into a plain boolean — a **hard concept
  reappearing** from this curriculum's now-familiar practice
  (Lesson 37's `CheckResult`) of converting an internal exception into an
  ordinary return value at the boundary a caller actually wants to work
  with.

### Run it

```python
document = b"I, the sender, agree to the terms in section 4."
signature = sign_message(private_key, document)
print("signature length:", len(signature), "bytes")
print("verifies against original document:", verify_signature(public_key, document, signature))

tampered_document = document.replace(b"section 4", b"section 9")
print("verifies against tampered document:", verify_signature(public_key, tampered_document, signature))

other_private_key, other_public_key = generate_rsa_keypair()
print("verifies with the wrong public key:", verify_signature(other_public_key, document, signature))
```

```
signature length: 256 bytes
verifies against original document: True
verifies against tampered document: False
verifies with the wrong public key: False
```

Three real, distinct checks, all correct: the genuine document with its
genuine signature verifies; the *exact same signature* against a
one-word-changed document fails, proving the signature is bound to the
message's precise content, not just its general shape; and the genuine
document with its genuine signature, checked against a *different*
person's public key, also fails — proving the signature is bound to a
specific key pair, not just "some" valid RSA signature.

### CS Lens

This is **non-repudiation** — a property encryption alone doesn't
provide: the signer cannot later plausibly deny having signed the
message, because producing a valid signature requires the private key
only they hold. Encryption alone (even RSA) doesn't prove authorship at
all — anyone with someone's *public* key can encrypt a message *to*
them, but that says nothing about who originally wrote it.

Also recognized in: code signing (verifying a downloaded program hasn't
been tampered with and genuinely comes from its claimed publisher),
signed Git commits, SSL/TLS certificates (themselves signed by a
certificate authority's private key, verified using that authority's
widely-trusted public key).

### SE Lens

Encryption and signing use the private/public roles in *opposite*
directions on purpose: encryption protects *confidentiality* (only the
private key holder can read a message anyone encrypted to their public
key), while signing protects *authenticity* (only the private key holder
could have produced this signature, which anyone can check with the
public key). Conflating the two — for instance, mistakenly believing
that encrypting a message with your own private key would let anyone
"verify" it came from you — is a real, historically documented category
of cryptographic misuse; keeping the two operations, and their key
directions, clearly separate is what this lesson's two halves were built
to make concrete rather than confusable.

---

## Connect the pieces

One message, sent through both halves of this lesson: to keep a large
document *confidential*, `hybrid_encrypt` generates a fresh AES key,
encrypts the real content with it (Lesson 45's own machinery, unchanged),
and wraps only that small key with the recipient's RSA public key — safe
even though RSA alone could never have handled the full document
directly, per the measured 190-byte ceiling. To prove that same document
*genuinely came from its claimed sender*, `sign_message` uses the
sender's RSA private key over a hash of the content, and anyone holding
the sender's public key can independently confirm both that the
signature is valid and that the content hasn't changed by so much as one
byte since it was signed — two completely different guarantees, built
from the same key pair, used in exactly opposite directions.

## What breaks without this

Already demonstrated three times, directly, with real output: encrypting
a message one byte over RSA-OAEP's measured 190-byte limit fails
immediately with `ValueError: Encryption failed`; verifying a genuine
signature against a document altered by even one short phrase fails;
and verifying a genuine signature against the wrong public key fails —
each a real, distinct proof of exactly the guarantee that step of this
lesson claims to provide.

## Definition of done

- [ ] A message encrypted with `public_key.encrypt` decrypts correctly
      with the matching `private_key.decrypt`, and fails with a
      different key pair's private key.
- [ ] You can state the exact measured maximum message size for direct
      RSA-OAEP encryption with a 2048-bit key, and explain where that
      number comes from.
- [ ] `hybrid_encrypt`/`hybrid_decrypt` correctly round-trips a message
      well over that direct RSA size limit.
- [ ] `verify_signature` returns `True` for a genuine document and
      signature, and `False` for either a tampered document or the
      wrong public key.
- [ ] You can explain, without looking back at this lesson, why signing
      uses the private key while encrypting (in this lesson's hybrid
      scheme) uses the public key — the opposite direction.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add asymmetric_tool.py
  git commit -m "Add RSA hybrid encryption and PSS signatures — RSA wraps only a fresh AES key (measured 190-byte direct limit made hybrid encryption necessary, not optional), signatures reuse the same key pair in the opposite direction for authenticity"
  ```

## What's next

This lesson's `wrapped_key` and `encrypted_body` are just returned as
plain Python values — nothing yet defines how they'd actually be sent
over a network. Track 3's own HTTP and WebSocket lessons, revisited with
this lesson's tools layered on top, are exactly how a real HTTPS
connection begins: a TLS handshake is, at its core, this lesson's hybrid
encryption pattern, negotiating a shared symmetric key using asymmetric
cryptography before any real application data ever moves.
