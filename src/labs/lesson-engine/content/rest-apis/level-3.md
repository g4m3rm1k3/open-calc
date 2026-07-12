---
series: rest-apis
level: 3
title: Authentication, Rate Limiting, and API Design Patterns
lang: javascript
---

# Authentication, Rate Limiting, and API Design Patterns

A REST API that handles authentication, rate limiting, and consistent design patterns is production-ready. Without these, even a well-structured API becomes a security vulnerability, a performance bottleneck, or a maintenance burden.

This lesson covers how Bearer token authentication works in REST APIs, how rate limiting protects the API from abuse, and the design patterns that make APIs maintainable and consistent across many endpoints.

## Bearer token authentication in REST

REST APIs use the `Authorization` header to carry authentication credentials. The most common scheme for APIs is Bearer tokens — either session-based tokens or JWTs.

```text
AUTHENTICATION FLOW:
  
  1. Client authenticates:
     POST /api/auth/login
     Content-Type: application/json
     { "email": "alice@example.com", "password": "securepass" }
     
     Response 200 OK:
     { "token": "eyJhbGciOiJIUzI1NiJ9...", "expiresAt": "2026-07-12T15:00:00Z" }
  
  2. Client includes token on every subsequent request:
     GET /api/users/42
     Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
  
  3. Server validates the token and processes the request.
  
  4. When the token expires, the client gets 401 and must re-authenticate (or use a refresh token).

BEARER TOKEN RULES:
  → Store tokens in HttpOnly cookies (web clients) or secure storage (mobile)
    NEVER in localStorage (XSS-vulnerable)
  → Include the token on EVERY request to authenticated endpoints
  → The token is a secret — treat it like a password
  → Send over HTTPS only — a token over plain HTTP is immediately compromised
```

```javascript
// SERVER: middleware to validate Bearer tokens
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Include a Bearer token in the Authorization header.'
      }
    })
  }

  const token = authHeader.slice(7)  // 'Bearer '.length === 7

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.userId, role: payload.role }
    next()
  } catch (err) {
    // jwt.verify throws for expired, invalid signature, malformed token
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired. Please re-authenticate.'
      }
    })
  }
}

// Apply to all protected routes:
app.use('/api/users', requireAuth)
app.use('/api/orders', requireAuth)
```

## Rate limiting

Rate limiting prevents a single client from overwhelming the API with too many requests. Without rate limiting, one runaway script or one malicious client can exhaust server resources and take down the service for everyone.

```text
RATE LIMIT RESPONSE:
  HTTP 429 Too Many Requests
  Headers:
    X-RateLimit-Limit:     100        (max requests per window)
    X-RateLimit-Remaining: 0          (requests left in current window)
    X-RateLimit-Reset:     1720792800 (Unix timestamp when window resets)
    Retry-After:           37         (seconds until the client can retry)
  
  Body: { "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "..." } }
```

```javascript
// SLIDING WINDOW RATE LIMITER: counts requests per IP in a time window
// Uses Redis for shared state across multiple server instances

class SlidingWindowRateLimiter {
  constructor(redis, { limit, windowMs }) {
    this._redis = redis
    this._limit = limit
    this._windowMs = windowMs
  }

  async check(identifier) {
    const now = Date.now()
    const windowStart = now - this._windowMs
    const key = `rate:${identifier}`

    // Redis sorted set: each request is a member with its timestamp as score
    // ZREMRANGEBYSCORE: remove requests older than the window
    await this._redis.zremrangebyscore(key, 0, windowStart)

    // ZCARD: count requests in the current window
    const count = await this._redis.zcard(key)

    if (count >= this._limit) {
      // Find when the oldest request in the window will expire
      const oldest = await this._redis.zrange(key, 0, 0, 'WITHSCORES')
      const resetAt = parseInt(oldest[1]) + this._windowMs
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil((resetAt - now) / 1000)
      }
    }

    // Add this request to the window
    await this._redis.zadd(key, now, `${now}`)
    await this._redis.pexpire(key, this._windowMs)   // auto-expire the key

    return {
      allowed: true,
      remaining: this._limit - count - 1,
      resetAt: now + this._windowMs,
      retryAfter: null
    }
  }
}

// MIDDLEWARE using the rate limiter
function createRateLimitMiddleware(limiter) {
  return async (req, res, next) => {
    const identifier = req.ip   // or req.user?.id for per-user limits
    const result = await limiter.check(identifier)

    // Always set rate limit headers (even on allowed requests)
    res.setHeader('X-RateLimit-Limit', limiter._limit)
    res.setHeader('X-RateLimit-Remaining', result.remaining)
    res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt / 1000))

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter)
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Retry after ${result.retryAfter} seconds.`
        }
      })
    }

    next()
  }
}
```

```text
RATE LIMIT DESIGN:
  WHAT TO RATE LIMIT:
    → Public endpoints: by IP address
    → Authenticated endpoints: by user ID (per-user limit, not per-IP)
    → Login/registration: by IP (stricter — prevents brute force)
    
  TYPICAL LIMITS:
    Public APIs:        100–1000 requests per 15 minutes per IP
    Authenticated APIs: 1000–10000 requests per hour per user
    Login endpoint:     10 attempts per 15 minutes per IP
    
  TIERED LIMITS: different limits for different API key tiers
    Free tier:      100 req/hour
    Pro tier:       10,000 req/hour
    Enterprise:     unlimited (with SLA)
```

**CS lens:** The sliding window rate limiter is an implementation of the **sorted set** data structure. Redis sorted sets store elements with associated scores. By using timestamps as scores, `ZREMRANGEBYSCORE` efficiently removes expired elements (those with score < window start) and `ZCARD` counts remaining elements — both O(log N). This is more accurate than a fixed window (which can allow 2× the limit at window boundaries) and more space-efficient than storing individual timestamps in a list.

## API design patterns

Professional REST APIs use consistent patterns across all endpoints to reduce cognitive load for developers using the API.

```javascript
// PATTERN 1: CONSISTENT RESPONSE ENVELOPE
// All responses use the same wrapper structure
// Success responses:
{
  "data": { ... },           // or [] for collections
  "meta": { ... }            // optional: pagination, request info, etc.
}
// Error responses:
{
  "error": { "code": "...", "message": "..." }
}

// NEVER mix: some endpoints returning bare objects, others with envelope
// If you choose an envelope, use it everywhere or nowhere
```

```javascript
// PATTERN 2: IDEMPOTENCY KEYS for non-idempotent operations
// Clients include a unique key with POST/PATCH requests
// Server detects duplicate requests and returns the cached result

// POST /api/payments
// Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
// { "amount": 100, "to": "alice@example.com" }

// Server stores: key → { result, expiresAt }
// If the same key is received again within the expiry window:
//   → Return the cached result (don't process again)
//   → Use 200 (not 201) to indicate replay

async function processWithIdempotency(idempotencyKey, handler) {
  const cached = await cache.get(`idempotency:${idempotencyKey}`)
  if (cached) return { status: 200, body: cached, replayed: true }

  const result = await handler()
  await cache.set(`idempotency:${idempotencyKey}`, result, 'EX', 86400)  // 24h TTL
  return { status: 201, body: result, replayed: false }
}
```

```javascript
// PATTERN 3: HATEOAS — Hypermedia as the Engine of Application State
// (Optional but powerful: responses include links to related actions)
// Common in mature APIs (GitHub API, Stripe API, Shopify API)

{
  "data": {
    "id": "42",
    "status": "pending",
    "total": 150.00
  },
  "links": {
    "self":    "/orders/42",
    "items":   "/orders/42/items",
    "confirm": "/orders/42/confirm",   // action — only included if allowed
    "cancel":  "/orders/42/cancel"    // action — only included if allowed
  }
}

// HATEOAS benefit: clients discover what they can do next from the response.
// A client that sees "confirm" in the links knows it can confirm this order.
// A client that doesn't see "confirm" knows it cannot (e.g., already confirmed).
// Clients don't need to hard-code business rules ("can I confirm a pending order?").
```

**SE lens:** Idempotency keys are a **reliability pattern** for distributed systems. In a distributed environment, any request may time out — the client can't tell if the server processed it or not. Without idempotency keys, the safe response is "don't retry POST requests" (and risk losing the operation) or "retry and accept duplicates." Idempotency keys allow safe retry: the server deduplicates, the client retries freely. Stripe uses idempotency keys for all payment operations; AWS uses them for resource creation. The pattern is especially critical for financial operations where duplicate charges are a serious problem.

**Common mistakes:**
- Rate limiting by IP only for authenticated APIs — a malicious user can rotate IPs to bypass IP-based rate limiting. Authenticated endpoints should rate-limit by user ID. IP-based limits are a defence against unauthenticated abuse only.
- Short idempotency key TTL — if the TTL is too short (1 minute), a client that retries after a slow server won't get the cached result and will create a duplicate. Use 24 hours as the minimum TTL for idempotency keys.
- No rate limit headers on successful responses — clients that don't know their remaining quota can't implement adaptive throttling. Always send `X-RateLimit-Remaining` even when the request succeeds.

**Debug tip:** To test rate limiting: write a loop that sends N+1 requests (where N is your limit) and verify the (N+1)th returns 429 with the correct headers. `for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" https://api.example.com/users; done` — the 11th request (with a limit of 10) should print `429`. Test that the `Retry-After` header is correct by waiting that many seconds and verifying the next request succeeds.

## Challenge: apiMiddlewarePipeline

Implement a middleware pipeline that applies auth and rate limiting.

```challenge
function createApiMiddleware(options) {
  // options: { rateLimitPerMinute: number, requireAuth: boolean }
  //
  // Returns: async function middleware(request) → response
  //
  // request shape: {
  //   path: string,
  //   method: string,
  //   headers: { authorization?: string, 'idempotency-key'?: string },
  //   body: any,
  //   ip: string,
  // }
  //
  // MIDDLEWARE LOGIC (in order):
  //
  // 1. RATE LIMIT CHECK:
  //    Track call count per IP in a plain object (simulated in-memory store).
  //    If ip has been called more than options.rateLimitPerMinute times:
  //      return { status: 429, body: { error: { code: 'RATE_LIMIT_EXCEEDED' } } }
  //
  // 2. AUTH CHECK (if options.requireAuth is true):
  //    Check request.headers.authorization starts with 'Bearer '
  //    If missing or invalid format:
  //      return { status: 401, body: { error: { code: 'AUTHENTICATION_REQUIRED' } } }
  //
  // 3. PASS THROUGH:
  //    If all checks pass: return { status: 200, body: { ok: true } }
  //
  // The in-memory store must persist across calls to the returned middleware.
}
```

```test
// Rate limiting
const limited = createApiMiddleware({ rateLimitPerMinute: 2, requireAuth: false })
const req = { path: '/users', method: 'GET', headers: {}, body: null, ip: '1.2.3.4' }

const r1 = await limited(req)
assert r1.status === 200
const r2 = await limited(req)
assert r2.status === 200
const r3 = await limited(req)
assert r3.status === 429
assert r3.body.error.code === 'RATE_LIMIT_EXCEEDED'

// Different IP is not rate-limited
const r4 = await limited({ ...req, ip: '5.6.7.8' })
assert r4.status === 200

// Auth required: no token
const authed = createApiMiddleware({ rateLimitPerMinute: 100, requireAuth: true })
const noAuth = await authed({ ...req, ip: '9.9.9.9', headers: {} })
assert noAuth.status === 401
assert noAuth.body.error.code === 'AUTHENTICATION_REQUIRED'

// Auth required: valid Bearer token
const withAuth = await authed({
  ...req, ip: '10.0.0.1',
  headers: { authorization: 'Bearer valid-token-123' }
})
assert withAuth.status === 200
```
