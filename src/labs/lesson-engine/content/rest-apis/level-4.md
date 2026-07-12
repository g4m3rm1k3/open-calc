---
series: rest-apis
level: 4
title: REST APIs — Putting It Together
lang: javascript
---

# REST APIs — Putting It Together

You have covered REST's architectural constraints and HTTP mapping, status codes and error handling, request/response design (pagination, filtering, versioning), and authentication with rate limiting. This capstone lesson integrates all four into a complete, production-ready API design.

## The scenario

Design a product catalog API with these requirements:
- Products can be listed (paginated, filtered, sorted) and retrieved individually
- New products can be created by authenticated admin users
- Products can be updated (name, price, description) by admin users
- All endpoints respect rate limits
- Error responses are consistent throughout

## The complete API specification

```text
BASE URL:   /api/v1
AUTH:       Bearer token (JWT). Required for POST, PUT, PATCH, DELETE.
RATE LIMIT: 100 requests per 15 minutes per IP (unauthenticated)
            1000 requests per 15 minutes per authenticated user

ENDPOINTS:

GET  /api/v1/products
  Query params: category, min_price, max_price, sort (name|price|created_at), order (asc|desc),
                limit (1–100, default 20), cursor (pagination cursor)
  Auth: optional (public endpoint)
  Response 200:
    { "data": [...products], "pagination": { "hasNextPage", "cursor", "limit" } }

GET  /api/v1/products/:id
  Auth: optional
  Response 200: { "data": { product } }
  Response 404: { "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }

POST /api/v1/products
  Auth: required (role: admin)
  Headers: Idempotency-Key: <uuid>
  Body: { "name": string, "price": number, "category": string, "description"?: string }
  Response 201: { "data": { product }, "links": { "self": "/api/v1/products/:id" } }
  Response 400: missing/invalid fields
  Response 401: no/invalid token
  Response 403: authenticated but not admin
  Response 409: idempotency key reuse with different body

PUT  /api/v1/products/:id
  Auth: required (role: admin)
  Body: { "name": string, "price": number, "category": string, "description"?: string }
  Response 200: { "data": { product } }
  Response 404: product not found

DELETE /api/v1/products/:id
  Auth: required (role: admin)
  Response 204: (no body)
  Response 404: product not found
```

## Implementation trace: GET /api/v1/products

```text
REQUEST: GET /api/v1/products?category=electronics&sort=price&order=asc&limit=10

LAYER 1 — RATE LIMIT CHECK:
  client IP: 203.0.113.45
  window: last 15 minutes
  count: 42 (of 100 allowed)
  → allowed. Set headers:
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 57
    X-RateLimit-Reset: 1720793400

LAYER 2 — AUTH CHECK:
  No Authorization header — this is a public endpoint. Skip auth check.

LAYER 3 — INPUT VALIDATION:
  category: 'electronics' → valid string
  sort: 'price' → in whitelist ['name', 'price', 'created_at'] → valid
  order: 'asc' → in ['asc', 'desc'] → valid
  limit: 10 → parseInt(10) = 10, clamp to [1, 100] → valid
  cursor: null → first page

LAYER 4 — DATABASE QUERY:
  SELECT id, name, price, category, description, created_at
  FROM products
  WHERE category = 'electronics'      -- parameterised: category value
  ORDER BY price ASC                   -- sort: whitelisted; order: validated
  LIMIT 11                             -- limit+1 to detect if there is a next page

LAYER 5 — RESPONSE:
  Got 11 rows → hasNextPage: true
  Return first 10. Encode cursor from row 10: btoa(JSON.stringify({ lastId: row10.id }))
  
  {
    "data": [
      { "id": "3", "name": "USB-C Cable", "price": 9.99, "category": "electronics" },
      ... (10 items total)
    ],
    "pagination": {
      "hasNextPage": true,
      "cursor": "eyJsYXN0SWQiOiI0MiJ9",
      "limit": 10
    }
  }
```

## Implementation trace: POST /api/v1/products

```text
REQUEST: POST /api/v1/products
Authorization: Bearer eyJhbGci...
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Body: { "name": "Wireless Keyboard", "price": 79.99, "category": "electronics" }

LAYER 1 — RATE LIMIT:
  Authenticated user id: 7. Per-user limit: 1000/15min. Count: 3.
  → allowed.

LAYER 2 — AUTHENTICATION:
  Header: 'Bearer eyJhbGci...'
  jwt.verify() → { userId: 7, role: 'admin', exp: 1720796000 }
  Current time: 1720792400. Not expired.
  req.user = { id: 7, role: 'admin' }

LAYER 3 — AUTHORISATION:
  req.user.role === 'admin' → allowed.

LAYER 4 — IDEMPOTENCY CHECK:
  Key: '550e8400-e29b-41d4-a716-446655440000'
  cache.get('idempotency:550e8400-...') → null (first request)
  Proceed.

LAYER 5 — INPUT VALIDATION:
  name: 'Wireless Keyboard' → string, length 1–200 → valid
  price: 79.99 → number, > 0 → valid
  category: 'electronics' → string → valid
  description: undefined → optional, absent → OK

LAYER 6 — DATABASE INSERT:
  INSERT INTO products (name, price, category, description, created_at)
  VALUES (?, ?, ?, ?, NOW())
  params: ['Wireless Keyboard', 79.99, 'electronics', null]
  → id: 'p-99'

LAYER 7 — CACHE IDEMPOTENCY RESULT:
  cache.set('idempotency:550e8400-...', { id: 'p-99', name: '...', ... }, 86400)

LAYER 8 — RESPONSE:
  201 Created
  Location: /api/v1/products/p-99
  {
    "data": { "id": "p-99", "name": "Wireless Keyboard", "price": 79.99, ... },
    "links": { "self": "/api/v1/products/p-99" }
  }
```

## The middleware stack

```javascript
// THE FULL MIDDLEWARE STACK for the products router
// Each middleware is a decorator on the request/response pipeline (Decorator pattern)

const express = require('express')
const router = express.Router()

// Middleware applied to ALL routes in this router:
router.use(rateLimitMiddleware({ limit: 100, windowMs: 15 * 60 * 1000 }))

// PUBLIC routes (no auth required):
router.get('/',    listProducts)
router.get('/:id', getProduct)

// PROTECTED routes (auth + admin role required):
router.post('/',    requireAuth, requireRole('admin'), idempotencyMiddleware, createProduct)
router.put('/:id',  requireAuth, requireRole('admin'), updateProduct)
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct)

// Route handlers delegate to service functions — they don't contain business logic
async function listProducts(req, res, next) {
  try {
    const filters = extractFilters(req.query)   // validates + sanitises query params
    const result = await productService.list(filters)
    res.json(result)
  } catch (err) {
    next(err)   // passes to central error handler
  }
}

async function createProduct(req, res, next) {
  try {
    const data = validateProductBody(req.body)  // validates + throws 400 on failure
    const product = await productService.create(data)
    res.status(201)
      .setHeader('Location', `/api/v1/products/${product.id}`)
      .json({ data: product, links: { self: `/api/v1/products/${product.id}` } })
  } catch (err) {
    next(err)
  }
}
```

## Validation helper

```javascript
function validateProductBody(body) {
  const errors = []

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push({ field: 'name', issue: 'required', message: 'Name is required' })
  }
  if (typeof body.name === 'string' && body.name.length > 200) {
    errors.push({ field: 'name', issue: 'too_long', max: 200, actual: body.name.length })
  }
  if (body.price === undefined || body.price === null) {
    errors.push({ field: 'price', issue: 'required', message: 'Price is required' })
  }
  if (typeof body.price !== 'number' || body.price <= 0 || !isFinite(body.price)) {
    errors.push({ field: 'price', issue: 'invalid', message: 'Price must be a positive number' })
  }
  if (!body.category || typeof body.category !== 'string') {
    errors.push({ field: 'category', issue: 'required', message: 'Category is required' })
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed')
    err.status = 422
    err.body = { error: { code: 'VALIDATION_FAILED', message: 'Request data is invalid.', details: errors } }
    throw err
  }

  return {
    name: body.name.trim(),
    price: body.price,
    category: body.category.trim().toLowerCase(),
    description: body.description?.trim() ?? null,
  }
}
```

**CS lens:** The middleware stack is the **chain of responsibility** pattern — a request passes through a sequence of handlers (rate limiter → auth → role check → idempotency → handler), where each handler either processes the request or passes it to the next. This is functionally identical to Unix pipes: each middleware transforms the request/response and hands it on. The key property: each middleware knows only its own concern and delegates to `next()` for everything else. This makes each middleware independently testable and composable into different stacks for different route groups.

**SE lens:** The validation helper collects ALL validation errors before throwing — it doesn't return on the first failure. This is the **fail-fast vs fail-complete** trade-off applied to user experience: a client that gets one error, fixes it, re-submits, gets another error, fixes it, re-submits... is frustrated. A client that gets all errors in one response can fix everything at once. This is also why forms show all validation errors simultaneously, not one at a time.

**Common mistakes in REST API design:**
- Route handlers that contain business logic — a 100-line route handler is a service function that doesn't know it's a service. Route handlers should do three things: extract inputs from the request, call a service function, format the response. Business logic belongs in the service layer, which is independently testable.
- Missing CORS headers — when the API and the frontend are on different origins, the browser will block API responses unless the server includes `Access-Control-Allow-Origin` headers. This is a browser security feature; it doesn't affect `curl` or mobile apps. Every REST API that serves browser clients needs CORS configured.
- No request logging — without logging every request's method, URL, status code, and duration, production debugging is guesswork. `[2026-07-12 14:32:01] GET /api/v1/products 200 45ms ip=203.0.113.45` is invaluable when investigating a performance issue or attack.

## Challenge: productApiUtils

Implement core utility functions for the product API.

```challenge
function extractFilters(queryParams) {
  // queryParams: object with optional keys: category, min_price, max_price,
  //              sort, order, limit, cursor
  //
  // Returns a sanitised filters object:
  //   {
  //     category: string | null,
  //     minPrice: number | null,
  //     maxPrice: number | null,
  //     sort: 'name' | 'price' | 'created_at',   (default: 'created_at')
  //     order: 'asc' | 'desc',                    (default: 'desc')
  //     limit: number,                             (clamped to 1–100, default: 20)
  //     cursor: string | null,
  //   }
  //
  // Whitelist: sort must be one of ['name', 'price', 'created_at'] (default: 'created_at')
  //            order must be one of ['asc', 'desc'] (default: 'desc')
  //            limit: parseInt, clamp to [1, 100], default 20
  //            min_price / max_price: parseFloat, null if NaN
}

function buildProductResponse(product) {
  // product: { id, name, price, category, description, created_at }
  // Returns the public API representation:
  //   {
  //     data: {
  //       id: string (convert to string),
  //       name: string,
  //       price: number,
  //       category: string,
  //       description: string | null,
  //       createdAt: string (rename created_at → camelCase)
  //     },
  //     links: { self: '/api/v1/products/<id>' }
  //   }
}
```

```test
// extractFilters: defaults
const f1 = extractFilters({})
assert f1.sort === 'created_at'
assert f1.order === 'desc'
assert f1.limit === 20
assert f1.cursor === null
assert f1.category === null

// extractFilters: valid values
const f2 = extractFilters({ sort: 'price', order: 'asc', limit: '10', category: 'electronics', min_price: '5.99' })
assert f2.sort === 'price'
assert f2.order === 'asc'
assert f2.limit === 10
assert f2.category === 'electronics'
assert f2.minPrice === 5.99

// extractFilters: invalid sort falls back to default
const f3 = extractFilters({ sort: 'malicious_column', limit: '200' })
assert f3.sort === 'created_at'
assert f3.limit === 100   // clamped to max 100

// buildProductResponse: correct transformation
const product = { id: 42, name: 'USB-C Cable', price: 9.99, category: 'electronics', description: null, created_at: '2026-01-01T00:00:00Z' }
const resp = buildProductResponse(product)
assert resp.data.id === '42'
assert resp.data.name === 'USB-C Cable'
assert resp.data.createdAt === '2026-01-01T00:00:00Z'
assert !('created_at' in resp.data)
assert resp.links.self === '/api/v1/products/42'
assert resp.data.description === null
```
