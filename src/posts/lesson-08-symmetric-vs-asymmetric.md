# Lesson 8: Symmetric vs. Asymmetric Encryption

Today we study the question Lesson 7 quietly left open: encryption needs a key, and
decryption needs the *same* key — so how do two people who have never met, communicating
over a channel anyone could be listening to, agree on a shared secret without the
eavesdropper learning it too? Our case study is two real cryptographic primitives: one
lock with one key, and one lock with two.

## What you will learn

You'll use a real symmetric cipher and hit the exact wall that motivates asymmetric
cryptography, then use a real asymmetric cipher — genuine RSA, the same algorithm
protecting real systems — to solve it. You'll come away understanding not just what
"public key" and "private key" mean, but *why* the two-key idea exists at all, because
you'll have felt the specific problem it was invented to fix.

## What you need to know first

Lesson 7 (Hashing vs. Encryption): today assumes you already know what a key and
ciphertext are, and picks up exactly where that lesson's toy XOR cipher left off — with a
real cipher, and a second kind of encryption that toy cipher couldn't represent at all.

---

## The problem

Lesson 7's XOR example needed the same key for encryption and decryption — this is called
**symmetric encryption**, and it's exactly how the vast majority of real-world encryption
actually works, once you replace the toy XOR scheme with a properly designed algorithm.
But symmetric encryption has one unavoidable requirement baked into its name: both parties
must possess the *same* secret key before any secure communication can happen.

That requirement hides a genuinely hard problem. If Alice wants to send Bob an encrypted
message, and they've never met in person, how does Alice get Bob the key? She can't send
it over the same insecure channel she's trying to protect — anyone listening in (call
them Eve, cryptography's traditional eavesdropper) would simply capture the key along with
everything else, and the encryption would provide no protection at all. This is the **key
distribution problem**, and it looks unsolvable by symmetric encryption alone, because
symmetric encryption's entire design assumes the key already safely exists on both ends.

## The lab: one lock, one key — then one lock, two keys

**Disposable hosts.** `Lockbox` (symmetric, using a real cipher this time) and `TwoKeys`
(asymmetric, using real RSA).

### Step 1 — symmetric encryption, done properly

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
print("key:", key)

cipher = Fernet(key)

message = b"meet at the north bridge, 9pm"
ciphertext = cipher.encrypt(message)
print("ciphertext:", ciphertext)

plaintext = cipher.decrypt(ciphertext)
print("decrypted:", plaintext)
```

**New constructs.** `cryptography` is a widely used, professionally audited Python
library for real encryption — unlike Lesson 7's XOR toy, everything in this lesson is
safe to use in production. `Fernet` is a symmetric encryption scheme built on **AES**
(Advanced Encryption Standard), the current industry-standard symmetric cipher, combined
with additional protections against tampering. `Fernet.generate_key()` produces a random,
cryptographically secure key — not a password you choose, but 32 bytes of genuine
randomness, because a predictable key is a broken key no matter how strong the underlying
algorithm is. `b"..."` is a **bytes literal** — Python's syntax for a sequence of raw
bytes rather than a text string; encryption libraries operate on bytes, not `str`, since
encryption doesn't inherently understand text encodings, just data.

Run it (your actual key and ciphertext will differ — they're randomly generated each run):

```
key: b'KED94NP8LgBumneL7sfNWfkDtz9W_yaZnL4BSYO6l7M='
ciphertext: b'gAAAAABqWgDS08ZjsxY7rV3BQ-0P5N4DBHbeIXmt4jADV_A4xWebszO2JdBeSkqZvlbsdYj9Ax551YxKN8aV2u0Akg6fG5KyL24ERAoyomEmk6wBbt7vvjU='
decrypted: b'meet at the north bridge, 9pm'
```

**Walkthrough.** One key does both jobs: `Fernet(key)` builds a cipher object capable of
both encrypting and decrypting, and the exact same `key` value is required on both ends.
This is the defining property of **symmetric encryption**: encryption and decryption use
the same secret.

### Step 2 — the wrong key fails loudly, not silently

```python
wrong_key = Fernet.generate_key()
wrong_cipher = Fernet(wrong_key)

try:
    wrong_cipher.decrypt(ciphertext)
except Exception as error:
    print("wrong key error:", type(error).__name__, error)
```

**New construct: `try`/`except`.** A `try` block runs code that might raise an
**exception** — Python's mechanism for signaling that something went wrong partway
through an operation. If an exception occurs inside `try`, execution jumps immediately to
the matching `except` block instead of continuing normally or crashing the whole program.
`type(error).__name__` retrieves the exception's class name as a string, for display.

Run it:

```
wrong key error: InvalidToken 
```

**Walkthrough.** Compare this directly to Lesson 7's XOR toy, where decrypting with the
wrong key silently produced different-looking garbage and the program had no way to know
anything had gone wrong. A real cipher like `Fernet` includes built-in tamper detection —
it doesn't just transform bytes, it also verifies, cryptographically, that the ciphertext
being decrypted is genuine and the key is correct, and raises `InvalidToken` rather than
returning a wrong answer disguised as a right one. This is a concrete example of why
Lesson 7 called the XOR scheme unsafe: silent wrong-key failures are a real weakness a
genuine attacker could exploit in ways a properly designed cipher closes off entirely.

**Security lens.** This connects to Lesson 2's integrity property: a cipher that fails
loudly on tampering or the wrong key isn't just being polite — it's actively protecting
integrity, refusing to hand back plausible-looking-but-wrong data that a caller might
mistake for a legitimate decrypted message.

Symmetric encryption is fast, well-understood, and used constantly — but Step 1 required
`key` to already exist identically on both the encrypting and decrypting side, and this
lab, like every symmetric example, quietly sidestepped the key distribution problem by
generating the key in the same running program that used it. Real systems don't get that
shortcut.

### Step 3 — asymmetric encryption: two keys, one pair

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

message = b"meet at the north bridge, 9pm"

ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    ),
)
print("ciphertext length:", len(ciphertext))

plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    ),
)
print("decrypted:", plaintext)
```

**New constructs.** `rsa.generate_private_key(...)` generates an **RSA** key — RSA (named
for its inventors, Rivest, Shamir, and Adleman) is one of the foundational asymmetric
algorithms, built on a mathematical problem (factoring the product of two very large prime
numbers) that's fast to construct but currently infeasible to reverse without one specific
piece of information. `key_size=2048` sets the key's length in bits — larger keys are
harder to break but slower to use; 2048 bits is a widely used current minimum.
`private_key.public_key()` derives the matching **public key** from the private key — this
is a one-directional derivation: you can always compute the public key from the private
one, never the reverse. `padding.OAEP(...)` configures **OAEP** (Optimal Asymmetric
Encryption Padding), a scheme that adds structured randomness before encrypting; RSA
without proper padding has known weaknesses, so real usage always pads — this is
configuration you'll copy correctly rather than derive from scratch, similar to how you'd
use a database driver's placeholder syntax without re-deriving SQL parsing.

Run it:

```
ciphertext length: 256
decrypted: b'meet at the north bridge, 9pm'
```

**Walkthrough.** Notice which key did which job: `public_key.encrypt(...)` and
`private_key.decrypt(...)` — **different keys for the two directions.** This is the
defining property of **asymmetric encryption** (also called **public-key cryptography**):
a mathematically linked *pair* of keys, where data encrypted with one can only be decrypted
with the other, never with the same key that encrypted it.

**CS lens.** The key insight that makes this useful: `public_key` doesn't need to be kept
secret at all. Its entire purpose is to be given out freely — to anyone, over any channel,
even one Eve is actively listening to. Knowing the public key lets you *encrypt* a message
to its owner, but gives you no way to *decrypt* anything, including messages you yourself
just encrypted. Only `private_key`, which never has to leave the owner's possession or
cross any channel at all, can reverse the operation.

**SE lens.** This directly solves the key distribution problem from the top of this
lesson. Alice generates a key pair once, publishes her public key anywhere — a website, an
email signature, a public directory — and Bob, a total stranger she's never exchanged
secrets with, can encrypt a message that only Alice can read, using nothing but that
freely published public key. No secret ever had to travel between them at all.

### Step 4 — the wrong private key, and a size limit

```python
wrong_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

try:
    wrong_private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
except Exception as error:
    print("wrong key error:", type(error).__name__, error)

big_message = b"x" * 500
try:
    public_key.encrypt(
        big_message,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
except Exception as error:
    print("too-large error:", type(error).__name__, error)
```

Run it:

```
wrong key error: ValueError Decryption failed
too-large error: ValueError Encryption failed
```

**Walkthrough.** The wrong private key fails loudly, the same as Step 2's symmetric
example — a mismatched key pair is detectable, not silently wrong. The second failure is
new: RSA at this key size **cannot encrypt a 500-byte message at all** — it raised an
error rather than producing any ciphertext. RSA's mathematics only work on data smaller
than the key itself, and even the usable portion shrinks further once padding is added.

**Security lens.** This is why asymmetric encryption is essentially never used to encrypt
the actual content of a large message directly — it's slower than symmetric encryption
(the underlying math is fundamentally more expensive to compute) and it's size-limited in
a way symmetric ciphers aren't. What it's used for instead, almost universally, is
encrypting a much shorter piece of data: a symmetric key. This combination — asymmetric
encryption solving the key-distribution problem just long enough to establish a shared
symmetric key, then symmetric encryption handling the actual, potentially large,
communication from that point on — is called **hybrid encryption**, and it's exactly what
Lesson 9's TLS handshake does every time you visit an `https://` website.

---

## Connect the pieces

Lesson 7 gave you one axis: hash (irreversible) versus encrypt (reversible with a key).
Today added a second, independent axis inside encryption itself: symmetric (one key, both
directions, fast, but requires the key to already be shared) versus asymmetric (two
mathematically linked keys, one direction each, slower and size-limited, but solves key
distribution because the encrypting key never needs to be secret at all). Lesson 9 puts
both axes to work together: TLS uses asymmetric encryption for exactly long enough to
agree on a symmetric session key over a channel Eve is actively watching, then switches to
fast symmetric encryption — Step 1's technique, not Step 3's — for the actual data of your
browsing session.

## What breaks without this

Imagine a messaging app that tried to use only symmetric encryption, the way Lesson 7
implicitly assumed, for two strangers' first conversation:

```python
shared_key = Fernet.generate_key()
# ...now how does Alice get shared_key to Bob, without sending it in the clear?
```

There is no safe answer to that comment inside symmetric encryption alone — any channel
capable of carrying the key to Bob is, by the same logic, capable of carrying it to Eve.
Every secure messaging app, every `https://` connection, every SSH login solves this
exact unsolvable-looking problem the same way you just did: asymmetric encryption first,
to establish a secret without ever transmitting the secret itself, then symmetric
encryption for everything after.

## Recognition

```
Today: Symmetric vs. Asymmetric Encryption

Also recognized in: TLS/HTTPS (Lesson 9 — hybrid encryption is the entire
mechanism behind the padlock icon in your browser), SSH key pairs (the "public
key" you paste into GitHub is exactly this — freely shareable, useless to an
attacker without the matching private key that never leaves your machine),
end-to-end encrypted messaging apps (Signal, WhatsApp), code signing (a
developer's private key signs software; anyone with the public key can verify it
came from them, without being able to forge a new signature), and cryptocurrency
wallets (a wallet address is derived from a public key; only the matching private
key can authorize spending).
```

## Definition of done

- [ ] You ran Steps 1 through 4 and reproduced the outputs shown, including both "fails
      loudly" errors and the too-large-message error
- [ ] You can state, in one sentence, the key distribution problem that symmetric
      encryption alone cannot solve
- [ ] You can explain why a public key is safe to publish anywhere, in terms of which
      operation it can and cannot perform
- [ ] You can explain, in one sentence, why real systems use asymmetric encryption to
      exchange a symmetric key rather than to encrypt all their data directly
- [ ] `git add .` and `git commit -m "Lesson 8: symmetric vs asymmetric encryption, and
      the key distribution problem"` in your `security-labs/` folder

**Next:** Lesson 9 — TLS and the Handshake, where hybrid encryption meets a second problem
this lesson didn't yet raise: even with a public key in hand, how do you know it's really
Alice's public key, and not an attacker's, substituted in transit?
