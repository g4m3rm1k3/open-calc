---
series: web-security
level: 3
title: Web Security — Putting It Together
lang: javascript
---

# Web Security — Putting It Together

You have covered the security mindset and trust boundaries, injection attacks (SQL injection, XSS, command injection), and authentication/session security. This capstone lesson integrates all three into a realistic scenario: building a secure user management API.

## The scenario

A user management API has the following endpoints:

```text
POST /api/register         { email, password, name }
POST /api/login            { email, password }
GET  /api/users            (authenticated: own data, or admin: all users)
GET  /api/users/:id        (authenticated: own data, or admin: any user)
PUT  /api/users/:id/name   (authenticated: own data only)
```

We will trace every piece of data from the client through each layer and identify what must be done at each boundary.
```

## The full security trace

```text
REQUEST: POST /api/register { email: "  Alice@EXAMPLE.COM  ", password: "p@ss" }

LAYER 1 — TRUST BOUNDARY (incoming request):
  Trust level: zero-trust
  The client controls: email, password, name
  Everything else in the request (headers, IP, cookies) is also untrusted

  → VALIDATE:
    email:    must be a string, trim whitespace, normalise to lowercase, validate format
    password: must be a string, minimum length 8, maximum 72 (bcrypt truncates at 72)
    name:     must be a string, trim, max 100 chars
  → REJECT immediately if validation fails (HTTP 400 with clear message)
  → Normalise: email.trim().toLowerCase()

LAYER 2 — BUSINESS LOGIC:
  → Check if email already exists (SELECT with parameterised query)
  → Hash the password with bcrypt (SALT_ROUNDS=12)
  → Generate email verification token (crypto.randomBytes(32))
  → INSERT user (parameterised query — never concatenate)

LAYER 3 — RESPONSE (outbound trust boundary):
  → Return: { id, email, name } — NOT the password hash
  → Never return the password_hash, even as '***' — just omit the field
  → Set status 201 Created
```

```javascript
// SECURE REGISTRATION HANDLER
async function handleRegister(req, res) {
  // LAYER 1: Validate and normalise at the trust boundary
  const { email: rawEmail, password, name: rawName } = req.body

  if (typeof rawEmail !== 'string' || typeof password !== 'string' || typeof rawName !== 'string') {
    return res.status(400).json({ error: 'email, password, and name are required' })
  }

  const email = rawEmail.trim().toLowerCase()
  const name  = rawName.trim().slice(0, 100)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8–72 characters' })
  }
  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  // LAYER 2: Business logic (parameterised queries throughout)
  const existing = await db.query('SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    // Return 409 Conflict — but don't reveal that the email IS registered
    // (prevents email enumeration if that's a concern)
    return res.status(409).json({ error: 'Registration failed' })
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const result = await db.query(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
    [email, name, passwordHash]
  )

  // LAYER 3: Response — return only what the client needs
  res.status(201).json({ id: result.insertId, email, name })
}
```

## Layered access control

```javascript
// AUTHENTICATION MIDDLEWARE: verifies the session, attaches user to request
async function requireAuth(req, res, next) {
  const sessionId = req.cookies.session
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized' })

  const session = await db.query(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()',
    [sessionId]
  )
  if (!session) {
    res.clearCookie('session')
    return res.status(401).json({ error: 'Session expired' })
  }

  req.user = { id: session.user_id, role: session.role }
  next()
}

// AUTHORISATION MIDDLEWARE: checks what the authenticated user can do
function requireOwnerOrAdmin(paramName) {
  return (req, res, next) => {
    const targetId = parseInt(req.params[paramName], 10)
    if (req.user.id === targetId || req.user.role === 'admin') {
      next()
    } else {
      // 403 Forbidden (not 404 — the resource exists, access is just denied)
      res.status(403).json({ error: 'Forbidden' })
    }
  }
}
```

```text
AUTHENTICATION vs AUTHORISATION:
  Authentication: "Who are you?" — verifying identity (the session/JWT check)
  Authorisation:  "What can you do?" — checking permissions (the role check)
  
  These are always separate steps. A user can be authenticated (logged in)
  but not authorised (not allowed to access a specific resource).
  
  Common mistake: checking auth once at login and never checking permissions per endpoint.
  Result: a normal user can access /api/admin/users just by changing the URL.

  Correct pattern (middleware chain):
    requireAuth        → verifies session, rejects if expired/missing
    requireOwnerOrAdmin → checks permission for THIS resource
    handler            → only reached if both checks pass
```

```javascript
// ROUTES: authentication + authorisation layered together
app.get('/api/users/:id',
  requireAuth,                        // must be logged in
  requireOwnerOrAdmin('id'),          // must be this user or admin
  async (req, res) => {
    const user = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',  // no password_hash
      [parseInt(req.params.id, 10)]
    )
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(user)
  }
)

app.put('/api/users/:id/name',
  requireAuth,
  requireOwnerOrAdmin('id'),
  loginLimiter,                       // rate limit writes too
  async (req, res) => {
    const name = typeof req.body.name === 'string'
      ? req.body.name.trim().slice(0, 100)
      : null
    if (!name) return res.status(400).json({ error: 'Name is required' })

    await db.query(
      'UPDATE users SET name = ? WHERE id = ?',   // parameterised
      [name, parseInt(req.params.id, 10)]
    )
    res.json({ id: parseInt(req.params.id, 10), name })
  }
)
```

## Security headers

```javascript
// Response headers that reduce attack surface
app.use((req, res, next) => {
  // Prevent browsers from inferring MIME types (MIME-sniffing attack)
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Block clickjacking (loading your page in an iframe to trick clicks)
  res.setHeader('X-Frame-Options', 'DENY')

  // Content Security Policy: allow scripts only from same origin
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'"
  )

  // Force HTTPS (HSTS): for 1 year, including subdomains
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  // Don't send the Referrer header to external sites
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  next()
})
```

```text
COMPLETE SECURITY CHECKLIST FOR THIS API:

  INPUT VALIDATION (trust boundary):
    ✓ Validate type, format, and length of every input field
    ✓ Normalise email to lowercase + trimmed
    ✓ Reject requests that fail validation with HTTP 400

  INJECTION PREVENTION:
    ✓ All SQL queries are parameterised (no string concatenation)
    ✓ All output is encoded when inserted into HTML responses

  AUTHENTICATION:
    ✓ Passwords hashed with bcrypt (SALT_ROUNDS=12)
    ✓ Session IDs are cryptographically random (crypto.randomBytes)
    ✓ Sessions stored in DB with expiry; invalidated on logout
    ✓ Session cookie: HttpOnly; Secure; SameSite=Strict

  AUTHORISATION:
    ✓ Every endpoint checks authentication first
    ✓ Every endpoint that accesses a specific user checks ownership/role
    ✓ 401 for unauthenticated, 403 for unauthorised, 404 for not found

  RATE LIMITING:
    ✓ Login endpoint: 10 attempts per 15 min per IP
    ✓ Register endpoint: rate limited to prevent account enumeration

  SECURITY HEADERS:
    ✓ X-Content-Type-Options, X-Frame-Options, CSP, HSTS, Referrer-Policy

  SECRETS:
    ✓ No secrets in code — all from environment variables
    ✓ .env in .gitignore — never committed

  LOGGING:
    ✓ Log failed login attempts (for incident detection)
    ✓ Never log passwords or tokens
    ✓ Log auth events with timestamp, IP, and email (for audit)
```

**CS lens:** The layered security model mirrors the **principle of defence in depth**: each layer assumes the previous one may fail. Input validation at the trust boundary catches bad data before it reaches the database. Parameterised queries ensure that even if validation is bypassed, SQL injection cannot execute. Authorisation checks ensure that even if a session is stolen, the attacker can only see the victim's own data (not all users' data). Logging ensures that even if an attack succeeds, you can detect and respond to it. No single layer is sufficient; all layers together provide resilience.

**SE lens:** Security is an operational concern as much as a code concern. The code you write is one layer; the deployment configuration is another. HTTPS termination, security headers, and rate limiting can often be applied at the reverse proxy (nginx, Cloudflare) rather than in application code. Separating these concerns — code handles validation and authorisation; infrastructure handles TLS and DDoS protection — means each layer can be updated independently. A WAF (Web Application Firewall) at the infrastructure layer catches generic attacks; your application code handles application-specific business logic security.

**Common mistakes:**
- Putting all security in a single `isAuthenticated` check — this protects routes from anonymous access but does nothing to prevent a logged-in user from accessing another user's data. Every endpoint that accesses a specific resource must check: "Is this user allowed to access THIS specific resource?"
- Returning error details that reveal system internals — `{ error: "SQL error: column 'password_hash' not found" }` tells an attacker your schema. Return generic error messages to the client; log the full error on the server.
- Trusting the `userId` from the request body — `PUT /api/users/profile { userId: 1, name: "..." }` where the userId comes from the client is a privilege escalation vulnerability. The userId must come from the verified session, not from the request.

**Debug tip:** To audit your API's security posture: (1) Try each endpoint without a session cookie — it should return 401. (2) Log in as User A, then try to access User B's data by changing the ID in the URL — it should return 403. (3) Try submitting `' OR '1'='1` as an email in the register/login form — it should return a validation error (not a database error or unexpected data). (4) Use the OWASP ZAP or Burp Suite scanner against your local development server to catch any remaining injection vectors.

## Challenge: secure_api_utils

Implement the core security utilities for the user API.

```challenge
function validateRegistration(body) {
  // body: { email, password, name } — all may be missing, wrong type, or invalid
  // Returns: { valid: true, email: string, name: string } on success
  //   email: trimmed and lowercased
  //   name: trimmed, max 100 chars
  // Returns: { valid: false, error: string } on failure
  //
  // Validation rules:
  //   email: required, string, must contain @ and a dot after @
  //   password: required, string, length 8–72
  //   name: required, string, non-empty after trimming, max 100
}

function checkOwnerOrAdmin(sessionUser, targetId) {
  // sessionUser: { id: number, role: 'user' | 'admin' }
  // targetId: number
  // Returns: true if sessionUser.id === targetId OR sessionUser.role === 'admin'
  // Returns: false otherwise
}

function sanitiseUserResponse(userRow) {
  // userRow: the raw database row — may include password_hash, reset_token, etc.
  // Returns a safe object with only: { id, email, name, createdAt }
  // (createdAt maps from userRow.created_at)
  // All other fields are excluded
}
```

```test
// validateRegistration: happy path
const v1 = validateRegistration({ email: '  Alice@EXAMPLE.COM  ', password: 'securepass1', name: 'Alice' })
assert v1.valid === true
assert v1.email === 'alice@example.com'
assert v1.name === 'Alice'

// validateRegistration: missing password
const v2 = validateRegistration({ email: 'bob@example.com', name: 'Bob' })
assert v2.valid === false
assert typeof v2.error === 'string'

// validateRegistration: short password
const v3 = validateRegistration({ email: 'carol@example.com', password: '1234', name: 'Carol' })
assert v3.valid === false

// validateRegistration: bad email
const v4 = validateRegistration({ email: 'notanemail', password: 'password123', name: 'Dave' })
assert v4.valid === false

// validateRegistration: empty name after trim
const v5 = validateRegistration({ email: 'eve@example.com', password: 'password123', name: '   ' })
assert v5.valid === false

// checkOwnerOrAdmin: own data
assert checkOwnerOrAdmin({ id: 5, role: 'user' }, 5) === true

// checkOwnerOrAdmin: other user's data
assert checkOwnerOrAdmin({ id: 5, role: 'user' }, 99) === false

// checkOwnerOrAdmin: admin can access anyone
assert checkOwnerOrAdmin({ id: 1, role: 'admin' }, 99) === true

// sanitiseUserResponse: strips sensitive fields
const rawRow = {
  id: 42,
  email: 'frank@example.com',
  name: 'Frank',
  password_hash: '$2b$12$abc...',
  reset_token: 'secret-token',
  created_at: '2026-01-01T00:00:00Z',
}
const safe = sanitiseUserResponse(rawRow)
assert safe.id === 42
assert safe.email === 'frank@example.com'
assert safe.name === 'Frank'
assert safe.createdAt === '2026-01-01T00:00:00Z'
assert !('password_hash' in safe)
assert !('reset_token' in safe)
assert !('created_at' in safe)
```
