---
series: backend-fundamentals
level: 3
title: Authentication — JWT and bcrypt
lang: javascript
---

# Authentication — JWT and bcrypt

Authentication proves who you are. Passwords must be hashed (bcrypt). Sessions are encoded as JWTs — signed tokens the client sends on every request.

## Password hashing with bcrypt

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12; // cost factor — higher = slower = more secure

// At registration:
const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
// Store hash in database, never the plaintext

// At login:
const match = await bcrypt.compare(enteredPassword, storedHash);
// true if correct, false if wrong
```

```text
bcrypt.hash('hunter2', 12)
→ '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9...'

bcrypt.hash('hunter2', 12)   // same input, different result (random salt)
→ '$2b$12$K0yh9YTm8LAX8jVXfCrVWu...'

bcrypt.compare('hunter2', '$2b$12$R9h/...')  → true
bcrypt.compare('wrong',   '$2b$12$R9h/...')  → false

Cost 12 ≈ 250ms per hash. An attacker with a leaked database can try
~4 passwords/second. MD5 allows ~10 billion/second. The slowness is the defence.
Never use MD5, SHA-1, or SHA-256 for passwords.
```

## JWTs — stateless sessions

```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET; // long random string, never in source code

// At login — create token:
const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

// On each request — verify token:
const payload = jwt.verify(token, SECRET); // throws if invalid or expired
// payload.userId, payload.role are now available
```

```text
A JWT is three base64-encoded parts joined by '.':
eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOjF9  .  HMACSHA256(...)
    header                   payload              signature

Anyone can decode the header and payload (they're just base64).
Only the server with SECRET can create a valid signature.
Never put passwords, credit cards, or sensitive data in the payload.

jwt.io — paste any JWT to decode and inspect it.
```

## Login and protected route

```javascript
// Login
app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) { next(err); }
});

// Auth middleware
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});
```

```text
POST /auth/login {"email":"alice@example.com","password":"hunter2"}
→ 200 {"token":"eyJhbGci..."}

GET /me  Authorization: Bearer eyJhbGci...
→ 200 {"userId":1,"role":"admin"}

GET /me  (no header)
→ 401 {"error":"No token"}
```

**CS lens:** JWTs are stateless — the server doesn't store sessions. Any server instance can verify any token using the shared SECRET. The tradeoff: you cannot revoke a JWT before it expires. Solutions: short expiry (15min) + refresh tokens, or a token blocklist in Redis (reintroduces statefulness).

**SE lens:** Never store the JWT in `localStorage` — XSS attacks can read it. Use `httpOnly` cookies (JavaScript cannot read them). The `httpOnly` flag is a browser security feature; the server sets it in the `Set-Cookie` response header.

**Common mistakes:**
- Hardcoding the JWT secret — use `crypto.randomBytes(64).toString('hex')` to generate one, store in environment variables.
- Using symmetric secrets for public APIs — RS256 (asymmetric) lets other services verify tokens without sharing the signing key.

**Debug tip:** Use jwt.io to decode a token and check expiry (`exp` field is a Unix timestamp). If auth is failing, check the token isn't expired and the SECRET matches.

**Next:** Database integration — connecting Node.js to SQLite/PostgreSQL, migrations, and the repository pattern.

## Challenge: jwt_decode

Decode a JWT payload manually.

```javascript
function decodePayload(token) {
  // JWT format: header.payload.signature
  // The payload is base64url encoded
  // Use atob() to decode, then JSON.parse()
}
```

```test
var token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.sig'
var payload = decodePayload(token)
assert payload.userId === 1
assert payload.role === 'admin'
```
