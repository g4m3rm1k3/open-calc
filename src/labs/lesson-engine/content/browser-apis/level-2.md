---
series: browser-apis
level: 2
title: Fetch — Network Requests in the Browser
lang: javascript
---

# Fetch — Network Requests in the Browser

The Fetch API is the browser's interface for making HTTP requests from JavaScript. It replaced XMLHttpRequest (XHR), which was verbose and callback-based, with a Promise-based API that integrates naturally with async/await. Every modern browser application that communicates with an API uses Fetch.

Understanding Fetch means understanding HTTP: requests have methods (GET, POST, PUT, DELETE, PATCH), headers, and bodies; responses have status codes, headers, and bodies. Fetch exposes all of these explicitly. By the end of this lesson you will be able to make authenticated requests, handle errors correctly, send and receive JSON, upload files, and reason about Fetch's abort mechanism.

## A basic Fetch request

```javascript
// GET request — fetches JSON from a URL:
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`)
  // response: a Response object — it does NOT contain the body yet.
  // The body is a stream that must be read explicitly.

  if (!response.ok) {
    // response.ok is true for status 200–299; false for 4xx, 5xx.
    // Fetch does NOT throw on HTTP errors — it only throws on network failures.
    throw new Error(`HTTP ${response.status}: failed to load user ${id}`)
  }

  const user = await response.json()   // reads and parses the JSON body
  return user
}
```

```text
response properties:
  response.ok:       boolean — true if status is 200–299
  response.status:   number — HTTP status code (200, 404, 500, etc.)
  response.headers:  Headers object — iterate or get specific headers
  response.url:      string — the final URL (after redirects)

response body-reading methods (each returns a Promise):
  response.json()   → parses body as JSON, returns the parsed value
  response.text()   → reads body as a string
  response.blob()   → reads body as a Blob (binary data — images, files)
  response.arrayBuffer() → reads body as ArrayBuffer (raw binary)
  
IMPORTANT: the body can only be read ONCE. After calling response.json(),
  the stream is consumed. Calling response.text() afterwards throws.
  If you need to read the body twice: const text = await response.text(); JSON.parse(text).
```

## Sending data: POST with JSON

```javascript
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',   // tells server the body is JSON
      'Authorization': `Bearer ${getToken()}`,  // authentication token
    },
    body: JSON.stringify(userData),         // serialise the object to JSON string
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorBody.message ?? `HTTP ${response.status}`)
  }

  return response.json()
}
```

```text
Fetch options:
  method:   'GET' (default), 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'
  headers:  object or Headers instance — key-value pairs sent with the request
  body:     request body — for POST/PUT/PATCH
            JSON.stringify(obj) for JSON
            FormData for form submissions and file uploads
            Blob or ArrayBuffer for binary data
            URLSearchParams for URL-encoded forms
  
Content-Type header:
  'application/json'     — body is JSON
  'multipart/form-data'  — DO NOT SET for FormData (browser sets it with the boundary)
  'application/x-www-form-urlencoded' — URL-encoded form data (URLSearchParams)
```

## Aborting requests with AbortController

Long-running requests or requests that are no longer needed (the user navigated away) should be cancelled.

```javascript
// AbortController — abort a fetch request
async function loadWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController()

  // Auto-cancel after timeoutMs:
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)   // request completed — cancel the timeout
    return response.json()
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`)
    }
    throw err   // network error — re-throw
  }
}
```

```text
AbortController:
  controller.signal: an AbortSignal object, passed to fetch as { signal }.
  controller.abort(): triggers the abort. The fetch Promise rejects with AbortError.
  err.name === 'AbortError': distinguishes an abort from a network error.

Use cases for AbortController:
  → Timeout: cancel if the request takes too long.
  → Navigation: cancel pending requests when the user navigates away.
  → Superseded: cancel a previous search request when the user types a new query.
    (Only the latest search result matters; cancel earlier ones to avoid race conditions.)
```

## Handling errors completely

Fetch has three error categories that require separate handling:

```javascript
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)

    // Category 1: HTTP error (4xx, 5xx) — fetch does NOT throw, must check manually
    if (!response.ok) {
      const body = await response.text()
      throw Object.assign(new Error(`HTTP ${response.status}`), {
        status: response.status,
        body,
      })
    }

    return response

  } catch (err) {
    // Category 2: Network failure (offline, DNS failure, CORS blocked)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network error: could not reach the server', { cause: err })
    }

    // Category 3: Abort
    if (err.name === 'AbortError') {
      throw new Error('Request was cancelled', { cause: err })
    }

    // Category 1 re-throw (the HTTP error from above) or other unexpected errors
    throw err
  }
}
```

```text
ERROR CATEGORY SUMMARY:
  Network failure → fetch() throws TypeError ("Failed to fetch", "NetworkError when attempting to fetch")
  CORS blocked    → fetch() throws TypeError (looks like a network error, checked in console)
  HTTP error      → fetch() resolves normally; response.ok === false; response.status is 4xx/5xx
  Abort           → fetch() throws AbortError

The most common mistake: checking only for exceptions and missing HTTP errors.
A 404 or 500 response does not throw — it resolves with response.ok === false.
```

**CS lens:** The Fetch API uses the **streaming** model for response bodies: rather than loading the entire response into memory before exposing it, the browser provides the body as a ReadableStream. Calling `response.json()` or `response.text()` reads from this stream and collects the bytes until the stream ends. This design allows large responses (files, long API responses) to be processed incrementally without allocating the full content in memory. For small API responses, the difference is invisible — but for file downloads or large JSON objects, streaming enables handling data larger than available RAM.

**SE lens:** The pattern of separating the Fetch call from the data-processing logic (the `safeFetch` wrapper pattern) is standard practice in production code. The wrapper handles the error categories uniformly; the callers only deal with resolved data or structured errors. This is the same separation-of-concerns principle from software construction: the infrastructure concern (HTTP, error handling) is separate from the business concern (what to do with the user data).

**Common mistakes:**
- Not checking `response.ok` — treating a 404 or 500 response as success because no exception was thrown. Always check `response.ok` or `response.status`.
- Setting `Content-Type: multipart/form-data` manually when using FormData — the browser sets this header automatically with the correct boundary string. Setting it manually breaks the boundary.
- Not aborting requests when navigating away in single-page applications — pending requests may resolve after the component that launched them is unmounted, causing "setState on an unmounted component" errors.

**Debug tip:** When Fetch returns unexpected results, open the Network tab in DevTools, find the request, and check: Status (HTTP status code), Response headers (Content-Type, CORS headers), Preview (parsed response body), and Timing (how long it took). The Network tab shows the full request and response without any JavaScript parsing — it is ground truth for what was actually sent and received.

## Challenge: fetch_with_error_handling

Implement a function that fetches paginated data and handles all error categories.

```challenge
async function fetchPage(baseUrl, page, abortSignal) {
  // Makes a GET request to: baseUrl + '?page=' + page
  // Pass abortSignal to fetch as { signal: abortSignal }
  // Returns: parsed JSON on success
  // Throws: Error with message 'HTTP <status>' for HTTP errors
  // Throws: Error with message 'cancelled' for aborts
  // Throws: Error with message 'network error' for network failures (TypeError from fetch)
}
```

```test
// Mock fetch for testing:
const responses = {
  'ok':       { ok: true,  status: 200, json: async () => ({ items: [1,2,3], page: 1 }) },
  'notfound': { ok: false, status: 404, text: async () => 'not found' },
}

global.fetch = async (url, opts) => {
  if (opts?.signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' })
  if (url.includes('page=1')) return responses['ok']
  if (url.includes('page=99')) return responses['notfound']
  throw new TypeError('Failed to fetch')
}

const data = await fetchPage('https://api.example.com/items', 1, null)
assert data.items.length === 3

let threw = false
try { await fetchPage('https://api.example.com/items', 99, null) } catch (e) {
  threw = true
  assert e.message.includes('404')
}
assert threw

const ctrl = new AbortController()
ctrl.abort()
threw = false
try { await fetchPage('https://api.example.com/items', 1, ctrl.signal) } catch(e) {
  threw = true
  assert e.message === 'cancelled'
}
assert threw
```
