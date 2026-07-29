# Lesson 48: A Server That Forgets You Between Every Request

## What you will build

Two real, working answers to the same problem — proving who's making a
request across a whole sequence of otherwise-independent HTTP requests —
built and compared directly: session cookies, where the server keeps a
list of who's logged in and hands the browser only a random reference to
look it up; and JWTs, built from scratch (base64url encoding, HMAC
signing, all of it), where the server keeps no list at all and the token
itself carries everything needed to trust it. The transferable problem
this lesson is actually about: these two approaches don't just differ in
implementation detail, they make an opposite tradeoff on one specific
capability — revoking access immediately — and this lesson proves that
tradeoff directly rather than describing it.

## What you need to know first

- **Lesson 24 / Lesson 31** — raw HTTP request and header parsing,
  reused directly for both servers this lesson builds.
- **Lesson 42 / Lesson 47** — `hmac.compare_digest`, reused for JWT
  signature verification; the same constant-time-comparison reasoning
  applies to comparing a computed signature against a presented one.
- **Lesson 43** — `secrets`, reused to generate session IDs.
- **Lesson 30** — Base64 encoding, reused and extended here into its
  URL-safe variant.

---

## The Problem, in prose, no code yet

Every HTTP request this curriculum has built, since Lesson 24, has been
completely independent of every other one — a server that just answered
a request from "alice" has no memory of that the instant the response is
sent, and the very next request, from anyone, looks identical from the
server's point of view unless something is done about it. Demonstrated
directly, with a real server that counts requests globally rather than
per-visitor:

```python
def run_stateless_server(port):
    ...
    visit_count += 1
    body = f"the server has no idea who you are (global visit count: {visit_count})"
```

```
request 1 (from 'alice'): the server has no idea who you are (global visit count: 1)
request 2 (from 'bob'):   the server has no idea who you are (global visit count: 2)
request 3 (from 'alice' again): the server has no idea who you are (global visit count: 3)
```

Three requests, from two conceptually different "visitors," and the
server's response is structurally identical every time — nothing
distinguishes alice's second visit from bob's first. Staying "logged in"
across multiple requests needs some mechanism layered on top of HTTP,
not built into it. This lesson builds the two real, standard ones.

---

## Concept Unit: Cookies — A Reference, Not the Data

### The Problem

The server needs *some* way to recognize the same browser across
multiple requests. The browser itself offers the mechanism: any response
can include a `Set-Cookie` header, and the browser will automatically
resend that exact value, unprompted, on every subsequent request to the
same site — the missing piece HTTP's own statelessness doesn't provide.

### Reference Source

No reference counterpart — `Set-Cookie`/`Cookie` follow the real HTTP
header format defined in RFC 6265, not a specific codebase.

### The New Code

```python
if path == "/login":
    session_id = secrets.token_urlsafe(24)
    sessions[session_id] = "alice"
    body = "logged in"
    response = (
        f"HTTP/1.1 200 OK\r\n"
        f"Set-Cookie: session_id={session_id}; HttpOnly\r\n"
        f"Content-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
    )
```

### Mechanical Walkthrough

- `secrets.token_urlsafe(24)` — a **hard concept reappearing** from
  Lesson 47's API key generation: a random, unguessable identifier,
  applied here as a **session ID** rather than an API key secret — the
  same underlying tool, a different specific use.
- `sessions[session_id] = "alice"` — the session ID is stored as a
  dictionary key, mapped to whatever the server needs to remember about
  this logged-in user — critically, **only the ID itself** will ever be
  sent to the browser; the actual data (`"alice"`) never leaves the
  server.
- `Set-Cookie: session_id={session_id}; HttpOnly` — **first appearance
  of this header.** The browser stores this value and automatically
  resends it, as a `Cookie` header, on every future request to this same
  server — no application code on the browser side needs to do anything
  for this to happen; it's built into how browsers implement HTTP.
  `HttpOnly` (**first appearance**) is a flag telling the browser this
  cookie should never be accessible to JavaScript running on the page at
  all — a real, direct defense against a whole category of attack where
  malicious script injected into a page (cross-site scripting) tries to
  steal a session cookie directly; `HttpOnly` makes that theft
  impossible at the browser level, regardless of what the injected
  script tries.

### CS Lens

This is a session ID acting as an **opaque capability token** — a value
that grants access to something (here, "being recognized as alice") not
because it *contains* any information about alice at all, but purely
because the server chooses to treat *possession* of this specific,
unguessable value as proof of identity. The token carries no meaning on
its own; all the actual meaning lives in the server's own
`sessions` dictionary.

Also recognized in: hotel key cards (the card itself is meaningless
plastic; the hotel's own system decides what room number it opens),
Lesson 47's own API keys (a very similar shape, applied to
machine-to-machine auth rather than browser sessions).

### SE Lens

Storing only a reference in the cookie, never the actual session data,
is a deliberate security boundary: even if a cookie were somehow
intercepted, it reveals nothing about the user by itself — no username,
no role, no permissions — only an opaque string useless without access
to the server's own session store. This is the design property the next
unit's JWT deliberately does *not* have, and that difference is the
whole point of comparing the two.

---

## Concept Unit: Revocation Is Instant, Because the Server Holds the List

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `session_server.py`.
- **Change type:** add.
- **Dependencies:** Lesson 31's request-parsing pattern, reused directly.

### The New Code

```python
elif path == "/profile":
    cookies = parse_cookies(headers)
    session_id = cookies.get("session_id")
    username = sessions.get(session_id)
    if username is None:
        body = "401: no valid session"
        ...
elif path == "/logout":
    cookies = parse_cookies(headers)
    session_id = cookies.get("session_id")
    sessions.pop(session_id, None)
    body = "logged out"
```

### Run it

A real server, a real login, a real protected request, a real logout,
and a real repeat request with the exact same cookie afterward:

```
--- login ---
HTTP/1.1 200 OK
Set-Cookie: session_id=41pALPt2mm7ChCIx35jxL3GxqHaoQTP8; HttpOnly

--- profile, no cookie ---
HTTP/1.1 401 Unauthorized | 401: no valid session

--- profile, valid cookie ---
HTTP/1.1 200 OK | welcome back, alice

--- logout ---
HTTP/1.1 200 OK

--- profile, same cookie after logout ---
HTTP/1.1 401 Unauthorized | 401: no valid session
```

The exact same `session_id` that worked a moment earlier is rejected
immediately after logout — `sessions.pop(session_id, None)` (reused
dictionary removal, the `None` default preventing a `KeyError` if it was
somehow already gone) simply erases the server's own record of it.
Nothing about the cookie itself changed; the server just stopped
recognizing it.

### CS Lens

This is the direct payoff of the opaque-token design from the previous
unit: because the token carries no information of its own, revoking it
is as simple as deleting one dictionary entry — the server is the single
**source of truth** for whether a session is valid, checked fresh on
every single request.

### SE Lens

This immediate revocability is session-based auth's single biggest
practical advantage, worth naming plainly before the next unit shows its
absence: a compromised session, a fired employee, a user who clicks
"log out" — all handled by one server-side deletion, effective on the
very next request, with no dependency on the client cooperating,
expiring naturally, or doing anything at all.

---

## Concept Unit: A JWT, Built From Scratch

### The Problem

Session cookies require the server to keep a growing list of every
active session in memory (or a shared store, for multiple servers) —
fine for many systems, but a real cost at large scale, and a real
coordination problem if multiple independent servers all need to
recognize the same login. A JWT ("JSON Web Token") takes the opposite
approach: put the actual claims *in* the token itself, cryptographically
signed, so any server holding the shared signing key can verify it
without looking anything up anywhere.

### Introduce the concept in isolation

```python
import base64

short_example = b"hi"
print("2-byte input:", short_example)
print("base64url with padding:", base64.urlsafe_b64encode(short_example))
```

Run it:

```
2-byte input: b'hi'
base64url with padding: b'aGk='
```

What this proves: `base64.urlsafe_b64encode` (**first appearance**) is
the same Base64 encoding Lesson 30's WebSocket handshake used, in a
variant (`urlsafe`) that replaces the two characters standard Base64
uses (`+`, `/`) — both of which have special meaning inside a URL — with
two that don't (`-`, `_`), making the output safe to embed directly in a
URL or an HTTP header with no further escaping. The trailing `=` is
**padding**, added when the input length isn't a clean multiple of 3
bytes; JWTs, by their own specification, strip this padding entirely
(demonstrated in the real implementation next), since it's recoverable
from the string's own length and serves no purpose inside a token.

This lab is deleted now; it never appears in the project.

### Project Change

- **Reference Source:** No reference counterpart — the three-segment,
  `header.payload.signature` structure and its exact signing procedure
  follow RFC 7519 (JSON Web Token) directly, not a specific library's
  source.
- **Files affected:** new file, `jwt_tool.py`.
- **Change type:** add.
- **Dependencies:** `base64`, `hashlib`, `hmac` (Lesson 42), `json`,
  `time`.

### The New Code

```python
def base64url_encode(data_bytes):
    return base64.urlsafe_b64encode(data_bytes).rstrip(b"=")


def base64url_decode(data_str):
    padding_needed = -len(data_str) % 4
    return base64.urlsafe_b64decode(data_str + "=" * padding_needed)


def create_jwt(claims, secret_key, expires_in_seconds=3600):
    header = {"alg": "HS256", "typ": "JWT"}
    payload = dict(claims)
    payload["exp"] = int(time.time()) + expires_in_seconds

    header_segment = base64url_encode(json.dumps(header).encode())
    payload_segment = base64url_encode(json.dumps(payload).encode())
    signing_input = header_segment + b"." + payload_segment

    signature = hmac.new(secret_key, signing_input, hashlib.sha256).digest()
    signature_segment = base64url_encode(signature)

    return (signing_input + b"." + signature_segment).decode("ascii")
```

### Mechanical Walkthrough

- `base64url_encode`/`base64url_decode` — the previous unit's lab,
  turned into real, reusable functions; `.rstrip(b"=")` strips JWT's
  unwanted padding on encode, and `-len(data_str) % 4` (**first
  appearance of this specific modular-arithmetic padding-restoration
  trick**) computes exactly how many `=` characters are needed to
  restore a valid length before decoding — Python's `%` on a negative
  number returns a non-negative result matching the *positive*
  remainder, so this expression always yields `0`, `1`, `2`, or `3`,
  exactly the range Base64 padding ever needs.
- `header = {"alg": "HS256", "typ": "JWT"}` — a small `dict`, publicly
  visible once encoded (Base64 is *encoding*, not encryption — anyone
  can decode a JWT's header and payload without any key at all), stating
  which algorithm was used to sign it.
- `payload["exp"] = int(time.time()) + expires_in_seconds` — a **hard
  concept reappearing** from Lesson 36's `date.today()`, this time using
  `time.time()` (Lesson 32 established this as the wrong choice for
  *measuring elapsed duration*, but exactly right here, where an actual
  calendar-time expiration deadline, not an interval, is what's needed)
  — `exp` is a standard, reserved JWT claim name specifically for this.
- `signing_input = header_segment + b"." + payload_segment` — the two
  encoded segments, joined by a literal dot — this exact byte string,
  and nothing else, is what actually gets signed.
- `hmac.new(secret_key, signing_input, hashlib.sha256).digest()` — a
  **hard concept reappearing** from Lesson 42/47's `hmac` usage, applied
  here not to *compare* two values but to *produce* a signature — proof
  that whoever created this token knew `secret_key`, without the key
  itself ever appearing in the token.
- The final `signing_input + b"." + signature_segment` — the complete,
  real JWT: three dot-separated segments, header, payload, signature.

### Run it

```python
secret_key = b"this-is-the-server-only-signing-key"
token = create_jwt({"user": "alice", "role": "user"}, secret_key)
print(token)
```

```
eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJ1c2VyIjogImFsaWNlIiwgInJvbGUiOiAidXNlciIsICJleHAiOiAxNzg1MzE5NDU2fQ.I5TjeDTp32V43c1qUdLsDkiOCbHMXTYyoqu0eEEpx30
```

A real, complete JWT — three segments, exactly matching the format
described above.

---

## Concept Unit: Tampering Is Caught — Even Without Encryption

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `jwt_tool.py`.
- **Change type:** add.
- **Location:** below `create_jwt`.

### The New Code

```python
def verify_jwt(token, secret_key):
    try:
        header_segment, payload_segment, signature_segment = token.encode("ascii").split(b".")
    except ValueError:
        return None, "malformed token"

    signing_input = header_segment + b"." + payload_segment
    expected_signature = hmac.new(secret_key, signing_input, hashlib.sha256).digest()
    actual_signature = base64url_decode(signature_segment.decode("ascii"))

    if not hmac.compare_digest(expected_signature, actual_signature):
        return None, "invalid signature"

    payload = json.loads(base64url_decode(payload_segment.decode("ascii")))
    if payload.get("exp", 0) < time.time():
        return None, "token expired"

    return payload, "ok"
```

### Mechanical Walkthrough

- `token.encode("ascii").split(b".")` unpacked into exactly three
  names — reused splitting, this time relying on Python raising
  `ValueError` automatically if the count doesn't match exactly three,
  caught and converted into a clear rejection.
- `expected_signature = hmac.new(...)` — **re-derives** the signature
  independently, from the presented header and payload plus the
  server's own secret key, rather than trusting anything the token
  itself claims.
- `hmac.compare_digest(expected_signature, actual_signature)` — a
  **hard concept reappearing**, the exact constant-time comparison
  established in Lesson 42, applied here to two raw signature byte
  strings rather than password hashes.
- Only *after* the signature check passes does the code even parse the
  payload as JSON and check `exp` — verifying trust before ever acting
  on the token's claims.

### Run it

```python
payload, status = verify_jwt(token, secret_key)
print("verify genuine token:", status, payload)

header_b64, payload_b64, signature_b64 = token.split(".")
tampered_payload = json.loads(base64url_decode(payload_b64))
tampered_payload["role"] = "admin"
tampered_payload_b64 = base64url_encode(json.dumps(tampered_payload).encode()).decode("ascii")
tampered_token = f"{header_b64}.{tampered_payload_b64}.{signature_b64}"

payload, status = verify_jwt(tampered_token, secret_key)
print("verify tampered token (role changed to admin):", status, payload)

wrong_key = b"a-completely-different-guessed-key"
payload, status = verify_jwt(token, wrong_key)
print("verify with wrong signing key:", status, payload)
```

```
verify genuine token: ok {'user': 'alice', 'role': 'user', 'exp': 1785319456}
verify tampered token (role changed to admin): invalid signature None
verify with wrong signing key: invalid signature None
```

The tampering attempt here is a realistic, meaningful one — decoding the
payload (trivial; it's only *encoded*, not encrypted), changing
`"role": "user"` to `"role": "admin"`, and re-encoding it — a genuine
privilege-escalation attempt, correctly and completely rejected, because
the signature was computed over the *original* payload and cannot be
forged to match the modified one without knowing `secret_key`.

Real expiration, also directly proven, not just implemented:

```python
short_token = create_jwt({"user": "alice"}, secret_key, expires_in_seconds=1)
print("immediately:", verify_jwt(short_token, secret_key)[1])
time.sleep(1.5)
print("after 1.5s:", verify_jwt(short_token, secret_key)[1])
```

```
immediately: ok
after 1.5s: token expired
```

### CS Lens

This is **message authentication without confidentiality** — the same
distinction Lesson 45's AES-GCM drew between secrecy and authenticity,
here entirely on the authenticity side: a JWT's contents are always
readable by anyone (never put a genuine secret *inside* a JWT's payload,
only non-sensitive claims), while remaining tamper-evident to anyone who
doesn't hold the signing key.

### SE Lens

This is a direct, practical demonstration of the exact same "why hand-
roll it" argument Lesson 45 made for `hmac.compare_digest`: everything
built in this unit — the segment splitting, the re-derivation, the
constant-time comparison, the expiration check, in that specific order —
is exactly what a real JWT library (like `PyJWT`) does internally.
Building it by hand here is for understanding what's actually happening
under a real library's surface; a real production system should use a
maintained library rather than this lesson's own version, for the same
reasons Lesson 45 gave for not hand-rolling AES.

---

## Concept Unit: The Tradeoff — Proven, Not Just Described

### The Problem

Both mechanisms are now built and independently verified correct. The
one property that actually differs between them — the whole reason to
choose one over the other — is worth proving directly, the same way
every other claim in this lesson has been.

### Run it

```python
token = create_jwt({"user": "alice"}, secret_key, expires_in_seconds=3600)
print("token issued, still valid for an hour:", verify_jwt(token, secret_key)[1])

print("user clicks 'log out' -- but there is no server-side session to delete at all")
print("the exact same token, presented again, one second later:")
print("still valid:", verify_jwt(token, secret_key)[1])
```

```
token issued, still valid for an hour: ok
user clicks 'log out' -- but there is no server-side session to delete at all
still valid: ok
```

Compared directly against the session cookie's own logout test earlier
in this lesson — where the identical scenario produced an immediate
`401 Unauthorized` — the JWT's answer here is `ok`. There is no server-
side list this "logout" could remove an entry from, because the whole
design point of a JWT is not needing one; the token remains
cryptographically valid, and therefore functionally valid, until its
`exp` claim naturally passes — potentially the full hour, regardless of
what the user or the application intended by "logging out."

### CS Lens

This is the direct, practical cost of **statelessness**: everything a
stateless design gains (no server-side storage, no lookup, trivially
shareable across many independent servers with no coordination) is paid
for with the loss of any single point where "this credential is no
longer valid" can be enforced *before* its natural expiration.

### SE Lens

Real systems that need both JWTs' scalability and session cookies'
instant revocability use various compromises this lesson's minimal
version doesn't build: short expiration times (minutes, not hours,
shrinking the exposure window), a server-side "deny list" of specific
revoked tokens checked on top of signature verification (which quietly
reintroduces exactly the server-side state JWTs were meant to avoid, for
just the revoked subset), or a hybrid — a short-lived JWT plus a
longer-lived, revocable session-style "refresh token" behind it. None of
these are free; each re-introduces some amount of the exact cost
statelessness was chosen to avoid, proportional to how much revocability
is actually needed.

---

## Connect the pieces

One login, followed both ways: a session-based login stores
`"alice"` behind an unguessable `session_id`, sent to the browser via
`Set-Cookie`, automatically resent on every later request, checked
against the server's own list every time — and removable from that list
instantly, proven directly by the real `401` immediately after logout.
A JWT-based login instead packages `{"user": "alice", "exp": ...}`
directly into a signed token the server never needs to remember issuing
at all — verified independently on every request using nothing but the
shared secret key, proven tamper-resistant against a real
privilege-escalation attempt, and proven, just as directly, to have no
mechanism for early revocation at all once issued.

## What breaks without this

Already demonstrated, directly, three separate times: a session cookie
reused after logout is correctly rejected (`401`); a JWT with a modified
claim is correctly rejected (`invalid signature`); and — the deliberately
uncomfortable proof this lesson doesn't shy away from — a JWT reused
after a conceptual "logout," with no code bug involved at all, remains
`ok`, exactly as its stateless design guarantees it will.

## Definition of done

- [ ] A session cookie obtained from `/login` grants access to
      `/profile` and is immediately rejected after `/logout`.
- [ ] A genuine JWT verifies successfully; a JWT with any claim modified
      after signing fails with `"invalid signature"`, not a silent
      wrong answer.
- [ ] A JWT verified after its `exp` time has passed fails with
      `"token expired"`.
- [ ] You can reproduce, and explain plainly, why a "logged out" JWT
      remains valid with no code changes required to prove it.
- [ ] You can state, in one sentence each, one real situation where
      session cookies are clearly the better choice and one where JWTs
      are.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add session_server.py jwt_tool.py
  git commit -m "Add session-cookie and from-scratch JWT auth side by side — proved sessions revoke instantly and JWTs cannot, both directly, rather than describing the tradeoff"
  ```

## What's next

Lesson 49's two-factor authentication adds a second, independent proof
of identity on top of either mechanism this lesson built — layered on,
not a replacement for, whichever this lesson's system ends up using.
Lesson 53's password vault will use session-style server-side state
for its own login, for the exact reason this lesson proved matters most
for something security-sensitive: the ability to cut off access
immediately, without waiting for anything to expire on its own.
