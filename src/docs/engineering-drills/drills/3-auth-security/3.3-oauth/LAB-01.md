# DRILL 3.3 — OAuth 2.0: What Actually Happens

**Series:** Auth & Security | **Difficulty:** Intermediate | **Time:** 75–105 min  
**Project:** GitHub OAuth client — raw HTTP, no library, fetches your profile and repos

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. You use "Sign in with GitHub" on a third-party site. Does that site ever see your GitHub password?
2. What is the OAuth `code` that GitHub sends back to your redirect URL? Can you use it twice?
3. What does the `state` parameter protect against?
4. You have an access token with scope `public_repo`. Can you delete a private repository with it?

---

## What It Is

OAuth 2.0 is a delegation protocol. It lets a user grant a third-party application limited access to their account on another service — without ever giving that third party their password.

The core insight: **your app never needs to know the user's credentials**. GitHub authenticates the user (because GitHub knows their password). GitHub then hands your app a token that says "this user authorized you to do X." Your app uses that token. The user's password never travels anywhere near your server.

The authorization code flow — the one you will implement — has four actors:

- **Resource Owner:** the user (they own the GitHub account)
- **Client:** your app (it wants to access GitHub on the user's behalf)
- **Authorization Server:** GitHub's OAuth endpoint (it authenticates the user and issues codes)
- **Resource Server:** GitHub's API (it accepts tokens and returns data)

The flow in plain English: your app sends the user to GitHub. GitHub asks "do you want to let this app access your repos?" The user says yes. GitHub sends the user back to your app with a short-lived, single-use code. Your app exchanges that code for a real access token using a server-to-server request. Your app uses the token to call the API.

---

## The Problem Before

Before OAuth, the only way to access another service's API on a user's behalf was to ask the user for their username and password, store those credentials, and replay them to the service. This is catastrophic:

- Your database stores raw passwords for a service you don't control
- When your database is breached, attackers get users' Gmail and GitHub passwords, not just your app's passwords
- Users have no way to revoke access to your app without changing their password everywhere
- You have full access to their account — you can't be limited to "read repos only"

OAuth solves all of these by making the service (GitHub) responsible for authentication and letting it issue scoped, revocable tokens.

---

## The Solution

Redirect the user to GitHub. Let GitHub authenticate them. Get a scoped, revocable token back. Use the token. Never touch the password.

---

## What It Hides (Abstractions)

- **TLS:** every HTTP request in this flow is encrypted in transit. You never see this.
- **Session cookies:** GitHub maintains its own session with the user during the OAuth flow. Your app sees none of this.
- **Token storage on GitHub's side:** GitHub stores your client_secret and validates it during code exchange. You don't see the validation logic.
- **Token format:** GitHub's access tokens for classic OAuth are opaque strings. You treat them as magic keys — you don't decode them (unlike JWTs).

---

## Canonical Example

```
1. Your app:     GET https://github.com/login/oauth/authorize
                     ?client_id=abc123
                     &redirect_uri=http://localhost:8080/callback
                     &scope=read:user%20public_repo
                     &state=RANDOM_STRING

2. GitHub:       User logs in, grants access

3. GitHub:       GET http://localhost:8080/callback
                     ?code=single_use_code_here
                     &state=RANDOM_STRING    <- must match what you sent

4. Your app:     POST https://github.com/login/oauth/access_token
                     client_id=abc123
                     &client_secret=SECRET   <- server to server, never frontend
                     &code=single_use_code_here

5. GitHub:       access_token=gho_abc...&scope=read:user,public_repo&token_type=bearer

6. Your app:     GET https://api.github.com/user
                     Authorization: Bearer gho_abc...
```

---

## Project Application

You will build a local Python web server that implements OAuth authorization code flow against GitHub's real OAuth endpoints — with no OAuth library, just `urllib.request` (or `requests`) and `http.server`. You will see every HTTP request in the flow.

---

## Constraints

- Python 3.8+
- Standard library only for the server (`http.server`, `urllib.request`, `urllib.parse`)
- `requests` optional and noted where used
- You need a GitHub account and internet access
- The callback server runs on `localhost:8080` — nothing else may use that port

---

## Failure Modes

| Symptom | Root Cause |
|---|---|
| `redirect_uri_mismatch` from GitHub | The redirect URI in your request doesn't exactly match what you registered |
| `bad_verification_code` on token exchange | The code was already used, or it expired (10-minute lifetime) |
| `401 Unauthorized` on API call | Access token missing, malformed, or using wrong header format |
| CSRF — attacker can link their own OAuth code | Missing or unverified `state` parameter |
| Token works in test, rejected in prod | client_secret exposed in frontend, attacker used it to register a different app |

---

## Operational Reality

In production:

- You use a library (Authlib, python-social-auth, NextAuth.js) that wraps this flow. But the library still makes exactly these HTTP requests.
- The `state` parameter must be a cryptographically random string stored in the user's session — not a predictable value. `secrets.token_urlsafe(32)` is the right tool.
- Access tokens expire. Most providers issue refresh tokens alongside access tokens. When the access token expires, you use the refresh token to get a new one without bothering the user. GitHub's classic OAuth tokens do not expire by default, but GitHub Apps tokens do.
- The `client_secret` must never appear in frontend JavaScript, mobile app binaries, or public repositories. It belongs in environment variables on your server.
- Scopes are the OAuth equivalent of principle of least privilege. Request only what you need. Users see your scope list and may reject your app if it asks for too much.

---

## You Will See This Again In

- Every "Sign in with Google/GitHub/Apple" button on every web app
- Spotify, Slack, Stripe — every developer platform that lets third-party apps act on users' behalf
- The GitHub Actions `GITHUB_TOKEN` is a scoped OAuth-style token issued per workflow run
- AWS, GCP, Azure API clients use OAuth 2.0 (or closely related flows) for service authentication

---

## Watch For

- Registering your OAuth app with `http://` (plain HTTP) — most providers reject this for production. `localhost` is the exception during development.
- Reusing the same `state` value across requests — it must be unique per OAuth flow and verified on return.
- Logging access tokens — they are credentials. Treat them like passwords in your logs.
- `scope` changes require the user to re-authorize. If you add a scope after deployment, existing tokens don't have it.

---

## Step 1 — Register a GitHub OAuth App

Before writing any code, you need credentials from GitHub.

Go to: **https://github.com/settings/developers**

Click **"New OAuth App"** and fill in:

| Field | Value |
|---|---|
| Application name | `oauth-drill-local` (anything works) |
| Homepage URL | `http://localhost:8080` |
| Authorization callback URL | `http://localhost:8080/callback` |

Click **Register application**.

GitHub shows you your **Client ID** (public, like a username — safe to put in URLs) and lets you generate a **Client Secret** (private, like a password — never put this in a URL, frontend, or git commit).

Click **Generate a new client secret** and copy it immediately — GitHub shows it once.

Create a file called `.env` in your project directory. Do NOT commit this file:

```
# .env  (add this to .gitignore — never commit client secrets)
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

Create the project structure:

```
oauth-drill/
    .env
    .gitignore
    oauth_server.py
```

`.gitignore`:
```
.env
__pycache__/
```

### SAVE AND TRY

Verify your credentials exist:

```
python -c "
with open('.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, val = line.strip().split('=', 1)
            # Print the key and first 4 chars of value only
            print(f'{key}={val[:4]}...')
"
```

**Expected output:**
```
GITHUB_CLIENT_ID=Ov23...
GITHUB_CLIENT_SECRET=your...
```

If you see your values, you're ready. Keep the `.env` file — the next steps read from it.

---

## Step 2 — Build the Authorization URL by Hand

The first step of OAuth is redirecting the user to GitHub. That URL has exact required parameters. Build it manually so you can see every piece.

Create `oauth_server.py`:

```python
# oauth_server.py
# A minimal local HTTP server that implements OAuth authorization code flow.
# No OAuth library. Every HTTP request is visible.

import http.server
import urllib.parse
import urllib.request
import secrets
import json
import os

# ── Load credentials from .env ─────────────────────────────────────────────
# In production this would be os.environ, set by your deployment platform.
# We parse .env manually here to avoid requiring python-dotenv.
def load_env(path=".env"):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip()
    return env

ENV = load_env()
CLIENT_ID     = ENV["GITHUB_CLIENT_ID"]
CLIENT_SECRET = ENV["GITHUB_CLIENT_SECRET"]

# ── OAuth constants ────────────────────────────────────────────────────────
REDIRECT_URI       = "http://localhost:8080/callback"
GITHUB_AUTH_URL    = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL   = "https://github.com/login/oauth/access_token"
GITHUB_API_BASE    = "https://api.github.com"

# The scope tells GitHub exactly what permissions we are requesting.
# "read:user" = read user profile. "public_repo" = read public repos.
# We do NOT request "repo" (all repos including private) — principle of least privilege.
SCOPE = "read:user public_repo"

# ── In-memory state store ──────────────────────────────────────────────────
# In a real app this lives in the user's session (signed cookie, server-side session, etc.)
# We use a module-level set since this is a single-process demo.
# The state token is stored here when we send the user to GitHub,
# and removed after we verify it on callback.
PENDING_STATES: set = set()


def build_authorization_url() -> str:
    """
    Build the URL we redirect the user to at GitHub.
    Every parameter here has a specific purpose — none are optional.
    """
    # secrets.token_urlsafe(32) generates 32 cryptographically random bytes,
    # base64url-encoded to ~43 characters. This is unpredictable enough that
    # an attacker cannot guess it, which is what makes CSRF prevention work.
    state = secrets.token_urlsafe(32)
    PENDING_STATES.add(state)  # remember this state so we can verify it on callback

    params = {
        "client_id":    CLIENT_ID,
        # redirect_uri must exactly match what you registered on GitHub.
        # GitHub will refuse to redirect to any other URL.
        "redirect_uri": REDIRECT_URI,
        # scope is space-separated, but URLs use + or %20 for spaces.
        # urllib.parse.urlencode handles this encoding for us.
        "scope":        SCOPE,
        # state is our CSRF token. GitHub echoes it back unchanged.
        # If the value doesn't match what we stored, we reject the callback.
        "state":        state,
    }

    # urlencode converts the dict to key=value&key=value, percent-encoding special chars.
    return f"{GITHUB_AUTH_URL}?{urllib.parse.urlencode(params)}"


class OAuthHandler(http.server.BaseHTTPRequestHandler):
    """
    HTTP request handler. Responds to three routes:
      GET /         — the home page with the login link
      GET /callback — where GitHub redirects after the user authorizes
      (everything else) — 404
    """

    def log_message(self, format, *args):
        # Override to add a prefix to server log lines so they're easy to read
        print(f"[server] {self.address_string()} - {format % args}")

    def do_GET(self):
        # Parse the incoming URL so we can inspect path and query string separately
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/":
            self._serve_home()
        elif parsed.path == "/callback":
            self._handle_callback(parsed)
        else:
            self._send_text(404, "Not found")

    def _serve_home(self):
        """
        Step 1 of OAuth: present the user with a link to GitHub's authorization page.
        We build the URL here — the user's browser will follow it.
        """
        auth_url = build_authorization_url()
        html = f"""<!DOCTYPE html>
<html>
<head><title>OAuth Drill</title></head>
<body>
  <h1>GitHub OAuth Demo</h1>
  <p>Click the link below. You will be redirected to GitHub to authorize this app.</p>
  <p>After you authorize, GitHub will redirect you back to <code>/callback</code>
     with a short-lived code. We exchange that code for a real token — you never
     type your GitHub password into this server.</p>
  <a href="{auth_url}">Connect with GitHub</a>
  <hr>
  <p><small>Authorization URL (so you can see every parameter):<br>
  <code>{auth_url}</code></small></p>
</body>
</html>"""
        self._send_html(200, html)

    def _handle_callback(self, parsed):
        """
        Step 3 of OAuth: GitHub has redirected the user back to us with a code.
        This method validates the state, exchanges the code for a token,
        and uses the token to call the GitHub API.
        """
        # Parse the query string GitHub appended to our redirect URI:
        #   /callback?code=abc123&state=xyz...
        params = urllib.parse.parse_qs(parsed.query)

        # GitHub sends the code and state as single values, but parse_qs always
        # returns lists. [0] extracts the first (and only) value.
        code  = params.get("code",  [None])[0]
        state = params.get("state", [None])[0]

        # ── CSRF check ─────────────────────────────────────────────────────
        # This is the security-critical step. If an attacker tricks a user into
        # clicking a crafted OAuth callback URL, the state won't match anything
        # in PENDING_STATES — we reject it.
        # Without this check, CSRF attacks against OAuth flows are trivial.
        if state not in PENDING_STATES:
            self._send_text(400,
                f"STATE MISMATCH — possible CSRF attack.\n"
                f"Received state: {state!r}\n"
                f"Expected one of: {PENDING_STATES}"
            )
            return

        # Remove the state so it can't be reused (one-time use)
        PENDING_STATES.discard(state)

        if not code:
            self._send_text(400, "No code in callback — user may have denied authorization.")
            return

        # ── Exchange code for access token ─────────────────────────────────
        token = exchange_code_for_token(code)
        if not token:
            self._send_text(500, "Token exchange failed. Check server logs.")
            return

        # ── Use the token to call the GitHub API ───────────────────────────
        user = github_api_get("/user", token)
        repos = github_api_get("/user/repos?per_page=5&sort=updated", token)

        # Build a simple results page
        repo_list = "".join(
            f"<li><a href='{r['html_url']}'>{r['full_name']}</a> "
            f"({'private' if r['private'] else 'public'})</li>"
            for r in repos[:5]
        )
        html = f"""<!DOCTYPE html>
<html>
<head><title>OAuth Success</title></head>
<body>
  <h1>Authenticated as {user['login']}</h1>
  <img src="{user['avatar_url']}" width="80" style="border-radius:50%">
  <p>Name: {user.get('name', '(not set)')}</p>
  <p>Public repos: {user['public_repos']}</p>
  <h2>5 Most Recently Updated Public Repos</h2>
  <ul>{repo_list}</ul>
  <hr>
  <p><small>Token received (first 8 chars): <code>{token[:8]}...</code><br>
  Your GitHub password was never sent to this server.</small></p>
</body>
</html>"""
        self._send_html(200, html)

    def _send_html(self, status: int, html: str):
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_text(self, status: int, text: str):
        body = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def exchange_code_for_token(code: str) -> str | None:
    """
    POST to GitHub's token endpoint, sending our code and client_secret.
    This request goes server-to-server — the user's browser is NOT involved.
    The client_secret never appears in a URL or in any response sent to the browser.
    """
    print(f"[oauth] Exchanging code {code[:8]}... for access token")

    post_data = urllib.parse.urlencode({
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,   # <- this is why token exchange must be server-side
        "code":          code,
        "redirect_uri":  REDIRECT_URI,
    }).encode("utf-8")

    req = urllib.request.Request(
        GITHUB_TOKEN_URL,
        data=post_data,
        method="POST",
        headers={
            # Tell GitHub to return JSON, not form-encoded data
            "Accept":       "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read())
    except Exception as e:
        print(f"[oauth] Token exchange HTTP error: {e}")
        return None

    if "error" in body:
        # GitHub returns errors like: {"error": "bad_verification_code", "error_description": "..."}
        print(f"[oauth] Token exchange error: {body['error']} — {body.get('error_description')}")
        return None

    token = body.get("access_token")
    scope = body.get("scope", "")
    print(f"[oauth] Token received. Scope: {scope!r}. Token starts: {token[:8]}...")
    return token


def github_api_get(path: str, token: str):
    """
    Make an authenticated GET request to the GitHub REST API.
    The Authorization header carries the token — this is a Bearer token scheme.
    """
    req = urllib.request.Request(
        f"{GITHUB_API_BASE}{path}",
        headers={
            # Bearer tokens are the standard way to pass OAuth access tokens.
            # The word "Bearer" means "whoever holds this token is authorized."
            "Authorization": f"Bearer {token}",
            # GitHub requires a User-Agent header — requests without it get 403.
            "User-Agent":    "oauth-drill-python",
            "Accept":        "application/vnd.github+json",
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


if __name__ == "__main__":
    server = http.server.HTTPServer(("localhost", 8080), OAuthHandler)
    print("OAuth drill server running at http://localhost:8080")
    print("Open that URL in your browser to start the flow.")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
```

### SAVE AND TRY

```
python oauth_server.py
```

Open **http://localhost:8080** in your browser.

**Expected terminal output on startup:**
```
OAuth drill server running at http://localhost:8080
Open that URL in your browser to start the flow.
Press Ctrl+C to stop.
```

**When you click "Connect with GitHub":**
```
[server] 127.0.0.1 - "GET / HTTP/1.1" 200 -
[server] 127.0.0.1 - "GET /callback?code=abcd1234&state=xyz... HTTP/1.1" 200 -
[oauth] Exchanging code abcd1234... for access token
[oauth] Token received. Scope: 'read:user,public_repo'. Token starts: gho_ABCD...
```

**Expected browser page after authorization:**
```
Authenticated as your-github-username
[avatar image]
Name: Your Name
Public repos: 42
5 Most Recently Updated Public Repos
• username/repo-name (public)
• ...
```

**Change something:** Go back to http://localhost:8080 and click "Connect with GitHub" again. Notice the URL shown on the home page has a different `state` parameter each time — `secrets.token_urlsafe(32)` generates a new one on every request. This is required: reusing states defeats CSRF protection.

---

## Step 3 — Examine the Code's Properties

The `code` GitHub sends you is single-use and expires in 10 minutes. You can prove this.

Add this test function to the bottom of `oauth_server.py`, above `if __name__ == "__main__"`:

```python
def demonstrate_code_expiry(code: str):
    """
    Shows that a code can only be used once.
    The second exchange will fail with bad_verification_code.
    """
    print("\n── Demonstrating single-use code ──")
    print(f"Attempting first exchange with code: {code[:8]}...")
    token1 = exchange_code_for_token(code)
    print(f"First exchange result: {token1[:8] + '...' if token1 else 'FAILED (expected if already used)'}")

    print(f"\nAttempting second exchange with same code...")
    token2 = exchange_code_for_token(code)
    print(f"Second exchange result: {token2[:8] + '...' if token2 else 'FAILED — code already used (expected)'}")
    print("── A code is single-use. The second attempt always fails. ──\n")
```

Now update `_handle_callback` to call it — add this line right after you receive the token:

```python
# In _handle_callback, after: token = exchange_code_for_token(code)
# Add:
demonstrate_code_expiry(code)  # shows that the code is now consumed
```

### SAVE AND TRY

Restart the server and go through the OAuth flow once.

**Expected terminal output:**
```
── Demonstrating single-use code ──
Attempting first exchange with code: abcd1234...
[oauth] Exchanging code abcd1234... for access token
[oauth] Token received. Scope: 'read:user,public_repo'. Token starts: gho_ABCD...
First exchange result: gho_ABCD...

Attempting second exchange with same code...
[oauth] Exchanging code abcd1234... for access token
[oauth] Token exchange error: bad_verification_code — The code passed is incorrect or expired.
Second exchange result: FAILED — code already used (expected)
── A code is single-use. The second attempt always fails. ──
```

Remove `demonstrate_code_expiry(code)` from `_handle_callback` before the next step — you've seen what you need.

---

## Step 4 — Demonstrate CSRF: What Happens Without State Verification

Add a vulnerable callback route that skips state verification, so you can see what the attack looks like.

Add this method to `OAuthHandler`:

```python
def _handle_callback_no_state_check(self, parsed):
    """
    THIS IS THE VULNERABLE VERSION. DO NOT USE IN PRODUCTION.
    We skip the state check entirely.

    The CSRF attack this enables:
    1. Attacker starts an OAuth flow with YOUR app — gets redirected to GitHub
    2. Attacker does NOT complete the flow — they copy the callback URL
       (/callback?code=ATTACKER_CODE&state=ATTACKER_STATE) but don't follow it
    3. Attacker crafts a link: http://yourapp.com/callback?code=ATTACKER_CODE
    4. Attacker tricks a logged-in victim into clicking that link
    5. Your app exchanges ATTACKER_CODE for a token — but victim's session is used
    6. Victim's account in your app is now linked to ATTACKER's GitHub account
    7. Attacker logs in with GitHub on your site and accesses victim's data

    Without state verification, step 4 succeeds. With it, the state won't match
    anything in the victim's session, and the request is rejected.
    """
    params = urllib.parse.parse_qs(parsed.query)
    code = params.get("code", [None])[0]

    print("[VULNERABLE] Skipping state check — CSRF possible")

    if not code:
        self._send_text(400, "No code")
        return

    token = exchange_code_for_token(code)
    self._send_text(200, f"Vulnerable callback: token={token[:8] if token else 'FAILED'}...")
```

Change the route dispatch in `do_GET` temporarily:

```python
elif parsed.path == "/callback-insecure":
    self._handle_callback_no_state_check(parsed)
```

### SAVE AND TRY

Restart the server. Complete one normal OAuth flow (which gives you a code in the terminal log). Then manually visit:

```
http://localhost:8080/callback-insecure?code=ALREADY_USED_CODE&state=anything
```

**Expected output:**
```
[VULNERABLE] Skipping state check — CSRF possible
[oauth] Exchanging code ... for access token
[oauth] Token exchange error: bad_verification_code — The code passed is incorrect or expired.
Vulnerable callback: token=FAILED...
```

The code is already used, so this particular attempt fails — but the point is that the server **accepted the request** and tried to process it without validating the state. In a real attack, the attacker submits a fresh code.

Remove the `/callback-insecure` route. The lesson: state verification is not optional.

---

## Step 5 — Access Tokens vs Refresh Tokens vs Scopes

GitHub's classic OAuth tokens don't expire and have no refresh token — but most production OAuth providers do. Understanding the difference matters.

Add this explanatory script — run it as a standalone file, not part of the server:

Create `token_anatomy.py`:

```python
# token_anatomy.py
# Demonstrates token properties: scopes, what they allow, what they block.
# Run this AFTER completing a full OAuth flow so you have a token.
# Paste your token below (for demo only — delete it after).

import urllib.request
import json

# Replace with a real token for this demo.
# In production this comes from your database, not hardcoded.
TOKEN = input("Paste your GitHub access token: ").strip()

API = "https://api.github.com"

def call(path: str, method: str = "GET", body=None):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(body).encode() if body else None,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "User-Agent":    "oauth-drill",
            "Accept":        "application/vnd.github+json",
            "Content-Type":  "application/json",
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            # GitHub returns the scopes your token has in a response header
            scopes = resp.headers.get("X-OAuth-Scopes", "(none)")
            data = json.loads(resp.read())
            return resp.status, scopes, data
    except urllib.error.HTTPError as e:
        return e.code, "", {"message": e.reason}

# What scopes does this token have?
# GitHub reports them in the X-OAuth-Scopes response header on every API call.
status, scopes, user = call("/user")
print(f"\nToken scopes: {scopes!r}")
print(f"Authenticated as: {user['login']}")

# This should work — read:user scope covers it
print(f"\n[SHOULD WORK] GET /user → {status}")
print(f"  login: {user['login']}, public_repos: {user['public_repos']}")

# Try to access private emails — read:user doesn't include private email
status, _, emails = call("/user/emails")
print(f"\n[SCOPE LIMIT] GET /user/emails → {status}")
if status == 200:
    print(f"  Got {len(emails)} emails (user:email scope was granted)")
else:
    # 404 means the endpoint exists but the token can't see it
    print(f"  Blocked: {emails.get('message')} — need 'user:email' scope")

# Try to star a repo — public_repo scope doesn't allow starring via this token
# (starring requires the 'public_repo' or 'repo' scope depending on the target)
status, _, result = call("/user/starred/torvalds/linux", method="GET")
print(f"\n[SCOPE CHECK] GET /user/starred → {status} ({result if status != 204 else 'not starred'})")

print("\nKey takeaway: scopes limit what this token can do,")
print("even though your GitHub account can do much more.")
```

### SAVE AND TRY

After completing a full OAuth flow, run:

```
python token_anatomy.py
```

**Expected output:**
```
Paste your GitHub access token: gho_ABCD...

Token scopes: 'public_repo,read:user'
Authenticated as: your-github-username

[SHOULD WORK] GET /user → 200
  login: your-github-username, public_repos: 12

[SCOPE LIMIT] GET /user/emails → 404
  Blocked: Not Found — need 'user:email' scope

[SCOPE CHECK] GET /user/starred → 404 (not starred or insufficient scope)

Key takeaway: scopes limit what this token can do,
even though your GitHub account can do much more.
```

The token works for exactly the scopes you requested — no more, no less.

---

## Final State

```
oauth-drill/
    .env              ← credentials (in .gitignore, never committed)
    .gitignore
    oauth_server.py   ← complete OAuth flow implementation
    token_anatomy.py  ← scope demonstration
```

### SAVE AND TRY (Full Verification)

```
python oauth_server.py
```

Go to http://localhost:8080, complete the full flow, and verify:

1. Terminal shows state generated, code received, token exchanged
2. Browser shows your GitHub profile and 5 repos
3. Token in browser starts with `gho_` and is truncated — the full token is never shown

```
python token_anatomy.py
```

Paste your token and verify the scope output matches what you requested.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a mock OAuth server in Python. A second Python script acts as the OAuth client. No GitHub involved — everything runs locally. This lets you test OAuth flows in CI without real credentials.

**Starter — create these files:**

`mock_auth_server.py` — listens on port 9000:
```python
# mock_auth_server.py
# A minimal OAuth 2.0 authorization server.
# Implements: /authorize, /token, /userinfo
# Issues: short-lived access tokens (5-second expiry for testing)
# Does NOT implement refresh tokens (add that for the hard mode bonus)

import http.server, urllib.parse, json, secrets, time

# In-memory stores
PENDING_CODES: dict[str, dict] = {}   # code -> {client_id, redirect_uri, state, issued_at}
ACTIVE_TOKENS: dict[str, dict] = {}   # token -> {client_id, scope, issued_at, expires_in}

VALID_CLIENT_ID     = "test-client-id"
VALID_CLIENT_SECRET = "test-client-secret"
VALID_REDIRECT_URI  = "http://localhost:9001/callback"

# TODO: implement OAuthServerHandler with routes:
#   GET  /authorize  → validate client_id and redirect_uri, issue a code, redirect
#   POST /token      → validate code + client_secret, issue access token
#   GET  /userinfo   → validate Bearer token, return mock user JSON
```

`mock_oauth_client.py` — listens on port 9001:
```python
# mock_oauth_client.py
# An OAuth client that talks to the mock server above.
# Implements the full authorization code flow.

import http.server, urllib.parse, urllib.request, json, secrets, webbrowser

AUTH_URL    = "http://localhost:9000/authorize"
TOKEN_URL   = "http://localhost:9000/token"
USERINFO_URL = "http://localhost:9000/userinfo"
CLIENT_ID     = "test-client-id"
CLIENT_SECRET = "test-client-secret"
REDIRECT_URI  = "http://localhost:9001/callback"

# TODO: implement ClientHandler with:
#   GET /        → build authorization URL with state, redirect browser
#   GET /callback → verify state, exchange code for token, call /userinfo
```

**Requirements checklist:**

- [ ] Running `python mock_auth_server.py` in one terminal and `python mock_oauth_client.py` in another works without errors
- [ ] Opening http://localhost:9001 redirects to http://localhost:9000/authorize with correct parameters
- [ ] The mock auth server redirects back to the client's `/callback` with a code and the original state
- [ ] The client verifies the state, exchanges the code for a token, and calls `/userinfo`
- [ ] Tokens expire after 5 seconds. Calling `/userinfo` with an expired token returns 401
- [ ] Using a code twice returns an error on the second attempt
- [ ] A mismatched `client_secret` on `/token` returns 401
- [ ] Each component logs every request it receives and every token it issues

**When done:** Run both servers. Open http://localhost:9001 in your browser. Verify the full flow completes and the userinfo is displayed. Then wait 6 seconds and manually POST to the token endpoint with a valid code — verify the token expires correctly.

**Stuck? Ask AI:** "I'm building a mock OAuth 2.0 authorization server in Python using http.server. The server needs to implement /authorize (issue a code and redirect), /token (exchange code for bearer token with expiry), and /userinfo (validate the bearer token and return JSON). How do I implement the /token endpoint to validate the client_secret, consume the code, and return a JSON response with access_token and expires_in?"

---

## Quick Check Answers

1. **No.** The third-party site never sees your GitHub password. GitHub authenticates you (using your password, which only GitHub ever sees), then issues a token to the third-party site. The site uses the token to access GitHub on your behalf.

2. **The `code` is a short-lived, single-use authorization code.** It is not an access token — it cannot be used to call the API. It exists so the actual token exchange can happen server-to-server (with the `client_secret`), keeping the secret off the browser. You cannot use it twice: the second attempt returns `bad_verification_code`.

3. **CSRF (Cross-Site Request Forgery).** Without `state`, an attacker can trick a logged-in user's browser into visiting a crafted OAuth callback URL. The attacker's OAuth code gets linked to the victim's account. The `state` parameter is a random value stored in the user's session — an attacker cannot predict or forge it, so their crafted URL will fail the state check.

4. **No.** Scopes are enforced by the resource server (GitHub's API). `public_repo` grants read/write access to public repositories only. Deleting a private repository requires the `delete_repo` scope and the `repo` scope. A token without those scopes gets a 403 or 404 regardless of what the account owner can do manually.
