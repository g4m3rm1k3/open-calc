# Python Tool Database — LAB 78 — CORS

**Prerequisites:** Lab 74 (FastAPI running). You have a working API. This lesson enables it to be called from a browser on a different origin.

**What this lab adds:**
- What CORS is and why browsers enforce it
- `CORSMiddleware` in FastAPI — one setup block
- `allow_origins`: development wildcard vs production allow-list
- Pre-flight requests: what `OPTIONS` does and why FastAPI handles it for you
- What CORS does NOT protect against

**Time:** 30–40 minutes (concept-heavy, minimal code)

---

## What You Will Build

A FastAPI server that any browser page can call — with a test that proves it works:

```python
# A simple browser test (open this HTML file, check the console):
fetch("http://127.0.0.1:8000/tools")
  .then(r => r.json())
  .then(tools => console.log("Received", tools.length, "tools"))
```

Without CORS: `fetch` fails with a network error in the browser console.
With CORS: `fetch` succeeds and logs the tool count.

---

> **Quick Check — try to answer before reading:**
>
> 1. You open `http://127.0.0.1:5500/index.html` (your frontend). That page calls `fetch("http://127.0.0.1:8000/tools")` (your API). Why does the browser block this by default?
> 2. CORS is enforced by the browser, not the server. What does that mean for non-browser clients like `httpx` or `curl`?
> 3. `allow_origins=["*"]` allows all origins. `allow_origins=["http://localhost:5500"]` allows only one. When should you use each?
>
> *(Answers at the end of this lab)*

---

## Concept: CORS (Cross-Origin Resource Sharing)

**What it is:** A browser security policy that restricts which web pages can make requests to which servers. "Cross-origin" means a different scheme, host, or port than the page making the request.

**The problem before (the attack it prevents):** Without CORS, a malicious page at `http://evil.com` could make requests to `http://yourbank.com/api/transfer` using your browser's saved cookies. Your browser is already authenticated with your bank — the request would carry your credentials. This is CSRF (Cross-Site Request Forgery).

**Why CORS exists:** Browsers implement the Same-Origin Policy — a page at `http://example.com` can only make requests to `http://example.com`. CORS is the mechanism that allows servers to opt out of this restriction for specific origins they trust.

**What it hides:** The actual enforcement is in the browser — the browser sends the request, reads the response headers, and decides whether to give the response to JavaScript based on whether the `Access-Control-Allow-Origin` header is present and matches.

**The two kinds of CORS requests:**

1. **Simple requests** (GET with no custom headers): The browser sends the request, receives the response, checks `Access-Control-Allow-Origin`. If it matches, JavaScript receives the data; if not, JavaScript gets a network error.

2. **Pre-flight requests** (POST/PUT/DELETE, or any request with custom headers): Before the actual request, the browser sends an `OPTIONS` request asking "are you willing to accept a POST from `http://localhost:5500`?" The server responds with what it allows. If the pre-flight is approved, the actual request proceeds.

**You will see this again in:** Every web application with a separate frontend and backend server. This is not optional — if your frontend and API are on different ports, CORS must be configured.

**Career signal:** CORS errors are one of the most common issues developers encounter when building web apps. Understanding what causes them (different origin) and what fixes them (correct server headers) is essential knowledge. "Why is my fetch failing with a CORS error?" is a rite of passage question.

**Watch for:** CORS is enforced by browsers only. `curl`, `httpx`, and Python scripts are not browsers — they ignore CORS. If `httpx` can reach your API but a browser `fetch` cannot, the issue is always CORS configuration, not the API itself.

---

## Step 1 — See the CORS Error

Before adding CORS, verify the error.

Create a simple HTML file and open it in a browser (any port — VS Code Live Server, Python's `http.server`, or just double-click):

```html
<!-- test_cors.html — open this in a browser while the API is running -->
<!DOCTYPE html>
<html>
<body>
<script>
  fetch("http://127.0.0.1:8000/tools")
    .then(r => r.json())
    .then(data => console.log("Success:", data.length, "tools"))
    .catch(err => console.error("CORS error:", err));
</script>
</body>
</html>
```

Open DevTools (F12) → Console.

**You should see** an error like:
```
Access to fetch at 'http://127.0.0.1:8000/tools' from origin 'null' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

The browser made the request, received the response, checked for `Access-Control-Allow-Origin` in the response headers, found nothing, and blocked JavaScript from reading the response.

---

## Step 2 — Add `CORSMiddleware`

**Middleware** is code that runs on every request before (and after) your route handlers. FastAPI middleware sits between the web server (uvicorn) and your routes.

Add to `tooldb_api/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware   # ← add this import
```

```python
# After creating `app = FastAPI(...)` — add before any routes:

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # ← DEV ONLY: allow all origins
    allow_credentials=False,     # ← True would allow cookies to be sent cross-origin
    allow_methods=["*"],         # ← allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],         # ← allow all request headers
)
```

`add_middleware()` registers middleware in the order added — first added runs outermost (first for requests, last for responses). CORS middleware must be added before other middleware because pre-flight requests must be handled before authentication middleware rejects them.

`allow_origins=["*"]` — the wildcard means "accept requests from any origin." This is correct for a local development server. For production, replace with the actual frontend URL.

### SAVE AND TRY

With the server running (`--reload` will pick up the change), reload `test_cors.html` in the browser.

**You should see** in the browser console:
```
Success: 4 tools
```

In the browser Network tab, look at the `GET /tools` request. In the response headers:
```
access-control-allow-origin: *
```

`CORSMiddleware` added this header to the response. The browser saw it, recognized the wildcard, and gave JavaScript the response data.

**Change something:** In `app.add_middleware(...)`, change `allow_methods=["*"]` to `allow_methods=["GET"]`. Restart the server. The `GET /tools` fetch still works. Now try adding a `fetch("http://127.0.0.1:8000/tools", {method: "POST", ...})` in the HTML — it will fail pre-flight because POST is not in `allow_methods`. Change back to `["*"]`.

---

## Step 3 — Production Configuration

**Development:** `allow_origins=["*"]` is convenient but broad. During development, you want to be able to test from any port.

**Production:** `allow_origins=["https://yourdomain.com"]` — only your frontend URL is allowed. Any other origin gets blocked. This is the CORS configuration that actually provides security:

```python
import os

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5500,http://localhost:3000"   # defaults for local dev
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],   # explicit list
    allow_headers=["Content-Type", "Authorization"],           # explicit list
)
```

`os.getenv("ALLOWED_ORIGINS", ...)` reads from the environment variable `ALLOWED_ORIGINS` if set, otherwise uses the default. In production deployment, set `ALLOWED_ORIGINS=https://yourdomain.com` as a server environment variable. The code does not change between development and production — only the environment variable does.

### SAVE AND TRY

In your terminal, set the environment variable and restart:

```powershell
$env:ALLOWED_ORIGINS = "http://127.0.0.1:5500"
uvicorn tooldb_api.main:app --reload
```

Now try the fetch from `test_cors.html` — it should still work if you opened the file from port 5500. Try opening it from a different origin (a different port) — the CORS header will be absent and the browser will block the fetch.

---

## What CORS Does NOT Protect Against

Knowing the limits is as important as knowing the feature:

**CORS does not protect your API from non-browser clients.** `curl`, `httpx`, Postman, and Python scripts are not browsers — they ignore CORS entirely. If a curl command can reach your API, anyone with network access can call it regardless of CORS settings.

**CORS does not replace authentication.** A browser at `evil.com` cannot read your API's response. But anyone with a Python script can. If your API has sensitive data, it needs authentication (API keys, JWT tokens) — not just CORS.

**CORS does not prevent all CSRF attacks.** Simple form submissions (`<form method="POST">`) from any origin bypass CORS because they are not XHR/fetch requests. CSRF tokens or `SameSite=Strict` cookies are the defense for form-based attacks.

**The accurate mental model:** CORS controls which browser scripts can read API responses. It is a browser feature for user protection. It is not a server-side security boundary.

---

## 🎯 Challenge: Per-Environment CORS Config

**You know:** `os.getenv()` reads environment variables. Python's `pathlib.Path` can find files. `ALLOWED_ORIGINS` as a comma-separated string.

**Task:** Create a `.env` file in the project root (not committed to git — add to `.gitignore`) and a `tooldb_api/config.py` module that reads it. Use the config in `main.py` for CORS instead of inline `os.getenv()` calls.

**Starting code:**

```python
# tooldb_api/config.py
import os
from pathlib import Path

# Load .env file if present (simple approach — no external library needed):
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


class Settings:
    allowed_origins : list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    debug           : bool      = os.getenv("DEBUG", "false").lower() == "true"
```

```
# .env  (do not commit this file)
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:3000
DEBUG=true
```

---

<details>
<summary>▶ Show Solution</summary>

```python
# tooldb_api/config.py
import os
from pathlib import Path

env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


class Settings:
    allowed_origins: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    debug          : bool      = os.getenv("DEBUG", "false").lower() == "true"


settings = Settings()
```

In `main.py`:

```python
from tooldb_api.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Key insight:** Configuration in code is fragile — changing deployment settings requires editing Python files. Configuration in environment variables is the 12-factor app principle: the same code runs in development (`.env` file with loose settings) and production (environment variables with strict settings). The `.env` file is the development convenience; the environment variable is the production mechanism. The `Settings` class is the single place where all configuration is read — callers never call `os.getenv` directly.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Browser fetch fails before CORS | Open `test_cors.html` without the middleware — see the CORS error |
| Browser fetch succeeds after CORS | Add middleware, reload — `Success: N tools` in console |
| `Access-Control-Allow-Origin` in response headers | Network tab → response headers |
| Production config with specific origin | Set `ALLOWED_ORIGINS` to a specific origin, test from that origin and from another |
| `curl` ignores CORS | `curl http://127.0.0.1:8000/tools` works even without CORS middleware |

---

## Quick Check Answers

**1. Why does the browser block the fetch to a different port?**
Because of the Same-Origin Policy. Two URLs have different origins if their scheme (http vs https), host (localhost vs api.example.com), or port (5500 vs 8000) differ. Port 5500 and port 8000 are different origins — even on the same machine. The Same-Origin Policy was designed to prevent one website from reading data from another without permission. `http://localhost:5500` and `http://localhost:8000` are different origins by port.

**2. What does CORS enforcement by browsers mean for non-browser clients?**
Non-browser clients do not enforce CORS — they simply ignore it. `curl http://127.0.0.1:8000/tools` works regardless of CORS settings because `curl` is not a browser and does not implement the Same-Origin Policy. CORS only protects the browser user's data from being read by malicious web pages. A developer, a script, or a tool can always call your API directly. This is why authentication is separate from CORS — CORS protects browser users; authentication protects the API.

**3. When to use `allow_origins=["*"]` vs a specific list?**
`["*"]` during development when you may test from many different ports and origins. A specific list in production because the production frontend has a known URL. `["*"]` in production means any website can call your API with a user's cookies (if `allow_credentials=True`) or any website's JavaScript can read your API's responses. That is fine for truly public APIs (like a weather API) but wrong for APIs with user data. For the tool database, a specific allow-list is correct in production — only your known frontend should be able to call the API from a browser.
