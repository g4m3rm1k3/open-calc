# Concept: The `fetch` API

**What you'll understand by the end:** how a browser starts a real HTTP request from JavaScript, and why the result arrives as a Promise rather than a direct return value.

**Prerequisites:** `http-request-response.md`, `javascript-promises-async.md`.

## Setup

Any modern browser. Needs a real HTTP server to fetch from — the example below assumes a minimal one is running locally (see `http-request-response.md`'s Setup for how to start one) on port 8000.

## The Problem

JavaScript running in a browser needs a way to start an HTTP request and eventually get the response, without freezing the page while the network round-trip happens.

## The Isolated Example

Against a locally running server (see Setup):
```javascript
fetch("http://127.0.0.1:8000/")
  .then((response) => {
    console.log("got a response object immediately:", response.status);
    return response.text();
  })
  .then((body) => console.log("body:", body));

console.log("this line runs before either .then above");
```

**Real output (browser console):**
```
this line runs before either .then above
got a response object immediately: 200
body: hello from the server
```

**What this proves:** the synchronous `console.log` after the `fetch` call printed *first*, before either `.then` callback — `fetch` did not pause the program waiting for the network. It returned immediately with a pending Promise; the actual response arrived later, out of the normal top-to-bottom order.

## Mechanical Walkthrough

- `fetch(url)` is a function built into every modern browser (not imported — part of the environment a browser provides) that starts an HTTP request and immediately returns a Promise.
- That Promise resolves once the response's *headers* have arrived — not once the body is fully read. This is why reading the body (`response.text()`, or `response.json()` for JSON) is a *second* asynchronous step, itself returning another Promise, rather than something `fetch` hands back directly.
- `response.status` is available synchronously the moment the first Promise resolves — it's part of the headers, already known before the body is read.

## CS Lens

`fetch` is a concrete instance of `javascript-promises-async.md`'s general shape, specialized for network I/O — starting a slow operation (a network round trip) and returning a Promise standing in for its eventual result.

Also recognized in: every HTTP client library in every language (Python's `requests`, older JavaScript's `XMLHttpRequest`, which `fetch` was designed to replace with a Promise-based API instead of callbacks).

## SE Lens

When the calling page and the requested URL share the same origin (protocol, domain, and port all match), `fetch` works with zero extra configuration. The moment they differ — a frontend on one port fetching from a backend on another — the request becomes **cross-origin**, and a browser security mechanism called CORS blocks it by default until the server explicitly allows that origin. This is a deliberate browser security boundary, not a `fetch` limitation to work around casually — it exists specifically to stop a malicious page from silently reading data from another site a victim happens to be logged into.

## Connection

Builds on `http-request-response.md` (what's actually sent/received) and `javascript-promises-async.md` (the return type). Commonly paired with `json-stringify.md`'s reverse operation, `response.json()`, when the body is JSON rather than plain text.

## Try It Yourself

1. Fetch a path that doesn't exist on your local server (e.g. `/nope`) and log `response.status`. Confirm the Promise still *resolves* (not rejects) with a `404` — `fetch` only rejects on genuine network failure, not on an HTTP error status, a real, easy-to-miss detail.
2. Stop the local server entirely, then run the same `fetch` call. Confirm the Promise now rejects, and add a `.catch(...)` to observe the real error.
3. Fetch the same URL from a page served on a different port (start a second, trivial static file server on another port and open a page from it). Observe the real CORS error in the browser console when no `Access-Control-Allow-Origin` header is present on the response.
