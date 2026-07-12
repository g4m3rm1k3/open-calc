---
series: web-security
level: 2
title: Authentication and Session Security
lang: javascript
---

# Authentication and Session Security

Authentication answers the question: "Who is this user?" Session security answers: "How do we keep track of that identity across multiple requests?" Both are in the OWASP Top 10 because errors here are catastrophic — they allow attackers to impersonate users, take over accounts, or bypass access controls entirely.

By the end of this lesson you will understand how to hash passwords correctly, how sessions and JWTs work and when to use each, and the common patterns that make authentication systems fail.

## Password hashing

Passwords must never be stored in plaintext or with reversible encryption. If your database is breached, plaintext passwords expose every user — and because users reuse passwords, they expose those users on other sites too.

```javascript
// WRONG: plaintext storage
async function registerUser(email, password) {
  await db.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password]   // stored as-is — one breach exposes everything
  )
}

// WRONG: reversible encryption or MD5/SHA1
const hashed = crypto.createHash('md5').update(password).digest('hex')
// MD5 is fast and rainbow-table attackable — a GPU can test billions per second
```

```javascript
// CORRECT: bcrypt (or Argon2, scrypt)
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 12   // cost factor — higher = slower = harder to brute-force

async function registerUser(email, password) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  await db.query(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hash]
  )
}

async function loginUser(email, plaintext) {
  const row = await db.query('SELECT * FROM users WHERE email = ?', [email])
  if (!row) return null

  const match = await bcrypt.compare(plaintext, row.password_hash)
  return match ? row : null
}
```

```text
WHY BCRYPT:
  SALT: bcrypt automatically generates and stores a unique random salt per password.
    A salt ensures that two users with the same password produce different hashes.
    This defeats rainbow table attacks (precomputed hash lookup tables).

  COST FACTOR: bcrypt is deliberately slow. At SALT_ROUNDS=12, it takes ~250ms per hash.
    An attacker who steals your database cannot test passwords faster than this.
    A GPU that tests 10 billion MD5 hashes/second can only test 4 bcrypt hashes/second.
    
  SECURE COMPARISON: bcrypt.compare() uses constant-time comparison.
    Prevents timing attacks: an attacker who can measure response times cannot
    determine if they got the hash "partially right."

  SALT_ROUNDS GUIDE:
    10: ~100ms (minimum acceptable)
    12: ~250ms (recommended for most applications)
    14: ~1s (for high-security contexts — login delays are acceptable)
    Increase as hardware gets faster. Check with: console.time('bcrypt'); await bcrypt.hash('test', N); console.timeEnd('bcrypt')
```

**CS lens:** bcrypt is a **key derivation function** (KDF) — it derives a fixed-length output from a variable-length input while being deliberately computationally expensive. This is the inverse of what we usually want from a hash function. For checksums and lookup we want speed; for passwords we want slowness, because the attacker's brute-force attack has the same cost as our legitimate verification. The cost factor means that as hardware improves, you can increase the cost factor to keep the brute-force cost constant in wall-clock time.

## Sessions vs JWTs

After authentication, the server needs to know who the user is on subsequent requests. There are two main approaches: server-side sessions and stateless JWTs.

```text
SERVER-SIDE SESSIONS:
  1. User logs in → server creates a session record in the database
     { sessionId: 'abc123', userId: 42, createdAt: ..., expiresAt: ... }
  2. Server sends a cookie: Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
  3. On every request: browser sends the cookie automatically
  4. Server looks up the session ID in the database → finds the userId
  5. On logout: server deletes the session record → cookie is now invalid

  ADVANTAGES:
    ✓ Sessions can be invalidated immediately (logout, password change, suspicious activity)
    ✓ Session data (permissions, preferences) lives in the database — up to date
    ✓ Session ID in the cookie is a random, opaque token — contains no user data
  
  DISADVANTAGES:
    → Requires database lookup per request (can be mitigated with Redis/cache)
    → Stateful: each server needs access to the session store
```

```javascript
// JWT (JSON Web Token): stateless authentication
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET   // must be a long random string

async function loginAndIssueToken(email, password) {
  const user = await loginUser(email, password)
  if (!user) throw new Error('Invalid credentials')

  const token = jwt.sign(
    { userId: user.id, role: user.role },  // payload — included in the token
    JWT_SECRET,
    { expiresIn: '1h' }                    // token expires in 1 hour
  )
  return token
}

function requireAuth(req, res, next) {
  const token = req.cookies.token   // or: req.headers.authorization?.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)   // throws if invalid or expired
    req.user = payload
    next()
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
```

```text
HOW JWT WORKS:
  A JWT is three base64-encoded parts, joined by dots: header.payload.signature
  
  header:  { "alg": "HS256", "typ": "JWT" }
  payload: { "userId": 42, "role": "admin", "iat": 1720000000, "exp": 1720003600 }
  signature: HMAC-SHA256(base64(header) + '.' + base64(payload), JWT_SECRET)

  The signature is the key: anyone with the secret can create and verify tokens.
  Without the secret, you cannot forge a valid signature.
  The server verifies the signature on every request — no database lookup needed.

  ADVANTAGES:
    ✓ Stateless: no database lookup per request
    ✓ Works across multiple servers without a shared session store
    ✓ Portable: can be verified by any service that knows the secret

  DISADVANTAGES:
    → Cannot be invalidated before expiry (a compromised token stays valid until exp)
    → Payload is readable by anyone (base64-decode it) — never put secrets in the payload
    → Secret rotation invalidates ALL tokens — all users must re-login

WHICH TO USE:
  Sessions: for web apps with standard user login flows where instant invalidation matters
  JWTs: for stateless APIs, microservices, mobile clients, short-lived tokens (< 1h)
  Hybrid: JWT for stateless access tokens + session (or refresh token) for long-lived auth
```

**SE lens:** The session vs JWT choice is a trade-off between **consistency** and **availability** in the CAP theorem sense. Sessions give you strong consistency: a logout is effective immediately everywhere. JWTs give you availability: every server can verify independently without a central store, but at the cost of eventual consistency (a revoked token remains valid until expiry). In practice: use sessions for admin dashboards and banking; use short-lived JWTs (< 15 min) with refresh tokens for mobile and API clients.

## Common authentication vulnerabilities

```javascript
// VULNERABILITY 1: Timing attack on authentication
// WRONG: short-circuit on user not found
async function loginWrong(email, password) {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [email])
  if (!user) return null                         // returns fast — email not found
  const match = await bcrypt.compare(password, user.hash)  // slow — hash check
  return match ? user : null
}
// Attacker measures response time: fast response = email doesn't exist (user enumeration)
// They can enumerate which emails are registered without trying a single password.

// CORRECT: always do the hash check (constant time for both branches)
const DUMMY_HASH = await bcrypt.hash('dummy', 12)   // computed once at startup

async function loginCorrect(email, password) {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [email])
  // Always run bcrypt.compare — even if user is null, to keep response time constant
  const hash = user?.password_hash ?? DUMMY_HASH
  const match = await bcrypt.compare(password, hash)
  return (match && user) ? user : null
}
```

```javascript
// VULNERABILITY 2: Missing rate limiting — brute-force attacks
// WRONG: unlimited login attempts
app.post('/login', async (req, res) => {
  const user = await loginUser(req.body.email, req.body.password)
  // ...
})

// CORRECT: rate limiting per IP or per account
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 attempts per window per IP
  message: 'Too many login attempts — try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

app.post('/login', loginLimiter, async (req, res) => {
  // ...
})
```

```javascript
// VULNERABILITY 3: Insecure password reset
// WRONG: using a predictable or guessable token
async function initiatePasswordReset(email) {
  const token = Date.now().toString()  // predictable — attacker can guess timestamps
  await db.query('UPDATE users SET reset_token = ? WHERE email = ?', [token, email])
  await sendEmail(email, `Reset: /reset?token=${token}`)
}

// CORRECT: cryptographically random token with expiry
const crypto = require('crypto')

async function initiatePasswordResetCorrect(email) {
  const token = crypto.randomBytes(32).toString('hex')  // 256 bits of randomness
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)  // 1 hour

  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
    [token, expiresAt, email]
  )
  // Always send success response — even if email doesn't exist (prevent enumeration)
  await sendEmail(email, `Reset: /reset?token=${token}`)
}
```

```text
CSRF (CROSS-SITE REQUEST FORGERY):
  Attack: Attacker tricks a logged-in user into visiting attacker's site.
  Attacker's site makes a request to YOUR site using the user's session cookie.
  Cookie is sent automatically — the request appears legitimate.
  
  Example: User is logged into bank.com.
  Attacker sends them to: attacker.com which contains:
    <form action="https://bank.com/transfer" method="POST">
      <input name="to" value="attacker-account">
      <input name="amount" value="10000">
    </form>
    <script>document.forms[0].submit()</script>
  
  DEFENCES:
  → SameSite=Strict cookie attribute: browser won't send the cookie on cross-site requests
    Set-Cookie: session=abc; SameSite=Strict; HttpOnly; Secure
  → CSRF token: include a random token in every form, verify it on the server
  → Check Origin/Referer headers
  
  SameSite=Strict alone is sufficient for most modern applications.
```

**Common mistakes:**
- Storing JWTs in localStorage — localStorage is accessible to any JavaScript running on the page, including injected XSS scripts. Use `HttpOnly; Secure; SameSite=Strict` cookies instead. The cookie is sent automatically and cannot be read by JavaScript.
- Using weak secrets for JWT signing — `jwt.sign(payload, 'secret')` with the string `'secret'` is trivially brute-forceable. Use `crypto.randomBytes(64).toString('hex')` to generate a 512-bit secret.
- Not hashing the password reset token — the reset token stored in the database should itself be hashed (with SHA-256, not bcrypt — speed is fine here). If the database is breached, attackers cannot use stored reset tokens to take over accounts.

**Debug tip:** To inspect your cookies' security flags, open DevTools → Application → Cookies. Verify that session and auth cookies have `HttpOnly`, `Secure`, and `SameSite=Strict` set. To test for CSRF vulnerabilities: try making a cross-origin POST request to your API from a different origin — if it succeeds without a CSRF token, the endpoint is vulnerable. To check JWT security: paste any JWT into jwt.io — it decodes immediately, proving that the payload is not encrypted. Never put sensitive data in a JWT payload.

## Challenge: auth_utils

Implement core authentication utilities.

```challenge
function hashPassword(plaintext) {
  // Simulated bcrypt hash for the lesson engine (no bcrypt available here)
  // Returns: { hash: string, salt: string }
  // Use: salt = 16-char random hex, hash = sha256(plaintext + salt) as hex
  // (Real code would use bcrypt.hash — this is a simulation)
  
  // You can use this simple hash simulation:
  function sha256Sim(str) {
    // Simple deterministic hash for testing (not cryptographically secure)
    let h = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = (h * 0x01000193) >>> 0
    }
    return h.toString(16).padStart(8, '0').repeat(8)
  }

  const salt = Math.random().toString(36).slice(2, 18).padEnd(16, '0')
  const hash = sha256Sim(plaintext + salt)
  return { hash, salt }
}

function verifyPassword(plaintext, storedHash, salt) {
  // Returns true if plaintext matches the stored hash + salt
  // Must use the same algorithm as hashPassword
}

function generateSessionId() {
  // Returns a random session identifier (at least 32 hex characters)
  // Must use Math.random() for the lesson engine (real code uses crypto.randomBytes)
  // Hint: combine several Math.random().toString(36) values
}

function parseAuthHeader(authHeader) {
  // Parses: 'Bearer eyJhbG...' → 'eyJhbG...'
  // Returns null if header is missing, empty, or doesn't start with 'Bearer '
}
```

```test
// hashPassword + verifyPassword round-trip
const pw1 = hashPassword('correcthorsebatterystaple')
assert typeof pw1.hash === 'string'
assert typeof pw1.salt === 'string'
assert pw1.hash.length > 0
assert pw1.salt.length >= 16

assert verifyPassword('correcthorsebatterystaple', pw1.hash, pw1.salt) === true
assert verifyPassword('wrongpassword', pw1.hash, pw1.salt) === false

// Two hashes of the same password are different (because of random salt)
const pw2 = hashPassword('correcthorsebatterystaple')
assert pw1.hash !== pw2.hash   // different salts → different hashes

// generateSessionId
const sid = generateSessionId()
assert typeof sid === 'string'
assert sid.length >= 32

// Two session IDs are different
const sid2 = generateSessionId()
assert sid !== sid2

// parseAuthHeader
assert parseAuthHeader('Bearer mytoken123') === 'mytoken123'
assert parseAuthHeader('Bearer ') === null || parseAuthHeader('Bearer ') === ''
assert parseAuthHeader(null) === null
assert parseAuthHeader('') === null
assert parseAuthHeader('Basic abc') === null
```
