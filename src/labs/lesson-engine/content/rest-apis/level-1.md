---
series: rest-apis
level: 1
title: HTTP Status Codes and Error Handling
lang: javascript
---

# HTTP Status Codes and Error Handling

Status codes are the language HTTP uses to describe the outcome of a request. A status code is a three-digit number in the response that tells the client whether the request succeeded, failed, was redirected, or produced some other outcome. The client can react to status codes without reading the body — a 404 means "not found" in any language, for any API.

Good REST API design uses status codes precisely: the right code for the right situation. Returning `200 OK` for an error (with `{ "success": false }` in the body) forces clients to parse the body just to know if the request succeeded — it breaks every HTTP client, cache, and monitoring system that understands status codes. By the end of this lesson you will know which status codes to use in which situations and how to structure error responses consistently.

## The five status code classes

```text
CLASS   RANGE     MEANING
──────────────────────────────────────────────────────────────
1xx     100–199   Informational: the request is being processed (rarely used)
2xx     200–299   Success: the request was received, understood, and accepted
3xx     300–399   Redirection: further action is needed to complete the request
4xx     400–499   Client error: the request was malformed or unauthorised
5xx     500–599   Server error: the server failed to fulfil a valid request

The key rule: 4xx is the CLIENT'S fault. 5xx is the SERVER'S fault.
This distinction matters for error logging, alerting, and retry logic.
  → 4xx: don't retry (the same request will fail again unless the client changes it)
  → 5xx: may retry (the server may recover; use exponential backoff)
```

## The most important status codes

```text
2xx SUCCESS:
  200 OK              — The standard success response. GET, PATCH, PUT responses.
  201 Created         — A new resource was created. POST responses. Include Location header.
  204 No Content      — Success with no response body. DELETE responses.
  
  201 must include a Location header pointing to the new resource:
    Location: /users/42
  
  201 should include the created resource in the body:
    { "id": 42, "email": "alice@example.com", "name": "Alice" }

3xx REDIRECTION:
  301 Moved Permanently  — Resource has a new permanent URL. Update your links.
  302 Found             — Temporary redirect. Use for short-lived URL changes.
  304 Not Modified      — Response is unchanged; client should use its cache.

4xx CLIENT ERRORS:
  400 Bad Request       — Malformed syntax, missing required field, invalid value.
                         "Your request is broken."
  401 Unauthorized      — Authentication required. No token, or token expired.
                         "I don't know who you are."
                         (Despite the name, this is about AUTHENTICATION, not authorisation.)
  403 Forbidden         — Authenticated but not permitted. Wrong role or permissions.
                         "I know who you are, but you can't do this."
  404 Not Found         — Resource doesn't exist at this URL.
  405 Method Not Allowed — Method (GET/POST/etc.) is not supported for this URL.
  409 Conflict          — Request conflicts with current state. Duplicate resource.
                         "This email is already registered."
  422 Unprocessable     — Syntactically valid but semantically invalid. Validation failed.
                         "Your JSON is valid but the data doesn't make sense."
  429 Too Many Requests — Rate limit exceeded. Include Retry-After header.

5xx SERVER ERRORS:
  500 Internal Server Error — Unexpected server-side failure. Generic catch-all.
  502 Bad Gateway           — Upstream server returned an invalid response.
  503 Service Unavailable   — Server is temporarily down or overloaded.
  504 Gateway Timeout       — Upstream server timed out.
```

```text
401 vs 403 — the most commonly confused:

  REQUEST: GET /admin/users
  
  No Authorization header at all:
    → 401 Unauthorized
    → "Send me credentials and I'll decide if you can access this."
    → Response should include: WWW-Authenticate: Bearer realm="API"
  
  Authorization: Bearer <valid-token-for-regular-user>
    → 403 Forbidden
    → "I know you're Alice. Alice isn't allowed to see admin users."
    → No point asking for credentials — credentials are fine, role is wrong.
  
  Authorization: Bearer <admin-token>
    → 200 OK (if the user is an admin)
    
  Using 401 when you mean 403 causes clients to re-authenticate when they
  don't need to — their credentials are fine; their permissions aren't.
```

**CS lens:** Status codes are a **discriminated union** (also called a tagged union or variant type) at the protocol level. The first digit tags the response with its class (success/redirect/client-error/server-error), and the remaining two digits specify the case within that class. Any code that processes HTTP responses can branch on the first digit before inspecting the full code: `if (status >= 400) { handle error }`. This is the same pattern as TypeScript's discriminated unions (`{ type: 'error', message: string } | { type: 'success', data: T }`) — the tag (type/first-digit) narrows the possible values.

## Consistent error response format

Every error response should return a structured body in a consistent format so that clients can parse errors programmatically.

```javascript
// CONSISTENT ERROR FORMAT — the same structure for every error in your API
// This lets clients write a single error handler for all cases

// Pattern: { error: { code, message, details? } }
// code: a machine-readable string (not the HTTP status number)
// message: a human-readable explanation
// details: optional array of per-field errors for validation failures

// 400 Bad Request — missing required field
{
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "The 'email' field is required.",
    "details": [
      { "field": "email", "issue": "required" }
    ]
  }
}

// 401 Unauthorized — no token
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Include a Bearer token in the Authorization header."
  }
}

// 404 Not Found
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "No user with id 42 exists."
  }
}

// 422 Validation error — multiple field errors
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request data failed validation.",
    "details": [
      { "field": "email",    "issue": "invalid_format", "value": "not-an-email" },
      { "field": "password", "issue": "too_short", "min": 8, "actual": 4 }
    ]
  }
}
```

```javascript
// EXPRESS IMPLEMENTATION: consistent error handler middleware
function createApiError(status, code, message, details = null) {
  const error = { error: { code, message } }
  if (details) error.error.details = details
  const err = new Error(message)
  err.status = status
  err.body = error
  return err
}

// Usage in route handlers:
app.get('/users/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return next(createApiError(400, 'INVALID_ID', 'User ID must be a positive integer'))
  }

  const user = await db.query('SELECT * FROM users WHERE id = ?', [id])
  if (!user) {
    return next(createApiError(404, 'USER_NOT_FOUND', `No user with id ${id} exists.`))
  }

  res.json(user)
})

// Centralized error handler: one place for all error responses
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  const body = err.body ?? {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.'
      // Never expose internal error details (stack traces, SQL errors) to clients
    }
  }
  // Log the real error internally for debugging
  if (status >= 500) console.error(err)
  res.status(status).json(body)
})
```

```text
ERROR RESPONSE RULES:

  NEVER return 200 with an error body:
    ✗ { "status": 200, "success": false, "error": "User not found" }
    ✓ HTTP 404 + { "error": { "code": "USER_NOT_FOUND", "message": "..." } }

  NEVER expose internal details:
    ✗ { "error": "SQL error: column 'pasword_hash' not found in table 'users'" }
    ✓ { "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred." } }
    Log the SQL error server-side. Return a generic message to the client.

  ALWAYS be consistent:
    If one endpoint returns { "error": { "code": "..." } },
    every endpoint must return the same format.
    Inconsistent errors force clients to handle multiple formats.

  VALIDATION ERRORS should list all failures at once:
    Don't return the first validation error and make the client fix it and retry.
    Return all validation errors in one response in the details array.
```

**SE lens:** The centralised error handler is an application of the **Don't Repeat Yourself (DRY) principle** to error formatting. Without a central handler, each route would need to call `res.status(404).json({ error: ... })` — and the format would drift as different developers write it slightly differently. The central handler guarantees consistency with one function. This is the same pattern as React's `ErrorBoundary`, Python's `except` at the framework level, and Java's `@ExceptionHandler` in Spring.

**Common mistakes:**
- Returning 500 for everything — use the most specific 4xx code for client errors. A bad request body is 400 or 422, not 500. A 500 for a client error tells the client "retry later" when they should "fix your request."
- Returning 200 for errors — this breaks HTTP clients, monitoring systems (which alert on 5xx rates), load balancers (which may route away from 5xx servers), and any tool that understands HTTP. Use the correct status code.
- Missing error details for validation — returning `{ "error": "invalid input" }` with no field information forces the client to guess which field is wrong. Always include field-level details for 400/422 responses.

**Debug tip:** To see exactly what status code an API returns: `curl -s -o /dev/null -w "%{http_code}" https://api.example.com/users/99`. The `-o /dev/null` discards the body, and `-w "%{http_code}"` prints only the status code. This is useful in scripts. In a browser, DevTools Network tab shows the status code next to each request as a number in a coloured badge (green for 2xx, red for 4xx/5xx).

## Challenge: statusCodeRouter

Return the correct status code and error structure for each scenario.

```challenge
function resolveRequest(scenario) {
  // Returns: { status: number, body: object }
  //
  // Scenarios:
  //   'get-existing-user'   → 200, body: { id: 42, name: 'Alice' }
  //   'create-user'         → 201, body: { id: 43, name: 'Bob' }, headers: { Location: '/users/43' }
  //   'delete-user'         → 204, body: null
  //   'user-not-found'      → 404, body: { error: { code: 'USER_NOT_FOUND', message: string } }
  //   'missing-email-field' → 400, body: { error: { code: 'MISSING_REQUIRED_FIELD', ... } }
  //   'no-auth-token'       → 401, body: { error: { code: 'AUTHENTICATION_REQUIRED', ... } }
  //   'wrong-role'          → 403, body: { error: { code: 'FORBIDDEN', ... } }
}
```

```test
const get = resolveRequest('get-existing-user')
assert get.status === 200
assert get.body.id === 42
assert get.body.name === 'Alice'

const create = resolveRequest('create-user')
assert create.status === 201
assert create.body.id === 43

const del = resolveRequest('delete-user')
assert del.status === 204
assert del.body === null

const notFound = resolveRequest('user-not-found')
assert notFound.status === 404
assert notFound.body.error.code === 'USER_NOT_FOUND'
assert typeof notFound.body.error.message === 'string'

const missingField = resolveRequest('missing-email-field')
assert missingField.status === 400
assert missingField.body.error.code === 'MISSING_REQUIRED_FIELD'

const noAuth = resolveRequest('no-auth-token')
assert noAuth.status === 401

const forbidden = resolveRequest('wrong-role')
assert forbidden.status === 403
```
