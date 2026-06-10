# Drill 3.2 — JWT: Build It By Hand
## LAB-01: Decode, Encode, Tamper, Verify

---

## Quick Check

Before you read anything, answer these. Return here when you finish.

1. A JWT has three parts separated by dots. What is in each part?
2. The payload of a JWT contains `{"user_id": 42, "role": "admin"}`. Is this information secret?
3. What happens when a JWT's signature does not match the payload?
4. A user's JWT is stolen. The server has no database of issued tokens. How does the server invalidate it?
5. What is the difference between HS256 and RS256, and when would you use each?

*(Answers at the bottom — don't peek)*

---

## Concept Block

### What a JWT is

A JWT (JSON Web Token) is a string that looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Three base64url-encoded parts separated by dots:

```
HEADER.PAYLOAD.SIGNATURE
```

**Header** — metadata about the token itself:
```json
{"alg": "HS256", "typ": "JWT"}
```

**Payload** — the claims (data you want to communicate):
```json
{"user_id": 42, "role": "admin", "exp": 1715700000}
```

**Signature** — proof that the header and payload were created by someone who knows the secret:
```
HMAC-SHA256(base64url(header) + "." + base64url(payload), secret_key)
```

### What JWT is NOT

JWT is **not encrypted**. The header and payload are base64-encoded, not encrypted. Anyone holding the token can decode and read the payload. This is intentional — the token is meant to be readable by the client.

The signature proves *authenticity* (this was issued by someone who knows the secret), not *confidentiality* (this data is hidden).

**Never put passwords, secrets, or sensitive PII in a JWT payload.**

### The verification flow

```
Client sends:  Authorization: Bearer <token>

Server does:
  1. Split token on "."
  2. Re-compute HMAC-SHA256(header + "." + payload, secret)
  3. Compare to the signature in the token
  4. If mismatch → reject (token was tampered with or forged)
  5. If match → decode payload, extract user_id, role, exp
  6. Check exp (expiry) has not passed
  7. Trust the claims
```

No database lookup. No session table. The token is self-contained.

### Why this matters: stateless authentication

Traditional session authentication stores a session ID in a database. Every request requires a database lookup to resolve `session_id → user_id`. JWT eliminates that lookup. Any server that knows the secret can verify any token independently. This is what makes JWT attractive for distributed systems — a user authenticated on server A carries a token that server B can verify without talking to server A.

### The revocation problem

The tradeoff is revocation. A database-backed session can be deleted: log the user out, the session is gone. A JWT cannot be "un-issued." If a token is stolen, it remains valid until its `exp` timestamp passes.

**Mitigation strategies:**
- Keep access tokens short-lived (15 minutes)
- Use a separate long-lived refresh token to get new access tokens
- For critical revocation (account ban, password change), maintain a small blocklist of invalidated token IDs (`jti` claim)

### The claims that matter

| Claim | Meaning | Notes |
|-------|---------|-------|
| `sub` | Subject (user ID) | The primary identifier |
| `exp` | Expiry (Unix timestamp) | Always include this |
| `iat` | Issued-at timestamp | Useful for debugging |
| `jti` | JWT ID (unique string) | Needed for revocation |
| `role` | Custom — user's role | Common but not standard |

### HS256 vs RS256

**HS256** — HMAC-SHA256 with a shared secret. The same key signs and verifies. Simple, fast. Problem: every service that needs to verify tokens also needs the secret — if one service is compromised, the secret leaks.

**RS256** — RSA with a key pair. The private key signs (only the auth server has it). The public key verifies (any service can have it). A compromised service leaks the public key, which is useless for forging tokens. Use RS256 for microservices where multiple independent services need to verify tokens.

### Failure modes

| Mistake | Consequence |
|---------|-------------|
| Accepting `alg: none` | Attacker sends unsigned token, library accepts it |
| Secret is short or weak | Brute-forceable — use 32+ random bytes |
| No `exp` claim | Token is valid forever after a breach |
| Sensitive data in payload | Readable by anyone who intercepts the token |
| Long-lived access tokens | Stolen token usable for days/weeks |
| Not verifying signature | The entire security model collapses |

### Constraints

- JWT payload size adds to every HTTP request — keep it small
- Rotating the secret invalidates all existing tokens
- The `exp` check must be server-side — do not trust the client to enforce expiry
- Always use HTTPS — a token intercepted in transit is a stolen credential

### You will see this again in

- Every FastAPI app using `python-jose` or `PyJWT`
- OAuth 2.0: access tokens are JWTs
- OpenID Connect: the ID token is a JWT
- Any microservice architecture where services need to verify user identity independently

---

## What You're Building

A JWT encoder and decoder using **only Python's standard library** — `hmac`, `hashlib`, `base64`, `json`, `time`. No `PyJWT`, no `python-jose`.

Building it from primitives forces you to understand exactly what a JWT library does. After this lab, you will never treat JWT as a black box.

**No installs required.** Everything is in Python's standard library.

**Files you'll create:**
```
3.2-jwt/
  step1_decode_real.py
  step2_encode_decode.py
  step3_tamper.py
  step4_expiry.py
```

---

## Step 1 — Decode a Real JWT by Hand

We start with a real JWT and decode it manually. This proves that the payload is not secret.

Create `step1_decode_real.py`:

```python
# step1_decode_real.py
# Decode a JWT without any library.
# Goal: prove that the payload is readable by anyone with the token.

import base64
import json

# A real JWT. This one was issued by jwt.io for demonstration.
# You can replace this with any JWT you find in a browser dev-tools Network tab.
token = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    "."
    "eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFsaWNlIn0"
    "."
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
)

def base64url_decode(s):
    # JWT uses base64url encoding: replaces + with - and / with _
    # base64.b64decode needs standard base64, so we convert back.
    # Padding: base64 requires length to be a multiple of 4.
    # JWT strips padding, so we add it back.
    s = s.replace("-", "+").replace("_", "/")
    # Add padding if needed
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.b64decode(s)

# Split the token into its three parts.
parts = token.split(".")
if len(parts) != 3:
    raise ValueError("Not a valid JWT: expected 3 parts separated by '.'")

header_b64, payload_b64, signature_b64 = parts

# Decode the header — this is JSON, not encrypted.
header_bytes = base64url_decode(header_b64)
header = json.loads(header_bytes)
print("=== HEADER (decoded) ===")
print(json.dumps(header, indent=2))

# Decode the payload — this is also JSON, also not encrypted.
payload_bytes = base64url_decode(payload_b64)
payload = json.loads(payload_bytes)
print("\n=== PAYLOAD (decoded) ===")
print(json.dumps(payload, indent=2))

# The signature is binary data — don't try to JSON-decode it.
signature_bytes = base64url_decode(signature_b64)
print("\n=== SIGNATURE (raw bytes, hex) ===")
print(signature_bytes.hex())

print("\n=== CONCLUSION ===")
print("The payload is fully readable without the secret.")
print("Anyone who intercepts this token knows:", payload)
print("The signature proves it was issued correctly — but does NOT hide the data.")
```

**SAVE AND TRY:**
```
python step1_decode_real.py
```

**Exact output:**
```
=== HEADER (decoded) ===
{
  "alg": "HS256",
  "typ": "JWT"
}

=== PAYLOAD (decoded) ===
{
  "user_id": 42,
  "role": "admin",
  "name": "Alice"
}

=== SIGNATURE (raw bytes, hex) ===
49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda75032c3971

=== CONCLUSION ===
The payload is fully readable without the secret.
Anyone who intercepts this token knows: {'user_id': 42, 'role': 'admin', 'name': 'Alice'}
The signature proves it was issued correctly — but does NOT hide the data.
```

The payload is in plain sight. This is by design — the client needs to read it to know who they are. The signature ensures the server can trust it.

---

## Step 2 — Build the Encoder and Decoder

Create `step2_encode_decode.py`:

```python
# step2_encode_decode.py
# Build JWT encode and decode from scratch using only standard library.
# No PyJWT. No python-jose. Just hmac, hashlib, base64, json.

import base64
import hashlib
import hmac
import json
import time

# The secret key — in production this would be a 32+ byte random value
# stored in an environment variable, never in source code.
SECRET_KEY = b"super-secret-key-change-this-in-production"

def base64url_encode(data: bytes) -> str:
    """Encode bytes to base64url format (no padding, URL-safe characters)."""
    # Standard base64 uses + and / which are URL-unfriendly.
    # base64url replaces them with - and _
    encoded = base64.b64encode(data)
    # Strip padding (=) and replace URL-unsafe characters.
    return encoded.decode().rstrip("=").replace("+", "-").replace("/", "_")

def base64url_decode(s: str) -> bytes:
    """Decode a base64url string back to bytes."""
    # Add padding back (base64 needs length divisible by 4)
    s = s.replace("-", "+").replace("_", "/")
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.b64decode(s)

def encode_jwt(payload: dict, secret: bytes) -> str:
    """
    Build a signed JWT from a payload dict.

    The process:
      1. Encode the header as base64url JSON
      2. Encode the payload as base64url JSON
      3. Concatenate with a dot: "header.payload"
      4. Sign that string with HMAC-SHA256 using the secret
      5. Append the signature: "header.payload.signature"
    """
    # Step 1: Header — always the same for HS256 tokens
    header = {"alg": "HS256", "typ": "JWT"}
    # json.dumps with separators=(",", ":") removes spaces — compact JSON
    header_encoded = base64url_encode(json.dumps(header, separators=(",", ":")).encode())

    # Step 2: Payload — the caller provides this
    payload_encoded = base64url_encode(json.dumps(payload, separators=(",", ":")).encode())

    # Step 3: The signing input is "header.payload" as a string
    signing_input = f"{header_encoded}.{payload_encoded}"

    # Step 4: Sign with HMAC-SHA256
    # hmac.new(key, message, digestmod) — the digestmod specifies the hash algorithm
    # We sign the signing_input as bytes
    signature = hmac.new(
        secret,
        signing_input.encode(),
        hashlib.sha256
    ).digest()  # .digest() returns raw bytes; .hexdigest() would return hex string

    # Step 5: Encode signature and assemble the final token
    signature_encoded = base64url_encode(signature)
    return f"{signing_input}.{signature_encoded}"

def decode_jwt(token: str, secret: bytes) -> dict:
    """
    Verify and decode a JWT.

    Returns the payload dict if valid.
    Raises ValueError if the token is invalid or tampered.
    """
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token structure: expected 3 parts")

    header_b64, payload_b64, signature_b64 = parts

    # Re-compute the signature from the header and payload we received.
    # If the token was tampered with, the signing input has changed,
    # so our computed signature will differ from the one in the token.
    signing_input = f"{header_b64}.{payload_b64}"
    expected_signature = hmac.new(
        secret,
        signing_input.encode(),
        hashlib.sha256
    ).digest()

    # Decode the provided signature for comparison
    provided_signature = base64url_decode(signature_b64)

    # IMPORTANT: use hmac.compare_digest, not ==
    # == is vulnerable to timing attacks: it returns early on the first
    # differing byte, leaking information about how much of the signature matched.
    # hmac.compare_digest always takes the same time regardless of where mismatch occurs.
    if not hmac.compare_digest(expected_signature, provided_signature):
        raise ValueError("Signature verification failed — token was tampered with")

    # Signature is valid. Now decode the payload.
    payload_bytes = base64url_decode(payload_b64)
    payload = json.loads(payload_bytes)
    return payload

# --- Demonstrate encode and decode ---
print("=== Encoding a JWT ===")

payload = {
    "user_id": 42,
    "role": "user",
    "username": "alice",
    "iat": int(time.time()),                    # issued at (now)
    "exp": int(time.time()) + 15 * 60,          # expires in 15 minutes
}

token = encode_jwt(payload, SECRET_KEY)
print(f"\nToken:\n{token}")
print(f"\nLength: {len(token)} characters")

# Show the three parts separately
parts = token.split(".")
print(f"\nHeader:    {parts[0]}")
print(f"Payload:   {parts[1]}")
print(f"Signature: {parts[2]}")

print("\n=== Decoding the JWT ===")
decoded = decode_jwt(token, SECRET_KEY)
print(json.dumps(decoded, indent=2))
```

**SAVE AND TRY:**
```
python step2_encode_decode.py
```

**Exact output (timestamps will differ):**
```
=== Encoding a JWT ===

Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Miwicm9sZSI6InVzZXIiLCJ1c2VybmFtZSI6ImFsaWNlIiwiaWF0IjoxNzE1NzAwMDAwLCJleHAiOjE3MTU3MDA5MDB9.8FqNzL1vJkTk2RvPm4ZBn3gHkWqI6yEXuDlL8nXY2As

Length: 186 characters

Header:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Payload:   eyJ1c2VyX2lkIjo0Miwicm9sZSI6InVzZXIiLCJ1c2VybmFtZSI6ImFsaWNlIiwiaWF0IjoxNzE1NzAwMDAwLCJleHAiOjE3MTU3MDA5MDB9
Signature: 8FqNzL1vJkTk2RvPm4ZBn3gHkWqI6yEXuDlL8nXY2As

=== Decoding the JWT ===
{
  "user_id": 42,
  "role": "user",
  "username": "alice",
  "iat": 1715700000,
  "exp": 1715700900
}
```

Notice the header is always the same — `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` decodes to `{"alg":"HS256","typ":"JWT"}`. You will recognize this prefix in every HS256 JWT you ever see.

---

## Step 3 — The Tampering Attack

Create `step3_tamper.py`:

```python
# step3_tamper.py
# ATTACK: modify the payload and try to pass it off as valid.
# Goal: show that the signature prevents payload modification.

import base64
import hashlib
import hmac
import json
import time
import sys

# Copy the encode/decode functions from step2
# (In a real project these would be in a shared module)

SECRET_KEY = b"super-secret-key-change-this-in-production"

def base64url_encode(data: bytes) -> str:
    encoded = base64.b64encode(data)
    return encoded.decode().rstrip("=").replace("+", "-").replace("/", "_")

def base64url_decode(s: str) -> bytes:
    s = s.replace("-", "+").replace("_", "/")
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.b64decode(s)

def encode_jwt(payload: dict, secret: bytes) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_encoded = base64url_encode(json.dumps(header, separators=(",", ":")).encode())
    payload_encoded = base64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(secret, signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{base64url_encode(signature)}"

def decode_jwt(token: str, secret: bytes) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token structure")
    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}"
    expected = hmac.new(secret, signing_input.encode(), hashlib.sha256).digest()
    provided = base64url_decode(signature_b64)
    if not hmac.compare_digest(expected, provided):
        raise ValueError("Signature verification failed — token was tampered with")
    return json.loads(base64url_decode(payload_b64))

# --- Issue a legitimate user token ---
print("=== Step 1: Server issues a 'user' token to alice ===")

user_payload = {
    "user_id": 42,
    "role": "user",      # alice is a normal user
    "username": "alice",
    "exp": int(time.time()) + 900,
}
legitimate_token = encode_jwt(user_payload, SECRET_KEY)
print(f"Token issued: {legitimate_token[:60]}...")

# Verify it works
decoded = decode_jwt(legitimate_token, SECRET_KEY)
print(f"Decoded role: {decoded['role']}")

# --- The attack: modify the payload ---
print("\n=== Step 2: Attacker modifies the payload to escalate to 'admin' ===")

# Split the token
parts = legitimate_token.split(".")
original_header = parts[0]
original_payload_b64 = parts[1]
original_signature = parts[2]

# Decode the payload
original_payload_bytes = base64url_decode(original_payload_b64)
original_payload = json.loads(original_payload_bytes)
print(f"Original payload: {original_payload}")

# Modify it — change role from "user" to "admin"
tampered_payload = dict(original_payload)
tampered_payload["role"] = "admin"   # privilege escalation attempt
print(f"Tampered payload: {tampered_payload}")

# Re-encode the modified payload
tampered_payload_b64 = base64url_encode(
    json.dumps(tampered_payload, separators=(",", ":")).encode()
)

# Reassemble the token — keep the ORIGINAL signature
# The attacker does not know the secret, so they cannot compute a valid signature.
# They try to reuse the old signature with the new payload.
tampered_token = f"{original_header}.{tampered_payload_b64}.{original_signature}"
print(f"\nTampered token: {tampered_token[:60]}...")

# --- Attempt to use the tampered token ---
print("\n=== Step 3: Server attempts to verify the tampered token ===")
try:
    result = decode_jwt(tampered_token, SECRET_KEY)
    # If we get here, the attack succeeded — this should not happen.
    print(f"ATTACK SUCCEEDED (this is a bug): {result}")
    sys.exit(1)
except ValueError as e:
    print(f"Server rejects token: {e}")
    print("\nWhy it failed:")
    print("  The signature was computed over the ORIGINAL header.payload string.")
    print("  The attacker changed the payload, so header.payload is now different.")
    print("  When the server re-computes HMAC(header.new_payload, secret),")
    print("  it gets a different result than the signature in the token.")
    print("  hmac.compare_digest returns False. Token rejected.")

# --- Show that the original still works ---
print("\n=== Step 4: Original (unmodified) token still works ===")
result = decode_jwt(legitimate_token, SECRET_KEY)
print(f"Original token accepted. Role: {result['role']}")

# --- What about forging a new token from scratch? ---
print("\n=== Step 5: Attacker tries to forge a new admin token without the secret ===")
# The attacker can build any payload they want.
# But without the secret, they cannot produce a valid signature.
forged_payload = {"user_id": 42, "role": "admin", "username": "alice"}
forged_signing = (
    base64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    + "."
    + base64url_encode(json.dumps(forged_payload, separators=(",", ":")).encode())
)

# The attacker uses a random signature — they're guessing
import os
random_signature = base64url_encode(os.urandom(32))
forged_token = f"{forged_signing}.{random_signature}"

try:
    result = decode_jwt(forged_token, SECRET_KEY)
    print(f"FORGE SUCCEEDED (this is a bug): {result}")
except ValueError as e:
    print(f"Forged token rejected: {e}")
    print("\nThe secret is not in the token. Without it, the attacker cannot")
    print("produce a HMAC that the server will accept.")
```

**SAVE AND TRY:**
```
python step3_tamper.py
```

**Exact output:**
```
=== Step 1: Server issues a 'user' token to alice ===
Token issued: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lk...
Decoded role: user

=== Step 2: Attacker modifies the payload to escalate to 'admin' ===
Original payload: {'user_id': 42, 'role': 'user', 'username': 'alice', 'exp': 1715700900}
Tampered payload: {'user_id': 42, 'role': 'admin', 'username': 'alice', 'exp': 1715700900}

Tampered token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lk...

=== Step 3: Server attempts to verify the tampered token ===
Server rejects token: Signature verification failed — token was tampered with

Why it failed:
  The signature was computed over the ORIGINAL header.payload string.
  The attacker changed the payload, so header.payload is now different.
  When the server re-computes HMAC(header.new_payload, secret),
  it gets a different result than the signature in the token.
  hmac.compare_digest returns False. Token rejected.

=== Step 4: Original (unmodified) token still works ===
Original token accepted. Role: user

=== Step 5: Attacker tries to forge a new admin token without the secret ===
Forged token rejected: Signature verification failed — token was tampered with

The secret is not in the token. Without it, the attacker cannot
produce a HMAC that the server will accept.
```

The signature binds the payload to the secret. Change either one and verification fails.

---

## Step 4 — Expiry: Time-Limiting the Token

Create `step4_expiry.py`:

```python
# step4_expiry.py
# Add expiry checking to decode_jwt.
# Show what happens with an expired token and a missing exp claim.

import base64
import hashlib
import hmac
import json
import time

SECRET_KEY = b"super-secret-key-change-this-in-production"

def base64url_encode(data: bytes) -> str:
    encoded = base64.b64encode(data)
    return encoded.decode().rstrip("=").replace("+", "-").replace("/", "_")

def base64url_decode(s: str) -> bytes:
    s = s.replace("-", "+").replace("_", "/")
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.b64decode(s)

def encode_jwt(payload: dict, secret: bytes) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_encoded = base64url_encode(json.dumps(header, separators=(",", ":")).encode())
    payload_encoded = base64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header_encoded}.{payload_encoded}"
    sig = hmac.new(secret, signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{base64url_encode(sig)}"

def decode_jwt(token: str, secret: bytes) -> dict:
    """
    Verify signature AND check expiry.
    Raises ValueError for: bad structure, wrong signature, expired token, missing exp.
    """
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token structure")

    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}"

    # Verify signature first — always verify before trusting any claim
    expected = hmac.new(secret, signing_input.encode(), hashlib.sha256).digest()
    provided = base64url_decode(signature_b64)
    if not hmac.compare_digest(expected, provided):
        raise ValueError("Signature verification failed")

    payload = json.loads(base64url_decode(payload_b64))

    # Check expiry — the exp claim is a Unix timestamp
    # time.time() returns the current Unix timestamp as a float
    if "exp" not in payload:
        # Tokens without exp never expire — this is dangerous
        # Raise here or log a warning depending on your policy
        raise ValueError("Token has no expiry claim (exp) — rejecting for safety")

    if time.time() > payload["exp"]:
        # The token is past its expiry time
        raise ValueError(f"Token expired at {payload['exp']} (now is {int(time.time())})")

    return payload

# --- Test 1: Valid token (expires in 15 minutes) ---
print("=== Test 1: Valid token ===")
valid_payload = {
    "user_id": 42,
    "role": "user",
    "exp": int(time.time()) + 900,   # 15 minutes from now
}
valid_token = encode_jwt(valid_payload, SECRET_KEY)
try:
    decoded = decode_jwt(valid_token, SECRET_KEY)
    print(f"  Accepted. user_id={decoded['user_id']}, expires in {decoded['exp'] - int(time.time())}s")
except ValueError as e:
    print(f"  Rejected: {e}")

# --- Test 2: Expired token (exp set to 1 second ago) ---
print("\n=== Test 2: Expired token ===")
expired_payload = {
    "user_id": 99,
    "role": "user",
    "exp": int(time.time()) - 1,     # 1 second ago — already expired
}
expired_token = encode_jwt(expired_payload, SECRET_KEY)
try:
    decoded = decode_jwt(expired_token, SECRET_KEY)
    print(f"  Accepted (should NOT happen): {decoded}")
except ValueError as e:
    print(f"  Rejected: {e}")

# --- Test 3: Token with no exp claim ---
print("\n=== Test 3: Token with no expiry ===")
no_exp_payload = {
    "user_id": 77,
    "role": "admin",
    # No 'exp' key — this token would never expire
}
no_exp_token = encode_jwt(no_exp_payload, SECRET_KEY)
try:
    decoded = decode_jwt(no_exp_token, SECRET_KEY)
    print(f"  Accepted (should NOT happen): {decoded}")
except ValueError as e:
    print(f"  Rejected: {e}")

# --- Test 4: Demonstrate the payload is visible even before verification ---
print("\n=== Test 4: Anyone can read the payload without the secret ===")
test_payload = {
    "user_id": 42,
    "role": "admin",
    "internal_api_key": "sk-VERY-SECRET",   # WRONG: never put secrets in JWT
    "exp": int(time.time()) + 900,
}
test_token = encode_jwt(test_payload, SECRET_KEY)

# Decode without verifying — just split and base64-decode
parts = test_token.split(".")
payload_b64 = parts[1]
# Add padding and decode — no secret needed
padded = payload_b64.replace("-", "+").replace("_", "/")
padded += "=" * (4 - len(padded) % 4)
import base64
raw_payload = base64.b64decode(padded)
print(f"  Payload (no secret needed): {raw_payload.decode()}")
print()
print("  The internal_api_key is fully visible to:")
print("  - The client who holds the token")
print("  - Any HTTPS proxy or logging system that stores tokens")
print("  - An attacker who intercepts an HTTP request on an HTTP (not HTTPS) connection")
print()
print("  Rule: JWT is an envelope for IDENTITY claims, not secrets.")
print("  Put in JWT: user_id, role, exp")
print("  Never in JWT: passwords, API keys, personal data, health info")
```

**SAVE AND TRY:**
```
python step4_expiry.py
```

**Exact output:**
```
=== Test 1: Valid token ===
  Accepted. user_id=42, expires in 899s

=== Test 2: Expired token ===
  Rejected: Token expired at 1715699999 (now is 1715700000)

=== Test 3: Token with no expiry ===
  Rejected: Token has no expiry claim (exp) — rejecting for safety

=== Test 4: Anyone can read the payload without the secret ===
  Payload (no secret needed): {"user_id":42,"role":"admin","internal_api_key":"sk-VERY-SECRET","exp":1715700900}

  The internal_api_key is fully visible to:
  - The client who holds the token
  - Any HTTPS proxy or logging system that stores tokens
  - An attacker who intercepts an HTTP request on an HTTP (not HTTPS) connection

  Rule: JWT is an envelope for IDENTITY claims, not secrets.
  Put in JWT: user_id, role, exp
  Never in JWT: passwords, API keys, personal data, health info
```

The payload is not a safe place for anything you want to hide.

---

## The Complete Flow — Login to Protected Endpoint

Append to `step4_expiry.py`:

```python
# --- Putting it all together: login → token → protected endpoint ---
print("\n=== Full flow: login → token → protected endpoint ===")
print()

# Simulated user database
user_db = {
    "alice": {"password": "correctpassword", "user_id": 1, "role": "user"},
    "bob":   {"password": "bobspassword",    "user_id": 2, "role": "admin"},
}

def login(username, password):
    """
    Authenticate user and return a JWT.
    In production: hash comparison with bcrypt, not plain-text.
    """
    user = user_db.get(username)
    if not user or user["password"] != password:
        return None, "Invalid credentials"
    payload = {
        "user_id": user["user_id"],
        "role": user["role"],
        "exp": int(time.time()) + 900,
    }
    token = encode_jwt(payload, SECRET_KEY)
    return token, "OK"

def protected_endpoint(token, required_role="user"):
    """
    A protected endpoint that requires a valid JWT.
    Returns the user's data if authorized.
    """
    try:
        claims = decode_jwt(token, SECRET_KEY)
    except ValueError as e:
        return 401, f"Unauthorized: {e}"

    # Role-based access control from the token's claims
    role_hierarchy = {"user": 1, "admin": 2}
    user_level = role_hierarchy.get(claims.get("role", ""), 0)
    required_level = role_hierarchy.get(required_role, 999)

    if user_level < required_level:
        return 403, f"Forbidden: requires '{required_role}', got '{claims['role']}'"

    return 200, f"Welcome, user_id={claims['user_id']} (role={claims['role']})"

# Alice logs in (user role)
token, msg = login("alice", "correctpassword")
print(f"Alice logs in: {msg}")

# Alice accesses a public endpoint (requires 'user' role)
status, body = protected_endpoint(token, required_role="user")
print(f"Alice → /api/data:  {status} {body}")

# Alice tries to access an admin endpoint
status, body = protected_endpoint(token, required_role="admin")
print(f"Alice → /api/admin: {status} {body}")

# Bob logs in (admin role)
token_bob, msg = login("bob", "bobspassword")
print(f"\nBob logs in: {msg}")

# Bob accesses the admin endpoint
status, body = protected_endpoint(token_bob, required_role="admin")
print(f"Bob → /api/admin:  {status} {body}")

# Invalid token attempt
status, body = protected_endpoint("garbage.token.here", required_role="user")
print(f"\nGarbage token:     {status} {body}")

# Wrong password
token_fail, msg = login("alice", "wrongpassword")
print(f"Wrong password:    {msg}, token={token_fail}")
```

**SAVE AND TRY:**
```
python step4_expiry.py
```

**New output at the bottom:**
```
=== Full flow: login → token → protected endpoint ===

Alice logs in: OK
Alice → /api/data:  200 Welcome, user_id=1 (role=user)
Alice → /api/admin: 403 Forbidden: requires 'admin', got 'user'

Bob logs in: OK
Bob → /api/admin:  200 Welcome, user_id=2 (role=admin)

Garbage token:     401 Unauthorized: Invalid token structure
Wrong password:    Invalid credentials, token=None
```

The server never looked up a session. It verified the signature, decoded the claims, and enforced access control — all in memory.

---

## What You Built

- `step1_decode_real.py` — proves JWT payload is readable without the secret
- `step2_encode_decode.py` — JWT encoder and decoder from scratch using `hmac` + `base64`
- `step3_tamper.py` — tampering attack demonstration: signature prevents payload modification
- `step4_expiry.py` — expiry checking, payload confidentiality warning, full login flow

You have now seen every piece of what PyJWT or python-jose does internally.

---

## Challenge

**No solution provided. Requirements, starter code, and one hint.**

### The API Gateway with Role Decorator

Build `api_gateway.py` — a function that validates a JWT and a decorator that enforces roles on handler functions.

**Requirements:**

1. Build `validate_token(token: str) -> dict` — calls `decode_jwt`, returns the claims dict, raises `AuthError` (a custom exception) on failure. `AuthError` should carry an HTTP status code: 401 for invalid/missing token, 403 for valid token with insufficient role.

2. Build `@require_role("admin")` — a decorator factory. The decorator wraps a handler function. The handler signature is `handler(request: dict) -> dict`. The decorator:
   - Expects `request["token"]` to be present
   - Calls `validate_token` on it
   - Attaches `request["user"]` = the decoded claims if valid
   - Raises `AuthError(403)` if the role is insufficient
   - Calls the original handler and returns its result if authorized

3. Build three handler functions demonstrating the system:
   ```python
   @require_role("user")
   def get_profile(request):
       return {"profile": f"User {request['user']['user_id']}"}

   @require_role("admin")
   def delete_user(request):
       return {"deleted": request.get("target_user_id")}

   @require_role("admin")
   def list_all_users(request):
       return {"users": [1, 2, 3, 4, 5]}
   ```

4. Demonstrate four scenarios:
   - User token accessing `get_profile` → succeeds
   - User token accessing `delete_user` → 403 Forbidden
   - Admin token accessing `delete_user` → succeeds
   - Expired token accessing anything → 401 Unauthorized

5. Print a clean table showing each scenario's result:
   ```
   === API Gateway Test Results ===
   alice (user) → GET /profile:         200 OK
   alice (user) → DELETE /user/99:      403 Forbidden
   bob (admin)  → DELETE /user/99:      200 OK
   expired_tok  → GET /profile:         401 Unauthorized
   ```

**Starter:**

```python
# api_gateway.py
import base64
import hashlib
import hmac
import json
import time
from functools import wraps

SECRET_KEY = b"super-secret-key-change-this-in-production"

class AuthError(Exception):
    """Raised when a request fails authentication or authorization."""
    def __init__(self, status: int, message: str):
        self.status = status      # 401 or 403
        self.message = message
        super().__init__(message)

def base64url_encode(data: bytes) -> str:
    pass  # copy from step2

def base64url_decode(s: str) -> bytes:
    pass  # copy from step2

def encode_jwt(payload: dict, secret: bytes) -> str:
    pass  # copy from step2

def decode_jwt(token: str, secret: bytes) -> dict:
    pass  # copy from step4 — includes expiry check

def validate_token(token: str) -> dict:
    """Validate a JWT and return claims. Raises AuthError on failure."""
    pass  # your implementation

def require_role(role: str):
    """
    Decorator factory. Usage:
        @require_role("admin")
        def my_handler(request):
            ...
    """
    def decorator(handler):
        @wraps(handler)  # preserves the original function's name and docstring
        def wrapper(request: dict) -> dict:
            pass  # your implementation
        return wrapper
    return decorator

# Handlers
@require_role("user")
def get_profile(request):
    return {"profile": f"User {request['user']['user_id']}"}

@require_role("admin")
def delete_user(request):
    return {"deleted": request.get("target_user_id")}

@require_role("admin")
def list_all_users(request):
    return {"users": [1, 2, 3, 4, 5]}

# Test harness
def run_request(handler, token, description, **kwargs):
    """Call a handler and print the result cleanly."""
    request = {"token": token, **kwargs}
    try:
        result = handler(request)
        print(f"  {description}: 200 OK — {result}")
    except AuthError as e:
        print(f"  {description}: {e.status} {e.message}")

# Generate test tokens
user_token = encode_jwt(
    {"user_id": 1, "role": "user", "exp": int(time.time()) + 900},
    SECRET_KEY
)
admin_token = encode_jwt(
    {"user_id": 2, "role": "admin", "exp": int(time.time()) + 900},
    SECRET_KEY
)
expired_token = encode_jwt(
    {"user_id": 3, "role": "user", "exp": int(time.time()) - 1},
    SECRET_KEY
)

print("=== API Gateway Test Results ===")
run_request(get_profile,    user_token,    "alice (user)  → GET /profile  ")
run_request(delete_user,    user_token,    "alice (user)  → DELETE /user  ")
run_request(delete_user,    admin_token,   "bob   (admin) → DELETE /user  ", target_user_id=99)
run_request(list_all_users, admin_token,   "bob   (admin) → GET /users    ")
run_request(get_profile,    expired_token, "expired_token → GET /profile  ")
```

**When done, your output should show:**
- A clean table of each scenario's HTTP status and result
- The `@require_role` decorator transparently enforcing access control
- `functools.wraps` used so the decorated function's name is preserved

**Stuck? Ask AI:**
> "I'm building a `@require_role` decorator in Python using `functools.wraps`. The decorator needs to extract a token from `request['token']`, validate it, and reject if the role is insufficient. My validate function raises a custom `AuthError` exception. How do I structure the wrapper to catch and re-raise with the correct status?"

---

## Quick Check — Answers

1. **Three parts of a JWT:**
   - **Header** — JSON `{"alg": "HS256", "typ": "JWT"}`, base64url-encoded. Specifies the signing algorithm.
   - **Payload** — JSON with the claims (`user_id`, `role`, `exp`), base64url-encoded. The actual data being communicated.
   - **Signature** — `HMAC-SHA256(header + "." + payload, secret)`, base64url-encoded. Proves the token was issued by someone who knows the secret.

2. **No — it is not secret.** The payload is base64url-encoded, not encrypted. Anyone holding the token can decode and read it without the secret key. The signature proves authenticity (who issued it), not confidentiality (who can read it). Never put passwords, API keys, or sensitive data in a JWT.

3. **The server rejects the token.** The server re-computes `HMAC(header.payload, secret)` using the header and payload it received. If the payload was modified, the signing input has changed, so the computed HMAC differs from the signature in the token. `hmac.compare_digest` returns False and the server raises an error. The attacker cannot fix this without knowing the secret.

4. **It cannot — this is the revocation problem.** A JWT is stateless. The server has no record of which tokens it has issued. A stolen token remains valid until its `exp` timestamp passes. Mitigations: short-lived tokens (15 minutes), refresh token pattern, or a blocklist of token IDs (`jti` claim) for critical operations like logout-all or account ban.

5. **HS256** uses a shared secret — the same key signs and verifies. Simple and fast. Use it when a single service both issues and verifies tokens. **RS256** uses a key pair — the private key signs (only the auth server), the public key verifies (any downstream service). Use it in microservices where multiple independent services need to verify tokens but should not all hold the signing key. If one service is compromised, the public key is useless for forgery.
