# Lesson 9: TLS and the Handshake

Today we study the question Lesson 8 ended on: even with a public key in hand, how do you
know it's really theirs? Our case study is Eve, silently sitting in the middle of a
conversation, substituting her own public key for Alice's — and the one piece of
infrastructure, trusted in advance, that makes that attack detectable instead of invisible.

## What you will learn

You'll build a working man-in-the-middle attack against Lesson 8's raw RSA exchange to see
exactly what goes wrong without today's lesson. Then you'll build a miniature certificate
authority, issue and verify a real certificate, and reject a forged one — the mechanism
that closes the gap. Finally, you'll inspect a real TLS connection from this very machine
and read its actual certificate.

## What you need to know first

Lesson 8 (Symmetric vs. Asymmetric Encryption) directly — today assumes you can already
generate a key pair and encrypt/decrypt with `cryptography`, and picks up exactly where
that lesson flagged an open problem: a public key, by itself, proves nothing about who
sent it.

---

## The problem

Lesson 8 showed Bob encrypting a message using Alice's public key, over a channel Eve
could listen to, and reasoned that this was safe because Eve can't decrypt without the
matching private key. That reasoning has a gap: **how did Bob get Alice's public key in
the first place?** If he received it over that same insecure channel, Eve could have
intercepted it in transit and substituted her *own* public key — and Bob would have no way
to tell the difference. A public key is just data; nothing about its bytes proves whose it
is.

## The lab: watch the attack happen, then close the gap

**Disposable hosts.** `Whisper` (the attack) and `Vouch` (the fix — a miniature
certificate authority).

### Step 1 — the man-in-the-middle attack on raw key exchange

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

def make_keypair():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private_key, private_key.public_key()

def encrypt_with(public_key, message):
    return public_key.encrypt(
        message,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )

def decrypt_with(private_key, ciphertext):
    return private_key.decrypt(
        ciphertext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )

alice_private, alice_public = make_keypair()
eve_private, eve_public = make_keypair()

# Bob believes this is Alice's public key. It is actually Eve's -- she intercepted
# Alice's key in transit and substituted her own.
bob_received_key = eve_public

message = b"transfer $500 to account 1234"
ciphertext_to_alice = encrypt_with(bob_received_key, message)

# Eve intercepts the ciphertext. Because Bob unknowingly encrypted with EVE's public
# key, Eve -- and only Eve -- can decrypt it.
intercepted = decrypt_with(eve_private, ciphertext_to_alice)
print("Eve reads Bob's message:", intercepted)

# Eve re-encrypts with Alice's REAL public key and forwards it, so the message still
# arrives -- Alice has no way to tell it was read along the way.
forwarded = encrypt_with(alice_public, intercepted)
alice_reads = decrypt_with(alice_private, forwarded)
print("Alice receives, unaware of interception:", alice_reads)
```

Run it:

```
Eve reads Bob's message: b'transfer $500 to account 1234'
Alice receives, unaware of interception: b'transfer $500 to account 1234'
```

**Walkthrough.** Nothing here breaks any promise Lesson 8 made — RSA encryption did
exactly what it was designed to do at every step. Bob correctly encrypted a message so
that only the holder of the matching private key could read it; the flaw is that
`bob_received_key` was never actually Alice's key. Eve reads the plaintext, then
re-encrypts it with Alice's genuine public key and forwards it along, so the message still
arrives correctly at its final destination and neither Alice nor Bob observes anything
unusual. This is a **man-in-the-middle attack (MITM)**: an attacker positioned between two
parties who each believe they're talking directly to the other.

**CS lens.** Every cryptographic guarantee in this course so far has been conditional on
one unstated assumption: *you have the correct key to begin with.* Lesson 7's hash
comparison assumed you were comparing against a hash you already trusted. Lesson 8's
encryption assumed the public key genuinely belonged to its claimed owner. Today is the
first lesson to attack that assumption directly, rather than the cryptography itself —
and it works perfectly, because the cryptography was never the weak point.

**Security lens.** This is why the CIA triad's confidentiality property depends on more
than encryption alone — it depends on **key authenticity**: proof that a given key
actually belongs to the party you intend to communicate with. Encryption without key
authenticity protects you from a passive eavesdropper who can only read traffic; it does
nothing against an active attacker willing to insert themselves into the exchange itself.

### Step 2 — a certificate: a signature over "this key belongs to this identity"

```python
import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature

def build_certificate(subject_common_name, issuer_common_name, subject_public_key, signing_private_key):
    subject_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, subject_common_name)])
    issuer_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, issuer_common_name)])
    now = datetime.datetime.now(datetime.timezone.utc)
    return (
        x509.CertificateBuilder()
        .subject_name(subject_name)
        .issuer_name(issuer_name)
        .public_key(subject_public_key)
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + datetime.timedelta(days=365))
        .sign(signing_private_key, hashes.SHA256())
    )

# A Certificate Authority (CA): an entity every party has agreed, in advance, to trust.
ca_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
ca_certificate = build_certificate("Trusted Root CA", "Trusted Root CA", ca_private_key.public_key(), ca_private_key)

# Alice proves her identity to the CA (out of band, however that CA requires), then the
# CA signs a certificate binding Alice's name to Alice's public key.
alice_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
alice_certificate = build_certificate("alice.example", "Trusted Root CA", alice_private_key.public_key(), ca_private_key)

print("Alice certificate subject:", alice_certificate.subject.rfc4514_string())
print("Alice certificate issuer:", alice_certificate.issuer.rfc4514_string())
```

**New constructs.** `x509` (from the `cryptography` library) implements **X.509**, the
standard format real-world certificates use. A **Certificate Authority (CA)** is an
organization whose public key is distributed in advance, out-of-band, to everyone who
needs to trust it — in real life, this happens by CA certificates being pre-installed in
your operating system and browser when you install them, not transmitted over the same
connection they're later used to verify. `CertificateBuilder()` assembles a certificate's
fields step by step: `subject_name` (whose identity and key this certificate vouches for),
`issuer_name` (who is vouching), `public_key` (the key being vouched for), and
`.sign(signing_private_key, hashes.SHA256())`, which computes a cryptographic signature —
conceptually, a hash (Lesson 7) of the certificate's contents, encrypted with the *signer's*
private key, so that anyone holding the signer's public key can verify the signature came
from them and that the certificate's contents haven't been altered since.

Run it:

```
Alice certificate subject: CN=alice.example
Alice certificate issuer: CN=Trusted Root CA
```

**Walkthrough.** `alice_certificate` is not signed by Alice — it's signed by the CA's
private key, even though the certificate contains *Alice's* public key. This is the whole
mechanism in one sentence: **a certificate is the CA saying, "I have verified that this
specific public key belongs to this specific identity, and I'm staking my own reputation
and signature on that claim."** Anyone who already trusts the CA can now trust Alice's key,
without ever having met Alice, by checking the CA's signature instead of blindly accepting
the key on its own.

### Step 3 — verifying a genuine certificate, and rejecting a forged one

```python
def certificate_signature_is_valid(certificate, signer_public_key):
    try:
        signer_public_key.verify(
            certificate.signature,
            certificate.tbs_certificate_bytes,
            padding.PKCS1v15(),
            certificate.signature_hash_algorithm,
        )
        return True
    except InvalidSignature:
        return False

print("Alice's certificate is genuine:", certificate_signature_is_valid(alice_certificate, ca_certificate.public_key()))

# Eve forges a certificate claiming to be alice.example, but signs it with HER OWN
# private key, since she doesn't have the real CA's private key.
eve_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
forged_certificate = build_certificate("alice.example", "Trusted Root CA", eve_private_key.public_key(), eve_private_key)

print("Forged certificate is genuine:", certificate_signature_is_valid(forged_certificate, ca_certificate.public_key()))
```

**New construct: `verify()`.** `signer_public_key.verify(signature, data, padding, hash_algorithm)`
recomputes what the signature *should* be, using the signer's public key, and compares it
against the actual signature provided — raising `InvalidSignature` if they don't match.
This is the inverse operation of signing: signing uses a private key to produce proof of
authorship; verifying uses the matching public key to check that proof, and, exactly like
encryption and decryption in Lesson 8, only the correct key pair produces a match.

Run it:

```
Alice's certificate is genuine: True
Forged certificate is genuine: False
```

**Walkthrough.** Alice's certificate passes because it was genuinely signed with the real
CA's private key — `ca_certificate.public_key()` successfully verifies it. Eve's forged
certificate *claims* the same issuer name, `"Trusted Root CA"` — the `issuer_name` field is
just a text label, and nothing stops Eve from writing whatever she wants there — but she
doesn't possess the real CA's private key, so she signed it with her own instead. The
verification check catches this immediately: the signature was produced by the wrong key,
and `verify()` detects that mismatch and rejects it.

**Security lens.** This is why a certificate's issuer name is never trusted on its own —
only a *valid signature* from a CA whose public key you already trust, independent of
this connection, makes a certificate meaningful. This is the exact fix for Step 1's
attack: if Bob had required Alice's public key to arrive *inside a certificate* signed by
a CA he already trusted, Eve's substituted key would have had no valid certificate to
accompany it, and Bob's connection would have refused to proceed. This chain — you trust
the CA in advance, the CA vouches for Alice, therefore you trust Alice's key — is called
the **chain of trust**, and it's the entire reason certificate authorities exist.

### Step 4 — a real TLS handshake, inspected from this machine

```python
import ssl
import socket

hostname = "pypi.org"
context = ssl.create_default_context()

with socket.create_connection((hostname, 443)) as raw_socket:
    with context.wrap_socket(raw_socket, server_hostname=hostname) as tls_socket:
        print("TLS version negotiated:", tls_socket.version())
        print("Cipher suite negotiated:", tls_socket.cipher())
        certificate = tls_socket.getpeercert()
        print("Certificate subject:", certificate["subject"])
        print("Certificate issuer:", certificate["issuer"])
```

**New constructs.** `ssl.create_default_context()` builds a TLS context pre-loaded with
your system's trusted CA certificates — this is the "out-of-band, pre-installed trust"
from Step 2, made real. `socket.create_connection((hostname, 443))` opens a raw TCP
connection to port 443, the standard port for HTTPS (Lesson 2's Recognition list
introduced ports; 443 is HTTPS's, the way 80 is plain HTTP's). `context.wrap_socket(...)`
performs the actual **TLS handshake** over that raw connection — negotiating a protocol
version, receiving the server's certificate, verifying its signature against a trusted CA
exactly as you just did by hand in Step 3, and establishing a symmetric session key for
everything that follows, exactly the hybrid-encryption pattern Lesson 8 predicted.

Run it (from a machine with normal internet access, output will vary by network path):

```
TLS version negotiated: TLSv1.3
Cipher suite negotiated: ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
Certificate subject: ((('commonName', 'pypi.org'),),)
Certificate issuer: ((('organizationName', 'Anthropic'),), (('commonName', 'Egress Gateway SDS Issuing CA (production)'),))
```

**Walkthrough — and an honest, useful surprise.** `TLS_AES_256_GCM_SHA384` names the
negotiated cipher suite: AES-256 for the symmetric encryption doing the heavy lifting
(Lesson 8's hybrid-encryption prediction, confirmed), SHA384 involved in integrity
verification. But look closely at the **issuer**: not a public CA you'd typically expect
for `pypi.org`, but `Anthropic Egress Gateway SDS Issuing CA`. This is exactly what this
lesson has been teaching, showing up unprompted: this sandbox's network traffic is
routed through a controlled egress proxy that performs its *own* TLS termination — a
legitimate, disclosed, corporate-network equivalent of the man-in-the-middle mechanism
from Step 1, made benign only because this specific proxy's CA certificate was
deliberately, knowingly installed as trusted in this environment ahead of time, the exact
"out-of-band trust" Step 2 described. **This is not a flaw in the lesson — it's a live,
uncontrived example of why the chain of trust matters**: this connection is only
trustworthy because a specific CA was deliberately trusted in advance; if you ran this on
your own machine outside a proxied environment, `getpeercert()`'s issuer would show a
public CA like Let's Encrypt or DigiCert instead, and both cases are `ssl` doing its job
correctly — verifying against whatever CAs the system was told to trust.

---

## Connect the pieces

Step 1 reproduced Lesson 8's exact key-distribution problem, but with an attacker
substituting a key rather than merely reading traffic — the specific failure mode
asymmetric encryption alone can't prevent. Steps 2 and 3 fixed it with certificates, which
are Lesson 7's hashing (a signature is fundamentally a hash, encrypted with a private key)
and Lesson 8's asymmetric encryption (verification uses the CA's public key) combined into
a new primitive: proof of identity, not just proof of possession of a key. Step 4 showed
this isn't theoretical — it's the mechanism securing the `https://` connection you're
using right now to read almost anything on the internet.

## What breaks without this

Public WiFi at a coffee shop is a realistic setting for Step 1's attack: an attacker on
the same network can position themselves to intercept traffic between your laptop and the
router. Without certificate verification, they could substitute their own key for your
bank's, and you would have no way to detect it — your connection would appear to work
normally the entire time, exactly like Alice in Step 1, who never learned Eve had read her
message. Certificate verification is precisely what makes your browser show a warning
page instead of silently connecting when this happens: it's not the encryption failing,
it's the identity check catching an attacker the encryption alone never could.

## Recognition

```
Today: TLS and the Chain of Trust

Also recognized in: SSH host key verification ("the authenticity of host 'x' can't
be established" is your terminal asking you to manually do what a CA normally
automates), code signing certificates (the same mechanism vouching for "this
software update really came from this vendor"), corporate and school network
proxies that intercept HTTPS by installing their own trusted root CA on managed
devices (exactly what Step 4 just showed you, live), certificate pinning (an app
refusing to trust *any* CA except one specific expected certificate, closing even
the corporate-proxy loophole), and DNSSEC, which solves the same
trust-in-advance problem for domain name lookups instead of public keys.
```

## Definition of done

- [ ] You ran Steps 1 through 4 and reproduced the outputs shown, including Eve
      successfully reading Bob's message in Step 1 and the forged certificate being
      rejected in Step 3
- [ ] You can explain, in one sentence, what specifically a certificate proves that a
      bare public key does not
- [ ] You can explain why the CA's public key has to be trusted *in advance*, out of band
      — and why receiving it over the same connection it's meant to secure would defeat
      the purpose
- [ ] You looked at your own Step 4 output (or the one shown, if run in a similarly
      proxied environment) and can say whether the certificate issuer matches what you
      expected, and why
- [ ] `git add .` and `git commit -m "Lesson 9: TLS, certificates, and the chain of
      trust"` in your `security-labs/` folder

**Next:** Lesson 10 — Password Storage, where Lesson 7's hashing meets its missing piece:
salting — the technique that defeats rainbow tables and makes two identical passwords
produce two completely different stored hashes.
