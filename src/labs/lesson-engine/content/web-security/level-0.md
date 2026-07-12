---
series: web-security
level: 0
title: The Web Security Mindset
lang: javascript
---

# The Web Security Mindset

Security is not a feature you add after the application works. It is a property of the application — present in every design decision, every data validation, every authentication check. A single missed validation or a single leaked secret can compromise all the data your application holds.

Web security is not about memorising a list of vulnerabilities. It is about adopting an adversarial mindset: assume that every user input is malicious, assume that every dependency can be compromised, assume that attackers are patient and creative. By the end of this series you will understand the most common web vulnerabilities, why they exist, and how to eliminate them by design.

## The attacker's perspective

```text
WHAT AN ATTACKER WANTS:
  → Data: user emails, passwords, payment data, personal information
  → Access: admin accounts, internal tools, production systems
  → Compute: your servers for cryptocurrency mining, spam sending, bot attacks
  → Disruption: bring down your service, damage your reputation

HOW ATTACKERS WORK:
  → Automated scanning: tools scan millions of sites per day for known vulnerabilities
    A new site with a known vulnerability is found within minutes of going live.
  → Targeted attacks: for valuable targets, attackers invest significant time
  → Supply chain: compromise a dependency used by many applications
  → Social engineering: trick developers or users into revealing credentials
  → Credential stuffing: use leaked password databases to try on your login page

ATTACKER ASSUMPTIONS (what the attacker controls):
  → Any URL they send to your server
  → Any request body, query parameter, or header
  → Any content they upload or post
  → Any cookie or local storage value (if they can inject code)
  → The timing and volume of requests
  
  Corollary: NEVER trust input from the client.
  Validate, sanitise, and constrain every piece of data that comes from outside your system.
```

**CS lens:** The security mindset is an application of **adversarial thinking** from game theory — modelling the behaviour of an opponent who is trying to find weaknesses. In security, the "game" is asymmetric: the attacker needs to find one vulnerability; the defender must eliminate all of them. This is why defense-in-depth (multiple independent security layers) is the standard approach: even if one layer fails, others remain.

## The OWASP Top 10

The Open Web Application Security Project (OWASP) maintains a list of the most critical web security risks:

```text
OWASP TOP 10 (2021):
  1. Broken Access Control     — users can access data or actions they shouldn't
  2. Cryptographic Failures    — secrets in plaintext, weak encryption
  3. Injection                 — SQL injection, command injection, LDAP injection
  4. Insecure Design           — missing security controls in the architecture
  5. Security Misconfiguration — default credentials, unnecessary features enabled
  6. Vulnerable Components     — outdated libraries with known vulnerabilities
  7. Identity/Auth Failures    — broken authentication, session management
  8. Software Integrity        — untrusted code updates, insecure deserialization
  9. Logging/Monitoring Failures — attackers work undetected
  10. SSRF                     — server-side request forgery
  
  This series covers: #3 (Injection), #7 (Auth), and introduces the mindset for the rest.
```

## Trust boundaries

The core concept in security design is the **trust boundary** — the line between what you control and what you don't.

```text
TRUST BOUNDARIES:

  TRUST NOTHING from the client (zero trust at the boundary):
    → URL parameters, query strings, path segments
    → Request bodies (JSON, form data, file uploads)
    → HTTP headers (User-Agent, Content-Type, Cookie, Authorization)
    → Cookies (even your own — they can be tampered with if not signed)
    → localStorage, sessionStorage

  TRUST YOUR OWN SYSTEM:
    → Data retrieved from YOUR database after validation at insert
    → Environment variables
    → Computed values within your server process
    → Signed/verified tokens (JWT after verification)

  PARTIAL TRUST (verify before use):
    → Third-party API responses (may be compromised or wrong format)
    → Data from other internal services (validate schema)
    → Database data that was inserted with weaker validation (legacy data)

  AT THE TRUST BOUNDARY:
    → Validate input (reject anything that doesn't match the expected format)
    → Sanitise input (make potentially dangerous input safe to use)
    → Parameterise queries (never concatenate user input into SQL or shell commands)
    → Encode output (make dangerous characters safe for the context they appear in)
```

**SE lens:** Trust boundary thinking maps directly to system architecture. Each service in a microservices architecture has a trust boundary with every other service — even internal ones. A compromised service in the same internal network is still a threat. The practical implication: validate inputs at every service boundary, not just at the public API. Authenticate service-to-service calls. This is the "zero trust architecture" model used by modern cloud-native applications.

## The principle of least privilege

Every piece of code, every user, and every service should have access only to what it needs — nothing more.

```javascript
// VIOLATION: API uses a database user with full access
const db = createConnection({
  user: 'root',           // can do anything: DROP TABLE, CREATE USER, etc.
  password: 'password',
  database: 'myapp',
})

// BETTER: API uses a restricted database user
const db = createConnection({
  user: 'myapp_api',     // can only SELECT/INSERT/UPDATE/DELETE on specific tables
  password: process.env.DB_PASSWORD,
  database: 'myapp',
})
// If the API is compromised: attacker cannot DROP tables or access other databases

// Application-level least privilege:
// A regular user endpoint should not use admin database functions
// An admin endpoint should verify the user is an admin (not just authenticated)
// A read-only endpoint should use read-only database credentials
```

```text
LEAST PRIVILEGE APPLIED:
  → Database: separate users per service, each with minimum required permissions
  → File system: application runs as non-root user (from DevOps series: USER node)
  → API endpoints: check permissions per endpoint, not just at login
  → Secrets: each environment variable only exists in the service that needs it
  → Cloud permissions: each Lambda/container has an IAM role with minimum required permissions
```

**Common mistakes:**
- Treating security as a final step — "we'll add security later." Security bugs are architectural; they are very hard to add after the fact. Security decisions must be made when the data model and API are designed.
- Security through obscurity — "attackers won't know about this endpoint." Attackers scan everything. Never rely on a URL being secret or an endpoint being hard to find.
- Storing secrets in code — API keys, database passwords, signing secrets committed to Git. Even in a private repository, every developer and CI/CD system now has the secret. Rotate immediately; use environment variables.

**Debug tip:** To audit what your application is sending and receiving from external services: use a proxy (mitmproxy, Charles, or Wireshark). This shows exactly what data crosses trust boundaries. You may discover that an external dependency is receiving more data than you expected (PII leakage), or that a dependency is returning data in an unexpected format that your validation is missing.

## Challenge: trust_boundary_audit

Classify inputs and identify what must be validated at each trust boundary.

```challenge
function auditTrustBoundary(scenario) {
  // Returns: { trustLevel: 'trusted' | 'zero-trust' | 'partial', mustValidate: string[] }

  if (scenario === 'user-login-request') {
    // POST /api/login with { email, password } from the browser
    // email: could be any string
    // password: could be any string
    return {
      trustLevel: '',      // 'zero-trust': everything from the browser
      mustValidate: [],    // list what must be validated before use
    }
  }

  if (scenario === 'database-query-result') {
    // Data returned from your own database after a SELECT
    // Assume you validated when inserting
    return {
      trustLevel: '',      // 'trusted': you control the database
      mustValidate: [],    // anything that might still need encoding (XSS risk)
    }
  }

  if (scenario === 'third-party-api') {
    // JSON response from a payment provider API
    // e.g., { status: 'success', amount: 100, transactionId: 'txn_123' }
    return {
      trustLevel: '',      // 'partial': trusted but must verify schema/values
      mustValidate: [],    // what to validate
    }
  }
}
```

```test
const login = auditTrustBoundary('user-login-request')
assert login.trustLevel === 'zero-trust'
assert login.mustValidate.some(v => v.toLowerCase().includes('email') || v.toLowerCase().includes('format'))
assert login.mustValidate.length >= 2

const db = auditTrustBoundary('database-query-result')
assert db.trustLevel === 'trusted'
assert db.mustValidate.some(v => v.toLowerCase().includes('xss') || v.toLowerCase().includes('escap') || v.toLowerCase().includes('encod'))

const api = auditTrustBoundary('third-party-api')
assert api.trustLevel === 'partial'
assert api.mustValidate.some(v => v.toLowerCase().includes('schema') || v.toLowerCase().includes('type') || v.toLowerCase().includes('amount'))
```
