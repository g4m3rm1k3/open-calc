# Lesson 15: CSRF

Today we study an attack that never reads your session cookie at all — doesn't need to,
doesn't want to, and would gain nothing from it. Our case study is a bank balance that
drops from $500 to $0 without the attacker ever touching a password, a cookie value, or
anything belonging to the victim except their browser's own, entirely normal behavior.

## What you will learn

You'll build a bank server with a real transfer endpoint, forge a request to it from a
simulated "malicious site" that never sees the victim's session cookie, and watch the
transfer succeed anyway — purely because the victim's browser was still logged in. Then
you'll add the standard defense and watch the identical forged request fail.

## What you need to know first

Lesson 14 (Sessions and Cookies) directly — today's attack is only possible because of
exactly how cookies work: attached automatically by the browser to every request to a
given site, regardless of which page's code triggered that request. If Step 1 of this
lesson surprises you, re-read Lesson 14's cookie-jar behavior before continuing.

---

## The problem

Lesson 14 established that a browser automatically attaches a site's cookie to every
request it makes to that site — that's the entire mechanism that keeps you logged in. It
did not say the request had to be *initiated* by that site's own page. If you're logged
into your bank in one tab, and a completely different, malicious website in another tab
causes your browser to submit a request to your bank — an auto-submitting hidden form, an
image tag pointed at a URL that performs an action, a background script issuing a
request — your browser will attach your bank's session cookie to that request exactly as
faithfully as if you'd clicked a legitimate button on your bank's own site. The malicious
site's code never needs to know your cookie's value. It only needs to know your bank's
URL and what request shape triggers the action it wants — and it can get your browser,
carrying your own valid credentials, to send it. This is **Cross-Site Request Forgery
(CSRF)**: forging a request that appears to come from you, using your own browser as the
unwitting delivery mechanism.

## The lab: a transfer endpoint, forged from another site

**Disposable host.** A `Bank` server with `/login`, `/balance`, and `/transfer`
endpoints, and a small `BrowserSession` helper that faithfully reproduces one specific real
browser behavior: it remembers a cookie per host and attaches it automatically to *every*
subsequent request to that host, no matter which piece of code in the program asked for
that request — exactly like an actual browser's cookie jar, which doesn't ask "which tab
wants this?" before attaching a stored cookie.

### Step 1 — the bank, with an unprotected transfer endpoint

```python
# bank_server.py (relevant excerpt)
def do_POST(self):
    if self.path == "/transfer":
        fields = parse_qs(self.rfile.read(int(self.headers.get("Content-Length", 0))).decode())
        amount = int(fields.get("amount", ["0"])[0])
        recipient = fields.get("to", [""])[0]

        session_token = get_session_token(self)
        username = sessions.get(session_token)
        if not username:
            self.send_response(401); self.end_headers(); return

        balances[username] -= amount
        self.send_response(200)
        self.end_headers()
        self.wfile.write(f"transferred ${amount} to {recipient}".encode())
```

**Walkthrough.** `/transfer` checks exactly one thing: is there a valid session cookie
attached to this request. If so, it trusts the request completely — deducts `amount` from
that session's user and reports success. This looks like a perfectly reasonable
authorization check, in Lesson 3's terms: it correctly verifies *who* is asking. What it
never asks is a second, different question: did the actual logged-in user *intend* to
make this specific request, right now — or did their browser simply attach valid
credentials to a request someone else engineered?

### Step 2 — a browser that behaves like a real one

```python
# browser_session.py
import http.client

class BrowserSession:
    def __init__(self):
        self.cookies_by_host = {}

    def get(self, host, port, path):
        connection = http.client.HTTPConnection(host, port)
        headers = {"Cookie": self.cookies_by_host[host]} if host in self.cookies_by_host else {}
        connection.request("GET", path, headers=headers)
        response = connection.getresponse()
        set_cookie = response.getheader("Set-Cookie")
        if set_cookie:
            self.cookies_by_host[host] = set_cookie.split(";")[0]
        body = response.read()
        connection.close()
        return body

    def post_form(self, host, port, path, form_fields):
        connection = http.client.HTTPConnection(host, port)
        body = "&".join(f"{key}={value}" for key, value in form_fields.items())
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        if host in self.cookies_by_host:
            headers["Cookie"] = self.cookies_by_host[host]
        connection.request("POST", path, body=body, headers=headers)
        result = connection.getresponse().read()
        connection.close()
        return result
```

**Walkthrough.** `BrowserSession` models exactly one real browser behavior and nothing
more: `cookies_by_host` remembers a cookie once received, and `get`/`post_form` both
attach it automatically to any future request to that same host — regardless of *what code
called `get` or `post_form`*. This is the crucial detail: nothing in this class asks "is
this request coming from the site's own page, or from somewhere else?" Real browsers work
the same way, for the same reason cookies are useful at all — the cookie's job is to
identify *you* to the *site*, not to police which of your open tabs is allowed to trigger
a request.

### Step 3 — the attack

```python
from browser_session import BrowserSession

browser = BrowserSession()

# The victim logs into the real bank, in one browser tab.
print("Login:", browser.get("127.0.0.1", 8090, "/login"))
print("Balance before attack:", browser.get("127.0.0.1", 8090, "/balance"))

# The victim, still logged in, opens evil.example in ANOTHER tab. Its page
# contains a hidden, auto-submitting form. This code never reads or refers
# to browser.cookies_by_host at all -- it doesn't need to. It only needs to
# know the bank's transfer endpoint and shape a request toward it.
print("\n--- victim visits evil.example, which auto-submits a hidden form ---\n")
forged_result = browser.post_form(
    "127.0.0.1", 8090, "/transfer", {"amount": "500", "to": "eve"}
)
print("Forged transfer result:", forged_result)
print("Balance after attack:", browser.get("127.0.0.1", 8090, "/balance"))
```

Run it:

```
Login: b'logged in. csrf_token=030a7e430663e66028e9aeb980baa628'
Balance before attack: b"ada's balance: $500"

--- victim visits evil.example, which auto-submits a hidden form ---

Forged transfer result: b'transferred $500 to eve'
Balance after attack: b"ada's balance: $0"
```

**Walkthrough.** The forged request, shaped by code standing in for `evil.example`'s
JavaScript, never once referenced Ada's session cookie value — it was written *before*
`browser.cookies_by_host` even contained one, and never reads that dictionary at all.
`post_form` attached the cookie automatically, because that's what a browser does for
every request to a host it holds a cookie for, and the bank's `/transfer` endpoint, seeing
a valid session, processed the request as fully authorized. The $500 transfer is real, the
recipient is one the victim never chose, and the victim's own valid login credentials —
not stolen, not guessed, not intercepted — are precisely what made the attack succeed.

**Security lens.** Compare this directly to Lesson 14's session hijacking: there, the
attacker needed to *obtain* the victim's cookie value first. Here, the attacker never
touches it. CSRF and session hijacking both abuse the same underlying mechanism — a
browser presenting a valid session — but attack it from opposite directions: hijacking
steals the credential and uses it directly; CSRF never possesses the credential at all,
and instead tricks the legitimate holder's own browser into using it on the attacker's
behalf.

### Step 4 — the fix: a token the attacker cannot supply

```python
# bank_server.py (relevant excerpt, REQUIRE_CSRF = True)
if REQUIRE_CSRF:
    expected = csrf_tokens.get(session_token)
    if submitted_csrf != expected:
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b"CSRF token missing or invalid - transfer refused")
        return
```

`/login`'s response now includes a second, separate random value — a **CSRF token** —
delivered only in the body of the `/login` response itself, not as a cookie, and not
attached automatically to anything:

```python
forged_result = browser.post_form(
    "127.0.0.1", 8090, "/transfer", {"amount": "500", "to": "eve"}  # no csrf_token field
)
```

Run it against the CSRF-protected server:

```
Login: b'logged in. csrf_token=043ba83d5df95f9ae6130069ca5bd4aa'
Balance before attack: b"ada's balance: $500"

--- evil.example attempts the same forged transfer, with no valid csrf_token ---

Forged transfer result: b'CSRF token missing or invalid - transfer refused'
Balance after attack attempt: b"ada's balance: $500"
```

**Walkthrough.** The server now requires two separate pieces of proof: the session cookie
(proving *who* is asking — auto-attached, exactly as before) and a CSRF token (proving the
request was *actually issued by the bank's own page*, which had to have read that token
out of a real response body to include it). The forged request still carries a perfectly
valid session cookie — the browser attached it exactly as before — but has no way to
supply the matching CSRF token, because `evil.example`'s script was never able to read it
in the first place: a browser's **same-origin policy** prevents JavaScript running on
`evil.example` from reading the *response body* of a request to `bank.example`, even
though it can still cause the browser to *send* one. That asymmetry — able to trigger a
request, unable to read its response — is exactly the gap a CSRF token is designed to
exploit against the attacker.

**CS lens.** This is the same "separate channel for the thing that must not be forgeable"
principle as every fix in Modules B and C: a session cookie alone conflates two facts —
"this request came from a valid session" and "this request was intended by that session's
owner" — into one signal an attacker's browser-borrowing trick can satisfy without any
real intent behind it. The CSRF token adds a second, independent signal that specifically
cannot be supplied by anyone who hasn't legitimately loaded the bank's own page.

**Security lens.** Lesson 14 named `SameSite=Strict` as a cookie flag that refuses to
attach a cookie to cross-site requests at all — which, if set on the session cookie in
this lesson, would have prevented Step 3's attack a different way: `post_form`'s request,
originating conceptually from a different site, simply wouldn't have received the cookie
in the first place, and `/transfer` would have seen no session at all. CSRF tokens and
`SameSite` cookies are complementary, commonly used together in real systems: `SameSite`
closes the door at the browser level, before the request even carries credentials; CSRF
tokens close it at the application level, catching cases (older browsers, specific
`SameSite=Lax` edge cases involving top-level navigation) the cookie flag alone doesn't
fully cover.

---

## Connect the pieces

This lesson depended entirely on Lesson 14's cookie-jar mechanism working exactly as
designed — CSRF isn't a flaw in cookies, it's a consequence of a *correctly functioning*
cookie being usable by any request to the right host, regardless of intent. The fix
follows the same shape as Lesson 4's parameterized queries and Lesson 6's `textContent`:
add a second, narrower channel (the CSRF token) that only a legitimate source can populate,
rather than trying to inspect or filter the untrustworthy one after the fact.

## What breaks without this

Nearly any state-changing action reachable by a simple `GET` request — "delete my
account," "change my email," "publish this post" — reachable via `<img src="...">` (a
mistake real, older applications actually made) is trivially forgeable: a malicious page
doesn't even need a hidden form, just an image tag whose `src` points at the vulnerable
URL, and the victim's browser fires the request the instant the page loads, invisibly,
requiring no interaction at all. This is precisely why meaningful state changes should
never be triggerable by a plain `GET` request in the first place, and why every one of
them needs the same defense demonstrated here.

## Recognition

```
Today: CSRF (Cross-Site Request Forgery)

Also recognized in: every web framework's built-in CSRF middleware (Django,
Rails, and similar frameworks generate and check this exact token automatically
on every state-changing form), the same-origin policy itself (the browser
security boundary CSRF tokens are specifically designed to exploit against the
attacker, by relying on what it prevents an attacker's page from reading), CORS
headers (a separate, related mechanism controlling which cross-origin requests
are permitted to have their *responses* read at all), "confused deputy" attacks
generally (CSRF is the canonical web example of a broader class: tricking a
trusted party into misusing its own legitimate authority on an attacker's
behalf), and clickjacking (a visually different attack that shares CSRF's goal of
using a victim's authenticated session against their intent, achieved by
disguising a real button under an invisible one instead of forging a request
directly).
```

## Definition of done

- [ ] You ran Step 3 and reproduced the successful forged transfer against the
      unprotected server
- [ ] You ran Step 4 and reproduced the rejected transfer against the CSRF-protected
      server
- [ ] You can explain, in one sentence, why the attacker's code in Step 3 never needed to
      read `browser.cookies_by_host`
- [ ] You can explain the difference between what CSRF steals (a browser's willingness to
      send a request) and what Lesson 14's session hijack steals (the credential itself)
- [ ] You can explain why `SameSite=Strict` and a CSRF token are complementary defenses
      rather than redundant ones
- [ ] `git add .` and `git commit -m "Lesson 15: CSRF -- forging a request without ever
      touching the victim's cookie"` in your `security-labs/` folder

**Next:** Lesson 16 — Broken Access Control (IDOR), where Module A's authentication/
authorization distinction, Module E's session mechanics, and a URL with a number in it
combine into the most commonly found serious vulnerability class in real-world web
application audits.
