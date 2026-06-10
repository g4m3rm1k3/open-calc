# Drill 3.6 — CORS: Why the Browser Blocks Your Request

**Standalone drill. No prerequisites except basic Python and JavaScript.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ with Flask — `pip install flask flask-cors`
**What you will build:** A frontend on port 5173 and an API on port 5000. Demonstrate the blocked request, add correct CORS headers, trigger a preflight request, then show what misconfigured CORS looks like.
**What you will understand:** Why the browser blocks cross-origin requests, what CORS actually is, and why `Access-Control-Allow-Origin: *` is sometimes a security hole

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. CORS is enforced by the browser. What does this mean for a Python script using `requests` or a `curl` command — do they also enforce CORS?

2. Your API is at `https://api.example.com`. Your frontend is at `https://app.example.com`. Are these the same origin? What are the three components that define "origin"?

3. `Access-Control-Allow-Origin: *` allows any origin to call your API. Why is this a security problem for an API that uses session cookies or Authorization headers?

4. What triggers a CORS preflight request? What HTTP method does the preflight use?

*(Answers at the bottom.)*

---

## The Concept: Same-Origin Policy and CORS

### Concept: The Same-Origin Policy

**What it is:**
The Same-Origin Policy (SOP) is a browser security rule: JavaScript on `origin-A.com` cannot make requests to `origin-B.com` and read the response, unless `origin-B.com` explicitly allows it. This prevents a malicious website from using your browser to make authenticated requests to your bank.

**Why it exists — the attack it prevents:**
```
You visit evil.com.
evil.com's JavaScript runs in your browser — with your cookies, your session.
Without SOP:
    evil.com JS: fetch("https://bank.com/transfer", {method:"POST", body:"send $1000 to attacker"})
    Your browser sends the request WITH YOUR COOKIES (because cookies are automatic).
    bank.com processes the transfer — it looks legitimate, your session cookie proves it's you.
```

With SOP, `evil.com`'s JavaScript cannot initiate cross-origin requests that read the response (with a few exceptions). This is the browser's defense against Cross-Site Request Forgery (CSRF) and cross-origin data theft.

**The problem for legitimate use:**
Your frontend (`https://app.example.com`) legitimately needs to call your own API (`https://api.example.com`). Different subdomains = different origins. SOP blocks it. CORS is the mechanism for your API to say "I trust this origin — let it through."

**What CORS is:**
CORS (Cross-Origin Resource Sharing) is not a security feature — it is a controlled relaxation of SOP. The server adds response headers that tell the browser: "I permit this origin to read my responses." Without these headers, the browser blocks the response (the request is sent, but the browser hides the response from the JavaScript).

**The two request types:**

Simple requests (GET, POST with form-encoded body, no custom headers): the browser sends the request directly and checks the response headers.

Preflighted requests (PUT, DELETE, POST with JSON, or any custom header): the browser first sends an OPTIONS request ("Can I do this?"). If the server responds with appropriate headers, the browser sends the actual request.

**What it hides:**
The browser's internal CORS enforcement. As a developer, you add headers; the browser handles the policy enforcement. You never write the code that blocks or allows requests — the browser does it.

**Canonical example:**
A restaurant with a "no outside food" policy. The same-origin policy is the rule. CORS is the restaurant saying "we allow food from these specific partner kitchens." The restaurant (server) decides which partners (origins) are trusted. The health inspector (browser) enforces the policy by checking the sign (CORS headers) at the door.

**Constraints:**
- CORS is enforced by browsers only — `curl`, `requests`, Postman ignore it entirely
- `*` (allow all origins) cannot be combined with `credentials: true` (cookies/auth headers) — browsers reject this combination
- Preflight responses are cached by the browser for `Access-Control-Max-Age` seconds — reduce preflight overhead
- CORS does not protect your API from server-side callers (non-browser) — CORS is a browser-only mechanism

**Failure modes:**
- Missing CORS headers: your frontend cannot call your API — browser blocks it
- `Access-Control-Allow-Origin: *` with an endpoint that reads session cookies: cookies are not sent with `*` because browsers block credentials with wildcard origins — but if you change to a specific origin with credentials enabled, you've opened authenticated cross-origin access
- Reflecting the Origin header blindly: `Access-Control-Allow-Origin: {whatever Origin header says}` — equivalent to `*` but bypasses the credentials restriction since it's a "specific" origin
- Not including `Access-Control-Allow-Headers` for custom headers: the preflight fails silently with "request header field X-Custom-Header is not allowed by CORS"

**Operational reality:**
CORS errors in the browser console (`Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy`) are one of the most common frontend development frustrations. The fix is always on the server — the browser is doing exactly what it is supposed to. The solution is never to disable CORS in the browser.

**You will see this again in:**
Every full-stack application. Flask-CORS, Django-CORS-Headers, Express's `cors` middleware — all solve this same problem. The configuration options (allowed origins, allowed methods, allowed headers, credentials) are identical across frameworks.

**Watch for:**
Never configure your production API with `Access-Control-Allow-Origin: *` if your API uses session cookies, JWTs in cookies, or relies on any cookie-based authentication. Use the specific allowed origin(s) instead.

---

## Step 1 — See the Blocked Request

Create `api.py`:

```python
# api.py — Flask API on port 5000, NO CORS headers yet
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/api/data", methods=["GET"])
def get_data():
    return jsonify({
        "message": "Hello from the API",
        "user": "alice",
        "secret": "sensitive data that should only reach allowed origins"
    })

@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.get_json()
    return jsonify({"you_sent": data})

if __name__ == "__main__":
    print("API running on port 5000 — no CORS headers configured")
    app.run(port=5000, debug=False)
```

Create `frontend.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>CORS Demo Frontend</title>
</head>
<body>
  <h2>CORS Demo — running on port 5173</h2>

  <button onclick="fetchData()">Fetch Data (will be blocked)</button>
  <button onclick="postData()">POST Data (will be blocked)</button>

  <pre id="output">Results appear here...</pre>

  <script>
    const output = document.getElementById("output");

    async function fetchData() {
      output.textContent = "Fetching...";
      try {
        // This request goes to a DIFFERENT origin (port 5000 vs port 5173)
        // The browser will check if the response has CORS headers
        const response = await fetch("http://localhost:5000/api/data");
        const data = await response.json();
        output.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        // The browser blocked the response — err.message is intentionally vague
        // Open DevTools Network tab to see the actual error
        output.textContent = `Error: ${err.message}\n\nOpen DevTools > Console for the CORS error.`;
      }
    }

    async function postData() {
      output.textContent = "Posting...";
      try {
        // POST with application/json triggers a PREFLIGHT (OPTIONS) request
        // because JSON content type is not a "simple request"
        const response = await fetch("http://localhost:5000/api/echo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hello: "world" })
        });
        const data = await response.json();
        output.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        output.textContent = `Error: ${err.message}\n\nCheck DevTools Network tab for the OPTIONS preflight.`;
      }
    }
  </script>
</body>
</html>
```

Serve `frontend.html` on port 5173:
```bash
# In a second terminal — serve the HTML file on a different port than the API
python -m http.server 5173
```

### SAVE AND TRY

Start the API:
```bash
python api.py
```

Open `http://localhost:5173/frontend.html` in a browser.

Click "Fetch Data". Open **DevTools → Console** (F12).

**Expected error in console:**
```
Access to fetch at 'http://localhost:5000/api/data' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

**Open DevTools → Network tab.** Click the failed request. Notice: the request WAS sent and the server DID respond with 200 — but the browser hid the response from JavaScript because there were no CORS headers.

**Change something:** Use `curl` instead of the browser — CORS is not enforced:
```bash
curl http://localhost:5000/api/data
```
Expected: the full JSON response. CORS only exists in browsers.

---

## Step 2 — Add CORS Headers

Update `api.py` to add CORS support:

```python
# api.py — now with CORS headers
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS: only allow requests from our specific frontend origin
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        # Only allow this specific origin — not '*'
        # This is correct for an API used by one known frontend
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
        # allow_headers: list the headers your API accepts
        # If a request sends a header not in this list, the preflight fails
    }
})

@app.route("/api/data", methods=["GET"])
def get_data():
    return jsonify({
        "message": "Hello from the API",
        "user": "alice",
        "secret": "sensitive data that should only reach allowed origins"
    })

@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.get_json()
    return jsonify({"you_sent": data})

if __name__ == "__main__":
    print("API running on port 5000 — CORS configured for http://localhost:5173")
    app.run(port=5000, debug=False)
```

### SAVE AND TRY

Restart the API and refresh the browser. Click both buttons.

**Expected:** Both requests succeed. The output area shows the JSON response.

**Open DevTools → Network.** Click the POST request. You will see TWO requests: an OPTIONS preflight and the actual POST. The preflight receives:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

The browser sees this, allows the POST, and sends it.

**Change something:** Change the CORS origin to `"http://localhost:9999"` (wrong origin). Restart the API, refresh the browser, click "Fetch Data". The CORS error returns — your frontend is no longer in the allowed list.

---

## Step 3 — Show the Security Problem with `*` and Credentials

Add this to `api.py` temporarily to demonstrate the vulnerability:

```python
# INSECURE EXAMPLE — do not use this configuration
@app.route("/api/secret", methods=["GET"])
def secret():
    # Imagine this checks session cookies for authentication
    return jsonify({"sensitive": "account balance: $10,000"})
```

And add to `frontend.html`:
```javascript
async function fetchSecret() {
    const response = await fetch("http://localhost:5000/api/secret", {
        credentials: "include"  // send cookies with this request
    });
    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);
}
```

Now try two CORS configs and observe the difference:

**Config A — wildcard without credentials (cookies not sent):**
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```
Result: `credentials: "include"` fails — browser refuses to send cookies with a wildcard origin. The request goes through but WITHOUT cookies — unauthenticated.

**Config B — specific origin with credentials (cookies sent):**
```python
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173"],
    "supports_credentials": True
}})
```
Result: `credentials: "include"` works — browser sends cookies. If `evil.com` were in `origins`, it would receive your authenticated response.

### SAVE AND TRY

Try both configs and observe the behavior in DevTools. The security lesson: `*` seems permissive but actually prevents credential-bearing requests. A misconfigured specific-origin with `supports_credentials: True` is the real danger.

---

## Challenge

**No solution provided. Requirements checklist only.**

Configure CORS for a multi-environment API that must work in development, staging, and production with different allowed origins.

**Requirements checklist:**

- [ ] Read the allowed origin(s) from an environment variable `ALLOWED_ORIGINS` (comma-separated)
- [ ] Default to `http://localhost:5173` when `ALLOWED_ORIGINS` is not set
- [ ] `ALLOWED_ORIGINS=https://myapp.com,https://staging.myapp.com` allows both
- [ ] An origin NOT in the list receives a CORS error — not a 403, but a missing header
- [ ] Write a test function that verifies: allowed origin gets the header, unknown origin does not
- [ ] Add `Access-Control-Max-Age: 600` to cache preflight responses for 10 minutes
- [ ] The `Authorization` header is included in `allow_headers` (needed for JWT-based APIs)

**Starter:**
```python
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# TODO: read ALLOWED_ORIGINS from environment variable
# TODO: configure CORS with the parsed origins list
```

**When you're done:** `ALLOWED_ORIGINS=https://example.com python api.py` and a request from `http://localhost:5173` gets a CORS error. `ALLOWED_ORIGINS=http://localhost:5173 python api.py` and the same request succeeds. The preflight response includes `Access-Control-Max-Age: 600`.

**Stuck?** Ask AI: "In Flask-CORS, how do I pass a list of allowed origins that I've read from an environment variable? The environment variable is a comma-separated string like 'https://example.com,http://localhost:5173' and I need Flask-CORS to allow requests from both of those origins."

---

## Quick Check Answers

**1. Do `curl` or Python `requests` enforce CORS?**
No. CORS is enforced exclusively by browsers. `curl`, Python's `requests`, Postman, and any server-side HTTP client ignore CORS headers entirely. They can freely make cross-origin requests and read the responses. CORS is a browser security feature that protects users from malicious websites using their browser as a weapon — it has no meaning outside a browser context. This is why testing your API with curl does not test CORS — you must test from a browser.

**2. Are `api.example.com` and `app.example.com` the same origin?**
No. An origin is the combination of three parts: **scheme** (http vs https), **hostname** (including subdomains), and **port**. `api.example.com` and `app.example.com` have different hostnames — different subdomains are different origins. `https://example.com:443` and `http://example.com:80` have different schemes and ports — also different origins. Only when all three parts match exactly are two URLs the same origin.

**3. Why is `Access-Control-Allow-Origin: *` a problem with credentials?**
The browser enforces this rule: you cannot combine `*` with `credentials: true`. If a server responds with `Access-Control-Allow-Origin: *`, browsers will not include cookies or Authorization headers in the request — and will not allow JavaScript to read the response if the request was made with `credentials: include`. This is intentional: `*` means "any site in the world can call this endpoint" — but anonymous callers should not receive authenticated responses. If you need both "any origin" and "authenticated," you must reflect the specific requesting origin and set `Access-Control-Allow-Credentials: true` — which is dangerous because it allows any origin to make authenticated requests with the user's cookies.

**4. What triggers a CORS preflight request?**
A preflight is triggered when the request is NOT a "simple request." Simple requests are: GET, HEAD, or POST with `Content-Type` of `text/plain`, `application/x-www-form-urlencoded`, or `multipart/form-data`. Everything else triggers a preflight: PUT, DELETE, PATCH, any POST with `application/json`, or any request with custom headers (like `Authorization`, `X-Request-ID`, etc.). The preflight is an OPTIONS request sent before the actual request. The browser asks "do you allow this method/headers/origin?" — if the server responds with the appropriate CORS headers, the browser proceeds with the actual request. This is why `flask_cors` must configure `allow_headers` to include `Content-Type` for JSON APIs.
