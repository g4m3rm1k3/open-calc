---
series: backend-fundamentals
level: 3
title: Authentication — bcrypt and JWT
lang: javascript
---

# Authentication — bcrypt and JWT

**Authentication** is the process of proving identity — confirming that the person making a request is who they claim to be. Almost every application needs it.

Two problems need to be solved. First: passwords must never be stored in plaintext — if the database is leaked, every user's password is exposed. Second: HTTP is stateless (Level 0) — the server forgets who you are after every request. Some mechanism must re-establish identity on each request without requiring the user to log in again.

The tools: **bcrypt** for storing passwords safely, **JWTs** (JSON Web Tokens) for stateless session management.

By the end of this lesson you will understand why password hashing is necessary, how bcrypt's cost factor makes brute-force attacks slow, how JWTs encode identity, and how to wire login and route protection together.

## Why you cannot store plaintext passwords

If you store `password: 'hunter2'` in your database and an attacker gains read access to the database (SQL injection, misconfigured backup, insider threat), they have every user's password. Users reuse passwords — every other site those users have accounts on is now compromised too.

The solution: store a **hash** of the password, not the password itself. A hash function maps any input to a fixed-size output. The same input always produces the same output. But the function is one-way — given the output, you cannot reconstruct the input.

At login, instead of comparing `enteredPassword === storedPassword`, you hash the entered password and compare the two hashes.

**The problem with fast hash functions (MD5, SHA-256):** Hash functions designed for data integrity are intentionally fast. A modern GPU can compute 10 billion SHA-256 hashes per second. An attacker with a leaked hash database can brute-force every common password in hours.

**The solution:** A slow hash function designed specifically for passwords.

## bcrypt — deliberately slow password hashing

**bcrypt** is a password hashing algorithm with a configurable **cost factor** (also called work factor or salt rounds). The cost factor controls how many iterations the algorithm runs. Each increment of the cost factor doubles the computation time.

`bcrypt.hash(plaintext, saltRounds)` — hashes the plaintext password. Returns a Promise resolving to the hash string. The hash includes the salt (a random value mixed in before hashing) and the cost factor — you do not store them separately.

`bcrypt.compare(enteredPassword, storedHash)` — extracts the salt and cost factor from the stored hash, rehashes the entered password with the same parameters, and compares. Returns a Promise resolving to `true` (match) or `false` (no match).

`saltRounds` — integer controlling computation cost. 12 is the current standard (≈250ms per hash). This makes brute-force feasible at roughly 4 attempts/second — not 10 billion.

```javascript
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function registerUser(email, plaintextPassword) {
  const passwordHash = await bcrypt.hash(plaintextPassword, SALT_ROUNDS);
  console.log('Hash:', passwordHash);
  return { email, passwordHash };
}

async function checkPassword(enteredPassword, storedHash) {
  const match = await bcrypt.compare(enteredPassword, storedHash);
  console.log('Passwords match:', match);
  return match;
}

const user = await registerUser('alice@example.com', 'hunter2');
await checkPassword('hunter2', user.passwordHash);
await checkPassword('wrong',   user.passwordHash);
```

```text
Trace:

  bcrypt.hash('hunter2', 12)
  → generates random 128-bit salt
  → runs 2^12 = 4096 iterations of the Blowfish cipher
  → encodes salt + cost + result into one string
  → '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/3tcoj3iun...'

  bcrypt.hash('hunter2', 12) again (same input)
  → different random salt
  → '$2b$12$K0yh9YTm8LAX8jVXfCrVWu...'
  (different output — the random salt is why)

  bcrypt.compare('hunter2', '$2b$12$R9h/...')
  → extracts salt from hash string
  → rehashes 'hunter2' with that exact salt
  → compares to stored hash
  → true

  bcrypt.compare('wrong', '$2b$12$R9h/...')
  → same process, 'wrong' hashes to something different
  → false
```

**Enable Debug and step through this** — watch `registerUser` await the hash (takes real time due to bcrypt's cost), then `checkPassword` await the comparison. Observe that the two calls to `bcrypt.hash` with the same plaintext produce different strings.

**CS lens:** bcrypt's structure `$2b$12$<22-char-salt><31-char-hash>` is self-describing — the algorithm version (`2b`), cost factor (`12`), and salt are all embedded in the output string. This is why `bcrypt.compare` only needs the plaintext and the stored hash — the stored hash contains everything needed to reproduce the computation. This design means you can increase the cost factor for new users over time without breaking existing hashes.

**Common mistake:** Using `bcrypt.hashSync()` in a request handler. The `Sync` variant blocks the event loop for 250ms — every concurrent request freezes. Always use the async versions (`bcrypt.hash`, `bcrypt.compare`) in route handlers.

## JWTs — stateless session tokens

HTTP is stateless: after the response is sent, the server forgets the request completely. To maintain identity across requests without requiring login on every request, the server issues a **token** at login. The client stores the token and sends it with every subsequent request.

A **JWT** (JSON Web Token) is a base64url-encoded token in three parts: `header.payload.signature`, joined by dots.

```text
Structure of a JWT:

eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9 . HMACSHA256(...)
─────────────────────   ─────────────────────────────────────────   ──────────────
     header                         payload                          signature

Decoded header:  {"alg":"HS256"}
Decoded payload: {"userId":1,"role":"admin","iat":1704067200,"exp":1704672000}
                  ↑ your data              ↑ issued at       ↑ expiry (Unix timestamp)

The signature is HMAC-SHA256(header + '.' + payload, SECRET).
It cannot be forged without the SECRET.
```

`jwt.sign(payload, secret, options)` — creates a JWT. The payload is your data (userId, role, etc.). The secret is a long random string known only to your server. `expiresIn: '7d'` adds an `exp` field to the payload.

`jwt.verify(token, secret)` — verifies the signature and expiry. Throws if the token is invalid, expired, or tampered with. If it does not throw, the payload is genuine.

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // never hardcode this

function createToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

const token = createToken(1, 'admin');
console.log('Token:', token);
console.log('Verified:', verifyToken(token));
console.log('Tampered:', verifyToken(token + 'x'));
```

```text
Trace:

  createToken(1, 'admin')
  → builds payload: { userId:1, role:'admin', iat:..., exp:... }
  → signs with JWT_SECRET
  → returns 'eyJhbGci...eyJ1c2Vy...HMAC...'

  verifyToken(token)
  → jwt.verify recomputes signature from header + payload
  → compares to the signature in the token
  → signatures match, exp not reached
  → returns payload: { userId:1, role:'admin', ... }
  → { valid: true, payload: { userId:1, role:'admin' } }

  verifyToken(token + 'x')
  → last character of signature is changed
  → recomputed signature ≠ stored signature
  → throws JsonWebTokenError: 'invalid signature'
  → { valid: false, reason: 'invalid signature' }
```

**CS lens:** JWTs are **stateless** — the server stores nothing per session. Any server instance (in a load-balanced cluster) can verify any token using the shared `JWT_SECRET`. The alternative, **server-side sessions**, stores a session ID in a cookie and the session data in a database or Redis. Sessions are revocable; JWTs are not (until they expire). Trade-off: JWTs scale horizontally with no shared state; sessions require a shared session store but can be invalidated instantly.

**SE lens:** Never store `JWT_SECRET` in source code. Use environment variables (`process.env.JWT_SECRET`). Generate a strong secret with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. A leaked secret means an attacker can forge tokens for any user. Rotate secrets by deploying a new secret — existing tokens become invalid immediately.

**Common mistakes:**
- Storing JWTs in `localStorage` — JavaScript (including malicious injected scripts) can read `localStorage`. XSS attacks steal tokens this way. Use `httpOnly` cookies instead (the browser sends them automatically; JavaScript cannot read them).
- Putting sensitive data in the JWT payload — the payload is base64url-encoded, not encrypted. Anyone who has the token can decode and read the payload. Never put passwords, credit card numbers, or PII in a JWT.

**Debug tip:** Paste any JWT at jwt.io to decode and inspect it. Check the `exp` field (Unix timestamp) — if it's in the past, the token is expired and `jwt.verify` will throw `TokenExpiredError`.

## Complete login and protected route

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'dev-secret-change-in-production';

// Simulated user database
const users = [
  { id: 1, email: 'alice@example.com', passwordHash: '$2b$12$SIMULATED.YWxpY2U' }
];

app.post('/auth/login', async function(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = users.find(function(u) { return u.email === email; });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) { next(err); }
});

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const token = authHeader.slice(7); // remove 'Bearer '
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/profile', requireAuth, function(req, res) {
  res.json({ userId: req.user.userId });
});
```

```text
POST /auth/login {"email":"alice@example.com","password":"hunter2"}
→ bcrypt.compare runs (≈250ms)
→ 200 { "token": "eyJhbGci..." }

GET /profile  Authorization: Bearer eyJhbGci...
→ requireAuth extracts token, calls jwt.verify
→ jwt.verify validates signature + expiry → payload
→ req.user = { userId:1, iat:..., exp:... }
→ 200 { "userId": 1 }

GET /profile  (no Authorization header)
→ requireAuth returns 401 immediately
→ route handler never runs
```

## Challenge: jwt_decode

Decode a JWT payload manually without any library.

A JWT is three dot-separated base64url-encoded parts: `header.payload.signature`. The payload segment is the middle one. `atob(str)` — decodes a base64 string to plain text. `JSON.parse(str)` — parses a JSON string to an object. Base64url uses `-` and `_` instead of `+` and `/`; replace them before calling `atob`.

```javascript
function decodeJwtPayload(token) {
  // Split token on '.', take the middle segment,
  // replace '-' with '+' and '_' with '/',
  // decode with atob(), parse with JSON.parse()
}
```

```test
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyLCJyb2xlIjoiYWRtaW4ifQ.sig'
const payload = decodeJwtPayload(token)
assert payload.userId === 42
assert payload.role === 'admin'
const token2 = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIn0.sig'
const payload2 = decodeJwtPayload(token2)
assert payload2.userId === 1
assert payload2.role === 'user'
```
